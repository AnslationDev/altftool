/**
 * Loan statement / interest certificate request letter builder.
 *
 * Pure text-composition module: no React, no DOM, no clocks. Every date used in
 * the letter is passed in by the caller so the same input always produces the
 * same output.
 *
 * Rule sources referenced in the generated wording:
 *  - Reserve Bank - Integrated Ombudsman Scheme, 2021 (RB-IOS): a customer may
 *    escalate to the RBI Ombudsman only after the regulated entity has either
 *    rejected the complaint or failed to reply within 30 days of receiving it.
 *  - RBI circular DoR.MCS.REC.38/01.01.001/2023-24 dated 13 September 2023
 *    (effective for all cases from 1 December 2023): lenders must release the
 *    original movable/immovable property documents within 30 days of full
 *    repayment or settlement, and pay Rs 5,000 for each day of delay beyond that.
 *  - Income-tax Act, 1961 section 24(b): deduction for interest on a housing
 *    loan for a self-occupied property is capped at Rs 2,00,000 a year.
 *  - Income-tax Act, 1961 section 80C: repayment of housing loan principal
 *    qualifies within the overall Rs 1,50,000 section 80C ceiling.
 *  - Income-tax Act, 1961 section 80E: interest on an education loan is
 *    deductible with no monetary cap for up to 8 assessment years.
 */

/** RB-IOS 2021 - reply window before the RBI Ombudsman will accept a complaint. */
export const OMBUDSMAN_WAIT_DAYS = 30;

/** RBI circular dated 13-09-2023 - deadline to return original documents. */
export const DOCUMENT_RELEASE_DAYS = 30;

/** RBI circular dated 13-09-2023 - compensation per day of delay, in rupees. */
export const DOCUMENT_RELEASE_PENALTY_PER_DAY = 5000;

/** Income-tax Act section 24(b) cap on self-occupied housing loan interest. */
export const SECTION_24B_CAP = 200000;

/** Income-tax Act section 80C overall ceiling (covers housing loan principal). */
export const SECTION_80C_CAP = 150000;

/** Maximum length of the acknowledgement window a letter should demand. */
const MAX_REPLY_DAYS = 45;
const MIN_REPLY_DAYS = 3;

export const LOAN_TYPES = [
  {
    id: "home",
    label: "Home loan",
    taxNote:
      "The interest certificate is needed to claim the section 24(b) deduction (capped at Rs 2,00,000 a year for a self-occupied property) and the principal component under section 80C.",
  },
  {
    id: "loan-against-property",
    label: "Loan against property",
    taxNote:
      "The interest split is needed where the borrowed funds were used for a purpose that allows an interest deduction; keep the end-use proof with the certificate.",
  },
  {
    id: "education",
    label: "Education loan",
    taxNote:
      "The interest certificate supports the section 80E deduction, which has no monetary cap and runs for up to 8 assessment years from the year repayment starts.",
  },
  {
    id: "car",
    label: "Car / vehicle loan",
    taxNote:
      "Interest is deductible only where the vehicle is used for business or profession; the certificate is the supporting document.",
  },
  {
    id: "personal",
    label: "Personal loan",
    taxNote:
      "Interest is generally not deductible unless the funds were used for a house, business or investment; the statement establishes the end use.",
  },
  {
    id: "business",
    label: "Business / working capital loan",
    taxNote:
      "The statement and interest certificate support the interest claim as a business expense and the year-end balance in the books.",
  },
  {
    id: "gold",
    label: "Gold loan",
    taxNote:
      "The statement records interest charged and part-releases of the pledged ornaments.",
  },
  {
    id: "two-wheeler",
    label: "Two-wheeler loan",
    taxNote: "The statement records EMIs charged, charges levied and the balance outstanding.",
  },
];

export const REQUEST_TYPES = [
  {
    id: "statement",
    label: "Loan account statement",
    documents: ["a full loan account statement showing every debit, credit and charge"],
  },
  {
    id: "interest-certificate",
    label: "Interest certificate",
    documents: [
      "an interest certificate showing the principal and interest paid separately for the period",
    ],
  },
  {
    id: "amortisation",
    label: "Amortisation / repayment schedule",
    documents: [
      "the amortisation schedule showing the EMI, the principal and interest split for each instalment and the closing balance",
    ],
  },
  {
    id: "all",
    label: "Statement + interest certificate + schedule",
    subjectLabel: "loan account statement, interest certificate and amortisation schedule",
    documents: [
      "a full loan account statement showing every debit, credit and charge",
      "an interest certificate showing the principal and interest paid separately for the period",
      "the current amortisation schedule up to the final instalment",
    ],
  },
  {
    id: "foreclosure",
    label: "Foreclosure / outstanding balance letter",
    documents: [
      "a foreclosure letter stating the exact amount payable, the date up to which it is valid, and any foreclosure or prepayment charge with the clause it is levied under",
      "the loan account statement up to the foreclosure date",
    ],
  },
  {
    id: "noc",
    label: "NOC and original documents after closure",
    documents: [
      "the No Objection Certificate and loan closure letter",
      "all original title and security documents held against the loan, together with the charge-satisfaction confirmation filed with the registry",
    ],
  },
];

export const DELIVERY_MODES = [
  { id: "email", label: "Email (PDF)" },
  { id: "post", label: "Signed hard copy by post" },
  { id: "branch", label: "Collect from the branch" },
  { id: "both", label: "Email now, signed hard copy by post" },
];

const MONTHS = [
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

const byId = (list, id) => list.find((item) => item.id === id) || null;

/**
 * Parse a strict YYYY-MM-DD string into date parts, rejecting impossible dates
 * such as 2026-02-30. Returns null when the string is not a valid calendar date.
 */
export function parseIsoDate(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (day > daysInMonth) return null;
  return { year, month, day, ordinal: year * 10000 + month * 100 + day };
}

/** "2026-04-12" -> "12 April 2026". Returns an empty string for bad input. */
export function formatLongDate(value) {
  const parsed = parseIsoDate(value);
  if (!parsed) return "";
  return `${parsed.day} ${MONTHS[parsed.month - 1]} ${parsed.year}`;
}

/**
 * Indian financial year label for a date: 1 April to 31 March.
 * "2026-04-12" -> "FY 2026-27"; "2026-02-12" -> "FY 2025-26".
 */
export function financialYearLabel(value) {
  const parsed = parseIsoDate(value);
  if (!parsed) return "";
  const startYear = parsed.month >= 4 ? parsed.year : parsed.year - 1;
  const endShort = String((startYear + 1) % 100).padStart(2, "0");
  return `FY ${startYear}-${endShort}`;
}

const clean = (value) => String(value == null ? "" : value).trim().replace(/\s+/g, " ");

const maskAccount = (accountNumber) => {
  const digits = clean(accountNumber).replace(/\s/g, "");
  if (digits.length <= 4) return digits;
  return `${"X".repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}`;
};

/**
 * Build the request letter.
 *
 * @param {object} input
 * @param {string} input.senderName        Borrower's name as it appears on the loan.
 * @param {string} [input.senderAddress]   Multi-line address block.
 * @param {string} [input.senderPhone]     Registered mobile number.
 * @param {string} [input.senderEmail]     Registered email address.
 * @param {string} input.bankName          Lender name.
 * @param {string} [input.branchName]      Branch or servicing centre.
 * @param {string} input.loanAccountNumber Loan account / LAN number.
 * @param {string} [input.loanType]        One of LOAN_TYPES ids.
 * @param {string} [input.requestType]     One of REQUEST_TYPES ids.
 * @param {string} input.periodFrom        YYYY-MM-DD, start of the period wanted.
 * @param {string} input.periodTo          YYYY-MM-DD, end of the period wanted.
 * @param {string} input.letterDate        YYYY-MM-DD, the date printed on the letter.
 * @param {string} [input.purpose]         Free-text reason (tax filing, balance transfer...).
 * @param {string} [input.deliveryMode]    One of DELIVERY_MODES ids.
 * @param {number} [input.replyDays]       Acknowledgement window requested, 3-45 days.
 * @param {boolean} [input.maskAccountNumber] Print only the last 4 digits.
 * @returns {{error:string}|{subject:string,letter:string,paragraphs:string[],wordCount:number,characterCount:number,notes:string[],financialYear:string}}
 */
export function buildLoanStatementLetter(input) {
  const data = input && typeof input === "object" ? input : {};

  const senderName = clean(data.senderName);
  const bankName = clean(data.bankName);
  const branchName = clean(data.branchName);
  const accountNumber = clean(data.loanAccountNumber);
  const purpose = clean(data.purpose);

  if (!senderName) return { error: "Enter the borrower's name as it appears on the loan." };
  if (!bankName) return { error: "Enter the name of the bank or NBFC." };
  if (!accountNumber) return { error: "Enter the loan account number (LAN) so the branch can trace the account." };

  const letterDate = parseIsoDate(data.letterDate);
  const from = parseIsoDate(data.periodFrom);
  const to = parseIsoDate(data.periodTo);

  if (!letterDate) return { error: "Pick a valid date for the letter (YYYY-MM-DD)." };
  if (!from) return { error: "Pick a valid start date for the statement period." };
  if (!to) return { error: "Pick a valid end date for the statement period." };
  if (from.ordinal > to.ordinal) {
    return { error: "The period start date must fall on or before the period end date." };
  }
  if (from.year < 1980 || to.year > letterDate.year + 40) {
    return { error: "The statement period looks out of range - check the years you entered." };
  }

  const replyDaysRaw = data.replyDays == null || data.replyDays === "" ? 7 : Number(data.replyDays);
  if (!Number.isFinite(replyDaysRaw)) {
    return { error: "Acknowledgement window must be a number of days." };
  }
  const replyDays = Math.round(replyDaysRaw);
  if (replyDays < MIN_REPLY_DAYS || replyDays > MAX_REPLY_DAYS) {
    return {
      error: `Ask for an acknowledgement within ${MIN_REPLY_DAYS} to ${MAX_REPLY_DAYS} days - anything shorter reads as unreasonable.`,
    };
  }

  const loanType = byId(LOAN_TYPES, data.loanType) || LOAN_TYPES[0];
  const requestType = byId(REQUEST_TYPES, data.requestType) || REQUEST_TYPES[0];
  const delivery = byId(DELIVERY_MODES, data.deliveryMode) || DELIVERY_MODES[0];

  const printedAccount = data.maskAccountNumber ? maskAccount(accountNumber) : accountNumber;
  const periodFromLong = formatLongDate(data.periodFrom);
  const periodToLong = formatLongDate(data.periodTo);
  const letterDateLong = formatLongDate(data.letterDate);
  const financialYear = financialYearLabel(data.periodTo);

  const addressee = branchName ? `The Branch Manager\n${bankName}\n${branchName}` : `The Branch Manager\n${bankName}`;

  const senderBlock = [
    senderName,
    clean(data.senderAddress) ? String(data.senderAddress).trim() : "",
    clean(data.senderPhone) ? `Mobile: ${clean(data.senderPhone)}` : "",
    clean(data.senderEmail) ? `Email: ${clean(data.senderEmail)}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const subjectLabel = requestType.subjectLabel || requestType.label.toLowerCase();
  const subject = `Request for ${subjectLabel} - ${loanType.label.toLowerCase()} account ${printedAccount}`;

  const documentLines = requestType.documents.map(
    (doc, index) => `${index + 1}. ${doc.charAt(0).toUpperCase()}${doc.slice(1)}.`,
  );

  const openingLine =
    requestType.id === "noc"
      ? `I hold ${loanType.label.toLowerCase()} account number ${printedAccount} with your branch, which has now been repaid in full. I request the closure documents listed below.`
      : `I hold ${loanType.label.toLowerCase()} account number ${printedAccount} with your branch. I request the following documents for the period ${periodFromLong} to ${periodToLong}.`;

  const purposeLine = purpose
    ? `The documents are required for ${purpose}.`
    : `The documents are required for my own records and for verification of the amounts debited to the account.`;

  const deliveryLine = {
    email: `Please send the documents as a signed PDF to my registered email address. A digitally signed copy is acceptable.`,
    post: `Please send signed hard copies to my address recorded in your books.`,
    branch: `I will collect the signed documents from the branch; please intimate me by SMS or email when they are ready.`,
    both: `Please email a signed PDF to my registered email address first, and follow it with signed hard copies by post.`,
  }[delivery.id];

  const closingLine = `Kindly acknowledge this request within ${replyDays} days and confirm the date by which the documents will be issued. Should the request remain unanswered for ${OMBUDSMAN_WAIT_DAYS} days, I will be constrained to escalate it to your Principal Nodal Officer and thereafter to the RBI Ombudsman under the Reserve Bank - Integrated Ombudsman Scheme, 2021.`;

  const paragraphs = [
    openingLine,
    documentLines.join("\n"),
    purposeLine,
    deliveryLine,
    closingLine,
    `I have not authorised any third party to collect these documents on my behalf. Please contact me on my registered mobile number if any verification is needed.`,
  ];

  const letter = [
    senderBlock,
    "",
    letterDateLong,
    "",
    addressee,
    "",
    `Subject: ${subject}`,
    "",
    "Dear Sir / Madam,",
    "",
    paragraphs.join("\n\n"),
    "",
    "Yours faithfully,",
    "",
    senderName,
    `Loan account: ${printedAccount}`,
  ].join("\n");

  const notes = [loanType.taxNote];

  if (requestType.id === "foreclosure") {
    notes.push(
      "Ask for the foreclosure figure to be valid to a stated date - interest accrues daily, so a quote more than a few days old will not settle the account.",
    );
  }
  if (requestType.id === "noc") {
    notes.push(
      `Under the RBI circular dated 13 September 2023, lenders must release original property documents within ${DOCUMENT_RELEASE_DAYS} days of full repayment and pay Rs ${DOCUMENT_RELEASE_PENALTY_PER_DAY.toLocaleString("en-IN")} for each day of delay beyond that.`,
    );
  }
  if (loanType.id === "home" && (requestType.id === "interest-certificate" || requestType.id === "all")) {
    notes.push(
      `For ${financialYear}, keep the certificate with your return: interest on a self-occupied property is capped at Rs ${SECTION_24B_CAP.toLocaleString("en-IN")} under section 24(b) and principal repayment sits inside the Rs ${SECTION_80C_CAP.toLocaleString("en-IN")} section 80C ceiling.`,
    );
  }

  const wordCount = letter.split(/\s+/).filter(Boolean).length;

  return {
    subject,
    letter,
    paragraphs,
    senderBlock,
    addressee,
    wordCount,
    characterCount: letter.length,
    notes,
    financialYear,
    periodFromLong,
    periodToLong,
    letterDateLong,
    printedAccount,
  };
}
