'use client';

import { useCallback, useMemo, useState } from 'react';
import SphereGrid from '@/components/sphere-grid/SphereGrid';
import { getAllGraphData, getAreaMeta, getAreaEdges, getNodesByArea } from '@/data/graph';
import { computeNodeStatuses } from '@/lib/graph';
import { useTheme } from '@/hooks/useTheme';
import { useProgress } from '@/hooks/useProgress';
import { useSettings, type ContentLevel } from '@/hooks/useSettings';
import type { NodeStatus, AreaId } from '@/types';

const graphData = getAllGraphData();
const areas = getAreaMeta();
const areaEdges = getAreaEdges();
const validAreaIds = new Set<string>(areas.map(a => a.id));

const LEVEL_LABELS: Record<ContentLevel, string> = {
  beginner: '初心者',
  standard: '標準',
  advanced: '上級者',
};

function getInitialArea(): AreaId | null {
  if (typeof window === 'undefined') return null;
  const param = new URLSearchParams(window.location.search).get('area');
  return param && validAreaIds.has(param) ? param as AreaId : null;
}

export default function MapPage() {
  const { progress } = useProgress();
  const { contentLevel, setContentLevel } = useSettings();
  const [selectedArea, setSelectedArea] = useState<AreaId | null>(getInitialArea);
  const { theme, toggleTheme } = useTheme();

  const nodeStatuses = useMemo<Record<string, NodeStatus>>(() => {
    const completedIds = new Set<string>();
    const inProgressIds = new Set<string>();
    for (const [nodeId, entry] of Object.entries(progress)) {
      if (entry.status === 'completed') completedIds.add(nodeId);
      if (entry.status === 'in_progress') inProgressIds.add(nodeId);
    }
    return Object.fromEntries(computeNodeStatuses(completedIds, inProgressIds));
  }, [progress]);

  const areaNodeCounts = useMemo(() => {
    const counts: Record<string, { completed: number; total: number }> = {};
    for (const area of areas) {
      const areaNodes = graphData.nodes.filter(n => n.area === area.id);
      const completed = areaNodes.filter(n => nodeStatuses[n.id] === 'completed').length;
      counts[area.id] = { completed, total: areaNodes.length };
    }
    return counts;
  }, [nodeStatuses]);

  const detailData = useMemo(() => {
    if (!selectedArea) return null;
    return getNodesByArea(selectedArea);
  }, [selectedArea]);

  const handleAreaClick = useCallback((areaId: string) => {
    setSelectedArea(areaId as AreaId);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedArea(null);
  }, []);

  const completedCount = Object.values(nodeStatuses).filter(s => s === 'completed').length;
  const totalCount = selectedArea
    ? (areaNodeCounts[selectedArea]?.total ?? 0)
    : graphData.nodes.length;
  const completedDisplay = selectedArea
    ? (areaNodeCounts[selectedArea]?.completed ?? 0)
    : completedCount;

  return (
    <div className="h-screen bg-white dark:bg-zinc-950">
      <header className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-6 py-3">
        <div className="flex items-center gap-3">
          {selectedArea && (
            <button
              onClick={handleBack}
              className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors text-sm"
            >
              ← 全体マップ
            </button>
          )}
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {selectedArea
              ? areas.find(a => a.id === selectedArea)?.label ?? 'plactice_math'
              : 'plactice_math'}
          </h1>
        </div>
        <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
          <span>
            {completedDisplay} / {totalCount} 完了
          </span>
          {/* Content level toggle */}
          <div className="flex items-center rounded-md border border-zinc-200 dark:border-zinc-700 overflow-hidden">
            {(['beginner', 'standard', 'advanced'] as ContentLevel[]).map(level => (
              <button
                key={level}
                onClick={() => setContentLevel(level)}
                className={`px-2 py-1 text-xs transition-colors ${
                  contentLevel === level
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                {LEVEL_LABELS[level]}
              </button>
            ))}
          </div>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500 dark:text-zinc-400"
            title={theme === 'dark' ? 'ライトモードに切替' : 'ダークモードに切替'}
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>
        </div>
      </header>
      <div className="h-[calc(100vh-53px)]">
        {selectedArea && detailData ? (
          <SphereGrid
            key={`detail-${selectedArea}`}
            level="detail"
            mathNodes={detailData.nodes}
            mathEdges={detailData.edges}
            nodeStatuses={nodeStatuses}
            viewportKey={`detail:${selectedArea}`}
          />
        ) : (
          <SphereGrid
            key="area"
            level="area"
            areas={areas}
            areaEdges={areaEdges}
            areaNodeCounts={areaNodeCounts}
            onAreaClick={handleAreaClick}
            viewportKey="area"
          />
        )}
      </div>
    </div>
  );
}
