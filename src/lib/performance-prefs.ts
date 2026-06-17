/**
 * Runtime performance preferences for progressive degradation.
 * Desktop keeps full effects; mobile / reduced-motion / save-data get lighter paths.
 */

export interface PerformancePrefs {
  reducedMotion: boolean;
  reducedData: boolean;
  isMobile: boolean;
  /** Skip hero MP4 extraction — static end-state hero */
  useStaticHero: boolean;
  /** Skip WebGL Plasma (CSS gradients remain) */
  disablePlasma: boolean;
  /** Cap canvas / WebGL devicePixelRatio */
  canvasDprCap: number;
  /** Hero frame extraction rate */
  heroFrameRate: number;
  /** Max width when rasterizing video frames (0 = native) */
  heroExtractMaxWidth: number;
  /** Video preload strategy */
  heroVideoPreload: 'auto' | 'metadata';
  /** Disable InteractiveBackground parallax loop */
  disableBackgroundParallax: boolean;
}

const MOBILE_BREAKPOINT = 768;

function readReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function readReducedData(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-data: reduce)').matches) return true;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return conn?.saveData === true;
}

function readIsMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < MOBILE_BREAKPOINT;
}

/** Read prefs once on the client (call inside useEffect / event handlers). */
export function getPerformancePrefs(): PerformancePrefs {
  const reducedMotion = readReducedMotion();
  const reducedData = readReducedData();
  const isMobile = readIsMobile();

  const useStaticHero = reducedMotion || reducedData;
  const disablePlasma = reducedMotion || reducedData || isMobile;
  const disableBackgroundParallax = reducedMotion || isMobile;

  return {
    reducedMotion,
    reducedData,
    isMobile,
    useStaticHero,
    disablePlasma,
    canvasDprCap: isMobile ? 1.5 : 2,
    heroFrameRate: isMobile ? 8 : 12,
    heroExtractMaxWidth: isMobile ? 960 : 0,
    heroVideoPreload: isMobile || reducedData ? 'metadata' : 'auto',
    disableBackgroundParallax,
  };
}

/** Default prefs for SSR / first paint (assume desktop-capable). */
export function getDefaultPerformancePrefs(): PerformancePrefs {
  return {
    reducedMotion: false,
    reducedData: false,
    isMobile: false,
    useStaticHero: false,
    disablePlasma: false,
    canvasDprCap: 2,
    heroFrameRate: 12,
    heroExtractMaxWidth: 0,
    heroVideoPreload: 'auto',
    disableBackgroundParallax: false,
  };
}
