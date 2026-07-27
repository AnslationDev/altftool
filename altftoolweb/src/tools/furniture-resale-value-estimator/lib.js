/**
 * Furniture resale value estimator.
 *
 * Method: declining-balance depreciation with a retention rate set by the
 * material, because material is what decides whether a piece survives being
 * dismantled and moved:
 *
 *   value = price x firstYearRetention^min(t,1) x annualRetention^max(0,t-1)
 *
 * Solid hardwood loses only a few percent a year and can be repolished
 * indefinitely, while particle board and MDF lose most of their value quickly
 * because the fixings do not hold a second time and the board swells if it
 * meets water.
 *
 * The curve is then adjusted for:
 *  - cosmetic and structural condition,
 *  - whether the piece is modular or built in, which forces a dismantle and
 *    almost never fits the next home,
 *  - whether a set is complete, since a dining table without its matching
 *    chairs sells far below the set price,
 *  - an end-of-life taper as the piece passes its usable service life.
 *
 * Repolishing or reupholstery cost and the transport the buyer has to pay are
 * deducted, and the result is floored at reclaimed-material value.
 */

/** Materials with their retention curve, usable life in years and reclaimed-value floor. */
export const MATERIALS = [
  {
    value: "teak",
    label: "Solid teak",
    firstYearRetention: 0.7,
    annualRetention: 0.96,
    lifeYears: 40,
    scrapFraction: 0.15,
    solidWood: true,
  },
  {
    value: "sheesham",
    label: "Solid sheesham / rosewood",
    firstYearRetention: 0.65,
    annualRetention: 0.94,
    lifeYears: 30,
    scrapFraction: 0.12,
    solidWood: true,
  },
  {
    value: "mango",
    label: "Solid mango / acacia",
    firstYearRetention: 0.6,
    annualRetention: 0.92,
    lifeYears: 20,
    scrapFraction: 0.1,
    solidWood: true,
  },
  {
    value: "plywood",
    label: "Plywood with veneer or laminate",
    firstYearRetention: 0.55,
    annualRetention: 0.85,
    lifeYears: 15,
    scrapFraction: 0.06,
    solidWood: false,
  },
  {
    value: "mdf",
    label: "MDF / HDF board",
    firstYearRetention: 0.45,
    annualRetention: 0.78,
    lifeYears: 10,
    scrapFraction: 0.03,
    solidWood: false,
  },
  {
    value: "particle",
    label: "Particle board (flat-pack)",
    firstYearRetention: 0.4,
    annualRetention: 0.72,
    lifeYears: 8,
    scrapFraction: 0.02,
    solidWood: false,
  },
  {
    value: "metal",
    label: "Metal frame",
    firstYearRetention: 0.6,
    annualRetention: 0.9,
    lifeYears: 20,
    scrapFraction: 0.08,
    solidWood: false,
  },
  {
    value: "upholstered",
    label: "Upholstered sofa or fabric seating",
    firstYearRetention: 0.5,
    annualRetention: 0.82,
    lifeYears: 12,
    scrapFraction: 0.03,
    solidWood: false,
  },
];

export const MATERIAL_MAP = MATERIALS.reduce((map, item) => {
  map[item.value] = item;
  return map;
}, {});

/** Condition grades used in the second-hand furniture market. */
export const CONDITIONS = [
  { value: "likeNew", label: "Like new — no marks, joints tight", multiplier: 1.0 },
  { value: "good", label: "Good — light scuffs, structurally sound", multiplier: 0.9 },
  { value: "fair", label: "Fair — scratches, faded polish or stains", multiplier: 0.72 },
  { value: "poor", label: "Poor — loose joints, swelling or tears", multiplier: 0.45 },
  { value: "broken", label: "Broken — sold for material or repair", multiplier: 0.2 },
];

export const CONDITION_MAP = CONDITIONS.reduce((map, item) => {
  map[item.value] = item.multiplier;
  return map;
}, {});

/** Modular and built-in pieces have to be cut out and rarely fit the next home. */
export const MODULAR_MULTIPLIER = 0.55;
/** An incomplete set - a table without its chairs - sells well below set price. */
export const INCOMPLETE_SET_MULTIPLIER = 0.85;
/** Spread around the point estimate that gives a realistic asking range. */
export const PRICE_BAND = 0.12;
/** Second-hand furniture dealers work on a wide margin because storage is costly. */
export const DEALER_FACTOR = 0.5;
/** Solid wood past this age is normally valued as an antique, not by depreciation. */
export const ANTIQUE_AGE_YEARS = 30;
/** Oldest age the model is meaningful for, in months. */
export const MAX_AGE_MONTHS = 600;
/** Highest purchase price the estimator accepts, in INR. */
export const MAX_PURCHASE_PRICE = 2000000;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/** Retention factor from age alone, before any adjustment. */
export function ageRetention(ageMonths, material) {
  const years = ageMonths / 12;
  return (
    material.firstYearRetention ** Math.min(years, 1) *
    material.annualRetention ** Math.max(0, years - 1)
  );
}

/**
 * End-of-life taper: value is untouched until 70% of usable life, then falls
 * linearly to nothing at 130% of it, floored later at reclaimed-material value.
 */
export function lifeFactor(ageMonths, lifeYears) {
  if (!(lifeYears > 0)) return 1;
  const years = ageMonths / 12;
  return clamp((1.3 * lifeYears - years) / (0.6 * lifeYears), 0, 1);
}

/**
 * Estimate the resale value of a piece of furniture.
 * Pure: age is supplied in months, no clock is read.
 */
export function estimateFurnitureValue({
  purchasePrice = 60000,
  ageMonths = 120,
  materialKey = "teak",
  condition = "good",
  isModular = false,
  isCompleteSet = true,
  restorationCost = 0,
  buyerBorneCost = 0,
} = {}) {
  if (![purchasePrice, ageMonths, restorationCost, buyerBorneCost].every(isNum)) {
    return { error: "Enter valid numbers in every field." };
  }
  const material = MATERIAL_MAP[materialKey];
  if (!material) return { error: "Choose a material." };
  const conditionMultiplier = CONDITION_MAP[condition];
  if (!isNum(conditionMultiplier)) return { error: "Choose a condition grade." };

  if (purchasePrice <= 0) return { error: "Purchase price must be greater than zero." };
  if (purchasePrice > MAX_PURCHASE_PRICE) {
    return { error: `Purchase price above ${MAX_PURCHASE_PRICE} is outside this estimator's range.` };
  }
  if (ageMonths < 0) return { error: "Age cannot be negative." };
  if (ageMonths > MAX_AGE_MONTHS) {
    return { error: `Age above ${MAX_AGE_MONTHS} months is outside this estimator's range.` };
  }
  if (restorationCost < 0 || buyerBorneCost < 0) return { error: "Costs cannot be negative." };

  const retention = ageRetention(ageMonths, material);
  const life = lifeFactor(ageMonths, material.lifeYears);
  const modular = isModular ? MODULAR_MULTIPLIER : 1;
  const completeness = isCompleteSet ? 1 : INCOMPLETE_SET_MULTIPLIER;

  const rawValue = purchasePrice * retention * conditionMultiplier * life * modular * completeness;
  // A used piece cannot fetch more than it cost new under this model.
  const beforeDeductions = Math.min(purchasePrice, rawValue);
  const floor = purchasePrice * material.scrapFraction;
  const value = Math.max(floor, beforeDeductions - restorationCost - buyerBorneCost);

  const years = ageMonths / 12;
  const overallRetention = value / purchasePrice;
  const annualDepreciationPct = years > 0 ? (1 - overallRetention ** (1 / years)) * 100 : 0;

  return {
    materialLabel: material.label,
    estimatedValue: Math.round(value),
    rangeLow: Math.round(value * (1 - PRICE_BAND)),
    rangeHigh: Math.round(value * (1 + PRICE_BAND)),
    dealerValue: Math.round(value * DEALER_FACTOR),
    scrapFloor: Math.round(floor),
    atFloor: beforeDeductions - restorationCost - buyerBorneCost <= floor,
    atCeiling: rawValue > purchasePrice,
    purchasePrice: Math.round(purchasePrice),
    totalDepreciation: Math.round(purchasePrice - value),
    retainedPct: Math.round(overallRetention * 1000) / 10,
    annualDepreciationPct: Math.round(annualDepreciationPct * 10) / 10,
    ageYears: Math.round(years * 10) / 10,
    usableLifeYears: material.lifeYears,
    remainingLifeYears: Math.round(Math.max(0, material.lifeYears - years) * 10) / 10,
    pastUsableLife: years >= material.lifeYears,
    antiqueTerritory: material.solidWood && years >= ANTIQUE_AGE_YEARS,
    deductions: Math.round(restorationCost + buyerBorneCost),
    factors: [
      ["Age and material", `${Math.round(retention * 1000) / 10}%`],
      ["Condition", `${Math.round(conditionMultiplier * 1000) / 10}%`],
      ["End-of-life taper", `${Math.round(life * 1000) / 10}%`],
      ["Modular or built in", `${Math.round(modular * 1000) / 10}%`],
      ["Set completeness", `${Math.round(completeness * 1000) / 10}%`],
    ],
  };
}
