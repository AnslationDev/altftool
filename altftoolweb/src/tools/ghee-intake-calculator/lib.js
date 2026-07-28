/**
 * Ghee intake calculator.
 *
 * Works out how much ghee fits inside two ceilings at once:
 *   1. total fat as a share of daily energy, and
 *   2. saturated fat as a share of daily energy.
 * Whichever runs out first is the binding constraint.
 *
 * Sources for the constants:
 *  - Ghee composition: USDA FoodData Central, "Butter oil, anhydrous (ghee)" —
 *    876 kcal, 99.5 g fat and 61.9 g saturated fat per 100 g.
 *  - Total fat: 20-30% of total energy for adults, the range used by ICMR-NIN
 *    in the 2020 Indian RDA report; the wider IOM/AMDR range runs to 35%.
 *  - Saturated fat: WHO 2023 saturated fatty acid guideline, reduce intake to
 *    less than 10% of total energy. The American Heart Association suggests
 *    under 6% for people who need to lower LDL cholesterol.
 *  - Fat supplies 9 kcal per gram (Atwater factor).
 */

export const KCAL_PER_G_FAT = 9;

/** Ghee per 100 g. */
export const GHEE_KCAL_PER_100G = 876;
export const GHEE_FAT_G_PER_100G = 99.5;
export const GHEE_SATURATED_G_PER_100G = 61.9;

/** Ghee is about 0.91 g/mL, so a 5 mL teaspoon holds roughly 4.5 g. */
export const GRAMS_PER_TEASPOON = 4.5;
export const GRAMS_PER_TABLESPOON = 13.6;

/** Selectable total-fat shares of energy. */
export const TOTAL_FAT_OPTIONS = [
  { id: "20", pct: 20, label: "20% of energy (lower end of the ICMR-NIN range)" },
  { id: "25", pct: 25, label: "25% of energy" },
  { id: "30", pct: 30, label: "30% of energy (upper end of the ICMR-NIN range)" },
  { id: "35", pct: 35, label: "35% of energy (upper end of the wider AMDR)" },
];

/** Selectable saturated-fat ceilings. */
export const SATURATED_OPTIONS = [
  { id: "who", pct: 10, label: "Under 10% of energy (WHO 2023)" },
  { id: "aha", pct: 6, label: "Under 6% of energy (AHA, for lowering LDL)" },
];

export const MIN_DAILY_KCAL = 800;
export const MAX_DAILY_KCAL = 6000;
export const MAX_OTHER_FAT_G = 300;

const toFinite = (value) => {
  const num = typeof value === "number" ? value : Number(String(value ?? "").trim());
  return Number.isFinite(num) ? num : NaN;
};

/** Grams of ghee expressed as teaspoons and tablespoons. */
export function gheeSpoons(grams) {
  return {
    teaspoons: grams / GRAMS_PER_TEASPOON,
    tablespoons: grams / GRAMS_PER_TABLESPOON,
  };
}

/** Everything one quantity of ghee contributes. */
export function gheeNutrition(grams) {
  const factor = grams / 100;
  return {
    grams,
    kcal: GHEE_KCAL_PER_100G * factor,
    fat: GHEE_FAT_G_PER_100G * factor,
    saturatedFat: GHEE_SATURATED_G_PER_100G * factor,
    ...gheeSpoons(grams),
  };
}

/**
 * Work out the daily ghee allowance.
 *
 * @param {object} input
 * @param {number|string} input.dailyKcal daily energy target
 * @param {number|string} input.totalFatPct total fat as a percentage of energy
 * @param {number|string} input.saturatedPct saturated fat ceiling as a percentage of energy
 * @param {number|string} input.otherFatG fat already coming from the rest of the day
 * @param {number|string} input.otherSaturatedG saturated fat already coming from the rest of the day
 * @returns {object} allowance figures, or { error } when the input is unusable
 */
export function calculateGheeAllowance({
  dailyKcal,
  totalFatPct,
  saturatedPct,
  otherFatG,
  otherSaturatedG,
}) {
  const daily = toFinite(dailyKcal);
  const fatPct = toFinite(totalFatPct);
  const satPct = toFinite(saturatedPct);
  const otherFat = toFinite(otherFatG);
  const otherSat = toFinite(otherSaturatedG);

  if ([daily, fatPct, satPct, otherFat, otherSat].some(Number.isNaN)) {
    return { error: "Enter a number in every field." };
  }
  if (daily < MIN_DAILY_KCAL || daily > MAX_DAILY_KCAL) {
    return { error: `Daily calorie target must be between ${MIN_DAILY_KCAL} and ${MAX_DAILY_KCAL} kcal.` };
  }
  if (fatPct < 15 || fatPct > 40) {
    return { error: "Total fat share should be between 15% and 40% of energy." };
  }
  if (satPct < 3 || satPct > 15) {
    return { error: "Saturated fat ceiling should be between 3% and 15% of energy." };
  }
  if (satPct > fatPct) {
    return { error: "The saturated fat ceiling cannot be higher than the total fat share." };
  }
  if (otherFat < 0 || otherSat < 0) {
    return { error: "Fat already eaten cannot be negative." };
  }
  if (otherFat > MAX_OTHER_FAT_G || otherSat > MAX_OTHER_FAT_G) {
    return { error: `Fat from the rest of the day must be under ${MAX_OTHER_FAT_G} g.` };
  }
  if (otherSat > otherFat) {
    return { error: "Saturated fat from the rest of the day cannot exceed its total fat." };
  }

  const totalFatBudget = (daily * (fatPct / 100)) / KCAL_PER_G_FAT;
  const saturatedBudget = (daily * (satPct / 100)) / KCAL_PER_G_FAT;

  const fatRemaining = totalFatBudget - otherFat;
  const saturatedRemaining = saturatedBudget - otherSat;

  const gheeByFat = (fatRemaining / GHEE_FAT_G_PER_100G) * 100;
  const gheeBySaturated = (saturatedRemaining / GHEE_SATURATED_G_PER_100G) * 100;

  const rawAllowance = Math.min(gheeByFat, gheeBySaturated);
  const allowanceGrams = rawAllowance > 0 ? rawAllowance : 0;
  const binding = gheeBySaturated <= gheeByFat ? "saturated" : "total";

  const nutrition = gheeNutrition(allowanceGrams);

  const notes = [];
  if (allowanceGrams === 0) {
    notes.push(
      fatRemaining <= 0
        ? "The rest of the day already uses the whole total fat budget, so there is no room left for added ghee."
        : "The rest of the day already uses the whole saturated fat budget, so there is no room left for added ghee.",
    );
  } else {
    notes.push(
      binding === "saturated"
        ? "Saturated fat is the binding limit here — ghee is about 62% saturated, so it runs out before the total fat budget does."
        : "Total fat is the binding limit here; you have saturated fat headroom left over.",
    );
  }
  if (satPct === 6) {
    notes.push("The 6% ceiling is the stricter American Heart Association figure for people lowering LDL cholesterol, not a general population target.");
  }
  notes.push("Ghee counts as visible fat alongside cooking oil and butter; the budget above covers all of them together.");

  return {
    dailyKcal: daily,
    totalFatPct: fatPct,
    saturatedPct: satPct,
    totalFatBudget,
    saturatedBudget,
    otherFat,
    otherSaturated: otherSat,
    fatRemaining,
    saturatedRemaining,
    gheeByFat,
    gheeBySaturated,
    // Never show a negative "allowed" figure; a used-up budget means zero.
    gheeByFatAllowed: gheeByFat > 0 ? gheeByFat : 0,
    gheeBySaturatedAllowed: gheeBySaturated > 0 ? gheeBySaturated : 0,
    binding,
    allowanceGrams,
    allowanceTeaspoons: nutrition.teaspoons,
    allowanceTablespoons: nutrition.tablespoons,
    allowanceKcal: nutrition.kcal,
    allowanceSaturated: nutrition.saturatedFat,
    allowanceShareOfDayPct: (nutrition.kcal / daily) * 100,
    notes,
  };
}
