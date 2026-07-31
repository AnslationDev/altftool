/**
 * Netlify credit-based plan cost model (Free / Personal / Pro).
 *
 * Netlify replaced its old per-seat pricing plus separate bandwidth,
 * build-minute and function-invocation overage blocks with a unified
 * credits system, then removed per-seat charges from Pro entirely on
 * 2026-04-14 ("The end of seats: pricing Netlify for 3 billion builders").
 * Every plan now includes a monthly credit allowance; bandwidth, function
 * compute, production deploys and web requests all draw from the same
 * pool. Going over the included credits tops up via discrete auto-recharge
 * packs (Personal: 500 credits per $5, Pro: 1,500 credits per $10); Free
 * has no recharge option and simply pauses projects at the cap instead.
 *
 * Figures below reflect netlify.com/pricing and Netlify's credit-based
 * pricing docs as of 2026-07. Netlify revises pricing periodically —
 * treat this as an estimate and confirm current rates at netlify.com/pricing
 * before budgeting.
 */

export const PLANS = [
  {
    id: "free",
    label: "Free",
    // Free: $0, 300 credits/month, single owner only, no team seats,
    // no auto-recharge — projects pause once credits run out.
    basePrice: 0,
    includedCredits: 300,
    recharge: null,
    seats: "Single owner only",
  },
  {
    id: "personal",
    label: "Personal",
    // Personal: $9/month, 1,000 credits/month, single owner only.
    basePrice: 9,
    includedCredits: 1000,
    recharge: { credits: 500, price: 5 },
    seats: "Single owner only",
  },
  {
    id: "pro",
    label: "Pro",
    // Pro's base price and included credits depend on the selected
    // credit tier (see PRO_CREDIT_TIERS) — unlimited team members are
    // included at every tier with no per-seat charge.
    basePrice: null,
    includedCredits: null,
    recharge: { credits: 1500, price: 10 },
    seats: "Unlimited team members included",
  },
];

/**
 * Pro plan monthly credit tiers. Rollover of unused credits to the next
 * billing cycle is only available on tiers of 5,000 credits or more.
 */
export const PRO_CREDIT_TIERS = [
  { credits: 3000, price: 20, rollover: false },
  { credits: 5000, price: 33, rollover: true },
  { credits: 10000, price: 63, rollover: true },
  { credits: 15000, price: 95, rollover: true },
  { credits: 20000, price: 126, rollover: true },
];

export const DEFAULT_PRO_CREDIT_TIER = 3000;

/**
 * Credit rates per unit of usage, shared by every plan
 * (netlify.com/pricing, "Credit-based pricing plans").
 * Deploy previews, branch deploys and failed deploys are NOT metered —
 * only production deploys consume credits.
 */
export const CREDIT_RATES = {
  bandwidthPerGb: 20,
  computePerGbHour: 10,
  deployEach: 15,
  requestsPer10k: 2,
};

/**
 * Compute the estimated monthly Netlify bill under the credit-based model.
 *
 * @param {object} input
 * @param {string} input.planId          "free", "personal" or "pro".
 * @param {number} [input.proCreditTier] Pro plan's monthly credit tier (required when planId is "pro").
 * @param {number} input.bandwidthGb     Bandwidth used, GB/month.
 * @param {number} input.computeGbHours  Function/edge/background compute used, GB-hours/month.
 * @param {number} input.deploys         Production deploys per month.
 * @param {number} input.webRequests     Web requests served per month.
 * @returns {object} cost breakdown, or { error } for invalid input.
 */
export function computeNetlifyCost({
  planId,
  proCreditTier,
  bandwidthGb,
  computeGbHours,
  deploys,
  webRequests,
}) {
  const plan = PLANS.find((p) => p.id === planId);
  if (!plan) return { error: "Choose a valid Netlify plan." };

  const bandwidth = Number(bandwidthGb);
  const compute = Number(computeGbHours);
  const deployCount = Number(deploys);
  const requests = Number(webRequests);

  if (!Number.isFinite(bandwidth) || bandwidth < 0) {
    return { error: "Bandwidth cannot be negative." };
  }
  if (!Number.isFinite(compute) || compute < 0) {
    return { error: "Function compute cannot be negative." };
  }
  if (!Number.isFinite(deployCount) || deployCount < 0 || !Number.isInteger(deployCount)) {
    return { error: "Production deploys must be a whole number of at least 0." };
  }
  if (!Number.isFinite(requests) || requests < 0) {
    return { error: "Web requests cannot be negative." };
  }

  let basePrice = plan.basePrice;
  let includedCredits = plan.includedCredits;

  if (plan.id === "pro") {
    const tier = PRO_CREDIT_TIERS.find((t) => t.credits === Number(proCreditTier));
    if (!tier) return { error: "Choose a valid Pro credit tier." };
    basePrice = tier.price;
    includedCredits = tier.credits;
  }

  const bandwidthCredits = bandwidth * CREDIT_RATES.bandwidthPerGb;
  const computeCredits = compute * CREDIT_RATES.computePerGbHour;
  const deployCredits = deployCount * CREDIT_RATES.deployEach;
  const requestCredits = (requests / 10_000) * CREDIT_RATES.requestsPer10k;

  const creditsUsed = bandwidthCredits + computeCredits + deployCredits + requestCredits;
  const creditsOver = Math.max(0, creditsUsed - includedCredits);

  let rechargePacks = 0;
  let rechargeCost = 0;
  let hardCapped = false;

  if (creditsOver > 0) {
    if (!plan.recharge) {
      hardCapped = true;
    } else {
      rechargePacks = Math.ceil(creditsOver / plan.recharge.credits);
      rechargeCost = rechargePacks * plan.recharge.price;
    }
  }

  const total = hardCapped ? null : basePrice + rechargeCost;

  return {
    planLabel: plan.label,
    basePrice,
    includedCredits,
    bandwidthCredits,
    computeCredits,
    deployCredits,
    requestCredits,
    creditsUsed,
    creditsOver,
    rechargePacks,
    rechargeCost,
    hardCapped,
    total,
  };
}
