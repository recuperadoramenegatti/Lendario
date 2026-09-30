// FAB — opens SessionLogModal directly. Pomodoro with chronometer + post-session log form.
// chrome-blocker.jsx is loaded before this file in index.html.

// Fallback hook — used if chrome-blocker.jsx somehow didn't load
function _useBlockerNoop() {
  const [installed] = React.useState(false);
  const [active]    = React.useState(false);
  return {
    installed, active,
    settings: { focusMode: 'profundo', blockEnabled: true, enabledCategories: ['social','video','chat'], customSites: [], whitelist: [] },
    activate: () => {}, deactivate: () => {},
    setFocusMode: () => {}, toggleCategory: () => {}, addCustomSite: () => {}, removeCustomSite: () => {},
  };
}
// Stable reference resolved once at parse time (chrome-blocker.jsx already executed by then)
const _useBlocker = window.useChromeBlocker || _useBlockerNoop;

function QuickLogFAB({ onOpenSessionLog, onOpenPomodoro }) {
  return (
    <div className="fab">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-end' }}>
        <button className="ld-fab-shield" onClick={onOpenPomodoro} title="Modo Blindado (Pomodoro / Cronômetro)" aria-label="Abrir Modo Blindado">
          <G name="shield" size={22} color="#8FF0CE" />
        </button>
        <button className="btn-neon ld-fab-main" onClick={onOpenSessionLog} title="Registrar sessão de estudos" aria-label="Registrar sessão de estudos">
          <G name="quill" size={24} color="#231604" stroke={2} />
        </button>
      </div>
    </div>
  );
}

const POMODORO_OPTIONS = [
  { mins: 25,  label: '25 min'   },
  { mins: 45,  label: '45 min'   },
  { mins: 60,  label: '1 hora'   },
  { mins: 90,  label: '1h 30min' },
];

const STUDY_TYPES_POM = [
  'Lei seca', 'Teoria', 'Jurisprudência', 'Questões',
  'Revisão', 'Mapa mental', 'Aula', 'Simulado',
];

// Per-mode visual config (mirrors FOCUS_MODES_CONFIG but safe to access before blocker loads)
const MODE_VISUALS = {
  leve:     { ringColor: '#8FB8FF', ringGlow: 'rgba(169,200,255,0.5)',   bgOverlay: 'rgba(12,13,18,0.5)',   label: 'Foco Leve',    icon: '🌿', finishEmoji: '💎', finishMsg: 'Sessão leve concluída!' },
  profundo: { ringColor: '#B7AAFF', ringGlow: 'rgba(183,170,255,0.6)',   bgOverlay: 'rgba(8,6,22,0.60)',    label: 'Foco Profundo', icon: '🔮', finishEmoji: '⚡', finishMsg: 'Concentração máxima atingida!' },
  monge:    { ringColor: '#E8C47A', ringGlow: 'rgba(232,196,122,0.55)', bgOverlay: 'rgba(6,5,10,0.72)',    label: 'Modo Monge',    icon: '🧘', finishEmoji: '🏆', finishMsg: 'Silêncio total alcançado!' },
};

function PomodoroModal({ open, onClose, subjects, onCompleteSession, onOpenFullLog, customStudyTypes = [], onAddCustomStudyType, blindadoStats }) {
  const [phase, setPhase]     = React.useState('pick');   // pick | running | finished
  const [mode, setMode]       = React.useState('timer');  // timer | chrono
  const [mins, setMins]       = React.useState(45);
  const [subjectId, setSubjectId] = React.useState(subjects[0]?.id || '');
  const [secsLeft, setSecsLeft]   = React.useState(45 * 60);
  const [secsElapsed, setSecsElapsed] = React.useState(0);
  const [paused, setPaused]       = React.useState(false);
  const [pauseSecs, setPauseSecs] = React.useState(0);
  const [distractionAlert, setDistractionAlert] = React.useState(false);
  const [naturallyFinished, setNaturallyFinished] = React.useState(false);
  const [showBlockerSettings, setShowBlockerSettings] = React.useState(false);

  // Chrome blocker integration (extension is optional — timer works without it)
  const blocker = _useBlocker();

  const focusMode = blocker.settings.focusMode || 'profundo';
  const mv = MODE_VISUALS[focusMode] || MODE_VISUALS.profundo;
  const modeConfig = (window.FOCUS_MODES_CONFIG || {})[focusMode] || { xpBonus: 5, colorRaw: '#B7AAFF' };

  const totalSecs = mins * 60;

  // Wall-clock anchored ticking — avoids setTimeout drift, survives tab throttling.
  const startAtRef    = React.useRef(null);
  const accumMsRef    = React.useRef(0);
  const pauseStartRef = React.useRef(null);
  const alertedRef    = React.useRef(false);

  React.useEffect(() => {
    if (phase !== 'running' || paused) return;
    startAtRef.current = Date.now();
    const tick = () => {
      const elapsedMs  = accumMsRef.current + (Date.now() - startAtRef.current);
      const elapsedSec = Math.floor(elapsedMs / 1000);
      if (mode === 'timer') {
        const left = totalSecs - elapsedSec;
        if (left <= 0) {
          setSecsLeft(0);
          accumMsRef.current = totalSecs * 1000;
          setNaturallyFinished(true);
          setPhase('finished');
          blocker.deactivate();
          window.celebrateVictory && window.celebrateVictory();
          window.playTimerEnd    && window.playTimerEnd();
        } else {
          setSecsLeft(left);
        }
      } else {
        setSecsElapsed(elapsedSec);
      }
    };
    tick();
    const id = setInterval(tick, 250);
    return () => {
      accumMsRef.current += Date.now() - startAtRef.current;
      clearInterval(id);
    };
  }, [phase, paused, mode, totalSecs, mins]);

  // Distraction watchdog
  React.useEffect(() => {
    if (phase !== 'running' || !paused) {
      pauseStartRef.current = null;
      alertedRef.current    = false;
      setPauseSecs(0);
      return;
    }
    pauseStartRef.current = Date.now();
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - pauseStartRef.current) / 1000);
      setPauseSecs(elapsed);
      if (elapsed >= 300 && !alertedRef.current) {
        alertedRef.current = true;
        setDistractionAlert(true);
        window.playEmergency && window.playEmergency();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [phase, paused]);

  React.useEffect(() => {
    if (open) {
      setPhase('pick');
      setMode('timer');
      setSecsLeft(mins * 60);
      setSecsElapsed(0);
      setPaused(false);
      setPauseSecs(0);
      setDistractionAlert(false);
      setNaturallyFinished(false);
      setShowBlockerSettings(false);
      accumMsRef.current  = 0;
      startAtRef.current  = null;
      pauseStartRef.current = null;
      alertedRef.current  = false;
      setSubjectId(subjects[0]?.id || '');
    }
  }, [open]);

  const start = () => {
    accumMsRef.current = 0;
    startAtRef.current = null;
    if (mode === 'timer') setSecsLeft(mins * 60);
    if (mode === 'chrono') setSecsElapsed(0);
    setPaused(false);
    setPhase('running');
    setNaturallyFinished(false);
    // Activate extension if installed
    if (blocker.installed && mode === 'timer') {
      blocker.activate(mins * 60, focusMode);
    }
  };

  const finalizeEarly = () => {
    setNaturallyFinished(mode === 'chrono');
    setPhase('finished');
    blocker.deactivate();
  };

  const openFullForm = () => {
    const elapsedMs    = accumMsRef.current + (startAtRef.current && !paused && phase === 'running' ? (Date.now() - startAtRef.current) : 0);
    const elapsedSecs  = Math.floor(elapsedMs / 1000);
    const durationMin  = mode === 'timer'
      ? Math.max(1, Math.round(Math.min(totalSecs, elapsedSecs) / 60))
      : Math.max(1, Math.round(elapsedSecs / 60));
    const subj    = subjects.find(s => s.id === subjectId);
    const awardXp = !!naturallyFinished;
    onClose();
    if (onOpenFullLog) {
      onOpenFullLog({
        durationMin,
        discipline: subj?.name || '',
        awardXp,
        source:      awardXp ? 'pomodoro' : 'pomodoro-early',
        blindado:    true,
        blindadoMode: focusMode,
        modeXpBonus: awardXp ? (modeConfig.xpBonus || 0) : 0,
      });
    }
  };

  if (!open) return null;

  const progress   = mode === 'timer' ? 1 - secsLeft / totalSecs : 0;
  const r = 110, c  = 2 * Math.PI * r;
  const showSecs   = mode === 'timer' ? secsLeft : secsElapsed;
  const showH      = Math.floor(showSecs / 3600);
  const showM      = Math.floor((showSecs % 3600) / 60);
  const showS      = showSecs % 60;

  // Monge mode has dark-toned modal during running
  const isMonge    = focusMode === 'monge';
  const modalBg    = phase === 'running' ? mv.bgOverlay : 'rgba(12,13,18,0.5)';

  // Blindado stats for streak display
  const bd = blindadoStats || {};
  const bdStreak = bd.streak || 0;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 90,
      background: modalBg, backdropFilter: 'blur(8px)',
      display: 'grid', placeItems: 'center', padding: 24,
      transition: 'background 800ms ease',
    }} onClick={onClose}>
      <div
        className="glass-strong anim-slide-up"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 460, padding: 24, borderRadius: 18,
          position: 'relative', maxHeight: '90vh', overflowY: 'auto',
          ...(phase === 'running' && isMonge ? {
            background: 'rgba(14,12,8,0.97)',
            border: `1px solid rgba(232,196,122,0.25)`,
            boxShadow: `0 0 60px rgba(232,196,122,0.12), 0 24px 80px rgba(0,0,0,0.5)`,
          } : phase === 'running' && focusMode === 'profundo' ? {
            background: 'rgba(12,8,28,0.97)',
            border: `1px solid rgba(183,170,255,0.2)`,
            boxShadow: `0 0 60px rgba(183,170,255,0.1), 0 24px 80px rgba(0,0,0,0.4)`,
          } : {}),
        }}>

        <button onClick={onClose} className="btn-ghost" style={{ position: 'absolute', top: 12, right: 12 }}>
          <I.close size={14} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.25em', color: phase === 'running' ? mv.ringColor : 'var(--neon-violet)', fontFamily: 'var(--font-label)', fontWeight: 700 }}>
            MODO BLINDADO {phase === 'running' && `· ${mv.icon} ${mv.label.toUpperCase()}`}
          </div>
          <div className="font-display gradient-neon" style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>
            {phase === 'running' ? (isMonge ? 'Silêncio. Foco.' : 'Sessão em progresso') : 'Sessão de foco'}
          </div>
          {/* Blindado streak badge */}
          {bdStreak >= 2 && phase === 'pick' && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 8,
              padding: '3px 10px', borderRadius: 99,
              background: 'rgba(255,176,87,0.1)', border: '1px solid rgba(255,176,87,0.3)',
              fontSize: 11, color: '#d97706', fontWeight: 700, fontFamily: 'var(--font-num)',
            }}>
              <Glyph e="🔥" /> {bdStreak} dias blindados seguidos
            </div>
          )}
        </div>

        {/* ── PICK PHASE ── */}
        {phase === 'pick' && (
          <>
            {/* Mode toggle */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 14 }}>
              <button onClick={() => setMode('timer')}
                className={mode === 'timer' ? 'btn-neon' : 'btn-ghost'}
                style={{ justifyContent: 'center', padding: '8px',
                  ...(mode === 'timer' ? { background: 'var(--petroleo)', borderColor: 'transparent', color: '#FFFFFF' } : {}) }}>
                <Glyph e="⏲" /> Timer
              </button>
              <button onClick={() => setMode('chrono')}
                className={mode === 'chrono' ? 'btn-neon' : 'btn-ghost'}
                style={{ justifyContent: 'center', padding: '8px',
                  ...(mode === 'chrono' ? { background: 'var(--petroleo)', borderColor: 'transparent', color: '#FFFFFF' } : {}) }}>
                <Glyph e="⏱" /> Cronômetro
              </button>
            </div>

            {mode === 'timer' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 14 }}>
                {POMODORO_OPTIONS.map(o => (
                  <button key={o.mins} onClick={() => setMins(o.mins)}
                    style={{
                      padding: '10px 4px', borderRadius: 10, cursor: 'pointer',
                      background: mins === o.mins ? 'rgba(143,184,255,0.1)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${mins === o.mins ? 'rgba(143,184,255,0.5)' : 'rgba(243,235,221,0.08)'}`,
                      boxShadow: mins === o.mins ? '0 0 12px rgba(169,200,255,0.3)' : 'none',
                      color: 'var(--text-primary)', textAlign: 'center',
                    }}>
                    <div className="num" style={{ fontSize: 14, fontWeight: 700, color: mins === o.mins ? '#8FB8FF' : 'var(--text-primary)' }}>
                      {o.label}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {mode === 'chrono' && (
              <div style={{ background: 'rgba(143,184,255,0.06)', padding: '12px 14px', borderRadius: 10, marginBottom: 14, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Modo cronômetro: o tempo conta para cima sem limite. Você decide quando finalizar.
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 5, fontWeight: 600 }}>DISCIPLINA</div>
              <select value={subjectId} onChange={e => setSubjectId(e.target.value)} className="input-base" style={{ width: '100%' }}>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            {/* Extension integration panel — only shown when installed */}
            {blocker.installed && typeof window.FocusModeSelector === 'function' && (
              <div style={{
                marginBottom: 14, padding: '14px',
                borderRadius: 12,
                background: `${(window.FOCUS_MODES_CONFIG || {})[focusMode]?.bgGlow || 'rgba(183,170,255,0.06)'}`,
                border: `1px solid ${(window.FOCUS_MODES_CONFIG || {})[focusMode]?.colorRaw || 'rgba(183,170,255,0.2)'}40`,
              }}>
                <FocusModeSelector blocker={blocker} />

                {/* Blocker settings toggle */}
                <button onClick={() => setShowBlockerSettings(v => !v)}
                  style={{ marginTop: 10, fontSize: 10.5, color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Glyph e="⚙️" /> {showBlockerSettings ? 'Ocultar' : 'Configurar sites bloqueados'}
                </button>

                {showBlockerSettings && typeof window.BlockerSettingsPanel === 'function' && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(243,235,221,0.06)' }}>
                    <BlockerSettingsPanel blocker={blocker} />
                  </div>
                )}
              </div>
            )}

            {/* Extension not installed: subtle hint */}
            {!blocker.installed && (
              <div style={{
                marginBottom: 14, padding: '10px 14px', borderRadius: 10,
                background: 'rgba(183,170,255,0.04)', border: '1px dashed rgba(183,170,255,0.15)',
                fontSize: 11, color: 'var(--text-dim)', display: 'flex', gap: 8, alignItems: 'center',
              }}>
                <span style={{ fontSize: 16 }}><Glyph e="🛡" /></span>
                <span>Instale a extensão <strong>TOGA Blocker</strong> para bloquear sites durante o foco.</span>
              </div>
            )}

            <button onClick={start} className="btn-neon" style={{
              width: '100%', justifyContent: 'center', padding: '12px 20px', fontSize: 13,
              background: blocker.installed
                ? (window.FOCUS_MODES_CONFIG || {})[focusMode]?.gradient || 'var(--grad-primary)'
                : 'var(--grad-primary)',
              borderColor: 'transparent', color: 'var(--on-primary)',
              boxShadow: blocker.installed ? `0 8px 24px ${(window.FOCUS_MODES_CONFIG || {})[focusMode]?.colorGlow || 'rgba(143,184,255,0.3)'}` : undefined,
            }}>
              <I.play size={11} /> Iniciar {mode === 'timer' ? `· ${mins} min` : '· cronômetro'}
              {blocker.installed && mode === 'timer' && <span style={{ marginLeft: 6, fontSize: 10, opacity: 0.85 }}>· <Glyph e={mv.icon} /> blindado</span>}
            </button>
          </>
        )}

        {/* ── RUNNING PHASE ── */}
        {phase === 'running' && (
          <div style={{ textAlign: 'center' }}>
            {/* Ambient glow ring for monge mode */}
            {isMonge && (
              <div style={{
                position: 'absolute', inset: 0, borderRadius: 18, pointerEvents: 'none',
                background: `radial-gradient(ellipse at 50% 30%, rgba(232,196,122,0.06), transparent 70%)`,
              }} />
            )}

            <div style={{ position: 'relative', width: 260, height: 260, margin: '0 auto' }}>
              <svg viewBox="0 0 260 260" width={260} height={260}>
                <circle cx="130" cy="130" r={r} fill="none" stroke="rgba(243,235,221,0.06)" strokeWidth="4" />
                {mode === 'timer' && (
                  <circle cx="130" cy="130" r={r} fill="none"
                    stroke={mv.ringColor} strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={c} strokeDashoffset={c * progress}
                    transform="rotate(-90 130 130)"
                    style={{ filter: `drop-shadow(0 0 8px ${mv.ringGlow})`, transition: 'stroke-dashoffset 1s linear' }} />
                )}
                {mode === 'chrono' && (
                  <circle cx="130" cy="130" r={r} fill="none"
                    stroke={mv.ringColor} strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={c} strokeDashoffset={c * 0.15}
                    style={{ filter: `drop-shadow(0 0 8px ${mv.ringGlow})` }} />
                )}
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                <div>
                  <div className="num" style={{
                    fontSize: showH > 0 ? 38 : 50, fontWeight: 700, letterSpacing: '-0.02em',
                    color: paused ? 'var(--coral)' : (isMonge ? '#E8C47A' : 'var(--text-primary)'),
                  }}>
                    {showH > 0 && <>{String(showH).padStart(2,'0')}<span style={{ color: 'var(--text-dim)' }}>:</span></>}
                    {String(showM).padStart(2,'0')}<span style={{ color: 'var(--text-dim)' }}>:</span>{String(showS).padStart(2,'0')}
                  </div>
                  <div style={{ fontSize: 10, textAlign: 'center', marginTop: 4, color: mv.ringColor, fontFamily: 'var(--font-num)', fontWeight: 700, opacity: 0.8 }}>
                    <Glyph e={mv.icon} /> {mv.label.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>

            {paused && (
              <div style={{
                marginTop: 14, padding: '8px 12px', borderRadius: 10,
                background: pauseSecs >= 240 ? 'rgba(255,122,138,0.10)' : 'rgba(255,176,87,0.10)',
                border: `1px solid ${pauseSecs >= 240 ? 'rgba(255,122,138,0.40)' : 'rgba(255,176,87,0.35)'}`,
                fontSize: 12, color: pauseSecs >= 240 ? 'var(--coral)' : 'var(--ambar)',
                fontWeight: 700, fontFamily: 'var(--font-num)',
              }}>
                <Glyph e="⏸" /> Pausado há {Math.floor(pauseSecs/60)}min {String(pauseSecs%60).padStart(2,'0')}s
                {pauseSecs >= 240 && pauseSecs < 300 && <span> · alerta em {300 - pauseSecs}s</span>}
              </div>
            )}

            <div style={{ fontSize: 11, color: isMonge ? 'rgba(232,196,122,0.5)' : 'var(--text-dim)', marginTop: 10, fontFamily: 'var(--font-num)', fontWeight: 600 }}>
              {mode === 'timer'
                ? 'XP só é concedido se o timer for finalizado naturalmente.'
                : 'Modo cronômetro: registre quando quiser.'}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              <button className="btn-ghost" onClick={() => setPaused(p => !p)}
                style={isMonge ? { borderColor: 'rgba(232,196,122,0.3)', color: '#E8C47A' } : {}}>
                {paused ? <I.play size={12} /> : <I.pause size={12} />} {paused ? 'Continuar' : 'Pausar'}
              </button>
              <button className="btn-ghost" onClick={finalizeEarly}
                style={{ borderColor: 'rgba(255,122,138,0.3)', color: 'var(--coral)' }}>
                Encerrar antes
              </button>
            </div>

            {/* Extension active indicator */}
            {blocker.installed && blocker.active && (
              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '4px 10px', borderRadius: 99,
                  background: `rgba(${focusMode === 'monge' ? '201,169,97' : focusMode === 'profundo' ? '91,71,184' : '0,184,212'},0.1)`,
                  border: `1px solid ${mv.ringColor}33`,
                  fontSize: 10.5, fontFamily: 'var(--font-num)', fontWeight: 700,
                  color: mv.ringColor,
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: mv.ringColor, boxShadow: `0 0 6px ${mv.ringGlow}` }} />
                  SITES BLOQUEADOS
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── FINISHED PHASE ── */}
        {phase === 'finished' && (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontSize: 52, marginBottom: 6, filter: naturallyFinished ? `drop-shadow(0 0 16px ${mv.ringGlow})` : 'none' }}>
              {naturallyFinished ? mv.finishEmoji : '🛡'}
            </div>
            <div className="font-display gradient-neon" style={{ fontSize: 22, fontWeight: 700 }}>
              {naturallyFinished ? mv.finishMsg : 'Sessão encerrada'}
            </div>
            {naturallyFinished && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8,
                padding: '4px 12px', borderRadius: 99,
                background: `${mv.ringColor}15`,
                border: `1px solid ${mv.ringColor}33`,
                fontSize: 11, color: mv.ringColor, fontWeight: 700, fontFamily: 'var(--font-num)',
              }}>
                <Glyph e={mv.icon} /> {mv.label} · +{modeConfig.xpBonus || 0} XP bônus
              </div>
            )}
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
              {naturallyFinished
                ? 'Excelente foco. Registre o que estudou pra coletar o XP da sessão.'
                : 'Sem XP automático (timer não chegou ao fim). Você ainda pode registrar.'}
            </div>
            <button onClick={openFullForm} className="btn-neon" style={{
              width: '100%', justifyContent: 'center', marginTop: 18, padding: '12px', fontSize: 14,
              background: naturallyFinished
                ? (window.FOCUS_MODES_CONFIG || {})[focusMode]?.gradient || 'var(--grad-primary)'
                : 'var(--grad-primary)',
              borderColor: 'transparent', color: 'var(--on-primary)',
            }}>
              <Glyph e="✏️" /> Abrir registro completo (tema, questões, acertos, erros)
            </button>
            <button onClick={onClose} className="btn-ghost" style={{ marginTop: 8, fontSize: 12 }}>
              Fechar sem registrar
            </button>
          </div>
        )}
      </div>

      {/* Distraction alert overlay */}
      {distractionAlert && (
        <div onClick={e => e.stopPropagation()} style={{
          position: 'fixed', inset: 0, zIndex: 110,
          background: 'radial-gradient(ellipse at center, rgba(220,38,38,0.55), rgba(60,10,10,0.85))',
          backdropFilter: 'blur(6px)',
          display: 'grid', placeItems: 'center', padding: 24,
          animation: 'distraction-flash 1.2s ease-in-out infinite',
        }}>
          <style>{`
            @keyframes distraction-flash {
              0%, 100% { background: radial-gradient(ellipse at center, rgba(220,38,38,0.55), rgba(60,10,10,0.85)); }
              50%      { background: radial-gradient(ellipse at center, rgba(248,113,113,0.75), rgba(120,20,20,0.95)); }
            }
            @keyframes distraction-pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
          `}</style>
          <div style={{
            maxWidth: 460, padding: '32px 28px',
            background: 'rgba(22,19,40,0.96)', borderRadius: 20,
            border: '2px solid #DC2626',
            boxShadow: '0 0 0 6px rgba(220,38,38,0.45), 0 24px 80px rgba(120,20,20,0.45)',
            textAlign: 'center',
            animation: 'distraction-pulse 1.2s ease-in-out infinite',
          }}>
            <div style={{ fontSize: 64, marginBottom: 12 }}><Glyph e="🚨" /></div>
            <div style={{ fontSize: 11, letterSpacing: '0.28em', color: '#EE9E95', fontFamily: 'var(--font-label)', fontWeight: 800, marginBottom: 6 }}>
              ALERTA DISTRAÇÃO
            </div>
            <div className="font-display" style={{ fontSize: 22, fontWeight: 800, color: '#EEA59C', lineHeight: 1.25, marginBottom: 8 }}>
              Volte a estudar!
            </div>
            <div style={{ fontSize: 14, color: '#EEA59C', lineHeight: 1.5, fontWeight: 600 }}>
              A realização do seu sonho depende disso!
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 18, flexWrap: 'wrap' }}>
              <button onClick={() => { setDistractionAlert(false); setPaused(false); }}
                className="btn-neon" style={{
                  padding: '12px 22px', fontSize: 14,
                  background: 'linear-gradient(135deg, #DC2626, #7F1D1D)',
                  borderColor: 'transparent', color: 'white',
                  boxShadow: '0 8px 24px rgba(220,38,38,0.45)',
                }}>
                ▶ Retomar agora
              </button>
              <button onClick={() => setDistractionAlert(false)} className="btn-ghost" style={{ fontSize: 12 }}>
                Continuar pausado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

window.QuickLogFAB  = QuickLogFAB;
window.PomodoroModal = PomodoroModal;
