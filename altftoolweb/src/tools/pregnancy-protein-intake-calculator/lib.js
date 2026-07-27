/**
 * Pregnancy protein intake calculator.
 *
 * Protein reference values
 * ------------------------
 * Institute of Medicine, Dietary Reference Intakes for Energy, Carbohydrate,
 * Fibre, Fat, Fatty Acids, Cholesterol, Protein and Amino Acids (2005):
 *
 *   non-pregnant adult woman   EAR 0.66 g/kg/day   RDA 0.80 g/kg/day
 *   pregnancy                  EAR 0.88 g/kg/day   RDA 1.10 g/kg/day
 *   lactation                  EAR 1.05 g/kg/day   RDA 1.30 g/kg/day
 *
 * The same report also expresses the pregnancy and lactation increase as an
 * extra 25 g/day above the non-pregnant requirement. The two forms do not give
 * an identical answer for every body size, because the +25 g figure was derived
 * for a reference woman, so this tool computes BOTH and reports the higher one
 * along with which basis produced it.
 *
 * The additional protein applies to the SECOND and THIRD trimesters. The IOM did
 * not add protein for the first trimester, when the amount of new tissue being
 * deposited is very small.
 *
 * Basis weight
 * ------------
 * Pre-pregnancy weight, as used throughout the DRI and gestational weight-gain
 * literature, not current weight.
 *
 * Additional energy (IOM 2005)
 * ----------------------------
 *   first trimester    no increase
 *   second trimester   +340 kcal/day
 *   third trimester    +452 kcal/day
 *   lactation, 0-6 months   +330 kcal/day
 *   lactation, 6-12 months  +400 kcal/day
 *
 * Gestational weight gain
 * -----------------------
 * Institute of Medicine / National Academies, Weight Gain During Pregnancy:
 * Reexamining the Guidelines (2009), by pre-pregnancy BMI. The twin ranges in
 * that report are explicitly provisional, and no range was issued for
 * underweight women carrying twins.
 *
 * Informational only. This is not medical advice - pregnancy nutrition should be
 * agreed with your obstetrician, midwife or a registered dietitian.
 */

/** Non-pregnant adult woman protein RDA, g per kg per day (IOM 2005). */
export const BASELINE_RDA_G_PER_KG = 0.8;

/** The IOM's alternative expression of the pregnancy/lactation increase, g/day. */
export const ADDITIVE_INCREASE_G = 25;

/** Stages, with their protein reference values and additional energy. */
export const STAGES = {
  trimester1: {
    label: "First trimester (weeks 1-13)",
    rdaPerKg: BASELINE_RDA_G_PER_KG,
    earPerKg: 0.66,
    additiveG: 0,
    extraKcal: 0,
    note: "The IOM adds no extra protein in the first trimester; the non-pregnant 0.8 g/kg RDA still applies.",
    pregnant: true,
  },
  trimester2: {
    label: "Second trimester (weeks 14-27)",
    rdaPerKg: 1.1,
    earPerKg: 0.88,
    additiveG: ADDITIVE_INCREASE_G,
    extraKcal: 340,
    note: "From the second trimester the protein RDA rises to 1.1 g/kg/day, with about 340 extra kcal a day.",
    pregnant: true,
  },
  trimester3: {
    label: "Third trimester (week 28 to birth)",
    rdaPerKg: 1.1,
    earPerKg: 0.88,
    additiveG: ADDITIVE_INCREASE_G,
    extraKcal: 452,
    note: "Third-trimester protein stays at 1.1 g/kg/day while energy needs rise to about 452 extra kcal a day.",
    pregnant: true,
  },
  lactation1: {
    label: "Breastfeeding, first 6 months",
    rdaPerKg: 1.3,
    earPerKg: 1.05,
    additiveG: ADDITIVE_INCREASE_G,
    extraKcal: 330,
    note: "Milk production raises the protein RDA to 1.3 g/kg/day, the highest of any adult life stage.",
    pregnant: false,
  },
  lactation2: {
    label: "Breastfeeding, 6-12 months",
    rdaPerKg: 1.3,
    earPerKg: 1.05,
    additiveG: ADDITIVE_INCREASE_G,
    extraKcal: 400,
    note: "Protein stays at 1.3 g/kg/day through the second six months of breastfeeding.",
    pregnant: false,
  },
};

/**
 * Pre-pregnancy BMI categories with IOM 2009 total gestational weight-gain
 * ranges in kilograms. twinKg is null where the IOM issued no recommendation.
 */
export const BMI_CATEGORIES = [
  { label: "Underweight", minBmi: 0, maxBmi: 18.5, singletonKg: [12.5, 18], twinKg: null },
  { label: "Normal weight", minBmi: 18.5, maxBmi: 25, singletonKg: [11.5, 16], twinKg: [17, 25] },
  { label: "Overweight", minBmi: 25, maxBmi: 30, singletonKg: [7, 11.5], twinKg: [14, 23] },
  { label: "Obese", minBmi: 30, maxBmi: Infinity, singletonKg: [5, 9], twinKg: [11, 19] },
];

/** Atwater energy factor for protein, kcal per gram. */
export const KCAL_PER_GRAM_PROTEIN = 4;

export const LIMITS = {
  weightKg: { min: 35, max: 200 },
  heightCm: { min: 130, max: 210 },
  mealsPerDay: { min: 3, max: 6 },
};

/** Body mass index in kg/m^2, or null when the inputs cannot produce one. */
export function bodyMassIndex(weightKg, heightCm) {
  if (!(weightKg > 0) || !(heightCm > 0)) return null;
  const metres = heightCm / 100;
  return weightKg / (metres * metres);
}

/** The IOM 2009 BMI category for a pre-pregnancy BMI. */
export function bmiCategoryFor(bmi) {
  if (typeof bmi !== "number" || !Number.isFinite(bmi) || bmi <= 0) return null;
  return BMI_CATEGORIES.find((c) => bmi >= c.minBmi && bmi < c.maxBmi) ?? null;
}

/**
 * Daily protein target for pregnancy or breastfeeding.
 *
 * @param {object} input
 * @param {number} input.prePregnancyWeightKg
 * @param {number} input.heightCm
 * @param {string} input.stage         key of STAGES
 * @param {boolean} input.twins        carrying or feeding twins
 * @param {number} input.mealsPerDay
 * @returns {object} the target, or { error }
 */
export function pregnancyProteinTarget({
  prePregnancyWeightKg,
  heightCm,
  stage = "trimester2",
  twins = false,
  mealsPerDay = 4,
}) {
  const numeric = { prePregnancyWeightKg, heightCm, mealsPerDay };
  for (const [key, value] of Object.entries(numeric)) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return { error: `Enter a valid number for ${key}.` };
    }
  }
  if (prePregnancyWeightKg < LIMITS.weightKg.min || prePregnancyWeightKg > LIMITS.weightKg.max) {
    return {
      error: `Pre-pregnancy weight must be between ${LIMITS.weightKg.min} and ${LIMITS.weightKg.max} kg.`,
    };
  }
  if (heightCm < LIMITS.heightCm.min || heightCm > LIMITS.heightCm.max) {
    return { error: `Height must be between ${LIMITS.heightCm.min} and ${LIMITS.heightCm.max} cm.` };
  }
  if (!Number.isInteger(mealsPerDay)) {
    return { error: "Meals a day must be a whole number." };
  }
  if (mealsPerDay < LIMITS.mealsPerDay.min || mealsPerDay > LIMITS.mealsPerDay.max) {
    return {
      error: `Spread protein across ${LIMITS.mealsPerDay.min} to ${LIMITS.mealsPerDay.max} meals and snacks.`,
    };
  }
  const stageDef = STAGES[stage];
  if (!stageDef) return { error: "Choose a pregnancy or breastfeeding stage." };

  const weight = prePregnancyWeightKg;
  const bmi = bodyMassIndex(weight, heightCm);
  const category = bmiCategoryFor(bmi);

  const baselineGrams = BASELINE_RDA_G_PER_KG * weight;
  const perKgGrams = stageDef.rdaPerKg * weight;
  const additiveGrams = stageDef.additiveG > 0 ? baselineGrams + stageDef.additiveG : 0;
  const usesAdditiveBasis = additiveGrams > perKgGrams;
  const recommendedGrams = Math.max(perKgGrams, additiveGrams);
  const earGrams = stageDef.earPerKg * weight;

  const gainRange = category
    ? twins
      ? category.twinKg
      : category.singletonKg
    : null;

  return {
    stageLabel: stageDef.label,
    stageNote: stageDef.note,
    isPregnant: stageDef.pregnant,
    prePregnancyWeightKg: weight,
    bmi,
    bmiCategory: category ? category.label : null,
    twins,
    gainRangeKg: gainRange,
    gainRangeMissing: Boolean(category) && gainRange === null,
    baselineGrams,
    baselinePerKg: BASELINE_RDA_G_PER_KG,
    perKgGrams,
    rdaPerKg: stageDef.rdaPerKg,
    additiveGrams,
    additiveIncreaseG: stageDef.additiveG,
    usesAdditiveBasis,
    basisLabel: usesAdditiveBasis
      ? `the +${stageDef.additiveG} g/day form of the RDA`
      : `${stageDef.rdaPerKg} g/kg of pre-pregnancy weight`,
    recommendedGrams,
    extraOverBaselineGrams: recommendedGrams - baselineGrams,
    earGrams,
    earPerKg: stageDef.earPerKg,
    extraKcal: stageDef.extraKcal,
    proteinKcal: recommendedGrams * KCAL_PER_GRAM_PROTEIN,
    mealsPerDay,
    perMealGrams: recommendedGrams / mealsPerDay,
    twinsNoProteinDri: twins,
  };
}
