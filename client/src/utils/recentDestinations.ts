import { useState, useEffect } from 'react';

export interface RecentDestination {
  id: string;
  title: string;
  address: string;
  lineCode: string;
  lat?: number;
  lng?: number;
  timestamp?: number;
}

export const RECENT_DESTINATIONS_STORAGE_KEY = 'manaus_recent_destinations';
export const RECENT_DESTINATIONS_EVENT = 'manaus_recent_destinations_updated';

export const DEFAULT_RECENT_DESTINATIONS: RecentDestination[] = [
  {
    id: 'default-t1',
    title: 'Terminal 1 - Constantino Nery',
    address: 'Av. Constantino Nery, 5286 - Centro / Flores',
    lineCode: '640',
    lat: -3.12781,
    lng: -60.02452,
    timestamp: 1
  },
  {
    id: 'default-t4',
    title: 'Terminal 4 - Jorge Teixeira',
    address: 'Av. Camapuã, Jorge Teixeira - Manaus',
    lineCode: '300',
    lat: -3.03512,
    lng: -59.94481,
    timestamp: 2
  },
  {
    id: 'default-baratao',
    title: 'Baratão da Carne - Torres',
    address: 'Av. Governador José Lindoso - Parque 10',
    lineCode: '448',
    lat: -3.0725,
    lng: -60.0012,
    timestamp: 3
  },
  {
    id: 'default-manauara',
    title: 'Manauara Shopping',
    address: 'Av. Mário Ypiranga, 1300 - Adrianópolis',
    lineCode: '652',
    lat: -3.1039,
    lng: -60.0135,
    timestamp: 4
  }
];

export function guessLineCode(title: string, address: string = ''): string {
  const text = `${title} ${address}`.toUpperCase();

  if (text.includes('TERMINAL 1') || text.includes('(T1)') || text.includes('T1 ') || text.includes('SAO JORGE') || text.includes('SÃO JORGE') || text.includes('(E1)')) {
    return '640';
  }
  if (text.includes('TERMINAL 4') || text.includes('(T4)') || text.includes('T4 ') || text.includes('JORGE TEIXEIRA') || text.includes('ARENA') || text.includes('(E2)')) {
    return '300';
  }
  if (text.includes('TERMINAL 2') || text.includes('(T2)') || text.includes('T2 ') || text.includes('CACHOEIRINHA') || text.includes('BARATÃO') || text.includes('BARATAO')) {
    return '448';
  }
  if (text.includes('TERMINAL 3') || text.includes('(T3)') || text.includes('T3 ') || text.includes('CIDADE NOVA') || text.includes('NOEL NUTELS')) {
    return '350';
  }
  if (text.includes('TERMINAL 5') || text.includes('(T5)') || text.includes('T5 ') || text.includes('SAO JOSE') || text.includes('SÃO JOSÉ') || text.includes('MANAUARA') || text.includes('ADRIANÓPOLIS') || text.includes('ADRIANOPOLIS')) {
    return '652';
  }
  if (text.includes('TERMINAL 6') || text.includes('(T6)') || text.includes('T6 ') || text.includes('LAGO AZUL') || text.includes('VIVER MELHOR') || text.includes('SANTA ETELVINA')) {
    return '356';
  }
  if (text.includes('SANTOS DUMONT') || text.includes('(E3)')) {
    return '640';
  }
  if (text.includes('MANÔA') || text.includes('MANOA') || text.includes('(E4)')) {
    return '300';
  }
  if (text.includes('PONTA NEGRA')) {
    return '450';
  }
  if (text.includes('CENTRO') || text.includes('MATRIZ') || text.includes('PRAÇA DA SAUDADE')) {
    return '640';
  }
  if (text.includes('AMAZONAS SHOPPING') || text.includes('DJALMA')) {
    return '640';
  }

  return '640';
}

export function getRecentDestinations(): RecentDestination[] {
  if (typeof window === 'undefined') return DEFAULT_RECENT_DESTINATIONS;
  try {
    const raw = localStorage.getItem(RECENT_DESTINATIONS_STORAGE_KEY);
    if (!raw) return DEFAULT_RECENT_DESTINATIONS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_RECENT_DESTINATIONS;
  } catch {
    return DEFAULT_RECENT_DESTINATIONS;
  }
}

export function saveRecentDestination(dest: Partial<RecentDestination> & { title: string; address?: string }): RecentDestination[] {
  if (typeof window === 'undefined') return [];
  try {
    const cleanTitle = (dest.title || '').trim();
    if (!cleanTitle) return getRecentDestinations();

    const cleanAddress = (dest.address || 'Manaus - AM').trim();
    const current = getRecentDestinations();

    // Check if item already exists to preserve lineCode if not supplied in update
    const existing = current.find(
      (item) => item.title.toLowerCase() === cleanTitle.toLowerCase() || (dest.id && item.id === dest.id)
    );

    const lineCode = dest.lineCode || existing?.lineCode || guessLineCode(cleanTitle, cleanAddress);
    const lat = dest.lat !== undefined ? dest.lat : existing?.lat;
    const lng = dest.lng !== undefined ? dest.lng : existing?.lng;

    const newItem: RecentDestination = {
      id: dest.id || existing?.id || `dest-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: cleanTitle,
      address: cleanAddress,
      lineCode: lineCode,
      lat,
      lng,
      timestamp: Date.now()
    };

    // Filter out existing item with same title or id
    const filtered = current.filter(
      (item) =>
        item.id !== newItem.id &&
        item.title.toLowerCase() !== cleanTitle.toLowerCase()
    );

    // Prepend newly chosen destination to the top
    const updated = [newItem, ...filtered].slice(0, 8);
    localStorage.setItem(RECENT_DESTINATIONS_STORAGE_KEY, JSON.stringify(updated));

    // Dispatch event so HomeTab updates automatically and instantly
    window.dispatchEvent(new CustomEvent(RECENT_DESTINATIONS_EVENT, { detail: updated }));
    return updated;
  } catch (err) {
    console.error('[RecentDestinations] Falha ao salvar destino recente:', err);
    return getRecentDestinations();
  }
}

export function useRecentDestinations(): RecentDestination[] {
  const [destinations, setDestinations] = useState<RecentDestination[]>(getRecentDestinations);

  useEffect(() => {
    const handleUpdate = () => {
      setDestinations(getRecentDestinations());
    };

    window.addEventListener(RECENT_DESTINATIONS_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(RECENT_DESTINATIONS_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return destinations;
}
