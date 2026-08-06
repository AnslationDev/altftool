/**
 * Document expiry reminder board.
 *
 * For each document it produces a reminder ladder rather than a single date,
 * because most renewals need one nudge to start the paperwork and another to
 * chase it:
 *
 *   reminder date  = expiry date − stage days      (for each stage)
 *   window opens   = expiry date − earliest application days
 *   days left      = expiry date − today
 *
 * The renewal windows encoded below are the real ones:
 *
 *  - Indian passport: a re-issue application may be made up to one year before
 *    expiry, and is still accepted for up to three years after expiry under the
 *    normal fee. Many destinations separately apply a six-month validity rule
 *    on the date of entry, and the Schengen area requires validity of at least
 *    three months beyond the intended date of departure with the passport
 *    issued within the previous ten years.
 *
 *  - Indian driving licence: section 15 of the Motor Vehicles Act, 1988 allows
 *    an application for renewal from 30 days before expiry. A renewal applied
 *    for more than 30 days after expiry attracts a late fee, and where more
 *    than five years have passed since expiry the applicant has to pass the
 *    driving test again.
 *
 *  - Pollution Under Control certificate: valid for six months for most
 *    vehicles in normal use, and for one year from the date of registration for
 *    a new vehicle.
 *
 *  - Vehicle registration certificate: a new non-transport vehicle is
 *    registered for 15 years and renewed for 5 years at a time thereafter.
 *
 *  - Motor insurance: cover ends at expiry with no grace period, and the
 *    accumulated no-claim bonus is normally protected only if the policy is
 *    renewed within 90 days.
 *
 * Everything is computed in the browser. Nothing you type is uploaded.
 * Informational only, not legal advice — confirm renewal rules with the issuing
 * authority, whose fees and windows change.
 */

export const MS_PER_DAY = 86400000;

/** Default reminder ladder, in days before expiry. */
export const DEFAULT_STAGES = [90, 30, 7];

/** The common "six-month passport rule" many destinations apply on entry. */
export const PASSPORT_TRAVEL_VALIDITY_DAYS = 180;

/** Schengen requires validity three months beyond the intended departure. */
export const SCHENGEN_VALIDITY_DAYS = 90;

export const MAX_DOCUMENTS = 40;
export const MAX_HORIZON_DAYS = 10950; // 30 years
export const MAX_STAGE_DAYS = 730;

/**
 * Document types with the renewal window each authority actually allows.
 * earliestApplicationDays is how far before expiry a renewal may be filed;
 * 0 means there is no stated window and you can apply any time.
 */
export const DOCUMENT_TYPES = [
  {
    id: "passport",
    label: "Passport",
    stages: [365, 180, 90],
    earliestApplicationDays: 365,
    travelSensitive: true,
    rule: "A re-issue may be applied for up to a year before expiry, and is accepted up to three years after. Many countries additionally require six months of validity on the date of entry.",
  },
  {
    id: "visa",
    label: "Visa or residence permit",
    stages: [90, 30, 14],
    earliestApplicationDays: 90,
    travelSensitive: true,
    rule: "Renewal windows are set by the issuing country and are often narrow — check the exact window, because applying too early can be rejected as well as too late.",
  },
  {
    id: "drivingLicence",
    label: "Driving licence",
    stages: [60, 30, 7],
    earliestApplicationDays: 30,
    travelSensitive: false,
    rule: "Section 15 of the Motor Vehicles Act allows renewal from 30 days before expiry. Late by more than 30 days costs a fee; late by more than five years means taking the driving test again.",
  },
  {
    id: "puc",
    label: "Pollution Under Control certificate",
    stages: [30, 14, 3],
    earliestApplicationDays: 0,
    travelSensitive: false,
    rule: "Valid for six months for a vehicle in normal use, and for one year from registration for a new vehicle. Driving without a valid certificate is a fineable offence.",
  },
  {
    id: "vehicleInsurance",
    label: "Motor insurance",
    stages: [45, 15, 3],
    earliestApplicationDays: 45,
    travelSensitive: false,
    rule: "No grace period — cover ends at expiry. Renew within 90 days to keep the accumulated no-claim bonus.",
  },
  {
    id: "vehicleRc",
    label: "Vehicle registration certificate",
    stages: [90, 30, 7],
    earliestApplicationDays: 60,
    travelSensitive: false,
    rule: "A new non-transport vehicle is registered for 15 years, then renewed for 5 years at a time.",
  },
  {
    id: "fitness",
    label: "Vehicle fitness certificate",
    stages: [60, 30, 7],
    earliestApplicationDays: 60,
    travelSensitive: false,
    rule: "Commercial vehicles need a fitness certificate renewed on the schedule the transport department sets for the vehicle class.",
  },
  {
    id: "healthCard",
    label: "Health or insurance card",
    stages: [60, 30, 7],
    earliestApplicationDays: 30,
    travelSensitive: false,
    rule: "Renew before expiry to keep waiting periods and continuity benefits intact.",
  },
  {
    id: "certification",
    label: "Professional certification",
    stages: [180, 90, 30],
    earliestApplicationDays: 180,
    travelSensitive: false,
    rule: "Most certifications need continuing-education credits accumulated during the cycle, so the reminder that matters is the one a long way out.",
  },
  {
    id: "firstAid",
    label: "First aid or CPR certificate",
    stages: [90, 30, 7],
    earliestApplicationDays: 90,
    travelSensitive: false,
    rule: "Typically valid for two years; a refresher course is cheaper and shorter than the full course, but only before expiry.",
  },
  {
    id: "membership",
    label: "Membership or subscription",
    stages: [30, 14, 3],
    earliestApplicationDays: 0,
    travelSensitive: false,
    rule: "Watch the auto-renewal date as well as the expiry date — cancelling after the charge is harder than before it.",
  },
  {
    id: "warranty",
    label: "Warranty or AMC",
    stages: [60, 30, 7],
    earliestApplicationDays: 60,
    travelSensitive: false,
    rule: "An extended warranty usually has to be bought before the original one expires, not after.",
  },
  {
    id: "other",
    label: "Other document",
    stages: DEFAULT_STAGES,
    earliestApplicationDays: 0,
    travelSensitive: false,
    rule: "Set the reminder ladder from whatever the issuing authority requires.",
  },
];

export const STATUS_LABELS = {
  expired: "Expired",
  urgent: "Urgent",
  windowOpen: "Renewal window open",
  watch: "Watch",
  fine: "Fine for now",
};

/** Parse YYYY-MM-DD to a UTC midnight timestamp, or NaN. */
export function parseIsoDate(value) {
  if (typeof value !== "string") return NaN;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return NaN;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const ms = Date.UTC(year, month - 1, day);
  const check = new Date(ms);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return NaN;
  }
  return ms;
}

/** Format a UTC timestamp as YYYY-MM-DD. */
export function toIsoDate(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

/**
 * Reminder ladder for one expiry date.
 *
 * @param {number} expiryMs expiry as a UTC timestamp
 * @param {number[]} stages days before expiry, any order
 * @param {number} todayMs  reference date
 * @returns {{stages: object[], next: object|null}|{error: string}}
 */
export function buildReminderLadder(expiryMs, stages, todayMs) {
  if (!Array.isArray(stages) || stages.length === 0) {
    return { error: "Give at least one reminder stage." };
  }
  const cleaned = [];
  for (const stage of stages) {
    const days = Number(stage);
    if (!Number.isInteger(days) || days < 0 || days > MAX_STAGE_DAYS) {
      return { error: `Reminder stages must be whole numbers of days between 0 and ${MAX_STAGE_DAYS}.` };
    }
    if (!cleaned.includes(days)) cleaned.push(days);
  }
  cleaned.sort((a, b) => b - a);

  const rows = cleaned.map((days) => {
    const dateMs = expiryMs - days * MS_PER_DAY;
    return {
      days,
      date: toIsoDate(dateMs),
      daysAway: Math.round((dateMs - todayMs) / MS_PER_DAY),
      passed: dateMs < todayMs,
    };
  });

  const next = rows.find((row) => !row.passed) ?? null;
  return { stages: rows, next };
}

/**
 * Score one document.
 *
 * @param {object} document { id, name, typeId, reference, expiryDate, stages }
 * @param {number} todayMs
 * @param {number|null} travelMs optional planned travel date
 */
export function scoreDocument(document, todayMs, travelMs) {
  const name = String(document.name ?? "").trim();
  if (!name) return { error: "Every document needs a name." };

  const type = DOCUMENT_TYPES.find((item) => item.id === document.typeId) ?? DOCUMENT_TYPES.at(-1);

  const expiryMs = parseIsoDate(document.expiryDate);
  if (Number.isNaN(expiryMs)) {
    return { error: `"${name}": enter the expiry date as a real calendar date.` };
  }

  const daysLeft = Math.round((expiryMs - todayMs) / MS_PER_DAY);
  if (Math.abs(daysLeft) > MAX_HORIZON_DAYS) {
    return { error: `"${name}": that expiry date is more than 30 years away — check the year.` };
  }

  const ladder = buildReminderLadder(
    expiryMs,
    Array.isArray(document.stages) && document.stages.length > 0 ? document.stages : type.stages,
    todayMs,
  );
  if (ladder.error) return { error: `"${name}": ${ladder.error}` };

  const windowOpensMs =
    type.earliestApplicationDays > 0
      ? expiryMs - type.earliestApplicationDays * MS_PER_DAY
      : null;
  const windowOpen = windowOpensMs === null ? true : todayMs >= windowOpensMs;

  const smallestStage = Math.min(...ladder.stages.map((row) => row.days));
  let status = "fine";
  if (daysLeft < 0) status = "expired";
  else if (daysLeft <= smallestStage) status = "urgent";
  else if (windowOpen && windowOpensMs !== null) status = "windowOpen";
  else if (ladder.stages.some((row) => row.passed)) status = "watch";

  // Travel validity check, only for documents where it means something.
  let travelWarning = "";
  if (type.travelSensitive && travelMs !== null && !Number.isNaN(travelMs)) {
    const requiredMs = travelMs + PASSPORT_TRAVEL_VALIDITY_DAYS * MS_PER_DAY;
    const schengenMs = travelMs + SCHENGEN_VALIDITY_DAYS * MS_PER_DAY;
    if (expiryMs < schengenMs) {
      travelWarning = `Expires less than 3 months after your travel date — that already fails the Schengen rule, and most destinations want more.`;
    } else if (expiryMs < requiredMs) {
      travelWarning = `Expires less than 6 months after your travel date — many destinations refuse entry on that. Renew before you fly.`;
    }
  }

  return {
    id: document.id,
    name,
    typeId: type.id,
    typeLabel: type.label,
    rule: type.rule,
    reference: String(document.reference ?? "").trim(),
    expiryDate: toIsoDate(expiryMs),
    daysLeft,
    status,
    ladder: ladder.stages,
    nextReminder: ladder.next,
    windowOpensDate: windowOpensMs === null ? "" : toIsoDate(windowOpensMs),
    windowOpen,
    travelWarning,
  };
}

/**
 * Build the whole board.
 *
 * @param {object} input
 * @param {object[]} input.documents
 * @param {string} input.today       reference date, YYYY-MM-DD
 * @param {string} input.travelDate  optional planned travel date, YYYY-MM-DD
 * @returns {object} rows, counts and the next action — or { error }
 */
export function buildExpiryBoard({ documents = [], today, travelDate = "" } = {}) {
  const todayMs = parseIsoDate(today);
  if (Number.isNaN(todayMs)) return { error: "Enter today's date as a real calendar date." };

  const trimmedTravel = String(travelDate).trim();
  const travelMs = trimmedTravel ? parseIsoDate(trimmedTravel) : null;
  if (trimmedTravel && Number.isNaN(travelMs)) {
    return { error: "Enter the travel date as a real calendar date, or leave it blank." };
  }

  if (!Array.isArray(documents) || documents.length === 0) {
    return { error: "Add at least one document to the board." };
  }
  if (documents.length > MAX_DOCUMENTS) {
    return { error: `This board holds up to ${MAX_DOCUMENTS} documents.` };
  }

  // Score every document independently. One row with transient/invalid
  // input (a date field mid-edit, a blank name, an out-of-range reminder
  // stage) must not blank the results for the other, perfectly valid,
  // documents on the board -- so invalid documents are set aside in
  // `rowErrors` instead of aborting the whole build.
  const rows = [];
  const rowErrors = [];
  for (const document of documents) {
    const scored = scoreDocument(document, todayMs, travelMs);
    if (scored.error) {
      rowErrors.push({ id: document.id, error: scored.error });
      continue;
    }
    rows.push(scored);
  }

  rows.sort((a, b) => a.daysLeft - b.daysLeft);

  const upcomingReminders = rows
    .filter((row) => row.nextReminder)
    .map((row) => ({
      name: row.name,
      date: row.nextReminder.date,
      daysAway: row.nextReminder.daysAway,
      stage: row.nextReminder.days,
    }))
    .sort((a, b) => a.daysAway - b.daysAway);

  const counts = Object.keys(STATUS_LABELS).reduce((acc, key) => {
    acc[key] = rows.filter((row) => row.status === key).length;
    return acc;
  }, {});

  return {
    rows,
    rowErrors,
    counts,
    total: rows.length,
    expiredCount: counts.expired,
    urgentCount: counts.urgent,
    within90: rows.filter((row) => row.daysLeft >= 0 && row.daysLeft <= 90).length,
    nextExpiry: rows.find((row) => row.daysLeft >= 0) ?? null,
    nextReminder: upcomingReminders[0] ?? null,
    upcomingReminders,
    travelWarnings: rows.filter((row) => row.travelWarning),
    today: toIsoDate(todayMs),
    travelDate: travelMs === null ? "" : toIsoDate(travelMs),
  };
}
