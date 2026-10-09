import test from 'node:test';
import assert from 'node:assert/strict';
import { rasterThemePaint } from '../client/src/hooks/useMapTheme.js';
import { getLiveTrafficAlerts } from '../server/src/services/trafficAlertsService.js';
import { hasActiveAlertEndTime, hasFreshAlertSource } from '../client/src/utils/trafficAlertFreshness.js';

test('cached incidents require a recent successful source', () => {
  const now = Date.parse('2026-10-09T12:00:00Z');
  assert.equal(hasFreshAlertSource({ status: 'connected', updatedAt: new Date(now - 25 * 60_000).toISOString() }, now), true);
  assert.equal(hasFreshAlertSource({ status: 'updating', updatedAt: new Date(now - 30 * 60_000).toISOString() }, now), true);
  assert.equal(hasFreshAlertSource({ status: 'updating', updatedAt: new Date(now - 31 * 60_000).toISOString() }, now), false);
  assert.equal(hasFreshAlertSource({ status: 'unavailable', updatedAt: new Date(now - 60_000).toISOString() }, now), false);
  assert.equal(hasFreshAlertSource({ status: 'connected', updatedAt: new Date(now + 60_000).toISOString() }, now), false);
  assert.equal(hasFreshAlertSource({ status: 'connected', updatedAt: 'invalid' }, now), false);
});

test('an incident with a known end time disappears after it ends, even in a cached response', () => {
  const now = Date.parse('2026-10-09T12:00:00Z');
  assert.equal(hasActiveAlertEndTime(new Date(now + 60_000).toISOString(), now), true);
  assert.equal(hasActiveAlertEndTime(new Date(now - 60_000).toISOString(), now), false);
  assert.equal(hasActiveAlertEndTime(null, now), true);
  assert.equal(hasActiveAlertEndTime('invalid', now), false);
});

test('dark and light use different raster palettes without changing route colors', () => {
  assert.deepEqual(rasterThemePaint(true), {'raster-saturation':-1,'raster-brightness-min':0.85,'raster-brightness-max':0.05});
  assert.deepEqual(rasterThemePaint(false), {'raster-saturation':0,'raster-brightness-min':0,'raster-brightness-max':1});
});

test('alerts publish only present TomTom incidents without inferred traffic summaries', async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.TOMTOM_API_KEY;
  const recent = new Date(Date.now() - 5 * 60_000).toISOString();
  process.env.TOMTOM_API_KEY = 'integration-test-key';
  let calls = 0;
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    assert.ok(url.startsWith('https://api.tomtom.com/maps/orbis/traffic/incidents/details?'));
    assert.ok(!url.includes('integration-test-key'));
    assert.equal((init?.headers as Record<string,string>)['TomTom-Api-Key'], 'integration-test-key');
    calls++;
    const feature = (id: string, iconCategory: string) => ({
      type: 'Feature', geometry: { type: 'Point', coordinates: [-60.02, -3.1] },
      properties: { id, iconCategory, magnitudeOfDelay: 'moderate',
        events: [{ description: iconCategory, code: 101, iconCategory }],
        startTime: recent, endTime: null, from: 'Avenida Brasil', to: 'Rua A',
        lengthInMeters: 500, delayInSeconds: 120, timeValidity: 'present',
        probabilityOfOccurrence: 'certain', numberOfReports: 1, lastReportTime: null }
    });
    return Response.json({ incidents: [feature('jam', 'jam'), feature('works', 'roadWorks'), feature('closed', 'roadClosed')] });
  };
  try {
    const data = await getLiveTrafficAlerts();
    assert.equal(data.source.name, 'TomTom Traffic');
    assert.equal(data.source.status, 'connected');
    assert.deepEqual(data.alerts.map(a => a.category), ['jams', 'accidents', 'accidents']);
    assert.match(data.alerts[1].description, /Obras na via/);
    assert.doesNotMatch(data.alerts[1].description, /interditada/i);
    assert.match(data.alerts[2].description, /Via interditada/);
    assert.equal(data.alerts[0].timestamp, new Date(recent).toLocaleString('pt-BR', { timeZone:'America/Manaus', day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' }));
    assert.equal(data.alerts[0].corridorName, 'Avenida Brasil');
    assert.equal(data.alerts[0].description, 'Lentidão no trânsito. Trecho entre Avenida Brasil e Rua A. Atraso estimado de 2 min.');
    assert.equal('summary' in data, false);
    assert.equal('corridors' in data, false);
    assert.equal(calls, 1, 'one provider request; no bus or OSRM probes');
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.TOMTOM_API_KEY;
    else process.env.TOMTOM_API_KEY = originalKey;
  }
});
