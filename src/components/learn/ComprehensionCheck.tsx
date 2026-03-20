'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { NodeStatus, AreaId } from '@/types';

interface ComprehensionCheckProps {
  nodeId: string;
  status: NodeStatus;
  area: AreaId;
  onUpdateProgress: (nodeId: string, status: NodeStatus) => void;
}

export default function ComprehensionCheck({ nodeId, status, area, onUpdateProgress }: ComprehensionCheckProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const mapUrl = `/map?area=${area}`;

  const handleComplete = () => {
    setLoading(true);
    onUpdateProgress(nodeId, 'completed');
    window.location.href = mapUrl;
  };

  const handleStartLearning = () => {
    setLoading(true);
    onUpdateProgress(nodeId, 'in_progress');
    setLoading(false);
  };

  if (status === 'completed') {
    return (
      <div className="rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 p-6 text-center">
        <p className="text-emerald-700 dark:text-emerald-300 font-semibold">この概念は理解済みです</p>
        <button
          onClick={() => router.push(mapUrl)}
          className="mt-3 rounded-md bg-emerald-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
        >
          マップに戻る
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-6">
      <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-3">理解度チェック</h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
        この概念の内容を理解できましたか？理解できたら「理解した」を押して次の概念に進みましょう。
      </p>
      <div className="flex gap-3">
        {status !== 'in_progress' && (
          <button
            onClick={handleStartLearning}
            disabled={loading}
            className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-6 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-50"
          >
            学習中にする
          </button>
        )}
        <button
          onClick={handleComplete}
          disabled={loading}
          className="rounded-md bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? '処理中...' : 'この概念を理解した'}
        </button>
      </div>
    </div>
  );
}
