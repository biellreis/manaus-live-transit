import test from 'node:test';
import assert from 'node:assert/strict';
import { getTrafficAlertBadge, getTrafficAlertSourceText } from '../client/src/utils/trafficAlertPresentation.js';

const now = Date.parse('2026-10-09T12:00:00Z');
const recent = new Date(now - 25 * 60_000).toISOString();
const stale = new Date(now - 31 * 60_000).toISOString();

test('source text attributes the API provider and uses only a recent collection time', () => {
  const options = { isLoading: false, hasData: true, loadError: false, now };
  const freshSource = {
    status: 'connected' as const,
    updatedAt: recent,
    name: 'Ocorrências do Waze',
    message: 'Coleta recente de ocorrências do Waze.'
  };
  const text = getTrafficAlertSourceText(freshSource, options);
  assert.equal(text, 'Ocorrências do Waze · Última coleta: 09/10 às 07:35');
  assert.equal(getTrafficAlertSourceText({ ...freshSource, name: 'TomTom Traffic' }, options), 'TomTom Traffic · Última coleta: 09/10 às 07:35');
  assert.equal(getTrafficAlertSourceText({ ...freshSource, status: 'updating' }, options), 'Ocorrências do Waze · Atualizando ocorrências; última coleta: 09/10 às 07:35');
  assert.equal(getTrafficAlertSourceText({ ...freshSource, updatedAt: stale }, options), 'Ocorrências do Waze · Lista de ocorrências indisponível ou sem atualização recente.');
  assert.equal(getTrafficAlertSourceText({ ...freshSource, updatedAt: stale, status: 'updating' }, options), 'Ocorrências do Waze · Buscando ocorrências recentes…');
  assert.equal(getTrafficAlertSourceText({ status: 'not_configured', updatedAt: null }, options), 'Fonte de ocorrências não configurada.');
  assert.equal(getTrafficAlertSourceText({ status: 'connected', updatedAt: recent }, options), 'Última coleta: 09/10 às 07:35');
});

test('network failure mentions a cached collection only while it is recent', () => {
  const options = { isLoading: false, hasData: true, loadError: true, now };
  assert.match(getTrafficAlertSourceText({ status: 'connected', updatedAt: recent }, options), /última coleta recente/);
  assert.doesNotMatch(getTrafficAlertSourceText({ status: 'connected', updatedAt: stale }, options), /coleta recente/);
  assert.equal(getTrafficAlertSourceText(undefined, { ...options, isLoading: true, hasData: false }), 'Consultando a lista de ocorrências…');
});

test('badges describe reported categories without inferring severity or road conditions', () => {
  assert.deepEqual(getTrafficAlertBadge('accidents'), { kind: 'accidents', label: 'OCORRÊNCIA NA VIA' });
  assert.deepEqual(getTrafficAlertBadge('jams'), { kind: 'jams', label: 'LENTIDÃO REPORTADA' });
  assert.deepEqual(getTrafficAlertBadge('police'), { kind: 'police', label: 'POLÍCIA REPORTADA' });
  assert.deepEqual(getTrafficAlertBadge('hazards'), { kind: 'hazards', label: 'PERIGO REPORTADO' });
  assert.deepEqual(getTrafficAlertBadge(undefined), { kind: 'other', label: 'OCORRÊNCIA REPORTADA' });
});
