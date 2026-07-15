/* ============================================================
   CAUSAL TREE — 3D root-cause tree (three.js / WebGL)
   A procedural causal tree in the blueprint-wireframe language:
   a root cause at the base grows upward, branching level by level
   into the many observed effects at the tips. It grows once when it
   scrolls into view (branches extend, nodes pop in), then idles
   slowly rotating so the 3D structure reads. Paper-coloured depth
   fog fades the far branches into the sheet. Theme-aware.

   Fallback: reduced-motion → rendered fully-grown & static; no WebGL
   → the whole figure section is hidden. Home page only.
   ============================================================ */
import * as THREE from 'three';

export function initCausalTree() {
  const canvas = document.getElementById('causal-tree');
  if (!canvas) return;
  const svg = document.getElementById('loop-svg');
  const cap = document.querySelector('.fig .fig-cap');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch (e) {
    canvas.style.display = 'none';
    if (svg) svg.style.display = '';   // fall back to the hand-drawn loop
    return;
  }
  if (svg) svg.style.display = 'none';
  if (cap) cap.innerHTML = '<b>FIG. 1</b> — Root-Cause Tree';

  const root = document.documentElement;
  const col = (name, fb) => {
    const v = getComputedStyle(root).getPropertyValue(name).trim();
    return new THREE.Color(v || fb);
  };

  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(col('--paper', '#123a60'), 5.4, 11);

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  const CENTER_Y = 1.8;
  camera.position.set(0, CENTER_Y + 0.28, 5.5);
  camera.lookAt(0, CENTER_Y, 0);

  // ---- seeded RNG (stable tree every load) ----
  let s = 0x9e3779b9 >>> 0;
  const rnd = () => { s = (s + 0x6D2B79F5) >>> 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

  // ---- generate the tree ----
  const nodes = [];   // { pos, depth, kind:'root'|'mid'|'leaf', inSeg }
  const segs = [];    // { a, b, depth }
  const BRANCH = [1, 3, 2, 2, 2];   // children per level (index = depth)
  const MAXD = BRANCH.length;       // leaves live at depth MAXD

  function build(pos, dir, depth, len) {
    const idx = nodes.length;
    nodes.push({ pos, depth, kind: depth === 0 ? 'root' : (depth >= MAXD ? 'leaf' : 'mid'), inSeg: -1 });
    if (depth >= MAXD) return idx;
    const n = BRANCH[depth];
    const base = rnd() * Math.PI * 2;
    for (let i = 0; i < n; i++) {
      let ndir;
      if (depth === 0) {
        ndir = new THREE.Vector3(0, 1, 0);   // straight trunk
      } else {
        const tilt = 0.22 + depth * 0.07 + rnd() * 0.18;
        const az = base + (i / n) * Math.PI * 2 + (rnd() - 0.5) * 0.7;
        const horiz = new THREE.Vector3(Math.cos(az), 0, Math.sin(az));
        ndir = new THREE.Vector3().copy(dir).addScaledVector(horiz, Math.tan(tilt)).normalize();
      }
      const nlen = len * (0.72 + rnd() * 0.08);
      const npos = new THREE.Vector3().copy(pos).addScaledVector(ndir, nlen);
      const child = build(npos, ndir, depth + 1, nlen);
      nodes[child].inSeg = segs.length;
      segs.push({ a: idx, b: child, depth });
    }
    return idx;
  }
  build(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0), 0, 1.25);

  const group = new THREE.Group();
  scene.add(group);

  // ---- branch lines (each drawn from parent → animated tip) ----
  const matBranch = new THREE.LineBasicMaterial({ color: col('--ink-faint', '#6f93b6'), transparent: true, opacity: 0.6 });
  segs.forEach((sg) => {
    const a = nodes[sg.a].pos, b = nodes[sg.b].pos;
    const g = new THREE.BufferGeometry().setFromPoints([a.clone(), a.clone()]);
    sg.line = new THREE.Line(g, matBranch);
    sg.a3 = a; sg.b3 = b;
    group.add(sg.line);
  });

  // ---- node markers (small spheres, scale-in on birth) ----
  const matRootNode = new THREE.MeshBasicMaterial({ color: col('--accent', '#f2b35e') });
  const matLeafNode = new THREE.MeshBasicMaterial({ color: col('--accent', '#f2b35e'), transparent: true, opacity: 0.92 });
  const matMidNode = new THREE.MeshBasicMaterial({ color: col('--ink-soft', '#a9c4de'), transparent: true, opacity: 0.85 });
  const sphere = new THREE.SphereGeometry(1, 10, 8);
  nodes.forEach((nd) => {
    const r = nd.kind === 'root' ? 0.10 : nd.kind === 'leaf' ? 0.062 : 0.045;
    const m = nd.kind === 'root' ? matRootNode : nd.kind === 'leaf' ? matLeafNode : matMidNode;
    const mesh = new THREE.Mesh(sphere, m);
    mesh.position.copy(nd.pos);
    mesh.scale.setScalar(0.0001);
    nd.mesh = mesh; nd.r = r;
    group.add(mesh);
  });

  // ---- sizing ----
  // tree half-extents (with margin) used to frame the camera so it never clips
  const CAM = { H2: 1.9, W2: 1.35, margin: 1.05 };
  function resize() {
    // read the CSS-driven display size, clamped so a missing stylesheet can't
    // let the canvas balloon; observe the container (not the canvas) so a
    // backing-size change can never feed back into a resize loop
    const w = Math.min(900, Math.max(200, canvas.clientWidth || 400));
    const h = Math.min(900, Math.max(200, canvas.clientHeight || 500));
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(w, h, false);
    const aspect = w / h;
    camera.aspect = aspect;
    // pull the camera to whichever distance frames the full tree for this
    // aspect (width- or height-limited) — so the canopy never clips at the sides
    const vt = Math.tan((camera.fov * Math.PI / 180) / 2);
    const dist = Math.max(CAM.H2 / vt, CAM.W2 / (vt * aspect)) * CAM.margin;
    camera.position.set(0, CENTER_Y + 0.12, dist);
    camera.lookAt(0, CENTER_Y, 0);
    camera.updateProjectionMatrix();
    scene.fog.near = dist - 2.4;
    scene.fog.far = dist + 4.6;
  }
  resize();
  window.addEventListener('resize', resize);
  if (window.ResizeObserver && canvas.parentElement) new ResizeObserver(resize).observe(canvas.parentElement);

  // ---- theme repaint ----
  new MutationObserver(() => {
    matBranch.color.copy(col('--ink-faint', '#6f93b6'));
    matRootNode.color.copy(col('--accent', '#f2b35e'));
    matLeafNode.color.copy(col('--accent', '#f2b35e'));
    matMidNode.color.copy(col('--ink-soft', '#a9c4de'));
    scene.fog.color.copy(col('--paper', '#123a60'));
    if (reduce) renderer.render(scene, camera);   // static mode → nudge a repaint
  }).observe(root, { attributes: true, attributeFilter: ['data-mode'] });

  // ---- growth model ----
  const GROW_DUR = 3.6;                 // seconds
  const SEG_SPAN = 0.30;                 // each level's draw window (of global g)
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const clamp01 = (t) => (t < 0 ? 0 : t > 1 ? 1 : t);
  const _tip = new THREE.Vector3();

  function segStart(d) { return (d / MAXD) * (1 - SEG_SPAN); }

  function setGrowth(g) {
    // branches
    for (const sg of segs) {
      const st = segStart(sg.depth);
      const lp = clamp01((g - st) / SEG_SPAN);
      _tip.copy(sg.a3).lerp(sg.b3, easeOut(lp));
      const p = sg.line.geometry.attributes.position;
      p.setXYZ(1, _tip.x, _tip.y, _tip.z);
      p.needsUpdate = true;
    }
    // nodes (scale-in as their incoming branch nears completion)
    for (const nd of nodes) {
      let born;
      if (nd.kind === 'root') born = clamp01(g / 0.05);
      else {
        const sg = segs[nd.inSeg];
        const st = segStart(sg.depth);
        const lp = clamp01((g - st) / SEG_SPAN);
        born = clamp01((lp - 0.6) / 0.4);
      }
      nd.mesh.scale.setScalar(Math.max(0.0001, born * nd.r));
    }
  }

  // ---- run ----
  const clock = new THREE.Clock();
  let growT = 0, grown = false, started = reduce, rot = 0, inView = !('IntersectionObserver' in window);

  if (reduce) { setGrowth(1); grown = true; renderer.render(scene, camera); }

  if (window.IntersectionObserver) {
    new IntersectionObserver((entries) => {
      inView = entries[0].isIntersecting;
      if (inView) started = true;
    }, { threshold: 0.15 }).observe(canvas);
  } else { started = true; }

  function frame() {
    requestAnimationFrame(frame);
    if (reduce) return;
    const dt = clock.getDelta();
    if (!inView) return;                 // pause off-screen
    if (started && !grown) {
      growT += dt / GROW_DUR;
      if (growT >= 1) { growT = 1; grown = true; }
      setGrowth(easeOut(clamp01(growT)));
    }
    if (grown) { rot += dt * 0.22; group.rotation.y = rot; }
    renderer.render(scene, camera);
  }
  if (!reduce) frame();
}
