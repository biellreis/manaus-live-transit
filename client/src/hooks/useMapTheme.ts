import { useEffect, useSyncExternalStore, type RefObject } from 'react';
import type { Map, RasterLayerSpecification } from 'maplibre-gl';

let dark = true;
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
export function toggleMapTheme() {
  dark = !dark;
  listeners.forEach(listener => listener());
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
