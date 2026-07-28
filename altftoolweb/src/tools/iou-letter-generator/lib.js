/**
 * IOU (acknowledgement of debt) — figures and letter text.
 *
 * Legal backbone (India):
 *  - Limitation Act, 1963, Articles 19 and 21: a suit for money lent must be
 *    filed within THREE YEARS of the date the loan was made (or, for a loan
 *    payable on demand, from when the loan was made).
 *  - Limitation Act, 1963, s.18: an acknowledgement of liability made in
 *    writing and signed by the debtor BEFORE the existing period expires
 *    restarts the clock — a fresh three-year period runs from the date the
 *    acknowledgement was signed. That is the whole point of an IOU.
 *  - Negotiable Instruments Act, 1881, s.4: a promissory note contains an
 *    UNCONDITIONAL UNDERTAKING to pay. A bare acknowledgement is evidence of
 *    the debt, not a negotiable instrument, and is stamped differently —
 *    Article 1 of Schedule I to the Indian Stamp Act, 1899 charges only a
 *    nominal duty on an acknowledgement of a debt exceeding twenty rupees,
 *    while Article 49 charges ad valorem duty on a promissory note.
 *  - Income-tax Act, 1961, s.269SS and s.269T: a loan or deposit of Rs 20,000
 *    or more must not be accepted or repaid in cash; s.271D and s.271E impose
 *    a penalty equal to the amount taken or repaid in breach.
 *  - Interest Act, 1978, s.3: where no rate is agreed, a court may allow
 *    interest at the current rate from the date the cause of action arose.
 *
 * Every function is pure — dates are supplied by the caller.
 */

/** Limitation Act, 1963, Articles 19 and 21 — three years for money lent. */
export const LIMITATION_YEARS_MONEY_LENT = 3;

/** Income-tax Act, 1961, s.269SS / s.269T — cash loan or repayment ceiling. */
export const CASH_LOAN_LIMIT = 20000;

/** Indian Stamp Act, 1899, Schedule I, Article 1 — applies above this amount. */
export const STAMP_DUTY_THRESHOLD = 20;

/** Simple interest is reckoned on a 365-day year here. */
export const DAYS_IN_YEAR = 365;

export const PAYMENT_MODES = [
  { key: "bankTransfer", label: "Bank transfer (NEFT / RTGS / IMPS)", cash: false },
  { key: "upi", label: "UPI", cash: false },
  { key: "cheque", label: "Cheque", cash: false },
  { key: "cash", label: "Cash", cash: true },
  { key: "demandDraft", label: "Demand draft", cash: false },
];

export const REPAYMENT_PLANS = [
  { key: "lumpSum", label: "One lump sum on the due date" },
  { key: "monthly", label: "Equal monthly instalments" },
  { key: "onDemand", label: "On demand by the lender" },
];

export const RATE_BASES = [
  { key: "perYear", label: "% per year", multiplier: 1 },
  { key: "perMonth", label: "% per month", multiplier: 12 },
];

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_MS = 86400000;

const isLeapYear = (year) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

const daysInMonth = (year, month) =>
  [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];

/** Parse "YYYY-MM-DD"; null when it is not a real calendar date. */
export function parseISODate(text) {
  const match = ISO_RE.exec(String(text || "").trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1900 || year > 2200 || month < 1 || month > 12) return null;
  if (day < 1 || day > daysInMonth(year, month)) return null;
  return { year, month, day };
}

const utc = ({ year, month, day }) => Date.UTC(year, month - 1, day);
const iso = ({ year, month, day }) =>
  `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

/** Whole days between two ISO dates (b - a). */
export function diffDays(a, b) {
  const first = parseISODate(a);
  const second = parseISODate(b);
  if (!first || !second) return null;
  return Math.round((utc(second) - utc(first)) / DAY_MS);
}

/** Add calendar years, clamping 29 February to 28 February in a common year. */
export function addYears(date, count) {
  const parts = parseISODate(date);
  if (!parts || !Number.isFinite(count)) return null;
  const year = parts.year + Math.trunc(count);
  const day = Math.min(parts.day, daysInMonth(year, parts.month));
  return iso({ year, month: parts.month, day });
}

const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];
const TENS = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

const twoDigits = (value) => {
  if (value < 20) return ONES[value];
  const tens = Math.floor(value / 10);
  const ones = value % 10;
  return ones ? `${TENS[tens]} ${ONES[ones]}` : TENS[tens];
};

/**
 * Whole rupees to words in the Indian numbering system (crore / lakh / thousand).
 * Handles 0 to 99,99,99,99,999.
 */
export function numberToIndianWords(value) {
  const amount = Math.trunc(Math.abs(Number(value)));
  if (!Number.isFinite(amount)) return "";
  if (amount === 0) return "Zero";

  const parts = [];
  const groups = [
    [10000000, "Crore"],
    [100000, "Lakh"],
    [1000, "Thousand"],
    [100, "Hundred"],
  ];

  let remainder = amount;
  for (const [divisor, name] of groups) {
    const count = Math.floor(remainder / divisor);
    if (count > 0) {
      const head =
        divisor === 10000000 && count > 99 ? numberToIndianWords(count) : twoDigits(count);
      parts.push(`${head} ${name}`);
      remainder %= divisor;
    }
  }
  if (remainder > 0) parts.push(twoDigits(remainder));
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

/** Rupees and paise written out for the body of the document. */
export function rupeesInWords(value) {
  const amount = Math.abs(Number(value));
  if (!Number.isFinite(amount)) return "";
  const whole = Math.floor(amount);
  const paise = Math.round((amount - whole) * 100);
  const base = `Rupees ${numberToIndianWords(whole)}`;
  return paise > 0 ? `${base} and ${numberToIndianWords(paise)} Paise only` : `${base} only`;
}

/**
 * Interest, totals, limitation expiry and the cash-mode check.
 * @param {object} input
 * @param {number} input.principal      Amount lent, in rupees.
 * @param {number} input.rate           Interest rate as typed.
 * @param {string} input.rateBasis      "perYear" or "perMonth".
 * @param {string} input.loanDate       ISO date the money changed hands.
 * @param {string} input.dueDate        ISO date repayment falls due.
 * @param {string} input.acknowledgementDate ISO date this IOU is signed.
 * @param {string} input.paymentMode    Key from PAYMENT_MODES.
 * @param {number} [input.instalments]  Number of instalments, when applicable.
 */
export function computeIouFigures({
  principal,
  rate = 0,
  rateBasis = "perYear",
  loanDate,
  dueDate,
  acknowledgementDate,
  paymentMode = "bankTransfer",
  instalments = 1,
} = {}) {
  const amount = Number(principal);
  if (!Number.isFinite(amount)) return { error: "Enter the amount lent as a number." };
  if (amount <= 0) return { error: "The amount lent must be greater than zero." };
  if (amount > 1e12) return { error: "Enter an amount below one lakh crore rupees." };

  const basis = RATE_BASES.find((item) => item.key === rateBasis);
  if (!basis) return { error: "Choose whether the rate is per year or per month." };

  const typedRate = Number(rate);
  if (!Number.isFinite(typedRate)) return { error: "Enter the interest rate as a number." };
  if (typedRate < 0) return { error: "The interest rate cannot be negative." };
  const annualRate = typedRate * basis.multiplier;
  if (annualRate > 60) {
    return { error: "An effective rate above 60% per year is not a realistic private loan." };
  }

  if (!parseISODate(loanDate)) return { error: "Enter a valid date on which the money was lent." };
  if (!parseISODate(dueDate)) return { error: "Enter a valid repayment due date." };
  if (!parseISODate(acknowledgementDate)) {
    return { error: "Enter a valid date for signing this acknowledgement." };
  }

  const termDays = diffDays(loanDate, dueDate);
  if (termDays < 0) return { error: "The repayment date cannot fall before the loan date." };
  if (termDays > 36500) return { error: "Keep the loan term under 100 years." };

  const ackFromLoan = diffDays(loanDate, acknowledgementDate);
  if (ackFromLoan < 0) {
    return { error: "The acknowledgement cannot be signed before the money was lent." };
  }

  const mode = PAYMENT_MODES.find((item) => item.key === paymentMode);
  if (!mode) return { error: "Choose how the money was paid over." };

  const count = Math.trunc(Number(instalments));
  if (!Number.isFinite(count) || count < 1 || count > 360) {
    return { error: "Instalments must be a whole number between 1 and 360." };
  }

  const interest = (amount * (annualRate / 100) * termDays) / DAYS_IN_YEAR;
  const total = amount + interest;

  // Limitation Act s.18: a fresh three-year period runs from the acknowledgement.
  const originalLimitation = addYears(loanDate, LIMITATION_YEARS_MONEY_LENT);
  const freshLimitation = addYears(acknowledgementDate, LIMITATION_YEARS_MONEY_LENT);
  const acknowledgementInTime = diffDays(acknowledgementDate, originalLimitation) >= 0;

  const cashBreach = mode.cash && amount >= CASH_LOAN_LIMIT;

  return {
    principal: Math.round(amount * 100) / 100,
    principalWords: rupeesInWords(amount),
    annualRate: Math.round(annualRate * 1000) / 1000,
    termDays,
    interest: Math.round(interest * 100) / 100,
    total: Math.round(total * 100) / 100,
    totalWords: rupeesInWords(Math.round(total)),
    instalments: count,
    instalmentAmount: Math.round((total / count) * 100) / 100,
    originalLimitation,
    freshLimitation,
    acknowledgementInTime,
    paymentMode: mode.label,
    cashBreach,
    cashLimit: CASH_LOAN_LIMIT,
    stampable: amount > STAMP_DUTY_THRESHOLD,
  };
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const longDate = (date) => {
  const parts = parseISODate(date);
  if (!parts) return "";
  return `${parts.day} ${MONTH_NAMES[parts.month - 1]} ${parts.year}`;
};

const rupees = (value) =>
  `Rs. ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value)}`;

/**
 * Build the acknowledgement of debt.
 * @returns {{document: string, figures: object, wordCount: number}} or { error }
 */
export function buildIouLetter(input = {}) {
  const figures = computeIouFigures(input);
  if (figures.error) return { error: figures.error };

  const {
    borrowerName = "",
    borrowerParent = "",
    borrowerAddress = "",
    lenderName = "",
    lenderAddress = "",
    loanDate = "",
    dueDate = "",
    acknowledgementDate = "",
    place = "",
    purpose = "",
    reference = "",
    repaymentPlan = "lumpSum",
    witnessOne = "",
    witnessTwo = "",
  } = input;

  const plan = REPAYMENT_PLANS.find((item) => item.key === repaymentPlan);
  if (!plan) return { error: "Choose how the loan will be repaid." };

  const repaymentClause = (() => {
    if (repaymentPlan === "monthly") {
      return `I shall repay the said sum together with interest in ${figures.instalments} equal monthly instalments of approximately ${rupees(figures.instalmentAmount)} each, the last instalment falling due on ${longDate(dueDate)}.`;
    }
    if (repaymentPlan === "onDemand") {
      return `I shall repay the said sum together with interest on demand by the lender, and in any event not later than ${longDate(dueDate)}.`;
    }
    return `I shall repay the said sum together with interest in one lump sum of ${rupees(figures.total)} (${figures.totalWords}) on or before ${longDate(dueDate)}.`;
  })();

  const interestClause =
    figures.annualRate > 0
      ? `The said sum carries simple interest at ${figures.annualRate}% per annum, which over the ${figures.termDays} days to the due date amounts to ${rupees(figures.interest)}, making a total of ${rupees(figures.total)} (${figures.totalWords}).`
      : "The said sum is interest free. If it is not repaid on the due date, the lender may claim interest at the rate a court considers reasonable under section 3 of the Interest Act, 1978.";

  const document = [
    "ACKNOWLEDGEMENT OF DEBT (IOU)",
    "",
    [place, acknowledgementDate ? longDate(acknowledgementDate) : ""].filter(Boolean).join(", "),
    "",
    `I, ${borrowerName || "[Borrower's full name]"}${borrowerParent ? `, ${borrowerParent}` : ""}, resident of ${borrowerAddress || "[Borrower's address]"}, do hereby acknowledge as follows.`,
    "",
    `1. On ${longDate(loanDate) || "[date]"} I received from ${lenderName || "[Lender's full name]"}, resident of ${lenderAddress || "[Lender's address]"}, a sum of ${rupees(figures.principal)} (${figures.principalWords}) by way of ${figures.paymentMode}${reference ? ` (reference: ${reference})` : ""}.`,
    purpose ? `2. The said sum was taken by me for the following purpose: ${purpose}.` : null,
    `${purpose ? "3" : "2"}. I confirm that the said sum remains due and payable by me to the lender as on ${longDate(acknowledgementDate) || "[date]"}, and that no part of it has been repaid except as recorded above.`,
    `${purpose ? "4" : "3"}. ${interestClause}`,
    `${purpose ? "5" : "4"}. ${repaymentClause}`,
    `${purpose ? "6" : "5"}. This writing is an acknowledgement of liability within the meaning of section 18 of the Limitation Act, 1963.${
      figures.acknowledgementInTime
        ? " It is signed before the expiry of the subsisting period of limitation, so a fresh period of limitation runs from the date of my signature below."
        : " The original three-year period for this debt appears to have expired on " +
          `${longDate(figures.originalLimitation)}; section 18 revives limitation only where the acknowledgement is signed before that expiry, so the parties should take legal advice on the effect of this document.`
    } It is not a promissory note and contains no unconditional undertaking within section 4 of the Negotiable Instruments Act, 1881.`,
    "",
    "Signed by the borrower:",
    "",
    "____________________________",
    borrowerName || "[Borrower's full name]",
    "(affix a revenue stamp and sign across it)",
    "",
    "Witnesses:",
    `1. ${witnessOne || "____________________________"}`,
    `2. ${witnessTwo || "____________________________"}`,
    "",
    "Received acknowledgement:",
    "",
    "____________________________",
    lenderName || "[Lender's full name]",
  ]
    .filter((item) => item !== null)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return {
    document,
    figures,
    wordCount: document.split(/\s+/).filter(Boolean).length,
    characterCount: document.length,
  };
}
