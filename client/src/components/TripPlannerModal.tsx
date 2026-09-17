import React, { useState, useRef, useEffect } from 'react';
import { JourneyMap } from './JourneyMap.js';
import {
  ArrowLeft,
  MapPin,
  Bus,
  X,
  ArrowUpDown,
  ChevronRight,
  History,
  ArrowRightLeft
} from 'lucide-react';
import type { RouteSummary, TransitHub, StopInfo, PlanJourneyResult, TransitOption, PlannedTrip } from '../types/transit.js';
import type { UserLocation } from '../hooks/useUserLocation.js';
import { useHaptic } from '../hooks/useHaptic.js';
import { MANAUS_DEFAULT_LOCATION } from '../hooks/useUserLocation.js';
import { saveRecentDestination, type RecentDestination } from '../utils/recentDestinations.js';

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
  initialDestination?: RecentDestination | { title?: string; name?: string; lat?: number; lng?: number; address?: string; lineCode?: string } | null;
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
  onSelectPlannedTrip,
  initialDestination
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

  // Synchronize 'uber_overview' state with Android hardware/gesture back button
  useEffect(() => {
    if (!isOpen) return;
    if (viewState === 'uber_overview') {
      window.history.pushState({ modal: 'planner_overview' }, '');
      const handlePop = (e: PopStateEvent) => {
        e.stopImmediatePropagation();
        setViewState('search');
      };
      window.addEventListener('popstate', handlePop, { capture: true });
      return () => window.removeEventListener('popstate', handlePop, { capture: true });
    }
  }, [isOpen, viewState]);

  const handleBackToSearch = () => {
    haptic.lightTap();
    if (window.history.state?.modal === 'planner_overview') {
      window.history.back();
    } else {
      setViewState('search');
    }
  };

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
        if (originIsGPS && viewState !== 'uber_overview') {
          setOriginText(street);
          setOriginCoord(prev => {
            if (prev && Math.hypot(prev.lat - lat, prev.lng - lng) < 0.0001 && prev.name === street) {
              return prev;
            }
            return {
              name: street,
              lat,
              lng
            };
          });
        }
      })
      .catch(() => {});

    return () => controller.abort();
  }, [userLocation.lat, userLocation.lng, originIsGPS, viewState]);

  useEffect(() => {
    if (isOpen) {
      setRecentSearches(getRecentSearches());

      const targetTitle = (initialDestination as any)?.title || (initialDestination as any)?.name;
      if (initialDestination && targetTitle) {
        const destItem = {
          name: targetTitle,
          lat: initialDestination.lat ?? MANAUS_DEFAULT_LOCATION.lat,
          lng: initialDestination.lng ?? MANAUS_DEFAULT_LOCATION.lng
        };
        setDestText(targetTitle);
        setDestCoord(destItem);
        setViewState('uber_overview');
        calculateRoute(originCoord, destItem);
        saveRecentDestination({
          title: targetTitle,
          address: initialDestination.address,
          lineCode: initialDestination.lineCode,
          lat: initialDestination.lat,
          lng: initialDestination.lng
        });
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const origQ = params.get('orig') || params.get('origem');
      const destQ = params.get('dest') || params.get('destino');

      if (origQ && destQ && !destCoord) {
        const resolvePlace = (q: string) => {
          const lower = q.toLowerCase();
          if (lower.includes('t2') || lower.includes('terminal 2')) {
            return { name: 'Terminal 2 - Cachoeirinha', lat: -3.12554, lng: -60.00783 };
          }
          if (lower.includes('t1') || lower.includes('terminal 1')) {
            return { name: 'Terminal 1 - Constantino Nery', lat: -3.12781, lng: -60.02452 };
          }
          if (lower.includes('kobe') || lower.includes('rua kobe')) {
            return { name: 'Rua Kobe', lat: -3.07352, lng: -59.99370 };
          }
          if (lower.includes('imprensa')) {
            return { name: 'Imprensa Oficial do Estado', lat: -3.12453, lng: -60.01872 };
          }
          return null;
        };

        const oCoord = resolvePlace(origQ);
        const dCoord = resolvePlace(destQ);

        if (oCoord && dCoord) {
          setOriginText(oCoord.name);
          setOriginCoord(oCoord);
          setOriginIsGPS(false);
          setDestText(dCoord.name);
          setDestCoord(dCoord);
          setViewState('uber_overview');
          calculateRoute(oCoord, dCoord);
          return;
        }
      }

      if (!destCoord) {
        setViewState('search');
        setActiveField('destination');
        setTimeout(() => destInputRef.current?.focus(), 150);
      }
    }
  }, [isOpen, initialDestination]);

  // Sync user GPS with originCoord when available (only while searching, not while viewing route overview)
  useEffect(() => {
    if (!originIsGPS || viewState === 'uber_overview') return;
    const currentName = gpsStreetName || 'Sua localização atual';
    setOriginText(currentName);
    const newLat = userLocation.lat || MANAUS_DEFAULT_LOCATION.lat;
    const newLng = userLocation.lng || MANAUS_DEFAULT_LOCATION.lng;
    setOriginCoord(prev => {
      if (prev && Math.hypot(prev.lat - newLat, prev.lng - newLng) < 0.0001 && prev.name === currentName) {
        return prev;
      }
      return {
        name: currentName,
        lat: newLat,
        lng: newLng
      };
    });
  }, [userLocation.lat, userLocation.lng, originIsGPS, gpsStreetName, viewState]);

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

        const primaryLeg = data.options?.[0]?.verifiedLegs?.[0];
        const primaryLine = primaryLeg?.line?.code;
        if (dest && dest.name) {
          saveRecentDestination({
            title: dest.name,
            lineCode: primaryLine,
            lat: dest.lat,
            lng: dest.lng
          });
        }

        const params = new URLSearchParams(window.location.search);
        if (params.get('confirm') === 'true' || params.get('confirm') === '0') {
          const opt = data.options[0];
          if (opt && opt.verifiedLegs?.length) {
            const walkOrigin = opt.legs.find((l) => l.type === 'walk_origin');
            const walkDest = opt.legs.find((l) => l.type === 'walk_dest');
            onSelectPlannedTrip({
              legs: opt.verifiedLegs,
              journeyDetails: opt.legs,
              origin: orig,
              destination: dest,
              originStop: opt.originStop,
              destStop: opt.destStop,
              line: opt.verifiedLegs[0].line,
              trip: opt.verifiedLegs[0].trip,
              fullTrip: opt.verifiedLegs[0]?.fullTrip,
              createdAt: Date.now(),
              walkToStopMeters: walkOrigin?.distanceMeters ?? null,
              walkToStopMinutes: walkOrigin?.durationMinutes ?? null,
              walkFromStopMeters: walkDest?.distanceMeters ?? null,
              walkFromStopMinutes: walkDest?.durationMinutes ?? null,
              transitMinutes: opt.transitMinutes,
              totalMinutes: opt.totalMinutes,
              isTransfer: opt.verifiedLegs.length > 1,
              transferHubName: opt.transferHubName,
              secondLine: opt.verifiedLegs[1]?.line,
              originPlatformOrPoint: opt.originPlatformOrPoint,
              destPlatformOrPoint: opt.destPlatformOrPoint,
              etaMinutes: opt.etaMinutes,
              etaTime: opt.etaTime,
              destEtaTime: opt.destEtaTime,
              destEtaMinutes: opt.destEtaMinutes,
              liveBusCount: opt.liveBusCount,
              upcomingBuses: opt.upcomingBuses,
              isLiveGps: opt.isLiveGps
            });
          }
        }
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

      saveRecentDestination({
        title: item.name,
        address: item.subtitle,
        lat: item.lat,
        lng: item.lng
      });

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
      fullTrip: legs[0]?.fullTrip,
      createdAt: Date.now(),
      walkToStopMeters: walkOrigin?.distanceMeters ?? null,
      walkToStopMinutes: walkOrigin?.durationMinutes ?? null,
      walkFromStopMeters: walkDest?.distanceMeters ?? null,
      walkFromStopMinutes: walkDest?.durationMinutes ?? null,
      transitMinutes: activeOption.transitMinutes,
      totalMinutes: activeOption.totalMinutes,
      isTransfer: legs.length > 1,
      transferHubName: activeOption.transferHubName,
      secondLine: legs[1]?.line,
      originPlatformOrPoint: activeOption.originPlatformOrPoint,
      destPlatformOrPoint: activeOption.destPlatformOrPoint,
      etaMinutes: activeOption.etaMinutes,
      etaTime: activeOption.etaTime,
      destEtaTime: activeOption.destEtaTime,
      destEtaMinutes: activeOption.destEtaMinutes,
      liveBusCount: activeOption.liveBusCount,
      upcomingBuses: activeOption.upcomingBuses,
      isLiveGps: activeOption.isLiveGps
    };

    if (destCoord && legs[0]?.line?.code) {
      saveRecentDestination({
        title: destCoord.name,
        lineCode: legs[0].line.code,
        lat: destCoord.lat,
        lng: destCoord.lng
      });
    }

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
        backgroundColor: 'var(--bg-canvas, #09090B)',
        color: 'var(--text-primary, #FFFFFF)',
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
              userLocation={userLocation}
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
              onClick={handleBackToSearch}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-card, #000000)',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.15))',
                color: 'var(--text-primary, #FFFFFF)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-card, 0 4px 16px rgba(0, 0, 0, 0.6))'
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
              backgroundColor: 'var(--bg-sheet, #09090B)',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              borderTop: '1px solid var(--border-medium, rgba(255, 255, 255, 0.12))',
              boxShadow: 'var(--shadow-sheet, 0 -8px 30px rgba(0, 0, 0, 0.8))',
              color: 'var(--text-primary, #FFFFFF)',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '52dvh',
              overflow: 'hidden'
            }}
          >
            {/* Grab Handle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px 0' }}>
              <div style={{ width: '38px', height: '4px', borderRadius: '2px', backgroundColor: 'var(--border-strong, rgba(255, 255, 255, 0.25))' }} />
            </div>

            {/* Content Scrollable Box */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 16px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Loading Skeleton */}
              {!planResult && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '8px 0' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted, #A1A1AA)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Calculando as Melhores Opções...
                  </div>
                  {[1, 2].map((k) => (
                    <div
                      key={k}
                      style={{
                        backgroundColor: 'var(--bg-card, #18181B)',
                        borderRadius: '16px',
                        padding: '16px',
                        height: '72px',
                        opacity: 0.6,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px'
                      }}
                    >
                      <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: 'var(--bg-pill, #27272A)' }} />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ width: '60%', height: '14px', borderRadius: '4px', backgroundColor: 'var(--bg-pill, #27272A)' }} />
                        <div style={{ width: '80%', height: '10px', borderRadius: '4px', backgroundColor: 'var(--bg-pill, #27272A)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Direct Bus Route Options List */}
              {planResult && planResult.options.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted, #A1A1AA)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
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
                          backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.14)' : 'var(--bg-card, #18181B)',
                          border: isSelected ? '2px solid #2563EB' : '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                          borderRadius: '16px',
                          padding: '14px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
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
                              position: 'relative',
                              flexShrink: 0
                            }}
                          >
                            <Bus size={isDirect ? 24 : 20} />
                            {!isDirect && (
                              <div
                                style={{
                                  position: 'absolute',
                                  bottom: '-4px',
                                  right: '-4px',
                                  backgroundColor: 'var(--bg-card, #18181B)',
                                  border: '2px solid #FFFFFF',
                                  borderRadius: '50%',
                                  width: '19px',
                                  height: '19px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.8)'
                                }}
                                title="Troca de ônibus"
                              >
                                <ArrowRightLeft size={10} color="#FFFFFF" strokeWidth={2.8} />
                              </div>
                            )}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary, #FFFFFF)' }}>
                                Linha {opt.title}
                              </span>
                              {opt.totalMinutes && (
                                <span style={{ fontSize: '11px', color: 'var(--text-secondary, #CBD5E1)', fontWeight: 700, backgroundColor: 'var(--bg-pill, rgba(255, 255, 255, 0.08))', padding: '1px 6px', borderRadius: '4px' }}>
                                  {opt.totalMinutes} min
                                </span>
                              )}
                            </div>

                            <div style={{ fontSize: '12px', color: 'var(--text-muted, #A1A1AA)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {opt.subtitle}
                            </div>

                            <div style={{ marginTop: '5px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  backgroundColor: isDirect ? '#2563EB' : '#EA580C',
                                  color: '#FFFFFF',
                                  fontSize: '10.5px',
                                  fontWeight: 800,
                                  padding: '2px 8px',
                                  borderRadius: '999px'
                                }}
                              >
                                {!isDirect && <ArrowRightLeft size={11} color="#FFFFFF" strokeWidth={2.8} />}
                                <span>{opt.badge}</span>
                              </span>

                              {opt.destEtaTime && (
                                <span style={{ fontSize: '11px', color: 'var(--text-primary, #FFFFFF)', fontWeight: 700 }}>
                                  • Chega às {opt.destEtaTime}
                                </span>
                              )}

                              {opt.upcomingBuses && opt.upcomingBuses.length > 0 && (
                                <span style={{ fontSize: '11px', color: 'var(--text-muted, #94A3B8)', fontWeight: 600 }}>
                                  • Próximos: {opt.upcomingBuses.map((b) => b.time).join(', ')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', flexShrink: 0, paddingLeft: '8px' }}>
                          {opt.etaTime && typeof opt.etaMinutes === 'number' ? (
                            <div>
                              <div style={{ fontSize: '16px', fontWeight: 900, color: 'var(--text-primary, #FFFFFF)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                                {opt.etaTime}
                              </div>
                              <div
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  color: '#FFFFFF',
                                  backgroundColor: '#2563EB',
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  marginTop: '3px',
                                  display: 'inline-block'
                                }}
                              >
                                {opt.etaMinutes <= 1 ? 'Chegando' : `em ${opt.etaMinutes} min`}
                              </div>
                              {opt.destEtaTime && (
                                <div style={{ fontSize: '10.5px', color: 'var(--text-muted, #94A3B8)', marginTop: '3px', fontWeight: 600 }}>
                                  Destino: {opt.destEtaTime}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div>
                              <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary, #FFFFFF)' }}>{opt.fare}</div>
                              <div style={{ fontSize: '10px', color: 'var(--text-muted, #71717A)', marginTop: '2px' }}>
                                {opt.liveBusCount ? `${opt.liveBusCount} na rota` : 'Em operação'}
                              </div>
                              {opt.totalMinutes && (
                                <div style={{ fontSize: '10.5px', color: 'var(--text-muted, #94A3B8)', marginTop: '2px', fontWeight: 600 }}>
                                  ~{opt.totalMinutes} min
                                </div>
                              )}
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
              <div style={{ padding: '12px 16px max(env(safe-area-inset-bottom, 0px), 16px) 16px', display: 'flex', gap: '10px', borderTop: '1px solid var(--border-subtle, rgba(255,255,255,0.08))', backgroundColor: 'var(--bg-sheet, #121214)' }}>
                <button
                  id="uber-confirm-trip-btn"
                  onClick={handleConfirmRoute}
                  style={{
                    flex: 1,
                    backgroundColor: 'var(--bg-primary-btn, #FFFFFF)',
                    color: 'var(--text-primary-btn, #000000)',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '15px 0',
                    fontSize: '16px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-card, 0 4px 16px rgba(0, 0, 0, 0.2))'
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
                color: 'var(--text-primary, #FFFFFF)',
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
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary, #FFFFFF)', letterSpacing: '-0.02em', margin: 0 }}>
              Planeje sua próxima rota em Manaus
            </h2>
          </div>

          {/* Inputs Card */}
          <div style={{ padding: '8px 16px 12px 16px' }}>
            <div
              style={{
                backgroundColor: 'var(--bg-card, #18181B)',
                borderRadius: '16px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '16px', flexShrink: 0 }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#3B82F6', border: '2px solid #FFFFFF' }} />
                <div style={{ width: '2px', height: '32px', backgroundColor: 'var(--border-medium, rgba(255, 255, 255, 0.25))' }} />
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
                      color: activeField === 'origin' ? '#3B82F6' : 'var(--text-primary, #FFFFFF)',
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

                <div style={{ height: '1px', backgroundColor: 'var(--border-subtle, rgba(255, 255, 255, 0.08))' }} />

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
                      color: 'var(--text-primary, #FFFFFF)',
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
                      Usar minha localização atual
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#93C5FD', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {gpsStreetName || 'Detectando sua rua em Manaus...'}
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#FFFFFF', backgroundColor: '#2563EB', padding: '4px 8px', borderRadius: '6px' }}>
                  Atual
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
                  backgroundColor: 'var(--bg-card, #18181B)',
                  border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'var(--bg-pill, #27272A)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted, #A1A1AA)', flexShrink: 0 }}>
                    <MapPin size={16} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary, #FFFFFF)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted, #71717A)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.subtitle}
                    </div>
                  </div>
                </div>
                <ChevronRight size={16} color="var(--text-muted, #71717A)" />
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
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted, #71717A)', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline' }}
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
                              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary, #FFFFFF)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {item.name}
                              </div>
                              <div style={{ fontSize: '11.5px', color: 'var(--text-muted, #94A3B8)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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

                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted, #71717A)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '12px 0 6px 0' }}>
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
                      backgroundColor: 'var(--bg-card, #18181B)',
                      border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                      <div style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        backgroundColor: item.type === 'hub' ? 'rgba(59, 130, 246, 0.18)' : 'var(--bg-pill, #27272A)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: item.type === 'hub' ? '#60A5FA' : 'var(--text-muted, #A1A1AA)',
                        flexShrink: 0
                      }}>
                        {item.type === 'hub' ? (
                          <Bus size={16} color="#60A5FA" />
                        ) : (
                          <MapPin size={16} color={item.id.includes('saporo') ? '#F97316' : item.id.includes('imprensa') ? '#3B82F6' : 'var(--text-muted, #A1A1AA)'} />
                        )}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary, #FFFFFF)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted, #71717A)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.subtitle}
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={16} color={item.type === 'hub' ? '#60A5FA' : 'var(--text-muted, #71717A)'} />
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
