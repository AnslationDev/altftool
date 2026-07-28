/**
 * Telecom billing complaint letter generator — pure logic.
 *
 * The escalation ladder and its deadlines follow the TRAI Telecom Consumers
 * Complaint Redressal Regulations, 2012 and the TRAI Quality of Service
 * benchmarks. This is an informational drafting aid, not legal advice.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * TRAI Quality of Service benchmark: billing complaints must be resolved
 * within four weeks of being registered.
 */
export const BILLING_RESOLUTION_DAYS = 28;

/**
 * TRAI Quality of Service benchmark: any credit, waiver or adjustment agreed
 * must reach the customer's account within one week of the resolution.
 */
export const CREDIT_ADJUSTMENT_DAYS = 7;

/**
 * TRAI Telecom Consumers Complaint Redressal Regulations, 2012: an appeal to
 * the service provider's Appellate Authority may be filed within three months
 * of the end of the redressal period.
 */
export const APPEAL_WINDOW_MONTHS = 3;

/**
 * Consumer Protection Act, 2019, as revised by the pecuniary limits
 * notification of December 2021: a District Commission hears complaints where
 * the consideration paid does not exceed Rs 50 lakh.
 */
export const DISTRICT_COMMISSION_LIMIT_INR = 5000000;

/** Toll-free numbers a consumer can use before writing at all. */
export const HELPLINES = [
  { id: "operator", label: "Your operator's complaint centre", number: "198 (toll-free)" },
  { id: "nch", label: "National Consumer Helpline", number: "1915" },
];

/** The stage the complaint has reached decides who the letter is addressed to. */
export const ESCALATION_STAGES = [
  {
    id: "complaint-centre",
    label: "First complaint — Complaint Centre",
    addressee: "The Complaint Centre / Customer Service Head",
    opening:
      "I am writing to register a formal complaint about my telecom account and to ask for it to be corrected.",
    demandLine:
      "Please register this complaint, issue me a docket number as required by the TRAI Telecom Consumers Complaint Redressal Regulations, 2012, and resolve it within the four-week benchmark for billing complaints.",
  },
  {
    id: "appellate",
    label: "Escalation — Appellate Authority",
    addressee: "The Appellate Authority",
    opening:
      "I am filing an appeal under the TRAI Telecom Consumers Complaint Redressal Regulations, 2012 because my complaint to the Complaint Centre has not been resolved.",
    demandLine:
      "Please register this appeal, acknowledge it in writing, and decide it in accordance with the Regulations. I have already exhausted the Complaint Centre stage.",
  },
  {
    id: "commission",
    label: "Final notice before a consumer commission",
    addressee: "The Nodal Officer / Appellate Authority",
    opening:
      "This is a final notice before I approach the District Consumer Disputes Redressal Commission under the Consumer Protection Act, 2019.",
    demandLine:
      "Unless the disputed amount is credited and confirmed in writing within 15 days of this letter, I will file a consumer complaint seeking a refund, compensation for deficiency in service, and costs.",
  },
];

/** The kinds of telecom billing and service problem this letter can cover. */
export const COMPLAINT_TYPES = [
  {
    id: "excess",
    label: "Charged more than the plan rate",
    describe: "the bill charges more than the tariff I subscribed to",
  },
  {
    id: "vas",
    label: "Value-added service I never activated",
    describe: "a value-added or subscription service was activated on my number without my consent",
  },
  {
    id: "data",
    label: "Data charges despite an active pack",
    describe: "data was charged separately even though an active data pack covered the usage",
  },
  {
    id: "roaming",
    label: "Roaming or international charges",
    describe: "roaming or international charges appear for a service I did not use or enable",
  },
  {
    id: "plan",
    label: "Plan changed without consent",
    describe: "my tariff plan was changed without my request or consent",
  },
  {
    id: "double",
    label: "Payment not credited / charged twice",
    describe: "a payment I made was not credited, or the same amount was debited twice",
  },
  {
    id: "cancelled",
    label: "Billed after disconnection request",
    describe: "billing continued after I had requested disconnection of the service",
  },
  {
    id: "outage",
    label: "No service or repeated outages",
    describe: "the service was unavailable or unusable for extended periods during the billed month",
  },
  {
    id: "speed",
    label: "Broadband speed far below the plan",
    describe: "the broadband speed delivered was far below the speed advertised for my plan",
  },
];

/** What the complainant wants. */
export const RELIEF_OPTIONS = [
  { id: "refund", label: "Refund to my bank account", text: "refund the disputed amount to my bank account" },
  { id: "credit", label: "Credit against the next bill", text: "credit the disputed amount against my next bill" },
  { id: "reverse", label: "Reverse the charge and issue a revised bill", text: "reverse the charge and issue a corrected bill" },
  { id: "deactivate", label: "Deactivate the service and stop billing", text: "deactivate the service and stop all further billing" },
  { id: "restore", label: "Restore the plan I actually subscribed to", text: "restore the tariff plan I originally subscribed to" },
];

const isNumber = (value) => typeof value === "number" && Number.isFinite(value);
const clean = (value) => (typeof value === "string" ? value.trim() : "");

/** Parse "YYYY-MM-DD" into a UTC Date, or null when it is not a real date. */
export function parseISODate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(clean(value));
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null;
  }
  return date;
}

export function toISODate(date) {
  return date instanceof Date && !Number.isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : "";
}

export function addDays(date, days) {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

/** Add whole months, clamping to the last valid day of the target month. */
export function addMonths(date, months) {
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
  const daysInTarget = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  return new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), Math.min(date.getUTCDate(), daysInTarget)),
  );
}

export function daysBetween(a, b) {
  return Math.round((b.getTime() - a.getTime()) / MS_PER_DAY);
}

/** "12 August 2026". */
export function formatLongDate(value) {
  const date = value instanceof Date ? value : parseISODate(value);
  if (!date || Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

const INR_WHOLE = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR_PAISE = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Whole rupees stay clean; anything with paise keeps both decimal places. */
export function formatINR(amount) {
  if (!isNumber(amount)) return "—";
  return Number.isInteger(amount) ? INR_WHOLE.format(amount) : INR_PAISE.format(amount);
}

/**
 * Build a telecom billing complaint letter and its escalation timeline.
 *
 * @param {object} input
 * @param {string} input.complainantName  Your full name.
 * @param {string} input.address          Your postal address.
 * @param {string} input.mobileNumber     The number or account the complaint is about.
 * @param {string} input.accountNumber    Relationship / customer account number (optional).
 * @param {string} input.operatorName     Telecom operator.
 * @param {string} input.planName         Tariff plan (optional).
 * @param {string} input.complaintType    One of the COMPLAINT_TYPES ids.
 * @param {string} input.billNumber       Invoice number (optional).
 * @param {string} input.billPeriod       Billing period, free text (optional).
 * @param {number} input.disputedAmount   Amount in rupees under dispute.
 * @param {string} input.details          Your own description of what happened.
 * @param {string} input.reportedDate     Date the complaint was first raised, "YYYY-MM-DD".
 * @param {string} input.docketNumber     Docket / complaint reference (optional).
 * @param {string} input.stage            One of the ESCALATION_STAGES ids.
 * @param {string} input.relief           One of the RELIEF_OPTIONS ids.
 * @param {string} input.letterDate       Date of this letter, "YYYY-MM-DD".
 * @returns {object} letter, or { error } for invalid input.
 */
export function buildTelecomComplaint(input) {
  const {
    complainantName,
    address,
    mobileNumber,
    accountNumber,
    operatorName,
    planName,
    complaintType,
    billNumber,
    billPeriod,
    disputedAmount,
    details,
    reportedDate,
    docketNumber,
    stage,
    relief,
    letterDate,
  } = input || {};

  const name = clean(complainantName);
  if (!name) return { error: "Enter your full name — the letter has to be signed by someone." };

  const number = clean(mobileNumber);
  if (!number) return { error: "Enter the mobile, landline or broadband account number in dispute." };

  const operator = clean(operatorName);
  if (!operator) return { error: "Enter the name of your telecom operator." };

  if (!isNumber(disputedAmount)) return { error: "Enter the disputed amount as a number." };
  if (disputedAmount < 0) return { error: "The disputed amount cannot be negative." };
  if (disputedAmount > 10000000) {
    return { error: "That disputed amount looks wrong — enter the figure in rupees." };
  }

  const reported = parseISODate(reportedDate);
  if (!reported) return { error: "Enter the date you first reported the problem as a real date." };

  const written = parseISODate(letterDate);
  if (!written) return { error: "Enter the date of this letter as a real calendar date." };

  if (written.getTime() < reported.getTime()) {
    return { error: "The letter cannot be dated before the day you first reported the problem." };
  }

  const type = COMPLAINT_TYPES.find((entry) => entry.id === complaintType) || COMPLAINT_TYPES[0];
  const stageEntry = ESCALATION_STAGES.find((entry) => entry.id === stage) || ESCALATION_STAGES[0];
  const reliefEntry = RELIEF_OPTIONS.find((entry) => entry.id === relief) || RELIEF_OPTIONS[0];

  const resolutionDue = addDays(reported, BILLING_RESOLUTION_DAYS);
  const creditDue = addDays(resolutionDue, CREDIT_ADJUSTMENT_DAYS);
  const appealDeadline = addMonths(resolutionDue, APPEAL_WINDOW_MONTHS);
  const daysSinceReported = daysBetween(reported, written);
  const resolutionOverdue = written.getTime() > resolutionDue.getTime();
  const appealStillOpen = written.getTime() <= appealDeadline.getTime();

  const timeline = [
    {
      id: "reported",
      label: "Complaint first registered",
      date: toISODate(reported),
      note: docketNumber ? `Docket ${clean(docketNumber)}` : "Ask for the docket number if you were not given one",
    },
    {
      id: "resolution",
      label: "TRAI four-week resolution benchmark",
      date: toISODate(resolutionDue),
      note: resolutionOverdue ? "Passed — you can escalate now" : "Still running",
    },
    {
      id: "credit",
      label: "Credit or waiver must reach your account",
      date: toISODate(creditDue),
      note: "One week after the complaint is resolved",
    },
    {
      id: "appeal",
      label: "Last day to appeal to the Appellate Authority",
      date: toISODate(appealDeadline),
      note: appealStillOpen ? "Appeal window open" : "Appeal window closed — go to a consumer commission",
    },
  ];

  const warnings = [];
  if (!clean(docketNumber)) {
    warnings.push(
      "You have not entered a docket number. The Complaint Centre is required to give one for every complaint — ask for it, because the Appellate Authority will want it.",
    );
  }
  if (stageEntry.id === "appellate" && !resolutionOverdue) {
    warnings.push(
      `The four-week resolution period does not end until ${formatLongDate(resolutionDue)}. An appeal filed before then can be returned as premature.`,
    );
  }
  if (stageEntry.id !== "complaint-centre" && !appealStillOpen) {
    warnings.push(
      `The three-month appeal window closed on ${formatLongDate(appealDeadline)}. Your route now is the District Consumer Disputes Redressal Commission.`,
    );
  }
  if (disputedAmount === 0) {
    warnings.push(
      "The disputed amount is zero. If this is a service quality complaint rather than a billing one, say what the shortfall was in the description instead.",
    );
  }
  if (disputedAmount > DISTRICT_COMMISSION_LIMIT_INR) {
    warnings.push(
      `Claims above ${formatINR(DISTRICT_COMMISSION_LIMIT_INR)} fall outside the District Commission's limit under the Consumer Protection Act, 2019 and go to the State Commission.`,
    );
  }
  if (!clean(details)) {
    warnings.push(
      "Add a short factual description of what happened. A dated sequence of events is what decides these complaints.",
    );
  }

  const identityLines = [
    `Name: ${name}`,
    clean(address) ? `Address: ${clean(address)}` : null,
    `Number / account in dispute: ${number}`,
    clean(accountNumber) ? `Relationship / account number: ${clean(accountNumber)}` : null,
    clean(planName) ? `Tariff plan: ${clean(planName)}` : null,
    clean(billNumber) ? `Bill number: ${clean(billNumber)}` : null,
    clean(billPeriod) ? `Billing period: ${clean(billPeriod)}` : null,
    `Amount in dispute: ${formatINR(disputedAmount)}`,
    clean(docketNumber) ? `Docket number: ${clean(docketNumber)}` : null,
    `Complaint first registered on: ${formatLongDate(reported)}`,
  ].filter(Boolean);

  const bodyParagraphs = [
    stageEntry.opening,
    `I am a subscriber of ${operator} on ${number}. My complaint is that ${type.describe}.`,
    clean(details) || "Please see the attached bill and payment records for the full sequence of events.",
    `I first registered this complaint on ${formatLongDate(reported)}${
      clean(docketNumber) ? ` and was given docket number ${clean(docketNumber)}` : ""
    }. Under the TRAI Quality of Service benchmarks a billing complaint must be resolved within four weeks, which in my case expires on ${formatLongDate(resolutionDue)}. As of today, ${formatLongDate(written)}, ${
      resolutionOverdue
        ? `${daysSinceReported} days have passed and the matter is still unresolved`
        : `${daysSinceReported} days have passed`
    }.`,
    `I therefore ask you to ${reliefEntry.text} of ${formatINR(disputedAmount)} and to confirm the correction to me in writing.`,
    stageEntry.demandLine,
    "Please treat this letter as notice that I will pay only the undisputed portion of the bill until this is resolved, and that I reserve my right to escalate further.",
  ];

  const closingLines = [
    "Yours faithfully,",
    "",
    name,
    `Date: ${formatLongDate(written)}`,
    "Enclosures: copy of the disputed bill, payment proof, and complaint acknowledgement.",
  ];

  const letterText = [
    formatLongDate(written),
    "",
    `To: ${stageEntry.addressee}`,
    operator,
    "",
    `Subject: ${type.label} on ${number} — ${formatINR(disputedAmount)} in dispute${
      clean(docketNumber) ? ` (docket ${clean(docketNumber)})` : ""
    }`,
    "",
    "Sir / Madam,",
    "",
    ...bodyParagraphs.flatMap((paragraph) => [paragraph, ""]),
    "Complaint details:",
    ...identityLines,
    "",
    ...closingLines,
  ]
    .join("\n")
    .trim();

  const keyFacts = [
    ["Stage", stageEntry.label],
    ["Addressed to", stageEntry.addressee],
    ["Amount in dispute", formatINR(disputedAmount)],
    ["Days since first complaint", String(daysSinceReported)],
    ["Resolution due by", formatLongDate(resolutionDue)],
    ["Credit or waiver due by", formatLongDate(creditDue)],
    ["Appeal deadline", formatLongDate(appealDeadline)],
    ["Relief requested", reliefEntry.label],
  ];

  return {
    name,
    operator,
    number,
    type,
    stage: stageEntry,
    relief: reliefEntry,
    disputedAmount,
    reportedDateLabel: formatLongDate(reported),
    letterDateLabel: formatLongDate(written),
    daysSinceReported,
    resolutionDueLabel: formatLongDate(resolutionDue),
    creditDueLabel: formatLongDate(creditDue),
    appealDeadlineLabel: formatLongDate(appealDeadline),
    resolutionOverdue,
    appealStillOpen,
    timeline,
    identityLines,
    bodyParagraphs,
    letterText,
    wordCount: letterText.split(/\s+/).filter(Boolean).length,
    keyFacts,
    warnings,
  };
}
