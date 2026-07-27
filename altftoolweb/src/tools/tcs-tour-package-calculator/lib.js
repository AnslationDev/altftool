/**
 * Section 206C(1G) of the Income-tax Act, 1961 — tax collected at source by a
 * seller of an overseas tour programme package.
 *
 * An "overseas tour programme package" is defined in the Explanation to
 * section 206C(1G) as a tour package offering a visit to a country outside
 * India, and includes expenses for travel, hotel stay, boarding or lodging, or
 * any similar expense.
 *
 * Rate history implemented here:
 *  - 1 October 2020 to 30 September 2023: a flat 5% with no threshold.
 *  - 1 October 2023 to 31 March 2025: 5% on the first Rs 7,00,000 of the
 *    financial-year aggregate and 20% on the balance.
 *  - From 1 April 2025 (Finance Act 2025): the same two slabs with the
 *    threshold raised from Rs 7,00,000 to Rs 10,00,000.
 *
 * TCS is NOT an extra tax. It is credited against the buyer's income-tax
 * liability, shows up in Form 26AS and the AIS, and is refundable if the buyer
 * owes less. Since 1 October 2024 a salaried buyer can report it to the
 * employer so it is adjusted against salary TDS under section 192(2B).
 */

/** Slab rates in section 206C(1G) for tour packages. */
export const LOW_SLAB_RATE = 5;
export const HIGH_SLAB_RATE = 20;

/** Section 206CC: twice the rate or 5%, whichever is higher, without a PAN. */
export const NO_PAN_MULTIPLIER = 2;
export const NO_PAN_FLOOR_RATE = 5;

/** Rate regimes, newest first. `from` is the first date the regime applies. */
export const RATE_REGIMES = [
  {
    id: "fy2025",
    from: "2025-04-01",
    threshold: 1000000,
    lowRate: LOW_SLAB_RATE,
    highRate: HIGH_SLAB_RATE,
    label: "From 1 April 2025 — 5% up to Rs 10,00,000, 20% above",
  },
  {
    id: "oct2023",
    from: "2023-10-01",
    threshold: 700000,
    lowRate: LOW_SLAB_RATE,
    highRate: HIGH_SLAB_RATE,
    label: "1 Oct 2023 to 31 Mar 2025 — 5% up to Rs 7,00,000, 20% above",
  },
  {
    id: "oct2020",
    from: "2020-10-01",
    threshold: Infinity,
    lowRate: LOW_SLAB_RATE,
    highRate: LOW_SLAB_RATE,
    label: "1 Oct 2020 to 30 Sep 2023 — flat 5%, no threshold",
  },
];

/** Buyers on whom no TCS is collected under section 206C(1G). */
export const EXEMPT_BUYERS = [
  "Central Government or a State Government",
  "An embassy, High Commission, legation, consulate or trade representation of a foreign State",
  "A local authority as defined in the Explanation to section 10(20)",
  "A buyer who is liable to deduct tax at source on the same payment and has done so",
];

const round2 = (value) => Math.round(value * 100) / 100;
const isIsoDate = (value) =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);

/** Regime in force on a purchase date, or null if before 1 October 2020. */
export function regimeForDate(isoDate) {
  if (!isIsoDate(isoDate)) return null;
  return RATE_REGIMES.find((regime) => isoDate >= regime.from) || null;
}

/**
 * Compute TCS on an overseas tour programme package.
 *
 * @param {object} input
 * @param {number} input.packageAmount        Value of this package (Rs).
 * @param {number} input.priorPurchasesThisFy Tour packages already bought from this seller in the same FY (Rs).
 * @param {string} input.purchaseDate         ISO date of payment for the package.
 * @param {boolean} input.panFurnished        Whether the buyer gave a PAN or Aadhaar.
 * @param {boolean} input.buyerExempt         Whether the buyer is in the exempt list.
 * @returns {object} result, or { error } when the input is unusable.
 */
export function computeTcsTourPackage({
  packageAmount,
  priorPurchasesThisFy = 0,
  purchaseDate = "2026-05-10",
  panFurnished = true,
  buyerExempt = false,
} = {}) {
  if (!Number.isFinite(packageAmount) || !Number.isFinite(priorPurchasesThisFy)) {
    return { error: "Enter the package amounts as numbers." };
  }
  if (packageAmount < 0 || priorPurchasesThisFy < 0) {
    return { error: "Package amounts cannot be negative." };
  }
  if (packageAmount === 0) {
    return { error: "Enter a package value greater than zero." };
  }
  if (packageAmount > 1e11 || priorPurchasesThisFy > 1e11) {
    return { error: "That package value is unrealistically large — check the figure you entered." };
  }
  if (!isIsoDate(purchaseDate)) {
    return { error: "Enter the purchase date as YYYY-MM-DD." };
  }

  const regime = regimeForDate(purchaseDate);
  if (!regime) {
    return {
      error:
        "TCS on overseas tour packages began on 1 October 2020. Choose a purchase date on or after that.",
    };
  }

  const aggregate = round2(priorPurchasesThisFy + packageAmount);
  const lowRate = panFurnished
    ? regime.lowRate
    : Math.max(regime.lowRate * NO_PAN_MULTIPLIER, NO_PAN_FLOOR_RATE);
  const highRate = panFurnished
    ? regime.highRate
    : Math.max(regime.highRate * NO_PAN_MULTIPLIER, NO_PAN_FLOOR_RATE);

  const shared = {
    packageAmount: round2(packageAmount),
    priorPurchases: round2(priorPurchasesThisFy),
    aggregate,
    regimeId: regime.id,
    regimeLabel: regime.label,
    threshold: Number.isFinite(regime.threshold) ? regime.threshold : null,
    lowRate,
    highRate,
    statutoryLowRate: regime.lowRate,
    statutoryHighRate: regime.highRate,
    purchaseDate,
    panFurnished,
  };

  if (buyerExempt) {
    return {
      ...shared,
      amountAtLowRate: 0,
      amountAtHighRate: 0,
      tcs: 0,
      totalPayable: round2(packageAmount),
      effectiveRate: 0,
      thresholdRemaining: 0,
      reason:
        "No TCS is collected. Governments, foreign missions, local authorities and buyers who have already deducted TDS on the same payment are outside section 206C(1G).",
    };
  }

  // Split this purchase across the low and high slabs using the headroom left
  // in the financial-year threshold after the earlier purchases.
  const headroom = Number.isFinite(regime.threshold)
    ? Math.max(0, regime.threshold - priorPurchasesThisFy)
    : Infinity;
  const amountAtLowRate = round2(Math.min(packageAmount, headroom));
  const amountAtHighRate = round2(packageAmount - amountAtLowRate);

  const tcs = round2(
    (amountAtLowRate * lowRate) / 100 + (amountAtHighRate * highRate) / 100,
  );
  const effectiveRate = round2((tcs / packageAmount) * 100);

  let reason;
  if (!Number.isFinite(regime.threshold)) {
    reason = `A flat ${lowRate}% was collected on overseas tour packages in this period, with no exemption threshold.`;
  } else if (amountAtHighRate <= 0) {
    reason = `The year's tour package spend of Rs ${aggregate.toLocaleString("en-IN")} is inside the Rs ${regime.threshold.toLocaleString("en-IN")} slab, so the whole package is collected at ${lowRate}%.`;
  } else if (amountAtLowRate <= 0) {
    reason = `Earlier purchases already used up the Rs ${regime.threshold.toLocaleString("en-IN")} slab, so this entire package is collected at ${highRate}%.`;
  } else {
    reason = `Rs ${amountAtLowRate.toLocaleString("en-IN")} of this package falls in the ${lowRate}% slab and the remaining Rs ${amountAtHighRate.toLocaleString("en-IN")} crosses into the ${highRate}% slab.`;
  }
  if (!panFurnished) {
    reason += ` No PAN or Aadhaar was furnished, so section 206CC applies the higher of twice the rate or ${NO_PAN_FLOOR_RATE}%.`;
  }

  return {
    ...shared,
    amountAtLowRate,
    amountAtHighRate,
    tcs,
    totalPayable: round2(packageAmount + tcs),
    effectiveRate,
    thresholdRemaining: Number.isFinite(headroom)
      ? round2(Math.max(0, headroom - amountAtLowRate))
      : null,
    reason,
  };
}
