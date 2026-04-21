import Link from 'next/link';
import { articlesByCategory } from '@/lib/articles';

export function Sidebar() {
  const groups = articlesByCategory();

  return (
    <aside className="sidebar">
      <div className="side-brand">
        <div className="side-logo" aria-hidden="true">
          H
        </div>
        <h2 className="side-brand-title">Hendrix Wiki</h2>
        <p className="side-brand-subtitle">The Personal Encyclopedia</p>
      </div>

      <div className="side-panel">
        <div className="side-section">
          <div className="side-title">Navigation</div>
          <ul>
            <li><Link href="/">Main page</Link></li>
            <li><Link href="/a/core/hendrix">About Hendrix</Link></li>
            <li><Link href="/search">Search</Link></li>
            <li><Link href="/graph">Graph</Link></li>
            <li><Link href="/random">Random article</Link></li>
            <li><Link href="/raw">Raw context</Link></li>
          </ul>
        </div>

        {groups.map(group => (
          <div className="side-section" key={group.key}>
            <div className="side-title">{group.name}</div>
            <ul>
              {group.articles.slice(0, 10).map(article => (
                <li key={article.slug}>
                  <Link href={`/a/${article.slug}`}>{article.title}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}
