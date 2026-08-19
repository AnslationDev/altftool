/**
 * Indian street food calorie and macro reference.
 *
 * Every entry is a TYPICAL vendor portion, not a laboratory weight. Street food
 * is cooked to no fixed recipe, so oil absorbed during frying, butter added on
 * the tawa and chutney quantity all move the figure. Values are rounded to the
 * nearest 10 kcal and macros are set so that 4 kcal/g protein + 4 kcal/g carb +
 * 9 kcal/g fat (the Atwater factors) reconciles with the stated calories.
 * Treat every number as an estimate with a plus or minus 20% band.
 *
 * Energy conversion factors: Atwater general factors, used in Indian food
 * composition tables (IFCT) and on packaged-food labels.
 */

export const KCAL_PER_G_PROTEIN = 4;
export const KCAL_PER_G_CARB = 4;
export const KCAL_PER_G_FAT = 9;

/** Uncertainty band applied to every portion, as a fraction. */
export const ESTIMATE_BAND = 0.2;

/**
 * Brisk walking at about 5.6 km/h on level ground.
 * MET value from the Compendium of Physical Activities (walking, brisk pace).
 */
export const BRISK_WALK_METS = 4.3;
/** Standard MET-to-energy conversion: kcal/min = MET x 3.5 x kg / 200. */
export const MET_KCAL_CONSTANT = 3.5;
export const MET_KCAL_DIVISOR = 200;

export const DEFAULT_DAILY_KCAL = 2000;
export const MIN_DAILY_KCAL = 800;
export const MAX_DAILY_KCAL = 6000;
export const MIN_WEIGHT_KG = 20;
export const MAX_WEIGHT_KG = 300;
export const MAX_SERVINGS = 20;

/**
 * id, name, group, serving description, approximate weight, and macros in grams.
 */
export const STREET_FOODS = [
  { id: "pani-puri", name: "Pani puri / golgappa", group: "Chaat", serving: "6 pieces", grams: 90, kcal: 210, protein: 5, carbs: 33, fat: 6.4 },
  { id: "bhel-puri", name: "Bhel puri", group: "Chaat", serving: "1 plate", grams: 120, kcal: 250, protein: 6, carbs: 40, fat: 7.3 },
  { id: "sev-puri", name: "Sev puri", group: "Chaat", serving: "6 pieces", grams: 120, kcal: 300, protein: 6, carbs: 40, fat: 12.9 },
  { id: "dahi-puri", name: "Dahi puri", group: "Chaat", serving: "6 pieces", grams: 140, kcal: 280, protein: 8, carbs: 36, fat: 11.6 },
  { id: "papdi-chaat", name: "Papdi chaat", group: "Chaat", serving: "1 plate", grams: 180, kcal: 330, protein: 8, carbs: 42, fat: 14.4 },
  { id: "aloo-tikki-chaat", name: "Aloo tikki chaat", group: "Chaat", serving: "2 tikkis with chutney", grams: 180, kcal: 350, protein: 8, carbs: 45, fat: 15.3 },
  { id: "ragda-pattice", name: "Ragda pattice", group: "Chaat", serving: "1 plate", grams: 250, kcal: 380, protein: 11, carbs: 52, fat: 14.2 },
  { id: "corn-chaat", name: "Masala corn chaat", group: "Chaat", serving: "1 cup", grams: 150, kcal: 180, protein: 5, carbs: 30, fat: 4.4 },
  { id: "fruit-chaat", name: "Fruit chaat", group: "Chaat", serving: "1 cup", grams: 200, kcal: 120, protein: 1.5, carbs: 28, fat: 0.2 },
  { id: "jhal-muri", name: "Jhal muri", group: "Chaat", serving: "1 cup", grams: 100, kcal: 180, protein: 4, carbs: 30, fat: 4.9 },

  { id: "vada-pav", name: "Vada pav", group: "Pav and bread", serving: "1 piece", grams: 150, kcal: 290, protein: 7, carbs: 40, fat: 11.4 },
  { id: "pav-bhaji", name: "Pav bhaji", group: "Pav and bread", serving: "2 pav with bhaji", grams: 300, kcal: 500, protein: 11, carbs: 62, fat: 23 },
  { id: "misal-pav", name: "Misal pav", group: "Pav and bread", serving: "1 plate", grams: 300, kcal: 450, protein: 15, carbs: 56, fat: 18.4 },
  { id: "dabeli", name: "Dabeli", group: "Pav and bread", serving: "1 piece", grams: 130, kcal: 280, protein: 6, carbs: 38, fat: 11.6 },
  { id: "egg-bhurji-pav", name: "Egg bhurji with pav", group: "Pav and bread", serving: "1 plate", grams: 250, kcal: 400, protein: 18, carbs: 38, fat: 19.6 },
  { id: "bread-pakora", name: "Bread pakora", group: "Pav and bread", serving: "1 piece", grams: 100, kcal: 290, protein: 6, carbs: 32, fat: 15.3 },

  { id: "samosa", name: "Samosa", group: "Fried snacks", serving: "1 piece", grams: 60, kcal: 260, protein: 4, carbs: 30, fat: 13.8 },
  { id: "kachori", name: "Kachori", group: "Fried snacks", serving: "1 piece", grams: 60, kcal: 250, protein: 5, carbs: 26, fat: 14 },
  { id: "onion-pakora", name: "Onion pakora / bhaji", group: "Fried snacks", serving: "100 g", grams: 100, kcal: 320, protein: 7, carbs: 30, fat: 19.1 },
  { id: "medu-vada", name: "Medu vada", group: "Fried snacks", serving: "2 pieces with sambar", grams: 110, kcal: 300, protein: 8, carbs: 32, fat: 15.6 },
  { id: "jalebi", name: "Jalebi", group: "Fried snacks", serving: "2 pieces", grams: 50, kcal: 200, protein: 1, carbs: 35, fat: 6.2 },

  { id: "masala-dosa", name: "Masala dosa", group: "South Indian", serving: "1 with sambar and chutney", grams: 200, kcal: 390, protein: 8, carbs: 52, fat: 16.7 },
  { id: "idli-sambar", name: "Idli with sambar", group: "South Indian", serving: "2 idlis", grams: 200, kcal: 150, protein: 5, carbs: 28, fat: 2 },
  { id: "upma", name: "Upma", group: "South Indian", serving: "1 plate", grams: 180, kcal: 250, protein: 6, carbs: 38, fat: 8.2 },
  { id: "poha", name: "Poha", group: "South Indian", serving: "1 plate", grams: 180, kcal: 250, protein: 5, carbs: 40, fat: 7.8 },

  { id: "veg-roll", name: "Veg kathi roll", group: "Rolls and wraps", serving: "1 roll", grams: 180, kcal: 350, protein: 9, carbs: 44, fat: 15.3 },
  { id: "paneer-roll", name: "Paneer roll", group: "Rolls and wraps", serving: "1 roll", grams: 200, kcal: 400, protein: 15, carbs: 42, fat: 19.1 },
  { id: "chicken-roll", name: "Chicken kathi roll", group: "Rolls and wraps", serving: "1 roll", grams: 200, kcal: 420, protein: 22, carbs: 42, fat: 18.2 },
  { id: "veg-frankie", name: "Veg frankie", group: "Rolls and wraps", serving: "1 roll", grams: 170, kcal: 330, protein: 8, carbs: 42, fat: 14.4 },
  { id: "aloo-paratha", name: "Aloo paratha with curd", group: "Rolls and wraps", serving: "1 paratha", grams: 200, kcal: 380, protein: 9, carbs: 46, fat: 17.8 },

  { id: "veg-momo-steamed", name: "Steamed veg momos", group: "Momos and noodles", serving: "6 pieces", grams: 150, kcal: 250, protein: 7, carbs: 42, fat: 6 },
  { id: "chicken-momo-steamed", name: "Steamed chicken momos", group: "Momos and noodles", serving: "6 pieces", grams: 160, kcal: 290, protein: 14, carbs: 38, fat: 9.1 },
  { id: "fried-momo", name: "Fried momos", group: "Momos and noodles", serving: "6 pieces", grams: 160, kcal: 380, protein: 8, carbs: 44, fat: 19.1 },
  { id: "veg-chowmein", name: "Veg chowmein", group: "Momos and noodles", serving: "1 plate", grams: 250, kcal: 450, protein: 10, carbs: 68, fat: 15.3 },

  { id: "chole-bhature", name: "Chole bhature", group: "Full plates", serving: "2 bhature with chole", grams: 350, kcal: 800, protein: 20, carbs: 95, fat: 37.8 },
  { id: "chole-kulche", name: "Chole kulche", group: "Full plates", serving: "1 plate", grams: 280, kcal: 520, protein: 16, carbs: 72, fat: 18.7 },

  { id: "masala-chai", name: "Masala chai with sugar", group: "Drinks", serving: "1 cup, 150 ml", grams: 150, kcal: 90, protein: 2.5, carbs: 13, fat: 3.1 },
  { id: "sugarcane-juice", name: "Sugarcane juice", group: "Drinks", serving: "1 glass, 250 ml", grams: 250, kcal: 180, protein: 0, carbs: 45, fat: 0 },
  { id: "sweet-lassi", name: "Sweet lassi", group: "Drinks", serving: "1 glass, 250 ml", grams: 250, kcal: 260, protein: 7, carbs: 40, fat: 8 },
];

const toFinite = (value) => {
  const num = typeof value === "number" ? value : Number(String(value ?? "").trim());
  return Number.isFinite(num) ? num : NaN;
};

/** Look up one food by id. Returns undefined when the id is unknown. */
export function findFood(id) {
  return STREET_FOODS.find((food) => food.id === id);
}

/** Every distinct group name, in the order the list defines them. */
export function foodGroups() {
  const seen = [];
  STREET_FOODS.forEach((food) => {
    if (!seen.includes(food.group)) seen.push(food.group);
  });
  return seen;
}

/**
 * Total a plate of street food.
 *
 * @param {object} input
 * @param {Array<{id: string, servings: number|string}>} input.selections chosen items
 * @param {number|string} input.dailyKcal the eater's daily energy target
 * @param {number|string} input.weightKg body weight, used for the walking estimate
 * @returns {object} totals and per-item lines, or { error } when input is unusable
 */
export function summarisePlate({ selections = [], dailyKcal, weightKg }) {
  const daily = toFinite(dailyKcal);
  const weight = toFinite(weightKg);

  if (Number.isNaN(daily) || Number.isNaN(weight)) {
    return { error: "Enter a number for your daily calorie target and your weight." };
  }
  if (daily < MIN_DAILY_KCAL || daily > MAX_DAILY_KCAL) {
    return { error: `Daily calorie target must be between ${MIN_DAILY_KCAL} and ${MAX_DAILY_KCAL} kcal.` };
  }
  if (weight < MIN_WEIGHT_KG || weight > MAX_WEIGHT_KG) {
    return { error: `Body weight must be between ${MIN_WEIGHT_KG} and ${MAX_WEIGHT_KG} kg.` };
  }
  if (!Array.isArray(selections)) {
    return { error: "Could not read the selected items." };
  }

  const lines = [];
  let kcal = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;
  let grams = 0;

  for (const selection of selections) {
    const servings = toFinite(selection?.servings);
    if (Number.isNaN(servings)) {
      return { error: "Servings must be a number." };
    }
    if (servings < 0 || servings > MAX_SERVINGS) {
      return { error: `Servings for each item must be between 0 and ${MAX_SERVINGS}.` };
    }
    if (servings === 0) continue;
    const food = findFood(selection?.id);
    if (!food) {
      return { error: "One of the selected items is not in the list." };
    }
    const line = {
      id: food.id,
      name: food.name,
      serving: food.serving,
      servings,
      kcal: food.kcal * servings,
      protein: food.protein * servings,
      carbs: food.carbs * servings,
      fat: food.fat * servings,
      grams: food.grams * servings,
    };
    lines.push(line);
    kcal += line.kcal;
    protein += line.protein;
    carbs += line.carbs;
    fat += line.fat;
    grams += line.grams;
  }

  const kcalPerWalkMinute = (BRISK_WALK_METS * MET_KCAL_CONSTANT * weight) / MET_KCAL_DIVISOR;
  const totalEnergy = kcal > 0 ? kcal : 0;

  return {
    empty: lines.length === 0,
    lines,
    kcal,
    kcalLow: kcal * (1 - ESTIMATE_BAND),
    kcalHigh: kcal * (1 + ESTIMATE_BAND),
    protein,
    carbs,
    fat,
    grams,
    proteinPct: totalEnergy > 0 ? ((protein * KCAL_PER_G_PROTEIN) / totalEnergy) * 100 : 0,
    carbPct: totalEnergy > 0 ? ((carbs * KCAL_PER_G_CARB) / totalEnergy) * 100 : 0,
    fatPct: totalEnergy > 0 ? ((fat * KCAL_PER_G_FAT) / totalEnergy) * 100 : 0,
    dailyKcal: daily,
    shareOfDayPct: (kcal / daily) * 100,
    remainingKcal: daily - kcal,
    weightKg: weight,
    kcalPerWalkMinute,
    briskWalkMinutes: kcalPerWalkMinute > 0 ? kcal / kcalPerWalkMinute : 0,
  };
}
