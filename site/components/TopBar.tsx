import Link from 'next/link';
import { KebabMenu } from './KebabMenu';
import { SearchBox } from './SearchBox';
import type { ManifestEntry } from '@/lib/articles';

export function TopBar({ articles }: { articles: ManifestEntry[] }) {
  return (
    <header className="topbar">
      <Link href="/" className="brand" aria-label="Hendrixpedia home">
        <div className="logo-mark">H</div>
        <div className="brand-text">
          <div className="brand-title">Hendrixpedia</div>
          <div className="brand-sub">The Personal Encyclopedia</div>
        </div>
      </Link>

      <nav className="tabs">
        <Link className="tab active" href="/">Article</Link>
        <a className="tab" href="#">Talk</a>
      </nav>

      <div className="topbar-right">
        <SearchBox articles={articles} />
        <KebabMenu />
      </div>
    </header>
  );
}
