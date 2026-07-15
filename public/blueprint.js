/* ============================================================
   TONI SIIK — Blueprint variant · interactions
   ============================================================ */
(function () {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';

  /* ---------- dates ---------- */
  const yr = new Date().getFullYear();
  ['year', 'rev-year', 'stamp-year'].forEach((id) => { const e = document.getElementById(id); if (e) e.textContent = yr; });

  /* ---------- mode toggle (persisted) ---------- */
  const root = document.documentElement;
  const toggle = document.getElementById('modeToggle');
  const KEY = 'toni-blueprint-mode';
  function setMode(m) {
    root.setAttribute('data-mode', m);
    toggle.setAttribute('data-on', m);
    toggle.querySelectorAll('.opt').forEach((o) => o.classList.toggle('on', o.dataset.mode === m));
    try { localStorage.setItem(KEY, m); } catch (e) {}
  }
  try { const saved = localStorage.getItem(KEY); if (saved) setMode(saved); } catch (e) {}
  function flip() { setMode(root.getAttribute('data-mode') === 'ink' ? 'blueprint' : 'ink'); }
  toggle.addEventListener('click', flip);
  toggle.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });

  /* ---------- topbar scrolled ---------- */
  const topbar = document.getElementById('topbar');
  const onScroll = () => topbar.classList.toggle('scrolled', window.scrollY > 30);
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- scroll reveal (IO-independent) ---------- */
  const revs = Array.prototype.slice.call(document.querySelectorAll('.rev'));
  if (reduce) { revs.forEach((r) => r.classList.add('in')); }
  else {
    const check = () => {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      for (let i = revs.length - 1; i >= 0; i--) {
        if (revs[i].getBoundingClientRect().top < vh * 0.9) { revs[i].classList.add('in'); revs.splice(i, 1); }
      }
    };
    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    window.addEventListener('load', check);
    setTimeout(() => revs.forEach((r) => r.classList.add('in')), 4000);
    // frozen-timeline safety: if the animation clock isn't advancing, show content statically
    setTimeout(() => {
      const probe = document.querySelector('.rev.in');
      let frozen = true;
      if (probe && probe.getAnimations) {
        const a = probe.getAnimations();
        if (a.length && a[0].currentTime > 0) frozen = false;
      } else { frozen = false; }
      if (frozen) document.documentElement.classList.add('rev-static');
    }, 700);
  }

  /* ---------- counters ---------- */
  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const pad = parseInt(el.dataset.pad || '0', 10);
    const fmt = (v) => {
      let s = Math.round(v).toString();
      if (pad) s = s.padStart(pad, '0');
      else if (target >= 1000) s = Math.round(v).toLocaleString('en-US');
      return s + suffix;
    };
    if (reduce) { el.textContent = fmt(target); return; }
    const dur = 1300, start = performance.now();
    (function step(now) {
      const t = Math.min(1, (now - start) / dur);
      el.textContent = fmt(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(step);
    })(performance.now());
  }
  const counters = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
  const cCheck = () => {
    const vh = window.innerHeight || document.documentElement.clientHeight;
    for (let i = counters.length - 1; i >= 0; i--) {
      const r = counters[i].getBoundingClientRect();
      if (r.top < vh * 0.92 && r.bottom > 0) { animateCount(counters[i]); counters.splice(i, 1); }
    }
  };
  cCheck(); window.addEventListener('scroll', cCheck, { passive: true }); window.addEventListener('load', cCheck);

  /* helper: animate a path drawing itself */
  function drawPath(path, dur, delay) {
    const len = path.getTotalLength();
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;
    if (reduce) { path.style.strokeDashoffset = 0; return; }
    const start = performance.now() + (delay || 0);
    (function step(now) {
      if (now < start) { requestAnimationFrame(step); return; }
      const t = Math.min(1, (now - start) / dur);
      path.style.strokeDashoffset = len * (1 - (1 - Math.pow(1 - t, 2)));
      if (t < 1) requestAnimationFrame(step);
    })(performance.now());
  }

  /* ============================================================
     FIG.1 — THE DECISION LOOP (hand-drawn)
     ============================================================ */
  (function loop() {
    const svg = document.getElementById('loop-svg');
    if (!svg) return;
    const cx = 200, cy = 200, R = 120;
    const steps = ['Detect', 'Measure', 'Explain', 'Intervene', 'Standardize'];
    const n = steps.length;
    const ang = (i) => (-90 + i * (360 / n)) * Math.PI / 180;
    const g = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };

    const wrap = g('g', { filter: 'url(#pencil)' });
    svg.appendChild(wrap);

    // construction circle (dashed)
    wrap.appendChild(g('circle', { cx, cy, r: R, fill: 'none', stroke: 'var(--ink-faint)', 'stroke-width': 1, 'stroke-dasharray': '2 7' }));

    // flow arcs with arrowheads between nodes
    const arcs = [];
    for (let i = 0; i < n; i++) {
      const a0 = ang(i) + 0.34, a1 = ang(i + 1) - 0.34;
      const x0 = cx + R * Math.cos(a0), y0 = cy + R * Math.sin(a0);
      const x1 = cx + R * Math.cos(a1), y1 = cy + R * Math.sin(a1);
      const p = g('path', { d: `M ${x0} ${y0} A ${R} ${R} 0 0 1 ${x1} ${y1}`, fill: 'none', stroke: 'var(--accent)', 'stroke-width': 2, 'stroke-linecap': 'round' });
      wrap.appendChild(p); arcs.push(p);
      // arrowhead at a1
      const ah = a1 + Math.PI / 2; // tangent
      const len = 9;
      const ax = x1, ay = y1;
      wrap.appendChild(g('path', {
        d: `M ${ax - len * Math.cos(ah - 0.5)} ${ay - len * Math.sin(ah - 0.5)} L ${ax} ${ay} L ${ax - len * Math.cos(ah + 0.5)} ${ay - len * Math.sin(ah + 0.5)}`,
        fill: 'none', stroke: 'var(--accent)', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'
      }));
    }

    // nodes + labels
    steps.forEach((label, i) => {
      const a = ang(i);
      const x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
      wrap.appendChild(g('circle', { cx: x, cy: y, r: 9, fill: 'var(--paper)', stroke: 'var(--ink)', 'stroke-width': 2 }));
      wrap.appendChild(g('circle', { cx: x, cy: y, r: 3, fill: 'var(--ink)' }));
      const lr = R + 30;
      const lx = cx + lr * Math.cos(a), ly = cy + lr * Math.sin(a);
      const t = g('text', { x: lx, y: ly, fill: 'var(--ink)', 'font-family': 'Rajdhani, sans-serif', 'font-weight': 600, 'letter-spacing': 0.6, 'font-size': 17, 'dominant-baseline': 'middle' });
      const cv = Math.cos(a);
      t.setAttribute('text-anchor', Math.abs(cv) < 0.3 ? 'middle' : (cv > 0 ? 'start' : 'end'));
      // numbered like a drawing
      t.textContent = (i + 1) + '. ' + label.toUpperCase();
      svg.appendChild(t);
    });

    // center stamp
    const ct = g('text', { x: cx, y: cy - 6, fill: 'var(--ink-soft)', 'font-family': 'Rajdhani, sans-serif', 'font-weight': 600, 'letter-spacing': 1, 'font-size': 14, 'text-anchor': 'middle' });
    ct.textContent = 'CLOSED';
    const ct2 = g('text', { x: cx, y: cy + 12, fill: 'var(--ink-soft)', 'font-family': 'Rajdhani, sans-serif', 'font-weight': 600, 'letter-spacing': 1, 'font-size': 14, 'text-anchor': 'middle' });
    ct2.textContent = 'LOOP';
    svg.appendChild(ct); svg.appendChild(ct2);

    // draw-in on first view
    let drawn = false;
    const start = () => {
      if (drawn) return; drawn = true;
      arcs.forEach((p, i) => drawPath(p, 600, i * 180));
    };
    const vCheck = () => {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const r = svg.getBoundingClientRect();
      if (r.top < vh * 0.95 && r.bottom > 0) { start(); window.removeEventListener('scroll', vCheck); }
    };
    vCheck(); window.addEventListener('scroll', vCheck, { passive: true }); window.addEventListener('load', vCheck);
  })();

  /* ============================================================
     SHEET 06 — surveyed elevation profile (hand-drawn)
     ============================================================ */
  (function route() {
    const svg = document.getElementById('route-svg');
    if (!svg) return;
    const W = 1000, H = 210, base = 188;
    const g = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };

    // baseline + station ticks (datum line)
    const grid = g('g', { filter: 'url(#pencil)' });
    svg.appendChild(grid);
    grid.appendChild(g('line', { x1: 0, y1: base, x2: W, y2: base, stroke: 'var(--ink-faint)', 'stroke-width': 1.5 }));
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * W;
      grid.appendChild(g('line', { x1: x, y1: base, x2: x, y2: base + 8, stroke: 'var(--ink-faint)', 'stroke-width': 1.2 }));
    }

    // elevation points
    const pts = [];
    const seg = 56;
    let prev = 120;
    for (let i = 0; i <= seg; i++) {
      const x = (i / seg) * W;
      const climb = Math.sin(i / 6.5) * 40 + Math.sin(i / 2.2) * 13 + Math.cos(i / 10) * 22;
      let y = 120 - climb;
      y = Math.max(34, Math.min(170, y * 0.6 + prev * 0.4));
      prev = y; pts.push([x, y]);
    }
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      const mx = (x0 + x1) / 2;
      d += ` Q ${x0} ${y0} ${mx} ${(y0 + y1) / 2}`;
    }
    d += ` L ${W} ${pts[pts.length - 1][1]}`;

    const wrap = g('g', { filter: 'url(#pencil)' });
    svg.appendChild(wrap);

    // hatching under the profile (cross-section fill)
    const hatch = g('g', { stroke: 'var(--ink-faint)', 'stroke-width': 1, opacity: 0.5 });
    // build clip from area
    const clipId = 'routeclip';
    const defs = g('defs', {});
    const clip = g('clipPath', { id: clipId });
    clip.appendChild(g('path', { d: `${d} L ${W} ${base} L 0 ${base} Z` }));
    defs.appendChild(clip); svg.appendChild(defs);
    hatch.setAttribute('clip-path', `url(#${clipId})`);
    for (let x = -H; x < W; x += 13) {
      hatch.appendChild(g('line', { x1: x, y1: base, x2: x + H, y2: base - H, stroke: 'var(--ink-faint)', 'stroke-width': 1 }));
    }
    wrap.appendChild(hatch);

    // the profile line
    const line = g('path', { d, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 2.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    wrap.appendChild(line);

    // dimension annotations (drawn)
    const annot = g('g', {});
    svg.appendChild(annot);
    // distance dimension under baseline
    annot.appendChild(g('line', { x1: 4, y1: base + 18, x2: W - 4, y2: base + 18, stroke: 'var(--ink-faint)', 'stroke-width': 1.2, filter: 'url(#pencil)' }));
    const dt = g('text', { x: W / 2, y: base + 14, fill: 'var(--ink-soft)', 'font-family': 'Rajdhani, sans-serif', 'font-weight': 600, 'letter-spacing': 1.5, 'font-size': 14, 'text-anchor': 'middle' });
    dt.textContent = '◄————  DISTANCE  ————►';
    annot.appendChild(dt);

    // moving pace dot
    const halo = g('circle', { r: 11, fill: 'var(--accent)', opacity: 0.18 });
    const dot = g('circle', { r: 5, fill: 'var(--accent)', stroke: 'var(--paper)', 'stroke-width': 1.5 });
    svg.appendChild(halo); svg.appendChild(dot);

    function place(t) {
      const len = line.getTotalLength();
      const p = line.getPointAtLength(len * t);
      dot.setAttribute('cx', p.x); dot.setAttribute('cy', p.y);
      halo.setAttribute('cx', p.x); halo.setAttribute('cy', p.y);
    }
    place(0);

    let started = false;
    function run() {
      if (started) return; started = true;
      if (reduce) { line.style.strokeDashoffset = 0; place(1); return; }
      const len = line.getTotalLength();
      line.style.strokeDasharray = len; line.style.strokeDashoffset = len;
      const dur = 2000, start = performance.now();
      (function step(now) {
        const t = Math.min(1, (now - start) / dur);
        const e = 1 - Math.pow(1 - t, 2);
        line.style.strokeDashoffset = len * (1 - e);
        place(e);
        if (t < 1) requestAnimationFrame(step); else loop();
      })(performance.now());
    }
    function loop() {
      const dur = 6500, s = performance.now();
      (function step(now) { place(((now - s) % dur) / dur); requestAnimationFrame(step); })(performance.now());
    }
    const vCheck = () => {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const r = svg.getBoundingClientRect();
      if (r.top < vh * 0.9 && r.bottom > 0) { run(); window.removeEventListener('scroll', vCheck); }
    };
    vCheck(); window.addEventListener('scroll', vCheck, { passive: true }); window.addEventListener('load', vCheck);
  })();

})();

/* ============================================================
   EVOLVING TECHNICAL DRAWING — scroll-linked background
   One engineering drawing (a cast flanged body: side section +
   front flange view, on a titled sheet) that constructs itself as
   you scroll. Scroll position 0→1 = drawing completion, so it inks
   in as you descend and un-draws as you go back up:
     frame & ruler → centre/construction lines → part outlines ink
     themselves → bores → bolt holes → section hatching → dimensions
     → section callout → notes → title-block stamp.
   Stroke/fill use CSS vars (set via inline style so var() resolves),
   so it flips Blueprint⇄Ink for free. rAF-coalesced; static &
   complete under reduced-motion. Same drawing on every page.
   ============================================================ */
(function evolvingDrawing() {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // seeded RNG → identical hand-plotted jitter every load
  let _s = 20260715 >>> 0;
  const rnd = () => {
    _s = (_s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const j = (v, a) => v + (rnd() - 0.5) * (a === undefined ? 1.4 : a);  // vertex jitter

  // ---- host + svg (viewBox is a fixed sheet; scales to any viewport) ----
  const host = document.createElement('div');
  host.id = 'draft-bg';
  host.setAttribute('aria-hidden', 'true');
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 1200 800');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  host.appendChild(svg);
  document.body.insertBefore(host, document.body.firstChild);

  const mk = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
  const sl = (e, c) => { e.style.stroke = c; return e; };   // stroke via CSS var
  const sf = (e, c) => { e.style.fill = c; return e; };     // fill via CSS var

  const V = { line: 'var(--ink-soft)', faint: 'var(--ink-faint)', edge: 'var(--edge)', acc: 'var(--accent)' };

  const parts = [];   // { node, s, e, kind: 'draw' | 'fade' }
  function reg(node, s, e, kind) { parts.push({ node, s, e, kind: kind || 'draw' }); svg.appendChild(node); return node; }

  // ---- jittered primitives (stroke colour applied via style) ----
  function line(x1, y1, x2, y2, c, w) {
    return sl(mk('line', { x1: j(x1), y1: j(y1), x2: j(x2), y2: j(y2), 'stroke-width': w || 1.4, 'stroke-linecap': 'round', fill: 'none' }), c || V.line);
  }
  function poly(pts, c, w, close) {
    let d = 'M ' + j(pts[0][0]) + ' ' + j(pts[0][1]);
    for (let i = 1; i < pts.length; i++) d += ' L ' + j(pts[i][0]) + ' ' + j(pts[i][1]);
    if (close) d += ' Z';
    return sl(mk('path', { d, 'stroke-width': w || 1.6, fill: 'none', 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }), c || V.line);
  }
  function circle(cx, cy, r, c, w) {
    return sl(mk('circle', { cx, cy, r, 'stroke-width': w || 1.6, fill: 'none' }), c || V.line);
  }
  function text(x, y, s, size, anchor, c) {
    const t = mk('text', { x, y, 'font-family': 'Rajdhani, sans-serif', 'font-weight': 600, 'font-size': size || 15, 'letter-spacing': 0.6, 'text-anchor': anchor || 'start' });
    t.textContent = s; return sf(t, c || V.faint);
  }
  // dimension line with end arrows + a centred value label
  function dim(x1, y1, x2, y2, label, c) {
    const g = mk('g', {}); const col = c || V.faint;
    g.appendChild(sl(mk('line', { x1, y1, x2, y2, 'stroke-width': 1 }), col));
    const ang = Math.atan2(y2 - y1, x2 - x1), k = 7;
    [[x1, y1, ang], [x2, y2, ang + Math.PI]].forEach(([px, py, a]) => {
      g.appendChild(sl(mk('path', { d: `M ${px + k * Math.cos(a - 0.4)} ${py + k * Math.sin(a - 0.4)} L ${px} ${py} L ${px + k * Math.cos(a + 0.4)} ${py + k * Math.sin(a + 0.4)}`, 'stroke-width': 1, fill: 'none', 'stroke-linejoin': 'round' }), col));
    });
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, horiz = Math.abs(x2 - x1) >= Math.abs(y2 - y1);
    const lab = text(horiz ? mx : mx - 6, horiz ? my - 6 : my, label, 14, 'middle', col);
    if (!horiz) lab.setAttribute('transform', `rotate(-90 ${mx - 6} ${my})`);
    g.appendChild(lab);
    return g;
  }

  /* ================= SHEET FRAME ================= */
  reg(sl(mk('rect', { x: 30, y: 30, width: 1140, height: 740, fill: 'none', 'stroke-width': 2 }), V.edge), 0.00, 0.05, 'draw');
  reg(sl(mk('rect', { x: 46, y: 46, width: 1108, height: 708, fill: 'none', 'stroke-width': 1 }), V.faint), 0.03, 0.09, 'draw');

  // zone ruler ticks + letters/numbers along the inner frame
  const ruler = mk('g', {});
  const cols = 8, rows = 5;
  for (let i = 1; i < cols; i++) { const x = 46 + 1108 * i / cols; ruler.appendChild(sl(mk('line', { x1: x, y1: 46, x2: x, y2: 57, 'stroke-width': 1 }), V.faint)); ruler.appendChild(sl(mk('line', { x1: x, y1: 743, x2: x, y2: 754, 'stroke-width': 1 }), V.faint)); }
  for (let i = 1; i < rows; i++) { const y = 46 + 708 * i / rows; ruler.appendChild(sl(mk('line', { x1: 46, y1: y, x2: 57, y2: y, 'stroke-width': 1 }), V.faint)); ruler.appendChild(sl(mk('line', { x1: 1143, y1: y, x2: 1154, y2: y, 'stroke-width': 1 }), V.faint)); }
  ['A', 'B', 'C', 'D', 'E'].forEach((L, i) => ruler.appendChild(text(38, 46 + 708 * (i + 0.5) / rows + 5, L, 13, 'middle', V.faint)));
  ['1', '2', '3', '4', '5', '6', '7', '8'].forEach((L, i) => ruler.appendChild(text(46 + 1108 * (i + 0.5) / cols, 43, L, 13, 'middle', V.faint)));
  reg(ruler, 0.05, 0.14, 'fade');

  /* ================= CONSTRUCTION / CENTRE LINES ================= */
  const CLY = 400;
  reg(sl(mk('line', { x1: 120, y1: CLY, x2: 1010, y2: CLY, 'stroke-width': 1, 'stroke-dasharray': '16 4 3 4' }), V.acc), 0.08, 0.17, 'fade');       // main horizontal datum
  reg(sl(mk('line', { x1: 865, y1: 235, x2: 865, y2: 565, 'stroke-width': 1, 'stroke-dasharray': '16 4 3 4' }), V.acc), 0.10, 0.19, 'fade');       // front-view vertical CL
  reg(sl(mk('circle', { cx: 865, cy: CLY, r: 110, fill: 'none', 'stroke-width': 1, 'stroke-dasharray': '7 6' }), V.faint), 0.13, 0.22, 'fade');    // bolt-circle construction

  /* ================= SIDE SECTION VIEW (stepped flanged body) ================= */
  const bodyOutline = [
    [150, 300], [185, 300], [185, 330], [525, 330], [525, 300], [560, 300],
    [560, 500], [525, 500], [525, 470], [185, 470], [185, 500], [150, 500]
  ];
  reg(poly(bodyOutline, V.line, 1.8, true), 0.15, 0.42, 'draw');
  // bore (hidden lines, dashed)
  reg(sl(mk('line', { x1: 150, y1: 372, x2: 560, y2: 372, 'stroke-width': 1.1, 'stroke-dasharray': '9 5' }), V.faint), 0.30, 0.40, 'fade');
  reg(sl(mk('line', { x1: 150, y1: 428, x2: 560, y2: 428, 'stroke-width': 1.1, 'stroke-dasharray': '9 5' }), V.faint), 0.32, 0.42, 'fade');

  // section hatching (clipped to the body outline)
  const defs = mk('defs', {}); svg.appendChild(defs);
  const clip = mk('clipPath', { id: 'tsSecClip' });
  clip.appendChild(mk('path', { d: (() => { let d = `M ${bodyOutline[0][0]} ${bodyOutline[0][1]}`; for (let i = 1; i < bodyOutline.length; i++) d += ` L ${bodyOutline[i][0]} ${bodyOutline[i][1]}`; return d + ' Z'; })(), fill: '#000' }));
  defs.appendChild(clip);
  const hatch = mk('g', { 'clip-path': 'url(#tsSecClip)' });
  for (let x = 60; x < 620; x += 13) hatch.appendChild(sl(mk('line', { x1: x, y1: 505, x2: x + 220, y2: 295, 'stroke-width': 0.9 }), V.faint));
  reg(hatch, 0.50, 0.66, 'fade');

  /* ================= FRONT FLANGE VIEW (concentric) ================= */
  reg(circle(865, CLY, 150, V.line, 1.8), 0.22, 0.40, 'draw');   // flange OD
  reg(circle(865, CLY, 42, V.line, 1.6), 0.32, 0.46, 'draw');    // bore
  reg(line(820, CLY, 910, CLY, V.faint, 1), 0.36, 0.44, 'draw'); // centre cross
  reg(line(865, 355, 865, 445, V.faint, 1), 0.36, 0.44, 'draw');
  const holes = mk('g', {});
  for (let i = 0; i < 6; i++) { const a = (-90 + i * 60) * Math.PI / 180; holes.appendChild(sl(mk('circle', { cx: 865 + 110 * Math.cos(a), cy: CLY + 110 * Math.sin(a), r: 15, fill: 'none', 'stroke-width': 1.5 }), V.line)); }
  reg(holes, 0.40, 0.55, 'draw');

  /* ================= DIMENSIONS ================= */
  reg(dim(150, 545, 560, 545, 'L 410', V.faint), 0.58, 0.70, 'draw');         // overall length
  reg(dim(112, 300, 112, 500, '200', V.faint), 0.62, 0.72, 'draw');           // height
  // Ø leader on the front view
  const od = mk('g', {});
  od.appendChild(sl(mk('line', { x1: 865, y1: CLY, x2: 1010, y2: 262, 'stroke-width': 1 }), V.faint));
  od.appendChild(text(1014, 258, 'Ø300', 15, 'start', V.faint));
  reg(od, 0.70, 0.80, 'draw');
  const bolt = mk('g', {});
  bolt.appendChild(sl(mk('line', { x1: 865 + 110 * Math.cos(-Math.PI / 6), y1: CLY + 110 * Math.sin(-Math.PI / 6), x2: 1030, y2: 470, 'stroke-width': 1 }), V.faint));
  bolt.appendChild(text(1034, 474, '6× Ø30', 15, 'start', V.faint));
  reg(bolt, 0.74, 0.84, 'draw');

  /* ================= SECTION CALLOUT "A" ================= */
  const call = mk('g', {});
  call.appendChild(sl(mk('line', { x1: 560, y1: 330, x2: 632, y2: 300, 'stroke-width': 1 }), V.acc));
  call.appendChild(sl(mk('circle', { cx: 648, cy: 296, r: 17, fill: 'none', 'stroke-width': 1.6 }), V.acc));
  call.appendChild(sf(text(648, 302, 'A', 18, 'middle'), V.acc));
  reg(call, 0.80, 0.90, 'draw');

  /* ================= NOTES COLUMN ================= */
  const notes = mk('g', {});
  notes.appendChild(sf(text(732, 118, 'NOTES:', 15, 'start'), V.faint));
  for (let i = 0; i < 3; i++) { const y = 140 + i * 20; notes.appendChild(sl(mk('line', { x1: 732, y1: y, x2: 732 + [150, 120, 168][i], y2: y, 'stroke-width': 1, 'stroke-dasharray': '3 5' }), V.faint)); }
  reg(notes, 0.82, 0.92, 'fade');

  /* ================= TITLE BLOCK (bottom-right stamp) ================= */
  const tb = mk('g', {});
  const box = (x, y, w, h) => sl(mk('rect', { x, y, width: w, height: h, fill: 'none', 'stroke-width': 1.2 }), V.edge);
  tb.appendChild(box(852, 650, 302, 104));
  tb.appendChild(sl(mk('line', { x1: 852, y1: 710, x2: 1154, y2: 710, 'stroke-width': 1 }), V.edge));
  tb.appendChild(sl(mk('line', { x1: 1060, y1: 650, x2: 1060, y2: 710, 'stroke-width': 1 }), V.edge));
  tb.appendChild(sl(mk('line', { x1: 952, y1: 710, x2: 952, y2: 754, 'stroke-width': 1 }), V.edge));
  tb.appendChild(sl(mk('line', { x1: 1052, y1: 710, x2: 1052, y2: 754, 'stroke-width': 1 }), V.edge));
  const cell = (x, y, k, v, vs) => { tb.appendChild(sf(text(x, y, k, 10, 'start'), V.faint)); tb.appendChild(sf(text(x, y + 17, v, vs || 15, 'start'), V.line)); };
  cell(862, 672, 'TITLE', 'CAST FLANGED BODY', 15);
  cell(1070, 668, 'DWG NO', 'TS-2026', 13);
  cell(1070, 694, 'SCALE', 'NTS', 13);
  cell(862, 728, 'DRAWN', 'T. SIIK', 13);
  cell(962, 728, 'DATE', '2026', 13);
  cell(1062, 728, 'SHEET', '01', 13);
  reg(tb, 0.88, 1.00, 'fade');

  /* ================= REVEAL ENGINE ================= */
  parts.forEach((p) => {
    if (p.kind === 'draw') {
      let len = 1;
      if (p.node.getTotalLength) { try { len = p.node.getTotalLength() || 1; } catch (e) { len = 1; } }
      // groups (dim/leaders) have no length → measure isn't available; treat as fade fallback
      if (!p.node.getTotalLength || p.node.tagName === 'g') { p.kind = 'fade'; p.node.style.opacity = 0; return; }
      p.len = len;
      p.node.style.strokeDasharray = len;
      p.node.style.strokeDashoffset = len;
    } else {
      p.node.style.opacity = 0;
    }
  });

  function apply(prog) {
    for (const p of parts) {
      let ep = (prog - p.s) / (p.e - p.s);
      ep = ep < 0 ? 0 : ep > 1 ? 1 : ep;
      if (p.kind === 'draw') p.node.style.strokeDashoffset = p.len * (1 - ep);
      else p.node.style.opacity = ep;
    }
  }

  function progress() {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    if (max <= 4) return 1;   // unscrollable page → show it complete
    const sy = window.scrollY || window.pageYOffset || 0;
    return Math.min(1, Math.max(0, sy / max));
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { apply(progress()); ticking = false; });
  }

  if (reduce) {
    apply(1);
  } else {
    apply(progress());
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    window.addEventListener('load', onScroll);
  }
})();
