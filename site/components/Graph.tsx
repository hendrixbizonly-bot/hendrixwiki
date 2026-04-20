'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CATEGORY_COLORS } from '@/lib/constants';

type N = { id: string; title: string; category: string; x: number; y: number; vx: number; vy: number; r: number };
type L = { source: string; target: string };

export function Graph({
  nodes: initialNodes,
  links,
}: {
  nodes: Array<{ id: string; title: string; category: string }>;
  links: L[];
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const nodes: N[] = initialNodes.map(n => ({
      ...n,
      x: Math.random() * 800 - 400,
      y: Math.random() * 600 - 300,
      vx: 0, vy: 0,
      r: 5,
    }));
    const byId = new Map(nodes.map(n => [n.id, n]));

    const deg = new Map<string, number>();
    for (const l of links) {
      deg.set(l.source, (deg.get(l.source) || 0) + 1);
      deg.set(l.target, (deg.get(l.target) || 0) + 1);
    }
    for (const n of nodes) n.r = Math.min(3 + Math.sqrt(deg.get(n.id) || 1) * 1.6, 14);

    const linkDist = 60;
    const charge = -60;
    for (let it = 0; it < 320; it++) {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          let dx = b.x - a.x, dy = b.y - a.y;
          let d2 = dx*dx + dy*dy;
          if (d2 < 0.01) { dx = Math.random() - 0.5; dy = Math.random() - 0.5; d2 = 0.01; }
          if (d2 > 40000) continue;
          const d = Math.sqrt(d2);
          const f = charge / d2;
          const fx = f * dx / d, fy = f * dy / d;
          a.vx -= fx; a.vy -= fy;
          b.vx += fx; b.vy += fy;
        }
      }
      for (const l of links) {
        const a = byId.get(l.source)!;
        const b = byId.get(l.target)!;
        if (!a || !b) continue;
        const dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.sqrt(dx*dx + dy*dy) || 0.1;
        const f = (d - linkDist) * 0.05;
        const fx = f * dx / d, fy = f * dy / d;
        a.vx += fx; a.vy += fy;
        b.vx -= fx; b.vy -= fy;
      }
      for (const n of nodes) { n.vx -= n.x * 0.002; n.vy -= n.y * 0.002; }
      for (const n of nodes) { n.vx *= 0.75; n.vy *= 0.75; n.x += n.vx; n.y += n.vy; }
    }

    function render() {
      const w = stage!.clientWidth;
      const h = stage!.clientHeight;
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (const n of nodes) { minX = Math.min(minX, n.x); maxX = Math.max(maxX, n.x); minY = Math.min(minY, n.y); maxY = Math.max(maxY, n.y); }
      const pad = 60;
      const s = Math.min((w - 2*pad) / (maxX - minX || 1), (h - 2*pad) / (maxY - minY || 1));
      const cx = w/2, cy = h/2;
      const gx = (minX + maxX) / 2, gy = (minY + maxY) / 2;

      const linkM = links.map(l => {
        const a = byId.get(l.source)!;
        const b = byId.get(l.target)!;
        return `<line class="link" x1="${(a.x - gx)*s + cx}" y1="${(a.y - gy)*s + cy}" x2="${(b.x - gx)*s + cx}" y2="${(b.y - gy)*s + cy}" stroke-width="0.6" />`;
      }).join('');

      const nodeM = nodes.map(n => {
        const x = (n.x - gx) * s + cx;
        const y = (n.y - gy) * s + cy;
        const col = CATEGORY_COLORS[n.category] || '#888';
        return `<g class="node" transform="translate(${x},${y})" data-slug="${n.id}">
          <circle r="${n.r}" fill="${col}" fill-opacity="0.85" stroke="#fff" stroke-width="1"></circle>
          ${n.r > 8 ? `<text x="${n.r+3}" y="3" fill="#333">${escapeXml(n.title)}</text>` : ''}
        </g>`;
      }).join('');

      const legend = Object.entries(CATEGORY_COLORS).map(([k, v], i) => {
        return `<g transform="translate(${12 + (i % 10) * 90}, ${h - 22 - Math.floor(i/10) * 18})">
          <circle r="5" fill="${v}"></circle>
          <text x="10" y="4" fill="#444" font-size="11">${k}</text>
        </g>`;
      }).join('');

      stage!.innerHTML = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <g class="links">${linkM}</g>
        <g class="nodes">${nodeM}</g>
        <g class="legend">${legend}</g>
      </svg>`;

      stage!.querySelectorAll<SVGGElement>('.node').forEach(g => {
        g.addEventListener('click', () => {
          const slug = g.getAttribute('data-slug');
          if (slug) router.push(`/a/${slug}`);
        });
      });
    }

    function escapeXml(s: string) {
      return s.replace(/[<>&"']/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]!));
    }

    render();
    const onResize = () => render();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [initialNodes, links, router]);

  return <div id="graph-stage" ref={stageRef} />;
}
