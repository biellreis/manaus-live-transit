import { useState, useEffect, useMemo } from 'react';
import type { LiveBus, StopInfo, PlannedTrip, TripDetail } from '../types/transit.js';

export interface ApproachingBusInfo {
  busId: string;
  minutes: number;
  timeStr: string;
  distanceMeters: number;
  speedKmh?: number;
  isLead: boolean;
}

export interface RealtimeEtaResult {
  status: 'approaching' | 'at_stop' | 'passed_has_next' | 'passed_no_next' | 'no_buses';
  primaryBus: LiveBus | null;
  etaMinutes: number | null;
  etaTime: string | null;
  destEtaMinutes: number | null;
  destEtaTime: string | null;
  upcomingBuses: { time: string; minutes: number; busId: string }[];
  busesBehindCount: number;
  passedBusesCount: number;
  totalActiveBuses: number;
  distanceToBoardingMeters: number | null;
  noticeMessage?: string;
  isRealtime: boolean;
}

/**
 * Calculates Euclidean/equirectangular distance in meters between two lat/lng points
 */
export function distanceMeters(
  p1: { lat: number; lng: number },
  p2: { lat: number; lng: number }
): number {
  const dLat = (p2.lat - p1.lat) * 111139;
  const midLat = ((p1.lat + p2.lat) / 2) * (Math.PI / 180);
  const dLng = (p2.lng - p1.lng) * 111139 * Math.cos(midLat);
  return Math.hypot(dLat, dLng);
}

/**
 * Projects a point P onto segment AB, returning the progress fraction t [0, 1],
 * the projected coordinates, and the distance in meters from P to the segment.
 */
export function projectOnSegment(
  p: { lat: number; lng: number },
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): { fraction: number; projLat: number; projLng: number; distMeters: number } {
  const midLat = ((a.lat + b.lat) / 2) * (Math.PI / 180);
  const dx = (b.lng - a.lng) * 111139 * Math.cos(midLat);
  const dy = (b.lat - a.lat) * 111139;
  const segLenSq = dx * dx + dy * dy;

  if (segLenSq < 1) {
    const d = distanceMeters(p, a);
    return { fraction: 0, projLat: a.lat, projLng: a.lng, distMeters: d };
  }

  const px = (p.lng - a.lng) * 111139 * Math.cos(midLat);
  const py = (p.lat - a.lat) * 111139;
  const t = Math.max(0, Math.min(1, (px * dx + py * dy) / segLenSq));
  const projLat = a.lat + t * (b.lat - a.lat);
  const projLng = a.lng + t * (b.lng - a.lng);

  return {
    fraction: t,
    projLat,
    projLng,
    distMeters: distanceMeters(p, { lat: projLat, lng: projLng })
  };
}

/**
 * Formats a Date object in Manaus local time (America/Manaus, UTC-4) as HH:mm
 */
export function formatManausTime(date: Date): string {
  try {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'America/Manaus'
    });
  } catch {
    const hours = String(date.getHours()).padStart(2, '0');
    const mins = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${mins}`;
  }
}

/**
 * Evaluates live vehicle positions against the active route stops and boarding stop.
 * Accurately determines which buses are approaching, which have already passed,
 * and dynamically calculates ETA minutes and passage times.
 */
export function calculateLiveTripEta(
  stops: StopInfo[],
  boardStop: StopInfo | null,
  vehicles: LiveBus[],
  nowMs: number,
  transitDurationMinutes: number = 24,
  directionType?: 'ida' | 'volta' | 'circular' | 'auxiliar'
): RealtimeEtaResult {
  if (!boardStop || !stops || stops.length === 0) {
    return {
      status: 'no_buses',
      primaryBus: null,
      etaMinutes: null,
      etaTime: null,
      destEtaMinutes: null,
      destEtaTime: null,
      upcomingBuses: [],
      busesBehindCount: 0,
      passedBusesCount: 0,
      totalActiveBuses: vehicles.length,
      distanceToBoardingMeters: null,
      isRealtime: false
    };
  }

  // 1. Find boarding stop index along the route
  let boardIdx = stops.findIndex(s => s.stopId === boardStop.stopId);
  if (boardIdx === -1) {
    let minD = Infinity;
    for (let i = 0; i < stops.length; i++) {
      const d = Math.hypot(stops[i].lat - boardStop.lat, stops[i].lng - boardStop.lng);
      if (d < minD) {
        minD = d;
        boardIdx = i;
      }
    }
  }

  // Filter vehicles by direction if available
  const activeDirection = directionType === 'volta' ? 'volta' : 'ida';
  const relevantVehicles = vehicles.filter(v => {
    if (!v.lat || !v.lng || v.lat === 0 || v.lng === 0) return false;
    if (v.direction && v.direction !== 'desconhecido' && directionType && directionType !== 'circular') {
      return v.direction === activeDirection;
    }
    return true;
  });

  if (relevantVehicles.length === 0) {
    return {
      status: 'no_buses',
      primaryBus: null,
      etaMinutes: null,
      etaTime: null,
      destEtaMinutes: transitDurationMinutes,
      destEtaTime: formatManausTime(new Date(nowMs + transitDurationMinutes * 60000)),
      upcomingBuses: [],
      busesBehindCount: 0,
      passedBusesCount: 0,
      totalActiveBuses: 0,
      distanceToBoardingMeters: null,
      isRealtime: false
    };
  }

  // Precompute segment distances along route
  const segDistances: number[] = [];
  for (let i = 0; i < stops.length - 1; i++) {
    segDistances.push(distanceMeters(stops[i], stops[i + 1]));
  }

  const approaching: {
    bus: LiveBus;
    minutes: number;
    timeStr: string;
    distanceMeters: number;
  }[] = [];

  let passedCount = 0;

  for (const bus of relevantVehicles) {
    const directDistToBoard = distanceMeters(bus, boardStop);

    // Find best matching segment along the trip
    let bestSegIdx = -1;
    let bestProjDist = Infinity;
    let bestFraction = 0;

    for (let i = 0; i < stops.length - 1; i++) {
      const proj = projectOnSegment(bus, stops[i], stops[i + 1]);
      if (proj.distMeters < bestProjDist) {
        bestProjDist = proj.distMeters;
        bestSegIdx = i;
        bestFraction = proj.fraction;
      }
    }

    // If bus is too far from the corridor (> 600m), skip it
    if (bestProjDist > 600 && directDistToBoard > 600) {
      continue;
    }

    // Determine if bus is strictly before or has passed the boarding stop
    let hasPassed = false;
    let distRemaining = 0;

    if (bestSegIdx !== -1) {
      if (bestSegIdx < boardIdx - 1) {
        // Bus is on an earlier segment approaching the stop
        const remainingOnCurrentSeg = (1 - bestFraction) * segDistances[bestSegIdx];
        let remainingIntermediary = 0;
        for (let k = bestSegIdx + 1; k < boardIdx; k++) {
          remainingIntermediary += segDistances[k];
        }
        distRemaining = Math.round(remainingOnCurrentSeg + remainingIntermediary);
      } else if (bestSegIdx === boardIdx - 1) {
        // Bus is on the segment immediately arriving at boardStop
        distRemaining = Math.round((1 - bestFraction) * segDistances[bestSegIdx]);
        // If within 40m, consider arrived at stop
        if (distRemaining <= 40) {
          distRemaining = 0;
        }
      } else {
        // bestSegIdx >= boardIdx: The bus is on a segment AFTER the boarding stop!
        // It has passed the stop and is moving away from it.
        hasPassed = true;
      }
    } else {
      // Fallback if less than 2 stops
      if (directDistToBoard <= 50) {
        distRemaining = 0;
      } else {
        distRemaining = Math.round(directDistToBoard);
      }
    }

    // Check if the bus has already passed
    if (hasPassed) {
      passedCount++;
      continue;
    }

    // Calculate dynamic ETA minutes based on commercial transit speed
    // Manaus transit corridors average ~19-22 km/h (315-365 m/min)
    const effectiveSpeedKmh = Math.min(
      45,
      Math.max(14, bus.speedKmh && bus.speedKmh >= 10 ? bus.speedKmh * 0.35 + 20 * 0.65 : 20)
    );
    const speedMpm = (effectiveSpeedKmh * 1000) / 60;

    let minutes = 0;
    if (distRemaining > 45) {
      minutes = Math.max(1, Math.round(distRemaining / speedMpm));
    }

    const arrivalDate = new Date(nowMs + minutes * 60000);

    approaching.push({
      bus,
      minutes,
      timeStr: formatManausTime(arrivalDate),
      distanceMeters: distRemaining
    });
  }

  // Sort approaching buses: nearest to boarding stop first
  approaching.sort((a, b) => a.distanceMeters - b.distanceMeters);

  if (approaching.length > 0) {
    const lead = approaching[0];
    const isAtStop = lead.distanceMeters <= 50 || lead.minutes <= 0;
    const etaMinutes = isAtStop ? 0 : lead.minutes;
    const destArrivalDate = new Date(nowMs + (etaMinutes + transitDurationMinutes) * 60000);

    const upcoming = approaching.slice(1).map(item => ({
      busId: item.bus.id,
      time: item.timeStr,
      minutes: item.minutes
    }));

    const status = isAtStop
      ? 'at_stop'
      : (passedCount > 0 ? 'passed_has_next' : 'approaching');

    const notice = passedCount > 0
      ? 'Ônibus anterior já passou • Acompanhando próximo veículo'
      : undefined;

    return {
      status,
      primaryBus: lead.bus,
      etaMinutes,
      etaTime: lead.timeStr,
      destEtaMinutes: etaMinutes + transitDurationMinutes,
      destEtaTime: formatManausTime(destArrivalDate),
      upcomingBuses: upcoming,
      busesBehindCount: upcoming.length,
      passedBusesCount: passedCount,
      totalActiveBuses: relevantVehicles.length,
      distanceToBoardingMeters: lead.distanceMeters,
      noticeMessage: notice,
      isRealtime: true
    };
  }

  // All active buses on the line have already passed the boarding stop!
  if (passedCount > 0) {
    return {
      status: 'passed_no_next',
      primaryBus: null,
      etaMinutes: null,
      etaTime: null,
      destEtaMinutes: null,
      destEtaTime: null,
      upcomingBuses: [],
      busesBehindCount: 0,
      passedBusesCount: passedCount,
      totalActiveBuses: relevantVehicles.length,
      distanceToBoardingMeters: null,
      noticeMessage: 'O ônibus desta linha já passou por esta parada e não há outro veículo próximo se aproximando no momento.',
      isRealtime: true
    };
  }

  return {
    status: 'no_buses',
    primaryBus: null,
    etaMinutes: null,
    etaTime: null,
    destEtaMinutes: transitDurationMinutes,
    destEtaTime: formatManausTime(new Date(nowMs + transitDurationMinutes * 60000)),
    upcomingBuses: [],
    busesBehindCount: 0,
    passedBusesCount: 0,
    totalActiveBuses: relevantVehicles.length,
    distanceToBoardingMeters: null,
    isRealtime: true
  };
}

/**
 * React hook that connects live telemetry with a high-resolution clock ticker,
 * continuously recalculating the dynamic ETA in real-time.
 */
export function useRealtimeTripEta(
  activeTrip: TripDetail | null,
  boardStop: StopInfo | null,
  vehicles: LiveBus[],
  plannedTrip?: PlannedTrip | null
): RealtimeEtaResult {
  // Live clock tick every 2.5 seconds to smoothly update passage times and countdowns
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return useMemo(() => {
    const stops = activeTrip?.stops || plannedTrip?.legs[0]?.trip?.stops || [];
    const targetBoardStop = boardStop || plannedTrip?.originStop || null;
    const transitDuration = plannedTrip?.transitMinutes || plannedTrip?.totalMinutes || 24;
    const direction = activeTrip?.directionType;

    const computed = calculateLiveTripEta(
      stops,
      targetBoardStop,
      vehicles,
      now,
      transitDuration,
      direction
    );

    // If live calculation yields no buses but plannedTrip had a recent estimate,
    // fallback gracefully to plannedTrip values if still within valid window
    if (computed.status === 'no_buses' && plannedTrip?.etaMinutes) {
      return {
        ...computed,
        etaMinutes: plannedTrip.etaMinutes,
        etaTime: plannedTrip.etaTime || computed.etaTime,
        destEtaMinutes: plannedTrip.destEtaMinutes || computed.destEtaMinutes,
        destEtaTime: plannedTrip.destEtaTime || computed.destEtaTime
      };
    }

    return computed;
  }, [activeTrip, boardStop, vehicles, plannedTrip, now]);
}
