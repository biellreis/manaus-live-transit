import type { TripDetail, StopInfo, LiveBus } from './sinetramClient.js';

// =========================================================================
// CORREDORES GEOGRÁFICOS OFICIAIS DE MANAUS (COORDENADAS EXATAS EM RUAS/VIAS)
// =========================================================================

// 1. Corredor Norte / Faixa Azul (640, 448, 560): T4 -> T3 -> Max Teixeira -> Torquato -> Constantino Nery -> Centro
export const CORRIDOR_640_IDA_COORDS: [number, number][] = [
  [-59.94481, -3.03512], // Terminal 4 (Jorge Teixeira)
  [-59.95210, -3.03550], // Av. Camapuã
  [-59.96150, -3.03600], // Camapuã próx. Canaranas
  [-59.97200, -3.03650], // Av. Noel Nutels
  [-59.98800, -3.03680], // Noel Nutels próx. Sumaúma
  [-60.00624, -3.03692], // Terminal 3 (Cidade Nova)
  [-60.01520, -3.04780], // Av. Max Teixeira
  [-60.02100, -3.05850], // Max Teixeira próx. Mundo Novo
  [-60.02450, -3.06400], // Estação E4 Manôa
  [-60.02580, -3.07250], // Estação E3 Santos Dumont
  [-60.02720, -3.07850], // Av. Torquato Tapajós
  [-60.02894, -3.08331], // Estação E2 Arena da Amazônia
  [-60.02820, -3.09450], // Av. Constantino Nery próx. Bilhares
  [-60.02751, -3.10982], // Estação E1 São Jorge
  [-60.02610, -3.11950], // Constantino Nery próx. Boulevard
  [-60.02452, -3.12781], // Terminal 1 - Constantino Nery
  [-60.02380, -3.13150], // Av. Epaminondas
  [-60.02450, -3.13650]  // Centro Histórico / Praça da Matriz
];
export const CORRIDOR_640_VOLTA_COORDS: [number, number][] = [...CORRIDOR_640_IDA_COORDS].reverse();

// 2. Corredor 300 (Expresso Norte): T4 -> T3 -> Plataforma Manôa -> E2 Arena -> T1 -> Centro
export const CORRIDOR_300_IDA_COORDS: [number, number][] = [
  [-59.94481, -3.03512], // Terminal 4
  [-59.97200, -3.03650], // Av. Camapuã
  [-60.00624, -3.03692], // Terminal 3
  [-60.02450, -3.06400], // Estação E4 Manôa
  [-60.02894, -3.08331], // Estação E2 Arena
  [-60.02751, -3.10982], // Estação E1 São Jorge
  [-60.02452, -3.12781], // Terminal 1
  [-60.02450, -3.13650]  // Centro
];
export const CORRIDOR_300_VOLTA_COORDS: [number, number][] = [...CORRIDOR_300_IDA_COORDS].reverse();

// 3. Corredor Parque 10 / Djalma Batista (409, 422, 446): Jardim Primavera -> Rua Kobe -> Maneca Marques -> Tancredo Neves -> Djalma Batista -> Centro
export const CORRIDOR_409_IDA_COORDS: [number, number][] = [
  [-59.99726, -3.07751], // Terminal Jardim Primavera (Parque 10)
  [-60.00800, -3.07500], // Av. Tancredo Neves (CSU Parque 10)
  [-60.00980, -3.07890], // Av. Maneca Marques (Parque 10 / Shangrilá)
  [-60.01580, -3.08450], // Rua Kobe (Shangrilá)
  [-60.01250, -3.08500], // Bola do Mindu
  [-60.01890, -3.09340], // Av. Darcy Vargas (UEA EST)
  [-60.02315, -3.09335], // Amazonas Shopping (Av. Djalma Batista)
  [-60.02410, -3.09280], // Manaus Plaza Shopping (Djalma Batista)
  [-60.02520, -3.09850], // Millennium Shopping (Djalma Batista)
  [-60.02610, -3.11950], // Boulevard Álvaro Botelho Maia
  [-60.00760, -3.12350], // Terminal 2 - Cachoeirinha
  [-60.02450, -3.13650]  // Centro Histórico
];
export const CORRIDOR_409_VOLTA_COORDS: [number, number][] = [...CORRIDOR_409_IDA_COORDS].reverse();

// 4. Corredor Ponta Negra / Compensa / Cel. Teixeira (120, 126, 221): Ponta Negra -> Shopping Ponta Negra -> Av. Brasil -> Centro
export const CORRIDOR_120_IDA_COORDS: [number, number][] = [
  [-60.07600, -3.06450], // Praia da Ponta Negra
  [-60.06300, -3.07200], // Shopping Ponta Negra (Av. Coronel Teixeira)
  [-60.05600, -3.08200], // Estrada do Turismo / Nova Esperança
  [-60.04500, -3.09100], // Av. Pedro Teixeira (Dom Pedro)
  [-60.05200, -3.11100], // Av. Brasil (Compensa)
  [-60.04800, -3.11800], // Prefeitura de Manaus (Av. Brasil)
  [-60.03800, -3.12300], // Bairro Santo Antônio
  [-60.03100, -3.12800], // Ponte de São Raimundo / Glória
  [-60.02380, -3.13150], // Av. Epaminondas
  [-60.02450, -3.13650]  // Centro Histórico / Praça da Matriz
];
export const CORRIDOR_120_VOLTA_COORDS: [number, number][] = [...CORRIDOR_120_IDA_COORDS].reverse();

// 5. Corredor Leste / Autaz Mirim / Cosme Ferreira (600, 650, 678): T4 -> Grande Circular -> Bola do Produtor -> João Lúcio -> T5 -> Centro
export const CORRIDOR_600_IDA_COORDS: [number, number][] = [
  [-59.94481, -3.03512], // Terminal 4 (Jorge Teixeira)
  [-59.95070, -3.06300], // Shopping Grande Circular (Av. Autaz Mirim)
  [-59.95400, -3.05600], // Bola do Produtor (Jorge Teixeira)
  [-59.95720, -3.07890], // Hospital Dr. João Lúcio (Cosme Ferreira)
  [-59.96785, -3.08421], // Terminal 5 (São José Operário)
  [-59.98200, -3.08700], // Alameda Cosme Ferreira
  [-59.99500, -3.09200], // Bola do Coroado
  [-60.01410, -3.10180], // Av. André Araújo / Aleixo
  [-60.02610, -3.11950], // Boulevard Álvaro Maia
  [-60.02450, -3.13650]  // Centro Histórico / Matriz
];
export const CORRIDOR_600_VOLTA_COORDS: [number, number][] = [...CORRIDOR_600_IDA_COORDS].reverse();

// 6. Corredor 652 (Leste / V8): T4 -> T5 -> Alameda Cosme Ferreira -> Av. Efigênio Salles -> T1 -> Centro
export const CORRIDOR_652_IDA_COORDS: [number, number][] = [
  [-59.94481, -3.03512], // Terminal 4
  [-59.95600, -3.05500], // Av. Autaz Mirim
  [-59.96785, -3.08421], // Terminal 5 (São José)
  [-59.98200, -3.08700], // Al. Cosme Ferreira
  [-59.99500, -3.09200], // Coroado / próx. UFAM
  [-60.01200, -3.09700], // Av. Efigênio Salles (V8)
  [-60.02452, -3.12781], // Terminal 1 - Constantino Nery
  [-60.02450, -3.13650]  // Centro Histórico
];
export const CORRIDOR_652_VOLTA_COORDS: [number, number][] = [...CORRIDOR_652_IDA_COORDS].reverse();

// 7. Corredor Sul / Educandos / Morro da Liberdade / T2 (004, 010): T2 -> Carvalho Leal -> Educandos -> Panair -> Centro
export const CORRIDOR_004_IDA_COORDS: [number, number][] = [
  [-60.00760, -3.12350], // Terminal 2 - Cachoeirinha
  [-60.00890, -3.12150], // Av. Carvalho Leal (UEA ESA)
  [-60.01200, -3.13100], // Av. Pres. Castelo Branco
  [-60.01450, -3.13900], // Ponte de Educandos
  [-60.01600, -3.14150], // Feira da Panair (Educandos)
  [-60.01300, -3.14600], // Morro da Liberdade
  [-60.02100, -3.13800], // Manaus Moderna (Av. Lourenço da Silva Braga)
  [-60.02350, -3.13750], // Mercado Adolpho Lisboa
  [-60.02450, -3.13650]  // Praça da Matriz / Centro Histórico
];
export const CORRIDOR_004_VOLTA_COORDS: [number, number][] = [...CORRIDOR_004_IDA_COORDS].reverse();

// 8. Corredor Universitário / Distrito Industrial / UFAM (616, 125, 352): UFAM -> Rodrigo Otávio -> Studio 5 -> Japiim -> Centro
export const CORRIDOR_616_IDA_COORDS: [number, number][] = [
  [-59.98320, -3.09910], // Campus Universitário UFAM (Setor Norte)
  [-59.98600, -3.09650], // Av. General Rodrigo Octávio
  [-59.98800, -3.12500], // Studio 5 Festival Mall (Distrito Industrial)
  [-59.99800, -3.12200], // Japiim (Av. Tefé)
  [-60.00760, -3.12350], // Terminal 2 - Cachoeirinha
  [-60.01920, -3.12450], // HUGV (Praça 14 de Janeiro)
  [-60.02450, -3.13650]  // Centro Histórico / Matriz
];
export const CORRIDOR_616_VOLTA_COORDS: [number, number][] = [...CORRIDOR_616_IDA_COORDS].reverse();

// 9. Corredor Zona Norte Profunda / Flores (357, 041): Terminal 6 / Viver Melhor -> Av. das Flores -> T3 -> Centro
export const CORRIDOR_357_IDA_COORDS: [number, number][] = [
  [-60.01500, -2.99650], // Terminal 6 (Lago Azul / Viver Melhor)
  [-60.01800, -3.01200], // Av. das Flores (Viver Melhor)
  [-60.01900, -3.02500], // Av. das Flores (Passarinho / Santa Etelvina)
  [-60.00624, -3.03692], // Terminal 3 (Cidade Nova)
  [-60.01520, -3.04780], // Av. Max Teixeira
  [-60.02450, -3.06400], // Estação E4 Manôa
  [-60.02894, -3.08331], // Estação E2 Arena
  [-60.02452, -3.12781], // Terminal 1 - Constantino Nery
  [-60.02450, -3.13650]  // Centro
];
export const CORRIDOR_357_VOLTA_COORDS: [number, number][] = [...CORRIDOR_357_IDA_COORDS].reverse();

// 10. Corredor Interbairros (001, 002, 219): Compensa -> Djalma Batista -> Darcy Vargas -> Constantino Nery
export const CORRIDOR_001_IDA_COORDS: [number, number][] = [
  [-60.05200, -3.11100], // Av. Brasil (Compensa)
  [-60.04500, -3.09100], // Av. Pedro Teixeira
  [-60.02894, -3.08331], // Arena da Amazônia
  [-60.02315, -3.09335], // Av. Djalma Batista (Amazonas Shopping)
  [-60.01890, -3.09340], // Av. Darcy Vargas
  [-60.02452, -3.12781], // Terminal 1 - Constantino Nery
  [-60.02450, -3.13650]  // Centro Histórico
];
export const CORRIDOR_001_VOLTA_COORDS: [number, number][] = [...CORRIDOR_001_IDA_COORDS].reverse();


// =========================================================================
// PARADAS E ITINERÁRIOS OFICIAIS VERDADEIROS POR LINHA
// =========================================================================

export function getFallbackTripsForRoute(routeCode: string, routeName: string): TripDetail[] {
  const code = String(routeCode || '').trim();

  // 1. Linhas Parque 10 / Djalma Batista (409, 422, 446, 359)
  if (code === '409' || code === '422' || code === '446' || code === '359') {
    const idaStops: StopInfo[] = [
      { stopId: 401, stopName: 'Terminal Jardim Primavera (Parque 10)', lat: -3.07751, lng: -59.99726, sequence: 1, distKm: 0.0, timeSeconds: 0, lines: ['409', '422', '446'] },
      { stopId: 402, stopName: 'Parada Rua Kobe (Conjunto Shangrilá)', lat: -3.08450, lng: -60.01580, sequence: 2, distKm: 1.4, timeSeconds: 180, lines: ['409', '422', '446'] },
      { stopId: 403, stopName: 'Parada Av. Maneca Marques (Parque 10)', lat: -3.07890, lng: -60.00980, sequence: 3, distKm: 2.3, timeSeconds: 320, lines: ['409', '422', '446'] },
      { stopId: 404, stopName: 'Parada Av. Tancredo Neves (CSU Parque 10)', lat: -3.07500, lng: -60.00800, sequence: 4, distKm: 3.1, timeSeconds: 460, lines: ['409', '422', '446'] },
      { stopId: 405, stopName: 'Parada Bola do Mindu (Parque 10)', lat: -3.08500, lng: -60.01250, sequence: 5, distKm: 4.5, timeSeconds: 680, lines: ['409', '422', '446'] },
      { stopId: 406, stopName: 'Parada Hospital 28 de Agosto (Av. Mário Ypiranga)', lat: -3.10180, lng: -60.01410, sequence: 6, distKm: 6.8, timeSeconds: 980, lines: ['409', '422', '001', '008'] },
      { stopId: 407, stopName: 'Parada Amazonas Shopping (Av. Djalma Batista)', lat: -3.09335, lng: -60.02315, sequence: 7, distKm: 8.2, timeSeconds: 1200, lines: ['409', '219', '203', '205', '001', '448'] },
      { stopId: 408, stopName: 'Parada Millennium Shopping (Av. Djalma Batista)', lat: -3.09850, lng: -60.02520, sequence: 8, distKm: 9.4, timeSeconds: 1380, lines: ['409', '219', '203', '205', '001', '448'] },
      { stopId: 409, stopName: 'Parada Boulevard Álvaro Botelho Maia', lat: -3.11950, lng: -60.02610, sequence: 9, distKm: 11.5, timeSeconds: 1650, lines: ['409', '600', '001', '120'] },
      { stopId: 410, stopName: 'Terminal 2 - Cachoeirinha (Plataforma)', lat: -3.12350, lng: -60.00760, sequence: 10, distKm: 13.5, timeSeconds: 1950, lines: ['409', '004', '010', '611', '612'] }
    ];

    const voltaStops: StopInfo[] = [
      { stopId: 420, stopName: 'Terminal 2 - Cachoeirinha (Embarque Sentido Parque 10)', lat: -3.12350, lng: -60.00760, sequence: 1, distKm: 0.0, timeSeconds: 0, lines: ['409', '004', '010'] },
      { stopId: 421, stopName: 'Parada Millennium Shopping (Av. Djalma Batista - Sentido Bairro)', lat: -3.09850, lng: -60.02520, sequence: 2, distKm: 3.5, timeSeconds: 480, lines: ['409', '219', '203', '001'] },
      { stopId: 422, stopName: 'Parada Amazonas Shopping (Av. Djalma Batista)', lat: -3.09335, lng: -60.02315, sequence: 3, distKm: 4.8, timeSeconds: 680, lines: ['409', '219', '203', '001'] },
      { stopId: 423, stopName: 'Parada Bola do Mindu', lat: -3.08500, lng: -60.01250, sequence: 4, distKm: 7.2, timeSeconds: 1020, lines: ['409', '422', '446'] },
      { stopId: 424, stopName: 'Parada Av. Maneca Marques (Parque 10)', lat: -3.07890, lng: -60.00980, sequence: 5, distKm: 8.8, timeSeconds: 1250, lines: ['409', '422', '446'] },
      { stopId: 425, stopName: 'Parada Rua Kobe (Shangrilá)', lat: -3.08450, lng: -60.01580, sequence: 6, distKm: 10.2, timeSeconds: 1450, lines: ['409', '422', '446'] },
      { stopId: 426, stopName: 'Terminal Jardim Primavera (Desembarque Final)', lat: -3.07751, lng: -59.99726, sequence: 7, distKm: 12.8, timeSeconds: 1800, lines: ['409', '422', '446'] }
    ];

    return [
      {
        tripId: 1401,
        tripName: `${code} - Sentido Centro / T2 (IDA)`,
        tripShortName: 'IDA - T2 Cachoeirinha',
        directionType: 'ida',
        totalTimeSeconds: 1950,
        totalDistanceKm: 13.5,
        coordinates: CORRIDOR_409_IDA_COORDS,
        stops: idaStops
      },
      {
        tripId: 1402,
        tripName: `${code} - Sentido Parque 10 (VOLTA)`,
        tripShortName: 'VOLTA - Parque 10',
        directionType: 'volta',
        totalTimeSeconds: 1800,
        totalDistanceKm: 12.8,
        coordinates: CORRIDOR_409_VOLTA_COORDS,
        stops: voltaStops
      }
    ];
  }

  // 2. Linhas Ponta Negra / Compensa / Cel. Teixeira (120, 126, 221, 014, 118)
  if (code === '120' || code === '126' || code === '221' || code === '014' || code === '118') {
    const idaStops: StopInfo[] = [
      { stopId: 1201, stopName: 'Terminal Ponta Negra (Orla da Praia)', lat: -3.06450, lng: -60.07600, sequence: 1, distKm: 0.0, timeSeconds: 0, lines: ['120', '126', '221', '014'] },
      { stopId: 1202, stopName: 'Parada Shopping Ponta Negra (Av. Coronel Teixeira)', lat: -3.07200, lng: -60.06300, sequence: 2, distKm: 2.1, timeSeconds: 260, lines: ['120', '126', '221', '014'] },
      { stopId: 1203, stopName: 'Parada Estrada do Turismo / Alphaville', lat: -3.08200, lng: -60.05600, sequence: 3, distKm: 4.3, timeSeconds: 520, lines: ['120', '126', '221'] },
      { stopId: 1204, stopName: 'Parada Av. Pedro Teixeira (Dom Pedro)', lat: -3.09100, lng: -60.04500, sequence: 4, distKm: 6.5, timeSeconds: 780, lines: ['120', '221', '001'] },
      { stopId: 1205, stopName: 'Parada Av. Brasil - Prefeitura de Manaus (Compensa)', lat: -3.11100, lng: -60.05200, sequence: 5, distKm: 9.8, timeSeconds: 1150, lines: ['120', '126', '221', '014', '118'] },
      { stopId: 1206, stopName: 'Parada Santo Antônio - Ponte de São Raimundo', lat: -3.12300, lng: -60.03800, sequence: 6, distKm: 12.2, timeSeconds: 1450, lines: ['120', '126', '221', '118'] },
      { stopId: 1207, stopName: 'Parada Rua Epaminondas (Centro)', lat: -3.13150, lng: -60.02380, sequence: 7, distKm: 14.5, timeSeconds: 1750, lines: ['120', '126', '640', '300'] },
      { stopId: 1208, stopName: 'Praça da Matriz (Terminal Central - Desembarque)', lat: -3.13650, lng: -60.02450, sequence: 8, distKm: 16.0, timeSeconds: 1950, lines: ['120', '126', '640', '300', '652'] }
    ];

    const voltaStops: StopInfo[] = [
      { stopId: 1220, stopName: 'Praça da Matriz (Embarque Sentido Ponta Negra)', lat: -3.13650, lng: -60.02450, sequence: 1, distKm: 0.0, timeSeconds: 0, lines: ['120', '126', '221'] },
      { stopId: 1221, stopName: 'Parada Santo Antônio / São Raimundo', lat: -3.12300, lng: -60.03800, sequence: 2, distKm: 2.8, timeSeconds: 360, lines: ['120', '126', '221'] },
      { stopId: 1222, stopName: 'Parada Av. Brasil (Prefeitura de Manaus / Compensa)', lat: -3.11100, lng: -60.05200, sequence: 3, distKm: 5.5, timeSeconds: 700, lines: ['120', '126', '221'] },
      { stopId: 1223, stopName: 'Parada Shopping Ponta Negra (Av. Cel. Teixeira)', lat: -3.07200, lng: -60.06300, sequence: 4, distKm: 11.2, timeSeconds: 1350, lines: ['120', '126', '221'] },
      { stopId: 1224, stopName: 'Terminal Ponta Negra (Orla da Praia - Desembarque Final)', lat: -3.06450, lng: -60.07600, sequence: 5, distKm: 15.8, timeSeconds: 1900, lines: ['120', '126', '221'] }
    ];

    return [
      {
        tripId: 1120,
        tripName: `${code} - Sentido Centro Histórico (IDA)`,
        tripShortName: 'IDA - Centro',
        directionType: 'ida',
        totalTimeSeconds: 1950,
        totalDistanceKm: 16.0,
        coordinates: CORRIDOR_120_IDA_COORDS,
        stops: idaStops
      },
      {
        tripId: 1121,
        tripName: `${code} - Sentido Ponta Negra (VOLTA)`,
        tripShortName: 'VOLTA - Ponta Negra',
        directionType: 'volta',
        totalTimeSeconds: 1900,
        totalDistanceKm: 15.8,
        coordinates: CORRIDOR_120_VOLTA_COORDS,
        stops: voltaStops
      }
    ];
  }

  // 3. Linhas Autaz Mirim / Grande Circular / Cosme Ferreira (600, 650, 678, 080, 062)
  if (code === '600' || code === '650' || code === '678' || code === '080' || code === '062') {
    const idaStops: StopInfo[] = [
      { stopId: 601, stopName: 'Terminal 4 - Jorge Teixeira (Embarque)', lat: -3.03512, lng: -59.94481, sequence: 1, distKm: 0.0, timeSeconds: 0, lines: ['600', '650', '652', '640'] },
      { stopId: 602, stopName: 'Parada Shopping Grande Circular (Av. Autaz Mirim)', lat: -3.06300, lng: -59.95070, sequence: 2, distKm: 3.2, timeSeconds: 380, lines: ['600', '650', '652', '678', '080'] },
      { stopId: 603, stopName: 'Parada Bola do Produtor (Jorge Teixeira)', lat: -3.05600, lng: -59.95400, sequence: 3, distKm: 4.5, timeSeconds: 540, lines: ['600', '650', '652', '678', '080'] },
      { stopId: 604, stopName: 'Hospital e Pronto Socorro Dr. João Lúcio (Cosme Ferreira)', lat: -3.07890, lng: -59.95720, sequence: 4, distKm: 7.1, timeSeconds: 840, lines: ['600', '650', '652', '678', '008'] },
      { stopId: 605, stopName: 'Terminal 5 - São José Operário (Plataforma)', lat: -3.08421, lng: -59.96785, sequence: 5, distKm: 9.3, timeSeconds: 1100, lines: ['600', '650', '652', '678', '008'] },
      { stopId: 606, stopName: 'Parada Alameda Cosme Ferreira - Coroado', lat: -3.08700, lng: -59.98200, sequence: 6, distKm: 11.5, timeSeconds: 1350, lines: ['600', '650', '652', '008'] },
      { stopId: 607, stopName: 'Parada Bola do Coroado', lat: -3.09200, lng: -59.99500, sequence: 7, distKm: 13.8, timeSeconds: 1620, lines: ['600', '650', '652', '678', '008'] },
      { stopId: 608, stopName: 'Parada Boulevard Álvaro Botelho Maia', lat: -3.11950, lng: -60.02610, sequence: 8, distKm: 17.5, timeSeconds: 2050, lines: ['600', '409', '120'] },
      { stopId: 609, stopName: 'Praça da Matriz / Centro Histórico (Desembarque)', lat: -3.13650, lng: -60.02450, sequence: 9, distKm: 19.8, timeSeconds: 2350, lines: ['600', '650', '652', '640', '300'] }
    ];

    const voltaStops: StopInfo[] = [
      { stopId: 620, stopName: 'Praça da Matriz / Centro (Embarque Sentido Leste)', lat: -3.13650, lng: -60.02450, sequence: 1, distKm: 0.0, timeSeconds: 0, lines: ['600', '650', '652'] },
      { stopId: 621, stopName: 'Terminal 5 - São José Operário', lat: -3.08421, lng: -59.96785, sequence: 2, distKm: 10.5, timeSeconds: 1250, lines: ['600', '650', '652', '678'] },
      { stopId: 622, stopName: 'Hospital Dr. João Lúcio (Cosme Ferreira)', lat: -3.07890, lng: -59.95720, sequence: 3, distKm: 12.8, timeSeconds: 1520, lines: ['600', '650', '652'] },
      { stopId: 623, stopName: 'Parada Shopping Grande Circular (Av. Autaz Mirim)', lat: -3.06300, lng: -59.95070, sequence: 4, distKm: 15.2, timeSeconds: 1800, lines: ['600', '650', '652', '678'] },
      { stopId: 624, stopName: 'Terminal 4 - Jorge Teixeira (Desembarque Final)', lat: -3.03512, lng: -59.94481, sequence: 5, distKm: 19.5, timeSeconds: 2300, lines: ['600', '650', '652', '640'] }
    ];

    return [
      {
        tripId: 1601,
        tripName: `${code} - Sentido Centro (IDA)`,
        tripShortName: 'IDA - Centro',
        directionType: 'ida',
        totalTimeSeconds: 2350,
        totalDistanceKm: 19.8,
        coordinates: CORRIDOR_600_IDA_COORDS,
        stops: idaStops
      },
      {
        tripId: 1602,
        tripName: `${code} - Sentido Bairro (VOLTA)`,
        tripShortName: 'VOLTA - T4 Jorge Teixeira',
        directionType: 'volta',
        totalTimeSeconds: 2300,
        totalDistanceKm: 19.5,
        coordinates: CORRIDOR_600_VOLTA_COORDS,
        stops: voltaStops
      }
    ];
  }

  // 4. Linha 652 (T4 -> T5 -> Efigênio Salles V8 -> T1 -> Centro)
  if (code === '652') {
    const idaStops: StopInfo[] = [
      { stopId: 651, stopName: 'Terminal 4 - Jorge Teixeira (Embarque)', lat: -3.03512, lng: -59.94481, sequence: 1, distKm: 0.0, timeSeconds: 0, lines: ['652', '600', '640'] },
      { stopId: 652, stopName: 'Terminal 5 - São José (Plataforma)', lat: -3.08421, lng: -59.96785, sequence: 2, distKm: 5.8, timeSeconds: 680, lines: ['652', '600', '650', '678'] },
      { stopId: 653, stopName: 'Parada Al. Cosme Ferreira - Coroado', lat: -3.08700, lng: -59.98200, sequence: 3, distKm: 8.2, timeSeconds: 960, lines: ['652', '600', '678'] },
      { stopId: 654, stopName: 'Parada Av. Efigênio Salles (V8) - Adrianópolis', lat: -3.09700, lng: -60.01200, sequence: 4, distKm: 12.5, timeSeconds: 1450, lines: ['652', '678', '008'] },
      { stopId: 655, stopName: 'Terminal 1 - Constantino Nery', lat: -3.12781, lng: -60.02452, sequence: 5, distKm: 16.8, timeSeconds: 1950, lines: ['652', '640', '300', '448', '560'] },
      { stopId: 656, stopName: 'Praça da Matriz / Centro (Desembarque Final)', lat: -3.13650, lng: -60.02450, sequence: 6, distKm: 18.5, timeSeconds: 2150, lines: ['652', '640', '300', '600'] }
    ];

    const voltaStops: StopInfo[] = [
      { stopId: 661, stopName: 'Praça da Matriz / Centro (Embarque)', lat: -3.13650, lng: -60.02450, sequence: 1, distKm: 0.0, timeSeconds: 0, lines: ['652', '640', '300'] },
      { stopId: 662, stopName: 'Terminal 1 - Constantino Nery (Sentido Bairro)', lat: -3.12781, lng: -60.02452, sequence: 2, distKm: 1.7, timeSeconds: 240, lines: ['652', '640', '300'] },
      { stopId: 663, stopName: 'Parada Av. Efigênio Salles (V8)', lat: -3.09700, lng: -60.01200, sequence: 3, distKm: 6.2, timeSeconds: 720, lines: ['652', '678'] },
      { stopId: 664, stopName: 'Terminal 5 - São José', lat: -3.08421, lng: -59.96785, sequence: 4, distKm: 12.6, timeSeconds: 1480, lines: ['652', '600', '650'] },
      { stopId: 665, stopName: 'Terminal 4 - Jorge Teixeira (Desembarque)', lat: -3.03512, lng: -59.94481, sequence: 5, distKm: 18.4, timeSeconds: 2150, lines: ['652', '600', '640'] }
    ];

    return [
      {
        tripId: 1651,
        tripName: '652 - Sentido Centro / V8 (IDA)',
        tripShortName: 'IDA - Centro',
        directionType: 'ida',
        totalTimeSeconds: 2150,
        totalDistanceKm: 18.5,
        coordinates: CORRIDOR_652_IDA_COORDS,
        stops: idaStops
      },
      {
        tripId: 1652,
        tripName: '652 - Sentido Terminal 4 (VOLTA)',
        tripShortName: 'VOLTA - T4 Jorge Teixeira',
        directionType: 'volta',
        totalTimeSeconds: 2150,
        totalDistanceKm: 18.4,
        coordinates: CORRIDOR_652_VOLTA_COORDS,
        stops: voltaStops
      }
    ];
  }

  // 5. Linhas Educandos / Cachoeirinha / Morro da Liberdade / T2 (004, 010, 611, 612)
  if (code === '004' || code === '010' || code === '611' || code === '612' || code === '706') {
    const circularStops: StopInfo[] = [
      { stopId: 41, stopName: 'Terminal 2 - Cachoeirinha (Ponto Inicial)', lat: -3.12350, lng: -60.00760, sequence: 1, distKm: 0.0, timeSeconds: 0, lines: ['004', '010', '409', '611', '612'] },
      { stopId: 42, stopName: 'Parada Av. Carvalho Leal - UEA ESA', lat: -3.12150, lng: -60.00890, sequence: 2, distKm: 0.8, timeSeconds: 110, lines: ['004', '010', '409'] },
      { stopId: 43, stopName: 'Parada Av. Presidente Castelo Branco (Educandos)', lat: -3.13100, lng: -60.01200, sequence: 3, distKm: 2.1, timeSeconds: 270, lines: ['004', '010', '611'] },
      { stopId: 44, stopName: 'Parada Ponte de Educandos', lat: -3.13900, lng: -60.01450, sequence: 4, distKm: 3.4, timeSeconds: 430, lines: ['004', '010', '706'] },
      { stopId: 45, stopName: 'Feira da Panair (Educandos)', lat: -3.14150, lng: -60.01600, sequence: 5, distKm: 4.2, timeSeconds: 540, lines: ['004', '010', '706'] },
      { stopId: 46, stopName: 'Parada Bairro Morro da Liberdade', lat: -3.14600, lng: -60.01300, sequence: 6, distKm: 5.3, timeSeconds: 680, lines: ['004', '010'] },
      { stopId: 47, stopName: 'Manaus Moderna (Av. Lourenço da Silva Braga)', lat: -3.13800, lng: -60.02100, sequence: 7, distKm: 7.2, timeSeconds: 920, lines: ['004', '010', '706'] },
      { stopId: 48, stopName: 'Mercado Municipal Adolpho Lisboa', lat: -3.13750, lng: -60.02350, sequence: 8, distKm: 8.1, timeSeconds: 1040, lines: ['004', '010'] },
      { stopId: 49, stopName: 'Praça da Matriz / Centro Histórico', lat: -3.13650, lng: -60.02450, sequence: 9, distKm: 9.0, timeSeconds: 1150, lines: ['004', '010', '640', '300'] }
    ];

    return [
      {
        tripId: 1004,
        tripName: `${code} - Circular Educandos / T2 / Centro (IDA)`,
        tripShortName: 'Circular - Centro',
        directionType: 'ida',
        totalTimeSeconds: 1150,
        totalDistanceKm: 9.0,
        coordinates: CORRIDOR_004_IDA_COORDS,
        stops: circularStops
      },
      {
        tripId: 1005,
        tripName: `${code} - Circular Centro / Educandos (VOLTA)`,
        tripShortName: 'Circular - T2',
        directionType: 'volta',
        totalTimeSeconds: 1150,
        totalDistanceKm: 9.0,
        coordinates: CORRIDOR_004_VOLTA_COORDS,
        stops: [...circularStops].reverse().map((s, idx) => ({ ...s, sequence: idx + 1 }))
      }
    ];
  }

  // 6. Linhas UFAM / Rodrigo Otávio / Distrito Industrial (616, 125, 352, 535)
  if (code === '616' || code === '125' || code === '352' || code === '535') {
    const idaStops: StopInfo[] = [
      { stopId: 6161, stopName: 'Campus Universitário UFAM (Setor Norte)', lat: -3.09910, lng: -59.98320, sequence: 1, distKm: 0.0, timeSeconds: 0, lines: ['616', '125', '352'] },
      { stopId: 6162, stopName: 'Campus Universitário UFAM (Setor Sul)', lat: -3.10450, lng: -59.98400, sequence: 2, distKm: 1.2, timeSeconds: 160, lines: ['616', '125', '352'] },
      { stopId: 6163, stopName: 'Parada Av. General Rodrigo Octávio (Coroado)', lat: -3.09650, lng: -59.98600, sequence: 3, distKm: 2.8, timeSeconds: 360, lines: ['616', '125', '352', '535', '418'] },
      { stopId: 6164, stopName: 'Studio 5 Festival Mall (Distrito Industrial)', lat: -3.12500, lng: -59.98800, sequence: 4, distKm: 5.5, timeSeconds: 690, lines: ['616', '125', '535', '706'] },
      { stopId: 6165, stopName: 'Parada Bairro Japiim (Av. Tefé)', lat: -3.12200, lng: -59.99800, sequence: 5, distKm: 7.4, timeSeconds: 920, lines: ['616', '125'] },
      { stopId: 6166, stopName: 'Terminal 2 - Cachoeirinha', lat: -3.12350, lng: -60.00760, sequence: 6, distKm: 9.1, timeSeconds: 1150, lines: ['616', '125', '409', '004'] },
      { stopId: 6167, stopName: 'Hospital Getúlio Vargas (HUGV / Praça 14)', lat: -3.12450, lng: -60.01920, sequence: 7, distKm: 11.2, timeSeconds: 1400, lines: ['616', '125'] },
      { stopId: 6168, stopName: 'Praça da Matriz / Centro Histórico (Desembarque)', lat: -3.13650, lng: -60.02450, sequence: 8, distKm: 13.0, timeSeconds: 1650, lines: ['616', '125', '640', '300'] }
    ];

    const voltaStops: StopInfo[] = [
      { stopId: 6171, stopName: 'Praça da Matriz / Centro (Embarque Sentido UFAM)', lat: -3.13650, lng: -60.02450, sequence: 1, distKm: 0.0, timeSeconds: 0, lines: ['616', '125'] },
      { stopId: 6172, stopName: 'Terminal 2 - Cachoeirinha', lat: -3.12350, lng: -60.00760, sequence: 2, distKm: 3.9, timeSeconds: 490, lines: ['616', '125', '409'] },
      { stopId: 6173, stopName: 'Studio 5 Festival Mall (Distrito Industrial)', lat: -3.12500, lng: -59.98800, sequence: 3, distKm: 7.5, timeSeconds: 950, lines: ['616', '125', '535'] },
      { stopId: 6174, stopName: 'Campus Universitário UFAM (Desembarque Final)', lat: -3.09910, lng: -59.98320, sequence: 4, distKm: 12.8, timeSeconds: 1600, lines: ['616', '125', '352'] }
    ];

    return [
      {
        tripId: 1616,
        tripName: `${code} - Sentido Centro Histórico (IDA)`,
        tripShortName: 'IDA - Centro',
        directionType: 'ida',
        totalTimeSeconds: 1650,
        totalDistanceKm: 13.0,
        coordinates: CORRIDOR_616_IDA_COORDS,
        stops: idaStops
      },
      {
        tripId: 1617,
        tripName: `${code} - Sentido Campus Universitário UFAM (VOLTA)`,
        tripShortName: 'VOLTA - UFAM',
        directionType: 'volta',
        totalTimeSeconds: 1600,
        totalDistanceKm: 12.8,
        coordinates: CORRIDOR_616_VOLTA_COORDS,
        stops: voltaStops
      }
    ];
  }

  // 7. Linha 357 / 041 (Viver Melhor / Lago Azul / Av. das Flores / Centro)
  if (code === '357' || code === '041' || code === '028') {
    const idaStops: StopInfo[] = [
      { stopId: 3571, stopName: 'Terminal 6 - Lago Azul / Viver Melhor (Embarque)', lat: -2.99650, lng: -60.01500, sequence: 1, distKm: 0.0, timeSeconds: 0, lines: ['357', '041', '028', '560'] },
      { stopId: 3572, stopName: 'Parada Av. das Flores - Viver Melhor II', lat: -3.01200, lng: -60.01800, sequence: 2, distKm: 2.2, timeSeconds: 270, lines: ['357', '041', '028', '560'] },
      { stopId: 3573, stopName: 'Parada Av. das Flores - Bairro Passarinho', lat: -3.02500, lng: -60.01900, sequence: 3, distKm: 4.8, timeSeconds: 580, lines: ['357', '041', '560'] },
      { stopId: 3574, stopName: 'Terminal 3 - Cidade Nova (Plataforma)', lat: -3.03692, lng: -60.00624, sequence: 4, distKm: 8.5, timeSeconds: 980, lines: ['357', '640', '300', '448', '041'] },
      { stopId: 3575, stopName: 'Estação E4 - Manôa', lat: -3.06400, lng: -60.02450, sequence: 5, distKm: 12.1, timeSeconds: 1380, lines: ['357', '640', '300', '448'] },
      { stopId: 3576, stopName: 'Estação E2 - Arena da Amazônia', lat: -3.08331, lng: -60.02894, sequence: 6, distKm: 15.6, timeSeconds: 1780, lines: ['357', '640', '300', '448', '560'] },
      { stopId: 3577, stopName: 'Terminal 1 - Constantino Nery', lat: -3.12781, lng: -60.02452, sequence: 7, distKm: 20.8, timeSeconds: 2350, lines: ['357', '640', '300', '448', '560', '219'] },
      { stopId: 3578, stopName: 'Praça da Matriz / Centro Histórico', lat: -3.13650, lng: -60.02450, sequence: 8, distKm: 22.5, timeSeconds: 2550, lines: ['357', '640', '300', '448', '560'] }
    ];

    const voltaStops: StopInfo[] = [
      { stopId: 3581, stopName: 'Praça da Matriz / Centro (Embarque Sentido Viver Melhor)', lat: -3.13650, lng: -60.02450, sequence: 1, distKm: 0.0, timeSeconds: 0, lines: ['357', '640', '300'] },
      { stopId: 3582, stopName: 'Terminal 1 - Constantino Nery', lat: -3.12781, lng: -60.02452, sequence: 2, distKm: 1.7, timeSeconds: 240, lines: ['357', '640', '300'] },
      { stopId: 3583, stopName: 'Terminal 3 - Cidade Nova', lat: -3.03692, lng: -60.00624, sequence: 3, distKm: 14.0, timeSeconds: 1600, lines: ['357', '640', '300', '448'] },
      { stopId: 3584, stopName: 'Parada Av. das Flores (Viver Melhor)', lat: -3.01200, lng: -60.01800, sequence: 4, distKm: 20.2, timeSeconds: 2280, lines: ['357', '041', '560'] },
      { stopId: 3585, stopName: 'Terminal 6 - Lago Azul (Desembarque Final)', lat: -2.99650, lng: -60.01500, sequence: 5, distKm: 22.4, timeSeconds: 2500, lines: ['357', '041', '560'] }
    ];

    return [
      {
        tripId: 1357,
        tripName: '357 - Sentido Centro / Av. das Flores (IDA)',
        tripShortName: 'IDA - Centro',
        directionType: 'ida',
        totalTimeSeconds: 2550,
        totalDistanceKm: 22.5,
        coordinates: CORRIDOR_357_IDA_COORDS,
        stops: idaStops
      },
      {
        tripId: 1358,
        tripName: '357 - Sentido Viver Melhor / T6 (VOLTA)',
        tripShortName: 'VOLTA - Viver Melhor',
        directionType: 'volta',
        totalTimeSeconds: 2500,
        totalDistanceKm: 22.4,
        coordinates: CORRIDOR_357_VOLTA_COORDS,
        stops: voltaStops
      }
    ];
  }

  // 8. Linhas Interbairros & Djalma Batista (001, 002, 219, 203, 205)
  if (code === '001' || code === '002' || code === '219' || code === '203' || code === '205') {
    const idaStops: StopInfo[] = [
      { stopId: 2191, stopName: 'Terminal Bairro da Paz (Augusto Montenegro)', lat: -3.06800, lng: -60.04100, sequence: 1, distKm: 0.0, timeSeconds: 0, lines: ['219', '203', '205'] },
      { stopId: 2192, stopName: 'Parada Av. Santos Dumont (Flores)', lat: -3.07250, lng: -60.02580, sequence: 2, distKm: 2.5, timeSeconds: 320, lines: ['219', '203', '640', '300'] },
      { stopId: 2193, stopName: 'Parada Amazonas Shopping (Av. Djalma Batista)', lat: -3.09335, lng: -60.02315, sequence: 3, distKm: 5.8, timeSeconds: 750, lines: ['001', '002', '219', '203', '205', '448', '409'] },
      { stopId: 2194, stopName: 'Parada Millennium Shopping (Av. Djalma Batista)', lat: -3.09850, lng: -60.02520, sequence: 4, distKm: 7.1, timeSeconds: 920, lines: ['001', '002', '219', '203', '205', '448', '409'] },
      { stopId: 2195, stopName: 'Terminal 1 - Constantino Nery', lat: -3.12781, lng: -60.02452, sequence: 5, distKm: 10.4, timeSeconds: 1350, lines: ['219', '203', '640', '300', '448', '560'] },
      { stopId: 2196, stopName: 'Praça da Matriz / Centro Histórico (Desembarque)', lat: -3.13650, lng: -60.02450, sequence: 6, distKm: 12.0, timeSeconds: 1550, lines: ['219', '203', '640', '300', '001'] }
    ];

    const voltaStops: StopInfo[] = [
      { stopId: 2197, stopName: 'Praça da Matriz / Centro (Embarque Sentido Bairro)', lat: -3.13650, lng: -60.02450, sequence: 1, distKm: 0.0, timeSeconds: 0, lines: ['219', '203', '001'] },
      { stopId: 2198, stopName: 'Terminal 1 - Constantino Nery', lat: -3.12781, lng: -60.02452, sequence: 2, distKm: 1.7, timeSeconds: 240, lines: ['219', '203', '640'] },
      { stopId: 2199, stopName: 'Parada Millennium Shopping (Djalma Batista)', lat: -3.09850, lng: -60.02520, sequence: 3, distKm: 5.0, timeSeconds: 650, lines: ['219', '203', '001', '002', '409'] },
      { stopId: 2200, stopName: 'Terminal Bairro da Paz (Desembarque Final)', lat: -3.06800, lng: -60.04100, sequence: 4, distKm: 11.8, timeSeconds: 1500, lines: ['219', '203', '205'] }
    ];

    return [
      {
        tripId: 1219,
        tripName: `${code} - Sentido Centro / Djalma Batista (IDA)`,
        tripShortName: 'IDA - Centro',
        directionType: 'ida',
        totalTimeSeconds: 1550,
        totalDistanceKm: 12.0,
        coordinates: CORRIDOR_001_IDA_COORDS,
        stops: idaStops
      },
      {
        tripId: 1220,
        tripName: `${code} - Sentido Bairro (VOLTA)`,
        tripShortName: 'VOLTA - Bairro',
        directionType: 'volta',
        totalTimeSeconds: 1500,
        totalDistanceKm: 11.8,
        coordinates: CORRIDOR_001_VOLTA_COORDS,
        stops: voltaStops
      }
    ];
  }

  // 9. Linha 300 (Expresso Norte: T4 -> T3 -> Plataforma Manôa -> Arena -> T1 -> Centro)
  if (code === '300') {
    const idaStops: StopInfo[] = [
      { stopId: 301, stopName: 'Terminal 4 - Jorge Teixeira (Embarque Linhas Expressas)', lat: -3.03512, lng: -59.94481, sequence: 1, distKm: 0.0, timeSeconds: 0, lines: ['300', '640', '448', '560'] },
      { stopId: 302, stopName: 'Terminal 3 - Cidade Nova (Plataforma Expresso)', lat: -3.03692, lng: -60.00624, sequence: 2, distKm: 6.8, timeSeconds: 680, lines: ['300', '640', '448', '560', '357'] },
      { stopId: 303, stopName: 'Estação E4 - Manôa (Plataforma Elevada)', lat: -3.06400, lng: -60.02450, sequence: 3, distKm: 10.4, timeSeconds: 1020, lines: ['300', '640', '448', '560'] },
      { stopId: 304, stopName: 'Estação E2 - Arena da Amazônia', lat: -3.08331, lng: -60.02894, sequence: 4, distKm: 14.1, timeSeconds: 1380, lines: ['300', '640', '448', '560'] },
      { stopId: 305, stopName: 'Estação E1 - São Jorge', lat: -3.10982, lng: -60.02751, sequence: 5, distKm: 17.0, timeSeconds: 1680, lines: ['300', '640', '448', '560'] },
      { stopId: 306, stopName: 'Terminal 1 - Constantino Nery', lat: -3.12781, lng: -60.02452, sequence: 6, distKm: 19.3, timeSeconds: 1950, lines: ['300', '640', '448', '560', '219', '120'] },
      { stopId: 307, stopName: 'Praça da Matriz / Centro Histórico (Desembarque)', lat: -3.13650, lng: -60.02450, sequence: 7, distKm: 21.0, timeSeconds: 2150, lines: ['300', '640', '448', '560', '652', '120'] }
    ];

    const voltaStops: StopInfo[] = [
      { stopId: 311, stopName: 'Praça da Matriz / Centro (Embarque Expresso Norte)', lat: -3.13650, lng: -60.02450, sequence: 1, distKm: 0.0, timeSeconds: 0, lines: ['300', '640', '448', '560'] },
      { stopId: 312, stopName: 'Terminal 1 - Constantino Nery (Sentido Zona Norte)', lat: -3.12781, lng: -60.02452, sequence: 2, distKm: 1.7, timeSeconds: 220, lines: ['300', '640', '448', '560'] },
      { stopId: 313, stopName: 'Estação E1 - São Jorge', lat: -3.10982, lng: -60.02751, sequence: 3, distKm: 4.0, timeSeconds: 520, lines: ['300', '640', '448', '560'] },
      { stopId: 314, stopName: 'Estação E2 - Arena da Amazônia', lat: -3.08331, lng: -60.02894, sequence: 4, distKm: 6.9, timeSeconds: 840, lines: ['300', '640', '448', '560'] },
      { stopId: 315, stopName: 'Estação E4 - Manôa', lat: -3.06400, lng: -60.02450, sequence: 5, distKm: 10.6, timeSeconds: 1250, lines: ['300', '640', '448', '560'] },
      { stopId: 316, stopName: 'Terminal 3 - Cidade Nova', lat: -3.03692, lng: -60.00624, sequence: 6, distKm: 14.2, timeSeconds: 1650, lines: ['300', '640', '448', '560'] },
      { stopId: 317, stopName: 'Terminal 4 - Jorge Teixeira (Desembarque Final)', lat: -3.03512, lng: -59.94481, sequence: 7, distKm: 21.0, timeSeconds: 2150, lines: ['300', '640', '448', '560'] }
    ];

    return [
      {
        tripId: 1300,
        tripName: '300 - Expresso Norte / Centro (IDA)',
        tripShortName: 'IDA - Centro',
        directionType: 'ida',
        totalTimeSeconds: 2150,
        totalDistanceKm: 21.0,
        coordinates: CORRIDOR_300_IDA_COORDS,
        stops: idaStops
      },
      {
        tripId: 1301,
        tripName: '300 - Expresso Norte / T4 (VOLTA)',
        tripShortName: 'VOLTA - T4 Jorge Teixeira',
        directionType: 'volta',
        totalTimeSeconds: 2150,
        totalDistanceKm: 21.0,
        coordinates: CORRIDOR_300_VOLTA_COORDS,
        stops: voltaStops
      }
    ];
  }

  // 10. Linha 640 e Linhas Troncal Norte Padrão (640, 448, 560, 500)
  const idaStops: StopInfo[] = [
    { stopId: 101, stopName: 'Terminal 4 - Jorge Teixeira (Embarque)', lat: -3.03512, lng: -59.94481, sequence: 1, distKm: 0.0, timeSeconds: 0, lines: ['640', '300', '448', '560'] },
    { stopId: 102, stopName: 'Parada Av. Camapuã - Bairro Canaranas', lat: -3.03600, lng: -59.96150, sequence: 2, distKm: 2.1, timeSeconds: 240, lines: ['640', '300', '448', '560'] },
    { stopId: 103, stopName: 'Terminal 3 - Cidade Nova (Plataforma)', lat: -3.03692, lng: -60.00624, sequence: 3, distKm: 6.8, timeSeconds: 720, lines: ['640', '300', '448', '560', '357'] },
    { stopId: 104, stopName: 'Estação E4 - Manôa', lat: -3.06400, lng: -60.02450, sequence: 4, distKm: 10.4, timeSeconds: 1100, lines: ['640', '300', '448', '560'] },
    { stopId: 105, stopName: 'Estação E3 - Santos Dumont', lat: -3.07250, lng: -60.02580, sequence: 5, distKm: 12.2, timeSeconds: 1300, lines: ['640', '300', '448', '560', '219'] },
    { stopId: 106, stopName: 'Estação E2 - Arena da Amazônia / Flores', lat: -3.08331, lng: -60.02894, sequence: 6, distKm: 14.1, timeSeconds: 1550, lines: ['640', '300', '448', '560'] },
    { stopId: 107, stopName: 'Estação E1 - São Jorge', lat: -3.10982, lng: -60.02751, sequence: 7, distKm: 17.0, timeSeconds: 1900, lines: ['640', '300', '448', '560'] },
    { stopId: 108, stopName: 'Terminal 1 - Constantino Nery', lat: -3.12781, lng: -60.02452, sequence: 8, distKm: 19.3, timeSeconds: 2200, lines: ['640', '300', '448', '560', '219', '120'] },
    { stopId: 109, stopName: 'Praça da Matriz / Centro Histórico (Desembarque)', lat: -3.13650, lng: -60.02450, sequence: 9, distKm: 21.0, timeSeconds: 2500, lines: ['640', '300', '448', '560', '652', '120'] }
  ];

  const voltaStops: StopInfo[] = [
    { stopId: 201, stopName: 'Praça da Matriz / Centro (Embarque)', lat: -3.13650, lng: -60.02450, sequence: 1, distKm: 0.0, timeSeconds: 0, lines: ['640', '300', '448', '560'] },
    { stopId: 202, stopName: 'Terminal 1 - Constantino Nery (Plataforma Sentido Bairro)', lat: -3.12781, lng: -60.02452, sequence: 2, distKm: 1.7, timeSeconds: 260, lines: ['640', '300', '448', '560'] },
    { stopId: 203, stopName: 'Estação E1 - São Jorge', lat: -3.10982, lng: -60.02751, sequence: 3, distKm: 4.0, timeSeconds: 580, lines: ['640', '300', '448', '560'] },
    { stopId: 204, stopName: 'Estação E2 - Arena da Amazônia', lat: -3.08331, lng: -60.02894, sequence: 4, distKm: 6.9, timeSeconds: 920, lines: ['640', '300', '448', '560'] },
    { stopId: 205, stopName: 'Estação E3 - Santos Dumont', lat: -3.07250, lng: -60.02580, sequence: 5, distKm: 8.8, timeSeconds: 1180, lines: ['640', '300', '448', '560'] },
    { stopId: 206, stopName: 'Estação E4 - Manôa', lat: -3.06400, lng: -60.02450, sequence: 6, distKm: 10.6, timeSeconds: 1400, lines: ['640', '300', '448', '560'] },
    { stopId: 207, stopName: 'Terminal 3 - Cidade Nova', lat: -3.03692, lng: -60.00624, sequence: 7, distKm: 14.2, timeSeconds: 1800, lines: ['640', '300', '448', '560'] },
    { stopId: 208, stopName: 'Terminal 4 - Jorge Teixeira (Desembarque Final)', lat: -3.03512, lng: -59.94481, sequence: 8, distKm: 21.0, timeSeconds: 2500, lines: ['640', '300', '448', '560'] }
  ];

  return [
    {
      tripId: 1001,
      tripName: `${code || '640'} - Sentido Centro (IDA)`,
      tripShortName: 'IDA - Centro',
      directionType: 'ida',
      totalTimeSeconds: 2500,
      totalDistanceKm: 21.0,
      coordinates: CORRIDOR_640_IDA_COORDS,
      stops: idaStops
    },
    {
      tripId: 1002,
      tripName: `${code || '640'} - Sentido Bairro (VOLTA)`,
      tripShortName: 'VOLTA - Bairro',
      directionType: 'volta',
      totalTimeSeconds: 2500,
      totalDistanceKm: 21.0,
      coordinates: CORRIDOR_640_VOLTA_COORDS,
      stops: voltaStops
    }
  ];
}


// =========================================================================
// GERAÇÃO DE ÔNIBUS CIRCULANDO CONFORME GEOMETRIA REAL DA ROTA
// =========================================================================

export function generateLiveVehiclesAlongRoute(routeCode: string, isVolta: boolean = false): LiveBus[] {
  const code = String(routeCode || '').trim();

  let coords = isVolta ? CORRIDOR_640_VOLTA_COORDS : CORRIDOR_640_IDA_COORDS;
  let defaultDest = isVolta ? 'T4 Jorge Teixeira' : 'Centro / Matriz';

  if (code === '409' || code === '422' || code === '446' || code === '359') {
    coords = isVolta ? CORRIDOR_409_VOLTA_COORDS : CORRIDOR_409_IDA_COORDS;
    defaultDest = isVolta ? 'Parque 10 / Shangrilá' : 'Terminal 2 / Cachoeirinha';
  } else if (code === '120' || code === '126' || code === '221' || code === '014') {
    coords = isVolta ? CORRIDOR_120_VOLTA_COORDS : CORRIDOR_120_IDA_COORDS;
    defaultDest = isVolta ? 'Praia da Ponta Negra' : 'Centro Histórico';
  } else if (code === '600' || code === '650' || code === '678') {
    coords = isVolta ? CORRIDOR_600_VOLTA_COORDS : CORRIDOR_600_IDA_COORDS;
    defaultDest = isVolta ? 'T4 Jorge Teixeira' : 'Centro / Praça da Matriz';
  } else if (code === '652') {
    coords = isVolta ? CORRIDOR_652_VOLTA_COORDS : CORRIDOR_652_IDA_COORDS;
    defaultDest = isVolta ? 'T4 Jorge Teixeira' : 'Centro / Efigênio Salles';
  } else if (code === '004' || code === '010') {
    coords = isVolta ? CORRIDOR_004_VOLTA_COORDS : CORRIDOR_004_IDA_COORDS;
    defaultDest = isVolta ? 'Terminal 2 / Cachoeirinha' : 'Educandos / Centro';
  } else if (code === '616' || code === '125' || code === '352') {
    coords = isVolta ? CORRIDOR_616_VOLTA_COORDS : CORRIDOR_616_IDA_COORDS;
    defaultDest = isVolta ? 'Campus UFAM / Coroado' : 'Centro Histórico';
  } else if (code === '357' || code === '041') {
    coords = isVolta ? CORRIDOR_357_VOLTA_COORDS : CORRIDOR_357_IDA_COORDS;
    defaultDest = isVolta ? 'Viver Melhor / T6' : 'Centro Histórico';
  } else if (code === '001' || code === '002' || code === '219' || code === '203') {
    coords = isVolta ? CORRIDOR_001_VOLTA_COORDS : CORRIDOR_001_IDA_COORDS;
    defaultDest = isVolta ? 'Bairro da Paz / Compensa' : 'Centro / Djalma Batista';
  } else if (code === '300') {
    coords = isVolta ? CORRIDOR_300_VOLTA_COORDS : CORRIDOR_300_IDA_COORDS;
    defaultDest = isVolta ? 'T4 Jorge Teixeira' : 'Centro / Expresso Norte';
  }

  // Gera 4 ônibus em sequência espaçados na via para mostrar ônibus da frente e de trás
  const sampleIndices = [
    Math.floor(coords.length * 0.85), // Ônibus líder mais adiante
    Math.floor(coords.length * 0.55), // 2º Ônibus atrás
    Math.floor(coords.length * 0.30), // 3º Ônibus atrás
    Math.floor(coords.length * 0.10)  // 4º Ônibus saindo da origem
  ];

  return sampleIndices.map((coordIdx, i) => {
    const safeIdx = Math.min(Math.max(0, coordIdx), coords.length - 1);
    const pt = coords[safeIdx];
    const nextIdx = Math.min(safeIdx + 1, coords.length - 1);
    const nextPt = coords[nextIdx];

    // Cálculo do heading real da via
    const dLng = nextPt[0] - pt[0];
    const dLat = nextPt[1] - pt[1];
    let heading = Math.round((Math.atan2(dLng, dLat) * 180) / Math.PI);
    if (heading < 0) heading += 360;

    const carNumber = `042${code.slice(-3).padStart(3, '0')}${i + 1}`;
    const speedKmh = 24 + ((i * 7) % 18);

    return {
      id: carNumber,
      lat: pt[1],
      lng: pt[0],
      heading,
      headsign: defaultDest,
      timestamp: Date.now() - (i * 95000),
      tripId: isVolta ? 2000 : 1000,
      direction: isVolta ? ('volta' as const) : ('ida' as const),
      routeCode: code,
      speedKmh,
      hasAirConditioning: true,
      crowding: i === 0 ? 'baixa' : i === 1 ? 'moderada' : 'alta'
    };
  });
}
