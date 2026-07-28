/**
 * Yoga session energy expenditure from published MET values.
 *
 * Formula (ACSM): 1 MET = 3.5 mL O2 per kg per minute, and 1 L of O2 releases
 * about 5 kcal, so
 *     gross kcal/min = MET x 3.5 x bodyweight(kg) / 200
 * "Net" subtracts the 1 MET you would have burned sitting still, which is the
 * honest number if you want the extra cost of practising.
 *
 * MET values marked `derived: false` are taken directly from the 2011
 * Compendium of Physical Activities. The rest are positioned against those
 * anchors and are clearly flagged as estimates.
 */

/** ACSM constants. */
export const ML_O2_PER_MET = 3.5; // mL O2 per kg per minute at 1 MET
export const KCAL_PER_L_O2 = 5; // kcal released per litre of oxygen
export const RESTING_MET = 1;

/** WHO moderate-intensity band, in METs. */
export const MODERATE_MET_MIN = 3;
export const MODERATE_MET_MAX = 5.9;
/** WHO adult target: 150 minutes of moderate activity a week. */
export const WHO_WEEKLY_MODERATE_MINUTES = 150;

/** Pounds to kilograms (international avoirdupois pound). */
export const KG_PER_POUND = 0.45359237;

export const MIN_WEIGHT_KG = 25;
export const MAX_WEIGHT_KG = 300;
export const MIN_MINUTES = 1;
export const MAX_MINUTES = 300;

export const STYLES = [
  {
    id: "restorative",
    name: "Restorative / Yin",
    met: 2.0,
    derived: true,
    source: "positioned at the Compendium 02110 value for breath-led yoga (2.0 METs)",
    note: "Long supported holds with props. Energy cost is close to quiet sitting.",
  },
  {
    id: "nadisodhana",
    name: "Breathwork-led practice (nadi shodhana)",
    met: 2.0,
    derived: false,
    source: "Compendium of Physical Activities 02110, yoga Nadisodhana",
    note: "Seated pranayama practice with minimal movement.",
  },
  {
    id: "hatha",
    name: "Hatha (general class)",
    met: 2.5,
    derived: false,
    source: "Compendium of Physical Activities 02150, yoga Hatha",
    note: "Held postures with rests between them — the default for a general class.",
  },
  {
    id: "iyengar",
    name: "Iyengar (prop-based, long holds)",
    met: 2.5,
    derived: true,
    source: "positioned at the Compendium Hatha value (2.5 METs)",
    note: "Precise alignment and long static holds, with props doing part of the work.",
  },
  {
    id: "kundalini",
    name: "Kundalini",
    met: 2.5,
    derived: true,
    source: "positioned at the Compendium Hatha value (2.5 METs)",
    note: "Kriyas, repetitive movement and breathwork with seated meditation.",
  },
  {
    id: "sivananda",
    name: "Sivananda (12 basic postures)",
    met: 2.5,
    derived: true,
    source: "positioned at the Compendium Hatha value (2.5 METs)",
    note: "Classical sequence with relaxation between postures.",
  },
  {
    id: "aerial",
    name: "Aerial / hammock yoga",
    met: 3.0,
    derived: true,
    source: "positioned between the Compendium Hatha (2.5) and Surya Namaskar (3.3) values",
    note: "Suspended postures with sustained grip and core work.",
  },
  {
    id: "surya",
    name: "Surya Namaskar practice",
    met: 3.3,
    derived: false,
    source: "Compendium of Physical Activities 02135, yoga Surya Namaskar",
    note: "Continuous sun salutations with little rest.",
  },
  {
    id: "vinyasa",
    name: "Vinyasa flow",
    met: 3.3,
    derived: true,
    source: "positioned at the Compendium Surya Namaskar value (3.3 METs)",
    note: "Breath-linked flowing sequences with short holds.",
  },
  {
    id: "hot",
    name: "Hot / Bikram (heated room)",
    met: 3.5,
    derived: true,
    source: "positioned between the Compendium Surya Namaskar (3.3) and Power (4.0) values",
    note: "Heat raises heart rate and sweat loss far more than it raises energy cost — most of the weight lost is water.",
  },
  {
    id: "ashtanga",
    name: "Ashtanga (primary series)",
    met: 4.0,
    derived: true,
    source: "positioned at the Compendium Power yoga value (4.0 METs)",
    note: "Fixed vigorous sequence with jump-throughs and continuous movement.",
  },
  {
    id: "power",
    name: "Power yoga",
    met: 4.0,
    derived: false,
    source: "Compendium of Physical Activities 02120, yoga Power",
    note: "Strength-focused, continuously moving class.",
  },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Look up a style by id. */
export function getStyle(id) {
  return STYLES.find((style) => style.id === id) || null;
}

/** Convert pounds to kilograms. */
export function poundsToKg(pounds) {
  if (!isNum(pounds)) return NaN;
  return pounds * KG_PER_POUND;
}

/**
 * Estimate the energy cost of a yoga session.
 *
 * @param {object} input
 * @param {string} input.styleId
 * @param {number} input.minutes
 * @param {number} input.weight
 * @param {"kg"|"lb"} [input.weightUnit]
 * @param {number} [input.sessionsPerWeek]
 * @returns {object} result or { error }
 */
export function estimateSession({
  styleId,
  minutes,
  weight,
  weightUnit = "kg",
  sessionsPerWeek = 1,
} = {}) {
  const style = getStyle(styleId);
  if (!style) return { error: "Choose a yoga style." };
  if (!isNum(minutes) || !isNum(weight) || !isNum(sessionsPerWeek)) {
    return { error: "Session length, body weight and sessions per week must all be numbers." };
  }
  if (weightUnit !== "kg" && weightUnit !== "lb") {
    return { error: "Body weight must be given in kilograms or pounds." };
  }

  const weightKg = weightUnit === "lb" ? poundsToKg(weight) : weight;
  if (weightKg < MIN_WEIGHT_KG || weightKg > MAX_WEIGHT_KG) {
    return {
      error: `Body weight should be between ${MIN_WEIGHT_KG} kg and ${MAX_WEIGHT_KG} kg (${Math.round(
        MIN_WEIGHT_KG / KG_PER_POUND,
      )}–${Math.round(MAX_WEIGHT_KG / KG_PER_POUND)} lb).`,
    };
  }
  if (minutes < MIN_MINUTES || minutes > MAX_MINUTES) {
    return { error: `Session length should be between ${MIN_MINUTES} and ${MAX_MINUTES} minutes.` };
  }
  if (sessionsPerWeek < 0 || sessionsPerWeek > 21) {
    return { error: "Sessions per week should be between 0 and 21." };
  }

  // kcal/min = MET x 3.5 x kg / 200. The 200 is 1000 mL/L divided by 5 kcal/L.
  const perMinuteFactor = (ML_O2_PER_MET * weightKg * KCAL_PER_L_O2) / 1000;
  const grossPerMinute = style.met * perMinuteFactor;
  const netPerMinute = Math.max(0, style.met - RESTING_MET) * perMinuteFactor;

  const grossCalories = grossPerMinute * minutes;
  const netCalories = netPerMinute * minutes;
  const metMinutes = style.met * minutes;

  const isModerate = style.met >= MODERATE_MET_MIN && style.met <= MODERATE_MET_MAX;
  const weeklyMinutes = minutes * sessionsPerWeek;

  return {
    style,
    weightKg,
    minutes,
    grossPerMinute,
    netPerMinute,
    grossCalories,
    netCalories,
    metMinutes,
    isModerate,
    weeklyMinutes,
    weeklyGrossCalories: grossCalories * sessionsPerWeek,
    weeklyMetMinutes: metMinutes * sessionsPerWeek,
    whoTargetPercent: isModerate
      ? Math.min(100, (weeklyMinutes / WHO_WEEKLY_MODERATE_MINUTES) * 100)
      : 0,
  };
}

/**
 * Compare every style at the same weight and duration.
 * @returns {Array} rows, each with the style and its gross calorie figure, or [] on bad input.
 */
export function compareStyles({ minutes, weight, weightUnit = "kg" } = {}) {
  return STYLES.map((style) => {
    const result = estimateSession({ styleId: style.id, minutes, weight, weightUnit });
    return result.error
      ? { style, error: result.error }
      : { style, grossCalories: result.grossCalories, metMinutes: result.metMinutes };
  });
}
