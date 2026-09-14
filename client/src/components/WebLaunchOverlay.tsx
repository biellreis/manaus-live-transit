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

    // Otherwise (Browser / PWA on Android or iPhone Safari), play 2.2s motion splash screen
    const timer = setTimeout(() => {
      setFading(true);
      const dismissTimer = setTimeout(() => {
        setVisible(false);
      }, 250);
      return () => clearTimeout(dismissTimer);
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fading ? 0 : 1,
        transition: 'opacity 250ms ease-out',
        pointerEvents: fading ? 'none' : 'auto',
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}
    >
      <style>{`
        @keyframes manoSlideUp {
          0% { opacity: 0; transform: translateY(20px) scale(0.92); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes manoDrawM {
          0% { stroke-dashoffset: 400; opacity: 0; }
          30% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 1; }
        }
        @keyframes manoArrowPulse {
          0% { opacity: 0; transform: scale(0.6) translate(-8px, 8px); }
          60% { opacity: 1; transform: scale(1.1) translate(0, 0); }
          100% { opacity: 1; transform: scale(1) translate(0, 0); }
        }
        @keyframes manoNameFade {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .mano-plate-box {
          animation: manoSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .mano-m-path {
          stroke-dasharray: 400;
          stroke-dashoffset: 400;
          animation: manoDrawM 1.1s cubic-bezier(0.4, 0, 0.2, 1) 0.3s forwards;
        }
        .mano-arrow-icon {
          animation: manoArrowPulse 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.8s forwards;
          opacity: 0;
        }
        .mano-name-text {
          animation: manoNameFade 0.6s ease-out 1.2s forwards;
          opacity: 0;
        }
      `}</style>

      <div className="mano-plate-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* SVG Logo Component matching native assets */}
        <div style={{ position: 'relative', width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Dark background plate rounded container */}
            <rect width="140" height="140" rx="32" fill="#0D131F" />
            
            {/* Route 'M' Path */}
            <path
              className="mano-m-path"
              d="M32 92 V58 C32 44 46 44 46 58 V76 C46 90 60 90 60 76 V58 C60 44 74 44 74 58 V76 C74 90 88 90 88 76 V58 C88 44 102 44 102 58 V92"
              stroke="#1E293B"
              strokeWidth="11"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              className="mano-m-path"
              d="M32 92 V58 C32 44 46 44 46 58 V76 C46 90 60 90 60 76 V58 C60 44 74 44 74 58 V76 C74 90 88 90 88 76 V58 C88 44 102 44 102 58 V92"
              stroke="#38BDF8"
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Navigation Yellow Arrow Accent */}
            <g className="mano-arrow-icon">
              <path
                d="M72 44 L92 64 L78 68 L72 44 Z"
                fill="#FACC15"
              />
            </g>
          </svg>
        </div>

        {/* App Name: MANÔ */}
        <div className="mano-name-text" style={{ marginTop: 24, textAlign: 'center' }}>
          <span
            style={{
              fontFamily: "'Outfit', system-ui, -apple-system, sans-serif",
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: '0.18em',
              color: '#0D131F',
              textTransform: 'uppercase'
            }}
          >
            MAN<span style={{ color: '#EAB308' }}>Ô</span>
          </span>
        </div>
      </div>
    </div>
  );
}
