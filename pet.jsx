// =============================================================================
// PET COMPANION — Dragãozinho Roxo Místico
// 8 stages of evolution, animated, with sick/healthy states and evolution modal
// =============================================================================

// ———– PET SPRITE —————————————————
// Renders the dragon at any stage. SVG is parametric — features grow with stage.
// stage: 1..8 ; sick: bool ; size in px ; ascended: bool (special XL render)
function PetSprite({ stage, sick = false, size = 130, ascended = false }) {
const info = window.DA.PET_STAGES[Math.max(0, Math.min(7, stage - 1))];
const primary = info.color;
const accent = info.accent;
const glow = info.glow;

// Sick palette: desaturate
const fillBody = sick ? '#c8c0d4' : primary;
const fillBelly = sick ? '#e8e0f0' : '#fff5fa';
const fillAccent = sick ? '#9c94a8' : accent;

// ===== STAGE 1: Egg (intact) =====
if (stage === 1) {
return (
<svg viewBox="0 0 200 200" width={size} height={size}
style={{ animation: 'pet-egg-shake 3.6s ease-in-out infinite', overflow: 'visible' }}>
<defs>
<radialGradient id="egg1-grad" cx="0.4" cy="0.35">
<stop offset="0%" stopColor="#ffffff" />
<stop offset="60%" stopColor={fillBody} />
<stop offset="100%" stopColor={accent} stopOpacity="0.7" />
</radialGradient>
</defs>
<ellipse cx="100" cy="180" rx="42" ry="6" fill="rgba(243,235,221,0.15)" />
<path d="M100 35 C 65 35, 45 95, 50 135 C 55 170, 75 185, 100 185 C 125 185, 145 170, 150 135 C 155 95, 135 35, 100 35 Z"
fill="url(#egg1-grad)" stroke={accent} strokeWidth="2" strokeOpacity="0.4"
style={{ filter: `drop-shadow(0 0 8px ${glow}66)` }} />
{/* sparkle dots on the egg */}
{[[78,80,3],[125,90,2.5],[90,125,3.5],[120,140,2],[100,60,2]].map(([cx,cy,r],i) => (
<circle key={i} cx={cx} cy={cy} r={r} fill={accent}
style={{ animation: `sparkle-twinkle 2.2s ease-in-out ${i * 0.4}s infinite` }} />
))}
{/* halo of magic dust */}
{[0,1,2,3,4,5].map(i => (
<circle key={`d${i}`} cx={100 + Math.cos(i * Math.PI / 3) * 70}
cy={110 + Math.sin(i * Math.PI / 3) * 70} r="2" fill={accent} opacity="0.6"
style={{ animation: `sparkle-twinkle 3s ease-in-out ${i * 0.5}s infinite` }} />
))}
</svg>
);
}

// ===== STAGE 2: Egg cracking — energy escaping =====
if (stage === 2) {
return (
<svg viewBox="0 0 200 200" width={size} height={size}
style={{ animation: 'pet-egg-crack 1.8s ease-in-out infinite', overflow: 'visible' }}>
<defs>
<radialGradient id="egg2-grad" cx="0.4" cy="0.35">
<stop offset="0%" stopColor="#ffffff" />
<stop offset="55%" stopColor={fillBody} />
<stop offset="100%" stopColor={accent} />
</radialGradient>
<radialGradient id="egg2-inner" cx="0.5" cy="0.5">
<stop offset="0%" stopColor="#ffffff" />
<stop offset="50%" stopColor={glow} />
<stop offset="100%" stopColor={accent} stopOpacity="0" />
</radialGradient>
</defs>
<ellipse cx="100" cy="180" rx="42" ry="6" fill="rgba(243,235,221,0.15)" />
{/* glow leaking out */}
<ellipse cx="100" cy="100" rx="52" ry="62" fill="url(#egg2-inner)" opacity="0.7"
style={{ animation: 'pet-glow-pulse 1.4s ease-in-out infinite' }} />
<path d="M100 35 C 65 35, 45 95, 50 135 C 55 170, 75 185, 100 185 C 125 185, 145 170, 150 135 C 155 95, 135 35, 100 35 Z"
fill="url(#egg2-grad)" stroke={accent} strokeWidth="2"
style={{ filter: `drop-shadow(0 0 12px ${glow})` }} />
{/* big crack lines */}
<path d="M70 80 L85 95 L78 105 L92 115 L83 125" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
<path d="M125 75 L115 90 L128 100 L118 115" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
<path d="M95 130 L100 145 L88 155" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
{/* eye peeking out of crack */}
<circle cx="100" cy="105" r="6" fill="white" />
<circle cx="100" cy="105" r="3.5" fill={accent} />
<circle cx="101" cy="103" r="1.5" fill="white" />
{/* sparkles */}
{[[55,55],[150,55],[50,150],[155,150]].map(([cx,cy],i) => (
<g key={i} transform={`translate(${cx} ${cy})`}
style={{ animation: `sparkle-twinkle 1.6s ease-in-out ${i * 0.3}s infinite` }}>
<path d="M0 -6 L1.5 -1.5 L6 0 L1.5 1.5 L0 6 L-1.5 1.5 L-6 0 L-1.5 -1.5 Z" fill={glow} />
</g>
))}
</svg>
);
}

// ===== STAGES 3-8: The dragon itself ====================================
// Feature progression:
//   3: tiny chubby baby, no wings, no horns, big eyes
//   4: tiny wings + tiny horns
//   5: medium wings + horns, more confident posture
//   6: full wings + scales detail
//   7: + toga + book
//   8: + light wings + halo + aura

const showWings = stage >= 4;
const showHorns = stage >= 4;
const showScales = stage >= 6;
const showToga = stage >= 7;
const showBook = stage >= 7;
const showAura = stage === 8;
const showHalo = stage === 8;

// Body size grows with stage
const bodyScale = stage === 3 ? 0.85 : stage === 4 ? 0.92 : stage === 5 ? 1.0 : stage === 6 ? 1.05 : stage === 7 ? 1.1 : 1.15;

const wingSize = stage === 4 ? 18 : stage === 5 ? 26 : stage === 6 ? 34 : stage === 7 ? 36 : 44;
const hornSize = stage === 4 ? 4 : stage === 5 ? 7 : stage === 6 ? 9 : stage === 7 ? 10 : 12;

const breathAnim = sick ? 'pet-sick-tremble 0.8s ease-in-out infinite'
: 'pet-breath 2.6s ease-in-out infinite, pet-bob 3.2s ease-in-out infinite';

return (
<svg viewBox="0 0 200 200" width={size} height={size}
style={{ overflow: 'visible' }}>
<defs>
<radialGradient id={`body-${stage}-${sick}`} cx="0.4" cy="0.35">
<stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
<stop offset="35%" stopColor={fillBody} />
<stop offset="100%" stopColor={fillAccent} />
</radialGradient>
<radialGradient id={`belly-${stage}-${sick}`} cx="0.5" cy="0.4">
<stop offset="0%" stopColor="#ffffff" />
<stop offset="100%" stopColor={fillBelly} />
</radialGradient>
<linearGradient id={`wing-${stage}`} x1="0" y1="0" x2="1" y2="1">
<stop offset="0%" stopColor={primary} stopOpacity="0.9" />
<stop offset="100%" stopColor={accent} stopOpacity="0.7" />
</linearGradient>
<radialGradient id={`aura-${stage}`} cx="0.5" cy="0.5">
<stop offset="0%" stopColor={glow} stopOpacity="0.5" />
<stop offset="50%" stopColor={glow} stopOpacity="0.15" />
<stop offset="100%" stopColor={glow} stopOpacity="0" />
</radialGradient>
</defs>

  {/* Aura (stage 8 only) */}
  {showAura && (
    <circle cx="100" cy="115" r="92" fill={`url(#aura-${stage})`}
      style={{ animation: 'pet-aura-pulse 3s ease-in-out infinite' }} />
  )}

  {/* Halo (stage 8) */}
  {showHalo && (
    <ellipse cx="100" cy="42" rx="32" ry="6" fill="none" stroke={glow} strokeWidth="2.5"
      opacity="0.85" style={{ filter: `drop-shadow(0 0 6px ${glow})`, animation: 'pet-halo-spin 4s linear infinite' }} />
  )}

  {/* Ground shadow */}
  <ellipse cx="100" cy="182" rx={38 * bodyScale} ry="5" fill="rgba(243,235,221,0.18)" />

  {/* Wrap entire dragon in animated group */}
  <g style={{ animation: breathAnim, transformOrigin: 'center 130px' }}>

    {/* Tail — curls behind body */}
    <g transform={`translate(${stage >= 5 ? 130 : 122} ${stage >= 5 ? 145 : 150})`}>
      <path d={stage <= 4
        ? "M0 0 Q 18 -2, 22 -16 Q 24 -22, 18 -24"
        : "M0 0 Q 25 -5, 30 -22 Q 33 -32, 25 -36 Q 19 -36, 17 -28"}
        fill="none" stroke={fillAccent} strokeWidth={stage <= 4 ? 8 : 10}
        strokeLinecap="round" opacity="0.9" />
      {/* tail tip — diamond/spade */}
      <path d={stage <= 4 ? "M14 -28 L19 -22 L14 -16 L9 -22 Z"
        : "M21 -42 L28 -34 L21 -26 L14 -34 Z"}
        fill={fillAccent} stroke={accent} strokeWidth="1" />
    </g>

    {/* Wings — symmetric pair behind body */}
    {showWings && (
      <g style={{ animation: sick ? 'none' : 'pet-wing-flap 1.6s ease-in-out infinite', transformOrigin: '100px 110px' }}>
        {/* Left wing */}
        <path d={`M 78 110 Q ${78 - wingSize} ${100 - wingSize * 0.6}, ${72 - wingSize} ${118 - wingSize * 0.3} Q ${78 - wingSize * 0.4} ${122}, 80 118 Z`}
          fill={`url(#wing-${stage})`} stroke={accent} strokeWidth="1.2"
          opacity={stage === 4 ? 0.85 : 0.95} />
        {/* Right wing */}
        <path d={`M 122 110 Q ${122 + wingSize} ${100 - wingSize * 0.6}, ${128 + wingSize} ${118 - wingSize * 0.3} Q ${122 + wingSize * 0.4} ${122}, 120 118 Z`}
          fill={`url(#wing-${stage})`} stroke={accent} strokeWidth="1.2"
          opacity={stage === 4 ? 0.85 : 0.95} />
        {/* Wing membrane lines (stage 6+) */}
        {stage >= 6 && (
          <>
            <path d={`M 78 110 L ${74 - wingSize * 0.5} ${108 - wingSize * 0.3}`} stroke={accent} strokeWidth="0.8" opacity="0.6" />
            <path d={`M 122 110 L ${126 + wingSize * 0.5} ${108 - wingSize * 0.3}`} stroke={accent} strokeWidth="0.8" opacity="0.6" />
          </>
        )}
      </g>
    )}

    {/* Body — round chubby blob */}
    <ellipse cx="100" cy={130} rx={42 * bodyScale} ry={40 * bodyScale}
      fill={`url(#body-${stage}-${sick})`} stroke={accent} strokeWidth="1.5" />

    {/* Belly patch */}
    <ellipse cx="100" cy={140} rx={26 * bodyScale} ry={22 * bodyScale}
      fill={`url(#belly-${stage}-${sick})`} opacity="0.85" />

    {/* Scale dots (stage 6+) */}
    {showScales && [[85,118,2],[115,118,2],[78,135,1.8],[122,135,1.8],[100,118,1.5]].map(([cx,cy,r],i) => (
      <circle key={i} cx={cx} cy={cy} r={r} fill={accent} opacity="0.35" />
    ))}

    {/* Toga (stage 7+) — flowing black robe with gold trim */}
    {showToga && (
      <g>
        <path d="M 70 142 Q 75 175, 60 188 L 140 188 Q 125 175, 130 142 Z"
          fill="#1a0a3a" stroke="#5a1fa0" strokeWidth="1" opacity="0.92" />
        {/* Gold trim */}
        <path d="M 70 142 Q 75 175, 60 188" fill="none" stroke="#FFD27A" strokeWidth="1.5" />
        <path d="M 130 142 Q 125 175, 140 188" fill="none" stroke="#FFD27A" strokeWidth="1.5" />
        {/* Collar */}
        <path d="M 80 142 L 100 152 L 120 142 Z" fill="#FFD27A" opacity="0.9" />
      </g>
    )}

    {/* Head — slightly forward of body */}
    <ellipse cx="100" cy={102} rx={34 * bodyScale} ry={32 * bodyScale}
      fill={`url(#body-${stage}-${sick})`} stroke={accent} strokeWidth="1.5" />

    {/* Snout/muzzle */}
    <ellipse cx="100" cy={114} rx={14 * bodyScale} ry={9 * bodyScale}
      fill={`url(#belly-${stage}-${sick})`} opacity="0.9" />

    {/* Horns */}
    {showHorns && (
      <>
        <path d={`M 86 ${82} Q 82 ${82 - hornSize}, 86 ${78 - hornSize}`}
          fill={fillAccent} stroke={accent} strokeWidth="1.2" strokeLinejoin="round" />
        <path d={`M 114 ${82} Q 118 ${82 - hornSize}, 114 ${78 - hornSize}`}
          fill={fillAccent} stroke={accent} strokeWidth="1.2" strokeLinejoin="round" />
      </>
    )}

    {/* Tiny ear-fins on sides of head (all dragon stages) */}
    <path d={`M 70 95 Q 60 92, 62 105 Q 68 102, 72 100 Z`} fill={fillAccent} opacity="0.85" />
    <path d={`M 130 95 Q 140 92, 138 105 Q 132 102, 128 100 Z`} fill={fillAccent} opacity="0.85" />

    {/* Eyes — big & round (smaller pupils when sick = sad) */}
    <g style={{ animation: sick ? 'none' : 'pet-blink 5s infinite', transformOrigin: '100px 100px' }}>
      <ellipse cx="88" cy="100" rx="7" ry={sick ? 5 : 8} fill="white" stroke={accent} strokeWidth="1" />
      <ellipse cx="112" cy="100" rx="7" ry={sick ? 5 : 8} fill="white" stroke={accent} strokeWidth="1" />
      {/* pupils */}
      <circle cx={sick ? 87 : 89} cy={sick ? 102 : 102} r={sick ? 2.5 : 4.5} fill="#1a0a3a" />
      <circle cx={sick ? 111 : 113} cy={sick ? 102 : 102} r={sick ? 2.5 : 4.5} fill="#1a0a3a" />
      {/* eye sparkles */}
      {!sick && (
        <>
          <circle cx="91" cy="98" r="1.6" fill="white" />
          <circle cx="115" cy="98" r="1.6" fill="white" />
        </>
      )}
    </g>

    {/* Eyebrows (sad if sick, happy/neutral otherwise) */}
    {sick && (
      <>
        <path d="M 82 89 Q 88 93, 94 91" fill="none" stroke="#1a0a3a" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M 106 91 Q 112 93, 118 89" fill="none" stroke="#1a0a3a" strokeWidth="1.5" strokeLinecap="round" />
      </>
    )}

    {/* Cheek blush */}
    {!sick && (
      <>
        <ellipse cx="78" cy="112" rx="5" ry="3" fill="rgba(255,122,138,0.35)" opacity="0.55" />
        <ellipse cx="122" cy="112" rx="5" ry="3" fill="rgba(255,122,138,0.35)" opacity="0.55" />
      </>
    )}

    {/* Mouth — happy curve / sad curve */}
    {sick ? (
      <path d="M 92 122 Q 100 118, 108 122" fill="none" stroke="#1a0a3a" strokeWidth="1.8" strokeLinecap="round" />
    ) : (
      <path d="M 92 119 Q 100 125, 108 119" fill="none" stroke="#1a0a3a" strokeWidth="1.8" strokeLinecap="round" />
    )}

    {/* Tooth (cute fang) — stage 5+ */}
    {!sick && stage >= 5 && (
      <path d="M 95 122 L 96.5 126 L 98 122 Z" fill="white" stroke="#1a0a3a" strokeWidth="0.5" />
    )}

    {/* Tiny arms (stage 5+) — only if no toga obscuring */}
    {stage >= 5 && !showToga && (
      <>
        <path d={`M 70 ${130} Q 60 ${135}, 60 ${145}`} fill="none" stroke={fillAccent} strokeWidth="6" strokeLinecap="round" />
        <path d={`M 130 ${130} Q 140 ${135}, 140 ${145}`} fill="none" stroke={fillAccent} strokeWidth="6" strokeLinecap="round" />
      </>
    )}

    {/* Book (stage 7+) — held in hands */}
    {showBook && (
      <g transform="translate(135 152)">
        <rect x="-12" y="-8" width="24" height="16" rx="1.5" fill="#FFD27A" stroke="#5a1fa0" strokeWidth="1.5" />
        <rect x="-10" y="-6" width="20" height="12" rx="1" fill="white" />
        <line x1="0" y1="-6" x2="0" y2="6" stroke="#5a1fa0" strokeWidth="0.8" />
        <text x="0" y="2" fontSize="6" fill="#5a1fa0" fontWeight="700" textAnchor="middle" fontFamily="serif">⚖</text>
      </g>
    )}
  </g>

  {/* Sparkles around (stage 6+, only when healthy) */}
  {stage >= 6 && !sick && [[40,60],[160,60],[35,140],[165,140],[30,100],[170,100]].map(([cx,cy],i) => (
    <g key={i} transform={`translate(${cx} ${cy})`}
      style={{ animation: `sparkle-twinkle 2.4s ease-in-out ${i * 0.4}s infinite` }}>
      <path d="M0 -5 L1.2 -1.2 L5 0 L1.2 1.2 L0 5 L-1.2 1.2 L-5 0 L-1.2 -1.2 Z"
        fill={glow} style={{ filter: `drop-shadow(0 0 3px ${glow})` }} />
    </g>
  ))}

  {/* Sick effects — sweat drops + thermometer */}
  {sick && (
    <g>
      {/* sweat drop on forehead */}
      <path d="M 75 75 Q 73 80, 75 84 Q 77 80, 75 75 Z" fill="#7ec8e3" stroke="#3a8eb8" strokeWidth="0.8"
        style={{ animation: 'pet-sweat-fall 2s ease-in-out infinite' }} />
      {/* second sweat */}
      <path d="M 125 78 Q 123 83, 125 87 Q 127 83, 125 78 Z" fill="#7ec8e3" stroke="#3a8eb8" strokeWidth="0.8"
        style={{ animation: 'pet-sweat-fall 2s ease-in-out 1s infinite' }} />
      {/* small "Z" floating to indicate weakness */}
      <text x="155" y="55" fontSize="14" fill="#7ec8e3" fontWeight="700"
        style={{ animation: 'pet-zzz-float 3s ease-in-out infinite' }}>z</text>
      <text x="165" y="40" fontSize="11" fill="#7ec8e3" fontWeight="700"
        style={{ animation: 'pet-zzz-float 3s ease-in-out 0.7s infinite' }}>z</text>
    </g>
  )}
</svg>

);
}

// =============================================================================
// PET COMPANION CARD — main UI shown on dashboard
// =============================================================================
function PetCompanion({ xp, sick = false, dailyLogs = [] }) {
const info = window.DA.getPetStageInfo(xp);
const [hoverHelp, setHoverHelp] = React.useState(false);
const daysOff = window.DA.daysSinceLastStudy(dailyLogs);
const daysOffText = daysOff === Infinity ? null
: daysOff === 0 ? 'Estudou hoje 💜'
: daysOff === 1 ? 'Último estudo: ontem'
: `${daysOff} dias sem estudar`;

return (
<div className="glass" style={{
padding: 18, display: 'flex', alignItems: 'center', gap: 18,
position: 'relative', overflow: 'visible',
borderColor: sick ? 'rgba(255,176,87,0.4)' : undefined,
background: sick
? 'linear-gradient(135deg, rgba(255,250,240,0.85), rgba(255,235,210,0.8))'
: undefined,
}}>
{/* Pet sprite */}
<div style={{ flexShrink: 0, width: 130, height: 130, position: 'relative' }}>
<PetSprite stage={info.stage} sick={sick} size={130} />
</div>

  {/* Info / progress */}
  <div style={{ flex: 1, minWidth: 0 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
      <span className="num" style={{
        fontSize: 9, padding: '2px 7px', borderRadius: 4,
        background: `${info.accent}22`, color: info.accent,
        fontWeight: 700, letterSpacing: '0.1em',
        border: `1px solid ${info.accent}55`,
      }}>
        FASE {info.stage} / 8
      </span>
      {sick && (
        <span className="num" style={{
          fontSize: 9, padding: '2px 7px', borderRadius: 4,
          background: 'rgba(255,176,87,0.18)', color: '#EEBB8F',
          fontWeight: 700, letterSpacing: '0.1em',
          border: '1px solid rgba(255,176,87,0.5)',
          animation: 'amber-pulse 2s ease-in-out infinite',
        }}>
          <Glyph e="🤒" /> DOENTINHO
        </span>
      )}
    </div>
    <div className="font-display" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
      {info.name}
    </div>
    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3, fontStyle: 'italic', lineHeight: 1.35 }}>
      {sick
        ? 'Sua dragãzinha está doentinha. Estude 2 dias seguidos para curá-la 💚'
        : info.desc}
    </div>

    {/* XP progress to next stage */}
    {info.next && (
      <div style={{ marginTop: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-dim)', marginBottom: 3, fontFamily: 'var(--font-num)', fontWeight: 600 }}>
          <span>até <span style={{ color: info.next.accent }}>{info.next.name}</span></span>
          <span className="num">{xp.toLocaleString('pt-BR')} / {info.next.minXp.toLocaleString('pt-BR')} XP</span>
        </div>
        <div style={{ height: 6, background: 'rgba(243,235,221,0.06)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${info.progress * 100}%`,
            background: `linear-gradient(90deg, ${info.accent}, ${info.glow})`,
            boxShadow: `0 0 8px ${info.glow}99`,
            transition: 'width 600ms ease',
          }} />
        </div>
      </div>
    )}

    {/* Last study indicator */}
    {daysOffText && (
      <div style={{ marginTop: 8, fontSize: 10.5, color: 'var(--text-dim)', fontFamily: 'var(--font-num)', fontWeight: 600 }}>
        {daysOffText}
      </div>
    )}
  </div>
</div>

);
}

// =============================================================================
// EVOLUTION MODAL — full-screen celebration when pet evolves
// =============================================================================
function EvolutionModal({ fromStage, toStage, onClose }) {
const fromInfo = window.DA.PET_STAGES[Math.max(0, fromStage - 1)];
const toInfo = window.DA.PET_STAGES[Math.max(0, toStage - 1)];
const [phase, setPhase] = React.useState('reveal'); // reveal → done

React.useEffect(() => {
// Auto-advance reveal phase
const t = setTimeout(() => setPhase('done'), 2400);
return () => clearTimeout(t);
}, []);

return (
<div style={{
position: 'fixed', inset: 0, zIndex: 200,
background: 'radial-gradient(ellipse at center, rgba(183,170,255,0.4), rgba(12,13,18,0.85))',
backdropFilter: 'blur(12px)',
display: 'grid', placeItems: 'center', padding: 24,
animation: 'fade-in 400ms ease-out',
}}>
<div style={{
textAlign: 'center', maxWidth: 480,
animation: 'slide-up 500ms cubic-bezier(0.2,0.8,0.2,1)',
}}>
<div style={{
fontSize: 11, letterSpacing: '0.4em', color: toInfo.glow, marginBottom: 16,
fontFamily: 'var(--font-label)', fontWeight: 700,
textShadow: `0 0 14px ${toInfo.glow}`,
}}>
<Glyph e="✨" /> EVOLUÇÃO <Glyph e="✨" />
</div>

    {/* Big pet sprite with glow halo */}
    <div style={{
      margin: '0 auto 24px', width: 220, height: 220, position: 'relative',
      animation: phase === 'reveal' ? 'pet-evolution-emerge 2.4s ease-out' : 'pet-bob 3s ease-in-out infinite',
    }}>
      {/* Radial light burst behind pet */}
      {phase === 'reveal' && (
        <div style={{
          position: 'absolute', inset: '-40px', borderRadius: '50%',
          background: `radial-gradient(circle, ${toInfo.glow}aa, transparent 65%)`,
          animation: 'pet-burst 2s ease-out',
        }} />
      )}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <PetSprite stage={toStage} size={220} />
      </div>
    </div>

    {/* Stage transition text */}
    <div style={{
      fontSize: 11, color: 'rgba(255,255,255,0.55)',
      fontFamily: 'var(--font-label)', letterSpacing: '0.18em', fontWeight: 600,
      marginBottom: 4,
    }}>
      FASE {fromStage} <span style={{ color: toInfo.glow, padding: '0 8px' }}>→</span> FASE {toStage}
    </div>

    <div className="font-display" style={{
      fontSize: 36, fontWeight: 700, color: 'white',
      letterSpacing: '-0.02em', marginBottom: 10,
      textShadow: `0 0 20px ${toInfo.glow}88, 0 4px 20px rgba(0,0,0,0.5)`,
    }}>
      {toInfo.name}
    </div>

    <div style={{
      fontSize: 14, color: 'rgba(255,255,255,0.85)',
      maxWidth: 380, margin: '0 auto 6px', lineHeight: 1.5,
    }}>
      {toInfo.desc}
    </div>
    <div style={{
      fontSize: 12, color: toInfo.glow, fontStyle: 'italic',
      marginBottom: 28, textShadow: `0 0 10px ${toInfo.glow}66`,
    }}>
      {toInfo.flavor}
    </div>

    <button onClick={onClose} style={{
      padding: '14px 36px', fontSize: 14, fontWeight: 700, letterSpacing: '0.1em',
      borderRadius: 12, border: `1.5px solid ${toInfo.glow}`,
      background: `linear-gradient(135deg, ${toInfo.color}, ${toInfo.accent})`,
      color: 'white', cursor: 'pointer',
      boxShadow: `0 6px 30px ${toInfo.glow}99, 0 0 20px ${toInfo.glow}55`,
      fontFamily: 'var(--font-display)',
      textShadow: '0 1px 3px rgba(0,0,0,0.4)',
    }}>
      CONTINUAR JORNADA →
    </button>
  </div>
</div>

);
}

// Small floating XP gain indicator (used when checks are toggled)
function XpFloater({ amount, onDone, x = '50%', y = '50%' }) {
React.useEffect(() => {
const t = setTimeout(onDone, 1100);
return () => clearTimeout(t);
}, []);
return (
<div style={{
position: 'fixed', left: x, top: y, zIndex: 70,
pointerEvents: 'none',
fontSize: 16, fontWeight: 700,
color: amount > 0 ? 'var(--esmeralda)' : 'var(--coral)',
textShadow: amount > 0 ? '0 0 10px rgba(79,209,165,0.7)' : '0 0 10px rgba(255,122,138,0.7)',
fontFamily: 'var(--font-num)',
animation: 'xp-float 1.1s ease-out forwards',
}}>
{amount > 0 ? '+' : ''}{amount} XP
</div>
);
}

window.PetSprite = PetSprite;
window.PetCompanion = PetCompanion;
window.EvolutionModal = EvolutionModal;
window.XpFloater = XpFloater;