import assert from "node:assert/strict";
import test from "node:test";
import { CONFIRM_STEPS, createStepDetector } from "./stepDetector.js";

/* ------------------------------ helpers ------------------------------ */

const SAMPLE_MS = 20; // ~50Hz devicemotion

/** Runs timestamped magnitudes through a fresh detector, returns steps awarded. */
function run(samples) {
  let total = 0;
  const det = createStepDetector((n) => {
    total += n;
  });
  for (const s of samples) det.process({ linear: { x: s.m, y: 0, z: 0 } }, s.t);
  return total;
}

/** Flat magnitudes at a fixed rate — for the negative cases. */
function flat(mags, sampleMs = SAMPLE_MS) {
  return mags.map((m, i) => ({ m, t: i * sampleMs }));
}

/**
 * A realistic walk.
 *
 * This is the fixture that matters. The previous version of these tests drove
 * the detector with three-sample spikes separated by a dead-flat 0.15, and the
 * suite passed while the detector counted ZERO steps on real walking — an
 * accelerometer signal is a continuous oscillation that never returns to near
 * zero between footfalls, so a fixture with flat valleys never exercises
 * re-arming at all.
 *
 * One footfall per `cadenceMs`: |sin(pi t / cadence)| has exactly that period.
 * The second term is the within-stride harmonic real gait shows, `floor` keeps
 * the signal off zero, and the noise is deterministic so runs are repeatable.
 */
function walk({ steps, cadenceMs, amp, hz = 50, noise = 0.15, floor = 0.5 }) {
  const dt = 1000 / hz;
  const out = [];
  let seed = 42;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff - 0.5;
  };
  for (let t = 0; t < steps * cadenceMs; t += dt) {
    const ph = (Math.PI * t) / cadenceMs;
    out.push({
      m:
        floor +
        amp * Math.abs(Math.sin(ph)) +
        0.3 * amp * Math.abs(Math.sin(2 * ph)) +
        noise * rnd(),
      t,
    });
  }
  return out;
}

/* ----------------------------- nothing counts ----------------------------- */

test("stationary phone counts zero steps", () => {
  const mags = Array.from({ length: 500 }, (_, i) => 0.25 + 0.2 * Math.sin(i));
  assert.equal(run(flat(mags)), 0);
});

test("a single bump (phone picked up / knocked) counts zero", () => {
  assert.equal(run(flat([0.1, 0.1, 3.2, 3.4, 0.2, ...Array(300).fill(0.1)])), 0);
});

test("a few irregular jolts far apart count zero", () => {
  const mags = [];
  for (let j = 0; j < 5; j += 1) mags.push(3.0, 3.2, ...Array(158).fill(0.1));
  assert.equal(run(flat(mags)), 0);
});

test("fast buzzy vibration (sub-cadence) counts zero", () => {
  // ~10Hz oscillation — far faster than any stride
  const mags = Array.from({ length: 800 }, (_, i) => 2.5 + 2 * Math.sin(i * 0.63));
  assert.equal(run(flat(mags)), 0);
});

test("slow tilting (orientation change) via gravity input counts zero", () => {
  let total = 0;
  const det = createStepDetector((n) => {
    total += n;
  });
  const G = 9.81;
  // Gravity vector rotating slowly from +z to +x over six seconds.
  for (let i = 0; i < 300; i += 1) {
    const t = (Math.PI / 2) * (i / 300);
    det.process(
      { gravity: { x: G * Math.sin(t), y: 0, z: G * Math.cos(t) } },
      i * SAMPLE_MS,
    );
  }
  assert.equal(total, 0);
});

/* ------------------------------ walking counts ----------------------------- */

/**
 * The regression guard. Every profile here counted ZERO with the previous
 * fixed-threshold detector. The ±8% band is roughly what an accelerometer
 * pedometer is held to; falling outside it means the tunables have drifted.
 */
const PROFILES = [
  { name: "brisk walk, in hand", cadenceMs: 550, amp: 2.4 },
  { name: "normal walk, in hand", cadenceMs: 650, amp: 1.8 },
  { name: "slow walk, in hand", cadenceMs: 800, amp: 1.2 },
  { name: "pocket, high amplitude", cadenceMs: 600, amp: 3.5 },
  { name: "gentle stroll", cadenceMs: 900, amp: 0.9 },
  { name: "jog", cadenceMs: 420, amp: 4.0 },
];

for (const p of PROFILES) {
  test(`counts ${p.name} within 8%`, () => {
    const counted = run(walk({ steps: 100, cadenceMs: p.cadenceMs, amp: p.amp }));
    assert.ok(
      counted >= 92 && counted <= 108,
      `${p.name}: expected 92-108 of 100, got ${counted}`,
    );
  });
}

test("counts the same walk at 20Hz and at 60Hz", () => {
  // Smoothing is defined in milliseconds precisely so the sample rate does not
  // change the filter. A sample-count window made this device-dependent.
  const low = run(walk({ steps: 100, cadenceMs: 650, amp: 1.8, hz: 20 }));
  const high = run(walk({ steps: 100, cadenceMs: 650, amp: 1.8, hz: 60 }));
  assert.ok(low >= 92 && low <= 108, `20Hz: got ${low}`);
  assert.ok(high >= 92 && high <= 108, `60Hz: got ${high}`);
});

test("counting only begins after the confirmation streak", () => {
  // One stride short of the streak: not enough rhythm to confirm anything.
  const counted = run(walk({ steps: CONFIRM_STEPS - 1, cadenceMs: 650, amp: 1.8 }));
  assert.equal(counted, 0);
});

test("the banked confirmation steps are released, not lost", () => {
  const counted = run(walk({ steps: 12, cadenceMs: 650, amp: 1.8 }));
  assert.ok(counted >= 10, `expected the banked opening steps back, got ${counted}`);
});

test("walking, then stopping, then walking again counts both bouts", () => {
  const first = walk({ steps: 20, cadenceMs: 650, amp: 1.8 });
  const gapStart = first[first.length - 1].t + SAMPLE_MS;
  const gap = Array.from({ length: 200 }, (_, i) => ({
    m: 0.2,
    t: gapStart + i * SAMPLE_MS,
  }));
  const resumeAt = gap[gap.length - 1].t + SAMPLE_MS;
  const second = walk({ steps: 20, cadenceMs: 650, amp: 1.8 }).map((s) => ({
    m: s.m,
    t: s.t + resumeAt,
  }));
  assert.ok(run([...first, ...gap, ...second]) >= 30, "both bouts should count");
});
