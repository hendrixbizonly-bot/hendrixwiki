import { readRaw } from '@/lib/articles';

export const metadata = { title: 'Raw context — Hendrixpedia' };

export default function RawPage() {
  const raw = readRaw();
  return (
    <>
      <h2>Raw context</h2>
      <p className="muted">The source of truth. Everything in the wiki is derived from this file.</p>
      <pre className="raw">{raw}</pre>
    </>
  );
}
