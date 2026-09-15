import { fetchWazeLiveItems, type TrafficSource } from './apifyTrafficSource.js';
import { sinetram } from './sinetramClient.js';

export interface CorridorTrafficInfo {
  id: string;
  name: string;
  avenues: string;
  status: 'fluido' | 'moderado' | 'intenso' | 'sem_operacao';
  statusText: string;
  avgSpeedKmH: number;
  activeVehiclesCount: number;
  keyLines: string[];
}

export interface LiveTrafficAlert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  category: 'accidents' | 'jams' | 'police' | 'hazards';
  corridorName: string;
  neighborhood?: string;
  title: string;
  description: string;
  timestamp: string;
}

export interface TrafficAlertsResponse {
  source: TrafficSource;
  timestamp: string;
  summary: {
    overallStatus: 'normal' | 'lento' | 'atencao' | 'fora_horario';
    totalTrackedBuses: number;
    activeCorridorsCount: number;
  };
  corridors: CorridorTrafficInfo[];
  alerts: LiveTrafficAlert[];
}

interface MonitoredCorridorDef {
  id: string;
  name: string;
  avenues: string;
  keyLines: string[];
  startCoord: [number, number]; // [lat, lng]
  endCoord: [number, number];   // [lat, lng]
  freeFlowSpeedKmH: number;     // Nominal free-flow speed on avenue
}

const MONITORED_CORRIDORS: MonitoredCorridorDef[] = [
  {
    id: 'corr-constantino',
    name: 'Av. Constantino Nery',
    avenues: 'Centro, São Jorge, Chapada',
    keyLines: ['640', '300', '448', '560', '357', '500'],
    startCoord: [-3.1278, -60.0245],
    endCoord: [-3.0825, -60.0289],
    freeFlowSpeedKmH: 45
  },
  {
    id: 'corr-torquato',
    name: 'Av. Torquato Tapajós',
    avenues: 'Flores, Santos Dumont, Santa Etelvina',
    keyLines: ['640', '300', '560', '357', 'A030'],
    startCoord: [-3.0825, -60.0289],
    endCoord: [-3.0369, -60.0062],
    freeFlowSpeedKmH: 55
  },
  {
    id: 'corr-djalma',
    name: 'Av. Djalma Batista',
    avenues: 'Nossa Senhora das Graças, Parque 10',
    keyLines: ['409', '422', '219', '203', 'A402'],
    startCoord: [-3.1255, -60.0187],
    endCoord: [-3.0825, -60.0289],
    freeFlowSpeedKmH: 45
  },
  {
    id: 'corr-autaz',
    name: 'Av. Autaz Mirim (Grande Circular)',
    avenues: 'Jorge Teixeira, São José, Tancredo Neves',
    keyLines: ['600', '650', '652', '678', '080'],
    startCoord: [-3.0842, -59.9678],
    endCoord: [-3.0351, -59.9448],
    freeFlowSpeedKmH: 40
  },
  {
    id: 'corr-mario-ypiranga',
    name: 'Av. Mário Ypiranga (Recife)',
    avenues: 'Adrianópolis, Parque 10, Flores',
    keyLines: ['409', '422', '358', '446'],
    startCoord: [-3.1180, -60.0125],
    endCoord: [-3.0815, -60.0210],
    freeFlowSpeedKmH: 40
  },
  {
    id: 'corr-rodrigo-otavio',
    name: 'Av. Rodrigo Otávio',
    avenues: 'Japiim, Coroado, Distrito Industrial',
    keyLines: ['418', '535', '616', '705', '715'],
    startCoord: [-3.1255, -59.9950],
    endCoord: [-3.0842, -59.9678],
    freeFlowSpeedKmH: 45
  },
  {
    id: 'corr-coronel-teixeira',
    name: 'Av. Coronel Teixeira (Ponta Negra)',
    avenues: 'Ponta Negra, Nova Esperança, Santo Antônio',
    keyLines: ['120', '126', '001', '002', '008'],
    startCoord: [-3.1098, -60.0450],
    endCoord: [-3.0635, -60.1035],
    freeFlowSpeedKmH: 50
  },
  {
    id: 'corr-cosme-ferreira',
    name: 'Alameda Cosme Ferreira',
    avenues: 'Coroado, Aleixo, São José (T5)',
    keyLines: ['650', '652', '678', '008', '600'],
    startCoord: [-3.0970, -59.9850],
    endCoord: [-3.0842, -59.9678],
    freeFlowSpeedKmH: 45
  }
];

/**
 * Perform live routing speed probe for a corridor using OSRM live routing engine (cached for 5 minutes)
 */
const corridorSpeedCache = new Map<string, { speed: number; timestamp: number }>();
const CORRIDOR_SPEED_CACHE_MS = 5 * 60 * 1000;

async function probeCorridorSpeed(def: MonitoredCorridorDef): Promise<number | null> {
  const cached = corridorSpeedCache.get(def.id);
  if (cached && (Date.now() - cached.timestamp < CORRIDOR_SPEED_CACHE_MS)) {
    return cached.speed;
  }
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${def.startCoord[1]},${def.startCoord[0]};${def.endCoord[1]},${def.endCoord[0]}?overview=false`;
    const resp = await fetch(url, {
      signal: AbortSignal.timeout(2500),
      headers: { 'User-Agent': 'Mozilla/5.0 (ManausLiveTransit/2.0)' }
    });

    if (resp.ok) {
      const data = await resp.json() as any;
      const route = data.routes?.[0];
      if (route && route.distance > 0 && route.duration > 0) {
        const distKm = route.distance / 1000;
        const durationHours = route.duration / 3600;
        const speedKmh = Math.round(distKm / durationHours);
        corridorSpeedCache.set(def.id, { speed: speedKmh, timestamp: Date.now() });
        return speedKmh;
      }
    }
  } catch {
    // fallback to bus GPS telemetry speeds
  }
  return null;
}

let cachedAlertsResponse: TrafficAlertsResponse | null = null;
let cachedAlertsExpiresAt = 0;

export async function getLiveTrafficAlerts(forceRefresh = false): Promise<TrafficAlertsResponse> {
  if (!forceRefresh && cachedAlertsResponse && Date.now() < cachedAlertsExpiresAt) {
    return cachedAlertsResponse;
  }

  const [vehicles, wazeSnapshot] = await Promise.all([
    sinetram.getCitywideVehicles(),
    fetchWazeLiveItems()
  ]);

  const now = new Date();
  const wazeItems = wazeSnapshot.items;

  // Probe all corridors in parallel
  const probedSpeeds = await Promise.all(
    MONITORED_CORRIDORS.map(def => probeCorridorSpeed(def))
  );

  const totalCitywideVehicles = vehicles.length;

  const corridors: CorridorTrafficInfo[] = MONITORED_CORRIDORS.map((def, idx) => {
    const matchingVehicles = vehicles.filter(v => def.keyLines.includes(v.routeCode || ''));
    const count = matchingVehicles.length;

    if (count === 0) {
      const statusText = totalCitywideVehicles === 0
        ? 'Fora do Horário de Operação (0 ônibus ativos)'
        : 'Nenhum ônibus circulando neste trecho';

      return {
        id: def.id,
        name: def.name,
        avenues: def.avenues,
        status: 'sem_operacao',
        statusText,
        avgSpeedKmH: 0,
        activeVehiclesCount: 0,
        keyLines: def.keyLines
      };
    }

    const gpsSpeeds = matchingVehicles
      .map(v => v.speedKmh)
      .filter((s): s is number => typeof s === 'number' && s > 0);

    const probedSpeed = probedSpeeds[idx];

    let avgSpeed: number;
    if (gpsSpeeds.length > 0) {
      avgSpeed = Math.round(gpsSpeeds.reduce((a, b) => a + b, 0) / gpsSpeeds.length);
    } else if (probedSpeed !== null && probedSpeed > 0) {
      avgSpeed = probedSpeed;
    } else {
      avgSpeed = Math.max(18, Math.min(def.freeFlowSpeedKmH, 32));
    }

    let status: 'fluido' | 'moderado' | 'intenso' = 'fluido';
    let statusText = 'Fluxo livre e contínuo';

    if (avgSpeed < 20 || count > 12) {
      status = 'intenso';
      statusText = 'Trânsito intenso com retenção';
    } else if (avgSpeed < 32 || count > 7) {
      status = 'moderado';
      statusText = 'Trânsito moderado';
    }

    return {
      id: def.id,
      name: def.name,
      avenues: def.avenues,
      status,
      statusText,
      avgSpeedKmH: avgSpeed,
      activeVehiclesCount: count,
      keyLines: def.keyLines
    };
  });

  const alerts: LiveTrafficAlert[] = [];

  // 1. Process Live Waze Alerts & Incidents (ignoring potholes and generic labels)
  if (wazeItems && wazeItems.length > 0) {
    wazeItems.forEach((w, idx) => {
      const type = (w.recordType === 'jam' ? 'JAM' : w.alertType || w.type || '').toUpperCase();
      const subtype = (w.alertSubtype || w.subtype || '').toUpperCase();

      // Explicitly IGNORE potholes as requested by user
      if (subtype.includes('POT_HOLE') || type === 'HAZARD_ON_ROAD_POT_HOLE') {
        return;
      }

      if (w.city && !w.city.toLowerCase().includes('manaus')) return;
      if (!['ACCIDENT','ROAD_CLOSED','HAZARD','JAM','POLICE','CONSTRUCTION'].includes(type)) return;
      const location = { street: w.street?.trim() || 'Via não informada', neighborhood: w.city || 'Manaus' };
      const category = type === 'ACCIDENT' || type === 'ROAD_CLOSED' || type === 'CONSTRUCTION' || subtype.includes('CONSTRUCTION') ? 'accidents' : type === 'JAM' ? 'jams' : type === 'POLICE' ? 'police' : 'hazards';

      let title = 'Alerta de Trânsito';
      let severity: 'info' | 'warning' | 'critical' = 'info';

      if (type === 'ACCIDENT') {
        title = 'Acidente reportado';
        severity = 'critical';
      } else if (type === 'ROAD_CLOSED' || type === 'CONSTRUCTION') {
        title = 'Via Interditada / Obras na Pista';
        severity = 'critical';
      } else if (type === 'HAZARD') {
        if (subtype.includes('CONSTRUCTION')) {
          title = 'Obras e Manutenção na Pista';
          severity = 'warning';
        } else {
          title = 'Perigo Reportado na Via';
          severity = 'warning';
        }
      } else if (type === 'JAM') {
        title = 'Lentidão e Engarrafamento';
        severity = 'warning';
      } else if (type === 'POLICE') {
        title = 'Fiscalização reportada';
        severity = 'info';
      }

      const dt = w.publishDatetimeUtc || w.publish_datetime_utc || w._fetchedAt || wazeSnapshot.source.updatedAt;
      const parsed = dt ? new Date(dt) : now;
      const timeText = Number.isFinite(parsed.getTime()) ? parsed.toLocaleString('pt-BR', { timeZone:'America/Manaus', day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' }) : 'Horário não informado';

      alerts.push({
        id: `alert-${idx}-${w.latitude || 0}`,
        severity,
        category,
        corridorName: location.street,
        neighborhood: location.neighborhood,
        title,
        description: w.alertDescription || `${title} em ${location.street}, ${location.neighborhood}. Monitoramento em tempo real.`,
        timestamp: timeText
      });
    });
  }

  const slowCorridors = corridors.filter(c => c.status === 'intenso').length;

  const result: TrafficAlertsResponse = {
    source: wazeSnapshot.source,
    timestamp: now.toISOString(),
    summary: {
      overallStatus: totalCitywideVehicles === 0 ? 'fora_horario' : slowCorridors > 2 ? 'lento' : slowCorridors > 0 ? 'atencao' : 'normal',
      totalTrackedBuses: totalCitywideVehicles,
      activeCorridorsCount: corridors.filter(c => c.activeVehiclesCount > 0).length
    },
    corridors,
    alerts
  };

  cachedAlertsResponse = result;
  cachedAlertsExpiresAt = Date.now() + 30000; // Cache 30 seconds

  return result;
}
