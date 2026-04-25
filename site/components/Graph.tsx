'use client';

import { useEffect, useRef } from 'react';
import {
  drag,
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  select,
  zoom,
  zoomIdentity,
} from 'd3';
import type { D3DragEvent, SimulationLinkDatum, SimulationNodeDatum } from 'd3';
import { SECTION_COLORS, SECTION_NAMES, SECTION_ORDER } from '@/lib/constants';

type GraphNode = {
  id: string;
  title: string;
  section: string;
  href: string;
};

type GraphLink = {
  source: string;
  target: string;
};

type GraphNodeDatum = SimulationNodeDatum &
  GraphNode & {
    degree: number;
    radius: number;
  };

type GraphLinkDatum = SimulationLinkDatum<GraphNodeDatum> &
  GraphLink & {
    sourceId: string;
    targetId: string;
  };

type Size = {
  width: number;
  height: number;
};

const LABEL_RADIUS_THRESHOLD = 9;
const EMPTY_NEIGHBORS = new Set<string>();

function sectionColor(section: string) {
  return SECTION_COLORS[section as keyof typeof SECTION_COLORS] || '#728090';
}

function sectionName(section: string) {
  return SECTION_NAMES[section as keyof typeof SECTION_NAMES] || section;
}

function sectionTarget(section: string, sections: readonly string[], size: Size) {
  const index = Math.max(sections.indexOf(section), 0);
  const count = Math.max(sections.length, 1);
  const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
  const radiusX = Math.min(size.width * 0.28, 260);
  const radiusY = Math.min(size.height * 0.22, 190);

  return {
    x: size.width / 2 + Math.cos(angle) * radiusX,
    y: size.height / 2 + Math.sin(angle) * radiusY,
  };
}

function getEndpoint(
  endpoint: string | GraphNodeDatum,
  nodesById: Map<string, GraphNodeDatum>
) {
  return typeof endpoint === 'string' ? nodesById.get(endpoint) ?? null : endpoint;
}

function openNodePage(href: string) {
  window.location.assign(href);
}

export function Graph({
  nodes: initialNodes,
  links: initialLinks,
}: {
  nodes: GraphNode[];
  links: GraphLink[];
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const zoomInButtonRef = useRef<HTMLButtonElement>(null);
  const zoomOutButtonRef = useRef<HTMLButtonElement>(null);
  const zoomResetButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const zoomInButton = zoomInButtonRef.current;
    const zoomOutButton = zoomOutButtonRef.current;
    const zoomResetButton = zoomResetButtonRef.current;
    if (!stage || !zoomInButton || !zoomOutButton || !zoomResetButton) return;

    const size = {
      width: Math.max(stage.clientWidth, 640),
      height: Math.max(stage.clientHeight, 480),
    };

    const activeSections = SECTION_ORDER.filter(section =>
      initialNodes.some(node => node.section === section)
    );
    const sections = activeSections.length ? activeSections : ['identity'];

    const degree = new Map<string, number>();
    for (const link of initialLinks) {
      degree.set(link.source, (degree.get(link.source) || 0) + 1);
      degree.set(link.target, (degree.get(link.target) || 0) + 1);
    }

    const nodes: GraphNodeDatum[] = initialNodes.map(node => {
      const target = sectionTarget(node.section, sections, size);
      const nodeDegree = degree.get(node.id) || 1;

      return {
        ...node,
        degree: nodeDegree,
        x: target.x + (Math.random() - 0.5) * 60,
        y: target.y + (Math.random() - 0.5) * 60,
        radius: Math.min(5 + Math.sqrt(nodeDegree) * 2, 18),
      };
    });

    const links: GraphLinkDatum[] = initialLinks.map(link => ({
      ...link,
      sourceId: link.source,
      targetId: link.target,
    }));
    const nodesById = new Map(nodes.map(node => [node.id, node]));
    const neighborsById = new Map<string, Set<string>>();

    for (const { sourceId, targetId } of links) {
      (neighborsById.get(sourceId) || neighborsById.set(sourceId, new Set()).get(sourceId)!).add(targetId);
      (neighborsById.get(targetId) || neighborsById.set(targetId, new Set()).get(targetId)!).add(sourceId);
    }

    const svg = select(stage)
      .append('svg')
      .attr('viewBox', `0 0 ${size.width} ${size.height}`)
      .attr('role', 'img')
      .attr('aria-label', 'Interactive graph of Hendrixpedia chapters');

    const viewport = svg.append('g').attr('class', 'viewport');
    const linksLayer = viewport.append('g').attr('class', 'links');
    const nodesLayer = viewport.append('g').attr('class', 'nodes');
    const legendLayer = svg.append('g').attr('class', 'legend');

    const link = linksLayer
      .selectAll<SVGLineElement, GraphLinkDatum>('line')
      .data(links)
      .join('line')
      .attr('class', 'link');

    const node = nodesLayer
      .selectAll<SVGGElement, GraphNodeDatum>('g')
      .data(nodes, datum => datum.id)
      .join('g')
      .attr('class', 'node')
      .attr('tabindex', 0)
      .attr('role', 'link')
      .attr('aria-label', datum => `Open ${datum.title}`);

    node
      .append('circle')
      .attr('r', datum => datum.radius)
      .attr('fill', datum => sectionColor(datum.section));

    node
      .append('text')
      .attr('x', datum => datum.radius + 6)
      .attr('y', 4)
      .text(datum => datum.title);

    node
      .append('title')
      .text(datum => `${datum.title} (${sectionName(datum.section)})`);

    let activeNodeId: string | null = null;

    function applyVisualState() {
      const neighbors = activeNodeId ? neighborsById.get(activeNodeId) ?? EMPTY_NEIGHBORS : EMPTY_NEIGHBORS;

      node
        .classed('is-pinned', datum => datum.fx != null || datum.fy != null)
        .classed('is-active', datum => activeNodeId === datum.id)
        .classed('is-neighbor', datum => activeNodeId != null && neighbors.has(datum.id))
        .classed('is-muted', datum =>
          activeNodeId != null && datum.id !== activeNodeId && !neighbors.has(datum.id)
        )
        .select<SVGTextElement>('text')
        .attr('display', datum =>
          datum.radius >= LABEL_RADIUS_THRESHOLD ||
          datum.fx != null ||
          datum.fy != null ||
          datum.id === activeNodeId ||
          neighbors.has(datum.id)
            ? null
            : 'none'
        );

      link
        .classed('is-active', datum =>
          activeNodeId != null && (datum.sourceId === activeNodeId || datum.targetId === activeNodeId)
        )
        .classed('is-muted', datum =>
          activeNodeId != null && datum.sourceId !== activeNodeId && datum.targetId !== activeNodeId
        );

      if (activeNodeId) {
        link.filter(datum => datum.sourceId === activeNodeId || datum.targetId === activeNodeId).raise();
        node.filter(datum => datum.id === activeNodeId || neighbors.has(datum.id)).raise();
        return;
      }

      link.order();
      node.order();
    }

    function setActiveNode(nodeId: string | null) {
      if (activeNodeId === nodeId) return;
      activeNodeId = nodeId;
      applyVisualState();
    }

    const centerForce = forceCenter(size.width / 2, size.height / 2);
    const xForce = forceX<GraphNodeDatum>(datum => sectionTarget(datum.section, sections, size).x).strength(0.055);
    const yForce = forceY<GraphNodeDatum>(datum => sectionTarget(datum.section, sections, size).y).strength(0.055);
    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .filter(event => {
        if (event.type === 'dblclick') return false;
        if (event.type === 'wheel') return true;
        const target = event.target;
        if (target instanceof Element && target.closest('.node')) return false;
        return !event.button;
      })
      .on('zoom', event => {
        viewport.attr('transform', event.transform.toString());
      });
    let draggedNodeId: string | null = null;
    let clearDraggedNodeTimer = 0;
    let pressedNodeId: string | null = null;

    const simulation = forceSimulation(nodes)
      .force(
        'link',
        forceLink<GraphNodeDatum, GraphLinkDatum>(links)
          .id(datum => datum.id)
          .distance(linkDatum => {
            const source = getEndpoint(linkDatum.source, nodesById);
            const target = getEndpoint(linkDatum.target, nodesById);
            if (!source || !target) return 84;

            const baseDistance = source.section === target.section ? 26 : 58;
            return baseDistance + (source.radius + target.radius) * 1.7;
          })
          .strength(linkDatum => {
            const source = getEndpoint(linkDatum.source, nodesById);
            const target = getEndpoint(linkDatum.target, nodesById);
            if (!source || !target) return 0.16;
            return source.section === target.section ? 0.3 : 0.14;
          })
          .iterations(2)
      )
      .force(
        'charge',
        forceManyBody<GraphNodeDatum>()
          .distanceMin(28)
          .distanceMax(Math.min(size.width, size.height) * 0.58)
          .strength(datum => -(120 + datum.degree * 7 + datum.radius * 10))
      )
      .force('collide', forceCollide<GraphNodeDatum>().radius(datum => datum.radius + 15).iterations(3))
      .force('center', centerForce)
      .force('x', xForce)
      .force('y', yForce)
      .alpha(0.9)
      .alphaDecay(0.032)
      .velocityDecay(0.38);

    function renderFrame() {
      link
        .attr('x1', datum => getEndpoint(datum.source, nodesById)?.x ?? 0)
        .attr('y1', datum => getEndpoint(datum.source, nodesById)?.y ?? 0)
        .attr('x2', datum => getEndpoint(datum.target, nodesById)?.x ?? 0)
        .attr('y2', datum => getEndpoint(datum.target, nodesById)?.y ?? 0);

      node.attr('transform', datum => `translate(${datum.x ?? 0},${datum.y ?? 0})`);
    }

    for (let iteration = 0; iteration < 80; iteration += 1) {
      simulation.tick();
    }

    renderFrame();
    simulation.on('tick', renderFrame);

    function updateZoomBounds() {
      zoomBehavior
        .extent([
          [0, 0],
          [size.width, size.height],
        ])
        .translateExtent([
          [-size.width * 0.8, -size.height * 0.8],
          [size.width * 1.8, size.height * 1.8],
        ]);
    }

    updateZoomBounds();
    svg.call(zoomBehavior).on('dblclick.zoom', null);

    function handleZoomIn() {
      svg.transition().duration(180).call(zoomBehavior.scaleBy, 1.2);
    }

    function handleZoomOut() {
      svg.transition().duration(180).call(zoomBehavior.scaleBy, 1 / 1.2);
    }

    function handleZoomReset() {
      svg.transition().duration(220).call(zoomBehavior.transform, zoomIdentity);
    }

    zoomInButton.addEventListener('click', handleZoomIn);
    zoomOutButton.addEventListener('click', handleZoomOut);
    zoomResetButton.addEventListener('click', handleZoomReset);

    function updateLegend() {
      const legendItems = legendLayer
        .selectAll<SVGGElement, string>('g')
        .data(sections)
        .join('g')
        .attr('class', 'legend-item')
        .attr('transform', (_, index) => {
          const columns = size.width < 900 ? 2 : 4;
          const x = 18 + (index % columns) * 184;
          const y = size.height - 28 - Math.floor(index / columns) * 22;
          return `translate(${x},${y})`;
        });

      legendItems
        .selectAll<SVGCircleElement, string>('circle')
        .data(section => [section])
        .join('circle')
        .attr('r', 5)
        .attr('fill', section => sectionColor(section));

      legendItems
        .selectAll<SVGTextElement, string>('text')
        .data(section => [section])
        .join('text')
        .attr('x', 11)
        .attr('y', 4)
        .text(section => sectionName(section));
    }

    function handleDragStart(
      this: SVGGElement,
      event: D3DragEvent<SVGGElement, GraphNodeDatum, GraphNodeDatum>,
      datum: GraphNodeDatum
    ) {
      window.clearTimeout(clearDraggedNodeTimer);
      draggedNodeId = null;
      pressedNodeId = datum.id;
      event.sourceEvent.stopPropagation();

      if (!event.active) {
        simulation.alphaTarget(0.24).restart();
      }

      setActiveNode(datum.id);
      datum.fx = datum.x;
      datum.fy = datum.y;
      select(this).classed('is-dragging', true);
      applyVisualState();
    }

    function handleDrag(
      this: SVGGElement,
      event: D3DragEvent<SVGGElement, GraphNodeDatum, GraphNodeDatum>,
      datum: GraphNodeDatum
    ) {
      draggedNodeId = datum.id;
      datum.fx = event.x;
      datum.fy = event.y;
      select(this).attr('transform', `translate(${event.x},${event.y})`);
    }

    function handleDragEnd(
      this: SVGGElement,
      event: D3DragEvent<SVGGElement, GraphNodeDatum, GraphNodeDatum>,
      datum: GraphNodeDatum
    ) {
      if (!event.active) {
        simulation.alphaTarget(0);
      }

      datum.fx = event.x;
      datum.fy = event.y;
      select(this).classed('is-dragging', false);
      applyVisualState();

      if (draggedNodeId === datum.id) {
        clearDraggedNodeTimer = window.setTimeout(() => {
          draggedNodeId = null;
        }, 0);
      }
    }

    node.call(
      drag<SVGGElement, GraphNodeDatum>()
        .clickDistance(6)
        .on('start', handleDragStart)
        .on('drag', handleDrag)
        .on('end', handleDragEnd)
    );

    node
      .on('mouseenter', (_, datum) => {
        setActiveNode(datum.id);
      })
      .on('mouseleave', (_, datum) => {
        if (activeNodeId === datum.id) {
          setActiveNode(null);
        }
      })
      .on('focus', (_, datum) => {
        setActiveNode(datum.id);
      })
      .on('blur', (_, datum) => {
        if (activeNodeId === datum.id) {
          setActiveNode(null);
        }
      })
      .on('pointerdown', (_, datum) => {
        pressedNodeId = datum.id;
      })
      .on('pointerup', (event, datum) => {
        if (event.button !== 0) return;
        if (draggedNodeId === datum.id) return;
        if (pressedNodeId !== datum.id) return;

        pressedNodeId = null;
        openNodePage(datum.href);
      })
      .on('click', event => {
        event.preventDefault();
      })
      .on('keydown', (event, datum) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        openNodePage(datum.href);
      })
      .on('dblclick', (event, datum) => {
        event.preventDefault();
        pressedNodeId = null;
        datum.fx = null;
        datum.fy = null;
        applyVisualState();
        simulation.alpha(0.45).restart();
      });

    const resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0];
      if (!entry) return;

      size.width = Math.max(entry.contentRect.width, 640);
      size.height = Math.max(entry.contentRect.height, 480);

      svg.attr('viewBox', `0 0 ${size.width} ${size.height}`);
      centerForce.x(size.width / 2).y(size.height / 2);
      updateZoomBounds();
      simulation.alpha(0.28).restart();
      updateLegend();
    });

    applyVisualState();
    updateLegend();
    resizeObserver.observe(stage);

    return () => {
      resizeObserver.disconnect();
      window.clearTimeout(clearDraggedNodeTimer);
      zoomInButton.removeEventListener('click', handleZoomIn);
      zoomOutButton.removeEventListener('click', handleZoomOut);
      zoomResetButton.removeEventListener('click', handleZoomReset);
      simulation.stop();
      svg.remove();
    };
  }, [initialLinks, initialNodes]);

  return (
    <div className="graph-shell">
      <div className="graph-controls" aria-label="Graph zoom controls">
        <button ref={zoomInButtonRef} type="button" className="graph-control-button" aria-label="Zoom in">
          +
        </button>
        <button ref={zoomOutButtonRef} type="button" className="graph-control-button" aria-label="Zoom out">
          -
        </button>
        <button
          ref={zoomResetButtonRef}
          type="button"
          className="graph-control-button graph-control-button-reset"
          aria-label="Reset zoom"
        >
          Reset
        </button>
      </div>
      <div id="graph-stage" ref={stageRef} />
    </div>
  );
}
