/**
 * IVF due date maths.
 *
 * An IVF pregnancy has a known conception date, so the due date does not need
 * Naegele's rule. A full-term pregnancy is 266 days from fertilisation, and the
 * embryo has already used part of that by the time it is transferred:
 *
 *   Egg retrieval / fertilisation  EDD = date + 266 days
 *   Day-3 (cleavage) transfer      EDD = date + 263 days
 *   Day-5 (blastocyst) transfer    EDD = date + 261 days
 *   Day-6 (blastocyst) transfer    EDD = date + 260 days
 *
 * The equivalent LMP date is the due date minus the 280 days Naegele's rule
 * counts from a last menstrual period, which is what gestational age is
 * measured from.
 *
 * All dates are handled as "YYYY-MM-DD" strings in UTC; nothing here reads the
 * system clock — pass an "as of" date in if you want a gestational age.
 */

export const MS_PER_DAY = 86400000;

/** Days from fertilisation to the due date. */
export const DAYS_FROM_FERTILISATION = 266;
/** Days from the last menstrual period to the due date (Naegele's rule). */
export const DAYS_FROM_LMP = 280;

export const TRANSFER_TYPES = [
  {
    id: "day5",
    label: "Day-5 blastocyst transfer",
    embryoAgeDays: 5,
    offsetDays: DAYS_FROM_FERTILISATION - 5,
  },
  {
    id: "day3",
    label: "Day-3 cleavage-stage transfer",
    embryoAgeDays: 3,
    offsetDays: DAYS_FROM_FERTILISATION - 3,
  },
  {
    id: "day6",
    label: "Day-6 blastocyst transfer",
    embryoAgeDays: 6,
    offsetDays: DAYS_FROM_FERTILISATION - 6,
  },
  {
    id: "retrieval",
    label: "Egg retrieval / fertilisation date",
    embryoAgeDays: 0,
    offsetDays: DAYS_FROM_FERTILISATION,
  },
];

/**
 * Pregnancy milestones, measured in completed weeks and days from the
 * equivalent LMP date. Term definitions follow the ACOG classification:
 * early term 37w0d-38w6d, full term 39w0d-40w6d, late term 41w0d-41w6d,
 * post-term from 42w0d.
 */
export const MILESTONES = [
  { id: "hcg", label: "Blood pregnancy test window", weeks: 4, days: 0 },
  { id: "first-scan", label: "First viability scan (typical)", weeks: 6, days: 0 },
  { id: "nt-start", label: "Nuchal translucency scan opens", weeks: 11, days: 0 },
  { id: "t1-end", label: "NT scan closes / end of the first trimester", weeks: 13, days: 6 },
  { id: "anomaly", label: "Anomaly scan (18-22 weeks)", weeks: 20, days: 0 },
  { id: "viability", label: "Threshold of viability", weeks: 24, days: 0 },
  { id: "t2-end", label: "End of the second trimester", weeks: 27, days: 6 },
  { id: "early-term", label: "Early term begins", weeks: 37, days: 0 },
  { id: "full-term", label: "Full term begins", weeks: 39, days: 0 },
  { id: "due", label: "Estimated due date", weeks: 40, days: 0 },
  { id: "post-term", label: "Post-term begins", weeks: 42, days: 0 },
];

const ISO_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parse "YYYY-MM-DD" into a UTC timestamp, or null when invalid. */
export function parseISODate(value) {
  if (typeof value !== "string") return null;
  const match = ISO_PATTERN.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1900 || year > 2100) return null;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const timestamp = Date.UTC(year, month - 1, day);
  const check = new Date(timestamp);
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    return null;
  }
  return timestamp;
}

/** Format a UTC timestamp back to "YYYY-MM-DD". */
export function toISODate(timestamp) {
  if (!Number.isFinite(timestamp)) return "";
  const date = new Date(timestamp);
  const yyyy = String(date.getUTCFullYear()).padStart(4, "0");
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** Add whole days to a UTC timestamp. */
export function addDays(timestamp, days) {
  if (!Number.isFinite(timestamp) || !Number.isFinite(days)) return NaN;
  return timestamp + Math.round(days) * MS_PER_DAY;
}

/** Whole days from one UTC timestamp to another. */
export function daysBetween(from, to) {
  if (!Number.isFinite(from) || !Number.isFinite(to)) return NaN;
  return Math.round((to - from) / MS_PER_DAY);
}

/** Format a day count as "12w 4d". */
export function formatWeeksDays(totalDays) {
  if (!Number.isFinite(totalDays)) return "—";
  const sign = totalDays < 0 ? "-" : "";
  const abs = Math.abs(Math.round(totalDays));
  return `${sign}${Math.floor(abs / 7)}w ${abs % 7}d`;
}

/** Look up a transfer type by id. */
export function transferTypeById(id) {
  return TRANSFER_TYPES.find((type) => type.id === id) || null;
}

/**
 * Compute the IVF due date and the surrounding timeline.
 *
 * @param {object} input
 * @param {string} input.transferDate "YYYY-MM-DD" transfer or retrieval date.
 * @param {string} input.transferType One of TRANSFER_TYPES ids.
 * @param {string} [input.asOfDate] Optional "YYYY-MM-DD" for the gestational age readout.
 * @returns {object} results or { error }
 */
export function computeIvfDueDate({ transferDate, transferType = "day5", asOfDate = null } = {}) {
  const type = transferTypeById(transferType);
  if (!type) return { error: "Choose a transfer type from the list." };

  const transfer = parseISODate(transferDate);
  if (transfer === null) return { error: "Enter a valid transfer date as YYYY-MM-DD." };

  const dueDate = addDays(transfer, type.offsetDays);
  const equivalentLmp = addDays(dueDate, -DAYS_FROM_LMP);
  const fertilisation = addDays(transfer, -type.embryoAgeDays);
  const gestationalAgeAtTransfer = DAYS_FROM_LMP - type.offsetDays;

  const milestones = MILESTONES.map((milestone) => ({
    id: milestone.id,
    label: milestone.label,
    weeks: milestone.weeks,
    days: milestone.days,
    date: addDays(equivalentLmp, milestone.weeks * 7 + milestone.days),
  }));

  let progress = null;
  if (typeof asOfDate === "string" && asOfDate.trim() !== "") {
    const asOf = parseISODate(asOfDate);
    if (asOf === null) return { error: "Enter a valid 'as of' date as YYYY-MM-DD." };
    const gestationDays = daysBetween(equivalentLmp, asOf);
    const daysToDue = daysBetween(asOf, dueDate);
    let stage = "Before the equivalent LMP date";
    if (gestationDays >= 294) stage = "Post-term (42 weeks or more)";
    else if (gestationDays >= 287) stage = "Late term (41 weeks)";
    else if (gestationDays >= 273) stage = "Full term (39-40 weeks)";
    else if (gestationDays >= 259) stage = "Early term (37-38 weeks)";
    else if (gestationDays >= 196) stage = "Third trimester";
    else if (gestationDays >= 98) stage = "Second trimester";
    else if (gestationDays >= 0) stage = "First trimester";

    progress = {
      asOf,
      gestationDays,
      daysToDue,
      stage,
      percent: Math.max(0, Math.min(100, (gestationDays / DAYS_FROM_LMP) * 100)),
    };
  }

  return {
    type,
    transfer,
    dueDate,
    equivalentLmp,
    fertilisation,
    gestationalAgeAtTransfer,
    milestones,
    progress,
  };
}
