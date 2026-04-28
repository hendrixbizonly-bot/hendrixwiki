import Image from 'next/image';
import { articlesBySection } from '@/lib/articles';
import { SidebarLink } from '@/components/SidebarLink';

const navigationLinks = [
  { href: '/', label: 'Main Page' },
  { href: '/a/core/hendrix', label: 'About Hendrix' },
  { href: '/random', label: 'Read a random chapter' },
];

export function Sidebar() {
  const sections = articlesBySection();

  return (
    <aside className="sidebar">
      <div className="side-brand">
        <div className="side-logo">
          <Image
            src="/original_1eb8cd13c228d5880cf19857ed06cb85.jpg"
            alt="Hendrix profile picture"
            width={78}
            height={78}
            className="side-logo-image"
            priority
          />
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
                  <SidebarLink href={link.href}>{link.label}</SidebarLink>
                </li>
              ))}
              {section.key !== 'navigation' && section.articles.map(article => (
                <li key={article.slug}>
                  <SidebarLink href={`/a/${article.slug}`}>{article.title}</SidebarLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}
