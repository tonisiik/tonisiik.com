/* ============================================================
   HERO 3D — wireframe "revolved" cast body (three.js / WebGL)
   The 2D drawing that fills the background, lifted off the sheet:
   a slowly rotating wireframe of the cast flanged body, drawn as
   thin lines in the theme colours (rings + meridians + bolt holes
   + centre axis), with a paper-coloured depth fog so the far side
   fades into the sheet. Subtle mouse parallax.

   Graceful fallback: if WebGL is unavailable or the visitor prefers
   reduced motion, the canvas is hidden and the hand-drawn fig.1
   "decision loop" SVG stays as-is. Theme-aware (repaints on the
   Blueprint⇄Ink toggle). Only runs on the home hero.
   ============================================================ */
import * as THREE from 'three';

export function initHero3D() {
  const canvas = document.getElementById('hero3d');
  const svg = document.getElementById('loop-svg');
  const cap = document.querySelector('.fig .fig-cap');
  if (!canvas) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // build the renderer (also our WebGL capability test) — fall back on any failure
  let renderer;
  try {
    if (reduce) throw new Error('reduced-motion');
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch (e) {
    canvas.style.display = 'none';
    if (svg) svg.style.display = '';
    return;
  }

  // 3D is active → the SVG loop becomes the fallback only
  if (svg) svg.style.display = 'none';
  if (cap) cap.innerHTML = '<b>FIG. 1</b> — Cast Body · Revolved';

  const root = document.documentElement;
  const cssColor = (name, fb) => {
    const v = getComputedStyle(root).getPropertyValue(name).trim();
    return new THREE.Color(v || fb);
  };

  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(cssColor('--paper', '#123a60'), 4.2, 8.2);

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0.35, 5.1);
  camera.lookAt(0, 0, 0);

  // ---- theme materials ----
  const matRing = new THREE.LineBasicMaterial({ color: cssColor('--ink-soft', '#a9c4de'), transparent: true, opacity: 0.9 });
  const matMerid = new THREE.LineBasicMaterial({ color: cssColor('--ink-faint', '#6f93b6'), transparent: true, opacity: 0.5 });
  const matAcc = new THREE.LineBasicMaterial({ color: cssColor('--accent', '#f2b35e'), transparent: true, opacity: 0.95 });
  const matAxis = new THREE.LineDashedMaterial({ color: cssColor('--accent', '#f2b35e'), dashSize: 0.09, gapSize: 0.07, transparent: true, opacity: 0.45 });

  // ---- geometry helpers ----
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  function geom(points) { return new THREE.BufferGeometry().setFromPoints(points); }
  function ring(r, y, seg = 72) {
    const p = [];
    for (let i = 0; i < seg; i++) { const a = (i / seg) * Math.PI * 2; p.push(V(Math.cos(a) * r, y, Math.sin(a) * r)); }
    return geom(p);
  }
  function holeRing(cx, cz, y, r, seg = 28) {
    const p = [];
    for (let i = 0; i < seg; i++) { const a = (i / seg) * Math.PI * 2; p.push(V(cx + Math.cos(a) * r, y, cz + Math.sin(a) * r)); }
    return geom(p);
  }

  // closed cross-section of the flanged body (outer up → across top → down the bore → base)
  const section = [
    [1.00, -1.00], [1.00, -0.78], [0.55, -0.78], [0.55, 0.78], [1.00, 0.78],
    [1.00, 1.00], [0.30, 1.00], [0.30, -1.00], [1.00, -1.00]
  ];
  function meridian(angle) {
    return geom(section.map(([r, y]) => V(Math.cos(angle) * r, y, Math.sin(angle) * r)));
  }

  const group = new THREE.Group();

  // latitude rings (flange edges, body ends, bore, + a couple of body rings)
  [
    [1.00, -1.00], [1.00, -0.78], [0.55, -0.78], [0.55, -0.30], [0.55, 0.30],
    [0.55, 0.78], [1.00, 0.78], [1.00, 1.00], [0.30, 1.00], [0.30, -1.00]
  ].forEach(([r, y]) => group.add(new THREE.LineLoop(ring(r, y), matRing)));

  // bolt-circle construction ring on the top flange
  group.add(new THREE.LineLoop(ring(0.80, 1.001), matMerid));

  // meridian outlines (the revolve)
  const M = 20;
  for (let i = 0; i < M; i++) group.add(new THREE.Line(meridian((i / M) * Math.PI * 2), matMerid));

  // 6 bolt holes, top + bottom flange faces
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2, cx = Math.cos(a) * 0.80, cz = Math.sin(a) * 0.80;
    group.add(new THREE.LineLoop(holeRing(cx, cz, 1.002, 0.13), matAcc));
    group.add(new THREE.LineLoop(holeRing(cx, cz, -1.002, 0.13), matAcc));
  }

  // centre axis (dashed, accent)
  const axis = new THREE.Line(geom([V(0, -1.3, 0), V(0, 1.3, 0)]), matAxis);
  axis.computeLineDistances();
  group.add(axis);

  group.rotation.x = -0.34;
  scene.add(group);

  // ---- sizing ----
  function resize() {
    const w = canvas.clientWidth || 420;
    const h = canvas.clientHeight || 420;
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);
  if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas);

  // ---- pointer parallax ----
  let px = 0, py = 0, cx = 0, cy = 0;
  window.addEventListener('pointermove', (e) => {
    px = (e.clientX / window.innerWidth) * 2 - 1;
    py = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  // ---- theme repaint ----
  new MutationObserver(() => {
    matRing.color.copy(cssColor('--ink-soft', '#a9c4de'));
    matMerid.color.copy(cssColor('--ink-faint', '#6f93b6'));
    matAcc.color.copy(cssColor('--accent', '#f2b35e'));
    matAxis.color.copy(cssColor('--accent', '#f2b35e'));
    scene.fog.color.copy(cssColor('--paper', '#123a60'));
  }).observe(root, { attributes: true, attributeFilter: ['data-mode'] });

  // ---- render loop (paused while the hero is off-screen) ----
  const clock = new THREE.Clock();
  let visible = true, raf = 0;
  function frame() {
    raf = requestAnimationFrame(frame);
    if (!visible) return;
    const t = clock.getElapsedTime();
    cx += (px - cx) * 0.05;
    cy += (py - cy) * 0.05;
    group.rotation.y = t * 0.3 + cx * 0.55;
    group.rotation.x = -0.34 + cy * 0.28;
    renderer.render(scene, camera);
  }
  if (window.IntersectionObserver) {
    new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; }, { threshold: 0.01 })
      .observe(canvas);
  }
  frame();
}
