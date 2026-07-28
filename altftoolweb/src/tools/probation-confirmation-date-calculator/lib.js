/**
 * Probation confirmation date calculator.
 *
 * How the date is built:
 *
 *   last day of probation = joining date + probation months + extension months
 *                           + days of leave without pay − 1 day
 *   confirmation effective from = last day of probation + 1 day
 *
 * The "− 1 day" is the standard reading of a period expressed in months: a
 * six-month probation starting 1 April runs to 30 September, and confirmation
 * takes effect on 1 October. Month arithmetic is clamped to the end of the
 * target month, so 31 January + 1 month is 28 February (29 in a leap year),
 * never 3 March.
 *
 * Leave without pay extends probation day for day. This is a near-universal
 * clause in Indian appointment letters rather than a statutory rule — the
 * period of probation is meant to be a period of actual service, so unpaid
 * absence does not count towards it. Check your own appointment letter, because
 * some employers instead count only absences beyond a threshold.
 *
 * Statutory background: Schedule I-A of the Industrial Employment (Standing
 * Orders) Central Rules, 1946 defines a "probationer" as a workman provisionally
 * employed to fill a permanent vacancy and sets that probationary period at
 * three months, which is why 3 and 6 months are the common defaults. State
 * Shops and Commercial Establishments Acts govern most office employment and
 * generally leave the probation length to the contract.
 *
 * Informational only — not legal or HR advice. The appointment letter and the
 * standing orders that apply to your establishment govern.
 */

export const MS_PER_DAY = 86400000;

/** Common probation lengths offered as presets, in months. */
export const COMMON_PROBATION_MONTHS = [3, 6, 9, 12];

/** Guardrails so the tool never dates something absurd. */
export const MAX_PROBATION_MONTHS = 24;
export const MAX_EXTENSION_MONTHS = 24;
export const MAX_LOP_DAYS = 365;

/** Statutory probation for a workman under the Central Standing Orders Rules. */
export const STANDING_ORDERS_PROBATION_MONTHS = 3;

/** Parse YYYY-MM-DD to a UTC midnight timestamp, or NaN if it is not a real date. */
export function parseIsoDate(value) {
  if (typeof value !== "string") return NaN;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return NaN;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
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

/** Format a UTC timestamp as YYYY-MM-DD. */
export function toIsoDate(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Add whole days to a UTC timestamp. */
export function addDays(ms, days) {
  return ms + days * MS_PER_DAY;
}

/**
 * Add whole months, clamping the day to the last day of the target month.
 * 2026-01-31 + 1 month = 2026-02-28, not 2026-03-03.
 */
export function addMonthsClamped(ms, months) {
  const date = new Date(ms);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const targetMonthStart = Date.UTC(year, month + months, 1);
  const target = new Date(targetMonthStart);
  const daysInTargetMonth = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  return Date.UTC(
    target.getUTCFullYear(),
    target.getUTCMonth(),
    Math.min(day, daysInTargetMonth),
  );
}

/** Whole days between two UTC midnight timestamps. */
export function diffDays(fromMs, toMs) {
  return Math.round((toMs - fromMs) / MS_PER_DAY);
}

/**
 * Compute the confirmation date and the state of the probation today.
 *
 * @param {object} input
 * @param {string} input.joiningDate     YYYY-MM-DD, first day of service
 * @param {number} input.probationMonths months of probation in the offer letter
 * @param {number} input.extensionMonths further months the employer added
 * @param {number} input.lopDays         days of leave without pay taken
 * @param {string} input.today           reference date, YYYY-MM-DD
 * @param {number} input.noticeProbation notice period in days while on probation
 * @param {number} input.noticeConfirmed notice period in days after confirmation
 * @returns {object} dates, counts and milestones — or { error }
 */
export function computeConfirmation({
  joiningDate,
  probationMonths = 6,
  extensionMonths = 0,
  lopDays = 0,
  today,
  noticeProbation = 15,
  noticeConfirmed = 60,
} = {}) {
  const joinMs = parseIsoDate(joiningDate);
  if (Number.isNaN(joinMs)) return { error: "Enter the joining date as a real calendar date." };

  const todayMs = parseIsoDate(today);
  if (Number.isNaN(todayMs)) return { error: "Enter today's date as a real calendar date." };

  const months = Number(probationMonths);
  if (!Number.isFinite(months) || !Number.isInteger(months)) {
    return { error: "Probation length must be a whole number of months." };
  }
  if (months < 1) {
    return {
      error:
        "Probation must be at least 1 month. If there is no probation at all, confirmation is the joining date itself.",
    };
  }
  if (months > MAX_PROBATION_MONTHS) {
    return { error: `Probation longer than ${MAX_PROBATION_MONTHS} months is outside this calculator.` };
  }

  const extension = Number(extensionMonths);
  if (!Number.isFinite(extension) || !Number.isInteger(extension) || extension < 0) {
    return { error: "Extension must be a whole number of months, or zero." };
  }
  if (extension > MAX_EXTENSION_MONTHS) {
    return { error: `Extensions beyond ${MAX_EXTENSION_MONTHS} months are outside this calculator.` };
  }

  const lop = Number(lopDays);
  if (!Number.isFinite(lop) || !Number.isInteger(lop) || lop < 0) {
    return { error: "Leave without pay must be a whole number of days, or zero." };
  }
  if (lop > MAX_LOP_DAYS) {
    return { error: `More than ${MAX_LOP_DAYS} days of leave without pay is outside this calculator.` };
  }

  const noticeP = Number(noticeProbation);
  const noticeC = Number(noticeConfirmed);
  if (!Number.isFinite(noticeP) || noticeP < 0 || !Number.isFinite(noticeC) || noticeC < 0) {
    return { error: "Notice periods must be zero or more days." };
  }

  const totalMonths = months + extension;

  // Scheduled dates, before any leave without pay is added.
  const scheduledConfirmationMs = addMonthsClamped(joinMs, months);
  const scheduledLastDayMs = addDays(scheduledConfirmationMs, -1);

  // Actual dates, after extension and leave without pay.
  const afterMonthsMs = addMonthsClamped(joinMs, totalMonths);
  const confirmationMs = addDays(afterMonthsMs, lop);
  const lastDayMs = addDays(confirmationMs, -1);

  const totalDays = diffDays(joinMs, confirmationMs);
  const daysPushed = diffDays(scheduledConfirmationMs, confirmationMs);

  // Service already put in, counted inclusively from the joining date.
  const rawServed = diffDays(joinMs, todayMs) + 1;
  const daysServed = Math.max(0, Math.min(rawServed, totalDays));
  const daysRemaining = Math.max(0, diffDays(todayMs, confirmationMs));
  const percentComplete = Math.round((daysServed / totalDays) * 100);

  const notYetJoined = todayMs < joinMs;
  const confirmed = todayMs >= confirmationMs;
  const status = notYetJoined
    ? "Not started"
    : confirmed
      ? "Confirmed"
      : "On probation";

  // Review milestones a manager normally has to hit before the end date.
  const milestones = [
    {
      id: "start",
      label: "Probation starts",
      date: toIsoDate(joinMs),
    },
    {
      id: "first",
      label: "First check-in (end of month 1)",
      date: toIsoDate(addDays(addMonthsClamped(joinMs, 1), -1)),
    },
    {
      id: "mid",
      label: "Mid-probation review",
      date: toIsoDate(addDays(joinMs, Math.floor(totalDays / 2))),
    },
    {
      id: "decision",
      label: "Decision window opens (30 days out)",
      date: toIsoDate(addDays(confirmationMs, -30)),
    },
    {
      id: "last",
      label: "Last day of probation",
      date: toIsoDate(lastDayMs),
    },
    {
      id: "confirm",
      label: "Confirmation effective from",
      date: toIsoDate(confirmationMs),
    },
  ].filter((item) => {
    // Drop milestones that fall before the joining date on very short probations.
    return parseIsoDate(item.date) >= joinMs;
  });

  return {
    status,
    joiningDate: toIsoDate(joinMs),
    scheduledConfirmationDate: toIsoDate(scheduledConfirmationMs),
    scheduledLastDay: toIsoDate(scheduledLastDayMs),
    confirmationDate: toIsoDate(confirmationMs),
    lastDayOfProbation: toIsoDate(lastDayMs),
    totalMonths,
    probationMonths: months,
    extensionMonths: extension,
    lopDays: lop,
    totalDays,
    daysServed,
    daysRemaining,
    percentComplete,
    daysPushed,
    noticeToday: confirmed ? noticeC : noticeP,
    noticeProbation: noticeP,
    noticeConfirmed: noticeC,
    milestones,
  };
}
