'use client';

import { useSyncExternalStore } from 'react';
import {
  getPerformancePrefs,
  getDefaultPerformancePrefs,
  type PerformancePrefs,
} from '@/lib/performance-prefs';

function subscribe(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => {};

  const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const dataMq = window.matchMedia('(prefers-reduced-data: reduce)');

  const handler = () => onStoreChange();
  motionMq.addEventListener('change', handler);
  dataMq.addEventListener('change', handler);
  window.addEventListener('resize', handler);

  return () => {
    motionMq.removeEventListener('change', handler);
    dataMq.removeEventListener('change', handler);
    window.removeEventListener('resize', handler);
  };
}

function getSnapshot(): PerformancePrefs {
  return getPerformancePrefs();
}

function getServerSnapshot(): PerformancePrefs {
  return getDefaultPerformancePrefs();
}

export function usePerformancePrefs(): PerformancePrefs {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
