// TOGA — Arcane Sound & Magic FX Engine
// • Web Audio sintetizado (sem arquivos): barramento com compressor + reverb de convolução
//   gerado em runtime → sinos, harpas, fanfarras e "vozes" do dragão com ar de estúdio.
// • Overlay <canvas> de partículas (estrelas, faíscas, corações, gemas, runas) com
//   composição aditiva, anéis de choque, chuva de estrelas, texto flutuante e gemas
//   que voam até o contador do header.
// • Substitui window.celebrate* / window.play* mantendo a mesma API usada pelo app.

(function () {
  // ════════════════════════════════════════════════════════════
  //  AUDIO
  // ════════════════════════════════════════════════════════════
  const MUTE_KEY = 'toga_sfx_muted';
  let muted = false;
  try { muted = localStorage.getItem(MUTE_KEY) === '1'; } catch (e) {}
  const muteListeners = new Set();

  let ctx = null, bus = null, wet = null;

  function makeImpulse(c, seconds, decay) {
    const rate = c.sampleRate, len = Math.floor(rate * seconds);
    const buf = c.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  function ac() {
    if (muted) return null;
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -16; comp.knee.value = 12; comp.ratio.value = 3.5;
      comp.attack.value = 0.004; comp.release.value = 0.22;
      bus = ctx.createGain(); bus.gain.value = 0.9;
      bus.connect(comp); comp.connect(ctx.destination);
      const conv = ctx.createConvolver(); conv.buffer = makeImpulse(ctx, 2.8, 3.0);
      wet = ctx.createGain(); wet.gain.value = 1;
      const wetOut = ctx.createGain(); wetOut.gain.value = 0.34;
      wet.connect(conv); conv.connect(wetOut); wetOut.connect(bus);
    }
    if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) {} }
    return ctx;
  }

  const NOTE_IDX = { C: -9, 'C#': -8, D: -7, 'D#': -6, E: -5, F: -4, 'F#': -3, G: -2, 'G#': -1, A: 0, 'A#': 1, B: 2 };
  function N(name) {
    const m = /^([A-G]#?)(\d)$/.exec(name);
    if (!m) return 440;
    return 440 * Math.pow(2, (NOTE_IDX[m[1]] + (parseInt(m[2], 10) - 4) * 12) / 12);
  }

  function tone(f, o = {}) {
    const c = ac(); if (!c) return;
    if (!(f > 0) || f > c.sampleRate / 2.2) return; // acima do limite audível/Nyquist
    const t = c.currentTime + (o.at || 0);
    const dur = o.dur ?? 0.4, peak = o.gain ?? 0.18, atk = o.attack ?? 0.006;
    const osc = c.createOscillator();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(f, t);
    if (o.glide) osc.frequency.exponentialRampToValueAtTime(o.glide, t + (o.glideT || dur));
    if (o.detune) osc.detune.value = o.detune;
    let node = osc;
    if (o.lp) {
      const fl = c.createBiquadFilter(); fl.type = 'lowpass';
      fl.frequency.setValueAtTime(o.lp, t);
      if (o.lpTo) fl.frequency.exponentialRampToValueAtTime(o.lpTo, t + dur);
      fl.Q.value = o.q || 0.8;
      osc.connect(fl); node = fl;
    }
    if (o.vib) {
      const l = c.createOscillator(); l.frequency.value = o.vib;
      const lg = c.createGain(); lg.gain.value = o.vibDepth || 8;
      l.connect(lg); lg.connect(osc.frequency); l.start(t); l.stop(t + dur + 0.05);
    }
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + atk);
    if (o.hold) g.gain.setValueAtTime(peak, t + atk + o.hold);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    if (o.am) {
      // Modulação de amplitude (ronronar): ganho oscila entre 0 e 1 antes do envelope
      const amG = c.createGain(); amG.gain.value = 0.5;
      const l = c.createOscillator(); l.frequency.value = o.am;
      const lg = c.createGain(); lg.gain.value = 0.5;
      l.connect(lg); lg.connect(amG.gain); l.start(t); l.stop(t + dur + 0.05);
      node.connect(amG); node = amG;
    }
    let out = g;
    if (o.pan && c.createStereoPanner) {
      const p = c.createStereoPanner(); p.pan.value = o.pan; g.connect(p); out = p;
    }
    node.connect(g);
    out.connect(bus);
    const send = c.createGain(); send.gain.value = o.wet ?? 0.35;
    out.connect(send); send.connect(wet);
    osc.start(t); osc.stop(t + dur + 0.08);
  }

  function noise(o = {}) {
    const c = ac(); if (!c) return;
    const t = c.currentTime + (o.at || 0);
    const dur = o.dur ?? 0.5;
    const len = Math.floor(c.sampleRate * (dur + 0.1));
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource(); src.buffer = buf;
    const fl = c.createBiquadFilter(); fl.type = o.filter || 'bandpass';
    fl.frequency.setValueAtTime(o.from || 400, t);
    fl.frequency.exponentialRampToValueAtTime(o.to || 4000, t + dur);
    fl.Q.value = o.q ?? 1.2;
    const g = c.createGain();
    const peak = o.gain ?? 0.12;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + (o.attack ?? dur * 0.6));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(fl); fl.connect(g); g.connect(bus);
    const send = c.createGain(); send.gain.value = o.wet ?? 0.4; g.connect(send); send.connect(wet);
    src.start(t); src.stop(t + dur + 0.1);
  }

  // Sino com parciais inarmônicos (glockenspiel/celesta)
  function bell(f, o = {}) {
    const dur = o.dur || 0.9, gain = o.gain || 0.14;
    tone(f, { dur, gain, at: o.at, wet: o.wet ?? 0.45, pan: o.pan });
    tone(f * 2.756, { dur: dur * 0.35, gain: gain * 0.28, at: o.at, wet: 0.5, pan: o.pan });
    tone(f * 5.404, { dur: dur * 0.15, gain: gain * 0.1, at: o.at, wet: 0.5, pan: o.pan });
  }
  // Harpa / pluck
  function pluck(f, o = {}) {
    tone(f, { type: 'triangle', dur: o.dur || 0.6, gain: o.gain || 0.16, lp: 5200, lpTo: 700, at: o.at, wet: o.wet ?? 0.32, pan: o.pan });
    tone(f * 2, { type: 'sine', dur: (o.dur || 0.6) * 0.4, gain: (o.gain || 0.16) * 0.25, at: o.at, wet: 0.3, pan: o.pan });
  }
  // Metais suaves (fanfarra)
  function brass(freqs, o = {}) {
    freqs.forEach((f, i) => {
      tone(f, { type: 'sawtooth', dur: o.dur || 0.6, gain: (o.gain || 0.07), attack: 0.03, lp: 700, lpTo: 2600, q: 1.4, at: o.at, detune: (i % 2 ? 6 : -6), wet: 0.35 });
      tone(f, { type: 'triangle', dur: o.dur || 0.6, gain: (o.gain || 0.07) * 0.8, attack: 0.02, at: o.at, wet: 0.35 });
    });
  }
  function sparkle(o = {}) {
    const scale = ['D7', 'E7', 'F#7', 'A7', 'B7', 'D8'].map(N);
    const n = o.count || 6;
    for (let i = 0; i < n; i++) {
      bell(scale[Math.floor(Math.random() * scale.length)], { at: (o.at || 0) + i * (o.gap || 0.05), dur: 0.5, gain: o.gain || 0.05, pan: (Math.random() - 0.5) * 0.8 });
    }
  }

  const SFX = {
    N, tone, bell, pluck, noise, brass, sparkle,
    tap()   { bell(N('A6'), { dur: 0.18, gain: 0.05, wet: 0.15 }); },
    pop()   { tone(480, { glide: 980, dur: 0.12, gain: 0.07, wet: 0.2 }); },
    close() { tone(820, { glide: 420, dur: 0.12, gain: 0.05, wet: 0.2 }); },
    check() {
      bell(N('E6'), { gain: 0.12, dur: 0.6 });
      bell(N('B6'), { gain: 0.1, dur: 0.8, at: 0.06 });
    },
    soft()  { bell(N('D7'), { gain: 0.04, dur: 0.5 }); bell(N('A7'), { gain: 0.03, dur: 0.5, at: 0.05 }); },
    xp()    { bell(N('B5'), { gain: 0.08, dur: 0.35 }); bell(N('E6'), { gain: 0.09, dur: 0.5, at: 0.07 }); },
    gem(n = 5) {
      ['D6', 'F#6', 'A6', 'D7', 'F#7', 'A7'].slice(0, Math.max(3, Math.min(6, n))).forEach((k, i) =>
        bell(N(k), { at: i * 0.045, dur: 0.55, gain: 0.08, pan: -0.4 + i * 0.16 }));
    },
    coinTick() { bell(N('E7') * (1 + Math.random() * 0.06), { dur: 0.25, gain: 0.05, wet: 0.2 }); },
    quest() {
      ['D4', 'F#4', 'A4', 'C#5', 'E5', 'A5'].forEach((k, i) => pluck(N(k), { at: i * 0.07, gain: 0.13 }));
      bell(N('D6'), { at: 0.45, dur: 1.4, gain: 0.12 });
      bell(N('A6'), { at: 0.5, dur: 1.4, gain: 0.08 });
      sparkle({ at: 0.55, count: 5 });
    },
    levelUp() {
      noise({ from: 300, to: 6000, dur: 0.55, gain: 0.08, q: 0.9 });
      ['D5', 'F#5', 'A5', 'D6', 'F#6', 'A6', 'D7'].forEach((k, i) => pluck(N(k), { at: 0.1 + i * 0.05, gain: 0.12 }));
      brass([N('D4'), N('A4'), N('D5'), N('F#5')], { at: 0.48, dur: 1.1, gain: 0.05 });
      bell(N('D7'), { at: 0.5, dur: 1.6, gain: 0.1 });
      sparkle({ at: 0.6, count: 7 });
    },
    achievement(tier = 'bronze') {
      const epic = tier === 'ouro' || tier === 'lendario';
      if (tier === 'lendario') { tone(N('D2'), { dur: 2.4, gain: 0.22, attack: 0.02, wet: 0.5 }); noise({ from: 200, to: 8000, dur: 0.9, gain: 0.07 }); }
      brass([N('D4'), N('A4'), N('D5')], { at: 0, dur: 0.3, gain: 0.06 });
      brass([N('G4'), N('B4'), N('D5')], { at: 0.2, dur: 0.3, gain: 0.06 });
      brass([N('A4'), N('C#5'), N('E5')], { at: 0.4, dur: 0.3, gain: 0.06 });
      brass([N('D5'), N('F#5'), N('A5'), N('D6')], { at: 0.64, dur: epic ? 2.0 : 1.3, gain: 0.065 });
      bell(N('D7'), { at: 0.66, dur: 1.8, gain: 0.1 });
      bell(N('A7'), { at: 0.72, dur: 1.6, gain: 0.06 });
      sparkle({ at: 0.75, count: epic ? 12 : 6, gap: 0.06 });
    },
    evolutionCharge() {
      tone(N('D2'), { dur: 2.4, gain: 0.2, attack: 1.8, wet: 0.5 });
      tone(N('A2'), { dur: 2.4, gain: 0.08, attack: 1.8, wet: 0.5, vib: 5, vibDepth: 3 });
      noise({ from: 150, to: 7000, dur: 2.2, gain: 0.09, attack: 2.0, q: 0.7 });
      ['D4', 'F#4', 'A4', 'D5', 'F#5', 'A5', 'D6', 'F#6', 'A6', 'D7'].forEach((k, i) =>
        pluck(N(k), { at: 0.6 + i * 0.15, gain: 0.07 + i * 0.006 }));
    },
    evolutionReveal() {
      tone(N('D2'), { dur: 2.8, gain: 0.26, attack: 0.01, wet: 0.6 });
      noise({ filter: 'lowpass', from: 3000, to: 200, dur: 1.2, gain: 0.12, attack: 0.01 });
      brass([N('D4'), N('A4'), N('D5'), N('F#5'), N('A5')], { dur: 2.4, gain: 0.06 });
      [N('D6'), N('F#6'), N('A6'), N('D7')].forEach((f, i) => bell(f, { at: 0.05 + i * 0.08, dur: 2.4, gain: 0.1 }));
      sparkle({ at: 0.3, count: 16, gap: 0.07 });
    },
    evolution() { SFX.evolutionCharge(); setTimeout(() => SFX.evolutionReveal(), 2300); },
    victory() {
      ['D5', 'F#5', 'A5', 'D6', 'F#6'].forEach((k, i) => pluck(N(k), { at: i * 0.08, gain: 0.14 }));
      brass([N('D4'), N('A4'), N('D5'), N('F#5')], { at: 0.42, dur: 1.2, gain: 0.055 });
      bell(N('D7'), { at: 0.44, dur: 1.4, gain: 0.1 });
      sparkle({ at: 0.5, count: 8 });
    },
    timerEnd() {
      ['A5', 'D6', 'F#6', 'A6'].forEach((k, i) => bell(N(k), { at: i * 0.16, dur: 1.4, gain: 0.13 }));
      bell(N('D7'), { at: 0.7, dur: 2.2, gain: 0.1 });
    },
    mastered() {
      pluck(N('D5'), { gain: 0.14 }); pluck(N('F#5'), { at: 0.06, gain: 0.14 }); pluck(N('A5'), { at: 0.12, gain: 0.14 });
      bell(N('D7'), { at: 0.2, dur: 1.2, gain: 0.1 });
      sparkle({ at: 0.28, count: 5 });
    },
    crit() {
      tone(2400, { glide: 3600, dur: 0.18, gain: 0.05, wet: 0.3 });
      bell(N('E7'), { at: 0.04, dur: 1.0, gain: 0.12 });
      bell(N('B7'), { at: 0.1, dur: 0.9, gain: 0.07 });
      sparkle({ at: 0.15, count: 5 });
    },
    chestShake() {
      noise({ filter: 'bandpass', from: 700, to: 500, dur: 0.14, gain: 0.08, attack: 0.01, wet: 0.1 });
      tone(110, { glide: 70, dur: 0.16, gain: 0.14, wet: 0.1 });
    },
    chestOpen(rarity = 'comum') {
      noise({ from: 400, to: 9000, dur: 0.45, gain: 0.1, attack: 0.05 });
      tone(90, { glide: 45, dur: 0.35, gain: 0.2, wet: 0.2 });
      SFX.gem(6);
      if (rarity !== 'comum') setTimeout(() => SFX.achievement(rarity === 'lendario' ? 'lendario' : 'prata'), 180);
      else bell(N('D7'), { at: 0.3, dur: 1.2, gain: 0.1 });
    },
    // ── Voz do dragão ──
    dragonChirp() {
      const b = 880 + Math.random() * 420;
      tone(b, { glide: b * 1.55, glideT: 0.07, dur: 0.13, gain: 0.09, vib: 28, vibDepth: 22, wet: 0.25 });
      tone(b * 1.2, { glide: b * 0.92, at: 0.14, dur: 0.16, gain: 0.08, vib: 24, vibDepth: 18, wet: 0.25 });
      tone(b / 2, { type: 'triangle', dur: 0.12, gain: 0.03, wet: 0.2 });
    },
    dragonHappy() {
      [0, 0.12, 0.24].forEach((at, i) => {
        const b = 900 + i * 160;
        tone(b, { glide: b * 1.4, glideT: 0.06, at, dur: 0.11, gain: 0.08, vib: 30, vibDepth: 18, wet: 0.25 });
      });
      sparkle({ at: 0.3, count: 3, gain: 0.04 });
    },
    dragonPurr() {
      tone(58, { type: 'sawtooth', dur: 0.95, gain: 0.1, attack: 0.12, lp: 360, am: 23, wet: 0.15 });
      tone(116, { type: 'triangle', dur: 0.9, gain: 0.03, attack: 0.15, am: 23, wet: 0.15 });
    },
    dragonSad() { tone(720, { glide: 430, dur: 0.55, gain: 0.07, vib: 6, vibDepth: 10, wet: 0.35 }); },
    dragonYawn() { tone(520, { glide: 300, dur: 0.8, gain: 0.05, vib: 4, vibDepth: 8, lp: 1400, wet: 0.35 }); },
    sick() { ['A5', 'G#5', 'G5', 'F#5'].forEach((k, i) => tone(N(k), { at: i * 0.18, dur: 0.45, gain: 0.08, vib: 5, vibDepth: 6 })); },
    healed() { ['E5', 'G#5', 'B5', 'E6'].forEach((k, i) => pluck(N(k), { at: i * 0.1, gain: 0.13 })); bell(N('E7'), { at: 0.42, dur: 1.2, gain: 0.08 }); },
    whoosh() { noise({ from: 300, to: 3000, dur: 0.4, gain: 0.07 }); },

    isMuted: () => muted,
    setMuted(v) {
      muted = !!v;
      try { localStorage.setItem(MUTE_KEY, muted ? '1' : '0'); } catch (e) {}
      if (muted && ctx && ctx.state === 'running') { try { ctx.suspend(); } catch (e) {} }
      if (!muted) { ac(); SFX.soft(); }
      muteListeners.forEach(fn => fn(muted));
    },
    onMute(fn) { muteListeners.add(fn); return () => muteListeners.delete(fn); },
  };

  function haptic(p) {
    if (muted) return;
    try { navigator.vibrate && navigator.vibrate(p); } catch (e) {}
  }

  // ════════════════════════════════════════════════════════════
  //  MAGIC FX CANVAS
  // ════════════════════════════════════════════════════════════
  const reduceMotion = (() => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } })();
  const DEFAULT_PALETTE = ['#C4B5FD', '#8B5CF6', '#67E8F9', '#FDE68A', '#F9A8D4'];

  let cv = null, g = null, dpr = 1, raf = 0;
  const parts = [], texts = [], rings = [];
  const spriteCache = new Map();

  function ensureCanvas() {
    if (cv) return true;
    if (!document.body) return false;
    cv = document.createElement('canvas');
    cv.className = 'fx-canvas';
    cv.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cv);
    g = cv.getContext('2d');
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

  function rgba(color, a) {
    let h = String(color || '#ffffff').replace('#', '');
    if (h.length === 3) h = h.split('').map(ch => ch + ch).join('');
    const n = parseInt(h.slice(0, 6), 16);
    if (isNaN(n)) return `rgba(255,255,255,${a})`;
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }
  function glowSprite(color) {
    const key = 'glow' + color;
    if (spriteCache.has(key)) return spriteCache.get(key);
    const s = document.createElement('canvas'); s.width = s.height = 64;
    const c = s.getContext('2d');
    const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(0.18, rgba(color, 1));
    gr.addColorStop(0.45, rgba(color, 0.33));
    gr.addColorStop(1, rgba(color, 0));
    c.fillStyle = gr; c.fillRect(0, 0, 64, 64);
    spriteCache.set(key, s);
    return s;
  }

  function drawStar(c, r) {
    c.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      const rr = i % 2 === 0 ? r : r * 0.28;
      c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    c.closePath();
  }
  function drawHeart(c, r) {
    c.beginPath();
    c.moveTo(0, r * 0.35);
    c.bezierCurveTo(-r * 1.1, -r * 0.4, -r * 0.45, -r * 1.15, 0, -r * 0.45);
    c.bezierCurveTo(r * 0.45, -r * 1.15, r * 1.1, -r * 0.4, 0, r * 0.35);
    c.closePath();
  }
  function drawGem(c, r) {
    c.beginPath();
    c.moveTo(0, -r); c.lineTo(r * 0.8, -r * 0.2); c.lineTo(0, r); c.lineTo(-r * 0.8, -r * 0.2); c.closePath();
  }
  const GLYPHS = ['✦', '✧', '᛭', 'ᚨ', 'ᚱ', 'ᛟ', '§', '∞', '☽', '⚖'];

  function loop() {
    if (!g) return;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, innerWidth, innerHeight);
    const now = performance.now();

    // Rings
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i];
      const t = (now - r.t0) / r.dur;
      if (t < 0) continue;
      if (t >= 1) { rings.splice(i, 1); continue; }
      const e = 1 - Math.pow(1 - t, 3);
      g.globalCompositeOperation = 'lighter';
      g.strokeStyle = r.color; g.globalAlpha = (1 - t) * 0.8;
      g.lineWidth = r.width * (1 - t) + 0.5;
      g.beginPath(); g.arc(r.x, r.y, 8 + e * r.max, 0, Math.PI * 2); g.stroke();
    }

    // Particles
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      const age = now - p.t0;
      if (age < 0) continue;
      if (age > p.life) {
        parts.splice(i, 1);
        if (p.onArrive) p.onArrive();
        continue;
      }
      const t = age / p.life;
      if (p.path) {
        // bezier homing
        const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const u = 1 - e;
        const tx = typeof p.path.tx === 'function' ? p.path.tx() : p.path.tx;
        const ty = typeof p.path.ty === 'function' ? p.path.ty() : p.path.ty;
        p.x = u * u * p.path.x0 + 2 * u * e * p.path.cx + e * e * tx;
        p.y = u * u * p.path.y0 + 2 * u * e * p.path.cy + e * e * ty;
      } else {
        p.vx *= p.drag; p.vy = p.vy * p.drag + p.grav;
        p.x += p.vx; p.y += p.vy;
      }
      p.rot += p.vr;
      const fade = p.path ? (t > 0.9 ? (1 - t) * 10 : 1) : (t < 0.1 ? t * 10 : 1 - Math.pow(t, 2));
      const tw = p.twinkle ? 0.55 + 0.45 * Math.sin(age / 60 + p.seed) : 1;
      const alpha = Math.max(0, fade * tw);
      const size = p.size * (p.shrink ? (1 - t * 0.7) : 1);

      g.save();
      g.translate(p.x, p.y);
      g.rotate(p.rot);
      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = alpha * 0.9;
      const spr = glowSprite(p.color);
      const gs = size * 4.2;
      g.drawImage(spr, -gs / 2, -gs / 2, gs, gs);
      g.globalCompositeOperation = 'source-over';
      g.globalAlpha = alpha;
      if (p.kind === 'star') { drawStar(g, size); g.fillStyle = '#fff'; g.fill(); }
      else if (p.kind === 'heart') { drawHeart(g, size); g.fillStyle = p.color; g.fill(); g.globalAlpha = alpha * 0.6; g.fillStyle = '#fff'; g.beginPath(); g.arc(-size * 0.35, -size * 0.45, size * 0.18, 0, 7); g.fill(); }
      else if (p.kind === 'gem') {
        drawGem(g, size);
        const gr = g.createLinearGradient(-size, -size, size, size);
        gr.addColorStop(0, '#E0F2FE'); gr.addColorStop(0.5, p.color); gr.addColorStop(1, '#4C1D95');
        g.fillStyle = gr; g.fill();
        g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 0.8; g.stroke();
      }
      else if (p.kind === 'glyph') {
        g.fillStyle = p.color; g.font = `700 ${size * 2.2}px "Space Grotesk", serif`;
        g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(p.glyph, 0, 0);
      }
      else if (p.kind === 'spark') { g.fillStyle = '#fff'; g.beginPath(); g.arc(0, 0, size * 0.4, 0, 7); g.fill(); }
      g.restore();
    }

    // Floating texts
    for (let i = texts.length - 1; i >= 0; i--) {
      const tx = texts[i];
      const t = (now - tx.t0) / tx.life;
      if (t < 0) continue;
      if (t >= 1) { texts.splice(i, 1); continue; }
      const e = 1 - Math.pow(1 - t, 3);
      const y = tx.y - e * tx.rise;
      const sc = t < 0.15 ? 0.6 + (t / 0.15) * 0.55 : 1.15 - Math.min(0.15, (t - 0.15));
      g.save();
      g.translate(tx.x, y); g.scale(sc, sc);
      g.globalAlpha = t > 0.7 ? (1 - t) / 0.3 : 1;
      g.font = `800 ${tx.size}px "Space Grotesk", Inter, sans-serif`;
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.shadowColor = tx.color; g.shadowBlur = 16;
      g.lineWidth = 4; g.strokeStyle = 'rgba(20,8,48,0.55)'; g.strokeText(tx.text, 0, 0);
      g.fillStyle = tx.color; g.fillText(tx.text, 0, 0);
      g.shadowBlur = 0; g.fillStyle = 'rgba(255,255,255,0.55)'; g.fillText(tx.text, 0, -1);
      g.restore();
    }

    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    if (parts.length || texts.length || rings.length) raf = requestAnimationFrame(loop);
    else { raf = 0; g.clearRect(0, 0, innerWidth, innerHeight); }
  }
  function kick() { if (!raf) raf = requestAnimationFrame(loop); }

  function mkPart(o) {
    return Object.assign({
      x: 0, y: 0, vx: 0, vy: 0, drag: 0.97, grav: 0.12, life: 1200, t0: performance.now(),
      size: 4, color: '#C4B5FD', kind: 'star', rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.2,
      twinkle: Math.random() < 0.5, seed: Math.random() * 10, shrink: true,
    }, o);
  }

  let lastPointer = null;
  if (typeof document !== 'undefined') {
    document.addEventListener('pointerdown', (e) => { lastPointer = { x: e.clientX, y: e.clientY, t: Date.now() }; }, true);
  }

  const FX = {
    origin() {
      if (lastPointer && Date.now() - lastPointer.t < 2500) return { x: lastPointer.x, y: lastPointer.y };
      return { x: innerWidth / 2, y: innerHeight * 0.45 };
    },
    center() { return { x: innerWidth / 2, y: innerHeight * 0.45 }; },
    elCenter(el) {
      if (!el) return FX.center();
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    },
    burst(x, y, o = {}) {
      if (!ensureCanvas()) return;
      const count = Math.round((o.count || 24) * (reduceMotion ? 0.3 : 1));
      const pal = o.palette || DEFAULT_PALETTE;
      const kinds = o.kinds || ['star', 'spark'];
      const speed = o.speed || 5;
      for (let i = 0; i < count; i++) {
        const a = o.angle != null ? o.angle + (Math.random() - 0.5) * (o.spread || 1) : Math.random() * Math.PI * 2;
        const v = speed * (0.35 + Math.random() * 0.9);
        const kind = kinds[i % kinds.length];
        parts.push(mkPart({
          x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (o.lift || 1.2),
          grav: o.grav ?? 0.1, drag: o.drag ?? 0.955,
          life: (o.life || 1100) * (0.7 + Math.random() * 0.6),
          size: (o.size || 4) * (0.6 + Math.random() * 0.8),
          color: pal[i % pal.length], kind,
          glyph: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
          t0: performance.now() + (o.stagger ? Math.random() * o.stagger : 0),
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
      const pal = o.palette || DEFAULT_PALETTE;
      for (let i = 0; i < count; i++) {
        parts.push(mkPart({
          x: Math.random() * innerWidth, y: -20 - Math.random() * 80,
          vx: (Math.random() - 0.5) * 1.2, vy: 1.5 + Math.random() * 3, grav: 0.04, drag: 0.995,
          life: 2200 + Math.random() * 1600, size: 3 + Math.random() * 4,
          color: pal[i % pal.length], kind: (o.kinds || ['star', 'spark', 'glyph'])[i % (o.kinds || ['star', 'spark', 'glyph']).length],
          glyph: GLYPHS[Math.floor(Math.random() * GLYPHS.length)], twinkle: true, shrink: false,
          t0: performance.now() + Math.random() * (o.spread || 900),
        }));
      }
      kick();
    },
    fountain(x, y, o = {}) {
      FX.burst(x, y, Object.assign({ angle: -Math.PI / 2, spread: 1.1, speed: 8, grav: 0.22, lift: 2, count: 40, life: 1500 }, o));
    },
    floatText(x, y, text, o = {}) {
      if (!ensureCanvas()) return;
      texts.push({ x, y, text, color: o.color || '#FDE68A', size: o.size || 26, rise: o.rise || 70, life: o.life || 1500, t0: performance.now() + (o.delay || 0) });
      kick();
    },
    // Gemas/orbes voando até um elemento-alvo (ex.: contador de gemas no header)
    flyTo(from, target, o = {}) {
      if (!ensureCanvas()) return;
      const getEl = () => (typeof target === 'string' ? document.querySelector(target) : target);
      const el = getEl();
      if (!el) { if (o.onArrive) o.onArrive(); return; }
      const count = Math.max(1, Math.min(o.count || 8, reduceMotion ? 3 : 16));
      let arrived = 0;
      for (let i = 0; i < count; i++) {
        const spreadA = Math.random() * Math.PI * 2;
        const x0 = from.x + Math.cos(spreadA) * 18, y0 = from.y + Math.sin(spreadA) * 18;
        const tgt = FX.elCenter(el);
        parts.push(mkPart({
          x: x0, y: y0, kind: o.kind || 'gem', color: o.color || '#A78BFA', size: o.size || 6,
          life: 750 + i * 55 + Math.random() * 120, twinkle: false, shrink: false,
          t0: performance.now() + i * 45,
          path: {
            x0, y0,
            cx: (x0 + tgt.x) / 2 + (Math.random() - 0.5) * 260,
            cy: Math.min(y0, tgt.y) - 80 - Math.random() * 140,
            tx: () => FX.elCenter(getEl()).x, ty: () => FX.elCenter(getEl()).y,
          },
          onArrive: () => {
            arrived++;
            SFX.coinTick();
            const c = FX.elCenter(getEl());
            FX.burst(c.x, c.y, { count: 5, speed: 2.5, size: 3, life: 500, palette: [o.color || '#A78BFA', '#fff'] });
            const tEl = getEl();
            if (tEl) { tEl.classList.remove('fx-pulse'); void tEl.offsetWidth; tEl.classList.add('fx-pulse'); }
            if (arrived === count && o.onArrive) o.onArrive();
          },
        }));
      }
      kick();
    },
    flash(color = 'rgba(196,181,253,0.55)', dur = 700) {
      if (!document.body || reduceMotion) return;
      const d = document.createElement('div');
      d.className = 'fx-flash';
      d.style.setProperty('--fx-flash', color);
      d.style.animationDuration = dur + 'ms';
      document.body.appendChild(d);
      setTimeout(() => d.remove(), dur + 50);
    },
    hearts(x, y, n = 8) {
      FX.burst(x, y, { count: n, kinds: ['heart'], palette: ['#F472B6', '#F9A8D4', '#C084FC'], speed: 3.2, grav: -0.03, lift: 2.2, size: 6, life: 1400, drag: 0.97 });
    },
  };

  // ════════════════════════════════════════════════════════════
  //  CELEBRAÇÕES (API usada pelo app inteiro)
  // ════════════════════════════════════════════════════════════
  const origEmergency = window.playEmergency;
  window.SFX = SFX;
  window.FX = FX;
  window.haptic = haptic;

  window.playEvolution     = () => SFX.evolution();
  window.playSick          = () => SFX.sick();
  window.playHealed        = () => SFX.healed();
  window.playBlip          = () => SFX.tap();
  window.playCheckChime    = () => SFX.check();
  window.playTopicMastered = () => SFX.mastered();
  window.playTimerEnd      = () => SFX.timerEnd();
  window.playEmergency     = () => { if (!muted && origEmergency) origEmergency(); };

  window.celebrateLight = function () {
    const o = FX.origin();
    FX.burst(o.x, o.y, { count: 16, speed: 4, size: 3.5, kinds: ['star', 'spark'], palette: ['#C4B5FD', '#67E8F9', '#FDE68A'] });
    SFX.soft(); haptic(8);
  };
  window.celebrateHighEnergy = function () {
    const o = FX.origin();
    FX.ring(o.x, o.y, { color: '#C4B5FD', max: 120 });
    FX.burst(o.x, o.y, { count: 42, speed: 7, size: 4.5, kinds: ['star', 'spark', 'glyph'] });
    SFX.gem(); haptic([10, 30, 10]);
  };
  window.celebrateVictory = function () {
    const o = FX.center();
    FX.flash('rgba(196,181,253,0.35)', 800);
    FX.ring(o.x, o.y, { color: '#FDE68A', max: 260, width: 5 });
    FX.ring(o.x, o.y, { color: '#A78BFA', max: 360, width: 3, delay: 120 });
    FX.burst(o.x, o.y, { count: 90, speed: 10, size: 5, kinds: ['star', 'spark', 'glyph', 'gem'] });
    FX.rain({ count: 60 });
    SFX.victory(); haptic([15, 40, 15, 40, 30]);
  };
  window.celebrateEvolution = function () {
    const o = FX.center();
    FX.flash('rgba(255,255,255,0.8)', 900);
    FX.ring(o.x, o.y, { color: '#FDE68A', max: 420, width: 6 });
    FX.ring(o.x, o.y, { color: '#C4B5FD', max: 560, width: 4, delay: 150 });
    FX.burst(o.x, o.y, { count: 140, speed: 13, size: 5.5, kinds: ['star', 'spark', 'glyph', 'gem'] });
    FX.rain({ count: 140, spread: 1600 });
    haptic([20, 50, 20, 50, 60]);
  };

  // ════════════════════════════════════════════════════════════
  //  SOUND TOGGLE (header)
  // ════════════════════════════════════════════════════════════
  function SoundToggle() {
    const [m, setM] = React.useState(SFX.isMuted());
    React.useEffect(() => SFX.onMute(setM), []);
    return (
      <button className="hdr-chip hdr-icon-btn" title={m ? 'Ativar sons' : 'Silenciar sons'}
        aria-label={m ? 'Ativar sons' : 'Silenciar sons'}
        onClick={() => SFX.setMuted(!m)}>
        {m ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="m23 9-6 6M17 9l6 6"/></svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a10 10 0 0 1 0 14"/></svg>
        )}
      </button>
    );
  }
  window.SoundToggle = SoundToggle;
})();
