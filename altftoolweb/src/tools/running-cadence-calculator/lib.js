/**
 * Running cadence (step rate) calculator.
 *
 * Cadence is steps per minute counting both feet. Everything else follows from
 * three definitions:
 *   cadence   = steps / (window in minutes)
 *   step length   = speed (m/min) / cadence          (one foot strike to the next)
 *   stride length = 2 x step length                  (same foot to the same foot)
 *
 * Progression guidance follows the commonly cited clinical approach of raising
 * step rate by 5% and then 10% above habitual cadence at a fixed speed, which
 * has been shown to reduce the mechanical load absorbed at the knee and hip
 * (Heiderscheit et al., Med Sci Sports Exerc, 2011).
 */

export const KM_PER_MILE = 1.609344;
/** A stride is two steps: left-right back to left. */
export const STEPS_PER_STRIDE = 2;

/** Recommended progression increments, as a fraction of current cadence. */
export const PROGRESSION_STEPS = [0.05, 0.1];
/** Hold each increment for this long before moving up again. */
export const PROGRESSION_HOLD_WEEKS = 4;

/**
 * Descriptive cadence bands. These are population observations, not targets:
 * cadence rises with speed and falls with height, so a tall runner jogging
 * easily will sit lower than a short runner at 5K pace.
 */
export const CADENCE_BANDS = [
  { max: 155, label: "Low", detail: "Long steps and a low step rate. This is where overstriding and heavy heel contact usually show up." },
  { max: 165, label: "Below typical", detail: "Common in newer runners at easy pace. There is usually room to add 5% without changing speed." },
  { max: 175, label: "Typical", detail: "The range most recreational runners sit in during steady running." },
  { max: 185, label: "High", detail: "Around the step rate often observed in trained distance runners at race pace." },
  { max: Infinity, label: "Very high", detail: "Above the usual range. Check the count, or expect this only during fast intervals." },
];

export const MIN_CADENCE = 60;
export const MAX_CADENCE = 260;
export const MIN_WINDOW_SECONDS = 5;
export const MAX_WINDOW_SECONDS = 600;
export const MIN_PACE_SEC_PER_KM = 140;
export const MAX_PACE_SEC_PER_KM = 1800;
export const MIN_HEIGHT_CM = 100;
export const MAX_HEIGHT_CM = 230;

const toFinite = (value) => {
  const num = typeof value === "number" ? value : Number(String(value ?? "").trim());
  return Number.isFinite(num) ? num : NaN;
};

/** Convert a minutes/seconds pace pair into seconds per kilometre. */
export function paceToSeconds({ minutes, seconds }) {
  const m = toFinite(minutes === "" ? 0 : minutes);
  const s = toFinite(seconds === "" ? 0 : seconds);
  if ([m, s].some(Number.isNaN) || m < 0 || s < 0) return NaN;
  return m * 60 + s;
}

/** Format a pace in seconds per km as m:ss. */
export function formatPace(secondsPerKm) {
  if (!Number.isFinite(secondsPerKm) || secondsPerKm <= 0) return "—";
  const total = Math.round(secondsPerKm);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

/** Look up the descriptive band for a cadence. */
export function cadenceBand(cadence) {
  return CADENCE_BANDS.find((band) => cadence <= band.max) ?? CADENCE_BANDS[CADENCE_BANDS.length - 1];
}

/**
 * Calculate cadence, step and stride length, and a progression plan.
 *
 * @param {object} input
 * @param {"window"|"direct"} input.mode count steps over a window, or type cadence in
 * @param {number|string} input.steps steps counted during the window
 * @param {number|string} input.windowSeconds length of the counting window
 * @param {boolean} input.countedOneFoot true when only one foot was counted
 * @param {number|string} input.directCadence cadence typed straight in (direct mode)
 * @param {number|string} input.paceSecPerKm running pace in seconds per kilometre
 * @param {number|string} input.heightCm body height, used for the step-length ratio
 * @returns {object} result figures, or { error } when the input is unusable
 */
export function calculateCadence({
  mode = "window",
  steps,
  windowSeconds,
  countedOneFoot = false,
  directCadence,
  paceSecPerKm,
  heightCm,
}) {
  if (mode !== "window" && mode !== "direct") {
    return { error: "Choose either counting steps or entering cadence directly." };
  }

  const pace = toFinite(paceSecPerKm);
  const height = toFinite(heightCm);

  if (Number.isNaN(pace) || Number.isNaN(height)) {
    return { error: "Enter a number in every field." };
  }
  if (pace < MIN_PACE_SEC_PER_KM || pace > MAX_PACE_SEC_PER_KM) {
    return { error: "Enter a running pace between 2:20 and 30:00 per kilometre." };
  }
  if (height < MIN_HEIGHT_CM || height > MAX_HEIGHT_CM) {
    return { error: `Height must be between ${MIN_HEIGHT_CM} and ${MAX_HEIGHT_CM} cm.` };
  }

  let cadence;
  if (mode === "window") {
    const counted = toFinite(steps);
    const window = toFinite(windowSeconds);
    if (Number.isNaN(counted) || Number.isNaN(window)) {
      return { error: "Enter a number in every field." };
    }
    if (!(counted > 0)) return { error: "Step count must be greater than zero." };
    if (window < MIN_WINDOW_SECONDS || window > MAX_WINDOW_SECONDS) {
      return { error: `Count for between ${MIN_WINDOW_SECONDS} and ${MAX_WINDOW_SECONDS} seconds.` };
    }
    const bothFeet = countedOneFoot ? counted * STEPS_PER_STRIDE : counted;
    cadence = (bothFeet * 60) / window;
  } else {
    cadence = toFinite(directCadence);
    if (Number.isNaN(cadence)) return { error: "Enter a number in every field." };
  }

  if (!(cadence >= MIN_CADENCE) || cadence > MAX_CADENCE) {
    return {
      error: `That works out to ${Math.round(cadence)} steps per minute, outside the ${MIN_CADENCE}-${MAX_CADENCE} range. Check the count, the window, and whether you counted one foot or both.`,
    };
  }

  const speedMetresPerMin = 60000 / pace;
  const speedKmh = 3600 / pace;
  const stepLengthM = speedMetresPerMin / cadence;
  const strideLengthM = stepLengthM * STEPS_PER_STRIDE;
  const stepLengthPctHeight = (stepLengthM * 100 * 100) / height;

  const targets = PROGRESSION_STEPS.map((increment) => {
    const targetCadence = cadence * (1 + increment);
    return {
      incrementPct: increment * 100,
      cadence: targetCadence,
      metronomeBpm: Math.round(targetCadence),
      stepLengthM: speedMetresPerMin / targetCadence,
      stepLengthCm: (speedMetresPerMin / targetCadence) * 100,
      stepLengthChangeCm: (speedMetresPerMin / targetCadence - stepLengthM) * 100,
    };
  });

  const band = cadenceBand(cadence);

  const notes = [
    `Cadence rises with speed. This reading is tied to ${formatPace(pace)} per km; expect a higher number during intervals and a lower one on an easy jog.`,
    `Move up one increment at a time and hold it for about ${PROGRESSION_HOLD_WEEKS} weeks before the next, keeping the same running speed so step length shortens rather than speed rising.`,
  ];
  if (mode === "window" && toFinite(windowSeconds) < 30) {
    notes.push("A counting window under 30 seconds magnifies a miscount; 30 to 60 seconds is more reliable.");
  }

  return {
    cadence,
    metronomeBpm: Math.round(cadence),
    stridesPerMin: cadence / STEPS_PER_STRIDE,
    paceSecPerKm: pace,
    paceSecPerMile: pace * KM_PER_MILE,
    speedKmh,
    speedMetresPerMin,
    stepLengthM,
    stepLengthCm: stepLengthM * 100,
    strideLengthM,
    stepLengthPctHeight,
    heightCm: height,
    band: band.label,
    bandDetail: band.detail,
    targets,
    notes,
  };
}
