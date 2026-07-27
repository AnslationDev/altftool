/**
 * Plastic Reduction Tracker — maths.
 *
 * Method: weight-based accounting. Each avoided single-use item is converted to
 * grams of plastic using a published average item mass, then to kg of CO2e using a
 * cradle-to-grave emission factor for virgin plastic.
 *
 * No React, no DOM, no clock reads — every date/period is passed in.
 */

/** Weeks in a calendar year, used to annualise a weekly habit. */
export const WEEKS_PER_YEAR = 52;

/**
 * Cradle-to-grave CO2e for virgin plastic, kg CO2e per kg of plastic.
 * Roughly 3 kg for resin production + conversion and ~2.7-3 kg released when the
 * item is incinerated (plastic is ~80% carbon by mass). Widely used planning
 * figure for single-use packaging; treat as an order-of-magnitude estimate.
 */
export const CO2E_KG_PER_KG_PLASTIC = 6;

/**
 * Global average single-use plastic waste generated per person per year, in kg.
 * Minderoo Foundation, Plastic Waste Makers Index (2021): ~20.9 kg per capita.
 */
export const GLOBAL_AVG_SINGLE_USE_KG_PER_YEAR = 20.9;

/** Mass of a standard 500 ml PET water bottle in grams — used for "bottles avoided". */
export const PET_BOTTLE_GRAMS = 9.9;

/**
 * Catalogue of trackable single-use items.
 * grams  = typical empty item mass (packaging weight studies for PET/HDPE/PP/PS items)
 * inr    = typical Indian retail price avoided when you refuse or replace the item;
 *          set to 0 for items that are normally handed over free.
 */
export const PLASTIC_ITEMS = [
  { id: "bottle", label: "500 ml PET water bottle", grams: PET_BOTTLE_GRAMS, inr: 20 },
  { id: "bag", label: "Single-use carry bag", grams: 5.5, inr: 5 },
  { id: "cup", label: "Disposable cup + lid", grams: 4.5, inr: 8 },
  { id: "straw", label: "Plastic straw", grams: 0.42, inr: 1 },
  { id: "cutlery", label: "Disposable spoon / fork", grams: 4, inr: 2 },
  { id: "container", label: "Takeaway food container", grams: 30, inr: 15 },
  { id: "sachet", label: "Shampoo / condiment sachet", grams: 1.2, inr: 3 },
  { id: "wrap", label: "Cling film or packaging sheet", grams: 3, inr: 2 },
];

/** Highest weekly count accepted for a single item — anything above is a typo. */
export const MAX_WEEKLY_COUNT = 5000;

/** Longest streak accepted, in weeks (10 years). */
export const MAX_WEEKS_TRACKED = 520;

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * @param {object} input
 * @param {Record<string, number>} input.counts   items avoided per week, keyed by item id
 * @param {number} input.weeksTracked             how many weeks the habit has been kept
 * @returns {object} impact summary, or { error } when the input cannot be used
 */
export function computePlasticImpact({ counts = {}, weeksTracked = 1 } = {}) {
  if (!isFiniteNumber(weeksTracked)) {
    return { error: "Enter how many weeks you have kept this up." };
  }
  if (weeksTracked < 1) {
    return { error: "Track at least one full week to see an impact." };
  }
  if (weeksTracked > MAX_WEEKS_TRACKED) {
    return { error: `Weeks tracked must be ${MAX_WEEKS_TRACKED} or fewer (10 years).` };
  }

  const breakdown = [];
  let weeklyGrams = 0;
  let weeklyMoney = 0;
  let totalItemsPerWeek = 0;

  for (const item of PLASTIC_ITEMS) {
    const raw = counts[item.id];
    const count = raw === undefined || raw === null || raw === "" ? 0 : Number(raw);
    if (!isFiniteNumber(count)) {
      return { error: `Enter a whole number of "${item.label}" items, or leave it blank.` };
    }
    if (count < 0) return { error: "Item counts cannot be negative." };
    if (count > MAX_WEEKLY_COUNT) {
      return { error: `A weekly count above ${MAX_WEEKLY_COUNT} looks like a typo.` };
    }

    const grams = count * item.grams;
    const money = count * item.inr;
    weeklyGrams += grams;
    weeklyMoney += money;
    totalItemsPerWeek += count;

    if (count > 0) {
      breakdown.push({
        id: item.id,
        label: item.label,
        count,
        gramsPerWeek: grams,
        gramsPerYear: grams * WEEKS_PER_YEAR,
        kgPerYear: (grams * WEEKS_PER_YEAR) / 1000,
        inrPerWeek: money,
      });
    }
  }

  if (totalItemsPerWeek <= 0) {
    return { error: "Log at least one avoided item to see your impact." };
  }

  breakdown.sort((a, b) => b.gramsPerWeek - a.gramsPerWeek);

  const annualGrams = weeklyGrams * WEEKS_PER_YEAR;
  const trackedGrams = weeklyGrams * weeksTracked;
  const annualKg = annualGrams / 1000;
  const trackedKg = trackedGrams / 1000;

  return {
    weeksTracked,
    weeklyGrams,
    weeklyKg: weeklyGrams / 1000,
    annualKg,
    trackedKg,
    itemsPerWeek: totalItemsPerWeek,
    itemsPerYear: totalItemsPerWeek * WEEKS_PER_YEAR,
    itemsTracked: totalItemsPerWeek * weeksTracked,
    co2eKgPerYear: annualKg * CO2E_KG_PER_KG_PLASTIC,
    co2eKgTracked: trackedKg * CO2E_KG_PER_KG_PLASTIC,
    bottleEquivalentPerYear: annualGrams / PET_BOTTLE_GRAMS,
    shareOfAverageFootprint: (annualKg / GLOBAL_AVG_SINGLE_USE_KG_PER_YEAR) * 100,
    moneySavedPerWeek: weeklyMoney,
    moneySavedPerYear: weeklyMoney * WEEKS_PER_YEAR,
    moneySavedTracked: weeklyMoney * weeksTracked,
    topContributor: breakdown[0] ?? null,
    breakdown,
  };
}

/**
 * Milestone ladder in kg of plastic avoided. Returns the next target and progress.
 * Thresholds are round human-scale numbers, not a published standard.
 */
export const MILESTONES_KG = [1, 5, 10, 25, 50, 100, 250];

export function nextMilestone(kgAvoided) {
  if (!isFiniteNumber(kgAvoided) || kgAvoided < 0) return null;
  const target = MILESTONES_KG.find((value) => value > kgAvoided);
  if (target === undefined) {
    return { target: null, progressPct: 100, remainingKg: 0 };
  }
  return {
    target,
    progressPct: (kgAvoided / target) * 100,
    remainingKg: target - kgAvoided,
  };
}
