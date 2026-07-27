/**
 * Section 44ADA presumptive taxation for professionals.
 *
 * Statutory basis
 *  - s.44ADA(1): a resident individual or partnership firm (not an LLP) carrying on a
 *    profession referred to in s.44AA(1) may declare 50% of gross receipts as profit.
 *  - s.44ADA(1) proviso, inserted by the Finance Act 2023: the gross-receipts ceiling is
 *    Rs 50,00,000, raised to Rs 75,00,000 where cash receipts during the year do not exceed
 *    5% of total gross receipts. Receipts by cheque or draft that are not account payee count
 *    as cash for this test.
 *  - s.44ADA(2): every deduction under sections 30 to 38, including depreciation, is deemed
 *    already allowed, and the written down value is treated as if depreciation had been claimed.
 *  - s.44ADA(4) with s.44AB(d): declaring profit lower than 50% is allowed only if books are
 *    maintained under s.44AA and audited under s.44AB, and only bites when total income exceeds
 *    the basic exemption limit.
 *  - s.211(1)(b): a person computing income under s.44ADA pays the whole advance tax liability
 *    in one instalment on or before 15 March of the financial year.
 */

export const FY_LABEL = "FY 2025-26 (AY 2026-27)";

/** s.44ADA(1) — half of gross receipts is deemed to be the profit. */
export const PRESUMPTIVE_RATE = 0.5;
/** The same rate expressed in percent, so the interface never has to multiply. */
export const PRESUMPTIVE_RATE_PERCENT = 50;
/** Base gross-receipts ceiling. */
export const LIMIT_BASE = 5000000;
/** Enhanced ceiling available when cash receipts stay within the 5% cap. */
export const LIMIT_ENHANCED = 7500000;
/** The cash-receipts share that unlocks the enhanced ceiling. */
export const CASH_SHARE_CAP = 0.05;
/** The same cap in percent. */
export const CASH_SHARE_CAP_PERCENT = 5;
/** s.211(1)(b) — the single advance tax instalment date for presumptive assessees. */
export const ADVANCE_TAX_DUE_DATE = "15 March";
/** s.208 — advance tax is payable only once the liability reaches this amount. */
export const ADVANCE_TAX_TRIGGER = 10000;

/** Professions covered by s.44AA(1) and therefore eligible for s.44ADA. */
export const ELIGIBLE_PROFESSIONS = [
  "Legal",
  "Medical",
  "Engineering",
  "Architectural",
  "Accountancy",
  "Technical consultancy",
  "Interior decoration",
  "Authorised representative",
  "Film artist",
  "Company secretary",
  "Information technology",
];

/** Old-regime slabs for FY 2025-26, keyed by the exemption the assessee's age unlocks. */
export const OLD_REGIME_SLABS = {
  below60: [
    [250000, 0],
    [500000, 0.05],
    [1000000, 0.2],
    [Infinity, 0.3],
  ],
  senior: [
    [300000, 0],
    [500000, 0.05],
    [1000000, 0.2],
    [Infinity, 0.3],
  ],
  superSenior: [
    [500000, 0],
    [1000000, 0.2],
    [Infinity, 0.3],
  ],
};

/** Default regime slabs under s.115BAC(1A) as substituted by the Finance Act 2025. */
export const NEW_REGIME_SLABS = [
  [400000, 0],
  [800000, 0.05],
  [1200000, 0.1],
  [1600000, 0.15],
  [2000000, 0.2],
  [2400000, 0.25],
  [Infinity, 0.3],
];

/** s.87A rebate ceilings. */
export const REBATE_87A = {
  old: { incomeLimit: 500000, maxRebate: 12500 },
  new: { incomeLimit: 1200000, maxRebate: 60000 },
};

/** Health and education cess. */
export const CESS_RATE = 0.04;
/** New-regime standard deduction does not apply to professional income, so none is used here. */

function isNum(value) {
  return typeof value === "number" && Number.isFinite(value);
}

/** Marginal tax from an ordered [upperLimit, rate] slab table. */
export function taxFromSlabs(income, slabs) {
  if (!isNum(income) || income <= 0) return 0;
  let tax = 0;
  let lower = 0;
  for (const [upper, rate] of slabs) {
    if (income > lower) tax += (Math.min(income, upper) - lower) * rate;
    if (income <= upper) break;
    lower = upper;
  }
  return tax;
}

function slabsFor(regime, age) {
  if (regime === "new") return NEW_REGIME_SLABS;
  if (age >= 80) return OLD_REGIME_SLABS.superSenior;
  if (age >= 60) return OLD_REGIME_SLABS.senior;
  return OLD_REGIME_SLABS.below60;
}

/** Basic exemption limit, used for the s.44AB(d) audit test. */
export function basicExemptionLimit(regime, age) {
  return slabsFor(regime, age)[0][0];
}

/** Income tax on a total income after the s.87A rebate and 4% cess. */
export function incomeTax({ totalIncome, regime = "new", age = 35 }) {
  const income = Math.max(0, isNum(totalIncome) ? totalIncome : 0);
  const slabs = slabsFor(regime, age);
  const taxBeforeRebate = taxFromSlabs(income, slabs);
  const rule = REBATE_87A[regime === "old" ? "old" : "new"];

  let rebate = 0;
  let marginalRelief = 0;
  if (income <= rule.incomeLimit) {
    rebate = Math.min(taxBeforeRebate, rule.maxRebate);
  } else if (regime === "new") {
    // Proviso to s.87A: tax cannot exceed the income above the rebate ceiling.
    marginalRelief = Math.max(0, taxBeforeRebate - (income - rule.incomeLimit));
  }

  const tax = Math.max(0, taxBeforeRebate - rebate - marginalRelief);
  const cess = tax * CESS_RATE;
  return { taxBeforeRebate, rebate, marginalRelief, tax, cess, total: tax + cess };
}

/**
 * Full section 44ADA computation.
 *
 * @param {object} input
 * @param {number} input.digitalReceipts Receipts by bank transfer, UPI, card or account payee cheque.
 * @param {number} input.cashReceipts    Cash and non-account-payee receipts.
 * @param {string} input.regime          "new" or "old".
 * @param {number} input.age             Age, which changes the old-regime exemption.
 * @param {number} input.deductions      Chapter VI-A deductions, allowed only under the old regime.
 * @param {number|null} input.actualProfit Profit your books actually show, for the comparison.
 */
export function computePresumptive44ADA({
  digitalReceipts,
  cashReceipts = 0,
  regime = "new",
  age = 35,
  deductions = 0,
  actualProfit = null,
}) {
  if (!isNum(digitalReceipts) || !isNum(cashReceipts)) {
    return { error: "Enter both digital and cash gross receipts as numbers." };
  }
  if (digitalReceipts < 0 || cashReceipts < 0) {
    return { error: "Gross receipts cannot be negative." };
  }
  if (!isNum(deductions) || deductions < 0) {
    return { error: "Chapter VI-A deductions cannot be negative." };
  }
  if (!isNum(age) || age < 0 || age > 120) {
    return { error: "Enter an age between 0 and 120." };
  }
  if (regime !== "new" && regime !== "old") {
    return { error: "Choose either the new (default) regime or the old regime." };
  }

  const grossReceipts = digitalReceipts + cashReceipts;
  if (grossReceipts <= 0) {
    return { error: "Enter gross receipts greater than zero." };
  }

  const cashShare = cashReceipts / grossReceipts;
  const enhancedLimitAvailable = cashShare <= CASH_SHARE_CAP;
  const applicableLimit = enhancedLimitAvailable ? LIMIT_ENHANCED : LIMIT_BASE;
  const eligible = grossReceipts <= applicableLimit;

  const presumptiveIncome = grossReceipts * PRESUMPTIVE_RATE;
  // Chapter VI-A deductions are unavailable under the default regime.
  const allowedDeductions = regime === "old" ? Math.min(deductions, presumptiveIncome) : 0;
  const taxableIncome = Math.max(0, presumptiveIncome - allowedDeductions);

  const presumptiveTax = incomeTax({ totalIncome: taxableIncome, regime, age });
  const exemptionLimit = basicExemptionLimit(regime, age);

  // Books-and-audit route, for comparison and for the s.44AB(d) test.
  const hasActual = isNum(actualProfit) && actualProfit >= 0;
  let regular = null;
  if (hasActual) {
    const regularDeductions = regime === "old" ? Math.min(deductions, actualProfit) : 0;
    const regularTaxable = Math.max(0, actualProfit - regularDeductions);
    const regularTax = incomeTax({ totalIncome: regularTaxable, regime, age });
    regular = {
      profit: actualProfit,
      taxableIncome: regularTaxable,
      tax: regularTax,
      lowerThanPresumptive: actualProfit < presumptiveIncome,
      // s.44AB(d): audit bites only when income falls below the deemed profit AND
      // total income crosses the basic exemption limit.
      auditRequired: actualProfit < presumptiveIncome && regularTaxable > exemptionLimit,
      savingVsPresumptive: presumptiveTax.total - regularTax.total,
      savingVsPresumptiveAbs: Math.abs(presumptiveTax.total - regularTax.total),
    };
  }

  const advanceTaxPayable = presumptiveTax.total >= ADVANCE_TAX_TRIGGER ? presumptiveTax.total : 0;

  return {
    financialYear: FY_LABEL,
    grossReceipts,
    digitalReceipts,
    cashReceipts,
    cashShare,
    cashSharePercent: cashShare * 100,
    enhancedLimitAvailable,
    applicableLimit,
    eligible,
    excessOverLimit: Math.max(0, grossReceipts - applicableLimit),
    presumptiveIncome,
    allowedDeductions,
    taxableIncome,
    tax: presumptiveTax,
    exemptionLimit,
    effectiveRateOnReceipts: (presumptiveTax.total / grossReceipts) * 100,
    advanceTaxPayable,
    advanceTaxDueDate: ADVANCE_TAX_DUE_DATE,
    regular,
  };
}
