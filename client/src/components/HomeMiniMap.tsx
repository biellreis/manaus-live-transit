import React, { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import type { UserLocation } from '../hooks/useUserLocation.js';
import type { LiveBus, StopInfo } from '../types/transit.js';
import { Navigation, Maximize2 } from 'lucide-react';
import { useHaptic } from '../hooks/useHaptic.js';

interface HomeMiniMapProps {
  userLocation: UserLocation;
  vehicles: LiveBus[];
  stops?: StopInfo[];
  onExpandMap: () => void;
  onRequestGPS: () => void;
}

export const HomeMiniMap: React.FC<HomeMiniMapProps> = ({
  userLocation,
  vehicles,
  stops = [],
  onExpandMap,
  onRequestGPS
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const userMarker = useRef<maplibregl.Marker | null>(null);
  const busMarkers = useRef<Map<string, maplibregl.Marker>>(new Map());
  const stopMarkers = useRef<maplibregl.Marker[]>([]);
  const haptic = useHaptic();

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Clean Google Maps Roadmap - Zero watermarks e suporte a zoom profundo em Manaus
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
      },
      maxZoom: 22,
      center: [userLocation.lng, userLocation.lat],
      zoom: 13.8,
      pitch: 0,
      bearing: 0,
      attributionControl: false,
      interactive: true
    });

    map.current = instance;

    // Create pulsating User GPS marker
    const userEl = document.createElement('div');
    userEl.className = 'user-gps-beacon';
    userEl.innerHTML = `
      <div class="user-gps-pulse"></div>
      <div class="user-gps-core"></div>
    `;

    if (userLocation.isRealGPS) userMarker.current = new maplibregl.Marker({
      element: userEl,
      anchor: 'center'
    })
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(instance);

    return () => {
      instance.remove();
      map.current = null;
    };
  }, []);

  // Update user marker position and center map
  useEffect(() => {
    if (!map.current) return;
    if (!userLocation.isRealGPS) {userMarker.current?.remove();userMarker.current=null;return;}
    if (!userMarker.current) userMarker.current = new maplibregl.Marker({color:'#2563EB'}).setLngLat([userLocation.lng,userLocation.lat]).addTo(map.current);
    userMarker.current.setLngLat([userLocation.lng, userLocation.lat]);
    map.current.setCenter([userLocation.lng, userLocation.lat]);
  }, [userLocation.lat, userLocation.lng, userLocation.isRealGPS]);

  // Update stops on mini map
  useEffect(() => {
    if (!map.current) return;
    stopMarkers.current.forEach(m => m.remove());
    stopMarkers.current = [];

    // Show circulating corridor stops in Manaus
    stops.forEach(stop => {
      const el = document.createElement('div');
      el.style.width = '14px';
      el.style.height = '14px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = '#18181B';
      el.style.border = '1.5px solid #3B82F6';
      el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.7)';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.innerHTML = `<div style="width:4px;height:4px;border-radius:50%;background:#3B82F6;"></div>`;

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([stop.lng, stop.lat])
        .addTo(map.current!);

      stopMarkers.current.push(marker);
    });
  }, [stops]);

  // Update nearby circulating bus markers on mini map (Uber/99 live simulation)
  useEffect(() => {
    if (!map.current) return;
    const currentMap = map.current;
    const activeIds = new Set<string>();

    vehicles.forEach(bus => {
      activeIds.add(bus.id);
      let marker = busMarkers.current.get(bus.id);
      const isVolta = bus.direction === 'volta';
      const color = isVolta ? '#F97316' : '#2563EB';

      if (!marker) {
        const el = document.createElement('div');
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = color;
        el.style.border = '2px solid #FFFFFF';
        el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.7)';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.cursor = 'pointer';
        el.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 6v6"/>
            <path d="M15 6v6"/>
            <path d="M2 12h19.6"/>
            <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.6 19 6 17.8 6H6.2C5 6 3.9 6.6 3.6 7.8L2.2 12.8c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"/>
            <circle cx="7" cy="18" r="2"/>
            <circle cx="17" cy="18" r="2"/>
          </svg>
        `;

        marker = new maplibregl.Marker({
          element: el,
          anchor: 'center'
        })
          .setLngLat([bus.lng, bus.lat])
          .addTo(currentMap);

        busMarkers.current.set(bus.id, marker);
      } else {
        marker.setLngLat([bus.lng, bus.lat]);
      }
    });

    for (const [id, marker] of busMarkers.current.entries()) {
      if (!activeIds.has(id)) {
        marker.remove();
        busMarkers.current.delete(id);
      }
    }
  }, [vehicles]);

  const handleRecenter = (e: React.MouseEvent) => {
    e.stopPropagation();
    haptic.mediumTap();
    onRequestGPS();
    if (map.current) {
      map.current.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 14.5,
        speed: 1.4,
        essential: true
      });
    }
  };

  return (
    <div
      id="home-mini-map-container"
      onClick={() => {
        haptic.lightTap();
        onExpandMap();
      }}
      style={{
        position: 'relative',
        width: '100%',
        height: '136px',
        borderRadius: '18px',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
        cursor: 'pointer',
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}
    >
      {/* MapLibre Canvas Container */}
      <div className="maplibre-container maplibre-dark-mode" ref={mapContainer} style={{ width: '100%', height: '100%', pointerEvents: 'none' }} />

      {/* Floating Action Buttons: Recenter GPS & Expand */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          display: 'flex',
          gap: '8px',
          pointerEvents: 'auto'
        }}
      >
        <button
          id="mini-map-gps-btn"
          onClick={handleRecenter}
          aria-label="Atualizar meu GPS"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'rgba(9, 9, 11, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#3B82F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
            outline: 'none'
          }}
          title="Minha Localização GPS"
        >
          <Navigation size={17} />
        </button>

        <button
          onClick={onExpandMap}
          aria-label="Expandir mapa"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'rgba(9, 9, 11, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
            outline: 'none'
          }}
          title="Ver mapa completo"
        >
          <Maximize2 size={15} />
        </button>
      </div>
    </div>
  );
};
