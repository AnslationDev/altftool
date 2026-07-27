/**
 * Protein needs for endurance athletes, scaled to weekly training volume.
 *
 * Rules implemented:
 *  - ACSM / Academy of Nutrition and Dietetics / Dietitians of Canada joint
 *    position stand "Nutrition and Athletic Performance" (Thomas, Erdman &
 *    Burke, 2016): athletes need 1.2-2.0 g protein per kg bodyweight per day,
 *    with the higher end during heavy training or energy restriction.
 *  - Same stand: about 0.3 g/kg bodyweight of protein after key sessions, and
 *    again every 3-5 hours across the day.
 *  - Moore et al. (2015): roughly 0.25-0.3 g/kg per meal is the dose that
 *    maximises the muscle protein synthesis response in trained adults.
 *  - PROT-AGE study group (Bauer et al., 2013): masters athletes over 50 have a
 *    blunted anabolic response and should not sit at the bottom of the range.
 *  - Institute of Medicine AMDR: protein should supply 10-35% of daily energy.
 *  - Protein supplies 4 kcal per gram (Atwater factor).
 */

/** Atwater energy factor for protein. */
export const KCAL_PER_G_PROTEIN = 4;

/** ACSM position-stand bounds, g per kg bodyweight per day. */
export const ATHLETE_MIN_G_PER_KG = 1.2;
export const ATHLETE_MAX_G_PER_KG = 2.0;

/** ACSM post-exercise protein dose, g per kg bodyweight. */
export const POST_SESSION_G_PER_KG = 0.3;

/** Moore et al. per-meal dose that maximises MPS, g per kg bodyweight. */
export const PER_MEAL_MIN_G_PER_KG = 0.25;

/** Extra g/kg while in an energy deficit, to protect lean mass. */
export const ENERGY_DEFICIT_BONUS_G_PER_KG = 0.2;

/** Masters athletes (PROT-AGE): floor for athletes at or above this age. */
export const MASTERS_AGE_YEARS = 50;
export const MASTERS_FLOOR_G_PER_KG = 1.4;

/** IOM Acceptable Macronutrient Distribution Range for protein, % of energy. */
export const AMDR_MIN_PCT = 10;
export const AMDR_MAX_PCT = 35;

/**
 * Weekly training volume bands mapped across the 1.2-2.0 g/kg position-stand
 * range. `maxHours` is exclusive except for the final open-ended band.
 */
export const VOLUME_BANDS = [
  { id: "light", label: "Under 5 h/week (recreational)", maxHours: 5, gPerKg: 1.2 },
  { id: "moderate", label: "5-10 h/week (club training)", maxHours: 10, gPerKg: 1.4 },
  { id: "high", label: "10-15 h/week (serious amateur)", maxHours: 15, gPerKg: 1.6 },
  { id: "veryHigh", label: "15-20 h/week (heavy block)", maxHours: 20, gPerKg: 1.8 },
  { id: "elite", label: "20 h/week and above (elite volume)", maxHours: Infinity, gPerKg: 2.0 },
];

export const MIN_WEIGHT_KG = 30;
export const MAX_WEIGHT_KG = 200;
export const MAX_WEEKLY_HOURS = 40;
export const MAX_SESSIONS_PER_WEEK = 21;
export const MIN_MEALS = 2;
export const MAX_MEALS = 8;
export const MIN_AGE_YEARS = 12;
export const MAX_AGE_YEARS = 100;

const round = (value, dp = 0) => {
  const factor = 10 ** dp;
  return Math.round(value * factor) / factor;
};

/** Pick the volume band for a given weekly training-hour figure. */
export function bandForHours(weeklyHours) {
  return VOLUME_BANDS.find((band) => weeklyHours < band.maxHours) ?? VOLUME_BANDS[VOLUME_BANDS.length - 1];
}

/**
 * @param {object} input
 * @param {number} input.weightKg          Bodyweight in kilograms.
 * @param {number} input.weeklyHours       Total endurance training hours per week.
 * @param {number} [input.sessionsPerWeek] Sessions that warrant a post-workout feed.
 * @param {number} [input.ageYears]        Age in years.
 * @param {boolean} [input.energyDeficit]  True if deliberately in a calorie deficit.
 * @param {number} [input.meals]           Protein-containing meals per day.
 * @param {number|null} [input.dailyKcal]  Optional total daily energy intake.
 * @returns {object} result, or { error } for invalid input.
 */
export function computeEnduranceProtein({
  weightKg,
  weeklyHours,
  sessionsPerWeek = 5,
  ageYears = 32,
  energyDeficit = false,
  meals = 4,
  dailyKcal = null,
} = {}) {
  const weight = Number(weightKg);
  if (!Number.isFinite(weight)) return { error: "Enter your bodyweight in kilograms." };
  if (weight < MIN_WEIGHT_KG || weight > MAX_WEIGHT_KG) {
    return { error: `Bodyweight should be between ${MIN_WEIGHT_KG} kg and ${MAX_WEIGHT_KG} kg.` };
  }

  const hours = Number(weeklyHours);
  if (!Number.isFinite(hours)) return { error: "Enter your weekly training hours." };
  if (hours < 0) return { error: "Weekly training hours cannot be negative." };
  if (hours > MAX_WEEKLY_HOURS) {
    return { error: `Weekly training hours above ${MAX_WEEKLY_HOURS} are outside this calculator's range.` };
  }

  const sessions = Number(sessionsPerWeek);
  if (!Number.isFinite(sessions) || sessions < 0 || sessions > MAX_SESSIONS_PER_WEEK) {
    return { error: `Sessions per week should be between 0 and ${MAX_SESSIONS_PER_WEEK}.` };
  }

  const age = Number(ageYears);
  if (!Number.isFinite(age) || age < MIN_AGE_YEARS || age > MAX_AGE_YEARS) {
    return { error: `Age should be between ${MIN_AGE_YEARS} and ${MAX_AGE_YEARS} years.` };
  }

  const mealCount = Number(meals);
  if (!Number.isFinite(mealCount) || !Number.isInteger(mealCount) || mealCount < MIN_MEALS || mealCount > MAX_MEALS) {
    return { error: `Choose between ${MIN_MEALS} and ${MAX_MEALS} protein meals per day.` };
  }

  let kcal = null;
  if (dailyKcal !== null && dailyKcal !== "" && dailyKcal !== undefined) {
    const parsed = Number(dailyKcal);
    if (!Number.isFinite(parsed)) return { error: "Daily calories must be a number, or leave it blank." };
    if (parsed < 800 || parsed > 8000) {
      return { error: "Daily calories should be between 800 and 8000 kcal, or left blank." };
    }
    kcal = parsed;
  }

  const band = bandForHours(hours);
  const isMasters = age >= MASTERS_AGE_YEARS;

  let gPerKg = band.gPerKg;
  if (energyDeficit) gPerKg += ENERGY_DEFICIT_BONUS_G_PER_KG;
  if (isMasters && gPerKg < MASTERS_FLOOR_G_PER_KG) gPerKg = MASTERS_FLOOR_G_PER_KG;
  gPerKg = Math.min(ATHLETE_MAX_G_PER_KG, Math.max(ATHLETE_MIN_G_PER_KG, gPerKg));

  const dailyTarget = gPerKg * weight;
  const dailyMin = ATHLETE_MIN_G_PER_KG * weight;
  const dailyMax = ATHLETE_MAX_G_PER_KG * weight;

  const postSessionDose = POST_SESSION_G_PER_KG * weight;
  const weeklyPostSessionTotal = postSessionDose * sessions;

  const perMeal = dailyTarget / mealCount;
  const perMealGPerKg = perMeal / weight;
  const perMealDoseG = PER_MEAL_MIN_G_PER_KG * weight;

  const proteinKcal = dailyTarget * KCAL_PER_G_PROTEIN;
  const proteinPctOfIntake = kcal === null ? null : (proteinKcal / kcal) * 100;

  const weeklyTarget = dailyTarget * 7;

  // Where the chosen rate sits inside the 1.2-2.0 g/kg band, as a percentage.
  const rangePositionPct = Math.max(
    0,
    Math.min(
      100,
      ((gPerKg - ATHLETE_MIN_G_PER_KG) / (ATHLETE_MAX_G_PER_KG - ATHLETE_MIN_G_PER_KG)) * 100,
    ),
  );

  const notes = [];
  if (energyDeficit) {
    notes.push(
      `Energy deficit adds ${ENERGY_DEFICIT_BONUS_G_PER_KG} g/kg, because protein needs rise when calories are restricted.`,
    );
  }
  if (isMasters && band.gPerKg < MASTERS_FLOOR_G_PER_KG) {
    notes.push(
      `Age ${round(age)} applies the masters floor of ${MASTERS_FLOOR_G_PER_KG} g/kg — older athletes respond less to small protein doses.`,
    );
  }
  if (perMealGPerKg < PER_MEAL_MIN_G_PER_KG) {
    notes.push(
      `Each meal is only ${round(perMealGPerKg, 2)} g/kg, below the 0.25 g/kg per-meal dose. Fewer, larger feeds would use the protein better.`,
    );
  }
  if (proteinPctOfIntake !== null && proteinPctOfIntake > AMDR_MAX_PCT) {
    notes.push(
      `Protein would be ${round(proteinPctOfIntake)}% of your stated calories, above the 10-35% AMDR — that usually means total calories are too low for the training load.`,
    );
  }
  if (proteinPctOfIntake !== null && proteinPctOfIntake < AMDR_MIN_PCT) {
    notes.push(
      `Protein is only ${round(proteinPctOfIntake)}% of your stated calories, under the 10% AMDR floor.`,
    );
  }
  if (hours >= 15) {
    notes.push(
      "At this volume, carbohydrate availability limits performance more than protein does — protein is a repair budget, not a fuel replacement.",
    );
  }

  return {
    weightKg: round(weight, 1),
    weeklyHours: round(hours, 1),
    bandId: band.id,
    bandLabel: band.label,
    bandGPerKg: band.gPerKg,
    isMasters,
    energyDeficit: Boolean(energyDeficit),
    gPerKg: round(gPerKg, 2),
    dailyTarget: round(dailyTarget),
    dailyMin: round(dailyMin),
    dailyMax: round(dailyMax),
    proteinKcal: round(proteinKcal),
    proteinPctOfIntake: proteinPctOfIntake === null ? null : round(proteinPctOfIntake, 1),
    dailyKcal: kcal === null ? null : round(kcal),
    postSessionDose: round(postSessionDose, 1),
    sessionsPerWeek: round(sessions),
    weeklyPostSessionTotal: round(weeklyPostSessionTotal),
    meals: mealCount,
    perMeal: round(perMeal, 1),
    perMealGPerKg: round(perMealGPerKg, 2),
    perMealDoseG: round(perMealDoseG, 1),
    meetsPerMealDose: perMealGPerKg >= PER_MEAL_MIN_G_PER_KG,
    weeklyTarget: round(weeklyTarget),
    rangePositionPct: round(rangePositionPct, 1),
    notes,
  };
}
