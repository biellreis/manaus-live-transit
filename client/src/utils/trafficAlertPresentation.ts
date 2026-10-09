import type { TrafficAlertCategory, TrafficAlertSource } from '../types/trafficAlerts.js';
import { hasFreshAlertSource } from './trafficAlertFreshness.js';

export type TrafficAlertBadgeKind = TrafficAlertCategory | 'other';

const BADGES: Record<TrafficAlertBadgeKind, string> = {
  accidents: 'OCORRÊNCIA NA VIA',
  jams: 'LENTIDÃO REPORTADA',
  police: 'POLÍCIA REPORTADA',
  hazards: 'PERIGO REPORTADO',
  other: 'OCORRÊNCIA REPORTADA'
};

export function getTrafficAlertBadge(category?: TrafficAlertCategory): { kind: TrafficAlertBadgeKind; label: string } {
  const kind = category && Object.hasOwn(BADGES, category) ? category : 'other';
  return { kind, label: BADGES[kind] };
}

interface SourceStatusOptions {
  isLoading: boolean;
  hasData: boolean;
  loadError: boolean;
  now?: number;
}

export function getTrafficAlertSourceText(source: TrafficAlertSource | null | undefined, options: SourceStatusOptions): string {
  if (options.isLoading && !options.hasData) return 'Consultando a lista de ocorrências…';

  const sourceName = typeof source?.name === 'string' ? source.name.trim() : '';
  const attribution = sourceName ? `${sourceName} · ` : '';
  const fresh = hasFreshAlertSource(source, options.now);
  if (options.loadError) {
    return fresh
      ? `${attribution}Não foi possível atualizar a lista. Exibindo a última coleta recente.`
      : `${attribution}Não foi possível atualizar a lista de ocorrências.`;
  }

  if (fresh && source?.updatedAt) {
    const collectedAt = new Date(source.updatedAt);
    const day = collectedAt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Manaus' });
    const time = collectedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Manaus' });
    return `${attribution}${source.status === 'updating' ? 'Atualizando ocorrências; última coleta' : 'Última coleta'}: ${day} às ${time}`;
  }

  if (source?.status === 'updating') return `${attribution}Buscando ocorrências recentes…`;
  if (source?.status === 'not_configured') return `${attribution}Fonte de ocorrências não configurada.`;
  return `${attribution}Lista de ocorrências indisponível ou sem atualização recente.`;
}
