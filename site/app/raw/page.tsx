import { readRaw } from '@/lib/articles';

export const metadata = { title: 'Raw context - Hendrix Wiki' };

export default function RawPage() {
  const raw = readRaw();

  return (
    <section>
      <header className="page-header secondary">
        <h1 className="page-title small">Raw context</h1>
        <p className="page-subtitle">The source of truth. Everything in the wiki is derived from this file.</p>
      </header>
      <pre className="raw">{raw}</pre>
    </section>
  );
}
