export interface WalkingRoute {
  coordinates: [number, number][];
  distanceMeters: number;
  durationMinutes: number;
}
// Service to fetch real pedestrian polyline following OpenStreetMap street network in parallel
const cache = new Map<string, { route: WalkingRoute | null; expires: number }>();
const inFlight = new Map<string, Promise<WalkingRoute | null>>();

export async function getStreetWalkingPolyline(fromLng: number, fromLat: number, toLng: number, toLat: number): Promise<WalkingRoute | null> {
  const points = `${fromLng.toFixed(5)},${fromLat.toFixed(5)};${toLng.toFixed(5)},${toLat.toFixed(5)}`;
  const stored = cache.get(points);
  if (stored && stored.expires > Date.now()) return stored.route;

  if (inFlight.has(points)) return inFlight.get(points)!;

  const fetchPromise = (async () => {
    let route: WalkingRoute | null = null;
    try {
      const base = process.env.WALKING_ROUTER_URL || 'https://routing.openstreetmap.de/routed-foot/route/v1/foot';
      const response = await fetch(`${base}/${points}?overview=full&geometries=geojson&steps=false`, {
        signal: AbortSignal.timeout(600),
        headers: { 'User-Agent': 'ManoTransit/1.0 (local development)', Accept: 'application/json' }
      });
      const data = response.ok ? ((await response.json()) as any) : null;
      const candidate = data?.routes?.[0];
      const coordinates = candidate?.geometry?.coordinates;
      if (
        data?.code === 'Ok' &&
        Array.isArray(coordinates) &&
        coordinates.length >= 2 &&
        coordinates.every((c: unknown) => Array.isArray(c) && c.length === 2 && c.every(Number.isFinite)) &&
        Number.isFinite(candidate.distance) &&
        Number.isFinite(candidate.duration) &&
        data.waypoints?.length === 2 &&
        data.waypoints.every((w: any) => Number.isFinite(w.distance) && w.distance <= 300)
      ) {
        route = {
          coordinates,
          distanceMeters: Math.round(candidate.distance),
          durationMinutes: Math.max(1, Math.ceil(candidate.duration / 60))
        };
      }
    } catch {
      /* Fallback handled by caller */
    } finally {
      inFlight.delete(points);
    }

    if (cache.size > 500) cache.clear();
    cache.set(points, { route, expires: Date.now() + (route ? 600000 : 30000) });
    return route;
  })();

  inFlight.set(points, fetchPromise);
  return fetchPromise;
}
