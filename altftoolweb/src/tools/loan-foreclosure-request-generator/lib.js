/**
 * Loan foreclosure (pre-closure) — cost estimate and request letter.
 *
 * Rules used:
 *  - RBI has directed banks not to levy foreclosure charges or pre-payment
 *    penalties on FLOATING RATE TERM LOANS sanctioned to INDIVIDUAL borrowers.
 *    The bar started with home loans (RBI circular of 5 June 2012) and was
 *    extended to all floating rate term loans to individuals by the circular of
 *    2 May 2014, with the NBFC position aligned subsequently. The RBI
 *    (Pre-payment Charges on Loans) Directions, 2025 carry the same principle
 *    forward for loans sanctioned or renewed on or after 1 January 2026.
 *    FIXED rate loans, and loans to non-individual borrowers, are not covered —
 *    those typically attract 2% to 5% of the outstanding principal.
 *  - GST is charged on the foreclosure fee itself (a service), at the standard
 *    18% rate; it is not charged on the principal or on interest.
 *  - RBI circular of 13 September 2023 requires original property documents to
 *    be released and any registered charge removed within 30 days of the
 *    foreclosure payment.
 *  - EMI is a reducing-balance annuity: EMI = P·i·(1+i)^n / ((1+i)^n − 1),
 *    where i is the monthly rate and n the number of instalments.
 *
 * Pure functions only — dates are supplied by the caller.
 */

/** Standard GST rate applied to a foreclosure fee. */
export const GST_RATE_PCT = 18;

/** Interest accrual between instalments is reckoned on a 365-day year. */
export const DAYS_IN_YEAR = 365;

/** Typical fixed-rate foreclosure fee band, as a percentage of principal outstanding. */
export const TYPICAL_CHARGE_RANGE_PCT = [2, 5];

/** RBI circular of 13 September 2023 — days to release documents after closure. */
export const DOCUMENT_RELEASE_DAYS = 30;

export const RATE_TYPES = [
  { key: "floating", label: "Floating rate" },
  { key: "fixed", label: "Fixed rate" },
];

export const BORROWER_TYPES = [
  {
    key: "individualNonBusiness",
    label: "Individual, loan taken for a non-business purpose",
    exemptOnFloating: true,
  },
  {
    key: "individualBusiness",
    label: "Individual, loan taken for a business purpose",
    exemptOnFloating: false,
  },
  {
    key: "nonIndividual",
    label: "Company, firm, LLP or other non-individual borrower",
    exemptOnFloating: false,
  },
];

export const LOAN_TYPES = [
  "Home loan",
  "Loan against property",
  "Vehicle loan",
  "Personal loan",
  "Education loan",
  "Business loan",
  "Gold loan",
];

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

/**
 * Reducing-balance EMI. Handles the zero-interest case.
 * @returns {number} the monthly instalment, or 0 for impossible input.
 */
export function computeEmi({ principal, annualRate, months } = {}) {
  const p = Number(principal);
  const rate = Number(annualRate);
  const n = Math.trunc(Number(months));
  if (!Number.isFinite(p) || p <= 0) return 0;
  if (!Number.isFinite(n) || n <= 0) return 0;
  if (!Number.isFinite(rate) || rate < 0) return 0;
  const i = rate / 12 / 100;
  if (i === 0) return round2(p / n);
  const growth = Math.pow(1 + i, n);
  return round2((p * i * growth) / (growth - 1));
}

/**
 * Full foreclosure cost, the charge exemption check and the saving from closing early.
 *
 * @param {object} input
 * @param {number} input.outstanding      Principal outstanding today.
 * @param {number} input.annualRate       Interest rate, % per year.
 * @param {number} input.remainingMonths  Instalments still to run.
 * @param {number} [input.emi]            Your actual EMI; computed if left at 0.
 * @param {string} input.rateType         "floating" or "fixed".
 * @param {string} input.borrowerType     Key from BORROWER_TYPES.
 * @param {number} input.chargePct        Foreclosure fee, % of principal outstanding.
 * @param {number} [input.gstPct]         GST on the fee, default 18.
 * @param {number} [input.daysSinceLastEmi] Days of interest accrued since the last instalment.
 * @param {number} [input.otherCharges]   Documentation, stamp or courier charges.
 */
export function computeForeclosure({
  outstanding,
  annualRate,
  remainingMonths,
  emi = 0,
  rateType = "floating",
  borrowerType = "individualNonBusiness",
  chargePct = 0,
  gstPct = GST_RATE_PCT,
  daysSinceLastEmi = 0,
  otherCharges = 0,
} = {}) {
  const principal = Number(outstanding);
  if (!Number.isFinite(principal)) return { error: "Enter the outstanding principal as a number." };
  if (principal <= 0) return { error: "Outstanding principal must be greater than zero." };
  if (principal > 1e11) return { error: "Enter an outstanding principal below ten thousand crore." };

  const rate = Number(annualRate);
  if (!Number.isFinite(rate)) return { error: "Enter the interest rate as a number." };
  if (rate < 0 || rate > 60) return { error: "Interest rate should be between 0% and 60% per year." };

  const months = Math.trunc(Number(remainingMonths));
  if (!Number.isFinite(months)) return { error: "Enter the remaining tenure as a whole number." };
  if (months <= 0) return { error: "Remaining tenure must be at least one month." };
  if (months > 480) return { error: "Remaining tenure above 480 months is not realistic." };

  const type = RATE_TYPES.find((item) => item.key === rateType);
  if (!type) return { error: "Choose whether the loan is on a floating or fixed rate." };

  const borrower = BORROWER_TYPES.find((item) => item.key === borrowerType);
  if (!borrower) return { error: "Choose the type of borrower." };

  const typedChargePct = Number(chargePct);
  if (!Number.isFinite(typedChargePct) || typedChargePct < 0 || typedChargePct > 20) {
    return { error: "Foreclosure charge must be between 0% and 20% of the outstanding principal." };
  }

  const gst = Number(gstPct);
  if (!Number.isFinite(gst) || gst < 0 || gst > 40) {
    return { error: "GST on the fee must be between 0% and 40%." };
  }

  const accrualDays = Math.trunc(Number(daysSinceLastEmi));
  if (!Number.isFinite(accrualDays) || accrualDays < 0 || accrualDays > 366) {
    return { error: "Days since the last instalment must be between 0 and 366." };
  }

  const extras = Number(otherCharges);
  if (!Number.isFinite(extras) || extras < 0) {
    return { error: "Other charges cannot be negative." };
  }

  const instalment = Number(emi) > 0 ? Number(emi) : computeEmi({ principal, annualRate: rate, months });
  if (!(instalment > 0)) return { error: "Could not work out an EMI from these figures." };

  const chargeExempt = type.key === "floating" && borrower.exemptOnFloating;
  const effectiveChargePct = chargeExempt ? 0 : typedChargePct;

  const foreclosureCharge = round2((principal * effectiveChargePct) / 100);
  const gstOnCharge = round2((foreclosureCharge * gst) / 100);
  const accruedInterest = round2((principal * (rate / 100) * accrualDays) / DAYS_IN_YEAR);

  const totalPayable = round2(
    principal + accruedInterest + foreclosureCharge + gstOnCharge + extras,
  );
  const costOfClosing = round2(foreclosureCharge + gstOnCharge + extras);

  const remainingPayments = round2(instalment * months);
  const remainingInterest = round2(Math.max(0, remainingPayments - principal));
  const netSaving = round2(remainingInterest - accruedInterest - costOfClosing);

  return {
    principal: round2(principal),
    annualRate: rate,
    remainingMonths: months,
    emi: round2(instalment),
    chargeExempt,
    exemptReason: chargeExempt
      ? "RBI bars foreclosure and pre-payment charges on floating rate term loans to individual borrowers for non-business purposes."
      : type.key === "fixed"
        ? "Fixed rate loans are outside the RBI bar, so the lender may levy its contractual fee."
        : "The bar covers individual borrowers for non-business purposes; this loan falls outside it.",
    effectiveChargePct,
    foreclosureCharge,
    gstPct: gst,
    gstOnCharge,
    accruedInterest,
    accrualDays,
    otherCharges: round2(extras),
    costOfClosing,
    totalPayable,
    remainingPayments,
    remainingInterest,
    netSaving,
    worthClosing: netSaving > 0,
    breakEvenMonths:
      instalment > 0 ? Math.ceil(costOfClosing / instalment) : null,
    documentReleaseDays: DOCUMENT_RELEASE_DAYS,
  };
}

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

const isLeapYear = (year) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

const daysInMonth = (year, month) =>
  [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];

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

/** "2026-07-28" -> "28 July 2026"; empty string when the date is not valid. */
export function longDate(text) {
  const match = ISO_RE.exec(String(text || "").trim());
  if (!match) return "";
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12) return "";
  if (day < 1 || day > daysInMonth(year, month)) return "";
  return `${day} ${MONTH_NAMES[month - 1]} ${year}`;
}

const rupees = (value) =>
  `Rs. ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value)}`;

/**
 * Build the foreclosure request letter.
 * @returns {{letter: string, figures: object, wordCount: number}} or { error }
 */
export function buildForeclosureRequest(input = {}) {
  const figures = computeForeclosure(input);
  if (figures.error) return { error: figures.error };

  const {
    borrowerName = "",
    borrowerAddress = "",
    borrowerPhone = "",
    borrowerEmail = "",
    lenderName = "",
    branchName = "",
    lenderAddress = "",
    loanType = "Home loan",
    accountNumber = "",
    sanctionDate = "",
    proposedClosureDate = "",
    paymentMode = "NEFT / RTGS from my salary account",
    fundSource = "own savings and maturity of a fixed deposit",
    letterDate = "",
    place = "",
  } = input;

  const letter = [
    [place, letterDate ? longDate(letterDate) : ""].filter(Boolean).join(", "),
    "",
    "To,",
    "The Branch Manager",
    lenderName || "[Lender's name]",
    branchName ? `${branchName} branch` : null,
    lenderAddress || null,
    "",
    `Subject: Request for a foreclosure statement and pre-closure of ${loanType} account ${accountNumber || "[account number]"}`,
    "",
    "Dear Sir / Madam,",
    "",
    `I hold the ${loanType.toLowerCase()} account referred to above${sanctionDate ? `, sanctioned on ${longDate(sanctionDate)}` : ""}. I wish to foreclose the loan${proposedClosureDate ? ` on or around ${longDate(proposedClosureDate)}` : ""} and request you to issue a foreclosure statement.`,
    "",
    "Please confirm, in writing and with a dated breakup:",
    "1. The exact principal outstanding as on the date of closure.",
    "2. Interest accrued from the last instalment to the date of closure.",
    "3. Foreclosure or pre-payment charges, if any, with the clause of the sanction letter that authorises them.",
    "4. GST and any other statutory levy on those charges.",
    "5. The total amount payable and the account into which it must be remitted.",
    "",
    figures.chargeExempt
      ? "I note that the Reserve Bank of India has directed lenders not to levy foreclosure charges or pre-payment penalties on floating rate term loans sanctioned to individual borrowers for non-business purposes. If any such charge is proposed on my account, please identify the specific provision you rely on."
      : `I understand that a foreclosure charge may apply to this account. On my own working, a charge of ${figures.effectiveChargePct}% of the principal outstanding would come to ${rupees(figures.foreclosureCharge)}, with GST of ${rupees(figures.gstOnCharge)}. Please confirm the exact figures.`,
    "",
    `On my estimate the total payable would be about ${rupees(figures.totalPayable)}, made up of principal ${rupees(figures.principal)}, accrued interest ${rupees(figures.accruedInterest)} for ${figures.accrualDays} day(s), charges ${rupees(figures.foreclosureCharge)}, GST ${rupees(figures.gstOnCharge)} and other charges ${rupees(figures.otherCharges)}. I will pay by ${paymentMode}. The funds come from ${fundSource}.`,
    "",
    "On receipt of the full amount, please arrange to:",
    "a. Issue a no dues certificate and a loan closure statement showing a nil balance.",
    `b. Return all original property and security documents and remove any charge registered with a registry, within ${DOCUMENT_RELEASE_DAYS} days of the payment, as required by the Reserve Bank of India circular dated 13 September 2023.`,
    "c. Cancel all standing instructions, ECS and NACH mandates on this account.",
    "d. Report the closure to all credit information companies in the next reporting cycle.",
    "",
    "Please treat this as my formal request. I would be grateful for the foreclosure statement and an acknowledged copy of this letter.",
    "",
    "Yours faithfully,",
    "",
    "",
    borrowerName || "[Your name]",
    borrowerAddress || null,
    [borrowerPhone ? `Phone: ${borrowerPhone}` : "", borrowerEmail ? `Email: ${borrowerEmail}` : ""]
      .filter(Boolean)
      .join(" · "),
  ]
    .filter((item) => item !== null)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return {
    letter,
    figures,
    wordCount: letter.split(/\s+/).filter(Boolean).length,
    characterCount: letter.length,
  };
}
