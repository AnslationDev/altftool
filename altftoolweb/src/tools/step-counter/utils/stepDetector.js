/**
 * stepDetector — real-pedometer step detection for the Step Counter.
 *
 * Pure, dependency-free module (no browser APIs) so the exact counting
 * behaviour is unit-testable in Node. The hook feeds it devicemotion
 * samples; it decides what is — and is not — a step.
 *
 * Pipeline (what real pedometers do, simplified):
 *  1. LINEAR ACCELERATION — use the sensor's gravity-free reading when the
 *     device provides one; otherwise estimate gravity with a low-pass filter
 *     and subtract it. Slow tilts / orientation changes only shift the
 *     gravity estimate, so they never look like movement.
 *  2. SMOOTHING — a short moving average kills high-frequency jitter and
 *     buzzy vibrations (phone on a desk next to a speaker, haptics, taps).
 *  3. HYSTERESIS PEAK DETECTION — a step candidate fires only when the
 *     smoothed signal rises above PEAK_THRESHOLD *and* has first fallen
 *     below VALLEY_THRESHOLD since the previous peak. One sustained shake
 *     can't machine-gun the counter.
 *  4. CADENCE GATE — peaks closer together than MIN_STEP_MS (impossible to
 *     walk that fast) are discarded as noise; peaks further apart than
 *     MAX_STEP_MS don't continue a rhythm, they start a new attempt.
 *  5. RHYTHM CONFIRMATION — nothing is counted until CONFIRM_STEPS peaks
 *     arrive in valid walking cadence. The first few steps are "banked" and
 *     released together once the rhythm is confirmed, so an isolated bump,
 *     a picked-up phone or a single knock counts ZERO. Long silence clears
 *     any banked candidates.
 *
 * Net behaviour: stationary phone → 0. Touches/scrolls/taps → 0 (they don't
 * produce rhythmic whole-device acceleration). Single jolts → 0. Sustained
 * rhythmic walking → counted, including the confirmation steps.
 */

/* ------------------------------- tunables ------------------------------- */
/* Calibrated for typical hand-held / pocket walking at ~50–60Hz samples.
   If field testing shows over/under-counting, adjust PEAK_THRESHOLD first. */

export const GRAVITY_ALPHA = 0.92; // low-pass factor for the gravity estimate
export const SMOOTH_WINDOW = 4; // moving-average length (samples)
export const PEAK_THRESHOLD = 1.5; // m/s² — smoothed magnitude that marks a step peak
export const VALLEY_THRESHOLD = 0.8; // m/s² — must dip below this to re-arm
export const MIN_STEP_MS = 280; // faster than ~3.5 steps/s is noise, not walking
export const MAX_STEP_MS = 2000; // slower than 0.5 steps/s breaks the rhythm
export const CONFIRM_STEPS = 4; // rhythmic peaks required before counting starts
export const RESET_GAP_MS = 2500; // silence this long discards banked candidates

/**
 * @param {(steps: number) => void} onSteps — called with the number of newly
 *   confirmed steps (1 normally; CONFIRM_STEPS when a fresh rhythm confirms
 *   and the banked steps are released together).
 */
export function createStepDetector(onSteps) {
  let gravity = null; // running gravity estimate {x,y,z}
  let window = []; // smoothing buffer of magnitudes
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

    // 2) smooth the magnitude
    const mag = Math.sqrt(ax * ax + ay * ay + az * az);
    window.push(mag);
    if (window.length > SMOOTH_WINDOW) window.shift();
    let sum = 0;
    for (const v of window) sum += v;
    const smooth = sum / window.length;

    // 5b) long silence → any unconfirmed rhythm is stale
    if (lastPeakAt && now - lastPeakAt > RESET_GAP_MS) {
      streak = 0;
      banked = 0;
    }

    // 3) hysteresis peak detection
    if (armed && smooth >= PEAK_THRESHOLD) {
      armed = false;
      const dt = lastPeakAt ? now - lastPeakAt : Infinity;

      if (dt < MIN_STEP_MS) {
        // Impossibly fast — vibration/noise. Not a step, not rhythm.
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
    } else if (!armed && smooth <= VALLEY_THRESHOLD) {
      armed = true; // signal fell back down — ready for the next peak
    }
  }

  /** Drop all internal state (fresh session). */
  function reset() {
    gravity = null;
    window = [];
    armed = true;
    lastPeakAt = 0;
    streak = 0;
    banked = 0;
  }

  return { process, reset };
}
