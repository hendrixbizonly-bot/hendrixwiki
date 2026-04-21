import { Graph } from '@/components/Graph';
import { buildTitleIndex, loadArticles } from '@/lib/articles';

export const metadata = { title: 'Graph - Hendrix Wiki' };

export default function GraphPage() {
  const articles = loadArticles();
  const titleIndex = buildTitleIndex(articles);

  const nodes = articles.map(article => ({
    id: article.slug,
    title: article.title,
    category: article.category,
  }));

  const seen = new Set<string>();
  const links: Array<{ source: string; target: string }> = [];

  for (const article of articles) {
    for (const rel of article.related) {
      const slug = titleIndex.get(rel.toLowerCase());
      if (!slug || slug === article.slug) continue;

      const key = [article.slug, slug].sort().join('|');
      if (seen.has(key)) continue;

      seen.add(key);
      links.push({ source: article.slug, target: slug });
    }
  }

  return (
    <section>
      <header className="page-header secondary">
        <h1 className="page-title small">Graph</h1>
        <p className="page-subtitle">Every node is an article. Every edge is a wiki link. Click a node to open it.</p>
      </header>
      <Graph nodes={nodes} links={links} />
    </section>
  );
}
