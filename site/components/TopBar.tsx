import Link from 'next/link';

export function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="topbar-meta">
          Hendrix&apos;s knowledge base (
          <Link href="/raw">unfiltered</Link>
          {' '}|{' '}
          <Link href="/">v1</Link>
          )
        </div>

        <nav className="topbar-links" aria-label="Site">
          <Link href="/">Home</Link>
          <Link href="/" className="current">
            Wiki
          </Link>
        </nav>
      </div>
    </header>
  );
}
