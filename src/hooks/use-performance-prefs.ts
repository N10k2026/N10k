'use client';

import { useSyncExternalStore } from 'react';
import {
  getPerformancePrefs,
  getDefaultPerformancePrefs,
  type PerformancePrefs,
} from '@/lib/performance-prefs';

const SERVER_SNAPSHOT = getDefaultPerformancePrefs();

let cachedSnapshot: PerformancePrefs = SERVER_SNAPSHOT;
let cachedSnapshotKey = '';

function prefsCacheKey(prefs: PerformancePrefs): string {
  return [
    prefs.reducedMotion,
    prefs.reducedData,
    prefs.isMobile,
    prefs.useStaticHero,
    prefs.disablePlasma,
    prefs.canvasDprCap,
    prefs.heroFrameRate,
    prefs.heroExtractMaxWidth,
    prefs.heroVideoPreload,
    prefs.disableBackgroundParallax,
  ].join('|');
}

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
  const next = getPerformancePrefs();
  const key = prefsCacheKey(next);
  if (key !== cachedSnapshotKey) {
    cachedSnapshotKey = key;
    cachedSnapshot = next;
  }
  return cachedSnapshot;
}

function getServerSnapshot(): PerformancePrefs {
  return SERVER_SNAPSHOT;
}

export function usePerformancePrefs(): PerformancePrefs {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
