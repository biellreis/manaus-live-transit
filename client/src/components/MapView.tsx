import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import type { RouteSummary, TripDetail, LiveBus, TransitHub, StopInfo, PlannedTrip } from '../types/transit.js';
import type { UserLocation } from '../hooks/useUserLocation.js';
import { ArrowLeft, Navigation, Compass } from 'lucide-react';
import { useHaptic } from '../hooks/useHaptic.js';
import { getBusLineColor } from '../utils/transitColors.js';

interface MapViewProps {
  selectedLine?: RouteSummary | null;
  activeTrip: TripDetail | null;
  vehicles: LiveBus[];
  terminals: TransitHub[];
  citywideStops?: StopInfo[];
  selectedBus: LiveBus | null;
  userLocation: UserLocation;
  isRouteView?: boolean;
  plannedTrip?: PlannedTrip | null;
  onSelectBus: (bus: LiveBus | null) => void;
  onSelectStop: (stop: StopInfo) => void;
  onOpenSearch?: () => void;
  onBack?: () => void;
}

// Geodesic distance in meters
function getHaversineDistMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Project point [pLng, pLat] on segment [a, b]
function projectPointOnSegment(pLng: number, pLat: number, a: [number, number], b: [number, number]): [number, number] {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  if (dx === 0 && dy === 0) return a;
  const t = Math.max(0, Math.min(1, ((pLng - a[0]) * dx + (pLat - a[1]) * dy) / (dx * dx + dy * dy)));
  return [a[0] + t * dx, a[1] + t * dy];
}

// Minimum distance from point to polyline in meters
function getDistanceToPolylineMeters(pLng: number, pLat: number, coords: [number, number][]): number {
  if (!coords || coords.length < 2) return Infinity;
  let minDist = Infinity;
  for (let i = 0; i < coords.length - 1; i++) {
    const proj = projectPointOnSegment(pLng, pLat, coords[i], coords[i + 1]);
    const d = getHaversineDistMeters(pLat, pLng, proj[1], proj[0]);
    if (d < minDist) minDist = d;
  }
  return minDist;
}

const MANAUS_CENTER: [number, number] = [-60.0245, -3.1098];

export const MapView: React.FC<MapViewProps> = ({
  selectedLine,
  activeTrip,
  vehicles,
  terminals,
  citywideStops = [],
  selectedBus,
  userLocation,
  isRouteView = false,
  plannedTrip = null,
  onSelectBus,
  onSelectStop,
  onOpenSearch,
  onBack
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const busMarkers = useRef<Map<string, maplibregl.Marker>>(new Map());
  const stopMarkers = useRef<maplibregl.Marker[]>([]);
  const terminalMarkers = useRef<maplibregl.Marker[]>([]);
  const userMarker = useRef<maplibregl.Marker | null>(null);
  const endpointMarkers = useRef<maplibregl.Marker[]>([]);
  const plannedMarkers = useRef<maplibregl.Marker[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const haptic = useHaptic();

  const latest = useRef({onSelectBus,onSelectStop,vehicles,haptic});
  latest.current = {onSelectBus,onSelectStop,vehicles,haptic};

  // Initialize MapLibre with Clean Uber Dark Map Style (CartoDB Dark Matter with deep zoom support)
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const instance = new maplibregl.Map({
      container: mapContainer.current,
      style: {
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
            maxzoom: 20
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
      },
      center: MANAUS_CENTER,
      zoom: 12.8,
      maxZoom: 22,
      pitch: 20,
      bearing: 0,
      attributionControl: false
    });

    instance.on('load', () => {
      // 1. Route Casing (Dark outline for high road contrast)
      instance.addSource('route-casing', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      instance.addLayer({
        id: 'route-casing-layer',
        type: 'line',
        source: 'route-casing',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#05070E',
          'line-width': 8,
          'line-opacity': 0.95
        }
      });

      // 2. Route Core (Vibrant Blue for Ida / Amber for Volta)
      instance.addSource('route-core', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      instance.addLayer({
        id: 'route-core-layer',
        type: 'line',
        source: 'route-core',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#2563EB',
          'line-width': 4.5,
          'line-opacity': 1.0
        }
      });

      // 3. Route Dashed Pulse (Uber navigation dash)
      instance.addSource('route-dash', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      instance.addLayer({
        id: 'route-dash-layer',
        type: 'line',
        source: 'route-dash',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#93C5FD',
          'line-width': 3.5,
          'line-dasharray': [2, 3],
          'line-opacity': 0.75
        }
      });

      // 4. Walking Origin Casing & Layer (Caminhada até a parada mais próxima)
      instance.addSource('walk-origin', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      instance.addLayer({
        id: 'walk-origin-casing-layer',
        type: 'line',
        source: 'walk-origin',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#000000',
          'line-width': 7,
          'line-opacity': 0.9
        }
      });

      instance.addLayer({
        id: 'walk-origin-layer',
        type: 'line',
        source: 'walk-origin',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#3B82F6',
          'line-width': 4,
          'line-dasharray': [1.5, 2],
          'line-opacity': 1.0
        }
      });

      // 5. Walking Destination Casing & Layer (Caminhada da parada até o destino)
      instance.addSource('walk-dest', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      instance.addLayer({
        id: 'walk-dest-casing-layer',
        type: 'line',
        source: 'walk-dest',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#000000',
          'line-width': 7,
          'line-opacity': 0.9
        }
      });

      instance.addLayer({
        id: 'walk-dest-layer',
        type: 'line',
        source: 'walk-dest',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#F97316',
          'line-width': 4,
          'line-dasharray': [1.5, 2],
          'line-opacity': 1.0
        }
      });

      setIsMapLoaded(true);
    });

    map.current = instance;

    const resizeObserver = new ResizeObserver(() => {
      instance.resize();
    });
    if (mapContainer.current) {
      resizeObserver.observe(mapContainer.current);
    }

    return () => {
      resizeObserver.disconnect();
      setIsMapLoaded(false);
      instance.remove();
      map.current = null;
    };
  }, []);

  const hasCenteredOnUser = useRef(false);

  // Update User GPS Marker (Pulsating Blue Dot) & Auto-Center Map
  useEffect(() => {
    if (!map.current) return;
    if (!userLocation.isRealGPS) {
      userMarker.current?.remove();
      userMarker.current = null;
      return;
    }

    if (!userMarker.current) {
      const el = document.createElement('div');
      el.className = 'user-gps-marker';
      el.innerHTML = `
        <div class="user-gps-pulse"></div>
        <div class="user-gps-dot"></div>
      `;

      userMarker.current = new maplibregl.Marker({ element: el })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map.current);
    } else {
      userMarker.current.setLngLat([userLocation.lng, userLocation.lat]);
    }

    // Auto-center map on initial GPS fix if user is not inspecting a specific route line
    if (!hasCenteredOnUser.current && !isRouteView && !plannedTrip) {
      hasCenteredOnUser.current = true;
      map.current.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 14.5,
        pitch: 20,
        speed: 1.2
      });
    }
  }, [userLocation, isRouteView, plannedTrip]);

  // Update Terminals & Integration Hubs
  useEffect(() => {
    if (!map.current || terminals.length === 0) return;

    terminalMarkers.current.forEach(m => m.remove());
    terminalMarkers.current = [];

    // When tracking a specific route, hide citywide terminal badges so only the route's stops appear
    if (isRouteView && activeTrip) return;

    terminals.forEach(hub => {
      const el = document.createElement('div');
      el.className = 'terminal-badge-marker interactive-tap';
      el.innerHTML = `
        <span class="hub-dot" style="background:${hub.type === 'terminal' ? '#F97316' : '#2563EB'}"></span>
        <span class="hub-title">${hub.shortName}</span>
      `;

      el.addEventListener('click', () => {
        haptic.lightTap();
        map.current?.flyTo({
          center: [hub.lng, hub.lat],
          zoom: 15,
          pitch: 30,
          speed: 1.2
        });
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([hub.lng, hub.lat])
        .addTo(map.current!);

      terminalMarkers.current.push(marker);
    });
  }, [terminals, isRouteView, activeTrip, isMapLoaded]);

  // Update Trajectory, Stops, and Origin/Destination Pins when Active Trip Changes
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    // Clear previous stop, endpoint & planned markers
    stopMarkers.current.forEach(m => m.remove());
    stopMarkers.current = [];
    endpointMarkers.current.forEach(m => m.remove());
    endpointMarkers.current = [];
    plannedMarkers.current.forEach(m => m.remove());
    plannedMarkers.current = [];

    // Clear or update walking routes
    const walkOriginSource = map.current.getSource('walk-origin') as maplibregl.GeoJSONSource | undefined;
    const walkDestSource = map.current.getSource('walk-dest') as maplibregl.GeoJSONSource | undefined;

    const isVolta = activeTrip?.directionType === 'volta';

    const createStopMarker = (stop: StopInfo, forceVolta: boolean = false) => {
      const volta = forceVolta || isVolta;
      const [snappedLng, snappedLat] = [stop.lng, stop.lat];

      const el = document.createElement('div');
      el.className = `bus-stop-marker ${volta ? 'volta' : ''}`;
      el.id = `stop-${stop.stopId}`;
      el.title = `${stop.stopName} (${stop.distKm} km)`;
      el.innerHTML = `
        <div class="bus-stop-icon-disc" style="border-color: ${volta ? '#F97316' : '#3B82F6'};">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <rect x="4" y="3" width="16" height="16" rx="2" />
            <path d="M4 11h16" />
            <path d="M8 15h.01" />
            <path d="M16 15h.01" />
            <path d="M9 19v2" />
            <path d="M15 19v2" />
          </svg>
        </div>
        <div class="bus-stop-pin-tail" style="background-color: ${volta ? '#F97316' : '#3B82F6'};"></div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        haptic.lightTap();
        latest.current.onSelectStop(stop);
        map.current?.flyTo({
          center: [snappedLng, snappedLat],
          zoom: 16.5,
          pitch: 20,
          duration: 600
        });
      });

      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([snappedLng, snappedLat])
        .addTo(map.current!);

      stopMarkers.current.push(marker);
    };

    if (!activeTrip || activeTrip.coordinates.length === 0) {
      (map.current.getSource('route-casing') as maplibregl.GeoJSONSource)?.setData({
        type: 'FeatureCollection',
        features: []
      });
      (map.current.getSource('route-core') as maplibregl.GeoJSONSource)?.setData({
        type: 'FeatureCollection',
        features: []
      });
      (map.current.getSource('route-dash') as maplibregl.GeoJSONSource)?.setData({
        type: 'FeatureCollection',
        features: []
      });
      walkOriginSource?.setData({ type: 'FeatureCollection', features: [] });
      walkDestSource?.setData({ type: 'FeatureCollection', features: [] });

      // In citywide exploration mode, show citywide bus stops
      if (citywideStops && citywideStops.length > 0) {
        citywideStops.forEach(s => createStopMarker(s));
      }
      return;
    }

    // Color by direction: Blue for IDA, Orange for VOLTA (Strict 3-color palette)
    const coreColor = isVolta ? '#F97316' : '#3B82F6';
    const dashColor = isVolta ? '#FDBA74' : '#BFDBFE';

    map.current.setPaintProperty('route-core-layer', 'line-color', coreColor);
    map.current.setPaintProperty('route-dash-layer', 'line-color', dashColor);

    const feature = {
      type: 'Feature' as const,
      properties: { tripId: activeTrip.tripId, name: activeTrip.tripName },
      geometry: {
        type: 'LineString' as const,
        coordinates: activeTrip.coordinates
      }
    };

    const collection = { type: 'FeatureCollection' as const, features: plannedTrip ? plannedTrip.legs.map(leg => ({...feature, properties:{tripId:leg.trip.tripId,name:leg.trip.tripName}, geometry:{type:'LineString' as const,coordinates:leg.trip.coordinates}})).filter(f=>f.geometry.coordinates.length>=2) : [feature] };
    (map.current.getSource('route-casing') as maplibregl.GeoJSONSource)?.setData(collection);
    (map.current.getSource('route-core') as maplibregl.GeoJSONSource)?.setData(collection);
    (map.current.getSource('route-dash') as maplibregl.GeoJSONSource)?.setData(collection);

    // Zoom & Fit Route bounds smoothly
    const bounds = new maplibregl.LngLatBounds();
    (plannedTrip ? plannedTrip.legs.flatMap(l=>l.trip.coordinates) : activeTrip.coordinates).forEach(c => bounds.extend(c));

    // Handle Planned Trip (Multimodal: Walk to Stop -> Bus Route -> Walk to Destination)
    if (plannedTrip) {
      const walkOriginCoords = plannedTrip.journeyDetails?.find(l=>l.type==='walk_origin')?.coordinates || [];
      const walkDestCoords = plannedTrip.journeyDetails?.find(l=>l.type==='walk_dest')?.coordinates || [];

      walkOriginSource?.setData({
        type: 'FeatureCollection',
        features: walkOriginCoords.length >= 2 ? [{
          type: 'Feature',
          properties: { name: 'Caminhada até a parada (OpenStreetMap)' },
          geometry: { type: 'LineString', coordinates: walkOriginCoords }
        }] : []
      });

      walkDestSource?.setData({
        type: 'FeatureCollection',
        features: walkDestCoords.length >= 2 ? [{
          type: 'Feature',
          properties: { name: 'Caminhada até o destino (OpenStreetMap)' },
          geometry: { type: 'LineString', coordinates: walkDestCoords }
        }] : []
      });

      bounds.extend([plannedTrip.origin.lng, plannedTrip.origin.lat]);
      bounds.extend([plannedTrip.originStop.lng, plannedTrip.originStop.lat]);
      bounds.extend([plannedTrip.destStop.lng, plannedTrip.destStop.lat]);
      bounds.extend([plannedTrip.destination.lng, plannedTrip.destination.lat]);

      // 1. Origin Marker (Clean Lucide styling, NO emojis)
      const originEl = document.createElement('div');
      originEl.style.cssText = 'display:flex;flex-direction:column;align-items:center;cursor:pointer;';
      originEl.innerHTML = `
        <div style="background:#2563EB;color:#FFFFFF;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:800;white-space:nowrap;box-shadow:0 3px 8px rgba(0,0,0,0.7);border:1.5px solid #FFFFFF;">
          Partida: ${plannedTrip.origin.name}
        </div>
        <div style="width:12px;height:12px;border-radius:50%;background:#2563EB;border:2.5px solid #FFFFFF;box-shadow:0 2px 6px rgba(0,0,0,0.6);margin-top:2px;"></div>
      `;
      const originMarker = new maplibregl.Marker({ element: originEl, anchor: 'bottom' })
        .setLngLat([plannedTrip.origin.lng, plannedTrip.origin.lat])
        .addTo(map.current);
      plannedMarkers.current.push(originMarker);

      // 2. Departure Stop Marker (Clean Lucide styling, NO emojis)
      const depEl = document.createElement('div');
      depEl.style.cssText = 'display:flex;flex-direction:column;align-items:center;cursor:pointer;';
      depEl.innerHTML = `
        <div style="background:#2563EB;color:#FFFFFF;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:800;white-space:nowrap;box-shadow:0 3px 8px rgba(0,0,0,0.7);border:1.5px solid #FFFFFF;">
          Embarque • distância em linha reta
        </div>
        <div style="width:12px;height:12px;border-radius:3px;background:#2563EB;border:2px solid #FFFFFF;box-shadow:0 2px 6px rgba(0,0,0,0.6);margin-top:2px;"></div>
      `;
      const depMarker = new maplibregl.Marker({ element: depEl, anchor: 'bottom' })
        .setLngLat([plannedTrip.originStop.lng, plannedTrip.originStop.lat])
        .addTo(map.current);
      plannedMarkers.current.push(depMarker);

      // 3. Arrival Stop Marker (Clean Lucide styling, NO emojis)
      const arrEl = document.createElement('div');
      arrEl.style.cssText = 'display:flex;flex-direction:column;align-items:center;cursor:pointer;';
      arrEl.innerHTML = `
        <div style="background:#F97316;color:#FFFFFF;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:800;white-space:nowrap;box-shadow:0 3px 8px rgba(0,0,0,0.7);border:1.5px solid #FFFFFF;">
          Desembarque
        </div>
        <div style="width:12px;height:12px;border-radius:3px;background:#F97316;border:2px solid #FFFFFF;box-shadow:0 2px 6px rgba(0,0,0,0.6);margin-top:2px;"></div>
      `;
      const arrMarker = new maplibregl.Marker({ element: arrEl, anchor: 'bottom' })
        .setLngLat([plannedTrip.destStop.lng, plannedTrip.destStop.lat])
        .addTo(map.current);
      plannedMarkers.current.push(arrMarker);

      // 4. Final Destination Marker (Clean Lucide styling, NO emojis)
      const destEl = document.createElement('div');
      destEl.style.cssText = 'display:flex;flex-direction:column;align-items:center;cursor:pointer;';
      destEl.innerHTML = `
        <div style="background:#EA580C;color:#FFFFFF;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:800;white-space:nowrap;box-shadow:0 3px 8px rgba(0,0,0,0.7);border:1.5px solid #FFFFFF;">
          Destino: ${plannedTrip.destination.name}
        </div>
        <div style="width:12px;height:12px;border-radius:50%;background:#EA580C;border:2.5px solid #FFFFFF;box-shadow:0 2px 6px rgba(0,0,0,0.6);margin-top:2px;"></div>
      `;
      const destMarker = new maplibregl.Marker({ element: destEl, anchor: 'bottom' })
        .setLngLat([plannedTrip.destination.lng, plannedTrip.destination.lat])
        .addTo(map.current);
      plannedMarkers.current.push(destMarker);
    } else {
      walkOriginSource?.setData({ type: 'FeatureCollection', features: [] });
      walkDestSource?.setData({ type: 'FeatureCollection', features: [] });

      // 1. Origin Marker (Start of bus route)
      const startCoord = activeTrip.coordinates[0];
      if (startCoord) {
        const originEl = document.createElement('div');
        originEl.className = 'route-endpoint-origin';
        originEl.innerHTML = `
          <div class="endpoint-circle">
            <div class="endpoint-inner"></div>
          </div>
        `;
        const originMarker = new maplibregl.Marker({ element: originEl })
          .setLngLat(startCoord)
          .addTo(map.current);
        endpointMarkers.current.push(originMarker);
      }

      // 2. Destination Marker (End of bus route - Clean, NO emojis)
      const endCoord = activeTrip.coordinates[activeTrip.coordinates.length - 1];
      if (endCoord) {
        const destEl = document.createElement('div');
        destEl.className = 'route-endpoint-dest';
        destEl.innerHTML = `
          <div class="endpoint-square" style="border-color:#F97316;">
            <div style="width:8px;height:8px;border-radius:2px;background:#F97316;"></div>
          </div>
        `;
        const destMarker = new maplibregl.Marker({ element: destEl })
          .setLngLat(endCoord)
          .addTo(map.current);
        endpointMarkers.current.push(destMarker);
      }
    }

    map.current.fitBounds(bounds, {
      padding: { top: 120, bottom: 330, left: 40, right: 40 },
      maxZoom: 15,
      duration: 800
    });

    // 3. Intermediary Stops with Bus Stop Totem Icon (Snapping to line, strictly on Manaus roads)
    activeTrip.stops.forEach(stop => createStopMarker(stop, isVolta));
  }, [activeTrip, plannedTrip, citywideStops, isMapLoaded]);

  // Auto zoom and fit bounds to full route whenever route mode is activated
  useEffect(() => {
    if (isRouteView && map.current) {
      setTimeout(() => {
        map.current?.resize();
        if (activeTrip && activeTrip.coordinates.length > 0) {
          const bounds = new maplibregl.LngLatBounds();
          (plannedTrip ? plannedTrip.legs.flatMap(l=>l.trip.coordinates) : activeTrip.coordinates).forEach(c => bounds.extend(c));
          map.current?.fitBounds(bounds, {
            padding: { top: 90, bottom: 290, left: 35, right: 35 },
            maxZoom: 15,
            duration: 800
          });
        } else if (!selectedLine) {
          // Citywide explore mode: fit bounds to encompass Manaus (North, South, East, West, Center)
          const bounds = new maplibregl.LngLatBounds();
          bounds.extend([-60.08, -3.15]); // Ponta Negra / Centro / Educandos
          bounds.extend([-59.92, -3.00]); // Cidade Nova / Jorge Teixeira / T4 / T3
          map.current?.fitBounds(bounds, {
            padding: { top: 80, bottom: 120, left: 30, right: 30 },
            maxZoom: 14,
            duration: 800
          });
        }
      }, 100);
    }
  }, [isRouteView, activeTrip?.tripId, selectedLine]);

  // Update Live Bus Markers (Modern Vehicle Badge, Arrow in travel direction, bus icon ALWAYS UPRIGHT)
  useEffect(() => {
    if (!map.current) return;
    if (!isRouteView) {
      for (const [, marker] of busMarkers.current.entries()) {
        marker.remove();
      }
      busMarkers.current.clear();
      return;
    }

    const currentMap = map.current;
    const activeIds = new Set<string>();

    const isVolta = activeTrip?.directionType === 'volta';
    const activeDirection = isVolta ? 'volta' : 'ida';

    // STRICT SPATIAL & DIRECTION FILTERING:
    // When tracking a specific route:
    // 1. Only display vehicles traveling in the active direction (IDA vs VOLTA).
    // 2. Only display vehicles physically within 450m of the activeTrip polyline.
    // This strictly eliminates stray/ghost vehicles appearing miles away in other neighborhoods.
    const filteredVehicles = activeTrip && activeTrip.coordinates.length > 1
      ? vehicles.filter(v => {
          if (v.direction && v.direction !== activeDirection) return false;
          const dist = getDistanceToPolylineMeters(v.lng, v.lat, activeTrip.coordinates);
          return dist <= 450;
        })
      : vehicles;

    filteredVehicles.forEach(bus => {
      activeIds.add(bus.id);
      let marker = busMarkers.current.get(bus.id);
      const isSelected = selectedBus?.id === bus.id;
      const busCode = bus.routeCode || selectedLine?.code || '640';
      const lineColorInfo = getBusLineColor(busCode);
      const color = isVolta ? '#F97316' : lineColorInfo.bg;

      // Normalized heading in [0, 360)
      const headingDeg = (Math.round(bus.heading) % 360 + 360) % 360;

      if (!marker) {
        const el = document.createElement('div');
        el.className = 'modern-bus-marker';
        el.id = `bus-${bus.id}`;

        // Top line code badge
        const badge = document.createElement('div');
        badge.className = 'bus-line-badge';
        badge.innerText = busCode;
        badge.style.backgroundColor = lineColorInfo.bg;
        el.appendChild(badge);

        // Circular vehicle disc
        const disc = document.createElement('div');
        disc.className = 'bus-disc';
        disc.style.borderColor = color;

        // Direction pointer arrow (rotates around disc center based on travel heading)
        const pointer = document.createElement('div');
        pointer.className = 'bus-direction-pointer';
        pointer.style.borderBottomColor = color;
        pointer.style.transform = `rotate(${headingDeg}deg) translateY(-17px)`;
        disc.appendChild(pointer);

        // Upright Bus SVG Icon (Stays upright, NEVER upside down!)
        const iconContainer = document.createElement('div');
        iconContainer.className = 'bus-icon-upright';
        iconContainer.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4c-1.1 0-2.1.8-2.4 1.8l-1.4 5c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"/><circle cx="7" cy="18" r="2"/><circle cx="15" cy="18" r="2"/>
          </svg>
        `;
        disc.appendChild(iconContainer);
        el.appendChild(disc);

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          haptic.mediumTap();
          const currentBus = latest.current.vehicles.find(v => v.id === bus.id);
          if (!currentBus) return;
          latest.current.onSelectBus(currentBus);
          currentMap.flyTo({
            center: [currentBus.lng, currentBus.lat],
            zoom: 16.5,
            pitch: 25,
            duration: 600
          });
        });

        marker = new maplibregl.Marker({ element: el })
          .setLngLat([bus.lng, bus.lat])
          .addTo(currentMap);

        busMarkers.current.set(bus.id, marker);
      } else {
        marker.setLngLat([bus.lng, bus.lat]);

        // Update direction pointer rotation without rotating the bus icon
        const disc = marker.getElement().querySelector('.bus-disc') as HTMLElement | null;
        if (disc) {
          disc.style.borderColor = isSelected ? '#FFFFFF' : color;
          const pointer = disc.querySelector('.bus-direction-pointer') as HTMLElement;
          if (pointer) {
            pointer.style.transform = `rotate(${headingDeg}deg) translateY(-17px)`;
            pointer.style.borderBottomColor = color;
          }
        }

        const badge = marker.getElement().querySelector('.bus-line-badge') as HTMLElement | null;
        if (badge) {
          badge.innerText = busCode;
          badge.style.backgroundColor = lineColorInfo.bg;
        }
      }
    });

    for (const [id, marker] of busMarkers.current.entries()) {
      if (!activeIds.has(id)) {
        marker.remove();
        busMarkers.current.delete(id);
      }
    }
  }, [vehicles, activeTrip, selectedBus, selectedLine, isRouteView]);

  // Recenter GPS Handler
  const handleRecenterUser = () => {
    haptic.lightTap();
    if (!map.current) return;
    map.current.flyTo({
      center: [userLocation.lng, userLocation.lat],
      zoom: 15,
      pitch: 20,
      bearing: 0,
      speed: 1.2
    });
  };

  return (
    <div className={"maplibre-container " + (isDarkMode ? "maplibre-dark-mode" : "")} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      {/* Floating Back Button when Route is Selected (Uber Navigation Screen) */}
      {isRouteView && onBack && (
        <button
          id="map-route-back-button"
          onClick={() => {
            haptic.lightTap();
            onBack();
          }}
          style={{
            position: 'absolute',
            top: 'max(env(safe-area-inset-top, 0px), 18px)',
            left: '16px',
            zIndex: 40,
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            backgroundColor: '#000000',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)'
          }}
          aria-label="Voltar para início"
        >
          <ArrowLeft size={20} />
        </button>
      )}

      {/* Floating GPS & Compass Controls (Only during Active Route Tracking) */}
      {isRouteView && (
        <div
          style={{
            position: 'absolute',
            top: 'max(env(safe-area-inset-top, 0px), 18px)',
            right: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            zIndex: 40
          }}
        >
          {/* Recenter GPS Button */}
          <button
            id="recenter-gps-button"
            onClick={handleRecenterUser}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: '#000000',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#3B82F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)',
              outline: 'none'
            }}
            title="Minha Localização GPS"
          >
            <Navigation size={18} />
          </button>

          {/* Compass Reset */}
          <button
            onClick={() => {
              haptic.lightTap();
              map.current?.easeTo({ pitch: 0, bearing: 0, duration: 400 });
            }}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: '#000000',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#A1A1AA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)',
              outline: 'none'
            }}
            title="Redefinir Norte"
          >
            <Compass size={18} />
          </button>

          {/* Theme Toggle (Dark Mode vs Light Mode) */}
          <button
            id="toggle-map-theme-button"
            onClick={() => {
              haptic.lightTap();
              setIsDarkMode(prev => !prev);
            }}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: '#000000',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: isDarkMode ? '#3B82F6' : '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)',
              outline: 'none',
              fontSize: '10px',
              fontWeight: 800
            }}
            title={isDarkMode ? "Alternar para Modo Claro (Branco)" : "Alternar para Modo Escuro"}
          >
            {isDarkMode ? 'DARK' : 'LIGHT'}
          </button>
        </div>
      )}

      {/* Floating Exploration Card (Uber / 99 Map Overview) */}
      {isRouteView && !selectedLine && (
        <div
          id="city-explore-floating-card"
          style={{
            position: 'absolute',
            bottom: 'max(env(safe-area-inset-bottom, 0px), 24px)',
            left: '16px',
            right: '16px',
            zIndex: 40,
            backgroundColor: '#121214',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.85)',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3B82F6' }} />
            <span style={{ fontSize: '13px', color: '#FFFFFF', fontWeight: 700 }}>
              {vehicles.length} ônibus em circulação • {citywideStops.length} paradas mapeadas
            </span>
          </div>

          {onOpenSearch && (
            <button
              id="city-explore-search-btn"
              onClick={() => {
                haptic.lightTap();
                onOpenSearch();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: '#1C1C1E',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '12px 14px',
                color: '#FFFFFF',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left'
              }}
            >
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#FFFFFF' }} />
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#A1A1AA', flex: 1 }}>
                Para onde vamos?
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
