/**
 * Weight goal date predictor — pure calculation module.
 * No React, no DOM. The start date is always passed in as an argument.
 */

/**
 * Energy density of stored body tissue. The classic Wishnofsky figure is
 * 3,500 kcal per pound of fat, which is 7,700 kcal per kilogram. Real tissue
 * loss mixes fat, water and some lean mass, so treat it as an approximation.
 */
export const KCAL_PER_KG = 7700;

/** Harris-Benedict style activity multipliers applied to Mifflin-St Jeor BMR. */
export const ACTIVITY_LEVELS = [
  { key: "sedentary", label: "Sedentary — desk job, little exercise", multiplier: 1.2 },
  { key: "light", label: "Lightly active — 1-3 sessions a week", multiplier: 1.375 },
  { key: "moderate", label: "Moderately active — 3-5 sessions a week", multiplier: 1.55 },
  { key: "active", label: "Very active — 6-7 sessions a week", multiplier: 1.725 },
  { key: "athlete", label: "Extra active — physical job or two-a-days", multiplier: 1.9 },
];

/** Unit conversions (exact definitions). */
export const KG_PER_LB = 0.45359237;
export const CM_PER_INCH = 2.54;

/**
 * Lowest intakes generally considered safe without medical supervision:
 * 1,200 kcal/day for women and 1,500 kcal/day for men are the figures used in
 * mainstream weight-management guidance for very-low-calorie warnings.
 */
export const MIN_UNSUPERVISED_KCAL = { female: 1200, male: 1500 };

/** 0.5-1% of body weight per week is the usual "sustainable rate" guidance. */
export const AGGRESSIVE_WEEKLY_LOSS_FRACTION = 0.01;

/** WHO BMI cut-points (kg/m^2). */
export const BMI_UNDERWEIGHT = 18.5;
export const BMI_OVERWEIGHT = 25;

/** Simulation stops here — 5 years of weekly steps. */
export const MAX_WEEKS = 260;

const DAYS_PER_WEEK = 7;
const MS_PER_DAY = 86400000;
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

const round = (value, places = 2) => {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

export function parseIsoDate(value) {
  const match = DATE_RE.exec(String(value || "").trim());
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const ms = Date.UTC(year, month - 1, day);
  const check = new Date(ms);
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    return null;
  }
  return ms;
}

export function addDaysIso(dateString, days) {
  const ms = parseIsoDate(dateString);
  if (ms === null) return null;
  return new Date(ms + Math.round(days) * MS_PER_DAY).toISOString().slice(0, 10);
}

/** Mifflin-St Jeor resting metabolic rate (kcal/day). */
export function mifflinStJeorBmr({ sex, weightKg, heightCm, age }) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "female" ? base - 161 : base + 5;
}

export function activityMultiplier(key) {
  const level = ACTIVITY_LEVELS.find((l) => l.key === key);
  return level ? level.multiplier : ACTIVITY_LEVELS[0].multiplier;
}

/** Total daily energy expenditure = BMR x activity multiplier. */
export function totalDailyEnergyExpenditure({ sex, weightKg, heightCm, age, activityKey }) {
  return mifflinStJeorBmr({ sex, weightKg, heightCm, age }) * activityMultiplier(activityKey);
}

export function bmi(weightKg, heightCm) {
  if (!(heightCm > 0)) return null;
  const metres = heightCm / 100;
  return round(weightKg / (metres * metres), 1);
}

/**
 * Weight at which TDEE equals the given intake — the level the body settles at
 * if intake and activity never change. Derived by solving
 * multiplier x (10w + 6.25h - 5a + sexTerm) = intake for w.
 */
export function plateauWeightKg({ sex, heightCm, age, activityKey, intakeKcal }) {
  const multiplier = activityMultiplier(activityKey);
  const sexTerm = sex === "female" ? -161 : 5;
  const weight = (intakeKcal / multiplier - 6.25 * heightCm + 5 * age - sexTerm) / 10;
  return Number.isFinite(weight) ? round(weight, 1) : null;
}

/**
 * Project the date a target weight is reached.
 *
 * The simulation steps one week at a time and recomputes TDEE from the new
 * weight, so the rate of change slows as you approach the target — the reason
 * a flat "deficit / 7700" estimate is always too optimistic.
 *
 * @returns {object} projection, or { error } for input that cannot be projected.
 */
export function predictGoalDate(input) {
  const {
    sex = "male",
    age,
    heightCm,
    currentWeightKg,
    targetWeightKg,
    dailyIntakeKcal,
    activityKey = "moderate",
    startDate,
  } = input || {};

  const numbers = { age, heightCm, currentWeightKg, targetWeightKg, dailyIntakeKcal };
  for (const [name, value] of Object.entries(numbers)) {
    if (!Number.isFinite(Number(value))) return { error: `Enter a valid number for ${name}.` };
  }

  const a = Number(age);
  const h = Number(heightCm);
  const w0 = Number(currentWeightKg);
  const target = Number(targetWeightKg);
  const intake = Number(dailyIntakeKcal);

  if (a < 15 || a > 100) return { error: "Age must be between 15 and 100 for the Mifflin-St Jeor equation." };
  if (h < 100 || h > 250) return { error: "Height must be between 100 cm and 250 cm (39-98 in)." };
  if (w0 < 30 || w0 > 400) return { error: "Current weight must be between 30 kg and 400 kg (66-882 lb)." };
  if (target < 30 || target > 400) return { error: "Target weight must be between 30 kg and 400 kg (66-882 lb)." };
  if (intake < 500 || intake > 8000) return { error: "Daily intake must be between 500 and 8,000 kcal." };
  if (parseIsoDate(startDate) === null) return { error: "Enter a valid start date as YYYY-MM-DD." };

  const normalisedSex = sex === "female" ? "female" : "male";
  const startBmr = mifflinStJeorBmr({ sex: normalisedSex, weightKg: w0, heightCm: h, age: a });
  const startTdee = startBmr * activityMultiplier(activityKey);
  const startBalance = intake - startTdee;
  const direction = target < w0 ? "loss" : target > w0 ? "gain" : "maintain";

  const warnings = [];
  const floor = MIN_UNSUPERVISED_KCAL[normalisedSex];
  if (intake < floor) {
    warnings.push(
      `${Math.round(intake)} kcal/day is below the ${floor} kcal/day usually treated as the lower limit for ${normalisedSex === "female" ? "women" : "men"} without medical supervision.`,
    );
  }

  const bmiStart = bmi(w0, h);
  const bmiEnd = bmi(target, h);
  if (bmiEnd !== null && bmiEnd < BMI_UNDERWEIGHT) {
    warnings.push(`The target weight gives a BMI of ${bmiEnd}, below the WHO underweight cut-point of ${BMI_UNDERWEIGHT}.`);
  }

  if (direction === "maintain") {
    return {
      direction,
      days: 0,
      weeks: 0,
      goalDate: startDate,
      startBmr: round(startBmr),
      startTdee: round(startTdee),
      startBalance: round(startBalance),
      endTdee: round(startTdee),
      avgWeeklyChangeKg: 0,
      firstWeekChangeKg: 0,
      bmiStart,
      bmiEnd,
      milestones: [{ week: 0, date: startDate, weightKg: round(w0, 1), tdee: round(startTdee) }],
      plateauKg: plateauWeightKg({ sex: normalisedSex, heightCm: h, age: a, activityKey, intakeKcal: intake }),
      warnings: [...warnings, "Current weight already equals the target."],
    };
  }

  const wantsLoss = direction === "loss";
  if (wantsLoss && startBalance >= 0) {
    return {
      error: `At ${Math.round(intake)} kcal/day you are at or above your current maintenance of ${Math.round(startTdee)} kcal/day, so weight would not fall. Lower intake or raise activity.`,
    };
  }
  if (!wantsLoss && startBalance <= 0) {
    return {
      error: `At ${Math.round(intake)} kcal/day you are at or below your current maintenance of ${Math.round(startTdee)} kcal/day, so weight would not rise. Raise intake or lower activity.`,
    };
  }

  const plateauKg = plateauWeightKg({ sex: normalisedSex, heightCm: h, age: a, activityKey, intakeKcal: intake });
  if (plateauKg !== null && ((wantsLoss && plateauKg > target) || (!wantsLoss && plateauKg < target))) {
    return {
      error: `At ${Math.round(intake)} kcal/day your body settles near ${plateauKg} kg, because expenditure falls as weight changes. The ${round(target, 1)} kg target is not reachable without changing intake or activity.`,
    };
  }

  const milestones = [{ week: 0, date: startDate, weightKg: round(w0, 1), tdee: round(startTdee) }];
  let weight = w0;
  let week = 0;
  let firstWeekChangeKg = 0;
  let reachedDays = null;
  let endTdee = startTdee;

  while (week < MAX_WEEKS) {
    const tdeeNow = mifflinStJeorBmr({ sex: normalisedSex, weightKg: weight, heightCm: h, age: a }) *
      activityMultiplier(activityKey);
    const weeklyChange = ((intake - tdeeNow) * DAYS_PER_WEEK) / KCAL_PER_KG;
    if (!Number.isFinite(weeklyChange) || weeklyChange === 0) break;

    const next = weight + weeklyChange;
    if (week === 0) firstWeekChangeKg = weeklyChange;

    const crossed = wantsLoss ? next <= target : next >= target;
    if (crossed) {
      const span = Math.abs(next - weight);
      const remaining = Math.abs(target - weight);
      const fraction = span > 0 ? Math.min(1, remaining / span) : 1;
      reachedDays = Math.ceil(week * DAYS_PER_WEEK + fraction * DAYS_PER_WEEK);
      endTdee = mifflinStJeorBmr({ sex: normalisedSex, weightKg: target, heightCm: h, age: a }) *
        activityMultiplier(activityKey);
      milestones.push({
        week: week + 1,
        date: addDaysIso(startDate, reachedDays),
        weightKg: round(target, 1),
        tdee: round(endTdee),
      });
      break;
    }

    weight = next;
    week += 1;
    if (week % 4 === 0 || week <= 1) {
      milestones.push({
        week,
        date: addDaysIso(startDate, week * DAYS_PER_WEEK),
        weightKg: round(weight, 1),
        tdee: round(
          mifflinStJeorBmr({ sex: normalisedSex, weightKg: weight, heightCm: h, age: a }) *
            activityMultiplier(activityKey),
        ),
      });
    }
  }

  if (reachedDays === null) {
    return {
      error: `The target is more than ${MAX_WEEKS} weeks away at this intake. Adjust intake, activity or the target to get a usable projection.`,
    };
  }

  const totalChange = target - w0;
  const avgWeeklyChangeKg = round((totalChange / reachedDays) * DAYS_PER_WEEK, 3);

  if (wantsLoss && Math.abs(firstWeekChangeKg) > w0 * AGGRESSIVE_WEEKLY_LOSS_FRACTION) {
    warnings.push(
      `The first week loses ${round(Math.abs(firstWeekChangeKg), 2)} kg, more than 1% of your body weight — faster than the usual 0.5-1% per week guidance.`,
    );
  }
  if (bmiEnd !== null && bmiEnd >= BMI_OVERWEIGHT && wantsLoss) {
    warnings.push(`The target still sits at a BMI of ${bmiEnd}, at or above the ${BMI_OVERWEIGHT} overweight cut-point.`);
  }

  return {
    direction,
    days: reachedDays,
    weeks: round(reachedDays / DAYS_PER_WEEK, 1),
    goalDate: addDaysIso(startDate, reachedDays),
    startBmr: round(startBmr),
    startTdee: round(startTdee),
    startBalance: round(startBalance),
    endTdee: round(endTdee),
    endBalance: round(intake - endTdee),
    avgWeeklyChangeKg,
    firstWeekChangeKg: round(firstWeekChangeKg, 3),
    totalChangeKg: round(totalChange, 2),
    bmiStart,
    bmiEnd,
    milestones,
    plateauKg,
    warnings,
  };
}

/** Convert display units into the kg/cm the model uses. */
export function toMetric({ weight, height, units }) {
  if (units === "imperial") {
    return { weightKg: Number(weight) * KG_PER_LB, heightCm: Number(height) * CM_PER_INCH };
  }
  return { weightKg: Number(weight), heightCm: Number(height) };
}

/** Convert a kilogram figure back into the chosen display unit. */
export function fromKg(valueKg, units) {
  if (!Number.isFinite(valueKg)) return 0;
  return units === "imperial" ? round(valueKg / KG_PER_LB, 2) : round(valueKg, 2);
}
