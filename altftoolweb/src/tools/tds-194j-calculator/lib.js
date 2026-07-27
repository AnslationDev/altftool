/**
 * Section 194J of the Income-tax Act, 1961 — TDS on fees for professional or
 * technical services, royalty, non-compete fees and director's remuneration.
 *
 * Key statutory points implemented here:
 *  - Two rates: 10% is the general rate; 2% applies to fees for technical
 *    services that are not professional services, to royalty for the sale,
 *    distribution or exhibition of cinematographic films, and to payments to a
 *    payee engaged only in the business of operating a call centre.
 *  - The threshold in the first proviso is tested on the AGGREGATE paid or
 *    credited to one payee during the financial year, separately for each
 *    category of payment. Director's remuneration under 194J(1)(ba) has no
 *    threshold at all.
 *  - Finance Act 2025 raised the threshold from Rs 30,000 to Rs 50,000 with
 *    effect from 1 April 2025 (financial year 2025-26).
 *  - Section 206AA: if the payee does not furnish a PAN, tax is deducted at
 *    20% (the higher of the section rate, the rates in force, and 20%).
 *  - No surcharge or health and education cess is added to TDS on payments to
 *    a resident.
 */

/** Threshold in the first proviso to section 194J, by financial year. */
export const THRESHOLD_FY_2025_26_ONWARDS = 50000; // Finance Act 2025, w.e.f. 1 Apr 2025
export const THRESHOLD_UPTO_FY_2024_25 = 30000; // position up to 31 Mar 2025

/** Section 206AA rate where the payee has not furnished a PAN. */
export const NO_PAN_RATE = 20;

/** Tax-audit turnover limits in section 44AB that pull an individual/HUF into 194J. */
export const AUDIT_LIMIT_BUSINESS = 10000000; // Rs 1 crore (Rs 10 crore where cash receipts and payments are <= 5%)
export const AUDIT_LIMIT_PROFESSION = 5000000; // Rs 50 lakh

/**
 * Payment categories under section 194J.
 * `rate` is the statutory percentage; `hasThreshold` is false only for
 * director's remuneration, which is deducted from the first rupee.
 */
export const PAYMENT_NATURES = [
  {
    id: "professional",
    label: "Fees for professional services",
    rate: 10,
    hasThreshold: true,
    note: "Legal, medical, engineering, architectural, accountancy, technical consultancy, interior decoration, advertising and other notified professions.",
  },
  {
    id: "technical",
    label: "Fees for technical services (not professional)",
    rate: 2,
    hasThreshold: true,
    note: "Managerial, technical or consultancy services taxed at 2% since 1 April 2020.",
  },
  {
    id: "royalty",
    label: "Royalty",
    rate: 10,
    hasThreshold: true,
    note: "Royalty other than for cinematographic films.",
  },
  {
    id: "royalty-film",
    label: "Royalty for sale, distribution or exhibition of cinematographic films",
    rate: 2,
    hasThreshold: true,
    note: "Carved out of the 10% rate by the second proviso.",
  },
  {
    id: "non-compete",
    label: "Non-compete fee under section 28(va)",
    rate: 10,
    hasThreshold: true,
    note: "Consideration for not carrying on a business or profession.",
  },
  {
    id: "call-centre",
    label: "Payment to a payee operating only a call centre",
    rate: 2,
    hasThreshold: true,
    note: "Reduced to 2% by the Finance Act 2017.",
  },
  {
    id: "director",
    label: "Director's remuneration, sitting fees or commission (not salary)",
    rate: 10,
    hasThreshold: false,
    note: "Section 194J(1)(ba) — no threshold, deduct from the first rupee.",
  },
];

export function getNature(id) {
  return PAYMENT_NATURES.find((nature) => nature.id === id) || PAYMENT_NATURES[0];
}

/** Threshold that applies for the selected financial year. */
export function thresholdForFy(fyStartYear) {
  if (!Number.isFinite(fyStartYear)) return THRESHOLD_FY_2025_26_ONWARDS;
  return fyStartYear >= 2025 ? THRESHOLD_FY_2025_26_ONWARDS : THRESHOLD_UPTO_FY_2024_25;
}

const round2 = (value) => Math.round(value * 100) / 100;

/**
 * Compute section 194J TDS on one payment.
 *
 * @param {object} input
 * @param {number} input.paymentAmount        Amount being paid or credited now (Rs).
 * @param {number} input.priorPaymentsThisFy  Same-category amounts already paid to this payee in the FY (Rs).
 * @param {string} input.natureId             One of PAYMENT_NATURES[].id
 * @param {number} input.fyStartYear          Calendar year the financial year starts in, e.g. 2025 for FY 2025-26.
 * @param {boolean} input.panFurnished        Whether the payee gave a valid PAN.
 * @param {boolean} input.payerCovered        Whether the payer is required to deduct (see section 194J proviso).
 * @returns {object} result, or { error } when the input is unusable.
 */
export function computeTds194J({
  paymentAmount,
  priorPaymentsThisFy = 0,
  natureId = "professional",
  fyStartYear = 2025,
  panFurnished = true,
  payerCovered = true,
} = {}) {
  if (!Number.isFinite(paymentAmount) || !Number.isFinite(priorPaymentsThisFy)) {
    return { error: "Enter the payment amounts as numbers." };
  }
  if (paymentAmount < 0 || priorPaymentsThisFy < 0) {
    return { error: "Payment amounts cannot be negative." };
  }
  if (paymentAmount === 0 && priorPaymentsThisFy === 0) {
    return { error: "Enter a payment amount greater than zero." };
  }
  // A single 194J payment above Rs 1,000 crore is a typing slip, not a fee.
  if (paymentAmount > 1e13 || priorPaymentsThisFy > 1e13) {
    return { error: "That amount is unrealistically large — check the figure you entered." };
  }
  if (!Number.isFinite(fyStartYear) || fyStartYear < 2000 || fyStartYear > 2100) {
    return { error: "Choose a valid financial year." };
  }

  const nature = getNature(natureId);
  const threshold = nature.hasThreshold ? thresholdForFy(fyStartYear) : 0;
  const aggregate = round2(priorPaymentsThisFy + paymentAmount);
  const rate = panFurnished ? nature.rate : NO_PAN_RATE;

  if (!payerCovered) {
    return {
      rate: 0,
      appliedRate: 0,
      statutoryRate: nature.rate,
      threshold,
      aggregate,
      priorPayments: round2(priorPaymentsThisFy),
      paymentAmount: round2(paymentAmount),
      thresholdCrossed: nature.hasThreshold ? aggregate > threshold : true,
      deductionRequired: false,
      tdsOnThisPayment: 0,
      tdsAlreadyDeducted: 0,
      cumulativeTds: 0,
      netPayable: round2(paymentAmount),
      panFurnished,
      natureLabel: nature.label,
      reason:
        "An individual or HUF whose accounts are not subject to tax audit under section 44AB is outside section 194J. Section 194M may still apply at 5% if payments to one payee cross Rs 50 lakh in the year.",
    };
  }

  // The threshold is an exemption limit on the yearly aggregate, not a slab:
  // once the aggregate crosses it, tax is deducted on the whole aggregate.
  const thresholdCrossed = nature.hasThreshold ? aggregate > threshold : true;

  if (!thresholdCrossed) {
    return {
      rate,
      appliedRate: 0,
      statutoryRate: nature.rate,
      threshold,
      aggregate,
      priorPayments: round2(priorPaymentsThisFy),
      paymentAmount: round2(paymentAmount),
      thresholdCrossed: false,
      deductionRequired: false,
      tdsOnThisPayment: 0,
      tdsAlreadyDeducted: 0,
      cumulativeTds: 0,
      netPayable: round2(paymentAmount),
      headroom: round2(threshold - aggregate),
      panFurnished,
      natureLabel: nature.label,
      reason: `Payments to this payee total Rs ${aggregate.toLocaleString("en-IN")} for the year, which is within the Rs ${threshold.toLocaleString("en-IN")} exemption limit, so no tax is deducted yet.`,
    };
  }

  const priorCrossed = nature.hasThreshold ? priorPaymentsThisFy > threshold : true;
  const tdsAlreadyDeducted = priorCrossed ? round2((priorPaymentsThisFy * rate) / 100) : 0;
  const cumulativeTds = round2((aggregate * rate) / 100);
  const tdsOnThisPayment = round2(cumulativeTds - tdsAlreadyDeducted);

  return {
    rate,
    appliedRate: rate,
    statutoryRate: nature.rate,
    threshold,
    aggregate,
    priorPayments: round2(priorPaymentsThisFy),
    paymentAmount: round2(paymentAmount),
    thresholdCrossed: true,
    deductionRequired: tdsOnThisPayment > 0,
    tdsOnThisPayment,
    tdsAlreadyDeducted,
    cumulativeTds,
    netPayable: round2(paymentAmount - tdsOnThisPayment),
    headroom: 0,
    panFurnished,
    natureLabel: nature.label,
    reason: panFurnished
      ? `The yearly aggregate of Rs ${aggregate.toLocaleString("en-IN")} crosses the Rs ${threshold.toLocaleString("en-IN")} limit, so tax is deducted at ${rate}% on the whole aggregate, including amounts paid earlier in the year.`
      : `No PAN was furnished, so section 206AA forces deduction at ${NO_PAN_RATE}% instead of ${nature.rate}%.`,
  };
}

/**
 * Due date to deposit TDS deducted in a given month.
 * Rule 30: by the 7th of the following month, except March which is 30 April.
 * @param {number} monthIndex 0 = January ... 11 = December
 * @param {number} year Calendar year of deduction
 */
export function tdsDepositDueDate(monthIndex, year) {
  if (!Number.isInteger(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    return { error: "Month must be between January and December." };
  }
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    return { error: "Enter a valid year." };
  }
  if (monthIndex === 2) return { dueDate: `${year}-04-30` }; // March deduction
  const nextMonth = monthIndex === 11 ? 0 : monthIndex + 1;
  const nextYear = monthIndex === 11 ? year + 1 : year;
  return { dueDate: `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-07` };
}
