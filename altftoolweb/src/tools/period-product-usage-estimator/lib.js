/**
 * Period product usage and cost estimator.
 *
 * The count is driven by safe wear time rather than guesswork. Regulators and
 * manufacturers give the same rule for absorbent products: change a tampon or
 * pad at least every 4 to 8 hours, and never leave a single tampon in for more
 * than 8 hours (the US FDA labels this as the toxic shock syndrome precaution).
 * Menstrual cups are labelled for up to 12 hours before emptying.
 *
 * So for each day of the period:
 *   products used = 24 hours / the change interval for that flow level
 * Heavy days use the 4-hour end of the range, moderate days 6 hours and light
 * days the 8-hour maximum.
 *
 * Cycles per year use 365.25 days to account for leap years.
 * All functions are pure — no dates are read from the clock.
 */

/** Hours in a day, the window each flow level is divided into. */
export const HOURS_PER_DAY = 24;

/** Mean days per calendar year including leap years. */
export const DAYS_PER_YEAR = 365.25;

/**
 * Change intervals in hours by flow level.
 * The 4-8 hour window is the standard guidance for tampons and pads; the light
 * end of the flow uses the 8-hour maximum and the heavy end the 4-hour minimum.
 */
export const FLOW_LEVELS = [
  { id: "heavy", label: "Heavy days", intervalHours: 4 },
  { id: "moderate", label: "Moderate days", intervalHours: 6 },
  { id: "light", label: "Light or spotting days", intervalHours: 8 },
];

/**
 * Product types. Absorbent disposables follow the 4-8 hour rule; a cup is
 * labelled for up to 12 hours and is reusable, so it produces no per-day
 * disposable count, only empties.
 */
export const PRODUCT_TYPES = [
  { id: "pad", label: "Sanitary pads", reusable: false, maxHours: 8 },
  { id: "tampon", label: "Tampons", reusable: false, maxHours: 8 },
  { id: "liner", label: "Panty liners", reusable: false, maxHours: 8 },
  { id: "cup", label: "Menstrual cup", reusable: true, maxHours: 12 },
];

/** Never leave a single tampon in longer than this (US FDA labelling). */
export const TAMPON_MAX_WEAR_HOURS = 8;

/** A menstrual cup should be emptied at least this often. */
export const CUP_MAX_WEAR_HOURS = 12;

/** Typical total blood loss across a period, and the clinical threshold for heavy bleeding. */
export const BLOOD_LOSS_REFERENCE = { typicalMinMl: 30, typicalMaxMl: 40, heavyThresholdMl: 80 };

/** Years used for the long-run cost comparison. */
export const COMPARISON_YEARS = 5;

export const LIMITS = {
  cycleLength: { min: 20, max: 45 },
  flowDays: { min: 0, max: 10 },
  totalDays: { min: 1, max: 15 },
  unitCost: { min: 0, max: 1000 },
  cupCost: { min: 0, max: 20000 },
  cupYears: { min: 0.5, max: 10 },
};

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Products used in one day at a given change interval. */
export function productsPerDay(intervalHours) {
  if (!isNum(intervalHours) || intervalHours <= 0) return 0;
  return HOURS_PER_DAY / intervalHours;
}

/**
 * Estimate product usage and cost.
 * @returns {{error:string}|object} plain result object, never NaN or Infinity.
 */
export function estimateProductUsage({
  cycleLength,
  heavyDays,
  moderateDays,
  lightDays,
  productType = "pad",
  unitCost = 0,
  cupCost = 0,
  cupYears = 2,
} = {}) {
  const required = { cycleLength, heavyDays, moderateDays, lightDays, unitCost, cupCost, cupYears };
  for (const key of Object.keys(required)) {
    if (!isNum(required[key])) return { error: "Enter a valid number in every field." };
  }

  if (cycleLength < LIMITS.cycleLength.min || cycleLength > LIMITS.cycleLength.max) {
    return {
      error: `Cycle length should be between ${LIMITS.cycleLength.min} and ${LIMITS.cycleLength.max} days.`,
    };
  }
  for (const [name, value] of [
    ["Heavy days", heavyDays],
    ["Moderate days", moderateDays],
    ["Light days", lightDays],
  ]) {
    if (value < LIMITS.flowDays.min || value > LIMITS.flowDays.max) {
      return { error: `${name} should be between ${LIMITS.flowDays.min} and ${LIMITS.flowDays.max}.` };
    }
  }

  const totalDays = heavyDays + moderateDays + lightDays;
  if (totalDays < LIMITS.totalDays.min) {
    return { error: "Enter at least one day of bleeding." };
  }
  if (totalDays > LIMITS.totalDays.max) {
    return {
      error: `A period longer than ${LIMITS.totalDays.max} days is outside this estimator — worth raising with a clinician.`,
    };
  }
  if (totalDays > cycleLength) {
    return { error: "The period cannot be longer than the whole cycle." };
  }
  if (unitCost < LIMITS.unitCost.min || unitCost > LIMITS.unitCost.max) {
    return { error: `Cost per product should be between ${LIMITS.unitCost.min} and ${LIMITS.unitCost.max}.` };
  }
  if (cupCost < LIMITS.cupCost.min || cupCost > LIMITS.cupCost.max) {
    return { error: `Cup price should be between ${LIMITS.cupCost.min} and ${LIMITS.cupCost.max}.` };
  }
  if (cupYears < LIMITS.cupYears.min || cupYears > LIMITS.cupYears.max) {
    return {
      error: `Cup replacement interval should be between ${LIMITS.cupYears.min} and ${LIMITS.cupYears.max} years.`,
    };
  }

  const product = PRODUCT_TYPES.find((item) => item.id === productType) || PRODUCT_TYPES[0];

  const byLevel = FLOW_LEVELS.map((level) => {
    const dayCount =
      level.id === "heavy" ? heavyDays : level.id === "moderate" ? moderateDays : lightDays;
    const perDay = product.reusable
      ? productsPerDay(CUP_MAX_WEAR_HOURS)
      : productsPerDay(level.intervalHours);
    return {
      id: level.id,
      label: level.label,
      days: dayCount,
      intervalHours: product.reusable ? CUP_MAX_WEAR_HOURS : level.intervalHours,
      perDay,
      total: perDay * dayCount,
    };
  });

  const perCycleRaw = byLevel.reduce((sum, level) => sum + level.total, 0);
  const perCycle = Math.ceil(perCycleRaw);
  const cyclesPerYear = DAYS_PER_YEAR / cycleLength;
  const perYear = Math.ceil(perCycleRaw * cyclesPerYear);
  const periodsPerYear = cyclesPerYear;

  const disposablePerCycleCost = product.reusable ? 0 : perCycleRaw * unitCost;
  const yearlyCost = product.reusable ? 0 : perCycleRaw * cyclesPerYear * unitCost;
  const multiYearCost = yearlyCost * COMPARISON_YEARS;

  const cupsNeeded = Math.ceil(COMPARISON_YEARS / cupYears);
  const cupMultiYearCost = cupsNeeded * cupCost;
  const savingsVsCup = multiYearCost - cupMultiYearCost;

  const emptiesPerCycle = Math.ceil(totalDays * productsPerDay(CUP_MAX_WEAR_HOURS));

  return {
    productLabel: product.label,
    reusable: product.reusable,
    totalDays,
    byLevel,
    perCycleRaw,
    perCycle,
    perYear,
    cyclesPerYear,
    periodsPerYear,
    disposablePerCycleCost,
    yearlyCost,
    multiYearCost,
    comparisonYears: COMPARISON_YEARS,
    cupsNeeded,
    cupMultiYearCost,
    savingsVsCup,
    cupSavesMoney: savingsVsCup > 0,
    emptiesPerCycle,
    maxWearHours: product.maxHours,
  };
}
