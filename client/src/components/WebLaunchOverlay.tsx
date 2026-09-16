import { useState, useEffect } from 'react';

export function WebLaunchOverlay() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // If running in native iOS WKWebView, native SwiftUI overlay handles motion screen
    if ((window as any).webkit?.messageHandlers?.manoLaunch) {
      setVisible(false);
      return;
    }

    // Set body background to white during motion launch so no black safe-area bar appears at bottom
    const originalBodyBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#FFFFFF';

    // Play 2.2s motion launch animation matching native iOS timing
    const timer = setTimeout(() => {
      setFading(true);
      const dismissTimer = setTimeout(() => {
        setVisible(false);
        document.body.style.backgroundColor = originalBodyBg || '#09090B';
      }, 250);
      return () => {
        clearTimeout(dismissTimer);
        document.body.style.backgroundColor = originalBodyBg || '#09090B';
      };
    }, 2200);

    return () => {
      clearTimeout(timer);
      document.body.style.backgroundColor = originalBodyBg || '#09090B';
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      id="web-motion-launch-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 999999,
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fading ? 0 : 1,
        transition: 'opacity 250ms cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: fading ? 'none' : 'auto',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        paddingTop: 'env(safe-area-inset-top, 0px)'
      }}
    >
      <style>{`
        @keyframes manoPlateIntro {
          0% { opacity: 0; transform: translateY(28px) scale(0.88); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes manoMIntro {
          0% { opacity: 0; transform: scale(0.85); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes manoArrowIntro {
          0% { opacity: 0; transform: scale(0.3) translate(-12px, 12px); }
          65% { opacity: 1; transform: scale(1.15) translate(0, 0); }
          100% { opacity: 1; transform: scale(1) translate(0, 0); }
        }
        @keyframes manoNameIntro {
          0% { opacity: 0; transform: translateY(14px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .mano-layer-plate {
          animation: manoPlateIntro 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .mano-layer-m {
          animation: manoMIntro 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s forwards;
          opacity: 0;
        }
        .mano-layer-arrow {
          animation: manoArrowIntro 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) 0.8s forwards;
          opacity: 0;
        }
        .mano-layer-name {
          animation: manoNameIntro 0.55s cubic-bezier(0.16, 1, 0.3, 1) 1.2s forwards;
          opacity: 0;
        }
      `}</style>

      {/* Center Container matching 1:1 original iOS 1093x1416 artwork canvas */}
      <div
        style={{
          position: 'relative',
          width: 140,
          height: 181,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Layer 1: Dark Plate Container */}
        <img
          src="/logo-assets/plate.png"
          alt="Fundo Logo Manô"
          className="mano-layer-plate"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }}
        />

        {/* Layer 2: M Route Line */}
        <img
          src="/logo-assets/m.png"
          alt="M Rota Manô"
          className="mano-layer-m"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }}
        />

        {/* Layer 3: Yellow GPS Arrow Accent */}
        <img
          src="/logo-assets/arrow.png"
          alt="Seta Amarela Manô"
          className="mano-layer-arrow"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }}
        />

        {/* Layer 4: Original Name Artwork (MANÔ) */}
        <img
          src="/logo-assets/name.png"
          alt="MANÔ"
          className="mano-layer-name"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>
    </div>
  );
}
