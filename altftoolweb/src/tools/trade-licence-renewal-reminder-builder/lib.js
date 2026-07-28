/**
 * Trade licence renewal reminder board.
 *
 * For each licence the board computes:
 *
 *   expiry date   = issue date + validity months − 1 day   (when not entered directly)
 *   reminder date = expiry date − renewal lead days
 *   days to expiry = expiry date − today
 *
 * The lead times below are the ones the governing rule actually states, not
 * round numbers:
 *
 *  - FSSAI licence or registration: Regulation 2.1.7 of the Food Safety and
 *    Standards (Licensing and Registration of Food Businesses) Regulations,
 *    2011 requires the renewal application to be made before the licence
 *    expires; a late application attracts a fee of Rs 100 per day of delay, and
 *    once the licence has lapsed a fresh application is needed. Applying 30 days
 *    ahead is the safe practice, so that is the default lead time here.
 *
 *  - Importer Exporter Code: since DGFT Notification 58/2015-20 dated
 *    12 February 2021 an IEC does not expire, but it must be updated
 *    electronically every year between April and June even if nothing has
 *    changed, or it is deactivated.
 *
 *  - Factory licence under the Factories Act, 1948: renewed annually or for the
 *    period the state rules allow, with the application filed before the
 *    current period ends — most state rules set a two-month lead.
 *
 *  - Municipal trade licence: granted for a financial year in most municipal
 *    corporations and renewed by 31 March, with a penalty for late renewal.
 *
 *  - Consent to Operate from the State Pollution Control Board: validity is set
 *    by the board according to the category of the unit, and the renewal
 *    application is normally required at least 120 days before expiry.
 *
 * State and municipal rules differ. Treat the defaults as a starting point and
 * replace them with the dates printed on your own certificate. This is
 * informational, not legal advice.
 */

export const MS_PER_DAY = 86400000;

/** Anything expiring within this many days is flagged as critical. */
export const CRITICAL_DAYS = 15;

/** Board can look this far ahead, so a typo in the year is caught. */
export const MAX_HORIZON_DAYS = 7300; // 20 years

/**
 * Common Indian business licences, with the validity and lead time that the
 * relevant rule or the usual practice sets. leadDays is the number of days
 * before expiry that the renewal has to be started.
 */
export const LICENCE_TYPES = [
  {
    id: "municipalTrade",
    label: "Municipal trade licence",
    authority: "Municipal corporation",
    validityMonths: 12,
    leadDays: 45,
    note: "Usually granted for a financial year and renewed by 31 March, with a penalty for late renewal.",
  },
  {
    id: "shopsEstablishment",
    label: "Shops and Establishment registration",
    authority: "State labour department",
    validityMonths: 60,
    leadDays: 45,
    note: "Validity is one to five years depending on the state; some states now issue a lifetime registration.",
  },
  {
    id: "fssai",
    label: "FSSAI licence or registration",
    authority: "FSSAI / State food authority",
    validityMonths: 12,
    leadDays: 30,
    note: "Apply before expiry. Late renewal costs Rs 100 per day, and once lapsed you must apply afresh.",
  },
  {
    id: "factory",
    label: "Factory licence (Factories Act, 1948)",
    authority: "Directorate of Factories",
    validityMonths: 12,
    leadDays: 60,
    note: "Renewed for the period the state rules allow, with the application filed before the current period ends.",
  },
  {
    id: "fireNoc",
    label: "Fire safety NOC",
    authority: "State fire services",
    validityMonths: 12,
    leadDays: 60,
    note: "Validity and inspection requirements are state-specific; a fresh inspection usually precedes renewal.",
  },
  {
    id: "pollution",
    label: "Consent to Operate (pollution board)",
    authority: "State Pollution Control Board",
    validityMonths: 60,
    leadDays: 120,
    note: "Validity depends on the red / orange / green / white category. Apply at least 120 days before expiry.",
  },
  {
    id: "drug",
    label: "Drug licence (Form 20 / 21)",
    authority: "State drugs control department",
    validityMonths: 60,
    leadDays: 90,
    note: "Five-year validity with a retention fee; a lapsed licence attracts a late fee that grows with the delay.",
  },
  {
    id: "iec",
    label: "Importer Exporter Code (IEC)",
    authority: "DGFT",
    validityMonths: 12,
    leadDays: 60,
    note: "Does not expire, but must be updated online every year between April and June or it is deactivated.",
  },
  {
    id: "professionalTax",
    label: "Professional tax enrolment certificate",
    authority: "State commercial tax department",
    validityMonths: 12,
    leadDays: 30,
    note: "Annual payment rather than a renewal in most states; the certificate itself is usually permanent.",
  },
  {
    id: "signage",
    label: "Signage / advertisement permission",
    authority: "Municipal corporation",
    validityMonths: 12,
    leadDays: 30,
    note: "Annual permission per hoarding or board; the fee depends on area and location.",
  },
  {
    id: "liftLicence",
    label: "Lift or escalator licence",
    authority: "State electrical inspectorate",
    validityMonths: 12,
    leadDays: 45,
    note: "Annual renewal after an inspection under the state Lifts and Escalators Act.",
  },
  {
    id: "other",
    label: "Other licence or registration",
    authority: "",
    validityMonths: 12,
    leadDays: 45,
    note: "Set the validity and lead time from your own certificate.",
  },
];

export const STATUS_ORDER = ["expired", "critical", "renewNow", "scheduled"];

export const STATUS_LABELS = {
  expired: "Expired",
  critical: "Critical",
  renewNow: "Start renewal",
  scheduled: "Scheduled",
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

/** Add whole months, clamping to the last day of the target month. */
export function addMonthsClamped(ms, months) {
  const date = new Date(ms);
  const day = date.getUTCDate();
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
  const daysInTarget = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  return Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), Math.min(day, daysInTarget));
}

/**
 * Expiry implied by an issue date and a validity in months.
 * A 12-month licence issued on 1 April expires on 31 March.
 */
export function deriveExpiry(issueMs, validityMonths) {
  return addMonthsClamped(issueMs, validityMonths) - MS_PER_DAY;
}

/**
 * Score one licence row against a reference date.
 *
 * @param {object} licence  { id, name, typeId, number, issueDate, expiryDate,
 *                            validityMonths, leadDays, authority }
 * @param {number} todayMs  reference date as a UTC timestamp
 * @returns {object} the row with dates, status and days remaining, or { error }
 */
export function scoreLicence(licence, todayMs) {
  const name = String(licence.name ?? "").trim();
  if (!name) return { error: "Every licence needs a name." };

  const type = LICENCE_TYPES.find((item) => item.id === licence.typeId) ?? LICENCE_TYPES.at(-1);

  const leadDays = Number(licence.leadDays ?? type.leadDays);
  if (!Number.isFinite(leadDays) || leadDays < 0 || leadDays > 365) {
    return { error: `"${name}": the renewal lead time must be between 0 and 365 days.` };
  }

  let expiryMs = parseIsoDate(licence.expiryDate);
  const issueMs = parseIsoDate(licence.issueDate);

  if (Number.isNaN(expiryMs)) {
    if (Number.isNaN(issueMs)) {
      return { error: `"${name}": enter either an expiry date or an issue date with a validity.` };
    }
    const validityMonths = Number(licence.validityMonths ?? type.validityMonths);
    if (!Number.isInteger(validityMonths) || validityMonths < 1 || validityMonths > 240) {
      return { error: `"${name}": validity must be a whole number of months between 1 and 240.` };
    }
    expiryMs = deriveExpiry(issueMs, validityMonths);
  }

  if (!Number.isNaN(issueMs) && expiryMs < issueMs) {
    return { error: `"${name}": the expiry date is before the issue date.` };
  }

  const daysToExpiry = Math.round((expiryMs - todayMs) / MS_PER_DAY);
  if (Math.abs(daysToExpiry) > MAX_HORIZON_DAYS) {
    return { error: `"${name}": that expiry date is more than 20 years away — check the year.` };
  }

  const reminderMs = expiryMs - leadDays * MS_PER_DAY;
  const daysToReminder = Math.round((reminderMs - todayMs) / MS_PER_DAY);

  let status = "scheduled";
  if (daysToExpiry < 0) status = "expired";
  else if (daysToExpiry <= CRITICAL_DAYS) status = "critical";
  else if (daysToReminder <= 0) status = "renewNow";

  return {
    id: licence.id,
    name,
    typeId: type.id,
    typeLabel: type.label,
    authority: String(licence.authority ?? "").trim() || type.authority,
    number: String(licence.number ?? "").trim(),
    issueDate: Number.isNaN(issueMs) ? "" : toIsoDate(issueMs),
    expiryDate: toIsoDate(expiryMs),
    reminderDate: toIsoDate(reminderMs),
    leadDays,
    daysToExpiry,
    daysToReminder,
    status,
    note: type.note,
  };
}

/**
 * Build the whole board.
 *
 * @param {object} input
 * @param {object[]} input.licences rows as described in scoreLicence
 * @param {string} input.today      reference date, YYYY-MM-DD
 * @returns {object} rows, counts and the next action — or { error }
 */
export function buildRenewalBoard({ licences = [], today } = {}) {
  const todayMs = parseIsoDate(today);
  if (Number.isNaN(todayMs)) return { error: "Enter today's date as a real calendar date." };

  if (!Array.isArray(licences) || licences.length === 0) {
    return { error: "Add at least one licence to build the board." };
  }
  if (licences.length > 50) {
    return { error: "This board holds up to 50 licences." };
  }

  const rows = [];
  for (const licence of licences) {
    const scored = scoreLicence(licence, todayMs);
    if (scored.error) return { error: scored.error };
    rows.push(scored);
  }

  rows.sort((a, b) => a.daysToExpiry - b.daysToExpiry);

  const counts = STATUS_ORDER.reduce((acc, key) => {
    acc[key] = rows.filter((row) => row.status === key).length;
    return acc;
  }, {});

  const actionable = rows.filter((row) => row.status !== "scheduled");
  const nextRow = rows.find((row) => row.daysToExpiry >= 0) ?? null;

  return {
    rows,
    counts,
    total: rows.length,
    actionableCount: actionable.length,
    nextRow,
    within90: rows.filter((row) => row.daysToExpiry >= 0 && row.daysToExpiry <= 90).length,
    today: toIsoDate(todayMs),
  };
}
