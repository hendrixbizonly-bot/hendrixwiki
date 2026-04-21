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

function ChatIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M4 4.75h12a1 1 0 0 1 1 1V13a1 1 0 0 1-1 1H9l-4 3v-3H4a1 1 0 0 1-1-1V5.75a1 1 0 0 1 1-1Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
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
  const articleActive = !pathname.startsWith('/graph');
  const graphActive = pathname.startsWith('/graph');

  return (
    <div className="page-toolbar">
      <nav className="page-tabs" aria-label="Page tabs">
        <Link className={`page-tab ${articleActive ? 'active' : ''}`} href="/">
          Article
        </Link>
        <span className="page-tab disabled" aria-disabled="true">
          Talk
        </span>
        <Link className={`page-tab ${graphActive ? 'active' : ''}`} href="/graph">
          Graph
        </Link>
      </nav>

      <div className="page-actions" aria-label="Page tools">
        <Link className="page-action" href="/search" aria-label="Search wiki">
          <SearchIcon />
        </Link>
        <Link className="page-action" href="/schema" aria-label="Open schema">
          <ChatIcon />
        </Link>
        <Link className="page-action" href="/random" aria-label="Open a random article">
          <HistoryIcon />
        </Link>
      </div>
    </div>
  );
}
