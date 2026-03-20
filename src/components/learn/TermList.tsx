'use client';

import type { Term } from '@/types';

export default function TermList({ terms }: { terms: Term[] }) {
  if (terms.length === 0) return null;

  return (
    <section>
      <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">用語一覧</h2>
      <div className="space-y-3">
        {terms.map((t) => (
          <div key={t.term} className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4">
            <div className="flex items-baseline gap-3 mb-1">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">{t.term}</span>
              <span className="text-xs text-zinc-400 dark:text-zinc-500">{t.reading}</span>
              <span className="text-xs text-zinc-400 dark:text-zinc-500 italic">{t.en}</span>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{t.definition}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
