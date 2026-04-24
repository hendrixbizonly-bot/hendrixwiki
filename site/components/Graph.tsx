'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SECTION_COLORS, SECTION_NAMES, SECTION_ORDER } from '@/lib/constants';

type N = {
  id: string;
  title: string;
  section: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
};
type L = { source: string; target: string };

export function Graph({
  nodes: initialNodes,
  links,
}: {
  nodes: Array<{ id: string; title: string; section: string }>;
  links: L[];
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const stageEl = stage;

    const nodes: N[] = initialNodes.map(node => ({
      ...node,
      x: Math.random() * 800 - 400,
      y: Math.random() * 600 - 300,
      vx: 0,
      vy: 0,
      r: 5,
    }));
    const byId = new Map(nodes.map(node => [node.id, node]));

    const degree = new Map<string, number>();
    for (const link of links) {
      degree.set(link.source, (degree.get(link.source) || 0) + 1);
      degree.set(link.target, (degree.get(link.target) || 0) + 1);
    }
    for (const node of nodes) {
      node.r = Math.min(3 + Math.sqrt(degree.get(node.id) || 1) * 1.6, 14);
    }

    const linkDistance = 60;
    const charge = -60;
    for (let iteration = 0; iteration < 320; iteration += 1) {
      for (let index = 0; index < nodes.length; index += 1) {
        for (let otherIndex = index + 1; otherIndex < nodes.length; otherIndex += 1) {
          const first = nodes[index];
          const second = nodes[otherIndex];
          let dx = second.x - first.x;
          let dy = second.y - first.y;
          let d2 = dx * dx + dy * dy;
          if (d2 < 0.01) {
            dx = Math.random() - 0.5;
            dy = Math.random() - 0.5;
            d2 = 0.01;
          }
          if (d2 > 40000) continue;
          const distance = Math.sqrt(d2);
          const force = charge / d2;
          const fx = force * dx / distance;
          const fy = force * dy / distance;
          first.vx -= fx;
          first.vy -= fy;
          second.vx += fx;
          second.vy += fy;
        }
      }
      for (const link of links) {
        const first = byId.get(link.source);
        const second = byId.get(link.target);
        if (!first || !second) continue;
        const dx = second.x - first.x;
        const dy = second.y - first.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 0.1;
        const force = (distance - linkDistance) * 0.05;
        const fx = force * dx / distance;
        const fy = force * dy / distance;
        first.vx += fx;
        first.vy += fy;
        second.vx -= fx;
        second.vy -= fy;
      }
      for (const node of nodes) {
        node.vx -= node.x * 0.002;
        node.vy -= node.y * 0.002;
      }
      for (const node of nodes) {
        node.vx *= 0.75;
        node.vy *= 0.75;
        node.x += node.vx;
        node.y += node.vy;
      }
    }

    function escapeXml(text: string) {
      return text.replace(/[<>&"']/g, char => ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&apos;',
      }[char] || char));
    }

    function render() {
      const width = stageEl.clientWidth;
      const height = stageEl.clientHeight;
      let minX = Number.POSITIVE_INFINITY;
      let maxX = Number.NEGATIVE_INFINITY;
      let minY = Number.POSITIVE_INFINITY;
      let maxY = Number.NEGATIVE_INFINITY;

      for (const node of nodes) {
        minX = Math.min(minX, node.x);
        maxX = Math.max(maxX, node.x);
        minY = Math.min(minY, node.y);
        maxY = Math.max(maxY, node.y);
      }

      const padding = 60;
      const scale = Math.min(
        (width - 2 * padding) / (maxX - minX || 1),
        (height - 2 * padding) / (maxY - minY || 1)
      );
      const centerX = width / 2;
      const centerY = height / 2;
      const graphX = (minX + maxX) / 2;
      const graphY = (minY + maxY) / 2;

      const linkMarkup = links.map(link => {
        const first = byId.get(link.source);
        const second = byId.get(link.target);
        if (!first || !second) return '';
        return `<line class="link" x1="${(first.x - graphX) * scale + centerX}" y1="${(first.y - graphY) * scale + centerY}" x2="${(second.x - graphX) * scale + centerX}" y2="${(second.y - graphY) * scale + centerY}" stroke-width="0.6" />`;
      }).join('');

      const nodeMarkup = nodes.map(node => {
        const x = (node.x - graphX) * scale + centerX;
        const y = (node.y - graphY) * scale + centerY;
        const color = SECTION_COLORS[node.section as keyof typeof SECTION_COLORS] || '#888';
        return `<g class="node" transform="translate(${x},${y})" data-slug="${node.id}">
          <circle r="${node.r}" fill="${color}" fill-opacity="0.85" stroke="#fff" stroke-width="1"></circle>
          ${node.r > 8 ? `<text x="${node.r + 3}" y="3" fill="#333">${escapeXml(node.title)}</text>` : ''}
        </g>`;
      }).join('');

      const usedSections = SECTION_ORDER.filter(section => nodes.some(node => node.section === section));
      const legend = usedSections.map((section, index) => {
        const color = SECTION_COLORS[section];
        const label = SECTION_NAMES[section];
        return `<g transform="translate(${12 + (index % 4) * 165}, ${height - 24 - Math.floor(index / 4) * 18})">
          <circle r="5" fill="${color}"></circle>
          <text x="10" y="4" fill="#444" font-size="11">${escapeXml(label)}</text>
        </g>`;
      }).join('');

      stageEl.innerHTML = `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <g class="links">${linkMarkup}</g>
        <g class="nodes">${nodeMarkup}</g>
        <g class="legend">${legend}</g>
      </svg>`;

      stageEl.querySelectorAll<SVGGElement>('.node').forEach(group => {
        group.addEventListener('click', () => {
          const slug = group.getAttribute('data-slug');
          if (slug) router.push(`/a/${slug}`);
        });
      });
    }

    render();
    const onResize = () => render();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [initialNodes, links, router]);

  return <div id="graph-stage" ref={stageRef} />;
}
