// GavelBar v2 — Premium progress bar + constância/shields inline
function GavelBar({ percentage, streak, shields }) {
  const pct = Math.min(100, Math.max(0, percentage));
  return (
    <div className="glass" style={{ padding: '14px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Gavel icon */}
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: 'rgba(232,196,122,0.12)',
          border: '1px solid rgba(232,196,122,0.25)',
          display: 'grid', placeItems: 'center',
          color: 'var(--dourado)',
          filter: 'drop-shadow(0 0 6px rgba(232,196,122,0.4))',
        }}>
          <I.gavel size={17} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <span style={{ fontSize: 9.5, letterSpacing: '0.22em', color: 'var(--text-muted)', fontFamily: 'var(--font-label)', fontWeight: 700 }}>
              RUMO À POSSE
            </span>
            <span className="num" style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-heading)', letterSpacing: '-0.01em' }}>
              {percentage.toFixed(1)}<span style={{ fontSize: 10, fontWeight: 600, opacity: 0.7 }}>%</span>
            </span>
          </div>

          {/* Progress bar — thin and elegant */}
          <div style={{ height: 6, background: 'rgba(243,235,221,0.07)', borderRadius: 99, overflow: 'hidden', position: 'relative' }}>
            <div style={{
              position: 'absolute', inset: 0, width: `${pct}%`,
              background: 'linear-gradient(90deg, #8A6428 0%, #E8C47A 60%, #FFF1C9 100%)',
              borderRadius: 99,
              boxShadow: '0 0 10px rgba(143,184,255,0.4)',
              transition: 'width 800ms cubic-bezier(0.16,1,0.3,1)',
            }} />
            {/* Milestone marks */}
            {[25, 50, 75].map(p => (
              <div key={p} style={{
                position: 'absolute', left: `${p}%`, top: 0, bottom: 0,
                width: 1, background: pct >= p ? 'rgba(255,255,255,0.35)' : 'rgba(243,235,221,0.10)',
              }} />
            ))}
          </div>
        </div>

        {/* Constância + Shields chips */}
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 8.5, color: 'var(--text-dim)', letterSpacing: '0.15em', fontWeight: 700, fontFamily: 'var(--font-label)', marginBottom: 2 }}>CONSTÂNCIA</div>
            <div className="num" style={{
              fontSize: 17, fontWeight: 800, color: 'var(--ambar)',
              filter: 'drop-shadow(0 0 6px rgba(255,210,122,0.5))',
              letterSpacing: '-0.01em',
            }}><Glyph e="🔥" /> {streak}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 8.5, color: 'var(--text-dim)', letterSpacing: '0.15em', fontWeight: 700, fontFamily: 'var(--font-label)', marginBottom: 2 }}>SHIELDS</div>
            <div className="num" style={{
              fontSize: 17, fontWeight: 800, color: 'var(--ciano)',
              filter: 'drop-shadow(0 0 6px rgba(169,200,255,0.5))',
              letterSpacing: '-0.01em',
            }}><Glyph e="🛡" /> {shields}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.GavelBar = GavelBar;
