/**
 * Battle rope interval energy expenditure.
 *
 * The Compendium of Physical Activities has no battling-rope code, so the working
 * intensity is anchored on the laboratory measurements that do exist: oxygen cost
 * during battling-rope bouts has been reported at roughly 8-11 METs (Fountaine &
 * Schmidt 2015; Ratamess et al. 2015). 10 METs is used as the reference for standard
 * double-arm waves at a hard but repeatable effort, then scaled by style and effort.
 */

/** Reference working intensity for double-arm waves at a hard, repeatable effort. */
export const REFERENCE_WORK_MET = 10;

/** Keep style x effort scaling inside the range the published measurements support. */
export const WORK_MET_FLOOR = 5;
export const WORK_MET_CEILING = 15;

/**
 * Style multipliers relative to double-arm waves. Movements that add a squat, a step
 * or a jump recruit more muscle mass and raise oxygen cost; pure arm waves sit lower.
 */
export const WAVE_STYLES = {
  alternating: { key: "alternating", label: "Alternating waves", factor: 0.95 },
  doubleArm: { key: "doubleArm", label: "Double-arm waves and slams", factor: 1 },
  sideToSide: { key: "sideToSide", label: "Side-to-side snakes", factor: 0.95 },
  squatSlam: { key: "squatSlam", label: "Slams with a squat", factor: 1.15 },
  jumpSlam: { key: "jumpSlam", label: "Jump or burpee slams", factor: 1.3 },
};

/** Effort multipliers, matched to how the rope amplitude and pace normally change. */
export const EFFORT_LEVELS = {
  light: { key: "light", label: "Light — small waves, easy pace", factor: 0.8 },
  moderate: { key: "moderate", label: "Hard — full waves, repeatable", factor: 1 },
  allOut: { key: "allOut", label: "All-out — maximum amplitude and speed", factor: 1.15 },
};

/**
 * Recovery between rope sets is rarely true rest; most people walk it off.
 * Compendium 17151, walking at a very slow stroll under 2.0 mph (~3.2 km/h),
 * is about 2.0 METs. (Not 17152 — that code is a faster 2.0-2.4 mph pace and
 * reports 2.8 METs, not 2.0.)
 */
export const REST_MET = 2;

/** One MET by definition, used to strip out baseline metabolism. */
export const RESTING_MET = 1;

/**
 * ACSM energy equation: kcal/min = METs x 3.5 mL O2 per kg per min x kg / 200,
 * where 200 comes from 1 litre of oxygen releasing about 5 kcal.
 */
export const ML_O2_PER_MET = 3.5;
export const ACSM_KCAL_DIVISOR = 200;

/**
 * Excess post-exercise oxygen consumption after higher-intensity interval work is
 * typically 6-15% of the exercise oxygen cost (LaForgia, Withers & Gore, J Sports Sci
 * 2006). Reported as a range rather than a single number because it varies widely.
 */
export const EPOC_SHARE_LOW = 0.06;
export const EPOC_SHARE_HIGH = 0.15;

export const LIMITS = {
  weightKg: [25, 250],
  rounds: [1, 100],
  workSeconds: [5, 600],
  restSeconds: [0, 600],
};

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

/** kcal per minute for a given MET value and body mass. */
export function kcalPerMinute(met, weightKg) {
  if (!isFiniteNumber(met) || !isFiniteNumber(weightKg)) return NaN;
  return (met * ML_O2_PER_MET * weightKg) / ACSM_KCAL_DIVISOR;
}

/**
 * @param {object} input
 * @param {number} input.weightKg      body mass in kilograms
 * @param {number} input.rounds        number of work intervals
 * @param {number} input.workSeconds   seconds of rope work per round
 * @param {number} input.restSeconds   seconds of recovery between rounds
 * @param {string} [input.style]       key of WAVE_STYLES
 * @param {string} [input.effort]      key of EFFORT_LEVELS
 */
export function computeBattleRopeCalories({
  weightKg,
  rounds,
  workSeconds,
  restSeconds,
  style = "alternating",
  effort = "moderate",
}) {
  if (
    !isFiniteNumber(weightKg) ||
    !isFiniteNumber(rounds) ||
    !isFiniteNumber(workSeconds) ||
    !isFiniteNumber(restSeconds)
  ) {
    return { error: "Enter a number in every field." };
  }
  if (weightKg < LIMITS.weightKg[0] || weightKg > LIMITS.weightKg[1]) {
    return { error: `Body weight should be between ${LIMITS.weightKg[0]} kg and ${LIMITS.weightKg[1]} kg.` };
  }
  if (rounds < LIMITS.rounds[0] || rounds > LIMITS.rounds[1] || !Number.isInteger(rounds)) {
    return { error: `Rounds should be a whole number between ${LIMITS.rounds[0]} and ${LIMITS.rounds[1]}.` };
  }
  if (workSeconds < LIMITS.workSeconds[0] || workSeconds > LIMITS.workSeconds[1]) {
    return { error: `A work interval should be between ${LIMITS.workSeconds[0]} and ${LIMITS.workSeconds[1]} seconds.` };
  }
  if (restSeconds < LIMITS.restSeconds[0] || restSeconds > LIMITS.restSeconds[1]) {
    return { error: `Rest should be between ${LIMITS.restSeconds[0]} and ${LIMITS.restSeconds[1]} seconds.` };
  }
  const chosenStyle = WAVE_STYLES[style];
  if (!chosenStyle) return { error: "Choose a rope movement." };
  const chosenEffort = EFFORT_LEVELS[effort];
  if (!chosenEffort) return { error: "Choose an effort level." };

  const workMet = clamp(
    REFERENCE_WORK_MET * chosenStyle.factor * chosenEffort.factor,
    WORK_MET_FLOOR,
    WORK_MET_CEILING,
  );

  const workMinutes = (rounds * workSeconds) / 60;
  // The final round's rest is still counted, as most people recover before stopping.
  const restMinutes = (rounds * restSeconds) / 60;
  const totalMinutes = workMinutes + restMinutes;

  const workKcalPerMin = kcalPerMinute(workMet, weightKg);
  const restKcalPerMin = kcalPerMinute(REST_MET, weightKg);
  const restingKcalPerMin = kcalPerMinute(RESTING_MET, weightKg);

  const workKcal = workKcalPerMin * workMinutes;
  const restKcal = restKcalPerMin * restMinutes;
  const grossKcal = workKcal + restKcal;
  const netKcal = Math.max(0, grossKcal - restingKcalPerMin * totalMinutes);

  const averageMet = totalMinutes > 0 ? grossKcal / totalMinutes / restingKcalPerMin : 0;

  const workRestRatio = restSeconds > 0 ? workSeconds / restSeconds : null;

  return {
    workMet,
    averageMet,
    styleLabel: chosenStyle.label,
    effortLabel: chosenEffort.label,
    workMinutes,
    restMinutes,
    totalMinutes,
    workKcalPerMin,
    restKcalPerMin,
    workKcal,
    restKcal,
    grossKcal,
    netKcal,
    kcalPerRound: rounds > 0 ? grossKcal / rounds : 0,
    epocLowKcal: netKcal * EPOC_SHARE_LOW,
    epocHighKcal: netKcal * EPOC_SHARE_HIGH,
    workRestRatio,
    rounds,
  };
}

/** Rounds needed to reach a calorie target with the same interval settings. */
export function roundsForTarget(kcalPerRound, targetKcal) {
  if (!isFiniteNumber(kcalPerRound) || !isFiniteNumber(targetKcal)) return null;
  if (kcalPerRound <= 0 || targetKcal <= 0) return null;
  return Math.ceil(targetKcal / kcalPerRound);
}
