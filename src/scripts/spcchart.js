/* ============================================================
   SPC CONTROL CHART — hero figure
   Replaces the WebGL root-cause tree. A quiet process-control
   chart: control limits, a data line that draws itself in once
   on load, the latest point picked out in the accent colour.
   Static under reduced-motion.
   ============================================================ */

const DATA = [0.52, 0.58, 0.49, 0.61, 0.55, 0.47, 0.63, 0.59, 0.51, 0.44, 0.5, 0.57, 0.62, 0.66];

export function initSpcChart() {
  const canvas = document.getElementById('spc-chart');
  if (!canvas) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const col = (name, fb) => (getComputedStyle(root).getPropertyValue(name).trim() || fb);

  let start = null, running = false;

  function size() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width) return null;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w: rect.width, h: rect.height };
  }

  function draw(progress) {
    const dims = size();
    if (!dims) return;
    const { ctx, w, h } = dims;
    const padX = 24, padY = 22;
    const plotW = w - padX * 2, plotH = h - padY * 2;
    const line = col('--edge', '#C7CCD1');
    const ink = col('--ink', '#20242A');
    const accent = col('--accent', '#2F6690');

    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = line;
    ctx.setLineDash([1, 0]);
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(padX, padY + plotH * 0.5); ctx.lineTo(w - padX, padY + plotH * 0.5); ctx.stroke();

    ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(padX, padY + plotH * 0.12); ctx.lineTo(w - padX, padY + plotH * 0.12); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(padX, padY + plotH * 0.88); ctx.lineTo(w - padX, padY + plotH * 0.88); ctx.stroke();
    ctx.setLineDash([1, 0]);

    ctx.fillStyle = ink;
    ctx.font = '10px "IBM Plex Mono", monospace';
    ctx.globalAlpha = 0.5;
    ctx.fillText('UCL', w - padX - 24, padY + plotH * 0.12 - 6);
    ctx.fillText('CL', w - padX - 18, padY + plotH * 0.5 - 6);
    ctx.fillText('LCL', w - padX - 24, padY + plotH * 0.88 - 6);
    ctx.globalAlpha = 1;

    const n = DATA.length;
    const visibleCount = Math.max(1, Math.floor(progress * n));
    const pts = [];
    for (let i = 0; i < n; i++) {
      const x = padX + (plotW * i) / (n - 1);
      const y = padY + plotH * (1 - DATA[i] * 0.86 - 0.07);
      pts.push([x, y]);
    }

    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let j = 0; j < visibleCount; j++) {
      const p = pts[j];
      if (j === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]);
    }
    ctx.stroke();

    for (let k = 0; k < visibleCount; k++) {
      const isLast = k === visibleCount - 1 && visibleCount === n;
      ctx.beginPath();
      ctx.fillStyle = isLast ? accent : ink;
      ctx.arc(pts[k][0], pts[k][1], isLast ? 3.2 : 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function animate(ts) {
    if (start === null) start = ts;
    const t = Math.min(1, (ts - start) / 1100);
    draw(t);
    if (t < 1) requestAnimationFrame(animate);
    else running = false;
  }

  function begin() {
    if (reduce) { draw(1); return; }
    if (running) return;
    running = true; start = null;
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', () => draw(1));
  begin();
}
