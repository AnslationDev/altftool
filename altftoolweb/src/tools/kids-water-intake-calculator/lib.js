/**
 * Kids Water Intake Calculator — pure calculation module.
 *
 * Two independent references are computed and the higher one is used, because
 * they answer slightly different questions:
 *
 *  1. Holliday-Segar maintenance fluid — the paediatric weight rule
 *     (100/50/20 ml per kg) used clinically since 1957. It scales with the
 *     actual child, so a heavy 12-year-old is not under-served.
 *  2. EFSA adequate intake for total water by age and sex (EFSA Panel on
 *     Dietetic Products, Nutrition and Allergies, 2010).
 *
 * Both are TOTAL water, including what comes from food and milk. The drinking
 * target is the beverage share of that total, plus a sport top-up based on the
 * American Academy of Pediatrics activity guidance.
 */

/** Holliday-Segar maintenance fluid bands, ml per kg per day (Holliday & Segar, 1957). */
export const HS_FIRST_10KG_ML_PER_KG = 100;
export const HS_SECOND_10KG_ML_PER_KG = 50;
export const HS_ABOVE_20KG_ML_PER_KG = 20;

/** Share of total water that comes from beverages rather than food.
 *  EFSA puts beverages at roughly 70-80% of total water intake. */
export const BEVERAGE_SHARE = 0.8;

/** Plain water is not recommended before this age; milk or formula covers all
 *  fluid needs (WHO and AAP infant feeding guidance). */
export const MIN_AGE_MONTHS_FOR_WATER = 6;

/** Between 6 and 12 months, nearly all fluid still comes from breast milk or
 *  formula. The AAP puts supplementary plain water at about 4-8 oz per day. */
export const INFANT_MAX_AGE_MONTHS = 12;
export const INFANT_PLAIN_WATER_MIN_ML = 120;
export const INFANT_PLAIN_WATER_MAX_ML = 240;

/** Waking hours used to spread the target across the day for young children. */
const WAKING_HOURS = 12;

/** Typical child drinking cup, ml. */
export const CUP_ML = 200;

/**
 * EFSA 2010 adequate intakes for TOTAL water, ml/day.
 * `low`/`high` are given where EFSA publishes a range; `ml` is the planning value.
 * EFSA does not publish a separate 3-4 year band, so the 2-3 year figure carries
 * forward to the fourth birthday.
 */
export const EFSA_TOTAL_WATER = [
  { maxMonths: 12, label: "6-12 months", low: 800, high: 1000, ml: 900 },
  { maxMonths: 24, label: "1-2 years", low: 1100, high: 1200, ml: 1150 },
  { maxMonths: 48, label: "2-3 years", ml: 1300 },
  { maxMonths: 108, label: "4-8 years", ml: 1600 },
  { maxMonths: 168, label: "9-13 years", ml: 2100, mlFemale: 1900 },
  { maxMonths: Infinity, label: "14 years and over", ml: 2500, mlFemale: 2000 },
];

/**
 * AAP fluid guidance during exercise, ml per 20 minutes of activity.
 * Children are given 100-250 ml per 20 minutes; adolescents 1.0-1.5 L per hour,
 * which is 333-500 ml per 20 minutes. The lower figure is used in mild
 * conditions and the upper figure in hot or humid conditions.
 */
export const SPORT_ML_PER_20MIN = {
  child: { mild: 100, hot: 250 },
  adolescent: { mild: 333, hot: 500 },
};

/** Age at which the adolescent sport band starts, in months. */
const ADOLESCENT_AGE_MONTHS = 13 * 12;

/** Sport top-up above which the amount deserves a second look from a clinician. */
export const HIGH_SPORT_EXTRA_ML = 2000;

/** Holliday-Segar maintenance fluid for a given weight, ml/day. */
export function hollidaySegarMl(weightKg) {
  if (!(weightKg > 0)) return 0;
  if (weightKg <= 10) return weightKg * HS_FIRST_10KG_ML_PER_KG;
  if (weightKg <= 20) {
    return 10 * HS_FIRST_10KG_ML_PER_KG + (weightKg - 10) * HS_SECOND_10KG_ML_PER_KG;
  }
  return (
    10 * HS_FIRST_10KG_ML_PER_KG +
    10 * HS_SECOND_10KG_ML_PER_KG +
    (weightKg - 20) * HS_ABOVE_20KG_ML_PER_KG
  );
}

/** EFSA band for an age in months. */
export function efsaBandFor(ageMonths) {
  return (
    EFSA_TOTAL_WATER.find((band) => ageMonths < band.maxMonths) ||
    EFSA_TOTAL_WATER[EFSA_TOTAL_WATER.length - 1]
  );
}

function round(value, step = 1) {
  return Math.round(value / step) * step;
}

/**
 * @param {object} input
 * @param {number} input.ageMonths     child's age in months
 * @param {number} input.weightKg      child's weight in kilograms
 * @param {string} input.sex           "male" | "female"
 * @param {number} input.activityMins  minutes of vigorous activity today
 * @param {boolean} input.hotConditions whether it is hot or humid
 */
export function computeKidsWaterIntake({
  ageMonths,
  weightKg,
  sex = "male",
  activityMins = 0,
  hotConditions = false,
} = {}) {
  const months = Number(ageMonths);
  const weight = Number(weightKg);
  const activity = Number(activityMins);

  if (![months, weight, activity].every((v) => Number.isFinite(v))) {
    return { error: "Enter a number for age, weight and activity minutes." };
  }
  if (months < 0) return { error: "Age cannot be negative." };
  if (months > 216) {
    return { error: "This calculator covers children up to 18 years — use an adult calculator above that." };
  }
  if (months < MIN_AGE_MONTHS_FOR_WATER) {
    return {
      error:
        "Babies under 6 months should not be given plain water — breast milk or formula supplies all the fluid they need. Ask your paediatrician before offering water.",
    };
  }
  if (weight <= 0) return { error: "Weight must be greater than zero." };
  if (weight > 150) return { error: "Enter a weight of 150 kg or less." };
  if (activity < 0) return { error: "Activity minutes cannot be negative." };
  if (activity > 480) return { error: "Enter 480 minutes (8 hours) of activity or less." };

  const band = efsaBandFor(months);
  const isFemale = sex === "female";
  const efsaMl = isFemale && band.mlFemale ? band.mlFemale : band.ml;

  const hsMl = hollidaySegarMl(weight);
  const referenceTotalMl = Math.max(hsMl, efsaMl);
  const referenceSource = hsMl >= efsaMl ? "Holliday-Segar weight rule" : "EFSA age guideline";

  const fromFoodMl = referenceTotalMl * (1 - BEVERAGE_SHARE);
  const drinkBaseMl = referenceTotalMl * BEVERAGE_SHARE;

  const sportBand = months >= ADOLESCENT_AGE_MONTHS ? "adolescent" : "child";
  const perTwentyMin = SPORT_ML_PER_20MIN[sportBand][hotConditions ? "hot" : "mild"];
  const sportExtraMl = (activity / 20) * perTwentyMin;

  const drinkTotalMl = drinkBaseMl + sportExtraMl;

  const hourlyMl = drinkTotalMl / WAKING_HOURS;

  const infantMode = months < INFANT_MAX_AGE_MONTHS;

  return {
    infantMode,
    infantPlainWaterMinMl: INFANT_PLAIN_WATER_MIN_ML,
    infantPlainWaterMaxMl: INFANT_PLAIN_WATER_MAX_ML,
    bandLabel: band.label,
    efsaMl,
    efsaRange: band.low && band.high ? { low: band.low, high: band.high } : null,
    hollidaySegarMl: round(hsMl, 5),
    referenceTotalMl: round(referenceTotalMl, 5),
    referenceSource,
    fromFoodMl: round(fromFoodMl, 5),
    drinkBaseMl: round(drinkBaseMl, 5),
    sportBand,
    sportPerTwentyMinMl: perTwentyMin,
    sportExtraMl: round(sportExtraMl, 5),
    drinkTotalMl: round(drinkTotalMl, 5),
    cups: Math.round(drinkTotalMl / CUP_ML),
    hourlyMl: round(hourlyMl, 5),
    highSportExtra: sportExtraMl > HIGH_SPORT_EXTRA_ML,
    ageYears: Math.floor(months / 12),
    ageMonthsRemainder: months % 12,
  };
}

export default computeKidsWaterIntake;
