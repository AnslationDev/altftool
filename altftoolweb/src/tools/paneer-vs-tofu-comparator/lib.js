/**
 * Paneer vs tofu nutrition comparison.
 *
 * Per-100 g values are typical composition figures: paneer from Indian food
 * composition data for whole-milk and toned-milk paneer, tofu from USDA
 * FoodData Central entries for firm tofu prepared with calcium sulfate and for
 * silken tofu. Brands vary, and a tofu that is NOT calcium-set carries far less
 * calcium, so always check the pack.
 *
 * Reference intakes used for the percentage columns:
 *  - Protein: 0.83 g per kg body weight per day, the adult safe intake used by
 *    WHO/FAO/UNU and by ICMR-NIN in the 2020 Indian RDA tables.
 *  - Calcium: 1,000 mg per day for adults (ICMR-NIN 2020 RDA).
 *  - Iron: 19 mg per day for adult men, 29 mg per day for adult women
 *    (ICMR-NIN 2020 RDA), selectable below.
 */

export const PROTEIN_G_PER_KG = 0.83;
export const CALCIUM_RDA_MG = 1000;
export const IRON_RDA_MG = { male: 19, female: 29 };

export const MIN_PORTION_G = 1;
export const MAX_PORTION_G = 1000;
export const MIN_WEIGHT_KG = 20;
export const MAX_WEIGHT_KG = 300;

/** Nutrients per 100 g of edible portion. */
export const FOODS = [
  {
    id: "paneer-full",
    name: "Paneer (whole milk)",
    family: "Paneer",
    kcal: 296,
    protein: 18.3,
    fat: 22.8,
    saturatedFat: 14.5,
    carbs: 3.6,
    fibre: 0,
    calcium: 208,
    iron: 0.2,
    sodium: 18,
    cholesterol: 65,
  },
  {
    id: "paneer-low",
    name: "Paneer (toned / low-fat milk)",
    family: "Paneer",
    kcal: 156,
    protein: 20,
    fat: 6.5,
    saturatedFat: 4.1,
    carbs: 4.5,
    fibre: 0,
    calcium: 190,
    iron: 0.2,
    sodium: 20,
    cholesterol: 20,
  },
  {
    id: "tofu-firm",
    name: "Tofu, firm (calcium-set)",
    family: "Tofu",
    kcal: 144,
    protein: 17.3,
    fat: 8.7,
    saturatedFat: 1.3,
    carbs: 2.8,
    fibre: 2.3,
    calcium: 683,
    iron: 2.7,
    sodium: 14,
    cholesterol: 0,
  },
  {
    id: "tofu-extra-firm",
    name: "Tofu, extra firm",
    family: "Tofu",
    kcal: 150,
    protein: 19,
    fat: 8.5,
    saturatedFat: 1.2,
    carbs: 3.5,
    fibre: 2,
    calcium: 350,
    iron: 2.5,
    sodium: 15,
    cholesterol: 0,
  },
  {
    id: "tofu-silken",
    name: "Tofu, silken / soft",
    family: "Tofu",
    kcal: 55,
    protein: 4.8,
    fat: 2.7,
    saturatedFat: 0.4,
    carbs: 2,
    fibre: 0.2,
    calcium: 24,
    iron: 0.8,
    sodium: 8,
    cholesterol: 0,
  },
];

/** Nutrients scaled by portion, in the order shown in the comparison table. */
export const NUTRIENT_ROWS = [
  { key: "kcal", label: "Energy", unit: "kcal", lowerIsBetter: null },
  { key: "protein", label: "Protein", unit: "g", lowerIsBetter: false },
  { key: "fat", label: "Total fat", unit: "g", lowerIsBetter: true },
  { key: "saturatedFat", label: "Saturated fat", unit: "g", lowerIsBetter: true },
  { key: "carbs", label: "Carbohydrate", unit: "g", lowerIsBetter: null },
  { key: "fibre", label: "Fibre", unit: "g", lowerIsBetter: false },
  { key: "calcium", label: "Calcium", unit: "mg", lowerIsBetter: false },
  { key: "iron", label: "Iron", unit: "mg", lowerIsBetter: false },
  { key: "sodium", label: "Sodium", unit: "mg", lowerIsBetter: true },
  { key: "cholesterol", label: "Cholesterol", unit: "mg", lowerIsBetter: true },
];

const toFinite = (value) => {
  const num = typeof value === "number" ? value : Number(String(value ?? "").trim());
  return Number.isFinite(num) ? num : NaN;
};

/** Look up a food by id. */
export function findFood(id) {
  return FOODS.find((food) => food.id === id);
}

/** Scale a per-100 g food to a portion, returning the nutrient values. */
export function scaleFood(food, grams) {
  const factor = grams / 100;
  const scaled = { id: food.id, name: food.name, family: food.family, grams };
  NUTRIENT_ROWS.forEach(({ key }) => {
    scaled[key] = food[key] * factor;
  });
  scaled.kcalPerGramProtein = scaled.protein > 0 ? scaled.kcal / scaled.protein : null;
  return scaled;
}

/**
 * Compare two foods at a chosen portion.
 *
 * @param {object} input
 * @param {string} input.leftId first food id
 * @param {string} input.rightId second food id
 * @param {number|string} input.grams portion size applied to both
 * @param {number|string} input.weightKg body weight, for the protein reference
 * @param {"male"|"female"} input.ironReference which iron RDA to compare against
 * @returns {object} comparison, or { error } when the input is unusable
 */
export function compareFoods({ leftId, rightId, grams, weightKg, ironReference = "female" }) {
  const portion = toFinite(grams);
  const weight = toFinite(weightKg);

  if (Number.isNaN(portion) || Number.isNaN(weight)) {
    return { error: "Enter a number for the portion size and your body weight." };
  }
  if (portion < MIN_PORTION_G || portion > MAX_PORTION_G) {
    return { error: `Portion must be between ${MIN_PORTION_G} and ${MAX_PORTION_G} grams.` };
  }
  if (weight < MIN_WEIGHT_KG || weight > MAX_WEIGHT_KG) {
    return { error: `Body weight must be between ${MIN_WEIGHT_KG} and ${MAX_WEIGHT_KG} kg.` };
  }
  if (ironReference !== "male" && ironReference !== "female") {
    return { error: "Choose an iron reference of adult male or adult female." };
  }

  const leftFood = findFood(leftId);
  const rightFood = findFood(rightId);
  if (!leftFood || !rightFood) {
    return { error: "Pick two foods from the list." };
  }
  if (leftId === rightId) {
    return { error: "Pick two different foods to compare." };
  }

  const left = scaleFood(leftFood, portion);
  const right = scaleFood(rightFood, portion);

  const proteinTarget = weight * PROTEIN_G_PER_KG;
  const ironTarget = IRON_RDA_MG[ironReference];

  const withShares = (side) => ({
    ...side,
    proteinPctOfTarget: (side.protein / proteinTarget) * 100,
    calciumPctOfRda: (side.calcium / CALCIUM_RDA_MG) * 100,
    ironPctOfRda: (side.iron / ironTarget) * 100,
  });

  // How much of the other food delivers the same protein as this portion.
  const gramsForSameProtein = (source, target) =>
    target.protein > 0 ? (source.protein / (target.protein / target.grams)) : null;

  const rightGramsMatchingLeftProtein = gramsForSameProtein(left, right);
  const leftGramsMatchingRightProtein = gramsForSameProtein(right, left);

  const rows = NUTRIENT_ROWS.map((row) => ({
    ...row,
    leftValue: left[row.key],
    rightValue: right[row.key],
    difference: left[row.key] - right[row.key],
  }));

  return {
    portionGrams: portion,
    weightKg: weight,
    proteinTarget,
    calciumTarget: CALCIUM_RDA_MG,
    ironTarget,
    ironReference,
    left: withShares(left),
    right: withShares(right),
    rows,
    kcalDifference: left.kcal - right.kcal,
    proteinDifference: left.protein - right.protein,
    calciumDifference: left.calcium - right.calcium,
    rightGramsMatchingLeftProtein,
    rightKcalMatchingLeftProtein:
      rightGramsMatchingLeftProtein === null
        ? null
        : (rightFood.kcal * rightGramsMatchingLeftProtein) / 100,
    leftGramsMatchingRightProtein,
    leftKcalMatchingRightProtein:
      leftGramsMatchingRightProtein === null
        ? null
        : (leftFood.kcal * leftGramsMatchingRightProtein) / 100,
  };
}
