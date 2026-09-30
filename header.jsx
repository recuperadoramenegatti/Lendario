// Lendário — Cabeçalho (Biblioteca Arcana)
// Marca + selo de progresso do edital, seletor Objetiva/Discursiva e os chips
// de status (nível, cristais, baú pendente, chama da constância, som).
function ProgressSeal({ percent = 0, size = 46 }) {
  const r = size / 2 - 4, c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(100, percent));
  return (
    <div className="ld-seal" style={{ position: 'relative', width: size, height: size, flexShrink: 0 }} title={`Edital concluído: ${p.toFixed(0)}%`}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden="true">
        <defs>
          <linearGradient id="ld-seal-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFF1C9" /><stop offset="1" stopColor="#B5843A" /></linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r + 2.5} fill="none" stroke="rgba(232,196,122,0.25)" strokeWidth="1" strokeDasharray="1 3" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="rgba(20,17,36,0.9)" stroke="rgba(255,255,255,0.08)" strokeWidth="3.5" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="url(#ld-seal-g)" strokeWidth="3.5" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - p / 100)} transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(.2,.8,.2,1)', filter: 'drop-shadow(0 0 4px rgba(232,196,122,0.6))' }} />
      </svg>
      <span className="num" style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: 11.5, fontWeight: 800, color: '#F7E2A8' }}>{p.toFixed(0)}%</span>
    </div>
  );
}

function StreakChip({ streak = 0 }) {
  const mult = window.DG && window.DG.comboMultiplier ? window.DG.comboMultiplier(streak) : 1;
  return (
    <div className="ld-chip" title={`Constância: ${streak} dia${streak === 1 ? '' : 's'} útei${streak === 1 ? 'l' : 's'} seguidos${mult > 1 ? ` · Chama do Dragão ×${String(mult).replace('.', ',')}` : ''}`}
      style={{ borderColor: streak > 0 ? 'rgba(255,154,90,0.35)' : undefined, background: streak > 0 ? 'rgba(255,154,90,0.07)' : undefined }}>
      <span className={streak > 0 ? 'ld-flame' : ''} style={{ display: 'inline-flex' }}>
        <G name="flame" size={17} color={streak > 0 ? '#FF9A5A' : '#6E6784'} style={{ filter: streak > 0 ? 'drop-shadow(0 0 6px rgba(255,154,90,0.7))' : 'none' }} />
      </span>
      <span className="num" style={{ color: streak > 0 ? '#FFC39A' : '#9C95B4' }}>{streak}</span>
      {mult > 1 ? <span className="ld-combo">×{String(mult).replace('.', ',')}</span> : <small>DIAS</small>}
    </div>
  );
}

function GlobalHeader({ shared, mode, setMode, totalPct, onOpenSettings, onOpenLair, onOpenChest }) {
  const level = window.DA.getLevelInfo(shared.xp);
  return (
    <header className="header-sticky">
      <div className="ld-header-row" style={{
        maxWidth: 1400, margin: '0 auto',
        padding: '12px 28px',
        display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
      }}>
        <div className="ld-header-brand" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LogoMark size={40} title="Lendário" className="ld-float" />
          <Wordmark size={17} />
        </div>

        <div className="ld-header-progress" style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 170 }}>
          <ProgressSeal percent={totalPct} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
            <span style={{ fontFamily: 'var(--font-label)', fontSize: 9.5, letterSpacing: '0.24em', color: '#9C95B4', fontWeight: 700 }}>RUMO À POSSE</span>
            <span style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span className="font-display" style={{ fontSize: 20, fontWeight: 700, lineHeight: 1, color: level.tier.color }}>{level.tier.name}</span>
              <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>edital {totalPct.toFixed(0)}%</span>
            </span>
          </div>
        </div>

        <div className="mode-toggle" role="group" aria-label="Modo de estudo">
          <button className={mode === 'objetiva' ? 'active objetiva' : ''} onClick={() => setMode('objetiva')} aria-pressed={mode === 'objetiva'}>
            Objetiva
          </button>
          <button className={mode === 'discursiva' ? 'active discursiva' : ''} onClick={() => setMode('discursiva')} aria-pressed={mode === 'discursiva'}>
            Discursiva
          </button>
        </div>

        {window.LevelChip ? <LevelChip shared={shared} onClick={onOpenLair} /> : (
          <div className="ld-chip"><G name="spark" size={15} color="#E8C47A" /><span className="num" style={{ color: '#F7E2A8' }}>{shared.xp.toLocaleString('pt-BR')}</span><small>XP</small></div>
        )}
        {window.GemCounterChip && <GemCounterChip gems={shared.dragon ? shared.dragon.gems : 0} onClick={onOpenLair} />}
        {window.PendingChestChip && <PendingChestChip shared={shared} onOpen={onOpenChest} />}
        <StreakChip streak={shared.streak} />
        {window.SoundToggle && <SoundToggle />}
      </div>
    </header>
  );
}

window.GlobalHeader = GlobalHeader;
window.ProgressSeal = ProgressSeal;
