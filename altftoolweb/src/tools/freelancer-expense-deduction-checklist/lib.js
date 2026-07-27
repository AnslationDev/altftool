/**
 * Deductible expenses for an Indian freelancer, and the choice between claiming actual
 * expenses and the Section 44ADA presumptive scheme.
 *
 * Rule sources (Income-tax Act, 1961 unless stated):
 *  - Section 37(1): any expenditure laid out wholly and exclusively for the profession,
 *    not being capital or personal expenditure, is allowed.
 *  - Sections 30 and 31: rent, rates, repairs and insurance of premises and equipment.
 *  - Section 36(1)(iii): interest on capital borrowed for the profession.
 *  - Section 32 and Appendix I to the Income-tax Rules, 1962: depreciation on the written
 *    down value, at half rate if the asset is used for under 180 days in the year it is bought.
 *  - Section 40A(3): a payment above ₹10,000 to one person in one day, otherwise than by
 *    account payee cheque, draft or electronic mode, is disallowed in full.
 *  - Section 40(a)(ia): 30% of a payment to a resident is disallowed where tax was
 *    deductible at source and was not deducted or not paid.
 *  - Section 44ADA: specified professionals with gross receipts up to ₹50 lakh — ₹75 lakh
 *    where cash receipts are 5% or less of total receipts, per the Finance Act 2023 — may
 *    declare 50% of receipts as profit and claim no further expenses.
 *  - Section 44AB: a profession needs a tax audit once gross receipts exceed ₹50 lakh.
 */

/** Section 40A(3) ceiling on a cash payment to one person in one day. */
export const CASH_PAYMENT_LIMIT = 10000;

/** Section 40(a)(ia) disallowance where TDS was due but not deducted or paid. */
export const TDS_DISALLOWANCE_PCT = 30;

/** Section 44ADA deemed profit rate. */
export const PRESUMPTIVE_PROFIT_PCT = 50;

/** Section 44ADA base ceiling on gross receipts. */
export const PRESUMPTIVE_LIMIT_BASE = 5000000;

/** Section 44ADA enhanced ceiling when cash receipts stay within the cash test. */
export const PRESUMPTIVE_LIMIT_ENHANCED = 7500000;

/** Cash receipts must be within this share of total receipts for the enhanced ceiling. */
export const PRESUMPTIVE_CASH_RECEIPTS_PCT = 5;

/** Section 44AB audit threshold for a profession. */
export const PROFESSION_AUDIT_LIMIT = 5000000;

/** Second proviso to Section 32(1): under this many days of use means half depreciation. */
export const HALF_DEPRECIATION_DAYS = 180;

/**
 * Professions listed in Section 44AA(1), which are the ones Section 44ADA covers.
 * A freelancer outside this list cannot use 44ADA and should look at Section 44AD instead.
 */
export const SPECIFIED_PROFESSIONS = [
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

/**
 * Revenue expense heads a freelancer commonly claims, each tied to the section that allows
 * it. `tdsCommon` marks heads where tax is usually deductible at source, so a missed
 * deduction triggers the Section 40(a)(ia) disallowance.
 */
export const EXPENSE_HEADS = [
  {
    id: "rent",
    label: "Office or coworking rent",
    section: "Section 30",
    note: "Rent for premises used for the profession. Tax is deductible at source once the rent crosses the threshold in Section 194-I or 194-IB.",
    tdsCommon: true,
  },
  {
    id: "utilities",
    label: "Electricity, water and maintenance",
    section: "Section 37(1)",
    note: "Only the share used for the profession. Apportion a home office honestly and keep the working.",
    tdsCommon: false,
  },
  {
    id: "internet",
    label: "Internet and phone",
    section: "Section 37(1)",
    note: "The business share of the bill. A single connection used for work and home has to be split.",
    tdsCommon: false,
  },
  {
    id: "software",
    label: "Software, cloud hosting and subscriptions",
    section: "Section 37(1)",
    note: "Annual or monthly licences are revenue expenditure. A perpetual licence bought outright is capital and goes into depreciation instead.",
    tdsCommon: false,
  },
  {
    id: "contractors",
    label: "Subcontractor and professional fees",
    section: "Section 37(1)",
    note: "Payments to other freelancers, designers, accountants or lawyers. TDS under Section 194J or 194C usually applies.",
    tdsCommon: true,
  },
  {
    id: "salaries",
    label: "Salaries and wages to staff",
    section: "Section 37(1)",
    note: "Salary paid to assistants or employees, with TDS under Section 192 where the pay is taxable.",
    tdsCommon: true,
  },
  {
    id: "travel",
    label: "Travel and conveyance for work",
    section: "Section 37(1)",
    note: "Client visits, conferences and site work. Personal and family travel is not deductible.",
    tdsCommon: false,
  },
  {
    id: "marketing",
    label: "Marketing, advertising and website",
    section: "Section 37(1)",
    note: "Ads, domain and hosting renewals, portfolio and design costs.",
    tdsCommon: false,
  },
  {
    id: "bank",
    label: "Bank charges and payment gateway fees",
    section: "Section 37(1)",
    note: "Transaction fees, foreign inward remittance charges and gateway commissions on client payments.",
    tdsCommon: false,
  },
  {
    id: "learning",
    label: "Professional memberships, courses and books",
    section: "Section 37(1)",
    note: "Costs that maintain or update existing professional skills.",
    tdsCommon: false,
  },
  {
    id: "insurance",
    label: "Insurance on business assets",
    section: "Section 31",
    note: "Insurance of premises, equipment and professional indemnity cover. Personal life and health cover belongs under Chapter VI-A, not here.",
    tdsCommon: false,
  },
  {
    id: "interest",
    label: "Interest on a business loan",
    section: "Section 36(1)(iii)",
    note: "Interest on capital borrowed for the profession, including a business overdraft.",
    tdsCommon: false,
  },
  {
    id: "repairs",
    label: "Repairs to premises and equipment",
    section: "Sections 30 and 31",
    note: "Current repairs. Anything that creates a new asset or an enduring advantage is capital.",
    tdsCommon: false,
  },
];

/** Depreciation blocks from Appendix I to the Income-tax Rules, with written-down-value rates. */
export const DEPRECIATION_BLOCKS = [
  { id: "computers", label: "Computers, laptops and software", rate: 40 },
  { id: "plant", label: "Plant and machinery, cameras, general equipment", rate: 15 },
  { id: "vehicles", label: "Motor vehicles (not used for hire)", rate: 15 },
  { id: "furniture", label: "Furniture and fittings", rate: 10 },
];

const round2 = (value) => Math.round(value * 100) / 100;
const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Total the expense heads and apply the two statutory disallowances.
 *
 * @param {Array<{id: string, amount: number, cashPaidAboveLimit?: number, tdsRequired?: boolean, tdsDeducted?: boolean}>} entries
 * @returns {object} { lines, totalClaimed, cashDisallowed, tdsDisallowed, totalAllowed } or { error }
 */
export function computeDeductibleExpenses(entries = []) {
  if (!Array.isArray(entries)) return { error: "Expense entries must be a list." };

  const lines = [];
  let totalClaimed = 0;
  let cashDisallowed = 0;
  let tdsDisallowed = 0;

  for (const entry of entries) {
    const head = EXPENSE_HEADS.find((item) => item.id === entry.id);
    if (!head) return { error: `Unknown expense head: ${entry.id}` };

    const amount = isNum(entry.amount) ? entry.amount : 0;
    if (amount < 0) return { error: `${head.label} cannot be a negative amount.` };

    const cashPortion = isNum(entry.cashPaidAboveLimit) ? entry.cashPaidAboveLimit : 0;
    if (cashPortion < 0) return { error: `The cash portion of ${head.label} cannot be negative.` };
    if (cashPortion > amount) {
      return { error: `The cash portion of ${head.label} cannot exceed the amount spent on it.` };
    }

    // Section 40A(3): the whole cash payment is disallowed, not just the excess over ₹10,000.
    const afterCash = amount - cashPortion;
    const tdsFails = Boolean(entry.tdsRequired) && !entry.tdsDeducted;
    const tdsCut = tdsFails ? (afterCash * TDS_DISALLOWANCE_PCT) / 100 : 0;
    const allowed = afterCash - tdsCut;

    totalClaimed += amount;
    cashDisallowed += cashPortion;
    tdsDisallowed += tdsCut;

    lines.push({
      id: head.id,
      label: head.label,
      section: head.section,
      amount: round2(amount),
      cashDisallowed: round2(cashPortion),
      tdsDisallowed: round2(tdsCut),
      allowed: round2(allowed),
    });
  }

  return {
    lines,
    totalClaimed: round2(totalClaimed),
    cashDisallowed: round2(cashDisallowed),
    tdsDisallowed: round2(tdsDisallowed),
    totalDisallowed: round2(cashDisallowed + tdsDisallowed),
    totalAllowed: round2(totalClaimed - cashDisallowed - tdsDisallowed),
  };
}

/**
 * Depreciation on capital assets under Section 32, on the written down value.
 *
 * @param {Array<{blockId: string, cost: number, daysUsed?: number}>} assets
 * @returns {object} { lines, totalDepreciation } or { error }
 */
export function computeDepreciation(assets = []) {
  if (!Array.isArray(assets)) return { error: "Assets must be a list." };

  const lines = [];
  let totalDepreciation = 0;

  for (const asset of assets) {
    const block = DEPRECIATION_BLOCKS.find((item) => item.id === asset.blockId);
    if (!block) return { error: `Unknown depreciation block: ${asset.blockId}` };

    const cost = isNum(asset.cost) ? asset.cost : 0;
    if (cost < 0) return { error: `${block.label} cannot have a negative cost.` };

    const daysUsed = isNum(asset.daysUsed) ? asset.daysUsed : 365;
    if (daysUsed < 0 || daysUsed > 366) {
      return { error: "Days of use in the year must be between 0 and 366." };
    }

    const halfRate = daysUsed < HALF_DEPRECIATION_DAYS;
    const effectiveRate = halfRate ? block.rate / 2 : block.rate;
    const depreciation = (cost * effectiveRate) / 100;

    totalDepreciation += depreciation;
    lines.push({
      blockId: block.id,
      label: block.label,
      cost: round2(cost),
      rate: block.rate,
      effectiveRate: round2(effectiveRate),
      halfRate,
      depreciation: round2(depreciation),
      closingWdv: round2(cost - depreciation),
    });
  }

  return { lines, totalDepreciation: round2(totalDepreciation) };
}

/**
 * Compare the actual-expense route with the Section 44ADA presumptive route.
 *
 * @param {object} input
 * @param {number} input.grossReceipts
 * @param {number} input.allowedExpenses
 * @param {number} [input.depreciation]
 * @param {number} [input.cashReceiptsPct] Cash receipts as a share of total receipts.
 * @param {boolean} [input.isSpecifiedProfession] Is the work inside the Section 44AA(1) list?
 * @returns {object} comparison, or { error }
 */
export function compareTaxationMethods({
  grossReceipts,
  allowedExpenses,
  depreciation = 0,
  cashReceiptsPct = 0,
  isSpecifiedProfession = true,
} = {}) {
  if (!isNum(grossReceipts) || grossReceipts <= 0) {
    return { error: "Enter your gross professional receipts for the year." };
  }
  if (!isNum(allowedExpenses) || allowedExpenses < 0) {
    return { error: "Allowable expenses cannot be negative." };
  }
  if (!isNum(depreciation) || depreciation < 0) {
    return { error: "Depreciation cannot be negative." };
  }
  if (!isNum(cashReceiptsPct) || cashReceiptsPct < 0 || cashReceiptsPct > 100) {
    return { error: "Cash receipts must be between 0% and 100% of total receipts." };
  }

  const cashTestMet = cashReceiptsPct <= PRESUMPTIVE_CASH_RECEIPTS_PCT;
  const presumptiveLimit = cashTestMet ? PRESUMPTIVE_LIMIT_ENHANCED : PRESUMPTIVE_LIMIT_BASE;
  const presumptiveEligible = isSpecifiedProfession && grossReceipts <= presumptiveLimit;

  const totalDeductions = allowedExpenses + depreciation;
  const actualProfit = grossReceipts - totalDeductions;
  const presumptiveProfit = (grossReceipts * PRESUMPTIVE_PROFIT_PCT) / 100;

  let recommendation;
  if (!presumptiveEligible) {
    recommendation = isSpecifiedProfession
      ? `Gross receipts of ₹${Math.round(grossReceipts).toLocaleString("en-IN")} are above the ₹${presumptiveLimit.toLocaleString("en-IN")} ceiling, so Section 44ADA is not available and actual expenses must be claimed with books of account.`
      : "Section 44ADA covers only the professions listed in Section 44AA(1). Work outside that list is assessed on actual expenses, or under Section 44AD if it qualifies as a business.";
  } else if (presumptiveProfit < actualProfit) {
    recommendation = `Section 44ADA declares a lower profit by ₹${Math.round(actualProfit - presumptiveProfit).toLocaleString("en-IN")}, and removes the need to keep detailed expense records.`;
  } else if (presumptiveProfit > actualProfit) {
    recommendation = `Claiming actual expenses declares a lower profit by ₹${Math.round(presumptiveProfit - actualProfit).toLocaleString("en-IN")}, but it means maintaining books of account and, if profit is declared below 50%, a tax audit where total income exceeds the basic exemption limit.`;
  } else {
    recommendation = "Both routes land on the same profit, so the simpler presumptive route is worth considering.";
  }

  return {
    grossReceipts: round2(grossReceipts),
    allowedExpenses: round2(allowedExpenses),
    depreciation: round2(depreciation),
    totalDeductions: round2(totalDeductions),
    actualProfit: round2(actualProfit),
    actualMarginPct: round2((actualProfit / grossReceipts) * 100),
    presumptiveProfit: round2(presumptiveProfit),
    presumptiveEligible,
    presumptiveLimit,
    cashTestMet,
    lowerProfit: presumptiveEligible ? round2(Math.min(actualProfit, presumptiveProfit)) : round2(actualProfit),
    difference: presumptiveEligible ? round2(Math.abs(actualProfit - presumptiveProfit)) : 0,
    auditLikely: grossReceipts > PROFESSION_AUDIT_LIMIT,
    isLoss: actualProfit < 0,
    recommendation,
  };
}
