'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ConceptView from '@/components/learn/ConceptView';
import TermList from '@/components/learn/TermList';
import ComprehensionCheck from '@/components/learn/ComprehensionCheck';
import { useContent } from '@/hooks/useContent';
import { useProgress } from '@/hooks/useProgress';
import { useSettings, type ContentLevel } from '@/hooks/useSettings';
import { getNode } from '@/lib/graph';

const LEVEL_LABELS: Record<ContentLevel, string> = {
  beginner: '初心者',
  standard: '標準',
  advanced: '上級者',
};

export default function LearnPageClient({ nodeId }: { nodeId: string }) {
  const router = useRouter();

  const node = useMemo(() => getNode(nodeId), [nodeId]);
  const { contentLevel, setContentLevel } = useSettings();
  const { progress, updateProgress } = useProgress();
  const { data, illustrationUrl, loading, error, resolvedLevel, availableLevels } = useContent(nodeId, contentLevel);

  const status = progress[nodeId]?.status ?? 'available';

  if (!node) {
    router.replace('/map');
    return null;
  }

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-white dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 dark:border-zinc-600 border-t-blue-500" />
        <p>コンテンツを読み込んでいます...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-white dark:bg-zinc-950">
        <p className="text-zinc-500 dark:text-zinc-400">コンテンツが見つかりませんでした。</p>
        <Link
          href={`/map?area=${node.area}`}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 transition-colors"
        >
          マップに戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <header className="sticky top-0 z-10 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm px-6 py-3">
        <div className="mx-auto max-w-3xl flex items-center gap-4">
          <Link href={`/map?area=${node.area}`} className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">
            ← マップに戻る
          </Link>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{node.label}</h1>
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            {'★'.repeat(node.difficulty)} · {node.description}
          </span>
          {availableLevels.length > 1 && (
            <div className="ml-auto flex items-center rounded-md border border-zinc-200 dark:border-zinc-700 overflow-hidden">
              {(['beginner', 'standard', 'advanced'] as ContentLevel[])
                .filter(l => availableLevels.includes(l))
                .map(level => (
                  <button
                    key={level}
                    onClick={() => setContentLevel(level)}
                    className={`px-2 py-1 text-xs transition-colors ${
                      resolvedLevel === level
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {LEVEL_LABELS[level]}
                  </button>
                ))}
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8 space-y-10">
        <ConceptView
          content={data.content}
          diagrams={data.diagrams}
          illustrationUrl={illustrationUrl}
          label={node.label}
        />

        <TermList terms={data.terms} />

        <ComprehensionCheck
          nodeId={nodeId}
          status={status}
          area={node.area}
          onUpdateProgress={updateProgress}
        />
      </main>
    </div>
  );
}
