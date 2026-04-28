import Link from 'next/link';

export function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="topbar-spacer" aria-hidden="true" />
        <div className="topbar-meta">
          Hendrix&apos;s knowledge base (<span className="topbar-version">v1</span>)
        </div>

        <nav className="topbar-links" aria-label="Site">
          <Link href="/">Home</Link>
          <Link href="/a/meta/start-here">Wiki</Link>
        </nav>
      </div>
    </header>
  );
}
