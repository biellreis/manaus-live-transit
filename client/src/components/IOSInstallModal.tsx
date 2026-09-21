interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function IOSInstallModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999999,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="ios-install-dialog-card"
        style={{
          position: 'relative',
          backgroundColor: '#141418',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          borderRadius: 28,
          width: 'min(420px, 100%)',
          maxHeight: 'calc(100vh - 40px)',
          overflowY: 'auto',
          padding: '28px 22px',
          boxSizing: 'border-box'
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar instruções"
          style={{
            position: 'absolute',
            right: 16,
            top: 16,
            width: 34,
            height: 34,
            borderRadius: '50%',
            border: 'none',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <img
            src="/ICONE-APLICATIVO.png"
            width="52"
            height="52"
            alt="Ícone do Manô"
            style={{ borderRadius: 14, display: 'block', flexShrink: 0 }}
          />
          <div>
            <h2 style={{ fontSize: 19, fontWeight: 700, margin: 0, letterSpacing: -0.3, color: '#ffffff' }}>
              Instalar no iPhone
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <span style={{ fontSize: 11, color: '#38BDF8', background: 'rgba(56, 189, 248, 0.12)', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>
                manaus-live-transit.vercel.app
              </span>
            </div>
          </div>
        </div>

        <p style={{ fontSize: 13, color: '#A1A1AA', margin: '0 0 16px', lineHeight: 1.4 }}>
          Siga os 4 passos abaixo no seu navegador Safari para adicionar o <strong>aplicativo oficial</strong>:
        </p>

        {/* Steps List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Step 1 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 14, padding: '12px 14px' }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#2563EB', color: '#fff', fontSize: 12, fontWeight: 700, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              1
            </div>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255, 255, 255, 0.08)', display: 'grid', placeItems: 'center', color: '#fff', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9.5" />
                <circle cx="7.5" cy="12" r="1.2" fill="currentColor" />
                <circle cx="12" cy="12" r="1.2" fill="currentColor" />
                <circle cx="16.5" cy="12" r="1.2" fill="currentColor" />
              </svg>
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: 13, color: '#fff' }}>Toque nos 3 pontinhos</strong>
              <span style={{ fontSize: 11, color: '#9CA3AF' }}>No menu inferior ou superior do Safari</span>
            </div>
          </div>

          {/* Step 2 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 14, padding: '12px 14px' }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#2563EB', color: '#fff', fontSize: 12, fontWeight: 700, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              2
            </div>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255, 255, 255, 0.08)', display: 'grid', placeItems: 'center', color: '#fff', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v6.5A2.5 2.5 0 0 0 6.5 21h11a2.5 2.5 0 0 0 2.5-2.5V12" />
                <path d="M12 3v12" />
                <path d="m7.5 7.5 4.5-4.5 4.5 4.5" />
              </svg>
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: 13, color: '#fff' }}>Toque em Compartilhar</strong>
              <span style={{ fontSize: 11, color: '#9CA3AF' }}>Selecione o botão de envio oficial</span>
            </div>
          </div>

          {/* Step 3 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 14, padding: '12px 14px' }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#2563EB', color: '#fff', fontSize: 12, fontWeight: 700, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              3
            </div>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255, 255, 255, 0.08)', display: 'grid', placeItems: 'center', color: '#fff', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9.5" />
                <path d="m8 10.5 4 4 4-4" />
              </svg>
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: 13, color: '#fff' }}>Toque em Ver Mais</strong>
              <span style={{ fontSize: 11, color: '#9CA3AF' }}>Role para baixo se a opção estiver oculta</span>
            </div>
          </div>

          {/* Step 4 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 14, padding: '12px 14px' }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#2563EB', color: '#fff', fontSize: 12, fontWeight: 700, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              4
            </div>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255, 255, 255, 0.08)', display: 'grid', placeItems: 'center', color: '#fff', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
                <path d="M12 8v8" />
                <path d="M8 12h8" />
              </svg>
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: 13, color: '#fff' }}>Adicionar à Tela de Início</strong>
              <span style={{ fontSize: 11, color: '#9CA3AF' }}>Toque no botão com (+) e confirme</span>
            </div>
          </div>
        </div>

        {/* Footer Dismiss Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            width: '100%',
            marginTop: 20,
            padding: '14px 20px',
            borderRadius: 14,
            border: 'none',
            backgroundColor: '#2563EB',
            color: '#FFFFFF',
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Entendi • Usar Aplicativo Agora
        </button>

        <p style={{ fontSize: 11, color: '#71717A', marginTop: 12, marginBottom: 0, textAlign: 'center', lineHeight: 1.4 }}>
          Dica: Se estiver no WhatsApp ou redes sociais, toque nos três pontinhos e escolha <strong>Abrir no Safari</strong>.
        </p>
      </div>
    </div>
  );
}
