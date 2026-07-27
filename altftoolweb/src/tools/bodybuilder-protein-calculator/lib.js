/**
 * Bodybuilder protein targets — daily amount and per-meal distribution.
 *
 * Rules implemented (all published, none invented):
 *  - ISSN Position Stand "Protein and Exercise" (Jager et al., JISSN 2017):
 *    1.4-2.0 g protein per kg bodyweight per day builds and maintains muscle
 *    mass in resistance-trained people.
 *  - Helms et al. 2014 (Int J Sport Nutr Exerc Metab) and the ISSN stand:
 *    while in an energy deficit, lean resistance-trained lifters need
 *    2.3-3.1 g/kg of FAT-FREE MASS to protect lean tissue.
 *  - Schoenfeld & Aragon (JISSN 2018): about 0.4 g/kg bodyweight of protein per
 *    meal, spread over at least four meals, maximises the muscle protein
 *    synthesis (MPS) response across the day.
 *  - Leucine "trigger" dose is roughly 2.5 g per meal. High quality animal
 *    protein is about 8% leucine by weight; whey is about 10.5%.
 *  - Snijders et al. 2015: 30-40 g of slow-digesting protein before sleep
 *    raises overnight MPS.
 *  - Protein supplies 4 kcal per gram (Atwater factor).
 */

/** Atwater energy factor for protein. */
export const KCAL_PER_G_PROTEIN = 4;

/** Schoenfeld & Aragon 2018: per-meal dose that maximises MPS. */
export const PER_MEAL_MIN_G_PER_KG = 0.4;

/** Approximate leucine dose per meal needed to trigger MPS, in grams. */
export const LEUCINE_TRIGGER_G = 2.5;

/** Leucine content by weight of the protein eaten. */
export const LEUCINE_FRACTION = {
  mixed: 0.08, // mixed high-quality animal protein (meat, eggs, dairy)
  whey: 0.105, // whey isolate/concentrate
  plant: 0.07, // soy/pea blends sit slightly lower
};

/** Snijders et al. 2015 pre-sleep casein dose, in grams. */
export const PRE_SLEEP_PROTEIN_G = 40;

/** Typical daily eating window used to space meals, in hours. */
export const EATING_WINDOW_HOURS = 14;

/** Practical meal spacing window from the ISSN stand, in hours. */
export const MEAL_SPACING_MIN_H = 3;
export const MEAL_SPACING_MAX_H = 5;

/**
 * Training phases. `basis` says whether the g/kg figures apply to total
 * bodyweight or to fat-free mass.
 */
export const PHASES = {
  bulk: {
    id: "bulk",
    label: "Bulking (calorie surplus)",
    basis: "bodyweight",
    low: 1.6,
    target: 1.8,
    high: 2.2,
    note: "ISSN range for building muscle in a surplus.",
  },
  maintain: {
    id: "maintain",
    label: "Maintenance (calories at target)",
    basis: "bodyweight",
    low: 1.6,
    target: 1.8,
    high: 2.0,
    note: "ISSN range for maintaining muscle mass.",
  },
  cut: {
    id: "cut",
    label: "Cutting (calorie deficit)",
    basis: "ffm",
    low: 2.3,
    target: 2.7,
    high: 3.1,
    note: "Helms et al. range, applied to fat-free mass.",
  },
};

/**
 * Fallback g/kg of BODYWEIGHT for a cut when body-fat percentage is unknown.
 * 2.3-3.1 g/kg FFM works out near these numbers at a typical 12-20% body fat,
 * so the tool degrades to a defensible bodyweight-based range instead of
 * guessing a body-fat figure.
 */
export const CUT_BODYWEIGHT_FALLBACK = { low: 2.0, target: 2.2, high: 2.4 };

export const MIN_WEIGHT_KG = 30;
export const MAX_WEIGHT_KG = 250;
export const MIN_BODY_FAT_PCT = 3;
export const MAX_BODY_FAT_PCT = 60;
export const MIN_MEALS = 1;
export const MAX_MEALS = 8;

const round = (value, dp = 0) => {
  const factor = 10 ** dp;
  return Math.round(value * factor) / factor;
};

/** Illustrative first-meal time used to label the schedule, in hours. */
export const SCHEDULE_START_HOUR = 7;

/** Turn an offset in hours from the first meal into a 24-hour clock label. */
export function scheduleClock(hourOffset, startHour = SCHEDULE_START_HOUR) {
  const offset = Number(hourOffset);
  if (!Number.isFinite(offset)) return "--:--";
  const totalMinutes = startHour * 60 + Math.round(offset * 60);
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = ((totalMinutes % 60) + 60) % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/**
 * @param {object} input
 * @param {number} input.weightKg        Bodyweight in kilograms.
 * @param {number|null} [input.bodyFatPct] Body fat percentage, optional.
 * @param {string} [input.phase]         "bulk" | "maintain" | "cut".
 * @param {number} [input.meals]         Protein-containing meals per day.
 * @param {string} [input.proteinSource] Key of LEUCINE_FRACTION.
 * @returns {object} result, or { error } for invalid input.
 */
export function computeBodybuilderProtein({
  weightKg,
  bodyFatPct = null,
  phase = "bulk",
  meals = 5,
  proteinSource = "mixed",
} = {}) {
  const weight = Number(weightKg);
  if (!Number.isFinite(weight)) {
    return { error: "Enter your bodyweight in kilograms." };
  }
  if (weight < MIN_WEIGHT_KG || weight > MAX_WEIGHT_KG) {
    return {
      error: `Bodyweight should be between ${MIN_WEIGHT_KG} kg and ${MAX_WEIGHT_KG} kg.`,
    };
  }

  const mealCount = Number(meals);
  if (!Number.isFinite(mealCount) || !Number.isInteger(mealCount)) {
    return { error: "Meals per day must be a whole number." };
  }
  if (mealCount < MIN_MEALS || mealCount > MAX_MEALS) {
    return {
      error: `Choose between ${MIN_MEALS} and ${MAX_MEALS} protein meals per day.`,
    };
  }

  const selectedPhase = PHASES[phase] || PHASES.bulk;

  let bodyFat = null;
  if (bodyFatPct !== null && bodyFatPct !== "" && bodyFatPct !== undefined) {
    const bf = Number(bodyFatPct);
    if (!Number.isFinite(bf)) {
      return { error: "Body fat percentage must be a number, or leave it blank." };
    }
    if (bf < MIN_BODY_FAT_PCT || bf > MAX_BODY_FAT_PCT) {
      return {
        error: `Body fat percentage should be between ${MIN_BODY_FAT_PCT}% and ${MAX_BODY_FAT_PCT}%.`,
      };
    }
    bodyFat = bf;
  }

  const ffmKg = bodyFat === null ? null : weight * (1 - bodyFat / 100);

  // Pick the basis and the g/kg band.
  let basis = selectedPhase.basis;
  let band = { low: selectedPhase.low, target: selectedPhase.target, high: selectedPhase.high };
  let referenceKg = weight;
  let basisNote = selectedPhase.note;

  if (basis === "ffm") {
    if (ffmKg === null) {
      basis = "bodyweight";
      band = { ...CUT_BODYWEIGHT_FALLBACK };
      referenceKg = weight;
      basisNote =
        "Body fat unknown, so the cutting range is applied to total bodyweight instead of fat-free mass.";
    } else {
      referenceKg = ffmKg;
    }
  }

  const dailyMin = band.low * referenceKg;
  const dailyTarget = band.target * referenceKg;
  const dailyMax = band.high * referenceKg;

  const perMeal = dailyTarget / mealCount;
  const perMealGPerKg = perMeal / weight;
  const perMealDoseG = PER_MEAL_MIN_G_PER_KG * weight;

  // How many meals can still each clear the 0.4 g/kg MPS dose at this intake.
  const maxUsefulMeals = Math.max(1, Math.floor(dailyTarget / perMealDoseG));

  const leucineFraction = LEUCINE_FRACTION[proteinSource] ?? LEUCINE_FRACTION.mixed;
  const leucinePerMeal = perMeal * leucineFraction;

  const spacingHours =
    mealCount > 1 ? EATING_WINDOW_HOURS / (mealCount - 1) : EATING_WINDOW_HOURS;

  const schedule = [];
  for (let i = 0; i < mealCount; i += 1) {
    const hourOffset = round(mealCount > 1 ? spacingHours * i : 0, 1);
    schedule.push({
      index: i + 1,
      hourOffset,
      clock: scheduleClock(hourOffset),
      grams: round(perMeal, 1),
      leucine: round(perMeal * leucineFraction, 2),
    });
  }

  const warnings = [];
  if (perMealGPerKg < PER_MEAL_MIN_G_PER_KG) {
    warnings.push(
      `Each meal lands at ${round(perMealGPerKg, 2)} g/kg, under the 0.4 g/kg per-meal dose. Drop to ${maxUsefulMeals} protein meals or raise daily intake.`,
    );
  }
  if (leucinePerMeal < LEUCINE_TRIGGER_G) {
    warnings.push(
      `About ${round(leucinePerMeal, 2)} g leucine per meal, below the ~2.5 g trigger dose. Larger or higher-leucine servings would clear it.`,
    );
  }
  if (spacingHours < MEAL_SPACING_MIN_H) {
    warnings.push(
      `${mealCount} meals across a ${EATING_WINDOW_HOURS}-hour window puts them about ${round(spacingHours, 1)} h apart, tighter than the 3-5 h spacing that suits MPS.`,
    );
  }
  if (spacingHours > MEAL_SPACING_MAX_H && mealCount > 1) {
    warnings.push(
      `Meals sit about ${round(spacingHours, 1)} h apart, wider than the 3-5 h spacing usually recommended.`,
    );
  }

  return {
    phaseId: selectedPhase.id,
    phaseLabel: selectedPhase.label,
    basis,
    basisNote,
    weightKg: round(weight, 1),
    bodyFatPct: bodyFat === null ? null : round(bodyFat, 1),
    ffmKg: ffmKg === null ? null : round(ffmKg, 1),
    fatMassKg: ffmKg === null ? null : round(weight - ffmKg, 1),
    referenceKg: round(referenceKg, 1),
    gPerKg: band.target,
    bandLow: band.low,
    bandHigh: band.high,
    dailyMin: round(dailyMin),
    dailyTarget: round(dailyTarget),
    dailyMax: round(dailyMax),
    gPerKgBodyweight: round(dailyTarget / weight, 2),
    proteinKcal: round(dailyTarget * KCAL_PER_G_PROTEIN),
    meals: mealCount,
    perMeal: round(perMeal, 1),
    perMealGPerKg: round(perMealGPerKg, 2),
    perMealDoseG: round(perMealDoseG, 1),
    meetsPerMealDose: perMealGPerKg >= PER_MEAL_MIN_G_PER_KG,
    maxUsefulMeals,
    leucinePerMeal: round(leucinePerMeal, 2),
    meetsLeucine: leucinePerMeal >= LEUCINE_TRIGGER_G,
    spacingHours: round(spacingHours, 1),
    preSleepProteinG: PRE_SLEEP_PROTEIN_G,
    schedule,
    warnings,
  };
}
