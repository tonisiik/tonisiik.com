/* ============================================================
   TONI SIIK — Quiet Blueprint · interactions
   No mode toggle, no scroll-linked background drawing —
   just dates, reveal-on-scroll, counters, and the running
   elevation profile.

   Re-runs on every navigation via `astro:page-load` (fired by
   Astro's ClientRouter on the initial load AND every subsequent
   client-side transition) so scroll-reveal/counters/topbar state
   work correctly after a soft page swap, not just a hard reload.
   ============================================================ */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';

  function init() {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- dates ---------- */
    const yr = new Date().getFullYear();
    ['year', 'rev-year', 'stamp-year'].forEach((id) => { const e = document.getElementById(id); if (e) e.textContent = yr; });

    /* ---------- topbar scrolled ---------- */
    const topbar = document.getElementById('topbar');
    if (topbar) {
      const onScroll = () => topbar.classList.toggle('scrolled', window.scrollY > 30);
      onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
    }

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
    cCheck(); window.addEventListener('scroll', cCheck, { passive: true });

    /* ============================================================
       SHEET 06 — surveyed elevation profile (no-ops if absent)
       ============================================================ */
    (function route() {
      const svg = document.getElementById('route-svg');
      if (!svg) return;
      const W = 1000, H = 210, base = 188;
      const g = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };

      const grid = g('g', {});
      svg.appendChild(grid);
      grid.appendChild(g('line', { x1: 0, y1: base, x2: W, y2: base, stroke: 'var(--ink-faint)', 'stroke-width': 1 }));
      for (let i = 0; i <= 10; i++) {
        const x = (i / 10) * W;
        grid.appendChild(g('line', { x1: x, y1: base, x2: x, y2: base + 8, stroke: 'var(--ink-faint)', 'stroke-width': 1 }));
      }

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

      const wrap = g('g', {});
      svg.appendChild(wrap);

      const hatch = g('g', { stroke: 'var(--ink-faint)', 'stroke-width': 1, opacity: 0.35 });
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

      const line = g('path', { d, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
      wrap.appendChild(line);

      const annot = g('g', {});
      svg.appendChild(annot);
      annot.appendChild(g('line', { x1: 4, y1: base + 18, x2: W - 4, y2: base + 18, stroke: 'var(--ink-faint)', 'stroke-width': 1 }));
      const dt = g('text', { x: W / 2, y: base + 14, fill: 'var(--ink-soft)', 'font-family': 'IBM Plex Mono, monospace', 'font-weight': 500, 'letter-spacing': 1, 'font-size': 12, 'text-anchor': 'middle' });
      dt.textContent = '◄————  DISTANCE  ————►';
      annot.appendChild(dt);

      const halo = g('circle', { r: 11, fill: 'var(--accent)', opacity: 0.15 });
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
          if (t < 1) requestAnimationFrame(step); else loopAnim();
        })(performance.now());
      }
      function loopAnim() {
        const dur = 6500, s = performance.now();
        (function step(now) { place(((now - s) % dur) / dur); requestAnimationFrame(step); })(performance.now());
      }
      const vCheck = () => {
        const vh = window.innerHeight || document.documentElement.clientHeight;
        const r = svg.getBoundingClientRect();
        if (r.top < vh * 0.9 && r.bottom > 0) { run(); window.removeEventListener('scroll', vCheck); }
      };
      vCheck(); window.addEventListener('scroll', vCheck, { passive: true });
    })();
  }

  document.addEventListener('astro:page-load', init);
})();
