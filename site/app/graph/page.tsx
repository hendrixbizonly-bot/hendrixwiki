import { Graph } from '@/components/Graph';
import { buildTitleIndex, extractWikiLinkTargets, loadArticles, visibleArticles } from '@/lib/articles';

export const metadata = { title: 'Map | Hendrixpedia' };

export default function GraphPage() {
  const allArticles = loadArticles();
  const articles = visibleArticles(allArticles);
  const titleIndex = buildTitleIndex(allArticles);

  const nodes = articles.map(article => ({
    id: article.slug,
    title: article.title,
    section: article.section,
    href: `/a/${article.slug.split('/').map(encodeURIComponent).join('/')}`,
  }));

  const seen = new Set<string>();
  const links: Array<{ source: string; target: string }> = [];

  for (const article of articles) {
    const connections = new Set<string>([
      ...article.related,
      ...extractWikiLinkTargets(article.body),
    ]);

    for (const rel of connections) {
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
        <h1 className="page-title small">Map</h1>
        <p className="page-subtitle">Every node is a chapter. Hover a node to trace its links in blue, drag any node to reposition it, use the zoom controls or trackpad scroll to move in and out, double-click a pinned node to release it, and click a node to open the full wiki page.</p>
      </header>
      <Graph nodes={nodes} links={links} />
    </section>
  );
}
