// Shared math/geometry helpers for the realistic try-on rendering pipeline.
// All functions are pure and operate on plain { x, y } objects unless noted.

export function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v;
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function lerpPoint(a, b, t) {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
}

export function dist(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function midpoint(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}


export function averagePoints(pts) {
  if (!pts || pts.length === 0) return { x: 0, y: 0 };
  let x = 0;
  let y = 0;
  for (const p of pts) {
    x += p.x;
    y += p.y;
  }
  return { x: x / pts.length, y: y / pts.length };
}

// Deterministic pseudo-random generator so re-renders do not flicker.
export function makeRng(seed) {
  let s = seed >>> 0 || 1;
  return function rng() {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
}

// Catmull-Rom spline through an array of points, returning sampled points.
export function catmullRom(points, samples = 12) {
  if (points.length < 2) return points.slice();
  const pts = [points[0], ...points, points[points.length - 1]];
  const out = [];
  for (let i = 1; i < pts.length - 2; i++) {
    const p0 = pts[i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2];
    for (let j = 0; j < samples; j++) {
      const t = j / samples;
      const t2 = t * t;
      const t3 = t2 * t;
      out.push({
        x:
          0.5 *
          (2 * p1.x +
            (-p0.x + p2.x) * t +
            (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
            (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y:
          0.5 *
          (2 * p1.y +
            (-p0.y + p2.y) * t +
            (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
            (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
      });
    }
  }
  out.push(points[points.length - 1]);
  return out;
}

// Build a smooth closed path (used for hairline / jawline masks).
export function buildPath(ctx, points, close = true) {
  if (!points || points.length === 0) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  const smooth = catmullRom(points, 8);
  for (const p of smooth) ctx.lineTo(p.x, p.y);
  if (close) ctx.closePath();
}

// Affine transform helpers used by PerspectiveWarp.
export function makeTransform() {
  return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
}

export function transformPoint(m, x, y) {
  return { x: m.a * x + m.c * y + m.e, y: m.b * x + m.d * y + m.f };
}

// Compose two 2x3 affine matrices (apply m2 then m1).
export function composeTransform(m1, m2) {
  return {
    a: m1.a * m2.a + m1.c * m2.b,
    b: m1.b * m2.a + m1.d * m2.b,
    c: m1.a * m2.c + m1.c * m2.d,
    d: m1.b * m2.c + m1.d * m2.d,
    e: m1.a * m2.e + m1.c * m2.f + m1.e,
    f: m1.b * m2.e + m1.d * m2.f + m1.f,
  };
}
