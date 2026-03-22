'use client';

import type { Quote } from '@/types';

export default function QuoteList({ quotes }: { quotes?: Quote[] }) {
  if (!quotes || quotes.length === 0) return null;

  return (
    <section className="space-y-3">
      {quotes.map((quote, i) => (
        <blockquote
          key={i}
          className="border-l-4 border-blue-400 dark:border-blue-600 pl-4 py-2"
        >
          <p className="text-zinc-700 dark:text-zinc-300 italic">
            &ldquo;{quote.text}&rdquo;
          </p>
          <footer className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            &mdash; {quote.author}
            {quote.source && <span className="ml-1">({quote.source})</span>}
          </footer>
        </blockquote>
      ))}
    </section>
  );
}
