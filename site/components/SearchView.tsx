'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { ManifestEntry } from '@/lib/articles';

export function SearchView({ articles }: { articles: ManifestEntry[] }) {
  const [q, setQ] = useState('');
  const results = useMemo(() => {
    const s = q.toLowerCase().trim();
    if (!s) return articles.slice(0, 40);
    return articles.filter(a =>
      a.title.toLowerCase().includes(s) ||
      a.category.toLowerCase().includes(s) ||
      a.tags.some(t => t.toLowerCase().includes(s))
    );
  }, [q, articles]);

  return (
    <>
      <input
        type="search"
        placeholder="Search articles..."
        value={q}
        onChange={e => setQ(e.target.value)}
        style={{ width: '100%', fontSize: 16, padding: '10px 14px' }}
        autoFocus
      />
      <p className="muted" style={{ marginTop: 10 }}>
        {q ? `${results.length} result${results.length === 1 ? '' : 's'}` : `Showing first ${Math.min(40, articles.length)} articles of ${articles.length}`}
      </p>
      <ul className="search-list">
        {results.map(r => (
          <li key={r.slug}>
            <Link href={`/a/${r.slug}`}><strong>{r.title}</strong></Link>
            <span className="cat">{r.category} · {r.type}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
