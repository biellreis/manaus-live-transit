interface Props {
  isOpen: boolean;
  onClose?: () => void;
}

export function IOSInstallModal({ isOpen }: Props) {
  if (!isOpen) return null;

  const handleReturnToSite = () => {
    window.location.href = 'https://mano-site-seven.vercel.app';
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999999,
        backgroundColor: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        boxSizing: 'border-box'
      }}
      onClick={(e) => {
        // Clicar fora do modal não faz nada; modal continua aberto
        e.stopPropagation();
      }}
    >
      <div
        id="ios-install-dialog-card"
        style={{
          position: 'relative',
          backgroundColor: '#141418',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 28,
          width: 'min(420px, 100%)',
          maxHeight: 'calc(100vh - 32px)',
          overflowY: 'auto',
          padding: '26px 22px',
          boxSizing: 'border-box',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.95)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão X — única forma de sair do modal, volta diretamente para o site */}
        <button
          type="button"
          onClick={handleReturnToSite}
          aria-label="Fechar e voltar ao site"
          style={{
            position: 'absolute',
            right: 18,
            top: 18,
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: 'none',
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            color: '#ffffff',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
            transition: 'background 0.2s ease'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Título do Modal */}
        <h2
          id="ios-install-modal-title"
          style={{
            fontSize: 20,
            fontWeight: 700,
            margin: '0 0 20px 0',
            letterSpacing: -0.3,
            color: '#ffffff',
            paddingRight: 44
          }}
        >
          Instalar no iPhone
        </h2>

        {/* As 4 Instruções Didáticas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Passo 1 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 16, padding: '12px 14px' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#2563EB', color: '#ffffff', fontSize: 12, fontWeight: 700, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              1
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255, 255, 255, 0.08)', display: 'grid', placeItems: 'center', color: '#ffffff', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9.5" />
                <circle cx="7.5" cy="12" r="1.2" fill="currentColor" />
                <circle cx="12" cy="12" r="1.2" fill="currentColor" />
                <circle cx="16.5" cy="12" r="1.2" fill="currentColor" />
              </svg>
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: 13, color: '#ffffff', fontWeight: 600 }}>Toque nos 3 pontinhos</strong>
              <span style={{ fontSize: 11, color: '#9CA3AF' }}>No menu inferior ou superior do Safari</span>
            </div>
          </div>

          {/* Passo 2 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 16, padding: '12px 14px' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#2563EB', color: '#ffffff', fontSize: 12, fontWeight: 700, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              2
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255, 255, 255, 0.08)', display: 'grid', placeItems: 'center', color: '#ffffff', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v6.5A2.5 2.5 0 0 0 6.5 21h11a2.5 2.5 0 0 0 2.5-2.5V12" />
                <path d="M12 3v12" />
                <path d="m7.5 7.5 4.5-4.5 4.5 4.5" />
              </svg>
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: 13, color: '#ffffff', fontWeight: 600 }}>Toque em Compartilhar</strong>
              <span style={{ fontSize: 11, color: '#9CA3AF' }}>Selecione o botão de envio oficial</span>
            </div>
          </div>

          {/* Passo 3 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 16, padding: '12px 14px' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#2563EB', color: '#ffffff', fontSize: 12, fontWeight: 700, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              3
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255, 255, 255, 0.08)', display: 'grid', placeItems: 'center', color: '#ffffff', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9.5" />
                <path d="m8 10.5 4 4 4-4" />
              </svg>
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: 13, color: '#ffffff', fontWeight: 600 }}>Toque em Ver Mais</strong>
              <span style={{ fontSize: 11, color: '#9CA3AF' }}>Role para baixo se a opção estiver oculta</span>
            </div>
          </div>

          {/* Passo 4 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 16, padding: '12px 14px' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#2563EB', color: '#ffffff', fontSize: 12, fontWeight: 700, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              4
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255, 255, 255, 0.08)', display: 'grid', placeItems: 'center', color: '#ffffff', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
                <path d="M12 8v8" />
                <path d="M8 12h8" />
              </svg>
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: 13, color: '#ffffff', fontWeight: 600 }}>Adicionar à Tela de Início</strong>
              <span style={{ fontSize: 11, color: '#9CA3AF' }}>Toque no botão com (+) e confirme</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
