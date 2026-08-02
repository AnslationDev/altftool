/**
 * Stride length maths.
 *
 * Terminology (standard gait analysis, e.g. Perry & Burnfield, Gait Analysis):
 *   STEP   = one foot strike to the NEXT foot strike (left heel -> right heel).
 *   STRIDE = one full gait cycle, same foot to the same foot again = exactly 2 steps.
 * Running watches report CADENCE in steps per minute (spm), so cadence counts steps,
 * not strides. Everything below keeps those two apart explicitly.
 */

/** One stride (gait cycle) always contains two steps: left strike + right strike. */
export const STEPS_PER_STRIDE = 2;

/** Exact mile, from the 1959 international yard and pound agreement. */
export const METRES_PER_MILE = 1609.344;
export const METRES_PER_KM = 1000;
/** Exact foot, same 1959 agreement. */
export const METRES_PER_FOOT = 0.3048;
export const SECONDS_PER_MINUTE = 60;

/**
 * Plausibility guards. Outside these ranges the input is almost certainly a typo
 * rather than a real run, so we refuse instead of printing a nonsense stride.
 * 30 spm is slower than a stroll; 300 spm is beyond any recorded sprint cadence.
 */
export const MIN_CADENCE_SPM = 30;
export const MAX_CADENCE_SPM = 300;
/** 2:00/km is faster than the men's 1500 m world-record pace; 30:00/km is slow walking. */
export const MIN_PACE_SEC_PER_KM = 120;
export const MAX_PACE_SEC_PER_KM = 1800;

/**
 * Pedometer rule-of-thumb: walking step length is roughly height x factor.
 * Factors from the widely used ACSM/pedometer estimate (0.415 men, 0.413 women).
 * This is a WALKING estimate and only a starting point - measured data always wins.
 */
export const HEIGHT_STEP_FACTOR = { male: 0.415, female: 0.413 };
export const MIN_HEIGHT_CM = 100;
export const MAX_HEIGHT_CM = 250;

/** Typical running STEP length band in metres, recreational through to elite. */
export const TYPICAL_STEP_LENGTH_M = { min: 0.8, max: 1.6 };

/** Cadence often quoted as an efficiency target for distance running (steps per minute). */
export const REFERENCE_CADENCE_SPM = 180;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Classify a step length against the typical running band.
 * @returns {"short"|"typical"|"long"}
 */
export function classifyStepLength(stepLengthM) {
  if (!isNum(stepLengthM)) return "typical";
  if (stepLengthM < TYPICAL_STEP_LENGTH_M.min) return "short";
  if (stepLengthM > TYPICAL_STEP_LENGTH_M.max) return "long";
  return "typical";
}

/**
 * Shared result shape once a step length in metres is known.
 * speedMps may be null when the step length came from a distance/step count
 * with no timing information.
 */
function describe(stepLengthM, speedMps) {
  const strideLengthM = stepLengthM * STEPS_PER_STRIDE;
  const stepsPerKm = METRES_PER_KM / stepLengthM;
  const stepsPerMile = METRES_PER_MILE / stepLengthM;

  return {
    stepLengthM,
    stepLengthCm: stepLengthM * 100,
    stepLengthFt: stepLengthM / METRES_PER_FOOT,
    strideLengthM,
    strideLengthCm: strideLengthM * 100,
    strideLengthFt: strideLengthM / METRES_PER_FOOT,
    stepsPerKm,
    stepsPerMile,
    stridesPerKm: stepsPerKm / STEPS_PER_STRIDE,
    speedMps: isNum(speedMps) ? speedMps : null,
    speedKmh: isNum(speedMps) ? speedMps * 3.6 : null,
    band: classifyStepLength(stepLengthM),
  };
}

/**
 * Step and stride length from cadence and pace.
 *
 * speed (m/s)      = 1000 / paceSecPerKm
 * steps per second = cadenceSpm / 60
 * step length (m)  = speed / steps per second = speed * 60 / cadenceSpm
 * stride length    = 2 x step length
 *
 * @param {{cadenceSpm:number, paceSecPerKm:number}} input
 */
export function strideFromCadenceAndPace({ cadenceSpm, paceSecPerKm } = {}) {
  if (!isNum(cadenceSpm) || !isNum(paceSecPerKm)) {
    return { error: "Enter a cadence in steps per minute and a pace per kilometre." };
  }
  if (cadenceSpm < MIN_CADENCE_SPM || cadenceSpm > MAX_CADENCE_SPM) {
    return {
      error: `Cadence should be between ${MIN_CADENCE_SPM} and ${MAX_CADENCE_SPM} steps per minute.`,
    };
  }
  if (paceSecPerKm < MIN_PACE_SEC_PER_KM || paceSecPerKm > MAX_PACE_SEC_PER_KM) {
    return { error: "Pace should be between 2:00 and 30:00 per kilometre." };
  }

  const speedMps = METRES_PER_KM / paceSecPerKm;
  const stepsPerSecond = cadenceSpm / SECONDS_PER_MINUTE;
  const stepLengthM = speedMps / stepsPerSecond;

  return {
    ...describe(stepLengthM, speedMps),
    cadenceSpm,
    paceSecPerKm,
    source: "cadence-pace",
  };
}

/**
 * Step and stride length from a counted number of steps over a measured distance.
 * step length = distance / steps.
 *
 * @param {{distanceM:number, steps:number, durationSec?:number}} input
 */
export function strideFromStepCount({ distanceM, steps, durationSec } = {}) {
  if (!isNum(distanceM) || !isNum(steps)) {
    return { error: "Enter the distance covered and the number of steps you counted." };
  }
  if (distanceM <= 0) return { error: "Distance must be greater than zero." };
  if (steps <= 0) return { error: "Step count must be greater than zero." };

  const stepLengthM = distanceM / steps;
  if (stepLengthM > 5) {
    return { error: "That works out to over 5 m per step - check the distance and step count." };
  }

  const timed = isNum(durationSec) && durationSec > 0;
  const speedMps = timed ? distanceM / durationSec : null;
  const cadenceSpm = timed ? (steps / durationSec) * SECONDS_PER_MINUTE : null;

  return {
    ...describe(stepLengthM, speedMps),
    cadenceSpm,
    paceSecPerKm: timed ? (durationSec / distanceM) * METRES_PER_KM : null,
    distanceM,
    steps,
    source: "step-count",
  };
}

/**
 * Rule-of-thumb walking step length from body height.
 * Only an estimate for seeding a pedometer - it ignores speed entirely.
 *
 * @param {{heightCm:number, sex?:"male"|"female"}} input
 */
export function estimateStepLengthFromHeight({ heightCm, sex = "male" } = {}) {
  if (!isNum(heightCm)) return { error: "Enter your height in centimetres." };
  if (heightCm < MIN_HEIGHT_CM || heightCm > MAX_HEIGHT_CM) {
    return { error: `Height should be between ${MIN_HEIGHT_CM} and ${MAX_HEIGHT_CM} cm.` };
  }

  const factor = HEIGHT_STEP_FACTOR[sex] ?? HEIGHT_STEP_FACTOR.male;
  const stepLengthM = (heightCm * factor) / 100;

  return {
    ...describe(stepLengthM, null),
    factor,
    heightCm,
    source: "height-estimate",
  };
}

/** Convert mm:ss pace parts to seconds per kilometre. */
export function paceToSeconds(minutes, seconds) {
  const m = isNum(minutes) ? minutes : 0;
  const s = isNum(seconds) ? seconds : 0;
  return m * SECONDS_PER_MINUTE + s;
}

/** Format seconds as m:ss. */
export function formatPace(totalSeconds) {
  if (!isNum(totalSeconds) || totalSeconds < 0) return "—";
  const whole = Math.round(totalSeconds);
  const m = Math.floor(whole / SECONDS_PER_MINUTE);
  const s = whole % SECONDS_PER_MINUTE;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Single entry point used by the UI.
 * @param {{mode:"cadence"|"steps"|"height"}} input
 */
export function computeStride(input = {}) {
  if (input.mode === "steps") return strideFromStepCount(input);
  if (input.mode === "height") return estimateStepLengthFromHeight(input);
  return strideFromCadenceAndPace(input);
}
