import type { TrafficSource } from './apifyTrafficSource.js';

export type TomTomAlertCategory = 'accidents' | 'jams' | 'hazards';
export type TomTomAlertSeverity = 'info' | 'warning' | 'critical';

export interface TomTomTrafficIncident {
  id: string;
  iconCategory: string;
  category: TomTomAlertCategory;
  severity: TomTomAlertSeverity;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  from: string | null;
  to: string | null;
  startTime: string | null;
  endTime: string | null;
  lastReportTime: string | null;
  magnitudeOfDelay: string;
  delayInSeconds: number | null;
  lengthInMeters: number;
  probabilityOfOccurrence: string;
  numberOfReports: number | null;
}

export interface TomTomTrafficSnapshot {
  incidents: TomTomTrafficIncident[];
  source: TrafficSource;
}

const DETAILS_URL = 'https://api.tomtom.com/maps/orbis/traffic/incidents/details?apiVersion=2&bbox=-60.20,-3.20,-59.80,-2.85&timeValidity=present';
const ATTRIBUTES = 'incidents(type,geometry(type,coordinates),properties(id,iconCategory,magnitudeOfDelay,events(description,code,iconCategory),startTime,endTime,from,to,lengthInMeters,delayInSeconds,timeValidity,probabilityOfOccurrence,numberOfReports,lastReportTime))';
const CACHE_MS = 20 * 60_000;
const SOURCE_NAME = 'TomTom Traffic';

let cached: TomTomTrafficSnapshot | null = null;
let cachedKey: string | null = null;
let expiresAt = 0;
let pending: Promise<TomTomTrafficSnapshot> | null = null;
let pendingKey: string | null = null;

function source(status: TrafficSource['status'], updatedAt: string | null, message: string): TrafficSource {
  return { name: SOURCE_NAME, status, updatedAt, message };
}

function unavailable(): TomTomTrafficSnapshot {
  return {
    incidents: [],
    source: source('unavailable', null, 'Não foi possível consultar as ocorrências da TomTom agora.')
  };
}

/** A successful request is shared for 20 minutes; failed requests never expose an older snapshot. */
export function fetchTomTomTrafficIncidents(): Promise<TomTomTrafficSnapshot> {
  const apiKey = process.env.TOMTOM_API_KEY?.trim();
  if (!apiKey) {
    cached = null;
    cachedKey = null;
    expiresAt = 0;
    return Promise.resolve({
      incidents: [],
      source: source('not_configured', null, 'Fonte de ocorrências TomTom não configurada.')
    });
  }
  if (pending && pendingKey === apiKey) return pending;
  if (cached && cachedKey === apiKey && Date.now() < expiresAt) {
    const now = Date.now();
    return Promise.resolve({
      source: cached.source,
      incidents: cached.incidents.filter(incident =>
        (incident.startTime === null || Date.parse(incident.startTime) <= now) &&
        (incident.endTime === null || Date.parse(incident.endTime) > now))
    });
  }

  const flight = loadSnapshot(apiKey).then(snapshot => {
    if (pending === flight && process.env.TOMTOM_API_KEY?.trim() === apiKey) {
      cached = snapshot.source.status === 'connected' ? snapshot : null;
      cachedKey = cached ? apiKey : null;
      expiresAt = cached ? Date.now() + CACHE_MS : 0;
    }
    return snapshot;
  }).finally(() => {
    if (pending === flight) {
      pending = null;
      pendingKey = null;
    }
  });
  pending = flight;
  pendingKey = apiKey;
  return flight;
}

async function loadSnapshot(apiKey: string): Promise<TomTomTrafficSnapshot> {
  try {
    const response = await fetch(DETAILS_URL, {
      headers: {
        'TomTom-Api-Key': apiKey,
        Attributes: ATTRIBUTES
      },
      signal: AbortSignal.timeout(15_000)
    });
    if (!response.ok) return unavailable();
    const body: unknown = await response.json();
    const root = record(body);
    if (!Array.isArray(root.incidents)) throw new Error('Malformed incidents response');

    const fetchedAt = Date.now();
    const incidents: TomTomTrafficIncident[] = [];
    for (const raw of root.incidents) {
      const incident = normalizeIncident(raw, fetchedAt);
      if (incident) incidents.push(incident);
    }
    return {
      incidents,
      source: source('connected', new Date(fetchedAt).toISOString(), 'Ocorrências atuais consultadas na TomTom.')
    };
  } catch {
    // Never include provider error bodies or request headers in logs or responses.
    return unavailable();
  }
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Expected object');
  return value as Record<string, unknown>;
}

function requiredString(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) throw new Error('Expected string');
  return value.trim();
}

function optionalString(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value !== 'string') throw new Error('Expected optional string');
  return value.trim() || null;
}

function optionalTime(value: unknown): string | null {
  const time = optionalString(value);
  if (time !== null && !Number.isFinite(Date.parse(time))) throw new Error('Invalid time');
  return time;
}

function finiteNumber(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error('Expected number');
  return value;
}

function optionalNonnegativeNumber(value: unknown): number | null {
  if (value == null) return null;
  const number = finiteNumber(value);
  if (number < 0) throw new Error('Expected nonnegative number');
  return number;
}

function position(value: unknown): [number, number] {
  if (!Array.isArray(value) || value.length < 2) throw new Error('Invalid position');
  const longitude = finiteNumber(value[0]);
  const latitude = finiteNumber(value[1]);
  if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) throw new Error('Invalid coordinates');
  return [longitude, latitude];
}

function incidentPosition(raw: unknown): [number, number] {
  const geometry = record(raw);
  if (geometry.type === 'Point') return position(geometry.coordinates);
  if (geometry.type === 'LineString') {
    if (!Array.isArray(geometry.coordinates) || geometry.coordinates.length < 2) throw new Error('Invalid line');
    const coordinates = geometry.coordinates.map(position);
    return coordinates[Math.floor(coordinates.length / 2)];
  }
  throw new Error('Unsupported geometry');
}

function presentation(iconCategory: string, magnitude: string): Pick<TomTomTrafficIncident, 'category' | 'severity' | 'title'> {
  const critical = magnitude === 'major';
  switch (iconCategory) {
    case 'accident': return { category: 'accidents', severity: 'critical', title: 'Acidente de trânsito' };
    case 'jam': return { category: 'jams', severity: critical ? 'critical' : 'warning', title: 'Lentidão no trânsito' };
    case 'roadClosed': return { category: 'accidents', severity: 'critical', title: 'Via interditada' };
    case 'roadWorks': return { category: 'accidents', severity: critical ? 'critical' : 'warning', title: 'Obras na via' };
    case 'laneClosed': return { category: 'accidents', severity: critical ? 'critical' : 'warning', title: 'Faixa interditada' };
    case 'brokenDownVehicle': return { category: 'hazards', severity: critical ? 'critical' : 'warning', title: 'Veículo parado na via' };
    default: return { category: 'hazards', severity: critical ? 'critical' : 'warning', title: 'Ocorrência de trânsito' };
  }
}

function normalizeIncident(raw: unknown, fetchedAt: number): TomTomTrafficIncident | null {
  const feature = record(raw);
  if (feature.type !== 'Feature') throw new Error('Invalid feature');
  const properties = record(feature.properties);
  const id = requiredString(properties.id);
  const iconCategory = requiredString(properties.iconCategory);
  const magnitudeOfDelay = requiredString(properties.magnitudeOfDelay);
  const timeValidity = requiredString(properties.timeValidity);
  if (timeValidity !== 'present' && timeValidity !== 'future') throw new Error('Invalid time validity');
  const startTime = optionalTime(properties.startTime);
  const endTime = optionalTime(properties.endTime);
  const lastReportTime = optionalTime(properties.lastReportTime);
  if (!Array.isArray(properties.events)) throw new Error('Invalid events');
  const descriptions = properties.events.map(event => {
    const detail = record(event);
    requiredString(detail.iconCategory);
    if (!Number.isInteger(detail.code)) throw new Error('Invalid event code');
    return requiredString(detail.description);
  });
  const [longitude, latitude] = incidentPosition(feature.geometry);
  const from = optionalString(properties.from);
  const to = optionalString(properties.to);
  const lengthInMeters = finiteNumber(properties.lengthInMeters);
  if (lengthInMeters < 0) throw new Error('Invalid length');
  const delayInSeconds = optionalNonnegativeNumber(properties.delayInSeconds);
  const probabilityOfOccurrence = requiredString(properties.probabilityOfOccurrence);
  const numberOfReports = optionalNonnegativeNumber(properties.numberOfReports);
  if (numberOfReports !== null && !Number.isInteger(numberOfReports)) throw new Error('Invalid report count');

  // The endpoint is queried for present incidents, but reject contradictory records.
  if (timeValidity !== 'present' ||
      (startTime !== null && Date.parse(startTime) > fetchedAt) ||
      (endTime !== null && Date.parse(endTime) <= fetchedAt)) return null;

  const display = presentation(iconCategory, magnitudeOfDelay);
  return {
    id, iconCategory, ...display,
    description: descriptions.join('; ') || display.title,
    latitude, longitude, from, to, startTime, endTime, lastReportTime,
    magnitudeOfDelay, delayInSeconds, lengthInMeters,
    probabilityOfOccurrence, numberOfReports
  };
}
