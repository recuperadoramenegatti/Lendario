// TOGA — App Root v2 — Ultra Premium
// Changes vs v1:
// • Sidebar: fixed 200px, premium active state, no layout bug
// • TotalsSection: condensed to single horizontal row + mastered % metric
// • Removed "Checks no edital" item (replaced by Tópicos Dominados %)
// • Removed ConcursoInfo block below "tempo até a prova"
// • InsightsPanel, BackupSection, GoalsModal preserved
// • Micro-animation delays on cards

const { useState, useEffect, useRef } = React;

// ── Achievement Toast ──────────────────────────────────────
function AchievementToast({ kind, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 4500); return () => clearTimeout(t); }, []);
  const A = {
    week_streak:       { title: '7 dias de constância',         sub: 'Uma semana inteira encadeada',              icon: '🔥', color: '#f59e0b' },
    marathon:          { title: 'Maratonista',                  sub: 'Sessão de 90 min completa',                 icon: '🛡', color: 'var(--tinta)' },
    first_mastered:    { title: 'Primeiro tema dominado',       sub: 'Um tópico conquistado',                     icon: '⚡', color: '#00b8d4' },
    half_edital:       { title: 'Meio edital',                  sub: '50% dos tópicos dominados',                 icon: '🏆', color: 'var(--esmeralda)' },
    backup_done:       { title: 'Backup baixado',               sub: 'Arquivo salvo no seu computador',           icon: '💾', color: 'var(--esmeralda)' },
    restore_done:      { title: 'Backup restaurado',            sub: 'Seus dados foram recarregados',             icon: '🔄', color: '#00b8d4' },
    reset_done:        { title: 'Sistema zerado',               sub: 'Tudo voltou ao estado inicial',             icon: '🌱', color: 'var(--esmeralda)' },
    goals_saved:       { title: 'Metas atualizadas',            sub: 'Boa! Vamos cumprir',                        icon: '🎯', color: 'var(--tinta)' },
    pet_sick:          { title: 'Seu dragãozinho adoeceu 🤒', sub: 'Estude 2 dias seguidos para curá-lo',      icon: '🤒', color: '#f59e0b' },
    pet_healed:        { title: 'Seu dragãozinho está curado!', sub: 'Cuidando dele com seus estudos 🐉',      icon: '💚', color: 'var(--esmeralda)' },
    // Blindado achievements (regular toast)
    blindado_first:    { title: 'Primeiro Escudo Ativado',      sub: 'Sua primeira sessão blindada',              icon: '🛡️', color: '#5B47B8' },
    blindado_5:        { title: 'Guardião do Foco',             sub: '5 sessões blindadas concluídas',            icon: '⚔️', color: '#5B47B8' },
    blindado_monge:    { title: 'Caminho do Monge',             sub: 'Primeira sessão em Modo Monge completa',    icon: '🧘', color: '#C9A961' },
    // Epic blindado achievements (handled by CinematicAchievementToast — this is fallback)
    blindado_7day:     { title: 'Semana Blindada',              sub: '7 dias consecutivos no Modo Blindado',      icon: '🔥', color: '#f59e0b' },
    blindado_25:       { title: 'Sentinela',                    sub: '25 sessões blindadas completadas',          icon: '🏰', color: '#5B47B8' },
    blindado_50:       { title: 'Mestre Blindado',              sub: '50 sessões blindadas — lenda!',             icon: '⚡', color: '#00b8d4' },
    blindado_100h:     { title: 'Centúria',                     sub: '100 horas em Modo Blindado',                icon: '🏆', color: '#C9A961' },
    blindado_30day:    { title: 'Mês Blindado',                 sub: '30 dias consecutivos — nível supremo',      icon: '🌟', color: '#C9A961' },
  };
  const a = A[kind] || A.first_mastered;
  const isAviso = kind.startsWith('pet_') || ['goals_saved','backup_done','restore_done','reset_done'].includes(kind);
  return (
    <div className="glass-strong toast-achievement" style={{
      position: 'fixed', top: 80, right: 20, zIndex: 80,
      padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
      maxWidth: 340, borderRadius: 16,
      boxShadow: `0 12px 40px rgba(30,32,48,0.18), 0 0 0 1px ${a.color}44`,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
        background: `radial-gradient(circle, ${a.color}28, transparent)`,
        border: `1px solid ${a.color}33`,
        display: 'grid', placeItems: 'center', fontSize: 20,
      }}>{a.icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 9, letterSpacing: '0.2em', color: a.color, fontFamily: 'JetBrains Mono, monospace', fontWeight: 800 }}>
          {isAviso ? 'AVISO' : 'CONQUISTA'}
        </div>
        <div className="font-display" style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>{a.title}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{a.sub}</div>
      </div>
    </div>
  );
}

// ── Cinematic Achievement Toast — epic blindado milestones ──
function CinematicAchievementToast({ kind, onDone }) {
  const DISMISS_MS = 6000;
  useEffect(() => { const t = setTimeout(onDone, DISMISS_MS); return () => clearTimeout(t); }, []);

  const EPIC = {
    blindado_7day:  { title: 'SEMANA BLINDADA', sub: '7 dias consecutivos de foco inabalável', icon: '🔥', color: '#f59e0b', glow: 'rgba(245,158,11,0.55)', bg: 'rgba(20,14,0,0.97)' },
    blindado_25:    { title: 'SENTINELA',        sub: '25 sessões blindadas — você é incansável', icon: '🏰', color: '#5B47B8', glow: 'rgba(91,71,184,0.6)',  bg: 'rgba(8,6,20,0.97)'  },
    blindado_50:    { title: 'MESTRE BLINDADO',  sub: '50 sessões de concentração absoluta',      icon: '⚡', color: '#00b8d4', glow: 'rgba(0,184,212,0.55)', bg: 'rgba(0,10,18,0.97)' },
    blindado_100h:  { title: 'CENTÚRIA',         sub: '100 horas em Modo Blindado — lendário',    icon: '🏆', color: '#C9A961', glow: 'rgba(201,169,97,0.6)', bg: 'rgba(12,8,0,0.97)'  },
    blindado_30day: { title: 'MÊS BLINDADO',     sub: '30 dias seguidos — foco de elite',         icon: '🌟', color: '#C9A961', glow: 'rgba(201,169,97,0.6)', bg: 'rgba(10,8,0,0.97)'  },
  };
  const a = EPIC[kind] || EPIC.blindado_7day;

  // 8 particles with different trajectories
  const particles = [
    { dx: '0px', dy: '-60px', delay: '0ms' },
    { dx: '42px', dy: '-42px', delay: '60ms' },
    { dx: '60px', dy: '0px', delay: '120ms' },
    { dx: '42px', dy: '42px', delay: '80ms' },
    { dx: '0px', dy: '60px', delay: '40ms' },
    { dx: '-42px', dy: '42px', delay: '100ms' },
    { dx: '-60px', dy: '0px', delay: '20ms' },
    { dx: '-42px', dy: '-42px', delay: '140ms' },
  ];

  return (
    <>
      <style>{`
        @keyframes cinematic-enter {
          0%   { opacity: 0; transform: translateY(32px) scale(0.88); }
          60%  { opacity: 1; transform: translateY(-6px) scale(1.03); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes cinematic-particle {
          0%   { transform: translate(0,0) scale(1.2); opacity: 1; }
          100% { transform: translate(var(--pdx), var(--pdy)) scale(0); opacity: 0; }
        }
        @keyframes cinematic-progress {
          from { width: 100%; }
          to   { width: 0%; }
        }
        @keyframes cinematic-icon-pulse {
          0%, 100% { transform: scale(1) rotate(-3deg); filter: drop-shadow(0 0 16px var(--pcolor)); }
          50%      { transform: scale(1.12) rotate(3deg); filter: drop-shadow(0 0 28px var(--pcolor)); }
        }
      `}</style>
      <div style={{
        position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
        zIndex: 95, animation: 'cinematic-enter 500ms cubic-bezier(0.2,0.8,0.2,1) forwards',
        width: 'min(460px, calc(100vw - 32px))',
      }}>
        <div style={{
          background: a.bg, borderRadius: 20,
          border: `1.5px solid ${a.color}55`,
          boxShadow: `0 0 0 1px ${a.color}22, 0 0 50px ${a.glow}, 0 32px 80px rgba(0,0,0,0.5)`,
          overflow: 'hidden', position: 'relative',
        }}>
          {/* Particle burst — absolute positioned in the icon area */}
          <div style={{ position: 'absolute', top: 28, left: 36, width: 0, height: 0 }}>
            {particles.map((p, i) => (
              <div key={i} style={{
                position: 'absolute', width: 6, height: 6, borderRadius: '50%',
                background: a.color,
                '--pdx': p.dx, '--pdy': p.dy,
                animation: `cinematic-particle 700ms ${p.delay} cubic-bezier(0.2,0.8,0.2,1) forwards`,
              }} />
            ))}
          </div>

          <div style={{ padding: '24px 24px 20px', display: 'flex', gap: 18, alignItems: 'center' }}>
            <div style={{
              fontSize: 44, flexShrink: 0,
              '--pcolor': a.glow,
              animation: 'cinematic-icon-pulse 1.6s ease-in-out infinite',
            }}>{a.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 8.5, letterSpacing: '0.35em', color: a.color, fontFamily: 'JetBrains Mono, monospace', fontWeight: 900, marginBottom: 5 }}>
                ✦ CONQUISTA ÉPICA ✦
              </div>
              <div className="font-display" style={{ fontSize: 18, fontWeight: 800, color: a.color, letterSpacing: '-0.01em', lineHeight: 1.2, marginBottom: 4 }}>
                {a.title}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.45 }}>{a.sub}</div>
            </div>
            <button onClick={onDone} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', fontSize: 18, flexShrink: 0, alignSelf: 'flex-start' }}>×</button>
          </div>

          {/* Auto-dismiss progress bar */}
          <div style={{ height: 2, background: `${a.color}22` }}>
            <div style={{
              height: '100%', background: a.color,
              animation: `cinematic-progress ${DISMISS_MS}ms linear forwards`,
              boxShadow: `0 0 6px ${a.glow}`,
            }} />
          </div>
        </div>
      </div>
    </>
  );
}

const CINEMATIC_KINDS = new Set(['blindado_7day','blindado_25','blindado_50','blindado_100h','blindado_30day']);

// ── Storage helpers ────────────────────────────────────────
const KEYS = { shared: 'da_v3_shared', obj: 'da_v3_objetiva', disc: 'da_v3_discursiva', meta: 'da_v3_meta' };
function loadKey(key, fallback) {
  try { const raw = localStorage.getItem(key); if (!raw) return fallback; return JSON.parse(raw); } catch { return fallback; }
}
function saveKey(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }

const DEFAULTS = /*EDITMODE-BEGIN*/{
  "showSplash": false,
  "view": "dashboard",
  "mode": "objetiva"
}/*EDITMODE-END*/;

// Frases inspiradoras diárias — rotação determinística pelo dia do ano
const DAILY_PHRASES = [
  { text: 'Disciplina é a ponte entre as metas e as conquistas.', author: 'Jim Rohn' },
  { text: 'Constância vence talento quando o talento não é constante.', author: 'TOGA' },
  { text: 'Aprovação não acontece num dia — acontece todos os dias.', author: 'TOGA' },
  { text: 'O sucesso é a soma de pequenos esforços repetidos dia após dia.', author: 'Robert Collier' },
  { text: 'Sua única competição é quem você foi ontem.', author: 'James Clear' },
  { text: 'Não pare quando estiver cansado. Pare quando tiver terminado.', author: 'David Goggins' },
  { text: 'A toga não veste quem desiste no meio do caminho.', author: 'TOGA' },
  { text: 'A persistência realiza o impossível.', author: 'Provérbio chinês' },
  { text: 'Pequenos passos diários superam grandes saltos esporádicos.', author: 'TOGA' },
  { text: 'A dor da disciplina pesa gramas; a dor do arrependimento, toneladas.', author: 'Jim Rohn' },
  { text: 'O futuro pertence àqueles que se preparam hoje.', author: 'Malcolm X' },
  { text: 'Aprovar é decidir, todo dia, não desistir.', author: 'TOGA' },
  { text: 'Quem planta constância, colhe aprovação.', author: 'TOGA' },
  { text: 'Estude como se a vaga já fosse sua — porque ela está.', author: 'TOGA' },
  { text: 'Foco não é fazer mil coisas, é dizer não pra novecentas e noventa e nove.', author: 'Steve Jobs' },
  { text: 'Hábitos diários definem destinos finais.', author: 'TOGA' },
  { text: 'Não conte os dias — faça os dias contarem.', author: 'Muhammad Ali' },
  { text: 'A diferença entre o ordinário e o extraordinário é o "extra".', author: 'Jimmy Johnson' },
  { text: 'Comece onde está. Use o que tem. Faça o que pode.', author: 'Arthur Ashe' },
  { text: 'A jornada de mil páginas começa com uma única virada.', author: 'TOGA' },
];

function DailyPhrase() {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  const p = DAILY_PHRASES[dayOfYear % DAILY_PHRASES.length];
  return (
    <div className="anim-slide-up glass" style={{
      animationDelay: '40ms',
      padding: '12px 16px',
      display: 'flex', alignItems: 'flex-start', gap: 12,
      background: 'linear-gradient(135deg, rgba(11,61,92,0.05), rgba(0,184,212,0.05))',
      border: '1px solid rgba(0,184,212,0.15)',
      borderLeft: '3px solid var(--ciano)',
    }}>
      <div style={{ fontSize: 20, lineHeight: 1, flexShrink: 0, filter: 'drop-shadow(0 0 6px rgba(0,184,212,0.4))' }}>✨</div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 9.5, letterSpacing: '0.22em', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, marginBottom: 4 }}>
          INSPIRAÇÃO DO DIA
        </div>
        <div className="font-display" style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.45, fontStyle: 'italic' }}>
          "{p.text}"
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontWeight: 600 }}>
          — {p.author}
        </div>
      </div>
    </div>
  );
}

// ── Goals Modal ────────────────────────────────────────────
function GoalsModal({ open, goals, onSave, onClose }) {
  const [form, setForm] = useState(goals || {});
  useEffect(() => { if (open) setForm(goals); }, [open, goals]);
  if (!open) return null;

  const fields = [
    { k: 'dailyHours',      label: 'Horas por dia',        max: 16,   step: 0.5, color: '#00b8d4', icon: '⏱', unit: 'h' },
    { k: 'weeklyHours',     label: 'Horas por semana',     max: 80,   step: 1,   color: 'var(--tinta)',     icon: '📅', unit: 'h' },
    { k: 'dailyQuestions',  label: 'Questões por dia',     max: 300,  step: 5,   color: 'var(--esmeralda)', icon: '❓', unit: '' },
    { k: 'weeklyQuestions', label: 'Questões por semana',  max: 1500, step: 10,  color: '#f59e0b',          icon: '🎯', unit: '' },
    { k: 'dailyFlashcards', label: 'Flashcards por dia',   max: 300,  step: 5,   color: 'var(--coral)',     icon: '🃏', unit: '' },
  ];

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 90,
      background: 'rgba(30,32,48,0.45)', backdropFilter: 'blur(10px)',
      display: 'grid', placeItems: 'center', padding: 24,
      animation: 'fade-in 250ms ease-out',
    }}>
      <div onClick={e => e.stopPropagation()} className="glass-strong anim-slide-up"
        style={{ width: '100%', maxWidth: 480, padding: 26, borderRadius: 20, position: 'relative' }}>
        <button onClick={onClose} className="btn-ghost" style={{ position: 'absolute', top: 14, right: 14 }}>
          <I.close size={13} />
        </button>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 9.5, letterSpacing: '0.25em', color: 'var(--tinta)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800 }}>
            CONFIGURAR METAS
          </div>
          <div className="font-display gradient-neon" style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>
            Suas metas pessoais 🎯
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            Ajuste pra sua realidade. Você pode mudar quando quiser.
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {fields.map(f => (
            <div key={f.k}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>
                  <span style={{ marginRight: 6 }}>{f.icon}</span>{f.label}
                </span>
                <span className="num" style={{ fontSize: 16, fontWeight: 800, color: f.color }}>
                  {form[f.k] ?? 0}{f.unit}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button className="btn-ghost" style={{ padding: '4px 8px' }}
                  onClick={() => setForm(s => ({ ...s, [f.k]: Math.max(0, (s[f.k] || 0) - f.step) }))}>
                  <I.minus size={11} />
                </button>
                <input type="range" min={0} max={f.max} step={f.step} value={form[f.k] ?? 0}
                  onChange={e => setForm(s => ({ ...s, [f.k]: parseFloat(e.target.value) }))}
                  style={{ flex: 1, accentColor: f.color }} />
                <button className="btn-ghost" style={{ padding: '4px 8px' }}
                  onClick={() => setForm(s => ({ ...s, [f.k]: Math.min(f.max, (s[f.k] || 0) + f.step) }))}>
                  <I.plusSm size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => { onSave(form); onClose(); }} className="btn-neon" style={{
          width: '100%', justifyContent: 'center', marginTop: 22, padding: '12px 20px', fontSize: 13,
          background: 'linear-gradient(135deg, var(--petroleo), var(--ciano))', borderColor: 'transparent', color: 'white',
        }}>
          <I.check size={14} stroke={2.5} /> Salvar metas
        </button>
      </div>
    </div>
  );
}

// ── TotalsSection — condensed horizontal row ───────────────
function TotalsSection({ shared, objState, discState }) {
  const logs = shared.dailyLogs || [];
  const totalHours = logs.reduce((a, l) => a + (l.hours || 0), 0);
  const totalQuestions = logs.reduce((a, l) => a + (l.questions || 0), 0);
  const totalReviews = logs.reduce((a, l) => a + (l.reviews || 0), 0);
  const activeDays = logs.filter(l => (l.hours || 0) + (l.questions || 0) + (l.reviews || 0) > 0).length;

  const FLAGS_O = ['lei','doutrina','juris','questoes','revisao'];
  const FLAGS_D = ['estudado','grifado','questoes'];

  // Tópicos dominados: se > 2/3 das checkboxes marcadas = dominado
  let objMastered = 0, objTotalTopics = 0;
  objState.subjects.forEach(s => {
    objTotalTopics += s.topics.length;
    s.topics.forEach(t => {
      const c = FLAGS_O.filter(f => t[f]).length;
      if (c > FLAGS_O.length * 2 / 3) objMastered++;
    });
  });
  let discMastered = 0, discTotalTopics = 0;
  discState.subjects.forEach(s => {
    discTotalTopics += s.topics.length;
    s.topics.forEach(t => {
      const c = FLAGS_D.filter(f => t[f]).length;
      if (c > FLAGS_D.length * 2 / 3) discMastered++;
    });
  });
  const totalMastered = objMastered + discMastered;
  const totalTopics = objTotalTopics + discTotalTopics;
  const masteredPct = totalTopics > 0 ? (totalMastered / totalTopics) * 100 : 0;

  // Tópicos pedindo revisão
  const REVIEW_DAYS = 30;
  const daysSince = (iso) => iso ? Math.floor((new Date() - new Date(iso)) / 86400000) : Infinity;
  let needsReview = 0;
  objState.subjects.forEach(s => s.topics.forEach(t => {
    const c = FLAGS_O.filter(f => t[f]).length;
    if (c > 0 && daysSince(t.lastStudiedAt) >= REVIEW_DAYS) needsReview++;
  }));
  discState.subjects.forEach(s => s.topics.forEach(t => {
    const c = FLAGS_D.filter(f => t[f]).length;
    if (c > 0 && daysSince(t.lastStudiedAt) >= REVIEW_DAYS) needsReview++;
  }));

  const since = logs.length > 0
    ? new Date(logs[0].date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' })
    : null;

  const items = [
    { label: 'Horas estudadas',    value: totalHours.toFixed(1),              unit: 'h',  color: '#00b8d4',       colorRaw: '#00b8d4',  glow: '#00d9ff', sub: `${activeDays} dias` },
    { label: 'Questões',           value: totalQuestions.toLocaleString('pt-BR'), unit: '',color: 'var(--esmeralda)', colorRaw: '#00A86B', glow: '#00ff88', sub: 'resolvidas' },
    { label: 'Revisões',           value: totalReviews.toLocaleString('pt-BR'),   unit: '',color: 'var(--tinta)',   colorRaw: '#5B47B8',  glow: '#7B67D8', sub: 'flashcards' },
    { label: 'Tópicos dominados',  value: masteredPct.toFixed(0),             unit: '%',  color: 'var(--coral)',   colorRaw: '#E85D5D',  glow: '#FF7070', sub: `${totalMastered}/${totalTopics}` },
    { label: 'Pedem revisão',      value: needsReview,                        unit: '',   color: '#f59e0b',        colorRaw: '#f59e0b',  glow: '#ffc107', sub: needsReview > 0 ? '>30 dias' : 'tudo ok' },
  ];

  return (
    <div className="glass" style={{ padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 6 }}>
        <div>
          <div style={{ fontSize: 9.5, letterSpacing: '0.22em', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
            SUA JORNADA ATÉ AGORA
          </div>
          {since && (
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 3, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
              desde {since}
            </div>
          )}
        </div>

        {/* Mastered topics progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>Dominância do edital</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 120, height: 5, background: 'rgba(30,32,48,0.07)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${masteredPct}%`,
                background: 'linear-gradient(90deg, var(--coral), var(--ambar))',
                borderRadius: 99,
                transition: 'width 700ms cubic-bezier(0.16,1,0.3,1)',
                boxShadow: masteredPct > 0 ? '0 0 6px rgba(232,93,93,0.4)' : 'none',
              }} />
            </div>
            <span className="num" style={{ fontSize: 12, fontWeight: 800, color: 'var(--coral)' }}>{masteredPct.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Horizontal stat chips */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {items.map((m, i) => (
          <div key={i} className="anim-slide-up" style={{
            flex: '1 1 140px', padding: '12px 14px', borderRadius: 12,
            background: `linear-gradient(145deg, rgba(255,255,255,0.8), rgba(255,255,255,0.55)), radial-gradient(ellipse at 0% 0%, ${m.colorRaw}0e, transparent 60%)`,
            border: `1px solid ${m.colorRaw}22`,
            animationDelay: `${i * 60}ms`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <div style={{
                fontSize: 10, letterSpacing: '0.08em', color: 'var(--text-muted)',
                fontWeight: 700, textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace',
              }}>{m.label}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
              <span className="num" style={{
                fontSize: 24, fontWeight: 800, color: m.colorRaw,
                letterSpacing: '-0.02em',
                filter: `drop-shadow(0 0 8px ${m.glow}44)`,
              }}>{m.value}</span>
              <span className="num" style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 600 }}>{m.unit}</span>
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
              {m.sub}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── BackupSection ──────────────────────────────────────────
function BackupSection({ shared, objState, discState, onRestore, onReset, onToast }) {
  const fileInputRef = useRef(null);

  const handleExport = () => {
    const backup = { version: 'v3', exportedAt: new Date().toISOString(), shared, objetiva: objState, discursiva: discState };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `toga-backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url); onToast('backup_done');
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.shared || !data.objetiva || !data.discursiva) { alert('Arquivo inválido.'); return; }
        const ok = window.confirm('Isso vai SOBRESCREVER todos os seus dados atuais.\n\nDeseja continuar?');
        if (!ok) return; onRestore(data); onToast('restore_done');
      } catch (err) { alert('Erro ao ler o arquivo: ' + err.message); }
      finally { e.target.value = ''; }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    const typed = window.prompt('⚠️ Para confirmar, digite exatamente:\n\nRESETAR TOGA');
    if (typed !== 'RESETAR TOGA') return;
    localStorage.removeItem('toga_onboarded'); onReset(); onToast('reset_done');
  };

  return (
    <div className="glass" style={{ padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 9.5, letterSpacing: '0.22em', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, marginBottom: 5 }}>
            DADOS · BACKUP & RESTAURO
          </div>
          <div className="font-display" style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Seus dados, sob seu controle 💾</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 580 }}>
            Baixe um arquivo .json com todo o seu progresso. Você pode restaurar em outro navegador ou após reinstalação.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignSelf: 'center' }}>
          <button className="btn-neon" onClick={handleExport}><I.download size={13} /> Baixar backup</button>
          <button className="btn-ghost" onClick={handleImportClick}
            style={{ borderColor: 'rgba(245,158,11,0.4)', color: '#a14e0c', background: 'rgba(245,158,11,0.06)' }}>
            <I.up size={13} /> Restaurar
          </button>
          <button className="btn-ghost" onClick={handleReset}
            style={{ borderColor: 'rgba(232,93,93,0.4)', color: '#a82360', background: 'rgba(232,93,93,0.06)' }}>
            <I.close size={13} /> Zerar
          </button>
          <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={handleFileChange} className="file-input-hidden" />
        </div>
      </div>
    </div>
  );
}

// ── APP ROOT ───────────────────────────────────────────────
function App() {
  const [tweaks, setTweaks] = useTweaks(DEFAULTS);

  const [shared, setShared] = useState(() => {
    if (!localStorage.getItem('toga_onboarded')) {
      localStorage.removeItem(KEYS.shared); localStorage.removeItem(KEYS.obj);
      localStorage.removeItem(KEYS.disc); localStorage.removeItem(KEYS.meta);
      localStorage.setItem('toga_onboarded', '1');
    }
    return loadKey(KEYS.shared, window.DA.INITIAL_SHARED);
  });
  const [objState, setObjState]   = useState(() => loadKey(KEYS.obj,  window.DA.INITIAL_OBJETIVA));
  const [discState, setDiscState] = useState(() => loadKey(KEYS.disc, window.DA.INITIAL_DISCURSIVA));
  const [meta, setMeta]           = useState(() => loadKey(KEYS.meta, { mode: tweaks.mode }));

  useEffect(() => saveKey(KEYS.shared, shared), [shared]);
  useEffect(() => saveKey(KEYS.obj, objState), [objState]);
  useEffect(() => saveKey(KEYS.disc, discState), [discState]);
  useEffect(() => saveKey(KEYS.meta, meta), [meta]);

  useEffect(() => {
    setShared(s => {
      const logs = s.dailyLogs || [];
      const streak = window.DA.calcConstancia(logs);
      const bestStreak = Math.max(s.bestStreak || 0, window.DA.calcConstanciaRecord(logs), streak);
      return { petHealth: s.petHealth || 'healthy', goals: { dailyFlashcards: 30, ...s.goals }, ...s, streak, bestStreak, dragon: window.DG.ensure(s) };
    });
    const todayISO = new Date().toISOString();
    const FLAGS_O = ['lei','doutrina','juris','questoes','revisao'];
    const FLAGS_D = ['estudado','grifado','questoes'];
    setObjState(o => ({ ...o, subjects: o.subjects.map(sub => ({ ...sub, topics: sub.topics.map(t => {
      if (t.lastStudiedAt !== undefined) return t;
      return { ...t, lastStudiedAt: FLAGS_O.some(f => t[f]) ? todayISO : null };
    })}))}));
    setDiscState(d => ({ ...d, subjects: d.subjects.map(sub => ({ ...sub, topics: sub.topics.map(t => {
      if (t.lastStudiedAt !== undefined) return t;
      return { ...t, lastStudiedAt: FLAGS_D.some(f => t[f]) ? todayISO : null };
    })}))}));
  }, []);

  const mode = tweaks.mode;
  const setMode = (m) => { setTweaks('mode', m); setMeta(mt => ({ ...mt, mode: m })); };

  const [showSplash, setShowSplash] = useState(tweaks.showSplash);
  const [pomodoroOpen, setPomodoroOpen] = useState(false);
  const [goalsOpen, setGoalsOpen] = useState(false);
  const [sessionLogOpen, setSessionLogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('hoje');
  const [legalModal, setLegalModal] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('toga_onboarded_tutorial'));
  const [toasts, setToasts] = useState([]);
  const [cinematicToasts, setCinematicToasts] = useState([]);
  const [evolutionEvent, setEvolutionEvent] = useState(null);
  const [achQueue, setAchQueue] = useState([]);
  const [shareRequest, setShareRequest] = useState(null);
  const prevPetStageRef = useRef(window.getDragonStage(shared.xp));
  const [weeklyReportOpen, setWeeklyReportOpen] = useState(false);

  const pushToast = (kind) => {
    if (CINEMATIC_KINDS.has(kind)) {
      setCinematicToasts(t => [...t, { id: Math.random(), kind }]);
    } else {
      setToasts(t => [...t, { id: Math.random(), kind }]);
    }
  };

  // Show weekly report on first visit of each new week (weeks start Monday)
  useEffect(() => {
    const currentWeekKey = window.getCurrentWeekKey();
    const lastSeen = localStorage.getItem('toga_weekly_report_seen');
    if (lastSeen !== currentWeekKey && (shared.dailyLogs || []).length > 0) {
      const t = setTimeout(() => setWeeklyReportOpen(true), 1400);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    // Evolução do dragão (DRAGON_STAGES) — cinemática + cristais de recompensa
    const stage = window.getDragonStage(shared.xp);
    if (stage > prevPetStageRef.current) {
      const from = prevPetStageRef.current;
      setEvolutionEvent({ from, to: stage });
      setShared(s => window.DG.addReward(s, { gems: window.DG.EVOLUTION_GEMS * (stage - from) }));
      prevPetStageRef.current = stage;
    } else if (stage < prevPetStageRef.current) {
      prevPetStageRef.current = stage;
    }
  }, [shared.xp]);

  useEffect(() => {
    const next = window.DA.nextPetHealth(shared.petHealth || 'healthy', shared.dailyLogs || []);
    if (next !== shared.petHealth) {
      setShared(s => ({ ...s, petHealth: next }));
      if (next === 'sick') { pushToast('pet_sick'); window.playSick && window.playSick(); }
      else { pushToast('pet_healed'); window.playHealed && window.playHealed(); window.celebrateLight && window.celebrateLight(); }
    }
  }, [shared.dailyLogs, shared.petHealth]);
  useEffect(() => {
    const next = window.DA.nextPetHealth(shared.petHealth || 'healthy', shared.dailyLogs || []);
    if (next !== shared.petHealth) setShared(s => ({ ...s, petHealth: next }));
  }, []);

  // Conquistas: avalia sempre que o progresso muda e celebra as novas
  useEffect(() => {
    const unlocked = window.DG.evaluateAchievements(shared, objState, discState);
    const have = (shared.dragon && shared.dragon.achievements) || {};
    const fresh = unlocked.filter(id => !have[id]);
    if (!fresh.length) return;
    setShared(s => window.DG.recordAchievements(s, fresh));
    setAchQueue(q => [...q, ...fresh.filter(id => !q.includes(id))]);
  }, [shared, objState, discState]);

  // Recompensa de estudo (XP + cristais, multiplicados pela Chama do Dragão)
  const rewardFor = (entry) => window.DG.studyRewards(entry, shared.streak);
  const markStudyTime = (s) => {
    const h = new Date().getHours();
    let n = s;
    if (h >= 22 || h < 4) n = window.DG.setFlag(n, 'owl');
    if (h >= 5 && h < 7) n = window.DG.setFlag(n, 'early');
    return n;
  };
  const showStudyReward = (rw) => {
    if (!rw || (rw.xp <= 0 && rw.gems <= 0)) return;
    setTimeout(() => {
      window.FX && window.FX.reward(rw);
      window.SFX && window.SFX.xp();
      if (rw.mult > 1) { const c = window.FX.center(); window.FX.floatText(`🔥 Chama x${rw.mult}`, c.x, c.y + 50, '#EA580C', 16, 350); }
    }, 350);
  };

  const calcStreak = (logs) => window.DA.calcConstancia(logs);
  const calcBestStreak = (logs) => window.DA.calcConstanciaRecord(logs);
  const withStreakState = (s, logs) => {
    const streak = calcStreak(logs);
    const bestStreak = Math.max(s.bestStreak || 0, calcBestStreak(logs), streak);
    return { ...s, dailyLogs: logs, streak, bestStreak };
  };

  const mergeLog = (logs, e) => {
    const out = [...logs];
    const idx = out.findIndex(l => l.date === e.date);
    if (idx >= 0) {
      const ex = out[idx];
      out[idx] = { ...ex, hours: (ex.hours||0)+(e.hours||0), questions: (ex.questions||0)+(e.questions||0),
        correct: (ex.correct||0)+(e.correct||0), wrong: (ex.wrong||0)+(e.wrong||0), reviews: (ex.reviews||0)+(e.reviews||0),
        discipline: e.discipline || ex.discipline, studyType: e.studyType || ex.studyType, entries: [...(ex.entries||[]), e] };
      return { logs: out, idx };
    }
    out.push({ ...e, entries: [e] }); out.sort((a,b) => a.date.localeCompare(b.date));
    return { logs: out, idx: out.findIndex(l => l.date === e.date) };
  };

  const goalCrossBonus = (newDay, prevHours, prevQ, goals) => {
    let b = 0;
    if ((goals?.dailyHours||0) > 0 && newDay.hours >= goals.dailyHours && prevHours < goals.dailyHours) b += 5;
    if ((goals?.dailyQuestions||0) > 0 && newDay.questions >= goals.dailyQuestions && prevQ < goals.dailyQuestions) b += 5;
    return b;
  };

  const handleLog = (date, h, q, r) => {
    const rw = rewardFor({ hours: h, questions: q, reviews: r });
    const entry = { date, hours: h, questions: q, reviews: r, xp: rw.xp, gems: rw.gems };
    setShared(s => {
      const { logs, idx } = mergeLog(s.dailyLogs, entry);
      const day = logs[idx];
      const bonus = goalCrossBonus(day, (day.hours||0)-h, (day.questions||0)-q, s.goals);
      return window.DG.addReward(markStudyTime({ ...withStreakState(s, logs), xp: s.xp + bonus }), { xp: rw.xp, gems: rw.gems });
    });
    window.celebrateVictory && window.celebrateVictory();
    showStudyReward(rw);
  };

  const handleEnrichedLog = (logEntry, opts) => {
    const noXp    = opts && opts.noXp;
    const bonusXp = (opts && opts.bonusXp) || 0;
    const isBlindado = !!(logEntry.blindado);
    // O tempo estudado sempre rende XP/cristais; o bônus do Blindado continua exigindo concluir a sessão.
    const rw = rewardFor(logEntry);
    logEntry = { ...logEntry, xp: rw.xp, gems: rw.gems };

    setShared(s => {
      const { logs, idx } = mergeLog(s.dailyLogs, logEntry);
      const day = logs[idx];
      const cross = noXp ? 0 : goalCrossBonus(day, (day.hours||0)-(logEntry.hours||0), (day.questions||0)-(logEntry.questions||0), s.goals);
      let next = { ...withStreakState(s, logs), xp: s.xp + cross + (noXp ? 0 : bonusXp) };

      if (isBlindado && !noXp) {
        const today = new Date().toISOString().slice(0,10);
        const bd = s.blindado || { sessions: 0, hours: 0, streak: 0, bestStreak: 0, lastDate: null, modesUsed: {}, achievements: [] };
        const sessions  = (bd.sessions || 0) + 1;
        const hours     = (bd.hours    || 0) + (logEntry.hours || 0);
        const mode      = logEntry.blindadoMode || 'profundo';
        const modesUsed = { ...bd.modesUsed, [mode]: ((bd.modesUsed || {})[mode] || 0) + 1 };

        // Streak: consecutive days (weekends exempt)
        let streak = bd.streak || 0;
        if (bd.lastDate === today) {
          // same day — no streak change
        } else {
          const d = new Date(); let checks = 0;
          let prev = null;
          do {
            d.setDate(d.getDate() - 1);
            checks++;
            if (d.getDay() !== 0 && d.getDay() !== 6) { prev = d.toISOString().slice(0,10); break; }
          } while (checks < 5);
          if (bd.lastDate === today) {
            // already counted
          } else if (!bd.lastDate) {
            streak = 1;
          } else if (bd.lastDate === prev) {
            streak = (bd.streak || 0) + 1;
          } else {
            streak = 1;
          }
        }
        const bestStreak = Math.max(bd.bestStreak || 0, streak);
        const earned     = bd.achievements || [];
        const newEarned  = [...earned];
        const maybeEarn  = (key) => { if (!newEarned.includes(key)) { newEarned.push(key); setTimeout(() => pushToast(key), 400); } };

        if (sessions === 1)                                    maybeEarn('blindado_first');
        if (sessions === 5)                                    maybeEarn('blindado_5');
        if (sessions === 25)                                   maybeEarn('blindado_25');
        if (sessions === 50)                                   maybeEarn('blindado_50');
        if (modesUsed.monge === 1)                             maybeEarn('blindado_monge');
        if (streak >= 7  && !earned.includes('blindado_7day')) maybeEarn('blindado_7day');
        if (streak >= 30 && !earned.includes('blindado_30day'))maybeEarn('blindado_30day');
        if (hours >= 100 && !earned.includes('blindado_100h')) maybeEarn('blindado_100h');

        next = { ...next, blindado: { ...bd, sessions, hours, streak, bestStreak, lastDate: today, modesUsed, achievements: newEarned } };
      }

      return window.DG.addReward(markStudyTime(next), { xp: rw.xp, gems: rw.gems });
    });
    window.celebrateLight && window.celebrateLight();
    showStudyReward(rw);
  };

  const recomputeDayTotals = (day) => {
    const entries = day.entries || [];
    const sum = (k) => entries.reduce((a, e) => a + (Number(e[k]) || 0), 0);
    const last = entries[entries.length - 1] || {};
    return {
      ...day,
      hours: Math.round(sum('hours') * 100) / 100,
      questions: sum('questions'),
      correct: sum('correct'),
      wrong: sum('wrong'),
      reviews: sum('reviews'),
      discipline: last.discipline || day.discipline,
      studyType: last.studyType || day.studyType,
      entries,
    };
  };

  const ensureEntries = (day) => {
    if (day.entries && day.entries.length > 0) return day;
    const { entries: _drop, ...rest } = day;
    return { ...day, entries: [{ ...rest }] };
  };

  const [editTarget, setEditTarget] = useState(null); // { date, idx, entry }
  const [pomodoroPrefill, setPomodoroPrefill] = useState(null); // { initial, awardXp }

  const handleDeleteEntry = (date, idx) => {
    setShared(s => {
      const logs = (s.dailyLogs || []).map(d => d.date === date ? ensureEntries(d) : d);
      const i = logs.findIndex(d => d.date === date);
      if (i < 0) return s;
      const day = logs[i];
      // Estorna XP e cristais concedidos pela sessão excluída
      const removed = day.entries[idx] || {};
      s = window.DG.addReward(s, { xp: -(removed.xp || 0), gems: -(removed.gems || 0) });
      const newEntries = day.entries.filter((_, k) => k !== idx);
      let newLogs;
      if (newEntries.length === 0) {
        newLogs = logs.filter(d => d.date !== date);
      } else {
        newLogs = [...logs];
        newLogs[i] = recomputeDayTotals({ ...day, entries: newEntries });
      }
      return withStreakState(s, newLogs);
    });
  };

  const handleUpdateEntry = (date, idx, updated) => {
    setShared(s => {
      let logs = (s.dailyLogs || []).map(d => d.date === date ? ensureEntries(d) : d);
      const i = logs.findIndex(d => d.date === date);
      if (i < 0) return s;
      const day = logs[i];
      const oldXp = (day.entries[idx] && day.entries[idx].xp) || 0;
      const newEntry = { ...day.entries[idx], ...updated };
      if (day.entries[idx] && day.entries[idx].xp != null) {
        const rw = window.DG.studyRewards(newEntry, s.streak);
        const oldGems = day.entries[idx].gems || 0;
        newEntry.xp = rw.xp; newEntry.gems = rw.gems;
        s = window.DG.addReward(s, { xp: newEntry.xp - oldXp, gems: rw.gems - oldGems });
      }
      const newDate = updated.date || date;

      if (newDate === date) {
        const newEntries = day.entries.map((e, k) => k === idx ? newEntry : e);
        const newLogs = [...logs];
        newLogs[i] = recomputeDayTotals({ ...day, entries: newEntries });
        return withStreakState(s, newLogs);
      }

      // Date changed: remove from old day, add to new day.
      const oldEntries = day.entries.filter((_, k) => k !== idx);
      let working = [...logs];
      if (oldEntries.length === 0) working = working.filter(d => d.date !== date);
      else working[i] = recomputeDayTotals({ ...day, entries: oldEntries });

      const targetIdx = working.findIndex(d => d.date === newDate);
      if (targetIdx >= 0) {
        const target = ensureEntries(working[targetIdx]);
        working[targetIdx] = recomputeDayTotals({ ...target, entries: [...target.entries, { ...newEntry, date: newDate }] });
      } else {
        working.push(recomputeDayTotals({ date: newDate, entries: [{ ...newEntry, date: newDate }] }));
        working.sort((a, b) => a.date.localeCompare(b.date));
      }
      return withStreakState(s, working);
    });
  };

  const handleAddCustomStudyType = (name) => {
    setShared(s => {
      const list = s.customStudyTypes || [];
      if (list.includes(name)) return s;
      return { ...s, customStudyTypes: [...list, name] };
    });
  };

  const handleSession = ({ minutes, subjectId, discipline, studyType, note }) => {
    const today = new Date().toISOString().slice(0,10);
    const hours = minutes / 60;
    const rw = rewardFor({ hours });
    const entry = { date: today, hours, discipline, studyType: studyType || 'Pomodoro', note, source: 'pomodoro', xp: rw.xp, gems: rw.gems };
    setShared(s => {
      const { logs, idx } = mergeLog(s.dailyLogs, entry);
      const day = logs[idx];
      const cross = goalCrossBonus(day, (day.hours||0)-hours, (day.questions||0), s.goals);
      return window.DG.addReward(markStudyTime({ ...withStreakState(s, logs), xp: s.xp + 2 + cross }), { xp: rw.xp, gems: rw.gems });
    });
    if (minutes >= 90) pushToast('marathon');
    window.celebrateVictory();
    showStudyReward(rw);
  };

  const handleMaster = () => {
    setShared(s => ({ ...s, xp: s.xp + 25 }));
    if (!shared.achievements.includes('first_mastered')) {
      pushToast('first_mastered');
      setShared(s => ({ ...s, achievements: [...s.achievements, 'first_mastered'] }));
    }
  };
  const handleCheckXp = (delta) => setShared(s => window.DG.countCheck({ ...s, xp: Math.max(0, s.xp + delta) }, delta));

  const setConcursos = (updater) => setShared(s => ({ ...s, concursos: typeof updater === 'function' ? updater(s.concursos) : updater }));
  const setHistoricoProvas = (updater) => setShared(s => ({ ...s, historicoProvas: typeof updater === 'function' ? updater(s.historicoProvas || []) : updater }));

  const handleAddSimulado = (sim) => {
    setShared(s => {
      const sims = [...(s.simulados || []), sim];
      const xpGain = (window.DA.simuladoXp ? window.DA.simuladoXp(sim) : 10);
      return { ...s, simulados: sims, xp: (s.xp || 0) + xpGain };
    });
    window.celebrateHighEnergy && window.celebrateHighEnergy();
  };
  const handleRemoveSimulado = (id) => {
    setShared(s => ({ ...s, simulados: (s.simulados || []).filter(x => x.id !== id) }));
  };
  const handleRestore = (backup) => {
    setShared(backup.shared); setObjState(backup.objetiva); setDiscState(backup.discursiva);
    prevPetStageRef.current = window.getDragonStage(backup.shared.xp || 0);
  };
  const handleReset = () => {
    setShared(window.DA.INITIAL_SHARED); setObjState(window.DA.INITIAL_OBJETIVA); setDiscState(window.DA.INITIAL_DISCURSIVA);
    prevPetStageRef.current = 1;
  };
  const handleSaveGoals = (newGoals) => { setShared(s => ({ ...s, goals: { ...s.goals, ...newGoals } })); pushToast('goals_saved'); };

  if (showSplash) return <SplashScreen onEnter={() => { setShowSplash(false); setTweaks('showSplash', false); }} />;

  const activeSubjects = mode === 'objetiva' ? objState.subjects : discState.subjects;
  const combinedSubjects = React.useMemo(() => {
    const seen = new Map();
    [...objState.subjects, ...discState.subjects].forEach(s => {
      if (s && s.name && !seen.has(s.name)) seen.set(s.name, s);
    });
    return Array.from(seen.values());
  }, [objState.subjects, discState.subjects]);
  const totalStats = mode === 'objetiva' ? window.DA.getTotalStatsObj(objState.subjects) : window.DA.getTotalStatsDisc(discState.subjects);
  const isSick = shared.petHealth === 'sick';

  const TABS = [
    { id: 'hoje',         label: 'HOJE',                      icon: '🏠' },
    { id: 'covil',        label: 'COVIL DO DRAGÃO',           icon: '🐉', shortLabel: 'COVIL' },
    { id: 'edital',       label: 'EDITAL',                    icon: '📋' },
    { id: 'simulados',    label: 'SIMULADOS',                 icon: '🎯' },
    { id: 'concursos',    label: 'DESEMPENHO EM CONCURSOS',   icon: '🏆', shortLabel: 'CONCURSOS' },
    { id: 'estatisticas', label: 'ESTATÍSTICAS',              icon: '📊' },
    { id: 'historico',    label: 'HISTÓRICO',                 icon: '📜' },
    { id: 'ajustes',      label: 'AJUSTES',                   icon: '⚙️' },
  ];

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      <div className="aurora" />
      <div className="dot-grid" />

      <GlobalHeader shared={shared} mode={mode} setMode={setMode} totalPct={totalStats.percentage} onOpenLair={() => setActiveTab('covil')} />

      {/* Sidebar */}
      <nav className="nav-sidebar">
        <div className="nav-sidebar-brand">
          <span style={{ fontSize: 20 }}>⚖️</span> TOGA
        </div>
        {TABS.map(tab => (
          <button key={tab.id} className={`nav-tab ${activeTab === tab.id ? 'nav-tab-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}>
            <span className="nav-tab-icon">{tab.icon}</span>
            <span style={tab.shortLabel ? { whiteSpace: 'normal', lineHeight: 1.25, fontSize: 10.5, textAlign: 'left' } : undefined}>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom nav (mobile) */}
      <nav className="nav-bottom">
        {TABS.map(tab => (
          <button key={tab.id} className={`nav-tab ${activeTab === tab.id ? 'nav-tab-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}>
            <span className="nav-tab-icon">{tab.icon}</span>
            <span>{tab.shortLabel || tab.label}</span>
          </button>
        ))}
      </nav>

      <main className="toga-main" style={{ maxWidth: 1200, margin: '0 auto', padding: '22px 24px 100px', position: 'relative' }}>

        {/* ── ABA: HOJE ── */}
        {activeTab === 'hoje' && (
          <>
            <style>{`@media (max-width: 900px) { .greeting-row { grid-template-columns: 1fr !important; } }`}</style>
            <div className="greeting-row" style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(0,1.2fr) minmax(0,1fr)', marginBottom: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="anim-slide-up" style={{ animationDelay: '0ms' }}>
                  <div className="font-display" style={{ fontSize: 27, fontWeight: 700, letterSpacing: '-0.025em' }}>
                    Bom estudo, <span className="gradient-neon">Concurseiro(a)</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    {' · '}
                    <span style={{ fontWeight: 700, color: mode === 'objetiva' ? 'var(--ciano)' : 'var(--coral)' }}>
                      Modo {mode === 'objetiva' ? 'Objetiva' : 'Discursiva'}
                    </span>
                  </div>
                </div>
                <DailyPhrase />
                <DragonHomeCard shared={shared} setShared={setShared} onOpenLair={() => { setActiveTab('covil'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="anim-slide-up" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', animationDelay: '60ms' }}>
                  <button className="btn-ghost" onClick={() => setGoalsOpen(true)}
                    style={{ borderColor: 'rgba(91,71,184,0.3)', color: 'var(--tinta)', background: 'rgba(91,71,184,0.05)', fontWeight: 600, fontSize: 12 }}>
                    🎯 Metas
                  </button>
                  <button className="btn-neon" onClick={() => setSessionLogOpen(true)} style={{ fontSize: 12 }}>
                    ✏️ Registrar sessão
                  </button>
                  <button className="btn-ghost" onClick={() => setPomodoroOpen(true)} style={{ fontSize: 12 }}>
                    🛡 Blindado
                  </button>
                </div>

                <div className="anim-slide-up" style={{ animationDelay: '80ms' }}>
                  <DailyQuestsCard shared={shared} setShared={setShared} compact />
                </div>

                <div className="anim-slide-up" style={{ animationDelay: '100ms' }}>
                  <GavelBar percentage={totalStats.percentage} streak={shared.streak} shields={shared.shields} />
                </div>

                <div className="anim-slide-up" style={{ animationDelay: '140ms' }}>
                  <ConcursoDonuts concursos={shared.concursos || []} setConcursos={setConcursos} />
                </div>
              </div>
            </div>

            <section className="anim-slide-up hours-overview-row" style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.75fr) minmax(0, 1fr)',
              gap: 14,
              marginBottom: 16,
              animationDelay: '50ms',
              alignItems: 'stretch',
            }}>
              <WeeklyHoursChart shared={shared} />
              <MetricsRow shared={shared} setShared={setShared} kind="hours" title="METAS DE HORAS" cols={1} />
            </section>
            <style>{`@media (max-width: 860px) { .hours-overview-row { grid-template-columns: 1fr !important; } }`}</style>

            <section className="anim-slide-up" style={{ marginBottom: 16, animationDelay: '85ms' }}>
              <ConstanciaTracker logs={shared.dailyLogs} bestStreak={shared.bestStreak} />
            </section>

            <div className="dual-grid anim-slide-up" style={{ display: 'grid', gap: 14, marginBottom: 16, animationDelay: '100ms' }}>
              <StudyHeatmap logs={shared.dailyLogs} />
              <QuestionsFlashcardsHeatmap logs={shared.dailyLogs} />
            </div>

            <section className="anim-slide-up metrics-line" style={{
              display: 'grid',
              gap: 14,
              gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
              marginBottom: 16,
              animationDelay: '115ms',
            }}>
              <MetricsRow shared={shared} setShared={setShared} kind="questions" title="METAS DE QUESTÕES" />
              <AccuracyOverallCard shared={shared} />
            </section>
            <style>{`@media (max-width: 900px) { .metrics-line { grid-template-columns: 1fr !important; } }`}</style>

            <section className="anim-slide-up" style={{ marginBottom: 16, animationDelay: '130ms' }}>
              <InsightsPanel shared={shared} objState={objState} discState={discState} />
            </section>

            <section className="anim-slide-up" style={{ marginBottom: 16, animationDelay: '150ms' }}>
              <TotalsSection shared={shared} objState={objState} discState={discState} />
            </section>
          </>
        )}

        {/* ── ABA: COVIL DO DRAGÃO ── */}
        {activeTab === 'covil' && (
          <DragonLairTab shared={shared} setShared={setShared} objState={objState} discState={discState} onShare={setShareRequest} />
        )}

        {/* ── ABA: HISTÓRICO ── */}
        {activeTab === 'historico' && (
          <HistoricoTab
            shared={shared}
            onDeleteEntry={handleDeleteEntry}
            onEditEntry={(date, idx, entry) => setEditTarget({ date, idx, entry })}
          />
        )}

        {/* ── ABA: EDITAL ── */}
        {activeTab === 'edital' && (
          <>
            <section style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                <div className="font-display" style={{ fontSize: 20, fontWeight: 700 }}>Matriz do Edital</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', fontWeight: 700 }}>
                  · {mode === 'objetiva' ? 'OBJETIVA' : 'DISCURSIVA'}
                </div>
                <div style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                  cada check +1 XP × peso
                </div>
              </div>
              {mode === 'objetiva'
                ? <SyllabusMatrixObjetiva state={objState} setState={setObjState} onMaster={handleMaster} onCheckXp={handleCheckXp} dailyLogs={shared.dailyLogs} />
                : <SyllabusMatrixDiscursiva state={discState} setState={setDiscState} onCheckXp={handleCheckXp} dailyLogs={shared.dailyLogs} />}
            </section>
            {activeSubjects.length > 0 && (
              <section style={{ marginBottom: 16 }}>
                <SubjectDonuts subjects={activeSubjects} mode={mode} />
              </section>
            )}
            <section style={{ marginBottom: 16 }}>
              <EditalHeatmap subjects={mode === 'objetiva' ? objState.subjects : discState.subjects} mode={mode} />
            </section>
          </>
        )}

        {/* ── ABA: SIMULADOS ── */}
        {activeTab === 'simulados' && (
          <SimuladosTab
            shared={shared}
            objState={objState}
            discState={discState}
            mode={mode}
            onAddSimulado={handleAddSimulado}
            onRemoveSimulado={handleRemoveSimulado}
          />
        )}

        {/* ── ABA: DESEMPENHO EM CONCURSOS ── */}
        {activeTab === 'concursos' && (
          <ConcursosDesempenhoTab
            provas={shared.historicoProvas || []}
            setProvas={setHistoricoProvas}
            onXpGain={(amount, kind) => {
              setShared(s => ({ ...s, xp: (s.xp || 0) + amount }));
              if (kind === 'victory') window.celebrateVictory && window.celebrateVictory();
              else if (kind === 'high') window.celebrateHighEnergy && window.celebrateHighEnergy();
              else if (amount > 0) window.celebrateLight && window.celebrateLight();
            }}
          />
        )}

        {/* ── ABA: ESTATÍSTICAS ── */}
        {activeTab === 'estatisticas' && (
          <StatsPage shared={shared} objState={objState} discState={discState} />
        )}

        {/* ── ABA: AJUSTES ── */}
        {activeTab === 'ajustes' && (
          <>
            <div className="font-display" style={{ fontSize: 20, fontWeight: 700, color: 'var(--petroleo)', marginBottom: 16 }}>Ajustes</div>
            <section style={{ marginBottom: 14 }}>
              <div className="glass" style={{ padding: '18px 20px' }}>
                <div style={{ fontSize: 9.5, letterSpacing: '0.22em', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, marginBottom: 6 }}>METAS PESSOAIS</div>
                <div className="font-display" style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Configure suas metas diárias e semanais</div>
                <button className="btn-neon" onClick={() => setGoalsOpen(true)} style={{ fontSize: 13 }}>🎯 Configurar metas</button>
              </div>
            </section>

            {/* Blindado settings + stats */}
            <section style={{ marginBottom: 14 }}>
              <div className="glass" style={{ padding: '18px 20px' }}>
                <div style={{ fontSize: 9.5, letterSpacing: '0.22em', color: 'var(--tinta)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, marginBottom: 6 }}>
                  🛡 MODO BLINDADO · EXTENSÃO
                </div>
                <div className="font-display" style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Configurações de bloqueio</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
                  Configure os sites bloqueados e o modo de foco padrão. A extensão é opcional — o timer funciona sem ela.
                </div>

                {/* Blindado stats strip */}
                {(shared.blindado?.sessions || 0) > 0 && (() => {
                  const bd = shared.blindado || {};
                  const items = [
                    { label: 'Sessões', value: bd.sessions || 0, unit: '', color: '#5B47B8' },
                    { label: 'Horas blindadas', value: ((bd.hours || 0)).toFixed(1), unit: 'h', color: '#00b8d4' },
                    { label: 'Streak atual', value: bd.streak || 0, unit: bd.streak > 1 ? ' dias' : ' dia', color: '#f59e0b' },
                    { label: 'Recorde', value: bd.bestStreak || 0, unit: bd.bestStreak > 1 ? ' dias' : ' dia', color: '#C9A961' },
                  ];
                  return (
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                      {items.map((it, i) => (
                        <div key={i} style={{
                          flex: '1 1 100px', padding: '10px 12px', borderRadius: 10,
                          background: `${it.color}0e`, border: `1px solid ${it.color}22`,
                        }}>
                          <div style={{ fontSize: 9.5, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 4 }}>{it.label.toUpperCase()}</div>
                          <div className="num" style={{ fontSize: 20, fontWeight: 800, color: it.color }}>{it.value}<span style={{ fontSize: 11 }}>{it.unit}</span></div>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {typeof window.BlockerSettingsSection === 'function'
                  ? <BlockerSettingsSection />
                  : <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      Abra o timer <strong>🛡 Blindado</strong> para configurar os modos de foco e sites bloqueados.
                    </div>
                }
              </div>
            </section>
            <section style={{ marginBottom: 14 }}>
              <BackupSection shared={shared} objState={objState} discState={discState}
                onRestore={handleRestore} onReset={handleReset} onToast={pushToast} />
            </section>
            <section style={{ marginBottom: 14 }}>
              <div className="glass" style={{ padding: '18px 20px' }}>
                <div style={{ fontSize: 9.5, letterSpacing: '0.22em', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, marginBottom: 6 }}>RELATÓRIO SEMANAL</div>
                <div className="font-display" style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Resumo da semana anterior</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                  Veja o relatório completo da semana passada com horas, disciplinas e insights.
                </div>
                <button className="btn-ghost" onClick={() => setWeeklyReportOpen(true)} style={{ fontSize: 13 }}>
                  📋 Ver relatório semanal
                </button>
              </div>
            </section>
            <section style={{ marginBottom: 14 }}>
              <div className="glass" style={{ padding: '18px 20px' }}>
                <div style={{ fontSize: 9.5, letterSpacing: '0.22em', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, marginBottom: 6 }}>TUTORIAL</div>
                <div className="font-display" style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Rever o tutorial de boas-vindas</div>
                <button className="btn-ghost" onClick={() => { localStorage.removeItem('toga_onboarded_tutorial'); setShowOnboarding(true); }} style={{ fontSize: 13 }}>📖 Ver tutorial novamente</button>
              </div>
            </section>
            <section style={{ marginBottom: 14 }}>
              <div className="glass" style={{ padding: '18px 20px' }}>
                <div style={{ fontSize: 9.5, letterSpacing: '0.22em', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, marginBottom: 6 }}>INFORMAÇÕES LEGAIS</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                  <button className="btn-ghost" onClick={() => setLegalModal('privacy')} style={{ fontSize: 12 }}>🔒 Política de Privacidade</button>
                  <button className="btn-ghost" onClick={() => setLegalModal('terms')} style={{ fontSize: 12 }}>📄 Termos de Uso</button>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 10, fontFamily: 'JetBrains Mono, monospace' }}>
                  TOGA v2.0 · Todos os dados ficam no seu dispositivo
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <QuickLogFAB onOpenSessionLog={() => setSessionLogOpen(true)} onOpenPomodoro={() => setPomodoroOpen(true)} />
      <SessionLogModal open={sessionLogOpen} subjects={combinedSubjects}
        initial={pomodoroPrefill ? pomodoroPrefill.initial : undefined}
        onSave={(log) => {
          const fromPomo  = !!pomodoroPrefill;
          const noXp      = fromPomo && pomodoroPrefill.awardXp === false;
          const baseBonus = (fromPomo && pomodoroPrefill.awardXp === true) ? 5 : 0;
          const modeBonus = (fromPomo && pomodoroPrefill.awardXp === true) ? (pomodoroPrefill.modeXpBonus || 0) : 0;
          const entry     = fromPomo ? { ...log, blindado: pomodoroPrefill.blindado, blindadoMode: pomodoroPrefill.blindadoMode } : log;
          handleEnrichedLog(entry, { noXp, bonusXp: baseBonus + modeBonus });
          setPomodoroPrefill(null);
        }}
        onClose={() => { setSessionLogOpen(false); setPomodoroPrefill(null); }}
        customStudyTypes={shared.customStudyTypes || []}
        onAddCustomStudyType={handleAddCustomStudyType} />
      <SessionLogModal open={!!editTarget} subjects={combinedSubjects}
        initial={editTarget?.entry}
        customStudyTypes={shared.customStudyTypes || []}
        onAddCustomStudyType={handleAddCustomStudyType}
        onSave={(updated) => { if (editTarget) handleUpdateEntry(editTarget.date, editTarget.idx, updated); }}
        onClose={() => setEditTarget(null)} />
      <PomodoroModal open={pomodoroOpen} onClose={() => setPomodoroOpen(false)}
        subjects={combinedSubjects.length ? combinedSubjects : objState.subjects}
        customStudyTypes={shared.customStudyTypes || []}
        onAddCustomStudyType={handleAddCustomStudyType}
        onCompleteSession={handleSession}
        blindadoStats={shared.blindado || {}}
        onOpenFullLog={({ durationMin, discipline, awardXp, blindado, blindadoMode, modeXpBonus }) => {
          const totalMin = Math.max(0, Math.round(durationMin || 0));
          const initial  = {
            date:      new Date().toISOString().slice(0,10),
            discipline: discipline || '',
            hours:     totalMin / 60,
            source:    awardXp ? 'pomodoro' : 'pomodoro-early',
          };
          setPomodoroPrefill({ initial, awardXp: !!awardXp, blindado: !!blindado, blindadoMode, modeXpBonus: modeXpBonus || 0 });
          setPomodoroOpen(false);
          setSessionLogOpen(true);
        }} />
      <GoalsModal open={goalsOpen} goals={shared.goals} onSave={handleSaveGoals} onClose={() => setGoalsOpen(false)} />

      {showOnboarding && <OnboardingModal onDone={() => setShowOnboarding(false)} />}
      {legalModal && <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />}
      {evolutionEvent && <EvolutionCinematic from={evolutionEvent.from} to={evolutionEvent.to}
        equipped={{ ...(shared.dragon && shared.dragon.equipped), bg: undefined }}
        onShare={setShareRequest} onClose={() => setEvolutionEvent(null)} />}
      {!evolutionEvent && !weeklyReportOpen && achQueue.length > 0 && (
        <AchievementCelebration ids={achQueue} onShare={setShareRequest} onDone={() => setAchQueue([])} />
      )}
      {shareRequest && <ShareCardModal request={shareRequest} shared={shared} objState={objState} discState={discState} onClose={() => setShareRequest(null)} />}
      {toasts.map(t => <AchievementToast key={t.id} kind={t.kind} onDone={() => setToasts(ts => ts.filter(x => x.id !== t.id))} />)}
      {cinematicToasts.slice(-1).map(t => <CinematicAchievementToast key={t.id} kind={t.kind} onDone={() => setCinematicToasts(ts => ts.filter(x => x.id !== t.id))} />)}
      <WeeklyReportModal open={weeklyReportOpen} shared={shared} onClose={() => {
        localStorage.setItem('toga_weekly_report_seen', window.getCurrentWeekKey());
        setWeeklyReportOpen(false);
      }} />

      <TweaksPanel title="Tweaks · TOGA">
        <TweakSection label="Modo">
          <TweakRadio label="Fase" value={tweaks.mode}
            options={[{ value: 'objetiva', label: 'Objetiva' }, { value: 'discursiva', label: 'Discursiva' }]}
            onChange={(v) => { setTweaks('mode', v); setMeta(m => ({ ...m, mode: v })); }} />
          <TweakToggle label="Mostrar Splash" value={tweaks.showSplash} onChange={(v) => setTweaks('showSplash', v)} />
        </TweakSection>
        <TweakSection label="Backup">
          <TweakButton label="💾 Baixar backup" onClick={() => {
            const backup = { version: 'v3', exportedAt: new Date().toISOString(), shared, objetiva: objState, discursiva: discState };
            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `toga-backup-${new Date().toISOString().slice(0,10)}.json`;
            document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
            pushToast('backup_done');
          }} />
        </TweakSection>
        <TweakSection label="Pet sandbox">
          <TweakButton label="+250 XP"    onClick={() => setShared(s => ({ ...s, xp: s.xp + 250 }))} />
          <TweakButton label="+1000 XP"   onClick={() => setShared(s => ({ ...s, xp: s.xp + 1000 }))} />
          <TweakButton label="+3000 XP"   onClick={() => setShared(s => ({ ...s, xp: s.xp + 3000 }))} />
          <TweakButton label="Reset XP"   onClick={() => { setShared(s => ({ ...s, xp: 0 })); prevPetStageRef.current = 1; }} />
          <TweakButton label="+500 💎"    onClick={() => setShared(s => window.DG.addReward(s, { gems: 500 }))} />
          <TweakButton label="Evoluir →"  onClick={() => { const e = window.evaluateDragon(shared.xp); if (e.next) setShared(s => ({ ...s, xp: e.next.minXp })); }} />
          <TweakButton label="Conquista"  onClick={() => setAchQueue(['streak_7'])} />
          <TweakButton label="XP=15k"     onClick={() => setShared(s => ({ ...s, xp: 15000 }))} />
          <TweakButton label="Pet doente" onClick={() => { setShared(s => ({ ...s, petHealth: 'sick' })); pushToast('pet_sick'); }} />
          <TweakButton label="Pet saudável" onClick={() => { setShared(s => ({ ...s, petHealth: 'healthy' })); pushToast('pet_healed'); }} />
        </TweakSection>
        <TweakSection label="Celebrações">
          <TweakButton label="✨ Leve"    onClick={() => window.celebrateLight && window.celebrateLight()} />
          <TweakButton label="🎉 Meta"    onClick={() => window.celebrateHighEnergy && window.celebrateHighEnergy()} />
          <TweakButton label="🏆 Vitória" onClick={() => window.celebrateVictory && window.celebrateVictory()} />
          <TweakButton label="🌟 Evolução" onClick={() => window.celebrateEvolution && window.celebrateEvolution()} />
        </TweakSection>
        <TweakSection label="Relatório Semanal">
          <TweakButton label="📋 Abrir relatório" onClick={() => setWeeklyReportOpen(true)} />
          <TweakButton label="🔄 Reset semana vista" onClick={() => { localStorage.removeItem('toga_weekly_report_seen'); }} />
        </TweakSection>
        <TweakSection label="Limpar dados">
          <TweakButton label="Reset Objetiva"   onClick={() => setObjState(window.DA.INITIAL_OBJETIVA)} />
          <TweakButton label="Reset Discursiva" onClick={() => setDiscState(window.DA.INITIAL_DISCURSIVA)} />
        </TweakSection>
      </TweaksPanel>

      <div id="confetti-root" />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
