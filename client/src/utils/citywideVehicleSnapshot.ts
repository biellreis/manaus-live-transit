import type { LiveBus } from '../types/transit.js';

interface CitywideVehicleSnapshot {
  vehicles: LiveBus[];
  failedRouteIds?: string[];
}

const RECENT_VEHICLE_MS = 60_000;

export function retainRecentCitywideVehicles(previous: LiveBus[], now = Date.now()): LiveBus[] {
  return previous.filter(bus =>
    Number.isFinite(bus.timestamp) &&
    now - bus.timestamp >= -120_000 &&
    now - bus.timestamp <= RECENT_VEHICLE_MS
  );
}

export function mergeCitywideVehicleSnapshot(
  previous: LiveBus[],
  incoming: CitywideVehicleSnapshot,
  now = Date.now()
): LiveBus[] {
  const failedRoutes = new Set(incoming.failedRouteIds || []);
  const seen = new Set(incoming.vehicles.map(bus => bus.id));
  const retained = retainRecentCitywideVehicles(previous, now)
    .filter(bus => failedRoutes.has(bus.routeId || '') && !seen.has(bus.id));
  return [...incoming.vehicles, ...retained];
}
