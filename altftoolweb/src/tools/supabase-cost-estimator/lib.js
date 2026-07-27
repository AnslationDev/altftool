/**
 * Supabase pricing model, encoded from the published price list at
 * supabase.com/pricing (Free and Pro plans, USD, last checked mid-2025).
 * Supabase bills a flat Pro base fee plus metered overages above the
 * included quotas, and credits the first $10 of compute each month.
 * Prices change; treat the output as an estimate, not a quote.
 */

/** Pro plan base fee per month (USD) — supabase.com/pricing "Pro $25/month". */
export const PRO_BASE_USD = 25;

/** Monthly compute credit included with Pro (USD) — covers the Micro instance. */
export const PRO_COMPUTE_CREDIT_USD = 10;

/** Free plan included quotas — supabase.com/pricing Free tier column. */
export const FREE_QUOTAS = {
  dbGb: 0.5, // 500 MB database space
  egressGb: 5, // 5 GB egress
  storageGb: 1, // 1 GB file storage
  mau: 50000, // 50,000 monthly active users
  invocations: 500000, // 500K edge function invocations
};

/** Pro plan included quotas — supabase.com/pricing Pro tier column. */
export const PRO_QUOTAS = {
  dbGb: 8, // 8 GB disk size per project
  egressGb: 250, // 250 GB egress
  storageGb: 100, // 100 GB file storage
  mau: 100000, // 100,000 monthly active users
  invocations: 2000000, // 2M edge function invocations
};

/** Pro overage rates — supabase.com/pricing "then $x per ..." lines. */
export const PRO_OVERAGE_RATES = {
  dbPerGb: 0.125, // $0.125 per GB-month of database space beyond 8 GB
  egressPerGb: 0.09, // $0.09 per GB of egress beyond 250 GB
  storagePerGb: 0.021, // $0.021 per GB-month of file storage beyond 100 GB
  perMau: 0.00325, // $0.00325 per MAU beyond 100,000
  perMillionInvocations: 2, // $2 per 1M edge invocations beyond 2M
};

/**
 * Dedicated compute instance add-ons — supabase.com/pricing compute table.
 * The $10 Pro compute credit offsets the first $10 of whichever tier runs.
 */
export const COMPUTE_TIERS = [
  { id: "micro", label: "Micro — 1 GB RAM, 2-core (shared)", usd: 10 },
  { id: "small", label: "Small — 2 GB RAM, 2-core (shared)", usd: 15 },
  { id: "medium", label: "Medium — 4 GB RAM, 2-core (shared)", usd: 60 },
  { id: "large", label: "Large — 8 GB RAM, 2-core (dedicated)", usd: 110 },
  { id: "xl", label: "XL — 16 GB RAM, 4-core", usd: 210 },
  { id: "2xl", label: "2XL — 32 GB RAM, 8-core", usd: 410 },
  { id: "4xl", label: "4XL — 64 GB RAM, 16-core", usd: 960 },
];

const round2 = (value) => Math.round(value * 100) / 100;

/**
 * Estimate the monthly Supabase bill for one project.
 *
 * @param {object} input
 * @param {number} input.dbGb          Database disk size in GB.
 * @param {number} input.egressGb      Monthly egress (bandwidth) in GB.
 * @param {number} input.storageGb     File storage in GB.
 * @param {number} input.mau           Monthly active auth users.
 * @param {number} input.invocations   Edge function invocations per month.
 * @param {string} input.computeTierId One of COMPUTE_TIERS ids.
 * @returns {object} breakdown, or { error } for invalid input.
 */
export function estimateSupabaseCost({
  dbGb,
  egressGb,
  storageGb,
  mau,
  invocations,
  computeTierId = "micro",
}) {
  const fields = [
    ["Database size", dbGb],
    ["Egress", egressGb],
    ["File storage", storageGb],
    ["Monthly active users", mau],
    ["Edge function invocations", invocations],
  ];
  for (const [label, value] of fields) {
    const n = Number(value);
    if (!Number.isFinite(n)) return { error: `${label} must be a number.` };
    if (n < 0) return { error: `${label} cannot be negative.` };
  }

  const tier = COMPUTE_TIERS.find((t) => t.id === computeTierId);
  if (!tier) return { error: "Choose a valid compute tier." };

  const usage = {
    dbGb: Number(dbGb),
    egressGb: Number(egressGb),
    storageGb: Number(storageGb),
    mau: Number(mau),
    invocations: Number(invocations),
  };

  const fitsFree =
    usage.dbGb <= FREE_QUOTAS.dbGb &&
    usage.egressGb <= FREE_QUOTAS.egressGb &&
    usage.storageGb <= FREE_QUOTAS.storageGb &&
    usage.mau <= FREE_QUOTAS.mau &&
    usage.invocations <= FREE_QUOTAS.invocations;

  const over = (used, included) => Math.max(0, used - included);

  const dbOverage = round2(over(usage.dbGb, PRO_QUOTAS.dbGb) * PRO_OVERAGE_RATES.dbPerGb);
  const egressOverage = round2(
    over(usage.egressGb, PRO_QUOTAS.egressGb) * PRO_OVERAGE_RATES.egressPerGb,
  );
  const storageOverage = round2(
    over(usage.storageGb, PRO_QUOTAS.storageGb) * PRO_OVERAGE_RATES.storagePerGb,
  );
  const mauOverage = round2(over(usage.mau, PRO_QUOTAS.mau) * PRO_OVERAGE_RATES.perMau);
  const invocationOverage = round2(
    (over(usage.invocations, PRO_QUOTAS.invocations) / 1000000) *
      PRO_OVERAGE_RATES.perMillionInvocations,
  );

  const computeAfterCredit = round2(Math.max(0, tier.usd - PRO_COMPUTE_CREDIT_USD));

  const proTotal = round2(
    PRO_BASE_USD +
      computeAfterCredit +
      dbOverage +
      egressOverage +
      storageOverage +
      mauOverage +
      invocationOverage,
  );

  return {
    fitsFree,
    freeCost: 0,
    proBase: PRO_BASE_USD,
    computeTier: tier.label,
    computeListPrice: tier.usd,
    computeCredit: Math.min(tier.usd, PRO_COMPUTE_CREDIT_USD),
    computeAfterCredit,
    dbOverage,
    egressOverage,
    storageOverage,
    mauOverage,
    invocationOverage,
    totalOverages: round2(
      dbOverage + egressOverage + storageOverage + mauOverage + invocationOverage,
    ),
    proTotal,
    yearlyProTotal: round2(proTotal * 12),
  };
}
