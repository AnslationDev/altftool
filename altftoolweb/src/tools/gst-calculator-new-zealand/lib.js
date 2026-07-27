/**
 * New Zealand Goods and Services Tax (GST).
 *
 * Rules implemented
 * -----------------
 * 1. Standard rate is 15% of the value of the supply. Section 8(1) of the Goods and Services
 *    Tax Act 1985 imposes GST "at the rate of 15%"; that rate took effect on 1 October 2010
 *    (it was 10% from 1 October 1986 and 12.5% from 1 July 1989).
 * 2. Zero-rated supplies (exports, going-concern sales, land sales between registered
 *    persons) are taxed at 0% but still count as taxable supplies — section 11/11A.
 * 3. To take GST out of a GST-inclusive price at 15%, multiply by 3/23. This is simply
 *    0.15 / 1.15 written as an exact fraction, which is why Inland Revenue publishes it as
 *    "multiply by 3 and divide by 23" rather than as a decimal.
 * 4. Compulsory registration threshold: NZ$60,000 of taxable supplies in any 12-month
 *    period, looking back over the last 12 months or forward over the next 12 —
 *    section 51(1) of the GST Act.
 * 5. Six-monthly filing is only available where taxable supplies are NZ$500,000 or less in
 *    a 12-month period; above NZ$24 million, monthly filing is compulsory — section 15.
 *
 * Nothing here is tax advice. Rates and thresholds change; confirm with Inland Revenue or
 * a chartered accountant before filing.
 */

/** Standard GST rate from 1 October 2010 — GST Act 1985 s 8(1). */
export const NZ_GST_RATE_PERCENT = 15;

/**
 * Exact fraction of a GST-inclusive price that is GST at the 15% rate.
 * 0.15 / 1.15 = 15/115 = 3/23. Inland Revenue publishes this as the shortcut.
 */
export const NZ_GST_INCLUSIVE_NUMERATOR = 3;
export const NZ_GST_INCLUSIVE_DENOMINATOR = 23;

/** Compulsory registration threshold in a 12-month period — GST Act 1985 s 51(1). */
export const NZ_GST_REGISTRATION_THRESHOLD = 60000;

/** Upper limit of taxable supplies for six-monthly returns — GST Act 1985 s 15. */
export const NZ_SIX_MONTHLY_FILING_LIMIT = 500000;

/** Above this level of taxable supplies, monthly returns are compulsory — s 15. */
export const NZ_MONTHLY_FILING_THRESHOLD = 24000000;

/** Selectable rates: the current rate, zero-rating, and the two historical rates. */
export const NZ_GST_RATES = [
  { percent: 15, label: "15% — standard rate (from 1 Oct 2010)" },
  { percent: 0, label: "0% — zero-rated supply (exports, going concern)" },
  { percent: 12.5, label: "12.5% — historical rate (1 Jul 1989 – 30 Sep 2010)" },
  { percent: 10, label: "10% — historical rate (1 Oct 1986 – 30 Jun 1989)" },
];

/** Sanity bound: no NZ GST rate has ever exceeded 15%, so treat anything above 30% as a typo. */
export const NZ_GST_RATE_MAX_PERCENT = 30;

/** Round a money amount to the nearest cent, half away from zero. */
function roundCents(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function isBadNumber(value) {
  return typeof value !== "number" || !Number.isFinite(value);
}

/**
 * Add GST to, or remove GST from, an amount.
 *
 * @param {object} input
 * @param {number} input.amount            The money amount typed in.
 * @param {"add"|"remove"} [input.mode]    "add" treats amount as GST-exclusive,
 *                                         "remove" treats it as GST-inclusive.
 * @param {number} [input.ratePercent]     GST rate in percent (default 15).
 * @param {number} [input.quantity]        Number of identical units (default 1).
 * @returns {object} breakdown, or { error } when the input cannot produce a real answer.
 */
export function computeNzGst(input = {}) {
  const { amount, mode = "add", ratePercent = NZ_GST_RATE_PERCENT, quantity = 1 } = input;

  if (isBadNumber(amount) || isBadNumber(ratePercent) || isBadNumber(quantity)) {
    return { error: "Enter a valid amount, GST rate and quantity." };
  }
  if (mode !== "add" && mode !== "remove") {
    return { error: 'Mode must be either "add" (GST-exclusive price) or "remove" (GST-inclusive price).' };
  }
  if (amount < 0) {
    return { error: "The amount cannot be negative." };
  }
  if (quantity <= 0) {
    return { error: "Quantity must be at least 1." };
  }
  if (ratePercent < 0) {
    return { error: "The GST rate cannot be negative." };
  }
  if (ratePercent > NZ_GST_RATE_MAX_PERCENT) {
    return {
      error: `New Zealand GST has never been higher than ${NZ_GST_RATE_PERCENT}%. Enter the rate as a percentage, for example 15.`,
    };
  }

  const rate = ratePercent / 100;
  const lineAmount = amount * quantity;

  let exclusive;
  let gst;
  if (mode === "add") {
    exclusive = lineAmount;
    gst = lineAmount * rate;
  } else {
    // Removing GST: exclusive = inclusive / (1 + rate); the GST share is rate / (1 + rate),
    // which at 15% is exactly 3/23.
    exclusive = lineAmount / (1 + rate);
    gst = lineAmount - exclusive;
  }

  const exclusiveRounded = roundCents(exclusive);
  const gstRounded = roundCents(gst);
  const inclusiveRounded = roundCents(exclusiveRounded + gstRounded);

  return {
    mode,
    ratePercent,
    quantity,
    unitAmount: roundCents(amount),
    exclusive: exclusiveRounded,
    gst: gstRounded,
    inclusive: inclusiveRounded,
    // The published shortcut: GST is 3/23 of a 15% GST-inclusive price.
    usesThreeTwentyThirds: ratePercent === NZ_GST_RATE_PERCENT,
    gstShareOfInclusivePercent:
      inclusiveRounded > 0 ? roundCents((gstRounded / inclusiveRounded) * 100) : 0,
  };
}

/**
 * Check taxable supplies against the compulsory registration threshold and report which
 * filing frequencies are open at that turnover.
 *
 * @param {number} turnover Taxable supplies in a 12-month period, in NZD.
 * @returns {object} { mustRegister, headroom, filingOptions } or { error }.
 */
export function checkNzRegistration(turnover) {
  if (isBadNumber(turnover)) {
    return { error: "Enter your taxable supplies for a 12-month period." };
  }
  if (turnover < 0) {
    return { error: "Taxable supplies cannot be negative." };
  }

  const mustRegister = turnover > NZ_GST_REGISTRATION_THRESHOLD;
  const filingOptions = [];
  if (turnover > NZ_MONTHLY_FILING_THRESHOLD) {
    filingOptions.push("Monthly (compulsory above $24 million)");
  } else {
    filingOptions.push("Monthly (optional)");
    filingOptions.push("Two-monthly");
    if (turnover <= NZ_SIX_MONTHLY_FILING_LIMIT) {
      filingOptions.push("Six-monthly (taxable supplies $500,000 or less)");
    }
  }

  return {
    turnover: roundCents(turnover),
    mustRegister,
    threshold: NZ_GST_REGISTRATION_THRESHOLD,
    headroom: roundCents(Math.max(0, NZ_GST_REGISTRATION_THRESHOLD - turnover)),
    excess: roundCents(Math.max(0, turnover - NZ_GST_REGISTRATION_THRESHOLD)),
    filingOptions,
  };
}
