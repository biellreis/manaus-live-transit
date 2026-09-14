import React, { useState, useEffect, useMemo } from 'react';
import { RotateCw, CheckCircle2, Navigation } from 'lucide-react';
import { useHaptic } from '../hooks/useHaptic.js';
import type { RouteSummary } from '../types/transit.js';

interface TrafficAlertItem {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  corridorName: string;
  neighborhood?: string;
  title: string;
  description: string;
  timestamp: string;
}

interface TrafficApiResponse {
  timestamp: string;
  summary: {
    overallStatus: 'normal' | 'lento' | 'atencao' | 'fora_horario';
    totalTrackedBuses: number;
    activeCorridorsCount: number;
  };
  alerts: TrafficAlertItem[];
}

interface AlertsTabProps {
  lines?: RouteSummary[];
  onSelectLine?: (line: RouteSummary) => void;
}

export const AlertsTab: React.FC<AlertsTabProps> = ({
  lines: _lines,
  onSelectLine: _onSelectLine
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [trafficData, setTrafficData] = useState<TrafficApiResponse | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'accidents' | 'jams' | 'police'>('all');
  const haptic = useHaptic();

  const fetchTrafficData = async () => {
    try {
      const resp = await fetch('/api/traffic/alerts');
      if (resp.ok) {
        const data: TrafficApiResponse = await resp.json();
        setTrafficData(data);
      }
    } catch (err) {
      console.warn('[AlertsTab] Erro ao carregar alertas de trânsito:', err);
    }
  };

  useEffect(() => {
    fetchTrafficData();
    const timer = setInterval(fetchTrafficData, 30000); // 30s auto-refresh
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = async () => {
    haptic.mediumTap();
    setIsRefreshing(true);
    await fetchTrafficData();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  const rawAlerts = trafficData?.alerts || [];

  // Filter alerts based on active category
  const filteredAlerts = useMemo(() => {
    return rawAlerts.filter(a => {
      if (selectedFilter === 'accidents') {
        return a.severity === 'critical' || a.title.toLowerCase().includes('acidente') || a.title.toLowerCase().includes('interditada');
      }
      if (selectedFilter === 'jams') {
        return a.title.toLowerCase().includes('lentidão') || a.title.toLowerCase().includes('retenção') || a.title.toLowerCase().includes('perigo');
      }
      if (selectedFilter === 'police') {
        return a.title.toLowerCase().includes('blitz') || a.title.toLowerCase().includes('fiscalização') || a.severity === 'info';
      }
      return true; // 'all'
    });
  }, [rawAlerts, selectedFilter]);

  // Determine pill badge metadata based on alert properties
  const getBadgeConfig = (alert: TrafficAlertItem) => {
    const t = alert.title.toLowerCase();

    if (t.includes('acidente')) {
      return {
        label: 'ACIDENTE REPORTADO',
        bg: '#DC2626', // Red
        color: '#FFFFFF'
      };
    }
    if (t.includes('interditada') || t.includes('obras') || t.includes('bloqueio')) {
      return {
        label: 'VIA INTERDITADA',
        bg: '#EA580C', // Orange
        color: '#FFFFFF'
      };
    }
    if (t.includes('lentidão') || t.includes('engarrafamento') || t.includes('retenção') || t.includes('perigo')) {
      return {
        label: 'RETENÇÃO INTENSA',
        bg: '#D97706', // Amber
        color: '#FFFFFF'
      };
    }
    if (t.includes('fiscalização') || t.includes('blitz') || t.includes('immu')) {
      return {
        label: 'FISCALIZAÇÃO',
        bg: '#2563EB', // Blue
        color: '#FFFFFF'
      };
    }
    return {
      label: 'SISTEMA TRANSURBANO',
      bg: '#059669', // Emerald
      color: '#FFFFFF'
    };
  };

  return (
    <div
      id="alerts-tab-screen"
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
      {/* Header */}
      <div
        style={{
          paddingTop: 'max(env(safe-area-inset-top, 0px), 18px)',
          paddingLeft: '20px',
          paddingRight: '20px',
          paddingBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '26px',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-0.03em',
              margin: 0
            }}
          >
            Alertas do Trânsito
          </h1>
          <p
            style={{
              fontSize: '13px',
              color: '#A1A1AA',
              margin: '4px 0 0 0',
              fontWeight: 500
            }}
          >
            Ocorrências e trânsito em tempo real em Manaus
          </p>
        </div>

        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          style={{
            backgroundColor: '#18181B',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '50%',
            width: '42px',
            height: '42px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#3B82F6',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
            outline: 'none',
            flexShrink: 0
          }}
          title="Atualizar alertas de trânsito"
        >
          <RotateCw
            size={18}
            style={{
              transform: isRefreshing ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.4s ease'
            }}
          />
        </button>
      </div>

      {/* Category Filter Chips */}
      <div style={{ padding: '0 20px 16px 20px', display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {[
          { id: 'all', label: 'Todos os Alertas' },
          { id: 'accidents', label: 'Acidentes e Bloqueios' },
          { id: 'jams', label: 'Lentidão no Trânsito' },
          { id: 'police', label: 'Fiscalização / IMMU' },
        ].map((tab) => {
          const isActive = selectedFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                haptic.lightTap();
                setSelectedFilter(tab.id as any);
              }}
              style={{
                padding: '9px 14px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                border: isActive ? '1px solid #3B82F6' : '1px solid rgba(255, 255, 255, 0.08)',
                backgroundColor: isActive ? '#2563EB' : '#18181B',
                color: isActive ? '#FFFFFF' : '#A1A1AA',
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 0.15s ease',
                flexShrink: 0
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Alerts Feed */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredAlerts.map((n) => {
          const badge = getBadgeConfig(n);
          const corridorUpper = n.corridorName.toUpperCase();
          const subtitleText = n.neighborhood || 'Manaus - AM';

          return (
            <div
              key={n.id}
              style={{
                backgroundColor: '#141417',
                borderRadius: '18px',
                padding: '18px',
                border: '1px solid rgba(255, 255, 255, 0.09)',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Card Header Top Row: Pill Badge + Timestamp */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span
                  style={{
                    backgroundColor: badge.bg,
                    color: badge.color,
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  {badge.label}
                </span>

                <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>
                  {n.timestamp}
                </span>
              </div>

              {/* Main Title (Corridor / Street) */}
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  letterSpacing: '-0.02em',
                  lineHeight: '1.25',
                  marginBottom: '3px'
                }}
              >
                {corridorUpper}
              </div>

              {/* Subtitle (Neighborhood / Region) */}
              <div
                style={{
                  fontSize: '13px',
                  color: '#A1A1AA',
                  fontWeight: 500,
                  marginBottom: '14px'
                }}
              >
                {subtitleText}
              </div>

              {/* Occurence Details Label */}
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#71717A',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  marginBottom: '6px'
                }}
              >
                DETALHES DA OCORRÊNCIA:
              </div>

              {/* Occurence Description */}
              <div
                style={{
                  fontSize: '13.5px',
                  color: '#E4E4E7',
                  lineHeight: '1.5',
                  fontWeight: 400
                }}
              >
                {n.description}
              </div>
            </div>
          );
        })}

        {/* Empty State when no alerts match */}
        {filteredAlerts.length === 0 && (
          <div
            style={{
              backgroundColor: '#141417',
              borderRadius: '20px',
              padding: '28px 20px',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              textAlign: 'center',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4)',
              marginTop: '10px'
            }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', margin: '0 auto 12px auto' }}>
              <CheckCircle2 size={24} />
            </div>
            <div style={{ fontSize: '17px', fontWeight: 800, color: '#FFFFFF', marginBottom: '6px' }}>
              Trânsito Sem Ocorrências Graves
            </div>
            <div style={{ fontSize: '13px', color: '#94A3B8', maxWidth: '320px', margin: '0 auto 16px auto', lineHeight: '1.45' }}>
              Nenhum acidente, bloqueio ou interdição relevante reportado nas principais vias de Manaus neste momento.
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '5px 14px', borderRadius: '999px', color: '#10B981', fontSize: '12px', fontWeight: 800 }}>
              <Navigation size={13} />
              <span>Sistema de Trânsito em Tempo Real</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsTab;
