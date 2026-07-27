/**
 * Indian notice period planner for a software engineer resigning.
 *
 * Pure functions. All dates are ISO "YYYY-MM-DD" strings passed in as
 * arguments — the module never reads the system clock.
 */

const MS_PER_DAY = 86400000;

/**
 * Notice length in India comes from the employment contract, not from a single
 * statute. State Shops and Commercial Establishments Acts set a minimum notice
 * for termination by the employer (commonly one month for employees with six
 * months or more of service); resignation notice is whatever the appointment
 * letter says. 30, 60 and 90 days are the shapes almost every IT contract uses.
 */
export const COMMON_NOTICE_DAYS = [30, 45, 60, 90];
export const MAX_NOTICE_DAYS = 365;

/**
 * Notice pay recovered by an employer from an employee is NOT a supply of
 * service and attracts no GST — CBIC Circular No. 178/10/2022-GST dated
 * 3 August 2022. So the recovery amount here is never grossed up by tax.
 */
export const GST_ON_NOTICE_RECOVERY_PCT = 0;

/**
 * How a day of pay is derived from a monthly figure. Which one applies is in
 * your contract; /30 is the most common for notice recovery, /26 follows the
 * working-days convention used for statutory calculations such as gratuity.
 */
export const DAY_BASIS_OPTIONS = [
  { id: "calendar-30", label: "Monthly ÷ 30 (calendar days)", divisor: 30 },
  { id: "working-26", label: "Monthly ÷ 26 (working days)", divisor: 26 },
];

/** What the recovery is computed on — again, read your appointment letter. */
export const RECOVERY_BASIS_OPTIONS = [
  { id: "basic", label: "Basic salary" },
  { id: "gross", label: "Gross monthly salary" },
  { id: "ctc", label: "Monthly CTC" },
];

/**
 * Handover phases as a share of the served notice. Documentation first while
 * you still remember, then shadowing, then reverse shadowing where the taker
 * drives and you watch, then a buffer for the things nobody thought of.
 */
export const HANDOVER_PHASES = [
  { id: "document", label: "Write it down", share: 0.35 },
  { id: "shadow", label: "Successor shadows you", share: 0.25 },
  { id: "reverse", label: "You shadow the successor", share: 0.25 },
  { id: "buffer", label: "Buffer, exit formalities, asset return", share: 0.15 },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round2 = (value) => Math.round(value * 100) / 100;

export function parseIsoDate(iso) {
  if (typeof iso !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return null;
  const [, y, m, d] = match;
  const year = Number(y);
  const month = Number(m);
  const day = Number(d);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const ms = Date.UTC(year, month - 1, day);
  const back = new Date(ms);
  if (back.getUTCFullYear() !== year || back.getUTCMonth() !== month - 1 || back.getUTCDate() !== day) {
    return null;
  }
  return ms;
}

export function toIsoDate(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

export function addDays(iso, days) {
  const ms = parseIsoDate(iso);
  if (ms === null) return null;
  return toIsoDate(ms + Math.round(days) * MS_PER_DAY);
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function weekdayName(iso) {
  const ms = parseIsoDate(iso);
  return ms === null ? "" : WEEKDAYS[new Date(ms).getUTCDay()];
}

/** Per-day pay from a monthly amount under the chosen divisor. */
export function perDayPay(monthlyAmount, dayBasisId) {
  const option = DAY_BASIS_OPTIONS.find((item) => item.id === dayBasisId);
  if (!option || !isNum(monthlyAmount) || monthlyAmount < 0) return 0;
  return monthlyAmount / option.divisor;
}

/**
 * Split the served notice into dated handover phases.
 * @returns {Array<{id:string,label:string,days:number,start:string,end:string}>}
 */
export function handoverSchedule(startIso, servedDays) {
  if (parseIsoDate(startIso) === null || !isNum(servedDays) || servedDays <= 0) return [];
  const phases = [];
  let allocated = 0;
  HANDOVER_PHASES.forEach((phase, index) => {
    const isLast = index === HANDOVER_PHASES.length - 1;
    const days = isLast
      ? Math.max(1, servedDays - allocated)
      : Math.max(1, Math.round(servedDays * phase.share));
    const start = addDays(startIso, allocated);
    const end = addDays(startIso, allocated + days - 1);
    allocated += days;
    phases.push({ id: phase.id, label: phase.label, days, start, end });
  });
  return phases;
}

/**
 * Full notice period plan.
 *
 * @param {object} input
 * @param {string} input.resignationDate ISO date the resignation is submitted
 * @param {number} input.contractNoticeDays notice required by the contract
 * @param {number} input.servedNoticeDays days you will actually serve
 * @param {number} input.monthlyBasic basic salary per month
 * @param {number} input.monthlyGross gross salary per month
 * @param {number} input.monthlyCtc CTC per month
 * @param {string} input.recoveryBasis one of RECOVERY_BASIS_OPTIONS ids
 * @param {string} input.dayBasis one of DAY_BASIS_OPTIONS ids
 * @param {number} input.leaveBalanceDays unused earned leave in days
 * @param {boolean} input.leaveOffsetsShortfall whether leave can offset notice
 * @returns {{error:string}|object}
 */
export function planNoticePeriod(input) {
  const {
    resignationDate,
    contractNoticeDays,
    servedNoticeDays,
    monthlyBasic,
    monthlyGross,
    monthlyCtc,
    recoveryBasis,
    dayBasis,
    leaveBalanceDays,
    leaveOffsetsShortfall,
  } = input || {};

  if (parseIsoDate(resignationDate) === null) {
    return { error: "Enter a valid resignation date in YYYY-MM-DD form." };
  }
  if (!DAY_BASIS_OPTIONS.some((item) => item.id === dayBasis)) {
    return { error: "Pick how a day of pay is calculated." };
  }
  if (!RECOVERY_BASIS_OPTIONS.some((item) => item.id === recoveryBasis)) {
    return { error: "Pick what the notice recovery is charged on." };
  }

  const numbers = {
    contractNoticeDays,
    servedNoticeDays,
    monthlyBasic,
    monthlyGross,
    monthlyCtc,
    leaveBalanceDays,
  };
  if (Object.values(numbers).some((value) => !isNum(value))) {
    return { error: "Enter a valid number in every field." };
  }
  if (contractNoticeDays < 0 || contractNoticeDays > MAX_NOTICE_DAYS) {
    return { error: `Contractual notice must be between 0 and ${MAX_NOTICE_DAYS} days.` };
  }
  if (servedNoticeDays < 0 || servedNoticeDays > MAX_NOTICE_DAYS) {
    return { error: `Days served must be between 0 and ${MAX_NOTICE_DAYS}.` };
  }
  if (monthlyBasic < 0 || monthlyGross < 0 || monthlyCtc < 0) {
    return { error: "Salary figures cannot be negative." };
  }
  if (monthlyBasic > monthlyGross) {
    return { error: "Basic salary cannot exceed gross salary." };
  }
  if (monthlyGross > monthlyCtc) {
    return { error: "Gross salary cannot exceed monthly CTC." };
  }
  if (leaveBalanceDays < 0 || leaveBalanceDays > 365) {
    return { error: "Leave balance must be between 0 and 365 days." };
  }

  const fullNoticeLwd = addDays(resignationDate, contractNoticeDays);
  const actualLwd = addDays(resignationDate, servedNoticeDays);
  const shortfallDays = Math.max(0, contractNoticeDays - servedNoticeDays);
  const extraDays = Math.max(0, servedNoticeDays - contractNoticeDays);

  const recoveryMonthly =
    recoveryBasis === "basic" ? monthlyBasic : recoveryBasis === "gross" ? monthlyGross : monthlyCtc;
  const recoveryPerDay = perDayPay(recoveryMonthly, dayBasis);

  // Leave encashment on Indian payslips is almost always paid on basic salary.
  const leavePerDay = perDayPay(monthlyBasic, dayBasis);

  const leaveDaysUsedForOffset = leaveOffsetsShortfall
    ? Math.min(leaveBalanceDays, shortfallDays)
    : 0;
  const chargeableShortfallDays = shortfallDays - leaveDaysUsedForOffset;
  const grossRecovery = chargeableShortfallDays * recoveryPerDay;
  const leaveOffsetValue = leaveDaysUsedForOffset * recoveryPerDay;

  const leaveDaysEncashed = Math.max(0, leaveBalanceDays - leaveDaysUsedForOffset);
  const leaveEncashment = leaveDaysEncashed * leavePerDay;

  const netSettlement = leaveEncashment - grossRecovery;

  return {
    fullNoticeLwd,
    fullNoticeLwdDay: weekdayName(fullNoticeLwd),
    actualLwd,
    actualLwdDay: weekdayName(actualLwd),
    shortfallDays,
    extraDays,
    chargeableShortfallDays,
    recoveryPerDay: round2(recoveryPerDay),
    grossRecovery: round2(grossRecovery),
    gstOnRecovery: 0,
    leaveDaysUsedForOffset,
    leaveOffsetValue: round2(leaveOffsetValue),
    leaveDaysEncashed,
    leaveEncashment: round2(leaveEncashment),
    netSettlement: round2(netSettlement),
    recoveryMonthly,
    handover: handoverSchedule(resignationDate, servedNoticeDays),
  };
}

/** Markdown export of the plan. */
export function noticePlanMarkdown(plan, meta) {
  if (!plan || plan.error) return "";
  const lines = [
    "# Notice period plan",
    "",
    `- Resignation date: ${meta.resignationDate}`,
    `- Contractual notice: ${meta.contractNoticeDays} days`,
    `- Serving: ${meta.servedNoticeDays} days`,
    `- Last working day: ${plan.actualLwd} (${plan.actualLwdDay})`,
    `- Full-notice last working day would be: ${plan.fullNoticeLwd}`,
    `- Shortfall: ${plan.shortfallDays} days, of which ${plan.chargeableShortfallDays} are chargeable`,
    `- Notice recovery: INR ${plan.grossRecovery} (no GST — CBIC Circular 178/10/2022-GST)`,
    `- Leave encashed: ${plan.leaveDaysEncashed} days = INR ${plan.leaveEncashment}`,
    `- Net full-and-final: INR ${plan.netSettlement}`,
    "",
    "## Handover schedule",
    ...plan.handover.map((phase) => `- ${phase.start} to ${phase.end} (${phase.days}d): ${phase.label}`),
  ];
  return lines.join("\n");
}
