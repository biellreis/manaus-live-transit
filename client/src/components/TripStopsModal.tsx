import React, { useMemo, useEffect } from 'react';
import type { TripDetail, RouteSummary, LiveBus, StopInfo, PlannedTrip } from '../types/transit.js';
import { X, ArrowLeft, Bus, MapPin, ArrowRightLeft } from 'lucide-react';
import { useHaptic } from '../hooks/useHaptic.js';

interface TripStopsModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripDetail;
  line?: RouteSummary | null;
  vehicles: LiveBus[];
  plannedTrip?: PlannedTrip | null;
  onSelectStop: (stop: StopInfo) => void;
}

export const TripStopsModal: React.FC<TripStopsModalProps> = ({
  isOpen,
  onClose,
  trip,
  line,
  vehicles,
  plannedTrip,
  onSelectStop
}) => {
  const haptic = useHaptic();

  const isVolta = trip.directionType === 'volta';
  const activeDirection = isVolta ? 'volta' : 'ida';

  // Listen for escape or android back button with history synchronization
  useEffect(() => {
    if (!isOpen) return;
    window.history.pushState({ modal: 'trip_stops' }, '');
    const handlePopState = (e: PopStateEvent) => {
      e.stopImmediatePropagation();
      onClose();
    };
    window.addEventListener('popstate', handlePopState, { capture: true });
    return () => window.removeEventListener('popstate', handlePopState, { capture: true });
  }, [isOpen, onClose]);

  const handleClose = () => {
    haptic.lightTap();
    if (window.history.state?.modal === 'trip_stops') {
      window.history.back();
    } else {
      onClose();
    }
  };

  // Filter vehicles on this trip's direction
  const activeVehicles = useMemo(() => {
    return vehicles.filter(v => (!v.direction || v.direction === 'desconhecido' ? true : v.direction === activeDirection));
  }, [vehicles, activeDirection]);

  // Real-time mapping of buses to stops
  const { busesPerStop, leadStopIndex } = useMemo(() => {
    const map = new Map<number, { bus: LiveBus; isLead: boolean }[]>();
    if (!trip.stops || trip.stops.length === 0 || activeVehicles.length === 0) {
      return { busesPerStop: map, leadStopIndex: -1 };
    }

    const busAssignments: { bus: LiveBus; stopIndex: number; distance: number }[] = [];
    for (const bus of activeVehicles) {
      let minDistance = Infinity;
      let closestIndex = -1;

      trip.stops.forEach((stop, index) => {
        const d = Math.hypot(stop.lat - bus.lat, stop.lng - bus.lng);
        if (d < minDistance) {
          minDistance = d;
          closestIndex = index;
        }
      });

      if (closestIndex !== -1 && minDistance < 0.015) {
        busAssignments.push({ bus, stopIndex: closestIndex, distance: minDistance });
      }
    }

    busAssignments.sort((a, b) => b.stopIndex - a.stopIndex);
    const maxStopIndex = busAssignments.length > 0 ? busAssignments[0].stopIndex : -1;

    busAssignments.forEach((item, i) => {
      const existing = map.get(item.stopIndex) || [];
      existing.push({ bus: item.bus, isLead: i === 0 });
      map.set(item.stopIndex, existing);
    });

    return { busesPerStop: map, leadStopIndex: maxStopIndex };
  }, [trip.stops, activeVehicles]);

  if (!isOpen) return null;

  const stops = trip.stops || [];
  const lineCode = line?.code || trip.tripShortName || '';
  const tripTitle = trip.tripName || line?.name || 'Itinerário';

  const userBoardStopId = plannedTrip?.originStop?.stopId;
  const userDestStopId = plannedTrip?.destStop?.stopId;
  const transferStopId = plannedTrip?.isTransfer && plannedTrip.legs.length > 1
    ? plannedTrip.legs[0].destStop.stopId
    : null;

  return (
    <div
      id="trip-stops-modal-screen"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        backgroundColor: 'var(--bg-canvas, #09090B)',
        color: 'var(--text-main, #FFFFFF)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      {/* Full Top Header Bar */}
      <div
        style={{
          paddingTop: 'max(env(safe-area-inset-top, 0px), 16px)',
          paddingBottom: '14px',
          paddingLeft: '16px',
          paddingRight: '16px',
          borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
          backgroundColor: 'var(--bg-card, #121214)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
          <button
            id="back-trip-stops-modal-btn"
            onClick={handleClose}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
              color: 'var(--text-main, #FFFFFF)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0
            }}
            aria-label="Voltar para rota"
          >
            <ArrowLeft size={20} />
          </button>

          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 900,
                  backgroundColor: isVolta ? '#F97316' : '#2563EB',
                  color: '#FFFFFF',
                  padding: '3px 9px',
                  borderRadius: '6px',
                  letterSpacing: '0.02em',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)'
                }}
              >
                Linha {lineCode}
              </span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-sub, #A1A1AA)' }}>
                {stops.length} Paradas no Trajeto
              </span>
            </div>

            <div
              style={{
                fontSize: '15px',
                fontWeight: 800,
                color: 'var(--text-main, #FFFFFF)',
                marginTop: '3px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {tripTitle}
            </div>
          </div>
        </div>

        <button
          id="close-trip-stops-modal-btn"
          onClick={handleClose}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
            color: 'var(--text-main, #FFFFFF)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0
          }}
          aria-label="Fechar itinerário"
        >
          <X size={18} />
        </button>
      </div>

      {/* Live Buses Status Card (Card diagramado igual aos outros, SEM COR VERDE) */}
      {activeVehicles.length > 0 && (
        <div style={{ padding: '14px 20px 0 20px' }}>
          <div
            style={{
              backgroundColor: 'var(--bg-card, #18181B)',
              borderRadius: '16px',
              padding: '12px 16px',
              border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              boxShadow: 'var(--shadow-card, 0 2px 10px rgba(0, 0, 0, 0.2))'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: isVolta ? 'rgba(249, 115, 22, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isVolta ? '#F97316' : '#3B82F6'
                }}
              >
                <Bus size={20} />
              </div>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-main, #FFFFFF)' }}>
                  {activeVehicles.length} {activeVehicles.length === 1 ? 'Ônibus em circulação' : 'Ônibus em circulação'}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-sub, #A1A1AA)', marginTop: '2px' }}>
                  Monitoramento em tempo real via GPS ({isVolta ? 'Trajeto de Volta' : 'Trajeto de Ida'})
                </div>
              </div>
            </div>

            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: isVolta ? '#F97316' : '#3B82F6',
                backgroundColor: isVolta ? 'rgba(249, 115, 22, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                padding: '4px 10px',
                borderRadius: '8px',
                border: `1px solid ${isVolta ? 'rgba(249, 115, 22, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
                letterSpacing: '0.04em'
              }}
            >
              AO VIVO
            </span>
          </div>
        </div>
      )}

      {/* Scrollable Full-Screen Stops Timeline */}
      <div
        className="scroll-container"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 20px',
          display: 'flex',
            flexDirection: 'column',
            gap: '0'
          }}
        >
          {stops.map((stop, index) => {
            const isFirst = index === 0;
            const isLast = index === stops.length - 1;
            const isUserBoard = stop.stopId === userBoardStopId;
            const isUserDest = stop.stopId === userDestStopId;
            const isTransferStop = stop.stopId === transferStopId;

            const busesHere = busesPerStop.get(index) || [];
            const hasBus = busesHere.length > 0;
            const hasLeadBus = busesHere.some(b => b.isLead);
            const isPassed = index < leadStopIndex;

            const upperName = stop.stopName.toUpperCase();
            const isHub = upperName.includes('TERMINAL') ||
              upperName.includes('PLATAFORMA') ||
              upperName.includes('ESTAÇÃO') ||
              upperName.includes('ESTACAO') ||
              /\bT[1-6]\b/.test(upperName) ||
              /\bE[1-4]\b/.test(upperName);

            return (
              <div
                key={`${stop.stopId}-${index}`}
                onClick={() => {
                  haptic.lightTap();
                  onSelectStop(stop);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  padding: '12px 14px',
                  cursor: 'pointer',
                  borderRadius: '14px',
                  backgroundColor: isUserBoard
                    ? 'rgba(37, 99, 235, 0.18)'
                    : isUserDest
                      ? 'rgba(234, 88, 12, 0.18)'
                      : isTransferStop
                        ? 'rgba(255, 255, 255, 0.12)'
                        : isHub
                          ? 'rgba(255, 255, 255, 0.05)'
                          : hasBus
                            ? (hasLeadBus ? 'rgba(37, 99, 235, 0.12)' : 'rgba(249, 115, 22, 0.08)')
                            : 'transparent',
                  border: isUserBoard
                    ? '1.5px solid #3B82F6'
                    : isUserDest
                      ? '1.5px solid #EA580C'
                      : isTransferStop
                        ? '1.5px solid #FFFFFF'
                        : isHub
                          ? '1px solid rgba(255, 255, 255, 0.2)'
                          : hasBus
                            ? `1px solid ${hasLeadBus ? 'rgba(37, 99, 235, 0.3)' : 'rgba(249, 115, 22, 0.25)'}`
                            : '1px solid transparent',
                  marginBottom: '4px',
                  transition: 'all 0.15s ease'
                }}
              >
                {/* Visual Timeline Marker */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '22px', flexShrink: 0, marginTop: '2px' }}>
                  {hasBus ? (
                    <div
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '6px',
                        backgroundColor: hasLeadBus ? '#2563EB' : '#F97316',
                        border: '2px solid #FFFFFF',
                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF'
                      }}
                    >
                      <Bus size={12} strokeWidth={2.6} />
                    </div>
                  ) : isTransferStop ? (
                    <div
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        backgroundColor: '#18181B',
                        border: '2px solid #FFFFFF',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF'
                      }}
                      title="Troca de ônibus"
                    >
                      <ArrowRightLeft size={11} color="#FFFFFF" strokeWidth={3} />
                    </div>
                  ) : isUserBoard ? (
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: '#2563EB',
                        border: '2px solid #FFFFFF',
                        boxShadow: '0 2px 8px rgba(37, 99, 235, 0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF'
                      }}
                    >
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#FFFFFF' }} />
                    </div>
                  ) : isUserDest ? (
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: '#EA580C',
                        border: '2px solid #FFFFFF',
                        boxShadow: '0 2px 8px rgba(234, 88, 12, 0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF'
                      }}
                    >
                      <MapPin size={11} color="#FFFFFF" strokeWidth={3} />
                    </div>
                  ) : (
                    <div
                      style={{
                        width: isHub ? '14px' : isFirst || isLast ? '12px' : '9px',
                        height: isHub ? '14px' : isFirst || isLast ? '12px' : '9px',
                        borderRadius: isHub ? '3px' : '50%',
                        backgroundColor: isHub
                          ? '#FFFFFF'
                          : isFirst || isLast
                            ? (isVolta ? '#F97316' : '#2563EB')
                            : isPassed
                              ? 'rgba(255, 255, 255, 0.25)'
                              : 'rgba(255, 255, 255, 0.6)',
                        border: isHub ? '2px solid #2563EB' : '1.5px solid rgba(0, 0, 0, 0.3)'
                      }}
                    />
                  )}

                  {!isLast && (
                    <div
                      style={{
                        width: '2px',
                        height: '24px',
                        backgroundColor: isPassed ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.35)',
                        margin: '3px 0'
                      }}
                    />
                  )}
                </div>

                {/* Stop Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-sub, #71717A)', minWidth: '22px' }}>
                        #{index + 1}
                      </span>
                      <span
                        style={{
                          fontSize: '14.5px',
                          fontWeight: isUserBoard || isUserDest || isTransferStop || isHub ? 800 : 700,
                          color: isUserBoard
                            ? '#60A5FA'
                            : isUserDest
                              ? '#FB923C'
                              : isTransferStop
                                ? '#FFFFFF'
                                : 'var(--text-main, #FFFFFF)'
                        }}
                      >
                        {stop.stopName}
                      </span>
                    </div>

                    {/* Sequence or arrival time */}
                    {hasBus && (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 900,
                          color: '#FFFFFF',
                          backgroundColor: hasLeadBus ? '#2563EB' : '#F97316',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          flexShrink: 0
                        }}
                      >
                        {hasLeadBus ? 'Ônibus aqui' : `${busesHere.length} ônibus`}
                      </span>
                    )}
                  </div>

                  {/* Context Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                    {isUserBoard && (
                      <span style={{ fontSize: '10px', fontWeight: 800, backgroundColor: '#2563EB', color: '#FFFFFF', padding: '2px 7px', borderRadius: '4px' }}>
                        Seu Embarque
                      </span>
                    )}
                    {isUserDest && (
                      <span style={{ fontSize: '10px', fontWeight: 800, backgroundColor: '#EA580C', color: '#FFFFFF', padding: '2px 7px', borderRadius: '4px' }}>
                        Seu Desembarque (Mais Próximo)
                      </span>
                    )}
                    {isTransferStop && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 800, backgroundColor: '#FFFFFF', color: '#000000', padding: '2px 7px', borderRadius: '4px' }}>
                        <ArrowRightLeft size={10} color="#000000" strokeWidth={3} />
                        Troca de Ônibus
                      </span>
                    )}
                    {isHub && (
                      <span style={{ fontSize: '10px', fontWeight: 800, backgroundColor: 'rgba(255, 255, 255, 0.12)', color: '#CBD5E1', padding: '2px 6px', borderRadius: '4px' }}>
                        Terminal / Estação
                      </span>
                    )}
                    {hasBus && busesHere.map((b, bIdx) => (
                      <span key={bIdx} style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 600 }}>
                        Prefixo: {b.bus.id} {b.bus.speedKmh ? `• ${Math.round(b.bus.speedKmh)} km/h` : ''}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      {/* Bottom Footer Bar */}
      <div style={{ padding: '12px 20px max(env(safe-area-inset-bottom, 0px), 16px) 20px', borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))', backgroundColor: 'var(--bg-card, #121214)' }}>
        <button
          onClick={handleClose}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '14px',
            backgroundColor: '#2563EB',
            border: 'none',
            color: '#FFFFFF',
            fontSize: '15px',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(37, 99, 235, 0.35)'
          }}
        >
          Voltar para a Rota
        </button>
      </div>
    </div>
  );
};
