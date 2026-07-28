/**
 * Bhangra calorie burn maths.
 *
 * Energy expenditure is derived the standard ACSM way:
 *   1 MET = 3.5 mL of oxygen per kg of body mass per minute
 *   1 litre of oxygen consumed ~= 5 kcal
 * so  kcal/min = MET x 3.5 x kg / 1000 x 5 = MET x 3.5 x kg / 200.
 *
 * Bhangra has no dedicated code in the Compendium of Physical Activities
 * (Ainsworth et al., 2011), so each level below is mapped to the nearest
 * published dance code and stated as such in the `basis` field.
 */

/** 1 lb in kg — international avoirdupois pound definition. */
export const LB_TO_KG = 0.45359237;

/** Oxygen uptake of 1 MET, mL O2 per kg per minute (ACSM definition). */
export const O2_ML_PER_KG_PER_MET = 3.5;

/** Energy yield of 1 litre of oxygen, kcal (mixed-diet respiratory quotient). */
export const KCAL_PER_LITRE_O2 = 5;

/** Resting metabolism, by definition 1 MET — subtracted to get net burn. */
export const RESTING_MET = 1;

/**
 * Standing between songs / catching breath.
 * Compendium 2011: "standing quietly" 1.3 MET, "standing, light effort" 2.0 MET.
 */
export const BREAK_MET = 1.5;

/** Energy density of stored body fat, kcal per kg (7.7 kcal per gram). */
export const KCAL_PER_KG_BODY_FAT = 7700;

export const MIN_WEIGHT_KG = 10;
export const MAX_WEIGHT_KG = 400;
export const MAX_MINUTES = 600;

export const BHANGRA_INTENSITIES = [
  {
    id: "learning",
    label: "Learning steps (walk-through pace)",
    met: 4.5,
    basis: "Compendium value for general ethnic/cultural dancing (4.5 MET).",
  },
  {
    id: "practice",
    label: "Steady practice / rehearsal",
    met: 6.5,
    basis: "Between cultural dancing (4.5) and general aerobic dance (7.3 MET).",
  },
  {
    id: "typical",
    label: "Typical bhangra set — jumps, shoulders, full body",
    met: 7.8,
    basis: "Compendium value for fast folk/ballroom dancing (7.8 MET).",
  },
  {
    id: "performance",
    label: "Performance / competition tempo, non-stop",
    met: 9.5,
    basis: "Comparable to high-impact step aerobics (8.5-10 MET).",
  },
];

const round = (value, places = 0) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

/** kcal burned per minute at a given MET for a given body mass in kg. */
export function metToKcalPerMinute(met, weightKg) {
  if (!Number.isFinite(met) || !Number.isFinite(weightKg)) return 0;
  if (met <= 0 || weightKg <= 0) return 0;
  return (met * O2_ML_PER_KG_PER_MET * weightKg * KCAL_PER_LITRE_O2) / 1000;
}

export function getBhangraIntensity(id) {
  return BHANGRA_INTENSITIES.find((item) => item.id === id) || null;
}

/**
 * @param {object} input
 * @param {number} input.weight        body weight in `weightUnit`
 * @param {"kg"|"lb"} input.weightUnit
 * @param {number} input.minutes       total time on the floor
 * @param {string} input.intensityId   one of BHANGRA_INTENSITIES ids
 * @param {number} input.activeSharePercent  share of the session actually dancing (10-100)
 * @param {number} input.sessionsPerWeek     how often the session repeats
 */
export function computeBhangraBurn({
  weight,
  weightUnit = "kg",
  minutes,
  intensityId,
  activeSharePercent = 100,
  sessionsPerWeek = 1,
}) {
  const numbers = [weight, minutes, activeSharePercent, sessionsPerWeek];
  if (numbers.some((value) => !Number.isFinite(value))) {
    return { error: "Enter a number in every field." };
  }

  const intensity = getBhangraIntensity(intensityId);
  if (!intensity) return { error: "Pick an intensity level." };

  const weightKg = weightUnit === "lb" ? weight * LB_TO_KG : weight;
  if (weightKg < MIN_WEIGHT_KG || weightKg > MAX_WEIGHT_KG) {
    return {
      error: `Body weight should be between ${MIN_WEIGHT_KG} kg and ${MAX_WEIGHT_KG} kg (about ${Math.round(
        MIN_WEIGHT_KG / LB_TO_KG,
      )}-${Math.round(MAX_WEIGHT_KG / LB_TO_KG)} lb).`,
    };
  }
  if (minutes <= 0) return { error: "Session length must be more than zero minutes." };
  if (minutes > MAX_MINUTES) {
    return { error: `Keep the session under ${MAX_MINUTES} minutes for a realistic estimate.` };
  }
  if (activeSharePercent < 10 || activeSharePercent > 100) {
    return { error: "Active dancing share should be between 10% and 100% of the session." };
  }
  if (sessionsPerWeek < 0 || sessionsPerWeek > 21) {
    return { error: "Sessions per week should be between 0 and 21." };
  }

  const activeMinutes = (minutes * activeSharePercent) / 100;
  const breakMinutes = minutes - activeMinutes;

  const dancingKcalPerMin = metToKcalPerMinute(intensity.met, weightKg);
  const breakKcalPerMin = metToKcalPerMinute(BREAK_MET, weightKg);
  const restingKcalPerMin = metToKcalPerMinute(RESTING_MET, weightKg);

  const grossKcal = dancingKcalPerMin * activeMinutes + breakKcalPerMin * breakMinutes;
  const restingKcal = restingKcalPerMin * minutes;
  const netKcal = Math.max(0, grossKcal - restingKcal);

  const averageMet = (intensity.met * activeMinutes + BREAK_MET * breakMinutes) / minutes;
  const weeklyGrossKcal = grossKcal * sessionsPerWeek;
  const weeklyNetKcal = netKcal * sessionsPerWeek;

  return {
    weightKg: round(weightKg, 1),
    met: intensity.met,
    intensityLabel: intensity.label,
    basis: intensity.basis,
    activeMinutes: round(activeMinutes, 1),
    breakMinutes: round(breakMinutes, 1),
    averageMet: round(averageMet, 2),
    kcalPerMinute: round(dancingKcalPerMin, 2),
    kcalPerHour: round(dancingKcalPerMin * 60),
    grossKcal: round(grossKcal),
    netKcal: round(netKcal),
    restingKcal: round(restingKcal),
    fatGramsEquivalent: round((netKcal / KCAL_PER_KG_BODY_FAT) * 1000, 1),
    weeklyGrossKcal: round(weeklyGrossKcal),
    weeklyNetKcal: round(weeklyNetKcal),
    weeksToBurnOneKgFat:
      weeklyNetKcal > 0 ? round(KCAL_PER_KG_BODY_FAT / weeklyNetKcal, 1) : null,
  };
}
