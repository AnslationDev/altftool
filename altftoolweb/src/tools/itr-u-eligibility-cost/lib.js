/**
 * ITR-U Eligibility Gate & Cost Calculator — pure logic.
 *
 * Statutory sources, all Income-tax Act, 1961 (India). Text read on 29 July 2026.
 *
 *  - s.139(8A)  Updated return. Inserted by the Finance Act 2022 (w.e.f. 1 April 2022);
 *               window raised from 24 months to 48 months from the end of the relevant
 *               assessment year by the Finance Act 2025 (w.e.f. 1 April 2025).
 *  - s.140B     Tax on updated return, including the additional income-tax slabs.
 *  - s.234A     Interest for default in furnishing the return — 1% per month or part month.
 *  - s.234B     Interest for default in payment of advance tax — 1% per month or part month.
 *  - s.234C     Interest for deferment of advance tax instalments.
 *  - s.234F     Fee for default in furnishing the return.
 *  - Rule 119A, Income-tax Rules 1962 — the amount on which interest is computed is
 *               rounded down to the nearest multiple of one hundred rupees.
 *
 * Nothing here recommends a course of action. It reports what the sections produce.
 */

import {
  ITR_U_FIRST_ASSESSMENT_YEAR,
  TAXPAYER_CATEGORIES,
  addMonths,
  daysBetween,
  getReturnDeadlines,
  isoDate,
  listAssessmentYears,
  parseAssessmentYear,
  toTimestamp,
} from "../itr-deadline-tracker/lib.js";

import {
  INTEREST_234A_MONTHLY_RATE,
  LATE_FEE_REDUCED,
  LATE_FEE_STANDARD,
  REDUCED_FEE_INCOME_CEILING,
  monthsOrPartMonths,
  parseIsoDate,
} from "../section-234f-late-fee-calculator/lib.js";

export {
  ITR_U_FIRST_ASSESSMENT_YEAR,
  TAXPAYER_CATEGORIES,
  listAssessmentYears,
  parseAssessmentYear,
};

/* ------------------------------------------------------------------ *
 * Statutory constants
 * ------------------------------------------------------------------ */

/**
 * Section 139(8A) as enacted by the Finance Act 2022: an updated return may be
 * furnished "at any time within twenty-four months from the end of the relevant
 * assessment year".
 */
export const WINDOW_MONTHS_PRE_FA2025 = 24;

/**
 * The Finance Act 2025 substituted "forty-eight months" for "twenty-four months"
 * in section 139(8A), with effect from 1 April 2025.
 */
export const WINDOW_MONTHS_FA2025 = 48;
export const FA_2025_EFFECTIVE_DATE = "2025-04-01";

/** Section 234B(1) — simple interest at one per cent for every month or part of a month. */
export const INTEREST_234B_MONTHLY_RATE = 0.01;

/**
 * Section 140B(3) — additional income-tax on the aggregate of tax and interest
 * payable, graded by how long after the END of the relevant assessment year the
 * updated return is furnished.
 *
 * Clauses (a) and (b) came in with the Finance Act 2022. Clauses (c) and (d) were
 * inserted by the Finance Act 2025 alongside the 48-month window, so they can only
 * ever apply to an assessment year that the extended window reaches.
 */
export const ADDITIONAL_TAX_TIERS = [
  { percent: 25, fromMonth: 0, toMonth: 12, clause: "140B(3)(a)", introducedBy: "Finance Act 2022" },
  { percent: 50, fromMonth: 12, toMonth: 24, clause: "140B(3)(b)", introducedBy: "Finance Act 2022" },
  { percent: 60, fromMonth: 24, toMonth: 36, clause: "140B(3)(c)", introducedBy: "Finance Act 2025" },
  { percent: 70, fromMonth: 36, toMonth: 48, clause: "140B(3)(d)", introducedBy: "Finance Act 2025" },
];

/**
 * Every statutory bar in section 139(8A). If any one of these is true the updated
 * return cannot be furnished at all, whatever the arithmetic would have said.
 * `id` order is the order of the provisos in the section.
 */
export const ELIGIBILITY_BARS = [
  {
    id: "returnOfLoss",
    label: "The updated return would be a return of a loss",
    section: "First proviso (a) to s.139(8A)",
    detail:
      "Section 139(8A) does not apply where the updated return is a return of a loss. A loss year can only be carried into an updated return that itself returns income.",
  },
  {
    id: "reducesTaxLiability",
    label:
      "It would reduce the total tax liability already determined on a return filed under s.139(1), 139(4) or 139(5)",
    section: "First proviso (b) to s.139(8A)",
    detail:
      "An updated return is a one-way street: it may only increase the tax already determined on the last valid return.",
  },
  {
    id: "createsOrIncreasesRefund",
    label: "It would create a refund, or increase a refund already due",
    section: "First proviso (c) to s.139(8A)",
    detail:
      "Section 139(8A) does not apply where the updated return results in a refund or increases the refund due on the earlier return.",
  },
  {
    id: "searchOrRequisition",
    label: "A search under s.132 was initiated, or books or assets were requisitioned under s.132A",
    section: "Second proviso (a) to s.139(8A)",
    detail:
      "The bar covers the assessment year relevant to the previous year in which the search or requisition happened, and every assessment year before it.",
  },
  {
    id: "surveyConducted",
    label: "A survey under s.133A (other than s.133A(2A)) was conducted",
    section: "Second proviso (b) to s.139(8A)",
    detail:
      "Same reach as a search: the survey year and every assessment year preceding it. A s.133A(2A) TDS survey is carved out.",
  },
  {
    id: "seizedMaterialNotice",
    label:
      "A notice says money, bullion, jewellery, valuables, books or documents seized from another person belong or pertain to you",
    section: "Second proviso (c) and (d) to s.139(8A)",
    detail:
      "Third-party search material attributed to you bars the updated return for that year and all earlier years.",
  },
  {
    id: "alreadyFiledItrU",
    label: "An updated return has already been furnished for this assessment year",
    section: "Third proviso (a) to s.139(8A)",
    detail: "Only one updated return is permitted per assessment year.",
  },
  {
    id: "proceedingPendingOrCompleted",
    label:
      "An assessment, reassessment, recomputation or revision proceeding for this year is pending or has been completed",
    section: "Third proviso (b) to s.139(8A)",
    detail: "Pending and completed proceedings both bar the updated return.",
  },
  {
    id: "specialActInformation",
    label:
      "The Assessing Officer has communicated information held under the Benami, PMLA, Black Money or SAFEMA laws",
    section: "Third proviso (c) to s.139(8A)",
    detail:
      "The bar bites only where the information was communicated to you before the date the updated return would be furnished.",
  },
  {
    id: "treatyInformation",
    label: "Information for this year received under a s.90 or s.90A treaty has been communicated to you",
    section: "Third proviso (d) to s.139(8A)",
    detail:
      "Again, the communication must have reached you before the updated return would be furnished.",
  },
  {
    id: "prosecutionInitiated",
    label: "Prosecution proceedings under Chapter XXII have been initiated for this year",
    section: "Third proviso (e) to s.139(8A)",
    detail: "Chapter XXII covers offences and prosecutions under the Income-tax Act.",
  },
  {
    id: "notice148AAfter36Months",
    label:
      "A show-cause notice under s.148A(1) was issued after 36 months from the end of the assessment year",
    section: "Proviso to s.139(8A) inserted by the Finance Act 2025",
    detail:
      "Where an order under s.148A(3) later holds it is not a fit case to issue a s.148 notice, the section restores the updated return right up to 48 months.",
  },
];

/**
 * Section 139(8A) second proviso (the carry-forward rule): where the updated return
 * reduces a carried-forward loss, unabsorbed depreciation or a s.115JAA / s.115JD tax
 * credit for a later year, an updated return must also be furnished for each such later
 * year. Reported as a condition, not a bar.
 */
export const CARRY_FORWARD_CONDITION =
  "If the updated return reduces a carried-forward loss, unabsorbed depreciation or a tax credit under s.115JAA or s.115JD for any later year, s.139(8A) requires an updated return for each of those later years too.";

/** Section 140B(1) and (2) — the two ways an updated return can arise. */
export const FILING_STATUS_OPTIONS = [
  {
    id: "no-return",
    label: "No return was filed for this year at all",
    section: "s.140B(1)",
    hint: "Tax due, s.234A interest and the s.234F fee are all charged fresh.",
  },
  {
    id: "return-filed",
    label: "A return under s.139(1), 139(4) or 139(5) was already filed",
    section: "s.140B(2)",
    hint: "Only the tax on the additional income is charged. The s.234F fee and s.234A interest were settled with that earlier return.",
  },
];

/** Sanity ceiling: one lakh crore rupees. Anything above this is a typing mistake. */
export const MAX_RUPEE_INPUT = 1e13;

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

/** Rule 119A, Income-tax Rules 1962 — ignore any fraction of one hundred rupees. */
export function roundDownToHundred(amount) {
  return Math.floor(amount / 100) * 100;
}

function readRupees(value, fieldLabel, { allowZero = true } = {}) {
  if (value === "" || value === null || value === undefined) {
    return { error: `Enter ${fieldLabel}.` };
  }
  const amount = Number(value);
  if (!Number.isFinite(amount)) return { error: `Enter ${fieldLabel} as a number.` };
  if (amount < 0) return { error: `${fieldLabel} cannot be negative.` };
  if (!allowZero && amount === 0) return { error: `${fieldLabel} must be more than zero.` };
  if (amount > MAX_RUPEE_INPUT) {
    return { error: `${fieldLabel} looks impossible — keep it under one lakh crore rupees.` };
  }
  return { amount };
}

/** End of the relevant assessment year: the clock in s.139(8A) and s.140B starts here. */
export function endOfAssessmentYear(startYear) {
  return isoDate(startYear + 1, 3, 31);
}

/**
 * Which form of s.139(8A) governs this assessment year.
 *
 * The Finance Act 2025 substitution took effect on 1 April 2025. It can only reach an
 * assessment year whose 48-month period was still running on that date; where the
 * 48 months had already elapsed, the pre-amendment 24-month text is the operative rule
 * and the year is long shut.
 */
export function resolveWindowRegime(startYear) {
  const ayEnd = endOfAssessmentYear(startYear);
  const deadline24 = addMonths(ayEnd, WINDOW_MONTHS_PRE_FA2025);
  const deadline48 = addMonths(ayEnd, WINDOW_MONTHS_FA2025);
  const extended = daysBetween(FA_2025_EFFECTIVE_DATE, deadline48) >= 0;

  return extended
    ? {
        extended: true,
        windowMonths: WINDOW_MONTHS_FA2025,
        deadline: deadline48,
        label: "Finance Act 2025 form — 48 months",
        statute:
          "The Finance Act 2025 substituted forty-eight months for twenty-four months in s.139(8A) with effect from 1 April 2025, and the 48-month period for this year was still running on that date.",
      }
    : {
        extended: false,
        windowMonths: WINDOW_MONTHS_PRE_FA2025,
        deadline: deadline24,
        label: "Pre-Finance-Act-2025 form — 24 months",
        statute: `The 48-month period for this year ended on ${deadline48}, before the Finance Act 2025 amendment took effect on 1 April 2025, so s.139(8A) as enacted by the Finance Act 2022 governs: twenty-four months from the end of the assessment year.`,
      };
}

/** Section 140B(3) tier windows for one assessment year under one regime. */
export function buildTierWindows(startYear, windowMonths) {
  const ayEnd = endOfAssessmentYear(startYear);
  return ADDITIONAL_TAX_TIERS.filter((tier) => tier.toMonth <= windowMonths).map((tier) => ({
    percent: tier.percent,
    clause: tier.clause,
    introducedBy: tier.introducedBy,
    opensAfter: addMonths(ayEnd, tier.fromMonth),
    closesOn: addMonths(ayEnd, tier.toMonth),
    label: `Furnished within ${tier.toMonth} months of the end of the assessment year`,
  }));
}

/* ------------------------------------------------------------------ *
 * Main computation
 * ------------------------------------------------------------------ */

/**
 * Run the s.139(8A) eligibility gate, then price the return under s.140B.
 *
 * @param {object} input
 * @param {string|number} input.assessmentYear  e.g. "2023-24".
 * @param {string} input.category               a TAXPAYER_CATEGORIES id, for the s.139(1) due date.
 * @param {string} input.filingDate             ISO date the updated return would be furnished.
 * @param {string} input.filingStatus           "no-return" (s.140B(1)) or "return-filed" (s.140B(2)).
 * @param {number} input.taxDue                 Tax on the income being disclosed, net of TDS, TCS,
 *                                              advance tax, relief and credits. Includes surcharge
 *                                              and cess (Explanation to s.140B(3)).
 * @param {number} input.totalIncome            Total income of the updated return, for the s.234F slab.
 * @param {number} [input.interest234C]         Section 234C interest from the instalment schedule.
 * @param {object} [input.bars]                 { [barId]: boolean } answers to the s.139(8A) gate.
 * @returns {object} result, or { error } where the input cannot produce a meaningful answer.
 */
export function computeItrU({
  assessmentYear,
  category = "non-audit",
  filingDate,
  filingStatus = "no-return",
  taxDue,
  totalIncome,
  interest234C = 0,
  bars = {},
} = {}) {
  const parsed = parseAssessmentYear(assessmentYear);
  if (parsed.error) return { error: parsed.error };

  if (!Number.isFinite(toTimestamp(filingDate))) {
    return { error: "Enter the date you would file the updated return, in YYYY-MM-DD form." };
  }
  if (!FILING_STATUS_OPTIONS.some((option) => option.id === filingStatus)) {
    return { error: "Say whether a return was already filed for this year." };
  }

  const tax = readRupees(taxDue, "the tax due on the income being disclosed");
  if (tax.error) return { error: tax.error };
  const income = readRupees(totalIncome, "the total income of the updated return");
  if (income.error) return { error: income.error };
  const c234 = readRupees(interest234C, "the section 234C interest");
  if (c234.error) return { error: c234.error };

  const deadlines = getReturnDeadlines({
    assessmentYear: parsed.assessmentYear,
    category,
    asOfDate: filingDate,
  });
  if (deadlines.error) return { error: deadlines.error };

  const { startYear } = parsed;
  const ayEnd = endOfAssessmentYear(startYear);
  const regime = resolveWindowRegime(startYear);
  const tiers = buildTierWindows(startYear, regime.windowMonths);

  const appliedBars = ELIGIBILITY_BARS.filter((bar) => bars[bar.id] === true);

  const base = {
    assessmentYear: parsed.assessmentYear,
    financialYear: parsed.financialYear,
    assessmentYearEnd: ayEnd,
    category,
    filingDate,
    filingStatus,
    dueDate139_1: deadlines.originalDueDate,
    dueDateBasis: deadlines.originalDueBasis,
    belatedDeadline: deadlines.belatedDeadline,
    regime,
    tiers,
    deadline: regime.deadline,
    daysLeft: daysBetween(filingDate, regime.deadline),
    appliedBars,
    carryForwardCondition: CARRY_FORWARD_CONDITION,
    cost: null,
    tier: null,
  };

  /* ---- Gate 1: is this assessment year inside s.139(8A) at all? ---- */
  if (startYear < ITR_U_FIRST_ASSESSMENT_YEAR) {
    return {
      ...base,
      eligible: false,
      status: "outside-section",
      barHeadline: `No updated return is possible for AY ${parsed.assessmentYear}.`,
      barDetail: `Section 139(8A) was inserted by the Finance Act 2022 with effect from 1 April 2022. On that date the earliest assessment year whose window had not already run out was AY ${ITR_U_FIRST_ASSESSMENT_YEAR}-${String(ITR_U_FIRST_ASSESSMENT_YEAR + 1).slice(2)}, so no earlier year can be updated.`,
      barSection: "s.139(8A), Finance Act 2022",
    };
  }

  /* ---- Gate 2: the statutory bars in the provisos ---- */
  if (appliedBars.length > 0) {
    const first = appliedBars[0];
    return {
      ...base,
      eligible: false,
      status: "barred-by-proviso",
      barHeadline: `You cannot file ITR-U for AY ${parsed.assessmentYear}.`,
      barDetail: `${first.label}. ${first.detail}`,
      barSection: first.section,
    };
  }

  /* ---- Gate 3: has the s.139(4)/139(5) window shut yet? ---- */
  // s.140B(3)(a) prices an updated return furnished "after expiry of the time available
  // under sub-section (4) or sub-section (5) of section 139", so ITR-U only opens then.
  const belatedStillOpen = daysBetween(filingDate, deadlines.belatedDeadline) >= 0;
  if (belatedStillOpen) {
    const originalStillOpen = daysBetween(filingDate, deadlines.originalDueDate) >= 0;
    return {
      ...base,
      eligible: false,
      status: originalStillOpen ? "original-window-open" : "belated-window-open",
      barHeadline: `ITR-U is not available for AY ${parsed.assessmentYear} on ${filingDate}.`,
      barDetail: originalStillOpen
        ? `The original return window under s.139(1) is still open until ${deadlines.originalDueDate}, and the belated or revised window under s.139(4) and 139(5) runs to ${deadlines.belatedDeadline}. Section 140B(3) prices an updated return only once that time has expired.`
        : `The belated and revised return window under s.139(4) and 139(5) is still open until ${deadlines.belatedDeadline}. Section 140B(3) prices an updated return only once that time has expired.`,
      barSection: "s.140B(3)(a) read with s.139(4) and s.139(5)",
    };
  }

  /* ---- Gate 4: has the s.139(8A) window shut? ---- */
  if (base.daysLeft < 0) {
    return {
      ...base,
      eligible: false,
      status: "window-closed",
      barHeadline: `The ITR-U window for AY ${parsed.assessmentYear} closed on ${regime.deadline}.`,
      barDetail: `${regime.label}. ${regime.statute}`,
      barSection: "s.139(8A)",
    };
  }

  /* ---- Priced: find the s.140B(3) tier ---- */
  const tier = tiers.find((entry) => daysBetween(filingDate, entry.closesOn) >= 0) ?? null;
  if (!tier) {
    return { error: "Could not place this filing date in any section 140B slab." };
  }

  /* ---- Interest and fee ---- */
  const interestBase = roundDownToHundred(tax.amount);
  const noEarlierReturn = filingStatus === "no-return";

  // s.234A(1): 1% per month or part month from the day after the s.139(1) due date to the
  // date the return is furnished. Where a return was already on record, that return
  // stopped the s.234A clock, so nothing further is charged here.
  const months234A = noEarlierReturn
    ? monthsOrPartMonths(parseIsoDate(deadlines.originalDueDate), parseIsoDate(filingDate))
    : 0;
  const interest234A = Math.round(interestBase * INTEREST_234A_MONTHLY_RATE * months234A);

  // s.234B(1) runs from 1 April of the assessment year, i.e. from the close of 31 March of
  // the previous year. s.140B(4) directs that for an updated return the interest is
  // computed on the assessed tax itself, notwithstanding Explanation 1 to s.234B.
  const advanceTaxAnchor = isoDate(startYear, 3, 31);
  const months234B = monthsOrPartMonths(parseIsoDate(advanceTaxAnchor), parseIsoDate(filingDate));
  const interest234B = Math.round(interestBase * INTEREST_234B_MONTHLY_RATE * months234B);

  const interestTotal = interest234A + interest234B + c234.amount;

  // s.234F: the fee is levied on the return that is furnished late. Where a return was
  // already filed for the year, the fee was determined then and is not charged again.
  const lateFee234F = noEarlierReturn
    ? income.amount <= REDUCED_FEE_INCOME_CEILING
      ? LATE_FEE_REDUCED
      : LATE_FEE_STANDARD
    : 0;
  const lateFeeReason = noEarlierReturn
    ? income.amount <= REDUCED_FEE_INCOME_CEILING
      ? `Total income does not exceed ${REDUCED_FEE_INCOME_CEILING}, so the proviso to s.234F(1) caps the fee at ${LATE_FEE_REDUCED}.`
      : `Total income exceeds ${REDUCED_FEE_INCOME_CEILING}, so the full s.234F(1)(a) fee of ${LATE_FEE_STANDARD} applies.`
    : "A return was already furnished for this year, so the s.234F fee was determined with that return and is not levied again.";

  // s.140B(3): the additional income-tax is a percentage of the AGGREGATE OF TAX AND
  // INTEREST payable. The s.234F fee sits outside that aggregate — Part B-ATI of Form
  // ITR-U backs the fee out before applying the percentage.
  const additionalTaxBase = tax.amount + interestTotal;
  const additionalTax = Math.round((additionalTaxBase * tier.percent) / 100);

  const total = tax.amount + interestTotal + additionalTax + lateFee234F;

  return {
    ...base,
    eligible: true,
    status: "eligible",
    tier,
    barHeadline: null,
    barDetail: null,
    barSection: null,
    cost: {
      taxDue: tax.amount,
      totalIncome: income.amount,
      interestBase,
      months234A,
      interest234A,
      months234B,
      interest234B,
      interest234C: c234.amount,
      interestTotal,
      lateFee234F,
      lateFeeReason,
      additionalTaxBase,
      additionalTaxPercent: tier.percent,
      additionalTax,
      total,
    },
  };
}
