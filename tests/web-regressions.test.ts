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
