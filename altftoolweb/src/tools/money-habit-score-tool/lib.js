/**
 * A money habit score built from eleven checks across saving, spending and planning.
 *
 * Benchmarks used, and where each comes from
 *  - Savings rate of 20% of take-home pay: the "20" in the 50/30/20 budgeting rule set out by
 *    Elizabeth Warren and Amelia Warren Tyagi in All Your Worth.
 *  - Emergency fund of 3 to 6 months of expenses: the standard range in investor education
 *    material from SEBI and the RBI, and the near-universal planner rule of thumb. Six months is
 *    used as full marks, three as the minimum acceptable.
 *  - Total EMIs within 40% of net income: the fixed obligation to income ratio (FOIR) lenders
 *    apply when underwriting retail loans, which normally sits between 40% and 50%.
 *  - Never revolving a credit card balance: Indian card issuers typically charge around 3% to
 *    3.5% a month on revolved balances, which is 42% to 52% a year, plus the loss of the
 *    interest-free period on fresh spends.
 *  - Term life cover of at least 10 times annual income: the standard sum assured guideline;
 *    insurers commonly underwrite up to 15 to 20 times income at younger ages.
 *  - Health cover of at least Rs 5,00,000: a common floor for a family floater given the cost of
 *    a single hospitalisation in a metro.
 *
 * Scoring
 *  - Each check returns a sub-score from 0 to 100 against its own thresholds.
 *  - Each check carries a weight; a pillar score is the weighted mean of its checks, and the
 *    overall score is the weighted mean of all eleven.
 *  - No check can return NaN: every ratio is guarded and every choice falls back to zero.
 */

/** Benchmark constants. */
export const TARGET_SAVINGS_RATE_PCT = 20;
export const TARGET_EMERGENCY_MONTHS = 6;
export const MINIMUM_EMERGENCY_MONTHS = 3;
export const MAX_HEALTHY_FOIR_PCT = 40;
export const TARGET_TERM_COVER_MULTIPLE = 10;
export const MINIMUM_HEALTH_COVER = 500000;

/** Pillars the checks roll up into. */
export const PILLARS = ["Saving", "Spending", "Planning"];

/** Score bands, by minimum overall score. */
export const BANDS = [
  { min: 80, label: "Strong", summary: "The fundamentals are in place. Refine rather than rebuild." },
  { min: 60, label: "Solid", summary: "Good habits with one or two real gaps worth closing this year." },
  { min: 40, label: "Fragile", summary: "One shock — a job loss or a hospital bill — would be hard to absorb." },
  { min: 0, label: "At risk", summary: "Start with cash flow and an emergency buffer before anything else." },
];

/** Choice-based checks and the score each option earns. */
export const CHOICE_OPTIONS = {
  tracksSpending: [
    { value: "always", label: "Every month, and I know where it went", score: 100 },
    { value: "sometimes", label: "Occasionally, when something feels off", score: 50 },
    { value: "never", label: "Never — I only see the bank balance", score: 0 },
  ],
  retirementSaving: [
    { value: "systematic", label: "A fixed amount goes in automatically every month", score: 100 },
    { value: "adhoc", label: "Whenever there is something left over", score: 50 },
    { value: "none", label: "Nothing set aside for retirement yet", score: 0 },
  ],
  revolvesCard: [
    { value: "no", label: "I clear the full statement every month", score: 100 },
    { value: "minimum", label: "I sometimes pay only the minimum due", score: 20 },
    { value: "yes", label: "I regularly carry a balance forward", score: 0 },
  ],
  goalsWritten: [
    { value: "yes", label: "Written down with an amount and a date", score: 100 },
    { value: "vague", label: "In my head, no numbers attached", score: 40 },
    { value: "no", label: "No goals set", score: 0 },
  ],
  nominations: [
    { value: "both", label: "Nominations current and a will in place", score: 100 },
    { value: "nomination", label: "Nominations current, no will", score: 60 },
    { value: "neither", label: "Neither is up to date", score: 0 },
  ],
  reviewsFinances: [
    { value: "yearly", label: "At least once a year, deliberately", score: 100 },
    { value: "reactive", label: "Only when markets move or something breaks", score: 45 },
    { value: "never", label: "Never reviewed", score: 0 },
  ],
};

/** Weights per check. Higher means it moves the score more. */
export const CHECK_WEIGHTS = {
  savingsRate: 3,
  emergencyFund: 3,
  retirementSaving: 2,
  emiBurden: 3,
  revolvesCard: 3,
  tracksSpending: 2,
  termCover: 2,
  healthCover: 2,
  goalsWritten: 1,
  nominations: 1,
  reviewsFinances: 1,
};

function isNum(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function round1(value) {
  return Math.round(value * 10) / 10;
}

function choiceScore(group, value) {
  const option = CHOICE_OPTIONS[group]?.find((item) => item.value === value);
  return option ? option.score : 0;
}

function choiceLabel(group, value) {
  const option = CHOICE_OPTIONS[group]?.find((item) => item.value === value);
  return option ? option.label : "Not answered";
}

/** Savings rate band: 20% is the 50/30/20 target. */
function scoreSavingsRate(ratePct) {
  if (ratePct >= TARGET_SAVINGS_RATE_PCT) return 100;
  if (ratePct >= 15) return 80;
  if (ratePct >= 10) return 60;
  if (ratePct >= 5) return 35;
  return 10;
}

/** Emergency fund band: six months full marks, three months the floor. */
function scoreEmergencyMonths(months) {
  if (months >= TARGET_EMERGENCY_MONTHS) return 100;
  if (months >= MINIMUM_EMERGENCY_MONTHS) return 70;
  if (months >= 1) return 40;
  return 10;
}

/** FOIR band: lenders start refusing above roughly 40% to 50%. */
function scoreFoir(foirPct) {
  if (foirPct <= 20) return 100;
  if (foirPct <= 30) return 85;
  if (foirPct <= MAX_HEALTHY_FOIR_PCT) return 65;
  if (foirPct <= 50) return 35;
  return 10;
}

/** Term cover band: ten times annual income is the standard guideline. */
function scoreTermCover(multiple) {
  if (multiple >= TARGET_TERM_COVER_MULTIPLE) return 100;
  if (multiple >= 5) return 65;
  if (multiple > 0) return 30;
  return 0;
}

/** Health cover band, on the sum insured itself rather than a multiple of income. */
function scoreHealthCover(cover) {
  if (cover >= 1000000) return 100;
  if (cover >= MINIMUM_HEALTH_COVER) return 85;
  if (cover >= 300000) return 60;
  if (cover > 0) return 35;
  return 0;
}

/**
 * Score a set of habits.
 *
 * @param {object} input
 * @param {number} input.monthlyNetIncome   Take-home pay per month.
 * @param {number} input.monthlyExpenses    Regular living expenses per month, excluding EMIs.
 * @param {number} input.monthlySavings     Amount saved or invested each month.
 * @param {number} input.emergencyFund      Liquid money set aside for emergencies.
 * @param {number} input.monthlyEmi         Total of all loan instalments per month.
 * @param {number} input.termCover          Term life sum assured.
 * @param {number} input.healthCover        Health insurance sum insured.
 * @param {string} input.tracksSpending     Key from CHOICE_OPTIONS.
 * @param {string} input.retirementSaving   Key from CHOICE_OPTIONS.
 * @param {string} input.revolvesCard       Key from CHOICE_OPTIONS.
 * @param {string} input.goalsWritten       Key from CHOICE_OPTIONS.
 * @param {string} input.nominations        Key from CHOICE_OPTIONS.
 * @param {string} input.reviewsFinances    Key from CHOICE_OPTIONS.
 */
export function scoreMoneyHabits({
  monthlyNetIncome = 100000,
  monthlyExpenses = 55000,
  monthlySavings = 20000,
  emergencyFund = 300000,
  monthlyEmi = 20000,
  termCover = 10000000,
  healthCover = 500000,
  tracksSpending = "sometimes",
  retirementSaving = "adhoc",
  revolvesCard = "no",
  goalsWritten = "vague",
  nominations = "nomination",
  reviewsFinances = "reactive",
}) {
  if (!isNum(monthlyNetIncome) || monthlyNetIncome <= 0) {
    return { error: "Monthly take-home income must be greater than zero." };
  }
  if (!isNum(monthlyExpenses) || monthlyExpenses <= 0) {
    return { error: "Monthly living expenses must be greater than zero." };
  }
  const nonNegative = { monthlySavings, emergencyFund, monthlyEmi, termCover, healthCover };
  for (const [key, value] of Object.entries(nonNegative)) {
    if (!isNum(value) || value < 0) {
      return { error: `The value for ${key.replace(/([A-Z])/g, " $1").toLowerCase()} must be zero or more.` };
    }
  }

  const annualIncome = monthlyNetIncome * 12;
  const savingsRatePct = (monthlySavings / monthlyNetIncome) * 100;
  const emergencyMonths = emergencyFund / monthlyExpenses;
  const foirPct = (monthlyEmi / monthlyNetIncome) * 100;
  const termMultiple = termCover / annualIncome;

  const checks = [
    {
      id: "savingsRate",
      pillar: "Saving",
      label: "Savings rate",
      measured: `${round1(savingsRatePct)}% of take-home`,
      target: `${TARGET_SAVINGS_RATE_PCT}% or more`,
      score: scoreSavingsRate(savingsRatePct),
      tip:
        savingsRatePct >= TARGET_SAVINGS_RATE_PCT
          ? "Holding a 20% savings rate is the single strongest habit here — protect it when income rises."
          : `Saving ${TARGET_SAVINGS_RATE_PCT}% of ${Math.round(monthlyNetIncome)} means ${Math.round((monthlyNetIncome * TARGET_SAVINGS_RATE_PCT) / 100)} a month, so you are short by about ${Math.max(0, Math.round((monthlyNetIncome * TARGET_SAVINGS_RATE_PCT) / 100 - monthlySavings))}. Automate the transfer on payday rather than saving what is left at month end.`,
    },
    {
      id: "emergencyFund",
      pillar: "Saving",
      label: "Emergency fund",
      measured: `${round1(emergencyMonths)} months of expenses`,
      target: `${TARGET_EMERGENCY_MONTHS} months`,
      score: scoreEmergencyMonths(emergencyMonths),
      tip:
        emergencyMonths >= TARGET_EMERGENCY_MONTHS
          ? "Keep it in a savings account or liquid fund, not in equity, so it is available the day you need it."
          : `Six months of your ${Math.round(monthlyExpenses)} expenses is ${Math.round(monthlyExpenses * TARGET_EMERGENCY_MONTHS)}, leaving a gap of about ${Math.max(0, Math.round(monthlyExpenses * TARGET_EMERGENCY_MONTHS - emergencyFund))}. Build to three months first, then to six.`,
    },
    {
      id: "retirementSaving",
      pillar: "Saving",
      label: "Retirement saving",
      measured: choiceLabel("retirementSaving", retirementSaving),
      target: "A fixed automatic monthly amount",
      score: choiceScore("retirementSaving", retirementSaving),
      tip: "Retirement is the one goal you cannot borrow for. A standing instruction on payday beats good intentions at month end.",
    },
    {
      id: "emiBurden",
      pillar: "Spending",
      label: "Loan burden (FOIR)",
      measured: `${round1(foirPct)}% of take-home goes to EMIs`,
      target: `Under ${MAX_HEALTHY_FOIR_PCT}%`,
      score: scoreFoir(foirPct),
      tip:
        foirPct <= MAX_HEALTHY_FOIR_PCT
          ? "You are inside the range lenders underwrite to, which leaves room to absorb a rate rise."
          : `EMIs of ${Math.round(monthlyEmi)} against income of ${Math.round(monthlyNetIncome)} is above the ${MAX_HEALTHY_FOIR_PCT}% ratio most lenders stop at. Clear the highest-rate loan first before taking on anything new.`,
    },
    {
      id: "revolvesCard",
      pillar: "Spending",
      label: "Credit card discipline",
      measured: choiceLabel("revolvesCard", revolvesCard),
      target: "Full statement cleared every month",
      score: choiceScore("revolvesCard", revolvesCard),
      tip: "Revolved card balances typically carry 3% to 3.5% a month, which is over 40% a year, and paying the minimum also kills the interest-free period on new spends.",
    },
    {
      id: "tracksSpending",
      pillar: "Spending",
      label: "Spending awareness",
      measured: choiceLabel("tracksSpending", tracksSpending),
      target: "Reviewed every month",
      score: choiceScore("tracksSpending", tracksSpending),
      tip: "You cannot cut what you cannot see. One month of categorised statements usually finds the leak without any budgeting app.",
    },
    {
      id: "termCover",
      pillar: "Planning",
      label: "Life cover",
      measured: `${round1(termMultiple)}x annual income`,
      target: `${TARGET_TERM_COVER_MULTIPLE}x or more`,
      score: scoreTermCover(termMultiple),
      tip:
        termMultiple >= TARGET_TERM_COVER_MULTIPLE
          ? "Review the sum assured whenever income, a loan or a dependant changes."
          : `Ten times your annual income of ${Math.round(annualIncome)} is ${Math.round(annualIncome * TARGET_TERM_COVER_MULTIPLE)}. Pure term cover buys that for a fraction of what a bundled savings policy costs.`,
    },
    {
      id: "healthCover",
      pillar: "Planning",
      label: "Health cover",
      measured: `${Math.round(healthCover)} sum insured`,
      target: `${MINIMUM_HEALTH_COVER} or more`,
      score: scoreHealthCover(healthCover),
      tip: "Employer cover ends with the job and is usually too small on its own. A personal floater keeps the waiting periods running in your favour.",
    },
    {
      id: "goalsWritten",
      pillar: "Planning",
      label: "Written goals",
      measured: choiceLabel("goalsWritten", goalsWritten),
      target: "Amount and date for each goal",
      score: choiceScore("goalsWritten", goalsWritten),
      tip: "A goal without a rupee figure and a date cannot be planned for, because you never know how much to invest each month.",
    },
    {
      id: "nominations",
      pillar: "Planning",
      label: "Nomination and will",
      measured: choiceLabel("nominations", nominations),
      target: "Both current",
      score: choiceScore("nominations", nominations),
      tip: "A nominee only receives and holds the money; ownership passes under a will or succession law, so the two are not substitutes.",
    },
    {
      id: "reviewsFinances",
      pillar: "Planning",
      label: "Annual review",
      measured: choiceLabel("reviewsFinances", reviewsFinances),
      target: "At least once a year",
      score: choiceScore("reviewsFinances", reviewsFinances),
      tip: "One fixed date a year to check cover, nominations, asset mix and goal progress prevents most drift.",
    },
  ].map((check) => ({ ...check, weight: CHECK_WEIGHTS[check.id] }));

  const pillars = PILLARS.map((pillar) => {
    const rows = checks.filter((check) => check.pillar === pillar);
    const weight = rows.reduce((sum, row) => sum + row.weight, 0);
    const weighted = rows.reduce((sum, row) => sum + row.score * row.weight, 0);
    return {
      pillar,
      score: weight === 0 ? 0 : Math.round(weighted / weight),
      weight,
    };
  });

  const totalWeight = checks.reduce((sum, row) => sum + row.weight, 0);
  const overall = Math.round(
    checks.reduce((sum, row) => sum + row.score * row.weight, 0) / totalWeight,
  );

  const band = BANDS.find((entry) => overall >= entry.min) ?? BANDS[BANDS.length - 1];

  // Everything below 70 needs work; show the weakest first.
  const actions = checks
    .filter((check) => check.score < 70)
    .sort((a, b) => a.score - b.score || b.weight - a.weight)
    .map((check) => ({ id: check.id, label: check.label, score: check.score, tip: check.tip }));

  const strengths = checks
    .filter((check) => check.score >= 85)
    .map((check) => check.label);

  // Sanity check on the numbers rather than the habits.
  const committed = monthlyExpenses + monthlyEmi + monthlySavings;
  const cashFlowGap = round1(monthlyNetIncome - committed);

  return {
    overall,
    band: band.label,
    bandSummary: band.summary,
    pillars,
    checks,
    actions,
    strengths,
    metrics: {
      savingsRatePct: round1(savingsRatePct),
      emergencyMonths: round1(emergencyMonths),
      foirPct: round1(foirPct),
      termMultiple: round1(termMultiple),
      annualIncome: Math.round(annualIncome),
    },
    cashFlowGap,
    cashFlowWarning:
      cashFlowGap < 0
        ? `Expenses, EMIs and savings together come to ${Math.round(committed)} against income of ${Math.round(monthlyNetIncome)} — that is ${Math.round(Math.abs(cashFlowGap))} more than you take home, so one of the figures needs checking.`
        : null,
  };
}
