import React, { useState, useMemo } from 'react';
import { MapPin, ArrowRight } from 'lucide-react';
import type { TransitHub, RouteSummary, StopInfo } from '../types/transit.js';
import type { UserLocation } from '../hooks/useUserLocation.js';
import { useHaptic } from '../hooks/useHaptic.js';
import { getBusLineColor } from '../utils/transitColors.js';

interface StopsTabProps {
  terminals: TransitHub[];
  lines: RouteSummary[];
  userLocation: UserLocation;
  onSelectTerminal: (hub: TransitHub) => void;
  onSelectLine: (line: RouteSummary) => void;
  onRequestGPS: () => void;
  stops?: StopInfo[];
}

export const StopsTab: React.FC<StopsTabProps> = ({
  terminals,
  lines,
  userLocation,
  onSelectTerminal,
  onSelectLine,
  onRequestGPS: _onRequestGPS,
  stops = []
}) => {
  const [activeSection, setActiveSection] = useState<'proximas' | 'terminais' | 'estacoes'>(() => {
    const s = new URLSearchParams(window.location.search).get('section');
    return (s === 'terminais' || s === 'estacoes') ? s : 'proximas';
  });
  const haptic = useHaptic();

  // Haversine formula for exact distance calculation in meters / km
  const getDistanceInfo = (lat2: number, lon2: number) => {
    if (!userLocation.isRealGPS) return { distText: 'Localização indisponível', walkText: '', distKm: Infinity };
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - userLocation.lat) * (Math.PI / 180);
    const dLon = (lon2 - userLocation.lng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(userLocation.lat * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distKm = R * c;

    if (distKm < 1) {
      const meters = Math.round(distKm * 1000);
      const walkingMin = Math.max(1, Math.round(meters / 83)); // ~83m per min
      return {
        distText: `${meters} m`,
        walkText: `${walkingMin} min a pé`,
        distKm
      };
    }

    const walkingMin = Math.round((distKm * 1000) / 83);
    return {
      distText: `${distKm.toFixed(1)} km`,
      walkText: `${walkingMin} min a pé`,
      distKm
    };
  };

  // Calculate distances for stops and sort by nearest to user GPS
  const nearestStops = useMemo(() => {
    const sourceList = stops.length > 0
      ? stops.map(s => ({
          id: `stop-${s.stopId}`,
          name: s.stopName,
          address: `${s.stopName} - Manaus`,
          lines: s.lines || [],
          lat: s.lat,
          lng: s.lng
        }))
      : [];

    return sourceList
      .map(stop => {
        const info = getDistanceInfo(stop.lat, stop.lng);
        return {
          ...stop,
          ...info
        };
      })
      .sort((a, b) => a.distKm - b.distKm);
  }, [stops, userLocation.lat, userLocation.lng]);

  // Terminals sorted by distance to user GPS (Strictly T1 to T6)
  const sortedTerminals = useMemo(() => {
    const terminalsOnly = terminals.filter(hub => hub.type === 'terminal' || (hub.shortName && hub.shortName.toUpperCase().startsWith('T')) || (hub.id && hub.id.toUpperCase().startsWith('T')));
    const listToMap = terminalsOnly.length > 0 ? terminalsOnly : terminals;
    return listToMap.map(hub => {
      const info = getDistanceInfo(hub.lat, hub.lng);
      return {
        ...hub,
        ...info
      };
    }).sort((a, b) => a.distKm - b.distKm);
  }, [terminals, userLocation.lat, userLocation.lng]);

  const closestStop = nearestStops[0];

  return (
    <div
      id="stops-tab-screen"
      className="scroll-container"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 5,
        backgroundColor: 'var(--bg-canvas, #09090B)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 90px)',
        overflowY: 'auto',
        color: 'var(--text-primary, #FFFFFF)'
      }}
    >
      {/* Top Header */}
      <div
        style={{
          paddingTop: 'max(env(safe-area-inset-top, 0px), 18px)',
          paddingLeft: '20px',
          paddingRight: '20px',
          paddingBottom: '14px'
        }}
      >
        <h1
          style={{
            fontSize: '26px',
            fontWeight: 800,
            color: 'var(--text-primary, #FFFFFF)',
            letterSpacing: '-0.03em',
            margin: 0
          }}
        >
          Terminais e Plataformas
        </h1>
        <p
          style={{
            fontSize: '13px',
            color: 'var(--text-muted, #A1A1AA)',
            margin: '3px 0 0 0',
            fontWeight: 500
          }}
        >
          {userLocation.isRealGPS ? 'Distâncias calculadas a partir da sua localização' : 'Localização indisponível • escolha uma parada'}
        </p>
      </div>

      {stops.length === 0 && <p style={{ padding: 20, color: 'var(--text-muted, #A1A1AA)' }}>Paradas indisponíveis.</p>}

      {/* Tabs Switcher: Paradas no Entorno | Terminais (T1 ao T6) | Estações (E1 a E4) */}
      <div style={{ padding: '0 20px 16px 20px', display: 'flex', gap: '8px' }}>
        {[
          { id: 'proximas', main: 'Paradas no', sub: 'Entorno' },
          { id: 'terminais', main: 'Terminais', sub: '(T1 ao T6)' },
          { id: 'estacoes', main: 'Estações', sub: '(E1 a E4)' },
        ].map((tab) => {
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                haptic.lightTap();
                setActiveSection(tab.id as any);
              }}
              style={{
                flex: 1,
                padding: '10px 4px',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: isActive ? '1px solid #3B82F6' : '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                backgroundColor: isActive ? '#2563EB' : 'var(--bg-card, #18181B)',
                color: isActive ? '#FFFFFF' : 'var(--text-muted, #A1A1AA)',
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: 800, lineHeight: 1.25 }}>{tab.main}</span>
              <span style={{ fontSize: '11px', fontWeight: 700, opacity: isActive ? 0.95 : 0.7, marginTop: '2px', lineHeight: 1.1 }}>{tab.sub}</span>
            </button>
          );
        })}
      </div>

      {/* Parada Mais Próxima (Featured Card - Only shown under Paradas no Entorno) */}
      {activeSection === 'proximas' && closestStop && (
        <div style={{ padding: '0 20px 20px 20px' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%)',
              borderRadius: '20px',
              padding: '18px 20px',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.6)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span
                style={{
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  fontSize: '10.5px',
                  fontWeight: 800,
                  padding: '4px 10px',
                  borderRadius: '999px',
                  letterSpacing: '0.04em'
                }}
              >
                MAIS PRÓXIMA DE VOCÊ
              </span>
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#60A5FA' }}>
                {closestStop.distText} {closestStop.walkText ? `• ${closestStop.walkText}` : ''}
              </span>
            </div>

            <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', marginBottom: '4px' }}>
              {closestStop.name}
            </div>
            <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '14px' }}>
              {closestStop.address}
            </div>

            {/* Passing bus lines chip flow */}
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#93C5FD', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
              Linhas com parada neste ponto:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {closestStop.lines.map((code: string) => {
                const colorInfo = getBusLineColor(code);
                return (
                  <span
                    key={code}
                    onClick={() => {
                      haptic.lightTap();
                      const match = lines.find(l => l.code === code);
                      if (match) onSelectLine(match);
                    }}
                    style={{
                      backgroundColor: colorInfo.bg,
                      color: colorInfo.text,
                      fontSize: '12.5px',
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)'
                    }}
                  >
                    {code}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Section 1: Paradas no Entorno */}
      {activeSection === 'proximas' && (
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {nearestStops.map((stop) => (
            <div
              key={stop.id}
              style={{
                backgroundColor: 'var(--bg-card, #18181B)',
                borderRadius: '18px',
                padding: '16px',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                boxShadow: 'var(--shadow-card, 0 4px 14px rgba(0, 0, 0, 0.3))'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ flex: 1, minWidth: 0, paddingRight: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <MapPin size={16} color="#3B82F6" />
                    <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary, #FFFFFF)' }}>
                      {stop.name}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted, #71717A)', marginLeft: '24px' }}>
                    {stop.address}
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#60A5FA' }}>
                    {stop.distText}
                  </div>
                  {stop.walkText && (
                    <div style={{ fontSize: '11px', color: 'var(--text-muted, #A1A1AA)' }}>
                      {stop.walkText}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  {stop.lines.map((code: string) => {
                    const colorInfo = getBusLineColor(code);
                    return (
                      <span
                        key={code}
                        onClick={() => {
                          haptic.lightTap();
                          const match = lines.find(l => l.code === code);
                          if (match) onSelectLine(match);
                        }}
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '2px 7px',
                          borderRadius: '6px',
                          backgroundColor: colorInfo.bg,
                          color: colorInfo.text,
                          cursor: 'pointer'
                        }}
                      >
                        {code}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Section 2: Terminais de Integração (T1 ao T6) */}
      {activeSection === 'terminais' && (
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sortedTerminals.map((hub) => (
            <div
              key={hub.id}
              onClick={() => {
                haptic.mediumTap();
                onSelectTerminal(hub);
              }}
              style={{
                backgroundColor: 'var(--bg-card, #18181B)',
                borderRadius: '18px',
                padding: '16px',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-card, 0 4px 14px rgba(0, 0, 0, 0.3))'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        backgroundColor: '#F97316',
                        color: '#FFFFFF',
                        fontSize: '12px',
                        fontWeight: 800,
                        padding: '3px 9px',
                        borderRadius: '6px'
                      }}
                    >
                      {hub.shortName || hub.name}
                    </span>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary, #FFFFFF)' }}>
                      {hub.name}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted, #71717A)', marginTop: '4px' }}>
                    {hub.address}
                  </div>
                </div>

                <div style={{ textAlign: 'right', marginLeft: '12px', flexShrink: 0 }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#F97316' }}>
                    {hub.distText}
                  </span>
                </div>
              </div>

              {/* Terminal Platform & Key Lines Diagramming */}
              <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', flex: 1 }}>
                  {hub.keyLines.map((code) => {
                    const colorInfo = getBusLineColor(code);
                    return (
                      <span
                        key={code}
                        onClick={(e) => {
                          e.stopPropagation();
                          haptic.lightTap();
                          const match = lines.find(l => l.code === code);
                          if (match) onSelectLine(match);
                        }}
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          backgroundColor: colorInfo.badgeBg,
                          color: colorInfo.accent,
                          border: `1px solid ${colorInfo.border}`,
                          cursor: 'pointer'
                        }}
                      >
                        {code}
                      </span>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#3B82F6', fontWeight: 600 }}>
                  <span>Ver rotas</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Section 3: Estações (E1 a E4) */}
      {activeSection === 'estacoes' && (
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { id: 'e1', code: 'E1', name: 'Estação São Jorge', via: 'Av. Constantino Nery', lines: ['640', '300', '448', '560'], lat: -3.1098, lng: -60.0245 },
            { id: 'e2', code: 'E2', name: 'Estação Arena da Amazônia', via: 'Av. Constantino Nery', lines: ['640', '300', '448', '560', '652'], lat: -3.0825, lng: -60.0289 },
            { id: 'e3', code: 'E3', name: 'Estação Santos Dumont', via: 'Av. Torquato Tapajós', lines: ['640', '300', '500', '560'], lat: -3.0562, lng: -60.0345 },
            { id: 'e4', code: 'E4', name: 'Estação Flores', via: 'Av. Max Teixeira', lines: ['640', '300', '448', '357'], lat: -3.0381, lng: -60.0274 },
          ].map((est) => {
            const distInfo = getDistanceInfo(est.lat, est.lng);
            return (
              <div
                key={est.id}
                style={{
                  backgroundColor: 'var(--bg-card, #18181B)',
                  borderRadius: '18px',
                  padding: '16px',
                  border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                  boxShadow: 'var(--shadow-card, 0 4px 14px rgba(0, 0, 0, 0.3))'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        backgroundColor: '#2563EB',
                        color: '#FFFFFF',
                        fontSize: '12px',
                        fontWeight: 800,
                        padding: '4px 9px',
                        borderRadius: '6px'
                      }}
                    >
                      {est.code}
                    </span>
                    <div>
                      <div style={{ fontSize: '15.5px', fontWeight: 800, color: 'var(--text-primary, #FFFFFF)' }}>
                        {est.name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted, #94A3B8)', marginTop: '2px' }}>
                        {est.via}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#60A5FA' }}>
                      {distInfo.distText}
                    </div>
                    {distInfo.walkText && (
                      <div style={{ fontSize: '11px', color: 'var(--text-muted, #A1A1AA)' }}>
                        {distInfo.walkText}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  {est.lines.map((code) => {
                    const colorInfo = getBusLineColor(code);
                    return (
                      <span
                        key={code}
                        onClick={() => {
                          haptic.lightTap();
                          const match = lines.find(l => l.code === code);
                          if (match) onSelectLine(match);
                        }}
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          backgroundColor: colorInfo.bg,
                          color: colorInfo.text,
                          cursor: 'pointer'
                        }}
                      >
                        {code}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
