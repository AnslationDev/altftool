/**
 * Smartphone resale value — a transparent multiplicative model.
 *
 *   value = launchPrice
 *         x retention(ageMonths)      declining balance, steeper in year one
 *         x conditionFactor           cosmetic and functional grade
 *         x storageFactor             how the variant is priced second-hand
 *         x demandFactor              how well the brand/line holds value
 *         x (1 + sum of adjustments)  box, bill, warranty, battery, repairs
 *   floored at the recycler's scrap price.
 *
 * Retention uses continuous declining balance so a 15-month-old phone is not
 * rounded to a year:
 *
 *   retention(m) = (1 - r1)^(min(m,12)/12) x (1 - r2)^(max(0, m-12)/12)
 *
 * Nothing here is a published tariff — used-phone pricing has no statutory
 * schedule. Every factor below is a stated modelling assumption, chosen to
 * match how organised buyback grids are structured (a large first-year drop, a
 * flatter tail, cosmetic grade bands, and fixed deductions for a failed battery
 * or a non-original screen). Every one of them is exposed in the tool and can
 * be overwritten with figures from a real quote.
 *
 * All functions are pure and total; invalid input returns { error }.
 */

/** Default declining-balance rates, % of remaining value per year. */
export const DEFAULT_FIRST_YEAR_DROP = 45;
export const DEFAULT_LATER_YEAR_DROP = 30;

/** What an organised e-waste recycler pays for a dead handset, in rupees. */
export const DEFAULT_SCRAP_VALUE = 400;

/** Cosmetic and functional grades, in the order buyback grids use them. */
export const CONDITION_GRADES = [
  { id: "sealed", label: "Sealed / unused", factor: 1.0, hint: "Never opened or opened but unused, all seals intact" },
  { id: "like-new", label: "Like new", factor: 0.94, hint: "No marks visible at arm's length, screen unmarked" },
  { id: "excellent", label: "Excellent", factor: 0.86, hint: "Faint hairline marks only under direct light" },
  { id: "good", label: "Good", factor: 0.76, hint: "Visible scuffs on frame or back, screen intact" },
  { id: "fair", label: "Fair", factor: 0.62, hint: "Deep scratches, dents, worn edges, screen intact" },
  { id: "cracked", label: "Cracked glass", factor: 0.38, hint: "Screen or back glass cracked but the phone works" },
  { id: "dead", label: "Not powering on", factor: 0.1, hint: "Sold for parts only" },
];

/** Storage variants are priced apart from each other in the used market. */
export const STORAGE_TIERS = [
  { id: "64", label: "64 GB or less", factor: 0.94 },
  { id: "128", label: "128 GB", factor: 1.0 },
  { id: "256", label: "256 GB", factor: 1.05 },
  { id: "512", label: "512 GB", factor: 1.08 },
  { id: "1024", label: "1 TB", factor: 1.1 },
];

/** How strongly the brand and line hold value on the resale market. */
export const DEMAND_TIERS = [
  { id: "very-high", label: "Very strong (iPhone, Galaxy S/Z flagship)", factor: 1.12 },
  { id: "high", label: "Strong (Pixel, OnePlus flagship, Galaxy A)", factor: 1.0 },
  { id: "average", label: "Average (mainstream Xiaomi, Realme, Vivo, Oppo)", factor: 0.9 },
  { id: "low", label: "Weak (entry-level or discontinued brand)", factor: 0.78 },
];

/**
 * Additive adjustments, in percentage points of value.
 * Positive adds, negative deducts. Applied as one summed factor.
 */
export const ADJUSTMENTS = [
  { id: "box", label: "Original box, charger and cable", pct: 4 },
  { id: "bill", label: "Original purchase invoice available", pct: 3 },
  { id: "warranty", label: "Manufacturer warranty still valid", pct: 6 },
  { id: "battery", label: "Battery health below 80% / replacement due", pct: -9 },
  { id: "non-oem-screen", label: "Screen or back glass replaced with a non-original part", pct: -13 },
  { id: "repairs", label: "More than one prior repair on record", pct: -5 },
  { id: "locked", label: "Carrier locked, account locked or bad IMEI", pct: -60 },
];

/** The summed adjustment is clamped so no combination produces nonsense. */
export const MIN_ADJUSTMENT_PCT = -85;
export const MAX_ADJUSTMENT_PCT = 15;

/** Spread between an instant trade-in quote and a patient private sale. */
export const INSTANT_QUOTE_FACTOR = 0.85;
export const PATIENT_SALE_FACTOR = 1.12;

const isNum = (v) => typeof v === "number" && Number.isFinite(v);

const round = (v, dp = 0) => {
  if (!Number.isFinite(v)) return 0;
  const f = 10 ** dp;
  return Math.round((v + Number.EPSILON) * f) / f;
};

const findById = (list, id, fallbackIndex = 0) =>
  list.find((item) => item.id === id) || list[fallbackIndex];

/** Declining-balance retention with a distinct first-year rate. */
export function retentionAt(ageMonths, firstYearDropPct, laterYearDropPct) {
  if (!isNum(ageMonths) || ageMonths <= 0) return 1;
  const y1 = Math.min(ageMonths, 12) / 12;
  const rest = Math.max(0, ageMonths - 12) / 12;
  const a = (1 - firstYearDropPct / 100) ** y1;
  const b = (1 - laterYearDropPct / 100) ** rest;
  const value = a * b;
  return Number.isFinite(value) ? value : 0;
}

export function estimateSmartphoneResale({
  launchPrice,
  ageMonths,
  conditionId = "good",
  storageId = "128",
  demandId = "high",
  adjustmentIds = [],
  firstYearDropPct = DEFAULT_FIRST_YEAR_DROP,
  laterYearDropPct = DEFAULT_LATER_YEAR_DROP,
  scrapValue = DEFAULT_SCRAP_VALUE,
}) {
  if (!isNum(launchPrice) || launchPrice <= 0) {
    return { error: "Enter the launch price of your exact variant." };
  }
  if (launchPrice > 5000000) {
    return { error: "That launch price is not realistic for a phone — check the number." };
  }
  if (!isNum(ageMonths) || ageMonths < 0) {
    return { error: "Age in months cannot be negative." };
  }
  if (ageMonths > 240) {
    return { error: "Enter an age of 240 months (20 years) or less." };
  }
  if (!isNum(firstYearDropPct) || firstYearDropPct < 0 || firstYearDropPct >= 100) {
    return { error: "First-year depreciation must be between 0% and 99%." };
  }
  if (!isNum(laterYearDropPct) || laterYearDropPct < 0 || laterYearDropPct >= 100) {
    return { error: "Later-year depreciation must be between 0% and 99%." };
  }
  if (!isNum(scrapValue) || scrapValue < 0) {
    return { error: "Scrap value cannot be negative." };
  }

  const condition = findById(CONDITION_GRADES, conditionId, 3);
  const storage = findById(STORAGE_TIERS, storageId, 1);
  const demand = findById(DEMAND_TIERS, demandId, 1);

  const selected = ADJUSTMENTS.filter((item) => adjustmentIds.includes(item.id));
  const rawAdjustmentPct = selected.reduce((sum, item) => sum + item.pct, 0);
  const adjustmentPct = Math.max(
    MIN_ADJUSTMENT_PCT,
    Math.min(MAX_ADJUSTMENT_PCT, rawAdjustmentPct),
  );

  const retention = retentionAt(ageMonths, firstYearDropPct, laterYearDropPct);
  const beforeFloor =
    launchPrice *
    retention *
    condition.factor *
    storage.factor *
    demand.factor *
    (1 + adjustmentPct / 100);

  // Two hard bounds. A used handset cannot be worth more than the price it
  // launched at, and it cannot be worth less than what a recycler pays for it.
  const capped = Math.min(launchPrice, beforeFloor);
  const value = Math.max(scrapValue, capped);
  const atFloor = capped < scrapValue;
  const atCap = beforeFloor > launchPrice;

  const lost = launchPrice - value;
  const perMonth = ageMonths > 0 ? lost / ageMonths : 0;
  const perDay = ageMonths > 0 ? lost / (ageMonths * 30.4375) : 0;

  return {
    launchPrice: round(launchPrice),
    ageMonths: round(ageMonths, 1),
    retentionPct: round(retention * 100, 1),
    condition: condition.label,
    conditionFactor: condition.factor,
    storage: storage.label,
    storageFactor: storage.factor,
    demand: demand.label,
    demandFactor: demand.factor,
    adjustmentPct: round(adjustmentPct, 1),
    adjustmentsApplied: selected.map((item) => ({ label: item.label, pct: item.pct })),
    adjustmentClamped: rawAdjustmentPct !== adjustmentPct,
    value: round(value),
    instantQuote: round(Math.max(scrapValue, value * INSTANT_QUOTE_FACTOR)),
    patientSale: round(Math.min(launchPrice, value * PATIENT_SALE_FACTOR)),
    atFloor,
    atCap,
    scrapValue: round(scrapValue),
    valueLost: round(lost),
    retainedPct: round((value / launchPrice) * 100, 1),
    lossPerMonth: round(perMonth),
    lossPerDay: round(perDay),
  };
}
