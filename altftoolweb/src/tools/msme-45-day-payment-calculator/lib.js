/**
 * MSME 45-day payment and section 43B(h) cost engine — pure logic, no DOM.
 *
 * Three separate rules are applied in sequence, and the first one gates the
 * other two:
 *
 * 1. WHO IS PROTECTED — MSMED Act 2006, section 2(n): "supplier" means a micro
 *    or small enterprise which has filed a memorandum with the authority
 *    referred to in section 8(1). A MEDIUM enterprise is not a "supplier", so
 *    Chapter V (sections 15 to 24) does not reach it and neither does section
 *    43B(h) of the Income-tax Act 1961, which is drafted by reference to
 *    "micro or small enterprise". This is the point most buyers get wrong.
 *    Ministry of MSME Office Memoranda further restrict retail and wholesale
 *    traders holding Udyam registration to priority-sector-lending benefits
 *    only, excluding the delayed-payment provisions.
 *
 * 2. WHEN PAYMENT IS DUE — MSMED Act 2006, section 15 read with section 2(b).
 *    Where there is no agreement in writing, the "appointed day" is the day
 *    following immediately after the expiry of fifteen days from the day of
 *    acceptance or deemed acceptance, so payment must be made within 15 days.
 *    Where there is an agreement in writing the agreed date governs, but the
 *    proviso to section 15 says the agreed period "shall not exceed forty-five
 *    days from the day of acceptance or the day of deemed acceptance".
 *
 * 3. WHAT DELAY COSTS —
 *    (a) MSMED Act section 16: the buyer is liable to pay "compound interest
 *        with monthly rests ... from the appointed day or, as the case may be,
 *        from the date immediately following the date agreed upon, at three
 *        times of the bank rate notified by the Reserve Bank."
 *    (b) MSMED Act section 23: that interest "shall not, for the purposes of
 *        computation of income under the Income-tax Act, 1961, be allowed as
 *        deduction." It is a fully post-tax cost.
 *    (c) Income-tax Act 1961, section 43B(h) (inserted by the Finance Act 2023,
 *        effective 1 April 2024, i.e. AY 2024-25 / FY 2023-24 onwards): a sum
 *        payable to a micro or small enterprise beyond the section 15 time
 *        limit is allowed as a deduction only in the previous year in which it
 *        is actually paid. The proviso to section 43B that rescues other
 *        clauses when payment is made before the section 139(1) return due
 *        date does NOT extend to clause (h). So if the payment slips past
 *        31 March the deduction slips a whole financial year with it.
 *
 * Date primitives are imported from the invoice-late-fee-calculator tool rather
 * than re-implemented, so ISO parsing and UTC day counting behave identically
 * across both tools. Nothing here reads the clock: every date is an argument.
 *
 * Rate stamp: RBI Bank Rate read from rbi.org.in on 29 July 2026, where the
 * "Policy Rates" panel showed Bank Rate 5.50% (Policy Repo Rate 5.25%,
 * Marginal Standing Facility Rate 5.50%). The rate is an input, not a
 * hard-wired assumption, so an older or newer notified rate can be used.
 */

import { actualDays, parseISODate, shiftISO } from "../invoice-late-fee-calculator/lib.js";

/* ------------------------------------------------------------------ *
 * Statutory constants
 * ------------------------------------------------------------------ */

/** MSMED Act 2006 s.2(b): the appointed day falls after fifteen days from acceptance. */
export const S15_NO_AGREEMENT_DAYS = 15;

/** MSMED Act 2006 s.15, proviso: an agreement in writing can never exceed forty-five days. */
export const S15_MAX_AGREED_DAYS = 45;

/** MSMED Act 2006 s.16: interest is "three times of the bank rate notified by the Reserve Bank". */
export const S16_BANK_RATE_MULTIPLE = 3;

/** MSMED Act 2006 s.16: "compound interest with monthly rests" — twelve rests a year. */
export const RESTS_PER_YEAR = 12;

/** Days in a year used for the part-month stub between the last rest and payment. */
export const DAYS_IN_YEAR = 365;

/**
 * RBI Bank Rate as published on the Reserve Bank of India home page
 * (rbi.org.in, "Policy Rates") and read on 29 July 2026. Supplied as the
 * default only; the notified rate for the period of default is an input.
 */
export const RBI_BANK_RATE_PERCENT = 5.5;
export const RBI_BANK_RATE_READ_ON = "29 July 2026";

/** Income-tax Act s.43B(h) first applies to FY 2023-24 (AY 2024-25). */
export const S43BH_FIRST_FY_START_YEAR = 2023;

/** The Indian financial year runs 1 April to 31 March. */
export const FY_START_MONTH = 4;

/** Sanity bounds so absurd input returns a reason rather than a silly number. */
export const MAX_YEARS_LATE = 20;
export const MIN_YEAR = 1900;
export const MAX_YEAR = 2200;
export const MAX_AMOUNT = 1e15;
export const MAX_BANK_RATE_PERCENT = 25;
export const MAX_TAX_PERCENT = 60;
export const MAX_COST_OF_CAPITAL_PERCENT = 60;

/**
 * Who the supplier is decides everything else.
 *
 * `msmedProtected` — is the supplier a "supplier" under MSMED s.2(n), so that
 * sections 15 and 16 bite at all.
 * `s43bhApplies` — does Income-tax Act s.43B(h) reach a payable owed to them.
 */
export const SUPPLIER_TYPES = {
  micro: {
    key: "micro",
    label: "Micro enterprise (Udyam registered, manufacturer or service provider)",
    short: "Micro enterprise",
    msmedProtected: true,
    s43bhApplies: true,
    reason:
      "A micro enterprise holding Udyam registration is a \"supplier\" under MSMED Act s.2(n), so ss.15 and 16 apply and s.43B(h) reaches the payable.",
  },
  small: {
    key: "small",
    label: "Small enterprise (Udyam registered, manufacturer or service provider)",
    short: "Small enterprise",
    msmedProtected: true,
    s43bhApplies: true,
    reason:
      "A small enterprise holding Udyam registration is a \"supplier\" under MSMED Act s.2(n), so ss.15 and 16 apply and s.43B(h) reaches the payable.",
  },
  medium: {
    key: "medium",
    label: "Medium enterprise (Udyam registered)",
    short: "Medium enterprise",
    msmedProtected: false,
    s43bhApplies: false,
    reason:
      "A medium enterprise is not a \"supplier\" under MSMED Act s.2(n), which covers only a micro or small enterprise. Sections 15 and 16 therefore do not apply, and s.43B(h) is drafted for a \"micro or small enterprise\", so the deduction is not deferred.",
  },
  trader: {
    key: "trader",
    label: "Retail or wholesale trader with Udyam registration",
    short: "Trader (Udyam)",
    msmedProtected: false,
    s43bhApplies: false,
    reason:
      "Ministry of MSME Office Memoranda restrict retail and wholesale traders registered on Udyam to priority-sector-lending benefits only and exclude the MSMED Act delayed-payment provisions, so neither s.16 interest nor s.43B(h) is triggered.",
  },
  unregistered: {
    key: "unregistered",
    label: "Not registered under Udyam / not an MSME",
    short: "Not an MSME",
    msmedProtected: false,
    s43bhApplies: false,
    reason:
      "MSMED Act s.2(n) requires the enterprise to have filed a memorandum (Udyam registration). Without it there is no \"supplier\", so no s.16 interest and no s.43B(h) deferral; only the contract governs.",
  },
};

export const DEFAULT_SUPPLIER_TYPE = "small";

/**
 * Marginal tax rates that decide what a deferred deduction is worth. Each is
 * the statutory base rate grossed up for the surcharge and the 4% Health and
 * Education Cess under the Income-tax Act 1961.
 */
export const TAX_RATE_PRESETS = [
  {
    key: "slab30",
    percent: 31.2,
    label: "31.2% — 30% slab, firm or LLP, no surcharge (30 x 1.04 cess)",
  },
  {
    key: "firm-surcharge",
    percent: 34.944,
    label: "34.944% — firm or LLP with income over 1 crore (30 x 1.12 surcharge x 1.04 cess)",
  },
  {
    key: "individual-surcharge",
    percent: 39,
    label: "39% — individual in the 30% slab with income over 2 crore (30 x 1.25 x 1.04)",
  },
  {
    key: "company-25",
    percent: 26,
    label: "26% — domestic company on the 25% rate, no surcharge (25 x 1.04 cess)",
  },
  {
    key: "company-115baa",
    percent: 25.168,
    label: "25.168% — domestic company under s.115BAA (22 x 1.10 surcharge x 1.04 cess)",
  },
  {
    key: "company-115bab",
    percent: 17.16,
    label: "17.16% — new manufacturing company under s.115BAB (15 x 1.10 x 1.04)",
  },
];

export const DEFAULT_TAX_PERCENT = 31.2;

/** Default cost of funds used for the time value of the deferred deduction.
 *  This is a user assumption, not a statutory figure. */
export const DEFAULT_COST_OF_CAPITAL_PERCENT = 9;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const pad2 = (value) => String(value).padStart(2, "0");
const pad4 = (value) => String(value).padStart(4, "0");

/* ------------------------------------------------------------------ *
 * Date helpers built on the shared primitives
 * ------------------------------------------------------------------ */

/**
 * Add whole calendar months to an ISO date, clamping to the last day of the
 * target month (31 January plus one month is 28 or 29 February).
 *
 * @param {string} iso "YYYY-MM-DD"
 * @param {number} months whole months to add
 * @returns {{ iso: string } | { error: string }}
 */
export function addMonthsISO(iso, months) {
  const parsed = parseISODate(iso);
  if (parsed.error) return { error: parsed.error };
  if (!isNum(months)) return { error: "The number of months must be a number." };
  const total = parsed.year * 12 + (parsed.month - 1) + Math.round(months);
  const year = Math.floor(total / 12);
  const monthIndex = ((total % 12) + 12) % 12;
  if (year < MIN_YEAR || year > MAX_YEAR) {
    return { error: `Dates must fall between ${MIN_YEAR} and ${MAX_YEAR}.` };
  }
  // Day 0 of the following month is the last day of this month.
  const lastDay = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const day = Math.min(parsed.day, lastDay);
  return { iso: `${pad4(year)}-${pad2(monthIndex + 1)}-${pad2(day)}` };
}

/**
 * The Indian financial year containing a date: 1 April to 31 March.
 *
 * @param {string} iso
 * @returns {{ startYear:number, label:string, endISO:string, assessmentYearLabel:string } | { error:string }}
 */
export function financialYearOf(iso) {
  const parsed = parseISODate(iso);
  if (parsed.error) return { error: parsed.error };
  const startYear = parsed.month >= FY_START_MONTH ? parsed.year : parsed.year - 1;
  return {
    startYear,
    label: `FY ${startYear}-${pad2((startYear + 1) % 100)}`,
    endISO: `${pad4(startYear + 1)}-03-31`,
    assessmentYearLabel: `AY ${startYear + 1}-${pad2((startYear + 2) % 100)}`,
  };
}

/* ------------------------------------------------------------------ *
 * Section 15 — the statutory due date
 * ------------------------------------------------------------------ */

/**
 * The date by which the buyer must pay under MSMED Act s.15.
 *
 * @param {object} input
 * @param {string} input.acceptanceDateISO day of acceptance / deemed acceptance (invoice date)
 * @param {boolean} input.hasWrittenAgreement whether a payment term is agreed in writing
 * @param {number} input.agreedCreditDays credit days agreed in writing
 * @returns {object|{error:string}}
 */
export function statutoryDueDate({ acceptanceDateISO, hasWrittenAgreement, agreedCreditDays = 0 }) {
  const parsed = parseISODate(acceptanceDateISO);
  if (parsed.error) return { error: parsed.error };
  if (parsed.year < MIN_YEAR || parsed.year > MAX_YEAR) {
    return { error: `Dates must fall between ${MIN_YEAR} and ${MAX_YEAR}.` };
  }

  let limitDays;
  let capped = false;
  let basis;

  if (hasWrittenAgreement) {
    if (!isNum(agreedCreditDays) || agreedCreditDays < 0) {
      return { error: "The agreed credit period cannot be negative." };
    }
    const agreed = Math.round(agreedCreditDays);
    if (agreed > S15_MAX_AGREED_DAYS) {
      limitDays = S15_MAX_AGREED_DAYS;
      capped = true;
      basis = `Agreed in writing at ${agreed} days, but the proviso to MSMED Act s.15 caps the agreed period at ${S15_MAX_AGREED_DAYS} days, so ${S15_MAX_AGREED_DAYS} days applies.`;
    } else {
      limitDays = agreed;
      basis = `Agreed in writing at ${agreed} days, which is within the ${S15_MAX_AGREED_DAYS}-day ceiling in the proviso to MSMED Act s.15.`;
    }
  } else {
    limitDays = S15_NO_AGREEMENT_DAYS;
    basis = `No agreement in writing, so MSMED Act s.2(b) applies: the appointed day follows the expiry of ${S15_NO_AGREEMENT_DAYS} days from acceptance, and payment is due within ${S15_NO_AGREEMENT_DAYS} days.`;
  }

  const due = shiftISO(acceptanceDateISO, limitDays);
  if (due.error) return { error: due.error };
  // s.16 runs interest from the appointed day, i.e. the day after the due date.
  const interestStart = shiftISO(due.iso, 1);
  if (interestStart.error) return { error: interestStart.error };

  return {
    limitDays,
    capped,
    basis,
    dueDateISO: due.iso,
    interestStartISO: interestStart.iso,
    maxAgreedDays: S15_MAX_AGREED_DAYS,
    noAgreementDays: S15_NO_AGREEMENT_DAYS,
  };
}

/* ------------------------------------------------------------------ *
 * Section 16 — compound interest with monthly rests
 * ------------------------------------------------------------------ */

/**
 * Interest under MSMED Act s.16.
 *
 * Model: interest runs from the day immediately following the due date. The
 * balance is rested (compounded) on each monthly anniversary of the due date
 * at one twelfth of the annual rate; the part month between the last rest and
 * the payment date carries simple interest at the annual rate over 365 days.
 * A payment one day late therefore accrues exactly one day of interest.
 *
 * @param {object} input
 * @param {number} input.amount principal outstanding, in rupees
 * @param {string} input.dueDateISO statutory due date from statutoryDueDate()
 * @param {string} input.paymentDateISO actual or planned payment date
 * @param {number} input.bankRatePercent RBI notified bank rate, per cent per annum
 * @returns {object|{error:string}}
 */
export function section16Interest({ amount, dueDateISO, paymentDateISO, bankRatePercent }) {
  if (!isNum(amount) || amount <= 0) return { error: "The invoice amount must be more than zero." };
  if (amount > MAX_AMOUNT) return { error: "That invoice amount is too large to compute." };
  if (!isNum(bankRatePercent) || bankRatePercent < 0) {
    return { error: "The RBI bank rate cannot be negative." };
  }
  if (bankRatePercent > MAX_BANK_RATE_PERCENT) {
    return { error: `Enter an RBI bank rate of ${MAX_BANK_RATE_PERCENT}% or less.` };
  }

  const elapsed = actualDays(dueDateISO, paymentDateISO);
  if (elapsed.error) return { error: elapsed.error };
  if (elapsed.days > MAX_YEARS_LATE * DAYS_IN_YEAR) {
    return { error: `This calculator covers delays of up to ${MAX_YEARS_LATE} years.` };
  }

  const annualPercent = bankRatePercent * S16_BANK_RATE_MULTIPLE;
  const annualRate = annualPercent / 100;
  const restRate = annualRate / RESTS_PER_YEAR;
  const daysLate = Math.max(0, elapsed.days);

  if (daysLate === 0) {
    return {
      daysLate: 0,
      paidOnTime: true,
      annualPercent,
      restRatePercent: (restRate * 100),
      completedRests: 0,
      residualDays: 0,
      interest: 0,
      closingBalance: amount,
      lastRestISO: dueDateISO,
    };
  }

  // How many whole monthly rests fall on or before the payment date.
  let completedRests = 0;
  let lastRestISO = dueDateISO;
  for (let k = 1; k <= MAX_YEARS_LATE * RESTS_PER_YEAR + 1; k += 1) {
    const rest = addMonthsISO(dueDateISO, k);
    if (rest.error) return { error: rest.error };
    const gap = actualDays(rest.iso, paymentDateISO);
    if (gap.error) return { error: gap.error };
    if (gap.days < 0) break;
    completedRests = k;
    lastRestISO = rest.iso;
  }

  const stub = actualDays(lastRestISO, paymentDateISO);
  if (stub.error) return { error: stub.error };
  const residualDays = Math.max(0, stub.days);

  const compounded = amount * Math.pow(1 + restRate, completedRests);
  const closingBalance = compounded * (1 + annualRate * (residualDays / DAYS_IN_YEAR));
  if (!Number.isFinite(closingBalance)) {
    return { error: "Those figures are too large to compute an interest amount." };
  }

  return {
    daysLate,
    paidOnTime: false,
    annualPercent,
    restRatePercent: restRate * 100,
    completedRests,
    residualDays,
    interest: closingBalance - amount,
    closingBalance,
    lastRestISO,
  };
}

/**
 * Rest-by-rest build-up of the s.16 balance, for display.
 *
 * @param {object} input same shape as section16Interest
 * @param {number} [maxRows] cap on rows returned
 * @returns {Array<object>} empty when the payment is not late or input is bad
 */
export function buildRestSchedule({ amount, dueDateISO, paymentDateISO, bankRatePercent }, maxRows = 36) {
  const base = section16Interest({ amount, dueDateISO, paymentDateISO, bankRatePercent });
  if (base.error || base.paidOnTime) return [];
  const restRate = base.annualPercent / 100 / RESTS_PER_YEAR;
  const annualRate = base.annualPercent / 100;
  const rows = [];
  let opening = amount;
  const limit = Math.min(base.completedRests, Math.max(0, Math.round(maxRows)));
  for (let k = 1; k <= limit; k += 1) {
    const rest = addMonthsISO(dueDateISO, k);
    if (rest.error) break;
    const interest = opening * restRate;
    rows.push({
      label: `Rest ${k}`,
      dateISO: rest.iso,
      days: null,
      opening,
      interest,
      closing: opening + interest,
    });
    opening += interest;
  }
  if (base.residualDays > 0 && rows.length <= limit) {
    const interest = opening * annualRate * (base.residualDays / DAYS_IN_YEAR);
    rows.push({
      label: `Part month (${base.residualDays} days)`,
      dateISO: paymentDateISO,
      days: base.residualDays,
      opening,
      interest,
      closing: opening + interest,
    });
  }
  return rows;
}

/* ------------------------------------------------------------------ *
 * The whole picture
 * ------------------------------------------------------------------ */

/**
 * Statutory due date, s.16 interest and the s.43B(h) consequence for one
 * invoice, plus the combined rupee cost of the delay.
 *
 * @param {object} input
 * @param {string} input.invoiceDateISO day of acceptance / deemed acceptance
 * @param {string} input.paymentDateISO actual or planned payment date
 * @param {number} input.amount invoice amount payable, in rupees
 * @param {string} input.supplierType key of SUPPLIER_TYPES
 * @param {boolean} input.hasWrittenAgreement
 * @param {number} input.agreedCreditDays credit days agreed in writing
 * @param {number} input.bankRatePercent RBI notified bank rate
 * @param {number} input.marginalTaxPercent buyer's marginal tax rate including surcharge and cess
 * @param {number} input.costOfCapitalPercent buyer's own cost of funds, an assumption
 * @returns {object|{error:string}}
 */
export function computeMsmeDelayCost({
  invoiceDateISO,
  paymentDateISO,
  amount,
  supplierType = DEFAULT_SUPPLIER_TYPE,
  hasWrittenAgreement = true,
  agreedCreditDays = 45,
  bankRatePercent = RBI_BANK_RATE_PERCENT,
  marginalTaxPercent = DEFAULT_TAX_PERCENT,
  costOfCapitalPercent = DEFAULT_COST_OF_CAPITAL_PERCENT,
} = {}) {
  const supplier = SUPPLIER_TYPES[supplierType];
  if (!supplier) return { error: "Choose what kind of enterprise the supplier is." };

  if (!isNum(amount) || amount <= 0) return { error: "The invoice amount must be more than zero." };
  if (amount > MAX_AMOUNT) return { error: "That invoice amount is too large to compute." };
  if (!isNum(marginalTaxPercent) || marginalTaxPercent < 0) {
    return { error: "The marginal tax rate cannot be negative." };
  }
  if (marginalTaxPercent > MAX_TAX_PERCENT) {
    return { error: `Enter a marginal tax rate of ${MAX_TAX_PERCENT}% or less.` };
  }
  if (!isNum(costOfCapitalPercent) || costOfCapitalPercent < 0) {
    return { error: "The cost of funds cannot be negative." };
  }
  if (costOfCapitalPercent > MAX_COST_OF_CAPITAL_PERCENT) {
    return { error: `Enter a cost of funds of ${MAX_COST_OF_CAPITAL_PERCENT}% or less.` };
  }

  const invoiceParsed = parseISODate(invoiceDateISO);
  if (invoiceParsed.error) return { error: invoiceParsed.error };
  const paymentParsed = parseISODate(paymentDateISO);
  if (paymentParsed.error) return { error: paymentParsed.error };
  if (invoiceParsed.year < MIN_YEAR || paymentParsed.year > MAX_YEAR) {
    return { error: `Dates must fall between ${MIN_YEAR} and ${MAX_YEAR}.` };
  }
  const span = actualDays(invoiceDateISO, paymentDateISO);
  if (span.error) return { error: span.error };
  if (span.days < 0) return { error: "The payment date cannot be before the invoice date." };
  if (span.days > MAX_YEARS_LATE * DAYS_IN_YEAR) {
    return { error: `This calculator covers delays of up to ${MAX_YEARS_LATE} years.` };
  }

  const due = statutoryDueDate({ acceptanceDateISO: invoiceDateISO, hasWrittenAgreement, agreedCreditDays });
  if (due.error) return { error: due.error };

  const accrualFY = financialYearOf(invoiceDateISO);
  if (accrualFY.error) return { error: accrualFY.error };
  const paymentFY = financialYearOf(paymentDateISO);
  if (paymentFY.error) return { error: paymentFY.error };

  const daysFromDue = actualDays(due.dueDateISO, paymentDateISO);
  if (daysFromDue.error) return { error: daysFromDue.error };
  const daysLate = Math.max(0, daysFromDue.days);
  const paidWithinS15 = daysFromDue.days <= 0;

  /* ---- Gate 1: is the supplier protected at all? ---- */
  const msmedApplies = supplier.msmedProtected;

  /* ---- Section 16 interest ---- */
  let interestResult = {
    daysLate,
    paidOnTime: paidWithinS15,
    annualPercent: bankRatePercent * S16_BANK_RATE_MULTIPLE,
    restRatePercent: (bankRatePercent * S16_BANK_RATE_MULTIPLE) / RESTS_PER_YEAR,
    completedRests: 0,
    residualDays: 0,
    interest: 0,
    closingBalance: amount,
    lastRestISO: due.dueDateISO,
  };
  if (msmedApplies) {
    const computed = section16Interest({
      amount,
      dueDateISO: due.dueDateISO,
      paymentDateISO,
      bankRatePercent,
    });
    if (computed.error) return { error: computed.error };
    interestResult = computed;
  }

  const taxRate = marginalTaxPercent / 100;
  // MSMED s.23 blocks any deduction for this interest, so it is a post-tax cost:
  // the buyer must earn interest / (1 - t) before tax to fund it.
  const preTaxCostOfInterest =
    taxRate < 1 ? interestResult.interest / (1 - taxRate) : null;

  /* ---- Gate 2 and section 43B(h) ---- */
  const s43bhInForce = accrualFY.startYear >= S43BH_FIRST_FY_START_YEAR;
  const s43bhApplies = supplier.s43bhApplies && s43bhInForce;

  const yearsDeferred =
    s43bhApplies && !paidWithinS15
      ? Math.max(0, paymentFY.startYear - accrualFY.startYear)
      : 0;
  const deductionDeferred = yearsDeferred > 0;

  let deferralDays = 0;
  if (deductionDeferred) {
    const gap = actualDays(accrualFY.endISO, paymentFY.endISO);
    if (gap.error) return { error: gap.error };
    deferralDays = Math.max(0, gap.days);
  }

  const disallowedAmount = deductionDeferred ? amount : 0;
  const extraTaxInAccrualYear = disallowedAmount * taxRate;
  const timeValueCost =
    extraTaxInAccrualYear * (costOfCapitalPercent / 100) * (deferralDays / DAYS_IN_YEAR);

  const totalCostOfDelay = interestResult.interest + timeValueCost;
  const costAsPercentOfInvoice = (totalCostOfDelay / amount) * 100;

  let s43bhVerdict;
  if (!supplier.s43bhApplies) {
    s43bhVerdict = `Section 43B(h) does not apply. ${supplier.reason}`;
  } else if (!s43bhInForce) {
    s43bhVerdict = `Section 43B(h) does not apply to ${accrualFY.label}. It was inserted by the Finance Act 2023 and first applies from FY ${S43BH_FIRST_FY_START_YEAR}-${pad2((S43BH_FIRST_FY_START_YEAR + 1) % 100)} (AY ${S43BH_FIRST_FY_START_YEAR + 1}-${pad2((S43BH_FIRST_FY_START_YEAR + 2) % 100)}).`;
  } else if (paidWithinS15) {
    s43bhVerdict = `Section 43B(h) applies to this supplier, but payment falls on or before the s.15 due date of ${due.dueDateISO}, so the deduction stays in ${accrualFY.label} on the accrual basis.`;
  } else if (!deductionDeferred) {
    s43bhVerdict = `Section 43B(h) applies and payment is ${daysLate} days past the s.15 due date, but it is still made inside ${accrualFY.label}, so the deduction is claimed in the same year the expense accrued.`;
  } else {
    s43bhVerdict = `Section 43B(h) applies. Payment is ${daysLate} days past the s.15 due date and lands in ${paymentFY.label}, so the deduction is disallowed in ${accrualFY.label} and allowed only in ${paymentFY.label}. The proviso to s.43B that saves other clauses when payment precedes the s.139(1) return due date does not extend to clause (h).`;
  }

  const msmedVerdict = msmedApplies
    ? paidWithinS15
      ? `Payment on ${paymentDateISO} is within the s.15 limit, so no s.16 interest arises.`
      : `Payment is ${daysLate} days beyond the s.15 due date of ${due.dueDateISO}, so s.16 compound interest with monthly rests runs at ${S16_BANK_RATE_MULTIPLE} x ${bankRatePercent}% = ${bankRatePercent * S16_BANK_RATE_MULTIPLE}% a year from ${due.interestStartISO}.`
    : `MSMED Act ss.15 and 16 do not apply. ${supplier.reason}`;

  return {
    // gate
    supplierKey: supplier.key,
    supplierLabel: supplier.label,
    supplierShort: supplier.short,
    supplierReason: supplier.reason,
    msmedApplies,
    s43bhApplies,
    s43bhInForce,
    msmedVerdict,
    s43bhVerdict,

    // section 15
    amount,
    invoiceDateISO,
    paymentDateISO,
    hasWrittenAgreement: Boolean(hasWrittenAgreement),
    agreedCreditDays: hasWrittenAgreement ? Math.round(agreedCreditDays) : null,
    statutoryLimitDays: due.limitDays,
    agreedPeriodCapped: due.capped,
    statutoryBasis: due.basis,
    dueDateISO: due.dueDateISO,
    interestStartISO: due.interestStartISO,
    daysFromInvoiceToPayment: span.days,
    daysLate,
    paidWithinS15,

    // section 16
    bankRatePercent,
    interestAnnualPercent: interestResult.annualPercent,
    interestRestRatePercent: interestResult.restRatePercent,
    completedRests: interestResult.completedRests,
    residualDays: interestResult.residualDays,
    section16Interest: interestResult.interest,
    totalPayableToSupplier: amount + interestResult.interest,
    interestDeductible: false,
    preTaxCostOfInterest,

    // section 43B(h)
    accrualFYLabel: accrualFY.label,
    accrualFYEndISO: accrualFY.endISO,
    accrualAssessmentYearLabel: accrualFY.assessmentYearLabel,
    paymentFYLabel: paymentFY.label,
    paymentFYEndISO: paymentFY.endISO,
    deductionYearLabel: deductionDeferred ? paymentFY.label : accrualFY.label,
    deductionDeferred,
    disallowedAmount,
    yearsDeferred,
    deferralDays,
    marginalTaxPercent,
    costOfCapitalPercent,
    extraTaxInAccrualYear,
    timeValueCost,

    // combined
    totalCostOfDelay,
    costAsPercentOfInvoice,
  };
}
