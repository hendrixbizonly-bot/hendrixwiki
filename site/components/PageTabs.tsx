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

function TalkIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4.5 4.75h11a1.75 1.75 0 0 1 1.75 1.75v6a1.75 1.75 0 0 1-1.75 1.75H9l-3.5 3v-3H4.5A1.75 1.75 0 0 1 2.75 10.5v-6A1.75 1.75 0 0 1 4.5 4.75Z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
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
  const talkActive = pathname.startsWith('/talk') || pathname.startsWith('/skill');
  const graphActive = pathname.startsWith('/graph');
  const articleActive = !talkActive && !graphActive;

  return (
    <div className="page-toolbar">
      <nav className="page-tabs" aria-label="Page tabs">
        <Link className={`page-tab ${articleActive ? 'active' : ''}`} href="/">
          Article
        </Link>
        <Link className={`page-tab ${talkActive ? 'active' : ''}`} href="/talk">
          Talk
        </Link>
        <Link className={`page-tab ${graphActive ? 'active' : ''}`} href="/graph">
          Graph
        </Link>
      </nav>

      <div className="page-actions" aria-label="Page tools">
        <Link className="page-action" href="/search" aria-label="Search the archive">
          <SearchIcon />
        </Link>
        <Link className="page-action" href="/talk" aria-label="Open AI Hendrix talk">
          <TalkIcon />
        </Link>
        <Link className="page-action" href="/random" aria-label="Open a random chapter">
          <HistoryIcon />
        </Link>
      </div>
    </div>
  );
}
