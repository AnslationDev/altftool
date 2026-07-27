/**
 * Break-even membership maths for creators.
 *
 * Membership platforms take a percentage of the gross pledge, and the payment
 * processor takes a second percentage plus a flat amount on every transaction.
 * Both come off the same gross price, so the money that actually reaches you is:
 *
 *   netPerMember = price x (1 - platformRate - processingRate) - processingFixed
 *
 * The flat processing amount is what makes cheap tiers inefficient: it is the
 * same on a 99 pledge as on a 999 one.
 *
 * With several tiers, the blended net is the share-weighted average:
 *
 *   blendedNet = SUM( share_i x netPerMember(price_i) )
 *   breakEvenMembers = ceil( monthlyCosts / blendedNet )
 *
 * Churn: to HOLD a member count N at a monthly churn rate c you must recruit
 * N x c replacements every month before any growth.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Shares are allowed to miss 100% by this much before it is called an error. */
export const SHARE_TOLERANCE = 0.01;

export const MAX_TIERS = 6;

/** What one member on a given tier is worth after both sets of fees. */
export function netPerMember({ price, platformFeePercent, processingFeePercent, processingFixed }) {
  if (
    !isNum(price) ||
    !isNum(platformFeePercent) ||
    !isNum(processingFeePercent) ||
    !isNum(processingFixed)
  ) {
    return { error: "Enter numbers for the price and the fees." };
  }
  if (price <= 0) return { error: "Tier price must be greater than zero." };
  if (processingFixed < 0) return { error: "The flat processing charge cannot be negative." };
  if (platformFeePercent < 0 || processingFeePercent < 0) {
    return { error: "Fee percentages cannot be negative." };
  }
  if (platformFeePercent + processingFeePercent >= 100) {
    return { error: "Platform and processing fees together must stay under 100%." };
  }

  const keptRate = 1 - platformFeePercent / 100 - processingFeePercent / 100;
  const platformCut = price * (platformFeePercent / 100);
  const processingCut = price * (processingFeePercent / 100) + processingFixed;
  const net = price * keptRate - processingFixed;

  return {
    price,
    net,
    platformCut,
    processingCut,
    totalFees: platformCut + processingCut,
    takeHomePercent: (net / price) * 100,
  };
}

/**
 * @param {object} input
 *   monthlyCosts        what one month of production costs you
 *   tiers               [{ name, price, sharePercent }] — shares must total 100
 *   platformFeePercent  membership platform's cut of the gross pledge
 *   processingFeePercent payment processor's percentage
 *   processingFixed     payment processor's flat charge per transaction
 *   monthlyChurnPercent share of members who cancel each month
 *   netNewPerMonth      members you realistically add each month
 */
export function computeBreakEven({
  monthlyCosts,
  tiers,
  platformFeePercent,
  processingFeePercent,
  processingFixed,
  monthlyChurnPercent = 0,
  netNewPerMonth = 0,
}) {
  if (!isNum(monthlyCosts) || monthlyCosts < 0) {
    return { error: "Monthly costs must be zero or more." };
  }
  if (!Array.isArray(tiers) || tiers.length === 0) {
    return { error: "Add at least one membership tier." };
  }
  if (tiers.length > MAX_TIERS) return { error: `Keep it to ${MAX_TIERS} tiers or fewer.` };
  if (!isNum(monthlyChurnPercent) || monthlyChurnPercent < 0 || monthlyChurnPercent >= 100) {
    return { error: "Monthly churn must be between 0% and 100%." };
  }
  if (!isNum(netNewPerMonth) || netNewPerMonth < 0) {
    return { error: "Members added per month cannot be negative." };
  }

  let shareTotal = 0;
  const rows = [];
  for (const tier of tiers) {
    if (!isNum(tier.sharePercent) || tier.sharePercent < 0 || tier.sharePercent > 100) {
      return { error: "Each tier's share of members must be between 0% and 100%." };
    }
    const detail = netPerMember({
      price: tier.price,
      platformFeePercent,
      processingFeePercent,
      processingFixed,
    });
    if (detail.error) return { error: detail.error };
    shareTotal += tier.sharePercent;
    rows.push({ name: tier.name, sharePercent: tier.sharePercent, ...detail });
  }

  if (Math.abs(shareTotal - 100) > SHARE_TOLERANCE) {
    return {
      error: `Tier shares add up to ${Math.round(shareTotal * 100) / 100}% — they must total 100%.`,
    };
  }

  const blendedNet = rows.reduce(
    (sum, row) => sum + (row.sharePercent / 100) * row.net,
    0,
  );
  const blendedGross = rows.reduce(
    (sum, row) => sum + (row.sharePercent / 100) * row.price,
    0,
  );

  if (blendedNet <= 0) {
    return {
      error:
        "After fees, the average member brings in nothing — raise the tier price or cut the flat processing charge.",
    };
  }

  const exactMembers = monthlyCosts / blendedNet;
  const breakEvenMembers = Math.ceil(exactMembers);
  const grossAtBreakEven = breakEvenMembers * blendedGross;
  const netAtBreakEven = breakEvenMembers * blendedNet;
  const feesAtBreakEven = grossAtBreakEven - netAtBreakEven;

  const replacementsPerMonth = Math.ceil(breakEvenMembers * (monthlyChurnPercent / 100));
  const monthsToBreakEven =
    netNewPerMonth > 0 ? Math.ceil(breakEvenMembers / netNewPerMonth) : null;

  return {
    rows: rows.map((row) => ({
      ...row,
      membersAtBreakEven: Math.round(breakEvenMembers * (row.sharePercent / 100)),
      netAtBreakEven: breakEvenMembers * (row.sharePercent / 100) * row.net,
    })),
    monthlyCosts,
    blendedNet,
    blendedGross,
    blendedTakeHomePercent: (blendedNet / blendedGross) * 100,
    exactMembers,
    breakEvenMembers,
    grossAtBreakEven,
    netAtBreakEven,
    feesAtBreakEven,
    surplusAtBreakEven: netAtBreakEven - monthlyCosts,
    replacementsPerMonth,
    grossSignupsNeeded: replacementsPerMonth + Math.round(netNewPerMonth),
    monthsToBreakEven,
  };
}

/**
 * Net income at an arbitrary member count, so you can check a target above or
 * below break-even.
 */
export function incomeAtMembers({ members, blendedNet, monthlyCosts }) {
  if (!isNum(members) || !isNum(blendedNet) || !isNum(monthlyCosts)) {
    return { error: "Enter a member count." };
  }
  if (members < 0) return { error: "Member count cannot be negative." };
  const net = members * blendedNet;
  return { members: Math.round(members), net, profit: net - monthlyCosts };
}
