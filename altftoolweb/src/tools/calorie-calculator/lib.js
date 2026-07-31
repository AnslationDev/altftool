/**
 * Calorie & macro calculator — pure calculation logic.
 *
 * Kept separate from pages/index.jsx so the Mifflin-St Jeor + goal-adjustment
 * math can be unit-tested and reasoned about without a React/DOM environment.
 */

export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const GOAL_ADJUSTMENTS = {
  lose_fast: -500,
  lose_slow: -250,
  maintain: 0,
  gain_slow: 250,
  gain_fast: 500,
};

/**
 * Widely-cited very-low-calorie-diet thresholds (NHS, Mayo Clinic, and most
 * dietetic guidance): adults should not be steered below roughly 1200 kcal/day
 * (women) or 1500 kcal/day (men) without medical supervision. Below this a
 * calorie target risks inadequate micronutrient intake and is not a safe
 * unsupervised recommendation.
 */
export const SAFE_MIN_CALORIES = {
  male: 1500,
  female: 1200,
};
export const SAFE_MIN_CALORIES_DEFAULT = 1200;

/**
 * Compute BMR, TDEE, a goal-adjusted daily calorie target and a macro split.
 * The displayed target/macros are clamped to a safe floor so unsafe or
 * negative numbers are never shown; `belowSafeMinimum` tells the caller when
 * that clamp was applied so a warning can be surfaced.
 */
export function calculateCalorieResult({ age, gender, height, weight, activity, goal }) {
  // Mifflin-St Jeor Equation
  let bmr = 10 * Number(weight) + 6.25 * Number(height) - 5 * Number(age);
  bmr += gender === "male" ? 5 : -161;

  const tdee = bmr * ACTIVITY_MULTIPLIERS[activity];
  const rawTargetCalories = Math.round(tdee + GOAL_ADJUSTMENTS[goal]);

  const safeMinCalories = SAFE_MIN_CALORIES[gender] ?? SAFE_MIN_CALORIES_DEFAULT;
  const belowSafeMinimum = rawTargetCalories < safeMinCalories;
  const targetCalories = belowSafeMinimum ? safeMinCalories : rawTargetCalories;

  // Macros: 40% Carbs, 30% Protein, 30% Fats (General Split), derived from the
  // clamped target so displayed grams can never be negative or unsafely low.
  const proteinCals = targetCalories * 0.3;
  const fatCals = targetCalories * 0.3;
  const carbCals = targetCalories * 0.4;

  const macros = {
    protein: Math.round(proteinCals / 4), // 4 cals per gram
    fats: Math.round(fatCals / 9), // 9 cals per gram
    carbs: Math.round(carbCals / 4), // 4 cals per gram
  };

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories,
    rawTargetCalories,
    safeMinCalories,
    belowSafeMinimum,
    macros,
  };
}
