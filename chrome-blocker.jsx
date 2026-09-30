// chrome-blocker.jsx — Chrome extension integration for Modo Blindado
// Extension ID: dmebmbhlipafcicnfdaendlgehkfljgc
// Communication via window.postMessage (extension content script bridges to background)

const TOGA_SRC_APP = 'TOGA_APP';
const TOGA_SRC_EXT = 'TOGA_BLOCKER';
const BLOCKER_STORAGE_KEY = 'toga_blocker_v1';

const FOCUS_MODES = {
  leve: {
    id: 'leve',
    label: 'Foco Leve',
    icon: '🌿',
    tagline: 'Redes sociais bloqueadas',
    color: '#8FB8FF',
    colorRaw: '#8FB8FF',
    colorGlow: 'rgba(169,200,255,0.45)',
    gradient: 'linear-gradient(135deg, #8FB8FF, #4FD1A5)',
    bgGlow: 'rgba(143,184,255,0.06)',
    intensity: 'low',
    xpBonus: 2,
    defaultSites: [
      'instagram.com','facebook.com','twitter.com','x.com','tiktok.com',
      'snapchat.com','pinterest.com','reddit.com','twitch.tv',
    ],
  },
  profundo: {
    id: 'profundo',
    label: 'Foco Profundo',
    icon: '🔮',
    tagline: 'Concentração máxima',
    color: '#B7AAFF',
    colorRaw: '#B7AAFF',
    colorGlow: 'rgba(183,170,255,0.55)',
    gradient: 'linear-gradient(135deg, #B7AAFF, #4A36C4)',
    bgGlow: 'rgba(183,170,255,0.07)',
    intensity: 'high',
    xpBonus: 5,
    defaultSites: [
      'instagram.com','facebook.com','twitter.com','x.com','tiktok.com',
      'snapchat.com','pinterest.com','reddit.com','twitch.tv',
      'youtube.com','netflix.com','primevideo.com','disneyplus.com',
      'globoplay.com','g1.globo.com','uol.com.br','r7.com',
      'whatsapp.com','telegram.org','discord.com','9gag.com',
    ],
  },
  monge: {
    id: 'monge',
    label: 'Modo Monge',
    icon: '🧘',
    tagline: 'Apenas o essencial',
    color: '#E8C47A',
    colorRaw: '#E8C47A',
    colorGlow: 'rgba(232,196,122,0.55)',
    gradient: 'linear-gradient(135deg, #E8C47A, #7A5E1F)',
    bgGlow: 'rgba(232,196,122,0.05)',
    intensity: 'monk',
    xpBonus: 10,
    defaultWhitelist: [
      'localhost','127.0.0.1',
      'jusbrasil.com.br','conjur.com.br',
      'estrategiaconcursos.com.br','grancursosonline.com.br',
      'qconcursos.com','estrategia.com','pciconcursos.com.br',
    ],
  },
};

const SITE_CATEGORIES = {
  social: { label: 'Redes Sociais',     icon: '📱', sites: ['instagram.com','facebook.com','twitter.com','x.com','tiktok.com','snapchat.com','pinterest.com'] },
  video:  { label: 'Vídeo/Streaming',   icon: '🎬', sites: ['youtube.com','netflix.com','primevideo.com','disneyplus.com','globoplay.com','twitch.tv'] },
  news:   { label: 'Notícias/Portais',  icon: '📰', sites: ['g1.globo.com','uol.com.br','r7.com','terra.com.br','cnn.com.br','band.com.br'] },
  chat:   { label: 'Mensagens',         icon: '💬', sites: ['whatsapp.com','telegram.org','discord.com','slack.com'] },
  forum:  { label: 'Fóruns',            icon: '🗨️', sites: ['reddit.com','9gag.com','quora.com'] },
  games:  { label: 'Jogos',             icon: '🎮', sites: ['steampowered.com','epicgames.com','riotgames.com'] },
};

function loadBlockerSettings() {
  try { const r = localStorage.getItem(BLOCKER_STORAGE_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
}
function saveBlockerSettings(s) {
  try { localStorage.setItem(BLOCKER_STORAGE_KEY, JSON.stringify(s)); } catch {}
}

const BLOCKER_DEFAULTS = {
  focusMode: 'profundo',
  customSites: [],
  enabledCategories: ['social','video','chat'],
  whitelist: [],
  blockEnabled: true,
};

function useChromeBlocker() {
  const [installed, setInstalled] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const [settings, setSettings] = React.useState(() => loadBlockerSettings() || BLOCKER_DEFAULTS);
  const pingRef = React.useRef(null);

  React.useEffect(() => { saveBlockerSettings(settings); }, [settings]);

  React.useEffect(() => {
    const onMsg = (ev) => {
      if (ev.source !== window) return;
      const m = ev.data;
      if (!m || m.source !== TOGA_SRC_EXT) return;
      if (m.type === 'READY' || m.type === 'PONG') {
        setInstalled(true);
        if (m.active !== undefined) setActive(!!m.active);
      } else if (m.type === 'ACTIVATED') {
        setActive(true);
      } else if (m.type === 'DEACTIVATED') {
        setActive(false);
      } else if (m.type === 'STATUS_UPDATE') {
        setActive(!!m.active);
      }
    };
    window.addEventListener('message', onMsg);
    const onReady = () => setInstalled(true);
    window.addEventListener('togablockerready', onReady);
    if (window.__TOGA_BLOCKER_INSTALLED) setInstalled(true);

    const ping = () => window.postMessage({ source: TOGA_SRC_APP, type: 'PING' }, '*');
    ping();
    pingRef.current = setInterval(ping, 6000);
    return () => {
      window.removeEventListener('message', onMsg);
      window.removeEventListener('togablockerready', onReady);
      clearInterval(pingRef.current);
    };
  }, []);

  const activate = React.useCallback((durationSecs, modeOverride) => {
    if (!settings.blockEnabled) return;
    const mode = modeOverride || settings.focusMode;
    const cfg = FOCUS_MODES[mode];
    let sitesToBlock = [];
    if (mode !== 'monge') {
      settings.enabledCategories.forEach(cat => sitesToBlock.push(...(SITE_CATEGORIES[cat]?.sites || [])));
      sitesToBlock.push(...(cfg.defaultSites || []));
      sitesToBlock.push(...(settings.customSites || []));
      sitesToBlock = [...new Set(sitesToBlock)];
    }
    window.postMessage({
      source: TOGA_SRC_APP, type: 'ACTIVATE',
      duration: durationSecs, mode, intensity: cfg.intensity,
      sitesToBlock,
      whitelist: mode === 'monge'
        ? [...(cfg.defaultWhitelist || []), ...(settings.whitelist || [])]
        : (settings.whitelist || []),
    }, '*');
  }, [settings]);

  const deactivate = React.useCallback(() => {
    window.postMessage({ source: TOGA_SRC_APP, type: 'DEACTIVATE' }, '*');
  }, []);

  return {
    installed, active, settings,
    setFocusMode: (m) => setSettings(s => ({ ...s, focusMode: m })),
    toggleCategory: (cat) => setSettings(s => ({
      ...s, enabledCategories: s.enabledCategories.includes(cat)
        ? s.enabledCategories.filter(c => c !== cat)
        : [...s.enabledCategories, cat],
    })),
    addCustomSite: (site) => {
      const clean = site.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase().trim();
      if (!clean) return;
      setSettings(s => s.customSites.includes(clean) ? s : { ...s, customSites: [...s.customSites, clean] });
    },
    removeCustomSite: (site) => setSettings(s => ({ ...s, customSites: s.customSites.filter(x => x !== site) })),
    toggleBlockEnabled: () => setSettings(s => ({ ...s, blockEnabled: !s.blockEnabled })),
    activate, deactivate,
  };
}

// Compact focus-mode selector used inside PomodoroModal
function FocusModeSelector({ blocker }) {
  const { settings } = blocker;
  return (
    <div>
      <div style={{ fontSize: 9.5, letterSpacing: '0.2em', color: 'var(--text-muted)', fontWeight: 700, fontFamily: 'var(--font-label)', marginBottom: 8 }}>
        MODO DE FOCO · EXTENSÃO ATIVA
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 7 }}>
        {Object.values(FOCUS_MODES).map(m => {
          const on = settings.focusMode === m.id;
          return (
            <button key={m.id} onClick={() => blocker.setFocusMode(m.id)}
              style={{
                padding: '10px 6px', borderRadius: 12, cursor: 'pointer', textAlign: 'center',
                background: on ? `${m.bgGlow}` : 'rgba(22,19,40,0.6)',
                border: `1.5px solid ${on ? m.colorRaw : 'rgba(243,235,221,0.08)'}`,
                boxShadow: on ? `0 0 16px ${m.colorGlow}, 0 2px 8px rgba(0,0,0,0.06)` : '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'all 200ms cubic-bezier(0.2,0.8,0.2,1)',
              }}>
              <div style={{ fontSize: 20 }}><Glyph e={m.icon} /></div>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: on ? m.colorRaw : 'var(--text-muted)', marginTop: 4, lineHeight: 1.2 }}>{m.label}</div>
              <div style={{ fontSize: 9, color: on ? m.colorRaw : 'var(--text-dim)', marginTop: 3, lineHeight: 1.3, opacity: on ? 0.8 : 0.6 }}>{m.tagline}</div>
              {on && (
                <div style={{ marginTop: 4, fontSize: 8.5, fontFamily: 'var(--font-num)', fontWeight: 800, color: m.colorRaw, letterSpacing: '0.05em' }}>
                  +{m.xpBonus} XP
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Full settings panel (used in Ajustes tab)
function BlockerSettingsPanel({ blocker }) {
  const [newSite, setNewSite] = React.useState('');
  const { settings } = blocker;
  const mode = FOCUS_MODES[settings.focusMode];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Extension status */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px', borderRadius: 10,
        background: blocker.installed ? 'rgba(79,209,165,0.08)' : 'rgba(179,171,199,0.06)',
        border: `1px solid ${blocker.installed ? 'rgba(79,209,165,0.25)' : 'rgba(179,171,199,0.12)'}`,
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: blocker.installed ? '#4FD1A5' : '#9CA3AF',
          boxShadow: blocker.installed ? '0 0 8px rgba(79,209,165,0.6)' : 'none',
        }} />
        <div style={{ fontSize: 12, fontWeight: 600, color: blocker.installed ? '#4FD1A5' : 'var(--text-muted)' }}>
          {blocker.installed ? 'Extensão conectada' : 'Extensão não detectada'}
        </div>
        {blocker.active && (
          <div style={{ marginLeft: 'auto', fontSize: 10, fontFamily: 'var(--font-num)', fontWeight: 700, color: 'var(--coral)' }}>
            BLOQUEANDO
          </div>
        )}
      </div>

      {/* Focus mode */}
      <div>
        <div style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-muted)', fontWeight: 700, fontFamily: 'var(--font-label)', marginBottom: 10 }}>
          MODO DE FOCO PADRÃO
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {Object.values(FOCUS_MODES).map(m => {
            const on = settings.focusMode === m.id;
            return (
              <button key={m.id} onClick={() => blocker.setFocusMode(m.id)}
                style={{
                  padding: '12px 8px', borderRadius: 12, cursor: 'pointer', textAlign: 'center',
                  background: on ? m.bgGlow : 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${on ? m.colorRaw : 'rgba(243,235,221,0.08)'}`,
                  boxShadow: on ? `0 0 20px ${m.colorGlow}` : 'none',
                  transition: 'all 200ms',
                }}>
                <div style={{ fontSize: 24 }}><Glyph e={m.icon} /></div>
                <div style={{ fontSize: 12, fontWeight: 700, color: on ? m.colorRaw : 'var(--text-primary)', marginTop: 6 }}>{m.label}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{m.tagline}</div>
                <div style={{ marginTop: 5, fontSize: 9.5, fontFamily: 'var(--font-num)', fontWeight: 800, color: on ? m.colorRaw : 'var(--text-dim)' }}>+{m.xpBonus} XP bônus</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Block toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Bloquear sites durante o timer</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>A extensão ativa o bloqueio ao iniciar o timer</div>
        </div>
        <button onClick={blocker.toggleBlockEnabled}
          style={{
            width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
            background: settings.blockEnabled ? mode.colorRaw : 'rgba(179,171,199,0.2)',
            transition: 'background 200ms', position: 'relative',
          }}>
          <div style={{
            width: 18, height: 18, borderRadius: '50%', background: 'var(--surface)',
            position: 'absolute', top: 3,
            left: settings.blockEnabled ? 23 : 3,
            transition: 'left 200ms', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }} />
        </button>
      </div>

      {/* Categories */}
      {settings.focusMode !== 'monge' && (
        <div>
          <div style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-muted)', fontWeight: 700, fontFamily: 'var(--font-label)', marginBottom: 8 }}>
            CATEGORIAS BLOQUEADAS
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {Object.entries(SITE_CATEGORIES).map(([key, cat]) => {
              const on = settings.enabledCategories.includes(key);
              return (
                <button key={key} onClick={() => blocker.toggleCategory(key)}
                  style={{
                    padding: '5px 11px', borderRadius: 99, cursor: 'pointer',
                    background: on ? 'rgba(183,170,255,0.1)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${on ? 'rgba(183,170,255,0.4)' : 'rgba(243,235,221,0.1)'}`,
                    fontSize: 11.5, color: on ? 'var(--tinta)' : 'var(--text-muted)',
                    fontWeight: on ? 700 : 500, transition: 'all 150ms',
                  }}>
                  <Glyph e={cat.icon} /> {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Custom sites */}
      {settings.focusMode !== 'monge' && (
        <div>
          <div style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-muted)', fontWeight: 700, fontFamily: 'var(--font-label)', marginBottom: 8 }}>
            SITES EXTRAS PERSONALIZADOS
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
            <input type="text" placeholder="ex: reddit.com" value={newSite}
              onChange={e => setNewSite(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { blocker.addCustomSite(newSite); setNewSite(''); } }}
              className="input-base" style={{ flex: 1, fontSize: 12 }} />
            <button onClick={() => { blocker.addCustomSite(newSite); setNewSite(''); }}
              className="btn-neon" style={{ padding: '7px 14px', fontSize: 12 }}>
              + Adicionar
            </button>
          </div>
          {settings.customSites.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {settings.customSites.map(site => (
                <div key={site} style={{
                  padding: '3px 9px', borderRadius: 99, fontSize: 11, fontFamily: 'var(--font-num)',
                  background: 'rgba(255,122,138,0.08)', border: '1px solid rgba(255,122,138,0.22)',
                  color: 'var(--coral)', display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  {site}
                  <button onClick={() => blocker.removeCustomSite(site)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--coral)', padding: 0, fontSize: 13, lineHeight: 1 }}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Standalone component for Ajustes tab — has its own blocker instance
function BlockerSettingsSection() {
  const blocker = useChromeBlocker();
  return <BlockerSettingsPanel blocker={blocker} />;
}

window.useChromeBlocker      = useChromeBlocker;
window.FocusModeSelector     = FocusModeSelector;
window.BlockerSettingsPanel  = BlockerSettingsPanel;
window.BlockerSettingsSection = BlockerSettingsSection;
window.FOCUS_MODES_CONFIG    = FOCUS_MODES;
window.SITE_CATEGORIES_CONFIG = SITE_CATEGORIES;
