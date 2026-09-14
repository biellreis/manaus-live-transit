export interface LineColorInfo {
  bg: string;
  text: string;
  border: string;
  badgeBg: string;
  accent: string;
  serviceType: string;
}

/**
 * Cores Oficiais Estritas do Aplicativo:
 * 1. Branco (#FFFFFF)
 * 2. Azul (#3B82F6 / #2563EB)
 * 3. Laranja (#F97316 / #EA580C)
 */
export function getBusLineColor(lineCode: string): LineColorInfo {
  const code = (lineCode || '').trim().toUpperCase();

  // Linhas Troncais / Eixo Principal -> Azul Real
  if (['640', '300', '448', '500', '560', '650', '652', '678', '357', '120', '219', '222'].includes(code)) {
    return {
      bg: '#2563EB',
      text: '#FFFFFF',
      border: 'rgba(37, 99, 235, 0.4)',
      badgeBg: 'rgba(37, 99, 235, 0.2)',
      accent: '#60A5FA',
      serviceType: 'Troncal / Expressa'
    };
  }

  // Linhas Interbairros, Circulares e Alimentadoras -> Laranja Intenso
  if (code.startsWith('A') || ['001', '002', '004', '008', '010', '014', '062', '080', '409', '418', '535', '600'].includes(code)) {
    return {
      bg: '#F97316',
      text: '#FFFFFF',
      border: 'rgba(249, 115, 22, 0.4)',
      badgeBg: 'rgba(249, 115, 22, 0.2)',
      accent: '#FB923C',
      serviceType: 'Alimentadora / Interbairros'
    };
  }

  // Padrão (Convencional Manaus) -> Azul
  return {
    bg: '#3B82F6',
    text: '#FFFFFF',
    border: 'rgba(59, 130, 246, 0.4)',
    badgeBg: 'rgba(59, 130, 246, 0.2)',
    accent: '#93C5FD',
    serviceType: 'Convencional'
  };
}
