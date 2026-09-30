// Lendário — Heatmaps v2 — GitHub-style density, rounded cells, smooth color transitions
// + Ultra-premium ConcursoDonuts redesign

function SubjectDonuts({ subjects, mode = 'objetiva' }) {
  const colors = ['#8FB8FF', 'var(--tinta)', 'var(--esmeralda)', '#FFB057', 'var(--coral)', '#8FB8FF', 'var(--tinta)'];
  const colorsRaw = ['#8FB8FF', '#B7AAFF', '#4FD1A5', '#FFB057', '#FF7A8A', '#8FB8FF', '#B7AAFF'];
  const compute = mode === 'discursiva' ? window.DA.getSubjectCompletionDisc : window.DA.getSubjectCompletionObj;

  return (
    <div className="glass" style={{ padding: '16px 18px' }}>
      <div style={{ fontSize: 9.5, letterSpacing: '0.22em', color: 'var(--text-muted)', marginBottom: 16, fontFamily: 'var(--font-label)', fontWeight: 700, textTransform: 'uppercase' }}>
        CONCLUSÃO POR DISCIPLINA
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: 12 }}>
        {subjects.map((s, i) => {
          const pct = compute(s);
          const color = colors[i % colors.length];
          const colorRaw = colorsRaw[i % colorsRaw.length];
          const r = 38; const circ = 2 * Math.PI * r;
          return (
            <div key={s.id} style={{
              textAlign: 'center',
              animation: `donut-in 500ms ${i * 70}ms cubic-bezier(0.16,1,0.3,1) both`,
              padding: '10px 6px', borderRadius: 12,
              background: `radial-gradient(ellipse at 50% 0%, ${colorRaw}08, transparent 70%)`,
              border: `1px solid ${colorRaw}18`,
              transition: 'all 180ms ease', cursor: 'default',
            }}>
              <div style={{ position: 'relative', width: 72, height: 72, margin: '0 auto' }}>
                <svg viewBox="0 0 100 100" width={72} height={72} style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}>
                  {/* Track */}
                  <circle cx="50" cy="50" r={r} fill="none" stroke={`${colorRaw}14`} strokeWidth="7" />
                  {/* Progress */}
                  <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="7"
                    strokeDasharray={`${(pct / 100) * circ} ${circ}`} strokeLinecap="round"
                    style={{
                      filter: `drop-shadow(0 0 4px ${colorRaw}70)`,
                      transition: 'stroke-dasharray 700ms cubic-bezier(0.16,1,0.3,1)',
                    }} />
                </svg>
                <div className="num" style={{
                  position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
                  fontSize: 15, fontWeight: 800, color,
                  filter: `drop-shadow(0 0 4px ${colorRaw}55)`,
                }}>
                  {Math.round(pct)}<span style={{ fontSize: 8, opacity: 0.65, fontWeight: 600 }}>%</span>
                </div>
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 7, lineHeight: 1.2, fontWeight: 600 }}>
                {s.shortName || s.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// GitHub-style contribution heatmap
// ──────────────────────────────────────────────────────────
function buildHeat(logs, field, view) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString().slice(0, 10);

  if (view === 'month') {
    const first = new Date(today.getFullYear(), today.getMonth(), 1);
    const map = new Map(logs.map(l => [l.date, l]));
    const cells = [];
    for (let i = 0; i < today.getDate(); i++) {
      const d = new Date(first); d.setDate(first.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      const log = map.get(iso);
      cells.push({ date: iso, value: log ? (log[field] || 0) : 0, placeholder: false, isToday: iso === todayISO, dow: d.getDay() });
    }
    return { cells, view };
  }

  // Year view — 52 weeks + partial
  const DAYS = 365;
  const start = new Date(today); start.setDate(start.getDate() - (DAYS - 1));
  const padStart = new Date(start); padStart.setDate(padStart.getDate() - padStart.getDay());
  const map = new Map(logs.map(l => [l.date, l]));
  const cells = [];
  const totalCells = Math.ceil((today - padStart) / 86400000) + 1;
  for (let i = 0; i < totalCells; i++) {
    const d = new Date(padStart); d.setDate(padStart.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const beforeStart = d < start;
    const log = map.get(iso);
    cells.push({ date: iso, value: log ? (log[field] || 0) : 0, placeholder: beforeStart, isToday: iso === todayISO, dow: d.getDay() });
  }
  const weeks = Math.ceil(totalCells / 7);
  return { cells, weeks, view };
}

function HeatmapCard({ logs, title, field, color, label, unit, headerAction }) {
  const [view, setView] = React.useState('month');
  const heat = buildHeat(logs, field, view);
  const { cells } = heat;

  const realCells = cells.filter(c => !c.placeholder);
  const values = realCells.map(c => c.value);
  const max = Math.max(1, ...values);
  const total = values.reduce((a, v) => a + v, 0);
  const active = values.filter(v => v > 0).length;

  // Smooth gradient using oklch/color-mix
  const cellBg = (v, placeholder) => {
    if (placeholder) return 'transparent';
    if (v === 0) return 'rgba(243,235,221,0.045)';
    const t = Math.min(1, v / max);
    // 4 intensity levels for premium look
    // Escala sequencial de um só tom, do nanquim até a luz (tema escuro)
    if (t < 0.25) return `color-mix(in oklab, ${color} 26%, #141124 74%)`;
    if (t < 0.50) return `color-mix(in oklab, ${color} 48%, #141124 52%)`;
    if (t < 0.75) return `color-mix(in oklab, ${color} 72%, #141124 28%)`;
    return `color-mix(in oklab, ${color} 96%, #FFF6DE 4%)`;
  };

  const MONTHS_PT = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  const CELL_Y = 13, GAP_Y = 3;
  const CELL_M = 34, GAP_M = 4;

  return (
    <div className="glass" style={{ padding: '16px 18px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontSize: 9.5, letterSpacing: '0.22em', color: 'var(--text-muted)', fontFamily: 'var(--font-label)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
            {title}
          </div>
          <div className="font-display" style={{ fontSize: 18, fontWeight: 700, marginTop: 2 }}>
            <span className="num" style={{ color }}>{total.toFixed(field === 'hours' ? 1 : 0)}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 7, fontWeight: 400 }}>
              {label} · <span style={{ fontWeight: 600 }}>{active}</span> dias ativos {view === 'month' ? 'no mês' : 'no ano'}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {headerAction}
          <div style={{ display: 'flex', gap: 4, padding: 3, background: 'rgba(243,235,221,0.04)', borderRadius: 8, border: '1px solid rgba(243,235,221,0.07)' }}>
            {['month','year'].map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
                background: view === v ? 'var(--petroleo)' : 'transparent',
                color: view === v ? '#F7E7C1' : 'var(--text-muted)',
                transition: 'all 160ms ease',
                boxShadow: view === v ? '0 2px 8px rgba(74,54,196,0.25)' : 'none',
              }}>
                {v === 'month' ? 'Mês' : 'Ano'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MONTH VIEW — calendar grid */}
      {view === 'month' && (() => {
        const today = new Date(); today.setHours(0,0,0,0);
        const first = new Date(today.getFullYear(), today.getMonth(), 1);
        const padBefore = first.getDay();
        const monthName = first.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        const DOWS = ['D','S','T','Q','Q','S','S'];
        return (
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'capitalize', marginBottom: 10, letterSpacing: '0.04em' }}>
              {monthName}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: GAP_M }}>
              {DOWS.map((d, i) => (
                <div key={'h'+i} style={{ textAlign: 'center', fontSize: 9, color: 'var(--text-dim)', fontWeight: 800, fontFamily: 'var(--font-num)', paddingBottom: 4 }}>
                  {d}
                </div>
              ))}
              {Array.from({ length: padBefore }).map((_, i) => (
                <div key={'p'+i} style={{ height: CELL_M }} />
              ))}
              {cells.map((c, i) => {
                const bg = cellBg(c.value, false);
                const day = new Date(c.date + 'T00:00:00').getDate();
                const isWeekend = c.dow === 0 || c.dow === 6;
                const valStr = c.value > 0
                  ? (field === 'hours' ? c.value.toFixed(c.value >= 10 ? 0 : 1) : c.value.toLocaleString('pt-BR'))
                  : null;
                return (
                  <div key={i}
                    className="heat-cell"
                    title={`${c.date}: ${c.value.toFixed(field === 'hours' ? 1 : 0)}${unit}`}
                    style={{
                      position: 'relative',
                      height: CELL_M, borderRadius: 8,
                      background: bg,
                      border: `1px solid ${c.isToday ? color : (c.value > 0 ? 'transparent' : 'rgba(243,235,221,0.06)')}`,
                      boxShadow: c.isToday ? `0 0 0 2px ${color}44, 0 0 8px ${color}33` : (c.value > 0 ? `0 1px 3px rgba(0,0,0,0.06)` : 'none'),
                      display: 'grid', placeItems: 'center',
                      opacity: isWeekend && c.value === 0 ? 0.55 : 1,
                      transition: 'all 120ms ease',
                      overflow: 'hidden',
                    }}>
                    <span style={{
                      position: 'absolute', top: 3, left: 4,
                      fontSize: 8.5, fontWeight: 700,
                      color: 'var(--text-dim)',
                      fontFamily: 'var(--font-num)',
                      letterSpacing: '0.02em',
                      lineHeight: 1,
                    }}>{day}</span>
                    {valStr && (
                      <span className="num" style={{
                        fontSize: valStr.length >= 4 ? 11 : 13,
                        fontWeight: 800,
                        color: c.value / max >= 0.75 ? '#1A1235' : '#F3EBDD',
                        lineHeight: 1,
                        marginTop: 4,
                      }}>{valStr}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* YEAR VIEW — GitHub-style contribution graph */}
      {view === 'year' && (() => {
        const { weeks } = heat;
        const DOWS_LABEL = ['', 'Seg', '', 'Qua', '', 'Sex', ''];
        const monthLabels = [];
        let lastMonth = -1;
        for (let w = 0; w < weeks; w++) {
          const c = cells[w * 7];
          if (!c || c.placeholder) continue;
          const d = new Date(c.date);
          const m = d.getMonth();
          if (m !== lastMonth) { monthLabels.push({ col: w, label: MONTHS_PT[m] }); lastMonth = m; }
        }
        return (
          <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
            <div style={{ display: 'inline-flex', gap: 0 }}>
              {/* Day labels column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: GAP_Y, paddingTop: 20, paddingRight: 6, flexShrink: 0 }}>
                {DOWS_LABEL.map((l, i) => (
                  <div key={i} style={{
                    height: CELL_Y, fontSize: 8.5, color: 'var(--text-dim)',
                    fontFamily: 'var(--font-num)', fontWeight: 600,
                    display: 'flex', alignItems: 'center', letterSpacing: '0.04em',
                    width: 22,
                  }}>{l}</div>
                ))}
              </div>
              <div style={{ position: 'relative' }}>
                {/* Month labels */}
                <div style={{ height: 18, position: 'relative', marginBottom: 2 }}>
                  {monthLabels.map((m, i) => (
                    <div key={i} style={{
                      position: 'absolute', left: m.col * (CELL_Y + GAP_Y),
                      fontSize: 9, color: 'var(--text-muted)',
                      fontFamily: 'var(--font-num)', fontWeight: 700,
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                    }}>{m.label}</div>
                  ))}
                </div>
                {/* Cell grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${weeks}, ${CELL_Y}px)`,
                  gridAutoFlow: 'column',
                  gridTemplateRows: `repeat(7, ${CELL_Y}px)`,
                  gap: GAP_Y,
                }}>
                  {cells.map((c, i) => {
                    const bg = cellBg(c.value, c.placeholder);
                    return (
                      <div key={i}
                        className={c.placeholder ? '' : 'heat-cell'}
                        title={c.placeholder ? '' : `${c.date}: ${c.value.toFixed(field === 'hours' ? 1 : 0)}${unit}`}
                        style={{
                          width: CELL_Y, height: CELL_Y,
                          borderRadius: 4,
                          background: bg,
                          border: c.placeholder ? 'none' : `1px solid ${c.isToday ? color : (c.value > 0 ? 'transparent' : 'rgba(243,235,221,0.05)')}`,
                          boxShadow: c.isToday && !c.placeholder ? `0 0 0 1.5px ${color}55, 0 0 6px ${color}44` : (c.value > 0 ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'),
                          transition: 'all 120ms ease',
                        }} />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, fontSize: 9, color: 'var(--text-dim)', fontFamily: 'var(--font-label)', fontWeight: 600, letterSpacing: '0.1em' }}>
        <span>{view === 'month' ? 'MÊS ATUAL' : 'ÚLTIMOS 365 DIAS'}</span>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <span>menos</span>
          {[0.22, 0.42, 0.65, 0.88].map((t, i) => (
            <div key={i} style={{
              width: 11, height: 11, borderRadius: 3,
              background: `color-mix(in oklab, ${color} ${Math.round(t * 100)}%, #141124 ${Math.round((1-t) * 100)}%)`,
              boxShadow: i === 3 ? `0 0 6px ${color}55` : 'none',
            }} />
          ))}
          <span>mais</span>
        </div>
      </div>
    </div>
  );
}

function StudyHeatmap({ logs }) {
  return <HeatmapCard logs={logs} title="HEATMAP DE HORAS" field="hours" color="#E8C47A" label="horas" unit="h" />;
}

function QuestionsFlashcardsHeatmap({ logs }) {
  const [mode, setMode] = React.useState('questions');
  const isQ = mode === 'questions';
  const color = isQ ? '#B7AAFF' : '#8FB8FF';
  const colorBg = isQ ? 'rgba(183,170,255,0.10)' : 'rgba(143,184,255,0.10)';
  const colorBorder = isQ ? 'rgba(183,170,255,0.35)' : 'rgba(143,184,255,0.45)';
  const otherLabel = isQ ? 'Flash Cards' : 'Questões';
  const otherColor = isQ ? '#8FB8FF' : '#B7AAFF';
  const toggleBtn = (
    <button
      onClick={() => setMode(isQ ? 'flashcards' : 'questions')}
      title={`Mostrar ${otherLabel}`}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '6px 12px', borderRadius: 99, cursor: 'pointer',
        border: `1px solid ${otherColor}`,
        background: `linear-gradient(135deg, ${otherColor}22, ${otherColor}11)`,
        color: otherColor,
        fontSize: 11, fontWeight: 800, letterSpacing: '0.04em',
        fontFamily: 'var(--font-num)',
        boxShadow: `0 2px 8px ${otherColor}33, 0 0 0 1px rgba(255,255,255,0.06) inset`,
        transition: 'all 160ms ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 4px 14px ${otherColor}55, 0 0 0 1px rgba(255,255,255,0.6) inset`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 2px 8px ${otherColor}33, 0 0 0 1px rgba(255,255,255,0.6) inset`; }}
    >
      {isQ ? '🃏' : '❓'} Ver {otherLabel}
    </button>
  );
  if (isQ) {
    return <HeatmapCard logs={logs} title="HEATMAP DE QUESTÕES" field="questions" color={color} label="questões" unit="" headerAction={toggleBtn} />;
  }
  return <HeatmapCard logs={logs} title="HEATMAP DE FLASH CARDS" field="reviews" color={color} label="flashcards" unit="" headerAction={toggleBtn} />;
}

// Backwards compatibility — kept so old references keep working
function FlashcardHeatmap({ logs }) {
  return <QuestionsFlashcardsHeatmap logs={logs} />;
}

window.SubjectDonuts = SubjectDonuts;
window.StudyHeatmap = StudyHeatmap;
window.QuestionsFlashcardsHeatmap = QuestionsFlashcardsHeatmap;
window.FlashcardHeatmap = FlashcardHeatmap;
