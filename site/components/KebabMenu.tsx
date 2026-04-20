'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export function KebabMenu() {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!wrap.current) return;
      if (!wrap.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return (
    <div ref={wrap} style={{ position: 'relative' }}>
      <button className="kebab" aria-label="More" onClick={() => setOpen(v => !v)}>
        <span></span><span></span><span></span>
      </button>
      <div className={`menu ${open ? 'show' : ''}`}>
        <Link href="/graph" onClick={() => setOpen(false)}>Graph view</Link>
        <Link href="/random" onClick={() => setOpen(false)}>Random article</Link>
        <Link href="/search" onClick={() => setOpen(false)}>Search</Link>
        <Link href="/raw" onClick={() => setOpen(false)}>View Raw context</Link>
        <Link href="/schema" onClick={() => setOpen(false)}>View Schema</Link>
        <Link href="/index.md" onClick={() => setOpen(false)}>Export index.md</Link>
      </div>
    </div>
  );
}
