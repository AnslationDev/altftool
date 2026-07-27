/**
 * Indoor rowing power and energy, using Concept2's published relationships.
 *
 * POWER
 *   watts = 2.80 / (pace in seconds per metre)^3
 * This is the formula Concept2 publishes for its performance monitors. A 2:00
 * split (0.24 s/m) gives 2.80 / 0.24^3 = 202.5 W, which matches their pace chart.
 *
 * CALORIES
 *   kcal per hour = (4 x watts) + 300
 * Also Concept2's published formula. The 4 kcal/hr per watt implies a gross
 * mechanical efficiency near 21.5% (1 W = 0.860 kcal/hr of mechanical work), and
 * the 300 kcal/hr floor covers the non-propulsive cost of moving your own body up
 * and down the slide. Concept2 state that the monitor's calorie figure assumes a
 * 175 lb (79.4 kg) rower.
 *
 * WEIGHT ADJUSTMENT
 * The 300 kcal/hr term is body-mass dependent, so a weight-adjusted estimate scales
 * only that term by (your mass / 79.4 kg). The propulsive term is left alone because
 * a watt costs the same regardless of who produces it. Both figures are reported so
 * you can see the machine's number and the adjusted one side by side.
 */

/** Concept2 drag-corrected power constant, watts x (s/m)^3. */
export const C2_POWER_CONSTANT = 2.8;
/** Concept2 calorie formula: kcal per hour per watt. */
export const C2_KCAL_PER_HOUR_PER_WATT = 4;
/** Concept2 calorie formula: fixed kcal per hour term. */
export const C2_BASELINE_KCAL_PER_HOUR = 300;
/** Concept2 reference rower: 175 lb. 1 lb = 0.45359237 kg exactly. */
export const KG_PER_LB = 0.45359237;
export const C2_REFERENCE_WEIGHT_KG = 175 * KG_PER_LB;

/** One metabolic equivalent, mL O2 per kg per minute, and the ACSM kcal per litre of O2. */
export const ML_O2_PER_MET = 3.5;
export const KCAL_PER_LITRE_O2 = 5;

export const WEIGHT_MIN_KG = 20;
export const WEIGHT_MAX_KG = 300;
export const DISTANCE_MIN_M = 50;
export const DISTANCE_MAX_M = 200000;
export const DURATION_MAX_SECONDS = 36000; // 10 hours
export const STROKE_RATE_MIN = 10;
export const STROKE_RATE_MAX = 60;
/** Below this pace per 500 m the power formula produces implausible wattage. */
export const MIN_PLAUSIBLE_SPLIT_SECONDS = 60;
export const MAX_PLAUSIBLE_SPLIT_SECONDS = 600;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Convert a body weight in kg or lb to kilograms. */
export function toKilograms(weight, unit) {
  if (!isNum(weight)) return null;
  return unit === "lb" ? weight * KG_PER_LB : weight;
}

/**
 * Parse "h:mm:ss", "mm:ss", "mm:ss.t" or a plain number of seconds.
 *
 * @param {string|number} raw
 * @returns {number|null} seconds, or null when the text is not a valid duration.
 */
export function parseDuration(raw) {
  if (isNum(raw)) return raw >= 0 ? raw : null;
  if (typeof raw !== "string") return null;
  const text = raw.trim();
  if (text === "") return null;
  const parts = text.split(":");
  if (parts.length > 3) return null;
  let seconds = 0;
  for (let i = 0; i < parts.length; i += 1) {
    const part = parts[i].trim();
    if (part === "" || !/^\d+(\.\d+)?$/.test(part)) return null;
    const value = Number(part);
    if (!Number.isFinite(value)) return null;
    // Only the leading field may exceed 59 (e.g. "90:00" is a valid 90 minutes).
    if (i > 0 && value >= 60) return null;
    seconds = seconds * 60 + value;
  }
  return seconds;
}

/** Format seconds as m:ss.t (used for 500 m splits). */
export function formatSplit(totalSeconds) {
  if (!isNum(totalSeconds) || totalSeconds < 0) return "—";
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds - minutes * 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds.toFixed(1)}`;
}

/** Format seconds as h:mm:ss (or m:ss under an hour). */
export function formatDuration(totalSeconds) {
  if (!isNum(totalSeconds) || totalSeconds < 0) return "—";
  const whole = Math.round(totalSeconds);
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const seconds = whole % 60;
  const mm = String(minutes).padStart(hours > 0 ? 2 : 1, "0");
  const ss = String(seconds).padStart(2, "0");
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

/**
 * Concept2 power from pace.
 *
 * @param {number} secondsPerMetre
 * @returns {number|null} watts, or null for unusable input.
 */
export function paceToWatts(secondsPerMetre) {
  if (!isNum(secondsPerMetre) || secondsPerMetre <= 0) return null;
  return C2_POWER_CONSTANT / secondsPerMetre ** 3;
}

/**
 * Full rowing session estimate.
 *
 * @param {object} input
 * @param {number} input.distanceMetres  Metres rowed.
 * @param {string|number} input.duration Elapsed time as "mm:ss", "h:mm:ss" or seconds.
 * @param {number} input.weight          Body weight.
 * @param {"kg"|"lb"} [input.weightUnit]
 * @param {number|null} [input.strokeRate] Average strokes per minute, for context.
 * @returns {object} power and energy figures, or { error }.
 */
export function computeRowingSession({
  distanceMetres,
  duration,
  weight,
  weightUnit = "kg",
  strokeRate = null,
}) {
  const weightKg = toKilograms(weight, weightUnit);
  if (weightKg === null) return { error: "Enter your body weight." };
  if (weightKg < WEIGHT_MIN_KG || weightKg > WEIGHT_MAX_KG) {
    return { error: `Body weight should be between ${WEIGHT_MIN_KG} and ${WEIGHT_MAX_KG} kg.` };
  }

  if (!isNum(distanceMetres)) return { error: "Enter the distance you rowed, in metres." };
  if (distanceMetres < DISTANCE_MIN_M) {
    return { error: `Enter a distance of at least ${DISTANCE_MIN_M} metres.` };
  }
  if (distanceMetres > DISTANCE_MAX_M) {
    return { error: "That distance is outside this calculator's range." };
  }

  const seconds = parseDuration(duration);
  if (seconds === null) {
    return { error: "Enter the time as mm:ss, h:mm:ss, or a number of seconds." };
  }
  if (seconds <= 0) return { error: "Elapsed time must be greater than zero." };
  if (seconds > DURATION_MAX_SECONDS) {
    return { error: "That elapsed time is outside this calculator's range." };
  }

  if (strokeRate !== null && strokeRate !== undefined && strokeRate !== "") {
    if (!isNum(strokeRate)) return { error: "Stroke rate must be a number." };
    if (strokeRate < STROKE_RATE_MIN || strokeRate > STROKE_RATE_MAX) {
      return {
        error: `Stroke rate should be between ${STROKE_RATE_MIN} and ${STROKE_RATE_MAX} strokes per minute.`,
      };
    }
  }

  const secondsPerMetre = seconds / distanceMetres;
  const splitSeconds = secondsPerMetre * 500;
  const watts = paceToWatts(secondsPerMetre);
  if (watts === null || !Number.isFinite(watts)) {
    return { error: "That distance and time combination cannot be evaluated." };
  }

  const hours = seconds / 3600;
  const minutes = seconds / 60;

  const displayKcalPerHour = C2_KCAL_PER_HOUR_PER_WATT * watts + C2_BASELINE_KCAL_PER_HOUR;
  const displayKcal = displayKcalPerHour * hours;

  const adjustedBaseline = C2_BASELINE_KCAL_PER_HOUR * (weightKg / C2_REFERENCE_WEIGHT_KG);
  const adjustedKcalPerHour = C2_KCAL_PER_HOUR_PER_WATT * watts + adjustedBaseline;
  const adjustedKcal = adjustedKcalPerHour * hours;

  const restingKcalPerMin = ((ML_O2_PER_MET * weightKg) / 1000) * KCAL_PER_LITRE_O2;
  const restingKcal = restingKcalPerMin * minutes;
  const netKcal = Math.max(0, adjustedKcal - restingKcal);
  const mets = restingKcalPerMin > 0 ? adjustedKcalPerHour / 60 / restingKcalPerMin : null;

  /** Mechanical work done, kilojoules: watts x seconds / 1000. */
  const workKj = (watts * seconds) / 1000;

  const strokes = isNum(strokeRate) ? strokeRate * minutes : null;
  const metresPerStroke = strokes && strokes > 0 ? distanceMetres / strokes : null;
  const wattsPerStroke = strokes && strokes > 0 ? workKj / (strokes / 1000) : null;

  const warnings = [];
  if (splitSeconds < MIN_PLAUSIBLE_SPLIT_SECONDS) {
    warnings.push(
      "That works out faster than a 1:00 split for 500 m, which is beyond world-record pace — check the distance and time.",
    );
  }
  if (splitSeconds > MAX_PLAUSIBLE_SPLIT_SECONDS) {
    warnings.push(
      "That works out slower than a 10:00 split for 500 m. The power formula still applies, but at that pace the machine is barely loaded.",
    );
  }

  return {
    weightKg,
    distanceMetres,
    seconds,
    minutes,
    secondsPerMetre,
    splitSeconds,
    splitLabel: formatSplit(splitSeconds),
    durationLabel: formatDuration(seconds),
    watts,
    wattsPerKg: watts / weightKg,
    displayKcalPerHour,
    displayKcal,
    adjustedKcalPerHour,
    adjustedKcal,
    restingKcal,
    netKcal,
    mets,
    workKj,
    strokeRate: isNum(strokeRate) ? strokeRate : null,
    strokes,
    metresPerStroke,
    joulesPerStroke: wattsPerStroke,
    warnings,
  };
}
