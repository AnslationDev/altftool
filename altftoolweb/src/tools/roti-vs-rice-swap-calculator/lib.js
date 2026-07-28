/**
 * Roti <-> rice portion swapping.
 *
 * Everything is calculated from the *dry* ingredient, which is the only weight
 * you can measure reliably: atta for a roti, raw rice for a serving of cooked
 * rice. Cooked weights follow from a water-absorption factor.
 *
 * Composition values are the typical figures for Indian staples published in
 * the National Institute of Nutrition food composition tables, per 100 g of the
 * raw ingredient. Real grains vary by variety, milling and region, so treat the
 * output as a planning estimate.
 */

/** Per 100 g of whole wheat flour (atta), raw. */
export const ATTA_PER_100G = {
  energyKcal: 341,
  proteinG: 12.1,
  carbG: 69.4,
  fatG: 1.7,
  fibreG: 11.2,
};

/** Per 100 g of raw milled (polished) white rice. */
export const RICE_PER_100G = {
  energyKcal: 345,
  proteinG: 6.8,
  carbG: 78.2,
  fatG: 0.5,
  fibreG: 0.2,
};

/** Per 100 g of ghee. */
export const GHEE_PER_100G = { energyKcal: 900, proteinG: 0, carbG: 0, fatG: 100, fibreG: 0 };

/** Raw rice roughly triples in weight when boiled Indian style. */
export const RICE_COOKED_FACTOR = 2.7;
/** Atta gains water in the dough and loses some on the tawa. */
export const ROTI_COOKED_FACTOR = 1.35;

/** A standard Indian katori serving of cooked rice, in grams. */
export const KATORI_COOKED_RICE_G = 150;
/** ICMR-NIN describes a chapati as made from about 30 g of atta. */
export const DEFAULT_ATTA_PER_ROTI_G = 30;
/** One level teaspoon of ghee. */
export const TSP_GHEE_G = 5;

export const MAX_ATTA_PER_ROTI_G = 200;
export const MAX_ROTIS = 30;
export const MAX_KATORIS = 20;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

const scale = (per100, grams) => ({
  grams,
  energyKcal: (per100.energyKcal * grams) / 100,
  proteinG: (per100.proteinG * grams) / 100,
  carbG: (per100.carbG * grams) / 100,
  fatG: (per100.fatG * grams) / 100,
  fibreG: (per100.fibreG * grams) / 100,
});

const addNutrition = (a, b) => ({
  energyKcal: a.energyKcal + b.energyKcal,
  proteinG: a.proteinG + b.proteinG,
  carbG: a.carbG + b.carbG,
  fatG: a.fatG + b.fatG,
  fibreG: a.fibreG + b.fibreG,
});

/**
 * Nutrition for a plate of rotis.
 *
 * @param {object} input
 * @param {number} input.rotis
 * @param {number} [input.attaPerRotiG]
 * @param {number} [input.gheePerRotiG]
 * @returns {object} result or { error }
 */
export function rotiNutrition({ rotis, attaPerRotiG = DEFAULT_ATTA_PER_ROTI_G, gheePerRotiG = 0 } = {}) {
  if (!isNum(rotis) || !isNum(attaPerRotiG) || !isNum(gheePerRotiG)) {
    return { error: "Roti count, atta per roti and ghee must all be numbers." };
  }
  if (rotis <= 0) return { error: "Enter at least one roti." };
  if (rotis > MAX_ROTIS) return { error: `More than ${MAX_ROTIS} rotis is beyond this calculator.` };
  if (attaPerRotiG <= 0) return { error: "Atta per roti must be greater than zero grams." };
  if (attaPerRotiG > MAX_ATTA_PER_ROTI_G) {
    return { error: `${MAX_ATTA_PER_ROTI_G} g of atta in one roti is a paratha, not a roti.` };
  }
  if (gheePerRotiG < 0) return { error: "Ghee cannot be negative." };
  if (gheePerRotiG > 20) return { error: "More than 20 g of ghee on one roti is outside this estimate." };

  const attaG = rotis * attaPerRotiG;
  const gheeG = rotis * gheePerRotiG;
  const base = scale(ATTA_PER_100G, attaG);
  const ghee = scale(GHEE_PER_100G, gheeG);
  const totals = addNutrition(base, ghee);

  return {
    rotis,
    attaG,
    gheeG,
    cookedWeightG: attaG * ROTI_COOKED_FACTOR,
    ...totals,
    perRotiKcal: totals.energyKcal / rotis,
  };
}

/**
 * Nutrition for a serving of cooked rice.
 *
 * @param {object} input
 * @param {number} [input.katoris]      Servings, using gramsPerKatori.
 * @param {number} [input.cookedGrams]  Or give the cooked weight directly.
 * @param {number} [input.gramsPerKatori]
 * @returns {object} result or { error }
 */
export function riceNutrition({
  katoris,
  cookedGrams,
  gramsPerKatori = KATORI_COOKED_RICE_G,
} = {}) {
  if (!isNum(gramsPerKatori) || gramsPerKatori <= 0) {
    return { error: "Katori size must be greater than zero grams." };
  }
  let cooked = cookedGrams;
  if (!isNum(cooked)) {
    if (!isNum(katoris)) return { error: "Give either a katori count or a cooked rice weight." };
    if (katoris <= 0) return { error: "Enter at least a part of a katori." };
    if (katoris > MAX_KATORIS) return { error: `More than ${MAX_KATORIS} katoris is beyond this calculator.` };
    cooked = katoris * gramsPerKatori;
  }
  if (cooked <= 0) return { error: "Cooked rice weight must be greater than zero." };
  if (cooked > 5000) return { error: "That is more than 5 kg of cooked rice — check the number." };

  const rawG = cooked / RICE_COOKED_FACTOR;
  const totals = scale(RICE_PER_100G, rawG);

  return {
    cookedG: cooked,
    rawG,
    katoris: cooked / gramsPerKatori,
    gramsPerKatori,
    ...totals,
  };
}

/**
 * Swap rotis for the rice portion that matches on calories (or on carbs).
 *
 * @param {object} input
 * @param {number} input.rotis
 * @param {number} [input.attaPerRotiG]
 * @param {number} [input.gheePerRotiG]
 * @param {number} [input.gramsPerKatori]
 * @param {"calories"|"carbs"} [input.matchOn]
 * @returns {object} result or { error }
 */
export function rotiToRice({
  rotis,
  attaPerRotiG = DEFAULT_ATTA_PER_ROTI_G,
  gheePerRotiG = 0,
  gramsPerKatori = KATORI_COOKED_RICE_G,
  matchOn = "calories",
} = {}) {
  const roti = rotiNutrition({ rotis, attaPerRotiG, gheePerRotiG });
  if (roti.error) return { error: roti.error };
  if (matchOn !== "calories" && matchOn !== "carbs") {
    return { error: "Match the swap on calories or on carbohydrate." };
  }
  if (!isNum(gramsPerKatori) || gramsPerKatori <= 0) {
    return { error: "Katori size must be greater than zero grams." };
  }

  // Per gram of cooked rice, from the raw composition and the cooking factor.
  const perCookedGram = {
    energyKcal: RICE_PER_100G.energyKcal / 100 / RICE_COOKED_FACTOR,
    carbG: RICE_PER_100G.carbG / 100 / RICE_COOKED_FACTOR,
  };
  const target = matchOn === "calories" ? roti.energyKcal : roti.carbG;
  const divisor = matchOn === "calories" ? perCookedGram.energyKcal : perCookedGram.carbG;
  if (!(divisor > 0)) return { error: "Rice composition is missing that nutrient." };

  const cookedGrams = target / divisor;
  const rice = riceNutrition({ cookedGrams, gramsPerKatori });
  if (rice.error) return { error: rice.error };

  return {
    matchOn,
    roti,
    rice,
    proteinDifferenceG: roti.proteinG - rice.proteinG,
    fibreDifferenceG: roti.fibreG - rice.fibreG,
    energyDifferenceKcal: roti.energyKcal - rice.energyKcal,
  };
}

/**
 * Swap a rice serving for the number of rotis that matches on calories (or carbs).
 *
 * @param {object} input
 * @param {number} [input.katoris]
 * @param {number} [input.cookedGrams]
 * @param {number} [input.gramsPerKatori]
 * @param {number} [input.attaPerRotiG]
 * @param {number} [input.gheePerRotiG]
 * @param {"calories"|"carbs"} [input.matchOn]
 * @returns {object} result or { error }
 */
export function riceToRoti({
  katoris,
  cookedGrams,
  gramsPerKatori = KATORI_COOKED_RICE_G,
  attaPerRotiG = DEFAULT_ATTA_PER_ROTI_G,
  gheePerRotiG = 0,
  matchOn = "calories",
} = {}) {
  const rice = riceNutrition({ katoris, cookedGrams, gramsPerKatori });
  if (rice.error) return { error: rice.error };
  if (matchOn !== "calories" && matchOn !== "carbs") {
    return { error: "Match the swap on calories or on carbohydrate." };
  }
  if (!isNum(attaPerRotiG) || attaPerRotiG <= 0) {
    return { error: "Atta per roti must be greater than zero grams." };
  }
  if (!isNum(gheePerRotiG) || gheePerRotiG < 0) {
    return { error: "Ghee cannot be negative." };
  }

  const perRoti = {
    energyKcal:
      (ATTA_PER_100G.energyKcal * attaPerRotiG) / 100 + (GHEE_PER_100G.energyKcal * gheePerRotiG) / 100,
    carbG: (ATTA_PER_100G.carbG * attaPerRotiG) / 100,
  };
  const target = matchOn === "calories" ? rice.energyKcal : rice.carbG;
  const divisor = matchOn === "calories" ? perRoti.energyKcal : perRoti.carbG;
  if (!(divisor > 0)) return { error: "Roti composition is missing that nutrient." };

  const rotis = target / divisor;
  const roti = rotiNutrition({ rotis, attaPerRotiG, gheePerRotiG });
  if (roti.error) return { error: roti.error };

  return {
    matchOn,
    rice,
    roti,
    rotisNeeded: rotis,
    proteinDifferenceG: roti.proteinG - rice.proteinG,
    fibreDifferenceG: roti.fibreG - rice.fibreG,
  };
}
