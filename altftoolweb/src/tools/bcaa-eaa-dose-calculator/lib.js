/**
 * BCAA / EAA dose calculator — pure logic.
 *
 * Two independent rules are used, and they answer different questions:
 *
 * 1. Daily indispensable amino acid requirements come from the WHO/FAO/UNU
 *    2007 expert consultation on protein and amino acid requirements for
 *    healthy adults, expressed in mg per kg bodyweight per day. These are
 *    survival/health requirements, not performance doses.
 *
 * 2. The per-serving dose is driven by the leucine trigger: roughly 2.5-3 g of
 *    leucine in one feeding is the amount commonly associated with a maximal
 *    muscle protein synthesis response in adults. The grams of product needed
 *    is simply the leucine target divided by the leucine content of that
 *    product.
 *
 * Note carried through the output: BCAAs supply only 3 of the 9 indispensable
 * amino acids, so the other six become limiting and the MPS response to BCAAs
 * alone is smaller than to a complete EAA or whole-protein dose.
 */

/**
 * WHO/FAO/UNU 2007 adult indispensable amino acid requirements,
 * milligrams per kg bodyweight per day.
 */
export const WHO_IAA_MG_PER_KG = [
  { id: "histidine", label: "Histidine", mgPerKg: 10 },
  { id: "isoleucine", label: "Isoleucine", mgPerKg: 20 },
  { id: "leucine", label: "Leucine", mgPerKg: 39 },
  { id: "lysine", label: "Lysine", mgPerKg: 30 },
  { id: "saa", label: "Methionine + cysteine", mgPerKg: 15 },
  { id: "aaa", label: "Phenylalanine + tyrosine", mgPerKg: 25 },
  { id: "threonine", label: "Threonine", mgPerKg: 15 },
  { id: "tryptophan", label: "Tryptophan", mgPerKg: 4 },
  { id: "valine", label: "Valine", mgPerKg: 26 },
];

/** Sum of the WHO/FAO adult requirements above, mg per kg per day. */
export const WHO_TOTAL_IAA_MG_PER_KG = WHO_IAA_MG_PER_KG.reduce(
  (sum, row) => sum + row.mgPerKg,
  0,
);

/** Leucine per feeding associated with a maximal MPS response, grams. */
export const LEUCINE_TRIGGER_MIN_G = 2.5;
export const LEUCINE_TRIGGER_MAX_G = 3;
export const LEUCINE_TARGET_DEFAULT_G = 2.5;
/** Sanity band for a user-entered leucine target. */
export const LEUCINE_TARGET_FLOOR_G = 1;
export const LEUCINE_TARGET_CEILING_G = 6;

/** EAA per serving commonly cited as sufficient to maximise MPS, grams. */
export const EAA_PER_DOSE_MIN_G = 10;
export const EAA_PER_DOSE_MAX_G = 15;

/**
 * Products, described by how much leucine and how much total EAA a gram of the
 * product contains. For a BCAA blend at ratio r:1:1 the leucine share is
 * r / (r + 2), because the other two branched-chain aminos carry 1 part each.
 */
export const PRODUCTS = [
  {
    id: "bcaa-2-1-1",
    label: "BCAA 2:1:1",
    leucinePerGram: 2 / 4,
    eaaPerGram: 1,
    completeSpectrum: false,
    note: "The classic ratio. Half the powder is leucine.",
  },
  {
    id: "bcaa-4-1-1",
    label: "BCAA 4:1:1",
    leucinePerGram: 4 / 6,
    eaaPerGram: 1,
    completeSpectrum: false,
    note: "More leucine per scoop, less isoleucine and valine.",
  },
  {
    id: "bcaa-8-1-1",
    label: "BCAA 8:1:1",
    leucinePerGram: 8 / 10,
    eaaPerGram: 1,
    completeSpectrum: false,
    note: "Almost pure leucine; very little isoleucine or valine.",
  },
  {
    id: "eaa-blend",
    label: "EAA blend (all 9)",
    leucinePerGram: 0.25,
    eaaPerGram: 1,
    completeSpectrum: true,
    note: "Typical EAA supplements are about 25% leucine by weight.",
  },
  {
    id: "whey",
    label: "Whey protein powder",
    // 80 g protein per 100 g powder, leucine about 10.5% of whey protein.
    leucinePerGram: 0.8 * 0.105,
    // Whey protein is roughly 45% indispensable amino acids.
    eaaPerGram: 0.8 * 0.45,
    completeSpectrum: true,
    note: "80% protein powder; whey protein is around 10.5% leucine.",
  },
  {
    id: "casein",
    label: "Casein / milk protein powder",
    // 78 g protein per 100 g powder, leucine about 9.3% of casein protein.
    leucinePerGram: 0.78 * 0.093,
    eaaPerGram: 0.78 * 0.42,
    completeSpectrum: true,
    note: "Slower digesting; slightly less leucine-dense than whey.",
  },
  {
    id: "soy",
    label: "Soy protein isolate",
    // 88 g protein per 100 g isolate, leucine about 8.0% of soy protein.
    leucinePerGram: 0.88 * 0.08,
    eaaPerGram: 0.88 * 0.4,
    completeSpectrum: true,
    note: "Plant option with a complete but less leucine-rich profile.",
  },
];

/**
 * Leucine and protein content of common foods, grams per 100 g as eaten.
 * Values follow standard food-composition tables.
 */
export const FOOD_LEUCINE = [
  { id: "whey", label: "Whey protein powder", leucinePer100: 8.4, proteinPer100: 80 },
  { id: "beef", label: "Lean beef, cooked", leucinePer100: 2.4, proteinPer100: 30 },
  { id: "chicken", label: "Chicken breast, cooked", leucinePer100: 2.3, proteinPer100: 31 },
  { id: "salmon", label: "Salmon, cooked", leucinePer100: 2.0, proteinPer100: 25 },
  { id: "tofu", label: "Firm tofu", leucinePer100: 1.3, proteinPer100: 17 },
  { id: "cottage", label: "Cottage cheese", leucinePer100: 1.1, proteinPer100: 11 },
  { id: "egg", label: "Whole eggs, cooked", leucinePer100: 1.09, proteinPer100: 12.6 },
  { id: "yoghurt", label: "Greek yoghurt, non-fat", leucinePer100: 0.96, proteinPer100: 10 },
  { id: "lentils", label: "Lentils, cooked", leucinePer100: 0.65, proteinPer100: 9 },
  { id: "milk", label: "Whole milk", leucinePer100: 0.32, proteinPer100: 3.4 },
];

const round1 = (value) => Math.round(value * 10) / 10;
const round2 = (value) => Math.round(value * 100) / 100;

/**
 * @param {object} input
 * @param {number} input.bodyWeightKg
 * @param {string} input.productId - a PRODUCTS id
 * @param {number} input.leucineTargetG - leucine wanted per serving
 * @param {number} input.dosesPerDay
 * @returns {object|{error: string}}
 */
export function computeAminoDose({
  bodyWeightKg,
  productId,
  leucineTargetG = LEUCINE_TARGET_DEFAULT_G,
  dosesPerDay = 1,
}) {
  const weight = Number(bodyWeightKg);
  if (!Number.isFinite(weight)) return { error: "Enter your bodyweight in kilograms." };
  if (weight < 25 || weight > 250) {
    return { error: "Bodyweight should be between 25 kg and 250 kg." };
  }

  const product = PRODUCTS.find((item) => item.id === productId);
  if (!product) return { error: "Pick the supplement you are using." };

  const leucine = Number(leucineTargetG);
  if (!Number.isFinite(leucine)) return { error: "Enter a leucine target in grams." };
  if (leucine < LEUCINE_TARGET_FLOOR_G || leucine > LEUCINE_TARGET_CEILING_G) {
    return {
      error: `Leucine target should be between ${LEUCINE_TARGET_FLOOR_G} g and ${LEUCINE_TARGET_CEILING_G} g per serving.`,
    };
  }

  const doses = Number(dosesPerDay);
  if (!Number.isFinite(doses) || Math.floor(doses) !== doses || doses < 1 || doses > 6) {
    return { error: "Servings per day should be a whole number from 1 to 6." };
  }

  if (!(product.leucinePerGram > 0)) {
    return { error: "That product has no leucine content on record." };
  }

  const doseG = round1(leucine / product.leucinePerGram);
  const eaaDeliveredG = round1(doseG * product.eaaPerGram);
  const dailyProductG = round1(doseG * doses);
  const dailyLeucineFromDosesG = round1(leucine * doses);

  // WHO/FAO daily requirements for this bodyweight.
  const requirements = WHO_IAA_MG_PER_KG.map((row) => ({
    id: row.id,
    label: row.label,
    mgPerKg: row.mgPerKg,
    dailyMg: Math.round(row.mgPerKg * weight),
    dailyG: round2((row.mgPerKg * weight) / 1000),
  }));
  const totalDailyIaaG = round1((WHO_TOTAL_IAA_MG_PER_KG * weight) / 1000);
  const dailyLeucineRequirementG = round2(
    (WHO_IAA_MG_PER_KG.find((row) => row.id === "leucine").mgPerKg * weight) / 1000,
  );
  const leucineRequirementCoverPct = Math.round(
    (dailyLeucineFromDosesG / dailyLeucineRequirementG) * 100,
  );

  const meetsLeucineTrigger = leucine >= LEUCINE_TRIGGER_MIN_G;
  const meetsEaaDose = product.completeSpectrum && eaaDeliveredG >= EAA_PER_DOSE_MIN_G;

  let verdict;
  if (!product.completeSpectrum) {
    verdict =
      "This dose hits the leucine trigger, but BCAAs supply only 3 of the 9 indispensable amino acids. Without the other six the muscle protein synthesis response is smaller than from a complete EAA blend or whole protein.";
  } else if (meetsEaaDose && meetsLeucineTrigger) {
    verdict = `This dose delivers ${eaaDeliveredG} g of indispensable amino acids and ${leucine} g of leucine, which clears both the ${EAA_PER_DOSE_MIN_G} g EAA and ${LEUCINE_TRIGGER_MIN_G} g leucine marks used in the research.`;
  } else if (meetsLeucineTrigger) {
    verdict = `The leucine trigger is met, but total indispensable amino acids come to ${eaaDeliveredG} g — below the ${EAA_PER_DOSE_MIN_G}-${EAA_PER_DOSE_MAX_G} g per serving usually used to maximise the response.`;
  } else {
    verdict = `At ${leucine} g of leucine this serving sits below the ${LEUCINE_TRIGGER_MIN_G} g commonly cited as the trigger for a maximal response.`;
  }

  const foodEquivalents = FOOD_LEUCINE.map((food) => {
    const grams = (leucine / food.leucinePer100) * 100;
    return {
      id: food.id,
      label: food.label,
      grams: Math.round(grams / 5) * 5,
      proteinG: round1((grams * food.proteinPer100) / 100),
    };
  });

  return {
    weight,
    productLabel: product.label,
    productNote: product.note,
    completeSpectrum: product.completeSpectrum,
    leucineTargetG: round2(leucine),
    leucinePerGram: round2(product.leucinePerGram),
    doseG,
    dosesPerDay: doses,
    dailyProductG,
    dailyLeucineFromDosesG,
    eaaDeliveredG,
    meetsLeucineTrigger,
    meetsEaaDose,
    verdict,
    requirements,
    totalDailyIaaG,
    dailyLeucineRequirementG,
    leucineRequirementCoverPct,
    foodEquivalents,
  };
}
