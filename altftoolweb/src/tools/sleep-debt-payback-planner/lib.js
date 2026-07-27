/**
 * Sleep debt payback maths.
 *
 * Sleep debt is the cumulative shortfall between the sleep you need and the
 * sleep you actually got: debt = SUM over nights of max(0, target - actual).
 * A night where you slept longer than target is recorded as surplus, but it is
 * NOT subtracted from the debt — extra sleep on one night does not undo the
 * deficit of another, it only pays part of it back on that day.
 *
 * Payback rule: recovery sleep is added in small nightly instalments instead of
 * one long weekend lie-in, because a large shift in wake time between weekdays
 * and free days ("social jet lag") moves the circadian clock and makes the next
 * week harder. The planner therefore caps the extra sleep added to any single
 * night.
 */

/** Adults 18-64 need 7-9 h per night (AASM / Sleep Research Society consensus); 8 h is the usual planning midpoint. */
export const DEFAULT_TARGET_SLEEP_HOURS = 8;

/** Below 4 h a "target" is not a sleep plan, so we reject it as an input error. */
export const MIN_TARGET_SLEEP_HOURS = 4;

/** Above 12 h a nightly target is outside any adult recommendation. */
export const MAX_TARGET_SLEEP_HOURS = 12;

/** Extra sleep added to one night is capped at 2 h: shifting wake time by more than ~2 h is the point where weekend sleep behaves like jet lag. */
export const MAX_SAFE_EXTRA_PER_NIGHT_HOURS = 2;

/** A 30-60 min earlier bedtime is the instalment most people can actually keep; 1 h is the default here. */
export const RECOMMENDED_EXTRA_PER_NIGHT_HOURS = 1;

/** Planning horizon guard - beyond a month this stops being a recovery plan. */
export const MAX_RECOVERY_DAYS = 30;

/** No night can be longer than a day. */
export const MAX_NIGHT_HOURS = 24;

export const MINUTES_PER_HOUR = 60;
export const MINUTES_PER_DAY = 1440;

export const NIGHT_LABELS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

/** "23:15" -> 1395 minutes past midnight. Returns null when unparseable. */
export function parseClock(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * MINUTES_PER_HOUR + minutes;
}

/** 1395 -> "23:15". Wraps around midnight in both directions. */
export function formatClock(totalMinutes) {
  if (!isFiniteNumber(totalMinutes)) return "--:--";
  const wrapped = ((Math.round(totalMinutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours = Math.floor(wrapped / MINUTES_PER_HOUR);
  const minutes = wrapped % MINUTES_PER_HOUR;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/** 1.75 -> "1h 45m". Always non-negative. */
export function formatDuration(hours) {
  if (!isFiniteNumber(hours) || hours <= 0) return "0h 00m";
  const totalMinutes = Math.round(hours * MINUTES_PER_HOUR);
  const h = Math.floor(totalMinutes / MINUTES_PER_HOUR);
  const m = totalMinutes % MINUTES_PER_HOUR;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

/**
 * @param {object} input
 * @param {number} input.targetHours      nightly sleep need
 * @param {number[]} input.nights         hours actually slept, one entry per night
 * @param {number} input.extraPerNightHours  extra sleep you are willing to add per recovery night
 * @param {number} input.recoveryDays     how many nights the payback is spread over
 * @param {string} input.wakeTime         fixed wake-up clock time, "HH:MM"
 */
export function planSleepDebtPayback({
  targetHours,
  nights,
  extraPerNightHours,
  recoveryDays,
  wakeTime,
} = {}) {
  if (!isFiniteNumber(targetHours)) {
    return { error: "Enter your nightly sleep target in hours." };
  }
  if (targetHours < MIN_TARGET_SLEEP_HOURS || targetHours > MAX_TARGET_SLEEP_HOURS) {
    return {
      error: `Nightly sleep target should be between ${MIN_TARGET_SLEEP_HOURS} and ${MAX_TARGET_SLEEP_HOURS} hours.`,
    };
  }
  if (!Array.isArray(nights) || nights.length === 0) {
    return { error: "Add at least one night of recorded sleep." };
  }
  if (nights.some((value) => !isFiniteNumber(value))) {
    return { error: "Every night needs a number of hours slept." };
  }
  if (nights.some((value) => value < 0 || value > MAX_NIGHT_HOURS)) {
    return { error: `Hours slept must be between 0 and ${MAX_NIGHT_HOURS} for each night.` };
  }
  if (!isFiniteNumber(extraPerNightHours) || extraPerNightHours <= 0) {
    return { error: "Extra sleep per recovery night must be greater than zero." };
  }
  if (!isFiniteNumber(recoveryDays) || recoveryDays < 1) {
    return { error: "Give yourself at least one recovery night." };
  }
  if (recoveryDays > MAX_RECOVERY_DAYS) {
    return { error: `Spread the payback over ${MAX_RECOVERY_DAYS} nights or fewer.` };
  }

  const wakeMinutes = parseClock(wakeTime);
  if (wakeMinutes === null) {
    return { error: "Enter your wake-up time as HH:MM, for example 06:30." };
  }

  const days = Math.floor(recoveryDays);
  const cappedExtra = Math.min(extraPerNightHours, MAX_SAFE_EXTRA_PER_NIGHT_HOURS);
  const extraWasCapped = extraPerNightHours > MAX_SAFE_EXTRA_PER_NIGHT_HOURS;

  let debtHours = 0;
  let surplusHours = 0;
  let sleptHours = 0;
  let shortfallNights = 0;

  const nightRows = nights.map((slept, index) => {
    const gap = targetHours - slept;
    const shortfall = Math.max(0, gap);
    const surplus = Math.max(0, -gap);
    debtHours += shortfall;
    surplusHours += surplus;
    sleptHours += slept;
    if (shortfall > 0) shortfallNights += 1;
    return {
      label: NIGHT_LABELS[index % NIGHT_LABELS.length],
      index,
      slept,
      shortfallHours: shortfall,
      surplusHours: surplus,
    };
  });

  const averageSleepHours = sleptHours / nights.length;

  // Even split across the chosen recovery nights, never above the safe cap.
  const evenSplit = debtHours / days;
  const perNightExtraHours = Math.min(evenSplit, cappedExtra);

  const schedule = [];
  let debtLeft = debtHours;
  for (let day = 1; day <= days; day += 1) {
    const applied = Math.min(perNightExtraHours, debtLeft);
    debtLeft = Math.max(0, debtLeft - applied);
    const nightSleepHours = targetHours + applied;
    schedule.push({
      day,
      extraHours: applied,
      nightSleepHours,
      // Wake time is held fixed; the whole shift is taken by going to bed earlier.
      bedtimeMinutes: wakeMinutes - Math.round(nightSleepHours * MINUTES_PER_HOUR),
      bedtime: formatClock(wakeMinutes - Math.round(nightSleepHours * MINUTES_PER_HOUR)),
      remainingDebtHours: debtLeft,
    });
  }

  const daysNeededAtCap = debtHours > 0 ? Math.ceil(debtHours / cappedExtra) : 0;
  const singleLieInHours = debtHours; // what one catch-up night would have to absorb
  const baselineBedtimeMinutes = wakeMinutes - Math.round(targetHours * MINUTES_PER_HOUR);

  return {
    debtHours,
    surplusHours,
    averageSleepHours,
    shortfallNights,
    nightsCounted: nights.length,
    perNightExtraHours,
    perNightExtraMinutes: Math.round(perNightExtraHours * MINUTES_PER_HOUR),
    cappedExtraHours: cappedExtra,
    extraWasCapped,
    recoveryDays: days,
    schedule,
    clearedHours: debtHours - debtLeft,
    remainingDebtHours: debtLeft,
    fullyCleared: debtLeft <= 0.0001,
    daysNeededAtCap,
    singleLieInHours,
    socialJetLagRisk: singleLieInHours > MAX_SAFE_EXTRA_PER_NIGHT_HOURS,
    baselineBedtime: formatClock(baselineBedtimeMinutes),
    wakeTime: formatClock(wakeMinutes),
    nightRows,
  };
}
