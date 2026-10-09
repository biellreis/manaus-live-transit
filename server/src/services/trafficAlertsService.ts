import type { TrafficSource } from './apifyTrafficSource.js';
import { fetchTomTomTrafficIncidents, type TomTomTrafficIncident } from './tomtomTrafficSource.js';

export interface LiveTrafficAlert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  category: 'accidents' | 'jams' | 'hazards';
  corridorName: string;
  title: string;
  description: string;
  timestamp: string;
  endTime: string | null;
}

export interface TrafficAlertsResponse {
  source: TrafficSource;
  timestamp: string;
  alerts: LiveTrafficAlert[];
}

function describeIncident(incident: TomTomTrafficIncident): string {
  const parts = [incident.title + '.'];
  if (incident.from && incident.to && incident.from !== incident.to) {
    parts.push(`Trecho entre ${incident.from} e ${incident.to}.`);
  } else if (incident.from || incident.to) {
    parts.push(`Trecho de ${incident.from || incident.to}.`);
  }
  if (incident.delayInSeconds && incident.delayInSeconds > 0) {
    parts.push(`Atraso estimado de ${Math.ceil(incident.delayInSeconds / 60)} min.`);
  }
  return parts.join(' ');
}

function toLiveAlert(incident: TomTomTrafficIncident): LiveTrafficAlert {
  const startMs = incident.startTime ? Date.parse(incident.startTime) : NaN;
  return {
    id: incident.id,
    severity: incident.severity,
    category: incident.category,
    corridorName: incident.from || incident.to || 'Localização não informada',
    title: incident.title,
    description: describeIncident(incident),
    endTime: incident.endTime,
    timestamp: Number.isFinite(startMs)
      ? new Date(startMs).toLocaleString('pt-BR', {
          timeZone: 'America/Manaus', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
        })
      : 'Horário não informado'
  };
}

/** Only provider-reported, present incidents are published to the alerts tab. */
export async function getLiveTrafficAlerts(): Promise<TrafficAlertsResponse> {
  const snapshot = await fetchTomTomTrafficIncidents();
  return {
    source: snapshot.source,
    timestamp: new Date().toISOString(),
    alerts: snapshot.incidents.map(toLiveAlert)
  };
}
