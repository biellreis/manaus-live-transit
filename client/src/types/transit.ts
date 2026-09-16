export interface RouteSummary {
  id: string;
  code: string;
  name: string;
  category: 'troncal' | 'alimentadora' | 'circular' | 'interbairros' | 'convencional';
  color: string;
}

export interface StopInfo {
  stopId: number;
  stopName: string;
  lat: number;
  lng: number;
  sequence: number;
  distKm: number;
  timeSeconds: number;
  reference?: number;
  distanceMeters?: number;
  lines?: string[];
}

export interface TripDetail {
  tripId: number;
  tripName: string;
  tripShortName: string;
  directionType: 'ida' | 'volta' | 'circular' | 'auxiliar';
  totalTimeSeconds: number;
  totalDistanceKm: number;
  coordinates: [number, number][]; // [lng, lat]
  stops: StopInfo[];
}

export interface LiveBus {
  id: string;
  lat: number;
  lng: number;
  heading: number;
  headsign: string;
  timestamp: number;
  tripId?: number;
  routeCode?: string;
  routeId?: string;
  direction?: 'ida' | 'volta' | 'desconhecido';
  speedKmh?: number;
  hasAirConditioning?: boolean;
  crowding?: 'baixa' | 'moderada' | 'alta';
}

export interface TransitHub {
  id: string;
  name: string;
  shortName: string;
  type: 'terminal' | 'station';
  lat: number;
  lng: number;
  neighborhood: string;
  address: string;
  keyLines: string[];
}

export interface TimetableDeparture {
  time: string;
  accessible: boolean;
  tripId: number;
}

export interface TimetableDirection {
  direction: string;
  departures: TimetableDeparture[];
}

export interface TimetableService {
  serviceId: string;
  serviceName: string;
  directions: TimetableDirection[];
}

export interface PlannedLeg {
  line: RouteSummary;
  trip: TripDetail;
  originStop: StopInfo;
  destStop: StopInfo;
}

export interface PlannedTrip {
  journeyDetails?: PlannedLegDetail[];
  legs: PlannedLeg[];
  origin: {
    name: string;
    lat: number;
    lng: number;
  };
  destination: {
    name: string;
    lat: number;
    lng: number;
  };
  originStop: StopInfo;
  destStop: StopInfo;
  line: RouteSummary;
  trip: TripDetail;
  walkToStopMeters: number | null;
  walkToStopMinutes: number | null;
  walkFromStopMeters: number | null;
  walkFromStopMinutes: number | null;
  transitMinutes: number | null;
  totalMinutes: number | null;
  isTransfer?: boolean;
  transferHubName?: string;
  secondLine?: RouteSummary;
  originPlatformOrPoint?: string;
  destPlatformOrPoint?: string;
  etaMinutes?: number | null;
  etaTime?: string | null;
  destEtaTime?: string | null;
  destEtaMinutes?: number | null;
  totalDistanceMeters?: number | null;
  liveBusCount?: number;
  upcomingBuses?: { time: string; minutes: number }[];
  isLiveGps?: boolean;
}

export interface PlannedLegDetail {
  type: 'walk_origin' | 'bus' | 'transfer_hub' | 'walk_dest';
  title: string;
  description: string;
  durationMinutes: number | null;
  distanceMeters: number | null;
  lineCode?: string;
  lineName?: string;
  fromStopName?: string;
  toStopName?: string;
  stopsCount?: number;
  coordinates: [number, number][];
}

export interface TransitOption {
  id: string;
  title: string;
  subtitle: string;
  type: 'direct' | 'transfer';
  badge: string;
  primaryLineCode: string;
  secondaryLineCode?: string;
  transferHubName?: string;
  originPlatformOrPoint?: string;
  destPlatformOrPoint?: string;
  totalMinutes: number | null;
  transitMinutes: number | null;
  walkingMinutes: number | null;
  totalDistanceMeters?: number | null;
  fare: string;
  fareNote: string;
  originStop: StopInfo;
  destStop: StopInfo;
  legs: PlannedLegDetail[];
  verifiedLegs: PlannedLeg[];
  walkingAvailable: boolean;
  fullPolyline: [number, number][];
  walkOriginCoords: [number, number][];
  walkDestCoords: [number, number][];
  etaMinutes?: number | null;
  etaTime?: string | null;
  destEtaTime?: string | null;
  destEtaMinutes?: number | null;
  liveBusCount?: number;
  upcomingBuses?: { time: string; minutes: number }[];
  isLiveGps?: boolean;
}

export interface NearestStopItem extends StopInfo {
  distanceMeters: number;
  walkMinutes: number | null;
  lines: string[];
}

export interface PlanJourneyResult {
  origin: { name: string; lat: number; lng: number };
  destination: { name: string; lat: number; lng: number };
  nearestOriginStop: NearestStopItem | null;
  nearestDestStop: NearestStopItem | null;
  nearestOriginStops?: NearestStopItem[];
  nearestDestStops?: NearestStopItem[];
  hasDirectBus: boolean;
  selectedOptionIndex: number;
  options: TransitOption[];
  source: string;
  message: string;
}
