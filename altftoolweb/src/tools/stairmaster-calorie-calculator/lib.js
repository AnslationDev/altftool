/**
 * Step-mill (StairMaster) energy expenditure.
 *
 * Climbing stairs is almost pure vertical work, so the honest model is mechanical:
 * work done lifting your body mass, divided by the efficiency of the movement, plus
 * resting metabolism. That is more faithful than a single MET value because it
 * responds to step rate, step height and body mass separately.
 */

/** Standard gravity, m/s^2. */
export const GRAVITY = 9.80665;

/** Joules in one kilocalorie (thermochemical). */
export const JOULES_PER_KCAL = 4184;

/**
 * Gross mechanical efficiency of stair climbing. Reported in the ergonomics literature
 * at roughly 20-25%; 25% is used here because it reproduces the 9.0 MET value the 2011
 * Compendium of Physical Activities lists for "stair-treadmill ergometer, general"
 * at a typical 70 steps per minute on a standard 8-inch step.
 */
export const CLIMB_EFFICIENCY = 0.25;

/**
 * One MET is 3.5 mL of oxygen per kg per minute, which is very close to
 * 1 kilocalorie per kilogram of body mass per hour. Used for the resting component.
 */
export const RESTING_KCAL_PER_KG_PER_HOUR = 1;

/** StepMill and StairMaster steps are 8 inches high, which is 0.2032 m exactly. */
export const DEFAULT_STEP_HEIGHT_M = 0.2032;

/** A typical building storey, used to express the climb in floors. */
export const FLOOR_HEIGHT_M = 3;

/**
 * Leaning on the handrails transfers part of your body mass to your arms and the frame,
 * cutting the work done. Reported reductions of roughly 8% for light touch and 20% or
 * more for a real lean.
 */
export const HANDRAIL_FACTORS = {
  none: { key: "none", label: "Hands off, or light fingertip balance only", factor: 1 },
  light: { key: "light", label: "Resting hands on the rails", factor: 0.92 },
  heavy: { key: "heavy", label: "Leaning weight through the rails", factor: 0.8 },
};

/** One kilogram of body fat stores roughly 7,700 kcal. */
export const KCAL_PER_KG_FAT = 7700;

export const LIMITS = {
  weightKg: [25, 250],
  stepsPerMinute: [20, 200],
  minutes: [1, 300],
  stepHeightM: [0.1, 0.35],
};

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * @param {object} input
 * @param {number} input.weightKg        body mass in kilograms
 * @param {number} input.stepsPerMinute  steps per minute shown on the console
 * @param {number} input.minutes         time on the machine
 * @param {number} [input.stepHeightM]   step height in metres
 * @param {string} [input.handrail]      key of HANDRAIL_FACTORS
 */
export function computeStairmasterCalories({
  weightKg,
  stepsPerMinute,
  minutes,
  stepHeightM = DEFAULT_STEP_HEIGHT_M,
  handrail = "none",
}) {
  if (
    !isFiniteNumber(weightKg) ||
    !isFiniteNumber(stepsPerMinute) ||
    !isFiniteNumber(minutes) ||
    !isFiniteNumber(stepHeightM)
  ) {
    return { error: "Enter a number in every field." };
  }
  if (weightKg < LIMITS.weightKg[0] || weightKg > LIMITS.weightKg[1]) {
    return { error: `Body weight should be between ${LIMITS.weightKg[0]} kg and ${LIMITS.weightKg[1]} kg.` };
  }
  if (stepsPerMinute < LIMITS.stepsPerMinute[0] || stepsPerMinute > LIMITS.stepsPerMinute[1]) {
    return {
      error: `Step rate should be between ${LIMITS.stepsPerMinute[0]} and ${LIMITS.stepsPerMinute[1]} steps per minute — check the console reading.`,
    };
  }
  if (minutes < LIMITS.minutes[0] || minutes > LIMITS.minutes[1]) {
    return { error: `Session length should be between ${LIMITS.minutes[0]} and ${LIMITS.minutes[1]} minutes.` };
  }
  if (stepHeightM < LIMITS.stepHeightM[0] || stepHeightM > LIMITS.stepHeightM[1]) {
    return {
      error: `Step height should be between ${LIMITS.stepHeightM[0]} m and ${LIMITS.stepHeightM[1]} m. A StairMaster step is 0.2032 m.`,
    };
  }
  const rail = HANDRAIL_FACTORS[handrail];
  if (!rail) return { error: "Choose how you use the handrails." };

  // Vertical climbing speed in metres per second.
  const climbSpeedMs = (stepsPerMinute * stepHeightM) / 60;

  // Mechanical power = m x g x vertical speed, reduced if the rails carry some load.
  const mechanicalWatts = weightKg * GRAVITY * climbSpeedMs * rail.factor;

  // Metabolic power the muscles must supply to produce that mechanical power.
  const activeWatts = mechanicalWatts / CLIMB_EFFICIENCY;
  const activeKcalPerMinute = (activeWatts * 60) / JOULES_PER_KCAL;

  const restingKcalPerMinute = (weightKg * RESTING_KCAL_PER_KG_PER_HOUR) / 60;
  const grossKcalPerMinute = activeKcalPerMinute + restingKcalPerMinute;

  const mets = grossKcalPerMinute / restingKcalPerMinute;

  const grossKcal = grossKcalPerMinute * minutes;
  const netKcal = activeKcalPerMinute * minutes;

  const totalSteps = stepsPerMinute * minutes;
  const verticalMetres = climbSpeedMs * 60 * minutes;
  const floors = verticalMetres / FLOOR_HEIGHT_M;

  return {
    climbSpeedMs,
    mechanicalWatts,
    activeWatts,
    grossKcalPerMinute,
    activeKcalPerMinute,
    restingKcalPerMinute,
    mets,
    grossKcal,
    netKcal,
    totalSteps,
    verticalMetres,
    floors,
    handrailLabel: rail.label,
    handrailFactor: rail.factor,
    minutesToBurnKgFat: netKcal > 0 ? (KCAL_PER_KG_FAT / netKcal) * minutes : null,
  };
}

/**
 * Minutes needed on the machine to reach a calorie target at the same settings.
 * Returns null rather than Infinity when the burn rate is zero or the target invalid.
 */
export function minutesForTarget(grossKcalPerMinute, targetKcal) {
  if (!isFiniteNumber(grossKcalPerMinute) || !isFiniteNumber(targetKcal)) return null;
  if (grossKcalPerMinute <= 0 || targetKcal <= 0) return null;
  return targetKcal / grossKcalPerMinute;
}
