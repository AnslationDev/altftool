/**
 * Daily step targets by age and goal.
 *
 * Sources for every number used here:
 *
 *  - Age bands. Pooled analyses of accelerometer studies find that the
 *    association between daily steps and lower all-cause mortality flattens off
 *    at roughly 8,000-10,000 steps a day in adults under 60, and at roughly
 *    6,000-8,000 steps a day in adults aged 60 and over. More steps than that
 *    are not harmful, but the additional benefit per step gets small.
 *  - The familiar 10,000-step figure is not a research finding. It comes from
 *    the name of a 1960s Japanese pedometer, "manpo-kei" — the 10,000-step
 *    meter — and stuck.
 *  - WHO 2020 guidelines: adults aged 18-64 should do 150-300 minutes of
 *    moderate-intensity aerobic activity a week (or 75-150 minutes vigorous),
 *    plus muscle-strengthening on 2 or more days. Adults 65 and over get the
 *    same, plus multicomponent balance and strength training on 3 or more days
 *    to help prevent falls.
 *  - Converting those minutes to steps: a cadence of about 100 steps a minute
 *    is the accepted threshold for moderate intensity in adults, so 150 minutes
 *    a week is about 15,000 brisk steps a week, and 300 minutes about 30,000.
 *  - Progression: increasing weekly volume by about 10% at a time is the
 *    conventional conservative ramp used to limit overuse injury.
 */

/** Evidence bands for daily steps, by age. */
export const AGE_BANDS = Object.freeze([
  {
    key: "adult",
    minAge: 18,
    maxAge: 59,
    low: 8000,
    high: 10000,
    label: "18-59",
    note: "In adults under 60, the mortality benefit of extra steps largely levels off between 8,000 and 10,000 a day.",
  },
  {
    key: "older",
    minAge: 60,
    maxAge: 120,
    low: 6000,
    high: 8000,
    label: "60 and over",
    note: "From 60 onwards the curve flattens earlier — most of the benefit is already there by 6,000 to 8,000 steps a day.",
  },
]);

/** Cadence that marks moderate intensity in adults, steps per minute. */
export const MODERATE_CADENCE_STEPS_PER_MIN = 100;

/** WHO weekly moderate-activity range for adults, minutes. */
export const WHO_WEEKLY_MINUTES_MIN = 150;
export const WHO_WEEKLY_MINUTES_MAX = 300;

/** WHO muscle-strengthening days a week, and balance days for 65+. */
export const WHO_STRENGTH_DAYS = 2;
export const WHO_BALANCE_DAYS_65_PLUS = 3;

/** Age at which the WHO adds the balance and strength recommendation. */
export const OLDER_ADULT_AGE = 65;

/** Extra daily steps added on top of the band for a weight-management goal. */
export const WEIGHT_GOAL_EXTRA_STEPS = 2000;

/** Weekly increase used for the ramp. */
export const WEEKLY_INCREASE = 0.1;

/** Below this baseline a percentage ramp barely moves, so add steps instead. */
export const MIN_MULTIPLICATIVE_BASE = 1000;
export const ADDITIVE_RAMP_STEPS = 1000;

/** Safety cap on the ramp length. */
export const MAX_RAMP_WEEKS = 52;

/** Input bounds. */
export const LIMITS = Object.freeze({ ageMin: 18, ageMax: 100, stepsMax: 100000 });

/** Supported goals. */
export const GOALS = Object.freeze([
  {
    key: "general",
    label: "General health — get most of the benefit",
    describe: "Targets the point where the mortality curve starts to flatten for your age.",
  },
  {
    key: "maximise",
    label: "Maximise the benefit — top of the band",
    describe: "Targets the upper end of the band, past which extra steps add little.",
  },
  {
    key: "weight",
    label: "Weight management",
    describe: "Weight control generally needs activity above the health minimum, so this adds to the top of the band.",
  },
  {
    key: "mobility",
    label: "Maintain mobility and independence",
    describe: "Targets the lower, achievable end of the band and leans on balance and strength work alongside walking.",
  },
]);

export function bandForAge(age) {
  return AGE_BANDS.find((band) => age >= band.minAge && age <= band.maxAge) || null;
}

/** Daily brisk-step equivalent of a weekly minutes figure at 100 steps/min. */
export function minutesToDailySteps(weeklyMinutes) {
  if (!Number.isFinite(weeklyMinutes) || weeklyMinutes < 0) return NaN;
  return (weeklyMinutes * MODERATE_CADENCE_STEPS_PER_MIN) / 7;
}

/**
 * Build a progression from current steps to a target.
 * @returns {{weeks:Array<{week:number,steps:number}>,weeksNeeded:number,capped:boolean}}
 */
export function buildRamp(currentSteps, targetSteps) {
  const weeks = [];
  if (!Number.isFinite(currentSteps) || !Number.isFinite(targetSteps)) {
    return { weeks, weeksNeeded: 0, capped: false };
  }
  if (currentSteps >= targetSteps) return { weeks, weeksNeeded: 0, capped: false };

  let steps = currentSteps;
  let week = 0;
  while (steps < targetSteps && week < MAX_RAMP_WEEKS) {
    week += 1;
    steps =
      steps >= MIN_MULTIPLICATIVE_BASE
        ? steps * (1 + WEEKLY_INCREASE)
        : steps + ADDITIVE_RAMP_STEPS;
    const capped = Math.min(steps, targetSteps);
    weeks.push({ week, steps: Math.round(capped) });
    steps = capped;
  }

  return { weeks, weeksNeeded: weeks.length, capped: week >= MAX_RAMP_WEEKS && steps < targetSteps };
}

/**
 * Work out a daily step goal.
 *
 * @param {object} input
 * @param {number} input.age
 * @param {number} input.currentSteps  Current daily average.
 * @param {string} input.goal          Key from GOALS.
 * @param {boolean} [input.mobilityLimits] Pain or a condition that limits walking.
 * @returns {object|{error:string}}
 */
export function calculateStepGoal(input) {
  const { age, currentSteps, goal, mobilityLimits } = input || {};

  const years = Number(age);
  if (!Number.isFinite(years)) return { error: "Enter your age in years." };
  if (years < LIMITS.ageMin) {
    return { error: `These bands are for adults ${LIMITS.ageMin} and over. For children and teenagers the WHO recommends an average of 60 minutes of moderate-to-vigorous activity a day instead of a step count.` };
  }
  if (years > LIMITS.ageMax) return { error: `Enter an age of ${LIMITS.ageMax} or under.` };

  const current = Number(currentSteps);
  if (!Number.isFinite(current)) return { error: "Enter the steps you average now — an estimate is fine." };
  if (current < 0) return { error: "Current steps cannot be negative." };
  if (current > LIMITS.stepsMax) return { error: `Enter ${LIMITS.stepsMax} steps or fewer.` };

  const selectedGoal = GOALS.find((item) => item.key === goal);
  if (!selectedGoal) return { error: "Choose a goal." };

  const band = bandForAge(years);
  if (!band) return { error: "No step band matches that age." };

  let target;
  if (selectedGoal.key === "general" || selectedGoal.key === "mobility") target = band.low;
  else if (selectedGoal.key === "maximise") target = band.high;
  else target = band.high + WEIGHT_GOAL_EXTRA_STEPS;

  const ramp = buildRamp(current, target);
  const alreadyThere = current >= target;
  const gap = Math.max(0, target - current);

  const whoMinSteps = minutesToDailySteps(WHO_WEEKLY_MINUTES_MIN);
  const whoMaxSteps = minutesToDailySteps(WHO_WEEKLY_MINUTES_MAX);
  const briskMinutesPerDayMin = WHO_WEEKLY_MINUTES_MIN / 7;
  const briskMinutesPerDayMax = WHO_WEEKLY_MINUTES_MAX / 7;

  const notes = [selectedGoal.describe, band.note];
  notes.push(
    `Intensity counts as well as volume: the WHO asks for ${WHO_WEEKLY_MINUTES_MIN}-${WHO_WEEKLY_MINUTES_MAX} minutes of moderate activity a week, which at a brisk ${MODERATE_CADENCE_STEPS_PER_MIN} steps a minute is about ${Math.round(whoMinSteps)}-${Math.round(whoMaxSteps)} brisk steps a day inside your total.`,
  );
  notes.push(
    `Add muscle-strengthening work on at least ${WHO_STRENGTH_DAYS} days a week — steps alone do not cover it.`,
  );
  if (years >= OLDER_ADULT_AGE) {
    notes.push(
      `From ${OLDER_ADULT_AGE} the WHO also recommends balance and strength training on ${WHO_BALANCE_DAYS_65_PLUS} or more days a week to reduce falls.`,
    );
  }
  if (mobilityLimits) {
    notes.push(
      "With pain or a condition that limits walking, any increase above your current level counts. Break the total into several short walks and set the target with a physiotherapist or doctor rather than from a population band.",
    );
  }
  if (alreadyThere) {
    notes.push(
      `You already average ${Math.round(current)} steps, above this target. Going higher is fine but adds progressively less; making more of those steps brisk usually does more than adding volume.`,
    );
  }

  return {
    age: years,
    band,
    goal: selectedGoal,
    currentSteps: current,
    targetSteps: target,
    gap,
    alreadyThere,
    percentOfTarget: target > 0 ? (current / target) * 100 : 0,
    ramp,
    weeksToTarget: ramp.weeksNeeded,
    whoBriskStepsMin: Math.round(whoMinSteps),
    whoBriskStepsMax: Math.round(whoMaxSteps),
    briskMinutesPerDayMin,
    briskMinutesPerDayMax,
    notes,
  };
}
