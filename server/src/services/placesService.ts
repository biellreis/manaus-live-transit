import fs from 'node:fs';
import path from 'node:path';
import manausAllRoutesStatic from './manausAllRoutesCache.json';

export interface PlaceResult {
  id: string;
  name: string;
  displayName: string;
  category: 'hospital' | 'universidade' | 'shopping' | 'comercio' | 'posto' | 'rua' | 'terminal' | 'outro';
  categoryLabel: string;
  lat: number;
  lng: number;
}

// Catálogo de endereços autênticos e marcos de Manaus para busca instantânea sem dependência externa
const MANAUS_STATIC_PLACES: PlaceResult[] = [
  { id: 'place-kobe', name: 'Rua Kobe', displayName: 'Rua Kobe - Parque 10 de Novembro, Manaus - AM', category: 'rua', categoryLabel: 'Logradouro', lat: -3.07352, lng: -59.99370 },
  { id: 'place-saporo', name: 'Rua Saporo, 286', displayName: 'Rua Saporo, 286 - Parque 10 de Novembro, Manaus - AM', category: 'rua', categoryLabel: 'Logradouro', lat: -3.07296, lng: -59.99460 },
  { id: 'place-imprensa', name: 'Imprensa Oficial do Estado', displayName: 'Imprensa Oficial - R. Doutor Machado, 86 - Centro, Manaus', category: 'outro', categoryLabel: 'Ponto de Interesse', lat: -3.12453, lng: -60.01872 },
  { id: 'place-manauara', name: 'Manauara Shopping', displayName: 'Manauara Shopping - Av. Mário Ypiranga, 1300 - Adrianópolis, Manaus', category: 'shopping', categoryLabel: 'Shopping Center', lat: -3.1038, lng: -60.0125 },
  { id: 'place-amazonas', name: 'Amazonas Shopping Center', displayName: 'Amazonas Shopping - Av. Djalma Batista, 482 - Parque 10 / Chapada, Manaus', category: 'shopping', categoryLabel: 'Shopping Center', lat: -3.09335, lng: -60.02315 },
  { id: 'place-sumauma', name: 'Sumaúma Park Shopping', displayName: 'Sumaúma Park Shopping - Av. Noel Nutels, 1762 - Cidade Nova, Manaus', category: 'shopping', categoryLabel: 'Shopping Center', lat: -3.0360, lng: -60.0070 },
  { id: 'place-ponta-negra-shop', name: 'Shopping Ponta Negra', displayName: 'Shopping Ponta Negra - Av. Coronel Teixeira, 5705 - Ponta Negra, Manaus', category: 'shopping', categoryLabel: 'Shopping Center', lat: -3.0562, lng: -60.0768 },
  { id: 'place-praca-matriz', name: 'Praça da Matriz / Centro Histórico', displayName: 'Praça da Matriz - Av. Eduardo Ribeiro, Centro - Manaus', category: 'outro', categoryLabel: 'Marco Histórico', lat: -3.1365, lng: -60.0245 },
  { id: 'place-t1', name: 'Terminal 1 - Constantino Nery', displayName: 'Terminal T1 - Av. Constantino Nery, Centro - Manaus', category: 'terminal', categoryLabel: 'Terminal de Integração', lat: -3.12781, lng: -60.02452 },
  { id: 'place-t2', name: 'Terminal 2 - Cachoeirinha', displayName: 'Terminal T2 - Av. Carvalho Leal, Cachoeirinha - Manaus', category: 'terminal', categoryLabel: 'Terminal de Integração', lat: -3.12554, lng: -60.00783 },
  { id: 'place-t3', name: 'Terminal 3 - Cidade Nova', displayName: 'Terminal T3 - Av. Noel Nutels, Cidade Nova - Manaus', category: 'terminal', categoryLabel: 'Terminal de Integração', lat: -3.03692, lng: -60.00624 },
  { id: 'place-t4', name: 'Terminal 4 - Jorge Teixeira', displayName: 'Terminal T4 - Av. Camapuã, Jorge Teixeira - Manaus', category: 'terminal', categoryLabel: 'Terminal de Integração', lat: -3.03512, lng: -59.94481 },
  { id: 'place-t5', name: 'Terminal 5 - São José', displayName: 'Terminal T5 - Al. Cosme Ferreira, São José - Manaus', category: 'terminal', categoryLabel: 'Terminal de Integração', lat: -3.08421, lng: -59.96785 },
  { id: 'place-ponta-negra', name: 'Ponta Negra - Orla e Praia', displayName: 'Orla da Ponta Negra - Av. Coronel Teixeira, Ponta Negra, Manaus', category: 'outro', categoryLabel: 'Ponto Turístico', lat: -3.0635, lng: -60.1035 },
  { id: 'place-ufam', name: 'UFAM - Campus Universitário', displayName: 'UFAM - Av. Rodrigo Otávio, 6200 - Coroado, Manaus', category: 'universidade', categoryLabel: 'Universidade', lat: -3.097, lng: -59.995 },
  { id: 'place-uea-est', name: 'UEA - Escola Superior de Tecnologia', displayName: 'UEA EST - Av. Darcy Vargas, 1200 - Parque 10, Manaus', category: 'universidade', categoryLabel: 'Universidade', lat: -3.0988, lng: -60.0175 },
  { id: 'place-h28m', name: 'Hospital 28 de Agosto', displayName: 'Hospital e Pronto Socorro 28 de Agosto - Av. Mário Ypiranga, Adrianópolis', category: 'hospital', categoryLabel: 'Hospital', lat: -3.1075, lng: -60.0142 },
  { id: 'place-h-joao-lucio', name: 'Hospital João Lúcio', displayName: 'Hospital e Pronto Socorro Dr. João Lúcio - Al. Cosme Ferreira, Coroado', category: 'hospital', categoryLabel: 'Hospital', lat: -3.0801, lng: -59.9723 },
  { id: 'place-av-djalma', name: 'Avenida Djalma Batista', displayName: 'Av. Djalma Batista - Chapada / Parque 10, Manaus', category: 'rua', categoryLabel: 'Avenida Principal', lat: -3.0990, lng: -60.0225 },
  { id: 'place-av-constantino', name: 'Avenida Constantino Nery', displayName: 'Av. Constantino Nery - Chapada / São Geraldo / Centro, Manaus', category: 'rua', categoryLabel: 'Avenida Principal', lat: -3.1110, lng: -60.0260 },
  { id: 'place-av-torquato', name: 'Avenida Torquato Tapajós', displayName: 'Av. Torquato Tapajós - Flores / Tarumã, Manaus', category: 'rua', categoryLabel: 'Avenida Principal', lat: -3.0550, lng: -60.0320 },
  { id: 'place-av-mario-ypiranga', name: 'Avenida Mário Ypiranga (Recife)', displayName: 'Av. Mário Ypiranga - Adrianópolis / Flores, Manaus', category: 'rua', categoryLabel: 'Avenida Principal', lat: -3.1020, lng: -60.0130 },
  { id: 'place-av-ephigenio', name: 'Avenida Ephigênio Salles', displayName: 'Av. Ephigênio Salles - Aleixo, Manaus', category: 'rua', categoryLabel: 'Avenida Principal', lat: -3.1005, lng: -60.0005 },
  { id: 'place-av-cosme-ferreira', name: 'Alameda Cosme Ferreira', displayName: 'Al. Cosme Ferreira - Coroado / São José, Manaus', category: 'rua', categoryLabel: 'Avenida Principal', lat: -3.0830, lng: -59.9810 },
  { id: 'place-av-rodrigo-otavio', name: 'Avenida Rodrigo Otávio', displayName: 'Av. Rodrigo Otávio - Japiim / Coroado, Manaus', category: 'rua', categoryLabel: 'Avenida Principal', lat: -3.1120, lng: -59.9880 }
];

// Carregar índice de paradas de ônibus para busca instantânea
let busStopsCache: PlaceResult[] | null = null;
function getBusStopsPlaces(): PlaceResult[] {
  if (busStopsCache) return busStopsCache;
  busStopsCache = [];
  try {
    const raw = (manausAllRoutesStatic && Object.keys(manausAllRoutesStatic).length > 0)
      ? manausAllRoutesStatic
      : null;
    if (raw) {
      const seen = new Set<number>();
      for (const entry of Object.values(raw) as any[]) {
        for (const trip of entry.trips || []) {
          for (const s of trip.stops || []) {
            if (!seen.has(s.stopId) && s.stopName) {
              seen.add(s.stopId);
              busStopsCache.push({
                id: `stop-${s.stopId}`,
                name: s.stopName,
                displayName: `Parada ${s.stopName} (#${s.stopId}) - Manaus`,
                category: 'terminal',
                categoryLabel: 'Parada de Ônibus',
                lat: s.lat,
                lng: s.lng
              });
            }
          }
        }
      }
      return busStopsCache;
    }
    const locations = [
      path.join(__dirname, 'manausAllRoutesCache.json'),
      path.resolve(__dirname, '../../src/services/manausAllRoutesCache.json')
    ];
    for (const loc of locations) {
      if (fs.existsSync(loc)) {
        const fileData = JSON.parse(fs.readFileSync(loc, 'utf8'));
        const seen = new Set<number>();
        for (const entry of Object.values(fileData) as any[]) {
          for (const trip of entry.trips || []) {
            for (const s of trip.stops || []) {
              if (!seen.has(s.stopId) && s.stopName) {
                seen.add(s.stopId);
                busStopsCache.push({
                  id: `stop-${s.stopId}`,
                  name: s.stopName,
                  displayName: `Parada ${s.stopName} (#${s.stopId}) - Manaus`,
                  category: 'terminal',
                  categoryLabel: 'Parada de Ônibus',
                  lat: s.lat,
                  lng: s.lng
                });
              }
            }
          }
        }
        break;
      }
    }
  } catch (err) {
    console.warn('[PlacesService] Uninitialized bus stop places cache');
  }
  return busStopsCache;
}

// Cache em memória para buscas realizadas
const placesCache = new Map<string, { data: PlaceResult[]; expiresAt: number }>();

let geocodingQueue = Promise.resolve();
let lastGeocodingRequest = 0;
function reserveGeocodingRequest() {
  const slot = geocodingQueue.then(async () => {
    await new Promise(resolve => setTimeout(resolve, Math.max(0, 300 - (Date.now() - lastGeocodingRequest))));
    lastGeocodingRequest = Date.now();
  });
  geocodingQueue = slot;
  return slot;
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function classifyOsmType(item: any): { category: PlaceResult['category']; label: string } {
  const osmType = (item.type || '').toLowerCase();
  const osmClass = (item.class || '').toLowerCase();
  const name = (item.name || '').toLowerCase();

  if (osmType.includes('hospital') || osmType.includes('clinic') || name.includes('hospital') || name.includes('pronto socorro') || name.includes('spa ')) {
    return { category: 'hospital', label: 'Hospital / Saúde' };
  }
  if (osmType.includes('university') || osmType.includes('college') || osmType.includes('school') || name.includes('universidade') || name.includes('faculdade') || name.includes('ufam') || name.includes('uea')) {
    return { category: 'universidade', label: 'Universidade / Educação' };
  }
  if (osmType.includes('mall') || name.includes('shopping')) {
    return { category: 'shopping', label: 'Shopping Center' };
  }
  if (osmType.includes('fuel') || name.includes('posto')) {
    return { category: 'posto', label: 'Posto de Combustível' };
  }
  if (osmClass.includes('highway') || osmType.includes('residential') || osmType.includes('primary') || osmType.includes('secondary') || osmType.includes('tertiary')) {
    return { category: 'rua', label: 'Rua / Logradouro' };
  }
  if (osmClass.includes('shop') || osmType.includes('store') || name.includes('loja') || name.includes('mercado')) {
    return { category: 'comercio', label: 'Comércio / Empresa' };
  }
  return { category: 'outro', label: 'Ponto de Interesse' };
}

/**
 * Busca universal de ruas, avenidas, empresas, hospitais, faculdades e paradas de ônibus em Manaus
 */
export async function searchPlacesInManaus(query: string): Promise<PlaceResult[]> {
  const cleanQ = query.trim();
  if (!cleanQ || cleanQ.length < 2) return [];

  const normQ = normalizeText(cleanQ);
  const cacheKey = `places:${normQ}`;
  const cached = placesCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }

  const combinedResults: PlaceResult[] = [];
  const addedIds = new Set<string>();

  // 1. Busca instantânea nos endereços estáticos de Manaus
  for (const staticPlace of MANAUS_STATIC_PLACES) {
    const normName = normalizeText(staticPlace.name);
    const normDisplay = normalizeText(staticPlace.displayName);
    if (normName.includes(normQ) || normDisplay.includes(normQ)) {
      combinedResults.push(staticPlace);
      addedIds.add(staticPlace.id);
    }
  }

  // 2. Busca instantânea no índice de paradas de ônibus de Manaus
  const stopsPlaces = getBusStopsPlaces();
  for (const stopPlace of stopsPlaces) {
    const normStopName = normalizeText(stopPlace.name);
    if (normStopName.includes(normQ)) {
      combinedResults.push(stopPlace);
      addedIds.add(stopPlace.id);
      if (combinedResults.length >= 10) break;
    }
  }

  // 3. Consulta ao serviço de geocodificação geográfica (OpenStreetMap / Nominatim)
  try {
    await reserveGeocodingRequest();
    const searchTarget = cleanQ.toLowerCase().includes('manaus') ? cleanQ : `${cleanQ}, Manaus, Amazonas, Brasil`;
    const osmUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTarget)}&countrycodes=br&addressdetails=1&limit=10`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const resp = await fetch(osmUrl, {
      headers: {
        'User-Agent': 'ManausLiveTransitApp/1.0 (https://github.com/manaus-live-transit)',
        'Accept-Language': 'pt-BR,pt;q=0.9'
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (resp.ok) {
      const osmData = (await resp.json()) as any[];
      if (Array.isArray(osmData)) {
        for (const item of osmData) {
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lon);

          // Validação geográfica estrita de Manaus (-3.25 a -2.85 lat, -60.30 a -59.75 lng)
          if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -3.25 || lat > -2.85 || lng < -60.30 || lng > -59.75) {
            continue;
          }

          const osmId = `osm-${item.place_id}`;
          if (!addedIds.has(osmId)) {
            addedIds.add(osmId);
            const classification = classifyOsmType(item);
            const shortName = item.name || item.display_name.split(',')[0].trim();
            const formattedDisplay = item.display_name.replace(', Brasil', '').trim();

            combinedResults.push({
              id: osmId,
              name: shortName,
              displayName: formattedDisplay,
              category: classification.category,
              categoryLabel: classification.label,
              lat,
              lng
            });
          }
        }
      }
    }
  } catch (err) {
    // Silencioso em caso de indisponibilidade externa; os resultados locais já fornecem resposta rápida
  }

  const finalResults = combinedResults.slice(0, 12);
  placesCache.set(cacheKey, {
    data: finalResults,
    expiresAt: Date.now() + (finalResults.length ? 15 * 60 * 1000 : 15000)
  });
  return finalResults;
}
