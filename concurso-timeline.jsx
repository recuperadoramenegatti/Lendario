// ConcursoTimeline — upcoming DP exams
function ConcursoTimeline({ concursos, onAddConcurso }) {
return (
<div style={{ overflowX: 'auto', paddingBottom: 4 }}>
<div style={{ display: 'flex', gap: 14, minWidth: 'min-content' }}>
{concursos.map(c => {
const days = window.DA.daysUntil(c.date);
const urgent = days !== null && days < 30 && days >= 0;
const soon = days !== null && days < 90 && days >= 30;
return (
<div key={c.id}
className={`glass ${urgent ? 'pulse-amber' : ''}`}
style={{ padding: '14px 18px', minWidth: 240, flexShrink: 0 }}>
<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
<div style={{ fontSize: 11, letterSpacing: '0.15em', color: 'var(--text-dim)', fontFamily: 'var(--font-label)' }}>
CONCURSO
</div>
{urgent && (
<div style={{ fontSize: 10, color: 'var(--neon-gold)', fontWeight: 600, letterSpacing: '0.1em' }}>
PRÓXIMO
</div>
)}
</div>
<div className="font-display" style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>{c.name}</div>
{c.date ? (
<>
<div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
<span className="num" style={{ fontSize: 28, fontWeight: 700, color: urgent ? 'var(--neon-gold)' : soon ? 'var(--neon-cyan)' : 'var(--text-primary)' }}>
{days}
</span>
<span style={{ fontSize: 12, color: 'var(--text-muted)' }}>dias</span>
<span style={{ fontSize: 11, color: 'var(--text-dim)', marginLeft: 'auto', fontFamily: 'var(--font-num)' }}>
{new Date(c.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
</span>
</div>
{/* Study progress vs target */}
<div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
<div className="gradient-bar-green-cyan" style={{ height: '100%', width: `${Math.min(100, Math.max(0, 100 - (days || 0) / 2))}%` }} />
</div>
<div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-num)' }}>
<span>Preparação</span>
<span>{Math.round(Math.min(100, Math.max(0, 100 - (days || 0) / 2)))}%</span>
</div>
</>
) : (
<button className="btn-ghost" style={{ marginTop: 8 }}>
<I.calendar size={12} /> Definir data
</button>
)}
</div>
);
})}
<button onClick={onAddConcurso} className="glass" style={{
minWidth: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
gap: 6, color: 'var(--text-muted)', cursor: 'pointer', border: '1px dashed rgba(255,255,255,0.12)',
background: 'transparent',
}}>
<I.plus size={20} />
<span style={{ fontSize: 12 }}>Novo concurso</span>
</button>
</div>
</div>
);
}

window.ConcursoTimeline = ConcursoTimeline;