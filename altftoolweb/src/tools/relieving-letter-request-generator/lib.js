/**
 * Relieving letter / exit document request builder.
 *
 * Rules referenced (India):
 *  - Payment of Wages Act, 1936 s.5(2): where employment is terminated, wages
 *    earned must be paid before the expiry of the second working day from the
 *    day employment ends.
 *  - Code on Wages, 2019 s.17(2) carries the same two-working-day rule forward
 *    for an employee who resigns, is removed, dismissed or retrenched. The Code
 *    is enacted but its provisions come into force as notified, so the 1936 Act
 *    still governs in states where the Code has not been brought into force.
 *  - Payment of Gratuity Act, 1972 s.7(3): the employer must arrange to pay
 *    gratuity within 30 days of it becoming payable; s.7(3A) makes simple
 *    interest payable on a delay beyond that.
 *  - Payment of Gratuity Act, 1972 s.4(1): gratuity is payable on resignation
 *    after five years of continuous service.
 *  - There is no central statute that mandates a document called a "relieving
 *    letter". Several state Shops and Establishments Acts do require the
 *    employer to give a service certificate when employment ends, and EPFO
 *    requires the employer to mark the date of exit in the member's account.
 */

/** Payment of Wages Act, 1936 s.5(2) / Code on Wages, 2019 s.17(2). */
export const WAGES_SETTLEMENT_WORKING_DAYS = 2;

/** Payment of Gratuity Act, 1972 s.7(3). */
export const GRATUITY_PAYMENT_DAYS = 30;

/** Payment of Gratuity Act, 1972 s.4(1) — continuous service threshold. */
export const GRATUITY_SERVICE_YEARS = 5;

/** Many High Court and tribunal decisions treat 4 years plus 240 days in the
 *  fifth year as five years of continuous service; it is persuasive, not
 *  settled across every jurisdiction. */
export const GRATUITY_ALTERNATE_DAYS = 4 * 365 + 240;

/** Company policy, not statute: most employers close full and final settlement
 *  in 30-45 days. Used only to say when a follow-up is overdue. */
export const TYPICAL_FNF_DAYS = 45;

export const DOCUMENT_ITEMS = [
  { id: "relieving", label: "Relieving letter", detail: "Confirms the date you were relieved and that no dues are pending against you." },
  { id: "experience", label: "Experience / service certificate", detail: "States designation, tenure and nature of duties. Several state Shops and Establishments Acts require a service certificate on request." },
  { id: "fnf", label: "Full and final settlement statement", detail: "The itemised working of salary, leave encashment, deductions and recoveries." },
  { id: "form16", label: "Form 16 for the year", detail: "TDS certificate for salary paid, needed to file your income-tax return." },
  { id: "pf-exit", label: "EPF date of exit marked", detail: "Until the employer marks the date of exit, you cannot withdraw or transfer your provident fund online." },
  { id: "gratuity", label: "Gratuity payment", detail: "Payable after five years of continuous service, within 30 days of becoming due." },
  { id: "leave", label: "Leave encashment", detail: "Payment for the accrued earned leave standing to your credit on the last working day." },
  { id: "noc", label: "No-dues certificate", detail: "Confirmation that assets, ID card and access have been returned and nothing is outstanding." },
];

const MS_PER_DAY = 86400000;
const isNum = (value) => typeof value === "number" && Number.isFinite(value);

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

const toISO = (date) => date.toISOString().slice(0, 10);

export function addDaysISO(isoDate, days) {
  const date = parseISODate(isoDate);
  if (!date || !isNum(days)) return null;
  return toISO(new Date(date.getTime() + Math.round(days) * MS_PER_DAY));
}

/** Add calendar months, clamping to the last day of the target month. */
export function addMonthsISO(isoDate, months) {
  const date = parseISODate(isoDate);
  if (!date || !isNum(months)) return null;
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const lastDay = new Date(Date.UTC(year, month + months + 1, 0)).getUTCDate();
  return toISO(new Date(Date.UTC(year, month + months, Math.min(day, lastDay))));
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

/** Add working days, skipping Saturdays and Sundays. */
export function addWorkingDaysISO(isoDate, workingDays) {
  const date = parseISODate(isoDate);
  if (!date || !isNum(workingDays) || workingDays < 0) return null;
  let cursor = date.getTime();
  let added = 0;
  while (added < Math.round(workingDays)) {
    cursor += MS_PER_DAY;
    const weekday = new Date(cursor).getUTCDay();
    if (weekday !== 0 && weekday !== 6) added += 1;
  }
  return toISO(new Date(cursor));
}

/**
 * Years / months / days of service between two dates, computed by walking
 * whole calendar months so that end-of-month joining dates behave sensibly.
 */
export function tenureBreakdown(joiningISO, lastDayISO) {
  const from = parseISODate(joiningISO);
  const to = parseISODate(lastDayISO);
  if (!from || !to || to.getTime() < from.getTime()) return null;
  let months = 0;
  // Guard: no employment record is longer than 100 years.
  while (months < 1200) {
    const next = addMonthsISO(joiningISO, months + 1);
    if (!next || parseISODate(next).getTime() > to.getTime()) break;
    months += 1;
  }
  const anchorISO = addMonthsISO(joiningISO, months);
  const days = daysBetweenISO(anchorISO, lastDayISO);
  const totalDays = daysBetweenISO(joiningISO, lastDayISO) + 1;
  return {
    years: Math.floor(months / 12),
    months: months % 12,
    days,
    totalMonths: months,
    totalDays,
  };
}

const plural = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;

export function formatTenure(tenure) {
  if (!tenure) return "";
  const parts = [];
  if (tenure.years) parts.push(plural(tenure.years, "year"));
  if (tenure.months) parts.push(plural(tenure.months, "month"));
  if (tenure.days || parts.length === 0) parts.push(plural(tenure.days, "day"));
  return parts.join(", ");
}

/**
 * Work out the tenure, the statutory deadlines and how overdue the employer is.
 * Returns { error } for unusable input.
 */
export function computeExitStatus({ joiningDateISO, lastWorkingDayISO, todayISO }) {
  if (!parseISODate(joiningDateISO)) return { error: "Enter a valid date of joining." };
  if (!parseISODate(lastWorkingDayISO)) return { error: "Enter a valid last working day." };
  if (!parseISODate(todayISO)) return { error: "Enter a valid letter date." };

  const serviceDays = daysBetweenISO(joiningDateISO, lastWorkingDayISO);
  if (serviceDays < 0) {
    return { error: "The last working day is before the date of joining. Check the two dates." };
  }
  const elapsedDays = daysBetweenISO(lastWorkingDayISO, todayISO);
  if (elapsedDays < 0) {
    return { error: "The letter date is before your last working day — this follow-up would be premature." };
  }

  const tenure = tenureBreakdown(joiningDateISO, lastWorkingDayISO);
  const wagesDueISO = addWorkingDaysISO(lastWorkingDayISO, WAGES_SETTLEMENT_WORKING_DAYS);
  const gratuityDueISO = addDaysISO(lastWorkingDayISO, GRATUITY_PAYMENT_DAYS);
  const typicalFnfISO = addDaysISO(lastWorkingDayISO, TYPICAL_FNF_DAYS);

  const gratuityEligible = tenure.years >= GRATUITY_SERVICE_YEARS;
  const gratuityBorderline =
    !gratuityEligible && tenure.totalDays >= GRATUITY_ALTERNATE_DAYS;

  const overdueWages = daysBetweenISO(wagesDueISO, todayISO);
  const overdueGratuity = daysBetweenISO(gratuityDueISO, todayISO);

  let tone = "polite";
  if (elapsedDays > TYPICAL_FNF_DAYS) tone = "firm";
  if (elapsedDays > TYPICAL_FNF_DAYS * 2) tone = "final";

  return {
    tenure,
    tenureText: formatTenure(tenure),
    serviceDays: tenure.totalDays,
    elapsedDays,
    wagesDueISO,
    gratuityDueISO,
    typicalFnfISO,
    gratuityEligible,
    gratuityBorderline,
    wagesOverdueBy: overdueWages > 0 ? overdueWages : 0,
    gratuityOverdueBy: overdueGratuity > 0 ? overdueGratuity : 0,
    tone,
  };
}

const clean = (value) => (typeof value === "string" ? value.trim() : "");

/** Compose the request / follow-up letter. */
export function buildRelievingRequest({
  employeeName,
  employeeId,
  designation,
  department,
  companyName,
  addressee,
  joiningDateISO,
  lastWorkingDayISO,
  letterDateISO,
  requestedDocIds = [],
  reminderCount = 0,
  personalEmail,
  personalPhone,
  postalAddress,
  extraNotes,
  status,
}) {
  if (!status || status.error) {
    return { error: status?.error || "Fix the dates before drafting the letter." };
  }
  const name = clean(employeeName) || "[Your name]";
  const empId = clean(employeeId) || "[Employee ID]";
  const role = clean(designation) || "[Designation]";
  const dept = clean(department) || "[Department]";
  const company = clean(companyName) || "[Company name]";
  const to = clean(addressee) || "The Head of Human Resources";

  const wanted = DOCUMENT_ITEMS.filter((item) => requestedDocIds.includes(item.id));
  const items = wanted.length > 0 ? wanted : DOCUMENT_ITEMS.slice(0, 3);

  const toneOpening = {
    polite: `I resigned from the position of ${role} in ${dept} and was relieved on ${formatLongDate(lastWorkingDayISO)}. I am writing to request the exit documents listed below so that I can complete the joining formalities with my next employer.`,
    firm: `I was relieved from the position of ${role} in ${dept} on ${formatLongDate(lastWorkingDayISO)}, which is ${status.elapsedDays} days ago. Despite ${reminderCount > 0 ? `${reminderCount} earlier reminder(s)` : "my earlier follow-ups"}, the documents listed below are still pending.`,
    final: `It is now ${status.elapsedDays} days since I was relieved on ${formatLongDate(lastWorkingDayISO)}, and the documents listed below remain outstanding despite ${reminderCount > 0 ? `${reminderCount} written reminder(s)` : "repeated follow-ups"}. This letter is a final request before I take the matter up with the labour authorities.`,
  }[status.tone];

  const statutoryLines = [
    `The wages earned up to my last working day were payable before the expiry of the second working day from ${formatLongDate(lastWorkingDayISO)}, that is by ${formatLongDate(status.wagesDueISO)}, under section 5(2) of the Payment of Wages Act, 1936 (and section 17(2) of the Code on Wages, 2019).`,
  ];
  if (status.gratuityEligible) {
    statutoryLines.push(
      `Having completed ${status.tenureText} of continuous service, gratuity is payable to me under section 4(1) of the Payment of Gratuity Act, 1972 and had to be arranged within 30 days, that is by ${formatLongDate(status.gratuityDueISO)}, under section 7(3) of that Act. Section 7(3A) provides for simple interest on any delay beyond that date.`,
    );
  }
  statutoryLines.push(
    "Please also mark my date of exit in the EPF portal, without which I am unable to transfer or withdraw my provident fund accumulations.",
  );

  const subject =
    status.tone === "polite"
      ? `Request for relieving letter and exit documents — ${name} (${empId})`
      : `Reminder ${reminderCount + 1}: relieving letter and exit documents pending — ${name} (${empId})`;

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
    toneOpening,
    "",
    `Employee ID: ${empId}`,
    `Date of joining: ${formatLongDate(joiningDateISO)}`,
    `Last working day: ${formatLongDate(lastWorkingDayISO)}`,
    `Total service: ${status.tenureText} (${status.serviceDays} days)`,
    "",
    "Documents and payments requested:",
    ...items.map((item, index) => `${index + 1}. ${item.label} — ${item.detail}`),
    "",
    ...statutoryLines,
    "",
    clean(extraNotes) ||
      "I confirm that I have returned all company assets, completed the handover and have no dues outstanding against me. Please let me know at once if anything is pending from my side.",
    "",
    status.tone === "final"
      ? "If I do not receive these documents within fifteen days of this letter, I will be constrained to take the matter up with the jurisdictional Labour Commissioner and, for the gratuity claim, with the Controlling Authority under the Payment of Gratuity Act, 1972."
      : "I would be grateful for a response confirming when these will be issued.",
    "",
    "Kindly send the documents by email and a signed hard copy to the address below.",
    "",
    "Yours sincerely,",
    "",
    name,
    `Former ${role}, ${dept}`,
    clean(personalEmail) ? `Email: ${clean(personalEmail)}` : "Email: [your personal email]",
    clean(personalPhone) ? `Phone: ${clean(personalPhone)}` : "Phone: [your phone number]",
    clean(postalAddress) ? `Address: ${clean(postalAddress)}` : "Address: [your postal address]",
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");

  return { subject, body, wordCount: body.split(/\s+/).filter(Boolean).length, items };
}
