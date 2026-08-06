import assert from "node:assert/strict";
import test from "node:test";

import { SCORING_LIMITS, scoreStroke, verdictFor } from "./scoreCircle.js";

/** Points on a circle, optionally distorted. */
function circle({
  cx = 200,
  cy = 200,
  radius = 100,
  points = 72,
  sweep = Math.PI * 2,
  jitter = 0,
  squashY = 1,
} = {}) {
  // Samples over [0, sweep) rather than [0, sweep]. Including both endpoints on
  // a full turn duplicates the start point, which drags the centroid off centre
  // and costs a genuinely perfect circle about a point of score.
  return Array.from({ length: points }, (_, index) => {
    const angle = (index / points) * sweep;
    // Deterministic pseudo-jitter so the test never flakes.
    const wobble = jitter * Math.sin(index * 2.399);
    return {
      x: cx + (radius + wobble) * Math.cos(angle),
      y: cy + (radius + wobble) * Math.sin(angle) * squashY,
    };
  });
}

test("a perfect circle scores essentially 100", () => {
  const result = scoreStroke(circle());
  assert.ok(result, "a full circle should be scored");
  assert.ok(
    result.score > 99.5,
    `expected >99.5, got ${result.score.toFixed(2)}`,
  );
});

test("the score is scale-invariant", () => {
  const small = scoreStroke(circle({ radius: 40 }));
  const large = scoreStroke(circle({ radius: 400 }));
  assert.ok(
    Math.abs(small.score - large.score) < 0.01,
    `radius should not change the score: ${small.score} vs ${large.score}`,
  );
});

test("the centre and radius come back roughly right", () => {
  const result = scoreStroke(circle({ cx: 310, cy: 145, radius: 88 }));
  assert.ok(Math.abs(result.cx - 310) < 2, `cx was ${result.cx}`);
  assert.ok(Math.abs(result.cy - 145) < 2, `cy was ${result.cy}`);
  assert.ok(Math.abs(result.radius - 88) < 2, `radius was ${result.radius}`);
});

test("a wobbly circle scores lower than a clean one", () => {
  const clean = scoreStroke(circle());
  const wobbly = scoreStroke(circle({ jitter: 18 }));
  assert.ok(
    wobbly.score < clean.score,
    `wobbly ${wobbly.score} should be under clean ${clean.score}`,
  );
  assert.ok(wobbly.score > 40, "a recognisable circle should not score near zero");
});

test("an oval scores well below a circle", () => {
  const oval = scoreStroke(circle({ squashY: 0.45 }));
  assert.ok(oval, "an oval is still a closed loop and should be scored");
  assert.ok(oval.score < 85, `an oval scored ${oval.score.toFixed(1)}`);
});

test("a short arc is rejected rather than scored highly", () => {
  // The failure mode the sweep check exists for: a quarter arc has almost no
  // radius variance, so a naive implementation hands it ~99%.
  const arc = scoreStroke(circle({ sweep: Math.PI / 2 }));
  assert.equal(arc, null);
});

test("an almost-closed loop is still accepted", () => {
  const nearly = scoreStroke(circle({ sweep: Math.PI * 1.75 }));
  assert.ok(nearly, "290°+ should count as a circle");
});

test("too few points is rejected", () => {
  const sparse = circle({ points: SCORING_LIMITS.minPoints - 1 });
  assert.equal(scoreStroke(sparse), null);
});

test("a tiny scribble is rejected", () => {
  assert.equal(scoreStroke(circle({ radius: 5 })), null);
});

test("non-array input is rejected rather than throwing", () => {
  assert.equal(scoreStroke(null), null);
  assert.equal(scoreStroke(undefined), null);
  assert.equal(scoreStroke([]), null);
});

test("the score never leaves 0-100", () => {
  [0, 4, 30, 90, 200].forEach((jitter) => {
    const result = scoreStroke(circle({ jitter }));
    if (!result) return;
    assert.ok(
      result.score >= 0 && result.score <= 100,
      `score ${result.score} out of range at jitter ${jitter}`,
    );
  });
});

test("a circle drawn anticlockwise scores the same as clockwise", () => {
  const clockwise = scoreStroke(circle());
  const anticlockwise = scoreStroke(circle({ sweep: -Math.PI * 2 }));
  assert.ok(anticlockwise, "direction should not matter");
  assert.ok(Math.abs(clockwise.score - anticlockwise.score) < 0.01);
});

test("verdicts are ordered and cover the whole range", () => {
  const seen = [100, 95, 90, 80, 60, 10].map(verdictFor);
  assert.equal(new Set(seen).size, seen.length, "each band has its own line");
  seen.forEach((line) => assert.ok(line.length > 5));
});
