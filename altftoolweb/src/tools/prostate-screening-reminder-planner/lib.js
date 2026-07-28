/**
 * Prostate screening discussion planner.
 *
 * This does NOT decide whether you should be screened. It reproduces the
 * published starting ages and re-test intervals so you can see when the
 * shared-decision conversation is due, and takes today's date as an argument
 * so the maths stays pure and testable.
 *
 * Sources reproduced here:
 *  - American Cancer Society: start the informed discussion at 50 (average
 *    risk), 45 (high risk), 40 (higher risk), for men with at least a 10-year
 *    life expectancy.
 *  - ACS re-test rule: PSA below 2.5 ng/mL, retest every 2 years; 2.5 ng/mL
 *    or above, retest every year.
 *  - USPSTF 2018: shared decision-making for ages 55-69 (grade C); routine
 *    PSA screening not recommended at 70 and over (grade D).
 */

export const START_AGE_AVERAGE_RISK = 50;
export const START_AGE_HIGH_RISK = 45;
export const START_AGE_HIGHER_RISK = 40;

/** USPSTF shared-decision window. */
export const USPSTF_START = 55;
export const USPSTF_END = 69;

/** USPSTF grade D: routine screening is not recommended from this age. */
export const ROUTINE_STOP_AGE = 70;

/** ACS re-test threshold, in ng/mL. */
export const PSA_INTERVAL_THRESHOLD = 2.5;
export const INTERVAL_MONTHS_BELOW_THRESHOLD = 24;
export const INTERVAL_MONTHS_AT_OR_ABOVE_THRESHOLD = 12;

/** The value at which further evaluation is commonly considered. */
export const PSA_REFERRAL_DISCUSSION = 4.0;
export const MAX_PSA = 5000;

export const MIN_AGE = 18;
export const MAX_AGE = 120;

/** How close to the due date counts as "coming up". */
export const DUE_SOON_DAYS = 60;

export const FAMILY_HISTORY_OPTIONS = [
  { value: "none", label: "No first-degree relative with prostate cancer" },
  { value: "one-under-65", label: "One father or brother diagnosed before 65" },
  { value: "multiple-under-65", label: "More than one first-degree relative diagnosed before 65" },
];

const MS_PER_DAY = 86400000;
const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Strict YYYY-MM-DD parser returning a UTC timestamp, or null when invalid. */
export function parseISODate(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const ms = Date.UTC(year, month - 1, day);
  const back = new Date(ms);
  if (back.getUTCFullYear() !== year || back.getUTCMonth() !== month - 1 || back.getUTCDate() !== day) {
    return null;
  }
  return ms;
}

export function toISODate(ms) {
  if (!isNum(ms)) return "";
  return new Date(ms).toISOString().slice(0, 10);
}

/** Add whole months, clamping to the last day of the target month. */
export function addMonths(ms, months) {
  const date = new Date(ms);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + months;
  const day = date.getUTCDate();
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return Date.UTC(year, month, Math.min(day, lastDay));
}

/**
 * Starting age for the informed-decision conversation, per ACS risk tiers.
 */
export function startAgeFor({ africanAncestry = false, familyHistory = "none", geneticRisk = false } = {}) {
  if (familyHistory === "multiple-under-65" || geneticRisk) {
    return { age: START_AGE_HIGHER_RISK, tier: "Higher risk" };
  }
  if (africanAncestry || familyHistory === "one-under-65") {
    return { age: START_AGE_HIGH_RISK, tier: "High risk" };
  }
  return { age: START_AGE_AVERAGE_RISK, tier: "Average risk" };
}

/**
 * @param {object} input
 * @param {number} input.age
 * @param {boolean} input.africanAncestry
 * @param {"none"|"one-under-65"|"multiple-under-65"} input.familyHistory
 * @param {boolean} input.geneticRisk        known BRCA1/BRCA2 or Lynch syndrome
 * @param {number} input.lastPsa             most recent PSA in ng/mL (0 = never tested)
 * @param {string} input.lastDiscussionISO   date of the last PSA test or discussion (YYYY-MM-DD, "" = never)
 * @param {string} input.todayISO            today's date, supplied by the caller
 */
export function planProstateScreening({
  age,
  africanAncestry = false,
  familyHistory = "none",
  geneticRisk = false,
  lastPsa = 0,
  lastDiscussionISO = "",
  todayISO,
} = {}) {
  if (!isNum(age) || !isNum(lastPsa)) {
    return { error: "Enter a number for age and PSA." };
  }
  if (age < MIN_AGE || age > MAX_AGE) {
    return { error: `Age should be between ${MIN_AGE} and ${MAX_AGE}.` };
  }
  if (!FAMILY_HISTORY_OPTIONS.some((option) => option.value === familyHistory)) {
    return { error: "Choose one of the family-history options." };
  }
  if (lastPsa < 0) {
    return { error: "PSA cannot be negative." };
  }
  if (lastPsa > MAX_PSA) {
    return { error: `A PSA above ${MAX_PSA} ng/mL is outside the range this planner handles.` };
  }

  const today = parseISODate(todayISO);
  if (today === null) {
    return { error: "Today's date must be a valid YYYY-MM-DD date." };
  }

  const hasLastDiscussion = typeof lastDiscussionISO === "string" && lastDiscussionISO.trim() !== "";
  const lastDiscussion = hasLastDiscussion ? parseISODate(lastDiscussionISO) : null;
  if (hasLastDiscussion && lastDiscussion === null) {
    return { error: "The last discussion date must be a valid YYYY-MM-DD date." };
  }
  if (lastDiscussion !== null && lastDiscussion > today) {
    return { error: "The last discussion cannot be in the future." };
  }

  const start = startAgeFor({ africanAncestry, familyHistory, geneticRisk });
  const eligible = age >= start.age;
  const yearsUntilStart = eligible ? 0 : start.age - age;

  const hasPsa = lastPsa > 0;
  const intervalMonths = hasPsa
    ? lastPsa < PSA_INTERVAL_THRESHOLD
      ? INTERVAL_MONTHS_BELOW_THRESHOLD
      : INTERVAL_MONTHS_AT_OR_ABOVE_THRESHOLD
    : null;

  let nextDueMs = null;
  if (lastDiscussion !== null && intervalMonths !== null) {
    nextDueMs = addMonths(lastDiscussion, intervalMonths);
  }

  const daysUntilDue = nextDueMs === null ? null : Math.round((nextDueMs - today) / MS_PER_DAY);
  let dueStatus = "not-scheduled";
  if (daysUntilDue !== null) {
    if (daysUntilDue < 0) dueStatus = "overdue";
    else if (daysUntilDue <= DUE_SOON_DAYS) dueStatus = "due-soon";
    else dueStatus = "scheduled";
  }

  const notes = [];
  if (!eligible) {
    notes.push(
      `On the American Cancer Society tiers your informed-decision conversation is usually offered from age ${start.age}, which is ${yearsUntilStart} year${yearsUntilStart === 1 ? "" : "s"} away.`,
    );
  }
  if (age >= USPSTF_START && age <= USPSTF_END) {
    notes.push(
      `You are inside the USPSTF ${USPSTF_START}-${USPSTF_END} shared decision-making window, where the recommendation is to weigh benefits and harms with a clinician.`,
    );
  }
  if (age >= ROUTINE_STOP_AGE) {
    notes.push(
      `From age ${ROUTINE_STOP_AGE} the USPSTF recommends against routine PSA screening, so any testing should be an individual decision based on health and life expectancy.`,
    );
  }
  if (hasPsa && lastPsa >= PSA_REFERRAL_DISCUSSION) {
    notes.push(
      `A PSA of ${PSA_REFERRAL_DISCUSSION} ng/mL or more is the level at which further assessment is commonly discussed — this is a conversation for your clinician, not a schedule question.`,
    );
  }
  if (!hasPsa && eligible) {
    notes.push("No baseline PSA recorded, so the first step is the discussion itself rather than an interval.");
  }

  return {
    startAge: start.age,
    riskTier: start.tier,
    eligible,
    yearsUntilStart,
    inUspstfWindow: age >= USPSTF_START && age <= USPSTF_END,
    pastRoutineStopAge: age >= ROUTINE_STOP_AGE,
    hasPsa,
    lastPsa,
    intervalMonths,
    lastDiscussionISO: lastDiscussion === null ? "" : toISODate(lastDiscussion),
    nextDueISO: nextDueMs === null ? "" : toISODate(nextDueMs),
    daysUntilDue,
    dueStatus,
    startsInYear: eligible ? null : yearsUntilStart,
    notes,
  };
}
