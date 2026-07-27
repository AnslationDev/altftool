/**
 * Singapore Goods and Services Tax (GST).
 *
 * Rules implemented
 * -----------------
 * 1. Standard rate is 9% of the value of the supply, in force from 1 January 2024. The rate
 *    was 7% from 1 July 2007, 8% from 1 January 2023, and 9% from 1 January 2024 — the
 *    two-step increase announced in Budget 2022 and given effect under the Goods and
 *    Services Tax Act 1993.
 * 2. Zero-rated supplies — exports of goods and international services under sections 21(6)
 *    and 21(3) — are taxable supplies charged at 0%, so input tax can still be claimed.
 * 3. To reverse GST out of a GST-inclusive price, multiply by rate / (1 + rate). At 9% that
 *    is exactly 9/109; at 8% it is 8/108 (= 2/27); at 7% it is 7/107.
 * 4. Compulsory registration threshold: S$1 million of taxable turnover. Retrospective view
 *    — taxable turnover at the end of the calendar year exceeded S$1 million; prospective
 *    view — you reasonably expect it to exceed S$1 million in the next 12 months.
 *    First Schedule to the GST Act.
 * 5. Retrospective liability: notify IRAS by 30 January of the following year and
 *    registration takes effect on 1 March. Prospective liability: notify within 30 days of
 *    forming the expectation and registration takes effect on the 31st day.
 * 6. Prescribed accounting periods are quarterly by default; monthly and six-monthly
 *    filing are available on approval from IRAS.
 *
 * Nothing here is tax advice. Confirm rates, thresholds and dates with IRAS or a tax agent.
 */

/** Standard GST rate from 1 January 2024 — GST Act 1993. */
export const SG_GST_RATE_PERCENT = 9;

/** Compulsory registration threshold — First Schedule, GST Act 1993. */
export const SG_GST_REGISTRATION_THRESHOLD = 1000000;

/** Days to notify IRAS once the prospective test is met. */
export const SG_PROSPECTIVE_NOTIFY_DAYS = 30;

/** Selectable rates: the current rate, zero-rating, and the two prior standard rates. */
export const SG_GST_RATES = [
  { percent: 9, label: "9% — standard rate (from 1 Jan 2024)" },
  { percent: 0, label: "0% — zero-rated (exports, international services)" },
  { percent: 8, label: "8% — historical rate (1 Jan 2023 – 31 Dec 2023)" },
  { percent: 7, label: "7% — historical rate (1 Jul 2007 – 31 Dec 2022)" },
];

/** Sanity bound: Singapore GST has never exceeded 9%, so above 30% is certainly a typo. */
export const SG_GST_RATE_MAX_PERCENT = 30;

/** Round a money amount to the nearest cent, half away from zero. */
function roundCents(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function isBadNumber(value) {
  return typeof value !== "number" || !Number.isFinite(value);
}

/**
 * Express the reverse-GST factor as a plain fraction string, e.g. "9/109" at the 9% rate.
 * Used for display only; the arithmetic below uses the exact division.
 */
export function inclusiveFractionLabel(ratePercent) {
  if (isBadNumber(ratePercent) || ratePercent <= 0) return null;
  // Multiply both parts by 100 so a rate like 8.5 still yields whole numbers.
  const numerator = Math.round(ratePercent * 100);
  const denominator = Math.round((100 + ratePercent) * 100);
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(numerator, denominator) || 1;
  return `${numerator / divisor}/${denominator / divisor}`;
}

/**
 * Add GST to, or reverse GST out of, an amount.
 *
 * @param {object} input
 * @param {number} input.amount         Money amount entered.
 * @param {"add"|"remove"} [input.mode] "add" = amount is GST-exclusive; "remove" = inclusive.
 * @param {number} [input.ratePercent]  GST rate in percent (default 9).
 * @param {number} [input.quantity]     Number of identical units (default 1).
 * @returns {object} breakdown, or { error } for input that cannot produce a real answer.
 */
export function computeSingaporeGst(input = {}) {
  const { amount, mode = "add", ratePercent = SG_GST_RATE_PERCENT, quantity = 1 } = input;

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
  if (ratePercent > SG_GST_RATE_MAX_PERCENT) {
    return {
      error: `Singapore GST has never been higher than ${SG_GST_RATE_PERCENT}%. Enter the rate as a percentage, for example 9.`,
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
    inclusiveFraction: inclusiveFractionLabel(ratePercent),
    gstShareOfInclusivePercent:
      inclusiveRounded > 0 ? roundCents((gstRounded / inclusiveRounded) * 100) : 0,
  };
}

/**
 * Test taxable turnover against the S$1 million compulsory registration threshold on both the
 * retrospective (past calendar year) and prospective (next 12 months) bases.
 *
 * @param {object} input
 * @param {number} input.pastYearTurnover  Taxable turnover for the past calendar year, SGD.
 * @param {number} input.nextYearTurnover  Expected taxable turnover for the next 12 months, SGD.
 * @returns {object} liability summary, or { error }.
 */
export function checkSingaporeRegistration(input = {}) {
  const { pastYearTurnover, nextYearTurnover } = input;

  if (isBadNumber(pastYearTurnover) || isBadNumber(nextYearTurnover)) {
    return { error: "Enter both your past-year and expected next-12-month taxable turnover." };
  }
  if (pastYearTurnover < 0 || nextYearTurnover < 0) {
    return { error: "Taxable turnover cannot be negative." };
  }

  const retrospective = pastYearTurnover > SG_GST_REGISTRATION_THRESHOLD;
  const prospective = nextYearTurnover > SG_GST_REGISTRATION_THRESHOLD;
  const higher = Math.max(pastYearTurnover, nextYearTurnover);

  let basis = "None — registration is voluntary at this turnover.";
  let action =
    "You may register voluntarily. IRAS expects voluntary registrants to stay registered for at least two years.";
  if (retrospective) {
    basis = "Retrospective — past calendar year taxable turnover exceeded S$1 million.";
    action =
      "Notify IRAS by 30 January of the following year; registration takes effect on 1 March.";
  } else if (prospective) {
    basis = "Prospective — you expect to exceed S$1 million in the next 12 months.";
    action = `Notify IRAS within ${SG_PROSPECTIVE_NOTIFY_DAYS} days of forming that expectation; registration takes effect on the 31st day.`;
  }

  return {
    pastYearTurnover: roundCents(pastYearTurnover),
    nextYearTurnover: roundCents(nextYearTurnover),
    threshold: SG_GST_REGISTRATION_THRESHOLD,
    retrospective,
    prospective,
    mustRegister: retrospective || prospective,
    basis,
    action,
    headroom: roundCents(Math.max(0, SG_GST_REGISTRATION_THRESHOLD - higher)),
    excess: roundCents(Math.max(0, higher - SG_GST_REGISTRATION_THRESHOLD)),
  };
}
