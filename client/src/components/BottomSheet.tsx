import React, { useState, useMemo } from 'react';
import type { RouteSummary, TripDetail, LiveBus, TimetableService, StopInfo, PlannedTrip } from '../types/transit.js';
import { Bus, Check, X, MapPin, Clock, ArrowRightLeft } from 'lucide-react';
import { useHaptic } from '../hooks/useHaptic.js';
import { TripStopsModal } from './TripStopsModal.js';
import { useRealtimeTripEta } from '../utils/realtimeEta.js';

function formatDistance(meters: number | null | undefined): string {
  if (!meters) return '0 m';
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1).replace('.', ',')} km`;
  }
  return `${Math.round(meters)} m`;
}

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
  const [isStopsModalOpen, setIsStopsModalOpen] = useState(false);
  const haptic = useHaptic();

  // Real-time intelligent ETA tracking for the planned trip
  const realtimeEta = useRealtimeTripEta(
    activeTrip,
    plannedTrip?.originStop || null,
    vehicles,
    plannedTrip
  );


  const isVolta = activeTrip?.directionType === 'volta';
  const activeDirection = isVolta ? 'volta' : 'ida';
  const themeColor = isVolta ? '#F97316' : '#3B82F6';

  // Strict Direction Filter: Show vehicles matching active direction, preserving unknown direction so buses are never lost
  const activeVehicles = useMemo(() => {
    return vehicles.filter(v => (!v.direction || v.direction === 'desconhecido' ? true : v.direction === activeDirection));
  }, [vehicles, activeDirection]);


  const isWithinOperationalHours = activeVehicles.length > 0;

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
        backgroundColor: 'var(--bg-sheet, #09090B)',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        borderTop: '1px solid var(--border-medium, rgba(255, 255, 255, 0.12))',
        boxShadow: 'var(--shadow-sheet, 0 -10px 40px rgba(0, 0, 0, 0.8))',
        color: 'var(--text-primary, #FFFFFF)',
        maxHeight: '62dvh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none'
      }}
    >
      {/* Drag Handle Bar */}
      <div
        style={{
          width: '100%',
          padding: '10px 0 6px 0',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <div
          style={{
            width: '40px',
            height: '4px',
            borderRadius: '999px',
            backgroundColor: 'var(--border-strong, rgba(255, 255, 255, 0.25))'
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
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary, #FFFFFF)', letterSpacing: '-0.02em' }}>
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
            {onCloseRoute && (
              <button
                id="close-route-bottomsheet-button"
                onClick={() => {
                  haptic.lightTap();
                  onCloseRoute();
                }}
                style={{
                  background: 'var(--bg-pill, rgba(255, 255, 255, 0.08))',
                  border: 'none',
                  borderRadius: '50%',
                  width: '34px',
                  height: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-primary, #FFFFFF)',
                  cursor: 'pointer'
                }}
                aria-label="Voltar / Fechar rota"
                title="Voltar / Fechar"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Direction Switcher (Sentido Ida vs Volta - strictly equal 50% width) */}
        {!plannedTrip && allTrips.length >= 2 && (
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--bg-card, #18181B)',
              border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
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
                    color: isSelected ? '#FFFFFF' : 'var(--text-secondary, #A1A1AA)',
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
              backgroundColor: 'var(--bg-card, #18181B)',
              borderRadius: '16px',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
              boxShadow: 'var(--shadow-card, 0 4px 16px rgba(0, 0, 0, 0.3))'
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
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary, #FFFFFF)' }}>
                  Linha {selectedLine.code} • {isVolta ? 'Trajeto de Volta' : 'Trajeto de Ida'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted, #A1A1AA)', marginTop: '1px' }}>
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
                  color: isWithinOperationalHours ? '#FFFFFF' : 'var(--text-primary, #FFFFFF)',
                  backgroundColor: isWithinOperationalHours ? '#2563EB' : 'var(--bg-pill, #18181B)',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  border: isWithinOperationalHours ? 'none' : '1px solid var(--border-medium, #FFFFFF)',
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
          <div style={{ padding: '0 16px 10px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* CARD 1: EMBARQUE & ÔNIBUS */}
            <div
              style={{
                backgroundColor: 'var(--bg-card, #18181B)',
                borderRadius: '16px',
                padding: '14px 16px',
                border: '1px solid var(--border-medium, rgba(255, 255, 255, 0.1))',
                boxShadow: 'var(--shadow-card, 0 4px 16px rgba(0, 0, 0, 0.3))',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 900,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase'
                  }}
                >
                  <Bus size={12} strokeWidth={2.5} />
                  Embarque • Linha {plannedTrip.legs[0]?.line?.code || plannedTrip.line.code}
                </span>

                {realtimeEta.status === 'passed_no_next' ? (
                  <span
                    style={{
                      fontSize: '11.5px',
                      fontWeight: 800,
                      color: '#FFFFFF',
                      backgroundColor: '#EA580C',
                      padding: '4px 10px',
                      borderRadius: '8px'
                    }}
                  >
                    Ônibus já passou
                  </span>
                ) : realtimeEta.status === 'at_stop' || realtimeEta.etaMinutes === 0 ? (
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      color: '#FFFFFF',
                      backgroundColor: '#2563EB',
                      padding: '4px 10px',
                      borderRadius: '8px'
                    }}
                  >
                    Chegando agora
                  </span>
                ) : typeof realtimeEta.etaMinutes === 'number' && realtimeEta.etaMinutes > 0 ? (
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      color: '#FFFFFF',
                      backgroundColor: '#2563EB',
                      padding: '4px 10px',
                      borderRadius: '8px'
                    }}
                  >
                    {realtimeEta.etaMinutes === 1 ? 'Em 1 min' : `Em ${realtimeEta.etaMinutes} min`}
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: '11.5px',
                      fontWeight: 800,
                      color: '#FFFFFF',
                      backgroundColor: '#2563EB',
                      padding: '4px 10px',
                      borderRadius: '8px'
                    }}
                  >
                    {realtimeEta.totalActiveBuses ? `${realtimeEta.totalActiveBuses} ônibus ativos` : 'Em operação'}
                  </span>
                )}
              </div>

              {realtimeEta.status === 'passed_no_next' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#EA580C', fontWeight: 800 }}>Status</span>
                    <span style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-primary, #FFFFFF)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                      Passou da parada
                    </span>
                  </div>
                  <div
                    style={{
                      backgroundColor: 'var(--bg-pill, #27272A)',
                      borderRadius: '10px',
                      padding: '10px 12px',
                      border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
                      fontSize: '12px',
                      color: 'var(--text-primary, #FFFFFF)',
                      lineHeight: 1.4
                    }}
                  >
                    O ônibus desta rota acabou de passar pela sua parada e não há outro veículo próximo vindo atrás no momento. Aguarde a saída do próximo veículo do terminal ou consulte linhas alternativas.
                  </div>
                </div>
              ) : realtimeEta.status === 'passed_has_next' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary, #94A3B8)', fontWeight: 600 }}>Próximo passa às</span>
                    <span style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text-primary, #FFFFFF)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                      {realtimeEta.etaTime || 'Em breve'}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: '#2563EB',
                      color: '#FFFFFF',
                      borderRadius: '6px',
                      padding: '3px 8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      width: 'fit-content'
                    }}
                  >
                    Ônibus anterior passou • Acompanhando próximo veículo
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary, #94A3B8)', fontWeight: 600 }}>
                    {realtimeEta.status === 'at_stop' ? 'Chegando agora' : 'Passa às'}
                  </span>
                  <span style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text-primary, #FFFFFF)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                    {realtimeEta.etaTime || 'Em breve'}
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <MapPin size={15} style={{ color: '#2563EB', marginTop: '2px', flexShrink: 0 }} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary, #FFFFFF)', lineHeight: 1.3 }}>
                    {plannedTrip.originStop.stopName}
                  </div>
                  {originPoint && isOriginTerminal && (
                    <div style={{ marginTop: '3px' }}>
                      <span style={{ fontSize: '10.5px', fontWeight: 800, backgroundColor: '#2563EB', color: '#FFFFFF', padding: '2px 7px', borderRadius: '4px' }}>
                        {originPoint}
                      </span>
                    </div>
                  )}
                  {!isOriginTerminal && plannedTrip.walkToStopMinutes !== null && plannedTrip.walkToStopMinutes > 0 && (
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary, #94A3B8)', marginTop: '3px', fontWeight: 500 }}>
                      Caminhada de {formatDistance(plannedTrip.walkToStopMeters)} ({plannedTrip.walkToStopMinutes} min a pé) até a parada
                    </div>
                  )}
                </div>
              </div>

              {realtimeEta.upcomingBuses && realtimeEta.upcomingBuses.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    paddingTop: '6px',
                    borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))',
                    flexWrap: 'wrap'
                  }}
                >
                  <Clock size={13} style={{ color: '#2563EB', flexShrink: 0 }} />
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary, #94A3B8)', fontWeight: 600 }}>Próximos atrás:</span>
                  {realtimeEta.upcomingBuses.slice(0, 2).map((nextBus, bIdx) => (
                    <span
                      key={bIdx}
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#FFFFFF',
                        backgroundColor: '#2563EB',
                        padding: '3px 8px',
                        borderRadius: '6px'
                      }}
                    >
                      {nextBus.time} ({nextBus.minutes} min)
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* CARD 2: BALDEAÇÃO / TROCA DE ÔNIBUS (SE HOUVER) */}
            {plannedTrip.isTransfer && plannedTrip.legs.length > 1 && (
              <div
                style={{
                  backgroundColor: 'var(--bg-card, #18181B)',
                  borderRadius: '16px',
                  padding: '12px 16px',
                  border: '1px solid var(--border-medium, rgba(255, 255, 255, 0.15))',
                  boxShadow: 'var(--shadow-card, 0 4px 16px rgba(0, 0, 0, 0.3))',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--text-primary, #000000)',
                    border: '2px solid var(--bg-card, #FFFFFF)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.6)'
                  }}
                  title="Troca de Ônibus"
                >
                  <ArrowRightLeft size={14} color="var(--bg-card, #FFFFFF)" strokeWidth={2.8} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '10px',
                        fontWeight: 800,
                        backgroundColor: 'var(--text-primary, #FFFFFF)',
                        color: 'var(--bg-canvas, #000000)',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em'
                      }}
                    >
                      <ArrowRightLeft size={11} color="var(--bg-canvas, #000000)" strokeWidth={3} />
                      Troca de Ônibus
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 800, backgroundColor: '#2563EB', color: '#FFFFFF', padding: '2px 8px', borderRadius: '4px' }}>
                      Integração Gratuita
                    </span>
                  </div>

                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-primary, #FFFFFF)', marginTop: '4px' }}>
                    {plannedTrip.transferHubName || plannedTrip.legs[0].destStop.stopName}
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--text-secondary, #A1A1AA)', marginTop: '2px' }}>
                    Baldeação para a <strong>Linha {plannedTrip.legs[1].line.code}</strong> ({plannedTrip.legs[1].line.name})
                  </div>
                </div>
              </div>
            )}

            {/* CARD 3: DESTINO & DESEMBARQUE MAIS PRÓXIMO */}
            <div
              style={{
                backgroundColor: 'var(--bg-card, #18181B)',
                borderRadius: '16px',
                padding: '14px 16px',
                border: '1px solid var(--border-medium, rgba(255, 255, 255, 0.1))',
                boxShadow: 'var(--shadow-card, 0 4px 16px rgba(0, 0, 0, 0.3))',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#EA580C',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 900,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase'
                  }}
                >
                  <MapPin size={12} strokeWidth={2.5} />
                  Desembarque Mais Próximo
                </span>

                {plannedTrip.totalMinutes && (
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      color: '#FFFFFF',
                      backgroundColor: '#EA580C',
                      padding: '4px 10px',
                      borderRadius: '8px'
                    }}
                  >
                    {plannedTrip.totalMinutes} min de viagem
                  </span>
                )}
              </div>

              {realtimeEta.status === 'passed_no_next' ? (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary, #94A3B8)', fontWeight: 700 }}>Chegada</span>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary, #FFFFFF)', letterSpacing: '-0.01em' }}>
                    Aguardando próximo veículo
                  </span>
                </div>
              ) : (realtimeEta.destEtaTime || plannedTrip.destEtaTime) ? (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary, #94A3B8)', fontWeight: 700 }}>Chegada às</span>
                  <span style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text-primary, #FFFFFF)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                    {realtimeEta.destEtaTime || plannedTrip.destEtaTime}
                  </span>
                </div>
              ) : null}

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <MapPin size={15} style={{ color: '#EA580C', marginTop: '2px', flexShrink: 0 }} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary, #FFFFFF)', lineHeight: 1.3 }}>
                    {plannedTrip.destStop.stopName}
                  </div>
                  {destPoint && isDestTerminal && (
                    <div style={{ marginTop: '3px' }}>
                      <span style={{ fontSize: '10.5px', fontWeight: 800, backgroundColor: '#EA580C', color: '#FFFFFF', padding: '2px 7px', borderRadius: '4px' }}>
                        {destPoint}
                      </span>
                    </div>
                  )}
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary, #94A3B8)', marginTop: '3px' }}>
                    Destino: <strong style={{ color: 'var(--text-primary, #FFFFFF)' }}>{plannedTrip.destination.name}</strong>
                  </div>
                  {!isDestTerminal && plannedTrip.walkFromStopMinutes !== null && plannedTrip.walkFromStopMinutes > 0 && (
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary, #94A3B8)', marginTop: '3px', fontWeight: 500 }}>
                      Caminhada de {formatDistance(plannedTrip.walkFromStopMeters)} ({plannedTrip.walkFromStopMinutes} min a pé) até o destino
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Prominent Action Button: Opens Spacious Stops Modal */}
      <div style={{ padding: '0 20px 10px 20px' }}>
        <button
          id="uber-action-confirm-btn"
          onClick={() => {
            haptic.mediumTap();
            setIsStopsModalOpen(true);
          }}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '14px',
            backgroundColor: '#EA580C',
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
          <span>Ver {activeTrip.stops.length} Paradas do Trajeto</span>
        </button>
      </div>

      {/* Spacious Full-Screen Stops Modal */}
      <TripStopsModal
        isOpen={isStopsModalOpen}
        onClose={() => setIsStopsModalOpen(false)}
        trip={activeTrip}
        line={selectedLine || plannedTrip?.line}
        vehicles={vehicles}
        plannedTrip={plannedTrip}
        onSelectStop={onSelectStop}
      />

      {/* Safe Area Spacer */}
      <div style={{ height: 'max(env(safe-area-inset-bottom, 0px), 12px)' }} />
    </div>
  );
};
