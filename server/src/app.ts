import express, { Request, Response } from 'express';
import cors from 'cors';
import { sinetram } from './services/sinetramClient.js';
import { MANAUS_TRANSIT_HUBS } from './services/terminalsData.js';
import { searchPlacesInManaus, reverseGeocodeLocation } from './services/placesService.js';
import { planTransitJourney, validPoint } from './services/routePlannerService.js';
import { getLiveTrafficAlerts } from './services/trafficAlertsService.js';

const app = express();

app.use(cors());
app.use(express.json());

// Healthcheck
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString(), city: 'Manaus/AM' });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString(), city: 'Manaus/AM' });
});

/**
 * GET /api/lines
 */
app.get('/api/lines', async (req: Request, res: Response) => {
  try {
    let lines = await sinetram.getLines();
    const q = (req.query.q as string || '').toLowerCase().trim();
    const category = (req.query.category as string || '').toLowerCase().trim();
    const terminal = (req.query.terminal as string || '').toUpperCase().trim();

    if (q) {
      lines = lines.filter(l => l.code.toLowerCase().includes(q) || l.name.toLowerCase().includes(q));
    }

    if (category) {
      lines = lines.filter(l => l.category === category);
    }

    if (terminal) {
      lines = lines.filter(l => l.name.toUpperCase().includes(terminal));
    }

    res.json({ total: lines.length, lines });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch lines', details: err.message });
  }
});

/**
 * GET /api/lines/:routeId/itinerary
 */
app.get('/api/lines/:routeId/itinerary', async (req: Request, res: Response) => {
  try {
    const routeId = String(req.params.routeId);
    const trips = await sinetram.getRouteItinerary(routeId);
    res.json({ routeId, totalTrips: trips.length, trips });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch itinerary', details: err.message });
  }
});

/**
 * GET /api/lines/:routeId/schedule
 */
app.get('/api/lines/:routeId/schedule', async (req: Request, res: Response) => {
  try {
    const routeId = String(req.params.routeId);
    const services = await sinetram.getSchedule(routeId);
    res.json({ routeId, services });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch schedule', details: err.message });
  }
});

/**
 * GET /api/lines/:routeId/realtime
 */
app.get('/api/lines/:routeId/realtime', async (req: Request, res: Response) => {
  try {
    const routeId = String(req.params.routeId);
    const routeCode = (req.query.code as string) || '';
    const vehicles = await sinetram.getRealtimeVehicles(routeId, routeCode);
    res.json({ routeId, count: vehicles.length, vehicles });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch real-time vehicles', details: err.message });
  }
});

/**
 * GET /api/live/citywide
 */
app.get('/api/live/citywide', async (_req: Request, res: Response) => {
  try {
    const vehicles = await sinetram.getCitywideVehicles();
    res.json({ count: vehicles.length, vehicles });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch citywide vehicles', details: err.message });
  }
});

/**
 * GET /api/stops/citywide
 */
app.get('/api/stops/citywide', async (_req: Request, res: Response) => {
  try {
    const stops = await sinetram.getCitywideStops();
    res.json({ total: stops.length, stops });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch citywide stops', details: err.message });
  }
});

/**
 * GET /api/traffic/alerts
 */
app.get('/api/traffic/alerts', async (_req: Request, res: Response) => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=15, s-maxage=30, stale-while-revalidate=120');
    const alertsData = await getLiveTrafficAlerts();
    res.json(alertsData);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch traffic alerts', details: err.message });
  }
});

/**
 * GET /api/places/search
 */
app.get('/api/places/search', async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string || '').trim();
    const places = await searchPlacesInManaus(q);
    res.json({ total: places.length, places });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to search places in Manaus', details: err.message });
  }
});

/**
 * GET /api/places/reverse
 */
app.get('/api/places/reverse', async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ error: 'Parâmetros lat e lng válidos são obrigatórios.' });
    }
    const result = await reverseGeocodeLocation(lat, lng);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Falha na geocodificação reversa', details: err.message });
  }
});

/**
 * GET /api/terminals
 */
app.get('/api/terminals', (_req: Request, res: Response) => {
  res.json({ hubs: MANAUS_TRANSIT_HUBS });
});

/**
 * GET /api/stops/nearby
 */
app.get('/api/stops/nearby', async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string || '-3.1278');
    const lng = parseFloat(req.query.lng as string || '-60.0245');

    const trips = await sinetram.getRouteItinerary('215q');
    const allStops = trips.flatMap(t => t.stops);

    const stopsWithDistance = allStops.map(stop => {
      const R = 6371e3;
      const φ1 = (lat * Math.PI) / 180;
      const φ2 = (stop.lat * Math.PI) / 180;
      const Δφ = ((stop.lat - lat) * Math.PI) / 180;
      const Δλ = ((stop.lng - lng) * Math.PI) / 180;

      const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distanceMeters = Math.round(R * c);

      return { ...stop, distanceMeters };
    });

    stopsWithDistance.sort((a, b) => a.distanceMeters - b.distanceMeters);

    const uniqueStops = stopsWithDistance.filter((v, i, a) => a.findIndex(t => t.stopId === v.stopId) === i).slice(0, 8);

    res.json({
      userPosition: { lat, lng },
      stops: uniqueStops
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to search nearby stops', details: err.message });
  }
});

/**
 * GET /api/live/stream
 */
app.get('/api/live/stream', async (req: Request, res: Response) => {
  const routeId = (req.query.routeId as string) || '215q';
  const routeCode = (req.query.routeCode as string) || '640';

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  const initialVehicles = await sinetram.getRealtimeVehicles(routeId, routeCode);
  res.write(`data: ${JSON.stringify({ type: 'snapshot', routeId, timestamp: Date.now(), vehicles: initialVehicles })}\n\n`);

  const interval = setInterval(async () => {
    try {
      const vehicles = await sinetram.getRealtimeVehicles(routeId, routeCode);
      res.write(`data: ${JSON.stringify({ type: 'delta', routeId, timestamp: Date.now(), vehicles })}\n\n`);
    } catch (err) {
      console.error('[SSE Error]', err);
    }
  }, 4500);

  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });
});

/**
 * GET or POST /api/journey/plan
 */
app.post('/api/journey/plan', async (req: Request, res: Response) => {
  try {
    const { origin, destination } = req.body;
    if (!validPoint(origin) || !validPoint(destination)) {
      return res.status(400).json({ error: 'Informe uma origem e um destino válidos.' });
    }
    const result = await planTransitJourney(origin, destination);
    res.json(result);
  } catch (err: any) {
    console.error('[JourneyPlanner Error]', err);
    res.status(500).json({ error: 'Failed to plan transit journey', details: err.message });
  }
});

app.get('/api/journey/plan', async (req: Request, res: Response) => {
  try {
    const originLat = parseFloat(req.query.originLat as string);
    const originLng = parseFloat(req.query.originLng as string);
    const originName = (req.query.originName as string) || 'Partida';
    const destLat = parseFloat(req.query.destLat as string);
    const destLng = parseFloat(req.query.destLng as string);
    const destName = (req.query.destName as string) || 'Destino';

    if (!validPoint({name:originName,lat:originLat,lng:originLng}) || !validPoint({name:destName,lat:destLat,lng:destLng})) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    const result = await planTransitJourney(
      { name: originName, lat: originLat, lng: originLng },
      { name: destName, lat: destLat, lng: destLng }
    );
    res.json(result);
  } catch (err: any) {
    console.error('[JourneyPlanner Error]', err);
    res.status(500).json({ error: 'Failed to plan transit journey', details: err.message });
  }
});

/**
 * GET /api/device/location
 */
app.get('/api/device/location', async (req: Request, res: Response) => {
  try {
    const forwarded = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';
    const clientIp = forwarded.split(',')[0].trim();

    if (!clientIp || clientIp === '127.0.0.1' || clientIp === '::1' || clientIp.startsWith('192.168.') || clientIp.startsWith('10.')) {
      return res.json({
        lat: -3.1098,
        lng: -60.0245,
        city: 'Manaus',
        state: 'Amazonas',
        isDefaultManaus: true
      });
    }

    try {
      const ipResp = await fetch(`https://ipwho.is/${clientIp}`, { signal: AbortSignal.timeout(2000) });
      if (ipResp.ok) {
        const ipData = await ipResp.json() as any;
        if (ipData.success && typeof ipData.latitude === 'number' && typeof ipData.longitude === 'number') {
          return res.json({
            lat: ipData.latitude,
            lng: ipData.longitude,
            city: ipData.city || 'Manaus',
            state: ipData.region || 'Amazonas',
            isDefaultManaus: false
          });
        }
      }
    } catch {
      // fallback
    }

    res.json({
      lat: -3.1098,
      lng: -60.0245,
      city: 'Manaus',
      state: 'Amazonas',
      isDefaultManaus: true
    });
  } catch {
    res.json({
      lat: -3.1098,
      lng: -60.0245,
      city: 'Manaus',
      state: 'Amazonas',
      isDefaultManaus: true
    });
  }
});

export default app;
export { app };
