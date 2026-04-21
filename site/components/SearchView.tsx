'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { ManifestEntry } from '@/lib/articles';

export function SearchView({ articles }: { articles: ManifestEntry[] }) {
  const [q, setQ] = useState('');

  const results = useMemo(() => {
    const search = q.toLowerCase().trim();
    if (!search) return articles.slice(0, 40);

    return articles.filter(article =>
      article.title.toLowerCase().includes(search) ||
      article.category.toLowerCase().includes(search) ||
      article.tags.some(tag => tag.toLowerCase().includes(search))
    );
  }, [q, articles]);

  return (
    <div className="search-shell">
      <input
        className="search-field"
        type="search"
        placeholder="Search articles"
        value={q}
        onChange={event => setQ(event.target.value)}
        autoFocus
      />

      <p className="search-summary">
        {q
          ? `${results.length} result${results.length === 1 ? '' : 's'}`
          : `Showing the first ${Math.min(40, articles.length)} articles out of ${articles.length}`}
      </p>

      <ul className="search-list">
        {results.map(article => (
          <li key={article.slug}>
            <Link href={`/a/${article.slug}`} className="search-result-title">
              {article.title}
            </Link>
            <span className="search-result-meta">
              {article.category} | {article.type}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
