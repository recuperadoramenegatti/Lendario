// Lendário — Dragon UI
// Painel do dragão (aba Hoje), Covil (aba própria), missões, baú, loja,
// galeria de conquistas, cinemática de evolução e efeitos de recompensa.

// ══════════════════════════════════════════════════════════════
// FX — efeitos visuais de recompensa (DOM puro, sem re-render)
// ══════════════════════════════════════════════════════════════
const FX = {
  center() { return { x: window.innerWidth / 2, y: window.innerHeight * 0.45 }; },
  floatText(text, x, y, color = '#7C5CFF', size = 18, delay = 0) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'fx-float-text';
      el.textContent = text;
      el.style.cssText = `left:${x}px; top:${y}px; color: ${color}; font-size:${size}px;`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1500);
    }, delay);
  },
  burst(x, y, colors = ['#7C5CFF', '#F472B6', '#FBBF24', '#38BDF8'], n = 16, dist = 90) {
    for (let i = 0; i < n; i++) {
      const el = document.createElement('div');
      el.className = 'fx-spark';
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.4;
      const r = dist * (0.6 + Math.random() * 0.6);
      const c = colors[i % colors.length];
      el.style.cssText = `left:${x}px; top:${y}px; background: ${c}; box-shadow: 0 0 8px ${c}; --dx:${Math.cos(a) * r}px; --dy:${Math.sin(a) * r}px; width:${5 + Math.random() * 6}px; height:${5 + Math.random() * 6}px;`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 800);
    }
    const ring = document.createElement('div');
    ring.className = 'fx-ring'; ring.style.cssText = `left:${x}px; top:${y}px; color: ${colors[0]};`;
    document.body.appendChild(ring); setTimeout(() => ring.remove(), 700);
  },
  emojiBurst(x, y, emoji = '💜', n = 6) {
    for (let i = 0; i < n; i++) {
      FX.floatText(emoji, x + (Math.random() - 0.5) * 70, y + (Math.random() - 0.5) * 30, '#EC4899', 16 + Math.random() * 12, i * 70);
    }
  },
  flash(color = '#FFFFFF') {
    const el = document.createElement('div');
    el.className = 'fx-flash'; el.style.background = color;
    document.body.appendChild(el); setTimeout(() => el.remove(), 750);
  },
  gemsTo(x, y, count) {
    const target = document.getElementById('gem-counter');
    const n = Math.min(10, Math.max(1, Math.round(count / 5)));
    const tr = target ? target.getBoundingClientRect() : { left: window.innerWidth - 80, top: 20, width: 40, height: 20 };
    const tx = tr.left + tr.width / 2, ty = tr.top + tr.height / 2;
    for (let i = 0; i < n; i++) {
      const el = document.createElement('div');
      el.className = 'fx-gem'; el.textContent = '💎';
      const ox = x + (Math.random() - 0.5) * 60, oy = y + (Math.random() - 0.5) * 40;
      el.style.left = ox + 'px'; el.style.top = oy + 'px';
      document.body.appendChild(el);
      setTimeout(() => {
        el.style.transform = `translate(${tx - ox}px, ${ty - oy}px) scale(0.5)`;
        el.style.opacity = '0.3';
      }, 40 + i * 60);
      setTimeout(() => {
        el.remove();
        if (target) { target.classList.remove('fx-bump'); void target.offsetWidth; target.classList.add('fx-bump'); }
      }, 820 + i * 60);
    }
    window.SFX && setTimeout(() => window.SFX.gemRain(Math.min(8, n + 2)), 700);
  },
  reward({ xp = 0, gems = 0 } = {}, x, y) {
    const p = (x == null) ? FX.center() : { x, y };
    if (xp > 0) FX.floatText(`+${xp} XP`, p.x, p.y - 10, '#7C5CFF', 22);
    if (gems > 0) { FX.floatText(`+${gems} 💎`, p.x + 40, p.y + 16, '#0EA5E9', 18, 160); FX.gemsTo(p.x, p.y, gems); }
    FX.burst(p.x, p.y, ['#7C5CFF', '#38BDF8', '#FBBF24', '#F472B6'], 14, 70);
  },
};
window.FX = FX;

const pointOf = (e) => {
  if (e && e.clientX != null && (e.clientX || e.clientY)) return { x: e.clientX, y: e.clientY };
  if (e && e.currentTarget && e.currentTarget.getBoundingClientRect) {
    const r = e.currentTarget.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  return FX.center();
};

// ══════════════════════════════════════════════════════════════
// HABITATS (cenários)
// ══════════════════════════════════════════════════════════════
const HABITATS = {
  bg_biblioteca: { bg: 'linear-gradient(180deg, #2B1B5E 0%, #5B3FD6 58%, #E9A8F5 100%)', motes: '#FDE68A', stars: false },
  bg_floresta:   { bg: 'linear-gradient(180deg, #052E2B 0%, #0F766E 55%, #86EFAC 100%)', motes: '#FDE047', stars: true },
  bg_torre:      { bg: 'linear-gradient(180deg, #070B2A 0%, #1E1B6B 55%, #6366F1 100%)', motes: '#C7D2FE', stars: true },
  bg_tribunal:   { bg: 'linear-gradient(180deg, #0C4A6E 0%, #38BDF8 55%, #FEF3C7 100%)', motes: '#FFFFFF', stars: false },
  bg_galaxia:    { bg: 'radial-gradient(ellipse at 30% 30%, #EC4899 0%, transparent 45%), radial-gradient(ellipse at 75% 60%, #7C3AED 0%, transparent 50%), linear-gradient(180deg, #0F0524, #1E0B4B)', motes: '#F5D0FE', stars: true },
};

function HabitatDecor({ bg }) {
  const common = { position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' };
  if (bg === 'bg_floresta') return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" style={common}>
      <circle cx="320" cy="60" r="26" fill="#FEF9C3" opacity="0.85" />
      <path d="M0 230 Q100 190 200 225 T400 215 L400 300 L0 300 Z" fill="#064E3B" opacity="0.8" />
      {[[30, 240, 60], [80, 250, 44], [340, 245, 58], [385, 250, 40]].map(([x, y, h], i) => (
        <g key={i}><rect x={x - 3} y={y - 8} width="6" height="14" fill="#1C1917" /><path d={`M${x - h / 2.4} ${y - 4} L${x} ${y - h} L${x + h / 2.4} ${y - 4} Z`} fill="#022C22" /></g>
      ))}
      {[[70, 268, '#F472B6'], [330, 272, '#38BDF8'], [120, 280, '#FBBF24']].map(([x, y, c], i) => (
        <g key={i} style={{ filter: `drop-shadow(0 0 6px ${c})` }}>
          <rect x={x - 2} y={y} width="4" height="10" fill="#FEF3C7" /><ellipse cx={x} cy={y} rx="10" ry="6" fill={c} />
          <circle cx={x - 3} cy={y - 2} r="1.5" fill="#FFF" /><circle cx={x + 4} cy={y - 1} r="1.2" fill="#FFF" />
        </g>
      ))}
      <path d="M0 285 L400 285 L400 300 L0 300 Z" fill="#022C22" />
    </svg>
  );
  if (bg === 'bg_torre') return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" style={common}>
      <path d="M318 40 A26 26 0 1 0 344 78 A20 20 0 1 1 318 40 Z" fill="#FEF3C7" style={{ filter: 'drop-shadow(0 0 12px #FEF3C7)' }} />
      <path d="M60 40 L110 60 L160 45 L200 70" fill="none" stroke="#C7D2FE" strokeWidth="0.8" opacity="0.6" />
      {[[60, 40], [110, 60], [160, 45], [200, 70]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2" fill="#FFF" />)}
      <g transform="translate(340 200) rotate(-35)"><rect x="-6" y="-50" width="12" height="60" rx="4" fill="#312E81" /><rect x="-9" y="-58" width="18" height="12" rx="3" fill="#4338CA" /></g>
      <path d="M322 265 L340 205 L358 265 Z" fill="#1E1B4B" />
      <path d="M0 262 L20 262 L20 250 L40 250 L40 262 L360 262 L360 250 L380 250 L380 262 L400 262 L400 300 L0 300 Z" fill="#1E1B4B" />
      <path d="M0 270 L400 270" stroke="#312E81" strokeWidth="2" />
    </svg>
  );
  if (bg === 'bg_tribunal') return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" style={common}>
      {[[60, 70, 50], [300, 50, 60], [200, 90, 40]].map(([x, y, r], i) => (
        <g key={i} fill="#FFFFFF" opacity="0.7"><circle cx={x} cy={y} r={r * 0.5} /><circle cx={x + r * 0.5} cy={y + 6} r={r * 0.4} /><circle cx={x - r * 0.5} cy={y + 8} r={r * 0.35} /></g>
      ))}
      <g transform="translate(200 52)" opacity="0.55" style={{ filter: 'drop-shadow(0 0 8px #FDE68A)' }}>
        <path d="M0 -18 L0 20 M-34 -8 L34 -8" stroke="#B45309" strokeWidth="2.5" />
        <path d="M-34 -8 L-44 10 L-24 10 Z M34 -8 L24 10 L44 10 Z" fill="none" stroke="#B45309" strokeWidth="2" />
        <path d="M-46 10 Q-34 20 -22 10 M22 10 Q34 20 46 10" fill="#FDE68A" stroke="#B45309" strokeWidth="2" />
      </g>
      {[24, 64, 336, 376].map((x, i) => (
        <g key={i}><rect x={x - 11} y="150" width="22" height="120" fill="#F8FAFC" opacity="0.92" />
          {[-6, 0, 6].map(dx => <line key={dx} x1={x + dx} y1="156" x2={x + dx} y2="266" stroke="#CBD5E1" strokeWidth="1.5" />)}
          <rect x={x - 15} y="142" width="30" height="10" fill="#E2E8F0" /><rect x={x - 15} y="266" width="30" height="8" fill="#E2E8F0" /></g>
      ))}
      <path d="M0 274 L400 274 L400 300 L0 300 Z" fill="#E2E8F0" /><path d="M0 274 L400 274" stroke="#CBD5E1" strokeWidth="2" />
    </svg>
  );
  if (bg === 'bg_galaxia') return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" style={common}>
      <g transform="translate(330 70)"><circle r="22" fill="#FFB057" /><circle r="22" fill="url(#none)" /><ellipse rx="38" ry="8" fill="none" stroke="#FDE68A" strokeWidth="3" transform="rotate(-18)" opacity="0.8" /></g>
      <circle cx="70" cy="60" r="10" fill="#38BDF8" opacity="0.9" style={{ filter: 'drop-shadow(0 0 8px #38BDF8)' }} />
      <path d="M0 280 Q200 250 400 280 L400 300 L0 300 Z" fill="#2E1065" opacity="0.8" />
    </svg>
  );
  // Biblioteca Arcana (padrão)
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" style={common}>
      <path d="M160 250 L160 110 Q200 60 240 110 L240 250 Z" fill="#FDE68A" opacity="0.14" />
      <path d="M170 250 L170 115 Q200 76 230 115 L230 250 Z" fill="none" stroke="#FDE68A" strokeWidth="2" opacity="0.3" />
      {[0, 1].map(side => (
        <g key={side} transform={side ? 'translate(400 0) scale(-1 1)' : undefined}>
          <rect x="0" y="110" width="92" height="170" fill="#1E1147" opacity="0.85" />
          {[140, 190, 240].map((y, r) => (
            <g key={r}>
              <rect x="0" y={y} width="92" height="5" fill="#3B2485" />
              {Array.from({ length: 9 }).map((_, i) => {
                const colors = ['#F472B6', '#38BDF8', '#FBBF24', '#34D399', '#A78BFA', '#FB7185'];
                const h = 22 + ((i * 7 + r * 5) % 12);
                return <rect key={i} x={4 + i * 9.6} y={y - h} width="8" height={h} rx="1.2" fill={colors[(i + r * 2) % colors.length]} opacity="0.85" />;
              })}
            </g>
          ))}
        </g>
      ))}
      {[[120, 70], [280, 84], [60, 60]].map(([x, y], i) => (
        <g key={i} className="dg-familiar" style={{ animationDelay: `${i * 0.8}s` }}>
          <rect x={x - 4} y={y} width="8" height="18" rx="2" fill="#FFF7ED" />
          <ellipse cx={x} cy={y - 4} rx="4" ry="7" fill="#FDE047" style={{ filter: 'drop-shadow(0 0 8px #FBBF24)' }} />
        </g>
      ))}
      <path d="M0 270 L400 270 L400 300 L0 300 Z" fill="#2B1B5E" opacity="0.7" />
    </svg>
  );
}

function DragonHabitat({ bg = 'bg_biblioteca', height = 220, children, style, rounded = 18 }) {
  const H = HABITATS[bg] || HABITATS.bg_biblioteca;
  const stars = React.useMemo(() => Array.from({ length: 22 }).map((_, i) => ({
    left: `${(i * 37) % 100}%`, top: `${(i * 23) % 55}%`, delay: `${(i % 7) * 0.4}s`, size: 1.5 + (i % 3),
  })), []);
  const motes = React.useMemo(() => Array.from({ length: 9 }).map((_, i) => ({
    left: `${8 + (i * 11) % 86}%`, bottom: `${(i * 13) % 30}%`, dur: `${5 + (i % 4) * 1.4}s`, delay: `${i * 0.7}s`, size: 3 + (i % 3) * 2,
  })), []);
  return (
    <div className="dg-habitat" style={{ height, background: H.bg, borderRadius: rounded, ...style }}>
      <HabitatDecor bg={bg} />
      {H.stars && <div className="dg-habitat-stars" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {stars.map((s, i) => <span key={i} style={{ left: s.left, top: s.top, animationDelay: s.delay, width: s.size, height: s.size }} />)}
      </div>}
      {motes.map((m, i) => (
        <div key={i} className="dg-mote" style={{ left: m.left, bottom: m.bottom, width: m.size, height: m.size, background: H.motes,
          boxShadow: `0 0 8px ${H.motes}`, animationDuration: m.dur, animationDelay: m.delay }} />
      ))}
      <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
        {children}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// Núcleo compartilhado: humor, falas, carinho, comida
// ══════════════════════════════════════════════════════════════
function useDragonCore(shared, setShared) {
  const DG = window.DG;
  const d = DG.ensure(shared);
  const evo = window.evaluateDragon(shared.xp);
  const v = DG.vitals(shared);
  const baseMood = DG.moodOf(shared, v);
  const [tempMood, setTempMood] = React.useState(null);
  const [hopKey, setHopKey] = React.useState(0);
  const [override, setOverride] = React.useState(null);
  const [lineIdx, setLineIdx] = React.useState(0);
  const timers = React.useRef([]);
  React.useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn, ms) => { timers.current.push(setTimeout(fn, ms)); };

  const mood = tempMood || baseMood;
  const lines = DG.speech(shared, { vitals: v, mood: baseMood });
  const line = override || lines[lineIdx % lines.length];

  const say = (text, ms = 3200) => { setOverride(text); later(() => setOverride(null), ms); };
  const cycle = () => { window.SFX && window.SFX.tick(); setOverride(null); setLineIdx(i => i + 1); };

  const PET_LINES = ['Hehe! 💜', 'Prrrr… 🐉', 'Mais! Mais! ✨', 'Você é o melhor estudante do reino!', 'Isso me dá energia pra estudar! ⚡', 'Cócegas não! 😆'];
  const onPet = (e) => {
    const p = pointOf(e);
    setHopKey(k => k + 1);
    if (evo.stage.id <= 2) {
      window.SFX && window.SFX.pop();
      FX.emojiBurst(p.x, p.y - 20, '✨', 4);
      say(evo.stage.id === 1 ? 'O ovo se mexeu! Acho que ele gostou 🥚💜' : 'Toc toc! Alguém quer sair daí! 🐣');
    } else {
      if (mood === 'sleepy') { say('Zzz… 5 minutinhos… 💤'); window.SFX && window.SFX.pop(); return; }
      window.SFX && window.SFX.purr();
      FX.emojiBurst(p.x, p.y - 20, '💜', 5);
      setTempMood('love'); later(() => setTempMood(null), 1600);
      say(PET_LINES[Math.floor(Math.random() * PET_LINES.length)], 2400);
    }
    setShared(s => window.DG.pet(s));
  };

  const onFeed = (treatId, e) => {
    const res = DG.feed(shared, treatId);
    if (!res.ok) { say(res.reason); window.SFX && window.SFX.sad(); return false; }
    setShared(res.shared);
    const p = pointOf(e);
    window.SFX && window.SFX.munch();
    FX.floatText(`${res.treat.icon} ${res.treat.desc}`, p.x, p.y - 10, '#10B981', 15);
    if (evo.stage.id > 2) { setTempMood('eating'); later(() => { setTempMood('ecstatic'); window.SFX && window.SFX.chirp(); }, 1500); later(() => setTempMood(null), 2800); }
    say(['Nham nham! 😋', 'Delícia arcana! ✨', 'Minha mana subiu! ⚡'][Math.floor(Math.random() * 3)]);
    return true;
  };

  return { d, evo, v, mood, lines, line, cycle, say, onPet, onFeed, hopKey };
}

// ══════════════════════════════════════════════════════════════
// Peças de UI reutilizáveis
// ══════════════════════════════════════════════════════════════
function StatBar({ icon, label, value, from, to, hint }) {
  return (
    <div title={hint}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 3, fontFamily: 'var(--font-num)' }}>
        <span><Glyph e={icon} /> {label}</span><span className="num" style={{ color: to }}>{value}%</span>
      </div>
      <div className="dg-stat-bar">
        <div className="dg-stat-fill" style={{ width: `${value}%`, background: `linear-gradient(90deg, ${from}, ${to})`, boxShadow: `0 0 8px ${to}88` }} />
      </div>
    </div>
  );
}

function ComboChip({ streak }) {
  const DG = window.DG;
  const m = DG.comboMultiplier(streak);
  const next = DG.nextComboStep(streak);
  const tip = next ? `Chegue a ${next[0]} dias de constância para x${next[1]}` : 'Multiplicador máximo!';
  if (m <= 1) return (
    <span className="dg-chip" title={tip} style={{ background: 'rgba(100,116,139,0.1)', color: '#D5DAE0', border: '1px solid rgba(100,116,139,0.25)' }}>
      <Glyph e="🔥" /> x1 · {next ? `x${next[1]} em ${next[0] - (streak || 0)}d` : ''}
    </span>
  );
  return (
    <span className="dg-chip dg-combo" title={tip} style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(249,115,22,0.2))', color: '#EEAE8E', border: '1px solid rgba(249,115,22,0.45)' }}>
      <Glyph e="🔥" /> CHAMA x{m}
    </span>
  );
}

function GemBadge({ gems, big }) {
  return (
    <span className="dg-chip" style={{ background: 'rgba(14,165,233,0.1)', color: '#98CAE0', border: '1px solid rgba(14,165,233,0.3)', fontSize: big ? 13 : 10, padding: big ? '4px 10px' : undefined }}>
      <Glyph e="💎" /> {(gems || 0).toLocaleString('pt-BR')}
    </span>
  );
}

function FeedPicker({ core, onClose }) {
  const DG = window.DG;
  const left = DG.MAX_FEEDS_PER_DAY - core.d.today.feeds;
  return (
    <div className="glass-strong anim-slide-up" style={{ padding: 10, borderRadius: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10, fontWeight: 800, letterSpacing: '0.15em', color: 'var(--text-muted)', fontFamily: 'var(--font-label)' }}>
        <span>PETISCOS · {left} HOJE</span>
        <button onClick={onClose} className="btn-ghost" style={{ padding: '2px 8px', fontSize: 11 }}>✕</button>
      </div>
      {DG.TREATS.map(t => (
        <button key={t.id} className="dg-btn" disabled={left <= 0 || core.d.gems < t.price}
          onClick={(e) => { if (core.onFeed(t.id, e)) onClose(); }}
          style={{ justifyContent: 'space-between', width: '100%' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 20 }}><Glyph e={t.icon} /></span>
            <span style={{ textAlign: 'left' }}><div>{t.name}</div><div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{t.desc}</div></span></span>
          <span style={{ color: '#98CAE0' }}>{t.price} <Glyph e="💎" /></span>
        </button>
      ))}
      <div style={{ fontSize: 10.5, color: 'var(--text-muted)', lineHeight: 1.4 }}>
        Ganhe 💎 estudando, cumprindo missões e abrindo o baú diário.
      </div>
    </div>
  );
}

function SpeechBubble({ text, onClick, tail = 'left' }) {
  return (
    <div key={text} className="dg-bubble-speech" onClick={onClick} title="Clique para outra fala">
      {text}
      <span style={{ position: 'absolute', [tail === 'left' ? 'left' : 'right']: -6, top: 14, width: 12, height: 12, background: 'var(--surface)', transform: 'rotate(45deg)', borderRadius: 2, boxShadow: '-2px 2px 3px rgba(42,31,92,0.06)' }} />
    </div>
  );
}

function EvolutionProgress({ evo, compact }) {
  if (evo.isMax) return (
    <div style={{ fontSize: 11.5, fontWeight: 800, color: '#EEB98D', fontFamily: 'var(--font-num)' }}><Glyph e="👑" /> Forma máxima alcançada — lenda viva!</div>
  );
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: 'var(--text-muted)', marginBottom: 4, fontFamily: 'var(--font-num)', fontWeight: 700 }}>
        <span><Glyph e="🌟" /> evolui para <span style={{ color: '#C0B0E0' }}>{evo.next.name}</span></span>
        <span className="num">faltam {evo.toNext.toLocaleString('pt-BR')} XP</span>
      </div>
      <div className="dg-stat-bar" style={{ height: compact ? 8 : 10 }}>
        <div className="dg-stat-fill" style={{ width: `${evo.progress}%`, background: 'linear-gradient(90deg, #A78BFA, #7C5CFF, #EC4899)', boxShadow: '0 0 10px rgba(124,92,255,0.6)' }} />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// PAINEL DO DRAGÃO — aba Hoje
// ══════════════════════════════════════════════════════════════
function DragonHomeCard({ shared, setShared, onOpenLair }) {
  const core = useDragonCore(shared, setShared);
  const { d, evo, v, mood } = core;
  const [feedOpen, setFeedOpen] = React.useState(false);
  const moodInfo = window.DG.MOOD_LABEL[mood] || window.DG.MOOD_LABEL.happy;
  return (
    <div className="glass dg-home" style={{ padding: 12, display: 'grid', gridTemplateColumns: '176px minmax(0,1fr)', gap: 14, position: 'relative' }}>
      <style>{`@media (max-width: 520px) { .dg-home { grid-template-columns: 1fr !important; } }`}</style>
      <DragonHabitat bg={d.equipped.bg} height={200}>
        <div key={core.hopKey} className={core.hopKey ? 'dg-hop' : ''} style={{ transformOrigin: 'center bottom', marginBottom: -4 }}>
          <window.DragonSprite stage={evo.stage.id} mood={mood} equipped={d.equipped} size={184} track onClick={core.onPet} />
        </div>
        <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 3 }}><GemBadge gems={d.gems} /></div>
      </DragonHabitat>

      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span className="font-display" style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{d.name}</span>
          <span className="dg-chip" style={{ background: 'rgba(124,92,255,0.12)', color: '#BBABE0', border: '1px solid rgba(124,92,255,0.3)' }}>FASE {evo.stage.id}/8</span>
          <span className="dg-chip" style={{ background: `${moodInfo.color}18`, color: moodInfo.color, border: `1px solid ${moodInfo.color}44` }}><Glyph e={moodInfo.icon} /> {moodInfo.label}</span>
          <ComboChip streak={shared.streak} />
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginTop: -4 }}>{evo.stage.name}</div>
        <SpeechBubble text={core.line} onClick={core.cycle} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 8 }}>
          <StatBar icon="⚡" label="Mana" value={v.mana} from="#67E8F9" to="#0EA5E9" hint="Sobe com as horas estudadas hoje (vs. sua meta diária)" />
          <StatBar icon="🧠" label="Saber" value={v.wisdom} from="#C4B5FD" to="#7C3AED" hint="Sobe com questões, acertos, revisões e checks no edital" />
          <StatBar icon="💜" label="Afeto" value={v.affection} from="#FBCFE8" to="#EC4899" hint="Sobe com constância, carinhos e missões resgatadas" />
        </div>
        <EvolutionProgress evo={evo} compact />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
          <button className="dg-btn" onClick={() => { window.SFX && window.SFX.pop(); setFeedOpen(o => !o); }}><Glyph e="🍪" /> Alimentar</button>
          <button className="dg-btn dg-btn-primary" onClick={() => { window.SFX && window.SFX.whoosh(); onOpenLair && onOpenLair(); }}><Glyph e="🏰" /> Covil do dragão</button>
        </div>
        {feedOpen && <div style={{ position: 'absolute', right: 12, bottom: 56, zIndex: 20, width: 280 }}><FeedPicker core={core} onClose={() => setFeedOpen(false)} /></div>}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// BAÚ
// ══════════════════════════════════════════════════════════════
const RARITY = {
  comum:    { label: 'COMUM',    c1: '#A78BFA', c2: '#6D28D9', glow: '#C4B5FD' },
  raro:     { label: 'RARO',     c1: '#67E8F9', c2: '#0284C7', glow: '#7DD3FC' },
  lendario: { label: 'LENDÁRIO', c1: '#FDE68A', c2: '#D97706', glow: '#FCD34D' },
};

function ChestSVG({ size = 60, open = false, rarity = 'comum', glow = false }) {
  const r = RARITY[rarity] || RARITY.comum;
  const uid = React.useId ? React.useId().replace(/[^a-zA-Z0-9]/g, '') : 'c';
  return (
    <svg viewBox="0 0 120 110" width={size} height={size * 110 / 120} style={{ overflow: 'visible', display: 'block' }}>
      <defs>
        <linearGradient id={`ch-${uid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={r.c1} /><stop offset="100%" stopColor={r.c2} /></linearGradient>
        <radialGradient id={`chl-${uid}`} cx="0.5" cy="1" r="0.9"><stop offset="0%" stopColor="#FFFFFF" /><stop offset="40%" stopColor={r.glow} stopOpacity="0.8" /><stop offset="100%" stopColor={r.glow} stopOpacity="0" /></radialGradient>
      </defs>
      {(open || glow) && <ellipse cx="60" cy={open ? 30 : 60} rx={open ? 70 : 60} ry={open ? 70 : 50} fill={`url(#chl-${uid})`} opacity={open ? 1 : 0.5} />}
      <ellipse cx="60" cy="104" rx="46" ry="5" fill="rgba(0,0,0,0.18)" />
      <rect x="14" y="50" width="92" height="52" rx="8" fill={`url(#ch-${uid})`} stroke="#3B0764" strokeWidth="2.5" />
      <rect x="14" y="64" width="92" height="8" fill="#FBBF24" stroke="#92400E" strokeWidth="1.5" />
      <rect x="28" y="50" width="8" height="52" fill="#FBBF24" stroke="#92400E" strokeWidth="1.5" />
      <rect x="84" y="50" width="8" height="52" fill="#FBBF24" stroke="#92400E" strokeWidth="1.5" />
      <g style={{ transformOrigin: '60px 52px', transform: open ? 'rotate(-28deg) translate(-6px,-18px)' : 'none', transition: 'transform 500ms cubic-bezier(0.2,1.6,0.4,1)' }}>
        <path d="M14 52 L14 38 Q14 16 60 16 Q106 16 106 38 L106 52 Z" fill={`url(#ch-${uid})`} stroke="#3B0764" strokeWidth="2.5" />
        <path d="M28 52 L28 22 M92 52 L92 22" stroke="#FBBF24" strokeWidth="8" />
        <path d="M28 52 L28 22 M92 52 L92 22" stroke="#92400E" strokeWidth="1" opacity="0.4" />
        <ellipse cx="46" cy="28" rx="16" ry="5" fill="#FFF" opacity="0.35" />
      </g>
      <rect x="50" y="56" width="20" height="20" rx="4" fill="#FDE68A" stroke="#92400E" strokeWidth="2" />
      <circle cx="60" cy="64" r="3" fill="#92400E" /><rect x="58.5" y="64" width="3" height="7" fill="#92400E" />
    </svg>
  );
}

function ChestModal({ reward, onClose }) {
  const [phase, setPhase] = React.useState('shake');
  const r = RARITY[reward.rarity] || RARITY.comum;
  React.useEffect(() => {
    window.SFX && window.SFX.whoosh();
    const t = setTimeout(() => {
      setPhase('open');
      window.SFX && window.SFX.chest(reward.rarity !== 'comum');
      FX.flash(reward.rarity === 'lendario' ? '#FEF3C7' : '#FFFFFF');
      const c = FX.center();
      FX.burst(c.x, c.y, [r.c1, r.c2, '#FFFFFF', '#FBBF24'], 26, 160);
      window.spawnConfetti && window.spawnConfetti({ count: reward.rarity === 'comum' ? 50 : 120, colors: [r.c1, r.c2, '#FBBF24', '#FFFFFF'], spread: 360, velocity: 8, shapes: ['star', 'circle', 'square'] });
      setTimeout(() => FX.gemsTo(c.x, c.y, reward.gems), 500);
    }, 1100);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="cel-overlay" onClick={phase === 'open' ? onClose : undefined}>
      {phase === 'open' && <div className="cel-rays" />}
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ fontSize: 11, letterSpacing: '0.4em', color: r.c1, fontWeight: 800, fontFamily: 'var(--font-label)', marginBottom: 16, textShadow: `0 0 14px ${r.glow}` }}>
          {phase === 'open' ? `✦ BAÚ ${r.label} ✦` : 'ABRINDO O BAÚ DO DIA…'}
        </div>
        <div className={phase === 'shake' ? 'dg-chest shake' : 'cel-pop'} style={{ display: 'inline-block' }}>
          <ChestSVG size={180} open={phase === 'open'} rarity={reward.rarity} glow />
        </div>
        {phase === 'open' && (
          <div className="cel-rise" style={{ marginTop: 18 }}>
            <div className="font-display" style={{ fontSize: 40, fontWeight: 800, color: '#FFF', textShadow: `0 0 24px ${r.glow}` }}>+{reward.gems} <Glyph e="💎" /></div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#E9D5FF', marginTop: 4 }}>+{reward.xp} XP</div>
            <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.75)', marginTop: 10 }}>
              <Glyph e="🗝️" /> Sequência de baús: <b>{reward.streak} dia{reward.streak > 1 ? 's' : ''}</b> — volte amanhã para um baú ainda melhor!
            </div>
            <button className="dg-btn dg-btn-gold" style={{ marginTop: 18, padding: '12px 28px', fontSize: 14 }} onClick={onClose}>Pegar tesouro <Glyph e="✨" /></button>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MISSÕES DO DIA
// ══════════════════════════════════════════════════════════════
function hoursUntilReset() {
  const now = new Date();
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  return Math.max(1, Math.ceil((next - now.getTime()) / 3600000));
}

function DailyQuestsCard({ shared, setShared, compact }) {
  const DG = window.DG;
  const quests = DG.getDailyQuests(shared);
  const chest = DG.chestState(shared);
  const d = DG.ensure(shared);
  const [chestReward, setChestReward] = React.useState(null);
  const doneCount = quests.filter(q => q.claimed).length;
  const perfectReady = DG.canClaimPerfect(shared);

  const claim = (q, e) => {
    const res = DG.claimQuest(shared, q.id);
    if (!res.reward) return;
    setShared(res.shared);
    const p = pointOf(e);
    window.SFX && window.SFX.quest();
    FX.reward(res.reward, p.x, p.y);
  };
  const claimPerfect = (e) => {
    const res = DG.claimPerfect(shared);
    if (!res.reward) return;
    setShared(res.shared);
    const p = pointOf(e);
    window.SFX && window.SFX.achievement('ouro');
    window.spawnConfetti && window.spawnConfetti({ count: 90, colors: ['#FBBF24', '#7C5CFF', '#F472B6', '#38BDF8'], spread: 300, velocity: 8, shapes: ['star', 'circle'] });
    FX.reward(res.reward, p.x, p.y);
  };
  const open = () => {
    if (chest.state !== 'ready') {
      window.SFX && window.SFX.tick();
      return;
    }
    const res = DG.openChest(shared);
    if (!res.reward) return;
    setShared(res.shared);
    setChestReward(res.reward);
  };

  return (
    <div className="glass" style={{ padding: compact ? '12px 14px' : '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, gap: 8, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 9.5, letterSpacing: '0.22em', color: 'var(--text-muted)', fontWeight: 800, fontFamily: 'var(--font-label)' }}>
            <Glyph e="🗺️" /> MISSÕES DO DIA · {doneCount}/{quests.length}
          </div>
          <div style={{ fontSize: 10.5, color: 'var(--text-dim)', marginTop: 2 }}>renovam em {hoursUntilReset()}h</div>
        </div>
        <GemBadge gems={d.gems} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {quests.map(q => {
          const claimable = q.done && !q.claimed;
          const fmt = q.fmt || ((x) => Math.round(x * 10) / 10);
          return (
            <div key={q.id} className={`dg-quest ${q.claimed ? 'done' : ''} ${claimable ? 'claimable' : ''}`}>
              <div style={{ width: 34, height: 34, borderRadius: 10, display: 'grid', placeItems: 'center', fontSize: 18, flexShrink: 0,
                background: q.claimed ? 'rgba(79,209,165,0.12)' : 'rgba(124,92,255,0.1)' }}><Glyph e={q.claimed ? '✅' : q.icon} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ textDecoration: q.claimed ? 'line-through' : 'none', opacity: q.claimed ? 0.7 : 1 }}>{q.title}</span>
                  {q.hard && <span className="dg-chip" style={{ background: 'rgba(239,68,68,0.1)', color: '#EEA097', border: '1px solid rgba(239,68,68,0.3)', fontSize: 8.5 }}>DIFÍCIL</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
                  <div className="dg-stat-bar" style={{ flex: 1, height: 6 }}>
                    <div className="dg-stat-fill" style={{ width: `${q.pct}%`, background: q.done ? 'linear-gradient(90deg, #34D399, #10B981)' : 'linear-gradient(90deg, #A78BFA, #7C5CFF)' }} />
                  </div>
                  <span className="num" style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, minWidth: 54, textAlign: 'right' }}>
                    {fmt(Math.min(q.progress, q.target))}/{fmt(q.target)}
                  </span>
                </div>
              </div>
              {claimable ? (
                <button className="dg-btn dg-btn-gold" onClick={(e) => claim(q, e)} style={{ padding: '7px 10px', flexShrink: 0 }}><Glyph e="🎁" /> Resgatar</button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0, opacity: q.claimed ? 0.5 : 1 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#C0B0E0', fontFamily: 'var(--font-num)' }}>+{q.xp} XP</span>
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#98CAE0', fontFamily: 'var(--font-num)' }}>+{q.gems} <Glyph e="💎" /></span>
                </div>
              )}
            </div>
          );
        })}

        {/* Dia perfeito */}
        <div className={`dg-quest ${d.today.perfect ? 'done' : ''} ${perfectReady ? 'claimable' : ''}`} style={{ background: d.today.perfect ? undefined : 'linear-gradient(135deg, rgba(251,191,36,0.10), rgba(236,72,153,0.08))' }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, display: 'grid', placeItems: 'center', fontSize: 18, background: 'rgba(251,191,36,0.16)' }}><Glyph e="🌟" /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 800 }}>Dia Perfeito</div>
            <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{d.today.perfect ? 'Conquistado hoje! Lendário 👑' : 'Resgate as 3 missões para ganhar o bônus'}</div>
          </div>
          {perfectReady ? (
            <button className="dg-btn dg-btn-gold" onClick={claimPerfect} style={{ padding: '7px 10px' }}><Glyph e="🌟" /> Bônus</button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, opacity: d.today.perfect ? 0.5 : 1 }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: '#C0B0E0', fontFamily: 'var(--font-num)' }}>+{DG.PERFECT_REWARD.xp} XP</span>
              <span style={{ fontSize: 10, fontWeight: 800, color: '#98CAE0', fontFamily: 'var(--font-num)' }}>+{DG.PERFECT_REWARD.gems} <Glyph e="💎" /></span>
            </div>
          )}
        </div>

        {/* Baú diário */}
        <div className="dg-quest" onClick={open} style={{ cursor: chest.state === 'ready' ? 'pointer' : 'default',
          background: chest.state === 'ready' ? 'linear-gradient(135deg, rgba(124,92,255,0.14), rgba(56,189,248,0.12))' : undefined,
          borderColor: chest.state === 'ready' ? 'rgba(124,92,255,0.45)' : undefined }}>
          <div className={`dg-chest ${chest.state === 'ready' ? 'ready' : ''}`} style={{ width: 44, flexShrink: 0, filter: chest.state === 'locked' ? 'grayscale(0.8) opacity(0.6)' : undefined }}>
            <ChestSVG size={44} open={chest.state === 'opened'} rarity={chest.state === 'opened' ? chest.reward.rarity : 'comum'} glow={chest.state === 'ready'} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 800 }}>Baú do Dia {d.chestStreak > 0 && <span style={{ fontSize: 10, color: '#EEB98D' }}>· <Glyph e="🗝️" /> {d.chestStreak}d seguidos</span>}</div>
            <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
              {chest.state === 'locked' && 'Registre qualquer estudo hoje para destrancar 🔒'}
              {chest.state === 'ready' && 'Pronto! Toque para abrir — pode vir um baú lendário ✨'}
              {chest.state === 'opened' && `Aberto: +${chest.reward.gems} 💎 (${RARITY[chest.reward.rarity].label.toLowerCase()}). Volte amanhã!`}
            </div>
          </div>
          {chest.state === 'ready' && <button className="dg-btn dg-btn-primary" style={{ padding: '7px 10px' }}>Abrir</button>}
        </div>
      </div>
      {chestReward && <ChestModal reward={chestReward} onClose={() => setChestReward(null)} />}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MEDALHA DE CONQUISTA
// ══════════════════════════════════════════════════════════════
function AchievementBadge({ ach, unlocked = true, size = 64 }) {
  const t = window.DG.TIERS[ach.tier];
  const legendary = ach.tier === 'lendario';
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {legendary && unlocked && (
        <div className="dg-spin" style={{ position: 'absolute', inset: -5, borderRadius: '50%',
          background: 'conic-gradient(#F472B6, #FBBF24, #34D399, #38BDF8, #A78BFA, #F472B6)', filter: 'blur(1px)' }} />
      )}
      <div className={`dg-badge ${unlocked ? '' : 'locked'}`} style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: `radial-gradient(circle at 35% 28%, #FFFFFF 0%, ${t.c1} 30%, ${t.c2} 100%)`,
        boxShadow: `0 0 0 ${Math.max(2, size / 22)}px ${t.ring}, inset 0 -${size / 12}px ${size / 6}px rgba(0,0,0,0.18), 0 ${size / 10}px ${size / 4}px ${unlocked ? t.glow : 'transparent'}`,
      }}>
        <span style={{ fontSize: size * 0.46, lineHeight: 1, filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.25))' }}><Glyph e={ach.icon} /></span>
        {unlocked && <div className="dg-badge-shine" style={{ borderRadius: '50%' }} />}
      </div>
      {!unlocked && <span style={{ position: 'absolute', right: -2, bottom: -2, fontSize: size * 0.26 }}><Glyph e="🔒" /></span>}
    </div>
  );
}

function AchievementGallery({ shared, objState, discState, onShare }) {
  const DG = window.DG;
  const [cat, setCat] = React.useState('all');
  const list = DG.achievementProgress(DG.achievementSnapshot(shared, objState, discState));
  const have = DG.ensure(shared).achievements;
  const unlockedCount = list.filter(a => have[a.id]).length;
  const shown = list.filter(a => cat === 'all' || a.cat === cat)
    .sort((a, b) => (have[b.id] ? 1 : 0) - (have[a.id] ? 1 : 0) || b.pct - a.pct);
  return (
    <div className="glass" style={{ padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 9.5, letterSpacing: '0.22em', color: 'var(--text-muted)', fontWeight: 800, fontFamily: 'var(--font-label)' }}><Glyph e="🏆" /> SALA DE TROFÉUS</div>
          <div className="font-display" style={{ fontSize: 20, fontWeight: 800, marginTop: 2 }}>{unlockedCount} <span style={{ color: 'var(--text-dim)', fontSize: 15 }}>/ {list.length} conquistas</span></div>
        </div>
        <div style={{ flex: '1 1 180px', maxWidth: 320 }}>
          <div className="dg-stat-bar" style={{ height: 10 }}>
            <div className="dg-stat-fill" style={{ width: `${(unlockedCount / list.length) * 100}%`, background: 'linear-gradient(90deg, #FBBF24, #F472B6, #7C5CFF)' }} />
          </div>
        </div>
      </div>
      <div className="dg-tabs" style={{ marginBottom: 14 }}>
        <button className={`dg-tab ${cat === 'all' ? 'active' : ''}`} onClick={() => setCat('all')}>Todas</button>
        {DG.CATS.map(c => <button key={c.id} className={`dg-tab ${cat === c.id ? 'active' : ''}`} onClick={() => { window.SFX && window.SFX.tick(); setCat(c.id); }}><Glyph e={c.icon} /> {c.label}</button>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
        {shown.map(a => {
          const unlocked = !!have[a.id];
          const t = DG.TIERS[a.tier];
          return (
            <div key={a.id} onClick={() => unlocked && onShare && onShare({ kind: 'achievement', achId: a.id })}
              title={unlocked ? 'Clique para compartilhar' : a.desc}
              style={{ padding: 12, borderRadius: 14, background: unlocked ? `linear-gradient(160deg, ${t.c1}33, rgba(22,19,40,0.75))` : 'rgba(22,19,40,0.55)',
                border: `1px solid ${unlocked ? t.c2 + '55' : 'rgba(243,235,221,0.06)'}`, cursor: unlocked ? 'pointer' : 'default',
                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 6 }}>
              <AchievementBadge ach={a} unlocked={unlocked} size={58} />
              <div style={{ fontSize: 8.5, fontWeight: 900, letterSpacing: '0.18em', color: t.ring, fontFamily: 'var(--font-label)' }}>{t.label}</div>
              <div className="font-display" style={{ fontSize: 13, fontWeight: 800, lineHeight: 1.2 }}>{a.name}</div>
              <div style={{ fontSize: 10.5, color: 'var(--text-muted)', lineHeight: 1.35 }}>{a.desc}</div>
              {unlocked ? (
                <div style={{ fontSize: 10, color: '#C0B0E0', fontWeight: 800 }}><Glyph e="📸" /> Compartilhar</div>
              ) : (
                <div style={{ width: '100%' }}>
                  <div className="dg-stat-bar" style={{ height: 5 }}><div className="dg-stat-fill" style={{ width: `${a.pct}%`, background: `linear-gradient(90deg, ${t.c1}, ${t.c2})` }} /></div>
                  <div className="num" style={{ fontSize: 9.5, color: 'var(--text-dim)', marginTop: 3, fontWeight: 700 }}>
                    {Math.floor(Math.min(a.cur, a.target)).toLocaleString('pt-BR')}/{a.target.toLocaleString('pt-BR')} · +{t.gems} <Glyph e="💎" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// CELEBRAÇÃO DE CONQUISTA
// ══════════════════════════════════════════════════════════════
function AchievementCelebration({ ids, onDone, onShare }) {
  const DG = window.DG;
  const achs = ids.map(DG.achById).filter(Boolean);
  const summary = achs.length > 3;
  const [i, setI] = React.useState(0);
  const a = achs[Math.min(i, achs.length - 1)];
  React.useEffect(() => {
    if (!a) return;
    const tier = summary ? 'ouro' : a.tier;
    window.SFX && window.SFX.achievement(tier);
    const t = DG.TIERS[tier];
    window.spawnConfetti && window.spawnConfetti({ count: tier === 'lendario' || summary ? 150 : 80, colors: [t.c1, t.c2, '#FFFFFF', '#7C5CFF'], spread: 360, velocity: 9, shapes: ['star', 'circle', 'square'] });
  }, [i]);
  if (!a) return null;
  const totalGems = achs.reduce((s, x) => s + DG.TIERS[x.tier].gems, 0);

  if (summary) return (
    <div className="cel-overlay">
      <div className="cel-rays" />
      <div style={{ textAlign: 'center', maxWidth: 560, position: 'relative', zIndex: 2 }}>
        <div className="cel-rise" style={{ fontSize: 11, letterSpacing: '0.4em', color: '#FDE68A', fontWeight: 800, fontFamily: 'var(--font-label)' }}>✦ SALA DE TROFÉUS ✦</div>
        <div className="font-display cel-rise" style={{ fontSize: 30, fontWeight: 800, color: '#FFF', margin: '8px 0 18px' }}>{achs.length} conquistas desbloqueadas!</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center', marginBottom: 18 }}>
          {achs.map((x, k) => (
            <div key={x.id} className="cel-pop" style={{ animationDelay: `${k * 70}ms`, width: 92, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <AchievementBadge ach={x} size={60} />
              <div style={{ fontSize: 10.5, color: '#FFF', fontWeight: 700, lineHeight: 1.2 }}>{x.name}</div>
            </div>
          ))}
        </div>
        <div className="font-display" style={{ fontSize: 22, color: '#7DD3FC', fontWeight: 800, marginBottom: 16 }}>+{totalGems} <Glyph e="💎" /></div>
        <button className="dg-btn dg-btn-gold" style={{ padding: '12px 28px', fontSize: 14 }} onClick={onDone}>Incrível! <Glyph e="✨" /></button>
      </div>
    </div>
  );

  const t = DG.TIERS[a.tier];
  const last = i >= achs.length - 1;
  return (
    <div className="cel-overlay">
      <div className="cel-rays" />
      <div key={a.id} style={{ textAlign: 'center', maxWidth: 440, position: 'relative', zIndex: 2 }}>
        <div className="cel-rise" style={{ fontSize: 11, letterSpacing: '0.4em', color: t.c1, fontWeight: 800, fontFamily: 'var(--font-label)', marginBottom: 20, textShadow: `0 0 14px ${t.glow}` }}>
          ✦ CONQUISTA DESBLOQUEADA ✦
        </div>
        <div className="cel-pop" style={{ display: 'inline-block' }}><div className="cel-float"><AchievementBadge ach={a} size={150} /></div></div>
        <div className="cel-rise" style={{ animationDelay: '200ms' }}>
          <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.3em', color: t.c1, marginTop: 20, fontFamily: 'var(--font-label)' }}>{t.label}</div>
          <div className="font-display" style={{ fontSize: 32, fontWeight: 800, color: '#FFF', margin: '4px 0 6px', textShadow: `0 0 24px ${t.glow}` }}>{a.name}</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>{a.desc}</div>
          <div className="font-display" style={{ fontSize: 20, color: '#7DD3FC', fontWeight: 800, margin: '14px 0 20px' }}>+{t.gems} <Glyph e="💎" /></div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="dg-btn" style={{ padding: '12px 20px', fontSize: 13 }} onClick={() => onShare && onShare({ kind: 'achievement', achId: a.id })}><Glyph e="📸" /> Compartilhar</button>
            <button className="dg-btn dg-btn-gold" style={{ padding: '12px 24px', fontSize: 13 }} onClick={() => last ? onDone() : setI(i + 1)}>
              {last ? 'Incrível! ✨' : `Próxima (${i + 1}/${achs.length}) →`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// CINEMÁTICA DE EVOLUÇÃO
// ══════════════════════════════════════════════════════════════
function EvolutionCinematic({ from, to, equipped, onClose, onShare }) {
  const [phase, setPhase] = React.useState('charge');
  const info = window.DRAGON_STAGES[to - 1];
  const unlocks = window.DG.STAGE_UNLOCKS[to] || [];
  const reveal = React.useCallback(() => {
    setPhase(p => {
      if (p !== 'charge') return p;
      window.SFX && window.SFX.evolveReveal();
      FX.flash('#FFFFFF');
      window.spawnConfetti && window.spawnConfetti({ count: 220, colors: [info.pal.gem, info.pal.glow, '#FFFFFF', '#FBBF24', '#A78BFA'], spread: 360, velocity: 10, shapes: ['star', 'star', 'circle'] });
      return 'reveal';
    });
  }, []);
  React.useEffect(() => {
    window.SFX && window.SFX.evolveCharge();
    const t = setTimeout(reveal, 2200);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="cel-overlay" onClick={phase === 'charge' ? reveal : undefined}
      style={{ background: `radial-gradient(ellipse at center, ${info.pal.accent}dd, rgba(8,6,24,0.96))` }}>
      {phase === 'reveal' && <div className="cel-rays" />}
      <div style={{ textAlign: 'center', maxWidth: 520, position: 'relative', zIndex: 2 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.45em', color: info.pal.glow, fontWeight: 800, fontFamily: 'var(--font-label)', marginBottom: 8, textShadow: `0 0 16px ${info.pal.glow}` }}>
          {phase === 'charge' ? 'ALGO ESTÁ ACONTECENDO…' : '✦ EVOLUÇÃO ✦'}
        </div>
        <div style={{ width: 280, height: 280, margin: '0 auto', display: 'grid', placeItems: 'center' }}>
          {phase === 'charge' ? (
            <div className="cel-charge"><window.DragonSprite stage={from} mood="excited" equipped={equipped} size={250} /></div>
          ) : (
            <div className="cel-pop"><div className="cel-float"><window.DragonSprite stage={to} mood="ecstatic" equipped={equipped} size={270} /></div></div>
          )}
        </div>
        {phase === 'reveal' && (
          <div className="cel-rise">
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-label)', letterSpacing: '0.2em', fontWeight: 700 }}>
              FASE {from} <span style={{ color: info.pal.glow, padding: '0 8px' }}>→</span> FASE {to}
            </div>
            <div className="font-display" style={{ fontSize: 36, fontWeight: 800, color: '#FFF', margin: '4px 0 8px', textShadow: `0 0 26px ${info.pal.glow}` }}>{info.name}</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.55, maxWidth: 400, margin: '0 auto' }}>{info.desc}</div>
            {unlocks.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', margin: '14px 0 4px' }}>
                {unlocks.map(u => <span key={u} className="dg-chip" style={{ background: 'rgba(255,255,255,0.12)', color: '#FFFFFF', border: `1px solid ${info.pal.glow}66`, fontSize: 10.5, padding: '4px 10px' }}><Glyph e="✨" /> {u}</span>)}
              </div>
            )}
            <div className="font-display" style={{ fontSize: 20, color: '#7DD3FC', fontWeight: 800, margin: '12px 0 18px' }}>+{window.DG.EVOLUTION_GEMS * Math.max(1, to - from)} <Glyph e="💎" /></div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="dg-btn" style={{ padding: '12px 20px', fontSize: 13 }} onClick={() => onShare && onShare({ kind: 'evolution', stage: to })}><Glyph e="📸" /> Compartilhar</button>
              <button className="dg-btn dg-btn-gold" style={{ padding: '12px 26px', fontSize: 13 }} onClick={onClose}>Continuar jornada <Glyph e="🐉" /></button>
            </div>
          </div>
        )}
        {phase === 'charge' && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 12 }}>toque para revelar</div>}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// COVIL DO DRAGÃO — aba dedicada
// ══════════════════════════════════════════════════════════════
function EvolutionPath({ xp, equipped }) {
  const evo = window.evaluateDragon(xp);
  return (
    <div className="glass" style={{ padding: '18px 20px' }}>
      <div style={{ fontSize: 9.5, letterSpacing: '0.22em', color: 'var(--text-muted)', fontWeight: 800, fontFamily: 'var(--font-label)', marginBottom: 12 }}><Glyph e="🌟" /> JORNADA DE EVOLUÇÃO</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(92px, 1fr))', gap: 8 }}>
        {window.DRAGON_STAGES.map(s => {
          const unlocked = evo.stage.id >= s.id;
          const current = evo.stage.id === s.id;
          const isNext = evo.stage.id + 1 === s.id;
          return (
            <div key={s.id} style={{ padding: '10px 6px', borderRadius: 14, textAlign: 'center', position: 'relative',
              background: current ? 'linear-gradient(160deg, rgba(124,92,255,0.18), rgba(236,72,153,0.1))' : unlocked ? 'rgba(22,19,40,0.7)' : 'rgba(243,235,221,0.035)',
              border: current ? '1.5px solid rgba(124,92,255,0.55)' : '1px solid rgba(243,235,221,0.06)',
              boxShadow: current ? '0 0 0 3px rgba(124,92,255,0.12), 0 8px 24px rgba(124,92,255,0.18)' : undefined }}>
              <div style={{ display: 'grid', placeItems: 'center', height: 72 }}>
                <div style={{ filter: unlocked ? undefined : 'brightness(0) opacity(0.22)' }}>
                  <window.DragonSprite stage={s.id} mood="happy" equipped={unlocked ? { ...equipped, bg: undefined, aura: undefined } : {}} size={70} animate={current} showFamiliars={false} />
                </div>
                {!unlocked && <div style={{ position: 'absolute', top: 30, left: 0, right: 0, fontSize: 20, fontWeight: 800, color: 'rgba(243,235,221,0.35)' }}>?</div>}
              </div>
              <div style={{ fontSize: 8.5, fontWeight: 900, color: current ? '#6D4FE0' : 'var(--text-dim)', letterSpacing: '0.14em', fontFamily: 'var(--font-label)', marginTop: 4 }}>
                {current ? 'VOCÊ ESTÁ AQUI' : `FASE ${s.id}`}
              </div>
              <div style={{ fontSize: 11, fontWeight: 800, color: unlocked || isNext ? 'var(--text-primary)' : 'var(--text-dim)', lineHeight: 1.2, marginTop: 2 }}>
                {unlocked || isNext ? s.name : '???'}
              </div>
              <div className="num" style={{ fontSize: 9.5, color: 'var(--text-dim)', fontWeight: 700 }}>{s.minXp.toLocaleString('pt-BR')} XP</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ShopPanel({ shared, setShared, stage, tryOn, setTryOn }) {
  const DG = window.DG;
  const d = DG.ensure(shared);
  const [tab, setTab] = React.useState('hat');
  const [confirm, setConfirm] = React.useState(null);
  const [msg, setMsg] = React.useState(null);
  const items = DG.ITEMS.filter(i => i.slot === tab);

  const flash = (text) => { setMsg(text); setTimeout(() => setMsg(null), 2600); };
  const click = (it, e) => {
    const owned = d.owned.includes(it.id);
    if (owned) {
      setShared(s => DG.toggleEquip(s, it.id));
      window.SFX && window.SFX.equip();
      const p = pointOf(e); FX.burst(p.x, p.y, ['#A78BFA', '#FFFFFF', '#F472B6'], 10, 50);
      return;
    }
    if (stage < it.minStage) { window.SFX && window.SFX.sad(); flash(`🔒 ${it.name} libera na fase ${it.minStage} do dragão.`); return; }
    if (d.gems < it.price) { window.SFX && window.SFX.sad(); flash(`Faltam ${it.price - d.gems} 💎 — estude, cumpra missões e abra o baú!`); return; }
    if (confirm !== it.id) { window.SFX && window.SFX.tick(); setConfirm(it.id); return; }
    const res = DG.buy(shared, it.id, stage);
    if (!res.ok) { flash(res.reason); return; }
    setShared(res.shared); setConfirm(null); setTryOn(null);
    window.SFX && window.SFX.purchase();
    const p = pointOf(e);
    FX.burst(p.x, p.y, ['#FBBF24', '#7C5CFF', '#38BDF8', '#F472B6'], 22, 110);
    FX.floatText(`${it.icon} ${it.name}!`, p.x, p.y - 20, '#6D4FE0', 16);
    flash(`✨ ${it.name} é seu! Já está equipado.`);
  };

  return (
    <div className="glass" style={{ padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 9.5, letterSpacing: '0.22em', color: 'var(--text-muted)', fontWeight: 800, fontFamily: 'var(--font-label)' }}><Glyph e="🛍️" /> LOJA & GUARDA-ROUPA</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>Passe o mouse para provar · clique duas vezes para comprar</div>
        </div>
        <GemBadge gems={d.gems} big />
      </div>
      <div className="dg-tabs" style={{ marginBottom: 12 }}>
        {DG.SLOTS.map(s => <button key={s.id} className={`dg-tab ${tab === s.id ? 'active' : ''}`} onClick={() => { window.SFX && window.SFX.tick(); setTab(s.id); setConfirm(null); }}>{s.label}</button>)}
      </div>
      {msg && <div className="anim-slide-up" style={{ fontSize: 12, fontWeight: 700, color: '#BBABE0', background: 'rgba(124,92,255,0.08)', padding: '8px 12px', borderRadius: 10, marginBottom: 10 }}>{msg}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(118px, 1fr))', gap: 10 }}>
        {items.map(it => {
          const owned = d.owned.includes(it.id);
          const equipped = d.equipped[it.slot] === it.id;
          const locked = stage < it.minStage;
          const previewEq = { ...d.equipped, [it.slot]: it.id, bg: undefined };
          return (
            <div key={it.id} className={`shop-item ${equipped ? 'equipped' : ''} ${locked ? 'locked' : ''}`}
              onMouseEnter={() => setTryOn(it)} onMouseLeave={() => setTryOn(null)} onClick={(e) => click(it, e)}>
              <div style={{ height: 78, width: '100%', display: 'grid', placeItems: 'center', borderRadius: 10, overflow: 'hidden' }}>
                {it.slot === 'bg' ? (
                  <DragonHabitat bg={it.id} height={78} rounded={10} style={{ width: '100%' }}><span style={{ fontSize: 26, marginBottom: 14 }}><Glyph e={it.icon} /></span></DragonHabitat>
                ) : stage >= 3 ? (
                  <window.DragonSprite stage={stage} mood="happy" equipped={previewEq} size={80} animate={false} showFamiliars={false} />
                ) : (
                  <span style={{ fontSize: 34 }}><Glyph e={it.icon} /></span>
                )}
              </div>
              <div style={{ fontSize: 11.5, fontWeight: 800, lineHeight: 1.2 }}><Glyph e={it.icon} /> {it.name}</div>
              <div style={{ fontSize: 10.5, fontWeight: 800, fontFamily: 'var(--font-num)',
                color: equipped ? '#6D4FE0' : owned ? '#059669' : locked ? 'var(--text-dim)' : '#0369A1' }}>
                {equipped ? (it.slot === 'bg' ? '✓ EM USO' : '✓ EQUIPADO') : owned ? 'USAR' : locked ? `🔒 FASE ${it.minStage}` : confirm === it.id ? `CONFIRMAR ${it.price} 💎?` : it.price === 0 ? 'GRÁTIS' : `${it.price} 💎`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DragonLairTab({ shared, setShared, objState, discState, onShare }) {
  const DG = window.DG;
  const core = useDragonCore(shared, setShared);
  const { d, evo, v, mood } = core;
  const [tryOn, setTryOn] = React.useState(null);
  const [feedOpen, setFeedOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [nameDraft, setNameDraft] = React.useState(d.name);
  const moodInfo = DG.MOOD_LABEL[mood] || DG.MOOD_LABEL.happy;
  const eq = tryOn ? { ...d.equipped, [tryOn.slot]: tryOn.id } : d.equipped;
  const daysTogether = Math.max(1, Math.round((Date.now() - new Date(d.bornAt).getTime()) / 86400000));
  const saveName = () => { setShared(s => DG.rename(s, nameDraft)); setEditing(false); window.SFX && window.SFX.chirp(); };

  const statTiles = [
    { label: 'Cristais ganhos', value: (d.gemsTotal || 0).toLocaleString('pt-BR'), icon: '💎', color: '#0EA5E9' },
    { label: 'Missões', value: d.stats.quests || 0, icon: '🗺️', color: '#C0B0E0' },
    { label: 'Dias perfeitos', value: d.stats.perfectDays || 0, icon: '🌟', color: '#FFB057' },
    { label: 'Baús abertos', value: d.stats.chests || 0, icon: '🎁', color: '#EC4899' },
    { label: 'Carinhos', value: d.stats.pets || 0, icon: '💜', color: '#A855F7' },
    { label: 'Dias juntos', value: daysTogether, icon: '📅', color: '#10B981' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <style>{`@media (max-width: 900px) { .dg-lair-hero { grid-template-columns: 1fr !important; } .dg-lair-row { grid-template-columns: 1fr !important; } }`}</style>
      <div className="glass dg-lair-hero anim-slide-up" style={{ padding: 12, display: 'grid', gridTemplateColumns: 'minmax(0,1.15fr) minmax(0,1fr)', gap: 16, position: 'relative' }}>
        <DragonHabitat bg={tryOn && tryOn.slot === 'bg' ? tryOn.id : d.equipped.bg} height={380}>
          <div key={core.hopKey} className={core.hopKey ? 'dg-hop' : ''} style={{ transformOrigin: 'center bottom', marginBottom: -6 }}>
            <window.DragonSprite stage={evo.stage.id} mood={mood} equipped={eq} size={320} track onClick={core.onPet} />
          </div>
          <div style={{ position: 'absolute', top: 14, left: 14, right: 14, zIndex: 3, display: 'flex', justifyContent: 'center' }}>
            <div style={{ maxWidth: 360 }}><SpeechBubble text={core.line} onClick={core.cycle} /></div>
          </div>
          {tryOn && <div style={{ position: 'absolute', bottom: 12, left: 12, zIndex: 3 }} className="dg-chip"><span style={{ background: 'var(--surface)', padding: '4px 10px', borderRadius: 99, color: '#BBABE0' }}><Glyph e="👀" /> Provando: {tryOn.name}</span></div>}
        </DragonHabitat>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '6px 6px 6px 0', minWidth: 0 }}>
          <div style={{ fontSize: 9.5, letterSpacing: '0.22em', color: 'var(--text-muted)', fontWeight: 800, fontFamily: 'var(--font-label)' }}><Glyph e="🏰" /> COVIL DO DRAGÃO</div>
          {editing ? (
            <div style={{ display: 'flex', gap: 6 }}>
              <input autoFocus value={nameDraft} maxLength={18} onChange={e => setNameDraft(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditing(false); }}
                style={{ flex: 1, fontSize: 20, fontWeight: 800, padding: '6px 10px', borderRadius: 10, border: '1.5px solid #7C5CFF', fontFamily: 'var(--font-display)' }} />
              <button className="dg-btn dg-btn-primary" onClick={saveName}>Salvar</button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="font-display" style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em' }}>{d.name}</span>
              <button className="btn-ghost" style={{ padding: '3px 8px', fontSize: 12 }} title="Renomear" onClick={() => { setNameDraft(d.name); setEditing(true); }}><Glyph e="✏️" /></button>
            </div>
          )}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span className="dg-chip" style={{ background: 'rgba(124,92,255,0.12)', color: '#BBABE0', border: '1px solid rgba(124,92,255,0.3)' }}>FASE {evo.stage.id}/8 · {evo.stage.name.toUpperCase()}</span>
            <span className="dg-chip" style={{ background: `${moodInfo.color}18`, color: moodInfo.color, border: `1px solid ${moodInfo.color}44` }}><Glyph e={moodInfo.icon} /> {moodInfo.label}</span>
            <ComboChip streak={shared.streak} />
            <GemBadge gems={d.gems} />
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.5, fontStyle: 'italic' }}>{evo.stage.desc}</div>
          <StatBar icon="⚡" label="Mana — horas estudadas hoje" value={v.mana} from="#67E8F9" to="#0EA5E9" />
          <StatBar icon="🧠" label="Saber — questões, acertos e edital" value={v.wisdom} from="#C4B5FD" to="#7C3AED" />
          <StatBar icon="💜" label="Afeto — constância, carinho e missões" value={v.affection} from="#FBCFE8" to="#EC4899" />
          <EvolutionProgress evo={evo} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', position: 'relative' }}>
            <button className="dg-btn" onClick={() => { window.SFX && window.SFX.pop(); setFeedOpen(o => !o); }}><Glyph e="🍪" /> Alimentar</button>
            <button className="dg-btn dg-btn-primary" onClick={() => onShare && onShare({ kind: 'profile' })}><Glyph e="📸" /> Card do dragão</button>
            <button className="dg-btn" onClick={() => onShare && onShare({ kind: 'streak' })}><Glyph e="🔥" /> Card de constância</button>
            {feedOpen && <div style={{ position: 'absolute', left: 0, bottom: 44, zIndex: 20, width: 290 }}><FeedPicker core={core} onClose={() => setFeedOpen(false)} /></div>}
          </div>
          <div style={{ fontSize: 10.5, color: 'var(--text-dim)', lineHeight: 1.45 }}>
            <Glyph e="💡" /> Toque no dragão para fazer carinho. Ele sente quando você estuda: horas enchem a Mana, questões enchem o Saber e a constância enche o Afeto.
          </div>
        </div>
      </div>

      <EvolutionPath xp={shared.xp} equipped={d.equipped} />

      <div className="dg-lair-row" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.2fr) minmax(0,1fr)', gap: 16 }}>
        <DailyQuestsCard shared={shared} setShared={setShared} />
        <div className="glass" style={{ padding: '16px 18px' }}>
          <div style={{ fontSize: 9.5, letterSpacing: '0.22em', color: 'var(--text-muted)', fontWeight: 800, fontFamily: 'var(--font-label)', marginBottom: 12 }}><Glyph e="📊" /> VOCÊS DOIS</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 8 }}>
            {statTiles.map(s => (
              <div key={s.label} style={{ padding: '10px 12px', borderRadius: 12, background: `${s.color}10`, border: `1px solid ${s.color}26` }}>
                <div style={{ fontSize: 9.5, color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.06em', fontFamily: 'var(--font-num)' }}><Glyph e={s.icon} /> {s.label.toUpperCase()}</div>
                <div className="num font-display" style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 12, background: 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(249,115,22,0.1))', border: '1px solid rgba(249,115,22,0.25)' }}>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: '#EEAE8E' }}><Glyph e="🔥" /> Chama do Dragão</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.45, marginTop: 3 }}>
              Constância multiplica XP e cristais das sessões: 3 dias <b>x1.1</b> · 7 dias <b>x1.25</b> · 14 dias <b>x1.5</b> · 30 dias <b>x2</b>.
            </div>
          </div>
        </div>
      </div>

      <ShopPanel shared={shared} setShared={setShared} stage={evo.stage.id} tryOn={tryOn} setTryOn={setTryOn} />
      <AchievementGallery shared={shared} objState={objState} discState={discState} onShare={onShare} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// Header: cristais + som
// ══════════════════════════════════════════════════════════════
function GemCounterChip({ gems, onClick }) {
  return (
    <button id="gem-counter" className="ld-chip" onClick={onClick} title="Cristais arcanos — gaste na loja do Covil">
      <G name="gem" size={16} color="#9D8CFF" style={{ filter: 'drop-shadow(0 0 5px rgba(157,140,255,0.7))' }} />
      <span className="num" style={{ color: '#D6CFFF' }}>{(gems || 0).toLocaleString('pt-BR')}</span>
    </button>
  );
}

function SoundToggle() {
  const [muted, setMuted] = React.useState(() => window.SFX ? window.SFX.isMuted() : false);
  React.useEffect(() => window.SFX ? window.SFX.subscribe(setMuted) : undefined, []);
  return (
    <button className="ld-chip" onClick={() => window.SFX && window.SFX.setMuted(!muted)} aria-label={muted ? 'Ativar sons' : 'Silenciar sons'} title={muted ? 'Ativar sons' : 'Silenciar sons'}
      style={{ width: 38, padding: 0, justifyContent: 'center' }}>
      <G name={muted ? 'mute' : 'sound'} size={17} color={muted ? '#8F88A8' : '#E8C47A'} />
    </button>
  );
}

window.DragonHabitat = DragonHabitat;
window.DragonHomeCard = DragonHomeCard;
window.DailyQuestsCard = DailyQuestsCard;
window.DragonLairTab = DragonLairTab;
window.AchievementBadge = AchievementBadge;
window.AchievementCelebration = AchievementCelebration;
window.EvolutionCinematic = EvolutionCinematic;
window.GemCounterChip = GemCounterChip;
window.SoundToggle = SoundToggle;
window.ChestSVG = ChestSVG;
window.ChestModal = ChestModal;
