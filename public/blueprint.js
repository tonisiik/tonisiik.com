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
   ANIMATED DRAFT-SHEET BACKGROUND — parallax construction marks
   A fixed canvas of faint hand-drawn technical marks (targets,
   construction circles, arcs, rosettes, corner ticks) that drift
   at varying parallax depths as you scroll, plus a subtle parallax
   on the CSS graph grid. Theme-aware (re-reads vars on mode flip),
   perf-light (rAF-coalesced), and static under reduced-motion.
   ============================================================ */
(function draftBackground() {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  const cv = document.createElement('canvas');
  cv.id = 'draft-bg';
  cv.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(cv, document.body.firstChild);
  const ctx = cv.getContext('2d');
  if (!ctx) return;

  let W = 0, H = 0, dpr = 1, fieldH = 0;
  let marks = [];
  const col = { faint: '#6f93b6', accent: '#f2b35e' };

  function readColors() {
    const cs = getComputedStyle(root);
    const f = cs.getPropertyValue('--ink-faint').trim();
    const a = cs.getPropertyValue('--accent').trim();
    if (f) col.faint = f;
    if (a) col.accent = a;
  }

  // seeded RNG → stable mark layout across resizes / redraws
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const TYPES = ['target', 'circle', 'arc', 'rosette', 'corner'];

  function build() {
    const rnd = mulberry32(20260713);
    const n = Math.min(40, Math.max(12, Math.round((W * fieldH) / 105000)));
    marks = [];
    for (let i = 0; i < n; i++) {
      marks.push({
        x: rnd() * W,
        baseY: rnd() * fieldH,
        depth: 0.10 + rnd() * 0.44,       // parallax strength (near/far)
        size: 16 + rnd() * 42,
        rot: rnd() * Math.PI,
        alpha: 0.09 + rnd() * 0.12,
        accent: rnd() < 0.12,             // occasional accent-colored mark
        type: TYPES[(rnd() * TYPES.length) | 0]
      });
    }
  }

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth;
    H = window.innerHeight;
    fieldH = H * 1.7 + 220;               // virtual band that recycles infinitely
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    cv.style.width = W + 'px';
    cv.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    readColors();
    build();
    draw();
  }

  /* ---- hand-drawn mark primitives (thin strokes, drawn at origin) ---- */
  function markTarget(r) {                // ⊕ registration target
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
    const t = r * 1.5;
    ctx.beginPath();
    ctx.moveTo(-t, 0); ctx.lineTo(t, 0);
    ctx.moveTo(0, -t); ctx.lineTo(0, t);
    ctx.stroke();
  }
  function markCircle(r) {                // ⌀ dashed construction circle
    ctx.setLineDash([2, 6]);
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(0, 0, 1.4, 0, Math.PI * 2);
    ctx.fillStyle = ctx.strokeStyle; ctx.fill();
  }
  function markArc(r) {                   // radius sweep with an arrow tick
    const a0 = -0.25, a1 = Math.PI * 0.85;
    ctx.beginPath(); ctx.arc(0, 0, r, a0, a1); ctx.stroke();
    const ex = Math.cos(a1) * r, ey = Math.sin(a1) * r;
    const tang = a1 + Math.PI / 2, k = 6;
    ctx.beginPath();
    ctx.moveTo(ex - k * Math.cos(tang - 0.5), ey - k * Math.sin(tang - 0.5));
    ctx.lineTo(ex, ey);
    ctx.lineTo(ex - k * Math.cos(tang + 0.5), ey - k * Math.sin(tang + 0.5));
    ctx.stroke();
  }
  function markRosette(r) {               // protractor-style tick ring
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r * 0.72, Math.sin(a) * r * 0.72);
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
  }
  function markCorner(r) {                // corner reg-mark + short dimension line
    ctx.beginPath();
    ctx.moveTo(-r, -r + r * 0.55); ctx.lineTo(-r, -r); ctx.lineTo(-r + r * 0.55, -r);
    ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-r, r); ctx.lineTo(r, r); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-r, r - 3); ctx.lineTo(-r, r + 3);
    ctx.moveTo(r, r - 3); ctx.lineTo(r, r + 3);
    ctx.stroke();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const sy = window.scrollY || window.pageYOffset || 0;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const m of marks) {
      let y = (m.baseY - sy * m.depth) % fieldH;
      if (y < 0) y += fieldH;
      y -= 110;                           // margin so marks recycle off-screen
      if (y < -90 || y > H + 90) continue;
      const r = m.size * 0.5;
      ctx.save();
      ctx.translate(m.x, y);
      ctx.rotate(m.rot);
      ctx.globalAlpha = m.alpha;
      ctx.strokeStyle = m.accent ? col.accent : col.faint;
      ctx.lineWidth = 1;
      switch (m.type) {
        case 'target': markTarget(r); break;
        case 'circle': markCircle(r); break;
        case 'arc': markArc(r); break;
        case 'rosette': markRosette(r); break;
        case 'corner': markCorner(r); break;
      }
      ctx.restore();
    }
  }

  /* ---- CSS graph-grid parallax (minor drifts faster than major) ---- */
  function gridShift() {
    const sy = window.scrollY || window.pageYOffset || 0;
    root.style.setProperty('--gsy-min', (-sy * 0.12) + 'px');
    root.style.setProperty('--gsy-maj', (-sy * 0.05) + 'px');
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { gridShift(); draw(); ticking = false; });
  }

  resize();
  gridShift();
  if (!reduce) window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', resize);
  // theme toggle → re-read colors + repaint
  new MutationObserver(() => { readColors(); draw(); })
    .observe(root, { attributes: true, attributeFilter: ['data-mode'] });
})();
