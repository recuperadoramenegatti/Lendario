// Header — Ultra Premium v2
function GlobalHeader({ shared, mode, setMode, totalPct, onOpenSettings, onOpenLair, onOpenChest }) {
  const level = window.DA.getLevelInfo(shared.xp);
  return (
    <header className="header-sticky">
      <div style={{
        maxWidth: 1400, margin: '0 auto',
        padding: '12px 28px',
        display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
      }}>
        <ShieldBadge percent={totalPct} size={44} />

        <div style={{ flex: 1, minWidth: 160 }}>
          <div className="font-display gradient-neon" style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.03em' }}>
            TOGA
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2, fontSize: 11, color: 'var(--text-muted)' }}>
            <span style={{
              color: level.tier.color, fontWeight: 700, letterSpacing: '0.03em',
              fontSize: 10,
            }}>{level.tier.name}</span>
            <span style={{ color: 'var(--text-dim)', fontSize: 10 }}>·</span>
            <span style={{ color: 'var(--text-dim)', fontSize: 10 }}>Progresso {totalPct.toFixed(0)}%</span>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="mode-toggle">
          <button className={mode === 'objetiva' ? 'active objetiva' : ''} onClick={() => setMode('objetiva')}>
            Objetiva
          </button>
          <button className={mode === 'discursiva' ? 'active discursiva' : ''} onClick={() => setMode('discursiva')}>
            Discursiva
          </button>
        </div>

        {/* Nível + XP (avatar do dragão) */}
        {window.LevelChip ? <LevelChip shared={shared} onClick={onOpenLair} /> : (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 13px', borderRadius: 10,
          background: 'rgba(91,71,184,0.07)',
          border: '1px solid rgba(91,71,184,0.18)',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.6) inset',
        }}>
          <span style={{ color: 'var(--tinta)', fontSize: 13, filter: 'drop-shadow(0 0 4px rgba(123,103,216,0.6))' }}>⚡</span>
          <span className="num" style={{ fontSize: 13, fontWeight: 700, color: 'var(--tinta)', letterSpacing: '-0.01em' }}>
            {shared.xp.toLocaleString('pt-BR')}
          </span>
          <span style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.12em', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>XP</span>
        </div>

        )}

        {/* Cristais arcanos (moeda do dragão) */}
        {window.GemCounterChip && <GemCounterChip gems={shared.dragon ? shared.dragon.gems : 0} onClick={onOpenLair} />}
        {window.PendingChestChip && <PendingChestChip shared={shared} onOpen={onOpenChest} />}

        {/* Constância chip */}
        <div title="Constância atual (sequência de dias úteis estudados)" style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 13px', borderRadius: 10,
          background: 'rgba(245,158,11,0.07)',
          border: '1px solid rgba(245,158,11,0.22)',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.6) inset',
        }}>
          <span style={{ fontSize: 13, filter: 'drop-shadow(0 0 4px rgba(255,193,7,0.6))' }}>🔥</span>
          <span className="num" style={{ fontSize: 13, fontWeight: 700, color: 'var(--ambar)', letterSpacing: '-0.01em' }}>{shared.streak}</span>
          <span style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.12em', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>CONSTÂNCIA</span>
        </div>
        {window.SoundToggle && <SoundToggle />}
      </div>
    </header>
  );
}

window.GlobalHeader = GlobalHeader;
