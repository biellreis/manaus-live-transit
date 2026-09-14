import React, { useState, useMemo } from 'react';
import { Search, ArrowRight, Check } from 'lucide-react';
import type { RouteSummary } from '../types/transit.js';
import { useHaptic } from '../hooks/useHaptic.js';
import { getBusLineColor } from '../utils/transitColors.js';

interface LinesTabProps {
  lines: RouteSummary[];
  selectedLine: RouteSummary | null;
  onSelectLine: (line: RouteSummary) => void;
}

export const LinesTab: React.FC<LinesTabProps> = ({
  lines,
  selectedLine,
  onSelectLine
}) => {
  const [query, setQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'troncal' | 'alimentadora' | 'circular'>('all');
  const haptic = useHaptic();

  const filterOptions = [
    { id: 'all', label: 'Todas as Linhas' },
    { id: 'troncal', label: 'Ônibus Direto' },
    { id: 'alimentadora', label: 'Linhas de Bairro' },
    { id: 'circular', label: 'Circulares' },
  ];

  // Sort canonical Manaus lines:
  // 1. All numerical lines in ascending order (001, 002, 004 ... 113 ... 640, 678)
  // 2. All 'A' lines in ascending order (A030, A036, A307, A407, A626)
  const sortedAndFilteredLines = useMemo(() => {
    const filtered = lines.filter(line => {
      const matchesQuery = query === '' ||
        line.code.toLowerCase().includes(query.toLowerCase()) ||
        line.name.toLowerCase().includes(query.toLowerCase());

      const matchesFilter = selectedFilter === 'all' ||
        (selectedFilter === 'troncal' && (line.category === 'troncal' || ['640', '300', '448', '560', '652'].includes(line.code))) ||
        (selectedFilter === 'alimentadora' && (line.code.startsWith('A') || line.category === 'alimentadora')) ||
        (selectedFilter === 'circular' && (line.category === 'circular' || line.category === 'interbairros'));

      return matchesQuery && matchesFilter;
    });

    return filtered.sort((a, b) => {
      const aIsA = a.code.toUpperCase().startsWith('A');
      const bIsA = b.code.toUpperCase().startsWith('A');

      // Numerical lines first, then 'A' lines
      if (!aIsA && bIsA) return -1;
      if (aIsA && !bIsA) return 1;

      // If both start with 'A'
      if (aIsA && bIsA) {
        return a.code.localeCompare(b.code, undefined, { numeric: true });
      }

      // If both are numerical
      const numA = parseInt(a.code, 10);
      const numB = parseInt(b.code, 10);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }

      return a.code.localeCompare(b.code, undefined, { numeric: true });
    });
  }, [lines, query, selectedFilter]);

  const handleSelect = (line: RouteSummary) => {
    haptic.mediumTap();
    onSelectLine(line);
  };

  return (
    <div
      id="lines-tab-screen"
      className="scroll-container"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 5,
        backgroundColor: '#09090B',
        paddingBottom: '80px',
        overflowY: 'auto',
        color: '#FFFFFF'
      }}
    >
      {/* Top Header - Clean, without "rede integrada de manaus" */}
      <div
        style={{
          paddingTop: 'max(env(safe-area-inset-top, 0px), 18px)',
          paddingLeft: '20px',
          paddingRight: '20px',
          paddingBottom: '14px'
        }}
      >
        <h1
          style={{
            fontSize: '26px',
            fontWeight: 800,
            color: '#FFFFFF',
            letterSpacing: '-0.03em',
            margin: 0
          }}
        >
          Linhas de Ônibus
        </h1>
        <p
          style={{
            fontSize: '13px',
            color: '#A1A1AA',
            margin: '3px 0 0 0',
            fontWeight: 500
          }}
        >
          {sortedAndFilteredLines.length} linhas em circulação em Manaus
        </p>
      </div>

      {/* Search Input */}
      <div style={{ padding: '0 20px 14px 20px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#18181B',
            borderRadius: '16px',
            padding: '12px 16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)'
          }}
        >
          <Search size={18} color="#A1A1AA" style={{ marginRight: '12px', flexShrink: 0 }} />
          <input
            id="lines-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por número ou destino (ex: 640, Centro, T4)..."
            style={{
              background: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '15px',
              fontWeight: 500,
              width: '100%',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Simple Category Filter Chips */}
      <div
        style={{
          padding: '0 20px 16px 20px',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          scrollbarWidth: 'none'
        }}
      >
        {filterOptions.map((cat) => {
          const isActive = selectedFilter === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                haptic.lightTap();
                setSelectedFilter(cat.id as any);
              }}
              style={{
                padding: '8px 14px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 700,
                border: isActive ? '1px solid #3B82F6' : '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: isActive ? '#2563EB' : '#18181B',
                color: isActive ? '#FFFFFF' : '#A1A1AA',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                flexShrink: 0,
                outline: 'none'
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Sorted Lines List with Official Bus Colors and Proper Diagramming */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {sortedAndFilteredLines.map((line) => {
          const isSelected = selectedLine?.id === line.id;
          const colorInfo = getBusLineColor(line.code);

          return (
            <div
              key={line.id}
              onClick={() => handleSelect(line)}
              style={{
                backgroundColor: '#18181B',
                borderRadius: '18px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: isSelected ? '1.5px solid #3B82F6' : '1px solid rgba(255, 255, 255, 0.08)',
                cursor: 'pointer',
                transition: 'transform 0.1s ease',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                {/* Official Color Badge */}
                <div
                  style={{
                    backgroundColor: colorInfo.bg,
                    color: colorInfo.text,
                    borderRadius: '12px',
                    padding: '8px 12px',
                    fontSize: '16px',
                    fontWeight: 800,
                    minWidth: '58px',
                    textAlign: 'center',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.5)',
                    flexShrink: 0
                  }}
                >
                  {line.code}
                </div>

                {/* Line Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {line.name}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#A1A1AA',
                      marginTop: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span style={{ color: colorInfo.accent, fontWeight: 600 }}>
                      {colorInfo.serviceType}
                    </span>
                    <span>•</span>
                    <span>Manaus</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px', flexShrink: 0 }}>
                {isSelected ? (
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: '#2563EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Check size={14} color="#FFFFFF" />
                  </div>
                ) : (
                  <ArrowRight size={18} color="#71717A" />
                )}
              </div>
            </div>
          );
        })}

        {sortedAndFilteredLines.length === 0 && (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: '#71717A',
              fontSize: '14px'
            }}
          >
            Nenhuma linha encontrada para "{query}".
          </div>
        )}
      </div>
    </div>
  );
};
