/**
 * Password Reuse Self Audit Sheet — clustering and blast-radius maths.
 *
 * Pure module: no React, no DOM, no clock reads, and it never sees a password.
 * You label each account with a *family* nickname ("old work one", "the 2019 pattern").
 * Two accounts in the same family share, or are trivial variations of, one password.
 *
 * Why family labels and not passwords: the attack this models is credential stuffing —
 * an attacker takes a username/password pair from one site's breach and replays it
 * across hundreds of other sites. The pair only has to match; the strength of the
 * password is irrelevant once it has leaked. NIST SP 800-63B addresses the same problem
 * from the verifier side by requiring new passwords to be checked against lists of
 * previously breached values.
 *
 * Tier weights below are ordinal blast-radius ranks, not probabilities. The ordering
 * follows the recovery graph: your primary email and password manager are ranked
 * highest because a reset link for nearly every other account is delivered through them.
 */

/** Minutes it realistically takes to change one password properly, including 2FA re-checks. */
export const MINUTES_PER_CHANGE = 3;

/** Sanity ceiling on worksheet size. */
export const MAX_ROWS = 100;

export const TIERS = [
  {
    id: "keys",
    label: "Primary email / password manager",
    weight: 100,
    note: "The reset link for nearly everything else arrives here. Reuse at this tier is the whole game.",
  },
  {
    id: "money",
    label: "Banking, payments, government, tax",
    weight: 40,
    note: "Direct financial loss and identity documents.",
  },
  {
    id: "identity",
    label: "Work login, cloud storage, social",
    weight: 12,
    note: "Impersonation, data loss and a route into an employer's systems.",
  },
  {
    id: "low",
    label: "Shopping, forums, newsletters",
    weight: 3,
    note: "Low value alone — dangerous only because these are the sites that get breached.",
  },
];

export const TIER_BY_ID = TIERS.reduce((map, tier) => {
  map[tier.id] = tier;
  return map;
}, {});

export const RISK_BANDS = [
  { id: "clean", label: "No reuse found", max: 0, advice: "Every account has its own password. Keep it that way with a manager." },
  { id: "low", label: "Low exposure", max: 20, advice: "A little reuse, and none of it on the accounts that matter most." },
  { id: "moderate", label: "Moderate exposure", max: 50, advice: "A single old breach would open more than you would like." },
  { id: "high", label: "High exposure", max: 80, advice: "Most of your account value sits behind shared passwords." },
  { id: "severe", label: "Severe exposure", max: 100, advice: "One leaked pair unlocks nearly everything. Start with the top of the queue today." },
];

function bandFor(percent) {
  return RISK_BANDS.find((band) => percent <= band.max) || RISK_BANDS[RISK_BANDS.length - 1];
}

/**
 * Audit a worksheet of accounts.
 *
 * @param {object} input
 * @param {Array<{label: string, tier: string, family: string}>} input.rows
 * @returns {object} audit result, or { error }
 */
export function auditPasswordReuse({ rows } = {}) {
  if (!Array.isArray(rows)) {
    return { error: "Add at least one account to the sheet." };
  }
  if (rows.length === 0) {
    return { error: "Add at least one account to the sheet." };
  }
  if (rows.length > MAX_ROWS) {
    return { error: `This sheet holds up to ${MAX_ROWS} accounts.` };
  }

  const cleaned = [];
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index] || {};
    const label = String(row.label ?? "").trim();
    const family = String(row.family ?? "").trim();
    const tier = TIER_BY_ID[row.tier];
    if (!label) return { error: `Row ${index + 1} needs an account name.` };
    if (!family) return { error: `Row ${index + 1} needs a password family label.` };
    if (!tier) return { error: `Row ${index + 1} needs a valid account tier.` };
    cleaned.push({ label, family, tier, key: family.toLowerCase() });
  }

  const totalWeight = cleaned.reduce((sum, row) => sum + row.tier.weight, 0);

  const byFamily = new Map();
  cleaned.forEach((row) => {
    const bucket = byFamily.get(row.key) || { name: row.family, members: [] };
    bucket.members.push(row);
    byFamily.set(row.key, bucket);
  });

  const clusters = [...byFamily.values()]
    .map((bucket) => {
      const weight = bucket.members.reduce((sum, row) => sum + row.tier.weight, 0);
      const topTier = bucket.members.reduce(
        (best, row) => (row.tier.weight > best.weight ? row.tier : best),
        bucket.members[0].tier,
      );
      return {
        name: bucket.name,
        size: bucket.members.length,
        members: bucket.members,
        blastRadius: weight,
        blastPercent: totalWeight > 0 ? Math.round((weight / totalWeight) * 100) : 0,
        topTierId: topTier.id,
        topTierLabel: topTier.label,
        reused: bucket.members.length > 1,
      };
    })
    .sort((a, b) => b.blastRadius - a.blastRadius || b.size - a.size);

  const reusedClusters = clusters.filter((cluster) => cluster.reused);
  const accountsInReuse = reusedClusters.reduce((sum, cluster) => sum + cluster.size, 0);
  const exposedWeight = reusedClusters.reduce((sum, cluster) => sum + cluster.blastRadius, 0);
  const exposurePercent = totalWeight > 0 ? Math.round((exposedWeight / totalWeight) * 100) : 0;
  const band = bandFor(exposurePercent);

  const largestCluster = reusedClusters.reduce(
    (best, cluster) => (cluster.size > (best?.size ?? 0) ? cluster : best),
    null,
  );

  const keysReused = reusedClusters.some((cluster) =>
    cluster.members.some((row) => row.tier.id === "keys"),
  );

  const fixQueue = reusedClusters
    .flatMap((cluster) =>
      cluster.members.map((row) => ({
        label: row.label,
        family: cluster.name,
        tierId: row.tier.id,
        tierLabel: row.tier.label,
        weight: row.tier.weight,
        clusterSize: cluster.size,
        reason:
          row.tier.id === "keys"
            ? "Change first: password resets for your other accounts land here."
            : `Shares the "${cluster.name}" password with ${cluster.size - 1} other ${
                cluster.size - 1 === 1 ? "account" : "accounts"
              }.`,
      })),
    )
    .sort((a, b) => b.weight - a.weight || b.clusterSize - a.clusterSize);

  return {
    totalAccounts: cleaned.length,
    uniqueFamilies: clusters.length,
    reusedClusterCount: reusedClusters.length,
    accountsInReuse,
    reusePercent: cleaned.length > 0 ? Math.round((accountsInReuse / cleaned.length) * 100) : 0,
    exposurePercent,
    exposedWeight,
    totalWeight,
    bandId: band.id,
    bandLabel: band.label,
    bandAdvice: band.advice,
    keysReused,
    largestClusterName: largestCluster ? largestCluster.name : null,
    largestClusterSize: largestCluster ? largestCluster.size : 0,
    clusters,
    fixQueue,
    estimatedMinutes: fixQueue.length * MINUTES_PER_CHANGE,
  };
}
