/**
 * Senior Citizen Savings Scheme (SCSS) maths.
 *
 * Rule sources:
 *  - Senior Citizens' Savings Scheme Rules, 2019 (Ministry of Finance, DEA), as amended
 *    by the Government Savings Promotion General (Amendment) Rules of 2023 and 2024.
 *  - Quarterly small-savings interest-rate notifications issued by the Department of
 *    Economic Affairs.
 *
 * Interest on SCSS is SIMPLE interest paid out every quarter. It is not compounded,
 * because the depositor receives the money each quarter instead of it staying in the
 * account. The maturity payment is therefore the original deposit, unchanged.
 */

/** Rule 4: the smallest deposit an SCSS account can be opened with. */
export const SCSS_MIN_DEPOSIT = 1000;

/** Rule 4: deposits must be in multiples of ₹1,000. */
export const SCSS_DEPOSIT_MULTIPLE = 1000;

/** Ceiling per depositor across all SCSS accounts, raised from ₹15 lakh w.e.f. 1 April 2023. */
export const SCSS_MAX_DEPOSIT = 3000000;

/** Rule 8: the account matures five years from the date of opening. */
export const SCSS_TENURE_YEARS = 5;

/** Rule 8: one extension block of three years may be taken after maturity. */
export const SCSS_EXTENSION_YEARS = 3;

/** Interest falls due on 31 March, 30 June, 30 September and 31 December. */
export const QUARTERS_PER_YEAR = 4;

/** Rate notified for SCSS for the quarters from 1 April 2023 onwards. */
export const SCSS_DEFAULT_RATE = 8.2;

/** Section 194A threshold for a senior citizen, raised to ₹1,00,000 by the Finance Act 2025. */
export const TDS_THRESHOLD_SENIOR = 100000;

/** Section 80C overall ceiling; SCSS deposits qualify only under the old tax regime. */
export const SECTION_80C_CAP = 150000;

/** General age of entry (Rule 3). */
export const SCSS_MIN_AGE = 60;

/** Superannuation / VRS retirees may open from 55, if the deposit is made within one month of receiving retirement benefits. */
export const SCSS_RETIREE_MIN_AGE = 55;

/** Defence services personnel (other than civilian defence employees) may open from 50. */
export const SCSS_DEFENCE_MIN_AGE = 50;

/** Rule 9: deduction from the deposit on closure on or after 1 year but before 2 years. */
export const PREMATURE_PENALTY_YEAR_1_TO_2 = 1.5;

/** Rule 9: deduction from the deposit on closure on or after 2 years but before maturity. */
export const PREMATURE_PENALTY_AFTER_2 = 1.0;

/** Highest plausible notified rate, used only to reject typing mistakes. */
const MAX_ACCEPTED_RATE = 20;

const round2 = (value) => Math.round(value * 100) / 100;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Who may open an SCSS account.
 *
 * @param {object} input
 * @param {number} input.ageYears  Age in completed years on the date of opening.
 * @param {"general"|"retiree"|"defence"} input.route Entry route claimed by the applicant.
 * @returns {{eligible: boolean, minAge: number, reason: string, conditions: string[]}|{error: string}}
 */
export function checkScssEligibility({ ageYears, route = "general" } = {}) {
  if (!isNum(ageYears)) return { error: "Enter your age in completed years." };
  if (ageYears < 0 || ageYears > 120) return { error: "Enter an age between 0 and 120 years." };

  if (route === "defence") {
    const eligible = ageYears >= SCSS_DEFENCE_MIN_AGE;
    return {
      eligible,
      minAge: SCSS_DEFENCE_MIN_AGE,
      reason: eligible
        ? `Retired defence services personnel may open an SCSS account from age ${SCSS_DEFENCE_MIN_AGE}.`
        : `Retired defence services personnel must be at least ${SCSS_DEFENCE_MIN_AGE} years old.`,
      conditions: [
        "Applies to retired personnel of the defence services, excluding civilian defence employees.",
        "The deposit must be made within one month of receiving the retirement benefits.",
        "The deposit cannot exceed the retirement benefits actually received.",
      ],
    };
  }

  if (route === "retiree") {
    const eligible = ageYears >= SCSS_RETIREE_MIN_AGE;
    return {
      eligible,
      minAge: SCSS_RETIREE_MIN_AGE,
      reason: eligible
        ? `Someone retired on superannuation or under a voluntary retirement scheme may open an account from age ${SCSS_RETIREE_MIN_AGE}.`
        : `The early-retirement route opens only at age ${SCSS_RETIREE_MIN_AGE}.`,
      conditions: [
        "The deposit must be made within one month of receiving the retirement benefits.",
        "The deposit cannot exceed the retirement benefits actually received.",
        "Proof of the date and amount of the retirement benefit is required.",
      ],
    };
  }

  const eligible = ageYears >= SCSS_MIN_AGE;
  return {
    eligible,
    minAge: SCSS_MIN_AGE,
    reason: eligible
      ? `Any resident individual aged ${SCSS_MIN_AGE} or above may open an SCSS account.`
      : `The general route opens at age ${SCSS_MIN_AGE}. Below that only the retiree or defence routes apply.`,
    conditions: [
      "Only resident individuals may hold an SCSS account; NRIs and HUFs cannot.",
      "A joint account is allowed only with the spouse, and the first holder is the depositor.",
    ],
  };
}

/**
 * Quarterly payout and five-year interest on an SCSS deposit.
 *
 * Quarterly interest = deposit x annual rate / 4. Simple, not compounded, because the
 * interest leaves the account each quarter.
 *
 * @param {object} input
 * @param {number} input.deposit      Amount deposited, in rupees.
 * @param {number} input.annualRate   Notified annual rate, in percent.
 * @param {number} [input.tenureYears] 5 for the original term, 8 if the 3-year extension is taken.
 * @returns {object} payout breakdown, or { error }
 */
export function computeScssPayout({ deposit, annualRate, tenureYears = SCSS_TENURE_YEARS } = {}) {
  if (!isNum(deposit)) return { error: "Enter the deposit amount in rupees." };
  if (!isNum(annualRate)) return { error: "Enter the notified annual interest rate." };
  if (!isNum(tenureYears) || tenureYears <= 0) {
    return { error: "Tenure must be at least one year." };
  }
  if (deposit < SCSS_MIN_DEPOSIT) {
    return { error: `The minimum SCSS deposit is ₹${SCSS_MIN_DEPOSIT.toLocaleString("en-IN")}.` };
  }
  if (deposit > SCSS_MAX_DEPOSIT) {
    return {
      error: `A depositor cannot hold more than ₹${SCSS_MAX_DEPOSIT.toLocaleString("en-IN")} across all SCSS accounts.`,
    };
  }
  if (annualRate < 0 || annualRate > MAX_ACCEPTED_RATE) {
    return { error: `Enter a rate between 0% and ${MAX_ACCEPTED_RATE}% per year.` };
  }
  if (tenureYears > SCSS_TENURE_YEARS + SCSS_EXTENSION_YEARS) {
    return {
      error: `An SCSS account runs for ${SCSS_TENURE_YEARS} years, extendable once by ${SCSS_EXTENSION_YEARS} years.`,
    };
  }

  const multipleRemainder = deposit % SCSS_DEPOSIT_MULTIPLE;
  const annualInterest = (deposit * annualRate) / 100;
  const quarterlyPayout = annualInterest / QUARTERS_PER_YEAR;
  const totalQuarters = Math.round(tenureYears * QUARTERS_PER_YEAR);
  const totalInterest = quarterlyPayout * totalQuarters;
  const monthlyEquivalent = annualInterest / 12;

  return {
    deposit: round2(deposit),
    annualRate,
    tenureYears,
    totalQuarters,
    quarterlyPayout: round2(quarterlyPayout),
    monthlyEquivalent: round2(monthlyEquivalent),
    annualInterest: round2(annualInterest),
    totalInterest: round2(totalInterest),
    /** SCSS returns the principal untouched at maturity; the interest was already paid out. */
    maturityAmount: round2(deposit),
    totalReceived: round2(deposit + totalInterest),
    tdsThreshold: TDS_THRESHOLD_SENIOR,
    tdsApplicable: annualInterest > TDS_THRESHOLD_SENIOR,
    tdsHeadroom: round2(Math.max(0, TDS_THRESHOLD_SENIOR - annualInterest)),
    section80cEligible: round2(Math.min(deposit, SECTION_80C_CAP)),
    depositIsValidMultiple: multipleRemainder === 0,
    multipleShortfall: multipleRemainder === 0 ? 0 : round2(SCSS_DEPOSIT_MULTIPLE - multipleRemainder),
  };
}

/**
 * What a depositor gets back if the account is closed before the five years are up.
 *
 * Rule 9 of the SCSS Rules, 2019:
 *  - closed before one year  : no interest is payable; interest already paid is recovered
 *                              from the deposit.
 *  - one year to two years   : 1.5% of the deposit is deducted.
 *  - two years to maturity   : 1% of the deposit is deducted.
 *
 * @param {object} input
 * @param {number} input.deposit    Amount deposited, in rupees.
 * @param {number} input.annualRate Notified annual rate, in percent.
 * @param {number} input.heldYears  Completed period held, in years (0 < heldYears < 5).
 * @returns {object} closure breakdown, or { error }
 */
export function computeScssPrematureClosure({ deposit, annualRate, heldYears } = {}) {
  if (!isNum(deposit) || deposit < SCSS_MIN_DEPOSIT) {
    return { error: `Enter a deposit of at least ₹${SCSS_MIN_DEPOSIT.toLocaleString("en-IN")}.` };
  }
  if (!isNum(annualRate) || annualRate < 0 || annualRate > MAX_ACCEPTED_RATE) {
    return { error: `Enter a rate between 0% and ${MAX_ACCEPTED_RATE}% per year.` };
  }
  if (!isNum(heldYears) || heldYears <= 0) {
    return { error: "Enter how long the account has been held, in years." };
  }
  if (heldYears >= SCSS_TENURE_YEARS) {
    return {
      error: `At ${SCSS_TENURE_YEARS} years the account matures normally, so no premature-closure deduction applies.`,
    };
  }

  const quarterlyPayout = (deposit * annualRate) / 100 / QUARTERS_PER_YEAR;
  const completedQuarters = Math.floor(heldYears * QUARTERS_PER_YEAR);
  const interestCredited = quarterlyPayout * completedQuarters;

  let penaltyRate = 0;
  let penaltyAmount = 0;
  let interestRecovered = 0;
  let rule = "";

  if (heldYears < 1) {
    interestRecovered = interestCredited;
    rule = "Closed before one year: no interest is payable and any interest already paid is recovered.";
  } else if (heldYears < 2) {
    penaltyRate = PREMATURE_PENALTY_YEAR_1_TO_2;
    penaltyAmount = (deposit * penaltyRate) / 100;
    rule = `Closed on or after one year but before two years: ${penaltyRate}% of the deposit is deducted.`;
  } else {
    penaltyRate = PREMATURE_PENALTY_AFTER_2;
    penaltyAmount = (deposit * penaltyRate) / 100;
    rule = `Closed on or after two years but before maturity: ${penaltyRate}% of the deposit is deducted.`;
  }

  const amountRefunded = Math.max(0, deposit - penaltyAmount - interestRecovered);
  const netInterestKept = Math.max(0, interestCredited - interestRecovered) - penaltyAmount;

  return {
    heldYears,
    completedQuarters,
    quarterlyPayout: round2(quarterlyPayout),
    interestCredited: round2(interestCredited),
    interestRecovered: round2(interestRecovered),
    penaltyRate,
    penaltyAmount: round2(penaltyAmount),
    amountRefunded: round2(amountRefunded),
    netInterestKept: round2(netInterestKept),
    totalInHand: round2(amountRefunded + Math.max(0, interestCredited - interestRecovered)),
    rule,
  };
}
