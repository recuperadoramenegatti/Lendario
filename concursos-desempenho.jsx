// Lendário — Desempenho em Concursos

const BANCAS_CONCURSO = ['CESPE/CEBRASPE','FCC','FGV','VUNESP','IBFC','IADES','AOCP','Quadrix','FUNDATEC','FEPESE','NC-UFPR','FAFIPA','Própria','Outra'];

// App palette hex values (mirrors CSS custom properties)
const CC = {
  ciano:     '#8FB8FF',
  esmeralda: '#4FD1A5',
  tinta:     '#B7AAFF',
  ambar:     '#FFB057',
  coral:     '#FF7A8A',
  petroleo:  '#4A36C4',
  dourado:   '#E8C47A',
  grafite:   '#F3EBDD',
  ardosia:   '#B3ABC7',
};

// Multi-series chart colors using app palette
const CHART_SERIES = ['#8FB8FF','#B7AAFF','#4FD1A5','#FFB057','#E8C47A','#FF7A8A','#4A36C4','#FF7A1A'];

function discPct(d) {
  if (!d || !d.total || d.total <= 0) return 0;
  return Math.min(100, Math.max(0, (d.pontos / d.total) * 100));
}

function discColor(pct) {
  if (pct >= 80) return CC.esmeralda;
  if (pct >= 65) return CC.ciano;
  if (pct >= 50) return CC.tinta;
  if (pct >= 35) return CC.ambar;
  return CC.coral;
}

function provaTitle(p) {
  const inst = p.orgao || p.cargo || 'Concurso';
  const year = p.date ? new Date(p.date + 'T12:00:00').getFullYear() : '';
  return year ? `${inst} · ${year}` : inst;
}

function fmtD(iso) {
  if (!iso) return '';
  return new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function calcProvaXp(entry, isNew, prevProvas) {
  if (!isNew) return { xp: 0, kind: null };
  let xp = 20, kind = 'light';
  const discs = (entry.disciplinas || []).filter(d => d.nome && d.total > 0);
  if (discs.length >= 3) xp += 10;
  const passou = entry.pontos >= entry.corte;
  if (passou) { xp += 50; kind = 'victory'; }
  if (prevProvas.length > 0) {
    const myPct = entry.totalProva > 0 ? (entry.pontos / entry.totalProva) * 100 : 0;
    const prevPcts = prevProvas.map(p => p.totalProva > 0 ? (p.pontos / p.totalProva) * 100 : 0);
    if (myPct > Math.max(...prevPcts)) { xp += 30; if (!passou) kind = 'high'; }
    else if (myPct > (prevPcts[prevPcts.length - 1] || 0)) xp += 15;
  }
  return { xp, kind };
}

// ── Positive-only insights ──
function computeProvasInsights(provas) {
  const out = [];
  if (!provas || provas.length === 0) return out;
  const sorted = [...provas].sort((a, b) => a.date.localeCompare(b.date));

  // Personal best
  let best = null;
  sorted.forEach(p => {
    const pct = p.totalProva > 0 ? (p.pontos / p.totalProva) * 100 : 0;
    if (!best || pct > best.pct) best = { p, pct };
  });
  if (best) out.push({ id: 'pb', icon: '🏆', label: 'Melhor resultado', value: `${best.pct.toFixed(0)}%`, desc: provaTitle(best.p).slice(0, 26), color: CC.ambar, hl: true });

  // Evolution: only show positive or reframe as potential
  if (sorted.length >= 2) {
    const lPct = sorted[sorted.length - 1].totalProva > 0 ? (sorted[sorted.length - 1].pontos / sorted[sorted.length - 1].totalProva) * 100 : 0;
    const pPct = sorted[sorted.length - 2].totalProva > 0 ? (sorted[sorted.length - 2].pontos / sorted[sorted.length - 2].totalProva) * 100 : 0;
    const delta = lPct - pPct;
    if (delta > 0) {
      out.push({ id: 'trend', icon: '📈', label: 'Evolução', value: `+${delta.toFixed(1)}%`, desc: 'vs prova anterior', color: CC.esmeralda, hl: true });
    } else {
      out.push({ id: 'potential', icon: '🎯', label: 'Potencial de ganho', value: `+${Math.abs(delta).toFixed(1)}%`, desc: 'em relação à última prova', color: CC.ciano });
    }
  }

  // Discipline stats
  const discMap = {};
  provas.forEach(p => (p.disciplinas || []).forEach(d => {
    if (!d.nome || !d.total || d.total <= 0) return;
    if (!discMap[d.nome]) discMap[d.nome] = [];
    discMap[d.nome].push({ pct: discPct(d), date: p.date });
  }));
  const discList = Object.entries(discMap)
    .map(([nome, arr]) => ({ nome, count: arr.length, avg: arr.reduce((a, b) => a + b.pct, 0) / arr.length, arr: [...arr].sort((a, b) => a.date.localeCompare(b.date)) }))
    .sort((a, b) => b.avg - a.avg);

  if (discList.length >= 1) {
    const top = discList[0];
    out.push({ id: 'top-disc', icon: '⭐', label: 'Ponto forte', value: `${top.avg.toFixed(0)}%`, desc: top.nome.slice(0, 22), color: discColor(top.avg) });
  }

  // Most improved
  const improved = discList
    .filter(d => d.count >= 2)
    .map(d => ({ ...d, delta: d.arr[d.arr.length - 1].pct - d.arr[0].pct }))
    .sort((a, b) => b.delta - a.delta)[0];
  if (improved && improved.delta >= 3) {
    out.push({ id: 'improved', icon: '🚀', label: 'Maior crescimento', value: `+${improved.delta.toFixed(0)}%`, desc: improved.nome.slice(0, 22), color: CC.tinta, hl: true });
  }

  // Consistent discipline (lowest std dev among 2+ appearances)
  const consistent = discList.filter(d => d.count >= 2).map(d => {
    const avg = d.avg;
    const stdDev = Math.sqrt(d.arr.reduce((a, x) => a + (x.pct - avg) ** 2, 0) / d.arr.length);
    return { ...d, stdDev };
  }).sort((a, b) => a.stdDev - b.stdDev)[0];
  if (consistent) out.push({ id: 'consistent', icon: '💎', label: 'Mais consistente', value: `${consistent.avg.toFixed(0)}%`, desc: consistent.nome.slice(0, 22), color: CC.dourado });

  // Strategic focus (constructive)
  const focus = discList.filter(d => d.avg < 65).sort((a, b) => a.avg - b.avg)[0];
  if (focus) out.push({ id: 'focus', icon: '📚', label: 'Foco estratégico', value: `+${(65 - focus.avg).toFixed(0)}%`, desc: `${focus.nome.slice(0, 18)} → 65%`, color: CC.petroleo });

  // Best banca
  const bancaMap = {};
  provas.forEach(p => { if (!p.banca) return; const pct = p.totalProva > 0 ? (p.pontos / p.totalProva) * 100 : 0; if (!bancaMap[p.banca]) bancaMap[p.banca] = []; bancaMap[p.banca].push(pct); });
  const bancaList = Object.entries(bancaMap).map(([b, pcts]) => ({ b, avg: pcts.reduce((a, c) => a + c, 0) / pcts.length })).sort((a, b) => b.avg - a.avg);
  if (bancaList.length >= 2) out.push({ id: 'top-banca', icon: '🏛️', label: 'Melhor banca', value: `${bancaList[0].avg.toFixed(0)}%`, desc: bancaList[0].b, color: CC.ciano });

  return out;
}

// ──────────────────────────────────────────────────────────────────────────────
// CHART: Performance over time (line chart)
// ──────────────────────────────────────────────────────────────────────────────
function ProvaSummaryChart({ provas }) {
  if (provas.length < 2) return null;
  const W = 560, H = 180;
  const PAD = { t: 20, r: 16, b: 40, l: 40 };
  const cW = W - PAD.l - PAD.r, cH = H - PAD.t - PAD.b;

  const data = provas.map(p => ({
    pct: p.totalProva > 0 ? (p.pontos / p.totalProva) * 100 : 0,
    cortePct: p.totalProva > 0 ? (p.corte / p.totalProva) * 100 : 0,
    passou: p.pontos >= p.corte,
    date: p.date,
  }));

  const allVals = [...data.map(d => d.pct), ...data.map(d => d.cortePct)];
  const yMin = Math.floor(Math.min(...allVals, 40) / 10) * 10;
  const yMax = Math.ceil(Math.max(...allVals, 80) / 10) * 10;
  const yRange = yMax - yMin || 1;

  const xs = i => PAD.l + (i / Math.max(data.length - 1, 1)) * cW;
  const ys = v => PAD.t + ((yMax - v) / yRange) * cH;

  const userPts = data.map((d, i) => `${xs(i)},${ys(d.pct)}`).join(' ');
  const cortePts = data.map((d, i) => `${xs(i)},${ys(d.cortePct)}`).join(' ');

  const yTicks = [];
  for (let v = yMin; v <= yMax; v += 10) yTicks.push(v);

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, display: 'block' }}>
        <defs>
          <linearGradient id="cdp-user-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={CC.ciano} stopOpacity="0.7" />
            <stop offset="100%" stopColor={CC.tinta} />
          </linearGradient>
        </defs>
        {yTicks.map(v => (
          <g key={v}>
            <line x1={PAD.l} y1={ys(v)} x2={W - PAD.r} y2={ys(v)} stroke="rgba(243,235,221,0.07)" strokeWidth="1" />
            <text x={PAD.l - 5} y={ys(v) + 4} fontSize="9" fill="#B3ABC7" textAnchor="end" fontFamily="Manrope, sans-serif" fontWeight="600">{v}%</text>
          </g>
        ))}
        {/* Cutoff line */}
        <polyline points={cortePts} fill="none" stroke={CC.ambar} strokeWidth="1.5" strokeDasharray="5,3" strokeOpacity="0.65" />
        {/* User line */}
        <polyline points={userPts} fill="none" stroke="url(#cdp-user-grad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={xs(i)} cy={ys(d.pct)} r="5" fill="white" stroke={d.passou ? CC.esmeralda : CC.ciano} strokeWidth="2.5" />
            <text x={xs(i)} y={H - PAD.b + 14} fontSize="9" fill="#B3ABC7" textAnchor="middle" fontFamily="Manrope, sans-serif" fontWeight="600">{fmtD(d.date)}</text>
          </g>
        ))}
      </svg>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 18, height: 3, background: `linear-gradient(90deg,${CC.ciano},${CC.tinta})`, borderRadius: 2 }} />
          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-num)', fontWeight: 600 }}>SEU DESEMPENHO</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 18, height: 2, borderTop: `2px dashed ${CC.ambar}`, opacity: 0.7 }} />
          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-num)', fontWeight: 600 }}>CORTE %</span>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// CHART: Discipline evolution (multi-line)
// ──────────────────────────────────────────────────────────────────────────────
function DisciplineLineChart({ provas }) {
  const chrono = [...provas].sort((a, b) => a.date.localeCompare(b.date));
  const discMap = {};
  chrono.forEach((p, ci) => (p.disciplinas || []).forEach(d => {
    if (!d.nome || !d.total || d.total <= 0) return;
    if (!discMap[d.nome]) discMap[d.nome] = [];
    discMap[d.nome].push({ ci, pct: discPct(d), date: p.date });
  }));

  const series = Object.entries(discMap)
    .filter(([, arr]) => arr.length >= 2)
    .map(([nome, arr]) => ({ nome, arr }))
    .sort((a, b) => {
      const avgA = a.arr.reduce((s, x) => s + x.pct, 0) / a.arr.length;
      const avgB = b.arr.reduce((s, x) => s + x.pct, 0) / b.arr.length;
      return avgB - avgA;
    });

  if (series.length === 0) return null;

  const W = 560, H = 200;
  const PAD = { t: 18, r: 16, b: 40, l: 38 };
  const cW = W - PAD.l - PAD.r, cH = H - PAD.t - PAD.b;
  const n = chrono.length;
  const xs = i => PAD.l + (i / Math.max(n - 1, 1)) * cW;
  const ys = v => PAD.t + ((100 - v) / 100) * cH;
  const gridVals = [0, 25, 50, 65, 80, 100];

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, display: 'block' }}>
          {gridVals.map(v => (
            <g key={v}>
              <line x1={PAD.l} y1={ys(v)} x2={W - PAD.r} y2={ys(v)} stroke="rgba(243,235,221,0.07)" strokeWidth="1" strokeDasharray={v === 65 || v === 80 ? '4,3' : undefined} />
              <text x={PAD.l - 4} y={ys(v) + 4} fontSize="9" fill="#B3ABC7" textAnchor="end" fontFamily="Manrope, sans-serif">{v}%</text>
            </g>
          ))}
          {chrono.map((p, i) => (
            <text key={i} x={xs(i)} y={H - PAD.b + 14} fontSize="9" fill="#B3ABC7" textAnchor="middle" fontFamily="Manrope, sans-serif" fontWeight="600">{fmtD(p.date)}</text>
          ))}
          {series.map(({ nome, arr }, si) => {
            const color = CHART_SERIES[si % CHART_SERIES.length];
            const pts = arr.map(pt => `${xs(pt.ci)},${ys(pt.pct)}`).join(' ');
            return (
              <g key={nome}>
                <polyline points={pts} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                {arr.map((pt, i) => (
                  <circle key={i} cx={xs(pt.ci)} cy={ys(pt.pct)} r="3.5" fill="white" stroke={color} strokeWidth="2" />
                ))}
              </g>
            );
          })}
        </svg>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', marginTop: 8 }}>
        {series.map(({ nome }, si) => {
          const color = CHART_SERIES[si % CHART_SERIES.length];
          return (
            <div key={nome} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 16, height: 3, background: color, borderRadius: 2 }} />
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, fontFamily: 'var(--font-num)' }}>
                {nome.length > 22 ? nome.slice(0, 20) + '…' : nome}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// CHART: Radar chart of discipline averages
// ──────────────────────────────────────────────────────────────────────────────
function CdpRadarChart({ provas }) {
  const discMap = {};
  provas.forEach(p => (p.disciplinas || []).forEach(d => {
    if (!d.nome || !d.total || d.total <= 0) return;
    if (!discMap[d.nome]) discMap[d.nome] = [];
    discMap[d.nome].push(discPct(d));
  }));
  const disciplines = Object.entries(discMap)
    .map(([nome, pcts]) => ({ nome, avg: pcts.reduce((a, b) => a + b, 0) / pcts.length }))
    .sort((a, b) => a.nome.localeCompare(b.nome));

  if (disciplines.length < 3) return null;

  const N = Math.min(disciplines.length, 10);
  const CX = 150, CY = 130, R = 88;
  const W = 300, H = 262;
  const angle = i => (i / N) * Math.PI * 2 - Math.PI / 2;
  const pt = (r, i) => ({ x: CX + r * Math.cos(angle(i)), y: CY + r * Math.sin(angle(i)) });

  const levels = [0.25, 0.5, 0.75, 1.0];
  const polyPts = levels.map(lvl =>
    Array.from({ length: N }, (_, i) => { const p = pt(lvl * R, i); return `${p.x},${p.y}`; }).join(' ')
  );

  const dataPoly = disciplines.slice(0, N).map((d, i) => {
    const p = pt((d.avg / 100) * R, i);
    return `${p.x},${p.y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, display: 'block', margin: '0 auto' }}>
      {/* Grid polygons */}
      {polyPts.map((pts, li) => <polygon key={li} points={pts} fill="none" stroke="rgba(243,235,221,0.08)" strokeWidth="1" />)}
      {/* Grid % labels */}
      {levels.map((lvl, li) => {
        const p = pt(lvl * R, 0);
        return <text key={li} x={CX + 3} y={CY - lvl * R + 4} fontSize="8" fill="rgba(179,171,199,0.5)" fontFamily="Manrope, sans-serif">{(lvl * 100).toFixed(0)}%</text>;
      })}
      {/* Axis lines */}
      {disciplines.slice(0, N).map((d, i) => {
        const p = pt(R, i);
        return <line key={i} x1={CX} y1={CY} x2={p.x} y2={p.y} stroke="rgba(243,235,221,0.08)" strokeWidth="1" />;
      })}
      {/* Data polygon */}
      <polygon points={dataPoly} fill={CC.ciano + '18'} stroke={CC.ciano} strokeWidth="2" strokeLinejoin="round" />
      {/* Data dots */}
      {disciplines.slice(0, N).map((d, i) => {
        const p = pt((d.avg / 100) * R, i);
        return <circle key={i} cx={p.x} cy={p.y} r="4" fill="white" stroke={discColor(d.avg)} strokeWidth="2" />;
      })}
      {/* Labels */}
      {disciplines.slice(0, N).map((d, i) => {
        const p = pt(R + 14, i);
        const anchor = p.x < CX - 6 ? 'end' : p.x > CX + 6 ? 'start' : 'middle';
        const label = d.nome.length > 14 ? d.nome.slice(0, 12) + '…' : d.nome;
        return (
          <text key={i} x={p.x} y={p.y + 4} fontSize="9.5" fill="#B3ABC7" textAnchor={anchor} fontFamily="Manrope, sans-serif" fontWeight="600">
            {label}
          </text>
        );
      })}
    </svg>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// CHART: Performance heatmap (discipline × contest)
// ──────────────────────────────────────────────────────────────────────────────
function PerformanceHeatmap({ provas }) {
  const chrono = [...provas].sort((a, b) => a.date.localeCompare(b.date));
  const allNames = [...new Set(provas.flatMap(p => (p.disciplinas || []).map(d => d.nome).filter(Boolean)))];
  if (allNames.length === 0) return null;

  const matrix = allNames.map(nome => {
    const cells = chrono.map(p => {
      const d = (p.disciplinas || []).find(x => x.nome === nome);
      return (d && d.total > 0) ? discPct(d) : null;
    });
    const vals = cells.filter(x => x !== null);
    const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    return { nome, cells, avg };
  }).sort((a, b) => b.avg - a.avg);

  const heatBg = pct => {
    if (pct === null) return 'rgba(243,235,221,0.04)';
    if (pct >= 80) return 'rgba(79,209,165,0.18)';
    if (pct >= 65) return 'rgba(143,184,255,0.15)';
    if (pct >= 50) return 'rgba(183,170,255,0.13)';
    if (pct >= 35) return 'rgba(255,176,87,0.15)';
    return 'rgba(255,122,138,0.13)';
  };
  const heatText = pct => {
    if (pct === null) return 'var(--text-dim)';
    if (pct >= 80) return CC.esmeralda;
    if (pct >= 65) return CC.ciano;
    if (pct >= 50) return CC.tinta;
    if (pct >= 35) return CC.ambar;
    return CC.coral;
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', marginBottom: 6, paddingLeft: 140 }}>
        {chrono.map((p, i) => (
          <div key={i} style={{ width: 52, flexShrink: 0, textAlign: 'center', fontSize: 9, color: 'var(--text-dim)', fontFamily: 'var(--font-num)', fontWeight: 600, lineHeight: 1.3 }}>
            {fmtD(p.date)}<br />
            <span style={{ opacity: 0.7 }}>{(p.orgao || p.cargo || '').slice(0, 7)}</span>
          </div>
        ))}
      </div>
      {/* Rows */}
      {matrix.map(({ nome, cells }) => (
        <div key={nome} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
          <div style={{ width: 140, flexShrink: 0, fontSize: 10.5, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 10 }}>
            {nome}
          </div>
          {cells.map((pct, i) => (
            <div key={i} style={{
              width: 52, flexShrink: 0, height: 28, borderRadius: 6, margin: '0 1px',
              background: heatBg(pct),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {pct !== null && (
                <span className="num" style={{ fontSize: 10, fontWeight: 700, color: heatText(pct) }}>
                  {pct.toFixed(0)}%
                </span>
              )}
            </div>
          ))}
        </div>
      ))}
      <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
        {[['≥80%', CC.esmeralda, 'rgba(79,209,165,0.18)'], ['65–80%', CC.ciano, 'rgba(143,184,255,0.15)'], ['50–65%', CC.tinta, 'rgba(183,170,255,0.13)'], ['35–50%', CC.ambar, 'rgba(255,176,87,0.15)'], ['<35%', CC.coral, 'rgba(255,122,138,0.13)']].map(([label, color, bg]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 14, height: 14, borderRadius: 3, background: bg, border: `1px solid ${color}44` }} />
            <span style={{ fontSize: 9.5, color: 'var(--text-dim)', fontFamily: 'var(--font-num)', fontWeight: 600 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// CHART: Discipline avg horizontal bars
// ──────────────────────────────────────────────────────────────────────────────
function DisciplineAvgChart({ provas }) {
  const discMap = {};
  provas.forEach(p => (p.disciplinas || []).forEach(d => {
    if (!d.nome || !d.total || d.total <= 0) return;
    const pct = discPct(d);
    if (!discMap[d.nome]) discMap[d.nome] = [];
    discMap[d.nome].push(pct);
  }));
  const entries = Object.entries(discMap)
    .map(([nome, pcts]) => ({ nome, avg: pcts.reduce((a, b) => a + b, 0) / pcts.length, min: Math.min(...pcts), max: Math.max(...pcts), count: pcts.length }))
    .sort((a, b) => b.avg - a.avg);

  if (entries.length === 0) return <div style={{ fontSize: 12, color: 'var(--text-dim)', padding: '8px 0' }}>Nenhuma disciplina registrada ainda.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {entries.map((e, i) => {
        const color = discColor(e.avg);
        const hasRange = e.count >= 2 && e.max - e.min >= 2;
        return (
          <div key={e.nome}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ flex: 1, fontSize: 11.5, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.nome}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                <span className="num" style={{ fontSize: 12, fontWeight: 800, color }}>{e.avg.toFixed(0)}%</span>
                {hasRange && <span style={{ fontSize: 9.5, color: 'var(--text-dim)', fontFamily: 'var(--font-num)' }}>({e.min.toFixed(0)}–{e.max.toFixed(0)}%)</span>}
                {e.count >= 2 && <span style={{ fontSize: 9, color: 'var(--text-dim)', fontFamily: 'var(--font-num)' }}>·{e.count}×</span>}
              </span>
            </div>
            <div style={{ position: 'relative', height: 8, background: 'rgba(243,235,221,0.07)', borderRadius: 99 }}>
              {hasRange && <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${e.min}%`, width: `${e.max - e.min}%`, background: `${color}18`, borderRadius: 99 }} />}
              <div style={{ height: '100%', width: `${e.avg}%`, background: `linear-gradient(90deg,${color}80,${color})`, borderRadius: 99, transition: `width 700ms ${i * 50}ms cubic-bezier(0.16,1,0.3,1)` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// SECTION: Banca analysis
// ──────────────────────────────────────────────────────────────────────────────
function BancaAnalysisSection({ provas }) {
  const bancas = [...new Set(provas.map(p => p.banca).filter(Boolean))];
  if (bancas.length < 2) return null;

  const stats = bancas.map(b => {
    const ps = [...provas.filter(p => p.banca === b)].sort((a, c) => a.date.localeCompare(c.date));
    const avgDes = ps.reduce((a, p) => a + (p.totalProva > 0 ? (p.pontos / p.totalProva) * 100 : 0), 0) / ps.length;
    const passou = ps.filter(p => p.pontos >= p.corte).length;
    const discMap = {};
    ps.forEach(p => (p.disciplinas || []).forEach(d => {
      if (!d.nome || !d.total || d.total <= 0) return;
      if (!discMap[d.nome]) discMap[d.nome] = [];
      discMap[d.nome].push(discPct(d));
    }));
    const discs = Object.entries(discMap).map(([nome, pcts]) => ({ nome, avg: pcts.reduce((a, b) => a + b, 0) / pcts.length })).sort((a, b) => b.avg - a.avg);
    let trend = null;
    if (ps.length >= 2) {
      const f = ps[0].totalProva > 0 ? (ps[0].pontos / ps[0].totalProva) * 100 : 0;
      const l = ps[ps.length - 1].totalProva > 0 ? (ps[ps.length - 1].pontos / ps[ps.length - 1].totalProva) * 100 : 0;
      trend = l - f;
    }
    return { banca: b, count: ps.length, avgDes, passou, discs, trend };
  }).sort((a, b) => b.avgDes - a.avgDes);

  return (
    <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
      {stats.map(({ banca, avgDes, passou, count, discs, trend }) => {
        const color = discColor(avgDes);
        return (
          <div key={banca} className="glass" style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div className="font-display" style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-heading)' }}>{banca}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-num)', marginTop: 2 }}>
                  {count} {count === 1 ? 'prova' : 'provas'} · {passou} aprovado{passou !== 1 ? 's' : ''}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="num" style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{avgDes.toFixed(0)}%</div>
                {trend !== null && (
                  <div style={{ fontSize: 10, color: trend >= 0 ? CC.esmeralda : CC.ambar, fontWeight: 700, fontFamily: 'var(--font-num)' }}>
                    {trend >= 0 ? '↑' : '↓'}{Math.abs(trend).toFixed(1)}%
                  </div>
                )}
              </div>
            </div>
            <div style={{ height: 6, background: 'rgba(243,235,221,0.07)', borderRadius: 99, marginBottom: 10 }}>
              <div style={{ height: '100%', width: `${Math.min(100, avgDes)}%`, background: `linear-gradient(90deg,${color}80,${color})`, borderRadius: 99 }} />
            </div>
            {discs.length >= 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontSize: 9, color: 'var(--text-dim)', fontFamily: 'var(--font-label)', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 2 }}>DISCIPLINAS</div>
                {discs.slice(0, 4).map(d => (
                  <div key={d.nome} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: 2, background: discColor(d.avg), flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 10.5, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.nome}</span>
                    <span className="num" style={{ fontSize: 10.5, fontWeight: 700, color: discColor(d.avg), flexShrink: 0 }}>{d.avg.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// SECTION: Cross-analysis discipline × banca
// ──────────────────────────────────────────────────────────────────────────────
function CrossAnalysisSection({ provas }) {
  const bancas = [...new Set(provas.map(p => p.banca).filter(Boolean))];
  if (bancas.length < 2) return null;

  const crossMap = {};
  provas.forEach(p => {
    if (!p.banca) return;
    (p.disciplinas || []).forEach(d => {
      if (!d.nome || !d.total || d.total <= 0) return;
      if (!crossMap[d.nome]) crossMap[d.nome] = {};
      if (!crossMap[d.nome][p.banca]) crossMap[d.nome][p.banca] = [];
      crossMap[d.nome][p.banca].push(discPct(d));
    });
  });

  const discNames = Object.entries(crossMap)
    .filter(([, bMap]) => Object.keys(bMap).length >= 2)
    .map(([nome]) => nome).sort();

  if (discNames.length === 0) return (
    <div style={{ fontSize: 12, color: 'var(--text-dim)', padding: '8px 0' }}>
      Registre a mesma disciplina em provas de bancas diferentes para ver esta análise.
    </div>
  );

  const matrix = discNames.map(nome => {
    const cells = bancas.map(b => {
      const pcts = crossMap[nome][b];
      return pcts ? pcts.reduce((a, x) => a + x, 0) / pcts.length : null;
    });
    const all = Object.values(crossMap[nome]).flat();
    const avg = all.reduce((a, x) => a + x, 0) / all.length;
    return { nome, cells, avg };
  }).sort((a, b) => b.avg - a.avg);

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '6px 12px 6px 0', fontSize: 9.5, color: 'var(--text-muted)', fontWeight: 700, fontFamily: 'var(--font-num)', minWidth: 130 }}>DISCIPLINA</th>
            {bancas.map(b => (
              <th key={b} style={{ textAlign: 'center', padding: '6px 8px', fontSize: 9.5, color: 'var(--text-muted)', fontWeight: 700, fontFamily: 'var(--font-num)', whiteSpace: 'nowrap' }}>
                {b.length > 12 ? b.slice(0, 10) + '…' : b}
              </th>
            ))}
            <th style={{ textAlign: 'center', padding: '6px 8px', fontSize: 9.5, color: 'var(--text-muted)', fontWeight: 700, fontFamily: 'var(--font-num)' }}>MÉDIA</th>
          </tr>
        </thead>
        <tbody>
          {matrix.map(({ nome, cells, avg }) => (
            <tr key={nome} style={{ borderTop: '1px solid rgba(243,235,221,0.06)' }}>
              <td style={{ padding: '8px 12px 8px 0', fontSize: 11.5, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                {nome.length > 24 ? nome.slice(0, 22) + '…' : nome}
              </td>
              {cells.map((pct, i) => (
                <td key={i} style={{ textAlign: 'center', padding: '8px 6px' }}>
                  {pct !== null ? (
                    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 99, background: `${discColor(pct)}18`, color: discColor(pct), fontWeight: 700, fontSize: 10.5, fontFamily: 'var(--font-num)' }}>
                      {pct.toFixed(0)}%
                    </span>
                  ) : <span style={{ color: 'var(--text-dim)', fontSize: 10 }}>—</span>}
                </td>
              ))}
              <td style={{ textAlign: 'center', padding: '8px 6px' }}>
                <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 99, background: `${discColor(avg)}25`, color: discColor(avg), fontWeight: 800, fontSize: 11, fontFamily: 'var(--font-num)' }}>
                  {avg.toFixed(0)}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// UI: Insights panel
// ──────────────────────────────────────────────────────────────────────────────
function ConcursosInsightsPanel({ provas }) {
  const items = computeProvasInsights(provas);
  if (items.length === 0) return null;
  return (
    <div className="glass anim-slide-up" style={{ padding: '16px 18px' }}>
      <div style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--text-muted)', fontFamily: 'var(--font-label)', fontWeight: 700, marginBottom: 12 }}>INSIGHTS DA SUA JORNADA</div>
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
        {items.map(ins => (
          <div key={ins.id} style={{
            flexShrink: 0, width: 148, padding: '12px 14px',
            borderRadius: 12,
            background: ins.hl ? 'rgba(22,19,40,0.95)' : 'rgba(22,19,40,0.7)',
            border: `1px solid ${ins.color}28`,
            boxShadow: ins.hl ? `0 3px 12px ${ins.color}18` : 'none',
          }}>
            <div style={{ fontSize: 22, marginBottom: 5, lineHeight: 1 }}><Glyph e={ins.icon} /></div>
            <div className="num" style={{ fontSize: 21, fontWeight: 800, color: ins.color, letterSpacing: '-0.02em', lineHeight: 1 }}>{ins.value}</div>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-label)', letterSpacing: '0.08em', marginTop: 4, textTransform: 'uppercase' }}>{ins.label}</div>
            <div style={{ fontSize: 10.5, color: 'var(--text-dim)', fontWeight: 600, marginTop: 3, lineHeight: 1.35 }}>{ins.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// UI: Collapsible section wrapper
// ──────────────────────────────────────────────────────────────────────────────
function CdpSection({ label, icon, children, defaultOpen = true }) {
  const { useState: useSt } = React;
  const [open, setOpen] = useSt(defaultOpen);
  return (
    <div className="glass anim-slide-up" style={{ padding: '14px 18px' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 8, width: '100%', marginBottom: open ? 14 : 0 }}
      >
        <span style={{ fontSize: 13 }}><Glyph e={icon} /></span>
        <span style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--text-muted)', fontFamily: 'var(--font-label)', fontWeight: 700, flex: 1, textAlign: 'left' }}>{label}</span>
        <span style={{ fontSize: 11, color: 'var(--text-dim)', transform: open ? 'none' : 'rotate(-90deg)', display: 'inline-block', transition: 'transform 200ms' }}>▾</span>
      </button>
      {open && children}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// UI: Compact ProvaCard
// ──────────────────────────────────────────────────────────────────────────────
function ProvaCard({ p, onEdit, onRemove }) {
  const { useState: useSt } = React;
  const [showDiscs, setShowDiscs] = useSt(false);

  const pontos = p.pontos || 0;
  const corte = p.corte || 0;
  const total = p.totalProva || Math.max(pontos, corte, 1);
  const pctDes = (pontos / total) * 100;
  const gapPts = pontos - corte;
  const gapPct = Math.abs(gapPts / total) * 100;
  const passou = gapPts >= 0;
  const discs = [...(p.disciplinas || [])].filter(d => d.nome && d.total > 0).sort((a, b) => discPct(b) - discPct(a));

  const dateStr = p.date ? new Date(p.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' }) : '';

  return (
    <div className="glass" style={{ padding: '14px 16px' }}>
      {/* Row 1: title + performance % */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="font-display" style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-heading)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {provaTitle(p)}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
            {p.cargo && p.orgao && <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{p.cargo}</span>}
            {p.banca && <span style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-num)', fontWeight: 600 }}>{p.banca}</span>}
            {dateStr && <span style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-num)' }}>{dateStr}</span>}
            {passou && <span style={{ fontSize: 9.5, padding: '1px 7px', borderRadius: 99, background: 'rgba(79,209,165,0.1)', color: CC.esmeralda, fontWeight: 700, fontFamily: 'var(--font-num)' }}>✓ APROVADO</span>}
          </div>
        </div>
        <div style={{ flexShrink: 0, textAlign: 'right' }}>
          <div className="num" style={{ fontSize: 24, fontWeight: 800, color: passou ? CC.esmeralda : CC.ciano, lineHeight: 1 }}>{pctDes.toFixed(0)}%</div>
          <div style={{ fontSize: 9.5, color: 'var(--text-dim)', fontFamily: 'var(--font-num)', fontWeight: 600, marginTop: 1 }}>DESEMPENHO</div>
        </div>
      </div>

      {/* Row 2: progress bar */}
      <div style={{ position: 'relative', height: 8, background: 'rgba(243,235,221,0.07)', borderRadius: 99, marginBottom: 6 }}>
        <div style={{ height: '100%', width: `${Math.min(100, pctDes)}%`, background: `linear-gradient(90deg,${passou ? CC.ciano : CC.ciano}80,${passou ? CC.esmeralda : CC.ciano})`, borderRadius: 99, transition: 'width 600ms cubic-bezier(0.16,1,0.3,1)' }} />
        {total > 0 && <div style={{ position: 'absolute', top: -3, bottom: -3, left: `${Math.min(100, (corte / total) * 100)}%`, width: 2, background: CC.ambar, transform: 'translateX(-50%)', borderRadius: 99 }} title={`Corte: ${corte}`} />}
      </div>

      {/* Row 3: score + gap */}
      <div style={{ fontSize: 11.5, fontFamily: 'var(--font-num)', fontWeight: 600 }}>
        <span className="num" style={{ color: passou ? CC.esmeralda : CC.ciano, fontWeight: 700 }}>{pontos}</span>
        <span style={{ color: 'var(--text-dim)' }}> / {total} pts · </span>
        {passou
          ? <span style={{ color: CC.esmeralda }}>+{gapPct.toFixed(1)}% acima do corte</span>
          : <span style={{ color: 'var(--text-muted)' }}>{gapPct.toFixed(1)}% abaixo do corte · faltam {Math.abs(gapPts).toFixed(1)} pts</span>
        }
      </div>

      {/* Disciplines toggle */}
      {discs.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <button onClick={() => setShowDiscs(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-label)', fontWeight: 700, letterSpacing: '0.1em' }}>DISCIPLINAS ({discs.length})</span>
            <span style={{ fontSize: 10, color: 'var(--text-dim)', transform: showDiscs ? 'none' : 'rotate(-90deg)', display: 'inline-block', transition: 'transform 180ms' }}>▾</span>
          </button>
          {showDiscs && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
              {discs.map((d, i) => {
                const pct = discPct(d);
                const color = discColor(pct);
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 7, height: 7, borderRadius: 2, background: color, flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.nome}</span>
                    <div style={{ width: 70, height: 5, background: 'rgba(243,235,221,0.07)', borderRadius: 99, flexShrink: 0 }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99 }} />
                    </div>
                    <span className="num" style={{ fontSize: 11, fontWeight: 700, color, flexShrink: 0, minWidth: 34, textAlign: 'right' }}>{pct.toFixed(0)}%</span>
                    <span style={{ fontSize: 9.5, color: 'var(--text-dim)', flexShrink: 0, minWidth: 52, textAlign: 'right' }}>{d.pontos}/{d.total}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {p.observacoes && (
        <div style={{ marginTop: 10, fontSize: 11.5, color: 'var(--text-muted)', fontStyle: 'italic', paddingLeft: 10 }}>
          {p.observacoes}
        </div>
      )}

      <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
        <button className="btn-ghost" onClick={onEdit} style={{ fontSize: 11, padding: '4px 10px' }}><Glyph e="✏️" /> Editar</button>
        <button className="btn-ghost" onClick={() => { if (window.confirm('Remover este concurso?')) onRemove(); }} style={{ fontSize: 11, padding: '4px 10px', color: 'var(--coral)' }}>✕ Remover</button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// MAIN TAB
// ──────────────────────────────────────────────────────────────────────────────
function ConcursosDesempenhoTab({ provas, setProvas, onXpGain }) {
  const { useState: useSt, useMemo } = React;
  const [showForm, setShowForm] = useSt(false);
  const [editTarget, setEditTarget] = useSt(null);
  const [bancaFilter, setBancaFilter] = useSt('');
  const [formError, setFormError] = useSt('');
  const [form, setForm] = useSt({ cargo: '', banca: '', orgao: '', date: '', totalProva: '', pontos: '', corte: '', observacoes: '', disciplinas: [] });

  const emptyDisc = () => ({ id: Date.now() + Math.random(), nome: '', pontos: '', total: '' });

  function openNew() { setForm({ cargo: '', banca: '', orgao: '', date: '', totalProva: '', pontos: '', corte: '', observacoes: '', disciplinas: [] }); setEditTarget(null); setFormError(''); setShowForm(true); }
  function openEdit(p) {
    setForm({ cargo: p.cargo || '', banca: p.banca || '', orgao: p.orgao || '', date: p.date || '', totalProva: String(p.totalProva || ''), pontos: String(p.pontos || ''), corte: String(p.corte || ''), observacoes: p.observacoes || '', disciplinas: (p.disciplinas || []).map(d => ({ id: Date.now() + Math.random(), nome: d.nome, pontos: String(d.pontos), total: String(d.total) })) });
    setEditTarget(p.id); setFormError(''); setShowForm(true);
  }
  function closeForm() { setShowForm(false); setEditTarget(null); setFormError(''); }

  function setF(k, v) { setForm(f => ({ ...f, [k]: v })); }
  function addDisc() { setForm(f => ({ ...f, disciplinas: [...f.disciplinas, emptyDisc()] })); }
  function updateDisc(id, k, v) { setForm(f => ({ ...f, disciplinas: f.disciplinas.map(d => d.id === id ? { ...d, [k]: v } : d) })); }
  function removeDisc(id) { setForm(f => ({ ...f, disciplinas: f.disciplinas.filter(d => d.id !== id) })); }

  function handleSave() {
    const p = parseFloat(form.pontos), c = parseFloat(form.corte), t = parseFloat(form.totalProva);
    if (!form.cargo.trim()) { setFormError('Informe o cargo/concurso.'); return; }
    if (!form.date) { setFormError('Informe a data.'); return; }
    if (isNaN(t) || t <= 0) { setFormError('Informe o total de pontos da prova.'); return; }
    if (isNaN(p) || p < 0) { setFormError('Informe sua pontuação.'); return; }
    if (isNaN(c) || c <= 0) { setFormError('Informe a nota de corte.'); return; }
    if (p > t) { setFormError('Pontuação maior que o total da prova.'); return; }
    if (c > t) { setFormError('Corte maior que o total da prova.'); return; }

    const cleanDiscs = form.disciplinas.filter(d => d.nome.trim() && parseFloat(d.total) > 0).map(d => ({
      nome: d.nome.trim(), pontos: Math.min(parseFloat(d.total), Math.max(0, parseFloat(d.pontos) || 0)), total: parseFloat(d.total),
    }));

    const entry = { id: editTarget || `prova-${Date.now()}`, cargo: form.cargo.trim(), banca: form.banca.trim(), orgao: form.orgao.trim(), date: form.date, totalProva: t, pontos: p, corte: c, observacoes: form.observacoes.trim(), disciplinas: cleanDiscs };
    const isNew = !editTarget;

    if (isNew) {
      const { xp, kind } = calcProvaXp(entry, true, provas);
      setProvas(arr => [...arr, entry]);
      if (xp > 0 && onXpGain) onXpGain(xp, kind);
    } else {
      setProvas(arr => arr.map(x => x.id === editTarget ? entry : x));
    }
    closeForm();
  }

  const sorted = useMemo(() => [...provas].sort((a, b) => b.date.localeCompare(a.date)), [provas]);
  const chrono = useMemo(() => [...sorted].reverse(), [sorted]);
  const bancas = useMemo(() => [...new Set(sorted.map(p => p.banca).filter(Boolean))], [sorted]);
  const filtered = useMemo(() => bancaFilter ? sorted.filter(p => p.banca === bancaFilter) : sorted, [sorted, bancaFilter]);
  const hasDiscs = useMemo(() => provas.some(p => (p.disciplinas || []).length > 0), [provas]);
  const usedNames = useMemo(() => [...new Set(provas.flatMap(p => (p.disciplinas || []).map(d => d.nome).filter(Boolean)))], [provas]);

  // Live preview
  const prvP = parseFloat(form.pontos), prvC = parseFloat(form.corte), prvT = parseFloat(form.totalProva);
  const showPrev = !isNaN(prvP) && !isNaN(prvC) && !isNaN(prvT) && prvT > 0;
  const prvPassou = prvP >= prvC;
  const prvGapPct = showPrev ? Math.abs(prvP - prvC) / prvT * 100 : 0;
  const prvPctDes = showPrev ? (prvP / prvT) * 100 : 0;

  const lbl = (text, req) => (
    <label style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 4 }}>
      {text}{req && <span style={{ color: 'var(--coral)', marginLeft: 2 }}>*</span>}
    </label>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="font-display" style={{ fontSize: 21, fontWeight: 800, color: 'var(--text-heading)' }}>Desempenho em Concursos</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-label)', letterSpacing: '0.12em', fontWeight: 700, marginTop: 3 }}>
            {provas.length === 0 ? 'PAINEL ESTRATÉGICO' : `${provas.length} ${provas.length === 1 ? 'CONCURSO' : 'CONCURSOS'} REGISTRADO${provas.length === 1 ? '' : 'S'}`}
          </div>
        </div>
        <button className="btn-neon" onClick={openNew} style={{ fontSize: 12 }}>+ Registrar prova</button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="glass anim-slide-up" style={{ padding: '18px 20px', border: '1px solid rgba(143,184,255,0.2)' }}>
          <div style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--text-muted)', fontFamily: 'var(--font-label)', fontWeight: 700, marginBottom: 14 }}>
            {editTarget ? 'EDITAR PROVA' : 'REGISTRAR PROVA ANTERIOR'}
          </div>
          <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', marginBottom: 10 }}>
            <div style={{ gridColumn: 'span 2' }}>
              {lbl('Cargo / Concurso', true)}
              <input className="input-base" placeholder="ex: Defensor Público" value={form.cargo} autoFocus onChange={e => setF('cargo', e.target.value)} style={{ width: '100%' }} />
            </div>
            <div>
              {lbl('Banca')}
              <select className="input-base" value={form.banca} onChange={e => setF('banca', e.target.value)} style={{ width: '100%' }}>
                <option value="">Selecionar</option>
                {BANCAS_CONCURSO.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              {lbl('Órgão')}
              <input className="input-base" placeholder="ex: DPE-BA" value={form.orgao} onChange={e => setF('orgao', e.target.value)} style={{ width: '100%' }} />
            </div>
            <div>
              {lbl('Data', true)}
              <input className="input-base" type="date" value={form.date} onChange={e => setF('date', e.target.value)} style={{ width: '100%' }} />
            </div>
            <div>
              {lbl('Total da prova', true)}
              <input className="input-base" type="number" placeholder="100" value={form.totalProva} onChange={e => setF('totalProva', e.target.value)} style={{ width: '100%' }} />
            </div>
            <div>
              {lbl('Seus pontos', true)}
              <input className="input-base" type="number" placeholder="68" value={form.pontos} onChange={e => setF('pontos', e.target.value)} style={{ width: '100%' }} />
            </div>
            <div>
              {lbl('Nota de corte', true)}
              <input className="input-base" type="number" placeholder="74" value={form.corte} onChange={e => setF('corte', e.target.value)} style={{ width: '100%' }} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              {lbl('Observações')}
              <input className="input-base" placeholder="Notas sobre esta prova (opcional)" value={form.observacoes} onChange={e => setF('observacoes', e.target.value)} style={{ width: '100%' }} />
            </div>
          </div>

          {/* Live preview */}
          {showPrev && (
            <div style={{ padding: '8px 12px', borderRadius: 8, marginBottom: 12, background: prvPassou ? 'rgba(79,209,165,0.07)' : 'rgba(143,184,255,0.06)', border: `1px solid ${prvPassou ? 'rgba(79,209,165,0.22)' : 'rgba(143,184,255,0.2)'}`, display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', fontSize: 12 }}>
              <span style={{ fontWeight: 700, color: prvPassou ? CC.esmeralda : CC.ciano, fontFamily: 'var(--font-num)' }}>
                {prvPassou ? '✓ ' : ''}{prvGapPct.toFixed(1)}% {prvPassou ? 'acima do corte' : 'abaixo do corte'}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>Desempenho: {prvPctDes.toFixed(1)}% · {prvP} / {prvT} pts</span>
            </div>
          )}

          {/* Disciplines */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-muted)', fontFamily: 'var(--font-label)', fontWeight: 700 }}>
                DISCIPLINAS <span style={{ opacity: 0.6 }}>(opcional)</span>
              </div>
              <button className="btn-ghost" onClick={addDisc} style={{ fontSize: 11, padding: '3px 10px', color: 'var(--ciano)' }}>+ Adicionar</button>
            </div>
            {usedNames.length > 0 && form.disciplinas.length > 0 && (
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
                {usedNames.slice(0, 8).map(name => (
                  <button key={name} onClick={() => {
                    const empty = form.disciplinas.find(d => !d.nome);
                    if (empty) updateDisc(empty.id, 'nome', name);
                    else setForm(f => ({ ...f, disciplinas: [...f.disciplinas, { ...emptyDisc(), nome: name }] }));
                  }} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, cursor: 'pointer', border: '1px solid rgba(143,184,255,0.3)', background: 'rgba(143,184,255,0.06)', color: 'var(--ciano)', fontWeight: 600 }}>
                    {name.length > 20 ? name.slice(0, 18) + '…' : name}
                  </button>
                ))}
              </div>
            )}
            {form.disciplinas.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 28px', gap: 5, paddingRight: 2 }}>
                  {['DISCIPLINA', 'ACERTOS', 'TOTAL', ''].map((h, i) => (
                    <div key={i} style={{ fontSize: 9.5, color: 'var(--text-dim)', fontWeight: 700, fontFamily: 'var(--font-num)', textAlign: i > 0 && i < 3 ? 'center' : 'left' }}>{h}</div>
                  ))}
                </div>
                {form.disciplinas.map(d => {
                  const pct = parseFloat(d.total) > 0 ? Math.min(100, (parseFloat(d.pontos) || 0) / parseFloat(d.total) * 100) : null;
                  const color = pct !== null ? discColor(pct) : 'var(--text-dim)';
                  return (
                    <div key={d.id} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 28px', gap: 5, alignItems: 'center' }}>
                      <input className="input-base" placeholder="Nome da disciplina" value={d.nome} onChange={e => updateDisc(d.id, 'nome', e.target.value)} style={{ width: '100%', fontSize: 11 }} />
                      <input className="input-base" type="number" placeholder="Pts" value={d.pontos} onChange={e => updateDisc(d.id, 'pontos', e.target.value)} style={{ width: '100%', fontSize: 11, textAlign: 'center' }} />
                      <div style={{ position: 'relative' }}>
                        <input className="input-base" type="number" placeholder="Total" value={d.total} onChange={e => updateDisc(d.id, 'total', e.target.value)} style={{ width: '100%', fontSize: 11, textAlign: 'center' }} />
                        {pct !== null && <span style={{ position: 'absolute', right: -34, top: '50%', transform: 'translateY(-50%)', fontSize: 10, fontWeight: 800, color, fontFamily: 'var(--font-num)', whiteSpace: 'nowrap' }}>{pct.toFixed(0)}%</span>}
                      </div>
                      <button onClick={() => removeDisc(d.id)} style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid rgba(243,235,221,0.15)', background: 'rgba(243,235,221,0.04)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {formError && <div style={{ fontSize: 11.5, color: 'var(--coral)', fontWeight: 600, marginBottom: 10 }}><Glyph e="⚠" /> {formError}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-neon" onClick={handleSave} style={{ fontSize: 12 }}>{editTarget ? '✓ Salvar' : '+ Registrar'}</button>
            <button className="btn-ghost" onClick={closeForm} style={{ fontSize: 12 }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {provas.length === 0 && !showForm && (
        <div className="glass" style={{ padding: '48px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: 44, opacity: 0.15, marginBottom: 12 }}><Glyph e="🏛️" /></div>
          <div className="font-display" style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-heading)', marginBottom: 6 }}>Comece sua jornada</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 16 }}>
            Registre sua primeira prova para começar a<br />acompanhar sua evolução estratégica.
          </div>
          <button className="btn-neon" onClick={openNew}>+ Registrar primeira prova</button>
        </div>
      )}

      {/* Insights */}
      {provas.length >= 1 && <ConcursosInsightsPanel provas={provas} />}

      {/* Analytics sections */}
      {provas.length >= 2 && (
        <CdpSection label="EVOLUÇÃO GERAL" icon="📈">
          <ProvaSummaryChart provas={chrono} />
        </CdpSection>
      )}

      {hasDiscs && (
        <CdpSection label="ANÁLISE DE DISCIPLINAS" icon="📊">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--text-dim)', fontFamily: 'var(--font-label)', fontWeight: 600, marginBottom: 10 }}>MÉDIA POR DISCIPLINA</div>
              <DisciplineAvgChart provas={provas} />
            </div>
            {provas.length >= 2 && <div style={{ borderTop: '1px solid rgba(243,235,221,0.07)', paddingTop: 18 }}>
              <div style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--text-dim)', fontFamily: 'var(--font-label)', fontWeight: 600, marginBottom: 10 }}>EVOLUÇÃO TEMPORAL POR DISCIPLINA</div>
              <DisciplineLineChart provas={provas} />
            </div>}
            {(() => {
              const n = new Set(provas.flatMap(p => (p.disciplinas || []).map(d => d.nome).filter(Boolean))).size;
              return n >= 3 ? (
                <div style={{ borderTop: '1px solid rgba(243,235,221,0.07)', paddingTop: 18 }}>
                  <div style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--text-dim)', fontFamily: 'var(--font-label)', fontWeight: 600, marginBottom: 10 }}>RADAR DE DISCIPLINAS</div>
                  <CdpRadarChart provas={provas} />
                </div>
              ) : null;
            })()}
            {provas.length >= 2 && <div style={{ borderTop: '1px solid rgba(243,235,221,0.07)', paddingTop: 18 }}>
              <div style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--text-dim)', fontFamily: 'var(--font-label)', fontWeight: 600, marginBottom: 10 }}>HEATMAP DE DESEMPENHO</div>
              <PerformanceHeatmap provas={provas} />
            </div>}
          </div>
        </CdpSection>
      )}

      {bancas.length >= 2 && (
        <CdpSection label="ANÁLISE POR BANCA" icon="🏛️">
          <BancaAnalysisSection provas={provas} />
        </CdpSection>
      )}

      {bancas.length >= 2 && hasDiscs && (
        <CdpSection label="CRUZAMENTO DISCIPLINA × BANCA" icon="🔀" defaultOpen={false}>
          <CrossAnalysisSection provas={provas} />
        </CdpSection>
      )}

      {/* History */}
      {provas.length > 0 && (
        <div className="glass anim-slide-up" style={{ padding: '14px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--text-muted)', fontFamily: 'var(--font-label)', fontWeight: 700 }}>
              HISTÓRICO · {sorted.length} {sorted.length === 1 ? 'CONCURSO' : 'CONCURSOS'}
            </div>
            {bancas.length >= 2 && (
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {[null, ...bancas].map(b => (
                  <button key={b || '__all'} onClick={() => setBancaFilter(b || '')} style={{
                    fontSize: 10, padding: '3px 10px', borderRadius: 99, cursor: 'pointer',
                    border: `1px solid ${bancaFilter === (b || '') ? 'rgba(143,184,255,0.5)' : 'rgba(243,235,221,0.12)'}`,
                    background: bancaFilter === (b || '') ? 'rgba(143,184,255,0.08)' : 'transparent',
                    color: bancaFilter === (b || '') ? 'var(--ciano)' : 'var(--text-muted)',
                    fontWeight: bancaFilter === (b || '') ? 700 : 600, fontFamily: 'var(--font-num)',
                    transition: 'all 150ms ease',
                  }}>{b || 'Todas'}</button>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(p => (
              <ProvaCard key={p.id} p={p} onEdit={() => openEdit(p)} onRemove={() => setProvas(arr => arr.filter(x => x.id !== p.id))} />
            ))}
            {filtered.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-dim)', padding: '12px 0' }}>Nenhuma prova com este filtro.</div>}
          </div>
        </div>
      )}
    </div>
  );
}

window.ConcursosDesempenhoTab = ConcursosDesempenhoTab;
