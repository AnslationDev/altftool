/**
 * Netlify plan cost model (Free/Starter vs Pro).
 *
 * All figures are Netlify's published list prices and included allowances from
 * netlify.com/pricing. Overages bill in fixed blocks (e.g. bandwidth per
 * 100 GB block), so partial blocks round up — exactly as Netlify invoices.
 * Pricing changes over time — treat results as an estimate.
 */

export const PLANS = [
  {
    id: "free",
    label: "Free (Starter)",
    // Free plan: $0, single-member oriented; 100 GB bandwidth and
    // 300 build minutes included per month (netlify.com/pricing).
    memberPrice: 0,
    includedBandwidthGb: 100,
    includedBuildMinutes: 300,
  },
  {
    id: "pro",
    label: "Pro",
    // Pro: $19 per member per month; 1 TB bandwidth and 25,000 build
    // minutes included per month (netlify.com/pricing).
    memberPrice: 19,
    includedBandwidthGb: 1024,
    includedBuildMinutes: 25000,
  },
];

/** Extra bandwidth bills at $55 per 100 GB block (netlify.com/pricing). */
export const BANDWIDTH_BLOCK_GB = 100;
export const BANDWIDTH_BLOCK_PRICE = 55;

/** Extra build minutes bill at $7 per 500-minute block (netlify.com/pricing). */
export const BUILD_BLOCK_MINUTES = 500;
export const BUILD_BLOCK_PRICE = 7;

/**
 * Serverless functions: 125,000 synchronous invocations per site per month
 * included; beyond that the Functions add-on bills $25 per pack covering up
 * to 2 million invocations (Netlify Functions pricing tiers).
 */
export const INCLUDED_FUNCTION_INVOCATIONS = 125_000;
export const FUNCTION_PACK_INVOCATIONS = 2_000_000;
export const FUNCTION_PACK_PRICE = 25;

/**
 * Compute the estimated monthly Netlify bill.
 *
 * @param {object} input
 * @param {string} input.planId              "free" or "pro".
 * @param {number} input.members             Team members (seats).
 * @param {number} input.bandwidthGb         Bandwidth used, GB/month.
 * @param {number} input.buildMinutes        Build minutes used per month.
 * @param {number} input.functionInvocations Serverless function invocations per month.
 * @returns {object} cost breakdown, or { error } for invalid input.
 */
export function computeNetlifyCost({
  planId,
  members,
  bandwidthGb,
  buildMinutes,
  functionInvocations,
}) {
  const plan = PLANS.find((p) => p.id === planId);
  if (!plan) return { error: "Choose a valid Netlify plan." };

  const memberCount = Number(members);
  const bandwidth = Number(bandwidthGb);
  const builds = Number(buildMinutes);
  const invocations = Number(functionInvocations);

  if (!Number.isFinite(memberCount) || memberCount < 1 || !Number.isInteger(memberCount)) {
    return { error: "Team members must be a whole number of at least 1." };
  }
  if (plan.id === "free" && memberCount > 1) {
    return { error: "The Free plan is limited to a single member — switch to Pro for a team." };
  }
  if (!Number.isFinite(bandwidth) || bandwidth < 0) {
    return { error: "Bandwidth cannot be negative." };
  }
  if (!Number.isFinite(builds) || builds < 0) {
    return { error: "Build minutes cannot be negative." };
  }
  if (!Number.isFinite(invocations) || invocations < 0) {
    return { error: "Function invocations cannot be negative." };
  }

  const memberCost = memberCount * plan.memberPrice;

  const bandwidthOverGb = Math.max(0, bandwidth - plan.includedBandwidthGb);
  const bandwidthBlocks = Math.ceil(bandwidthOverGb / BANDWIDTH_BLOCK_GB);
  const bandwidthCost = bandwidthBlocks * BANDWIDTH_BLOCK_PRICE;

  const buildOverMinutes = Math.max(0, builds - plan.includedBuildMinutes);
  const buildBlocks = Math.ceil(buildOverMinutes / BUILD_BLOCK_MINUTES);
  const buildCost = buildBlocks * BUILD_BLOCK_PRICE;

  const invocationsOver = Math.max(0, invocations - INCLUDED_FUNCTION_INVOCATIONS);
  const functionPacks = Math.ceil(invocationsOver / FUNCTION_PACK_INVOCATIONS);
  const functionCost = functionPacks * FUNCTION_PACK_PRICE;

  const total = memberCost + bandwidthCost + buildCost + functionCost;

  return {
    planLabel: plan.label,
    memberCost,
    bandwidthOverGb,
    bandwidthBlocks,
    bandwidthCost,
    buildOverMinutes,
    buildBlocks,
    buildCost,
    invocationsOver,
    functionPacks,
    functionCost,
    includedBandwidthGb: plan.includedBandwidthGb,
    includedBuildMinutes: plan.includedBuildMinutes,
    total,
  };
}
