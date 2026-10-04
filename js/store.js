/* Local persistence. All data lives in this browser's localStorage under one key.
 * Use Settings → Export to back it up / move it to another device.
 */
(function () {
  const KEY = 'gymplanner.v1';
  const ALL_EQUIPMENT = Object.fromEntries(Object.keys(window.GP.EQUIPMENT).map((k) => [k, true]));

  const DEFAULT = () => ({
    version: 1,
    settings: { units: 'kg', restAuto: true, geminiKey: '', geminiModel: '', sound: true },
    equipment: { ...ALL_EQUIPMENT },
    swaps: {},          // slotId -> exerciseId (user's preferred choice)
    drafts: {},         // dayKey -> { date, startedAt, entries: { slotId: { exId, sets:[{w,r,done}] } } }
    sessions: [],       // { id, date, day, startedAt, finishedAt, entries:[{slotId, exId, sets}] }
    runs: [],           // { id, date, km, min, kind, notes }
    bodyweight: [],     // { date, kg }
    coach: [],          // [{ role:'user'|'model', text }]
  });

  let state;
  try {
    const raw = localStorage.getItem(KEY);
    state = raw ? Object.assign(DEFAULT(), JSON.parse(raw)) : DEFAULT();
    // New equipment keys added in later versions default to available.
    state.equipment = Object.assign({ ...ALL_EQUIPMENT }, state.equipment);
    state.settings = Object.assign(DEFAULT().settings, state.settings);
    // Retired model names: clear so the coach auto-selects the newest available model.
    if (/^gemini-(1\.|2\.0|2\.5)/.test(state.settings.geminiModel || '')) state.settings.geminiModel = '';
  } catch (err) {
    console.warn('Could not read saved data', err);
    state = DEFAULT();
  }

  // Photos in the coach chat are big; keep full image data only on the most recent few.
  function pruneImages(keep) {
    let seen = 0;
    for (let i = state.coach.length - 1; i >= 0; i--) {
      for (const im of state.coach[i].images || []) {
        if (!im.data) continue;
        if (++seen > keep) { delete im.data; }
      }
    }
  }

  function save() {
    for (const keep of [4, 1, 0]) {
      try { pruneImages(keep); localStorage.setItem(KEY, JSON.stringify(state)); return; } catch (err) { console.warn('Save failed, trimming photos', err); }
    }
  }

  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  /* ---------- dates (local time, weeks start Monday) ---------- */
  const pad = (n) => String(n).padStart(2, '0');
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const today = () => iso(new Date());
  const dayKeyOf = (s) => ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][parse(s).getDay()];
  function weekStart(s) {
    const d = parse(s);
    const diff = (d.getDay() + 6) % 7; // Monday = 0
    d.setDate(d.getDate() - diff);
    return iso(d);
  }
  function addDays(s, n) { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); }
  function isoWeekNumber(s) {
    const d = parse(s);
    const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
    const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
    return Math.ceil(((t - y0) / 86400000 + 1) / 7);
  }

  /* ---------- equipment & exercise choice ---------- */
  const canDo = (ex) => ex.equip.every((q) => state.equipment[q]);

  function chooseExercise(slot) {
    const pref = state.swaps[slot.id];
    if (pref && window.GP.EX[pref] && canDo(window.GP.EX[pref])) return { ex: window.GP.EX[pref], swapped: false };
    const first = window.GP.EX[slot.options[0]];
    for (const id of slot.options) {
      const ex = window.GP.EX[id];
      if (ex && canDo(ex)) return { ex, swapped: id !== first.id };
    }
    return { ex: first, swapped: false, unavailable: true };
  }

  /* ---------- history helpers ---------- */
  function lastEntryFor(exId, beforeDate) {
    for (let i = state.sessions.length - 1; i >= 0; i--) {
      const s = state.sessions[i];
      if (beforeDate && s.date > beforeDate) continue;
      const en = s.entries.find((x) => x.exId === exId && x.sets.some((st) => st.done));
      if (en) return { date: s.date, sets: en.sets.filter((st) => st.done) };
    }
    return null;
  }

  function historyFor(exId) {
    const out = [];
    for (const s of state.sessions) {
      for (const en of s.entries) {
        if (en.exId !== exId) continue;
        const sets = en.sets.filter((st) => st.done);
        if (!sets.length) continue;
        const best = Math.max(...sets.map((st) => e1rm(+st.w, +st.r)));
        const top = Math.max(...sets.map((st) => +st.w || 0));
        out.push({ date: s.date, sets, best, top, volume: sets.reduce((a, st) => a + (+st.w || 0) * (+st.r || 0), 0) });
      }
    }
    return out;
  }

  // Epley estimated 1-rep max
  const e1rm = (w, r) => (!w || !r ? 0 : r === 1 ? w : w * (1 + r / 30));

  function sessionsInWeek(ws) {
    const we = addDays(ws, 6);
    return state.sessions.filter((s) => s.date >= ws && s.date <= we);
  }
  function runsInWeek(ws) {
    const we = addDays(ws, 6);
    return state.runs.filter((r) => r.date >= ws && r.date <= we);
  }

  /** Which plan days are done in the week starting ws */
  function weekStatus(ws) {
    const done = {};
    for (const s of sessionsInWeek(ws)) done[s.day] = s;
    for (const r of runsInWeek(ws)) if (!done.wed) done.wed = { run: r, date: r.date };
    return done;
  }

  Object.assign(window.GP, {
    store: {
      get state() { return state; },
      save, uid, replace(next) { state = Object.assign(DEFAULT(), next); save(); },
      reset() { state = DEFAULT(); save(); },
    },
    dates: { iso, parse, today, dayKeyOf, weekStart, addDays, isoWeekNumber },
    canDo, chooseExercise, lastEntryFor, historyFor, e1rm, sessionsInWeek, runsInWeek, weekStatus,
  });
})();
