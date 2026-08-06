/**
 * TDS on dividend under Section 194 of the Income-tax Act, 1961.
 *
 * Scope: dividend declared, distributed or paid by a domestic company to a
 * RESIDENT shareholder. Dividend paid to a non-resident is governed by
 * Section 195 / 196D instead and is out of scope here.
 *
 * Pure module - no React, no DOM, no clock reads.
 */

/** Section 194: tax is deductible at 10% of the dividend paid to a resident. */
export const TDS_RATE_SECTION_194 = 10;

/**
 * Section 206AA(1): where the deductee fails to furnish a valid PAN, tax is
 * deducted at the higher of the rate in force and 20%.
 */
export const TDS_RATE_NO_PAN_206AA = 20;

/**
 * Proviso to Section 194: no deduction where the dividend is paid to an
 * INDIVIDUAL shareholder by any mode other than cash and the aggregate
 * dividend paid by the company in the financial year is within the limit.
 * The limit was raised from Rs 5,000 to Rs 10,000 by the Finance Act, 2025
 * with effect from 1 April 2025.
 */
export const SECTION_194_THRESHOLD_UPTO_FY_2024_25 = 5000;
export const SECTION_194_THRESHOLD_FROM_FY_2025_26 = 10000;

/**
 * Section 197A(1C): a Form 15H declaration may be filed only by a resident
 * individual who is 60 years of age or more at any time during the year.
 */
export const SENIOR_CITIZEN_AGE = 60;

/** Old-regime basic exemption limits (Finance Act slab entries, unchanged). */
export const OLD_REGIME_EXEMPTION_BELOW_60 = 250000;
export const OLD_REGIME_EXEMPTION_SENIOR = 300000; // 60 to 79 years
export const OLD_REGIME_EXEMPTION_SUPER_SENIOR = 500000; // 80 years and above
export const SUPER_SENIOR_AGE = 80;

/**
 * Supported financial years.
 *  - threshold: the Section 194 proviso limit in force for that year.
 *  - newRegimeExemption: the point at which the default Section 115BAC slab
 *    starts charging tax. Rs 3,00,000 up to FY 2024-25; raised to Rs 4,00,000
 *    by the Finance Act, 2025 from FY 2025-26. This is the ceiling used by the
 *    Section 197A(1B) test for a Form 15G declaration.
 */
export const FINANCIAL_YEARS = [
  {
    id: "2024-25",
    label: "FY 2024-25 (AY 2025-26)",
    threshold: SECTION_194_THRESHOLD_UPTO_FY_2024_25,
    newRegimeExemption: 300000,
  },
  {
    id: "2025-26",
    label: "FY 2025-26 (AY 2026-27)",
    threshold: SECTION_194_THRESHOLD_FROM_FY_2025_26,
    newRegimeExemption: 400000,
  },
  {
    id: "2026-27",
    label: "FY 2026-27 (AY 2027-28)",
    threshold: SECTION_194_THRESHOLD_FROM_FY_2025_26,
    newRegimeExemption: 400000,
  },
];

export const SHAREHOLDER_TYPES = [
  { id: "individual", label: "Resident individual" },
  { id: "huf_aop_trust", label: "HUF / AOP / trust (resident)" },
  { id: "company_or_firm", label: "Domestic company or firm" },
];

export const PAYMENT_MODES = [
  { id: "non_cash", label: "Bank transfer, cheque or other non-cash mode" },
  { id: "cash", label: "Cash" },
];

/** Section 197 lower/nil deduction certificates cannot exceed the normal rate. */
export const MAX_CERTIFICATE_RATE = 20;

const round = (value) => Math.round(value);

/** Look up a supported financial year, defaulting to the latest entry. */
export function getFinancialYear(id) {
  return FINANCIAL_YEARS.find((year) => year.id === id) || null;
}

/**
 * Maximum amount not chargeable to income-tax for the shareholder, used by the
 * Section 197A(1B) ceiling that applies to Form 15G.
 */
export function basicExemptionLimit({ financialYear, regime, age }) {
  const fy = getFinancialYear(financialYear);
  if (!fy) return null;
  if (regime === "old") {
    if (age >= SUPER_SENIOR_AGE) return OLD_REGIME_EXEMPTION_SUPER_SENIOR;
    if (age >= SENIOR_CITIZEN_AGE) return OLD_REGIME_EXEMPTION_SENIOR;
    return OLD_REGIME_EXEMPTION_BELOW_60;
  }
  return fy.newRegimeExemption;
}

/**
 * Which no-TDS declaration a shareholder would use, and whether the statutory
 * conditions are met.
 *
 * Form 15G - Section 197A(1) for dividend under Section 194, read with the
 * Section 197A(1B) ceiling: available to a resident who is not a company or a
 * firm, aged below 60, whose tax on estimated total income is nil AND whose
 * aggregate covered income for the year is within the basic exemption limit.
 *
 * Form 15H - Section 197A(1C): available to a resident individual aged 60 or
 * more whose tax on estimated total income is nil. The Section 197A(1B)
 * ceiling does not apply, so the amount of dividend is irrelevant.
 */
export function assessDeclaration({
  financialYear,
  shareholderType,
  age,
  regime,
  nilTaxLiability,
  aggregateCoveredIncome,
}) {
  const isSenior = age >= SENIOR_CITIZEN_AGE;
  // Form 15H (Section 197A(1C)) may only be filed by a RESIDENT INDIVIDUAL who
  // is a senior citizen — it is never available to an HUF, AOP, trust, firm or
  // company no matter how old the input `age` is. Every other case (including
  // a senior non-individual) falls back to Form 15G (Section 197A(1)/(1A)),
  // which has no age ceiling but does carry the Section 197A(1B) income-ceiling
  // condition evaluated below.
  const form = isSenior && shareholderType === "individual" ? "15H" : "15G";
  const exemptionLimit = basicExemptionLimit({ financialYear, regime, age });
  const checks = [];

  if (form === "15H") {
    checks.push({
      label: "Resident individual aged 60 or above",
      pass: shareholderType === "individual",
      detail:
        shareholderType === "individual"
          ? `Age ${age} qualifies under Section 197A(1C).`
          : "Form 15H is only for a resident individual, not an HUF, AOP, trust, firm or company.",
    });
  } else {
    checks.push({
      label: "Not a company or a firm",
      pass: shareholderType !== "company_or_firm",
      detail:
        shareholderType !== "company_or_firm"
          ? "Section 197A(1) covers a person other than a company or a firm."
          : "A company or a firm can never file Form 15G; apply for a Section 197 certificate instead.",
    });
    checks.push({
      label: "Aggregate covered income within the basic exemption limit",
      pass: aggregateCoveredIncome <= exemptionLimit,
      detail: `Section 197A(1B) caps the aggregate at the basic exemption limit of Rs ${exemptionLimit.toLocaleString(
        "en-IN",
      )}.`,
    });
  }

  checks.push({
    label: "Tax on estimated total income for the year is nil",
    pass: Boolean(nilTaxLiability),
    detail: nilTaxLiability
      ? "Declared nil, after the Section 87A rebate if any."
      : "Both declarations require the estimated tax for the whole year to work out to nil.",
  });

  const eligible = checks.every((check) => check.pass);
  return { form, eligible, checks, exemptionLimit, isSenior };
}

/**
 * Compute the TDS a domestic company must deduct under Section 194.
 *
 * Order of precedence used, which mirrors the statute:
 *   1. a valid Section 197A declaration (Form 15G / 15H) - nil deduction
 *   2. the Section 194 proviso threshold - nil deduction (this is an
 *      unconditional carve-out from the deduction requirement itself, so it
 *      is evaluated before any Section 197 certificate — a certificate only
 *      sets the rate for a deduction that is otherwise due, and there is
 *      nothing for it to modify once the proviso removes that obligation)
 *   3. a Section 197 lower-deduction certificate - certificate rate
 *   4. 10% with PAN, 20% without PAN (Section 206AA)
 *
 * @returns {object} either { error } or the full breakdown.
 */
export function computeDividendTds({
  grossDividend,
  financialYear = "2025-26",
  shareholderType = "individual",
  paymentMode = "non_cash",
  hasPan = true,
  age = 40,
  regime = "new",
  declarationFiled = false,
  nilTaxLiability = false,
  otherCoveredIncome = 0,
  lowerDeductionCertificate = false,
  certificateRate = 0,
} = {}) {
  const fy = getFinancialYear(financialYear);
  if (!fy) return { error: "Choose one of the supported financial years." };

  if (!Number.isFinite(grossDividend)) {
    return { error: "Enter the dividend amount as a number." };
  }
  if (grossDividend < 0) {
    return { error: "Dividend cannot be negative." };
  }
  if (!Number.isFinite(otherCoveredIncome) || otherCoveredIncome < 0) {
    return { error: "Other declaration-covered income must be zero or more." };
  }
  if (!Number.isFinite(age) || age < 0 || age > 120) {
    return { error: "Enter an age between 0 and 120 years." };
  }
  if (lowerDeductionCertificate) {
    if (!Number.isFinite(certificateRate) || certificateRate < 0) {
      return { error: "Enter the certificate rate as a percentage of zero or more." };
    }
    if (certificateRate > MAX_CERTIFICATE_RATE) {
      return {
        error: `A Section 197 certificate rate above ${MAX_CERTIFICATE_RATE}% is not meaningful for dividend.`,
      };
    }
  }

  const threshold = fy.threshold;
  const thresholdAvailable = shareholderType === "individual" && paymentMode === "non_cash";
  const withinThreshold = thresholdAvailable && grossDividend <= threshold;
  const aggregateCoveredIncome = grossDividend + otherCoveredIncome;

  const declaration = assessDeclaration({
    financialYear,
    shareholderType,
    age,
    regime,
    nilTaxLiability,
    aggregateCoveredIncome,
  });

  const warnings = [];
  if (paymentMode === "cash" && shareholderType === "individual") {
    warnings.push(
      "The Section 194 threshold applies only to dividend paid by a mode other than cash, so a cash payout is liable to TDS from the first rupee.",
    );
  }
  if (shareholderType !== "individual") {
    warnings.push(
      "The threshold in the proviso to Section 194 is available only to an individual shareholder. Every other resident shareholder faces TDS on the full dividend.",
    );
  }
  if (declarationFiled && !declaration.eligible) {
    warnings.push(
      `You have marked Form ${declaration.form} as filed but the statutory conditions are not met, so the company must still deduct. A false declaration is punishable under Section 277.`,
    );
  }
  if (!hasPan) {
    warnings.push(
      "Without a valid PAN on record Section 206AA forces deduction at 20%, and the credit will not appear in your Form 26AS.",
    );
  }

  let rate;
  let basis;
  let exemptReason = null;

  if (declarationFiled && declaration.eligible) {
    rate = 0;
    basis = `Form ${declaration.form} accepted under Section 197A`;
    exemptReason = `No TDS: a valid Form ${declaration.form} declaration is on record with the company.`;
  } else if (withinThreshold) {
    rate = 0;
    basis = "Within the Section 194 proviso threshold";
    exemptReason = `No TDS: dividend of Rs ${grossDividend.toLocaleString(
      "en-IN",
    )} is within the Rs ${threshold.toLocaleString("en-IN")} limit for ${fy.label}.`;
  } else if (lowerDeductionCertificate) {
    rate = certificateRate;
    basis = "Section 197 lower deduction certificate";
    if (certificateRate === 0) {
      exemptReason = "No TDS: a Section 197 nil-deduction certificate is on record.";
    }
  } else if (!hasPan) {
    rate = TDS_RATE_NO_PAN_206AA;
    basis = "Section 206AA - PAN not furnished";
  } else {
    rate = TDS_RATE_SECTION_194;
    basis = "Section 194 standard rate";
  }

  const tds = round((grossDividend * rate) / 100);
  const netDividend = grossDividend - tds;
  const effectiveRate = grossDividend > 0 ? (tds / grossDividend) * 100 : 0;

  return {
    financialYear: fy.id,
    financialYearLabel: fy.label,
    grossDividend,
    threshold,
    thresholdAvailable,
    withinThreshold,
    aggregateCoveredIncome,
    rate,
    basis,
    exemptReason,
    tds,
    netDividend,
    effectiveRate,
    declaration,
    warnings,
  };
}
