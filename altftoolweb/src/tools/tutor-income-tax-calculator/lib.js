/**
 * Income tax on tuition and coaching income for an Indian resident individual.
 *
 * FY 2025-26 (Assessment Year 2026-27) rules, as amended by the Finance Act, 2025.
 *
 * How coaching income is classified
 * ---------------------------------
 * Private tuition and coaching run on your own account is business/professional
 * income taxed under the head "Profits and gains of business or profession", not
 * salary. Coaching is NOT one of the professions notified under section 44ADA
 * (legal, medical, engineering, architectural, accountancy, technical consultancy,
 * interior decoration, and the notified ones such as film artists, company
 * secretaries and information technology), so the presumptive route available to a
 * coaching proprietor is section 44AD, not 44ADA.
 *
 * Section 44AD presumptive income: 6% of turnover received through banking or
 * electronic modes and 8% of the rest. Available while turnover stays within
 * Rs 2 crore, extended to Rs 3 crore when cash receipts are at most 5% of turnover.
 *
 * Actual-income route: gross receipts minus expenses laid out wholly and
 * exclusively for the activity under section 37(1) - classroom rent, study
 * material, assistant salaries, internet, travel and depreciation on equipment.
 *
 * Slabs, rebate, surcharge and cess are applied exactly as in the Act, including
 * marginal relief on both the section 87A rebate boundary and each surcharge
 * threshold.
 */

/** New regime (section 115BAC) slabs for FY 2025-26. */
export const NEW_REGIME_SLABS = [
  { upTo: 400000, rate: 0 },
  { upTo: 800000, rate: 5 },
  { upTo: 1200000, rate: 10 },
  { upTo: 1600000, rate: 15 },
  { upTo: 2000000, rate: 20 },
  { upTo: 2400000, rate: 25 },
  { upTo: Infinity, rate: 30 },
];

/** Old regime slab rates above the age-based basic exemption. */
export const OLD_REGIME_BANDS = [
  { upTo: 500000, rate: 5 },
  { upTo: 1000000, rate: 20 },
  { upTo: Infinity, rate: 30 },
];

/** Old-regime basic exemption by age on the last day of the previous year. */
export const OLD_REGIME_EXEMPTION = {
  below60: 250000,
  senior: 300000, // 60 years or more but under 80
  superSenior: 500000, // 80 years or more
};

/** Section 87A rebate: new regime, FY 2025-26. */
export const NEW_REBATE_LIMIT_INCOME = 1200000;
export const NEW_REBATE_MAX = 60000;
/** Section 87A rebate: old regime. */
export const OLD_REBATE_LIMIT_INCOME = 500000;
export const OLD_REBATE_MAX = 12500;

/** Standard deduction on salary income (section 16(ia)). */
export const STANDARD_DEDUCTION_NEW = 75000;
export const STANDARD_DEDUCTION_OLD = 50000;

/** Chapter VI-A ceilings usable in the old regime. */
export const LIMIT_80C = 150000;
export const LIMIT_80CCD1B = 50000;

/** Health and education cess on tax plus surcharge (section 2 of the Finance Act). */
export const CESS_RATE = 4;

/** Surcharge thresholds on total income. The 37% rate does not exist in the new regime. */
export const SURCHARGE_BANDS_OLD = [
  { over: 5000000, rate: 10 },
  { over: 10000000, rate: 15 },
  { over: 20000000, rate: 25 },
  { over: 50000000, rate: 37 },
];
export const SURCHARGE_BANDS_NEW = [
  { over: 5000000, rate: 10 },
  { over: 10000000, rate: 15 },
  { over: 20000000, rate: 25 },
];

/** Section 44AD presumptive rates. */
export const PRESUMPTIVE_RATE_DIGITAL = 6;
export const PRESUMPTIVE_RATE_CASH = 8;
/** Section 44AD turnover ceiling, and the raised ceiling when cash receipts are small. */
export const PRESUMPTIVE_TURNOVER_LIMIT = 20000000;
export const PRESUMPTIVE_TURNOVER_LIMIT_LOW_CASH = 30000000;
export const PRESUMPTIVE_LOW_CASH_SHARE = 5;

/** Section 44AA books-of-account thresholds for an individual. */
export const BOOKS_INCOME_THRESHOLD = 250000;
export const BOOKS_TURNOVER_THRESHOLD = 2500000;
/** Section 44AB tax-audit threshold, and the relaxed one for near-cashless businesses. */
export const AUDIT_TURNOVER_THRESHOLD = 10000000;
export const AUDIT_TURNOVER_THRESHOLD_LOW_CASH = 100000000;
/** GST registration threshold for services (Rs 10 lakh in special category states). */
export const GST_SERVICE_THRESHOLD = 2000000;

/** Expense lines a tuition or coaching business commonly claims under section 37(1). */
export const EXPENSE_LINES = [
  { key: "rent", label: "Classroom or studio rent" },
  { key: "materials", label: "Study material, printing and stationery" },
  { key: "staff", label: "Salaries to assistant teachers and staff" },
  { key: "internet", label: "Internet, phone and software subscriptions" },
  { key: "travel", label: "Travel to student homes and centres" },
  { key: "depreciation", label: "Depreciation on laptop, projector and furniture" },
  { key: "other", label: "Advertising, electricity and other running costs" },
];

const round0 = (value) => Math.round(value);
const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Slab tax on a taxable income under the new regime. */
export function newRegimeSlabTax(taxableIncome) {
  if (!isNum(taxableIncome) || taxableIncome <= 0) return 0;
  let tax = 0;
  let lower = 0;
  for (const slab of NEW_REGIME_SLABS) {
    if (taxableIncome <= lower) break;
    const band = Math.min(taxableIncome, slab.upTo) - lower;
    tax += (band * slab.rate) / 100;
    lower = slab.upTo;
  }
  return tax;
}

/** Slab tax under the old regime for a given age category. */
export function oldRegimeSlabTax(taxableIncome, ageGroup = "below60") {
  if (!isNum(taxableIncome) || taxableIncome <= 0) return 0;
  const exemption = OLD_REGIME_EXEMPTION[ageGroup] ?? OLD_REGIME_EXEMPTION.below60;
  let tax = 0;
  let lower = exemption;
  for (const band of OLD_REGIME_BANDS) {
    if (taxableIncome <= lower) break;
    const upper = Math.max(band.upTo, exemption);
    const slice = Math.min(taxableIncome, upper) - lower;
    if (slice > 0) tax += (slice * band.rate) / 100;
    lower = upper;
  }
  return tax;
}

/**
 * Surcharge with marginal relief: the extra tax plus surcharge above a threshold can
 * never exceed the extra income above that threshold.
 */
function surchargeWithRelief(totalIncome, baseTax, bands, slabTaxFn) {
  let applicable = null;
  for (const band of bands) {
    if (totalIncome > band.over) applicable = band;
  }
  if (!applicable || baseTax <= 0) return { rate: 0, amount: 0, marginalRelief: 0 };

  const raw = (baseTax * applicable.rate) / 100;
  const taxAtThreshold = slabTaxFn(applicable.over);
  const excessIncome = totalIncome - applicable.over;
  const allowed = taxAtThreshold + excessIncome - baseTax;
  if (allowed < raw) {
    const capped = Math.max(0, allowed);
    return { rate: applicable.rate, amount: capped, marginalRelief: raw - capped };
  }
  return { rate: applicable.rate, amount: raw, marginalRelief: 0 };
}

/**
 * Full tax computation for one regime.
 * @returns {{taxableIncome:number, slabTax:number, rebate:number, surcharge:number,
 *            surchargeRate:number, marginalRelief:number, cess:number, totalTax:number,
 *            effectiveRate:number}}
 */
export function taxForRegime({ grossTotalIncome, regime, ageGroup = "below60", chapterVIA = 0 }) {
  const isNew = regime === "new";
  const deductions = isNew ? 0 : Math.max(0, chapterVIA);
  const taxableIncome = Math.max(0, grossTotalIncome - deductions);

  const slabTaxFn = isNew ? newRegimeSlabTax : (income) => oldRegimeSlabTax(income, ageGroup);
  let slabTax = slabTaxFn(taxableIncome);

  const rebateLimit = isNew ? NEW_REBATE_LIMIT_INCOME : OLD_REBATE_LIMIT_INCOME;
  const rebateMax = isNew ? NEW_REBATE_MAX : OLD_REBATE_MAX;
  let rebate = taxableIncome <= rebateLimit ? Math.min(slabTax, rebateMax) : 0;
  let taxAfterRebate = slabTax - rebate;

  // Marginal relief at the 87A boundary in the new regime: tax just above the limit
  // cannot exceed the income above the limit.
  let rebateMarginalRelief = 0;
  if (isNew && taxableIncome > rebateLimit) {
    const cap = taxableIncome - rebateLimit;
    if (taxAfterRebate > cap) {
      rebateMarginalRelief = taxAfterRebate - cap;
      taxAfterRebate = cap;
      rebate += rebateMarginalRelief;
    }
  }

  const bands = isNew ? SURCHARGE_BANDS_NEW : SURCHARGE_BANDS_OLD;
  const sur = surchargeWithRelief(taxableIncome, taxAfterRebate, bands, slabTaxFn);
  const cess = ((taxAfterRebate + sur.amount) * CESS_RATE) / 100;
  const totalTax = taxAfterRebate + sur.amount + cess;

  return {
    deductions: round0(deductions),
    taxableIncome: round0(taxableIncome),
    slabTax: round0(slabTax),
    rebate: round0(rebate),
    taxAfterRebate: round0(taxAfterRebate),
    surchargeRate: sur.rate,
    surcharge: round0(sur.amount),
    marginalRelief: round0(sur.marginalRelief + rebateMarginalRelief),
    cess: round0(cess),
    totalTax: round0(totalTax),
    effectiveRate:
      grossTotalIncome > 0 ? Math.round((totalTax / grossTotalIncome) * 10000) / 100 : 0,
  };
}

/**
 * Tax on tuition/coaching income, both regimes, actual-expense and 44AD basis.
 *
 * @param {object} input
 * @param {number} input.grossReceipts        Annual tuition and coaching fees received.
 * @param {number} [input.digitalSharePercent] Share of receipts through bank/UPI/card.
 * @param {object} [input.expenses]           Map of the EXPENSE_LINES keys to amounts.
 * @param {number} [input.salaryIncome]       Salary from a school or college, if any.
 * @param {number} [input.otherIncome]        Interest and other income.
 * @param {"below60"|"senior"|"superSenior"} [input.ageGroup]
 * @param {number} [input.deduction80C]
 * @param {number} [input.deduction80D]
 * @param {number} [input.deduction80CCD1B]
 * @param {boolean} [input.usePresumptive]    Declare under section 44AD instead of actuals.
 * @returns {object} breakdown, or { error }.
 */
export function computeTutorTax({
  grossReceipts,
  digitalSharePercent = 100,
  expenses = {},
  salaryIncome = 0,
  otherIncome = 0,
  ageGroup = "below60",
  deduction80C = 0,
  deduction80D = 0,
  deduction80CCD1B = 0,
  usePresumptive = false,
} = {}) {
  if (!isNum(grossReceipts) || grossReceipts < 0) {
    return { error: "Enter your annual tuition receipts as a positive number." };
  }
  if (!isNum(digitalSharePercent) || digitalSharePercent < 0 || digitalSharePercent > 100) {
    return { error: "Digital share of receipts must be between 0% and 100%." };
  }
  if (!isNum(salaryIncome) || salaryIncome < 0) return { error: "Salary income cannot be negative." };
  if (!isNum(otherIncome) || otherIncome < 0) return { error: "Other income cannot be negative." };
  if (!OLD_REGIME_EXEMPTION[ageGroup]) return { error: "Choose a valid age category." };

  let totalExpenses = 0;
  for (const line of EXPENSE_LINES) {
    const value = expenses[line.key] ?? 0;
    if (!isNum(value)) return { error: "Every expense must be a valid number." };
    if (value < 0) return { error: `${line.label} cannot be negative.` };
    totalExpenses += value;
  }
  for (const value of [deduction80C, deduction80D, deduction80CCD1B]) {
    if (!isNum(value) || value < 0) return { error: "Deductions cannot be negative." };
  }
  if (totalExpenses > grossReceipts) {
    return { error: "Expenses exceed your receipts — a loss needs a return filed with books, not this estimate." };
  }

  const digitalTurnover = (grossReceipts * digitalSharePercent) / 100;
  const cashTurnover = grossReceipts - digitalTurnover;
  const cashSharePercent = 100 - digitalSharePercent;

  const presumptiveLimit =
    cashSharePercent <= PRESUMPTIVE_LOW_CASH_SHARE
      ? PRESUMPTIVE_TURNOVER_LIMIT_LOW_CASH
      : PRESUMPTIVE_TURNOVER_LIMIT;
  const presumptiveAvailable = grossReceipts <= presumptiveLimit;
  const presumptiveIncome =
    (digitalTurnover * PRESUMPTIVE_RATE_DIGITAL) / 100 + (cashTurnover * PRESUMPTIVE_RATE_CASH) / 100;

  const actualBusinessIncome = grossReceipts - totalExpenses;
  const onPresumptive = usePresumptive && presumptiveAvailable;
  const businessIncome = onPresumptive ? presumptiveIncome : actualBusinessIncome;

  const standardDeductionNew = salaryIncome > 0 ? Math.min(STANDARD_DEDUCTION_NEW, salaryIncome) : 0;
  const standardDeductionOld = salaryIncome > 0 ? Math.min(STANDARD_DEDUCTION_OLD, salaryIncome) : 0;

  const chapterVIA =
    Math.min(deduction80C, LIMIT_80C) + deduction80D + Math.min(deduction80CCD1B, LIMIT_80CCD1B);

  const gtiNew = businessIncome + (salaryIncome - standardDeductionNew) + otherIncome;
  const gtiOld = businessIncome + (salaryIncome - standardDeductionOld) + otherIncome;

  const newRegime = taxForRegime({ grossTotalIncome: gtiNew, regime: "new", ageGroup });
  const oldRegime = taxForRegime({
    grossTotalIncome: gtiOld,
    regime: "old",
    ageGroup,
    chapterVIA,
  });

  const better = newRegime.totalTax <= oldRegime.totalTax ? "new" : "old";
  const saving = Math.abs(newRegime.totalTax - oldRegime.totalTax);

  const auditLimit =
    cashSharePercent <= PRESUMPTIVE_LOW_CASH_SHARE
      ? AUDIT_TURNOVER_THRESHOLD_LOW_CASH
      : AUDIT_TURNOVER_THRESHOLD;

  return {
    grossReceipts: round0(grossReceipts),
    digitalTurnover: round0(digitalTurnover),
    cashTurnover: round0(cashTurnover),
    totalExpenses: round0(totalExpenses),
    actualBusinessIncome: round0(actualBusinessIncome),
    presumptiveIncome: round0(presumptiveIncome),
    presumptiveAvailable,
    presumptiveLimit,
    onPresumptive,
    businessIncome: round0(businessIncome),
    expenseRatioPercent:
      grossReceipts > 0 ? Math.round((totalExpenses / grossReceipts) * 10000) / 100 : 0,
    standardDeductionNew: round0(standardDeductionNew),
    standardDeductionOld: round0(standardDeductionOld),
    chapterVIA: round0(chapterVIA),
    grossTotalIncomeNew: round0(gtiNew),
    grossTotalIncomeOld: round0(gtiOld),
    newRegime,
    oldRegime,
    better,
    saving: round0(saving),
    booksRequired: businessIncome > BOOKS_INCOME_THRESHOLD || grossReceipts > BOOKS_TURNOVER_THRESHOLD,
    auditLikely: grossReceipts > auditLimit,
    gstRegistrationLikely: grossReceipts > GST_SERVICE_THRESHOLD,
    advanceTaxDue: Math.min(newRegime.totalTax, oldRegime.totalTax) >= 10000,
  };
}
