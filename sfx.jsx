// Lendário — SFX Engine
// Sons sintetizados via Web Audio (nenhum arquivo externo).
// • Master gain com mudo persistente (localStorage 'toga_sfx_muted')
// • Reverb leve gerado por impulso de ruído → sons "mágicos" e cheios
// • Vibração curta (mobile) nas recompensas
// Exposto em window.SFX e reaproveitado por splash.jsx (celebrações antigas).

(function () {
  let ctx = null, master = null, dry = null, wet = null, reverb = null;
  let muted = false;
  try { muted = localStorage.getItem('toga_sfx_muted') === '1'; } catch (e) {}
  const listeners = new Set();

  function buildImpulse(c, seconds, decay) {
    const rate = c.sampleRate, len = Math.floor(rate * seconds);
    const buf = c.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  function getCtx() {
    if (!ctx) {
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        master = ctx.createGain();
        master.gain.value = muted ? 0 : 0.9;
        master.connect(ctx.destination);
        dry = ctx.createGain(); dry.gain.value = 1; dry.connect(master);
        reverb = ctx.createConvolver(); reverb.buffer = buildImpulse(ctx, 1.8, 2.6);
        wet = ctx.createGain(); wet.gain.value = 0.28;
        reverb.connect(wet).connect(master);
      } catch (e) { ctx = null; }
    }
    if (ctx && ctx.state === 'suspended') { try { ctx.resume(); } catch (e) {} }
    return ctx;
  }

  // Saída padrão: seco + envio para o reverb
  function out() {
    const c = getCtx(); if (!c) return null;
    const node = c.createGain();
    node.connect(dry);
    const send = c.createGain(); send.gain.value = 0.9;
    node.connect(send).connect(reverb);
    return node;
  }

  // Tom com envelope ADSR simples. type: sine | triangle | square | sawtooth
  function tone({ f = 440, t = 0, d = 0.25, type = 'sine', g = 0.15, attack = 0.008, slideTo = null, detune = 0 }) {
    if (muted) return;
    const c = getCtx(); if (!c) return;
    const dest = out(); if (!dest) return;
    const now = c.currentTime + t;
    const o = c.createOscillator();
    const v = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, now); o.detune.value = detune;
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, now + d);
    v.gain.setValueAtTime(0.0001, now);
    v.gain.exponentialRampToValueAtTime(g, now + attack);
    v.gain.exponentialRampToValueAtTime(0.0001, now + d);
    o.connect(v).connect(dest);
    o.start(now); o.stop(now + d + 0.05);
  }

  // Sino: fundamental + parciais inarmônicos → timbre de "cristal"
  function bell(f, t = 0, d = 0.9, g = 0.12) {
    tone({ f, t, d, g, type: 'sine' });
    tone({ f: f * 2.01, t, d: d * 0.6, g: g * 0.45, type: 'sine' });
    tone({ f: f * 3.02, t, d: d * 0.35, g: g * 0.2, type: 'sine' });
  }

  function noise({ t = 0, d = 0.3, g = 0.12, freq = 1200, q = 1, sweepTo = null, type = 'bandpass' }) {
    if (muted) return;
    const c = getCtx(); if (!c) return;
    const dest = out(); if (!dest) return;
    const now = c.currentTime + t;
    const len = Math.floor(c.sampleRate * d);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource(); src.buffer = buf;
    const filt = c.createBiquadFilter(); filt.type = type; filt.Q.value = q;
    filt.frequency.setValueAtTime(freq, now);
    if (sweepTo) filt.frequency.exponentialRampToValueAtTime(sweepTo, now + d);
    const v = c.createGain();
    v.gain.setValueAtTime(0.0001, now);
    v.gain.exponentialRampToValueAtTime(g, now + 0.02);
    v.gain.exponentialRampToValueAtTime(0.0001, now + d);
    src.connect(filt).connect(v).connect(dest);
    src.start(now); src.stop(now + d + 0.02);
  }

  const vibrate = (p) => {
    try {
      const ua = navigator.userActivation;
      if (!muted && navigator.vibrate && (!ua || ua.hasBeenActive)) navigator.vibrate(p);
    } catch (e) {}
  };

  const N = { C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880, B5: 987.77,
              C6: 1046.5, D6: 1174.66, E6: 1318.51, G6: 1567.98, A6: 1760, C7: 2093 };

  const SFX = {
    ctx: getCtx,
    out,
    isMuted: () => muted,
    setMuted(m) {
      muted = !!m;
      try { localStorage.setItem('toga_sfx_muted', muted ? '1' : '0'); } catch (e) {}
      if (master) master.gain.value = muted ? 0 : 0.9;
      listeners.forEach(fn => fn(muted));
      if (!muted) SFX.pop();
    },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    vibrate,

    // Clique suave de interface
    pop() { tone({ f: 620, d: 0.09, g: 0.09, type: 'sine', slideTo: 980 }); },
    tick() { tone({ f: 1400, d: 0.04, g: 0.05, type: 'triangle' }); },
    // Moeda / cristal coletado
    gem() {
      tone({ f: N.B5, d: 0.12, g: 0.12, type: 'square', attack: 0.004 });
      tone({ f: N.E6, t: 0.07, d: 0.35, g: 0.1, type: 'square', attack: 0.004 });
      bell(N.E6 * 2, 0.07, 0.4, 0.03);
      vibrate(12);
    },
    // Chuva de cristais (vários pings)
    gemRain(n = 6) {
      for (let i = 0; i < n; i++) tone({ f: 1800 + Math.random() * 1400, t: i * 0.055, d: 0.18, g: 0.05, type: 'sine' });
      vibrate([10, 30, 10]);
    },
    // Brilho mágico (arpejo cintilante)
    sparkle() {
      [N.E6, N.G6, N.A6, N.C7].forEach((f, i) => tone({ f, t: i * 0.045, d: 0.3, g: 0.05, type: 'sine' }));
    },
    // XP ganho — "bling" ascendente
    xp() {
      tone({ f: N.G5, d: 0.1, g: 0.08, type: 'triangle' });
      tone({ f: N.D6, t: 0.06, d: 0.22, g: 0.09, type: 'triangle' });
    },
    // Dragão: pio fofo (chirp) — duas subidas rápidas
    chirp() {
      const base = 700 + Math.random() * 180;
      tone({ f: base, d: 0.11, g: 0.1, type: 'sine', slideTo: base * 1.9 });
      tone({ f: base * 1.1, t: 0.13, d: 0.14, g: 0.09, type: 'sine', slideTo: base * 2.3 });
      vibrate(8);
    },
    // Dragão: ronronar ao receber carinho
    purr() {
      if (muted) return;
      const c = getCtx(); if (!c) return;
      const dest = out(); if (!dest) return;
      const now = c.currentTime;
      const o = c.createOscillator(); o.type = 'triangle'; o.frequency.value = 110;
      const lfo = c.createOscillator(); lfo.frequency.value = 22;
      const lfoG = c.createGain(); lfoG.gain.value = 0.05;
      const v = c.createGain();
      v.gain.setValueAtTime(0.0001, now);
      v.gain.exponentialRampToValueAtTime(0.09, now + 0.08);
      v.gain.exponentialRampToValueAtTime(0.0001, now + 0.75);
      lfo.connect(lfoG).connect(v.gain);
      o.connect(v).connect(dest);
      o.start(now); lfo.start(now); o.stop(now + 0.8); lfo.stop(now + 0.8);
      SFX.chirp();
    },
    // Mastigando petisco
    munch() {
      [0, 0.16, 0.32].forEach(t => noise({ t, d: 0.09, g: 0.16, freq: 900, q: 0.8, type: 'lowpass' }));
      tone({ f: 520, t: 0.5, d: 0.12, g: 0.08, type: 'sine', slideTo: 900 });
      vibrate([15, 40, 15, 40, 15]);
    },
    // Sopro de fogo mágico (constância / chama)
    fire() {
      noise({ d: 0.7, g: 0.14, freq: 300, sweepTo: 2600, q: 0.7 });
      tone({ f: 180, d: 0.5, g: 0.05, type: 'sawtooth', slideTo: 90 });
    },
    // Whoosh de abertura de modal
    whoosh() { noise({ d: 0.35, g: 0.07, freq: 400, sweepTo: 3200, q: 0.6 }); },
    // Missão concluída — sino ascendente
    quest() {
      bell(N.C6, 0, 0.6, 0.09); bell(N.E6, 0.1, 0.6, 0.09); bell(N.G6, 0.2, 0.9, 0.1);
      vibrate([20, 40, 30]);
    },
    // Baú abrindo — rangido + explosão de brilho
    chest(rare = false) {
      tone({ f: 140, d: 0.35, g: 0.06, type: 'sawtooth', slideTo: 260 });
      noise({ t: 0.3, d: 0.25, g: 0.1, freq: 2000, sweepTo: 6000, q: 0.5 });
      const seq = rare ? [N.C6, N.E6, N.G6, N.C7, N.E6 * 2] : [N.G5, N.C6, N.E6, N.G6];
      seq.forEach((f, i) => bell(f, 0.35 + i * 0.07, 0.7, 0.07));
      if (rare) setTimeout(() => SFX.gemRain(10), 700);
      vibrate(rare ? [30, 50, 30, 50, 80] : [25, 40, 25]);
    },
    // Conquista desbloqueada — glissando mágico + acorde
    achievement(tier = 'bronze') {
      const top = { bronze: 0, prata: 2, ouro: 4, lendario: 7 }[tier] || 0;
      const scale = [N.C5, N.D5, N.E5, N.G5, N.A5, N.C6, N.D6, N.E6, N.G6, N.A6, N.C7];
      scale.slice(0, 6 + Math.ceil(top / 2)).forEach((f, i) => tone({ f, t: i * 0.04, d: 0.25, g: 0.05, type: 'triangle' }));
      const t0 = 0.3 + top * 0.02;
      [N.C6, N.E6, N.G6].forEach(f => bell(f, t0, 1.4, 0.07));
      if (top >= 4) bell(N.C7, t0 + 0.15, 1.6, 0.06);
      vibrate([30, 60, 40]);
    },
    // Evolução do dragão — subida longa, flash e acorde celestial
    evolveCharge() {
      tone({ f: 110, d: 2.2, g: 0.07, type: 'sawtooth', slideTo: 880 });
      noise({ d: 2.2, g: 0.06, freq: 200, sweepTo: 5000, q: 1.2 });
      for (let i = 0; i < 14; i++) tone({ f: 600 + i * 90, t: i * 0.14, d: 0.12, g: 0.03, type: 'sine' });
    },
    evolveReveal() {
      noise({ d: 0.6, g: 0.18, freq: 5000, sweepTo: 300, q: 0.4, type: 'lowpass' });
      [N.C5, N.G5, N.C6, N.E6, N.G6].forEach((f, i) => bell(f, 0.05 + i * 0.03, 2.2, 0.08));
      [N.E6, N.G6, N.C7].forEach((f, i) => tone({ f, t: 0.6 + i * 0.1, d: 0.5, g: 0.04, type: 'sine' }));
      vibrate([60, 60, 120]);
    },
    // Aviso triste (dragão doente)
    sad() {
      [N.E5, 622.25, N.D5].forEach((f, i) => tone({ f, t: i * 0.22, d: 0.45, g: 0.08, type: 'sine' }));
    },
    // Compra na loja
    purchase() {
      SFX.gem();
      [N.C6, N.G6].forEach((f, i) => bell(f, 0.15 + i * 0.08, 0.6, 0.07));
    },
    // Equipar acessório
    equip() {
      noise({ d: 0.18, g: 0.06, freq: 3000, q: 2 });
      tone({ f: N.A5, t: 0.05, d: 0.2, g: 0.08, type: 'triangle', slideTo: N.E6 });
    },
  };

  window.SFX = SFX;
})();
