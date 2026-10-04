/* Exercise library.
 * Images come from the public-domain free-exercise-db (github.com/yuhonas/free-exercise-db).
 * Each exercise has two frames (start / end) which the app alternates to show the movement.
 *
 * Fields: id, name, group, primary[], secondary[], equip[] (ALL items required),
 *         img (free-exercise-db folder id or null), cues[], mistakes[]
 */
(function () {
  const MUSCLES = {
    chest: 'Chest', front_delts: 'Front delts', side_delts: 'Side delts', rear_delts: 'Rear delts',
    traps: 'Traps', lats: 'Lats', upper_back: 'Upper back (rhomboids / mid-traps)', lower_back: 'Lower back (erectors)',
    biceps: 'Biceps', triceps: 'Triceps', forearms: 'Forearms / grip', abs: 'Abs', obliques: 'Obliques',
    glutes: 'Glutes', quads: 'Quads', hamstrings: 'Hamstrings', adductors: 'Adductors (inner thigh)', calves: 'Calves',
  };

  const EQUIPMENT = {
    barbell: 'Barbell + plates', squat_rack: 'Squat / power rack', bench: 'Adjustable bench', dumbbell: 'Dumbbells',
    ez_bar: 'EZ curl bar', kettlebell: 'Kettlebells', cable: 'Cable machine / pulley', lat_pulldown: 'Lat pulldown machine',
    row_machine: 'Seated row machine (plate / lever)', chest_press: 'Chest press machine', pec_deck: 'Pec deck / rear-delt fly machine',
    shoulder_press: 'Shoulder press machine', smith: 'Smith machine', leg_press: 'Leg press', hack_squat: 'Hack squat machine',
    leg_ext: 'Leg extension machine', leg_curl: 'Leg curl machine', calf_machine: 'Calf raise machine',
    hip_machine: 'Hip abductor / adductor machine', pullup_bar: 'Pull-up bar', dip_bars: 'Dip bars / station',
    hyper_bench: 'Back extension (hyper) bench', preacher: 'Preacher curl bench', ab_wheel: 'Ab wheel',
    bands: 'Resistance bands', stability_ball: 'Stability ball', treadmill: 'Treadmill',
  };

  const GROUPS = ['Chest', 'Back', 'Shoulders', 'Traps', 'Biceps', 'Triceps', 'Forearms', 'Core', 'Quads', 'Hamstrings & Glutes', 'Calves', 'Cardio'];

  const L = [];
  const E = (id, name, group, primary, secondary, equip, img, cues, mistakes) =>
    L.push({ id, name, group, primary, secondary, equip, img, cues, mistakes });

  /* ---------------- CHEST ---------------- */
  E('bench_bb', 'Barbell Bench Press', 'Chest', ['chest'], ['front_delts', 'triceps'], ['barbell', 'bench'], 'Barbell_Bench_Press_-_Medium_Grip',
    ['Shoulder blades pinched back & down, slight arch, feet planted', 'Grip just wider than shoulders, wrists stacked over elbows', 'Lower to mid/lower chest with elbows ~45–70° from torso', 'Press up and slightly back toward your face'],
    ['Flaring elbows to 90° (shoulder strain)', 'Bouncing the bar off the chest', 'Butt lifting off the bench', 'No spotter / safety pins when going heavy']);
  E('bench_db', 'Dumbbell Bench Press', 'Chest', ['chest'], ['front_delts', 'triceps'], ['dumbbell', 'bench'], 'Dumbbell_Bench_Press',
    ['Kick dumbbells up off your knees to start', 'Lower until you feel a stretch in the chest', 'Slight inward arc as you press, don\'t clank the bells'],
    ['Going too shallow', 'Letting the dumbbells drift toward your face', 'Dropping them sideways at the end (lower to chest first)']);
  E('chest_press_machine', 'Machine Chest Press', 'Chest', ['chest'], ['front_delts', 'triceps'], ['chest_press'], 'Leverage_Chest_Press',
    ['Set seat so handles line up with mid-chest', 'Keep shoulder blades against the pad', 'Controlled 2–3s negative'],
    ['Seat too high/low (shoulders do the work)', 'Shrugging shoulders forward at lockout']);
  E('pushup', 'Push-Up', 'Chest', ['chest'], ['front_delts', 'triceps', 'abs'], [], 'Pushups',
    ['Body in one straight line, squeeze glutes', 'Hands slightly wider than shoulders', 'Chest to an inch from the floor', 'Make harder: feet elevated, backpack weight, slow tempo'],
    ['Hips sagging', 'Half reps', 'Head poking forward']);
  E('incline_db', 'Incline Dumbbell Press', 'Chest', ['chest'], ['front_delts', 'triceps'], ['dumbbell', 'bench'], 'Incline_Dumbbell_Press',
    ['Bench at 30° (not 45°+ — that becomes a shoulder press)', 'Lower to upper chest', 'Elbows slightly tucked'],
    ['Bench angle too steep', 'Arching so much it becomes a flat press']);
  E('incline_bb', 'Incline Barbell Press', 'Chest', ['chest'], ['front_delts', 'triceps'], ['barbell', 'bench'], 'Barbell_Incline_Bench_Press_-_Medium_Grip',
    ['Bench at ~30°', 'Touch just below the collarbone', 'Same set-up as flat bench: blades back, feet planted'],
    ['Bouncing', 'Too wide a grip']);
  E('incline_machine', 'Incline Machine Press', 'Chest', ['chest'], ['front_delts', 'triceps'], ['chest_press'], 'Leverage_Incline_Chest_Press',
    ['Handles at upper-chest height', 'Drive through the palms, squeeze chest at the top'], ['Rushing the negative']);
  E('decline_pushup', 'Feet-Elevated Push-Up', 'Chest', ['chest'], ['front_delts', 'triceps'], [], 'Decline_Push-Up',
    ['Feet on a bench/box — shifts work to the upper chest', 'Keep a rigid plank'], ['Piking the hips up']);
  E('cable_fly', 'Cable Fly / Crossover', 'Chest', ['chest'], ['front_delts'], ['cable'], 'Cable_Crossover',
    ['Slight bend in elbows, locked in that angle', 'Hug a big tree — hands meet in front of chest', 'Get a deep stretch at the back'],
    ['Turning it into a press by bending the elbows more', 'Too heavy — body rocks forward']);
  E('pec_deck', 'Pec Deck', 'Chest', ['chest'], ['front_delts'], ['pec_deck'], 'Butterfly',
    ['Handles at chest height', 'Squeeze 1s at the middle', 'Control the stretch'], ['Letting the weight slam back']);
  E('db_fly', 'Dumbbell Fly', 'Chest', ['chest'], ['front_delts'], ['dumbbell', 'bench'], 'Dumbbell_Flyes',
    ['Soft elbows, wide arc', 'Stop when you feel a deep stretch — not lower'], ['Going too heavy and too deep (shoulder risk)']);
  E('dips_chest', 'Chest Dips', 'Chest', ['chest'], ['triceps', 'front_delts'], ['dip_bars'], 'Dips_-_Chest_Version',
    ['Lean forward ~30°, elbows slightly out', 'Lower until shoulders are just below elbows', 'Use a band or assisted machine if needed'],
    ['Going too deep with shoulder pain', 'Shrugging up into the ears']);

  /* ---------------- TRICEPS ---------------- */
  E('pushdown_rope', 'Rope Pushdown', 'Triceps', ['triceps'], [], ['cable'], 'Triceps_Pushdown_-_Rope_Attachment',
    ['Elbows pinned to your sides', 'Spread the rope apart at the bottom', 'Only the forearms move'], ['Elbows drifting forward', 'Leaning over and using body weight']);
  E('pushdown_bar', 'Bar / V-Bar Pushdown', 'Triceps', ['triceps'], [], ['cable'], 'Triceps_Pushdown',
    ['Elbows fixed, full lockout'], ['Short, bouncy reps']);
  E('oh_ext_cable', 'Overhead Cable Triceps Extension', 'Triceps', ['triceps'], [], ['cable'], 'Cable_Rope_Overhead_Triceps_Extension',
    ['Face away from the stack, rope behind head', 'Elbows point forward, deep stretch at the bottom', 'Best exercise for the long head'], ['Elbows flaring wide']);
  E('oh_ext_db', 'Overhead Dumbbell Triceps Extension', 'Triceps', ['triceps'], [], ['dumbbell'], 'Dumbbell_One-Arm_Triceps_Extension',
    ['Hold one dumbbell with both hands (or one arm at a time)', 'Lower behind the head, elbows pointing up', 'Brace the core — no lower-back arch'], ['Elbows flaring', 'Arching the back']);
  E('skullcrusher', 'EZ-Bar Skull Crusher', 'Triceps', ['triceps'], [], ['ez_bar', 'bench'], 'EZ-Bar_Skullcrusher',
    ['Lower the bar behind the top of your head', 'Upper arms slightly angled back, stay fixed'], ['Elbows flaring', 'Turning it into a press']);
  E('cgbp', 'Close-Grip Bench Press', 'Triceps', ['triceps'], ['chest', 'front_delts'], ['barbell', 'bench'], 'Close-Grip_Barbell_Bench_Press',
    ['Hands shoulder-width (not touching)', 'Elbows tucked, touch lower chest'], ['Grip too narrow (wrist pain)']);
  E('dips_tri', 'Triceps Dips (upright)', 'Triceps', ['triceps'], ['chest', 'front_delts'], ['dip_bars'], 'Dips_-_Triceps_Version',
    ['Torso upright, elbows tucked back', 'Lockout fully at the top'], ['Leaning forward (becomes chest dip)']);
  E('bench_dips', 'Bench Dips', 'Triceps', ['triceps'], ['front_delts'], ['bench'], 'Bench_Dips',
    ['Hands on bench behind you, hips close to the bench', 'Lower to ~90° elbow bend'], ['Going too deep — stresses front of shoulder']);
  E('kickback', 'Dumbbell Kickback', 'Triceps', ['triceps'], [], ['dumbbell'], 'Tricep_Dumbbell_Kickback',
    ['Upper arm parallel to floor and still', 'Squeeze at full extension'], ['Swinging the weight']);
  E('band_skull', 'Band Triceps Extension', 'Triceps', ['triceps'], [], ['bands'], 'Band_Skull_Crusher',
    ['Anchor band low/behind, extend fully', 'Great home / no-cable option'], ['Moving the upper arm']);
  E('close_pushup', 'Close-Grip Push-Up', 'Triceps', ['triceps'], ['chest', 'front_delts'], [], 'Incline_Push-Up_Close-Grip',
    ['Hands under shoulders, elbows brush the ribs', 'Elevate hands if too hard'], ['Elbows flaring']);

  /* ---------------- BACK ---------------- */
  E('pullup', 'Pull-Up', 'Back', ['lats'], ['biceps', 'upper_back', 'forearms'], ['pullup_bar'], 'Pullups',
    ['Start from a dead hang, pull shoulders down first', 'Drive elbows to your back pockets', 'Chin over bar, control down'], ['Kipping / swinging', 'Half reps (not reaching full hang)']);
  E('chinup', 'Chin-Up', 'Back', ['lats', 'biceps'], ['upper_back'], ['pullup_bar'], 'Chin-Up',
    ['Palms facing you, shoulder-width', 'More biceps than a pull-up'], ['Craning the neck to get the chin over']);
  E('band_pullup', 'Band-Assisted Pull-Up', 'Back', ['lats'], ['biceps', 'upper_back'], ['pullup_bar', 'bands'], 'Band_Assisted_Pull-Up',
    ['Loop band over bar, knee or foot in band', 'Use thinner bands as you get stronger'], ['Bouncing out of the bottom']);
  E('lat_pulldown', 'Lat Pulldown', 'Back', ['lats'], ['biceps', 'upper_back'], ['lat_pulldown'], 'Wide-Grip_Lat_Pulldown',
    ['Grip slightly wider than shoulders', 'Lean back ~15°, pull bar to upper chest', 'Think "elbows down", not "hands down"'], ['Pulling behind the neck', 'Leaning way back and rowing it', 'Using momentum']);
  E('close_pulldown', 'Close-Grip / V-Bar Pulldown', 'Back', ['lats'], ['biceps', 'upper_back'], ['lat_pulldown'], 'Close-Grip_Front_Lat_Pulldown',
    ['Neutral grip, pull to chest', 'Full stretch at the top'], ['Short range of motion']);
  E('straight_arm_pulldown', 'Straight-Arm Pulldown', 'Back', ['lats'], ['triceps'], ['cable'], 'Straight-Arm_Pulldown',
    ['Arms nearly straight, hinge slightly at hips', 'Sweep the bar to your thighs', 'Feel the lats, not the triceps'], ['Bending elbows into a pushdown']);
  E('db_pullover', 'Dumbbell Pullover', 'Back', ['lats'], ['chest', 'triceps'], ['dumbbell', 'bench'], 'Bent-Arm_Dumbbell_Pullover',
    ['Lie across or along the bench, one dumbbell over chest', 'Lower behind head with soft elbows, pull back over'], ['Going too heavy / too deep']);
  E('bb_row', 'Barbell Row', 'Back', ['upper_back', 'lats'], ['biceps', 'rear_delts', 'lower_back'], ['barbell'], 'Bent_Over_Barbell_Row',
    ['Hinge to ~45°, flat back, brace hard', 'Pull bar to lower ribs/belly', 'Pause & squeeze shoulder blades'], ['Standing up as you row (body English)', 'Rounded lower back']);
  E('tbar_row', 'T-Bar Row', 'Back', ['upper_back', 'lats'], ['biceps', 'rear_delts', 'lower_back'], ['barbell'], 'T-Bar_Row_with_Handle',
    ['Barbell in a corner/landmine, V-handle under the plate end', 'Flat back, pull to chest'], ['Jerking the weight']);
  E('machine_row', 'Machine Row', 'Back', ['upper_back', 'lats'], ['biceps', 'rear_delts'], ['row_machine'], 'Leverage_Iso_Row',
    ['Chest on pad, pull elbows back', 'Full stretch forward, squeeze back'], ['Only moving the arms, not the shoulder blades']);
  E('cable_row', 'Seated Cable Row', 'Back', ['upper_back', 'lats'], ['biceps', 'rear_delts'], ['cable'], 'Seated_Cable_Rows',
    ['Tall chest, slight knee bend', 'Pull handle to belly button', 'Let shoulders stretch forward at the start'], ['Rocking the torso back and forth']);
  E('db_row', 'One-Arm Dumbbell Row', 'Back', ['lats', 'upper_back'], ['biceps', 'rear_delts'], ['dumbbell', 'bench'], 'One-Arm_Dumbbell_Row',
    ['Hand & knee on bench, flat back', 'Pull dumbbell to your hip, elbow close', 'Big stretch at the bottom'], ['Twisting the torso open', 'Shrugging the weight up']);
  E('inverted_row', 'Inverted Row', 'Back', ['upper_back', 'lats'], ['biceps', 'rear_delts', 'abs'], ['barbell', 'squat_rack'], 'Inverted_Row',
    ['Bar in a rack (or Smith) at waist height', 'Body straight, pull chest to bar', 'Lower the bar / raise feet to make harder'], ['Hips sagging']);
  E('back_ext', 'Back Extension', 'Back', ['lower_back'], ['glutes', 'hamstrings'], ['hyper_bench'], 'Hyperextensions_Back_Extensions',
    ['Pad just below hip bones', 'Lower with control, rise to a straight line', 'Hold a plate to progress'], ['Hyper-extending past neutral at the top']);
  E('superman', 'Superman Hold', 'Back', ['lower_back'], ['glutes'], [], 'Superman',
    ['Lie face down, lift arms & legs, hold 2–3s'], ['Cranking the neck up']);
  E('good_morning', 'Good Morning', 'Hamstrings & Glutes', ['hamstrings', 'lower_back'], ['glutes'], ['barbell', 'squat_rack'], 'Good_Morning',
    ['Bar on upper back, soft knees', 'Push hips back until torso ~parallel', 'Keep back flat'], ['Rounding the back', 'Going too heavy — start light']);
  E('deadlift', 'Conventional Deadlift', 'Hamstrings & Glutes', ['glutes', 'hamstrings', 'lower_back'], ['quads', 'traps', 'forearms', 'lats'], ['barbell'], 'Barbell_Deadlift',
    ['Bar over mid-foot, shins touch bar', 'Pull the slack out, chest up, lats tight', 'Push the floor away, lock out with glutes'], ['Rounded lower back', 'Bar drifting away from the body', 'Hyper-extending at lockout']);

  /* ---------------- SHOULDERS ---------------- */
  E('ohp_bb', 'Barbell Overhead Press', 'Shoulders', ['front_delts'], ['side_delts', 'triceps', 'traps'], ['barbell', 'squat_rack'], 'Barbell_Shoulder_Press',
    ['Squeeze glutes & brace', 'Bar path straight up, move head back then through', 'Lock out with the bar over mid-foot'], ['Leaning way back (turns into incline press)', 'Flared ribs / lower back arch']);
  E('db_shoulder_press', 'Dumbbell Shoulder Press', 'Shoulders', ['front_delts'], ['side_delts', 'triceps'], ['dumbbell', 'bench'], 'Dumbbell_Shoulder_Press',
    ['Bench upright (~80–90°)', 'Lower to ear level', 'Press up and slightly in'], ['Half reps', 'Arching off the bench']);
  E('machine_shoulder_press', 'Machine Shoulder Press', 'Shoulders', ['front_delts'], ['side_delts', 'triceps'], ['shoulder_press'], 'Machine_Shoulder_Military_Press',
    ['Handles at shoulder height at the start', 'Controlled lowering'], ['Seat too low']);
  E('arnold', 'Arnold Press', 'Shoulders', ['front_delts'], ['side_delts', 'triceps'], ['dumbbell', 'bench'], 'Arnold_Dumbbell_Press',
    ['Start palms facing you, rotate out as you press'], ['Rushing the rotation']);
  E('lateral_db', 'Dumbbell Lateral Raise', 'Shoulders', ['side_delts'], ['traps'], ['dumbbell'], 'Side_Lateral_Raise',
    ['Slight forward lean, soft elbows', 'Lead with the elbows, raise to shoulder height', 'Light weight, strict, 2s down'], ['Swinging with the hips', 'Shrugging (traps take over)', 'Going too heavy']);
  E('lateral_cable', 'Cable Lateral Raise', 'Shoulders', ['side_delts'], [], ['cable'], 'Cable_Seated_Lateral_Raise',
    ['Pulley at the lowest point, cable behind/across body', 'Constant tension — great for growth'], ['Raising above shoulder height with a shrug']);
  E('lateral_band', 'Band Lateral Raise', 'Shoulders', ['side_delts'], [], ['bands'], 'Lateral_Raise_-_With_Bands',
    ['Stand on band, raise to shoulder height'], ['Band too strong — no range of motion']);
  E('upright_row', 'Wide-Grip Upright Row', 'Shoulders', ['side_delts', 'traps'], ['front_delts'], ['dumbbell'], 'Standing_Dumbbell_Upright_Row',
    ['Pull elbows up & out, stop at lower-chest height'], ['Pulling to the chin (shoulder impingement)']);
  E('front_raise', 'Dumbbell Front Raise', 'Shoulders', ['front_delts'], [], ['dumbbell'], 'Front_Dumbbell_Raise',
    ['Only needed if you don\'t bench/press — front delts already work hard on push day'], ['Swinging']);
  E('face_pull', 'Face Pull', 'Shoulders', ['rear_delts'], ['upper_back', 'traps'], ['cable'], 'Face_Pull',
    ['Rope at face height, pull to forehead/ears', 'Elbows high, finish with thumbs pointing back', 'Great for shoulder health & posture'], ['Pulling to the chest with low elbows', 'Too heavy — leaning back']);
  E('reverse_pec_deck', 'Reverse Pec Deck', 'Shoulders', ['rear_delts'], ['upper_back'], ['pec_deck'], 'Reverse_Machine_Flyes',
    ['Face the pad, arms straight-ish', 'Sweep wide, think "pushing the handles apart"'], ['Squeezing shoulder blades too much (becomes rhomboids)']);
  E('rear_delt_db', 'Bent-Over Rear Delt Raise', 'Shoulders', ['rear_delts'], ['upper_back'], ['dumbbell'], 'Seated_Bent-Over_Rear_Delt_Raise',
    ['Chest on thighs or incline bench', 'Pinkies lead, raise out to the sides'], ['Using momentum']);
  E('cable_rear_fly', 'Cable Rear Delt Fly', 'Shoulders', ['rear_delts'], ['upper_back'], ['cable'], 'Cable_Rear_Delt_Fly',
    ['Cross the cables, pull out wide at shoulder height'], ['Bending the elbows into a row']);
  E('band_pull_apart', 'Band Pull-Apart', 'Shoulders', ['rear_delts'], ['upper_back'], ['bands'], 'Band_Pull_Apart',
    ['Arms straight at shoulder height, pull band to chest', 'Also a great warm-up'], ['Shrugging']);

  /* ---------------- TRAPS ---------------- */
  E('db_shrug', 'Dumbbell Shrug', 'Traps', ['traps'], ['forearms'], ['dumbbell'], 'Dumbbell_Shrug',
    ['Straight up toward the ears, pause 1s', 'No rolling'], ['Rolling the shoulders', 'Bending the elbows']);
  E('bb_shrug', 'Barbell Shrug', 'Traps', ['traps'], ['forearms'], ['barbell'], 'Barbell_Shrug',
    ['Shoulder-width grip, straight up'], ['Tiny range of motion with too much weight']);
  E('cable_shrug', 'Cable Shrug', 'Traps', ['traps'], [], ['cable'], 'Cable_Shrugs', ['Constant tension, hold at top'], ['Rolling']);
  E('farmers', "Farmer's Walk", 'Forearms', ['forearms', 'traps'], ['abs', 'obliques', 'glutes'], ['dumbbell'], 'Farmers_Walk',
    ['Heavy dumbbells, tall posture, short quick steps', '30–40 m or 30–45 s'], ['Leaning / letting shoulders round']);

  /* ---------------- BICEPS ---------------- */
  E('bb_curl', 'Barbell Curl', 'Biceps', ['biceps'], ['forearms'], ['barbell'], 'Barbell_Curl',
    ['Elbows at sides, curl up, squeeze', '2–3s lowering'], ['Swinging the hips', 'Elbows drifting forward']);
  E('ez_curl', 'EZ-Bar Curl', 'Biceps', ['biceps'], ['forearms'], ['ez_bar'], 'EZ-Bar_Curl', ['Easier on the wrists than a straight bar'], ['Cheating the top half']);
  E('db_curl', 'Dumbbell Curl', 'Biceps', ['biceps'], ['forearms'], ['dumbbell'], 'Dumbbell_Bicep_Curl',
    ['Rotate palms up (supinate) as you curl'], ['Swinging']);
  E('incline_curl', 'Incline Dumbbell Curl', 'Biceps', ['biceps'], [], ['dumbbell', 'bench'], 'Incline_Dumbbell_Curl',
    ['Bench at 45–60°, arms hang behind you', 'Huge stretch on the long head'], ['Bringing elbows forward']);
  E('preacher', 'Preacher Curl', 'Biceps', ['biceps'], [], ['preacher', 'ez_bar'], 'Preacher_Curl',
    ['Armpits snug on the pad', 'Lower all the way, control the bottom'], ['Bouncing out of the bottom (elbow risk)']);
  E('cable_curl', 'Cable Curl', 'Biceps', ['biceps'], ['forearms'], ['cable'], 'Standing_Biceps_Cable_Curl', ['Constant tension through the whole rep'], ['Leaning back']);
  E('concentration', 'Concentration Curl', 'Biceps', ['biceps'], [], ['dumbbell'], 'Concentration_Curls', ['Elbow braced on inner thigh, squeeze hard at top'], ['Rushing']);
  E('hammer', 'Hammer Curl', 'Biceps', ['biceps', 'forearms'], [], ['dumbbell'], 'Hammer_Curls',
    ['Neutral grip (thumbs up) — hits brachialis & brachioradialis', 'Makes arms look thicker'], ['Swinging']);
  E('rope_hammer', 'Rope Hammer Curl', 'Biceps', ['biceps', 'forearms'], [], ['cable'], 'Cable_Hammer_Curls_-_Rope_Attachment', ['Neutral grip on rope, elbows still'], ['Leaning back']);
  E('reverse_curl', 'Reverse-Grip Curl', 'Forearms', ['forearms'], ['biceps'], ['barbell'], 'Reverse_Barbell_Curl', ['Palms down, light weight, strict'], ['Wrists bending back']);

  /* ---------------- FOREARMS ---------------- */
  E('wrist_curl_db', 'Dumbbell Wrist Curl', 'Forearms', ['forearms'], [], ['dumbbell', 'bench'], 'Palms-Up_Dumbbell_Wrist_Curl_Over_A_Bench',
    ['Forearms on bench, palms up, curl the wrist', 'Then do palms-down (reverse) for balance'], ['Lifting the forearms off the bench']);
  E('wrist_curl_bb', 'Barbell Wrist Curl', 'Forearms', ['forearms'], [], ['barbell', 'bench'], 'Palms-Up_Barbell_Wrist_Curl_Over_A_Bench', ['Let bar roll to fingertips, curl up'], ['Too heavy']);
  E('cable_wrist_curl', 'Cable Wrist Curl', 'Forearms', ['forearms'], [], ['cable'], 'Cable_Wrist_Curl', ['Low pulley, forearms on thighs'], []);
  E('dead_hang', 'Dead Hang', 'Forearms', ['forearms'], ['lats'], ['pullup_bar'], 'One_Handed_Hang', ['Hang from bar as long as possible — grip + shoulder decompression'], []);

  /* ---------------- CORE ---------------- */
  E('plank', 'Plank', 'Core', ['abs'], ['obliques'], [], 'Plank', ['Elbows under shoulders, squeeze glutes, tuck pelvis', 'Quality > duration: 30–60s'], ['Hips sagging or piked', 'Holding breath']);
  E('side_plank', 'Side Plank', 'Core', ['obliques'], ['abs', 'glutes'], [], 'Side_Bridge', ['Straight line head to feet, hips high'], ['Hips dropping']);
  E('hanging_leg_raise', 'Hanging Leg / Knee Raise', 'Core', ['abs'], ['obliques', 'forearms'], ['pullup_bar'], 'Hanging_Leg_Raise',
    ['Curl the pelvis up (not just lift legs)', 'Start with bent knees, progress to straight legs', 'No swinging'], ['Swinging', 'Only hip flexors working (no pelvic tilt)']);
  E('lying_leg_raise', 'Lying Leg Raise', 'Core', ['abs'], [], [], 'Flat_Bench_Lying_Leg_Raise', ['Lower back pressed down', 'Lift hips slightly at the top'], ['Lower back arching off the floor']);
  E('cable_crunch', 'Cable Crunch', 'Core', ['abs'], ['obliques'], ['cable'], 'Cable_Crunch',
    ['Kneel, rope by your head', 'Curl ribs toward pelvis — round the spine', 'Hips stay still'], ['Sitting back with the hips', 'Pulling with the arms']);
  E('crunch', 'Crunch', 'Core', ['abs'], [], [], 'Crunches', ['Curl shoulders off floor, exhale hard', 'Hold a plate on chest to progress'], ['Yanking the neck']);
  E('ab_wheel', 'Ab Wheel Rollout', 'Core', ['abs'], ['lats', 'obliques'], ['ab_wheel'], 'Ab_Roller',
    ['From knees, roll out only as far as you keep a flat back', 'Pull back with the abs'], ['Lower back sagging']);
  E('barbell_rollout', 'Barbell Rollout', 'Core', ['abs'], ['lats', 'obliques'], ['barbell'], 'Barbell_Ab_Rollout_-_On_Knees', ['Same as ab wheel, use round plates'], ['Lower back sagging']);
  E('dead_bug', 'Dead Bug', 'Core', ['abs'], ['obliques'], [], 'Dead_Bug', ['Lower back glued to the floor', 'Extend opposite arm & leg slowly'], ['Back arching']);
  E('pallof', 'Pallof Press', 'Core', ['obliques', 'abs'], [], ['cable'], 'Pallof_Press',
    ['Stand side-on to the cable, press out and resist rotation', 'Works with a band too'], ['Letting the torso twist']);
  E('woodchop', 'Cable Woodchop', 'Core', ['obliques'], ['abs'], ['cable'], 'Standing_Cable_Wood_Chop', ['Rotate through the torso, arms straight'], ['Just using arms']);
  E('russian_twist', 'Russian Twist', 'Core', ['obliques'], ['abs'], [], 'Russian_Twist', ['Lean back, rotate shoulders side to side', 'Hold a plate to progress'], ['Rounded back, just moving the arms']);
  E('mountain_climbers', 'Mountain Climbers', 'Core', ['abs'], ['quads', 'front_delts'], [], 'Mountain_Climbers', ['Plank position, drive knees fast'], ['Hips bouncing high']);

  /* ---------------- QUADS ---------------- */
  E('back_squat', 'Barbell Back Squat', 'Quads', ['quads', 'glutes'], ['adductors', 'lower_back', 'hamstrings'], ['barbell', 'squat_rack'], 'Barbell_Squat',
    ['Bar on upper traps, brace your core (big breath)', 'Knees track over toes — it\'s fine if they go past them', 'Hit at least parallel, drive up through mid-foot'], ['Knees caving in', 'Heels lifting', 'Cutting depth', 'Rounding the lower back at the bottom']);
  E('goblet_squat', 'Goblet Squat', 'Quads', ['quads', 'glutes'], ['adductors', 'abs'], ['dumbbell'], 'Goblet_Squat',
    ['Hold a dumbbell/kettlebell at your chest', 'Sit down between your knees, chest up'], ['Leaning forward', 'Heels lifting']);
  E('hack_squat', 'Hack Squat (machine)', 'Quads', ['quads'], ['glutes', 'adductors'], ['hack_squat'], 'Hack_Squat',
    ['Feet shoulder-width, mid platform', 'Deep controlled reps'], ['Locking knees hard', 'Half reps']);
  E('smith_squat', 'Smith Machine Squat', 'Quads', ['quads', 'glutes'], ['adductors'], ['smith'], 'Smith_Machine_Squat',
    ['Feet slightly in front of the bar', 'Full depth'], ['Feet directly under the bar (knee stress)']);
  E('leg_press', 'Leg Press', 'Quads', ['quads', 'glutes'], ['adductors', 'hamstrings'], ['leg_press'], 'Leg_Press',
    ['Feet shoulder-width, lower until knees ~90° or deeper', 'Lower back stays on the pad'], ['Butt lifting off the seat at the bottom', 'Locking out knees aggressively', 'Ego loading with tiny range']);
  E('bulgarian', 'Bulgarian Split Squat', 'Quads', ['quads', 'glutes'], ['adductors', 'hamstrings'], ['dumbbell', 'bench'], 'Split_Squat_with_Dumbbells',
    ['Rear foot on bench, front foot ~2 steps ahead', 'Drop straight down, front knee travels forward', 'Lean forward slightly for more glutes'], ['Front foot too close', 'Wobbly — slow down']);
  E('lunges_db', 'Dumbbell Lunge', 'Quads', ['quads', 'glutes'], ['hamstrings', 'adductors'], ['dumbbell'], 'Dumbbell_Lunges', ['Long step, back knee to an inch from floor'], ['Short steps', 'Knee caving']);
  E('walking_lunge_bw', 'Bodyweight Walking Lunge', 'Quads', ['quads', 'glutes'], ['hamstrings'], [], 'Bodyweight_Walking_Lunge', ['Upright torso, controlled'], ['Rushing']);
  E('step_up', 'Dumbbell Step-Up', 'Quads', ['quads', 'glutes'], ['hamstrings'], ['dumbbell', 'bench'], 'Dumbbell_Step_Ups', ['Drive through the top foot, don\'t push off the back leg'], ['Bouncing off the bottom leg']);
  E('bw_squat', 'Bodyweight Squat', 'Quads', ['quads', 'glutes'], ['adductors'], [], 'Bodyweight_Squat', ['Warm-up / finisher; go slow (3s down) to make it harder'], ['Partial depth']);
  E('leg_ext', 'Leg Extension', 'Quads', ['quads'], [], ['leg_ext'], 'Leg_Extensions', ['Knee aligned with the machine pivot', 'Squeeze 1s at the top'], ['Swinging the weight']);

  /* ---------------- HAMSTRINGS & GLUTES ---------------- */
  E('rdl_bb', 'Romanian Deadlift', 'Hamstrings & Glutes', ['hamstrings', 'glutes'], ['lower_back', 'forearms'], ['barbell'], 'Romanian_Deadlift',
    ['Soft knees, push hips BACK', 'Bar slides down the thighs to mid-shin', 'Feel the hamstring stretch, flat back'], ['Squatting it down (knees bend too much)', 'Rounding the back', 'Bar drifting forward']);
  E('rdl_db', 'Dumbbell Romanian Deadlift', 'Hamstrings & Glutes', ['hamstrings', 'glutes'], ['lower_back', 'forearms'], ['dumbbell'], 'Stiff-Legged_Dumbbell_Deadlift',
    ['Same as barbell RDL, dumbbells close to legs'], ['Rounding the back']);
  E('leg_curl_lying', 'Lying Leg Curl', 'Hamstrings & Glutes', ['hamstrings'], ['calves'], ['leg_curl'], 'Lying_Leg_Curls', ['Hips pressed into pad', 'Slow negative'], ['Hips lifting']);
  E('leg_curl_seated', 'Seated Leg Curl', 'Hamstrings & Glutes', ['hamstrings'], [], ['leg_curl'], 'Seated_Leg_Curl', ['Lean forward slightly for a bigger stretch'], ['Partial reps']);
  E('ball_leg_curl', 'Stability Ball Leg Curl', 'Hamstrings & Glutes', ['hamstrings'], ['glutes'], ['stability_ball'], 'Ball_Leg_Curl', ['Hips up, roll the ball in with heels', 'No ball? Use sliders/towel on a smooth floor'], ['Hips dropping']);
  E('hip_thrust', 'Barbell Hip Thrust', 'Hamstrings & Glutes', ['glutes'], ['hamstrings'], ['barbell', 'bench'], 'Barbell_Hip_Thrust',
    ['Upper back on bench, bar on hips (use a pad)', 'Chin tucked, drive hips up, squeeze 1s', 'Shins vertical at the top'], ['Arching the lower back instead of using glutes', 'Feet too far / too close']);
  E('glute_bridge', 'Single-Leg Glute Bridge', 'Hamstrings & Glutes', ['glutes'], ['hamstrings'], [], 'Single_Leg_Glute_Bridge', ['Drive through the heel, squeeze at top'], ['Arching the back']);
  E('pull_through', 'Cable Pull-Through', 'Hamstrings & Glutes', ['glutes', 'hamstrings'], [], ['cable'], 'Pull_Through', ['Face away from low pulley, hinge and snap hips forward'], ['Squatting instead of hinging']);
  E('kb_swing', 'Kettlebell Swing', 'Hamstrings & Glutes', ['glutes', 'hamstrings'], ['lower_back', 'abs'], ['kettlebell'], 'One-Arm_Kettlebell_Swings', ['Hip hinge — hips drive, arms just guide', 'Bell floats to chest height'], ['Squatting the swing', 'Lifting with arms']);
  E('hip_abductor', 'Hip Abductor Machine', 'Hamstrings & Glutes', ['glutes'], [], ['hip_machine'], 'Thigh_Abductor', ['Push knees out, lean forward slightly for more glute'], ['Bouncing']);
  E('hip_adductor', 'Hip Adductor Machine', 'Hamstrings & Glutes', ['adductors'], [], ['hip_machine'], 'Thigh_Adductor', ['Squeeze knees together, slow return'], ['Too much range too soon']);
  E('monster_walk', 'Band Monster Walk', 'Hamstrings & Glutes', ['glutes'], [], ['bands'], 'Monster_Walk', ['Band around knees/ankles, half squat, step sideways'], ['Knees caving']);

  /* ---------------- CALVES ---------------- */
  E('calf_standing', 'Standing Calf Raise', 'Calves', ['calves'], [], ['calf_machine'], 'Standing_Calf_Raises', ['Full stretch at the bottom (pause 1–2s)', 'Rise as high as possible'], ['Bouncing', 'Tiny range']);
  E('calf_seated', 'Seated Calf Raise', 'Calves', ['calves'], [], ['calf_machine'], 'Seated_Calf_Raise', ['Targets the soleus (deeper calf muscle)'], ['Bouncing']);
  E('calf_leg_press', 'Leg Press Calf Raise', 'Calves', ['calves'], [], ['leg_press'], 'Calf_Press_On_The_Leg_Press_Machine', ['Balls of feet on the edge, knees straight-ish'], ['Letting the sled slip — keep safeties on']);
  E('calf_db', 'Dumbbell Calf Raise', 'Calves', ['calves'], [], ['dumbbell'], 'Standing_Dumbbell_Calf_Raise', ['Stand on a step/plate for range, one leg at a time is harder'], ['Rushing']);
  E('calf_bw', 'Single-Leg Calf Raise (bodyweight)', 'Calves', ['calves'], [], [], 'Standing_Dumbbell_Calf_Raise', ['On a step, full range, slow'], ['Rushing']);

  /* ---------------- CARDIO ---------------- */
  E('run', 'Running', 'Cardio', ['quads', 'calves', 'hamstrings'], ['glutes', 'abs'], [], 'Running_Treadmill',
    ['Short, quick steps (~170–180 / min)', 'Land under your hips, not out in front', 'Most runs easy enough to talk'], ['Running every run hard', 'Increasing distance >10% per week']);

  const BY_ID = Object.fromEntries(L.map((e) => [e.id, e]));
  const IMG_CDN = 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/';

  window.GP = window.GP || {};
  Object.assign(window.GP, {
    MUSCLES, EQUIPMENT, GROUPS, EXERCISES: L, EX: BY_ID,
    imgUrl: (ex, frame) => (ex && ex.img ? `${IMG_CDN}${ex.img}/${frame || 0}.jpg` : null),
  });
})();
