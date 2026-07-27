/**
 * Kerala professional tax.
 *
 * Source of the rule: Kerala is one of the few states where profession tax is
 * levied by the LOCAL BODY, not by a state commercial-tax department -
 * section 245 of the Kerala Municipality Act, 1994 for municipalities and
 * corporations, and section 204 of the Kerala Panchayat Raj Act, 1994 for grama
 * panchayats. Both use the same nine-band slab and both charge on income for a
 * HALF YEAR: 1 April to 30 September, and 1 October to 31 March.
 *
 * Article 276(2) of the Constitution of India caps profession tax at Rs 2,500 per
 * person per year, which is why the top band is Rs 1,250 per half year.
 *
 * Pure module: no React, no DOM, no clocks.
 */

/** Constitutional ceiling on profession tax per person per year - Art. 276(2). */
export const ANNUAL_PT_CEILING = 2500;

/** Two half-years of the Indian financial year. */
export const HALF_YEARS = [
  { key: "h1", label: "1 April to 30 September", short: "First half (Apr-Sep)" },
  { key: "h2", label: "1 October to 31 March", short: "Second half (Oct-Mar)" },
];

export const MONTHS_PER_HALF_YEAR = 6;

/**
 * Kerala slabs on income for the half year. `upTo` is inclusive; null = "and above".
 * Half-yearly income below Rs 12,000 is not taxed.
 */
export const KERALA_PT_SLABS = [
  { upTo: 11999, halfYearlyTax: 0, label: "Below Rs 12,000" },
  { upTo: 17999, halfYearlyTax: 120, label: "Rs 12,000 to Rs 17,999" },
  { upTo: 29999, halfYearlyTax: 180, label: "Rs 18,000 to Rs 29,999" },
  { upTo: 44999, halfYearlyTax: 300, label: "Rs 30,000 to Rs 44,999" },
  { upTo: 59999, halfYearlyTax: 450, label: "Rs 45,000 to Rs 59,999" },
  { upTo: 74999, halfYearlyTax: 600, label: "Rs 60,000 to Rs 74,999" },
  { upTo: 99999, halfYearlyTax: 750, label: "Rs 75,000 to Rs 99,999" },
  { upTo: 124999, halfYearlyTax: 1000, label: "Rs 1,00,000 to Rs 1,24,999" },
  { upTo: null, halfYearlyTax: 1250, label: "Rs 1,25,000 and above" },
];

/** Local bodies that collect the tax. The slab is identical; only the payee changes. */
export const LOCAL_BODIES = [
  { key: "panchayat", label: "Grama panchayat", act: "Kerala Panchayat Raj Act, 1994 (s.204)" },
  { key: "municipality", label: "Municipality", act: "Kerala Municipality Act, 1994 (s.245)" },
  { key: "corporation", label: "Municipal corporation", act: "Kerala Municipality Act, 1994 (s.245)" },
];

/** Highest marginal income-tax rate accepted for the "net cost" view. */
const MAX_MARGINAL_RATE = 42.744;

/** Find the Kerala slab for a half-yearly income. */
export function findKeralaSlab(halfYearlyIncome) {
  return (
    KERALA_PT_SLABS.find((slab) => slab.upTo === null || halfYearlyIncome <= slab.upTo) ||
    KERALA_PT_SLABS[KERALA_PT_SLABS.length - 1]
  );
}

function buildHalf(meta, monthlyGross, months, extraIncome) {
  const income = monthlyGross * months + extraIncome;
  const slab = findKeralaSlab(income);
  const perMonth = months > 0 ? slab.halfYearlyTax / months : 0;
  return {
    key: meta.key,
    label: meta.label,
    short: meta.short,
    months,
    income,
    slabLabel: slab.label,
    tax: slab.halfYearlyTax,
    perMonth,
  };
}

/**
 * @param {object} input
 * @param {number} input.monthlyGross monthly gross pay including allowances
 * @param {number} [input.monthsFirstHalf=6] months employed between April and September (0-6)
 * @param {number} [input.monthsSecondHalf=6] months employed between October and March (0-6)
 * @param {number} [input.extraFirstHalf=0] bonus / arrears received in the first half
 * @param {number} [input.extraSecondHalf=0] bonus / arrears received in the second half
 * @param {number} [input.marginalTaxRate=0] marginal income-tax rate (%) for the section 16(iii) view
 * @returns {object} breakdown or { error }
 */
export function computeKeralaProfessionalTax({
  monthlyGross,
  monthsFirstHalf = MONTHS_PER_HALF_YEAR,
  monthsSecondHalf = MONTHS_PER_HALF_YEAR,
  extraFirstHalf = 0,
  extraSecondHalf = 0,
  marginalTaxRate = 0,
} = {}) {
  const gross = Number(monthlyGross);
  const m1 = Number(monthsFirstHalf);
  const m2 = Number(monthsSecondHalf);
  const e1 = Number(extraFirstHalf);
  const e2 = Number(extraSecondHalf);
  const relief = Number(marginalTaxRate);

  if ([gross, m1, m2, e1, e2, relief].some((value) => !Number.isFinite(value))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (gross < 0 || e1 < 0 || e2 < 0) return { error: "Income amounts cannot be negative." };
  if (gross > 100000000) {
    return { error: "Monthly gross pay looks unrealistic. Enter an amount under Rs 10 crore." };
  }
  if (m1 < 0 || m1 > MONTHS_PER_HALF_YEAR || m2 < 0 || m2 > MONTHS_PER_HALF_YEAR) {
    return { error: "Months in each half year must be between 0 and 6." };
  }
  if (m1 + m2 <= 0) return { error: "Enter at least one month of employment in the year." };
  if (relief < 0 || relief > MAX_MARGINAL_RATE) {
    return { error: `Marginal tax rate must be between 0% and ${MAX_MARGINAL_RATE}%.` };
  }

  const halves = [
    buildHalf(HALF_YEARS[0], gross, Math.floor(m1), e1),
    buildHalf(HALF_YEARS[1], gross, Math.floor(m2), e2),
  ];

  const annualTax = Math.min(
    halves.reduce((sum, half) => sum + half.tax, 0),
    ANNUAL_PT_CEILING,
  );
  const annualIncome = halves.reduce((sum, half) => sum + half.income, 0);
  const incomeTaxSaved = (annualTax * relief) / 100;

  return {
    halves,
    annualTax,
    annualIncome,
    effectiveRate: annualIncome > 0 ? (annualTax / annualIncome) * 100 : 0,
    incomeTaxSaved,
    netCostAfterRelief: annualTax - incomeTaxSaved,
    isExempt: annualTax === 0,
    atCeiling: annualTax >= ANNUAL_PT_CEILING,
  };
}
