// Splash + Sound + Confetti
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
const t = setInterval(() => setIdx(i => (i + 1) % phrases.length), 2400);
return () => clearInterval(t);
}, []);
const handleEnter = () => { setFading(true); setTimeout(onEnter, 500); };

return (
<div style={{
position: 'fixed', inset: 0, zIndex: 100,
background: 'linear-gradient(135deg, #f6f7fb 0%, #ffffff 50%, #f0f9ff 100%)',
display: 'grid', placeItems: 'center',
opacity: fading ? 0 : 1, transition: 'opacity 500ms ease',
}}>
<div style={{
position: 'absolute', inset: 0,
background:
'radial-gradient(ellipse 600px 400px at 30% 40%, rgba(0,184,212,0.12), transparent 60%),' +
'radial-gradient(ellipse 500px 400px at 70% 60%, rgba(91,71,184,0.10), transparent 60%)',
}} />
{Array.from({ length: 24 }).map((_, i) => {
const x = (i * 127) % 100;
const y = (i * 211) % 100;
const delay = (i * 0.17) % 3;
const size = 1.5 + (i % 3);
const colors = ['#00b8d4', '#5B47B8', '#C9A961', '#E85D5D'];
const color = colors[i % colors.length];
return (
<div key={i} style={{
position: 'absolute', left: `${x}%`, top: `${y}%`,
width: size, height: size, borderRadius: '50%',
background: color, opacity: 0.5,
boxShadow: `0 0 8px ${color}`,
animation: `particle-float 4s ease-in-out ${delay}s infinite`,
}} />
);
})}

  <div style={{ position: 'relative', textAlign: 'center', maxWidth: 520, padding: '0 32px' }}>
    <div style={{ margin: '0 auto 28px', width: 130, height: 130, animation: 'shield-pulse 3s ease-in-out infinite' }}>
      <svg viewBox="0 0 130 130" width={130} height={130}>
        <defs>
          <linearGradient id="splash-shield" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0B3D5C">
              <animate attributeName="stop-color" values="#0B3D5C;#00B8D4;#C9A961;#00A86B;#0B3D5C" dur="8s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#C9A961">
              <animate attributeName="stop-color" values="#C9A961;#00A86B;#0B3D5C;#00B8D4;#C9A961" dur="8s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        </defs>
        <g style={{ transformOrigin: '65px 65px', animation: 'spin 20s linear infinite' }}>
          <circle cx="65" cy="65" r="58" fill="none" stroke="rgba(0,184,212,0.25)" strokeWidth="1" strokeDasharray="3 6" />
        </g>
        <path d="M65 16 L102 28 L102 64 C102 88 87 102 65 112 C43 102 28 88 28 64 L28 28 Z"
          fill="rgba(11,61,92,0.08)" stroke="url(#splash-shield)" strokeWidth="2.5" strokeLinejoin="round" />
        <text x="65" y="72" textAnchor="middle" fontSize="18" fontWeight="700"
              fill="url(#splash-shield)" fontFamily="Space Grotesk" letterSpacing="1">TOGA</text>
      </svg>
    </div>
    <div style={{ fontSize: 11, letterSpacing: '0.3em', color: 'var(--text-muted)', marginBottom: 12, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
      O SISTEMA DOS CONCURSEIROS QUE SE APROVAM
    </div>
    <h1 className="gradient-neon" style={{
      fontFamily: 'Space Grotesk, sans-serif',
      fontSize: 52, fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 22px', lineHeight: 1,
    }}>
      TOGA
    </h1>
    <div style={{ height: 44, position: 'relative', marginBottom: 36 }}>
      {phrases.map((p, i) => (
        <div key={i} style={{
          position: 'absolute', inset: 0, color: 'var(--text-muted)',
          fontSize: 16, fontStyle: 'italic',
          opacity: i === idx ? 1 : 0,
          transform: i === idx ? 'translateY(0)' : 'translateY(6px)',
          transition: 'opacity 600ms ease, transform 600ms ease',
        }}>"{p}"</div>
      ))}
    </div>
    <button onClick={handleEnter} style={{
      padding: '13px 30px', fontSize: 14, fontWeight: 600, letterSpacing: '0.05em',
      borderRadius: 12, border: 'none',
      background: 'linear-gradient(90deg, var(--petroleo), var(--ciano))',
      color: 'white', cursor: 'pointer',
      boxShadow: '0 6px 20px rgba(11,61,92,0.35)',
      fontFamily: 'Space Grotesk, sans-serif',
    }}>
      ENTRAR EM CAMPO →
    </button>
  </div>
</div>
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
function spawnConfetti({ count = 30, colors = ['#00b8d4', '#5B47B8'], spread = 90, velocity = 5, gravity = true, shapes = ['square'] }) {
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
el.style.cssText = `left:50%; top:55%; width:${size}px; height:${size}px; background:${color}; border-radius:50%; box-shadow:0 0 6px ${color}; --dx:${dx}px; --dy:${dy}px; --rot:${rot}deg; animation: confetti-fall ${dur}ms cubic-bezier(0.18,0.7,0.4,1) forwards;`;
} else if (shape === 'star') {
el.innerHTML = `<svg width="${size*1.6}" height="${size*1.6}" viewBox="0 0 24 24" fill="${color}" style="filter:drop-shadow(0 0 4px ${color})"><path d="M12 2l2.9 7L22 9.5l-5.5 4.5 1.7 7L12 17l-6.2 4 1.7-7L2 9.5l7.1-.5z"/></svg>`;
el.style.cssText = `left:50%; top:55%; --dx:${dx}px; --dy:${dy}px; --rot:${rot}deg; animation: confetti-fall ${dur}ms cubic-bezier(0.18,0.7,0.4,1) forwards;`;
} else {
el.style.cssText = `left:50%; top:55%; width:${size}px; height:${size*0.5}px; background:${color}; box-shadow:0 0 4px ${color}; --dx:${dx}px; --dy:${dy}px; --rot:${rot}deg; animation: confetti-fall ${dur}ms cubic-bezier(0.18,0.7,0.4,1) forwards;`;
}
root.appendChild(el);
setTimeout(() => el.remove(), dur + 100);
}
}

window.SplashScreen = SplashScreen;
window.spawnConfetti = spawnConfetti;
window.playEvolution = playEvolution;
window.playSick = playSick;
window.playHealed = playHealed;
window.playBlip = playBlip;
window.playCheckChime = playCheckChime;
window.playTopicMastered = playTopicMastered;
window.playEmergency = playEmergency;
window.playTimerEnd = playTimerEnd;
window.celebrateLight = function() { spawnConfetti({ count: 14, colors: ['#00b8d4', '#5B47B8'], spread: 90, shapes: ['square'] }); playLight(); };
window.celebrateHighEnergy = function() {
spawnConfetti({ count: 70, colors: ['#00b8d4', '#5B47B8', '#C9A961', '#00A86B', '#E85D5D'], spread: 280, velocity: 7, shapes: ['square', 'circle', 'star'] });
playMid();
};
window.celebrateVictory = function() {
spawnConfetti({ count: 140, colors: ['#C9A961', '#00A86B', '#E85D5D', '#5B47B8', '#00b8d4'], spread: 360, velocity: 9, shapes: ['square', 'circle', 'star'] });
playVictory();
};
window.celebrateEvolution = function() {
spawnConfetti({ count: 200, colors: ['#5B47B8', '#7B67D8', '#E85D5D', '#C9A961', '#E8C97A'], spread: 360, velocity: 10, shapes: ['star', 'star', 'circle'] });
playEvolution();
};
