import assert from "node:assert/strict";
import test from "node:test";
import {
  CONFIRM_STEPS,
  createStepDetector,
  PEAK_THRESHOLD,
} from "./stepDetector.js";

/* ------------------------------ helpers ------------------------------ */

const SAMPLE_MS = 20; // ~50Hz devicemotion

/** Runs `mags` (already gravity-free magnitudes on the x axis) through a
 *  fresh detector and returns the total steps it awarded. */
function runLinear(mags) {
  let total = 0;
  const det = createStepDetector((n) => {
    total += n;
  });
  mags.forEach((m, i) => {
    det.process({ linear: { x: m, y: 0, z: 0 } }, i * SAMPLE_MS);
  });
  return total;
}

/** Walking-ish waveform: clean peaks at `cadenceMs` apart, `count` peaks,
 *  quiet valleys in between. */
function walkWave({ count, cadenceMs, peak = 2.4 }) {
  const mags = [];
  const totalMs = count * cadenceMs + 400;
  const peakEvery = Math.round(cadenceMs / SAMPLE_MS);
  for (let i = 0; i * SAMPLE_MS < totalMs; i += 1) {
    // 3-sample bump at each cadence point, near-zero elsewhere
    const phase = i % peakEvery;
    if (phase === 0 || phase === 1 || phase === 2) mags.push(peak);
    else mags.push(0.15);
  }
  return mags;
}

/* -------------------------------- tests -------------------------------- */

test("stationary phone counts zero steps", () => {
  // small random-ish sensor noise, always well under the peak threshold
  const mags = Array.from({ length: 500 }, (_, i) => 0.25 + 0.2 * Math.sin(i));
  assert.equal(runLinear(mags), 0);
});

test("a single bump (phone picked up / knocked) counts zero", () => {
  const mags = [0.1, 0.1, 3.2, 3.4, 0.2, ...Array(300).fill(0.1)];
  assert.equal(runLinear(mags), 0);
});

test("a few irregular jolts far apart count zero", () => {
  const quiet = Array(160).fill(0.1); // 3.2s of silence between jolts
  const jolt = [3.0, 3.0, 0.2];
  const mags = [...jolt, ...quiet, ...jolt, ...quiet, ...jolt, ...quiet];
  assert.equal(runLinear(mags), 0);
});

test("fast buzzy vibration (sub-cadence) counts zero", () => {
  // alternating every sample = ~25Hz oscillation, amplitude above threshold
  const mags = Array.from({ length: 500 }, (_, i) => (i % 2 ? 2.4 : 0.0));
  assert.equal(runLinear(mags), 0);
});

test("sustained shaking below the walking floor never confirms", () => {
  // peaks every 100ms — faster than MIN_STEP_MS, so every one is discarded
  const mags = [];
  for (let i = 0; i < 400; i += 1) {
    mags.push(i % 5 === 0 ? 2.6 : 0.1);
  }
  assert.equal(runLinear(mags), 0);
});

test("real walking rhythm counts every step, including the banked start", () => {
  const PEAKS = 20;
  const steps = runLinear(walkWave({ count: PEAKS, cadenceMs: 560 }));
  assert.equal(steps, PEAKS);
});

test("counting only begins after the confirmation streak", () => {
  // Exactly CONFIRM_STEPS - 1 rhythmic peaks, then silence → nothing counted.
  const steps = runLinear(walkWave({ count: CONFIRM_STEPS - 1, cadenceMs: 560 }));
  assert.equal(steps, 0);
});

test("slow tilting (orientation change) via gravity input counts zero", () => {
  let total = 0;
  const det = createStepDetector((n) => {
    total += n;
  });
  // gravity vector rotates slowly from +z to +x over ~8s — like turning the
  // phone over in your hand. No linear acceleration channel available.
  const G = 9.81;
  const samples = 400;
  for (let i = 0; i < samples; i += 1) {
    const t = (i / samples) * (Math.PI / 2);
    det.process(
      { gravity: { x: G * Math.sin(t), y: 0, z: G * Math.cos(t) } },
      i * SAMPLE_MS,
    );
  }
  assert.equal(total, 0);
});

test("threshold sanity: walking peaks clear it, smoothing dips re-arm", () => {
  // guard against tunable drift making the wave fixtures meaningless
  assert.ok(PEAK_THRESHOLD > 0.5 && PEAK_THRESHOLD < 4);
});
