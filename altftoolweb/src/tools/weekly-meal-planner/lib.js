/**
 * Weekly meal planner — energy, macronutrient and shopping-list arithmetic.
 *
 * Calories are derived from grams, never entered separately, so the numbers
 * always agree with each other.
 *
 * Two quantities are deliberately separate: the macros on a meal are what ONE
 * person eats (they drive the day's energy total), while `servings` is how many
 * portions you cook (it only scales the shopping list).
 */

/**
 * Atwater general factors (FAO Food Energy report 77, 2003):
 * protein 4 kcal/g, carbohydrate 4 kcal/g, fat 9 kcal/g.
 */
export const KCAL_PER_G_PROTEIN = 4;
export const KCAL_PER_G_CARB = 4;
export const KCAL_PER_G_FAT = 9;

/**
 * Acceptable Macronutrient Distribution Ranges for adults, as percentages of
 * total energy (Institute of Medicine, Dietary Reference Intakes, 2005).
 */
export const AMDR = {
  carbs: { min: 45, max: 65 },
  protein: { min: 10, max: 35 },
  fat: { min: 20, max: 35 },
};

/** A day is flagged when it is more than this far from the calorie target. */
export const CALORIE_TOLERANCE_PERCENT = 10;

/** Sensible bounds so a typo cannot produce a nonsense week. */
export const MIN_CALORIE_TARGET = 1000;
export const MAX_CALORIE_TARGET = 6000;

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const MEAL_SLOTS = [
  { id: "breakfast", label: "Breakfast" },
  { id: "lunch", label: "Lunch" },
  { id: "dinner", label: "Dinner" },
  { id: "snack", label: "Snack" },
];

/** Units the shopping list can add together. Anything else is kept as written. */
export const KNOWN_UNITS = ["g", "kg", "ml", "l", "tbsp", "tsp", "cup", "cups", "clove", "cloves", "pc", "pcs"];

const UNIT_SET = new Set(KNOWN_UNITS);

/** Energy from macros, Atwater factors. */
export function caloriesFromMacros({ protein = 0, carbs = 0, fat = 0 } = {}) {
  return (
    protein * KCAL_PER_G_PROTEIN + carbs * KCAL_PER_G_CARB + fat * KCAL_PER_G_FAT
  );
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

/**
 * Parse one shopping line. Accepts "200 g rice", "2 cloves garlic" or "olive oil".
 * @returns {{quantity:number|null, unit:string, name:string}}
 */
export function parseIngredientLine(line) {
  const text = String(line).trim();
  if (!text) return null;

  const match = /^(\d+(?:[.,]\d+)?)\s*([A-Za-z]+)?\s+(.*)$/.exec(text);
  if (!match) return { quantity: null, unit: "", name: text };

  const quantity = Number(match[1].replace(",", "."));
  const maybeUnit = (match[2] || "").toLowerCase();
  if (maybeUnit && UNIT_SET.has(maybeUnit)) {
    return { quantity, unit: maybeUnit, name: match[3].trim() };
  }
  // No recognised unit: the second token is part of the name ("2 onions").
  return { quantity, unit: "", name: `${match[2] ? `${match[2]} ` : ""}${match[3]}`.trim() };
}

/**
 * Aggregate every meal's ingredients into one shopping list.
 * Quantities only combine when the name and unit both match.
 */
export function buildShoppingList(meals = []) {
  const totals = new Map();

  for (const meal of meals) {
    const servings = toNumber(meal?.servings) || 1;
    for (const line of String(meal?.ingredients ?? "").split("\n")) {
      const parsed = parseIngredientLine(line);
      if (!parsed) continue;
      const key = `${parsed.name.toLowerCase()}|${parsed.unit}`;
      const existing = totals.get(key);
      const quantity = parsed.quantity === null ? null : parsed.quantity * servings;
      if (!existing) {
        totals.set(key, { name: parsed.name, unit: parsed.unit, quantity, mentions: 1 });
      } else {
        existing.mentions += 1;
        if (existing.quantity !== null && quantity !== null) existing.quantity += quantity;
        else existing.quantity = null;
      }
    }
  }

  return [...totals.values()]
    .map((entry) => ({
      ...entry,
      quantity: entry.quantity === null ? null : Number(entry.quantity.toFixed(2)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function macroPercents(protein, carbs, fat, kcal) {
  if (kcal <= 0) return { protein: 0, carbs: 0, fat: 0 };
  return {
    protein: Number((((protein * KCAL_PER_G_PROTEIN) / kcal) * 100).toFixed(1)),
    carbs: Number((((carbs * KCAL_PER_G_CARB) / kcal) * 100).toFixed(1)),
    fat: Number((((fat * KCAL_PER_G_FAT) / kcal) * 100).toFixed(1)),
  };
}

/**
 * Cost out a whole week.
 * @param {{meals:Array, calorieTarget:number}} input
 * @returns {object|{error:string}}
 */
export function planWeek({ meals = [], calorieTarget = 2000 } = {}) {
  const target = toNumber(calorieTarget);
  if (target === null) return { error: "The daily calorie target must be a number." };
  if (target < MIN_CALORIE_TARGET || target > MAX_CALORIE_TARGET) {
    return {
      error: `A daily target of ${Math.round(target)} kcal is outside the ${MIN_CALORIE_TARGET}-${MAX_CALORIE_TARGET} kcal range this planner supports.`,
    };
  }
  if (!Array.isArray(meals)) return { error: "Meals must be a list." };
  if (meals.length === 0) return { error: "Add at least one meal to plan the week." };

  const normalised = [];
  for (const meal of meals) {
    const name = String(meal?.name ?? "").trim();
    if (!name) continue;
    if (!DAYS.includes(meal?.day)) {
      return { error: `"${name}" is assigned to an unknown day.` };
    }
    const protein = toNumber(meal?.protein);
    const carbs = toNumber(meal?.carbs);
    const fat = toNumber(meal?.fat);
    const servings = toNumber(meal?.servings);
    if (protein === null || carbs === null || fat === null) {
      return { error: `"${name}" has a negative or non-numeric macro value.` };
    }
    if (servings === null || servings === 0) {
      return { error: `"${name}" needs a serving count above zero.` };
    }
    const kcal = caloriesFromMacros({ protein, carbs, fat });
    normalised.push({ ...meal, name, protein, carbs, fat, servings, kcal });
  }

  if (normalised.length === 0) return { error: "Every meal needs a name." };

  const byDay = DAYS.map((day) => {
    const dayMeals = normalised.filter((meal) => meal.day === day);
    const protein = dayMeals.reduce((sum, meal) => sum + meal.protein, 0);
    const carbs = dayMeals.reduce((sum, meal) => sum + meal.carbs, 0);
    const fat = dayMeals.reduce((sum, meal) => sum + meal.fat, 0);
    const kcal = caloriesFromMacros({ protein, carbs, fat });
    const filledSlots = new Set(dayMeals.map((meal) => meal.slot));
    return {
      day,
      meals: dayMeals,
      protein: Number(protein.toFixed(1)),
      carbs: Number(carbs.toFixed(1)),
      fat: Number(fat.toFixed(1)),
      kcal: Math.round(kcal),
      percents: macroPercents(protein, carbs, fat, kcal),
      missingSlots: MEAL_SLOTS.filter((slot) => slot.id !== "snack" && !filledSlots.has(slot.id)).map(
        (slot) => slot.label
      ),
      deltaFromTarget: Math.round(kcal - target),
      overTolerance:
        dayMeals.length > 0 &&
        (Math.abs(kcal - target) / target) * 100 > CALORIE_TOLERANCE_PERCENT,
    };
  });

  const plannedDays = byDay.filter((day) => day.meals.length > 0);
  const weekKcal = byDay.reduce((sum, day) => sum + day.kcal, 0);
  const weekProtein = byDay.reduce((sum, day) => sum + day.protein, 0);
  const weekCarbs = byDay.reduce((sum, day) => sum + day.carbs, 0);
  const weekFat = byDay.reduce((sum, day) => sum + day.fat, 0);

  const warnings = [];
  for (const day of plannedDays) {
    const driftPercent = (Math.abs(day.deltaFromTarget) / target) * 100;
    if (driftPercent > CALORIE_TOLERANCE_PERCENT) {
      warnings.push(
        `${day.day}: ${day.kcal} kcal is ${day.deltaFromTarget > 0 ? "over" : "under"} the ${target} kcal target by ${Math.abs(day.deltaFromTarget)} kcal.`
      );
    }
    if (day.missingSlots.length > 0) {
      warnings.push(`${day.day}: no ${day.missingSlots.join(" or ").toLowerCase()} planned.`);
    }
    for (const [key, range] of Object.entries(AMDR)) {
      const value = day.percents[key];
      if (value < range.min || value > range.max) {
        warnings.push(
          `${day.day}: ${key} is ${value}% of energy, outside the ${range.min}-${range.max}% AMDR range.`
        );
      }
    }
  }
  const emptyDays = byDay.filter((day) => day.meals.length === 0).map((day) => day.day);
  if (emptyDays.length > 0) {
    warnings.push(`No meals planned for ${emptyDays.join(", ")}.`);
  }

  // Repeated dishes are the batch-cooking opportunities.
  const nameCounts = new Map();
  for (const meal of normalised) {
    const key = meal.name.toLowerCase();
    nameCounts.set(key, (nameCounts.get(key) || 0) + 1);
  }
  const batchCandidates = [...nameCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return {
    target,
    byDay,
    plannedDayCount: plannedDays.length,
    weekKcal: Math.round(weekKcal),
    weekProtein: Number(weekProtein.toFixed(1)),
    weekCarbs: Number(weekCarbs.toFixed(1)),
    weekFat: Number(weekFat.toFixed(1)),
    averageKcal: plannedDays.length
      ? Math.round(weekKcal / plannedDays.length)
      : 0,
    weekPercents: macroPercents(weekProtein, weekCarbs, weekFat, weekKcal),
    mealCount: normalised.length,
    batchCandidates,
    shoppingList: buildShoppingList(normalised),
    warnings,
  };
}

/** Markdown plan plus shopping list, ready to paste into notes. */
export function buildPlanText(plan) {
  if (!plan || plan.error) return { error: plan?.error || "Nothing to export yet." };

  const lines = [
    `# Weekly meal plan`,
    ``,
    `Target ${plan.target} kcal/day · ${plan.plannedDayCount} day(s) planned · average ${plan.averageKcal} kcal`,
    ``,
  ];

  for (const day of plan.byDay) {
    if (day.meals.length === 0) continue;
    lines.push(`## ${day.day} — ${day.kcal} kcal (P ${day.protein}g / C ${day.carbs}g / F ${day.fat}g)`);
    for (const slot of MEAL_SLOTS) {
      for (const meal of day.meals.filter((entry) => entry.slot === slot.id)) {
        lines.push(`- ${slot.label}: ${meal.name} — ${Math.round(meal.kcal)} kcal`);
      }
    }
    lines.push("");
  }

  lines.push(`## Shopping list`, ``);
  for (const item of plan.shoppingList) {
    const amount = item.quantity === null ? "" : `${item.quantity}${item.unit ? ` ${item.unit}` : ""} `;
    lines.push(`- ${amount}${item.name}`);
  }

  if (plan.warnings.length) {
    lines.push("", "## Notes", "");
    for (const warning of plan.warnings) lines.push(`- ${warning}`);
  }

  return { text: lines.join("\n") };
}
