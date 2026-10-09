import type { AlertSourceState } from '../utils/trafficAlertFreshness.js';

export type TrafficAlertCategory = 'accidents' | 'jams' | 'police' | 'hazards';

export interface TrafficAlertItem {
  id: string;
  category?: TrafficAlertCategory;
  corridorName: string;
  neighborhood?: string;
  title: string;
  description: string;
  timestamp: string;
  endTime?: string | null;
}

export interface TrafficAlertSource extends AlertSourceState {
  name?: string;
  message?: string;
}

export interface TrafficApiResponse {
  source?: TrafficAlertSource;
  alerts: TrafficAlertItem[];
}
