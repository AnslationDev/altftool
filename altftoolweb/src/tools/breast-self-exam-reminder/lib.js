/**
 * Breast self-check scheduling — pure date arithmetic, no DOM, no Date.now().
 * Every function takes "today" as an explicit ISO argument so results are
 * reproducible and testable.
 *
 * Timing rule: breast tissue is at its least tender and least lumpy in the
 * days right after a period ends, because oestrogen and progesterone are at
 * their monthly low. Patient guidance from Breast Cancer Now, the NHS and the
 * American Cancer Society therefore points to the few days after bleeding
 * stops as the easiest time to notice a genuine change. People who do not have
 * a monthly cycle (after menopause, during pregnancy, or on continuous
 * hormonal contraception) are advised to pick one fixed calendar day instead.
 */

const MS_PER_DAY = 86400000;

/** Days after the last day of bleeding to run the check (guidance: 3-5 days). */
export const DAYS_AFTER_PERIOD_ENDS = 3;
/** The check stays comparable for a short window, not just a single day. */
export const WINDOW_LENGTH_DAYS = 3; // covers days 3, 4 and 5 after bleeding stops

/** A cycle outside 21-35 days is medically described as irregular. */
export const CYCLE_MIN_DAYS = 21;
export const CYCLE_MAX_DAYS = 35;
/** Accepted input range is wider than "normal" so irregular cycles still work. */
export const CYCLE_INPUT_MIN = 15;
export const CYCLE_INPUT_MAX = 60;

export const PERIOD_INPUT_MIN = 1;
export const PERIOD_INPUT_MAX = 12;

/** Fixed-day mode is limited to 1-28 so the date exists in February too. */
export const FIXED_DAY_MIN = 1;
export const FIXED_DAY_MAX = 28;

export const MODES = {
  CYCLE: "cycle",
  FIXED: "fixed",
};

export const MAX_OCCURRENCES = 24;

/**
 * The five-look routine used in NHS and Breast Cancer Now "know your breasts"
 * material. It is a familiarity routine, not a screening test.
 */
export const EXAM_STEPS = [
  {
    title: "Look, arms down",
    detail:
      "Stand in front of a mirror with your arms relaxed. Note the usual shape, size and skin of each breast so you have a baseline to compare against.",
  },
  {
    title: "Look, arms raised",
    detail:
      "Raise both arms above your head and turn slowly. Watch for skin dimpling or puckering, a nipple that has newly turned inward, or one breast moving differently from the other.",
  },
  {
    title: "Feel standing or in the shower",
    detail:
      "Soapy fingers glide best. Use the flat pads of the middle three fingers in small circles, covering the whole breast in one pattern — spiral, up-and-down lines or wedges — every time.",
  },
  {
    title: "Feel lying down",
    detail:
      "Lying flat spreads the tissue thinner and makes deeper lumps easier to feel. Put a pillow under the shoulder of the side you are checking and that arm behind your head.",
  },
  {
    title: "Check armpit and collarbone",
    detail:
      "Breast tissue extends up towards the armpit. Feel the armpit and just above and below the collarbone for any lump or swelling.",
  },
];

/** Changes that patient guidance says should be shown to a doctor. */
export const CHANGES_TO_REPORT = [
  "A new lump or thickening in the breast or armpit that does not go after a period",
  "A change in size, outline or shape of one breast",
  "Skin dimpling, puckering, redness or a rash on or around the nipple",
  "A nipple that has newly become inverted, or changed position or shape",
  "Discharge from the nipple, especially if it is bloodstained",
  "Pain in one breast or armpit that is new and does not come and go with your cycle",
];

const pad2 = (n) => String(n).padStart(2, "0");

/** "YYYY-MM-DD" -> UTC milliseconds, or NaN if the date is not real. */
export function parseISODate(value) {
  if (typeof value !== "string") return NaN;
  const match = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(value.trim());
  if (!match) return NaN;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return NaN;
  const ms = Date.UTC(year, month - 1, day);
  const check = new Date(ms);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return NaN;
  }
  return ms;
}

/** UTC milliseconds -> "YYYY-MM-DD". */
export function toISODate(ms) {
  if (!Number.isFinite(ms)) return "";
  const date = new Date(ms);
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
}

export function addDays(ms, days) {
  if (!Number.isFinite(ms) || !Number.isFinite(days)) return NaN;
  return ms + Math.round(days) * MS_PER_DAY;
}

export function daysBetween(fromMs, toMs) {
  if (!Number.isFinite(fromMs) || !Number.isFinite(toMs)) return NaN;
  return Math.round((toMs - fromMs) / MS_PER_DAY);
}

/**
 * Build the self-check schedule.
 *
 * @param {object} input
 * @param {"cycle"|"fixed"} input.mode
 * @param {string} input.today ISO date, required — no clock is read inside.
 * @param {string} [input.lastPeriodStart] ISO date, cycle mode only.
 * @param {number} [input.cycleLength] days from one period start to the next.
 * @param {number} [input.periodLength] days of bleeding.
 * @param {number} [input.fixedDay] day of month, fixed mode only.
 * @param {number} [input.occurrences] how many future dates to list.
 * @returns {{error:string}|object}
 */
export function buildExamSchedule({
  mode = MODES.CYCLE,
  today,
  lastPeriodStart,
  cycleLength = 28,
  periodLength = 5,
  fixedDay = 1,
  occurrences = 12,
} = {}) {
  const todayMs = parseISODate(today);
  if (!Number.isFinite(todayMs)) return { error: "Enter today's date as a real calendar date." };

  const count = Math.round(occurrences);
  if (!Number.isFinite(count) || count < 1 || count > MAX_OCCURRENCES) {
    return { error: `Ask for between 1 and ${MAX_OCCURRENCES} upcoming dates.` };
  }

  if (mode === MODES.FIXED) {
    const day = Math.round(fixedDay);
    if (!Number.isFinite(day) || day < FIXED_DAY_MIN || day > FIXED_DAY_MAX) {
      return {
        error: `Pick a day of the month between ${FIXED_DAY_MIN} and ${FIXED_DAY_MAX}, so the date exists in every month.`,
      };
    }

    const todayDate = new Date(todayMs);
    let year = todayDate.getUTCFullYear();
    let month = todayDate.getUTCMonth();
    // Only roll over to next month once today is past the whole check
    // window (fixed day through fixed day + WINDOW_LENGTH_DAYS - 1), not
    // just past the window's first day.
    if (todayDate.getUTCDate() > day + WINDOW_LENGTH_DAYS - 1) {
      month += 1;
      if (month > 11) {
        month = 0;
        year += 1;
      }
    }

    const dates = [];
    for (let index = 0; index < count; index += 1) {
      const ms = Date.UTC(year, month + index, day);
      const windowEndMs = addDays(ms, WINDOW_LENGTH_DAYS - 1);
      // If today is inside this occurrence's still-open window, report it
      // as the current check rather than a stale window-start offset.
      const isCurrentWindow = index === 0 && todayMs >= ms && todayMs <= windowEndMs;
      dates.push({
        date: toISODate(ms),
        windowEnd: toISODate(windowEndMs),
        daysAway: isCurrentWindow ? 0 : daysBetween(todayMs, ms),
      });
    }

    return {
      mode: MODES.FIXED,
      today: toISODate(todayMs),
      nextDate: dates[0].date,
      nextWindowEnd: dates[0].windowEnd,
      daysUntilNext: dates[0].daysAway,
      isToday: dates[0].daysAway === 0,
      dates,
      fixedDay: day,
      reason:
        "Without a monthly cycle there is no hormonal low point to aim for, so guidance is to pick one easy-to-remember calendar day and keep it the same every month.",
    };
  }

  const startMs = parseISODate(lastPeriodStart);
  if (!Number.isFinite(startMs)) {
    return { error: "Enter the first day of your last period as a real calendar date." };
  }

  const cycle = Math.round(cycleLength);
  if (!Number.isFinite(cycle) || cycle < CYCLE_INPUT_MIN || cycle > CYCLE_INPUT_MAX) {
    return { error: `Cycle length must be between ${CYCLE_INPUT_MIN} and ${CYCLE_INPUT_MAX} days.` };
  }

  const bleed = Math.round(periodLength);
  if (!Number.isFinite(bleed) || bleed < PERIOD_INPUT_MIN || bleed > PERIOD_INPUT_MAX) {
    return { error: `Period length must be between ${PERIOD_INPUT_MIN} and ${PERIOD_INPUT_MAX} days.` };
  }
  if (bleed >= cycle) {
    return { error: "Period length has to be shorter than the whole cycle." };
  }

  const daysSinceStart = daysBetween(startMs, todayMs);
  if (daysSinceStart < 0) {
    return { error: "The last period start date is in the future — check the date." };
  }
  if (daysSinceStart > 365) {
    return { error: "That period start date is over a year ago. Use the fixed-day option instead." };
  }

  // Day 1 of the cycle is the first day of bleeding, so bleeding ends on
  // day `periodLength`, i.e. start + (periodLength - 1) days.
  const firstExamMs = addDays(startMs, bleed - 1 + DAYS_AFTER_PERIOD_ENDS);

  // Step forward whole cycles until the check window (start through
  // start + WINDOW_LENGTH_DAYS - 1) has not yet fully elapsed, so a
  // still-open window isn't skipped just because today is past its start day.
  let cursorMs = firstExamMs;
  while (addDays(cursorMs, WINDOW_LENGTH_DAYS - 1) < todayMs) {
    cursorMs = addDays(cursorMs, cycle);
  }

  const dates = [];
  for (let index = 0; index < count; index += 1) {
    const ms = addDays(cursorMs, cycle * index);
    const windowEndMs = addDays(ms, WINDOW_LENGTH_DAYS - 1);
    // If today is inside this occurrence's still-open window, report it
    // as the current check rather than a stale window-start offset.
    const isCurrentWindow = index === 0 && todayMs >= ms && todayMs <= windowEndMs;
    dates.push({
      date: toISODate(ms),
      windowEnd: toISODate(windowEndMs),
      daysAway: isCurrentWindow ? 0 : daysBetween(todayMs, ms),
    });
  }

  const cycleDay = (daysSinceStart % cycle) + 1;
  const nextPeriodMs = addDays(startMs, cycle * Math.floor(daysSinceStart / cycle) + cycle);

  return {
    mode: MODES.CYCLE,
    today: toISODate(todayMs),
    nextDate: dates[0].date,
    nextWindowEnd: dates[0].windowEnd,
    daysUntilNext: dates[0].daysAway,
    isToday: dates[0].daysAway === 0,
    dates,
    cycleDay,
    cycleLength: cycle,
    periodLength: bleed,
    periodEnds: toISODate(addDays(startMs, bleed - 1)),
    nextPeriodStart: toISODate(nextPeriodMs),
    cycleIsTypical: cycle >= CYCLE_MIN_DAYS && cycle <= CYCLE_MAX_DAYS,
    reason: `Breast tissue is least tender in the days right after bleeding stops, so the check lands ${DAYS_AFTER_PERIOD_ENDS} days after the last day of your period and repeats every ${cycle} days.`,
  };
}
