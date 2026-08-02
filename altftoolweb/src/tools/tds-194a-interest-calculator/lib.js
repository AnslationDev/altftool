/**
 * Section 194A of the Income-tax Act, 1961 — TDS on interest other than
 * interest on securities.
 *
 * Rules implemented here:
 *  - Rate: 10% on interest paid or credited to a resident. Section 206AA
 *    raises this to 20% where the payee furnishes no PAN. No surcharge or cess.
 *  - Thresholds under section 194A(3)(i), as raised by the Finance Act 2025
 *    with effect from 1 April 2025:
 *      * Banking company, co-operative society engaged in banking, or a post
 *        office deposit scheme: Rs 1,00,000 where the payee is a senior
 *        citizen, Rs 50,000 for everyone else.
 *      * Any other payer: Rs 10,000.
 *    Up to FY 2024-25 the corresponding figures were Rs 50,000 / Rs 40,000 and
 *    Rs 5,000.
 *  - The bank threshold applies to TIME deposits. Interest on an ordinary
 *    savings bank account is not a time deposit and is outside the deduction,
 *    though it remains fully taxable in the depositor's hands.
 *  - Banks on core banking must aggregate interest across all branches for one
 *    customer, not branch by branch.
 *  - Section 197A: no deduction where a valid Form 15G (or 15H for a senior
 *    citizen) is furnished and the conditions of that section are met.
 *  - A "senior citizen" is a resident individual aged 60 years or more at any
 *    time during the previous year.
 */

/** Thresholds from 1 April 2025 (Finance Act 2025). */
export const BANK_THRESHOLD_SENIOR_FY_2025_26 = 100000;
export const BANK_THRESHOLD_OTHER_FY_2025_26 = 50000;
export const NON_BANK_THRESHOLD_FY_2025_26 = 10000;

/** Thresholds up to 31 March 2025. */
export const BANK_THRESHOLD_SENIOR_UPTO_FY_2024_25 = 50000;
export const BANK_THRESHOLD_OTHER_UPTO_FY_2024_25 = 40000;
export const NON_BANK_THRESHOLD_UPTO_FY_2024_25 = 5000;

/** Standard section 194A rate for residents. */
export const STANDARD_RATE = 10;

/** Section 206AA rate where no PAN is furnished. */
export const NO_PAN_RATE = 20;

/** Age at which the higher senior-citizen threshold applies. */
export const SENIOR_CITIZEN_AGE = 60;

export const PAYER_TYPES = [
  {
    id: "bank",
    label: "Bank, co-operative bank or post office deposit scheme",
    note: "Higher thresholds apply, and only time deposits are covered.",
  },
  {
    id: "other",
    label: "Company, firm or other payer (unsecured loan, NBFC deposit)",
    note: "The low Rs 10,000 threshold applies from FY 2025-26.",
  },
];

export const DEPOSIT_TYPES = [
  { id: "time", label: "Fixed or recurring deposit (time deposit)" },
  { id: "savings", label: "Ordinary savings bank account" },
];

/** Payments expressly kept out of section 194A. */
export const EXCLUSIONS = [
  ["Interest paid by a firm to its partner", "Excluded by section 194A(3)(iv)."],
  ["Interest paid to a bank, LIC, UTI or an insurer", "Excluded by section 194A(3)(iii)."],
  ["Interest on a savings bank account", "Not a time deposit, so no deduction — but still taxable income."],
  ["Interest on securities", "Covered by section 193 instead."],
  ["Interest credited to a co-operative society member on deposits", "Relief under section 194A(3)(v), subject to conditions."],
];

const round2 = (value) => Math.round(value * 100) / 100;
const inr = (value) => `Rs ${Number(value).toLocaleString("en-IN")}`;

/**
 * Threshold under section 194A for a given payer, payee and year.
 * @param {string} payerType 'bank' or 'other'
 * @param {boolean} seniorCitizen Payee is 60 or above during the year.
 * @param {number} fyStartYear Calendar year the financial year begins in.
 */
export function thresholdFor(payerType, seniorCitizen, fyStartYear) {
  const current = Number.isFinite(fyStartYear) ? fyStartYear >= 2025 : true;
  if (payerType === "bank") {
    if (seniorCitizen) {
      return current
        ? BANK_THRESHOLD_SENIOR_FY_2025_26
        : BANK_THRESHOLD_SENIOR_UPTO_FY_2024_25;
    }
    return current ? BANK_THRESHOLD_OTHER_FY_2025_26 : BANK_THRESHOLD_OTHER_UPTO_FY_2024_25;
  }
  return current ? NON_BANK_THRESHOLD_FY_2025_26 : NON_BANK_THRESHOLD_UPTO_FY_2024_25;
}

/**
 * Compute section 194A TDS on interest for a financial year.
 *
 * @param {object} input
 * @param {number} input.interestAmount  Interest paid or credited in the year (Rs).
 * @param {string} input.payerType       One of PAYER_TYPES[].id
 * @param {string} input.depositType     One of DEPOSIT_TYPES[].id (only relevant for a bank payer).
 * @param {boolean} input.seniorCitizen  Payee is 60 or above during the year.
 * @param {number} input.fyStartYear     Calendar year the financial year begins in.
 * @param {boolean} input.panFurnished   Whether the payee furnished a PAN.
 * @param {boolean} input.declarationFiled Valid Form 15G or 15H on file.
 * @returns {object} result, or { error } when the input is unusable.
 */
export function computeTds194A({
  interestAmount,
  payerType = "bank",
  depositType = "time",
  seniorCitizen = false,
  fyStartYear = 2025,
  panFurnished = true,
  declarationFiled = false,
} = {}) {
  if (!Number.isFinite(interestAmount)) {
    return { error: "Enter the interest amount as a number." };
  }
  if (interestAmount < 0) {
    return { error: "Interest cannot be negative." };
  }
  if (interestAmount === 0) {
    return { error: "Enter an interest amount greater than zero." };
  }
  if (interestAmount > 1e12) {
    return { error: "That interest is unrealistically large — check the figure you entered." };
  }
  if (!Number.isFinite(fyStartYear) || fyStartYear < 2000 || fyStartYear > 2100) {
    return { error: "Choose a valid financial year." };
  }

  const threshold = thresholdFor(payerType, seniorCitizen, fyStartYear);
  const rate = panFurnished ? STANDARD_RATE : NO_PAN_RATE;
  const savingsAccount = payerType === "bank" && depositType === "savings";

  const shared = {
    interestAmount: round2(interestAmount),
    threshold,
    statutoryRate: STANDARD_RATE,
    payerType,
    depositType,
    seniorCitizen,
    fyStartYear,
    panFurnished,
    declarationFiled,
  };

  const nil = (reason, headroom = 0) => ({
    ...shared,
    appliedRate: 0,
    thresholdCrossed: interestAmount > threshold,
    deductionRequired: false,
    tds: 0,
    netInterest: round2(interestAmount),
    headroom,
    reason,
  });

  if (savingsAccount) {
    return nil(
      "Interest on an ordinary savings bank account is not a time deposit, so no tax is deducted under section 194A. The interest is still taxable — a resident individual can claim up to Rs 10,000 under section 80TTA, or up to Rs 50,000 of all deposit interest under section 80TTB if aged 60 or above, in the old tax regime.",
    );
  }

  // Section 206AA(2): a Form 15G/15H declaration is valid only if the payee's
  // PAN is furnished with it. Without PAN the declaration cannot stop the
  // deduction, so this falls through to the normal threshold/rate logic below
  // (which will apply the 20% no-PAN rate once the threshold is crossed).
  if (declarationFiled && panFurnished) {
    return nil(
      `A valid Form ${seniorCitizen ? "15H" : "15G"} under section 197A stops the deduction. The declaration is valid only if the conditions in section 197A are met, and it does not make the interest tax-free.`,
    );
  }

  if (interestAmount <= threshold) {
    return nil(
      `Interest of ${inr(round2(interestAmount))} for the year is within the ${inr(threshold)} limit for this payer, so no tax is deducted.`,
      round2(Math.max(0, threshold - interestAmount)),
    );
  }

  const tds = round2((interestAmount * rate) / 100);

  let reason = `Interest of ${inr(round2(interestAmount))} exceeds the ${inr(threshold)} limit, so ${rate}% is deducted on the whole interest, not just on the excess.`;
  if (!panFurnished) {
    reason += ` No PAN is on record, so section 206AA raises the rate from ${STANDARD_RATE}% to ${NO_PAN_RATE}%.`;
    if (declarationFiled) {
      reason += ` The Form ${seniorCitizen ? "15H" : "15G"} on file is not valid without a PAN under section 206AA(2), so it does not stop the deduction.`;
    }
  }

  return {
    ...shared,
    appliedRate: rate,
    thresholdCrossed: true,
    deductionRequired: tds > 0,
    tds,
    netInterest: round2(interestAmount - tds),
    headroom: 0,
    reason,
  };
}

/**
 * Simple annual interest on a deposit paid out (not compounded), used to fill in
 * the interest figure from a deposit amount and rate.
 * @param {number} principal Deposit amount (Rs).
 * @param {number} annualRate Interest rate per annum (%).
 */
export function annualInterestOnDeposit(principal, annualRate) {
  if (!Number.isFinite(principal) || !Number.isFinite(annualRate)) {
    return { error: "Enter the deposit amount and rate as numbers." };
  }
  if (principal < 0) return { error: "Deposit amount cannot be negative." };
  if (annualRate < 0 || annualRate > 50) {
    return { error: "Enter an interest rate between 0% and 50% per year." };
  }
  return { interest: round2((principal * annualRate) / 100) };
}
