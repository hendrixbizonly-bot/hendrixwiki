'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12.5 12.5L17 17" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4.5 4.5a2 2 0 0 1 2-2h8v13h-8a2 2 0 0 0-2 2Z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M4.5 4.5v11" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4.5 10a5.5 5.5 0 1 0 1.6-3.9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4.5 4.5v3h3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 7v3.4l2.2 1.3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function PageTabs() {
  const pathname = usePathname();
  const readActive = !pathname.startsWith('/graph');
  const mapActive = pathname.startsWith('/graph');

  return (
    <div className="page-toolbar">
      <nav className="page-tabs" aria-label="Page tabs">
        <Link className={`page-tab ${readActive ? 'active' : ''}`} href="/">
          Read
        </Link>
        <Link className={`page-tab ${mapActive ? 'active' : ''}`} href="/graph">
          Map
        </Link>
      </nav>

      <div className="page-actions" aria-label="Page tools">
        <Link className="page-action" href="/a/meta/start-here" aria-label="Open Start Here">
          <BookIcon />
        </Link>
        <Link className="page-action" href="/search" aria-label="Search the archive">
          <SearchIcon />
        </Link>
        <Link className="page-action" href="/random" aria-label="Open a random chapter">
          <HistoryIcon />
        </Link>
      </div>
    </div>
  );
}
