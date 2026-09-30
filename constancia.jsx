// Lendário — Constância Tracker v2 — Horizontal 30-block sliding window
// Rightmost block = TODAY always. Blocks "roll left" as time passes.
// Pre-first-log days render as empty/white. Weekends never break constância.

const CONSTANCIA_THRESHOLD_H = (window.DA && window.DA.CONSTANCIA_HOURS_MIN) || 0.5;

function calcConstanciaStreak(logs) {
  if (window.DA && window.DA.calcConstancia) return window.DA.calcConstancia(logs);
  // Fallback: weekends auto-fulfilled, stop at pre-start days
  const active = (logs || []).filter(l => (l.hours||0)+(l.questions||0)+(l.reviews||0) > 0);
  const firstISO = active.length ? active.map(l => l.date).sort()[0] : null;
  if (!firstISO) return 0;
  const today = new Date(); today.setHours(0,0,0,0);
  const logMap = new Map((logs || []).map(l => [l.date, l]));
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    const iso = d.toISOString().slice(0,10);
    if (iso < firstISO) break;
    const dow = d.getDay();
    if (dow === 0 || dow === 6) { streak++; continue; }
    const log = logMap.get(iso);
    const hours = log ? (log.hours || 0) : 0;
    if (hours >= CONSTANCIA_THRESHOLD_H) streak++;
    else { if (i === 0) continue; break; }
  }
  return streak;
}

function ConstanciaTracker({ logs, bestStreak }) {
  const { useState, useRef, useEffect } = React;
  const [hovered, setHovered] = useState(null);
  const scrollRef = useRef(null);

  const today = new Date(); today.setHours(0,0,0,0);
  const todayISO = today.toISOString().slice(0, 10);
  const logMap = new Map((logs || []).map(l => [l.date, l]));
  const NUM_BLOCKS = 30;

  // First date the user actually registered any study — before this everything is "empty/white"
  const firstISO = (window.DA && window.DA.firstLogDate)
    ? window.DA.firstLogDate(logs || [])
    : (() => {
        const active = (logs || []).filter(l => (l.hours||0)+(l.questions||0)+(l.reviews||0) > 0);
        return active.length ? active.map(l => l.date).sort()[0] : null;
      })();

  // Build 30 blocks, index 0 = oldest (29 days ago), index 29 = TODAY
  const blocks = [];
  for (let i = NUM_BLOCKS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const dow = d.getDay();
    const isWeekend = dow === 0 || dow === 6;
    const isFuture = d > today;
    const isToday = iso === todayISO;
    const log = logMap.get(iso);
    const hours = log ? (log.hours || 0) : 0;
    const questions = log ? (log.questions || 0) : 0;
    const beforeStart = firstISO ? iso < firstISO : true;

    // Determine state — pre-first-log days render as 'empty'
    let state;
    if (isFuture) state = 'future';
    else if (beforeStart && !isToday) state = 'empty';
    else if (isWeekend) state = 'studied'; // weekends always fulfilled
    else if (hours >= CONSTANCIA_THRESHOLD_H) state = 'studied';
    else if (i === 0 && hours === 0) state = 'today-empty';
    else state = 'missed';

    blocks.push({ iso, dow, isWeekend, isToday, hours, questions, state, dayNum: d.getDate(), month: d.getMonth() });
  }

  const streak = calcConstanciaStreak(logs || []);
  const record = Math.max(
    bestStreak || 0,
    (window.DA && window.DA.calcConstanciaRecord) ? window.DA.calcConstanciaRecord(logs || []) : 0,
    streak,
  );
  const studiedCount = blocks.filter(b => b.state === 'studied').length;
  const missedCount = blocks.filter(b => b.state === 'missed').length;
  const onFire = streak >= 7;

  const DAYS_PT = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  const MONTHS_PT = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];

  // Color logic per state
  function blockColors(state, hours) {
    switch(state) {
      case 'studied': {
        if (hours >= 4) return {
          bg: 'linear-gradient(160deg, #FFE7B0 0%, #E8C47A 55%, #C99A4B 100%)',
          border: 'rgba(255,231,176,0.8)',
          glow: '0 0 0 1px rgba(232,196,122,0.55), 0 2px 14px rgba(232,196,122,0.45)',
          dot: null, dotColor: null
        };
        if (hours >= 2) return {
          bg: 'linear-gradient(160deg, #FFB27A 0%, #E0703E 100%)',
          border: 'rgba(255,154,90,0.7)',
          glow: '0 0 0 1px rgba(255,154,90,0.45), 0 2px 10px rgba(255,154,90,0.3)',
          dot: null, dotColor: null
        };
        if (hours >= 1) return {
          bg: 'linear-gradient(160deg, rgba(255,154,90,0.62) 0%, rgba(176,78,40,0.7) 100%)',
          border: 'rgba(255,154,90,0.45)',
          glow: '0 0 0 1px rgba(255,154,90,0.3), 0 1px 8px rgba(255,154,90,0.2)',
          dot: null, dotColor: null
        };
        return {
          bg: 'linear-gradient(160deg, rgba(255,154,90,0.32) 0%, rgba(140,60,30,0.42) 100%)',
          border: 'rgba(255,154,90,0.3)',
          glow: null,
          dot: null, dotColor: null
        };
      }
      case 'missed': return {
        bg: 'linear-gradient(160deg, rgba(255,122,138,0.18) 0%, rgba(200,60,60,0.22) 100%)',
        border: 'rgba(255,122,138,0.38)',
        glow: null,
        dot: '✕', dotColor: 'rgba(255,122,138,0.75)'
      };
      case 'today-empty': return {
        bg: 'rgba(22,19,40,0.55)',
        border: 'rgba(143,184,255,0.55)',
        glow: '0 0 0 2px rgba(143,184,255,0.25)',
        dot: null, dotColor: null
      };
      case 'empty': return {
        bg: 'rgba(22,19,40,0.70)',
        border: 'rgba(243,235,221,0.06)',
        glow: null, dot: null, dotColor: null
      };
      default: return {
        bg: 'rgba(243,235,221,0.04)',
        border: 'rgba(243,235,221,0.07)',
        glow: null, dot: null, dotColor: null
      };
    }
  }

  // Auto-scroll to end on mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, []);

  return (
    <div className="glass anim-slide-up" style={{
      padding: '18px 20px',
      boxShadow: onFire
        ? '0 0 0 1px rgba(255,154,90,0.35), 0 0 36px rgba(255,154,90,0.14), var(--card-shadow)'
        : undefined,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 9.5, letterSpacing: '0.22em', color: 'var(--text-muted)', fontFamily: 'var(--font-label)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 5 }}>
            CONSTÂNCIA · ÚLTIMOS 30 DIAS
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="font-display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--grafite)', letterSpacing: '-0.02em' }}>
              {onFire && <span style={{ marginRight: 6 }}><Glyph e="🔥" /></span>}
              <span style={{ color: streak > 0 ? '#FFC39A' : 'var(--text-muted)' }}>{streak}</span>
              <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500, marginLeft: 6 }}>
                dia{streak !== 1 ? 's' : ''} consecutivo{streak !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Stats chips */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div title="Maior sequência de dias úteis estudados (fins de semana não quebram)" style={{
            padding: '4px 10px', borderRadius: 99,
            background: 'rgba(232,196,122,0.10)', border: '1px solid rgba(232,196,122,0.30)',
            fontSize: 11, fontWeight: 700, color: 'var(--dourado)',
            fontFamily: 'var(--font-num)', letterSpacing: '0.04em',
          }}>
            <Glyph e="🏆" /> Recorde: {record} dia{record !== 1 ? 's' : ''}
          </div>
          <div style={{
            padding: '4px 10px', borderRadius: 99,
            background: 'rgba(79,209,165,0.10)', border: '1px solid rgba(79,209,165,0.25)',
            fontSize: 11, fontWeight: 700, color: 'var(--esmeralda)',
            fontFamily: 'var(--font-num)', letterSpacing: '0.04em',
          }}>
            ✓ {studiedCount} estudados
          </div>
          {missedCount > 0 && (
            <div style={{
              padding: '4px 10px', borderRadius: 99,
              background: 'rgba(255,122,138,0.08)', border: '1px solid rgba(255,122,138,0.22)',
              fontSize: 11, fontWeight: 700, color: 'var(--coral)',
              fontFamily: 'var(--font-num)', letterSpacing: '0.04em',
            }}>
              ✕ {missedCount} falta{missedCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* 30-block horizontal timeline */}
      <div ref={scrollRef} style={{ overflowX: 'auto', paddingBottom: 4 }}>
        <div style={{ display: 'flex', gap: 5, alignItems: 'flex-end', width: 'max-content', padding: '2px 2px 2px' }}>
          {blocks.map((b, i) => {
            const colors = blockColors(b.state, b.hours);
            const isHovered = hovered === i;
            const isHov = isHovered;
            const showLabel = b.isToday || (b.dayNum === 1) || (i === 0);

            return (
              <div key={b.iso} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                {/* Date label on top for special days */}
                <div style={{
                  height: 16, fontSize: 8.5,
                  color: b.isToday ? 'var(--ciano)' : 'var(--text-dim)',
                  fontFamily: 'var(--font-num)', fontWeight: b.isToday ? 800 : 600,
                  letterSpacing: '0.04em', textAlign: 'center',
                  opacity: (showLabel || isHov) ? 1 : 0,
                  transition: 'opacity 150ms ease',
                }}>
                  {b.isToday ? 'hoje' : `${b.dayNum}/${MONTHS_PT[b.month]}`}
                </div>

                {/* The block */}
                <div
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  title={`${b.iso} · ${DAYS_PT[b.dow]}${b.isWeekend ? ' · fim de semana (automático)' : ''} · ${b.hours.toFixed(1)}h${b.questions > 0 ? ` · ${b.questions} questões` : ''}`}
                  style={{
                    width: 28, height: b.isToday ? 52 : (b.state === 'studied' ? Math.max(32, Math.min(52, 32 + b.hours * 5)) : 40),
                    borderRadius: 8,
                    background: colors.bg,
                    border: `1px solid ${colors.border}`,
                    boxShadow: isHov
                      ? `0 0 0 2px rgba(143,184,255,0.5), 0 4px 16px rgba(0,0,0,0.12)`
                      : (colors.glow || 'none'),
                    transform: isHov ? 'scaleX(1.08) translateY(-2px)' : 'none',
                    transition: 'all 160ms cubic-bezier(0.16,1,0.3,1)',
                    cursor: 'default',
                    display: 'grid', placeItems: 'center',
                    position: 'relative',
                    animation: `streak-block-in 300ms ${i * 18}ms cubic-bezier(0.16,1,0.3,1) both`,
                    // Today gets a pulsing outline
                    ...(b.isToday ? { outline: '2px solid rgba(143,184,255,0.4)', outlineOffset: 2 } : {}),
                  }}
                >
                  {colors.dot && (
                    <span style={{
                      fontSize: b.state === 'missed' ? 10 : 14,
                      color: colors.dotColor,
                      fontWeight: 700,
                      lineHeight: 1,
                    }}>{colors.dot}</span>
                  )}
                  {b.state === 'today-empty' && (
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: 'var(--ciano)',
                      boxShadow: '0 0 8px rgba(143,184,255,0.8)',
                      animation: 'shield-pulse 2s ease-in-out infinite',
                    }} />
                  )}
                </div>

                {/* Day of week label below */}
                <div style={{
                  height: 13, fontSize: 8,
                  color: b.isWeekend ? 'var(--esmeralda)' : 'var(--text-dim)',
                  fontFamily: 'var(--font-num)', fontWeight: 600,
                  letterSpacing: '0.02em', textAlign: 'center',
                  opacity: b.isToday ? 1 : 0.7,
                }}>
                  {DAYS_PT[b.dow].slice(0,1)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 12, flexWrap: 'wrap' }}>
        {[
          { color: 'linear-gradient(135deg, rgba(255,154,90,0.32), rgba(140,60,30,0.42))', label: '< 1h' },
          { color: 'linear-gradient(135deg, rgba(255,154,90,0.62), rgba(176,78,40,0.7))', label: '1–2h' },
          { color: 'linear-gradient(135deg, #FFB27A, #E0703E)', label: '2–4h' },
          { color: 'linear-gradient(135deg, #FFE7B0, #E8C47A)', label: '4h+' },
          { color: 'linear-gradient(135deg, rgba(255,122,138,0.18), rgba(200,60,60,0.22))', label: 'Falta', border: 'rgba(255,122,138,0.38)' },
          { color: 'rgba(255,255,255,0.70)', label: 'Sem registros', border: 'rgba(243,235,221,0.06)' },
        ].map((l, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{
              width: 10, height: 10, borderRadius: 3,
              background: l.color, border: `1px solid ${l.border || 'transparent'}`,
              flexShrink: 0,
            }} />
            <span style={{ fontSize: 9.5, color: 'var(--text-dim)', fontFamily: 'var(--font-num)', fontWeight: 600 }}>
              {l.label}
            </span>
          </div>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: 3, background: 'rgba(22,19,40,0.55)', border: '1px solid rgba(143,184,255,0.55)', flexShrink: 0 }} />
          <span style={{ fontSize: 9.5, color: 'var(--text-dim)', fontFamily: 'var(--font-num)', fontWeight: 600 }}>Hoje</span>
        </div>
      </div>

      {onFire && (
        <div style={{
          marginTop: 12, padding: '8px 14px', borderRadius: 10,
          background: 'linear-gradient(90deg, rgba(255,154,90,0.1), rgba(232,196,122,0.05))',
          border: '1px solid rgba(255,154,90,0.25)',
          fontSize: 11.5, color: '#FFC39A', fontWeight: 700,
          textAlign: 'center', letterSpacing: '0.03em',
        }}>
          <Glyph e="✨" /> {streak} dias consecutivos — você está em chamas! Continue assim.
        </div>
      )}
    </div>
  );
}

window.ConstanciaTracker = ConstanciaTracker;
window.calcConstanciaStreak = calcConstanciaStreak;
