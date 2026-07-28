/**
 * Daily iron target for women and girls — pure logic, no DOM.
 *
 * Base figures are the Institute of Medicine / National Academies Dietary
 * Reference Intakes for iron (DRI report, 2001), which are still the values
 * used on US and many international nutrition labels. Extra iron for
 * heavier-than-median menstrual loss is derived from first principles rather
 * than guessed: blood carries a known amount of iron per millilitre, and the
 * DRIs state the fraction of dietary iron that is absorbed.
 */

/** IOM Recommended Dietary Allowance for iron, mg/day, by age band (females). */
export const RDA_MG = {
  girls9to13: 8, // 9-13 years
  teens14to18: 15, // 14-18 years, covers the start of menstruation
  adults19to50: 18, // 19-50 years, includes average menstrual losses
  adults51plus: 8, // 51+ years, menstrual losses have ceased
  pregnancy: 27, // all ages, expanded red cell mass plus fetal and placental iron
  lactation14to18: 10,
  lactation19plus: 9,
};

/** IOM Tolerable Upper Intake Level for iron, mg/day, from all sources. */
export const UL_MG = {
  age9to13: 40,
  age14plus: 45,
};

/**
 * The IOM states that the iron requirement is 1.8 times higher for people
 * eating a vegetarian diet, because non-heme iron is absorbed at roughly 10%
 * against about 18% from a mixed diet containing meat.
 */
export const VEGETARIAN_MULTIPLIER = 1.8;
export const ABSORPTION_MIXED_DIET = 0.18;
export const ABSORPTION_VEGETARIAN_DIET = 0.1;

/**
 * Iron carried in whole blood. Haemoglobin holds 3.47 mg of iron per gram, and
 * a typical female haemoglobin of about 135 g/L gives roughly 0.47 mg of iron
 * per millilitre of blood. 0.5 mg/mL is the rounded figure used in menstrual
 * iron-loss estimates.
 */
export const IRON_MG_PER_ML_BLOOD = 0.5;

/**
 * Median menstrual blood loss is about 30 mL per cycle, and the 19-50 RDA of
 * 18 mg/day already covers it. Only loss above this median is added on top.
 */
export const MEDIAN_LOSS_ML = 30;

/** Loss above 80 mL per cycle is the clinical definition of heavy menstrual bleeding. */
export const HEAVY_BLEEDING_ML = 80;

export const BLEED_LEVELS = [
  { id: "light", name: "Light", ml: 20, note: "Two or three days of light flow, few product changes." },
  { id: "average", name: "Average", ml: MEDIAN_LOSS_ML, note: "The median loss the standard RDA is built around." },
  { id: "heavy", name: "Heavy", ml: 60, note: "Changing a product every 2-3 hours on the worst days." },
  { id: "veryHeavy", name: "Very heavy", ml: 90, note: "Flooding, clots or overnight leaks — above the 80 mL threshold." },
];

export const LIFE_STAGES = {
  CYCLING: "cycling",
  NO_PERIODS: "noPeriods",
  PREGNANT: "pregnant",
  BREASTFEEDING: "breastfeeding",
};

export const DIETS = {
  MIXED: "mixed",
  VEGETARIAN: "vegetarian",
};

export const AGE_MIN = 9;
export const AGE_MAX = 80;
export const CYCLE_MIN_DAYS = 15;
export const CYCLE_MAX_DAYS = 60;
export const LOSS_MAX_ML = 500;

/** Absorption enhancers and inhibitors — qualitative, no numbers invented. */
export const ABSORPTION_NOTES = {
  helps: [
    "Vitamin C eaten in the same meal — lemon on dal, tomato in a curry, an orange with breakfast — sharply increases non-heme iron absorption.",
    "A small amount of meat, fish or poultry in a meal also raises absorption of the plant iron eaten alongside it.",
    "Soaking, sprouting and fermenting pulses and grains lowers their phytate, which frees up more of the iron.",
    "Cooking acidic foods in cast iron adds a measurable amount of iron to the dish.",
  ],
  hinders: [
    "Tea and coffee with a meal — the polyphenols bind iron. Move them to an hour either side instead.",
    "Calcium, whether from a large glass of milk or a calcium supplement, competes with iron in the same meal.",
    "Phytate in wholegrains and legumes and oxalate in spinach reduce how much of their own iron you absorb.",
    "Antacids and proton pump inhibitors reduce stomach acid, which non-heme iron needs.",
  ],
};

/** Approximate iron per typical cooked serving. Values rounded from USDA composition data. */
export const IRON_FOODS = [
  { food: "Chicken liver, cooked", serving: "100 g", mg: 11.6, type: "heme" },
  { food: "Lentils (dal), cooked", serving: "1 cup / 200 g", mg: 6.6, type: "non-heme" },
  { food: "Chickpeas, cooked", serving: "1 cup / 165 g", mg: 4.7, type: "non-heme" },
  { food: "Spinach, cooked", serving: "100 g", mg: 3.6, type: "non-heme" },
  { food: "Kidney beans (rajma), cooked", serving: "1 cup / 175 g", mg: 3.9, type: "non-heme" },
  { food: "Tofu, firm", serving: "100 g", mg: 2.7, type: "non-heme" },
  { food: "Lean beef, cooked", serving: "100 g", mg: 2.6, type: "heme" },
  { food: "Pumpkin seeds", serving: "30 g", mg: 2.6, type: "non-heme" },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

function baseRdaFor(age, lifeStage) {
  if (lifeStage === LIFE_STAGES.PREGNANT) return RDA_MG.pregnancy;
  if (lifeStage === LIFE_STAGES.BREASTFEEDING) {
    return age <= 18 ? RDA_MG.lactation14to18 : RDA_MG.lactation19plus;
  }
  if (lifeStage === LIFE_STAGES.NO_PERIODS) return RDA_MG.adults51plus;
  if (age <= 13) return RDA_MG.girls9to13;
  if (age <= 18) return RDA_MG.teens14to18;
  if (age <= 50) return RDA_MG.adults19to50;
  return RDA_MG.adults51plus;
}

function bandLabel(age, lifeStage) {
  if (lifeStage === LIFE_STAGES.PREGNANT) return "Pregnancy, any age";
  if (lifeStage === LIFE_STAGES.BREASTFEEDING) {
    return age <= 18 ? "Breastfeeding, 14-18 years" : "Breastfeeding, 19 years and over";
  }
  if (lifeStage === LIFE_STAGES.NO_PERIODS) return "No monthly periods";
  if (age <= 13) return "Girls 9-13 years";
  if (age <= 18) return "14-18 years";
  if (age <= 50) return "19-50 years, menstruating";
  return "51 years and over";
}

/**
 * @returns {{error:string}|object} mg/day target and its components.
 */
export function calculateIronTarget({
  age,
  lifeStage = LIFE_STAGES.CYCLING,
  diet = DIETS.MIXED,
  lossMl = MEDIAN_LOSS_ML,
  cycleDays = 28,
} = {}) {
  if (!isNum(age)) return { error: "Enter your age in years." };
  if (age < AGE_MIN || age > AGE_MAX) {
    return { error: `This calculator covers ages ${AGE_MIN} to ${AGE_MAX}.` };
  }
  if (!Object.values(LIFE_STAGES).includes(lifeStage)) {
    return { error: "Choose a life stage." };
  }
  if (!Object.values(DIETS).includes(diet)) {
    return { error: "Choose a diet type." };
  }

  const cycling = lifeStage === LIFE_STAGES.CYCLING;

  if (cycling) {
    if (!isNum(lossMl) || lossMl < 0) return { error: "Menstrual blood loss cannot be negative." };
    if (lossMl > LOSS_MAX_ML) {
      return {
        error: `A loss above ${LOSS_MAX_ML} mL per cycle is outside this estimate — that needs medical assessment, not a calculator.`,
      };
    }
    if (!isNum(cycleDays) || cycleDays < CYCLE_MIN_DAYS || cycleDays > CYCLE_MAX_DAYS) {
      return { error: `Cycle length must be between ${CYCLE_MIN_DAYS} and ${CYCLE_MAX_DAYS} days.` };
    }
  }

  const vegetarian = diet === DIETS.VEGETARIAN;
  const absorption = vegetarian ? ABSORPTION_VEGETARIAN_DIET : ABSORPTION_MIXED_DIET;
  const multiplier = vegetarian ? VEGETARIAN_MULTIPLIER : 1;

  const baseRda = baseRdaFor(age, lifeStage);
  const dietAdjustedRda = baseRda * multiplier;

  const excessMl = cycling ? Math.max(0, lossMl - MEDIAN_LOSS_ML) : 0;
  const excessIronPerCycleMg = excessMl * IRON_MG_PER_ML_BLOOD;
  const excessAbsorbedPerDayMg = cycling && cycleDays > 0 ? excessIronPerCycleMg / cycleDays : 0;
  const extraDietaryMg = excessAbsorbedPerDayMg / absorption;

  const totalMg = dietAdjustedRda + extraDietaryMg;
  const upperLimit = age <= 13 ? UL_MG.age9to13 : UL_MG.age14plus;

  return {
    baseRda,
    bandLabel: bandLabel(age, lifeStage),
    vegetarian,
    multiplier,
    absorptionPercent: absorption * 100,
    dietAdjustedRda: Math.round(dietAdjustedRda * 10) / 10,
    excessMl,
    excessIronPerCycleMg: Math.round(excessIronPerCycleMg * 10) / 10,
    extraDietaryMg: Math.round(extraDietaryMg * 10) / 10,
    totalMg: Math.round(totalMg * 10) / 10,
    upperLimit,
    exceedsUpperLimit: totalMg > upperLimit,
    percentOfUpperLimit: Math.round((totalMg / upperLimit) * 100),
    heavyBleeding: cycling && lossMl >= HEAVY_BLEEDING_ML,
    cycling,
    lossMl: cycling ? lossMl : 0,
    cycleDays: cycling ? cycleDays : 0,
  };
}
