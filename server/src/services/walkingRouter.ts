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
    const endpoints = [
      process.env.WALKING_ROUTER_URL,
      `https://router.project-osrm.org/route/v1/walking/${points}?overview=full&geometries=geojson&steps=false`,
      `https://routing.openstreetmap.de/routed-foot/route/v1/foot/${points}?overview=full&geometries=geojson&steps=false`
    ].filter(Boolean) as string[];

    for (const url of endpoints) {
      if (route) break;
      try {
        const fullUrl = url.includes('{points}') ? url.replace('{points}', points) : (url.includes(points) ? url : `${url}/${points}?overview=full&geometries=geojson&steps=false`);
        const response = await fetch(fullUrl, {
          signal: AbortSignal.timeout(2500),
          headers: { 'User-Agent': 'ManausLiveTransit/2.0 (OpenStreetMap Pedestrian)', Accept: 'application/json' }
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
          Number.isFinite(candidate.duration)
        ) {
          const distanceMeters = Math.round(candidate.distance);
          route = {
            coordinates,
            distanceMeters,
            durationMinutes: distanceMeters <= 20 ? 0 : Math.max(1, Math.round(distanceMeters / 83))
          };
          break;
        }
      } catch {
        // Tenta o próximo endpoint
      }
    }
    inFlight.delete(points);

    if (cache.size > 500) cache.clear();
    cache.set(points, { route, expires: Date.now() + (route ? 600000 : 30000) });
    return route;
  })();

  inFlight.set(points, fetchPromise);
  return fetchPromise;
}
