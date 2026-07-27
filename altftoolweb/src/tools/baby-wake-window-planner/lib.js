/**
 * Baby Wake Window Planner — pure calculation module.
 *
 * A wake window is the stretch a baby can stay comfortably awake between
 * sleeps. Overshooting it produces an overtired baby who fights the nap; going
 * far under it produces a baby with too little sleep pressure who also fights
 * it. The windows lengthen steeply over the first two years.
 *
 * Rather than fixing the windows and letting bedtime fall where it may, this
 * module solves the day the way a parent actually plans it: given the morning
 * wake time and the bedtime you want, it works out the wake window each nap
 * count would require, then picks the nap count whose required window sits
 * closest to the middle of the age-appropriate range.
 *
 *   span = napCount * napLength + (napCount + 1) * wakeWindow
 *
 * Nap length itself is derived, not guessed: total daily sleep for the age
 * minus the night sleep the age typically takes, divided by the nap count.
 */

/**
 * Age bands. Wake windows are the ranges in common paediatric sleep practice.
 * `napsMin`/`napsMax` are the usual nap counts at that age.
 * `nightSleepHours` is the typical overnight portion.
 */
export const AGE_BANDS = [
  { maxMonths: 1, label: "0-1 month", windowMin: 45, windowMax: 60, napsMin: 4, napsMax: 6, nightSleepHours: 8.5 },
  { maxMonths: 2, label: "1-2 months", windowMin: 60, windowMax: 90, napsMin: 4, napsMax: 5, nightSleepHours: 9 },
  { maxMonths: 3, label: "2-3 months", windowMin: 75, windowMax: 105, napsMin: 4, napsMax: 5, nightSleepHours: 9.5 },
  { maxMonths: 4, label: "3-4 months", windowMin: 75, windowMax: 120, napsMin: 3, napsMax: 4, nightSleepHours: 10 },
  { maxMonths: 6, label: "4-6 months", windowMin: 105, windowMax: 150, napsMin: 3, napsMax: 4, nightSleepHours: 10.5 },
  { maxMonths: 9, label: "6-9 months", windowMin: 150, windowMax: 180, napsMin: 2, napsMax: 3, nightSleepHours: 11 },
  { maxMonths: 12, label: "9-12 months", windowMin: 180, windowMax: 240, napsMin: 2, napsMax: 2, nightSleepHours: 11 },
  { maxMonths: 18, label: "12-18 months", windowMin: 210, windowMax: 300, napsMin: 1, napsMax: 2, nightSleepHours: 11 },
  { maxMonths: 24, label: "18-24 months", windowMin: 300, windowMax: 360, napsMin: 1, napsMax: 1, nightSleepHours: 11 },
  { maxMonths: 37, label: "2-3 years", windowMin: 300, windowMax: 420, napsMin: 1, napsMax: 1, nightSleepHours: 11 },
];

/**
 * Total sleep per 24 hours, hours.
 * From 4 months these are the AASM consensus recommendations endorsed by the AAP.
 * Below 4 months the AASM declined to make a recommendation for lack of
 * evidence, so the National Sleep Foundation newborn range is used instead.
 */
export const TOTAL_SLEEP_BANDS = [
  { maxMonths: 4, label: "0-4 months (National Sleep Foundation)", low: 14, high: 17 },
  { maxMonths: 12, label: "4-12 months (AASM)", low: 12, high: 16 },
  { maxMonths: 37, label: "1-2 years (AASM)", low: 11, high: 14 },
];

/** Bedtimes outside this range are flagged as unusual for a baby or toddler. */
export const TYPICAL_BEDTIME_EARLIEST_MIN = 17 * 60 + 30;
export const TYPICAL_BEDTIME_LATEST_MIN = 20 * 60 + 30;

/** Oldest age this planner covers, in months. */
export const MAX_AGE_MONTHS = 36;

/** "HH:MM" -> minutes after midnight, or null when unparseable. */
export function parseTime(value) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(value).trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

/** Minutes after midnight -> "HH:MM", wrapping across midnight. */
export function formatTime(minutes) {
  const total = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Minutes as "2 h 45 min". */
export function formatDuration(minutes) {
  const total = Math.max(0, Math.round(minutes));
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

export function ageBandFor(ageMonths) {
  return AGE_BANDS.find((band) => ageMonths < band.maxMonths) || AGE_BANDS[AGE_BANDS.length - 1];
}

export function totalSleepBandFor(ageMonths) {
  return (
    TOTAL_SLEEP_BANDS.find((band) => ageMonths < band.maxMonths) ||
    TOTAL_SLEEP_BANDS[TOTAL_SLEEP_BANDS.length - 1]
  );
}

/**
 * @param {object} input
 * @param {number} input.ageMonths   baby's age in months
 * @param {string} input.wakeTime    "HH:MM" morning wake time
 * @param {string} input.bedtime     "HH:MM" target bedtime
 */
export function computeWakeWindowPlan({ ageMonths, wakeTime, bedtime } = {}) {
  const months = Number(ageMonths);
  if (!Number.isFinite(months)) return { error: "Enter the baby's age in months." };
  if (months < 0) return { error: "Age cannot be negative." };
  if (months > MAX_AGE_MONTHS) {
    return {
      error: `This planner covers babies and toddlers up to ${MAX_AGE_MONTHS} months. Most children have dropped the daytime nap by then and only need a bedtime.`,
    };
  }

  const wake = parseTime(wakeTime);
  const bed = parseTime(bedtime);
  if (wake === null || bed === null) {
    return { error: "Enter wake time and bedtime as HH:MM, for example 07:00." };
  }

  const spanMin = bed > wake ? bed - wake : bed + 1440 - wake;
  if (spanMin < 240) {
    return { error: "That leaves under four hours between waking and bedtime — check the two times." };
  }
  if (spanMin > 16 * 60) {
    return { error: "More than 16 hours awake in a day is too long for a baby or toddler — check the times." };
  }

  const band = ageBandFor(months);
  const sleepBand = totalSleepBandFor(months);
  const totalSleepMidHours = (sleepBand.low + sleepBand.high) / 2;
  const daytimeSleepMin = Math.max(0, (totalSleepMidHours - band.nightSleepHours) * 60);

  // Try each plausible nap count and see what wake window it demands.
  const windowMid = (band.windowMin + band.windowMax) / 2;
  const candidates = [];
  for (let naps = band.napsMin; naps <= band.napsMax; naps += 1) {
    const napLength = daytimeSleepMin / naps;
    const requiredWindow = (spanMin - daytimeSleepMin) / (naps + 1);
    if (requiredWindow <= 0) continue;
    candidates.push({
      naps,
      napLengthMin: Math.round(napLength),
      requiredWindowMin: Math.round(requiredWindow),
      inRange: requiredWindow >= band.windowMin && requiredWindow <= band.windowMax,
      distanceFromMid: Math.abs(requiredWindow - windowMid),
    });
  }

  if (candidates.length === 0) {
    return {
      error:
        "The nap sleep this age needs does not fit between the wake time and bedtime you entered. Try a later bedtime or an earlier wake time.",
    };
  }

  candidates.sort((a, b) => {
    if (a.inRange !== b.inRange) return a.inRange ? -1 : 1;
    return a.distanceFromMid - b.distanceFromMid;
  });
  const best = candidates[0];

  // Build the day.
  const schedule = [];
  let cursor = wake;
  for (let i = 0; i < best.naps; i += 1) {
    const napStart = cursor + best.requiredWindowMin;
    const napEnd = napStart + best.napLengthMin;
    schedule.push({
      index: i + 1,
      awakeFrom: formatTime(cursor),
      napStart: formatTime(napStart),
      napEnd: formatTime(napEnd),
      windowLabel: formatDuration(best.requiredWindowMin),
      napLabel: formatDuration(best.napLengthMin),
    });
    cursor = napEnd;
  }
  const computedBedtime = cursor + best.requiredWindowMin;

  return {
    bandLabel: band.label,
    windowMin: band.windowMin,
    windowMax: band.windowMax,
    windowRangeLabel: `${formatDuration(band.windowMin)} – ${formatDuration(band.windowMax)}`,
    typicalNaps: band.napsMin === band.napsMax ? `${band.napsMin}` : `${band.napsMin}-${band.napsMax}`,
    sleepBandLabel: sleepBand.label,
    totalSleepLow: sleepBand.low,
    totalSleepHigh: sleepBand.high,
    nightSleepHours: band.nightSleepHours,
    daytimeSleepMin: Math.round(daytimeSleepMin),
    daytimeSleepLabel: formatDuration(daytimeSleepMin),
    naps: best.naps,
    napLengthMin: best.napLengthMin,
    napLengthLabel: formatDuration(best.napLengthMin),
    requiredWindowMin: best.requiredWindowMin,
    requiredWindowLabel: formatDuration(best.requiredWindowMin),
    windowInRange: best.inRange,
    windowTooShort: best.requiredWindowMin < band.windowMin,
    windowTooLong: best.requiredWindowMin > band.windowMax,
    spanMin,
    spanLabel: formatDuration(spanMin),
    wakeTime: formatTime(wake),
    bedtime: formatTime(bed),
    computedBedtime: formatTime(computedBedtime),
    bedtimeUnusual: bed < TYPICAL_BEDTIME_EARLIEST_MIN || bed > TYPICAL_BEDTIME_LATEST_MIN,
    schedule,
    alternatives: candidates,
  };
}

export default computeWakeWindowPlan;
