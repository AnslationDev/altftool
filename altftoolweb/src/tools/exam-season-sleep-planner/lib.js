/**
 * Exam-season sleep and study planner.
 *
 * Three separate calculations, all pure — times come in as "HH:MM" strings:
 *
 * 1. Exam-day wake time. The later of the two constraints wins in reverse:
 *      logistics wake = exam start − commute − getting-ready
 *      alertness wake = exam start − 2 h (time for sleep inertia to clear)
 *    The earlier of the two is used, so you are both on time and awake.
 *
 * 2. Bedtime = wake − sleep target − sleep-onset latency.
 *
 * 3. Body-clock shift. Moving a bedtime earlier (a phase advance) is limited to roughly
 *    30 minutes per day; larger jumps just produce time lying awake. Days needed =
 *    ceil(minutes to advance / 30).
 *
 * Study blocks are laid out as focus/break cycles from a chosen start time until the day's
 * focus-minute target is met.
 *
 * Evidence behind the constants:
 *  - AASM / Sleep Research Society consensus (SLEEP, 2015): adults 7+ h; teens 13-18 need 8-10 h.
 *  - Sleep-dependent memory consolidation: material reviewed shortly before sleep is
 *    consolidated during the night, so the last study slot is reserved for the hardest topic.
 *  - Sleep inertia after waking typically clears within 15-60 minutes; cognitive performance
 *    is generally solid from about 2 hours after wake time.
 */

export const MINUTES_PER_DAY = 1440;

/** Practical limit for advancing (moving earlier) a sleep schedule, minutes per day. */
export const MAX_PHASE_ADVANCE_PER_DAY_MIN = 30;

/** Be awake this long before the exam so sleep inertia has cleared. */
export const WAKE_BEFORE_EXAM_H = 2;

/** Adult minimum from the AASM/SRS consensus statement. */
export const ADULT_MIN_SLEEP_H = 7;
/** Teenagers aged 13-18 need 8-10 hours (AASM paediatric consensus). */
export const TEEN_MIN_SLEEP_H = 8;

export const DEFAULT_SLEEP_LATENCY_MIN = 15;
export const DEFAULT_FOCUS_BLOCK_MIN = 50;
export const DEFAULT_BREAK_MIN = 10;

/** Reserve the last slot before wind-down for the hardest material. */
export const PRE_SLEEP_REVIEW_MIN = 30;
/** Re-test the same material this long after waking (spaced retrieval). */
export const MORNING_REVIEW_AFTER_WAKE_MIN = 60;
/** No new material inside this window before lights-out. */
export const WIND_DOWN_MIN = 45;

/** Guard rails so a typo cannot produce a confident wrong plan. */
export const MAX_STUDY_HOURS_PER_DAY = 14;
export const MAX_BLOCKS = 40;

const pad2 = (n) => String(n).padStart(2, "0");

export function parseTimeToMinutes(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

export function toClock(absoluteMinutes) {
  if (!Number.isFinite(absoluteMinutes)) return null;
  const rounded = Math.round(absoluteMinutes);
  const dayOffset = Math.floor(rounded / MINUTES_PER_DAY);
  const within = rounded - dayOffset * MINUTES_PER_DAY;
  const h = Math.floor(within / 60);
  const m = within % 60;
  const time = `${pad2(h)}:${pad2(m)}`;
  return {
    minutes: rounded,
    minutesOfDay: within,
    dayOffset,
    time,
    label: dayOffset === 0 ? time : `${time} (${dayOffset < 0 ? "previous day" : "next day"})`,
  };
}

export function formatDuration(totalMinutes) {
  if (!Number.isFinite(totalMinutes) || totalMinutes < 0) return "—";
  const mins = Math.round(totalMinutes);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

/**
 * Minutes you need to move a bedtime EARLIER to get from `fromMinutesOfDay` to
 * `toMinutesOfDay`. Returns a negative number when the target is actually later.
 */
export function phaseAdvanceMinutes(fromMinutesOfDay, toMinutesOfDay) {
  const raw = (((fromMinutesOfDay - toMinutesOfDay) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  // More than 12 h "earlier" is really a delay in the other direction.
  return raw > MINUTES_PER_DAY / 2 ? raw - MINUTES_PER_DAY : raw;
}

/** Lay out focus/break cycles until the focus-minute target is reached. */
export function buildStudyBlocks({ startMinutes, focusMinutes, blockMin, breakMin }) {
  const blocks = [];
  let cursor = startMinutes;
  let remaining = focusMinutes;
  let index = 0;

  while (remaining > 0 && index < MAX_BLOCKS) {
    const length = Math.min(blockMin, remaining);
    blocks.push({
      index: index + 1,
      kind: "focus",
      start: toClock(cursor),
      end: toClock(cursor + length),
      minutes: length,
    });
    cursor += length;
    remaining -= length;
    index += 1;
    if (remaining > 0 && breakMin > 0) {
      blocks.push({
        index: index,
        kind: "break",
        start: toClock(cursor),
        end: toClock(cursor + breakMin),
        minutes: breakMin,
      });
      cursor += breakMin;
    }
  }

  return { blocks, endMinutes: cursor, focusMinutes: focusMinutes - Math.max(0, remaining) };
}

/**
 * @param {object} input
 * @param {string} input.examStart        "HH:MM" the paper begins
 * @param {number} input.commuteMin       travel time to the exam hall
 * @param {number} input.prepMin          getting-ready time after the alarm
 * @param {number} input.targetSleepH     hours of sleep aimed for
 * @param {string} input.currentBedtime   "HH:MM" you currently fall asleep
 * @param {number} input.daysUntilExam    whole days left before the exam
 * @param {string} input.studyStart       "HH:MM" the first study block begins
 * @param {number} input.studyHoursPerDay focus hours per study day
 * @param {number} [input.blockMin]       focus block length, minutes
 * @param {number} [input.breakMin]       break length, minutes
 * @param {number} [input.sleepLatencyMin]
 * @param {boolean} [input.isTeen]        13-18 year olds use the 8-hour minimum
 */
export function planExamSchedule({
  examStart,
  commuteMin,
  prepMin,
  targetSleepH,
  currentBedtime,
  daysUntilExam,
  studyStart,
  studyHoursPerDay,
  blockMin = DEFAULT_FOCUS_BLOCK_MIN,
  breakMin = DEFAULT_BREAK_MIN,
  sleepLatencyMin = DEFAULT_SLEEP_LATENCY_MIN,
  isTeen = false,
}) {
  const examMinutes = parseTimeToMinutes(examStart);
  if (examMinutes === null) return { error: "Enter the exam start time as HH:MM, for example 09:30." };
  const currentBedMinutes = parseTimeToMinutes(currentBedtime);
  if (currentBedMinutes === null) return { error: "Enter your current bedtime as HH:MM, for example 01:00." };
  const studyStartMinutes = parseTimeToMinutes(studyStart);
  if (studyStartMinutes === null) return { error: "Enter the study start time as HH:MM, for example 09:00." };

  const numbers = { commuteMin, prepMin, targetSleepH, daysUntilExam, studyHoursPerDay, blockMin, breakMin, sleepLatencyMin };
  for (const key of Object.keys(numbers)) {
    if (typeof numbers[key] !== "number" || !Number.isFinite(numbers[key])) {
      return { error: "Enter a valid number in every field." };
    }
  }
  if (commuteMin < 0 || prepMin < 0 || breakMin < 0 || sleepLatencyMin < 0) {
    return { error: "Times cannot be negative." };
  }
  if (blockMin < 10 || blockMin > 180) return { error: "Focus blocks work best between 10 and 180 minutes." };
  if (breakMin > 120) return { error: "Breaks longer than 2 hours are not a study block — split the day instead." };
  if (targetSleepH < 4 || targetSleepH > 12) return { error: "Set a sleep target between 4 and 12 hours." };
  if (daysUntilExam < 0 || daysUntilExam > 365) return { error: "Days until the exam should be between 0 and 365." };
  if (studyHoursPerDay <= 0 || studyHoursPerDay > MAX_STUDY_HOURS_PER_DAY) {
    return { error: `Plan between 0 and ${MAX_STUDY_HOURS_PER_DAY} focus hours a day.` };
  }
  if (commuteMin > 300 || prepMin > 240) return { error: "Commute or getting-ready time looks too long — check the values." };

  const minSleepH = isTeen ? TEEN_MIN_SLEEP_H : ADULT_MIN_SLEEP_H;

  const logisticsWake = examMinutes - (commuteMin + prepMin);
  const alertnessWake = examMinutes - WAKE_BEFORE_EXAM_H * 60;
  const wakeMinutes = Math.min(logisticsWake, alertnessWake);

  const timeInBedMin = targetSleepH * 60 + sleepLatencyMin;
  const bedtimeMinutes = wakeMinutes - timeInBedMin;

  const wake = toClock(wakeMinutes);
  const bedtime = toClock(bedtimeMinutes);
  const windDownStart = toClock(bedtimeMinutes - WIND_DOWN_MIN);
  const preSleepReview = {
    start: toClock(bedtimeMinutes - WIND_DOWN_MIN - PRE_SLEEP_REVIEW_MIN),
    end: toClock(bedtimeMinutes - WIND_DOWN_MIN),
  };
  const morningReview = toClock(wakeMinutes + MORNING_REVIEW_AFTER_WAKE_MIN);

  const advanceNeededMin = phaseAdvanceMinutes(currentBedMinutes, bedtime.minutesOfDay);
  const daysNeededToShift =
    advanceNeededMin <= 0 ? 0 : Math.ceil(advanceNeededMin / MAX_PHASE_ADVANCE_PER_DAY_MIN);
  const shiftFeasible = daysNeededToShift <= daysUntilExam;
  const perDayShiftMin =
    advanceNeededMin <= 0
      ? 0
      : daysUntilExam > 0
        ? Math.min(MAX_PHASE_ADVANCE_PER_DAY_MIN, Math.ceil(advanceNeededMin / Math.max(1, daysUntilExam)))
        : advanceNeededMin;

  const focusMinutes = Math.round(studyHoursPerDay * 60);
  const study = buildStudyBlocks({
    startMinutes: studyStartMinutes,
    focusMinutes,
    blockMin,
    breakMin,
  });
  const studyEnd = toClock(study.endMinutes);

  const warnings = [];
  if (targetSleepH < minSleepH) {
    warnings.push(
      `${isTeen ? "Teenagers aged 13-18 need 8-10 hours" : "Adults need 7 or more hours"}; a ${targetSleepH}-hour target trades away the memory consolidation that revision depends on.`,
    );
  }
  if (!shiftFeasible && advanceNeededMin > 0) {
    warnings.push(
      `Moving your bedtime ${formatDuration(advanceNeededMin)} earlier needs about ${daysNeededToShift} days at ${MAX_PHASE_ADVANCE_PER_DAY_MIN} minutes a day, but you have ${daysUntilExam}. Shift what you can and get bright light immediately on waking.`,
    );
  }
  // Align the review slot forward onto the same timeline as the study day before comparing,
  // because bedtime can legitimately land on the previous or the next calendar day.
  let alignedReviewStart = preSleepReview.start.minutes;
  while (alignedReviewStart < studyStartMinutes) alignedReviewStart += MINUTES_PER_DAY;
  const restGapMin = alignedReviewStart - study.endMinutes;
  if (restGapMin < 0) {
    warnings.push(
      "The last study block runs into the pre-sleep review slot. Start earlier or cut the day's focus hours, otherwise the wind-down disappears.",
    );
  }
  if (study.blocks.length >= MAX_BLOCKS) {
    warnings.push("Block count capped — use longer focus blocks for a day this size.");
  }
  if (studyHoursPerDay > 8) {
    warnings.push("Beyond about 8 focus hours a day, retention per hour falls sharply. Spread the load across more days if you can.");
  }

  return {
    exam: toClock(examMinutes),
    wake,
    wakeDrivenBy: logisticsWake <= alertnessWake ? "commute and getting ready" : "being awake 2 hours before the paper",
    bedtime,
    windDownStart,
    preSleepReview,
    morningReview,
    timeInBedMin,
    minSleepH,
    advanceNeededMin,
    advanceIsDelay: advanceNeededMin < 0,
    restGapMin: Math.max(0, restGapMin),
    daysNeededToShift,
    perDayShiftMin,
    shiftFeasible,
    daysUntilExam,
    blocks: study.blocks,
    studyEnd,
    focusMinutes: study.focusMinutes,
    totalStudySpanMin: study.endMinutes - studyStartMinutes,
    warnings,
  };
}
