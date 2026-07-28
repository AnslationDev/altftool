/**
 * South Indian breakfast calorie and macro totals.
 *
 * Energy is never stored as a separate number. Every item holds estimated
 * protein, carbohydrate and fat for one standard portion, and energy is derived
 * with the Atwater general factors — 4 kcal per gram of protein, 4 per gram of
 * carbohydrate and 9 per gram of fat — so the calorie figure and the macro
 * breakdown can never disagree with each other.
 *
 * Portion macros are typical values for home-style preparations of standard
 * Indian portions. Restaurant versions use considerably more oil and ghee.
 */

/** Atwater general factors, kcal per gram. */
export const KCAL_PER_G_PROTEIN = 4;
export const KCAL_PER_G_CARB = 4;
export const KCAL_PER_G_FAT = 9;

/** Portion macros in grams. `fried` marks deep-fried or heavily tempered items. */
export const ITEMS = [
  { id: "idli", name: "Idli", portion: "1 piece, ~50 g", group: "Steamed", proteinG: 2.0, carbG: 12.0, fatG: 0.2, fibreG: 0.8, fried: false },
  { id: "rava-idli", name: "Rava idli", portion: "1 piece", group: "Steamed", proteinG: 2.5, carbG: 13.0, fatG: 2.5, fibreG: 0.7, fried: false },
  { id: "idiyappam", name: "Idiyappam (string hopper)", portion: "1 piece", group: "Steamed", proteinG: 1.8, carbG: 20.0, fatG: 0.3, fibreG: 0.5, fried: false },
  { id: "puttu", name: "Puttu with coconut", portion: "1 katori", group: "Steamed", proteinG: 4.0, carbG: 38.0, fatG: 3.0, fibreG: 3.0, fried: false },
  { id: "appam", name: "Appam", portion: "1 piece", group: "Griddle", proteinG: 2.0, carbG: 24.0, fatG: 1.5, fibreG: 0.6, fried: false },
  { id: "plain-dosa", name: "Plain dosa", portion: "1 piece with 1 tsp oil", group: "Griddle", proteinG: 3.0, carbG: 20.0, fatG: 4.5, fibreG: 1.0, fried: false },
  { id: "set-dosa", name: "Set dosa", portion: "1 piece", group: "Griddle", proteinG: 2.0, carbG: 15.0, fatG: 2.5, fibreG: 0.8, fried: false },
  { id: "masala-dosa", name: "Masala dosa", portion: "1 with potato masala", group: "Griddle", proteinG: 5.0, carbG: 36.0, fatG: 9.0, fibreG: 3.0, fried: false },
  { id: "rava-dosa", name: "Rava dosa", portion: "1 piece", group: "Griddle", proteinG: 3.5, carbG: 26.0, fatG: 9.0, fibreG: 1.2, fried: true },
  { id: "uttapam", name: "Onion uttapam", portion: "1 piece", group: "Griddle", proteinG: 4.5, carbG: 28.0, fatG: 5.5, fibreG: 2.0, fried: false },
  { id: "medu-vada", name: "Medu vada", portion: "1 piece, ~45 g", group: "Fried", proteinG: 3.5, carbG: 14.0, fatG: 7.0, fibreG: 2.0, fried: true },
  { id: "poori", name: "Poori", portion: "1 piece", group: "Fried", proteinG: 1.8, carbG: 13.0, fatG: 5.2, fibreG: 1.4, fried: true },
  { id: "bonda", name: "Mysore bonda", portion: "1 piece", group: "Fried", proteinG: 2.5, carbG: 16.0, fatG: 8.0, fibreG: 1.0, fried: true },
  { id: "upma", name: "Rava upma", portion: "1 katori, ~150 g", group: "Rice & rava", proteinG: 5.0, carbG: 36.0, fatG: 9.0, fibreG: 2.5, fried: false },
  { id: "pongal", name: "Ven pongal", portion: "1 katori, ~150 g", group: "Rice & rava", proteinG: 7.0, carbG: 40.0, fatG: 10.0, fibreG: 3.0, fried: false },
  { id: "kesari", name: "Kesari bath", portion: "1 katori", group: "Rice & rava", proteinG: 4.0, carbG: 50.0, fatG: 12.0, fibreG: 1.0, fried: false },
  { id: "lemon-rice", name: "Lemon rice", portion: "1 katori", group: "Rice & rava", proteinG: 4.0, carbG: 42.0, fatG: 8.0, fibreG: 1.5, fried: false },
  { id: "sambar", name: "Sambar", portion: "1 katori, ~150 g", group: "Accompaniments", proteinG: 4.5, carbG: 14.0, fatG: 3.5, fibreG: 4.0, fried: false },
  { id: "rasam", name: "Rasam", portion: "1 katori", group: "Accompaniments", proteinG: 1.5, carbG: 6.0, fatG: 1.5, fibreG: 1.0, fried: false },
  { id: "coconut-chutney", name: "Coconut chutney", portion: "2 tbsp, ~30 g", group: "Accompaniments", proteinG: 1.5, carbG: 3.0, fatG: 8.0, fibreG: 2.0, fried: false },
  { id: "tomato-chutney", name: "Tomato or onion chutney", portion: "2 tbsp", group: "Accompaniments", proteinG: 1.0, carbG: 5.0, fatG: 2.3, fibreG: 1.0, fried: false },
  { id: "podi-oil", name: "Molagapodi with oil", portion: "1 tsp podi + 1.5 tsp oil", group: "Accompaniments", proteinG: 1.2, carbG: 2.0, fatG: 7.0, fibreG: 1.0, fried: false },
  { id: "filter-coffee-sugar", name: "Filter coffee with sugar", portion: "150 ml", group: "Drinks", proteinG: 2.5, carbG: 14.0, fatG: 2.5, fibreG: 0, fried: false },
  { id: "filter-coffee-plain", name: "Filter coffee, no sugar", portion: "150 ml", group: "Drinks", proteinG: 2.5, carbG: 4.0, fatG: 2.5, fibreG: 0, fried: false },
  { id: "masala-chai", name: "Masala chai with sugar", portion: "150 ml", group: "Drinks", proteinG: 2.0, carbG: 10.5, fatG: 2.0, fibreG: 0, fried: false },
];

/** Typical share of daily energy taken at breakfast. */
export const BREAKFAST_SHARE_PERCENT = 25;
export const MIN_DAILY_TARGET_KCAL = 800;
export const MAX_DAILY_TARGET_KCAL = 5000;
export const MAX_QTY_PER_ITEM = 20;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Energy of one portion, from its macros. */
export function itemEnergyKcal(item) {
  if (!item) return NaN;
  return (
    item.proteinG * KCAL_PER_G_PROTEIN +
    item.carbG * KCAL_PER_G_CARB +
    item.fatG * KCAL_PER_G_FAT
  );
}

/** Look up an item by id. */
export function getItem(id) {
  return ITEMS.find((item) => item.id === id) || null;
}

/** Group ids in display order. */
export function itemGroups() {
  const seen = [];
  ITEMS.forEach((item) => {
    if (!seen.includes(item.group)) seen.push(item.group);
  });
  return seen.map((group) => ({ group, items: ITEMS.filter((item) => item.group === group) }));
}

/**
 * Total a plate.
 *
 * @param {object} input
 * @param {Array<{id:string, qty:number}>} input.selections
 * @param {number} [input.dailyTargetKcal]
 * @param {number} [input.breakfastSharePercent]
 * @returns {object} result or { error }
 */
export function computeMeal({
  selections = [],
  dailyTargetKcal = 2000,
  breakfastSharePercent = BREAKFAST_SHARE_PERCENT,
} = {}) {
  if (!Array.isArray(selections)) return { error: "Selections must be supplied as a list." };
  if (!isNum(dailyTargetKcal) || dailyTargetKcal < MIN_DAILY_TARGET_KCAL || dailyTargetKcal > MAX_DAILY_TARGET_KCAL) {
    return {
      error: `Daily calorie target should be between ${MIN_DAILY_TARGET_KCAL} and ${MAX_DAILY_TARGET_KCAL} kcal.`,
    };
  }
  if (!isNum(breakfastSharePercent) || breakfastSharePercent <= 0 || breakfastSharePercent > 100) {
    return { error: "Breakfast share must be between 1% and 100% of the day." };
  }

  const lines = [];
  for (const selection of selections) {
    const item = getItem(selection && selection.id);
    if (!item) continue;
    const qty = selection.qty;
    if (!isNum(qty)) return { error: `Quantity for ${item.name} must be a number.` };
    if (qty < 0) return { error: `Quantity for ${item.name} cannot be negative.` };
    if (qty > MAX_QTY_PER_ITEM) {
      return { error: `${MAX_QTY_PER_ITEM} portions of ${item.name} is the most this tool totals.` };
    }
    if (qty === 0) continue;
    const energyKcal = itemEnergyKcal(item) * qty;
    lines.push({
      item,
      qty,
      energyKcal,
      proteinG: item.proteinG * qty,
      carbG: item.carbG * qty,
      fatG: item.fatG * qty,
      fibreG: item.fibreG * qty,
    });
  }

  if (lines.length === 0) {
    return { error: "Add at least one item to your plate." };
  }

  const totals = lines.reduce(
    (sum, line) => ({
      energyKcal: sum.energyKcal + line.energyKcal,
      proteinG: sum.proteinG + line.proteinG,
      carbG: sum.carbG + line.carbG,
      fatG: sum.fatG + line.fatG,
      fibreG: sum.fibreG + line.fibreG,
    }),
    { energyKcal: 0, proteinG: 0, carbG: 0, fatG: 0, fibreG: 0 },
  );

  const proteinKcal = totals.proteinG * KCAL_PER_G_PROTEIN;
  const carbKcal = totals.carbG * KCAL_PER_G_CARB;
  const fatKcal = totals.fatG * KCAL_PER_G_FAT;
  const friedKcal = lines
    .filter((line) => line.item.fried)
    .reduce((sum, line) => sum + line.energyKcal, 0);

  const breakfastBudgetKcal = (dailyTargetKcal * breakfastSharePercent) / 100;

  return {
    lines: lines.sort((a, b) => b.energyKcal - a.energyKcal),
    ...totals,
    proteinPercent: totals.energyKcal > 0 ? (proteinKcal / totals.energyKcal) * 100 : 0,
    carbPercent: totals.energyKcal > 0 ? (carbKcal / totals.energyKcal) * 100 : 0,
    fatPercent: totals.energyKcal > 0 ? (fatKcal / totals.energyKcal) * 100 : 0,
    friedKcal,
    friedPercent: totals.energyKcal > 0 ? (friedKcal / totals.energyKcal) * 100 : 0,
    itemCount: lines.reduce((sum, line) => sum + line.qty, 0),
    dailyTargetKcal,
    breakfastSharePercent,
    breakfastBudgetKcal,
    budgetUsedPercent: breakfastBudgetKcal > 0 ? (totals.energyKcal / breakfastBudgetKcal) * 100 : 0,
    overBudgetKcal: Math.max(0, totals.energyKcal - breakfastBudgetKcal),
    dailyPercent: (totals.energyKcal / dailyTargetKcal) * 100,
  };
}
