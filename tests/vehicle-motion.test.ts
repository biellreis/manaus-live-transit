import test from 'node:test';
import assert from 'node:assert/strict';
import { VehicleMarkerMotion } from '../client/src/utils/vehicleMarkerMotion.js';
import type { LiveBus } from '../client/src/types/transit.js';

test('bus marker moves between confirmed fixes without overshooting or restarting on cached snapshots', () => {
  const originalRequest = globalThis.requestAnimationFrame;
  const originalCancel = globalThis.cancelAnimationFrame;
  let frame: FrameRequestCallback | null = null;
  globalThis.requestAnimationFrame = callback => { frame = callback; return 1; };
  globalThis.cancelAnimationFrame = () => { frame = null; };

  try {
    const positions: [number, number][] = [];
    const marker = { setLngLat: (position: [number, number]) => { positions.push(position); } };
    const motion = new VehicleMarkerMotion();
    const timestamp = Date.now();
    const first: LiveBus = {
      id: '409-1', lng: -60.02, lat: -3.1, heading: 0,
      headsign: '409', timestamp, routeId: '213t', tripId: 1
    };
    const second = { ...first, lng: -60.0199, timestamp: timestamp + 8_000 };
    motion.update(first, marker, 0);
    motion.update(second, marker, 8_000);
    assert.ok(frame, 'moving fix should schedule animation');

    const halfway = frame!;
    frame = null;
    halfway(11_920);
    const position = positions.at(-1)!;
    assert.ok(position[0] > first.lng && position[0] < second.lng);
    assert.equal(position[1], first.lat);

    const next = frame!;
    motion.update(second, marker, 12_000); // cached SSE copy
    frame = null;
    next(20_000);
    assert.deepEqual(positions.at(-1), [second.lng, second.lat]);
    assert.equal(frame, null, 'animation stops exactly at the confirmed fix');
    motion.clear();
  } finally {
    globalThis.requestAnimationFrame = originalRequest;
    globalThis.cancelAnimationFrame = originalCancel;
  }
});

test('reported stop and implausible GPS jump snap instead of depicting travel', () => {
  const originalRequest = globalThis.requestAnimationFrame;
  let scheduled = 0;
  globalThis.requestAnimationFrame = () => { scheduled++; return 1; };
  try {
    const positions: [number, number][] = [];
    const marker = { setLngLat: (position: [number, number]) => { positions.push(position); } };
    const motion = new VehicleMarkerMotion();
    const timestamp = Date.now();
    const first: LiveBus = {
      id: '409-1', lng: -60.02, lat: -3.1, heading: 0,
      headsign: '409', timestamp, routeId: '213t', tripId: 1
    };
    motion.update(first, marker, 0);
    motion.update({ ...first, lng: -60.0199, speedKmh: 0, timestamp: timestamp + 8_000 }, marker, 8_000);
    assert.deepEqual(positions.at(-1), [-60.0199, -3.1]);
    motion.update({ ...first, lng: -60.01, timestamp: timestamp + 16_000 }, marker, 16_000);
    assert.deepEqual(positions.at(-1), [-60.01, -3.1]);
    assert.equal(scheduled, 0);
    motion.clear();
  } finally {
    globalThis.requestAnimationFrame = originalRequest;
  }
});
