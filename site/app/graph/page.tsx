import { Graph } from '@/components/Graph';
import { buildTitleIndex, loadArticles } from '@/lib/articles';

export const metadata = { title: 'Map | Hendrixpedia' };

export default function GraphPage() {
  const articles = loadArticles();
  const titleIndex = buildTitleIndex(articles);

  const nodes = articles.map(article => ({
    id: article.slug,
    title: article.title,
    section: article.section,
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
        <h1 className="page-title small">Map</h1>
        <p className="page-subtitle">Every node is a chapter. The colors show reader-facing sections, and the links reveal how the world holds together.</p>
      </header>
      <Graph nodes={nodes} links={links} />
    </section>
  );
}
