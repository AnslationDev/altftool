/**
 * Donation receipt builder for Indian charitable institutions.
 *
 * Pure module: computes the section 80G deduction available to the donor,
 * spells the amount in Indian words, and renders the receipt text.
 * No React, no DOM, no clock reads.
 */

/**
 * Income-tax Act, 1961, section 80G(5D): no deduction is allowed for a donation
 * of a sum EXCEEDING Rs 2,000 unless it is paid by a mode other than cash.
 * The Finance Act, 2017 cut this threshold from Rs 10,000 to Rs 2,000.
 */
export const CASH_DEDUCTION_LIMIT = 2000;

/**
 * Section 80G qualifying limit: for the categories that carry one, the donation
 * eligible for deduction is capped at 10% of the donor's adjusted gross total
 * income. The rate (50% or 100%) is then applied to that capped figure.
 */
export const QUALIFYING_LIMIT_PERCENT = 10;

/**
 * Rule 18AB and section 80G(5)(viii)-(ix): an institution that receives
 * donations must file the statement of donations in Form 10BD and issue the
 * certificate of donation in Form 10BE to each donor by 31 MAY following the
 * end of the financial year in which the donation was received.
 */
export const FORM_10BE_DUE = "31 May following the end of the financial year";

/**
 * Section 115BAC(1A): the default new tax regime disallows most Chapter VI-A
 * deductions, including section 80G. A donor who has not opted out of the new
 * regime gets no deduction, however valid the receipt.
 */
export const NEW_REGIME_BLOCKS_80G = true;

export const DEDUCTION_CATEGORIES = [
  {
    key: "100_no_limit",
    label: "100% deduction, no qualifying limit",
    rate: 100,
    limited: false,
    examples: "National Defence Fund, Prime Minister's National Relief Fund, PM CARES Fund, National Children's Fund.",
  },
  {
    key: "50_no_limit",
    label: "50% deduction, no qualifying limit",
    rate: 50,
    limited: false,
    examples: "Jawaharlal Nehru Memorial Fund, Prime Minister's Drought Relief Fund, Indira Gandhi Memorial Trust.",
  },
  {
    key: "100_with_limit",
    label: "100% deduction, subject to the 10% qualifying limit",
    rate: 100,
    limited: true,
    examples: "Donations to the government or a local authority for promoting family planning; sums paid to a recognised sports association.",
  },
  {
    key: "50_with_limit",
    label: "50% deduction, subject to the 10% qualifying limit",
    rate: 50,
    limited: true,
    examples: "Most registered charitable trusts, NGOs and religious institutions holding 80G approval.",
  },
];

export const PAYMENT_MODES = [
  { key: "cash", label: "Cash", cash: true },
  { key: "cheque", label: "Cheque", cash: false },
  { key: "neft", label: "NEFT / RTGS / IMPS bank transfer", cash: false },
  { key: "upi", label: "UPI", cash: false },
  { key: "card", label: "Debit or credit card", cash: false },
  { key: "dd", label: "Demand draft", cash: false },
  { key: "kind", label: "Donation in kind", cash: false, inKind: true },
];

export const PURPOSES = [
  "General corpus of the institution",
  "Education and scholarships",
  "Healthcare and medical relief",
  "Disaster and emergency relief",
  "Animal welfare",
  "Environment and conservation",
  "Sponsorship of a named project",
];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const clean = (value) => String(value ?? "").trim();
const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

/** ISO yyyy-mm-dd -> UTC milliseconds, or null when the string is not a real date. */
export function toUtcMs(iso) {
  const text = clean(iso);
  if (!ISO_DATE.test(text)) return null;
  const [y, m, d] = text.split("-").map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const ms = Date.UTC(y, m - 1, d);
  const back = new Date(ms);
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== m - 1 || back.getUTCDate() !== d) {
    return null;
  }
  return ms;
}

/** yyyy-mm-dd -> "05 January 2026". */
export function formatLongDate(iso) {
  const ms = toUtcMs(iso);
  if (ms === null) return "";
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const d = new Date(ms);
  return `${String(d.getUTCDate()).padStart(2, "0")} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** Indian financial year label for a date: 1 April to 31 March. */
export function financialYear(iso) {
  const ms = toUtcMs(iso);
  if (ms === null) return "";
  const d = new Date(ms);
  const start = d.getUTCMonth() + 1 >= 4 ? d.getUTCFullYear() : d.getUTCFullYear() - 1;
  return `${start}-${String((start + 1) % 100).padStart(2, "0")}`;
}

const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function underHundred(n) {
  if (n < 20) return ONES[n];
  const t = Math.floor(n / 10);
  const r = n % 10;
  return TENS[t] + (r ? ` ${ONES[r]}` : "");
}

/**
 * Spell a whole number in the Indian system (crore, lakh, thousand, hundred).
 * Returns "" for anything outside 0 to 99,99,99,999.
 */
export function numberToIndianWords(value) {
  const n = Math.trunc(Number(value));
  if (!Number.isFinite(n) || n < 0 || n > 999999999) return "";
  if (n === 0) return "Zero";

  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const hundred = Math.floor((n % 1000) / 100);
  const rest = n % 100;

  const parts = [];
  if (crore) parts.push(`${underHundred(crore)} Crore`);
  if (lakh) parts.push(`${underHundred(lakh)} Lakh`);
  if (thousand) parts.push(`${underHundred(thousand)} Thousand`);
  if (hundred) parts.push(`${ONES[hundred]} Hundred`);
  if (rest) parts.push(underHundred(rest));
  return parts.join(" ");
}

/** Rupees and paise in words, ready to print on a receipt. */
export function amountInWords(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value) || value < 0) return "";
  const rupees = Math.trunc(value);
  const paise = Math.round((value - rupees) * 100);
  const rupeeWords = numberToIndianWords(rupees);
  if (!rupeeWords) return "";
  return paise > 0
    ? `Rupees ${rupeeWords} and ${numberToIndianWords(paise)} Paise only`
    : `Rupees ${rupeeWords} only`;
}

/**
 * Section 80G deduction available to the donor for this donation.
 *
 * @returns {object|{error: string}}
 */
export function computeDeduction({
  amount,
  categoryKey = "50_with_limit",
  modeKey = "upi",
  adjustedGrossTotalIncome = 0,
  regime = "old",
} = {}) {
  const category = DEDUCTION_CATEGORIES.find((item) => item.key === categoryKey);
  if (!category) return { error: "Pick the 80G category the institution falls in." };

  const mode = PAYMENT_MODES.find((item) => item.key === modeKey);
  if (!mode) return { error: "Pick how the donation was paid." };

  const value = Number(String(amount ?? "").replace(/,/g, "").trim());
  if (!Number.isFinite(value)) return { error: "Enter the donation amount as a number." };
  if (value <= 0) return { error: "The donation amount must be greater than zero." };

  const agti = Number(String(adjustedGrossTotalIncome ?? 0).replace(/,/g, "").trim() || 0);
  if (!Number.isFinite(agti) || agti < 0) {
    return { error: "Adjusted gross total income must be zero or a positive amount." };
  }

  const qualifyingLimit = category.limited ? round2((agti * QUALIFYING_LIMIT_PERCENT) / 100) : null;
  const notes = [];

  let eligible = value;
  let deduction = 0;
  let blocked = "";

  if (mode.inKind) {
    blocked = "Donations in kind do not qualify for a deduction under section 80G — only sums of money do.";
  } else if (mode.cash && value > CASH_DEDUCTION_LIMIT) {
    blocked = `A cash donation above Rs ${CASH_DEDUCTION_LIMIT.toLocaleString("en-IN")} is not deductible under section 80G(5D). Pay by cheque, bank transfer, UPI or card instead.`;
  } else if (regime === "new" && NEW_REGIME_BLOCKS_80G) {
    blocked = "Section 80G is not available under the default new tax regime of section 115BAC(1A). The receipt is still valid, but the donor gets no deduction unless they opt for the old regime.";
  }

  if (!blocked) {
    if (category.limited) {
      if (agti <= 0) {
        return {
          error: "This 80G category is capped at 10% of adjusted gross total income — enter that income to compute the deduction.",
        };
      }
      eligible = Math.min(value, qualifyingLimit);
      if (eligible < value) {
        notes.push(
          `Only Rs ${eligible.toLocaleString("en-IN")} of the donation counts, because the qualifying limit is ${QUALIFYING_LIMIT_PERCENT}% of adjusted gross total income.`,
        );
      }
    }
    deduction = round2((eligible * category.rate) / 100);
    if (mode.cash) {
      notes.push(
        `Cash donations stay deductible only up to Rs ${CASH_DEDUCTION_LIMIT.toLocaleString("en-IN")}.`,
      );
    }
  } else {
    eligible = 0;
  }

  return {
    category,
    mode,
    amount: round2(value),
    adjustedGrossTotalIncome: round2(agti),
    qualifyingLimit,
    eligibleAmount: round2(eligible),
    deductionRate: category.rate,
    deduction,
    blocked,
    notes,
    regime,
  };
}

/**
 * Build the donation receipt text.
 *
 * @returns {{receipt: string, deduction: object}|{error: string}}
 */
export function buildDonationReceipt({
  organisationName,
  organisationAddress = "",
  organisationPan = "",
  registration12A = "",
  approval80G = "",
  approval80GValidity = "",
  uniqueRegistrationNumber = "",
  fcraNumber = "",
  contactEmail = "",
  contactPhone = "",
  receiptNumber = "",
  receiptDate,
  donorName,
  donorAddress = "",
  donorPan = "",
  donorEmail = "",
  amount,
  modeKey = "upi",
  transactionReference = "",
  purpose = PURPOSES[0],
  categoryKey = "50_with_limit",
  adjustedGrossTotalIncome = 0,
  regime = "old",
  isForeignContribution = false,
  authorisedSignatory = "",
  signatoryDesignation = "Authorised Signatory",
} = {}) {
  const org = clean(organisationName);
  const donor = clean(donorName);
  if (!org) return { error: "Enter the organisation's name." };
  if (!donor) return { error: "Enter the donor's name." };
  if (toUtcMs(receiptDate) === null) {
    return { error: "Enter a valid receipt date in yyyy-mm-dd format." };
  }

  const pan = clean(donorPan).toUpperCase();
  if (pan && !/^[A-Z]{5}\d{4}[A-Z]$/.test(pan)) {
    return { error: "A PAN must be five letters, four digits and one letter, e.g. ABCDE1234F." };
  }

  const orgPan = clean(organisationPan).toUpperCase();
  if (orgPan && !/^[A-Z]{5}\d{4}[A-Z]$/.test(orgPan)) {
    return { error: "The organisation PAN must be five letters, four digits and one letter." };
  }

  if (isForeignContribution && !clean(fcraNumber)) {
    return {
      error: "A foreign contribution can only be received against an FCRA registration — enter the FCRA number.",
    };
  }

  const deduction = computeDeduction({
    amount,
    categoryKey,
    modeKey,
    adjustedGrossTotalIncome,
    regime,
  });
  if (deduction.error) return { error: deduction.error };

  const fy = financialYear(receiptDate);
  const words = amountInWords(deduction.amount);

  const orgBlock = [
    org.toUpperCase(),
    clean(organisationAddress),
    [orgPan && `PAN: ${orgPan}`, contactPhone && `Phone: ${clean(contactPhone)}`, contactEmail && `Email: ${clean(contactEmail)}`]
      .filter(Boolean)
      .join(" | "),
  ].filter(Boolean);

  const regBlock = [
    registration12A && `Registration under section 12A / 12AB: ${clean(registration12A)}`,
    approval80G && `Approval under section 80G: ${clean(approval80G)}`,
    approval80GValidity && `80G approval valid up to: ${clean(approval80GValidity)}`,
    uniqueRegistrationNumber && `Unique Registration Number (URN): ${clean(uniqueRegistrationNumber)}`,
    fcraNumber && `FCRA registration number: ${clean(fcraNumber)}`,
  ].filter(Boolean);

  const receipt = [
    ...orgBlock,
    "",
    "DONATION RECEIPT",
    "",
    `Receipt no.: ${clean(receiptNumber) || "____________"}`,
    `Date: ${formatLongDate(receiptDate)}`,
    `Financial year: ${fy}`,
    "",
    "Received with thanks from:",
    `  Name: ${donor}`,
    ...(donorAddress ? [`  Address: ${clean(donorAddress)}`] : []),
    ...(pan ? [`  PAN: ${pan}`] : ["  PAN: ____________ (required for the Form 10BE certificate)"]),
    ...(donorEmail ? [`  Email: ${clean(donorEmail)}`] : []),
    "",
    `Amount: INR ${deduction.amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    `Amount in words: ${words}`,
    `Mode of payment: ${deduction.mode.label}${transactionReference ? ` (reference ${clean(transactionReference)})` : ""}`,
    `Purpose: ${clean(purpose) || PURPOSES[0]}`,
    ...(isForeignContribution
      ? ["", "This contribution has been received as a foreign contribution in the designated FCRA account and will be utilised in accordance with the Foreign Contribution (Regulation) Act, 2010."]
      : []),
    "",
    ...(regBlock.length ? ["Institution registration details:", ...regBlock.map((line) => `  ${line}`), ""] : []),
    "Tax note for the donor:",
    deduction.blocked
      ? `  ${deduction.blocked}`
      : `  This donation falls in the "${deduction.category.label}" category of section 80G of the Income-tax Act, 1961. On the figures given, a deduction of INR ${deduction.deduction.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} would be available.`,
    ...deduction.notes.map((note) => `  ${note}`),
    `  For financial year ${fy}, the statement of donations in Form 10BD and the certificate of donation in Form 10BE will be filed and issued by 31 May ${Number(fy.slice(0, 4)) + 1}.`,
    "",
    "For " + org,
    "",
    "",
    clean(authorisedSignatory) || "____________________",
    clean(signatoryDesignation) || "Authorised Signatory",
  ]
    .filter((line, index, all) => !(line === "" && all[index - 1] === ""))
    .join("\n");

  return { receipt, deduction, financialYear: fy, amountWords: words };
}
