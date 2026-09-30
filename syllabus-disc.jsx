// SyllabusMatrix — Discursiva mode (3 cols + simulados + line chart)
const FLAGS_DISC = ['estudado', 'grifado', 'questoes'];
const FLAG_LABELS_DISC = { estudado: 'Estudado', grifado: 'Grifado', questoes: 'Questões' };

function SyllabusMatrixDiscursiva({ state, setState, onCheckXp }) {
const toggle = (sId, tId, flag) => {
let xpDelta = 0;
let willMaster = false;
setState(s => ({
...s,
subjects: s.subjects.map(sub => sub.id !== sId ? sub : {
...sub,
topics: sub.topics.map(t => {
if (t.id !== tId) return t;
const next = { ...t, [flag]: !t[flag] };
const nextChecks = FLAGS_DISC.filter(f => next[f]).length;
const prevChecks = FLAGS_DISC.filter(f => t[f]).length;
const w = Math.max(1, sub.weight || 1);          // weight-scaled XP
if (nextChecks > prevChecks) xpDelta = 1 * w;
if (nextChecks < prevChecks) xpDelta = -1 * w;
if (nextChecks === 3 && prevChecks < 3) willMaster = true;
if (xpDelta !== 0) next.lastStudiedAt = new Date().toISOString();
return next;
}),
}),
}));
setTimeout(() => {
if (willMaster) {
window.celebrateHighEnergy && window.celebrateHighEnergy();
window.playTopicMastered && window.playTopicMastered();
if (onCheckXp) onCheckXp(xpDelta);
} else if (xpDelta > 0) {
window.celebrateLight && window.celebrateLight();
window.playCheckChime && window.playCheckChime();
if (onCheckXp) onCheckXp(xpDelta);
} else if (xpDelta < 0) {
if (onCheckXp) onCheckXp(xpDelta);
}
}, 0);
};

const renameSubject = (sId, name) => setState(s => ({
...s, subjects: s.subjects.map(sub => sub.id === sId ? { ...sub, name } : sub),
}));
const setWeight = (sId, w) => setState(s => ({
...s, subjects: s.subjects.map(sub => sub.id === sId ? { ...sub, weight: Math.max(1, Math.min(5, w)) } : sub),
}));
const renameTopic = (sId, tId, name) => setState(s => ({
...s, subjects: s.subjects.map(sub => sub.id !== sId ? sub : {
...sub, topics: sub.topics.map(t => t.id === tId ? { ...t, name } : t),
}),
}));
const addTopic = (sId) => setState(s => ({
...s, subjects: s.subjects.map(sub => sub.id !== sId ? sub : {
...sub, topics: [...sub.topics, { id: `td-${Date.now()}`, name: 'Novo tema', estudado: false, grifado: false, questoes: false }],
}),
}));
const removeTopic = (sId, tId) => setState(s => ({
...s, subjects: s.subjects.map(sub => sub.id !== sId ? sub : { ...sub, topics: sub.topics.filter(t => t.id !== tId) }),
}));
const addSubject = () => setState(s => ({
...s, subjects: [...s.subjects, {
id: `sd-${Date.now()}`, name: 'Nova disciplina', weight: 3, topics: [],
}],
}));
const removeSubject = (sId) => setState(s => ({ ...s, subjects: s.subjects.filter(sub => sub.id !== sId) }));

if (state.subjects.length === 0) {
return (
<div className="glass" style={{ padding: 48, textAlign: 'center' }}>
<div style={{ fontSize: 64, marginBottom: 16 }}><Glyph e="✍️" /></div>
<div className="font-display" style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
Modo <span style={{ background: 'linear-gradient(90deg, var(--ambar), var(--coral))', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>Discursiva</span>
</div>
<div style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 480, margin: '0 auto 20px' }}>
Sua jornada na fase discursiva começa aqui. Adicione as disciplinas e os temas que você quer dominar — registre simulados e acompanhe sua evolução.
</div>
<button className="btn-neon" onClick={addSubject} style={{
background: 'linear-gradient(135deg, rgba(255,122,26,0.12), rgba(255,122,138,0.12))',
borderColor: 'rgba(255,122,138,0.4)', color: '#EEA3BA',
}}>
<I.plus size={14} /> Adicionar primeira disciplina
</button>
</div>
);
}

return (
<div style={{ display: 'grid', gap: 14 }}>
{state.subjects.map((s, si) => (
<SubjectCardDisc key={s.id} subject={s} idx={si}
onToggle={toggle} onRename={renameSubject} onSetWeight={setWeight}
onRenameTopic={renameTopic} onAddTopic={addTopic} onRemoveTopic={removeTopic}
onRemoveSubject={removeSubject} />
))}
<button className="btn-neon" style={{
justifySelf: 'start',
background: 'linear-gradient(135deg, rgba(255,122,26,0.12), rgba(255,122,138,0.12))',
borderColor: 'rgba(255,122,138,0.4)', color: '#EEA3BA',
}} onClick={addSubject}>
<I.plus size={14} /> Nova disciplina
</button>
</div>
);
}

function SubjectCardDisc({ subject, onToggle, onRename, onSetWeight, onRenameTopic, onAddTopic, onRemoveTopic, onRemoveSubject }) {
const [open, setOpen] = React.useState(true);
const completion = window.DA.getSubjectCompletionDisc(subject);

return (
<div className="glass" style={{ overflow: 'hidden' }}>
<div style={{ padding: '14px 18px', cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>
<div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
<div style={{ position: 'relative', width: 40, height: 40, flexShrink: 0 }}>
<svg viewBox="0 0 40 40" width={40} height={40}>
<circle cx="20" cy="20" r="17" fill="none" stroke="rgba(243,235,221,0.06)" strokeWidth="3" />
<circle cx="20" cy="20" r="17" fill="none" stroke="var(--ambar)" strokeWidth="3"
strokeDasharray={`${(completion / 100) * 107} 107`} strokeLinecap="round" transform="rotate(-90 20 20)"
style={{ filter: 'drop-shadow(0 0 4px rgba(255,122,26,0.5))' }} />
</svg>
<div className="num" style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 700, color: '#EEBB8F' }}>
{Math.round(completion)}
</div>
</div>
<div style={{ flex: 1, minWidth: 0 }}>
<div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
<input className="inline-edit font-display" style={{ fontSize: 16, fontWeight: 600 }}
value={subject.name} onClick={e => e.stopPropagation()}
onChange={e => onRename(subject.id, e.target.value)} />
<WeightControl weight={subject.weight} onChange={(w) => onSetWeight(subject.id, w)} />
</div>
<div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, display: 'flex', gap: 12 }}>
<span>{subject.topics.length} temas</span>
</div>
</div>
<button className="btn-ghost" onClick={e => { e.stopPropagation(); onRemoveSubject(subject.id); }} style={{ padding: 4 }}><I.close size={12} /></button>
<div className="btn-ghost" style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 150ms' }}>
<I.chevronR size={14} />
</div>
</div>
</div>

  {open && (
    <div style={{ borderTop: '1px solid rgba(243,235,221,0.04)' }}>
      {(
        <div style={{ padding: '6px 18px 14px' }}>
          <div className="topic-row-disc header-row" style={{ padding: '10px 0', borderBottom: '1px solid rgba(243,235,221,0.04)' }}>
            <div style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-dim)', fontFamily: 'var(--font-label)', fontWeight: 600 }}>TEMA</div>
            {FLAGS_DISC.map(f => (
              <div key={f} style={{ fontSize: 10, letterSpacing: '0.08em', color: 'var(--text-dim)', textAlign: 'center', fontFamily: 'var(--font-label)', fontWeight: 600 }}>
                {FLAG_LABELS_DISC[f]}
              </div>
            ))}
          </div>
          {subject.topics.map((t, ti) => {
            const checks = FLAGS_DISC.filter(f => t[f]).length;
            const complete = checks === 3;
            return (
              <div key={t.id} className="topic-row-disc" style={{ padding: '6px 0', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <span className="num" style={{ fontSize: 10, color: 'var(--text-dim)', minWidth: 22 }}>{String(ti+1).padStart(2,'0')}</span>
                  <input className="inline-edit" value={t.name}
                    onChange={e => onRenameTopic(subject.id, t.id, e.target.value)}
                    style={{ fontSize: 13, color: complete ? '#00c46a' : 'var(--text-primary)', flex: 1, minWidth: 0 }} />
                  <button className="btn-ghost" onClick={() => onRemoveTopic(subject.id, t.id)} style={{ padding: 2 }}><I.close size={10} /></button>
                </div>
                {FLAGS_DISC.map((f, fi) => {
                  const variant = ['', 'active-violet', 'active-pink'][fi];
                  return (
                    <div key={f} style={{ display: 'grid', placeItems: 'center' }}>
                      <button className={`check-cell ${t[f] ? (variant || 'active') : ''}`}
                        onClick={() => onToggle(subject.id, t.id, f)} title={FLAG_LABELS_DISC[f]}>
                        {t[f] && <I.check size={14} stroke={2.5} />}
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })}
          <button className="btn-ghost" style={{ marginTop: 8 }} onClick={() => onAddTopic(subject.id)}>
            <I.plus size={11} stroke={2.5} /> Adicionar tema
          </button>
          <style>{`
            .topic-row-disc { display: grid; grid-template-columns: 1fr repeat(3, 56px); gap: 12px; align-items: center; }
          `}</style>
        </div>
      )}

    </div>
  )}
</div>

);
}

function SimuladosPanel({ sims, onAdd, onRemove }) {
const [date, setDate] = React.useState(new Date().toISOString().slice(0,10));
const [score, setScore] = React.useState(50);
const [note, setNote] = React.useState('');

const submit = () => {
if (!date) return;
onAdd({ date, score: Number(score), note });
setNote('');
window.celebrateHighEnergy();
};

const sorted = [...sims].sort((a, b) => a.date.localeCompare(b.date));

return (
<div style={{ padding: '14px 18px' }}>
{/* Add form */}
<div className="glass" style={{ padding: 12, marginBottom: 14, background: 'rgba(255,122,26,0.04)', borderColor: 'rgba(255,122,26,0.2)' }}>
<div style={{ fontSize: 10, letterSpacing: '0.2em', color: '#EEBB8F', fontFamily: 'var(--font-label)', marginBottom: 8, fontWeight: 600 }}>
REGISTRAR SIMULADO
</div>
<div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'auto 1fr auto', alignItems: 'end' }}>
<div>
<div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 3 }}>Data</div>
<input className="input-base" type="date" value={date} onChange={e => setDate(e.target.value)} />
</div>
<div>
<div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 3 }}>Acerto</div>
<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
<input type="range" min="0" max="100" value={score} onChange={e => setScore(e.target.value)}
style={{ flex: 1, accentColor: 'var(--ambar)' }} />
<span className="num" style={{ minWidth: 44, fontWeight: 700, color: 'var(--ambar)' }}>{score}%</span>
</div>
</div>
<button className="btn-neon" onClick={submit}
style={{ background: 'linear-gradient(135deg, var(--ambar), var(--coral))', borderColor: 'transparent', color: '#FFFFFF' }}>
<I.plus size={12} /> Salvar
</button>
</div>
</div>

  {/* Line chart */}
  {sorted.length > 0 ? (
    <SimuladosChart sims={sorted} />
  ) : (
    <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 13 }}>
      Nenhum simulado registrado ainda.
    </div>
  )}

  {/* List */}
  {sorted.length > 0 && (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-dim)', fontFamily: 'var(--font-label)', marginBottom: 8, fontWeight: 600 }}>
        HISTÓRICO ({sims.length})
      </div>
      <div style={{ display: 'grid', gap: 4, maxHeight: 180, overflowY: 'auto' }}>
        {[...sims].reverse().map((s, i) => {
          const realIdx = sims.length - 1 - i;
          const color = s.score >= 70 ? '#00c46a' : s.score >= 50 ? '#FFB057' : 'var(--coral)';
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px',
              background: 'rgba(243,235,221,0.02)', borderRadius: 6,
            }}>
              <div className="num" style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 80 }}>
                {new Date(s.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' })}
              </div>
              <div style={{ flex: 1, height: 6, background: 'rgba(243,235,221,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${s.score}%`, background: color }} />
              </div>
              <div className="num" style={{ fontSize: 13, fontWeight: 700, color, minWidth: 44, textAlign: 'right' }}>{s.score}%</div>
              <button className="btn-ghost" onClick={() => onRemove(realIdx)} style={{ padding: 2 }}><I.close size={10} /></button>
            </div>
          );
        })}
      </div>
    </div>
  )}
</div>

);
}

function SimuladosChart({ sims }) {
const W = 600, H = 180, P = 28;
const min = 0, max = 100;
const xs = sims.map((s, i) => P + (i / Math.max(1, sims.length - 1)) * (W - 2*P));
const ys = sims.map(s => H - P - ((s.score - min) / (max - min)) * (H - 2*P));
const path = sims.map((_, i) => `${i === 0 ? 'M' : 'L'} ${xs[i]} ${ys[i]}`).join(' ');
const area = `${path} L ${xs[xs.length-1]} ${H-P} L ${xs[0]} ${H-P} Z`;

return (
<div className="glass" style={{ padding: 12 }}>
<div style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--text-dim)', fontFamily: 'var(--font-label)', marginBottom: 8, fontWeight: 600 }}>
EVOLUÇÃO DOS SIMULADOS
</div>
<svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
<defs>
<linearGradient id="sim-area" x1="0" x2="0" y1="0" y2="1">
<stop offset="0%" stopColor="var(--ambar)" stopOpacity="0.4" />
<stop offset="100%" stopColor="var(--coral)" stopOpacity="0.02" />
</linearGradient>
<linearGradient id="sim-line" x1="0" x2="1" y1="0" y2="0">
<stop offset="0%" stopColor="var(--ambar)" />
<stop offset="100%" stopColor="var(--coral)" />
</linearGradient>
</defs>
{/* Y grid */}
{[0, 25, 50, 75, 100].map(v => {
const y = H - P - ((v - min) / (max - min)) * (H - 2*P);
return (
<g key={v}>
<line x1={P} y1={y} x2={W-P} y2={y} stroke="rgba(243,235,221,0.06)" strokeDasharray="2 4" />
<text x={P-6} y={y+3} textAnchor="end" fontSize="9" fill="rgba(12,13,18,0.4)" fontFamily="Manrope, sans-serif">{v}</text>
</g>
);
})}
{/* Area */}
{sims.length > 1 && <path d={area} fill="url(#sim-area)" />}
{/* Line */}
<path d={path} fill="none" stroke="url(#sim-line)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
{/* Dots */}
{sims.map((s, i) => (
<g key={i}>
<circle cx={xs[i]} cy={ys[i]} r="5" fill="white" stroke="var(--coral)" strokeWidth="2" />
<text x={xs[i]} y={ys[i] - 10} textAnchor="middle" fontSize="10" fontWeight="700" fill="#a82360" fontFamily="Manrope, sans-serif">{s.score}</text>
</g>
))}
{/* X labels */}
{sims.map((s, i) => (sims.length <= 8 || i % Math.ceil(sims.length / 6) === 0) && (
<text key={i} x={xs[i]} y={H - 8} textAnchor="middle" fontSize="9" fill="rgba(12,13,18,0.4)" fontFamily="Manrope, sans-serif">
{new Date(s.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
</text>
))}
</svg>
</div>
);
}

window.SyllabusMatrixDiscursiva = SyllabusMatrixDiscursiva;