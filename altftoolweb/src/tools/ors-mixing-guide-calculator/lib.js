/**
 * ORS Mixing Guide Calculator — pure calculation module.
 *
 * Two independent calculations:
 *   1. How to mix a correct solution — packaged sachets for a given volume of
 *      water, or the WHO/UNICEF homemade sugar-salt solution when no sachet is
 *      available.
 *   2. How much to give — the WHO diarrhoea treatment plans A and B.
 *
 * Getting the ratio wrong is the whole risk. Too little water makes the
 * solution hypertonic and pulls water INTO the gut, which worsens diarrhoea and
 * can cause hypernatraemia; too much water dilutes the glucose that the
 * sodium-glucose co-transport mechanism depends on, so absorption falls off.
 */

/**
 * WHO/UNICEF low-osmolarity ORS formulation, adopted 2003 and standard since.
 * Grams per litre of the dry salts, and the resulting molar composition.
 */
export const WHO_ORS_FORMULATION = {
  gramsPerLitre: [
    ["Sodium chloride", 2.6],
    ["Glucose, anhydrous", 13.5],
    ["Potassium chloride", 1.5],
    ["Trisodium citrate, dihydrate", 2.9],
  ],
  mmolPerLitre: [
    ["Sodium", 75],
    ["Chloride", 65],
    ["Glucose, anhydrous", 75],
    ["Potassium", 20],
    ["Citrate", 10],
  ],
  totalOsmolarity: 245, // mOsm/L
};

/** WHO/UNICEF homemade sugar-salt solution, per litre of clean water:
 *  six level teaspoons of sugar and half a level teaspoon of salt. */
export const HOMEMADE_SUGAR_TSP_PER_LITRE = 6;
export const HOMEMADE_SALT_TSP_PER_LITRE = 0.5;
/** Level-teaspoon masses used to convert the spoon measures to grams. */
export const GRAMS_PER_TSP_SUGAR = 4.2;
export const GRAMS_PER_TSP_SALT = 5.7;

/** Prepared solution must be discarded after this many hours (WHO). */
export const DISCARD_AFTER_HOURS = 24;

/** WHO Plan B: 75 ml of ORS per kg of body weight over the first 4 hours. */
export const PLAN_B_ML_PER_KG = 75;
export const PLAN_B_HOURS = 4;

/**
 * WHO Plan A, extra fluid after each loose stool.
 * Under 2 years: 50-100 ml. 2-10 years: 100-200 ml.
 * Over 10 years: as much as the person wants; 200 ml is the usual practical amount.
 */
export const PLAN_A_PER_STOOL = [
  { maxMonths: 24, label: "Under 2 years", min: 50, max: 100 },
  { maxMonths: 120, label: "2 to 10 years", min: 100, max: 200 },
  { maxMonths: Infinity, label: "Over 10 years", min: 200, max: null },
];

/** WHO zinc supplementation alongside ORS, for 10-14 days. */
export const ZINC_MG_UNDER_6_MONTHS = 10;
export const ZINC_MG_6_MONTHS_AND_OVER = 20;
export const ZINC_DAYS_MIN = 10;
export const ZINC_DAYS_MAX = 14;

/** Common sachet sizes, expressed as the litres of water each sachet makes. */
export const SACHET_SIZES = [
  { id: "l1", label: "Makes 1 litre (WHO standard sachet)", litres: 1 },
  { id: "ml500", label: "Makes 500 ml", litres: 0.5 },
  { id: "ml200", label: "Makes 200 ml", litres: 0.2 },
];

function roundTo(value, dp = 2) {
  const factor = 10 ** dp;
  return Math.round(value * factor) / factor;
}

/** Format a teaspoon count as a readable fraction where it lands on one. */
export function formatTeaspoons(tsp) {
  const rounded = Math.round(tsp * 4) / 4;
  const whole = Math.floor(rounded);
  const fraction = rounded - whole;
  const names = { 0.25: "1/4", 0.5: "1/2", 0.75: "3/4" };
  if (fraction === 0) return String(whole);
  if (whole === 0) return names[fraction];
  return `${whole} ${names[fraction]}`;
}

/**
 * Mixing instructions for a chosen volume of clean water.
 *
 * @param {object} input
 * @param {number} input.waterMl      volume of clean water, millilitres
 * @param {number} input.sachetLitres litres of water one sachet is designed for
 */
export function computeMixing({ waterMl, sachetLitres = 1 } = {}) {
  const water = Number(waterMl);
  const sachet = Number(sachetLitres);

  if (!Number.isFinite(water) || !Number.isFinite(sachet)) {
    return { error: "Enter a number for the water volume." };
  }
  if (water <= 0) return { error: "Water volume must be greater than zero." };
  if (water > 5000) return { error: "Mix 5 litres or less at a time — prepared solution keeps only 24 hours." };
  if (!(sachet > 0)) return { error: "Choose a valid sachet size." };

  const litres = water / 1000;
  const sachetsExact = litres / sachet;
  const sachetsWhole = Math.round(sachetsExact * 100) / 100;
  const needsPartialSachet = Math.abs(sachetsExact - Math.round(sachetsExact)) > 0.001;

  const sugarTsp = HOMEMADE_SUGAR_TSP_PER_LITRE * litres;
  const saltTsp = HOMEMADE_SALT_TSP_PER_LITRE * litres;

  return {
    waterMl: Math.round(water),
    litres: roundTo(litres, 3),
    sachets: sachetsWhole,
    sachetLitres: sachet,
    needsPartialSachet,
    recommendedWaterForWholeSachetsMl: Math.round(Math.max(1, Math.round(sachetsExact)) * sachet * 1000),
    sugarTsp: roundTo(sugarTsp, 2),
    saltTsp: roundTo(saltTsp, 3),
    sugarTspLabel: formatTeaspoons(sugarTsp),
    saltTspLabel: formatTeaspoons(saltTsp),
    sugarGrams: roundTo(sugarTsp * GRAMS_PER_TSP_SUGAR, 1),
    saltGrams: roundTo(saltTsp * GRAMS_PER_TSP_SALT, 2),
    discardAfterHours: DISCARD_AFTER_HOURS,
  };
}

/**
 * How much ORS to give, following the WHO diarrhoea treatment plans.
 *
 * @param {object} input
 * @param {number} input.ageMonths    age in months
 * @param {number} input.weightKg     body weight in kilograms
 * @param {number} input.looseStools  loose stools expected or already passed today
 * @param {string} input.dehydration  "none" | "some" | "severe"
 */
export function computeReplacement({
  ageMonths,
  weightKg,
  looseStools = 0,
  dehydration = "none",
} = {}) {
  const months = Number(ageMonths);
  const weight = Number(weightKg);
  const stools = Number(looseStools);

  if (![months, weight, stools].every((v) => Number.isFinite(v))) {
    return { error: "Enter a number for age, weight and number of loose stools." };
  }
  if (months < 0 || months > 1200) return { error: "Enter an age between 0 and 100 years." };
  if (weight <= 0 || weight > 200) return { error: "Enter a weight between 1 kg and 200 kg." };
  if (stools < 0 || stools > 40) return { error: "Enter between 0 and 40 loose stools." };

  if (dehydration === "severe") {
    return {
      error:
        "Severe dehydration is a medical emergency and needs intravenous fluids at a health facility — go now. Signs include being unable to drink, lethargy or unconsciousness, sunken eyes and skin that stays pinched. Do not try to treat it at home with ORS alone.",
    };
  }

  const band =
    PLAN_A_PER_STOOL.find((entry) => months < entry.maxMonths) ||
    PLAN_A_PER_STOOL[PLAN_A_PER_STOOL.length - 1];

  const perStoolMin = band.min;
  const perStoolMax = band.max;
  const planAMinMl = perStoolMin * stools;
  const planAMaxMl = perStoolMax === null ? null : perStoolMax * stools;

  const planBMl = dehydration === "some" ? PLAN_B_ML_PER_KG * weight : 0;
  const planBPerHourMl = planBMl / PLAN_B_HOURS;

  const zincMg = months < 6 ? ZINC_MG_UNDER_6_MONTHS : ZINC_MG_6_MONTHS_AND_OVER;

  const isPlanB = dehydration === "some";
  const headlineMl = isPlanB ? planBMl : planAMinMl;

  return {
    plan: isPlanB ? "B" : "A",
    planLabel: isPlanB
      ? "Plan B — some dehydration"
      : "Plan A — no visible dehydration, treat at home",
    ageBandLabel: band.label,
    perStoolMin,
    perStoolMax,
    perStoolNote:
      perStoolMax === null
        ? "WHO advises giving as much fluid as the person wants; 200 ml after each loose stool is the usual practical amount."
        : `Give ${perStoolMin}-${perStoolMax} ml of ORS after each loose stool.`,
    looseStools: stools,
    planAMinMl,
    planAMaxMl,
    planBMl: Math.round(planBMl),
    planBPerHourMl: Math.round(planBPerHourMl),
    planBHours: PLAN_B_HOURS,
    headlineMl: Math.round(headlineMl),
    headlineMaxMl: isPlanB ? null : planAMaxMl,
    zincMg,
    zincDaysMin: ZINC_DAYS_MIN,
    zincDaysMax: ZINC_DAYS_MAX,
  };
}

export default computeMixing;
