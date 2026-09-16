import { useEffect, useSyncExternalStore, type RefObject } from 'react';
import type { Map, RasterLayerSpecification } from 'maplibre-gl';

function getSystemPrefersDark(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return true;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// Initial state reflects system preference directly
let dark = getSystemPrefersDark();
const listeners = new Set<() => void>();

function syncDomTheme(isDark: boolean) {
  if (typeof document === 'undefined') return;
  const theme = isDark ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.classList.toggle('dark-theme', isDark);
  document.documentElement.classList.toggle('light-theme', !isDark);

  // Sync mobile browser status bar & chrome bar color
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', isDark ? '#09090B' : '#FFFFFF');
  }
}

// Initial sync on load
if (typeof window !== 'undefined') {
  syncDomTheme(dark);

  // Listen to system OS changes (automatic day/night or user changing phone settings)
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      dark = e.matches;
      syncDomTheme(dark);
      listeners.forEach(listener => listener());
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
    } else if ((mediaQuery as any).addListener) {
      (mediaQuery as any).addListener(handleMediaChange);
    }
  }
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};

export function toggleMapTheme() {
  dark = !dark;
  syncDomTheme(dark);
  listeners.forEach(listener => listener());
}

export function useAppTheme(): boolean {
  return useSyncExternalStore(subscribe, () => dark, () => true);
}

export function rasterThemePaint(isDark: boolean): RasterLayerSpecification['paint'] {
  // Apply the night palette only to base tiles. Route and marker colors stay intact.
  return {
    'raster-saturation': isDark ? -1 : 0,
    'raster-brightness-min': isDark ? 0.85 : 0,
    'raster-brightness-max': isDark ? 0.05 : 1,
  };
}

// Call after the map initialization effect so the instance exists on mount.
export function useMapTheme(map: RefObject<Map | null>) {
  const isDark = useSyncExternalStore(subscribe, () => dark, () => true);
  useEffect(() => {
    const instance = map.current;
    if (!instance) return;
    const apply = () => {
      for (const layer of instance.getStyle()?.layers || []) {
        if (layer.type !== 'raster') continue;
        instance.setPaintProperty(layer.id, 'raster-saturation', isDark ? -1 : 0);
        instance.setPaintProperty(layer.id, 'raster-brightness-min', isDark ? 0.85 : 0);
        instance.setPaintProperty(layer.id, 'raster-brightness-max', isDark ? 0.05 : 1);
      }
    };
    instance.on('style.load', apply);
    apply();
    return () => { instance.off('style.load', apply); };
  }, [isDark, map]);
  return isDark;
}

