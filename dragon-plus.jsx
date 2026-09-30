// TOGA — Dragão+ (camada de recompensas extras sobre o motor do dragão)
// Complementa dragon-game.jsx / dragon-ui.jsx sem substituí-los:
// • Níveis contínuos (vitórias frequentes) + banner de "subiu de nível" (+5 💎 por nível)
// • "Insight Crítico": 12% de chance de XP em dobro ao registrar uma sessão
// • Baús de Sabedoria: 30% de chance após sessões de 25+ min, abertos com 3 toques
// • Toast de recompensa com o detalhamento (base, Chama do Dragão, crítico, cristais)
// • Motor de partículas em <canvas> por trás da mesma API window.FX / spawnConfetti
// • Medalhas recortadas com fitas no lugar dos emblemas redondos
// • Peles (skins) de cor para o dragão na loja
// • Sons extras (nível, crítico, baú) sobre o SFX existente

(function () {
  const { useState, useEffect, useRef } = React;
  const DG = window.DG;

  // ════════════════════════════════════════════════════════════
  //  NÍVEIS
  // ════════════════════════════════════════════════════════════
  const LEVEL_GEMS = 5;
  function levelInfo(xp) {
    const x = Math.max(0, xp || 0);
    const level = Math.floor((25 + Math.sqrt(625 + 100 * x)) / 50);
    const cur = 25 * (level - 1) * level;
    const next = 25 * level * (level + 1);
    return { level, cur, next, into: x - cur, need: next - cur, progress: (x - cur) / (next - cur) };
  }

  // ════════════════════════════════════════════════════════════
  //  SONS EXTRAS (roteados pelo SFX existente → respeitam o mudo)
  // ════════════════════════════════════════════════════════════
  const NOTE = { C: -9, 'C#': -8, D: -7, 'D#': -6, E: -5, F: -4, 'F#': -3, G: -2, 'G#': -1, A: 0, 'A#': 1, B: 2 };
  const N = (n) => { const m = /^([A-G]#?)(\d)$/.exec(n); return 440 * Math.pow(2, (NOTE[m[1]] + (+m[2] - 4) * 12) / 12); };
  function synth(f, o = {}) {
    const S = window.SFX;
    if (!S || S.isMuted()) return;
    const c = S.ctx(); if (!c) return;
    if (!(f > 0) || f > c.sampleRate / 2.2) return;
    const dest = S.out(); if (!dest) return;
    const t = c.currentTime + (o.at || 0), dur = o.dur || 0.4, peak = o.gain || 0.12;
    const osc = c.createOscillator(); osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(f, t);
    if (o.glide) osc.frequency.exponentialRampToValueAtTime(o.glide, t + (o.glideT || dur));
    if (o.detune) osc.detune.value = o.detune;
    let node = osc;
    if (o.lp) {
      const fl = c.createBiquadFilter(); fl.type = 'lowpass';
      fl.frequency.setValueAtTime(o.lp, t);
      if (o.lpTo) fl.frequency.exponentialRampToValueAtTime(o.lpTo, t + dur);
      osc.connect(fl); node = fl;
    }
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + (o.attack || 0.006));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    node.connect(g); g.connect(dest);
    osc.start(t); osc.stop(t + dur + 0.05);
  }
  function hiss(o = {}) {
    const S = window.SFX;
    if (!S || S.isMuted()) return;
    const c = S.ctx(); if (!c) return;
    const dest = S.out(); if (!dest) return;
    const t = c.currentTime + (o.at || 0), dur = o.dur || 0.4;
    const buf = c.createBuffer(1, Math.floor(c.sampleRate * (dur + 0.1)), c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource(); src.buffer = buf;
    const fl = c.createBiquadFilter(); fl.type = o.type || 'bandpass'; fl.Q.value = o.q || 1;
    fl.frequency.setValueAtTime(o.from || 400, t);
    fl.frequency.exponentialRampToValueAtTime(o.to || 4000, t + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(o.gain || 0.08, t + (o.attack || dur * 0.5));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(fl); fl.connect(g); g.connect(dest);
    src.start(t); src.stop(t + dur + 0.1);
  }
  const bell = (f, at = 0, dur = 1, gain = 0.1) => { synth(f, { at, dur, gain }); synth(f * 2.756, { at, dur: dur * 0.35, gain: gain * 0.28 }); };
  const pluck = (f, at = 0, gain = 0.12) => synth(f, { type: 'triangle', at, dur: 0.55, gain, lp: 5000, lpTo: 700 });
  const brass = (fs, at = 0, dur = 0.8, gain = 0.05) => fs.forEach((f, i) => {
    synth(f, { type: 'sawtooth', at, dur, gain, attack: 0.03, lp: 700, lpTo: 2600, detune: i % 2 ? 6 : -6 });
    synth(f, { type: 'triangle', at, dur, gain: gain * 0.8, attack: 0.02 });
  });
  const sparkleNotes = (at = 0, n = 6) => {
    const sc = ['D7', 'E7', 'F#7', 'A7', 'B7'].map(N);
    for (let i = 0; i < n; i++) bell(sc[Math.floor(Math.random() * sc.length)], at + i * 0.05, 0.5, 0.04);
  };
  const EXTRA_SFX = {
    levelUp() {
      hiss({ from: 300, to: 6000, dur: 0.55, gain: 0.07 });
      ['D5', 'F#5', 'A5', 'D6', 'F#6', 'A6', 'D7'].forEach((k, i) => pluck(N(k), 0.1 + i * 0.05));
      brass([N('D4'), N('A4'), N('D5'), N('F#5')], 0.48, 1.1, 0.045);
      bell(N('D7'), 0.5, 1.6, 0.09);
      sparkleNotes(0.6, 7);
      window.SFX && window.SFX.vibrate && window.SFX.vibrate([20, 40, 30]);
    },
    crit() {
      synth(2400, { glide: 3600, dur: 0.18, gain: 0.05 });
      bell(N('E7'), 0.04, 1.0, 0.11);
      bell(N('B7'), 0.1, 0.9, 0.06);
      sparkleNotes(0.15, 5);
    },
    chestShake() {
      hiss({ from: 700, to: 500, dur: 0.14, gain: 0.08, attack: 0.01 });
      synth(110, { glide: 70, dur: 0.16, gain: 0.14 });
    },
    chestBurst(rarity) {
      hiss({ from: 400, to: 9000, dur: 0.45, gain: 0.09, attack: 0.05 });
      synth(90, { glide: 45, dur: 0.35, gain: 0.2 });
      ['D6', 'F#6', 'A6', 'D7', 'F#7', 'A7'].forEach((k, i) => bell(N(k), 0.05 + i * 0.045, 0.55, 0.07));
      if (rarity !== 'comum') {
        brass([N('D5'), N('F#5'), N('A5'), N('D6')], 0.35, rarity === 'lendario' ? 2 : 1.3, 0.05);
        sparkleNotes(0.45, rarity === 'lendario' ? 12 : 6);
      }
    },
    victoryPlus() {
      ['D5', 'F#5', 'A5', 'D6', 'F#6'].forEach((k, i) => pluck(N(k), i * 0.08, 0.13));
      brass([N('D4'), N('A4'), N('D5'), N('F#5')], 0.42, 1.2, 0.05);
      bell(N('D7'), 0.44, 1.4, 0.09);
      sparkleNotes(0.5, 8);
    },
  };
  if (window.SFX) Object.keys(EXTRA_SFX).forEach(k => { if (!window.SFX[k]) window.SFX[k] = EXTRA_SFX[k]; });

  // ════════════════════════════════════════════════════════════
  //  MOTOR DE PARTÍCULAS (canvas)
  // ════════════════════════════════════════════════════════════
  const reduceMotion = (() => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } })();
  const PALETTE = ['#C4B5FD', '#8B5CF6', '#67E8F9', '#FDE68A', '#F9A8D4'];
  const GLYPHS = ['✦', '✧', 'ᚨ', 'ᚱ', 'ᛟ', '§', '∞', '☽', '⚖'];
  let cv = null, g2 = null, dpr = 1, raf = 0;
  const parts = [], texts = [], rings = [];
  const spriteCache = new Map();

  function rgba(color, a) {
    let h = String(color || '#ffffff').replace('#', '');
    if (h.length === 3) h = h.split('').map(ch => ch + ch).join('');
    const n = parseInt(h.slice(0, 6), 16);
    if (isNaN(n)) return `rgba(255,255,255,${a})`;
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }
  function ensureCanvas() {
    if (cv) return true;
    if (!document.body) return false;
    cv = document.createElement('canvas');
    cv.className = 'fx-canvas';
    cv.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cv);
    g2 = cv.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    return true;
  }
  function resize() {
    if (!cv) return;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.floor(innerWidth * dpr); cv.height = Math.floor(innerHeight * dpr);
    cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px';
  }
  function glowSprite(color) {
    if (spriteCache.has(color)) return spriteCache.get(color);
    const s = document.createElement('canvas'); s.width = s.height = 64;
    const c = s.getContext('2d');
    const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(0.18, rgba(color, 1));
    gr.addColorStop(0.45, rgba(color, 0.33));
    gr.addColorStop(1, rgba(color, 0));
    c.fillStyle = gr; c.fillRect(0, 0, 64, 64);
    spriteCache.set(color, s);
    return s;
  }
  function pathStar(c, r) { c.beginPath(); for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4; const rr = i % 2 === 0 ? r : r * 0.28; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } c.closePath(); }
  function pathHeart(c, r) { c.beginPath(); c.moveTo(0, r * 0.35); c.bezierCurveTo(-r * 1.1, -r * 0.4, -r * 0.45, -r * 1.15, 0, -r * 0.45); c.bezierCurveTo(r * 0.45, -r * 1.15, r * 1.1, -r * 0.4, 0, r * 0.35); c.closePath(); }
  function pathGem(c, r) { c.beginPath(); c.moveTo(0, -r); c.lineTo(r * 0.8, -r * 0.2); c.lineTo(0, r); c.lineTo(-r * 0.8, -r * 0.2); c.closePath(); }

  function loop() {
    if (!g2) return;
    g2.setTransform(dpr, 0, 0, dpr, 0, 0);
    g2.clearRect(0, 0, innerWidth, innerHeight);
    const now = performance.now();
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i];
      const t = (now - r.t0) / r.dur;
      if (t < 0) continue;
      if (t >= 1) { rings.splice(i, 1); continue; }
      const e = 1 - Math.pow(1 - t, 3);
      g2.globalCompositeOperation = 'lighter';
      g2.strokeStyle = r.color; g2.globalAlpha = (1 - t) * 0.8; g2.lineWidth = r.width * (1 - t) + 0.5;
      g2.beginPath(); g2.arc(r.x, r.y, 8 + e * r.max, 0, Math.PI * 2); g2.stroke();
    }
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      const age = now - p.t0;
      if (age < 0) continue;
      if (age > p.life) { parts.splice(i, 1); if (p.onArrive) p.onArrive(); continue; }
      const t = age / p.life;
      if (p.path) {
        const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2, u = 1 - e;
        const tgt = p.path.target();
        p.x = u * u * p.path.x0 + 2 * u * e * p.path.cx + e * e * tgt.x;
        p.y = u * u * p.path.y0 + 2 * u * e * p.path.cy + e * e * tgt.y;
      } else {
        p.vx *= p.drag; p.vy = p.vy * p.drag + p.grav; p.x += p.vx; p.y += p.vy;
      }
      p.rot += p.vr;
      const fade = p.path ? (t > 0.9 ? (1 - t) * 10 : 1) : (t < 0.1 ? t * 10 : 1 - t * t);
      const alpha = Math.max(0, fade * (p.twinkle ? 0.55 + 0.45 * Math.sin(age / 60 + p.seed) : 1));
      const size = p.size * (p.shrink ? 1 - t * 0.7 : 1);
      g2.save();
      g2.translate(p.x, p.y); g2.rotate(p.rot);
      g2.globalCompositeOperation = 'lighter'; g2.globalAlpha = alpha * 0.9;
      const gs = size * 4.2; g2.drawImage(glowSprite(p.color), -gs / 2, -gs / 2, gs, gs);
      g2.globalCompositeOperation = 'source-over'; g2.globalAlpha = alpha;
      if (p.kind === 'star') { pathStar(g2, size); g2.fillStyle = '#fff'; g2.fill(); }
      else if (p.kind === 'heart') { pathHeart(g2, size); g2.fillStyle = p.color; g2.fill(); }
      else if (p.kind === 'gem') {
        pathGem(g2, size);
        const gr = g2.createLinearGradient(-size, -size, size, size);
        gr.addColorStop(0, '#E0F2FE'); gr.addColorStop(0.5, p.color); gr.addColorStop(1, '#4C1D95');
        g2.fillStyle = gr; g2.fill(); g2.strokeStyle = 'rgba(255,255,255,0.8)'; g2.lineWidth = 0.8; g2.stroke();
      } else if (p.kind === 'glyph') {
        g2.fillStyle = p.color; g2.font = `700 ${size * 2.2}px "Space Grotesk", serif`;
        g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.fillText(p.glyph, 0, 0);
      } else { g2.fillStyle = '#fff'; g2.beginPath(); g2.arc(0, 0, size * 0.4, 0, 7); g2.fill(); }
      g2.restore();
    }
    for (let i = texts.length - 1; i >= 0; i--) {
      const tx = texts[i];
      const t = (now - tx.t0) / tx.life;
      if (t < 0) continue;
      if (t >= 1) { texts.splice(i, 1); continue; }
      const e = 1 - Math.pow(1 - t, 3);
      const sc = t < 0.15 ? 0.6 + (t / 0.15) * 0.55 : 1.15 - Math.min(0.15, t - 0.15);
      g2.save();
      g2.translate(tx.x, tx.y - e * tx.rise); g2.scale(sc, sc);
      g2.globalAlpha = t > 0.7 ? (1 - t) / 0.3 : 1;
      g2.font = `800 ${tx.size}px "Space Grotesk", Inter, sans-serif`;
      g2.textAlign = 'center'; g2.textBaseline = 'middle';
      g2.shadowColor = tx.color; g2.shadowBlur = 14;
      g2.lineWidth = 4; g2.strokeStyle = 'rgba(255,255,255,0.85)'; g2.strokeText(tx.text, 0, 0);
      g2.fillStyle = tx.color; g2.fillText(tx.text, 0, 0);
      g2.restore();
    }
    g2.globalAlpha = 1; g2.globalCompositeOperation = 'source-over';
    if (parts.length || texts.length || rings.length) raf = requestAnimationFrame(loop);
    else { raf = 0; g2.clearRect(0, 0, innerWidth, innerHeight); }
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
  const mk = (o) => Object.assign({
    x: 0, y: 0, vx: 0, vy: 0, drag: 0.955, grav: 0.1, life: 1100, t0: performance.now(), size: 4, color: '#C4B5FD',
    kind: 'star', rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.2, twinkle: Math.random() < 0.5, seed: Math.random() * 10, shrink: true,
  }, o);

  let lastPointer = null;
  document.addEventListener('pointerdown', (e) => { lastPointer = { x: e.clientX, y: e.clientY, t: Date.now() }; }, true);

  const CFX = {
    elCenter(el) {
      if (!el) return { x: innerWidth / 2, y: innerHeight * 0.45 };
      const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    },
    origin() { return lastPointer && Date.now() - lastPointer.t < 2500 ? { x: lastPointer.x, y: lastPointer.y } : { x: innerWidth / 2, y: innerHeight * 0.45 }; },
    burst(x, y, o = {}) {
      if (!ensureCanvas()) return;
      const count = Math.round((o.count || 24) * (reduceMotion ? 0.3 : 1));
      const pal = o.palette || PALETTE, kinds = o.kinds || ['star', 'spark'], speed = o.speed || 5;
      for (let i = 0; i < count; i++) {
        const a = o.angle != null ? o.angle + (Math.random() - 0.5) * (o.spread || 1) : Math.random() * Math.PI * 2;
        const v = speed * (0.35 + Math.random() * 0.9);
        parts.push(mk({
          x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (o.lift || 1.2), grav: o.grav ?? 0.1, drag: o.drag ?? 0.955,
          life: (o.life || 1100) * (0.7 + Math.random() * 0.6), size: (o.size || 4) * (0.6 + Math.random() * 0.8),
          color: pal[i % pal.length], kind: kinds[i % kinds.length], glyph: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
        }));
      }
      kick();
    },
    ring(x, y, o = {}) {
      if (!ensureCanvas()) return;
      rings.push({ x, y, color: o.color || '#C4B5FD', max: o.max || 140, width: o.width || 4, dur: o.dur || 800, t0: performance.now() + (o.delay || 0) });
      kick();
    },
    rain(o = {}) {
      if (!ensureCanvas()) return;
      const count = Math.round((o.count || 80) * (reduceMotion ? 0.25 : 1));
      const pal = o.palette || PALETTE, kinds = o.kinds || ['star', 'spark', 'glyph'];
      for (let i = 0; i < count; i++) {
        parts.push(mk({
          x: Math.random() * innerWidth, y: -20 - Math.random() * 80, vx: (Math.random() - 0.5) * 1.2, vy: 1.5 + Math.random() * 3,
          grav: 0.04, drag: 0.995, life: 2200 + Math.random() * 1600, size: 3 + Math.random() * 4, color: pal[i % pal.length],
          kind: kinds[i % kinds.length], glyph: GLYPHS[Math.floor(Math.random() * GLYPHS.length)], twinkle: true, shrink: false,
          t0: performance.now() + Math.random() * (o.spread || 900),
        }));
      }
      kick();
    },
    fountain(x, y, o = {}) { CFX.burst(x, y, Object.assign({ angle: -Math.PI / 2, spread: 1.1, speed: 8, grav: 0.22, lift: 2, count: 40, life: 1500 }, o)); },
    hearts(x, y, n = 8) { CFX.burst(x, y, { count: n, kinds: ['heart'], palette: ['#F472B6', '#F9A8D4', '#C084FC'], speed: 3.2, grav: -0.03, lift: 2.2, size: 6, life: 1400, drag: 0.97 }); },
    text(x, y, text, o = {}) {
      if (!ensureCanvas()) return;
      texts.push({ x, y, text, color: o.color || '#7C5CFF', size: o.size || 24, rise: o.rise || 70, life: o.life || 1500, t0: performance.now() + (o.delay || 0) });
      kick();
    },
    flyTo(from, selector, o = {}) {
      if (!ensureCanvas()) return;
      const getEl = () => document.querySelector(selector);
      if (!getEl()) { o.onArrive && o.onArrive(); return; }
      const count = Math.max(1, Math.min(o.count || 8, reduceMotion ? 3 : 14));
      let arrived = 0;
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const x0 = from.x + Math.cos(a) * 18, y0 = from.y + Math.sin(a) * 18;
        const tgt = CFX.elCenter(getEl());
        parts.push(mk({
          x: x0, y: y0, kind: o.kind || 'gem', color: o.color || '#38BDF8', size: o.size || 6,
          life: 750 + i * 55 + Math.random() * 120, twinkle: false, shrink: false, t0: performance.now() + i * 45,
          path: { x0, y0, cx: (x0 + tgt.x) / 2 + (Math.random() - 0.5) * 260, cy: Math.min(y0, tgt.y) - 80 - Math.random() * 140, target: () => CFX.elCenter(getEl()) },
          onArrive: () => {
            arrived++;
            const el = getEl();
            if (el) {
              const c = CFX.elCenter(el);
              CFX.burst(c.x, c.y, { count: 4, speed: 2.5, size: 3, life: 500, palette: [o.color || '#38BDF8', '#fff'] });
              el.classList.remove('fx-bump'); void el.offsetWidth; el.classList.add('fx-bump');
            }
            if (arrived === count && o.onArrive) o.onArrive();
          },
        }));
      }
      kick();
    },
  };

  // Mesma API do window.FX (dragon-ui.jsx) — o objeto é mutado para que as referências internas também usem o canvas
  const FX = window.FX || {};
  Object.assign(FX, {
    center() { return { x: innerWidth / 2, y: innerHeight * 0.45 }; },
    floatText(text, x, y, color = '#7C5CFF', size = 18, delay = 0) { CFX.text(x, y, text, { color, size: size + 4, delay }); },
    burst(x, y, colors = ['#7C5CFF', '#F472B6', '#FBBF24', '#38BDF8'], n = 16, dist = 90) {
      CFX.ring(x, y, { color: colors[0], max: dist * 1.3 });
      CFX.burst(x, y, { palette: colors.concat('#FFFFFF'), count: Math.round(n * 1.7), speed: Math.max(3, dist / 15), kinds: ['star', 'spark', 'glyph'] });
    },
    emojiBurst(x, y, emoji = '💜', n = 6) {
      if (emoji === '💜') { CFX.hearts(x, y, n + 3); return; }
      for (let i = 0; i < n; i++) CFX.text(x + (Math.random() - 0.5) * 70, y + (Math.random() - 0.5) * 30, emoji, { size: 18 + Math.random() * 12, delay: i * 70, color: '#FDE68A' });
      CFX.burst(x, y, { count: 10, speed: 3, palette: ['#FDE68A', '#C4B5FD', '#fff'] });
    },
    gemsTo(x, y, count) {
      CFX.flyTo({ x, y }, '#gem-counter', { count: Math.min(12, Math.max(3, Math.round((count || 5) / 4))), kind: 'gem', color: '#38BDF8' });
      window.SFX && setTimeout(() => window.SFX.gemRain(Math.min(8, 3 + Math.round((count || 5) / 10))), 700);
    },
    reward({ xp = 0, gems = 0 } = {}, x, y) {
      const p = x == null ? FX.center() : { x, y };
      if (xp > 0) FX.floatText(`+${xp} XP`, p.x, p.y - 10, '#7C5CFF', 22);
      if (gems > 0) { FX.floatText(`+${gems} 💎`, p.x + 40, p.y + 16, '#0EA5E9', 18, 160); FX.gemsTo(p.x, p.y, gems); }
      FX.burst(p.x, p.y, ['#7C5CFF', '#38BDF8', '#FBBF24', '#F472B6'], 14, 70);
    },
    ring: CFX.ring, rain: CFX.rain, fountain: CFX.fountain, hearts: CFX.hearts, flyTo: CFX.flyTo, elCenter: CFX.elCenter, origin: CFX.origin,
  });
  window.FX = FX;

  // Confetes antigos (splash.jsx / dragon-ui.jsx) viram partículas mágicas
  window.spawnConfetti = function ({ count = 30, colors, spread = 90, velocity = 5, shapes = ['square'] } = {}) {
    const x = innerWidth / 2, y = innerHeight * 0.55;
    const kinds = shapes.map(s => (s === 'star' ? 'star' : s === 'circle' ? 'spark' : 'gem'));
    if (spread >= 300) CFX.ring(x, y, { color: (colors && colors[0]) || '#C4B5FD', max: 260, width: 5 });
    CFX.burst(x, y, { count: Math.min(160, count), palette: colors, kinds: kinds.concat('glyph'), speed: velocity * 1.15, angle: spread >= 300 ? null : -Math.PI / 2, spread: (spread * Math.PI) / 180 });
    if (count >= 120) CFX.rain({ count: Math.round(count / 2), palette: colors });
  };
  window.celebrateLight = function () {
    const o = CFX.origin();
    CFX.burst(o.x, o.y, { count: 16, speed: 4, size: 3.5, palette: ['#C4B5FD', '#67E8F9', '#FDE68A'] });
    window.SFX && window.SFX.sparkle();
  };
  window.celebrateHighEnergy = function () {
    const o = CFX.origin();
    CFX.ring(o.x, o.y, { color: '#C4B5FD', max: 120 });
    CFX.burst(o.x, o.y, { count: 42, speed: 7, size: 4.5, kinds: ['star', 'spark', 'glyph'] });
    window.SFX && window.SFX.gem();
  };
  window.celebrateVictory = function () {
    const c = FX.center();
    CFX.ring(c.x, c.y, { color: '#FDE68A', max: 260, width: 5 });
    CFX.ring(c.x, c.y, { color: '#A78BFA', max: 360, width: 3, delay: 120 });
    CFX.burst(c.x, c.y, { count: 90, speed: 10, size: 5, kinds: ['star', 'spark', 'glyph', 'gem'] });
    CFX.rain({ count: 60 });
    EXTRA_SFX.victoryPlus();
  };
  window.celebrateEvolution = function () {
    const c = FX.center();
    CFX.ring(c.x, c.y, { color: '#FDE68A', max: 420, width: 6 });
    CFX.ring(c.x, c.y, { color: '#C4B5FD', max: 560, width: 4, delay: 150 });
    CFX.burst(c.x, c.y, { count: 140, speed: 13, size: 5.5, kinds: ['star', 'spark', 'glyph', 'gem'] });
    CFX.rain({ count: 140, spread: 1600 });
  };

  // ════════════════════════════════════════════════════════════
  //  INSIGHT CRÍTICO + BAÚS DE SABEDORIA
  // ════════════════════════════════════════════════════════════
  const CHESTS = {
    comum:    { name: 'Baú de Madeira', min: 10, max: 18, color: '#D6A36A', glow: 'rgba(245,158,11,0.55)', wood: ['#B7773D', '#7A4520'], metal: ['#E5E7EB', '#6B7280'], gem: '#F59E0B' },
    raro:     { name: 'Baú Arcano',     min: 25, max: 40, color: '#A78BFA', glow: 'rgba(139,92,246,0.65)', wood: ['#7C3AED', '#3B0F7A'], metal: ['#F1F5F9', '#94A3B8'], gem: '#67E8F9' },
    lendario: { name: 'Baú Lendário',   min: 70, max: 100, color: '#FCD34D', glow: 'rgba(252,211,77,0.75)', wood: ['#FCD34D', '#B45309'], metal: ['#FFFBEB', '#D97706'], gem: '#F472B6' },
  };
  function rollChest(force) {
    const r = Math.random();
    const rarity = force || (r < 0.05 ? 'lendario' : r < 0.3 ? 'raro' : 'comum');
    const t = CHESTS[rarity];
    return { id: 'wc' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), rarity, gems: t.min + Math.floor(Math.random() * (t.max - t.min + 1)) };
  }
  // Rola os bônus variáveis de uma sessão já recompensada pelo DG.studyRewards
  function rollSessionBonus(rw, entry) {
    const crit = (rw.xp || 0) >= 10 && Math.random() < 0.12 ? 2 : 1;
    const chest = (Number(entry.hours) || 0) >= 0.4 && Math.random() < 0.3 ? rollChest() : null;
    return { crit, chest };
  }
  const pendingChests = (shared) => ((shared.dragon && shared.dragon.chests) || []);
  function addPendingChest(shared, chest) {
    const d = DG.ensure(shared);
    return { ...shared, dragon: { ...d, chests: [...(d.chests || []), chest] } };
  }
  function openPendingChest(shared, chest) {
    const next = DG.addReward(shared, { gems: chest.gems });
    const d = DG.ensure(next);
    return { ...next, dragon: { ...d, chests: (d.chests || []).filter(c => c.id !== chest.id), stats: { ...d.stats, wisdomChests: (d.stats.wisdomChests || 0) + 1 } } };
  }

  // ════════════════════════════════════════════════════════════
  //  PELES DO DRAGÃO (loja)
  // ════════════════════════════════════════════════════════════
  const SKINS = {
    skin_aurora:    { name: 'Aurora Boreal',  price: 180, pal: { body1: '#B5F5DE', body2: '#14B8A6', belly: '#FFFBEA', belly2: '#FDE68A', horn1: '#FFFFFF', horn2: '#F0ABFC', wing1: '#CCFBF1', wing2: '#0D9488', gem: '#F0ABFC', glow: '#99F6E4', accent: '#0F766E', rune: '#0D9488' } },
    skin_quartzo:   { name: 'Quartzo Rosa',   price: 220, pal: { body1: '#FBCFE8', body2: '#EC4899', belly: '#FFF7ED', belly2: '#FED7AA', horn1: '#FFFFFF', horn2: '#C4B5FD', wing1: '#FCE7F3', wing2: '#BE185D', gem: '#A78BFA', glow: '#F9A8D4', accent: '#9D174D', rune: '#BE185D' } },
    skin_glacial:   { name: 'Cristal Glacial', price: 260, pal: { body1: '#DBEAFE', body2: '#60A5FA', belly: '#F8FAFC', belly2: '#E0F2FE', horn1: '#FFFFFF', horn2: '#A5F3FC', wing1: '#E0F2FE', wing2: '#2563EB', gem: '#67E8F9', glow: '#BAE6FD', accent: '#1D4ED8', rune: '#2563EB' } },
    skin_solar:     { name: 'Chama Solar',    price: 260, pal: { body1: '#FFD8A8', body2: '#F97316', belly: '#FFFBEB', belly2: '#FDE68A', horn1: '#FFFFFF', horn2: '#FDE047', wing1: '#FED7AA', wing2: '#C2410C', gem: '#FDE047', glow: '#FDBA74', accent: '#9A3412', rune: '#C2410C' } },
    skin_obsidiana: { name: 'Obsidiana Real', price: 350, pal: { body1: '#7C74A8', body2: '#2A2342', belly: '#FFF1B8', belly2: '#D4A017', horn1: '#FFF6D1', horn2: '#D4A017', wing1: '#4C3F8A', wing2: '#140E2A', gem: '#FDE68A', glow: '#FDE68A', accent: '#1A1330', rune: '#D4A017' } },
  };
  // Paleta final para uma fase: ovos ficam claros (só tingidos), o dragão recebe a pele inteira
  window.dragonSkinPalette = (skinId, info) => {
    const s = SKINS[skinId];
    if (!s) return info.pal;
    if (info.id <= 2) return { ...info.pal, body2: s.pal.body1, gem: s.pal.gem, glow: s.pal.glow, accent: s.pal.accent, rune: s.pal.rune };
    return { ...info.pal, ...s.pal };
  };
  if (DG && !DG.SLOTS.some(s => s.id === 'skin')) {
    const bgIdx = DG.SLOTS.findIndex(s => s.id === 'bg');
    DG.SLOTS.splice(bgIdx < 0 ? DG.SLOTS.length : bgIdx, 0, { id: 'skin', label: 'Peles' });
    Object.entries(SKINS).forEach(([id, s]) => DG.ITEMS.push({ id, slot: 'skin', name: s.name, icon: '🎨', price: s.price, minStage: 3 }));
  }

  // Relatório semanal usa as mesmas fases do dragão
  if (window.DA && window.DRAGON_STAGES && window.evaluateDragon) {
    window.DA.getPetStage = (xp) => window.getDragonStage(xp);
    window.DA.getPetStageInfo = (xp) => {
      const e = window.evaluateDragon(xp);
      return { ...e.stage, stage: e.stage.id, nextXp: e.next ? e.next.minXp : Infinity, progress: e.progress / 100,
        next: e.next ? { ...e.next, stage: e.next.id } : null, xpToNext: e.toNext };
    };
  }

  // ════════════════════════════════════════════════════════════
  //  COMPONENTES
  // ════════════════════════════════════════════════════════════
  const useUid = (p) => (p || 'u') + (React.useId ? React.useId() : String(Math.random())).replace(/[^a-zA-Z0-9]/g, '');
  function useCountUp(target, dur = 900, start = 0) {
    const [v, setV] = useState(start);
    useEffect(() => {
      let raf, t0;
      const step = (t) => { if (!t0) t0 = t; const k = Math.min(1, (t - t0) / dur); setV(Math.round(start + (target - start) * (1 - Math.pow(1 - k, 3)))); if (k < 1) raf = requestAnimationFrame(step); };
      raf = requestAnimationFrame(step);
      return () => cancelAnimationFrame(raf);
    }, [target]);
    return v;
  }

  // ── Medalha (substitui o emblema redondo em toda a Sala de Troféus) ──
  const MEDAL = {
    bronze:   { colors: ['#FFE3C4', '#D8904F', '#7C3F16'], ribbon: ['#B45309', '#78350F'], glow: '#F59E0B' },
    prata:    { colors: ['#FFFFFF', '#C9D3E3', '#6B7A93'], ribbon: ['#6366F1', '#3730A3'], glow: '#A5B4FC' },
    ouro:     { colors: ['#FFF8C9', '#F5C542', '#9A5B06'], ribbon: ['#7C3AED', '#4C1D95'], glow: '#FCD34D' },
    lendario: { colors: ['#FCE7F3', '#C084FC', '#22D3EE'], ribbon: ['#DB2777', '#0891B2'], glow: '#E879F9' },
  };
  function Medal({ tier = 'bronze', icon = '✦', size = 96, locked = false, progress = 0 }) {
    const T = MEDAL[tier] || MEDAL.bronze;
    const id = useUid('md');
    const pts = [];
    for (let i = 0; i < 48; i++) { const a = (i * Math.PI) / 24 - Math.PI / 2; const r = i % 2 ? 44 : 47.5; pts.push(`${(50 + Math.cos(a) * r).toFixed(2)},${(50 + Math.sin(a) * r).toFixed(2)}`); }
    const C = 2 * Math.PI * 49;
    return (
      <svg viewBox="-4 -4 108 128" width={size} height={size * 1.185} className={locked ? 'medal-locked' : ''} style={{ overflow: 'visible', display: 'block' }}>
        <defs>
          <linearGradient id={`${id}r`} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={T.colors[0]} /><stop offset="45%" stopColor={T.colors[1]} /><stop offset="100%" stopColor={T.colors[2]} /></linearGradient>
          <radialGradient id={`${id}i`} cx="0.4" cy="0.3" r="0.8"><stop offset="0%" stopColor="#4C2A9A" /><stop offset="60%" stopColor="#24105A" /><stop offset="100%" stopColor="#12082E" /></radialGradient>
          <linearGradient id={`${id}b`} x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor={T.ribbon[0]} /><stop offset="100%" stopColor={T.ribbon[1]} /></linearGradient>
          <linearGradient id={`${id}s`} x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#fff" stopOpacity="0" /><stop offset="50%" stopColor="#fff" stopOpacity="0.55" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></linearGradient>
          <clipPath id={`${id}c`}><circle cx="50" cy="50" r="47.5" /></clipPath>
        </defs>
        <path d="M34 82 L24 118 L33 112 L39 120 L46 86 Z" fill={`url(#${id}b)`} />
        <path d="M66 82 L76 118 L67 112 L61 120 L54 86 Z" fill={`url(#${id}b)`} />
        {!locked && <circle cx="50" cy="50" r="50" fill={T.glow} opacity="0.3" style={{ filter: 'blur(8px)' }} />}
        <polygon points={pts.join(' ')} fill={`url(#${id}r)`} stroke={T.colors[2]} strokeWidth="0.8" />
        <circle cx="50" cy="50" r="40.5" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1" />
        <circle cx="50" cy="50" r="38" fill={`url(#${id}i)`} stroke={T.colors[2]} strokeWidth="1.5" />
        <circle cx="50" cy="50" r="33" fill="none" stroke={T.colors[1]} strokeOpacity="0.45" strokeWidth="0.8" strokeDasharray="1.5 3" />
        {[[30, 32], [71, 36], [66, 70], [33, 66]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="0.9" fill="#fff" opacity="0.7" />)}
        <text x="50" y="53" textAnchor="middle" dominantBaseline="middle" fontSize="30" style={{ filter: locked ? 'grayscale(1)' : 'drop-shadow(0 0 4px rgba(255,255,255,0.35))' }}>{icon}</text>
        {!locked && <g clipPath={`url(#${id}c)`}><rect className="medal-shine" x="-60" y="-10" width="40" height="120" fill={`url(#${id}s)`} transform="rotate(20 50 50)" /></g>}
        {locked && (
          <>
            <circle cx="50" cy="50" r="47.5" fill="rgba(14,8,34,0.5)" />
            <circle cx="50" cy="50" r="49" fill="none" stroke="rgba(167,139,250,0.2)" strokeWidth="2.5" />
            {progress > 0 && <circle cx="50" cy="50" r="49" fill="none" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - progress)} transform="rotate(-90 50 50)" />}
            <g transform="translate(50 80)">
              <circle r="9" fill="#1E1048" stroke="rgba(196,181,253,0.5)" strokeWidth="1" />
              <rect x="-4" y="-1.5" width="8" height="6" rx="1.2" fill="#C4B5FD" />
              <path d="M-2.6 -1.5 V-3.6 A2.6 2.6 0 0 1 2.6 -3.6 V-1.5" fill="none" stroke="#C4B5FD" strokeWidth="1.4" />
            </g>
          </>
        )}
      </svg>
    );
  }
  function MedalBadge({ ach, unlocked = true, size = 64 }) {
    const pct = ach && ach.pct != null ? ach.pct / 100 : 0;
    return (
      <div style={{ width: size, height: size * 1.12, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <Medal tier={ach.tier} icon={ach.icon} size={size} locked={!unlocked} progress={pct} />
      </div>
    );
  }
  window.AchievementBadge = MedalBadge;

  // ── Baú (arte) ──
  function ArcaneChest({ rarity = 'comum', size = 120, open = false }) {
    const id = useUid('ac');
    const P = CHESTS[rarity] || CHESTS.comum;
    return (
      <svg viewBox="0 0 120 110" width={size} height={size * 110 / 120} style={{ overflow: 'visible' }} className={`wchest ${open ? 'is-open' : ''}`}>
        <defs>
          <linearGradient id={`${id}w`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={P.wood[0]} /><stop offset="100%" stopColor={P.wood[1]} /></linearGradient>
          <linearGradient id={`${id}m`} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={P.metal[0]} /><stop offset="100%" stopColor={P.metal[1]} /></linearGradient>
          <radialGradient id={`${id}l`} cx="0.5" cy="1" r="0.9"><stop offset="0%" stopColor="#FFF7D6" /><stop offset="50%" stopColor={P.gem} stopOpacity="0.6" /><stop offset="100%" stopColor={P.gem} stopOpacity="0" /></radialGradient>
        </defs>
        <ellipse cx="60" cy="104" rx="46" ry="5" fill="rgba(0,0,0,0.35)" />
        {open && <path d="M20 58 L-10 -40 L130 -40 L100 58 Z" fill={`url(#${id}l)`} className="wchest-beam" />}
        <rect x="14" y="54" width="92" height="46" rx="6" fill={`url(#${id}w)`} stroke="rgba(0,0,0,0.35)" strokeWidth="1.2" />
        <rect x="14" y="54" width="92" height="8" fill="rgba(0,0,0,0.18)" />
        {[30, 60, 90].map(x => <line key={x} x1={x} y1="62" x2={x} y2="100" stroke="rgba(0,0,0,0.18)" strokeWidth="1" />)}
        <rect x="14" y="54" width="10" height="46" fill={`url(#${id}m)`} />
        <rect x="96" y="54" width="10" height="46" fill={`url(#${id}m)`} />
        <g className="wchest-lid">
          <path d="M14 56 L14 40 C14 22, 106 22, 106 40 L106 56 Z" fill={`url(#${id}w)`} stroke="rgba(0,0,0,0.35)" strokeWidth="1.2" />
          <path d="M14 40 C14 22, 106 22, 106 40" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
          <path d="M24 56 L24 30 M96 56 L96 30" stroke={`url(#${id}m)`} strokeWidth="10" />
          <rect x="14" y="50" width="92" height="6" fill={`url(#${id}m)`} />
        </g>
        <rect x="50" y="50" width="20" height="22" rx="4" fill={`url(#${id}m)`} stroke="rgba(0,0,0,0.3)" />
        <circle cx="60" cy="59" r="4" fill={P.gem} style={{ filter: `drop-shadow(0 0 4px ${P.gem})` }} />
        <rect x="58.8" y="61" width="2.4" height="6" rx="1" fill="rgba(0,0,0,0.45)" />
      </svg>
    );
  }

  // ── Modal: Baú de Sabedoria (3 toques) ──
  function WisdomChestModal({ chest, onOpened, onClose }) {
    const [phase, setPhase] = useState('idle');
    const [taps, setTaps] = useState(0);
    const t = CHESTS[chest.rarity] || CHESTS.comum;
    const boxRef = useRef(null);
    useEffect(() => { window.SFX && window.SFX.pop(); }, []);
    const tap = () => {
      if (phase === 'open') return;
      const n = taps + 1;
      setTaps(n); setPhase('shaking');
      EXTRA_SFX.chestShake();
      window.SFX && window.SFX.vibrate && window.SFX.vibrate(20);
      if (n < 3) { setTimeout(() => setPhase('idle'), 380); return; }
      setTimeout(() => {
        setPhase('open');
        EXTRA_SFX.chestBurst(chest.rarity);
        const c = CFX.elCenter(boxRef.current);
        CFX.ring(c.x, c.y, { color: t.color, max: 260, width: 5 });
        CFX.fountain(c.x, c.y - 30, { count: 50, palette: [t.color, '#fff', '#C4B5FD', '#67E8F9'], kinds: ['gem', 'star', 'spark'] });
        if (chest.rarity !== 'comum') CFX.rain({ count: chest.rarity === 'lendario' ? 120 : 50 });
        setTimeout(() => FX.gemsTo(c.x, c.y - 40, chest.gems), 700);
        onOpened && onOpened(chest);
      }, 260);
    };
    return (
      <div className="plus-overlay" onClick={phase === 'open' ? onClose : undefined}>
        <div className="plus-rays" style={{ '--ray': t.color }} />
        <div className="wchest-stage" onClick={e => e.stopPropagation()}>
          <div className="plus-eyebrow" style={{ color: t.color }}>✦ {t.name.toUpperCase()} ✦</div>
          <div ref={boxRef} className={`wchest-box ${phase === 'shaking' ? 'is-shaking' : ''} ${phase === 'idle' && taps === 0 ? 'is-idle' : ''}`} onClick={tap} style={{ '--chest-glow': t.glow }}>
            <ArcaneChest rarity={chest.rarity} size={220} open={phase === 'open'} />
          </div>
          {phase !== 'open' ? (
            <div className="wchest-hint">Toque {3 - taps}× para abrir</div>
          ) : (
            <div className="wchest-reward plus-pop">
              <div className="wchest-num num">+{chest.gems} 💎</div>
              <div className="wchest-sub">Baú de Sabedoria · recompensa por estudar</div>
              <button className="dg-btn dg-btn-gold" style={{ padding: '12px 28px', fontSize: 14 }} onClick={onClose}>Coletar ✨</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Toast de recompensa de sessão ──
  function RewardToast({ reward, onDone, onOpenChest }) {
    const shown = useCountUp(reward.xp, 1100);
    const ref = useRef(null);
    useEffect(() => {
      const t = setTimeout(onDone, reward.chest ? 7500 : 5200);
      return () => clearTimeout(t);
    }, []);
    useEffect(() => {
      window.SFX && window.SFX.xp();
      if (reward.crit > 1) setTimeout(() => EXTRA_SFX.crit(), 380);
      if (reward.chest) setTimeout(() => EXTRA_SFX.chestShake(), 900);
      setTimeout(() => {
        if (!ref.current) return;
        const c = CFX.elCenter(ref.current);
        CFX.burst(c.x, c.y - 20, { count: reward.crit > 1 ? 40 : 18, speed: 5, palette: ['#FDE68A', '#C4B5FD', '#67E8F9'] });
        if (reward.gems > 0) FX.gemsTo(c.x, c.y, reward.gems);
      }, 350);
    }, []);
    return (
      <div ref={ref} className="reward-toast" role="status">
        <div className="reward-toast-glow" />
        <div>
          <div className="reward-xp num">+{shown}<span>XP</span></div>
          <div className="reward-chips">
            <span className="reward-chip">Base {reward.base}</span>
            {reward.mult > 1 && <span className="reward-chip chip-fire">🔥 Chama ×{reward.mult}</span>}
            {reward.crit > 1 && <span className="reward-chip chip-crit">⚡ INSIGHT CRÍTICO ×2</span>}
            {reward.extra > 0 && <span className="reward-chip">🛡️ Blindado +{reward.extra}</span>}
            {reward.gems > 0 && <span className="reward-chip chip-gem">+{reward.gems} 💎</span>}
          </div>
        </div>
        {reward.chest && (
          <button className="reward-chest" onClick={() => { onOpenChest && onOpenChest(reward.chest); onDone(); }}>
            <ArcaneChest rarity={reward.chest.rarity} size={46} />
            <span><b>{CHESTS[reward.chest.rarity].name}!</b><small>Toque para abrir</small></span>
          </button>
        )}
        <button className="reward-close" onClick={onDone} aria-label="Fechar">×</button>
      </div>
    );
  }

  // ── Banner de nível ──
  function LevelUpBanner({ level, gems, onDone }) {
    const ref = useRef(null);
    useEffect(() => {
      EXTRA_SFX.levelUp();
      setTimeout(() => {
        if (!ref.current) return;
        const c = CFX.elCenter(ref.current);
        CFX.burst(c.x, c.y, { count: 50, speed: 8, kinds: ['star', 'spark', 'glyph'], palette: ['#FDE68A', '#C4B5FD', '#67E8F9', '#F9A8D4'] });
        CFX.ring(c.x, c.y, { color: '#FDE68A', max: 220 });
        if (gems > 0) FX.gemsTo(c.x, c.y, gems);
      }, 250);
      const t = setTimeout(onDone, 3600);
      return () => clearTimeout(t);
    }, []);
    return (
      <div ref={ref} className="levelup-banner" onClick={onDone}>
        <div className="levelup-wing levelup-wing-l" />
        <div className="levelup-core">
          <div className="levelup-eyebrow">SUBIU DE NÍVEL</div>
          <div className="levelup-num num">NÍVEL {level}</div>
          {gems > 0 && <div className="levelup-gems">+{gems} 💎</div>}
        </div>
        <div className="levelup-wing levelup-wing-r" />
      </div>
    );
  }

  // ── Chips do header ──
  function LevelChip({ shared, onClick }) {
    const lv = levelInfo(shared.xp);
    const d = DG.ensure(shared);
    const stage = window.getDragonStage(shared.xp);
    return (
      <button className="lvl-chip" onClick={onClick} title={`${(shared.xp || 0).toLocaleString('pt-BR')} XP no total · ${lv.into}/${lv.need} para o nível ${lv.level + 1}`}>
        <span className="lvl-avatar">
          <window.DragonSprite stage={stage} mood={shared.petHealth === 'sick' ? 'sick' : 'happy'} equipped={{ ...d.equipped, bg: undefined, aura: undefined, held: undefined }} size={46} animate={false} showFamiliars={false} />
        </span>
        <span className="lvl-txt">
          <span className="lvl-top"><b>Nv {lv.level}</b><em className="num">{(shared.xp || 0).toLocaleString('pt-BR')} XP</em></span>
          <span className="lvl-bar"><span style={{ width: `${Math.max(3, lv.progress * 100)}%` }} /></span>
        </span>
      </button>
    );
  }
  function PendingChestChip({ shared, onOpen }) {
    const chests = pendingChests(shared);
    if (!chests.length) return null;
    return (
      <button className="pchest-chip" onClick={() => onOpen && onOpen(chests[0])} title="Baús de Sabedoria esperando para serem abertos">
        <ArcaneChest rarity={chests[0].rarity} size={24} />
        <b>{chests.length}</b>
      </button>
    );
  }

  window.DGPlus = {
    levelInfo, LEVEL_GEMS, rollSessionBonus, rollChest, CHESTS, pendingChests, addPendingChest, openPendingChest, SKINS,
  };
  window.Medal = Medal;
  window.RewardToast = RewardToast;
  window.WisdomChestModal = WisdomChestModal;
  window.LevelUpBanner = LevelUpBanner;
  window.LevelChip = LevelChip;
  window.PendingChestChip = PendingChestChip;
})();
