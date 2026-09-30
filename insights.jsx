// Lendário — Sistema de Insights Automáticos (Bloco 6)
// 8+ regras priorizadas; exibe 1-3 insights por vez; descartável

function computeInsights(shared, objState, discState) {
  const logs = shared.dailyLogs || [];
  const insights = [];
  const today = new Date(); today.setHours(0,0,0,0);
  const todayISO = today.toISOString().slice(0,10);

  const logByDate = (iso) => logs.find(l => l.date === iso);
  const hoursLast = (n) => {
    let total = 0;
    for (let i = 0; i < n; i++) {
      const d = new Date(today - i*86400000);
      const l = logByDate(d.toISOString().slice(0,10));
      if (l) total += l.hours || 0;
    }
    return total;
  };

  // 1 — Sem estudo hoje
  const todayLog = logByDate(todayISO);
  const studiedToday = todayLog && ((todayLog.hours||0) + (todayLog.questions||0) + (todayLog.reviews||0)) > 0;
  if (!studiedToday && today.getHours() >= 9) {
    insights.push({
      id: 'no-study-today',
      priority: 10,
      icon: '⏰',
      color: 'var(--ambar)',
      title: 'Nenhum estudo registrado hoje',
      body: 'Registre sua sessão de hoje para manter sua constância e alimentar o pet.',
      action: null,
    });
  }

  // 2 — Constância em risco (não estudou no último dia útil)
  const prevWeekdayISO = (() => {
    const d = new Date(today);
    do { d.setDate(d.getDate() - 1); } while (d.getDay() === 0 || d.getDay() === 6);
    return d.toISOString().slice(0,10);
  })();
  const prevLog = logByDate(prevWeekdayISO);
  const studiedPrev = prevLog && ((prevLog.hours||0) + (prevLog.questions||0) + (prevLog.reviews||0)) > 0;
  const todayIsWeekend = today.getDay() === 0 || today.getDay() === 6;
  if (shared.streak > 0 && !studiedPrev && !studiedToday && !todayIsWeekend) {
    insights.push({
      id: 'streak-risk',
      priority: 9,
      icon: '🔥',
      color: 'var(--coral)',
      title: `Constância de ${shared.streak} dia${shared.streak>1?'s':''} em risco!`,
      body: 'Você não estudou no último dia útil. Estude hoje para não quebrar sua constância.',
      action: null,
    });
  }

  // Set of disciplinas atualmente no edital (Obj + Disc) — só essas servem para alertas de negligência
  const activeDisciplines = new Set();
  (objState.subjects || []).forEach(s => { if (s && s.name) activeDisciplines.add(s.name); });
  (discState.subjects || []).forEach(s => { if (s && s.name) activeDisciplines.add(s.name); });
  // Filtra disciplinas "fantasma" criadas pelo placeholder "Nova disciplina"
  const isPhantomName = (name) => !name || /^nova( disciplina| disciplina\s*)?$/i.test(name.trim()) || name.trim().toLowerCase() === 'nova';

  // 3 — Disciplina negligenciada (>= 20 dias sem log) — só conta disciplinas que estão no edital
  const lastLogByDisc = {};
  logs.forEach(l => {
    const ents = (l.entries && l.entries.length > 0) ? l.entries : [l];
    ents.forEach(e => {
      const d = e.discipline;
      if (!d || isPhantomName(d)) return;
      if (!activeDisciplines.has(d)) return; // excluída do edital → não avisa
      if (!lastLogByDisc[d] || l.date > lastLogByDisc[d]) lastLogByDisc[d] = l.date;
    });
  });
  const loggedDiscs = Object.keys(lastLogByDisc);
  if (loggedDiscs.length > 0) {
    const worstDisc = loggedDiscs
      .map(d => ({ d, days: Math.floor((today - new Date(lastLogByDisc[d]+'T00:00:00'))/86400000) }))
      .sort((a,b) => b.days - a.days)[0];
    if (worstDisc && worstDisc.days >= 20) {
      insights.push({
        id: 'neglected-disc',
        priority: 8,
        icon: '📚',
        color: 'var(--tinta)',
        title: `${worstDisc.d.length > 25 ? worstDisc.d.slice(0,23)+'…' : worstDisc.d} negligenciada`,
        body: `Você não estuda ${worstDisc.d} há ${worstDisc.days} dias. Volte a ela para não perder o ritmo.`,
        action: null,
      });
    }
  }

  // 3b — Disciplinas com progresso muito inferior às outras (< 50% da média)
  if (objState.subjects && objState.subjects.length >= 3) {
    const FLAGS = ['lei','doutrina','juris','questoes','revisao'];
    const stats = objState.subjects
      .filter(s => s && s.name && !isPhantomName(s.name) && (s.topics || []).length > 0)
      .map(s => {
        let checks = 0;
        s.topics.forEach(t => FLAGS.forEach(f => { if (t[f]) checks++; }));
        return { name: s.name, pct: (checks / (s.topics.length * 5)) * 100 };
      });
    if (stats.length >= 3) {
      const avg = stats.reduce((a, s) => a + s.pct, 0) / stats.length;
      const laggards = stats.filter(s => avg > 10 && s.pct < avg * 0.5).slice(0, 3);
      if (laggards.length > 0) {
        const names = laggards.map(l => l.name).join(', ');
        insights.push({
          id: 'lagging-disc',
          priority: 7,
          icon: '⚖️',
          color: 'var(--coral)',
          title: `${laggards.length} disciplina${laggards.length>1?'s':''} muito atrás da média`,
          body: `${names.length > 80 ? names.slice(0,78)+'…' : names} estão bem abaixo das outras. Equilibre seu estudo.`,
          action: null,
        });
      }
    }
  }

  // 4 — Ritmo abaixo da meta semanal
  const weeklyHours = hoursLast(7);
  const goalWeekly  = shared.goals?.weeklyHours || 28;
  const weekPct = weeklyHours / goalWeekly * 100;
  if (goalWeekly > 0 && weekPct < 60 && logs.length > 0) {
    const remaining = goalWeekly - weeklyHours;
    insights.push({
      id: 'below-weekly-goal',
      priority: 7,
      icon: '📉',
      color: 'var(--ambar)',
      title: `Ritmo semanal: ${weekPct.toFixed(0)}% da meta`,
      body: `Você fez ${weeklyHours.toFixed(1)}h esta semana. Faltam ${remaining.toFixed(1)}h para atingir ${goalWeekly}h/semana.`,
      action: null,
    });
  }

  // 5 — Tópicos pedindo revisão (>30 dias com algum check)
  const FLAGS_O = ['lei','doutrina','juris','questoes','revisao'];
  let reviewCount = 0;
  objState.subjects.forEach(s => s.topics.forEach(t => {
    const hasCheck = FLAGS_O.some(f => t[f]);
    if (hasCheck && t.lastStudiedAt) {
      const days = Math.floor((today - new Date(t.lastStudiedAt))/86400000);
      if (days >= 30) reviewCount++;
    }
  }));
  if (reviewCount > 0) {
    insights.push({
      id: 'review-due',
      priority: 6,
      icon: '🔄',
      color: '#FFB057',
      title: `${reviewCount} tópico${reviewCount>1?'s':''} pedindo revisão`,
      body: `Você tem tópicos que não revisita há mais de 30 dias. A revisão espaçada é crucial para a retenção.`,
      action: null,
    });
  }

  // 6 — Ótimo ritmo (acima de 90% da meta semanal)
  if (weekPct >= 90 && logs.length > 0) {
    insights.push({
      id: 'great-rhythm',
      priority: 5,
      icon: '🏆',
      color: 'var(--esmeralda)',
      title: `Ritmo excelente! ${weekPct.toFixed(0)}% da meta`,
      body: `Você fez ${weeklyHours.toFixed(1)}h esta semana. Continue assim — consistência é o que aprova.`,
      action: null,
    });
  }

  // 7 — % acerto baixo geral (se há dados de questões)
  const totalCorrect = logs.reduce((a,l) => a + (l.correct||0), 0);
  const totalWrong   = logs.reduce((a,l) => a + (l.wrong||0), 0);
  const totalQ = totalCorrect + totalWrong;
  if (totalQ >= 20) {
    const accPct = totalCorrect / totalQ * 100;
    if (accPct < 60) {
      insights.push({
        id: 'low-accuracy',
        priority: 8,
        icon: '🎯',
        color: 'var(--coral)',
        title: `Taxa de acerto: ${accPct.toFixed(0)}%`,
        body: `Você acertou ${accPct.toFixed(0)}% das questões. Foque em teoria e lei seca antes de resolver mais questões.`,
        action: null,
      });
    }
  }

  // 8 — Progresso no edital baixo (<15% depois de N dias ativos)
  const activeDays = logs.filter(l => (l.hours||0)+(l.questions||0)+(l.reviews||0) > 0).length;
  const totalChecks = objState.subjects.reduce((a, s) => {
    return a + s.topics.reduce((b, t) => b + FLAGS_O.filter(f => t[f]).length, 0);
  }, 0);
  const totalPossible = objState.subjects.reduce((a, s) => a + s.topics.length * 5, 0);
  const editPct = totalPossible > 0 ? totalChecks / totalPossible * 100 : 0;
  if (activeDays >= 10 && editPct < 15) {
    insights.push({
      id: 'low-edital-progress',
      priority: 6,
      icon: '📋',
      color: 'var(--tinta)',
      title: `Apenas ${editPct.toFixed(0)}% do edital preenchido`,
      body: `Após ${activeDays} dias de estudo, acelere os checks na Matriz do Edital para visualizar seu progresso real.`,
      action: null,
    });
  }

  // 9 — Tipos de estudo desproporcionais / negligenciados na semana
  const KNOWN_TYPES = ['Lei seca','Doutrina','Jurisprudência','Questões','Revisão','Flashcards','Pomodoro','Resumo','Teoria','Vídeo aula'];
  const typeHoursWeek = {};
  let totalTypedHoursWeek = 0;
  logs.forEach(l => {
    const d = new Date(l.date + 'T00:00:00');
    if ((today - d) > 7 * 86400000) return;
    const ents = (l.entries && l.entries.length > 0) ? l.entries : [l];
    ents.forEach(e => {
      if (!e.studyType || !e.hours) return;
      typeHoursWeek[e.studyType] = (typeHoursWeek[e.studyType] || 0) + (e.hours || 0);
      totalTypedHoursWeek += (e.hours || 0);
    });
  });
  const typesUsed = Object.keys(typeHoursWeek);
  if (totalTypedHoursWeek >= 3 && typesUsed.length > 0) {
    // Desproporcional: algum tipo concentra > 70% das horas
    const dominant = typesUsed.map(t => ({ t, h: typeHoursWeek[t], share: typeHoursWeek[t] / totalTypedHoursWeek }))
      .sort((a,b) => b.share - a.share)[0];
    if (dominant && dominant.share > 0.70 && typesUsed.length >= 2) {
      insights.push({
        id: 'study-type-imbalance',
        priority: 6,
        icon: '⚖️',
        color: 'var(--ambar)',
        title: `${dominant.t} domina sua semana`,
        body: `${(dominant.share*100).toFixed(0)}% do tempo da semana foi em "${dominant.t}". Varie os tipos de estudo para reter melhor.`,
        action: null,
      });
    }
  }
  // Tipo conhecido nunca usado quando o usuário já estuda > 7d
  if (activeDays >= 7 && totalTypedHoursWeek > 0) {
    const everUsed = new Set();
    logs.forEach(l => {
      const ents = (l.entries && l.entries.length > 0) ? l.entries : [l];
      ents.forEach(e => { if (e.studyType) everUsed.add(e.studyType); });
    });
    const missing = ['Revisão','Questões','Flashcards'].filter(t => !everUsed.has(t));
    if (missing.length > 0) {
      insights.push({
        id: 'study-type-missing',
        priority: 5,
        icon: '🔁',
        color: 'var(--tinta)',
        title: `${missing[0]} ausente do seu rotina`,
        body: `Você nunca registrou "${missing[0]}". Esse tipo de estudo é decisivo na fixação do conteúdo.`,
        action: null,
      });
    }
  }

  // 10 — Desempenho baixo (< 60%) destacado em vermelho/pulsação
  // Já cobre a regra "taxa de acerto < 60%" acima (id: low-accuracy). Vamos garantir destaque visual via 'pulse: true'.
  insights.forEach(i => { if (i.id === 'low-accuracy' || i.id === 'lagging-disc') i.pulse = true; });

  // Sort by priority desc, take top 3
  return insights.sort((a,b) => b.priority - a.priority).slice(0, 3);
}

function InsightsPanel({ shared, objState, discState }) {
  const { useState: useSt } = React;
  const [dismissed, setDismissed] = useSt(() => {
    try { return JSON.parse(localStorage.getItem('toga_insights_dismissed') || '[]'); } catch { return []; }
  });

  const all = computeInsights(shared, objState, discState);
  const visible = all.filter(i => !dismissed.includes(i.id));

  const dismiss = (id) => {
    const next = [...dismissed, id];
    setDismissed(next);
    try { localStorage.setItem('toga_insights_dismissed', JSON.stringify(next)); } catch {}
  };

  // Reset dismissed daily
  const todayISO = new Date().toISOString().slice(0,10);
  const lastReset = localStorage.getItem('toga_insights_reset_date');
  if (lastReset !== todayISO) {
    localStorage.setItem('toga_insights_reset_date', todayISO);
    setDismissed([]);
    return null;
  }

  if (visible.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 4 }}>
      <div style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--text-muted)', fontWeight: 700, fontFamily: 'var(--font-label)' }}>
        INSIGHTS · {visible.length} HOJE
      </div>
      {visible.map(ins => (
        <div key={ins.id} className={`glass ${ins.pulse ? 'insight-pulse-warn' : ''}`} style={{
          padding: '12px 14px',
          display: 'flex', alignItems: 'flex-start', gap: 12,
          ...(ins.pulse ? { boxShadow: `0 0 0 1px ${ins.color}55, 0 0 18px ${ins.color}44` } : {}),
        }}>
          <div style={{ fontSize: 22, flexShrink: 0, lineHeight: 1, marginTop: 1 }}><Glyph e={ins.icon} /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: ins.color, marginBottom: 3 }}>{ins.title}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>{ins.body}</div>
          </div>
          <button onClick={() => dismiss(ins.id)} className="btn-ghost"
            style={{ flexShrink: 0, padding: '4px 8px', fontSize: 11, alignSelf: 'flex-start', opacity: 0.6 }}>
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

window.InsightsPanel = InsightsPanel;
