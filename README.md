# 🏋️ GymPlanner

A personal weekly gym plan + workout tracker + exercise guide + AI coach. It's a static website: no server, no build step, no account. Your data stays in your browser.

## The weekly plan

| Day | Session | Muscles |
|---|---|---|
| Mon | **Push** | Chest, triceps (+ side delts) |
| Tue | **Pull** | Lats, upper back, rear delts, biceps, forearms, lower back |
| Wed | **Run** | Easy Zone 2 run / intervals (alternating weeks) + stretches |
| Thu | **Shoulders & Arms** | Overhead press, side + rear delts, traps, arm superset, forearms |
| Fri | **Core & Recovery** | Lower/upper abs, anti-extension, anti-rotation, side plank, calves, mobility |
| Sat | **Make-up / Flex** | Tells you which missed session to do, or rest / active recovery |
| Sun | **Legs** | Squat, hinge, single-leg, hamstring curl, quad isolation, glutes, calves, hips |

The **Plan review** page in the app explains what changed from the original split and why.

## Features

- **Today**: opens the right workout for the day. Log weight × reps per set, tap ✓, and the rest timer starts on its own.
- **Progressive overload hints**: "last time you hit 8 reps on all sets → try 62.5 kg".
- **Swap any exercise**: each slot has ranked alternatives. Untick missing machines under **My gym** and the plan swaps them automatically.
- **Exercise library**: 114 exercises with animated start/finish photos, a front/back muscle map, form cues, common mistakes and alternatives.
- **Muscle coverage**: heat map of weekly sets per muscle, planned vs. actually logged.
- **Progress**: weekly volume chart, strength records (estimated 1RM), bodyweight log, run log, workout history.
- **AI Coach (Gemini)**: chat with a coach that knows your plan, your equipment and your recent workouts. Add your own API key in Settings.
- **Backup**: export/import your data as JSON.

## Run it

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

### Put it on your phone (free hosting)

1. GitHub repo → **Settings → Pages** → Source: *Deploy from a branch* → pick your branch, folder `/ (root)`.
2. Open the URL on your phone → browser menu → **Add to Home Screen**.

## Gemini key

Create a key at <https://aistudio.google.com/apikey> and paste it in **Coach** or **Settings**. The key is stored only in your browser's localStorage and is sent only to Google. It is **never** included in exported backups. Don't commit it to this repo.

## Credits

Exercise photos come from [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (public domain / Unlicense).
