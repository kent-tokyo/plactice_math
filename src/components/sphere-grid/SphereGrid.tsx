'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type Viewport,
  type NodeChange,
  applyNodeChanges,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useRouter } from 'next/navigation';
import SphereNode from './SphereNode';
import SphereEdge from './SphereEdge';
import AreaNode from './AreaNode';
import type { GraphNode, GraphEdge, NodeStatus, AreaMeta } from '@/types';
import { useViewportPersistence } from '@/hooks/useViewportPersistence';
import { useLocale } from '@/i18n/useLocale';
import { localize } from '@/i18n/localize';

const nodeTypes = { sphere: SphereNode, area: AreaNode };
const edgeTypes = { sphere: SphereEdge };

// --- Node position persistence ---
function getNodePositionsKey(viewportKey: string): string {
  return `skillmap:nodepos:${viewportKey}`;
}

function loadNodePositions(viewportKey: string): Record<string, { x: number; y: number }> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(getNodePositionsKey(viewportKey));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveNodePositions(viewportKey: string, positions: Record<string, { x: number; y: number }>) {
  try {
    localStorage.setItem(getNodePositionsKey(viewportKey), JSON.stringify(positions));
  } catch { /* ignore */ }
}

function clearNodePositions(viewportKey: string) {
  try {
    localStorage.removeItem(getNodePositionsKey(viewportKey));
  } catch { /* ignore */ }
}

interface SphereGridProps {
  level: 'area' | 'detail';
  // Area level props
  areas?: AreaMeta[];
  areaEdges?: GraphEdge[];
  areaNodeCounts?: Record<string, { completed: number; total: number }>;
  onAreaClick?: (areaId: string) => void;
  // Detail level props
  mathNodes?: GraphNode[];
  mathEdges?: GraphEdge[];
  nodeStatuses?: Record<string, NodeStatus>;
  // Viewport persistence key
  viewportKey: string;
  // Domain for navigation
  domain?: string;
}

export default function SphereGrid({
  level,
  areas,
  areaEdges,
  areaNodeCounts,
  onAreaClick,
  mathNodes,
  mathEdges,
  nodeStatuses,
  viewportKey,
  domain,
}: SphereGridProps) {
  const router = useRouter();
  const { savedViewport, saveViewport } = useViewportPersistence(viewportKey);
  const { locale, t } = useLocale();

  const handleNodeClick = useCallback((nodeId: string) => {
    const prefix = domain ? `/${domain}` : '';
    router.push(`${prefix}/learn/${nodeId}`);
  }, [router, domain]);

  const handleAreaClick = useCallback((areaId: string) => {
    onAreaClick?.(areaId);
  }, [onAreaClick]);

  // Build initial nodes with saved positions applied
  const initialNodes: Node[] = useMemo(() => {
    const savedPositions = loadNodePositions(viewportKey);

    if (level === 'area' && areas) {
      const targetAreaIds = new Set((areaEdges ?? []).map(e => e.target));
      return areas.map(a => ({
        id: a.id,
        type: 'area',
        position: savedPositions?.[a.id] ?? a.position,
        data: {
          label: localize(locale, a.label, a.labels),
          description: localize(locale, a.description, a.descriptions),
          color: a.color,
          completedCount: areaNodeCounts?.[a.id]?.completed ?? 0,
          totalCount: areaNodeCounts?.[a.id]?.total ?? 0,
          isStartArea: !targetAreaIds.has(a.id),
          onClick: handleAreaClick,
        },
      }));
    }
    if (level === 'detail' && mathNodes) {
      const startNodeIds = new Set(
        mathNodes.filter(n => n.prerequisites.length === 0).map(n => n.id)
      );
      return mathNodes.map(n => ({
        id: n.id,
        type: 'sphere',
        position: savedPositions?.[n.id] ?? n.position,
        data: {
          label: localize(locale, n.label, n.labels),
          number: n.number,
          description: localize(locale, n.description, n.descriptions),
          area: n.area,
          difficulty: n.difficulty,
          status: nodeStatuses?.[n.id] || 'locked',
          isStartNode: startNodeIds.has(n.id),
          onClick: handleNodeClick,
        },
      }));
    }
    return [];
  }, [level, areas, areaNodeCounts, handleAreaClick, mathNodes, nodeStatuses, handleNodeClick, locale, viewportKey, areaEdges]);

  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [hasCustomPositions, setHasCustomPositions] = useState(() => loadNodePositions(viewportKey) !== null);

  // Sync nodes when initialNodes change (e.g. progress update, locale change)
  // but preserve custom positions
  useMemo(() => {
    const savedPositions = loadNodePositions(viewportKey);
    setNodes(initialNodes.map(n => ({
      ...n,
      position: savedPositions?.[n.id] ?? n.position,
    })));
  }, [initialNodes, viewportKey]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes(prev => {
      const updated = applyNodeChanges(changes, prev);

      // Save positions on drag end
      const hasDragEnd = changes.some(c => c.type === 'position' && c.dragging === false);
      if (hasDragEnd) {
        const positions: Record<string, { x: number; y: number }> = {};
        for (const node of updated) {
          positions[node.id] = node.position;
        }
        saveNodePositions(viewportKey, positions);
        setHasCustomPositions(true);
      }

      return updated;
    });
  }, [viewportKey]);

  const handleReset = useCallback(() => {
    clearNodePositions(viewportKey);
    setHasCustomPositions(false);
    // Restore original positions
    setNodes(prev => {
      const origMap = level === 'area' && areas
        ? Object.fromEntries(areas.map(a => [a.id, a.position]))
        : level === 'detail' && mathNodes
          ? Object.fromEntries(mathNodes.map(n => [n.id, n.position]))
          : {};
      return prev.map(n => ({ ...n, position: origMap[n.id] ?? n.position }));
    });
  }, [viewportKey, level, areas, mathNodes]);

  const edges: Edge[] = useMemo(() => {
    const edgeList = level === 'area' ? areaEdges : mathEdges;
    if (!edgeList) return [];
    return edgeList.map(e => ({
      id: `${e.source}-${e.target}`,
      source: e.source,
      target: e.target,
      type: 'sphere',
    }));
  }, [level, areaEdges, mathEdges]);

  const handleMoveEnd = useCallback((_event: unknown, viewport: Viewport) => {
    saveViewport(viewport);
  }, [saveViewport]);

  const defaultViewport = savedViewport ?? undefined;
  const shouldFitView = !savedViewport;

  const fitViewOptions = useMemo(() => {
    if (!savedViewport) {
      if (level === 'area' && areas && areaEdges) {
        const targetAreaIds = new Set(areaEdges.map(e => e.target));
        const startAreaIds = areas.filter(a => !targetAreaIds.has(a.id)).map(a => a.id);
        if (startAreaIds.length > 0) {
          return {
            nodes: startAreaIds.map(id => ({ id })),
            padding: 0.5,
            maxZoom: 1.0,
          };
        }
      }
      if (level === 'detail' && mathNodes) {
        const startNodeIds = mathNodes
          .filter(n => n.prerequisites.length === 0)
          .map(n => n.id);
        if (startNodeIds.length > 0) {
          return {
            nodes: startNodeIds.map(id => ({ id })),
            padding: 0.5,
            maxZoom: 1.0,
          };
        }
      }
    }
    return { padding: 0.3 };
  }, [level, areas, areaEdges, mathNodes, savedViewport]);

  return (
    <div className="h-full w-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView={shouldFitView}
        fitViewOptions={fitViewOptions}
        defaultViewport={defaultViewport}
        onMoveEnd={handleMoveEnd}
        minZoom={0.3}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          color="currentColor"
          className="text-zinc-200 dark:text-zinc-800"
          gap={20}
        />
        <Controls
          showInteractive={false}
          className="!bg-white dark:!bg-zinc-800 !border-zinc-300 dark:!border-zinc-700 !shadow-lg [&>button]:!bg-white dark:[&>button]:!bg-zinc-800 [&>button]:!border-zinc-300 dark:[&>button]:!border-zinc-700 [&>button]:!text-zinc-600 dark:[&>button]:!text-zinc-300 [&>button:hover]:!bg-zinc-100 dark:[&>button:hover]:!bg-zinc-700"
        />
        <MiniMap
          nodeColor={(node) => {
            if (level === 'area') {
              return (node.data as { color: string }).color || '#a1a1aa';
            }
            const status = (node.data as { status: NodeStatus }).status;
            switch (status) {
              case 'completed': return '#10b981';
              case 'in_progress': return '#3b82f6';
              case 'available': return '#a1a1aa';
              default: return '#3f3f46';
            }
          }}
          className="!bg-zinc-100 dark:!bg-zinc-900 !border-zinc-300 dark:!border-zinc-700"
          maskColor="rgba(128, 128, 128, 0.3)"
        />
      </ReactFlow>
      {hasCustomPositions && (
        <button
          onClick={handleReset}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 rounded-md bg-zinc-700 dark:bg-zinc-600 px-3 py-1.5 text-xs text-white shadow-lg hover:bg-zinc-600 dark:hover:bg-zinc-500 transition-colors"
        >
          {t('common.resetLayout')}
        </button>
      )}
    </div>
  );
}
