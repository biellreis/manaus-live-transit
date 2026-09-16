import React from 'react';
import { X, Bus, Footprints, Clock, ArrowRight } from 'lucide-react';
import type { StopInfo, RouteSummary } from '../types/transit.js';
import type { UserLocation } from '../hooks/useUserLocation.js';
import { getBusLineColor } from '../utils/transitColors.js';
import { useHaptic } from '../hooks/useHaptic.js';

interface StopDetailsSheetProps {
  stop: StopInfo | null;
  userLocation: UserLocation;
  lines: RouteSummary[];
  onClose: () => void;
  onSelectLine: (line: RouteSummary) => void;
}

// Cálculo geodésico Haversine
function getHaversineDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export const StopDetailsSheet: React.FC<StopDetailsSheetProps> = ({
  stop,
  userLocation,
  lines,
  onClose,
  onSelectLine
}) => {
  const haptic = useHaptic();

  if (!stop) return null;

  const distanceMeters = getHaversineDistanceMeters(userLocation.lat, userLocation.lng, stop.lat, stop.lng);
  const walkMinutes = Math.max(1, Math.round(distanceMeters / 80));

  const targetLineCodes = stop.lines || [];
  const passingLines = lines.filter(line => targetLineCodes.includes(line.code));

  return (
    <div
      id="stop-details-modal"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 250,
        backgroundColor: 'var(--bg-sheet, #121214)',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        borderTop: '1px solid var(--border-medium, rgba(255, 255, 255, 0.12))',
        boxShadow: 'var(--shadow-sheet, 0 -10px 40px rgba(0, 0, 0, 0.85))',
        maxHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      {/* Handle & Close */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 10px 20px', borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-card, #18181B)',
              border: '1.5px solid #2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563EB',
              flexShrink: 0
            }}
          >
            <Bus size={20} />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary, #FFFFFF)', letterSpacing: '-0.02em' }}>
              {stop.stopName}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted, #A1A1AA)', marginTop: '2px' }}>
              <span>Parada #{stop.stopId}</span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#2563EB', fontWeight: 700 }}>
                <Footprints size={12} />
                {userLocation.isRealGPS ? `${distanceMeters} m em linha reta (~${walkMinutes} min estimados)` : 'Localização indisponível'}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            haptic.lightTap();
            onClose();
          }}
          style={{
            background: 'var(--bg-pill, rgba(255, 255, 255, 0.08))',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary, #FFFFFF)',
            cursor: 'pointer'
          }}
          aria-label="Fechar"
        >
          <X size={16} />
        </button>
      </div>

      {/* Passing Lines & Scheduled Times */}
      <div className="scroll-container" style={{ flex: 1, overflowY: 'auto', padding: '14px 20px 24px 20px' }}>
        <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted, #71717A)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
          Linhas que Atendem Esta Parada
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {passingLines.length === 0 && <p style={{ color: 'var(--text-muted, #A1A1AA)' }}>Linhas desta parada indisponíveis.</p>}
          {passingLines.map((line) => {
            const colorInfo = getBusLineColor(line.code);

            return (
              <div
                key={line.id}
                onClick={() => {
                  haptic.mediumTap();
                  onSelectLine(line);
                  onClose();
                }}
                style={{
                  backgroundColor: 'var(--bg-card, #18181B)',
                  borderRadius: '16px',
                  padding: '14px 16px',
                  border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                  boxShadow: 'var(--shadow-card, 0 2px 8px rgba(0,0,0,0.2))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      padding: '6px 12px',
                      borderRadius: '10px',
                      backgroundColor: colorInfo.bg,
                      color: colorInfo.text,
                      fontWeight: 900,
                      fontSize: '15px',
                      flexShrink: 0,
                      textAlign: 'center'
                    }}
                  >
                    {line.code}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary, #FFFFFF)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {line.name.includes('-') ? line.name.slice(line.name.indexOf('-') + 1).trim() : line.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted, #A1A1AA)', marginTop: '3px' }}>
                      <Clock size={13} color="#2563EB" />
                      <span style={{ color: '#2563EB', fontWeight: 700 }}>Previsão indisponível</span>
                      <span>•</span>
                      <span>{colorInfo.serviceType}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#EA580C', fontSize: '12px', fontWeight: 700, marginLeft: '10px', flexShrink: 0 }}>
                  <span>Ver rota</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
