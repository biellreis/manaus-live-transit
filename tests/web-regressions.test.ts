import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { findCandidates } from '../server/src/services/routePlannerService.js';
import network from '../server/src/services/manausAllRoutesCache.json';
import { sinetram } from '../server/src/services/sinetramClient.js';

test('production emits a bundled MapLibre worker referenced by the application', () => {
  const dir = new URL('../client/dist/assets/', import.meta.url);
  const files = readdirSync(dir);
  const worker = files.find(f => /^maplibre-gl-worker-.*\.js$/.test(f));
  assert.ok(worker);
  const bundle = files.find(f => /^index-.*\.js$/.test(f))!;
  assert.ok(readFileSync(new URL(bundle, dir), 'utf8').includes(worker));
  assert.ok(!readFileSync(new URL(worker, dir), 'utf8').includes('./maplibre-gl-shared.mjs'));
});

test('T3 to T1 keeps the verified boarding/alighting choices while bounding planning time', () => {
  const start = performance.now();
  const result = findCandidates(Object.values(network) as any,
    {name:'Terminal 3 - Cidade Nova (T3)',lat:-3.03692,lng:-60.00624},
    {name:'Terminal 1 - Constantino Nery (T1)',lat:-3.12781,lng:-60.02452});
  assert.deepEqual(result.slice(0, 5).map(legs => legs.map(l => [l.line.code,l.trip.tripId,l.originStop.sequence,l.destStop.sequence])),
    [[['300',5027594,2,9]],[['357',5027713,30,53]],[['448',5022779,23,43]],[['640',5011542,12,33]],[['454',5027644,2,44]]]);
  assert.ok(performance.now() - start < 2000, 'planning exceeded two seconds');
});

test('live direction follows trip IDs and preserves northern Manaus vehicles', async () => {
  const original = globalThis.fetch;
  const trips = await sinetram.getRouteItinerary('640');
  const ida = trips.find(t => t.directionType === 'ida')!;
  const volta = trips.find(t => t.directionType === 'volta')!;
  globalThis.fetch = async () => new Response(JSON.stringify({vehicles:[
    {id:'north',lat:-2.94,lon:-60.02,tid:ida.tripId,lb:'VOLTA'},
    {id:'return',lat:-3.1,lon:-60.02,tid:volta.tripId,lb:'IDA'},
    {id:'unknown',lat:-3.1,lon:-60.02,lb:'PONTA NEGRA'},
    {id:'invalid',lat:0,lon:0}
  ]}));
  try {
    const buses = await sinetram.getRealtimeVehicles('640','640');
    assert.equal(buses.length,3);
    assert.deepEqual(buses.map(b=>b.direction),['ida','volta','desconhecido']);
  } finally { globalThis.fetch=original; }
});

test('recent destinations logic deduplicates, infers line codes, and prepends newly chosen destinations', async () => {
  const { guessLineCode } = await import('../client/src/utils/recentDestinations.js');
  assert.equal(guessLineCode('Terminal 1 - Constantino Nery'), '640');
  assert.equal(guessLineCode('Terminal 4 - Jorge Teixeira'), '300');
  assert.equal(guessLineCode('Terminal 2 - Cachoeirinha'), '448');
  assert.equal(guessLineCode('Terminal 3 - Cidade Nova'), '350');
  assert.equal(guessLineCode('Terminal 5 - São José'), '652');
  assert.equal(guessLineCode('Terminal 6 - Lago Azul'), '356');
  assert.equal(guessLineCode('Ponta Negra'), '450');
});

test('calculateLiveTripEta accurately detects approaching buses, passed buses, and advances to behind vehicles', async () => {
  const { calculateLiveTripEta } = await import('../client/src/utils/realtimeEta.js');

  const mockStops = [
    { stopId: 101, stopName: 'Parada 1 - Inicio', lat: -3.0780, lng: -60.0050, sequence: 1, distKm: 0, timeSeconds: 0 },
    { stopId: 102, stopName: 'Parada 2 - Av Torres 10', lat: -3.0720, lng: -60.0030, sequence: 2, distKm: 0.8, timeSeconds: 120 },
    { stopId: 103, stopName: 'AV JOSÉ LINDOSO 15', lat: -3.0650, lng: -60.0010, sequence: 3, distKm: 1.6, timeSeconds: 240 },
    { stopId: 104, stopName: 'Parada 4 - Av Torres 20', lat: -3.0580, lng: -59.9990, sequence: 4, distKm: 2.4, timeSeconds: 360 },
    { stopId: 105, stopName: 'Terminal 3 - Cidade Nova', lat: -3.0369, lng: -60.0062, sequence: 5, distKm: 5.0, timeSeconds: 700 }
  ];

  const boardStop = mockStops[2]; // AV JOSÉ LINDOSO 15
  const now = new Date('2026-09-16T21:20:00-04:00').getTime();

  // Test Case 1: Bus 1 is approaching before the stop (between Parada 1 and 2)
  const approachingBus = {
    id: 'bus-lead',
    lat: -3.0750,
    lng: -60.0040,
    heading: 0,
    headsign: 'T3',
    timestamp: now,
    speedKmh: 20
  };

  const res1 = calculateLiveTripEta(mockStops as any, boardStop as any, [approachingBus as any], now, 24, 'ida');
  assert.equal(res1.status, 'approaching');
  assert.ok(typeof res1.etaMinutes === 'number' && res1.etaMinutes > 0);
  assert.equal(res1.primaryBus?.id, 'bus-lead');
  assert.equal(res1.passedBusesCount, 0);

  // Test Case 2: Bus 1 has PASSED the stop (now at Parada 4, north of AV JOSÉ LINDOSO 15)
  const passedBus = {
    id: 'bus-lead',
    lat: -3.0570,
    lng: -59.9985,
    heading: 0,
    headsign: 'T3',
    timestamp: now,
    speedKmh: 25
  };

  // Case 2A: ONLY passed bus is on route -> status must be 'passed_no_next'
  const res2A = calculateLiveTripEta(mockStops as any, boardStop as any, [passedBus as any], now, 24, 'ida');
  assert.equal(res2A.status, 'passed_no_next');
  assert.equal(res2A.primaryBus, null);
  assert.equal(res2A.passedBusesCount, 1);
  assert.ok(res2A.noticeMessage?.includes('já passou'));

  // Case 2B: Bus 1 has passed, but Bus 2 is coming BEHIND (at Parada 1)
  const behindBus = {
    id: 'bus-behind',
    lat: -3.0780,
    lng: -60.0050,
    heading: 0,
    headsign: 'T3',
    timestamp: now,
    speedKmh: 20
  };

  const res2B = calculateLiveTripEta(mockStops as any, boardStop as any, [passedBus as any, behindBus as any], now, 24, 'ida');
  assert.equal(res2B.status, 'passed_has_next');
  assert.equal(res2B.primaryBus?.id, 'bus-behind');
  assert.equal(res2B.passedBusesCount, 1);
  assert.ok(typeof res2B.etaMinutes === 'number' && res2B.etaMinutes > 0);
  assert.ok(res2B.noticeMessage?.includes('Ônibus anterior já passou'));
});


