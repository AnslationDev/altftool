/**
 * Scores a freehand stroke on how close it is to a circle.
 *
 * Extracted from the Perfect Circle toy so the maths can be tested without a
 * browser — it is the only part of that page with a right and wrong answer.
 *
 * Method: take the centroid of the stroke, measure every point's distance from
 * it, and score on how little those distances vary. Expressed as
 * `1 - (stdDev / mean)` so it is scale-invariant — a small careful circle should
 * beat a large sloppy one.
 *
 * The sweep check is what stops the naive version feeling broken: a short arc
 * has almost no radius variance, so without it a quarter-circle scores ~99%.
 */

const MIN_POINTS = 24;
const MIN_SWEEP = Math.PI * 1.6; // ~290°, forgiving of a gap at the join.
const MIN_RADIUS = 24; // px — below this it is a scribble, not a circle.

export function scoreStroke(points) {
  if (!Array.isArray(points) || points.length < MIN_POINTS) return null;

  const cx = points.reduce((sum, p) => sum + p.x, 0) / points.length;
  const cy = points.reduce((sum, p) => sum + p.y, 0) / points.length;

  const radii = points.map((p) => Math.hypot(p.x - cx, p.y - cy));
  const mean = radii.reduce((sum, r) => sum + r, 0) / radii.length;
  if (mean < MIN_RADIUS) return null;

  // Total turning, summed as signed angle deltas, tells us whether the stroke
  // actually went round rather than doubling back on itself.
  let sweep = 0;
  for (let i = 1; i < points.length; i += 1) {
    const a = Math.atan2(points[i - 1].y - cy, points[i - 1].x - cx);
    const b = Math.atan2(points[i].y - cy, points[i].x - cx);
    let delta = b - a;
    if (delta > Math.PI) delta -= Math.PI * 2;
    if (delta < -Math.PI) delta += Math.PI * 2;
    sweep += delta;
  }
  if (Math.abs(sweep) < MIN_SWEEP) return null;

  const variance =
    radii.reduce((sum, r) => sum + (r - mean) ** 2, 0) / radii.length;
  const accuracy = 1 - Math.sqrt(variance) / mean;

  return {
    score: Math.max(0, Math.min(100, accuracy * 100)),
    cx,
    cy,
    radius: mean,
  };
}

export function verdictFor(score) {
  if (score >= 97) return "Suspicious. Genuinely suspicious.";
  if (score >= 93) return "That is a circle by any reasonable definition.";
  if (score >= 85) return "Respectable. A protractor would still object.";
  if (score >= 70) return "Recognisably circular. Broadly.";
  if (score >= 50) return "An egg, drawn with confidence.";
  return "That is a shape, certainly.";
}

export const SCORING_LIMITS = Object.freeze({
  minPoints: MIN_POINTS,
  minSweep: MIN_SWEEP,
  minRadius: MIN_RADIUS,
});
