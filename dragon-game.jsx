// TOGA — Dragon Game Engine (window.DG)
// Regras puras (sem UI): economia de cristais, missões diárias, baú,
// sinais vitais do dragão, humor, falas contextuais e conquistas.
// Tudo é derivado dos registros de estudo — o dragão reage ao que o estudante faz de verdade.

(function () {
  const todayISO = () => new Date().toISOString().slice(0, 10); // mesma convenção dos dailyLogs
  const isoDaysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); };
  const clamp = (v, a = 0, b = 100) => Math.max(a, Math.min(b, v));
  const entriesOf = (l) => (l && l.entries && l.entries.length > 0) ? l.entries : (l ? [l] : []);

  // ── Economia ───────────────────────────────────────────────
  // Chama do Dragão: multiplicador por constância
  function comboMultiplier(streak) {
    const s = streak || 0;
    if (s >= 30) return 2;
    if (s >= 14) return 1.5;
    if (s >= 7) return 1.25;
    if (s >= 3) return 1.1;
    return 1;
  }
  function nextComboStep(streak) {
    const steps = [[3, 1.1], [7, 1.25], [14, 1.5], [30, 2]];
    return steps.find(([d]) => (streak || 0) < d) || null;
  }
  // Recompensa por sessão registrada (horas, questões, acertos, revisões)
  function studyRewards(entry, streak) {
    const h = Number(entry.hours) || 0, q = Number(entry.questions) || 0;
    const c = Number(entry.correct) || 0, r = Number(entry.reviews) || 0;
    const mult = comboMultiplier(streak);
    const xp = Math.round((h * 20 + q * 0.5 + c * 0.5 + r * 0.2) * mult);
    const gems = Math.round((h * 6 + q / 10 + r / 20) * mult);
    return { xp, gems, mult };
  }

  // ── Catálogo da loja ───────────────────────────────────────
  const ITEMS = [
    // Chapéus
    { id: 'hat_beret',    slot: 'hat',  name: 'Boina de Estudante',  icon: '🎨', price: 80,  minStage: 3 },
    { id: 'hat_nightcap', slot: 'hat',  name: 'Gorro do Soninho',    icon: '🌙', price: 60,  minStage: 3 },
    { id: 'hat_wizard',   slot: 'hat',  name: 'Chapéu de Mago',      icon: '🧙', price: 140, minStage: 3 },
    { id: 'hat_grad',     slot: 'hat',  name: 'Capelo de Formatura', icon: '🎓', price: 220, minStage: 4 },
    { id: 'hat_crown',    slot: 'hat',  name: 'Coroa Estelar',       icon: '👑', price: 520, minStage: 6 },
    // Rosto
    { id: 'face_glasses', slot: 'face', name: 'Óculos de Leitura',   icon: '👓', price: 70,  minStage: 3 },
    { id: 'face_stars',   slot: 'face', name: 'Bochechas Estreladas',icon: '⭐', price: 50,  minStage: 3 },
    { id: 'face_monocle', slot: 'face', name: 'Monóculo do Juiz',    icon: '🧐', price: 160, minStage: 5 },
    // Pescoço
    { id: 'neck_scarf',   slot: 'neck', name: 'Cachecol Acadêmico',  icon: '🧣', price: 60,  minStage: 3 },
    { id: 'neck_bowtie',  slot: 'neck', name: 'Gravata-borboleta',   icon: '🎀', price: 90,  minStage: 3 },
    { id: 'neck_toga',    slot: 'neck', name: 'Toga de Magistrado',  icon: '⚖️', price: 380, minStage: 5 },
    { id: 'neck_medal',   slot: 'neck', name: 'Medalha da Aprovação',icon: '🏅', price: 450, minStage: 6 },
    // Mãos & amigos
    { id: 'held_quill',   slot: 'held', name: 'Pena Encantada',      icon: '🪶', price: 70,  minStage: 3 },
    { id: 'held_book',    slot: 'held', name: 'Grimório de Bolso',   icon: '📕', price: 110, minStage: 3 },
    { id: 'held_gavel',   slot: 'held', name: 'Martelo da Justiça',  icon: '🔨', price: 200, minStage: 4 },
    { id: 'held_owl',     slot: 'held', name: 'Corujinha Sábia',     icon: '🦉', price: 320, minStage: 4 },
    // Auras
    { id: 'aura_stars',   slot: 'aura', name: 'Aura Estelar',        icon: '✨', price: 260, minStage: 1 },
    { id: 'aura_fire',    slot: 'aura', name: 'Aura Flamejante',     icon: '🔥', price: 320, minStage: 1 },
    { id: 'aura_rainbow', slot: 'aura', name: 'Aurora Boreal',       icon: '🌈', price: 480, minStage: 1 },
    // Cenários
    { id: 'bg_biblioteca',slot: 'bg',   name: 'Biblioteca Arcana',   icon: '📚', price: 0,   minStage: 1 },
    { id: 'bg_floresta',  slot: 'bg',   name: 'Bosque Encantado',    icon: '🍄', price: 150, minStage: 1 },
    { id: 'bg_torre',     slot: 'bg',   name: 'Torre Astral',        icon: '🔭', price: 180, minStage: 1 },
    { id: 'bg_tribunal',  slot: 'bg',   name: 'Tribunal Celestial',  icon: '🏛️', price: 300, minStage: 1 },
    { id: 'bg_galaxia',   slot: 'bg',   name: 'Nebulosa',            icon: '🌌', price: 420, minStage: 1 },
  ];
  const SLOTS = [
    { id: 'hat',  label: 'Chapéus' },
    { id: 'face', label: 'Rosto' },
    { id: 'neck', label: 'Pescoço' },
    { id: 'held', label: 'Mãos & Amigos' },
    { id: 'aura', label: 'Auras' },
    { id: 'bg',   label: 'Cenários' },
  ];
  const TREATS = [
    { id: 'treat_cookie', name: 'Biscoito Rúnico', icon: '🍪', price: 10, mana: 10, wisdom: 0,  aff: 3, desc: '+10 Mana' },
    { id: 'treat_potion', name: 'Poção de Foco',   icon: '🧪', price: 25, mana: 15, wisdom: 10, aff: 4, desc: '+15 Mana · +10 Sabedoria' },
    { id: 'treat_star',   name: 'Fruta Estelar',   icon: '🌟', price: 45, mana: 20, wisdom: 15, aff: 8, desc: 'Tudo +15 e brilho extra' },
  ];
  const MAX_FEEDS_PER_DAY = 3;
  const itemById = (id) => ITEMS.find(i => i.id === id);

  // ── Estado do dragão ───────────────────────────────────────
  const emptyToday = (date) => ({ date, checks: 0, pets: 0, feeds: 0, feedMana: 0, feedWis: 0, feedAff: 0, claimed: [], perfect: false, chest: null });
  function defaultDragon() {
    return {
      name: 'Lumi', gems: 0, gemsTotal: 0,
      owned: ['bg_biblioteca'], equipped: { bg: 'bg_biblioteca' },
      today: emptyToday(todayISO()),
      stats: { pets: 0, feeds: 0, quests: 0, perfectDays: 0, chests: 0, purchases: 0 },
      chestStreak: 0, lastChestDate: null,
      achievements: {}, flags: {}, bornAt: new Date().toISOString(),
    };
  }
  function ensure(shared) {
    const base = defaultDragon();
    const d = shared.dragon ? { ...base, ...shared.dragon,
      stats: { ...base.stats, ...(shared.dragon.stats || {}) },
      equipped: { ...base.equipped, ...(shared.dragon.equipped || {}) },
      flags: { ...(shared.dragon.flags || {}) },
      achievements: { ...(shared.dragon.achievements || {}) } } : base;
    const t = todayISO();
    if (!d.today || d.today.date !== t) d.today = emptyToday(t);
    return d;
  }
  const withDragon = (shared, fn) => {
    const d = ensure(shared);
    const next = fn(d, shared);
    return next && next.__shared ? next.__shared : { ...shared, dragon: next || d };
  };
  function addReward(shared, { xp = 0, gems = 0 }) {
    const d = ensure(shared);
    return {
      ...shared,
      xp: Math.max(0, (shared.xp || 0) + xp),
      dragon: { ...d, gems: Math.max(0, d.gems + gems), gemsTotal: Math.max(0, d.gemsTotal + gems) },
    };
  }

  // ── Estatísticas do dia ────────────────────────────────────
  function dayStats(shared, iso) {
    const log = (shared.dailyLogs || []).find(l => l.date === iso);
    const ents = entriesOf(log);
    const out = { hours: 0, questions: 0, correct: 0, wrong: 0, reviews: 0, sessions: 0, blindado: 0, disciplines: new Set() };
    if (!log) return { ...out, disciplines: 0, accuracy: 0 };
    out.hours = log.hours || 0; out.questions = log.questions || 0; out.correct = log.correct || 0;
    out.wrong = log.wrong || 0; out.reviews = log.reviews || 0;
    ents.forEach(e => {
      if ((e.hours || 0) + (e.questions || 0) + (e.reviews || 0) > 0) out.sessions++;
      if (e.blindado) out.blindado++;
      if (e.discipline) out.disciplines.add(e.discipline);
    });
    const graded = out.correct + out.wrong;
    return { ...out, disciplines: out.disciplines.size, accuracy: graded > 0 ? (out.correct / graded) * 100 : 0, graded };
  }
  const todayStats = (shared) => dayStats(shared, todayISO());
  const studiedToday = (shared) => { const t = todayStats(shared); return t.hours > 0 || t.questions > 0 || t.reviews > 0; };

  // ── Missões diárias ────────────────────────────────────────
  function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  const fmtH = (h) => {
    const m = Math.round(h * 60);
    if (m < 60) return `${m} min`;
    return m % 60 === 0 ? `${m / 60}h` : `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}`;
  };
  const roundHalf = (x) => Math.max(0.5, Math.round(x * 2) / 2);
  const round5 = (x) => Math.max(5, Math.round(x / 5) * 5);

  const QUEST_DEFS = {
    hours_half:  (g) => { const t = roundHalf((g.dailyHours || 4) * 0.5); return { icon: '⏳', title: `Estude ${fmtH(t)} hoje`, metric: 'hours', target: t, xp: 20, gems: 15, fmt: fmtH }; },
    hours_full:  (g) => { const t = roundHalf(g.dailyHours || 4); return { icon: '🏔️', title: `Bata a meta: ${fmtH(t)} de estudo`, metric: 'hours', target: t, xp: 45, gems: 35, fmt: fmtH, hard: true }; },
    questions:   (g) => { const t = round5((g.dailyQuestions || 40) * 0.5); return { icon: '🎯', title: `Resolva ${t} questões`, metric: 'questions', target: t, xp: 20, gems: 15 }; },
    questions_full: (g) => { const t = round5(g.dailyQuestions || 40); return { icon: '⚔️', title: `Resolva ${t} questões (meta cheia)`, metric: 'questions', target: t, xp: 40, gems: 30, hard: true }; },
    accuracy:    () => ({ icon: '🏹', title: 'Acerte 70%+ (mín. 10 questões)', metric: 'accuracy', target: 70, xp: 30, gems: 20, fmt: (v) => `${Math.round(v)}%` }),
    checks:      () => ({ icon: '✅', title: 'Marque 5 checks no edital', metric: 'checks', target: 5, xp: 15, gems: 15 }),
    blindado:    () => ({ icon: '🛡️', title: 'Conclua 1 sessão no Modo Blindado', metric: 'blindado', target: 1, xp: 25, gems: 20 }),
    pets:        () => ({ icon: '💜', title: 'Faça 3 carinhos no seu dragão', metric: 'pets', target: 3, xp: 5, gems: 10 }),
    reviews:     (g) => { const t = round5((g.dailyFlashcards || 30) * 0.5); return { icon: '🃏', title: `Revise ${t} flashcards`, metric: 'reviews', target: t, xp: 15, gems: 15 }; },
    disciplines: () => ({ icon: '📚', title: 'Estude 2 disciplinas diferentes', metric: 'disciplines', target: 2, xp: 20, gems: 15 }),
    sessions:    () => ({ icon: '📝', title: 'Registre 2 sessões de estudo', metric: 'sessions', target: 2, xp: 15, gems: 15 }),
  };
  function questIdsFor(date) {
    const h = hash('toga-quest-' + date);
    const slot2 = ['questions', 'questions', 'reviews'][h % 3];
    const pool3 = ['checks', 'blindado', 'accuracy', 'disciplines', 'sessions', 'pets', 'hours_full', 'questions_full'];
    let slot3 = pool3[(h >>> 4) % pool3.length];
    if (slot3 === 'questions_full' && slot2 === 'questions') slot3 = 'disciplines';
    return ['hours_half', slot2, slot3];
  }
  function getDailyQuests(shared) {
    const d = ensure(shared);
    const t = todayStats(shared);
    const goals = shared.goals || {};
    const metrics = {
      hours: t.hours, questions: t.questions, reviews: t.reviews, sessions: t.sessions, blindado: t.blindado,
      disciplines: t.disciplines, checks: d.today.checks, pets: d.today.pets,
      accuracy: t.graded >= 10 ? t.accuracy : 0,
    };
    return questIdsFor(d.today.date).map(id => {
      const q = QUEST_DEFS[id](goals);
      const progress = metrics[q.metric] || 0;
      const done = progress >= q.target;
      return { id, ...q, progress, pct: clamp((progress / q.target) * 100), done, claimed: d.today.claimed.includes(id) };
    });
  }
  const PERFECT_REWARD = { xp: 50, gems: 40 };

  function claimQuest(shared, id) {
    const q = getDailyQuests(shared).find(x => x.id === id);
    if (!q || !q.done || q.claimed) return { shared, reward: null };
    let next = addReward(shared, { xp: q.xp, gems: q.gems });
    const d = ensure(next);
    d.today = { ...d.today, claimed: [...d.today.claimed, id] };
    d.stats = { ...d.stats, quests: (d.stats.quests || 0) + 1 };
    return { shared: { ...next, dragon: d }, reward: { xp: q.xp, gems: q.gems } };
  }
  function canClaimPerfect(shared) {
    const d = ensure(shared);
    return !d.today.perfect && getDailyQuests(shared).every(q => q.claimed);
  }
  function claimPerfect(shared) {
    if (!canClaimPerfect(shared)) return { shared, reward: null };
    let next = addReward(shared, PERFECT_REWARD);
    const d = ensure(next);
    d.today = { ...d.today, perfect: true };
    d.stats = { ...d.stats, perfectDays: (d.stats.perfectDays || 0) + 1 };
    return { shared: { ...next, dragon: d }, reward: PERFECT_REWARD };
  }

  // ── Baú do dia (recompensa variável) ───────────────────────
  function chestState(shared) {
    const d = ensure(shared);
    if (d.today.chest) return { state: 'opened', reward: d.today.chest };
    return { state: studiedToday(shared) ? 'ready' : 'locked', streak: d.chestStreak || 0 };
  }
  function openChest(shared) {
    const cs = chestState(shared);
    if (cs.state !== 'ready') return { shared, reward: null };
    const d = ensure(shared);
    const yesterday = isoDaysAgo(1);
    const streak = d.lastChestDate === yesterday ? (d.chestStreak || 0) + 1 : 1;
    const roll = Math.random();
    const rarity = roll < 0.06 ? 'lendario' : roll < 0.22 ? 'raro' : 'comum';
    const base = 12 + Math.min(streak, 10) * 2;
    const gems = Math.round(base * (rarity === 'lendario' ? 4 : rarity === 'raro' ? 2 : 1) + Math.random() * 6);
    const xp = rarity === 'lendario' ? 60 : rarity === 'raro' ? 30 : 10;
    const reward = { gems, xp, rarity, streak };
    let next = addReward(shared, { xp, gems });
    const nd = ensure(next);
    nd.today = { ...nd.today, chest: reward };
    nd.chestStreak = streak; nd.lastChestDate = d.today.date;
    nd.stats = { ...nd.stats, chests: (nd.stats.chests || 0) + 1 };
    return { shared: { ...next, dragon: nd }, reward };
  }

  // ── Interações ─────────────────────────────────────────────
  function pet(shared) {
    return withDragon(shared, (d) => ({ ...d,
      today: { ...d.today, pets: d.today.pets + 1 },
      stats: { ...d.stats, pets: (d.stats.pets || 0) + 1 } }));
  }
  function countCheck(shared, delta) {
    if (!(delta > 0)) return shared;
    return withDragon(shared, (d) => ({ ...d, today: { ...d.today, checks: d.today.checks + 1 } }));
  }
  function setFlag(shared, key) {
    return withDragon(shared, (d) => d.flags[key] ? d : ({ ...d, flags: { ...d.flags, [key]: new Date().toISOString() } }));
  }
  function feed(shared, treatId) {
    const t = TREATS.find(x => x.id === treatId);
    const d = ensure(shared);
    if (!t) return { shared, ok: false, reason: 'Petisco inválido' };
    if (d.today.feeds >= MAX_FEEDS_PER_DAY) return { shared, ok: false, reason: 'Já comeu bastante hoje! Volte amanhã 😋' };
    if (d.gems < t.price) return { shared, ok: false, reason: `Faltam ${t.price - d.gems} 💎` };
    const nd = { ...d, gems: d.gems - t.price,
      today: { ...d.today, feeds: d.today.feeds + 1, feedMana: d.today.feedMana + t.mana, feedWis: d.today.feedWis + t.wisdom, feedAff: (d.today.feedAff || 0) + t.aff },
      stats: { ...d.stats, feeds: (d.stats.feeds || 0) + 1 } };
    return { shared: { ...shared, dragon: nd }, ok: true, treat: t };
  }
  function buy(shared, itemId, stage) {
    const it = itemById(itemId); const d = ensure(shared);
    if (!it) return { shared, ok: false, reason: 'Item inválido' };
    if (d.owned.includes(itemId)) return { shared, ok: false, reason: 'Você já tem este item' };
    if ((stage || 1) < it.minStage) return { shared, ok: false, reason: `Disponível a partir da fase ${it.minStage}` };
    if (d.gems < it.price) return { shared, ok: false, reason: `Faltam ${it.price - d.gems} 💎` };
    const nd = { ...d, gems: d.gems - it.price, owned: [...d.owned, itemId],
      equipped: { ...d.equipped, [it.slot]: itemId },
      stats: { ...d.stats, purchases: (d.stats.purchases || 0) + 1 } };
    return { shared: { ...shared, dragon: nd }, ok: true, item: it };
  }
  function toggleEquip(shared, itemId) {
    const it = itemById(itemId);
    return withDragon(shared, (d) => {
      if (!it || !d.owned.includes(itemId)) return d;
      const cur = d.equipped[it.slot];
      if (it.slot === 'bg') return { ...d, equipped: { ...d.equipped, bg: itemId } };
      return { ...d, equipped: { ...d.equipped, [it.slot]: cur === itemId ? null : itemId } };
    });
  }
  function rename(shared, name) {
    const clean = String(name || '').trim().slice(0, 18);
    if (!clean) return shared;
    return withDragon(shared, (d) => ({ ...d, name: clean, flags: { ...d.flags, named: d.flags.named || new Date().toISOString() } }));
  }

  // ── Sinais vitais + humor ──────────────────────────────────
  function vitals(shared) {
    const d = ensure(shared);
    const g = shared.goals || {};
    const goalH = g.dailyHours || 4, goalQ = g.dailyQuestions || 40;
    const t = todayStats(shared), y = dayStats(shared, isoDaysAgo(1));
    const mana = clamp(Math.round((t.hours / goalH) * 85 + (y.hours / goalH) * 15 + d.today.feedMana));
    const accPart = t.graded >= 5 ? t.accuracy * 0.25 : 0;
    const wisdom = clamp(Math.round((t.questions / goalQ) * 55 + accPart + Math.min(d.today.checks, 10) * 2 + (t.reviews > 0 ? 5 : 0) + d.today.feedWis));
    const affection = clamp(Math.round(Math.min(shared.streak || 0, 10) * 5 + Math.min(d.today.pets, 5) * 6 + d.today.claimed.length * 6 + (d.today.feedAff || 0)));
    return { mana, wisdom, affection, today: t };
  }
  function moodOf(shared, v) {
    if (shared.petHealth === 'sick') return 'sick';
    const hr = new Date().getHours();
    const vv = v || vitals(shared);
    const goalH = (shared.goals && shared.goals.dailyHours) || 4;
    if ((hr >= 23 || hr < 6) && vv.today.hours === 0) return 'sleepy';
    if (vv.mana >= 90 && vv.wisdom >= 70 && vv.affection >= 60) return 'ecstatic';
    if (vv.today.hours >= goalH) return 'excited';
    if (vv.mana < 20 && hr >= 10) return 'hungry';
    return 'happy';
  }
  const MOOD_LABEL = {
    happy: { label: 'Feliz', icon: '😊', color: '#7C5CFF' },
    excited: { label: 'Empolgado', icon: '🤩', color: '#F59E0B' },
    ecstatic: { label: 'Radiante', icon: '✨', color: '#EC4899' },
    hungry: { label: 'Com fome de saber', icon: '🥺', color: '#F97316' },
    sleepy: { label: 'Dormindo', icon: '💤', color: '#6366F1' },
    sick: { label: 'Doentinho', icon: '🤒', color: '#F59E0B' },
    love: { label: 'Apaixonado', icon: '💜', color: '#EC4899' },
    eating: { label: 'Comendo', icon: '😋', color: '#10B981' },
  };

  const TIPS = [
    'Revisar em 24h, 7 dias e 30 dias fixa muito mais do que reler tudo de uma vez. 🧠',
    'Questões erradas são ouro: anote o porquê do erro e revise amanhã! ✍️',
    'Blocos de 50 min + 10 de pausa deixam minha mana sempre cheia. ⏱️',
    'Lei seca todo dia, nem que sejam 15 minutinhos. É o meu petisco favorito! 📜',
    'Explique o tema em voz alta, como se eu fosse o examinador. Eu adoro ouvir! 🐉',
    'Dormir bem consolida a memória. Até dragões precisam de sono. 🌙',
    'Varie as disciplinas no dia: o cérebro aprende melhor com intercalação. 🔀',
  ];

  function speech(shared, extra = {}) {
    const d = ensure(shared);
    const v = extra.vitals || vitals(shared);
    const mood = extra.mood || moodOf(shared, v);
    const g = shared.goals || {};
    const goalH = g.dailyHours || 4;
    const hr = new Date().getHours();
    const t = v.today;
    const lines = [];
    const evo = window.evaluateDragon ? window.evaluateDragon(shared.xp) : null;
    const quests = getDailyQuests(shared);
    const claimable = quests.filter(q => q.done && !q.claimed).length;
    const pending = quests.filter(q => !q.done).length;
    const chest = chestState(shared);

    if (mood === 'sick') lines.push('Não tô muito bem… 🤒 Estuda comigo 2 dias seguidos que eu melhoro!');
    if (mood === 'sleepy') lines.push('Zzz… 💤 Amanhã a gente arrasa. Descansar também é estratégia!');
    if (evo && evo.stage.id <= 2) lines.push(evo.stage.id === 1
      ? `Tô quentinho aqui dentro… Faltam ${evo.toNext.toLocaleString('pt-BR')} XP pra eu começar a trincar a casca! 🥚`
      : `Crack, crack! Faltam ${evo.toNext.toLocaleString('pt-BR')} XP pra eu nascer! Estuda mais um pouquinho? 🐣`);
    if (claimable > 0) lines.push(`Você tem ${claimable} recompensa${claimable > 1 ? 's' : ''} pra resgatar! 🎁 Clica em “Resgatar”!`);
    if (chest.state === 'ready') lines.push('Tem um baú brilhando nas missões! Abre, abre! 🎁✨');
    if (mood === 'ecstatic') lines.push('DIA LENDÁRIO! Minhas escamas nunca brilharam tanto! ✨🐉');
    if (t.hours >= goalH && mood !== 'sick') lines.push(`META BATIDA! ${fmtH(t.hours)} hoje. Você é incrível! 🏆`);
    else if (t.hours > 0 && goalH - t.hours <= 1 && goalH - t.hours > 0) lines.push(`Faltam só ${fmtH(goalH - t.hours)} pra meta de hoje! Bora juntos? 🔥`);
    if (mood === 'hungry') lines.push('Tô com fome de conhecimento… 📚 Uma sessãozinha de 25 min resolveria!');
    if (t.hours === 0 && hr >= 6 && hr < 12 && mood !== 'sick') lines.push('Bom dia! ☀️ Que tal começar com 25 minutos de lei seca?');
    if ((shared.streak || 0) >= 2 && t.hours === 0 && hr >= 17) lines.push(`Nossa chama de ${shared.streak} dias tá fraquinha… 🔥 Não deixa apagar hoje!`);
    if (evo && evo.next && evo.stage.id > 2 && evo.toNext <= 250) lines.push(`Sinto algo mudando em mim… Faltam só ${evo.toNext} XP pra eu evoluir! 🌟`);
    if (pending > 0 && hr >= 12) lines.push(`Ainda temos ${pending} missão${pending > 1 ? 'ões' : ''} hoje. Bora caçar? ⚔️`);
    const combo = comboMultiplier(shared.streak);
    if (combo > 1) lines.push(`Chama do Dragão ativa: x${combo} de XP e cristais! Não quebra o ritmo! 🔥`);
    if (hr >= 22 && t.hours > 0) lines.push('Estudou bem hoje! Hora de descansar a mente. Boa noite 🌙');
    if (d.today.pets === 0) lines.push(`Oi! Eu sou ${d.name}. Me faz um carinho? 💜`);
    lines.push(TIPS[hash(d.today.date) % TIPS.length]);
    lines.push(TIPS[(hash(d.today.date) + 3) % TIPS.length]);
    return Array.from(new Set(lines));
  }

  // ── Conquistas ─────────────────────────────────────────────
  const TIERS = {
    bronze:   { label: 'BRONZE',   c1: '#F4C08A', c2: '#B7702F', ring: '#8A4B18', glow: 'rgba(205,127,50,0.55)', gems: 15 },
    prata:    { label: 'PRATA',    c1: '#F1F5F9', c2: '#94A3B8', ring: '#475569', glow: 'rgba(148,163,184,0.6)', gems: 30 },
    ouro:     { label: 'OURO',     c1: '#FEF3C7', c2: '#F59E0B', ring: '#92400E', glow: 'rgba(245,158,11,0.65)', gems: 60 },
    lendario: { label: 'LENDÁRIO', c1: '#F5D0FE', c2: '#8B5CF6', ring: '#4C1D95', glow: 'rgba(168,85,247,0.7)', gems: 120 },
  };
  const CATS = [
    { id: 'constancia', label: 'Constância', icon: '🔥' },
    { id: 'horas',      label: 'Horas',      icon: '⏳' },
    { id: 'questoes',   label: 'Questões',   icon: '🎯' },
    { id: 'edital',     label: 'Edital',     icon: '📜' },
    { id: 'dragao',     label: 'Dragão',     icon: '🐉' },
    { id: 'missoes',    label: 'Missões',    icon: '🗺️' },
    { id: 'especiais',  label: 'Especiais',  icon: '✨' },
  ];
  const A = (id, cat, tier, icon, name, desc, key, target) => ({ id, cat, tier, icon, name, desc, key, target });
  const ACHIEVEMENTS = [
    A('streak_3',   'constancia', 'bronze',   '🔥', 'Faísca Acesa',        '3 dias seguidos de constância',              'bestStreak', 3),
    A('streak_7',   'constancia', 'prata',    '🔥', 'Chama Semanal',       '7 dias seguidos de constância',              'bestStreak', 7),
    A('streak_14',  'constancia', 'ouro',     '☄️', 'Fogo Contínuo',       '14 dias seguidos de constância',             'bestStreak', 14),
    A('streak_30',  'constancia', 'lendario', '🐲', 'Coração de Dragão',   '30 dias seguidos de constância',             'bestStreak', 30),
    A('streak_100', 'constancia', 'lendario', '♾️', 'Chama Eterna',        '100 dias seguidos de constância',            'bestStreak', 100),
    A('hours_1',    'horas', 'bronze',   '📖', 'Primeira Página',       'Registre sua primeira hora de estudo',       'totalHours', 1),
    A('hours_10',   'horas', 'bronze',   '📚', 'Leitor Voraz',          '10 horas de estudo acumuladas',              'totalHours', 10),
    A('hours_50',   'horas', 'prata',    '🦉', 'Rato de Biblioteca',    '50 horas de estudo acumuladas',              'totalHours', 50),
    A('hours_100',  'horas', 'ouro',     '🏛️', 'Centurião do Saber',    '100 horas de estudo acumuladas',             'totalHours', 100),
    A('hours_300',  'horas', 'ouro',     '🔮', 'Mente Arcana',          '300 horas de estudo acumuladas',             'totalHours', 300),
    A('hours_1000', 'horas', 'lendario', '👑', 'Mil Horas de Magia',    '1.000 horas de estudo acumuladas',           'totalHours', 1000),
    A('day_6h',     'horas', 'prata',    '⚡', 'Maratona Arcana',       '6 horas de estudo em um único dia',          'maxDayHours', 6),
    A('day_10h',    'horas', 'ouro',     '🌋', 'Lenda do Dia',          '10 horas de estudo em um único dia',         'maxDayHours', 10),
    A('q_50',       'questoes', 'bronze',   '⚔️', 'Primeiro Duelo',     '50 questões resolvidas',                     'totalQuestions', 50),
    A('q_500',      'questoes', 'prata',    '🗡️', 'Duelista',           '500 questões resolvidas',                    'totalQuestions', 500),
    A('q_2000',     'questoes', 'ouro',     '🏹', 'Caçador de Bancas',  '2.000 questões resolvidas',                  'totalQuestions', 2000),
    A('q_5000',     'questoes', 'lendario', '🐉', 'Terror das Bancas',  '5.000 questões resolvidas',                  'totalQuestions', 5000),
    A('day_100q',   'questoes', 'prata',    '🌧️', 'Chuva de Questões',  '100 questões em um único dia',               'maxDayQuestions', 100),
    A('acc_day',    'questoes', 'prata',    '👁️', 'Olho de Dragão',     '85%+ de acerto num dia (mín. 30 questões)',  'bestDayAcc', 85),
    A('acc_total',  'questoes', 'ouro',     '🎯', 'Precisão Cirúrgica', '80%+ de acerto geral (mín. 500 questões)',   'accuracy500', 80),
    A('master_1',   'edital', 'bronze',   '💠', 'Primeiro Domínio',     'Domine 1 tópico (5/5 checks)',               'mastered', 1),
    A('master_10',  'edital', 'prata',    '💎', 'Colecionador de Tópicos','Domine 10 tópicos',                        'mastered', 10),
    A('edital_25',  'edital', 'prata',    '🗺️', 'Um Quarto do Caminho', '25% do edital concluído',                    'editalPct', 25),
    A('edital_50',  'edital', 'ouro',     '🏆', 'Meio Edital',          '50% do edital concluído',                    'editalPct', 50),
    A('edital_100', 'edital', 'lendario', '⚖️', 'Edital Zerado',        '100% do edital concluído',                   'editalPct', 100),
    A('dragon_hatch','dragao', 'bronze',   '🐣', 'Eclosão!',            'Seu dragão nasceu',                          'dragonStage', 3),
    A('dragon_5',   'dragao', 'prata',    '🪽', 'Asas do Saber',        'Dragão chegou à fase 5',                     'dragonStage', 5),
    A('dragon_8',   'dragao', 'lendario', '🌌', 'Lenda Viva',           'Dragão chegou à forma Lendária',             'dragonStage', 8),
    A('pets_50',    'dragao', 'prata',    '💜', 'Melhores Amigos',      '50 carinhos no seu dragão',                  'pets', 50),
    A('style_1',    'dragao', 'bronze',   '🎩', 'Estilo Arcano',        'Compre seu primeiro item na loja',           'purchases', 1),
    A('style_8',    'dragao', 'ouro',     '🪞', 'Guarda-roupa Real',    'Tenha 8 itens da loja',                      'purchases', 8),
    A('named',      'dragao', 'bronze',   '🏷️', 'Batizado',             'Dê um nome ao seu dragão',                   'named', 1),
    A('quests_10',  'missoes', 'bronze',   '🗺️', 'Aventureiro',         'Complete 10 missões diárias',                'quests', 10),
    A('quests_50',  'missoes', 'prata',    '🧭', 'Caçador de Missões',  'Complete 50 missões diárias',                'quests', 50),
    A('quests_150', 'missoes', 'ouro',     '🛡️', 'Herói do Reino',      'Complete 150 missões diárias',               'quests', 150),
    A('perfect_1',  'missoes', 'bronze',   '🌟', 'Dia Perfeito',        'Complete todas as missões de um dia',        'perfectDays', 1),
    A('perfect_10', 'missoes', 'ouro',     '💫', 'Perfeccionista',      '10 dias perfeitos',                          'perfectDays', 10),
    A('chest_7',    'missoes', 'prata',    '🗝️', 'Caçador de Tesouros', 'Abra o baú 7 dias seguidos',                 'chestStreak', 7),
    A('chest_30',   'missoes', 'ouro',     '💰', 'Tesoureiro Real',     'Abra 30 baús diários',                       'chests', 30),
    A('owl',        'especiais', 'bronze', '🦉', 'Coruja Sábia',        'Registre um estudo depois das 22h',          'owl', 1),
    A('early',      'especiais', 'bronze', '🌅', 'Madrugador',          'Registre um estudo entre 5h e 7h',           'early', 1),
    A('sim_1',      'especiais', 'bronze', '📋', 'Batismo de Fogo',     'Registre seu primeiro simulado',             'simulados', 1),
    A('sim_10',     'especiais', 'ouro',   '🎖️', 'Veterano de Simulados','Registre 10 simulados',                     'simulados', 10),
    A('fortress',   'especiais', 'prata',  '🏰', 'Fortaleza',           '10 horas no Modo Blindado',                  'blindadoHours', 10),
    A('gems_1000',  'especiais', 'ouro',   '💎', 'Tesouro do Dragão',   'Acumule 1.000 cristais ao longo da jornada', 'gemsTotal', 1000),
  ];

  function achievementSnapshot(shared, objState, discState) {
    const d = ensure(shared);
    const logs = shared.dailyLogs || [];
    let totalHours = 0, totalQuestions = 0, correct = 0, wrong = 0, maxDayHours = 0, maxDayQuestions = 0, bestDayAcc = 0;
    logs.forEach(l => {
      totalHours += l.hours || 0; totalQuestions += l.questions || 0;
      correct += l.correct || 0; wrong += l.wrong || 0;
      maxDayHours = Math.max(maxDayHours, l.hours || 0);
      maxDayQuestions = Math.max(maxDayQuestions, l.questions || 0);
      const g = (l.correct || 0) + (l.wrong || 0);
      if (g >= 30) bestDayAcc = Math.max(bestDayAcc, ((l.correct || 0) / g) * 100);
    });
    const graded = correct + wrong;
    let mastered = 0;
    const FL = ['lei', 'doutrina', 'juris', 'questoes', 'revisao'];
    ((objState && objState.subjects) || []).forEach(s => (s.topics || []).forEach(t => { if (FL.every(f => t[f])) mastered++; }));
    const editalPct = objState && window.DA ? window.DA.getTotalStatsObj(objState.subjects || []).percentage : 0;
    return {
      bestStreak: Math.max(shared.bestStreak || 0, shared.streak || 0),
      totalHours, totalQuestions, maxDayHours, maxDayQuestions, bestDayAcc,
      accuracy500: graded >= 500 ? (correct / graded) * 100 : 0,
      mastered, editalPct,
      dragonStage: window.getDragonStage ? window.getDragonStage(shared.xp) : 1,
      pets: d.stats.pets || 0, purchases: d.owned.filter(id => id !== 'bg_biblioteca').length,
      named: d.flags.named ? 1 : 0,
      quests: d.stats.quests || 0, perfectDays: d.stats.perfectDays || 0,
      chestStreak: d.chestStreak || 0, chests: d.stats.chests || 0,
      owl: d.flags.owl ? 1 : 0, early: d.flags.early ? 1 : 0,
      simulados: (shared.simulados || []).length,
      blindadoHours: (shared.blindado && shared.blindado.hours) || 0,
      gemsTotal: d.gemsTotal || 0,
    };
  }
  function achievementProgress(snap) {
    return ACHIEVEMENTS.map(a => {
      const cur = snap[a.key] || 0;
      return { ...a, cur, pct: clamp((cur / a.target) * 100), done: cur >= a.target };
    });
  }
  function evaluateAchievements(shared, objState, discState) {
    return achievementProgress(achievementSnapshot(shared, objState, discState)).filter(a => a.done).map(a => a.id);
  }
  function recordAchievements(shared, ids) {
    if (!ids.length) return shared;
    const now = new Date().toISOString();
    const gems = ids.reduce((sum, id) => { const a = ACHIEVEMENTS.find(x => x.id === id); return sum + (a ? TIERS[a.tier].gems : 0); }, 0);
    const next = addReward(shared, { gems });
    const d = ensure(next);
    const ach = { ...d.achievements };
    ids.forEach(id => { if (!ach[id]) ach[id] = now; });
    return { ...next, dragon: { ...d, achievements: ach } };
  }
  const achById = (id) => ACHIEVEMENTS.find(a => a.id === id);

  // Recursos desbloqueados por fase (exibidos na evolução)
  const STAGE_UNLOCKS = {
    2: ['A casca começou a trincar', 'Runas despertas'],
    3: ['Seu dragão nasceu!', 'Ele reage aos seus carinhos', 'Loja de acessórios liberada'],
    4: ['Asinhas', 'Chifres de cristal', 'Pena mágica flutuante'],
    5: ['Asas maiores', 'Grimório flutuante', 'Itens de fase 5 na loja'],
    6: ['Runas nas escamas', 'Círculo mágico', 'Asas estreladas'],
    7: ['Orbes do conhecimento', 'Chifres dourados'],
    8: ['Asas de galáxia', 'Coroa de estrelas', 'Aura lendária'],
  };
  const EVOLUTION_GEMS = 100;

  window.DG = {
    todayISO, comboMultiplier, nextComboStep, studyRewards,
    ITEMS, SLOTS, TREATS, MAX_FEEDS_PER_DAY, itemById,
    defaultDragon, ensure, addReward,
    dayStats, todayStats, studiedToday,
    getDailyQuests, claimQuest, canClaimPerfect, claimPerfect, PERFECT_REWARD,
    chestState, openChest,
    pet, countCheck, setFlag, feed, buy, toggleEquip, rename,
    vitals, moodOf, MOOD_LABEL, speech, fmtH,
    TIERS, CATS, ACHIEVEMENTS, achById, achievementSnapshot, achievementProgress, evaluateAchievements, recordAchievements,
    STAGE_UNLOCKS, EVOLUTION_GEMS,
  };
})();
