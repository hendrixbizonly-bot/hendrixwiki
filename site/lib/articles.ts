import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { CATEGORY_NAMES, CATEGORY_ORDER } from './constants';

export { CATEGORY_NAMES, CATEGORY_ORDER, CATEGORY_COLORS } from './constants';

export type Article = {
  title: string;
  slug: string;
  category: string;
  type: string;
  updatedAt: string;
  related: string[];
  tags: string[];
  body: string;
  file: string;
};

const WIKI_ROOT = path.resolve(process.cwd(), '..', 'wiki');
const RAW_ROOT = path.resolve(process.cwd(), '..', 'Raw');

export const ARTICLES_DIR = path.join(WIKI_ROOT, 'articles');

let cache: Article[] | null = null;

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

      articles.push({
        title: (data.title as string) || stem.replace(/-/g, ' '),
        slug: `${cat}/${stem}`,
        category: (data.category as string) || cat,
        type: (data.type as string) || 'concept',
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
    index.set(stem.replace(/-/g, ' '), article.slug);
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
    .map(key => ({ key, name: CATEGORY_NAMES[key] || key, articles: groups[key] }));
}

export type ManifestEntry = Pick<Article, 'title' | 'slug' | 'category' | 'type' | 'updatedAt' | 'related' | 'tags'>;

export function getManifest(): { articles: ManifestEntry[]; categories: Array<{ key: string; name: string }> } {
  const articles = loadArticles().map(({ body, file, ...rest }) => rest);
  const categories = CATEGORY_ORDER
    .filter(key => articles.some(article => article.category === key))
    .map(key => ({ key, name: CATEGORY_NAMES[key] || key }));

  return { articles, categories };
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
    paragraph = paragraph.slice(0, maxLen).replace(/\s+\S*$/, '') + '...';
  }

  return paragraph;
}
