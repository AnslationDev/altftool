/**
 * Section 44AA and Rule 6F — who must keep books of account.
 *
 * Statutory basis
 *  - s.44AA(1): a person carrying on a SPECIFIED PROFESSION must keep such books as enable the
 *    Assessing Officer to compute total income. Rule 6F(1) turns that into a prescribed list once
 *    gross receipts exceed Rs 1,50,000 in ALL THREE years immediately preceding the previous year
 *    (or, for a newly set up profession, when receipts are likely to exceed that figure in the
 *    first year).
 *  - s.44AA(2)(i) and (ii): for any business or non-specified profession, books are required if
 *    income exceeds Rs 1,20,000 or turnover exceeds Rs 10,00,000 in ANY ONE of the three preceding
 *    years. The proviso inserted by the Finance Act 2017 raises those figures to Rs 2,50,000 and
 *    Rs 25,00,000 for an individual or a Hindu Undivided Family.
 *  - s.44AA(2)(iv): where profits are deemed under s.44AD, 44ADA or 44AE and the assessee claims a
 *    LOWER income, books are required if total income exceeds the basic exemption limit.
 *  - Rule 6F(5): books and documents must be kept for six years from the end of the relevant
 *    assessment year.
 *  - s.271A: penalty of Rs 25,000 for failing to keep or retain the required books.
 */

/** Rule 6F(1) — receipts threshold for the prescribed list, in each of the three preceding years. */
export const SPECIFIED_PROFESSION_RECEIPTS_LIMIT = 150000;

/** s.44AA(2) thresholds. `individualHuf` reflects the Finance Act 2017 proviso. */
export const BUSINESS_THRESHOLDS = {
  individualHuf: { income: 250000, turnover: 2500000 },
  other: { income: 120000, turnover: 1000000 },
};

/** Rule 6F(5) — retention period, counted from the end of the relevant assessment year. */
export const RETENTION_YEARS = 6;

/** s.271A — penalty for not keeping or not retaining books. */
export const PENALTY_271A = 25000;

/** Basic exemption limit used for the s.44AA(2)(iv) test, new regime FY 2025-26. */
export const DEFAULT_EXEMPTION_LIMIT = 400000;

/** Professions listed in s.44AA(1) and the notifications under it. */
export const SPECIFIED_PROFESSIONS = [
  "Legal",
  "Medical",
  "Engineering",
  "Architectural",
  "Accountancy",
  "Technical consultancy",
  "Interior decoration",
  "Authorised representative",
  "Film artist",
  "Company secretary",
  "Information technology",
];

/** The list prescribed by Rule 6F(2). */
export const RULE_6F_BOOKS = [
  "Cash book showing day-to-day receipts and payments with month-end balances",
  "Journal, where the accounts are kept on the mercantile system",
  "Ledger",
  "Carbon copies of bills and receipts issued for any sum exceeding Rs 25",
  "Original bills and receipts for every expense, with signed payment vouchers where no bill exists",
];

/** Rule 6F(3) — extra records for a person carrying on the medical profession. */
export const MEDICAL_EXTRA_BOOKS = [
  "Daily case register in Form 3C, showing patients, fees received, and date and nature of service",
  "Inventory of drugs, medicines and consumables held at the start and end of the year",
];

/** Bills over this amount need a carbon copy under Rule 6F(2)(iv). */
export const RULE_6F_BILL_COPY_LIMIT = 25;

function isNum(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function validSeries(series) {
  return (
    Array.isArray(series) &&
    series.length === 3 &&
    series.every((value) => isNum(value) && value >= 0)
  );
}

/**
 * Decide what books, if any, the law requires.
 *
 * @param {object} input
 * @param {"specifiedProfession"|"businessOrOtherProfession"} input.activityType
 * @param {"individualHuf"|"other"} input.entityType
 * @param {boolean} input.isNew                Set up during the current year.
 * @param {number[]} input.receiptsHistory     Gross receipts for the 3 preceding years.
 * @param {number[]} input.incomeHistory       Business/professional income for the 3 preceding years.
 * @param {number} input.expectedReceipts      Likely receipts this year, when newly set up.
 * @param {number} input.expectedIncome        Likely income this year, when newly set up.
 * @param {boolean} input.claimsLowerThanPresumptive s.44AA(2)(iv) trigger.
 * @param {number} input.totalIncome           Total income, for the s.44AA(2)(iv) test.
 * @param {number} input.exemptionLimit        Basic exemption limit to compare against.
 */
export function checkBooksRequirement({
  activityType = "businessOrOtherProfession",
  entityType = "individualHuf",
  isNew = false,
  receiptsHistory = [0, 0, 0],
  incomeHistory = [0, 0, 0],
  expectedReceipts = 0,
  expectedIncome = 0,
  claimsLowerThanPresumptive = false,
  totalIncome = 0,
  exemptionLimit = DEFAULT_EXEMPTION_LIMIT,
}) {
  if (activityType !== "specifiedProfession" && activityType !== "businessOrOtherProfession") {
    return { error: "Choose whether this is a specified profession or a business." };
  }
  if (entityType !== "individualHuf" && entityType !== "other") {
    return { error: "Choose whether the assessee is an individual or HUF, or another entity." };
  }
  if (isNew) {
    if (!isNum(expectedReceipts) || expectedReceipts < 0 || !isNum(expectedIncome) || expectedIncome < 0) {
      return { error: "Expected receipts and expected income must be zero or more." };
    }
  } else if (!validSeries(receiptsHistory) || !validSeries(incomeHistory)) {
    return { error: "Enter three years of receipts and income, each zero or more." };
  }
  if (!isNum(totalIncome) || totalIncome < 0) {
    return { error: "Total income must be zero or more." };
  }
  if (!isNum(exemptionLimit) || exemptionLimit <= 0) {
    return { error: "The basic exemption limit must be greater than zero." };
  }

  const thresholds = BUSINESS_THRESHOLDS[entityType];
  const reasons = [];

  // Figures the tests actually look at.
  const minReceipts = isNew ? expectedReceipts : Math.min(...receiptsHistory);
  const maxReceipts = isNew ? expectedReceipts : Math.max(...receiptsHistory);
  const maxIncome = isNew ? expectedIncome : Math.max(...incomeHistory);

  let requirement;

  if (activityType === "specifiedProfession") {
    // Rule 6F needs the threshold crossed in EVERY one of the three preceding years.
    const rule6FApplies = minReceipts > SPECIFIED_PROFESSION_RECEIPTS_LIMIT;
    requirement = rule6FApplies ? "rule6F" : "general";
    reasons.push(
      isNew
        ? `A newly set up specified profession expecting ${Math.round(expectedReceipts)} in receipts is ${rule6FApplies ? "above" : "within"} the Rule 6F threshold of ${SPECIFIED_PROFESSION_RECEIPTS_LIMIT}.`
        : `Your lowest year of the three preceding years is ${Math.round(minReceipts)} against the Rule 6F threshold of ${SPECIFIED_PROFESSION_RECEIPTS_LIMIT}, and the threshold must be crossed in all three years.`,
    );
    if (!rule6FApplies) {
      reasons.push(
        "Section 44AA(1) still requires enough records for the Assessing Officer to compute your income, even below the Rule 6F threshold.",
      );
    }
  } else {
    const incomeTriggered = maxIncome > thresholds.income;
    const turnoverTriggered = maxReceipts > thresholds.turnover;
    requirement = incomeTriggered || turnoverTriggered ? "general" : "none";

    reasons.push(
      `Highest income in the relevant years is ${Math.round(maxIncome)} against the section 44AA(2) limit of ${thresholds.income}.`,
    );
    reasons.push(
      `Highest turnover in the relevant years is ${Math.round(maxReceipts)} against the limit of ${thresholds.turnover}.`,
    );
    if (requirement === "general") {
      reasons.push(
        "Either test is enough on its own, and it applies if the limit was crossed in any one of the three preceding years.",
      );
    }
  }

  // s.44AA(2)(iv) can pull an otherwise exempt assessee back into the net.
  const presumptiveTrigger = claimsLowerThanPresumptive && totalIncome > exemptionLimit;
  if (presumptiveTrigger && requirement === "none") {
    requirement = "general";
  }
  if (claimsLowerThanPresumptive) {
    reasons.push(
      presumptiveTrigger
        ? `Section 44AA(2)(iv) applies: you are declaring less than the deemed profit and your total income of ${Math.round(totalIncome)} is above the exemption limit of ${Math.round(exemptionLimit)}, so books are compulsory and a section 44AB audit follows.`
        : `You are declaring less than the deemed profit, but total income of ${Math.round(totalIncome)} stays within the exemption limit of ${Math.round(exemptionLimit)}, so section 44AA(2)(iv) is not triggered.`,
    );
  }

  const headline =
    requirement === "rule6F"
      ? "Yes — you must keep the books prescribed by Rule 6F"
      : requirement === "general"
        ? "Yes — you must keep books, but no prescribed list applies"
        : "No — the section 44AA thresholds are not crossed";

  const books =
    requirement === "rule6F"
      ? RULE_6F_BOOKS
      : requirement === "general"
        ? [
            "Records of every receipt and payment, such as bank statements and a cash summary",
            "Sales and purchase registers or their equivalent invoices",
            "Supporting bills, vouchers and contracts for income and expenditure claimed",
            "A statement of assets and liabilities used in the business at the year end",
          ]
        : [
            "No prescribed books, but keep bank statements, invoices and expense proofs so the return can be substantiated if questioned",
          ];

  return {
    requirement,
    headline,
    required: requirement !== "none",
    reasons,
    books,
    thresholds:
      activityType === "specifiedProfession"
        ? { receipts: SPECIFIED_PROFESSION_RECEIPTS_LIMIT }
        : thresholds,
    measured: { minReceipts, maxReceipts, maxIncome },
    isSpecifiedProfession: activityType === "specifiedProfession",
    presumptiveTrigger,
    retentionYears: RETENTION_YEARS,
    penalty: PENALTY_271A,
  };
}
