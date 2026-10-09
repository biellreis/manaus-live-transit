export interface AlertSourceState {
  status: 'connected' | 'updating' | 'unavailable' | 'not_configured';
  updatedAt: string | null;
}

const MAX_ALERT_AGE_MS = 15 * 60 * 1000;

export function hasFreshAlertSource(source: AlertSourceState | null | undefined, now = Date.now()): boolean {
  if (!source || (source.status !== 'connected' && source.status !== 'updating') || !source.updatedAt) return false;
  const updatedAt = Date.parse(source.updatedAt);
  return Number.isFinite(updatedAt) && updatedAt <= now && now - updatedAt <= MAX_ALERT_AGE_MS;
}
