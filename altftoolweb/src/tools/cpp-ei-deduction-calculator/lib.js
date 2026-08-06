/**
 * Canada Pension Plan (CPP), Quebec Pension Plan (QPP) and Employment Insurance (EI)
 * payroll contributions.
 *
 * Rules implemented
 * -----------------
 * 1. CPP contributory earnings = pensionable earnings minus the $3,500 basic exemption,
 *    floored at zero and capped at the Year's Maximum Pensionable Earnings (YMPE) minus the
 *    exemption — Canada Pension Plan Act. The exemption is prorated across pay periods, so
 *    for evenly spread earnings the annual figure divided by the number of pay periods gives
 *    the same answer.
 * 2. Base plus first additional CPP is 5.95% for the employee, matched by the employer.
 *    Quebec employees pay QPP instead, at the rate published for the selected year.
 * 3. Second additional CPP ("CPP2") applies to earnings between the YMPE and the Year's
 *    Additional Maximum Pensionable Earnings (YAMPE) at 4% for both employee and employer.
 *    QPP2 works the same way at 4%.
 * 4. EI premiums are the employee rate applied to insurable earnings up to the Maximum
 *    Insurable Earnings (MIE) — Employment Insurance Act. Quebec has a lower federal EI rate
 *    because the Quebec Parental Insurance Plan covers maternity and parental benefits.
 * 5. The employer pays 1.4 times the employee EI premium unless it qualifies for a reduced
 *    rate under the EI premium reduction programme.
 * 6. Self-employed people pay both the employee and employer halves of CPP/QPP. EI is
 *    optional for them, employee share only, with no employer portion.
 *
 * The CRA and Retraite Québec publish new maximums each November. The presets below cover the
 * years verified in this module; use the custom option to enter another year's figures.
 * Nothing here is tax advice.
 */

/** CPP basic exemption — fixed at $3,500 since 1997. */
export const CPP_BASIC_EXEMPTION = 3500;

/** Standard employer EI multiplier — 1.4 times the employee premium. */
export const EI_EMPLOYER_MULTIPLIER = 1.4;

export const CONTRIBUTION_SOURCE_URL =
  "https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4127-payroll-deductions-formulas/t4127-jan/t4127-jan-payroll-deductions-formulas-computer-programs.html";

/**
 * Verified statutory parameters by year. Sources: CRA payroll deduction tables and the
 * Canada Employment Insurance Commission premium rate announcements.
 */
export const CONTRIBUTION_YEARS = {
  2026: {
    year: 2026,
    ympe: 74600,
    yampe: 85000,
    cppEmployeeRate: 0.0595,
    cpp2Rate: 0.04,
    qppEmployeeRate: 0.063,
    qpp2Rate: 0.04,
    eiMaxInsurableEarnings: 68900,
    eiRateOutsideQuebec: 0.0163,
    eiRateQuebec: 0.013,
  },
  2025: {
    year: 2025,
    ympe: 71300,
    yampe: 81200,
    cppEmployeeRate: 0.0595,
    cpp2Rate: 0.04,
    qppEmployeeRate: 0.064,
    qpp2Rate: 0.04,
    eiMaxInsurableEarnings: 65700,
    eiRateOutsideQuebec: 0.0164,
    eiRateQuebec: 0.0131,
  },
  2024: {
    year: 2024,
    ympe: 68500,
    yampe: 73200,
    cppEmployeeRate: 0.0595,
    cpp2Rate: 0.04,
    qppEmployeeRate: 0.064,
    qpp2Rate: 0.04,
    eiMaxInsurableEarnings: 63200,
    eiRateOutsideQuebec: 0.0166,
    eiRateQuebec: 0.0132,
  },
};

/** Years available as presets, newest first. */
export const AVAILABLE_YEARS = Object.keys(CONTRIBUTION_YEARS)
  .map(Number)
  .sort((a, b) => b - a);

/** Pay-period counts CRA supports on payroll remittances. */
export const PAY_PERIOD_OPTIONS = [
  { value: 12, label: "Monthly (12)" },
  { value: 24, label: "Semi-monthly (24)" },
  { value: 26, label: "Bi-weekly (26)" },
  { value: 52, label: "Weekly (52)" },
  { value: 1, label: "Annual total (1)" },
];

/** Round a money amount to the nearest cent, half away from zero. */
function roundCents(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function isBadNumber(value) {
  return typeof value !== "number" || !Number.isFinite(value);
}

/**
 * Compute CPP/QPP and EI contributions for a year's earnings.
 *
 * @param {object} input
 * @param {number} input.annualEarnings     Pensionable and insurable earnings for the year.
 * @param {number} [input.year]             Year whose parameters to use (default newest preset).
 * @param {object} [input.customParameters] Override the statutory parameters entirely.
 * @param {boolean} [input.inQuebec]        Quebec employee — QPP instead of CPP, lower EI rate.
 * @param {boolean} [input.selfEmployed]    Pays both halves of CPP/QPP.
 * @param {boolean} [input.eiOptIn]         Self-employed person registered for EI special benefits.
 * @param {number} [input.payPeriods]       Pay periods per year, for the per-cheque figures.
 * @returns {object} breakdown, or { error } when the input cannot produce a real answer.
 */
export function computeCppEi(input = {}) {
  const {
    annualEarnings,
    year = AVAILABLE_YEARS[0],
    customParameters = null,
    inQuebec = false,
    selfEmployed = false,
    eiOptIn = false,
    payPeriods = 26,
  } = input;

  const parameters = customParameters || CONTRIBUTION_YEARS[year];

  if (!parameters) {
    return { error: `No contribution parameters are loaded for ${year}. Choose a listed year or enter the figures manually.` };
  }
  if (isBadNumber(annualEarnings) || isBadNumber(payPeriods)) {
    return { error: "Enter valid numbers for earnings and pay periods." };
  }
  if (annualEarnings < 0) {
    return { error: "Earnings cannot be negative." };
  }
  if (payPeriods <= 0) {
    return { error: "There must be at least one pay period in the year." };
  }

  const { ympe, yampe, cpp2Rate, qpp2Rate, eiMaxInsurableEarnings, cppEmployeeRate, qppEmployeeRate, eiRateOutsideQuebec, eiRateQuebec } =
    parameters;

  if (isBadNumber(ympe) || isBadNumber(yampe) || ympe <= CPP_BASIC_EXEMPTION) {
    return { error: "The YMPE and YAMPE must be valid amounts above the $3,500 exemption." };
  }
  if (yampe < ympe) {
    return { error: "The YAMPE cannot be lower than the YMPE." };
  }
  if (isBadNumber(eiMaxInsurableEarnings) || eiMaxInsurableEarnings <= 0) {
    return { error: "The EI maximum insurable earnings must be a valid amount greater than zero." };
  }
  if (
    isBadNumber(cppEmployeeRate) ||
    cppEmployeeRate < 0 ||
    isBadNumber(qppEmployeeRate) ||
    qppEmployeeRate < 0 ||
    isBadNumber(cpp2Rate) ||
    cpp2Rate < 0 ||
    isBadNumber(qpp2Rate) ||
    qpp2Rate < 0 ||
    isBadNumber(eiRateOutsideQuebec) ||
    eiRateOutsideQuebec < 0 ||
    isBadNumber(eiRateQuebec) ||
    eiRateQuebec < 0
  ) {
    return { error: "CPP/QPP and EI contribution rates must be valid numbers of zero or more." };
  }

  const pensionRate = inQuebec ? parameters.qppEmployeeRate : parameters.cppEmployeeRate;
  const secondRate = inQuebec ? qpp2Rate : cpp2Rate;
  const planName = inQuebec ? "QPP" : "CPP";

  // Tier 1: earnings between the exemption and the YMPE.
  const contributoryEarnings = Math.max(0, Math.min(annualEarnings, ympe) - CPP_BASIC_EXEMPTION);
  const employeePension = roundCents(contributoryEarnings * pensionRate);
  const maxEmployeePension = roundCents((ympe - CPP_BASIC_EXEMPTION) * pensionRate);

  // Tier 2: earnings between the YMPE and the YAMPE.
  const secondTierEarnings = Math.max(0, Math.min(annualEarnings, yampe) - ympe);
  const employeeSecond = roundCents(secondTierEarnings * secondRate);
  const maxEmployeeSecond = roundCents((yampe - ympe) * secondRate);

  // EI.
  const eiRate = inQuebec ? parameters.eiRateQuebec : parameters.eiRateOutsideQuebec;
  const eiApplies = !selfEmployed || eiOptIn;
  const insurableEarnings = Math.min(annualEarnings, eiMaxInsurableEarnings);
  const employeeEi = eiApplies ? roundCents(insurableEarnings * eiRate) : 0;
  const maxEmployeeEi = roundCents(eiMaxInsurableEarnings * eiRate);

  // Employer side. Self-employed people pay the employer half of CPP/QPP themselves and have
  // no employer EI premium.
  const employerPension = employeePension;
  const employerSecond = employeeSecond;
  const employerEi = selfEmployed ? 0 : roundCents(employeeEi * EI_EMPLOYER_MULTIPLIER);

  const employeeTotal = selfEmployed
    ? roundCents(employeePension * 2 + employeeSecond * 2 + employeeEi)
    : roundCents(employeePension + employeeSecond + employeeEi);
  const employerTotal = selfEmployed ? 0 : roundCents(employerPension + employerSecond + employerEi);
  const combinedTotal = roundCents(employeeTotal + employerTotal);

  const takeHomeBeforeTax = roundCents(annualEarnings - employeeTotal);

  return {
    planName,
    year: parameters.year ?? year,
    inQuebec,
    selfEmployed,
    annualEarnings: roundCents(annualEarnings),
    ympe,
    yampe,
    exemption: CPP_BASIC_EXEMPTION,
    pensionRatePercent: roundCents(pensionRate * 100),
    secondRatePercent: roundCents(secondRate * 100),
    eiRatePercent: roundCents(eiRate * 100),
    eiMaxInsurableEarnings,
    contributoryEarnings: roundCents(contributoryEarnings),
    secondTierEarnings: roundCents(secondTierEarnings),
    insurableEarnings: roundCents(eiApplies ? insurableEarnings : 0),
    employeePension: selfEmployed ? roundCents(employeePension * 2) : employeePension,
    employeeSecond: selfEmployed ? roundCents(employeeSecond * 2) : employeeSecond,
    employeeEi,
    employeeTotal,
    employerPension: selfEmployed ? 0 : employerPension,
    employerSecond: selfEmployed ? 0 : employerSecond,
    employerEi,
    employerTotal,
    combinedTotal,
    maxEmployeePension,
    maxEmployeeSecond,
    maxEmployeeEi,
    atPensionMaximum: annualEarnings >= ympe,
    atSecondMaximum: annualEarnings >= yampe,
    atEiMaximum: eiApplies && annualEarnings >= eiMaxInsurableEarnings,
    payPeriods,
    perPeriodEmployee: roundCents(employeeTotal / payPeriods),
    perPeriodEmployer: roundCents(employerTotal / payPeriods),
    perPeriodEarnings: roundCents(annualEarnings / payPeriods),
    takeHomeBeforeTax,
    employeeCostPercent:
      annualEarnings > 0 ? roundCents((employeeTotal / annualEarnings) * 100) : 0,
  };
}
