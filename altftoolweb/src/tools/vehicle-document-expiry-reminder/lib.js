/**
 * Vehicle document expiry tracking.
 *
 * All date maths is done in UTC from "YYYY-MM-DD" strings so the result never
 * shifts with the viewer's timezone, and the reference date is always passed in
 * (nothing here reads the clock).
 */

const MS_PER_DAY = 86400000;

/**
 * Document types a private or commercial vehicle owner has to keep current,
 * with the statutory validity rule and the headline penalty for driving without one.
 * Penalties are the central amounts in the Motor Vehicles (Amendment) Act, 2019;
 * states may notify different figures.
 */
export const DOCUMENT_TYPES = [
  {
    id: "insurance",
    label: "Motor insurance",
    validity:
      "Own-damage cover is normally 1 year. Third-party cover for a new private car is issued for 3 years and for a new two-wheeler for 5 years.",
    rule: "Motor Vehicles Act, 1988, s.146 — third-party insurance is compulsory.",
    penalty: "₹2,000 for a first offence and ₹4,000 for a repeat offence (s.196).",
    leadDays: 30,
  },
  {
    id: "puc",
    label: "PUC certificate",
    validity:
      "1 year from first registration for a new vehicle, then 6 months at a time.",
    rule: "Central Motor Vehicles Rules, 1989, Rule 115(7).",
    penalty: "Up to ₹10,000 (s.190(2)).",
    leadDays: 15,
  },
  {
    id: "rc",
    label: "Registration certificate (RC)",
    validity:
      "15 years from the date of issue for a non-transport vehicle, then renewable 5 years at a time.",
    rule: "Motor Vehicles Act, 1988, s.41(10) and s.41(7).",
    penalty: "Up to ₹5,000 for driving an unregistered vehicle (s.192).",
    leadDays: 60,
  },
  {
    id: "fitness",
    label: "Fitness certificate",
    validity:
      "2 years for a new transport vehicle, then renewed 1 year at a time. Transport vehicles only.",
    rule: "Central Motor Vehicles Rules, 1989, Rule 62.",
    penalty: "The vehicle can be detained and prosecuted under s.192.",
    leadDays: 30,
  },
  {
    id: "permit",
    label: "Permit",
    validity:
      "A regular permit runs for 5 years; a national permit for goods carriage is renewed every year.",
    rule: "Motor Vehicles Act, 1988, s.81.",
    penalty: "Up to ₹10,000 for operating without a valid permit (s.192A).",
    leadDays: 30,
  },
  {
    id: "dl",
    label: "Driving licence",
    validity:
      "Non-transport: valid to age 40 if issued before 30, 10 years if issued between 30 and 49, to age 55 if issued between 50 and 54, and 5 years if issued at 55 or older. Transport licence: 3 years.",
    rule: "Motor Vehicles Act, 1988, s.14(2) as amended in 2019.",
    penalty: "₹5,000 for driving without a valid licence (s.181).",
    leadDays: 30,
  },
  {
    id: "roadtax",
    label: "Road tax / token",
    validity:
      "Lifetime tax is normally collected for 15 years on private vehicles; commercial vehicles pay quarterly or yearly.",
    rule: "State motor vehicles taxation acts.",
    penalty: "State-specific penalty plus interest on arrears.",
    leadDays: 30,
  },
];

/** Status bands, widest first. daysLeft is negative once the document has lapsed. */
export const STATUS_BANDS = [
  { id: "expired", label: "Expired", max: -1 },
  { id: "critical", label: "Expires this week", max: 7 },
  { id: "due", label: "Renew now", max: 30 },
  { id: "soon", label: "Coming up", max: 60 },
  { id: "ok", label: "In date", max: Infinity },
];

const typeById = new Map(DOCUMENT_TYPES.map((type) => [type.id, type]));

/** Parse "YYYY-MM-DD" into a UTC timestamp. Returns NaN for anything malformed. */
export function parseDate(value) {
  if (typeof value !== "string") return NaN;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return NaN;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return NaN;
  const stamp = Date.UTC(year, month - 1, day);
  const check = new Date(stamp);
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1) return NaN;
  if (check.getUTCDate() !== day) return NaN;
  return stamp;
}

/** Format a UTC timestamp back to "YYYY-MM-DD". */
export function toIsoDate(stamp) {
  if (!Number.isFinite(stamp)) return "";
  return new Date(stamp).toISOString().slice(0, 10);
}

/** Whole days from `from` to `to`, both "YYYY-MM-DD". */
export function daysBetween(from, to) {
  const a = parseDate(from);
  const b = parseDate(to);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return NaN;
  return Math.round((b - a) / MS_PER_DAY);
}

/** Add whole months to an ISO date, clamping to the last day of the target month. */
export function addMonths(isoDate, months) {
  const stamp = parseDate(isoDate);
  if (!Number.isFinite(stamp) || !Number.isFinite(months)) return "";
  const base = new Date(stamp);
  const year = base.getUTCFullYear();
  const month = base.getUTCMonth() + Math.trunc(months);
  const day = base.getUTCDate();
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return toIsoDate(Date.UTC(year, month, Math.min(day, lastDay)));
}

function bandFor(daysLeft) {
  for (const band of STATUS_BANDS) {
    if (daysLeft <= band.max) return band;
  }
  return STATUS_BANDS[STATUS_BANDS.length - 1];
}

/**
 * Score one document against a reference date.
 *
 * @param {object} doc  { id, typeId, label, vehicle, expiry }
 * @param {string} today  "YYYY-MM-DD"
 * @param {number} [leadDaysOverride]  days of warning you want
 */
export function evaluateDocument(doc, today, leadDaysOverride) {
  if (!doc || typeof doc !== "object") return { error: "A document entry is missing." };
  const type = typeById.get(doc.typeId);
  if (!type) return { error: "Pick a document type from the list." };
  if (!Number.isFinite(parseDate(today))) {
    return { error: "Reference date must be a real calendar date." };
  }
  if (!Number.isFinite(parseDate(doc.expiry))) {
    return { error: `Enter a valid expiry date for ${doc.label || type.label}.` };
  }

  const daysLeft = daysBetween(today, doc.expiry);
  const leadDays =
    Number.isFinite(leadDaysOverride) && leadDaysOverride >= 0
      ? Math.trunc(leadDaysOverride)
      : type.leadDays;
  const band = bandFor(daysLeft);
  const reminderOn = addMonths(doc.expiry, 0);
  const reminderStamp = parseDate(reminderOn) - leadDays * MS_PER_DAY;

  return {
    id: doc.id,
    typeId: type.id,
    typeLabel: type.label,
    label: doc.label || type.label,
    vehicle: doc.vehicle || "",
    expiry: doc.expiry,
    daysLeft,
    status: band.id,
    statusLabel: band.label,
    leadDays,
    remindOn: toIsoDate(reminderStamp),
    remindInDays: daysLeft - leadDays,
    validity: type.validity,
    rule: type.rule,
    penalty: type.penalty,
  };
}

/**
 * Evaluate a whole list and summarise it.
 *
 * @param {Array} documents
 * @param {string} today "YYYY-MM-DD"
 * @param {number} [leadDaysOverride]
 */
export function evaluateDocuments(documents, today, leadDaysOverride) {
  if (!Array.isArray(documents)) return { error: "Document list is missing." };
  if (!Number.isFinite(parseDate(today))) {
    return { error: "Reference date must be a real calendar date." };
  }
  if (documents.length === 0) {
    return { error: "Add at least one document to track." };
  }

  const items = [];
  for (const doc of documents) {
    const scored = evaluateDocument(doc, today, leadDaysOverride);
    if (scored.error) return { error: scored.error };
    items.push(scored);
  }

  items.sort((a, b) => a.daysLeft - b.daysLeft || a.label.localeCompare(b.label));

  const counts = { expired: 0, critical: 0, due: 0, soon: 0, ok: 0 };
  for (const item of items) counts[item.status] += 1;

  const actionable = items.filter((item) => item.daysLeft <= item.leadDays);
  const next = items.find((item) => item.daysLeft >= 0) || null;

  return {
    items,
    counts,
    total: items.length,
    actionable: actionable.length,
    nextExpiry: next,
    worst: items[0],
  };
}
