/**
 * Maternity leave date maths.
 *
 * Statutory source: the Maternity Benefit Act, 1961 (India) as amended by the
 * Maternity Benefit (Amendment) Act, 2017. Section references are noted against
 * each constant. Pure module: every date is passed in as an ISO "YYYY-MM-DD"
 * string, nothing here reads the system clock.
 */

const MS_PER_DAY = 86400000;

export const MATERNITY_RULES = {
  // s.5(3): 26 weeks for a woman with fewer than two surviving children,
  // of which not more than 8 weeks may be taken before the expected delivery date.
  STANDARD_WEEKS: 26,
  STANDARD_MAX_PRE_WEEKS: 8,
  // s.5(3) proviso: 12 weeks for a woman who already has two or more surviving
  // children, of which not more than 6 weeks may fall before the expected date.
  THIRD_CHILD_WEEKS: 12,
  THIRD_CHILD_MAX_PRE_WEEKS: 6,
  SURVIVING_CHILDREN_THRESHOLD: 2,
  // s.5(4): adopting mother of a child below three months, and commissioning
  // mother, get 12 weeks from the date the child is handed over.
  ADOPTION_WEEKS: 12,
  // s.9: six weeks from the day of miscarriage or medical termination of pregnancy.
  MISCARRIAGE_WEEKS: 6,
  // s.9A: two weeks immediately following the day of a tubectomy operation.
  TUBECTOMY_WEEKS: 2,
  // s.10: additional leave for illness arising out of pregnancy, delivery,
  // premature birth, miscarriage, MTP or tubectomy — maximum one month.
  ILLNESS_MAX_DAYS: 30,
  // s.5(2): the woman must have worked at least 80 days in the 12 months
  // immediately preceding the expected date of delivery to claim the benefit.
  MIN_QUALIFYING_DAYS: 80,
  // s.11: two nursing breaks a day until the child is 15 months old.
  NURSING_BREAK_MONTHS: 15,
  // s.5(5): work-from-home may be mutually agreed after the leave period ends.
  DAYS_PER_WEEK: 7,
};

export const LEAVE_MODES = [
  { id: "birth", label: "Pregnancy / childbirth", anchor: "Expected date of delivery" },
  { id: "adoption", label: "Adoption or commissioning (surrogacy)", anchor: "Date child is handed over" },
  { id: "miscarriage", label: "Miscarriage or medical termination", anchor: "Date of miscarriage / MTP" },
  { id: "tubectomy", label: "Tubectomy operation", anchor: "Date of operation" },
];

/** Parse a strict ISO date into a UTC timestamp, or null when it is not a real date. */
export function parseISODate(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const ts = Date.UTC(year, month - 1, day);
  const probe = new Date(ts);
  if (
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() !== month - 1 ||
    probe.getUTCDate() !== day
  ) {
    return null;
  }
  return ts;
}

/** UTC timestamp -> "YYYY-MM-DD". */
export function toISODate(ts) {
  if (!Number.isFinite(ts)) return "";
  return new Date(ts).toISOString().slice(0, 10);
}

export function addDays(ts, days) {
  return ts + days * MS_PER_DAY;
}

/** Calendar-month addition with clamping (31 Jan + 1 month = 28/29 Feb). */
export function addMonths(ts, months) {
  const date = new Date(ts);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const targetMonthStart = Date.UTC(year, month + months, 1);
  const probe = new Date(targetMonthStart);
  const lastDay = new Date(
    Date.UTC(probe.getUTCFullYear(), probe.getUTCMonth() + 1, 0),
  ).getUTCDate();
  return Date.UTC(probe.getUTCFullYear(), probe.getUTCMonth(), Math.min(day, lastDay));
}

/** Inclusive day count between two UTC timestamps. */
export function daysBetween(fromTs, toTs) {
  return Math.round((toTs - fromTs) / MS_PER_DAY);
}

/**
 * Entitlement lookup for the pregnancy/childbirth path.
 * Returns weeks of leave and the cap on the pre-delivery portion.
 */
export function entitlementForChildren(survivingChildren) {
  const count = Math.max(0, Math.floor(Number(survivingChildren) || 0));
  if (count >= MATERNITY_RULES.SURVIVING_CHILDREN_THRESHOLD) {
    return {
      weeks: MATERNITY_RULES.THIRD_CHILD_WEEKS,
      maxPreWeeks: MATERNITY_RULES.THIRD_CHILD_MAX_PRE_WEEKS,
      basis: "s.5(3) proviso — two or more surviving children",
    };
  }
  return {
    weeks: MATERNITY_RULES.STANDARD_WEEKS,
    maxPreWeeks: MATERNITY_RULES.STANDARD_MAX_PRE_WEEKS,
    basis: "s.5(3) — fewer than two surviving children",
  };
}

/**
 * Full maternity leave plan.
 *
 * @param {object} input
 * @param {string} input.mode              one of LEAVE_MODES ids
 * @param {string} input.anchorDate        ISO date: due date, handover date or event date
 * @param {number} input.survivingChildren surviving children before this birth (birth mode only)
 * @param {number} input.preDeliveryWeeks  weeks of leave requested before the due date
 * @param {number} input.illnessDays       extra s.10 illness leave, 0-30 days
 * @param {number} input.daysWorked        days worked in the preceding 12 months (0 = skip check)
 * @returns {object} plan, or { error } when the input cannot produce a valid plan
 */
export function computeMaternityLeave({
  mode = "birth",
  anchorDate,
  survivingChildren = 0,
  preDeliveryWeeks = MATERNITY_RULES.STANDARD_MAX_PRE_WEEKS,
  illnessDays = 0,
  daysWorked = 0,
} = {}) {
  const known = LEAVE_MODES.some((item) => item.id === mode);
  if (!known) return { error: "Choose one of the listed leave types." };

  const anchorTs = parseISODate(anchorDate);
  if (anchorTs === null) {
    return { error: "Enter a valid date in YYYY-MM-DD form." };
  }

  const illness = Number(illnessDays);
  if (!Number.isFinite(illness) || illness < 0) {
    return { error: "Illness leave cannot be negative." };
  }
  if (illness > MATERNITY_RULES.ILLNESS_MAX_DAYS) {
    return {
      error: `Section 10 illness leave is capped at ${MATERNITY_RULES.ILLNESS_MAX_DAYS} days (one month).`,
    };
  }

  const worked = Number(daysWorked);
  if (!Number.isFinite(worked) || worked < 0 || worked > 366) {
    return { error: "Days worked in the last 12 months must be between 0 and 366." };
  }

  let entitledWeeks;
  let maxPreWeeks = 0;
  let basis;

  if (mode === "birth") {
    const entitlement = entitlementForChildren(survivingChildren);
    entitledWeeks = entitlement.weeks;
    maxPreWeeks = entitlement.maxPreWeeks;
    basis = entitlement.basis;
  } else if (mode === "adoption") {
    entitledWeeks = MATERNITY_RULES.ADOPTION_WEEKS;
    basis = "s.5(4) — adopting or commissioning mother";
  } else if (mode === "miscarriage") {
    entitledWeeks = MATERNITY_RULES.MISCARRIAGE_WEEKS;
    basis = "s.9 — miscarriage or medical termination of pregnancy";
  } else {
    entitledWeeks = MATERNITY_RULES.TUBECTOMY_WEEKS;
    basis = "s.9A — tubectomy operation";
  }

  const totalDays = entitledWeeks * MATERNITY_RULES.DAYS_PER_WEEK;

  let requestedPreWeeks = 0;
  let preCapped = false;
  if (mode === "birth") {
    const requested = Number(preDeliveryWeeks);
    if (!Number.isFinite(requested) || requested < 0) {
      return { error: "Weeks taken before the due date cannot be negative." };
    }
    requestedPreWeeks = requested;
    if (requested > maxPreWeeks) {
      requestedPreWeeks = maxPreWeeks;
      preCapped = true;
    }
  }

  const preDays = Math.round(requestedPreWeeks * MATERNITY_RULES.DAYS_PER_WEEK);
  const startTs = mode === "birth" ? addDays(anchorTs, -preDays) : anchorTs;
  const endTs = addDays(startTs, totalDays - 1);
  const rejoinTs = addDays(endTs, 1);
  const illnessEndTs = illness > 0 ? addDays(rejoinTs, illness - 1) : null;
  const finalRejoinTs = illness > 0 ? addDays(illnessEndTs, 1) : rejoinTs;

  const eligibilityChecked = mode !== "adoption" && worked > 0;
  const eligible = !eligibilityChecked || worked >= MATERNITY_RULES.MIN_QUALIFYING_DAYS;

  const nursingUntilTs =
    mode === "birth" || mode === "adoption"
      ? addMonths(anchorTs, MATERNITY_RULES.NURSING_BREAK_MONTHS)
      : null;

  const milestones = [
    { label: "Leave begins", date: toISODate(startTs) },
    ...(mode === "birth"
      ? [{ label: "Expected date of delivery", date: toISODate(anchorTs) }]
      : []),
    { label: "Paid leave ends", date: toISODate(endTs) },
    ...(illness > 0
      ? [{ label: "Illness leave ends (s.10)", date: toISODate(illnessEndTs) }]
      : []),
    { label: "Report back to work", date: toISODate(finalRejoinTs) },
    ...(nursingUntilTs
      ? [{ label: "Nursing breaks available until", date: toISODate(nursingUntilTs) }]
      : []),
  ];

  return {
    mode,
    basis,
    entitledWeeks,
    totalDays,
    preWeeks: requestedPreWeeks,
    preDays,
    postDays: totalDays - preDays,
    postWeeks: (totalDays - preDays) / MATERNITY_RULES.DAYS_PER_WEEK,
    maxPreWeeks,
    preCapped,
    illnessDays: illness,
    totalLeaveDays: totalDays + illness,
    anchorDate: toISODate(anchorTs),
    leaveStart: toISODate(startTs),
    leaveEnd: toISODate(endTs),
    rejoinDate: toISODate(finalRejoinTs),
    illnessEnd: illnessEndTs === null ? "" : toISODate(illnessEndTs),
    nursingBreaksUntil: nursingUntilTs === null ? "" : toISODate(nursingUntilTs),
    eligibilityChecked,
    eligible,
    daysWorked: worked,
    qualifyingDaysShort: eligible ? 0 : MATERNITY_RULES.MIN_QUALIFYING_DAYS - worked,
    milestones,
  };
}
