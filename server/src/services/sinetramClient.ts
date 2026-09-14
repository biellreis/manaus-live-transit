import fs from 'node:fs';
import path from 'node:path';
import { decodePolyline } from './polyline.js';
import { MANAUS_OFFICIAL_CATALOG } from './manausNetworkCatalog.js';
import manausAllRoutesStatic from './manausAllRoutesCache.json';

let networkCacheMemory: Record<string, { line: RouteSummary; trips: TripDetail[] }> | null = null;

function loadAllRoutesCache(): Record<string, { line: RouteSummary; trips: TripDetail[] }> {
  if (networkCacheMemory) return networkCacheMemory;
  if (manausAllRoutesStatic && Object.keys(manausAllRoutesStatic).length > 0) {
    networkCacheMemory = manausAllRoutesStatic as unknown as Record<string, { line: RouteSummary; trips: TripDetail[] }>;
    return networkCacheMemory;
  }
  const locations = [
    path.join(__dirname, 'manausAllRoutesCache.json'),
    path.resolve(__dirname, '../../src/services/manausAllRoutesCache.json'),
    path.resolve(process.cwd(), 'server/src/services/manausAllRoutesCache.json'),
    path.resolve(process.cwd(), 'src/services/manausAllRoutesCache.json')
  ];
  for (const file of locations) {
    if (fs.existsSync(file)) {
      try {
        const raw = fs.readFileSync(file, 'utf8');
        networkCacheMemory = JSON.parse(raw);
        return networkCacheMemory!;
      } catch (err) {
        console.error('Failed to parse manausAllRoutesCache.json:', err);
      }
    }
  }
  networkCacheMemory = {};
  return networkCacheMemory;
}

function isAuxiliaryTrip(tripName: string): boolean {
  const upper = (tripName || '').toUpperCase();
  return (
    upper.includes('☀️') ||
    upper.includes('🌅') ||
    upper.includes('🌙') ||
    upper.includes('(DOM.') ||
    upper.includes('(SÁB') ||
    upper.includes('(SAB') ||
    upper.includes('REFORÇO') ||
    upper.includes('REFORCO') ||
    upper.includes('AUXILIAR')
  );
}

function classifyAndSortTrips(routeCode: string, routeName: string, trips: TripDetail[]): TripDetail[] {
  if (!trips || trips.length === 0) return [];
  if (trips.length === 1) {
    return [{ ...trips[0], directionType: 'ida' }];
  }

  const nameSplit = routeName.split('-');
  const lineDetails = nameSplit.length > 1 ? nameSplit[1].trim() : routeName;
  const parts = lineDetails.split('/').map(p => p.trim());
  const bairroName = parts[0]?.toUpperCase() || '';
  const destinoName = parts[parts.length - 1]?.toUpperCase() || '';

  const getEndpoints = (t: TripDetail) => {
    const first = t.stops[0]?.stopName.toUpperCase() || '';
    const last = t.stops[t.stops.length - 1]?.stopName.toUpperCase() || '';
    const name = t.tripName.toUpperCase();
    return { first, last, name };
  };

  const scoredTrips = trips.map(t => {
    const { first, last, name } = getEndpoints(t);
    const aux = isAuxiliaryTrip(t.tripName);

    let idaScore = 0;
    let voltaScore = 0;

    // Match main Bairro / Origin Terminal
    if (bairroName && first.includes(bairroName)) idaScore += 25;
    if (bairroName && last.includes(bairroName)) voltaScore += 25;

    // Match Destination
    if (destinoName && last.includes(destinoName)) idaScore += 20;
    if (destinoName && first.includes(destinoName)) voltaScore += 20;

    // Common destination keywords for IDA (Bairro -> Centro / Terminal / Cachoeirinha / T1 / T2)
    if (
      last.includes('CENTRO') ||
      last.includes('SAUDADE') ||
      last.includes('MATRIZ') ||
      last.includes('CACHOEIRINHA')
    ) {
      idaScore += 15;
    }

    if (
      first.includes('CENTRO') ||
      first.includes('SAUDADE') ||
      first.includes('MATRIZ') ||
      first.includes('CACHOEIRINHA')
    ) {
      voltaScore += 15;
    }

    // Direction indicators in trip name
    if (name.includes('→ CENTRO') || name.includes('→ SAUDADE') || name.includes('→ T2') || name.includes('→ T1')) idaScore += 5;
    if (name.startsWith('CENTRO') || name.startsWith('SAUDADE') || name.startsWith('T2 →') || name.startsWith('T1 →')) voltaScore += 5;

    // Prefer full trips (higher stop counts) over short turns
    idaScore += (t.stops?.length || 0) * 0.5;
    voltaScore += (t.stops?.length || 0) * 0.5;

    // Penalty for auxiliary short-turns when finding primary IDA/VOLTA
    if (aux) {
      idaScore -= 40;
      voltaScore -= 40;
    }

    return { trip: t, idaScore, voltaScore, stopsCount: t.stops?.length || 0, aux };
  });

  // Pick best IDA trip
  const sortedForIda = [...scoredTrips].sort((a, b) => b.idaScore - a.idaScore);
  const bestIda = sortedForIda[0].trip;

  // Pick best VOLTA trip (must be different from bestIda)
  const sortedForVolta = [...scoredTrips]
    .filter(t => t.trip.tripId !== bestIda.tripId)
    .sort((a, b) => b.voltaScore - a.voltaScore);
  const bestVolta = sortedForVolta[0]?.trip;

  const classified = trips.map(t => {
    if (t.tripId === bestIda.tripId) return { ...t, directionType: 'ida' as const };
    if (bestVolta && t.tripId === bestVolta.tripId) return { ...t, directionType: 'volta' as const };
    return { ...t, directionType: 'auxiliar' as const };
  });

  // Always return sorted so IDA is at index 0, VOLTA is at index 1
  return classified.sort((a, b) => {
    const order: Record<string, number> = { ida: 0, volta: 1, circular: 0, auxiliar: 2 };
    const oA = order[a.directionType] ?? 2;
    const oB = order[b.directionType] ?? 2;
    return oA - oB;
  });
}

function getOfflineTrips(routeId: string): TripDetail[] {
  const cleanId = String(routeId || '').toLowerCase().trim();
  if (!cleanId) return [];

  const cache = loadAllRoutesCache();
  const entries = Object.values(cache);

  let matched = entries.find(e => 
    e.line.code.toLowerCase() === cleanId || 
    e.line.id.toLowerCase() === cleanId ||
    ((e as any).code && String((e as any).code).toLowerCase() === cleanId)
  );

  if (!matched) {
    const stripped = cleanId.replace(/^0+/, '');
    matched = entries.find(e => 
      e.line.code.replace(/^0+/, '').toLowerCase() === stripped ||
      e.line.id.toLowerCase().includes(cleanId)
    );
  }

  if (matched && Array.isArray(matched.trips) && matched.trips.length > 0) {
    return classifyAndSortTrips(matched.line.code, matched.line.name, matched.trips);
  }
  return [];
}

export interface RouteSummary {
  id: string;          // e.g. "215q"
  code: string;        // e.g. "640"
  name: string;        // e.g. "640 - T4 / T3 / E4 / E2 / E1 / T1 / Centro"
  category: 'troncal' | 'alimentadora' | 'circular' | 'interbairros' | 'convencional';
  color: string;
}

export interface StopInfo {
  stopId: number;
  stopName: string;
  lat: number;
  lng: number;
  sequence: number;
  distKm: number;
  timeSeconds: number;
  reference?: number;
  lines?: string[];
}

export interface TripDetail {
  tripId: number;
  tripName: string;
  tripShortName: string;
  directionType: 'ida' | 'volta' | 'circular' | 'auxiliar';
  totalTimeSeconds: number;
  totalDistanceKm: number;
  coordinates: [number, number][]; // GeoJSON [lng, lat]
  stops: StopInfo[];
}

export interface LiveBus {
  id: string;           // Vehicle prefix e.g. "0426003"
  lat: number;
  lng: number;
  heading: number;      // 0-360 azimuth
  headsign: string;
  timestamp: number;
  tripId?: number;
  routeCode?: string;
  routeId?: string;
  direction?: 'ida' | 'volta' | 'desconhecido';
  speedKmh?: number;
  hasAirConditioning?: boolean;
  crowding?: 'baixa' | 'moderada' | 'alta';
}

export interface TimetableDeparture {
  time: string;
  accessible: boolean;
  tripId: number;
}

export interface TimetableDirection {
  direction: string;
  departures: TimetableDeparture[];
}

export interface TimetableService {
  serviceId: string;
  serviceName: string; // "Segunda-feira", "Sábado", "Domingo", etc.
  directions: TimetableDirection[];
}

// In-Memory Cache with TTL
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

class SinetramClient {
  private project = '4pc1e';
  private baseUrl = 'https://editor.mobilibus.com';
  private cache = new Map<string, CacheEntry<unknown>>();
  private vehicleHistory = new Map<string, { lat: number; lng: number; timestamp: number; speedKmh: number }>();

  private getCached<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  private setCache<T>(key: string, data: T, ttlMs: number): void {
    this.cache.set(key, { data, expiresAt: Date.now() + ttlMs });
  }

  /**
   * Determine route category and clean corporate transit color
   */
  private categorizeRoute(code: string, name: string): { category: RouteSummary['category']; color: string } {
    const upper = name.toUpperCase();
    const cleanCode = code.toUpperCase();

    const troncalCodes = ['300', '357', '448', '500', '560', '640', '652', '650', '651', '600', '678', '418', '452'];
    if (troncalCodes.includes(cleanCode) || upper.includes('EXPRESSO') || upper.includes('DIRETO')) {
      return { category: 'troncal', color: '#2563EB' }; // Royal Transit Blue
    }

    if (upper.includes('INTERBAIRROS') || cleanCode === '001' || cleanCode === '002' || cleanCode === '008') {
      return { category: 'interbairros', color: '#D97706' }; // Warm Amber
    }

    if (upper.includes('CIRCULAR') || cleanCode === '004' || cleanCode === '010' || cleanCode === '013') {
      return { category: 'circular', color: '#7C3AED' }; // Slate Purple
    }

    if (cleanCode.startsWith('A') || (cleanCode.startsWith('0') && parseInt(cleanCode, 10) >= 20)) {
      return { category: 'alimentadora', color: '#059669' }; // Forest Green
    }

    return { category: 'convencional', color: '#2563EB' };
  }

  /**
   * Classify trip direction (Ida vs Volta)
   */
  /**
   * Classify trip direction (Ida vs Volta)
   */
  private classifyDirection(tripName: string, index: number, totalTrips: number): 'ida' | 'volta' | 'circular' | 'auxiliar' {
    const upper = tripName.toUpperCase().trim();
    if (upper.includes('CIRCULAR')) return 'circular';

    // In 2-trip routes in Manaus, trip 0 is IDA (Bairro -> Centro / Terminal) and trip 1 is VOLTA (Centro / Terminal -> Bairro)
    if (totalTrips === 2) {
      if (index === 0) {
        if (
          upper.startsWith('CENTRO') ||
          upper.startsWith('MATRIZ') ||
          upper.startsWith('T1 →') ||
          upper.startsWith('T2 →') ||
          upper.startsWith('T3 →') ||
          upper.startsWith('T4 →') ||
          upper.startsWith('T5 →') ||
          upper.startsWith('T6 →') ||
          upper.includes('→ BAIRRO')
        ) {
          return 'volta';
        }
        return 'ida';
      } else {
        // index === 1
        if (
          upper.endsWith('CENTRO') ||
          upper.endsWith('MATRIZ') ||
          upper.includes('→ T1') ||
          upper.includes('→ T2') ||
          upper.includes('→ T3') ||
          upper.includes('→ T4') ||
          upper.includes('→ T5') ||
          upper.includes('→ T6')
        ) {
          return 'ida';
        }
        return 'volta';
      }
    }

    // Multi-trip routes (> 2 trips):
    if (
      upper.startsWith('CENTRO') ||
      upper.startsWith('MATRIZ') ||
      upper.startsWith('T1 →') ||
      upper.startsWith('T2 →') ||
      upper.startsWith('T3 →') ||
      upper.startsWith('T4 →') ||
      upper.startsWith('T5 →') ||
      upper.startsWith('T6 →') ||
      upper.includes('→ BAIRRO')
    ) {
      return 'volta';
    }

    if (
      upper.endsWith('CENTRO') ||
      upper.endsWith('MATRIZ') ||
      upper.includes('→ T1') ||
      upper.includes('→ T2') ||
      upper.includes('→ T3') ||
      upper.includes('→ T4') ||
      upper.includes('→ T5') ||
      upper.includes('→ T6')
    ) {
      return 'ida';
    }

    return index === 0 ? 'ida' : index === 1 ? 'volta' : 'auxiliar';
  }

  /**
   * Fetch complete line catalog from Mobilibus select options
   */
  async getLines(): Promise<RouteSummary[]> {
    const cacheKey = 'routes:catalog';
    const cached = this.getCached<RouteSummary[]>(cacheKey);
    if (cached) return cached;

    try {
      const resp = await fetch(`${this.baseUrl}/web/timetable/${this.project}`, {
        signal: AbortSignal.timeout(10000), headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      if (!resp.ok) throw new Error(`Failed to fetch lines: ${resp.statusText}`);
      const html = await resp.text();

      const selectRegex = /<select[^>]*>([\s\S]*?)<\/select>/i;
      const selectMatch = html.match(selectRegex);
      if (!selectMatch) throw new Error('No select found in timetable page');

      const optionRegex = /<option\s+value="([^"]+)">([^<]+)<\/option>/gi;
      let match: RegExpExecArray | null;

      // Seed with canonical official IMMU network catalog (covering up to 715 and A030-A626)
      const routeMap = new Map<string, RouteSummary>();
      for (const cat of MANAUS_OFFICIAL_CATALOG) {
        routeMap.set(cat.code, {
          id: cat.id,
          code: cat.code,
          name: cat.name,
          category: cat.category,
          color: cat.color
        });
      }

      while ((match = optionRegex.exec(selectMatch[1])) !== null) {
        const id = match[1].trim();
        const rawName = match[2].trim();
        if (!id) continue;

        const split = rawName.split('-');
        const code = split[0].trim();
        const { category, color } = this.categorizeRoute(code, rawName);

        // Update with real Mobilibus ID or insert new
        routeMap.set(code, {
          id,
          code,
          name: rawName,
          category,
          color
        });
      }

      const routes: RouteSummary[] = Array.from(routeMap.values());

      routes.sort((a, b) => {
        const priorityCodes = ['640', '300', '448', '560', '652', '357', '500', '001', '041', 'A030', '715'];
        const pA = priorityCodes.indexOf(a.code);
        const pB = priorityCodes.indexOf(b.code);
        if (pA !== -1 && pB !== -1) return pA - pB;
        if (pA !== -1) return -1;
        if (pB !== -1) return 1;
        return a.code.localeCompare(b.code, undefined, { numeric: true });
      });

      this.setCache(cacheKey, routes, 24 * 60 * 60 * 1000);
      return routes;
    } catch (err) {
      console.error('[SinetramClient] Error fetching lines:', err);
      return this.getFallbackLines();
    }
  }

  /**
   * Fetch itinerary details (Ida, Volta, shapes, and stop sequences with cumulative time and dist)
   */
  async getRouteItinerary(routeId: string): Promise<TripDetail[]> {
    // Resolve route code (e.g. '409') to internal Mobilibus routeId (e.g. '213t') if needed
    let effectiveRouteId = routeId;
    const catalogMatch = MANAUS_OFFICIAL_CATALOG.find(c => c.code === routeId || c.id === routeId);
    if (catalogMatch) {
      effectiveRouteId = catalogMatch.id;
    } else {
      const cachedLines = this.getCached<RouteSummary[]>('routes:catalog');
      const matched = cachedLines?.find(l => l.code === routeId || l.id === routeId);
      if (matched) {
        effectiveRouteId = matched.id;
      }
    }

    const cacheKey = `route:itinerary:${effectiveRouteId}`;
    const cached = this.getCached<TripDetail[]>(cacheKey);
    if (cached) return cached;

    // Instant offline cache lookup (100% complete IDA & VOLTA coverage for all 238 Manaus lines)
    const offlineTrips = getOfflineTrips(routeId);
    if (offlineTrips.length > 0) {
      this.setCache(cacheKey, offlineTrips, 24 * 60 * 60 * 1000);
      return offlineTrips;
    }

    try {
      const resp = await fetch(`${this.baseUrl}/web/get-route-info`, {
        method: 'POST',
        signal: AbortSignal.timeout(2000),
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Content-Type': 'application/json;charset=UTF-8',
          'Referer': `${this.baseUrl}/web/detalhes-linha/${this.project}`
        },
        body: effectiveRouteId
      });

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const rawTrips = await resp.json() as any[];

      const rawParsedTrips: TripDetail[] = rawTrips.map((rt: any, idx: number) => {
        const shapeCoordinates = decodePolyline(rt.shape || rt.polyline || '');
        const rawStops = rt.stops || [];

        const stops: StopInfo[] = rawStops
          .map((s: any, stopIdx: number) => ({
            stopId: Number(s.stopId),
            stopName: String(s.stopName || `Parada #${s.stopId}`),
            lat: Number(s.lat),
            lng: Number(s.lon),
            sequence: stopIdx + 1,
            distKm: Number((Number(s.dist || 0)).toFixed(2)),
            timeSeconds: Number(s.time || 0),
            reference: s.reference
          }))
          // Sanitize: ensure all stops fall strictly within Manaus urban territory
          .filter((s: StopInfo) => s.lat >= -3.18 && s.lat <= -2.95 && s.lng >= -60.15 && s.lng <= -59.85);

        const totalTimeSeconds = stops.length > 0 ? stops[stops.length - 1].timeSeconds : Number(rt.totalTime || 0) * 60;
        const totalDistanceKm = stops.length > 0 ? stops[stops.length - 1].distKm : 0;
        const directionType = this.classifyDirection(rt.tripName || '', idx, rawTrips.length);

        return {
          tripId: Number(rt.tripId),
          tripName: String(rt.tripName || 'Itinerário'),
          tripShortName: String(rt.tripShortName || ''),
          directionType,
          totalTimeSeconds,
          totalDistanceKm,
          coordinates: shapeCoordinates.filter(([lng, lat]) => lat >= -3.18 && lat <= -2.95 && lng >= -60.15 && lng <= -59.85),
          stops
        };
      });

      if (!rawParsedTrips || rawParsedTrips.length === 0) {
        throw new Error('Empty trips from Mobilibus');
      }

      this.setCache(cacheKey, rawParsedTrips, 6 * 60 * 60 * 1000);
      return rawParsedTrips;
    } catch (err) {
      console.warn(`[SinetramClient] Itinerary network fallback used for ${routeId}`);
      return offlineTrips;
    }
  }

  /**
   * Fetch real-time bus telemetry for a route
   */
  async getRealtimeVehicles(routeId: string, routeCode: string = ''): Promise<LiveBus[]> {
    const cacheKey = `realtime:${routeId}`;
    const cached = this.getCached<LiveBus[]>(cacheKey);
    if (cached) return cached;

    try {
      const resp = await fetch(`${this.baseUrl}/web/get-route-realtime-info`, {
        method: 'POST',
        signal: AbortSignal.timeout(10000),
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Content-Type': 'application/json;charset=UTF-8',
          'Referer': `${this.baseUrl}/web/detalhes-linha/${this.project}`
        },
        body: JSON.stringify({
          project: this.project,
          route: routeId,
          stopId: 0,
          routeName: routeCode
        })
      });

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json() as any;
      const rawVehicles = data.vehicles || [];

      if (!Array.isArray(rawVehicles)) throw new Error('Invalid vehicles feed');

      // Filter to Manaus urban land coordinates only (Latitude: -3.16 to -2.95, Longitude: -60.15 to -59.85)
      const validVehicles = rawVehicles.filter((v: any) => {
        const lat = Number(v.lat);
        const lon = Number(v.lon);
        return lat >= -3.16 && lat <= -2.95 && lon >= -60.15 && lon <= -59.85;
      });

      const vehicles: LiveBus[] = validVehicles.map((v: any) => {
        const id = String(v.id || 'ONIBUS');
        const lat = Number(v.lat);
        const lng = Number(v.lon);
        const pt = Number(v.pt || Date.now());
        const heading = Number(v.dir || 0);

        // Calculate REAL GPS speed (km/h) via Haversine delta tracking
        let calculatedSpeedKmh = typeof v.sp === 'number' ? v.sp : typeof v.speed === 'number' ? v.speed : 0;
        const prev = this.vehicleHistory.get(id);
        if (prev) {
          const deltaSec = (pt - prev.timestamp) / 1000;
          if (deltaSec >= 1 && deltaSec <= 300) {
            const distM = haversineMeters(prev.lat, prev.lng, lat, lng);
            const rawSpeed = Math.round((distM / deltaSec) * 3.6);
            if (rawSpeed >= 0 && rawSpeed <= 90) {
              calculatedSpeedKmh = rawSpeed;
            } else {
              calculatedSpeedKmh = prev.speedKmh;
            }
          } else if (prev.speedKmh > 0) {
            calculatedSpeedKmh = prev.speedKmh;
          }
        }
        this.vehicleHistory.set(id, { lat, lng, timestamp: pt, speedKmh: calculatedSpeedKmh });

        // Precise Direction Detection:
        const lb = String(v.lb || '').toUpperCase().trim();
        let direction: 'ida' | 'volta' | 'desconhecido' = 'desconhecido';
        if (lb.includes('→ CENTRO') || lb.endsWith('CENTRO') || lb.includes('→ MATRIZ') || lb.endsWith('MATRIZ') || (lb.includes('CENTRO') && !lb.startsWith('CENTRO'))) {
          direction = 'ida';
        } else if (lb.startsWith('CENTRO') || lb.startsWith('MATRIZ') || lb.includes('→ T4') || lb.includes('→ T5') || lb.endsWith('T4') || lb.endsWith('T5') || lb.includes('BAIRRO')) {
          direction = 'volta';
        }

        return {
          id,
          lat,
          lng,
          heading,
          headsign: String(v.lb || 'Manaus'),
          timestamp: pt,
          tripId: Number(v.tid || 0),
          routeCode,
          routeId,
          direction,
          speedKmh: calculatedSpeedKmh
        };
      });

      this.setCache(cacheKey, vehicles, 5000);
      return vehicles;
    } catch (err) {
      console.warn(`[SinetramClient] Telemetry unavailable for ${routeId}`, err);
      return [];
    }
  }

  /**
   * Fetch circulating vehicles across all major Manaus transit corridors (Uber/99 map view)
   */
  async getCitywideVehicles(): Promise<LiveBus[]> {
    const cacheKey = 'vehicles:citywide';
    const cached = this.getCached<LiveBus[]>(cacheKey);
    if (cached) return cached;

    const keyRoutes = [
      { id: '215q', code: '640' },
      { id: '212s', code: '300' },
      { id: '214c', code: '448' },
      { id: '2153', code: '560' },
      { id: '27mo', code: '357' },
      { id: '213t', code: '409' },
      { id: '2141', code: '422' },
      { id: '211r', code: '120' },
      { id: '2121', code: '126' },
      { id: 'b8eu', code: '600' },
      { id: '215s', code: '650' },
      { id: '215u', code: '652' },
      { id: 'aal5', code: '678' },
      { id: '20vd', code: '001' },
      { id: '20ve', code: '002' },
      { id: '20vg', code: '004' },
      { id: 'b8eo', code: '010' },
      { id: '215h', code: '616' },
      { id: '2120', code: '125' },
      { id: '212m', code: '219' },
      { id: '2127', code: '203' }
    ];

    try {
      const results = await Promise.allSettled(
        keyRoutes.map(r => this.getRealtimeVehicles(r.id, r.code))
      );

      const allVehicles: LiveBus[] = [];
      const seenIds = new Set<string>();

      for (let i = 0; i < results.length; i++) {
        const res = results[i];
        if (res.status === 'fulfilled' && Array.isArray(res.value)) {
          const rCode = keyRoutes[i].code;
          const rId = keyRoutes[i].id;
          for (const v of res.value) {
            if (!seenIds.has(v.id)) {
              seenIds.add(v.id);
              allVehicles.push({
                ...v,
                routeCode: v.routeCode || rCode,
                routeId: v.routeId || rId
              });
            }
          }
        }
      }

      this.setCache(cacheKey, allVehicles, 4000);
      return allVehicles;
    } catch (err) {
      console.error('[SinetramClient] Error fetching citywide vehicles:', err);
      return this.getRealtimeVehicles('215q', '640');
    }
  }

  /**
   * Get citywide bus stops across main corridors and neighborhoods for map exploration
   */
  async getCitywideStops(): Promise<StopInfo[]> {
    const cacheKey = 'stops:citywide';
    const cached = this.getCached<StopInfo[]>(cacheKey);
    if (cached) return cached;

    const keyRoutesForStops = [
      { id: '215q', code: '640' },
      { id: '212s', code: '300' },
      { id: '214c', code: '448' },
      { id: '2153', code: '560' },
      { id: '27mo', code: '357' },
      { id: '213t', code: '409' },
      { id: '2141', code: '422' },
      { id: '211r', code: '120' },
      { id: '2121', code: '126' },
      { id: 'b8eu', code: '600' },
      { id: '215s', code: '650' },
      { id: '215u', code: '652' },
      { id: 'aal5', code: '678' },
      { id: '20vd', code: '001' },
      { id: '20ve', code: '002' },
      { id: '20vg', code: '004' },
      { id: 'b8eo', code: '010' },
      { id: '215h', code: '616' },
      { id: '2120', code: '125' },
      { id: '212m', code: '219' },
      { id: '2127', code: '203' }
    ];

    try {
      const results = await Promise.allSettled(
        keyRoutesForStops.map(r => this.getRouteItinerary(r.id))
      );

      const stopMap = new Map<number, StopInfo>();
      const stopLinesMap = new Map<number, Set<string>>();

      for (let i = 0; i < results.length; i++) {
        const res = results[i];
        const routeCode = keyRoutesForStops[i].code;

        if (res.status === 'fulfilled' && Array.isArray(res.value)) {
          for (const trip of res.value) {
            for (const s of trip.stops) {
              if (!stopLinesMap.has(s.stopId)) {
                stopLinesMap.set(s.stopId, new Set<string>());
              }
              stopLinesMap.get(s.stopId)!.add(routeCode);
              if (Array.isArray(s.lines)) {
                s.lines.forEach(l => stopLinesMap.get(s.stopId)!.add(l));
              }

              if (!stopMap.has(s.stopId)) {
                stopMap.set(s.stopId, { ...s });
              }
            }
          }
        }
      }

      // Assign authentic passing lines to each stop
      for (const [stopId, stop] of stopMap.entries()) {
        const linesList = Array.from(stopLinesMap.get(stopId) || []);
        stop.lines = linesList;
      }

      const stops = Array.from(stopMap.values());
      this.setCache(cacheKey, stops, 24 * 60 * 60 * 1000);
      return stops;
    } catch (err) {
      console.error('[SinetramClient] Error getting citywide stops:', err);
      return [];
    }
  }

  /**
   * Fetch timetable schedules for a route
   */
  async getSchedule(routeId: string): Promise<TimetableService[]> {
    const cacheKey = `schedule:${routeId}`;
    const cached = this.getCached<TimetableService[]>(cacheKey);
    if (cached) return cached;

    try {
      const resp = await fetch(`${this.baseUrl}/web/timetable/${this.project}/${routeId}`, {
        signal: AbortSignal.timeout(10000), headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json() as any;
      const rawServices = data.services || [];

      const services: TimetableService[] = rawServices.map((s: any) => ({
        serviceId: String(s.serviceId || ''),
        serviceName: String(s.serviceName || 'Dias Úteis'),
        directions: (s.directions || []).map((d: any) => ({
          direction: String(d.direction || 'Principal'),
          departures: (d.departures || []).map((dep: any) => ({
            time: String(dep.time || ''),
            accessible: Boolean(dep.accessible),
            tripId: Number(dep.tripId || 0)
          }))
        }))
      }));

      this.setCache(cacheKey, services, 12 * 60 * 60 * 1000);
      return services;
    } catch (err) {
      console.error(`[SinetramClient] Error fetching schedule for ${routeId}:`, err);
      return [];
    }
  }

  private getFallbackLines(): RouteSummary[] {
    return MANAUS_OFFICIAL_CATALOG.map(line => ({ ...line }));
  }
}

export const sinetram = new SinetramClient();
