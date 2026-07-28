/**
 * US federal income tax bracket calculator.
 *
 * The federal income tax is a *marginal* tax: income is sliced at the bracket
 * edges and each slice is taxed at its own rate. Only the slice above a bracket
 * threshold pays that bracket's rate — the whole income never jumps to 37%.
 *
 * Rate schedules below are the statutory ordinary-income brackets:
 *   - Tax year 2025: IRS Rev. Proc. 2024-40 (inflation adjustments for 2025),
 *     with the standard deduction as raised by the One Big Beautiful Bill Act
 *     (P.L. 119-21, July 2025) to $15,750 / $31,500 / $23,625.
 *   - Tax year 2026: IRS Rev. Proc. 2025-32 (inflation adjustments for 2026).
 *
 * This module handles ordinary income only. Long-term capital gains, qualified
 * dividends, the alternative minimum tax, credits, self-employment tax, state
 * tax and payroll tax are separate systems and are deliberately not modelled.
 */

/** Filing statuses recognised by the federal rate schedules. */
export const FILING_STATUSES = [
  { value: "single", label: "Single" },
  { value: "mfj", label: "Married filing jointly" },
  { value: "mfs", label: "Married filing separately" },
  { value: "hoh", label: "Head of household" },
];

/**
 * Bracket tables. Each entry is { rate, upTo } where `upTo` is the top of that
 * bracket measured in TAXABLE income (after deductions). The final bracket uses
 * Infinity because it has no ceiling.
 */
export const TAX_YEARS = {
  2025: {
    year: 2025,
    // IRS Rev. Proc. 2024-40 §2.01, as amended for the standard deduction by P.L. 119-21.
    source: "IRS Rev. Proc. 2024-40 (brackets) and P.L. 119-21 (standard deduction)",
    standardDeduction: {
      single: 15750,
      mfj: 31500,
      mfs: 15750,
      hoh: 23625,
    },
    // Additional standard deduction per person aged 65 or older (Rev. Proc. 2024-40).
    additionalAge65: { single: 2000, mfj: 1600, mfs: 1600, hoh: 2000 },
    brackets: {
      single: [
        { rate: 0.1, upTo: 11925 },
        { rate: 0.12, upTo: 48475 },
        { rate: 0.22, upTo: 103350 },
        { rate: 0.24, upTo: 197300 },
        { rate: 0.32, upTo: 250525 },
        { rate: 0.35, upTo: 626350 },
        { rate: 0.37, upTo: Infinity },
      ],
      mfj: [
        { rate: 0.1, upTo: 23850 },
        { rate: 0.12, upTo: 96950 },
        { rate: 0.22, upTo: 206700 },
        { rate: 0.24, upTo: 394600 },
        { rate: 0.32, upTo: 501050 },
        { rate: 0.35, upTo: 751600 },
        { rate: 0.37, upTo: Infinity },
      ],
      mfs: [
        { rate: 0.1, upTo: 11925 },
        { rate: 0.12, upTo: 48475 },
        { rate: 0.22, upTo: 103350 },
        { rate: 0.24, upTo: 197300 },
        { rate: 0.32, upTo: 250525 },
        { rate: 0.35, upTo: 375800 },
        { rate: 0.37, upTo: Infinity },
      ],
      hoh: [
        { rate: 0.1, upTo: 17000 },
        { rate: 0.12, upTo: 64850 },
        { rate: 0.22, upTo: 103350 },
        { rate: 0.24, upTo: 197300 },
        { rate: 0.32, upTo: 250500 },
        { rate: 0.35, upTo: 626350 },
        { rate: 0.37, upTo: Infinity },
      ],
    },
  },
  2026: {
    year: 2026,
    source: "IRS Rev. Proc. 2025-32",
    standardDeduction: {
      single: 16100,
      mfj: 32200,
      mfs: 16100,
      hoh: 24150,
    },
    additionalAge65: { single: 2050, mfj: 1650, mfs: 1650, hoh: 2050 },
    brackets: {
      single: [
        { rate: 0.1, upTo: 12400 },
        { rate: 0.12, upTo: 50400 },
        { rate: 0.22, upTo: 105700 },
        { rate: 0.24, upTo: 201775 },
        { rate: 0.32, upTo: 256225 },
        { rate: 0.35, upTo: 640600 },
        { rate: 0.37, upTo: Infinity },
      ],
      mfj: [
        { rate: 0.1, upTo: 24800 },
        { rate: 0.12, upTo: 100800 },
        { rate: 0.22, upTo: 211400 },
        { rate: 0.24, upTo: 403550 },
        { rate: 0.32, upTo: 512450 },
        { rate: 0.35, upTo: 768700 },
        { rate: 0.37, upTo: Infinity },
      ],
      mfs: [
        { rate: 0.1, upTo: 12400 },
        { rate: 0.12, upTo: 50400 },
        { rate: 0.22, upTo: 105700 },
        { rate: 0.24, upTo: 201775 },
        { rate: 0.32, upTo: 256225 },
        { rate: 0.35, upTo: 384350 },
        { rate: 0.37, upTo: Infinity },
      ],
      hoh: [
        { rate: 0.1, upTo: 17700 },
        { rate: 0.12, upTo: 67450 },
        { rate: 0.22, upTo: 105700 },
        { rate: 0.24, upTo: 201775 },
        { rate: 0.32, upTo: 256200 },
        { rate: 0.35, upTo: 640600 },
        { rate: 0.37, upTo: Infinity },
      ],
    },
  },
};

/** Guard rail: refuse absurd inputs rather than returning a meaningless number. */
export const MAX_INCOME = 1e12;

const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const round2 = (v) => Math.round(v * 100) / 100;

/**
 * Slice a taxable income across a bracket schedule.
 * @returns {{ tax: number, slices: Array }}
 */
export function sliceIntoBrackets(taxableIncome, brackets) {
  const slices = [];
  let tax = 0;
  let lower = 0;
  for (const bracket of brackets) {
    const top = Math.min(taxableIncome, bracket.upTo);
    const amountInBracket = Math.max(0, top - lower);
    const taxInBracket = amountInBracket * bracket.rate;
    tax += taxInBracket;
    slices.push({
      rate: bracket.rate,
      from: lower,
      to: bracket.upTo,
      amountTaxed: round2(amountInBracket),
      tax: round2(taxInBracket),
      isCurrent: amountInBracket > 0,
    });
    lower = bracket.upTo;
    if (taxableIncome <= bracket.upTo) break;
  }
  // Brackets above the income still belong in the table, with zero taxed.
  for (let i = slices.length; i < brackets.length; i += 1) {
    const bracket = brackets[i];
    slices.push({
      rate: bracket.rate,
      from: i === 0 ? 0 : brackets[i - 1].upTo,
      to: bracket.upTo,
      amountTaxed: 0,
      tax: 0,
      isCurrent: false,
    });
  }
  return { tax: round2(tax), slices };
}

/**
 * Full bracket calculation.
 *
 * @param {object} input
 * @param {number} input.grossIncome    Total ordinary income before deductions.
 * @param {string} input.filingStatus   One of FILING_STATUSES values.
 * @param {number|string} input.year    2025 or 2026.
 * @param {string} input.deductionMode  "standard" or "itemized".
 * @param {number} input.itemizedAmount Itemized deduction total (used when mode is itemized).
 * @param {number} input.age65Count     People aged 65+ claiming the extra standard deduction (0-2).
 * @param {number} input.preTaxContributions 401(k)/HSA style above-the-line reductions.
 */
export function calculateTaxBrackets({
  grossIncome,
  filingStatus = "single",
  year = 2025,
  deductionMode = "standard",
  itemizedAmount = 0,
  age65Count = 0,
  preTaxContributions = 0,
} = {}) {
  const table = TAX_YEARS[String(year)];
  if (!table) return { error: "Pick a tax year the IRS has published rates for (2025 or 2026)." };

  const brackets = table.brackets[filingStatus];
  if (!brackets) return { error: "Pick a filing status: single, married joint, married separate or head of household." };

  if (!isNum(grossIncome)) return { error: "Enter your total income as a number." };
  if (grossIncome < 0) return { error: "Income cannot be negative." };
  if (grossIncome > MAX_INCOME) return { error: "That income is beyond what this calculator handles." };

  const preTax = isNum(preTaxContributions) && preTaxContributions > 0 ? preTaxContributions : 0;
  if (preTax > grossIncome) return { error: "Pre-tax contributions cannot exceed your total income." };

  const seniors = isNum(age65Count) ? Math.min(2, Math.max(0, Math.floor(age65Count))) : 0;
  const standard =
    table.standardDeduction[filingStatus] + seniors * table.additionalAge65[filingStatus];

  const itemized = isNum(itemizedAmount) && itemizedAmount > 0 ? itemizedAmount : 0;
  const usingItemized = deductionMode === "itemized";
  const deduction = usingItemized ? itemized : standard;

  const adjustedGross = grossIncome - preTax;
  const taxableIncome = Math.max(0, adjustedGross - deduction);

  const { tax, slices } = sliceIntoBrackets(taxableIncome, brackets);

  // Marginal rate = the rate on the next dollar of taxable income.
  let marginalRate = brackets[0].rate;
  for (const bracket of brackets) {
    if (taxableIncome <= bracket.upTo) {
      marginalRate = bracket.rate;
      break;
    }
  }
  // Zero taxable income means the next dollar is still shielded by the deduction.
  if (taxableIncome === 0) marginalRate = 0;

  // Effective rates. Guard the division so a zero income never yields NaN.
  const effectiveOnTaxable = taxableIncome > 0 ? tax / taxableIncome : 0;
  const effectiveOnGross = grossIncome > 0 ? tax / grossIncome : 0;

  // Headroom: how much more taxable income fits before the next bracket starts.
  const currentBracket = brackets.find((b) => taxableIncome <= b.upTo) || brackets[brackets.length - 1];
  const headroom = Number.isFinite(currentBracket.upTo)
    ? round2(currentBracket.upTo - taxableIncome)
    : null;

  return {
    year: table.year,
    source: table.source,
    filingStatus,
    grossIncome: round2(grossIncome),
    preTaxContributions: round2(preTax),
    adjustedGross: round2(adjustedGross),
    standardDeduction: round2(standard),
    itemizedDeduction: round2(itemized),
    deductionUsed: round2(deduction),
    deductionKind: usingItemized ? "Itemized" : "Standard",
    taxableIncome: round2(taxableIncome),
    totalTax: tax,
    afterTaxIncome: round2(grossIncome - tax),
    marginalRate,
    effectiveRateOnTaxable: effectiveOnTaxable,
    effectiveRateOnGross: effectiveOnGross,
    topBracketRate: currentBracket.rate,
    headroomToNextBracket: headroom,
    slices,
  };
}
