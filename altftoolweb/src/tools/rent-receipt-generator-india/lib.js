/**
 * Rent receipt generation for Indian HRA claims, with the statutory side-rules.
 *
 * Basis
 *  - CBDT Circular No. 8/2013: an employee claiming HRA exemption must report the landlord's PAN
 *    to the employer where the rent paid during the year exceeds Rs 1,00,000. Where the landlord
 *    has no PAN, a declaration from the landlord is required instead.
 *  - Indian Stamp Act, 1899, Schedule I, Article 53: a receipt for money exceeding Rs 5,000
 *    attracts stamp duty of Re 1, which in practice is the revenue stamp affixed to a cash rent
 *    receipt and signed across by the landlord. A bank transfer leaves its own trail, so a stamp
 *    is not the practice there.
 *  - Section 194-IB: an individual or HUF not subject to tax audit who pays rent of more than
 *    Rs 50,000 for a month or part of a month must deduct TDS at 2% (reduced from 5% with effect
 *    from 1 October 2024). The deduction is made once, in the last month of the tenancy or of the
 *    financial year, is capped at the rent for that last month, is deposited with Form 26QC and is
 *    certified to the landlord in Form 16C.
 */

/** Annual rent above which the landlord's PAN must be reported (Circular 8/2013). */
export const LANDLORD_PAN_RENT_LIMIT = 100000;
/** Receipt value above which Article 53 stamp duty applies. */
export const REVENUE_STAMP_CASH_LIMIT = 5000;
/** Stamp duty payable under Article 53, in rupees. */
export const REVENUE_STAMP_DUTY = 1;
/** Monthly rent above which section 194-IB TDS applies. */
export const TDS_194IB_MONTHLY_LIMIT = 50000;
/** Section 194-IB rate in force from 1 October 2024. */
export const TDS_194IB_RATE = 0.02;
/** Section 206AA rate where the landlord has not given a PAN. */
export const TDS_NO_PAN_RATE = 0.2;
/** Days allowed to deposit Form 26QC after the end of the month of deduction. */
export const FORM_26QC_DAYS = 30;

export const MONTH_NAMES = [
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

/** Longest run of receipts this tool will produce in one go. */
export const MAX_MONTHS = 60;

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
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function twoDigitWords(value) {
  if (value < 20) return ONES[value];
  const tens = Math.floor(value / 10);
  const unit = value % 10;
  return unit === 0 ? TENS[tens] : `${TENS[tens]} ${ONES[unit]}`;
}

function threeDigitWords(value) {
  const hundreds = Math.floor(value / 100);
  const rest = value % 100;
  const parts = [];
  if (hundreds > 0) parts.push(`${ONES[hundreds]} Hundred`);
  if (rest > 0) parts.push(twoDigitWords(rest));
  return parts.join(" ");
}

/**
 * Amount in words using the Indian numbering system (crore, lakh, thousand).
 * Returns "" for anything that is not a finite non-negative number.
 */
export function amountInWords(amount) {
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount < 0) return "";

  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  if (rupees === 0 && paise === 0) return "Rupees Zero Only";

  const crore = Math.floor(rupees / 10000000);
  const lakh = Math.floor((rupees % 10000000) / 100000);
  const thousand = Math.floor((rupees % 100000) / 1000);
  const rest = rupees % 1000;

  const parts = [];
  if (crore > 0) parts.push(`${amountInWordsPlain(crore)} Crore`);
  if (lakh > 0) parts.push(`${twoDigitWords(lakh)} Lakh`);
  if (thousand > 0) parts.push(`${twoDigitWords(thousand)} Thousand`);
  if (rest > 0) parts.push(threeDigitWords(rest));

  const rupeeWords = parts.length > 0 ? `Rupees ${parts.join(" ")}` : "Rupees Zero";
  if (paise > 0) return `${rupeeWords} and ${twoDigitWords(paise)} Paise Only`;
  return `${rupeeWords} Only`;
}

/** Helper for the crore block, which can itself run into lakhs. */
function amountInWordsPlain(value) {
  const lakh = Math.floor(value / 100000);
  const thousand = Math.floor((value % 100000) / 1000);
  const rest = value % 1000;
  const parts = [];
  if (lakh > 0) parts.push(`${twoDigitWords(lakh)} Lakh`);
  if (thousand > 0) parts.push(`${twoDigitWords(thousand)} Thousand`);
  if (rest > 0) parts.push(threeDigitWords(rest));
  return parts.join(" ");
}

/** Days in a month, using the Gregorian leap rule. Month is 1-12. */
export function daysInMonth(year, month) {
  if (month === 2) {
    const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    return leap ? 29 : 28;
  }
  return [1, 3, 5, 7, 8, 10, 12].includes(month) ? 31 : 30;
}

/** Parse a "YYYY-MM" string. Returns null when it is not a real month. */
export function parseYearMonth(value) {
  if (typeof value !== "string") return null;
  const match = value.trim().match(/^(\d{4})-(\d{1,2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (year < 1900 || year > 2200 || month < 1 || month > 12) return null;
  return { year, month };
}

/** Advance a {year, month} by a whole number of months. */
export function addMonths({ year, month }, count) {
  const zeroBased = (year * 12 + (month - 1)) + count;
  return { year: Math.floor(zeroBased / 12), month: (zeroBased % 12) + 1 };
}

const pad = (value) => String(value).padStart(2, "0");

/**
 * Build a run of monthly rent receipts.
 *
 * @param {object} input
 * @param {number} input.monthlyRent
 * @param {string} input.startMonth   "YYYY-MM" — the first month of rent, not today's date.
 * @param {number} input.months       How many monthly receipts to produce.
 * @param {"cash"|"bank"} input.paymentMode
 * @param {string} input.landlordPan  Blank when the landlord has not supplied one.
 * @param {boolean} input.tenantIsIndividual Whether section 194-IB (rather than 194-I) applies.
 */
export function generateRentReceipts({
  monthlyRent,
  startMonth,
  months,
  paymentMode = "cash",
  landlordName = "",
  landlordPan = "",
  landlordAddress = "",
  tenantName = "",
  propertyAddress = "",
  receiptPrefix = "RR",
  tenantIsIndividual = true,
}) {
  if (typeof monthlyRent !== "number" || !Number.isFinite(monthlyRent) || monthlyRent <= 0) {
    return { error: "Monthly rent must be greater than zero." };
  }
  if (typeof months !== "number" || !Number.isInteger(months) || months < 1 || months > MAX_MONTHS) {
    return { error: `Choose between 1 and ${MAX_MONTHS} monthly receipts.` };
  }
  const start = parseYearMonth(startMonth);
  if (!start) {
    return { error: "Pick a valid starting month." };
  }
  if (paymentMode !== "cash" && paymentMode !== "bank") {
    return { error: "Choose whether rent was paid in cash or by bank transfer." };
  }

  const stampRequired = paymentMode === "cash" && monthlyRent > REVENUE_STAMP_CASH_LIMIT;
  const receipts = [];

  for (let index = 0; index < months; index += 1) {
    const period = addMonths(start, index);
    const lastDay = daysInMonth(period.year, period.month);
    receipts.push({
      number: `${receiptPrefix}-${pad(index + 1)}`,
      monthLabel: `${MONTH_NAMES[period.month - 1]} ${period.year}`,
      periodStart: `${period.year}-${pad(period.month)}-01`,
      periodEnd: `${period.year}-${pad(period.month)}-${pad(lastDay)}`,
      issueDate: `${period.year}-${pad(period.month)}-${pad(lastDay)}`,
      amount: monthlyRent,
      amountWords: amountInWords(monthlyRent),
      stampRequired,
    });
  }

  const totalRent = monthlyRent * months;
  // The PAN rule looks at rent for the financial year; with a 12-month run this is the same thing.
  const panRequired = totalRent > LANDLORD_PAN_RENT_LIMIT;
  const panOnFile = typeof landlordPan === "string" && landlordPan.trim().length > 0;

  const tds194IBApplies = tenantIsIndividual && monthlyRent > TDS_194IB_MONTHLY_LIMIT;
  const tdsRate = tds194IBApplies ? (panOnFile ? TDS_194IB_RATE : TDS_NO_PAN_RATE) : 0;
  // Proviso to s.194-IB(2): the deduction cannot exceed the rent for the last month.
  const tdsUncapped = totalRent * tdsRate;
  const tdsAmount = tds194IBApplies ? Math.min(tdsUncapped, monthlyRent) : 0;

  const warnings = [];
  if (panRequired && !panOnFile) {
    warnings.push(
      `Rent of ${Math.round(totalRent)} is above ${LANDLORD_PAN_RENT_LIMIT}, so your employer must be given the landlord's PAN, or a signed declaration if the landlord has none. Without it the HRA exemption can be refused.`,
    );
  }
  if (stampRequired) {
    warnings.push(
      `Each cash receipt is above ${REVENUE_STAMP_CASH_LIMIT}, so Article 53 of the Indian Stamp Act asks for a revenue stamp of ${REVENUE_STAMP_DUTY} rupee, signed across by the landlord.`,
    );
  }
  if (tds194IBApplies) {
    warnings.push(
      `Monthly rent is above ${TDS_194IB_MONTHLY_LIMIT}, so section 194-IB requires you to deduct TDS at ${tdsRate * 100}% once, in the last month of the tenancy or the financial year, deposit it with Form 26QC within ${FORM_26QC_DAYS} days of the end of that month and give the landlord Form 16C.`,
    );
  }
  if (!panOnFile && tds194IBApplies) {
    warnings.push(
      "Without the landlord's PAN, section 206AA pushes the deduction to 20%, still capped at the last month's rent.",
    );
  }

  return {
    receipts,
    months,
    monthlyRent,
    totalRent,
    totalRentWords: amountInWords(totalRent),
    paymentMode,
    stampRequired,
    stampDuty: REVENUE_STAMP_DUTY,
    panRequired,
    panOnFile,
    tds194IBApplies,
    tdsRate,
    tdsRatePercent: tdsRate * 100,
    tdsAmount,
    warnings,
    landlordName,
    landlordPan,
    landlordAddress,
    tenantName,
    propertyAddress,
  };
}

/** Plain-text version of the receipts, for copying or pasting into an email. */
export function receiptsToText(result) {
  if (!result || result.error || !Array.isArray(result.receipts)) return "";
  const lines = [];
  for (const receipt of result.receipts) {
    lines.push(`RENT RECEIPT  ${receipt.number}`);
    lines.push(`Received from : ${result.tenantName || "(tenant name)"}`);
    lines.push(`Amount        : ${Math.round(receipt.amount)} (${receipt.amountWords})`);
    lines.push(`For the month : ${receipt.monthLabel}`);
    lines.push(`Property      : ${result.propertyAddress || "(property address)"}`);
    lines.push(`Paid by       : ${result.paymentMode === "cash" ? "Cash" : "Bank transfer"}`);
    lines.push(`Landlord      : ${result.landlordName || "(landlord name)"}`);
    if (result.landlordPan) lines.push(`Landlord PAN  : ${result.landlordPan}`);
    if (result.landlordAddress) lines.push(`Address       : ${result.landlordAddress}`);
    lines.push(`Date          : ${receipt.issueDate}`);
    lines.push(
      receipt.stampRequired
        ? "Signature     : ____________________ (over a Re 1 revenue stamp)"
        : "Signature     : ____________________",
    );
    lines.push("");
  }
  return lines.join("\n").trimEnd();
}
