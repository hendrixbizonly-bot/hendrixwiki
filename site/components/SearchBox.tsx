'use client';

import Link from 'next/link';
import { useMemo, useState, useRef, useEffect } from 'react';
import type { ManifestEntry } from '@/lib/articles';

export function SearchBox({ articles }: { articles: ManifestEntry[] }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const s = q.toLowerCase().trim();
    if (!s) return [];
    return articles
      .filter(a =>
        a.title.toLowerCase().includes(s) ||
        a.category.toLowerCase().includes(s) ||
        a.tags.some(t => t.toLowerCase().includes(s))
      )
      .slice(0, 12);
  }, [q, articles]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <input
        type="search"
        placeholder="Search Hendrixpedia"
        value={q}
        onChange={e => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
      />
      {open && results.length > 0 && (
        <div className="menu show" style={{ top: 36, minWidth: 260, maxHeight: 360, overflowY: 'auto' }}>
          {results.map(r => (
            <Link key={r.slug} href={`/a/${r.slug}`} onClick={() => { setOpen(false); setQ(''); }}>
              <strong>{r.title}</strong>
              <span className="cat" style={{ color: 'var(--muted)', fontSize: 12, marginLeft: 8 }}>{r.category}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
