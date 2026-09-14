import { useState, useEffect, useRef } from 'react';
import type { RouteSummary, TripDetail, LiveBus, TransitHub, TimetableService, StopInfo, PlannedTrip } from './types/transit.js';
import { MapView } from './components/MapView.js';
import { BottomNav, type TabType } from './components/BottomNav.js';
import { HomeTab } from './components/HomeTab.js';
import { LinesTab } from './components/LinesTab.js';
import { StopsTab } from './components/StopsTab.js';
import { AlertsTab } from './components/AlertsTab.js';
import { TripPlannerModal } from './components/TripPlannerModal.js';
import { BottomSheet } from './components/BottomSheet.js';
import { StopDetailsSheet } from './components/StopDetailsSheet.js';
import { useLiveVehicles } from './hooks/useLiveVehicles.js';
import { useUserLocation } from './hooks/useUserLocation.js';
import { notifyManoReady } from './utils/notifyManoReady.js';
import { WebLaunchOverlay } from './components/WebLaunchOverlay.js';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isRouteMode, setIsRouteMode] = useState(false);
  const [lines, setLines] = useState<RouteSummary[]>([]);
  const [selectedLine, setSelectedLine] = useState<RouteSummary | null>(null);
  const [allTrips, setAllTrips] = useState<TripDetail[]>([]);
  const [activeTrip, setActiveTrip] = useState<TripDetail | null>(null);
  const [schedule, setSchedule] = useState<TimetableService[]>([]);
  const [terminals, setTerminals] = useState<TransitHub[]>([]);
  const [citywideStops, setCitywideStops] = useState<StopInfo[]>([]);
  const [citywideVehicles, setCitywideVehicles] = useState<LiveBus[]>([]);
  const [selectedBus, setSelectedBus] = useState<LiveBus | null>(null);
  const [selectedStopForDetails, setSelectedStopForDetails] = useState<StopInfo | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [plannedTrip, setPlannedTrip] = useState<PlannedTrip | null>(null);

  // User real GPS position
  const { location: userLocation, requestLocation } = useUserLocation();

  // Real-time SSE vehicle stream for selected line
  const { vehicles } = useLiveVehicles(
    selectedLine?.id || '215q',
    selectedLine?.code || '640'
  );

  // Signal native launch handler that first usable screen is mounted
  useEffect(() => {
    return notifyManoReady();
  }, []);

  // Fetch initial catalog: lines, terminals, and citywide corridor stops
  useEffect(() => {
    async function initCatalog() {
      try {
        const [linesRes, termsRes, stopsRes] = await Promise.all([
          fetch('/api/lines'),
          fetch('/api/terminals'),
          fetch('/api/stops/citywide')
        ]);

        if (linesRes.ok) {
          const linesData = await linesRes.json();
          const allLoadedLines = linesData.lines || [];
          setLines(allLoadedLines);
          const params = new URLSearchParams(window.location.search);
          const tabParam = (params.get('tab') || '').toLowerCase().trim();
          if (tabParam === 'alerts' || tabParam === 'alertas') setActiveTab('alerts');
          else if (tabParam === 'lines' || tabParam === 'linhas') setActiveTab('lines');
          else if (tabParam === 'stops' || tabParam === 'terminais') setActiveTab('stops');
          else if (tabParam === 'home' || tabParam === 'inicio') setActiveTab('home');

          if (params.get('planner') === 'true' || params.get('planejador') === 'true') {
            setIsSearchOpen(true);
          }

          const routeParam = params.get('line') || params.get('route') || window.location.hash.replace('#', '').trim();
          const targetLine = routeParam
            ? (allLoadedLines.find((l: RouteSummary) => l.code.toLowerCase() === routeParam.toLowerCase() || l.id.toLowerCase() === routeParam.toLowerCase()) || allLoadedLines.find((l: RouteSummary) => l.code === '640'))
            : allLoadedLines.find((l: RouteSummary) => l.code === '640');
          if (targetLine) {
            setSelectedLine(targetLine);
            if (routeParam) {
              setIsRouteMode(true);
            }
          }
        }

        if (termsRes.ok) {
          const termsData = await termsRes.json();
          setTerminals(termsData.hubs || []);
        }

        if (stopsRes.ok) {
          const stopsData = await stopsRes.json();
          setCitywideStops(stopsData.stops || []);
        }
      } catch (err) {
        console.error('Failed to load initial transit data', err);
      }
    }
    initCatalog();
  }, []);

  // Live vehicles across Manaus for home mini-map & citywide exploration mode (Uber/99 view)
  useEffect(() => {
    let isMounted = true;
    async function loadCitywideVehicles() {
      try {
        const res = await fetch('/api/live/citywide');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.vehicles) {
            setCitywideVehicles(data.vehicles);
          }
        }
      } catch (err) {
        console.error('Failed to load citywide vehicles', err);
      }
    }

    loadCitywideVehicles();
    const interval = setInterval(loadCitywideVehicles, 4500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const lineRequest = useRef(0);
  useEffect(() => {
    const request = ++lineRequest.current;
    const controller = new AbortController();
    setSchedule([]);
    if (plannedTrip) { setAllTrips(plannedTrip.legs.map(l=>l.trip)); setActiveTrip(plannedTrip.trip); return; }
    setActiveTrip(null); setAllTrips([]);
    if (!selectedLine) return;
    for (const endpoint of ['itinerary', 'schedule']) {
      void fetch(`/api/lines/${encodeURIComponent(selectedLine.id)}/${endpoint}`, { signal: controller.signal })
        .then(response => {
          if (!response.ok) throw new Error('Indisponível');
          return response.json() as Promise<{ trips?: TripDetail[]; services?: TimetableService[] }>;
        })
        .then(data => {
          if (controller.signal.aborted || request !== lineRequest.current) return;
          if (endpoint === 'itinerary') {
            const trips = data.trips || [];
            setAllTrips(trips);
            const dirParam = new URLSearchParams(window.location.search).get('dir')?.toLowerCase();
            const preferred = dirParam ? (trips.find(t => t.directionType === dirParam) || trips[0]) : trips[0];
            setActiveTrip(preferred || null);
          } else {
            setSchedule(data.services || []);
          }
        }).catch(() => {});
    }
    return () => controller.abort();
  }, [selectedLine, plannedTrip]);

  // Handler to open route view for a line (instantly clear previous route and load new line)
  const handleSelectLineAndOpenRoute = (line: RouteSummary) => {
    setPlannedTrip(null);
    setSelectedBus(null);
    setSelectedLine(line);
    setIsRouteMode(true);

  };

  // Handler to open citywide exploration mode (no forced line, shows all circulating buses & stops)
  const handleOpenExploreMap = () => {
    setPlannedTrip(null);
    setSelectedLine(null);
    setActiveTrip(null);
    setAllTrips([]);
    setSelectedBus(null);
    setSelectedStopForDetails(null);
    setIsRouteMode(true);
  };

  // Handler for selecting a live bus (in explore mode, opens that bus's line trajectory)
  const handleSelectBus = (bus: LiveBus | null) => {
    setSelectedBus(bus);
    if (bus && !selectedLine) {
      const code = bus.routeCode;
      const found = lines.find(l => l.code === code);
      if (found) {
        handleSelectLineAndOpenRoute(found);
        setSelectedBus(bus);
      }
    }
  };

  // Handler to open route view for terminal
  const handleSelectTerminal = (hub: TransitHub) => {
    setPlannedTrip(null);
    setActiveTrip(null);
    setAllTrips([]);
    setSelectedBus(null);
    const matchingLine = lines.find(l => hub.keyLines.includes(l.code)) || lines[0];
    if (matchingLine) {
      setSelectedLine(matchingLine);
      setIsRouteMode(true);
    }
  };

  // Handler to open planned trip route with official IMMU itinerary
  const handleSelectPlannedTrip = (plan: PlannedTrip) => {
    setIsSearchOpen(false);
    setPlannedTrip(plan);
    setSelectedLine(plan.line);
    setSelectedBus(null);
    setActiveTrip(plan.trip);
    setIsRouteMode(true);
  };

  const handleCloseRoute = () => {
    setIsSearchOpen(false);
    setIsRouteMode(false);
    setActiveTab('home');
    setSelectedLine(null);
    setActiveTrip(null);
    setAllTrips([]);
    setSelectedBus(null);
    setSelectedStopForDetails(null);
    setPlannedTrip(null);
  };

  return (
    <div
      id="app-root-container"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#09090B'
      }}
    >
      <WebLaunchOverlay />
      {/* Background/Route Map Engine (CartoDB Dark Matter with deep zoom support) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: isRouteMode ? 10 : 0,
          visibility: isRouteMode ? 'visible' : 'hidden',
          pointerEvents: isRouteMode ? 'auto' : 'none'
        }}
      >
        <MapView
          selectedLine={selectedLine}
          activeTrip={activeTrip}
          vehicles={selectedLine ? vehicles : citywideVehicles}
          terminals={terminals}
          citywideStops={citywideStops}
          selectedBus={selectedBus}
          userLocation={userLocation}
          isRouteView={isRouteMode}
          plannedTrip={plannedTrip}
          onSelectBus={handleSelectBus}
          onSelectStop={(stop: StopInfo) => {
            setSelectedStopForDetails(stop);
          }}
          onOpenSearch={() => setIsSearchOpen(true)}
          onBack={handleCloseRoute}
        />
      </div>

      {/* Screen Tabs (When Not in Direct Route Tracking Mode) */}
      {!isRouteMode && (
        <>
          {activeTab === 'home' && (
            <HomeTab
              lines={lines}
              terminals={terminals}
              vehicles={citywideVehicles.length > 0 ? citywideVehicles : vehicles}
              stops={citywideStops}
              userLocation={userLocation}
              onSelectLine={handleSelectLineAndOpenRoute}
              onOpenSearch={() => setIsSearchOpen(true)}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onRequestGPS={requestLocation}
              onOpenFullMap={handleOpenExploreMap}
            />
          )}

          {activeTab === 'lines' && (
            <LinesTab
              lines={lines}
              selectedLine={selectedLine}
              onSelectLine={handleSelectLineAndOpenRoute}
            />
          )}

          {activeTab === 'stops' && (
            <StopsTab
              terminals={terminals}
              lines={lines}
              stops={citywideStops}
              userLocation={userLocation}
              onSelectTerminal={handleSelectTerminal}
              onSelectLine={handleSelectLineAndOpenRoute}
              onRequestGPS={requestLocation}
            />
          )}

          {activeTab === 'alerts' && (
            <AlertsTab
              lines={lines}
              onSelectLine={handleSelectLineAndOpenRoute}
            />
          )}

          {/* Persistent Native Bottom Navigation Bar with 4 Tabs */}
          <BottomNav
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              setIsRouteMode(false);
            }}
          />
        </>
      )}

      {isRouteMode && selectedLine && !activeTrip && <div role="status" style={{position:'fixed',bottom:24,zIndex:101,background:'#18181B',color:'#fff',padding:20,borderRadius:16}}>Itinerário indisponível ou carregando. <button onClick={handleCloseRoute}>Voltar</button></div>}
      {/* Route Tracking Mode Bottom Sheet (Uber Ride Card Style) */}
      {isRouteMode && selectedLine && activeTrip && (
        <BottomSheet
          selectedLine={selectedLine}
          activeTrip={activeTrip}
          allTrips={allTrips}
          vehicles={vehicles}
          schedule={schedule}
          plannedTrip={plannedTrip}
          onSelectTrip={(trip) => {
            setActiveTrip(trip);
            if (plannedTrip && trip.tripId !== plannedTrip.trip.tripId) {
              setPlannedTrip(null);
            }
          }}
          onSelectStop={(stop) => setSelectedStopForDetails(stop)}
          onSelectBus={(bus) => setSelectedBus(bus)}
          onCloseRoute={handleCloseRoute}
        />
      )}

      {/* Standalone Stop Details Sheet Modal (When tapping any stop on the map) */}
      <StopDetailsSheet
        stop={selectedStopForDetails}
        userLocation={userLocation}
        lines={lines}
        onClose={() => setSelectedStopForDetails(null)}
        onSelectLine={(line) => {
          setSelectedStopForDetails(null);
          handleSelectLineAndOpenRoute(line);
        }}
      />

      {/* Trip Planner Search Modal (Planeje sua viagem - Uber Style) */}
      <TripPlannerModal
        isOpen={isSearchOpen}
        onClose={handleCloseRoute}
        lines={lines}
        terminals={terminals}
        citywideStops={citywideStops}
        userLocation={userLocation}
        onSelectPlannedTrip={handleSelectPlannedTrip}
        onSelectLine={handleSelectLineAndOpenRoute}
      />
    </div>
  );
};

export default App;
