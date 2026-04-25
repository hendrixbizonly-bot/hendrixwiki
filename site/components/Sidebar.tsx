import Link from 'next/link';
import { articlesBySection } from '@/lib/articles';

const navigationLinks = [
  { href: '/', label: 'Main Page' },
  { href: '/a/core/hendrix', label: 'About Hendrix' },
  { href: '/random', label: 'Read a random chapter' },
];
const SIDEBAR_ARTICLE_LIMIT = 10;

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
              {section.key === 'navigation' && navigationLinks.map(link => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
              {section.key !== 'navigation' && section.articles.slice(0, SIDEBAR_ARTICLE_LIMIT).map(article => (
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
