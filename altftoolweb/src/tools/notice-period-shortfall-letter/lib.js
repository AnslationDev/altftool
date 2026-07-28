/**
 * Notice-period shortfall pricing and negotiation letter.
 *
 * Rules and sources:
 *  - The notice period, the salary component used for recovery (basic or gross)
 *    and the per-day divisor are all contractual. The tool takes each as an
 *    input rather than assuming one.
 *  - CBIC Circular No. 178/10/2022-GST dated 3 August 2022 clarified that
 *    notice pay recovered by an employer from an employee is not consideration
 *    for a supply, so GST is not payable on notice pay recovery.
 *  - Encashment of accrued earned leave on separation is required by the state
 *    Shops and Establishments Acts and by section 79 of the Factories Act, 1948
 *    for covered workers; most employers allow it to be set off against a
 *    notice-pay recovery, but that set-off is a matter of policy.
 *  - Recovery of notice pay is a civil, contractual claim. An employer cannot
 *    withhold a relieving or experience letter as leverage without a contractual
 *    basis; that is a separate grievance.
 */

/** Per-day salary divisors seen in Indian employment contracts. */
export const SALARY_DIVISORS = [
  { id: "30", label: "Fixed 30 days per month", days: 30 },
  { id: "26", label: "26 working days per month", days: 26 },
  { id: "month", label: "Actual number of days in the month", days: null },
];

/** Which salary figure the contract applies the recovery to. */
export const SALARY_BASES = [
  { id: "basic", label: "Basic salary only" },
  { id: "basic-da", label: "Basic + dearness allowance" },
  { id: "gross", label: "Gross monthly salary" },
];

/** CBIC clarification on GST and notice pay recovery. */
export const GST_CIRCULAR = "CBIC Circular No. 178/10/2022-GST dated 3 August 2022";

/** Negotiation ladder offered in the letter and the scenario table. */
export const WAIVER_SCENARIOS = [
  { id: "full", label: "Full waiver requested", waivedShare: 1 },
  { id: "half", label: "Half waived, half bought out", waivedShare: 0.5 },
  { id: "leave-only", label: "Covered fully by leave encashment", waivedShare: 0 },
  { id: "buyout", label: "Bought out in cash", waivedShare: 0 },
];

export const REASON_OPTIONS = [
  { id: "offer-deadline", label: "New employer's joining date cannot be moved", line: "my prospective employer has fixed a joining date that cannot be deferred, and the offer lapses if I do not join by then" },
  { id: "medical", label: "Medical reason in the family", line: "a medical situation in my family requires me to be available sooner than the full notice period allows" },
  { id: "relocation", label: "Relocation already committed", line: "my relocation is already committed, with the move and accommodation booked for a fixed date" },
  { id: "handover-done", label: "Handover already complete", line: "the handover is substantially complete and my continued presence adds little for the remaining weeks" },
  { id: "education", label: "Course or admission start date", line: "the academic programme I have been admitted to begins on a fixed date that I cannot change" },
  { id: "other", label: "Other (describe it yourself)", line: "" },
];

const MS_PER_DAY = 86400000;
const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round2 = (value) => Math.round(value * 100) / 100;

export function parseISODate(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(Number(match[1]), month - 1, day));
  if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date;
}

export function addDaysISO(isoDate, days) {
  const date = parseISODate(isoDate);
  if (!date || !isNum(days)) return null;
  return new Date(date.getTime() + Math.round(days) * MS_PER_DAY).toISOString().slice(0, 10);
}

export function daysBetweenISO(fromISO, toISODate) {
  const from = parseISODate(fromISO);
  const to = parseISODate(toISODate);
  if (!from || !to) return null;
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

export function formatLongDate(isoDate) {
  const date = parseISODate(isoDate);
  if (!date) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** Days in the calendar month that an ISO date falls in. */
export function daysInMonthOf(isoDate) {
  const date = parseISODate(isoDate);
  if (!date) return null;
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
}

/**
 * Price the shortfall between the notice you owe and the notice you will serve.
 * Returns { error } when the inputs cannot produce a sensible figure.
 */
export function computeShortfall({
  resignationDateISO,
  noticeDays,
  proposedLastDayISO,
  monthlySalary,
  divisorId = "30",
  leaveBalanceDays = 0,
  offsetLeave = true,
}) {
  if (!parseISODate(resignationDateISO)) return { error: "Enter a valid resignation date." };
  if (!parseISODate(proposedLastDayISO)) return { error: "Enter a valid proposed last working day." };
  if (!isNum(noticeDays) || noticeDays <= 0) return { error: "Contractual notice period must be greater than zero days." };
  if (noticeDays > 365) return { error: "A notice period longer than 365 days is almost certainly a typo." };
  if (!isNum(monthlySalary) || monthlySalary <= 0) return { error: "Monthly salary must be greater than zero." };
  if (!isNum(leaveBalanceDays) || leaveBalanceDays < 0) return { error: "Leave balance cannot be negative." };

  const contractualLastDayISO = addDaysISO(resignationDateISO, noticeDays);
  const servedDays = daysBetweenISO(resignationDateISO, proposedLastDayISO);
  if (servedDays === null) return { error: "Could not compare the two dates." };
  if (servedDays < 0) {
    return { error: "The proposed last working day is before the resignation date. Check the dates." };
  }

  const shortfallDays = Math.max(0, Math.round(noticeDays - servedDays));
  const divisor = SALARY_DIVISORS.find((item) => item.id === divisorId) || SALARY_DIVISORS[0];
  const divisorDays = divisor.days ?? daysInMonthOf(proposedLastDayISO) ?? 30;
  if (!(divisorDays > 0)) return { error: "Could not work out the number of days to divide the salary by." };

  const perDaySalary = round2(monthlySalary / divisorDays);
  const grossRecovery = round2(perDaySalary * shortfallDays);
  const leaveCredit = round2(perDaySalary * leaveBalanceDays);
  const appliedLeaveCredit = offsetLeave ? round2(Math.min(leaveCredit, grossRecovery)) : 0;
  const netPayable = round2(Math.max(0, grossRecovery - appliedLeaveCredit));
  const leaveLeftOver = round2(Math.max(0, leaveCredit - appliedLeaveCredit));
  const leaveDaysUsed = perDaySalary > 0 ? round2(appliedLeaveCredit / perDaySalary) : 0;

  const scenarios = WAIVER_SCENARIOS.map((scenario) => {
    if (scenario.id === "leave-only") {
      const covered = Math.min(leaveCredit, grossRecovery);
      return {
        id: scenario.id,
        label: scenario.label,
        waivedDays: 0,
        cashPayable: round2(Math.max(0, grossRecovery - covered)),
        note:
          leaveCredit >= grossRecovery
            ? "Your leave balance covers the entire shortfall — no cash needs to change hands."
            : `Leave covers ${round2(covered)} of the ${round2(grossRecovery)} shortfall; the rest still has to be settled.`,
      };
    }
    const waivedDays = round2(shortfallDays * scenario.waivedShare);
    const chargeableDays = round2(shortfallDays - waivedDays);
    const gross = round2(chargeableDays * perDaySalary);
    const credit = offsetLeave ? Math.min(leaveCredit, gross) : 0;
    return {
      id: scenario.id,
      label: scenario.label,
      waivedDays,
      cashPayable: round2(Math.max(0, gross - credit)),
      note:
        scenario.id === "full"
          ? "The whole shortfall is written off by the employer; nothing is recovered."
          : scenario.id === "half"
            ? "A common landing point: the employer waives part and you settle the rest."
            : "You pay for every unserved day at the contractual per-day rate.",
    };
  });

  return {
    contractualLastDayISO,
    servedDays,
    shortfallDays,
    divisorDays,
    perDaySalary,
    grossRecovery,
    leaveCredit,
    appliedLeaveCredit,
    leaveDaysUsed,
    leaveLeftOver,
    netPayable,
    scenarios,
    noShortfall: shortfallDays === 0,
    servedSharePct: noticeDays > 0 ? round2((Math.min(servedDays, noticeDays) / noticeDays) * 100) : 0,
  };
}

const clean = (value) => (typeof value === "string" ? value.trim() : "");
const rupees = (value) =>
  isNum(value) ? `Rs ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value)}` : "Rs —";

/** Compose the negotiation letter to HR / the reporting manager. */
export function buildShortfallLetter({
  employeeName,
  employeeId,
  designation,
  department,
  companyName,
  addressee,
  letterDateISO,
  resignationDateISO,
  proposedLastDayISO,
  noticeDays,
  reasonId,
  reasonText,
  handoverPoints,
  askScenarioId = "half",
  salaryBasisId = "basic",
  result,
}) {
  if (!result || result.error) {
    return { error: result?.error || "Fix the shortfall inputs before drafting the letter." };
  }
  const name = clean(employeeName) || "[Your name]";
  const empId = clean(employeeId) || "[Employee ID]";
  const role = clean(designation) || "[Designation]";
  const dept = clean(department) || "[Department]";
  const company = clean(companyName) || "[Company name]";
  const to = clean(addressee) || "The Head of Human Resources";

  const reason = REASON_OPTIONS.find((item) => item.id === reasonId) || REASON_OPTIONS[0];
  const reasonLine = clean(reasonText) || reason.line || "I have a commitment that I cannot move.";
  const basis = SALARY_BASES.find((item) => item.id === salaryBasisId) || SALARY_BASES[0];
  const scenario = result.scenarios.find((item) => item.id === askScenarioId) || result.scenarios[0];

  const points = clean(handoverPoints)
    ? clean(handoverPoints)
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
    : [
        "All active work items documented in the team wiki with owners named.",
        "Two shadow sessions completed with the colleague taking over.",
        "Vendor and client contacts introduced by email before my last day.",
      ];

  const subject = `Request to reduce notice period — ${name} (${empId}), proposed last working day ${formatLongDate(proposedLastDayISO)}`;

  const askLine = {
    full: `I request that the shortfall of ${result.shortfallDays} days be waived in full, given the handover position set out below.`,
    half: `I request that half the shortfall be waived and that I settle the balance of ${rupees(scenario.cashPayable)} in the full and final settlement.`,
    "leave-only": `I request that my accrued leave balance of ${result.leaveDaysUsed} day(s) be adjusted against the shortfall${result.netPayable > 0 ? `, and that the remaining ${rupees(result.netPayable)} be waived or recovered from my settlement` : ", which covers it in full"}.`,
    buyout: `I am willing to buy out the shortfall of ${result.shortfallDays} days at the contractual rate, amounting to ${rupees(result.grossRecovery)}${result.appliedLeaveCredit > 0 ? `, adjusted against my leave encashment of ${rupees(result.appliedLeaveCredit)}` : ""}.`,
  }[scenario.id];

  const body = [
    formatLongDate(letterDateISO) || "[date]",
    "",
    "To,",
    `${to},`,
    company,
    "",
    `Subject: ${subject}`,
    "",
    "Dear Sir / Madam,",
    "",
    `Further to my resignation dated ${formatLongDate(resignationDateISO)} from the position of ${role} in ${dept}, my contractual notice period of ${noticeDays} days would run to ${formatLongDate(result.contractualLastDayISO)}.`,
    "",
    `I am writing to request an early release with ${formatLongDate(proposedLastDayISO)} as my last working day. This would leave a shortfall of ${result.shortfallDays} days against the ${noticeDays}-day notice, with ${result.servedDays} days (${result.servedSharePct}% of the notice) actually served.`,
    "",
    `The reason for the request is that ${reasonLine}.`,
    "",
    "The handover position on the proposed last working day is as follows:",
    ...points.map((point, index) => `${index + 1}. ${point}`),
    "",
    "Working of the shortfall on the contractual basis:",
    `Salary component applied: ${basis.label.toLowerCase()}`,
    `Per-day rate (monthly salary divided by ${result.divisorDays}): ${rupees(result.perDaySalary)}`,
    `Shortfall: ${result.shortfallDays} days`,
    `Value of the shortfall: ${rupees(result.grossRecovery)}`,
    result.appliedLeaveCredit > 0
      ? `Less accrued leave encashment applied (${result.leaveDaysUsed} day(s)): ${rupees(result.appliedLeaveCredit)}`
      : "Accrued leave encashment: not applied to the shortfall",
    `Net amount at stake: ${rupees(result.netPayable)}`,
    "",
    askLine,
    "",
    `For the record, ${GST_CIRCULAR} clarifies that notice pay recovery by an employer is not a supply and does not attract GST, so no tax should be added to any recovery amount.`,
    "",
    "I have valued my time here and want to leave with the handover complete and the relationship intact. I would be grateful for a written confirmation of the agreed last working day and the settlement position so that both sides have the same record.",
    "",
    "Yours sincerely,",
    "",
    name,
    `${role}, ${dept}`,
    `Employee ID: ${empId}`,
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");

  return { subject, body, wordCount: body.split(/\s+/).filter(Boolean).length };
}
