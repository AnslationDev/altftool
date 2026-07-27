/**
 * Section 194H of the Income-tax Act, 1961 — TDS on commission or brokerage
 * paid to a resident.
 *
 * Rules implemented here:
 *  - Rate: 5% for payments made up to 30 September 2024; 2% for payments made
 *    on or after 1 October 2024 (Finance (No. 2) Act 2024).
 *  - Threshold: the second proviso exempts aggregate commission of Rs 15,000
 *    or less in a financial year up to FY 2024-25. The Finance Act 2025 raised
 *    that to Rs 20,000 with effect from 1 April 2025.
 *  - The threshold is tested on the FINANCIAL-YEAR AGGREGATE to one payee, and
 *    once crossed tax is deducted on the whole aggregate, not just the excess.
 *  - Payer: every person except an individual or HUF whose accounts were not
 *    subject to tax audit under section 44AB in the preceding financial year.
 *  - Carve-outs: insurance commission falls under section 194D, not 194H;
 *    "commission or brokerage" in Explanation (i) excludes professional
 *    services and transactions in securities; and the third proviso excludes
 *    commission paid by BSNL or MTNL to their public call office franchisees.
 *  - Section 206AA: 20% where the payee furnishes no PAN.
 *  - No surcharge or cess is added on payments to residents.
 */

/** Threshold from 1 April 2025 (Finance Act 2025). */
export const THRESHOLD_FY_2025_26_ONWARDS = 20000;

/** Threshold up to 31 March 2025. */
export const THRESHOLD_UPTO_FY_2024_25 = 15000;

/** Rate for payments made up to 30 September 2024. */
export const RATE_UPTO_30_SEP_2024 = 5;

/** Rate for payments made on or after 1 October 2024. */
export const RATE_FROM_1_OCT_2024 = 2;

/** Date the reduced rate took effect. */
export const RATE_CHANGE_DATE = "2024-10-01";

/** Section 206AA rate where no PAN is furnished. */
export const NO_PAN_RATE = 20;

/** Payment types that look like commission but sit outside section 194H. */
export const OUT_OF_SCOPE = [
  ["Insurance commission", "Falls under section 194D, with its own rate and threshold."],
  ["Brokerage on securities transactions", "Excluded by Explanation (i) to section 194H."],
  ["Professional or technical fees", "Covered by section 194J, usually at 10% or 2%."],
  ["BSNL and MTNL public call office franchise commission", "Excluded by the third proviso."],
  ["Trade discount on a principal-to-principal sale", "A discount on price is not commission at all."],
];

const round2 = (value) => Math.round(value * 100) / 100;
const inr = (value) => `Rs ${Number(value).toLocaleString("en-IN")}`;

const isIsoDate = (value) =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);

/**
 * Indian financial year a date falls in, expressed as its starting calendar year.
 * The financial year runs 1 April to 31 March, so 15 March 2026 belongs to FY 2025-26.
 * @param {string} isoDate ISO date string.
 */
export function financialYearStart(isoDate) {
  if (!isIsoDate(isoDate)) return null;
  const year = Number(isoDate.slice(0, 4));
  const month = Number(isoDate.slice(5, 7)); // 1 = January
  return month >= 4 ? year : year - 1;
}

/** Threshold applying to a payment made on the given date. */
export function thresholdForDate(isoDate) {
  const fyStart = financialYearStart(isoDate);
  if (fyStart === null) return THRESHOLD_FY_2025_26_ONWARDS;
  return fyStart >= 2025 ? THRESHOLD_FY_2025_26_ONWARDS : THRESHOLD_UPTO_FY_2024_25;
}

/** Statutory rate applying to a payment made on the given date. */
export function rateForDate(isoDate) {
  if (!isIsoDate(isoDate)) return RATE_FROM_1_OCT_2024;
  return isoDate < RATE_CHANGE_DATE ? RATE_UPTO_30_SEP_2024 : RATE_FROM_1_OCT_2024;
}

/**
 * Compute section 194H TDS on one commission or brokerage payment.
 *
 * @param {object} input
 * @param {number} input.paymentAmount       Commission or brokerage being paid or credited now (Rs).
 * @param {number} input.priorPaymentsThisFy Commission already paid to this payee in the same FY (Rs).
 * @param {string} input.paymentDate         ISO date of the payment or credit.
 * @param {boolean} input.panFurnished       Whether a valid PAN is on record.
 * @param {boolean} input.payerCovered       Whether the payer is bound to deduct under 194H.
 * @returns {object} result, or { error } when the input is unusable.
 */
export function computeTds194H({
  paymentAmount,
  priorPaymentsThisFy = 0,
  paymentDate = "2026-01-15",
  panFurnished = true,
  payerCovered = true,
} = {}) {
  if (!Number.isFinite(paymentAmount) || !Number.isFinite(priorPaymentsThisFy)) {
    return { error: "Enter the commission amounts as numbers." };
  }
  if (paymentAmount < 0 || priorPaymentsThisFy < 0) {
    return { error: "Commission amounts cannot be negative." };
  }
  if (paymentAmount === 0 && priorPaymentsThisFy === 0) {
    return { error: "Enter a commission amount greater than zero." };
  }
  if (paymentAmount > 1e13 || priorPaymentsThisFy > 1e13) {
    return { error: "That amount is unrealistically large — check the figure you entered." };
  }
  if (!isIsoDate(paymentDate)) {
    return { error: "Enter the payment date as YYYY-MM-DD." };
  }

  const fyStart = financialYearStart(paymentDate);
  const threshold = thresholdForDate(paymentDate);
  const statutoryRate = rateForDate(paymentDate);
  const rate = panFurnished ? statutoryRate : NO_PAN_RATE;
  const aggregate = round2(priorPaymentsThisFy + paymentAmount);

  const shared = {
    paymentAmount: round2(paymentAmount),
    priorPayments: round2(priorPaymentsThisFy),
    aggregate,
    threshold,
    statutoryRate,
    paymentDate,
    financialYearLabel: fyStart === null ? "" : `FY ${fyStart}-${String((fyStart + 1) % 100).padStart(2, "0")}`,
    panFurnished,
  };

  if (!payerCovered) {
    return {
      ...shared,
      appliedRate: 0,
      thresholdCrossed: aggregate > threshold,
      deductionRequired: false,
      tdsOnThisPayment: 0,
      tdsAlreadyDeducted: 0,
      cumulativeTds: 0,
      netPayable: round2(paymentAmount),
      headroom: 0,
      reason:
        "An individual or HUF whose accounts were not audited under section 44AB in the preceding year is not required to deduct under section 194H.",
    };
  }

  if (aggregate <= threshold) {
    return {
      ...shared,
      appliedRate: 0,
      thresholdCrossed: false,
      deductionRequired: false,
      tdsOnThisPayment: 0,
      tdsAlreadyDeducted: 0,
      cumulativeTds: 0,
      netPayable: round2(paymentAmount),
      headroom: round2(threshold - aggregate),
      reason: `Commission to this payee totals ${inr(aggregate)} for the year, within the ${inr(threshold)} exemption limit, so no tax is deducted yet.`,
    };
  }

  const priorCrossed = priorPaymentsThisFy > threshold;
  const tdsAlreadyDeducted = priorCrossed ? round2((priorPaymentsThisFy * rate) / 100) : 0;
  const cumulativeTds = round2((aggregate * rate) / 100);
  const tdsOnThisPayment = round2(cumulativeTds - tdsAlreadyDeducted);

  let reason = `The year's commission of ${inr(aggregate)} crosses the ${inr(threshold)} limit, so ${rate}% is deducted on the whole aggregate including amounts paid earlier in the year.`;
  if (!panFurnished) {
    reason += ` No PAN is on record, so section 206AA raises the rate from ${statutoryRate}% to ${NO_PAN_RATE}%.`;
  }

  return {
    ...shared,
    appliedRate: rate,
    thresholdCrossed: true,
    deductionRequired: tdsOnThisPayment > 0,
    tdsOnThisPayment,
    tdsAlreadyDeducted,
    cumulativeTds,
    netPayable: round2(paymentAmount - tdsOnThisPayment),
    headroom: 0,
    reason,
  };
}

/**
 * Commission implied by a sale value and a commission percentage — a common way
 * agents quote their fee before the deduction is worked out.
 * @param {number} saleValue Value of the underlying transaction (Rs).
 * @param {number} commissionPercent Agreed commission rate (%).
 */
export function commissionFromSale(saleValue, commissionPercent) {
  if (!Number.isFinite(saleValue) || !Number.isFinite(commissionPercent)) {
    return { error: "Enter the sale value and commission percentage as numbers." };
  }
  if (saleValue < 0) return { error: "Sale value cannot be negative." };
  if (commissionPercent < 0 || commissionPercent > 100) {
    return { error: "Commission percentage must be between 0 and 100." };
  }
  return { commission: round2((saleValue * commissionPercent) / 100) };
}
