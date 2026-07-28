/**
 * Child Screen Time Planner — logic only. No React, no DOM.
 *
 * Sources for every fixed number below:
 *  - WHO, "Guidelines on physical activity, sedentary behaviour and sleep for
 *    children under 5 years of age" (2019): sedentary screen time is not
 *    recommended under 2 years; no more than 60 minutes for ages 2-4;
 *    180 minutes of total physical activity per day for ages 1-4.
 *  - AAP (American Academy of Pediatrics) media guidance: avoid screen media
 *    other than video chatting under 18 months; limit ages 2-5 to about one
 *    hour a day of high-quality programming; from age 6 set consistent limits
 *    that protect sleep, physical activity and other healthy behaviours.
 *  - WHO physical activity guidelines (2020): an average of 60 minutes a day
 *    of moderate-to-vigorous physical activity for ages 5-17.
 *  - AAP / American Academy of Sleep Medicine consensus (2016) sleep durations.
 *  - He et al., JAMA 2015 and related myopia cohorts: roughly two hours a day
 *    outdoors is associated with lower myopia incidence in children.
 *  - 20-20-20 rule (widely used optometric advice): a 20 second distance
 *    break every 20 minutes of near screen work.
 */

/** Hours in a calendar day. */
export const HOURS_PER_DAY = 24;

/** Minutes in an hour. */
export const MINUTES_PER_HOUR = 60;

/** WHO/AAP recreational screen cap for ages 2-5, in minutes per day. */
export const PRESCHOOL_SCREEN_CAP_MINUTES = 60;

/** WHO/AAP recreational screen cap under 2 years, in minutes per day. */
export const UNDER_TWO_SCREEN_CAP_MINUTES = 0;

/** WHO moderate-to-vigorous physical activity target, ages 5-17 (minutes/day). */
export const MVPA_TARGET_MINUTES = 60;

/** WHO total physical activity target, ages 1-4 (minutes/day, any intensity). */
export const UNDER_FIVE_ACTIVITY_MINUTES = 180;

/** Daylight target linked with lower myopia incidence (minutes/day). */
export const OUTDOOR_EYE_TARGET_MINUTES = 120;

/** 20-20-20 rule: one distance break per this many minutes of screen use. */
export const EYE_BREAK_INTERVAL_MINUTES = 20;

/** Length of one 20-20-20 break, in seconds. */
export const EYE_BREAK_SECONDS = 20;

/**
 * Age bands. sleepLow/sleepHigh are the AAP/AASM consensus sleep ranges in
 * hours per 24 hours (naps included where the consensus includes them).
 * capMinutes === null means no fixed numeric cap exists for that age, so the
 * plan falls back to whatever free time the 24-hour budget leaves.
 */
export const AGE_BANDS = [
  {
    id: "infant",
    label: "Under 1 year",
    minAge: 0,
    maxAge: 0,
    capMinutes: UNDER_TWO_SCREEN_CAP_MINUTES,
    sleepLow: 12,
    sleepHigh: 16,
    activityMinutes: 30,
    activityLabel: "30 min tummy time and floor play, spread through the day",
    guidance:
      "Screen time is not recommended below 12 months. Live video calls with family are the accepted exception.",
  },
  {
    id: "toddler-1",
    label: "1 year",
    minAge: 1,
    maxAge: 1,
    capMinutes: UNDER_TWO_SCREEN_CAP_MINUTES,
    sleepLow: 11,
    sleepHigh: 14,
    activityMinutes: UNDER_FIVE_ACTIVITY_MINUTES,
    activityLabel: "180 min of active play at any intensity",
    guidance:
      "WHO advises no sedentary screen time at age 1. Reading, singing and floor play are the recommended substitutes.",
  },
  {
    id: "toddler-2",
    label: "2 years",
    minAge: 2,
    maxAge: 2,
    capMinutes: PRESCHOOL_SCREEN_CAP_MINUTES,
    sleepLow: 11,
    sleepHigh: 14,
    activityMinutes: UNDER_FIVE_ACTIVITY_MINUTES,
    activityLabel: "180 min of active play at any intensity",
    guidance:
      "No more than 60 minutes of sedentary screen time, and less is better. Co-view so the child can talk about what they see.",
  },
  {
    id: "preschool",
    label: "3 to 5 years",
    minAge: 3,
    maxAge: 5,
    capMinutes: PRESCHOOL_SCREEN_CAP_MINUTES,
    sleepLow: 10,
    sleepHigh: 13,
    activityMinutes: UNDER_FIVE_ACTIVITY_MINUTES,
    activityLabel: "180 min of activity, at least 60 min of it energetic",
    guidance:
      "Cap high-quality programming at about one hour a day and keep screens out of the bedroom and off during meals.",
  },
  {
    id: "primary",
    label: "6 to 12 years",
    minAge: 6,
    maxAge: 12,
    capMinutes: null,
    sleepLow: 9,
    sleepHigh: 12,
    activityMinutes: MVPA_TARGET_MINUTES,
    activityLabel: "60 min of moderate-to-vigorous activity",
    guidance:
      "There is no single official minute limit from age 6. The rule is that recreational screens must not displace sleep, activity, homework or family time.",
  },
  {
    id: "teen",
    label: "13 to 18 years",
    minAge: 13,
    maxAge: 18,
    capMinutes: null,
    sleepLow: 8,
    sleepHigh: 10,
    activityMinutes: MVPA_TARGET_MINUTES,
    activityLabel: "60 min of moderate-to-vigorous activity",
    guidance:
      "Agree the limit together and protect a screen-free hour before bed; teenagers need 8 to 10 hours of sleep on school nights.",
  },
];

/** Look up the age band for a whole-number age in years. */
export function findAgeBand(ageYears) {
  return (
    AGE_BANDS.find((band) => ageYears >= band.minAge && ageYears <= band.maxAge) || null
  );
}

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round1 = (value) => Math.round(value * 10) / 10;

/**
 * Build a whole-day plan for one child.
 *
 * @param {object} input
 * @param {number} input.ageYears          Child's age in whole years, 0-18.
 * @param {number} input.plannedScreenMinutes  Recreational screen minutes the child actually gets.
 * @param {number} input.schoolHours       Hours at school or nursery (screen or not).
 * @param {number} input.sleepHours        Hours of sleep actually planned in 24 h.
 * @param {number} input.routineHours      Meals, washing, travel and other fixed routine hours.
 * @param {number} input.homeworkHours     Homework or study hours outside school.
 * @param {number} input.outdoorMinutes    Minutes planned outdoors in daylight.
 * @returns {object} plan, or { error } when the input cannot produce a real answer.
 */
export function planScreenTime({
  ageYears,
  plannedScreenMinutes,
  schoolHours,
  sleepHours,
  routineHours,
  homeworkHours,
  outdoorMinutes,
} = {}) {
  const values = {
    ageYears,
    plannedScreenMinutes,
    schoolHours,
    sleepHours,
    routineHours,
    homeworkHours,
    outdoorMinutes,
  };
  const bad = Object.keys(values).find((key) => !isNum(values[key]));
  if (bad) return { error: "Enter a number in every field." };

  if (ageYears < 0 || ageYears > 18) {
    return { error: "This planner covers ages 0 to 18. Enter an age in that range." };
  }
  if (
    plannedScreenMinutes < 0 ||
    schoolHours < 0 ||
    sleepHours < 0 ||
    routineHours < 0 ||
    homeworkHours < 0 ||
    outdoorMinutes < 0
  ) {
    return { error: "Times cannot be negative." };
  }
  if (plannedScreenMinutes > HOURS_PER_DAY * MINUTES_PER_HOUR) {
    return { error: "Screen time cannot be more than 1440 minutes (24 hours) a day." };
  }
  if (outdoorMinutes > HOURS_PER_DAY * MINUTES_PER_HOUR) {
    return { error: "Outdoor time cannot be more than 1440 minutes (24 hours) a day." };
  }

  const band = findAgeBand(Math.floor(ageYears));
  if (!band) return { error: "This planner covers ages 0 to 18. Enter an age in that range." };

  const outdoorHours = outdoorMinutes / MINUTES_PER_HOUR;
  const committedHours = sleepHours + schoolHours + routineHours + homeworkHours + outdoorHours;

  if (committedHours > HOURS_PER_DAY) {
    return {
      error: `Sleep, school, routine, homework and outdoor time already add up to ${round1(
        committedHours,
      )} hours — more than the 24 hours in a day. Reduce one of them.`,
    };
  }

  const freeHours = HOURS_PER_DAY - committedHours;
  const freeMinutes = Math.round(freeHours * MINUTES_PER_HOUR);

  // Recommended recreational screen minutes: the age cap where one exists,
  // otherwise whatever free time the day budget actually leaves. Never more
  // than the free time in either case.
  const cappedByAge = band.capMinutes === null ? freeMinutes : band.capMinutes;
  const recommendedMinutes = Math.max(0, Math.min(cappedByAge, freeMinutes));
  const capSource = band.capMinutes === null ? "day-budget" : "age-guideline";

  const overMinutes = Math.max(0, Math.round(plannedScreenMinutes - recommendedMinutes));
  const withinLimit = overMinutes === 0;

  const eyeBreaks = Math.floor(plannedScreenMinutes / EYE_BREAK_INTERVAL_MINUTES);
  const eyeBreakSecondsPerDay = eyeBreaks * EYE_BREAK_SECONDS;

  const outdoorGapMinutes = Math.max(
    0,
    Math.round(OUTDOOR_EYE_TARGET_MINUTES - outdoorMinutes),
  );

  const sleepShortfall = round1(Math.max(0, band.sleepLow - sleepHours));
  const sleepAboveRange = sleepHours > band.sleepHigh;

  const notes = [];
  if (band.capMinutes === 0) {
    notes.push(
      "At this age the recommended recreational screen time is zero, so any planned minutes are above guidance.",
    );
  }
  if (sleepShortfall > 0) {
    notes.push(
      `Sleep is ${sleepShortfall} h short of the ${band.sleepLow}-${band.sleepHigh} h range for this age.`,
    );
  } else if (sleepAboveRange) {
    notes.push(
      `Planned sleep is above the usual ${band.sleepLow}-${band.sleepHigh} h range for this age, which is fine on a rest day.`,
    );
  }
  if (outdoorGapMinutes > 0) {
    notes.push(
      `Daylight is ${outdoorGapMinutes} min short of the 2 hour outdoor target linked with lower myopia risk.`,
    );
  }
  if (plannedScreenMinutes >= EYE_BREAK_INTERVAL_MINUTES && eyeBreaks > 0) {
    notes.push(
      `Plan ${eyeBreaks} distance breaks (20 seconds each) across the screen time using the 20-20-20 rule.`,
    );
  }
  if (freeMinutes === 0) {
    notes.push("The day budget leaves no free time at all — something has to give before screens.");
  }

  return {
    ageYears,
    band,
    recommendedMinutes,
    capSource,
    plannedMinutes: Math.round(plannedScreenMinutes),
    overMinutes,
    withinLimit,
    freeMinutes,
    freeHours: round1(freeHours),
    committedHours: round1(committedHours),
    sleepTarget: `${band.sleepLow}-${band.sleepHigh} h`,
    sleepShortfall,
    activityTargetMinutes: band.activityMinutes,
    activityLabel: band.activityLabel,
    outdoorMinutes: Math.round(outdoorMinutes),
    outdoorTargetMinutes: OUTDOOR_EYE_TARGET_MINUTES,
    outdoorGapMinutes,
    eyeBreaks,
    eyeBreakSecondsPerDay,
    weeklyScreenHours: round1((Math.round(plannedScreenMinutes) * 7) / MINUTES_PER_HOUR),
    guidance: band.guidance,
    notes,
  };
}

/** Format a minute count as "1 h 30 min" / "45 min". */
export function formatMinutes(minutes) {
  if (!isNum(minutes) || minutes < 0) return "—";
  const whole = Math.round(minutes);
  if (whole === 0) return "0 min";
  const h = Math.floor(whole / MINUTES_PER_HOUR);
  const m = whole % MINUTES_PER_HOUR;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}
