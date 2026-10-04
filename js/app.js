/* GymPlanner — single-page app (hash routing, no build step). */
(function () {
  const G = window.GP;
  const S = () => G.store.state;
  const $app = document.getElementById('app');

  /* =========================================================
   * Small helpers
   * ======================================================= */
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const unit = () => S().settings.units;
  const fmtDate = (s) => G.dates.parse(s).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
  const reps = (slot) => { const [lo, hi] = String(slot.reps).split('-').map(Number); return { lo, hi: hi || lo }; };
  const fmtNum = (n) => (Math.round(n * 10) / 10).toLocaleString();
  const ICON = {
    swap: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h11l-3-3M17 17H6l3 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    info: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 11v6M12 7.5v.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    spark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" fill="currentColor"/></svg>',
  };

  function toast(msg, ms) {
    const t = document.getElementById('toast');
    t.innerHTML = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove('show'), ms || 2600);
  }

  function exImg(ex, cls) {
    const src = G.imgUrl(ex, 0);
    if (!src) return `<div class="ex-img ${cls || ''} ex-img-empty">${esc(ex.name[0])}</div>`;
    return `<div class="ex-img ${cls || ''}" data-anim><img loading="lazy" alt="${esc(ex.name)} — start" src="${src}"><img loading="lazy" alt="${esc(ex.name)} — end" src="${G.imgUrl(ex, 1)}" class="f2"></div>`;
  }

  const muscleChips = (ex) =>
    ex.primary.map((m) => `<span class="chip chip-p">${esc(G.MUSCLES[m])}</span>`).join('') +
    ex.secondary.map((m) => `<span class="chip chip-s">${esc(G.MUSCLES[m])}</span>`).join('');

  /* =========================================================
   * Progression advice (double progression)
   * ======================================================= */
  function increment(ex) {
    const kg = unit() === 'kg';
    const lower = ex.primary.some((m) => ['quads', 'glutes', 'hamstrings'].includes(m));
    const big = ex.equip.some((q) => ['barbell', 'leg_press', 'hack_squat', 'smith'].includes(q));
    if (ex.equip.includes('dumbbell') && !big) return kg ? 2 : 5;
    if (lower && big) return kg ? 5 : 10;
    return kg ? 2.5 : 5;
  }

  function advice(slot, ex) {
    const { lo, hi } = reps(slot);
    const last = G.lastEntryFor(ex.id);
    const u = slot.unit === 'sec' ? 's' : ' reps';
    if (!last) {
      if (!ex.equip.length) return { text: `First time: aim for ${hi}${u} with good form, stop 1–3 short of failure.` };
      return { text: `First time: pick a weight you can lift for ${hi} reps with 2–3 reps left in the tank.` };
    }
    const top = Math.max(...last.sets.map((s) => +s.w || 0));
    const atTop = last.sets.filter((s) => (+s.w || 0) === top);
    const allHit = atTop.length >= slot.sets && atTop.every((s) => +s.r >= hi);
    const anyLow = atTop.some((s) => +s.r < lo);
    if (slot.unit === 'sec') return allHit ? { text: `You held ${hi}s on all sets — add 5–10 s or make it harder.`, up: true } : { text: `Beat last time: add a few seconds per set.` };
    if (!top) return allHit ? { text: `Hit ${hi}+ reps on every set — make it harder (slower tempo, add weight, harder variation).`, up: true } : { text: `Aim for +1 rep per set vs last time.` };
    if (allHit) return { text: `Progress! Last time you hit ${hi}+ reps on every set → try <b>${fmtNum(top + increment(ex))} ${unit()}</b>.`, up: true, w: top + increment(ex) };
    if (anyLow) return { text: `Stay at <b>${fmtNum(top)} ${unit()}</b> and get every set to at least ${lo} reps.`, w: top };
    return { text: `Stay at <b>${fmtNum(top)} ${unit()}</b> and beat last time by a rep or two.`, w: top };
  }

  /* =========================================================
   * Drafts (workout in progress)
   * ======================================================= */
  function getDraft(day, create) {
    const st = S();
    let d = st.drafts[day];
    if (d && d.date < G.dates.weekStart(G.dates.today())) { delete st.drafts[day]; d = null; }
    if (!d && create) { d = st.drafts[day] = { date: G.dates.today(), startedAt: Date.now(), entries: {} }; }
    return d;
  }

  function getEntry(day, slot, create) {
    const d = getDraft(day, create);
    if (!d) return null;
    if (!d.entries[slot.id] && create) {
      d.entries[slot.id] = { exId: G.chooseExercise(slot).ex.id, sets: Array.from({ length: slot.sets }, () => ({ w: '', r: '', done: false })) };
    }
    return d.entries[slot.id] || null;
  }

  /* =========================================================
   * Rest timer
   * ======================================================= */
  const timer = { end: 0, total: 0, iv: null };
  function startRest(sec) {
    timer.total = sec;
    timer.end = Date.now() + sec * 1000;
    clearInterval(timer.iv);
    timer.iv = setInterval(tickRest, 250);
    tickRest();
  }
  function stopRest() {
    clearInterval(timer.iv);
    timer.iv = null;
    document.getElementById('rest').classList.remove('show');
  }
  function tickRest() {
    const el = document.getElementById('rest');
    const left = Math.max(0, Math.round((timer.end - Date.now()) / 1000));
    el.classList.add('show');
    el.querySelector('.rest-time').textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
    el.querySelector('.rest-bar i').style.width = `${timer.total ? (left / timer.total) * 100 : 0}%`;
    if (left <= 0) {
      stopRest();
      if (S().settings.sound) beep();
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      toast('Rest over — next set! 💪');
    }
  }
  function beep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.25].forEach((t) => {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.frequency.value = 880; o.connect(g); g.connect(ctx.destination);
        g.gain.setValueAtTime(0.25, ctx.currentTime + t); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.2);
        o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.22);
      });
    } catch (e) { /* audio not available */ }
  }

  /* =========================================================
   * Views
   * ======================================================= */
  const views = {};

  /* ---------- Today ---------- */
  views.today = () => {
    const day = G.dates.dayKeyOf(G.dates.today());
    return dayView(day, true);
  };

  /* ---------- One day of the plan ---------- */
  function dayHeader(d, isToday) {
    const ws = G.dates.weekStart(G.dates.today());
    const done = G.weekStatus(ws)[d.key];
    return `
      <section class="day-hero">
        <div>
          <div class="eyebrow">${isToday ? 'Today · ' : ''}${esc(d.label)}</div>
          <h1>${esc(d.title)}</h1>
          <p class="muted">${esc(d.subtitle)}</p>
          ${done ? `<div class="pill pill-good">${ICON.check} Done this week · ${fmtDate(done.date)}</div>` : ''}
        </div>
        ${d.focus.length ? `<div class="hero-map">${G.exerciseMap({ primary: d.focus, secondary: [] })}</div>` : ''}
      </section>
      <nav class="daynav">${G.ORDER.map((k) => `<a href="#/day/${k}" class="${k === d.key ? 'on' : ''}">${G.DAYS[k].label.slice(0, 3)}</a>`).join('')}</nav>`;
  }

  function dayView(dayKey, isToday) {
    const d = G.DAYS[dayKey];
    if (!d) return notFound();
    if (d.type === 'flex') return dayHeader(d, isToday) + flexBody();
    if (d.type === 'run') return dayHeader(d, isToday) + runBody(d);

    const draft = getDraft(dayKey, false);
    const warm = d.warmup ? `<details class="card warm"><summary><b>Warm-up</b> <span class="muted">· 8–10 min</span></summary><ol>${d.warmup.map((w) => `<li>${esc(w)}</li>`).join('')}</ol></details>` : '';
    const cards = d.slots.map((slot, i) => slotCard(dayKey, slot, i)).join('');
    const mob = d.mobility ? mobilityBlock('Finish with 10–15 min mobility') : '';
    const started = draft && Object.values(draft.entries).some((e) => e.sets.some((s) => s.done));
    return `${dayHeader(d, isToday)}
      ${warm}
      <div class="slots">${cards}</div>
      ${mob}
      <div class="finish-bar">
        <button class="btn btn-primary btn-lg" data-action="finish" data-day="${dayKey}">${ICON.check} Finish workout</button>
        ${started ? `<button class="btn btn-ghost" data-action="discard" data-day="${dayKey}">Discard</button>` : ''}
      </div>`;
  }

  function slotCard(dayKey, slot, i) {
    const entry = getEntry(dayKey, slot, false);
    const choice = G.chooseExercise(slot);
    const ex = entry ? G.EX[entry.exId] : choice.ex;
    const adv = advice(slot, ex);
    const last = G.lastEntryFor(ex.id);
    const sets = entry ? entry.sets : Array.from({ length: slot.sets }, () => ({ w: '', r: '', done: false }));
    const isSec = slot.unit === 'sec';
    const doneCount = sets.filter((s) => s.done).length;
    const rows = sets.map((s, n) => {
      const ls = last && (last.sets[n] || last.sets[last.sets.length - 1]);
      const phW = ls ? ls.w : (adv.w != null ? adv.w : '');
      const phR = ls ? ls.r : reps(slot).hi;
      return `<div class="set-row ${s.done ? 'done' : ''}">
        <span class="set-n">${n + 1}</span>
        ${isSec ? '<span class="set-x muted">—</span>' : `<label class="fld"><input inputmode="decimal" data-set="w" data-slot="${slot.id}" data-day="${dayKey}" data-i="${n}" value="${esc(s.w)}" placeholder="${esc(phW)}"><span>${unit()}</span></label>`}
        <label class="fld"><input inputmode="numeric" data-set="r" data-slot="${slot.id}" data-day="${dayKey}" data-i="${n}" value="${esc(s.r)}" placeholder="${esc(phR)}"><span>${isSec ? 'sec' : 'reps'}</span></label>
        <button class="tick" data-action="tick" data-slot="${slot.id}" data-day="${dayKey}" data-i="${n}" aria-label="Mark set ${n + 1} done">${ICON.check}</button>
      </div>`;
    }).join('');
    const badges = [
      slot.optional ? '<span class="badge">Optional</span>' : '',
      choice.swapped && !entry ? '<span class="badge badge-warn" title="Your first-choice exercise needs equipment you don\'t have">Auto-swapped for your gym</span>' : '',
      choice.unavailable ? '<span class="badge badge-bad">No option fits your equipment — swap or ask the coach</span>' : '',
    ].join('');
    return `<article class="card slot ${doneCount >= sets.length ? 'slot-done' : ''}" id="slot-${slot.id}">
      <div class="slot-head">
        <a href="#/ex/${ex.id}" class="slot-img">${exImg(ex)}</a>
        <div class="slot-meta">
          <div class="eyebrow">${i + 1}. ${esc(slot.name)}</div>
          <h3><a href="#/ex/${ex.id}">${esc(ex.name)}</a></h3>
          <div class="muted small">${slot.sets} × ${esc(slot.reps)}${isSec ? ' s' : ''} · rest ${Math.round(slot.rest / 15) * 15 >= 60 ? `${Math.floor(slot.rest / 60)}:${String(slot.rest % 60).padStart(2, '0')}` : slot.rest + 's'}</div>
          <div class="chips">${badges}</div>
        </div>
      </div>
      <div class="slot-actions">
        <button class="btn btn-sm" data-action="swap" data-slot="${slot.id}" data-day="${dayKey}">${ICON.swap} Swap</button>
        <a class="btn btn-sm" href="#/ex/${ex.id}">${ICON.info} How to</a>
        <span class="slot-progress">${doneCount}/${sets.length} sets</span>
      </div>
      ${slot.note ? `<p class="note">${esc(slot.note)}</p>` : ''}
      <p class="advice ${adv.up ? 'advice-up' : ''}">${adv.text}</p>
      ${last ? `<p class="muted small">Last time (${fmtDate(last.date)}): ${last.sets.map((s) => (isSec ? `${esc(s.r)}s` : `${esc(s.w || 0)}×${esc(s.r)}`)).join(' · ')}</p>` : ''}
      <div class="sets">${rows}</div>
      <button class="btn btn-ghost btn-sm" data-action="addset" data-slot="${slot.id}" data-day="${dayKey}">+ Add set</button>
    </article>`;
  }

  function mobilityBlock(title) {
    return `<section class="card"><h2>${esc(title)}</h2>
      <div class="mob-grid">${G.MOBILITY.map((m) => `
        <div class="mob">
          <div class="ex-img ex-img-sm" data-anim><img loading="lazy" alt="${esc(m.name)}" src="https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/${m.img}/0.jpg"><img loading="lazy" alt="" class="f2" src="https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/${m.img}/1.jpg"></div>
          <div><b>${esc(m.name)}</b><div class="muted small">${esc(m.dose)}</div></div>
        </div>`).join('')}</div></section>`;
  }

  /* ---------- Wednesday: run ---------- */
  function runBody(d) {
    const wk = G.dates.isoWeekNumber(G.dates.today());
    const plan = d.runs[wk % 2 ? 'A' : 'B'];
    const other = d.runs[wk % 2 ? 'B' : 'A'];
    const runs = S().runs.slice().reverse().slice(0, 8);
    return `
      <section class="card">
        <div class="eyebrow">This week's run</div>
        <h2>${esc(plan.name)}</h2>
        <p>${esc(plan.detail)}</p>
        <p class="muted small">Next week: ${esc(other.name)}. Alternating keeps you improving without beating up your legs before the week's lifting.</p>
        <details><summary>Running form tips</summary><ul>${G.EX.run.cues.map((c) => `<li>${esc(c)}</li>`).join('')}</ul></details>
      </section>
      <section class="card">
        <h2>Log your run</h2>
        <form class="form-grid" data-form="run">
          <label>Distance (km)<input name="km" inputmode="decimal" required placeholder="5"></label>
          <label>Time (min)<input name="min" inputmode="decimal" required placeholder="30"></label>
          <label>Type<select name="kind"><option ${wk % 2 ? 'selected' : ''}>Easy</option><option ${wk % 2 ? '' : 'selected'}>Intervals</option><option>Long</option><option>Tempo</option><option>Treadmill</option></select></label>
          <label class="span2">Notes<input name="notes" placeholder="How did it feel?"></label>
          <button class="btn btn-primary span2">Save run</button>
        </form>
      </section>
      <section class="card"><h2>After the run (5 min)</h2><ul>${d.after.map((a) => `<li>${esc(a)}</li>`).join('')}</ul></section>
      ${runs.length ? `<section class="card"><h2>Recent runs</h2>${runTable(runs)}</section>` : ''}`;
  }

  function runTable(runs) {
    return `<table class="tbl"><thead><tr><th>Date</th><th>Type</th><th>km</th><th>min</th><th>Pace</th><th></th></tr></thead><tbody>${runs.map((r) => {
      const pace = r.km ? r.min / r.km : 0;
      return `<tr><td>${fmtDate(r.date)}</td><td>${esc(r.kind)}</td><td>${fmtNum(r.km)}</td><td>${fmtNum(r.min)}</td><td>${pace ? `${Math.floor(pace)}:${String(Math.round((pace % 1) * 60)).padStart(2, '0')}/km` : '—'}</td><td><button class="link-btn" data-action="delrun" data-id="${r.id}" aria-label="Delete run">✕</button></td></tr>`;
    }).join('')}</tbody></table>`;
  }

  /* ---------- Saturday: flex / make-up ---------- */
  function flexBody() {
    const ws = G.dates.weekStart(G.dates.today());
    const st = G.weekStatus(ws);
    const today = G.dates.today();
    const missed = ['mon', 'tue', 'wed', 'thu', 'fri'].filter((k, i) => !st[k] && G.dates.addDays(ws, i) < today);
    const upperFirst = missed.slice().sort((a, b) => (G.DAYS[a].type === 'lift' ? -1 : 0) - (G.DAYS[b].type === 'lift' ? -1 : 0));
    if (!missed.length) {
      return `<section class="card good-card"><h2>🔥 Perfect week so far!</h2><p>Nothing to make up. Options for today:</p>
        <ul><li><b>Rest</b> — recovery is when you grow.</li><li><b>Active recovery</b>: 30–45 min walk + mobility below.</li><li><b>Weak-point session</b>: ask the AI coach for a short session for a lagging muscle.</li></ul>
        <p class="muted small">Tomorrow is leg day — keep today light.</p></section>${mobilityBlock('Mobility routine')}`;
    }
    return `<section class="card"><h2>Make-up day</h2>
      <p>You missed <b>${missed.length}</b> session${missed.length > 1 ? 's' : ''} this week. Pick <b>one</b> to do today:</p>
      <div class="list">${upperFirst.map((k) => {
        const d = G.DAYS[k];
        return `<a class="list-row" href="#/day/${k}"><b>${esc(d.label)} — ${esc(d.title)}</b><span class="muted small">${esc(d.subtitle)}</span></a>`;
      }).join('')}</div>
      <p class="muted small">Tip: prefer an upper-body day today so your legs are fresh for Sunday. Don't try to cram two sessions into one.</p></section>`;
  }

  /* ---------- Week ---------- */
  views.week = () => {
    const today = G.dates.today();
    const ws = G.dates.weekStart(today);
    const st = G.weekStatus(ws);
    const doneCount = G.ORDER.filter((k) => k !== 'sat' && st[k]).length;
    return `<header class="page-head"><h1>Your week</h1><p class="muted">Week of ${fmtDate(ws)} · ${doneCount}/6 sessions done</p></header>
      <div class="week">${G.ORDER.map((k, i) => {
        const d = G.DAYS[k];
        const date = G.dates.addDays(ws, i);
        const isToday = date === today;
        const status = st[k] ? 'done' : isToday ? 'today' : date < today && k !== 'sat' ? 'missed' : 'upcoming';
        const label = { done: '✓ Done', today: 'Today', missed: 'Missed', upcoming: '' }[status];
        const list = d.slots.filter((s) => !s.optional).map((s) => G.chooseExercise(s).ex.name);
        return `<a class="card day-card st-${status}" href="#/day/${k}">
          <div class="day-card-top"><span class="eyebrow">${esc(d.label)} · ${fmtDate(date).split(' ').slice(1).join(' ')}</span>${label ? `<span class="status">${label}</span>` : ''}</div>
          <h3>${esc(d.title)}</h3><p class="muted small">${esc(d.subtitle)}</p>
          ${list.length ? `<p class="small day-list">${list.map(esc).join(' · ')}</p>` : ''}
        </a>`;
      }).join('')}</div>
      <section class="card"><h2>Rules of the week</h2><ul>
        <li>Missed a day? Saturday is your make-up day — the app tells you which one to do.</li>
        <li>Never skip legs. If Sunday fails, do legs Saturday instead.</li>
        <li>Every 6–8 weeks: deload week (same exercises, half the sets, lighter).</li>
      </ul><p><a href="#/review">See the full plan review →</a> · <a href="#/coverage">Muscle coverage →</a></p></section>`;
  };

  /* ---------- Library ---------- */
  const libState = { q: '', group: '', mine: false };
  views.library = () => {
    const q = libState.q.toLowerCase();
    const list = G.EXERCISES.filter((e) =>
      (!libState.group || e.group === libState.group) &&
      (!libState.mine || G.canDo(e)) &&
      (!q || e.name.toLowerCase().includes(q) || e.primary.some((m) => G.MUSCLES[m].toLowerCase().includes(q))));
    return `<header class="page-head"><h1>Exercise library</h1><p class="muted">${G.EXERCISES.length} exercises · tap one for form cues, muscles and alternatives</p></header>
      <div class="filters">
        <input type="search" placeholder="Search exercise or muscle…" value="${esc(libState.q)}" data-lib="q" aria-label="Search">
        <label class="toggle"><input type="checkbox" data-lib="mine" ${libState.mine ? 'checked' : ''}> Only what my gym has</label>
      </div>
      <div class="chips chips-scroll">
        <button class="chip-btn ${!libState.group ? 'on' : ''}" data-action="libgroup" data-g="">All</button>
        ${G.GROUPS.map((g) => `<button class="chip-btn ${libState.group === g ? 'on' : ''}" data-action="libgroup" data-g="${esc(g)}">${esc(g)}</button>`).join('')}
      </div>
      <div class="lib-grid" id="lib-grid">${libCards(list)}</div>`;
  };
  function libCards(list) {
    if (!list.length) return '<p class="muted">No exercises match.</p>';
    return list.map((e) => `<a class="card lib-card ${G.canDo(e) ? '' : 'unavail'}" href="#/ex/${e.id}">
      ${exImg(e)}
      <div class="lib-body"><b>${esc(e.name)}</b>
      <div class="muted small">${e.primary.map((m) => esc(G.MUSCLES[m])).join(', ')}</div>
      ${G.canDo(e) ? '' : '<span class="badge badge-bad">Missing equipment</span>'}</div></a>`).join('');
  }

  /* ---------- Exercise detail ---------- */
  views.ex = (id) => {
    const ex = G.EX[id];
    if (!ex) return notFound();
    const used = [];
    for (const k of G.ORDER) for (const s of G.DAYS[k].slots) if (s.options.includes(id)) used.push({ day: G.DAYS[k], slot: s });
    const alts = G.EXERCISES.filter((e) => e.id !== id && e.primary.some((m) => ex.primary.includes(m)))
      .sort((a, b) => (G.canDo(b) - G.canDo(a)) || (b.primary.filter((m) => ex.primary.includes(m)).length - a.primary.filter((m) => ex.primary.includes(m)).length));
    const hist = G.historyFor(id);
    return `<a href="javascript:history.back()" class="back">← Back</a>
      <header class="page-head"><div class="eyebrow">${esc(ex.group)}</div><h1>${esc(ex.name)}</h1></header>
      <div class="ex-top">
        <div class="card">${exImg(ex, 'ex-img-lg')}<p class="muted small center">Start ↔ finish position (animated)</p></div>
        <div class="card">${G.exerciseMap(ex)}
          <div class="legend"><span><i class="sw sw-p"></i>Primary</span><span><i class="sw sw-s"></i>Secondary</span></div>
          <div class="chips">${muscleChips(ex)}</div></div>
      </div>
      <section class="card"><h2>Equipment</h2>${ex.equip.length ? `<div class="chips">${ex.equip.map((q) => `<span class="chip ${S().equipment[q] ? 'chip-ok' : 'chip-bad'}">${S().equipment[q] ? '✓' : '✕'} ${esc(G.EQUIPMENT[q])}</span>`).join('')}</div>` : '<p>None — bodyweight only.</p>'}</section>
      <div class="two-col">
        <section class="card"><h2>How to do it</h2><ul class="cues">${ex.cues.map((c) => `<li>${esc(c)}</li>`).join('')}</ul></section>
        <section class="card"><h2>Common mistakes</h2><ul class="mistakes">${ex.mistakes.length ? ex.mistakes.map((c) => `<li>${esc(c)}</li>`).join('') : '<li>Keep it controlled and pain-free.</li>'}</ul></section>
      </div>
      ${used.length ? `<section class="card"><h2>In your plan</h2>${used.map((u) => `<p><a href="#/day/${u.day.key}">${esc(u.day.label)} · ${esc(u.slot.name)}</a> <span class="muted">— ${u.slot.sets} × ${esc(u.slot.reps)}</span></p>`).join('')}</section>` : ''}
      <section class="card"><h2>Alternatives (same muscles)</h2>
        <div class="alt-list">${alts.slice(0, 12).map((a) => `<a href="#/ex/${a.id}" class="alt ${G.canDo(a) ? '' : 'unavail'}">${exImg(a, 'ex-img-sm')}<span><b>${esc(a.name)}</b><span class="muted small">${a.equip.length ? a.equip.map((q) => esc(G.EQUIPMENT[q])).join(' + ') : 'Bodyweight'}${G.canDo(a) ? '' : ' · not in your gym'}</span></span></a>`).join('')}</div>
        <button class="btn btn-sm" data-action="askcoach" data-q="${esc(`My gym can't do ${ex.name} right now. Give me the best alternatives using only my equipment, with sets/reps and a key form cue for each.`)}">${ICON.spark} Ask AI coach for alternatives</button>
      </section>
      ${hist.length ? `<section class="card"><h2>Your history</h2>
        ${lineChart(hist.map((h) => ({ x: h.date, y: h.best })), (p) => `${fmtDate(p.x)} · est. 1RM ${fmtNum(p.y)} ${unit()}`, 'Estimated 1-rep max')}
        <table class="tbl"><thead><tr><th>Date</th><th>Sets</th><th>Est. 1RM</th></tr></thead><tbody>${hist.slice().reverse().map((h) => `<tr><td>${fmtDate(h.date)}</td><td>${h.sets.map((s) => `${esc(s.w || 0)}×${esc(s.r)}`).join(', ')}</td><td>${fmtNum(h.best)}</td></tr>`).join('')}</tbody></table></section>` : ''}
      <p class="muted small">Images: <a href="https://github.com/yuhonas/free-exercise-db" target="_blank" rel="noopener">free-exercise-db</a> (public domain).</p>`;
  };

  /* ---------- Coverage ---------- */
  const TARGET = { lo: 8, hi: 22 };
  function plannedVolume() {
    const vol = Object.fromEntries(Object.keys(G.MUSCLES).map((m) => [m, 0]));
    for (const k of G.ORDER) for (const s of G.DAYS[k].slots) {
      const ex = G.chooseExercise(s).ex;
      ex.primary.forEach((m) => { vol[m] += s.sets; });
      ex.secondary.forEach((m) => { vol[m] += s.sets * 0.5; });
    }
    return vol;
  }
  function loggedVolume(ws) {
    const vol = Object.fromEntries(Object.keys(G.MUSCLES).map((m) => [m, 0]));
    for (const s of G.sessionsInWeek(ws)) for (const en of s.entries) {
      const ex = G.EX[en.exId]; if (!ex) continue;
      const n = en.sets.filter((x) => x.done).length;
      ex.primary.forEach((m) => { vol[m] += n; });
      ex.secondary.forEach((m) => { vol[m] += n * 0.5; });
    }
    return vol;
  }
  function volumeTable(vol) {
    const max = Math.max(TARGET.hi, ...Object.values(vol));
    return `<table class="tbl vol"><thead><tr><th>Muscle</th><th>Sets / week</th><th></th></tr></thead><tbody>${Object.keys(G.MUSCLES).map((m) => {
      const v = vol[m];
      const status = v < TARGET.lo ? ['low', 'Low'] : v > TARGET.hi ? ['high', 'High'] : ['ok', 'Good'];
      return `<tr><td>${esc(G.MUSCLES[m])}</td><td><div class="vbar" data-tip="${esc(G.MUSCLES[m])}: ${fmtNum(v)} sets"><i style="width:${(v / max) * 100}%"></i><b class="vt" style="left:${(TARGET.lo / max) * 100}%"></b><b class="vt" style="left:${(TARGET.hi / max) * 100}%"></b></div></td><td class="nowrap"><span class="st st-${status[0]}">${status[1]}</span> ${fmtNum(v)}</td></tr>`;
    }).join('')}</tbody></table>`;
  }
  let covMode = 'plan';
  views.coverage = () => {
    const ws = G.dates.weekStart(G.dates.today());
    const vol = covMode === 'plan' ? plannedVolume() : loggedVolume(ws);
    const max = Math.max(...Object.values(vol), 1);
    const heat = Object.fromEntries(Object.entries(vol).map(([m, v]) => [m, v / Math.max(max, TARGET.hi)]));
    return `<header class="page-head"><h1>Muscle coverage</h1><p class="muted">Hard sets per muscle per week. Primary muscle = 1 set, secondary = ½ set. Research-backed sweet spot ≈ ${TARGET.lo}–${TARGET.hi} sets.</p></header>
      <div class="seg"><button class="${covMode === 'plan' ? 'on' : ''}" data-action="covmode" data-m="plan">Planned</button><button class="${covMode === 'log' ? 'on' : ''}" data-action="covmode" data-m="log">Logged this week</button></div>
      <div class="cov-top"><div class="card">${G.heatMap(heat, (m) => `${fmtNum(vol[m])} sets`)}
        <div class="legend heat-legend"><span>Less</span>${[1, 2, 3, 4, 5].map((l) => `<i class="sw mm-h${l}"></i>`).join('')}<span>More</span></div></div>
        <div class="card">${volumeTable(vol)}<p class="muted small">Ticks mark the ${TARGET.lo}–${TARGET.hi} set range. Small muscles (forearms, calves, adductors) can grow on less; "High" for front delts / triceps is normal because every press hits them.</p></div></div>`;
  };

  /* ---------- Progress ---------- */
  views.progress = () => {
    const st = S();
    const today = G.dates.today();
    const ws = G.dates.weekStart(today);
    const week = G.weekStatus(ws);
    const doneThisWeek = G.ORDER.filter((k) => k !== 'sat' && week[k]).length;
    // streak = consecutive weeks (ending this or last week) with ≥ 4 sessions
    let streak = 0;
    for (let w = G.dates.addDays(ws, -7); ; w = G.dates.addDays(w, -7)) {
      const n = Object.keys(G.weekStatus(w)).length;
      if (n >= 4) streak++; else break;
      if (streak > 520) break;
    }
    if (doneThisWeek >= 4) streak++;
    const weeks = [];
    for (let i = 7; i >= 0; i--) {
      const w = G.dates.addDays(ws, -7 * i);
      const vol = G.sessionsInWeek(w).reduce((a, s) => a + s.entries.reduce((b, en) => b + en.sets.filter((x) => x.done).reduce((c, x) => c + (+x.w || 0) * (+x.r || 0), 0), 0), 0);
      weeks.push({ x: w, y: vol });
    }
    // PRs
    const prs = [];
    const seen = new Set(st.sessions.flatMap((s) => s.entries.map((e) => e.exId)));
    seen.forEach((id) => {
      const h = G.historyFor(id); if (!h.length || !G.EX[id]) return;
      const best = h.reduce((a, b) => (b.best > a.best ? b : a));
      prs.push({ ex: G.EX[id], best, last: h[h.length - 1] });
    });
    prs.sort((a, b) => (a.last.date < b.last.date ? 1 : -1));
    const bw = st.bodyweight;
    return `<header class="page-head"><h1>Progress</h1></header>
      <div class="tiles">
        <div class="tile"><span class="tile-v">${doneThisWeek}<small>/6</small></span><span class="tile-l">Sessions this week</span></div>
        <div class="tile"><span class="tile-v">${streak}</span><span class="tile-l">Week streak (≥4 sessions)</span></div>
        <div class="tile"><span class="tile-v">${st.sessions.length}</span><span class="tile-l">Workouts logged</span></div>
        <div class="tile"><span class="tile-v">${fmtNum(st.runs.reduce((a, r) => a + (+r.km || 0), 0))}<small> km</small></span><span class="tile-l">Total running</span></div>
      </div>
      <section class="card"><h2>Weekly training volume</h2><p class="muted small">Total weight × reps per week (${unit()})</p>${barChart(weeks, (p) => `Week of ${fmtDate(p.x)}: ${fmtNum(p.y)} ${unit()}`)}</section>
      <section class="card"><h2>Strength records</h2>${prs.length ? `<table class="tbl"><thead><tr><th>Exercise</th><th>Best set</th><th>Est. 1RM</th></tr></thead><tbody>${prs.map((p) => {
        const top = p.best.sets.reduce((a, b) => (G.e1rm(+b.w, +b.r) > G.e1rm(+a.w, +a.r) ? b : a));
        return `<tr><td><a href="#/ex/${p.ex.id}">${esc(p.ex.name)}</a></td><td>${esc(top.w || 0)} × ${esc(top.r)}</td><td>${fmtNum(p.best.best)} ${unit()}</td></tr>`;
      }).join('')}</tbody></table>` : '<p class="muted">Log your first workout to see records here.</p>'}</section>
      <section class="card"><h2>Bodyweight</h2>
        <form class="inline-form" data-form="bw"><input name="kg" inputmode="decimal" placeholder="Today's weight (${unit()})" required><button class="btn btn-primary">Save</button></form>
        ${bw.length > 1 ? lineChart(bw.map((b) => ({ x: b.date, y: +b.kg })), (p) => `${fmtDate(p.x)} · ${fmtNum(p.y)} ${unit()}`, 'Bodyweight') : bw.length ? `<p>Latest: <b>${esc(bw[0].kg)} ${unit()}</b> (${fmtDate(bw[0].date)})</p>` : ''}
      </section>
      <section class="card"><h2>Recent workouts</h2>${st.sessions.length ? st.sessions.slice().reverse().slice(0, 15).map((s) => `
        <details class="sess"><summary><b>${fmtDate(s.date)}</b> · ${esc(G.DAYS[s.day].title)} <span class="muted small">· ${s.entries.reduce((a, e) => a + e.sets.filter((x) => x.done).length, 0)} sets${s.finishedAt && s.startedAt ? ` · ${Math.round((s.finishedAt - s.startedAt) / 60000)} min` : ''}</span></summary>
          <ul>${s.entries.map((e) => `<li>${esc(G.EX[e.exId] ? G.EX[e.exId].name : e.exId)}: ${e.sets.filter((x) => x.done).map((x) => `${esc(x.w || 0)}×${esc(x.r)}`).join(', ')}</li>`).join('')}</ul>
          <button class="link-btn danger" data-action="delsession" data-id="${s.id}">Delete this workout</button></details>`).join('') : '<p class="muted">Nothing yet — go to <a href="#/today">Today</a> and start!</p>'}</section>
      ${st.runs.length ? `<section class="card"><h2>Runs</h2>${runTable(st.runs.slice().reverse().slice(0, 10))}</section>` : ''}`;
  };

  /* ---------- Charts (single series, one hue, hover tooltips via data-tip) ---------- */
  function barChart(points, tip) {
    const W = 320; const H = 150; const pad = { l: 34, r: 6, t: 10, b: 22 };
    const max = Math.max(...points.map((p) => p.y), 1);
    const nice = niceMax(max);
    const bw = (W - pad.l - pad.r) / points.length;
    const barW = Math.min(22, bw - 6);
    const y = (v) => pad.t + (H - pad.t - pad.b) * (1 - v / nice);
    let svg = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Weekly volume bar chart">`;
    [0, 0.5, 1].forEach((f) => { const yy = y(nice * f); svg += `<line class="grid" x1="${pad.l}" x2="${W - pad.r}" y1="${yy}" y2="${yy}"/><text class="axis" x="${pad.l - 4}" y="${yy + 3}" text-anchor="end">${shortNum(nice * f)}</text>`; });
    points.forEach((p, i) => {
      const x = pad.l + i * bw + (bw - barW) / 2; const top = y(p.y); const base = y(0);
      const h = base - top; const r = Math.min(4, h);
      if (p.y > 0) svg += `<path class="bar" d="M${x} ${base} V${top + r} Q${x} ${top} ${x + r} ${top} H${x + barW - r} Q${x + barW} ${top} ${x + barW} ${top + r} V${base} Z"/>`;
      svg += `<rect class="hit" x="${pad.l + i * bw}" y="${pad.t}" width="${bw}" height="${H - pad.t - pad.b}" data-tip="${esc(tip(p))}"/>`;
      if ((points.length - 1 - i) % 2 === 0) svg += `<text class="axis" x="${x + barW / 2}" y="${H - 6}" text-anchor="middle">${esc(G.dates.parse(p.x).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }))}</text>`;
    });
    return svg + '</svg>';
  }
  function lineChart(points, tip, label) {
    const W = 320; const H = 140; const pad = { l: 34, r: 10, t: 12, b: 22 };
    const ys = points.map((p) => p.y);
    let lo = Math.min(...ys); let hi = Math.max(...ys);
    if (hi === lo) { lo -= 1; hi += 1; }
    const span = hi - lo; lo -= span * 0.1; hi += span * 0.1;
    const x = (i) => pad.l + (points.length === 1 ? (W - pad.l - pad.r) / 2 : (i / (points.length - 1)) * (W - pad.l - pad.r));
    const y = (v) => pad.t + (H - pad.t - pad.b) * (1 - (v - lo) / (hi - lo));
    let svg = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)} line chart">`;
    [lo, (lo + hi) / 2, hi].forEach((v) => { svg += `<line class="grid" x1="${pad.l}" x2="${W - pad.r}" y1="${y(v)}" y2="${y(v)}"/><text class="axis" x="${pad.l - 4}" y="${y(v) + 3}" text-anchor="end">${shortNum(v)}</text>`; });
    svg += `<polyline class="line" points="${points.map((p, i) => `${x(i)},${y(p.y)}`).join(' ')}"/>`;
    points.forEach((p, i) => { svg += `<circle class="dot" cx="${x(i)}" cy="${y(p.y)}" r="4"/><circle class="hit" cx="${x(i)}" cy="${y(p.y)}" r="12" data-tip="${esc(tip(p))}"/>`; });
    [0, points.length - 1].filter((v, i, a) => a.indexOf(v) === i).forEach((i) => { svg += `<text class="axis" x="${x(i)}" y="${H - 6}" text-anchor="${i === 0 ? 'start' : 'end'}">${esc(G.dates.parse(points[i].x).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }))}</text>`; });
    return svg + '</svg>';
  }
  const niceMax = (v) => { const p = Math.pow(10, Math.floor(Math.log10(v))); return Math.ceil(v / p) * p; };
  const shortNum = (v) => (v >= 1000 ? `${Math.round(v / 100) / 10}k` : String(Math.round(v * 10) / 10));

  /* ---------- AI Coach ---------- */
  let coachBusy = false;
  let coachImgs = [];   // photos attached to the next message: [{ mime, data(base64) }]
  let coachDraft = '';  // unsent text, kept across re-renders
  const ICON_CAM = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="13" r="3.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
  const ICON_PIC = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="4.5" width="17" height="15" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="10" r="1.8" fill="currentColor"/><path d="M4 18l5-5 4 4 3-3 4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>';
  views.coach = (arg, query) => {
    const st = S();
    const prefill = query.get('q') || coachDraft;
    if (!st.settings.geminiKey) {
      return `<header class="page-head"><h1>AI Coach</h1><p class="muted">Powered by Google Gemini — knows your plan, your gym's equipment and your recent workouts.</p></header>
        <section class="card"><h2>Connect Gemini</h2>
          <ol><li>Open <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">Google AI Studio → API keys</a> and create a key (free tier is fine).</li>
          <li>Paste it below. It is stored <b>only in this browser</b> and sent only to Google.</li></ol>
          <form class="inline-form" data-form="gkey"><input name="key" type="password" placeholder="Paste Gemini API key" required autocomplete="off"><button class="btn btn-primary">Save key</button></form>
          <p class="muted small">Tip: in Google Cloud you can restrict the key to the "Generative Language API" and to your website's address.</p></section>`;
    }
    const quick = [
      "Today's machine is taken / missing — what can I do instead?",
      'I only have 40 minutes today. Shorten today\'s workout.',
      'Review my last week of training. What should I improve?',
      'Give me form tips for today\'s exercises.',
      'Build me a 20-minute weak-point session for my shoulders.',
      'How much protein should I eat and what does a day of meals look like?',
    ];
    const photoQuick = [
      ['📷 What machine is this & how do I use it?', 'What machine/equipment is this? Which muscles does it train, how do I set it up and use it with good form, and where does it fit in my plan?'],
      ['📷 Check my form', 'Check my exercise form in this photo. What should I fix?'],
      ['📷 How much protein is in this meal?', 'Estimate the protein, calories, carbs and fat in this meal, and tell me if it fits my training goals.'],
    ];
    return `<header class="page-head row-between"><div><h1>AI Coach</h1><p class="muted small">Model: ${esc(st.settings.geminiModel || 'auto (newest available)')} · knows your plan, equipment & history · 📷 photos welcome</p></div>
        ${st.coach.length ? '<button class="btn btn-ghost btn-sm" data-action="clearchat">Clear chat</button>' : ''}</header>
      <div class="chat" id="chat">${st.coach.length ? st.coach.map((m) => msgHtml(m)).join('') : '<p class="muted center">Ask anything about training, form, alternatives, recovery or nutrition.</p>'}
        ${coachBusy ? '<div class="msg msg-model"><span class="typing"><i></i><i></i><i></i></span></div>' : ''}</div>
      <div class="chips chips-scroll">${photoQuick.map(([label, q]) => `<button class="chip-btn" data-action="photoquick" data-q="${esc(q)}">${esc(label)}</button>`).join('')}${quick.map((q) => `<button class="chip-btn" data-action="quick" data-q="${esc(q)}">${esc(q)}</button>`).join('')}</div>
      <form class="chat-form" data-form="chat">
        ${coachImgs.length ? `<div class="attach-row">${coachImgs.map((im, i) => `<span class="attach"><img src="data:${im.mime};base64,${im.data}" alt="Attached photo ${i + 1}"><button type="button" data-action="rmimg" data-i="${i}" aria-label="Remove photo">✕</button></span>`).join('')}</div>` : ''}
        <div class="chat-row">
          <label class="icon-btn" title="Take a photo" aria-label="Take a photo">${ICON_CAM}<input type="file" accept="image/*" capture="environment" data-coachimg hidden></label>
          <label class="icon-btn" title="Upload from gallery" aria-label="Upload photos from gallery">${ICON_PIC}<input type="file" accept="image/*" multiple data-coachimg hidden></label>
          <textarea name="q" rows="2" placeholder="${coachImgs.length ? 'Ask about the photo…' : 'Message your coach…'}">${esc(prefill)}</textarea>
          <button class="btn btn-primary" ${coachBusy ? 'disabled' : ''}>Send</button>
        </div>
      </form>`;
  };
  function msgHtml(m) {
    const imgs = (m.images || []).map((im) => (im.data ? `<img class="msg-img" src="data:${im.mime};base64,${im.data}" alt="Photo you sent">` : '<span class="msg-img msg-img-gone">📷 photo</span>')).join('');
    return `<div class="msg msg-${m.role}">${imgs ? `<div class="msg-imgs">${imgs}</div>` : ''}${m.role === 'model' ? md(m.text) : esc(m.text).replace(/\n/g, '<br>')}</div>`;
  }

  /** Shrinks a photo to max 1024px JPEG so it uploads fast and fits in storage. */
  async function shrinkImage(file, max = 1024, quality = 0.8) {
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise((resolve, reject) => { const i = new Image(); i.onload = () => resolve(i); i.onerror = () => reject(new Error(`Can't read ${file.name || 'this image'} — try a JPG or PNG`)); i.src = url; });
      const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement('canvas');
      c.width = Math.round(img.naturalWidth * scale); c.height = Math.round(img.naturalHeight * scale);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      return { mime: 'image/jpeg', data: c.toDataURL('image/jpeg', quality).split(',')[1] };
    } finally { URL.revokeObjectURL(url); }
  }
  async function addCoachImages(files) {
    for (const f of Array.from(files).slice(0, 4 - coachImgs.length)) {
      try { coachImgs.push(await shrinkImage(f)); } catch (err) { toast(esc(err.message)); }
    }
    if (files.length > 4) toast('Up to 4 photos per message');
    render();
    const ta = document.querySelector('.chat-form textarea'); if (ta) ta.focus();
  }
  function md(text) {
    const lines = esc(text).split('\n');
    let out = ''; let list = null;
    const inline = (s) => s.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/(^|[^*])\*(?!\s)(.+?)\*/g, '$1<i>$2</i>').replace(/`(.+?)`/g, '<code>$1</code>');
    for (const raw of lines) {
      const l = raw.trimEnd();
      const ul = l.match(/^\s*[-*•]\s+(.*)/); const ol = l.match(/^\s*\d+[.)]\s+(.*)/); const h = l.match(/^#{1,4}\s+(.*)/);
      const want = ul ? 'ul' : ol ? 'ol' : null;
      if (list && want !== list) { out += `</${list}>`; list = null; }
      if (want) { if (!list) { out += `<${want}>`; list = want; } out += `<li>${inline((ul || ol)[1])}</li>`; continue; }
      if (h) out += `<h4>${inline(h[1])}</h4>`;
      else if (l.trim()) out += `<p>${inline(l)}</p>`;
    }
    if (list) out += `</${list}>`;
    return out;
  }
  async function sendCoach(text) {
    const st = S();
    text = (text || '').trim();
    if (coachBusy || (!text && !coachImgs.length)) return;
    const msg = { role: 'user', text: text || 'What do you see in this photo? Give me useful advice for my training.' };
    if (coachImgs.length) msg.images = coachImgs;
    st.coach.push(msg);
    coachImgs = []; coachDraft = '';
    G.store.save(); coachBusy = true; render(); scrollChat();
    try {
      const hist = st.coach.filter((m) => !m.text.startsWith('⚠️')).slice(-20);
      while (hist.length && hist[0].role !== 'user') hist.shift();
      const reply = await G.gemini.chat(hist, G.gemini.systemPrompt());
      st.coach.push({ role: 'model', text: reply });
    } catch (err) {
      st.coach.push({ role: 'model', text: `⚠️ ${err.message}` });
    }
    coachBusy = false; G.store.save();
    if (route().name === 'coach') { render(); scrollChat(); }
  }
  const scrollChat = () => { const c = document.getElementById('chat'); if (c) c.lastElementChild && c.lastElementChild.scrollIntoView({ block: 'end' }); };

  /* ---------- My gym (equipment) ---------- */
  const EQ_GROUPS = {
    'Free weights': ['barbell', 'squat_rack', 'bench', 'dumbbell', 'ez_bar', 'kettlebell'],
    'Cables': ['cable', 'lat_pulldown'],
    'Machines': ['chest_press', 'pec_deck', 'shoulder_press', 'row_machine', 'smith', 'leg_press', 'hack_squat', 'leg_ext', 'leg_curl', 'calf_machine', 'hip_machine', 'treadmill'],
    'Bodyweight & accessories': ['pullup_bar', 'dip_bars', 'hyper_bench', 'preacher', 'ab_wheel', 'bands', 'stability_ball'],
  };
  views.gym = () => {
    const st = S();
    const affected = [];
    for (const k of G.ORDER) for (const s of G.DAYS[k].slots) {
      const c = G.chooseExercise(s);
      if (c.swapped || c.unavailable) affected.push({ d: G.DAYS[k], s, c });
    }
    return `<header class="page-head"><h1>My gym</h1><p class="muted">Untick anything your gym doesn't have (or that's broken / always busy). Your workouts swap to the best alternative automatically.</p></header>
      <div class="chips"><button class="chip-btn" data-action="preset" data-p="all">Full gym</button><button class="chip-btn" data-action="preset" data-p="home">Home: dumbbells + bench + bands + bar</button><button class="chip-btn" data-action="preset" data-p="bw">Bodyweight only</button></div>
      ${Object.entries(EQ_GROUPS).map(([g, keys]) => `<section class="card"><h2>${esc(g)}</h2><div class="eq-grid">${keys.map((k) => `
        <label class="eq"><input type="checkbox" data-eq="${k}" ${st.equipment[k] ? 'checked' : ''}><span>${esc(G.EQUIPMENT[k])}</span></label>`).join('')}</div></section>`).join('')}
      <section class="card"><h2>Effect on your plan</h2>${affected.length ? `<ul>${affected.map((a) => `<li><a href="#/day/${a.d.key}">${esc(a.d.label)}</a> · ${esc(a.s.name)}: ${a.c.unavailable ? `<span class="st st-low">no option fits</span>` : `<b>${esc(G.EX[a.s.options[0]].name)}</b> → ${esc(a.c.ex.name)}`}</li>`).join('')}</ul>` : '<p>Nothing changed — every first-choice exercise is available.</p>'}</section>`;
  };

  /* ---------- Plan review ---------- */
  views.review = () => {
    const R = G.REVIEW;
    return `<header class="page-head"><h1>Plan review</h1><p class="muted">What's good about your split, what was missing, and what changed.</p></header>
      <section class="card good-card"><h2>✅ What you got right</h2><ul>${R.good.map((g) => `<li>${esc(g)}</li>`).join('')}</ul></section>
      <section class="card"><h2>🛠 Fixes I made</h2>${R.fixes.map((f) => `<details class="fix"><summary><b>${esc(f.title)}</b></summary><p>${esc(f.detail)}</p></details>`).join('')}</section>
      <section class="card"><h2>📈 Training principles</h2><ul>${R.principles.map((g) => `<li>${esc(g)}</li>`).join('')}</ul></section>
      <section class="card"><h2>The final week</h2><table class="tbl"><tbody>${G.ORDER.map((k) => `<tr><td><b>${esc(G.DAYS[k].label)}</b></td><td><a href="#/day/${k}">${esc(G.DAYS[k].title)}</a></td><td class="muted">${esc(G.DAYS[k].subtitle)}</td></tr>`).join('')}</tbody></table></section>`;
  };

  views.mobility = () => `<header class="page-head"><h1>Mobility</h1><p class="muted">10–15 min. Great on Friday, Saturday, or after a run.</p></header>${mobilityBlock('Full-body routine')}`;

  /* ---------- Settings ---------- */
  views.settings = () => {
    const s = S().settings;
    return `<header class="page-head"><h1>Settings</h1></header>
      <section class="card"><h2>Training</h2><div class="form-grid">
        <label>Units<select data-setting="units"><option value="kg" ${s.units === 'kg' ? 'selected' : ''}>kg</option><option value="lb" ${s.units === 'lb' ? 'selected' : ''}>lb</option></select></label>
        <label class="toggle"><input type="checkbox" data-setting="restAuto" ${s.restAuto ? 'checked' : ''}> Auto-start rest timer when I tick a set</label>
        <label class="toggle"><input type="checkbox" data-setting="sound" ${s.sound ? 'checked' : ''}> Beep when rest is over</label>
      </div></section>
      <section class="card"><h2>Gemini AI coach</h2><div class="form-grid">
        <label class="span2">API key<input type="password" data-setting="geminiKey" value="${esc(s.geminiKey)}" placeholder="Paste key from aistudio.google.com/apikey" autocomplete="off"></label>
        <label class="span2">Model<input data-setting="geminiModel" value="${esc(s.geminiModel)}" list="models" placeholder="Auto — newest available model"><datalist id="models"></datalist></label>
        <button class="btn span2" data-action="testkey">Test key & load available models</button>
        <p class="muted small span2" id="keymsg">Your key stays in this browser's storage and is only sent to Google.</p>
      </div></section>
      <section class="card"><h2>Your data</h2><p class="muted small">Everything is stored in this browser. Export regularly to keep a backup or move to another device.</p>
        <div class="btn-row"><button class="btn" data-action="export">Export backup</button><label class="btn">Import backup<input type="file" accept="application/json" data-import hidden></label>
        <button class="btn btn-danger" data-action="reset">Reset everything</button></div></section>`;
  };

  /* ---------- More ---------- */
  views.more = () => `<header class="page-head"><h1>More</h1></header>
    <div class="list">
      <a class="list-row" href="#/gym"><b>🏋️ My gym equipment</b><span class="muted small">Tell the app what's available — workouts adapt</span></a>
      <a class="list-row" href="#/coverage"><b>🗺️ Muscle coverage</b><span class="muted small">Heat map of weekly sets per muscle</span></a>
      <a class="list-row" href="#/review"><b>📝 Plan review</b><span class="muted small">What was missing from your split & why it changed</span></a>
      <a class="list-row" href="#/mobility"><b>🧘 Mobility routine</b><span class="muted small">Stretches with pictures</span></a>
      <a class="list-row" href="#/settings"><b>⚙️ Settings & backup</b><span class="muted small">Units, Gemini key, export / import</span></a>
    </div>`;

  const notFound = () => '<p>Page not found. <a href="#/today">Go to today</a></p>';

  /* =========================================================
   * Router
   * ======================================================= */
  function route() {
    const h = location.hash.replace(/^#\/?/, '') || 'today';
    const [path, qs] = h.split('?');
    const [name, arg] = path.split('/');
    return { name, arg, query: new URLSearchParams(qs || '') };
  }
  function render() {
    const r = route();
    let html;
    if (r.name === 'day') html = dayView(r.arg, r.arg === G.dates.dayKeyOf(G.dates.today()));
    else html = (views[r.name] || notFound)(r.arg, r.query);
    $app.innerHTML = html;
    const tab = { today: 'today', day: 'week', week: 'week', library: 'library', ex: 'library', progress: 'progress', coach: 'coach' }[r.name] || 'more';
    document.querySelectorAll('.tabs a').forEach((a) => a.classList.toggle('on', a.dataset.tab === tab));
  }
  window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });

  /* =========================================================
   * Swap sheet
   * ======================================================= */
  function openSwap(dayKey, slotId) {
    const slot = G.DAYS[dayKey].slots.find((s) => s.id === slotId);
    const entry = getEntry(dayKey, slot, false);
    const current = entry ? entry.exId : G.chooseExercise(slot).ex.id;
    const cur = G.EX[current];
    const extra = G.EXERCISES.filter((e) => !slot.options.includes(e.id) && e.primary.some((m) => cur.primary.includes(m)) && G.canDo(e));
    const row = (e) => `<button class="alt ${G.canDo(e) ? '' : 'unavail'} ${e.id === current ? 'on' : ''}" data-action="pick" data-day="${dayKey}" data-slot="${slotId}" data-ex="${e.id}" ${G.canDo(e) ? '' : 'disabled'}>
      ${exImg(e, 'ex-img-sm')}<span><b>${esc(e.name)}</b><span class="muted small">${e.equip.length ? e.equip.map((q) => esc(G.EQUIPMENT[q])).join(' + ') : 'Bodyweight'}${G.canDo(e) ? '' : ' · not in your gym'}</span></span>${e.id === current ? '<span class="badge">Current</span>' : ''}</button>`;
    const sheet = document.getElementById('sheet');
    sheet.innerHTML = `<div class="sheet-box" role="dialog" aria-label="Swap exercise">
      <div class="row-between"><h2>Swap: ${esc(slot.name)}</h2><button class="link-btn" data-action="closesheet" aria-label="Close">✕</button></div>
      <h4>Recommended options</h4><div class="alt-list">${slot.options.map((id) => row(G.EX[id])).join('')}</div>
      ${extra.length ? `<h4>More that hit the same muscles</h4><div class="alt-list">${extra.map(row).join('')}</div>` : ''}
      <div class="btn-row"><button class="btn btn-ghost btn-sm" data-action="pick" data-day="${dayKey}" data-slot="${slotId}" data-ex="">Reset to default</button>
      <button class="btn btn-sm" data-action="askcoach" data-q="${esc(`For my "${slot.name}" slot (${slot.sets}x${slot.reps}), ${cur.name} isn't possible right now. What should I do instead with my equipment?`)}">${ICON.spark} Ask AI coach</button></div></div>`;
    sheet.classList.add('show');
  }
  const closeSheet = () => document.getElementById('sheet').classList.remove('show');

  /* =========================================================
   * Events
   * ======================================================= */
  document.addEventListener('click', (ev) => {
    const el = ev.target.closest('[data-action]');
    if (!el) { if (ev.target.id === 'sheet') closeSheet(); return; }
    const a = el.dataset.action; const st = S();
    const day = el.dataset.day; const slotId = el.dataset.slot;
    const slot = day && slotId ? G.DAYS[day].slots.find((s) => s.id === slotId) : null;

    switch (a) {
      case 'tick': {
        const entry = getEntry(day, slot, true);
        const i = +el.dataset.i; const set = entry.sets[i];
        if (!set.done) {
          const card = document.getElementById(`slot-${slotId}`);
          const wIn = card.querySelector(`input[data-set="w"][data-i="${i}"]`); const rIn = card.querySelector(`input[data-set="r"][data-i="${i}"]`);
          set.w = wIn ? (wIn.value || wIn.placeholder || '') : '';
          set.r = rIn.value || rIn.placeholder || '';
          if (!set.r) { toast('Enter your reps first'); return; }
          set.done = true;
          if (st.settings.restAuto && i < entry.sets.length - 1) startRest(slot.rest);
          else if (st.settings.restAuto) startRest(Math.min(slot.rest, 120));
        } else set.done = false;
        G.store.save(); render(); break;
      }
      case 'addset': { const entry = getEntry(day, slot, true); const lastSet = entry.sets[entry.sets.length - 1]; entry.sets.push({ w: lastSet ? lastSet.w : '', r: '', done: false }); G.store.save(); render(); break; }
      case 'swap': openSwap(day, slotId); break;
      case 'pick': {
        const id = el.dataset.ex;
        if (id) st.swaps[slotId] = id; else delete st.swaps[slotId];
        const entry = getEntry(day, slot, false);
        if (entry) entry.exId = id || G.chooseExercise(slot).ex.id;
        G.store.save(); closeSheet(); render(); toast('Exercise swapped'); break;
      }
      case 'closesheet': closeSheet(); break;
      case 'finish': finish(day); break;
      case 'discard': if (confirm('Discard this workout in progress?')) { delete st.drafts[day]; G.store.save(); render(); } break;
      case 'libgroup': libState.group = el.dataset.g; render(); break;
      case 'covmode': covMode = el.dataset.m; render(); break;
      case 'delrun': if (confirm('Delete this run?')) { st.runs = st.runs.filter((r) => r.id !== el.dataset.id); G.store.save(); render(); } break;
      case 'delsession': if (confirm('Delete this workout permanently?')) { st.sessions = st.sessions.filter((s) => s.id !== el.dataset.id); G.store.save(); render(); } break;
      case 'askcoach': closeSheet(); location.hash = `#/coach?q=${encodeURIComponent(el.dataset.q)}`; break;
      case 'quick': sendCoach(el.dataset.q); break;
      case 'photoquick': {
        coachDraft = el.dataset.q;
        const ta = document.querySelector('.chat-form textarea'); if (ta) ta.value = coachDraft;
        if (coachImgs.length) sendCoach(coachDraft);
        else document.querySelector('input[data-coachimg][capture]').click();
        break;
      }
      case 'rmimg': coachDraft = (document.querySelector('.chat-form textarea') || {}).value || coachDraft; coachImgs.splice(+el.dataset.i, 1); render(); break;
      case 'clearchat': if (confirm('Clear the conversation?')) { st.coach = []; G.store.save(); render(); } break;
      case 'preset': {
        const p = el.dataset.p;
        const home = ['dumbbell', 'bench', 'bands', 'pullup_bar'];
        Object.keys(G.EQUIPMENT).forEach((k) => { st.equipment[k] = p === 'all' ? true : p === 'home' ? home.includes(k) : k === 'pullup_bar'; });
        G.store.save(); render(); toast('Equipment updated'); break;
      }
      case 'rest-minus': timer.end -= 15000; timer.total = Math.max(timer.total - 15, 1); tickRest(); break;
      case 'rest-plus': timer.end += 15000; timer.total += 15; tickRest(); break;
      case 'rest-skip': stopRest(); break;
      case 'testkey': testKey(); break;
      case 'export': exportData(); break;
      case 'reset': if (confirm('Delete ALL your data (workouts, runs, settings)? This cannot be undone.')) { G.store.reset(); render(); toast('Reset done'); } break;
      default:
    }
  });

  document.addEventListener('input', (ev) => {
    const t = ev.target;
    if (t.dataset.set) {
      const slot = G.DAYS[t.dataset.day].slots.find((s) => s.id === t.dataset.slot);
      const entry = getEntry(t.dataset.day, slot, true);
      entry.sets[+t.dataset.i][t.dataset.set] = t.value.replace(',', '.');
      G.store.save();
    } else if (t.matches('.chat-form textarea')) {
      coachDraft = t.value;
    } else if (t.dataset.lib === 'q') {
      libState.q = t.value;
      const grid = document.getElementById('lib-grid');
      const q = t.value.toLowerCase();
      grid.innerHTML = libCards(G.EXERCISES.filter((e) => (!libState.group || e.group === libState.group) && (!libState.mine || G.canDo(e)) && (!q || e.name.toLowerCase().includes(q) || e.primary.some((m) => G.MUSCLES[m].toLowerCase().includes(q)))));
    }
  });

  document.addEventListener('change', (ev) => {
    const t = ev.target; const st = S();
    if (t.dataset.lib === 'mine') { libState.mine = t.checked; render(); }
    else if (t.dataset.eq) { st.equipment[t.dataset.eq] = t.checked; G.store.save(); render(); }
    else if (t.dataset.setting) {
      st.settings[t.dataset.setting] = t.type === 'checkbox' ? t.checked : t.value.trim();
      G.store.save(); toast('Saved');
    } else if (t.hasAttribute('data-import') && t.files[0]) importData(t.files[0]);
    else if (t.hasAttribute('data-coachimg') && t.files.length) { coachDraft = (document.querySelector('.chat-form textarea') || {}).value || coachDraft; addCoachImages(t.files); }
  });

  document.addEventListener('submit', (ev) => {
    const f = ev.target; const kind = f.dataset.form; if (!kind) return;
    ev.preventDefault();
    const data = Object.fromEntries(new FormData(f).entries()); const st = S();
    if (kind === 'run') {
      const km = parseFloat(String(data.km).replace(',', '.')); const min = parseFloat(String(data.min).replace(',', '.'));
      if (!(km > 0) || !(min > 0)) { toast('Enter distance and time'); return; }
      st.runs.push({ id: G.store.uid(), date: G.dates.today(), km, min, kind: data.kind, notes: data.notes || '' });
      G.store.save(); render(); toast('Run saved 🏃');
    } else if (kind === 'bw') {
      const kg = parseFloat(String(data.kg).replace(',', '.')); if (!(kg > 0)) return;
      const today = G.dates.today();
      st.bodyweight = st.bodyweight.filter((b) => b.date !== today).concat({ date: today, kg }).sort((a, b) => (a.date < b.date ? -1 : 1));
      G.store.save(); render(); toast('Saved');
    } else if (kind === 'gkey') {
      st.settings.geminiKey = data.key.trim(); G.store.save(); render(); toast('Key saved — say hi to your coach!');
    } else if (kind === 'chat') {
      sendCoach(data.q);
    }
  });

  // Enter sends in chat (Shift+Enter = new line)
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' && !ev.shiftKey && ev.target.matches('.chat-form textarea')) { ev.preventDefault(); ev.target.form.requestSubmit(); }
  });

  // Hover / tap tooltips for charts
  const tipEl = document.getElementById('tip');
  document.addEventListener('pointerover', (ev) => {
    const t = ev.target.closest('[data-tip]');
    if (!t) { tipEl.classList.remove('show'); return; }
    tipEl.textContent = t.dataset.tip; tipEl.classList.add('show');
    const r = t.getBoundingClientRect();
    tipEl.style.left = `${Math.min(window.innerWidth - tipEl.offsetWidth - 8, Math.max(8, r.left + r.width / 2 - tipEl.offsetWidth / 2))}px`;
    tipEl.style.top = `${r.top + window.scrollY - tipEl.offsetHeight - 8}px`;
  });

  // Animate start/end frames of exercise images
  setInterval(() => document.querySelectorAll('[data-anim]').forEach((el) => el.classList.toggle('alt-frame')), 1100);
  // Hide broken images gracefully
  document.addEventListener('error', (ev) => { if (ev.target.tagName === 'IMG') ev.target.style.visibility = 'hidden'; }, true);

  /* =========================================================
   * Actions
   * ======================================================= */
  function finish(day) {
    const st = S(); const d = getDraft(day, false);
    const entries = d ? Object.entries(d.entries).map(([slotId, e]) => ({ slotId, exId: e.exId, sets: e.sets.filter((s) => s.done).map((s) => ({ w: +s.w || 0, r: +s.r || 0, done: true })) })).filter((e) => e.sets.length) : [];
    if (!entries.length) { toast('Tick at least one set before finishing'); return; }
    // Personal-record check before saving
    const prs = entries.filter((e) => {
      const prev = G.historyFor(e.exId);
      if (!prev.length) return false;
      const best = Math.max(...prev.map((h) => h.best));
      return Math.max(...e.sets.map((s) => G.e1rm(s.w, s.r))) > best;
    }).map((e) => G.EX[e.exId].name);
    st.sessions.push({ id: G.store.uid(), date: G.dates.today(), day, startedAt: d.startedAt, finishedAt: Date.now(), entries });
    st.sessions.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    delete st.drafts[day];
    G.store.save(); stopRest(); render(); window.scrollTo(0, 0);
    toast(prs.length ? `🏆 New PR${prs.length > 1 ? 's' : ''}: ${prs.map(esc).join(', ')}` : 'Workout saved 💪 Great job!', 4000);
  }

  async function testKey() {
    const msg = document.getElementById('keymsg');
    msg.textContent = 'Checking…';
    try {
      const models = await G.gemini.listModels();
      document.getElementById('models').innerHTML = models.map((m) => `<option value="${esc(m)}">`).join('');
      let cur = S().settings.geminiModel;
      let note = '';
      if (!models.includes(cur)) {
        cur = await G.gemini.bestModel();
        S().settings.geminiModel = cur; G.store.save();
        const field = document.querySelector('[data-setting="geminiModel"]'); if (field) field.value = cur;
        note = ` Switched to <b>${esc(cur)}</b> (newest available).`;
      }
      msg.innerHTML = `✓ Key works. ${models.length} models available.${note}`;
    } catch (err) { msg.textContent = `✕ ${err.message}`; }
  }

  function exportData() {
    const st = { ...S(), settings: { ...S().settings, geminiKey: '' } }; // never export the API key
    const blob = new Blob([JSON.stringify(st, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `gymplanner-backup-${G.dates.today()}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  function importData(file) {
    const r = new FileReader();
    r.onload = () => {
      try {
        const data = JSON.parse(r.result);
        if (!data || !Array.isArray(data.sessions)) throw new Error('Not a GymPlanner backup');
        if (!confirm(`Import ${data.sessions.length} workouts and replace current data?`)) return;
        const key = S().settings.geminiKey;
        G.store.replace(data);
        if (!S().settings.geminiKey) { S().settings.geminiKey = key; G.store.save(); }
        render(); toast('Backup imported');
      } catch (err) { toast(`Import failed: ${esc(err.message)}`); }
    };
    r.readAsText(file);
  }

  render();
})();
