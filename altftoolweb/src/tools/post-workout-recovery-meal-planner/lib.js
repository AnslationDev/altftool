/**
 * Post-workout recovery meal planner — pure logic.
 *
 * Targets follow published sports-nutrition guidance:
 *  - Protein per feeding: ISSN position stand on protein and exercise —
 *    0.25 g/kg bodyweight per dose as a minimum, ~0.40 g/kg to maximise the
 *    muscle protein synthesis response, in a practical 20-40 g band.
 *  - Carbohydrate for glycogen resynthesis: IOC / ACSM guidance —
 *    1.0-1.2 g/kg bodyweight per hour for the first ~4 hours when the next
 *    session is less than 8 hours away; otherwise normal daily carbohydrate
 *    intake is sufficient and a single ~1.0 g/kg feed restarts the process.
 *  - Rehydration: ACSM — replace 125-150% of the fluid deficit, i.e. about
 *    1.5 L of fluid per 1 kg of bodyweight lost during the session.
 *  - Sodium: typical sweat sodium concentration is around 1 g per litre
 *    (population range roughly 0.2-1.7 g/L).
 *  - Leucine: roughly 2.5 g of leucine per feeding is the commonly cited
 *    threshold for a maximal muscle protein synthesis response.
 */

/** ISSN protein-per-dose rates, grams of protein per kg bodyweight. */
export const PROTEIN_PER_KG_MINIMUM = 0.25;
export const PROTEIN_PER_KG_STANDARD = 0.3;
export const PROTEIN_PER_KG_MAXIMAL = 0.4;

/** Practical per-dose band from the same position stand. */
export const PROTEIN_DOSE_MIN_G = 20;
export const PROTEIN_DOSE_MAX_G = 40;

/** Age at which anabolic resistance justifies the top of the protein band. */
export const OLDER_ADULT_AGE = 60;

/** Rapid-refuelling carbohydrate rate, g per kg per hour (IOC / ACSM). */
export const CARB_RAPID_PER_KG_PER_HOUR = 1.2;
/** Hours over which the rapid rate is applied. */
export const CARB_RAPID_WINDOW_HOURS = 4;
/** Gap below which rapid refuelling matters, in hours. */
export const RAPID_REFUEL_GAP_HOURS = 8;
/** Single-feed carbohydrate when the next session is far away, g per kg. */
export const CARB_RELAXED_PER_KG = 1.0;

/** Rehydration: litres of fluid per kg of bodyweight lost (ACSM 125-150%). */
export const FLUID_PER_KG_LOST_L = 1.5;
/** Typical sweat sodium concentration, mg per litre of sweat. */
export const SWEAT_SODIUM_MG_PER_L = 1000;

/** Estimated sweat rate in litres per hour when the user has not weighed in. */
export const SWEAT_RATE_L_PER_HOUR = {
  low: 0.5,
  moderate: 1.0,
  high: 1.5,
};

/** Leucine as a fraction of total protein. */
export const LEUCINE_FRACTION_WHEY = 0.105;
export const LEUCINE_FRACTION_MIXED_FOOD = 0.08;
/** Leucine per feeding associated with a maximal MPS response, grams. */
export const LEUCINE_THRESHOLD_G = 2.5;

/** Atwater factors: kcal per gram. */
export const KCAL_PER_G_PROTEIN = 4;
export const KCAL_PER_G_CARB = 4;

export const SESSION_TYPES = [
  {
    id: "strength",
    label: "Resistance / strength",
    proteinPerKg: PROTEIN_PER_KG_MAXIMAL,
    note: "Full-body and heavy lifting sessions respond best to the top of the protein band.",
  },
  {
    id: "endurance",
    label: "Endurance (run / ride / swim)",
    proteinPerKg: PROTEIN_PER_KG_STANDARD,
    note: "Carbohydrate is the priority; protein still supports repair and adaptation.",
  },
  {
    id: "hiit",
    label: "HIIT / team sport",
    proteinPerKg: PROTEIN_PER_KG_STANDARD,
    note: "Glycogen is heavily used in repeated high-intensity efforts.",
  },
  {
    id: "light",
    label: "Light / technique session",
    proteinPerKg: PROTEIN_PER_KG_MINIMUM,
    note: "A modest feed is enough; daily totals matter more than this single meal.",
  },
];

export const INTENSITIES = [
  { id: "low", label: "Easy — barely sweating" },
  { id: "moderate", label: "Moderate — steady sweat" },
  { id: "high", label: "Hard — soaked kit" },
];

/**
 * Food composition per 100 g as eaten, from standard food-composition values.
 * proteinPer100 / carbPer100 are grams per 100 g of the food.
 */
export const MEAL_COMBOS = [
  {
    id: "chicken-rice",
    label: "Chicken breast + white rice",
    diet: "Omnivore",
    proteinFood: { name: "Cooked chicken breast", proteinPer100: 31, carbPer100: 0 },
    carbFood: { name: "Cooked white rice", proteinPer100: 2.7, carbPer100: 28 },
    leucineFraction: LEUCINE_FRACTION_MIXED_FOOD,
  },
  {
    id: "whey-banana",
    label: "Whey shake + banana",
    diet: "Fast option",
    proteinFood: { name: "Whey protein powder", proteinPer100: 80, carbPer100: 8 },
    carbFood: { name: "Banana", proteinPer100: 1.1, carbPer100: 23 },
    leucineFraction: LEUCINE_FRACTION_WHEY,
  },
  {
    id: "yoghurt-oats",
    label: "Greek yoghurt + rolled oats",
    diet: "Vegetarian",
    proteinFood: { name: "Non-fat Greek yoghurt", proteinPer100: 10, carbPer100: 3.6 },
    carbFood: { name: "Rolled oats (dry weight)", proteinPer100: 13.2, carbPer100: 67 },
    leucineFraction: LEUCINE_FRACTION_MIXED_FOOD,
  },
  {
    id: "paneer-roti",
    label: "Paneer + chapati",
    diet: "Vegetarian",
    proteinFood: { name: "Paneer", proteinPer100: 18, carbPer100: 1.2 },
    carbFood: { name: "Whole-wheat chapati", proteinPer100: 8, carbPer100: 50 },
    leucineFraction: LEUCINE_FRACTION_MIXED_FOOD,
  },
  {
    id: "eggs-toast",
    label: "Eggs + wholemeal toast",
    diet: "Vegetarian",
    proteinFood: { name: "Whole eggs", proteinPer100: 12.6, carbPer100: 0.7 },
    carbFood: { name: "Wholemeal bread", proteinPer100: 9, carbPer100: 41 },
    leucineFraction: LEUCINE_FRACTION_MIXED_FOOD,
  },
  {
    id: "tofu-noodles",
    label: "Firm tofu + noodles",
    diet: "Vegan",
    proteinFood: { name: "Firm tofu", proteinPer100: 17, carbPer100: 2.8 },
    carbFood: { name: "Cooked noodles", proteinPer100: 5.8, carbPer100: 25 },
    leucineFraction: LEUCINE_FRACTION_MIXED_FOOD,
  },
  {
    id: "dal-rice",
    label: "Dal + rice",
    diet: "Vegan",
    proteinFood: { name: "Cooked toor dal", proteinPer100: 7, carbPer100: 20 },
    carbFood: { name: "Cooked white rice", proteinPer100: 2.7, carbPer100: 28 },
    leucineFraction: LEUCINE_FRACTION_MIXED_FOOD,
  },
  {
    id: "salmon-sweet-potato",
    label: "Salmon + sweet potato",
    diet: "Omnivore",
    proteinFood: { name: "Cooked salmon", proteinPer100: 25, carbPer100: 0 },
    carbFood: { name: "Boiled sweet potato", proteinPer100: 1.6, carbPer100: 20 },
    leucineFraction: LEUCINE_FRACTION_MIXED_FOOD,
  },
];

const round = (value, step) => Math.round(value / step) * step;

/**
 * Work out how many grams of each food land on the protein and carbohydrate
 * targets. Both foods usually contribute both macros, so this solves the two
 * linear equations exactly:
 *
 *   carbGrams * carbFoodCarb   + proteinGrams * proteinFoodCarb   = carbTarget
 *   carbGrams * carbFoodProtein + proteinGrams * proteinFoodProtein = proteinTarget
 *
 * If no non-negative solution exists (a "protein" food that is itself very
 * carb-heavy, such as dal), protein wins: the protein food is portioned to hit
 * the protein target and the carbohydrate food only fills whatever gap is left.
 */
export function portionCombo(combo, proteinG, carbG) {
  const a = combo.carbFood.carbPer100 / 100; // carb per gram of the carb food
  const b = combo.proteinFood.carbPer100 / 100; // carb per gram of the protein food
  const c = combo.carbFood.proteinPer100 / 100; // protein per gram of the carb food
  const d = combo.proteinFood.proteinPer100 / 100; // protein per gram of the protein food

  const det = a * d - b * c;
  let carbGrams = 0;
  let proteinGrams = 0;

  if (Math.abs(det) > 1e-9) {
    carbGrams = (carbG * d - b * proteinG) / det;
    proteinGrams = (a * proteinG - carbG * c) / det;
  }

  if (!(carbGrams >= 0) || !(proteinGrams >= 0)) {
    proteinGrams = d > 0 ? proteinG / d : 0;
    const carbFromProteinFood = proteinGrams * b;
    carbGrams = a > 0 ? Math.max(0, carbG - carbFromProteinFood) / a : 0;
  }

  const roundedProtein = round(proteinGrams, 5);
  const roundedCarb = round(carbGrams, 5);

  const deliveredProtein = roundedProtein * d + roundedCarb * c;
  const deliveredCarb = roundedProtein * b + roundedCarb * a;

  return {
    id: combo.id,
    label: combo.label,
    diet: combo.diet,
    proteinFoodName: combo.proteinFood.name,
    proteinFoodGrams: roundedProtein,
    carbFoodName: combo.carbFood.name,
    carbFoodGrams: roundedCarb,
    deliveredProteinG: Math.round(deliveredProtein),
    deliveredCarbG: Math.round(deliveredCarb),
    leucineG: Number((deliveredProtein * combo.leucineFraction).toFixed(1)),
  };
}

/**
 * Build the full recovery plan.
 *
 * @param {object} input
 * @param {number} input.bodyWeightKg
 * @param {string} input.sessionType - a SESSION_TYPES id
 * @param {number} input.sessionMinutes
 * @param {string} input.intensity - an INTENSITIES id
 * @param {number} input.hoursToNextSession
 * @param {number|null} input.weightLostKg - measured bodyweight drop, or null to estimate
 * @param {number} input.age
 * @returns {object|{error: string}}
 */
export function planRecoveryMeal({
  bodyWeightKg,
  sessionType,
  sessionMinutes,
  intensity,
  hoursToNextSession,
  weightLostKg = null,
  age = 30,
}) {
  const weight = Number(bodyWeightKg);
  if (!Number.isFinite(weight)) return { error: "Enter your bodyweight in kilograms." };
  if (weight < 25 || weight > 250) {
    return { error: "Bodyweight should be between 25 kg and 250 kg." };
  }

  const type = SESSION_TYPES.find((item) => item.id === sessionType);
  if (!type) return { error: "Pick the kind of session you just finished." };

  const intensityEntry = INTENSITIES.find((item) => item.id === intensity);
  if (!intensityEntry) return { error: "Pick how hard the session felt." };

  const minutes = Number(sessionMinutes);
  if (!Number.isFinite(minutes) || minutes <= 0 || minutes > 600) {
    return { error: "Session length should be between 1 and 600 minutes." };
  }

  const gap = Number(hoursToNextSession);
  if (!Number.isFinite(gap) || gap < 0 || gap > 168) {
    return { error: "Hours until your next session should be between 0 and 168." };
  }

  const years = Number(age);
  if (!Number.isFinite(years) || years < 10 || years > 100) {
    return { error: "Age should be between 10 and 100 years." };
  }

  let lost = weightLostKg === null || weightLostKg === "" ? null : Number(weightLostKg);
  let sweatEstimated = false;
  if (lost === null || Number.isNaN(lost)) {
    sweatEstimated = true;
    lost = (SWEAT_RATE_L_PER_HOUR[intensityEntry.id] * minutes) / 60;
  }
  if (lost < 0 || lost > 8) {
    return { error: "Bodyweight lost during the session should be between 0 kg and 8 kg." };
  }

  // Protein: session type sets the rate, age can lift it, the 20-40 g band caps it.
  const rate = years >= OLDER_ADULT_AGE
    ? Math.max(type.proteinPerKg, PROTEIN_PER_KG_MAXIMAL)
    : type.proteinPerKg;
  const rawProtein = weight * rate;
  const proteinG = Math.round(
    Math.min(PROTEIN_DOSE_MAX_G, Math.max(PROTEIN_DOSE_MIN_G, rawProtein)),
  );
  const proteinCapped = rawProtein > PROTEIN_DOSE_MAX_G;
  const proteinFloored = rawProtein < PROTEIN_DOSE_MIN_G;

  // Carbohydrate: rapid refuelling only matters when the next session is close.
  const urgentRefuel = gap < RAPID_REFUEL_GAP_HOURS;
  const carbPerKg = urgentRefuel ? CARB_RAPID_PER_KG_PER_HOUR : CARB_RELAXED_PER_KG;
  const carbG = Math.round(weight * carbPerKg);
  const rapidWindowHours = urgentRefuel ? Math.min(CARB_RAPID_WINDOW_HOURS, Math.max(1, gap)) : 0;
  const carbWindowTotalG = urgentRefuel
    ? Math.round(weight * CARB_RAPID_PER_KG_PER_HOUR * rapidWindowHours)
    : carbG;

  // Fluid and sodium.
  const fluidMl = round(lost * FLUID_PER_KG_LOST_L * 1000, 50);
  const sodiumMg = round(lost * SWEAT_SODIUM_MG_PER_L, 50);

  const leucineFromMixedFood = Number((proteinG * LEUCINE_FRACTION_MIXED_FOOD).toFixed(1));
  const leucineFromWhey = Number((proteinG * LEUCINE_FRACTION_WHEY).toFixed(1));

  const kcal = Math.round(proteinG * KCAL_PER_G_PROTEIN + carbG * KCAL_PER_G_CARB);
  const carbToProteinRatio = proteinG > 0 ? Number((carbG / proteinG).toFixed(1)) : 0;

  const timingNote = urgentRefuel
    ? `Start eating within 30 minutes. With only ${gap} h to the next session, glycogen replacement is time-critical: aim for ${Math.round(weight * CARB_RAPID_PER_KG_PER_HOUR)} g of carbohydrate every hour for up to ${CARB_RAPID_WINDOW_HOURS} hours.`
    : "Eat within about two hours. With a long gap before the next session, hitting your daily protein and carbohydrate totals matters more than the exact minute you eat.";

  return {
    weight,
    sessionTypeLabel: type.label,
    sessionTypeNote: type.note,
    intensityLabel: intensityEntry.label,
    proteinG,
    proteinPerKg: Number(rate.toFixed(2)),
    proteinCapped,
    proteinFloored,
    carbG,
    carbPerKg,
    carbWindowTotalG,
    rapidWindowHours,
    urgentRefuel,
    fluidMl,
    sodiumMg,
    sweatLossKg: Number(lost.toFixed(2)),
    sweatEstimated,
    leucineFromMixedFood,
    leucineFromWhey,
    leucineThresholdMetWithFood: leucineFromMixedFood >= LEUCINE_THRESHOLD_G,
    leucineThresholdMetWithWhey: leucineFromWhey >= LEUCINE_THRESHOLD_G,
    kcal,
    carbToProteinRatio,
    timingNote,
    meals: MEAL_COMBOS.map((combo) => portionCombo(combo, proteinG, carbG)),
  };
}
