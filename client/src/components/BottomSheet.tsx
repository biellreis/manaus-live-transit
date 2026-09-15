import React, { useState, useMemo, useEffect } from 'react';
import type { RouteSummary, TripDetail, LiveBus, TimetableService, StopInfo, PlannedTrip } from '../types/transit.js';
import { Bus, ChevronUp, ChevronDown, Check, X, MapPin, Clock } from 'lucide-react';
import { useHaptic } from '../hooks/useHaptic.js';

interface BottomSheetProps {
  selectedLine: RouteSummary | null;
  activeTrip: TripDetail | null;
  allTrips: TripDetail[];
  vehicles: LiveBus[];
  schedule: TimetableService[];
  plannedTrip?: PlannedTrip | null;
  onSelectTrip: (trip: TripDetail) => void;
  onSelectStop: (stop: StopInfo) => void;
  onSelectBus: (bus: LiveBus) => void;
  onCloseRoute?: () => void;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  selectedLine,
  activeTrip,
  allTrips,
  vehicles,
  schedule: _schedule,
  plannedTrip = null,
  onSelectTrip,
  onSelectStop,
  onSelectBus: _onSelectBus,
  onCloseRoute
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const haptic = useHaptic();


  const isVolta = activeTrip?.directionType === 'volta';
  const activeDirection = isVolta ? 'volta' : 'ida';
  const themeColor = isVolta ? '#F97316' : '#3B82F6';

  // Strict Direction Filter: Show vehicles matching active direction, preserving unknown direction so buses are never lost
  const activeVehicles = useMemo(() => {
    return vehicles.filter(v => (!v.direction || v.direction === 'desconhecido' ? true : v.direction === activeDirection));
  }, [vehicles, activeDirection]);


  const isWithinOperationalHours = activeVehicles.length > 0;

  // Real-time mapping of ALL circulating buses along the route stops (Lead bus, trailing buses behind)
  const { busesPerStop, leadStopIndex } = useMemo(() => {
    const map = new Map<number, { bus: LiveBus; rank: number; isLead: boolean }[]>();
    if (!activeTrip || !activeTrip.stops || activeTrip.stops.length === 0 || !activeVehicles || activeVehicles.length === 0) {
      return { busesPerStop: map, leadStopIndex: 0 };
    }

    // Map every active bus in this direction to its closest stop along the sequence
    const positions = activeVehicles.map(bus => {
      let closestIndex = 0;
      let minDistance = Infinity;
      for (let i = 0; i < activeTrip.stops.length; i++) {
        const s = activeTrip.stops[i];
        const d = Math.hypot(s.lat - bus.lat, s.lng - bus.lng);
        if (d < minDistance) {
          minDistance = d;
          closestIndex = i;
        }
      }
      return { bus, stopIndex: closestIndex };
    });

    // Sort descending by stopIndex (buses further along the route are in front, trailing buses follow behind)
    positions.sort((a, b) => b.stopIndex - a.stopIndex);

    positions.forEach((item, idx) => {
      const existing = map.get(item.stopIndex) || [];
      existing.push({
        bus: item.bus,
        rank: idx + 1,
        isLead: idx === 0
      });
      map.set(item.stopIndex, existing);
    });

    const leadStopIndex = positions.length > 0 ? positions[0].stopIndex : 0;
    return { busesPerStop: map, leadStopIndex };
  }, [activeTrip, activeVehicles]);

  // Auto-scroll to the current bus location along the route
  useEffect(() => {
    if (isExpanded) {
      const timer = setTimeout(() => {
        const el = document.getElementById('current-bus-stop-card');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isExpanded, leadStopIndex]);

  if (!selectedLine || !activeTrip) return null;

  return (
    <div
      id="uber-route-bottom-sheet"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: '#09090B',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        borderTop: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.8)',
        maxHeight: isExpanded ? '75vh' : 'auto',
        transition: 'max-height 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none'
      }}
    >
      {/* Drag Handle Bar */}
      <div
        onClick={() => {
          haptic.lightTap();
          setIsExpanded(!isExpanded);
        }}
        style={{
          width: '100%',
          padding: '10px 0 6px 0',
          display: 'flex',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
      >
        <div
          style={{
            width: '40px',
            height: '4px',
            borderRadius: '999px',
            backgroundColor: 'rgba(255, 255, 255, 0.25)'
          }}
        />
      </div>

      {/* Primary Line Header & Direction Pills */}
      <div style={{ padding: '4px 20px 14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                padding: '4px 12px',
                borderRadius: '10px',
                backgroundColor: themeColor,
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: '18px',
                letterSpacing: '-0.02em',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.5)'
              }}
            >
              {selectedLine.code}
            </div>

            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                {selectedLine.name.split('-')[1]?.trim() || selectedLine.name}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <span style={{ fontSize: '12px', color: isVolta ? '#F97316' : '#3B82F6', fontWeight: 700 }}>
                  {activeVehicles.length} {activeVehicles.length === 1 ? 'ônibus ativo na rota' : 'ônibus ativos na rota'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => {
                haptic.lightTap();
                setIsExpanded(!isExpanded);
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                cursor: 'pointer'
              }}
              aria-label="Expandir detalhes"
            >
              {isExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </button>

            {onCloseRoute && (
              <button
                id="close-route-bottomsheet-button"
                onClick={() => {
                  haptic.lightTap();
                  onCloseRoute();
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  cursor: 'pointer'
                }}
                aria-label="Fechar trajeto"
                title="Fechar rota"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Direction Switcher (Sentido Ida vs Volta - strictly equal 50% width) */}
        {allTrips.length >= 2 && (
          <div
            style={{
              display: 'flex',
              backgroundColor: '#18181B',
              borderRadius: '12px',
              padding: '3px',
              gap: '4px',
              width: '100%',
              boxSizing: 'border-box',
              marginBottom: '12px'
            }}
          >
            {allTrips.slice(0, 2).map((trip, tIdx) => {
              const isSelected = activeTrip?.tripId === trip.tripId;
              const isFirst = tIdx === 0;
              const label = isFirst
                ? `IDA • ${trip.tripShortName || 'Sentido 1'}`
                : `VOLTA • ${trip.tripShortName || 'Sentido 2'}`;

              return (
                <button
                  key={trip.tripId || tIdx}
                  onClick={() => {
                    haptic.mediumTap();
                    onSelectTrip(trip);
                  }}
                  style={{
                    flex: '1 1 50%',
                    width: '50%',
                    minWidth: 0,
                    boxSizing: 'border-box',
                    padding: '10px 6px',
                    borderRadius: '99px',
                    fontSize: '12px',
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? (isFirst ? '#2563EB' : '#EA580C') : 'transparent',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {isSelected && <Check size={14} style={{ flexShrink: 0 }} />}
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Real Vehicle Telemetry Status Card (Apenas para navegação de linha avulsa) */}
        {!plannedTrip && (
          <div
            style={{
              backgroundColor: '#18181B',
              borderRadius: '16px',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  backgroundColor: isVolta ? '#EA580C' : '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF'
                }}
              >
                <Bus size={22} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>
                  Linha {selectedLine.code} • {isVolta ? 'Trajeto de Volta' : 'Trajeto de Ida'}
                </div>
                <div style={{ fontSize: '12px', color: '#A1A1AA', marginTop: '1px' }}>
                  {activeTrip.stops.length} paradas • {activeTrip.totalDistanceKm > 0 ? `${activeTrip.totalDistanceKm} km` : 'Percurso urbano'}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  whiteSpace: 'nowrap',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: isWithinOperationalHours ? '#3B82F6' : '#94A3B8',
                  backgroundColor: isWithinOperationalHours ? 'rgba(59, 130, 246, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  border: isWithinOperationalHours ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(148, 163, 184, 0.3)',
                  lineHeight: 1
                }}
              >
                {isWithinOperationalHours ? 'EM OPERAÇÃO' : 'FORA DE PICO'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* PAINEL UNIFICADO UBER / 99 QUANDO UMA ROTA PLANEJADA ESTÁ ATIVA */}
      {plannedTrip && (() => {
        const isOriginTerminal = plannedTrip.origin.name?.toUpperCase().includes('TERMINAL') ||
          plannedTrip.origin.name?.toUpperCase().includes('ESTAÇÃO') ||
          plannedTrip.origin.name?.toUpperCase().includes('ESTACAO') ||
          plannedTrip.originStop.stopName?.toUpperCase().includes('TERMINAL') ||
          /\b[TE][1-6]\b/i.test(plannedTrip.origin.name || '') ||
          /\b[TE][1-6]\b/i.test(plannedTrip.originStop.stopName || '');

        const isDestTerminal = plannedTrip.destination.name?.toUpperCase().includes('TERMINAL') ||
          plannedTrip.destination.name?.toUpperCase().includes('ESTAÇÃO') ||
          plannedTrip.destination.name?.toUpperCase().includes('ESTACAO') ||
          plannedTrip.destStop.stopName?.toUpperCase().includes('TERMINAL') ||
          /\b[TE][1-6]\b/i.test(plannedTrip.destination.name || '') ||
          /\b[TE][1-6]\b/i.test(plannedTrip.destStop.stopName || '');

        const originPoint = plannedTrip.originPlatformOrPoint || (() => {
          const m = (plannedTrip.originStop.stopName || '').match(/\b(PONTO|PLATAFORMA)\s*([A-Z0-9]+)\b/i);
          return m ? `${m[1].charAt(0).toUpperCase() + m[1].slice(1).toLowerCase()} ${m[2].toUpperCase()}` : null;
        })();

        const destPoint = plannedTrip.destPlatformOrPoint || (() => {
          const m = (plannedTrip.destStop.stopName || '').match(/\b(PONTO|PLATAFORMA)\s*([A-Z0-9]+)\b/i);
          return m ? `${m[1].charAt(0).toUpperCase() + m[1].slice(1).toLowerCase()} ${m[2].toUpperCase()}` : null;
        })();

        return (
          <div style={{ padding: '0 20px 10px 20px' }}>
            <div
              style={{
                backgroundColor: '#18181B',
                borderRadius: '20px',
                padding: '18px 20px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              {/* Top Row: Previsão de Chegada e Badge Azul */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Passa na sua parada às
                  </div>
                  <div style={{ fontSize: '34px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.03em', lineHeight: 1.1, marginTop: '2px' }}>
                    {plannedTrip.etaTime || 'Em breve'}
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  {typeof plannedTrip.etaMinutes === 'number' ? (
                    <>
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: 900,
                          color: '#FFFFFF',
                          backgroundColor: '#2563EB',
                          padding: '6px 14px',
                          borderRadius: '10px',
                          boxShadow: '0 2px 8px rgba(37, 99, 235, 0.4)'
                        }}
                      >
                        {plannedTrip.etaMinutes <= 1 ? 'Chegando agora' : `Faltam ${plannedTrip.etaMinutes} min`}
                      </span>
                      {!isOriginTerminal && plannedTrip.walkToStopMinutes !== null && plannedTrip.walkToStopMinutes > 0 && (
                        <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, marginTop: '2px' }}>
                          Caminhada de {plannedTrip.walkToStopMinutes} min até o ponto
                        </span>
                      )}
                    </>
                  ) : (
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 800,
                        color: '#FFFFFF',
                        backgroundColor: '#2563EB',
                        padding: '5px 12px',
                        borderRadius: '8px'
                      }}
                    >
                      {plannedTrip.liveBusCount ? `${plannedTrip.liveBusCount} ônibus na rota` : 'Em operação'}
                    </span>
                  )}
                </div>
              </div>

              {/* Próximos ônibus (se houver mais de 1 veículo) */}
              {plannedTrip.upcomingBuses && plannedTrip.upcomingBuses.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.06)'
                  }}
                >
                  <div style={{ fontSize: '11.5px', color: '#CBD5E1', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} style={{ color: '#2563EB' }} />
                    <span>Próximos ônibus:</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {plannedTrip.upcomingBuses.slice(0, 2).map((nextBus, bIdx) => (
                      <span
                        key={bIdx}
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          color: '#FFFFFF',
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          padding: '3px 8px',
                          borderRadius: '6px'
                        }}
                      >
                        {nextBus.time} <span style={{ color: '#94A3B8', fontWeight: 600 }}>({nextBus.minutes} min)</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Divisor */}
              <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />

              {/* TIMELINE VERTICAL ESTILO UBER / 99 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0', position: 'relative' }}>
                {/* 1. EMBARQUE */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', position: 'relative', paddingBottom: '16px' }}>
                  <div style={{ position: 'absolute', left: '13px', top: '26px', bottom: '0', width: '2px', backgroundColor: '#2563EB' }} />
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: '#2563EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      flexShrink: 0,
                      zIndex: 1,
                      boxShadow: '0 2px 6px rgba(37, 99, 235, 0.5)'
                    }}
                  >
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FFFFFF' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#60A5FA', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {isOriginTerminal ? 'Embarque no Terminal' : 'Ponto de Partida'}
                    </div>
                    <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#FFFFFF', marginTop: '2px' }}>
                      {plannedTrip.origin.name}
                    </div>
                    {isOriginTerminal ? (
                      <div style={{ marginTop: '4px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            backgroundColor: '#2563EB',
                            color: '#FFFFFF',
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '3px 10px',
                            borderRadius: '6px'
                          }}
                        >
                          {originPoint || 'Terminal'}
                        </span>
                      </div>
                    ) : (
                      plannedTrip.walkToStopMeters !== null && plannedTrip.walkToStopMeters > 30 && (
                        <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
                          Caminhe {plannedTrip.walkToStopMeters}m até a parada {plannedTrip.originStop.stopName}
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* 2. LINHA DE ÔNIBUS */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', position: 'relative', paddingBottom: '16px' }}>
                  <div style={{ position: 'absolute', left: '13px', top: '26px', bottom: '0', width: '2px', backgroundColor: '#F97316' }} />
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      backgroundColor: '#F97316',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      flexShrink: 0,
                      zIndex: 1,
                      boxShadow: '0 2px 6px rgba(249, 115, 22, 0.5)'
                    }}
                  >
                    <Bus size={15} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12px', fontWeight: 900, backgroundColor: '#F97316', color: '#FFFFFF', padding: '2px 8px', borderRadius: '6px' }}>
                        Linha {plannedTrip.line.code}
                      </span>
                      <span style={{ fontSize: '11.5px', color: '#94A3B8', fontWeight: 600 }}>
                        {activeTrip.stops.length} paradas • Tarifa R$ 4,50
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#E4E4E7', marginTop: '4px' }}>
                      {activeTrip.tripName || activeTrip.tripShortName}
                    </div>
                    <div style={{ fontSize: '12px', color: '#A1A1AA', marginTop: '2px' }}>
                      Desembarque em <strong style={{ color: '#FFFFFF' }}>{plannedTrip.destStop.stopName}</strong>
                    </div>
                  </div>
                </div>

                {/* 3. DESEMBARQUE / DESTINO */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', position: 'relative' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: '#EA580C',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      flexShrink: 0,
                      zIndex: 1,
                      boxShadow: '0 2px 6px rgba(234, 88, 12, 0.5)'
                    }}
                  >
                    <MapPin size={15} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#FB923C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Destino Final
                    </div>
                    <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#FFFFFF', marginTop: '2px' }}>
                      {plannedTrip.destination.name}
                    </div>
                    {isDestTerminal ? (
                      destPoint && (
                        <div style={{ marginTop: '4px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              backgroundColor: '#EA580C',
                              color: '#FFFFFF',
                              fontSize: '11px',
                              fontWeight: 800,
                              padding: '3px 10px',
                              borderRadius: '6px'
                            }}
                          >
                            {destPoint}
                          </span>
                        </div>
                      )
                    ) : (
                      plannedTrip.walkFromStopMeters !== null && plannedTrip.walkFromStopMeters > 30 && (
                        <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
                          Caminhada de {plannedTrip.walkFromStopMeters}m ({plannedTrip.walkFromStopMinutes || 1} min) até o destino
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Prominent Action Button */}
      <div style={{ padding: '0 20px 10px 20px' }}>
        <button
          id="uber-action-confirm-btn"
          onClick={() => {
            haptic.mediumTap();
            setIsExpanded(!isExpanded);
          }}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '14px',
            backgroundColor: '#F97316',
            color: '#FFFFFF',
            fontSize: '15px',
            fontWeight: 800,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 3px 8px rgba(0, 0, 0, 0.4)',
            transition: 'transform 0.1s ease'
          }}
        >
          <span>{isExpanded ? 'Ocultar Paradas do Trajeto' : `Ver ${activeTrip.stops.length} Paradas do Trajeto`}</span>
        </button>
      </div>

      {/* Expanded Stop Timeline List */}
      {isExpanded && (
        <div
          className="scroll-container"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0 20px 24px 20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0 10px 0' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#A1A1AA', textTransform: 'uppercase' }}>
              Itinerário Completo ({activeTrip.stops.length} Paradas)
            </div>
            {activeVehicles.length > 0 && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: isVolta ? '#F97316' : '#3B82F6',
                  backgroundColor: isVolta ? 'rgba(249, 115, 22, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  border: `1px solid ${isVolta ? 'rgba(249, 115, 22, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`
                }}
              >
                {activeVehicles.length} {activeVehicles.length === 1 ? 'ônibus ativo' : 'ônibus em sequência'} ({isVolta ? 'Volta' : 'Ida'})
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {activeTrip.stops.map((stop, index) => {
              const isFirst = index === 0;
              const isLast = index === activeTrip.stops.length - 1;
              const busesHere = busesPerStop.get(index) || [];
              const hasBus = busesHere.length > 0;
              const hasLeadBus = busesHere.some(b => b.isLead);
              const isPassed = index < leadStopIndex;
              const isHub = stop.stopName.toUpperCase().includes('TERMINAL') || stop.stopName.toUpperCase().includes('PLATAFORMA') || stop.stopName.toUpperCase().includes('ESTAÇÃO') || /\bT[1-6]\b/.test(stop.stopName.toUpperCase()) || /\bE[1-4]\b/.test(stop.stopName.toUpperCase());

              return (
                <div
                  key={stop.stopId}
                  id={hasLeadBus ? 'current-bus-stop-card' : undefined}
                  onClick={() => {
                    haptic.lightTap();
                    onSelectStop(stop);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    padding: '8px 0',
                    cursor: 'pointer',
                    backgroundColor: isHub ? 'rgba(255, 255, 255, 0.08)' : hasBus ? (hasLeadBus ? 'rgba(59, 130, 246, 0.14)' : 'rgba(249, 115, 22, 0.10)') : 'transparent',
                    borderRadius: '10px',
                    paddingLeft: (hasBus || isHub) ? '10px' : '0px',
                    paddingRight: (hasBus || isHub) ? '10px' : '0px',
                    border: isHub ? '1px solid #FFFFFF' : hasBus ? `1px solid ${hasLeadBus ? 'rgba(59, 130, 246, 0.4)' : 'rgba(249, 115, 22, 0.35)'}` : '1px solid transparent',
                    marginBottom: (hasBus || isHub) ? '4px' : '0px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Timeline Graphic Indicator */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '18px', flexShrink: 0, marginTop: '2px' }}>
                    {hasBus ? (
                      <div
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '4px',
                          backgroundColor: hasLeadBus ? '#3B82F6' : '#F97316',
                          border: '2px solid #FFFFFF',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF'
                        }}
                      >
                        <Bus size={10} strokeWidth={2.5} />
                      </div>
                    ) : (
                      <div
                        style={{
                          width: isHub ? '12px' : isFirst || isLast ? '10px' : '7px',
                          height: isHub ? '12px' : isFirst || isLast ? '10px' : '7px',
                          borderRadius: isFirst || isLast || isHub ? '2px' : '50%',
                          backgroundColor: isHub ? '#FFFFFF' : isPassed ? '#3B82F6' : isLast ? '#F97316' : 'rgba(255, 255, 255, 0.4)',
                          border: isHub ? '2px solid #FFFFFF' : '1.5px solid #121214',
                          boxShadow: 'none'
                        }}
                      />
                    )}
                    {!isLast && (
                      <div
                        style={{
                          width: '2px',
                          height: hasBus ? '34px' : '28px',
                          backgroundColor: isPassed ? 'rgba(59, 130, 246, 0.4)' : 'rgba(255, 255, 255, 0.12)',
                          margin: '2px 0'
                        }}
                      />
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0, paddingBottom: '4px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        {isHub && (
                          <span
                            style={{
                              backgroundColor: '#FFFFFF',
                              color: '#000000',
                              fontSize: '9.5px',
                              fontWeight: 900,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.03em',
                              boxShadow: 'none',
                              flexShrink: 0
                            }}
                          >
                            TERMINAL / PLATAFORMA
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: isHub ? 900 : hasBus ? 800 : 600,
                            color: isHub ? '#FFFFFF' : hasLeadBus ? '#60A5FA' : hasBus ? '#FDBA74' : isPassed ? '#E2E8F0' : '#FFFFFF',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {stop.stopName}
                        </span>
                      </div>

                      {/* Display ALL active buses present at this stop (Lead & trailing buses) */}
                      {hasBus && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px' }}>
                          {busesHere.map(item => (
                            <span
                              key={item.bus.id}
                              style={{
                                fontSize: '10px',
                                fontWeight: 800,
                                color: item.isLead ? '#93C5FD' : '#FED7AA',
                                backgroundColor: item.isLead ? 'rgba(59, 130, 246, 0.25)' : 'rgba(249, 115, 22, 0.25)',
                                padding: '2px 8px',
                                borderRadius: '5px',
                                border: `1px solid ${item.isLead ? 'rgba(59, 130, 246, 0.5)' : 'rgba(249, 115, 22, 0.5)'}`,
                                whiteSpace: 'nowrap',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                            >
                              <Bus size={11} strokeWidth={2.5} />
                              {item.isLead
                                ? `ÔNIBUS NA FRENTE • CARRO ${item.bus.id}${item.bus.speedKmh && item.bus.speedKmh > 0 ? ` (${Math.round(item.bus.speedKmh)} km/h)` : ''}`
                                : `ÔNIBUS SEGUINTE • CARRO ${item.bus.id}${item.bus.speedKmh && item.bus.speedKmh > 0 ? ` (${Math.round(item.bus.speedKmh)} km/h)` : ''}`}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ fontSize: '11px', color: '#71717A', marginTop: '3px' }}>
                      Parada #{index + 1} • {stop.distKm} km do início
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Safe Area Spacer */}
      <div style={{ height: 'max(env(safe-area-inset-bottom, 0px), 12px)' }} />
    </div>
  );
};
