// PerspectiveWarp: computes an affine transform that aligns an asset to the
// detected head pose (yaw/pitch/roll) and scales it to the face. We use a
// 2D affine matrix (good enough for near-frontal selfies and cheap on canvas),
// augmented with a per-axis scale to fake perspective foreshortening.

import { makeTransform, transformPoint, composeTransform, midpoint, dist } from './geometry.js';

// Build a transform that maps a normalised asset (centred at 0,0, unit size)
// into face space defined by: center, halfWidth, halfHeight, roll, yaw, pitch.
export function buildFaceTransform({ center, halfWidth, halfHeight, roll = 0, yaw = 0, pitch = 0 }) {
  const m = makeTransform();
  // translate to center
  m.e = center.x;
  m.f = center.y;
  // rotation (roll)
  const cos = Math.cos(roll);
  const sin = Math.sin(roll);
  const rot = { a: cos, b: sin, c: -sin, d: cos, e: 0, f: 0 };
  // scale with perspective foreshortening: yaw squashes x, pitch squashes y
  const yawScale = 1 - Math.min(0.4, Math.abs(yaw) * 0.9);
  const pitchScale = 1 - Math.min(0.3, Math.abs(pitch) * 0.7);
  const sc = {
    a: halfWidth * yawScale,
    b: 0,
    c: 0,
    d: halfHeight * pitchScale,
    e: 0,
    f: 0,
  };
  return composeTransform(m, composeTransform(rot, sc));
}

// Fit an asset box between two anchor points with roll alignment.
export function alignBetween(p1, p2, extra = 0) {
  const center = midpoint(p1, p2);
  const d = dist(p1, p2);
  const roll = Math.atan2(p2.y - p1.y, p2.x - p1.x);
  return {
    center,
    halfWidth: (d / 2) * (1 + extra),
    halfHeight: (d / 2) * (1 + extra),
    roll: roll - Math.PI / 2,
    yaw: 0,
    pitch: 0,
  };
}

// Apply a transform to a canvas drawing callback by setting ctx matrix.
export function applyTransform(ctx, m) {
  ctx.setTransform(m.a, m.b, m.c, m.d, m.e, m.f);
}

export { transformPoint };
