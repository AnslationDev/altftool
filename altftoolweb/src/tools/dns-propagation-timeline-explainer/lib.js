/**
 * DNS propagation timeline model.
 *
 * "Propagation" is not a push — it is caches expiring. A recursive resolver
 * that fetched the record just before the change keeps serving the old
 * answer until the record's TTL runs out (RFC 1035 s3.2.1). So for a change
 * to an EXISTING record the worst case is governed by the OLD TTL.
 *
 * For a brand-NEW record, what governs is negative caching: a resolver that
 * was asked for the name before it existed caches the NXDOMAIN/NODATA answer
 * for min(SOA MINIMUM field, SOA record TTL) per RFC 2308 section 5.
 *
 * On top of resolver caches sit small client-side caches that do not always
 * honour the record TTL:
 *  - Chromium's internal host cache holds entries for about 60 seconds.
 *  - OS stub-resolver caches honour the (remaining) TTL, so they do not
 *    extend the worst case, but they explain sightings of the old answer.
 * Some ISP resolvers historically clamp or ignore very low TTLs; that is a
 * caveat, not a bound this model can compute.
 */

// Chromium caches resolved hosts internally for ~60 s regardless of DNS TTL.
export const BROWSER_CACHE_SECONDS = 60;

// RFC 2181 s8: TTL is a 31-bit unsigned integer.
export const TTL_MAX = 2147483647;

// Resolvers commonly cap absurdly long TTLs; BIND's default max-cache-ttl is
// 7 days (604800 s), unbound's cache-max-ttl default is 86400 s. We surface
// the BIND figure as the practical ceiling caveat.
export const RESOLVER_TTL_CAP_SECONDS = 604800;

export const CHANGE_TYPES = [
  { id: "existing", label: "Changing an existing record (new IP / new target)" },
  { id: "new", label: "Adding a brand-new record (name did not resolve before)" },
  { id: "deleted", label: "Deleting a record (name should stop resolving)" },
];

/** Human-friendly duration, e.g. 3660 -> "1 h 1 min". */
export function formatDuration(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds));
  if (s === 0) return "immediately";
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
 * Compute the propagation timeline for a DNS change published at t = 0.
 *
 * @param {object} input
 * @param {string} input.changeType   "existing" | "new" | "deleted"
 * @param {number} input.ttlSeconds   TTL of the record being changed/deleted
 *                                    (its OLD TTL — that is what caches hold).
 * @param {number} [input.negativeTtlSeconds] min(SOA MINIMUM, SOA TTL) — only
 *                                    used for changeType "new" (RFC 2308).
 * @returns {{ worstCaseSeconds, governingSeconds, governingRule, milestones, caveats }|{ error }}
 */
export function computePropagationTimeline({ changeType, ttlSeconds, negativeTtlSeconds = 3600 }) {
  const kind = CHANGE_TYPES.some((c) => c.id === changeType) ? changeType : null;
  if (!kind) return { error: "Choose what kind of DNS change you are making." };

  const ttl = Number(ttlSeconds);
  const negTtl = Number(negativeTtlSeconds);
  if (!Number.isFinite(ttl) || ttl < 0) {
    return { error: "TTL must be zero or a positive number of seconds." };
  }
  if (ttl > TTL_MAX) {
    return { error: `TTL cannot exceed ${TTL_MAX} seconds (RFC 2181 caps TTL at 2^31 - 1).` };
  }
  if (kind === "new" && (!Number.isFinite(negTtl) || negTtl < 0 || negTtl > TTL_MAX)) {
    return { error: "Negative-cache TTL must be between 0 and 2147483647 seconds." };
  }

  // Which cache governs the worst case (RFC 1035 s3.2.1 vs RFC 2308 s5).
  const governingSeconds = kind === "new" ? negTtl : ttl;
  const governingRule =
    kind === "new"
      ? "Negative caching: resolvers that saw 'no such name' keep that answer for min(SOA MINIMUM, SOA TTL) — RFC 2308 section 5."
      : "Positive caching: resolvers keep the old answer for up to the record's previous TTL — RFC 1035 section 3.2.1.";

  const worstCaseSeconds = governingSeconds + BROWSER_CACHE_SECONDS;

  const milestones = [
    {
      atSeconds: 0,
      label: "Change published",
      description:
        "The authoritative name servers for the zone now answer with the new data. Nothing is pushed anywhere — every cache simply counts down.",
    },
    {
      atSeconds: 0,
      label: "Uncached resolvers see it instantly",
      description:
        "Any resolver that has no cached copy (or whose copy already expired) fetches the new answer on its next query. Many users see the change within seconds.",
    },
  ];

  if (governingSeconds > 0) {
    milestones.push(
      {
        atSeconds: governingSeconds / 2,
        label: "Roughly half of cached resolvers refreshed",
        description:
          "Cache entries expire at different moments depending on when each resolver last queried. Expiries spread out across the full TTL window.",
      },
      {
        atSeconds: governingSeconds,
        label:
          kind === "new"
            ? "All negative caches expired"
            : "All resolver caches expired (old TTL elapsed)",
        description:
          kind === "new"
            ? "The last resolver holding a cached 'name does not exist' answer must now re-query and gets the new record."
            : "A resolver that fetched the old record one second before your change held it the longest — its copy has now expired.",
      },
    );
  }

  milestones.push({
    atSeconds: worstCaseSeconds,
    label: "Client-side caches drained — worst case reached",
    description: `Browser host caches (Chromium holds entries about ${BROWSER_CACHE_SECONDS} s regardless of TTL) and OS stub caches have refreshed. Beyond this point only misbehaving resolvers serve stale data.`,
  });

  const caveats = [
    "Some ISP and corporate resolvers clamp very low TTLs upward or ignore TTLs entirely; stragglers can serve stale answers for 24-48 hours. This is non-compliant behaviour you cannot schedule around.",
    `Resolvers also cap very long TTLs — BIND's default max-cache-ttl is ${RESOLVER_TTL_CAP_SECONDS} seconds (7 days) — so a week-long TTL rarely caches longer than that in practice.`,
    "Applications with their own connection or DNS pinning (JVM caches, long-lived keep-alive connections) may keep talking to the old address even after DNS has fully propagated.",
  ];
  if (kind === "deleted") {
    caveats.unshift(
      "Deleting a record behaves like changing one: resolvers serve the old answer until its TTL expires, after which they cache the resulting NXDOMAIN under the negative TTL.",
    );
  }

  return {
    changeType: kind,
    ttlSeconds: ttl,
    negativeTtlSeconds: kind === "new" ? negTtl : null,
    governingSeconds,
    governingRule,
    browserCacheSeconds: BROWSER_CACHE_SECONDS,
    worstCaseSeconds,
    milestones,
    caveats,
  };
}
