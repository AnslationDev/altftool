/**
 * Kids screen time limit planner — pure logic.
 *
 * Every threshold below is taken from published paediatric guidance and is
 * annotated with its source. Nothing here is medical advice.
 */

const MINUTES_PER_DAY = 24 * 60; // clock arithmetic base

/**
 * Recreational (non-school, non-video-call) screen ceilings by age in years.
 *
 * 0-1 y : WHO 2019 "Guidelines on physical activity, sedentary behaviour and
 *         sleep for children under 5 years of age" — screen time is not
 *         recommended for infants (<1 y) or 1-year-olds.
 * 2-4 y : WHO 2019 — sedentary screen time should be no more than 1 hour a
 *         day; "less is better".
 * 5 y   : AAP policy statement "Media and Young Minds" (2016) — children aged
 *         2 to 5 years, 1 hour per day of high-quality programming.
 * 6-17 y: Canadian 24-Hour Movement Guidelines for Children and Youth (5-17
 *         years) — no more than 2 hours per day of recreational screen time.
 */
export const SCREEN_CAP_BANDS = [
  {
    minAge: 0,
    maxAge: 1,
    capMinutes: 0,
    band: "Under 2 years",
    source: "WHO 2019 guidance for children under 5",
    note: "Screen time is not recommended below 2 years. Live video calls with family are the usual exception.",
  },
  {
    minAge: 2,
    maxAge: 4,
    capMinutes: 60,
    band: "2 to 4 years",
    source: "WHO 2019 guidance for children under 5",
    note: "Up to 1 hour a day, and less is better. Watch together and talk about what is on screen.",
  },
  {
    minAge: 5,
    maxAge: 5,
    capMinutes: 60,
    band: "5 years",
    source: "AAP Media and Young Minds (2016), ages 2-5",
    note: "1 hour a day of high-quality programming, ideally co-viewed with an adult.",
  },
  {
    minAge: 6,
    maxAge: 17,
    capMinutes: 120,
    band: "6 to 17 years",
    source: "Canadian 24-Hour Movement Guidelines, ages 5-17",
    note: "No more than 2 hours a day of recreational screen time; homework screens are counted separately.",
  },
];

/**
 * Recommended sleep per 24 hours, from the American Academy of Sleep Medicine
 * 2016 consensus statement (endorsed by the AAP). Ranges include naps for the
 * younger bands.
 */
export const SLEEP_BANDS = [
  { minAge: 0, maxAge: 0, minHours: 12, maxHours: 16, label: "4-12 months" },
  { minAge: 1, maxAge: 2, minHours: 11, maxHours: 14, label: "1-2 years" },
  { minAge: 3, maxAge: 5, minHours: 10, maxHours: 13, label: "3-5 years" },
  { minAge: 6, maxAge: 12, minHours: 9, maxHours: 12, label: "6-12 years" },
  { minAge: 13, maxAge: 17, minHours: 8, maxHours: 10, label: "13-17 years" },
];

/**
 * Physical activity targets.
 * 1-4 years : WHO 2019 — at least 180 minutes of activity of any intensity
 *             spread through the day.
 * 5-17 years: WHO 2020 guidelines — an average of at least 60 minutes a day of
 *             moderate-to-vigorous physical activity.
 */
export const ACTIVITY_TARGET_BANDS = [
  { minAge: 0, maxAge: 0, minutes: 30, label: "Tummy time and floor play (WHO: at least 30 min for infants)" },
  { minAge: 1, maxAge: 4, minutes: 180, label: "Any-intensity active play (WHO: 180 min across the day)" },
  { minAge: 5, maxAge: 17, minutes: 60, label: "Moderate-to-vigorous activity (WHO: 60 min a day)" },
];

/**
 * AAP media-use guidance recommends screens off well before bed and devices
 * kept out of the bedroom; one hour is the commonly used wind-down window.
 */
export const WIND_DOWN_MINUTES = 60;

/**
 * How the recreational cap is suggested to be divided when a child has one.
 * Under 6 the whole allowance is treated as co-viewed video, because WHO and
 * AAP both frame the under-5 allowance around shared, high-quality programmes.
 */
export const SUGGESTED_SHARES_UNDER_6 = { video: 1, games: 0, social: 0 };
export const SUGGESTED_SHARES_6_PLUS = { video: 0.5, games: 0.3, social: 0.2 };

/** Purposes that do NOT count towards the recreational cap. */
export const EXEMPT_PURPOSES = ["schoolwork", "videoCalls"];

const isNumber = (value) => typeof value === "number" && Number.isFinite(value);

/** Parse "HH:MM" (24-hour) into minutes past midnight. Returns null if invalid. */
export function parseTimeToMinutes(value) {
  if (typeof value !== "string") return null;
  const match = /^([0-9]{1,2}):([0-9]{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/** Format minutes past midnight back to a 24-hour "HH:MM" string. */
export function formatMinutesAsTime(totalMinutes) {
  if (!isNumber(totalMinutes)) return "--:--";
  const wrapped = ((Math.round(totalMinutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours = Math.floor(wrapped / 60);
  const minutes = wrapped % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/** Turn a minute count into "2 h 15 min" style text. */
export function formatDuration(minutes) {
  if (!isNumber(minutes)) return "—";
  const rounded = Math.round(minutes);
  const sign = rounded < 0 ? "-" : "";
  const abs = Math.abs(rounded);
  const hours = Math.floor(abs / 60);
  const rest = abs % 60;
  if (hours === 0) return `${sign}${rest} min`;
  if (rest === 0) return `${sign}${hours} h`;
  return `${sign}${hours} h ${rest} min`;
}

const bandFor = (bands, age) => bands.find((entry) => age >= entry.minAge && age <= entry.maxAge) || null;

export function screenCapForAge(ageYears) {
  return bandFor(SCREEN_CAP_BANDS, ageYears);
}

/**
 * Build a full daily screen plan.
 *
 * @param {object} input
 * @param {number} input.ageYears          Child's age in whole years, 0-17.
 * @param {string} input.wakeTime          "HH:MM" 24-hour wake time.
 * @param {string} input.bedTime           "HH:MM" 24-hour bedtime.
 * @param {number} input.schoolHours       Hours at school or childcare.
 * @param {number} input.activityMinutes   Planned physical activity, minutes.
 * @param {number} input.schoolworkMinutes Screen minutes for homework/study.
 * @param {number} input.videoMinutes      Screen minutes for shows and video.
 * @param {number} input.gameMinutes       Screen minutes for games.
 * @param {number} input.socialMinutes     Screen minutes for social and chat.
 * @param {number} input.videoCallMinutes  Screen minutes for family video calls.
 * @returns {object} plan, or { error } for invalid input.
 */
export function buildScreenPlan(input) {
  const {
    ageYears,
    wakeTime,
    bedTime,
    schoolHours,
    activityMinutes,
    schoolworkMinutes,
    videoMinutes,
    gameMinutes,
    socialMinutes,
    videoCallMinutes,
  } = input || {};

  const numericFields = {
    ageYears,
    schoolHours,
    activityMinutes,
    schoolworkMinutes,
    videoMinutes,
    gameMinutes,
    socialMinutes,
    videoCallMinutes,
  };
  const badField = Object.keys(numericFields).find((key) => !isNumber(numericFields[key]));
  if (badField) return { error: "Enter a valid number in every field." };

  const age = Math.floor(ageYears);
  if (age < 0 || age > 17) {
    return { error: "This planner covers children from 0 to 17 years." };
  }
  if (schoolHours < 0 || schoolHours > 14) {
    return { error: "School or childcare hours should be between 0 and 14." };
  }

  const minuteFields = [
    activityMinutes,
    schoolworkMinutes,
    videoMinutes,
    gameMinutes,
    socialMinutes,
    videoCallMinutes,
  ];
  if (minuteFields.some((value) => value < 0)) {
    return { error: "Minutes cannot be negative." };
  }
  if (minuteFields.some((value) => value > MINUTES_PER_DAY)) {
    return { error: "No single activity can take more than 24 hours (1440 minutes)." };
  }

  const wake = parseTimeToMinutes(wakeTime);
  const bed = parseTimeToMinutes(bedTime);
  if (wake === null || bed === null) {
    return { error: "Enter wake time and bedtime as HH:MM in 24-hour format." };
  }

  let awakeMinutes = bed - wake;
  if (awakeMinutes <= 0) awakeMinutes += MINUTES_PER_DAY;
  const sleepMinutes = MINUTES_PER_DAY - awakeMinutes;
  if (sleepMinutes <= 0) {
    return { error: "Bedtime and wake time cannot be the same — the child needs a sleep window." };
  }

  const capBand = bandFor(SCREEN_CAP_BANDS, age);
  const sleepBand = bandFor(SLEEP_BANDS, age);
  const activityBand = bandFor(ACTIVITY_TARGET_BANDS, age);
  const capMinutes = capBand ? capBand.capMinutes : 0;

  const recreationalMinutes = videoMinutes + gameMinutes + socialMinutes;
  const exemptMinutes = schoolworkMinutes + videoCallMinutes;
  const totalScreenMinutes = recreationalMinutes + exemptMinutes;
  const remainingMinutes = capMinutes - recreationalMinutes;

  let status = "within";
  if (recreationalMinutes > capMinutes) status = "over";
  else if (capMinutes > 0 && remainingMinutes <= capMinutes * 0.1) status = "at-limit";

  const shares = age >= 6 ? SUGGESTED_SHARES_6_PLUS : SUGGESTED_SHARES_UNDER_6;
  const suggestedSplit = {
    video: Math.round(capMinutes * shares.video),
    games: Math.round(capMinutes * shares.games),
    social: Math.round(capMinutes * shares.social),
  };

  const screensOffAt = ((bed - WIND_DOWN_MINUTES) % MINUTES_PER_DAY + MINUTES_PER_DAY) % MINUTES_PER_DAY;

  const sleepHours = sleepMinutes / 60;
  let sleepStatus = "in-range";
  if (sleepBand) {
    if (sleepHours < sleepBand.minHours) sleepStatus = "short";
    else if (sleepHours > sleepBand.maxHours) sleepStatus = "long";
  }

  const activityTargetMinutes = activityBand ? activityBand.minutes : 0;
  const activityStatus = activityMinutes >= activityTargetMinutes ? "met" : "below";

  const schoolMinutes = schoolHours * 60;
  const committedMinutes = schoolMinutes + activityMinutes + totalScreenMinutes;
  const freeMinutes = awakeMinutes - committedMinutes;

  const notes = [];
  if (capBand) notes.push(capBand.note);
  if (status === "over") {
    notes.push(
      `Recreational screens are ${formatDuration(recreationalMinutes - capMinutes)} over the ${formatDuration(capMinutes)} guideline for this age.`,
    );
  }
  if (sleepStatus === "short" && sleepBand) {
    notes.push(
      `This wake-to-bed window leaves ${formatDuration(sleepMinutes)} of sleep, below the ${sleepBand.minHours}-${sleepBand.maxHours} hour range for ${sleepBand.label}.`,
    );
  }
  if (activityStatus === "below") {
    notes.push(
      `Physical activity is ${formatDuration(activityTargetMinutes - activityMinutes)} short of the ${formatDuration(activityTargetMinutes)} daily target.`,
    );
  }
  if (freeMinutes < 0) {
    notes.push(
      `The day is over-booked by ${formatDuration(-freeMinutes)} — school, activity and screens exceed the waking hours.`,
    );
  }
  notes.push(
    `Switch screens off by ${formatMinutesAsTime(screensOffAt)} so there is a ${WIND_DOWN_MINUTES}-minute wind-down before bed.`,
  );

  return {
    age,
    band: capBand ? capBand.band : "",
    capSource: capBand ? capBand.source : "",
    capMinutes,
    recreationalMinutes,
    exemptMinutes,
    totalScreenMinutes,
    remainingMinutes,
    status,
    suggestedSplit,
    breakdown: {
      schoolwork: schoolworkMinutes,
      video: videoMinutes,
      games: gameMinutes,
      social: socialMinutes,
      videoCalls: videoCallMinutes,
    },
    awakeMinutes,
    sleepMinutes,
    sleepHours,
    sleepBand,
    sleepStatus,
    activityMinutes,
    activityTargetMinutes,
    activityLabel: activityBand ? activityBand.label : "",
    activityStatus,
    schoolMinutes,
    freeMinutes,
    screensOffAt,
    screensOffAtLabel: formatMinutesAsTime(screensOffAt),
    notes,
  };
}
