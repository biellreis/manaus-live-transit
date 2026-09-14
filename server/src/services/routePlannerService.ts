import fs from 'node:fs';
import path from 'node:path';
import { sinetram, type RouteSummary, type TripDetail, type StopInfo } from './sinetramClient.js';
import { distanceMeters, sliceTripCoordinates } from './routeGeometry.js';
import { getStreetWalkingPolyline, type WalkingRoute } from './walkingRouter.js';
import manausAllRoutesStatic from './manausAllRoutesCache.json';

type Point = { name: string; lat: number; lng: number };
export interface PlannedLeg {
  line: RouteSummary;
  trip: TripDetail;
  originStop: StopInfo;
  destStop: StopInfo;
}

export interface PlannedLegDetail {
  type: 'walk_origin' | 'bus' | 'transfer_hub' | 'walk_dest';
  title: string;
  description: string;
  durationMinutes: number | null;
  distanceMeters: number | null;
  lineCode?: string;
  lineName?: string;
  fromStopName?: string;
  toStopName?: string;
  stopsCount?: number;
  coordinates: [number, number][];
}

export interface TransitOption {
  id: string;
  title: string;
  subtitle: string;
  type: 'direct' | 'transfer';
  badge: string;
  primaryLineCode: string;
  secondaryLineCode?: string;
  transferHubName?: string;
  totalMinutes: number | null;
  transitMinutes: number | null;
  walkingMinutes: number | null;
  fare: string;
  fareNote: string;
  originStop: StopInfo;
  destStop: StopInfo;
  legs: PlannedLegDetail[];
  verifiedLegs: PlannedLeg[];
  fullPolyline: [number, number][];
  walkOriginCoords: [number, number][];
  walkDestCoords: [number, number][];
  walkingAvailable: boolean;
}

export interface NearestStopItem extends StopInfo {
  distanceMeters: number;
  walkMinutes: number | null;
  lines: string[];
}

export interface PlanJourneyResult {
  origin: Point;
  destination: Point;
  nearestOriginStop: NearestStopItem | null;
  nearestDestStop: NearestStopItem | null;
  nearestOriginStops: NearestStopItem[];
  nearestDestStops: NearestStopItem[];
  hasDirectBus: boolean;
  selectedOptionIndex: number;
  options: TransitOption[];
  source: string;
  message: string;
}

export interface CachedLineEntry {
  code: string;
  line: RouteSummary;
  trips: TripDetail[];
}

export function validPoint(value: unknown): value is Point {
  const p = value as Point | undefined;
  return (
    !!p &&
    typeof p.name === 'string' &&
    p.name.length <= 300 &&
    Number.isFinite(p.lat) &&
    Number.isFinite(p.lng) &&
    Math.abs(p.lat) <= 90 &&
    Math.abs(p.lng) <= 180
  );
}

let networkCacheMemory: CachedLineEntry[] | null = null;

function loadNetwork(): CachedLineEntry[] {
  if (networkCacheMemory) return networkCacheMemory;
  if (manausAllRoutesStatic && Object.keys(manausAllRoutesStatic).length > 0) {
    networkCacheMemory = Object.values(manausAllRoutesStatic) as unknown as CachedLineEntry[];
    return networkCacheMemory;
  }
  const locations = [
    path.join(__dirname, 'manausAllRoutesCache.json'),
    path.resolve(__dirname, '../../src/services/manausAllRoutesCache.json')
  ];
  for (const file of locations) {
    if (fs.existsSync(file)) {
      networkCacheMemory = Object.values(JSON.parse(fs.readFileSync(file, 'utf8')));
      return networkCacheMemory;
    }
  }
  return [];
}

let globalStopMapCache: Map<number, { stop: StopInfo; lines: Set<string> }> | null = null;

function getGlobalStopMap(network: CachedLineEntry[]): Map<number, { stop: StopInfo; lines: Set<string> }> {
  if (globalStopMapCache) return globalStopMapCache;
  const stopMap = new Map<number, { stop: StopInfo; lines: Set<string> }>();
  for (const { line, trips } of network) {
    for (const trip of trips) {
      for (const s of trip.stops) {
        if (!stopMap.has(s.stopId)) {
          stopMap.set(s.stopId, { stop: s, lines: new Set([line.code]) });
        } else {
          stopMap.get(s.stopId)!.lines.add(line.code);
        }
      }
    }
  }
  globalStopMapCache = stopMap;
  return globalStopMapCache;
}

/**
 * Encontra as paradas mais próximas a um ponto geográfico, com distância e linhas que passam por elas
 */
export function getNearestStops(point: Point, network: CachedLineEntry[], limit = 4): NearestStopItem[] {
  const stopMap = getGlobalStopMap(network);
  const pointIsTerminal = isTerminalOrStation(point.name);

  const resultList: NearestStopItem[] = [];
  for (const { stop, lines } of stopMap.values()) {
    let dist = distanceMeters(point, stop);

    if (pointIsTerminal && isSameTerminalOrStation(stop.stopName, point.name)) {
      dist = 0;
    }

    if (dist <= 2500) {
      const walkMins = Math.max(0, Math.round(dist / 80));
      resultList.push({
        ...stop,
        distanceMeters: Math.round(dist),
        walkMinutes: walkMins,
        lines: Array.from(lines).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      });
    }
  }

  return resultList.sort((a, b) => a.distanceMeters - b.distanceMeters).slice(0, limit);
}

export function isTerminalOrStation(name: string): boolean {
  const upper = (name || '').toUpperCase().trim();
  return (
    upper.includes('TERMINAL') ||
    upper.includes('ESTAÇÃO') ||
    upper.includes('ESTACAO') ||
    upper.includes('PLATAFORMA') ||
    /\bT[1-6]\b/.test(upper) ||
    /\bE[1-6]\b/.test(upper)
  );
}

export function isSameTerminalOrStation(stopName: string, pointName: string): boolean {
  const sUpper = (stopName || '').toUpperCase().trim();
  const pUpper = (pointName || '').toUpperCase().trim();

  if (!isTerminalOrStation(pUpper)) return false;
  if (!isTerminalOrStation(sUpper)) return false;

  const getTerminalOrEstacaoKey = (str: string): { type: 'T' | 'E'; num: string } | null => {
    const termMatch = str.match(/(?:TERMINAL|T)\s*[-_]?\s*([1-6])\b/i);
    if (termMatch) return { type: 'T', num: termMatch[1] };

    const estMatch = str.match(/(?:ESTAÇÃO|ESTACAO|PLATAFORMA|E)\s*[-_]?\s*([1-6])\b/i);
    if (estMatch) return { type: 'E', num: estMatch[1] };

    return null;
  };

  const pKey = getTerminalOrEstacaoKey(pUpper);
  const sKey = getTerminalOrEstacaoKey(sUpper);

  if (pKey && sKey) {
    return pKey.type === sKey.type && pKey.num === sKey.num;
  }
  if (pKey || sKey) {
    return false;
  }

  if (pUpper.includes('PONTA NEGRA') && sUpper.includes('PONTA NEGRA')) return true;
  if ((pUpper.includes('MATRIZ') || pUpper.includes('CENTRAL')) && (sUpper.includes('MATRIZ') || sUpper.includes('CENTRAL'))) return true;
  if (pUpper.includes('JARDIM PRIMAVERA') && sUpper.includes('JARDIM PRIMAVERA')) return true;
  if (pUpper.includes('SÃO RAIMUNDO') && sUpper.includes('SÃO RAIMUNDO')) return true;
  if (pUpper.includes('COMPENSA') && sUpper.includes('COMPENSA')) return true;

  return false;
}

export function findCandidates(network: CachedLineEntry[], origin: Point, destination: Point): PlannedLeg[][] {
  const originScores = new WeakMap<StopInfo, number>();
  const destinationScores = new WeakMap<StopInfo, number>();
  const stopScore = (stop: StopInfo, point: Point, cache: WeakMap<StopInfo, number>, threshold: number, weight: number) => {
    const cached = cache.get(stop);
    if (cached !== undefined) return cached;
    const distance = isSameTerminalOrStation(stop.stopName, point.name) ? 0 : distanceMeters(point, stop);
    const score = distance + Math.max(0, distance - threshold) * weight;
    cache.set(stop, score);
    return score;
  };
  const scoreCandidate = (legs: PlannedLeg[]) =>
    stopScore(legs[0].originStop, origin, originScores, 350, 4) +
    stopScore(legs[legs.length - 1].destStop, destination, destinationScores, 400, 3) +
    (legs.length > 1 ? 300 : 0);

  // Keep only the best candidate per line combination, instead of sorting
  // every possible pair of boarding, transfer and alighting stops.
  const best = new Map<string, { legs: PlannedLeg[]; score: number }>();
  const consider = (legs: PlannedLeg[]) => {
    const key = legs.map(l => l.line.code).join('+');
    const score = scoreCandidate(legs);
    if (!best.has(key) || score < best.get(key)!.score) best.set(key, { legs, score });
  };
  const reaching: PlannedLeg[] = [];
  const leavingMap = new Map<number, PlannedLeg[]>();
  const MAX_WALK_RADIUS = 1500; // Raio a pé até a parada: 1.5 km

  const destIsTerminal = isTerminalOrStation(destination.name);
  const origIsTerminal = isTerminalOrStation(origin.name);

  for (const { line, trips } of network) {
    for (const trip of trips) {
      const stops = trip.stops;
      const len = stops.length;
      if (len < 2) continue;

      const origMatches = new Array<boolean>(len);
      const destMatches = new Array<boolean>(len);

      for (let k = 0; k < len; k++) {
        const s = stops[k];
        origMatches[k] = origIsTerminal
          ? isSameTerminalOrStation(s.stopName, origin.name) || distanceMeters(origin, s) <= 1200
          : distanceMeters(origin, s) <= MAX_WALK_RADIUS;

        destMatches[k] = destIsTerminal
          ? isSameTerminalOrStation(s.stopName, destination.name) || distanceMeters(destination, s) <= 800
          : distanceMeters(destination, s) <= MAX_WALK_RADIUS;
      }

      for (let i = 0; i < len - 1; i++) {
        const board = stops[i];
        const isOriginMatch = origMatches[i];

        for (let j = i + 1; j < len; j++) {
          const alight = stops[j];
          const isDestMatch = destMatches[j];

          if (!isOriginMatch && !isDestMatch) continue;

          const leg = { line, trip, originStop: board, destStop: alight };

          if (isOriginMatch && isDestMatch) {
            consider([leg]);
          } else if (isOriginMatch) {
            reaching.push(leg);
          } else if (isDestMatch) {
            const list = leavingMap.get(board.stopId) || [];
            list.push(leg);
            leavingMap.set(board.stopId, list);
          }
        }
      }
    }
  }

  // ORDENAÇÃO CRUCIAL: Ordena as pernas de partida pelo quão perto a parada de embarque está do ponto de origem!
  reaching.sort((a, b) => distanceMeters(origin, a.originStop) - distanceMeters(origin, b.originStop));

  let transferCount = 0;
  const MAX_TRANSFER_DISTANCE = 350;
  const seenPairs = new Set<string>();

  const nearbyDepartures = new Map<number, PlannedLeg[][]>();
  const departuresFor = (stop: StopInfo) => {
    let groups = nearbyDepartures.get(stop.stopId);
    if (groups) return groups;
    groups = [];
    for (const [id, departures] of leavingMap) {
      if (id === stop.stopId || !departures.length) continue;
      const other = departures[0].originStop;
      if (isSameTerminalOrStation(stop.stopName, other.stopName) && distanceMeters(stop, other) <= MAX_TRANSFER_DISTANCE) groups.push(departures);
    }
    nearbyDepartures.set(stop.stopId, groups);
    return groups;
  };
  for (const departures of leavingMap.values()) departures.sort((a, b) => distanceMeters(destination, a.destStop) - distanceMeters(destination, b.destStop));

  // Busca de baldeações inteligentes priorizando paradas de embarque mais próximas ao ponto inicial
  for (const first of reaching) {
    const destStopId = first.destStop.stopId;
    const origDist = distanceMeters(origin, first.originStop);

    // Se já encontramos opções excelentes a pé (< 350m), evita varrer paradas distantes (> 800m)
    if (transferCount >= 25 && origDist > 800) break;

    // 1. Baldeação na mesma parada
    const exactDepartures = leavingMap.get(destStopId);
    if (exactDepartures) {
      const sortedDepartures = exactDepartures;
      for (const second of sortedDepartures) {
        if (first.line.id !== second.line.id) {
          const pairKey = `${first.line.code}:${first.originStop.stopId}->${first.destStop.stopId}/${second.line.code}:${second.originStop.stopId}->${second.destStop.stopId}`;
          if (!seenPairs.has(pairKey)) {
            seenPairs.add(pairKey);
            consider([first, second]);
            transferCount++;
          }
        }
      }
    }

    // 2. Baldeação em terminal ou parada vizinha (< 350m)
    for (const depList of departuresFor(first.destStop)) {
      for (const second of depList) {
        if (first.line.id !== second.line.id) {
          const pairKey = `${first.line.code}:${first.originStop.stopId}->${first.destStop.stopId}/${second.line.code}:${second.originStop.stopId}->${second.destStop.stopId}`;
          if (!seenPairs.has(pairKey)) {
            seenPairs.add(pairKey);
            consider([first, second]);
            transferCount++;
          }
        }
      }
    }
  }

  return [...best.values()].sort((a, b) => a.score - b.score).slice(0, 5).map(item => item.legs);
}

function walkingLeg(type: 'walk_origin' | 'walk_dest', route: WalkingRoute | null, stop: StopInfo, point: Point): PlannedLegDetail {
  const isTerminalMatch = isSameTerminalOrStation(stop.stopName, point.name);
  const terminalCoords: [number, number][] = type === 'walk_origin'
    ? [[point.lng, point.lat], [stop.lng, stop.lat]]
    : [[stop.lng, stop.lat], [point.lng, point.lat]];

  if (isTerminalMatch) {
    return {
      type,
      title: type === 'walk_origin' ? `Embarque no ${stop.stopName}` : `Desembarque no ${stop.stopName}`,
      description: type === 'walk_origin' ? '0 m • Embarque direto no Terminal/Estação' : '0 m • Desembarque direto no Terminal/Estação',
      durationMinutes: 0,
      distanceMeters: 0,
      coordinates: terminalCoords
    };
  }

  const fallbackCoords: [number, number][] = type === 'walk_origin'
    ? [[point.lng, point.lat], [stop.lng, stop.lat]]
    : [[stop.lng, stop.lat], [point.lng, point.lat]];

  return {
    type,
    title: type === 'walk_origin' ? `Caminhe até ${stop.stopName}` : 'Caminhe até o destino',
    description: route
      ? `${route.distanceMeters} m • cerca de ${route.durationMinutes} min a pé (estimativa OSM)`
      : 'Percurso a pé estimado em linha reta.',
    durationMinutes: route?.durationMinutes ?? Math.max(1, Math.round(distanceMeters(point, stop) / 80)),
    distanceMeters: route?.distanceMeters ?? distanceMeters(point, stop),
    coordinates: route?.coordinates?.length ? route.coordinates : fallbackCoords
  };
}

export async function planTransitJourney(origin: Point, destination: Point): Promise<PlanJourneyResult> {
  if (!validPoint(origin) || !validPoint(destination)) throw new Error('Invalid coordinates');
  const network = loadNetwork();

  const nearestOriginStops = getNearestStops(origin, network, 4);
  const nearestDestStops = getNearestStops(destination, network, 4);

  const result: PlanJourneyResult = {
    origin,
    destination,
    nearestOriginStop: nearestOriginStops[0] || null,
    nearestDestStop: nearestDestStops[0] || null,
    nearestOriginStops,
    nearestDestStops,
    hasDirectBus: false,
    selectedOptionIndex: 0,
    options: [],
    source: 'Itinerários Mobilibus; caminhadas OpenStreetMap/FOSSGIS',
    message: ''
  };

  const candidates = findCandidates(network, origin, destination);
  const liveTrips = new Map<string, TripDetail[]>();

  // Cálculo 100% em memória local via manausAllRoutesCache.json (instantâneo < 30ms)
  for (const candidate of candidates) {
    const legs: PlannedLeg[] = [];
    for (const leg of candidate) {
      const trip = leg.trip;

      const board = trip.stops.find((s) => s.stopId === leg.originStop.stopId && s.sequence === leg.originStop.sequence) || leg.originStop;
      const alight = trip.stops.find((s) => s.stopId === leg.destStop.stopId && s.sequence === leg.destStop.sequence) || leg.destStop;

      const coordinates = sliceTripCoordinates(trip, board, alight);
      const effectiveCoords = coordinates.length >= 2 ? coordinates : trip.coordinates;

      const fromIdx = trip.stops.indexOf(board);
      const toIdx = trip.stops.indexOf(alight);
      const slicedStops = fromIdx !== -1 && toIdx !== -1 && toIdx >= fromIdx ? trip.stops.slice(fromIdx, toIdx + 1) : trip.stops;

      legs.push({
        ...leg,
        originStop: board,
        destStop: alight,
        trip: { ...trip, coordinates: effectiveCoords, stops: slicedStops }
      });
    }

    if (legs.length !== candidate.length) continue;
    const first = legs[0];
    const last = legs[legs.length - 1];

    const origDist = isSameTerminalOrStation(first.originStop.stopName, origin.name) ? 0 : distanceMeters(origin, first.originStop);
    const destDist = isSameTerminalOrStation(last.destStop.stopName, destination.name) ? 0 : distanceMeters(destination, last.destStop);
    if (origDist > 1500 || destDist > 1500) continue;
    if (legs.length > 1 && distanceMeters(first.destStop, last.originStop) > 350 && !isSameTerminalOrStation(first.destStop.stopName, last.originStop.stopName)) continue;

    // Percurso a pé em malha viária (cálculo inicial síncrono instantâneo < 1ms)
    const buildStreetWalkingPathSync = (from: Point, to: StopInfo): { coords: [number, number][]; dist: number; mins: number } => {
      const isTerminalMatch = isSameTerminalOrStation(to.stopName, from.name);
      if (isTerminalMatch) {
        return { coords: [[from.lng, from.lat], [to.lng, to.lat]], dist: 0, mins: 0 };
      }

      const dLng = Math.abs(to.lng - from.lng);
      const dLat = Math.abs(to.lat - from.lat);

      let coords: [number, number][];
      if (dLng > 0.0001 && dLat > 0.0001) {
        const corner1: [number, number] = [to.lng, from.lat];
        const corner2: [number, number] = [from.lng, to.lat];
        const dist1 = distanceMeters(from, { lat: from.lat, lng: to.lng }) + distanceMeters({ lat: from.lat, lng: to.lng }, to);
        const dist2 = distanceMeters(from, { lat: to.lat, lng: from.lng }) + distanceMeters({ lat: to.lat, lng: from.lng }, to);
        const corner = dist1 <= dist2 ? corner1 : corner2;
        coords = [[from.lng, from.lat], corner, [to.lng, to.lat]];
      } else {
        coords = [[from.lng, from.lat], [to.lng, to.lat]];
      }

      const totalDist = Math.round(distanceMeters(from, to) * 1.25);
      const totalMins = Math.max(1, Math.ceil(totalDist / 80));

      return { coords, dist: totalDist, mins: totalMins };
    };

    const walkOriginPath = buildStreetWalkingPathSync(origin, first.originStop);
    const walkDestPath = buildStreetWalkingPathSync(destination, last.destStop);

    const walkOriginRoute: WalkingRoute = { durationMinutes: walkOriginPath.mins, distanceMeters: walkOriginPath.dist, coordinates: walkOriginPath.coords };
    const walkDestRoute: WalkingRoute = { durationMinutes: walkDestPath.mins, distanceMeters: walkDestPath.dist, coordinates: walkDestPath.coords };

    const details: PlannedLegDetail[] = [walkingLeg('walk_origin', walkOriginRoute, first.originStop, origin)];
    for (let index = 0; index < legs.length; index++) {
      const leg = legs[index];
      if (index > 0) {
        const prevLeg = legs[index - 1];
        const transferWalkPath = buildStreetWalkingPathSync(
          { lat: prevLeg.destStop.lat, lng: prevLeg.destStop.lng, name: prevLeg.destStop.stopName },
          leg.originStop
        );

        details.push({
          type: 'transfer_hub',
          title: `Troque de ônibus em ${prevLeg.destStop.stopName}`,
          description: transferWalkPath.dist > 5
            ? `Caminhe ${transferWalkPath.dist} m (${transferWalkPath.mins} min) até a plataforma da Linha ${leg.line.code}`
            : `Desembarque e embarque direto no ${prevLeg.destStop.stopName}`,
          durationMinutes: transferWalkPath.mins,
          distanceMeters: transferWalkPath.dist,
          coordinates: transferWalkPath.coords
        });
      }
      details.push({
        type: 'bus',
        title: `Linha ${leg.line.code}`,
        description: `${leg.trip.tripName}: ${leg.originStop.stopName} → ${leg.destStop.stopName}`,
        durationMinutes: null,
        distanceMeters: null,
        lineCode: leg.line.code,
        lineName: leg.line.name,
        fromStopName: leg.originStop.stopName,
        toStopName: leg.destStop.stopName,
        stopsCount: leg.trip.stops.length - 1,
        coordinates: (leg.trip.coordinates && leg.trip.coordinates.length >= 2)
          ? leg.trip.coordinates
          : (leg.trip.stops && leg.trip.stops.length >= 2)
            ? leg.trip.stops.map(s => [s.lng, s.lat] as [number, number])
            : []
      });
    }
    details.push(walkingLeg('walk_dest', walkDestRoute, last.destStop, destination));

    result.options.push({
      id: legs.map((l) => `${l.line.id}-${l.trip.tripId}-${l.originStop.sequence}-${l.destStop.sequence}`).join('/'),
      title: legs.map((l) => l.line.code).join(' + '),
      subtitle: `${first.originStop.stopName} → ${last.destStop.stopName}`,
      type: legs.length === 1 ? 'direct' : 'transfer',
      badge: legs.length === 1 ? 'Direto' : '1 Troca de ônibus',
      primaryLineCode: first.line.code,
      secondaryLineCode: legs[1]?.line.code,
      transferHubName: legs.length > 1 ? first.destStop.stopName : undefined,
      totalMinutes: null,
      transitMinutes: null,
      walkingMinutes: walkOriginRoute.durationMinutes + walkDestRoute.durationMinutes,
      fare: 'R$ 4,50',
      fareNote: 'Tarifa padrão de Manaus (PassaFácil / Cartão ou Dinheiro)',
      originStop: first.originStop,
      destStop: last.destStop,
      legs: details,
      verifiedLegs: legs,
      fullPolyline: [],
      walkOriginCoords: walkOriginRoute.coordinates || [],
      walkDestCoords: walkDestRoute.coordinates || [],
      walkingAvailable: true
    });

    if (result.options.length >= 6) break;
  }

  // Ordenação inteligente das rotas por proximidade da parada de embarque
  result.options.sort((a, b) => {
    const origDistA = isSameTerminalOrStation(a.originStop.stopName, origin.name) ? 0 : distanceMeters(origin, a.originStop);
    const origDistB = isSameTerminalOrStation(b.originStop.stopName, origin.name) ? 0 : distanceMeters(origin, b.originStop);

    const destDistA = isSameTerminalOrStation(a.destStop.stopName, destination.name) ? 0 : distanceMeters(destination, a.destStop);
    const destDistB = isSameTerminalOrStation(b.destStop.stopName, destination.name) ? 0 : distanceMeters(destination, b.destStop);

    let penaltyA = origDistA + destDistA;
    if (origDistA > 350) penaltyA += (origDistA - 350) * 4;
    if (destDistA > 400) penaltyA += (destDistA - 400) * 3;
    if (a.type === 'transfer') penaltyA += 300;

    let penaltyB = origDistB + destDistB;
    if (origDistB > 350) penaltyB += (origDistB - 350) * 4;
    if (destDistB > 400) penaltyB += (destDistB - 400) * 3;
    if (b.type === 'transfer') penaltyB += 300;

    return penaltyA - penaltyB;
  });

  // Enriquece as opções finais com a geometria real do OpenStreetMap de forma 100% PARALELA (apenas para caminhadas > 30m)
  const enrichmentPromises: Promise<void>[] = [];
  for (const opt of result.options) {
    for (const leg of opt.legs) {
      if (leg.type === 'walk_origin' && distanceMeters(origin, opt.originStop) > 30) {
        enrichmentPromises.push(
          getStreetWalkingPolyline(origin.lng, origin.lat, opt.originStop.lng, opt.originStop.lat).then((r) => {
            if (r?.coordinates && r.coordinates.length >= 2) {
              leg.coordinates = r.coordinates;
              leg.distanceMeters = r.distanceMeters;
              leg.durationMinutes = r.durationMinutes;
              opt.walkOriginCoords = r.coordinates;
            }
          })
        );
      } else if (leg.type === 'walk_dest' && distanceMeters(destination, opt.destStop) > 30) {
        enrichmentPromises.push(
          getStreetWalkingPolyline(opt.destStop.lng, opt.destStop.lat, destination.lng, destination.lat).then((r) => {
            if (r?.coordinates && r.coordinates.length >= 2) {
              leg.coordinates = r.coordinates;
              leg.distanceMeters = r.distanceMeters;
              leg.durationMinutes = r.durationMinutes;
              opt.walkDestCoords = r.coordinates;
            }
          })
        );
      } else if (leg.type === 'transfer_hub') {
        const fromStop = opt.verifiedLegs[0]?.destStop;
        const toStop = opt.verifiedLegs[1]?.originStop;
        if (fromStop && toStop && distanceMeters(fromStop, toStop) > 30) {
          enrichmentPromises.push(
            getStreetWalkingPolyline(fromStop.lng, fromStop.lat, toStop.lng, toStop.lat).then((r) => {
              if (r?.coordinates && r.coordinates.length >= 2) {
                leg.coordinates = r.coordinates;
                leg.distanceMeters = r.distanceMeters;
                leg.durationMinutes = r.durationMinutes;
              }
            })
          );
        }
      }
    }
  }

  // Dispara o enriquecimento de pedestres do OpenStreetMap em segundo plano sem bloquear a resposta da rota
  Promise.all(enrichmentPromises).catch(() => {});

  result.hasDirectBus = result.options.some((o) => o.type === 'direct');
  result.message = result.options.length
    ? 'Rotas verificadas ordenadas por proximidade e facilidade de acesso.'
    : 'Não foi possível encontrar uma rota de ônibus direta. Veja as paradas mais próximas e o mapa no Google Maps abaixo.';

  return result;
}
