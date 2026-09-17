import { useState, useEffect, useRef, useCallback } from 'react';
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
import { saveRecentDestination, type RecentDestination } from './utils/recentDestinations.js';

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
  const [initialDestinationForPlanner, setInitialDestinationForPlanner] = useState<RecentDestination | null>(null);
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

          if (params.get('planner') === 'true' || params.get('planejador') === 'true' || params.get('orig') || params.get('dest')) {
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
          const allStops = stopsData.stops || [];
          setCitywideStops(allStops);
          const stopParam = new URLSearchParams(window.location.search).get('stop');
          if (stopParam && allStops.length > 0) {
            const found = allStops.find((s: StopInfo) => String(s.stopId) === stopParam || s.stopName.toLowerCase().includes(stopParam.toLowerCase()));
            if (found) setSelectedStopForDetails(found);
          }
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

  // Push state to browser history when navigating forward, allowing Android hardware/gesture back buttons to work
  const pushHistoryScreen = (screen: string) => {
    try {
      window.history.pushState({ appScreen: screen }, '');
    } catch {
      // Ignore
    }
  };

  // Handler to open route view for a line (instantly clear previous route and load new line)
  const handleSelectLineAndOpenRoute = (line: RouteSummary) => {
    setPlannedTrip(null);
    setSelectedBus(null);
    setSelectedLine(line);
    setIsRouteMode(true);
    pushHistoryScreen('route');
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
    pushHistoryScreen('explore');
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
    saveRecentDestination({
      title: hub.name,
      address: hub.address || `${hub.name}, Manaus - AM`,
      lineCode: hub.keyLines[0] || '640',
      lat: hub.lat,
      lng: hub.lng
    });
    setPlannedTrip(null);
    setActiveTrip(null);
    setAllTrips([]);
    setSelectedBus(null);
    const matchingLine = lines.find(l => hub.keyLines.includes(l.code)) || lines[0];
    if (matchingLine) {
      setSelectedLine(matchingLine);
      setIsRouteMode(true);
      pushHistoryScreen('route');
    }
  };

  // Handler to open planned trip route with official IMMU itinerary
  const handleSelectPlannedTrip = (plan: PlannedTrip) => {
    if (plan.destination?.name) {
      saveRecentDestination({
        title: plan.destination.name,
        lineCode: plan.line?.code,
        lat: plan.destination.lat,
        lng: plan.destination.lng
      });
    }
    setIsSearchOpen(false);
    setPlannedTrip(plan);
    setSelectedLine(plan.line);
    setSelectedBus(null);
    setActiveTrip(plan.trip);
    setIsRouteMode(true);
    pushHistoryScreen('planned-route');
  };

  // Unified hierarchical back navigation: returns to the immediately preceding screen
  const handleNavigateBack = useCallback(() => {
    // 1. If currently in Route Mode:
    if (isRouteMode) {
      if (plannedTrip) {
        // Step back to TripPlanner overview with results preserved!
        setIsRouteMode(false);
        setPlannedTrip(null);
        setSelectedLine(null);
        setActiveTrip(null);
        setSelectedBus(null);
        setIsSearchOpen(true);
      } else {
        // Return to previous tab / explore view (keeps user on 'lines', 'stops', etc.)
        setIsRouteMode(false);
        setSelectedLine(null);
        setActiveTrip(null);
        setAllTrips([]);
        setSelectedBus(null);
        setSelectedStopForDetails(null);
      }
      return;
    }

    // 2. If Stop Details modal is open:
    if (selectedStopForDetails) {
      setSelectedStopForDetails(null);
      return;
    }

    // 3. If Search / Trip Planner Modal is open:
    if (isSearchOpen) {
      setIsSearchOpen(false);
      setInitialDestinationForPlanner(null);
      return;
    }

    // 4. If on another tab, return to 'home':
    if (activeTab !== 'home') {
      setActiveTab('home');
      return;
    }
  }, [isRouteMode, plannedTrip, selectedStopForDetails, isSearchOpen, activeTab]);

  // Triggers back navigation through history stack if pushed, or directly executes step-back
  const triggerBack = useCallback(() => {
    if (window.history.state?.appScreen) {
      window.history.back();
    } else {
      handleNavigateBack();
    }
  }, [handleNavigateBack]);

  // Listen for Android hardware/gesture back buttons via popstate
  useEffect(() => {
    const handlePopState = () => {
      handleNavigateBack();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [handleNavigateBack]);

  const handleOpenSearch = (initialDest?: RecentDestination | null) => {
    setInitialDestinationForPlanner(initialDest || null);
    setIsSearchOpen(true);
    pushHistoryScreen('search');
  };

  const handleTabChange = (tab: TabType) => {
    if (tab !== activeTab) {
      if (tab !== 'home') {
        pushHistoryScreen(`tab-${tab}`);
      }
      setActiveTab(tab);
      setIsRouteMode(false);
    }
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
          onOpenSearch={handleOpenSearch}
          onBack={triggerBack}
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
              onOpenSearch={handleOpenSearch}
              onOpenSearchWithDestination={(dest) => handleOpenSearch(dest)}
              onNavigateTab={handleTabChange}
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
            onTabChange={handleTabChange}
          />
        </>
      )}

      {isRouteMode && selectedLine && !activeTrip && <div role="status" style={{position:'fixed',bottom:24,zIndex:101,background:'#18181B',color:'#fff',padding:20,borderRadius:16}}>Itinerário indisponível ou carregando. <button onClick={triggerBack}>Voltar</button></div>}
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
          onCloseRoute={triggerBack}
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
        onClose={() => {
          setInitialDestinationForPlanner(null);
          triggerBack();
        }}
        lines={lines}
        terminals={terminals}
        citywideStops={citywideStops}
        userLocation={userLocation}
        onSelectPlannedTrip={handleSelectPlannedTrip}
        onSelectLine={handleSelectLineAndOpenRoute}
        initialDestination={initialDestinationForPlanner}
      />
    </div>
  );
};

export default App;
