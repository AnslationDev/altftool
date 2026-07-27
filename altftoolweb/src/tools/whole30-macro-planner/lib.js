/**
 * Whole30 macro planner.
 *
 * Whole30 itself asks you NOT to count calories or weigh food - it is an
 * elimination programme built around a plate template. This planner therefore
 * works the way the programme does: you decide the plant food (vegetables and
 * fruit), protein is set per kilogram of body weight, and dietary fat is the
 * energy dial that closes the gap to your calorie needs. The grams are then
 * converted back into the template's own units - palms of protein, cups of
 * vegetables and "fat portions" - so you can eat by the template and still know
 * roughly where the numbers land.
 *
 * Energy
 * ------
 * Mifflin-St Jeor resting metabolic rate (Am J Clin Nutr 1990;51:241-247):
 *   men   BMR = 10*kg + 6.25*cm - 5*age + 5
 *   women BMR = 10*kg + 6.25*cm - 5*age - 161
 * multiplied by an activity factor to get maintenance energy.
 *
 * Macro maths (Atwater factors: 4 kcal/g carb, 4 kcal/g protein, 9 kcal/g fat)
 *   carb grams   = fruit servings x 15 + starchy veg cups x 27 + non-starchy cups x 5
 *   protein g    = protein per kg x body weight
 *   fat kcal     = target kcal - carb kcal - protein kcal
 *
 * Whole30 protein foods are rarely lean, so part of the fat arrives inside the
 * protein itself. Roughly 0.4 g of fat rides along with every 1 g of protein in a
 * mixed intake of eggs, chicken thigh, mince, salmon and pork (100 g cooked
 * chicken thigh is about 26 g protein and 11 g fat). Subtracting that gives the
 * ADDED fat - oil, ghee, avocado, olives, nuts, coconut milk - which is what the
 * meal template actually asks you to portion out.
 *
 * Informational only. Whole30 removes whole food groups for 30 days; check with a
 * doctor or dietitian first if you are pregnant, breastfeeding, managing diabetes
 * or have a history of disordered eating.
 */

/** Mifflin-St Jeor sex constants. */
export const MIFFLIN_OFFSET = { male: 5, female: -161 };

/** Physical-activity factors applied to BMR. */
export const ACTIVITY_FACTORS = {
  sedentary: { factor: 1.2, label: "Sedentary (desk job, little exercise)" },
  light: { factor: 1.375, label: "Lightly active (1-3 sessions a week)" },
  moderate: { factor: 1.55, label: "Moderately active (3-5 sessions a week)" },
  very: { factor: 1.725, label: "Very active (6-7 sessions a week)" },
  athlete: { factor: 1.9, label: "Athlete (twice-daily or physical job)" },
};

/** Goal adjustment applied to maintenance energy. */
export const GOALS = {
  lose: { adjust: -0.15, label: "Lose fat (15% below maintenance)" },
  gentle: { adjust: -0.1, label: "Lose slowly (10% below maintenance)" },
  maintain: { adjust: 0, label: "Maintain / reset (no deficit)" },
  gain: { adjust: 0.1, label: "Gain (10% above maintenance)" },
};

/** Energy per gram, Atwater factors. */
export const KCAL_PER_GRAM = { carb: 4, protein: 4, fat: 9 };

/** The programme runs for 30 consecutive days with no slips. */
export const PROGRAM_DAYS = 30;

/** Whole30 asks for three composed meals a day and discourages snacking. */
export const MEALS_PER_DAY = 3;

/**
 * Carbohydrate content of the template's plant portions.
 * fruitServing:  one standard fruit exchange, about 15 g carbohydrate.
 * starchyVegCup: 1 cup cooked sweet potato / winter squash / plantain, about 27 g.
 * vegCup:        1 cup mixed non-starchy vegetables, about 5 g.
 */
export const CARB_PER_PORTION = { fruitServing: 15, starchyVegCup: 27, vegCup: 5 };

/** A palm-sized cooked protein portion supplies roughly 25 g of protein. */
export const PALM_PROTEIN_G = 25;

/**
 * One template fat portion averages about 20 g of fat: 1-2 thumbs of oil or ghee
 * (14-28 g), half to one avocado (15-29 g), a closed handful of nuts (about 20 g)
 * or a quarter can of coconut milk (about 15 g).
 */
export const FAT_PORTION_G = 20;

/** Grams of fat that travel with each gram of protein in typical Whole30 protein foods. */
export const INHERENT_FAT_PER_G_PROTEIN = 0.4;

/** The template allows one to two added-fat portions per meal. */
export const FAT_PORTIONS_PER_MEAL = { min: 1, max: 2 };

/** Foods removed for the full 30 days. */
export const EXCLUDED_FOODS = [
  ["Added sugar", "Cane sugar, honey, maple syrup, agave, coconut sugar and all artificial sweeteners."],
  ["Alcohol", "In any form, including as a cooking ingredient such as wine in a sauce."],
  ["Grains", "Wheat, rice, oats, corn, quinoa, millet, rye, barley and anything milled from them."],
  ["Legumes", "All beans and lentils, chickpeas, soy, peanuts and peanut butter."],
  ["Dairy", "Milk, curd, cheese, paneer, cream and butter (clarified butter/ghee is allowed)."],
  ["Recreated treats", "Pancakes, breads, chips or desserts rebuilt from compliant ingredients."],
];

/** Foods that stay in, including the exceptions people most often get wrong. */
export const ALLOWED_FOODS = [
  ["All meat, fish, eggs and seafood", "Choose whole cuts; check cured meats for added sugar."],
  ["Vegetables of every kind", "Including potatoes and other starchy vegetables."],
  ["Fruit", "Whole fruit is allowed; fruit juice may be used as a sweetener."],
  ["Ghee and clarified butter", "The milk solids that make dairy a problem have been removed."],
  ["Green beans, snow peas, sugar snap peas", "Legumes botanically, but permitted by the rules."],
  ["Coconut aminos, vinegars, most nuts and seeds", "Malt vinegar is out because it is grain-derived."],
];

/** Accepted input ranges. */
export const LIMITS = {
  age: { min: 18, max: 100 },
  weightKg: { min: 35, max: 250 },
  heightCm: { min: 130, max: 230 },
  proteinPerKg: { min: 1, max: 2.5 },
  fruitServings: { min: 0, max: 6 },
  starchyVegCups: { min: 0, max: 6 },
  vegCups: { min: 2, max: 15 },
  day: { min: 1, max: PROGRAM_DAYS },
};

/**
 * Mifflin-St Jeor resting metabolic rate, kcal/day.
 */
export function basalMetabolicRate(sex, weightKg, heightCm, age) {
  const offset = MIFFLIN_OFFSET[sex];
  if (offset === undefined) return null;
  return 10 * weightKg + 6.25 * heightCm - 5 * age + offset;
}

/** Carbohydrate grams implied by a day of template plant portions. */
export function carbsFromPlants({ fruitServings, starchyVegCups, vegCups }) {
  return (
    fruitServings * CARB_PER_PORTION.fruitServing +
    starchyVegCups * CARB_PER_PORTION.starchyVegCup +
    vegCups * CARB_PER_PORTION.vegCup
  );
}

/**
 * Progress through the 30 days. Pure - the current day is passed in.
 * @param {number} day 1-based day number
 */
export function programProgress(day) {
  if (typeof day !== "number" || !Number.isFinite(day)) return null;
  const clamped = Math.min(Math.max(Math.floor(day), LIMITS.day.min), LIMITS.day.max);
  return {
    day: clamped,
    daysRemaining: PROGRAM_DAYS - clamped,
    percentComplete: (clamped / PROGRAM_DAYS) * 100,
    reintroductionStarts: clamped >= PROGRAM_DAYS,
  };
}

/**
 * Full Whole30 day plan.
 *
 * @param {object} input
 * @param {"male"|"female"} input.sex
 * @param {number} input.age              years
 * @param {number} input.weightKg
 * @param {number} input.heightCm
 * @param {string} input.activity         key of ACTIVITY_FACTORS
 * @param {string} input.goal             key of GOALS
 * @param {number} input.proteinPerKg     g protein per kg body weight
 * @param {number} input.fruitServings    fruit exchanges per day
 * @param {number} input.starchyVegCups   cups of cooked starchy vegetable per day
 * @param {number} input.vegCups          cups of non-starchy vegetable per day
 * @param {number} [input.day]            day number of the 30, 1-based
 * @returns {object} plan or { error }
 */
export function whole30Plan({
  sex,
  age,
  weightKg,
  heightCm,
  activity,
  goal = "maintain",
  proteinPerKg = 1.6,
  fruitServings = 2,
  starchyVegCups = 2,
  vegCups = 6,
  day = 1,
}) {
  if (sex !== "male" && sex !== "female") {
    return { error: "Choose male or female so the correct BMR equation is used." };
  }
  const fields = {
    age,
    weightKg,
    heightCm,
    proteinPerKg,
    fruitServings,
    starchyVegCups,
    vegCups,
    day,
  };
  for (const [key, value] of Object.entries(fields)) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return { error: `Enter a valid number for ${key}.` };
    }
  }
  if (age < LIMITS.age.min || age > LIMITS.age.max) {
    return { error: `Age must be between ${LIMITS.age.min} and ${LIMITS.age.max} years.` };
  }
  if (weightKg < LIMITS.weightKg.min || weightKg > LIMITS.weightKg.max) {
    return { error: `Weight must be between ${LIMITS.weightKg.min} and ${LIMITS.weightKg.max} kg.` };
  }
  if (heightCm < LIMITS.heightCm.min || heightCm > LIMITS.heightCm.max) {
    return { error: `Height must be between ${LIMITS.heightCm.min} and ${LIMITS.heightCm.max} cm.` };
  }
  if (proteinPerKg < LIMITS.proteinPerKg.min || proteinPerKg > LIMITS.proteinPerKg.max) {
    return {
      error: `Protein must be between ${LIMITS.proteinPerKg.min} and ${LIMITS.proteinPerKg.max} g per kg.`,
    };
  }
  if (fruitServings < LIMITS.fruitServings.min || fruitServings > LIMITS.fruitServings.max) {
    return { error: `Fruit servings must be between 0 and ${LIMITS.fruitServings.max} a day.` };
  }
  if (starchyVegCups < LIMITS.starchyVegCups.min || starchyVegCups > LIMITS.starchyVegCups.max) {
    return { error: `Starchy vegetables must be between 0 and ${LIMITS.starchyVegCups.max} cups a day.` };
  }
  if (vegCups < LIMITS.vegCups.min || vegCups > LIMITS.vegCups.max) {
    return {
      error: `Non-starchy vegetables must be between ${LIMITS.vegCups.min} and ${LIMITS.vegCups.max} cups a day.`,
    };
  }
  const activityDef = ACTIVITY_FACTORS[activity];
  if (!activityDef) return { error: "Choose an activity level." };
  const goalDef = GOALS[goal];
  if (!goalDef) return { error: "Choose a goal." };

  const bmr = basalMetabolicRate(sex, weightKg, heightCm, age);
  const tdee = bmr * activityDef.factor;
  const calories = tdee * (1 + goalDef.adjust);

  const carbGrams = carbsFromPlants({ fruitServings, starchyVegCups, vegCups });
  const proteinGrams = proteinPerKg * weightKg;
  const carbKcal = carbGrams * KCAL_PER_GRAM.carb;
  const proteinKcal = proteinGrams * KCAL_PER_GRAM.protein;
  const fatKcal = calories - carbKcal - proteinKcal;

  if (fatKcal <= 0) {
    return {
      error:
        "Protein and plant carbs already use up the whole calorie target, leaving no room for cooking fat. Cut a fruit or starchy vegetable serving, or lower protein per kg.",
    };
  }

  const fatGrams = fatKcal / KCAL_PER_GRAM.fat;
  const inherentFatGrams = proteinGrams * INHERENT_FAT_PER_G_PROTEIN;
  const addedFatGrams = fatGrams - inherentFatGrams;
  const addedFatPortions = addedFatGrams / FAT_PORTION_G;
  const fatPortionsPerMeal = addedFatPortions / MEALS_PER_DAY;

  return {
    bmr,
    tdee,
    calories,
    carbGrams,
    proteinGrams,
    fatGrams,
    carbKcal,
    proteinKcal,
    fatKcal,
    carbShare: carbKcal / calories,
    proteinShare: proteinKcal / calories,
    fatShare: fatKcal / calories,
    inherentFatGrams,
    addedFatGrams,
    addedFatPortions,
    fatPortionsPerMeal,
    // Template units, per meal, across three meals a day.
    palmsPerMeal: proteinGrams / PALM_PROTEIN_G / MEALS_PER_DAY,
    palmsPerDay: proteinGrams / PALM_PROTEIN_G,
    vegCupsPerMeal: vegCups / MEALS_PER_DAY,
    fruitServings,
    starchyVegCups,
    vegCups,
    // Flags
    addedFatNegative: addedFatGrams <= 0,
    fatAboveTemplate: fatPortionsPerMeal > FAT_PORTIONS_PER_MEAL.max,
    fatBelowTemplate: addedFatGrams > 0 && fatPortionsPerMeal < FAT_PORTIONS_PER_MEAL.min,
    progress: programProgress(day),
  };
}
