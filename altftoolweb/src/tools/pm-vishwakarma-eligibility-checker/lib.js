/**
 * PM Vishwakarma — eligibility rules and benefit arithmetic.
 *
 * Source of every rule and figure below: the PM Vishwakarma scheme guidelines published by the
 * Ministry of Micro, Small and Medium Enterprises (scheme launched 17 September 2023).
 * Informational only — the final decision rests with the three-stage verification process
 * (Gram Panchayat / ULB → District Implementation Committee → Screening Committee).
 */

/**
 * The scheme covers 18 traditional family-based trades listed in the scheme guidelines.
 * Anything outside this list is not covered, however skilled the craft is.
 */
export const VISHWAKARMA_TRADES = [
  { id: "carpenter", label: "Carpenter (Suthar / Badhai)" },
  { id: "boat-maker", label: "Boat maker" },
  { id: "armourer", label: "Armourer" },
  { id: "blacksmith", label: "Blacksmith (Lohar)" },
  { id: "hammer-toolkit", label: "Hammer and tool kit maker" },
  { id: "locksmith", label: "Locksmith" },
  { id: "goldsmith", label: "Goldsmith (Sonar)" },
  { id: "potter", label: "Potter (Kumhaar)" },
  { id: "sculptor", label: "Sculptor (Moortikar, stone carver) / stone breaker" },
  { id: "cobbler", label: "Cobbler (Charmakar) / shoesmith / footwear artisan" },
  { id: "mason", label: "Mason (Rajmistri)" },
  { id: "basket-weaver", label: "Basket / mat / broom maker / coir weaver" },
  { id: "toy-maker", label: "Traditional doll and toy maker" },
  { id: "barber", label: "Barber (Naai)" },
  { id: "garland-maker", label: "Garland maker (Malakaar)" },
  { id: "washerman", label: "Washerman (Dhobi)" },
  { id: "tailor", label: "Tailor (Darzi)" },
  { id: "fishing-net-maker", label: "Fishing net maker" },
];

/** Minimum age on the date of registration (scheme guidelines, eligibility clause). */
export const MIN_AGE_YEARS = 18;

/** Upper age is not capped by the scheme; this is only a sanity bound for the input. */
export const MAX_AGE_YEARS = 110;

/**
 * An applicant must not have taken a loan under a similar Central or State self-employment
 * credit scheme (PMEGP, PM SVANidhi, Mudra and the like) in the past 5 years. A PM SVANidhi or
 * Mudra loan that has been fully repaid does not block the application.
 */
export const SIMILAR_LOAN_LOOKBACK_YEARS = 5;

/** Toolkit incentive paid as an e-voucher / e-RUPI, up to this amount. */
export const TOOLKIT_INCENTIVE = 15000;

/** Training stipend paid to the trainee for each day of skill training. */
export const TRAINING_STIPEND_PER_DAY = 500;

/** Basic training: 5 to 7 days, roughly 40 hours. Advanced training: 15 days or more. */
export const BASIC_TRAINING_MIN_DAYS = 5;
export const BASIC_TRAINING_MAX_DAYS = 7;
export const ADVANCED_TRAINING_MIN_DAYS = 15;

/** Collateral-free enterprise development loan, released in two tranches. */
export const LOAN_TRANCHES = [
  { tranche: 1, amount: 100000, months: 18 },
  { tranche: 2, amount: 200000, months: 30 },
];

/** Interest actually charged to the artisan, per year. */
export const CONCESSIONAL_INTEREST_RATE = 5;

/** Interest subvention borne by the Government of India, capped at this rate per year. */
export const INTEREST_SUBVENTION_CAP = 8;

/** Incentive for digital transactions: ₹1 per eligible transaction, up to 100 in a month. */
export const DIGITAL_INCENTIVE_PER_TXN = 1;
export const DIGITAL_INCENTIVE_MAX_TXN_PER_MONTH = 100;

const MONTHS_IN_YEAR = 12;

const isNumber = (value) => typeof value === "number" && Number.isFinite(value);

/** Reducing-balance monthly instalment. Returns 0 for degenerate input rather than NaN. */
function monthlyInstalment(principal, annualRatePercent, months) {
  if (!(principal > 0) || !(months > 0)) return 0;
  const r = annualRatePercent / MONTHS_IN_YEAR / 100;
  if (!(r > 0)) return principal / months;
  const growth = Math.pow(1 + r, months);
  const denominator = growth - 1;
  if (!(denominator > 0)) return principal / months;
  return (principal * r * growth) / denominator;
}

/**
 * Applies the published eligibility conditions.
 * Returns { eligible, blockers, notes, trade } or { error } for unusable input.
 */
export function checkVishwakarmaEligibility({
  tradeId = "",
  age = null,
  currentlyPracticing = true,
  availedSimilarLoanWithinFiveYears = false,
  similarLoanFullyRepaid = false,
  familyMemberAlreadyEnrolled = false,
  governmentEmployee = false,
} = {}) {
  if (!isNumber(age)) {
    return { error: "Enter the applicant's age in completed years." };
  }
  if (age < 0) {
    return { error: "Age cannot be negative." };
  }
  if (age > MAX_AGE_YEARS) {
    return { error: `Enter an age of ${MAX_AGE_YEARS} years or less.` };
  }

  const trade = VISHWAKARMA_TRADES.find((item) => item.id === tradeId) || null;
  const blockers = [];
  const notes = [];

  if (!trade) {
    blockers.push(
      "The trade selected is not one of the 18 traditional trades notified under PM Vishwakarma. Only the listed trades are covered.",
    );
  }

  if (age < MIN_AGE_YEARS) {
    blockers.push(
      `The applicant must be at least ${MIN_AGE_YEARS} years old on the date of registration. Current age is ${age}.`,
    );
  }

  if (!currentlyPracticing) {
    blockers.push(
      "The applicant must be engaged in the trade on the date of registration, working with hands and tools as a self-employed artisan in the unorganised sector.",
    );
  }

  if (availedSimilarLoanWithinFiveYears && !similarLoanFullyRepaid) {
    blockers.push(
      `A credit-linked loan under a similar Central or State self-employment scheme (PMEGP, PM SVANidhi, Mudra and the like) taken in the past ${SIMILAR_LOAN_LOOKBACK_YEARS} years and still outstanding makes the applicant ineligible.`,
    );
  } else if (availedSimilarLoanWithinFiveYears && similarLoanFullyRepaid) {
    notes.push(
      "A PM SVANidhi or Mudra loan that has been repaid in full does not block registration — keep the closure or no-dues certificate ready for verification.",
    );
  }

  if (familyMemberAlreadyEnrolled) {
    blockers.push(
      "Registration and benefits are limited to one member per family. For this scheme a family means husband, wife and unmarried children.",
    );
  }

  if (governmentEmployee) {
    blockers.push(
      "Government service employees and their family members are not eligible under the scheme.",
    );
  }

  if (blockers.length === 0) {
    notes.push(
      "Registration is free through a Common Service Centre. Aadhaar-based biometric authentication and a self-declaration of the trade are needed at enrolment.",
    );
    notes.push(
      "Eligibility is confirmed only after three-stage verification: Gram Panchayat or Urban Local Body, then the District Implementation Committee, then the Screening Committee.",
    );
  }

  return {
    eligible: blockers.length === 0,
    blockers,
    notes,
    trade,
  };
}

/**
 * Money value of the benefit package.
 * `trancheNumber` picks the ₹1 lakh / 18-month or ₹2 lakh / 30-month credit tranche.
 */
export function estimateVishwakarmaBenefits({
  trainingDays = BASIC_TRAINING_MIN_DAYS,
  digitalTxnsPerMonth = 0,
  trancheNumber = 1,
} = {}) {
  if (!isNumber(trainingDays) || !isNumber(digitalTxnsPerMonth)) {
    return { error: "Enter training days and monthly digital transactions as numbers." };
  }
  if (trainingDays < 0 || digitalTxnsPerMonth < 0) {
    return { error: "Training days and digital transactions cannot be negative." };
  }
  if (trainingDays > 365) {
    return { error: "Training days should be 365 or fewer." };
  }

  const tranche =
    LOAN_TRANCHES.find((item) => item.tranche === trancheNumber) || LOAN_TRANCHES[0];

  const days = Math.floor(trainingDays);
  const stipend = days * TRAINING_STIPEND_PER_DAY;

  const cappedTxns = Math.min(Math.floor(digitalTxnsPerMonth), DIGITAL_INCENTIVE_MAX_TXN_PER_MONTH);
  const digitalIncentivePerMonth = cappedTxns * DIGITAL_INCENTIVE_PER_TXN;
  const digitalIncentivePerYear = digitalIncentivePerMonth * MONTHS_IN_YEAR;

  const instalment = monthlyInstalment(tranche.amount, CONCESSIONAL_INTEREST_RATE, tranche.months);
  const totalRepayment = instalment * tranche.months;
  const interestPaidByArtisan = Math.max(0, totalRepayment - tranche.amount);

  // Interest avoided because of the subvention: the same loan priced at 5% + 8% = 13% a year.
  const unsubsidisedRate = CONCESSIONAL_INTEREST_RATE + INTEREST_SUBVENTION_CAP;
  const unsubsidisedInstalment = monthlyInstalment(tranche.amount, unsubsidisedRate, tranche.months);
  const unsubsidisedInterest = Math.max(
    0,
    unsubsidisedInstalment * tranche.months - tranche.amount,
  );
  const interestSubventionValue = Math.max(0, unsubsidisedInterest - interestPaidByArtisan);

  return {
    trancheNumber: tranche.tranche,
    loanAmount: tranche.amount,
    loanMonths: tranche.months,
    monthlyInstalment: instalment,
    totalRepayment,
    interestPaidByArtisan,
    unsubsidisedRate,
    unsubsidisedInterest,
    interestSubventionValue,
    trainingDays: days,
    stipend,
    toolkitIncentive: TOOLKIT_INCENTIVE,
    digitalTxnsCounted: cappedTxns,
    digitalIncentivePerMonth,
    digitalIncentivePerYear,
    upfrontBenefit: stipend + TOOLKIT_INCENTIVE,
    firstYearBenefit: stipend + TOOLKIT_INCENTIVE + digitalIncentivePerYear + interestSubventionValue,
  };
}
