// TOGA — Dragão da Sabedoria (tamagotchi)
// • Sprite SVG paramétrico: 8 fases (ovo arcano → dragão lendário), 5 peles, chapéus,
//   acessórios de rosto e pescoço. Cada fase ganha itens de estudo (livro, pena, orbe,
//   pergaminho, livro dourado), chifres, asas maiores, runas orbitando e aura.
// • Vivo: respira, pisca, balança a cauda, bate as asas, olhos seguem o cursor,
//   reage ao carinho (corações + ronronar), fica tonto com cliques rápidos.
// • Conectado ao app: Chama (horas de hoje), Sabedoria (questões + flashcards),
//   Vínculo (constância). Humor e a chama na ponta da cauda refletem seus estudos.

(function () {
  const { useState, useEffect, useRef, useMemo } = React;
  const GM = window.GM;

  // ════════════════════════════════════════════════════════════
  //  DADOS
  // ════════════════════════════════════════════════════════════
  const DRAGON_STAGES = [
    { id: 1, name: 'Ovo Arcano',        desc: 'Um ovo selado com runas antigas. Lá dentro, uma mente brilhante aguarda o seu primeiro estudo.' },
    { id: 2, name: 'Ovo Desperto',      desc: 'As runas pulsam! Cada hora estudada racha um pouco mais a casca.' },
    { id: 3, name: 'Filhote Faísca',    desc: 'Eclodiu! Curioso, faminto por conhecimento — e ainda com um pedacinho de casca na cabeça.' },
    { id: 4, name: 'Aprendiz de Runas', desc: 'Primeiros chifres e o primeiro livro nas patas. Aprender virou hábito.' },
    { id: 5, name: 'Erudito',           desc: 'Asas firmes e pena mágica. Lê, anota e revisa como um verdadeiro estudioso.' },
    { id: 6, name: 'Arcanista',         desc: 'Domina a magia da estratégia: runas orbitam seus pensamentos.' },
    { id: 7, name: 'Sábio Ancestral',   desc: 'Veste a toga do saber. Sua calma é de quem já estudou muito.' },
    { id: 8, name: 'Dragão Lendário',   desc: 'A forma final. Uma lenda viva da sabedoria — pronto para a aprovação.' },
  ].map((s, i) => ({ ...s, minXp: GM.STAGE_XP[i] }));

  const SKINS = {
    ametista:  { name: 'Ametista',       price: 0,   body: ['#D9CBFF', '#8B5CF6', '#4C1D95'], belly: ['#FFF4DE', '#F8CB8E'], horn: ['#FFF6D1', '#E2A83E'], crest: ['#8BEBFF', '#1FB5DD'], wing: ['#8BEBFF', '#A78BFA', '#5B21B6'], eye: ['#2A0866', '#7C3AED'], iris: '#67E8F9', blush: '#F9A8D4', flame: ['#FFF8D6', '#FDBA74', '#F472B6'], line: '#2E1065' },
    aurora:    { name: 'Aurora Boreal',  price: 100, body: ['#CCFFF3', '#2DD4BF', '#0F5F59'], belly: ['#FFFBEA', '#FDE68A'], horn: ['#FFFFFF', '#A5B4FC'], crest: ['#F5B8FF', '#C026D3'], wing: ['#F5B8FF', '#67E8F9', '#0E7490'], eye: ['#06302E', '#0D9488'], iris: '#F0ABFC', blush: '#FDA4AF', flame: ['#ECFEFF', '#67E8F9', '#A78BFA'], line: '#083D39' },
    obsidiana: { name: 'Obsidiana Real', price: 150, body: ['#7C74A8', '#2E2748', '#0F0B1E'], belly: ['#FFF1B8', '#D4A017'], horn: ['#FFF6D1', '#D4A017'], crest: ['#FDE68A', '#D4A017'], wing: ['#FDE68A', '#7C3AED', '#1E1B4B'], eye: ['#150A2C', '#5B21B6'], iris: '#FDE68A', blush: '#C084FC', flame: ['#FFFBEB', '#FDE68A', '#F59E0B'], line: '#07040F' },
    solar:     { name: 'Chama Solar',    price: 150, body: ['#FFEDB8', '#FB923C', '#B93A0B'], belly: ['#FFFDF2', '#FDE68A'], horn: ['#FFFFFF', '#FCD34D'], crest: ['#FDE047', '#EF4444'], wing: ['#FEF08A', '#FB7185', '#9F1239'], eye: ['#3F1206', '#9A3412'], iris: '#FDE047', blush: '#FB7185', flame: ['#FFFBEB', '#FDE047', '#EF4444'], line: '#6B1D07' },
    quartzo:   { name: 'Quartzo Rosa',   price: 100, body: ['#FFE6F3', '#F472B6', '#8E1450'], belly: ['#FFF8EF', '#FED7AA'], horn: ['#FFFFFF', '#FBCFE8'], crest: ['#D4C8FF', '#8B5CF6'], wing: ['#D4C8FF', '#F9A8D4', '#BE185D'], eye: ['#43031F', '#9D174D'], iris: '#C4B5FD', blush: '#FDA4AF', flame: ['#FFF1F2', '#F9A8D4', '#A78BFA'], line: '#5C0A30' },
  };

  const WARDROBE = [
    { id: 'capelo',   slot: 'hat',  name: 'Capelo de Formatura',   icon: '🎓', price: 40,  desc: 'Para quem já se vê aprovado.' },
    { id: 'mago',     slot: 'hat',  name: 'Chapéu de Arquimago',   icon: '🧙', price: 90,  desc: 'Estrelas bordadas à mão.' },
    { id: 'louros',   slot: 'hat',  name: 'Coroa de Louros',       icon: '🌿', price: 120, desc: 'A glória dos grandes sábios.' },
    { id: 'oculos',   slot: 'face', name: 'Óculos de Leitura',     icon: '👓', price: 30,  desc: 'Lê letra miúda de edital.' },
    { id: 'monoculo', slot: 'face', name: 'Monóculo Dourado',      icon: '🧐', price: 60,  desc: 'Elegância jurídica.' },
    { id: 'gravata',  slot: 'neck', name: 'Gravata-Borboleta',     icon: '🎀', price: 25,  desc: 'Pronto para a posse.' },
    { id: 'cachecol', slot: 'neck', name: 'Cachecol da Biblioteca', icon: '🧣', price: 35, desc: 'Quentinho nas madrugadas de estudo.' },
    { id: 'medalha',  slot: 'neck', name: 'Medalha de Honra',      icon: '🏅', price: 70,  desc: 'Mérito acadêmico.' },
  ].concat(Object.entries(SKINS).map(([id, s]) => ({ id, slot: 'skin', name: s.name, icon: '🎨', price: s.price, desc: 'Pele mágica exclusiva.' })));

  const STAGE_CFG = {
    3: { sc: 0.80, ws: 0.38, hs: 0,    runes: 0, item: null },
    4: { sc: 0.86, ws: 0.58, hs: 0.55, runes: 0, item: 'book' },
    5: { sc: 0.90, ws: 0.78, hs: 0.72, runes: 2, item: 'book', quill: true },
    6: { sc: 0.94, ws: 0.98, hs: 0.86, runes: 3, item: 'orb', gem: true },
    7: { sc: 0.97, ws: 1.08, hs: 1.0,  runes: 4, item: 'scroll', gem: true, cape: true },
    8: { sc: 1.00, ws: 1.22, hs: 1.1,  runes: 6, item: 'goldbook', gem: true, cape: true, halo: true, rays: true },
  };
  const RUNE_POS = [[34, 86, 'ᚨ'], [206, 78, 'ᛟ'], [24, 158, '§'], [216, 148, 'ᚱ'], [52, 44, '✦'], [190, 34, '⚖']];

  // ════════════════════════════════════════════════════════════
  //  SPRITE
  // ════════════════════════════════════════════════════════════
  function StarPath({ x, y, r, fill, className, style }) {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      const rr = i % 2 === 0 ? r : r * 0.45;
      pts.push(`${(x + Math.cos(a) * rr).toFixed(2)},${(y + Math.sin(a) * rr).toFixed(2)}`);
    }
    return <polygon points={pts.join(' ')} fill={fill} className={className} style={style} />;
  }

  function Eye({ cx, cy, side, mood, P, uid, animated, exportMode, delay }) {
    const closed = mood === 'excited' || mood === 'dizzy';
    const lid = mood === 'sleepy' ? 'M-17 -19 L17 -19 L17 1 Q0 5 -17 1 Z'
      : mood === 'sick' ? 'M-17 -19 L17 -19 L17 -4 Q0 -1 -17 -4 Z'
      : mood === 'sad' ? (side < 0 ? 'M-17 -19 L17 -19 L17 -8 Q2 -12 -17 -1 Z' : 'M-17 -19 L17 -19 L17 -1 Q-2 -12 -17 -8 Z')
      : null;
    const clipId = `${uid}ec${side < 0 ? 'l' : 'r'}`;
    return (
      <g transform={`translate(${cx} ${cy})`}>
        <g className={animated && !closed ? 'drg-blink' : undefined} style={animated ? { animationDelay: delay } : undefined}>
          {closed ? (
            mood === 'dizzy'
              ? <path d="M-8 -6 L8 6 M8 -6 L-8 6" stroke={P.line} strokeWidth="3" strokeLinecap="round" />
              : <path d="M-12 4 Q0 -10 12 4" fill="none" stroke={P.line} strokeWidth="3.4" strokeLinecap="round" />
          ) : (
            <>
              <clipPath id={clipId}><ellipse rx="14.5" ry="16.5" /></clipPath>
              <ellipse rx="14.5" ry="16.5" fill="#FFFFFF" />
              <g style={exportMode ? undefined : { transform: 'translate(var(--lx, 0px), var(--ly, 0px))', transition: 'transform 140ms ease-out' }}>
                <ellipse rx="12.5" ry="14.5" fill={`url(#${uid}iris)`} />
                <ellipse rx="12.5" ry="14.5" fill="none" stroke={P.iris} strokeWidth="1.4" opacity="0.85" />
                <ellipse cy="3" rx="5.8" ry="7.2" fill="#0A0320" opacity="0.9" />
                <ellipse cy="8.5" rx="8" ry="3.4" fill={P.iris} opacity="0.5" />
                {mood === 'radiant'
                  ? <StarPath x={-4} y={-5} r={5.6} fill="#FFFFFF" />
                  : <circle cx="-4.6" cy="-6" r="4.4" fill="#FFFFFF" />}
                <circle cx="4.4" cy="5" r="1.9" fill="#FFFFFF" opacity="0.9" />
              </g>
              {lid && <path d={lid} fill={`url(#${uid}lid)`} stroke={P.line} strokeWidth="1.3" strokeOpacity="0.55" clipPath={`url(#${clipId})`} />}
              <ellipse rx="14.5" ry="16.5" fill="none" stroke={P.line} strokeWidth="1.3" opacity="0.5" />
              <path d={side < 0 ? 'M-12 -11 L-17.5 -15.5' : 'M12 -11 L17.5 -15.5'} stroke={P.line} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
            </>
          )}
        </g>
      </g>
    );
  }

  function Mouth({ mood, P }) {
    if (mood === 'radiant' || mood === 'excited') {
      return (
        <g>
          <path d="M107 120 Q120 139 133 120 Q120 125 107 120 Z" fill="#4A0E2E" stroke={P.line} strokeWidth="1.5" strokeLinejoin="round" />
          <ellipse cx="120" cy="129.5" rx="5.5" ry="3" fill="#F472B6" />
        </g>
      );
    }
    if (mood === 'sleepy') return <ellipse cx="120" cy="125" rx="3" ry="3.6" fill="#4A0E2E" />;
    if (mood === 'sick') return <path d="M107 125 q3 -3 6.5 0 t6.5 0 t6.5 0 t6.5 0" fill="none" stroke={P.line} strokeWidth="2.2" strokeLinecap="round" />;
    if (mood === 'sad') return <path d="M110 128 Q120 120 130 128" fill="none" stroke={P.line} strokeWidth="2.4" strokeLinecap="round" />;
    if (mood === 'dizzy') return <path d="M110 125 Q115 121 120 125 T130 125" fill="none" stroke={P.line} strokeWidth="2.2" strokeLinecap="round" />;
    return (
      <g>
        <path d="M109 121 Q120 131 131 121" fill="none" stroke={P.line} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M124.5 124.6 L126.6 129.4 L128.8 123.6 Z" fill="#FFFFFF" stroke={P.line} strokeWidth="0.6" strokeLinejoin="round" />
      </g>
    );
  }

  function Wing({ side, ws, stage, P, uid, A }) {
    const ax = side > 0 ? 146 : 94;
    return (
      <g transform={`translate(${ax} 146) scale(${side * ws} ${ws})`}>
        <g className={A(stage >= 6 ? 'drg-wing-big' : 'drg-wing')}>
          <path d="M0 0 C 8 -28, 34 -56, 74 -66 C 68 -54, 70 -46, 78 -36 C 62 -38, 54 -28, 58 -16 C 44 -22, 32 -14, 32 -2 C 22 -8, 10 -6, 0 0 Z"
            fill={`url(#${uid}wing)`} stroke={P.wing[2]} strokeWidth="1.2" strokeOpacity="0.7" strokeLinejoin="round" />
          <path d="M40 -48 L78 -36 M34 -38 L58 -16 M24 -26 L32 -2" stroke={stage >= 6 ? P.iris : P.wing[2]} strokeWidth={stage >= 6 ? 1.6 : 1.8} opacity={stage >= 6 ? 0.8 : 0.45} strokeLinecap="round" />
          <path d="M0 0 C 8 -28, 34 -56, 74 -66" fill="none" stroke={P.body[1]} strokeWidth="6" strokeLinecap="round" />
          <path d="M2 -4 C 10 -28, 34 -52, 70 -63" fill="none" stroke={P.body[0]} strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
          <circle cx="75" cy="-66" r="2.6" fill={P.horn[1]} />
          {stage === 8 && [[46, -44], [60, -30], [30, -22]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1.6" fill="#FFFFFF" className={A('drg-twinkle')} style={{ animationDelay: `${i * 0.5}s` }} />
          ))}
        </g>
      </g>
    );
  }

  function HeldItem({ kind, P, uid, A }) {
    if (!kind) return null;
    if (kind === 'orb') {
      return (
        <g>
          <circle cx="120" cy="184" r="17" fill={P.iris} opacity="0.28" className={A('drg-glow-pulse')} />
          <circle cx="120" cy="184" r="11" fill={`url(#${uid}orb)`} stroke="#FFFFFF" strokeOpacity="0.6" strokeWidth="0.8" />
          <ellipse cx="116" cy="179.5" rx="4" ry="2.4" fill="#FFFFFF" opacity="0.75" transform="rotate(-25 116 179.5)" />
          <path d="M113 188 Q120 181 127 188" stroke="#FFFFFF" strokeWidth="0.8" fill="none" opacity="0.6" />
        </g>
      );
    }
    if (kind === 'scroll') {
      return (
        <g transform="translate(120 188)">
          <rect x="-22" y="-7" width="44" height="15" fill="#F7E9C9" stroke="#C8A26B" strokeWidth="0.8" />
          <path d="M-16 -2 H16 M-16 2 H10" stroke="#C8A26B" strokeWidth="0.8" opacity="0.8" />
          <rect x="-27" y="-10" width="7" height="21" rx="3.5" fill="#B98A4E" stroke="#7C5A2E" strokeWidth="0.6" />
          <rect x="20" y="-10" width="7" height="21" rx="3.5" fill="#B98A4E" stroke="#7C5A2E" strokeWidth="0.6" />
          <text x="0" y="-0.5" fontSize="6.5" textAnchor="middle" fill="#7A1F3D" fontWeight="800" fontFamily="Georgia, serif">LEX</text>
          <circle cx="0" cy="9" r="3.4" fill="#B91C1C" stroke="#7F1D1D" strokeWidth="0.6" />
        </g>
      );
    }
    const gold = kind === 'goldbook';
    return (
      <g transform="translate(120 188)">
        {gold && <path d="M-18 -4 L-34 -80 L34 -80 L18 -4 Z" fill={`url(#${uid}beam)`} className={A('drg-beam')} />}
        <path d="M-27 -6 L0 -2 L27 -6 L27 13 L0 17 L-27 13 Z" fill={gold ? `url(#${uid}gold)` : '#7A1F3D'} stroke={gold ? '#9A5B06' : '#4A0E22'} strokeWidth="0.8" />
        <path d="M0 -3 C -8 -8, -18 -9, -25 -7 L-25 10 C -18 8, -8 9, 0 14 Z" fill={gold ? '#FFFBEA' : '#FFF7E6'} />
        <path d="M0 -3 C 8 -8, 18 -9, 25 -7 L25 10 C 18 8, 8 9, 0 14 Z" fill={gold ? '#FFF5D1' : '#FBEFD6'} />
        {[-1, 1].map(s => [0, 4, 8].map(dy => (
          <path key={`${s}${dy}`} d={`M${s * 5} ${dy - 2} Q${s * 13} ${dy - 5} ${s * 21} ${dy - 3}`} stroke="#C9B69A" strokeWidth="0.7" fill="none" />
        )))}
        <line x1="0" y1="-3" x2="0" y2="14" stroke="#D9C7A8" strokeWidth="0.8" />
        {(kind === 'book' || gold) && (
          <text x="0" y="-12" textAnchor="middle" fontSize="10" fill={gold ? '#FDE68A' : P.iris} fontWeight="700" className={A('drg-glyph-float')} style={{ filter: `drop-shadow(0 0 3px ${gold ? '#FDE68A' : P.iris})` }}>§</text>
        )}
      </g>
    );
  }

  function Hat({ hat, uid, A }) {
    if (hat === 'capelo') {
      return (
        <g transform="translate(120 51)">
          <path d="M-21 3 L-21 14 Q0 23 21 14 L21 3 Z" fill="#231A3A" />
          <path d="M-42 0 L0 -15 L42 0 L0 15 Z" fill="#2F2552" stroke="#5B4A99" strokeWidth="1" />
          <path d="M-42 0 L0 15 L42 0 L42 3.5 L0 18.5 L-42 3.5 Z" fill="#150F26" />
          <circle cx="0" cy="0" r="2.4" fill="#FCD34D" />
          <g className={A('drg-tassel')}>
            <path d="M0 0 Q18 2 31 7 L33 22" stroke="#FCD34D" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <path d="M29.5 20 L36.5 20 L38 31 L28 31 Z" fill="#FCD34D" stroke="#B7791F" strokeWidth="0.6" />
          </g>
        </g>
      );
    }
    if (hat === 'mago') {
      return (
        <g transform="translate(120 58)">
          <ellipse cx="0" cy="0" rx="46" ry="9.5" fill={`url(#${uid}hat)`} stroke="#1E0B4F" strokeWidth="1" />
          <path d="M-27 -2 C -18 -26, -6 -48, 18 -70 C 13 -50, 21 -25, 27 -2 Z" fill={`url(#${uid}hat)`} stroke="#1E0B4F" strokeWidth="1" />
          <path d="M-26 -7 Q0 1 26 -7 L27 -1 Q0 7 -27 -1 Z" fill="#FCD34D" />
          <StarPath x={-6} y={-24} r={3.6} fill="#FDE68A" />
          <StarPath x={9} y={-42} r={2.8} fill="#FDE68A" />
          <StarPath x={4} y={-14} r={2.2} fill="#FDE68A" />
          <StarPath x={18} y={-70} r={5} fill="#FFF7C2" className={A('drg-twinkle-strong')} style={{ filter: 'drop-shadow(0 0 4px #FDE68A)' }} />
        </g>
      );
    }
    if (hat === 'louros') {
      const leaves = [];
      for (let i = 0; i < 7; i++) {
        const a = (200 + i * 11) * Math.PI / 180;
        const x = 120 + Math.cos(a) * 47, y = 98 + Math.sin(a) * 47;
        const rot = (200 + i * 11) + 90;
        leaves.push({ x, y, rot });
      }
      return (
        <g>
          {leaves.map((l, i) => (
            <React.Fragment key={i}>
              <ellipse cx={l.x} cy={l.y} rx="7" ry="2.8" fill={`url(#${uid}gold)`} stroke="#9A5B06" strokeWidth="0.5" transform={`rotate(${l.rot - 25} ${l.x} ${l.y})`} />
              <ellipse cx={240 - l.x} cy={l.y} rx="7" ry="2.8" fill={`url(#${uid}gold)`} stroke="#9A5B06" strokeWidth="0.5" transform={`rotate(${-(l.rot - 25)} ${240 - l.x} ${l.y})`} />
            </React.Fragment>
          ))}
          <path d="M116 54 L120 47 L124 54 L120 58 Z" fill="#F472B6" stroke="#FFF" strokeWidth="0.6" style={{ filter: 'drop-shadow(0 0 3px #F472B6)' }} />
        </g>
      );
    }
    return null;
  }

  function FaceAcc({ face }) {
    if (face === 'oculos') {
      return (
        <g>
          <circle cx="99" cy="98" r="16.5" fill="rgba(186,230,253,0.14)" stroke="#3B2A1A" strokeWidth="2.4" />
          <circle cx="141" cy="98" r="16.5" fill="rgba(186,230,253,0.14)" stroke="#3B2A1A" strokeWidth="2.4" />
          <path d="M115.5 96 Q120 91.5 124.5 96" fill="none" stroke="#3B2A1A" strokeWidth="2.2" />
          <path d="M82.5 95 L73 91 M157.5 95 L167 91" stroke="#3B2A1A" strokeWidth="2" strokeLinecap="round" />
          <path d="M89 88 Q93 84 98 84" stroke="#FFFFFF" strokeWidth="1.6" fill="none" opacity="0.7" strokeLinecap="round" />
          <path d="M131 88 Q135 84 140 84" stroke="#FFFFFF" strokeWidth="1.6" fill="none" opacity="0.7" strokeLinecap="round" />
        </g>
      );
    }
    if (face === 'monoculo') {
      return (
        <g>
          <circle cx="141" cy="98" r="17" fill="rgba(254,243,199,0.12)" stroke="#E7B24C" strokeWidth="2.8" />
          <path d="M156 106 C 164 118, 158 130, 150 142" fill="none" stroke="#E7B24C" strokeWidth="1.3" strokeDasharray="1.6 2" />
          <path d="M132 87 Q137 83 143 83" stroke="#FFFFFF" strokeWidth="1.6" fill="none" opacity="0.7" strokeLinecap="round" />
        </g>
      );
    }
    return null;
  }

  function NeckAcc({ neck, uid }) {
    if (neck === 'cachecol') {
      return (
        <g>
          <path d="M132 146 L148 145 L151 180 L134 178 Z" fill="#B91C1C" stroke="#7F1D1D" strokeWidth="0.8" />
          <path d="M134 158 L149 157 M134.5 168 L150 167" stroke="#FDE68A" strokeWidth="2.6" />
          <path d="M135 178 L135 183 M139 178.4 L139 183.4 M143 178.8 L143 183.8 M147 179.2 L147 184" stroke="#B91C1C" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M87 133 Q120 152 153 133 L155 147 Q120 168 85 147 Z" fill="#DC2626" stroke="#7F1D1D" strokeWidth="0.8" />
          <path d="M87 140 Q120 159 154 140" fill="none" stroke="#FDE68A" strokeWidth="3" />
        </g>
      );
    }
    if (neck === 'gravata') {
      return (
        <g transform="translate(120 143)">
          <path d="M0 0 L-16 -8 L-16 8 Z" fill="#E11D48" stroke="#881337" strokeWidth="0.8" strokeLinejoin="round" />
          <path d="M0 0 L16 -8 L16 8 Z" fill="#E11D48" stroke="#881337" strokeWidth="0.8" strokeLinejoin="round" />
          <rect x="-4" y="-4.5" width="8" height="9" rx="2.4" fill="#BE123C" />
          {[[-10, -2], [-11, 3], [10, -2], [11, 3]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="0.9" fill="#FFF" opacity="0.8" />)}
        </g>
      );
    }
    if (neck === 'medalha') {
      return (
        <g>
          <path d="M104 132 L117 160 L123 160 L136 132 L129 132 L120 151 L111 132 Z" fill="#2563EB" stroke="#1E3A8A" strokeWidth="0.6" />
          <circle cx="120" cy="166" r="9.5" fill={`url(#${uid}gold)`} stroke="#9A5B06" strokeWidth="1" />
          <StarPath x={120} y={166.5} r={5} fill="#FFF7C2" />
        </g>
      );
    }
    return null;
  }

  function DragonSVG({ stage = 1, mood = 'happy', skin = 'ametista', hat = null, face = null, neck = null, flame = 0.7, size = 220, animated = true, exportMode = false, svgRef }) {
    const P = SKINS[skin] || SKINS.ametista;
    const uid = GM.useUid('dg');
    const A = (cls) => (animated ? cls : undefined);
    const H = size * 260 / 240;
    const cfg = STAGE_CFG[Math.max(3, stage)] || STAGE_CFG[3];
    const sick = mood === 'sick';
    const fl = sick ? 0.15 : Math.max(0.15, Math.min(1, flame));
    const fs = 0.55 + fl * 0.8;
    const moodClass = mood === 'excited' ? 'drg-hop' : mood === 'dizzy' ? 'drg-spin' : sick ? 'drg-sick' : undefined;
    const eyeDelay = useMemo(() => `${(Math.random() * 3).toFixed(2)}s`, []);

    const defs = (
      <defs>
        <radialGradient id={`${uid}body`} cx="0.38" cy="0.28" r="0.85">
          <stop offset="0%" stopColor={P.body[0]} />
          <stop offset="55%" stopColor={P.body[1]} />
          <stop offset="100%" stopColor={P.body[2]} />
        </radialGradient>
        <radialGradient id={`${uid}egg`} cx="0.38" cy="0.3" r="0.9">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="20%" stopColor={P.body[0]} />
          <stop offset="68%" stopColor={P.body[1]} />
          <stop offset="100%" stopColor={P.body[2]} />
        </radialGradient>
        <linearGradient id={`${uid}belly`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={P.belly[0]} />
          <stop offset="100%" stopColor={P.belly[1]} />
        </linearGradient>
        <linearGradient id={`${uid}horn`} x1="0" y1="1" x2="0.4" y2="0">
          <stop offset="0%" stopColor={stage === 8 ? '#F5C542' : P.horn[1]} />
          <stop offset="100%" stopColor={stage === 8 ? '#FFF8C9' : P.horn[0]} />
        </linearGradient>
        <linearGradient id={`${uid}crest`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={P.crest[0]} />
          <stop offset="100%" stopColor={P.crest[1]} />
        </linearGradient>
        <linearGradient id={`${uid}wing`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor={P.wing[2]} stopOpacity="0.95" />
          <stop offset="55%" stopColor={P.wing[1]} stopOpacity="0.9" />
          <stop offset="100%" stopColor={P.wing[0]} stopOpacity="0.95" />
        </linearGradient>
        <radialGradient id={`${uid}iris`} cx="0.5" cy="0.3" r="0.8">
          <stop offset="0%" stopColor={P.eye[1]} />
          <stop offset="100%" stopColor={P.eye[0]} />
        </radialGradient>
        <linearGradient id={`${uid}lid`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={P.body[0]} />
          <stop offset="100%" stopColor={P.body[1]} />
        </linearGradient>
        <radialGradient id={`${uid}flame`} cx="0.5" cy="0.78" r="0.8">
          <stop offset="0%" stopColor={P.flame[0]} />
          <stop offset="45%" stopColor={P.flame[1]} />
          <stop offset="100%" stopColor={P.flame[2]} />
        </radialGradient>
        <radialGradient id={`${uid}aura`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor={P.iris} stopOpacity="0.5" />
          <stop offset="60%" stopColor={P.wing[1]} stopOpacity="0.16" />
          <stop offset="100%" stopColor={P.wing[1]} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}orb`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="40%" stopColor={P.iris} />
          <stop offset="100%" stopColor={P.wing[2]} />
        </radialGradient>
        <linearGradient id={`${uid}gold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFF8C9" />
          <stop offset="50%" stopColor="#F5C542" />
          <stop offset="100%" stopColor="#A86B0C" />
        </linearGradient>
        <linearGradient id={`${uid}beam`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#FFF7C2" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#FFF7C2" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${uid}ray`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#FFF7C2" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#FDE68A" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#FDE68A" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${uid}cape`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3B1A8A" />
          <stop offset="100%" stopColor="#140A33" />
        </linearGradient>
        <linearGradient id={`${uid}hat`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7C4DFF" />
          <stop offset="100%" stopColor="#24105E" />
        </linearGradient>
      </defs>
    );

    const ground = (
      <g>
        <ellipse cx="120" cy="238" rx="90" ry="15" fill="none" stroke={P.iris} strokeOpacity="0.4" strokeWidth="1.2" strokeDasharray="3 5" className={A('drg-rune-ring')} />
        <ellipse cx="120" cy="238" rx="72" ry="11" fill="none" stroke={P.iris} strokeOpacity="0.25" strokeWidth="0.8" />
        <ellipse cx="120" cy="238" rx="60" ry="8" fill="rgba(8,3,26,0.5)" />
      </g>
    );

    // ── OVOS ──
    if (stage <= 2) {
      const egg = 'M120 88 C 90 88, 74 134, 76 168 C 78 204, 97 222, 120 222 C 143 222, 162 204, 164 168 C 166 134, 150 88, 120 88 Z';
      return (
        <svg ref={svgRef} viewBox="0 0 240 260" width={size} height={H} style={{ overflow: 'visible' }} xmlns="http://www.w3.org/2000/svg">
          {defs}
          {ground}
          {/* Livros-ninho */}
          <rect x="62" y="226" width="116" height="12" rx="2" fill="#35226E" stroke="#1C1040" strokeWidth="0.8" />
          <path d="M70 226 V238 M170 226 V238" stroke="#FCD34D" strokeWidth="2" />
          <rect x="74" y="215" width="92" height="11.5" rx="2" fill="#8B1E3F" stroke="#4A0E22" strokeWidth="0.8" />
          <rect x="159" y="216.5" width="6" height="8.5" fill="#F7E9C9" />
          <path d="M84 215 V226.5" stroke="#FCD34D" strokeWidth="1.6" />
          {stage === 2 && <ellipse cx="120" cy="158" rx="84" ry="96" fill={`url(#${uid}aura)`} className={A('drg-glow-pulse')} />}
          <g className={A(stage === 1 ? 'drg-egg-idle' : 'drg-egg-crack')} style={{ transformOrigin: '120px 222px' }}>
            <path d={egg} fill={`url(#${uid}egg)`} />
            <path d={egg} fill="none" stroke={P.body[2]} strokeOpacity="0.45" strokeWidth="1.4" />
            {/* Constelação */}
            <g stroke={P.crest[0]} strokeOpacity="0.55" strokeWidth="0.8" fill="none">
              <path d="M104 124 L118 114 L133 126 L126 142" />
              <path d="M98 194 L112 203 L129 198" />
            </g>
            {[[104, 124], [118, 114], [133, 126], [126, 142], [98, 194], [112, 203], [129, 198]].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="2" fill="#FFFFFF" className={A('drg-twinkle')} style={{ animationDelay: `${i * 0.35}s`, filter: `drop-shadow(0 0 2px ${P.crest[0]})` }} />
            ))}
            {/* Faixa de runas */}
            <g className={A('drg-rune-pulse')}>
              <path d="M79 160 Q120 178 161 160" fill="none" stroke={P.iris} strokeWidth="1.6" strokeDasharray="2 4" />
              {[[97, 170, 'ᚨ'], [120, 175, 'ᛟ'], [143, 170, 'ᚱ']].map(([x, y, g], i) => (
                <text key={i} x={x} y={y} fontSize="10" textAnchor="middle" fill={P.iris} fontWeight="700" style={{ filter: `drop-shadow(0 0 3px ${P.iris})` }}>{g}</text>
              ))}
            </g>
            <ellipse cx="99" cy="122" rx="8.5" ry="21" fill="#FFFFFF" opacity="0.38" transform="rotate(-22 99 122)" />
            {stage === 2 && (
              <g>
                <g stroke={P.iris} strokeWidth="3.2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 4px ${P.iris})` }}>
                  <path d="M96 140 L106 150 L100 160 L112 170" />
                  <path d="M146 142 L136 152 L144 162 L134 172" />
                </g>
                <g stroke="#FFFFFF" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M96 140 L106 150 L100 160 L112 170" />
                  <path d="M146 142 L136 152 L144 162 L134 172" />
                </g>
                <path d="M103 118 Q120 106 137 118 Q133 134 120 136 Q107 134 103 118 Z" fill="#12062E" stroke={P.iris} strokeWidth="1.6" style={{ filter: `drop-shadow(0 0 5px ${P.iris})` }} />
                <g className={A('drg-blink')} style={{ transformOrigin: '120px 124px' }}>
                  <circle cx="112.5" cy="124" r="4.2" fill="#FFFFFF" />
                  <circle cx="127.5" cy="124" r="4.2" fill="#FFFFFF" />
                  <circle cx="113" cy="125" r="2.6" fill={P.eye[0]} />
                  <circle cx="128" cy="125" r="2.6" fill={P.eye[0]} />
                  <circle cx="111.8" cy="122.8" r="1.2" fill="#FFFFFF" />
                  <circle cx="126.8" cy="122.8" r="1.2" fill="#FFFFFF" />
                </g>
              </g>
            )}
          </g>
          {stage === 2 && [[70, 120], [172, 110], [160, 196]].map(([x, y], i) => (
            <StarPath key={i} x={x} y={y} r={4} fill={P.crest[0]} className={A('drg-twinkle')} style={{ animationDelay: `${i * 0.6}s` }} />
          ))}
        </svg>
      );
    }

    // ── DRAGÃO ECLODIDO ──
    const hornPath = 'M100 64 C 94 52, 92 40, 98 26 C 100 40, 106 50, 112 58 Z';
    const earPath = 'M76 90 C 62 82, 50 84, 42 76 C 48 88, 46 96, 52 100 C 46 104, 48 112, 44 118 C 56 114, 66 112, 76 106 Z';
    const armPath = 'M96 150 C 86 162, 88 180, 102 188 C 108 191, 113 187, 110 182 C 104 176, 102 166, 104 154 Z';
    const showHorns = cfg.hs > 0 && hat !== 'mago';
    const showCrest = !hat && stage >= 4;

    return (
      <svg ref={svgRef} viewBox="0 0 240 260" width={size} height={H} style={{ overflow: 'visible' }} xmlns="http://www.w3.org/2000/svg">
        {defs}
        {stage >= 6 && <circle cx="120" cy="140" r={stage === 8 ? 124 : 104} fill={`url(#${uid}aura)`} className={A('drg-aura')} style={{ transformOrigin: '120px 140px' }} />}
        {cfg.rays && (
          <g className={A('drg-rays')} style={{ transformOrigin: '120px 140px' }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <path key={i} d="M120 140 L112 16 L128 16 Z" fill={`url(#${uid}ray)`} transform={`rotate(${i * 30 + 15} 120 140)`} />
            ))}
          </g>
        )}
        {ground}
        <g transform={`translate(120 236) scale(${cfg.sc}) translate(-120 -236)`}>
          <g className={A(moodClass)} style={{ transformOrigin: '120px 236px' }}>
            <g className={A('drg-float')}>
              {/* Runas orbitando */}
              {RUNE_POS.slice(0, cfg.runes).map(([x, y, g], i) => (
                <text key={i} x={x} y={y} fontSize="15" textAnchor="middle" fill={i % 2 ? P.crest[0] : P.iris} fontWeight="700"
                  className={A('drg-rune')} style={{ animationDelay: `${i * 0.7}s`, filter: `drop-shadow(0 0 4px ${P.iris})` }}>{g}</text>
              ))}

              <Wing side={-1} ws={cfg.ws} stage={stage} P={P} uid={uid} A={A} />
              <Wing side={1} ws={cfg.ws} stage={stage} P={P} uid={uid} A={A} />

              {/* Cauda + chama do saber */}
              <g className={A('drg-tail')} style={{ transformOrigin: '150px 204px' }}>
                <path d="M150 194 C 168 200, 188 198, 200 184 C 210 170, 206 152, 196 142 C 199 156, 197 170, 188 180 C 176 192, 164 204, 152 214 Z"
                  fill={`url(#${uid}body)`} stroke={P.body[2]} strokeWidth="1" strokeOpacity="0.5" />
                <path d="M166 199 L171 193 L174 200 M183 193 L190 188 L191 195 M198 176 L205 173 L202 180" fill={`url(#${uid}crest)`} stroke={P.crest[1]} strokeWidth="0.8" strokeLinejoin="round" />
                <g transform={`translate(196.5 142) scale(${fs})`} opacity={0.55 + fl * 0.45}>
                  <g className={A('drg-flame')}>
                    <path d="M0 6 C -9 0, -8 -10, 0 -24 C 3 -14, 10 -12, 9 -2 C 8 4, 4 7, 0 6 Z" fill={`url(#${uid}flame)`} style={{ filter: `drop-shadow(0 0 ${3 + fl * 6}px ${P.flame[1]})` }} />
                    <path d="M0 5 C -4 1, -4 -5, 0 -12 C 2 -6, 5 -5, 4 0 C 4 3, 2 5, 0 5 Z" fill={P.flame[0]} />
                  </g>
                </g>
              </g>

              {/* Toga (capa) */}
              {cfg.cape && (
                <g>
                  <path d="M92 140 C 78 170, 70 206, 64 234 L176 234 C 170 206, 162 170, 148 140 Z" fill={`url(#${uid}cape)`} />
                  <path d="M92 140 C 78 170, 70 206, 64 234 M148 140 C 162 170, 170 206, 176 234" fill="none" stroke="#FCD34D" strokeWidth={stage === 8 ? 3 : 2} />
                  {stage === 8 && [[74, 210], [166, 206], [82, 184]].map(([x, y], i) => <StarPath key={i} x={x} y={y} r={3} fill="#FDE68A" />)}
                </g>
              )}

              {/* Corpo */}
              <g className={A('drg-breathe')} style={{ transformOrigin: '120px 232px' }}>
                <path d="M120 126 C 94 126, 82 156, 83 184 C 84 212, 100 228, 120 228 C 140 228, 156 212, 157 184 C 158 156, 146 126, 120 126 Z"
                  fill={`url(#${uid}body)`} stroke={P.body[2]} strokeWidth="1" strokeOpacity="0.5" />
                <path d="M120 146 C 105 146, 99 168, 100 188 C 101 208, 109 222, 120 222 C 131 222, 139 208, 140 188 C 141 168, 135 146, 120 146 Z" fill={`url(#${uid}belly)`} />
                {[[162, 106, 134], [176, 102.5, 137.5], [190, 101.5, 138.5], [204, 103.5, 136.5]].map(([y, x1, x2], i) => (
                  <path key={i} d={`M${x1} ${y} Q120 ${y + 6} ${x2} ${y}`} stroke={P.belly[1]} strokeWidth="1.4" fill="none" opacity="0.9" />
                ))}
                <ellipse cx="91" cy="206" rx="15" ry="17" fill={`url(#${uid}body)`} />
                <ellipse cx="149" cy="206" rx="15" ry="17" fill={`url(#${uid}body)`} />
                <ellipse cx="98" cy="228" rx="15.5" ry="8" fill={`url(#${uid}body)`} stroke={P.body[2]} strokeOpacity="0.4" />
                <ellipse cx="142" cy="228" rx="15.5" ry="8" fill={`url(#${uid}body)`} stroke={P.body[2]} strokeOpacity="0.4" />
                {[[88, 232], [95, 234], [102, 233.5], [138, 233.5], [145, 234], [152, 232]].map(([x, y], i) => (
                  <ellipse key={i} cx={x} cy={y} rx="2.4" ry="1.6" fill={P.horn[0]} stroke={P.horn[1]} strokeWidth="0.5" />
                ))}

                <HeldItem kind={cfg.item} P={P} uid={uid} A={A} />

                <path d={armPath} fill={`url(#${uid}body)`} stroke={P.body[2]} strokeWidth="0.8" strokeOpacity="0.5" />
                <path d={armPath} fill={`url(#${uid}body)`} stroke={P.body[2]} strokeWidth="0.8" strokeOpacity="0.5" transform="translate(240 0) scale(-1 1)" />
                {[[104, 189.5], [108.5, 190.5], [131.5, 190.5], [136, 189.5]].map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r="1.5" fill={P.horn[0]} />
                ))}

                {cfg.cape && (
                  <g>
                    <path d="M94 134 Q120 154 146 134 L150 144 Q120 166 90 144 Z" fill={`url(#${uid}cape)`} stroke="#FCD34D" strokeWidth="1.4" />
                    <circle cx="120" cy="153" r="5.5" fill={`url(#${uid}gold)`} stroke="#9A5B06" strokeWidth="0.6" />
                    <circle cx="120" cy="153" r="2.4" fill={P.iris} style={{ filter: `drop-shadow(0 0 3px ${P.iris})` }} />
                  </g>
                )}
                <NeckAcc neck={neck} uid={uid} />
              </g>

              {/* Cabeça */}
              <g className={A('drg-head')} style={{ transformOrigin: '120px 132px' }}>
                <path d={earPath} fill={`url(#${uid}crest)`} stroke={P.crest[1]} strokeWidth="0.8" />
                <path d={earPath} fill={`url(#${uid}crest)`} stroke={P.crest[1]} strokeWidth="0.8" transform="translate(240 0) scale(-1 1)" />
                <path d="M72 92 L52 86 M70 100 L52 104 M72 106 L56 114" stroke={P.crest[1]} strokeWidth="0.8" opacity="0.6" />
                <path d="M168 92 L188 86 M170 100 L188 104 M168 106 L184 114" stroke={P.crest[1]} strokeWidth="0.8" opacity="0.6" />

                <path d="M120 54 C 153 54, 170 76, 170 100 C 170 124, 150 140, 120 140 C 90 140, 70 124, 70 100 C 70 76, 87 54, 120 54 Z"
                  fill={`url(#${uid}body)`} stroke={P.body[2]} strokeWidth="1" strokeOpacity="0.5" />
                <ellipse cx="100" cy="70" rx="17" ry="8" fill="#FFFFFF" opacity="0.2" transform="rotate(-20 100 70)" />

                {cfg.gem && (
                  <path d="M120 60 L126 67 L120 74 L114 67 Z" fill={stage === 8 ? `url(#${uid}gold)` : P.iris} stroke="#FFFFFF" strokeWidth="0.8"
                    className={A('drg-glow-pulse')} style={{ filter: `drop-shadow(0 0 5px ${stage === 8 ? '#FDE68A' : P.iris})` }} />
                )}

                <ellipse cx="120" cy="117" rx="24.5" ry="15.5" fill={P.body[0]} opacity="0.55" />
                <ellipse cx="112" cy="111.5" rx="2.2" ry="1.5" fill={P.line} opacity="0.55" />
                <ellipse cx="128" cy="111.5" rx="2.2" ry="1.5" fill={P.line} opacity="0.55" />
                <ellipse cx="85" cy="116" rx="8.5" ry="4.8" fill={P.blush} opacity={sick ? 0.25 : 0.55} />
                <ellipse cx="155" cy="116" rx="8.5" ry="4.8" fill={P.blush} opacity={sick ? 0.25 : 0.55} />

                <Eye cx={99} cy={98} side={-1} mood={mood} P={P} uid={uid} animated={animated} exportMode={exportMode} delay={eyeDelay} />
                <Eye cx={141} cy={98} side={1} mood={mood} P={P} uid={uid} animated={animated} exportMode={exportMode} delay={eyeDelay} />
                {mood === 'sad' && <path d="M150 112 C 148 117, 152 120, 153 116 C 154 114, 152 112, 150 112 Z" fill="#7DD3FC" className={A('drg-sweat')} />}
                <Mouth mood={mood} P={P} />

                {showHorns && (
                  <g transform={`translate(104 62) scale(${cfg.hs}) translate(-104 -62)`}>
                    <path d={hornPath} fill={`url(#${uid}horn)`} stroke={P.horn[1]} strokeWidth="0.8" />
                    <path d={hornPath} fill={`url(#${uid}horn)`} stroke={P.horn[1]} strokeWidth="0.8" transform="translate(240 0) scale(-1 1)" />
                    <path d="M97 48 Q101 47 104 50 M96 40 Q99 39 101 42" stroke={P.horn[1]} strokeWidth="0.9" fill="none" opacity="0.7" />
                    <path d="M143 48 Q139 47 136 50 M144 40 Q141 39 139 42" stroke={P.horn[1]} strokeWidth="0.9" fill="none" opacity="0.7" />
                  </g>
                )}
                {showCrest && (
                  <g fill={`url(#${uid}crest)`} stroke={P.crest[1]} strokeWidth="0.7" strokeLinejoin="round">
                    <path d="M111 58 L114 47 L120 56 Z" />
                    <path d="M117 56 L121 42 L126 55 Z" />
                    <path d="M124 56 L129 47 L131 59 Z" />
                  </g>
                )}
                {stage === 3 && !hat && (
                  <g>
                    <path d="M89 72 C 90 48, 150 48, 151 72 L144 64 L137 73 L129 63 L120 73 L111 63 L103 73 L96 64 Z" fill={`url(#${uid}egg)`} stroke={P.body[2]} strokeOpacity="0.4" strokeWidth="1" />
                    <circle cx="108" cy="58" r="1.6" fill="#FFFFFF" />
                    <circle cx="131" cy="56" r="1.3" fill="#FFFFFF" />
                    <path d="M108 58 L131 56" stroke={P.crest[0]} strokeWidth="0.6" opacity="0.6" />
                  </g>
                )}
                <Hat hat={hat} uid={uid} A={A} />
                <FaceAcc face={face} />
                {cfg.halo && (
                  <g className={A('drg-halo')} style={{ transformOrigin: '120px 30px' }}>
                    {[-2, -1, 0, 1, 2].map(i => (
                      <StarPath key={i} x={120 + i * 17} y={34 - (2 - Math.abs(i)) * 6 - (hat ? 18 : 0)} r={i === 0 ? 6 : 4.2} fill="#FDE68A"
                        style={{ filter: 'drop-shadow(0 0 4px #FCD34D)' }} />
                    ))}
                  </g>
                )}
              </g>

              {cfg.quill && (
                <g transform="translate(168 176) rotate(-28)">
                  <g className={A('drg-quill')}>
                    <path d="M0 0 C 6 -10, 16 -22, 30 -28 C 22 -18, 14 -8, 2 2 Z" fill="#FFFFFF" stroke={P.iris} strokeWidth="1" />
                    <path d="M1 1 L28 -26" stroke={P.iris} strokeWidth="0.8" />
                    <path d="M-3 4 L1 1" stroke="#2E1065" strokeWidth="2" strokeLinecap="round" />
                  </g>
                </g>
              )}

              {mood === 'sick' && (
                <g>
                  <g transform="translate(131 124) rotate(22)">
                    <rect x="0" y="-2.2" width="22" height="4.4" rx="2.2" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="0.6" />
                    <rect x="3" y="-0.9" width="14" height="1.8" fill="#EF4444" />
                    <circle cx="22" cy="0" r="3.2" fill="#EF4444" />
                  </g>
                  <path d="M160 70 C 156 78, 162 82, 164 76 C 165 73, 162 71, 160 70 Z" fill="#7DD3FC" className={A('drg-sweat')} />
                </g>
              )}
              {mood === 'sleepy' && [[160, 62, 12], [172, 46, 15], [184, 30, 18]].map(([x, y, s], i) => (
                <text key={i} x={x} y={y} fontSize={s} fontWeight="800" fill="#C4B5FD" className={A('drg-z')} style={{ animationDelay: `${i * 0.6}s` }}>z</text>
              ))}
              {mood === 'radiant' && [[62, 70], [178, 60], [196, 118], [46, 132]].map(([x, y], i) => (
                <StarPath key={i} x={x} y={y} r={4.5} fill="#FDE68A" className={A('drg-twinkle-strong')} style={{ animationDelay: `${i * 0.4}s` }} />
              ))}
            </g>
          </g>
        </g>
      </svg>
    );
  }

  // ════════════════════════════════════════════════════════════
  //  VITAIS & FALAS
  // ════════════════════════════════════════════════════════════
  const clamp01 = (v) => Math.max(0, Math.min(1, v || 0));

  function dragonVitals(shared) {
    const logs = shared.dailyLogs || [];
    const s = GM.todayStats(shared);
    const goals = shared.goals || {};
    const chama = clamp01(s.hours / Math.max(0.5, goals.dailyHours || 2));
    const qg = goals.dailyQuestions || 0, rg = goals.dailyFlashcards || 0;
    let sab;
    if (qg > 0 && rg > 0) sab = (clamp01(s.questions / qg) + clamp01(s.reviews / rg)) / 2;
    else if (qg > 0) sab = clamp01(s.questions / qg);
    else if (rg > 0) sab = clamp01(s.reviews / rg);
    else sab = s.questions > 0 ? 1 : 0;
    const daysOff = window.DA ? window.DA.daysSinceLastStudy(logs) : Infinity;
    const streak = shared.streak || 0;
    const sick = shared.petHealth === 'sick';
    let vinc = logs.length === 0 ? 0.5
      : clamp01(0.35 + Math.min(streak, 12) * 0.05 + (daysOff === 0 ? 0.15 : 0) - (daysOff === Infinity ? 0 : Math.max(0, daysOff - 1)) * 0.18);
    if (sick) vinc = Math.min(vinc, 0.2);
    const h = new Date().getHours();
    let mood = 'happy';
    if (sick) mood = 'sick';
    else if (h >= 23 || h < 6) mood = 'sleepy';
    else if (chama >= 1) mood = 'radiant';
    else if (s.hours === 0 && (h >= 16 || (daysOff !== Infinity && daysOff >= 2))) mood = 'sad';
    return { chama, sab, vinc, mood, today: s, daysOff, streak, sick };
  }

  const WISDOM = [
    'Sabedoria é saber o que fazer; virtude é fazê-lo.',
    'Um capítulo por dia constrói uma biblioteca inteira. 📚',
    'Errar questão hoje é acertar na prova amanhã.',
    'Dragões não nascem sábios. Eles leem MUITO. 🐉',
    '25 minutos de foco valem mais que 2 horas distraído.',
    'Quem revisa, lembra. Quem lembra, passa. ✨',
    'Lei seca é o feitiço mais poderoso do concurso.',
    'Pausa curta, foco longo. Bebe uma água! 💧',
    'Cada check no edital é uma escama a mais na minha armadura.',
    'Constância é a magia mais subestimada do mundo.',
    'Explica em voz alta: quem ensina, domina.',
    'Menos rolagem, mais leitura. Eu acredito em você! 💜',
    'O conhecimento é o único tesouro que cresce quando dividido.',
    'Revisão espaçada: 1, 7 e 30 dias. Anota aí! 🗓️',
    'Hoje é um ótimo dia para derrotar a procrastinação.',
    'Grandes aprovações são feitas de dias comuns bem estudados.',
  ];
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  function contextLine(vit, shared, name) {
    const h = new Date().getHours();
    const goals = shared.goals || {};
    const lines = [];
    if (vit.sick) return 'Não estou me sentindo bem… estudar 2 dias seguidos me cura 💚';
    if (vit.mood === 'sleepy') lines.push('Zzz… estudar à noite vale, mas dormir bem fixa a matéria 🌙');
    if ((shared.dragon && shared.dragon.chests || []).length) lines.push('Psiu… tem um baú esperando você abrir 🧰');
    const dq = GM.dailyQuests(shared);
    if (dq.list.some(q => q.done && !q.claimed)) lines.push('Tem missão pronta pra resgatar! 🎁');
    if (vit.today.hours === 0) {
      lines.push(h < 12 ? 'Bom dia! Minha chama acorda quando você abre o livro ☀️' : 'Minha chama está fraquinha… que tal 25 minutinhos juntos? 🔥');
    } else if (vit.chama < 1) {
      const rem = Math.max(0, (goals.dailyHours || 2) - vit.today.hours);
      lines.push(`Já sinto o calor! Faltam ${GM.fmtH(rem)} pra meta de hoje 🔥`);
    } else {
      lines.push('Meta batida! Estou brilhando de orgulho ✨');
    }
    if (vit.streak >= 3) lines.push(`${vit.streak} dias de constância! Nossa chama está inquebrável 🔥`);
    const stage = GM.stageFromXp(shared.xp);
    if (stage < 8) {
      const next = GM.STAGE_XP[stage];
      const prev = GM.STAGE_XP[stage - 1];
      if ((next - (shared.xp || 0)) / (next - prev) < 0.12) lines.push('Sinto que vou evoluir muito em breve… ✨');
    }
    lines.push(pick(WISDOM));
    return lines[0];
  }

  // ════════════════════════════════════════════════════════════
  //  UI — COVIL DO DRAGÃO (painel principal na aba Hoje)
  // ════════════════════════════════════════════════════════════
  function NeedBar({ icon, label, value, color, hint }) {
    const pct = Math.round(clamp01(value) * 100);
    return (
      <div className="need" title={hint}>
        <div className="need-top">
          <span className="need-label"><span className="need-icon">{icon}</span>{label}</span>
          <span className="need-val num">{pct}%</span>
        </div>
        <div className="need-track">
          <div className="need-fill" style={{ width: `${pct}%`, '--need': color }} />
        </div>
      </div>
    );
  }

  const SCENE_STARS = Array.from({ length: 46 }).map((_, i) => ({
    x: (i * 137.5) % 100, y: (i * 61.8) % 100, s: 1 + (i % 3) * 0.7, d: (i * 0.37) % 4,
  }));

  function LairScene() {
    return (
      <div className="lair-scene" aria-hidden="true">
        <div className="lair-nebula" />
        {SCENE_STARS.map((s, i) => (
          <span key={i} className="lair-star" style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, animationDelay: `${s.d}s` }} />
        ))}
        <div className="lair-moon" />
        {[0, 1, 2].map(i => (
          <svg key={i} className={`lair-book lair-book-${i}`} viewBox="0 0 40 28" width="40" height="28">
            <path d="M20 5 C 14 1, 6 1, 2 3 L2 24 C 6 22, 14 22, 20 26 Z" fill="#F7E9C9" />
            <path d="M20 5 C 26 1, 34 1, 38 3 L38 24 C 34 22, 26 22, 20 26 Z" fill="#FFF4DC" />
            <path d="M20 5 V26" stroke="#C9B69A" strokeWidth="1" />
            <path d="M6 8 Q12 6 17 9 M6 12 Q12 10 17 13 M23 9 Q28 6 34 8 M23 13 Q28 10 34 12" stroke="#C9B69A" strokeWidth="0.8" fill="none" />
          </svg>
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className="lair-mote" style={{ left: `${8 + i * 9}%`, animationDelay: `${i * 0.9}s`, animationDuration: `${7 + (i % 4)}s` }} />
        ))}
      </div>
    );
  }

  function DragonLair({ shared, onPet, onRename, onOpenWardrobe, onShare, onOpenHall, onClaimQuest, onClaimBonus, onOpenChest }) {
    const xp = shared.xp || 0;
    const stage = GM.stageFromXp(xp);
    const st = DRAGON_STAGES[stage - 1];
    const next = DRAGON_STAGES[stage];
    const lv = GM.levelInfo(xp);
    const vit = useMemo(() => dragonVitals(shared), [shared.dailyLogs, shared.goals, shared.streak, shared.petHealth]);
    const drg = shared.dragon || {};
    const name = drg.name || 'Lumi';
    const chests = drg.chests || [];
    const mult = GM.streakMultiplier(shared.streak);
    const nextMult = GM.nextMultiplierStep(shared.streak);

    const [react, setReact] = useState(null);
    const [bubble, setBubble] = useState(() => contextLine(vit, shared, name));
    const [bubbleKey, setBubbleKey] = useState(0);
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(name);
    const stageRef = useRef(null);
    const clicksRef = useRef([]);
    const reactT = useRef(null);
    const mood = react || vit.mood;

    const say = (text) => { setBubble(text); setBubbleKey(k => k + 1); };

    useEffect(() => { say(contextLine(vit, shared, name)); }, [vit.mood, vit.today.hours, chests.length, shared.quests]);
    useEffect(() => {
      const t = setInterval(() => say(Math.random() < 0.5 ? contextLine(vit, shared, name) : pick(WISDOM)), 14000);
      return () => clearInterval(t);
    }, [vit, shared.xp]);

    // Olhos seguem o cursor (variáveis CSS, sem re-render)
    useEffect(() => {
      let raf = 0;
      const onMove = (e) => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          const el = stageRef.current; if (!el) return;
          const r = el.getBoundingClientRect();
          const cx = r.left + r.width / 2, cy = r.top + r.height * 0.4;
          const dx = e.clientX - cx, dy = e.clientY - cy;
          const d = Math.hypot(dx, dy) || 1;
          const k = Math.min(1, d / 240);
          el.style.setProperty('--lx', `${(dx / d * 3.6 * k).toFixed(2)}px`);
          el.style.setProperty('--ly', `${(dy / d * 3.2 * k).toFixed(2)}px`);
        });
      };
      window.addEventListener('pointermove', onMove, { passive: true });
      return () => { window.removeEventListener('pointermove', onMove); if (raf) cancelAnimationFrame(raf); };
    }, []);
    useEffect(() => () => clearTimeout(reactT.current), []);

    const pet = (e) => {
      const now = Date.now();
      clicksRef.current = clicksRef.current.filter(t => now - t < 1600).concat(now);
      const x = e.clientX, y = e.clientY;
      clearTimeout(reactT.current);
      if (stage <= 2) {
        setReact(null);
        window.SFX && window.SFX.chestShake();
        window.FX && window.FX.burst(x, y, { count: 12, speed: 3.5, palette: ['#C4B5FD', '#67E8F9', '#FDE68A'] });
        say(stage === 1 ? 'Toc toc… 🥚 (algo se mexeu lá dentro!)' : 'Crec… crec… estou quase saindo! ✨');
        onPet && onPet();
        return;
      }
      if (clicksRef.current.length >= 6) {
        clicksRef.current = [];
        setReact('dizzy');
        window.SFX && window.SFX.whoosh();
        say('Uau! Fiquei tonto 😵‍💫 Agora bora estudar?');
        reactT.current = setTimeout(() => setReact(null), 1500);
        return;
      }
      if (vit.sick) {
        window.SFX && window.SFX.dragonSad();
        window.FX && window.FX.hearts(x, y, 4);
        say('Obrigado pelo carinho… estudar comigo me cura 💚');
        onPet && onPet();
        return;
      }
      setReact('excited');
      if (window.SFX) { if (Math.random() < 0.5) window.SFX.dragonHappy(); else { window.SFX.dragonPurr(); window.SFX.dragonChirp(); } }
      window.FX && window.FX.hearts(x, y, 7);
      window.haptic && window.haptic(12);
      say(pick(WISDOM));
      onPet && onPet();
      reactT.current = setTimeout(() => setReact(null), 1300);
    };

    const saveName = () => {
      const n = (draft || '').trim().slice(0, 18);
      setEditing(false);
      if (n && n !== name) { onRename && onRename(n); window.SFX && window.SFX.check(); }
    };

    const stageProg = next ? (xp - st.minXp) / (next.minXp - st.minXp) : 1;
    const shownLevel = GM.useCountUp(lv.level, 700, Math.max(1, lv.level - 1));

    return (
      <section className={`lair arc-card mood-${mood}`}>
        <LairScene />
        <div className="lair-grid">
          <div className="lair-stage" ref={stageRef}>
            <div key={bubbleKey} className="lair-bubble">{bubble}</div>
            <button className="lair-sprite" onClick={pet} aria-label={`Fazer carinho em ${name}`}>
              <div className="lair-halo" />
              <DragonSVG stage={stage} mood={mood} skin={drg.skin} hat={drg.hat} face={drg.face} neck={drg.neck} flame={vit.chama} size={236} />
            </button>
            <div className="lair-pet-hint">toque para fazer carinho</div>
          </div>

          <div className="lair-info">
            <div className="lair-name-row">
              {editing ? (
                <input className="lair-name-input" autoFocus value={draft} maxLength={18}
                  onChange={e => setDraft(e.target.value)} onBlur={saveName}
                  onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditing(false); }} />
              ) : (
                <button className="lair-name" onClick={() => { setDraft(name); setEditing(true); }} title="Renomear seu dragão">
                  {name} <span className="lair-name-edit">✎</span>
                </button>
              )}
              <span className="lair-stage-chip">FASE {stage}/8</span>
              {vit.sick && <span className="lair-sick-chip">🤒 DOENTINHO</span>}
            </div>
            <div className="lair-stage-name">{st.name}</div>
            <div className="lair-desc">{vit.sick ? 'Seu dragão está doentinho. Estude 2 dias seguidos para curá-lo 💚' : st.desc}</div>

            <div className="lair-level">
              <div className="lair-level-badge">
                <span>NÍVEL</span>
                <b className="num">{shownLevel}</b>
              </div>
              <div className="lair-level-bars">
                <div className="lair-xp-top">
                  <span className="num">{lv.into.toLocaleString('pt-BR')} / {lv.need.toLocaleString('pt-BR')} XP</span>
                  <span className="lair-xp-total num">⚡ {xp.toLocaleString('pt-BR')}</span>
                </div>
                <div className="xp-track"><div className="xp-fill" style={{ width: `${Math.max(2, lv.progress * 100)}%` }} /></div>
                <div className="lair-evo-line">
                  {next ? <>Evolui para <b>{next.name}</b> em <b className="num">{(next.minXp - xp).toLocaleString('pt-BR')} XP</b></> : <>✨ Forma final alcançada</>}
                </div>
                <div className="evo-track"><div style={{ width: `${Math.max(1, stageProg * 100)}%` }} /></div>
              </div>
            </div>

            <div className="lair-chips">
              <span className={`lair-chip ${mult > 1 ? 'chip-hot' : ''}`} title={nextMult ? `Próximo bônus: ×${nextMult.mult} em ${nextMult.days} dia(s) de constância` : 'Bônus máximo de constância!'}>
                🔥 Bônus de constância <b>×{mult.toFixed(2).replace(/0$/, '')}</b>
              </span>
              <span className="lair-chip">{window.GemIcon && <window.GemIcon size={13} />} <b className="num">{(shared.gems || 0).toLocaleString('pt-BR')}</b> gemas</span>
              {chests.length > 0 && (
                <button className="lair-chip chip-chest" onClick={() => onOpenChest && onOpenChest(chests[0])}>
                  🧰 Abrir baú {chests.length > 1 ? `(${chests.length})` : ''}
                </button>
              )}
            </div>

            <div className="lair-needs">
              <NeedBar icon="🔥" label="Chama" value={vit.chama} color="linear-gradient(90deg,#F59E0B,#F472B6)" hint="Horas estudadas hoje vs. sua meta diária" />
              <NeedBar icon="📜" label="Sabedoria" value={vit.sab} color="linear-gradient(90deg,#22D3EE,#A78BFA)" hint="Questões e flashcards de hoje vs. suas metas" />
              <NeedBar icon="💜" label="Vínculo" value={vit.vinc} color="linear-gradient(90deg,#C084FC,#F9A8D4)" hint="Sua constância nos últimos dias" />
            </div>

            <div className="lair-actions">
              <button className="arc-btn arc-btn-ghost" onClick={onOpenWardrobe}>👑 Guarda-roupa</button>
              <button className="arc-btn arc-btn-ghost" onClick={onOpenHall}>🏅 Conquistas</button>
              <button className="arc-btn arc-btn-primary" onClick={onShare}>📸 Compartilhar</button>
            </div>
          </div>
        </div>

        {window.DailyQuests && <window.DailyQuests shared={shared} onClaim={onClaimQuest} onClaimBonus={onClaimBonus} />}
      </section>
    );
  }

  // ════════════════════════════════════════════════════════════
  //  GUARDA-ROUPA
  // ════════════════════════════════════════════════════════════
  const SLOTS = [
    { id: 'hat',  label: 'Chapéus', icon: '🎩' },
    { id: 'face', label: 'Rosto',   icon: '👓' },
    { id: 'neck', label: 'Pescoço', icon: '🎀' },
    { id: 'skin', label: 'Pele',    icon: '🎨' },
  ];

  function WardrobeModal({ shared, onClose, onBuy, onEquip }) {
    const drg = shared.dragon || {};
    const owned = new Set(['ametista', ...(drg.owned || [])]);
    const gems = shared.gems || 0;
    const [slot, setSlot] = useState('hat');
    const [preview, setPreview] = useState(null);
    const stage = Math.max(3, GM.stageFromXp(shared.xp));
    const eq = { hat: drg.hat || null, face: drg.face || null, neck: drg.neck || null, skin: drg.skin || 'ametista' };
    const look = { ...eq };
    if (preview) look[preview.slot] = preview.id;
    useEffect(() => { window.SFX && window.SFX.pop(); }, []);

    const items = WARDROBE.filter(w => w.slot === slot);
    const act = (it) => {
      if (!owned.has(it.id)) {
        if (gems < it.price) { window.SFX && window.SFX.dragonSad(); return; }
        onBuy && onBuy(it);
        return;
      }
      if (it.slot === 'skin') onEquip && onEquip('skin', it.id);
      else onEquip && onEquip(it.slot, eq[it.slot] === it.id ? null : it.id);
      window.SFX && window.SFX.tap();
    };

    return (
      <div className="arc-overlay" onClick={onClose}>
        <div className="wardrobe arc-card" onClick={e => e.stopPropagation()}>
          <button className="arc-close" onClick={onClose} aria-label="Fechar">×</button>
          <div className="wardrobe-preview">
            <div className="arc-eyebrow">GUARDA-ROUPA ARCANO</div>
            <div className="wardrobe-dragon">
              <div className="lair-halo" />
              <DragonSVG stage={stage} mood="radiant" skin={look.skin} hat={look.hat} face={look.face} neck={look.neck} flame={0.9} size={230} />
            </div>
            <div className="wardrobe-gems">{window.GemIcon && <window.GemIcon size={16} />} <b className="num">{gems.toLocaleString('pt-BR')}</b> gemas</div>
            {GM.stageFromXp(shared.xp) <= 2 && <div className="wardrobe-note">Prévia do filhote — os itens aparecem quando o ovo eclodir.</div>}
          </div>
          <div className="wardrobe-shop">
            <div className="wardrobe-tabs">
              {SLOTS.map(s => (
                <button key={s.id} className={`wardrobe-tab ${slot === s.id ? 'is-active' : ''}`} onClick={() => { setSlot(s.id); setPreview(null); window.SFX && window.SFX.tap(); }}>
                  <span>{s.icon}</span>{s.label}
                </button>
              ))}
            </div>
            <div className="wardrobe-grid">
              {items.map(it => {
                const has = owned.has(it.id);
                const on = it.slot === 'skin' ? eq.skin === it.id : eq[it.slot] === it.id;
                const can = gems >= it.price;
                const sk = it.slot === 'skin' ? SKINS[it.id] : null;
                return (
                  <button key={it.id} className={`ward-item ${on ? 'is-on' : ''} ${has ? 'is-owned' : ''}`}
                    onMouseEnter={() => setPreview(it)} onMouseLeave={() => setPreview(null)}
                    onFocus={() => setPreview(it)} onBlur={() => setPreview(null)}
                    onClick={() => act(it)}>
                    <div className="ward-thumb">
                      {sk ? <span className="ward-swatch" style={{ background: `radial-gradient(circle at 35% 30%, ${sk.body[0]}, ${sk.body[1]} 55%, ${sk.body[2]})`, boxShadow: `0 0 16px ${sk.iris}88` }} /> : <span className="ward-emoji">{it.icon}</span>}
                    </div>
                    <div className="ward-name">{it.name}</div>
                    <div className="ward-desc">{it.desc}</div>
                    <div className={`ward-cta ${!has && !can ? 'is-poor' : ''}`}>
                      {on ? '✓ Equipado' : has ? 'Usar' : <>{window.GemIcon && <window.GemIcon size={11} />} {it.price}{!can && <small> · faltam {it.price - gems}</small>}</>}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="wardrobe-tip">💡 Ganhe gemas estudando, cumprindo missões, abrindo baús e desbloqueando conquistas.</div>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  //  EVOLUÇÃO CINEMATOGRÁFICA
  // ════════════════════════════════════════════════════════════
  function DragonEvolutionModal({ fromStage, toStage, dragon = {}, onClose, onShare }) {
    const [phase, setPhase] = useState('charge');
    const to = DRAGON_STAGES[Math.max(0, toStage - 1)];
    const spriteRef = useRef(null);
    const revealed = useRef(false);

    const reveal = () => {
      if (revealed.current) return;
      revealed.current = true;
      setPhase('reveal');
      window.SFX && window.SFX.evolutionReveal();
      setTimeout(() => window.celebrateEvolution && window.celebrateEvolution(), 30);
      setTimeout(() => {
        if (window.FX && spriteRef.current) window.FX.flyTo(window.FX.elCenter(spriteRef.current), '#gem-counter', { count: 12 });
      }, 1600);
    };

    useEffect(() => {
      window.SFX && window.SFX.evolutionCharge();
      const t = setTimeout(reveal, 2400);
      return () => clearTimeout(t);
    }, []);

    return (
      <div className={`arc-overlay evo-overlay evo-${phase}`} onClick={phase === 'charge' ? reveal : undefined}>
        <div className="arc-rays evo-rays" style={{ '--ray': '#C4B5FD' }} />
        <div className="evo-circle" />
        <div className="evo-content" onClick={e => e.stopPropagation()}>
          <div className="arc-eyebrow evo-eyebrow">{phase === 'charge' ? 'ALGO ESTÁ ACONTECENDO…' : '✦ EVOLUÇÃO ✦'}</div>
          <div ref={spriteRef} className="evo-sprite">
            <DragonSVG stage={phase === 'charge' ? fromStage : toStage} mood={phase === 'charge' ? 'happy' : 'radiant'}
              skin={dragon.skin} hat={dragon.hat} face={dragon.face} neck={dragon.neck} flame={1} size={260} />
          </div>
          {phase === 'reveal' && (
            <div className="evo-text">
              <div className="evo-phase num">FASE {fromStage} → FASE {toStage}</div>
              <div className="evo-name">{to.name.split('').map((ch, i) => <span key={i} style={{ animationDelay: `${300 + i * 45}ms` }}>{ch === ' ' ? ' ' : ch}</span>)}</div>
              <div className="evo-desc">{to.desc}</div>
              <div className="ach-modal-rewards">
                <span className="reward-chip chip-gem">+50 {window.GemIcon && <window.GemIcon size={11} />}</span>
              </div>
              <div className="ach-modal-actions">
                <button className="arc-btn arc-btn-primary" onClick={() => onShare && onShare(toStage)}>📸 Compartilhar evolução</button>
                <button className="arc-btn arc-btn-ghost" onClick={onClose}>Continuar jornada →</button>
              </div>
            </div>
          )}
          {phase === 'charge' && <div className="evo-skip">toque para revelar</div>}
        </div>
      </div>
    );
  }

  // Mini avatar (header)
  function DragonAvatar({ shared, size = 40 }) {
    const drg = shared.dragon || {};
    return (
      <div className="dragon-avatar" style={{ width: size, height: size }}>
        <DragonSVG stage={GM.stageFromXp(shared.xp)} mood={shared.petHealth === 'sick' ? 'sick' : 'happy'} skin={drg.skin} hat={drg.hat} face={drg.face} neck={drg.neck} size={size * 1.25} animated={false} exportMode />
      </div>
    );
  }

  window.DRAGON_STAGES = DRAGON_STAGES;
  window.DRAGON_SKINS = SKINS;
  window.DRAGON_WARDROBE = WARDROBE;
  window.DragonSVG = DragonSVG;
  window.DragonLair = DragonLair;
  window.WardrobeModal = WardrobeModal;
  window.DragonEvolutionModal = DragonEvolutionModal;
  window.DragonAvatar = DragonAvatar;
  window.dragonVitals = dragonVitals;
  window.getDragonStage = (xp) => GM.stageFromXp(xp);
  window.getFoxStage = window.getDragonStage; // compatibilidade

  // Unifica o sistema legado de pet (usado pelo Relatório Semanal) com as fases do dragão
  if (window.DA) {
    window.DA.getPetStage = (xp) => GM.stageFromXp(xp);
    window.DA.getPetStageInfo = (xp) => {
      const x = xp || 0;
      const stage = GM.stageFromXp(x);
      const cur = DRAGON_STAGES[stage - 1];
      const next = DRAGON_STAGES[stage] || null;
      return {
        ...cur, stage,
        nextXp: next ? next.minXp : Infinity,
        progress: next ? Math.min(1, (x - cur.minXp) / (next.minXp - cur.minXp)) : 1,
        next: next ? { ...next, stage: next.id } : null,
        xpToNext: next ? next.minXp - x : 0,
      };
    };
  }
})();
