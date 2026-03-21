'use client';

import { Handle, Position } from '@xyflow/react';
import { useLocale } from '@/i18n/useLocale';

interface AreaNodeData {
  label: string;
  description: string;
  color: string;
  completedCount: number;
  totalCount: number;
  isStartArea?: boolean;
  onClick: (areaId: string) => void;
  [key: string]: unknown;
}

export default function AreaNode({ id, data }: { id: string; data: AreaNodeData }) {
  const { label, description, color, completedCount, totalCount, isStartArea, onClick } = data;
  const { t } = useLocale();
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div
      className={`relative rounded-xl border-2 border-zinc-700 dark:border-zinc-700 border-zinc-300 bg-white dark:bg-zinc-800/90 px-6 py-5 min-w-[220px] max-w-[260px] cursor-pointer transition-all hover:shadow-lg dark:hover:shadow-lg hover:shadow-zinc-200 dark:hover:shadow-black/30 hover:scale-[1.02] ${isStartArea ? 'ring-2 ring-blue-400/50' : ''}`}
      onClick={() => onClick(id)}
      style={{ borderColor: color }}
    >
      {isStartArea && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-bold leading-none whitespace-nowrap">
          START
        </div>
      )}
      <Handle type="target" position={Position.Left} className="!bg-zinc-400 dark:!bg-zinc-600 !w-2 !h-2" />
      <Handle type="source" position={Position.Right} className="!bg-zinc-400 dark:!bg-zinc-600 !w-2 !h-2" />

      <div className="flex items-center gap-2 mb-2">
        <span
          className="inline-block w-3 h-3 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">{label}</span>
      </div>

      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 leading-relaxed">{description}</p>

      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${progress}%`, backgroundColor: color }}
          />
        </div>
        <span className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
          {completedCount}/{totalCount} {t('common.completed')}
        </span>
      </div>
    </div>
  );
}
