/**
 * Child protein intake calculator — pure logic.
 *
 * Baseline requirements are the Dietary Reference Intakes (Institute of
 * Medicine, 2005) protein RDAs. The percent-of-energy check uses the same
 * report's Acceptable Macronutrient Distribution Range (AMDR). Extra protein
 * for young athletes uses the 1.2-2.0 g/kg/day range in the 2016 joint
 * position of the Academy of Nutrition and Dietetics, Dietitians of Canada
 * and the American College of Sports Medicine.
 *
 * Nothing here is medical or dietetic advice.
 */

/** Energy yield of protein — the Atwater factor, kcal per gram. */
export const KCAL_PER_GRAM_PROTEIN = 4;

/**
 * DRI protein RDAs. gPerKg is the per-kilogram RDA; fixedGrams is the
 * reference-weight RDA printed in the DRI tables for that age band.
 */
export const PROTEIN_RDA_BANDS = [
  { minAge: 1, maxAge: 3, gPerKg: 1.05, fixedGrams: { male: 13, female: 13 }, label: "1-3 years" },
  { minAge: 4, maxAge: 8, gPerKg: 0.95, fixedGrams: { male: 19, female: 19 }, label: "4-8 years" },
  { minAge: 9, maxAge: 13, gPerKg: 0.95, fixedGrams: { male: 34, female: 34 }, label: "9-13 years" },
  { minAge: 14, maxAge: 18, gPerKg: 0.85, fixedGrams: { male: 52, female: 46 }, label: "14-18 years" },
];

/**
 * AMDR for protein as a share of total energy (DRI 2005):
 * 5-20% for ages 1-3 and 10-30% for ages 4-18.
 */
export const PROTEIN_AMDR_BANDS = [
  { minAge: 1, maxAge: 3, minPercent: 5, maxPercent: 20 },
  { minAge: 4, maxAge: 18, minPercent: 10, maxPercent: 30 },
];

/**
 * Activity levels. "typical" uses the plain DRI RDA. The two athlete levels
 * sit at the lower and middle of the 1.2-2.0 g/kg/day athlete range; that
 * range already covers growth, so it is used instead of, not on top of, the
 * RDA. A child's target is never allowed to fall below the RDA.
 */
export const ACTIVITY_LEVELS = [
  {
    id: "typical",
    label: "Typical activity — school PE and play",
    gPerKg: null,
    note: "Uses the DRI protein RDA for the age band.",
  },
  {
    id: "active",
    label: "Active — sport or training 3-5 days a week",
    gPerKg: 1.2,
    note: "Lower end of the 1.2-2.0 g/kg/day athlete range.",
  },
  {
    id: "competitive",
    label: "Competitive — training most days",
    gPerKg: 1.5,
    note: "Middle of the 1.2-2.0 g/kg/day athlete range.",
  },
];

/** Above this the sports-nutrition literature shows no further benefit. */
export const ATHLETE_UPPER_G_PER_KG = 2.0;

/**
 * Protein per common portion, in grams. Values are from USDA FoodData Central
 * except paneer, which uses the Indian Food Composition Tables (IFCT 2017).
 */
export const PROTEIN_FOODS = [
  { id: "egg", label: "Boiled egg", portion: "1 large (50 g)", grams: 6.3 },
  { id: "milk", label: "Whole milk", portion: "1 glass (250 ml)", grams: 8.5 },
  { id: "curd", label: "Plain curd / yoghurt", portion: "100 g", grams: 3.5 },
  { id: "paneer", label: "Paneer", portion: "100 g", grams: 18 },
  { id: "tofu", label: "Firm tofu", portion: "100 g", grams: 17 },
  { id: "chana", label: "Cooked chickpeas", portion: "100 g", grams: 8.9 },
  { id: "chicken", label: "Cooked chicken breast", portion: "100 g", grams: 31 },
  { id: "almonds", label: "Almonds", portion: "28 g (about 23 nuts)", grams: 6 },
  { id: "chapati", label: "Wholewheat chapati", portion: "1 (40 g)", grams: 3.5 },
  { id: "rice", label: "Cooked rice", portion: "100 g", grams: 2.7 },
];

const isNumber = (value) => typeof value === "number" && Number.isFinite(value);
const bandFor = (bands, age) => bands.find((entry) => age >= entry.minAge && age <= entry.maxAge) || null;

/** Round to one decimal place without ever producing -0. */
const round1 = (value) => Math.round(value * 10) / 10 + 0;
/** Two decimals, needed for g/kg figures like 0.95 that one decimal would distort. */
const round2 = (value) => Math.round(value * 100) / 100 + 0;

/**
 * Calculate a child's daily protein target.
 *
 * @param {object} input
 * @param {number} input.ageYears     Age in whole years, 1-18.
 * @param {number} input.weightKg     Body weight in kilograms.
 * @param {string} input.sex          "male" or "female" (only changes the 14-18 reference RDA).
 * @param {string} input.activity     One of the ACTIVITY_LEVELS ids.
 * @param {number} [input.dailyKcal]  Daily energy intake, for the AMDR check. 0 to skip.
 * @returns {object} result, or { error } for invalid input.
 */
export function calculateChildProtein(input) {
  const { ageYears, weightKg, sex, activity, dailyKcal } = input || {};

  if (!isNumber(ageYears) || !isNumber(weightKg)) {
    return { error: "Enter a valid age and body weight." };
  }
  const kcal = isNumber(dailyKcal) ? dailyKcal : 0;

  const age = Math.floor(ageYears);
  if (age < 1 || age > 18) {
    return {
      error:
        "This calculator covers ages 1 to 18. Protein needs for babies under 1 should come from your paediatrician.",
    };
  }
  if (weightKg <= 0) return { error: "Body weight must be greater than zero." };
  if (weightKg > 150) return { error: "Enter a body weight below 150 kg." };
  if (kcal < 0) return { error: "Daily calories cannot be negative." };
  if (kcal > 0 && (kcal < 500 || kcal > 6000)) {
    return { error: "Daily calories should be between 500 and 6000, or left at 0 to skip the check." };
  }

  const rdaBand = bandFor(PROTEIN_RDA_BANDS, age);
  const sexKey = sex === "male" ? "male" : "female";
  const level = ACTIVITY_LEVELS.find((entry) => entry.id === activity) || ACTIVITY_LEVELS[0];

  const rdaGPerKg = rdaBand.gPerKg;
  const rdaGrams = weightKg * rdaGPerKg;
  // The athlete range replaces the RDA, but can never be lower than it.
  const targetGPerKg = level.gPerKg === null ? rdaGPerKg : Math.max(level.gPerKg, rdaGPerKg);
  const targetGrams = weightKg * targetGPerKg;

  const amdrBand = bandFor(PROTEIN_AMDR_BANDS, age);
  let energyCheck = null;
  if (kcal > 0 && amdrBand) {
    const percentOfEnergy = (targetGrams * KCAL_PER_GRAM_PROTEIN * 100) / kcal;
    let verdict = "in-range";
    if (percentOfEnergy < amdrBand.minPercent) verdict = "below";
    else if (percentOfEnergy > amdrBand.maxPercent) verdict = "above";
    energyCheck = {
      dailyKcal: kcal,
      percentOfEnergy: round1(percentOfEnergy),
      minPercent: amdrBand.minPercent,
      maxPercent: amdrBand.maxPercent,
      verdict,
      kcalFromProtein: Math.round(targetGrams * KCAL_PER_GRAM_PROTEIN),
    };
  }

  const foods = PROTEIN_FOODS.map((food) => ({
    ...food,
    portionsForTarget: round1(targetGrams / food.grams),
    // Share of the daily target covered by a single portion.
    percentOfTarget: Math.round((food.grams / targetGrams) * 100),
  }));

  const notes = [
    `DRI reference for ${rdaBand.label}: ${rdaGPerKg} g per kg of body weight a day, or about ${rdaBand.fixedGrams[sexKey]} g a day at the reference weight for this age.`,
    level.note,
  ];
  if (targetGPerKg >= ATHLETE_UPPER_G_PER_KG) {
    notes.push(
      `${targetGPerKg} g/kg is at the top of the evidence-based athlete range — intakes above ${ATHLETE_UPPER_G_PER_KG} g/kg show no extra benefit.`,
    );
  }
  if (energyCheck && energyCheck.verdict === "above") {
    notes.push(
      `At ${kcal} kcal a day this target is ${energyCheck.percentOfEnergy}% of energy, above the ${amdrBand.maxPercent}% AMDR ceiling for this age — either energy intake is too low or the protein target is too high.`,
    );
  }
  if (energyCheck && energyCheck.verdict === "below") {
    notes.push(
      `This target supplies ${energyCheck.percentOfEnergy}% of a ${kcal} kcal day, under the ${amdrBand.minPercent}% AMDR floor. That is normal — the RDA is the minimum that prevents deficiency, while the AMDR describes a healthy overall eating pattern, so most children comfortably eat above the RDA.`,
    );
  }
  notes.push(
    "Spreading protein across breakfast, lunch, an evening meal and one snack is easier for a child than one large serving.",
  );

  return {
    age,
    ageBandLabel: rdaBand.label,
    sex: sexKey,
    weightKg,
    activityId: level.id,
    activityLabel: level.label,
    rdaGPerKg,
    rdaGrams: round1(rdaGrams),
    referenceRdaGrams: rdaBand.fixedGrams[sexKey],
    targetGPerKg: round2(targetGPerKg),
    targetGrams: round1(targetGrams),
    extraOverRdaGrams: round1(targetGrams - rdaGrams),
    perMealGrams: round1(targetGrams / 4),
    energyCheck,
    foods,
    notes,
  };
}
