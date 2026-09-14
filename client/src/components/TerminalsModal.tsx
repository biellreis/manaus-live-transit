import React from 'react';
import type { TransitHub } from '../types/transit.js';
import { X, ArrowRight } from 'lucide-react';
import { useHaptic } from '../hooks/useHaptic.js';

interface TerminalsModalProps {
  terminals: TransitHub[];
  isOpen: boolean;
  onClose: () => void;
  onSelectTerminal: (hub: TransitHub) => void;
}

export const TerminalsModal: React.FC<TerminalsModalProps> = ({
  terminals,
  isOpen,
  onClose,
  onSelectTerminal
}) => {
  const haptic = useHaptic();
  if (!isOpen) return null;

  const terminalsOnly = terminals.filter(t => t.type === 'terminal');
  const stationsOnly = terminals.filter(t => t.type === 'station');

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(12px)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center'
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '85dvh',
          borderTopLeftRadius: '28px',
          borderTopRightRadius: '28px',
          padding: '20px 18px',
          display: 'flex',
          flexDirection: 'column',
          borderTop: '1px solid var(--border-medium)',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.7)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Terminais e Estações de Manaus
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Toque para localizar e filtrar ônibus que passam pelo local
            </p>
          </div>

          <button
            onClick={() => {
              haptic.lightTap();
              onClose();
            }}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable List */}
        <div className="scroll-container" style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
          {/* Terminais T1 - T6 */}
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-amber)', letterSpacing: '0.5px', marginBottom: '10px' }}>
            TERMINAIS DE INTEGRAÇÃO (T1 A T6)
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
            {terminalsOnly.map((hub) => (
              <div
                key={hub.id}
                onClick={() => {
                  haptic.mediumTap();
                  onSelectTerminal(hub);
                  onClose();
                }}
                className="interactive-tap glass-card"
                style={{
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: 'rgba(255, 176, 32, 0.15)',
                      border: '1.5px solid var(--color-amber)',
                      color: 'var(--color-amber)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '15px'
                    }}
                  >
                    {hub.shortName}
                  </div>

                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {hub.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {hub.address}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-mint)', marginTop: '2px', fontWeight: 600 }}>
                      Linhas: {hub.keyLines.join(', ')}...
                    </div>
                  </div>
                </div>

                <ArrowRight size={18} color="var(--text-muted)" />
              </div>
            ))}
          </div>

          {/* Estações de Transferência E1 - E4 */}
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-mint)', letterSpacing: '0.5px', marginBottom: '10px' }}>
            ESTAÇÕES DO CORREDOR (E1 A E4)
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {stationsOnly.map((hub) => (
              <div
                key={hub.id}
                onClick={() => {
                  haptic.mediumTap();
                  onSelectTerminal(hub);
                  onClose();
                }}
                className="interactive-tap glass-card"
                style={{
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: 'rgba(0, 229, 163, 0.15)',
                      border: '1.5px solid var(--color-mint)',
                      color: 'var(--color-mint)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '15px'
                    }}
                  >
                    {hub.shortName}
                  </div>

                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {hub.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {hub.address}
                    </div>
                  </div>
                </div>

                <ArrowRight size={18} color="var(--text-muted)" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
