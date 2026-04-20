import { Graph } from '@/components/Graph';
import { buildTitleIndex, loadArticles } from '@/lib/articles';

export const metadata = { title: 'Graph — Hendrixpedia' };

export default function GraphPage() {
  const articles = loadArticles();
  const titleIndex = buildTitleIndex(articles);

  const nodes = articles.map(a => ({
    id: a.slug,
    title: a.title,
    category: a.category,
  }));

  const seen = new Set<string>();
  const links: Array<{ source: string; target: string }> = [];
  for (const a of articles) {
    for (const rel of a.related) {
      const slug = titleIndex.get(rel.toLowerCase());
      if (!slug || slug === a.slug) continue;
      const key = [a.slug, slug].sort().join('|');
      if (seen.has(key)) continue;
      seen.add(key);
      links.push({ source: a.slug, target: slug });
    }
  }

  return (
    <>
      <div className="graph-head">
        <h2>Graph view</h2>
        <p className="muted">Every node is an article. Every edge is a wiki link. Click a node to open it.</p>
      </div>
      <Graph nodes={nodes} links={links} />
    </>
  );
}
