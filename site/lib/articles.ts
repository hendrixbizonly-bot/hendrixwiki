import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import {
  CATEGORY_NAMES,
  CATEGORY_ORDER,
  CATEGORY_COLORS,
  type CuratedSectionEntry,
  SECTION_CATEGORY_MAP,
  SECTION_DESCRIPTIONS,
  SECTION_CURATED_SLUGS,
  SECTION_NAMES,
  SECTION_ORDER,
  SECTION_PRIORITY_SLUGS,
  type SectionKey,
} from './constants';

export {
  CATEGORY_NAMES,
  CATEGORY_ORDER,
  CATEGORY_COLORS,
  SECTION_DESCRIPTIONS,
  SECTION_CURATED_SLUGS,
  SECTION_NAMES,
  SECTION_ORDER,
  SECTION_PRIORITY_SLUGS,
} from './constants';

export type Article = {
  title: string;
  slug: string;
  category: string;
  section: SectionKey;
  type: string;
  updatedAt: string;
  aliases: string[];
  related: string[];
  tags: string[];
  body: string;
  file: string;
  redirectTo: string | null;
  hidden: boolean;
};

export type SectionGroup = {
  key: SectionKey;
  name: string;
  description: string;
  articles: Article[];
};

export type TocItem = {
  id: string;
  title: string;
  level: number;
};

const WIKI_ROOT = path.resolve(process.cwd(), '..', 'wiki');
const RAW_ROOT = path.resolve(process.cwd(), '..', 'Raw');
export const ARTICLES_DIR = path.join(WIKI_ROOT, 'articles');

type ArticleCache = {
  signature: string;
  articles: Article[];
};

type ArticleFileEntry = {
  categoryDir: string;
  file: string;
  stat: fs.Stats;
};

let cache: ArticleCache | null = null;

const SECTION_ALIASES: Record<string, SectionKey> = {
  navigation: 'navigation',
  identity: 'identity',
  people: 'people',
  'ventures-and-projects': 'ventures',
  'ventures-projects': 'ventures',
  'ventures-project': 'ventures',
  ventures: 'ventures',
  'concepts-and-philosophy': 'concepts',
  'concepts-philosophy': 'concepts',
  concepts: 'concepts',
  philosophy: 'concepts',
  'skills-and-tools': 'skills',
  'skills-tools': 'skills',
  skills: 'skills',
  media: 'media',
  books: 'books',
  music: 'music',
  event: 'events',
  events: 'events',
  'event-and-experience': 'events',
  'events-and-experiences': 'events',
  'life-and-personal': 'life',
  'life-personal': 'life',
  life: 'life',
  'events-experiences': 'events',
  timeline: 'timeline',
  curiosity: 'curiosity',
};

function normalizeSection(section?: string): SectionKey | null {
  if (!section) return null;

  const cleaned = section.trim().toLowerCase();
  if ((SECTION_ORDER as readonly string[]).includes(cleaned)) {
    return cleaned as SectionKey;
  }

  const slug = cleaned.replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return SECTION_ALIASES[slug] || null;
}

function inferSection({
  category,
  type,
  slug,
  section,
}: {
  category: string;
  type: string;
  slug: string;
  section?: string;
}): SectionKey {
  const explicit = normalizeSection(section);
  if (explicit) return explicit;

  if (slug === 'meta/timeline') return 'timeline';
  if (slug === 'meta/formative-experiences') return 'events';

  for (const key of SECTION_ORDER) {
    if (SECTION_CATEGORY_MAP[key].includes(category)) {
      return key;
    }
  }

  return 'identity';
}

function sortArticlesForSection(section: SectionKey, articles: Article[]): Article[] {
  if (section === 'people') {
    return [...articles].sort((a, b) => a.title.localeCompare(b.title));
  }

  const priorities = SECTION_PRIORITY_SLUGS[section] || [];
  const priorityIndex = new Map(priorities.map((slug, index) => [slug, index]));

  return [...articles].sort((a, b) => {
    const aIndex = priorityIndex.get(a.slug) ?? Number.POSITIVE_INFINITY;
    const bIndex = priorityIndex.get(b.slug) ?? Number.POSITIVE_INFINITY;

    if (aIndex !== bIndex) {
      return aIndex - bIndex;
    }

    return a.title.localeCompare(b.title);
  });
}

export function sectionName(section: string): string {
  return SECTION_NAMES[section as SectionKey] || section;
}

export function sectionDescription(section: string): string {
  return SECTION_DESCRIPTIONS[section as SectionKey] || '';
}

export function categoryName(category: string): string {
  return CATEGORY_NAMES[category] || category;
}

function collectArticleFiles(): { entries: ArticleFileEntry[]; signature: string } {
  if (!fs.existsSync(ARTICLES_DIR)) {
    return { entries: [], signature: '' };
  }

  const entries: ArticleFileEntry[] = [];

  for (const categoryDir of fs.readdirSync(ARTICLES_DIR).sort()) {
    const catDir = path.join(ARTICLES_DIR, categoryDir);
    if (!fs.statSync(catDir).isDirectory()) continue;

    for (const fileName of fs.readdirSync(catDir).sort()) {
      if (!fileName.endsWith('.md')) continue;

      const file = path.join(catDir, fileName);
      entries.push({
        categoryDir,
        file,
        stat: fs.statSync(file),
      });
    }
  }

  const signature = entries
    .map(({ file, stat }) => {
      const relative = path.relative(ARTICLES_DIR, file).replace(/\\/g, '/');
      return `${relative}:${stat.size}:${stat.mtimeMs}`;
    })
    .join('|');

  return { entries, signature };
}

export function loadArticles(): Article[] {
  const { entries, signature } = collectArticleFiles();
  if (cache?.signature === signature) return cache.articles;

  const articles: Article[] = [];
  if (!entries.length) {
    cache = { signature, articles };
    return articles;
  }

  for (const { categoryDir, file, stat } of entries) {
    const raw = fs.readFileSync(file, 'utf8');
    const { data, content } = matter(raw);
    const stem = path.basename(file).replace(/\.md$/, '');
    const slug = `${categoryDir}/${stem}`;
    const category = (data.category as string) || categoryDir;
    const type = (data.type as string) || 'concept';
    const normalizeList = (value: unknown): string[] => {
      if (Array.isArray(value)) {
        return value
          .map(item => String(item).trim())
          .filter(Boolean);
      }

      if (typeof value === 'string' && value.trim()) {
        return [value.trim()];
      }

      return [];
    };

    articles.push({
      title: (data.title as string) || stem.replace(/-/g, ' '),
      slug,
      category,
      section: inferSection({
        category,
        type,
        slug,
        section: data.section as string | undefined,
      }),
      type,
      updatedAt: stat.mtime.toISOString().slice(0, 10),
      aliases: normalizeList(data.aliases),
      related: normalizeList(data.related),
      tags: normalizeList(data.tags),
      body: content,
      file,
      redirectTo:
        typeof data.redirectTo === 'string' && data.redirectTo.trim()
          ? data.redirectTo.trim()
          : null,
      hidden: Boolean(data.hidden),
    });
  }

  articles.sort((a, b) => a.title.localeCompare(b.title));
  cache = { signature, articles };
  return articles;
}

export function loadArticle(slug: string): Article | null {
  return loadArticles().find(article => article.slug === slug) || null;
}

export function displayTitle(article: Pick<Article, 'title' | 'body'>): string {
  const heading = article.body.match(/^#\s+(.+)$/m)?.[1]?.trim();
  return heading || article.title;
}

function normalizeLookup(value: unknown): string {
  return String(value).trim().toLowerCase();
}

function stemFromSlug(slug: string): string {
  return slug.split('/').pop() ?? slug;
}

function canonicalSlugFor(
  slug: string,
  articleIndex: Map<string, Article>,
  seen = new Set<string>()
): string {
  if (seen.has(slug)) return slug;

  const article = articleIndex.get(slug);
  if (!article?.redirectTo || !articleIndex.has(article.redirectTo)) {
    return slug;
  }

  seen.add(slug);
  return canonicalSlugFor(article.redirectTo, articleIndex, seen);
}

export function visibleArticles(articles: Article[] = loadArticles()): Article[] {
  return articles.filter(article => !article.hidden && !article.redirectTo);
}

export function buildTitleIndex(articles: Article[]): Map<string, string> {
  const index = new Map<string, string>();
  const articleIndex = new Map(articles.map(article => [article.slug, article]));

  for (const article of articles) {
    const canonicalSlug = canonicalSlugFor(article.slug, articleIndex);
    const names = new Set<string>([
      article.title,
      ...article.aliases,
      stemFromSlug(article.slug),
      stemFromSlug(article.slug).replace(/-/g, ' '),
      article.slug,
    ]);

    for (const name of names) {
      const normalized = normalizeLookup(name);
      if (!normalized) continue;
      index.set(normalized, canonicalSlug);
    }
  }

  return index;
}

export function resolveWikiLinks(md: string, articles: Article[]): string {
  const titleIndex = buildTitleIndex(articles);

  return md.replace(/\[\[([^\]]+)\]\]/g, (_, inner: string) => {
    const [target, display] = inner.split('|').map(part => part.trim());
    const label = display || target;
    const slug = titleIndex.get(target.toLowerCase());

    if (slug) {
      return `<a href="/a/${slug}" class="wikilink">${label}</a>`;
    }

    return `<span class="wikilink missing" title="Article not yet written">${label}</span>`;
  });
}

function arrangeArticlesForSection(
  section: SectionKey,
  sectionArticles: Article[],
  allArticles: Article[]
): Article[] {
  const curated = SECTION_CURATED_SLUGS[section];
  if (!curated?.length) {
    return sortArticlesForSection(section, sectionArticles);
  }

  const articleBySlug = new Map(allArticles.map(article => [article.slug, article]));

  return curated.flatMap(entry => {
    const spec: Extract<CuratedSectionEntry, { slug: string }> =
      typeof entry === 'string' ? { slug: entry } : entry;
    const article = articleBySlug.get(spec.slug);
    return article ? [{ ...article, title: spec.title || article.title }] : [];
  });
}

export function extractWikiLinkTargets(md: string): string[] {
  const targets: string[] = [];

  for (const match of md.matchAll(/\[\[([^\]]+)\]\]/g)) {
    const inner = match[1]?.trim();
    if (!inner) continue;

    const [target] = inner.split('|').map(part => part.trim());
    if (target) {
      targets.push(target);
    }
  }

  return targets;
}

export function getRelatedArticles(article: Article, articles: Article[] = loadArticles()): Article[] {
  const titleIndex = buildTitleIndex(articles);
  const articleIndex = new Map(articles.map(item => [item.slug, item]));
  const visibleIndex = new Map(visibleArticles(articles).map(item => [item.slug, item]));
  const seen = new Set<string>();
  const currentSlug = canonicalSlugFor(article.slug, articleIndex);

  return article.related.flatMap(target => {
    const cleaned = target.trim();
    const slug = articleIndex.has(cleaned)
      ? canonicalSlugFor(cleaned, articleIndex)
      : titleIndex.get(normalizeLookup(cleaned));

    if (!slug || slug === currentSlug || seen.has(slug)) {
      return [];
    }

    const relatedArticle = visibleIndex.get(slug);
    if (!relatedArticle) {
      return [];
    }

    seen.add(slug);
    return [relatedArticle];
  });
}

function stripInlineMarkdown(text: string): string {
  return text
    .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, a, b) => b || a)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/<[^>]+>/g, '')
    .trim();
}

function slugifyHeading(text: string): string {
  return stripInlineMarkdown(text)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'section';
}

function nextUniqueId(base: string, seen: Map<string, number>): string {
  const count = seen.get(base) || 0;
  seen.set(base, count + 1);
  return count === 0 ? base : `${base}-${count + 1}`;
}

function isBlockLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;

  return (
    trimmed.startsWith('#') ||
    trimmed.startsWith('>') ||
    trimmed.startsWith('|') ||
    trimmed.startsWith('<') ||
    /^[-*_]{3,}$/.test(trimmed) ||
    /^[-*+]\s/.test(trimmed) ||
    /^\d+\.\s/.test(trimmed)
  );
}

function wordCount(text: string): number {
  return stripInlineMarkdown(text).split(/\s+/).filter(Boolean).length;
}

type EmphasisCandidate = {
  start: number;
  end: number;
  normalized: string;
  priority: number;
};

const EMPHASIS_STOPWORDS = new Set([
  'a',
  'an',
  'and',
  'as',
  'at',
  'but',
  'by',
  'for',
  'from',
  'i',
  'if',
  'in',
  'it',
  'its',
  'my',
  'of',
  'on',
  'or',
  'so',
  'that',
  'the',
  'their',
  'there',
  'these',
  'this',
  'those',
  'to',
  'we',
  'what',
  'why',
  'you',
]);

function cleanEmphasisText(text: string): string {
  return stripInlineMarkdown(text).replace(/^[("'“”‘’]+|[)"'“”‘’.,;:!?]+$/g, '').trim();
}

function normalizeEmphasis(text: string): string {
  return cleanEmphasisText(text).toLowerCase();
}

function isEligibleEmphasis(text: string): boolean {
  const cleaned = cleanEmphasisText(text);
  if (!cleaned) return false;

  const words = cleaned.split(/\s+/).filter(Boolean);
  if (!words.length || words.length > 5) return false;

  if (words.length === 1) {
    const token = words[0].toLowerCase();
    const raw = words[0];
    if (EMPHASIS_STOPWORDS.has(token) && !/^[A-Z0-9]{2,}$/.test(raw)) return false;
  }

  return true;
}

function pushCandidate(
  candidates: EmphasisCandidate[],
  paragraph: string,
  start: number,
  end: number,
  priority: number
) {
  const raw = paragraph.slice(start, end);
  const normalized = normalizeEmphasis(raw);
  if (!normalized || !isEligibleEmphasis(raw)) return;
  candidates.push({ start, end, normalized, priority });
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function subjectVariants(title: string): string[] {
  const variants = new Set<string>([title]);
  const shortened = [
    title.replace(/^Being an?\s+/i, ''),
    title.replace(/^(The|A|An)\s+/i, ''),
  ];

  for (const variant of shortened) {
    const cleaned = variant.trim();
    if (cleaned && cleaned !== title) variants.add(cleaned);
  }

  return [...variants].filter(variant => wordCount(variant) <= 5);
}

function addSubjectCandidates(
  candidates: EmphasisCandidate[],
  paragraph: string,
  article: Article
) {
  for (const variant of subjectVariants(article.title)) {
    const match = new RegExp(`\\b${escapeRegExp(variant)}\\b`, 'i').exec(paragraph);
    if (!match || match.index == null) continue;
    pushCandidate(candidates, paragraph, match.index, match.index + match[0].length, 100);
    break;
  }

  const definitionalMatch = /^(?:"([^"\n]{2,40})"|([A-Za-z][A-Za-z0-9'/-]*(?:\s+[A-Za-z][A-Za-z0-9'/-]*){0,4}))\s+(?:is|was|became|means|matters|fits|remains|exists|feels|looks)\b/.exec(paragraph);
  if (definitionalMatch) {
    const phrase = definitionalMatch[1] ?? definitionalMatch[2];
    if (phrase) {
      const start = definitionalMatch.index + definitionalMatch[0].indexOf(phrase);
      pushCandidate(candidates, paragraph, start, start + phrase.length, 88);
    }
  }
}

function addLinkCandidates(candidates: EmphasisCandidate[], paragraph: string) {
  for (const match of paragraph.matchAll(/\[\[([^\]]+)\]\]/g)) {
    if (match.index == null) continue;
    pushCandidate(candidates, paragraph, match.index, match.index + match[0].length, 82);
  }
}

function addQuotedCandidates(candidates: EmphasisCandidate[], paragraph: string) {
  for (const match of paragraph.matchAll(/"([^"\n]{2,40})"/g)) {
    if (match.index == null) continue;
    const phrase = match[1];
    const start = match.index + match[0].indexOf(phrase);
    pushCandidate(candidates, paragraph, start, start + phrase.length, 76);
  }
}

function addNumberCandidates(candidates: EmphasisCandidate[], paragraph: string) {
  const monthDatePattern = /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:,\s+\d{4})?\b/g;
  const numberPattern = /\b\d+(?:\.\d+)?(?:\s?(?:%|percent|years?|months?|days?|weeks?|km|k|m|b))?\b/gi;
  const acronymPattern = /\b[A-Z]{2,8}(?:\/[A-Z]{2,8})?\b/g;

  for (const match of paragraph.matchAll(monthDatePattern)) {
    if (match.index == null) continue;
    pushCandidate(candidates, paragraph, match.index, match.index + match[0].length, 72);
  }

  for (const match of paragraph.matchAll(numberPattern)) {
    if (match.index == null) continue;
    pushCandidate(candidates, paragraph, match.index, match.index + match[0].length, 68);
  }

  for (const match of paragraph.matchAll(acronymPattern)) {
    if (match.index == null) continue;
    pushCandidate(candidates, paragraph, match.index, match.index + match[0].length, 66);
  }
}

function rangesOverlap(a: EmphasisCandidate, b: EmphasisCandidate): boolean {
  return a.start < b.end && b.start < a.end;
}

function editorialEmphasis(text: string, article: Article, seen: Set<string>): string {
  if (!text.trim() || text.includes('**')) return text;

  const candidates: EmphasisCandidate[] = [];
  addSubjectCandidates(candidates, text, article);
  addLinkCandidates(candidates, text);
  addQuotedCandidates(candidates, text);
  addNumberCandidates(candidates, text);

  const selected: EmphasisCandidate[] = [];

  for (const candidate of candidates.sort((a, b) => b.priority - a.priority || a.start - b.start)) {
    if (seen.has(candidate.normalized)) continue;
    if (selected.some(item => item.normalized === candidate.normalized || rangesOverlap(item, candidate))) continue;
    selected.push(candidate);
    if (selected.length === 2) break;
  }

  if (!selected.length) return text;

  for (const item of selected) {
    seen.add(item.normalized);
  }

  return selected
    .sort((a, b) => b.start - a.start)
    .reduce((result, item) => `${result.slice(0, item.start)}**${result.slice(item.start, item.end)}**${result.slice(item.end)}`, text);
}

function emphasizeMarkdownParagraphs(md: string, article: Article): string {
  if (article.section === 'people') {
    return md;
  }

  const lines = md.split('\n');
  const output: string[] = [];
  let paragraph: string[] = [];
  let inCodeFence = false;
  const seen = new Set<string>();

  const flushParagraph = () => {
    if (!paragraph.length) return;
    output.push(editorialEmphasis(paragraph.join('\n'), article, seen));
    paragraph = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      flushParagraph();
      inCodeFence = !inCodeFence;
      output.push(line);
      continue;
    }

    if (inCodeFence) {
      output.push(line);
      continue;
    }

    if (!trimmed) {
      flushParagraph();
      output.push(line);
      continue;
    }

    if (isBlockLine(line)) {
      flushParagraph();
      output.push(line);
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph();
  return output.join('\n');
}

export function getArticleToc(body: string): TocItem[] {
  const lines = body.split('\n');
  const headingMatches = lines
    .map(line => line.match(/^(##|###)\s+(.+)$/))
    .filter((match): match is RegExpMatchArray => match !== null);

  const firstHeadingIndex = lines.findIndex(line => /^(##|###)\s+/.test(line));
  const introLines =
    firstHeadingIndex === -1 ? lines : lines.slice(0, firstHeadingIndex);
  const hasIntro = introLines.some(line => line.trim() && !line.trim().startsWith('#'));
  const firstHeadingTitle = headingMatches[0]?.[2] ? stripInlineMarkdown(headingMatches[0][2]).toLowerCase() : '';

  const toc: TocItem[] = [];
  const seenIds = new Map<string, number>();
  seenIds.set('overview', 1);

  if (hasIntro || headingMatches.length === 0) {
    toc.push({ id: 'overview', title: firstHeadingTitle === 'overview' ? 'Top' : 'Overview', level: 2 });
  }

  for (const [, hashes, rawTitle] of headingMatches) {
    const title = stripInlineMarkdown(rawTitle);
    const id = nextUniqueId(slugifyHeading(title), seenIds);
    toc.push({ id, title, level: hashes.length });
  }

  return toc;
}

function addHeadingIds(html: string, toc: TocItem[]): string {
  const headingItems = toc.filter(item => item.id !== 'overview' && item.title !== 'Top');
  let index = 0;

  return html.replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (match, level, content) => {
    const item = headingItems[index];
    index += 1;

    if (!item) return match;
    return `<h${level} id="${item.id}">${content}</h${level}>`;
  });
}

export function renderArticle(article: Article, articles: Article[]): string {
  const toc = getArticleToc(article.body);
  const emphasizedBody = emphasizeMarkdownParagraphs(article.body, article);
  const withLinks = resolveWikiLinks(emphasizedBody, articles);
  const html = marked.parse(withLinks) as string;
  return addHeadingIds(html, toc);
}

export function articlesByCategory(): Array<{ key: string; name: string; articles: Article[] }> {
  const articles = visibleArticles(loadArticles());
  const groups: Record<string, Article[]> = {};

  for (const article of articles) {
    (groups[article.category] ||= []).push(article);
  }

  return CATEGORY_ORDER
    .filter(key => groups[key]?.length)
    .map(key => ({ key, name: categoryName(key), articles: groups[key] }));
}

export function articlesBySection(): SectionGroup[] {
  const articles = visibleArticles(loadArticles());
  const groups = new Map<SectionKey, Article[]>();

  for (const article of articles) {
    const items = groups.get(article.section) || [];
    items.push(article);
    groups.set(article.section, items);
  }

  return SECTION_ORDER
    .map(key => ({
      key,
      name: sectionName(key),
      description: sectionDescription(key),
      articles: arrangeArticlesForSection(key, groups.get(key) || [], articles),
    }))
    .filter(section => section.articles.length);
}

export type ManifestEntry = Pick<Article, 'title' | 'slug' | 'category' | 'section' | 'type' | 'updatedAt' | 'aliases' | 'related' | 'tags'>;

export function getManifest(): {
  articles: ManifestEntry[];
  categories: Array<{ key: string; name: string }>;
  sections: Array<{ key: SectionKey; name: string }>;
} {
  const articles = visibleArticles(loadArticles()).map(({ body, file, redirectTo, hidden, ...rest }) => rest);
  const categories = CATEGORY_ORDER
    .filter(key => articles.some(article => article.category === key))
    .map(key => ({ key, name: categoryName(key) }));
  const sections = SECTION_ORDER
    .filter(key => articles.some(article => article.section === key))
    .map(key => ({ key, name: sectionName(key) }));

  return { articles, categories, sections };
}

export function readRaw(): string {
  const file = path.join(RAW_ROOT, 'context.md');
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
}

export function readSchema(): string {
  const file = path.join(WIKI_ROOT, 'SCHEMA.md');
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
}

export function readMasterIndex(): string {
  const file = path.join(WIKI_ROOT, 'index.md');
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
}

export function leadSentence(body: string, maxLen = 280): string {
  const lines = body.split('\n');
  const paragraphs: string[] = [];
  let buffer: string[] = [];

  for (const line of lines) {
    if (line.startsWith('#')) {
      if (buffer.length) {
        paragraphs.push(buffer.join(' ').trim());
        buffer = [];
      }
      continue;
    }

    if (line.trim() === '') {
      if (buffer.length) {
        paragraphs.push(buffer.join(' ').trim());
        buffer = [];
      }
      continue;
    }

    buffer.push(line.trim());
  }

  if (buffer.length) {
    paragraphs.push(buffer.join(' ').trim());
  }

  let paragraph = paragraphs.find(text => text.length > 30) || '';
  paragraph = paragraph.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, a, b) => b || a);
  paragraph = paragraph.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1');

  if (paragraph.length > maxLen) {
    paragraph = `${paragraph.slice(0, maxLen).replace(/\s+\S*$/, '')}...`;
  }

  return paragraph;
}

export function shortSummary(body: string, maxWords = 10): string {
  const source = leadSentence(body, 160);
  if (!source) return '';

  const firstSentence = source.match(/.+?[.!?](?=\s|$)/)?.[0] ?? source;
  const words = firstSentence.trim().split(/\s+/).filter(Boolean);

  if (words.length <= maxWords) {
    return firstSentence.trim();
  }

  return words
    .slice(0, maxWords)
    .join(' ')
    .replace(/[.,;:!?-]+$/g, '');
}
