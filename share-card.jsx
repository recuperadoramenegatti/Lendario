// TOGA — Cartões compartilháveis (Instagram / TikTok / WhatsApp)
// Renderiza em <canvas> imagens 1080×1920 (Stories/Reels/TikTok) ou 1080×1350 (Feed),
// com céu arcano, círculo de runas, dragão do estudante (SVG serializado), medalha da
// conquista, estatísticas reais e legenda pronta com hashtags.

(function () {
  const { useState, useEffect, useRef, useMemo } = React;
  const GM = window.GM;

  function seeded(seed) {
    let a = seed % 2147483647; if (a <= 0) a += 2147483646;
    return () => { a = (a * 16807) % 2147483647; return (a - 1) / 2147483646; };
  }

  function wrapLines(ctx, text, maxW, maxLines) {
    const words = String(text || '').split(/\s+/);
    const lines = [];
    let cur = '';
    words.forEach(w => {
      const test = cur ? cur + ' ' + w : w;
      if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; }
      else cur = test;
    });
    if (cur) lines.push(cur);
    if (maxLines && lines.length > maxLines) {
      const keep = lines.slice(0, maxLines);
      keep[maxLines - 1] = keep[maxLines - 1].replace(/\s*\S*$/, '') + '…';
      return keep;
    }
    return lines;
  }

  function spacedText(ctx, text, cx, y, spacing) {
    const chars = [...text];
    const widths = chars.map(c => ctx.measureText(c).width);
    const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
    let x = cx - total / 2;
    const prevAlign = ctx.textAlign;
    ctx.textAlign = 'left';
    chars.forEach((c, i) => { ctx.fillText(c, x, y); x += widths[i] + spacing; });
    ctx.textAlign = prevAlign;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  async function svgToImage(svgEl) {
    const clone = svgEl.cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('viewBox', '-30 -30 300 310');
    clone.setAttribute('width', '1200');
    clone.setAttribute('height', String(Math.round(1200 * 310 / 300)));
    clone.removeAttribute('style');
    const xml = new XMLSerializer().serializeToString(clone);
    const img = new Image();
    img.decoding = 'async';
    await new Promise((res, rej) => {
      img.onload = res; img.onerror = rej;
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
    });
    return img;
  }

  function drawMedal(ctx, x, y, r, tier, icon) {
    const T = (GM.TIERS && GM.TIERS[tier]) || GM.TIERS.bronze;
    // fitas
    ctx.save();
    const rb = ctx.createLinearGradient(x - r, 0, x + r, 0);
    rb.addColorStop(0, T.ribbon[0]); rb.addColorStop(1, T.ribbon[1]);
    ctx.fillStyle = rb;
    [[-1], [1]].forEach(([s]) => {
      ctx.beginPath();
      ctx.moveTo(x + s * r * 0.32, y + r * 0.62);
      ctx.lineTo(x + s * r * 0.55, y + r * 1.42);
      ctx.lineTo(x + s * r * 0.36, y + r * 1.3);
      ctx.lineTo(x + s * r * 0.24, y + r * 1.46);
      ctx.lineTo(x + s * r * 0.06, y + r * 0.7);
      ctx.closePath(); ctx.fill();
    });
    // glow
    const gl = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 1.7);
    gl.addColorStop(0, T.glow + 'aa'); gl.addColorStop(1, T.glow + '00');
    ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(x, y, r * 1.7, 0, Math.PI * 2); ctx.fill();
    // aro recortado
    const rim = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
    rim.addColorStop(0, T.colors[0]); rim.addColorStop(0.45, T.colors[1]); rim.addColorStop(1, T.colors[2]);
    ctx.fillStyle = rim;
    ctx.beginPath();
    for (let i = 0; i < 48; i++) {
      const a = (i * Math.PI) / 24 - Math.PI / 2;
      const rr = i % 2 ? r * 0.93 : r;
      ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    ctx.closePath(); ctx.fill();
    ctx.lineWidth = r * 0.02; ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath(); ctx.arc(x, y, r * 0.85, 0, Math.PI * 2); ctx.stroke();
    // disco
    const inner = ctx.createRadialGradient(x - r * 0.25, y - r * 0.3, r * 0.05, x, y, r * 0.8);
    inner.addColorStop(0, '#4C2A9A'); inner.addColorStop(0.6, '#24105A'); inner.addColorStop(1, '#12082E');
    ctx.fillStyle = inner; ctx.beginPath(); ctx.arc(x, y, r * 0.8, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = r * 0.035; ctx.strokeStyle = T.colors[2]; ctx.stroke();
    ctx.setLineDash([r * 0.03, r * 0.06]); ctx.lineWidth = r * 0.015; ctx.strokeStyle = T.colors[1] + '88';
    ctx.beginPath(); ctx.arc(x, y, r * 0.7, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    // ícone
    ctx.font = `${Math.round(r * 0.72)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(255,255,255,0.4)'; ctx.shadowBlur = r * 0.12;
    ctx.fillStyle = '#fff';
    ctx.fillText(icon, x, y + r * 0.04);
    ctx.shadowBlur = 0;
    // brilho
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
    const sh = ctx.createLinearGradient(x - r, y - r, x + r * 0.2, y + r * 0.2);
    sh.addColorStop(0, 'rgba(255,255,255,0)'); sh.addColorStop(0.5, 'rgba(255,255,255,0.22)'); sh.addColorStop(0.56, 'rgba(255,255,255,0)');
    ctx.fillStyle = sh; ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.restore();
    ctx.restore();
  }

  function drawCard(ctx, W, H, d, dragonImg) {
    const story = H > 1500;
    const L = story
      ? { brand: 132, hero: 760, heroR: 360, eyebrow: 1215, title: 1310, titleSize: 92, desc: 1440, descSize: 40, stats: 1580, statH: 176, foot: 1830 }
      : { brand: 96, hero: 468, heroR: 250, eyebrow: 800, title: 878, titleSize: 76, desc: 980, descSize: 34, stats: 1068, statH: 150, foot: 1286 };
    const cx = W / 2;

    // Fundo
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#0D0624'); bg.addColorStop(0.45, '#221048'); bg.addColorStop(1, '#07031A');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    const neb = (x, y, r, c) => { const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };
    neb(W * 0.15, H * 0.2, W * 0.85, 'rgba(124,58,237,0.42)');
    neb(W * 0.95, H * 0.55, W * 0.7, 'rgba(8,145,178,0.26)');
    neb(W * 0.5, H * 1.02, W * 0.8, d.accent + '40');

    // Estrelas
    const rnd = seeded(1337 + (d.title || '').length * 97);
    for (let i = 0; i < 260; i++) {
      const x = rnd() * W, y = rnd() * H, s = rnd() * 2.4 + 0.4;
      ctx.globalAlpha = 0.25 + rnd() * 0.7;
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fill();
      if (s > 2.4) {
        ctx.globalAlpha *= 0.6; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x - s * 4, y); ctx.lineTo(x + s * 4, y); ctx.moveTo(x, y - s * 4); ctx.lineTo(x, y + s * 4); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;

    // Marca
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `700 ${story ? 58 : 48}px "Space Grotesk", sans-serif`;
    const wm = ctx.createLinearGradient(cx - 160, 0, cx + 160, 0);
    wm.addColorStop(0, '#FDE68A'); wm.addColorStop(0.5, '#FFFFFF'); wm.addColorStop(1, '#C4B5FD');
    ctx.fillStyle = wm;
    spacedText(ctx, '✦ TOGA ✦', cx, L.brand, 14);
    ctx.font = `600 ${story ? 24 : 20}px "JetBrains Mono", monospace`;
    ctx.fillStyle = 'rgba(221,214,254,0.6)';
    spacedText(ctx, d.brandLine, cx, L.brand + (story ? 56 : 46), 5);

    // Herói: brilho + círculo de runas
    const hg = ctx.createRadialGradient(cx, L.hero, 0, cx, L.hero, L.heroR * 1.35);
    hg.addColorStop(0, d.accent + '88'); hg.addColorStop(0.5, d.accent + '22'); hg.addColorStop(1, d.accent + '00');
    ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(cx, L.hero, L.heroR * 1.35, 0, Math.PI * 2); ctx.fill();
    ctx.save();
    ctx.strokeStyle = 'rgba(196,181,253,0.38)'; ctx.lineWidth = 3; ctx.setLineDash([6, 16]);
    ctx.beginPath(); ctx.arc(cx, L.hero, L.heroR, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]); ctx.strokeStyle = 'rgba(196,181,253,0.16)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, L.hero, L.heroR * 0.88, 0, Math.PI * 2); ctx.stroke();
    ctx.font = `700 ${Math.round(L.heroR * 0.1)}px "Space Grotesk", serif`;
    ctx.fillStyle = 'rgba(196,181,253,0.55)';
    const glyphs = ['ᚨ', '✦', 'ᛟ', '§', 'ᚱ', '⚖', 'ᛉ', '✧', 'ᚹ', '∞', 'ᛞ', '☽'];
    glyphs.forEach((g, i) => {
      const a = (i / glyphs.length) * Math.PI * 2 - Math.PI / 2;
      ctx.fillText(g, cx + Math.cos(a) * L.heroR * 1.09, L.hero + Math.sin(a) * L.heroR * 1.09);
    });
    ctx.restore();

    if (d.kind === 'achievement') {
      drawMedal(ctx, cx, L.hero - L.heroR * 0.1, L.heroR * 0.62, d.tier, d.icon);
      if (dragonImg) {
        const w = L.heroR * 1.3, h = w * dragonImg.height / dragonImg.width;
        ctx.drawImage(dragonImg, cx + L.heroR * 0.22, L.hero + L.heroR * 1.02 - h * 0.92, w, h);
      }
    } else if (dragonImg) {
      const w = L.heroR * 2.7, h = w * dragonImg.height / dragonImg.width;
      ctx.drawImage(dragonImg, cx - w / 2, L.hero - h / 2 - L.heroR * 0.08, w, h);
    }

    // Textos
    ctx.textAlign = 'center';
    ctx.font = `700 ${story ? 30 : 26}px "JetBrains Mono", monospace`;
    ctx.fillStyle = d.accent;
    ctx.shadowColor = d.accent; ctx.shadowBlur = 18;
    spacedText(ctx, d.eyebrow, cx, L.eyebrow, 6);
    ctx.shadowBlur = 0;

    ctx.font = `700 ${L.titleSize}px "Space Grotesk", sans-serif`;
    const tLines = wrapLines(ctx, d.title, W - 160, 2);
    const tg = ctx.createLinearGradient(0, L.title - L.titleSize, 0, L.title + L.titleSize * tLines.length);
    tg.addColorStop(0, '#FFFFFF'); tg.addColorStop(1, '#DDD6FE');
    ctx.fillStyle = tg;
    ctx.shadowColor = d.accent + 'aa'; ctx.shadowBlur = 36;
    tLines.forEach((ln, i) => ctx.fillText(ln, cx, L.title + i * L.titleSize * 1.05));
    ctx.shadowBlur = 0;
    const tExtra = (tLines.length - 1) * L.titleSize * 1.05;

    ctx.font = `500 ${L.descSize}px Inter, sans-serif`;
    ctx.fillStyle = 'rgba(233,225,255,0.82)';
    wrapLines(ctx, d.desc, W - 220, 2).forEach((ln, i) => ctx.fillText(ln, cx, L.desc + tExtra * 0.6 + i * L.descSize * 1.35));

    // Estatísticas
    const gap = 26, pad = 70;
    const cw = (W - pad * 2 - gap * 2) / 3;
    d.stats.forEach((s, i) => {
      const x = pad + i * (cw + gap), y = L.stats + tExtra * 0.4;
      roundRect(ctx, x, y, cw, L.statH, 30);
      const cg = ctx.createLinearGradient(x, y, x, y + L.statH);
      cg.addColorStop(0, 'rgba(255,255,255,0.1)'); cg.addColorStop(1, 'rgba(255,255,255,0.03)');
      ctx.fillStyle = cg; ctx.fill();
      ctx.strokeStyle = 'rgba(196,181,253,0.3)'; ctx.lineWidth = 2; ctx.stroke();
      ctx.textAlign = 'center';
      ctx.font = `${story ? 36 : 30}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
      ctx.fillStyle = '#fff';
      ctx.fillText(s.icon, x + cw / 2, y + L.statH * 0.24);
      ctx.font = `700 ${story ? 54 : 46}px "Space Grotesk", sans-serif`;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(s.value, x + cw / 2, y + L.statH * 0.55);
      ctx.font = `600 ${story ? 20 : 17}px "JetBrains Mono", monospace`;
      ctx.fillStyle = 'rgba(221,214,254,0.65)';
      spacedText(ctx, s.label, x + cw / 2, y + L.statH * 0.82, 2);
    });

    // Rodapé
    ctx.font = `600 ${story ? 30 : 26}px Inter, sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillText(d.footer, cx, L.foot);
    ctx.font = `500 ${story ? 22 : 19}px "JetBrains Mono", monospace`;
    ctx.fillStyle = 'rgba(196,181,253,0.6)';
    ctx.fillText('#concurseiro  #estudos  #foconaaprovação  #TOGA', cx, L.foot + (story ? 44 : 36));
  }

  function buildShare(kind, payload, shared) {
    const logs = shared.dailyLogs || [];
    const hours = logs.reduce((a, l) => a + (l.hours || 0), 0);
    const questions = logs.reduce((a, l) => a + (l.questions || 0), 0);
    const lv = GM.levelInfo(shared.xp);
    const drg = shared.dragon || {};
    const name = drg.name || 'Lumi';
    const stage = kind === 'evolution' ? payload.stage : GM.stageFromXp(shared.xp);
    const st = window.DRAGON_STAGES[stage - 1];
    const streak = Math.max(shared.streak || 0, 0);
    const unlockedCount = (shared.unlocked || []).length + ((shared.blindado && shared.blindado.achievements) || []).length;
    const dateStr = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '').toUpperCase();
    const hStr = hours >= 100 ? Math.round(hours) + 'h' : hours.toFixed(1).replace('.', ',') + 'h';
    const base = {
      kind, stage, name,
      brandLine: `JORNADA DE ESTUDOS · ${dateStr}`,
      footer: `Estudando com ${name} · Nível ${lv.level} · ${st.name}`,
    };
    if (kind === 'achievement') {
      const a = payload.ach;
      const T = GM.TIERS[a.tier];
      return {
        ...base, tier: a.tier, icon: a.icon, accent: T.glow,
        eyebrow: `✦ CONQUISTA ${T.name.toUpperCase()} ✦`, title: a.title, desc: a.desc,
        stats: [
          { icon: '🔥', value: `${streak}`, label: 'DIAS SEGUIDOS' },
          { icon: '⏳', value: hStr, label: 'DE ESTUDO' },
          { icon: '🏅', value: `${unlockedCount}`, label: 'CONQUISTAS' },
        ],
        caption: `Desbloqueei "${a.title}" (${T.name}) no TOGA! 🐉✨ ${streak} dias de constância e ${hStr} de estudo. Bora junto? #concurseiro #estudos #foconaaprovação #TOGA`,
      };
    }
    if (kind === 'evolution') {
      return {
        ...base, accent: '#C4B5FD',
        eyebrow: '✦ MEU DRAGÃO EVOLUIU ✦', title: st.name, desc: st.desc,
        stats: [
          { icon: '⚡', value: `Nv ${lv.level}`, label: 'NÍVEL' },
          { icon: '⏳', value: hStr, label: 'DE ESTUDO' },
          { icon: '🎯', value: questions.toLocaleString('pt-BR'), label: 'QUESTÕES' },
        ],
        caption: `${name} evoluiu para ${st.name}! 🐉✨ Cada hora de estudo alimenta meu dragão no TOGA. #concurseiro #estudos #foconaaprovação #TOGA`,
      };
    }
    return {
      ...base, accent: '#A78BFA',
      eyebrow: '✦ MINHA JORNADA DE ESTUDOS ✦', title: name, desc: `${st.name} · Fase ${stage}/8 · Nível ${lv.level}`,
      stats: [
        { icon: '🔥', value: `${streak}`, label: 'DIAS SEGUIDOS' },
        { icon: '⏳', value: hStr, label: 'DE ESTUDO' },
        { icon: '🎯', value: questions.toLocaleString('pt-BR'), label: 'QUESTÕES' },
      ],
      caption: `Meu dragão ${name} (${st.name}, nível ${lv.level}) e eu seguimos firmes: ${streak} dias de constância e ${hStr} de estudo! 🐉📚 #concurseiro #estudos #foconaaprovação #TOGA`,
    };
  }

  function ShareModal({ kind, payload, shared, onClose }) {
    const [format, setFormat] = useState('story');
    const [url, setUrl] = useState(null);
    const [blob, setBlob] = useState(null);
    const [busy, setBusy] = useState(true);
    const [note, setNote] = useState('');
    const svgRef = useRef(null);
    const drg = shared.dragon || {};
    const data = useMemo(() => buildShare(kind, payload || {}, shared), [kind, payload, shared.xp, shared.streak, shared.dragon]);
    const exportStage = Math.max(1, data.stage);

    useEffect(() => { window.SFX && window.SFX.pop(); }, []);
    useEffect(() => {
      let cancelled = false;
      setBusy(true);
      (async () => {
        try {
          if (document.fonts && document.fonts.load) {
            await Promise.all([
              document.fonts.load('700 64px "Space Grotesk"'),
              document.fonts.load('600 24px "JetBrains Mono"'),
              document.fonts.load('500 32px Inter'),
            ]).catch(() => {});
          }
          const img = svgRef.current ? await svgToImage(svgRef.current).catch(() => null) : null;
          const W = 1080, H = format === 'story' ? 1920 : 1350;
          const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
          drawCard(cv.getContext('2d'), W, H, data, img);
          cv.toBlob(b => {
            if (cancelled || !b) return;
            setBlob(b);
            setUrl(prev => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(b); });
            setBusy(false);
          }, 'image/png');
        } catch (e) { console.error('[share-card]', e); setBusy(false); }
      })();
      return () => { cancelled = true; };
    }, [format, data]);
    useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, []);

    const filename = `toga-${kind}-${format === 'story' ? 'stories' : 'feed'}.png`;
    const download = () => {
      if (!url) return;
      const a = document.createElement('a'); a.href = url; a.download = filename;
      document.body.appendChild(a); a.click(); a.remove();
      window.SFX && window.SFX.check();
      setNote('Imagem salva! Agora é só postar ✨');
    };
    const copyCaption = async () => {
      try { await navigator.clipboard.writeText(data.caption); setNote('Legenda copiada 📋'); window.SFX && window.SFX.tap(); }
      catch (e) { setNote('Não consegui copiar — selecione a legenda manualmente.'); }
    };
    const share = async () => {
      if (!blob) return;
      const file = new File([blob], filename, { type: 'image/png' });
      try {
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'TOGA', text: data.caption });
          window.SFX && window.SFX.gem();
          setNote('Compartilhado! 🐉');
          return;
        }
      } catch (e) { if (e && e.name === 'AbortError') return; }
      download();
      copyCaption();
      setNote('Imagem salva e legenda copiada — cole no Instagram ou TikTok ✨');
    };

    return (
      <div className="arc-overlay" onClick={onClose}>
        <div className="share-modal arc-card" onClick={e => e.stopPropagation()}>
          <button className="arc-close" onClick={onClose} aria-label="Fechar">×</button>
          <div className="share-preview">
            <div className={`share-phone ${format}`}>
              {url && <img src={url} alt="Prévia do cartão para compartilhar" />}
              {busy && <div className="share-busy"><span className="share-spinner" />Pintando seu cartão mágico…</div>}
            </div>
          </div>
          <div className="share-side">
            <div className="arc-eyebrow">COMPARTILHAR</div>
            <div className="share-title">Mostre sua jornada ✨</div>
            <div className="share-sub">Um cartão lindo, pronto para Stories, Reels, TikTok ou feed. Inspire seus amigos a estudarem também.</div>
            <div className="share-formats">
              <button className={format === 'story' ? 'is-active' : ''} onClick={() => setFormat('story')}>
                <span className="fmt-icon fmt-story" /> Stories · TikTok <small>9:16</small>
              </button>
              <button className={format === 'feed' ? 'is-active' : ''} onClick={() => setFormat('feed')}>
                <span className="fmt-icon fmt-feed" /> Feed <small>4:5</small>
              </button>
            </div>
            <div className="share-actions">
              <button className="arc-btn arc-btn-primary" disabled={busy} onClick={share}>📲 Compartilhar</button>
              <button className="arc-btn arc-btn-ghost" disabled={busy} onClick={download}>⬇️ Baixar PNG</button>
            </div>
            <div className="share-caption">
              <div className="share-caption-head"><span>Legenda sugerida</span><button onClick={copyCaption}>Copiar</button></div>
              <p>{data.caption}</p>
            </div>
            {note && <div className="share-note" key={note}>{note}</div>}
          </div>
          <div className="share-offscreen" aria-hidden="true">
            {window.DragonSVG && <window.DragonSVG svgRef={svgRef} stage={exportStage} mood="radiant" skin={drg.skin} hat={drg.hat} face={drg.face} neck={drg.neck} flame={1} size={240} animated={false} exportMode />}
          </div>
        </div>
      </div>
    );
  }

  window.ShareModal = ShareModal;
  window.drawShareCard = drawCard;
})();
