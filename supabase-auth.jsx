// ── TOGA · Supabase Auth + Sync ──────────────────────────────
// Depende de: supabase CDN (window.supabase) e supabase-config.jsx
// Expõe: window.TogaAuth

(function () {
  'use strict';

  let _sb = null;

  function getSB() {
    if (_sb) return _sb;
    const url = window.TOGA_SUPABASE_URL;
    const key = window.TOGA_SUPABASE_KEY;
    if (!url || !key || url.includes('SEU_PROJETO') || key.includes('anon_key')) return null;
    try {
      _sb = window.supabase.createClient(url, key, {
        auth: { persistSession: true, autoRefreshToken: true },
      });
    } catch (e) {
      console.warn('[TOGA] Supabase init error:', e);
    }
    return _sb;
  }

  function isConfigured() {
    const url = window.TOGA_SUPABASE_URL || '';
    return url.length > 0 && !url.includes('SEU_PROJETO');
  }

  // ── Merge Strategy ──────────────────────────────────────────
  // Regra de ouro: nunca perde progresso. Em conflito, pega o maior.

  function mergeLogs(logs1, logs2) {
    const map = new Map();
    [...(logs1 || []), ...(logs2 || [])].forEach(log => {
      if (!log?.date) return;
      const ex = map.get(log.date);
      if (!ex) { map.set(log.date, log); return; }

      // Merge entries sem duplicatas (fingerprint = tipo+disc+horas arredondadas)
      const allEntries = [...(ex.entries || [{ ...ex }]), ...(log.entries || [{ ...log }])];
      const seen = new Set();
      const deduped = allEntries.filter(e => {
        const fp = `${e.studyType}|${e.discipline}|${Math.round((e.hours || 0) * 100)}`;
        if (seen.has(fp)) return false;
        seen.add(fp); return true;
      });

      map.set(log.date, {
        ...ex,
        hours:     Math.max(ex.hours || 0, log.hours || 0),
        questions: Math.max(ex.questions || 0, log.questions || 0),
        correct:   Math.max(ex.correct || 0, log.correct || 0),
        wrong:     Math.max(ex.wrong || 0, log.wrong || 0),
        reviews:   Math.max(ex.reviews || 0, log.reviews || 0),
        entries:   deduped,
      });
    });
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  function mergeTopics(topics1, topics2) {
    const map = new Map();
    [...(topics1 || []), ...(topics2 || [])].forEach(t => {
      if (!t?.id) return;
      const ex = map.get(t.id);
      if (!ex) { map.set(t.id, t); return; }
      // Union: nunca perde um check
      const FLAGS = ['lei', 'doutrina', 'juris', 'questoes', 'revisao', 'estudado', 'grifado'];
      const merged = { ...ex, ...t };
      FLAGS.forEach(f => { merged[f] = ex[f] || t[f]; });
      // Mantém lastStudiedAt mais recente
      if (ex.lastStudiedAt && t.lastStudiedAt) {
        merged.lastStudiedAt = ex.lastStudiedAt > t.lastStudiedAt ? ex.lastStudiedAt : t.lastStudiedAt;
      } else {
        merged.lastStudiedAt = ex.lastStudiedAt || t.lastStudiedAt;
      }
      map.set(t.id, merged);
    });
    return Array.from(map.values());
  }

  function mergeSubjects(subs1, subs2) {
    const map = new Map();
    [...(subs1 || []), ...(subs2 || [])].forEach(s => {
      if (!s?.id) return;
      const ex = map.get(s.id);
      if (!ex) { map.set(s.id, s); return; }
      map.set(s.id, { ...ex, ...s, topics: mergeTopics(ex.topics, s.topics) });
    });
    return Array.from(map.values());
  }

  function mergeById(arr1, arr2) {
    const map = new Map();
    [...(arr1 || []), ...(arr2 || [])].forEach(item => {
      if (item?.id) map.set(item.id, { ...(map.get(item.id) || {}), ...item });
    });
    return Array.from(map.values());
  }

  function mergeData(local, cloud) {
    if (!cloud || !cloud.shared) return local;
    if (!local || !local.shared) return cloud;

    const ls = local.shared || {};
    const cs = cloud.shared || {};

    const mergedBlindado = {
      ...(ls.blindado || {}),
      ...(cs.blindado || {}),
      sessions:    Math.max(ls.blindado?.sessions || 0, cs.blindado?.sessions || 0),
      hours:       Math.max(ls.blindado?.hours || 0, cs.blindado?.hours || 0),
      streak:      Math.max(ls.blindado?.streak || 0, cs.blindado?.streak || 0),
      bestStreak:  Math.max(ls.blindado?.bestStreak || 0, cs.blindado?.bestStreak || 0),
      achievements:[...new Set([...(ls.blindado?.achievements || []), ...(cs.blindado?.achievements || [])])],
    };

    const mergedShared = {
      ...ls,
      ...cs,                                                   // cloud wins para config/goals
      xp:           Math.max(ls.xp || 0, cs.xp || 0),         // sempre o maior XP
      streak:       Math.max(ls.streak || 0, cs.streak || 0),
      bestStreak:   Math.max(ls.bestStreak || 0, cs.bestStreak || 0),
      shields:      Math.max(ls.shields || 0, cs.shields || 0),
      dailyLogs:    mergeLogs(ls.dailyLogs, cs.dailyLogs),
      achievements: [...new Set([...(ls.achievements || []), ...(cs.achievements || [])])],
      concursos:    mergeById(ls.concursos, cs.concursos),
      simulados:    mergeById(ls.simulados, cs.simulados),
      historicoProvas: mergeById(ls.historicoProvas, cs.historicoProvas),
      customStudyTypes: [...new Set([...(ls.customStudyTypes || []), ...(cs.customStudyTypes || [])])],
      goals:        cs.goals || ls.goals,  // cloud vence em goals (mais recente)
      blindado:     mergedBlindado,
    };

    return {
      shared:     mergedShared,
      objetiva:   {
        ...local.objetiva,
        ...cloud.objetiva,
        subjects: mergeSubjects(local.objetiva?.subjects, cloud.objetiva?.subjects),
      },
      discursiva: {
        ...local.discursiva,
        ...cloud.discursiva,
        subjects: mergeSubjects(local.discursiva?.subjects, cloud.discursiva?.subjects),
      },
      meta: cloud.meta || local.meta,
    };
  }

  // ── Cloud I/O ───────────────────────────────────────────────

  async function saveToCloud(userId, data) {
    const sb = getSB();
    if (!sb) return false;
    try {
      const { error } = await sb.from('user_sync').upsert(
        {
          user_id:    userId,
          shared:     data.shared     || {},
          objetiva:   data.objetiva   || {},
          discursiva: data.discursiva || {},
          meta:       data.meta       || {},
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
      if (error) { console.warn('[TOGA] Save error:', error.message); return false; }
      return true;
    } catch (e) {
      console.warn('[TOGA] Save exception:', e);
      return false;
    }
  }

  async function loadFromCloud(userId) {
    const sb = getSB();
    if (!sb) return null;
    try {
      const { data, error } = await sb
        .from('user_sync')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (error && error.code !== 'PGRST116') {
        console.warn('[TOGA] Load error:', error.message);
        return null;
      }
      return data || null;
    } catch (e) {
      console.warn('[TOGA] Load exception:', e);
      return null;
    }
  }

  // ── Auth helpers ────────────────────────────────────────────

  async function getSession() {
    const sb = getSB();
    if (!sb) return null;
    try {
      const { data } = await sb.auth.getSession();
      return data.session || null;
    } catch { return null; }
  }

  async function signInWithGoogle() {
    const sb = getSB();
    if (!sb) {
      alert('Configure as credenciais do Supabase em supabase-config.jsx');
      return;
    }
    try {
      const { error } = await sb.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + window.location.pathname,
        },
      });
      if (error) throw error;
    } catch (e) {
      console.error('[TOGA] Google sign-in error:', e);
    }
  }

  async function signOut() {
    const sb = getSB();
    if (!sb) return;
    try { await sb.auth.signOut(); } catch (e) {
      console.warn('[TOGA] Sign out error:', e);
    }
  }

  function onAuthChange(callback) {
    const sb = getSB();
    if (!sb) return () => {};
    try {
      const { data: { subscription } } = sb.auth.onAuthStateChange(callback);
      return () => subscription.unsubscribe();
    } catch { return () => {}; }
  }

  // ── Export ──────────────────────────────────────────────────
  window.TogaAuth = {
    isConfigured,
    getSB,
    mergeData,
    saveToCloud,
    loadFromCloud,
    getSession,
    signInWithGoogle,
    signOut,
    onAuthChange,
  };
})();
