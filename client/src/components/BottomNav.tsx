import React from 'react';
import { Home, Bus, MapPin, Bell } from 'lucide-react';
import { useHaptic } from '../hooks/useHaptic.js';

export type TabType = 'home' | 'lines' | 'stops' | 'alerts';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  unreadAlertsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  unreadAlertsCount = 0
}) => {
  const haptic = useHaptic();

  const handleSelect = (tab: TabType) => {
    if (tab !== activeTab) {
      haptic.lightTap();
      onTabChange(tab);
    }
  };

  const navItems = [
    {
      id: 'home' as TabType,
      label: 'Início',
      icon: Home,
    },
    {
      id: 'lines' as TabType,
      label: 'Linhas',
      icon: Bus,
    },
    {
      id: 'stops' as TabType,
      label: 'Terminais',
      icon: MapPin,
    },
    {
      id: 'alerts' as TabType,
      label: 'Alertas',
      icon: Bell,
      badge: unreadAlertsCount > 0 ? unreadAlertsCount : undefined
    }
  ];

  return (
    <nav
      id="native-bottom-nav"
      aria-label="Navegação Principal"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 90,
        backgroundColor: 'rgba(12, 12, 15, 0.85)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.5)',
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}
    >
      {/* 52px Active Control Bar (Centered, identical height on all devices) */}
      <div
        style={{
          height: '52px',
          width: '100%',
          maxWidth: '540px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '0 8px'
        }}
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const IconComponent = item.icon;

          return (
            <button
              key={item.id}
              id={`tab-button-${item.id}`}
              onClick={() => handleSelect(item.id)}
              style={{
                flex: 1,
                height: '46px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: isActive ? '#FFFFFF' : '#71717A',
                transition: 'color 0.15s ease',
                position: 'relative',
                outline: 'none',
                padding: 0
              }}
            >
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '24px'
                }}
              >
                <IconComponent
                  size={21}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  color={isActive ? '#FFFFFF' : '#71717A'}
                />
                {item.badge && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-3px',
                      right: '-2px',
                      width: '15px',
                      height: '15px',
                      borderRadius: '50%',
                      backgroundColor: '#F97316',
                      color: '#FFFFFF',
                      fontSize: '9px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #000000'
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                style={{
                  fontSize: '10.5px',
                  fontWeight: isActive ? 700 : 500,
                  letterSpacing: '-0.01em',
                  lineHeight: 1
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Native Gesture Safe Area Extension (Fills the frosted glass down to the physical screen edge) */}
      <div
        style={{
          height: 'env(safe-area-inset-bottom, 0px)',
          width: '100%',
          flexShrink: 0
        }}
      />
    </nav>
  );
};
