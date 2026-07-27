/**
 * Secrets rotation schedule planning.
 *
 * Recommended rotation intervals below are drawn from widely used published
 * guidance, cited per constant. They are defaults the user can override —
 * NIST SP 800-63B-4 explicitly moved away from forced *human password*
 * expiry, but machine credentials (keys, tokens, certificates) still carry
 * published maximum lifetimes or rotation recommendations.
 *
 * All functions are pure: "today" is always an argument, never Date.now().
 */

export const SECRET_TYPES = [
  {
    id: "api-key",
    label: "API key / access key",
    // AWS IAM security best practices and CIS AWS Foundations Benchmark
    // control 1.14 both call for rotating access keys every 90 days or less.
    recommendedDays: 90,
  },
  {
    id: "service-token",
    label: "Service-account token",
    // Same 90-day machine-credential guidance as cloud access keys (CIS/AWS).
    recommendedDays: 90,
  },
  {
    id: "db-password",
    label: "Database password",
    // AWS Secrets Manager's managed rotation templates default to rotating
    // database credentials on a 30-day schedule; 30 days is the common default.
    recommendedDays: 30,
  },
  {
    id: "tls-cert",
    label: "TLS certificate",
    // CA/Browser Forum ballot SC-081: public TLS certificates issued on or
    // after 15 March 2026 have a maximum validity of 200 days (dropping to
    // 100 days in 2027 and 47 days in 2029), so rotation must happen at
    // least that often.
    recommendedDays: 200,
  },
  {
    id: "signing-key",
    label: "Signing key (JWT / code signing)",
    // NIST SP 800-57 Part 1 Rev. 5, Table 1: a private signature key's
    // recommended cryptoperiod is 1-3 years; one year is the conservative end.
    recommendedDays: 365,
  },
  {
    id: "ssh-key",
    label: "SSH key",
    // Commonly aligned with the NIST SP 800-57 private-key cryptoperiod
    // guidance of about one year for authentication key pairs.
    recommendedDays: 365,
  },
  {
    id: "webhook-secret",
    label: "Webhook / HMAC secret",
    // Shared symmetric secrets: NIST SP 800-57 suggests up to 2 years for
    // symmetric authentication keys; 180 days is a common operational default.
    recommendedDays: 180,
  },
  {
    id: "encryption-key",
    label: "Data-encryption key (KMS)",
    // AWS KMS automatic key rotation and NIST SP 800-57 symmetric
    // data-encryption cryptoperiod guidance both use roughly one year.
    recommendedDays: 365,
  },
];

export const SECRET_TYPE_BY_ID = new Map(SECRET_TYPES.map((type) => [type.id, type]));

/** A rotation is flagged "due soon" this many days ahead so owners have runway. */
export const DEFAULT_DUE_SOON_DAYS = 30;

export const STATUS = {
  OVERDUE: "overdue",
  DUE_SOON: "due-soon",
  OK: "ok",
};

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

/** Format a UTC-midnight Date back to yyyy-mm-dd. */
export function formatIsoDate(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Add whole days to a UTC-midnight date, returning a new Date. */
export function addDays(date, days) {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

/** Whole days from `from` to `to` (negative when `to` is in the past). */
export function daysBetween(from, to) {
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

/**
 * Plan the rotation schedule for a list of secrets.
 *
 * @param {object} input
 * @param {Array}  input.secrets  [{ id, name, typeId, owner, lastRotated, intervalDays }]
 *                                intervalDays empty/0 falls back to the type's recommendation.
 * @param {string} input.today    Reference date, yyyy-mm-dd (passed in — never read from the clock).
 * @param {number} [input.dueSoonDays] Days ahead that count as "due soon" (default 30).
 * @returns {object} { entries, counts, nextDue } or { error }.
 */
export function planRotationSchedule({ secrets, today, dueSoonDays = DEFAULT_DUE_SOON_DAYS }) {
  const todayDate = parseIsoDate(today);
  if (!todayDate) return { error: "Enter a valid reference date in yyyy-mm-dd form." };

  const window = Number(dueSoonDays);
  if (!Number.isFinite(window) || window < 0) {
    return { error: "The due-soon window must be 0 days or more." };
  }
  if (!Array.isArray(secrets) || secrets.length === 0) {
    return { error: "Add at least one secret to plan a rotation schedule." };
  }

  const entries = [];
  for (let index = 0; index < secrets.length; index += 1) {
    const secret = secrets[index] ?? {};
    const name = String(secret.name ?? "").trim();
    if (!name) return { error: `Secret #${index + 1} needs a name.` };

    const type = SECRET_TYPE_BY_ID.get(secret.typeId);
    if (!type) return { error: `Secret "${name}" needs a valid type.` };

    const lastRotated = parseIsoDate(secret.lastRotated);
    if (!lastRotated) {
      return { error: `Secret "${name}" needs a valid last-rotated date (yyyy-mm-dd).` };
    }
    if (lastRotated.getTime() > todayDate.getTime()) {
      return { error: `Secret "${name}" has a last-rotated date in the future.` };
    }

    const rawInterval =
      secret.intervalDays === "" || secret.intervalDays === null || secret.intervalDays === undefined
        ? type.recommendedDays
        : Number(secret.intervalDays);
    if (!Number.isFinite(rawInterval) || !Number.isInteger(rawInterval) || rawInterval < 1) {
      return { error: `Secret "${name}" needs a whole-number rotation interval of at least 1 day.` };
    }

    const nextRotation = addDays(lastRotated, rawInterval);
    const daysUntilDue = daysBetween(todayDate, nextRotation);
    const ageDays = daysBetween(lastRotated, todayDate);

    let status = STATUS.OK;
    if (daysUntilDue < 0) status = STATUS.OVERDUE;
    else if (daysUntilDue <= window) status = STATUS.DUE_SOON;

    entries.push({
      id: secret.id ?? `secret-${index}`,
      name,
      typeId: type.id,
      typeLabel: type.label,
      owner: String(secret.owner ?? "").trim() || "Unassigned",
      lastRotated: formatIsoDate(lastRotated),
      intervalDays: rawInterval,
      usesRecommendedInterval: rawInterval === type.recommendedDays,
      nextRotation: formatIsoDate(nextRotation),
      daysUntilDue,
      ageDays,
      status,
    });
  }

  // Soonest deadline first — that is the order a rotation calendar is worked in.
  entries.sort((a, b) => a.daysUntilDue - b.daysUntilDue);

  const counts = {
    total: entries.length,
    overdue: entries.filter((entry) => entry.status === STATUS.OVERDUE).length,
    dueSoon: entries.filter((entry) => entry.status === STATUS.DUE_SOON).length,
    ok: entries.filter((entry) => entry.status === STATUS.OK).length,
  };

  return { entries, counts, nextDue: entries[0] ?? null, today: formatIsoDate(todayDate) };
}

/** Render a planned schedule as plain text for pasting into a runbook or ticket. */
export function scheduleToText(plan) {
  if (!plan || plan.error || !Array.isArray(plan.entries)) return "";
  const lines = [
    `Secrets rotation schedule (as of ${plan.today})`,
    `Overdue: ${plan.counts.overdue} | Due soon: ${plan.counts.dueSoon} | OK: ${plan.counts.ok}`,
    "",
  ];
  for (const entry of plan.entries) {
    const state =
      entry.status === STATUS.OVERDUE
        ? `OVERDUE by ${Math.abs(entry.daysUntilDue)} days`
        : entry.status === STATUS.DUE_SOON
          ? `due in ${entry.daysUntilDue} days`
          : `due in ${entry.daysUntilDue} days`;
    lines.push(
      `${entry.nextRotation}  ${entry.name} (${entry.typeLabel}) — owner: ${entry.owner} — every ${entry.intervalDays} days — ${state}`,
    );
  }
  return lines.join("\n");
}
