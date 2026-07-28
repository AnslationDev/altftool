/**
 * Kids hydration reminder — pure logic.
 *
 * Baseline needs come from EFSA's 2010 Adequate Intake (AI) values for total
 * water. Extra fluid for exercise comes from the AAP clinical report on
 * climatic heat stress. Nothing here is medical advice.
 */

const MINUTES_PER_DAY = 24 * 60;

/**
 * EFSA (2010) Adequate Intake for TOTAL water per day, in millilitres.
 * Total water includes water from food as well as drinks.
 */
export const TOTAL_WATER_AI_ML = [
  { minAge: 2, maxAge: 3, male: 1300, female: 1300, label: "2-3 years" },
  { minAge: 4, maxAge: 8, male: 1600, female: 1600, label: "4-8 years" },
  { minAge: 9, maxAge: 13, male: 2100, female: 1900, label: "9-13 years" },
  { minAge: 14, maxAge: 17, male: 2500, female: 2000, label: "14-17 years" },
];

/**
 * EFSA notes that roughly 20-30% of total water comes from food. This tool
 * uses the midpoint (25%), so 75% of the AI has to come from drinks.
 */
export const DRINKS_SHARE_OF_TOTAL = 0.75;

/**
 * AAP clinical report "Climatic Heat Stress and Exercising Children and
 * Adolescents" (2011): children aged 9-12 should drink 100-250 mL every 20
 * minutes of activity; adolescents need 1.0-1.5 L per hour, i.e. roughly
 * 333-500 mL every 20 minutes. Younger children sweat less and have smaller
 * absolute needs, so this tool applies the lower 9-12 year figures to them and
 * says so rather than inventing a separate number.
 */
export const ACTIVITY_ML_PER_20_MIN = [
  { minAge: 2, maxAge: 8, low: 100, high: 150, note: "Lower end of the 9-12 year AAP range, applied to younger children." },
  { minAge: 9, maxAge: 13, low: 100, high: 250, note: "AAP: 100-250 mL every 20 minutes of activity for 9-12 year olds." },
  { minAge: 14, maxAge: 17, low: 333, high: 500, note: "AAP: 1.0-1.5 L per hour for adolescents." },
];

/**
 * Weather simply chooses where inside the AAP range to sit — it is not a
 * separate uplift rule. Hotter and more humid conditions mean the top of the
 * range; a cool air-conditioned classroom means the bottom.
 */
export const WEATHER_BANDS = [
  { id: "cool", label: "Cool or air-conditioned (below 24 °C)", position: 0 },
  { id: "warm", label: "Warm (24-32 °C)", position: 0.5 },
  { id: "hot", label: "Hot or humid (above 32 °C)", position: 1 },
];

/**
 * How the baseline drinks target is spread across the day. Shares sum to 1.
 * Extra activity fluid is added to the activity slot on top of these shares.
 */
export const SCHEDULE_SLOTS = [
  { id: "waking", label: "On waking", share: 0.15 },
  { id: "mid-morning", label: "Mid-morning break", share: 0.15 },
  { id: "lunch", label: "Lunch", share: 0.2 },
  { id: "afternoon", label: "Afternoon break", share: 0.15 },
  { id: "activity", label: "Play, sport or the walk home", share: 0 },
  { id: "dinner", label: "With the evening meal", share: 0.2 },
  { id: "winddown", label: "Wind-down sip", share: 0.15 },
];

/** Fraction of the school day at which each in-school reminder falls. */
const SCHOOL_DAY_POSITIONS = { "mid-morning": 0.25, lunch: 0.5, afternoon: 0.75 };

/** Minutes after the last bell for the activity reminder. */
const AFTER_SCHOOL_OFFSET_MIN = 30;
/** Minutes before bedtime for the evening meal and the final sip. */
const DINNER_BEFORE_BED_MIN = 180;
const WINDDOWN_BEFORE_BED_MIN = 60;

const isNumber = (value) => typeof value === "number" && Number.isFinite(value);

/** Parse "HH:MM" (24-hour) into minutes past midnight, or null. */
export function parseTimeToMinutes(value) {
  if (typeof value !== "string") return null;
  const match = /^([0-9]{1,2}):([0-9]{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/** Format minutes past midnight as "HH:MM". */
export function formatMinutesAsTime(totalMinutes) {
  if (!isNumber(totalMinutes)) return "--:--";
  const wrapped = ((Math.round(totalMinutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  return `${String(Math.floor(wrapped / 60)).padStart(2, "0")}:${String(wrapped % 60).padStart(2, "0")}`;
}

/** Render millilitres as "750 ml" or "1.2 L". */
export function formatVolume(ml) {
  if (!isNumber(ml)) return "—";
  const rounded = Math.round(ml);
  if (Math.abs(rounded) < 1000) return `${rounded} ml`;
  return `${(rounded / 1000).toFixed(rounded % 100 === 0 ? 1 : 2)} L`;
}

const bandFor = (bands, age) => bands.find((entry) => age >= entry.minAge && age <= entry.maxAge) || null;

/**
 * Build a full school-day hydration schedule.
 *
 * @param {object} input
 * @param {number} input.ageYears        Age in whole years, 2-17.
 * @param {string} input.sex             "male" or "female" (EFSA splits at age 9).
 * @param {string} input.weather         One of the WEATHER_BANDS ids.
 * @param {number} input.activityMinutes Minutes of active play or sport.
 * @param {number} input.bottleMl        Water bottle capacity in millilitres.
 * @param {string} input.wakeTime        "HH:MM".
 * @param {string} input.schoolStart     "HH:MM".
 * @param {string} input.schoolEnd       "HH:MM".
 * @param {string} input.bedTime         "HH:MM".
 * @returns {object} schedule, or { error } for invalid input.
 */
export function buildHydrationPlan(input) {
  const {
    ageYears,
    sex,
    weather,
    activityMinutes,
    bottleMl,
    wakeTime,
    schoolStart,
    schoolEnd,
    bedTime,
  } = input || {};

  if (!isNumber(ageYears) || !isNumber(activityMinutes) || !isNumber(bottleMl)) {
    return { error: "Enter a valid number for age, activity minutes and bottle size." };
  }

  const age = Math.floor(ageYears);
  if (age < 2 || age > 17) {
    return {
      error:
        "This planner covers ages 2 to 17. For babies and toddlers under 2, ask your paediatrician — milk still supplies most of their fluid.",
    };
  }
  if (activityMinutes < 0) return { error: "Activity minutes cannot be negative." };
  if (activityMinutes > 480) return { error: "Keep planned activity under 8 hours (480 minutes)." };
  if (bottleMl < 100 || bottleMl > 2000) {
    return { error: "Enter a bottle size between 100 ml and 2000 ml." };
  }

  const sexKey = sex === "male" ? "male" : "female";
  const weatherBand = WEATHER_BANDS.find((band) => band.id === weather) || WEATHER_BANDS[1];

  const wake = parseTimeToMinutes(wakeTime);
  const start = parseTimeToMinutes(schoolStart);
  const end = parseTimeToMinutes(schoolEnd);
  const bed = parseTimeToMinutes(bedTime);
  if (wake === null || start === null || end === null || bed === null) {
    return { error: "Enter every time as HH:MM in 24-hour format." };
  }
  if (end <= start) return { error: "The school day has to end after it starts." };
  if (start < wake) return { error: "School cannot start before your child wakes up." };
  if (bed <= end) return { error: "Bedtime has to be after the school day ends." };

  const aiBand = bandFor(TOTAL_WATER_AI_ML, age);
  const totalWaterMl = aiBand[sexKey];
  const drinksBaselineMl = Math.round(totalWaterMl * DRINKS_SHARE_OF_TOTAL);
  const fromFoodMl = totalWaterMl - drinksBaselineMl;

  const activityBand = bandFor(ACTIVITY_ML_PER_20_MIN, age);
  const perBlockMl = Math.round(
    activityBand.low + (activityBand.high - activityBand.low) * weatherBand.position,
  );
  const activityBlocks = Math.ceil(activityMinutes / 20);
  const activityMl = activityBlocks * perBlockMl;

  const drinksTargetMl = drinksBaselineMl + activityMl;

  const schoolDayMinutes = end - start;
  const times = {
    waking: wake,
    "mid-morning": Math.round(start + schoolDayMinutes * SCHOOL_DAY_POSITIONS["mid-morning"]),
    lunch: Math.round(start + schoolDayMinutes * SCHOOL_DAY_POSITIONS.lunch),
    afternoon: Math.round(start + schoolDayMinutes * SCHOOL_DAY_POSITIONS.afternoon),
    activity: end + AFTER_SCHOOL_OFFSET_MIN,
    dinner: bed - DINNER_BEFORE_BED_MIN,
    winddown: bed - WINDDOWN_BEFORE_BED_MIN,
  };

  // Round each share, then push the rounding remainder into the lunch slot so
  // the schedule always adds up to the calculated target exactly.
  const baseAllocations = SCHEDULE_SLOTS.map((slot) => Math.round(drinksBaselineMl * slot.share));
  const allocatedBase = baseAllocations.reduce((sum, value) => sum + value, 0);
  const lunchIndex = SCHEDULE_SLOTS.findIndex((slot) => slot.id === "lunch");
  baseAllocations[lunchIndex] += drinksBaselineMl - allocatedBase;

  const schedule = SCHEDULE_SLOTS.map((slot, index) => {
    const extraMl = slot.id === "activity" ? activityMl : 0;
    return {
      id: slot.id,
      label: slot.label,
      time: formatMinutesAsTime(times[slot.id]),
      timeMinutes: times[slot.id],
      ml: baseAllocations[index] + extraMl,
      isActivity: slot.id === "activity",
    };
  }).filter((slot) => slot.ml > 0);

  const scheduledMl = schedule.reduce((sum, slot) => sum + slot.ml, 0);
  const schoolHoursMl = schedule
    .filter((slot) => ["mid-morning", "lunch", "afternoon"].includes(slot.id))
    .reduce((sum, slot) => sum + slot.ml, 0);

  const bottleRefills = Math.ceil(schoolHoursMl / bottleMl);

  const notes = [
    `${aiBand.label}: EFSA sets an adequate intake of ${formatVolume(totalWaterMl)} of total water a day, of which about ${formatVolume(fromFoodMl)} normally comes from food.`,
    activityMinutes > 0
      ? `${activityMinutes} minutes of activity adds ${activityBlocks} × ${perBlockMl} ml = ${formatVolume(activityMl)}. ${activityBand.note}`
      : "No activity fluid has been added because no active minutes were entered.",
    `Pack a ${formatVolume(bottleMl)} bottle and plan on ${bottleRefills} fill${bottleRefills === 1 ? "" : "s"} to cover the ${formatVolume(schoolHoursMl)} needed during school hours.`,
    "Pale straw-coloured urine is the simplest day-to-day check; dark yellow means it is time to drink.",
  ];
  if (weatherBand.id === "hot") {
    notes.push(
      "In hot or humid weather encourage drinking before your child says they are thirsty, and take breaks in the shade.",
    );
  }
  if (times.winddown <= times.dinner) {
    notes.push("Bedtime is close to the evening meal, so the last two reminders sit near each other.");
  }

  return {
    age,
    ageBandLabel: aiBand.label,
    sex: sexKey,
    weather: weatherBand,
    totalWaterMl,
    fromFoodMl,
    drinksBaselineMl,
    activityMinutes,
    activityBlocks,
    perBlockMl,
    activityMl,
    drinksTargetMl,
    scheduledMl,
    schoolHoursMl,
    bottleMl,
    bottleRefills,
    glassesOf200Ml: Math.round(drinksTargetMl / 200),
    schedule,
    notes,
  };
}
