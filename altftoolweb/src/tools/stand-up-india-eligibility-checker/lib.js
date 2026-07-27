/**
 * Stand Up India scheme eligibility and loan sizing.
 *
 * Rule source: the Stand Up India scheme launched on 5 April 2016 by the Department of
 * Financial Services, Ministry of Finance, and the scheme guidelines circulated to
 * scheduled commercial banks (including the 2017 extension to the trading sector and the
 * later inclusion of activities allied to agriculture).
 *
 * The scheme asks every scheduled commercial bank branch to sanction a composite loan of
 * ₹10 lakh to ₹1 crore to at least one Scheduled Caste or Scheduled Tribe borrower and at
 * least one woman borrower, for a greenfield enterprise.
 */

/** Floor of the composite loan the scheme covers. */
export const MIN_LOAN = 1000000;

/** Ceiling of the composite loan the scheme covers. */
export const MAX_LOAN = 10000000;

/** The composite loan is designed to cover up to 85% of the project cost. */
export const MAX_BANK_FINANCE_PCT = 85;

/** The borrower must bring in at least 10% of the project cost from own funds. */
export const MIN_OWN_CONTRIBUTION_PCT = 10;

/** Maximum repayment period for the term loan portion. */
export const MAX_REPAYMENT_YEARS = 7;

/** Maximum moratorium (repayment holiday) allowed. */
export const MAX_MORATORIUM_MONTHS = 18;

/** Working capital up to this amount may be sanctioned as an overdraft; above it, as a cash credit limit. */
export const OVERDRAFT_WORKING_CAPITAL_LIMIT = 1000000;

/** Minimum age of the borrower. */
export const MIN_BORROWER_AGE = 18;

/** For a non-individual enterprise, this share must be held by SC/ST and/or women entrepreneurs. */
export const MIN_SCST_WOMAN_SHAREHOLDING_PCT = 51;

/** Sectors the scheme covers. */
export const ELIGIBLE_SECTORS = [
  { id: "manufacturing", label: "Manufacturing" },
  { id: "services", label: "Services" },
  { id: "trading", label: "Trading" },
  { id: "agri-allied", label: "Activities allied to agriculture" },
];

/** Social categories the scheme recognises for the reservation leg. */
export const SOCIAL_CATEGORIES = [
  { id: "sc", label: "Scheduled Caste (SC)" },
  { id: "st", label: "Scheduled Tribe (ST)" },
  { id: "obc", label: "Other Backward Class (OBC)" },
  { id: "general", label: "General" },
];

const round2 = (value) => Math.round(value * 100) / 100;
const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Run every Stand Up India criterion against one applicant and size the loan.
 *
 * @param {object} input
 * @param {number} input.ageYears
 * @param {"sc"|"st"|"obc"|"general"} input.socialCategory
 * @param {"female"|"male"|"other"} input.gender
 * @param {"individual"|"entity"} input.entityType
 * @param {number} [input.scstWomanShareholdingPct] Only used when entityType is "entity".
 * @param {boolean} input.isGreenfield Is this the borrower's first venture in this activity?
 * @param {boolean} input.hasExistingDefault Is the borrower in default to any bank or FI?
 * @param {string} input.sector One of ELIGIBLE_SECTORS ids, or anything else.
 * @param {number} input.projectCost Total project cost, in rupees.
 * @param {number} input.ownContribution Margin money the borrower can bring, in rupees.
 * @returns {object} { eligible, checks, sizing } or { error }
 */
export function assessStandUpIndia({
  ageYears,
  socialCategory = "general",
  gender = "female",
  entityType = "individual",
  scstWomanShareholdingPct = 100,
  isGreenfield = true,
  hasExistingDefault = false,
  sector = "manufacturing",
  projectCost,
  ownContribution,
} = {}) {
  if (!isNum(ageYears) || ageYears < 0 || ageYears > 120) {
    return { error: "Enter the borrower's age in completed years, between 0 and 120." };
  }
  if (!isNum(projectCost) || projectCost <= 0) {
    return { error: "Enter the total project cost in rupees." };
  }
  if (!isNum(ownContribution) || ownContribution < 0) {
    return { error: "Enter the margin money the borrower can bring, or zero." };
  }
  if (ownContribution > projectCost) {
    return { error: "Margin money cannot exceed the total project cost." };
  }
  if (entityType === "entity" && (!isNum(scstWomanShareholdingPct) || scstWomanShareholdingPct < 0 || scstWomanShareholdingPct > 100)) {
    return { error: "Enter the SC/ST and women shareholding as a percentage between 0 and 100." };
  }

  const isScSt = socialCategory === "sc" || socialCategory === "st";
  const isWoman = gender === "female";
  const sectorEntry = ELIGIBLE_SECTORS.find((item) => item.id === sector);

  // Loan sizing: 85% of project cost, but never outside the ₹10 lakh to ₹1 crore band.
  const financeAt85 = (projectCost * MAX_BANK_FINANCE_PCT) / 100;
  const indicativeLoan = Math.min(financeAt85, MAX_LOAN);
  const cappedByCeiling = financeAt85 > MAX_LOAN;
  const minOwnContribution = Math.max(
    (projectCost * MIN_OWN_CONTRIBUTION_PCT) / 100,
    projectCost - indicativeLoan,
  );
  const ownContributionPct = (ownContribution / projectCost) * 100;
  const contributionShortfall = Math.max(0, minOwnContribution - ownContribution);

  const checks = [
    {
      id: "category",
      label: "SC, ST or woman borrower",
      passed: isScSt || isWoman,
      detail: isScSt || isWoman
        ? `${isScSt ? "SC/ST" : ""}${isScSt && isWoman ? " and " : ""}${isWoman ? "woman" : ""} borrower — the scheme's core target group.`
        : "The scheme finances only Scheduled Caste, Scheduled Tribe or women entrepreneurs. A general or OBC male borrower should look at PMEGP or MUDRA instead.",
    },
    {
      id: "age",
      label: `Aged ${MIN_BORROWER_AGE} or above`,
      passed: ageYears >= MIN_BORROWER_AGE,
      detail: ageYears >= MIN_BORROWER_AGE
        ? `${ageYears} years old, above the minimum of ${MIN_BORROWER_AGE}.`
        : `The borrower must be at least ${MIN_BORROWER_AGE} years old.`,
    },
    {
      id: "greenfield",
      label: "Greenfield venture",
      passed: Boolean(isGreenfield),
      detail: isGreenfield
        ? "First-time venture of the borrower in this activity, which is what greenfield means here."
        : "The loan must fund the borrower's first venture in the chosen activity. An expansion of an existing business is not covered.",
    },
    {
      id: "sector",
      label: "Eligible sector",
      passed: Boolean(sectorEntry),
      detail: sectorEntry
        ? `${sectorEntry.label} is inside the covered sectors.`
        : "Only manufacturing, services, trading and activities allied to agriculture are covered.",
    },
    {
      id: "default",
      label: "Not in default to any bank or financial institution",
      passed: !hasExistingDefault,
      detail: hasExistingDefault
        ? "An existing default to any bank or financial institution disqualifies the borrower."
        : "No outstanding default declared.",
    },
    {
      id: "shareholding",
      label: `SC/ST or women hold at least ${MIN_SCST_WOMAN_SHAREHOLDING_PCT}%`,
      passed:
        entityType === "individual" || scstWomanShareholdingPct >= MIN_SCST_WOMAN_SHAREHOLDING_PCT,
      detail:
        entityType === "individual"
          ? "Individual borrower, so the shareholding test does not apply."
          : scstWomanShareholdingPct >= MIN_SCST_WOMAN_SHAREHOLDING_PCT
            ? `${scstWomanShareholdingPct}% held by SC/ST and/or women entrepreneurs, above the ${MIN_SCST_WOMAN_SHAREHOLDING_PCT}% requirement.`
            : `At least ${MIN_SCST_WOMAN_SHAREHOLDING_PCT}% of the shareholding and the controlling stake must sit with SC/ST and/or women entrepreneurs. Currently ${scstWomanShareholdingPct}%.`,
    },
    {
      id: "loan-band",
      label: "Loan falls between ₹10 lakh and ₹1 crore",
      passed: indicativeLoan >= MIN_LOAN,
      detail:
        indicativeLoan >= MIN_LOAN
          ? `A project cost of ₹${Math.round(projectCost).toLocaleString("en-IN")} supports a composite loan of about ₹${Math.round(indicativeLoan).toLocaleString("en-IN")}.`
          : `At ${MAX_BANK_FINANCE_PCT}% of the project cost the loan works out to about ₹${Math.round(indicativeLoan).toLocaleString("en-IN")}, below the ₹${MIN_LOAN.toLocaleString("en-IN")} floor. A smaller project fits MUDRA rather than Stand Up India.`,
    },
    {
      id: "margin",
      label: `Margin money of at least ${MIN_OWN_CONTRIBUTION_PCT}%`,
      passed: contributionShortfall <= 0,
      detail:
        contributionShortfall <= 0
          ? `Margin money of ₹${Math.round(ownContribution).toLocaleString("en-IN")} is ${round2(ownContributionPct)}% of the project cost.`
          : `Another ₹${Math.round(contributionShortfall).toLocaleString("en-IN")} of margin money is needed${cappedByCeiling ? ", because the ₹1 crore ceiling leaves a larger gap to fund" : ""}.`,
    },
  ];

  const failed = checks.filter((check) => !check.passed);

  return {
    eligible: failed.length === 0,
    checks,
    failedCount: failed.length,
    sizing: {
      projectCost: round2(projectCost),
      financeAt85: round2(financeAt85),
      indicativeLoan: round2(indicativeLoan),
      cappedByCeiling,
      minOwnContribution: round2(minOwnContribution),
      minOwnContributionPct: round2((minOwnContribution / projectCost) * 100),
      ownContribution: round2(ownContribution),
      ownContributionPct: round2(ownContributionPct),
      contributionShortfall: round2(contributionShortfall),
      fundingGap: round2(Math.max(0, projectCost - indicativeLoan - ownContribution)),
      overdraftWorkingCapitalLimit: OVERDRAFT_WORKING_CAPITAL_LIMIT,
    },
  };
}

/**
 * Indicative repayment on the sanctioned composite loan.
 *
 * Interest accrues during the moratorium but no instalment is paid, so the standard
 * reducing-balance EMI runs over the months left after the moratorium.
 *
 * @param {object} input
 * @param {number} input.loanAmount
 * @param {number} input.annualRate  Interest rate in percent per year.
 * @param {number} input.tenureYears Total tenure including the moratorium.
 * @param {number} input.moratoriumMonths
 * @returns {object} repayment breakdown, or { error }
 */
export function computeStandUpRepayment({
  loanAmount,
  annualRate,
  tenureYears,
  moratoriumMonths = 0,
} = {}) {
  if (!isNum(loanAmount) || loanAmount <= 0) {
    return { error: "Enter the sanctioned loan amount in rupees." };
  }
  if (!isNum(annualRate) || annualRate < 0 || annualRate > 40) {
    return { error: "Enter an interest rate between 0% and 40% per year." };
  }
  if (!isNum(tenureYears) || tenureYears <= 0 || tenureYears > MAX_REPAYMENT_YEARS) {
    return { error: `Stand Up India loans are repayable in up to ${MAX_REPAYMENT_YEARS} years.` };
  }
  if (!isNum(moratoriumMonths) || moratoriumMonths < 0 || moratoriumMonths > MAX_MORATORIUM_MONTHS) {
    return { error: `The moratorium can run up to ${MAX_MORATORIUM_MONTHS} months.` };
  }

  const totalMonths = Math.round(tenureYears * 12);
  const repayMonths = totalMonths - Math.round(moratoriumMonths);
  if (repayMonths <= 0) {
    return { error: "The moratorium cannot use up the whole tenure — leave months to repay in." };
  }

  const monthlyRate = annualRate / 12 / 100;
  const moratoriumInterest = loanAmount * monthlyRate * Math.round(moratoriumMonths);

  let emi;
  if (monthlyRate === 0) {
    emi = loanAmount / repayMonths;
  } else {
    const growth = Math.pow(1 + monthlyRate, repayMonths);
    emi = (loanAmount * monthlyRate * growth) / (growth - 1);
  }

  const repaymentTotal = emi * repayMonths;
  const interestAfterMoratorium = repaymentTotal - loanAmount;

  return {
    loanAmount: round2(loanAmount),
    totalMonths,
    moratoriumMonths: Math.round(moratoriumMonths),
    repayMonths,
    emi: round2(emi),
    moratoriumInterest: round2(moratoriumInterest),
    interestAfterMoratorium: round2(interestAfterMoratorium),
    totalInterest: round2(moratoriumInterest + interestAfterMoratorium),
    totalOutgo: round2(loanAmount + moratoriumInterest + interestAfterMoratorium),
  };
}
