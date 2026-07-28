/**
 * 16:8 time-restricted eating window planner.
 *
 * The 16:8 pattern means all food is taken inside an 8-hour window and the
 * remaining 16 hours of the 24-hour day are a water-only fast. The two numbers
 * are definitional: eating hours + fasting hours always sum to 24.
 *
 * Timing rules encoded here:
 *  - Fasting hours = 24 - eating hours, by definition of a time-restricted
 *    eating protocol.
 *  - Sleep does most of the work. Positioning the window so the fast overlaps
 *    the sleep period is what makes 16 hours practical, so the planner reports
 *    how many fasting hours fall inside your sleep block.
 *  - Finishing the last meal about 3 hours before bed is standard advice for
 *    reflux and sleep quality, so a last meal closer than that is flagged.
 *  - A substantial meal wants roughly 90 minutes to 3 hours before hard
 *    training to clear the stomach.
 *  - Protein after training is best taken within a few hours rather than a
 *    narrow "anabolic window"; this planner flags a gap over about 2 hours
 *    between finishing a session and the next meal, which is comfortably inside
 *    the evidence.
 *
 * Nothing here reads the system clock — all times come in as "HH:MM" strings.
 */

/** A full day, in minutes. */
export const MINUTES_PER_DAY = 1440;

/** Default eating window for the 16:8 pattern, in hours. */
export const DEFAULT_EATING_HOURS = 8;

/** Bounds for a customised window. Outside these it is no longer 16:8-like. */
export const MIN_EATING_HOURS = 4;
export const MAX_EATING_HOURS = 12;

/** Aim to finish the last meal this many hours before bed. */
export const HOURS_BEFORE_BED = 3;

/** Gap left between the last meal and the window closing, in minutes. */
export const LAST_MEAL_BUFFER_MINUTES = 30;

/** A full meal wants at least this long before hard training. */
export const PRE_WORKOUT_CLEARANCE_MINUTES = 90;

/** Flag a post-training gap longer than this before the next meal. */
export const POST_WORKOUT_TARGET_MINUTES = 120;

/** Supported meal counts inside the window. */
export const MEAL_COUNT_OPTIONS = Object.freeze([2, 3, 4]);

/** Parse "HH:MM" into minutes past midnight, or null. */
export function parseClock(value) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(value ?? "").trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/** Format minutes past midnight as "HH:MM", wrapping across midnight. */
export function formatClock(minutes) {
  if (!Number.isFinite(minutes)) return "--:--";
  const wrapped = ((Math.round(minutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  return `${String(Math.floor(wrapped / 60)).padStart(2, "0")}:${String(wrapped % 60).padStart(2, "0")}`;
}

/** Format a minute count as "3 h 45 min". */
export function formatDuration(minutes) {
  if (!Number.isFinite(minutes)) return "—";
  const sign = minutes < 0 ? "-" : "";
  const total = Math.round(Math.abs(minutes));
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  if (hours === 0) return `${sign}${rest} min`;
  if (rest === 0) return `${sign}${hours} h`;
  return `${sign}${hours} h ${rest} min`;
}

/** Length of the interval from `start` forward to `end`, wrapping midnight. */
export function forwardMinutes(start, end) {
  if (!Number.isFinite(start) || !Number.isFinite(end)) return NaN;
  return ((end - start) % MINUTES_PER_DAY + MINUTES_PER_DAY) % MINUTES_PER_DAY;
}

function linearOverlap(aStart, aEnd, bStart, bEnd) {
  return Math.max(0, Math.min(aEnd, bEnd) - Math.max(aStart, bStart));
}

/**
 * Minutes of overlap between two intervals laid on a repeating 24-hour clock.
 * Each interval is given as a start (minutes past midnight) and a length.
 */
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
 * Build a 16:8 plan.
 *
 * @param {object} input
 * @param {string} input.anchor        "start" (first meal time given) or "end" (last-bite deadline given).
 * @param {string} input.anchorTime    "HH:MM" for whichever anchor is chosen.
 * @param {number} input.eatingHours   Length of the eating window in hours.
 * @param {number} input.mealsPerDay   Number of meals inside the window.
 * @param {string} input.bedtime       "HH:MM".
 * @param {string} input.wakeTime      "HH:MM".
 * @param {string} [input.workoutTime] "HH:MM", optional.
 * @returns {object|{error:string}}
 */
export function planFastingWindow(input) {
  const { anchor, anchorTime, eatingHours, mealsPerDay, bedtime, wakeTime, workoutTime } = input || {};

  if (anchor !== "start" && anchor !== "end") {
    return { error: "Choose whether you are anchoring the window to your first meal or your last." };
  }
  const anchorMinutes = parseClock(anchorTime);
  if (anchorMinutes === null) return { error: "Enter the anchor time as a 24-hour clock time, e.g. 12:00." };

  if (!Number.isFinite(eatingHours)) return { error: "Enter the eating window length in hours." };
  if (eatingHours < MIN_EATING_HOURS || eatingHours > MAX_EATING_HOURS) {
    return { error: `Set an eating window between ${MIN_EATING_HOURS} and ${MAX_EATING_HOURS} hours.` };
  }

  if (!MEAL_COUNT_OPTIONS.includes(mealsPerDay)) {
    return { error: `Choose ${MEAL_COUNT_OPTIONS.join(", ")} meals inside the window.` };
  }

  const bedMinutes = parseClock(bedtime);
  if (bedMinutes === null) return { error: "Enter your usual bedtime as a 24-hour clock time." };
  const wakeMinutes = parseClock(wakeTime);
  if (wakeMinutes === null) return { error: "Enter your usual wake time as a 24-hour clock time." };

  const sleepMinutes = forwardMinutes(bedMinutes, wakeMinutes);
  if (sleepMinutes === 0) return { error: "Bedtime and wake time cannot be the same." };

  const windowMinutes = Math.round(eatingHours * 60);
  const fastingMinutes = MINUTES_PER_DAY - windowMinutes;

  const eatingStart = anchor === "start" ? anchorMinutes : (anchorMinutes - windowMinutes + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const eatingEnd = (eatingStart + windowMinutes) % MINUTES_PER_DAY;

  // Meals run from the window opening to a buffer before it closes.
  const usableSpan = Math.max(0, windowMinutes - LAST_MEAL_BUFFER_MINUTES);
  const spacing = mealsPerDay > 1 ? usableSpan / (mealsPerDay - 1) : 0;
  const meals = Array.from({ length: mealsPerDay }, (unused, index) => {
    const offset = Math.round(index * spacing);
    return {
      index: index + 1,
      offset,
      at: (eatingStart + offset) % MINUTES_PER_DAY,
      role:
        index === 0
          ? "Break the fast"
          : index === mealsPerDay - 1
            ? "Last bite"
            : "Mid-window meal",
    };
  });

  const lastMeal = meals[meals.length - 1];
  const lastMealToBed = forwardMinutes(lastMeal.at, bedMinutes);
  const fastAsleepMinutes = circularOverlapMinutes(eatingEnd, fastingMinutes, bedMinutes, sleepMinutes);
  const fastAwakeMinutes = fastingMinutes - fastAsleepMinutes;
  const wakeToFirstMeal = forwardMinutes(wakeMinutes, eatingStart);

  const warnings = [];
  if (lastMealToBed < HOURS_BEFORE_BED * 60) {
    warnings.push(
      `Your last meal is only ${formatDuration(lastMealToBed)} before bed. Aim for about ${HOURS_BEFORE_BED} hours to avoid reflux and lighter sleep — shift the whole window earlier rather than skipping the meal.`,
    );
  }
  if (circularOverlapMinutes(eatingStart, windowMinutes, bedMinutes, sleepMinutes) > 0) {
    warnings.push("Part of your eating window falls inside your sleep block, so you cannot actually use all of it. Move the window.");
  }

  let workout = null;
  if (workoutTime) {
    const workoutMinutes = parseClock(workoutTime);
    if (workoutMinutes === null) return { error: "Enter the training time as a 24-hour clock time, or leave it blank." };

    // Everything is measured as an offset from the window opening, so the
    // comparisons never have to reason about midnight.
    const workoutOffset = forwardMinutes(eatingStart, workoutMinutes);
    const insideWindow = workoutOffset < windowMinutes;

    const earlier = insideWindow ? meals.filter((meal) => meal.offset <= workoutOffset) : [];
    const previousMeal = earlier.length ? earlier[earlier.length - 1] : null;
    const later = insideWindow ? meals.filter((meal) => meal.offset > workoutOffset) : meals;
    const nextMeal = later.length ? later[0] : null;

    const minutesSincePreviousMeal = previousMeal ? workoutOffset - previousMeal.offset : null;
    const minutesToNextMeal = nextMeal ? forwardMinutes(workoutMinutes, nextMeal.at) : null;

    const notes = [];
    if (!insideWindow) {
      notes.push(
        `You train fasted — the window opens ${formatDuration(forwardMinutes(workoutMinutes, eatingStart))} after you start. That suits easy or moderate sessions; for hard or long sessions, move the window earlier so training sits inside it.`,
      );
    } else if (minutesSincePreviousMeal !== null && minutesSincePreviousMeal < PRE_WORKOUT_CLEARANCE_MINUTES) {
      notes.push(
        `Only ${formatDuration(minutesSincePreviousMeal)} between that meal and training. Allow about ${formatDuration(PRE_WORKOUT_CLEARANCE_MINUTES)} for a full meal, or make it a small, low-fat one.`,
      );
    } else if (minutesSincePreviousMeal !== null) {
      notes.push(`Fed training — you eat ${formatDuration(minutesSincePreviousMeal)} beforehand, which is comfortable.`);
    }

    if (minutesToNextMeal !== null && minutesToNextMeal > POST_WORKOUT_TARGET_MINUTES) {
      notes.push(
        `Your next meal is ${formatDuration(minutesToNextMeal)} after training. Bringing a protein-containing meal inside about ${formatDuration(POST_WORKOUT_TARGET_MINUTES)} is easier on recovery.`,
      );
    } else if (minutesToNextMeal !== null) {
      notes.push(`You eat ${formatDuration(minutesToNextMeal)} after training, which covers recovery well.`);
    } else {
      notes.push("Training lands after your last meal, so recovery food waits until tomorrow's window. Consider moving the session earlier.");
    }

    workout = {
      at: workoutMinutes,
      insideWindow,
      previousMeal,
      nextMeal,
      minutesSincePreviousMeal,
      minutesToNextMeal,
      notes,
    };
  }

  return {
    eatingStart,
    eatingEnd,
    windowMinutes,
    fastingMinutes,
    fastingHours: fastingMinutes / 60,
    eatingHours: windowMinutes / 60,
    ratioLabel: `${Math.round(fastingMinutes / 60)}:${Math.round(windowMinutes / 60)}`,
    meals,
    sleepMinutes,
    fastAsleepMinutes,
    fastAwakeMinutes,
    fastAsleepPct: fastingMinutes > 0 ? (fastAsleepMinutes / fastingMinutes) * 100 : 0,
    wakeToFirstMeal,
    lastMealToBed,
    warnings,
    workout,
  };
}
