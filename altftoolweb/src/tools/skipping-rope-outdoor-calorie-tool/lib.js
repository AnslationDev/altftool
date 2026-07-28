/**
 * Interval skipping (jump rope) energy expenditure.
 *
 * Energy model: the ACSM metabolic equivalent definition — 1 MET is a resting
 * oxygen uptake of 3.5 mL O2 per kg of body mass per minute, and 1 litre of O2
 * consumed liberates ~5 kcal. That gives the standard bedside form:
 *   kcal/min = MET x 3.5 x bodyMassKg / 200
 *
 * MET values are the published rope-jumping rows of the 2011 Compendium of
 * Physical Activities (Ainsworth et al., Med Sci Sports Exerc 43(8):1575-81).
 */

/** 1 MET expressed as oxygen uptake, mL O2 per kg per minute (ACSM definition). */
export const MET_ML_O2_PER_KG_MIN = 3.5;

/** Divisor that turns mL O2/kg/min into kcal/min (1 L O2 ~ 5 kcal => 1000/5 = 200). */
export const KCAL_CONVERSION_DIVISOR = 200;

/** Seconds in one minute. */
export const SECONDS_PER_MINUTE = 60;

/**
 * Rope-jumping MET values, 2011 Compendium of Physical Activities.
 *  15551 rope jumping, slow pace, < 100 skips/min ........ 8.8 METs
 *  15552 rope jumping, moderate pace, 100-120 skips/min .. 11.8 METs
 *  15550 rope jumping, fast pace, 120-160 skips/min ...... 12.3 METs
 * Rates above 160 skips/min have no separate row, so the fast-pace value is
 * used as the ceiling rather than extrapolating beyond the published data.
 */
export const SKIP_BANDS = [
  {
    id: "slow",
    label: "Slow pace (under 100 skips/min)",
    met: 8.8,
    minRate: 0,
    maxRate: 99,
  },
  {
    id: "moderate",
    label: "Moderate pace (100-120 skips/min)",
    met: 11.8,
    minRate: 100,
    maxRate: 119,
  },
  {
    id: "fast",
    label: "Fast pace (120-160 skips/min)",
    met: 12.3,
    minRate: 120,
    maxRate: Infinity,
  },
];

/**
 * Recovery MET values between rounds, 2011 Compendium of Physical Activities.
 *  07040 standing quietly ................................ 1.3 METs
 *  02101 stretching, mild ................................ 2.3 METs
 *  17152 walking, 2.0 mph, level, slow pace ............... 2.8 METs
 */
export const REST_MODES = [
  { id: "standing", label: "Standing / catching breath", met: 1.3 },
  { id: "stretching", label: "Light stretching or shaking out", met: 2.3 },
  { id: "walking", label: "Walking it off slowly", met: 2.8 },
];

/** Resting metabolic baseline used to convert gross calories to net. */
export const RESTING_MET = 1;

/** Plausible input windows so the tool never reports a physiologically absurd figure. */
export const LIMITS = {
  weightKg: { min: 20, max: 300 },
  rounds: { min: 1, max: 100 },
  workSeconds: { min: 5, max: 3600 },
  restSeconds: { min: 0, max: 3600 },
  skipsPerMinute: { min: 20, max: 250 },
};

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** kcal burned at a given MET for a given mass and duration. */
export function kcalFromMet(met, weightKg, minutes) {
  if (!isNum(met) || !isNum(weightKg) || !isNum(minutes)) return 0;
  if (met <= 0 || weightKg <= 0 || minutes <= 0) return 0;
  return (met * MET_ML_O2_PER_KG_MIN * weightKg * minutes) / KCAL_CONVERSION_DIVISOR;
}

/** Pick the Compendium band that matches a skip rate. */
export function bandForRate(skipsPerMinute) {
  if (!isNum(skipsPerMinute)) return null;
  return (
    SKIP_BANDS.find(
      (band) => skipsPerMinute >= band.minRate && skipsPerMinute <= band.maxRate,
    ) || null
  );
}

/**
 * Compute an interval skipping session.
 *
 * Rest is counted between rounds only (rounds - 1 gaps), because the session
 * ends when the last round ends.
 *
 * @returns {{error:string}|object} plain result object, never NaN or Infinity.
 */
export function computeIntervalSkipping({
  weightKg,
  rounds,
  workSeconds,
  restSeconds,
  skipsPerMinute,
  restMode = "standing",
} = {}) {
  const values = { weightKg, rounds, workSeconds, restSeconds, skipsPerMinute };
  for (const key of Object.keys(values)) {
    if (!isNum(values[key])) {
      return { error: "Enter a valid number in every field." };
    }
  }

  if (weightKg < LIMITS.weightKg.min || weightKg > LIMITS.weightKg.max) {
    return {
      error: `Body weight should be between ${LIMITS.weightKg.min} and ${LIMITS.weightKg.max} kg.`,
    };
  }
  if (!Number.isInteger(rounds) || rounds < LIMITS.rounds.min || rounds > LIMITS.rounds.max) {
    return {
      error: `Rounds should be a whole number between ${LIMITS.rounds.min} and ${LIMITS.rounds.max}.`,
    };
  }
  if (workSeconds < LIMITS.workSeconds.min || workSeconds > LIMITS.workSeconds.max) {
    return {
      error: `Work time per round should be between ${LIMITS.workSeconds.min} and ${LIMITS.workSeconds.max} seconds.`,
    };
  }
  if (restSeconds < LIMITS.restSeconds.min || restSeconds > LIMITS.restSeconds.max) {
    return {
      error: `Rest time per round should be between ${LIMITS.restSeconds.min} and ${LIMITS.restSeconds.max} seconds.`,
    };
  }
  if (
    skipsPerMinute < LIMITS.skipsPerMinute.min ||
    skipsPerMinute > LIMITS.skipsPerMinute.max
  ) {
    return {
      error: `Skip rate should be between ${LIMITS.skipsPerMinute.min} and ${LIMITS.skipsPerMinute.max} skips per minute.`,
    };
  }

  const rest = REST_MODES.find((mode) => mode.id === restMode) || REST_MODES[0];
  const band = bandForRate(skipsPerMinute);
  if (!band) return { error: "That skip rate is outside the supported range." };

  const workMinutes = (rounds * workSeconds) / SECONDS_PER_MINUTE;
  const restMinutes = ((rounds - 1) * restSeconds) / SECONDS_PER_MINUTE;
  const sessionMinutes = workMinutes + restMinutes;

  const workKcal = kcalFromMet(band.met, weightKg, workMinutes);
  const restKcal = kcalFromMet(rest.met, weightKg, restMinutes);
  const grossKcal = workKcal + restKcal;
  const restingKcal = kcalFromMet(RESTING_MET, weightKg, sessionMinutes);
  const netKcal = Math.max(0, grossKcal - restingKcal);

  const totalSkips = Math.round(skipsPerMinute * workMinutes);
  const kcalPerMinute = sessionMinutes > 0 ? grossKcal / sessionMinutes : 0;
  const kcalPer100Skips = totalSkips > 0 ? (workKcal / totalSkips) * 100 : 0;
  const workShare = sessionMinutes > 0 ? (workMinutes / sessionMinutes) * 100 : 0;

  return {
    bandId: band.id,
    bandLabel: band.label,
    met: band.met,
    restLabel: rest.label,
    restMet: rest.met,
    workMinutes,
    restMinutes,
    sessionMinutes,
    workKcal,
    restKcal,
    grossKcal,
    netKcal,
    restingKcal,
    totalSkips,
    kcalPerMinute,
    kcalPer100Skips,
    workShare,
    restShare: 100 - workShare,
  };
}

/**
 * Minutes of skipping at the same rate needed to reach a calorie target.
 * Returns null when the inputs cannot produce a finite answer.
 */
export function minutesForTarget({ weightKg, met, targetKcal } = {}) {
  if (!isNum(weightKg) || !isNum(met) || !isNum(targetKcal)) return null;
  if (weightKg <= 0 || met <= 0 || targetKcal <= 0) return null;
  const perMinute = (met * MET_ML_O2_PER_KG_MIN * weightKg) / KCAL_CONVERSION_DIVISOR;
  if (!(perMinute > 0)) return null;
  return targetKcal / perMinute;
}
