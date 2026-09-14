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
  const fromIdx = trip.stops.findIndex(s => s.stopId === board.stopId && s.sequence === board.sequence);
  const toIdx = trip.stops.findIndex(s => s.stopId === alight.stopId && s.sequence === alight.sequence);
  const slicedStops = fromIdx !== -1 && toIdx !== -1 && toIdx >= fromIdx 
    ? trip.stops.slice(fromIdx, toIdx + 1) 
    : trip.stops;

  const stopCoords: [number, number][] = slicedStops.map(s => [s.lng, s.lat]);

  if (!trip.coordinates || trip.coordinates.length < 2) {
    return stopCoords.length >= 2 ? stopCoords : [];
  }

  // Find closest point in shape polyline for board stop
  let bestBoardIdx = 0;
  let bestBoardDist = Infinity;
  for (let i = 0; i < trip.coordinates.length; i++) {
    const [lng, lat] = trip.coordinates[i];
    const dist = distanceMeters(board, { lat, lng });
    if (dist < bestBoardDist) {
      bestBoardDist = dist;
      bestBoardIdx = i;
    }
  }

  // Find closest point in shape polyline for alight stop occurring at or after bestBoardIdx
  let bestAlightIdx = bestBoardIdx;
  let bestAlightDist = Infinity;
  for (let i = bestBoardIdx; i < trip.coordinates.length; i++) {
    const [lng, lat] = trip.coordinates[i];
    const dist = distanceMeters(alight, { lat, lng });
    if (dist < bestAlightDist) {
      bestAlightDist = dist;
      bestAlightIdx = i;
    }
  }

  if (bestAlightIdx > bestBoardIdx) {
    const slicedShape = trip.coordinates.slice(bestBoardIdx, bestAlightIdx + 1);
    if (slicedShape.length >= 2) return slicedShape;
  }

  return stopCoords.length >= 2 ? stopCoords : trip.coordinates;
}
