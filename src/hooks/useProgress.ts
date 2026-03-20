'use client';

import { useCallback, useEffect, useState } from 'react';
import type { NodeStatus } from '@/types';

interface ProgressEntry {
  status: NodeStatus;
  startedAt: string | null;
  completedAt: string | null;
}

type ProgressData = Record<string, ProgressEntry>;

const STORAGE_KEY = 'plactice_math_progress';

function loadProgress(): ProgressData {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function persistProgress(data: ProgressData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useProgress() {
  const [progress, setProgress] = useState<ProgressData>({});

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const updateProgress = useCallback((nodeId: string, status: NodeStatus) => {
    setProgress(prev => {
      const now = new Date().toISOString();
      const existing = prev[nodeId];
      const updated: ProgressData = {
        ...prev,
        [nodeId]: {
          status,
          startedAt:
            (status === 'in_progress' || status === 'completed') && !existing?.startedAt
              ? now
              : existing?.startedAt ?? null,
          completedAt: status === 'completed' ? now : existing?.completedAt ?? null,
        },
      };
      persistProgress(updated);
      return updated;
    });
  }, []);

  const resetProgress = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setProgress({});
  }, []);

  return { progress, updateProgress, resetProgress };
}
