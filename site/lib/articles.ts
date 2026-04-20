import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { CATEGORY_NAMES, CATEGORY_ORDER } from './constants';

export { CATEGORY_NAMES, CATEGORY_ORDER, CATEGORY_COLORS } from './constants';

export type Article = {
  title: string;
  slug: string;           // e.g. "ventures/duodode"
  category: string;       // e.g. "ventures"
  type: string;           // "person" | "concept" | etc.
  related: string[];
  tags: string[];
  body: string;           // raw markdown (post-frontmatter)
  file: string;           // absolute path
};

// The wiki lives one level above /site at /wiki
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
    for (const f of fs.readdirSync(catDir)) {
      if (!f.endsWith('.md')) continue;
      const file = path.join(catDir, f);
      const raw = fs.readFileSync(file, 'utf8');
      const { data, content } = matter(raw);
      const stem = f.replace(/\.md$/, '');
      articles.push({
        title: (data.title as string) || stem.replace(/-/g, ' '),
        slug: `${cat}/${stem}`,
        category: (data.category as string) || cat,
        type: (data.type as string) || 'concept',
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
  return loadArticles().find(a => a.slug === slug) || null;
}

// Resolve a wiki link target (title or alias) to a slug
export function buildTitleIndex(articles: Article[]): Map<string, string> {
  const idx = new Map<string, string>();
  for (const a of articles) {
    idx.set(a.title.toLowerCase(), a.slug);
    // Allow alternate forms: kebab-case matching file stem
    const stem = a.slug.split('/').pop()!;
    idx.set(stem.replace(/-/g, ' '), a.slug);
  }
  return idx;
}

export function resolveWikiLinks(md: string, articles: Article[]): string {
  const titleIndex = buildTitleIndex(articles);
  return md.replace(/\[\[([^\]]+)\]\]/g, (_, inner: string) => {
    const [target, display] = inner.split('|').map(s => s.trim());
    const disp = display || target;
    const slug = titleIndex.get(target.toLowerCase());
    if (slug) return `<a href="/a/${slug}" class="wikilink">${disp}</a>`;
    return `<span class="wikilink missing" title="Article not yet written">${disp}</span>`;
  });
}

export function renderArticle(article: Article, articles: Article[]): string {
  const withLinks = resolveWikiLinks(article.body, articles);
  return marked.parse(withLinks) as string;
}

export function articlesByCategory(): Array<{ key: string; name: string; articles: Article[] }> {
  const articles = loadArticles();
  const groups: Record<string, Article[]> = {};
  for (const a of articles) {
    (groups[a.category] ||= []).push(a);
  }
  return CATEGORY_ORDER
    .filter(k => groups[k]?.length)
    .map(k => ({ key: k, name: CATEGORY_NAMES[k] || k, articles: groups[k] }));
}

export type ManifestEntry = Pick<Article, 'title' | 'slug' | 'category' | 'type' | 'related' | 'tags'>;

export function getManifest(): { articles: ManifestEntry[]; categories: Array<{ key: string; name: string }> } {
  const articles = loadArticles().map(({ body, file, ...rest }) => rest);
  const categories = CATEGORY_ORDER
    .filter(k => articles.some(a => a.category === k))
    .map(k => ({ key: k, name: CATEGORY_NAMES[k] || k }));
  return { articles, categories };
}

export function readRaw(): string {
  const p = path.join(RAW_ROOT, 'context.md');
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
}

export function readSchema(): string {
  const p = path.join(WIKI_ROOT, 'SCHEMA.md');
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
}

export function readMasterIndex(): string {
  const p = path.join(WIKI_ROOT, 'index.md');
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
}

// First real paragraph after H1, stripped of wiki brackets — for previews
export function leadSentence(body: string, maxLen = 280): string {
  const lines = body.split('\n');
  const paras: string[] = [];
  let buf: string[] = [];
  for (const line of lines) {
    if (line.startsWith('#')) {
      if (buf.length) { paras.push(buf.join(' ').trim()); buf = []; }
      continue;
    }
    if (line.trim() === '') {
      if (buf.length) { paras.push(buf.join(' ').trim()); buf = []; }
    } else {
      buf.push(line.trim());
    }
  }
  if (buf.length) paras.push(buf.join(' ').trim());
  let p = paras.find(x => x.length > 30) || '';
  p = p.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, a, b) => b || a);
  p = p.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1');
  if (p.length > maxLen) p = p.slice(0, maxLen).replace(/\s+\S*$/, '') + '...';
  return p;
}
