/**
 * Mudra Loan Category Selector — pure rules engine for Pradhan Mantri Mudra Yojana (PMMY).
 *
 * PMMY refinances loans to non-corporate, non-farm micro enterprises through banks,
 * NBFCs and MFIs. The scheme sorts every loan into a named category purely by sanctioned
 * amount; eligibility is a separate set of scheme conditions applied on top.
 */

/** PMMY slabs. Bands are on the sanctioned amount in rupees, inclusive of the upper bound. */
export const MUDRA_CATEGORIES = [
  {
    key: "shishu",
    name: "Shishu",
    meaning: "Infant stage",
    min: 1,
    max: 50000,
    /** Shishu is the start-up slab; MFIs and small finance banks do most of this volume. */
    typicalUse: "First loan for a new micro venture — tools, a stall, seed stock or a small machine.",
    typicalTenureMonths: [12, 60],
    priorLoanRequired: false,
  },
  {
    key: "kishore",
    name: "Kishore",
    meaning: "Adolescent stage",
    min: 50001,
    max: 500000,
    typicalUse: "Working capital and equipment for a business that is already trading.",
    typicalTenureMonths: [36, 60],
    priorLoanRequired: false,
  },
  {
    key: "tarun",
    name: "Tarun",
    meaning: "Young adult stage",
    min: 500001,
    max: 1000000,
    typicalUse: "Scaling an established unit — larger machinery, a second location, bulk inventory.",
    typicalTenureMonths: [36, 84],
    priorLoanRequired: false,
  },
  {
    key: "tarun-plus",
    name: "Tarun Plus",
    meaning: "Repeat-borrower stage",
    min: 1000001,
    max: 2000000,
    typicalUse:
      "Second-cycle expansion for borrowers who already took and fully repaid a Tarun loan.",
    typicalTenureMonths: [36, 84],
    /**
     * Tarun Plus was announced in the Union Budget of July 2024 and operationalised on
     * 24 October 2024. It is open only to entrepreneurs who availed and successfully
     * repaid a previous loan under the Tarun category.
     */
    priorLoanRequired: true,
  },
];

/** Highest amount PMMY covers, after the Tarun Plus slab was added on 24 October 2024. */
export const MUDRA_MAX_LOAN = 2000000;

/** Lowest meaningful sanction. */
export const MUDRA_MIN_LOAN = 1;

/** PMMY loans are extended without collateral or third-party guarantee. */
export const COLLATERAL_REQUIRED = false;

/**
 * Credit risk on PMMY loans is covered by the Credit Guarantee Fund for Micro Units
 * (CGFMU), administered by NCGTC — which is why no security is taken from the borrower.
 */
export const GUARANTEE_SCHEME = "CGFMU (administered by NCGTC)";

/** Minimum age at which a bank will contract a Mudra loan with an individual borrower. */
export const MIN_BORROWER_AGE = 18;

/** Most lenders cap the borrower's age at loan maturity; 65 is the common ceiling. */
export const TYPICAL_MAX_BORROWER_AGE = 65;

/**
 * PMMY does not fix an interest rate. Banks price it per their own MCLR/EBLR-linked
 * policy under RBI's deregulated interest rate regime; MFI pricing is higher.
 */
export const TYPICAL_RATE_RANGE = [8.5, 14];

/** Entity types, and whether the non-corporate test in the PMMY definition is met. */
export const ENTITY_TYPES = [
  { key: "proprietorship", label: "Proprietorship / individual business", eligible: true },
  { key: "partnership", label: "Partnership firm", eligible: true },
  { key: "self-employed", label: "Self-employed professional / service provider", eligible: true },
  { key: "shg-jlg", label: "SHG or JLG member", eligible: true },
  { key: "llp", label: "Limited Liability Partnership (LLP)", eligible: true },
  {
    key: "private-limited",
    label: "Private limited company",
    eligible: false,
    /** PMMY is confined to the non-corporate small business segment. */
    reason: "PMMY covers only the non-corporate small business segment, so companies are outside it.",
  },
  {
    key: "public-limited",
    label: "Public limited company",
    eligible: false,
    reason: "PMMY covers only the non-corporate small business segment, so companies are outside it.",
  },
  {
    key: "trust-society",
    label: "Trust / society (non-income-generating)",
    eligible: false,
    reason: "The borrower must run an income-generating micro enterprise, not a non-profit body.",
  },
];

/** Activities, and whether they sit inside the PMMY non-farm / allied-agriculture scope. */
export const ACTIVITY_TYPES = [
  { key: "manufacturing", label: "Manufacturing or processing", eligible: true },
  { key: "trading", label: "Trading, retail or wholesale", eligible: true },
  { key: "services", label: "Services (repair, salon, transport, tuition, food)", eligible: true },
  {
    key: "allied-agriculture",
    label: "Activities allied to agriculture (dairy, poultry, apiculture, fishery)",
    eligible: true,
    /** Allied activities were brought into PMMY scope from FY 2016-17. */
    note: "Allied agricultural activities are covered; the crop loan itself is not.",
  },
  {
    key: "crop-farming",
    label: "Crop cultivation / farm land purchase",
    eligible: false,
    reason:
      "Crop loans are outside PMMY — they are financed under the Kisan Credit Card and other agriculture schemes.",
  },
  {
    key: "personal",
    label: "Personal spending (wedding, travel, house repair, debt payoff)",
    eligible: false,
    reason: "PMMY funds income-generating business activity only, never personal consumption.",
  },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const findBy = (list, key) => list.find((item) => item.key === key) || null;

/** Returns the PMMY slab a sanctioned amount falls into, or null if outside the scheme. */
export function categoryForAmount(amount) {
  if (!isNum(amount)) return null;
  return (
    MUDRA_CATEGORIES.find((slab) => amount >= slab.min && amount <= slab.max) || null
  );
}

/**
 * Standard reducing-balance instalment, used only to show an indicative EMI.
 * Returns 0 for non-positive inputs rather than NaN or Infinity.
 */
export function indicativeEmi({ principal, annualRate, months }) {
  if (!isNum(principal) || !isNum(annualRate) || !isNum(months)) return 0;
  if (principal <= 0 || months <= 0) return 0;
  const monthly = annualRate / 12 / 100;
  if (monthly <= 0) return principal / months;
  const growth = Math.pow(1 + monthly, months);
  const denominator = growth - 1;
  if (denominator <= 0) return principal / months;
  return (principal * monthly * growth) / denominator;
}

/**
 * Classifies a Mudra requirement and lists every scheme condition that fails.
 *
 * @param {object} input
 * @param {number} input.amount            Loan needed, in rupees.
 * @param {string} input.entityType        Key from ENTITY_TYPES.
 * @param {string} input.activity          Key from ACTIVITY_TYPES.
 * @param {number} input.age               Borrower age in years.
 * @param {boolean} [input.isDefaulter]    Existing default with any bank or FI.
 * @param {boolean} [input.repaidPriorTarun] Previous Tarun loan availed and fully repaid.
 * @param {number} [input.annualRate]      Indicative rate for the EMI figure, percent per year.
 * @param {number} [input.tenureMonths]    Indicative tenure for the EMI figure.
 * @returns {object} classification, or { error } for unusable input.
 */
export function classifyMudraLoan({
  amount,
  entityType,
  activity,
  age,
  isDefaulter = false,
  repaidPriorTarun = false,
  annualRate = 11,
  tenureMonths = 60,
} = {}) {
  if (!isNum(amount) || !isNum(age)) {
    return { error: "Enter a valid loan amount and age." };
  }
  if (amount < MUDRA_MIN_LOAN) {
    return { error: "Loan amount must be greater than zero." };
  }
  if (age <= 0 || age > 120) {
    return { error: "Enter an age between 1 and 120 years." };
  }

  const entity = findBy(ENTITY_TYPES, entityType);
  const act = findBy(ACTIVITY_TYPES, activity);
  if (!entity) return { error: "Choose the type of business entity." };
  if (!act) return { error: "Choose what the loan will be used for." };

  const category = categoryForAmount(amount);
  const blockers = [];
  const warnings = [];

  if (amount > MUDRA_MAX_LOAN) {
    blockers.push(
      `PMMY is capped at ${MUDRA_MAX_LOAN.toLocaleString("en-IN")} rupees. A larger requirement needs a regular MSME term loan, often with CGTMSE cover.`,
    );
  }
  if (!entity.eligible) blockers.push(entity.reason);
  if (!act.eligible) blockers.push(act.reason);
  if (isDefaulter) {
    blockers.push(
      "Applicants who are existing defaulters with any bank or financial institution are not eligible under PMMY.",
    );
  }
  if (age < MIN_BORROWER_AGE) {
    blockers.push(`The borrower must be at least ${MIN_BORROWER_AGE} to contract the loan.`);
  }
  if (category && category.priorLoanRequired && !repaidPriorTarun) {
    blockers.push(
      "Tarun Plus is open only to entrepreneurs who have availed and fully repaid an earlier Tarun loan. Below 10 lakh rupees no prior loan is needed.",
    );
  }

  if (age > TYPICAL_MAX_BORROWER_AGE) {
    warnings.push(
      `Most lenders want the loan to close by about age ${TYPICAL_MAX_BORROWER_AGE}, so the tenure offered may be shortened.`,
    );
  }
  if (act.note) warnings.push(act.note);
  if (category && category.key === "shishu") {
    warnings.push(
      "Shishu-size loans are usually routed through MFIs, small finance banks and NBFCs rather than large bank branches.",
    );
  }

  const headroom = category ? category.max - amount : 0;
  const emi = indicativeEmi({ principal: amount, annualRate, months: tenureMonths });

  return {
    amount,
    category,
    categoryName: category ? category.name : null,
    eligible: blockers.length === 0 && Boolean(category),
    blockers,
    warnings,
    headroom: headroom > 0 ? headroom : 0,
    collateralRequired: COLLATERAL_REQUIRED,
    guaranteeScheme: GUARANTEE_SCHEME,
    rateRange: TYPICAL_RATE_RANGE,
    indicativeEmi: emi,
    indicativeTotalInterest: emi > 0 ? emi * tenureMonths - amount : 0,
    tenureMonths,
    annualRate,
  };
}
