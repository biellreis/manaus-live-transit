import { useEffect, useState } from 'react';
import type { LiveBus } from '../types/transit.js';

const RECENT_SNAPSHOT_MS = 30_000;
export type LiveSignalStatus = 'loading' | 'current' | 'interrupted';

export function useLiveVehicles(routeId: string, routeCode: string) {
  const [vehicles, setVehicles] = useState<LiveBus[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [signalStatus, setSignalStatus] = useState<LiveSignalStatus>('loading');

  useEffect(() => {
    setVehicles([]);
    setIsConnected(false);
    setLastUpdated(null);
    setSignalStatus('loading');
    if (!routeId) return;

    let alive = true;
    let polling = false;
    let lastMessage = 0;
    let lastSuccessfulAt = 0;
    const controller = new AbortController();
    const es = new EventSource(`/api/live/stream?routeId=${encodeURIComponent(routeId)}&routeCode=${encodeURIComponent(routeCode)}`);

    const apply = (data: { vehicles?: LiveBus[] }) => {
      if (!alive || !Array.isArray(data.vehicles)) return false;
      lastSuccessfulAt = Date.now();
      setVehicles(data.vehicles);
      setLastUpdated(new Date(lastSuccessfulAt));
      setIsConnected(true);
      setSignalStatus('current');
      return true;
    };

    const signalFailure = () => {
      if (!alive) return;
      if (!lastSuccessfulAt || Date.now() - lastSuccessfulAt > 10_000) {
        setIsConnected(false);
        setSignalStatus('interrupted');
      }
      // A failed request does not mean that every bus vanished. Keep the
      // recent confirmed snapshot briefly, then remove it if the source stays
      // unavailable so old positions are never presented as current.
      if (!lastSuccessfulAt || Date.now() - lastSuccessfulAt > RECENT_SNAPSHOT_MS) {
        setVehicles([]);
        setLastUpdated(null);
      }
    };

    es.onmessage = event => {
      try {
        if (apply(JSON.parse(event.data))) lastMessage = Date.now();
      } catch {
        signalFailure();
      }
    };
    es.onerror = signalFailure;

    const poll = async () => {
      if (polling || (es.readyState === EventSource.OPEN && Date.now() - lastMessage < 10_000)) return;
      polling = true;
      try {
        const response = await fetch(
          `/api/lines/${encodeURIComponent(routeId)}/realtime?code=${encodeURIComponent(routeCode)}`,
          { signal: controller.signal, cache: 'no-store' }
        );
        if (!response.ok) throw new Error('Sinal indisponível');
        const data = await response.json();
        if (Date.now() - lastMessage >= 5_000 && !apply(data)) throw new Error('Resposta inválida');
      } catch {
        signalFailure();
      } finally {
        polling = false;
      }
    };

    void poll();
    const timer = setInterval(poll, 5_000);
    return () => {
      alive = false;
      controller.abort();
      clearInterval(timer);
      es.close();
    };
  }, [routeId, routeCode]);

  return { vehicles, isConnected, lastUpdated, signalStatus };
}
