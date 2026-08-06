/**
 * Meal Plan Prompt Builder — pure logic.
 *
 * Real formulas used here:
 *  - Mifflin-St Jeor resting metabolic rate (Mifflin MD, St Jeor ST et al.,
 *    "A new predictive equation for resting energy expenditure in healthy
 *    individuals", Am J Clin Nutr 1990). It is the equation most dietetic
 *    bodies now recommend over the older Harris-Benedict.
 *  - Physical activity level (PAL) multipliers, the conventional
 *    1.2 / 1.375 / 1.55 / 1.725 / 1.9 ladder.
 *  - Atwater energy factors: 4 kcal per gram of protein, 4 per gram of
 *    carbohydrate, 9 per gram of fat.
 *
 * Everything is an estimate for planning, not clinical advice.
 * No React, no DOM, no Date.now().
 */

/** Mifflin-St Jeor constants. RMR = 10*kg + 6.25*cm - 5*age + sexOffset. */
export const MIFFLIN = { weight: 10, height: 6.25, age: 5, maleOffset: 5, femaleOffset: -161 };

/** Atwater energy factors, kcal per gram. */
export const KCAL_PER_G = { protein: 4, carbs: 4, fat: 9 };

export const SEXES = [
  { key: "male", label: "Male", offset: MIFFLIN.maleOffset },
  { key: "female", label: "Female", offset: MIFFLIN.femaleOffset },
];

/** Conventional PAL multipliers applied to resting metabolic rate. */
export const ACTIVITY_LEVELS = [
  { key: "sedentary", label: "Sedentary — desk job, little exercise", factor: 1.2 },
  { key: "light", label: "Light — exercise 1-3 days a week", factor: 1.375 },
  { key: "moderate", label: "Moderate — exercise 3-5 days a week", factor: 1.55 },
  { key: "active", label: "Active — exercise 6-7 days a week", factor: 1.725 },
  { key: "veryActive", label: "Very active — physical job or twice-daily training", factor: 1.9 },
];

/** Calorie adjustment as a share of maintenance. */
export const GOALS = [
  { key: "loseSlow", label: "Lose weight slowly", adjust: -0.15, note: "About 0.25-0.5 kg a week for most people." },
  { key: "lose", label: "Lose weight", adjust: -0.2, note: "A 20% deficit is the usual practical floor." },
  { key: "maintain", label: "Maintain", adjust: 0, note: "Energy in matches estimated expenditure." },
  { key: "gain", label: "Gain weight or build muscle", adjust: 0.1, note: "A small surplus limits fat gain." },
];

/**
 * Protein presets in grams per kilogram of body weight.
 * 0.8 g/kg is the adult Recommended Dietary Allowance; higher figures are the
 * ranges commonly used for active people and during weight loss.
 */
export const PROTEIN_PRESETS = [
  { key: "rda", label: "0.8 g/kg — the adult RDA", value: 0.8 },
  { key: "active", label: "1.2 g/kg — generally active", value: 1.2 },
  { key: "training", label: "1.6 g/kg — regular resistance training", value: 1.6 },
  { key: "cutting", label: "2.0 g/kg — training while in a deficit", value: 2.0 },
];

/** Share of daily calories from fat. 20-35% is the usual acceptable range. */
export const FAT_PERCENT_MIN = 20;
export const FAT_PERCENT_MAX = 40;
export const FAT_PERCENT_DEFAULT = 30;

/**
 * Calorie floors below which unsupervised dieting is generally discouraged.
 * These are the long-standing rule-of-thumb figures used in consumer guidance,
 * not a clinical threshold — anyone planning to eat below them should be under
 * professional supervision.
 */
export const CALORIE_FLOOR = { male: 1500, female: 1200 };

/** The nine major food allergens the US FDA requires to be labelled. */
export const MAJOR_ALLERGENS = [
  "Milk",
  "Eggs",
  "Fish",
  "Crustacean shellfish",
  "Tree nuts",
  "Peanuts",
  "Wheat",
  "Soybeans",
  "Sesame",
];

export const DIET_PATTERNS = [
  "No restriction",
  "Vegetarian",
  "Vegetarian with eggs",
  "Vegan",
  "Jain",
  "Pescatarian",
  "Halal",
  "Kosher",
  "Low carbohydrate",
  "Mediterranean",
];

export const CUISINES = [
  "North Indian",
  "South Indian",
  "Bengali",
  "Gujarati",
  "Maharashtrian",
  "Pan-Asian",
  "Mediterranean",
  "Middle Eastern",
  "Mexican",
  "Italian",
  "Mixed / no preference",
];

export const CURRENCIES = [
  { key: "INR", label: "₹ Indian rupee", locale: "en-IN" },
  { key: "USD", label: "$ US dollar", locale: "en-US" },
  { key: "GBP", label: "£ Pound sterling", locale: "en-GB" },
  { key: "EUR", label: "€ Euro", locale: "en-IE" },
  { key: "AED", label: "AED Dirham", locale: "en-AE" },
];

export const MEALS_PER_DAY_MIN = 1;
export const MEALS_PER_DAY_MAX = 6;
export const DAYS_MIN = 1;
export const DAYS_MAX = 14;

/**
 * Mifflin-St Jeor resting metabolic rate, kcal/day.
 * Returns { error } for impossible input; never NaN.
 */
export function computeRmr({ sex = "male", weightKg, heightCm, age } = {}) {
  const kg = Number(weightKg);
  const cm = Number(heightCm);
  const years = Number(age);

  if (![kg, cm, years].every(Number.isFinite)) {
    return { error: "Weight, height and age must all be numbers." };
  }
  if (kg < 25 || kg > 300) return { error: "Enter a body weight between 25 and 300 kg." };
  if (cm < 100 || cm > 250) return { error: "Enter a height between 100 and 250 cm." };
  if (years < 15 || years > 100) {
    return { error: "This estimate uses an adult equation — enter an age between 15 and 100." };
  }

  const entry = SEXES.find((item) => item.key === sex) || SEXES[0];
  const rmr =
    MIFFLIN.weight * kg + MIFFLIN.height * cm - MIFFLIN.age * years + entry.offset;

  return { rmr: Math.round(rmr), sexKey: entry.key };
}

/**
 * Full daily targets: maintenance, goal calories and macro grams.
 * Returns { error } for impossible input.
 */
export function computeTargets({
  sex = "male",
  weightKg,
  heightCm,
  age,
  activity = "moderate",
  goal = "maintain",
  proteinPerKg = 1.2,
  fatPercent = FAT_PERCENT_DEFAULT,
} = {}) {
  const base = computeRmr({ sex, weightKg, heightCm, age });
  if (base.error) return base;

  const level = ACTIVITY_LEVELS.find((item) => item.key === activity) || ACTIVITY_LEVELS[2];
  const goalEntry = GOALS.find((item) => item.key === goal) || GOALS[2];

  const protein = Number(proteinPerKg);
  const fatPct = Number(fatPercent);
  if (!Number.isFinite(protein) || protein <= 0 || protein > 3) {
    return { error: "Protein target must be between 0 and 3 grams per kilogram." };
  }
  if (!Number.isFinite(fatPct) || fatPct < FAT_PERCENT_MIN || fatPct > FAT_PERCENT_MAX) {
    return { error: `Fat should be between ${FAT_PERCENT_MIN}% and ${FAT_PERCENT_MAX}% of daily calories.` };
  }

  const maintenance = Math.round(base.rmr * level.factor);
  const calories = Math.round(maintenance * (1 + goalEntry.adjust));

  const proteinG = Math.round(protein * Number(weightKg));
  const fatG = Math.round((calories * (fatPct / 100)) / KCAL_PER_G.fat);
  const carbKcal = calories - proteinG * KCAL_PER_G.protein - fatG * KCAL_PER_G.fat;

  if (carbKcal < 0) {
    return {
      error:
        "Protein and fat alone already exceed the calorie target. Lower the protein per kilogram or the fat percentage.",
    };
  }

  const carbsG = Math.round(carbKcal / KCAL_PER_G.carbs);
  const floor = CALORIE_FLOOR[base.sexKey];

  return {
    rmr: base.rmr,
    maintenance,
    calories,
    activityFactor: level.factor,
    goalAdjust: goalEntry.adjust,
    goalNote: goalEntry.note,
    proteinG,
    fatG,
    carbsG,
    proteinKcal: proteinG * KCAL_PER_G.protein,
    fatKcal: fatG * KCAL_PER_G.fat,
    carbKcal,
    belowFloor: calories < floor,
    floor,
  };
}

/**
 * Split the daily calorie target across meals.
 * Uses the largest-remainder method so the per-meal figures sum to the total.
 */
export function splitAcrossMeals(calories, mealsPerDay) {
  const total = Math.round(Number(calories));
  const meals = Math.round(Number(mealsPerDay));
  if (!Number.isFinite(total) || total <= 0) return [];
  if (!Number.isFinite(meals) || meals < MEALS_PER_DAY_MIN || meals > MEALS_PER_DAY_MAX) return [];

  const base = Math.floor(total / meals);
  let remainder = total - base * meals;
  const out = [];
  for (let i = 0; i < meals; i += 1) {
    const extra = remainder > 0 ? 1 : 0;
    remainder -= extra;
    out.push({ meal: i + 1, calories: base + extra });
  }
  return out;
}

/**
 * Per-serving food budget.
 * Returns { error } for impossible input; never divides by zero.
 */
export function computeBudget({ totalBudget, people, mealsPerDay, days } = {}) {
  const budget = Number(totalBudget);
  const heads = Math.round(Number(people));
  const meals = Math.round(Number(mealsPerDay));
  const span = Math.round(Number(days));

  if (![budget, heads, meals, span].every(Number.isFinite)) {
    return { error: "Budget, number of people, meals per day and days must all be numbers." };
  }
  if (budget < 0) return { error: "Budget cannot be negative." };
  if (heads < 1 || heads > 20) return { error: "Enter between 1 and 20 people." };
  if (meals < MEALS_PER_DAY_MIN || meals > MEALS_PER_DAY_MAX) {
    return { error: `Meals per day must be between ${MEALS_PER_DAY_MIN} and ${MEALS_PER_DAY_MAX}.` };
  }
  if (span < DAYS_MIN || span > DAYS_MAX) {
    return { error: `Plan length must be between ${DAYS_MIN} and ${DAYS_MAX} days.` };
  }

  const servings = heads * meals * span;
  return {
    servings,
    people: heads,
    mealsPerDay: meals,
    days: span,
    totalBudget: budget,
    perServing: servings > 0 ? budget / servings : 0,
    perPersonPerDay: heads > 0 && span > 0 ? budget / (heads * span) : 0,
    unbudgeted: budget === 0,
  };
}

function splitRawLines(raw) {
  if (typeof raw !== "string") return [];
  const out = [];
  for (const line of raw.split(/[\n,]+/)) {
    const item = line
      .replace(/^\s+/, "")
      .replace(/^\d+[.)]\s+/, "")
      .replace(/^[-*•–]\s*/, "")
      .trim();
    if (!item) continue;
    out.push(item);
  }
  return out;
}

/** Split a textarea into a clean list of lines, capped at `max` items. */
export function parseLines(raw, max = 25) {
  return splitRawLines(raw).slice(0, max);
}

/**
 * Count every usable line in a textarea, ignoring the `parseLines` cap.
 * Used to warn the user when their input is being silently truncated.
 */
export function countLines(raw) {
  return splitRawLines(raw).length;
}

/** Assemble the prompt. Returns { error } for unusable input. */
export function buildMealPlanPrompt(input = {}) {
  const {
    sex = "male",
    weightKg = 70,
    heightCm = 172,
    age = 30,
    activity = "moderate",
    goal = "maintain",
    proteinPreset = "active",
    fatPercent = FAT_PERCENT_DEFAULT,
    people = 2,
    mealsPerDay = 3,
    days = 7,
    totalBudget = 0,
    currency = "INR",
    cuisine = "Mixed / no preference",
    diet = "No restriction",
    allergens = [],
    dislikesRaw = "",
    equipmentRaw = "",
    maxCookMinutes = 40,
    includeLeftovers = true,
  } = input;

  const proteinEntry = PROTEIN_PRESETS.find((entry) => entry.key === proteinPreset) || PROTEIN_PRESETS[1];
  const targets = computeTargets({
    sex,
    weightKg,
    heightCm,
    age,
    activity,
    goal,
    proteinPerKg: proteinEntry.value,
    fatPercent,
  });
  if (targets.error) return { error: targets.error };

  const budget = computeBudget({ totalBudget, people, mealsPerDay, days });
  if (budget.error) return { error: budget.error };

  const cookMinutes = Math.round(Number(maxCookMinutes));
  if (!Number.isFinite(cookMinutes) || cookMinutes < 5 || cookMinutes > 240) {
    return { error: "Maximum cooking time per meal must be between 5 and 240 minutes." };
  }

  const mealSplit = splitAcrossMeals(targets.calories, budget.mealsPerDay);
  const dislikes = parseLines(dislikesRaw);
  const equipment = parseLines(equipmentRaw);
  const dislikesTotal = countLines(dislikesRaw);
  const equipmentTotal = countLines(equipmentRaw);
  const dislikesTruncated = dislikesTotal > dislikes.length;
  const equipmentTruncated = equipmentTotal > equipment.length;
  const excluded = (Array.isArray(allergens) ? allergens : []).filter((item) =>
    MAJOR_ALLERGENS.includes(item),
  );
  const currencyEntry = CURRENCIES.find((entry) => entry.key === currency) || CURRENCIES[0];

  const lines = [];
  lines.push(
    `Build a ${budget.days}-day meal plan for ${budget.people} ${budget.people === 1 ? "person" : "people"}, ${budget.mealsPerDay} meal${budget.mealsPerDay === 1 ? "" : "s"} a day.`,
  );
  lines.push("");
  lines.push("SAFETY — READ FIRST");
  if (excluded.length) {
    lines.push(
      `- ALLERGEN EXCLUSIONS, ABSOLUTE: ${excluded.join(", ")}. Every ingredient, sauce, stock, garnish and serving suggestion must be free of these. Where a common version of a dish contains one, say so explicitly and give the substitution. Do not assume a brand is safe — tell me to check the label.`,
    );
  } else {
    lines.push("- No allergens declared. Do not assume that means none exist; flag common allergens in each dish.");
  }
  lines.push(
    "- This plan is not medical or dietetic advice. Do not offer any. If a request would need clinical supervision, say so plainly instead of complying.",
  );
  lines.push("");
  lines.push("DAILY TARGETS (estimates from the Mifflin-St Jeor equation, for planning only)");
  lines.push(`- Energy: ${targets.calories} kcal a day`);
  lines.push(`- Protein: ${targets.proteinG} g (${proteinEntry.label})`);
  lines.push(`- Fat: ${targets.fatG} g (${fatPercent}% of calories)`);
  lines.push(`- Carbohydrate: ${targets.carbsG} g (the remainder)`);
  lines.push(
    `- Per meal, roughly: ${mealSplit.map((entry) => `${entry.calories} kcal`).join(" / ")}`,
  );
  if (targets.belowFloor) {
    lines.push(
      `- NOTE: this target is below ${targets.floor} kcal. Do not design a plan at this level. Say so and suggest the person speak to a doctor or a registered dietitian first.`,
    );
  }
  lines.push("");
  lines.push("PREFERENCES AND CONSTRAINTS");
  lines.push(`- Eating pattern: ${diet}`);
  lines.push(`- Cuisine: ${cuisine}`);
  lines.push(`- Maximum hands-on cooking time per meal: ${cookMinutes} minutes`);
  if (dislikes.length) lines.push(`- Will not eat: ${dislikes.join(", ")}`);
  if (equipment.length) lines.push(`- Kitchen equipment available: ${equipment.join(", ")}`);
  lines.push(
    budget.unbudgeted
      ? "- No budget set. Keep ingredients ordinary and available in a normal supermarket."
      : `- Budget: ${currencyEntry.key} ${budget.totalBudget} in total, which is about ${currencyEntry.key} ${budget.perServing.toFixed(2)} per serving and ${currencyEntry.key} ${budget.perPersonPerDay.toFixed(2)} per person per day. Stay inside it.`,
  );
  lines.push(
    includeLeftovers
      ? "- Reuse ingredients across the week and plan deliberate leftovers so nothing is bought for a single dish."
      : "- No leftovers: every meal is cooked and eaten fresh.",
  );
  lines.push("");
  lines.push("RULES");
  lines.push(
    "1. Every dish needs: name, hands-on time, total time, ingredients with quantities for the stated number of people, and the method in numbered steps.",
  );
  lines.push(
    "2. Give per-serving energy and protein for each dish, and a daily total. Say plainly that these are estimates.",
  );
  lines.push(
    "3. Do not exceed the daily energy target by more than 5% on any day, and do not fall short of the protein target.",
  );
  lines.push(
    "4. Use ingredients that a normal supermarket stocks. If an ingredient is regional or seasonal, name a substitute.",
  );
  lines.push("5. Repeat no main dish twice in the same plan.");
  lines.push(
    "6. Invent no nutrition figures with false precision — round energy to the nearest 10 kcal and protein to the nearest gram.",
  );
  lines.push("");
  lines.push("OUTPUT");
  lines.push(
    "A day-by-day table of meals, then a consolidated shopping list grouped by supermarket section with quantities, then a short prep-ahead list of anything worth batch-cooking. End with a one-line reminder to check labels for the declared allergens.",
  );

  const prompt = lines.join("\n");

  return {
    prompt,
    targets,
    budget,
    mealSplit,
    excluded,
    dislikes,
    equipment,
    dislikesTotal,
    equipmentTotal,
    dislikesTruncated,
    equipmentTruncated,
    proteinEntry,
    currency: currencyEntry,
    cookMinutes,
    charCount: prompt.length,
  };
}
