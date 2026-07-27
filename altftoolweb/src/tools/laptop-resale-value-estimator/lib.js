/**
 * Laptop resale value estimator.
 *
 * Method: declining-balance (exponential) depreciation, the standard model for
 * consumer electronics, applied in two phases because the first year is much
 * steeper than the years that follow:
 *
 *   value = price x FIRST_YEAR_RETENTION^min(t,1) x ANNUAL_RETENTION^max(0,t-1)
 *
 * where t is age in years. The result is then adjusted by multipliers for
 * cosmetic condition, battery health, accessories, paperwork, remaining
 * warranty and whether the machine still receives operating-system updates,
 * and finally reduced by any known repair cost.
 *
 * Every figure is an estimate of the private-sale price in the Indian used
 * market. Actual offers depend on the exact model, demand and the buyer.
 */

/** Share of purchase price a mainstream laptop typically retains after 12 months. */
export const FIRST_YEAR_RETENTION = 0.62;
/** Share retained per year after the first, i.e. about 22% depreciation a year. */
export const ANNUAL_RETENTION = 0.78;
/** A complete working laptop rarely trades below this share of its original price. */
export const SCRAP_FLOOR_FRACTION = 0.05;
/** Spread applied around the point estimate to give a realistic asking range. */
export const PRICE_BAND = 0.12;
/** Buy-back and trade-in programmes typically pay this share of a private sale. */
export const TRADE_IN_FACTOR = 0.72;
/** A laptop that no longer receives OS or security updates loses about a quarter of its value. */
export const NO_UPDATES_MULTIPLIER = 0.75;
/** Replacing a missing original charger is a real cost to the buyer. */
export const MISSING_CHARGER_MULTIPLIER = 0.94;
/** Original invoice matters because warranty transfer and GST resale need it. */
export const INVOICE_MULTIPLIER = 1.03;
/** Each month of transferable warranty left adds this much, capped below. */
export const WARRANTY_BONUS_PER_MONTH = 0.01;
export const WARRANTY_BONUS_CAP = 0.12;
/** Oldest age the model is meaningful for, in months. */
export const MAX_AGE_MONTHS = 240;
/** Highest purchase price the estimator accepts, in INR. */
export const MAX_PURCHASE_PRICE = 1000000;

/** Cosmetic and functional condition grades used across used-device marketplaces. */
export const CONDITIONS = [
  { value: "likeNew", label: "Like new — no marks, all accessories", multiplier: 1.0 },
  { value: "good", label: "Good — light wear, everything works", multiplier: 0.9 },
  { value: "fair", label: "Fair — visible scratches or dents", multiplier: 0.78 },
  { value: "poor", label: "Poor — heavy wear, cosmetic damage", multiplier: 0.6 },
  { value: "faulty", label: "Faulty — sold for spares or repair", multiplier: 0.3 },
];

export const CONDITION_MULTIPLIERS = CONDITIONS.reduce((map, item) => {
  map[item.value] = item.multiplier;
  return map;
}, {});

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Battery health multiplier.
 * 90% and above is treated as healthy; 80% is the point at which Apple and most
 * makers flag a battery for service; below 50% the buyer will assume a
 * replacement is needed and the penalty stops deepening.
 */
export function batteryMultiplier(healthPct) {
  if (!isNum(healthPct)) return 1;
  if (healthPct >= 90) return 1;
  if (healthPct <= 50) return 0.82;
  return 0.82 + (0.18 * (healthPct - 50)) / 40;
}

/** Retention factor from age alone, before any condition adjustment. */
export function ageRetention(ageMonths) {
  const years = ageMonths / 12;
  const firstPhase = FIRST_YEAR_RETENTION ** Math.min(years, 1);
  const laterPhase = ANNUAL_RETENTION ** Math.max(0, years - 1);
  return firstPhase * laterPhase;
}

/**
 * Estimate the resale value of a laptop.
 * Pure: age is supplied in months, no clock is read.
 */
export function estimateLaptopValue({
  purchasePrice = 80000,
  ageMonths = 24,
  condition = "good",
  batteryHealthPct = 85,
  hasCharger = true,
  hasInvoice = true,
  warrantyMonthsLeft = 0,
  receivesUpdates = true,
  repairCost = 0,
} = {}) {
  if (![purchasePrice, ageMonths, batteryHealthPct, warrantyMonthsLeft, repairCost].every(isNum)) {
    return { error: "Enter valid numbers in every field." };
  }
  if (purchasePrice <= 0) return { error: "Purchase price must be greater than zero." };
  if (purchasePrice > MAX_PURCHASE_PRICE) {
    return { error: `Purchase price above ${MAX_PURCHASE_PRICE} is outside this estimator's range.` };
  }
  if (ageMonths < 0) return { error: "Age cannot be negative." };
  if (ageMonths > MAX_AGE_MONTHS) {
    return { error: `Age above ${MAX_AGE_MONTHS} months is outside this estimator's range.` };
  }
  if (batteryHealthPct < 0 || batteryHealthPct > 100) {
    return { error: "Battery health must be between 0 and 100 percent." };
  }
  if (warrantyMonthsLeft < 0 || warrantyMonthsLeft > 60) {
    return { error: "Remaining warranty should be between 0 and 60 months." };
  }
  if (repairCost < 0) return { error: "Repair cost cannot be negative." };
  const conditionMultiplier = CONDITION_MULTIPLIERS[condition];
  if (!isNum(conditionMultiplier)) return { error: "Choose a condition grade." };

  const retention = ageRetention(ageMonths);
  const battery = batteryMultiplier(batteryHealthPct);
  const charger = hasCharger ? 1 : MISSING_CHARGER_MULTIPLIER;
  const invoice = hasInvoice ? INVOICE_MULTIPLIER : 1;
  const warranty = 1 + Math.min(WARRANTY_BONUS_CAP, warrantyMonthsLeft * WARRANTY_BONUS_PER_MONTH);
  const updates = receivesUpdates ? 1 : NO_UPDATES_MULTIPLIER;

  const rawValue =
    purchasePrice * retention * conditionMultiplier * battery * charger * invoice * warranty * updates;
  // A used machine cannot fetch more than it cost new, however good the paperwork.
  const beforeRepairs = Math.min(purchasePrice, rawValue);
  const floor = purchasePrice * SCRAP_FLOOR_FRACTION;
  const value = Math.max(floor, beforeRepairs - repairCost);

  const years = ageMonths / 12;
  const overallRetention = value / purchasePrice;
  const annualDepreciationPct =
    years > 0 ? (1 - overallRetention ** (1 / years)) * 100 : 0;

  return {
    estimatedValue: Math.round(value),
    rangeLow: Math.round(value * (1 - PRICE_BAND)),
    rangeHigh: Math.round(value * (1 + PRICE_BAND)),
    tradeInValue: Math.round(value * TRADE_IN_FACTOR),
    scrapFloor: Math.round(floor),
    atFloor: beforeRepairs - repairCost <= floor,
    atCeiling: rawValue > purchasePrice,
    purchasePrice: Math.round(purchasePrice),
    totalDepreciation: Math.round(purchasePrice - value),
    retainedPct: Math.round(overallRetention * 1000) / 10,
    annualDepreciationPct: Math.round(annualDepreciationPct * 10) / 10,
    ageYears: Math.round(years * 10) / 10,
    factors: [
      ["Age", `${Math.round(retention * 1000) / 10}%`],
      ["Condition", `${Math.round(conditionMultiplier * 1000) / 10}%`],
      ["Battery health", `${Math.round(battery * 1000) / 10}%`],
      ["Charger included", `${Math.round(charger * 1000) / 10}%`],
      ["Original invoice", `${Math.round(invoice * 1000) / 10}%`],
      ["Warranty left", `${Math.round(warranty * 1000) / 10}%`],
      ["Still gets OS updates", `${Math.round(updates * 1000) / 10}%`],
    ],
    repairCost: Math.round(repairCost),
  };
}
