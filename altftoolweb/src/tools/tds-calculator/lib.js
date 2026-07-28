/**
 * TDS (Tax Deducted at Source) calculator for resident payments in India.
 *
 * Rates and thresholds are those in force for FY 2025-26 (AY 2026-27) after the
 * Finance Act 2025, which raised a large number of section thresholds with effect
 * from 1 April 2025 (for example 194J from Rs 30,000 to Rs 50,000, 194-I from
 * Rs 2,40,000 a year to Rs 50,000 a month, and bank interest under 194A from
 * Rs 40,000 to Rs 50,000, or Rs 1,00,000 for senior citizens).
 *
 * Two structural rules the calculator applies:
 *  1. Threshold. Most sections deduct on the WHOLE payment once the limit is
 *     exceeded. A few — 194Q and 194N — deduct only on the amount ABOVE the limit.
 *  2. Section 206AA. If the deductee has not furnished a PAN, tax is deducted at
 *     the higher of the specified rate or 20%. For sections 194-O and 194Q the
 *     206AA floor is 5% instead of 20%.
 *
 * TDS on payments to residents carries no surcharge and no health & education
 * cess; those apply only to salary under section 192 and to non-resident payments.
 * This module covers resident payees only.
 */

/** Section 206AA default floor rate when PAN is not furnished, in percent. */
export const NO_PAN_RATE = 20;
/** Section 206AA proviso floor for 194-O and 194Q, in percent. */
export const NO_PAN_RATE_ECOM = 5;

/**
 * Section catalogue.
 *
 * threshold        - limit in rupees; deduction starts only once it is exceeded
 * thresholdBasis   - what the limit is measured against, for display
 * thresholdMode    - "full"   : deduct on the entire payment once exceeded
 *                    "excess" : deduct only on the part above the limit
 * singleThreshold  - optional second limit tested against ONE payment (194C)
 * variants         - payee/payment flavours, each with its own percent rate;
 *                    a variant may override threshold or supply tiers
 * tiers            - marginal tiers [{ above, rate }] used by 194N
 */
export const SECTIONS = [
  {
    code: "192A",
    label: "192A — Premature withdrawal from EPF",
    threshold: 50000,
    thresholdBasis: "the accumulated balance paid",
    thresholdMode: "full",
    variants: [{ id: "default", label: "Employee (taxable withdrawal)", rate: 10 }],
    note: "Applies when service is under 5 years and the taxable balance exceeds Rs 50,000.",
  },
  {
    code: "193",
    label: "193 — Interest on securities",
    threshold: 10000,
    thresholdBasis: "interest paid in the financial year",
    thresholdMode: "full",
    variants: [{ id: "default", label: "Resident holder of securities", rate: 10 }],
    note: "Includes debentures of a listed company; the Rs 10,000 limit applies from FY 2025-26.",
  },
  {
    code: "194",
    label: "194 — Dividend paid by a domestic company",
    threshold: 10000,
    thresholdBasis: "dividend paid in the financial year",
    thresholdMode: "full",
    variants: [{ id: "default", label: "Resident shareholder", rate: 10 }],
    note: "Threshold raised from Rs 5,000 to Rs 10,000 with effect from 1 April 2025.",
  },
  {
    code: "194A",
    label: "194A — Interest other than on securities",
    threshold: 10000,
    thresholdBasis: "interest paid in the financial year",
    thresholdMode: "full",
    variants: [
      { id: "bank", label: "Bank / co-op bank / post office — payee under 60", rate: 10, threshold: 50000 },
      { id: "senior", label: "Bank / co-op bank / post office — senior citizen (60+)", rate: 10, threshold: 100000 },
      { id: "other", label: "Any other payer (company, firm, NBFC deposit)", rate: 10, threshold: 10000 },
    ],
    note: "Form 15G/15H can stop the deduction where total income is below the taxable limit.",
  },
  {
    code: "194B",
    label: "194B — Winnings from lottery, crossword or gambling",
    threshold: 10000,
    thresholdBasis: "a single winning",
    thresholdMode: "full",
    variants: [{ id: "default", label: "Winner", rate: 30 }],
    note: "The Rs 10,000 limit is tested per single transaction, not on the yearly total.",
  },
  {
    code: "194BB",
    label: "194BB — Winnings from horse races",
    threshold: 10000,
    thresholdBasis: "a single winning",
    thresholdMode: "full",
    variants: [{ id: "default", label: "Winner", rate: 30 }],
    note: "No deduction under Chapter VI-A or basic exemption is allowed against these winnings.",
  },
  {
    code: "194C",
    label: "194C — Payment to a contractor or sub-contractor",
    threshold: 100000,
    singleThreshold: 30000,
    thresholdBasis: "the financial year total (or Rs 30,000 in one bill)",
    thresholdMode: "full",
    variants: [
      { id: "individual", label: "Contractor is an individual or HUF", rate: 1 },
      { id: "other", label: "Contractor is a company, firm, LLP or AOP", rate: 2 },
    ],
    note: "No TDS on a goods-carriage transporter owning 10 or fewer vehicles who furnishes a declaration with PAN.",
  },
  {
    code: "194D",
    label: "194D — Insurance commission",
    threshold: 20000,
    thresholdBasis: "commission paid in the financial year",
    thresholdMode: "full",
    variants: [
      { id: "noncompany", label: "Resident other than a company (agent)", rate: 2 },
      { id: "company", label: "Domestic company", rate: 10 },
    ],
    note: "The non-company rate was cut from 5% to 2% with effect from 1 April 2025.",
  },
  {
    code: "194DA",
    label: "194DA — Life insurance policy payout",
    threshold: 100000,
    thresholdBasis: "the payout in the financial year",
    thresholdMode: "full",
    variants: [{ id: "default", label: "Policyholder (enter the income portion)", rate: 2 }],
    note: "Deduction is on the income part only — maturity proceeds minus the premiums paid. Enter that income figure.",
  },
  {
    code: "194EE",
    label: "194EE — Payment out of a National Savings Scheme deposit",
    threshold: 2500,
    thresholdBasis: "the payment in the financial year",
    thresholdMode: "full",
    variants: [{ id: "default", label: "Depositor", rate: 10 }],
    note: "No deduction where the payment is made to the heirs of a deceased depositor.",
  },
  {
    code: "194G",
    label: "194G — Commission on sale of lottery tickets",
    threshold: 20000,
    thresholdBasis: "commission paid in the financial year",
    thresholdMode: "full",
    variants: [{ id: "default", label: "Lottery stockist or agent", rate: 2 }],
    note: "Rate reduced from 5% to 2% with effect from 1 October 2024.",
  },
  {
    code: "194H",
    label: "194H — Commission or brokerage",
    threshold: 20000,
    thresholdBasis: "commission paid in the financial year",
    thresholdMode: "full",
    variants: [{ id: "default", label: "Resident agent or broker", rate: 2 }],
    note: "Rate reduced from 5% to 2% with effect from 1 October 2024; threshold raised to Rs 20,000 from 1 April 2025.",
  },
  {
    code: "194I-a",
    label: "194-I(a) — Rent of plant, machinery or equipment",
    threshold: 50000,
    thresholdBasis: "rent for a month or part of a month",
    thresholdMode: "full",
    variants: [{ id: "default", label: "Resident lessor", rate: 2 }],
    note: "From 1 April 2025 the limit is Rs 50,000 a month, replacing the earlier Rs 2,40,000 a year.",
  },
  {
    code: "194I-b",
    label: "194-I(b) — Rent of land, building or furniture",
    threshold: 50000,
    thresholdBasis: "rent for a month or part of a month",
    thresholdMode: "full",
    variants: [{ id: "default", label: "Resident landlord", rate: 10 }],
    note: "Applies to a payer liable to tax audit; individuals and HUFs below audit limits use 194-IB instead.",
  },
  {
    code: "194IA",
    label: "194-IA — Purchase of immovable property",
    threshold: 5000000,
    thresholdBasis: "the sale consideration or stamp duty value",
    thresholdMode: "full",
    variants: [{ id: "default", label: "Resident seller", rate: 1 }],
    note: "Agricultural land is excluded. Deposit with Form 26QB; no TAN is needed.",
  },
  {
    code: "194IB",
    label: "194-IB — Rent paid by an individual or HUF not under audit",
    threshold: 50000,
    thresholdBasis: "rent for a month or part of a month",
    thresholdMode: "full",
    variants: [{ id: "default", label: "Resident landlord", rate: 2 }],
    note: "Deducted once a year (or when the tenancy ends) and paid with Form 26QC; rate cut from 5% to 2% from 1 October 2024.",
  },
  {
    code: "194J",
    label: "194J — Professional or technical fees, royalty",
    threshold: 50000,
    thresholdBasis: "the financial year total per category",
    thresholdMode: "full",
    variants: [
      { id: "professional", label: "Professional services, royalty, director's fee", rate: 10 },
      { id: "technical", label: "Technical services, call centre, film royalty", rate: 2 },
    ],
    note: "A director's sitting fee has no threshold at all — deduct at 10% on the first rupee.",
  },
  {
    code: "194K",
    label: "194K — Income from mutual fund units",
    threshold: 10000,
    thresholdBasis: "income paid in the financial year",
    thresholdMode: "full",
    variants: [{ id: "default", label: "Resident unit holder", rate: 10 }],
    note: "Applies to dividend/IDCW income only, not to capital gains on redemption.",
  },
  {
    code: "194LA",
    label: "194LA — Compensation on compulsory acquisition",
    threshold: 500000,
    thresholdBasis: "compensation paid in the financial year",
    thresholdMode: "full",
    variants: [{ id: "default", label: "Resident landowner", rate: 10 }],
    note: "Compensation under the RFCTLARR Act 2013 is exempt and carries no TDS.",
  },
  {
    code: "194M",
    label: "194M — Contract, commission or fees paid by an individual/HUF",
    threshold: 5000000,
    thresholdBasis: "the financial year total to one payee",
    thresholdMode: "full",
    variants: [{ id: "default", label: "Resident contractor or professional", rate: 2 }],
    note: "For payers not covered by 194C, 194H or 194J. Paid with Form 26QD; no TAN needed.",
  },
  {
    code: "194N",
    label: "194N — Cash withdrawal from a bank or post office",
    threshold: 10000000,
    thresholdBasis: "cash withdrawn in the financial year",
    thresholdMode: "excess",
    variants: [
      {
        id: "filer",
        label: "Income tax returns filed for the last 3 years",
        rate: 2,
        tiers: [{ above: 10000000, rate: 2 }],
        threshold: 10000000,
      },
      {
        id: "nonfiler",
        label: "Returns not filed for the last 3 years",
        rate: 2,
        tiers: [
          { above: 2000000, rate: 2 },
          { above: 10000000, rate: 5 },
        ],
        threshold: 2000000,
      },
      {
        id: "coop",
        label: "Co-operative society (returns filed)",
        rate: 2,
        tiers: [{ above: 30000000, rate: 2 }],
        threshold: 30000000,
      },
    ],
    note: "Section 206AA does not apply — 194N already operates without reference to PAN status.",
    ignoreNoPan: true,
  },
  {
    code: "194O",
    label: "194-O — Sale through an e-commerce operator",
    threshold: 500000,
    thresholdBasis: "gross sales in the financial year",
    thresholdMode: "full",
    variants: [{ id: "default", label: "Individual or HUF seller", rate: 0.1 }],
    noPanRate: NO_PAN_RATE_ECOM,
    note: "The Rs 5,00,000 exemption applies only to individual and HUF sellers who have given a PAN.",
  },
  {
    code: "194Q",
    label: "194Q — Purchase of goods",
    threshold: 5000000,
    thresholdBasis: "purchases from one seller in the financial year",
    thresholdMode: "excess",
    variants: [{ id: "default", label: "Resident seller of goods", rate: 0.1 }],
    noPanRate: NO_PAN_RATE_ECOM,
    note: "Only buyers whose previous-year turnover exceeded Rs 10 crore deduct under this section.",
  },
  {
    code: "194R",
    label: "194R — Benefit or perquisite of a business or profession",
    threshold: 20000,
    thresholdBasis: "benefits given in the financial year",
    thresholdMode: "full",
    variants: [{ id: "default", label: "Resident recipient", rate: 10 }],
    note: "Covers free goods, sponsored trips and similar perks; value the benefit at fair market value.",
  },
  {
    code: "194S",
    label: "194S — Transfer of a virtual digital asset",
    threshold: 10000,
    thresholdBasis: "consideration in the financial year",
    thresholdMode: "full",
    variants: [
      { id: "specified", label: "Specified person (small individual/HUF payer)", rate: 1, threshold: 50000 },
      { id: "other", label: "Any other payer", rate: 1, threshold: 10000 },
    ],
    note: "Deduct on the gross consideration; losses cannot be set off against this income.",
  },
  {
    code: "194T",
    label: "194T — Payment to a partner of a firm",
    threshold: 20000,
    thresholdBasis: "payments to that partner in the financial year",
    thresholdMode: "full",
    variants: [{ id: "default", label: "Partner (salary, bonus, commission, interest)", rate: 10 }],
    note: "New section effective 1 April 2025. Repayment of capital and share of profit are not covered.",
  },
];

/** Look up a section object by its code. */
export function getSection(code) {
  return SECTIONS.find((s) => s.code === code) || null;
}

const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const round2 = (v) => Math.round(v * 100) / 100;

/** Ceiling used to reject nonsense inputs. Rs 1,00,000 crore. */
export const MAX_AMOUNT = 1e15;

/**
 * Marginal tier maths used by section 194N.
 * @returns {{ tax: number, parts: Array<{rate:number, base:number, tax:number}> }}
 */
export function applyTiers(amount, tiers) {
  const parts = [];
  let tax = 0;
  const sorted = [...tiers].sort((a, b) => a.above - b.above);
  for (let i = 0; i < sorted.length; i += 1) {
    const from = sorted[i].above;
    const to = i + 1 < sorted.length ? sorted[i + 1].above : Infinity;
    const base = Math.max(0, Math.min(amount, to) - from);
    if (base <= 0) continue;
    const t = (base * sorted[i].rate) / 100;
    tax += t;
    parts.push({ rate: sorted[i].rate, base: round2(base), tax: round2(t) });
  }
  return { tax: round2(tax), parts };
}

/**
 * Work out the TDS on one payment.
 *
 * @param {object} input
 * @param {string} input.sectionCode  Section code from SECTIONS.
 * @param {string} input.variantId    Variant id inside that section.
 * @param {number} input.amount       This payment, in rupees (gross).
 * @param {number} input.priorAmount  Already paid to the same payee this financial year.
 * @param {boolean} input.hasPan      Whether the deductee furnished a valid PAN.
 */
export function calculateTds({
  sectionCode,
  variantId,
  amount,
  priorAmount = 0,
  hasPan = true,
} = {}) {
  const section = getSection(sectionCode);
  if (!section) return { error: "Pick a TDS section from the list." };

  const variant =
    section.variants.find((v) => v.id === variantId) || section.variants[0];

  if (!isNum(amount)) return { error: "Enter the payment amount as a number." };
  if (amount < 0) return { error: "A payment amount cannot be negative." };
  if (amount > MAX_AMOUNT) return { error: "That amount is larger than this calculator handles." };

  const prior = isNum(priorAmount) && priorAmount > 0 ? priorAmount : 0;
  if (prior > MAX_AMOUNT) return { error: "The year-to-date figure is larger than this calculator handles." };

  const threshold = isNum(variant.threshold) ? variant.threshold : section.threshold;
  const yearToDate = amount + prior;

  // Section 206AA: no PAN means the higher of the specified rate or the statutory floor.
  const panFloor = section.noPanRate ?? NO_PAN_RATE;
  const noPanApplied = !hasPan && !section.ignoreNoPan;

  // --- Threshold test -------------------------------------------------------
  const singleTriggered =
    isNum(section.singleThreshold) && amount > section.singleThreshold;
  const yearTriggered = yearToDate > threshold;
  const triggered = singleTriggered || yearTriggered;

  if (!triggered) {
    return {
      sectionCode: section.code,
      sectionLabel: section.label,
      variantLabel: variant.label,
      amount: round2(amount),
      priorAmount: round2(prior),
      yearToDate: round2(yearToDate),
      threshold,
      thresholdBasis: section.thresholdBasis,
      thresholdMode: section.thresholdMode,
      singleThreshold: section.singleThreshold ?? null,
      triggered: false,
      baseRate: variant.rate,
      rateApplied: 0,
      noPanApplied: false,
      taxableBase: 0,
      tds: 0,
      netPayable: round2(amount),
      tiers: null,
      headroom: round2(Math.max(0, threshold - yearToDate)),
      note: section.note,
    };
  }

  // --- Base on which tax is deducted ---------------------------------------
  let taxableBase;
  if (section.thresholdMode === "excess") {
    taxableBase = Math.min(amount, Math.max(0, yearToDate - threshold));
  } else {
    taxableBase = amount;
  }

  // --- Tax ------------------------------------------------------------------
  let tds;
  let rateApplied;
  let tiers = null;

  if (variant.tiers && !noPanApplied) {
    // 194N: marginal tiers computed on the year-to-date withdrawal, then the
    // part attributable to the earlier withdrawals is removed.
    const onTotal = applyTiers(yearToDate, variant.tiers);
    const onPrior = applyTiers(prior, variant.tiers);
    tds = round2(Math.max(0, onTotal.tax - onPrior.tax));
    tiers = onTotal.parts;
    rateApplied = taxableBase > 0 ? round2((tds / taxableBase) * 100) : 0;
  } else {
    rateApplied = noPanApplied ? Math.max(variant.rate, panFloor) : variant.rate;
    tds = round2((taxableBase * rateApplied) / 100);
  }

  return {
    sectionCode: section.code,
    sectionLabel: section.label,
    variantLabel: variant.label,
    amount: round2(amount),
    priorAmount: round2(prior),
    yearToDate: round2(yearToDate),
    threshold,
    thresholdBasis: section.thresholdBasis,
    thresholdMode: section.thresholdMode,
    singleThreshold: section.singleThreshold ?? null,
    triggered: true,
    triggeredBySingleBill: singleTriggered && !yearTriggered,
    baseRate: variant.rate,
    rateApplied,
    noPanApplied,
    taxableBase: round2(taxableBase),
    tds,
    netPayable: round2(amount - tds),
    tiers,
    headroom: 0,
    note: section.note,
  };
}
