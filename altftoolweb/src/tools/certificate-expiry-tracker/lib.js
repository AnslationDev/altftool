/**
 * TLS certificate expiry tracking.
 *
 * Industry rules encoded here:
 *
 *  - MAXIMUM LIFETIME. The CA/Browser Forum Baseline Requirements cap publicly trusted
 *    TLS certificates at 398 days for certificates issued on or after 1 September 2020
 *    (ballot SC31). Ballot SC-081, adopted in April 2025, schedules further reductions —
 *    down to 200 days in 2026, 100 days in 2027 and 47 days from March 2029.
 *  - RENEWAL LEAD TIME. Let's Encrypt issues 90-day certificates and recommends renewing
 *    with 30 days of validity left, which is why 30 days is the default lead time here.
 *  - EXPIRY IS A HARD OUTAGE. Browsers reject an expired certificate outright
 *    (NET::ERR_CERT_DATE_INVALID), so an expired entry is flagged as an incident,
 *    not a warning.
 *
 * All functions take the reference date as an argument — no Date.now() inside the maths.
 */

/** CA/B Forum Baseline Requirements ballot SC31: max lifetime since 2020-09-01. */
export const MAX_PUBLIC_TLS_LIFETIME_DAYS = 398;

/** Let's Encrypt guidance: renew a 90-day certificate with 30 days of validity left. */
export const DEFAULT_LEAD_DAYS = 30;

/** Within one week of expiry a renewal is an emergency, not a task. */
export const CRITICAL_DAYS = 7;

/** Ordered worst-first so sorting by severity is a simple index comparison. */
export const STATUSES = [
  { id: "expired", label: "Expired", tone: "danger" },
  { id: "critical", label: "Expires within 7 days", tone: "danger" },
  { id: "due", label: "Renewal window open", tone: "warning" },
  { id: "ok", label: "OK", tone: "success" },
];

const STATUS_RANK = new Map(STATUSES.map((status, index) => [status.id, index]));

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Parse an ISO yyyy-mm-dd string into a UTC-midnight Date, or null when invalid. */
export function parseIsoDate(value) {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

/** Format a UTC-midnight Date back to yyyy-mm-dd. */
export function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

/** Whole days from `from` to `to` (negative when `to` is in the past). */
export function daysBetween(from, to) {
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

/**
 * Evaluate one certificate against a reference date.
 *
 * @param {object} input
 * @param {string} input.name          Hostname or certificate name.
 * @param {string} input.expiryDate    notAfter date, yyyy-mm-dd.
 * @param {string} input.referenceDate Today's date, yyyy-mm-dd (passed in for purity).
 * @param {number} [input.leadDays]    How many days before expiry renewal should start.
 * @param {string} [input.owner]       Person or team responsible.
 * @returns {object} evaluation, or { error }.
 */
export function evaluateCertificate({
  name,
  expiryDate,
  referenceDate,
  leadDays = DEFAULT_LEAD_DAYS,
  owner = "",
}) {
  const trimmedName = String(name ?? "").trim();
  if (!trimmedName) return { error: "Give the certificate a name or hostname." };

  const expiry = parseIsoDate(expiryDate);
  if (!expiry) return { error: "Enter the expiry date in yyyy-mm-dd form." };

  const reference = parseIsoDate(referenceDate);
  if (!reference) return { error: "The reference date is not a valid yyyy-mm-dd date." };

  const lead = Number(leadDays);
  if (!Number.isFinite(lead) || lead < 0) {
    return { error: "Renewal lead time must be zero or more days." };
  }
  if (lead > MAX_PUBLIC_TLS_LIFETIME_DAYS) {
    return {
      error: `A lead time above ${MAX_PUBLIC_TLS_LIFETIME_DAYS} days exceeds the maximum lifetime of a public TLS certificate.`,
    };
  }

  const daysRemaining = daysBetween(reference, expiry);
  const renewalStart = new Date(expiry.getTime() - Math.round(lead) * MS_PER_DAY);
  const daysUntilRenewal = daysBetween(reference, renewalStart);

  let status;
  if (daysRemaining < 0) status = "expired";
  else if (daysRemaining <= CRITICAL_DAYS) status = "critical";
  else if (daysRemaining <= lead) status = "due";
  else status = "ok";

  return {
    name: trimmedName,
    owner: String(owner ?? "").trim(),
    expiryDate: toIsoDate(expiry),
    renewalDate: toIsoDate(renewalStart),
    daysRemaining,
    daysUntilRenewal,
    leadDays: Math.round(lead),
    status,
  };
}

/**
 * Evaluate and sort a list of certificates, worst first (then soonest expiry).
 * Rows that fail validation are returned separately as { invalid }.
 */
export function evaluateAll(certificates, referenceDate) {
  const rows = [];
  const invalid = [];
  for (const certificate of Array.isArray(certificates) ? certificates : []) {
    const evaluated = evaluateCertificate({ ...certificate, referenceDate });
    if (evaluated.error) invalid.push({ certificate, error: evaluated.error });
    else rows.push({ ...evaluated, id: certificate.id });
  }
  rows.sort((a, b) => {
    const rank = STATUS_RANK.get(a.status) - STATUS_RANK.get(b.status);
    return rank !== 0 ? rank : a.daysRemaining - b.daysRemaining;
  });
  return { rows, invalid };
}

/** Count certificates per status for the summary tiles. */
export function summarize(rows) {
  const counts = { expired: 0, critical: 0, due: 0, ok: 0 };
  for (const row of Array.isArray(rows) ? rows : []) {
    if (counts[row.status] !== undefined) counts[row.status] += 1;
  }
  const total = counts.expired + counts.critical + counts.due + counts.ok;
  return { ...counts, total, actionNeeded: counts.expired + counts.critical + counts.due };
}

/** Escape the characters RFC 5545 §3.3.11 requires escaping in ICS text values. */
function escapeIcsText(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * Build an RFC 5545 iCalendar file with one all-day renewal reminder per certificate.
 * Deterministic: UID and DTSTAMP derive from the row data and reference date.
 */
export function buildIcsCalendar(rows, referenceDate) {
  const reference = parseIsoDate(referenceDate);
  if (!reference) return { error: "The reference date is not a valid yyyy-mm-dd date." };
  const list = (Array.isArray(rows) ? rows : []).filter((row) => row && row.renewalDate);
  if (list.length === 0) return { error: "Add at least one certificate to build a calendar." };

  const stamp = `${toIsoDate(reference).replace(/-/g, "")}T000000Z`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ALTFTool//Certificate Expiry Tracker//EN",
    "CALSCALE:GREGORIAN",
  ];
  for (const row of list) {
    const day = row.renewalDate.replace(/-/g, "");
    const summary = `Renew TLS certificate: ${row.name}`;
    const description = [
      `Certificate ${row.name} expires on ${row.expiryDate}.`,
      row.owner ? `Owner: ${row.owner}.` : "",
      `Renewal lead time: ${row.leadDays} days.`,
    ]
      .filter(Boolean)
      .join(" ");
    lines.push(
      "BEGIN:VEVENT",
      `UID:${day}-${row.name.replace(/[^A-Za-z0-9.-]/g, "_")}@altftool.com`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${day}`,
      `SUMMARY:${escapeIcsText(summary)}`,
      `DESCRIPTION:${escapeIcsText(description)}`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return { ics: lines.join("\r\n") + "\r\n", events: list.length };
}
