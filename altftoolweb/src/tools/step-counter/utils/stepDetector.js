/**
 * stepDetector — real-pedometer step detection for the Step Counter.
 *
 * Pure, dependency-free module (no browser APIs) so the exact counting
 * behaviour is unit-testable in Node. The hook feeds it devicemotion
 * samples; it decides what is — and is not — a step.
 *
 * WHY THIS IS ADAPTIVE
 * The first version compared the smoothed signal against fixed thresholds:
 * fire above 1.5 m/s², re-arm below 0.8 m/s². That works on a synthetic
 * waveform whose valleys sit at a flat 0.15 — which is exactly what its unit
 * tests fed it — and fails on a real walk, where vertical acceleration is a
 * continuous oscillation that never settles anywhere near zero between
 * footfalls. Replaying realistic waveforms through the old code counted ZERO
 * steps for slow, brisk and pocket walking, and double-counted normal walking
 * off the second harmonic. Absolute thresholds are the wrong primitive: a peak
 * can be perfectly valid and still be too low for a fixed bar, and lowering the
 * bar turns noise into steps.
 *
 * So every decision here is made RELATIVE to the signal's own recent
 * statistics, which is what the step-counting literature converges on.
 *
 * Pipeline:
 *  1. LINEAR ACCELERATION — use the sensor's gravity-free reading when the
 *     device provides one; otherwise estimate gravity with a low-pass filter
 *     and subtract it. Slow tilts / orientation changes only shift the
 *     gravity estimate, so they never look like movement.
 *  2. TIME-BASED SMOOTHING — a moving average over a fixed number of
 *     MILLISECONDS, not samples. Sample rates vary from ~20 Hz on a
 *     mid-range Android to ~60 Hz on an iPhone; a fixed sample count is a
 *     different filter on every device.
 *  3. ADAPTIVE BASELINE — running estimates of the signal's mean and of its
 *     mean absolute deviation. Everything downstream is expressed in units of
 *     that deviation, so the same constants work whether the phone is loose in
 *     a hand or clamped in a pocket.
 *  4. RELATIVE HYSTERESIS — a candidate fires when the signal rises past
 *     mean + PEAK_K·dev, and re-arms only after falling back under
 *     mean + VALLEY_K·dev. Because the bar tracks the signal, a real walk
 *     re-arms every stride instead of latching after the first one.
 *  5. MOTION GATE — if the deviation itself is tiny the device is not moving,
 *     whatever the mean is. A phone on a desk has a baseline too; without this
 *     the adaptive bar would happily find "peaks" in sensor noise.
 *  6. CADENCE GATE — peaks closer than MIN_STEP_MS or further apart than
 *     MAX_STEP_MS are not a walking rhythm. The floor is set above the second
 *     harmonic of normal walking, which is what made the old detector report
 *     200% of the real count.
 *  7. RHYTHM CONFIRMATION — nothing counts until CONFIRM_STEPS peaks arrive in
 *     valid cadence. The first few are banked and released together, so an
 *     isolated bump, a picked-up phone or a single knock counts ZERO.
 *
 * Net behaviour: stationary phone → 0. Taps and scrolls → 0. Single jolts → 0.
 * Sustained rhythmic walking → counted, including the confirmation steps.
 */

/* ------------------------------- tunables ------------------------------- */

export const GRAVITY_ALPHA = 0.92; // low-pass factor for the gravity estimate
export const SMOOTH_MS = 80; // moving-average width in milliseconds
export const BASELINE_ALPHA = 0.985; // EMA factor for the mean / deviation
export const PEAK_K = 0.75; // rise this many deviations above the mean to fire
export const VALLEY_K = 0.0; // fall back to the baseline to re-arm
export const MIN_DEV = 0.14; // m/s² — below this the device is not moving
export const MIN_STEP_MS = 340; // above the 2nd harmonic of a normal stride
export const MAX_STEP_MS = 1600; // slower than this is not a walking rhythm
export const CONFIRM_STEPS = 4; // rhythmic peaks required before counting
export const RESET_GAP_MS = 2500; // silence this long discards banked candidates

/**
 * @param {(steps: number) => void} onSteps — called with the number of newly
 *   confirmed steps (1 normally; CONFIRM_STEPS when a fresh rhythm confirms
 *   and the banked steps are released together).
 */
export function createStepDetector(onSteps) {
  let gravity = null; // running gravity estimate {x,y,z}
  let window = []; // smoothing buffer of {mag, at}
  let mean = null; // adaptive baseline
  let dev = null; // adaptive mean-absolute-deviation
  let armed = true; // hysteresis: ready to fire on the next peak
  let lastPeakAt = 0; // timestamp of the previous accepted peak
  let streak = 0; // consecutive rhythm-valid peaks
  let banked = 0; // steps held back until the rhythm is confirmed

  /**
   * Feed one devicemotion sample.
   * @param {{linear?: {x,y,z}, gravity?: {x,y,z}}} sample — pass `linear`
   *   (event.acceleration) when available, else `gravity`
   *   (event.accelerationIncludingGravity).
   * @param {number} now — monotonic timestamp in ms (event.timeStamp).
   */
  function process(sample, now) {
    let ax;
    let ay;
    let az;

    if (sample.linear) {
      ({ x: ax, y: ay, z: az } = sample.linear);
    } else if (sample.gravity) {
      const g = sample.gravity;
      if (!gravity) {
        // First sample primes the gravity estimate — never counts.
        gravity = { x: g.x, y: g.y, z: g.z };
        return;
      }
      gravity.x = GRAVITY_ALPHA * gravity.x + (1 - GRAVITY_ALPHA) * g.x;
      gravity.y = GRAVITY_ALPHA * gravity.y + (1 - GRAVITY_ALPHA) * g.y;
      gravity.z = GRAVITY_ALPHA * gravity.z + (1 - GRAVITY_ALPHA) * g.z;
      ax = g.x - gravity.x;
      ay = g.y - gravity.y;
      az = g.z - gravity.z;
    } else {
      return;
    }

    if (!Number.isFinite(ax) || !Number.isFinite(ay) || !Number.isFinite(az)) {
      return;
    }

    // 2) smooth over a fixed time span, so the filter is the same on a 20 Hz
    //    Android and a 60 Hz iPhone.
    const mag = Math.sqrt(ax * ax + ay * ay + az * az);
    window.push({ mag, at: now });
    while (window.length > 1 && now - window[0].at > SMOOTH_MS) window.shift();
    let sum = 0;
    for (const s of window) sum += s.mag;
    const smooth = sum / window.length;

    // 3) adaptive baseline — what "normal" looks like for this device, right now
    if (mean === null) {
      mean = smooth;
      dev = 0;
      return;
    }
    const spread = Math.abs(smooth - mean);
    mean = BASELINE_ALPHA * mean + (1 - BASELINE_ALPHA) * smooth;
    dev = BASELINE_ALPHA * dev + (1 - BASELINE_ALPHA) * spread;

    // 7b) long silence → any unconfirmed rhythm is stale
    if (lastPeakAt && now - lastPeakAt > RESET_GAP_MS) {
      streak = 0;
      banked = 0;
    }

    // 5) a still device has a baseline too; only its deviation gives it away
    if (dev < MIN_DEV) {
      armed = true;
      return;
    }

    const high = mean + PEAK_K * dev;
    const low = mean + VALLEY_K * dev;

    // 4) relative hysteresis peak detection
    if (armed && smooth >= high) {
      armed = false;
      const dt = lastPeakAt ? now - lastPeakAt : Infinity;

      if (dt < MIN_STEP_MS) {
        // Faster than a stride — a harmonic, or vibration. Not a step, and not
        // a walking rhythm either: reset. Leaving lastPeakAt alone here let a
        // steady oscillation alias through, because the NEXT peak was then
        // measured from the older reference and every second or third one
        // landed inside the valid cadence window. A 5-30Hz buzz counted as a
        // brisk walk that way.
        lastPeakAt = now;
        streak = 0;
        banked = 0;
        return;
      }

      if (dt <= MAX_STEP_MS) {
        streak += 1; // continues the rhythm
      } else {
        streak = 1; // too long since the last peak — new rhythm attempt
        banked = 0;
      }
      lastPeakAt = now;

      if (streak >= CONFIRM_STEPS) {
        // Confirmed walking — release anything banked plus this step.
        const award = banked + 1;
        banked = 0;
        onSteps(award);
      } else {
        banked += 1;
      }
    } else if (!armed && smooth <= low) {
      armed = true; // fell back toward the baseline — ready for the next peak
    }
  }

  /** Drop all internal state (fresh session). */
  function reset() {
    gravity = null;
    window = [];
    mean = null;
    dev = null;
    armed = true;
    lastPeakAt = 0;
    streak = 0;
    banked = 0;
  }

  return { process, reset };
}
