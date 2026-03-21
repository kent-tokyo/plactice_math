'use client';

import type { Term } from '@/types';
import MathText from '@/components/shared/MathText';
import { useLocale } from '@/i18n/useLocale';

export default function TermList({ terms }: { terms: Term[] }) {
  const { t } = useLocale();
  if (terms.length === 0) return null;

  return (
    <section>
      <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">{t('learn.termList')}</h2>
      <div className="space-y-3">
        {terms.map((term) => (
          <div key={term.term} className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4">
            <div className="flex items-baseline gap-3 mb-1">
              <MathText text={term.term} className="font-semibold text-zinc-900 dark:text-zinc-100" />
              <span className="text-xs text-zinc-500 dark:text-zinc-400">{term.reading}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 italic">{term.en}</span>
            </div>
            <MathText text={term.definition} className="text-sm text-zinc-600 dark:text-zinc-400" />
          </div>
        ))}
      </div>
    </section>
  );
}
