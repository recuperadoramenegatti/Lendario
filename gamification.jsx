// TOGA — Núcleo de Gamificação
// • Economia de XP: toda sessão de estudo gera XP (horas, questões, acertos, flashcards)
//   com multiplicador de constância e chance de "Insight Crítico" (x2).
// • Níveis contínuos (vitórias frequentes) + 8 fases do dragão (vitórias épicas).
// • Gemas Arcanas 💎: moeda para o guarda-roupa do dragão.
// • Baús de Sabedoria (recompensa variável) após sessões de estudo.
// • Missões do Dia geradas a partir das metas do próprio estudante.
// • Catálogo de conquistas em 4 raridades + Salão das Conquistas.

(function () {
  const { useState, useEffect, useRef, useMemo } = React;

  // ════════════════════════════════════════════════════════════
  //  CONSTANTES & MATEMÁTICA
  // ════════════════════════════════════════════════════════════
  const STAGE_XP = [0, 500, 1500, 3000, 5000, 8000, 12000, 18000];

  const todayISO = () => new Date().toISOString().slice(0, 10);

  function levelInfo(xp) {
    const x = Math.max(0, xp || 0);
    const level = Math.floor((25 + Math.sqrt(625 + 100 * x)) / 50);
    const cur = 25 * (level - 1) * level;
    const next = 25 * level * (level + 1);
    return { level, cur, next, into: x - cur, need: next - cur, progress: (x - cur) / (next - cur) };
  }

  function stageFromXp(xp) {
    let s = 1;
    STAGE_XP.forEach((min, i) => { if ((xp || 0) >= min) s = i + 1; });
    return s;
  }

  function streakMultiplier(streak) {
    const s = streak || 0;
    if (s >= 30) return 1.5;
    if (s >= 14) return 1.4;
    if (s >= 7) return 1.25;
    if (s >= 3) return 1.1;
    return 1;
  }
  function nextMultiplierStep(streak) {
    const steps = [[3, 1.1], [7, 1.25], [14, 1.4], [30, 1.5]];
    const nx = steps.find(([d]) => (streak || 0) < d);
    return nx ? { days: nx[0] - (streak || 0), mult: nx[1] } : null;
  }

  function baseSessionXp(e) {
    return Math.round((Number(e.hours) || 0) * 20 + (Number(e.questions) || 0) * 0.5 + (Number(e.correct) || 0) * 0.5 + (Number(e.reviews) || 0) * 0.25);
  }

  const CHEST_TABLE = {
    comum:    { name: 'Baú de Madeira',   min: 8,  max: 15, color: '#D6A36A', glow: 'rgba(245,158,11,0.55)' },
    raro:     { name: 'Baú Arcano',       min: 20, max: 35, color: '#A78BFA', glow: 'rgba(139,92,246,0.65)' },
    lendario: { name: 'Baú Lendário',     min: 60, max: 90, color: '#FCD34D', glow: 'rgba(252,211,77,0.75)' },
  };
  function rollChest(forceRarity) {
    const r = Math.random();
    const rarity = forceRarity || (r < 0.05 ? 'lendario' : r < 0.3 ? 'raro' : 'comum');
    const t = CHEST_TABLE[rarity];
    return { id: 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), rarity, gems: t.min + Math.floor(Math.random() * (t.max - t.min + 1)) };
  }

  function rollSession(entry, streak) {
    const base = baseSessionXp(entry);
    if (base <= 0) return { base: 0, mult: 1, crit: 1, total: 0, gems: 0, chest: null };
    const mult = streakMultiplier(streak);
    const crit = base >= 10 && Math.random() < 0.12 ? 2 : 1;
    const total = Math.round(base * mult * crit);
    const gems = Math.max(1, Math.floor(total / 15));
    const chest = (Number(entry.hours) || 0) >= 0.4 && Math.random() < 0.3 ? rollChest() : null;
    return { base, mult, crit, total, gems, chest };
  }

  // PRNG determinístico por data (missões do dia)
  function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function mulberry(a) { return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  function todayStats(shared) {
    const iso = todayISO();
    const day = (shared.dailyLogs || []).find(l => l.date === iso);
    const ents = day ? ((day.entries && day.entries.length) ? day.entries : [day]) : [];
    return {
      hours: day ? (day.hours || 0) : 0,
      questions: day ? (day.questions || 0) : 0,
      correct: day ? (day.correct || 0) : 0,
      wrong: day ? (day.wrong || 0) : 0,
      reviews: day ? (day.reviews || 0) : 0,
      entries: ents.length,
      blindado: ents.filter(e => e.blindado).length,
      disciplines: new Set(ents.map(e => e.discipline).filter(Boolean)).size,
      maxEntryHours: ents.reduce((m, e) => Math.max(m, e.hours || 0), 0),
      checks: shared.dayStats && shared.dayStats.date === iso ? (shared.dayStats.checks || 0) : 0,
    };
  }

  const fmtH = (h) => {
    const m = Math.round((h || 0) * 60);
    const hh = Math.floor(m / 60), mm = m % 60;
    if (hh && mm) return `${hh}h${String(mm).padStart(2, '0')}`;
    if (hh) return `${hh}h`;
    return `${mm}min`;
  };

  // ════════════════════════════════════════════════════════════
  //  MISSÕES DO DIA
  // ════════════════════════════════════════════════════════════
  const QUEST_POOL = {
    hours:     { icon: '🔥', title: t => `Estude ${fmtH(t)} hoje`, target: g => Math.max(0.5, g.dailyHours || 2), prog: s => s.hours, fmt: v => fmtH(v), reward: { xp: 40, gems: 12 }, hint: 'Alimenta a Chama do dragão' },
    questions: { icon: '🎯', title: t => `Resolva ${t} questões`, target: g => Math.max(10, g.dailyQuestions || 20), prog: s => s.questions, reward: { xp: 30, gems: 10 }, hint: 'Aumenta a Sabedoria' },
    reviews:   { icon: '🃏', title: t => `Revise ${t} flashcards`, target: g => Math.max(10, g.dailyFlashcards || 20), prog: s => s.reviews, reward: { xp: 25, gems: 10 }, hint: 'Memória de longo prazo' },
    accuracy:  { icon: '🏹', title: () => 'Acerte 80%+ (mín. 10 questões)', target: () => 1, prog: s => ((s.correct + s.wrong) >= 10 && s.correct / (s.correct + s.wrong) >= 0.8 ? 1 : 0), reward: { xp: 35, gems: 12 }, hint: 'Qualidade acima de quantidade' },
    blindado:  { icon: '🛡️', title: () => 'Complete 1 sessão no Modo Blindado', target: () => 1, prog: s => s.blindado, reward: { xp: 35, gems: 12 }, hint: 'Foco sem distrações' },
    checks:    { icon: '📋', title: t => `Marque ${t} checks no edital`, target: () => 5, prog: s => s.checks, reward: { xp: 25, gems: 8 }, hint: 'Avance no mapa do edital' },
    sessions:  { icon: '✍️', title: t => `Registre ${t} sessões de estudo`, target: () => 2, prog: s => s.entries, reward: { xp: 25, gems: 8 }, hint: 'Blocos curtos rendem mais' },
    variety:   { icon: '🧭', title: t => `Estude ${t} disciplinas diferentes`, target: () => 2, prog: s => s.disciplines, reward: { xp: 30, gems: 10 }, hint: 'Intercalar fixa melhor' },
    deep:      { icon: '🌊', title: () => 'Faça uma sessão de 50+ minutos', target: () => 1, prog: s => (s.maxEntryHours >= 50 / 60 ? 1 : 0), reward: { xp: 30, gems: 10 }, hint: 'Imersão profunda' },
  };
  const QUEST_BONUS = { xp: 60 };

  function dailyQuests(shared) {
    const iso = todayISO();
    const goals = shared.goals || {};
    const rnd = mulberry(hashStr('toga-quests-' + iso));
    let pool = Object.keys(QUEST_POOL).filter(k => k !== 'hours');
    if (!(goals.dailyFlashcards > 0)) pool = pool.filter(k => k !== 'reviews');
    if (!(goals.dailyQuestions > 0)) pool = pool.filter(k => k !== 'questions');
    const picks = ['hours'];
    while (picks.length < 3 && pool.length) {
      const i = Math.floor(rnd() * pool.length);
      picks.push(pool.splice(i, 1)[0]);
    }
    const st = todayStats(shared);
    const q = shared.quests && shared.quests.date === iso ? shared.quests : { date: iso, claimed: [], bonus: false };
    const list = picks.map(id => {
      const d = QUEST_POOL[id];
      const target = d.target(goals);
      const progress = d.prog(st);
      return {
        id, icon: d.icon, title: d.title(target), hint: d.hint, reward: d.reward,
        target, progress, pct: Math.min(1, progress / target),
        label: d.fmt ? `${d.fmt(Math.min(progress, target))} / ${d.fmt(target)}` : `${Math.min(progress, target)} / ${target}`,
        done: progress >= target, claimed: q.claimed.includes(id),
      };
    });
    return { list, bonusClaimed: !!q.bonus, allClaimed: list.every(x => x.claimed), state: q };
  }

  // ════════════════════════════════════════════════════════════
  //  CONQUISTAS
  // ════════════════════════════════════════════════════════════
  const TIERS = {
    bronze:   { name: 'Bronze',   colors: ['#FFE3C4', '#D8904F', '#7C3F16'], ribbon: ['#B45309', '#78350F'], glow: '#F59E0B', gems: 10,  xp: 20 },
    prata:    { name: 'Prata',    colors: ['#FFFFFF', '#C9D3E3', '#6B7A93'], ribbon: ['#6366F1', '#3730A3'], glow: '#A5B4FC', gems: 25,  xp: 50 },
    ouro:     { name: 'Ouro',     colors: ['#FFF8C9', '#F5C542', '#9A5B06'], ribbon: ['#7C3AED', '#4C1D95'], glow: '#FCD34D', gems: 50,  xp: 100 },
    lendario: { name: 'Lendária', colors: ['#FCE7F3', '#C084FC', '#22D3EE'], ribbon: ['#DB2777', '#0891B2'], glow: '#E879F9', gems: 100, xp: 200 },
  };
  const TIER_ORDER = ['bronze', 'prata', 'ouro', 'lendario'];

  const CATEGORIES = [
    { id: 'all',        label: 'Todas',      icon: '✦' },
    { id: 'constancia', label: 'Constância', icon: '🔥' },
    { id: 'horas',      label: 'Horas',      icon: '⏳' },
    { id: 'questoes',   label: 'Questões',   icon: '🎯' },
    { id: 'metas',      label: 'Metas',      icon: '🌟' },
    { id: 'edital',     label: 'Edital',     icon: '📜' },
    { id: 'dragao',     label: 'Dragão',     icon: '🐉' },
    { id: 'blindado',   label: 'Blindado',   icon: '🛡️' },
  ];

  const ACHIEVEMENTS = [
    { id: 'const_3',    cat: 'constancia', tier: 'bronze',   icon: '🔥', title: 'Faísca Acesa',          desc: 'Alcance 3 dias de constância.',                    metric: 'bestStreak', target: 3 },
    { id: 'const_7',    cat: 'constancia', tier: 'prata',    icon: '🕯️', title: 'Chama Viva',            desc: 'Uma semana inteira de constância.',                metric: 'bestStreak', target: 7 },
    { id: 'const_30',   cat: 'constancia', tier: 'ouro',     icon: '☄️', title: 'Fogo Eterno',           desc: '30 dias de constância sem quebrar.',               metric: 'bestStreak', target: 30 },
    { id: 'const_100',  cat: 'constancia', tier: 'lendario', icon: '🐉', title: 'Coração de Dragão',     desc: '100 dias de constância. Disciplina lendária.',     metric: 'bestStreak', target: 100 },

    { id: 'hours_10',   cat: 'horas',      tier: 'bronze',   icon: '📖', title: 'Primeiras Páginas',     desc: 'Some 10 horas de estudo.',                         metric: 'hours', target: 10 },
    { id: 'hours_50',   cat: 'horas',      tier: 'prata',    icon: '📚', title: 'Leitor Voraz',          desc: 'Some 50 horas de estudo.',                         metric: 'hours', target: 50 },
    { id: 'hours_200',  cat: 'horas',      tier: 'ouro',     icon: '🏛️', title: 'Guardião da Biblioteca', desc: 'Some 200 horas de estudo.',                        metric: 'hours', target: 200 },
    { id: 'hours_500',  cat: 'horas',      tier: 'lendario', icon: '🔮', title: 'Arquimago do Saber',    desc: 'Some 500 horas de estudo.',                        metric: 'hours', target: 500 },
    { id: 'deep_2h',    cat: 'horas',      tier: 'prata',    icon: '🌊', title: 'Mergulho Profundo',     desc: 'Uma única sessão de 2 horas ou mais.',             metric: 'maxEntryHours', target: 2 },
    { id: 'day_6h',     cat: 'horas',      tier: 'ouro',     icon: '⏳', title: 'Maratona do Saber',     desc: 'Estude 6 horas em um único dia.',                  metric: 'bestDayHours', target: 6 },

    { id: 'q_100',      cat: 'questoes',   tier: 'bronze',   icon: '⚔️', title: 'Cem Batalhas',          desc: 'Resolva 100 questões.',                            metric: 'questions', target: 100 },
    { id: 'q_1000',     cat: 'questoes',   tier: 'prata',    icon: '🛡️', title: 'Mil Desafios',          desc: 'Resolva 1.000 questões.',                          metric: 'questions', target: 1000 },
    { id: 'q_5000',     cat: 'questoes',   tier: 'ouro',     icon: '🗡️', title: 'Oráculo das Bancas',    desc: 'Resolva 5.000 questões.',                          metric: 'questions', target: 5000 },
    { id: 'q_10000',    cat: 'questoes',   tier: 'lendario', icon: '👑', title: 'Lenda das Questões',    desc: 'Resolva 10.000 questões.',                         metric: 'questions', target: 10000 },
    { id: 'acc_day',    cat: 'questoes',   tier: 'prata',    icon: '🏹', title: 'Mira Certeira',         desc: '85%+ de acerto em um dia com 20+ questões.',       metric: 'accDay', target: 1 },
    { id: 'acc_all',    cat: 'questoes',   tier: 'ouro',     icon: '🦅', title: 'Olho de Águia',         desc: '80%+ de acerto geral com 500+ questões.',          metric: 'accAll', target: 1 },

    { id: 'goal_day',   cat: 'metas',      tier: 'bronze',   icon: '🎯', title: 'Meta Cumprida',         desc: 'Bata sua meta diária de horas.',                   metric: 'goalDay', target: 1 },
    { id: 'goal_week',  cat: 'metas',      tier: 'ouro',     icon: '🌟', title: 'Semana Perfeita',       desc: 'Bata sua meta semanal de horas.',                  metric: 'goalWeek', target: 1 },
    { id: 'rev_100',    cat: 'metas',      tier: 'bronze',   icon: '🃏', title: 'Cartas do Destino',     desc: 'Revise 100 flashcards.',                           metric: 'reviews', target: 100 },
    { id: 'rev_1000',   cat: 'metas',      tier: 'ouro',     icon: '🧠', title: 'Memória Arcana',        desc: 'Revise 1.000 flashcards.',                         metric: 'reviews', target: 1000 },
    { id: 'quest_1',    cat: 'metas',      tier: 'bronze',   icon: '📌', title: 'Primeira Missão',       desc: 'Conclua uma missão diária.',                       metric: 'questsClaimed', target: 1 },
    { id: 'quest_50',   cat: 'metas',      tier: 'prata',    icon: '🗝️', title: 'Caçador de Missões',    desc: 'Conclua 50 missões diárias.',                      metric: 'questsClaimed', target: 50 },
    { id: 'quest_p7',   cat: 'metas',      tier: 'ouro',     icon: '💎', title: 'Mestre das Missões',    desc: 'Complete todas as missões do dia 7 vezes.',        metric: 'perfectDays', target: 7 },
    { id: 'lvl_10',     cat: 'metas',      tier: 'prata',    icon: '🌙', title: 'Nível 10',              desc: 'Alcance o nível 10.',                              metric: 'level', target: 10 },
    { id: 'lvl_25',     cat: 'metas',      tier: 'ouro',     icon: '☀️', title: 'Nível 25',              desc: 'Alcance o nível 25.',                              metric: 'level', target: 25 },

    { id: 'ed_first',   cat: 'edital',     tier: 'bronze',   icon: '⚡', title: 'Primeiro Domínio',      desc: 'Domine seu primeiro tópico do edital.',            metric: 'mastered', target: 1 },
    { id: 'ed_25',      cat: 'edital',     tier: 'prata',    icon: '🗺️', title: 'Um Quarto do Mapa',     desc: 'Complete 25% do edital.',                          metric: 'editalPct', target: 25 },
    { id: 'ed_50',      cat: 'edital',     tier: 'ouro',     icon: '🏆', title: 'Meio Edital',           desc: 'Complete 50% do edital.',                          metric: 'editalPct', target: 50 },
    { id: 'ed_100',     cat: 'edital',     tier: 'lendario', icon: '📜', title: 'Edital Zerado',         desc: 'Complete 100% do edital.',                         metric: 'editalPct', target: 100 },
    { id: 'sim_1',      cat: 'edital',     tier: 'bronze',   icon: '🎲', title: 'Batismo de Fogo',       desc: 'Registre seu primeiro simulado.',                  metric: 'simulados', target: 1 },
    { id: 'sim_10',     cat: 'edital',     tier: 'prata',    icon: '🎖️', title: 'Veterano de Simulados', desc: 'Registre 10 simulados.',                           metric: 'simulados', target: 10 },

    { id: 'drg_hatch',  cat: 'dragao',     tier: 'bronze',   icon: '🥚', title: 'Eclosão',               desc: 'Seu dragão saiu do ovo.',                          metric: 'stage', target: 3 },
    { id: 'drg_5',      cat: 'dragao',     tier: 'prata',    icon: '📘', title: 'Dragão Erudito',        desc: 'Alcance a fase Erudito.',                          metric: 'stage', target: 5 },
    { id: 'drg_7',      cat: 'dragao',     tier: 'ouro',     icon: '⚖️', title: 'Toga do Saber',         desc: 'Alcance a fase Sábio Ancestral.',                  metric: 'stage', target: 7 },
    { id: 'drg_8',      cat: 'dragao',     tier: 'lendario', icon: '🐲', title: 'Dragão Lendário',       desc: 'Alcance a forma final do seu dragão.',             metric: 'stage', target: 8 },
    { id: 'drg_pet',    cat: 'dragao',     tier: 'bronze',   icon: '💜', title: 'Vínculo Mágico',        desc: 'Faça carinho no seu dragão 50 vezes.',             metric: 'pets', target: 50 },
    { id: 'drg_style',  cat: 'dragao',     tier: 'bronze',   icon: '🎩', title: 'Estilo Arcano',         desc: 'Compre um item no guarda-roupa.',                  metric: 'owned', target: 1 },
    { id: 'drg_chest',  cat: 'dragao',     tier: 'prata',    icon: '🧰', title: 'Caçador de Tesouros',   desc: 'Abra 10 Baús de Sabedoria.',                       metric: 'chestsOpened', target: 10 },
  ];

  // Conquistas do Modo Blindado (já concedidas por app.jsx) — exibidas no Salão
  const BLINDADO_ACH = [
    { id: 'blindado_first',  tier: 'bronze',   icon: '🛡️', title: 'Primeiro Escudo',   desc: 'Sua primeira sessão blindada.' },
    { id: 'blindado_5',      tier: 'bronze',   icon: '⚔️', title: 'Guardião do Foco',  desc: '5 sessões blindadas concluídas.' },
    { id: 'blindado_monge',  tier: 'prata',    icon: '🧘', title: 'Caminho do Monge',  desc: 'Primeira sessão em Modo Monge.' },
    { id: 'blindado_7day',   tier: 'prata',    icon: '🔥', title: 'Semana Blindada',   desc: '7 dias seguidos no Modo Blindado.' },
    { id: 'blindado_25',     tier: 'ouro',     icon: '🏰', title: 'Sentinela',         desc: '25 sessões blindadas.' },
    { id: 'blindado_50',     tier: 'ouro',     icon: '⚡', title: 'Mestre Blindado',   desc: '50 sessões blindadas.' },
    { id: 'blindado_100h',   tier: 'lendario', icon: '🏆', title: 'Centúria',          desc: '100 horas em Modo Blindado.' },
    { id: 'blindado_30day',  tier: 'lendario', icon: '🌟', title: 'Mês Blindado',      desc: '30 dias seguidos no Modo Blindado.' },
  ].map(a => ({ ...a, cat: 'blindado', external: true }));

  const ALL_ACHIEVEMENTS = [...ACHIEVEMENTS, ...BLINDADO_ACH];
  const achById = (id) => ALL_ACHIEVEMENTS.find(a => a.id === id);

  function weekKeyOf(iso) {
    const d = new Date(iso + 'T00:00:00');
    const day = (d.getDay() + 6) % 7; // 0 = segunda
    d.setDate(d.getDate() - day);
    return d.toISOString().slice(0, 10);
  }

  function aggregates(shared, objState, discState) {
    const logs = shared.dailyLogs || [];
    const goals = shared.goals || {};
    const a = { hours: 0, questions: 0, reviews: 0, bestDayHours: 0, maxEntryHours: 0, accDay: 0, goalDay: 0, goalWeek: 0 };
    const weeks = {};
    logs.forEach(l => {
      a.hours += l.hours || 0; a.questions += l.questions || 0; a.reviews += l.reviews || 0;
      a.bestDayHours = Math.max(a.bestDayHours, l.hours || 0);
      const ents = (l.entries && l.entries.length) ? l.entries : [l];
      ents.forEach(e => { a.maxEntryHours = Math.max(a.maxEntryHours, e.hours || 0); });
      const q = (l.correct || 0) + (l.wrong || 0);
      if (q >= 20 && (l.correct || 0) / q >= 0.85) a.accDay = 1;
      if ((goals.dailyHours || 0) > 0 && (l.hours || 0) >= goals.dailyHours) a.goalDay = 1;
      const wk = weekKeyOf(l.date);
      weeks[wk] = (weeks[wk] || 0) + (l.hours || 0);
    });
    if ((goals.weeklyHours || 0) > 0 && Object.values(weeks).some(h => h >= goals.weeklyHours)) a.goalWeek = 1;
    const acc = window.DA && window.DA.aggregateAcertos ? window.DA.aggregateAcertos(shared) : { total: 0, pct: 0 };
    a.accAll = acc.total >= 500 && acc.pct >= 80 ? 1 : 0;

    const objT = window.DA.getTotalStatsObj((objState && objState.subjects) || []);
    const discT = window.DA.getTotalStatsDisc((discState && discState.subjects) || []);
    a.editalPct = Math.max(objT.percentage || 0, discT.percentage || 0);
    let mastered = 0;
    ((objState && objState.subjects) || []).forEach(s => s.topics.forEach(t => { if (['lei', 'doutrina', 'juris', 'questoes', 'revisao'].every(f => t[f])) mastered++; }));
    ((discState && discState.subjects) || []).forEach(s => s.topics.forEach(t => { if (['estudado', 'grifado', 'questoes'].every(f => t[f])) mastered++; }));
    a.mastered = mastered;

    const drg = shared.dragon || {};
    a.bestStreak = Math.max(shared.bestStreak || 0, shared.streak || 0);
    a.simulados = (shared.simulados || []).length;
    a.stage = stageFromXp(shared.xp);
    a.level = levelInfo(shared.xp).level;
    a.pets = drg.pets || 0;
    a.owned = (drg.owned || []).length;
    a.chestsOpened = drg.chestsOpened || 0;
    a.questsClaimed = (shared.questStats && shared.questStats.claimed) || 0;
    a.perfectDays = (shared.questStats && shared.questStats.perfectDays) || 0;
    return a;
  }

  function evalAchievements(shared, objState, discState) {
    const agg = aggregates(shared, objState, discState);
    const blind = (shared.blindado && shared.blindado.achievements) || [];
    const stored = new Map((shared.unlocked || []).map(u => [u.id, u.at]));
    return ALL_ACHIEVEMENTS.map(a => {
      if (a.external) {
        const un = blind.includes(a.id);
        return { ...a, value: un ? 1 : 0, target: 1, progress: un ? 1 : 0, unlocked: un, at: null };
      }
      const value = agg[a.metric] || 0;
      const reached = value >= a.target;
      const unlocked = reached || stored.has(a.id);
      return { ...a, value, progress: Math.min(1, value / a.target), unlocked, reached, at: stored.get(a.id) || null };
    });
  }

  // ════════════════════════════════════════════════════════════
  //  HOOKS & PEQUENOS COMPONENTES
  // ════════════════════════════════════════════════════════════
  function useUid(prefix) {
    const id = React.useId ? React.useId() : String(Math.random());
    return (prefix || 'u') + id.replace(/[^a-zA-Z0-9]/g, '');
  }

  function useCountUp(target, dur = 900, start = 0) {
    const [v, setV] = useState(start);
    useEffect(() => {
      let raf, t0;
      const from = start;
      const step = (t) => {
        if (!t0) t0 = t;
        const k = Math.min(1, (t - t0) / dur);
        const e = 1 - Math.pow(1 - k, 3);
        setV(Math.round(from + (target - from) * e));
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
      return () => cancelAnimationFrame(raf);
    }, [target]);
    return v;
  }

  // Medalha premium em SVG (selo recortado + disco arcano + fitas)
  function Medal({ tier = 'bronze', icon = '✦', size = 96, locked = false, progress = 0, shine = true, spin = false }) {
    const T = TIERS[tier] || TIERS.bronze;
    const id = useUid('md');
    const pts = [];
    for (let i = 0; i < 48; i++) {
      const a = (i * Math.PI) / 24 - Math.PI / 2;
      const r = i % 2 ? 44 : 47.5;
      pts.push(`${(50 + Math.cos(a) * r).toFixed(2)},${(50 + Math.sin(a) * r).toFixed(2)}`);
    }
    const C = 2 * Math.PI * 49;
    return (
      <svg viewBox="-4 -4 108 128" width={size} height={size * 1.185} className={`medal ${locked ? 'medal-locked' : ''} ${spin ? 'medal-spin' : ''}`} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={`${id}rim`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={T.colors[0]} />
            <stop offset="45%" stopColor={T.colors[1]} />
            <stop offset="100%" stopColor={T.colors[2]} />
          </linearGradient>
          <radialGradient id={`${id}in`} cx="0.4" cy="0.3" r="0.8">
            <stop offset="0%" stopColor="#4C2A9A" />
            <stop offset="60%" stopColor="#24105A" />
            <stop offset="100%" stopColor="#12082E" />
          </radialGradient>
          <linearGradient id={`${id}rb`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={T.ribbon[0]} />
            <stop offset="100%" stopColor={T.ribbon[1]} />
          </linearGradient>
          <linearGradient id={`${id}sh`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fff" stopOpacity="0" />
            <stop offset="50%" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <clipPath id={`${id}cl`}><circle cx="50" cy="50" r="47.5" /></clipPath>
        </defs>
        {/* Fitas */}
        <path d="M34 82 L24 118 L33 112 L39 120 L46 86 Z" fill={`url(#${id}rb)`} />
        <path d="M66 82 L76 118 L67 112 L61 120 L54 86 Z" fill={`url(#${id}rb)`} />
        <path d="M34 82 L24 118 L33 112 L39 120 L46 86 Z" fill="rgba(0,0,0,0.18)" transform="translate(1.5 0)" opacity="0.4" />
        {/* Glow */}
        {!locked && <circle cx="50" cy="50" r="50" fill={T.glow} opacity="0.28" style={{ filter: 'blur(8px)' }} />}
        {/* Aro */}
        <polygon points={pts.join(' ')} fill={`url(#${id}rim)`} stroke={T.colors[2]} strokeWidth="0.8" />
        <circle cx="50" cy="50" r="40.5" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1" />
        <circle cx="50" cy="50" r="38" fill={`url(#${id}in)`} stroke={T.colors[2]} strokeWidth="1.5" />
        <circle cx="50" cy="50" r="33" fill="none" stroke={T.colors[1]} strokeOpacity="0.45" strokeWidth="0.8" strokeDasharray="1.5 3" />
        {/* Estrelinhas do disco */}
        {[[30, 32], [71, 36], [66, 70], [33, 66]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="0.9" fill="#fff" opacity="0.7" />
        ))}
        <text x="50" y="53" textAnchor="middle" dominantBaseline="middle" fontSize="30" style={{ filter: locked ? 'grayscale(1)' : 'drop-shadow(0 0 4px rgba(255,255,255,0.35))' }}>{icon}</text>
        {/* Brilho varrendo */}
        {shine && !locked && (
          <g clipPath={`url(#${id}cl)`}>
            <rect className="medal-shine" x="-60" y="-10" width="40" height="120" fill={`url(#${id}sh)`} transform="rotate(20 50 50)" />
          </g>
        )}
        {/* Bloqueada: véu + cadeado + anel de progresso */}
        {locked && (
          <>
            <circle cx="50" cy="50" r="47.5" fill="rgba(14,8,34,0.55)" />
            <circle cx="50" cy="50" r="49" fill="none" stroke="rgba(167,139,250,0.18)" strokeWidth="2.5" />
            {progress > 0 && (
              <circle cx="50" cy="50" r="49" fill="none" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round"
                strokeDasharray={C} strokeDashoffset={C * (1 - progress)} transform="rotate(-90 50 50)" />
            )}
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

  function GemIcon({ size = 14 }) {
    const id = useUid('gm');
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'inline-block', verticalAlign: '-0.15em' }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E0F2FE" /><stop offset="45%" stopColor="#A78BFA" /><stop offset="100%" stopColor="#5B21B6" />
          </linearGradient>
        </defs>
        <path d="M6 3h12l4 6-10 12L2 9z" fill={`url(#${id})`} stroke="rgba(255,255,255,0.7)" strokeWidth="0.8" />
        <path d="M2 9h20M8 3l4 6 4-6M12 9v12" stroke="rgba(255,255,255,0.45)" strokeWidth="0.8" fill="none" />
      </svg>
    );
  }

  // ════════════════════════════════════════════════════════════
  //  MISSÕES DO DIA (UI — tema arcano escuro)
  // ════════════════════════════════════════════════════════════
  function QuestRing({ pct, done, icon }) {
    const r = 19, C = 2 * Math.PI * r;
    return (
      <div className={`quest-ring ${done ? 'is-done' : ''}`}>
        <svg viewBox="0 0 46 46" width="46" height="46">
          <circle cx="23" cy="23" r={r} fill="none" stroke="rgba(196,181,253,0.16)" strokeWidth="3.5" />
          <circle cx="23" cy="23" r={r} fill="none" stroke={done ? '#FCD34D' : '#A78BFA'} strokeWidth="3.5" strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={C * (1 - pct)} transform="rotate(-90 23 23)"
            style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(.2,.8,.2,1)', filter: `drop-shadow(0 0 4px ${done ? '#FCD34D' : '#A78BFA'})` }} />
        </svg>
        <span className="quest-ring-icon">{done ? '✓' : icon}</span>
      </div>
    );
  }

  function DailyQuests({ shared, onClaim, onClaimBonus }) {
    const dq = dailyQuests(shared);
    const claimedCount = dq.list.filter(q => q.claimed).length;
    return (
      <div className="quests">
        <div className="quests-head">
          <div>
            <div className="arc-eyebrow">MISSÕES DO DIA</div>
            <div className="quests-sub">Renovam à meia-noite · baseadas nas suas metas</div>
          </div>
          <div className="quests-bonus">
            {[0, 1, 2].map(i => <span key={i} className={`quests-pip ${i < claimedCount ? 'on' : ''}`} />)}
            {dq.allClaimed && !dq.bonusClaimed ? (
              <button className="arc-btn arc-btn-gold quest-bonus-btn" onClick={(e) => onClaimBonus && onClaimBonus(e.currentTarget)}>
                🎁 Abrir Baú do Dia
              </button>
            ) : (
              <span className="quests-bonus-label">{dq.bonusClaimed ? '✓ Baú do Dia aberto' : <>🎁 Complete as 3 → Baú Arcano + {QUEST_BONUS.xp} XP</>}</span>
            )}
          </div>
        </div>
        <div className="quests-list">
          {dq.list.map((q, i) => (
            <div key={q.id} className={`quest-card ${q.done ? 'is-done' : ''} ${q.claimed ? 'is-claimed' : ''}`} style={{ animationDelay: `${i * 70}ms` }}>
              <QuestRing pct={q.pct} done={q.done} icon={q.icon} />
              <div className="quest-body">
                <div className="quest-title">{q.title}</div>
                <div className="quest-meta">
                  <span className="quest-progress num">{q.label}</span>
                  <span className="quest-dot">·</span>
                  <span className="quest-hint">{q.hint}</span>
                </div>
              </div>
              <div className="quest-cta">
                {q.claimed ? (
                  <span className="quest-claimed">✓</span>
                ) : q.done ? (
                  <button className="arc-btn arc-btn-gold quest-claim" onClick={(e) => onClaim && onClaim(q.id, e.currentTarget)}>
                    Resgatar
                  </button>
                ) : (
                  <span className="quest-reward">+{q.reward.xp} XP<br /><span>+{q.reward.gems} <GemIcon size={10} /></span></span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  //  RECOMPENSA DE SESSÃO (toast) + BAÚ + LEVEL UP
  // ════════════════════════════════════════════════════════════
  function RewardToast({ reward, onDone, onOpenChest }) {
    const shown = useCountUp(reward.total, 1100);
    useEffect(() => {
      const t = setTimeout(onDone, reward.chest ? 7000 : 5200);
      return () => clearTimeout(t);
    }, []);
    useEffect(() => {
      const el = document.querySelector('.reward-toast');
      const c = window.FX && el ? window.FX.elCenter(el) : null;
      setTimeout(() => {
        if (!window.FX || !c) return;
        window.FX.burst(c.x, c.y - 20, { count: reward.crit > 1 ? 40 : 18, speed: 5, palette: ['#FDE68A', '#C4B5FD', '#67E8F9'] });
        if (reward.gems > 0) window.FX.flyTo({ x: c.x, y: c.y }, '#gem-counter', { count: Math.min(10, reward.gems + 2), color: '#A78BFA' });
      }, 350);
      if (window.SFX) {
        window.SFX.xp();
        if (reward.crit > 1) setTimeout(() => window.SFX.crit(), 380);
        if (reward.chest) setTimeout(() => window.SFX.chestShake(), 900);
      }
    }, []);
    return (
      <div className="reward-toast" role="status">
        <div className="reward-toast-glow" />
        <div className="reward-main">
          <div className="reward-xp num">+{shown}<span>XP</span></div>
          <div className="reward-chips">
            <span className="reward-chip">Base {reward.base}</span>
            {reward.mult > 1 && <span className="reward-chip chip-fire">🔥 Constância ×{reward.mult}</span>}
            {reward.extra > 0 && <span className="reward-chip">🛡️ Blindado +{reward.extra}</span>}
            {reward.crit > 1 && <span className="reward-chip chip-crit">⚡ INSIGHT CRÍTICO ×2</span>}
            {reward.gems > 0 && <span className="reward-chip chip-gem">+{reward.gems} <GemIcon size={11} /></span>}
          </div>
        </div>
        {reward.chest && (
          <button className="reward-chest" onClick={() => { onOpenChest && onOpenChest(reward.chest); onDone(); }}>
            <ChestSVG rarity={reward.chest.rarity} size={46} />
            <span>
              <b>{CHEST_TABLE[reward.chest.rarity].name}!</b>
              <small>Toque para abrir</small>
            </span>
          </button>
        )}
        <button className="reward-close" onClick={onDone} aria-label="Fechar">×</button>
      </div>
    );
  }

  function ChestSVG({ rarity = 'comum', size = 120, open = false }) {
    const id = useUid('ch');
    const P = {
      comum:    { wood: ['#B7773D', '#7A4520'], metal: ['#E5E7EB', '#6B7280'], gem: '#F59E0B' },
      raro:     { wood: ['#7C3AED', '#3B0F7A'], metal: ['#F1F5F9', '#94A3B8'], gem: '#67E8F9' },
      lendario: { wood: ['#FCD34D', '#B45309'], metal: ['#FFFBEB', '#D97706'], gem: '#F472B6' },
    }[rarity] || {};
    return (
      <svg viewBox="0 0 120 110" width={size} height={size * 110 / 120} style={{ overflow: 'visible' }} className={`chest chest-${rarity} ${open ? 'is-open' : ''}`}>
        <defs>
          <linearGradient id={`${id}w`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={P.wood[0]} /><stop offset="100%" stopColor={P.wood[1]} /></linearGradient>
          <linearGradient id={`${id}m`} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={P.metal[0]} /><stop offset="100%" stopColor={P.metal[1]} /></linearGradient>
          <radialGradient id={`${id}l`} cx="0.5" cy="1" r="0.9"><stop offset="0%" stopColor="#FFF7D6" /><stop offset="50%" stopColor={P.gem} stopOpacity="0.6" /><stop offset="100%" stopColor={P.gem} stopOpacity="0" /></radialGradient>
        </defs>
        <ellipse cx="60" cy="104" rx="46" ry="5" fill="rgba(0,0,0,0.35)" />
        {open && <path d="M20 58 L-10 -40 L130 -40 L100 58 Z" fill={`url(#${id}l)`} className="chest-beam" />}
        {/* Corpo */}
        <rect x="14" y="54" width="92" height="46" rx="6" fill={`url(#${id}w)`} stroke="rgba(0,0,0,0.35)" strokeWidth="1.2" />
        <rect x="14" y="54" width="92" height="8" fill="rgba(0,0,0,0.18)" />
        {[30, 60, 90].map(x => <line key={x} x1={x} y1="62" x2={x} y2="100" stroke="rgba(0,0,0,0.18)" strokeWidth="1" />)}
        <rect x="14" y="54" width="10" height="46" fill={`url(#${id}m)`} />
        <rect x="96" y="54" width="10" height="46" fill={`url(#${id}m)`} />
        {/* Tampa */}
        <g className="chest-lid">
          <path d="M14 56 L14 40 C14 22, 106 22, 106 40 L106 56 Z" fill={`url(#${id}w)`} stroke="rgba(0,0,0,0.35)" strokeWidth="1.2" />
          <path d="M14 40 C14 22, 106 22, 106 40" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
          <path d="M24 56 L24 30 M96 56 L96 30" stroke={`url(#${id}m)`} strokeWidth="10" />
          <rect x="14" y="50" width="92" height="6" fill={`url(#${id}m)`} />
        </g>
        {/* Fechadura */}
        <rect x="50" y="50" width="20" height="22" rx="4" fill={`url(#${id}m)`} stroke="rgba(0,0,0,0.3)" />
        <circle cx="60" cy="59" r="4" fill={P.gem} style={{ filter: `drop-shadow(0 0 4px ${P.gem})` }} />
        <rect x="58.8" y="61" width="2.4" height="6" rx="1" fill="rgba(0,0,0,0.45)" />
      </svg>
    );
  }

  function ChestModal({ chest, onOpened, onClose }) {
    const [phase, setPhase] = useState('idle'); // idle | shaking | open
    const [taps, setTaps] = useState(0);
    const t = CHEST_TABLE[chest.rarity] || CHEST_TABLE.comum;
    const boxRef = useRef(null);
    useEffect(() => { window.SFX && window.SFX.pop(); }, []);
    const tap = () => {
      if (phase === 'open') return;
      const n = taps + 1;
      setTaps(n);
      setPhase('shaking');
      window.SFX && window.SFX.chestShake();
      window.haptic && window.haptic(20);
      if (n >= 3) {
        setTimeout(() => {
          setPhase('open');
          window.SFX && window.SFX.chestOpen(chest.rarity);
          const c = window.FX ? window.FX.elCenter(boxRef.current) : null;
          if (c && window.FX) {
            window.FX.flash(chest.rarity === 'lendario' ? 'rgba(252,211,77,0.55)' : 'rgba(196,181,253,0.45)', 700);
            window.FX.ring(c.x, c.y, { color: t.color, max: 260, width: 5 });
            window.FX.fountain(c.x, c.y - 30, { count: 50, palette: [t.color, '#fff', '#C4B5FD', '#67E8F9'], kinds: ['gem', 'star', 'spark'] });
            if (chest.rarity !== 'comum') window.FX.rain({ count: chest.rarity === 'lendario' ? 120 : 50 });
            setTimeout(() => window.FX.flyTo({ x: c.x, y: c.y - 40 }, '#gem-counter', { count: 12, color: '#A78BFA' }), 700);
          }
          onOpened && onOpened(chest);
        }, 260);
      } else {
        setTimeout(() => setPhase('idle'), 380);
      }
    };
    return (
      <div className="arc-overlay" onClick={phase === 'open' ? onClose : undefined}>
        <div className="arc-rays" style={{ '--ray': t.color }} />
        <div className="chest-stage" onClick={e => e.stopPropagation()}>
          <div className="arc-eyebrow" style={{ color: t.color }}>✦ {t.name.toUpperCase()} ✦</div>
          <div ref={boxRef} className={`chest-box ${phase === 'shaking' ? 'is-shaking' : ''} ${phase === 'idle' && taps === 0 ? 'is-idle' : ''}`}
            onClick={tap} style={{ '--chest-glow': t.glow }}>
            <ChestSVG rarity={chest.rarity} size={220} open={phase === 'open'} />
          </div>
          {phase !== 'open' ? (
            <div className="chest-hint">Toque {3 - taps}× para abrir</div>
          ) : (
            <div className="chest-reward anim-pop">
              <div className="chest-reward-num num">+{chest.gems} <GemIcon size={34} /></div>
              <div className="chest-reward-sub">Gemas Arcanas para o guarda-roupa do seu dragão</div>
              <button className="arc-btn arc-btn-primary" onClick={onClose}>Coletar ✦</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  function LevelUpBanner({ level, gems, onDone }) {
    useEffect(() => {
      window.SFX && window.SFX.levelUp();
      const el = document.querySelector('.levelup-banner');
      setTimeout(() => {
        if (window.FX && el) {
          const c = window.FX.elCenter(el);
          window.FX.burst(c.x, c.y, { count: 50, speed: 8, kinds: ['star', 'spark', 'glyph'], palette: ['#FDE68A', '#C4B5FD', '#67E8F9', '#F9A8D4'] });
          window.FX.ring(c.x, c.y, { color: '#FDE68A', max: 220 });
          if (gems > 0) window.FX.flyTo(c, '#gem-counter', { count: 6 });
        }
      }, 250);
      const t = setTimeout(onDone, 3600);
      return () => clearTimeout(t);
    }, []);
    return (
      <div className="levelup-banner" onClick={onDone}>
        <div className="levelup-wing levelup-wing-l" />
        <div className="levelup-core">
          <div className="levelup-eyebrow">SUBIU DE NÍVEL</div>
          <div className="levelup-num num">NÍVEL {level}</div>
          {gems > 0 && <div className="levelup-gems">+{gems} <GemIcon size={12} /></div>}
        </div>
        <div className="levelup-wing levelup-wing-r" />
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  //  MODAL: CONQUISTA DESBLOQUEADA
  // ════════════════════════════════════════════════════════════
  function AchievementUnlockModal({ ach, onClose, onShare, queueLeft = 0 }) {
    const T = TIERS[ach.tier] || TIERS.bronze;
    const medalRef = useRef(null);
    useEffect(() => {
      window.SFX && window.SFX.achievement(ach.tier);
      window.haptic && window.haptic([15, 40, 25]);
      const t1 = setTimeout(() => {
        if (!window.FX || !medalRef.current) return;
        const c = window.FX.elCenter(medalRef.current);
        window.FX.ring(c.x, c.y, { color: T.glow, max: 240, width: 5 });
        window.FX.burst(c.x, c.y, { count: ach.tier === 'lendario' ? 110 : 60, speed: 9, kinds: ['star', 'spark', 'glyph'], palette: [T.colors[0], T.colors[1], T.glow, '#fff'] });
        if (ach.tier === 'ouro' || ach.tier === 'lendario') window.FX.rain({ count: ach.tier === 'lendario' ? 140 : 70, palette: [T.colors[1], T.glow, '#fff', '#C4B5FD'] });
      }, 650);
      const t2 = setTimeout(() => {
        if (!window.FX || !medalRef.current) return;
        window.FX.flyTo(window.FX.elCenter(medalRef.current), '#gem-counter', { count: 8 });
      }, 1500);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [ach.id]);
    return (
      <div className="arc-overlay" onClick={onClose}>
        <div className="arc-rays" style={{ '--ray': T.glow }} />
        <div className="ach-modal" onClick={e => e.stopPropagation()}>
          <div className="arc-eyebrow ach-eyebrow" style={{ color: T.colors[1] }}>✦ CONQUISTA DESBLOQUEADA ✦</div>
          <div ref={medalRef} className="ach-modal-medal">
            <Medal tier={ach.tier} icon={ach.icon} size={190} spin />
          </div>
          <div className={`tier-chip tier-${ach.tier}`}>{T.name}</div>
          <div className="ach-modal-title">{ach.title}</div>
          <div className="ach-modal-desc">{ach.desc}</div>
          <div className="ach-modal-rewards">
            <span className="reward-chip">+{T.xp} XP</span>
            <span className="reward-chip chip-gem">+{T.gems} <GemIcon size={11} /></span>
          </div>
          <div className="ach-modal-actions">
            <button className="arc-btn arc-btn-primary" onClick={() => onShare && onShare(ach)}>📸 Compartilhar</button>
            <button className="arc-btn arc-btn-ghost" onClick={onClose}>{queueLeft > 0 ? `Próxima (${queueLeft}) →` : 'Continuar'}</button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  //  SALÃO DAS CONQUISTAS (aba)
  // ════════════════════════════════════════════════════════════
  function AchievementsHall({ shared, objState, discState, onShare, onShareProfile }) {
    const [cat, setCat] = useState('all');
    const all = useMemo(() => evalAchievements(shared, objState, discState), [shared, objState, discState]);
    const list = all.filter(a => cat === 'all' || a.cat === cat)
      .sort((a, b) => (b.unlocked - a.unlocked) || (b.progress - a.progress) || (TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier)));
    const unlocked = all.filter(a => a.unlocked);
    const byTier = TIER_ORDER.map(t => ({ t, n: unlocked.filter(a => a.tier === t).length, total: all.filter(a => a.tier === t).length }));
    const lv = levelInfo(shared.xp);
    const pct = all.length ? unlocked.length / all.length : 0;
    const shownPct = useCountUp(Math.round(pct * 100), 1200);
    const DragonMini = window.DragonSVG;
    const drg = shared.dragon || {};

    return (
      <div className="hall">
        <section className="hall-hero arc-card">
          <div className="arc-stars" />
          <div className="hall-hero-left">
            <div className="hall-avatar">
              {DragonMini && <DragonMini stage={stageFromXp(shared.xp)} mood="happy" skin={drg.skin} hat={drg.hat} face={drg.face} neck={drg.neck} size={150} flame={0.8} />}
            </div>
            <div>
              <div className="arc-eyebrow">SALÃO DAS CONQUISTAS</div>
              <div className="hall-title">{drg.name || 'Lumi'} & você</div>
              <div className="hall-sub">Nível {lv.level} · {unlocked.length} de {all.length} conquistas · {(shared.gems || 0).toLocaleString('pt-BR')} gemas</div>
              <div className="hall-progress">
                <div className="hall-progress-bar"><div style={{ width: `${pct * 100}%` }} /></div>
                <span className="num">{shownPct}%</span>
              </div>
              <div className="hall-tiers">
                {byTier.map(({ t, n, total }) => (
                  <span key={t} className={`tier-chip tier-${t}`}>{TIERS[t].name} {n}/{total}</span>
                ))}
              </div>
            </div>
          </div>
          <button className="arc-btn arc-btn-primary hall-share" onClick={onShareProfile}>📸 Compartilhar meu perfil</button>
        </section>

        <div className="hall-cats">
          {CATEGORIES.map(c => {
            const n = c.id === 'all' ? unlocked.length : unlocked.filter(a => a.cat === c.id).length;
            const tot = c.id === 'all' ? all.length : all.filter(a => a.cat === c.id).length;
            return (
              <button key={c.id} className={`hall-cat ${cat === c.id ? 'is-active' : ''}`} onClick={() => { setCat(c.id); window.SFX && window.SFX.tap(); }}>
                <span>{c.icon}</span> {c.label} <em>{n}/{tot}</em>
              </button>
            );
          })}
        </div>

        <div className="hall-grid">
          {list.map((a, i) => (
            <div key={a.id} className={`ach-card ${a.unlocked ? 'is-unlocked' : 'is-locked'} tier-${a.tier}`} style={{ animationDelay: `${Math.min(i, 16) * 35}ms` }}>
              <div className="ach-card-medal"><Medal tier={a.tier} icon={a.icon} size={82} locked={!a.unlocked} progress={a.progress} shine={a.unlocked} /></div>
              <div className="ach-card-body">
                <div className="ach-card-top">
                  <span className={`tier-dot tier-${a.tier}`} />
                  <span className="ach-card-tier">{TIERS[a.tier].name}</span>
                </div>
                <div className="ach-card-title">{a.title}</div>
                <div className="ach-card-desc">{a.desc}</div>
                {a.unlocked ? (
                  <div className="ach-card-foot">
                    <span className="ach-card-date">{a.at ? `✓ ${new Date(a.at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}` : '✓ Desbloqueada'}</span>
                    <button className="ach-share-btn" onClick={() => onShare && onShare(a)} title="Compartilhar">📸</button>
                  </div>
                ) : (
                  <div className="ach-card-prog">
                    <div className="ach-card-bar"><div style={{ width: `${a.progress * 100}%` }} /></div>
                    {!a.external && a.target > 1 && <span className="num">{Math.floor(Math.min(a.value, a.target)).toLocaleString('pt-BR')}/{a.target.toLocaleString('pt-BR')}</span>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  //  EXPORTS
  // ════════════════════════════════════════════════════════════
  window.GM = {
    STAGE_XP, todayISO, levelInfo, stageFromXp, streakMultiplier, nextMultiplierStep,
    baseSessionXp, rollSession, rollChest, CHEST_TABLE, todayStats, fmtH,
    QUEST_POOL, QUEST_BONUS, dailyQuests,
    TIERS, TIER_ORDER, ACHIEVEMENTS, ALL_ACHIEVEMENTS, achById, evalAchievements, aggregates,
    useUid, useCountUp,
  };
  window.Medal = Medal;
  window.GemIcon = GemIcon;
  window.ChestSVG = ChestSVG;
  window.DailyQuests = DailyQuests;
  window.RewardToast = RewardToast;
  window.ChestModal = ChestModal;
  window.LevelUpBanner = LevelUpBanner;
  window.AchievementUnlockModal = AchievementUnlockModal;
  window.AchievementsHall = AchievementsHall;
})();
