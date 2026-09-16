import React, { useState, useRef, useEffect } from 'react';
import { Search, X, MapPin, Check, Layers } from 'lucide-react';
import type { RouteSummary } from '../types/transit.js';
import { useHaptic } from '../hooks/useHaptic.js';

interface SearchBarProps {
  lines: RouteSummary[];
  selectedLine: RouteSummary | null;
  onSelectLine: (line: RouteSummary) => void;
  onOpenTerminals: () => void;
  onOpenExplorer: () => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  isConnected?: boolean;
  vehiclesCount?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  lines,
  selectedLine,
  onSelectLine,
  onOpenTerminals,
  onOpenExplorer,
  selectedCategory,
  onSelectCategory,
  isConnected = true,
  vehiclesCount = 0
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const haptic = useHaptic();

  // Filtered lines list
  const filteredLines = lines.filter(line => {
    const matchesQuery = query === '' ||
      line.code.toLowerCase().includes(query.toLowerCase()) ||
      line.name.toLowerCase().includes(query.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || line.category === selectedCategory;

    return matchesQuery && matchesCategory;
  }).slice(0, 20);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = () => {
    haptic.lightTap();
    setQuery('');
    inputRef.current?.focus();
  };

  const handleSelect = (line: RouteSummary) => {
    haptic.mediumTap();
    onSelectLine(line);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 'calc(var(--sat) + 8px)',
        left: '16px',
        right: '16px',
        zIndex: 20
      }}
    >
      {/* Floating Uber-Style Search Input Card */}
      <div
        className="glass-panel"
        style={{
          borderRadius: '16px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: 'var(--shadow-card)',
          border: isOpen ? '1px solid var(--border-medium)' : '1px solid var(--border-subtle)',
          transition: 'all 0.15s ease'
        }}
      >
        <Search size={18} color={isOpen ? 'var(--text-primary)' : 'var(--text-muted)'} />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            haptic.lightTap();
            setIsOpen(true);
          }}
          placeholder={selectedLine ? `Linha ${selectedLine.code} • ${selectedLine.name.split('-')[1]?.trim() || selectedLine.name}` : 'Buscar linha de ônibus...'}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '14px',
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        />

        {query && (
          <button
            onClick={handleClear}
            className="interactive-tap"
            style={{
              background: 'transparent',
              border: 'none',
              padding: '4px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={16} />
          </button>
        )}

        {/* Live GPS Telemetry Status Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 8px',
            borderRadius: '999px',
            background: isConnected ? 'rgba(5, 150, 105, 0.12)' : 'rgba(220, 38, 38, 0.12)',
            border: `1px solid ${isConnected ? 'rgba(5, 150, 105, 0.3)' : 'rgba(220, 38, 38, 0.3)'}`,
            flexShrink: 0
          }}
        >
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: isConnected ? 'var(--color-success)' : 'var(--color-danger)'
            }}
          />
          <span
            className="font-mono-num"
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: isConnected ? '#6EE7B7' : '#FCA5A5'
            }}
          >
            {vehiclesCount} ativos
          </span>
        </div>

        {/* Terminals Hubs Button */}
        <button
          onClick={() => {
            haptic.lightTap();
            onOpenTerminals();
          }}
          className="interactive-tap"
          title="Ver Terminais T1 a T6 e Estações E1 a E4"
          style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-medium)',
            borderRadius: '10px',
            padding: '5px 10px',
            color: 'var(--text-primary)',
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          <MapPin size={13} color="var(--color-warning)" />
          <span>Terminais</span>
        </button>
      </div>

      {/* Categories & Line Explorer Bar */}
      <div
        className="hide-scrollbar"
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingTop: '8px',
          touchAction: 'pan-x'
        }}
      >
        <button
          onClick={() => {
            haptic.lightTap();
            onOpenExplorer();
          }}
          className="interactive-tap"
          style={{
            whiteSpace: 'nowrap',
            padding: '5px 12px',
            borderRadius: '999px',
            fontSize: '11px',
            fontWeight: 700,
            border: '1px solid rgba(37, 99, 235, 0.5)',
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.3), rgba(30, 58, 138, 0.4))',
            color: '#93C5FD',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            boxShadow: 'var(--shadow-subtle)'
          }}
        >
          <Layers size={13} />
          <span>Todas as Linhas (240+)</span>
        </button>

        {[
          { id: 'all', label: 'Ver Malha' },
          { id: 'troncal', label: 'Linhas Troncais' },
          { id: 'alimentadora', label: 'Alimentadoras (Bacia A)' },
          { id: 'convencional', label: 'Convencionais (até 715)' },
          { id: 'circulares', label: 'Circulares' },
          { id: 'interbairros', label: 'Interbairros' }
        ].map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                haptic.lightTap();
                onSelectCategory(cat.id);
              }}
              className="interactive-tap"
              style={{
                whiteSpace: 'nowrap',
                padding: '5px 11px',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: 600,
                border: isActive ? '1px solid var(--color-accent)' : '1px solid var(--border-subtle)',
                background: isActive ? 'rgba(37, 99, 235, 0.2)' : 'var(--bg-card, rgba(15, 23, 42, 0.85))',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Auto-suggest Results Dropdown */}
      {isOpen && (
        <div
          className="glass-panel"
          style={{
            marginTop: '8px',
            borderRadius: '16px',
            maxHeight: '320px',
            overflowY: 'auto',
            border: '1px solid var(--border-medium)',
            boxShadow: 'var(--shadow-sheet)'
          }}
        >
          {filteredLines.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              Nenhuma linha encontrada para "{query}".
              <div style={{ marginTop: '8px' }}>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenExplorer();
                  }}
                  style={{
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--color-accent)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Abrir Catálogo Completo
                </button>
              </div>
            </div>
          ) : (
            filteredLines.map((line) => {
              const isSelected = selectedLine?.id === line.id;
              return (
                <div
                  key={line.id}
                  onClick={() => handleSelect(line)}
                  className="interactive-tap"
                  style={{
                    padding: '12px 14px',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(37, 99, 235, 0.12)' : 'transparent'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      className="font-mono-num"
                      style={{
                        background: '#1E293B',
                        border: '1px solid var(--border-medium)',
                        color: '#F8FAFC',
                        fontSize: '13px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}
                    >
                      {line.code}
                    </div>

                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {line.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {line.category.toUpperCase()} • Linha Oficial
                      </div>
                    </div>
                  </div>

                  {isSelected && <Check size={16} color="var(--color-accent)" />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
