import Link from 'next/link';

export function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="topbar-meta">
          a living archive built from <Link href="/raw">raw notes</Link> and arranged like a book
        </div>

        <nav className="topbar-links" aria-label="Site">
          <Link href="/">Home</Link>
          <Link href="/a/meta/start-here">Start Here</Link>
          <Link href="/a/meta/timeline">Timeline</Link>
        </nav>
      </div>
    </header>
  );
}
