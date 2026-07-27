/**
 * House Rent Allowance for central government employees under the 7th Central Pay
 * Commission, and the income tax exemption that applies to it.
 *
 * Rule sources:
 *
 *  - Ministry of Finance, Department of Expenditure OM No. 2/5/2017-E.II(B) dated
 *    7 July 2017: HRA is payable at 24%, 16% and 8% of Basic Pay for employees
 *    posted in X, Y and Z class cities respectively. The same OM provides that HRA
 *    shall not be less than ₹5,400, ₹3,600 and ₹1,800 a month for X, Y and Z, being
 *    30%, 20% and 10% of the minimum pay of ₹18,000 in the pay matrix.
 *
 *  - The same OM provides for the rates to be revised upward as dearness allowance
 *    rises: to 27%, 18% and 9% when DA crosses 25%, and to 30%, 20% and 10% when DA
 *    crosses 50%. DA crossed 25% with effect from 1 July 2021 and crossed 50% with
 *    effect from 1 January 2024, so the 30/20/10 rates are the ones in force.
 *
 *  - City classification follows the Department of Expenditure list drawn on the
 *    2011 Census: X for an urban agglomeration of 50 lakh and above, Y for 5 lakh to
 *    50 lakh, and Z for everything below.
 *
 *  - "Basic Pay" for HRA means the pay drawn in the prescribed Level in the Pay
 *    Matrix and does not include any other type of pay such as special pay, Non
 *    Practising Allowance or Military Service Pay.
 *
 *  - Section 10(13A) of the Income-tax Act, 1961 with Rule 2A of the Income-tax
 *    Rules, 1962: the exemption is the least of the HRA actually received, the rent
 *    paid less 10% of salary, and 50% of salary where the accommodation is in Delhi,
 *    Mumbai, Kolkata or Chennai or 40% of salary anywhere else. "Salary" for this
 *    purpose is basic pay plus dearness allowance forming part of retirement
 *    benefits plus commission at a fixed percentage of turnover.
 *
 *  - The exemption is available only under the old tax regime. Section 115BAC, the
 *    default regime from assessment year 2024-25, withdraws it.
 *
 * Informational only; it is not tax advice.
 */

/** Minimum pay in the 7th CPC pay matrix, from which the HRA floors are derived. */
export const MINIMUM_PAY_IN_MATRIX = 18000;

/** HRA rate slabs keyed by the dearness allowance level that unlocks them. */
export const HRA_RATE_SLABS = [
  { minDaPercent: 50, rates: { X: 30, Y: 20, Z: 10 }, note: "DA has crossed 50%" },
  { minDaPercent: 25, rates: { X: 27, Y: 18, Z: 9 }, note: "DA has crossed 25% but not 50%" },
  { minDaPercent: 0, rates: { X: 24, Y: 16, Z: 8 }, note: "DA is 25% or below" },
];

/** Monthly HRA floors from the 7 July 2017 OM: 30%, 20% and 10% of the minimum pay. */
export const HRA_FLOOR = {
  X: (MINIMUM_PAY_IN_MATRIX * 30) / 100,
  Y: (MINIMUM_PAY_IN_MATRIX * 20) / 100,
  Z: (MINIMUM_PAY_IN_MATRIX * 10) / 100,
};

export const CITY_CLASSES = [
  { id: "X", label: "X class", population: "Urban agglomeration of 50 lakh and above" },
  { id: "Y", label: "Y class", population: "Population between 5 lakh and 50 lakh" },
  { id: "Z", label: "Z class", population: "Population below 5 lakh" },
];

/** The only four cities that attract the 50% cap under Rule 2A. */
export const RULE_2A_METRO_CITIES = ["Delhi", "Mumbai", "Kolkata", "Chennai"];

/** Rule 2A cap on salary in one of those four cities. */
export const RULE_2A_METRO_CAP_PERCENT = 50;

/** Rule 2A cap on salary anywhere else, including X-class cities like Bengaluru or Pune. */
export const RULE_2A_OTHER_CAP_PERCENT = 40;

/** Rule 2A deducts this share of salary from the rent paid. */
export const RULE_2A_RENT_DEDUCTION_PERCENT = 10;

export const MONTHS_IN_YEAR = 12;

const round2 = (value) => Math.round(value * 100) / 100;

/**
 * The HRA percentage in force for a city class at a given dearness allowance level.
 *
 * @param {string} cityClass  "X", "Y" or "Z".
 * @param {number} daPercent  Current dearness allowance in percent.
 * @returns {{ ratePercent: number, floor: number, note: string }|null} null for an unknown class.
 */
export function hraRateFor(cityClass, daPercent) {
  const rates = HRA_RATE_SLABS.find((slab) => daPercent >= slab.minDaPercent);
  if (!rates || !(cityClass in rates.rates)) return null;
  return {
    ratePercent: rates.rates[cityClass],
    floor: HRA_FLOOR[cityClass],
    note: rates.note,
  };
}

/**
 * HRA entitlement and the section 10(13A) exemption for a central government employee.
 *
 * @param {object} input
 * @param {number} input.basicPay      Monthly pay in the Level in the Pay Matrix.
 * @param {string} input.cityClass     "X", "Y" or "Z".
 * @param {number} input.daPercent     Dearness allowance in percent.
 * @param {number} input.monthlyRent   Rent actually paid each month, 0 if none.
 * @param {boolean} input.isRule2aMetro True if posted in Delhi, Mumbai, Kolkata or Chennai.
 * @param {number} [input.months=12]   Months in the year for which this applies.
 * @returns {object} result object, or { error } for input that cannot be used.
 */
export function computeGovernmentHra({
  basicPay,
  cityClass = "X",
  daPercent = 0,
  monthlyRent = 0,
  isRule2aMetro = false,
  months = MONTHS_IN_YEAR,
} = {}) {
  const pay = Number(basicPay);
  const da = Number(daPercent);
  const rent = Number(monthlyRent);
  const monthCount = Number(months);

  if (![pay, da, rent, monthCount].every((value) => Number.isFinite(value))) {
    return { error: "Enter valid numbers for pay, dearness allowance, rent and months." };
  }
  if (pay <= 0) return { error: "Enter your monthly basic pay from the pay matrix." };
  if (pay < MINIMUM_PAY_IN_MATRIX) {
    return {
      error: `The 7th CPC pay matrix starts at ₹${MINIMUM_PAY_IN_MATRIX}, so basic pay cannot be lower than that.`,
    };
  }
  if (pay > 5000000) return { error: "That basic pay is outside the range of the pay matrix." };
  if (da < 0 || da > 300) return { error: "Dearness allowance should be between 0% and 300%." };
  if (rent < 0) return { error: "Rent paid cannot be negative." };
  if (rent > 5000000) return { error: "That monthly rent is outside a realistic range." };
  if (monthCount <= 0 || monthCount > MONTHS_IN_YEAR) {
    return { error: `Months must be between 1 and ${MONTHS_IN_YEAR}.` };
  }

  const rateInfo = hraRateFor(cityClass, da);
  if (!rateInfo) return { error: "Choose a city class of X, Y or Z." };

  const monthsCounted = Math.round(monthCount);

  const hraAtRate = round2((pay * rateInfo.ratePercent) / 100);
  const monthlyHra = round2(Math.max(hraAtRate, rateInfo.floor));
  const floorApplied = monthlyHra > hraAtRate;

  const monthlyDa = round2((pay * da) / 100);
  const monthlySalaryForRule2a = round2(pay + monthlyDa);

  const annualHra = round2(monthlyHra * monthsCounted);
  const annualRent = round2(rent * monthsCounted);
  const annualSalary = round2(monthlySalaryForRule2a * monthsCounted);

  const capPercent = isRule2aMetro ? RULE_2A_METRO_CAP_PERCENT : RULE_2A_OTHER_CAP_PERCENT;

  const limitActualHra = annualHra;
  const limitRentOverTenPercent = round2(
    annualRent - (annualSalary * RULE_2A_RENT_DEDUCTION_PERCENT) / 100,
  );
  const limitSalaryCap = round2((annualSalary * capPercent) / 100);

  const exempt = round2(
    Math.max(0, Math.min(limitActualHra, limitRentOverTenPercent, limitSalaryCap)),
  );
  const taxable = round2(Math.max(0, annualHra - exempt));
  const exemptShare = annualHra > 0 ? round2((exempt / annualHra) * 100) : 0;

  const bindingLimit =
    exempt === 0
      ? "None — rent paid does not exceed 10% of salary, so nothing is exempt"
      : exempt === limitActualHra
        ? "HRA actually received"
        : exempt === limitRentOverTenPercent
          ? `Rent paid less ${RULE_2A_RENT_DEDUCTION_PERCENT}% of salary`
          : `${capPercent}% of salary`;

  // The rent at which the whole HRA would become exempt, if that is achievable.
  const rentForFullExemption = round2(
    (annualHra + (annualSalary * RULE_2A_RENT_DEDUCTION_PERCENT) / 100) / monthsCounted,
  );
  const fullExemptionPossible = limitSalaryCap >= annualHra;

  return {
    basicPay: round2(pay),
    cityClass,
    daPercent: da,
    ratePercent: rateInfo.ratePercent,
    rateNote: rateInfo.note,
    floor: rateInfo.floor,
    floorApplied,
    hraAtRate,
    monthlyHra,
    monthlyDa,
    monthlySalaryForRule2a,
    monthsCounted,
    annualHra,
    annualRent,
    annualSalary,
    capPercent,
    isRule2aMetro: Boolean(isRule2aMetro),
    limitActualHra,
    limitRentOverTenPercent,
    limitSalaryCap,
    exempt,
    taxable,
    exemptShare,
    bindingLimit,
    rentForFullExemption,
    fullExemptionPossible,
  };
}

export default computeGovernmentHra;
