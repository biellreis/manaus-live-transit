import React, { useState, useEffect, useMemo } from 'react';
import { RotateCw, AlertOctagon, AlertTriangle, ShieldAlert, Info } from 'lucide-react';
import { useHaptic } from '../hooks/useHaptic.js';
import type { RouteSummary } from '../types/transit.js';
import type { TrafficApiResponse } from '../types/trafficAlerts.js';
import { hasActiveAlertEndTime, hasFreshAlertSource } from '../utils/trafficAlertFreshness.js';
import { getTrafficAlertBadge, getTrafficAlertSourceText, type TrafficAlertBadgeKind } from '../utils/trafficAlertPresentation.js';

interface AlertsTabProps {
  lines?: RouteSummary[];
  onSelectLine?: (line: RouteSummary) => void;
}

const LOCAL_STORAGE_KEY = 'mano_alerts_cache';
let memoryAlertsCache: TrafficApiResponse | null = null;
const BADGE_STYLE: Record<TrafficAlertBadgeKind, { bg: string; icon: typeof Info }> = {
  accidents: { bg: '#DC2626', icon: AlertOctagon },
  jams: { bg: '#D97706', icon: AlertTriangle },
  police: { bg: '#2563EB', icon: ShieldAlert },
  hazards: { bg: '#EA580C', icon: AlertTriangle },
  other: { bg: '#71717A', icon: Info }
};

function getInitialTrafficData(): TrafficApiResponse | null {
  if (memoryAlertsCache && hasFreshAlertSource(memoryAlertsCache.source)) return memoryAlertsCache;
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.alerts) && hasFreshAlertSource(parsed.source)) {
        memoryAlertsCache = parsed;
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

export const AlertsTab: React.FC<AlertsTabProps> = ({
  lines: _lines,
  onSelectLine: _onSelectLine
}) => {
  const [loadError, setLoadError] = useState(false);
  const initialData = useMemo(() => getInitialTrafficData(), []);
  const [trafficData, setTrafficData] = useState<TrafficApiResponse | null>(initialData);
  const [isLoading, setIsLoading] = useState(() => !initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'accidents' | 'jams' | 'police'>(() => {
    const f = new URLSearchParams(window.location.search).get('filter');
    return (f === 'accidents' || f === 'jams' || f === 'police') ? f : 'all';
  });
  const haptic = useHaptic();

  const fetchTrafficData = async () => {
    try {
      const resp = await fetch('/api/traffic/alerts', { signal: AbortSignal.timeout(15000) });
      if (!resp.ok) throw new Error('Serviço indisponível');
      if (resp.ok) {
        const data: TrafficApiResponse = await resp.json();
        if (!Array.isArray(data.alerts)) throw new Error('Resposta de ocorrências inválida');
        setTrafficData(data);
        memoryAlertsCache = data;
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
        } catch {
          // ignore storage quota
        }
        setLoadError(false);
      }
    } catch (err) {
      console.warn('[AlertsTab] Erro ao carregar alertas de trânsito:', err);
      setLoadError(true);
      setTrafficData(previous => hasFreshAlertSource(previous?.source) ? previous : null);
    } finally {
      setIsLoading(false);
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

  const feedAvailable = hasFreshAlertSource(trafficData?.source);
  const rawAlerts = feedAvailable
    ? (trafficData?.alerts || []).filter(alert => hasActiveAlertEndTime(alert.endTime))
    : [];
  const sourceStatusText = getTrafficAlertSourceText(trafficData?.source, {
    isLoading,
    hasData: Boolean(trafficData),
    loadError
  });

  // Filter alerts based on active category
  const filteredAlerts = useMemo(() => {
    return rawAlerts.filter(a => {
      if (selectedFilter === 'accidents') {
        return a.category === 'accidents';
      }
      if (selectedFilter === 'jams') {
        return a.category === 'jams';
      }
      if (selectedFilter === 'police') {
        return a.category === 'police';
      }
      return true; // 'all'
    });
  }, [rawAlerts, selectedFilter]);

  return (
    <div
      id="alerts-tab-screen"
      className="scroll-container"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 5,
        backgroundColor: 'var(--bg-canvas, #09090B)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 90px)',
        overflowY: 'auto',
        color: 'var(--text-primary, #FFFFFF)'
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
              color: 'var(--text-primary, #FFFFFF)',
              letterSpacing: '-0.03em',
              margin: 0
            }}
          >
            Alertas do Trânsito
          </h1>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--text-muted, #A1A1AA)',
              margin: '4px 0 0 0',
              fontWeight: 500
            }}
          >
            Ocorrências reportadas em Manaus
          </p>
        </div>

        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          style={{
            backgroundColor: 'var(--bg-card, #18181B)',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
            borderRadius: '50%',
            width: '42px',
            height: '42px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#3B82F6',
            boxShadow: 'var(--shadow-card, 0 4px 14px rgba(0, 0, 0, 0.4))',
            outline: 'none',
            flexShrink: 0
          }}
          aria-label="Atualizar alertas de trânsito"
          disabled={isRefreshing}
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

      <div
        role="status"
        style={{
          margin: '0 20px 14px',
          padding: '10px 14px',
          background: 'var(--bg-card, #18181B)',
          borderRadius: 12,
          border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
          fontSize: '13px',
          color: 'var(--text-muted, #A1A1AA)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isRefreshing || trafficData?.source?.status === 'updating' || (loadError && feedAvailable) ? '#F59E0B' : (feedAvailable ? '#10B981' : '#71717A'),
              display: 'inline-block'
            }}
          />
          <span style={{ fontWeight: 600, color: 'var(--text-primary, #E4E4E7)' }}>
            {sourceStatusText}
          </span>
        </div>
        {isRefreshing && (
          <span style={{ fontSize: '11px', color: '#F59E0B', fontWeight: 600 }}>
            Atualizando...
          </span>
        )}
      </div>
      {!isLoading && !feedAvailable && (
        <div role="status" style={{ margin: '0 20px 16px', padding: '20px', borderRadius: 16, background: 'var(--bg-card, #18181B)', border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))' }}>
          <strong style={{ color: 'var(--text-primary, #FFFFFF)', fontSize: 15 }}>Ocorrências indisponíveis no momento</strong>
          <p style={{ color: 'var(--text-muted, #A1A1AA)', fontSize: 13, lineHeight: 1.5, margin: '6px 0 0' }}>
            Não há dados recentes de ocorrências para mostrar. A ausência de dados não indica trânsito livre.
          </p>
        </div>
      )}
      {/* Category Filter Chips */}
      {feedAvailable && <div style={{ padding: '0 20px 16px 20px', display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {[
          { id: 'all', label: 'Todos os Alertas', activeColor: '#2563EB' },
          { id: 'accidents', label: 'Acidentes, obras e bloqueios', activeColor: '#DC2626' },
          { id: 'jams', label: 'Lentidão no Trânsito', activeColor: '#D97706' },
          { id: 'police', label: 'Polícia', activeColor: '#2563EB' },
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
                border: isActive ? `1px solid ${tab.activeColor}` : '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                backgroundColor: isActive ? tab.activeColor : 'var(--bg-card, #18181B)',
                color: isActive ? '#FFFFFF' : 'var(--text-muted, #A1A1AA)',
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
      </div>}

      {/* Alerts Feed */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredAlerts.map((n) => {
          const badgeInfo = getTrafficAlertBadge(n.category);
          const badge = { ...badgeInfo, ...BADGE_STYLE[badgeInfo.kind] };
          const corridorUpper = n.corridorName.toUpperCase();
          const subtitleText = n.neighborhood || 'Manaus - AM';

          return (
            <div
              key={n.id}
              style={{
                backgroundColor: 'var(--bg-card, #141417)',
                borderRadius: '18px',
                padding: '18px',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.09))',
                borderLeft: `4px solid ${badge.bg}`,
                boxShadow: 'var(--shadow-card, 0 6px 20px rgba(0, 0, 0, 0.4))',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Card Header Top Row: Pill Badge + Timestamp */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span
                  style={{
                    backgroundColor: badge.bg,
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <badge.icon size={12} strokeWidth={2.8} />
                  <span>{badge.label}</span>
                </span>

                <span style={{ fontSize: '12px', color: 'var(--text-muted, #94A3B8)', fontWeight: 600 }}>
                  Início: {n.timestamp}
                </span>
              </div>

              {/* Main Title (Corridor / Street) */}
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  color: 'var(--text-primary, #FFFFFF)',
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
                  color: 'var(--text-muted, #A1A1AA)',
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
                  color: 'var(--text-muted, #71717A)',
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
                  color: 'var(--text-secondary, #E4E4E7)',
                  lineHeight: '1.5',
                  fontWeight: 400
                }}
              >
                {n.description}
              </div>
            </div>
          );
        })}

        {/* Empty State when no alerts match (Solid 100% Blue Card, organized & diagrammed, title only) */}
        {!isLoading && feedAvailable && filteredAlerts.length === 0 && (
          <div
            style={{
              backgroundColor: 'var(--bg-card, #18181B)',
              borderRadius: '20px',
              padding: '26px 20px',
              textAlign: 'center',
              border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))',
              boxShadow: 'none',
              marginTop: '10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: 'none'
              }}
            >
              <Info size={26} strokeWidth={2.5} />
            </div>
            <div
              style={{
                fontSize: '18px',
                fontWeight: 800,
                color: 'var(--text-primary, #FFFFFF)',
                letterSpacing: '-0.02em',
                lineHeight: '1.3'
              }}
            >
              Nenhuma ocorrência listada nesta categoria
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'var(--bg-canvas, #09090B)',
                color: 'var(--text-muted, #A1A1AA)',
                padding: '6px 16px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 800,
                boxShadow: 'none'
              }}
            >
              <span>Coleta recente</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsTab;
