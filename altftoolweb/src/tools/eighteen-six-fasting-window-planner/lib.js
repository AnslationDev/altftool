/**
 * 18:6 time-restricted eating: a 6-hour, two-meal window and an 18-hour fast,
 * with the hydration maths that a shorter window makes matter.
 *
 * Rules and reference figures used:
 *  - Eating hours + fasting hours = 24 by definition, so a 6-hour window is an
 *    18-hour fast.
 *  - EFSA adequate intake for TOTAL water is 2.5 L a day for adult men and
 *    2.0 L a day for adult women, from food and drink combined, for people in
 *    a temperate climate with moderate activity.
 *  - EFSA puts the share of total water coming from food at roughly 20-30%.
 *    This module uses 20%, which lines up with EFSA's own beverage figures of
 *    about 2.0 L a day for men and 1.6 L a day for women.
 *  - That food share arrives only inside the eating window, which is why a
 *    6-hour window shifts more of the day's fluid onto plain drinks during the
 *    fast.
 *  - Exercise: ACSM puts typical sweat rates at roughly 0.4 to 0.8 litres per
 *    hour, higher in heat, and recommends replacing losses.
 *  - Sweat sodium averages around 1 gram per litre (individual range is wide,
 *    roughly 0.5-1.5 g/L).
 *  - WHO recommends adults keep sodium below 2000 mg a day, which is about 5 g
 *    of salt. Most diets already exceed this, so sweat losses are usually
 *    covered by normally salted food rather than supplements.
 *  - Tapering fluids in the couple of hours before bed reduces night waking.
 */

export const MINUTES_PER_DAY = 1440;

/** Default 18:6 window length, in hours. */
export const DEFAULT_EATING_HOURS = 6;
export const MIN_EATING_HOURS = 4;
export const MAX_EATING_HOURS = 10;

/** EFSA adequate intake for total water, millilitres per day. */
export const TOTAL_WATER_AI_ML = Object.freeze({ male: 2500, female: 2000 });

/** Share of total water that normally comes from food (EFSA: 20-30%). */
export const FOOD_WATER_SHARE = 0.2;

/** ACSM typical sweat rate options, litres per hour. */
export const SWEAT_RATES_L_PER_HOUR = Object.freeze([0.4, 0.6, 0.8]);

/** Typical sweat sodium concentration, milligrams per litre. */
export const SWEAT_SODIUM_MG_PER_LITRE = 1000;

/** WHO adult sodium recommendation, milligrams per day (about 5 g salt). */
export const WHO_SODIUM_LIMIT_MG = 2000;

/** Millilitres treated as one drink when building the schedule. */
export const GLASS_ML = 250;

/** Stop scheduling drinks this long before bed. */
export const FLUID_TAPER_BEFORE_BED_MINUTES = 120;

/** Gap left between the last meal and the window closing. */
export const LAST_MEAL_BUFFER_MINUTES = 30;

/** Upper bound on daily training time this planner will accept, in minutes. */
export const MAX_TRAINING_MINUTES = 300;

export function parseClock(value) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(value ?? "").trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

export function formatClock(minutes) {
  if (!Number.isFinite(minutes)) return "--:--";
  const wrapped = ((Math.round(minutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  return `${String(Math.floor(wrapped / 60)).padStart(2, "0")}:${String(wrapped % 60).padStart(2, "0")}`;
}

export function formatDuration(minutes) {
  if (!Number.isFinite(minutes)) return "—";
  const total = Math.round(Math.abs(minutes));
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  const sign = minutes < 0 ? "-" : "";
  if (hours === 0) return `${sign}${rest} min`;
  if (rest === 0) return `${sign}${hours} h`;
  return `${sign}${hours} h ${rest} min`;
}

export function forwardMinutes(start, end) {
  if (!Number.isFinite(start) || !Number.isFinite(end)) return NaN;
  return (((end - start) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
}

function linearOverlap(aStart, aEnd, bStart, bEnd) {
  return Math.max(0, Math.min(aEnd, bEnd) - Math.max(aStart, bStart));
}

/** Overlap in minutes between two intervals on a repeating 24-hour clock. */
export function circularOverlapMinutes(aStart, aLength, bStart, bLength) {
  if (![aStart, aLength, bStart, bLength].every(Number.isFinite)) return NaN;
  if (aLength <= 0 || bLength <= 0) return 0;
  let total = 0;
  for (let shift = -1; shift <= 1; shift += 1) {
    total += linearOverlap(
      aStart,
      aStart + aLength,
      bStart + shift * MINUTES_PER_DAY,
      bStart + shift * MINUTES_PER_DAY + bLength,
    );
  }
  return total;
}

/**
 * Build an 18:6 plan with hydration and electrolyte figures.
 *
 * @param {object} input
 * @param {string} input.anchor        "start" or "end".
 * @param {string} input.anchorTime    "HH:MM".
 * @param {number} input.eatingHours   Window length in hours.
 * @param {string} input.bedtime       "HH:MM".
 * @param {string} input.wakeTime      "HH:MM".
 * @param {string} input.sex           "male" | "female" (EFSA water AI band).
 * @param {number} input.trainingMinutes Minutes of training per day.
 * @param {number} input.sweatRate     Litres of sweat per hour of training.
 * @returns {object|{error:string}}
 */
export function planEighteenSix(input) {
  const { anchor, anchorTime, eatingHours, bedtime, wakeTime, sex, trainingMinutes, sweatRate } = input || {};

  if (anchor !== "start" && anchor !== "end") {
    return { error: "Choose whether you are anchoring the window to your first meal or your last." };
  }
  const anchorMinutes = parseClock(anchorTime);
  if (anchorMinutes === null) return { error: "Enter the anchor time as a 24-hour clock time, e.g. 13:00." };

  if (!Number.isFinite(eatingHours)) return { error: "Enter the eating window length in hours." };
  if (eatingHours < MIN_EATING_HOURS || eatingHours > MAX_EATING_HOURS) {
    return { error: `Set an eating window between ${MIN_EATING_HOURS} and ${MAX_EATING_HOURS} hours.` };
  }

  const bedMinutes = parseClock(bedtime);
  if (bedMinutes === null) return { error: "Enter your usual bedtime as a 24-hour clock time." };
  const wakeMinutes = parseClock(wakeTime);
  if (wakeMinutes === null) return { error: "Enter your usual wake time as a 24-hour clock time." };

  const sleepMinutes = forwardMinutes(bedMinutes, wakeMinutes);
  if (sleepMinutes === 0) return { error: "Bedtime and wake time cannot be the same." };
  const wakingMinutes = MINUTES_PER_DAY - sleepMinutes;

  if (!Object.prototype.hasOwnProperty.call(TOTAL_WATER_AI_ML, sex)) {
    return { error: "Choose which water intake reference to use." };
  }

  const training = Number(trainingMinutes);
  if (!Number.isFinite(training)) return { error: "Enter your daily training time in minutes, or 0." };
  if (training < 0) return { error: "Training minutes cannot be negative." };
  if (training > MAX_TRAINING_MINUTES) {
    return { error: `Enter up to ${MAX_TRAINING_MINUTES} minutes of training a day.` };
  }

  const sweat = Number(sweatRate);
  if (!SWEAT_RATES_L_PER_HOUR.includes(sweat)) {
    return { error: `Choose a sweat rate of ${SWEAT_RATES_L_PER_HOUR.join(", ")} litres per hour.` };
  }

  const windowMinutes = Math.round(eatingHours * 60);
  const fastingMinutes = MINUTES_PER_DAY - windowMinutes;

  const eatingStart =
    anchor === "start" ? anchorMinutes : (anchorMinutes - windowMinutes + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const eatingEnd = (eatingStart + windowMinutes) % MINUTES_PER_DAY;

  // Two meals: one on opening, one a short buffer before the window closes.
  const secondMealOffset = Math.max(0, windowMinutes - LAST_MEAL_BUFFER_MINUTES);
  const meals = [
    { index: 1, offset: 0, at: eatingStart, role: "Break the fast", note: "Make it the larger, protein-led meal — you have limited time to fit the day's food in." },
    {
      index: 2,
      offset: secondMealOffset,
      at: (eatingStart + secondMealOffset) % MINUTES_PER_DAY,
      role: "Last bite",
      note: "Window closes 30 minutes later. Include vegetables and fluid-rich food; both count towards hydration.",
    },
  ];

  const eatingAsleepMinutes = circularOverlapMinutes(eatingStart, windowMinutes, bedMinutes, sleepMinutes);
  const eatingWakingMinutes = windowMinutes - eatingAsleepMinutes;
  const fastAsleepMinutes = circularOverlapMinutes(eatingEnd, fastingMinutes, bedMinutes, sleepMinutes);
  const fastWakingMinutes = fastingMinutes - fastAsleepMinutes;

  // Hydration.
  const totalWaterMl = TOTAL_WATER_AI_ML[sex];
  const foodWaterMl = totalWaterMl * FOOD_WATER_SHARE;
  const trainingHours = training / 60;
  const sweatLitres = trainingHours * sweat;
  const exerciseMl = Math.round(sweatLitres * 1000);
  const drinkTargetMl = Math.round(totalWaterMl - foodWaterMl + exerciseMl);

  const fastingShareMl = wakingMinutes > 0 ? Math.round((drinkTargetMl * fastWakingMinutes) / wakingMinutes) : 0;
  const eatingShareMl = drinkTargetMl - fastingShareMl;

  // Drink prompts run from waking to the fluid taper before bed.
  const drinkingSpan = Math.max(0, wakingMinutes - FLUID_TAPER_BEFORE_BED_MINUTES);
  const glassCount = Math.max(1, Math.round(drinkTargetMl / GLASS_ML));
  const spacing = glassCount > 1 ? drinkingSpan / (glassCount - 1) : 0;
  const drinkSchedule = Array.from({ length: glassCount }, (unused, index) => {
    const at = (wakeMinutes + Math.round(index * spacing)) % MINUTES_PER_DAY;
    const insideWindow = forwardMinutes(eatingStart, at) < windowMinutes;
    return {
      index: index + 1,
      at,
      ml: Math.round(drinkTargetMl / glassCount),
      insideWindow,
    };
  });

  // Electrolytes.
  const sodiumLostMg = Math.round(sweatLitres * SWEAT_SODIUM_MG_PER_LITRE);

  const prompts = [
    "Water, plain black coffee and plain tea keep the fast; anything with sugar, milk or juice ends it.",
    `Spread drinks across the day rather than catching up at the end — the plan stops scheduling ${formatDuration(FLUID_TAPER_BEFORE_BED_MINUTES)} before bed to cut night waking.`,
    "Dark yellow urine, a dry mouth or a dull headache during the fast usually means fluid, not food.",
  ];
  if (sodiumLostMg > 0) {
    prompts.push(
      `Training loses roughly ${sodiumLostMg} mg of sodium in sweat at this rate. Normally salted food inside your window usually covers it — WHO's guidance is to stay under ${WHO_SODIUM_LIMIT_MG} mg of sodium a day, and most diets are already above that.`,
    );
  }
  if (windowMinutes <= 6 * 60) {
    prompts.push("A 6-hour window leaves little room to catch up on fluid at the table, so most of the day's drinking has to happen during the fast.");
  }

  const warnings = [];
  if (eatingAsleepMinutes > 0) {
    warnings.push("Part of your eating window falls inside your sleep block, so you cannot use all of it. Move the window earlier or later.");
  }
  const lastMealToBed = forwardMinutes(meals[1].at, bedMinutes);
  if (lastMealToBed < 180) {
    warnings.push(
      `Your second meal is only ${formatDuration(lastMealToBed)} before bed. Around 3 hours is the usual target for reflux and sleep quality.`,
    );
  }

  return {
    eatingStart,
    eatingEnd,
    windowMinutes,
    fastingMinutes,
    ratioLabel: `${Math.round(fastingMinutes / 60)}:${Math.round(windowMinutes / 60)}`,
    meals,
    sleepMinutes,
    wakingMinutes,
    fastAsleepMinutes,
    fastWakingMinutes,
    eatingWakingMinutes,
    lastMealToBed,
    hydration: {
      totalWaterMl,
      foodWaterMl: Math.round(foodWaterMl),
      exerciseMl,
      drinkTargetMl,
      fastingShareMl,
      eatingShareMl,
      glassCount,
      glassMl: Math.round(drinkTargetMl / glassCount),
      schedule: drinkSchedule,
    },
    electrolytes: {
      sweatLitres,
      sodiumLostMg,
      whoLimitMg: WHO_SODIUM_LIMIT_MG,
      sodiumAsPctOfLimit: (sodiumLostMg / WHO_SODIUM_LIMIT_MG) * 100,
    },
    prompts,
    warnings,
  };
}
