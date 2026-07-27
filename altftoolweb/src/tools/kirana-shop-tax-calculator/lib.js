/**
 * Profit and income tax for a kirana / small retail shop run by a resident individual.
 * FY 2025-26 (Assessment Year 2026-27), Finance Act 2025 rates.
 *
 * Trading account
 * ---------------
 *   Cost of goods sold = opening stock + purchases - closing stock
 *   Gross profit       = sales - cost of goods sold
 *   Net profit         = gross profit - operating expenses
 *
 * Section 44AD (presumptive business income)
 * ------------------------------------------
 *   6% of turnover received through banking or electronic modes + 8% of the rest.
 *   Available while turnover is within Rs 2 crore, raised to Rs 3 crore when cash
 *   receipts are at most 5% of turnover. Declaring LESS than the presumptive figure
 *   brings books under section 44AA and an audit under section 44AB(e) into play.
 *
 * GST for a shop selling goods
 * ----------------------------
 *   Registration becomes compulsory past Rs 40 lakh of aggregate turnover for an
 *   exclusive supplier of goods (Rs 20 lakh in the special category states).
 *   The composition levy under section 10 of the CGST Act is 1% of turnover for a
 *   trader (0.5% CGST + 0.5% SGST), available up to Rs 1.5 crore of aggregate
 *   turnover (Rs 75 lakh in the special category states). A composition dealer
 *   cannot collect GST from customers or claim input tax credit.
 */

/** New regime (section 115BAC) slabs, FY 2025-26. */
export const NEW_REGIME_SLABS = [
  { upTo: 400000, rate: 0 },
  { upTo: 800000, rate: 5 },
  { upTo: 1200000, rate: 10 },
  { upTo: 1600000, rate: 15 },
  { upTo: 2000000, rate: 20 },
  { upTo: 2400000, rate: 25 },
  { upTo: Infinity, rate: 30 },
];

/** Old regime bands above the basic exemption. */
export const OLD_REGIME_BANDS = [
  { upTo: 500000, rate: 5 },
  { upTo: 1000000, rate: 20 },
  { upTo: Infinity, rate: 30 },
];

/** Old-regime basic exemption by age. */
export const OLD_REGIME_EXEMPTION = { below60: 250000, senior: 300000, superSenior: 500000 };

export const NEW_REBATE_LIMIT_INCOME = 1200000;
export const NEW_REBATE_MAX = 60000;
export const OLD_REBATE_LIMIT_INCOME = 500000;
export const OLD_REBATE_MAX = 12500;

export const LIMIT_80C = 150000;
/** Health and education cess on tax plus surcharge. */
export const CESS_RATE = 4;

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

export const PRESUMPTIVE_RATE_DIGITAL = 6;
export const PRESUMPTIVE_RATE_CASH = 8;
export const PRESUMPTIVE_TURNOVER_LIMIT = 20000000;
export const PRESUMPTIVE_TURNOVER_LIMIT_LOW_CASH = 30000000;
export const PRESUMPTIVE_LOW_CASH_SHARE = 5;

/** GST registration threshold for an exclusive supplier of goods. */
export const GST_GOODS_THRESHOLD = 4000000;
/** Composition levy rate and turnover ceiling for a trader (section 10, CGST Act). */
export const COMPOSITION_RATE = 1;
export const COMPOSITION_TURNOVER_LIMIT = 15000000;

/** Section 44AA books thresholds for an individual. */
export const BOOKS_INCOME_THRESHOLD = 250000;
export const BOOKS_TURNOVER_THRESHOLD = 2500000;
/** Section 44AB tax-audit turnover thresholds. */
export const AUDIT_TURNOVER_THRESHOLD = 10000000;
export const AUDIT_TURNOVER_THRESHOLD_LOW_CASH = 100000000;

/** Running costs a small shop typically books. */
export const EXPENSE_LINES = [
  { key: "rent", label: "Shop rent" },
  { key: "electricity", label: "Electricity and water" },
  { key: "staff", label: "Salaries and wages" },
  { key: "transport", label: "Transport, loading and delivery" },
  { key: "packing", label: "Packing, carry bags and consumables" },
  { key: "other", label: "Licence fees, repairs and other costs" },
];

const round0 = (value) => Math.round(value);
const pct2 = (value) => Math.round(value * 100) / 100;
const isNum = (value) => typeof value === "number" && Number.isFinite(value);

export function newRegimeSlabTax(taxableIncome) {
  if (!isNum(taxableIncome) || taxableIncome <= 0) return 0;
  let tax = 0;
  let lower = 0;
  for (const slab of NEW_REGIME_SLABS) {
    if (taxableIncome <= lower) break;
    tax += ((Math.min(taxableIncome, slab.upTo) - lower) * slab.rate) / 100;
    lower = slab.upTo;
  }
  return tax;
}

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

function surchargeWithRelief(totalIncome, baseTax, bands, slabTaxFn) {
  let applicable = null;
  for (const band of bands) if (totalIncome > band.over) applicable = band;
  if (!applicable || baseTax <= 0) return { rate: 0, amount: 0, marginalRelief: 0 };
  const raw = (baseTax * applicable.rate) / 100;
  const allowed = slabTaxFn(applicable.over) + (totalIncome - applicable.over) - baseTax;
  if (allowed < raw) {
    const capped = Math.max(0, allowed);
    return { rate: applicable.rate, amount: capped, marginalRelief: raw - capped };
  }
  return { rate: applicable.rate, amount: raw, marginalRelief: 0 };
}

/** Tax for one regime on a given gross total income. */
export function taxForRegime({ grossTotalIncome, regime, ageGroup = "below60", chapterVIA = 0 }) {
  const isNew = regime === "new";
  const deductions = isNew ? 0 : Math.max(0, chapterVIA);
  const taxableIncome = Math.max(0, grossTotalIncome - deductions);
  const slabTaxFn = isNew ? newRegimeSlabTax : (income) => oldRegimeSlabTax(income, ageGroup);
  const slabTax = slabTaxFn(taxableIncome);

  const rebateLimit = isNew ? NEW_REBATE_LIMIT_INCOME : OLD_REBATE_LIMIT_INCOME;
  const rebateMax = isNew ? NEW_REBATE_MAX : OLD_REBATE_MAX;
  let rebate = taxableIncome <= rebateLimit ? Math.min(slabTax, rebateMax) : 0;
  let taxAfterRebate = slabTax - rebate;

  let extraRelief = 0;
  if (isNew && taxableIncome > rebateLimit) {
    const cap = taxableIncome - rebateLimit;
    if (taxAfterRebate > cap) {
      extraRelief = taxAfterRebate - cap;
      taxAfterRebate = cap;
      rebate += extraRelief;
    }
  }

  const sur = surchargeWithRelief(
    taxableIncome,
    taxAfterRebate,
    isNew ? SURCHARGE_BANDS_NEW : SURCHARGE_BANDS_OLD,
    slabTaxFn,
  );
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
    marginalRelief: round0(sur.marginalRelief + extraRelief),
    cess: round0(cess),
    totalTax: round0(totalTax),
    effectiveRate: grossTotalIncome > 0 ? pct2((totalTax / grossTotalIncome) * 100) : 0,
  };
}

/**
 * @param {object} input
 * @param {number} input.sales            Annual sales / turnover of the shop.
 * @param {number} [input.openingStock]
 * @param {number} [input.purchases]
 * @param {number} [input.closingStock]
 * @param {object} [input.expenses]       Map of EXPENSE_LINES keys to amounts.
 * @param {number} [input.digitalSharePercent] Share of sales collected by UPI/card/bank.
 * @param {number} [input.otherIncome]
 * @param {"below60"|"senior"|"superSenior"} [input.ageGroup]
 * @param {number} [input.deduction80C]
 * @param {number} [input.deduction80D]
 * @param {boolean} [input.usePresumptive]
 * @param {boolean} [input.compositionScheme]
 * @returns {object} breakdown, or { error }.
 */
export function computeKiranaTax({
  sales,
  openingStock = 0,
  purchases = 0,
  closingStock = 0,
  expenses = {},
  digitalSharePercent = 30,
  otherIncome = 0,
  ageGroup = "below60",
  deduction80C = 0,
  deduction80D = 0,
  usePresumptive = false,
  compositionScheme = false,
} = {}) {
  if (!isNum(sales) || sales < 0) return { error: "Enter annual sales as a positive number." };
  for (const [label, value] of [
    ["Opening stock", openingStock],
    ["Purchases", purchases],
    ["Closing stock", closingStock],
    ["Other income", otherIncome],
    ["Section 80C", deduction80C],
    ["Section 80D", deduction80D],
  ]) {
    if (!isNum(value)) return { error: `${label} must be a valid number.` };
    if (value < 0) return { error: `${label} cannot be negative.` };
  }
  if (!isNum(digitalSharePercent) || digitalSharePercent < 0 || digitalSharePercent > 100) {
    return { error: "Digital share of sales must be between 0% and 100%." };
  }
  if (!OLD_REGIME_EXEMPTION[ageGroup]) return { error: "Choose a valid age category." };

  let operatingExpenses = 0;
  for (const line of EXPENSE_LINES) {
    const value = expenses[line.key] ?? 0;
    if (!isNum(value)) return { error: "Every expense must be a valid number." };
    if (value < 0) return { error: `${line.label} cannot be negative.` };
    operatingExpenses += value;
  }

  const cogs = openingStock + purchases - closingStock;
  if (cogs < 0) {
    return { error: "Closing stock is larger than opening stock plus purchases — check the figures." };
  }

  const grossProfit = sales - cogs;
  const grossMarginPercent = sales > 0 ? pct2((grossProfit / sales) * 100) : 0;
  const netProfit = grossProfit - operatingExpenses;
  const netMarginPercent = sales > 0 ? pct2((netProfit / sales) * 100) : 0;
  if (netProfit < 0) {
    return { error: "The shop shows a loss — a loss return needs books of account, not this estimate." };
  }

  const digitalTurnover = (sales * digitalSharePercent) / 100;
  const cashTurnover = sales - digitalTurnover;
  const cashSharePercent = 100 - digitalSharePercent;
  const presumptiveLimit =
    cashSharePercent <= PRESUMPTIVE_LOW_CASH_SHARE
      ? PRESUMPTIVE_TURNOVER_LIMIT_LOW_CASH
      : PRESUMPTIVE_TURNOVER_LIMIT;
  const presumptiveAvailable = sales <= presumptiveLimit;
  const presumptiveIncome =
    (digitalTurnover * PRESUMPTIVE_RATE_DIGITAL) / 100 + (cashTurnover * PRESUMPTIVE_RATE_CASH) / 100;

  const onPresumptive = usePresumptive && presumptiveAvailable;
  const businessIncome = onPresumptive ? presumptiveIncome : netProfit;

  const chapterVIA = Math.min(deduction80C, LIMIT_80C) + deduction80D;
  const gti = businessIncome + otherIncome;

  const newRegime = taxForRegime({ grossTotalIncome: gti, regime: "new", ageGroup });
  const oldRegime = taxForRegime({ grossTotalIncome: gti, regime: "old", ageGroup, chapterVIA });
  const better = newRegime.totalTax <= oldRegime.totalTax ? "new" : "old";

  const compositionEligible = sales <= COMPOSITION_TURNOVER_LIMIT;
  const compositionLevy =
    compositionScheme && compositionEligible ? (sales * COMPOSITION_RATE) / 100 : 0;

  const auditLimit =
    cashSharePercent <= PRESUMPTIVE_LOW_CASH_SHARE
      ? AUDIT_TURNOVER_THRESHOLD_LOW_CASH
      : AUDIT_TURNOVER_THRESHOLD;

  return {
    sales: round0(sales),
    cogs: round0(cogs),
    grossProfit: round0(grossProfit),
    grossMarginPercent,
    operatingExpenses: round0(operatingExpenses),
    netProfit: round0(netProfit),
    netMarginPercent,
    /** Rupees of gross profit earned on every 100 rupees of goods bought. */
    markupOnCostPercent: cogs > 0 ? pct2((grossProfit / cogs) * 100) : 0,
    digitalTurnover: round0(digitalTurnover),
    cashTurnover: round0(cashTurnover),
    presumptiveIncome: round0(presumptiveIncome),
    presumptiveAvailable,
    presumptiveLimit,
    onPresumptive,
    /** True when actual profit is under the 44AD figure, which triggers books + audit. */
    belowPresumptive: netProfit < presumptiveIncome,
    businessIncome: round0(businessIncome),
    chapterVIA: round0(chapterVIA),
    grossTotalIncome: round0(gti),
    newRegime,
    oldRegime,
    better,
    saving: round0(Math.abs(newRegime.totalTax - oldRegime.totalTax)),
    compositionEligible,
    compositionLevy: round0(compositionLevy),
    gstRegistrationRequired: sales > GST_GOODS_THRESHOLD,
    booksRequired: businessIncome > BOOKS_INCOME_THRESHOLD || sales > BOOKS_TURNOVER_THRESHOLD,
    auditLikely: sales > auditLimit,
    advanceTaxDue: Math.min(newRegime.totalTax, oldRegime.totalTax) >= 10000,
    /** Total cash the owner keeps after income tax and any composition levy. */
    takeHome: round0(netProfit + otherIncome - Math.min(newRegime.totalTax, oldRegime.totalTax) - compositionLevy),
  };
}
