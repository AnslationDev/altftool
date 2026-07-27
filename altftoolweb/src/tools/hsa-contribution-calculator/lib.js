/**
 * Health Savings Account (HSA) contribution limits and triple-tax-benefit estimate.
 *
 * Rules implemented
 * -----------------
 * 1. Annual contribution limit depends on the coverage tier of the qualifying high deductible
 *    health plan — IRC §223(b)(2), indexed each year by the IRS revenue procedure.
 *      2025 limits: Rev. Proc. 2024-25.  2026 limits: Rev. Proc. 2025-19.
 * 2. Catch-up contribution of $1,000 for an account holder who is 55 or older by the end of the
 *    tax year — IRC §223(b)(3). This figure is fixed in statute and is not indexed.
 * 3. Employer contributions count against the same annual limit — IRC §223(b) and Notice 2004-2.
 * 4. Partial-year eligibility: the limit is prorated by the number of months in which the person
 *    was an eligible individual on the first day of that month — IRC §223(b)(2) flush language.
 *    The last-month rule in §223(b)(8) instead allows the full annual limit if the person is
 *    eligible on 1 December, subject to a 13-month testing period.
 * 5. Contributions above the limit are subject to a 6% excise tax for each year they stay in the
 *    account — IRC §4973(a)(5).
 * 6. Triple tax benefit: contributions are deductible or made pre-tax (§223(a)), earnings grow
 *    untaxed, and qualified medical distributions are tax free (§223(f)(1)). Contributions made
 *    through a §125 cafeteria plan by payroll deduction also escape Social Security and Medicare
 *    tax, which direct contributions claimed on Form 8889 do not.
 */

/** Employee-side FICA on wages up to the Social Security wage base: 6.2% OASDI + 1.45% Medicare. */
export const FICA_RATE_UP_TO_WAGE_BASE = 0.0765;

/** Above the Social Security wage base only the 1.45% Medicare tax continues to apply. */
export const FICA_RATE_ABOVE_WAGE_BASE = 0.0145;

/** Catch-up contribution for account holders aged 55+ — IRC §223(b)(3), not indexed. */
export const HSA_CATCH_UP_CONTRIBUTION = 1000;

/** Age at which the catch-up contribution becomes available — IRC §223(b)(3). */
export const HSA_CATCH_UP_AGE = 55;

/** Excise tax on excess contributions left in the account — IRC §4973(a)(5). */
export const HSA_EXCESS_EXCISE_RATE = 0.06;

/** Age at which non-medical withdrawals stop attracting the 20% penalty — IRC §223(f)(4)(C). */
export const HSA_PENALTY_FREE_AGE = 65;

/** Additional tax on non-qualified distributions before age 65 — IRC §223(f)(4)(A). */
export const HSA_NON_QUALIFIED_PENALTY_RATE = 0.2;

/**
 * IRS inflation-adjusted HSA and HDHP figures by tax year.
 * 2025 — Rev. Proc. 2024-25. 2026 — Rev. Proc. 2025-19.
 */
export const HSA_YEAR_LIMITS = {
  2025: {
    selfOnly: 4300,
    family: 8550,
    hdhpMinDeductibleSelfOnly: 1650,
    hdhpMinDeductibleFamily: 3300,
    hdhpMaxOutOfPocketSelfOnly: 8300,
    hdhpMaxOutOfPocketFamily: 16600,
  },
  2026: {
    selfOnly: 4400,
    family: 8750,
    hdhpMinDeductibleSelfOnly: 1700,
    hdhpMinDeductibleFamily: 3400,
    hdhpMaxOutOfPocketSelfOnly: 8500,
    hdhpMaxOutOfPocketFamily: 17000,
  },
};

export const HSA_YEARS = Object.keys(HSA_YEAR_LIMITS).map(Number);

const MONTHS_IN_YEAR = 12;

function roundCents(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function isBadNumber(value) {
  return typeof value !== "number" || !Number.isFinite(value);
}

/**
 * Future value of a series of equal end-of-year contributions.
 * FV = C x ((1 + r)^n - 1) / r, and C x n when r is zero.
 */
function futureValueOfAnnuity(contribution, rate, years) {
  if (years <= 0) return 0;
  if (rate === 0) return contribution * years;
  return (contribution * (Math.pow(1 + rate, years) - 1)) / rate;
}

/**
 * @param {object} input
 * @param {number} input.year              Tax year (must exist in HSA_YEAR_LIMITS).
 * @param {"selfOnly"|"family"} input.coverage
 * @param {number} input.age               Age at the end of the tax year.
 * @param {number} input.monthsEligible    Months eligible on the first of the month (0-12).
 * @param {boolean} [input.useLastMonthRule] Eligible on 1 December, so claim the full year limit.
 * @param {number} input.employeeContribution
 * @param {number} [input.employerContribution]
 * @param {boolean} [input.viaPayroll]     Contributed through a §125 cafeteria plan.
 * @param {"below"|"above"} [input.wageBand] Wages below or above the Social Security wage base.
 * @param {number} input.federalMarginalRatePercent
 * @param {number} [input.stateMarginalRatePercent]
 * @param {boolean} [input.stateTaxesHsa]  State does not allow the HSA deduction (e.g. CA, NJ).
 * @param {number} [input.growthYears]     Years the balance is left invested.
 * @param {number} [input.growthRatePercent]
 * @param {number} [input.investmentTaxRatePercent] Tax drag on a taxable account, for comparison.
 * @returns {object} breakdown, or { error } when the input cannot produce a real answer.
 */
export function computeHsaPlan(input = {}) {
  const {
    year,
    coverage = "selfOnly",
    age,
    monthsEligible = MONTHS_IN_YEAR,
    useLastMonthRule = false,
    employeeContribution,
    employerContribution = 0,
    viaPayroll = true,
    wageBand = "below",
    federalMarginalRatePercent,
    stateMarginalRatePercent = 0,
    stateTaxesHsa = false,
    growthYears = 20,
    growthRatePercent = 6,
    investmentTaxRatePercent = 15,
  } = input;

  const limits = HSA_YEAR_LIMITS[year];
  if (!limits) {
    return { error: `HSA limits are only published here for ${HSA_YEARS.join(" and ")}.` };
  }
  if (coverage !== "selfOnly" && coverage !== "family") {
    return { error: "Choose either self-only or family HDHP coverage." };
  }
  if (
    isBadNumber(age) ||
    isBadNumber(monthsEligible) ||
    isBadNumber(employeeContribution) ||
    isBadNumber(employerContribution) ||
    isBadNumber(federalMarginalRatePercent) ||
    isBadNumber(stateMarginalRatePercent) ||
    isBadNumber(growthYears) ||
    isBadNumber(growthRatePercent) ||
    isBadNumber(investmentTaxRatePercent)
  ) {
    return { error: "Enter valid numbers in every field." };
  }
  if (age < 0 || age > 120) {
    return { error: "Enter an age between 0 and 120." };
  }
  if (monthsEligible < 0 || monthsEligible > MONTHS_IN_YEAR) {
    return { error: "Months of HSA eligibility must be between 0 and 12." };
  }
  if (employeeContribution < 0 || employerContribution < 0) {
    return { error: "Contributions cannot be negative." };
  }
  if (federalMarginalRatePercent < 0 || federalMarginalRatePercent > 60) {
    return { error: "Enter a federal marginal rate between 0% and 60%." };
  }
  if (stateMarginalRatePercent < 0 || stateMarginalRatePercent > 20) {
    return { error: "Enter a state marginal rate between 0% and 20%." };
  }
  if (growthYears < 0 || growthYears > 60) {
    return { error: "Enter an investment horizon between 0 and 60 years." };
  }
  if (growthRatePercent < -20 || growthRatePercent > 25) {
    return { error: "Enter an expected return between -20% and 25% a year." };
  }
  if (investmentTaxRatePercent < 0 || investmentTaxRatePercent > 50) {
    return { error: "Enter a taxable-account tax drag between 0% and 50%." };
  }

  const annualBaseLimit = coverage === "family" ? limits.family : limits.selfOnly;
  const catchUpEligible = age >= HSA_CATCH_UP_AGE;
  const catchUpFull = catchUpEligible ? HSA_CATCH_UP_CONTRIBUTION : 0;

  // Proration applies to the base limit and the catch-up amount alike.
  const monthsCounted = useLastMonthRule ? MONTHS_IN_YEAR : monthsEligible;
  const prorationFactor = monthsCounted / MONTHS_IN_YEAR;
  const baseLimit = roundCents(annualBaseLimit * prorationFactor);
  const catchUpLimit = roundCents(catchUpFull * prorationFactor);
  const contributionLimit = roundCents(baseLimit + catchUpLimit);

  const totalContribution = roundCents(employeeContribution + employerContribution);
  const remainingRoom = roundCents(Math.max(0, contributionLimit - totalContribution));
  const excessContribution = roundCents(Math.max(0, totalContribution - contributionLimit));
  const excessExciseTax = roundCents(excessContribution * HSA_EXCESS_EXCISE_RATE);

  // Only contributions inside the limit attract the tax benefit; the excess is not deductible.
  const employeeAllowed = roundCents(
    Math.max(0, Math.min(employeeContribution, contributionLimit - Math.min(employerContribution, contributionLimit))),
  );

  const federalRate = federalMarginalRatePercent / 100;
  const stateRate = stateTaxesHsa ? 0 : stateMarginalRatePercent / 100;
  const ficaRate = viaPayroll
    ? wageBand === "above"
      ? FICA_RATE_ABOVE_WAGE_BASE
      : FICA_RATE_UP_TO_WAGE_BASE
    : 0;

  const federalSaving = roundCents(employeeAllowed * federalRate);
  const stateSaving = roundCents(employeeAllowed * stateRate);
  const ficaSaving = roundCents(employeeAllowed * ficaRate);
  const firstYearSaving = roundCents(federalSaving + stateSaving + ficaSaving);
  const netCostOfContribution = roundCents(employeeAllowed - firstYearSaving);
  const combinedMarginalRatePercent = roundCents((federalRate + stateRate + ficaRate) * 100);

  // Long-run comparison: the same gross pay routed through an HSA versus a taxable account.
  const growthRate = growthRatePercent / 100;
  const investmentTaxRate = investmentTaxRatePercent / 100;
  const annualContribution = roundCents(employeeAllowed + Math.min(employerContribution, contributionLimit));

  const hsaFutureValue = roundCents(futureValueOfAnnuity(annualContribution, growthRate, growthYears));
  const taxableStake = roundCents(annualContribution * (1 - (federalRate + stateRate + ficaRate)));
  const netGrowthRate = growthRate * (1 - investmentTaxRate);
  const taxableFutureValue = roundCents(
    futureValueOfAnnuity(taxableStake, netGrowthRate, growthYears),
  );
  const tripleBenefitAdvantage = roundCents(hsaFutureValue - taxableFutureValue);
  const totalContributed = roundCents(annualContribution * growthYears);
  const taxFreeEarnings = roundCents(Math.max(0, hsaFutureValue - totalContributed));

  return {
    year,
    coverage,
    annualBaseLimit,
    baseLimit,
    catchUpEligible,
    catchUpLimit,
    contributionLimit,
    monthsCounted,
    prorated: monthsCounted < MONTHS_IN_YEAR,
    usedLastMonthRule: useLastMonthRule && monthsEligible < MONTHS_IN_YEAR,
    employeeContribution: roundCents(employeeContribution),
    employerContribution: roundCents(employerContribution),
    employeeAllowed,
    totalContribution,
    remainingRoom,
    excessContribution,
    excessExciseTax,
    federalSaving,
    stateSaving,
    ficaSaving,
    firstYearSaving,
    netCostOfContribution,
    combinedMarginalRatePercent,
    hdhpMinDeductible:
      coverage === "family" ? limits.hdhpMinDeductibleFamily : limits.hdhpMinDeductibleSelfOnly,
    hdhpMaxOutOfPocket:
      coverage === "family" ? limits.hdhpMaxOutOfPocketFamily : limits.hdhpMaxOutOfPocketSelfOnly,
    annualContribution,
    taxableStake,
    growthYears,
    hsaFutureValue,
    taxableFutureValue,
    tripleBenefitAdvantage,
    totalContributed,
    taxFreeEarnings,
  };
}
