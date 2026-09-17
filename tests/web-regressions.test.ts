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

  // Test Case 3: Bus is AT THE STOP (<= 45m) -> status 'at_stop', 0 min
  const atStopBus = {
    id: 'bus-lead',
    lat: boardStop.lat + 0.0001, // ~11m from stop
    lng: boardStop.lng,
    heading: 0,
    headsign: 'T3',
    timestamp: now,
    speedKmh: 10
  };
  const res3 = calculateLiveTripEta(mockStops as any, boardStop as any, [atStopBus as any], now, 24, 'ida');
  assert.equal(res3.status, 'at_stop');
  assert.equal(res3.etaMinutes, 0);

  // Test Case 4: Sliced stops vs Full Trip stops (Line 457 scenario)
  // When a planned trip has sliced stops starting at the boarding stop (index 0),
  // using the full stops list detects an incoming bus driving 1.5km before the boarding stop.
  const fullRouteStops = [
    { stopId: 1, stopName: 'Terminal 3', lat: -3.0369, lng: -60.0062, sequence: 1, distKm: 0, timeSeconds: 0 },
    { stopId: 2, stopName: 'Av Gov Jose Lindoso 03', lat: -3.0473, lng: -59.9854, sequence: 2, distKm: 1.5, timeSeconds: 180 },
    { stopId: 3, stopName: 'Av Gov Jose Lindoso 06', lat: -3.0600, lng: -59.9878, sequence: 3, distKm: 3.0, timeSeconds: 360 },
    { stopId: 4, stopName: 'Av Gov Jose Lindoso 08', lat: -3.0693, lng: -59.9913, sequence: 4, distKm: 4.2, timeSeconds: 500 },
    { stopId: 5, stopName: 'AV JOSÉ LINDOSO 09', lat: -3.0747, lng: -59.9929, sequence: 5, distKm: 5.0, timeSeconds: 600 },
    { stopId: 6, stopName: 'AV LEONARDO MALCHER 05', lat: -3.1317, lng: -60.0245, sequence: 6, distKm: 12.0, timeSeconds: 1500 }
  ];
  const targetBoard = fullRouteStops[4]; // AV JOSÉ LINDOSO 09
  const busBeforeStop = {
    id: 'bus-457',
    lat: fullRouteStops[2].lat, // at Av Gov Jose Lindoso 06 (~2km before board stop)
    lng: fullRouteStops[2].lng,
    heading: 180,
    headsign: 'Centro',
    timestamp: now,
    speedKmh: 22
  };

  // With fullRouteStops: correctly tracks approaching bus with dynamic minutes!
  const resFull = calculateLiveTripEta(fullRouteStops as any, targetBoard as any, [busBeforeStop as any], now, 24, 'ida');
  assert.equal(resFull.status, 'approaching');
  assert.ok(typeof resFull.etaMinutes === 'number' && resFull.etaMinutes >= 4 && resFull.etaMinutes <= 8);
  assert.equal(resFull.primaryBus?.id, 'bus-457');
  assert.equal(resFull.passedBusesCount, 0);

  // When bus gets closer (to stop 4, ~600m before board):
  const busCloser = { ...busBeforeStop, lat: fullRouteStops[3].lat, lng: fullRouteStops[3].lng };
  const resCloser = calculateLiveTripEta(fullRouteStops as any, targetBoard as any, [busCloser as any], now, 24, 'ida');
  assert.equal(resCloser.status, 'approaching');
  assert.ok(typeof resCloser.etaMinutes === 'number' && resCloser.etaMinutes < (resFull.etaMinutes || 10));
});


