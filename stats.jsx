// Lendário — Página de Estatísticas (Bloco 5)

function ActivityCurve({ logs }) {
  const { useState: useSt, useRef, useEffect } = React;
  const [hover, setHover] = useSt(null); // { i, x, y }
  const [width, setWidth] = useSt(900);
  const wrapRef = useRef(null);
  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect?.width;
      if (w && Math.abs(w - width) > 1) setWidth(w);
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const now = new Date();
  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now - (29 - i) * 86400000);
    const iso = d.toISOString().slice(0, 10);
    const log = logs.find(l => l.date === iso);
    return { date: iso, h: log?.hours || 0, q: log?.questions || 0, isToday: iso === now.toISOString().slice(0, 10) };
  });
  const maxH = Math.max(...last30.map(d => d.h), 0.1);
  const maxQ = Math.max(...last30.map(d => d.q), 1);

  const H = 200;
  const PAD_L = 36, PAD_R = 16, PAD_T = 18, PAD_B = 26;
  const innerW = Math.max(0, width - PAD_L - PAD_R);
  const innerH = H - PAD_T - PAD_B;
  const stepX = last30.length > 1 ? innerW / (last30.length - 1) : innerW;

  const xAt = (i) => PAD_L + i * stepX;
  const yH = (h) => PAD_T + innerH - (h / maxH) * innerH;

  // Build hours line path (area)
  const linePts = last30.map((d, i) => `${xAt(i)},${yH(d.h)}`).join(' ');
  const areaPath = `M ${xAt(0)},${PAD_T + innerH} L ${linePts.replace(/,/g, ' ').split(' ').reduce((acc, v, idx) => idx % 2 === 0 ? acc + ' L ' + v : acc + ',' + v, '').slice(3)} L ${xAt(last30.length - 1)},${PAD_T + innerH} Z`;

  const onMove = (e) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * width;
    const i = Math.max(0, Math.min(last30.length - 1, Math.round((px - PAD_L) / stepX)));
    setHover({ i });
  };

  const yAxis = [0, 0.25, 0.5, 0.75, 1].map(t => ({ t, v: t * maxH, y: PAD_T + innerH - t * innerH }));

  const fmtDate = (iso) => {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
  };

  return (
    <div className="glass" style={{ padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--text-muted)', fontWeight: 700, fontFamily: 'var(--font-label)' }}>
            CURVA DE ATIVIDADE · ÚLTIMOS 30 DIAS
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>
            Passe o mouse para ver detalhes do dia (horas e questões).
          </div>
        </div>
        <div style={{ display: 'flex', gap: 14, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-num)', fontWeight: 600 }}>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--ciano)', borderRadius: 3, marginRight: 6, verticalAlign: 'middle' }} />horas</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--esmeralda)', borderRadius: 3, marginRight: 6, verticalAlign: 'middle' }} />questões</span>
        </div>
      </div>
      <div ref={wrapRef} style={{ position: 'relative', width: '100%' }}>
        <svg
          width="100%"
          height={H}
          viewBox={`0 0 ${width} ${H}`}
          preserveAspectRatio="none"
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
          style={{ display: 'block', cursor: 'crosshair' }}
        >
          <defs>
            <linearGradient id="ac-h-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--ciano)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--ciano)" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {/* Y axis grid + labels */}
          {yAxis.map((g, i) => (
            <g key={i}>
              <line x1={PAD_L} x2={width - PAD_R} y1={g.y} y2={g.y} stroke="rgba(243,235,221,0.06)" strokeDasharray={i === 0 ? '0' : '3 4'} />
              <text x={PAD_L - 8} y={g.y + 3} fontSize="10" textAnchor="end" fill="rgba(179,171,199,0.7)" fontFamily="Manrope, sans-serif">{g.v.toFixed(1)}h</text>
            </g>
          ))}
          {/* Area under hours line */}
          <polyline
            points={linePts}
            fill="none"
            stroke="var(--ciano)"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <polygon
            points={`${PAD_L},${PAD_T + innerH} ${linePts} ${PAD_L + (last30.length - 1) * stepX},${PAD_T + innerH}`}
            fill="url(#ac-h-grad)"
          />
          {/* Question bars (small, behind line) */}
          {last30.map((d, i) => {
            const bx = xAt(i) - 3;
            const bh = (d.q / maxQ) * (innerH * 0.45);
            return (
              <rect key={'q'+i} x={bx} y={PAD_T + innerH - bh} width={6} height={bh}
                rx={1.5} fill="var(--esmeralda)" opacity="0.45" />
            );
          })}
          {/* Hours dots */}
          {last30.map((d, i) => (
            <circle key={'h'+i} cx={xAt(i)} cy={yH(d.h)} r={d.isToday ? 4.5 : 3}
              fill={d.isToday ? '#E8C47A' : 'var(--ciano)'}
              stroke="white" strokeWidth="1.5" />
          ))}
          {/* X axis labels (sparse) */}
          {last30.map((d, i) => {
            if (i % 5 !== 0 && i !== last30.length - 1) return null;
            return (
              <text key={'xl'+i} x={xAt(i)} y={H - 6} fontSize="9" textAnchor="middle" fill="rgba(179,171,199,0.6)" fontFamily="Manrope, sans-serif">
                {new Date(d.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
              </text>
            );
          })}
          {/* Hover guide */}
          {hover && (() => {
            const d = last30[hover.i];
            const hx = xAt(hover.i);
            return (
              <g>
                <line x1={hx} x2={hx} y1={PAD_T} y2={PAD_T + innerH} stroke="rgba(74,54,196,0.35)" strokeDasharray="3 3" />
                <circle cx={hx} cy={yH(d.h)} r={6} fill="white" stroke="var(--ciano)" strokeWidth="2.5" />
              </g>
            );
          })()}
        </svg>
        {hover && (() => {
          const d = last30[hover.i];
          const leftPct = ((xAt(hover.i)) / width) * 100;
          const anchorRight = leftPct > 65;
          return (
            <div style={{
              position: 'absolute',
              top: 6,
              [anchorRight ? 'right' : 'left']: `${anchorRight ? 100 - leftPct : leftPct}%`,
              transform: anchorRight ? 'translateX(-8px)' : 'translateX(8px)',
              pointerEvents: 'none',
              padding: '10px 12px',
              borderRadius: 10,
              background: 'rgba(22,19,40,0.96)',
              border: '1px solid rgba(143,184,255,0.35)',
              boxShadow: '0 8px 24px rgba(74,54,196,0.18)',
              fontSize: 11,
              fontFamily: 'var(--font-num)',
              minWidth: 150,
              zIndex: 5,
            }}>
              <div style={{ fontWeight: 800, color: 'var(--text-heading)', textTransform: 'capitalize', marginBottom: 4 }}>{fmtDate(d.date)}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>Horas</span>
                <span style={{ fontWeight: 800, color: 'var(--ciano)' }}>{d.h.toFixed(1)}h</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 2 }}>
                <span style={{ color: 'var(--text-muted)' }}>Questões</span>
                <span style={{ fontWeight: 800, color: 'var(--esmeralda)' }}>{d.q.toLocaleString('pt-BR')}</span>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// ── PieChart: animated SVG pie/donut with legend ──
function PieChart({ data, size = 180, donut = true, formatValue }) {
  const { useState: useSt, useEffect: useEf } = React;
  const [hover, setHover] = useSt(null);
  const [progress, setProgress] = useSt(0);
  useEf(() => {
    let raf, t0 = performance.now();
    const DURATION = 700;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / DURATION);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setProgress(eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [JSON.stringify(data.map(d => [d.label, d.value]))]);

  const total = data.reduce((a, d) => a + d.value, 0);
  if (total <= 0) return (
    <div style={{ fontSize: 12, color: 'var(--text-dim)', padding: '8px 0' }}>
      Sem dados para exibir.
    </div>
  );

  const R = size / 2;
  const innerR = donut ? R * 0.58 : 0;
  const cx = R, cy = R;

  let acc = 0;
  const slices = data.map((d, i) => {
    const start = acc / total;
    acc += d.value;
    const end = acc / total;
    return { ...d, start, end, i };
  });

  const arcPath = (start, end) => {
    const a0 = start * Math.PI * 2 - Math.PI / 2;
    const a1 = end * Math.PI * 2 - Math.PI / 2;
    const large = end - start > 0.5 ? 1 : 0;
    const x0 = cx + R * Math.cos(a0), y0 = cy + R * Math.sin(a0);
    const x1 = cx + R * Math.cos(a1), y1 = cy + R * Math.sin(a1);
    if (donut) {
      const ix0 = cx + innerR * Math.cos(a0), iy0 = cy + innerR * Math.sin(a0);
      const ix1 = cx + innerR * Math.cos(a1), iy1 = cy + innerR * Math.sin(a1);
      return `M ${x0} ${y0} A ${R} ${R} 0 ${large} 1 ${x1} ${y1} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${large} 0 ${ix0} ${iy0} Z`;
    }
    return `M ${cx} ${cy} L ${x0} ${y0} A ${R} ${R} 0 ${large} 1 ${x1} ${y1} Z`;
  };

  // Animated visible slice end (sweep with progress 0..1)
  const visEnd = (s) => Math.min(s.end, progress);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {slices.map(s => {
            if (s.start >= progress) return null;
            const isHover = hover === s.i;
            const path = arcPath(s.start, visEnd(s));
            return (
              <path key={s.label} d={path} fill={s.color}
                stroke="white" strokeWidth="2"
                onMouseEnter={() => setHover(s.i)}
                onMouseLeave={() => setHover(null)}
                style={{
                  cursor: 'pointer',
                  transform: isHover ? 'scale(1.04)' : 'scale(1)',
                  transformOrigin: `${cx}px ${cy}px`,
                  transition: 'transform 180ms cubic-bezier(0.16,1,0.3,1)',
                  filter: isHover ? `drop-shadow(0 4px 14px ${s.color}88)` : 'none',
                }}
              />
            );
          })}
        </svg>
        {donut && hover !== null && (() => {
          const s = slices[hover];
          const pct = (s.value / total) * 100;
          return (
            <div style={{
              position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
              textAlign: 'center', pointerEvents: 'none',
            }}>
              <div>
                <div className="num" style={{ fontSize: 22, fontWeight: 800, color: s.color, letterSpacing: '-0.02em' }}>
                  {pct.toFixed(0)}<span style={{ fontSize: 12, opacity: 0.7 }}>%</span>
                </div>
                <div style={{ fontSize: 9.5, letterSpacing: '0.14em', color: 'var(--text-muted)', fontWeight: 700, fontFamily: 'var(--font-label)', marginTop: 2, maxWidth: size * 0.6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.label}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 130, flex: '1 1 130px' }}>
        {slices.map(s => {
          const pct = (s.value / total) * 100;
          const isHover = hover === s.i;
          return (
            <div key={s.label}
              onMouseEnter={() => setHover(s.i)}
              onMouseLeave={() => setHover(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5,
                padding: '4px 8px', borderRadius: 7,
                background: isHover ? `${s.color}14` : 'transparent',
                transition: 'background 160ms ease', cursor: 'pointer',
              }}>
              <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: s.color, flexShrink: 0, boxShadow: `0 0 6px ${s.color}66` }} />
              <span style={{ flex: 1, minWidth: 0, color: 'var(--text-primary)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {s.label}
              </span>
              <span className="num" style={{ color: s.color, fontWeight: 800, fontSize: 11.5 }}>
                {formatValue ? formatValue(s.value) : s.value.toFixed(1)}
              </span>
              <span className="num" style={{ color: 'var(--text-dim)', fontSize: 10.5, fontWeight: 700, minWidth: 36, textAlign: 'right' }}>
                {pct.toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatsPage({ shared, objState, discState }) {
  const logs = shared.dailyLogs || [];
  const { useState: useSt } = React;
  const [period, setPeriod] = useSt('all'); // '7d' | '30d' | 'all'

  const now = new Date();
  const cutoff = period === '7d' ? new Date(now - 7*86400000)
               : period === '30d' ? new Date(now - 30*86400000)
               : null;

  const filteredLogs = cutoff
    ? logs.filter(l => new Date(l.date + 'T00:00:00') >= cutoff)
    : logs;

  // ── aggregate helpers ──
  const totalHours     = filteredLogs.reduce((a, l) => a + (l.hours || 0), 0);
  const totalQuestions = filteredLogs.reduce((a, l) => a + (l.questions || 0), 0);
  const totalReviews   = filteredLogs.reduce((a, l) => a + (l.reviews || 0), 0);
  const activeDays     = filteredLogs.filter(l => (l.hours||0)+(l.questions||0)+(l.reviews||0) > 0).length;

  // Flatten all entries (use entries[] when available; fallback to top-level log)
  const allEntries = [];
  filteredLogs.forEach(l => {
    if (l.entries && l.entries.length > 0) {
      l.entries.forEach(e => allEntries.push({ ...e, date: e.date || l.date }));
    } else {
      allEntries.push(l);
    }
  });

  // Hours per discipline
  const hoursByDisc = {};
  allEntries.forEach(e => {
    if (!e.discipline || !e.hours) return;
    hoursByDisc[e.discipline] = (hoursByDisc[e.discipline] || 0) + e.hours;
  });
  const hoursByDiscArr = Object.entries(hoursByDisc)
    .sort((a,b) => b[1]-a[1]).slice(0, 8);

  // Hours per study type
  const hoursByType = {};
  allEntries.forEach(e => {
    if (!e.studyType || !e.hours) return;
    hoursByType[e.studyType] = (hoursByType[e.studyType] || 0) + e.hours;
  });
  const hoursByTypeArr = Object.entries(hoursByType).sort((a,b) => b[1]-a[1]);

  // Peso por disciplina (combinando objetiva + discursiva por nome)
  const weightByDisc = {};
  [...objState.subjects, ...discState.subjects].forEach(s => {
    if (!s || !s.name) return;
    const w = Math.max(0, s.weight || 0);
    if (w <= 0) return;
    weightByDisc[s.name] = Math.max(weightByDisc[s.name] || 0, w);
  });
  const weightByDiscArr = Object.entries(weightByDisc).sort((a,b) => b[1]-a[1]);
  const totalWeight = weightByDiscArr.reduce((a,[,w]) => a + w, 0);

  // Total horas (de entries com disciplina) para % no chart de horas por disciplina
  const totalHoursByDisc = hoursByDiscArr.reduce((a, [, h]) => a + h, 0);

  // Accuracy per discipline (questions entries)
  const accByDisc = {};
  allEntries.forEach(e => {
    if (!e.discipline || (!e.correct && !e.wrong)) return;
    if (!accByDisc[e.discipline]) accByDisc[e.discipline] = { c: 0, w: 0 };
    accByDisc[e.discipline].c += (e.correct || 0);
    accByDisc[e.discipline].w += (e.wrong || 0);
  });
  const accByDiscArr = Object.entries(accByDisc)
    .map(([d, v]) => ({ d, pct: v.c + v.w > 0 ? v.c/(v.c+v.w)*100 : 0, total: v.c+v.w }))
    .sort((a,b) => b.pct - a.pct);

  // Daily XP / activity curve (last 30 days)
  const last30 = Array.from({length: 30}, (_, i) => {
    const d = new Date(now - (29-i)*86400000);
    const iso = d.toISOString().slice(0,10);
    const log = logs.find(l => l.date === iso);
    return { date: iso, h: log?.hours || 0, q: log?.questions || 0 };
  });
  const maxH = Math.max(...last30.map(d => d.h), 0.1);

  // Subject domination (objetiva)
  const FLAGS_O = ['lei','doutrina','juris','questoes','revisao'];
  const subjectStats = objState.subjects.map(s => {
    let checks = 0;
    s.topics.forEach(t => FLAGS_O.forEach(f => { if (t[f]) checks++; }));
    const pct = s.topics.length > 0 ? checks / (s.topics.length * 5) * 100 : 0;
    return { name: s.shortName || s.name.slice(0,10), pct };
  }).sort((a,b) => a.pct - b.pct);

  const worstSubjects = subjectStats.slice(0, 5);
  const bestSubjects  = subjectStats.slice(-5).reverse();

  // Neglected (>= 7 days since last entry that had that discipline)
  const lastLogByDisc = {};
  logs.forEach(l => {
    const ents = (l.entries && l.entries.length > 0) ? l.entries : [l];
    ents.forEach(e => {
      if (e.discipline) {
        if (!lastLogByDisc[e.discipline] || l.date > lastLogByDisc[e.discipline])
          lastLogByDisc[e.discipline] = l.date;
      }
    });
  });
  const allDiscs = objState.subjects.map(s => s.name);
  const neglected = allDiscs.filter(d => {
    const last = lastLogByDisc[d];
    if (!last) return true;
    return (now - new Date(last + 'T00:00:00')) / 86400000 >= 7;
  }).slice(0, 6);

  // Weekly comparison (this week vs last week)
  const weekH = (offset) => {
    const start = new Date(now - (offset+1)*7*86400000);
    const end   = new Date(now - offset*7*86400000);
    return logs.filter(l => {
      const d = new Date(l.date+'T00:00:00');
      return d >= start && d < end;
    }).reduce((a,l) => a + (l.hours||0), 0);
  };
  const thisWeek = weekH(0);
  const lastWeek = weekH(1);

  // ── chart colors ──
  const COLORS = ['var(--ciano)','var(--esmeralda)','var(--dourado)','var(--tinta)','var(--coral)','#FFB057','#8FB8FF','#B7AAFF'];

  // ── helpers ──
  const Bar = ({ pct, color, height = 8 }) => (
    <div style={{ background: 'rgba(243,235,221,0.08)', borderRadius: 99, overflow: 'hidden', height }}>
      <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 600ms ease' }} />
    </div>
  );

  if (logs.length === 0 && Object.keys(hoursByDisc).length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 24px' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}><Glyph e="📊" /></div>
        <div className="font-display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-heading)', marginBottom: 8 }}>
          Nenhum dado ainda
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 360, margin: '0 auto' }}>
          Registre suas sessões de estudo usando o botão + (FAB) para ver seus gráficos aqui.
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Period selector */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="font-display" style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-heading)', flex: 1 }}>
          Suas Estatísticas
        </div>
        {[['7d','7 dias'],['30d','30 dias'],['all','Todo período']].map(([v,l]) => (
          <button key={v} onClick={() => setPeriod(v)}
            className={period === v ? 'btn-neon' : 'btn-ghost'}
            style={{ fontSize: 12, padding: '6px 14px' }}>
            {l}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
        {[
          { label: 'Horas', value: totalHours.toFixed(1)+'h', color: 'var(--ciano)', icon: '⏱' },
          { label: 'Questões', value: totalQuestions.toLocaleString('pt-BR'), color: 'var(--esmeralda)', icon: '❓' },
          { label: 'Revisões', value: totalReviews.toLocaleString('pt-BR'), color: 'var(--tinta)', icon: '🃏' },
          { label: 'Dias ativos', value: activeDays, color: 'var(--dourado)', icon: '📅' },
        ].map((m,i) => (
          <div key={i} className="glass" style={{ padding: '12px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: 20 }}><Glyph e={m.icon} /></div>
            <div className="num" style={{ fontSize: 22, fontWeight: 700, color: m.color, marginTop: 4 }}>{m.value}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Activity curve — full-width with hover tooltip */}
      <ActivityCurve logs={logs} />

      {/* Row: Comparação semanal | Constância % | Edital Obj + Disc */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>

        {/* Comparação semanal */}
        <div className="glass" style={{ padding: 16 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 12, fontFamily: 'var(--font-label)' }}>COMPARAÇÃO SEMANAL</div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 8 }}>
            {[['Esta semana', thisWeek, 'var(--petroleo)'], ['Semana passada', lastWeek, 'var(--ardosia)']].map(([label, h, color]) => {
              const maxW = Math.max(thisWeek, lastWeek, 0.1);
              return (
                <div key={label} style={{ flex: 1 }}>
                  <div style={{ background: 'rgba(243,235,221,0.06)', borderRadius: 8, height: 80, display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
                    <div style={{ width: '100%', height: `${(h/maxW)*100}%`, background: color, borderRadius: '8px 8px 0 0', minHeight: h > 0 ? 4 : 0, transition: 'height 600ms ease' }} />
                  </div>
                  <div className="num" style={{ fontSize: 18, fontWeight: 700, color, marginTop: 6 }}>{h.toFixed(1)}h</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{label}</div>
                </div>
              );
            })}
            <div style={{ flex: 1, textAlign: 'center' }}>
              {thisWeek > lastWeek
                ? <div><div style={{ fontSize: 28 }}><Glyph e="📈" /></div><div style={{ fontSize: 11, color: 'var(--esmeralda)', fontWeight: 700 }}>+{((thisWeek-lastWeek)/Math.max(lastWeek,0.1)*100).toFixed(0)}%</div></div>
                : thisWeek < lastWeek
                ? <div><div style={{ fontSize: 28 }}><Glyph e="📉" /></div><div style={{ fontSize: 11, color: 'var(--coral)', fontWeight: 700 }}>{((thisWeek-lastWeek)/Math.max(lastWeek,0.1)*100).toFixed(0)}%</div></div>
                : <div style={{ fontSize: 28 }}><Glyph e="😐" /></div>
              }
            </div>
          </div>
        </div>

        {/* % de Constância */}
        <ConstanciaPercentCard logs={logs} bestStreak={shared.bestStreak} />

      </div>

      {/* Horas por disciplina (com %) lado a lado com Peso por disciplina (pizza) */}
      <div className="stats-dual-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14 }}>
        <div className="glass" style={{ padding: 16 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 10, fontFamily: 'var(--font-label)' }}>HORAS POR DISCIPLINA</div>
          {hoursByDiscArr.length === 0
            ? <div style={{ fontSize: 12, color: 'var(--text-dim)', padding: '8px 0' }}>Registre sessões com disciplina para ver este gráfico.</div>
            : hoursByDiscArr.map(([d, h], i) => {
              const pct = totalHoursByDisc > 0 ? (h / totalHoursByDisc) * 100 : 0;
              const color = COLORS[i % COLORS.length];
              return (
                <div key={d} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3, gap: 6 }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {d.length > 22 ? d.slice(0,20)+'…' : d}
                    </span>
                    <span className="num" style={{ color, fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {h.toFixed(1)}h <span style={{ color: 'var(--text-dim)', fontWeight: 700, fontSize: 10 }}>({pct.toFixed(0)}%)</span>
                    </span>
                  </div>
                  <Bar pct={h / hoursByDiscArr[0][1] * 100} color={color} />
                </div>
              );
            })
          }
        </div>

        <div className="glass" style={{ padding: 16 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 12, fontFamily: 'var(--font-label)' }}>PESO POR DISCIPLINA · EDITAL</div>
          {weightByDiscArr.length === 0
            ? <div style={{ fontSize: 12, color: 'var(--text-dim)', padding: '8px 0' }}>Defina pesos para as disciplinas na aba Edital para ver este gráfico.</div>
            : <PieChart
                size={170}
                donut={true}
                formatValue={(v) => `${v}`}
                data={weightByDiscArr.map(([name, w], i) => ({
                  label: name.length > 22 ? name.slice(0,20)+'…' : name,
                  value: w,
                  color: COLORS[i % COLORS.length],
                }))}
              />
          }
          {totalWeight > 0 && (
            <div style={{ marginTop: 10, fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-num)', fontWeight: 600, textAlign: 'center', letterSpacing: '0.05em' }}>
              PESO TOTAL · {totalWeight}
            </div>
          )}
        </div>
      </div>
      <style>{`@media (max-width: 760px) { .stats-dual-row { grid-template-columns: 1fr !important; } }`}</style>

      {/* Charts grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>

        {/* Tipo de estudo (pizza) */}
        <div className="glass" style={{ padding: 16 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 12, fontFamily: 'var(--font-label)' }}>HORAS POR TIPO DE ESTUDO</div>
          {hoursByTypeArr.length === 0
            ? <div style={{ fontSize: 12, color: 'var(--text-dim)', padding: '8px 0' }}>Registre sessões com tipo de estudo para ver este gráfico.</div>
            : <PieChart
                size={170}
                donut={true}
                formatValue={(v) => `${v.toFixed(1)}h`}
                data={hoursByTypeArr.map(([t, h], i) => ({ label: t, value: h, color: COLORS[i % COLORS.length] }))}
              />
          }
        </div>

        {/* Chart 4 — % acerto por disciplina */}
        <div className="glass" style={{ padding: 16 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 10, fontFamily: 'var(--font-label)' }}>% ACERTO POR DISCIPLINA</div>
          {accByDiscArr.length === 0
            ? <div style={{ fontSize: 12, color: 'var(--text-dim)', padding: '8px 0' }}>Registre sessões de questões com acertos/erros para ver este gráfico.</div>
            : accByDiscArr.map((item, i) => (
              <div key={item.d} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.d.length > 18 ? item.d.slice(0,16)+'…' : item.d}</span>
                  <span className="num" style={{ color: item.pct >= 70 ? 'var(--esmeralda)' : item.pct >= 50 ? 'var(--dourado)' : 'var(--coral)', fontWeight: 700 }}>
                    {item.pct.toFixed(0)}% <span style={{ fontSize: 9, color: 'var(--text-dim)' }}>({item.total}q)</span>
                  </span>
                </div>
                <Bar pct={item.pct} color={item.pct >= 70 ? 'var(--esmeralda)' : item.pct >= 50 ? 'var(--dourado)' : 'var(--coral)'} />
              </div>
            ))
          }
        </div>

        {/* Chart 5 — Top 5 melhores disciplinas */}
        <div className="glass" style={{ padding: 16 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 10, fontFamily: 'var(--font-label)' }}>TOP 5 MELHORES NO EDITAL</div>
          {bestSubjects.map((s, i) => (
            <div key={s.name} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{s.name}</span>
                <span className="num" style={{ color: 'var(--esmeralda)', fontWeight: 700 }}>{s.pct.toFixed(0)}%</span>
              </div>
              <Bar pct={s.pct} color="var(--esmeralda)" />
            </div>
          ))}
        </div>

        {/* Chart 6 — Top 5 piores disciplinas (no edital) */}
        <div className="glass" style={{ padding: 16 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 10, fontFamily: 'var(--font-label)' }}>TOP 5 PIORES NO EDITAL</div>
          {worstSubjects.map((s, i) => (
            <div key={s.name} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{s.name}</span>
                <span className="num" style={{ color: 'var(--coral)', fontWeight: 700 }}>{s.pct.toFixed(0)}%</span>
              </div>
              <Bar pct={s.pct} color="var(--coral)" />
            </div>
          ))}
        </div>

        {/* Chart 7 — Disciplinas negligenciadas */}
        <div className="glass" style={{ padding: 16 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 10, fontFamily: 'var(--font-label)' }}>DISCIPLINAS NEGLIGENCIADAS (7+ DIAS)</div>
          {neglected.length === 0
            ? <div style={{ fontSize: 13, color: 'var(--esmeralda)', fontWeight: 600, padding: '8px 0' }}>Tudo em dia!</div>
            : neglected.map((d, i) => (
              <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, padding: '8px 10px', background: 'rgba(255,122,138,0.06)', borderRadius: 8, border: '1px solid rgba(255,122,138,0.15)' }}>
                <span style={{ fontSize: 14 }}><Glyph e="⚠️" /></span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--grafite)' }}>{d.length > 28 ? d.slice(0,26)+'…' : d}</span>
              </div>
            ))
          }
        </div>

      </div>
    </div>
  );
}

// ── Constância % card ──
function ConstanciaPercentCard({ logs, bestStreak }) {
  const startISO = (window.DA && window.DA.firstLogDate) ? window.DA.firstLogDate(logs || []) : null;
  let totalDays = 0;
  let fulfilledDays = 0;
  if (startISO) {
    const start = new Date(startISO + 'T00:00:00');
    const today = new Date(); today.setHours(0,0,0,0);
    const logMap = new Map((logs || []).map(l => [l.date, l]));
    for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
      const dow = d.getDay();
      totalDays++;
      if (dow === 0 || dow === 6) {
        fulfilledDays++; // weekends auto-fulfilled
      } else {
        const log = logMap.get(d.toISOString().slice(0,10));
        if (log && (log.hours || 0) >= 0.5) fulfilledDays++;
      }
    }
  }
  const pct = totalDays > 0 ? (fulfilledDays / totalDays) * 100 : 0;
  const currentStreak = (window.DA && window.DA.calcConstancia) ? window.DA.calcConstancia(logs || []) : 0;
  const record = Math.max(bestStreak || 0, (window.DA && window.DA.calcConstanciaRecord) ? window.DA.calcConstanciaRecord(logs || []) : 0, currentStreak);
  const tier = pct >= 90 ? 'var(--esmeralda)' : pct >= 70 ? '#8FB8FF' : pct >= 50 ? 'var(--ambar)' : 'var(--coral)';
  return (
    <div className="glass" style={{ padding: 16 }}>
      <div style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 12, fontFamily: 'var(--font-label)' }}>% DE CONSTÂNCIA</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ position: 'relative', width: 90, height: 90, flexShrink: 0 }}>
          <svg viewBox="0 0 100 100" width={90} height={90} style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}>
            <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(243,235,221,0.08)" strokeWidth="9" />
            <circle cx="50" cy="50" r="40" fill="none" stroke={tier} strokeWidth="9"
              strokeDasharray={`${(pct/100)*251.3} 251.3`} strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 6px ${tier}66)`, transition: 'stroke-dasharray 700ms cubic-bezier(0.16,1,0.3,1)' }} />
          </svg>
          <div className="num" style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: 20, fontWeight: 800, color: tier, letterSpacing: '-0.02em' }}>
            {pct.toFixed(0)}<span style={{ fontSize: 10, opacity: 0.7 }}>%</span>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 700, marginBottom: 6 }}>
            {fulfilledDays} de {totalDays} dias
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
              <span style={{ color: 'var(--text-muted)' }}>Atual</span>
              <span className="num" style={{ color: 'var(--esmeralda)', fontWeight: 700 }}><Glyph e="🔥" /> {currentStreak}d</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
              <span style={{ color: 'var(--text-muted)' }}>Recorde</span>
              <span className="num" style={{ color: 'var(--dourado)', fontWeight: 700 }}><Glyph e="🏆" /> {record}d</span>
            </div>
          </div>
        </div>
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 10, lineHeight: 1.4 }}>
        Fins de semana contam como cumpridos — calculado a partir do primeiro registro.
      </div>
    </div>
  );
}

