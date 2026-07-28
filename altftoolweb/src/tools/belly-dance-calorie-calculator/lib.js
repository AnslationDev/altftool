/**
 * Belly dance calorie maths.
 *
 * Energy model (ACSM):  kcal/min = MET x 3.5 x kg / 200
 *   1 MET = 3.5 mL O2 per kg per minute, 1 L O2 ~= 5 kcal.
 *
 * Belly dance is one of the few dance forms named explicitly in the
 * Compendium of Physical Activities (Ainsworth et al., 2011), inside the
 * "ethnic or cultural dancing" code at 4.5 MET. The other levels here are
 * scaled around that anchor and each states its basis.
 */

export const LB_TO_KG = 0.45359237;
export const O2_ML_PER_KG_PER_MET = 3.5;
export const KCAL_PER_LITRE_O2 = 5;
export const RESTING_MET = 1;
export const KCAL_PER_KG_BODY_FAT = 7700;

/**
 * Load carried in the hands costs more than the same load on the torso.
 * Soule & Goldman (1969) measured hand-carried load at roughly 1.4-1.9 times
 * torso cost during walking; 1.7 is used here as the midpoint.
 */
export const HAND_LOAD_EQUIVALENCE = 1.7;

export const MIN_WEIGHT_KG = 25;
export const MAX_WEIGHT_KG = 400;
export const MAX_MINUTES = 300;
export const MAX_TARGET_KCAL = 5000;

export const BELLY_DANCE_STYLES = [
  {
    id: "drills",
    label: "Slow isolation drills and technique",
    met: 3.5,
    basis: "Between standing light effort (2.0) and cultural dancing (4.5 MET).",
  },
  {
    id: "class",
    label: "Standard belly dance class",
    met: 4.5,
    basis:
      "Compendium code for ethnic or cultural dancing, which names belly dancing explicitly (4.5 MET).",
  },
  {
    id: "tribal",
    label: "Tribal fusion — layering and travelling steps",
    met: 5.5,
    basis: "Above cultural dancing (4.5), below general aerobic dance (7.3 MET).",
  },
  {
    id: "drumsolo",
    label: "Drum solo or performance set",
    met: 6.0,
    basis: "Sustained fast shimmy work, at the vigorous-intensity threshold (6.0 MET).",
  },
  {
    id: "cardio",
    label: "Fitness-style cardio belly dance",
    met: 6.5,
    basis: "Between low-impact aerobic dance (5.0) and general aerobic dance (7.3 MET).",
  },
];

export const BELLY_DANCE_PROPS = [
  { id: "none", label: "No prop", kg: 0 },
  { id: "zills", label: "Zills / finger cymbals", kg: 0.1 },
  { id: "veil", label: "Silk veil", kg: 0.3 },
  { id: "cane", label: "Cane (assaya)", kg: 0.5 },
  { id: "sword", label: "Balance sword", kg: 1.2 },
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

export function getBellyDanceStyle(id) {
  return BELLY_DANCE_STYLES.find((item) => item.id === id) || null;
}

export function getBellyDanceProp(id) {
  return BELLY_DANCE_PROPS.find((item) => item.id === id) || null;
}

/**
 * @param {object} input
 * @param {number} input.weight  body weight in `weightUnit`
 * @param {"kg"|"lb"} input.weightUnit
 * @param {number} input.minutes time dancing
 * @param {string} input.styleId one of BELLY_DANCE_STYLES ids
 * @param {string} input.propId  one of BELLY_DANCE_PROPS ids
 * @param {number} [input.targetKcal] optional calorie goal to solve for minutes
 */
export function computeBellyDanceBurn({
  weight,
  weightUnit = "kg",
  minutes,
  styleId,
  propId = "none",
  targetKcal,
}) {
  if (![weight, minutes].every(Number.isFinite)) {
    return { error: "Enter your body weight and how long you danced." };
  }
  const style = getBellyDanceStyle(styleId);
  if (!style) return { error: "Pick a belly dance style." };
  const prop = getBellyDanceProp(propId);
  if (!prop) return { error: "Pick a prop, or choose 'No prop'." };

  const weightKg = weightUnit === "lb" ? weight * LB_TO_KG : weight;
  if (weightKg < MIN_WEIGHT_KG || weightKg > MAX_WEIGHT_KG) {
    return { error: `Body weight should be between ${MIN_WEIGHT_KG} kg and ${MAX_WEIGHT_KG} kg.` };
  }
  if (minutes <= 0) return { error: "Time danced must be more than zero minutes." };
  if (minutes > MAX_MINUTES) return { error: `Time danced should be ${MAX_MINUTES} minutes or less.` };

  const effectiveKg = weightKg + prop.kg * HAND_LOAD_EQUIVALENCE;
  const kcalPerMinute = metToKcalPerMinute(style.met, effectiveKg);
  const grossKcal = kcalPerMinute * minutes;
  const restingKcal = metToKcalPerMinute(RESTING_MET, weightKg) * minutes;
  const netKcal = Math.max(0, grossKcal - restingKcal);
  const propExtraKcal = grossKcal - metToKcalPerMinute(style.met, weightKg) * minutes;

  let minutesForTarget = null;
  let targetNote = null;
  if (Number.isFinite(targetKcal)) {
    if (targetKcal <= 0) {
      targetNote = "Enter a calorie goal above zero.";
    } else if (targetKcal > MAX_TARGET_KCAL) {
      targetNote = `Keep the calorie goal at ${MAX_TARGET_KCAL} kcal or below.`;
    } else if (kcalPerMinute > 0) {
      minutesForTarget = targetKcal / kcalPerMinute;
    }
  }

  return {
    weightKg: round(weightKg, 1),
    effectiveKg: round(effectiveKg, 2),
    met: style.met,
    styleLabel: style.label,
    basis: style.basis,
    propLabel: prop.label,
    propKg: prop.kg,
    kcalPerMinute: round(kcalPerMinute, 2),
    kcalPerHour: round(kcalPerMinute * 60),
    grossKcal: round(grossKcal),
    restingKcal: round(restingKcal),
    netKcal: round(netKcal),
    propExtraKcal: round(propExtraKcal, 1),
    fatGramsEquivalent: round((netKcal / KCAL_PER_KG_BODY_FAT) * 1000, 1),
    minutesForTarget: minutesForTarget === null ? null : round(minutesForTarget, 1),
    targetNote,
  };
}
