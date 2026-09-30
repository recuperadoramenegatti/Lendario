// TOGA — Cards compartilháveis (Instagram / TikTok)
// Gera uma imagem PNG em canvas: Stories (1080×1920) ou Post (1080×1350).
// Tipos: conquista, evolução do dragão, perfil do dragão e constância.
// O dragão é o próprio SVG do app, serializado e desenhado no canvas.

(function () {
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  const THEMES = {
    bronze:    ['#1C0F05', '#6B3A12', '#D08A45'],
    prata:     ['#0B1220', '#334155', '#94A3B8'],
    ouro:      ['#1F1000', '#8A4B00', '#F59E0B'],
    lendario:  ['#12052E', '#5B21B6', '#DB2777'],
    evolution: ['#0B0626', '#3B1F9E', '#A855F7'],
    profile:   ['#0B0626', '#312E81', '#7C5CFF'],
    streak:    ['#1A0500', '#9A3412', '#F59E0B'],
  };

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function wrapText(ctx, text, x, y, maxW, lineH, maxLines = 3) {
    const words = String(text).split(' ');
    let line = '', lines = [];
    words.forEach(w => {
      const test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test;
    });
    if (line) lines.push(line);
    lines = lines.slice(0, maxLines);
    lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineH));
    return lines.length * lineH;
  }
  function font(weight, size, fam = 'Space Grotesk') { return `${weight} ${Math.round(size)}px "${fam}", Inter, system-ui, sans-serif`; }

  function drawBackground(ctx, W, H, theme, seed) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, theme[0]); g.addColorStop(0.55, theme[1]); g.addColorStop(1, theme[2]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // nebulosas
    [[0.2, 0.25, theme[2]], [0.85, 0.55, theme[1]], [0.5, 0.9, '#FFFFFF']].forEach(([x, y, c], i) => {
      const r = ctx.createRadialGradient(W * x, H * y, 0, W * x, H * y, W * (0.55 - i * 0.1));
      r.addColorStop(0, c + (i === 2 ? '22' : '66')); r.addColorStop(1, c + '00');
      ctx.fillStyle = r; ctx.fillRect(0, 0, W, H);
    });
    // estrelas
    const rnd = mulberry32(seed);
    for (let i = 0; i < 170; i++) {
      const x = rnd() * W, y = rnd() * H, s = rnd() * 2.6 + 0.6;
      ctx.globalAlpha = 0.25 + rnd() * 0.75;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fill();
      if (s > 2.8) { ctx.fillRect(x - s * 3, y - 0.5, s * 6, 1); ctx.fillRect(x - 0.5, y - s * 3, 1, s * 6); }
    }
    ctx.globalAlpha = 1;
  }
  function drawRays(ctx, cx, cy, radius, color) {
    ctx.save(); ctx.translate(cx, cy);
    for (let i = 0; i < 20; i++) {
      ctx.rotate((Math.PI * 2) / 20);
      const g = ctx.createLinearGradient(0, 0, 0, -radius);
      g.addColorStop(0, color + '55'); g.addColorStop(1, color + '00');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-radius * 0.09, -radius); ctx.lineTo(radius * 0.09, -radius); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 0.6);
    halo.addColorStop(0, color + '88'); halo.addColorStop(1, color + '00');
    ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(cx, cy, radius * 0.6, 0, Math.PI * 2); ctx.fill();
  }
  function drawPill(ctx, cx, y, text, bg, fg, size = 30) {
    ctx.font = font(800, size, 'JetBrains Mono');
    const w = ctx.measureText(text).width + size * 1.6, h = size * 1.9;
    roundRect(ctx, cx - w / 2, y - h / 2, w, h, h / 2);
    ctx.fillStyle = bg; ctx.fill();
    ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, cx, y + 1);
  }
  function drawBadge(ctx, cx, cy, r, ach) {
    const t = window.DG.TIERS[ach.tier];
    ctx.save();
    ctx.shadowColor = t.glow; ctx.shadowBlur = r * 0.6;
    if (ach.tier === 'lendario' && ctx.createConicGradient) {
      const cg = ctx.createConicGradient(0, cx, cy);
      ['#F472B6', '#FBBF24', '#34D399', '#38BDF8', '#A78BFA', '#F472B6'].forEach((c, i) => cg.addColorStop(i / 5, c));
      ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(cx, cy, r * 1.12, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = t.ring; ctx.beginPath(); ctx.arc(cx, cy, r * 1.05, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.4, r * 0.05, cx, cy, r);
    g.addColorStop(0, '#FFFFFF'); g.addColorStop(0.3, t.c1); g.addColorStop(1, t.c2);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    // brilho
    ctx.globalAlpha = 0.35; ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.ellipse(cx - r * 0.3, cy - r * 0.5, r * 0.45, r * 0.18, -0.5, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.font = `${Math.round(r * 0.95)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(ach.icon, cx, cy + r * 0.06);
    // fita
    ctx.fillStyle = t.ring;
    ctx.beginPath(); ctx.moveTo(cx - r * 0.55, cy + r * 0.8); ctx.lineTo(cx - r * 0.75, cy + r * 1.45); ctx.lineTo(cx - r * 0.5, cy + r * 1.32); ctx.lineTo(cx - r * 0.35, cy + r * 1.55); ctx.lineTo(cx - r * 0.2, cy + r * 0.95); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx + r * 0.55, cy + r * 0.8); ctx.lineTo(cx + r * 0.75, cy + r * 1.45); ctx.lineTo(cx + r * 0.5, cy + r * 1.32); ctx.lineTo(cx + r * 0.35, cy + r * 1.55); ctx.lineTo(cx + r * 0.2, cy + r * 0.95); ctx.fill();
    ctx.restore();
  }
  function drawStatChips(ctx, W, y, items, scale = 1) {
    const cols = items.length > 2 ? 2 : items.length;
    const gap = 24 * scale, pad = 90;
    const w = (W - pad * 2 - gap * (cols - 1)) / cols, h = 150 * scale;
    items.forEach((it, i) => {
      const c = i % cols, r = Math.floor(i / cols);
      const x = pad + c * (w + gap), yy = y + r * (h + gap);
      roundRect(ctx, x, yy, w, h, 30 * scale);
      ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 2; ctx.stroke();
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#FFFFFF'; ctx.font = font(800, 58 * scale);
      ctx.fillText(it.value, x + 32 * scale, yy + 78 * scale);
      ctx.fillStyle = 'rgba(255,255,255,0.72)'; ctx.font = font(700, 25 * scale, 'Inter');
      ctx.fillText(it.label, x + 32 * scale, yy + 118 * scale);
    });
    return Math.ceil(items.length / cols) * (h + gap);
  }
  function loadSvgImage(svgEl) {
    return new Promise((resolve) => {
      if (!svgEl) return resolve(null);
      const clone = svgEl.cloneNode(true);
      clone.setAttribute('viewBox', '-24 -24 288 288');
      clone.setAttribute('width', '1000'); clone.setAttribute('height', '1000');
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clone.removeAttribute('style');
      const xml = new XMLSerializer().serializeToString(clone);
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
    });
  }

  async function renderCard({ kind, format, shared, objState, discState, achId, stage, svgEl }) {
    const DG = window.DG;
    try { await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 800))]); } catch (e) {}
    const W = 1080, H = format === 'post' ? 1350 : 1920;
    const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    const d = DG.ensure(shared);
    const evo = window.evaluateDragon(shared.xp);
    const ach = achId ? DG.achById(achId) : null;
    const snap = DG.achievementSnapshot(shared, objState, discState);
    const achCount = Object.keys(d.achievements || {}).length;
    const themeKey = kind === 'achievement' && ach ? ach.tier : kind;
    const theme = THEMES[themeKey] || THEMES.profile;
    const accent = kind === 'achievement' && ach ? DG.TIERS[ach.tier].c1 : kind === 'streak' ? '#FCD34D' : '#C4B5FD';
    drawBackground(ctx, W, H, theme, 7 + (achId ? achId.length * 13 : 0) + (stage || 0));
    const img = await loadSvgImage(svgEl);
    const post = format === 'post';
    const L = post ? {
      logo: 96, pill: 160, tag: 26, logoSize: 44,
      ach: { y: 390, r: 138, rays: 380, tier: 636, name: 718, nameSize: 70, desc: 32, dS: 330 },
      streak: { flame: 400, flameSize: 160, num: 640, numSize: 220, label: 712, rec: 760, dS: 380 },
      evo: { y: 460, s: 620, fase: 815, name: 895, nameSize: 80, desc: 950, chips: 1040, chipK: 0.8 },
      prof: { y: 425, s: 540, fase: 728, name: 818, nameSize: 84, stage: 866, chips: 900, chipK: 0.8 },
      foot1: H - 78, foot2: H - 38, footSize: 28,
    } : {
      logo: 140, pill: 215, tag: 30, logoSize: 56,
      ach: { y: 560, r: 190, rays: 520, tier: 910, name: 1012, nameSize: 88, desc: 38, dS: 600 },
      streak: { flame: 560, flameSize: 230, num: 900, numSize: 300, label: 990, rec: 1050, dS: 620 },
      evo: { y: 700, s: 880, fase: 1190, name: 1292, nameSize: 96, desc: 1365, chips: 1500 },
      prof: { y: 650, s: 780, fase: 1085, name: 1182, nameSize: 104, stage: 1244, chips: 1300, chipK: 1 },
      foot1: H - 112, foot2: H - 64, footSize: 32,
    };
    const emojiFont = (px) => `${Math.round(px)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
    const fmtH = (h) => h >= 100 ? Math.round(h) + 'h' : (Math.round(h * 10) / 10).toString().replace('.', ',') + 'h';
    const drawDragon = (size, bottomY, cx = W / 2) => { if (img) ctx.drawImage(img, cx - size / 2, bottomY - size, size, size); };

    // Topo
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#FFFFFF'; ctx.font = font(800, L.logoSize);
    ctx.fillText('⚖️ TOGA', W / 2, L.logo);
    const label = { achievement: '✦ CONQUISTA DESBLOQUEADA ✦', evolution: '✦ MEU DRAGÃO EVOLUIU ✦', profile: '✦ MEU DRAGÃO DE ESTUDOS ✦', streak: '✦ CHAMA DA CONSTÂNCIA ✦' }[kind];
    drawPill(ctx, W / 2, L.pill, label, 'rgba(255,255,255,0.14)', accent, L.tag);
    ctx.textBaseline = 'alphabetic';

    if (kind === 'achievement' && ach) {
      const A = L.ach;
      drawRays(ctx, W / 2, A.y, A.rays, accent);
      drawBadge(ctx, W / 2, A.y, A.r, ach);
      ctx.textAlign = 'center';
      ctx.fillStyle = accent; ctx.font = font(800, A.nameSize * 0.36, 'JetBrains Mono');
      ctx.fillText(DG.TIERS[ach.tier].label, W / 2, A.tier);
      ctx.fillStyle = '#FFFFFF'; ctx.font = font(800, A.nameSize);
      const nh = wrapText(ctx, ach.name, W / 2, A.name, W - 140, A.nameSize * 1.05, 2);
      ctx.fillStyle = 'rgba(255,255,255,0.82)'; ctx.font = font(600, A.desc, 'Inter');
      wrapText(ctx, ach.desc, W / 2, A.name + nh - A.nameSize * 1.05 + A.desc * 1.9, W - 200, A.desc * 1.3, 2);
      drawDragon(A.dS, L.foot1 - L.footSize * 1.6);
    } else if (kind === 'streak') {
      const S = L.streak, streak = shared.streak || 0;
      drawRays(ctx, W / 2, S.flame - S.flameSize * 0.35, S.flameSize * 2.3, '#FDBA74');
      ctx.textAlign = 'center';
      ctx.font = emojiFont(S.flameSize);
      ctx.fillText('🔥', W / 2, S.flame);
      ctx.fillStyle = '#FFFFFF'; ctx.font = font(800, S.numSize);
      ctx.shadowColor = '#F97316'; ctx.shadowBlur = 50;
      ctx.fillText(String(streak), W / 2, S.num);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#FDE68A'; ctx.font = font(800, S.numSize * 0.16);
      ctx.fillText(streak === 1 ? 'DIA DE CONSTÂNCIA' : 'DIAS DE CONSTÂNCIA', W / 2, S.label);
      ctx.fillStyle = 'rgba(255,255,255,0.78)'; ctx.font = font(600, S.numSize * 0.115, 'Inter');
      ctx.fillText(`Recorde: ${Math.max(shared.bestStreak || 0, streak)} dias · Chama x${DG.comboMultiplier(streak)}`, W / 2, S.rec);
      drawDragon(S.dS, L.foot1 - L.footSize * 1.6);
    } else {
      const isEvo = kind === 'evolution';
      const st = window.DRAGON_STAGES[(isEvo ? stage : evo.stage.id) - 1] || evo.stage;
      const P = isEvo ? L.evo : L.prof;
      drawRays(ctx, W / 2, P.y, P.s * 0.66, st.pal.glow);
      drawDragon(P.s, P.y + P.s * 0.5);
      ctx.textAlign = 'center';
      ctx.fillStyle = accent; ctx.font = font(800, P.nameSize * 0.32, 'JetBrains Mono');
      ctx.fillText(`FASE ${st.id} / 8`, W / 2, P.fase);
      ctx.fillStyle = '#FFFFFF'; ctx.font = font(800, P.nameSize);
      ctx.shadowColor = st.pal.glow; ctx.shadowBlur = 30;
      ctx.fillText(isEvo ? st.name : d.name, W / 2, P.name);
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255,255,255,0.82)'; ctx.font = font(600, P.nameSize * 0.37, 'Inter');
      if (isEvo) wrapText(ctx, st.desc, W / 2, P.desc, W - 180, P.nameSize * 0.48, 2);
      else ctx.fillText(st.name, W / 2, P.stage);
      const chips = [
        { value: `${shared.streak || 0} 🔥`, label: 'dias de constância' },
        { value: fmtH(snap.totalHours), label: 'horas estudadas' },
        { value: snap.totalQuestions.toLocaleString('pt-BR'), label: 'questões resolvidas' },
        { value: `${achCount} 🏆`, label: 'conquistas' },
      ];
      if (!isEvo) drawStatChips(ctx, W, P.chips, chips, P.chipK);
      else if (P.chips) drawStatChips(ctx, W, P.chips, chips.slice(0, 2), P.chipK || 1);
    }

    // Rodapé
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.font = font(700, L.footSize, 'Inter');
    ctx.fillText(`${d.name} & eu · rumo à aprovação 🐉`, W / 2, L.foot1);
    ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.font = font(600, L.footSize * 0.75, 'JetBrains Mono');
    ctx.fillText(`${new Date().toLocaleDateString('pt-BR')} · #TOGA #concurseiro`, W / 2, L.foot2);
    return canvas;
  }

  function dataUrlToBlob(dataUrl) {
    const [head, b64] = dataUrl.split(',');
    const mime = (head.match(/data:([^;]+)/) || [])[1] || 'image/png';
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: mime });
  }

  function captionFor(kind, { shared, ach, stage }) {
    const d = window.DG.ensure(shared);
    const st = window.DRAGON_STAGES[(stage || window.getDragonStage(shared.xp)) - 1];
    if (kind === 'achievement' && ach) return `🏆 Conquista desbloqueada: "${ach.name}" — ${ach.desc}! O ${d.name}, meu dragão de estudos, tá orgulhoso 🐉✨\n\n#concursos #concurseiro #estudos #foco #TOGA`;
    if (kind === 'evolution') return `🐉 Meu dragão ${d.name} evoluiu para ${st.name}! Cada hora de estudo alimenta a magia ✨\n\n#concurseiro #estudos #constancia #TOGA`;
    if (kind === 'streak') return `🔥 ${shared.streak || 0} dias seguidos estudando! A chama não apaga.\n\n#constancia #concurseiro #rumoaposse #TOGA`;
    return `Esse é o ${d.name}, meu dragão de estudos 🐉 ${shared.streak || 0} dias de constância e contando!\n\n#concurseiro #estudos #TOGA`;
  }

  function ShareCardModal({ request, shared, objState, discState, onClose }) {
    const [format, setFormat] = React.useState('story');
    const [url, setUrl] = React.useState(null);
    const [busy, setBusy] = React.useState(true);
    const [note, setNote] = React.useState(null);
    const blobRef = React.useRef(null);
    const svgRef = React.useRef(null);
    const d = window.DG.ensure(shared);
    const stage = request.kind === 'evolution' ? request.stage : window.getDragonStage(shared.xp);
    const ach = request.achId ? window.DG.achById(request.achId) : null;
    const caption = captionFor(request.kind, { shared, ach, stage });

    React.useEffect(() => { window.SFX && window.SFX.whoosh(); }, []);
    React.useEffect(() => {
      let alive = true;
      setBusy(true);
      const t = setTimeout(async () => {
        try {
          const canvas = await renderCard({ ...request, format, shared, objState, discState, stage, svgEl: svgRef.current });
          if (!alive) return;
          // toDataURL é síncrono e confiável (toBlob pode não disparar com a página ocupada)
          const dataUrl = canvas.toDataURL('image/png');
          blobRef.current = dataUrlToBlob(dataUrl);
          setUrl(dataUrl);
        } catch (e) {
          if (alive) setNote('Não foi possível gerar a imagem 😕');
        }
        if (alive) setBusy(false);
      }, 60);
      return () => { alive = false; clearTimeout(t); };
    }, [format]);

    const fileName = `toga-${request.kind}-${new Date().toISOString().slice(0, 10)}.png`;
    const download = () => {
      if (!url) return;
      const a = document.createElement('a'); a.href = url; a.download = fileName;
      document.body.appendChild(a); a.click(); a.remove();
      window.SFX && window.SFX.sparkle();
      setNote('Imagem salva! Agora é só postar nos Stories ou no TikTok ✨');
    };
    const share = async () => {
      const blob = blobRef.current; if (!blob) return;
      const file = new File([blob], fileName, { type: 'image/png' });
      try {
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'TOGA', text: caption });
          window.SFX && window.SFX.sparkle();
          return;
        }
      } catch (e) { if (e && e.name === 'AbortError') return; }
      download();
    };
    const copy = async () => {
      try { await navigator.clipboard.writeText(caption); setNote('Legenda copiada! 📋'); window.SFX && window.SFX.pop(); }
      catch (e) { setNote('Não foi possível copiar automaticamente.'); }
    };

    return (
      <div className="cel-overlay" onClick={onClose} style={{ zIndex: 300 }}>
        <div style={{ position: 'absolute', left: -99999, top: 0, width: 10, height: 10, overflow: 'hidden' }} aria-hidden="true">
          <window.DragonSprite stage={stage} mood="excited" equipped={{ ...d.equipped, bg: undefined }} size={600} animate={false} svgRef={svgRef} />
        </div>
        <div onClick={(e) => e.stopPropagation()} style={{ width: 'min(440px, 100%)', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'stretch', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: '#FFF', fontWeight: 800, fontSize: 15, fontFamily: 'Space Grotesk, sans-serif' }}>📸 Compartilhar</div>
            <button onClick={onClose} className="dg-btn" style={{ padding: '4px 10px' }}>✕</button>
          </div>
          <div className="dg-tabs" style={{ justifyContent: 'center' }}>
            {[['story', 'Stories · TikTok (9:16)'], ['post', 'Feed (4:5)']].map(([id, lbl]) => (
              <button key={id} className={`dg-tab ${format === id ? 'active' : ''}`} onClick={() => setFormat(id)}>{lbl}</button>
            ))}
          </div>
          <div style={{ minHeight: 300, display: 'grid', placeItems: 'center' }}>
            {busy || !url ? (
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>✨ Pintando seu card…</div>
            ) : (
              <img src={url} alt="Card para compartilhar" className="share-preview cel-pop" />
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button className="dg-btn dg-btn-gold" style={{ justifyContent: 'center', padding: '12px' }} onClick={share} disabled={busy}>📤 Compartilhar</button>
            <button className="dg-btn" style={{ justifyContent: 'center', padding: '12px' }} onClick={download} disabled={busy}>⬇️ Baixar PNG</button>
          </div>
          <button className="dg-btn" style={{ justifyContent: 'center' }} onClick={copy}>📋 Copiar legenda com hashtags</button>
          {note && <div style={{ color: '#FDE68A', fontSize: 12, textAlign: 'center', fontWeight: 700 }}>{note}</div>}
        </div>
      </div>
    );
  }

  window.ShareCardModal = ShareCardModal;
  window.renderShareCard = renderCard;
})();
