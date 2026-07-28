/**
 * UPS vs NPS Comparator — pure maths.
 *
 * Models the two options a Central Government employee covered by the National Pension
 * System can hold at superannuation, and solves for the single number that makes the
 * comparison decidable: the annual NPS return at which the NPS annuity would pay the
 * same monthly amount as the UPS assured payout.
 *
 * RULE SOURCES (all read on 2026-07-29):
 *
 * UPS — Ministry of Finance, Department of Financial Services notification
 *   F. No. FX-1/3/2024-PR dated 24 January 2025 ("Unified Pension Scheme"),
 *   operative from 1 April 2025. The clauses modelled here:
 *     - "the rate of full assured payout will be @50% of twelve monthly average basic
 *        pay, immediately prior to superannuation" on a minimum 25 years of qualifying
 *        service; "in case of lesser qualifying service period, proportionate payout
 *        would be admissible";
 *     - "a minimum guaranteed payout of Rs. 10,000 per month shall be assured" where
 *        superannuation follows ten years or more of qualifying service;
 *     - assured family payout @60% of the payout admissible to the payout holder
 *        immediately before his/her demise;
 *     - Dearness Relief is available on the assured payout and the family payout and is
 *        worked out in the same manner as Dearness Allowance for serving employees
 *        (AICPI-IW linked);
 *     - lump sum payment on superannuation @10% of monthly emoluments (basic pay +
 *        Dearness Allowance) for every completed six months of qualifying service, which
 *        does not reduce the quantum of assured payout.
 *
 * NPS exit — PFRDA (Exits and Withdrawals under the National Pension System)
 *   Regulations, 2015: at superannuation a minimum of 40% of the accumulated pension
 *   wealth must be annuitised with an IRDAI-registered Annuity Service Provider and up
 *   to 60% may be withdrawn as a lump sum. The lump sum of up to 60% is exempt under
 *   Section 10(12A) of the Income-tax Act, 1961.
 *
 * NPS contribution rates — Central Government subscribers contribute 10% of
 *   (basic pay + DA); the Central Government contributes 14% with effect from
 *   1 April 2019 (Ministry of Finance / DoE O.M. on enhanced employer contribution).
 *
 * NOTHING here is advice. The scheme election is statutory and irreversible; this file
 * only states what each rule produces for the inputs given.
 */

/** Calendar months in a year. */
export const MONTHS_PER_YEAR = 12;

/** UPS notification: full assured payout is 50% of the last twelve months' average basic pay. */
export const UPS_PAYOUT_RATE = 0.5;

/** UPS notification: full rate needs 25 years of qualifying service; below that it is proportionate. */
export const UPS_FULL_SERVICE_YEARS = 25;

/** UPS notification: no assured payout below ten years of qualifying service. */
export const UPS_MIN_SERVICE_YEARS = 10;

/** UPS notification: assured minimum of Rs 10,000 per month at ten or more years of service. */
export const UPS_MIN_MONTHLY_PAYOUT = 10000;

/** UPS notification: family payout is 60% of the payout admissible immediately before demise. */
export const UPS_FAMILY_PAYOUT_RATE = 0.6;

/** UPS notification: lump sum is 1/10th of monthly emoluments per completed six months of service. */
export const UPS_LUMPSUM_RATE_PER_HALF_YEAR = 0.1;

/** Months in the "completed six months" block used by the UPS lump sum clause. */
export const UPS_LUMPSUM_BLOCK_MONTHS = 6;

/** PFRDA Exit Regulations 2015: minimum share of the corpus that must buy an annuity. */
export const NPS_MIN_ANNUITY_SHARE = 40;

/** PFRDA Exit Regulations 2015: corpus at or below this may be withdrawn in full, no annuity. */
export const NPS_FULL_WITHDRAWAL_CORPUS_LIMIT = 500000;

/** Lower bound of the bisection search for the matching NPS return, in % per year. */
export const MIN_SOLVE_RETURN = -15;

/** Upper bound of the bisection search for the matching NPS return, in % per year. */
export const MAX_SOLVE_RETURN = 60;

/** Bisection iterations — 200 halvings of a 75-point band resolves far past 1e-9. */
const SOLVE_ITERATIONS = 200;

/** Sanity ceiling on monthly basic pay. The 7th CPC pay matrix tops out at Rs 2,50,000. */
export const MAX_BASIC_PAY = 1000000;

/** Sanity ceiling on a service span or a retirement horizon, in years. */
export const MAX_YEARS = 45;

/** Sanity ceiling on the DA percentage of basic pay. */
export const MAX_DA_PERCENT = 300;

/** Sanity ceiling on either side's contribution rate, in % of (basic + DA). */
export const MAX_CONTRIBUTION_PERCENT = 50;

/** Sanity ceiling on a quoted immediate-annuity rate. ROP annuities are quoted near 6%. */
export const MAX_ANNUITY_RATE = 15;

/** Sanity ceiling on an already-accumulated NPS corpus, in rupees. */
export const MAX_EXISTING_CORPUS = 100000000;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Basic pay in projection month m (1-indexed), with the annual increment landing on each
 * 12-month anniversary of today. Months 1-12 are drawn at today's basic.
 */
function basicInMonth(currentBasic, growthRate, month) {
  const completedYears = Math.floor((month - 1) / MONTHS_PER_YEAR);
  return currentBasic * Math.pow(1 + growthRate / 100, completedYears);
}

/**
 * DA rate (% of basic) in projection month m, rising by a fixed number of percentage
 * points on each 12-month anniversary. Never allowed below zero.
 */
function daRateInMonth(daNowPercent, daStepPoints, month) {
  const completedYears = Math.floor((month - 1) / MONTHS_PER_YEAR);
  return Math.max(0, daNowPercent + daStepPoints * completedYears);
}

/**
 * Accumulated NPS pension wealth at superannuation for a given annual return.
 *
 *   corpus = existing x (1 + i)^N  +  SUM(m = 1..N) c_m x (1 + i)^(N - m)
 *
 * with i = annualReturn / 1200 and contributions credited at the END of each month, so
 * the final month's contribution earns nothing. c_m is (employee% + employer%) of
 * (basic_m + DA_m).
 */
export function projectNpsCorpus({
  currentBasic,
  daNowPercent,
  basicGrowthPercent,
  daStepPointsPerYear,
  yearsToRetirement,
  existingNpsCorpus,
  employeeContribPercent,
  employerContribPercent,
  annualReturnPercent,
}) {
  const months = Math.round(yearsToRetirement * MONTHS_PER_YEAR);
  const monthlyRate = annualReturnPercent / 100 / MONTHS_PER_YEAR;
  const combinedRate = (employeeContribPercent + employerContribPercent) / 100;

  let corpus = existingNpsCorpus * Math.pow(1 + monthlyRate, months);
  let contributed = 0;

  for (let month = 1; month <= months; month += 1) {
    const basic = basicInMonth(currentBasic, basicGrowthPercent, month);
    const da = daRateInMonth(daNowPercent, daStepPointsPerYear, month);
    const contribution = combinedRate * basic * (1 + da / 100);
    contributed += contribution;
    corpus += contribution * Math.pow(1 + monthlyRate, months - month);
  }

  return { corpus, contributed, months };
}

/**
 * Monthly NPS pension produced by a corpus: the annuitised share bought at the quoted
 * annuity rate, paid monthly and level for life (no indexation).
 */
export function npsMonthlyPensionFromCorpus(corpus, annuitySharePercent, annuityRatePercent) {
  const purchasePrice = (corpus * annuitySharePercent) / 100;
  return (purchasePrice * (annuityRatePercent / 100)) / MONTHS_PER_YEAR;
}

/**
 * Annual NPS return at which the NPS monthly pension equals `targetMonthly`.
 * The corpus is strictly increasing in the return, so a plain bisection is exact.
 * Returns { rate, aboveCap, belowFloor }.
 */
export function solveMatchingReturn(params, targetMonthly) {
  const pensionAt = (rate) => {
    const { corpus } = projectNpsCorpus({ ...params, annualReturnPercent: rate });
    return npsMonthlyPensionFromCorpus(
      corpus,
      params.annuitySharePercent,
      params.annuityRatePercent,
    );
  };

  if (pensionAt(MAX_SOLVE_RETURN) < targetMonthly) {
    return { rate: null, aboveCap: true, belowFloor: false };
  }
  if (pensionAt(MIN_SOLVE_RETURN) >= targetMonthly) {
    return { rate: null, aboveCap: false, belowFloor: true };
  }

  let low = MIN_SOLVE_RETURN;
  let high = MAX_SOLVE_RETURN;
  for (let i = 0; i < SOLVE_ITERATIONS; i += 1) {
    const mid = (low + high) / 2;
    if (pensionAt(mid) < targetMonthly) low = mid;
    else high = mid;
  }
  return { rate: (low + high) / 2, aboveCap: false, belowFloor: false };
}

function validate(input) {
  const numeric = [
    ["currentBasic", "Enter the current monthly basic pay."],
    ["daNowPercent", "Enter the current Dearness Allowance rate."],
    ["basicGrowthPercent", "Enter the annual basic pay growth."],
    ["daStepPointsPerYear", "Enter how many percentage points DA rises each year."],
    ["yearsToRetirement", "Enter the years left to superannuation."],
    ["qualifyingServiceYears", "Enter the total qualifying service at superannuation."],
    ["existingNpsCorpus", "Enter the NPS corpus already accumulated (0 if none)."],
    ["employeeContribPercent", "Enter the employee contribution rate."],
    ["employerContribPercent", "Enter the government contribution rate."],
    ["npsReturnPercent", "Enter the assumed annual NPS return."],
    ["annuitySharePercent", "Enter the share of the corpus you would annuitise."],
    ["annuityRatePercent", "Enter the assumed annuity rate."],
    ["retirementYears", "Enter how many years of retirement to project."],
  ];
  for (const [key, message] of numeric) {
    if (!isNum(input[key])) return message;
  }

  if (input.currentBasic <= 0) return "Basic pay must be more than zero.";
  if (input.currentBasic > MAX_BASIC_PAY) {
    return `Basic pay above Rs ${MAX_BASIC_PAY.toLocaleString("en-IN")} a month is outside any Central Government pay matrix.`;
  }
  if (input.daNowPercent < 0 || input.daNowPercent > MAX_DA_PERCENT) {
    return `Dearness Allowance must be between 0% and ${MAX_DA_PERCENT}% of basic pay.`;
  }
  if (input.basicGrowthPercent < 0 || input.basicGrowthPercent > 20) {
    return "Annual basic pay growth must be between 0% and 20%.";
  }
  if (input.daStepPointsPerYear < 0 || input.daStepPointsPerYear > 20) {
    return "DA growth must be between 0 and 20 percentage points a year.";
  }
  if (input.yearsToRetirement < 0 || input.yearsToRetirement > MAX_YEARS) {
    return `Years to superannuation must be between 0 and ${MAX_YEARS}.`;
  }
  if (input.qualifyingServiceYears < 0 || input.qualifyingServiceYears > MAX_YEARS) {
    return `Qualifying service must be between 0 and ${MAX_YEARS} years.`;
  }
  if (input.qualifyingServiceYears < input.yearsToRetirement) {
    return "Total qualifying service cannot be less than the years you still have to serve.";
  }
  if (input.qualifyingServiceYears < UPS_MIN_SERVICE_YEARS) {
    return `The UPS assured payout needs at least ${UPS_MIN_SERVICE_YEARS} years of qualifying service at superannuation, so there is no assured payout to compare below that.`;
  }
  if (input.existingNpsCorpus < 0 || input.existingNpsCorpus > MAX_EXISTING_CORPUS) {
    return `The existing NPS corpus must be between Rs 0 and Rs ${MAX_EXISTING_CORPUS.toLocaleString("en-IN")}.`;
  }
  if (
    input.employeeContribPercent < 0 ||
    input.employeeContribPercent > MAX_CONTRIBUTION_PERCENT ||
    input.employerContribPercent < 0 ||
    input.employerContribPercent > MAX_CONTRIBUTION_PERCENT
  ) {
    return `Each contribution rate must be between 0% and ${MAX_CONTRIBUTION_PERCENT}% of basic plus DA.`;
  }
  if (input.npsReturnPercent < MIN_SOLVE_RETURN || input.npsReturnPercent > 30) {
    return `The assumed NPS return must be between ${MIN_SOLVE_RETURN}% and 30% a year.`;
  }
  if (input.annuitySharePercent < NPS_MIN_ANNUITY_SHARE || input.annuitySharePercent > 100) {
    return `PFRDA exit rules require at least ${NPS_MIN_ANNUITY_SHARE}% of the corpus to buy an annuity at superannuation, so the annuity share must be between ${NPS_MIN_ANNUITY_SHARE}% and 100%.`;
  }
  if (input.annuityRatePercent <= 0 || input.annuityRatePercent > MAX_ANNUITY_RATE) {
    return `The annuity rate must be above 0% and no more than ${MAX_ANNUITY_RATE}% a year.`;
  }
  if (input.retirementYears < 1 || input.retirementYears > MAX_YEARS) {
    return `Project between 1 and ${MAX_YEARS} years of retirement.`;
  }
  return null;
}

/**
 * Full UPS vs NPS comparison. Every assumption is an argument; nothing is read from the
 * clock, so the same input always gives the same output.
 *
 * @returns {object} either { error } or the full comparison.
 */
export function compareUpsVsNps(rawInput) {
  const input = rawInput && typeof rawInput === "object" ? rawInput : {};
  const error = validate(input);
  if (error) return { error };

  const {
    currentBasic,
    daNowPercent,
    basicGrowthPercent,
    daStepPointsPerYear,
    yearsToRetirement,
    qualifyingServiceYears,
    existingNpsCorpus,
    employeeContribPercent,
    employerContribPercent,
    npsReturnPercent,
    annuitySharePercent,
    annuityRatePercent,
    retirementYears,
  } = input;
  const annuityReturnsPurchasePrice = input.annuityReturnsPurchasePrice !== false;

  // ---- UPS side -----------------------------------------------------------------
  // Basic is held flat within each projection year, so the average of the last twelve
  // months equals the basic drawn in the final year.
  const completedIncrements = Math.max(0, Math.ceil(yearsToRetirement) - 1);
  const avgBasicLast12 = currentBasic * Math.pow(1 + basicGrowthPercent / 100, completedIncrements);
  const daAtSuperannuation = Math.max(
    0,
    daNowPercent + daStepPointsPerYear * completedIncrements,
  );
  const emolumentsAtSuperannuation = avgBasicLast12 * (1 + daAtSuperannuation / 100);

  // Proportionate rule: 25 years or more earns the full 50% rate, less is pro-rated.
  const countedServiceYears = Math.min(qualifyingServiceYears, UPS_FULL_SERVICE_YEARS);
  const serviceFactor = countedServiceYears / UPS_FULL_SERVICE_YEARS;
  const servicePercent = serviceFactor * 100;
  const proportionatePayout = UPS_PAYOUT_RATE * avgBasicLast12 * serviceFactor;
  const assuredPayout = Math.max(proportionatePayout, UPS_MIN_MONTHLY_PAYOUT);
  const minimumApplied = assuredPayout > proportionatePayout;

  const drAtSuperannuation = (assuredPayout * daAtSuperannuation) / 100;
  const upsMonthlyAtRetirement = assuredPayout + drAtSuperannuation;
  const upsFamilyMonthly = UPS_FAMILY_PAYOUT_RATE * upsMonthlyAtRetirement;

  const completedHalfYears = Math.floor(
    (qualifyingServiceYears * MONTHS_PER_YEAR) / UPS_LUMPSUM_BLOCK_MONTHS,
  );
  const upsLumpSum =
    UPS_LUMPSUM_RATE_PER_HALF_YEAR * emolumentsAtSuperannuation * completedHalfYears;

  // ---- NPS side at the assumed return -------------------------------------------
  const corpusParams = {
    currentBasic,
    daNowPercent,
    basicGrowthPercent,
    daStepPointsPerYear,
    yearsToRetirement,
    existingNpsCorpus,
    employeeContribPercent,
    employerContribPercent,
    annuitySharePercent,
    annuityRatePercent,
  };

  const { corpus: npsCorpus, contributed: npsContributed, months: npsMonths } = projectNpsCorpus({
    ...corpusParams,
    annualReturnPercent: npsReturnPercent,
  });
  const npsAnnuityPurchase = (npsCorpus * annuitySharePercent) / 100;
  const npsCommutedLumpSum = npsCorpus - npsAnnuityPurchase;
  const npsMonthlyPension = npsMonthlyPensionFromCorpus(
    npsCorpus,
    annuitySharePercent,
    annuityRatePercent,
  );
  const npsGrowth = npsCorpus - npsContributed - existingNpsCorpus;
  const npsPurchasePriceReturned = annuityReturnsPurchasePrice ? npsAnnuityPurchase : 0;
  const npsBequest = npsCommutedLumpSum + npsPurchasePriceReturned;
  const bequestGivenUpUnderUps = npsBequest - upsLumpSum;
  const npsFullWithdrawalAllowed = npsCorpus <= NPS_FULL_WITHDRAWAL_CORPUS_LIMIT;

  // ---- The hero number: the return that makes NPS match UPS ----------------------
  const matchWithDr = solveMatchingReturn(corpusParams, upsMonthlyAtRetirement);
  const matchWithoutDr = solveMatchingReturn(corpusParams, assuredPayout);

  // ---- Retirement projection: UPS indexes by DR, the NPS annuity is level ---------
  const schedule = [];
  let upsCumulative = 0;
  let npsCumulative = 0;
  let monthlyCrossoverYear = null;
  let cumulativeCrossoverYear = null;
  const wholeRetirementYears = Math.max(1, Math.round(retirementYears));
  for (let year = 1; year <= wholeRetirementYears; year += 1) {
    const drRate = Math.max(0, daAtSuperannuation + daStepPointsPerYear * (year - 1));
    const upsMonthly = assuredPayout * (1 + drRate / 100);
    upsCumulative += upsMonthly * MONTHS_PER_YEAR;
    npsCumulative += npsMonthlyPension * MONTHS_PER_YEAR;
    if (monthlyCrossoverYear === null && upsMonthly > npsMonthlyPension) {
      monthlyCrossoverYear = year;
    }
    if (cumulativeCrossoverYear === null && upsCumulative > npsCumulative) {
      cumulativeCrossoverYear = year;
    }
    schedule.push({
      year,
      drRate,
      upsMonthly,
      npsMonthly: npsMonthlyPension,
      upsCumulative,
      npsCumulative,
    });
  }

  return {
    // UPS
    avgBasicLast12,
    daAtSuperannuation,
    emolumentsAtSuperannuation,
    serviceFactor,
    servicePercent,
    countedServiceYears,
    proportionatePayout,
    assuredPayout,
    minimumApplied,
    drAtSuperannuation,
    upsMonthlyAtRetirement,
    upsFamilyMonthly,
    completedHalfYears,
    upsLumpSum,
    // NPS
    npsMonths,
    npsContributed,
    npsGrowth,
    npsCorpus,
    npsAnnuityPurchase,
    npsCommutedLumpSum,
    npsMonthlyPension,
    npsPurchasePriceReturned,
    npsBequest,
    npsFullWithdrawalAllowed,
    annuityReturnsPurchasePrice,
    // The decidable comparison
    requiredReturn: matchWithDr.rate,
    requiredReturnAboveCap: matchWithDr.aboveCap,
    requiredReturnBelowFloor: matchWithDr.belowFloor,
    requiredReturnExDr: matchWithoutDr.rate,
    requiredReturnExDrAboveCap: matchWithoutDr.aboveCap,
    requiredReturnExDrBelowFloor: matchWithoutDr.belowFloor,
    monthlyGapAtAssumedReturn: npsMonthlyPension - upsMonthlyAtRetirement,
    bequestGivenUpUnderUps,
    // Retirement view
    schedule,
    upsTotalOverHorizon: upsCumulative,
    npsTotalOverHorizon: npsCumulative,
    monthlyCrossoverYear,
    cumulativeCrossoverYear,
  };
}

export default compareUpsVsNps;
