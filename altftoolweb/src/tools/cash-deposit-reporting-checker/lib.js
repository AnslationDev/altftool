/**
 * Cash deposit / withdrawal reporting thresholds for Indian bank customers.
 *
 * Every constant below is a statutory threshold, with its source named:
 *
 *  A. Rule 114E of the Income-tax Rules, 1962 — Statement of Financial Transactions
 *     (SFT). Banks, post offices, co-operative banks and card issuers file these and
 *     the entries then surface in the taxpayer's Annual Information Statement (AIS)
 *     and Form 26AS. The reporting duty is the bank's; the taxpayer's exposure is
 *     that the entry must reconcile with the return filed.
 *
 *  B. Rule 114B of the Income-tax Rules, 1962 — transactions where PAN must be quoted
 *     (Form 60 where the person has no PAN).
 *
 *  C. Rule 114BA (inserted by Notification No. 53/2022 dated 10 May 2022, effective
 *     26 May 2022) read with section 139A(1)(vii) — transactions that make obtaining
 *     and quoting a PAN mandatory.
 *
 *  D. Section 194N of the Income-tax Act, 1961 — TDS on cash withdrawals.
 *
 *  E. Section 269ST of the Income-tax Act, 1961 with the penalty in section 271DA.
 *
 * Nothing here is tax advice; it identifies which reporting rules a set of amounts
 * crosses so the figures can be reconciled before a return is filed.
 */

/* ---------- A. Rule 114E — Statement of Financial Transactions ---------- */

/**
 * Rule 114E(2) item 2: cash deposits aggregating ten lakh rupees or more in a
 * financial year, in one or more accounts of a person other than a current account
 * and a time deposit. Reported by banks, co-operative banks and the post office.
 */
export const SFT_SAVINGS_CASH_DEPOSIT_LIMIT = 1000000;

/**
 * Rule 114E(2) item 3: cash deposits or cash withdrawals (including through bearer
 * cheque) aggregating fifty lakh rupees or more in a financial year, in one or more
 * current accounts of a person.
 */
export const SFT_CURRENT_ACCOUNT_CASH_LIMIT = 5000000;

/**
 * Rule 114E(2) item 4: one or more time deposits (other than a renewal of an existing
 * time deposit) of a person aggregating ten lakh rupees or more in a financial year.
 * Note this one is not restricted to cash — any mode counts.
 */
export const SFT_TIME_DEPOSIT_LIMIT = 1000000;

/**
 * Rule 114E(2) item 1: payment in cash aggregating ten lakh rupees or more in a
 * financial year for the purchase of bank drafts, pay orders, banker's cheques or
 * pre-paid instruments issued by the Reserve Bank of India.
 */
export const SFT_DRAFT_OR_PREPAID_CASH_LIMIT = 1000000;

/** Rule 114E(2) item 5(a): credit card bill payments of one lakh rupees or more in cash. */
export const SFT_CREDIT_CARD_CASH_LIMIT = 100000;

/** Rule 114E(2) item 5(b): credit card bill payments of ten lakh rupees or more by any other mode. */
export const SFT_CREDIT_CARD_OTHER_MODE_LIMIT = 1000000;

/* ---------- B & C. PAN quoting and mandatory PAN ---------- */

/**
 * Rule 114B: PAN must be quoted for a cash deposit EXCEEDING fifty thousand rupees
 * with a bank or post office during any one day, and for cash purchase of bank
 * drafts / pay orders / banker's cheques aggregating fifty thousand rupees or more
 * in a day. Where the person has no PAN, a Form 60 declaration is filed instead.
 */
export const PAN_QUOTING_CASH_PER_DAY = 50000;

/**
 * Rule 114BA: a person must obtain a PAN if cash deposits, or cash withdrawals,
 * aggregate to twenty lakh rupees or more in a financial year across one or more
 * accounts with a bank, co-operative bank or post office. Opening a current account
 * or a cash credit account also triggers it, irrespective of amount.
 */
export const MANDATORY_PAN_ANNUAL_CASH = 2000000;

/* ---------- D. Section 194N — TDS on cash withdrawals ---------- */

/** Section 194N base threshold: withdrawals above one crore in a financial year. */
export const SECTION_194N_LIMIT = 10000000;

/**
 * Finance Act 2023 raised the section 194N threshold to three crore rupees for a
 * co-operative society, with effect from 1 April 2023.
 */
export const SECTION_194N_LIMIT_CO_OPERATIVE = 30000000;

/**
 * First proviso to section 194N: where the recipient has not filed returns of income
 * for all three assessment years relevant to the three previous years for which the
 * due date under section 139(1) has expired, TDS starts at twenty lakh rupees.
 */
export const SECTION_194N_NON_FILER_LIMIT = 2000000;

/** Section 194N rate on the amount above the applicable threshold. */
export const SECTION_194N_RATE_PERCENT = 2;

/** Section 194N higher rate for a non-filer, on the slice above one crore rupees. */
export const SECTION_194N_NON_FILER_HIGH_RATE_PERCENT = 5;

/* ---------- E. Section 269ST ---------- */

/**
 * Section 269ST: no person shall receive two lakh rupees or more in cash from a
 * person in a day, in respect of a single transaction, or in respect of transactions
 * relating to one event or occasion. Section 271DA levies a penalty on the receiver
 * equal to the amount received. Withdrawals from one's own bank account are excluded.
 */
export const SECTION_269ST_LIMIT = 200000;

/** Penalty under section 271DA equals 100% of the amount received in breach of 269ST. */
export const SECTION_271DA_PENALTY_PERCENT = 100;

const round2 = (value) => Math.round(value * 100) / 100;

const isNonNegative = (value) => Number.isFinite(value) && value >= 0;

/**
 * Section 194N TDS on cash withdrawals for the financial year.
 *
 * @param {number} withdrawals  Aggregate cash withdrawn in the FY, in INR.
 * @param {boolean} filedItr    True if returns were filed for the three relevant years.
 * @param {boolean} isCoOperative True if the account holder is a co-operative society.
 * @returns {{ threshold: number, taxable: number, tds: number, rateNote: string }}
 */
export function computeSection194nTds(withdrawals, filedItr, isCoOperative) {
  const base = isCoOperative ? SECTION_194N_LIMIT_CO_OPERATIVE : SECTION_194N_LIMIT;

  if (filedItr) {
    const taxable = Math.max(0, withdrawals - base);
    return {
      threshold: base,
      taxable: round2(taxable),
      tds: round2((taxable * SECTION_194N_RATE_PERCENT) / 100),
      rateNote: `${SECTION_194N_RATE_PERCENT}% on the amount above the threshold`,
    };
  }

  // Non-filer: 2% between the twenty lakh floor and one crore, 5% above one crore.
  const lowerSlice = Math.max(
    0,
    Math.min(withdrawals, SECTION_194N_LIMIT) - SECTION_194N_NON_FILER_LIMIT,
  );
  const upperSlice = Math.max(0, withdrawals - SECTION_194N_LIMIT);
  const tds =
    (lowerSlice * SECTION_194N_RATE_PERCENT) / 100 +
    (upperSlice * SECTION_194N_NON_FILER_HIGH_RATE_PERCENT) / 100;

  return {
    threshold: SECTION_194N_NON_FILER_LIMIT,
    taxable: round2(lowerSlice + upperSlice),
    tds: round2(tds),
    rateNote: `${SECTION_194N_RATE_PERCENT}% from ₹20,00,000 to ₹1,00,00,000 and ${SECTION_194N_NON_FILER_HIGH_RATE_PERCENT}% above ₹1,00,00,000`,
  };
}

/**
 * Check a year's cash banking activity against every reporting threshold above.
 *
 * All amounts are for one financial year, in INR, and default to zero.
 *
 * @returns {object} result object, or { error } when an input is not usable.
 */
export function checkCashReportingThresholds({
  savingsCashDeposits = 0,
  currentAccountCash = 0,
  timeDeposits = 0,
  draftsPurchasedInCash = 0,
  creditCardCash = 0,
  creditCardOtherMode = 0,
  cashWithdrawals = 0,
  largestSingleDayCashDeposit = 0,
  largestSingleCashReceipt = 0,
  filedItr = true,
  isCoOperative = false,
} = {}) {
  const amounts = {
    savingsCashDeposits: Number(savingsCashDeposits),
    currentAccountCash: Number(currentAccountCash),
    timeDeposits: Number(timeDeposits),
    draftsPurchasedInCash: Number(draftsPurchasedInCash),
    creditCardCash: Number(creditCardCash),
    creditCardOtherMode: Number(creditCardOtherMode),
    cashWithdrawals: Number(cashWithdrawals),
    largestSingleDayCashDeposit: Number(largestSingleDayCashDeposit),
    largestSingleCashReceipt: Number(largestSingleCashReceipt),
  };

  const values = Object.values(amounts);
  if (!values.every((value) => Number.isFinite(value))) {
    return { error: "Enter valid numbers — leave a box at 0 if it does not apply." };
  }
  if (!values.every(isNonNegative)) {
    return { error: "Amounts cannot be negative. Use 0 for anything that did not happen." };
  }
  if (values.some((value) => value > 1e13)) {
    return { error: "Amounts above ₹1,00,00,00,00,000 are outside the range of this checker." };
  }
  if (amounts.largestSingleDayCashDeposit > amounts.savingsCashDeposits + amounts.currentAccountCash) {
    return {
      error:
        "The largest single-day cash deposit cannot exceed the total cash deposited for the year.",
    };
  }

  const checks = [
    {
      id: "sft-savings",
      label: "Cash deposits in savings accounts",
      amount: amounts.savingsCashDeposits,
      threshold: SFT_SAVINGS_CASH_DEPOSIT_LIMIT,
      inclusive: true,
      rule: "Rule 114E(2), item 2",
      consequence:
        "Your bank files an SFT return and the deposit total appears in your Annual Information Statement.",
    },
    {
      id: "sft-current",
      label: "Cash deposits and withdrawals in current accounts",
      amount: amounts.currentAccountCash,
      threshold: SFT_CURRENT_ACCOUNT_CASH_LIMIT,
      inclusive: true,
      rule: "Rule 114E(2), item 3",
      consequence:
        "Deposits and withdrawals are added together for this test and reported as one figure.",
    },
    {
      id: "sft-time-deposit",
      label: "Time deposits opened during the year",
      amount: amounts.timeDeposits,
      threshold: SFT_TIME_DEPOSIT_LIMIT,
      inclusive: true,
      rule: "Rule 114E(2), item 4",
      consequence:
        "Counts fresh deposits by any mode, not just cash. Renewals of an existing time deposit are excluded.",
    },
    {
      id: "sft-drafts",
      label: "Bank drafts, pay orders and prepaid instruments bought with cash",
      amount: amounts.draftsPurchasedInCash,
      threshold: SFT_DRAFT_OR_PREPAID_CASH_LIMIT,
      inclusive: true,
      rule: "Rule 114E(2), item 1",
      consequence: "The issuing bank reports the aggregate cash paid for these instruments.",
    },
    {
      id: "sft-card-cash",
      label: "Credit card bills paid in cash",
      amount: amounts.creditCardCash,
      threshold: SFT_CREDIT_CARD_CASH_LIMIT,
      inclusive: true,
      rule: "Rule 114E(2), item 5",
      consequence:
        "Cash card payments have a far lower reporting limit than other modes — one lakh against ten lakh.",
    },
    {
      id: "sft-card-other",
      label: "Credit card bills paid by any other mode",
      amount: amounts.creditCardOtherMode,
      threshold: SFT_CREDIT_CARD_OTHER_MODE_LIMIT,
      inclusive: true,
      rule: "Rule 114E(2), item 5",
      consequence: "The card issuer reports the annual settlement total against your PAN.",
    },
    {
      id: "pan-mandatory-deposits",
      label: "Cash deposits for the year — mandatory PAN test",
      amount: amounts.savingsCashDeposits + amounts.currentAccountCash,
      threshold: MANDATORY_PAN_ANNUAL_CASH,
      inclusive: true,
      rule: "Rule 114BA with section 139A(1)(vii)",
      consequence:
        "You must hold a PAN and quote it; the bank has to collect it at least seven days before the transaction.",
    },
    {
      id: "pan-mandatory-withdrawals",
      label: "Cash withdrawals for the year — mandatory PAN test",
      amount: amounts.cashWithdrawals,
      threshold: MANDATORY_PAN_ANNUAL_CASH,
      inclusive: true,
      rule: "Rule 114BA with section 139A(1)(vii)",
      consequence: "Same rule as deposits — withdrawals are aggregated separately for this test.",
    },
    {
      id: "pan-quoting-day",
      label: "Largest cash deposit in a single day",
      amount: amounts.largestSingleDayCashDeposit,
      threshold: PAN_QUOTING_CASH_PER_DAY,
      inclusive: false,
      rule: "Rule 114B",
      consequence:
        "PAN must be quoted on the pay-in slip, or Form 60 filed if you do not hold a PAN.",
    },
    {
      id: "269st",
      label: "Largest cash sum received from one person in a day",
      amount: amounts.largestSingleCashReceipt,
      threshold: SECTION_269ST_LIMIT,
      inclusive: true,
      rule: "Section 269ST with penalty under section 271DA",
      consequence:
        "This is a prohibition, not a reporting rule. The penalty on the receiver equals the whole amount received.",
    },
  ];

  const evaluated = checks.map((check) => ({
    ...check,
    crossed: check.inclusive ? check.amount >= check.threshold : check.amount > check.threshold,
    shortfall: round2(check.threshold - check.amount),
  }));

  const crossed = evaluated.filter((check) => check.crossed);

  const tds194n = computeSection194nTds(amounts.cashWithdrawals, Boolean(filedItr), Boolean(isCoOperative));

  const breach269st = evaluated.find((check) => check.id === "269st" && check.crossed);
  const penalty269st = breach269st
    ? round2((amounts.largestSingleCashReceipt * SECTION_271DA_PENALTY_PERCENT) / 100)
    : 0;

  const totalCashDeposited = round2(amounts.savingsCashDeposits + amounts.currentAccountCash);

  let headline;
  if (breach269st) {
    headline = "A section 269ST cash-receipt limit is breached — that carries a penalty, not just reporting";
  } else if (crossed.length === 0) {
    headline = "No reporting threshold crossed on these figures";
  } else if (crossed.length === 1) {
    headline = "1 threshold crossed — expect it in your Annual Information Statement";
  } else {
    headline = `${crossed.length} thresholds crossed — reconcile each with your return`;
  }

  return {
    checks: evaluated,
    crossedCount: crossed.length,
    totalChecks: evaluated.length,
    crossedIds: crossed.map((check) => check.id),
    totalCashDeposited,
    cashWithdrawals: amounts.cashWithdrawals,
    tds194n,
    breach269st: Boolean(breach269st),
    penalty269st,
    filedItr: Boolean(filedItr),
    isCoOperative: Boolean(isCoOperative),
    headline,
  };
}

export default checkCashReportingThresholds;
