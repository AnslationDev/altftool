/**
 * 5:2 intermittent fasting week planner.
 *
 * The 5:2 pattern, as originally described, means eating normally on five days
 * of the week and restricting intake to about 500 kcal (women) or 600 kcal
 * (men) on two non-consecutive days. Everything below follows from that:
 *
 *  - Weekly intake = 5 x normal-day calories + 2 x restricted-day calories.
 *  - Weekly deficit against maintenance = 7 x maintenance - weekly intake,
 *    which simplifies to 2 x (maintenance - restricted-day calories) when the
 *    five normal days are eaten at maintenance.
 *  - Body fat stores roughly 7700 kcal per kilogram, the figure conventionally
 *    used to convert an energy deficit into an expected rate of loss. Real
 *    losses run below this early on because of water and glycogen shifts, and
 *    slow as bodyweight and maintenance calories fall.
 *  - Maintenance calories are estimated with the Mifflin-St Jeor equation, the
 *    predictive equation most widely recommended for healthy adults:
 *      BMR = 10 x weight(kg) + 6.25 x height(cm) - 5 x age + 5   (men)
 *      BMR = 10 x weight(kg) + 6.25 x height(cm) - 5 x age - 161 (women)
 *    multiplied by an activity factor.
 *  - The two restricted days should be non-consecutive, which is what keeps the
 *    pattern tolerable and leaves normal eating between them.
 *  - A rate of loss of about 0.5 to 1 kg a week is the usual recommended range;
 *    faster than that is flagged.
 */

/** Restricted-day calorie allowance, by reference band. */
export const FAST_DAY_KCAL = Object.freeze({ male: 600, female: 500 });

/** Energy stored in a kilogram of body fat, kcal. */
export const KCAL_PER_KG_FAT = 7700;

/** Usual recommended weekly rate of weight loss, kg. */
export const SAFE_LOSS_MIN_KG_PER_WEEK = 0.5;
export const SAFE_LOSS_MAX_KG_PER_WEEK = 1.0;

/** Days of the week, Monday first. */
export const DAYS = Object.freeze([
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]);

/** Number of restricted days in the 5:2 pattern. */
export const FAST_DAYS_PER_WEEK = 2;

/** Mifflin-St Jeor activity factors. */
export const ACTIVITY_LEVELS = Object.freeze([
  { key: "sedentary", label: "Sedentary — desk job, little exercise", factor: 1.2 },
  { key: "light", label: "Lightly active — 1-3 sessions a week", factor: 1.375 },
  { key: "moderate", label: "Moderately active — 3-5 sessions a week", factor: 1.55 },
  { key: "very", label: "Very active — 6-7 sessions a week", factor: 1.725 },
  { key: "extra", label: "Extremely active — physical job or twice daily", factor: 1.9 },
]);

/** How the restricted-day allowance is split between two small meals. */
export const FAST_DAY_MEAL_SPLIT = Object.freeze([0.4, 0.6]);

/** Input sanity bounds. */
export const LIMITS = Object.freeze({
  weightKgMin: 25,
  weightKgMax: 300,
  heightCmMin: 100,
  heightCmMax: 250,
  ageMin: 18,
  ageMax: 100,
  maintenanceMin: 800,
  maintenanceMax: 6000,
});

/** Mifflin-St Jeor basal metabolic rate, kcal per day. */
export function mifflinStJeorBmr({ sex, weightKg, heightCm, age }) {
  if (![weightKg, heightCm, age].every(Number.isFinite)) return NaN;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

export function activityFactor(key) {
  const level = ACTIVITY_LEVELS.find((item) => item.key === key);
  return level ? level.factor : NaN;
}

/** True when two day indexes sit next to each other on a repeating week. */
export function areConsecutive(indexA, indexB) {
  if (!Number.isInteger(indexA) || !Number.isInteger(indexB)) return false;
  const gap = Math.abs(indexA - indexB);
  return gap === 1 || gap === DAYS.length - 1;
}

/**
 * Plan a 5:2 week.
 *
 * @param {object} input
 * @param {string} input.sex             "male" | "female".
 * @param {string} input.maintenanceMode "calculate" | "manual".
 * @param {number} [input.weightKg]      Required when calculating.
 * @param {number} [input.heightCm]      Required when calculating.
 * @param {number} [input.age]           Required when calculating.
 * @param {string} [input.activity]      Activity key, required when calculating.
 * @param {number} [input.maintenanceKcal] Required when entered manually.
 * @param {number[]} input.fastDayIndexes Two indexes into DAYS.
 * @returns {object|{error:string}}
 */
export function planFiveTwoWeek(input) {
  const {
    sex,
    maintenanceMode,
    weightKg,
    heightCm,
    age,
    activity,
    maintenanceKcal,
    fastDayIndexes,
  } = input || {};

  if (sex !== "male" && sex !== "female") {
    return { error: "Choose which restricted-day allowance applies: 600 kcal or 500 kcal." };
  }

  let maintenance;
  let bmr = null;
  if (maintenanceMode === "manual") {
    maintenance = Number(maintenanceKcal);
    if (!Number.isFinite(maintenance)) return { error: "Enter your maintenance calories." };
    if (maintenance < LIMITS.maintenanceMin || maintenance > LIMITS.maintenanceMax) {
      return { error: `Maintenance calories should be between ${LIMITS.maintenanceMin} and ${LIMITS.maintenanceMax} kcal a day.` };
    }
  } else if (maintenanceMode === "calculate") {
    const w = Number(weightKg);
    const h = Number(heightCm);
    const a = Number(age);
    if (!Number.isFinite(w) || w < LIMITS.weightKgMin || w > LIMITS.weightKgMax) {
      return { error: `Enter a weight between ${LIMITS.weightKgMin} and ${LIMITS.weightKgMax} kg.` };
    }
    if (!Number.isFinite(h) || h < LIMITS.heightCmMin || h > LIMITS.heightCmMax) {
      return { error: `Enter a height between ${LIMITS.heightCmMin} and ${LIMITS.heightCmMax} cm.` };
    }
    if (!Number.isFinite(a) || a < LIMITS.ageMin || a > LIMITS.ageMax) {
      return { error: `This planner is for adults aged ${LIMITS.ageMin} to ${LIMITS.ageMax}.` };
    }
    const factor = activityFactor(activity);
    if (!Number.isFinite(factor)) return { error: "Choose an activity level." };
    bmr = mifflinStJeorBmr({ sex, weightKg: w, heightCm: h, age: a });
    maintenance = bmr * factor;
  } else {
    return { error: "Choose whether to estimate maintenance calories or enter your own." };
  }

  if (!Array.isArray(fastDayIndexes) || fastDayIndexes.length !== FAST_DAYS_PER_WEEK) {
    return { error: `Pick exactly ${FAST_DAYS_PER_WEEK} restricted days.` };
  }
  const uniqueDays = [...new Set(fastDayIndexes)];
  if (uniqueDays.length !== FAST_DAYS_PER_WEEK) return { error: "Pick two different days." };
  if (!uniqueDays.every((index) => Number.isInteger(index) && index >= 0 && index < DAYS.length)) {
    return { error: "Restricted days must be days of the week." };
  }

  const fastKcal = FAST_DAY_KCAL[sex];
  if (maintenance <= fastKcal) {
    return { error: "Your maintenance figure is at or below the restricted-day allowance — check the inputs." };
  }

  const sortedFastDays = [...uniqueDays].sort((a, b) => a - b);
  const normalDays = DAYS.length - FAST_DAYS_PER_WEEK;

  const weeklyIntake = normalDays * maintenance + FAST_DAYS_PER_WEEK * fastKcal;
  const weeklyMaintenance = DAYS.length * maintenance;
  const weeklyDeficit = weeklyMaintenance - weeklyIntake;
  const kgPerWeek = weeklyDeficit / KCAL_PER_KG_FAT;

  const schedule = DAYS.map((name, index) => {
    const isFastDay = sortedFastDays.includes(index);
    return {
      index,
      name,
      isFastDay,
      kcal: isFastDay ? fastKcal : Math.round(maintenance),
      label: isFastDay ? "Restricted day" : "Normal day",
    };
  });

  const fastDayMeals = FAST_DAY_MEAL_SPLIT.map((share, index) => ({
    index: index + 1,
    share,
    kcal: Math.round(fastKcal * share),
    name: index === 0 ? "First meal" : "Second meal",
  }));

  const warnings = [];
  if (areConsecutive(sortedFastDays[0], sortedFastDays[1])) {
    warnings.push(
      `${DAYS[sortedFastDays[0]]} and ${DAYS[sortedFastDays[1]]} are back to back. The pattern is designed around two non-consecutive days — put at least one normal day between them.`,
    );
  }
  if (kgPerWeek > SAFE_LOSS_MAX_KG_PER_WEEK) {
    warnings.push(
      `This plan projects more than ${SAFE_LOSS_MAX_KG_PER_WEEK} kg a week, which is faster than the usual recommended range. Discuss it with a doctor or dietitian before running it for long.`,
    );
  }
  if (kgPerWeek < SAFE_LOSS_MIN_KG_PER_WEEK) {
    warnings.push(
      `The projected loss is under ${SAFE_LOSS_MIN_KG_PER_WEEK} kg a week. That is normal for 5:2 at a lower maintenance figure — it works only if the five normal days really are normal, not larger to compensate.`,
    );
  }

  return {
    sex,
    fastKcal,
    bmr: bmr === null ? null : Math.round(bmr),
    maintenance,
    maintenanceRounded: Math.round(maintenance),
    normalDays,
    fastDays: FAST_DAYS_PER_WEEK,
    fastDayNames: sortedFastDays.map((index) => DAYS[index]),
    weeklyIntake: Math.round(weeklyIntake),
    weeklyMaintenance: Math.round(weeklyMaintenance),
    weeklyDeficit: Math.round(weeklyDeficit),
    averageDailyIntake: Math.round(weeklyIntake / DAYS.length),
    deficitAsPct: (weeklyDeficit / weeklyMaintenance) * 100,
    kgPerWeek,
    kgPerFourWeeks: kgPerWeek * 4,
    schedule,
    fastDayMeals,
    warnings,
  };
}
