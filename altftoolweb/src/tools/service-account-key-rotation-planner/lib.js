/**
 * Service account key rotation planning.
 *
 * Cadence guidance encoded here:
 *  - CIS AWS Foundations Benchmark control 1.14: AWS IAM access keys must be
 *    rotated every 90 days or less. That AWS-specific ceiling is used as the
 *    configurable planning baseline here; other clouds and credential types
 *    can have different requirements.
 *  - Zero-downtime cutover relies on both providers allowing two active
 *    keys per identity (AWS allows 2 access keys per IAM user; GCP allows
 *    up to 10 keys per service account), so a new key can run alongside
 *    the old during the overlap window before the old one is disabled.
 */

/** CIS AWS Foundations Benchmark 1.14 — rotate access keys every 90 days or less. */
export const CIS_MAX_ROTATION_DAYS = 90;

/**
 * Disable-before-delete quarantine: keep the old key disabled (not deleted)
 * for a grace period so an unnoticed dependency can be re-enabled instead
 * of being unrecoverable. 7 days is a common operational default.
 */
export const QUARANTINE_DAYS = 7;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Parse an ISO yyyy-mm-dd string into a UTC-midnight Date, or null when invalid. */
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

export function addDays(date, days) {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

export function toIso(date) {
  return date.toISOString().slice(0, 10);
}

export function daysBetween(from, to) {
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

/**
 * Build a rotation schedule and cutover plan.
 *
 * @param {object} input
 * @param {string} input.lastRotationDate    Date the current key was created/last rotated (yyyy-mm-dd).
 * @param {number} input.rotationPeriodDays  Rotation cadence in days (CIS baseline: <= 90).
 * @param {number} input.overlapDays         Days old and new keys run in parallel before old is disabled.
 * @param {number} input.noticeDays          Days before the due date to alert the owning team.
 * @param {number} input.keyCount            Number of keys managed on this cadence.
 * @param {string} input.today               Reference date (yyyy-mm-dd) — passed in to keep the function pure.
 * @returns {object} schedule, or { error }.
 */
export function planKeyRotation({
  lastRotationDate,
  rotationPeriodDays,
  overlapDays,
  noticeDays,
  keyCount,
  today,
}) {
  const period = Number(rotationPeriodDays);
  const overlap = Number(overlapDays);
  const notice = Number(noticeDays);
  const keys = Number(keyCount);

  if (!Number.isFinite(period) || !Number.isInteger(period) || period < 1) {
    return { error: "Rotation period must be a whole number of days, at least 1." };
  }
  if (!Number.isFinite(overlap) || !Number.isInteger(overlap) || overlap < 0) {
    return { error: "Overlap window must be a whole number of days, at least 0." };
  }
  if (overlap >= period) {
    return { error: "Overlap window must be shorter than the rotation period." };
  }
  if (!Number.isFinite(notice) || !Number.isInteger(notice) || notice < 0) {
    return { error: "Notice period must be a whole number of days, at least 0." };
  }
  if (notice > period) {
    return { error: "Notice period cannot be longer than the rotation period." };
  }
  if (!Number.isFinite(keys) || !Number.isInteger(keys) || keys < 1) {
    return { error: "Number of keys must be a whole number, at least 1." };
  }

  const last = parseIsoDate(lastRotationDate);
  if (!last) return { error: "Enter the last rotation date as yyyy-mm-dd." };
  const now = parseIsoDate(today);
  if (!now) return { error: "Enter today's date as yyyy-mm-dd." };
  if (last.getTime() > now.getTime()) {
    return { error: "The last rotation date cannot be in the future." };
  }

  const due = addDays(last, period);
  const daysUntilDue = daysBetween(now, due);
  const overdue = daysUntilDue < 0;
  const keyAgeDays = daysBetween(last, now);

  // Owners must always be notified before the replacement key is created —
  // if the overlap window is longer than the requested notice period, the
  // notify date is pulled earlier so it never lands after createDate. Without
  // this, a plain chronological sort of the steps below could (and did) put
  // "Create the new key" ahead of "Notify owners" whenever overlapDays >
  // noticeDays, inverting the tool's own documented process.
  const effectiveNoticeDays = Math.max(notice, overlap);
  // A compliance due date can be historical, but an operational runbook
  // cannot ask someone to create/disable/delete keys in the past. For an
  // overdue key, start the cutover now, keep the requested overlap from now,
  // and quarantine the disabled key from its actual disable date.
  const notifyDate = overdue ? now : addDays(due, -effectiveNoticeDays);
  const createDate = overdue ? now : addDays(due, -overlap);
  const disableDate = overdue ? addDays(now, overlap) : due;
  const deleteDate = addDays(disableDate, QUARANTINE_DAYS);

  const meetsCis = period <= CIS_MAX_ROTATION_DAYS;
  const rotationsPerYearPerKey = 365.25 / period;
  // Round the per-key rate first, and derive the fleet total from that same
  // rounded figure — the runbook text prints "keys × rate = total", so the
  // total must actually equal keys times the rate a reader can see, not a
  // total computed from the unrounded rate behind the scenes.
  const rotationsPerYearPerKeyRounded = Math.round(rotationsPerYearPerKey * 10) / 10;
  const rotationEventsPerYear = Math.round(rotationsPerYearPerKeyRounded * keys * 10) / 10;

  // Ordered by intended sequence first. Thanks to effectiveNoticeDays above,
  // notifyDate <= createDate <= disableDate <= deleteDate always holds, so
  // the date sort below is a no-op safety net rather than something the
  // schedule depends on to look correct.
  const orderedSteps = [
    {
      date: toIso(notifyDate),
      title: "Notify owners",
      detail: overdue
        ? "Alert the owning team immediately; confirm every consumer of the overdue key is known before cutover."
        : `Alert the owning team ${effectiveNoticeDays} day${effectiveNoticeDays === 1 ? "" : "s"} ahead${
            effectiveNoticeDays > notice
              ? ` (moved earlier than the ${notice}-day notice period so it isn't after the new key is created)`
              : ""
          }; confirm every consumer of the key is known.`,
    },
    {
      date: toIso(createDate),
      title: "Create the new key",
      detail:
        "Generate the replacement credential; both keys are now valid (AWS allows 2 access keys per IAM user, GCP up to 10 per service account).",
    },
    {
      date: toIso(createDate),
      title: "Deploy and verify",
      detail:
        "Roll the new key out through your secret store (rotate in place, no code change) and verify traffic authenticates with the new key ID.",
    },
    {
      date: toIso(disableDate),
      title: "Disable the old key",
      detail:
        "Disable — do not delete — the old key, then watch logs and error rates for anything still using it.",
    },
    {
      date: toIso(deleteDate),
      title: "Delete the old key",
      detail: `After the ${QUARANTINE_DAYS}-day quarantine with no auth failures, delete the disabled key permanently.`,
    },
  ];
  const steps = orderedSteps
    .map((step, index) => ({ ...step, index }))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.index - b.index))
    .map(({ index, ...step }) => step);

  return {
    keyAgeDays,
    dueDate: toIso(due),
    daysUntilDue,
    overdue,
    meetsCis,
    cisMaxDays: CIS_MAX_ROTATION_DAYS,
    notifyDate: toIso(notifyDate),
    createDate: toIso(createDate),
    disableDate: toIso(disableDate),
    deleteDate: toIso(deleteDate),
    rotationsPerYearPerKey: rotationsPerYearPerKeyRounded,
    rotationEventsPerYear,
    steps,
  };
}
