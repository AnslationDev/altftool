/**
 * Hip hop dance calorie maths.
 *
 * A choreography session is not one continuous effort: an hour in the studio
 * is typically a handful of full-out run-throughs separated by long stretches
 * of marking, counting and listening. This module prices those two states at
 * different MET values instead of averaging the whole hour at dance intensity.
 *
 * Energy model (ACSM):  kcal/min = MET x 3.5 x kg / 200
 *   1 MET = 3.5 mL O2 per kg per minute, 1 L O2 ~= 5 kcal.
 */

export const LB_TO_KG = 0.45359237;
export const O2_ML_PER_KG_PER_MET = 3.5;
export const KCAL_PER_LITRE_O2 = 5;
export const RESTING_MET = 1;
export const KCAL_PER_KG_BODY_FAT = 7700;
export const SECONDS_PER_MINUTE = 60;

/**
 * Marking, counting the eight and taking notes between runs.
 * Compendium 2011: "standing, light effort" 2.0 MET, "slow ballroom dance" 3.0 MET.
 */
export const MARKING_MET = 2.8;

export const MIN_WEIGHT_KG = 25;
export const MAX_WEIGHT_KG = 400;
export const MAX_MINUTES = 480;
export const MAX_RUNS = 100;
export const MIN_RUN_SECONDS = 10;
export const MAX_RUN_SECONDS = 600;

export const HIP_HOP_STYLES = [
  {
    id: "grooves",
    label: "Grooves and party steps, low travel",
    met: 5.5,
    basis: "Compendium value for low-impact aerobic dance (5.0-5.5 MET).",
  },
  {
    id: "choreo",
    label: "Standard choreography class",
    met: 7.3,
    basis: "Compendium value for general aerobic dancing (7.3 MET).",
  },
  {
    id: "heavy",
    label: "High-energy choreo — jumps, drops, floor work",
    met: 8.5,
    basis: "Compendium value for a bench-step aerobics class (8.5 MET).",
  },
  {
    id: "breaking",
    label: "Breaking / power moves",
    met: 9.0,
    basis: "Between vigorous calisthenics (8.0) and high step aerobics (10.0 MET).",
  },
];

const round = (value, places = 0) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

export function metToKcalPerMinute(met, weightKg) {
  if (!Number.isFinite(met) || !Number.isFinite(weightKg)) return 0;
  if (met <= 0 || weightKg <= 0) return 0;
  return (met * O2_ML_PER_KG_PER_MET * weightKg * KCAL_PER_LITRE_O2) / 1000;
}

export function getHipHopStyle(id) {
  return HIP_HOP_STYLES.find((item) => item.id === id) || null;
}

/**
 * @param {object} input
 * @param {number} input.weight        body weight in `weightUnit`
 * @param {"kg"|"lb"} input.weightUnit
 * @param {number} input.sessionMinutes total studio time
 * @param {string} input.styleId       one of HIP_HOP_STYLES ids
 * @param {number} input.runs          number of full-out run-throughs
 * @param {number} input.runSeconds    length of one run-through, seconds
 */
export function computeHipHopBurn({
  weight,
  weightUnit = "kg",
  sessionMinutes,
  styleId,
  runs,
  runSeconds,
}) {
  if (![weight, sessionMinutes, runs, runSeconds].every(Number.isFinite)) {
    return { error: "Enter a number in every field." };
  }
  const style = getHipHopStyle(styleId);
  if (!style) return { error: "Pick a hip hop style." };

  const weightKg = weightUnit === "lb" ? weight * LB_TO_KG : weight;
  if (weightKg < MIN_WEIGHT_KG || weightKg > MAX_WEIGHT_KG) {
    return { error: `Body weight should be between ${MIN_WEIGHT_KG} kg and ${MAX_WEIGHT_KG} kg.` };
  }
  if (sessionMinutes <= 0) return { error: "Session length must be more than zero minutes." };
  if (sessionMinutes > MAX_MINUTES) {
    return { error: `Session length should be ${MAX_MINUTES} minutes or less.` };
  }
  if (runs < 0 || runs > MAX_RUNS) {
    return { error: `Full-out run-throughs should be between 0 and ${MAX_RUNS}.` };
  }
  if (runSeconds < MIN_RUN_SECONDS || runSeconds > MAX_RUN_SECONDS) {
    return {
      error: `A run-through should be between ${MIN_RUN_SECONDS} and ${MAX_RUN_SECONDS} seconds long.`,
    };
  }

  const fullOutMinutes = (runs * runSeconds) / SECONDS_PER_MINUTE;
  if (fullOutMinutes > sessionMinutes) {
    return {
      error: "Run-throughs add up to more than the session length — lower the count or the run time.",
    };
  }

  const markingMinutes = sessionMinutes - fullOutMinutes;
  const fullOutKcalPerMin = metToKcalPerMinute(style.met, weightKg);
  const markingKcalPerMin = metToKcalPerMinute(MARKING_MET, weightKg);
  const restingKcalPerMin = metToKcalPerMinute(RESTING_MET, weightKg);

  const fullOutKcal = fullOutKcalPerMin * fullOutMinutes;
  const markingKcal = markingKcalPerMin * markingMinutes;
  const grossKcal = fullOutKcal + markingKcal;
  const restingKcal = restingKcalPerMin * sessionMinutes;
  const netKcal = Math.max(0, grossKcal - restingKcal);

  return {
    weightKg: round(weightKg, 1),
    met: style.met,
    styleLabel: style.label,
    basis: style.basis,
    fullOutMinutes: round(fullOutMinutes, 1),
    markingMinutes: round(markingMinutes, 1),
    fullOutSharePercent: round((fullOutMinutes / sessionMinutes) * 100),
    averageMet: round(
      (style.met * fullOutMinutes + MARKING_MET * markingMinutes) / sessionMinutes,
      2,
    ),
    kcalPerMinute: round(fullOutKcalPerMin, 2),
    kcalPerHour: round(fullOutKcalPerMin * 60),
    kcalPerRun: round((fullOutKcalPerMin * runSeconds) / SECONDS_PER_MINUTE, 1),
    fullOutKcal: round(fullOutKcal),
    markingKcal: round(markingKcal),
    grossKcal: round(grossKcal),
    restingKcal: round(restingKcal),
    netKcal: round(netKcal),
    fatGramsEquivalent: round((netKcal / KCAL_PER_KG_BODY_FAT) * 1000, 1),
  };
}
