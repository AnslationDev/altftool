/**
 * Outdoor Time For Eyes Planner — logic only. No React, no DOM, no clock reads.
 *
 * Where the targets and figures come from:
 *  - He et al., JAMA 2015 (Guangzhou Outdoor Activity Longitudinal Trial):
 *    adding one 40-minute outdoor session to each school day reduced the
 *    3-year cumulative incidence of myopia from 39.5% in the control group to
 *    30.4% in the intervention group — a 9.1 percentage-point absolute
 *    reduction in new cases.
 *  - Wu et al. and related Taiwanese school programmes are the source of the
 *    "11 hours a week outdoors" figure that is widely quoted alongside the
 *    simpler "2 hours a day" advice.
 *  - The working hypothesis is light intensity: outdoor illuminance is one to
 *    two orders of magnitude above indoor levels. Typical figures are roughly
 *    100,000 lux in direct summer sun, 10,000-25,000 lux in open shade,
 *    1,000-10,000 lux under heavy overcast, and 300-500 lux indoors. Studies
 *    generally treat exposure above about 1,000 lux as the relevant threshold.
 *  - Time outdoors is associated with delayed myopia ONSET. The evidence that
 *    it slows progression in children who are already myopic is much weaker.
 */

/** Daily outdoor target in minutes (the "2 hours a day" advice). */
export const DAILY_TARGET_MINUTES = 120;

/** Weekly outdoor target in minutes (the "11 hours a week" figure). */
export const WEEKLY_TARGET_MINUTES = 660;

/** Minutes of extra outdoor time per school day used in the JAMA 2015 trial. */
export const TRIAL_EXTRA_MINUTES = 40;

/** Control-group 3-year myopia incidence in that trial, as a percentage. */
export const TRIAL_CONTROL_INCIDENCE = 39.5;

/** Intervention-group 3-year myopia incidence in that trial, as a percentage. */
export const TRIAL_INTERVENTION_INCIDENCE = 30.4;

/** Illuminance above which exposure is generally counted as "bright light". */
export const BRIGHT_LIGHT_LUX = 1000;

/** Days in a week. */
export const DAYS_PER_WEEK = 7;

/** Weekday count used to split the plan. */
export const WEEKDAYS = 5;

/** Weekend day count. */
export const WEEKEND_DAYS = 2;

/** Representative illuminance for each outdoor condition, in lux. */
export const CONDITIONS = [
  { id: "sun", label: "Direct summer sun", lux: 100000 },
  { id: "bright", label: "Bright day, open sky", lux: 50000 },
  { id: "shade", label: "Open shade or tree cover", lux: 15000 },
  { id: "overcast", label: "Overcast", lux: 5000 },
  { id: "dull", label: "Dull, heavy cloud or dusk", lux: 1000 },
  { id: "indoor-window", label: "Indoors beside a bright window", lux: 800 },
  { id: "indoor", label: "Indoors, normal room lighting", lux: 400 },
];

/** Target options the planner can measure against. */
export const TARGETS = [
  { id: "daily", label: "2 hours a day (120 min)", weeklyMinutes: DAILY_TARGET_MINUTES * DAYS_PER_WEEK },
  { id: "weekly", label: "11 hours a week (660 min)", weeklyMinutes: WEEKLY_TARGET_MINUTES },
  { id: "trial", label: "40 extra minutes each school day", weeklyMinutes: TRIAL_EXTRA_MINUTES * WEEKDAYS },
];

export function findCondition(id) {
  return CONDITIONS.find((condition) => condition.id === id) || null;
}

export function findTarget(id) {
  return TARGETS.find((target) => target.id === id) || null;
}

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round1 = (value) => Math.round(value * 10) / 10;

/**
 * @param {object} input
 * @param {number} input.weekdayMinutes  Outdoor minutes on a typical weekday.
 * @param {number} input.weekendMinutes  Outdoor minutes on a typical weekend day.
 * @param {number} input.schoolOutdoorMinutes Outdoor minutes already provided at school/work, per weekday.
 * @param {string} input.conditionId     Typical light condition while outdoors.
 * @param {string} input.targetId        Which published target to measure against.
 * @returns {object} plan, or { error }.
 */
export function planOutdoorTime({
  weekdayMinutes,
  weekendMinutes,
  schoolOutdoorMinutes,
  conditionId,
  targetId,
} = {}) {
  const condition = findCondition(conditionId);
  if (!condition) return { error: "Choose the light condition you are usually outdoors in." };
  const target = findTarget(targetId);
  if (!target) return { error: "Choose a target to measure against." };

  const values = { weekdayMinutes, weekendMinutes, schoolOutdoorMinutes };
  const bad = Object.keys(values).find((key) => !isNum(values[key]));
  if (bad) return { error: "Enter a number of minutes in every field." };

  if (weekdayMinutes < 0 || weekendMinutes < 0 || schoolOutdoorMinutes < 0) {
    return { error: "Minutes cannot be negative." };
  }
  const weekdayTotal = weekdayMinutes + schoolOutdoorMinutes;
  if (weekdayTotal > 1440 || weekendMinutes > 1440) {
    return { error: "A day only has 1440 minutes — check the outdoor figures." };
  }

  const weeklyMinutes = weekdayTotal * WEEKDAYS + weekendMinutes * WEEKEND_DAYS;
  const dailyAverage = weeklyMinutes / DAYS_PER_WEEK;

  const targetWeekly = target.weeklyMinutes;
  const gapWeekly = Math.max(0, targetWeekly - weeklyMinutes);
  const achievedPercent = targetWeekly > 0 ? round1(Math.min(999, (weeklyMinutes / targetWeekly) * 100)) : 0;
  const metTarget = weeklyMinutes >= targetWeekly;

  // Spread any shortfall evenly across the week.
  const extraPerDay = Math.ceil(gapWeekly / DAYS_PER_WEEK);
  const extraPerWeekday = Math.ceil(gapWeekly / WEEKDAYS);

  // Light dose. Lux-hours is illuminance multiplied by exposure time.
  // Reported in thousands of lux-hours so the numbers stay readable.
  const dailyLuxHours = round1((condition.lux * dailyAverage) / 60 / 1000);
  const weeklyLuxHours = round1((condition.lux * weeklyMinutes) / 60 / 1000);
  const aboveBrightThreshold = condition.lux >= BRIGHT_LIGHT_LUX;
  const indoorEquivalentMinutes = aboveBrightThreshold
    ? Math.round((condition.lux / 400) * dailyAverage)
    : null;

  const notes = [];
  if (!aboveBrightThreshold) {
    notes.push(
      `At about ${condition.lux} lux this counts as indoor-level light. The outdoor effect in the research is tied to exposure above roughly ${BRIGHT_LIGHT_LUX} lux, which even an overcast day comfortably exceeds — being outdoors matters more than the sun being out.`,
    );
  }
  if (metTarget) {
    notes.push(
      `You are already meeting the ${target.label.toLowerCase()} target, with ${Math.round(weeklyMinutes - targetWeekly)} minutes a week to spare.`,
    );
  } else {
    notes.push(
      `You need ${Math.round(gapWeekly)} more minutes a week — about ${extraPerDay} minutes every day, or ${extraPerWeekday} minutes on each of the five weekdays.`,
    );
  }
  notes.push(
    `For scale, the Guangzhou trial added ${TRIAL_EXTRA_MINUTES} minutes of outdoor time to each school day and cut 3-year myopia incidence from ${TRIAL_CONTROL_INCIDENCE}% to ${TRIAL_INTERVENTION_INCIDENCE}%.`,
  );
  notes.push(
    "Time outdoors is linked with delaying the onset of myopia. Evidence that it slows progression once a child is already myopic is much weaker, so it complements rather than replaces myopia management.",
  );

  // Practical slots to close the gap.
  const slots = [];
  if (gapWeekly > 0) {
    const perWeekday = extraPerWeekday;
    slots.push({
      id: "before",
      label: "Before school or work",
      minutes: Math.min(perWeekday, 20),
      how: "Walk part of the journey, or step outside with breakfast.",
    });
    slots.push({
      id: "midday",
      label: "Lunch break outdoors",
      minutes: Math.min(Math.max(perWeekday - 20, 0), 30),
      how: "Eat outside or take the call while walking. Midday is the brightest light of the day.",
    });
    slots.push({
      id: "after",
      label: "After school or work",
      minutes: Math.max(perWeekday - 50, 0),
      how: "Park, garden or errands on foot before screens start.",
    });
  }

  return {
    condition,
    target,
    weekdayMinutes,
    weekendMinutes,
    schoolOutdoorMinutes,
    weekdayTotal,
    weeklyMinutes: Math.round(weeklyMinutes),
    weeklyHours: round1(weeklyMinutes / 60),
    dailyAverage: round1(dailyAverage),
    targetWeekly,
    targetDaily: round1(targetWeekly / DAYS_PER_WEEK),
    gapWeekly: Math.round(gapWeekly),
    gapDaily: extraPerDay,
    gapWeekday: extraPerWeekday,
    achievedPercent,
    metTarget,
    dailyLuxHours,
    weeklyLuxHours,
    brightLightLux: BRIGHT_LIGHT_LUX,
    aboveBrightThreshold,
    indoorEquivalentMinutes,
    trialExtraMinutes: TRIAL_EXTRA_MINUTES,
    trialControlIncidence: TRIAL_CONTROL_INCIDENCE,
    trialInterventionIncidence: TRIAL_INTERVENTION_INCIDENCE,
    trialAbsoluteReduction: round1(TRIAL_CONTROL_INCIDENCE - TRIAL_INTERVENTION_INCIDENCE),
    slots,
    notes,
  };
}
