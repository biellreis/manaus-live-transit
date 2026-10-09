import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchTomTomTrafficIncidents } from '../server/src/services/tomtomTrafficSource.js';

const originalFetch = globalThis.fetch;
const originalKey = process.env.TOMTOM_API_KEY;

function incident(id: string, iconCategory: string, overrides: Record<string, unknown> = {}) {
  return {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [-60.02, -3.1] },
    properties: {
      id, iconCategory, magnitudeOfDelay: 'moderate',
      events: [{ description: `Provider report for ${id}`, code: 101, iconCategory }],
      startTime: new Date(Date.now() - 60_000).toISOString(),
      endTime: null, from: 'Av. Brasil', to: 'Rua A',
      lengthInMeters: 600, delayInSeconds: 180, timeValidity: 'present',
      probabilityOfOccurrence: 'certain', numberOfReports: 2, lastReportTime: null,
      ...overrides
    }
  };
}

test.after(() => {
  globalThis.fetch = originalFetch;
  if (originalKey === undefined) delete process.env.TOMTOM_API_KEY;
  else process.env.TOMTOM_API_KEY = originalKey;
});

test('requests the verified Orbis v2 fields and maps provider categories without inventing incident details', async () => {
  process.env.TOMTOM_API_KEY = 'tomtom-test-categories';
  const now = Date.now();
  let calls = 0;
  globalThis.fetch = async (input, init) => {
    calls++;
    const url = String(input);
    assert.equal(url, 'https://api.tomtom.com/maps/orbis/traffic/incidents/details?apiVersion=2&bbox=-60.20,-3.20,-59.80,-2.85&timeValidity=present');
    assert.ok(!url.includes('tomtom-test-categories'));
    const headers = init?.headers as Record<string, string>;
    assert.equal(headers['TomTom-Api-Key'], 'tomtom-test-categories');
    assert.match(headers.Attributes, /^incidents\(type,geometry\(type,coordinates\),properties\(id,iconCategory,/);
    assert.ok(headers.Attributes.includes('lastReportTime'));
    assert.equal(headers['Accept-Language'], undefined);
    return Response.json({ incidents: [
      { ...incident('jam-1', 'jam'), geometry: { type: 'LineString', coordinates: [[-60.03, -3.11], [-60.02, -3.1], [-60.01, -3.09]] } },
      incident('works-1', 'roadWorks'),
      incident('closed-1', 'roadClosed', { magnitudeOfDelay: 'undefined', delayInSeconds: null }),
      incident('accident-1', 'accident'),
      incident('future-1', 'jam', { timeValidity: 'future' }),
      incident('starts-later', 'jam', { startTime: new Date(now + 60_000).toISOString() }),
      incident('ended', 'roadWorks', { endTime: new Date(now - 60_000).toISOString() })
    ] });
  };

  const snapshot = await fetchTomTomTrafficIncidents();
  assert.equal(calls, 1);
  assert.equal(snapshot.source.name, 'TomTom Traffic');
  assert.equal(snapshot.source.status, 'connected');
  assert.ok(snapshot.source.updatedAt && Math.abs(Date.parse(snapshot.source.updatedAt) - now) < 10_000);
  assert.deepEqual(snapshot.incidents.map(item => [item.id, item.category, item.severity]), [
    ['jam-1', 'jams', 'warning'],
    ['works-1', 'accidents', 'warning'],
    ['closed-1', 'accidents', 'critical'],
    ['accident-1', 'accidents', 'critical']
  ]);
  assert.deepEqual([snapshot.incidents[0].longitude, snapshot.incidents[0].latitude], [-60.02, -3.1]);
  assert.equal(snapshot.incidents[0].description, 'Provider report for jam-1');
  assert.equal(snapshot.incidents[0].from, 'Av. Brasil');
  assert.equal(snapshot.incidents[2].delayInSeconds, null);
});

test('missing credentials and malformed provider payloads expose no incidents', async () => {
  delete process.env.TOMTOM_API_KEY;
  globalThis.fetch = async () => { throw new Error('fetch must not run without a key'); };
  const missing = await fetchTomTomTrafficIncidents();
  assert.deepEqual(missing.incidents, []);
  assert.equal(missing.source.status, 'not_configured');
  assert.equal(missing.source.updatedAt, null);

  const invalidBodies = [
    { detailedError: { code: 'INVALID_REQUEST' } },
    { incidents: 'not-an-array' },
    { incidents: [incident('good', 'jam'), { ...incident('bad', 'jam'), geometry: { type: 'LineString', coordinates: [[-60.02, -3.1], ['invalid', -3.1]] } }] }
  ];
  for (const [index, body] of invalidBodies.entries()) {
    process.env.TOMTOM_API_KEY = `tomtom-test-invalid-${index}`;
    globalThis.fetch = async () => Response.json(body);
    const result = await fetchTomTomTrafficIncidents();
    assert.equal(result.source.status, 'unavailable');
    assert.equal(result.source.updatedAt, null);
    assert.deepEqual(result.incidents, []);
  }
});

test('shares in-flight work, caches successes for 20 minutes, and retries immediately after a failure', async () => {
  process.env.TOMTOM_API_KEY = 'tomtom-test-cache';
  const actualNow = Date.now;
  let clock = actualNow();
  Date.now = () => clock;
  let calls = 0;
  let releaseFirst: ((response: Response) => void) | undefined;
  globalThis.fetch = async () => {
    calls++;
    if (calls === 1) return new Promise<Response>(resolve => { releaseFirst = resolve; });
    if (calls === 3) return new Response('unavailable', { status: 503 });
    return Response.json({ incidents: [incident(`jam-${calls}`, 'jam')] });
  };
  try {
    const first = fetchTomTomTrafficIncidents();
    const second = fetchTomTomTrafficIncidents();
    assert.equal(calls, 1);
    assert.ok(releaseFirst);
    releaseFirst(Response.json({ incidents: [incident('jam-1', 'jam', { endTime: new Date(clock + 60_000).toISOString() })] }));
    const [a, b] = await Promise.all([first, second]);
    assert.deepEqual(a, b);
    assert.equal(a.source.status, 'connected');

    clock += 20 * 60_000 - 1;
    const cached = await fetchTomTomTrafficIncidents();
    assert.equal(calls, 1);
    assert.equal(cached.source.updatedAt, a.source.updatedAt);
    assert.deepEqual(cached.incidents, [], 'a known elapsed incident must not remain visible during the cache window');

    clock += 1;
    const refreshed = await fetchTomTomTrafficIncidents();
    assert.equal(calls, 2);
    assert.deepEqual(refreshed.incidents.map(item => item.id), ['jam-2']);
    assert.notEqual(refreshed.source.updatedAt, a.source.updatedAt);

    clock += 20 * 60_000;
    const failed = await fetchTomTomTrafficIncidents();
    assert.equal(calls, 3);
    assert.equal(failed.source.status, 'unavailable');
    assert.equal(failed.source.updatedAt, null);
    assert.deepEqual(failed.incidents, []);

    const recovered = await fetchTomTomTrafficIncidents();
    assert.equal(calls, 4);
    assert.equal(recovered.source.status, 'connected');
    assert.deepEqual(recovered.incidents.map(item => item.id), ['jam-4']);
  } finally {
    Date.now = actualNow;
  }
});
