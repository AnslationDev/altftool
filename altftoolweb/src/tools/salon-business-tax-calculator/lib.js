/**
 * Salon / beauty parlour economics and income tax, FY 2025-26 (AY 2026-27).
 *
 * Revenue is built from chair capacity, which is how salons are actually planned:
 *
 *   Service revenue = chairs x clients per chair per day x working days x average ticket
 *   Total revenue   = service revenue + retail product sales
 *
 * Variable costs scale with revenue:
 *   consumables (colour, shampoo, wax, disposables) as a % of service revenue,
 *   stylist commission as a % of service revenue,
 *   cost of retail product sold as a % of retail sales.
 *
 *   Contribution per client = average ticket x (1 - consumables% - commission%)
 *   Break-even clients      = (annual fixed cost - retail gross profit) / contribution per client
 *
 * Tax treatment: a salon is a business, not one of the professions notified under
 * section 44AA(1), so the presumptive route is section 44AD - 6% of turnover received
 * through banking or electronic modes and 8% of the rest.
 *
 * GST: services cross the registration threshold at Rs 20 lakh of aggregate turnover
 * (Rs 10 lakh in the special category states). The composition option for service
 * providers under section 10(2A) of the CGST Act is 6% of turnover (3% CGST + 3% SGST)
 * and is available only up to Rs 50 lakh of aggregate turnover. Beauty and physical
 * well-being services were moved to 5% without input tax credit by the 56th GST
 * Council with effect from 22 September 2025, so the rate is left as an input.
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
export const OLD_REGIME_BANDS = [
  { upTo: 500000, rate: 5 },
  { upTo: 1000000, rate: 20 },
  { upTo: Infinity, rate: 30 },
];
export const OLD_REGIME_EXEMPTION = { below60: 250000, senior: 300000, superSenior: 500000 };

export const NEW_REBATE_LIMIT_INCOME = 1200000;
export const NEW_REBATE_MAX = 60000;
export const OLD_REBATE_LIMIT_INCOME = 500000;
export const OLD_REBATE_MAX = 12500;
export const LIMIT_80C = 150000;
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

/** GST registration threshold for a supplier of services. */
export const GST_SERVICE_THRESHOLD = 2000000;
/** Section 10(2A) composition option for service providers. */
export const SERVICE_COMPOSITION_RATE = 6;
export const SERVICE_COMPOSITION_LIMIT = 5000000;
/** GST rate on beauty and physical well-being services after the 56th Council meeting. */
export const DEFAULT_SERVICE_GST_RATE = 5;

export const BOOKS_INCOME_THRESHOLD = 250000;
export const BOOKS_TURNOVER_THRESHOLD = 2500000;
export const AUDIT_TURNOVER_THRESHOLD = 10000000;
export const AUDIT_TURNOVER_THRESHOLD_LOW_CASH = 100000000;

/** Fixed monthly overheads a salon carries whether chairs are busy or not. */
export const FIXED_COST_LINES = [
  { key: "rent", label: "Shop rent per month" },
  { key: "fixedSalaries", label: "Fixed salaries (reception, helper) per month" },
  { key: "utilities", label: "Electricity, water and internet per month" },
  { key: "marketing", label: "Marketing and listings per month" },
  { key: "other", label: "Licences, laundry, software and other per month" },
];

export const MONTHS_IN_YEAR = 12;

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
 * @param {number} input.chairs                 Working stylist chairs / beds.
 * @param {number} input.clientsPerChairPerDay  Average clients served per chair each open day.
 * @param {number} input.workingDays            Open days in the year.
 * @param {number} input.averageTicket          Average bill per service client.
 * @param {number} [input.retailSales]          Annual sale of shampoos, creams and other products.
 * @param {number} [input.consumablesPercent]   Colour, wax and disposables as % of service revenue.
 * @param {number} [input.commissionPercent]    Stylist commission as % of service revenue.
 * @param {number} [input.retailCostPercent]    Cost of retail goods as % of retail sales.
 * @param {object} [input.fixedCosts]           Monthly amounts keyed by FIXED_COST_LINES.
 * @param {number} [input.digitalSharePercent]  Share of collections through UPI/card/bank.
 * @param {number} [input.serviceGstRate]       GST rate charged on services.
 * @param {"below60"|"senior"|"superSenior"} [input.ageGroup]
 * @param {number} [input.deduction80C]
 * @param {number} [input.deduction80D]
 * @param {boolean} [input.usePresumptive]
 * @returns {object} breakdown, or { error }.
 */
export function computeSalonBusiness({
  chairs,
  clientsPerChairPerDay,
  workingDays,
  averageTicket,
  retailSales = 0,
  consumablesPercent = 12,
  commissionPercent = 20,
  retailCostPercent = 60,
  fixedCosts = {},
  digitalSharePercent = 70,
  serviceGstRate = DEFAULT_SERVICE_GST_RATE,
  ageGroup = "below60",
  deduction80C = 0,
  deduction80D = 0,
  usePresumptive = false,
} = {}) {
  if (!isNum(chairs) || chairs < 1) return { error: "You need at least one working chair." };
  if (!isNum(clientsPerChairPerDay) || clientsPerChairPerDay <= 0) {
    return { error: "Clients per chair per day must be greater than zero." };
  }
  if (!isNum(workingDays) || workingDays <= 0 || workingDays > 366) {
    return { error: "Working days must be between 1 and 366." };
  }
  if (!isNum(averageTicket) || averageTicket <= 0) {
    return { error: "Average ticket must be greater than zero." };
  }
  if (!isNum(retailSales) || retailSales < 0) return { error: "Retail sales cannot be negative." };
  for (const [label, value] of [
    ["Consumables", consumablesPercent],
    ["Stylist commission", commissionPercent],
    ["Retail cost", retailCostPercent],
    ["Digital share", digitalSharePercent],
    ["GST rate", serviceGstRate],
  ]) {
    if (!isNum(value) || value < 0 || value > 100) {
      return { error: `${label} must be a percentage between 0 and 100.` };
    }
  }
  if (consumablesPercent + commissionPercent >= 100) {
    return { error: "Consumables plus commission must stay under 100% of service revenue." };
  }
  for (const value of [deduction80C, deduction80D]) {
    if (!isNum(value) || value < 0) return { error: "Deductions cannot be negative." };
  }
  if (!OLD_REGIME_EXEMPTION[ageGroup]) return { error: "Choose a valid age category." };

  let monthlyFixed = 0;
  for (const line of FIXED_COST_LINES) {
    const value = fixedCosts[line.key] ?? 0;
    if (!isNum(value)) return { error: "Every fixed cost must be a valid number." };
    if (value < 0) return { error: `${line.label} cannot be negative.` };
    monthlyFixed += value;
  }
  const annualFixed = monthlyFixed * MONTHS_IN_YEAR;

  const clientsPerYear = chairs * clientsPerChairPerDay * workingDays;
  const serviceRevenue = clientsPerYear * averageTicket;
  const totalRevenue = serviceRevenue + retailSales;

  const consumablesCost = (serviceRevenue * consumablesPercent) / 100;
  const commissionCost = (serviceRevenue * commissionPercent) / 100;
  const retailCost = (retailSales * retailCostPercent) / 100;
  const variableCost = consumablesCost + commissionCost + retailCost;

  const grossProfit = totalRevenue - variableCost;
  const netProfit = grossProfit - annualFixed;
  const netMarginPercent = totalRevenue > 0 ? pct2((netProfit / totalRevenue) * 100) : 0;

  const contributionPerClient = averageTicket * (1 - (consumablesPercent + commissionPercent) / 100);
  const retailGrossProfit = retailSales - retailCost;
  const fixedToRecover = Math.max(0, annualFixed - retailGrossProfit);
  const breakEvenClientsYear =
    contributionPerClient > 0 ? Math.ceil(fixedToRecover / contributionPerClient) : null;
  const breakEvenClientsDay =
    breakEvenClientsYear === null ? null : pct2(breakEvenClientsYear / workingDays);
  const breakEvenPerChairDay =
    breakEvenClientsYear === null ? null : pct2(breakEvenClientsYear / workingDays / chairs);
  const capacityUsedAtBreakEven =
    breakEvenClientsYear === null || clientsPerYear <= 0
      ? null
      : pct2((breakEvenClientsYear / clientsPerYear) * 100);

  const digitalTurnover = (totalRevenue * digitalSharePercent) / 100;
  const cashTurnover = totalRevenue - digitalTurnover;
  const presumptiveLimit =
    100 - digitalSharePercent <= PRESUMPTIVE_LOW_CASH_SHARE
      ? PRESUMPTIVE_TURNOVER_LIMIT_LOW_CASH
      : PRESUMPTIVE_TURNOVER_LIMIT;
  const presumptiveAvailable = totalRevenue <= presumptiveLimit;
  const presumptiveIncome =
    (digitalTurnover * PRESUMPTIVE_RATE_DIGITAL) / 100 + (cashTurnover * PRESUMPTIVE_RATE_CASH) / 100;

  const profitForTax = Math.max(0, netProfit);
  const onPresumptive = usePresumptive && presumptiveAvailable;
  const businessIncome = onPresumptive ? presumptiveIncome : profitForTax;

  const chapterVIA = Math.min(deduction80C, LIMIT_80C) + deduction80D;
  const newRegime = taxForRegime({ grossTotalIncome: businessIncome, regime: "new", ageGroup });
  const oldRegime = taxForRegime({
    grossTotalIncome: businessIncome,
    regime: "old",
    ageGroup,
    chapterVIA,
  });
  const better = newRegime.totalTax <= oldRegime.totalTax ? "new" : "old";

  const auditLimit =
    100 - digitalSharePercent <= PRESUMPTIVE_LOW_CASH_SHARE
      ? AUDIT_TURNOVER_THRESHOLD_LOW_CASH
      : AUDIT_TURNOVER_THRESHOLD;

  return {
    clientsPerYear: round0(clientsPerYear),
    clientsPerDay: pct2(clientsPerYear / workingDays),
    serviceRevenue: round0(serviceRevenue),
    retailSales: round0(retailSales),
    totalRevenue: round0(totalRevenue),
    revenuePerChair: round0(serviceRevenue / chairs),
    consumablesCost: round0(consumablesCost),
    commissionCost: round0(commissionCost),
    retailCost: round0(retailCost),
    variableCost: round0(variableCost),
    grossProfit: round0(grossProfit),
    grossMarginPercent: totalRevenue > 0 ? pct2((grossProfit / totalRevenue) * 100) : 0,
    monthlyFixed: round0(monthlyFixed),
    annualFixed: round0(annualFixed),
    netProfit: round0(netProfit),
    netMarginPercent,
    isLoss: netProfit < 0,
    contributionPerClient: pct2(contributionPerClient),
    breakEvenClientsYear,
    breakEvenClientsDay,
    breakEvenPerChairDay,
    capacityUsedAtBreakEven,
    presumptiveIncome: round0(presumptiveIncome),
    presumptiveAvailable,
    onPresumptive,
    businessIncome: round0(businessIncome),
    chapterVIA: round0(chapterVIA),
    newRegime,
    oldRegime,
    better,
    saving: round0(Math.abs(newRegime.totalTax - oldRegime.totalTax)),
    serviceGstRate,
    gstOnServices: round0((serviceRevenue * serviceGstRate) / 100),
    gstRegistrationRequired: totalRevenue > GST_SERVICE_THRESHOLD,
    serviceCompositionEligible: totalRevenue <= SERVICE_COMPOSITION_LIMIT,
    serviceCompositionLevy: round0((totalRevenue * SERVICE_COMPOSITION_RATE) / 100),
    booksRequired: businessIncome > BOOKS_INCOME_THRESHOLD || totalRevenue > BOOKS_TURNOVER_THRESHOLD,
    auditLikely: totalRevenue > auditLimit,
    advanceTaxDue: Math.min(newRegime.totalTax, oldRegime.totalTax) >= 10000,
    profitAfterTax: round0(netProfit - Math.min(newRegime.totalTax, oldRegime.totalTax)),
  };
}
