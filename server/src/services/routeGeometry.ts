import type { StopInfo, TripDetail } from './sinetramClient.js';

export function distanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const r = Math.PI / 180;
  const h = Math.sin((b.lat - a.lat) * r / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin((b.lng - a.lng) * r / 2) ** 2;
  return Math.round(12742000 * Math.asin(Math.sqrt(Math.min(1, h))));
}

/**
 * Robustly slices trip coordinates between boarding and alighting stops.
 * Fallback to stop coordinates if shape polyline slicing fails or is unavailable.
 */
export function sliceTripCoordinates(trip: TripDetail, board: StopInfo, alight: StopInfo): [number, number][] {
  if (!trip.coordinates || trip.coordinates.length < 2) {
    return [];
  }

  const fromIdx = trip.stops.findIndex(s => s.stopId === board.stopId && s.sequence === board.sequence);
  const toIdx = trip.stops.findIndex(s => s.stopId === alight.stopId && s.sequence === alight.sequence);

  if (fromIdx === -1 || toIdx === -1 || toIdx < fromIdx) {
    return [];
  }

  // Monotonically match stops to shape coordinates to handle loops and repeated stop IDs
  let currShapeIdx = 0;
  let boardShapeIdx = 0;

  for (let k = 0; k <= toIdx; k++) {
    const s = trip.stops[k];
    let bestIdx = currShapeIdx;
    let bestDist = Infinity;

    for (let i = currShapeIdx; i < trip.coordinates.length; i++) {
      const [lng, lat] = trip.coordinates[i];
      const dist = distanceMeters(s, { lat, lng });
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    }

    currShapeIdx = bestIdx;
    if (k === fromIdx) {
      boardShapeIdx = bestIdx;
    }
  }

  const alightShapeIdx = currShapeIdx;

  if (alightShapeIdx >= boardShapeIdx) {
    const sliced = trip.coordinates.slice(boardShapeIdx, alightShapeIdx + 1);
    if (sliced.length >= 2) {
      return sliced;
    }
  }

  return [];
}
