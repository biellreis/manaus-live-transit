export interface TransitHub {
  id: string;
  name: string;
  shortName: string;
  type: 'terminal' | 'station';
  lat: number;
  lng: number;
  neighborhood: string;
  address: string;
  keyLines: string[];
}

export const MANAUS_TRANSIT_HUBS: TransitHub[] = [
  {
    id: 'T1',
    name: 'Terminal 1 - Constantino Nery',
    shortName: 'T1',
    type: 'terminal',
    lat: -3.12781,
    lng: -60.02452,
    neighborhood: 'Centro',
    address: 'Av. Constantino Nery, Centro',
    keyLines: ['300', '357', '448', '500', '560', '640', '652']
  },
  {
    id: 'T2',
    name: 'Terminal 2 - Cachoeirinha',
    shortName: 'T2',
    type: 'terminal',
    lat: -3.12554,
    lng: -60.00783,
    neighborhood: 'Cachoeirinha',
    address: 'Av. Manicoré, Cachoeirinha',
    keyLines: ['004', '010', '013', '611', '612']
  },
  {
    id: 'T3',
    name: 'Terminal 3 - Cidade Nova',
    shortName: 'T3',
    type: 'terminal',
    lat: -3.03692,
    lng: -60.00624,
    neighborhood: 'Cidade Nova',
    address: 'Av. Noel Nutels, Cidade Nova',
    keyLines: ['026', '041', '300', '448', '640', '357']
  },
  {
    id: 'T4',
    name: 'Terminal 4 - Jorge Teixeira',
    shortName: 'T4',
    type: 'terminal',
    lat: -3.03512,
    lng: -59.94481,
    neighborhood: 'Jorge Teixeira',
    address: 'Av. Camapuã, Jorge Teixeira',
    keyLines: ['041', '044', '300', '560', '640', '652']
  },
  {
    id: 'T5',
    name: 'Terminal 5 - São José',
    shortName: 'T5',
    type: 'terminal',
    lat: -3.08421,
    lng: -59.96785,
    neighborhood: 'São José Operário',
    address: 'Alameda Cosme Ferreira, São José',
    keyLines: ['008', '600', '650', '652', '678']
  },
  {
    id: 'T6',
    name: 'Terminal 6 - Viver Melhor / Lago Azul',
    shortName: 'T6',
    type: 'terminal',
    lat: -2.97851,
    lng: -60.03822,
    neighborhood: 'Lago Azul',
    address: 'Av. Governador José Lindoso / BR-174',
    keyLines: ['028', '041', '357']
  },
  // Estações de Transferência do Corredor de Ônibus da Constantino Nery / Torquato Tapajós
  {
    id: 'E1',
    name: 'Estação 1 - São Jorge',
    shortName: 'E1',
    type: 'station',
    lat: -3.10982,
    lng: -60.02751,
    neighborhood: 'São Jorge',
    address: 'Av. Constantino Nery, próx. Igreja São Jorge',
    keyLines: ['300', '448', '560', '640']
  },
  {
    id: 'E2',
    name: 'Estação 2 - Arena da Amazônia',
    shortName: 'E2',
    type: 'station',
    lat: -3.08331,
    lng: -60.02894,
    neighborhood: 'Flores',
    address: 'Av. Constantino Nery, frente à Arena da Amazônia',
    keyLines: ['300', '448', '560', '640']
  },
  {
    id: 'E3',
    name: 'Estação 3 - Santos Dumont',
    shortName: 'E3',
    type: 'station',
    lat: -3.05882,
    lng: -60.02641,
    neighborhood: 'Da Paz',
    address: 'Av. Torquato Tapajós, Santos Dumont',
    keyLines: ['300', '448', '500', '640']
  },
  {
    id: 'E4',
    name: 'Estação 4 - Flores / Manôa',
    shortName: 'E4',
    type: 'station',
    lat: -3.04562,
    lng: -60.02423,
    neighborhood: 'Flores',
    address: 'Av. Torquato Tapajós, próx. Max Teixeira',
    keyLines: ['300', '357', '448', '640']
  }
];
