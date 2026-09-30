// Lendário — Aba Simulados — Dashboard + Cadastro + Histórico
// Independente para Objetiva e Discursiva (filtra pelo `mode` atual).

const SIM_BANCAS = ['CESPE/CEBRASPE', 'FCC', 'FGV', 'VUNESP', 'IBFC', 'IADES', 'AOCP', 'Quadrix', 'Própria', 'Outra'];

function accColorTier(pct) {
  if (pct >= 80) return { color: '#98CAE0', glow: 'rgba(56,189,248,0.55)', label: 'Excelente' }; // azul brilhante
  if (pct >= 70) return { color: '#9BE9C9', glow: 'rgba(79,209,165,0.50)', label: 'Bom' };          // verde
  if (pct >= 60) return { color: '#EEB791', glow: 'rgba(255,176,87,0.50)', label: 'Atenção' };     // amarelo
  return { color: '#EE9E95', glow: 'rgba(255,122,138,0.55)', label: 'Crítico' };                     // vermelho
}
function accBarBg(pct) {
  if (pct >= 80) return 'linear-gradient(90deg, #38BDF8, #0EA5E9)';
  if (pct >= 70) return 'linear-gradient(90deg, #34D399, #059669)';
  if (pct >= 60) return 'linear-gradient(90deg, #FBBF24, #D97706)';
  return 'linear-gradient(90deg, #F87171, #DC2626)';
}

function fmtTimeMin(min) {
  if (!min) return '—';
  const h = Math.floor(min / 60), m = min % 60;
  if (h === 0) return `${m}min`;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2,'0')}`;
}
function fmtDateLong(iso) {
  if (!iso) return '—';
  return new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: '2-digit' });
}
function fmtDateShort(iso) {
  if (!iso) return '—';
  return new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' });
}

// ──────────────────────────────────────────────────────────
// Performance pink line chart (accuracy over time)
// ──────────────────────────────────────────────────────────
function PerformanceLineChart({ sims }) {
  const PINK = '#EC4899', PINK_DEEP = '#BE185D', PINK_GLOW = '#F9A8D4';
  const data = sims.map(s => {
    const t = window.DA.simuladoTotals(s);
    return { date: s.date, accuracy: t.accuracy };
  }).sort((a, b) => a.date.localeCompare(b.date));
  const W = 320, H = 100, P = 22;
  if (data.length === 0) {
    return (
      <div style={{ height: H, display: 'grid', placeItems: 'center', color: 'var(--text-dim)', fontSize: 12 }}>
        Registre um simulado para ver sua evolução.
      </div>
    );
  }
  const min = 0, max = 100;
  const xs = data.map((_, i) => P + (i / Math.max(1, data.length - 1)) * (W - 2 * P));
  const ys = data.map(s => H - P - ((s.accuracy - min) / (max - min)) * (H - 2 * P));
  const path = data.map((_, i) => `${i === 0 ? 'M' : 'L'} ${xs[i].toFixed(1)} ${ys[i].toFixed(1)}`).join(' ');
  const area = `${path} L ${xs[xs.length - 1].toFixed(1)} ${H - P} L ${xs[0].toFixed(1)} ${H - P} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: 'block' }}>
      <defs>
        <linearGradient id="sim-perf-line" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor={PINK_GLOW} />
          <stop offset="100%" stopColor={PINK_DEEP} />
        </linearGradient>
        <linearGradient id="sim-perf-area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={PINK} stopOpacity="0.35" />
          <stop offset="100%" stopColor={PINK} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[0, 50, 100].map(v => {
        const y = H - P - (v / max) * (H - 2 * P);
        return (
          <g key={v}>
            <line x1={P} y1={y} x2={W - P} y2={y} stroke="rgba(243,235,221,0.06)" strokeDasharray="2 4" />
            <text x={P - 4} y={y + 3} textAnchor="end" fontSize="8" fill="rgba(179,171,199,0.6)" fontFamily="Manrope, sans-serif">{v}</text>
          </g>
        );
      })}
      {data.length > 1 && <path d={area} fill="url(#sim-perf-area)" />}
      <path d={path} fill="none" stroke="url(#sim-perf-line)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((s, i) => (
        <g key={i}>
          <circle cx={xs[i]} cy={ys[i]} r="4" fill="white" stroke={PINK_DEEP} strokeWidth="2" />
        </g>
      ))}
    </svg>
  );
}

// ──────────────────────────────────────────────────────────
// SimuladosTab — main tab content
// ──────────────────────────────────────────────────────────
function SimuladosTab({ shared, objState, discState, mode, onAddSimulado, onRemoveSimulado }) {
  const [formOpen, setFormOpen] = React.useState(false);
  const [expanded, setExpanded] = React.useState({});

  const all = shared.simulados || [];
  const filtered = all.filter(s => (s.style || 'objetiva') === mode);
  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));

  const last = sorted[0] || null;
  const lastTotals = last ? window.DA.simuladoTotals(last) : null;
  const lastTier = lastTotals ? accColorTier(lastTotals.accuracy) : null;

  const subjects = mode === 'objetiva' ? (objState.subjects || []) : (discState.subjects || []);
  const modeColor = mode === 'objetiva' ? 'var(--ciano)' : 'var(--coral)';
  const modeLabel = mode === 'objetiva' ? 'Objetiva' : 'Discursiva';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div className="font-display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-heading)' }}>
            Simulados <span style={{ color: modeColor }}>· {modeLabel}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            Registre, acompanhe e evolua. Os resultados alimentam suas estatísticas gerais.
          </div>
        </div>
        <button onClick={() => setFormOpen(true)} className="btn-neon" style={{
          padding: '9px 18px', fontSize: 13,
          background: 'var(--grad-primary)', borderColor: 'transparent', color: 'var(--on-primary)',
        }}>
          <I.plus size={13} stroke={2.5} /> Novo Simulado
        </button>
      </div>

      {/* Dashboard cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>

        {/* Card 1 — Simulados Realizados */}
        <div className="glass" style={{ padding: '16px 18px' }}>
          <div style={{ fontSize: 9.5, letterSpacing: '0.22em', color: 'var(--text-muted)', fontFamily: 'var(--font-label)', fontWeight: 700, marginBottom: 6 }}>
            SIMULADOS REALIZADOS
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span className="num" style={{ fontSize: 38, fontWeight: 800, color: modeColor, letterSpacing: '-0.03em' }}>{filtered.length}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
              {filtered.length === 1 ? 'simulado' : 'simulados'}
            </span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4, fontFamily: 'var(--font-num)', fontWeight: 600 }}>
            no modo {modeLabel.toLowerCase()}
          </div>
        </div>

        {/* Card 2 — Último Simulado */}
        <div className="glass" style={{ padding: '16px 18px' }}>
          <div style={{ fontSize: 9.5, letterSpacing: '0.22em', color: 'var(--text-muted)', fontFamily: 'var(--font-label)', fontWeight: 700, marginBottom: 6 }}>
            ÚLTIMO SIMULADO
          </div>
          {last && lastTotals ? (
            <>
              <div className="font-display" style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                {last.name || 'Sem nome'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontFamily: 'var(--font-num)', fontWeight: 600 }}>
                {fmtDateShort(last.date)}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
                <span className="num" style={{ fontSize: 34, fontWeight: 800, color: lastTier.color, letterSpacing: '-0.03em', filter: `drop-shadow(0 0 6px ${lastTier.glow})` }}>
                  {lastTotals.accuracy.toFixed(0)}<span style={{ fontSize: 14, opacity: 0.7 }}>%</span>
                </span>
                <div style={{ display: 'flex', gap: 10, fontSize: 11, fontFamily: 'var(--font-num)', fontWeight: 700 }}>
                  <span style={{ color: 'var(--esmeralda)' }}>✓ {lastTotals.correct}</span>
                  <span style={{ color: 'var(--coral)' }}>✗ {lastTotals.wrong}</span>
                </div>
              </div>
            </>
          ) : (
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Nenhum simulado registrado ainda.</div>
          )}
        </div>

        {/* Card 3 — Seu Desempenho (gráfico rosa) */}
        <div className="glass" style={{
          padding: '16px 18px',
          background: 'linear-gradient(145deg, rgba(22,19,40,0.85), rgba(22,19,40,0.6)), radial-gradient(ellipse at 0% 0%, rgba(236,72,153,0.10), transparent 60%)',
          border: '1px solid rgba(236,72,153,0.22)',
        }}>
          <div style={{ fontSize: 9.5, letterSpacing: '0.22em', color: 'var(--text-muted)', fontFamily: 'var(--font-label)', fontWeight: 700, marginBottom: 6 }}>
            SEU DESEMPENHO
          </div>
          <PerformanceLineChart sims={filtered} />
        </div>
      </div>

      {/* Histórico */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div className="font-display" style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-heading)' }}>
            Histórico de simulados
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {sorted.length} registro{sorted.length !== 1 ? 's' : ''}
          </div>
        </div>

        {sorted.length === 0 ? (
          <div className="glass" style={{ padding: 28, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}><Glyph e="🎯" /></div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Sem simulados por enquanto</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              Clique em <strong>Novo Simulado</strong> para registrar seu primeiro.
            </div>
          </div>
        ) : sorted.map(sim => {
          const tot = window.DA.simuladoTotals(sim);
          const tier = accColorTier(tot.accuracy);
          const isOpen = !!expanded[sim.id];
          const sortedDiscs = [...(sim.disciplinas || [])].sort((a, b) => {
            const accA = a.questions > 0 ? a.correct / a.questions : 0;
            const accB = b.questions > 0 ? b.correct / b.questions : 0;
            return accB - accA;
          });
          return (
            <div key={sim.id} className="glass" style={{ padding: 0, overflow: 'hidden' }}>
              <div onClick={() => setExpanded(e => ({ ...e, [sim.id]: !e[sim.id] }))}
                style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="font-display" style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {sim.name || 'Sem nome'}
                    {sim.banca && <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-num)', fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: 'rgba(243,235,221,0.05)' }}>{sim.banca}</span>}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'var(--font-num)', fontWeight: 600 }}>
                    {fmtDateLong(sim.date)} · ⏱ {fmtTimeMin(sim.timeMinutes)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 14, fontSize: 12, fontFamily: 'var(--font-num)', fontWeight: 700, alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Q: <span className="num" style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{tot.questions}</span></span>
                  <span style={{ color: 'var(--esmeralda)' }}>✓ {tot.correct}</span>
                  <span style={{ color: 'var(--coral)' }}>✗ {tot.wrong}</span>
                  <span className="num" style={{
                    padding: '4px 12px', borderRadius: 99,
                    background: `${tier.color}14`, border: `1px solid ${tier.color}55`,
                    color: tier.color, fontWeight: 800, fontSize: 13,
                    filter: `drop-shadow(0 0 6px ${tier.glow})`,
                  }}>{tot.accuracy.toFixed(0)}%</span>
                  <button className="btn-ghost" style={{ padding: 4, transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 150ms' }}
                    onClick={e => { e.stopPropagation(); setExpanded(x => ({ ...x, [sim.id]: !x[sim.id] })); }}>
                    <I.chevronR size={14} />
                  </button>
                </div>
              </div>

              {isOpen && (
                <div style={{ padding: '0 18px 16px', borderTop: '1px solid rgba(243,235,221,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, padding: '10px 0 6px' }}>
                    <div style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--text-dim)', fontFamily: 'var(--font-label)', fontWeight: 700 }}>
                      DESEMPENHO POR DISCIPLINA
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {sim.estilo && <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-num)', fontWeight: 700 }}>{sim.estilo}</span>}
                      <button className="btn-ghost" style={{ fontSize: 11, color: 'var(--coral)', borderColor: 'rgba(255,122,138,0.35)' }}
                        onClick={() => {
                          if (window.confirm('Excluir este simulado? Esta ação não pode ser desfeita.')) onRemoveSimulado(sim.id);
                        }}>
                        <I.close size={11} /> Excluir
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {sortedDiscs.length === 0 && (
                      <div style={{ fontSize: 12, color: 'var(--text-dim)', padding: '6px 0' }}>Nenhuma disciplina registrada.</div>
                    )}
                    {sortedDiscs.map((d, di) => {
                      const acc = d.questions > 0 ? (d.correct / d.questions) * 100 : 0;
                      const dt = accColorTier(acc);
                      return (
                        <div key={di} style={{ display: 'grid', gridTemplateColumns: '1.3fr 70px 70px 1.5fr 60px', gap: 10, alignItems: 'center', padding: '6px 0' }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
                          <div className="num" style={{ fontSize: 11, color: 'var(--esmeralda)', fontWeight: 800, textAlign: 'center' }}>✓ {d.correct}</div>
                          <div className="num" style={{ fontSize: 11, color: 'var(--coral)', fontWeight: 800, textAlign: 'center' }}>✗ {d.wrong}</div>
                          <div style={{ height: 10, background: 'rgba(243,235,221,0.05)', borderRadius: 99, overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', width: `${Math.min(100, acc)}%`,
                              background: accBarBg(acc),
                              borderRadius: 99,
                              boxShadow: `0 0 6px ${dt.glow}`,
                              transition: 'width 600ms cubic-bezier(0.16,1,0.3,1)',
                            }} />
                          </div>
                          <div className="num" style={{ fontSize: 12, fontWeight: 800, color: dt.color, textAlign: 'right' }}>{acc.toFixed(0)}%</div>
                        </div>
                      );
                    })}
                  </div>
                  {sim.comments && (
                    <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 8, background: 'rgba(243,235,221,0.04)', fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.5 }}>
                      "{sim.comments}"
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <SimuladoFormModal
        open={formOpen}
        mode={mode}
        subjects={subjects}
        onClose={() => setFormOpen(false)}
        onSave={(payload) => { onAddSimulado(payload); setFormOpen(false); }}
      />
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// SimuladoFormModal — cadastro
// ──────────────────────────────────────────────────────────
function SimuladoFormModal({ open, mode, subjects, onClose, onSave }) {
  const todayISO = new Date().toISOString().slice(0, 10);
  const [form, setForm] = React.useState({
    date: todayISO,
    name: '',
    estilo: '',
    banca: '',
    hours: '',
    minutes: '',
    comments: '',
  });
  const [rows, setRows] = React.useState([]);

  React.useEffect(() => {
    if (!open) return;
    setForm({
      date: todayISO,
      name: '',
      estilo: mode === 'objetiva' ? 'Objetiva' : 'Discursiva',
      banca: '',
      hours: '',
      minutes: '',
      comments: '',
    });
    setRows((subjects || []).map(s => ({
      subjectId: s.id, name: s.name, peso: s.weight || 1,
      questions: '', correct: '', wrong: '',
    })));
  }, [open, mode]);

  if (!open) return null;

  const updateRow = (i, key, val) => setRows(rs => rs.map((r, j) => j === i ? { ...r, [key]: val } : r));
  const numericRow = (r) => ({
    name: r.name, peso: Math.max(1, Math.min(5, Number(r.peso) || 1)),
    questions: Math.max(0, parseInt(r.questions) || 0),
    correct: Math.max(0, parseInt(r.correct) || 0),
    wrong: Math.max(0, parseInt(r.wrong) || 0),
  });
  const totals = rows.reduce((a, r) => {
    const n = numericRow(r);
    return { questions: a.questions + n.questions, correct: a.correct + n.correct, wrong: a.wrong + n.wrong };
  }, { questions: 0, correct: 0, wrong: 0 });
  const accuracy = totals.questions > 0 ? (totals.correct / totals.questions) * 100 : 0;
  const tier = accColorTier(accuracy);
  const timeMinutes = (parseInt(form.hours) || 0) * 60 + (parseInt(form.minutes) || 0);

  const handleSave = () => {
    const disciplinas = rows
      .map(numericRow)
      .filter(r => r.questions > 0 || r.correct > 0 || r.wrong > 0);
    if (disciplinas.length === 0) {
      window.alert('Registre ao menos uma disciplina com questões/acertos/erros.');
      return;
    }
    onSave({
      id: `sim-${Date.now()}`,
      date: form.date,
      name: form.name.trim() || 'Simulado',
      style: mode,
      estilo: form.estilo || (mode === 'objetiva' ? 'Objetiva' : 'Discursiva'),
      banca: form.banca || '',
      timeMinutes,
      comments: form.comments.trim() || '',
      disciplinas,
      createdAt: new Date().toISOString(),
    });
  };

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    padding: '8px 10px', borderRadius: 8,
    border: '1px solid rgba(243,235,221,0.13)',
    background: 'rgba(22,19,40,0.75)',
    fontSize: 13, color: 'var(--grafite)',
    fontFamily: 'inherit', outline: 'none',
  };
  const labelStyle = { fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4, display: 'block' };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 95,
      background: 'radial-gradient(ellipse at 50% 30%, rgba(42,31,92,0.55), rgba(7,6,13,0.86))', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: 16, overflowY: 'auto', WebkitOverflowScrolling: 'touch',
    }}>
      <div onClick={e => e.stopPropagation()} className="glass-strong anim-slide-up"
        style={{ width: '100%', maxWidth: 760, padding: 22, borderRadius: 18, position: 'relative', margin: 'auto 0' }}>
        <button onClick={onClose} className="btn-ghost" style={{ position: 'absolute', top: 12, right: 12 }}>
          <I.close size={13} />
        </button>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.25em', color: 'var(--tinta)', fontFamily: 'var(--font-label)', fontWeight: 800 }}>
            NOVO SIMULADO · {mode === 'objetiva' ? 'OBJETIVA' : 'DISCURSIVA'}
          </div>
          <div className="font-display gradient-neon" style={{ fontSize: 22, fontWeight: 700, marginTop: 3 }}>
            Registre o resultado 🎯
          </div>
        </div>

        {/* Top metadata grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>Data</label>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Nome</label>
            <input type="text" placeholder="ex: DPE-SP 1ª fase 2024" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Estilo de prova</label>
            <input type="text" placeholder="ex: 1ª fase, Reta final…" value={form.estilo}
              onChange={e => setForm(f => ({ ...f, estilo: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Banca</label>
            <select value={form.banca} onChange={e => setForm(f => ({ ...f, banca: e.target.value }))} style={inputStyle}>
              <option value="">— Selecione —</option>
              {SIM_BANCAS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Tempo gasto</label>
            <div style={{ display: 'flex', gap: 6 }}>
              <input type="number" min={0} max={12} placeholder="0h" value={form.hours}
                onChange={e => setForm(f => ({ ...f, hours: e.target.value }))} style={{ ...inputStyle, textAlign: 'center' }} />
              <input type="number" min={0} max={59} placeholder="0min" value={form.minutes}
                onChange={e => setForm(f => ({ ...f, minutes: e.target.value }))} style={{ ...inputStyle, textAlign: 'center' }} />
            </div>
          </div>
        </div>

        {/* Disciplines table */}
        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(243,235,221,0.07)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 90px 90px', gap: 8, padding: '10px 12px', background: 'rgba(243,235,221,0.04)', fontSize: 10, fontFamily: 'var(--font-label)', fontWeight: 800, color: 'var(--text-dim)', letterSpacing: '0.08em' }}>
            <div>DISCIPLINA</div>
            <div style={{ textAlign: 'center' }}>Qtd Q. ✎</div>
            <div style={{ textAlign: 'center', color: 'var(--esmeralda)' }}>✓ ACERTOS</div>
            <div style={{ textAlign: 'center', color: 'var(--coral)' }}>✗ ERROS</div>
          </div>
          <div style={{ maxHeight: '40vh', overflowY: 'auto' }}>
            {rows.length === 0 && (
              <div style={{ padding: 14, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
                Cadastre disciplinas na Matriz do Edital para preencher esta tabela.
              </div>
            )}
            {rows.map((r, i) => (
              <div key={r.subjectId || i} style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 90px 90px', gap: 8, padding: '6px 12px', borderTop: '1px solid rgba(243,235,221,0.04)', alignItems: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.name}>{r.name}</div>
                <input type="number" min={0} placeholder="0" value={r.questions}
                  onChange={e => updateRow(i, 'questions', e.target.value)}
                  style={{ ...inputStyle, textAlign: 'center', fontSize: 13 }} />
                <input type="number" min={0} placeholder="0" value={r.correct}
                  onChange={e => updateRow(i, 'correct', e.target.value)}
                  style={{ ...inputStyle, textAlign: 'center', fontSize: 13, color: 'var(--esmeralda)', fontWeight: 800 }} />
                <input type="number" min={0} placeholder="0" value={r.wrong}
                  onChange={e => updateRow(i, 'wrong', e.target.value)}
                  style={{ ...inputStyle, textAlign: 'center', fontSize: 13, color: 'var(--coral)', fontWeight: 800 }} />
              </div>
            ))}
          </div>
        </div>

        {/* Total + comments */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.5fr)', gap: 12, marginTop: 14 }}>
          <div className="glass" style={{ padding: '14px 16px',
            background: `linear-gradient(145deg, rgba(22,19,40,0.85), rgba(22,19,40,0.6)), radial-gradient(ellipse at 0% 0%, ${tier.color}14, transparent 60%)`,
            border: `1px solid ${tier.color}33`,
          }}>
            <div style={{ fontSize: 10, letterSpacing: '0.22em', color: 'var(--text-muted)', fontFamily: 'var(--font-label)', fontWeight: 800, marginBottom: 4 }}>
              RESULTADO TOTAL
            </div>
            <div className="num" style={{ fontSize: 36, fontWeight: 800, color: tier.color, letterSpacing: '-0.03em', filter: `drop-shadow(0 0 6px ${tier.glow})` }}>
              {accuracy.toFixed(0)}%
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-num)', fontWeight: 700, marginTop: 4 }}>
              {totals.correct} ✓ · {totals.wrong} ✗ · {totals.questions} Q
            </div>
          </div>
          <div>
            <label style={labelStyle}>Comentários</label>
            <textarea rows={3} placeholder="Dificuldades, percepções, próximos passos…"
              value={form.comments} onChange={e => setForm(f => ({ ...f, comments: e.target.value }))}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button className="btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn-neon" onClick={handleSave} style={{
            flex: 1, justifyContent: 'center', padding: '12px', fontSize: 13,
            background: 'var(--grad-primary)',
            borderColor: 'transparent', color: 'var(--on-primary)',
          }}>
            <I.check size={13} stroke={2.5} /> Salvar simulado
          </button>
        </div>
      </div>
    </div>
  );
}

window.SimuladosTab = SimuladosTab;
window.SimuladoFormModal = SimuladoFormModal;
