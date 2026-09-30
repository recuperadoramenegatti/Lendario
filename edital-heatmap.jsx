// EditalHeatmap — derivado dos checkboxes da Matriz do Edital.
// - Cores escalonam SEM violeta:
//   Objetiva (6 níveis): 0=vermelho, 1=laranja, 2=amarelo, 3=verde, 4=verde-azulado, 5=azul (top)
//   Discursiva (4 níveis): 0=vermelho, 1=laranja, 2=verde, 3=azul (top)
// - Tópicos dentro de cada disciplina são ordenados por dominância (mais checks primeiro)
// - Decaimento temporal: tópicos sem atividade há > REVIEW_DAYS dias pulsam pedindo revisão
// - Estado é DERIVADO dos flags do tópico — não é mais clicável

const REVIEW_DAYS = 30;

// Paleta Objetiva (6 níveis: 0..5 checks)
const PALETTE_OBJ = [
{ bg: 'rgba(255,61,80,0.13)',  border: 'rgba(255,61,80,0.50)',  text: '#9a1727', label: 'Não estudei' },     // 0 — vermelho
{ bg: 'rgba(255,122,26,0.15)', border: 'rgba(255,122,26,0.55)', text: '#a14e0c', label: 'Iniciado' },         // 1 — laranja
{ bg: 'rgba(245,200,11,0.20)', border: 'rgba(245,180,11,0.65)', text: '#7a5d00', label: 'Em construção' },    // 2 — amarelo
{ bg: 'rgba(0,196,106,0.18)',  border: 'rgba(0,196,106,0.60)',  text: '#005a30', label: 'Bom domínio' },      // 3 — verde
{ bg: 'rgba(0,200,170,0.18)',  border: 'rgba(0,184,180,0.60)',  text: '#005a55', label: 'Quase lá' },          // 4 — verde-azulado
{ bg: 'rgba(143,184,255,0.22)',  border: 'rgba(143,184,255,0.75)',  text: '#004a5a', label: 'Dominado', glow: true }, // 5 — azul (top)
];

// Paleta Discursiva (4 níveis: 0..3 checks)
const PALETTE_DISC = [
{ bg: 'rgba(255,61,80,0.13)',  border: 'rgba(255,61,80,0.50)',  text: '#9a1727', label: 'Não estudei' },
{ bg: 'rgba(255,122,26,0.15)', border: 'rgba(255,122,26,0.55)', text: '#a14e0c', label: 'Iniciado' },
{ bg: 'rgba(0,196,106,0.18)',  border: 'rgba(0,196,106,0.60)',  text: '#005a30', label: 'Quase lá' },
{ bg: 'rgba(143,184,255,0.22)',  border: 'rgba(143,184,255,0.75)',  text: '#004a5a', label: 'Dominado', glow: true },
];

function _daysSince(iso) {
if (!iso) return Infinity;
return Math.floor((new Date() - new Date(iso)) / 86400000);
}

function _needsReview(topic, flags) {
const checks = flags.filter(f => topic[f]).length;
if (checks === 0) return false; // tópico intocado não pede revisão
return _daysSince(topic.lastStudiedAt) >= REVIEW_DAYS;
}

function EditalHeatmap({ subjects, mode = 'objetiva' }) {
const isObj = mode === 'objetiva';
const flags = isObj ? ['lei', 'doutrina', 'juris', 'questoes', 'revisao'] : ['estudado', 'grifado', 'questoes'];
const palette = isObj ? PALETTE_OBJ : PALETTE_DISC;
const maxChecks = flags.length;

// ===== Stats globais =====
const allTopics = subjects.flatMap(s => s.topics);
const masteredCount = allTopics.filter(t => flags.filter(f => t[f]).length === maxChecks).length;
const studiedCount = allTopics.filter(t => {
const c = flags.filter(f => t[f]).length;
return c > 0 && c < maxChecks;
}).length;
const unseenCount = allTopics.length - masteredCount - studiedCount;
const needsReviewCount = allTopics.filter(t => _needsReview(t, flags)).length;
const overallPct = allTopics.length ? (masteredCount / allTopics.length) * 100 : 0;

// ===== Ordenação por domínio (dentro de cada disciplina) =====
// Mais checks primeiro; em empate, ordem alfabética
const sortByDominance = (topics) => {
return [...topics].sort((a, b) => {
const ca = flags.filter(f => a[f]).length;
const cb = flags.filter(f => b[f]).length;
if (cb !== ca) return cb - ca; // mais checks primeiro
return (a.name || '').localeCompare(b.name || '', 'pt-BR');
});
};

return (
<div className="glass" style={{ padding: 18 }}>
{/* Cabeçalho */}
<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
<div>
<div style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--text-muted)', fontFamily: 'var(--font-label)', fontWeight: 600 }}>
DOMINÂNCIA POR TÓPICO · {isObj ? 'OBJETIVA' : 'DISCURSIVA'}
</div>
<div className="font-display" style={{ fontSize: 18, fontWeight: 700, marginTop: 2 }}>
Heatmap do Edital
</div>
</div>
<div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
{palette.map((p, i) => (
<Legend key={i} bg={p.bg} border={p.border}
label={i === maxChecks ? `${i} dominado` : `${i}`}
glow={p.glow} />
))}
<Legend bg="rgba(255,176,87,0.15)" border="rgba(255,176,87,0.7)" label="✦ revisar" reviewGlow />
</div>
</div>

  {/* Linha de métricas */}
  <div style={{ marginBottom: 14 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 10.5, color: 'var(--text-muted)', fontFamily: 'var(--font-num)', flexWrap: 'wrap', gap: 6 }}>
      <span>
        <span style={{ color: '#96D9E0', fontWeight: 700 }}>{masteredCount}</span> dominados ·{' '}
        <span style={{ color: '#96E9B7', fontWeight: 700 }}>{studiedCount}</span> em progresso ·{' '}
        <span style={{ color: '#EE9E9F', fontWeight: 700 }}>{unseenCount}</span> intocados
        {needsReviewCount > 0 && (
          <> · <span style={{ color: '#EEBB8F', fontWeight: 700, textShadow: '0 0 6px rgba(255,210,122,0.4)' }}>
            ✦ {needsReviewCount} pedem revisão
          </span></>
        )}
      </span>
      <span className="num" style={{ color: '#96D9E0', fontWeight: 700 }}>{overallPct.toFixed(1)}%</span>
    </div>
    <div style={{ height: 5, background: 'rgba(243,235,221,0.06)', borderRadius: 4, overflow: 'hidden' }}>
      <div style={{
        height: '100%', width: `${overallPct}%`,
        background: 'linear-gradient(90deg, var(--coral), #ff7a1a, #f5c80b, var(--esmeralda), #8FB8FF)',
        boxShadow: '0 0 8px rgba(143,184,255,0.4)', transition: 'width 600ms ease',
      }} />
    </div>
  </div>

  {/* Grid por disciplina (com tópicos ordenados por domínio) */}
  <div style={{ display: 'grid', gap: 14 }}>
    {subjects.map(s => {
      const sortedTopics = sortByDominance(s.topics);
      const subjMastered = s.topics.filter(t => flags.filter(f => t[f]).length === maxChecks).length;
      return (
        <div key={s.id}>
          <div style={{ fontSize: 12, color: 'var(--text-primary)', marginBottom: 6, fontWeight: 600 }}>
            {s.name}
            <span className="num" style={{ marginLeft: 8, color: 'var(--text-dim)', fontWeight: 400, fontSize: 10 }}>
              {subjMastered}/{s.topics.length}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 5 }}>
            {sortedTopics.map(t => {
              const checks = flags.filter(f => t[f]).length;
              const p = palette[checks];
              const review = _needsReview(t, flags);
              const days = _daysSince(t.lastStudiedAt);
              const daysLabel = isFinite(days) ? `${days}d` : '—';
              const title = `${t.name}\n${p.label} · ${checks}/${maxChecks}\nÚltima atividade: ${daysLabel}${review ? ' · pede revisão!' : ''}`;
              const cls = ['edital-cell', review ? 'review-glow' : ''].filter(Boolean).join(' ');
              return (
                <div key={t.id}
                  className={cls}
                  title={title}
                  style={{
                    background: p.bg,
                    border: `1px solid ${p.border}`,
                    color: p.text,
                    borderRadius: 7,
                    minHeight: 46,
                    padding: '6px 8px',
                    fontSize: 10,
                    lineHeight: 1.2,
                    fontWeight: 600,
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: p.glow && !review ? '0 0 8px rgba(143,184,255,0.25)' : 'none',
                    transition: 'background 300ms ease, border-color 300ms ease, color 300ms ease, box-shadow 300ms ease',
                    cursor: 'help',
                  }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {t.name}
                  </div>
                  <div style={{
                    position: 'absolute', bottom: 3, left: 6,
                    fontSize: 8.5, opacity: 0.6,
                    fontFamily: 'var(--font-num)', fontWeight: 700,
                    letterSpacing: '0.04em',
                  }}>
                    {checks}/{maxChecks}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    })}
  </div>

  {/* Rodapé explicativo */}
  <div style={{ marginTop: 12, fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-num)', letterSpacing: '0.05em', lineHeight: 1.5 }}>
    AS CORES ATUALIZAM SOZINHAS À MEDIDA QUE VOCÊ MARCA OS CHECKBOXES DA MATRIZ DO EDITAL ACIMA.
    <br />
    TÓPICOS ESTÃO ORDENADOS DO MAIS DOMINADO AO MENOS DOMINADO. APÓS {REVIEW_DAYS} DIAS SEM ATIVIDADE, ELES BRILHAM ✦ PEDINDO REVISÃO.
  </div>
</div>

);
}

function Legend({ bg, border, label, glow, reviewGlow }) {
const cls = reviewGlow ? 'review-glow' : '';
return (
<div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-num)', fontWeight: 600 }}>
<div className={cls} style={{
width: 12, height: 12, borderRadius: 3,
background: bg, border: `1px solid ${border}`,
boxShadow: glow ? '0 0 6px rgba(143,184,255,0.4)' : 'none',
}} />
{label}
</div>
);
}

window.EditalHeatmap = EditalHeatmap;