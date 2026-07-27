/**
 * DNS TTL strategy and cutover planning.
 *
 * The core scheduling rule: a cache fetched just before you publish a change
 * holds the old answer for the FULL TTL that was attached at fetch time
 * (RFC 1035 s3.2.1). Therefore:
 *   - The TTL must be LOWERED at least one old-TTL period before the
 *     cutover, so that by cutover time every compliant cache holds a copy
 *     carrying the low TTL.
 *   - After the cutover, the change is fully visible after the low TTL
 *     (plus a small client-cache allowance).
 *   - The TTL is restored once the cutover is verified, because permanently
 *     low TTLs raise query load and resolver latency for no benefit.
 *
 * Steady-state recommendations are operational conventions, not RFC
 * mandates; the reasoning is stated with each figure.
 */

// RFC 2181 s8: TTL is a 31-bit unsigned integer.
export const TTL_MAX = 2147483647;

// Safety margin multiplier on the lead time: lowering "exactly one TTL"
// before cutover leaves zero slack for clock skew and resolver prefetching,
// so operational practice doubles it.
export const LEAD_TIME_SAFETY_FACTOR = 2;

// Chromium's internal host cache ignores DNS TTL for ~60 s.
export const CLIENT_CACHE_ALLOWANCE_SECONDS = 60;

/**
 * Steady-state TTL guidance per record type. Ranges reflect common
 * operational practice: frequently repointed records stay short, structural
 * records stay long to cut query load and to survive resolver outages.
 */
export const RECORD_TYPE_GUIDANCE = [
  {
    type: "A / AAAA (web, app endpoints)",
    id: "a",
    steadySeconds: 3600,
    range: "300 - 3600",
    reason:
      "Endpoints get repointed during incidents; an hour bounds the blast radius while keeping cache hit rates high.",
  },
  {
    type: "CNAME (aliases to platforms)",
    id: "cname",
    steadySeconds: 3600,
    range: "300 - 3600",
    reason: "Platform targets (CDNs, PaaS) change on their side; the alias itself rarely does.",
  },
  {
    type: "MX (mail routing)",
    id: "mx",
    steadySeconds: 86400,
    range: "3600 - 86400",
    reason:
      "Mail providers change rarely, and RFC 5321 obliges senders to queue and retry, so long TTLs are safe.",
  },
  {
    type: "TXT (SPF, DKIM, DMARC, verification)",
    id: "txt",
    steadySeconds: 3600,
    range: "3600 - 86400",
    reason: "Policy records change during email setup; an hour keeps iteration tolerable.",
  },
  {
    type: "NS (delegation)",
    id: "ns",
    steadySeconds: 86400,
    range: "86400 - 172800",
    reason:
      "Delegations are structural; long TTLs shield the zone from parent-server flaps and cut root/TLD load.",
  },
  {
    type: "CAA (issuance policy)",
    id: "caa",
    steadySeconds: 3600,
    range: "3600 - 86400",
    reason: "Only consulted at certificate issuance time; an hour lets you fix a renewal-blocking mistake quickly.",
  },
];

/** Human-friendly duration. */
export function formatDuration(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds));
  if (s === 0) return "0 sec";
  if (s < 60) return `${s} sec`;
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const parts = [];
  if (days) parts.push(`${days} d`);
  if (hours) parts.push(`${hours} h`);
  if (minutes) parts.push(`${minutes} min`);
  if (parts.length === 0) parts.push(`${Math.floor(s / 60)} min`);
  return parts.join(" ");
}

/**
 * Build a lower -> cutover -> restore TTL plan.
 *
 * @param {object} input
 * @param {number} input.currentTtlSeconds  TTL the record carries today.
 * @param {number} input.lowTtlSeconds      Temporary TTL for the migration
 *                                          window (commonly 300).
 * @param {number} [input.steadyTtlSeconds] TTL to restore afterwards
 *                                          (defaults to currentTtlSeconds).
 * @returns {{ steps, leadTimeSeconds, visibleAfterSeconds, totalLowWindowSeconds }|{ error }}
 */
export function planTtlCutover({ currentTtlSeconds, lowTtlSeconds, steadyTtlSeconds }) {
  const current = Number(currentTtlSeconds);
  const low = Number(lowTtlSeconds);
  const steady = steadyTtlSeconds === undefined || steadyTtlSeconds === null || steadyTtlSeconds === ""
    ? current
    : Number(steadyTtlSeconds);

  if (!Number.isInteger(current) || current < 0 || current > TTL_MAX) {
    return { error: "Current TTL must be a whole number of seconds between 0 and 2147483647." };
  }
  if (!Number.isInteger(low) || low < 0 || low > TTL_MAX) {
    return { error: "Migration TTL must be a whole number of seconds between 0 and 2147483647." };
  }
  if (!Number.isInteger(steady) || steady < 0 || steady > TTL_MAX) {
    return { error: "Restored TTL must be a whole number of seconds between 0 and 2147483647." };
  }
  if (low >= current && current > 0) {
    return {
      error:
        "The migration TTL must be lower than the current TTL — otherwise lowering it achieves nothing.",
    };
  }

  // Caches fetched just before the lowering hold the old TTL for `current`
  // seconds; doubling gives operational slack.
  const leadTimeSeconds = current * LEAD_TIME_SAFETY_FACTOR;

  // After the cutover, compliant caches refresh within the low TTL, plus
  // client-side allowance.
  const visibleAfterSeconds = low + CLIENT_CACHE_ALLOWANCE_SECONDS;

  // Keep the low TTL until the cutover is verified; a further low-TTL period
  // of observation is the conventional buffer before restoring.
  const observeSeconds = Math.max(low, 3600);

  const steps = [
    {
      offsetLabel: `T - ${formatDuration(leadTimeSeconds)}`,
      title: `Lower the TTL to ${formatDuration(low)} (${low} s)`,
      detail:
        `Publish the SAME record data with the low TTL. Caches holding the old ${formatDuration(current)} TTL need up to ${formatDuration(current)} to pick it up; the extra ${formatDuration(leadTimeSeconds - current)} is safety margin for skew and non-compliant resolvers.`,
    },
    {
      offsetLabel: "T - 0",
      title: "Cut over — publish the new record data",
      detail:
        "Every compliant cache now holds a copy carrying the low TTL, so the old answer dies out quickly.",
    },
    {
      offsetLabel: `T + ${formatDuration(visibleAfterSeconds)}`,
      title: "Change fully visible",
      detail:
        `All resolver caches have expired (${formatDuration(low)}) plus about ${CLIENT_CACHE_ALLOWANCE_SECONDS} s of browser/OS cache. Verify from several networks or a multi-location DNS checker.`,
    },
    {
      offsetLabel: `T + ${formatDuration(visibleAfterSeconds + observeSeconds)}`,
      title: `Restore the TTL to ${formatDuration(steady)} (${steady} s)`,
      detail:
        "After an observation window with no rollback needed, restore the steady-state TTL — permanently low TTLs multiply query load and add resolver latency for every visitor.",
    },
  ];

  return {
    steps,
    leadTimeSeconds,
    visibleAfterSeconds,
    totalLowWindowSeconds: leadTimeSeconds + visibleAfterSeconds + observeSeconds,
    currentTtlSeconds: current,
    lowTtlSeconds: low,
    steadyTtlSeconds: steady,
    rollbackNote:
      `While the low TTL is live, a rollback also propagates in about ${formatDuration(visibleAfterSeconds)} — that fast-undo window is the whole point of the exercise.`,
  };
}
