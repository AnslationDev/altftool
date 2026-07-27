/**
 * Household appliance resale value estimator.
 *
 * Method: declining-balance depreciation applied per category, because a
 * refrigerator, an air conditioner and a washing machine hold value at very
 * different rates and have different rated service lives.
 *
 *   value = price x firstYearRetention^min(t,1) x annualRetention^max(0,t-1)
 *
 * That curve is then multiplied by:
 *  - a condition grade,
 *  - a BEE star-rating factor, because running cost is what a second-hand buyer
 *    of a fridge, room AC or washing machine actually shops on,
 *  - a remaining-warranty factor (compressor and motor warranties are the ones
 *    that transfer and matter),
 *  - an end-of-life taper that pulls the price toward scrap as the appliance
 *    approaches and passes its rated service life,
 *  - an R-22 penalty for older air conditioners, since R-22 is an HCFC being
 *    phased out under the Montreal Protocol and servicing it gets harder and
 *    dearer every year.
 *
 * Finally, known repair cost and any transport or reinstallation the buyer has
 * to pay for are deducted, and the result is floored at scrap value.
 */

/** Categories with their typical retention curve and rated service life in years. */
export const CATEGORIES = [
  {
    value: "refrigerator",
    label: "Refrigerator (frost-free or direct cool)",
    firstYearRetention: 0.72,
    annualRetention: 0.86,
    lifeYears: 12,
    scrapFraction: 0.05,
    isAc: false,
  },
  {
    value: "splitAc",
    label: "Split air conditioner",
    firstYearRetention: 0.7,
    annualRetention: 0.84,
    lifeYears: 10,
    scrapFraction: 0.06,
    isAc: true,
  },
  {
    value: "windowAc",
    label: "Window air conditioner",
    firstYearRetention: 0.68,
    annualRetention: 0.82,
    lifeYears: 10,
    scrapFraction: 0.06,
    isAc: true,
  },
  {
    value: "washingMachineAuto",
    label: "Fully automatic washing machine",
    firstYearRetention: 0.68,
    annualRetention: 0.83,
    lifeYears: 10,
    scrapFraction: 0.05,
    isAc: false,
  },
  {
    value: "washingMachineSemi",
    label: "Semi automatic washing machine",
    firstYearRetention: 0.65,
    annualRetention: 0.8,
    lifeYears: 8,
    scrapFraction: 0.05,
    isAc: false,
  },
  {
    value: "microwave",
    label: "Microwave oven",
    firstYearRetention: 0.65,
    annualRetention: 0.8,
    lifeYears: 8,
    scrapFraction: 0.04,
    isAc: false,
  },
];

export const CATEGORY_MAP = CATEGORIES.reduce((map, item) => {
  map[item.value] = item;
  return map;
}, {});

/** Cosmetic and functional condition grades used in the second-hand market. */
export const CONDITIONS = [
  { value: "likeNew", label: "Like new — barely used, no marks", multiplier: 1.0 },
  { value: "good", label: "Good — light wear, works fully", multiplier: 0.9 },
  { value: "fair", label: "Fair — dents, rust spots or stained panels", multiplier: 0.75 },
  { value: "poor", label: "Poor — heavy wear, needs attention", multiplier: 0.55 },
  { value: "notWorking", label: "Not working — sold for spares", multiplier: 0.25 },
];

export const CONDITION_MAP = CONDITIONS.reduce((map, item) => {
  map[item.value] = item.multiplier;
  return map;
}, {});

/** BEE star rating: running cost is the main lever on second-hand demand. */
export const STAR_RATINGS = [
  { value: "na", label: "Not labelled / unknown", multiplier: 1.0 },
  { value: "1", label: "1 star", multiplier: 0.9 },
  { value: "2", label: "2 star", multiplier: 0.95 },
  { value: "3", label: "3 star", multiplier: 1.0 },
  { value: "4", label: "4 star", multiplier: 1.03 },
  { value: "5", label: "5 star", multiplier: 1.06 },
];

export const STAR_MAP = STAR_RATINGS.reduce((map, item) => {
  map[item.value] = item.multiplier;
  return map;
}, {});

/** R-22 is an HCFC under Montreal Protocol phase-out; servicing gets harder every year. */
export const R22_MULTIPLIER = 0.85;
/** Each remaining year of transferable compressor or motor warranty adds this much. */
export const WARRANTY_BONUS_PER_YEAR = 0.02;
export const WARRANTY_BONUS_CAP = 0.1;
/** Spread around the point estimate that gives a realistic asking range. */
export const PRICE_BAND = 0.12;
/** Second-hand appliance dealers pay roughly this share of a patient private sale. */
export const DEALER_FACTOR = 0.6;
/** Oldest age the model is meaningful for, in months. */
export const MAX_AGE_MONTHS = 300;
/** Highest purchase price the estimator accepts, in INR. */
export const MAX_PURCHASE_PRICE = 500000;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/** Retention factor from age alone, before any adjustment. */
export function ageRetention(ageMonths, category) {
  const years = ageMonths / 12;
  return (
    category.firstYearRetention ** Math.min(years, 1) *
    category.annualRetention ** Math.max(0, years - 1)
  );
}

/**
 * End-of-life taper. Value is untouched until 70% of the rated service life,
 * then falls linearly to nothing at 130% of it, so the price collapses toward
 * scrap around the age at which the appliance is expected to be replaced.
 */
export function lifeFactor(ageMonths, lifeYears) {
  if (!(lifeYears > 0)) return 1;
  const years = ageMonths / 12;
  return clamp((1.3 * lifeYears - years) / (0.6 * lifeYears), 0, 1);
}

/**
 * Estimate the second-hand value of an appliance.
 * Pure: age is supplied in months, no clock is read.
 */
export function estimateApplianceValue({
  purchasePrice = 35000,
  ageMonths = 48,
  categoryKey = "refrigerator",
  condition = "good",
  starRating = "3",
  warrantyYearsLeft = 0,
  usesR22 = false,
  buyerBorneCost = 0,
  repairCost = 0,
} = {}) {
  if (![purchasePrice, ageMonths, warrantyYearsLeft, buyerBorneCost, repairCost].every(isNum)) {
    return { error: "Enter valid numbers in every field." };
  }
  const category = CATEGORY_MAP[categoryKey];
  if (!category) return { error: "Choose an appliance category." };
  const conditionMultiplier = CONDITION_MAP[condition];
  if (!isNum(conditionMultiplier)) return { error: "Choose a condition grade." };
  const starMultiplier = STAR_MAP[starRating];
  if (!isNum(starMultiplier)) return { error: "Choose a star rating, or select unknown." };

  if (purchasePrice <= 0) return { error: "Purchase price must be greater than zero." };
  if (purchasePrice > MAX_PURCHASE_PRICE) {
    return { error: `Purchase price above ${MAX_PURCHASE_PRICE} is outside this estimator's range.` };
  }
  if (ageMonths < 0) return { error: "Age cannot be negative." };
  if (ageMonths > MAX_AGE_MONTHS) {
    return { error: `Age above ${MAX_AGE_MONTHS} months is outside this estimator's range.` };
  }
  if (warrantyYearsLeft < 0 || warrantyYearsLeft > 12) {
    return { error: "Remaining warranty should be between 0 and 12 years." };
  }
  if (buyerBorneCost < 0 || repairCost < 0) return { error: "Costs cannot be negative." };

  const retention = ageRetention(ageMonths, category);
  const life = lifeFactor(ageMonths, category.lifeYears);
  const warranty = 1 + Math.min(WARRANTY_BONUS_CAP, warrantyYearsLeft * WARRANTY_BONUS_PER_YEAR);
  const refrigerant = category.isAc && usesR22 ? R22_MULTIPLIER : 1;

  const rawValue =
    purchasePrice * retention * conditionMultiplier * starMultiplier * warranty * life * refrigerant;
  // A used appliance cannot fetch more than it cost new.
  const beforeDeductions = Math.min(purchasePrice, rawValue);
  const floor = purchasePrice * category.scrapFraction;
  const value = Math.max(floor, beforeDeductions - repairCost - buyerBorneCost);

  const years = ageMonths / 12;
  const overallRetention = value / purchasePrice;
  const annualDepreciationPct = years > 0 ? (1 - overallRetention ** (1 / years)) * 100 : 0;
  const remainingLifeYears = Math.max(0, category.lifeYears - years);

  return {
    categoryLabel: category.label,
    estimatedValue: Math.round(value),
    rangeLow: Math.round(value * (1 - PRICE_BAND)),
    rangeHigh: Math.round(value * (1 + PRICE_BAND)),
    dealerValue: Math.round(value * DEALER_FACTOR),
    scrapFloor: Math.round(floor),
    atFloor: beforeDeductions - repairCost - buyerBorneCost <= floor,
    atCeiling: rawValue > purchasePrice,
    purchasePrice: Math.round(purchasePrice),
    totalDepreciation: Math.round(purchasePrice - value),
    retainedPct: Math.round(overallRetention * 1000) / 10,
    annualDepreciationPct: Math.round(annualDepreciationPct * 10) / 10,
    ageYears: Math.round(years * 10) / 10,
    ratedLifeYears: category.lifeYears,
    remainingLifeYears: Math.round(remainingLifeYears * 10) / 10,
    pastRatedLife: years >= category.lifeYears,
    deductions: Math.round(repairCost + buyerBorneCost),
    factors: [
      ["Age", `${Math.round(retention * 1000) / 10}%`],
      ["Condition", `${Math.round(conditionMultiplier * 1000) / 10}%`],
      ["BEE star rating", `${Math.round(starMultiplier * 1000) / 10}%`],
      ["Warranty left", `${Math.round(warranty * 1000) / 10}%`],
      ["End-of-life taper", `${Math.round(life * 1000) / 10}%`],
      ["Refrigerant type", `${Math.round(refrigerant * 1000) / 10}%`],
    ],
  };
}
