// Lendário — Abertura (o selo se desenha em ouro) + Som + Confete
function SplashScreen({ onEnter }) {
  const phrases = [
    'Cada questão respondida é um passo mais perto da posse.',
    'Consistência vence genialidade. Todo dia.',
    'A aprovação não é sorte. É método.',
    'Seu edital. Seu ritmo. Sua posse.',
  ];
  const [idx, setIdx] = React.useState(0);
  const [fading, setFading] = React.useState(false);
  React.useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % phrases.length), 3200);
    return () => clearInterval(t);
  }, []);
  const handleEnter = () => { setFading(true); window.SFX && window.SFX.whoosh && window.SFX.whoosh(); setTimeout(onEnter, 600); };
  const P = window.LD_PATHS || {};
  const strokes = [['body', 0.2], ['horn1', 0.7], ['horn2', 0.8], ['spikes', 0.9], ['wing', 1.0]];

  return (
    <div className={`ld-splash ${fading ? 'is-leaving' : ''}`} role="dialog" aria-label="Abertura do Lendário">
      <div className="ld-splash-rays" />
      {Array.from({ length: 18 }).map((_, i) => (
        <span key={i} className="ld-splash-star" style={{ left: `${(i * 127) % 100}%`, top: `${(i * 211) % 100}%`, animationDelay: `${(i * 0.37) % 4}s` }} />
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <span key={'m' + i} className="ld-splash-mote" style={{ left: `${38 + i * 5}%`, animationDelay: `${i * 0.9}s` }} />
      ))}
      <div className="ld-splash-inner">
        <div className="ld-splash-sigil">
          <svg className="ld-spin-slow" viewBox="0 0 200 200" aria-hidden="true">
            <circle cx="100" cy="100" r="98" fill="none" stroke="#E8C47A" strokeOpacity=".3" strokeWidth=".4" />
            <circle cx="100" cy="100" r="94" fill="none" stroke="#E8C47A" strokeOpacity=".55" strokeWidth="2" strokeDasharray=".4 4.6" />
            <circle cx="100" cy="100" r="89" fill="none" stroke="#9D8CFF" strokeOpacity=".45" strokeWidth="3.2" strokeDasharray="1 2 7 2 1 10" />
            <path d="M100 1 L102.4 8 L100 15 L97.6 8 Z M199 100 L192 102.4 L185 100 L192 97.6 Z M100 199 L97.6 192 L100 185 L102.4 192 Z M1 100 L8 97.6 L15 100 L8 102.4 Z" fill="#E8C47A" />
          </svg>
          <svg className="ld-spin-rev" viewBox="0 0 200 200" aria-hidden="true">
            <polygon points="100,22 167.5,139 32.5,139" fill="none" stroke="#E8C47A" strokeOpacity=".16" strokeWidth=".5" />
            <polygon points="100,178 32.5,61 167.5,61" fill="none" stroke="#9D8CFF" strokeOpacity=".2" strokeWidth=".5" />
            <circle cx="100" cy="100" r="74" fill="none" stroke="#9D8CFF" strokeOpacity=".35" strokeWidth=".7" strokeDasharray="3 3" />
          </svg>
          <div className="ld-splash-flash" />
          <svg className="ld-splash-mark" viewBox="0 0 120 120" role="img" aria-label="Logo Lendário">
            <defs>
              <linearGradient id="ld-sp-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFF1C9" /><stop offset=".45" stopColor="#E8C47A" /><stop offset="1" stopColor="#9C6E2C" /></linearGradient>
            </defs>
            {strokes.map(([k, d]) => (
              <path key={k} className="ld-draw" pathLength="1" d={P[k]} fill="none" stroke="url(#ld-sp-g)" strokeWidth="1.4" strokeLinejoin="round" style={{ animationDelay: `${d}s` }} />
            ))}
            <g className="ld-fill-in"><LogoMarkInner /></g>
          </svg>
        </div>
        <div className="ld-splash-word gold-leaf">LENDÁRIO</div>
        <div className="ld-splash-tag font-display">Estude como uma lenda.</div>
        <div className="ld-splash-phrase" aria-live="polite">
          {phrases.map((p, i) => (
            <span key={i} className={i === idx ? 'is-on' : ''}>{p}</span>
          ))}
        </div>
        <button className="btn-neon ld-splash-cta" onClick={handleEnter} autoFocus>
          Entrar na biblioteca
          <G name="play" size={14} color="#231604" />
        </button>
        <div className="ld-splash-load"><i /><span>ACENDENDO AS RUNAS</span><i /></div>
      </div>
    </div>
  );
}

// Miolo da logo sem o <svg> externo (para compor animações)
function LogoMarkInner() {
  const P = window.LD_PATHS || {};
  return (
    <>
      <defs>
        <linearGradient id="ld-in-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFF1C9" /><stop offset=".45" stopColor="#E8C47A" /><stop offset="1" stopColor="#9C6E2C" /></linearGradient>
        <linearGradient id="ld-in-w" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#A89CFF" /><stop offset="1" stopColor="#2A1E78" /></linearGradient>
      </defs>
      <path d={P.wing} fill="url(#ld-in-w)" stroke="url(#ld-in-g)" strokeWidth="1.5" strokeLinejoin="round" />
      <path d={P.veins} fill="none" stroke="#E8C47A" strokeOpacity=".5" strokeWidth=".9" />
      <path d={P.horn1} fill="url(#ld-in-g)" /><path d={P.horn2} fill="url(#ld-in-g)" />
      <path d={P.body} fill="url(#ld-in-g)" /><path d={P.spikes} fill="url(#ld-in-g)" />
      <path d={P.eye} fill="#120E26" /><circle cx="61.8" cy="21.4" r="1.5" fill="#C9C1FF" />
      <path d={P.brow} fill="none" stroke="#9C6E2C" strokeWidth="1" strokeLinecap="round" />
      <circle cx="80.2" cy="26.2" r="1" fill="#6E4A18" />
      <path d={P.mouth} fill="none" stroke="#9C6E2C" strokeWidth=".9" strokeLinecap="round" />
      <path className="ld-star-pop" d={P.star} fill="#FFF1C9" />
    </>
  );
}

// ===== Sound (Web Audio synthesized — no external files) =====
let audioCtx = null;
function getCtx() {
// Reusa o contexto do motor SFX (respeita o botão de mudo)
if (window.SFX) { if (window.SFX.isMuted()) return null; return window.SFX.ctx(); }
if (!audioCtx) {
try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
}
return audioCtx;
}
function sfxDest(ctx) { return (window.SFX && window.SFX.out()) || ctx.destination; }

function playChord(freqs, duration = 0.45, type = 'triangle', startGain = 0.2) {
const ctx = getCtx();
if (!ctx) return;
const t = ctx.currentTime;
freqs.forEach((f, i) => {
const osc = ctx.createOscillator();
const gain = ctx.createGain();
osc.type = type;
osc.frequency.value = f;
gain.gain.setValueAtTime(0, t);
gain.gain.linearRampToValueAtTime(startGain / freqs.length, t + 0.02 + i * 0.04);
gain.gain.exponentialRampToValueAtTime(0.0001, t + duration + i * 0.04);
osc.connect(gain).connect(sfxDest(ctx));
osc.start(t + i * 0.04);
osc.stop(t + duration + i * 0.04 + 0.05);
});
}
function playLight() { playChord([523.25, 783.99], 0.25, 'triangle', 0.15); }
function playMid() { playChord([523.25, 659.25, 783.99], 0.5, 'triangle', 0.22); }
function playVictory() {
const ctx = getCtx(); if (!ctx) return;
const seq = [523.25, 659.25, 783.99, 1046.5, 1318.5];
seq.forEach((f, i) => setTimeout(() => playChord([f], 0.3, 'triangle', 0.18), i * 90));
setTimeout(() => playChord([1046.5, 1318.5, 1567.98], 0.7, 'sine', 0.15), seq.length * 90);
}

function playCheck() {
const ctx = getCtx(); if (!ctx) return;
setTimeout(() => playChord([880, 1318.5], 0.15, 'triangle', 0.13), 0);
setTimeout(() => playChord([1318.5, 1760], 0.18, 'triangle', 0.10), 70);
}

function playEvolution() {
const ctx = getCtx(); if (!ctx) return;
const ladder = [293.66, 369.99, 440, 587.33, 739.99, 880, 1108.73, 1318.51];
ladder.forEach((f, i) => setTimeout(() => playChord([f], 0.22, 'triangle', 0.2), i * 70));
setTimeout(() => playChord([587.33, 739.99, 880, 1174.66], 1.2, 'sine', 0.18), ladder.length * 70);
setTimeout(() => {
const shimmer = [1760, 2093.0, 2349.32, 2637.02];
shimmer.forEach((f, i) => setTimeout(() => playChord([f], 0.4, 'sine', 0.06), i * 45));
}, ladder.length * 70 + 200);
}

function playSick() {
const ctx = getCtx(); if (!ctx) return;
const fall = [440, 415.30, 392, 369.99];
fall.forEach((f, i) => setTimeout(() => playChord([f], 0.45, 'sine', 0.14), i * 180));
}

function playHealed() {
const ctx = getCtx(); if (!ctx) return;
const seq = [659.25, 783.99, 987.77, 1318.51];
seq.forEach((f, i) => setTimeout(() => playChord([f], 0.3, 'triangle', 0.16), i * 110));
}

function playBlip() {
const ctx = getCtx(); if (!ctx) return;
playChord([783.99, 1046.5], 0.12, 'triangle', 0.1);
}

function playCheckChime() {
const ctx = getCtx(); if (!ctx) return;
setTimeout(() => playChord([1046.5, 1318.5], 0.10, 'triangle', 0.14), 0);
setTimeout(() => playChord([1567.98, 1975.53], 0.14, 'sine', 0.11), 55);
}

function playTopicMastered() {
const ctx = getCtx(); if (!ctx) return;
setTimeout(() => playChord([587.33, 739.99, 880], 0.35, 'triangle', 0.18), 0);
setTimeout(() => playChord([1174.66, 1480, 1760], 0.45, 'sine', 0.13), 100);
setTimeout(() => playChord([2349.32, 2637.02], 0.3, 'sine', 0.08), 240);
}

// Emergency alarm — three urgent beeps with siren-like sweep (for distraction alert)
function playEmergency() {
  const ctx = getCtx(); if (!ctx) return;
  const burst = (delay) => {
    setTimeout(() => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'square';
      o.frequency.setValueAtTime(880, ctx.currentTime);
      o.frequency.linearRampToValueAtTime(1320, ctx.currentTime + 0.18);
      o.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.36);
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.36);
      o.connect(g); g.connect(sfxDest(ctx));
      o.start();
      o.stop(ctx.currentTime + 0.4);
    }, delay);
  };
  burst(0); burst(450); burst(900);
}

// Timer end — pleasant chime sequence (when modo blindado completes naturally)
function playTimerEnd() {
  const ctx = getCtx(); if (!ctx) return;
  const seq = [1046.5, 1318.5, 1567.98, 2093.0];
  seq.forEach((f, i) => setTimeout(() => playChord([f], 0.4, 'triangle', 0.17), i * 130));
  setTimeout(() => playChord([2093.0, 2637.02], 0.7, 'sine', 0.12), seq.length * 130);
}

// ===== Confetti =====
function spawnConfetti({ count = 30, colors = ['#E8C47A', '#B7AAFF', '#FFF1C9'], spread = 90, velocity = 5, gravity = true, shapes = ['square'] }) {
const root = document.getElementById('confetti-root');
if (!root) return;
for (let i = 0; i < count; i++) {
const el = document.createElement('div');
const shape = shapes[i % shapes.length];
const angle = (Math.random() - 0.5) * (spread * Math.PI / 180) - Math.PI / 2;
const v = velocity + Math.random() * velocity;
const dx = Math.cos(angle) * v * 32;
const dy = (Math.sin(angle) * v * 32) - (Math.random() * 80) + (gravity ? 200 : 0);
const color = colors[i % colors.length];
const rot = (Math.random() - 0.5) * 720;
const dur = 1100 + Math.random() * 700;
const size = 6 + Math.random() * 6;
el.className = 'confetti-piece';
if (shape === 'circle') {
el.style.cssText = `left:50%; top:55%; width:${size}px; height:${size}px; background: ${color}; border-radius:50%; box-shadow: 0 0 6px ${color}; --dx:${dx}px; --dy:${dy}px; --rot:${rot}deg; animation: confetti-fall ${dur}ms cubic-bezier(0.18,0.7,0.4,1) forwards;`;
} else if (shape === 'star') {
el.innerHTML = `<svg width="${size*1.6}" height="${size*1.6}" viewBox="0 0 24 24" fill="${color}" style="filter:drop-shadow(0 0 4px ${color})"><path d="M12 2l2.9 7L22 9.5l-5.5 4.5 1.7 7L12 17l-6.2 4 1.7-7L2 9.5l7.1-.5z"/></svg>`;
el.style.cssText = `left:50%; top:55%; --dx:${dx}px; --dy:${dy}px; --rot:${rot}deg; animation: confetti-fall ${dur}ms cubic-bezier(0.18,0.7,0.4,1) forwards;`;
} else {
el.style.cssText = `left:50%; top:55%; width:${size}px; height:${size*0.5}px; background: ${color}; box-shadow: 0 0 4px ${color}; --dx:${dx}px; --dy:${dy}px; --rot:${rot}deg; animation: confetti-fall ${dur}ms cubic-bezier(0.18,0.7,0.4,1) forwards;`;
}
root.appendChild(el);
setTimeout(() => el.remove(), dur + 100);
}
}

window.SplashScreen = SplashScreen;
window.LogoMarkInner = LogoMarkInner;
window.spawnConfetti = spawnConfetti;
window.playEvolution = playEvolution;
window.playSick = playSick;
window.playHealed = playHealed;
window.playBlip = playBlip;
window.playCheckChime = playCheckChime;
window.playTopicMastered = playTopicMastered;
window.playEmergency = playEmergency;
window.playTimerEnd = playTimerEnd;
window.celebrateLight = function() { spawnConfetti({ count: 14, colors: ['#E8C47A', '#B7AAFF', '#FFF1C9'], spread: 90, shapes: ['square'] }); playLight(); };
window.celebrateHighEnergy = function() {
spawnConfetti({ count: 70, colors: ['#8FB8FF', '#B7AAFF', '#E8C47A', '#4FD1A5', '#FF7A8A'], spread: 280, velocity: 7, shapes: ['square', 'circle', 'star'] });
playMid();
};
window.celebrateVictory = function() {
spawnConfetti({ count: 140, colors: ['#E8C47A', '#4FD1A5', '#FF7A8A', '#B7AAFF', '#8FB8FF'], spread: 360, velocity: 9, shapes: ['square', 'circle', 'star'] });
playVictory();
};
window.celebrateEvolution = function() {
spawnConfetti({ count: 200, colors: ['#B7AAFF', '#C9C1FF', '#FF7A8A', '#E8C47A', '#E8C97A'], spread: 360, velocity: 10, shapes: ['star', 'star', 'circle'] });
playEvolution();
};
