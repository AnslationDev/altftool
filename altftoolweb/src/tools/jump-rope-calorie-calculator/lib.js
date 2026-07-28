/**
 * Jump rope (skipping) energy expenditure.
 *
 * MET values come from the 2011 Compendium of Physical Activities (Ainsworth et al.),
 * which bands rope jumping by skip rate. Because skipping is almost always done in
 * intervals, the model blends the working MET with a standing-rest MET over the session.
 */

/**
 * Compendium codes and MET values for rope jumping:
 *   15551 fast pace, 120-160 skips/min ...... 12.3 METs
 *   15552 moderate pace, 100-120 skips/min .. 11.8 METs
 *   15550 slow pace, under 100 skips/min .... 8.8 METs
 * The anchors below sit at the midpoint of each band so the curve can be interpolated.
 */
export const MET_ANCHORS = [
  { rate: 80, met: 8.8, label: "slow pace, under 100 skips/min" },
  { rate: 110, met: 11.8, label: "moderate pace, 100-120 skips/min" },
  { rate: 140, met: 12.3, label: "fast pace, 120-160 skips/min" },
];

/** Sanity bounds on the interpolated MET so extrapolation cannot run away. */
export const MET_FLOOR = 4;
export const MET_CEILING = 15;

/** Compendium 07021, standing quietly, is 1.3 METs; 1.5 covers walking off a rest. */
export const REST_MET = 1.5;

/** One MET by definition. Used to strip out the calories you would burn resting anyway. */
export const RESTING_MET = 1;

/**
 * ACSM energy equation: 1 MET = 3.5 mL O2 per kg per minute, and 1 litre of oxygen
 * releases about 5 kcal, giving kcal/min = MET x 3.5 x kg / 200.
 */
export const ML_O2_PER_MET = 3.5;
export const ACSM_KCAL_DIVISOR = 200;

/** One kilogram of body fat stores roughly 7,700 kcal. */
export const KCAL_PER_KG_FAT = 7700;

export const LIMITS = {
  weightKg: [25, 250],
  skipsPerMinute: [30, 250],
  totalMinutes: [1, 180],
  workSeconds: [5, 3600],
  restSeconds: [0, 3600],
};

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

/** kcal per minute for a given MET value and body mass. */
export function kcalPerMinute(met, weightKg) {
  if (!isFiniteNumber(met) || !isFiniteNumber(weightKg)) return NaN;
  return (met * ML_O2_PER_MET * weightKg) / ACSM_KCAL_DIVISOR;
}

/**
 * Piecewise-linear MET for a skip rate, interpolating between the Compendium anchors
 * and extrapolating along the nearest segment outside them, then clamped.
 */
export function metForSkipRate(skipsPerMinute) {
  if (!isFiniteNumber(skipsPerMinute)) return NaN;
  const anchors = MET_ANCHORS;
  const first = anchors[0];
  const last = anchors[anchors.length - 1];

  if (skipsPerMinute <= first.rate) {
    const slope = (anchors[1].met - first.met) / (anchors[1].rate - first.rate);
    return clamp(first.met + (skipsPerMinute - first.rate) * slope, MET_FLOOR, MET_CEILING);
  }
  if (skipsPerMinute >= last.rate) {
    const prev = anchors[anchors.length - 2];
    const slope = (last.met - prev.met) / (last.rate - prev.rate);
    return clamp(last.met + (skipsPerMinute - last.rate) * slope, MET_FLOOR, MET_CEILING);
  }
  for (let i = 0; i < anchors.length - 1; i += 1) {
    const a = anchors[i];
    const b = anchors[i + 1];
    if (skipsPerMinute >= a.rate && skipsPerMinute <= b.rate) {
      const slope = (b.met - a.met) / (b.rate - a.rate);
      return clamp(a.met + (skipsPerMinute - a.rate) * slope, MET_FLOOR, MET_CEILING);
    }
  }
  return clamp(last.met, MET_FLOOR, MET_CEILING);
}

/** Plain-language description of the Compendium band a skip rate falls into. */
export function paceLabel(skipsPerMinute) {
  if (!isFiniteNumber(skipsPerMinute)) return "";
  if (skipsPerMinute < 100) return "Slow pace (under 100 skips/min)";
  if (skipsPerMinute <= 120) return "Moderate pace (100-120 skips/min)";
  if (skipsPerMinute <= 160) return "Fast pace (120-160 skips/min)";
  return "Very fast (above the Compendium's fastest band)";
}

/**
 * @param {object} input
 * @param {number} input.weightKg        body mass in kilograms
 * @param {number} input.skipsPerMinute  skips per minute while the rope is turning
 * @param {number} input.totalMinutes    whole session length including rests
 * @param {number} [input.workSeconds]   length of one work interval
 * @param {number} [input.restSeconds]   rest between intervals; 0 means continuous
 */
export function computeJumpRopeCalories({
  weightKg,
  skipsPerMinute,
  totalMinutes,
  workSeconds = 60,
  restSeconds = 0,
}) {
  if (
    !isFiniteNumber(weightKg) ||
    !isFiniteNumber(skipsPerMinute) ||
    !isFiniteNumber(totalMinutes) ||
    !isFiniteNumber(workSeconds) ||
    !isFiniteNumber(restSeconds)
  ) {
    return { error: "Enter a number in every field." };
  }
  if (weightKg < LIMITS.weightKg[0] || weightKg > LIMITS.weightKg[1]) {
    return { error: `Body weight should be between ${LIMITS.weightKg[0]} kg and ${LIMITS.weightKg[1]} kg.` };
  }
  if (skipsPerMinute < LIMITS.skipsPerMinute[0] || skipsPerMinute > LIMITS.skipsPerMinute[1]) {
    return {
      error: `Skip rate should be between ${LIMITS.skipsPerMinute[0]} and ${LIMITS.skipsPerMinute[1]} skips per minute.`,
    };
  }
  if (totalMinutes < LIMITS.totalMinutes[0] || totalMinutes > LIMITS.totalMinutes[1]) {
    return { error: `Session length should be between ${LIMITS.totalMinutes[0]} and ${LIMITS.totalMinutes[1]} minutes.` };
  }
  if (workSeconds < LIMITS.workSeconds[0] || workSeconds > LIMITS.workSeconds[1]) {
    return { error: `A work interval should be between ${LIMITS.workSeconds[0]} and ${LIMITS.workSeconds[1]} seconds.` };
  }
  if (restSeconds < LIMITS.restSeconds[0] || restSeconds > LIMITS.restSeconds[1]) {
    return { error: `Rest should be between ${LIMITS.restSeconds[0]} and ${LIMITS.restSeconds[1]} seconds. Use 0 for continuous skipping.` };
  }

  const cycleSeconds = workSeconds + restSeconds;
  // cycleSeconds can never be zero because workSeconds has a floor of 5.
  const workFraction = workSeconds / cycleSeconds;

  const workMinutes = totalMinutes * workFraction;
  const restMinutes = totalMinutes - workMinutes;

  const workMet = metForSkipRate(skipsPerMinute);
  const workKcalPerMin = kcalPerMinute(workMet, weightKg);
  const restKcalPerMin = kcalPerMinute(REST_MET, weightKg);
  const restingKcalPerMin = kcalPerMinute(RESTING_MET, weightKg);

  const grossKcal = workKcalPerMin * workMinutes + restKcalPerMin * restMinutes;
  const netKcal = grossKcal - restingKcalPerMin * totalMinutes;

  const totalSkips = skipsPerMinute * workMinutes;
  const averageMet = grossKcal / totalMinutes / kcalPerMinute(1, weightKg);
  const rounds = restSeconds > 0 ? Math.floor((totalMinutes * 60) / cycleSeconds) : 1;

  return {
    workMet,
    averageMet,
    workKcalPerMin,
    restKcalPerMin,
    workMinutes,
    restMinutes,
    grossKcal,
    netKcal: Math.max(0, netKcal),
    totalSkips,
    skipsPerKcal: grossKcal > 0 ? totalSkips / grossKcal : 0,
    rounds,
    cycleSeconds,
    paceLabel: paceLabel(skipsPerMinute),
    sessionsToBurnKgFat: netKcal > 0 ? KCAL_PER_KG_FAT / netKcal : null,
  };
}
