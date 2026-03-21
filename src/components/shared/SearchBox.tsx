'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocale } from '@/i18n/useLocale';
import { getContentBasePath } from '@/lib/content-manifest';

interface SearchEntry {
  nodeId: string;
  domain: string;
  label: string;
  labels?: { en?: string; zh?: string };
  area: string;
  number?: string;
  text: string;
  textEn?: string;
  textZh?: string;
}

interface SearchResult {
  entry: SearchEntry;
  snippet: string;
}

let cachedIndex: SearchEntry[] | null = null;

async function loadIndex(): Promise<SearchEntry[]> {
  if (cachedIndex) return cachedIndex;
  const base = getContentBasePath();
  const res = await fetch(`${base}/search-index.json`);
  cachedIndex = await res.json();
  return cachedIndex!;
}

const DOMAIN_COLORS: Record<string, string> = {
  math: 'bg-blue-500',
  philosophy: 'bg-violet-500',
  aws: 'bg-amber-500',
  cs: 'bg-cyan-500',
  chemistry: 'bg-green-500',
  accounting: 'bg-red-500',
};

function getLocalizedLabel(entry: SearchEntry, locale: string): string {
  if (locale === 'en' && entry.labels?.en) return entry.labels.en;
  if (locale === 'zh' && entry.labels?.zh) return entry.labels.zh;
  return entry.label;
}

function getLocalizedText(entry: SearchEntry, locale: string): string {
  if (locale === 'en' && entry.textEn) return entry.textEn;
  if (locale === 'zh' && entry.textZh) return entry.textZh;
  return entry.text;
}

function extractSnippet(text: string, query: string, maxLen = 80): string {
  const lower = text.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase());
  if (idx === -1) return text.slice(0, maxLen) + '...';
  const start = Math.max(0, idx - 30);
  const end = Math.min(text.length, idx + query.length + 50);
  let snippet = '';
  if (start > 0) snippet += '...';
  snippet += text.slice(start, end);
  if (end < text.length) snippet += '...';
  return snippet;
}

export default function SearchBox() {
  const { locale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const index = await loadIndex();
      const lower = q.toLowerCase();
      const matched: SearchResult[] = [];

      for (const entry of index) {
        const text = getLocalizedText(entry, locale);
        const label = getLocalizedLabel(entry, locale);
        if (label.toLowerCase().includes(lower) || text.toLowerCase().includes(lower)) {
          const snippet = label.toLowerCase().includes(lower)
            ? getLocalizedLabel(entry, locale)
            : extractSnippet(text, q);
          matched.push({ entry, snippet });
          if (matched.length >= 20) break;
        }
      }

      setResults(matched);
    } finally {
      setLoading(false);
    }
  }, [locale]);

  const handleChange = useCallback((value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 200);
  }, [search]);

  const handleOpen = useCallback(() => {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setQuery('');
    setResults([]);
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, handleClose]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [open, handleClose]);

  const basePath = getContentBasePath();

  if (!open) {
    return (
      <button
        onClick={handleOpen}
        className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500 dark:text-zinc-400"
        title={t('search.placeholder')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </button>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => handleChange(e.target.value)}
          placeholder={t('search.placeholder')}
          className="w-48 md:w-64 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 outline-none border-b border-zinc-300 dark:border-zinc-600 pb-0.5"
        />
        <button onClick={handleClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 text-sm ml-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {(query.length >= 2) && (
        <div className="absolute top-full right-0 mt-2 w-80 md:w-96 max-h-80 overflow-y-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-50">
          {loading && (
            <div className="p-3 text-sm text-zinc-400">{t('common.loading')}</div>
          )}
          {!loading && results.length === 0 && (
            <div className="p-3 text-sm text-zinc-400">{t('search.noResults')}</div>
          )}
          {results.map((r, i) => (
            <a
              key={`${r.entry.domain}-${r.entry.nodeId}-${i}`}
              href={`${basePath}/${r.entry.domain}/learn/${r.entry.nodeId}`}
              className="block px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 border-b border-zinc-100 dark:border-zinc-800 last:border-0"
            >
              <div className="flex items-center gap-2">
                <span className={`inline-block w-2 h-2 rounded-full ${DOMAIN_COLORS[r.entry.domain] || 'bg-zinc-400'}`} />
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {r.entry.number && <span className="text-zinc-400 mr-1">{r.entry.number}</span>}
                  {getLocalizedLabel(r.entry, locale)}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">{r.snippet}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
