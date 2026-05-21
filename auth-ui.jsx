// ── TOGA · Auth UI Components ────────────────────────────────
// CloudAuthSection — card exibido na aba Ajustes
// SyncStatusDot   — indicador discreto de sincronização

// Ícone do Google (SVG inline, sem dependências)
function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

// Mapa de status → estilo visual
const SYNC_STYLE = {
  idle:    null,
  syncing: { color: '#f59e0b', label: 'Sincronizando…',  dot: true  },
  synced:  { color: '#00A86B', label: '✓ Backup atualizado', dot: true  },
  error:   { color: '#E85D5D', label: 'Sem conexão',     dot: true  },
};

function SyncStatusDot({ status }) {
  const s = SYNC_STYLE[status];
  if (!s) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: s.color, fontWeight: 600 }}>
      <div style={{
        width: 7, height: 7, borderRadius: '50%', background: s.color, flexShrink: 0,
        animation: status === 'syncing' ? 'pulse-dot 1.2s ease-in-out infinite' : 'none',
      }} />
      {s.label}
      <style>{`@keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.35} }`}</style>
    </div>
  );
}

function CloudAuthSection({ user, syncStatus, onSignIn, onSignOut }) {
  // Se não configurado, mostra instruções de setup
  if (!window.TogaAuth?.isConfigured()) {
    return (
      <div className="glass" style={{ padding: '18px 20px' }}>
        <div style={{ fontSize: 9.5, letterSpacing: '0.22em', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, marginBottom: 6 }}>
          CLOUD SYNC · SUPABASE
        </div>
        <div className="font-display" style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>
          Sync em nuvem não configurado
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Para ativar backup automático, preencha suas credenciais em{' '}
          <code style={{ fontSize: 11, background: 'rgba(0,184,212,0.1)', padding: '1px 5px', borderRadius: 4 }}>supabase-config.jsx</code>
          {' '}com a URL e a anon key do seu projeto Supabase.
        </div>
      </div>
    );
  }

  // Não logado
  if (!user) {
    return (
      <div className="glass" style={{ padding: '20px' }}>
        <div style={{ fontSize: 9.5, letterSpacing: '0.22em', color: 'var(--ciano)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, marginBottom: 8 }}>
          ☁️ CLOUD SYNC · BACKUP AUTOMÁTICO
        </div>
        <div className="font-display" style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
          Salve seu progresso na nuvem
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5, maxWidth: 440 }}>
          Login com Google ativa backup automático, sincronização entre dispositivos e proteção total do seu progresso — XP, streaks, conquistas e sessões.
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
          <button
            onClick={onSignIn}
            className="btn-neon"
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'white', color: '#1a1a2e',
              border: '1px solid rgba(30,32,48,0.15)',
              boxShadow: '0 2px 8px rgba(30,32,48,0.1)',
              fontWeight: 600, fontSize: 13, padding: '10px 18px',
            }}
          >
            <GoogleIcon /> Entrar com Google
          </button>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {['☁️ Backup automático', '🔄 Sync entre dispositivos', '🔒 Dados seguros'].map(f => (
            <div key={f} style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{f}</div>
          ))}
        </div>
      </div>
    );
  }

  // Logado
  const avatar = user.user_metadata?.avatar_url;
  const name   = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Concurseiro';
  const email  = user.email;

  return (
    <div className="glass" style={{ padding: '18px 20px' }}>
      <div style={{ fontSize: 9.5, letterSpacing: '0.22em', color: 'var(--esmeralda)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, marginBottom: 10 }}>
        ☁️ CLOUD SYNC · ATIVO
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        {avatar ? (
          <img src={avatar} alt={name} style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--esmeralda)', flexShrink: 0 }} />
        ) : (
          <div style={{
            width: 40, height: 40, borderRadius: '50%', background: 'var(--ciano)',
            display: 'grid', placeItems: 'center', fontSize: 16, fontWeight: 700, color: 'white', flexShrink: 0,
          }}>
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="font-display" style={{ fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {name}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {email}
          </div>
        </div>
        <SyncStatusDot status={syncStatus} />
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ fontSize: 12, color: 'var(--esmeralda)', fontWeight: 600 }}>
          ✓ Backup automático ativo
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button
            onClick={onSignOut}
            className="btn-ghost"
            style={{ fontSize: 12, color: 'var(--text-muted)', borderColor: 'rgba(30,32,48,0.15)' }}
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}

window.CloudAuthSection = CloudAuthSection;
window.SyncStatusDot    = SyncStatusDot;
