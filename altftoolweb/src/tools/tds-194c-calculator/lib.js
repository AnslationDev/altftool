/**
 * Section 194C of the Income-tax Act, 1961 — TDS on payments to resident
 * contractors and sub-contractors for carrying out any "work".
 *
 * Rules implemented here:
 *  - Rate under section 194C(1)/(2): 1% where the payee is an individual or a
 *    Hindu Undivided Family, 2% where the payee is any other person (company,
 *    firm, LLP, AOP, BOI, society, trust).
 *  - Threshold in section 194C(5): no deduction while a single sum does not
 *    exceed Rs 30,000, but deduction becomes compulsory once the aggregate of
 *    such sums during the financial year exceeds Rs 1,00,000. Either test
 *    being breached triggers deduction.
 *  - Explanation (iv)(e) to section 194C: for manufacturing or supplying a
 *    product to customer specification using material purchased from that
 *    customer, tax is deducted on the invoice value EXCLUDING the value of
 *    material if that value is shown separately in the invoice; otherwise on
 *    the whole invoice value.
 *  - Section 194C(6): no deduction to a contractor in the business of plying,
 *    hiring or leasing goods carriages who owns ten or fewer goods carriages at
 *    any time during the year and furnishes a declaration together with a PAN.
 *  - Section 206AA: no PAN means deduction at 20%.
 *  - TDS is computed on the amount excluding GST where the GST component is
 *    shown separately in the invoice (CBDT Circular 23/2017).
 */

/** Single-payment ceiling in section 194C(5). */
export const SINGLE_PAYMENT_LIMIT = 30000;

/** Financial-year aggregate ceiling in the proviso to section 194C(5). */
export const ANNUAL_AGGREGATE_LIMIT = 100000;

/** Statutory rates. */
export const RATE_INDIVIDUAL_HUF = 1;
export const RATE_OTHER_PAYEE = 2;

/** Section 206AA rate where the payee has not furnished a PAN. */
export const NO_PAN_RATE = 20;

/** Section 194C(6) applies only up to this many goods carriages owned. */
export const SMALL_TRANSPORTER_CARRIAGE_LIMIT = 10;

export const PAYEE_TYPES = [
  {
    id: "individual-huf",
    label: "Individual or Hindu Undivided Family",
    rate: RATE_INDIVIDUAL_HUF,
  },
  {
    id: "other",
    label: "Company, firm, LLP, AOP, BOI, society or trust",
    rate: RATE_OTHER_PAYEE,
  },
];

export function getPayeeType(id) {
  return PAYEE_TYPES.find((type) => type.id === id) || PAYEE_TYPES[0];
}

const round2 = (value) => Math.round(value * 100) / 100;
const inr = (value) => `Rs ${Number(value).toLocaleString("en-IN")}`;

/**
 * Compute section 194C TDS on one contractor bill.
 *
 * @param {object} input
 * @param {number} input.invoiceAmount        Bill value for this payment (Rs), excluding GST shown separately.
 * @param {number} input.materialValue        Material value separately shown and excludable (Rs).
 * @param {number} input.priorPaymentsThisFy  Aggregate of earlier 194C sums to this payee in the FY (Rs).
 * @param {number} input.tdsAlreadyDeducted   TDS already deducted on those earlier sums (Rs).
 * @param {string} input.payeeType            One of PAYEE_TYPES[].id
 * @param {boolean} input.panFurnished        Whether a valid PAN is on record.
 * @param {boolean} input.transporterExempt   Section 194C(6) declaration held from a small goods-carriage operator.
 * @param {boolean} input.payerCovered        Whether the payer is a "specified person" bound to deduct.
 * @returns {object} result, or { error } when the input is unusable.
 */
export function computeTds194C({
  invoiceAmount,
  materialValue = 0,
  priorPaymentsThisFy = 0,
  tdsAlreadyDeducted = 0,
  payeeType = "individual-huf",
  panFurnished = true,
  transporterExempt = false,
  payerCovered = true,
} = {}) {
  const numbers = [invoiceAmount, materialValue, priorPaymentsThisFy, tdsAlreadyDeducted];
  if (numbers.some((value) => !Number.isFinite(value))) {
    return { error: "Enter every amount as a number." };
  }
  if (numbers.some((value) => value < 0)) {
    return { error: "Amounts cannot be negative." };
  }
  if (invoiceAmount === 0 && priorPaymentsThisFy === 0) {
    return { error: "Enter a bill amount greater than zero." };
  }
  if (materialValue > invoiceAmount) {
    return { error: "Material value cannot be more than the bill amount." };
  }
  // Nothing in a 194C contract runs past Rs 1,000 crore in one bill in practice.
  if (invoiceAmount > 1e13 || priorPaymentsThisFy > 1e13) {
    return { error: "That amount is unrealistically large — check the figure you entered." };
  }

  const payee = getPayeeType(payeeType);
  const base = round2(invoiceAmount - materialValue);
  const aggregateBase = round2(priorPaymentsThisFy + base);

  const nilResult = (reason) => ({
    reason,
    appliedRate: 0,
    statutoryRate: payee.rate,
    payeeLabel: payee.label,
    invoiceAmount: round2(invoiceAmount),
    materialValue: round2(materialValue),
    base,
    priorPayments: round2(priorPaymentsThisFy),
    aggregateBase,
    singleLimit: SINGLE_PAYMENT_LIMIT,
    annualLimit: ANNUAL_AGGREGATE_LIMIT,
    trigger: null,
    deductionRequired: false,
    tdsOnThisPayment: 0,
    tdsAlreadyDeducted: round2(tdsAlreadyDeducted),
    totalTdsForYear: round2(tdsAlreadyDeducted),
    netPayable: round2(invoiceAmount),
    singleHeadroom: round2(Math.max(0, SINGLE_PAYMENT_LIMIT - base)),
    annualHeadroom: round2(Math.max(0, ANNUAL_AGGREGATE_LIMIT - aggregateBase)),
    panFurnished,
  });

  if (!payerCovered) {
    return nilResult(
      "The payer is not a specified person under section 194C(1). An individual or HUF must deduct only if their accounts were audited under section 44AB in the preceding year, and never for work done exclusively for personal purposes.",
    );
  }

  if (transporterExempt && panFurnished) {
    return nilResult(
      `No tax is deducted. The payee owns ${SMALL_TRANSPORTER_CARRIAGE_LIMIT} or fewer goods carriages and has furnished the section 194C(6) declaration with a PAN, so the payment goes out in full — but it must still be reported in Form 26Q.`,
    );
  }
  if (transporterExempt && !panFurnished) {
    const tds = round2((base * NO_PAN_RATE) / 100);
    return {
      ...nilResult(""),
      reason: `Section 194C(6) needs the transporter's PAN alongside the declaration. Without a PAN the exemption fails and section 206AA forces deduction at ${NO_PAN_RATE}%.`,
      appliedRate: NO_PAN_RATE,
      trigger: "no-pan",
      deductionRequired: tds > 0,
      tdsOnThisPayment: tds,
      totalTdsForYear: round2(tdsAlreadyDeducted + tds),
      netPayable: round2(invoiceAmount - tds),
    };
  }

  const rate = panFurnished ? payee.rate : NO_PAN_RATE;

  let trigger = null;
  let tdsOnThisPayment = 0;
  let totalTdsForYear = round2(tdsAlreadyDeducted);

  if (aggregateBase > ANNUAL_AGGREGATE_LIMIT) {
    trigger = "annual";
    const dueForYear = round2((aggregateBase * rate) / 100);
    tdsOnThisPayment = round2(Math.max(0, dueForYear - tdsAlreadyDeducted));
    totalTdsForYear = round2(tdsAlreadyDeducted + tdsOnThisPayment);
  } else if (base > SINGLE_PAYMENT_LIMIT) {
    trigger = "single";
    tdsOnThisPayment = round2((base * rate) / 100);
    totalTdsForYear = round2(tdsAlreadyDeducted + tdsOnThisPayment);
  }

  const deductionRequired = tdsOnThisPayment > 0;

  let reason;
  if (trigger === "annual") {
    reason = `Payments to this contractor total ${inr(aggregateBase)} for the year, above the ${inr(ANNUAL_AGGREGATE_LIMIT)} aggregate limit, so tax is deducted at ${rate}% on the full year's sums including the earlier bills.`;
  } else if (trigger === "single") {
    reason = `This single bill of ${inr(base)} exceeds the ${inr(SINGLE_PAYMENT_LIMIT)} single-payment limit, so tax is deducted at ${rate}% on this bill even though the yearly aggregate is still under ${inr(ANNUAL_AGGREGATE_LIMIT)}.`;
  } else {
    reason = `No deduction. This bill of ${inr(base)} is within the ${inr(SINGLE_PAYMENT_LIMIT)} single-payment limit and the year's aggregate of ${inr(aggregateBase)} is within ${inr(ANNUAL_AGGREGATE_LIMIT)}.`;
  }
  if (!panFurnished && deductionRequired) {
    reason += ` No PAN is on record, so section 206AA raises the rate to ${NO_PAN_RATE}%.`;
  }

  return {
    reason,
    appliedRate: deductionRequired ? rate : 0,
    statutoryRate: payee.rate,
    payeeLabel: payee.label,
    invoiceAmount: round2(invoiceAmount),
    materialValue: round2(materialValue),
    base,
    priorPayments: round2(priorPaymentsThisFy),
    aggregateBase,
    singleLimit: SINGLE_PAYMENT_LIMIT,
    annualLimit: ANNUAL_AGGREGATE_LIMIT,
    trigger,
    deductionRequired,
    tdsOnThisPayment,
    tdsAlreadyDeducted: round2(tdsAlreadyDeducted),
    totalTdsForYear,
    netPayable: round2(invoiceAmount - tdsOnThisPayment),
    singleHeadroom: round2(Math.max(0, SINGLE_PAYMENT_LIMIT - base)),
    annualHeadroom: round2(Math.max(0, ANNUAL_AGGREGATE_LIMIT - aggregateBase)),
    panFurnished,
  };
}
