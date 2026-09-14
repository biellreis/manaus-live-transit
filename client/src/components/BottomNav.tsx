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
        backgroundColor: '#09090B',
        borderTop: 'none',
        paddingTop: '8px',
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)',
        paddingLeft: '12px',
        paddingRight: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.8)',
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
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '4px 0',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: isActive ? '#FFFFFF' : '#71717A',
              transition: 'all 0.15s ease',
              position: 'relative',
              outline: 'none'
            }}
          >
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '26px'
              }}
            >
              <IconComponent
                size={22}
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
                fontSize: '11px',
                fontWeight: isActive ? 700 : 500,
                letterSpacing: '-0.01em'
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
