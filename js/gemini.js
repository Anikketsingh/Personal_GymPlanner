/* Optional Google Gemini integration (AI coach).
 * The API key is entered by you in Settings and stored only in this browser.
 */
(function () {
  const BASE = 'https://generativelanguage.googleapis.com/v1beta';

  function key() {
    const k = window.GP.store.state.settings.geminiKey;
    if (!k) throw new Error('No Gemini API key yet — add one in Settings.');
    return k;
  }

  async function call(path, init) {
    const res = await fetch(`${BASE}/${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key(), ...(init && init.headers) },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((data.error && data.error.message) || `Gemini error ${res.status}`);
    return data;
  }

  /** Models available to this key that support generateContent. */
  async function listModels() {
    const data = await call('models?pageSize=200', { method: 'GET' });
    return (data.models || [])
      .filter((m) => (m.supportedGenerationMethods || []).includes('generateContent'))
      .map((m) => m.name.replace(/^models\//, ''));
  }

  /**
   * Picks the newest stable "flash" model this key can use (falls back to any flash / any model).
   * Google retires model names over time, so we never hard-depend on one.
   */
  async function bestModel() {
    const models = await listModels();
    const ver = (n) => (n.match(/gemini-(\d+(?:\.\d+)?)/) || [0, 0])[1] * 1;
    const byNewest = (a, b) => ver(b) - ver(a);
    const stable = models.filter((n) => /^gemini-\d+(\.\d+)?-flash$/.test(n)).sort(byNewest);
    const flash = models.filter((n) => /flash/.test(n) && !/lite|image|tts|live|audio|embed/.test(n)).sort(byNewest);
    const any = models.filter((n) => /^gemini/.test(n) && !/image|tts|live|audio|embed/.test(n)).sort(byNewest);
    const pick = stable[0] || flash[0] || any[0];
    if (!pick) throw new Error('Your key has no Gemini models available.');
    return pick;
  }

  const isModelGone = (msg) => /no longer available|not found|is not supported|deprecated|retired|update your code/i.test(msg);

  /**
   * history: [{ role:'user'|'model', text, images?:[{ mime, data }] }]
   * Images (base64, no data: prefix) are sent inline so Gemini can see them.
   */
  async function chat(history, systemText) {
    const st = window.GP.store.state;
    const body = {
      systemInstruction: { parts: [{ text: systemText }] },
      contents: history.map((m) => ({
        role: m.role,
        parts: [
          ...(m.images || []).filter((im) => im.data).map((im) => ({ inlineData: { mimeType: im.mime, data: im.data } })),
          { text: m.text || 'Please look at this image.' },
        ],
      })),
      generationConfig: { temperature: 0.6, maxOutputTokens: 2048 },
    };
    const send = (model) => call(`models/${encodeURIComponent(model)}:generateContent`, { method: 'POST', body: JSON.stringify(body) });

    let data;
    try {
      if (!st.settings.geminiModel) throw new Error('not found');
      data = await send(st.settings.geminiModel);
    } catch (err) {
      if (!isModelGone(err.message)) throw err;
      // The saved model was retired / unknown: switch to the newest available one and retry once.
      const model = await bestModel();
      st.settings.geminiModel = model;
      window.GP.store.save();
      data = await send(model);
    }
    const cand = data.candidates && data.candidates[0];
    const text = cand && cand.content && (cand.content.parts || []).map((p) => p.text || '').join('');
    if (!text) throw new Error('Gemini returned an empty answer' + (cand && cand.finishReason ? ` (${cand.finishReason})` : ''));
    return text;
  }

  /** Builds the coach's background knowledge: plan, equipment, recent training. */
  function systemPrompt() {
    const G = window.GP;
    const st = G.store.state;
    const todayKey = G.dates.dayKeyOf(G.dates.today());
    const missing = Object.keys(G.EQUIPMENT).filter((k) => !st.equipment[k]).map((k) => G.EQUIPMENT[k]);
    const planText = G.ORDER.map((k) => {
      const d = G.DAYS[k];
      const lines = d.slots.map((s) => {
        const c = G.chooseExercise(s);
        return `   - ${s.name}: ${c.ex.name} ${s.sets}x${s.reps}${s.unit === 'sec' ? 's' : ''}`;
      });
      return `${d.label} — ${d.title} (${d.subtitle})\n${lines.join('\n')}`;
    }).join('\n');
    const recent = st.sessions.slice(-6).map((s) => {
      const parts = s.entries.map((en) => {
        const ex = G.EX[en.exId];
        const sets = en.sets.filter((x) => x.done).map((x) => `${x.w || 0}${st.settings.units}x${x.r}`).join(', ');
        return sets ? `${ex ? ex.name : en.exId}: ${sets}` : '';
      }).filter(Boolean);
      return `${s.date} (${G.DAYS[s.day].title}): ${parts.join('; ')}`;
    }).join('\n');
    const runs = st.runs.slice(-4).map((r) => `${r.date}: ${r.km} km in ${r.min} min (${r.kind})`).join('\n');
    const bw = st.bodyweight.length ? `${st.bodyweight[st.bodyweight.length - 1].kg} ${st.settings.units}` : 'unknown';

    return `You are a friendly, knowledgeable strength & conditioning coach inside the user's personal gym-planner web app.
Be concise and practical: short paragraphs or bullet lists, specific sets/reps/weights when useful. Use simple Markdown (**bold**, bullet lists).
Prioritise safety and good form. If the user reports sharp or joint pain, advise stopping that exercise and seeing a professional if it persists.
When suggesting alternative exercises, ONLY use equipment the user has. Prefer exercises from the app's library when they fit.
The user may attach photos: gym machines/equipment (identify the machine, say which muscles it trains, how to set it up and use it, and where it fits in their plan), their exercise form (give specific corrections), meals/nutrition labels (estimate protein & calories), or progress photos (be encouraging and objective). If a photo is unclear, say what you can and ask for a better angle.

Today is ${G.DAYS[todayKey].label} (${G.dates.today()}). Units: ${st.settings.units}. Latest bodyweight: ${bw}.

EQUIPMENT NOT AVAILABLE in the user's gym: ${missing.length ? missing.join(', ') : 'none (fully equipped gym)'}.

THE USER'S WEEKLY PLAN (exercise currently chosen for each slot):
${planText}

RECENT WORKOUTS:
${recent || 'No workouts logged yet.'}

RECENT RUNS:
${runs || 'None logged yet.'}

Exercises in the app library: ${G.EXERCISES.map((e) => e.name).join(', ')}.`;
  }

  Object.assign(window.GP, { gemini: { chat, listModels, bestModel, systemPrompt } });
})();
