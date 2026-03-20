'use client';

import { useCallback, useMemo } from 'react';
import type { Viewport } from '@xyflow/react';

export function useViewportPersistence(key: string) {
  const storageKey = `skillmap:viewport:${key}`;

  const savedViewport = useMemo<Viewport | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      return JSON.parse(raw) as Viewport;
    } catch {
      return null;
    }
  }, [storageKey]);

  const saveViewport = useCallback((viewport: Viewport) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(viewport));
    } catch {
      // ignore storage errors
    }
  }, [storageKey]);

  return { savedViewport, saveViewport };
}
