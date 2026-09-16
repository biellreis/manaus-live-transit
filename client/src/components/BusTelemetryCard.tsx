import React from 'react';
import type { LiveBus, RouteSummary, TripDetail } from '../types/transit.js';
import { Bus, Compass, X, Radio, Activity } from 'lucide-react';
import { useHaptic } from '../hooks/useHaptic.js';

interface BusTelemetryCardProps {
  bus: LiveBus;
  line: RouteSummary | null;
  activeTrip: TripDetail | null;
  onClose: () => void;
}

// Helper to compute projection of point onto segment and calculate true route progress [0..1]
function calculateRealProgress(busLat: number, busLng: number, coords: [number, number][]): number {
  if (!coords || coords.length < 2) return 0.5;

  let bestDist = Infinity;
  let bestSegmentIndex = 0;
  let bestT = 0;

  for (let i = 0; i < coords.length - 1; i++) {
    const a = coords[i];
    const b = coords[i + 1];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) continue;

    const t = Math.max(0, Math.min(1, ((busLng - a[0]) * dx + (busLat - a[1]) * dy) / lenSq));
    const projLng = a[0] + t * dx;
    const projLat = a[1] + t * dy;
    const distSq = (busLng - projLng) ** 2 + (busLat - projLat) ** 2;

    if (distSq < bestDist) {
      bestDist = distSq;
      bestSegmentIndex = i;
      bestT = t;
    }
  }

  // Fraction of polyline segments completed
  const totalSegments = coords.length - 1;
  const completedSegments = bestSegmentIndex + bestT;
  return Math.min(1, Math.max(0, completedSegments / totalSegments));
}

export const BusTelemetryCard: React.FC<BusTelemetryCardProps> = ({
  bus,
  line,
  activeTrip,
  onClose
}) => {
  const haptic = useHaptic();

  const getCardinal = (deg: number) => {
    const directions = ['Norte', 'Nordeste', 'Leste', 'Sudeste', 'Sul', 'Sudoeste', 'Oeste', 'Noroeste'];
    return directions[Math.round(deg / 45) % 8];
  };

  const originStop = activeTrip?.stops[0]?.stopName || 'Terminal Origem';
  const destStop = activeTrip?.stops[activeTrip.stops.length - 1]?.stopName || 'Terminal Destino';

  // Calculate real progress percentage along the bus route
  const progressRatio = activeTrip && activeTrip.coordinates.length > 1
    ? calculateRealProgress(bus.lat, bus.lng, activeTrip.coordinates)
    : 0.5;
  const progressPercent = Math.round(progressRatio * 100);

  // Time since last GPS transmission
  const secondsAgo = Math.max(1, Math.round((Date.now() - (bus.timestamp || Date.now())) / 1000));
  const timeText = secondsAgo < 60 ? `${secondsAgo}s atrás` : `${Math.round(secondsAgo / 60)} min atrás`;

  return (
    <div
      className="glass-panel"
      style={{
        position: 'absolute',
        top: 'calc(var(--sat) + 110px)',
        left: '16px',
        right: '16px',
        borderRadius: '16px',
        padding: '16px',
        zIndex: 25,
        boxShadow: 'var(--shadow-card)',
        border: '1px solid var(--border-medium)',
        backgroundColor: 'rgba(15, 23, 42, 0.94)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: '#1E293B',
              border: '1.5px solid var(--border-medium)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#F8FAFC'
            }}
          >
            <Bus size={20} color="#3B82F6" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="font-mono-num" style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                Veículo #{bus.id}
              </span>
              <span
                style={{
                  background: 'rgba(5, 150, 105, 0.15)',
                  border: '1px solid rgba(5, 150, 105, 0.3)',
                  color: 'var(--color-success)',
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                Conectado
              </span>
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Linha {bus.routeCode || line?.code || ''} • {bus.headsign}
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            haptic.lightTap();
            onClose();
          }}
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: 'none',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-secondary)'
          }}
          aria-label="Fechar"
        >
          <X size={15} />
        </button>
      </div>

      {/* Real Route Progress Bar */}
      <div style={{ marginBottom: '14px', background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
          <span style={{ maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600 }}>
            {originStop}
          </span>
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#3B82F6' }}>
            {progressPercent}% do trajeto
          </span>
          <span style={{ maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'right', fontWeight: 600 }}>
            {destStop}
          </span>
        </div>

        {/* Real Progress Track */}
        <div style={{ width: '100%', height: '5px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', position: 'relative' }}>
          <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--color-accent)', borderRadius: '3px', transition: 'width 0.5s ease' }} />
          <div
            style={{
              position: 'absolute',
              left: `${progressPercent}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#FFFFFF',
              border: '2.5px solid var(--color-accent)',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
              transition: 'left 0.5s ease'
            }}
          />
        </div>
      </div>

      {/* Telemetry Metrics Grid with Verified Data */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
          textAlign: 'center',
          fontSize: '11px'
        }}
      >
        {/* Status / Movement */}
        <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '8px 4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ color: '#3B82F6', marginBottom: '3px', display: 'flex', justifyContent: 'center' }}>
            <Activity size={13} />
          </div>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '11px' }}>
            {bus.speedKmh ? `${bus.speedKmh} km/h` : 'Em trânsito'}
          </div>
          <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '1px' }}>Movimento</div>
        </div>

        {/* Heading */}
        <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '8px 4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ color: '#3B82F6', marginBottom: '3px', display: 'flex', justifyContent: 'center' }}>
            <Compass size={13} />
          </div>
          <div className="font-mono-num" style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '11px' }}>
            {Math.round(bus.heading)}°
          </div>
          <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '1px' }}>{getCardinal(bus.heading)}</div>
        </div>

        {/* Direction */}
        <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '8px 4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ color: '#3B82F6', marginBottom: '3px', display: 'flex', justifyContent: 'center' }}>
            <Bus size={13} />
          </div>
          <div style={{ fontWeight: 700, color: bus.direction === 'volta' ? '#F97316' : '#60A5FA', fontSize: '11px' }}>
            {bus.direction === 'volta' ? 'Volta' : 'Ida'}
          </div>
          <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '1px' }}>Sentido</div>
        </div>

        {/* Signal freshness */}
        <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '8px 4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ color: '#10B981', marginBottom: '3px', display: 'flex', justifyContent: 'center' }}>
            <Radio size={13} />
          </div>
          <div style={{ fontWeight: 700, color: '#10B981', fontSize: '11px' }}>
            {timeText}
          </div>
          <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '1px' }}>Sinal</div>
        </div>
      </div>
    </div>
  );
};
