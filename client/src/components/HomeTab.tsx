import React from 'react';
import { Search, Clock, MapPin, Bus, Compass, ArrowRight, ShieldCheck } from 'lucide-react';
import type { RouteSummary, TransitHub, LiveBus, StopInfo } from '../types/transit.js';
import type { UserLocation } from '../hooks/useUserLocation.js';
import { useHaptic } from '../hooks/useHaptic.js';
import { HomeMiniMap } from './HomeMiniMap.js';
import { getBusLineColor } from '../utils/transitColors.js';

interface HomeTabProps {
  lines: RouteSummary[];
  terminals: TransitHub[];
  vehicles: LiveBus[];
  stops?: StopInfo[];
  userLocation: UserLocation;
  onSelectLine: (line: RouteSummary) => void;
  onOpenSearch: () => void;
  onNavigateTab: (tab: 'lines' | 'stops' | 'alerts') => void;
  onRequestGPS: () => void;
  onOpenFullMap: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  lines,
  terminals: _terminals,
  vehicles,
  stops = [],
  userLocation,
  onSelectLine,
  onOpenSearch,
  onNavigateTab,
  onRequestGPS,
  onOpenFullMap
}) => {
  const haptic = useHaptic();

  // Frequent destinations in Manaus with official line codes
  const recentDestinations = [
    {
      title: 'Terminal 1 - Constantino Nery',
      address: 'Av. Constantino Nery, 5286 - Centro / Flores',
      lineCode: '640'
    },
    {
      title: 'Terminal 4 - Jorge Teixeira',
      address: 'Av. Camapuã, Jorge Teixeira - Manaus',
      lineCode: '300'
    },
    {
      title: 'Baratão da Carne - Torres',
      address: 'Av. Governador José Lindoso - Parque 10',
      lineCode: '448'
    },
    {
      title: 'Manauara Shopping',
      address: 'Av. Mário Ypiranga, 1300 - Adrianópolis',
      lineCode: '652'
    }
  ];

  const handleDestinationClick = (lineCode: string) => {
    haptic.mediumTap();
    const line = lines.find(l => l.code === lineCode) || lines[0];
    if (line) {
      onSelectLine(line);
    }
  };

  return (
    <div
      id="home-tab-screen"
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
      {/* Top Header with Welcome Typography (Logo removed per user request) */}
      <div
        style={{
          paddingTop: 'max(env(safe-area-inset-top, 0px), 16px)',
          paddingLeft: '18px',
          paddingRight: '18px',
          paddingBottom: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px'
        }}
      >
        <h1
          style={{
            fontSize: '22px',
            fontWeight: 800,
            color: 'var(--text-primary, #FFFFFF)',
            letterSpacing: '-0.03em',
            margin: 0
          }}
        >
          Olá, Passageiro!
        </h1>
      </div>

      {/* 99 Style Live Interactive Mini-Map at the top */}
      <div style={{ padding: '0 18px 12px 18px' }}>
        <HomeMiniMap
          userLocation={userLocation}
          vehicles={vehicles}
          stops={stops}
          onExpandMap={onOpenFullMap}
          onRequestGPS={onRequestGPS}
        />
      </div>

      {/* Prominent Uber/99 Search Pill Bar */}
      <div style={{ padding: '0 18px 12px 18px' }}>
        <div
          id="home-search-trigger"
          onClick={() => {
            haptic.mediumTap();
            onOpenSearch();
          }}
          style={{
            backgroundColor: 'var(--bg-card, #18181B)',
            borderRadius: '999px',
            padding: '11px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-card, 0 4px 16px rgba(0, 0, 0, 0.4))',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.1))',
            cursor: 'pointer',
            transition: 'transform 0.1s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Search size={18} color="var(--text-primary, #FFFFFF)" />
            <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-muted, #A1A1AA)' }}>
              Para onde vamos?
            </span>
          </div>

          <div
            style={{
              padding: '5px 12px',
              borderRadius: '999px',
              backgroundColor: 'var(--bg-pill, #27272A)',
              fontSize: '11.5px',
              fontWeight: 700,
              color: 'var(--text-primary, #FFFFFF)',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Bus size={12} />
            <span>Linhas</span>
          </div>
        </div>
      </div>

      {/* Frequent / Recent Destinations (Directly under Search - Uber / 99 style) */}
      <div style={{ padding: '0 18px 16px 18px' }}>
        <div
          style={{
            backgroundColor: 'var(--bg-card, #18181B)',
            borderRadius: '18px',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-card, 0 4px 16px rgba(0, 0, 0, 0.4))'
          }}
        >
          {recentDestinations.slice(0, 2).map((dest, idx) => {
            const colorInfo = getBusLineColor(dest.lineCode);
            return (
              <div
                key={idx}
                onClick={() => handleDestinationClick(dest.lineCode)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderBottom: idx === 0 ? '1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))' : 'none',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--bg-pill, #27272A)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-muted, #A1A1AA)',
                      flexShrink: 0
                    }}
                  >
                    <Clock size={15} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary, #FFFFFF)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {dest.title}
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted, #71717A)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {dest.address}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '8px', flexShrink: 0 }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '2px 7px',
                      borderRadius: '6px',
                      backgroundColor: colorInfo.badgeBg,
                      color: colorInfo.accent,
                      border: `1px solid ${colorInfo.border}`
                    }}
                  >
                    {dest.lineCode}
                  </span>
                  <ArrowRight size={14} color="var(--text-muted, #71717A)" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* "Para você" section with clear, intuitive names that everyday commuters understand */}
      <div style={{ padding: '0 18px 18px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary, #FFFFFF)', letterSpacing: '-0.02em' }}>
            Para você
          </div>
          <span style={{ fontSize: '11.5px', color: 'var(--text-muted, #71717A)', fontWeight: 600 }}>Atalhos</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
          {/* Item 1: Ônibus Direto (Expressas dos Terminais) */}
          <div
            onClick={() => {
              haptic.lightTap();
              onNavigateTab('lines');
            }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-card, #18181B)',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-card, 0 4px 12px rgba(0, 0, 0, 0.4))'
              }}
            >
              <Bus size={24} color="#3B82F6" />
            </div>
            <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-primary, #E4E4E7)', marginTop: '8px', textAlign: 'center' }}>
              Ônibus Direto
            </span>
          </div>

          {/* Item 2: Terminais (T1 ao T6) */}
          <div
            onClick={() => {
              haptic.lightTap();
              onNavigateTab('stops');
            }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-card, #18181B)',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-card, 0 4px 12px rgba(0, 0, 0, 0.4))'
              }}
            >
              <MapPin size={23} color="#F97316" />
            </div>
            <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-primary, #E4E4E7)', marginTop: '8px', textAlign: 'center' }}>
              Terminais
            </span>
          </div>

          {/* Item 3: Bairros (Linhas que ligam bairros aos terminais) */}
          <div
            onClick={() => {
              haptic.lightTap();
              onNavigateTab('lines');
            }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-card, #18181B)',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-card, 0 4px 12px rgba(0, 0, 0, 0.4))'
              }}
            >
              <Compass size={23} color="#3B82F6" />
            </div>
            <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-primary, #E4E4E7)', marginTop: '8px', textAlign: 'center' }}>
              Bairros
            </span>
          </div>

          {/* Item 4: Trânsito (Situação das vias) */}
          <div
            onClick={() => {
              haptic.lightTap();
              onNavigateTab('alerts');
            }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-card, #18181B)',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-card, 0 4px 12px rgba(0, 0, 0, 0.4))'
              }}
            >
              <ShieldCheck size={23} color="#F97316" />
            </div>
            <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-primary, #E4E4E7)', marginTop: '8px', textAlign: 'center' }}>
              Trânsito
            </span>
          </div>
        </div>
      </div>

      {/* Rotas Mais Populares de Manaus */}
      <div style={{ padding: '0 20px 24px 20px' }}>
        <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary, #FFFFFF)', marginBottom: '12px', letterSpacing: '-0.02em' }}>
          Principais Linhas de Manaus
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {lines.slice(0, 4).map((line) => {
            const colorInfo = getBusLineColor(line.code);
            return (
              <div
                key={line.id}
                onClick={() => {
                  haptic.mediumTap();
                  onSelectLine(line);
                }}
                style={{
                  backgroundColor: 'var(--bg-card, #18181B)',
                  borderRadius: '16px',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-card, 0 4px 12px rgba(0, 0, 0, 0.3))'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      backgroundColor: colorInfo.bg,
                      color: colorInfo.text,
                      borderRadius: '10px',
                      padding: '8px 12px',
                      fontSize: '16px',
                      fontWeight: 800,
                      minWidth: '54px',
                      textAlign: 'center',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.5)'
                    }}
                  >
                    {line.code}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary, #FFFFFF)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {line.name}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted, #71717A)', marginTop: '2px' }}>
                      {colorInfo.serviceType} • Manaus
                    </div>
                  </div>
                </div>

                <ArrowRight size={18} color="var(--text-muted, #71717A)" style={{ marginLeft: '12px', flexShrink: 0 }} />
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
