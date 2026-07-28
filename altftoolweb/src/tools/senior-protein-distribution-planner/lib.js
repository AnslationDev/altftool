/**
 * Senior protein distribution planner.
 *
 * Sources for every constant below:
 *  - PROT-AGE Study Group (Bauer et al., JAMDA 2013): healthy adults >65 need
 *    1.0-1.2 g protein/kg body weight/day; those who exercise or have acute or
 *    chronic illness need 1.2-1.5 g/kg/day; severe illness or injury up to 2.0.
 *  - ESPEN expert group on protein in older people (Deutz et al., Clin Nutr 2014):
 *    same 1.0-1.2 and 1.2-1.5 bands, and >= 25-30 g protein per meal containing
 *    ~2.5-2.8 g leucine to overcome anabolic resistance.
 *  - US/Canada DRI (IOM 2005): RDA for protein is 0.8 g/kg/day for all adults
 *    over 18 - used here only as the "bare minimum" comparison line.
 *  - Moore et al., J Gerontol A Biol Sci Med Sci 2015: per-meal dose that maximises
 *    muscle protein synthesis in older adults is ~0.40 g/kg body weight.
 *  - Res et al., Med Sci Sports Exerc 2012: 40 g casein before sleep raises
 *    overnight muscle protein synthesis; 30 g is the commonly cited practical floor.
 *  - KDOQI 2020 nutrition guideline: metabolically stable CKD stages 3-5 not on
 *    dialysis is 0.55-0.60 g/kg/day, which is why that path is advice-only here.
 */

/** g protein per kg bodyweight per day, by clinical situation. */
export const PROTEIN_BANDS = {
  healthy: {
    label: "Healthy, no acute illness",
    low: 1.0, // PROT-AGE / ESPEN lower bound for adults over 65
    high: 1.2, // PROT-AGE / ESPEN upper bound for healthy older adults
    note: "PROT-AGE and ESPEN both put healthy adults over 65 at 1.0-1.2 g/kg/day.",
  },
  chronic: {
    label: "Chronic illness or frailty",
    low: 1.2, // PROT-AGE: acute or chronic disease
    high: 1.5,
    note: "Chronic disease, frailty or unintentional weight loss shifts the band up to 1.2-1.5 g/kg/day.",
  },
  severe: {
    label: "Severe illness, injury or rehab",
    low: 1.5, // PROT-AGE: severe illness / injury / marked malnutrition
    high: 2.0,
    note: "Severe illness, major surgery or rehabilitation can need up to 2.0 g/kg/day under supervision.",
  },
  kidney: {
    label: "Reduced kidney function (not on dialysis)",
    low: 0.55, // KDOQI 2020, metabolically stable CKD 3-5 without dialysis
    high: 0.8,
    note: "Restricted protein is a prescription, not a self-help target - the figures shown are the KDOQI range only.",
  },
};

/** How far up the band the activity level pushes the target (0 = low end, 1 = high end). */
export const ACTIVITY_OFFSETS = {
  sedentary: { label: "Mostly seated, little walking", offset: 0 },
  light: { label: "Daily walking or light chores", offset: 0.5 },
  active: { label: "Resistance training 2+ times a week", offset: 1 },
};

/** RDA floor from the 2005 DRI report, g/kg/day. */
export const RDA_PER_KG = 0.8;

/** Per-meal dose that maximises muscle protein synthesis in older adults (Moore 2015). */
export const MPS_DOSE_PER_KG = 0.4;

/** Absolute per-meal floor from the ESPEN expert group, grams. */
export const MPS_ABSOLUTE_FLOOR_G = 25;

/** Practical pre-sleep casein dose, grams (Res 2012 used 40 g; 30 g is the usual floor). */
export const PRE_SLEEP_G = 30;

export const MIN_WEIGHT_KG = 25;
export const MAX_WEIGHT_KG = 250;
export const MIN_AGE = 45;
export const MAX_AGE = 120;
export const MIN_MEALS = 2;
export const MAX_MEALS = 5;

const MEAL_NAMES = {
  2: ["Meal 1", "Meal 2"],
  3: ["Breakfast", "Lunch", "Dinner"],
  4: ["Breakfast", "Lunch", "Evening snack", "Dinner"],
  5: ["Breakfast", "Mid-morning", "Lunch", "Evening snack", "Dinner"],
};

/**
 * Common protein sources with grams of protein in one household portion.
 * Values rounded from USDA FoodData Central and IFCT 2017 (Indian Food Composition Tables).
 */
export const PROTEIN_FOODS = [
  { key: "egg", label: "Boiled egg (1 large, 50 g)", grams: 6.3 },
  { key: "milk", label: "Milk (1 cup, 240 ml)", grams: 8 },
  { key: "curd", label: "Greek yoghurt / hung curd (150 g)", grams: 15 },
  { key: "paneer", label: "Paneer (100 g)", grams: 18 },
  { key: "tofu", label: "Firm tofu (100 g)", grams: 12 },
  { key: "dal", label: "Cooked toor dal (1 katori, 150 g)", grams: 6 },
  { key: "chana", label: "Cooked chana / chickpeas (1 cup, 165 g)", grams: 15 },
  { key: "chicken", label: "Cooked chicken breast (100 g)", grams: 31 },
  { key: "fish", label: "Cooked fish, rohu or salmon (100 g)", grams: 22 },
  { key: "whey", label: "Whey protein (1 scoop, 30 g)", grams: 24 },
  { key: "almonds", label: "Almonds (30 g, about 23 nuts)", grams: 6 },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Round to a whole gram but keep the parts summing to the whole. */
function splitEvenly(total, parts) {
  if (parts <= 0) return [];
  const base = Math.floor(total / parts);
  let remainder = Math.round(total) - base * parts;
  const out = [];
  for (let i = 0; i < parts; i += 1) {
    let value = base;
    if (remainder > 0) {
      value += 1;
      remainder -= 1;
    }
    out.push(value);
  }
  return out;
}

/**
 * Build a full day of protein targets for an older adult.
 *
 * @param {object} input
 * @param {number} input.weightKg   body weight in kilograms
 * @param {number} input.ageYears   age in years
 * @param {string} input.status     key of PROTEIN_BANDS
 * @param {string} input.activity   key of ACTIVITY_OFFSETS
 * @param {number} input.meals      number of main eating occasions (2-5)
 * @param {boolean} input.preSleep  carve out a pre-sleep casein feeding
 * @returns {object} plan, or { error } when the input cannot produce a real answer
 */
export function computeProteinPlan({
  weightKg,
  ageYears,
  status = "healthy",
  activity = "light",
  meals = 3,
  preSleep = false,
} = {}) {
  if (!isNum(weightKg) || !isNum(ageYears) || !isNum(meals)) {
    return { error: "Enter body weight, age and number of meals as numbers." };
  }
  if (weightKg < MIN_WEIGHT_KG || weightKg > MAX_WEIGHT_KG) {
    return { error: `Body weight should be between ${MIN_WEIGHT_KG} and ${MAX_WEIGHT_KG} kg.` };
  }
  if (ageYears < MIN_AGE || ageYears > MAX_AGE) {
    return {
      error: `This planner uses older-adult protein bands, so age must be between ${MIN_AGE} and ${MAX_AGE}.`,
    };
  }
  const mealCount = Math.round(meals);
  if (mealCount < MIN_MEALS || mealCount > MAX_MEALS) {
    return { error: `Plan between ${MIN_MEALS} and ${MAX_MEALS} main meals a day.` };
  }
  const band = PROTEIN_BANDS[status];
  if (!band) return { error: "Choose one of the listed health situations." };
  const act = ACTIVITY_OFFSETS[activity];
  if (!act) return { error: "Choose one of the listed activity levels." };

  const targetPerKg = band.low + (band.high - band.low) * act.offset;
  const dailyGrams = Math.round(weightKg * targetPerKg);
  const bandLowGrams = Math.round(weightKg * band.low);
  const bandHighGrams = Math.round(weightKg * band.high);
  const rdaGrams = Math.round(weightKg * RDA_PER_KG);

  // Per-meal dose that maximises muscle protein synthesis: the larger of
  // 0.4 g/kg (Moore 2015) and the 25 g absolute floor (ESPEN).
  const mpsDoseGrams = Math.max(MPS_ABSOLUTE_FLOOR_G, Math.round(weightKg * MPS_DOSE_PER_KG));

  const usePreSleep = Boolean(preSleep) && dailyGrams > PRE_SLEEP_G * 2;
  const bedtimeGrams = usePreSleep ? PRE_SLEEP_G : 0;
  const mainTotal = dailyGrams - bedtimeGrams;
  const mainAmounts = splitEvenly(mainTotal, mealCount);
  const names = MEAL_NAMES[mealCount] || MEAL_NAMES[3];

  const schedule = names.map((name, index) => ({
    name,
    grams: mainAmounts[index],
    meetsThreshold: mainAmounts[index] >= mpsDoseGrams,
    share: dailyGrams > 0 ? (mainAmounts[index] / dailyGrams) * 100 : 0,
  }));
  if (usePreSleep) {
    schedule.push({
      name: "Pre-sleep (casein / milk / curd)",
      grams: bedtimeGrams,
      meetsThreshold: bedtimeGrams >= mpsDoseGrams,
      share: (bedtimeGrams / dailyGrams) * 100,
      preSleep: true,
    });
  }

  const mainPerMeal = mainAmounts.length ? mainAmounts[0] : 0;
  const mealsBelowThreshold = schedule.filter((meal) => !meal.meetsThreshold).length;
  const shortfallPerMeal = Math.max(0, mpsDoseGrams - mainPerMeal);

  // Most eating occasions the daily total can fill while each still clears the dose.
  const maxUsefulMeals = mpsDoseGrams > 0 ? Math.floor(dailyGrams / mpsDoseGrams) : 0;

  let verdict;
  if (mealsBelowThreshold === 0) {
    verdict = "Every eating occasion clears the per-meal muscle-synthesis dose.";
  } else if (maxUsefulMeals >= 1) {
    verdict = `At ${dailyGrams} g a day only ${maxUsefulMeals} eating occasion${
      maxUsefulMeals === 1 ? "" : "s"
    } of ${mpsDoseGrams} g can clear the dose - concentrate the protein rather than spreading it thin.`;
  } else {
    verdict =
      "The daily total is too small to give any meal an effective dose - raise total protein before worrying about spreading it.";
  }

  return {
    weightKg,
    ageYears,
    statusLabel: band.label,
    statusNote: band.note,
    activityLabel: act.label,
    targetPerKg: Math.round(targetPerKg * 100) / 100,
    bandLow: band.low,
    bandHigh: band.high,
    bandLowGrams,
    bandHighGrams,
    dailyGrams,
    rdaGrams,
    aboveRdaGrams: dailyGrams - rdaGrams,
    mpsDoseGrams,
    mealCount,
    occasions: schedule.length,
    schedule,
    mainPerMeal,
    mealsBelowThreshold,
    shortfallPerMeal,
    maxUsefulMeals,
    verdict,
    preSleepApplied: usePreSleep,
    kidneyCaution: status === "kidney",
  };
}

/**
 * Household portions that would supply a given protein target.
 * Pure lookup over PROTEIN_FOODS - no rounding surprises, servings kept to 1 decimal.
 */
export function equivalentServings(targetGrams, keys = ["egg", "curd", "paneer", "dal", "chicken", "whey"]) {
  if (!isNum(targetGrams) || targetGrams <= 0) return [];
  return keys
    .map((key) => PROTEIN_FOODS.find((food) => food.key === key))
    .filter(Boolean)
    .map((food) => ({
      key: food.key,
      label: food.label,
      servings: Math.round((targetGrams / food.grams) * 10) / 10,
    }));
}
