import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import {
  CATEGORY_NAMES,
  CATEGORY_ORDER,
  CATEGORY_COLORS,
  SECTION_CATEGORY_MAP,
  SECTION_DESCRIPTIONS,
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
  related: string[];
  tags: string[];
  body: string;
  file: string;
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

let cache: Article[] | null = null;

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
  'life-and-personal': 'life',
  'life-personal': 'life',
  life: 'life',
  'events-and-experiences': 'events',
  'events-experiences': 'events',
  events: 'events',
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
  if (type === 'person') return 'people';

  for (const key of SECTION_ORDER) {
    if (SECTION_CATEGORY_MAP[key].includes(category)) {
      return key;
    }
  }

  return 'identity';
}

function sortArticlesForSection(section: SectionKey, articles: Article[]): Article[] {
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

export function loadArticles(): Article[] {
  if (cache) return cache;

  const articles: Article[] = [];
  if (!fs.existsSync(ARTICLES_DIR)) {
    cache = [];
    return cache;
  }

  for (const cat of fs.readdirSync(ARTICLES_DIR)) {
    const catDir = path.join(ARTICLES_DIR, cat);
    if (!fs.statSync(catDir).isDirectory()) continue;

    for (const fileName of fs.readdirSync(catDir)) {
      if (!fileName.endsWith('.md')) continue;

      const file = path.join(catDir, fileName);
      const raw = fs.readFileSync(file, 'utf8');
      const stat = fs.statSync(file);
      const { data, content } = matter(raw);
      const stem = fileName.replace(/\.md$/, '');
      const slug = `${cat}/${stem}`;
      const category = (data.category as string) || cat;
      const type = (data.type as string) || 'concept';

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
        related: (data.related as string[]) || [],
        tags: (data.tags as string[]) || [],
        body: content,
        file,
      });
    }
  }

  articles.sort((a, b) => a.title.localeCompare(b.title));
  cache = articles;
  return cache;
}

export function loadArticle(slug: string): Article | null {
  return loadArticles().find(article => article.slug === slug) || null;
}

export function buildTitleIndex(articles: Article[]): Map<string, string> {
  const index = new Map<string, string>();

  for (const article of articles) {
    index.set(article.title.toLowerCase(), article.slug);
    const stem = article.slug.split('/').pop()!;
    index.set(stem.replace(/-/g, ' ').toLowerCase(), article.slug);
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
  const articles = loadArticles();
  const groups: Record<string, Article[]> = {};

  for (const article of articles) {
    (groups[article.category] ||= []).push(article);
  }

  return CATEGORY_ORDER
    .filter(key => groups[key]?.length)
    .map(key => ({ key, name: categoryName(key), articles: groups[key] }));
}

export function articlesBySection(): SectionGroup[] {
  const articles = loadArticles();
  const groups = new Map<SectionKey, Article[]>();

  for (const article of articles) {
    const items = groups.get(article.section) || [];
    items.push(article);
    groups.set(article.section, items);
  }

  return SECTION_ORDER
    .filter(key => (groups.get(key) || []).length)
    .map(key => ({
      key,
      name: sectionName(key),
      description: sectionDescription(key),
      articles: sortArticlesForSection(key, groups.get(key) || []),
    }));
}

export type ManifestEntry = Pick<Article, 'title' | 'slug' | 'category' | 'section' | 'type' | 'updatedAt' | 'related' | 'tags'>;

export function getManifest(): {
  articles: ManifestEntry[];
  categories: Array<{ key: string; name: string }>;
  sections: Array<{ key: SectionKey; name: string }>;
} {
  const articles = loadArticles().map(({ body, file, ...rest }) => rest);
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
