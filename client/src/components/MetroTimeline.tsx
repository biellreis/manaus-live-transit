import React, { useState } from 'react';
import type { TripDetail, LiveBus, StopInfo, TimetableDeparture } from '../types/transit.js';
import { Bus, X } from 'lucide-react';
import { useHaptic } from '../hooks/useHaptic.js';

interface MetroTimelineProps {
  trip: TripDetail;
  departures: TimetableDeparture[];
  vehicles: LiveBus[];
  onSelectStop: (stop: StopInfo) => void;
  onSelectBus: (bus: LiveBus) => void;
}

export const MetroTimeline: React.FC<MetroTimelineProps> = ({
  trip,
  departures,
  vehicles,
  onSelectStop,
  onSelectBus
}) => {
  const [selectedStopForSchedule, setSelectedStopForSchedule] = useState<StopInfo | null>(null);
  const haptic = useHaptic();

  const stops = trip.stops || [];

  // Helper to add seconds to "HH:mm"
  const addSecondsToTime = (timeStr: string, seconds: number): string => {
    if (!timeStr || !timeStr.includes(':')) return '--:--';
    const [h, m] = timeStr.split(':').map(Number);
    const totalMinutes = h * 60 + m + Math.round(seconds / 60);
    const newH = Math.floor(totalMinutes / 60) % 24;
    const newM = totalMinutes % 60;
    return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
  };

  // Find the next upcoming departure based on current time
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let nextDeparture = departures.find(d => {
    const [h, m] = d.time.split(':').map(Number);
    return h * 60 + m >= currentMinutes;
  });

  // If late night, wrap around to the first morning departure
  if (!nextDeparture && departures.length > 0) {
    nextDeparture = departures[0];
  }

  const baseDepartureTime = nextDeparture?.time || '06:00';

  // Match live vehicles to stops along this trip
  const getVehicleNearStop = (stop: StopInfo): LiveBus | undefined => {
    return vehicles.find(v => {
      // Must match direction tripId if available
      if (v.tripId && v.tripId !== trip.tripId) return false;
      const latDiff = Math.abs(v.lat - stop.lat);
      const lngDiff = Math.abs(v.lng - stop.lng);
      return latDiff < 0.0035 && lngDiff < 0.0035;
    });
  };

  return (
    <div style={{ padding: '0 2px' }}>
      {/* Metro Rail stops list */}
      <div style={{ position: 'relative', paddingLeft: '56px', paddingBottom: '30px' }}>
        {/* Continuous Metro Rail Track */}
        <div
          style={{
            position: 'absolute',
            top: '16px',
            bottom: '16px',
            left: '34px',
            width: '3px',
            background: trip.directionType === 'volta' ? 'var(--color-route-volta)' : 'var(--color-route-ida)',
            borderRadius: '2px'
          }}
        />

        {stops.map((stop) => {
          const arrivalTime = addSecondsToTime(baseDepartureTime, stop.timeSeconds);
          const nearbyBus = getVehicleNearStop(stop);
          const isTerminal = stop.stopName.toUpperCase().includes('TERMINAL') || stop.stopName.toUpperCase().includes('PLATAFORMA') || stop.stopName.toUpperCase().includes('ESTAÇÃO') || /\bT[1-6]\b/.test(stop.stopName.toUpperCase()) || /\bE[1-4]\b/.test(stop.stopName.toUpperCase());

          return (
            <div
              key={stop.stopId}
              onClick={() => {
                haptic.lightTap();
                onSelectStop(stop);
              }}
              className="interactive-tap"
              style={{
                position: 'relative',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: '6px 8px',
                borderRadius: '10px',
                background: isTerminal ? 'rgba(255, 255, 255, 0.08)' : nearbyBus ? 'rgba(37, 99, 235, 0.12)' : 'transparent',
                border: isTerminal ? '1px solid #FFFFFF' : nearbyBus ? '1px solid var(--border-medium)' : '1px solid transparent'
              }}
            >
              {/* Scheduled Passage Time Column */}
              <div
                className="font-mono-num"
                style={{
                  position: 'absolute',
                  left: '-56px',
                  top: '4px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: isTerminal ? '#FFFFFF' : nearbyBus ? '#60A5FA' : 'var(--text-secondary)',
                  width: '32px',
                  textAlign: 'right'
                }}
              >
                {arrivalTime}
              </div>

              {/* Station Node on Rail */}
              <div
                style={{
                  position: 'absolute',
                  left: '-24px',
                  top: '7px',
                  width: isTerminal ? '13px' : '9px',
                  height: isTerminal ? '13px' : '9px',
                  borderRadius: '50%',
                  background: isTerminal ? '#FFFFFF' : '#111827',
                  border: isTerminal ? '2.5px solid #FFFFFF' : `2.5px solid ${trip.directionType === 'volta' ? 'var(--color-route-volta)' : 'var(--color-route-ida)'}`,
                  boxShadow: 'none',
                  transform: isTerminal ? 'translate(-2px, -2px)' : 'none'
                }}
              />

              {/* Stop Information */}
              <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: isTerminal ? 900 : 500,
                    color: isTerminal ? '#FFFFFF' : 'var(--text-primary)',
                    lineHeight: '1.3',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    flexWrap: 'wrap'
                  }}
                >
                  {isTerminal && (
                    <span
                      style={{
                        backgroundColor: '#FFFFFF',
                        color: '#000000',
                        fontSize: '9px',
                        fontWeight: 900,
                        padding: '1px 5px',
                        borderRadius: '4px',
                        textTransform: 'uppercase'
                      }}
                    >
                      TERMINAL / PLATAFORMA
                    </span>
                  )}
                  <span>{stop.stopName}</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Parada #{stop.sequence}</span>
                  <span>•</span>
                  <span>{stop.distKm > 0 ? `${stop.distKm} km` : 'Terminal Origem'}</span>
                  
                  {/* View All Times Trigger */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      haptic.lightTap();
                      setSelectedStopForSchedule(stop);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-accent)',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      padding: 0
                    }}
                  >
                    Ver horários
                  </button>
                </div>
              </div>

              {/* Live Bus Near This Stop Badge */}
              {nearbyBus && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    haptic.mediumTap();
                    onSelectBus(nearbyBus);
                  }}
                  className="interactive-tap"
                  style={{
                    background: '#1E293B',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    padding: '4px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    color: '#60A5FA',
                    fontSize: '11px',
                    fontWeight: 700,
                    boxShadow: 'var(--shadow-subtle)'
                  }}
                >
                  <Bus size={12} />
                  <span className="font-mono-num">#{nearbyBus.id}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* STOP SCHEDULE MODAL (All departure times at this specific stop) */}
      {selectedStopForSchedule && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            zIndex: 60,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center'
          }}
          onClick={() => setSelectedStopForSchedule(null)}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '520px',
              maxHeight: '75dvh',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Horários Programados na Parada
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {selectedStopForSchedule.stopName}
                </div>
              </div>

              <button
                onClick={() => setSelectedStopForSchedule(null)}
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
              >
                <X size={15} />
              </button>
            </div>

            <div className="scroll-container" style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                Previsão calculada a partir das saídas do terminal (+{Math.round(selectedStopForSchedule.timeSeconds / 60)} min):
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {departures.map((d, idx) => {
                  const passTime = addSecondsToTime(d.time, selectedStopForSchedule.timeSeconds);
                  const isPast = (() => {
                    const [h, m] = passTime.split(':').map(Number);
                    return h * 60 + m < currentMinutes;
                  })();

                  return (
                    <div
                      key={idx}
                      className="font-mono-num"
                      style={{
                        background: isPast ? 'rgba(255,255,255,0.02)' : 'rgba(37, 99, 235, 0.1)',
                        border: isPast ? '1px solid var(--border-subtle)' : '1px solid rgba(37, 99, 235, 0.4)',
                        borderRadius: '6px',
                        padding: '6px 4px',
                        textAlign: 'center',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: isPast ? 'var(--text-muted)' : '#F8FAFC'
                      }}
                    >
                      {passTime}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
