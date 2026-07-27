/**
 * API key rotation planning.
 *
 * The core idea — that every key gets a limited "cryptoperiod" after which it is
 * replaced — comes from NIST SP 800-57 Part 1 (key management). Concrete interval
 * presets follow widely published cloud-provider guidance: AWS IAM and Google
 * Cloud both recommend rotating long-lived access keys at least every 90 days,
 * and PCI DSS v4.0 requirement 3.7.4 requires keys to be changed at the end of
 * their defined cryptoperiod. Shorter intervals for higher-exposure keys are a
 * conventional hardening of that baseline, not a statutory rule.
 */

/** Rotation interval presets by exposure level. */
export const ROTATION_PRESETS = [
  {
    id: "critical",
    label: "Critical — key used in client-side or shared environments",
    intervalDays: 30,
    note: "Keys that ever touch a browser, mobile app, notebook or shared machine.",
  },
  {
    id: "standard",
    label: "Standard — server-side production key",
    intervalDays: 90,
    note: "Matches the 90-day baseline AWS and Google Cloud recommend for access keys.",
  },
  {
    id: "low",
    label: "Low — internal tooling behind a VPN",
    intervalDays: 180,
    note: "Internal-only automation with restricted network exposure.",
  },
  {
    id: "annual",
    label: "Minimum hygiene — rotate at least yearly",
    intervalDays: 365,
    note: "Absolute upper bound; longer cryptoperiods are not recommended.",
  },
];

/**
 * Default dual-key overlap window: run old and new keys in parallel for a few
 * days so every deploy target picks up the new key before the old one dies.
 * 7 days is a common operational convention, not a standard.
 */
export const DEFAULT_OVERLAP_DAYS = 7;

/** Sanity bounds so the planner cannot produce a meaningless schedule. */
export const MIN_INTERVAL_DAYS = 1;
export const MAX_INTERVAL_DAYS = 3650; // 10 years — beyond any sane cryptoperiod
export const MAX_OVERLAP_DAYS = 90;
export const SCHEDULE_LENGTH = 4; // upcoming rotations to display

/** Average Gregorian year length, used for the rotations-per-year figure. */
export const DAYS_PER_YEAR = 365.25;

/**
 * Ordered revocation runbook for a compromised or retired AI API key.
 * Distilled from provider incident-response docs (OpenAI, Anthropic, AWS all
 * publish equivalent "rotate then revoke, then audit usage" sequences).
 */
export const REVOCATION_STEPS = [
  ["Create the replacement key", "Issue a new key with the narrowest scopes the workload needs — never broader than the old one."],
  ["Deploy the new key everywhere", "Update every secret store, CI variable and server env that held the old key; redeploy dependent services."],
  ["Verify traffic on the new key", "Confirm in the provider dashboard that requests now authenticate with the new key."],
  ["Revoke the old key", "Delete or disable it in the provider console — expiry alone is not revocation."],
  ["Audit usage of the old key", "Review usage logs for the old key's lifetime for unexpected IPs, spikes or unfamiliar endpoints."],
  ["Record the rotation", "Log who rotated, when, and the next due date in your secrets inventory."],
];

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

/** Add whole days to a UTC-midnight date, returning a new Date. */
export function addDays(date, days) {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

/** Format a UTC-midnight date back to yyyy-mm-dd. */
export function toIso(date) {
  return date.toISOString().slice(0, 10);
}

/** Whole days from `from` to `to` (positive when `to` is later). */
export function daysBetween(from, to) {
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

/**
 * Build the rotation plan.
 *
 * @param {object} input
 * @param {string} input.lastRotatedDate  When the key was created or last rotated, yyyy-mm-dd.
 * @param {number} input.intervalDays     Rotation interval (cryptoperiod) in days.
 * @param {number} input.overlapDays      Dual-key overlap window in days.
 * @param {string} input.referenceDate    "Today" for the caller, yyyy-mm-dd (kept pure — no Date.now()).
 * @returns {object} plan or { error }.
 */
export function computeRotationPlan({ lastRotatedDate, intervalDays, overlapDays, referenceDate }) {
  const interval = Number(intervalDays);
  const overlap = Number(overlapDays);

  if (!Number.isFinite(interval) || !Number.isInteger(interval)) {
    return { error: "Enter the rotation interval as a whole number of days." };
  }
  if (interval < MIN_INTERVAL_DAYS) {
    return { error: "The rotation interval must be at least 1 day." };
  }
  if (interval > MAX_INTERVAL_DAYS) {
    return { error: "Rotation intervals beyond 10 years are not meaningful — shorten the interval." };
  }
  if (!Number.isFinite(overlap) || !Number.isInteger(overlap) || overlap < 0) {
    return { error: "The overlap window must be zero or a positive whole number of days." };
  }
  if (overlap > MAX_OVERLAP_DAYS) {
    return { error: "An overlap window beyond 90 days defeats the point of rotating — shorten it." };
  }
  if (overlap >= interval) {
    return { error: "The overlap window must be shorter than the rotation interval." };
  }

  const last = parseIsoDate(lastRotatedDate);
  if (!last) return { error: "Enter the last rotation date in yyyy-mm-dd form." };
  const reference = parseIsoDate(referenceDate);
  if (!reference) return { error: "Enter a valid reference date in yyyy-mm-dd form." };
  if (last > reference) {
    return { error: "The last rotation date is in the future — check the date." };
  }

  const nextDue = addDays(last, interval);
  const daysUntilDue = daysBetween(reference, nextDue);
  const keyAgeDays = daysBetween(last, reference);
  const overdueDays = Math.max(0, -daysUntilDue);

  let status;
  if (daysUntilDue < 0) status = "overdue";
  else if (daysUntilDue === 0) status = "due-today";
  else if (daysUntilDue <= overlap) status = "due-soon";
  else status = "on-track";

  // Upcoming rotation schedule. When already overdue, the first entry is an
  // immediate rotation from the reference date, then the cadence restarts.
  const schedule = [];
  let anchor = status === "overdue" ? reference : nextDue;
  for (let i = 0; i < SCHEDULE_LENGTH; i += 1) {
    const rotateOn = i === 0 ? anchor : addDays(anchor, interval * i);
    schedule.push({
      rotateOn: toIso(rotateOn),
      revokeOldBy: toIso(addDays(rotateOn, overlap)),
      immediate: status === "overdue" && i === 0,
    });
  }

  const rotationsPerYear = DAYS_PER_YEAR / interval;

  return {
    status,
    nextDue: toIso(nextDue),
    daysUntilDue: Math.max(0, daysUntilDue),
    overdueDays,
    keyAgeDays,
    intervalDays: interval,
    overlapDays: overlap,
    rotationsPerYear,
    schedule,
  };
}
