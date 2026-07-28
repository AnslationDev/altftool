/**
 * Aerobics class calorie maths.
 *
 * Energy model (ACSM):  kcal/min = MET x 3.5 x kg / 200
 *   1 MET = 3.5 mL O2 per kg per minute, 1 L O2 ~= 5 kcal.
 *
 * Aerobics is unusually well covered by the Compendium of Physical Activities
 * (Ainsworth et al., 2011), which lists separate codes for low impact, high
 * impact, water aerobics and step classes at three different step heights.
 * Step height matters a lot: a 10-12 inch riser nearly doubles a 4-inch class.
 */

export const LB_TO_KG = 0.45359237;
export const O2_ML_PER_KG_PER_MET = 3.5;
export const KCAL_PER_LITRE_O2 = 5;
export const RESTING_MET = 1;
export const KCAL_PER_KG_BODY_FAT = 7700;

/** Compendium: walking 4.8 km/h (3 mph), level, moderate pace. */
export const WALK_REFERENCE = { met: 3.5, speedKmh: 4.8, label: "brisk walk at 4.8 km/h" };

/** Compendium: running 9.7 km/h (6 mph, 10 min per mile). */
export const RUN_REFERENCE = { met: 9.8, speedKmh: 9.7, label: "run at 9.7 km/h" };

/** WHO physical activity guidelines: 6 MET and above is vigorous intensity. */
export const VIGOROUS_MET_THRESHOLD = 6;

export const MIN_WEIGHT_KG = 25;
export const MAX_WEIGHT_KG = 400;
export const MAX_MINUTES = 300;

export const AEROBICS_CLASSES = [
  {
    id: "low",
    label: "Low impact aerobics",
    met: 5.0,
    basis: "Compendium value for low-impact aerobic dance (5.0 MET).",
  },
  {
    id: "water",
    label: "Water aerobics / aqua fitness",
    met: 5.3,
    basis: "Compendium value for water aerobics and water calisthenics (5.3 MET).",
  },
  {
    id: "step4",
    label: "Step aerobics, 4-inch step",
    met: 5.5,
    basis: "Compendium value for aerobic step class with a 4-inch step (5.5 MET).",
  },
  {
    id: "general",
    label: "General aerobics, mixed impact",
    met: 6.5,
    basis: "Between the low-impact (5.0) and high-impact (7.3 MET) compendium codes.",
  },
  {
    id: "high",
    label: "High impact aerobics",
    met: 7.3,
    basis: "Compendium value for general and high-impact aerobic dance (7.3 MET).",
  },
  {
    id: "step6",
    label: "Bench step class, 6-8 inch step",
    met: 8.5,
    basis: "Compendium value for a step class with a 6-8 inch step (8.5 MET).",
  },
  {
    id: "step10",
    label: "Step aerobics, 10-12 inch step",
    met: 10.0,
    basis: "Compendium value for a step class with a 10-12 inch step (10.0 MET).",
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

export function getAerobicsClass(id) {
  return AEROBICS_CLASSES.find((item) => item.id === id) || null;
}

/**
 * Minutes and distance of a reference activity that would cost the same energy.
 */
export function equivalentEffort(kcal, weightKg, reference) {
  const perMinute = metToKcalPerMinute(reference.met, weightKg);
  if (!(perMinute > 0) || !(kcal > 0)) return { minutes: 0, km: 0 };
  const minutes = kcal / perMinute;
  return { minutes, km: (reference.speedKmh * minutes) / 60 };
}

/**
 * @param {object} input
 * @param {number} input.weight body weight in `weightUnit`
 * @param {"kg"|"lb"} input.weightUnit
 * @param {number} input.minutes class length
 * @param {string} input.classId one of AEROBICS_CLASSES ids
 */
export function computeAerobicsBurn({ weight, weightUnit = "kg", minutes, classId }) {
  if (![weight, minutes].every(Number.isFinite)) {
    return { error: "Enter your body weight and the class length." };
  }
  const aerobicsClass = getAerobicsClass(classId);
  if (!aerobicsClass) return { error: "Pick a class type." };

  const weightKg = weightUnit === "lb" ? weight * LB_TO_KG : weight;
  if (weightKg < MIN_WEIGHT_KG || weightKg > MAX_WEIGHT_KG) {
    return { error: `Body weight should be between ${MIN_WEIGHT_KG} kg and ${MAX_WEIGHT_KG} kg.` };
  }
  if (minutes <= 0) return { error: "Class length must be more than zero minutes." };
  if (minutes > MAX_MINUTES) return { error: `Class length should be ${MAX_MINUTES} minutes or less.` };

  const kcalPerMinute = metToKcalPerMinute(aerobicsClass.met, weightKg);
  const grossKcal = kcalPerMinute * minutes;
  const restingKcal = metToKcalPerMinute(RESTING_MET, weightKg) * minutes;
  const netKcal = Math.max(0, grossKcal - restingKcal);

  const walk = equivalentEffort(grossKcal, weightKg, WALK_REFERENCE);
  const run = equivalentEffort(grossKcal, weightKg, RUN_REFERENCE);

  return {
    weightKg: round(weightKg, 1),
    met: aerobicsClass.met,
    classLabel: aerobicsClass.label,
    basis: aerobicsClass.basis,
    isVigorous: aerobicsClass.met >= VIGOROUS_MET_THRESHOLD,
    intensityBand: aerobicsClass.met >= VIGOROUS_MET_THRESHOLD ? "Vigorous" : "Moderate",
    kcalPerMinute: round(kcalPerMinute, 2),
    kcalPerHour: round(kcalPerMinute * 60),
    grossKcal: round(grossKcal),
    restingKcal: round(restingKcal),
    netKcal: round(netKcal),
    fatGramsEquivalent: round((netKcal / KCAL_PER_KG_BODY_FAT) * 1000, 1),
    walkMinutes: round(walk.minutes, 1),
    walkKm: round(walk.km, 2),
    runMinutes: round(run.minutes, 1),
    runKm: round(run.km, 2),
  };
}
