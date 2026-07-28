/**
 * Contact Lens Wear Tracker — logic only. No React, no DOM, no clock reads.
 * Today's date is always passed in as an argument so the maths stays pure.
 *
 * Sources for the fixed numbers below:
 *  - Replacement schedules are the manufacturer-labelled modalities for soft
 *    contact lenses: daily disposable (discard after one wear), two-weekly
 *    (14 days from opening), monthly (30 days), quarterly (90 days) and
 *    conventional / yearly (365 days). The clock starts when the blister or
 *    vial is opened, not when the lens is next worn, because the count is
 *    about deposits and solution contamination as well as wear.
 *  - CDC contact lens hygiene guidance: replace the lens case at least every
 *    three months, never top up solution, and never sleep in lenses that are
 *    not approved for extended wear.
 *  - FDA-approved extended wear for silicone hydrogel lenses runs to a maximum
 *    of six nights / seven days of continuous wear where the specific lens
 *    carries that approval.
 */

/** Days after which the CDC advises replacing the lens storage case. */
export const CASE_REPLACEMENT_DAYS = 90;

/**
 * Common practitioner ceiling for comfortable daily wear of a soft lens.
 * Individual fitting cards vary — treat this as a prompt to check yours.
 */
export const MAX_COMFORTABLE_WEAR_HOURS = 12;

/** Hours of wear a new fit is usually built up from on day one. */
export const ADAPTATION_START_HOURS = 4;

/** Hours added per day during a typical build-up schedule. */
export const ADAPTATION_STEP_HOURS = 2;

/** Maximum continuous wear for lenses carrying FDA extended-wear approval. */
export const EXTENDED_WEAR_MAX_NIGHTS = 6;

export const MS_PER_DAY = 86400000;

export const LENS_TYPES = [
  {
    id: "daily",
    label: "Daily disposable",
    replacementDays: 1,
    note: "One wear only — never store or reuse a daily disposable, even for a short wear.",
  },
  {
    id: "fortnightly",
    label: "Two-weekly (fortnightly)",
    replacementDays: 14,
    note: "Fourteen days from opening the blister, whether or not you wore them every day.",
  },
  {
    id: "monthly",
    label: "Monthly",
    replacementDays: 30,
    note: "Thirty days from opening. A month of unworn days still counts against the lens.",
  },
  {
    id: "quarterly",
    label: "Quarterly",
    replacementDays: 90,
    note: "Ninety days, and these need a strict cleaning and protein-removal routine.",
  },
  {
    id: "yearly",
    label: "Conventional / yearly",
    replacementDays: 365,
    note: "Twelve months, with scheduled professional check-ups through the year.",
  },
];

export function findLensType(id) {
  return LENS_TYPES.find((type) => type.id === id) || null;
}

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Parse a YYYY-MM-DD string into a UTC day index. Returns NaN when invalid. */
export function parseIsoDay(iso) {
  if (typeof iso !== "string") return NaN;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return NaN;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return NaN;
  const ms = Date.UTC(year, month - 1, day);
  const back = new Date(ms);
  if (back.getUTCFullYear() !== year || back.getUTCMonth() !== month - 1 || back.getUTCDate() !== day) {
    return NaN;
  }
  return ms;
}

/** Add whole days to a UTC millisecond timestamp and return a YYYY-MM-DD string. */
export function addDaysIso(ms, days) {
  if (!isNum(ms) || !isNum(days)) return "";
  return new Date(ms + days * MS_PER_DAY).toISOString().slice(0, 10);
}

/**
 * Work out where a pair of lenses is in its life.
 *
 * @param {object} input
 * @param {string} input.lensTypeId    One of LENS_TYPES ids.
 * @param {string} input.openedDate    YYYY-MM-DD the blister/vial was opened.
 * @param {string} input.todayDate     YYYY-MM-DD to evaluate against.
 * @param {string} input.caseChangedDate YYYY-MM-DD the lens case was last replaced.
 * @param {number} input.hoursPerDay   Typical hours worn on a wearing day.
 * @param {number} input.daysPerWeek   Wearing days per week, 0-7.
 * @returns {object} tracker state, or { error } for input that cannot be answered.
 */
export function trackLensWear({
  lensTypeId,
  openedDate,
  todayDate,
  caseChangedDate,
  hoursPerDay,
  daysPerWeek,
} = {}) {
  const type = findLensType(lensTypeId);
  if (!type) return { error: "Choose a lens replacement schedule." };

  const opened = parseIsoDay(openedDate);
  const today = parseIsoDay(todayDate);
  if (Number.isNaN(opened)) return { error: "Enter a valid opening date as YYYY-MM-DD." };
  if (Number.isNaN(today)) return { error: "Enter a valid 'today' date as YYYY-MM-DD." };
  if (opened > today) return { error: "The opening date cannot be in the future." };

  if (!isNum(hoursPerDay) || !isNum(daysPerWeek)) {
    return { error: "Enter numbers for wear hours and wearing days." };
  }
  if (hoursPerDay < 0 || hoursPerDay > 24) return { error: "Wear hours must be between 0 and 24." };
  if (daysPerWeek < 0 || daysPerWeek > 7) return { error: "Wearing days must be between 0 and 7." };

  const daysElapsed = Math.round((today - opened) / MS_PER_DAY);
  const replacementDays = type.replacementDays;
  const daysRemaining = replacementDays - daysElapsed;
  const replacementDateIso = addDaysIso(opened, replacementDays);

  const percentUsed = Math.max(0, Math.min(100, (daysElapsed / replacementDays) * 100));

  // Wearing days that fall inside the elapsed window, then total hours on the lens.
  const wearingDays = Math.round((daysElapsed * daysPerWeek) / 7);
  const cumulativeHours = Math.round(wearingDays * hoursPerDay * 10) / 10;
  const weeklyHours = Math.round(daysPerWeek * hoursPerDay * 10) / 10;

  let status = "ok";
  if (daysRemaining < 0) status = "overdue";
  else if (daysRemaining === 0) status = "due";
  else if (daysRemaining <= Math.max(1, Math.ceil(replacementDays * 0.15))) status = "soon";

  const statusLabel = {
    ok: "In date",
    soon: "Replace soon",
    due: "Replace today",
    overdue: "Overdue — replace now",
  }[status];

  // Lens case: CDC advises a fresh case at least every 90 days.
  const caseChanged = parseIsoDay(caseChangedDate);
  let caseDueIso = "";
  let caseDaysRemaining = null;
  if (!Number.isNaN(caseChanged)) {
    if (caseChanged > today) return { error: "The lens case date cannot be in the future." };
    caseDueIso = addDaysIso(caseChanged, CASE_REPLACEMENT_DAYS);
    caseDaysRemaining = CASE_REPLACEMENT_DAYS - Math.round((today - caseChanged) / MS_PER_DAY);
  }

  // Annual consumption, counting both eyes.
  const lensesPerYear =
    type.replacementDays === 1
      ? Math.round(daysPerWeek * 52 * 2)
      : Math.ceil(365 / type.replacementDays) * 2;

  const warnings = [];
  if (status === "overdue") {
    warnings.push(
      `These lenses are ${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) === 1 ? "" : "s"} past their ${replacementDays}-day replacement date. Wearing lenses beyond schedule raises the risk of infection and corneal problems.`,
    );
  }
  if (hoursPerDay > MAX_COMFORTABLE_WEAR_HOURS) {
    warnings.push(
      `${hoursPerDay} hours a day is above the ${MAX_COMFORTABLE_WEAR_HOURS}-hour figure most practitioners set as a comfortable ceiling for soft lenses. Check the maximum on your own fitting card.`,
    );
  }
  if (caseDaysRemaining !== null && caseDaysRemaining <= 0) {
    warnings.push("The lens case is due for replacement — the CDC advises a fresh case at least every 3 months.");
  }
  if (type.replacementDays === 1 && daysElapsed > 0) {
    warnings.push("Daily disposables are single use, so any lens opened before today should already have been discarded.");
  }

  return {
    type,
    openedDate: openedDate.trim(),
    todayDate: todayDate.trim(),
    daysElapsed,
    daysRemaining,
    replacementDays,
    replacementDateIso,
    percentUsed: Math.round(percentUsed * 10) / 10,
    wearingDays,
    cumulativeHours,
    weeklyHours,
    hoursPerDay,
    daysPerWeek,
    status,
    statusLabel,
    caseDueIso,
    caseDaysRemaining,
    lensesPerYear,
    warnings,
    note: type.note,
  };
}

/**
 * Build a first-week adaptation schedule for a new wearer: start at 4 hours and
 * add 2 hours a day up to the comfortable ceiling.
 */
export function buildAdaptationSchedule(days = 7, maxHours = MAX_COMFORTABLE_WEAR_HOURS) {
  if (!isNum(days) || days < 1 || days > 30) return { error: "Choose between 1 and 30 adaptation days." };
  if (!isNum(maxHours) || maxHours <= 0 || maxHours > 24) {
    return { error: "The wear ceiling must be between 1 and 24 hours." };
  }
  const rows = [];
  for (let day = 1; day <= Math.floor(days); day += 1) {
    const hours = Math.min(maxHours, ADAPTATION_START_HOURS + (day - 1) * ADAPTATION_STEP_HOURS);
    rows.push({ day, hours: Math.round(hours * 10) / 10 });
  }
  return { rows };
}
