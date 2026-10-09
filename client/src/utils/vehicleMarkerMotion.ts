import type { LiveBus } from '../types/transit.js';

type Position = [number, number];
type Marker = { setLngLat: (position: Position) => unknown };

interface Motion {
  marker: Marker;
  position: Position;
  from: Position;
  target: Position;
  startedAt: number;
  duration: number;
  observedAt: number;
  timestamp: number;
  routeId?: string;
  tripId?: number;
}

const MIN_MOVEMENT_METERS = 3;
const MAX_ANIMATED_MOVEMENT_METERS = 100;
const MAX_ANIMATED_SPEED_KMH = 90;
const DEFAULT_INTERVAL_MS = 8_000;

function distanceMeters(a: Position, b: Position): number {
  const latitude = ((a[1] + b[1]) / 2) * Math.PI / 180;
  const dx = (b[0] - a[0]) * 111_320 * Math.cos(latitude);
  const dy = (b[1] - a[1]) * 111_320;
  return Math.hypot(dx, dy);
}

function interpolate(a: Position, b: Position, fraction: number): Position {
  return [a[0] + (b[0] - a[0]) * fraction, a[1] + (b[1] - a[1]) * fraction];
}

/**
 * Smooths the map marker only between two observed GPS fixes. It never predicts
 * a location beyond the latest fix, so a stopped bus remains stopped.
 */
export class VehicleMarkerMotion {
  private motions = new Map<string, Motion>();
  private frame: number | null = null;

  update(bus: LiveBus, marker: Marker, now = performance.now()): void {
    const target: Position = [bus.lng, bus.lat];
    if (!Number.isFinite(target[0]) || !Number.isFinite(target[1])) return;

    const current = this.motions.get(bus.id);
    if (!current || current.marker !== marker) {
      marker.setLngLat(target);
      this.motions.set(bus.id, {
        marker, position: target, from: target, target,
        startedAt: now, duration: 0, observedAt: now,
        timestamp: bus.timestamp, routeId: bus.routeId, tripId: bus.tripId
      });
      return;
    }

    // Polling and SSE often repeat the same cached fix. Never restart its motion.
    if (current.timestamp === bus.timestamp &&
      current.target[0] === target[0] && current.target[1] === target[1]) return;
    if (Number.isFinite(current.timestamp) && Number.isFinite(bus.timestamp) &&
      bus.timestamp < current.timestamp) return;

    const distance = distanceMeters(current.target, target);
    const deltaSeconds = (bus.timestamp - current.timestamp) / 1000;
    const sourceSpeed = deltaSeconds > 0 ? distance / deltaSeconds * 3.6 : 0;
    const stale = bus.timestamp > 1e12 && Date.now() - bus.timestamp > 120_000;
    const shouldSnap =
      current.routeId !== bus.routeId || current.tripId !== bus.tripId ||
      distance < MIN_MOVEMENT_METERS || distance > MAX_ANIMATED_MOVEMENT_METERS ||
      (deltaSeconds > 0 && sourceSpeed > MAX_ANIMATED_SPEED_KMH) ||
      (typeof bus.speedKmh === 'number' && bus.speedKmh < 2) || stale ||
      (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

    const position = this.positionAt(current, now);
    current.from = shouldSnap ? target : position;
    current.position = current.from;
    current.target = target;
    current.startedAt = now;
    // The server emits every 4.5 s but its 5 s cache commonly produces a new
    // fix every ~9 s. Adapt to the observed arrival gap without long animations.
    current.duration = shouldSnap ? 0 : Math.min(12_000, Math.max(3_500,
      (now - current.observedAt || DEFAULT_INTERVAL_MS) * 0.98));
    current.observedAt = now;
    current.timestamp = bus.timestamp;
    current.routeId = bus.routeId;
    current.tripId = bus.tripId;

    if (shouldSnap) marker.setLngLat(target);
    else this.schedule();
  }

  remove(id: string): void {
    this.motions.delete(id);
    if (this.motions.size === 0) this.cancel();
  }

  clear(): void {
    this.cancel();
    this.motions.clear();
  }

  private positionAt(motion: Motion, now: number): Position {
    if (motion.duration <= 0) return motion.target;
    const progress = Math.max(0, Math.min(1, (now - motion.startedAt) / motion.duration));
    return interpolate(motion.from, motion.target, progress);
  }

  private schedule(): void {
    if (this.frame === null) this.frame = requestAnimationFrame(this.tick);
  }

  private cancel(): void {
    if (this.frame !== null) cancelAnimationFrame(this.frame);
    this.frame = null;
  }

  private tick = (now: number): void => {
    this.frame = null;
    let moving = false;
    for (const motion of this.motions.values()) {
      if (motion.duration <= 0) continue;
      motion.position = this.positionAt(motion, now);
      motion.marker.setLngLat(motion.position);
      if (now - motion.startedAt < motion.duration) moving = true;
      else motion.duration = 0;
    }
    if (moving) this.schedule();
  };
}
