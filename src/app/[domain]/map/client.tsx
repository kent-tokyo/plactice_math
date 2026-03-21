'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SphereGrid from '@/components/sphere-grid/SphereGrid';
import { getAllGraphData, getAreaMeta, getAreaEdges, getNodesByArea, getDomains } from '@/data/graph';
import { computeNodeStatuses } from '@/lib/graph';
import { useTheme } from '@/hooks/useTheme';
import { useProgress } from '@/hooks/useProgress';
import { useSettings, type ContentLevel } from '@/hooks/useSettings';
import { useLocale } from '@/i18n/useLocale';
import { localize } from '@/i18n/localize';
import LanguageSelector from '@/components/shared/LanguageSelector';
import SearchBox from '@/components/shared/SearchBox';
import type { NodeStatus, AreaId } from '@/types';
import type { DomainId } from '@/types/domain';

function getInitialArea(domainId: DomainId): AreaId | null {
  if (typeof window === 'undefined') return null;
  const param = new URLSearchParams(window.location.search).get('area');
  const areas = getAreaMeta(domainId);
  const validAreaIds = new Set<string>(areas.map(a => a.id));
  return param && validAreaIds.has(param) ? param as AreaId : null;
}

export default function DomainMapClient({ domain }: { domain: string }) {
  const domainId = domain as DomainId;
  const { locale, t } = useLocale();

  const domains = getDomains();
  const domainMeta = domains.find(d => d.id === domainId);

  const graphData = useMemo(() => getAllGraphData(domainId), [domainId]);
  const areas = useMemo(() => getAreaMeta(domainId), [domainId]);
  const areaEdges = useMemo(() => getAreaEdges(domainId), [domainId]);

  const { progress } = useProgress(domainId);
  const { contentLevel, setContentLevel } = useSettings();
  const [selectedArea, setSelectedArea] = useState<AreaId | null>(() => getInitialArea(domainId));
  const { theme, toggleTheme } = useTheme();

  const nodeStatuses = useMemo<Record<string, NodeStatus>>(() => {
    const completedIds = new Set<string>();
    const inProgressIds = new Set<string>();
    for (const [nodeId, entry] of Object.entries(progress)) {
      if (entry.status === 'completed') completedIds.add(nodeId);
      if (entry.status === 'in_progress') inProgressIds.add(nodeId);
    }
    return Object.fromEntries(computeNodeStatuses(completedIds, inProgressIds, domainId));
  }, [progress, domainId]);

  const areaNodeCounts = useMemo(() => {
    const counts: Record<string, { completed: number; total: number }> = {};
    for (const area of areas) {
      const areaNodes = graphData.nodes.filter(n => n.area === area.id);
      const completed = areaNodes.filter(n => nodeStatuses[n.id] === 'completed').length;
      counts[area.id] = { completed, total: areaNodes.length };
    }
    return counts;
  }, [areas, graphData, nodeStatuses]);

  const detailData = useMemo(() => {
    if (!selectedArea) return null;
    return getNodesByArea(selectedArea, domainId);
  }, [selectedArea, domainId]);

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
    <div className="h-screen flex flex-col bg-white dark:bg-zinc-950">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-zinc-200 dark:border-zinc-800 px-4 py-2 md:px-6 md:py-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors text-sm">
            {t('common.backToDomains')}
          </Link>
          {selectedArea && (
            <button
              onClick={handleBack}
              className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors text-sm"
            >
              {t('common.backToOverview')}
            </button>
          )}
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {selectedArea
              ? (() => { const a = areas.find(a => a.id === selectedArea); return a ? localize(locale, a.label, a.labels) : localize(locale, domainMeta?.label || domainId, domainMeta?.labels); })()
              : localize(locale, domainMeta?.label || domainId, domainMeta?.labels)}
          </h1>
        </div>
        <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
          <span>
            {completedDisplay} / {totalCount} {t('common.completed')}
          </span>
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
                {t(`level.${level}`)}
              </button>
            ))}
          </div>
          <SearchBox />
          <LanguageSelector />
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500 dark:text-zinc-400"
            title={theme === 'dark' ? t('theme.toLight') : t('theme.toDark')}
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>
        </div>
      </header>
      <div className="flex-1 overflow-hidden">
        {selectedArea && detailData ? (
          <SphereGrid
            key={`detail-${selectedArea}`}
            level="detail"
            mathNodes={detailData.nodes}
            mathEdges={detailData.edges}
            nodeStatuses={nodeStatuses}
            viewportKey={`${domainId}:detail:${selectedArea}`}
            domain={domainId}
          />
        ) : (
          <SphereGrid
            key="area"
            level="area"
            areas={areas}
            areaEdges={areaEdges}
            areaNodeCounts={areaNodeCounts}
            onAreaClick={handleAreaClick}
            viewportKey={`${domainId}:area`}
          />
        )}
      </div>
    </div>
  );
}
