/* The weekly plan.
 * Every day is a list of "slots". A slot is a movement job (e.g. "upper chest press") with
 * a ranked list of exercise options. The app picks the first option your gym can do, and
 * every other option is an alternative you can swap to.
 */
(function () {
  const S = (id, name, sets, reps, rest, options, extra) =>
    Object.assign({ id, name, sets, reps, rest, options, unit: 'reps' }, extra || {});

  const WARMUP_LIFT = [
    '5 min light cardio (bike, rower, brisk incline walk)',
    'Dynamic mobility for the muscles you train today (arm circles, band pull-aparts, leg swings, hip circles)',
    'Ramp-up sets on the first exercise: ~50% × 10, 70% × 5, 85% × 2, then working sets',
  ];

  const MOBILITY = [
    { name: "World's greatest stretch", dose: '5 / side', img: 'Worlds_Greatest_Stretch' },
    { name: 'Cat–cow', dose: '10 slow reps', img: 'Cat_Stretch' },
    { name: 'Kneeling hip flexor stretch', dose: '45 s / side', img: 'Kneeling_Hip_Flexor' },
    { name: 'Hamstring stretch', dose: '45 s / side', img: 'Hamstring_Stretch' },
    { name: 'Pigeon / glute stretch', dose: '45 s / side', img: 'Lying_Glute' },
    { name: 'Doorway chest & front shoulder stretch', dose: '45 s / side', img: 'Chest_And_Front_Of_Shoulder_Stretch' },
    { name: 'Overhead lat stretch', dose: '45 s / side', img: 'Overhead_Lat' },
    { name: "Child's pose", dose: '60 s', img: 'Childs_Pose' },
    { name: 'Calf stretch against wall', dose: '45 s / side', img: 'Calf_Stretch_Hands_Against_Wall' },
  ];

  const DAYS = {
    mon: {
      key: 'mon', label: 'Monday', title: 'Push', subtitle: 'Chest + Triceps (+ side delts)', type: 'lift',
      focus: ['chest', 'triceps', 'front_delts', 'side_delts'],
      warmup: WARMUP_LIFT,
      slots: [
        S('mon_press', 'Heavy chest press', 4, '6-8', 150, ['bench_bb', 'bench_db', 'chest_press_machine', 'pushup']),
        S('mon_incline', 'Upper chest press', 3, '8-10', 120, ['incline_db', 'incline_bb', 'incline_machine', 'decline_pushup']),
        S('mon_fly', 'Chest fly (stretch)', 3, '12-15', 75, ['cable_fly', 'pec_deck', 'db_fly', 'pushup']),
        S('mon_tri_long', 'Triceps — overhead (long head)', 3, '10-12', 75, ['oh_ext_cable', 'oh_ext_db', 'skullcrusher', 'band_skull']),
        S('mon_tri_push', 'Triceps — pushdown', 3, '12-15', 60, ['pushdown_rope', 'pushdown_bar', 'kickback', 'bench_dips', 'close_pushup']),
        S('mon_lat', 'Side delts (bonus)', 3, '15-20', 45, ['lateral_db', 'lateral_cable', 'lateral_band'], { optional: true }),
      ],
    },
    tue: {
      key: 'tue', label: 'Tuesday', title: 'Pull', subtitle: 'Back + Biceps + Rear delts', type: 'lift',
      focus: ['lats', 'upper_back', 'biceps', 'rear_delts', 'lower_back'],
      warmup: WARMUP_LIFT,
      slots: [
        S('tue_vert', 'Vertical pull (back width)', 4, '6-10', 120, ['pullup', 'lat_pulldown', 'band_pullup', 'close_pulldown', 'straight_arm_pulldown']),
        S('tue_row', 'Heavy row (back thickness)', 3, '8-10', 120, ['bb_row', 'tbar_row', 'machine_row', 'cable_row', 'db_row', 'inverted_row']),
        S('tue_row2', 'One-arm / cable row', 3, '10-12', 90, ['db_row', 'cable_row', 'machine_row', 'inverted_row']),
        S('tue_rear', 'Rear delts + upper back', 3, '15', 60, ['face_pull', 'reverse_pec_deck', 'rear_delt_db', 'band_pull_apart']),
        S('tue_bi', 'Biceps — main curl', 3, '8-12', 75, ['bb_curl', 'ez_curl', 'db_curl', 'cable_curl']),
        S('tue_hammer', 'Brachialis / forearms', 3, '10-12', 60, ['hammer', 'rope_hammer', 'reverse_curl']),
        S('tue_low', 'Lower back', 2, '12-15', 60, ['back_ext', 'superman', 'good_morning']),
      ],
    },
    wed: {
      key: 'wed', label: 'Wednesday', title: 'Run', subtitle: 'Cardio + mobility', type: 'run',
      focus: ['quads', 'calves', 'hamstrings'],
      runs: {
        A: { name: 'Easy / Zone 2 run', detail: '30–40 min at a pace where you can still talk in full sentences (≈ 60–70% max HR). Builds your aerobic base and helps recovery.' },
        B: { name: 'Intervals', detail: '5 min easy jog → 6 × (1 min fast / 2 min easy jog) → 5 min cool-down. Fast = hard but controlled, not an all-out sprint.' },
      },
      after: ['Calf stretch 45 s / side', 'Kneeling hip flexor 45 s / side', 'Hamstring stretch 45 s / side'],
      slots: [],
    },
    thu: {
      key: 'thu', label: 'Thursday', title: 'Shoulders & Arms', subtitle: 'Delts + Traps + Arms + Forearms', type: 'lift',
      focus: ['front_delts', 'side_delts', 'rear_delts', 'traps', 'biceps', 'triceps', 'forearms'],
      warmup: WARMUP_LIFT,
      slots: [
        S('thu_press', 'Overhead press', 4, '6-10', 120, ['ohp_bb', 'db_shoulder_press', 'machine_shoulder_press', 'arnold']),
        S('thu_lat', 'Side delts', 4, '12-15', 60, ['lateral_db', 'lateral_cable', 'lateral_band', 'upright_row']),
        S('thu_rear', 'Rear delts', 3, '15-20', 60, ['reverse_pec_deck', 'rear_delt_db', 'cable_rear_fly', 'face_pull', 'band_pull_apart']),
        S('thu_traps', 'Traps', 3, '10-15', 60, ['db_shrug', 'bb_shrug', 'cable_shrug', 'farmers']),
        S('thu_bi', 'Arms superset A — biceps (stretch)', 3, '10-12', 45, ['incline_curl', 'preacher', 'concentration', 'cable_curl', 'db_curl'], { note: 'Superset with B: do A then B back-to-back, then rest.' }),
        S('thu_tri', 'Arms superset B — triceps', 3, '8-12', 75, ['cgbp', 'skullcrusher', 'dips_tri', 'close_pushup', 'pushdown_rope']),
        S('thu_fore', 'Forearms / grip', 3, '15-20', 45, ['wrist_curl_db', 'wrist_curl_bb', 'cable_wrist_curl', 'farmers', 'dead_hang']),
      ],
    },
    fri: {
      key: 'fri', label: 'Friday', title: 'Core & Recovery', subtitle: 'Abs + Obliques + Calves + Mobility', type: 'core',
      focus: ['abs', 'obliques', 'calves'],
      warmup: ['5 min easy cardio', 'Cat–cow × 10, dead bug × 5 / side'],
      slots: [
        S('fri_lower', 'Lower abs (pelvic curl)', 3, '10-15', 60, ['hanging_leg_raise', 'lying_leg_raise']),
        S('fri_upper', 'Weighted crunch', 3, '12-15', 60, ['cable_crunch', 'crunch']),
        S('fri_anti_ext', 'Anti-extension', 3, '8-12', 60, ['ab_wheel', 'barbell_rollout', 'dead_bug', 'plank']),
        S('fri_rot', 'Anti-rotation / rotation', 3, '10-12', 60, ['pallof', 'woodchop', 'russian_twist']),
        S('fri_side', 'Side plank', 2, '30-45', 45, ['side_plank'], { unit: 'sec' }),
        S('fri_calf', 'Calves (2nd weekly session)', 3, '12-20', 45, ['calf_standing', 'calf_seated', 'calf_db', 'calf_leg_press', 'calf_bw'], { note: 'Calves recover fast and respond best to 2× / week. Pause 1–2 s at the bottom of every rep.' }),
      ],
      mobility: true,
    },
    sat: {
      key: 'sat', label: 'Saturday', title: 'Make-up / Flex', subtitle: 'Catch up a missed day — or rest', type: 'flex',
      focus: [], slots: [],
    },
    sun: {
      key: 'sun', label: 'Sunday', title: 'Legs', subtitle: 'Quads + Hamstrings + Glutes + Calves', type: 'lift',
      focus: ['quads', 'hamstrings', 'glutes', 'calves', 'adductors'],
      warmup: ['5 min bike / incline walk', 'Leg swings × 10 / side, bodyweight squats × 10, glute bridges × 10', 'Ramp-up sets on the squat'],
      slots: [
        S('sun_squat', 'Squat pattern (quads)', 4, '6-8', 180, ['back_squat', 'hack_squat', 'smith_squat', 'leg_press', 'goblet_squat']),
        S('sun_hinge', 'Hip hinge (hamstrings + glutes)', 3, '8-10', 150, ['rdl_bb', 'rdl_db', 'good_morning', 'kb_swing']),
        S('sun_uni', 'Single-leg', 3, '8-10', 90, ['bulgarian', 'lunges_db', 'step_up', 'walking_lunge_bw'], { note: 'Reps are per leg.' }),
        S('sun_curl', 'Hamstring curl', 3, '10-12', 60, ['leg_curl_lying', 'leg_curl_seated', 'ball_leg_curl']),
        S('sun_ext', 'Quad isolation', 3, '12-15', 60, ['leg_ext', 'leg_press', 'goblet_squat', 'bw_squat']),
        S('sun_glute', 'Glutes', 3, '8-12', 90, ['hip_thrust', 'pull_through', 'glute_bridge', 'kb_swing']),
        S('sun_calf', 'Calves', 4, '10-15', 60, ['calf_standing', 'calf_leg_press', 'calf_db', 'calf_seated', 'calf_bw']),
        S('sun_hip', 'Adductors / abductors (bonus)', 2, '15', 45, ['hip_adductor', 'hip_abductor', 'monster_walk'], { optional: true }),
      ],
    },
  };

  const ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  const REVIEW = {
    good: [
      'Push / Pull split on Mon–Tue is a solid, proven structure.',
      'Running on Wednesday sits nicely between two upper-body days and far from leg day.',
      'Arms get trained 3× a week (Mon, Tue, Thu) — great frequency for growth.',
      'Having a flex Saturday is smart: life happens, and this keeps the week intact.',
    ],
    fixes: [
      { title: 'Legs only once a week — and they\'re the easiest day to skip', detail: 'Legs are ~50% of your muscle mass. Sunday now has a complete leg session (squat + hinge + single-leg + curls + glutes + calves). Rule: never skip legs — if Sunday fails, do legs Saturday and rest Sunday.' },
      { title: 'Missing muscles in the original split', detail: 'Rear delts, hamstrings, glutes, calves, lower back, traps, forearms, obliques and adductors were not covered. Each now has dedicated work (see the Coverage page). Calves get a second short session on Friday because they recover fast.' },
      { title: '"Shoulders" day — don\'t waste it on front delts', detail: 'Front delts are already hammered by Monday\'s pressing. Thursday has one press, then prioritises side and rear delts (what makes shoulders look wide and keeps them healthy). No front raises needed.' },
      { title: 'Core only on Friday', detail: 'Fine as a main session, but compound lifts (squats, rows, overhead press) also train your core — so keep bracing hard on those. Optional: a 5-min plank / dead bug finisher after Tuesday or Sunday.' },
      { title: 'No warm-up, progression or deload in the plan', detail: 'Added: a warm-up for every day, double progression (hit the top of the rep range on all sets → add weight), and a lighter deload week every 6–8 weeks (same exercises, ~half the sets).' },
      { title: 'Keep Wednesday runs controlled', detail: 'Alternate easy Zone 2 runs and intervals. Don\'t go all-out every week or Thursday\'s session will suffer. Increase weekly running by no more than ~10%.' },
      { title: 'Don\'t stack Saturday make-up + Sunday legs carelessly', detail: 'If you make up a missed day on Saturday, prefer an upper-body day (push / pull / shoulders) so Sunday legs stay fresh.' },
    ],
    principles: [
      'Train most sets 1–3 reps short of failure (RIR 1–3). Last set of isolation exercises can go to failure.',
      'Double progression: when you hit the TOP of the rep range on every set, increase weight next time (≈2.5 kg upper body, 5 kg lower body, smallest dumbbell jump).',
      'Aim for ~10–20 hard sets per muscle per week. The Coverage page shows where you are.',
      'Sleep 7–9 h and eat ~1.6–2.2 g protein per kg body weight — growth happens outside the gym.',
      'Pain (sharp, joint) ≠ effort (burn). Stop and swap the exercise if something hurts.',
    ],
  };

  Object.assign(window.GP, { DAYS, ORDER, REVIEW, MOBILITY });
})();
