// Lendário — Marca, ícones autorais e tradutor emoji → ícone
// LogoMark: a letra L desenhada como um dragão (corpo, cabeça com chifres, asa arcana,
// cauda em lança e a estrela-guia). G: conjunto de ícones em traço 1,6. Glyph: troca um
// emoji pelo ícone da marca equivalente (com a cor semântica certa); se não houver
// equivalente, devolve o próprio caractere.

const LD_PATHS = {
  body: 'M34 98 L34 42 C34 29 41 19 52 17 C58 16 62 17 66 19 C72 21 78 23 83 25 C86 26 86 29.5 83.5 30.5 C77 31.5 70 32.5 64 33.5 C55 35 48 38 46 46 L46 84 L81 84 C88 84 92 82.5 95 79.5 L98 72 C103 74 107 78 110 84 C105 88 101 91 98 95 L93 91 C87 96.5 81 98 74 98 Z',
  wing: 'M46 57 C 57 48, 74 43, 97 42 C 92 48, 91 55, 93 62 C 87 58, 80 59, 76 66 C 71 61, 63 61, 59 68 C 56 64, 51 62, 46 64 Z',
  veins: 'M47 58 C 62 51, 80 46, 96 43 M76 65 C 74 57, 78 50, 83 46 M59 67 C 58 60, 62 55, 67 51',
  horn1: 'M44 25 C 38 16, 30 10, 17 7 C 27 14, 33 22, 37 34 Z',
  horn2: 'M55 18 C 54 11, 50 5, 42 1 C 49 6, 50 12, 48 21 Z',
  spikes: 'M34 52 C 30 53, 28 55, 26 58 C 29 58, 32 59, 34 60 Z M34 66 C 30.5 67, 29 69, 27.5 71.5 C 30 71.5, 32.5 72.5, 34 73.5 Z M34 80 C 31 81, 29.5 82.5, 28.5 85 C 30.5 85, 32.5 86, 34 87 Z',
  eye: 'M56 21.5 C 58 19, 64 18.5, 67 20.5 C 64 23.5, 59 24, 56 21.5 Z',
  brow: 'M55 18.6 C 59 16.2, 64 16.2, 68 18.3',
  mouth: 'M84 29.6 C 78 30.4, 72 30.6, 68 30.4',
  star: 'M95 9 L97 15 L103 17 L97 19 L95 25 L93 19 L87 17 L93 15 Z',
};

let __ldUid = 0;
function LogoMark({ size = 40, star = true, detail, bg = '#0E0B1F', className = '', style, title }) {
  const uid = React.useMemo(() => 'ld' + (++__ldUid), []);
  const d = detail === undefined ? size >= 28 : detail;
  const g = `url(#${uid}g)`;
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className={className} style={style}
      role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <defs>
        <linearGradient id={`${uid}g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFF1C9" /><stop offset=".45" stopColor="#E8C47A" /><stop offset="1" stopColor="#9C6E2C" />
        </linearGradient>
        <linearGradient id={`${uid}w`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#A89CFF" /><stop offset="1" stopColor="#2A1E78" />
        </linearGradient>
      </defs>
      <path className="ld-wing" d={LD_PATHS.wing} fill={`url(#${uid}w)`} stroke={g} strokeWidth="1.5" strokeLinejoin="round" />
      {d && <path d={LD_PATHS.veins} fill="none" stroke="#E8C47A" strokeOpacity=".5" strokeWidth=".9" />}
      <path d={LD_PATHS.horn1} fill={g} /><path d={LD_PATHS.horn2} fill={g} />
      <path d={LD_PATHS.body} fill={g} /><path d={LD_PATHS.spikes} fill={g} />
      <path d={LD_PATHS.eye} fill={bg} />
      <circle className="ld-eye" cx="61.8" cy="21.4" r="1.5" fill="#C9C1FF" />
      {d && <path d={LD_PATHS.brow} fill="none" stroke="#9C6E2C" strokeWidth="1" strokeLinecap="round" />}
      {d && <circle cx="80.2" cy="26.2" r="1" fill="#6E4A18" />}
      {d && <path d={LD_PATHS.mouth} fill="none" stroke="#9C6E2C" strokeWidth=".9" strokeLinecap="round" />}
      {star && <path className="ld-star" d={LD_PATHS.star} fill="#FFF1C9" />}
    </svg>
  );
}

function Wordmark({ size = 20, tagline = false, className = '' }) {
  return (
    <span className={`ld-wordmark ${className}`} style={{ display: 'inline-flex', flexDirection: 'column', gap: 2, lineHeight: 1 }}>
      <span className="ld-word gold-leaf" style={{ fontSize: size }}>LENDÁRIO</span>
      {tagline && <span className="ld-tagline">ESTUDE COMO UMA LENDA</span>}
    </span>
  );
}

// ── Ícones autorais (24×24, traço 1,6) ─────────────────────
const GP = {
  sun: 'M3 18h18M6 18a6 6 0 0 1 12 0M12 5v3M5.6 9.6l2 2M18.4 9.6l-2 2',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z M12 7.5c1.1 1.3 1.6 2.8 1.6 4.5s-.5 3.2-1.6 4.5c-1.1-1.3-1.6-2.8-1.6-4.5s.5-3.2 1.6-4.5Z',
  scroll: 'M8 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8 M8 4a2 2 0 0 0-2 2v12a2 2 0 0 1-2 2h4 M11 9h6M11 13h6M11 17h3',
  target: 'M12 20a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z M12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z M12 12 20 4M16 4h4v4',
  trophy: 'M8 4h8v5a4 4 0 0 1-8 0Z M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M9 21h6M10 17h4',
  bars: 'M3 20h18M6 16v-5M11 16V7M16 16v-7M21 16V4',
  hourglass: 'M7 3h10M7 21h10M8 3v3l4 6-4 6v3M16 3v3l-4 6 4 6v3',
  astrolabe: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z M12 2v2M12 20v2M2 12h2M20 12h2',
  flame: 'M12 2.5c1.2 3.2 5.5 5.3 5.5 10.8a5.5 5.5 0 0 1-11 0c0-2.3 1.1-3.9 2.2-5 0 2.1 1 3.3 2.2 3.3 0-3.4-1.2-5.6 1.1-9.1Z',
  spark: 'M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2Z',
  gem: 'M6 3h12l4 6-10 12L2 9Z M2 9h20M9 3l3 6 3-6M12 9v12',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6Z M9 12l2 2 4-4',
  chest: 'M3 11a7 7 0 0 1 7-7h4a7 7 0 0 1 7 7v9H3Z M3 12h18M10.5 10.5h3v4h-3Z',
  compass: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M15.5 8.5 13.5 13.5 8.5 15.5 10.5 10.5Z',
  quill: 'M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16Z M13.5 6.5l4 4',
  scales: 'M12 3v18M7 21h10M5 7h14M5 7l-3 6a3 3 0 0 0 6 0Z M19 7l-3 6a3 3 0 0 0 6 0Z',
  book: 'M2 5c3-1 6-1 10 1 4-2 7-2 10-1v14c-3-1-6-1-10 1-4-2-7-2-10-1Z M12 6v14',
  books: 'M4 4h4v16H4Z M10 4h4v16h-4Z M16 5l3.5-1 3 15.5-3.5 1Z',
  heart: 'M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9Z',
  lock: 'M6 11h12v10H6Z M8.5 11V8a3.5 3.5 0 0 1 7 0v3',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M12 7v5l3 2',
  calendar: 'M4 6h16v14H4Z M4 10h16M8 3v4M16 3v4',
  crown: 'M3 8l4 4 5-7 5 7 4-4-2 11H5Z',
  owl: 'M5 9c0-3 3-5 7-5s7 2 7 5v6c0 3.5-3 6-7 6s-7-2.5-7-6Z M8 11.5a1.6 1.6 0 1 0 3.2 0 1.6 1.6 0 1 0-3.2 0 M12.8 11.5a1.6 1.6 0 1 0 3.2 0 1.6 1.6 0 1 0-3.2 0 M11 15l1 1.2 1-1.2 M6 6 4.5 3.5M18 6l1.5-2.5',
  potion: 'M9 3h6M10 3v5L5 18a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3L14 8V3 M7 15h10',
  hat: 'M4 20h16M6 20c2-6 4-12 9-16-1 5 0 11 3 16',
  cap: 'M12 4 2 9l10 5 10-5Z M6 11v5c3 2 9 2 12 0v-5M22 9v6',
  map: 'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2Z M9 4v14M15 6v14',
  trendUp: 'M3 17l6-6 4 4 8-8M15 7h6v6',
  trendDown: 'M3 7l6 6 4-4 8 8M15 17h6v-6',
  warning: 'M12 3 2 20h20Z M12 10v4M12 17h.01',
  bulb: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z',
  sparkles: 'M10 3l1.6 5.4L17 10l-5.4 1.6L10 17l-1.6-5.4L3 10l5.4-1.6Z M18 14l.8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8Z',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z',
  moon: 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z',
  bolt: 'M13 2L4 14h7l-1 8 9-12h-7l1-8Z',
  gift: 'M3 9h18v4H3Z M5 13h14v8H5Z M12 9v12 M12 9C10 5 6 5 6 7.5S12 9 12 9Zm0 0c2-4 6-4 6-1.5S12 9 12 9Z',
  camera: 'M4 8h3l2-3h6l2 3h3v12H4Z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  rocket: 'M12 3c4 2 6 6 6 10l-3 3H9l-3-3c0-4 2-8 6-10Z M10.5 10a1.5 1.5 0 1 0 3 0 1.5 1.5 0 1 0-3 0 M9 16l-2 5 3-2M15 16l2 5-3-2',
  temple: 'M3 21h18M4 10h16M12 3l9 5H3Z M6 10v8M10 10v8M14 10v8M18 10v8M4 18h16',
  castle: 'M4 21V9h3V6h2v3h2V6h2v3h2V6h2v3h3v12Z M10 21v-5h4v5',
  egg: 'M12 3c3.5 0 6.5 5.5 6.5 10a6.5 6.5 0 0 1-13 0C5.5 8.5 8.5 3 12 3Z',
  eggCrack: 'M12 3c3.5 0 6.5 5.5 6.5 10a6.5 6.5 0 0 1-13 0C5.5 8.5 8.5 3 12 3Z M6 12l3 2 2-3 2 3 2-2 3 1',
  sprout: 'M12 21v-9M12 12c0-4-3-6-7-6 0 4 3 6 7 6Z M12 14c0-4 3-6 7-6 0 4-3 6-7 6Z',
  help: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17h.01',
  refresh: 'M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4',
  swords: 'M5 3l14 14M3 5l2-2M15 19l4-2 2-2M19 3 5 17M21 5l-2-2M9 19l-4-2-2-2',
  brain: 'M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V6a2 2 0 0 0-3-2Z M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1',
  cookie: 'M12 3a9 9 0 1 0 9 9 3 3 0 0 1-3-3 3 3 0 0 1-3-3 3 3 0 0 1-3-3Z M8.5 11h.01M11 16h.01M15.5 14h.01',
  key: 'M8 15a4 4 0 1 1 3.5-6H21v3h-2v2h-3v-2h-4.5A4 4 0 0 1 8 15Z',
  save: 'M5 3h11l3 3v15H5Z M8 3v5h7V3M8 21v-7h8v7',
  checkCircle: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M8 12l3 3 5-6',
  chat: 'M4 5h16v11H9l-5 4Z',
  lotus: 'M10.5 5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 1 0-3 0 M5 20c2-4 4-5 7-5s5 1 7 5M8 12c2 1 6 1 8 0M12 7v5',
  leaf: 'M5 19C5 10 10 5 20 4c-1 10-6 15-15 15Z M5 19l8-8',
  shuffle: 'M3 7h4l10 10h4M3 17h4l3-3M14 10l3-3h4M18 4l3 3-3 3M18 14l3 3-3 3',
  bell: 'M6 16v-5a6 6 0 0 1 12 0v5l2 2H4Z M10 21h4',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14',
  sound: 'M4 9h4l5-4v14l-5-4H4Z M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11',
  mute: 'M4 9h4l5-4v14l-5-4H4Z M17 9l5 6M22 9l-5 6',
  palette: 'M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2s-1-1.5-1-2.5 1-1.5 2-1.5h2a4 4 0 0 0 4-4c0-4.5-4-8-9-8Z M7.5 11h.01M9.5 7.5h.01M14.5 7.5h.01',
  orb: 'M12 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z M8 21h8M7 18l-1 3M17 18l1 3M9 8a3 3 0 0 1 3-2',
  thermo: 'M10 4a2 2 0 0 1 4 0v10a4 4 0 1 1-4 0Z M12 9v7',
  zzz: 'M4 5h5l-5 6h5M13 11h4l-4 5h4M18 3h3l-3 4h3',
  medal: 'M8 3l2 6M16 3l-2 6M12 21a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z M12 12.5l1 2h2.2l-1.8 1.3.7 2.1-2.1-1.3-2.1 1.3.7-2.1-1.8-1.3H11Z',
  phone: 'M7 3h10v18H7Z M11 18h2',
  film: 'M4 6h16v14H4Z M4 10h16M8 6l2 4M13 6l2 4',
  gamepad: 'M6 9h12a4 4 0 0 1 4 4v2a3 3 0 0 1-5 2l-2-2H9l-2 2a3 3 0 0 1-5-2v-2a4 4 0 0 1 4-4Z M7 12v3M5.5 13.5h3M16 13h.01M18 15h.01',
  mountain: 'M3 20l6-10 4 6 3-4 5 8Z',
  sunFull: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z M12 1v3M12 20v3M1 12h3M20 12h3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1',
  comet: 'M14 10a4 4 0 1 1-5.7 5.7 4 4 0 0 1 5.7-5.7Z M13 9l7-7M15 12l6-4M10 8l3-6',
  infinity: 'M7 16a4 4 0 1 1 0-8c4 0 6 8 10 8a4 4 0 1 0 0-8c-4 0-6 8-10 8Z',
  dagger: 'M20 4 9 15 M20 4h-4M20 4v4 M7 13l4 4 M8 16l-4 4',
  rain: 'M7 17a4 4 0 0 1-.7-7.9A6 6 0 0 1 17.8 8 4.5 4.5 0 0 1 17 17Z M9 20l1-2M13 21l1-2M17 20l1-2',
  wing: 'M4 18C4 10 10 4 20 4c-2 3-2 5 0 7-3 0-5 1-6 3-2-1-4 0-5 2-1-1-3-1-5 2Z',
  mirror: 'M12 16a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z M12 16v5M9 21h6',
  tag: 'M3 3h8l10 10-8 8L3 11Z M7.5 7.5h.01',
  money: 'M9 4h6l-2 3h-2Z M12 7c5 0 8 5 8 9a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4c0-4 3-9 8-9Z M12 11v6',
  bag: 'M5 8h14l-1 13H6Z M9 8V6a3 3 0 0 1 6 0v2',
  gavel: 'M14 5l5 5M16 3l5 5M11 8l5 5M4 20l7-7M3 21h9',
  glasses: 'M3 12a3.5 3.5 0 1 0 7 0 3.5 3.5 0 0 0-7 0Z M14 12a3.5 3.5 0 1 0 7 0 3.5 3.5 0 0 0-7 0Z M10 12h4M3 12 2 9M21 12l1-3',
  scarf: 'M6 4h12v5c0 2-2 3-6 3s-6-1-6-3Z M9 12v8l2-1 1 2 1-2 2 1v-8',
  bow: 'M12 12 4 7v10Z M12 12l8-5v10Z',
  feather: 'M20 4C10 4 5 10 5 19M5 19l3-3M9 15h5M11 11h6M14 7h4',
  rainbow: 'M3 18a9 9 0 0 1 18 0M6.5 18a5.5 5.5 0 0 1 11 0M10 18a2 2 0 0 1 4 0',
  mushroom: 'M4 12a8 8 0 0 1 16 0Z M9 12v6a3 3 0 0 0 6 0v-6',
  telescope: 'M3 14l14-6 2 4-14 6Z M10 16l-2 5M12 15l3 6',
  masks: 'M4 5h16v6a8 8 0 0 1-16 0Z M8 10h2M14 10h2M9 14c2 1.5 4 1.5 6 0',
  pause: 'M8 5v14M16 5v14',
  play: 'M7 4v16l13-8Z',
  check: 'M4 12l5 5L20 6',
  close: 'M6 6l12 12M18 6 6 18',
  share: 'M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13',
  upload: 'M12 21V9M7 14l5-5 5 5M4 3h16',
  eyeOpen: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  face: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M8.5 10h.01M15.5 10h.01M8.5 14.5c2 2 5 2 7 0',
  faceSad: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M8.5 10h.01M15.5 10h.01M8.5 16c2-2 5-2 7 0',
  faceFlat: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M8.5 10h.01M15.5 10h.01M9 15h6',
  faceWow: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M8 9.5l1.2 1.2M16 9.5l-1.2 1.2M10 15a2 2 0 0 0 4 0',
};
const FILLED = { flame: 1, spark: 1, heart: 1, star: 1, crown: 1, bolt: 1, play: 1, gem: 0 };

function G({ name, size = 18, color = 'currentColor', stroke = 1.6, filled, className = '', style, title }) {
  const d = GP[name];
  if (!d) return null;
  const fillIt = filled !== undefined ? filled : !!FILLED[name];
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={`ld-g ${className}`} style={{ flexShrink: 0, verticalAlign: '-0.14em', ...style }}
      fill={fillIt ? color : 'none'} stroke={fillIt ? 'none' : color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <path d={d} />
    </svg>
  );
}

// Tradução emoji → ícone da marca, com cor semântica
const GOLD = '#E8C47A', EMBER = '#FF9A5A', MANA = '#B7AAFF', ROSE = '#FF9AB8', JADE = '#4FD1A5', RUBI = '#FF7A8A', MOON = '#8FB8FF';
const EMOJI_GLYPH = {
  '🏠': ['sun'], '🌅': ['sun', GOLD], '🐉': ['dragon'], '🐲': ['dragon'], '📋': ['scroll'], '📜': ['scroll'], '📄': ['scroll'], '📰': ['scroll'], '📝': ['quill'],
  '🎯': ['target', GOLD], '🏹': ['target', GOLD], '🏆': ['trophy', GOLD], '📊': ['bars', MOON], '⚙': ['astrolabe'], '⚙️': ['astrolabe'],
  '🔥': ['flame', EMBER], '⚡': ['bolt', GOLD], '💪': ['bolt', GOLD], '💎': ['gem', MANA], '💠': ['gem', MANA], '🛡': ['shield', JADE], '🛡️': ['shield', JADE],
  '🎁': ['chest', GOLD], '🧭': ['compass', GOLD], '🗺': ['map', GOLD], '🗺️': ['map', GOLD], '✏': ['quill', GOLD], '✏️': ['quill', GOLD], '✍': ['quill', GOLD], '✍️': ['quill', GOLD],
  '⚖': ['scales', GOLD], '⚖️': ['scales', GOLD], '📚': ['books', GOLD], '📖': ['book', GOLD], '📕': ['book', RUBI],
  '💜': ['heart', ROSE], '💚': ['heart', JADE], '❤': ['heart', ROSE], '❤️': ['heart', ROSE], '🔒': ['lock'], '⏱': ['clock', MOON], '⏱️': ['clock', MOON], '⏰': ['clock', EMBER], '⏲': ['clock', MOON],
  '📅': ['calendar'], '👑': ['crown', GOLD], '🦉': ['owl', GOLD], '🧪': ['potion', MANA], '🧙': ['hat', MANA], '🎩': ['hat', MANA], '🎓': ['cap', GOLD],
  '📈': ['trendUp', JADE], '📉': ['trendDown', RUBI], '⚠': ['warning', EMBER], '⚠️': ['warning', EMBER], '🚨': ['warning', RUBI], '💡': ['bulb', GOLD],
  '✨': ['sparkles', GOLD], '💫': ['sparkles', GOLD], '🎉': ['sparkles', GOLD], '🌟': ['star', GOLD], '⭐': ['star', GOLD], '🌙': ['moon', MANA], '☽': ['moon', MANA],
  '📸': ['camera'], '📤': ['share'], '🚀': ['rocket', EMBER], '🏛': ['temple', GOLD], '🏛️': ['temple', GOLD], '🏰': ['castle', GOLD],
  '🥚': ['egg', GOLD], '🐣': ['eggCrack', GOLD], '🌱': ['sprout', JADE], '🌿': ['leaf', JADE], '🍄': ['mushroom', RUBI], '❓': ['help', MOON],
  '🔄': ['refresh'], '🔁': ['refresh'], '🔀': ['shuffle'], '⚔': ['swords', GOLD], '⚔️': ['swords', GOLD], '🗡': ['dagger', GOLD], '🗡️': ['dagger', GOLD],
  '🧠': ['brain', MANA], '🍪': ['cookie', GOLD], '🗝': ['key', GOLD], '🗝️': ['key', GOLD], '💾': ['save'], '✅': ['checkCircle', JADE], '👍': ['checkCircle', JADE],
  '💬': ['chat'], '🗨': ['chat'], '🗨️': ['chat'], '🧘': ['lotus', MANA], '🔔': ['bell', GOLD], '🗑': ['trash', RUBI], '🔊': ['sound'], '🔇': ['mute'],
  '🎨': ['palette', GOLD], '🔮': ['orb', MANA], '🌌': ['orb', MANA], '🤒': ['thermo', RUBI], '💤': ['zzz', MANA], '🏅': ['medal', GOLD], '🎖': ['medal', GOLD], '🎖️': ['medal', GOLD],
  '📱': ['phone'], '🎬': ['film'], '🎮': ['gamepad', MANA], '🏔': ['mountain', MOON], '🏔️': ['mountain', MOON], '🌋': ['mountain', EMBER], '☀': ['sunFull', GOLD], '☀️': ['sunFull', GOLD],
  '☄': ['comet', EMBER], '☄️': ['comet', EMBER], '♾': ['infinity', GOLD], '♾️': ['infinity', GOLD], '🌧': ['rain', MOON], '🌧️': ['rain', MOON], '🪽': ['wing', MANA],
  '🪞': ['mirror', MANA], '🏷': ['tag', GOLD], '🏷️': ['tag', GOLD], '💰': ['money', GOLD], '🛍': ['bag', GOLD], '🛍️': ['bag', GOLD], '🔨': ['gavel', GOLD],
  '👓': ['glasses', GOLD], '🧐': ['glasses', GOLD], '🧣': ['scarf', RUBI], '🎀': ['bow', ROSE], '🪶': ['feather', GOLD], '🌈': ['rainbow', MANA], '🔭': ['telescope', MOON],
  '🎭': ['masks', MANA], '⏳': ['hourglass', GOLD], '⏸': ['pause'], '👀': ['eyeOpen'], '👁': ['eyeOpen', MANA], '👁️': ['eyeOpen', MANA],
  '😊': ['face', JADE], '😆': ['face', GOLD], '🤩': ['faceWow', GOLD], '😋': ['face', ROSE], '😐': ['faceFlat'], '😕': ['faceSad', MOON], '🥺': ['faceSad', MANA],
};

function Glyph({ e, size = '1em', color, className = '', style }) {
  if (e === null || e === undefined || e === '') return null;
  if (typeof e !== 'string') return e;
  const key = e.trim();
  const hit = EMOJI_GLYPH[key] || EMOJI_GLYPH[key.replace(/️/g, '')];
  if (!hit) return <span className={className} style={style}>{e}</span>;
  const [name, c] = hit;
  if (name === 'dragon') return <LogoMark size={size === '1em' ? '1.15em' : size} star={false} detail={false} className={`ld-glyph ${className}`} style={{ verticalAlign: '-0.2em', ...style }} />;
  return <G name={name} size={size} color={color || c || 'currentColor'} className={`ld-glyph ${className}`} style={style} />;
}

// Troca emojis dentro de um texto livre por ícones (para rótulos como "🎯 Metas")
const EMOJI_RE = /(\p{Extended_Pictographic}️?)/u;
function GlyphText({ text, size = '1em' }) {
  if (typeof text !== 'string') return text;
  const parts = text.split(EMOJI_RE);
  return <>{parts.map((p, i) => (i % 2 === 1 ? <Glyph key={i} e={p} size={size} /> : p))}</>;
}

Object.assign(window, { LogoMark, Wordmark, G, Glyph, GlyphText, LD_PATHS, EMOJI_GLYPH, LD_GLYPHS: GP });
