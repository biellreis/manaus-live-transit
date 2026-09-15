export interface WazeScraperItem {
  recordType?: string; type?: string; alertType?: string; alertSubtype?: string; subtype?: string;
  street?: string; city?: string; latitude?: number; longitude?: number;
  publish_datetime_utc?: string; publishDatetimeUtc?: string; _fetchedAt?: string;
  alertId?: string; alert_id?: string; jamId?: string; uuid?: string;
  alertDescription?: string; jamLevel?: number; level?: number; speedKmh?: number; speed?: number;
}
export interface TrafficSource {
  status: 'connected' | 'updating' | 'unavailable' | 'not_configured';
  name: string; updatedAt: string | null; message: string;
}
interface Snapshot { items: WazeScraperItem[]; source: TrafficSource }
interface Run { id: string; status: string; startedAt: string; finishedAt?: string; defaultDatasetId: string }
const ACTOR = 'sian.agency~waze-traffic-scraper';
const CACHE_MS = 180000;
let cached: Snapshot | null = null;
let expiresAt = 0;
let pending: Promise<Snapshot> | null = null;

export async function fetchWazeLiveItems(): Promise<Snapshot> {
  if (cached && Date.now() < expiresAt) return cached;
  if (pending) return pending;
  pending = loadSnapshot().then(value => {
    cached = value;
    expiresAt = Date.now() + (value.source.status === 'connected' ? CACHE_MS : 15000);
    return value;
  }).finally(() => { pending = null; });
  return pending;
}
async function loadSnapshot(): Promise<Snapshot> {
  const token = process.env.APIFY_API_TOKEN;
  const source: TrafficSource = { name: 'Monitoramento em Tempo Real', status: 'not_configured', updatedAt: null, message: 'Fonte de ocorrências não configurada.' };
  if (!token) return {items: [], source};
  const request = async (path: string, init: RequestInit = {}) => {
    const response = await fetch(`https://api.apify.com/v2/${path}`, {
      ...init, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(15000)
    });
    if (!response.ok) throw new Error(`Apify HTTP ${response.status}`);
    return response.json();
  };
  try {
    // Reuse the actor's last run across serverless instances. Refresh is on
    // demand, not a new paid run per visitor or per 30-second screen refresh.
    const history = await request(`acts/${ACTOR}/runs?desc=true&limit=5`) as {data:{items:Run[]}};
    const runs = history.data.items;
    let run = runs.find(r => r.status === 'SUCCEEDED');
    const latest = runs[0];
    const running = latest && ['READY','RUNNING','TIMING-OUT','ABORTING'].includes(latest.status);
    if (!running && (!latest || Date.now() - Date.parse(latest.startedAt) > CACHE_MS)) {
      const started = await request(`acts/${ACTOR}/runs?waitForFinish=1&timeout=60&maxTotalChargeUsd=0.05`, {
        method: 'POST', body: JSON.stringify({
          operation: 'alertsAndJams', bottomLeft: '-3.2000,-60.1500', topRight: '-2.9000,-59.8500',
          maxAlerts: 100, maxJams: 100
        })
      }) as {data:Run};
      if (started.data.status === 'SUCCEEDED') run = started.data;
      else source.status = 'updating';
    } else if (running) source.status = 'updating';
    const updatedAt = run?.finishedAt || run?.startedAt;
    if (!run || !updatedAt || Date.now() - Date.parse(updatedAt) > 15 * 60000) {
      return {items: [], source: {...source, status: source.status === 'updating' ? 'updating' : 'unavailable', message: source.status === 'updating' ? 'Buscando ocorrências recentes. A lista será atualizada automaticamente.' : 'Não há uma coleta recente disponível. Tente atualizar em instantes.'}};
    }
    const items = await request(`datasets/${run.defaultDatasetId}/items?clean=true&limit=200`) as WazeScraperItem[];
    if (!Array.isArray(items)) throw new Error('Invalid dataset');
    return {items, source: {...source, updatedAt, status: source.status === 'updating' ? 'updating' : 'connected', message: source.status === 'updating' ? 'Atualizando ocorrências; exibindo a última coleta.' : 'Ocorrências recebidas em tempo real.'}};
  } catch (error) {
    console.warn('[Traffic] Apify unavailable:', error instanceof Error ? error.message : 'Request failed');
    return {items: [], source: {...source, status:'unavailable', message:'Não foi possível consultar as ocorrências agora. Toque em atualizar para tentar novamente.'}};
  }
}
