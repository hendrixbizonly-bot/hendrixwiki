import Link from 'next/link';
import { articlesBySection } from '@/lib/articles';

const utilityLinks = [
  { href: '/', label: 'Main page' },
  { href: '/talk', label: 'Talk to AI Hendrix' },
  { href: '/graph', label: 'Open the graph' },
  { href: '/random', label: 'Read a random chapter' },
  { href: '/index.md', label: 'Download index.md' },
];

export function Sidebar() {
  const sections = articlesBySection();

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
        {sections.map(section => (
          <div className="side-section" key={section.key}>
            <div className="side-title">{section.name}</div>
            <ul>
              {section.articles.slice(0, section.key === 'navigation' ? 8 : 6).map(article => (
                <li key={article.slug}>
                  <Link href={`/a/${article.slug}`}>{article.title}</Link>
                </li>
              ))}
              {section.key === 'navigation' && utilityLinks.map(link => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}
