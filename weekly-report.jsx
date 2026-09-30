// TOGA — Weekly Report Modal
// Appears automatically on the first visit of each new week (weeks start Monday).
// Persistence key: 'toga_weekly_report_seen' → stores Monday ISO of last seen week.

// ── Local-date helpers (no UTC drift) ──────────────────────

function _localISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getMondayISO(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return _localISO(d);
}

function getPrevMondayISO(mondayISO) {
  const [y, m, day] = mondayISO.split('-').map(Number);
  const d = new Date(y, m - 1, day);
  d.setDate(d.getDate() - 7);
  return _localISO(d);
}

function addDays(isoDate, n) {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + n);
  return _localISO(date);
}

// Returns "13 a 19 de mai" style label for Mon–Sun week
function weekRangeLabel(mondayISO) {
  const [y, m, d] = mondayISO.split('-').map(Number);
  const start = new Date(y, m - 1, d);
  const end = new Date(y, m - 1, d + 6);
  const opts = { day: 'numeric', month: 'short' };
  return `${start.toLocaleDateString('pt-BR', opts)} a ${end.toLocaleDateString('pt-BR', opts)}`;
}

// Exported: used in app.jsx to check whether to show the report
function getCurrentWeekKey() {
  return getMondayISO(new Date());
}
window.getCurrentWeekKey = getCurrentWeekKey;

// ── Weekly stats ────────────────────────────────────────────

function computeWeeklyReport(logs, mondayISO) {
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(mondayISO, i));
  const weekLogs = (logs || []).filter(l => weekDates.includes(l.date));

  const totalHours = weekLogs.reduce((s, l) => s + (l.hours || 0), 0);
  const activeDays = weekLogs.filter(l => (l.hours || 0) > 0 || (l.questions || 0) > 0 || (l.reviews || 0) > 0).length;
  const totalQuestions = weekLogs.reduce((s, l) => s + (l.questions || 0), 0);
  const totalCorrect = weekLogs.reduce((s, l) => s + (l.correct || 0), 0);
  const totalReviews = weekLogs.reduce((s, l) => s + (l.reviews || 0), 0);

  // Per-discipline hours (expands entries sub-array)
  const discHours = {};
  weekLogs.forEach(l => {
    const ents = (l.entries && l.entries.length > 0) ? l.entries : [l];
    ents.forEach(e => {
      if (e.discipline && (e.hours || 0) > 0) {
        discHours[e.discipline] = (discHours[e.discipline] || 0) + (e.hours || 0);
      }
    });
  });

  const topDiscs = Object.entries(discHours)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const maxDiscHours = topDiscs.length > 0 ? topDiscs[0][1] : 1;
  const bestDisc = topDiscs.length > 0 ? topDiscs[0][0] : null;

  // Study type breakdown
  const typeHours = {};
  weekLogs.forEach(l => {
    const ents = (l.entries && l.entries.length > 0) ? l.entries : [l];
    ents.forEach(e => {
      if (e.studyType && (e.hours || 0) > 0) {
        typeHours[e.studyType] = (typeHours[e.studyType] || 0) + (e.hours || 0);
      }
    });
  });

  const hasData = totalHours > 0 || activeDays > 0 || totalQuestions > 0;

  return {
    totalHours, activeDays, totalQuestions, totalCorrect, totalReviews,
    topDiscs, maxDiscHours, bestDisc, typeHours, hasData,
  };
}

// ── Insight generation (always positive) ────────────────────

function generateWeeklyInsights(report, shared) {
  const { totalHours, activeDays, bestDisc, totalQuestions, totalCorrect } = report;
  const petInfo = window.DA.getPetStageInfo(shared.xp || 0);
  const streak = shared.streak || 0;
  const insights = [];

  // Frequency
  if (activeDays >= 6) {
    insights.push({ icon: '🏆', text: 'Semana quase perfeita! Você estudou praticamente todos os dias — poucos chegam nesse nível.' });
  } else if (activeDays >= 5) {
    insights.push({ icon: '🔥', text: `${activeDays} dias ativos! Sua consistência está construindo um conhecimento sólido e duradouro.` });
  } else if (activeDays >= 3) {
    insights.push({ icon: '💪', text: `${activeDays} dias de estudo esta semana. Constância vence talento — continue nesse ritmo!` });
  } else if (activeDays >= 1) {
    insights.push({ icon: '✨', text: 'Cada sessão conta! Você não deixou a semana passar em branco — isso faz diferença.' });
  }

  // Volume
  if (totalHours >= 30) {
    insights.push({ icon: '⚡', text: `${totalHours.toFixed(1)}h de estudo! Você está no nível da elite dos concurseiros. Impressionante!` });
  } else if (totalHours >= 20) {
    insights.push({ icon: '📈', text: `Mais de 20h estudadas — uma semana extremamente produtiva. Continue assim!` });
  } else if (totalHours >= 10) {
    insights.push({ icon: '⭐', text: `${totalHours.toFixed(1)}h de dedicação. Uma semana consistente que está te aproximando da aprovação.` });
  } else if (totalHours > 0) {
    insights.push({ icon: '🌱', text: `${totalHours.toFixed(1)}h registradas. Cada hora de estudo é um tijolo no caminho da aprovação.` });
  }

  // Best discipline
  if (bestDisc) {
    insights.push({ icon: '📚', text: `${bestDisc} foi sua disciplina destaque. Domínio gera segurança — você está no caminho certo!` });
  }

  // Streak
  if (streak >= 21) {
    insights.push({ icon: '🌟', text: `Sequência de ${streak} dias! Você está em modo imparável — raros chegam aqui. Sua raposinha está orgulhosa!` });
  } else if (streak >= 14) {
    insights.push({ icon: '🔥', text: `${streak} dias de constância seguida! Duas semanas sem parar — isso é disciplina de aprovado.` });
  } else if (streak >= 7) {
    insights.push({ icon: '💎', text: `${streak} dias de sequência! Uma semana inteira de constância — continue para desbloquear conquistas!` });
  } else if (streak >= 3) {
    insights.push({ icon: '⚡', text: `Sequência de ${streak} dias! A constância é o segredo que transforma dedicação em aprovação.` });
  }

  // Accuracy
  if (totalQuestions >= 10 && totalCorrect > 0) {
    const acc = (totalCorrect / totalQuestions) * 100;
    if (acc >= 80) {
      insights.push({ icon: '🎯', text: `${acc.toFixed(0)}% de acertos nas questões! Seu conhecimento está muito bem consolidado.` });
    } else if (acc >= 65) {
      insights.push({ icon: '🎯', text: `${acc.toFixed(0)}% de acertos — bom resultado! Revisão constante vai elevar ainda mais essa taxa.` });
    }
  } else if (totalQuestions >= 30) {
    insights.push({ icon: '🎯', text: `${totalQuestions} questões resolvidas! Volume de questões é fundamental para fixar o conteúdo.` });
  }

  // Pet progression
  if (petInfo.stage >= 6) {
    insights.push({ icon: '🐉', text: `Seu dragão (${petInfo.name}) está em estágio avançado! Cada sessão alimenta sua evolução.` });
  } else if (petInfo.stage >= 3) {
    insights.push({ icon: '🐣', text: `Seu dragão (${petInfo.name}) está crescendo! Continue estudando para desbloquear a próxima forma.` });
  } else if (petInfo.xpToNext > 0) {
    insights.push({ icon: '🥚', text: `Faltam apenas ${petInfo.xpToNext} XP para sua próxima evolução. Você está quase lá!` });
  }

  return insights.slice(0, 3);
}

// ── Animated bar (uses CSS animation) ──────────────────────

function AnimBar({ pct, color, delay = 0 }) {
  const { useRef, useEffect } = React;
  const ref = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => {
      if (ref.current) {
        ref.current.style.width = `${Math.max(4, pct)}%`;
      }
    }, delay);
    return () => clearTimeout(t);
  }, [pct, delay]);

  return (
    <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
      <div ref={ref} style={{
        height: '100%', width: '0%', borderRadius: 4,
        background: color,
        transition: `width 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
      }} />
    </div>
  );
}

// ── Main Modal ──────────────────────────────────────────────

function WeeklyReportModal({ open, shared, onClose }) {
  const { useState, useEffect, useRef } = React;
  const [phase, setPhase] = useState(0);
  const [goalBarReady, setGoalBarReady] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!open) { setPhase(0); setGoalBarReady(false); return; }
    setPhase(0);
    setGoalBarReady(false);
    const t1 = setTimeout(() => setPhase(1), 100);
    const t2 = setTimeout(() => setPhase(2), 350);
    const t3 = setTimeout(() => setPhase(3), 650);
    const t4 = setTimeout(() => setGoalBarReady(true), 500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [open]);

  if (!open) return null;

  // Compute "previous week" = the completed week before the current one
  const today = new Date();
  const thisMondayISO = getMondayISO(today);
  const prevMondayISO = getPrevMondayISO(thisMondayISO);

  const report = computeWeeklyReport(shared.dailyLogs || [], prevMondayISO);
  const insights = generateWeeklyInsights(report, shared);
  const petInfo = window.DA.getPetStageInfo(shared.xp || 0);
  const rangeLabel = weekRangeLabel(prevMondayISO);
  const weeklyGoal = (shared.goals || {}).weeklyHours || 28;
  const goalPct = weeklyGoal > 0 ? Math.min(100, (report.totalHours / weeklyGoal) * 100) : 0;

  const DISC_COLORS = ['#00B8D4', '#7B67D8', '#00A86B', '#C9A961'];

  const petEmoji = petInfo.stage >= 3 ? '🐉' : '🥚';

  return (
    <>
      <style>{`
        @keyframes _wr_backdrop { from { opacity:0 } to { opacity:1 } }
        @keyframes _wr_card_in  { from { opacity:0; transform:translateY(28px) scale(0.95) } to { opacity:1; transform:translateY(0) scale(1) } }
        @keyframes _wr_shimmer  { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes _wr_float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes _wr_star     { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.2)} }
        @keyframes _wr_fadeslide { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes _wr_statpop  { 0%{opacity:0;transform:scale(0.82)} 65%{transform:scale(1.04)} 100%{opacity:1;transform:scale(1)} }
        @keyframes _wr_glow     { 0%,100%{box-shadow:0 0 24px rgba(0,184,212,.15),0 16px 60px rgba(0,0,0,.5)} 50%{box-shadow:0 0 48px rgba(0,184,212,.28),0 16px 60px rgba(0,0,0,.5)} }
        @keyframes _wr_orb      { 0%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,-20px) scale(1.1)} 66%{transform:translate(-20px,15px) scale(0.95)} 100%{transform:translate(0,0) scale(1)} }

        ._wr_backdrop {
          position:fixed; inset:0; z-index:9000;
          background:rgba(5,10,20,.8);
          backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px);
          display:flex; align-items:center; justify-content:center;
          padding:16px;
          animation:_wr_backdrop .35s ease forwards;
        }
        ._wr_card {
          position:relative;
          width:100%; max-width:480px; max-height:92vh;
          border-radius:24px;
          overflow:hidden;
          background:linear-gradient(160deg,#0d1626 0%,#101928 50%,#0a1420 100%);
          border:1px solid rgba(0,184,212,.2);
          animation:_wr_card_in .5s cubic-bezier(.22,1,.36,1) forwards, _wr_glow 3.5s ease-in-out 1s infinite;
          display:flex; flex-direction:column;
        }
        ._wr_scroll {
          overflow-y:auto; overflow-x:hidden;
          flex:1;
          scrollbar-width:thin;
          scrollbar-color:rgba(0,184,212,.25) transparent;
        }
        ._wr_scroll::-webkit-scrollbar { width:3px; }
        ._wr_scroll::-webkit-scrollbar-track { background:transparent; }
        ._wr_scroll::-webkit-scrollbar-thumb { background:rgba(0,184,212,.25); border-radius:3px; }

        ._wr_header {
          position:relative; overflow:hidden;
          padding:28px 24px 22px;
          background:linear-gradient(135deg,rgba(0,184,212,.1),rgba(91,71,184,.1));
          border-bottom:1px solid rgba(0,184,212,.1);
          flex-shrink:0;
        }
        ._wr_orb1 {
          position:absolute; width:180px; height:180px; border-radius:50%;
          background:radial-gradient(circle, rgba(0,184,212,.12), transparent 70%);
          top:-60px; right:-40px;
          animation:_wr_orb 8s ease-in-out infinite;
        }
        ._wr_orb2 {
          position:absolute; width:140px; height:140px; border-radius:50%;
          background:radial-gradient(circle, rgba(91,71,184,.1), transparent 70%);
          bottom:-50px; left:-30px;
          animation:_wr_orb 10s ease-in-out 2s infinite reverse;
        }
        ._wr_stars {
          position:absolute; inset:0; pointer-events:none;
          background-image:
            radial-gradient(1.5px 1.5px at 12% 22%, rgba(0,184,212,.7) 0%, transparent 100%),
            radial-gradient(1px 1px at 82% 14%, rgba(201,169,97,.55) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 48% 72%, rgba(91,71,184,.55) 0%, transparent 100%),
            radial-gradient(1px 1px at 88% 62%, rgba(0,184,212,.45) 0%, transparent 100%),
            radial-gradient(2px 2px at 8% 82%, rgba(201,169,97,.45) 0%, transparent 100%),
            radial-gradient(1px 1px at 63% 38%, rgba(255,255,255,.3) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 32% 58%, rgba(0,168,107,.45) 0%, transparent 100%),
            radial-gradient(1px 1px at 55% 18%, rgba(255,255,255,.25) 0%, transparent 100%);
        }
        ._wr_badge {
          display:inline-flex; align-items:center; gap:6px;
          background:linear-gradient(135deg,rgba(0,184,212,.15),rgba(91,71,184,.15));
          border:1px solid rgba(0,184,212,.3);
          border-radius:20px; padding:4px 12px;
          font-size:9px; letter-spacing:.22em;
          font-family:'JetBrains Mono',monospace;
          color:#00B8D4; font-weight:700;
          margin-bottom:12px;
        }
        ._wr_title {
          font-family:'Space Grotesk',sans-serif;
          font-size:26px; font-weight:700; letter-spacing:-.025em;
          color:#fff; line-height:1.2; margin-bottom:6px;
        }
        ._wr_accent {
          background:linear-gradient(90deg,#00B8D4 0%,#7B67D8 50%,#C9A961 100%);
          background-size:200% auto;
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
          background-clip:text;
          animation:_wr_shimmer 4s linear infinite;
        }
        ._wr_close {
          position:absolute; top:14px; right:14px;
          width:30px; height:30px; border-radius:50%;
          background:rgba(255,255,255,.07);
          border:1px solid rgba(255,255,255,.1);
          color:rgba(255,255,255,.45); font-size:15px;
          display:grid; place-items:center; cursor:pointer;
          transition:background .2s,color .2s;
          z-index:2;
        }
        ._wr_close:hover { background:rgba(255,255,255,.14); color:rgba(255,255,255,.8); }

        ._wr_body { padding:20px 22px 24px; }
        ._wr_section {
          font-size:9px; letter-spacing:.22em;
          font-family:'JetBrains Mono',monospace;
          color:rgba(255,255,255,.28); font-weight:700;
          margin-bottom:10px; text-transform:uppercase;
        }
        ._wr_glass {
          background:rgba(255,255,255,.04);
          border:1px solid rgba(255,255,255,.07);
          border-radius:14px;
        }
        ._wr_stat {
          border-radius:13px;
          padding:14px 10px;
          text-align:center;
          background:rgba(255,255,255,.04);
          border:1px solid rgba(255,255,255,.07);
          animation:_wr_statpop .5s cubic-bezier(.22,1,.36,1) forwards;
          opacity:0;
        }
        ._wr_stat_val {
          font-family:'Space Grotesk',sans-serif;
          font-size:26px; font-weight:700; line-height:1;
          margin-bottom:4px;
        }
        ._wr_stat_lbl {
          font-size:9px; letter-spacing:.1em;
          font-family:'JetBrains Mono',monospace;
          color:rgba(255,255,255,.35); font-weight:700;
        }
        ._wr_insight {
          background:rgba(255,255,255,.04);
          border:1px solid rgba(0,184,212,.12);
          border-left:3px solid #00B8D4;
          border-radius:12px; padding:12px 14px;
          display:flex; gap:10px; align-items:flex-start;
          animation:_wr_fadeslide .5s ease forwards; opacity:0;
        }
        ._wr_cta {
          width:100%; padding:16px;
          border-radius:14px;
          background:linear-gradient(135deg,rgba(0,184,212,.18),rgba(91,71,184,.18));
          border:1px solid rgba(0,184,212,.3);
          color:#fff;
          font-family:'Space Grotesk',sans-serif;
          font-size:15px; font-weight:700;
          cursor:pointer;
          transition:all .2s;
          animation:_wr_fadeslide .5s ease .5s forwards; opacity:0;
          margin-top:20px;
          letter-spacing:.01em;
        }
        ._wr_cta:hover { border-color:rgba(0,184,212,.5); transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,184,212,.2); }
        ._wr_cta:active { transform:translateY(0); }
        ._wr_pet {
          display:flex; align-items:center; gap:12px;
          background:rgba(91,71,184,.1);
          border:1px solid rgba(91,71,184,.2);
          border-radius:12px; padding:12px 14px;
          animation:_wr_fadeslide .5s ease .3s forwards; opacity:0;
        }
        ._wr_nodata {
          text-align:center; padding:36px 16px;
          color:rgba(255,255,255,.4);
          font-family:'Inter',sans-serif;
          font-size:14px; line-height:1.6;
        }
      `}</style>

      <div className="_wr_backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="_wr_card">

          {/* ── Header ── */}
          <div className="_wr_header">
            <div className="_wr_orb1" />
            <div className="_wr_orb2" />
            <div className="_wr_stars" />
            <button className="_wr_close" onClick={onClose}>✕</button>

            <div className="_wr_badge">
              <span style={{ animation: '_wr_star 2s ease-in-out infinite', display: 'inline-block' }}>✨</span>
              RELATÓRIO SEMANAL
            </div>

            <div className="_wr_title">
              Sua semana<br />
              <span className="_wr_accent">em destaque</span>
            </div>

            <div style={{
              marginTop: 8,
              fontSize: 11, color: 'rgba(255,255,255,.4)',
              fontFamily: "'JetBrains Mono',monospace", letterSpacing: '.06em',
            }}>
              {rangeLabel}
            </div>
          </div>

          {/* ── Scrollable body ── */}
          <div className="_wr_scroll" ref={scrollRef}>
            <div className="_wr_body">

              {!report.hasData ? (
                /* Empty state */
                <div className="_wr_nodata">
                  <div style={{ fontSize: 44, marginBottom: 14, animation: '_wr_float 3s ease-in-out infinite', display: 'inline-block' }}>🌱</div>
                  <div style={{ color: 'rgba(255,255,255,.65)', fontWeight: 700, marginBottom: 8, fontSize: 15 }}>
                    Semana anterior sem registros
                  </div>
                  <div>
                    Comece a registrar suas sessões de estudo<br />
                    para ver seu progresso semanal aqui!
                  </div>
                  <button className="_wr_cta" onClick={onClose} style={{ marginTop: 24 }}>
                    ✨ Começar agora
                  </button>
                </div>
              ) : (
                <>
                  {/* ── Stat cards ── */}
                  {phase >= 1 && (
                    <div style={{ marginBottom: 20 }}>
                      <div className="_wr_section">📊 Resumo da semana</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 9, marginBottom: 9 }}>
                        {[
                          { val: report.totalHours < 10 ? report.totalHours.toFixed(1) : Math.round(report.totalHours), unit: 'h', label: 'ESTUDADAS', color: '#00B8D4', delay: 0 },
                          { val: report.activeDays, unit: 'd', label: 'DIAS ATIVOS', color: '#C9A961', delay: 80 },
                          { val: shared.streak || 0, unit: '🔥', label: 'SEQUÊNCIA', color: '#E85D5D', delay: 160 },
                        ].map(s => (
                          <div key={s.label} className="_wr_stat" style={{ animationDelay: `${s.delay}ms` }}>
                            <div className="_wr_stat_val" style={{ color: s.color }}>
                              {s.val}
                              <span style={{ fontSize: 12, color: `${s.color}99`, marginLeft: 1 }}>{s.unit}</span>
                            </div>
                            <div className="_wr_stat_lbl">{s.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Questions row (only if exists) */}
                      {report.totalQuestions > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
                          <div className="_wr_stat" style={{ animationDelay: '240ms' }}>
                            <div className="_wr_stat_val" style={{ color: '#7B67D8' }}>{report.totalQuestions}</div>
                            <div className="_wr_stat_lbl">QUESTÕES</div>
                          </div>
                          {report.totalCorrect > 0 && (
                            <div className="_wr_stat" style={{ animationDelay: '320ms' }}>
                              <div className="_wr_stat_val" style={{ color: '#00A86B' }}>
                                {Math.round((report.totalCorrect / report.totalQuestions) * 100)}
                                <span style={{ fontSize: 12, color: 'rgba(0,168,107,.7)' }}>%</span>
                              </div>
                              <div className="_wr_stat_lbl">ACERTOS</div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Weekly goal ── */}
                  {phase >= 1 && weeklyGoal > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <div className="_wr_section">🎯 Meta semanal</div>
                      <div className="_wr_glass" style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                          <span style={{ fontSize: 13, color: 'rgba(255,255,255,.7)', fontWeight: 600 }}>
                            {report.totalHours.toFixed(1)}h de {weeklyGoal}h
                          </span>
                          <span style={{
                            fontSize: 12, fontWeight: 700,
                            fontFamily: "'JetBrains Mono',monospace",
                            color: goalPct >= 100 ? '#00A86B' : goalPct >= 70 ? '#C9A961' : '#00B8D4',
                          }}>
                            {Math.round(goalPct)}%{goalPct >= 100 ? ' ✓' : ''}
                          </span>
                        </div>
                        <AnimBar
                          pct={goalBarReady ? goalPct : 0}
                          delay={0}
                          color={
                            goalPct >= 100
                              ? 'linear-gradient(90deg,#00B8D4,#00A86B)'
                              : goalPct >= 70
                              ? 'linear-gradient(90deg,#00B8D4,#C9A961)'
                              : 'linear-gradient(90deg,#00B8D4,#7B67D8)'
                          }
                        />
                        {goalPct >= 100 && (
                          <div style={{
                            fontSize: 10, color: '#00A86B', marginTop: 7,
                            fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, letterSpacing: '.08em',
                          }}>
                            🏆 META DA SEMANA ATINGIDA!
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── Top disciplines ── */}
                  {phase >= 2 && report.topDiscs.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <div className="_wr_section">📚 Disciplinas destaque</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {report.topDiscs.map(([disc, hours], i) => (
                          <div key={disc} style={{
                            animation: `_wr_fadeslide .4s ease ${i * 80}ms forwards`,
                            opacity: 0,
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{
                                width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                                background: `${DISC_COLORS[i]}22`,
                                border: `1px solid ${DISC_COLORS[i]}44`,
                                display: 'grid', placeItems: 'center',
                                fontSize: 10, fontWeight: 700,
                                color: DISC_COLORS[i],
                                fontFamily: "'JetBrains Mono',monospace",
                              }}>{i + 1}</div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, gap: 4 }}>
                                  <span style={{
                                    fontSize: 12, color: 'rgba(255,255,255,.75)', fontWeight: 600,
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                    maxWidth: '70%',
                                  }}>{disc}</span>
                                  <span style={{
                                    fontSize: 11, color: DISC_COLORS[i], fontWeight: 700,
                                    fontFamily: "'JetBrains Mono',monospace", flexShrink: 0,
                                  }}>
                                    {hours < 1 ? `${Math.round(hours * 60)}min` : `${hours.toFixed(1)}h`}
                                  </span>
                                </div>
                                <AnimBar
                                  pct={goalBarReady ? (hours / report.maxDiscHours) * 100 : 0}
                                  delay={200 + i * 100}
                                  color={DISC_COLORS[i]}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── Insights ── */}
                  {phase >= 2 && insights.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <div className="_wr_section">💬 Insights da semana</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {insights.map((ins, i) => (
                          <div key={i} className="_wr_insight" style={{ animationDelay: `${i * 120}ms` }}>
                            <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.4 }}>{ins.icon}</span>
                            <span style={{ fontSize: 13, color: 'rgba(255,255,255,.68)', lineHeight: 1.5 }}>
                              {ins.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── Pet companion ── */}
                  {phase >= 3 && (
                    <div className="_wr_pet">
                      <div style={{
                        fontSize: 34, lineHeight: 1, flexShrink: 0,
                        animation: '_wr_float 3s ease-in-out infinite',
                        display: 'inline-block',
                      }}>{petEmoji}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.85)', marginBottom: 2 }}>
                          {petInfo.name}
                        </div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', lineHeight: 1.4 }}>
                          {petInfo.xpToNext > 0
                            ? `Faltam ${petInfo.xpToNext} XP para a próxima evolução`
                            : 'Forma final alcançada! 👑'}
                        </div>
                        {petInfo.next && (
                          <div style={{ marginTop: 6 }}>
                            <AnimBar
                              pct={goalBarReady ? Math.round(petInfo.progress * 100) : 0}
                              delay={600}
                              color="linear-gradient(90deg,#7B67D8,#C9A961)"
                            />
                          </div>
                        )}
                      </div>
                      <div style={{ flexShrink: 0, textAlign: 'right' }}>
                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,.28)', fontFamily: "'JetBrains Mono',monospace", marginBottom: 2 }}>
                          XP TOTAL
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: '#7B67D8', fontFamily: "'Space Grotesk',sans-serif" }}>
                          {(shared.xp || 0).toLocaleString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── CTA ── */}
                  <button className="_wr_cta" onClick={onClose}>
                    ✨ Continuar minha jornada
                  </button>
                </>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}

window.WeeklyReportModal = WeeklyReportModal;
