// Lendário — Aba Histórico (lista de sessões agrupadas por dia)

function HistoricoTab({ shared, onEditEntry, onDeleteEntry }) {
  const logs = shared.dailyLogs || [];

  // Order from most recent to oldest
  const sortedDays = [...logs]
    .filter(l => (l.hours||0)+(l.questions||0)+(l.reviews||0) > 0 || (l.entries && l.entries.length > 0))
    .sort((a, b) => b.date.localeCompare(a.date));

  if (sortedDays.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 24px' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}><Glyph e="📜" /></div>
        <div className="font-display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-heading)', marginBottom: 8 }}>
          Nenhum registro ainda
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 360, margin: '0 auto' }}>
          Suas sessões registradas aparecerão aqui, organizadas por dia.
        </div>
      </div>
    );
  }

  const fmtDate = (iso) => {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const fmtHours = (h) => {
    const total = Math.round(h * 60);
    const hh = Math.floor(total / 60);
    const mm = total % 60;
    if (hh === 0) return `${mm}min`;
    if (mm === 0) return `${hh}h`;
    return `${hh}h ${mm}min`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="font-display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-heading)', marginBottom: 4 }}>
        Histórico de sessões
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
        {sortedDays.length} dia{sortedDays.length !== 1 ? 's' : ''} com atividade registrada
      </div>

      {sortedDays.map(day => {
        const entries = (day.entries && day.entries.length > 0) ? day.entries : [day];
        const totalH = (day.hours || 0);
        const totalQ = (day.questions || 0);
        const totalR = (day.reviews || 0);
        return (
          <div key={day.date} className="glass" style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8, marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid rgba(243,235,221,0.08)' }}>
              <div className="font-display" style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-heading)', textTransform: 'capitalize' }}>
                {fmtDate(day.date)}
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 11, fontFamily: 'var(--font-num)', fontWeight: 600 }}>
                {totalH > 0 && <span style={{ color: 'var(--ciano)' }}><Glyph e="⏱" /> {fmtHours(totalH)}</span>}
                {totalQ > 0 && <span style={{ color: 'var(--esmeralda)' }}><Glyph e="❓" /> {totalQ}</span>}
                {totalR > 0 && <span style={{ color: 'var(--tinta)' }}>🃏 {totalR}</span>}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {entries.map((e, i) => {
                const hasAcc = (e.correct || 0) + (e.wrong || 0) > 0;
                const accPct = hasAcc ? Math.round(((e.correct || 0) / ((e.correct || 0) + (e.wrong || 0))) * 100) : null;
                const handleDel = () => {
                  if (!onDeleteEntry) return;
                  if (window.confirm('Excluir este registro? Esta ação não pode ser desfeita.')) {
                    onDeleteEntry(day.date, i);
                  }
                };
                const handleEdit = () => onEditEntry && onEditEntry(day.date, i, e);
                return (
                  <div key={i} style={{
                    padding: '10px 12px',
                    background: 'rgba(22,19,40,0.5)',
                    borderRadius: 10,
                    border: '1px solid rgba(243,235,221,0.06)',
                    display: 'flex', flexDirection: 'column', gap: 4,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        {e.discipline && (
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--grafite)' }}>
                            {e.discipline}
                          </span>
                        )}
                        {e.topic && (
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            · {e.topic}
                          </span>
                        )}
                        {e.studyType && (
                          <span style={{
                            fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
                            padding: '2px 7px', borderRadius: 99,
                            background: 'rgba(74,54,196,0.08)', color: 'var(--text-heading)',
                            textTransform: 'uppercase',
                          }}>
                            {e.studyType}
                          </span>
                        )}
                        {e.source === 'pomodoro' && (
                          <span style={{ fontSize: 11, color: 'var(--tinta)' }}><Glyph e="🛡" /></span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 10, fontSize: 11, fontFamily: 'var(--font-num)', fontWeight: 600, alignItems: 'center' }}>
                        {(e.hours || 0) > 0 && <span style={{ color: 'var(--ciano)' }}>{fmtHours(e.hours)}</span>}
                        {(e.questions || 0) > 0 && <span style={{ color: 'var(--esmeralda)' }}>{e.questions}q</span>}
                        {accPct !== null && (
                          <span style={{ color: accPct >= 70 ? 'var(--esmeralda)' : accPct >= 50 ? 'var(--dourado)' : 'var(--coral)' }}>
                            {accPct}%
                          </span>
                        )}
                        {(e.reviews || 0) > 0 && <span style={{ color: 'var(--tinta)' }}>{e.reviews}r</span>}
                        {onEditEntry && (
                          <button onClick={handleEdit} title="Editar"
                            style={{ background: 'transparent', border: '1px solid rgba(243,235,221,0.15)', borderRadius: 6, padding: '2px 7px', cursor: 'pointer', fontSize: 11, color: 'var(--text-heading)' }}>
                            ✎
                          </button>
                        )}
                        {onDeleteEntry && (
                          <button onClick={handleDel} title="Excluir"
                            style={{ background: 'transparent', border: '1px solid rgba(255,122,138,0.3)', borderRadius: 6, padding: '2px 7px', cursor: 'pointer', fontSize: 11, color: 'var(--coral)' }}>
                            <Glyph e="🗑" />
                          </button>
                        )}
                      </div>
                    </div>
                    {e.note && (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, fontStyle: 'italic' }}>
                        "{e.note}"
                      </div>
                    )}
                    {!e.discipline && !e.studyType && !e.note && (
                      <div style={{ fontSize: 11, color: 'var(--text-dim)', fontStyle: 'italic' }}>
                        Registro rápido sem detalhes
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

window.HistoricoTab = HistoricoTab;
