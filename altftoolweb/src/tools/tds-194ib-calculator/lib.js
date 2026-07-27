/**
 * Section 194-IB of the Income-tax Act, 1961 — TDS on rent paid by an
 * individual or HUF who is NOT required to deduct under section 194-I.
 *
 * Rules implemented here:
 *  - Applies where rent to a resident landlord exceeds Rs 50,000 for a month
 *    or part of a month.
 *  - Rate: 5% for deductions made up to 30 September 2024; 2% for deductions
 *    made on or after 1 October 2024 (Finance (No. 2) Act 2024). Because the
 *    deduction happens only once, the rate that matters is the one in force on
 *    the date of deduction.
 *  - Timing under section 194-IB(2): deduct once, at the time of credit or
 *    payment of rent for the last month of the previous year, or the last month
 *    of the tenancy where the premises are vacated during the year.
 *  - Cap in section 194-IB(4): the tax deducted cannot exceed the rent payable
 *    for that last month. This cap also holds down the 20% no-PAN rate under
 *    section 206AA.
 *  - Compliance: no TAN is needed. Pay with the challan-cum-statement in
 *    Form 26QC within 30 days from the end of the month in which the deduction
 *    was made, then issue Form 16C to the landlord within 15 days of that due
 *    date (Rules 30(2B), 31A(4B) and 31(3B)).
 */

/** Threshold in section 194-IB(1) — rent for a month or part of a month. */
export const MONTHLY_THRESHOLD = 50000;

/** Rate up to deductions made on 30 September 2024. */
export const RATE_UPTO_30_SEP_2024 = 5;

/** Rate for deductions made on or after 1 October 2024. */
export const RATE_FROM_1_OCT_2024 = 2;

/** Date the reduced rate took effect. */
export const RATE_CHANGE_DATE = "2024-10-01";

/** Section 206AA rate where the landlord furnishes no PAN. */
export const NO_PAN_RATE = 20;

/** Days allowed to file Form 26QC from the end of the month of deduction. */
export const FORM_26QC_DAYS = 30;

/** Days allowed to issue Form 16C after the Form 26QC due date. */
export const FORM_16C_DAYS = 15;

/** Late filing fee under section 234E, per day, capped at the tax deducted. */
export const LATE_FEE_PER_DAY = 200;

const round2 = (value) => Math.round(value * 100) / 100;
const inr = (value) => `Rs ${Number(value).toLocaleString("en-IN")}`;

const isIsoDate = (value) =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);

const toUtc = (iso) => new Date(`${iso}T00:00:00Z`);
const toIso = (date) => date.toISOString().slice(0, 10);

/** Statutory rate in force on a given deduction date. */
export function rateOnDate(deductionDate) {
  if (!isIsoDate(deductionDate)) return RATE_FROM_1_OCT_2024;
  return deductionDate < RATE_CHANGE_DATE ? RATE_UPTO_30_SEP_2024 : RATE_FROM_1_OCT_2024;
}

/**
 * Form 26QC and Form 16C due dates for a deduction made on a given date.
 * @param {string} deductionDate ISO date of deduction.
 */
export function complianceDates(deductionDate) {
  if (!isIsoDate(deductionDate)) {
    return { error: "Enter the date of deduction as YYYY-MM-DD." };
  }
  const base = toUtc(deductionDate);
  if (Number.isNaN(base.getTime())) {
    return { error: "That is not a valid calendar date." };
  }
  // Last day of the month in which the deduction was made.
  const endOfMonth = new Date(
    Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + 1, 0),
  );
  const form26qc = new Date(endOfMonth.getTime());
  form26qc.setUTCDate(form26qc.getUTCDate() + FORM_26QC_DAYS);
  const form16c = new Date(form26qc.getTime());
  form16c.setUTCDate(form16c.getUTCDate() + FORM_16C_DAYS);
  return {
    endOfMonth: toIso(endOfMonth),
    form26qcDue: toIso(form26qc),
    form16cDue: toIso(form16c),
  };
}

/**
 * Compute section 194-IB TDS for one tenancy.
 *
 * @param {object} input
 * @param {number} input.monthlyRent    Rent per month (Rs).
 * @param {number} input.months         Months of tenancy falling in the financial year (1-12).
 * @param {number} input.lastMonthRent  Rent payable for the last month (Rs) — sets the statutory cap.
 * @param {string} input.deductionDate  ISO date on which the deduction is made.
 * @param {boolean} input.panFurnished  Whether the landlord furnished a PAN.
 * @returns {object} result, or { error } when the input is unusable.
 */
export function computeTds194IB({
  monthlyRent,
  months = 12,
  lastMonthRent,
  deductionDate = "2026-03-31",
  panFurnished = true,
} = {}) {
  const cap = Number.isFinite(lastMonthRent) ? lastMonthRent : monthlyRent;

  if (!Number.isFinite(monthlyRent) || !Number.isFinite(months) || !Number.isFinite(cap)) {
    return { error: "Enter the rent figures and the number of months as numbers." };
  }
  if (monthlyRent < 0 || cap < 0) {
    return { error: "Rent cannot be negative." };
  }
  if (monthlyRent === 0) {
    return { error: "Enter a monthly rent greater than zero." };
  }
  if (monthlyRent > 1e10 || cap > 1e10) {
    return { error: "That rent is unrealistically large — check the figure you entered." };
  }
  if (!Number.isInteger(months)) {
    return { error: "Enter whole months — a part of a month counts as a full month." };
  }
  if (months < 1 || months > 12) {
    return { error: "Section 194-IB covers 1 to 12 months of rent in one financial year." };
  }
  if (!isIsoDate(deductionDate)) {
    return { error: "Enter the date of deduction as YYYY-MM-DD." };
  }

  const totalRent = round2(monthlyRent * months);
  const statutoryRate = rateOnDate(deductionDate);
  const rate = panFurnished ? statutoryRate : NO_PAN_RATE;
  const thresholdCrossed = monthlyRent > MONTHLY_THRESHOLD;
  const dates = complianceDates(deductionDate);

  const shared = {
    monthlyRent: round2(monthlyRent),
    months,
    totalRent,
    lastMonthRent: round2(cap),
    statutoryRate,
    threshold: MONTHLY_THRESHOLD,
    panFurnished,
    deductionDate,
    form26qcDue: dates.form26qcDue || null,
    form16cDue: dates.form16cDue || null,
  };

  if (!thresholdCrossed) {
    return {
      ...shared,
      appliedRate: 0,
      thresholdCrossed: false,
      deductionRequired: false,
      tdsBeforeCap: 0,
      tdsPayable: 0,
      capApplied: false,
      netLastMonthPayment: round2(cap),
      headroom: round2(MONTHLY_THRESHOLD - monthlyRent),
      reason: `Monthly rent of ${inr(round2(monthlyRent))} is within the ${inr(MONTHLY_THRESHOLD)} a month limit, so section 194-IB does not apply and no Form 26QC is needed.`,
    };
  }

  const tdsBeforeCap = round2((totalRent * rate) / 100);
  const tdsPayable = round2(Math.min(tdsBeforeCap, cap));
  const capApplied = tdsBeforeCap > cap;

  let reason = `Rent of ${inr(round2(monthlyRent))} a month crosses the ${inr(MONTHLY_THRESHOLD)} limit, so ${rate}% is deducted once on the whole year's rent of ${inr(totalRent)}.`;
  if (!panFurnished) {
    reason += ` No PAN is on record, so section 206AA raises the rate from ${statutoryRate}% to ${NO_PAN_RATE}%.`;
  }
  if (capApplied) {
    reason += ` Section 194-IB(4) caps the deduction at the last month's rent of ${inr(round2(cap))}.`;
  }

  return {
    ...shared,
    appliedRate: rate,
    thresholdCrossed: true,
    deductionRequired: tdsPayable > 0,
    tdsBeforeCap,
    tdsPayable,
    capApplied,
    netLastMonthPayment: round2(cap - tdsPayable),
    headroom: 0,
    reason,
  };
}

/**
 * Late filing fee under section 234E for a delayed Form 26QC.
 * Rs 200 per day of delay, never more than the tax deducted.
 * @param {number} daysLate Whole days past the Form 26QC due date.
 * @param {number} tdsPayable Tax deducted (Rs) — the statutory ceiling on the fee.
 */
export function lateFilingFee(daysLate, tdsPayable) {
  if (!Number.isFinite(daysLate) || !Number.isFinite(tdsPayable)) {
    return { error: "Enter the days of delay and the tax deducted as numbers." };
  }
  if (daysLate < 0) return { error: "Days of delay cannot be negative." };
  if (tdsPayable < 0) return { error: "Tax deducted cannot be negative." };
  const raw = Math.floor(daysLate) * LATE_FEE_PER_DAY;
  return {
    daysLate: Math.floor(daysLate),
    rawFee: raw,
    fee: round2(Math.min(raw, tdsPayable)),
    capped: raw > tdsPayable,
  };
}
