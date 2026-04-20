import Link from 'next/link';
import { articlesByCategory } from '@/lib/articles';

export function Sidebar() {
  const groups = articlesByCategory();

  return (
    <aside className="sidebar">
      <div className="side-section">
        <div className="side-title">Navigation</div>
        <ul>
          <li><Link href="/">Main page</Link></li>
          <li><Link href="/random">Random article</Link></li>
          <li><Link href="/graph">Graph view</Link></li>
          <li><Link href="/search">Search</Link></li>
        </ul>
      </div>

      {groups.map(g => (
        <div className="side-section" key={g.key}>
          <div className="side-title">{g.name}</div>
          <ul>
            {g.articles.slice(0, 6).map(a => (
              <li key={a.slug}><Link href={`/a/${a.slug}`}>{a.title}</Link></li>
            ))}
          </ul>
        </div>
      ))}
    </aside>
  );
}
