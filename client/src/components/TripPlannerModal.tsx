import React, { useState, useRef, useEffect } from 'react';
import { JourneyMap } from './JourneyMap.js';
import {
  ArrowLeft,
  MapPin,
  Bus,
  X,
  ArrowUpDown,
  ChevronRight,
  History
} from 'lucide-react';
import type { RouteSummary, TransitHub, StopInfo, PlanJourneyResult, TransitOption, PlannedTrip } from '../types/transit.js';
import type { UserLocation } from '../hooks/useUserLocation.js';
import { useHaptic } from '../hooks/useHaptic.js';
import { MANAUS_DEFAULT_LOCATION } from '../hooks/useUserLocation.js';

const RECENT_SEARCHES_KEY = 'manaus_recent_searches';

export function getRecentSearches(): ManausAddressItem[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRecentSearch(item: ManausAddressItem): ManausAddressItem[] {
  try {
    const current = getRecentSearches();
    const filtered = current.filter((x) => x.id !== item.id && x.name.toLowerCase() !== item.name.toLowerCase());
    const updated = [item, ...filtered].slice(0, 10);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

interface TripPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lines: RouteSummary[];
  terminals: TransitHub[];
  citywideStops?: StopInfo[];
  userLocation: UserLocation;
  onSelectPlannedTrip: (plan: PlannedTrip) => void;
  onSelectLine: (line: RouteSummary) => void;
}

export interface ManausAddressItem {
  id: string;
  name: string;
  subtitle: string;
  lat: number;
  lng: number;
  type: 'frequent' | 'hub' | 'landmark' | 'street' | 'hospital' | 'shopping' | 'outro';
  categoryLabel?: string;
  distM?: number;
  distFormatted?: string;
}

// Catálogo de Terminais de Integração e Estações de Transferência de Manaus
export const MANAUS_POPULAR_ADDRESSES: ManausAddressItem[] = [
  // Terminais de Integração (T1 - T6)
  {
    id: 'addr-t1',
    name: 'Terminal 1 - Constantino Nery (T1)',
    subtitle: 'Av. Constantino Nery, Centro - Manaus',
    lat: -3.12781,
    lng: -60.02452,
    type: 'hub',
    categoryLabel: 'Terminal de Integração'
  },
  {
    id: 'addr-t2',
    name: 'Terminal 2 - Cachoeirinha (T2)',
    subtitle: 'Av. Carvalho Leal, Cachoeirinha - Manaus',
    lat: -3.12554,
    lng: -60.00783,
    type: 'hub',
    categoryLabel: 'Terminal de Integração'
  },
  {
    id: 'addr-t3',
    name: 'Terminal 3 - Cidade Nova (T3)',
    subtitle: 'Av. Noel Nutels, Cidade Nova - Manaus',
    lat: -3.03692,
    lng: -60.00624,
    type: 'hub',
    categoryLabel: 'Terminal de Integração'
  },
  {
    id: 'addr-t4',
    name: 'Terminal 4 - Jorge Teixeira (T4)',
    subtitle: 'Av. Camapuã, Jorge Teixeira - Manaus',
    lat: -3.03512,
    lng: -59.94481,
    type: 'hub',
    categoryLabel: 'Terminal de Integração'
  },
  {
    id: 'addr-t5',
    name: 'Terminal 5 - São José (T5)',
    subtitle: 'Alameda Cosme Ferreira, São José - Manaus',
    lat: -3.08421,
    lng: -59.96785,
    type: 'hub',
    categoryLabel: 'Terminal de Integração'
  },
  {
    id: 'addr-t6',
    name: 'Terminal 6 - Lago Azul / Viver Melhor (T6)',
    subtitle: 'BR-174 / Av. Viver Melhor, Lago Azul - Manaus',
    lat: -2.97851,
    lng: -60.03822,
    type: 'hub',
    categoryLabel: 'Terminal de Integração'
  },
  // Estações de Transferência (E1 - E4)
  {
    id: 'addr-e1',
    name: 'Estação 1 - São Jorge (E1)',
    subtitle: 'Av. Constantino Nery, São Jorge - Manaus',
    lat: -3.10982,
    lng: -60.02751,
    type: 'hub',
    categoryLabel: 'Estação de Transferência'
  },
  {
    id: 'addr-e2',
    name: 'Estação 2 - Arena da Amazônia (E2)',
    subtitle: 'Av. Constantino Nery, Chapada / Flores - Manaus',
    lat: -3.08331,
    lng: -60.02894,
    type: 'hub',
    categoryLabel: 'Estação de Transferência'
  },
  {
    id: 'addr-e3',
    name: 'Estação 3 - Santos Dumont (E3)',
    subtitle: 'Av. Torquato Tapajós, Da Paz - Manaus',
    lat: -3.05882,
    lng: -60.02641,
    type: 'hub',
    categoryLabel: 'Estação de Transferência'
  },
  {
    id: 'addr-e4',
    name: 'Estação 4 - Flores / Manôa (E4)',
    subtitle: 'Av. Torquato Tapajós, Flores - Manaus',
    lat: -3.04562,
    lng: -60.02423,
    type: 'hub',
    categoryLabel: 'Estação de Transferência'
  }
];

export const TripPlannerModal: React.FC<TripPlannerModalProps> = ({
  isOpen,
  onClose,
  userLocation,
  onSelectPlannedTrip
}) => {
  const [viewState, setViewState] = useState<'search' | 'uber_overview'>('search');

  // Input states
  const [activeField, setActiveField] = useState<'origin' | 'destination'>('destination');
  const [gpsStreetName, setGpsStreetName] = useState<string>('');
  const [originIsGPS, setOriginIsGPS] = useState(true);
  const [originText, setOriginText] = useState('Sua localização atual');
  const [originCoord, setOriginCoord] = useState<{ name: string; lat: number; lng: number }>(() => ({
    name: 'Sua localização atual',
    lat: userLocation.lat || MANAUS_DEFAULT_LOCATION.lat,
    lng: userLocation.lng || MANAUS_DEFAULT_LOCATION.lng
  }));

  const [destText, setDestText] = useState('');
  const [destCoord, setDestCoord] = useState<{ name: string; lat: number; lng: number } | null>(null);

  // Search places auto-complete
  const [remotePlaces, setRemotePlaces] = useState<ManausAddressItem[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [recentSearches, setRecentSearches] = useState<ManausAddressItem[]>(getRecentSearches);

  // Routing calculation results
  const [planResult, setPlanResult] = useState<PlanJourneyResult | null>(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);

  // MapLibre references for Uber View
  const routeRequest = useRef<AbortController | null>(null);
  const [routeError, setRouteError] = useState('');
  const [sourceLine, setSourceLine] = useState<string | null>(null);

  const originInputRef = useRef<HTMLInputElement>(null);
  const destInputRef = useRef<HTMLInputElement>(null);
  const haptic = useHaptic();

  useEffect(() => {
    if (!isOpen) routeRequest.current?.abort();
    return () => {
      routeRequest.current?.abort();
    };
  }, [isOpen]);

  // Geocodificação reversa para identificar a rua real do GPS atual do dispositivo
  useEffect(() => {
    const lat = userLocation.lat || MANAUS_DEFAULT_LOCATION.lat;
    const lng = userLocation.lng || MANAUS_DEFAULT_LOCATION.lng;
    if (!lat || !lng) return;

    const controller = new AbortController();
    fetch(`/api/places/reverse?lat=${lat}&lng=${lng}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data || controller.signal.aborted) return;
        const street = data.streetName || data.name || 'Sua localização atual';
        setGpsStreetName(street);
        if (originIsGPS) {
          setOriginText(street);
          setOriginCoord({
            name: street,
            lat,
            lng
          });
        }
      })
      .catch(() => {});

    return () => controller.abort();
  }, [userLocation.lat, userLocation.lng, originIsGPS]);

  useEffect(() => {
    if (isOpen) {
      setRecentSearches(getRecentSearches());
      if (!destCoord) {
        setViewState('search');
        setActiveField('destination');
        setTimeout(() => destInputRef.current?.focus(), 150);
      }
    }
  }, [isOpen, destCoord]);

  // Sync user GPS with originCoord when available
  useEffect(() => {
    if (!originIsGPS) return;
    const currentName = gpsStreetName || 'Sua localização atual';
    setOriginText(currentName);
    setOriginCoord({
      name: currentName,
      lat: userLocation.lat || MANAUS_DEFAULT_LOCATION.lat,
      lng: userLocation.lng || MANAUS_DEFAULT_LOCATION.lng
    });
  }, [userLocation.lat, userLocation.lng, originIsGPS, gpsStreetName]);

  // Live place search auto-complete as user types
  const currentTypedText = activeField === 'origin' ? originText : destText;
  useEffect(() => {
    const q = currentTypedText.trim();
    const isAlreadySelected = activeField === 'origin'
      ? (originCoord && q === originCoord.name)
      : (destCoord && q === destCoord.name);

    if (!q || q === 'Sua localização atual' || q.toLowerCase().includes('gps') || q.length < 2 || isAlreadySelected) {
      setRemotePlaces([]);
      setIsSearchingPlaces(false);
      return;
    }

    setIsSearchingPlaces(true);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const resp = await fetch(`/api/places/search?q=${encodeURIComponent(q)}`, { signal: controller.signal });
        if (resp.ok) {
          const data = await resp.json();
          if (Array.isArray(data.places)) {
            const mapped: ManausAddressItem[] = data.places.map((p: any) => ({
              id: p.id,
              name: p.name,
              subtitle: p.displayName || `${p.name}, Manaus - AM`,
              lat: p.lat,
              lng: p.lng,
              type: p.category || 'street',
              categoryLabel: p.categoryLabel || 'Local em Manaus'
            }));
            if (!controller.signal.aborted) setRemotePlaces(mapped);
          }
        }
      } catch (err) {
        console.error('Erro ao buscar endereços:', err);
      } finally {
        if (!controller.signal.aborted) setIsSearchingPlaces(false);
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [currentTypedText, activeField, originCoord, destCoord]);

  // Calculate real transit routing when both origin and destination are set
  const calculateRoute = async (
    orig: { name: string; lat: number; lng: number },
    dest: { name: string; lat: number; lng: number }
  ) => {
    routeRequest.current?.abort();
    setPlanResult(null);
    setRouteError('');

    const controller = new AbortController();
    routeRequest.current = controller;

    try {
      const resp = await fetch('/api/journey/plan', {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin: orig, destination: dest })
      });

      if (resp.ok) {
        const data: PlanJourneyResult = await resp.json();
        if (controller.signal.aborted) return;
        setPlanResult(data);
        setSelectedOptionIndex(0);
      } else {
        throw new Error('Falha no cálculo da rota');
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        console.error('[TripPlanner] Erro ao planejar rota:', err);
        setRouteError('Não foi possível calcular o trajeto. Tente novamente ou consulte o Google Maps.');
      }
    }
  };

  const handleSelectAddress = (item: ManausAddressItem) => {
    haptic.lightTap();
    setRouteError('');
    setRemotePlaces([]);
    setIsSearchingPlaces(false);

    const updatedRecent = saveRecentSearch(item);
    setRecentSearches(updatedRecent);

    if (activeField === 'origin') {
      const newOrig = { name: item.name, lat: item.lat, lng: item.lng };
      setOriginText(item.name);
      setOriginCoord(newOrig);
      setOriginIsGPS(false);

      if (destCoord) {
        setViewState('uber_overview');
        calculateRoute(newOrig, destCoord);
      } else {
        setActiveField('destination');
        destInputRef.current?.focus();
      }
    } else {
      const newDest = { name: item.name, lat: item.lat, lng: item.lng };
      setDestText(item.name);
      setDestCoord(newDest);

      setViewState('uber_overview');
      calculateRoute(originCoord, newDest);
    }
  };

  // Swap origin and destination
  const handleSwap = () => {
    haptic.lightTap();
    const prevOrigin = originCoord;
    const prevOriginText = originText;
    const prevDest = destCoord;
    const prevDestText = destText;

    if (prevDest) {
      setOriginIsGPS(false);
      setOriginCoord(prevDest);
      setOriginText(prevDestText);
      setDestCoord(prevOrigin);
      setDestText(prevOriginText);
      setViewState('uber_overview');
      calculateRoute(prevDest, prevOrigin);
    }
  };

  const activeOption: TransitOption | null = planResult?.options[selectedOptionIndex] || null;

  const handleConfirmRoute = () => {
    if (!activeOption || !destCoord) return;
    haptic.mediumTap();

    const legs = activeOption.verifiedLegs;
    if (!legs?.length) return;
    const walkOrigin = activeOption.legs.find((l) => l.type === 'walk_origin');
    const walkDest = activeOption.legs.find((l) => l.type === 'walk_dest');
    const planned: PlannedTrip = {
      legs,
      journeyDetails: activeOption.legs,
      origin: originCoord,
      destination: destCoord,
      originStop: activeOption.originStop,
      destStop: activeOption.destStop,
      line: legs[0].line,
      trip: legs[0].trip,
      walkToStopMeters: walkOrigin?.distanceMeters ?? null,
      walkToStopMinutes: walkOrigin?.durationMinutes ?? null,
      walkFromStopMeters: walkDest?.distanceMeters ?? null,
      walkFromStopMinutes: walkDest?.durationMinutes ?? null,
      transitMinutes: activeOption.transitMinutes,
      totalMinutes: activeOption.totalMinutes,
      isTransfer: legs.length > 1,
      transferHubName: activeOption.transferHubName,
      etaMinutes: activeOption.etaMinutes,
      etaTime: activeOption.etaTime,
      liveBusCount: activeOption.liveBusCount,
      upcomingBuses: activeOption.upcomingBuses,
      isLiveGps: activeOption.isLiveGps
    };

    onSelectPlannedTrip(planned);
  };

  const closePlanner = () => {
    routeRequest.current?.abort();
    setSourceLine(null);
    setViewState('search');
    setPlanResult(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="uber-trip-planner-modal"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        backgroundColor: '#09090B',
        display: 'flex',
        flexDirection: 'column',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      {sourceLine && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 90,
            background: '#09090B',
            display: 'flex',
            flexDirection: 'column',
            paddingTop: 'max(env(safe-area-inset-top), 12px)'
          }}
        >
          <div style={{ display: 'flex', padding: 12, gap: 12 }}>
            <button onClick={() => setSourceLine(null)}>Voltar ao trajeto</button>
            <button onClick={closePlanner}>Tela inicial</button>
            <a href={sourceLine} target="_blank" rel="noreferrer">
              Abrir no site
            </a>
          </div>
          <p style={{ padding: '0 12px', fontSize: 12 }}>Mapa original da Mobilibus / Sinetram.</p>
          <iframe title="Mapa original da linha na Mobilibus" src={sourceLine} style={{ flex: 1, width: '100%', border: 0 }} />
        </div>
      )}

      {/* ========================================================================= */}
      {/* STATE 1: ROUTE OVERVIEW (MAP + RIDE CARDS + NEAREST STOPS) */}
      {/* ========================================================================= */}
      {viewState === 'uber_overview' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
          {/* Map Canvas Background */}
          {destCoord && (
            <JourneyMap
              option={activeOption}
              origin={originCoord}
              destination={destCoord}
            />
          )}

          {/* Top Back Button */}
          <div
            style={{
              position: 'absolute',
              top: 'max(env(safe-area-inset-top, 0px), 16px)',
              left: '16px',
              zIndex: 35
            }}
          >
            <button
              onClick={() => {
                haptic.lightTap();
                setViewState('search');
              }}
              style={{
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
              aria-label="Voltar para busca"
              title="Voltar à busca"
            >
              <ArrowLeft size={20} />
            </button>
          </div>

          {/* Bottom Sheet for Options, Nearest Stops & Google Maps Links */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 35,
              backgroundColor: '#09090B',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              borderTop: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 -8px 30px rgba(0, 0, 0, 0.8)',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '52dvh',
              overflow: 'hidden'
            }}
          >
            {/* Grab Handle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px 0' }}>
              <div style={{ width: '38px', height: '4px', borderRadius: '2px', backgroundColor: 'rgba(255, 255, 255, 0.25)' }} />
            </div>

            {/* Content Scrollable Box */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 16px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Loading Skeleton */}
              {!planResult && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '8px 0' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Calculando as Melhores Opções...
                  </div>
                  {[1, 2].map((k) => (
                    <div
                      key={k}
                      style={{
                        backgroundColor: '#18181B',
                        borderRadius: '16px',
                        padding: '16px',
                        height: '72px',
                        opacity: 0.6,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px'
                      }}
                    >
                      <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#27272A' }} />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ width: '60%', height: '14px', borderRadius: '4px', backgroundColor: '#27272A' }} />
                        <div style={{ width: '80%', height: '10px', borderRadius: '4px', backgroundColor: '#27272A' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Direct Bus Route Options List */}
              {planResult && planResult.options.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Linhas de Ônibus Disponíveis ({planResult.options.length})
                  </div>

                  {planResult.options.map((opt, idx) => {
                    const isSelected = idx === selectedOptionIndex;
                    const isDirect = opt.type === 'direct';

                    return (
                      <div
                        key={opt.id}
                        onClick={() => {
                          haptic.lightTap();
                          setSelectedOptionIndex(idx);
                        }}
                        style={{
                          backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.14)' : '#18181B',
                          border: isSelected ? '2px solid #FFFFFF' : '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '16px',
                          padding: '14px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div
                            style={{
                              width: '46px',
                              height: '46px',
                              borderRadius: '12px',
                              backgroundColor: isDirect ? '#2563EB' : '#D97706',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#FFFFFF',
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                              flexShrink: 0
                            }}
                          >
                            <Bus size={24} />
                          </div>

                          <div>
                            <div style={{ marginBottom: '2px' }}>
                              <span style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF' }}>
                                Linha {opt.title}
                              </span>
                            </div>

                            <div style={{ fontSize: '12px', color: '#A1A1AA' }}>{opt.subtitle}</div>

                            <div style={{ marginTop: '5px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  backgroundColor: isDirect ? '#2563EB' : '#D97706',
                                  color: '#FFFFFF',
                                  fontSize: '10px',
                                  fontWeight: 800,
                                  padding: '2px 8px',
                                  borderRadius: '999px'
                                }}
                              >
                                {opt.badge}
                              </span>

                              {opt.isLiveGps && (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                    color: '#34D399',
                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                    fontSize: '10px',
                                    fontWeight: 800,
                                    padding: '2px 8px',
                                    borderRadius: '999px'
                                  }}
                                >
                                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                                  GPS AO VIVO
                                </span>
                              )}

                              {opt.upcomingBuses && opt.upcomingBuses.length > 0 && (
                                <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>
                                  • Próximos: {opt.upcomingBuses.map((b) => b.time).join(', ')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          {opt.etaTime && typeof opt.etaMinutes === 'number' ? (
                            <div>
                              <div style={{ fontSize: '16px', fontWeight: 900, color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                                {opt.etaTime}
                              </div>
                              <div
                                style={{
                                  fontSize: '10.5px',
                                  fontWeight: 800,
                                  color: '#34D399',
                                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                  padding: '2px 6px',
                                  borderRadius: '6px',
                                  border: '1px solid rgba(16, 185, 129, 0.25)',
                                  marginTop: '3px',
                                  display: 'inline-block'
                                }}
                              >
                                {opt.etaMinutes <= 1 ? 'Chegando' : `em ${opt.etaMinutes} min`}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF' }}>{opt.fare}</div>
                              <div style={{ fontSize: '10px', color: '#71717A', marginTop: '2px' }}>
                                {opt.liveBusCount ? `${opt.liveBusCount} na rota` : 'Aguardando GPS'}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}


            </div>

            {/* Bottom Confirm Action Button */}
            {activeOption && (
              <div style={{ padding: '12px 16px max(env(safe-area-inset-bottom, 0px), 16px) 16px', display: 'flex', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#121214' }}>
                <button
                  id="uber-confirm-trip-btn"
                  onClick={handleConfirmRoute}
                  style={{
                    flex: 1,
                    backgroundColor: '#FFFFFF',
                    color: '#000000',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '15px 0',
                    fontSize: '16px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(255, 255, 255, 0.2)'
                  }}
                >
                  Confirmar Trajeto
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STATE 2: SEARCH / DESTINATION PICKER */}
      {/* ========================================================================= */}
      {viewState === 'search' && (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Header */}
          <div
            style={{
              paddingTop: 'max(env(safe-area-inset-top, 0px), 16px)',
              paddingBottom: '8px',
              paddingLeft: '16px',
              paddingRight: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <button
              id="search-back-to-home-btn"
              onClick={() => {
                haptic.lightTap();
                closePlanner();
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#FFFFFF',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Voltar"
            >
              <ArrowLeft size={22} />
            </button>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', margin: 0 }}>
              Planeje sua próxima rota em Manaus
            </h2>
          </div>

          {/* Inputs Card */}
          <div style={{ padding: '8px 16px 12px 16px' }}>
            <div
              style={{
                backgroundColor: '#18181B',
                borderRadius: '16px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                border: '1px solid rgba(255, 255, 255, 0.12)'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '16px', flexShrink: 0 }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#3B82F6', border: '2px solid #FFFFFF' }} />
                <div style={{ width: '2px', height: '32px', backgroundColor: 'rgba(255, 255, 255, 0.25)' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#F97316', border: '2px solid #FFFFFF' }} />
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Origin Input */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    ref={originInputRef}
                    type="text"
                    value={originText}
                    onFocus={() => setActiveField('origin')}
                    onChange={(e) => {
                      setOriginIsGPS(false);
                      setOriginText(e.target.value);
                      setActiveField('origin');
                    }}
                    placeholder="Local de partida"
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: activeField === 'origin' ? '#3B82F6' : '#FFFFFF',
                      fontSize: '14px',
                      fontWeight: 600
                    }}
                  />
                  {originText && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOriginText('');
                        setOriginIsGPS(false);
                        setPlanResult(null);
                        setActiveField('origin');
                        originInputRef.current?.focus();
                      }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.12)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        color: '#FFFFFF',
                        fontSize: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <X size={10} />
                    </button>
                  )}
                </div>

                <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />

                {/* Destination Input */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    ref={destInputRef}
                    type="text"
                    value={destText}
                    onFocus={() => setActiveField('destination')}
                    onChange={(e) => {
                      setDestCoord(null);
                      setDestText(e.target.value);
                      setActiveField('destination');
                    }}
                    placeholder="Para onde?"
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: '#FFFFFF',
                      fontSize: '15px',
                      fontWeight: 700
                    }}
                  />
                  {destText && (
                    <button
                      onClick={() => {
                        setDestText('');
                        setDestCoord(null);
                        setActiveField('destination');
                        destInputRef.current?.focus();
                      }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.12)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        color: '#FFFFFF',
                        fontSize: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <X size={10} />
                    </button>
                  )}
                </div>
              </div>

              <button
                onClick={handleSwap}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  border: '1px solid rgba(59, 130, 246, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#3B82F6',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
                title="Inverter partida e destino"
              >
                <ArrowUpDown size={15} />
              </button>
            </div>
          </div>

          {routeError && <p role="alert" style={{ color: '#FDBA74', padding: '0 18px', fontSize: '13px' }}>{routeError}</p>}

          {/* Auto Suggestions List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {isSearchingPlaces && (
              <div style={{ textAlign: 'center', padding: '16px', color: '#A1A1AA', fontSize: '13px' }}>
                Buscando ruas, avenidas e locais em Manaus...
              </div>
            )}

            {/* Quick GPS Reset Option for Origin */}
            {activeField === 'origin' && (
              <div
                onClick={() => {
                  haptic.lightTap();
                  setOriginIsGPS(true);
                  const label = gpsStreetName || 'Sua localização atual';
                  setOriginText(label);
                  const newOrig = {
                    name: label,
                    lat: userLocation.lat || MANAUS_DEFAULT_LOCATION.lat,
                    lng: userLocation.lng || MANAUS_DEFAULT_LOCATION.lng
                  };
                  setOriginCoord(newOrig);
                  if (destCoord) {
                    setViewState('uber_overview');
                    calculateRoute(newOrig, destCoord);
                  } else {
                    setActiveField('destination');
                    destInputRef.current?.focus();
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  backgroundColor: 'rgba(37, 99, 235, 0.12)',
                  border: '1.5px solid #2563EB',
                  cursor: 'pointer',
                  marginBottom: '4px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', flexShrink: 0 }}>
                    <MapPin size={16} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Usar localização GPS atual
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#93C5FD', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {gpsStreetName || 'Detectando sua rua em Manaus via satélite...'}
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#60A5FA', backgroundColor: 'rgba(37, 99, 235, 0.25)', padding: '4px 8px', borderRadius: '6px' }}>
                  GPS
                </span>
              </div>
            )}

            {/* Render Remote Search Places */}
            {remotePlaces.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelectAddress(item)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  backgroundColor: '#18181B',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#27272A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A1A1AA', flexShrink: 0 }}>
                    <MapPin size={16} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#71717A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.subtitle}
                    </div>
                  </div>
                </div>
                <ChevronRight size={16} color="#71717A" />
              </div>
            ))}

            {/* Popular & Recent Manaus Destinations */}
            {remotePlaces.length === 0 && !isSearchingPlaces && (
              <>
                {recentSearches.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '8px 0 6px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        <History size={14} />
                        <span>Suas Pesquisas Recentes em Manaus</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          localStorage.removeItem(RECENT_SEARCHES_KEY);
                          setRecentSearches([]);
                        }}
                        style={{ background: 'none', border: 'none', color: '#71717A', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Limpar
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {recentSearches.map((item) => (
                        <div
                          key={`recent-${item.id}-${item.name}`}
                          onClick={() => handleSelectAddress(item)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 14px',
                            borderRadius: '14px',
                            backgroundColor: 'rgba(59, 130, 246, 0.08)',
                            border: '1px solid rgba(59, 130, 246, 0.25)',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                            <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60A5FA', flexShrink: 0 }}>
                              <History size={16} />
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {item.name}
                              </div>
                              <div style={{ fontSize: '11.5px', color: '#94A3B8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {item.subtitle}
                              </div>
                            </div>
                          </div>
                          <ChevronRight size={16} color="#60A5FA" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ fontSize: '12px', fontWeight: 700, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '12px 0 6px 0' }}>
                  Terminais e Estações de Integração (T1-T6 / E1-E4)
                </div>
                {MANAUS_POPULAR_ADDRESSES.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectAddress(item)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '14px',
                      backgroundColor: '#18181B',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                      <div style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        backgroundColor: item.type === 'hub' ? 'rgba(59, 130, 246, 0.18)' : '#27272A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: item.type === 'hub' ? '#60A5FA' : '#A1A1AA',
                        flexShrink: 0
                      }}>
                        {item.type === 'hub' ? (
                          <Bus size={16} color="#60A5FA" />
                        ) : (
                          <MapPin size={16} color={item.id.includes('saporo') ? '#F97316' : item.id.includes('imprensa') ? '#3B82F6' : '#A1A1AA'} />
                        )}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.name}
                          </span>
                          {item.type === 'hub' && item.categoryLabel && (
                            <span style={{
                              fontSize: '10px',
                              fontWeight: 600,
                              color: '#60A5FA',
                              backgroundColor: 'rgba(59, 130, 246, 0.15)',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              flexShrink: 0
                            }}>
                              {item.categoryLabel === 'Terminal de Integração' ? 'Terminal' : item.categoryLabel === 'Estação de Transferência' ? 'Estação' : item.categoryLabel}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#71717A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.subtitle}
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={16} color={item.type === 'hub' ? '#60A5FA' : '#71717A'} />
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TripPlannerModal;
