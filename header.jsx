// Header — Ultra Premium v3 (gamificado)
function GlobalHeader({ shared, mode, setMode, totalPct, onOpenHall }) {
  const level = window.DA.getLevelInfo(shared.xp);
  const lv = window.GM ? window.GM.levelInfo(shared.xp) : null;
  const Avatar = window.DragonAvatar;
  const Gem = window.GemIcon;
  const Sound = window.SoundToggle;
  return (
    <header className="header-sticky">
      <div style={{
        maxWidth: 1400, margin: '0 auto',
        padding: '10px 24px',
        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
      }}>
        <ShieldBadge percent={totalPct} size={42} />

        <div style={{ flex: 1, minWidth: 130 }}>
          <div className="font-display gradient-neon" style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.03em' }}>
            TOGA
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2, fontSize: 11, color: 'var(--text-muted)' }}>
            <span style={{ color: level.tier.color, fontWeight: 700, letterSpacing: '0.03em', fontSize: 10 }}>{level.tier.name}</span>
            <span style={{ color: 'var(--text-dim)', fontSize: 10 }}>·</span>
            <span style={{ color: 'var(--text-dim)', fontSize: 10 }}>Progresso {totalPct.toFixed(0)}%</span>
          </div>
        </div>

        <div className="mode-toggle">
          <button className={mode === 'objetiva' ? 'active objetiva' : ''} onClick={() => setMode('objetiva')}>Objetiva</button>
          <button className={mode === 'discursiva' ? 'active discursiva' : ''} onClick={() => setMode('discursiva')}>Discursiva</button>
        </div>

        {lv && (
          <button className="hdr-chip hdr-level" onClick={onOpenHall} title={`${shared.xp.toLocaleString('pt-BR')} XP no total`} style={{ cursor: 'pointer' }}>
            {Avatar && <Avatar shared={shared} size={30} />}
            <span className="hdr-level-txt">
              <span className="hdr-level-top"><b>Nv {lv.level}</b><span>{lv.into}/{lv.need}</span></span>
              <span className="hdr-xp"><div style={{ width: `${Math.max(3, lv.progress * 100)}%` }} /></span>
            </span>
          </button>
        )}

        <div id="gem-counter" className="hdr-chip hdr-gems" title="Gemas Arcanas — use no guarda-roupa do dragão">
          {Gem ? <Gem size={15} /> : '💎'}
          <b>{(shared.gems || 0).toLocaleString('pt-BR')}</b>
        </div>

        <div className="hdr-chip hdr-streak" title="Constância atual (sequência de dias úteis estudados)">
          <span style={{ fontSize: 14, filter: 'drop-shadow(0 0 4px rgba(255,193,7,0.6))' }}>🔥</span>
          <b>{shared.streak}</b>
          <span className="hdr-lbl">DIAS</span>
        </div>

        {Sound && <Sound />}
      </div>
    </header>
  );
}

window.GlobalHeader = GlobalHeader;
