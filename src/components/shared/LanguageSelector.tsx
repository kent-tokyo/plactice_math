'use client';

import { useLocale } from '@/i18n/useLocale';
import type { Locale } from '@/i18n/context';

const LOCALES: Locale[] = ['ja', 'en', 'zh'];

export default function LanguageSelector() {
  const { locale, setLocale, t } = useLocale();

  return (
    <div className="flex items-center rounded-md border border-zinc-200 dark:border-zinc-700 overflow-hidden">
      {LOCALES.map(l => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          className={`px-2 py-1 text-xs transition-colors ${
            locale === l
              ? 'bg-zinc-700 text-white dark:bg-zinc-300 dark:text-zinc-900'
              : 'bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          {t(`locale.${l}`)}
        </button>
      ))}
    </div>
  );
}
