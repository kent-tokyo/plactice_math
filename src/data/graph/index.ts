import foundationsData from './foundations.json';
import pureMathData from './pure-math.json';
import appliedMathData from './applied-math.json';
import areasData from './areas.json';
import type { GraphData, AreaMeta, AreaId, MathEdge } from '@/types';

export function getAllGraphData(): GraphData {
  const nodes = [
    ...foundationsData.nodes,
    ...pureMathData.nodes,
    ...appliedMathData.nodes,
  ];
  const edges = [
    ...foundationsData.edges,
    ...pureMathData.edges,
    ...appliedMathData.edges,
  ];
  return { nodes, edges } as GraphData;
}

export function getAreaMeta(): AreaMeta[] {
  return areasData as AreaMeta[];
}

/** Derive inter-area edges by aggregating cross-area edges from the full graph */
export function getAreaEdges(): MathEdge[] {
  const graph = getAllGraphData();
  const nodeAreaMap = new Map<string, AreaId>();
  for (const n of graph.nodes) {
    nodeAreaMap.set(n.id, n.area);
  }

  const seen = new Set<string>();
  const areaEdges: MathEdge[] = [];

  for (const e of graph.edges) {
    const srcArea = nodeAreaMap.get(e.source);
    const tgtArea = nodeAreaMap.get(e.target);
    if (srcArea && tgtArea && srcArea !== tgtArea) {
      const key = `${srcArea}-${tgtArea}`;
      if (!seen.has(key)) {
        seen.add(key);
        areaEdges.push({ source: srcArea, target: tgtArea });
      }
    }
  }

  return areaEdges;
}

/** Get nodes and edges within a specific area (plus cross-area edges touching area nodes) */
export function getNodesByArea(areaId: AreaId): GraphData {
  const graph = getAllGraphData();
  const areaNodes = graph.nodes.filter(n => n.area === areaId);
  const areaNodeIds = new Set(areaNodes.map(n => n.id));
  const areaEdges = graph.edges.filter(
    e => areaNodeIds.has(e.source) && areaNodeIds.has(e.target)
  );
  return { nodes: areaNodes, edges: areaEdges };
}
