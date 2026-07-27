/**
 * No Claim Bonus (NCB) tracker for Indian motor insurance.
 *
 * Rule source: the NCB grid carried over from the erstwhile India Motor Tariff
 * (IRDAI) and used by every general insurer. The discount is applied ONLY to the
 * Own Damage (OD) portion of a private car / two-wheeler premium — never to the
 * mandatory Motor Third Party premium, which is notified by IRDAI and carries no
 * discount at all.
 *
 * Slab index = number of consecutive claim-free policy years completed.
 */

/** NCB percentage by consecutive claim-free years completed. Index 0 = fresh policy. */
export const NCB_SLABS = [0, 20, 25, 35, 45, 50];

/** NCB is capped at 50% no matter how many claim-free years follow. */
export const MAX_NCB_PERCENT = 50;

/** Maximum projection horizon the tool will model (keeps the table readable). */
export const MAX_PROJECTION_YEARS = 15;

/**
 * NCB lapses if the policy is not renewed within 90 days of expiry
 * (IRDAI-permitted grace for carrying the bonus forward).
 */
export const NCB_LAPSE_GRACE_DAYS = 90;

/**
 * Snap an arbitrary percentage to the highest valid slab that does not exceed it.
 * Returns { percent, index }.
 */
export function normaliseNcb(percent) {
  let index = 0;
  for (let i = 0; i < NCB_SLABS.length; i += 1) {
    if (NCB_SLABS[i] <= percent) index = i;
  }
  return { percent: NCB_SLABS[index], index };
}

/** Next slab index after one claim-free year (capped at the top slab). */
export function stepUp(index) {
  return Math.min(index + 1, NCB_SLABS.length - 1);
}

/** Own-damage premium payable after applying an NCB percentage. */
export function odAfterNcb(basePremium, ncbPercent) {
  return basePremium * (1 - ncbPercent / 100);
}

/**
 * Project the NCB ladder and own-damage outgo over several renewals.
 *
 * @param {object} input
 * @param {number} input.odPremium        Base own-damage premium before NCB, in INR.
 * @param {number} input.currentNcbPercent NCB enjoyed at the renewal happening now (0-50).
 * @param {number} input.years            Number of policy years to project (1-15).
 * @param {number} input.claimYear        Policy year in which a claim is lodged; 0 = no claim.
 * @param {number} input.claimAmount      Amount the insurer would pay for that claim, in INR.
 * @param {number} input.tpPremium        Third-party premium per year (no NCB applies), in INR.
 * @returns {object} projection or { error }
 */
export function projectNcb({
  odPremium,
  currentNcbPercent,
  years,
  claimYear = 0,
  claimAmount = 0,
  tpPremium = 0,
}) {
  const nums = [odPremium, currentNcbPercent, years, claimYear, claimAmount, tpPremium];
  if (nums.some((n) => typeof n !== "number" || !Number.isFinite(n))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (odPremium <= 0) {
    return { error: "Own damage premium must be greater than zero." };
  }
  if (tpPremium < 0 || claimAmount < 0) {
    return { error: "Premium and claim amounts cannot be negative." };
  }
  if (currentNcbPercent < 0 || currentNcbPercent > MAX_NCB_PERCENT) {
    return { error: `NCB must be between 0% and ${MAX_NCB_PERCENT}%.` };
  }
  const horizon = Math.round(years);
  if (horizon < 1 || horizon > MAX_PROJECTION_YEARS) {
    return { error: `Project between 1 and ${MAX_PROJECTION_YEARS} policy years.` };
  }
  const claimIn = Math.round(claimYear);
  if (claimIn < 0 || claimIn > horizon) {
    return { error: `The claim year must be 0 (no claim) or between 1 and ${horizon}.` };
  }

  const start = normaliseNcb(currentNcbPercent);

  const walk = (withClaim) => {
    const rows = [];
    let index = start.index;
    let totalOd = 0;

    for (let year = 1; year <= horizon; year += 1) {
      const ncbPercent = NCB_SLABS[index];
      const od = odAfterNcb(odPremium, ncbPercent);
      const saved = odPremium - od;
      totalOd += od;
      rows.push({
        year,
        ncbPercent,
        odPayable: od,
        discountValue: saved,
        totalPayable: od + tpPremium,
        claimed: withClaim && claimIn === year,
      });
      // A claim during this policy year wipes the bonus at the next renewal.
      index = withClaim && claimIn === year ? 0 : stepUp(index);
    }

    return { rows, totalOd, totalPremium: totalOd + tpPremium * horizon };
  };

  const noClaim = walk(false);
  const withClaim = claimIn > 0 ? walk(true) : noClaim;

  const extraPremium = withClaim.totalOd - noClaim.totalOd;
  const netBenefit = claimAmount - extraPremium;

  // Years needed to climb from a zero bonus back to the top slab.
  const yearsToMaxFromZero = NCB_SLABS.length - 1;
  const yearsBackToCurrent = Math.max(0, start.index);

  return {
    startNcbPercent: start.percent,
    snapped: start.percent !== currentNcbPercent,
    horizon,
    claimYear: claimIn,
    rows: noClaim.rows,
    claimRows: claimIn > 0 ? withClaim.rows : null,
    totalOdNoClaim: noClaim.totalOd,
    totalOdWithClaim: withClaim.totalOd,
    totalPremiumNoClaim: noClaim.totalPremium,
    totalPremiumWithClaim: withClaim.totalPremium,
    extraPremium,
    claimAmount,
    netBenefit,
    worthClaiming: claimIn === 0 ? null : netBenefit > 0,
    thisYearDiscount: odPremium - odAfterNcb(odPremium, start.percent),
    nextNcbPercent: NCB_SLABS[stepUp(start.index)],
    yearsToMaxFromZero,
    yearsBackToCurrent,
  };
}
