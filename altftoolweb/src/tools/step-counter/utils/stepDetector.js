/**
 * stepDetector — real-pedometer step detection for the Step Counter (v3).
 *
 * Pure, dependency-free module (no browser APIs, no clock reads — `now` is a
 * parameter) so the exact counting behaviour is unit-testable in Node. The hook
 * feeds it devicemotion samples; it decides what is — and is not — a step.
 *
 * WHAT ADAPTS, AND WHAT DOES NOT
 * Adaptive: the amplitude of the signal (every peak decision is expressed in
 * units of the signal's own mean-absolute-deviation, and every prominence
 * decision is expressed against the median prominence of the peaks already
 * accepted) and the sample rate (smoothing is a span in milliseconds, so the
 * filter is identical at 10 Hz and 200 Hz).
 * Fixed, by design: the cadence band (MIN_STEP_MS..MAX_STEP_MS), the motion
 * floor (DEV_ENTER/DEV_EXIT), and the confirmation length (CONFIRM_STEPS).
 * Those three are what stop the adaptive parts from adapting their way into
 * counting noise, and they are absolute on purpose.
 *
 * There is no mounting-independence claim here. A phone in a padded bag
 * produces a smaller signal than one in a hand, and below the motion floor it
 * is not counted at all (measured: amplitude 0.45 counts 99 of 100, amplitude
 * 0.40 counts 0). That floor is a deliberate trade, not a property that holds
 * everywhere.
 *
 * WHY EVERY THRESHOLD IS RELATIVE
 * The first version compared the smoothed signal against fixed absolute
 * thresholds: fire above 1.5 m/s², re-arm below 0.8 m/s². That works on a
 * synthetic waveform whose valleys sit at a flat 0.15 — which is exactly what
 * its unit tests fed it — and fails on a real walk, where vertical acceleration
 * is a continuous oscillation that never settles near zero between footfalls.
 * Replaying realistic waveforms through it counted ZERO steps for slow, brisk
 * and pocket walking, and double-counted normal walking off the second
 * harmonic. Do not regress to absolute thresholds.
 *
 * Pipeline:
 *  1. CHANNEL ON EVIDENCE — prefer the sensor's gravity-free reading, but only
 *     after proving it carries signal. Some Android browsers report a
 *     structurally valid all-zero `acceleration` forever; probing for the first
 *     second (and 40 samples) and switching permanently to the
 *     gravity-minus-lowpass path when the linear channel is flat is what keeps
 *     those devices from counting zero all day.
 *  2. TIME-BASED SMOOTHING — a moving average over a fixed number of
 *     MILLISECONDS, not samples.
 *  3. ADAPTIVE BASELINE — running mean and mean-absolute-deviation.
 *  4. HYSTERETIC MOTION GATE — motion starts at dev >= DEV_ENTER and only stops
 *     after dev stays under DEV_EXIT for DEV_EXIT_MS. A single gate with one
 *     threshold re-armed mid-stride on quiet walking and threw the count away;
 *     that is the mechanism of the old amplitude-0.45 collapse (6 of 100).
 *  5. RELATIVE HYSTERESIS — a candidate fires above mean + PEAK_K·dev and
 *     re-arms below mean + VALLEY_K·dev.
 *  6. PROMINENCE — a candidate must clear its own preceding valley by at least
 *     PROM_FLOOR_DEV·dev, and (once four peaks are on record) by at least
 *     PROM_K of the median prominence so far. This is what fixes the harmonic
 *     collapse: a strong within-stride second harmonic used to tear the streak
 *     down (harmonic 0.9/1.0 counted 15 and 7 of 100; they now count 100/100).
 *     A rejected peak re-anchors `lastPeakAt` and the valley but deliberately
 *     does NOT reset `streak`/`banked` — the teardown was the bug.
 *  7. CADENCE GATE — peaks closer than MIN_STEP_MS or further apart than
 *     MAX_STEP_MS are not a walking rhythm.
 *  8. RHYTHM CONFIRMATION — nothing counts until CONFIRM_STEPS peaks arrive in
 *     valid cadence, and at that point only if the interval CV is at or under
 *     CV_MAX. An excursion banks; it never zeroes the streak.
 *
 * MEASURED LIMIT — SUSTAINED PERIODIC MOTION IS NOT SEPARABLE
 * Measured: median peak-prominence/deviation is 2.50–3.16 for walking and
 * 2.81–2.87 for vehicle vibration; interval-CV is 0.022 for clean gait and
 * 0.018 for a drive. The distributions overlap completely. A DEV_ENTER of 0.14
 * keeps both a bag walk (99/100) and a drive (419); 0.20 kills both (0 and 0).
 * Sustained periodic motion inside the cadence band is not separable from
 * walking in the magnitude domain.
 *
 * The same overlap applies to the REPORTING, which is easy to miss. Confidence
 * below is computed from interval-CV and prominence/deviation — the very two
 * statistics that overlap — so a drive reports phase "counting" at "good"
 * confidence for 99.7% of a 20-minute trip (measured). The signal strip cannot
 * flag a vehicle either. Do not write copy promising that it does; the honest
 * disclosure is that a smooth, steady vibration can be counted as steps.
 *
 * THE BASELINE UPDATE ORDER IS LOAD-BEARING. `dev` accumulates the spread
 * measured against the PRE-update mean, as v1 and v2 did. Measuring against the
 * post-update mean instead shrinks `dev` by exactly BASELINE_ALPHA (1.5%),
 * because smooth - mean_new === BASELINE_ALPHA * (smooth - mean_old). That is
 * enough to move fixtures sitting within 1.5% of DEV_ENTER — a 0.40-amplitude
 * walk flips between 0 and 98. Do not "tidy" these three lines into one.
 *
 * REFUSED: A CV FLOOR. Rejecting rhythms that are "too regular to be human"
 * would look like it separates vehicles, and does not — clean gait measures
 * CV 0.022, below any floor a drive (0.018) would fail. It would reject
 * treadmill walking, which is the most regular real walking there is. Not
 * implemented, on purpose.
 *
 * THE 280 ms TRADE. MIN_STEP_MS moved 340 → 280 so running counts to about 214
 * steps per minute (180/190/200 spm measured 98/97/98 of 100, against 9/0/0
 * before). The cost is real: a 280–340 ms vibration the old floor rejected can
 * now be counted. 200 ms was rejected for exactly this reason — it lets a
 * 250 ms engine idle count 475 steps, where 280 ms counts 0.
 *
 * Net behaviour: stationary phone → 0. Taps and scrolls → 0. Single jolts → 0.
 * Bouts shorter than CONFIRM_STEPS → 0. Sustained rhythmic walking → counted,
 * including the confirmation steps.
 */

/* ------------------------------- tunables ------------------------------- */

export const GRAVITY_ALPHA = 0.92; // low-pass factor for the gravity estimate
export const SMOOTH_MS = 80; // moving-average width in milliseconds
export const BASELINE_ALPHA = 0.985; // EMA factor for the mean / deviation
export const PEAK_K = 0.75; // rise this many deviations above the mean to fire
export const VALLEY_K = 0.0; // fall back to the baseline to re-arm
export const DEV_ENTER = 0.14; // deviation at which the device counts as moving
export const DEV_EXIT = 0.09; // deviation under which it may stop moving
export const DEV_EXIT_MS = 600; // ...after this long continuously under DEV_EXIT
export const MIN_STEP_MS = 280; // ~214 spm ceiling; NOT 200 (engine idle counts)
export const MAX_STEP_MS = 1600; // slower than this is not a walking rhythm
export const CONFIRM_STEPS = 4; // rhythmic peaks required before counting
export const RESET_GAP_MS = 2500; // silence this long discards banked candidates
export const PROM_FLOOR_DEV = 1.2; // a peak must clear its valley by this × dev
export const PROM_K = 0.55; // ...and by this share of the median prominence
export const PROM_RING = 8; // prominence history depth (consulted after 4)
export const CV_MAX = 0.32; // interval CV over the last 6 accepted intervals

/* ------------------------- non-tunable internals ------------------------- */

const WINDOW_MAX = 64; // hard cap on the smoothing buffer
const IVAL_RING = 6; // intervals used for the CV
const VERT_RING = 4; // vertical-alignment history, confidence only
const DELTA_RING = 16; // inter-sample gaps, for sampleHz
const SNAPSHOT_MS = 250; // snapshot rate limit
const CLOCK_JUMP_MS = 5000; // forward gap treated as a discontinuity
const PROBE_MS = 1000; // linear-channel probe span...
const PROBE_SAMPLES = 40; // ...and sample count; whichever is later
const LINEAR_FLAT = 0.05; // max |linear| under which the channel is dead
const GRAVITY_FLAT_DEV = 0.02; // |gravity| deviation under which nothing is live
const GRAVITY_FLAT_MS = 2000; // ...sustained this long
const CLOCK_SUSPECT_MS = 1; // median gap under this ⇒ caller passed seconds
const CONF_CV = 0.22; // confidence penalties
const CONF_PROM = 1.6;
const CONF_VERT = 0.45;
const CONF_HZ = 15;

function finiteVec(v) {
  if (!v) return null;
  return Number.isFinite(v.x) && Number.isFinite(v.y) && Number.isFinite(v.z)
    ? v
    : null;
}

function median(a) {
  if (!a.length) return 0;
  const b = [...a].sort((x, y) => x - y);
  const h = b.length >> 1;
  return b.length % 2 ? b[h] : (b[h - 1] + b[h]) / 2;
}

function coefVar(a) {
  if (a.length < 3) return null;
  let sum = 0;
  for (const v of a) sum += v;
  const mu = sum / a.length;
  if (!mu) return null;
  let sq = 0;
  for (const v of a) sq += (v - mu) * (v - mu);
  return Math.sqrt(sq / a.length) / mu;
}

/**
 * @param {(steps: number) => void} onSteps — called with the number of newly
 *   confirmed steps (1 normally; CONFIRM_STEPS when a fresh rhythm confirms and
 *   the banked steps are released together).
 * @param {object} [opts] — may override any exported tunable above, and may
 *   supply `onSnapshot(snap)` (see the snapshot contract below).
 */
export function createStepDetector(onSteps, opts = {}) {
  const C = {
    GRAVITY_ALPHA,
    SMOOTH_MS,
    BASELINE_ALPHA,
    PEAK_K,
    VALLEY_K,
    DEV_ENTER,
    DEV_EXIT,
    DEV_EXIT_MS,
    MIN_STEP_MS,
    MAX_STEP_MS,
    CONFIRM_STEPS,
    RESET_GAP_MS,
    PROM_FLOOR_DEV,
    PROM_K,
    PROM_RING,
    CV_MAX,
    ...opts,
  };
  const onSnapshot = typeof opts.onSnapshot === "function" ? opts.onSnapshot : null;

  /* ------------------------------- state ------------------------------- */

  let gravity = null; // running gravity estimate {x,y,z}
  let win = []; // smoothing buffer of {mag, at}
  let mean = null; // adaptive baseline
  let dev = null; // adaptive mean-absolute-deviation
  let armed = true; // hysteresis: ready to fire on the next peak
  let moving = false; // hysteretic motion gate
  let lowDevSince = 0; // when the deviation first dropped under DEV_EXIT
  let lastPeakAt = 0; // timestamp of the previous accepted peak
  let lastSampleAt = null;
  let streak = 0; // consecutive rhythm-valid peaks
  let banked = 0; // steps held back until the rhythm is confirmed
  let unsteady = false; // streak is long enough but the CV is not
  let valleyMin = Infinity; // lowest smoothed value since the last accepted peak
  let promRing = []; // prominences of accepted peaks
  let ratioRing = []; // their prom/dev, for confidence
  let ivals = []; // intervals between accepted peaks
  let vertRing = []; // vertical alignment at accepted peaks
  let deltas = []; // inter-sample gaps
  let vertNow = null;

  let useGravity = false; // locked channel decision
  let channelLocked = false;
  let channel = "linear"; // what the last sample actually used
  let probeStart = null;
  let probeSamples = 0;
  let linMax = 0;
  let linSeen = 0;
  let gravitySince = null; // when the gravity channel took over
  let gMean = null; // baseline of the RAW |gravity|, for dead-channel
  let gDev = null;
  let dead = false;
  let clockSuspect = false;

  let lastPhase = null;
  let lastSuspect = false;
  let lastSnapAt = null;
  const rejected = {
    tooFast: 0,
    tooSlow: 0,
    lowProminence: 0,
    harmonic: 0,
    clockJump: 0,
  };

  /** Drops the DSP state but keeps the channel decision and the counters. */
  function dropSignalState() {
    win = [];
    mean = null;
    dev = null;
    armed = true;
    moving = false;
    lowDevSince = 0;
    lastPeakAt = 0;
    streak = 0;
    banked = 0;
    unsteady = false;
    valleyMin = Infinity;
    promRing = [];
    ratioRing = [];
    ivals = [];
  }

  /* ----------------------------- reporting ----------------------------- */

  function cadenceSpm() {
    if (ivals.length < 2) return null;
    let s = 0;
    for (const v of ivals) s += v;
    const mu = s / ivals.length;
    return mu > 0 ? Math.round(60000 / mu) : null;
  }

  function sampleHz() {
    if (deltas.length < 4) return null;
    const m = median(deltas);
    return m > 0 ? 1000 / m : null;
  }

  function promRatio() {
    return ratioRing.length ? median(ratioRing) : null;
  }

  function vertRatio() {
    return vertRing.length ? vertRing[vertRing.length - 1] : null;
  }

  function phaseOf() {
    if (dead) return "dead-channel";
    if (!channelLocked || mean === null) return "sensing";
    if (!moving) return "still";
    if (streak >= C.CONFIRM_STEPS) return unsteady ? "unsteady" : "counting";
    return "finding";
  }

  function confidenceOf() {
    let score = 100;
    const cv = coefVar(ivals);
    const pr = promRatio();
    const hz = sampleHz();
    if (cv !== null && cv > CONF_CV) score -= 25;
    if (pr !== null && pr < CONF_PROM) score -= 25;
    let poorVert = 0;
    for (const v of vertRing) if (v < CONF_VERT) poorVert += 1;
    if (poorVert >= 2) score -= 20;
    if (hz !== null && hz < CONF_HZ) score -= 20;
    if (channel === "gravity") score -= 10;
    if (score >= 75) return "good";
    return score >= 45 ? "fair" : "poor";
  }

  /**
   * ⚠️ CONTRACT — snapshot shape. Fires at most every SNAPSHOT_MS and on every
   * phase change. Extra keys beyond the documented set are additive.
   */
  function emit(now) {
    if (!onSnapshot) return;
    const phase = phaseOf();
    // clockSuspect must force a snapshot: a caller passing seconds never
    // advances `now` far enough to trip the rate limit or the channel probe, so
    // without this the UI would sit on one "sensing" snapshot forever with no
    // indication that the timestamps are the problem.
    if (
      phase !== lastPhase ||
      clockSuspect !== lastSuspect ||
      lastSnapAt === null ||
      now - lastSnapAt >= SNAPSHOT_MS
    ) {
      lastPhase = phase;
      lastSuspect = clockSuspect;
      lastSnapAt = now;
      onSnapshot({
        phase,
        channel,
        streak: Math.min(streak, C.CONFIRM_STEPS),
        banked,
        cadenceSpm: cadenceSpm(),
        cv: coefVar(ivals),
        promRatio: promRatio(),
        vertRatio: vertRatio(),
        sampleHz: sampleHz(),
        confidence: confidenceOf(),
        clockSuspect,
        rejected: { ...rejected },
      });
    }
  }

  /* ------------------------------ pipeline ------------------------------ */

  function core(sample, now) {
    if (!sample || !Number.isFinite(now)) return;

    // A4 — finiteness first, before anything stateful. One NaN reaching the
    // gravity EMA used to poison it for the whole session (33 → 0).
    const lin = finiteVec(sample.linear);
    const grav = finiteVec(sample.gravity);
    if (!lin && !grav) return;

    // A4 — discontinuity. Keep mean/dev/gravity; drop the rhythm.
    if (lastSampleAt !== null) {
      const gap = now - lastSampleAt;
      if (gap < 0 || gap > CLOCK_JUMP_MS) {
        win = [];
        streak = 0;
        banked = 0;
        unsteady = false;
        lastPeakAt = 0;
        ivals = [];
        promRing = [];
        ratioRing = [];
        valleyMin = Infinity;
        rejected.clockJump += 1;
      } else if (gap > 0) {
        deltas.push(gap);
        if (deltas.length > DELTA_RING) deltas.shift();
        if (!clockSuspect && deltas.length >= 8 && median(deltas) < CLOCK_SUSPECT_MS) {
          clockSuspect = true;
        }
      }
    }
    lastSampleAt = now;

    // A4 — channel selection on evidence.
    probeSamples += 1;
    if (!channelLocked) {
      if (probeStart === null) probeStart = now;
      if (lin) {
        linSeen += 1;
        const m = Math.hypot(lin.x, lin.y, lin.z);
        if (m > linMax) linMax = m;
      }
      if (probeSamples >= PROBE_SAMPLES && now - probeStart >= PROBE_MS) {
        channelLocked = true;
        if (linMax < LINEAR_FLAT) {
          useGravity = true;
          gravitySince = now;
          // Only throw the baseline away if flat linear samples actually fed it.
          if (linSeen > 0) dropSignalState();
        }
      }
    }

    let ax;
    let ay;
    let az;
    if (!useGravity && lin) {
      ({ x: ax, y: ay, z: az } = lin);
      channel = "linear";
    } else if (grav) {
      channel = "gravity";
      if (gravitySince === null) gravitySince = now;
      const gm = Math.hypot(grav.x, grav.y, grav.z);
      if (gMean === null) {
        gMean = gm;
        gDev = 0;
      } else {
        const spread = Math.abs(gm - gMean);
        gMean = C.BASELINE_ALPHA * gMean + (1 - C.BASELINE_ALPHA) * gm;
        gDev = C.BASELINE_ALPHA * gDev + (1 - C.BASELINE_ALPHA) * spread;
      }
      if (!gravity) {
        // First sample primes the gravity estimate — never counts.
        gravity = { x: grav.x, y: grav.y, z: grav.z };
        return;
      }
      const a = C.GRAVITY_ALPHA;
      gravity.x = a * gravity.x + (1 - a) * grav.x;
      gravity.y = a * gravity.y + (1 - a) * grav.y;
      gravity.z = a * gravity.z + (1 - a) * grav.z;
      ax = grav.x - gravity.x;
      ay = grav.y - gravity.y;
      az = grav.z - gravity.z;
      dead =
        useGravity &&
        gDev < GRAVITY_FLAT_DEV &&
        now - gravitySince >= GRAVITY_FLAT_MS;
    } else if (lin) {
      ({ x: ax, y: ay, z: az } = lin);
      channel = "linear";
    } else {
      return;
    }

    // Vertical alignment — confidence only, never a hard reject. A phone
    // tumbling in a coat pocket produces real steps with poor alignment.
    const gref = grav || gravity;
    const amag = Math.hypot(ax, ay, az);
    if (gref) {
      const gl = Math.hypot(gref.x, gref.y, gref.z);
      vertNow =
        gl > 1e-3 && amag > 1e-3
          ? Math.min(1, Math.abs((ax * gref.x + ay * gref.y + az * gref.z) / gl) / amag)
          : null;
    } else {
      vertNow = null;
    }

    // 2) smooth over a fixed time span, so the filter is the same on a 20 Hz
    //    Android and a 60 Hz iPhone.
    win.push({ mag: amag, at: now });
    while (win.length > 1 && (now - win[0].at > C.SMOOTH_MS || win[0].at > now)) {
      win.shift();
    }
    if (win.length > WINDOW_MAX) win.splice(0, win.length - WINDOW_MAX);
    let sum = 0;
    for (const s of win) sum += s.mag;
    const smooth = sum / win.length;

    // 3) adaptive baseline — what "normal" looks like for this device, right now
    if (mean === null) {
      mean = smooth;
      dev = 0;
      return;
    }
    const spread = Math.abs(smooth - mean);
    mean = C.BASELINE_ALPHA * mean + (1 - C.BASELINE_ALPHA) * smooth;
    dev = C.BASELINE_ALPHA * dev + (1 - C.BASELINE_ALPHA) * spread;

    // 8b) long silence → any unconfirmed rhythm is stale
    if (lastPeakAt && now - lastPeakAt > C.RESET_GAP_MS) {
      streak = 0;
      banked = 0;
      unsteady = false;
      promRing = [];
      ratioRing = [];
      ivals = [];
    }

    if (smooth < valleyMin) valleyMin = smooth;

    // 4) hysteretic motion gate. Between the two thresholds we KEEP PROCESSING;
    //    a single-threshold gate re-armed mid-stride on quiet walking.
    if (dev >= C.DEV_ENTER) {
      moving = true;
      lowDevSince = 0;
    } else if (dev < C.DEV_EXIT) {
      if (!lowDevSince) lowDevSince = now;
      if (now - lowDevSince >= C.DEV_EXIT_MS) {
        moving = false;
        armed = true;
        return; // baseline and bank are deliberately kept
      }
    }
    if (!moving) return;

    const high = mean + C.PEAK_K * dev;
    const low = mean + C.VALLEY_K * dev;

    // 5) relative hysteresis peak detection
    if (armed && smooth >= high) {
      armed = false;
      const prom = smooth - valleyMin;
      const dt = lastPeakAt ? now - lastPeakAt : Infinity;

      // Every reject below re-anchors lastPeakAt (load-bearing against
      // aliasing: leaving it alone let a steady buzz measure the NEXT peak from
      // an older reference and land inside the cadence window) and re-anchors
      // the valley — but leaves streak and banked ALONE. Tearing those down was
      // the harmonic bug.
      if (dt < C.MIN_STEP_MS) {
        rejected.tooFast += 1;
        lastPeakAt = now;
        valleyMin = smooth;
        return;
      }
      if (prom < C.PROM_FLOOR_DEV * dev) {
        rejected.lowProminence += 1;
        lastPeakAt = now;
        valleyMin = smooth;
        return;
      }
      if (promRing.length >= 4 && prom < C.PROM_K * median(promRing)) {
        rejected.harmonic += 1;
        lastPeakAt = now;
        valleyMin = smooth;
        return;
      }
      valleyMin = smooth;

      if (dt <= C.MAX_STEP_MS) {
        streak += 1; // continues the rhythm
        ivals.push(dt);
        if (ivals.length > IVAL_RING) ivals.shift();
      } else {
        if (Number.isFinite(dt)) rejected.tooSlow += 1;
        streak = 1; // too long since the last peak — new rhythm attempt
        banked = 0;
        unsteady = false;
        ivals = [];
      }
      lastPeakAt = now;

      promRing.push(prom);
      if (promRing.length > C.PROM_RING) promRing.shift();
      if (dev > 0) {
        ratioRing.push(prom / dev);
        if (ratioRing.length > C.PROM_RING) ratioRing.shift();
      }
      if (vertNow !== null) {
        vertRing.push(vertNow);
        if (vertRing.length > VERT_RING) vertRing.shift();
      }

      if (streak >= C.CONFIRM_STEPS) {
        const cv = coefVar(ivals);
        if (cv === null || cv <= C.CV_MAX) {
          // Confirmed walking — release anything banked plus this step.
          unsteady = false;
          const award = banked + 1;
          banked = 0;
          onSteps(award);
        } else {
          // Not a walking rhythm. Bank it; never zero the streak on a CV
          // excursion — the rhythm may be one stride from settling.
          unsteady = true;
          banked += 1;
        }
      } else {
        banked += 1;
      }
    } else if (!armed && smooth <= low) {
      armed = true; // fell back toward the baseline — ready for the next peak
    }
  }

  /**
   * Feed one devicemotion sample.
   * @param {{linear?: {x,y,z}, gravity?: {x,y,z}}} sample — pass BOTH when the
   *   device supplies both; this module picks the channel, not the caller.
   * @param {number} now — monotonic timestamp in milliseconds.
   */
  function process(sample, now) {
    core(sample, now);
    if (Number.isFinite(now)) emit(now);
  }

  /** Drop all internal state (fresh session). */
  function reset() {
    gravity = null;
    dropSignalState();
    vertRing = [];
    deltas = [];
    vertNow = null;
    lastSampleAt = null;
    useGravity = false;
    channelLocked = false;
    channel = "linear";
    probeStart = null;
    probeSamples = 0;
    linMax = 0;
    linSeen = 0;
    gravitySince = null;
    gMean = null;
    gDev = null;
    dead = false;
    clockSuspect = false;
    lastPhase = null;
    lastSuspect = false;
    lastSnapAt = null;
    rejected.tooFast = 0;
    rejected.tooSlow = 0;
    rejected.lowProminence = 0;
    rejected.harmonic = 0;
    rejected.clockJump = 0;
  }

  return { process, reset };
}
