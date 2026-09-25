export interface WalkingGeometryResult {
  coordinates: [number, number][];
  distanceMeters: number;
  durationMinutes: number;
}

const memoryCache = new Map<string, { data: WalkingGeometryResult; expiresAt: number }>();

export async function resolveStreetWalkingPath(
  fromLng: number,
  fromLat: number,
  toLng: number,
  toLat: number
): Promise<WalkingGeometryResult | null> {
  const points = `${fromLng.toFixed(5)},${fromLat.toFixed(5)};${toLng.toFixed(5)},${toLat.toFixed(5)}`;
  const cached = memoryCache.get(points);
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  const endpoints = [
    `https://router.project-osrm.org/route/v1/walking/${points}?overview=full&geometries=geojson&steps=false`,
    `https://routing.openstreetmap.de/routed-foot/route/v1/foot/${points}?overview=full&geometries=geojson&steps=false`
  ];

  for (const url of endpoints) {
    try {
      const resp = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(3000)
      });
      if (resp.ok) {
        const data = await resp.json() as any;
        const candidate = data?.routes?.[0];
        const coords = candidate?.geometry?.coordinates;
        if (Array.isArray(coords) && coords.length >= 2) {
          const distanceMeters = Math.round(candidate.distance || 0);
          const result: WalkingGeometryResult = {
            coordinates: coords,
            distanceMeters,
            durationMinutes: distanceMeters <= 20 ? 0 : Math.max(1, Math.round(distanceMeters / 83))
          };
          memoryCache.set(points, { data: result, expiresAt: Date.now() + 600000 });
          return result;
        }
      }
    } catch {
      // Continua para o próximo endpoint
    }
  }

  return null;
}
