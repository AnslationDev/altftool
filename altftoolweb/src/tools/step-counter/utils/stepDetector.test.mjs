import assert from "node:assert/strict";
import test from "node:test";
import { CONFIRM_STEPS, createStepDetector } from "./stepDetector.js";

/* ------------------------------ helpers ------------------------------ */

const SAMPLE_MS = 20; // ~50Hz devicemotion
const BAND = [92, 108]; // ±8%, roughly what an accelerometer pedometer is held to

/** Deterministic PRNG so every fixture replays identically. */
function mk(seed = 42) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff - 0.5;
  };
}

/** Runs timestamped magnitudes through a fresh detector, returns steps awarded. */
function run(samples, opts) {
  let total = 0;
  const det = createStepDetector((n) => {
    total += n;
  }, opts);
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
 * This is the fixture that matters. An older version of these tests drove the
 * detector with three-sample spikes separated by a dead-flat 0.15, and the suite
 * passed while the detector counted ZERO steps on real walking — an
 * accelerometer signal is a continuous oscillation that never returns to near
 * zero between footfalls, so a fixture with flat valleys never exercises
 * re-arming at all.
 *
 * One footfall per `cadenceMs`: |sin(pi t / cadence)| has exactly that period.
 * `harm` is the within-stride second harmonic real gait shows, `floor` keeps the
 * signal off zero, `cv` jitters the stride durations, and the noise is
 * deterministic so runs are repeatable.
 */
function walk({
  steps,
  cadenceMs,
  amp,
  hz = 50,
  noise = 0.15,
  floor = 0.5,
  harm = 0.3,
  cv = 0,
  seed = 42,
  t0 = 0,
}) {
  const dt = 1000 / hz;
  const out = [];
  const rnd = mk(seed);
  const wave = (ph) =>
    floor + amp * Math.abs(Math.sin(ph)) + harm * amp * Math.abs(Math.sin(2 * ph));

  if (!cv) {
    // Uniform cadence — the continuous form. Kept exactly as-is: every measured
    // number in this file was taken against it.
    for (let t = 0; t < steps * cadenceMs; t += dt) {
      out.push({ m: wave((Math.PI * t) / cadenceMs) + noise * rnd(), t: t + t0 });
    }
    return out;
  }

  // Jittered cadence — generated stride by stride so each interval varies.
  let at = 0;
  for (let i = 0; i < steps; i += 1) {
    const dur = Math.max(120, cadenceMs * (1 + cv * 2 * rnd()));
    for (let t = 0; t < dur; t += dt) {
      out.push({ m: wave((Math.PI * t) / dur) + noise * rnd(), t: at + t + t0 });
    }
    at += dur;
  }
  return out;
}

/** Sustained periodic motion that is not a walk — engines, wheels, buzzes. */
function periodic({ ms, periodMs, amp, base = 0.4, hz = 50, noise = 0.05, seed = 7 }) {
  const dt = 1000 / hz;
  const out = [];
  const rnd = mk(seed);
  for (let t = 0; t < ms; t += dt) {
    out.push({ m: base + amp * Math.abs(Math.sin((Math.PI * t) / periodMs)) + noise * rnd(), t });
  }
  return out;
}

/** Collects every snapshot the detector emits. */
function withSnapshots(samples, extra = {}) {
  const seen = [];
  let total = 0;
  const det = createStepDetector(
    (n) => {
      total += n;
    },
    { ...extra, onSnapshot: (s) => seen.push(s) },
  );
  for (const s of samples) det.process(s.sample ?? { linear: { x: s.m, y: 0, z: 0 } }, s.t);
  return { seen, total, last: seen[seen.length - 1] };
}

function inBand(v) {
  return v >= BAND[0] && v <= BAND[1];
}

/* ============================ POSITIVES ============================ */

/**
 * The regression guard. Every profile here counted ZERO with the original
 * fixed-threshold detector, and the running / harmonic / low-amplitude rows
 * below counted 9/0/0, 15/7 and 6 with v2.
 */
const PROFILES = [
  { name: "normal walk, in hand", cadenceMs: 650, amp: 1.8 },
  { name: "brisk walk, in hand", cadenceMs: 550, amp: 2.4 },
  { name: "slow walk, in hand", cadenceMs: 800, amp: 1.2 },
  { name: "gentle stroll", cadenceMs: 900, amp: 0.9 },
  { name: "pocket, high amplitude", cadenceMs: 600, amp: 3.5 },
  { name: "jog", cadenceMs: 420, amp: 4.0 },
];

for (const p of PROFILES) {
  test(`counts ${p.name} within 8%`, () => {
    const n = run(walk({ steps: 100, cadenceMs: p.cadenceMs, amp: p.amp }));
    assert.ok(inBand(n), `${p.name}: expected 92-108 of 100, got ${n}`);
  });
}

// v2 counted 9 / 0 / 0 here. MIN_STEP_MS 340 -> 280 is what fixed it.
for (const spm of [180, 190, 200]) {
  test(`counts running at ${spm} spm within 8%`, () => {
    const n = run(walk({ steps: 100, cadenceMs: 60000 / spm, amp: 4.0 }));
    assert.ok(inBand(n), `${spm} spm: expected 92-108 of 100, got ${n}`);
  });
}

// v2 counted 100 / 15 / 7. The prominence median is what fixed 0.9 and 1.0:
// a strong second harmonic used to tear the confirmation streak down.
for (const harm of [0.7, 0.9, 1.0]) {
  test(`counts a walk with a ${harm} second harmonic within 8%`, () => {
    const n = run(walk({ steps: 100, cadenceMs: 650, amp: 1.8, harm }));
    assert.ok(inBand(n), `harm ${harm}: expected 92-108 of 100, got ${n}`);
  });
}

// v2 counted 61 / 6. The hysteretic motion gate is what fixed 0.45 — the old
// single-threshold gate re-armed mid-stride and threw the streak away.
for (const amp of [0.5, 0.45]) {
  test(`counts a low-amplitude walk (amp ${amp}) within 8%`, () => {
    const n = run(walk({ steps: 100, cadenceMs: 650, amp }));
    assert.ok(inBand(n), `amp ${amp}: expected 92-108 of 100, got ${n}`);
  });
}

// Smoothing is a span in MILLISECONDS precisely so the sample rate is not the
// filter. A sample-count window made this device-dependent.
for (const hz of [10, 20, 60, 200]) {
  test(`counts the same walk at ${hz}Hz within 8%`, () => {
    const n = run(walk({ steps: 100, cadenceMs: 650, amp: 1.8, hz }));
    assert.ok(inBand(n), `${hz}Hz: expected 92-108 of 100, got ${n}`);
  });
}

test("the headline profiles do not depend on the noise realisation", () => {
  for (const seed of [1, 7, 13, 99, 777, 31337]) {
    for (const p of [
      { cadenceMs: 650, amp: 1.8 },
      { cadenceMs: 900, amp: 0.9 },
      { cadenceMs: 650, amp: 0.45 },
      { cadenceMs: 60000 / 200, amp: 4.0 },
      { cadenceMs: 650, amp: 1.8, harm: 1.0 },
    ]) {
      const n = run(walk({ steps: 100, ...p, seed }));
      assert.ok(inBand(n), `seed ${seed} ${JSON.stringify(p)}: got ${n}`);
    }
  }
});

test("a walk with realistic stride-to-stride variation still counts", () => {
  // Real gait is not a metronome. CV_MAX is 0.32; 8% jitter is comfortably human.
  const n = run(walk({ steps: 100, cadenceMs: 650, amp: 1.8, cv: 0.08 }));
  assert.ok(inBand(n), `jittered walk: expected 92-108 of 100, got ${n}`);
});

/* ============================ NEGATIVES ============================ */

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

test("an idling engine at 250ms counts zero", () => {
  // This is the fixture that rules out MIN_STEP_MS = 200, where it counts 475.
  assert.equal(run(periodic({ ms: 120000, periodMs: 250, amp: 0.6 })), 0);
});

test("a low-amplitude 714ms buzz counts zero", () => {
  assert.equal(run(periodic({ ms: 300000, periodMs: 714, amp: 0.15 })), 0);
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
    det.process({ gravity: { x: G * Math.sin(t), y: 0, z: G * Math.cos(t) } }, i * SAMPLE_MS);
  }
  assert.equal(total, 0);
});

test("bouts shorter than the confirmation streak count zero", () => {
  let all = [];
  let t = 0;
  for (let i = 0; i < 20; i += 1) {
    all = all.concat(walk({ steps: 3, cadenceMs: 650, amp: 1.8, t0: t }));
    t += 3 * 650 + 4000;
  }
  assert.equal(run(all), 0);
});

test("bouts of five strides DO count — the confirmation steps are released", () => {
  let all = [];
  let t = 0;
  for (let i = 0; i < 20; i += 1) {
    all = all.concat(walk({ steps: 5, cadenceMs: 650, amp: 1.8, t0: t }));
    t += 5 * 650 + 4000;
  }
  const n = run(all);
  assert.ok(inBand(n), `20 five-stride bouts: expected 92-108 of 100, got ${n}`);
});

test("counting only begins after the confirmation streak", () => {
  assert.equal(run(walk({ steps: CONFIRM_STEPS - 1, cadenceMs: 650, amp: 1.8 })), 0);
});

test("walking, then stopping, then walking again counts both bouts", () => {
  const first = walk({ steps: 20, cadenceMs: 650, amp: 1.8 });
  const gapStart = first[first.length - 1].t + SAMPLE_MS;
  const gap = Array.from({ length: 200 }, (_, i) => ({ m: 0.2, t: gapStart + i * SAMPLE_MS }));
  const resumeAt = gap[gap.length - 1].t + SAMPLE_MS;
  const second = walk({ steps: 20, cadenceMs: 650, amp: 1.8, t0: resumeAt });
  assert.ok(run([...first, ...gap, ...second]) >= 30, "both bouts should count");
});

/* ---------------------------- the motion floor ---------------------------- */

test("a walk below the motion floor counts zero", () => {
  // DEV_ENTER is absolute on purpose. Amplitudes at or under 0.32 stay at zero
  // for every noise realisation tried.
  for (const seed of [1, 7, 13, 42, 99, 777, 1234, 31337]) {
    for (const amp of [0.25, 0.3, 0.32]) {
      assert.equal(run(walk({ steps: 100, cadenceMs: 650, amp, seed })), 0, `amp ${amp} seed ${seed}`);
    }
  }
});

test("CHARACTERISATION: amplitudes 0.34-0.40 straddle the motion floor", () => {
  /**
   * Not a guarantee — a description. In this band whether a walk counts depends
   * on the noise realisation, because the smoothed deviation lands within a few
   * percent of DEV_ENTER. Measured across seeds [1,7,13,42,99,777,1234,31337]:
   *   amp 0.34 -> 0 except seed 1234 (10)
   *   amp 0.38 -> 0 except seeds 777, 1234 (99, 99)
   *   amp 0.40 -> 0 for half the seeds, ~98 for the other half
   * The build spec asserted amp 0.40 == 0. That number came from a prototype
   * which updated the deviation against the ALREADY-UPDATED mean, making its
   * `dev` uniformly 1.5% smaller than the shipped baseline (which measures
   * against the pre-update mean, as v1 and v2 did and as the spec's
   * "do not regress the MAD baseline" rule requires). 0.40 is the one fixture
   * that sits inside that 1.5%, so it is the one number that moved. Asserting
   * it as a hard 0 would be asserting noise.
   * The floor still holds where it is load-bearing: <=0.32 is always 0, >=0.45
   * is always counted, and every non-walking negative above is unaffected.
   */
  assert.equal(run(walk({ steps: 100, cadenceMs: 650, amp: 0.34, seed: 42 })), 0);
  assert.equal(run(walk({ steps: 100, cadenceMs: 650, amp: 0.38, seed: 42 })), 0);
  assert.equal(run(walk({ steps: 100, cadenceMs: 650, amp: 0.4, seed: 42 })), 98);
});

/* ------------------- vehicles: a measured impossibility ------------------- */

/**
 * ⚠️ These are CHARACTERISATION tests, not passing assertions. They record what
 * the detector currently does so a future change cannot silently make it worse.
 * They are NOT targets, and driving them to zero is not achievable here:
 *
 * Measured: median peak-prominence/deviation is 2.50-3.16 for walking and
 * 2.81-2.87 for vehicle vibration; interval-CV is 0.022 for clean gait and
 * 0.018 for a drive. The distributions overlap completely. A DEV_ENTER of 0.14
 * keeps both a bag walk (99/100) and a drive (419); 0.20 kills both (0 and 0).
 * Sustained periodic motion inside the cadence band is not separable from
 * walking in the magnitude domain. The screen reports confidence instead of
 * pretending otherwise.
 */
const VEHICLES = [
  { name: "a 20-minute drive on an uneven road", opts: { ms: 1200000, periodMs: 714, amp: 0.6 }, counts: 1680 },
  { name: "five minutes of cycling", opts: { ms: 300000, periodMs: 750, amp: 0.9 }, counts: 400 },
  { name: "two minutes on a bus", opts: { ms: 120000, periodMs: 1250, amp: 0.7 }, counts: 96 },
];

for (const v of VEHICLES) {
  test(`CHARACTERISATION: ${v.name} counts ${v.counts} (not separable)`, () => {
    assert.equal(run(periodic(v.opts)), v.counts);
  });
}

/* ============================ ROBUSTNESS ============================ */

test("a NaN sample on both channels does not poison the session", () => {
  // v2 let one NaN reach the gravity EMA and counted 0 for the rest of the run.
  const clean = run(walk({ steps: 100, cadenceMs: 650, amp: 1.8 }));
  let total = 0;
  const det = createStepDetector((n) => {
    total += n;
  });
  walk({ steps: 100, cadenceMs: 650, amp: 1.8 }).forEach((s, i) => {
    if (i === 120) det.process({ linear: { x: NaN, y: NaN, z: NaN }, gravity: { x: NaN, y: 0, z: 0 } }, s.t);
    else det.process({ linear: { x: s.m, y: 0, z: 0 } }, s.t);
  });
  assert.ok(
    Math.abs(total - clean) <= clean * 0.08,
    `NaN run ${total} should be within 8% of clean ${clean}`,
  );
});

test("an epoch timestamp then a flood of frozen-clock samples stays bounded", () => {
  // The smoothing window is drained by TIME. When the clock stops advancing,
  // only WINDOW_MAX bounds it — without that splice this same flood takes 39s
  // (measured) instead of ~80ms, and the buffer grows to one entry per sample.
  const clean = run(walk({ steps: 100, cadenceMs: 650, amp: 1.8 }));
  let total = 0;
  const det = createStepDetector((n) => {
    total += n;
  });
  const samples = walk({ steps: 100, cadenceMs: 650, amp: 1.8 });
  const started = Date.now();
  samples.forEach((s, i) => {
    det.process({ linear: { x: s.m, y: 0, z: 0 } }, s.t);
    if (i === 500) {
      for (let k = 0; k < 300000; k += 1) det.process({ linear: { x: 1, y: 0, z: 0 } }, 1.7e12);
    }
  });
  const elapsed = Date.now() - started;
  assert.ok(elapsed < 5000, `flood took ${elapsed}ms — the window cap is gone`);
  assert.equal(total, clean, "the flood must not change the count");
});

test("a backwards clock is absorbed without counting", () => {
  let total = 0;
  const det = createStepDetector((n) => {
    total += n;
  });
  for (const s of walk({ steps: 20, cadenceMs: 650, amp: 1.8 })) {
    det.process({ linear: { x: s.m, y: 0, z: 0 } }, s.t);
  }
  const before = total;
  for (let i = 0; i < 200; i += 1) det.process({ linear: { x: 2, y: 0, z: 0 } }, 5000 - i * 20);
  assert.equal(total, before, "rewinding the clock must not award steps");
});

test("seconds-valued timestamps are reported, not counted", () => {
  const samples = walk({ steps: 40, cadenceMs: 650, amp: 1.8 }).map((s) => ({ m: s.m, t: s.t / 1000 }));
  const { seen, total } = withSnapshots(samples);
  assert.ok(seen.some((s) => s.clockSuspect), "clockSuspect should be raised");
  assert.equal(total, 0, "a clock this suspect must not produce a count");
});

test("millisecond timestamps are not flagged as suspect", () => {
  const { seen } = withSnapshots(walk({ steps: 40, cadenceMs: 650, amp: 1.8 }));
  assert.ok(!seen.some((s) => s.clockSuspect));
});

test("reset() returns the detector to a fresh session", () => {
  let total = 0;
  const det = createStepDetector((n) => {
    total += n;
  });
  const samples = walk({ steps: 100, cadenceMs: 650, amp: 1.8 });
  for (const s of samples.slice(0, 400)) det.process({ linear: { x: s.m, y: 0, z: 0 } }, s.t);
  const partial = total;
  assert.ok(partial > 0, "the first pass should have counted something");
  det.reset();
  for (const s of samples) det.process({ linear: { x: s.m, y: 0, z: 0 } }, s.t);
  assert.ok(inBand(total - partial), `after reset expected 92-108, got ${total - partial}`);
});

/* ========================= CHANNEL SELECTION ========================= */

test("an all-zero linear channel falls back to gravity and counts the walk", () => {
  // Some Android browsers report a structurally valid, permanently zero
  // `acceleration`. v2 checked `acc.x !== null`, which those devices pass, and
  // then counted zero forever.
  let total = 0;
  let channel = null;
  const det = createStepDetector(
    (n) => {
      total += n;
    },
    { onSnapshot: (s) => { channel = s.channel; } },
  );
  for (const s of walk({ steps: 100, cadenceMs: 650, amp: 3.0 })) {
    det.process({ linear: { x: 0, y: 0, z: 0 }, gravity: { x: 0, y: 0, z: 9.81 + s.m } }, s.t);
  }
  assert.equal(channel, "gravity");
  assert.ok(inBand(total), `gravity-path walk: expected 92-108 of 100, got ${total}`);
});

test("a live linear channel is kept and reported", () => {
  const { last } = withSnapshots(walk({ steps: 40, cadenceMs: 650, amp: 1.8 }));
  assert.equal(last.channel, "linear");
});

test("both channels flat reports dead-channel", () => {
  const samples = Array.from({ length: 400 }, (_, i) => ({
    sample: { linear: { x: 0, y: 0, z: 0 }, gravity: { x: 0, y: 0, z: 9.81 } },
    t: i * SAMPLE_MS,
  }));
  const { last, total } = withSnapshots(samples);
  assert.equal(last.phase, "dead-channel");
  assert.equal(total, 0);
});

/* ====================== SNAPSHOT CONTRACT (A6) ====================== */

test("the snapshot carries every key the UI contract promises", () => {
  const { seen, last } = withSnapshots(walk({ steps: 100, cadenceMs: 650, amp: 1.8 }));
  assert.ok(seen.length > 0, "snapshots should be emitted");

  for (const key of [
    "phase", "channel", "streak", "banked", "cadenceSpm",
    "cv", "promRatio", "vertRatio", "sampleHz", "confidence", "rejected",
  ]) {
    assert.ok(key in last, `snapshot is missing "${key}"`);
  }
  for (const key of ["tooFast", "tooSlow", "lowProminence", "harmonic", "clockJump"]) {
    assert.equal(typeof last.rejected[key], "number", `rejected.${key} should be a number`);
  }

  const PHASES = ["still", "sensing", "finding", "counting", "unsteady", "dead-channel"];
  for (const s of seen) {
    assert.ok(PHASES.includes(s.phase), `unexpected phase "${s.phase}"`);
    assert.ok(["linear", "gravity"].includes(s.channel));
    assert.ok(["good", "fair", "poor"].includes(s.confidence));
    // C sizes the pip row from CONFIRM_STEPS, so streak must never exceed it.
    assert.ok(s.streak >= 0 && s.streak <= CONFIRM_STEPS, `streak ${s.streak} out of range`);
  }
});

test("a clean walk moves sensing -> finding -> counting and reports good confidence", () => {
  const { seen, last } = withSnapshots(walk({ steps: 100, cadenceMs: 650, amp: 1.8 }));
  const order = [...new Set(seen.map((s) => s.phase))];
  assert.deepEqual(order, ["sensing", "finding", "counting"]);
  assert.equal(last.confidence, "good");
  assert.ok(last.cadenceSpm >= 85 && last.cadenceSpm <= 100, `cadence ${last.cadenceSpm} for a 650ms stride`);
  assert.ok(last.cv < 0.1, `clean gait CV should be small, got ${last.cv}`);
  assert.ok(last.sampleHz > 45 && last.sampleHz < 55, `sampleHz ${last.sampleHz} at 50Hz`);
});

test("snapshots are rate limited to ~250ms between phase changes", () => {
  const { seen } = withSnapshots(walk({ steps: 100, cadenceMs: 650, amp: 1.8 }));
  // 65 seconds of walking: a per-sample snapshot would be 3250.
  assert.ok(seen.length < 400, `expected a rate-limited stream, got ${seen.length}`);
});

test("a stationary phone reports still and counts nothing", () => {
  const samples = flat(Array.from({ length: 500 }, (_, i) => 0.25 + 0.2 * Math.sin(i)));
  const { last, total } = withSnapshots(samples);
  assert.equal(total, 0);
  assert.equal(last.phase, "still");
});

test("the unsteady phase is reachable — C renders a branch for it", () => {
  const { seen, total } = withSnapshots(walk({ steps: 80, cadenceMs: 650, amp: 1.8, cv: 0.7 }));
  assert.ok(seen.some((s) => s.phase === "unsteady"), "a badly jittered rhythm should report unsteady");
  assert.ok(total > 0, "unsteady banks steps, it must never zero the streak outright");
});

test("all three confidence buckets are reachable", () => {
  // good: a clean walk.
  const good = withSnapshots(walk({ steps: 60, cadenceMs: 650, amp: 1.8 }));
  assert.ok(good.seen.some((s) => s.confidence === "good"));

  // fair / poor: a phone lying flat, so the walking motion is perpendicular to
  // gravity and vertRatio collapses. This must LOWER confidence and still count
  // — a phone tumbling in a coat pocket produces real steps with poor alignment.
  const lateral = [];
  const rnd = mk(42);
  for (let i = 0; i < 80; i += 1) {
    for (let t = 0; t < 650; t += 1000 / 12) {
      const m =
        0.5 + 3.0 * Math.abs(Math.sin((Math.PI * t) / 650)) +
        0.9 * Math.abs(Math.sin((2 * Math.PI * t) / 650)) + rnd();
      lateral.push({ sample: { gravity: { x: m, y: 0, z: 9.81 } }, t: i * 650 + t });
    }
  }
  const { seen, total } = withSnapshots(lateral);
  assert.ok(seen.some((s) => s.confidence === "fair"), "lateral motion should read fair");
  assert.ok(seen.some((s) => s.confidence === "poor"), "lateral motion at 12Hz should read poor");
  assert.ok(total > 40, `poor alignment must still count steps, got ${total}`);
});

test("CHARACTERISATION: a drive reports counting/good — the strip cannot flag it", () => {
  /**
   * ⚠️ The build spec (§C4) claims the signal strip is "the honest answer to the
   * vehicle problem: a 20-minute drive now shows a visible 'Not a walking
   * rhythm'". Measured, it does not. Confidence is computed from interval-CV and
   * prominence/deviation — the same two statistics proven to overlap completely
   * between walking and vehicles — so a drive reads "Signal good, steady rhythm"
   * for essentially the whole trip. Non-separability applies to the REPORTING
   * as much as to the counting.
   *
   * This test exists so that claim cannot be quietly reintroduced as copy.
   * E's FAQ wording is the accurate one: a smooth, steady vibration CAN be
   * counted as steps, and the remedy offered is "Reset today".
   */
  const drive = periodic({ ms: 1200000, periodMs: 714, amp: 0.6 });
  const { seen, total } = withSnapshots(drive);
  const counting = seen.filter((s) => s.phase === "counting");
  assert.ok(counting.length / seen.length > 0.9, "a drive sits in the counting phase");
  assert.ok(counting.every((s) => s.confidence === "good"), "and reports good confidence throughout");
  assert.equal(total, 1680);
});

/* ========================= OPTS / SENSITIVITY ========================= */

test("High sensitivity lowers the floor without counting a still phone", () => {
  // D's Standard/High toggle passes exactly this through the opts contract.
  const high = { PEAK_K: 0.6, DEV_ENTER: 0.1, DEV_EXIT: 0.07 };
  assert.equal(run(walk({ steps: 100, cadenceMs: 650, amp: 0.3 })), 0, "standard leaves 0.3 uncounted");
  assert.ok(
    inBand(run(walk({ steps: 100, cadenceMs: 650, amp: 0.3 }), high)),
    "High should pick up a 0.3-amplitude walk",
  );
  assert.ok(inBand(run(walk({ steps: 100, cadenceMs: 650, amp: 1.8 }), high)), "High must not break normal walking");
  const still = flat(Array.from({ length: 500 }, (_, i) => 0.25 + 0.2 * Math.sin(i)));
  assert.equal(run(still, high), 0, "High must still count a stationary phone as zero");
});

test("opts can override the cadence gate", () => {
  // 250ms is rejected by the shipped MIN_STEP_MS and accepted when it is lowered
  // — this is the guard that documents why 200 was refused.
  const idle = periodic({ ms: 120000, periodMs: 250, amp: 0.6 });
  assert.equal(run(idle), 0);
  assert.ok(run(idle, { MIN_STEP_MS: 200 }) > 400, "MIN_STEP_MS 200 is why the spec settled on 280");
});
