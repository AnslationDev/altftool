/**
 * Illegal Entry Objection Letter — pure logic.
 *
 * Basis (India):
 *  - Model Tenancy Act, 2021: a landlord or property manager may enter the let
 *    premises only after serving the tenant a written notice at least
 *    twenty-four hours in advance, and the entry — for inspection, repairs or
 *    to show the premises to a prospective tenant — must take place between
 *    7 a.m. and 8 p.m.
 *  - The same Act bars a landlord from withholding essential supplies such as
 *    electricity, water and sanitary services to force a tenant out.
 *  - Every tenancy carries an implied covenant of quiet enjoyment: once
 *    possession is handed over, the tenant, not the owner, controls who enters.
 *    Entering without consent can also amount to criminal trespass.
 *
 * This module audits a log of entries against those three tests — written
 * notice, twenty-four hours, and the 7 a.m. to 8 p.m. window — and counts the
 * breaches. It never asserts an outcome; it reports which rule each entry
 * failed.
 */

/** Minimum advance written notice before the landlord may enter. */
export const MIN_NOTICE_HOURS = 24;

/** Permitted entry window, in local clock hours. */
export const ENTRY_WINDOW_START_HOUR = 7;
export const ENTRY_WINDOW_END_HOUR = 20;

/** Purposes for which entry is contemplated at all. */
export const ENTRY_PURPOSES = Object.freeze([
  { id: "inspection", label: "Routine inspection" },
  { id: "repairs", label: "Repairs or maintenance" },
  { id: "showing", label: "Showing the premises to a prospective tenant or buyer" },
  { id: "collection", label: "Collecting rent" },
  { id: "none", label: "No reason given" },
]);

/** How the objection escalates, by how many breaches are on record. */
export const ESCALATION_BANDS = Object.freeze([
  { minBreaches: 1, tone: "first-objection", label: "First written objection" },
  { minBreaches: 2, tone: "repeat", label: "Repeat breaches — formal objection" },
  { minBreaches: 4, tone: "escalate", label: "Persistent breaches — escalation warned" },
]);

const MS_PER_HOUR = 3600000;

/** Parse "YYYY-MM-DD" plus "HH:MM" into a UTC timestamp, or null. */
export function parseDateTime(dateValue, timeValue) {
  if (typeof dateValue !== "string") return null;
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue.trim());
  if (!dateMatch) return null;
  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);

  let hour = 0;
  let minute = 0;
  if (typeof timeValue === "string" && timeValue.trim()) {
    const timeMatch = /^(\d{1,2}):(\d{2})$/.exec(timeValue.trim());
    if (!timeMatch) return null;
    hour = Number(timeMatch[1]);
    minute = Number(timeMatch[2]);
    if (hour > 23 || minute > 59) return null;
  }

  const date = new Date(Date.UTC(year, month - 1, day, hour, minute));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

export function parseISODate(value) {
  return parseDateTime(value, "00:00");
}

export function formatLongDate(date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatClock(date) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(date);
}

/** Whole hours between two timestamps, rounded to one decimal. */
export function hoursBetween(from, to) {
  return Math.round(((to.getTime() - from.getTime()) / MS_PER_HOUR) * 10) / 10;
}

export function bandForBreaches(count) {
  let band = ESCALATION_BANDS[0];
  for (const candidate of ESCALATION_BANDS) {
    if (count >= candidate.minBreaches) band = candidate;
  }
  return band;
}

/**
 * Audit a log of entries against the notice, timing and consent rules.
 *
 * @param {object} input
 * @param {Array} input.entries  [{ entryDate, entryTime, noticeGiven, noticeDate,
 *                                  noticeTime, tenantPresent, consentGiven, purpose, note }]
 * @param {string} input.letterDate YYYY-MM-DD, the date of the objection letter
 */
export function auditEntries(input) {
  const { entries, letterDate } = input || {};

  const letter = parseISODate(letterDate);
  if (!letter) return { error: "Enter the letter date as a valid calendar date." };
  if (!Array.isArray(entries) || entries.length === 0) {
    return { error: "Log at least one entry to object to." };
  }

  const rows = [];
  for (const entry of entries) {
    const at = parseDateTime(entry?.entryDate, entry?.entryTime || "00:00");
    if (!at) {
      return { error: "Every logged entry needs a valid date and a time in HH:MM." };
    }
    if (at.getTime() > letter.getTime() + 86400000) {
      return { error: "An entry is logged after the date of this letter — check the dates." };
    }

    const noticeGiven = Boolean(entry?.noticeGiven);
    const noticeAt = noticeGiven ? parseDateTime(entry?.noticeDate, entry?.noticeTime || "00:00") : null;
    if (noticeGiven && !noticeAt) {
      return { error: "Where notice was given, enter a valid notice date and time." };
    }

    const noticeHours = noticeAt ? hoursBetween(noticeAt, at) : 0;
    const hour = at.getUTCHours() + at.getUTCMinutes() / 60;

    const breaches = [];
    if (!noticeGiven) {
      breaches.push("No written notice was served before the entry.");
    } else if (noticeHours < MIN_NOTICE_HOURS) {
      breaches.push(
        `Notice was served only ${noticeHours} hour(s) in advance, against the ${MIN_NOTICE_HOURS} hours required.`,
      );
    }
    if (hour < ENTRY_WINDOW_START_HOUR || hour >= ENTRY_WINDOW_END_HOUR) {
      breaches.push(
        `The entry was outside the permitted ${ENTRY_WINDOW_START_HOUR} a.m. to ${ENTRY_WINDOW_END_HOUR - 12} p.m. window.`,
      );
    }
    if (!entry?.tenantPresent && !entry?.consentGiven) {
      breaches.push("The premises were entered in my absence and without my consent.");
    }

    rows.push({
      entryDate: entry?.entryDate,
      entryTime: entry?.entryTime || "00:00",
      at,
      noticeGiven,
      noticeHours: noticeGiven ? noticeHours : null,
      purpose: entry?.purpose || "none",
      tenantPresent: Boolean(entry?.tenantPresent),
      consentGiven: Boolean(entry?.consentGiven),
      note: String(entry?.note ?? "").trim(),
      breaches,
      compliant: breaches.length === 0,
    });
  }

  rows.sort((a, b) => a.at.getTime() - b.at.getTime());

  const breachingRows = rows.filter((row) => !row.compliant);
  const noNoticeCount = rows.filter((row) => !row.noticeGiven).length;
  const shortNoticeCount = rows.filter(
    (row) => row.noticeGiven && row.noticeHours < MIN_NOTICE_HOURS,
  ).length;
  const outOfHoursCount = rows.filter((row) => {
    const hour = row.at.getUTCHours() + row.at.getUTCMinutes() / 60;
    return hour < ENTRY_WINDOW_START_HOUR || hour >= ENTRY_WINDOW_END_HOUR;
  }).length;
  const absentCount = rows.filter((row) => !row.tenantPresent && !row.consentGiven).length;

  return {
    rows,
    total: rows.length,
    breachCount: breachingRows.length,
    compliantCount: rows.length - breachingRows.length,
    noNoticeCount,
    shortNoticeCount,
    outOfHoursCount,
    absentCount,
    firstBreach: breachingRows.length ? breachingRows[0] : null,
    lastBreach: breachingRows.length ? breachingRows[breachingRows.length - 1] : null,
    band: bandForBreaches(breachingRows.length),
    letterDate,
  };
}

/** Assemble the objection letter from the audit. */
export function buildObjectionLetter(audit, details) {
  if (!audit || audit.error) return "";
  const {
    tenantName = "[Tenant name]",
    landlordName = "[Landlord name]",
    propertyAddress = "[Property address]",
    agreementDate = "",
    contact = "",
    preferredWindow = "",
  } = details || {};

  const agreement = parseISODate(agreementDate);
  const lines = [];

  lines.push(`Date: ${formatLongDate(parseISODate(audit.letterDate))}`);
  lines.push("");
  lines.push("To,");
  lines.push(landlordName);
  lines.push("");
  lines.push(`Subject: Objection to entry of ${propertyAddress} without the required notice`);
  lines.push("");
  lines.push(`Dear ${landlordName},`);
  lines.push("");
  lines.push(
    `I am the tenant in lawful possession of the premises at ${propertyAddress}${
      agreement ? `, under the tenancy agreement dated ${formatLongDate(agreement)}` : ""
    }. I am writing to object, in writing and on record, to the following entries into the premises.`,
  );
  lines.push("");

  audit.rows.forEach((row, index) => {
    const heading = `  ${index + 1}. ${formatLongDate(row.at)} at ${formatClock(row.at)}${
      row.note ? ` — ${row.note}` : ""
    }`;
    lines.push(heading);
    if (row.compliant) {
      lines.push("       Notice and timing were in order.");
    } else {
      row.breaches.forEach((breach) => lines.push(`       ${breach}`));
    }
  });

  lines.push("");
  lines.push(
    `Of the ${audit.total} entr${audit.total === 1 ? "y" : "ies"} listed, ${audit.breachCount} did not meet the conditions on which a landlord may enter a let premises.`,
  );
  lines.push("");
  lines.push(
    `The Model Tenancy Act, 2021 permits a landlord or property manager to enter let premises only after serving the tenant written notice at least ${MIN_NOTICE_HOURS} hours in advance, and only between ${ENTRY_WINDOW_START_HOUR} a.m. and ${ENTRY_WINDOW_END_HOUR - 12} p.m. Beyond that, a tenant in possession is entitled to quiet enjoyment of the premises, and entering without consent interferes with that right.`,
  );
  lines.push("");
  lines.push("I therefore request that, from the date of this letter:");
  lines.push(`  a) No entry is made without written notice at least ${MIN_NOTICE_HOURS} hours in advance stating the purpose and the expected duration;`);
  lines.push(`  b) All visits are scheduled between ${ENTRY_WINDOW_START_HOUR} a.m. and ${ENTRY_WINDOW_END_HOUR - 12} p.m. on a date I have confirmed;`);
  lines.push("  c) No entry is made in my absence, and no duplicate keys are used without my consent;");
  lines.push("  d) Any locks changed or fittings disturbed during an entry are restored at your cost.");
  if (preferredWindow.trim()) {
    lines.push("");
    lines.push(`I am happy to give access at a time that suits us both — ${preferredWindow.trim()}.`);
  }
  if (audit.band.tone === "escalate") {
    lines.push("");
    lines.push(
      "As this has now happened repeatedly despite my objections, I will place the matter before the Rent Authority and take such other steps as are open to me if it continues.",
    );
  } else if (audit.band.tone === "repeat") {
    lines.push("");
    lines.push(
      "This is not the first such entry, and I ask that it be treated as a formal objection on record.",
    );
  }
  lines.push("");
  lines.push("Kindly acknowledge this letter in writing.");
  if (contact.trim()) {
    lines.push("");
    lines.push(`Contact: ${contact.trim()}`);
  }
  lines.push("");
  lines.push("Yours sincerely,");
  lines.push(tenantName);
  lines.push("(Tenant)");

  return lines.join("\n");
}
