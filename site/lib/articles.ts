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

export function renderArticle(article: Article, articles: Article[]): string {
  const withLinks = resolveWikiLinks(article.body, articles);
  return marked.parse(withLinks) as string;
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
