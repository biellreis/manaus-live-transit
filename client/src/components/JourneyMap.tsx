import { useMapTheme, rasterThemePaint } from '../hooks/useMapTheme.js';
import React, { useEffect, useRef, useState } from 'react';
import { Map as MapLibreMap, Marker, NavigationControl } from 'maplibre-gl';
import type { TransitOption } from '../types/transit.js';
import { resolveStreetWalkingPath } from '../utils/walkingRoute.js';

type Point = { name: string; lat: number; lng: number };

export type MapStyleType = 'google_roadmap' | 'google_satellite';

interface JourneyMapProps {
  option?: TransitOption | null;
  origin: Point;
  destination: Point;
  userLocation?: { lat: number; lng: number; isRealGPS?: boolean } | null;
}

export const JourneyMap: React.FC<JourneyMapProps> = ({
  option,
  origin,
  destination,
  userLocation
}) => {
  const container = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const userGpsMarkerRef = useRef<Marker | null>(null);
  const lastRenderedKeyRef = useRef<string>('');
  const lastFittedKeyRef = useRef<string>('');
  const [activeStyle] = useState<MapStyleType>('google_roadmap');

  const optionRef = useRef(option);
  const originRef = useRef(origin);
  const destRef = useRef(destination);

  useEffect(() => {
    optionRef.current = option;
    originRef.current = origin;
    destRef.current = destination;
  }, [option, origin, destination]);

  const getRouteKey = (opt?: TransitOption | null, o?: Point, d?: Point) => {
    if (!opt) return `empty_${o?.lat.toFixed(4)}_${o?.lng.toFixed(4)}_${d?.lat.toFixed(4)}_${d?.lng.toFixed(4)}`;
    const legKey = (opt.legs || []).map(l => `${l.type}_${l.lineCode || ''}`).join(';');
    const verifiedKey = (opt.verifiedLegs || []).map(l => `${l.line?.code || ''}_${l.originStop?.stopId}_${l.destStop?.stopId}`).join(';');
    return `${opt.id || opt.primaryLineCode}_${opt.totalMinutes}_${opt.fare || ''}_${legKey}_${verifiedKey}_${o?.lat.toFixed(4)}_${o?.lng.toFixed(4)}_${d?.lat.toFixed(4)}_${d?.lng.toFixed(4)}`;
  };

  const getStyleDefinition = (styleType: MapStyleType) => {
    if (styleType === 'google_roadmap') {
      return {
        version: 8,
        sources: {
          'google-roadmap': {
            type: 'raster',
            tiles: [
              'https://mt0.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
              'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
              'https://mt2.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
              'https://mt3.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
            ],
            tileSize: 256,
            maxzoom: 22
          }
        },
        layers: [
          {
            id: 'google-roadmap-layer',
            type: 'raster',
            paint: rasterThemePaint(true),
            source: 'google-roadmap',
            minzoom: 0,
            maxzoom: 22
          }
        ]
      };
    }

    if (styleType === 'google_satellite') {
      return {
        version: 8,
        sources: {
          'google-satellite': {
            type: 'raster',
            tiles: [
              'https://mt0.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
              'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
              'https://mt2.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
              'https://mt3.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
            ],
            tileSize: 256,
            maxzoom: 22
          }
        },
        layers: [
          {
            id: 'google-satellite-layer',
            type: 'raster',
            paint: rasterThemePaint(true),
            source: 'google-satellite',
            minzoom: 0,
            maxzoom: 22
          }
        ]
      };
    }

    // Default Google Maps Roadmap
    return {
      version: 8,
      sources: {
        'google-roadmap': {
          type: 'raster',
          tiles: [
            'https://mt0.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
            'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
            'https://mt2.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
            'https://mt3.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
          ],
          tileSize: 256,
          maxzoom: 22
        }
      },
      layers: [
        {
          id: 'google-roadmap-layer',
          type: 'raster',
          source: 'google-roadmap',
          minzoom: 0,
          maxzoom: 22
        }
      ]
    };
  };

  // Initialize Map
  useEffect(() => {
    if (!container.current) return;

    const map = new MapLibreMap({
      container: container.current,
      center: [origin.lng, origin.lat],
      zoom: 13.5,
      minZoom: 8,
      maxZoom: 22,
      pitch: 0,
      bearing: 0,
      attributionControl: false,
      dragPan: true,
      scrollZoom: true,
      boxZoom: true,
      dragRotate: false,
      touchZoomRotate: true,
      doubleClickZoom: true,
      touchPitch: false,
      style: getStyleDefinition(activeStyle) as any
    });

    const nav = new NavigationControl({ showCompass: false });
    map.addControl(nav, 'top-right');

    map.on('load', () => {
      renderRouteData(map);
    });

    mapInstance.current = map;

    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    resizeObserver.observe(container.current);

    return () => {
      resizeObserver.disconnect();
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      if (userGpsMarkerRef.current) {
        userGpsMarkerRef.current.remove();
        userGpsMarkerRef.current = null;
      }
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  useMapTheme(mapInstance);

  // Handle layer style change
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    map.setStyle(getStyleDefinition(activeStyle) as any);
    map.once('style.load', () => {
      renderRouteData(map);
    });
  }, [activeStyle]);

  // Dedicated live User GPS marker update (does not flicker route lines or hijack camera zoom)
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !userLocation?.lat || !userLocation?.lng) return;

    if (!userGpsMarkerRef.current) {
      const el = document.createElement('div');
      el.className = 'user-gps-marker';
      el.innerHTML = `
        <div class="user-gps-pulse"></div>
        <div class="user-gps-dot"></div>
      `;
      userGpsMarkerRef.current = new Marker({ element: el, anchor: 'center' })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map);
    } else {
      userGpsMarkerRef.current.setLngLat([userLocation.lng, userLocation.lat]);
    }
  }, [userLocation?.lat, userLocation?.lng]);

  // Handle route option changes - guarded by route key to prevent unnecessary redraws
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    const currentKey = getRouteKey(option, origin, destination);
    if (currentKey === lastRenderedKeyRef.current) {
      return;
    }

    if (map.isStyleLoaded()) {
      renderRouteData(map, currentKey);
    } else {
      map.once('load', () => renderRouteData(map, currentKey));
    }
  }, [option, origin.lat, origin.lng, destination.lat, destination.lng]);

  const renderRouteData = (map: MapLibreMap, currentKey?: string) => {
    const key = currentKey || getRouteKey(optionRef.current ?? option, originRef.current ?? origin, destRef.current ?? destination);
    lastRenderedKeyRef.current = key;

    const currentOption = optionRef.current ?? option;
    const currentOrigin = originRef.current ?? origin;
    const currentDest = destRef.current ?? destination;

    // Clear old route markers (except live user GPS marker)
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const activeSourceIds = new Set<string>();
    const allCoords: [number, number][] = [];

    const isTerminalOrStation = (name: string): boolean => {
      const upper = (name || '').toUpperCase().trim();
      return (
        upper.includes('TERMINAL') ||
        upper.includes('ESTAÇÃO') ||
        upper.includes('ESTACAO') ||
        upper.includes('PLATAFORMA') ||
        /\bT[1-6]\b/.test(upper) ||
        /\bE[1-6]\b/.test(upper)
      );
    };

    const isOrigTerminal = isTerminalOrStation(currentOrigin.name);
    const isDestTerminal = isTerminalOrStation(currentDest.name);

    if (currentOption && currentOption.legs) {
      currentOption.legs.forEach((leg, idx) => {
        const isWalkOrigin = leg.type === 'walk_origin';
        const isWalkDest = leg.type === 'walk_dest';
        const isBus = leg.type === 'bus';

        // Se for caminhada de partida e a origem for Terminal/Estação, NÃO desenha a linha branca
        if (isWalkOrigin && isOrigTerminal) return;

        // Se for caminhada de chegada e o destino for Terminal/Estação, NÃO desenha a linha branca
        if (isWalkDest && isDestTerminal) return;

        let coords: [number, number][] = Array.isArray(leg.coordinates) ? leg.coordinates : [];
        if (isBus && coords.length < 2 && currentOption.originStop && currentOption.destStop) {
          coords = [[currentOption.originStop.lng, currentOption.originStop.lat], [currentOption.destStop.lng, currentOption.destStop.lat]];
        }

        if (!coords || coords.length < 1) return;

        const validCoords: [number, number][] = coords.length === 1
          ? [coords[0], coords[0]]
          : coords;

        validCoords.forEach(c => allCoords.push(c));
        const sourceId = `route-leg-${idx}`;
        const casingId = `route-leg-${idx}-casing`;
        const isWalk = isWalkOrigin || isWalkDest || leg.type === 'transfer_hub';
        activeSourceIds.add(sourceId);

        const geojsonData: any = {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: validCoords
          }
        };

        const existingSource = map.getSource(sourceId) as any;
        if (existingSource && typeof existingSource.setData === 'function') {
          existingSource.setData(geojsonData);
        } else {
          map.addSource(sourceId, {
            type: 'geojson',
            data: geojsonData
          });

          // Casing for contrast
          map.addLayer({
            id: casingId,
            type: 'line',
            source: sourceId,
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: {
              'line-color': '#000000',
              'line-width': isBus ? 10 : 8,
              'line-opacity': 0.95
            }
          });

          // Core line (Azul para ônibus, Branco puro destacado para caminhada e troca)
          map.addLayer({
            id: sourceId,
            type: 'line',
            source: sourceId,
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: {
              'line-color': isBus ? '#2563EB' : '#FFFFFF',
              'line-width': isBus ? 6.5 : 4.5,
              'line-opacity': 1.0,
              ...(isWalk ? { 'line-dasharray': [1.8, 1.6] } : {})
            }
          });
        }

        // Resolução dinâmica de caminhada pelas ruas reais (OSRM) caso venha em linha reta
        if (isWalk && validCoords.length <= 2 && !(isWalkOrigin && isOrigTerminal) && !(isWalkDest && isDestTerminal)) {
          const fromPt = isWalkOrigin
            ? [currentOrigin.lng, currentOrigin.lat]
            : [currentOption.destStop?.lng, currentOption.destStop?.lat];
          const toPt = isWalkOrigin
            ? [currentOption.originStop?.lng, currentOption.originStop?.lat]
            : [currentDest.lng, currentDest.lat];

          if (fromPt[0] && fromPt[1] && toPt[0] && toPt[1]) {
            resolveStreetWalkingPath(fromPt[0], fromPt[1], toPt[0], toPt[1]).then((res) => {
              if (res?.coordinates && res.coordinates.length >= 2) {
                const src = map.getSource(sourceId) as any;
                if (src && typeof src.setData === 'function') {
                  src.setData({
                    type: 'Feature',
                    properties: {},
                    geometry: {
                      type: 'LineString',
                      coordinates: res.coordinates
                    }
                  });
                }
              }
            }).catch(() => {});
          }
        }
      });
    }

    // Clean up leftover layers and sources from previous routes that had more legs
    const currentStyle = map.getStyle();
    if (currentStyle?.layers) {
      currentStyle.layers.forEach(layer => {
        if (layer.id.startsWith('route-leg-')) {
          const baseSourceId = layer.id.replace('-casing', '');
          if (!activeSourceIds.has(baseSourceId) && map.getLayer(layer.id)) {
            map.removeLayer(layer.id);
          }
        }
      });
    }
    if (currentStyle?.sources) {
      Object.keys(currentStyle.sources).forEach(sourceId => {
        if (sourceId.startsWith('route-leg-') && !activeSourceIds.has(sourceId) && map.getSource(sourceId)) {
          map.removeSource(sourceId);
        }
      });
    }

    // 1. Origin Marker (rendered only if origin is NOT a Terminal/Station)
    if (!isOrigTerminal && currentOrigin.name) {
      const origEl = document.createElement('div');
      origEl.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center;">
          <div style="background: #FFFFFF; color: #000000; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 8px; white-space: nowrap; box-shadow: 0 4px 14px rgba(0,0,0,0.6); border: 1.5px solid rgba(0,0,0,0.15);">
            Partida: ${currentOrigin.name}
          </div>
          <div style="width: 10px; height: 10px; border-radius: 50%; background: #FFFFFF; border: 2.5px solid #000000; margin-top: 2px;"></div>
        </div>
      `;
      const origMarker = new Marker({ element: origEl, anchor: 'bottom' })
        .setLngLat([currentOrigin.lng, currentOrigin.lat])
        .addTo(map);
      markersRef.current.push(origMarker);
    }

    // 2. Nearest Boarding Stop Marker
    if (currentOption?.originStop) {
      const boardEl = document.createElement('div');
      boardEl.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <div style="background: #2563EB; color: #FFFFFF; font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 6px; white-space: nowrap; box-shadow: 0 3px 10px rgba(0,0,0,0.7); border: 1.5px solid #FFFFFF;">
            ${currentOption.originStop.stopName}
          </div>
          <div style="width: 10px; height: 10px; border-radius: 50%; background: #2563EB; border: 2.5px solid #FFFFFF; margin-top: 2px;"></div>
        </div>
      `;
      const boardMarker = new Marker({ element: boardEl, anchor: 'bottom' })
        .setLngLat([currentOption.originStop.lng, currentOption.originStop.lat])
        .addTo(map);
      markersRef.current.push(boardMarker);
    }

    // 2.5. Marker for Transfer Stop with White Icon
    if (currentOption?.verifiedLegs && currentOption.verifiedLegs.length > 1) {
      const transferStop = currentOption.verifiedLegs[0].destStop;
      allCoords.push([transferStop.lng, transferStop.lat]);

      const transferEl = document.createElement('div');
      transferEl.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <div style="background: #18181B; color: #FFFFFF; font-size: 11px; font-weight: 800; padding: 4px 9px; border-radius: 8px; white-space: nowrap; box-shadow: 0 4px 14px rgba(0,0,0,0.8); border: 2px solid #FFFFFF; display: flex; align-items: center; gap: 6px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="m16 3 4 4-4 4"/>
              <path d="M20 7H4"/>
              <path d="m8 21-4-4 4-4"/>
              <path d="M4 17h16"/>
            </svg>
            <span>Troca de ônibus: ${transferStop.stopName}</span>
          </div>
          <div style="width: 12px; height: 12px; border-radius: 50%; background: #18181B; border: 3px solid #FFFFFF; margin-top: 2px; box-shadow: 0 2px 6px rgba(0,0,0,0.6);"></div>
        </div>
      `;
      const transferMarker = new Marker({ element: transferEl, anchor: 'bottom' })
        .setLngLat([transferStop.lng, transferStop.lat])
        .addTo(map);
      markersRef.current.push(transferMarker);
    }

    // 3. Nearest Destination Stop Marker
    if (currentOption?.destStop) {
      const destStopEl = document.createElement('div');
      destStopEl.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <div style="background: #EA580C; color: #FFFFFF; font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 6px; white-space: nowrap; box-shadow: 0 3px 10px rgba(0,0,0,0.7); border: 1.5px solid #FFFFFF;">
            ${currentOption.destStop.stopName}
          </div>
          <div style="width: 10px; height: 10px; border-radius: 50%; background: #EA580C; border: 2.5px solid #FFFFFF; margin-top: 2px;"></div>
        </div>
      `;
      const destStopMarker = new Marker({ element: destStopEl, anchor: 'bottom' })
        .setLngLat([currentOption.destStop.lng, currentOption.destStop.lat])
        .addTo(map);
      markersRef.current.push(destStopMarker);
    }

    // 4. Final Destination Marker (rendered only if destination is NOT a Terminal/Station)
    if (!isDestTerminal && currentDest.name) {
      const destEl = document.createElement('div');
      destEl.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center;">
          <div style="background: #000000; color: #FFFFFF; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 6px; white-space: nowrap; box-shadow: 0 3px 10px rgba(0,0,0,0.7); border: 1.5px solid #FFFFFF;">
            Destino: ${currentDest.name}
          </div>
          <div style="width: 8px; height: 8px; border-radius: 50%; background: #FFFFFF; border: 2px solid #EA580C; margin-top: 2px;"></div>
        </div>
      `;
      const destMarker = new Marker({ element: destEl, anchor: 'bottom' })
        .setLngLat([currentDest.lng, currentDest.lat])
        .addTo(map);
      markersRef.current.push(destMarker);
    }

    // Fit camera smoothly around all coordinates ONCE per route key
    if (lastFittedKeyRef.current !== key) {
      lastFittedKeyRef.current = key;

      allCoords.push([currentOrigin.lng, currentOrigin.lat], [currentDest.lng, currentDest.lat]);
      if (currentOption?.originStop) allCoords.push([currentOption.originStop.lng, currentOption.originStop.lat]);
      if (currentOption?.destStop) allCoords.push([currentOption.destStop.lng, currentOption.destStop.lat]);

      const lngs = allCoords.map(c => c[0]);
      const lats = allCoords.map(c => c[1]);

      if (lngs.length > 0 && lats.length > 0) {
        map.fitBounds(
          [
            [Math.min(...lngs), Math.min(...lats)],
            [Math.max(...lngs), Math.max(...lats)]
          ],
          {
            padding: { top: 140, bottom: 280, left: 40, right: 40 },
            maxZoom: 16,
            duration: 600
          }
        );
      }
    }
  };

  return (
    <div
      className="journey-map-container"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      }}
    >
      <style>{`
        .journey-map-container .maplibregl-ctrl-top-right {
          top: max(env(safe-area-inset-top, 0px), 16px) !important;
          right: 16px !important;
          z-index: 30 !important;
        }
        .journey-map-container .maplibregl-ctrl-group {
          background-color: #18181B !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          border-radius: 12px !important;
          overflow: hidden !important;
          box-shadow: 0 4px 14px rgba(0,0,0,0.6) !important;
        }
        .journey-map-container .maplibregl-ctrl-group button {
          width: 38px !important;
          height: 38px !important;
          background: transparent !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.12) !important;
        }
        .journey-map-container .maplibregl-ctrl-group button:last-child {
          border-bottom: none !important;
        }
        .journey-map-container .maplibregl-ctrl-icon {
          filter: invert(1) brightness(2) !important;
        }
      `}</style>
      <div className="maplibre-container maplibre-dark-mode" ref={container} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};
