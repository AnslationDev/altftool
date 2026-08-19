/**
 * Tax on dividend income received by a resident individual from Indian companies
 * and mutual funds.
 *
 * Statutory basis (Income-tax Act, 1961). Note: the Income-tax Act, 2025 replaced
 * the 1961 Act with effect from 1 April 2026 (applicable from Tax Year 2026-27).
 * The provisions below are carried forward/consolidated under the new Act; the
 * section numbers cited are the 1961 Act's, and the computed rates/thresholds
 * remain substantively the same under the 2025 Act.
 *  - Since the Finance Act, 2020 abolished Dividend Distribution Tax with effect
 *    from 1 April 2020, dividend is taxable in the hands of the shareholder as
 *    "Income from Other Sources" under section 56(2)(i), at the slab rate that
 *    applies to the taxpayer.
 *  - Section 57(1), second proviso: the ONLY expense allowed against dividend is
 *    interest on money borrowed to make the investment, and the deduction is
 *    capped at 20% of the dividend income. Brokerage, demat charges, advisory
 *    fees and commission are not deductible.
 *  - Section 194: a domestic company deducts TDS on dividend paid to a resident.
 *    The Finance Act, 2025 raised the per-company annual threshold from ₹5,000 to
 *    ₹10,000 with effect from 1 April 2025 (financial year 2025-26 onwards).
 *  - Section 206AA: where PAN is not furnished, TDS is deducted at 20%.
 *  - Section 197A(1A)/(1C): a Form 15G (or 15H for a resident aged 60+) can be
 *    filed for nil deduction where the estimated total income is below the
 *    taxable limit.
 *  - Finance Act, 2020: surcharge on dividend income is capped at 15%, even where
 *    the taxpayer's other income attracts a 25% or 37% surcharge.
 *  - Health and Education Cess is 4% of income tax plus surcharge.
 *  - Section 208: advance tax is payable where the estimated tax liability after
 *    TDS credit is ₹10,000 or more in the financial year.
 */

/** Per-company annual TDS threshold under section 194, FY 2025-26 onwards (₹). */
export const TDS_THRESHOLD_194 = 10000;

/** Threshold that applied up to FY 2024-25, kept for reference (₹). */
export const TDS_THRESHOLD_194_PRE_FY2526 = 5000;

/** Ordinary TDS rate on dividend under section 194 (%). */
export const TDS_RATE_194 = 10;

/** TDS rate where PAN is not furnished, section 206AA (%). */
export const TDS_RATE_NO_PAN = 20;

/** Interest deduction ceiling under the second proviso to section 57(1). */
export const INTEREST_DEDUCTION_CAP_RATIO = 0.2;

/** Health and Education Cess on income tax plus surcharge (%). */
export const HEALTH_EDUCATION_CESS = 4;

/** Surcharge on dividend income is capped at this rate (Finance Act, 2022) (%). */
export const MAX_SURCHARGE_ON_DIVIDEND = 15;

/** Threshold at which advance tax becomes payable under section 208 (₹). */
export const ADVANCE_TAX_THRESHOLD = 10000;

/** Marginal slab rates a resident individual can fall in (%). */
export const SLAB_RATES = [0, 5, 10, 15, 20, 25, 30];

/** Surcharge rates on total income, before the 15% dividend cap (%). */
export const SURCHARGE_RATES = [0, 10, 15, 25, 37];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * TDS on a single company's dividend payout for the year.
 *
 * @param {number} amount dividend from that company in the financial year
 * @param {object} [options]
 * @param {boolean} [options.panFurnished] PAN on record with the registrar
 * @param {boolean} [options.formFiled] Form 15G/15H filed for nil deduction
 * @param {number} [options.threshold] per-company threshold to apply
 * @returns {{ rate: number, tds: number, deducted: boolean }}
 */
export function tdsOnCompanyDividend(
  amount,
  { panFurnished = true, formFiled = false, threshold = TDS_THRESHOLD_194 } = {},
) {
  if (!isNum(amount) || amount <= 0) return { rate: 0, tds: 0, deducted: false };
  if (formFiled) return { rate: 0, tds: 0, deducted: false };
  // Section 194 exempts deduction where the payout "does not exceed" the threshold.
  if (amount <= threshold) return { rate: 0, tds: 0, deducted: false };
  const rate = panFurnished ? TDS_RATE_194 : TDS_RATE_NO_PAN;
  return { rate, tds: (amount * rate) / 100, deducted: true };
}

/**
 * Full dividend tax computation.
 *
 * @param {object} input
 * @param {Array<{name?: string, amount: number}>} input.companies dividend received
 *   from each company or fund in the financial year
 * @param {number} [input.interestExpense] interest paid on money borrowed to invest
 * @param {number} input.slabRatePercent the taxpayer's marginal slab rate
 * @param {number} [input.surchargePercent] surcharge rate on total income
 * @param {boolean} [input.panFurnished]
 * @param {boolean} [input.formFiled] Form 15G/15H filed
 * @param {boolean} [input.applyPreFy2526Threshold] use the old ₹5,000 threshold
 * @returns {object} result, or { error } for invalid input
 */
export function computeDividendTax({
  companies = [],
  interestExpense = 0,
  slabRatePercent = 30,
  surchargePercent = 0,
  panFurnished = true,
  formFiled = false,
  applyPreFy2526Threshold = false,
} = {}) {
  if (!Array.isArray(companies) || companies.length === 0) {
    return { error: "Add at least one company or fund that paid you a dividend." };
  }
  const rows = companies.map((row, index) => ({
    name: (row && row.name) || `Company ${index + 1}`,
    amount: isNum(row && row.amount) ? row.amount : NaN,
  }));
  if (rows.some((row) => Number.isNaN(row.amount))) {
    return { error: "Enter a valid dividend amount for every company." };
  }
  if (rows.some((row) => row.amount < 0)) {
    return { error: "Dividend amounts cannot be negative." };
  }
  const grossDividend = rows.reduce((sum, row) => sum + row.amount, 0);
  if (grossDividend <= 0) {
    return { error: "Total dividend received must be greater than zero." };
  }
  if (grossDividend > 1e12) {
    return { error: "Enter a total dividend below ₹1 lakh crore." };
  }
  if (!isNum(interestExpense) || interestExpense < 0) {
    return { error: "Interest on borrowed money cannot be negative." };
  }
  if (!isNum(slabRatePercent) || slabRatePercent < 0 || slabRatePercent > 50) {
    return { error: "Choose a slab rate between 0% and 50%." };
  }
  if (!isNum(surchargePercent) || surchargePercent < 0 || surchargePercent > 37) {
    return { error: "Choose a surcharge rate between 0% and 37%." };
  }

  const threshold = applyPreFy2526Threshold
    ? TDS_THRESHOLD_194_PRE_FY2526
    : TDS_THRESHOLD_194;

  const interestCap = grossDividend * INTEREST_DEDUCTION_CAP_RATIO;
  const allowedInterest = Math.min(interestExpense, interestCap);
  const disallowedInterest = interestExpense - allowedInterest;
  const taxableDividend = Math.max(0, grossDividend - allowedInterest);

  const baseTax = (taxableDividend * slabRatePercent) / 100;
  const effectiveSurchargeRate = Math.min(surchargePercent, MAX_SURCHARGE_ON_DIVIDEND);
  const surcharge = (baseTax * effectiveSurchargeRate) / 100;
  const cess = ((baseTax + surcharge) * HEALTH_EDUCATION_CESS) / 100;
  const totalTax = baseTax + surcharge + cess;

  const perCompany = rows.map((row) => {
    const { rate, tds, deducted } = tdsOnCompanyDividend(row.amount, {
      panFurnished,
      formFiled,
      threshold,
    });
    return { ...row, tdsRate: rate, tds, tdsDeducted: deducted };
  });
  const totalTds = perCompany.reduce((sum, row) => sum + row.tds, 0);

  const balance = totalTax - totalTds;

  return {
    grossDividend,
    perCompany,
    interestExpense,
    interestCap,
    allowedInterest,
    disallowedInterest,
    taxableDividend,
    slabRatePercent,
    baseTax,
    surchargePercent,
    effectiveSurchargeRate,
    surchargeCapped: surchargePercent > MAX_SURCHARGE_ON_DIVIDEND,
    surcharge,
    cessRate: HEALTH_EDUCATION_CESS,
    cess,
    totalTax,
    totalTds,
    tdsThreshold: threshold,
    tdsRateApplied: formFiled ? 0 : panFurnished ? TDS_RATE_194 : TDS_RATE_NO_PAN,
    balancePayable: balance > 0 ? balance : 0,
    refundDue: balance < 0 ? -balance : 0,
    netInHand: grossDividend - totalTax,
    effectiveTaxRate: (totalTax / grossDividend) * 100,
    advanceTaxApplies: balance >= ADVANCE_TAX_THRESHOLD,
    companiesWithTds: perCompany.filter((row) => row.tdsDeducted).length,
  };
}
