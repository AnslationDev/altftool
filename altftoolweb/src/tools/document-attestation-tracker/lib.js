/**
 * Document attestation tracking.
 *
 * Rules encoded:
 *  - Attestations do not expire by any central statute, but many Indian
 *    institutions, embassies and recruiting bodies treat attested copies,
 *    police-clearance-style certificates and similar paperwork as stale after
 *    a fixed window — 6 months is the most common convention (e.g. embassy
 *    attestation and PCC validity practice). Validity is therefore an
 *    editable per-document input, defaulting to 6 months, with "no expiry"
 *    supported for one-time attestations.
 *  - "Expiring soon" flags anything within 30 days of its expiry date, a
 *    renewal buffer that covers typical re-attestation turnaround.
 *  - Expiry date = attestation date + validity months, with end-of-month
 *    clamping (31 Aug + 6 months -> 28/29 Feb).
 *
 * All date maths is pure; "today" is always an argument.
 */

/** Most common institutional validity convention for attested copies. */
export const DEFAULT_VALIDITY_MONTHS = 6;
/** Flag documents whose attestation expires within this many days. */
export const EXPIRING_SOON_DAYS = 30;
export const MAX_VALIDITY_MONTHS = 120;
export const MAX_DOCUMENTS = 20;

export const STATUS = {
  PENDING: "pending",
  VALID: "valid",
  EXPIRING: "expiring",
  EXPIRED: "expired",
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Parse an ISO yyyy-mm-dd string into a UTC-midnight Date, or null. */
export function parseIsoDate(value) {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
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

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Add calendar months with end-of-month clamping (31 Aug + 6 -> 28/29 Feb). */
export function addMonthsClamped(date, months) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + months;
  const day = date.getUTCDate();
  const lastDayOfTarget = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return new Date(Date.UTC(year, month, Math.min(day, lastDayOfTarget)));
}

function isoFromDate(date) {
  return date.toISOString().slice(0, 10);
}

/**
 * Evaluate every document's attestation status.
 *
 * @param {object} input
 * @param {{name:string, attestedOn:string, attestedBy:string,
 *          validityMonths:(number|string)}[]} input.documents
 *        attestedOn "" = not yet attested; validityMonths "" = no expiry.
 * @param {string} input.todayIso  Today, yyyy-mm-dd.
 * @returns {{rows, counts, allClear, nextAction}|{error:string}}
 */
export function evaluateAttestations({ documents, todayIso }) {
  const today = parseIsoDate(todayIso);
  if (!today) return { error: "Today's date is missing — reload and try again." };

  if (!Array.isArray(documents)) return { error: "Documents must be a list." };
  const named = documents
    .map((doc) => ({
      name: String(doc?.name ?? "").trim(),
      attestedOn: String(doc?.attestedOn ?? "").trim(),
      attestedBy: String(doc?.attestedBy ?? "").trim(),
      validityMonths: doc?.validityMonths,
    }))
    .filter((doc) => doc.name !== "");
  if (named.length === 0) return { error: "Add at least one document with a name." };
  if (named.length > MAX_DOCUMENTS) {
    return { error: `Keep it to ${MAX_DOCUMENTS} documents per tracker.` };
  }

  const rows = [];
  for (const doc of named) {
    if (doc.attestedOn === "") {
      rows.push({
        ...doc,
        status: STATUS.PENDING,
        expiresOn: null,
        daysLeft: null,
        note: "Not attested yet.",
      });
      continue;
    }

    const attestedDate = parseIsoDate(doc.attestedOn);
    if (!attestedDate) {
      return { error: `Enter a valid attestation date for "${doc.name}" (yyyy-mm-dd), or leave it blank.` };
    }
    if (attestedDate.getTime() > today.getTime()) {
      return { error: `The attestation date for "${doc.name}" is in the future.` };
    }

    const validityRaw = doc.validityMonths;
    const noExpiry = validityRaw === "" || validityRaw === null || validityRaw === undefined;
    if (noExpiry) {
      rows.push({
        ...doc,
        status: STATUS.VALID,
        expiresOn: null,
        daysLeft: null,
        note: "No expiry set — valid indefinitely.",
      });
      continue;
    }

    const validity = Number(validityRaw);
    if (
      !Number.isFinite(validity) ||
      !Number.isInteger(validity) ||
      validity < 1 ||
      validity > MAX_VALIDITY_MONTHS
    ) {
      return { error: `Validity for "${doc.name}" must be a whole number of months from 1 to ${MAX_VALIDITY_MONTHS}, or blank for no expiry.` };
    }

    const expiresDate = addMonthsClamped(attestedDate, validity);
    const daysLeft = Math.round((expiresDate.getTime() - today.getTime()) / MS_PER_DAY);

    let status;
    let note;
    if (daysLeft < 0) {
      status = STATUS.EXPIRED;
      note = `Expired ${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? "" : "s"} ago — re-attest before submitting.`;
    } else if (daysLeft <= EXPIRING_SOON_DAYS) {
      status = STATUS.EXPIRING;
      note = `Expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"} — plan re-attestation now.`;
    } else {
      status = STATUS.VALID;
      note = `Valid for ${daysLeft} more days.`;
    }

    rows.push({
      ...doc,
      status,
      expiresOn: isoFromDate(expiresDate),
      daysLeft,
      note,
    });
  }

  const counts = {
    total: rows.length,
    pending: rows.filter((row) => row.status === STATUS.PENDING).length,
    valid: rows.filter((row) => row.status === STATUS.VALID).length,
    expiring: rows.filter((row) => row.status === STATUS.EXPIRING).length,
    expired: rows.filter((row) => row.status === STATUS.EXPIRED).length,
  };

  // Most urgent item: expired first (most overdue), then soonest-expiring, then first pending.
  const expired = rows
    .filter((row) => row.status === STATUS.EXPIRED)
    .sort((a, b) => a.daysLeft - b.daysLeft);
  const expiring = rows
    .filter((row) => row.status === STATUS.EXPIRING)
    .sort((a, b) => a.daysLeft - b.daysLeft);
  const pending = rows.filter((row) => row.status === STATUS.PENDING);
  const nextAction = expired[0] ?? expiring[0] ?? pending[0] ?? null;

  return {
    rows,
    counts,
    allClear: counts.pending === 0 && counts.expiring === 0 && counts.expired === 0,
    nextAction,
  };
}
