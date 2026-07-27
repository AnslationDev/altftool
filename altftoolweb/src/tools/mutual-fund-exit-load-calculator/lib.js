/**
 * Mutual fund exit load maths.
 *
 * Rules encoded here:
 *  - Exit load is a percentage of the REDEMPTION VALUE (units redeemed x
 *    applicable NAV), not of the gain, and it applies only when the units are
 *    redeemed inside the load period stated in the scheme information document.
 *  - Regulation 51A of the SEBI (Mutual Funds) Regulations, 1996 requires the
 *    exit load collected to be credited back to the scheme, so it is a cost to
 *    the exiting investor and a benefit to the remaining unitholders.
 *  - Most open-ended equity schemes allow a fixed share of the units held —
 *    conventionally 10% — to be redeemed inside the load period without any exit
 *    load. Only the balance attracts the load.
 *  - Units are taken out on a first-in first-out basis for load purposes, so the
 *    holding period of the oldest units governs.
 *  - Securities Transaction Tax on the redemption of units of an EQUITY-ORIENTED
 *    fund back to the fund is 0.001% of the redemption value, paid by the
 *    seller (Chapter VII of the Finance (No. 2) Act, 2004, as amended by the
 *    Finance Act, 2013). STT does not apply to non equity-oriented schemes.
 *
 * The holding period is passed in as a number of days; nothing here reads the
 * clock.
 */

/** STT on redemption of an equity-oriented fund's units to the fund, in %. */
export const STT_EQUITY_REDEMPTION_PERCENT = 0.001;

/** Conventional share of units redeemable without exit load, in %. */
export const DEFAULT_FREE_EXIT_ALLOWANCE_PERCENT = 10;

/** Common exit load structures used as interface presets. */
export const LOAD_PRESETS = [
  { label: "Equity fund — 1% within 1 year", loadPercent: 1, loadDays: 365, freePercent: 10 },
  { label: "ELSS — no load (3-year lock-in)", loadPercent: 0, loadDays: 0, freePercent: 0 },
  { label: "Liquid fund — graded, day 1 to 6", loadPercent: 0.0045, loadDays: 6, freePercent: 0 },
  { label: "Short duration debt — 0.25% within 90 days", loadPercent: 0.25, loadDays: 90, freePercent: 0 },
  { label: "Hybrid fund — 1% within 12 months", loadPercent: 1, loadDays: 365, freePercent: 10 },
];

/** Highest exit load this calculator will accept, in %. */
export const MAX_LOAD_PERCENT = 7;

/** Longest load period this calculator will accept, in days (5 years). */
export const MAX_LOAD_DAYS = 1826;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Compute the exit load and net redemption proceeds.
 *
 * @param {object} input
 * @param {number} input.unitsHeld total units in the folio
 * @param {number} input.unitsRedeemed units being redeemed now
 * @param {number} input.purchaseNav NAV at which the units were bought
 * @param {number} input.currentNav applicable NAV for the redemption
 * @param {number} input.holdingDays days from allotment to redemption
 * @param {number} input.loadPercent exit load rate in the scheme document
 * @param {number} input.loadDays load period in days
 * @param {number} [input.freeExitPercent] share of units exempt from the load
 * @param {boolean} [input.equityOriented] true if the scheme is equity-oriented
 * @returns {object} breakdown, or { error } when the input is unusable
 */
export function computeExitLoad({
  unitsHeld,
  unitsRedeemed,
  purchaseNav,
  currentNav,
  holdingDays,
  loadPercent,
  loadDays,
  freeExitPercent = DEFAULT_FREE_EXIT_ALLOWANCE_PERCENT,
  equityOriented = true,
} = {}) {
  const numbers = [
    unitsHeld,
    unitsRedeemed,
    purchaseNav,
    currentNav,
    holdingDays,
    loadPercent,
    loadDays,
    freeExitPercent,
  ];
  if (!numbers.every(isNum)) {
    return { error: "Enter a valid number in every field." };
  }
  if (numbers.some((value) => value < 0)) {
    return { error: "Units, NAVs, days and percentages cannot be negative." };
  }
  if (unitsHeld <= 0) {
    return { error: "Enter the number of units you hold." };
  }
  if (unitsRedeemed <= 0) {
    return { error: "Enter the number of units you are redeeming." };
  }
  if (unitsRedeemed > unitsHeld) {
    return { error: "You cannot redeem more units than you hold." };
  }
  if (currentNav <= 0 || purchaseNav <= 0) {
    return { error: "NAV must be greater than zero." };
  }
  if (currentNav > 1e6 || purchaseNav > 1e6 || unitsHeld > 1e9) {
    return { error: "Enter realistic units and NAV values." };
  }
  if (loadPercent > MAX_LOAD_PERCENT) {
    return { error: `Exit load should be ${MAX_LOAD_PERCENT}% or less.` };
  }
  if (loadDays > MAX_LOAD_DAYS || holdingDays > 36500) {
    return { error: "Enter a load period of up to 5 years and a holding period of up to 100 years." };
  }
  if (freeExitPercent > 100) {
    return { error: "The free-exit allowance cannot exceed 100% of the units held." };
  }

  const redemptionValue = unitsRedeemed * currentNav;
  const costValue = unitsRedeemed * purchaseNav;
  const grossGain = redemptionValue - costValue;

  const insideLoadPeriod = holdingDays < loadDays && loadPercent > 0;
  const freeUnitsAllowed = (unitsHeld * freeExitPercent) / 100;
  const freeUnitsUsed = insideLoadPeriod ? Math.min(unitsRedeemed, freeUnitsAllowed) : unitsRedeemed;
  const unitsCharged = insideLoadPeriod ? Math.max(0, unitsRedeemed - freeUnitsAllowed) : 0;

  const chargeableValue = unitsCharged * currentNav;
  const exitLoad = (chargeableValue * loadPercent) / 100;

  const sttRate = equityOriented ? STT_EQUITY_REDEMPTION_PERCENT : 0;
  const stt = (redemptionValue * sttRate) / 100;

  const netProceeds = redemptionValue - exitLoad - stt;
  const daysToWait = insideLoadPeriod ? Math.max(0, Math.ceil(loadDays - holdingDays)) : 0;

  return {
    unitsHeld,
    unitsRedeemed,
    holdingDays,
    loadPercent,
    loadDays,
    freeExitPercent,
    equityOriented,
    insideLoadPeriod,
    redemptionValue,
    costValue,
    grossGain,
    freeUnitsAllowed,
    freeUnitsUsed,
    unitsCharged,
    chargeableValue,
    exitLoad,
    sttRate,
    stt,
    totalDeductions: exitLoad + stt,
    netProceeds,
    netGain: netProceeds - costValue,
    /** Total deductions as a share of the redemption value. */
    deductionPercent: redemptionValue > 0 ? ((exitLoad + stt) / redemptionValue) * 100 : 0,
    /** Days still to run before the load falls away. */
    daysToWait,
    /** Money saved by waiting out the load period, ignoring any NAV movement. */
    savingIfYouWait: exitLoad,
  };
}

/**
 * Units bought for a given amount at a given NAV.
 * @param {number} amount rupees invested
 * @param {number} nav purchase NAV
 * @returns {number} units, or 0 when the input is unusable
 */
export function unitsFromAmount(amount, nav) {
  if (!isNum(amount) || !isNum(nav) || nav <= 0 || amount <= 0) return 0;
  return amount / nav;
}
