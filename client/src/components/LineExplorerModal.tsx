import React, { useState, useMemo } from 'react';
import { Search, X, ArrowRight, Bus, Layers } from 'lucide-react';
import type { RouteSummary } from '../types/transit.js';
import { useHaptic } from '../hooks/useHaptic.js';

interface LineExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lines: RouteSummary[];
  selectedLine: RouteSummary | null;
  onSelectLine: (line: RouteSummary) => void;
}

export const LineExplorerModal: React.FC<LineExplorerModalProps> = ({
  isOpen,
  onClose,
  lines,
  selectedLine,
  onSelectLine
}) => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'troncal' | 'alimentadora' | '700s' | 'norte' | 'leste' | 'interbairros'>('all');
  const haptic = useHaptic();

  const filterTabs = [
    { id: 'all', label: 'Todas as Linhas' },
    { id: 'troncal', label: 'Linhas Troncais' },
    { id: 'alimentadora', label: 'Alimentadoras A (A030 a A626)' },
    { id: '700s', label: 'Linhas 700 a 715 (Zona Sul)' },
    { id: 'norte', label: 'Zona Norte (300 - 499)' },
    { id: 'leste', label: 'Zona Leste (500 - 699)' },
    { id: 'interbairros', label: 'Interbairros / Circulares' },
  ] as const;

  const filteredLines = useMemo(() => {
    return lines.filter(line => {
      const q = query.toLowerCase().trim();
      const matchesQuery = !q ||
        line.code.toLowerCase().includes(q) ||
        line.name.toLowerCase().includes(q);

      if (!matchesQuery) return false;

      const codeNum = parseInt(line.code, 10);

      switch (activeFilter) {
        case 'troncal':
          return line.category === 'troncal' || ['640', '300', '448', '500', '560', '652', '650', '678', '357'].includes(line.code);
        case 'alimentadora':
          return line.code.startsWith('A') || (line.code.startsWith('0') && !isNaN(codeNum) && codeNum >= 40);
        case '700s':
          return !isNaN(codeNum) && codeNum >= 700 && codeNum <= 715;
        case 'norte':
          return !isNaN(codeNum) && codeNum >= 300 && codeNum <= 499;
        case 'leste':
          return !isNaN(codeNum) && codeNum >= 500 && codeNum <= 699;
        case 'interbairros':
          return line.category === 'interbairros' || line.category === 'circular' || ['001', '002', '004', '008', '010'].includes(line.code);
        case 'all':
        default:
          return true;
      }
    });
  }, [lines, query, activeFilter]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'rgba(5, 8, 17, 0.82)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      {/* Safe Area Spacer + Header */}
      <div
        style={{
          paddingTop: 'max(env(safe-area-inset-top, 54px), 54px)',
          paddingLeft: '18px',
          paddingRight: '18px',
          paddingBottom: '14px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(15, 23, 42, 0.95)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bus size={18} color="var(--color-accent)" />
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Rede de Ônibus de Manaus
              </h2>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Mapeamento completo: Linhas 001 até 715 & Bacia A (A030 a A626)
            </p>
          </div>

          <button
            onClick={() => {
              haptic.lightTap();
              onClose();
            }}
            className="interactive-tap"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Input Box */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-canvas)',
            border: '1px solid var(--border-medium)',
            borderRadius: '14px',
            padding: '10px 14px',
            gap: '10px'
          }}
        >
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Digite o número (ex: 640, 715, A030, A626) ou destino..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '14px',
              fontWeight: 500
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Horizontal Category Filters */}
        <div
          className="hide-scrollbar"
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingTop: '12px',
            touchAction: 'pan-x'
          }}
        >
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  haptic.lightTap();
                  setActiveFilter(tab.id as any);
                }}
                className="interactive-tap"
                style={{
                  whiteSpace: 'nowrap',
                  padding: '6px 12px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: isActive ? '1px solid var(--color-accent)' : '1px solid var(--border-subtle)',
                  background: isActive ? 'rgba(37, 99, 235, 0.2)' : 'var(--bg-surface-elevated)',
                  color: isActive ? '#93C5FD' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header Count */}
      <div
        style={{
          padding: '10px 18px',
          background: 'rgba(9, 13, 22, 0.7)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {filteredLines.length} Linhas encontradas
        </span>
        <span style={{ fontSize: '11px', color: 'var(--color-success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-success)', display: 'inline-block' }} />
          Sistema IMMU Online
        </span>
      </div>

      {/* Scrollable Lines List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '14px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {filteredLines.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <Layers size={36} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-secondary)' }}>Nenhuma linha encontrada</p>
            <p style={{ fontSize: '12px', marginTop: '4px' }}>Tente buscar pelo código (ex: 640, 715, A030, A626)</p>
          </div>
        ) : (
          filteredLines.map((line) => {
            const isSelected = selectedLine?.code === line.code;
            const isTroncal = line.category === 'troncal' || ['640', '300', '448', '560', '652', '650'].includes(line.code);
            const isAlimentadora = line.code.startsWith('A') || (line.code.startsWith('0') && parseInt(line.code, 10) >= 40);
            const is700 = parseInt(line.code, 10) >= 700;

            const categoryLabel = isTroncal ? 'Linha Troncal' : isAlimentadora ? 'Bacia Alimentadora A' : is700 ? 'Zona Sul / Porto' : 'Convencional';
            const categoryBadgeColor = isTroncal ? '#2563EB' : isAlimentadora ? '#059669' : is700 ? '#475569' : '#3B82F6';

            return (
              <div
                key={line.id || line.code}
                onClick={() => {
                  haptic.mediumTap();
                  onSelectLine(line);
                  onClose();
                }}
                className="interactive-tap"
                style={{
                  background: isSelected ? 'rgba(37, 99, 235, 0.16)' : 'var(--bg-surface-elevated)',
                  border: isSelected ? '1.5px solid var(--color-accent)' : '1px solid var(--border-subtle)',
                  borderRadius: '16px',
                  padding: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  transition: 'all 0.15s ease'
                }}
              >
                {/* Left: Code badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    className="font-mono-num"
                    style={{
                      background: isSelected ? 'var(--color-accent)' : '#0F172A',
                      border: `1.5px solid ${categoryBadgeColor}`,
                      color: '#FFFFFF',
                      fontSize: '18px',
                      fontWeight: 800,
                      minWidth: '56px',
                      height: '46px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'var(--shadow-subtle)'
                    }}
                  >
                    {line.code}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: `${categoryBadgeColor}26`,
                          color: isTroncal ? '#93C5FD' : isAlimentadora ? '#6EE7B7' : '#CBD5E1'
                        }}
                      >
                        {categoryLabel}
                      </span>
                      {line.code === '715' && (
                        <span style={{ fontSize: '10px', fontWeight: 700, background: '#7C3AED26', color: '#C4B5FD', padding: '2px 6px', borderRadius: '4px' }}>
                          Linha Terminal Sul
                        </span>
                      )}
                      {line.code === 'A626' && (
                        <span style={{ fontSize: '10px', fontWeight: 700, background: '#05966926', color: '#6EE7B7', padding: '2px 6px', borderRadius: '4px' }}>
                          Termo Bacia A
                        </span>
                      )}
                    </div>

                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: '1.25' }}>
                      {line.name}
                    </h4>

                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>Partidas diárias ativas</span>
                      <span>•</span>
                      <span>GPS Oficial 4.5s</span>
                    </div>
                  </div>
                </div>

                {/* Right Arrow Icon */}
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--bg-canvas)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isSelected ? 'var(--color-accent)' : 'var(--text-muted)',
                    flexShrink: 0
                  }}
                >
                  <ArrowRight size={16} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
