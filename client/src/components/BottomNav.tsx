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
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
        left: '16px',
        right: '16px',
        maxWidth: '420px',
        margin: '0 auto',
        zIndex: 90,
        backgroundColor: 'rgba(18, 18, 22, 0.85)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        backdropFilter: 'blur(24px) saturate(180%)',
        borderRadius: '32px',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        height: '60px',
        padding: '0 8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.65), 0 2px 8px rgba(0, 0, 0, 0.4)',
        userSelect: 'none',
        WebkitUserSelect: 'none'
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
              background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
              color: isActive ? '#FFFFFF' : '#A1A1AA',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              position: 'relative',
              outline: 'none',
              padding: '2px 0'
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
                color={isActive ? '#FFFFFF' : '#A1A1AA'}
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
    </nav>
  );
};
