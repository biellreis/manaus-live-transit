export interface AlertSourceState {
  status: 'connected' | 'updating' | 'unavailable' | 'not_configured';
  updatedAt: string | null;
}

// Allow one 20-minute feed cycle plus normal scheduling and network delay.
const MAX_ALERT_AGE_MS = 30 * 60 * 1000;

export function hasFreshAlertSource(source: AlertSourceState | null | undefined, now = Date.now()): boolean {
  if (!source || (source.status !== 'connected' && source.status !== 'updating') || !source.updatedAt) return false;
  const updatedAt = Date.parse(source.updatedAt);
  return Number.isFinite(updatedAt) && updatedAt <= now && now - updatedAt <= MAX_ALERT_AGE_MS;
}

export function hasActiveAlertEndTime(endTime: string | null | undefined, now = Date.now()): boolean {
  if (!endTime) return true;
  const endsAt = Date.parse(endTime);
  return Number.isFinite(endsAt) && endsAt > now;
}
