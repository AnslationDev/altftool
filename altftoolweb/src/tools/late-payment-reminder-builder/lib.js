/**
 * Late payment reminder letter builder — pure logic.
 *
 * Collections practice is an escalation ladder: the tone hardens as the debt
 * ages, and each step names a consequence the previous one did not. The rungs
 * used here follow the standard commercial sequence (courtesy reminder ->
 * first chase -> firm demand -> final notice before recovery action), keyed on
 * whole days past the invoice due date.
 *
 * Dates are supplied by the caller as ISO "YYYY-MM-DD" strings and compared in
 * UTC, so the day count never shifts with the reader's timezone and the module
 * never reads the clock.
 */

const MS_PER_DAY = 86400000;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Parse a strict "YYYY-MM-DD" date to a UTC epoch, rejecting impossible dates
 * such as 2026-02-30 (which Date would silently roll into March).
 *
 * @param {string} iso
 * @returns {{ ms: number, year: number, month: number, day: number } | { error: string }}
 */
export function parseISODate(iso) {
  if (typeof iso !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    return { error: "Enter dates in YYYY-MM-DD form." };
  }
  const [y, m, d] = iso.split("-").map(Number);
  const ms = Date.UTC(y, m - 1, d);
  const back = new Date(ms);
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== m - 1 || back.getUTCDate() !== d) {
    return { error: `${iso} is not a real calendar date.` };
  }
  return { ms, year: y, month: m, day: d };
}

/**
 * Whole days from one date to another (exclusive of the start, inclusive of
 * the end). Positive when `toISO` is later.
 *
 * @param {string} fromISO
 * @param {string} toISO
 * @returns {{ days: number } | { error: string }}
 */
export function daysBetween(fromISO, toISO) {
  const from = parseISODate(fromISO);
  if (from.error) return { error: from.error };
  const to = parseISODate(toISO);
  if (to.error) return { error: to.error };
  return { days: Math.round((to.ms - from.ms) / MS_PER_DAY) };
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "2026-03-09" -> "9 March 2026", built from the string so no timezone applies. */
export function formatLongDate(iso) {
  const parsed = parseISODate(iso);
  if (parsed.error) return iso;
  return `${parsed.day} ${MONTH_NAMES[parsed.month - 1]} ${parsed.year}`;
}

/** Add whole days to an ISO date and return a new ISO date. */
export function addDays(iso, days) {
  const parsed = parseISODate(iso);
  if (parsed.error) return { error: parsed.error };
  if (!isNum(days)) return { error: "The number of days must be a number." };
  const next = new Date(parsed.ms + Math.round(days) * MS_PER_DAY);
  const pad = (value) => String(value).padStart(2, "0");
  return {
    iso: `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-${pad(next.getUTCDate())}`,
  };
}

/**
 * The escalation ladder. `minDays` is the lowest day count past the due date at
 * which the rung applies; a negative value means the invoice is not yet due.
 */
export const ESCALATION_LEVELS = [
  {
    id: "pre-due",
    label: "Courtesy reminder (before due date)",
    tone: "Warm, purely informational",
    minDays: -3650,
    graceDays: 0,
  },
  {
    id: "first",
    label: "First reminder (0-6 days late)",
    tone: "Polite, assumes an oversight",
    minDays: 0,
    graceDays: 7,
  },
  {
    id: "second",
    label: "Second reminder (7-29 days late)",
    tone: "Businesslike, asks for a payment date",
    minDays: 7,
    graceDays: 7,
  },
  {
    id: "firm",
    label: "Firm demand (30-59 days late)",
    tone: "Direct, names consequences",
    minDays: 30,
    graceDays: 5,
  },
  {
    id: "final",
    label: "Final notice (60+ days late)",
    tone: "Formal, last step before recovery action",
    minDays: 60,
    graceDays: 7,
  },
];

/**
 * Tiers whose letter body actually names the computed deadline date (see the
 * `bodies` map in buildReminder, where only these three interpolate
 * `deadlineText`). The pre-due and first-reminder tiers are deliberately
 * softer and deadline-free, so callers must not claim a deadline was "set in
 * the letter" for them.
 */
const LEVELS_WITH_DEADLINE_IN_BODY = new Set(["second", "firm", "final"]);

/**
 * Which rung suits an invoice this many days overdue.
 *
 * @param {number} daysOverdue negative when the invoice is not yet due
 * @returns {object} an entry of ESCALATION_LEVELS
 */
export function suggestLevel(daysOverdue) {
  if (!isNum(daysOverdue)) return ESCALATION_LEVELS[1];
  let chosen = ESCALATION_LEVELS[0];
  for (const level of ESCALATION_LEVELS) {
    if (daysOverdue >= level.minDays) chosen = level;
  }
  return chosen;
}

/**
 * Statutory late-payment regimes, quoted as rules rather than as a single
 * current number because the reference rates move.
 *  - UK: Late Payment of Commercial Debts (Interest) Act 1998 — statutory
 *    interest at 8 percentage points above the Bank of England base rate, plus
 *    fixed compensation of £40 / £70 / £100 by debt size.
 *  - EU: Directive 2011/7/EU — at least 8 percentage points above the ECB
 *    reference rate, plus a minimum €40 recovery cost.
 *  - India (MSME supplier): MSMED Act 2006 s.15-16 — payment within 45 days,
 *    then compound interest monthly at three times the RBI notified bank rate.
 *  - US and most other markets: no general federal statute; the contract's own
 *    late-fee clause governs.
 */
export const JURISDICTIONS = {
  none: {
    id: "none",
    label: "No statutory reference",
    note: "",
  },
  uk: {
    id: "uk",
    label: "United Kingdom (B2B)",
    note:
      "Under the Late Payment of Commercial Debts (Interest) Act 1998 we are entitled to statutory interest at 8 percentage points above the Bank of England base rate, together with fixed compensation of £40, £70 or £100 depending on the size of the debt.",
  },
  eu: {
    id: "eu",
    label: "European Union (B2B)",
    note:
      "Under EU Directive 2011/7/EU on combating late payment in commercial transactions we are entitled to interest of at least 8 percentage points above the European Central Bank reference rate, plus a minimum of €40 towards recovery costs.",
  },
  india_msme: {
    id: "india_msme",
    label: "India — registered MSME supplier",
    note:
      "As a supplier registered under the MSMED Act 2006, sections 15 and 16 require payment within 45 days of acceptance, after which compound interest accrues monthly at three times the bank rate notified by the Reserve Bank of India.",
  },
  contract: {
    id: "contract",
    label: "Contract late-fee clause only",
    note:
      "Our agreed terms provide for a late payment charge on any amount not settled by the due date, and that charge continues to accrue until the balance is cleared.",
  },
};

/** Days in a year used for simple interest on an overdue balance. Commercial
 * contracts overwhelmingly use actual/365 for late payment interest. */
export const DAYS_IN_YEAR = 365;

/**
 * Simple (non-compounding) interest on an overdue balance, actual/365.
 *
 * @param {object} input
 * @param {number} input.amount outstanding principal
 * @param {number} input.annualRatePercent agreed or statutory annual rate
 * @param {number} input.days whole days overdue
 * @returns {{ interest: number, total: number } | { error: string }}
 */
export function overdueInterest({ amount, annualRatePercent, days }) {
  if (!isNum(amount) || amount <= 0) return { error: "The outstanding amount must be greater than zero." };
  if (!isNum(annualRatePercent) || annualRatePercent < 0) return { error: "The interest rate cannot be negative." };
  if (!isNum(days) || days <= 0) return { interest: 0, total: amount };
  const interest = (amount * (annualRatePercent / 100) * days) / DAYS_IN_YEAR;
  if (!Number.isFinite(interest)) return { error: "Those figures are too large to compute." };
  return { interest, total: amount + interest };
}

/**
 * Compound interest with monthly rests at three times the supplied bank
 * rate — the methodology MSMED Act 2006 s.16 actually specifies for a
 * registered MSME supplier, as opposed to the simple actual/365 interest
 * used for every other jurisdiction in this tool. `bankRatePercent` is the
 * RBI notified bank rate the user enters; the statutory entitlement compounds
 * three times that rate monthly. Partial months accrue proportionally so an
 * arbitrary day count still produces a defined figure.
 *
 * @param {object} input
 * @param {number} input.amount outstanding principal
 * @param {number} input.bankRatePercent RBI notified bank rate, annual %
 * @param {number} input.days whole days overdue
 * @returns {{ interest: number, total: number, effectiveAnnualRatePercent: number } | { error: string }}
 */
export function msmeCompoundInterest({ amount, bankRatePercent, days }) {
  if (!isNum(amount) || amount <= 0) return { error: "The outstanding amount must be greater than zero." };
  if (!isNum(bankRatePercent) || bankRatePercent < 0) return { error: "The interest rate cannot be negative." };
  const effectiveAnnualRatePercent = bankRatePercent * 3;
  if (!isNum(days) || days <= 0) return { interest: 0, total: amount, effectiveAnnualRatePercent };
  const monthlyRate = effectiveAnnualRatePercent / 100 / 12;
  const months = days / (DAYS_IN_YEAR / 12);
  const total = amount * (1 + monthlyRate) ** months;
  const interest = total - amount;
  if (!Number.isFinite(interest)) return { error: "Those figures are too large to compute." };
  return { interest, total, effectiveAnnualRatePercent };
}

/**
 * Interest to quote in the letter for the selected jurisdiction. Every
 * jurisdiction other than the Indian MSME regime is quoted as simple
 * actual/365 interest. The MSME regime is different in kind, not just in
 * rate, so its quoted figure must be computed with the same compound
 * monthly / 3x bank rate method the jurisdiction note asserts is the legal
 * entitlement — otherwise the letter states two incompatible methodologies
 * back to back.
 *
 * @param {object} input
 * @param {string} input.jurisdictionId key of JURISDICTIONS
 * @param {number} input.amount outstanding principal
 * @param {number} input.annualRatePercent agreed rate, or the RBI bank rate for india_msme
 * @param {number} input.days whole days overdue
 */
export function reminderInterest({ jurisdictionId, amount, annualRatePercent, days }) {
  if (jurisdictionId === "india_msme") {
    return msmeCompoundInterest({ amount, bankRatePercent: annualRatePercent, days });
  }
  return overdueInterest({ amount, annualRatePercent, days });
}

const clean = (value) => String(value ?? "").trim();

/**
 * Build the subject line and body of one reminder letter.
 *
 * @param {object} input
 * @param {string} input.levelId one of ESCALATION_LEVELS ids
 * @param {string} input.invoiceNumber
 * @param {string} input.invoiceDateISO
 * @param {string} input.dueDateISO
 * @param {string} input.todayISO the date the letter is sent
 * @param {string} input.clientName company being chased
 * @param {string} input.contactName person addressed
 * @param {string} input.senderName
 * @param {string} input.senderCompany
 * @param {string} input.amountLabel already-formatted outstanding amount
 * @param {string} [input.interestLabel] already-formatted interest, if quoted
 * @param {string} input.jurisdictionId key of JURISDICTIONS
 * @param {string} [input.paymentLink]
 * @returns {{ subject: string, body: string, level: object, daysOverdue: number, deadlineISO: string, deadlineStatedInBody: boolean } | { error: string }}
 */
export function buildReminder({
  levelId,
  invoiceNumber,
  invoiceDateISO,
  dueDateISO,
  todayISO,
  clientName,
  contactName,
  senderName,
  senderCompany,
  amountLabel,
  interestLabel,
  jurisdictionId,
  paymentLink,
}) {
  const gap = daysBetween(dueDateISO, todayISO);
  if (gap.error) return { error: gap.error };
  const invoiceDate = parseISODate(invoiceDateISO);
  if (invoiceDate.error) return { error: invoiceDate.error };
  const due = parseISODate(dueDateISO);
  if (due.error) return { error: due.error };
  if (invoiceDate.ms > due.ms) {
    return { error: "The due date cannot fall before the invoice date." };
  }
  if (!clean(invoiceNumber)) return { error: "Enter the invoice number being chased." };
  if (!clean(clientName)) return { error: "Enter the client or company name." };

  const level = ESCALATION_LEVELS.find((item) => item.id === levelId) ?? suggestLevel(gap.days);
  const jurisdiction = JURISDICTIONS[jurisdictionId] ?? JURISDICTIONS.none;
  const daysOverdue = gap.days;

  const deadline = addDays(todayISO, level.graceDays);
  const deadlineText = deadline.iso ? formatLongDate(deadline.iso) : "";

  const greetingName = clean(contactName) || clean(clientName);
  const greeting = `Dear ${greetingName},`;
  const invoiceLine = `Invoice ${clean(invoiceNumber)}, dated ${formatLongDate(invoiceDateISO)}, for ${amountLabel}, was due for payment on ${formatLongDate(dueDateISO)}.`;
  const ageLine = daysOverdue > 0
    ? `That payment is now ${daysOverdue} day${daysOverdue === 1 ? "" : "s"} overdue.`
    : daysOverdue === 0
      ? "That payment falls due today."
      : `That leaves ${Math.abs(daysOverdue)} day${Math.abs(daysOverdue) === 1 ? "" : "s"} before it falls due.`;

  const bodies = {
    "pre-due": [
      `This is a friendly reminder ahead of the due date on ${formatLongDate(dueDateISO)}.`,
      invoiceLine,
      ageLine,
      "No action is needed if payment is already scheduled — this note is simply so the invoice does not get lost in a queue.",
    ],
    first: [
      "I hope this finds you well.",
      invoiceLine,
      `${ageLine} It is very likely this has simply been missed, so I wanted to flag it.`,
      "Could you confirm the payment has been released, or let me know if anything is holding it up?",
    ],
    second: [
      "I am following up on a payment that is still outstanding.",
      invoiceLine,
      ageLine,
      `Could you send the payment, or reply with the date it will be released, by ${deadlineText}? If there is a query on the invoice, tell me what it is and I will resolve it the same day.`,
    ],
    firm: [
      "This is a formal request for payment of an overdue account.",
      invoiceLine,
      `${ageLine} Despite earlier reminders, the balance remains unpaid and no payment date has been confirmed.`,
      `Please settle the full amount by ${deadlineText}. Until it is cleared we will hold further work and new orders on this account.`,
    ],
    final: [
      "FINAL NOTICE BEFORE RECOVERY ACTION",
      invoiceLine,
      `${ageLine} Repeated reminders have not produced payment or a payment plan.`,
      `Unless the balance is paid in full by ${deadlineText}, we will pass the debt to a recovery agent or commence proceedings to recover it, along with interest and any costs allowed. We would far rather settle this directly — call me today if you want to agree a schedule instead.`,
    ],
  };

  const paragraphs = [greeting, ...(bodies[level.id] ?? bodies.first)];

  if (interestLabel) {
    paragraphs.push(`Interest accrued on the overdue balance to date: ${interestLabel}.`);
  }
  if (jurisdiction.note && level.id !== "pre-due" && level.id !== "first") {
    paragraphs.push(jurisdiction.note);
  }
  if (clean(paymentLink)) {
    paragraphs.push(`You can pay here: ${clean(paymentLink)}`);
  }

  paragraphs.push(
    level.id === "final" ? "Yours faithfully," : "Many thanks,",
    [clean(senderName), clean(senderCompany)].filter(Boolean).join("\n"),
  );

  const subjects = {
    "pre-due": `Reminder: invoice ${clean(invoiceNumber)} due ${formatLongDate(dueDateISO)}`,
    first: `Invoice ${clean(invoiceNumber)} — payment now due`,
    second: `Overdue: invoice ${clean(invoiceNumber)} (${daysOverdue} days past due)`,
    firm: `Action needed: invoice ${clean(invoiceNumber)} is ${daysOverdue} days overdue`,
    final: `FINAL NOTICE — invoice ${clean(invoiceNumber)}, ${amountLabel} outstanding`,
  };

  return {
    subject: subjects[level.id] ?? subjects.first,
    body: paragraphs.filter(Boolean).join("\n\n"),
    level,
    daysOverdue,
    deadlineISO: deadline.iso ?? todayISO,
    deadlineStatedInBody: LEVELS_WITH_DEADLINE_IN_BODY.has(level.id),
    jurisdiction,
  };
}
