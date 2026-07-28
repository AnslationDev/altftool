/**
 * Chai and coffee added-sugar tracker.
 *
 * Two things are counted separately:
 *   1. the base drink (milk, coffee decoction, tea) with no sugar added, and
 *   2. the sugar spooned in, which is what WHO calls a free sugar.
 *
 * Sources for the constants:
 *  - Sugar supplies 4 kcal per gram (Atwater factor); a level teaspoon of
 *    granulated sugar weighs about 4 g.
 *  - WHO Guideline: Sugars intake for adults and children (2015) — keep free
 *    sugars below 10% of total energy, and below 5% for further benefit.
 *  - 7,700 kcal per kilogram is the long-standing rule-of-thumb energy content
 *    of body fat (Wishnofsky, 1958). It over-simplifies real weight change and
 *    is shown here only to put a year of sugar in perspective.
 *
 * Base-drink energy figures are typical Indian home and cafe servings and vary
 * with how much milk goes in.
 */

export const SUGAR_G_PER_TEASPOON = 4;
export const KCAL_PER_G_SUGAR = 4;
export const WHO_SUGAR_LIMIT_STRONG = 0.1;
export const WHO_SUGAR_LIMIT_CONDITIONAL = 0.05;
export const KCAL_PER_KG_BODY_FAT = 7700;
export const DAYS_PER_YEAR = 365;
export const DAYS_PER_MONTH = 30;

export const MIN_DAILY_KCAL = 800;
export const MAX_DAILY_KCAL = 6000;
export const MAX_CUPS = 30;
export const MAX_TEASPOONS = 20;

/** Base energy per cup with NO added sugar, plus the usual spoons of sugar. */
export const DRINKS = [
  { id: "masala-chai", name: "Masala chai with milk", serving: "150 ml cup", baseKcal: 35, defaultTsp: 2 },
  { id: "cutting-chai", name: "Cutting chai", serving: "100 ml glass", baseKcal: 25, defaultTsp: 1.5 },
  { id: "black-tea", name: "Black tea, no milk", serving: "150 ml cup", baseKcal: 2, defaultTsp: 1 },
  { id: "green-tea", name: "Green tea", serving: "150 ml cup", baseKcal: 2, defaultTsp: 0 },
  { id: "filter-coffee", name: "South Indian filter coffee", serving: "150 ml tumbler", baseKcal: 60, defaultTsp: 2 },
  { id: "instant-coffee", name: "Instant coffee with milk", serving: "150 ml cup", baseKcal: 40, defaultTsp: 1.5 },
  { id: "black-coffee", name: "Black coffee", serving: "150 ml cup", baseKcal: 2, defaultTsp: 1 },
  { id: "cappuccino", name: "Cafe cappuccino", serving: "180 ml", baseKcal: 90, defaultTsp: 1 },
  { id: "latte", name: "Cafe latte", serving: "240 ml", baseKcal: 130, defaultTsp: 1 },
  { id: "cold-coffee", name: "Cold coffee / frappe", serving: "300 ml", baseKcal: 180, defaultTsp: 3 },
];

const toFinite = (value) => {
  const num = typeof value === "number" ? value : Number(String(value ?? "").trim());
  return Number.isFinite(num) ? num : NaN;
};

/** Look up a drink by id. */
export function findDrink(id) {
  return DRINKS.find((drink) => drink.id === id);
}

/** WHO free-sugar ceilings in grams for a daily energy intake. */
export function sugarLimits(dailyKcal) {
  return {
    strongGrams: (dailyKcal * WHO_SUGAR_LIMIT_STRONG) / KCAL_PER_G_SUGAR,
    conditionalGrams: (dailyKcal * WHO_SUGAR_LIMIT_CONDITIONAL) / KCAL_PER_G_SUGAR,
  };
}

/**
 * Total the sugar and calories in a day's tea and coffee.
 *
 * @param {object} input
 * @param {Array<{id: string, cups: number|string, teaspoons: number|string}>} input.entries
 * @param {number|string} input.dailyKcal daily energy intake, for the WHO comparison
 * @returns {object} totals, or { error } when the input is unusable
 */
export function trackSugar({ entries = [], dailyKcal }) {
  const daily = toFinite(dailyKcal);

  if (Number.isNaN(daily)) {
    return { error: "Enter a number for your daily calorie intake." };
  }
  if (daily < MIN_DAILY_KCAL || daily > MAX_DAILY_KCAL) {
    return { error: `Daily calorie intake must be between ${MIN_DAILY_KCAL} and ${MAX_DAILY_KCAL} kcal.` };
  }
  if (!Array.isArray(entries)) {
    return { error: "Could not read the drinks list." };
  }

  const lines = [];
  let cups = 0;
  let teaspoons = 0;
  let baseKcal = 0;

  for (const entry of entries) {
    const cupCount = toFinite(entry?.cups);
    const tsp = toFinite(entry?.teaspoons);
    if (Number.isNaN(cupCount) || Number.isNaN(tsp)) {
      return { error: "Cups and teaspoons must be numbers." };
    }
    if (cupCount < 0 || cupCount > MAX_CUPS) {
      return { error: `Cups per day for each drink must be between 0 and ${MAX_CUPS}.` };
    }
    if (tsp < 0 || tsp > MAX_TEASPOONS) {
      return { error: `Teaspoons per cup must be between 0 and ${MAX_TEASPOONS}.` };
    }
    if (cupCount === 0) continue;
    const drink = findDrink(entry?.id);
    if (!drink) return { error: "One of the drinks is not in the list." };

    const lineTsp = tsp * cupCount;
    const lineSugarG = lineTsp * SUGAR_G_PER_TEASPOON;
    const lineBase = drink.baseKcal * cupCount;
    lines.push({
      id: drink.id,
      name: drink.name,
      serving: drink.serving,
      cups: cupCount,
      teaspoonsPerCup: tsp,
      teaspoons: lineTsp,
      sugarG: lineSugarG,
      sugarKcal: lineSugarG * KCAL_PER_G_SUGAR,
      baseKcal: lineBase,
      totalKcal: lineBase + lineSugarG * KCAL_PER_G_SUGAR,
    });
    cups += cupCount;
    teaspoons += lineTsp;
    baseKcal += lineBase;
  }

  const sugarG = teaspoons * SUGAR_G_PER_TEASPOON;
  const sugarKcal = sugarG * KCAL_PER_G_SUGAR;
  const totalKcal = baseKcal + sugarKcal;
  const limits = sugarLimits(daily);

  // Dropping one teaspoon from every cup, as a concrete next step.
  const cupsWithSugar = lines.filter((line) => line.teaspoonsPerCup > 0).reduce((sum, line) => sum + line.cups, 0);
  const oneSpoonLessSugarG = cupsWithSugar * SUGAR_G_PER_TEASPOON;

  return {
    empty: lines.length === 0,
    lines,
    cups,
    teaspoons,
    sugarG,
    sugarKcal,
    baseKcal,
    totalKcal,
    dailyKcal: daily,
    sugarShareOfDayPct: (sugarKcal / daily) * 100,
    drinkShareOfDayPct: (totalKcal / daily) * 100,
    limitStrongGrams: limits.strongGrams,
    limitConditionalGrams: limits.conditionalGrams,
    pctOfStrongLimit: (sugarG / limits.strongGrams) * 100,
    pctOfConditionalLimit: (sugarG / limits.conditionalGrams) * 100,
    overStrongLimit: sugarG > limits.strongGrams,
    weeklySugarG: sugarG * 7,
    monthlySugarG: sugarG * DAYS_PER_MONTH,
    yearlySugarKg: (sugarG * DAYS_PER_YEAR) / 1000,
    yearlySugarKcal: sugarKcal * DAYS_PER_YEAR,
    yearlyFatEquivalentKg: (sugarKcal * DAYS_PER_YEAR) / KCAL_PER_KG_BODY_FAT,
    oneSpoonLessSugarG,
    oneSpoonLessYearlyKg: (oneSpoonLessSugarG * DAYS_PER_YEAR) / 1000,
    oneSpoonLessYearlyKcal: oneSpoonLessSugarG * KCAL_PER_G_SUGAR * DAYS_PER_YEAR,
  };
}
