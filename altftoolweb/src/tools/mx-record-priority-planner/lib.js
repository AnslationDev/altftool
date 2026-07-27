/**
 * MX record priority planning.
 *
 * Rules encoded here:
 *  - RFC 5321 section 5.1: the sending MTA sorts MX records by preference
 *    value and tries the LOWEST value first; equal values are tried in
 *    randomised order, which load-balances across hosts.
 *  - RFC 5321 section 5.1 / RFC 2181 section 10.3: an MX target must be a
 *    hostname with address records — it must not be an IP address literal
 *    and must not point at a CNAME.
 *  - Preference is a 16-bit unsigned integer, 0-65535 (RFC 1035 s3.3.9).
 *  - Spacing tiers by 10 (10, 20, 30 ...) is the operational convention that
 *    leaves room to insert servers between tiers later.
 */

// RFC 1035 s3.3.9: MX preference is a 16-bit unsigned integer.
export const PREFERENCE_MAX = 65535;

// Operational convention: tier spacing of 10 leaves insertion room.
export const TIER_SPACING = 10;

export const SCENARIOS = [
  { id: "single", label: "Single provider (one or more equal servers)" },
  { id: "primary-backup", label: "Primary provider + backup MX" },
  { id: "migration", label: "Migrating from an old provider to a new one" },
];

const IPV4_LIKE = /^\d{1,3}(\.\d{1,3}){3}$/;
const HOSTNAME_PATTERN = /^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.(?!-)[A-Za-z0-9-]{1,63}(?<!-))+\.?$/;

/** Parse a newline/comma separated host list; returns { hosts } or { error }. */
export function parseHostList(raw, label) {
  const hosts = String(raw)
    .split(/[\n,]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  for (const host of hosts) {
    if (IPV4_LIKE.test(host)) {
      return {
        error: `${label}: "${host}" is an IP address — an MX target must be a hostname with A/AAAA records (RFC 5321).`,
      };
    }
    if (!HOSTNAME_PATTERN.test(host)) {
      return { error: `${label}: "${host}" is not a valid fully-qualified hostname.` };
    }
  }
  return { hosts };
}

const fqdn = (host) => (host.endsWith(".") ? host : `${host}.`);

/**
 * Plan the MX record set for a scenario.
 *
 * @param {object} input
 * @param {string} input.scenario  "single" | "primary-backup" | "migration"
 * @param {string} input.primaryHosts  Newline/comma separated hostnames
 *                                     (the NEW provider in a migration).
 * @param {string} [input.secondaryHosts] Backup hosts, or the OLD provider's
 *                                     hosts in a migration.
 * @param {number|string} [input.ttl]  TTL for the records, seconds.
 * @returns {{ records, phases, notes }|{ error }}
 */
export function planMxRecords({ scenario, primaryHosts, secondaryHosts = "", ttl = 3600 }) {
  if (!SCENARIOS.some((s) => s.id === scenario)) {
    return { error: "Choose a planning scenario." };
  }

  const ttlNum = Number(ttl);
  if (!Number.isInteger(ttlNum) || ttlNum < 0 || ttlNum > 2147483647) {
    return { error: "TTL must be a whole number of seconds between 0 and 2147483647." };
  }

  const primary = parseHostList(primaryHosts, scenario === "migration" ? "New provider" : "Primary");
  if (primary.error) return { error: primary.error };
  if (primary.hosts.length === 0) {
    return {
      error:
        scenario === "migration"
          ? "Enter at least one mail server hostname for the new provider."
          : "Enter at least one primary mail server hostname.",
    };
  }

  const secondary = parseHostList(
    secondaryHosts,
    scenario === "migration" ? "Old provider" : "Backup",
  );
  if (secondary.error) return { error: secondary.error };

  if (scenario !== "single" && secondary.hosts.length === 0) {
    return {
      error:
        scenario === "migration"
          ? "Enter the old provider's mail server hostname(s) so the cutover can be phased."
          : "Enter at least one backup MX hostname (or switch to the single-provider scenario).",
    };
  }

  const overlap = primary.hosts.filter((h) => secondary.hosts.includes(h));
  if (overlap.length > 0) {
    return { error: `"${overlap[0]}" appears in both host lists — each server belongs in one tier only.` };
  }

  const toRecords = (hosts, preference) =>
    hosts.map((host) => ({
      name: "@",
      ttl: ttlNum,
      type: "MX",
      preference,
      target: fqdn(host),
      zoneLine: `@\t${ttlNum}\tIN\tMX\t${preference} ${fqdn(host)}`,
    }));

  const notes = [
    "Senders try the lowest preference value first (RFC 5321 s5.1); equal values are load-balanced.",
    "MX targets must be hostnames with A/AAAA records — never IP literals and never CNAMEs (RFC 2181 s10.3).",
  ];

  if (scenario === "single") {
    const records = toRecords(primary.hosts, TIER_SPACING);
    return {
      records,
      phases: null,
      notes: [
        ...notes,
        primary.hosts.length > 1
          ? `All ${primary.hosts.length} servers share preference ${TIER_SPACING}, so senders distribute connections across them.`
          : `A single record at preference ${TIER_SPACING} is complete — spacing at 10 leaves room to add a backup at 20 later.`,
      ],
    };
  }

  if (scenario === "primary-backup") {
    const records = [
      ...toRecords(primary.hosts, TIER_SPACING),
      ...toRecords(secondary.hosts, TIER_SPACING * 2),
    ];
    return {
      records,
      phases: null,
      notes: [
        ...notes,
        `Primary tier at ${TIER_SPACING}, backup tier at ${TIER_SPACING * 2}: senders only fall back to the backup when every primary host is unreachable.`,
        "A backup MX must relay to the primary and apply the same spam filtering, or it becomes the spammers' preferred entry point.",
      ],
    };
  }

  // Migration: three phases, lowest preference moves from old to new.
  const phases = [
    {
      id: 1,
      title: "Phase 1 — add the new provider as backup",
      description:
        "Old provider keeps the lowest preference; the new provider joins one tier higher. Mail keeps flowing to the old system while you verify the new one accepts mail for your domain.",
      records: [
        ...toRecords(secondary.hosts, TIER_SPACING),
        ...toRecords(primary.hosts, TIER_SPACING * 2),
      ],
    },
    {
      id: 2,
      title: "Phase 2 — swap preferences (the cutover)",
      description:
        "The new provider takes the lowest preference; the old provider stays one tier higher as a safety net that still accepts and forwards mail while caches expire.",
      records: [
        ...toRecords(primary.hosts, TIER_SPACING),
        ...toRecords(secondary.hosts, TIER_SPACING * 2),
      ],
    },
    {
      id: 3,
      title: "Phase 3 — remove the old provider",
      description:
        "After the old MX TTL has expired and the old provider's queue is empty, delete its records. Keep its mailboxes readable until you have migrated historical mail.",
      records: toRecords(primary.hosts, TIER_SPACING),
    },
  ];

  return {
    records: phases[1].records,
    phases,
    notes: [
      ...notes,
      "Lower the MX TTL at least one old-TTL period before Phase 2 so the swap takes effect quickly.",
      "Both providers must accept mail for the domain throughout Phases 1-2 or senders that pick the wrong tier will bounce mail.",
    ],
  };
}
