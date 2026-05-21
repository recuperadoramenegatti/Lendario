// SyllabusMatrix — Objetiva mode (5 cols) — editable subject weights
const FLAGS_OBJ = ['lei', 'doutrina', 'juris', 'questoes', 'revisao'];
// Labels divididos em duas linhas para evitar sobreposição
const FLAG_LABELS_OBJ = {
  lei:      { l1: 'Lei',      l2: 'Seca' },
  doutrina: { l1: 'Teoria /', l2: 'Resumos' },
  juris:    { l1: 'Juris',    l2: 'prudência' },
  questoes: { l1: 'Questões', l2: '' },
  revisao:  { l1: 'Revisão /', l2: 'Flash Cards' },
};
const FLAG_TOOLTIP_OBJ = { lei: 'Lei seca', doutrina: 'Teoria/Resumos', juris: 'Jurisprudência', questoes: 'Questões', revisao: 'Revisão/Flash Cards' };

// Weight metadata — tags + glow
const WEIGHT_INFO = {
  5: { label: 'ESSENCIAL',           cls: 'w5', color: '#B91C1C' },
  4: { label: 'MUITO IMPORTANTE',    cls: 'w4', color: '#C2410C' },
  3: { label: 'IMPORTANTE',          cls: 'w3', color: '#92400E' },
  2: { label: 'MÉDIA RELEVÂNCIA',    cls: 'w2', color: '#065F46' },
  1: { label: 'BAIXA INCIDÊNCIA',    cls: 'w1', color: '#475569' },
};

// Compute % acerto e horas estudadas por tópico a partir de shared.dailyLogs
function computeTopicMetrics(dailyLogs) {
  const map = new Map(); // key = `${disciplina}|${topic}` → { correct, wrong, hours }
  (dailyLogs || []).forEach(l => {
    const ents = (l.entries && l.entries.length > 0) ? l.entries : [l];
    ents.forEach(e => {
      if (!e.discipline || !e.topic) return;
      const k = `${e.discipline}|${e.topic}`;
      const cur = map.get(k) || { correct: 0, wrong: 0, hours: 0 };
      cur.correct += e.correct || 0;
      cur.wrong   += e.wrong   || 0;
      cur.hours   += e.hours   || 0;
      map.set(k, cur);
    });
  });
  return map;
}

function fmtTopicHours(h) {
  if (!h || h <= 0) return null;
  const m = Math.round(h * 60);
  if (m < 60) return `${m}min`;
  const hh = Math.floor(m / 60), mm = m % 60;
  return mm === 0 ? `${hh}h` : `${hh}h${String(mm).padStart(2,'0')}`;
}

function accChipClass(pct) {
  if (pct >= 80) return 'bl80';
  if (pct >= 70) return 'gr70';
  if (pct >= 60) return 'ye60';
  return 'lt50';
}

function SyllabusMatrixObjetiva({ state, setState, onMaster, onCheckXp, dailyLogs }) {
const [weightModalOpen, setWeightModalOpen] = React.useState(false);
const topicMetrics = React.useMemo(() => computeTopicMetrics(dailyLogs || []), [dailyLogs]);
const toggle = (sId, tId, flag) => {
let willMaster = false;
let xpDelta = 0;
setState(s => ({
...s,
subjects: s.subjects.map(sub => sub.id !== sId ? sub : {
...sub,
topics: sub.topics.map(t => {
if (t.id !== tId) return t;
const next = { ...t, [flag]: !t[flag] };
const nextChecks = FLAGS_OBJ.filter(f => next[f]).length;
const prevChecks = FLAGS_OBJ.filter(f => t[f]).length;
const w = Math.max(1, sub.weight || 1);          // weight-scaled XP
if (nextChecks > prevChecks) xpDelta = 1 * w;    // +1 × peso por check
if (nextChecks < prevChecks) xpDelta = -1 * w;   // -1 × peso se desmarcar
if (nextChecks === 5 && prevChecks < 5) willMaster = true;
// Atualiza lastStudiedAt sempre que houver qualquer alteração nos checks
// (necessário para o decaimento temporal do EditalHeatmap)
if (xpDelta !== 0) next.lastStudiedAt = new Date().toISOString();
return next;
}),
}),
}));
setTimeout(() => {
if (willMaster) {
// 5/5 atingido: celebração maior + som de "tópico dominado"
window.celebrateHighEnergy && window.celebrateHighEnergy();
window.playTopicMastered && window.playTopicMastered();
if (onCheckXp) onCheckXp(xpDelta);
if (onMaster) onMaster();
} else if (xpDelta > 0) {
// Check normal: confete leve + som satisfatório
window.celebrateLight && window.celebrateLight();
window.playCheckChime && window.playCheckChime();
if (onCheckXp) onCheckXp(xpDelta);
} else if (xpDelta < 0) {
if (onCheckXp) onCheckXp(xpDelta);
}
}, 0);
};

const moveSubject = (idx, dir) => setState(s => {
const arr = [...s.subjects];
const j = dir === 'up' ? idx - 1 : idx + 1;
if (j < 0 || j >= arr.length) return s;
[arr[idx], arr[j]] = [arr[j], arr[idx]];
return { ...s, subjects: arr };
});

const moveTopic = (sId, idx, dir) => setState(s => ({
...s,
subjects: s.subjects.map(sub => {
if (sub.id !== sId) return sub;
const arr = [...sub.topics];
const j = dir === 'up' ? idx - 1 : idx + 1;
if (j < 0 || j >= arr.length) return sub;
[arr[idx], arr[j]] = [arr[j], arr[idx]];
return { ...sub, topics: arr };
}),
}));

const setWeight = (sId, w) => setState(s => ({
...s, subjects: s.subjects.map(sub => sub.id === sId ? { ...sub, weight: Math.max(1, Math.min(5, w)) } : sub),
}));

const renameSubject = (sId, name) => setState(s => ({
...s, subjects: s.subjects.map(sub => sub.id === sId ? { ...sub, name } : sub),
}));

const renameTopic = (sId, tId, name) => setState(s => ({
...s, subjects: s.subjects.map(sub => sub.id !== sId ? sub : {
...sub, topics: sub.topics.map(t => t.id === tId ? { ...t, name } : t),
}),
}));

const addTopic = (sId) => setState(s => ({
...s, subjects: s.subjects.map(sub => sub.id !== sId ? sub : {
...sub, topics: [...sub.topics, { id: `t-${Date.now()}`, name: 'Novo tópico', lei: false, doutrina: false, juris: false, questoes: false, revisao: false }],
}),
}));

const removeTopic = (sId, tId) => setState(s => ({
...s, subjects: s.subjects.map(sub => sub.id !== sId ? sub : { ...sub, topics: sub.topics.filter(t => t.id !== tId) }),
}));

const addSubject = () => setState(s => ({
...s, subjects: [...s.subjects, { id: `s-${Date.now()}`, name: 'Nova disciplina', shortName: 'Nova', weight: 3, topics: [] }],
}));

const removeSubject = (sId) => setState(s => ({ ...s, subjects: s.subjects.filter(sub => sub.id !== sId) }));

const applyAutoWeights = (weightsById) => {
  setState(s => {
    const next = s.subjects.map(sub => weightsById[sub.id] != null ? { ...sub, weight: weightsById[sub.id] } : sub);
    next.sort((a, b) => (b.weight || 0) - (a.weight || 0));
    return { ...s, subjects: next };
  });
};

return (
<div style={{ display: 'grid', gap: 12 }}>
{/* Cabeçalho didático */}
<div className="glass" style={{ padding: '14px 18px', borderLeft: '3px solid var(--ciano)' }}>
  <div style={{ fontSize: 9.5, letterSpacing: '0.22em', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, marginBottom: 6 }}>
    COMO USAR A MATRIZ
  </div>
  <div style={{ fontSize: 12.5, color: 'var(--text-primary)', lineHeight: 1.5 }}>
    <div style={{ marginBottom: 5 }}>
      <strong>↑↓ Setas:</strong> Use para <strong>reordenar</strong> temas e disciplinas por <strong>incidência em prova</strong>. Os mais cobrados ficam no topo.
    </div>
    <div style={{ marginBottom: 5 }}>
      <strong>⚖️ Peso (1 a 5):</strong> Define o impacto no XP a cada check.
      <span className="weight-tag w5" style={{ marginLeft: 6 }}>5 ESSENCIAL</span>
      <span className="weight-tag w4" style={{ marginLeft: 4 }}>4 MUITO IMP.</span>
      <span className="weight-tag w3" style={{ marginLeft: 4 }}>3 IMP.</span>
      <span className="weight-tag w2" style={{ marginLeft: 4 }}>2 MÉDIA</span>
      <span className="weight-tag w1" style={{ marginLeft: 4 }}>1 BAIXA</span>
    </div>
    <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
      Não negligencie! <strong>Cada ponto conta</strong> — disciplinas de baixo peso podem virar a vaga.
    </div>
  </div>
  <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
    <button className="btn-neon" style={{ fontSize: 12 }} onClick={() => setWeightModalOpen(true)}>
      ⚖️ Calcular pesos automaticamente
    </button>
  </div>
</div>

{state.subjects.map((s, si) => {
const completion = window.DA.getSubjectCompletionObj(s);
const totalChecks = s.topics.reduce((a, t) => a + FLAGS_OBJ.filter(f => t[f]).length, 0);
return (
<SubjectCardObj key={s.id} subject={s} idx={si} total={state.subjects.length}
completion={completion} totalChecks={totalChecks} topicMetrics={topicMetrics}
onMoveSubject={moveSubject} onMoveTopic={moveTopic}
onToggle={toggle} onSetWeight={setWeight}
onRename={renameSubject} onRenameTopic={renameTopic}
onAddTopic={addTopic} onRemoveTopic={removeTopic} onRemoveSubject={removeSubject} />
);
})}
<button className="btn-neon" style={{ justifySelf: 'start' }} onClick={addSubject}>
<I.plus size={14} /> Nova disciplina
</button>

<WeightCalculatorModal
  open={weightModalOpen}
  subjects={state.subjects}
  onClose={() => setWeightModalOpen(false)}
  onApply={applyAutoWeights}
/>
</div>
);
}

function SubjectCardObj({ subject, idx, total, completion, totalChecks, topicMetrics, onMoveSubject, onMoveTopic, onToggle, onSetWeight, onRename, onRenameTopic, onAddTopic, onRemoveTopic, onRemoveSubject }) {
const [open, setOpen] = React.useState(idx < 2);
const [hover, setHover] = React.useState(false);

return (
<div className="glass" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
style={{ padding: 0, overflow: 'hidden' }}>
<div style={{ padding: '14px 18px', cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>
<div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
<div style={{
display: 'flex', flexDirection: 'column', gap: 2,
opacity: hover ? 1 : 0.15, transition: 'opacity 150ms',
}}>
<button className="btn-ghost" style={{ padding: 2 }} disabled={idx === 0}
onClick={e => { e.stopPropagation(); onMoveSubject(idx, 'up'); }}><I.up size={11} /></button>
<button className="btn-ghost" style={{ padding: 2 }} disabled={idx === total - 1}
onClick={e => { e.stopPropagation(); onMoveSubject(idx, 'down'); }}><I.down size={11} /></button>
</div>

      <div style={{ position: 'relative', width: 40, height: 40, flexShrink: 0 }}>
        <svg viewBox="0 0 40 40" width={40} height={40}>
          <circle cx="20" cy="20" r="17" fill="none" stroke="rgba(12,13,18,0.06)" strokeWidth="3" />
          <circle cx="20" cy="20" r="17" fill="none"
            stroke={completion === 100 ? 'var(--esmeralda)' : '#00b8d4'} strokeWidth="3"
            strokeDasharray={`${(completion / 100) * 107} 107`} strokeLinecap="round" transform="rotate(-90 20 20)" />
        </svg>
        <div className="num" style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 700, color: completion === 100 ? 'var(--esmeralda)' : '#006e80' }}>
          {Math.round(completion)}
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <input className="inline-edit font-display" style={{ fontSize: 16, fontWeight: 600 }}
            value={subject.name} onClick={e => e.stopPropagation()}
            onChange={e => onRename(subject.id, e.target.value)} />
          <WeightControl weight={subject.weight} onChange={(w) => onSetWeight(subject.id, w)} />
          {WEIGHT_INFO[subject.weight] && (
            <span className={`weight-tag ${WEIGHT_INFO[subject.weight].cls}`} title="Importância da disciplina">
              {WEIGHT_INFO[subject.weight].label}
            </span>
          )}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
          {subject.topics.length} tópicos · <span className="num">{totalChecks}/{subject.topics.length * 5}</span> checks
        </div>
      </div>
      <button className="btn-ghost" onClick={e => { e.stopPropagation(); onRemoveSubject(subject.id); }} style={{ padding: 4, opacity: hover ? 0.6 : 0 }}><I.close size={12} /></button>
      <div className="btn-ghost" style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 150ms' }}>
        <I.chevronR size={14} />
      </div>
    </div>
    <div style={{ marginTop: 12, height: 4, background: 'rgba(12,13,18,0.06)', borderRadius: 3, overflow: 'hidden' }}>
      <div className="gradient-bar-green-cyan" style={{ height: '100%', width: `${completion}%`, transition: 'width 500ms ease' }} />
    </div>
  </div>

  {open && (
    <div style={{ padding: '4px 18px 14px', borderTop: '1px solid rgba(12,13,18,0.04)' }}>
      <div className="topic-row-obj header-row" style={{ padding: '10px 0', borderBottom: '1px solid rgba(12,13,18,0.04)' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>TÓPICO</div>
        {FLAGS_OBJ.map(f => (
          <div key={f} style={{ fontSize: 10, letterSpacing: '0.04em', color: 'var(--text-dim)', textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, lineHeight: 1.15 }}>
            <div>{FLAG_LABELS_OBJ[f].l1}</div>
            {FLAG_LABELS_OBJ[f].l2 && <div>{FLAG_LABELS_OBJ[f].l2}</div>}
          </div>
        ))}
        <div style={{ fontSize: 10, letterSpacing: '0.04em', color: 'var(--text-dim)', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, lineHeight: 1.15 }}>
          <div>% acerto</div><div>· tempo</div>
        </div>
      </div>
      {subject.topics.map((t, ti) => {
        const checks = FLAGS_OBJ.filter(f => t[f]).length;
        const metrics = (topicMetrics && topicMetrics.get(`${subject.name}|${t.name}`)) || null;
        return (
          <TopicRowObj key={t.id} topic={t} idx={ti} total={subject.topics.length} checks={checks} metrics={metrics}
            onMove={(dir) => onMoveTopic(subject.id, ti, dir)}
            onToggle={(flag) => onToggle(subject.id, t.id, flag)}
            onRename={(name) => onRenameTopic(subject.id, t.id, name)}
            onRemove={() => onRemoveTopic(subject.id, t.id)} />
        );
      })}
      <button className="btn-ghost" style={{ marginTop: 8 }} onClick={() => onAddTopic(subject.id)}>
        <I.plus size={11} stroke={2.5} /> Adicionar tópico
      </button>
    </div>
  )}

  <style>{`
    .topic-row-obj { display: grid; grid-template-columns: 1fr repeat(5, 40px) 88px; gap: 10px; align-items: center; }
    @media (min-width: 640px) { .topic-row-obj { grid-template-columns: 1fr repeat(5, 56px) 100px; gap: 16px; } }
  `}</style>
</div>

);
}

function WeightControl({ weight, onChange }) {
const [open, setOpen] = React.useState(false);
return (
<div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
<button className="num"
onClick={() => setOpen(o => !o)}
style={{
fontSize: 10, padding: '3px 8px', borderRadius: 4,
background: 'rgba(91,71,184,0.1)', color: '#5a1fa0',
letterSpacing: '0.08em', border: '1px solid rgba(91,71,184,0.3)',
fontWeight: 700, cursor: 'pointer',
}}>
PESO {weight}
</button>
{open && (
<div className="glass-strong" style={{
position: 'absolute', top: '100%', left: 0, marginTop: 4, padding: 4, borderRadius: 8,
display: 'flex', gap: 2, zIndex: 5,
}}>
{[1,2,3,4,5].map(w => (
<button key={w} className="num"
onClick={() => { onChange(w); setOpen(false); }}
style={{
width: 26, height: 26, borderRadius: 4, border: 'none', cursor: 'pointer',
background: w === weight ? 'rgba(91,71,184,0.2)' : 'transparent',
color: w === weight ? '#5a1fa0' : 'var(--text-muted)',
fontWeight: 700, fontSize: 12,
}}>
{w}
</button>
))}
</div>
)}
</div>
);
}

function TopicRowObj({ topic, idx, total, checks, metrics, onMove, onToggle, onRename, onRemove }) {
const [hover, setHover] = React.useState(false);
const complete = checks === 5;
const totalQ = (metrics?.correct || 0) + (metrics?.wrong || 0);
const accPct = totalQ > 0 ? (metrics.correct / totalQ) * 100 : null;
const accCls = accPct !== null ? accChipClass(accPct) : null;
const hoursStr = fmtTopicHours(metrics?.hours);
return (
<div className="topic-row-obj" style={{ padding: '6px 0' }}
onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
<div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
<div style={{ display: 'flex', flexDirection: 'column', gap: 0, opacity: hover ? 1 : 0.1, transition: 'opacity 150ms' }}>
<button className="btn-ghost" style={{ padding: 1 }} onClick={() => onMove('up')} disabled={idx === 0}><I.up size={9} /></button>
<button className="btn-ghost" style={{ padding: 1 }} onClick={() => onMove('down')} disabled={idx === total - 1}><I.down size={9} /></button>
</div>
<input className="inline-edit" value={topic.name} onChange={e => onRename(e.target.value)}
style={{ fontSize: 13, color: complete ? 'var(--esmeralda)' : 'var(--text-primary)', flex: 1, minWidth: 0 }} />
<button className="btn-ghost" onClick={onRemove} style={{ padding: 2, opacity: hover ? 0.4 : 0 }}><I.close size={10} /></button>
</div>
{FLAGS_OBJ.map(f => (
<div key={f} style={{ display: 'grid', placeItems: 'center' }}>
<button className={`check-cell ${topic[f] ? 'active' : ''}`} onClick={() => onToggle(f)} title={FLAG_TOOLTIP_OBJ[f]}>
{topic[f] && <I.check size={14} stroke={2.5} />}
</button>
</div>
))}
<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, minWidth: 0 }}>
  {accPct !== null
    ? <span className={`acc-chip ${accCls}`} title={`${metrics.correct} acertos / ${totalQ} questões`}>{accPct.toFixed(0)}%</span>
    : <span style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>—</span>
  }
  {hoursStr && (
    <span className="num" style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700 }}>⏱ {hoursStr}</span>
  )}
</div>
</div>
);
}

// ─────────────────────────────────────────────────────────
// Weight Calculator Modal
// Score = (qtdNorm * 0.5) + (dificuldadeNorm * 0.3) + (extensaoNorm * 0.2)
// onde *Norm é normalizado em [0,1] e o peso final é arredondado para 1..5.
// ─────────────────────────────────────────────────────────
function WeightCalculatorModal({ open, subjects, onClose, onApply }) {
  const [form, setForm] = React.useState({});

  React.useEffect(() => {
    if (!open) return;
    const initial = {};
    subjects.forEach(s => {
      initial[s.id] = {
        questoes: s.priorityHints?.questoes ?? 10,
        dificuldade: s.priorityHints?.dificuldade ?? 3,
        extensao: s.priorityHints?.extensao ?? 3,
        manual: null, // peso manual sobreescreve o calculado
      };
    });
    setForm(initial);
  }, [open]);

  if (!open) return null;

  const maxQ = Math.max(1, ...Object.values(form).map(v => v?.questoes || 0));

  const computeWeight = (v) => {
    if (v.manual != null) return v.manual;
    const qN = (v.questoes || 0) / maxQ;
    const dN = ((v.dificuldade || 1) - 1) / 4; // 1..5 → 0..1
    const eN = ((v.extensao || 1) - 1) / 4;
    const score = qN * 0.5 + dN * 0.3 + eN * 0.2;
    // map score 0..1 → 1..5 (rounded)
    return Math.max(1, Math.min(5, Math.round(score * 4 + 1)));
  };

  const setField = (sid, key, val) => setForm(f => ({ ...f, [sid]: { ...f[sid], [key]: val, manual: key === 'manual' ? val : f[sid].manual } }));

  const orderedPreview = subjects
    .map(s => ({ ...s, _w: computeWeight(form[s.id] || { questoes: 0, dificuldade: 1, extensao: 1 }) }))
    .sort((a, b) => b._w - a._w);

  const handleApply = () => {
    const out = {};
    subjects.forEach(s => { out[s.id] = computeWeight(form[s.id] || { questoes: 0, dificuldade: 1, extensao: 1 }); });
    onApply(out);
    onClose();
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 95,
      background: 'rgba(30,32,48,0.55)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: 20, overflowY: 'auto',
    }}>
      <div onClick={e => e.stopPropagation()} className="glass-strong" style={{
        width: '100%', maxWidth: 860, padding: 24, borderRadius: 18, position: 'relative',
        margin: 'auto 0',
      }}>
        <button onClick={onClose} className="btn-ghost" style={{ position: 'absolute', top: 12, right: 12 }}>
          <I.close size={13} />
        </button>
        <div style={{ fontSize: 9.5, letterSpacing: '0.22em', color: 'var(--tinta)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800 }}>
          CALCULADORA DE PESO
        </div>
        <div className="font-display gradient-neon" style={{ fontSize: 22, fontWeight: 700, marginTop: 4, marginBottom: 4 }}>
          Pesos inteligentes para o seu edital ⚖️
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
          Informe os dados de cada disciplina. O sistema calcula automaticamente o peso (1–5) e <strong>reorganiza a matriz</strong> em ordem de relevância. Você pode ajustar manualmente.
        </div>

        {/* Cabeçalho da tabela */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.6fr repeat(3, minmax(90px, 1fr)) 80px 1fr',
          gap: 8,
          alignItems: 'end',
          padding: '0 8px 8px',
          borderBottom: '2px solid rgba(30,32,48,0.08)',
          marginBottom: 4,
        }}>
          <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-dim)' }}>
            DISCIPLINA
          </div>
          {[
            { label: 'Quantidade de Questões', hint: 'peso 0,5', icon: '📝' },
            { label: 'Dificuldade', hint: '1 = fácil · 5 = muito difícil', icon: '🔥' },
            { label: 'Extensão', hint: '1 = curta · 5 = muito extensa', icon: '📚' },
          ].map(({ label, hint, icon }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                {icon} {label}
              </div>
              <div style={{ fontSize: 9.5, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                {hint}
              </div>
            </div>
          ))}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>⚖️ Peso</div>
            <div style={{ fontSize: 9.5, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>manual</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>Resultado</div>
            <div style={{ fontSize: 9.5, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>calculado</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: '48vh', overflowY: 'auto', paddingRight: 2 }}>
          {subjects.map((s, si) => {
            const v = form[s.id] || { questoes: 0, dificuldade: 3, extensao: 3 };
            const w = computeWeight(v);
            const info = WEIGHT_INFO[w];
            const isManual = v.manual != null;
            return (
              <div key={s.id} style={{
                display: 'grid',
                gridTemplateColumns: '1.6fr repeat(3, minmax(90px, 1fr)) 80px 1fr',
                gap: 8,
                alignItems: 'center',
                padding: '8px 8px',
                borderRadius: 8,
                background: si % 2 === 0 ? 'rgba(30,32,48,0.025)' : 'transparent',
                transition: 'background 150ms',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,184,212,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = si % 2 === 0 ? 'rgba(30,32,48,0.025)' : 'transparent'}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={s.name}>
                  {s.name}
                </div>

                {/* Quantidade de Questões */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <input type="number" min={0} value={v.questoes}
                    onChange={e => setField(s.id, 'questoes', Math.max(0, parseInt(e.target.value) || 0))}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      padding: '7px 10px', borderRadius: 8, border: '1.5px solid rgba(0,184,212,0.25)',
                      background: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 700,
                      color: 'var(--grafite)', textAlign: 'center', outline: 'none',
                      fontFamily: 'JetBrains Mono, monospace',
                      transition: 'border-color 150ms',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--ciano)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(0,184,212,0.25)'}
                  />
                </div>

                {/* Dificuldade */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <input type="number" min={1} max={5} value={v.dificuldade}
                    onChange={e => setField(s.id, 'dificuldade', Math.max(1, Math.min(5, parseInt(e.target.value) || 1)))}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      padding: '7px 10px', borderRadius: 8, border: '1.5px solid rgba(249,115,22,0.25)',
                      background: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 700,
                      color: 'var(--grafite)', textAlign: 'center', outline: 'none',
                      fontFamily: 'JetBrains Mono, monospace',
                      transition: 'border-color 150ms',
                    }}
                    onFocus={e => e.target.style.borderColor = '#F97316'}
                    onBlur={e => e.target.style.borderColor = 'rgba(249,115,22,0.25)'}
                  />
                  <div style={{ fontSize: 9, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace' }}>
                    {'★'.repeat(v.dificuldade)}{'☆'.repeat(5 - v.dificuldade)}
                  </div>
                </div>

                {/* Extensão */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <input type="number" min={1} max={5} value={v.extensao}
                    onChange={e => setField(s.id, 'extensao', Math.max(1, Math.min(5, parseInt(e.target.value) || 1)))}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      padding: '7px 10px', borderRadius: 8, border: '1.5px solid rgba(91,71,184,0.25)',
                      background: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 700,
                      color: 'var(--grafite)', textAlign: 'center', outline: 'none',
                      fontFamily: 'JetBrains Mono, monospace',
                      transition: 'border-color 150ms',
                    }}
                    onFocus={e => e.target.style.borderColor = '#5B47B8'}
                    onBlur={e => e.target.style.borderColor = 'rgba(91,71,184,0.25)'}
                  />
                  <div style={{ fontSize: 9, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace' }}>
                    {'▓'.repeat(v.extensao)}{'░'.repeat(5 - v.extensao)}
                  </div>
                </div>

                {/* Peso manual */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <select value={v.manual ?? ''}
                    onChange={e => setField(s.id, 'manual', e.target.value === '' ? null : parseInt(e.target.value))}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      padding: '7px 6px', borderRadius: 8,
                      border: `1.5px solid ${isManual ? `${info.color}55` : 'rgba(30,32,48,0.15)'}`,
                      background: isManual ? `${info.color}10` : 'rgba(255,255,255,0.8)',
                      fontSize: 13, fontWeight: 800, color: isManual ? info.color : 'var(--text-muted)',
                      textAlign: 'center', outline: 'none', cursor: 'pointer',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}>
                    <option value="">auto</option>
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>

                {/* Tag do peso calculado */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '5px 10px', borderRadius: 8,
                    background: `${info.color}14`,
                    border: `1px solid ${info.color}44`,
                    color: info.color, fontWeight: 800, fontSize: 11,
                    fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.04em',
                    whiteSpace: 'nowrap',
                  }}>
                    <strong style={{ fontSize: 14 }}>{w}</strong>
                    <span style={{ fontSize: 9, opacity: 0.8 }}>{info.label}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 10, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.30)', fontSize: 12, color: '#92400E', fontWeight: 600 }}>
          ⚠️ <strong>Não negligencie! Cada ponto conta.</strong> Disciplinas de baixo peso ainda decidem aprovações.
        </div>

        <div style={{ marginTop: 12, fontSize: 10, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, letterSpacing: '0.06em' }}>
          PRÉVIA DA NOVA ORDEM (DECRESCENTE)
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
          {orderedPreview.slice(0, 10).map((s, i) => (
            <div key={s.id} style={{ padding: '3px 9px', borderRadius: 99, background: 'rgba(30,32,48,0.04)', border: '1px solid rgba(30,32,48,0.08)', fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>
              {i+1}. {s.name} <span style={{ color: WEIGHT_INFO[s._w].color, fontWeight: 800 }}>[P{s._w}]</span>
            </div>
          ))}
          {orderedPreview.length > 10 && (
            <span style={{ fontSize: 11, color: 'var(--text-dim)', alignSelf: 'center' }}>+{orderedPreview.length - 10}</span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button className="btn-ghost" onClick={onClose} style={{ flex: '0 0 auto' }}>Cancelar</button>
          <button className="btn-neon" onClick={handleApply} style={{ flex: 1, justifyContent: 'center', fontSize: 13, background: 'linear-gradient(135deg, var(--petroleo), var(--ciano))', color: 'white', borderColor: 'transparent' }}>
            ⚖️ Aplicar pesos e reorganizar
          </button>
        </div>
      </div>
    </div>
  );
}

window.SyllabusMatrixObjetiva = SyllabusMatrixObjetiva;
window.WeightCalculatorModal = WeightCalculatorModal;