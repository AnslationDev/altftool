/**
 * Form 15G / 15H eligibility logic — Income-tax Act, 1961.
 *
 * Statutory basis
 *  - s.197A(1) and 197A(1A) : Form 15G. Available to a resident person who is NOT a company
 *    and NOT a firm, and who is below 60 years of age. TWO conditions must both hold:
 *      (a) tax on the estimated total income of the year is nil, and
 *      (b) the aggregate of interest (and other 197A payments) credited or paid during the
 *          year does not exceed the maximum amount not chargeable to tax.
 *  - s.197A(1C) : Form 15H. Available only to a RESIDENT INDIVIDUAL who is 60 years or more
 *    at any time during the financial year. ONE condition: tax on the estimated total income
 *    of the year is nil. The interest ceiling in (b) above does NOT apply to Form 15H.
 *  - s.206AA : a declaration is invalid without a PAN; TDS is then deducted at 20%.
 *  - s.194A : TDS on interest from banks, co-operative banks and the post office.
 */

/** Financial year the rates below belong to. */
export const FY_LABEL = "FY 2025-26 (AY 2026-27)";

/** s.197A(1C) — "sixty years or more" at any time during the financial year. */
export const SENIOR_AGE = 60;
/** Old-regime higher basic exemption slab for very senior citizens. */
export const SUPER_SENIOR_AGE = 80;

/**
 * Old-regime slabs, FY 2025-26. Each entry is [upper limit of the slab, marginal rate].
 * Source: Part I of the First Schedule to the Finance Act (unchanged since FY 2014-15).
 */
export const OLD_REGIME_SLABS = {
  below60: [
    [250000, 0],
    [500000, 0.05],
    [1000000, 0.2],
    [Infinity, 0.3],
  ],
  senior: [
    [300000, 0],
    [500000, 0.05],
    [1000000, 0.2],
    [Infinity, 0.3],
  ],
  superSenior: [
    [500000, 0],
    [1000000, 0.2],
    [Infinity, 0.3],
  ],
};

/**
 * Default (new) regime slabs under s.115BAC(1A) for FY 2025-26, as substituted by the
 * Finance Act 2025. Age makes no difference under this regime.
 */
export const NEW_REGIME_SLABS = [
  [400000, 0],
  [800000, 0.05],
  [1200000, 0.1],
  [1600000, 0.15],
  [2000000, 0.2],
  [2400000, 0.25],
  [Infinity, 0.3],
];

/**
 * s.87A rebate. Old regime: total income up to Rs 5,00,000, rebate capped at Rs 12,500.
 * New regime FY 2025-26: total income up to Rs 12,00,000, rebate capped at Rs 60,000,
 * with marginal relief above that so tax never exceeds the income over Rs 12,00,000.
 */
export const REBATE_87A = {
  old: { incomeLimit: 500000, maxRebate: 12500 },
  new: { incomeLimit: 1200000, maxRebate: 60000 },
};

/** Health and education cess on income tax. */
export const CESS_RATE = 0.04;

/**
 * s.194A thresholds for interest paid by a bank, co-operative bank or the post office,
 * as raised by the Finance Act 2025 with effect from 1 April 2025.
 */
export const TDS_194A_THRESHOLD = { senior: 100000, general: 50000 };
/** s.194A rate where a valid PAN is on record. */
export const TDS_194A_RATE = 0.1;
/** s.206AA rate where no PAN is furnished. */
export const TDS_NO_PAN_RATE = 0.2;

/** Entities that s.197A(1) shuts out of Form 15G ("not being a company or a firm"). */
export const ENTITY_TYPES = [
  { value: "individual", label: "Individual" },
  { value: "huf", label: "Hindu Undivided Family (HUF)" },
  { value: "trust", label: "Trust / AOP / BOI" },
  { value: "firm", label: "Partnership firm or LLP" },
  { value: "company", label: "Company" },
];

const BLOCKED_ENTITIES = new Set(["firm", "company"]);

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

/** Marginal tax from an ordered slab table. Returns 0 for zero or negative income. */
export function taxFromSlabs(income, slabs) {
  if (!isFiniteNumber(income) || income <= 0) return 0;
  let tax = 0;
  let lower = 0;
  for (const [upper, rate] of slabs) {
    if (income > lower) {
      const taxable = Math.min(income, upper) - lower;
      tax += taxable * rate;
    }
    if (income <= upper) break;
    lower = upper;
  }
  return tax;
}

/** The "maximum amount which is not chargeable to income-tax" for this person. */
export function basicExemptionLimit({ regime, age }) {
  if (regime === "new") return NEW_REGIME_SLABS[0][0];
  if (age >= SUPER_SENIOR_AGE) return OLD_REGIME_SLABS.superSenior[0][0];
  if (age >= SENIOR_AGE) return OLD_REGIME_SLABS.senior[0][0];
  return OLD_REGIME_SLABS.below60[0][0];
}

function slabsFor({ regime, age }) {
  if (regime === "new") return NEW_REGIME_SLABS;
  if (age >= SUPER_SENIOR_AGE) return OLD_REGIME_SLABS.superSenior;
  if (age >= SENIOR_AGE) return OLD_REGIME_SLABS.senior;
  return OLD_REGIME_SLABS.below60;
}

/**
 * Income tax on an estimated total income, after the s.87A rebate and 4% cess.
 * Returns { error } rather than a bad number for invalid input.
 */
export function computeTax({ totalIncome, regime = "new", age = 35 }) {
  if (!isFiniteNumber(totalIncome) || totalIncome < 0) {
    return { error: "Estimated total income must be zero or more." };
  }
  if (!isFiniteNumber(age) || age < 0 || age > 120) {
    return { error: "Enter an age between 0 and 120." };
  }
  if (regime !== "new" && regime !== "old") {
    return { error: "Choose either the new (default) regime or the old regime." };
  }

  const slabs = slabsFor({ regime, age });
  const taxBeforeRebate = taxFromSlabs(totalIncome, slabs);
  const rule = REBATE_87A[regime];

  let rebate = 0;
  let marginalRelief = 0;
  if (totalIncome <= rule.incomeLimit) {
    rebate = Math.min(taxBeforeRebate, rule.maxRebate);
  } else if (regime === "new") {
    // Proviso to s.87A: tax payable cannot exceed the income above Rs 12,00,000.
    const excessOverLimit = totalIncome - rule.incomeLimit;
    marginalRelief = Math.max(0, taxBeforeRebate - excessOverLimit);
  }

  const taxAfterRebate = Math.max(0, taxBeforeRebate - rebate - marginalRelief);
  const cess = taxAfterRebate * CESS_RATE;

  return {
    taxBeforeRebate,
    rebate,
    marginalRelief,
    taxAfterRebate,
    cess,
    totalTax: taxAfterRebate + cess,
    isNil: taxAfterRebate <= 0,
    slabsUsed: regime === "new" ? "new" : "old",
  };
}

/**
 * Full Form 15G / 15H eligibility verdict.
 *
 * @param {object} input
 * @param {number} input.age                  Age completed at any time during the financial year.
 * @param {boolean} input.isResident          Resident in India for the year.
 * @param {string} input.entityType           One of ENTITY_TYPES values.
 * @param {string} input.regime               "new" or "old".
 * @param {number} input.estimatedTotalIncome Estimated total income for the whole year.
 * @param {number} input.interestIncome       Aggregate interest expected from this payer group.
 * @param {boolean} input.hasPan              PAN furnished to the payer.
 */
export function checkForm15GH({
  age,
  isResident = true,
  entityType = "individual",
  regime = "new",
  estimatedTotalIncome,
  interestIncome,
  hasPan = true,
}) {
  if (!isFiniteNumber(age) || age < 0 || age > 120) {
    return { error: "Enter an age between 0 and 120 years." };
  }
  if (!isFiniteNumber(estimatedTotalIncome) || estimatedTotalIncome < 0) {
    return { error: "Estimated total income must be zero or more." };
  }
  if (!isFiniteNumber(interestIncome) || interestIncome < 0) {
    return { error: "Interest income must be zero or more." };
  }
  if (interestIncome > estimatedTotalIncome) {
    return {
      error:
        "Interest income cannot exceed your estimated total income — total income includes the interest.",
    };
  }
  if (regime !== "new" && regime !== "old") {
    return { error: "Choose either the new (default) regime or the old regime." };
  }

  const tax = computeTax({ totalIncome: estimatedTotalIncome, regime, age });
  if (tax.error) return { error: tax.error };

  const isSenior = age >= SENIOR_AGE;
  const exemptionLimit = basicExemptionLimit({ regime, age });
  const tdsThreshold = isSenior ? TDS_194A_THRESHOLD.senior : TDS_194A_THRESHOLD.general;
  const tdsRate = hasPan ? TDS_194A_RATE : TDS_NO_PAN_RATE;
  const tdsApplies = interestIncome > tdsThreshold;
  const tdsAtStake = tdsApplies ? interestIncome * tdsRate : 0;

  const blockers = [];
  if (!isResident) {
    blockers.push(
      "Form 15G and Form 15H are only for residents. A non-resident must use Form 13 / a lower-deduction certificate instead.",
    );
  }
  if (BLOCKED_ENTITIES.has(entityType)) {
    blockers.push(
      "Section 197A(1) excludes companies and firms, so neither declaration can be filed by this entity.",
    );
  }
  if (isSenior && entityType !== "individual") {
    blockers.push("Form 15H is only for individuals; an HUF or trust cannot use it.");
  }
  if (!hasPan) {
    blockers.push(
      "Section 206AA makes a declaration invalid without a PAN, and TDS is then deducted at 20%.",
    );
  }

  const form = isSenior ? "15H" : "15G";
  const conditions = [];

  conditions.push({
    label: "Tax on estimated total income for the year is nil",
    detail: `Tax after the section 87A rebate works out to ${Math.round(tax.taxAfterRebate)}.`,
    passed: tax.isNil,
  });

  if (form === "15G") {
    conditions.push({
      label: "Aggregate interest does not exceed the basic exemption limit",
      detail: `Interest of ${Math.round(interestIncome)} against a limit of ${exemptionLimit}.`,
      passed: interestIncome <= exemptionLimit,
    });
  } else {
    conditions.push({
      label: "No interest ceiling applies",
      detail:
        "Section 197A(1C) imposes only the nil-tax test, so interest above the exemption limit is fine.",
      passed: true,
    });
  }

  const conditionsMet = conditions.every((condition) => condition.passed);
  const eligible = blockers.length === 0 && conditionsMet;

  let verdict;
  if (eligible && !tdsApplies) {
    verdict = `Eligible for Form ${form}, but your bank interest is below the section 194A threshold, so no TDS is due anyway.`;
  } else if (eligible) {
    verdict = `You can submit Form ${form} to stop TDS on this interest.`;
  } else if (blockers.length > 0) {
    verdict = `You cannot submit Form ${form} this year.`;
  } else {
    verdict = `You do not meet the Form ${form} conditions — the bank must deduct TDS.`;
  }

  return {
    form,
    eligible,
    verdict,
    blockers,
    conditions,
    isSenior,
    exemptionLimit,
    tdsThreshold,
    tdsRate,
    tdsRatePercent: tdsRate * 100,
    tdsApplies,
    tdsAtStake,
    tax,
    interestIncome,
    estimatedTotalIncome,
    financialYear: FY_LABEL,
  };
}
