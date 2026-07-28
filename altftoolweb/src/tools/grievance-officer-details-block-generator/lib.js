/**
 * Grievance officer disclosure block and the statutory response clocks.
 *
 * Frameworks used:
 *  - Consumer Protection (E-Commerce) Rules, 2020, Rule 4(5) and 4(6): every
 *    e-commerce entity shall appoint a nodal person of contact or an alternate
 *    senior designated functionary resident in India, and a Grievance Officer
 *    for consumer grievance redressal, and shall display that officer's NAME,
 *    CONTACT DETAILS and DESIGNATION on its platform. The entity must
 *    ACKNOWLEDGE a consumer complaint WITHIN 48 HOURS and REDRESS it WITHIN ONE
 *    MONTH of receipt.
 *  - Information Technology (Intermediary Guidelines and Digital Media Ethics
 *    Code) Rules, 2021, Rule 3(2)(a): an intermediary's Grievance Officer shall
 *    ACKNOWLEDGE a complaint WITHIN 24 HOURS and DISPOSE of it WITHIN 15 DAYS.
 *    Complaints in the categories described in Rule 3(2)(b), which cover
 *    non-consensual intimate imagery and impersonation, must be acted on WITHIN
 *    24 HOURS.
 *  - IT Rules, 2021, Rule 3A (inserted 2022): a complainant may appeal to a
 *    Grievance Appellate Committee within 30 DAYS of the Grievance Officer's
 *    decision, and the Committee is to deal with the appeal within 30 DAYS.
 *  - IT Rules, 2021, Rule 4(1)(c): a significant social media intermediary must
 *    appoint a Resident Grievance Officer who is a resident of India.
 *  - Digital Personal Data Protection Act, 2023, s.8(9) and s.13: a Data
 *    Fiduciary must publish the business contact information of a Data
 *    Protection Officer or other person able to answer questions about the
 *    processing, and must provide a readily available means of grievance
 *    redressal. Section 10(2)(a) requires a Significant Data Fiduciary to
 *    appoint a Data Protection Officer based in India.
 *
 * Every function here is pure — the receipt time is always an argument.
 */

/** Consumer Protection (E-Commerce) Rules, 2020, Rule 4(6) — acknowledgement window. */
export const ECOM_ACK_HOURS = 48;

/** Consumer Protection (E-Commerce) Rules, 2020, Rule 4(6) — redressal window. */
export const ECOM_REDRESS_MONTHS = 1;

/** IT Rules, 2021, Rule 3(2)(a) — acknowledgement window. */
export const IT_ACK_HOURS = 24;

/** IT Rules, 2021, Rule 3(2)(a) — disposal window. */
export const IT_DISPOSAL_DAYS = 15;

/** IT Rules, 2021, Rule 3(2)(b) — action window for the listed urgent categories. */
export const IT_URGENT_HOURS = 24;

/** IT Rules, 2021, Rule 3A — days to appeal to the Grievance Appellate Committee. */
export const GAC_APPEAL_DAYS = 30;

/** IT Rules, 2021, Rule 3A — days for the Committee to deal with the appeal. */
export const GAC_DISPOSAL_DAYS = 30;

/** National Consumer Helpline short code. */
export const NATIONAL_CONSUMER_HELPLINE = "1915";

export const FRAMEWORKS = [
  {
    key: "ecommerce",
    label: "Consumer Protection (E-Commerce) Rules, 2020",
    who: "Online sellers, marketplaces and any e-commerce entity",
    ackHours: ECOM_ACK_HOURS,
    resolve: { value: ECOM_REDRESS_MONTHS, unit: "months" },
    citation: "Rule 4(5) and 4(6)",
  },
  {
    key: "itRules",
    label: "IT (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021",
    who: "Intermediaries — hosting, messaging, social media and search services",
    ackHours: IT_ACK_HOURS,
    resolve: { value: IT_DISPOSAL_DAYS, unit: "days" },
    citation: "Rule 3(2)(a)",
  },
  {
    key: "itUrgent",
    label: "IT Rules, 2021 — urgent content categories",
    who: "Intermediaries, for the categories listed in Rule 3(2)(b)",
    ackHours: IT_URGENT_HOURS,
    resolve: { value: IT_URGENT_HOURS, unit: "hours" },
    citation: "Rule 3(2)(b)",
  },
  {
    key: "dpdp",
    label: "Digital Personal Data Protection Act, 2023",
    who: "Any Data Fiduciary processing personal data",
    ackHours: null,
    resolve: null,
    citation: "Sections 8(9), 10(2)(a) and 13",
  },
];

export const OFFICER_ROLES = [
  { key: "grievanceOfficer", label: "Grievance Officer" },
  { key: "residentGrievanceOfficer", label: "Resident Grievance Officer" },
  { key: "nodalOfficer", label: "Nodal Contact Person" },
  { key: "chiefComplianceOfficer", label: "Chief Compliance Officer" },
  { key: "dpo", label: "Data Protection Officer" },
];

const DT_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

const isLeapYear = (year) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

const daysInMonth = (year, month) =>
  [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];

/** Parse "YYYY-MM-DDTHH:mm" into its parts, or null if it is not a real moment. */
export function parseDateTime(text) {
  const match = DT_RE.exec(String(text || "").trim());
  if (!match) return null;
  const [, y, mo, d, h, mi] = match.map(Number);
  if (y < 1900 || y > 2200 || mo < 1 || mo > 12) return null;
  if (d < 1 || d > daysInMonth(y, mo)) return null;
  if (h < 0 || h > 23 || mi < 0 || mi > 59) return null;
  return { year: y, month: mo, day: d, hour: h, minute: mi };
}

const toMs = ({ year, month, day, hour, minute }) =>
  Date.UTC(year, month - 1, day, hour, minute, 0, 0);

const fromMs = (ms) => {
  const date = new Date(ms);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
  };
};

const format = ({ year, month, day, hour, minute }) =>
  `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

/** Add whole hours to a "YYYY-MM-DDTHH:mm" string. */
export function addHours(dateTime, count) {
  const parts = parseDateTime(dateTime);
  if (!parts || !Number.isFinite(count)) return null;
  return format(fromMs(toMs(parts) + Math.trunc(count) * 3600000));
}

/** Add whole days to a "YYYY-MM-DDTHH:mm" string. */
export function addDays(dateTime, count) {
  return addHours(dateTime, Number.isFinite(count) ? Math.trunc(count) * 24 : NaN);
}

/** Add calendar months, clamping to the last day of a short month. */
export function addMonths(dateTime, count) {
  const parts = parseDateTime(dateTime);
  if (!parts || !Number.isFinite(count)) return null;
  const total = parts.year * 12 + (parts.month - 1) + Math.trunc(count);
  const year = Math.floor(total / 12);
  const month = (total % 12) + 1;
  return format({
    year,
    month,
    day: Math.min(parts.day, daysInMonth(year, month)),
    hour: parts.hour,
    minute: parts.minute,
  });
}

/** "1 months" reads badly — singularise the unit when the value is exactly one. */
export function spanText(span) {
  if (!span) return "";
  const unit = span.value === 1 ? span.unit.replace(/s$/, "") : span.unit;
  return `${span.value} ${unit}`;
}

const advance = (dateTime, span) => {
  if (!span) return null;
  if (span.unit === "hours") return addHours(dateTime, span.value);
  if (span.unit === "days") return addDays(dateTime, span.value);
  if (span.unit === "months") return addMonths(dateTime, span.value);
  return null;
};

/**
 * Acknowledgement and redressal deadlines for each selected framework.
 * @param {{receivedAt: string, frameworks: string[]}} input
 */
export function computeDeadlines({ receivedAt, frameworks = [] } = {}) {
  if (!parseDateTime(receivedAt)) {
    return { error: "Enter a valid date and time on which the complaint was received." };
  }
  if (!Array.isArray(frameworks) || frameworks.length === 0) {
    return { error: "Select at least one framework that applies to your business." };
  }

  const rows = [];
  for (const key of frameworks) {
    const framework = FRAMEWORKS.find((item) => item.key === key);
    if (!framework) return { error: `Unknown framework "${key}".` };
    rows.push({
      key: framework.key,
      label: framework.label,
      citation: framework.citation,
      ackHours: framework.ackHours,
      acknowledgeBy: framework.ackHours ? addHours(receivedAt, framework.ackHours) : null,
      resolveBy: advance(receivedAt, framework.resolve),
      resolveLabel: framework.resolve
        ? spanText(framework.resolve)
        : "as prescribed under the Act and rules",
    });
  }

  const withAck = rows.filter((row) => row.acknowledgeBy);
  const withResolve = rows.filter((row) => row.resolveBy);
  const earliest = (list, field) =>
    list.length
      ? list.reduce((best, row) => (toMs(parseDateTime(row[field])) < toMs(parseDateTime(best[field])) ? row : best))
      : null;

  return {
    receivedAt,
    rows,
    tightestAcknowledgement: earliest(withAck, "acknowledgeBy"),
    tightestResolution: earliest(withResolve, "resolveBy"),
    appealWindowDays: GAC_APPEAL_DAYS,
    appealDisposalDays: GAC_DISPOSAL_DAYS,
  };
}

const REQUIRED = [
  ["companyName", "the legal name of the business"],
  ["officerName", "the officer's name"],
  ["officerDesignation", "the officer's designation"],
  ["officerEmail", "the officer's email address"],
  ["officerAddress", "a postal address for the officer"],
];

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * Build the published grievance officer block, in plain text and HTML.
 * @returns {object} { text, html, rows, missing, obligations } or { error }
 */
export function buildGrievanceBlock(input = {}) {
  const {
    companyName = "",
    websiteName = "",
    officerRole = "grievanceOfficer",
    officerName = "",
    officerDesignation = "",
    officerEmail = "",
    officerPhone = "",
    officerAddress = "",
    officeHours = "Monday to Friday, 10:00 to 18:00 IST",
    escalationEmail = "",
    frameworks = ["ecommerce"],
    lastUpdated = "",
  } = input;

  const role = OFFICER_ROLES.find((item) => item.key === officerRole);
  if (!role) return { error: "Choose the role this officer holds." };

  if (!Array.isArray(frameworks) || frameworks.length === 0) {
    return { error: "Select at least one framework that applies to your business." };
  }
  const selected = frameworks.map((key) => FRAMEWORKS.find((item) => item.key === key));
  if (selected.some((item) => !item)) return { error: "One of the selected frameworks is unknown." };

  const missing = REQUIRED.filter(([key]) => !String(input[key] || "").trim()).map(
    ([, label]) => label,
  );

  const rows = [
    ["Name", officerName],
    ["Designation", officerDesignation],
    ["Role", role.label],
    ["Email", officerEmail],
    ["Phone", officerPhone],
    ["Address", officerAddress],
    ["Office hours", officeHours],
    ["Escalation email", escalationEmail],
    ["Last updated", lastUpdated],
  ].filter(([, value]) => String(value || "").trim());

  const obligations = selected.map((framework) => {
    if (framework.key === "dpdp") {
      return `${framework.label} (${framework.citation}): we publish the business contact information of the person able to answer questions about the processing of your personal data, and provide a means of grievance redressal.`;
    }
    const ack = `acknowledge your complaint within ${framework.ackHours} hours`;
    const resolve =
      framework.resolve.unit === "hours"
        ? `act on it within ${spanText(framework.resolve)}`
        : `resolve it within ${spanText(framework.resolve)} of receipt`;
    return `${framework.label} (${framework.citation}): we will ${ack} and ${resolve}.`;
  });

  const usesItRules = frameworks.includes("itRules") || frameworks.includes("itUrgent");
  const usesEcommerce = frameworks.includes("ecommerce");

  const escalations = [
    usesItRules
      ? `If you are not satisfied with the decision, you may appeal to a Grievance Appellate Committee under Rule 3A of the IT Rules, 2021 within ${GAC_APPEAL_DAYS} days of receiving it.`
      : null,
    usesEcommerce
      ? `You may also contact the National Consumer Helpline on ${NATIONAL_CONSUMER_HELPLINE}, or file a complaint with the appropriate Consumer Commission through the e-Daakhil portal.`
      : null,
  ].filter(Boolean);

  const text = [
    `GRIEVANCE REDRESSAL — ${companyName || "[Legal name of the business]"}`,
    websiteName ? `Applicable to: ${websiteName}` : null,
    "",
    `In accordance with the frameworks below, ${companyName || "[Legal name of the business]"} has appointed the following ${role.label}:`,
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    "How to complain",
    "1. Write to the officer at the email address above with your order or account reference and a description of the issue.",
    "2. Attach any screenshots, invoices or correspondence that support the complaint.",
    "3. You will receive an acknowledgement with a unique complaint reference number.",
    "",
    "Our commitments",
    ...obligations.map((line, index) => `${index + 1}. ${line}`),
    escalations.length ? "" : null,
    ...escalations,
  ]
    .filter((item) => item !== null)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const html = [
    '<section class="grievance-redressal">',
    "  <h2>Grievance redressal</h2>",
    `  <p>${escapeHtml(companyName || "[Legal name of the business]")} has appointed the following ${escapeHtml(role.label)}.</p>`,
    "  <dl>",
    ...rows.flatMap(([label, value]) => [
      `    <dt>${escapeHtml(label)}</dt>`,
      `    <dd>${escapeHtml(value)}</dd>`,
    ]),
    "  </dl>",
    "  <ul>",
    ...obligations.map((line) => `    <li>${escapeHtml(line)}</li>`),
    ...escalations.map((line) => `    <li>${escapeHtml(line)}</li>`),
    "  </ul>",
    "</section>",
  ].join("\n");

  return {
    text,
    html,
    rows,
    obligations,
    escalations,
    missing,
    complete: missing.length === 0,
    role,
    fieldCount: rows.length,
  };
}
