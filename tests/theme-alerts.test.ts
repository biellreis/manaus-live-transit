import test from 'node:test';
import assert from 'node:assert/strict';
import { rasterThemePaint } from '../client/src/hooks/useMapTheme.js';
import { getLiveTrafficAlerts } from '../server/src/services/trafficAlertsService.js';
import { fetchWazeLiveItems } from '../server/src/services/apifyTrafficSource.js';
import { sinetram } from '../server/src/services/sinetramClient.js';

test('dark and light use different raster palettes without changing route colors', () => {
  assert.deepEqual(rasterThemePaint(true), {'raster-saturation':-1,'raster-brightness-min':0.85,'raster-brightness-max':0.05});
  assert.deepEqual(rasterThemePaint(false), {'raster-saturation':0,'raster-brightness-min':0,'raster-brightness-max':1});
});

test('Apify uses existing fresh data, maps jams and categories, excludes potholes and static alerts', async () => {
  const originalFetch = globalThis.fetch;
  const originalVehicles = sinetram.getCitywideVehicles;
  const originalToken = process.env.APIFY_API_TOKEN;
  process.env.APIFY_API_TOKEN = 'test-token';
  sinetram.getCitywideVehicles = async () => [];
  let calls = 0;
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    if (!url.startsWith('https://api.apify.com/')) return Response.json({routes:[]});
    calls++;
    assert.ok(!url.includes('test-token'));
    assert.equal((init?.headers as Record<string,string>).Authorization, 'Bearer test-token');
    assert.notEqual(init?.method, 'POST', 'fresh data must not start another paid run');
    if (url.includes('/runs?')) return Response.json({data:{items:[{id:'run',status:'SUCCEEDED',startedAt:new Date().toISOString(),finishedAt:new Date().toISOString(),defaultDatasetId:'data'}]}});
    return Response.json([
      {recordType:'jam',street:'Av. Brasil',city:'Manaus',publishDatetimeUtc:'2026-09-14T18:00:00Z'},
      {type:'POLICE',street:'Av. Manicoré',city:'Manaus'},
      {type:'HAZARD',subtype:'HAZARD_ON_ROAD_CONSTRUCTION',street:'Rua A',city:'Manaus'},
      {type:'HAZARD',subtype:'HAZARD_ON_ROAD_POT_HOLE',street:'Rua B',city:'Manaus'},
      {type:'ACCIDENT',street:'Rua C',city:'Outra cidade'}
    ]);
  };
  try {
    const data = await getLiveTrafficAlerts();
    assert.equal(data.source.status,'connected');
    assert.deepEqual(data.alerts.map(a=>a.category),['jams','police','accidents']);
    assert.match(data.alerts[0].timestamp,/14:00/);
    assert.ok(data.alerts.every(a=>!a.description.includes('confirmada') && !a.title.includes('IMMU')));
    await fetchWazeLiveItems();
    assert.equal(calls,2);
  } finally {
    globalThis.fetch=originalFetch; sinetram.getCitywideVehicles=originalVehicles;
    if (originalToken === undefined) delete process.env.APIFY_API_TOKEN; else process.env.APIFY_API_TOKEN=originalToken;
  }
});
