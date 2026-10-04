/* Stylised front + back body diagram. Each muscle region carries data-m="<muscle key>".
 * GP.exerciseMap(ex)            -> highlight an exercise's primary / secondary muscles
 * GP.heatMap({ muscle: 0..1 })   -> heat map (weekly volume)
 */
(function () {
  const e = (cx, cy, rx, ry, m, rot) =>
    `<ellipse data-m="${m}" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"${rot ? ` transform="rotate(${rot} ${cx} ${cy})"` : ''}/>`;
  const p = (d, m) => `<path data-m="${m}" d="${d}"/>`;

  function front(c) {
    // c = centre x
    return [
      `<circle class="mm-base" cx="${c}" cy="16" r="10"/>`,
      `<rect class="mm-base" x="${c - 4}" y="25" width="8" height="8" rx="2"/>`,
      p(`M${c - 5} 30 L${c - 17} 37 L${c - 6} 37 Z M${c + 5} 30 L${c + 17} 37 L${c + 6} 37 Z`, 'traps'),
      e(c - 17, 43, 6.5, 7, 'front_delts'), e(c + 17, 43, 6.5, 7, 'front_delts'),
      e(c - 23, 46, 3.5, 7, 'side_delts', 10), e(c + 23, 46, 3.5, 7, 'side_delts', -10),
      p(`M${c - 1} 38 L${c - 12} 38 Q${c - 18} 44 ${c - 15} 54 Q${c - 8} 60 ${c - 1} 56 Z`, 'chest'),
      p(`M${c + 1} 38 L${c + 12} 38 Q${c + 18} 44 ${c + 15} 54 Q${c + 8} 60 ${c + 1} 56 Z`, 'chest'),
      e(c - 23, 62, 4.5, 10, 'biceps', 8), e(c + 23, 62, 4.5, 10, 'biceps', -8),
      e(c - 27, 86, 4, 12, 'forearms', 10), e(c + 27, 86, 4, 12, 'forearms', -10),
      `<circle class="mm-base" cx="${c - 30}" cy="101" r="3.5"/><circle class="mm-base" cx="${c + 30}" cy="101" r="3.5"/>`,
      `<rect data-m="abs" x="${c - 7}" y="59" width="14" height="31" rx="4"/>`,
      `<path class="mm-line" d="M${c} 60 V89 M${c - 7} 67 H${c + 7} M${c - 7} 75 H${c + 7} M${c - 7} 82 H${c + 7}"/>`,
      p(`M${c - 9} 60 Q${c - 16} 66 ${c - 14} 86 L${c - 9} 90 Z`, 'obliques'),
      p(`M${c + 9} 60 Q${c + 16} 66 ${c + 14} 86 L${c + 9} 90 Z`, 'obliques'),
      p(`M${c - 14} 88 L${c + 14} 88 L${c + 15} 98 L${c - 15} 98 Z`, 'base'),
      e(c - 9, 118, 6.5, 20, 'quads', 3), e(c + 9, 118, 6.5, 20, 'quads', -3),
      e(c - 3, 108, 2.2, 10, 'adductors'), e(c + 3, 108, 2.2, 10, 'adductors'),
      `<circle class="mm-base" cx="${c - 9}" cy="141" r="3.5"/><circle class="mm-base" cx="${c + 9}" cy="141" r="3.5"/>`,
      e(c - 9, 160, 4, 14, 'calves'), e(c + 9, 160, 4, 14, 'calves'),
      `<ellipse class="mm-base" cx="${c - 10}" cy="178" rx="4.5" ry="2.5"/><ellipse class="mm-base" cx="${c + 10}" cy="178" rx="4.5" ry="2.5"/>`,
    ].join('');
  }

  function back(c) {
    return [
      `<circle class="mm-base" cx="${c}" cy="16" r="10"/>`,
      `<rect class="mm-base" x="${c - 4}" y="25" width="8" height="8" rx="2"/>`,
      p(`M${c - 14} 42 L${c - 8} 54 L${c - 1} 66 L${c - 1} 42 Z M${c + 14} 42 L${c + 8} 54 L${c + 1} 66 L${c + 1} 42 Z`, 'upper_back'),
      p(`M${c} 28 L${c - 18} 38 L${c - 6} 46 L${c} 64 L${c + 6} 46 L${c + 18} 38 Z`, 'traps'),
      e(c - 17, 43, 6.5, 7, 'rear_delts'), e(c + 17, 43, 6.5, 7, 'rear_delts'),
      e(c - 23, 46, 3.5, 7, 'side_delts', 10), e(c + 23, 46, 3.5, 7, 'side_delts', -10),
      p(`M${c - 15} 50 Q${c - 19} 62 ${c - 13} 80 L${c - 3} 84 L${c - 2} 68 L${c - 9} 55 Z`, 'lats'),
      p(`M${c + 15} 50 Q${c + 19} 62 ${c + 13} 80 L${c + 3} 84 L${c + 2} 68 L${c + 9} 55 Z`, 'lats'),
      e(c - 23, 62, 4.5, 10, 'triceps', 8), e(c + 23, 62, 4.5, 10, 'triceps', -8),
      e(c - 27, 86, 4, 12, 'forearms', 10), e(c + 27, 86, 4, 12, 'forearms', -10),
      `<circle class="mm-base" cx="${c - 30}" cy="101" r="3.5"/><circle class="mm-base" cx="${c + 30}" cy="101" r="3.5"/>`,
      `<rect data-m="lower_back" x="${c - 6}" y="70" width="12" height="20" rx="4"/>`,
      e(c - 7.5, 99, 7.5, 8.5, 'glutes'), e(c + 7.5, 99, 7.5, 8.5, 'glutes'),
      e(c - 9, 124, 6, 16, 'hamstrings', 3), e(c + 9, 124, 6, 16, 'hamstrings', -3),
      `<circle class="mm-base" cx="${c - 9}" cy="142" r="3.5"/><circle class="mm-base" cx="${c + 9}" cy="142" r="3.5"/>`,
      e(c - 9, 157, 5.5, 12, 'calves'), e(c + 9, 157, 5.5, 12, 'calves'),
      `<ellipse class="mm-base" cx="${c - 10}" cy="178" rx="4.5" ry="2.5"/><ellipse class="mm-base" cx="${c + 10}" cy="178" rx="4.5" ry="2.5"/>`,
    ].join('');
  }

  function muscleMap(opts) {
    opts = opts || {};
    const primary = new Set(opts.primary || []);
    const secondary = new Set(opts.secondary || []);
    let svg = `<svg class="musclemap" viewBox="0 0 200 190" role="img" aria-label="Muscle map">` +
      `<g>${front(50)}</g><g>${back(150)}</g>` +
      `<text x="50" y="189" class="mm-label">FRONT</text><text x="150" y="189" class="mm-label">BACK</text></svg>`;
    // Colour the regions
    svg = svg.replace(/data-m="(\w+)"/g, (all, m) => {
      if (m === 'base') return 'class="mm-base"';
      const cls = primary.has(m) ? 'mm-p' : secondary.has(m) ? 'mm-s' : 'mm-o';
      return `data-m="${m}" class="mm-r ${cls}"`;
    });
    return svg;
  }

  function heatMap(heat, label) {
    const tmp = document.createElement('div');
    tmp.innerHTML = muscleMap({});
    tmp.querySelectorAll('[data-m]').forEach((el) => {
      const m = el.getAttribute('data-m');
      const v = heat[m] || 0;
      const lvl = v <= 0 ? 0 : Math.min(5, Math.ceil(v * 5));
      el.setAttribute('class', `mm-r mm-h${lvl}`);
      const t = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      t.textContent = `${window.GP.MUSCLES[m]}${label ? ': ' + label(m) : ''}`;
      el.appendChild(t);
    });
    return tmp.innerHTML;
  }

  function exerciseMap(ex) {
    return muscleMap({ primary: ex.primary, secondary: ex.secondary });
  }

  Object.assign(window.GP, { exerciseMap, heatMap });
})();
