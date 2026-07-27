/**
 * House Rent Allowance exemption under section 10(13A) of the Income-tax Act 1961
 * read with Rule 2A of the Income-tax Rules 1962.
 *
 * Rule 2A: the exemption is the LEAST of
 *   (a) the actual HRA received for the period,
 *   (b) rent actually paid minus 10% of salary for the period,
 *   (c) 50% of salary where the accommodation is in Delhi, Mumbai, Kolkata or
 *       Chennai, and 40% of salary anywhere else.
 *
 * "Salary" for Rule 2A means basic pay plus dearness allowance where the terms of
 * employment make DA count for retirement benefits, plus commission fixed as a
 * percentage of turnover. No other allowance goes into it.
 *
 * Only those four cities get the 50% rate for HRA — the wider "metro" lists used
 * for other purposes do not apply here.
 *
 * The exemption exists only under the old tax regime. Section 115BAC, the default
 * regime from AY 2024-25, withdraws it, so the comparison below assumes the old
 * regime has been opted for.
 *
 * Cess: 4% health and education cess is charged on the income tax, so a taxpayer
 * in the 30% slab actually saves 31.2% of the exempt amount.
 */

/** Rule 2A(a) limit (c) for Delhi, Mumbai, Kolkata and Chennai. */
export const METRO_SALARY_PERCENT = 50;

/** Rule 2A(a) limit (c) for every other place. */
export const NON_METRO_SALARY_PERCENT = 40;

/** Rule 2A limit (b) deducts this share of salary from the rent paid. */
export const RENT_LESS_SALARY_PERCENT = 10;

/** Health and education cess on income tax (Finance Act, unchanged since AY 2019-20). */
export const HEALTH_EDUCATION_CESS_PERCENT = 4;

/** The only four cities that qualify for the 50% limit under Rule 2A. */
export const HRA_METRO_CITIES = ["Delhi", "Mumbai", "Kolkata", "Chennai"];

const round2 = (value) => Math.round(value * 100) / 100;

/**
 * Rule 2A exemption for one city category.
 * @param {object} input
 * @param {number} input.salary        Annualised basic + eligible DA + turnover commission.
 * @param {number} input.hraReceived   Annualised HRA received.
 * @param {number} input.rentPaid      Annualised rent actually paid.
 * @param {number} input.salaryPercent 50 for metro, 40 otherwise.
 */
export function hraExemptionForCategory({ salary, hraReceived, rentPaid, salaryPercent }) {
  const limitHra = round2(hraReceived);
  const limitRent = round2(Math.max(0, rentPaid - (salary * RENT_LESS_SALARY_PERCENT) / 100));
  const limitSalary = round2((salary * salaryPercent) / 100);

  const exempt = round2(Math.min(limitHra, limitRent, limitSalary));
  let bindingLimit = "Actual HRA received";
  if (limitRent <= limitHra && limitRent <= limitSalary) {
    bindingLimit = `Rent paid minus ${RENT_LESS_SALARY_PERCENT}% of salary`;
  } else if (limitSalary <= limitHra && limitSalary <= limitRent) {
    bindingLimit = `${salaryPercent}% of salary`;
  }

  return {
    salaryPercent,
    limitHra,
    limitRent,
    limitSalary,
    exempt,
    taxable: round2(Math.max(0, limitHra - exempt)),
    bindingLimit,
  };
}

/**
 * Compare the Rule 2A exemption a person gets in a metro city against a non-metro city.
 *
 * @param {object} input
 * @param {number} input.monthlyBasic       Basic pay per month.
 * @param {number} [input.monthlyDa=0]      Dearness allowance per month that counts for retirement benefits.
 * @param {number} input.monthlyHra         HRA received per month.
 * @param {number} input.monthlyRent        Rent actually paid per month.
 * @param {number} [input.months=12]        Months the arrangement ran for (1-12).
 * @param {number} [input.marginalRatePercent=30] Your slab rate, before cess.
 * @returns {object} plain result object, or { error } for invalid input
 */
export function compareMetroNonMetroHra({
  monthlyBasic,
  monthlyDa = 0,
  monthlyHra,
  monthlyRent,
  months = 12,
  marginalRatePercent = 30,
} = {}) {
  const basic = Number(monthlyBasic);
  const da = Number(monthlyDa);
  const hra = Number(monthlyHra);
  const rent = Number(monthlyRent);
  const monthCount = Number(months);
  const slab = Number(marginalRatePercent);

  if (![basic, da, hra, rent, monthCount, slab].every((value) => Number.isFinite(value))) {
    return { error: "Enter valid numbers in every field." };
  }
  if (basic < 0 || da < 0 || hra < 0 || rent < 0) {
    return { error: "Salary, allowance and rent amounts cannot be negative." };
  }
  if (basic + da <= 0) {
    return { error: "Enter your monthly basic pay — Rule 2A works off basic plus DA." };
  }
  if (hra <= 0) {
    return { error: "Enter the HRA you receive. With no HRA there is nothing to exempt." };
  }
  if (monthCount <= 0 || monthCount > 12) {
    return { error: "Months must be between 1 and 12 for one financial year." };
  }
  if (slab < 0 || slab > 45) {
    return { error: "Slab rate should be between 0% and 45%." };
  }

  const monthsUsed = Math.round(monthCount);
  const salary = round2((basic + da) * monthsUsed);
  const hraReceived = round2(hra * monthsUsed);
  const rentPaid = round2(rent * monthsUsed);

  const metro = hraExemptionForCategory({
    salary,
    hraReceived,
    rentPaid,
    salaryPercent: METRO_SALARY_PERCENT,
  });
  const nonMetro = hraExemptionForCategory({
    salary,
    hraReceived,
    rentPaid,
    salaryPercent: NON_METRO_SALARY_PERCENT,
  });

  const effectiveRatePercent = round2(slab * (1 + HEALTH_EDUCATION_CESS_PERCENT / 100));
  const exemptionGap = round2(metro.exempt - nonMetro.exempt);
  const taxGap = round2((exemptionGap * effectiveRatePercent) / 100);

  // Rent at which the metro and non-metro answers stop differing: once the
  // rent-based limit (b) falls to or below 40% of salary, both categories give
  // the same exemption, because limit (b) then binds in both.
  const rentWhereGapDisappears = round2(
    (salary * (NON_METRO_SALARY_PERCENT + RENT_LESS_SALARY_PERCENT)) / 100 / monthsUsed,
  );

  return {
    monthsUsed,
    salary,
    hraReceived,
    rentPaid,
    monthlySalaryBase: round2(basic + da),
    metro,
    nonMetro,
    exemptionGap,
    taxGap,
    effectiveRatePercent,
    marginalRatePercent: slab,
    metroTaxable: metro.taxable,
    nonMetroTaxable: nonMetro.taxable,
    ruleMatters: exemptionGap > 0,
    rentWhereGapDisappears,
    metroCities: HRA_METRO_CITIES,
  };
}

export default compareMetroNonMetroHra;
