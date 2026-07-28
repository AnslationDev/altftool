/**
 * Maternity Benefit Act, 1961 (India) — qualification and entitlement maths.
 *
 * Statute text read on 29 July 2026 from the Ministry of Labour & Employment
 * bare Act as amended by the Maternity Benefit (Amendment) Act, 2017
 * (Act 6 of 2017, in force 1 April 2017; the section 11A creche clause was
 * brought into force on 1 July 2017).
 *
 * Rules encoded below, each with the section that produced it:
 *
 *  s.2(1)(b)  The Act applies to every shop or establishment employing ten or
 *             more persons on any day of the preceding twelve months (and to
 *             every factory, mine and plantation regardless of headcount).
 *  s.4(2)     No employer shall knowingly employ a woman during the six weeks
 *             immediately following the day of her delivery, miscarriage or
 *             medical termination of pregnancy.
 *  s.5(2)     No woman is entitled to maternity benefit unless she has
 *             ACTUALLY WORKED in the establishment of the employer from whom
 *             she claims it for not less than EIGHTY DAYS in the twelve months
 *             immediately preceding her expected date of delivery. The
 *             Explanation counts days of lay-off and days declared as holidays
 *             with wages as days actually worked. The proviso removes the
 *             eighty-day condition for a woman who has immigrated into the
 *             State of Assam and was pregnant at the time of immigration.
 *  s.5(3)     Maximum 26 weeks of maternity benefit, of which NOT MORE THAN
 *             8 weeks shall precede the expected date of delivery. First
 *             proviso: a woman having two or more than two surviving children
 *             gets a maximum of 12 weeks, of which not more than 6 weeks shall
 *             precede the expected date of delivery.
 *  s.5(4)     A woman who legally adopts a child below the age of three months,
 *             and a commissioning mother, get 12 weeks FROM THE DATE the child
 *             is handed over.
 *  s.5(5)     Work from home may be allowed after availing maternity benefit,
 *             where the nature of work permits, on mutually agreed terms.
 *  s.8        Medical bonus, payable where no free pre-natal confinement and
 *             post-natal care is provided by the employer. Section 8 sets
 *             Rs 1,000 subject to enhancement by notification up to
 *             Rs 20,000; notification S.O. 2496(E) dated 19 December 2011
 *             raised it to Rs 3,500, which is the figure in force.
 *  s.9        Six weeks leave with wages at the rate of maternity benefit
 *             IMMEDIATELY FOLLOWING THE DAY of miscarriage or medical
 *             termination of pregnancy.
 *  s.9A       Two weeks leave with wages immediately following the day of a
 *             tubectomy operation.
 *  s.10       Up to one additional month of leave for illness arising out of
 *             pregnancy, delivery, premature birth, miscarriage, MTP or
 *             tubectomy.
 *  s.11       Two nursing breaks a day, in addition to the rest interval,
 *             until the child attains the age of fifteen months.
 *  s.11A      Every establishment having fifty or more employees shall have a
 *             creche, and shall allow the woman four visits a day to it
 *             (inclusive of her rest interval).
 *  s.12       Discharge or dismissal during, or on account of, such absence is
 *             void; maternity benefit and medical bonus cannot be forfeited
 *             except on dismissal for gross misconduct.
 *  s.27       The Act overrides inconsistent awards, agreements and contracts,
 *             but a woman entitled to MORE favourable benefits under any such
 *             award, agreement, contract or law keeps them. Establishment
 *             policy may therefore be more generous than the figures here, and
 *             may never be less.
 *
 * All functions are pure. Dates are handled in UTC so results do not change
 * with the viewer's timezone, and every "today" must be passed in as an
 * argument.
 */

const MS_PER_DAY = 86_400_000;

/* ------------------------------------------------------------------ *
 * Statutory constants
 * ------------------------------------------------------------------ */

/** s.5(2) — days of actual work required with the claimed employer. */
export const QUALIFYING_DAYS = 80;
/** s.5(2) — the look-back window, in months, ending the day before the EDD. */
export const QUALIFYING_WINDOW_MONTHS = 12;
/** s.5(3) main clause — total weeks and maximum pre-natal weeks. */
export const WEEKS_STANDARD = 26;
export const PRENATAL_WEEKS_STANDARD = 8;
/** s.5(3) first proviso — woman having two or more surviving children. */
export const WEEKS_TWO_OR_MORE_CHILDREN = 12;
export const PRENATAL_WEEKS_TWO_OR_MORE_CHILDREN = 6;
/** s.5(3) first proviso trigger: "two or more than two surviving children". */
export const REDUCED_BENEFIT_CHILD_THRESHOLD = 2;
/** s.5(4) — adopting mother (child under 3 months) and commissioning mother. */
export const WEEKS_ADOPTION_COMMISSIONING = 12;
/** s.9 — miscarriage or medical termination of pregnancy. */
export const WEEKS_MISCARRIAGE_MTP = 6;
/** s.9A — tubectomy operation. */
export const WEEKS_TUBECTOMY = 2;
/** s.10 — additional leave for illness arising out of pregnancy etc. */
export const ILLNESS_LEAVE_MONTHS = 1;
/** s.4(2) — employment prohibited for six weeks after delivery/miscarriage/MTP. */
export const POST_EVENT_EMPLOYMENT_BAN_WEEKS = 6;
/** s.11 — nursing breaks until the child attains fifteen months. */
export const NURSING_BREAK_MONTHS = 15;
export const NURSING_BREAKS_PER_DAY = 2;
/** s.11A — creche threshold and permitted visits. */
export const CRECHE_EMPLOYEE_THRESHOLD = 50;
export const CRECHE_VISITS_PER_DAY = 4;
/** s.2(1)(b) — headcount at which a shop or establishment is covered. */
export const ACT_COVERAGE_EMPLOYEE_THRESHOLD = 10;
/** s.8 read with notification S.O. 2496(E) dated 19 December 2011. */
export const MEDICAL_BONUS_INR = 3500;
/** s.8 — statutory ceiling on any future prescribed medical bonus. */
export const MEDICAL_BONUS_CEILING_INR = 20000;

const DAYS_PER_WEEK = 7;
/** Sanity bounds so absurd input is rejected rather than silently computed. */
const MIN_YEAR = 1961; // the Act's own year; nothing earlier is meaningful
const MAX_YEAR = 2100;
const MAX_DAYS_WORKED = 366;
const MAX_SURVIVING_CHILDREN = 20;
const MAX_EMPLOYEES = 10_000_000;
const MAX_FORWARD_SEARCH_DAYS = 3660; // ten years; a hard stop on the walk

/* ------------------------------------------------------------------ *
 * Date helpers (UTC only)
 * ------------------------------------------------------------------ */

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parse "YYYY-MM-DD" to a UTC epoch-ms value, or null when unusable. */
export function parseISODate(value) {
  if (typeof value !== "string") return null;
  const match = ISO_RE.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < MIN_YEAR || year > MAX_YEAR) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  const ms = Date.UTC(year, month - 1, day);
  const back = new Date(ms);
  if (back.getUTCFullYear() !== year || back.getUTCMonth() !== month - 1 || back.getUTCDate() !== day) {
    return null; // e.g. 2026-02-30
  }
  return ms;
}

/** Format a UTC epoch-ms value back to "YYYY-MM-DD". */
export function toISODate(ms) {
  if (!Number.isFinite(ms)) return null;
  const date = new Date(ms);
  const y = String(date.getUTCFullYear()).padStart(4, "0");
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(ms, days) {
  return ms + days * MS_PER_DAY;
}

/** Whole-calendar-month shift, clamping to the last day of a shorter month. */
export function addMonths(ms, months) {
  const date = new Date(ms);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const targetMonthStart = Date.UTC(year, month + months, 1);
  const target = new Date(targetMonthStart);
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  return Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), Math.min(day, lastDay));
}

/** Inclusive day count between two UTC dates (same date => 1). */
export function inclusiveDays(startMs, endMs) {
  return Math.round((endMs - startMs) / MS_PER_DAY) + 1;
}

/**
 * Weekly working pattern for a given number of working days per week.
 * Days are filled Monday first, then Tuesday ... Saturday, and Sunday last,
 * which is the ordinary six-day shops-and-establishments week in India.
 * This is a modelling assumption about the roster, not a statutory rule.
 */
export function workingWeekdaySet(daysPerWeek) {
  const order = [1, 2, 3, 4, 5, 6, 0]; // Mon..Sat, then Sun (0 = Sunday)
  return new Set(order.slice(0, daysPerWeek));
}

/** Count working days in the inclusive range [startMs, endMs]. */
export function countWorkingDays(startMs, endMs, weekdaySet) {
  if (endMs < startMs) return 0;
  let count = 0;
  for (let ms = startMs; ms <= endMs; ms += MS_PER_DAY) {
    if (weekdaySet.has(new Date(ms).getUTCDay())) count += 1;
  }
  return count;
}

/**
 * Date of the nth working day on or after startMs.
 * Returns null when the search exceeds MAX_FORWARD_SEARCH_DAYS.
 */
export function nthWorkingDayFrom(startMs, n, weekdaySet) {
  if (n <= 0) return startMs;
  let seen = 0;
  for (let i = 0; i < MAX_FORWARD_SEARCH_DAYS; i += 1) {
    const ms = startMs + i * MS_PER_DAY;
    if (weekdaySet.has(new Date(ms).getUTCDay())) {
      seen += 1;
      if (seen === n) return ms;
    }
  }
  return null;
}

/* ------------------------------------------------------------------ *
 * Entitlement lookup — s.5(3)
 * ------------------------------------------------------------------ */

/**
 * s.5(3): 26 weeks / max 8 pre-natal, reduced to 12 weeks / max 6 pre-natal
 * for a woman who already has two or more surviving children.
 */
export function entitlementForSurvivingChildren(survivingChildren) {
  const reduced = survivingChildren >= REDUCED_BENEFIT_CHILD_THRESHOLD;
  return {
    totalWeeks: reduced ? WEEKS_TWO_OR_MORE_CHILDREN : WEEKS_STANDARD,
    maxPrenatalWeeks: reduced ? PRENATAL_WEEKS_TWO_OR_MORE_CHILDREN : PRENATAL_WEEKS_STANDARD,
    reduced,
    clause: reduced
      ? "s.5(3) first proviso — two or more surviving children"
      : "s.5(3) main clause — fewer than two surviving children",
  };
}

/* ------------------------------------------------------------------ *
 * Main computation
 * ------------------------------------------------------------------ */

/**
 * @param {object} input
 * @param {string} input.joiningDate            ISO date of joining this employer
 * @param {string} input.expectedDeliveryDate   ISO expected date of delivery
 * @param {number} input.daysWorked             days ACTUALLY worked so far for
 *                                              this employer inside the s.5(2)
 *                                              window, counted up to asOfDate
 * @param {string} input.asOfDate               ISO date up to which daysWorked counts
 * @param {number} input.survivingChildren      surviving children before this birth
 * @param {string} input.leaveStartDate         ISO first day of maternity leave
 * @param {number} [input.workingDaysPerWeek=6] roster days per week, 1-7
 * @param {number} [input.employeeCount=0]      employees in the establishment
 * @returns {object} result, or { error } when the input cannot be computed
 */
export function computeMaternityEntitlement(input) {
  const {
    joiningDate,
    expectedDeliveryDate,
    daysWorked,
    asOfDate,
    survivingChildren,
    leaveStartDate,
    workingDaysPerWeek = 6,
    employeeCount = 0,
  } = input ?? {};

  const joining = parseISODate(joiningDate);
  const edd = parseISODate(expectedDeliveryDate);
  const asOf = parseISODate(asOfDate);
  const leaveStart = parseISODate(leaveStartDate);

  if (joining === null) return { error: "Enter a valid date of joining in YYYY-MM-DD form." };
  if (edd === null) return { error: "Enter a valid expected date of delivery in YYYY-MM-DD form." };
  if (asOf === null) return { error: "Enter a valid date up to which the worked days are counted." };
  if (leaveStart === null) return { error: "Enter a valid maternity leave start date." };

  const worked = Number(daysWorked);
  if (!Number.isFinite(worked) || worked < 0) {
    return { error: "Days actually worked must be zero or more." };
  }
  if (worked > MAX_DAYS_WORKED) {
    return { error: `Days actually worked cannot exceed ${MAX_DAYS_WORKED} in a twelve-month window.` };
  }

  const children = Number(survivingChildren);
  if (!Number.isFinite(children) || children < 0 || !Number.isInteger(children)) {
    return { error: "Number of surviving children must be a whole number, zero or more." };
  }
  if (children > MAX_SURVIVING_CHILDREN) {
    return { error: `Number of surviving children cannot exceed ${MAX_SURVIVING_CHILDREN}.` };
  }

  const perWeek = Number(workingDaysPerWeek);
  if (!Number.isInteger(perWeek) || perWeek < 1 || perWeek > 7) {
    return { error: "Working days per week must be a whole number between 1 and 7." };
  }

  const employees = Number(employeeCount);
  if (!Number.isFinite(employees) || employees < 0 || employees > MAX_EMPLOYEES) {
    return { error: "Number of employees in the establishment must be zero or more." };
  }

  if (edd < joining) {
    return { error: "The expected date of delivery is before the date of joining." };
  }
  if (asOf < joining) {
    return { error: "The count-up-to date is before the date of joining, so no days can have been worked yet." };
  }
  if (leaveStart < joining) {
    return { error: "Maternity leave cannot start before the date of joining." };
  }

  const weekdaySet = workingWeekdaySet(perWeek);

  /* --- s.5(2) window: twelve months immediately preceding the EDD --- */
  const windowStart = addMonths(edd, -QUALIFYING_WINDOW_MONTHS);
  const windowEnd = addDays(edd, -1); // "immediately preceding the date"
  const countFrom = Math.max(joining, windowStart);

  /* --- last day she can actually work: the day before leave begins,
         and in no case later than the day before the EDD --- */
  const lastWorkDay = Math.min(addDays(leaveStart, -1), windowEnd);

  /* --- validate the entered worked days against the calendar --- */
  const workableToAsOf = countWorkingDays(countFrom, Math.min(asOf, windowEnd), weekdaySet);
  if (worked > workableToAsOf) {
    return {
      error:
        `Only ${workableToAsOf} working days fall between ${toISODate(countFrom)} and ` +
        `${toISODate(Math.min(asOf, windowEnd))} on a ${perWeek}-day week, so ${worked} days ` +
        `actually worked cannot have accrued inside the section 5(2) window.`,
    };
  }

  const workableInWindow = countWorkingDays(countFrom, windowEnd, weekdaySet);
  const workableBeforeLeave = countWorkingDays(countFrom, lastWorkDay, weekdaySet);

  /* --- qualification date: when the 80th day of actual work falls --- */
  const shortfallDays = Math.max(0, QUALIFYING_DAYS - worked);
  const alreadyQualified = shortfallDays === 0;
  const searchFrom = Math.max(addDays(asOf, 1), countFrom);
  const qualificationMs = alreadyQualified
    ? null
    : nthWorkingDayFrom(searchFrom, shortfallDays, weekdaySet);

  const qualifiesBeforeLeave =
    alreadyQualified || (qualificationMs !== null && qualificationMs <= lastWorkDay);
  const qualifiesWithinWindow =
    alreadyQualified || (qualificationMs !== null && qualificationMs <= windowEnd);

  // Days she can still add between the count-up-to date and her last work day.
  const daysStillWorkable = Math.max(0, workableBeforeLeave - workableToAsOf);
  const projectedDaysAtLeaveStart = worked + daysStillWorkable;
  const daysShortAtLeaveStart = Math.max(0, QUALIFYING_DAYS - projectedDaysAtLeaveStart);

  /* --- s.5(3) entitlement --- */
  const entitlement = entitlementForSurvivingChildren(children);
  const totalLeaveDays = entitlement.totalWeeks * DAYS_PER_WEEK;
  const maxPrenatalDays = entitlement.maxPrenatalWeeks * DAYS_PER_WEEK;

  const earliestLeaveStart = addDays(edd, -maxPrenatalDays);
  const leaveStartTooEarly = leaveStart < earliestLeaveStart;
  const leaveEnd = addDays(leaveStart, totalLeaveDays - 1);
  const rejoinDate = addDays(leaveEnd, 1);

  const prenatalDaysUsed = Math.max(0, Math.min(totalLeaveDays, Math.round((edd - leaveStart) / MS_PER_DAY)));
  const postnatalDaysLeft = totalLeaveDays - prenatalDaysUsed;

  /* --- s.4(2): no employment in the six weeks after delivery --- */
  const earliestLawfulRejoin = addDays(edd, POST_EVENT_EMPLOYMENT_BAN_WEEKS * DAYS_PER_WEEK + 1);
  const rejoinBreachesS4 = rejoinDate < earliestLawfulRejoin;

  /* --- s.10 additional illness leave, if availed in full --- */
  const illnessLeaveEnd = addDays(addMonths(rejoinDate, ILLNESS_LEAVE_MONTHS), -1);
  const rejoinAfterIllnessLeave = addDays(illnessLeaveEnd, 1);

  /* --- s.11 nursing breaks, s.11A creche, s.2(1)(b) coverage --- */
  const nursingBreaksUntil = addMonths(edd, NURSING_BREAK_MONTHS);
  const crecheApplies = employees >= CRECHE_EMPLOYEE_THRESHOLD;
  const shopCoverageMet = employees >= ACT_COVERAGE_EMPLOYEE_THRESHOLD;

  return {
    error: null,

    // s.5(2) qualification
    qualifyingDaysRequired: QUALIFYING_DAYS,
    daysWorked: worked,
    shortfallDays,
    alreadyQualified,
    qualificationDate: qualificationMs === null ? null : toISODate(qualificationMs),
    qualificationSearchExhausted: !alreadyQualified && qualificationMs === null,
    qualifiesBeforeLeave,
    qualifiesWithinWindow,
    daysStillShortAtLeaveStart: daysShortAtLeaveStart,
    projectedDaysAtLeaveStart,
    windowStart: toISODate(windowStart),
    windowEnd: toISODate(windowEnd),
    countFrom: toISODate(countFrom),
    lastWorkingDayBeforeLeave: toISODate(lastWorkDay),
    workingDaysAvailableInWindow: workableInWindow,
    workingDaysAvailableBeforeLeave: workableBeforeLeave,
    workingDaysPerWeek: perWeek,

    // s.5(3) entitlement and timeline
    totalWeeks: entitlement.totalWeeks,
    totalLeaveDays,
    maxPrenatalWeeks: entitlement.maxPrenatalWeeks,
    entitlementClause: entitlement.clause,
    reducedEntitlement: entitlement.reduced,
    earliestPermissibleLeaveStart: toISODate(earliestLeaveStart),
    leaveStartTooEarly,
    leaveStart: toISODate(leaveStart),
    leaveEnd: toISODate(leaveEnd),
    rejoinDate: toISODate(rejoinDate),
    prenatalDaysUsed,
    postnatalDaysLeft,

    // s.4(2)
    earliestLawfulRejoinDate: toISODate(earliestLawfulRejoin),
    rejoinBreachesS4,

    // s.10
    illnessLeaveMonths: ILLNESS_LEAVE_MONTHS,
    rejoinAfterIllnessLeave: toISODate(rejoinAfterIllnessLeave),

    // s.11 / s.11A / s.2(1)(b) / s.8
    nursingBreaksPerDay: NURSING_BREAKS_PER_DAY,
    nursingBreaksUntil: toISODate(nursingBreaksUntil),
    crecheApplies,
    crecheVisitsPerDay: CRECHE_VISITS_PER_DAY,
    crecheThreshold: CRECHE_EMPLOYEE_THRESHOLD,
    shopCoverageMet,
    coverageThreshold: ACT_COVERAGE_EMPLOYEE_THRESHOLD,
    employeeCount: employees,
    medicalBonusInr: MEDICAL_BONUS_INR,
  };
}

/* ------------------------------------------------------------------ *
 * Other statutory leave events — s.5(4), s.9, s.9A
 * ------------------------------------------------------------------ */

/**
 * Leave periods that run off a single event date.
 *
 * "adoption" and "commissioning" run FROM the date the child is handed over
 * (s.5(4)), so the handover date itself is day 1.
 * "miscarriage" and "tubectomy" run IMMEDIATELY FOLLOWING THE DAY of the event
 * (s.9 and s.9A), so the leave begins on the day after.
 */
export const OTHER_LEAVE_TYPES = {
  adoption: {
    weeks: WEEKS_ADOPTION_COMMISSIONING,
    startsOnEventDay: true,
    section: "s.5(4)",
    label: "Legal adoption of a child below three months — child handed over",
  },
  commissioning: {
    weeks: WEEKS_ADOPTION_COMMISSIONING,
    startsOnEventDay: true,
    section: "s.5(4)",
    label: "Commissioning mother — child handed over",
  },
  miscarriage: {
    weeks: WEEKS_MISCARRIAGE_MTP,
    startsOnEventDay: false,
    section: "s.9",
    label: "Miscarriage or medical termination of pregnancy",
  },
  tubectomy: {
    weeks: WEEKS_TUBECTOMY,
    startsOnEventDay: false,
    section: "s.9A",
    label: "Tubectomy operation",
  },
};

/**
 * @param {object} input
 * @param {string} input.type      key of OTHER_LEAVE_TYPES
 * @param {string} input.eventDate ISO date of handover / miscarriage / operation
 * @returns {object} dated leave block, or { error }
 */
export function computeOtherLeave(input) {
  const { type, eventDate } = input ?? {};
  const rule = OTHER_LEAVE_TYPES[type];
  if (!rule) return { error: "Choose one of the listed leave events." };

  const event = parseISODate(eventDate);
  if (event === null) return { error: "Enter a valid event date in YYYY-MM-DD form." };

  const start = rule.startsOnEventDay ? event : addDays(event, 1);
  const days = rule.weeks * DAYS_PER_WEEK;
  const end = addDays(start, days - 1);

  // s.4(2) bars employment for six weeks after a miscarriage or MTP as well.
  const banApplies = type === "miscarriage";
  const earliestLawfulRejoin = banApplies
    ? addDays(event, POST_EVENT_EMPLOYMENT_BAN_WEEKS * DAYS_PER_WEEK + 1)
    : null;

  return {
    error: null,
    type,
    section: rule.section,
    label: rule.label,
    weeks: rule.weeks,
    totalDays: days,
    eventDate: toISODate(event),
    leaveStart: toISODate(start),
    leaveEnd: toISODate(end),
    rejoinDate: toISODate(addDays(end, 1)),
    startsOnEventDay: rule.startsOnEventDay,
    earliestLawfulRejoinDate: earliestLawfulRejoin === null ? null : toISODate(earliestLawfulRejoin),
  };
}

/* ------------------------------------------------------------------ *
 * Defaults (pure — "today" is supplied by the caller)
 * ------------------------------------------------------------------ */

/** Sensible opening values so the page shows a real, valid result at load. */
export function buildDefaultInputs(todayISO) {
  const today = parseISODate(todayISO);
  if (today === null) return { error: "Supply today's date as YYYY-MM-DD." };
  const edd = addMonths(today, 5);
  return {
    joiningDate: toISODate(addMonths(today, -5)),
    expectedDeliveryDate: toISODate(edd),
    daysWorked: 60,
    asOfDate: toISODate(today),
    survivingChildren: 1,
    leaveStartDate: toISODate(addDays(edd, -PRENATAL_WEEKS_STANDARD * DAYS_PER_WEEK)),
    workingDaysPerWeek: 6,
    employeeCount: 60,
    otherLeaveType: "miscarriage",
    otherLeaveEventDate: toISODate(today),
  };
}
