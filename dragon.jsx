// Lendário — Dragãozinho Arcano
// Mascote de gamificação: 8 fases, humores, acessórios equipáveis,
// olhos que seguem o cursor, runas brilhantes e familiares mágicos.
// SVG 100% vetorial (sem imagens) — também é serializado para os cards de compartilhamento.

const DRAGON_STAGES = [
  { id: 1, name: 'Ovo Arcano',       minXp: 0,
    desc: 'Um ovo coberto de runas antigas. Cada minuto de estudo aquece a magia lá dentro.',
    pal: { body1: '#FFF8EC', body2: '#E4D8FB', gem: '#5EEAD4', glow: '#C4B5FD', accent: '#7C5CE8', rune: '#8B5CF6' } },
  { id: 2, name: 'Ovo Desperto',     minXp: 150,
    desc: 'As runas brilham e a casca trinca! Alguém aí dentro está curioso para te conhecer…',
    pal: { body1: '#FFF6E6', body2: '#DCCBFA', gem: '#FDE68A', glow: '#A78BFA', accent: '#6D4FE0', rune: '#7C3AED' } },
  { id: 3, name: 'Filhote Faísca',   minXp: 400,
    desc: 'Eclodiu! Ainda usa a casca de chapéu e se encanta com cada página virada.',
    pal: { body1: '#CFC2FF', body2: '#9C86F5', belly: '#FFF4DE', belly2: '#F6D6A8', horn1: '#FFFFFF', horn2: '#A5F3FC',
           wing1: '#E4DCFF', wing2: '#9C86F5', gem: '#5EEAD4', glow: '#99F6E4', accent: '#6D4FE0' } },
  { id: 4, name: 'Dragão Aprendiz',  minXp: 1200,
    desc: 'Asinhas novas e chifres de cristal. Já rabisca anotações com sua pena mágica.',
    pal: { body1: '#BEAEFF', body2: '#8467F2', belly: '#FFF3DB', belly2: '#F4CF9C', horn1: '#FFFFFF', horn2: '#7DD3FC',
           wing1: '#DCD2FF', wing2: '#8467F2', gem: '#38BDF8', glow: '#7DD3FC', accent: '#5B3FD6' } },
  { id: 5, name: 'Dragão Estudioso', minXp: 2800,
    desc: 'Um grimório flutua ao seu lado. Devora doutrina e jurisprudência no café da manhã.',
    pal: { body1: '#B09CFF', body2: '#7454EC', belly: '#FFF1D6', belly2: '#F2C98F', horn1: '#FFFFFF', horn2: '#F9A8D4',
           wing1: '#D6CAFF', wing2: '#7454EC', gem: '#F472B6', glow: '#F9A8D4', accent: '#5233C9' } },
  { id: 6, name: 'Dragão Arcano',    minXp: 5500,
    desc: 'Runas acendem em suas escamas e um círculo mágico surge a cada sessão de foco.',
    pal: { body1: '#A392FF', body2: '#5E3FDB', belly: '#FFF0D2', belly2: '#EFC07E', horn1: '#FFFFFF', horn2: '#C4B5FD',
           wing1: '#6D5AE6', wing2: '#2E1B8C', gem: '#FBBF24', glow: '#FDE68A', accent: '#4527B5', starWings: true } },
  { id: 7, name: 'Dragão Sábio',     minXp: 9500,
    desc: 'Orbes de conhecimento orbitam ao seu redor. Poucos estudantes chegam tão longe.',
    pal: { body1: '#9683FB', body2: '#4E2FC2', belly: '#FFEFD0', belly2: '#ECB86E', horn1: '#FFFBEB', horn2: '#FFB057',
           wing1: '#5B45D8', wing2: '#1E1170', gem: '#FFB057', glow: '#FCD34D', accent: '#3A1F9E', starWings: true } },
  { id: 8, name: 'Dragão Lendário',  minXp: 15000,
    desc: 'Asas de galáxia e coroa de estrelas. O guardião da sua aprovação. ⚖️✨',
    pal: { body1: '#8A76F7', body2: '#3B1F9E', belly: '#FFF3D6', belly2: '#F0C27A', horn1: '#FFFFFF', horn2: '#FFD166',
           wing1: '#7C3AED', wing2: '#140B4D', gem: '#FFE08A', glow: '#FFD166', accent: '#2A1480', starWings: true, galaxy: true } },
];

function evaluateDragon(xp) {
  const score = Math.max(0, xp || 0);
  let cur = DRAGON_STAGES[0];
  for (const s of DRAGON_STAGES) if (score >= s.minXp) cur = s;
  const next = DRAGON_STAGES[cur.id] || null;
  const progress = next ? Math.min(100, ((score - cur.minXp) / (next.minXp - cur.minXp)) * 100) : 100;
  return { score, stage: cur, next, progress, isMax: !next, toNext: next ? next.minXp - score : 0 };
}
function getDragonStage(xp) { return evaluateDragon(xp).stage.id; }

// ── Helpers de forma ─────────────────────────────────────────
const star4 = (r) => `M0 ${-r} L${r * 0.28} ${-r * 0.28} L${r} 0 L${r * 0.28} ${r * 0.28} L0 ${r} L${-r * 0.28} ${r * 0.28} L${-r} 0 L${-r * 0.28} ${-r * 0.28} Z`;
const star5 = (r) => {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 === 0 ? r : r * 0.45;
    const a = -Math.PI / 2 + i * Math.PI / 5;
    d += (i === 0 ? 'M' : 'L') + (Math.cos(a) * rr).toFixed(2) + ' ' + (Math.sin(a) * rr).toFixed(2) + ' ';
  }
  return d + 'Z';
};
const heartPath = 'M0 3 C -6 -2, -5 -8, 0 -5 C 5 -8, 6 -2, 0 3 Z';
const mirrorX = (x) => 240 - x;

// ── Acessórios (desenhados em coordenadas do sprite 240×240) ──
function CosmeticHat({ id, uid }) {
  if (id === 'hat_wizard') return (
    <g>
      <defs>
        <linearGradient id={`${uid}-wiz`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366F1" /><stop offset="100%" stopColor="#1E1B6B" />
        </linearGradient>
      </defs>
      <path d="M90 56 C 100 34, 112 12, 142 -4 C 134 18, 142 38, 152 56 Z" fill={`url(#${uid}-wiz)`} stroke="#1E1B4B" strokeWidth="1.5" />
      <ellipse cx="121" cy="56" rx="40" ry="9" fill="#312E81" stroke="#1E1B4B" strokeWidth="1.5" />
      <path d="M96 50 Q121 58 147 50" fill="none" stroke="#FBBF24" strokeWidth="3" />
      <g transform="translate(142 -4)"><path d={star5(7)} fill="#FDE047" className="dg-twinkle" style={{ transformOrigin: '0px 0px' }} /></g>
      <g transform="translate(116 30)"><path d={star5(4.5)} fill="#FDE68A" /></g>
      <g transform="translate(131 16)"><path d={star4(3.5)} fill="#FFF" opacity="0.9" /></g>
      <g transform="translate(106 44)"><circle r="2" fill="#FDE68A" /></g>
    </g>
  );
  if (id === 'hat_grad') return (
    <g>
      <path d="M96 44 L96 58 Q120 68 144 58 L144 44 Z" fill="#111827" />
      <polygon points="76,40 120,24 164,40 120,56" fill="#1F2937" stroke="#030712" strokeWidth="1.2" />
      <polygon points="80,40 120,26 160,40 120,54" fill="#374151" opacity="0.35" />
      <circle cx="120" cy="40" r="3" fill="#FBBF24" />
      <path d="M120 40 L154 46 L156 64" fill="none" stroke="#FBBF24" strokeWidth="2" className="dg-tassel" />
      <path d="M152 62 L160 62 L158 76 L154 76 Z" fill="#FBBF24" />
    </g>
  );
  if (id === 'hat_crown') return (
    <g style={{ filter: 'drop-shadow(0 0 6px rgba(253,224,71,0.8))' }}>
      <defs>
        <linearGradient id={`${uid}-crown`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FEF3C7" /><stop offset="45%" stopColor="#FBBF24" /><stop offset="100%" stopColor="#B45309" />
        </linearGradient>
      </defs>
      <path d="M92 60 L88 30 L104 44 L112 22 L120 40 L128 22 L136 44 L152 30 L148 60 Z" fill={`url(#${uid}-crown)`} stroke="#92400E" strokeWidth="1.3" strokeLinejoin="round" />
      <rect x="91" y="54" width="58" height="7" rx="3" fill="#B45309" />
      <circle cx="120" cy="50" r="4.5" fill="#EC4899" stroke="#FFF" strokeWidth="1" />
      <circle cx="104" cy="53" r="3" fill="#22D3EE" /><circle cx="136" cy="53" r="3" fill="#22D3EE" />
      {[[88, 30], [112, 22], [128, 22], [152, 30]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.6" fill="#FEF9C3" />)}
    </g>
  );
  if (id === 'hat_beret') return (
    <g>
      <ellipse cx="112" cy="52" rx="38" ry="13" fill="#DC2626" transform="rotate(-12 112 52)" />
      <ellipse cx="108" cy="47" rx="30" ry="7" fill="#F87171" opacity="0.35" transform="rotate(-12 108 47)" />
      <rect x="108" y="34" width="4" height="7" rx="2" fill="#991B1B" transform="rotate(-12 110 38)" />
    </g>
  );
  if (id === 'hat_nightcap') return (
    <g>
      <path d="M86 62 C 88 38, 118 24, 150 32 C 170 38, 182 58, 182 80 C 174 62, 164 52, 152 50 C 156 54, 157 58, 156 62 Z" fill="#60A5FA" stroke="#1D4ED8" strokeWidth="1.2" />
      <path d="M104 40 C 120 34, 140 34, 156 44" fill="none" stroke="#DBEAFE" strokeWidth="5" opacity="0.8" />
      <path d="M150 34 C 164 42, 172 52, 176 64" fill="none" stroke="#DBEAFE" strokeWidth="4" opacity="0.8" />
      <rect x="82" y="56" width="78" height="10" rx="5" fill="#EFF6FF" />
      <circle cx="182" cy="82" r="8" fill="#FFF" stroke="#BFDBFE" />
    </g>
  );
  return null;
}

function CosmeticFace({ id }) {
  if (id === 'face_glasses') return (
    <g>
      <circle cx="96" cy="97" r="17" fill="rgba(224,242,254,0.18)" stroke="#7C2D12" strokeWidth="3.2" />
      <circle cx="144" cy="97" r="17" fill="rgba(224,242,254,0.18)" stroke="#7C2D12" strokeWidth="3.2" />
      <path d="M112 94 Q120 88 128 94" fill="none" stroke="#7C2D12" strokeWidth="3" />
      <path d="M86 88 L94 84" stroke="#FFF" strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />
      <path d="M134 88 L142 84" stroke="#FFF" strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />
    </g>
  );
  if (id === 'face_monocle') return (
    <g>
      <circle cx="144" cy="97" r="17" fill="rgba(224,242,254,0.2)" stroke="#D97706" strokeWidth="3.2" />
      <path d="M160 102 Q170 130 158 150" fill="none" stroke="#D97706" strokeWidth="1.5" strokeDasharray="2 2" />
      <path d="M134 88 L142 84" stroke="#FFF" strokeWidth="2.2" strokeLinecap="round" opacity="0.85" />
    </g>
  );
  if (id === 'face_stars') return (
    <g>
      <g transform="translate(76 118)"><path d={star5(5)} fill="#FBBF24" stroke="#FFF" strokeWidth="0.8" /></g>
      <g transform="translate(164 118)"><path d={star5(5)} fill="#FBBF24" stroke="#FFF" strokeWidth="0.8" /></g>
      <g transform="translate(84 128)"><path d={star4(2.5)} fill="#FFF" /></g>
      <g transform="translate(156 128)"><path d={star4(2.5)} fill="#FFF" /></g>
    </g>
  );
  return null;
}

function CosmeticNeck({ id, uid }) {
  if (id === 'neck_scarf') return (
    <g>
      <path d="M84 140 Q120 158 156 140 L157 151 Q120 169 83 151 Z" fill="#E11D48" stroke="#9F1239" strokeWidth="1" />
      <path d="M96 146 L96 156 M110 150 L110 160 M130 150 L130 160 M144 146 L144 156" stroke="#FDE68A" strokeWidth="3" opacity="0.9" />
      <g className="dg-scarf" style={{ transformOrigin: '136px 154px' }}>
        <path d="M130 152 L150 184 L138 188 L124 158 Z" fill="#E11D48" stroke="#9F1239" strokeWidth="1" />
        <path d="M140 184 L144 192 M146 182 L151 189" stroke="#FDE68A" strokeWidth="2" />
      </g>
    </g>
  );
  if (id === 'neck_bowtie') return (
    <g>
      <path d="M120 150 L100 140 L100 162 Z" fill="#7C3AED" stroke="#4C1D95" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M120 150 L140 140 L140 162 Z" fill="#7C3AED" stroke="#4C1D95" strokeWidth="1.2" strokeLinejoin="round" />
      <rect x="114" y="144" width="12" height="12" rx="3" fill="#A78BFA" stroke="#4C1D95" strokeWidth="1.2" />
    </g>
  );
  if (id === 'neck_toga') return (
    <g>
      <path d="M80 148 Q120 160 160 148 L170 206 Q120 218 70 206 Z" fill="#111827" stroke="#030712" strokeWidth="1" />
      <path d="M80 148 L70 206" stroke="#FBBF24" strokeWidth="2.2" />
      <path d="M160 148 L170 206" stroke="#FBBF24" strokeWidth="2.2" />
      <path d="M108 150 L120 176 L132 150 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
      <path d="M114 152 L120 166 L126 152" fill="none" stroke="#CBD5E1" strokeWidth="1" />
    </g>
  );
  if (id === 'neck_medal') return (
    <g>
      <path d="M100 142 L114 172 L120 168 L106 142 Z" fill="#2563EB" />
      <path d="M140 142 L126 172 L120 168 L134 142 Z" fill="#DC2626" />
      <circle cx="120" cy="176" r="11" fill={`url(#${uid}-gold)`} stroke="#92400E" strokeWidth="1.3" style={{ filter: 'drop-shadow(0 0 5px rgba(251,191,36,0.8))' }} />
      <path d="M114 174 L126 174 M120 170 L120 182 M113 174 L111 179 L115 179 Z M127 174 L125 179 L129 179 Z" stroke="#92400E" strokeWidth="1.2" fill="#92400E" />
    </g>
  );
  return null;
}

function CosmeticHeld({ id }) {
  if (id === 'held_book') return (
    <g transform="translate(166 178) rotate(-14)">
      <rect x="-15" y="-19" width="30" height="36" rx="3" fill="#7C3AED" stroke="#4C1D95" strokeWidth="1.5" />
      <rect x="-12" y="-16" width="24" height="30" rx="2" fill="none" stroke="#FBBF24" strokeWidth="1.2" />
      <path d={star5(6)} fill="#FDE68A" transform="translate(0 -2)" />
      <rect x="12" y="-17" width="4" height="32" fill="#F5F3FF" />
    </g>
  );
  if (id === 'held_gavel') return (
    <g transform="translate(166 172) rotate(-35)">
      <rect x="-3" y="-4" width="6" height="36" rx="3" fill="#92400E" />
      <rect x="-14" y="-16" width="28" height="13" rx="4" fill="#B45309" stroke="#78350F" strokeWidth="1.3" />
      <rect x="-16" y="-15" width="4" height="11" rx="1.5" fill="#FBBF24" />
      <rect x="12" y="-15" width="4" height="11" rx="1.5" fill="#FBBF24" />
    </g>
  );
  if (id === 'held_quill') return (
    <g transform="translate(166 170) rotate(24)">
      <path d="M0 -34 C 12 -22, 12 0, 0 14 C -12 0, -12 -22, 0 -34 Z" fill="#F0ABFC" stroke="#A21CAF" strokeWidth="1.2" />
      <path d="M0 -30 L0 26" stroke="#A21CAF" strokeWidth="1.4" />
      <path d="M-2 22 L0 30 L2 22 Z" fill="#1F2937" />
    </g>
  );
  if (id === 'held_owl') return (
    <g transform="translate(186 192)"><g className="dg-owl" style={{ transformOrigin: '0px 16px' }}>
      <ellipse cx="0" cy="0" rx="15" ry="17" fill="#A16207" />
      <ellipse cx="0" cy="5" rx="10" ry="11" fill="#FDE68A" />
      <path d="M-13 -12 L-9 -22 L-4 -14 Z M13 -12 L9 -22 L4 -14 Z" fill="#A16207" />
      <circle cx="-6" cy="-6" r="6" fill="#FFF" /><circle cx="6" cy="-6" r="6" fill="#FFF" />
      <circle cx="-6" cy="-6" r="3.2" fill="#1F2937" /><circle cx="6" cy="-6" r="3.2" fill="#1F2937" />
      <circle cx="-5" cy="-7.5" r="1.1" fill="#FFF" /><circle cx="7" cy="-7.5" r="1.1" fill="#FFF" />
      <path d="M-2 0 L0 4 L2 0 Z" fill="#F97316" />
      <rect x="-14" y="-24" width="28" height="4" rx="1" fill="#111827" />
      <polygon points="-10,-24 0,-30 10,-24 0,-20" fill="#1F2937" />
    </g></g>
  );
  return null;
}

function CosmeticAura({ id, uid, animate }) {
  const spin = animate ? 'dg-spin-slow' : '';
  if (id === 'aura_stars') return (
    <g className={spin} style={{ transformOrigin: '120px 140px' }}>
      {Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 2;
        const x = 120 + Math.cos(a) * 98, y = 140 + Math.sin(a) * 82;
        return <g key={i} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
          <path d={star5(i % 2 ? 4 : 6)} fill={i % 3 ? '#FDE68A' : '#FFFFFF'} style={{ filter: 'drop-shadow(0 0 4px #FDE047)' }} />
        </g>;
      })}
    </g>
  );
  if (id === 'aura_fire') return (
    <g>
      <defs>
        <radialGradient id={`${uid}-fire`} cx="0.5" cy="0.7" r="0.6">
          <stop offset="0%" stopColor="#FDE047" stopOpacity="0.75" />
          <stop offset="45%" stopColor="#F97316" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#DC2626" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path className={animate ? 'dg-flame' : ''} style={{ transformOrigin: '120px 214px' }}
        d="M120 20 C 150 60, 200 70, 196 140 C 194 190, 160 216, 120 216 C 80 216, 46 190, 44 140 C 40 70, 90 60, 120 20 Z" fill={`url(#${uid}-fire)`} />
    </g>
  );
  if (id === 'aura_rainbow') return (
    <g className={spin} style={{ transformOrigin: '120px 140px' }} opacity="0.6">
      {['#F472B6', '#FBBF24', '#34D399', '#38BDF8', '#A78BFA'].map((c, i) => (
        <ellipse key={i} cx="120" cy="140" rx={96 - i * 5} ry={84 - i * 5} fill="none" stroke={c} strokeWidth="3.5"
          strokeDasharray={`${40 + i * 8} ${20 + i * 4}`} style={{ filter: `drop-shadow(0 0 4px ${c})` }} />
      ))}
    </g>
  );
  return null;
}

// ── Ovo (fases 1 e 2) ───────────────────────────────────────
function DragonEgg({ stage, p, uid, animate, sick, mood }) {
  const cracking = stage === 2;
  const eggPath = 'M120 50 C 84 50, 64 110, 68 150 C 72 186, 94 200, 120 200 C 146 200, 168 186, 172 150 C 176 110, 156 50, 120 50 Z';
  return (
    <g>
      <defs>
        <radialGradient id={`${uid}-shell`} cx="0.38" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor={p.body1} />
          <stop offset="100%" stopColor={p.body2} />
        </radialGradient>
        <radialGradient id={`${uid}-inner`} cx="0.5" cy="0.5">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
          <stop offset="45%" stopColor={p.gem} stopOpacity="0.8" />
          <stop offset="100%" stopColor={p.glow} stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${uid}-eggclip`}><path d={eggPath} /></clipPath>
      </defs>

      {/* Aura interna vazando */}
      <ellipse cx="120" cy="128" rx={cracking ? 88 : 72} ry={cracking ? 96 : 80} fill={`url(#${uid}-inner)`}
        opacity={cracking ? 0.75 : 0.45} className={animate ? 'dg-pulse' : ''} style={{ transformOrigin: '120px 128px' }} />

      {/* Ninho de livros */}
      <g>
        <ellipse cx="120" cy="222" rx="60" ry="6" fill="rgba(20,10,60,0.18)" />
        <rect x="62" y="204" width="116" height="14" rx="3" fill="#6D28D9" />
        <rect x="62" y="204" width="116" height="4" rx="2" fill="#8B5CF6" />
        <rect x="170" y="206" width="6" height="10" fill="#FDE68A" opacity="0.9" />
        <path d="M74 210 L160 210" stroke="#FBBF24" strokeWidth="1.2" opacity="0.8" />
        <rect x="74" y="192" width="92" height="13" rx="3" fill="#0EA5E9" />
        <rect x="74" y="192" width="92" height="4" rx="2" fill="#38BDF8" />
        <path d="M84 199 L156 199" stroke="#E0F2FE" strokeWidth="1.2" opacity="0.8" />
      </g>

      <g className={animate ? (cracking ? 'dg-egg-crack' : 'dg-egg-wobble') : ''} style={{ transformOrigin: '120px 196px' }}>
        <path d={eggPath} fill={`url(#${uid}-shell)`} stroke={p.accent} strokeWidth="1.6" strokeOpacity="0.35" />
        <g clipPath={`url(#${uid}-eggclip)`}>
          {/* manchas de dragão */}
          {[[92, 90, 9], [148, 104, 7], [100, 170, 8], [150, 160, 10], [124, 72, 5], [80, 132, 6]].map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill={p.glow} opacity="0.35" />
          ))}
          {/* faixa de runas */}
          <path d="M60 128 Q120 146 180 128" fill="none" stroke={p.rune} strokeWidth="9" opacity="0.12" />
          <g className={animate ? 'dg-rune-glow' : ''} style={{ filter: `drop-shadow(0 0 3px ${p.gem})` }}>
            {[76, 96, 118, 140, 162].map((x, i) => {
              const y = 128 + Math.sin(((x - 60) / 120) * Math.PI) * 9;
              const glyphs = [
                'M-3 -5 L-3 5 M-3 -5 L3 -1 L-3 2',
                'M0 -5 L0 5 M-4 -2 L4 2',
                'M-4 -4 L4 4 M4 -4 L-4 4 M0 -6 L0 6',
                'M-3 5 L0 -5 L3 5 M-2 1 L2 1',
                'M-4 0 A4 4 0 1 0 4 0 A4 4 0 1 0 -4 0 M0 -6 L0 6',
              ];
              return <path key={i} d={glyphs[i]} transform={`translate(${x} ${y.toFixed(1)})`} fill="none"
                stroke={cracking ? '#FFFFFF' : p.rune} strokeWidth="1.8" strokeLinecap="round" />;
            })}
          </g>
          {/* brilho especular */}
          <ellipse cx="98" cy="84" rx="12" ry="20" fill="#FFFFFF" opacity="0.55" transform="rotate(-20 98 84)" />
        </g>

        {cracking && (
          <g>
            <g style={{ filter: `drop-shadow(0 0 5px ${p.gem})` }}>
              <path d="M80 110 L92 120 L86 130 L100 138 L94 150" fill="none" stroke="#FFFBEB" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M160 100 L148 114 L158 124 L146 136" fill="none" stroke="#FFFBEB" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M112 178 L120 166 L128 178 L136 170" fill="none" stroke="#FFFBEB" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            {/* olhinho espiando */}
            <g className={animate ? 'dg-peek' : ''} style={{ transformOrigin: '122px 104px' }}>
              <path d="M104 96 L114 90 L124 96 L134 90 L142 100 L134 116 L110 116 Z" fill="#1B1340" />
              <ellipse cx="116" cy="105" rx="5.5" ry="6.5" fill={p.gem} />
              <ellipse cx="131" cy="105" rx="5.5" ry="6.5" fill={p.gem} />
              <circle cx="118" cy="102" r="2" fill="#FFF" /><circle cx="133" cy="102" r="2" fill="#FFF" />
            </g>
            {/* fragmentos flutuando */}
            {animate && [[70, 70, 0], [172, 78, 0.6], [60, 160, 1.1]].map(([x, y, d], i) => (
              <g key={i} transform={`translate(${x} ${y})`}>
                <path d="M-5 -3 L4 -5 L6 3 L-3 5 Z" fill={p.body1} stroke={p.accent} strokeWidth="0.8" strokeOpacity="0.4"
                  className="dg-shard" style={{ animationDelay: `${d}s` }} />
              </g>
            ))}
          </g>
        )}
      </g>

      {/* poeira mágica orbitando */}
      {animate && !sick && (
        <g className="dg-spin" style={{ transformOrigin: '120px 130px' }}>
          {[0, 1, 2, 3, 4, 5].map(i => {
            const a = i * Math.PI / 3;
            return <g key={i} transform={`translate(${(120 + Math.cos(a) * 82).toFixed(1)} ${(130 + Math.sin(a) * 70).toFixed(1)})`}>
              <path d={star4(i % 2 ? 3 : 5)} fill={i % 2 ? p.gem : '#FFFFFF'} style={{ filter: `drop-shadow(0 0 3px ${p.glow})` }} />
            </g>;
          })}
        </g>
      )}
      {mood === 'sleepy' && <DragonZzz x={160} y={66} />}
    </g>
  );
}

function DragonZzz({ x, y }) {
  return (
    <g fontFamily="Cormorant Garamond, serif" fontWeight="700" fill="#7C8CF8">
      <text x={x} y={y} fontSize="16" className="dg-zzz">z</text>
      <text x={x + 12} y={y - 14} fontSize="12" className="dg-zzz" style={{ animationDelay: '0.8s' }}>z</text>
      <text x={x + 22} y={y - 26} fontSize="9" className="dg-zzz" style={{ animationDelay: '1.6s' }}>z</text>
    </g>
  );
}

// ── Olhos por humor ──────────────────────────────────────────
function DragonEyes({ mood, p, uid, animate }) {
  const eyes = [96, 144];
  if (mood === 'ecstatic' || mood === 'eating') {
    return (
      <g>
        {eyes.map(x => <path key={x} d={`M${x - 11} 101 Q${x} 86 ${x + 11} 101`} fill="none" stroke="#1B1340" strokeWidth="4.2" strokeLinecap="round" />)}
      </g>
    );
  }
  if (mood === 'sleepy') {
    return (
      <g>
        {eyes.map(x => <path key={x} d={`M${x - 11} 96 Q${x} 106 ${x + 11} 96`} fill="none" stroke="#1B1340" strokeWidth="3.6" strokeLinecap="round" />)}
        {eyes.map(x => <path key={'l' + x} d={`M${x + 8} 99 L${x + 13} 103`} stroke="#1B1340" strokeWidth="2" strokeLinecap="round" />)}
      </g>
    );
  }
  if (mood === 'love') {
    return (
      <g>
        {eyes.map(x => (
          <g key={x} transform={`translate(${x} 98) scale(2.6)`}>
            <path d={heartPath} fill="#F43F5E" stroke="#9F1239" strokeWidth="0.5" className={animate ? 'dg-heartbeat' : ''} style={{ transformOrigin: '0px 0px' }} />
          </g>
        ))}
      </g>
    );
  }
  const sick = mood === 'sick';
  const ry = sick ? 11 : 14.5;
  const lookY = mood === 'hungry' ? -3 : 0;
  return (
    <g className={animate && !sick ? 'dg-blink' : ''} style={{ transformOrigin: '120px 97px' }}>
      {eyes.map((x, i) => (
        <g key={x}>
          <ellipse cx={x} cy="97" rx="13" ry={ry + 1} fill="#1B1340" />
          <ellipse cx={x} cy="97.5" rx="11.2" ry={ry - 0.6} fill={`url(#${uid}-iris)`} />
          <g className="dg-pupil" style={{ transform: `translate(calc(var(--dg-px, 0) * 3.2px), calc(var(--dg-py, 0) * 3px + ${lookY}px))` }}>
            <ellipse cx={x} cy="98" rx={sick ? 4 : 5.6} ry={sick ? 5 : 7.4} fill="#0D0724" />
            <circle cx={x + 4.2} cy={sick ? 93 : 91.5} r={sick ? 2.6 : 4.2} fill="#FFFFFF" />
            <path d={star4(2.6)} transform={`translate(${x - 4} 103.5)`} fill="#FFFFFF" opacity="0.95" />
            {mood === 'excited' && <path d={star4(2.6)} transform={`translate(${x - 3.5} 94)`} fill="#FFF" />}
          </g>
          {sick && <path d={`M${x - 13} ${i ? 82 : 86} L${x + 13} ${i ? 86 : 82}`} stroke="#1B1340" strokeWidth="2.4" strokeLinecap="round" />}
        </g>
      ))}
    </g>
  );
}

function DragonMouth({ mood, animate }) {
  if (mood === 'ecstatic' || mood === 'love' || mood === 'excited') return (
    <g>
      <path d="M106 122 Q120 142 134 122 Z" fill="#5B1A3A" stroke="#1B1340" strokeWidth="2" strokeLinejoin="round" />
      <ellipse cx="120" cy="132" rx="7" ry="4" fill="#FB7185" />
      <path d="M110 123 L113 128 L116 123 Z" fill="#FFF" />
    </g>
  );
  if (mood === 'eating') return (
    <g className={animate ? 'dg-chomp' : ''} style={{ transformOrigin: '120px 126px' }}>
      <ellipse cx="120" cy="127" rx="10" ry="6" fill="#5B1A3A" stroke="#1B1340" strokeWidth="2" />
      <circle cx="126" cy="126" r="2.5" fill="#FDE68A" />
    </g>
  );
  if (mood === 'hungry') return (
    <g>
      <ellipse cx="120" cy="127" rx="5.5" ry="6" fill="#5B1A3A" stroke="#1B1340" strokeWidth="2" />
      <path d="M131 126 Q133 133 131 137 Q129 133 131 126 Z" fill="#93C5FD" className={animate ? 'dg-drool' : ''} />
    </g>
  );
  if (mood === 'sick') return (
    <path d="M108 128 Q113 123 118 128 Q123 133 128 128 Q131 125 133 127" fill="none" stroke="#1B1340" strokeWidth="2.2" strokeLinecap="round" />
  );
  if (mood === 'sleepy') return (
    <g>
      <path d="M113 126 Q120 130 127 126" fill="none" stroke="#1B1340" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="134" cy="118" r="5" fill="rgba(191,219,254,0.7)" stroke="#93C5FD" strokeWidth="1" className={animate ? 'dg-bubble' : ''} style={{ transformOrigin: '134px 120px' }} />
    </g>
  );
  // feliz: boquinha "w" com presinha
  return (
    <g>
      <path d="M108 123 Q114 130 120 124 Q126 130 132 123" fill="none" stroke="#1B1340" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M124 125.5 L126.5 131 L129 125" fill="#FFF" stroke="#1B1340" strokeWidth="0.9" strokeLinejoin="round" />
    </g>
  );
}

// ── Sprite principal ─────────────────────────────────────────
function DragonSprite({
  stage = 1, mood = 'happy', equipped = {}, size = 140, animate = true, track = false,
  onClick, svgRef, showFamiliars = true, style,
}) {
  const rawId = React.useId ? React.useId() : String(Math.random());
  const uid = 'dg' + rawId.replace(/[^a-zA-Z0-9]/g, '');
  const localRef = React.useRef(null);
  const ref = svgRef || localRef;
  const info = DRAGON_STAGES[Math.max(0, Math.min(7, stage - 1))];
  const eq = equipped || {};
  // Pele equipada (loja) sobrepõe a paleta da fase — ver dragon-plus.jsx
  const p = eq.skin && window.dragonSkinPalette ? window.dragonSkinPalette(eq.skin, info) : info.pal;
  const sick = mood === 'sick';

  // Olhos seguem o ponteiro (sem re-render: só variáveis CSS)
  React.useEffect(() => {
    if (!track || !animate) return;
    let raf = 0;
    const onMove = (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const el = ref.current; if (!el) return;
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height * 0.4;
        const dx = (e.clientX - cx) / (window.innerWidth / 2);
        const dy = (e.clientY - cy) / (window.innerHeight / 2);
        el.style.setProperty('--dg-px', Math.max(-1, Math.min(1, dx * 1.6)).toFixed(3));
        el.style.setProperty('--dg-py', Math.max(-1, Math.min(1, dy * 1.6)).toFixed(3));
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => { window.removeEventListener('pointermove', onMove); if (raf) cancelAnimationFrame(raf); };
  }, [track, animate]);

  const A = (cls) => (animate ? cls : '');
  const commonDefs = (
    <defs>
      <linearGradient id={`${uid}-gold`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FEF3C7" /><stop offset="50%" stopColor="#FBBF24" /><stop offset="100%" stopColor="#B45309" />
      </linearGradient>
      <radialGradient id={`${uid}-aura`} cx="0.5" cy="0.5">
        <stop offset="0%" stopColor={p.glow} stopOpacity="0.55" />
        <stop offset="55%" stopColor={p.glow} stopOpacity="0.14" />
        <stop offset="100%" stopColor={p.glow} stopOpacity="0" />
      </radialGradient>
    </defs>
  );

  const svgStyle = {
    overflow: 'visible', cursor: onClick ? 'pointer' : 'default', display: 'block',
    filter: sick ? 'saturate(0.45) brightness(0.96)' : undefined, ...style,
  };

  if (stage <= 2) {
    return (
      <svg ref={ref} viewBox="0 0 240 240" width={size} height={size} style={svgStyle} onClick={onClick}
        xmlns="http://www.w3.org/2000/svg" aria-label={info.name}>
        {commonDefs}
        {eq.aura && <CosmeticAura id={eq.aura} uid={uid} animate={animate} />}
        <DragonEgg stage={stage} p={p} uid={uid} animate={animate} sick={sick} mood={mood} />
      </svg>
    );
  }

  const scale = { 3: 0.8, 4: 0.86, 5: 0.92, 6: 0.96, 7: 1.0, 8: 1.02 }[stage];
  const wingScale = { 3: 0.34, 4: 0.62, 5: 0.82, 6: 0.98, 7: 1.08, 8: 1.24 }[stage];
  const hornScale = { 3: 0, 4: 0.6, 5: 0.8, 6: 0.95, 7: 1.12, 8: 1.22 }[stage];
  const hasRunes = stage >= 6;
  const shellCap = stage === 3 && !eq.hat;
  const crownOfStars = stage === 8 && !eq.hat;

  const wing = (side) => {
    const flip = side === 'r';
    const ox = flip ? 148 : 92;
    return (
      <g transform={`translate(${ox} 150) scale(${flip ? -wingScale : wingScale} ${wingScale})`}>
        <g className={A(stage === 3 ? 'dg-wing-tiny' : 'dg-wing')} style={{ transformOrigin: '0px 0px', animationDelay: flip ? '0.05s' : '0s' }}>
          <path d="M4 4 C -8 -30, -34 -58, -70 -66 C -64 -50, -66 -40, -74 -28 C -60 -28, -52 -20, -50 -10 C -40 -14, -32 -8, -28 2 C -18 -2, -8 2, 4 14 Z"
            fill={`url(#${uid}-wing)`} stroke={p.accent} strokeWidth="2" strokeLinejoin="round" />
          {p.starWings && [[-40, -40, 2.2], [-54, -30, 1.6], [-30, -24, 1.4], [-58, -50, 1.8], [-22, -12, 1.2], [-44, -18, 1.3]].map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill="#FFFFFF" opacity={0.85} className={A('dg-twinkle')} style={{ animationDelay: `${i * 0.35}s`, transformOrigin: `${x}px ${y}px` }} />
          ))}
          {p.galaxy && <path d="M-58 -50 L-40 -40 L-44 -18 L-22 -12" fill="none" stroke="#FFFFFF" strokeWidth="0.7" opacity="0.6" />}
          <path d="M2 2 Q -30 -34 -70 -66 M-8 -8 L-74 -28 M-12 -4 L-50 -10 M-8 0 L-28 2" fill="none" stroke={p.accent} strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
        </g>
      </g>
    );
  };

  return (
    <svg ref={ref} viewBox="0 0 240 240" width={size} height={size} style={svgStyle} onClick={onClick}
      xmlns="http://www.w3.org/2000/svg" aria-label={info.name}>
      {commonDefs}
      <defs>
        <radialGradient id={`${uid}-body`} cx="0.36" cy="0.28" r="0.85">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="22%" stopColor={p.body1} />
          <stop offset="100%" stopColor={p.body2} />
        </radialGradient>
        <radialGradient id={`${uid}-belly`} cx="0.5" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor={p.belly} />
          <stop offset="100%" stopColor={p.belly2} />
        </radialGradient>
        <linearGradient id={`${uid}-horn`} x1="0" y1="1" x2="0.3" y2="0">
          <stop offset="0%" stopColor={p.horn2} />
          <stop offset="70%" stopColor={p.horn1} />
          <stop offset="100%" stopColor="#FFFFFF" />
        </linearGradient>
        <linearGradient id={`${uid}-wing`} x1="1" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={p.wing1} />
          <stop offset="100%" stopColor={p.wing2} />
        </linearGradient>
        <radialGradient id={`${uid}-iris`} cx="0.5" cy="0.65" r="0.7">
          <stop offset="0%" stopColor={p.gem} />
          <stop offset="55%" stopColor={p.accent} />
          <stop offset="100%" stopColor="#1B1340" />
        </radialGradient>
        <radialGradient id={`${uid}-gem`} cx="0.35" cy="0.3">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="45%" stopColor={p.gem} />
          <stop offset="100%" stopColor={p.accent} />
        </radialGradient>
      </defs>

      {/* Aura lendária */}
      {stage === 8 && (
        <g>
          <circle cx="120" cy="130" r="112" fill={`url(#${uid}-aura)`} className={A('dg-pulse')} style={{ transformOrigin: '120px 130px' }} />
          <g className={A('dg-spin-slow')} style={{ transformOrigin: '120px 130px' }} opacity="0.28">
            {Array.from({ length: 12 }).map((_, i) => (
              <path key={i} d="M120 130 L116.5 12 L123.5 12 Z" fill="#FFFBEB" transform={`rotate(${i * 30 + 15} 120 130)`} />
            ))}
          </g>
        </g>
      )}
      {eq.aura && <CosmeticAura id={eq.aura} uid={uid} animate={animate} />}

      {/* Círculo mágico sob os pés */}
      {hasRunes && (
        <g style={{ filter: `drop-shadow(0 0 4px ${p.gem})` }}>
          <ellipse cx="120" cy="216" rx="74" ry="13" fill="none" stroke={p.gem} strokeWidth="1.8" strokeDasharray="10 6" className={A('dg-dash')} opacity="0.85" />
          <ellipse cx="120" cy="216" rx="58" ry="9" fill="none" stroke={p.glow} strokeWidth="1" opacity="0.7" />
          {[0, 1, 2, 3, 4, 5].map(i => {
            const a = i * Math.PI / 3 + 0.3;
            return <circle key={i} cx={(120 + Math.cos(a) * 66).toFixed(1)} cy={(216 + Math.sin(a) * 11).toFixed(1)} r="2" fill="#FFF" />;
          })}
        </g>
      )}

      {/* Sombra */}
      <ellipse cx="120" cy="218" rx={46 * scale} ry="6" fill="rgba(20,10,60,0.2)" className={A('dg-shadow')} style={{ transformOrigin: '120px 218px' }} />

      <g className={A(sick ? 'dg-tremble' : 'dg-float')} style={{ transformOrigin: '120px 214px' }}>
        <g transform={`translate(120 214) scale(${scale}) translate(-120 -214)`}>

          {/* Asas */}
          {wing('l')}
          {wing('r')}

          {/* Cauda com chama arcana */}
          <g className={A('dg-tail')} style={{ transformOrigin: '150px 192px' }}>
            <path d="M146 178 C 172 198, 200 194, 206 170 C 209 156, 201 146, 193 148 C 197 158, 194 176, 178 182 C 166 186, 156 188, 150 200 Z"
              fill={`url(#${uid}-body)`} stroke={p.accent} strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M176 186 L180 178 M188 180 L194 174 M198 168 L204 164" stroke={p.belly2} strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />
            <g transform="translate(194 144)">
              <g className={A('dg-flicker')} style={{ transformOrigin: '0px 4px', filter: `drop-shadow(0 0 6px ${p.gem})` }}>
                <path d="M0 -16 C 7 -8, 10 -2, 6 6 C 4 10, -4 10, -6 6 C -10 -2, -6 -8, 0 -16 Z" fill={p.gem} />
                <path d="M0 -6 C 3 -2, 4 1, 2 5 C 1 7, -2 7, -3 5 C -4 1, -2 -2, 0 -6 Z" fill="#FFFFFF" />
              </g>
            </g>
          </g>

          {/* Corpo */}
          <ellipse cx="120" cy="174" rx="42" ry="37" fill={`url(#${uid}-body)`} stroke={p.accent} strokeWidth="2" />
          <path d="M150 150 Q162 168 158 190" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.25" />
          <ellipse cx="120" cy="182" rx="27" ry="25" fill={`url(#${uid}-belly)`} />
          <path d="M98 172 Q120 180 142 172 M96 184 Q120 193 144 184 M100 196 Q120 204 140 196" fill="none" stroke={p.belly2} strokeWidth="1.6" strokeLinecap="round" />

          {/* Runas nas escamas */}
          {hasRunes && (
            <g className={A('dg-rune-glow')} style={{ filter: `drop-shadow(0 0 3px ${p.gem})` }}>
              <path d="M86 164 L90 172 L86 180 M84 172 L92 172" transform="translate(-2 0)" fill="none" stroke={p.gem} strokeWidth="1.6" strokeLinecap="round" />
              <path d="M152 166 L156 176 M150 172 A4 4 0 1 0 158 172" fill="none" stroke={p.gem} strokeWidth="1.6" strokeLinecap="round" />
            </g>
          )}

          {/* Toga (acessório de pescoço grande fica sobre o corpo) */}
          {eq.neck === 'neck_toga' && <CosmeticNeck id={eq.neck} uid={uid} />}

          {/* Pés com "feijõezinhos" */}
          {[98, 142].map(x => (
            <g key={x}>
              <ellipse cx={x} cy="208" rx="15" ry="9.5" fill={p.body2} stroke={p.accent} strokeWidth="1.6" />
              {[-6, 0, 6].map(dx => <circle key={dx} cx={x + dx} cy="212" r="2.6" fill={p.belly} opacity="0.95" />)}
            </g>
          ))}

          {/* Bracinhos */}
          <g className={A(mood === 'ecstatic' || mood === 'excited' ? 'dg-wave' : '')} style={{ transformOrigin: '90px 166px' }}>
            <ellipse cx="84" cy="178" rx="9" ry="14" fill={`url(#${uid}-body)`} stroke={p.accent} strokeWidth="1.6" transform="rotate(28 84 178)" />
          </g>
          <ellipse cx="156" cy="178" rx="9" ry="14" fill={`url(#${uid}-body)`} stroke={p.accent} strokeWidth="1.6" transform="rotate(-28 156 178)" />

          {eq.neck && eq.neck !== 'neck_toga' && <CosmeticNeck id={eq.neck} uid={uid} />}
          {eq.held && eq.held !== 'held_owl' && <CosmeticHeld id={eq.held} />}

          {/* Cabeça */}
          <g className={A('dg-head')} style={{ transformOrigin: '120px 140px' }}>
            {/* Barbatanas/orelhas */}
            {[false, true].map(flip => {
              const d = 'M72 82 C 56 70, 42 72, 36 84 C 48 84, 50 90, 44 98 C 56 97, 60 102, 58 112 C 66 104, 72 98, 76 94 Z';
              return (
                <g key={String(flip)} transform={flip ? 'translate(240 0) scale(-1 1)' : undefined}>
                  <g className={A('dg-ear')} style={{ transformOrigin: '74px 90px', animationDelay: flip ? '0.3s' : '0s' }}>
                    <path d={d} fill={`url(#${uid}-wing)`} stroke={p.accent} strokeWidth="1.8" strokeLinejoin="round" />
                    <path d="M70 86 L44 84 M70 92 L48 98" stroke={p.accent} strokeWidth="1.2" opacity="0.6" />
                  </g>
                </g>
              );
            })}

            {/* Chifres de cristal */}
            {hornScale > 0 && [false, true].map(flip => (
              <g key={'h' + flip} transform={flip ? 'translate(240 0) scale(-1 1)' : undefined}>
                <g transform={`translate(96 64) scale(${hornScale}) translate(-96 -64)`}>
                  <path d="M88 66 C 84 50, 80 38, 76 24 C 88 32, 98 46, 104 60 Z" fill={`url(#${uid}-horn)`} stroke={p.accent} strokeWidth="1.6" strokeLinejoin="round" />
                  <path d="M86 56 C 84 46, 82 40, 80 32" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
                </g>
              </g>
            ))}

            {/* Topete */}
            <path d="M104 58 Q106 40 116 50 Q120 32 126 50 Q136 40 136 58 Z" fill={p.body1} stroke={p.accent} strokeWidth="1.6" strokeLinejoin="round" />

            {/* Cabeça */}
            <ellipse cx="120" cy="100" rx="55" ry="47" fill={`url(#${uid}-body)`} stroke={p.accent} strokeWidth="2" />
            <ellipse cx="102" cy="72" rx="18" ry="9" fill="#FFFFFF" opacity="0.35" transform="rotate(-18 102 72)" />
            <path d="M160 72 Q174 92 172 116" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.28" />
            {[[146, 64, 5, 3.4], [156, 74, 3.4, 2.4], [84, 70, 3.6, 2.4]].map(([x, y, rx, ry], i) => (
              <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill={p.body2} opacity="0.32" transform={`rotate(${i === 2 ? 20 : -25} ${x} ${y})`} />
            ))}

            {/* Joia da sabedoria */}
            <g transform="translate(120 68)">
              <g className={A('dg-gem')} style={{ transformOrigin: '0px 0px', filter: `drop-shadow(0 0 6px ${p.gem})` }}>
                <path d="M0 -9 L7 0 L0 9 L-7 0 Z" fill={`url(#${uid}-gem)`} stroke="#FFFFFF" strokeWidth="1" />
                <path d="M0 -9 L2 0 L0 9" fill="none" stroke="#FFFFFF" strokeWidth="0.7" opacity="0.7" />
              </g>
            </g>

            {/* Focinho */}
            <ellipse cx="120" cy="121" rx="23" ry="14" fill={`url(#${uid}-belly)`} opacity="0.95" />
            <ellipse cx="113" cy="115" rx="2.2" ry="1.6" fill={p.body2} opacity="0.7" />
            <ellipse cx="127" cy="115" rx="2.2" ry="1.6" fill={p.body2} opacity="0.7" />

            {/* Bochechas */}
            {!sick && <>
              <ellipse cx="78" cy="116" rx="10" ry="6" fill="#FB7185" opacity="0.35" />
              <ellipse cx="162" cy="116" rx="10" ry="6" fill="#FB7185" opacity="0.35" />
            </>}

            <DragonEyes mood={mood} p={p} uid={uid} animate={animate} />
            <DragonMouth mood={mood} animate={animate} />

            {eq.face && <CosmeticFace id={eq.face} />}

            {/* Casca de ovo como chapéu (filhote) */}
            {shellCap && (
              <g className={A('dg-shell-cap')} style={{ transformOrigin: '120px 60px' }}>
                <path d="M80 64 C 82 42, 100 30, 120 30 C 140 30, 158 42, 160 64 L152 56 L145 66 L137 56 L129 65 L121 55 L113 65 L105 56 L97 66 L89 57 Z"
                  fill="#FFF8EC" stroke="#C4B5FD" strokeWidth="1.6" strokeLinejoin="round" />
                <circle cx="104" cy="44" r="4" fill="#C4B5FD" opacity="0.5" />
                <circle cx="136" cy="48" r="3" fill="#C4B5FD" opacity="0.5" />
                <ellipse cx="108" cy="40" rx="6" ry="3" fill="#FFF" opacity="0.8" transform="rotate(-20 108 40)" />
              </g>
            )}

            {/* Coroa de estrelas (lendário) */}
            {crownOfStars && (
              <g className={A('dg-halo')} style={{ transformOrigin: '120px 40px' }}>
                {[-2, -1, 0, 1, 2].map(k => {
                  const x = 120 + k * 17, y = 40 + Math.abs(k) * 6;
                  return <g key={k} transform={`translate(${x} ${y})`}>
                    <path d={star5(k === 0 ? 8 : 5.5)} fill={k === 0 ? '#FFE08A' : '#FFF7D6'} style={{ filter: 'drop-shadow(0 0 5px #FFD166)' }} />
                  </g>;
                })}
              </g>
            )}

            {eq.hat && <CosmeticHat id={eq.hat} uid={uid} />}
          </g>

          {eq.held === 'held_owl' && <CosmeticHeld id="held_owl" />}
        </g>
      </g>

      {/* Familiares mágicos (por fase) */}
      {showFamiliars && stage === 4 && (
        <g transform="translate(34 120)">
          <g className={A('dg-familiar')} style={{ transformOrigin: '0px 0px' }}>
            <path d="M0 -24 C 9 -15, 9 0, 0 10 C -9 0, -9 -15, 0 -24 Z" fill="#F5D0FE" stroke={p.accent} strokeWidth="1.2" transform="rotate(30)" />
            <path d="M0 -20 L0 16" stroke={p.accent} strokeWidth="1.2" transform="rotate(30)" />
            {animate && [0, 1, 2].map(i => <circle key={i} cx={8 + i * 5} cy={18 + i * 3} r={1.6 - i * 0.4} fill={p.gem} className="dg-twinkle" style={{ animationDelay: `${i * 0.3}s`, transformOrigin: `${8 + i * 5}px ${18 + i * 3}px` }} />)}
          </g>
        </g>
      )}
      {showFamiliars && stage >= 5 && (
        <g transform="translate(34 132)">
          <g className={A('dg-familiar')} style={{ transformOrigin: '0px 0px' }}>
            <path d="M-20 -6 Q-10 -12 0 -6 Q10 -12 20 -6 L20 12 Q10 6 0 12 Q-10 6 -20 12 Z" fill="#FFFBEB" stroke="#92400E" strokeWidth="1.3" />
            <path d="M0 -6 L0 12" stroke="#92400E" strokeWidth="1.1" />
            <path d="M-16 -1 L-4 -3 M-16 3 L-4 1 M4 -3 L16 -1 M4 1 L16 3" stroke="#A8A29E" strokeWidth="1" />
            <ellipse cx="0" cy="-8" rx="16" ry="7" fill={p.glow} opacity="0.5" style={{ filter: 'blur(4px)' }} />
            <g transform="translate(-9 -16)"><path d={star4(3)} fill="#FFFFFF" className={A('dg-twinkle')} style={{ transformOrigin: '0px 0px' }} /></g>
            <g transform="translate(10 -20)"><path d={star4(2.2)} fill={p.gem} className={A('dg-twinkle')} style={{ transformOrigin: '0px 0px', animationDelay: '0.6s' }} /></g>
            {animate && ['§', 'Art', '⚖'].map((t, i) => (
              <text key={i} x={-8 + i * 7} y={-10} fontSize="7" fill={p.accent} fontWeight="700" className="dg-letter" style={{ animationDelay: `${i * 0.7}s` }}>{t}</text>
            ))}
          </g>
        </g>
      )}
      {showFamiliars && stage >= 7 && (
        <g className={A('dg-orbit')} style={{ transformOrigin: '120px 130px' }}>
          {[['#38BDF8', 0], ['#F472B6', 2.1], ['#FBBF24', 4.2]].map(([c, a], i) => (
            <circle key={i} cx={(120 + Math.cos(a) * 104).toFixed(1)} cy={(130 + Math.sin(a) * 36).toFixed(1)} r="7"
              fill={c} stroke="#FFF" strokeWidth="1.5" style={{ filter: `drop-shadow(0 0 7px ${c})` }} />
          ))}
        </g>
      )}

      {/* Brilhos (fase 6+ ou extasiado) */}
      {!sick && (stage >= 6 || mood === 'ecstatic' || mood === 'excited') && animate && (
        [[36, 60], [206, 64], [28, 170], [214, 176], [60, 30], [184, 26]].map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            <path d={star4(i % 2 ? 4 : 6)} fill={i % 2 ? p.gem : '#FFFFFF'} className="dg-twinkle"
              style={{ animationDelay: `${i * 0.4}s`, transformOrigin: '0px 0px', filter: `drop-shadow(0 0 4px ${p.glow})` }} />
          </g>
        ))
      )}

      {/* Efeitos de humor */}
      {mood === 'sleepy' && <DragonZzz x={172} y={60} />}
      {mood === 'love' && animate && [0, 1, 2, 3].map(i => (
        <g key={i} transform={`translate(${70 + i * 32} 60)`}>
          <g transform="scale(2)"><path d={heartPath} fill="#F43F5E" className="dg-heart-rise" style={{ animationDelay: `${i * 0.25}s` }} /></g>
        </g>
      ))}
      {sick && (
        <g>
          <path d="M70 70 Q67 77 70 82 Q73 77 70 70 Z" fill="#7EC8E3" stroke="#3A8EB8" strokeWidth="0.8" className={A('dg-sweat')} />
          <g transform="translate(166 132) rotate(30)">
            <rect x="-3" y="-18" width="6" height="26" rx="3" fill="#FFF" stroke="#94A3B8" strokeWidth="1" />
            <circle cx="0" cy="10" r="5" fill="#EF4444" /><rect x="-1.2" y="-8" width="2.4" height="16" fill="#EF4444" />
          </g>
        </g>
      )}
    </svg>
  );
}

window.DRAGON_STAGES = DRAGON_STAGES;
window.evaluateDragon = evaluateDragon;
window.getDragonStage = getDragonStage;
window.DragonSprite = DragonSprite;
window.dragonStar5 = star5;
window.dragonStar4 = star4;
