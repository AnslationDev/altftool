/**
 * No dues certificate / NOC — document text and the RBI release deadlines.
 *
 * Rules used:
 *  - RBI circular DoR.MCS.REC.38/01.01.001/2023-24 dated 13 September 2023,
 *    "Release of Movable / Immovable Property Documents on Repayment/Settlement
 *    of Personal Loans", applicable to all releases on or after 1 December 2023:
 *      * the regulated entity shall release all original movable and immovable
 *        property documents and remove any registered charge WITHIN 30 DAYS of
 *        full repayment or settlement of the loan account;
 *      * where the delay beyond 30 days is attributable to the lender, it shall
 *        compensate the borrower at Rs 5,000 FOR EACH DAY OF DELAY;
 *      * where original documents are lost or damaged, the lender must assist
 *        in obtaining duplicates and bear the costs, and gets an ADDITIONAL 30
 *        DAYS for that process — the per-day compensation is then computed
 *        after the total 60-day period.
 *  - RBI "Framework for compensation to customers for delayed updation /
 *    rectification of credit information" dated 26 October 2023 (effective
 *    26 April 2024): a credit information complaint must be resolved within
 *    30 CALENDAR DAYS, failing which compensation of Rs 100 PER CALENDAR DAY
 *    of delay is payable to the complainant.
 *
 * All functions are pure; "today" is always passed in by the caller.
 */

/** RBI 13 Sep 2023 circular — days to release documents after full repayment. */
export const DOCUMENT_RELEASE_DAYS = 30;

/** RBI 13 Sep 2023 circular — compensation per day of lender-attributable delay. */
export const DELAY_COMPENSATION_PER_DAY = 5000;

/** RBI 13 Sep 2023 circular — extra days allowed where original documents are lost. */
export const LOST_DOCUMENT_EXTRA_DAYS = 30;

/** RBI 26 Oct 2023 framework — days to resolve a credit information complaint. */
export const BUREAU_RESOLUTION_DAYS = 30;

/** RBI 26 Oct 2023 framework — compensation per calendar day beyond 30 days. */
export const BUREAU_COMPENSATION_PER_DAY = 100;

export const ACCOUNT_TYPES = [
  { key: "homeLoan", label: "Home loan", securedByDocuments: true },
  { key: "lap", label: "Loan against property", securedByDocuments: true },
  { key: "vehicleLoan", label: "Vehicle loan", securedByDocuments: true },
  { key: "goldLoan", label: "Gold loan", securedByDocuments: true },
  { key: "personalLoan", label: "Personal loan (unsecured)", securedByDocuments: false },
  { key: "educationLoan", label: "Education loan", securedByDocuments: false },
  { key: "businessLoan", label: "Business loan", securedByDocuments: true },
  { key: "creditCard", label: "Credit card account", securedByDocuments: false },
  { key: "savingsAccount", label: "Savings or current account", securedByDocuments: false },
];

export const DOCUMENT_TYPES = [
  {
    key: "certificate",
    label: "No dues certificate issued by the lender (fill-in format)",
  },
  {
    key: "request",
    label: "Borrower's request to the lender for the NDC and documents",
  },
];

export const RELEASE_ITEMS = [
  "Original title deed / sale deed",
  "Original registered agreement to sell",
  "Chain of title documents deposited at the time of sanction",
  "Original registration certificate with hypothecation cancelled (Form 35)",
  "Original share certificate and society NOC",
  "Post-dated cheques and unused security cheques",
  "Signed loan closure statement showing nil outstanding",
  "CERSAI charge satisfaction acknowledgement",
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

/** Add whole days to an ISO date. */
export function addDays(date, count) {
  const parts = parseISODate(date);
  if (!parts || !Number.isFinite(count)) return null;
  const shifted = new Date(utc(parts) + Math.trunc(count) * DAY_MS);
  return iso({
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  });
}

/** Whole days between two ISO dates (b - a). */
export function diffDays(a, b) {
  const first = parseISODate(a);
  const second = parseISODate(b);
  if (!first || !second) return null;
  return Math.round((utc(second) - utc(first)) / DAY_MS);
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

/** "2026-02-09" -> "9 February 2026". */
export function longDate(date) {
  const parts = parseISODate(date);
  if (!parts) return "";
  return `${parts.day} ${MONTH_NAMES[parts.month - 1]} ${parts.year}`;
}

/**
 * Document release deadline and delay compensation.
 * @param {object} input
 * @param {string} input.closureDate    ISO date of full repayment or settlement.
 * @param {string} input.todayDate      ISO "today".
 * @param {string} [input.receivedDate] ISO date documents were actually received.
 * @param {boolean} [input.documentsLost] Lender says the originals are lost or damaged.
 * @param {boolean} [input.securedByDocuments] Whether property documents were deposited.
 */
export function computeReleaseTimeline({
  closureDate,
  todayDate,
  receivedDate = "",
  documentsLost = false,
  securedByDocuments = true,
} = {}) {
  if (!parseISODate(closureDate)) {
    return { error: "Enter a valid date of full repayment or account closure." };
  }
  if (!parseISODate(todayDate)) {
    return { error: "Enter a valid current date." };
  }

  const allowedDays = DOCUMENT_RELEASE_DAYS + (documentsLost ? LOST_DOCUMENT_EXTRA_DAYS : 0);
  const dueDate = addDays(closureDate, allowedDays);

  const received = parseISODate(receivedDate) ? receivedDate : null;
  if (received && diffDays(closureDate, received) < 0) {
    return { error: "Documents cannot have been received before the account was closed." };
  }

  const measureDate = received || todayDate;
  const rawDelay = diffDays(dueDate, measureDate);
  const daysDelayed = Math.max(0, rawDelay === null ? 0 : rawDelay);
  const compensation = securedByDocuments ? daysDelayed * DELAY_COMPENSATION_PER_DAY : 0;

  let status;
  if (received) status = daysDelayed > 0 ? "receivedLate" : "receivedOnTime";
  else if (daysDelayed > 0) status = "overdue";
  else status = "running";

  const daysLeft = received ? 0 : Math.max(0, diffDays(measureDate, dueDate) ?? 0);

  return {
    closureDate,
    allowedDays,
    dueDate,
    receivedDate: received,
    daysDelayed,
    daysLeft,
    compensation,
    compensationRate: DELAY_COMPENSATION_PER_DAY,
    securedByDocuments,
    documentsLost,
    status,
  };
}

/**
 * Credit bureau correction deadline and compensation.
 * @param {{complaintDate: string, todayDate: string, resolvedDate?: string}} input
 */
export function computeBureauTimeline({ complaintDate, todayDate, resolvedDate = "" } = {}) {
  if (!parseISODate(complaintDate)) return { error: "Enter a valid complaint date." };
  if (!parseISODate(todayDate)) return { error: "Enter a valid current date." };

  const dueDate = addDays(complaintDate, BUREAU_RESOLUTION_DAYS);
  const resolved = parseISODate(resolvedDate) ? resolvedDate : null;
  if (resolved && diffDays(complaintDate, resolved) < 0) {
    return { error: "The complaint cannot be resolved before it was raised." };
  }

  const measureDate = resolved || todayDate;
  const rawDelay = diffDays(dueDate, measureDate);
  const daysDelayed = Math.max(0, rawDelay === null ? 0 : rawDelay);

  return {
    dueDate,
    daysDelayed,
    compensation: daysDelayed * BUREAU_COMPENSATION_PER_DAY,
    compensationRate: BUREAU_COMPENSATION_PER_DAY,
    resolved: Boolean(resolved),
  };
}

const rupees = (value) =>
  `Rs. ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value)}`;

/**
 * Build the no dues certificate or the borrower's request letter.
 * @returns {{document: string, timeline: object, wordCount: number}} or { error }
 */
export function buildNoDuesDocument(input = {}) {
  const {
    documentType = "certificate",
    accountType = "homeLoan",
    lenderName = "",
    branchName = "",
    lenderAddress = "",
    borrowerName = "",
    borrowerAddress = "",
    coBorrowerName = "",
    accountNumber = "",
    sanctionAmount = "",
    sanctionDate = "",
    closureDate = "",
    closureAmount = "",
    closureMode = "",
    propertyDescription = "",
    items = RELEASE_ITEMS.slice(0, 4),
    documentsLost = false,
    letterDate = "",
    place = "",
    todayDate = "",
    receivedDate = "",
    signatoryName = "",
    signatoryDesignation = "",
  } = input;

  const type = DOCUMENT_TYPES.find((item) => item.key === documentType);
  if (!type) return { error: "Choose which document you want to produce." };

  const account = ACCOUNT_TYPES.find((item) => item.key === accountType);
  if (!account) return { error: "Choose the type of account being closed." };

  if (!Array.isArray(items)) return { error: "The list of documents to be released is invalid." };

  const timeline = computeReleaseTimeline({
    closureDate,
    todayDate: parseISODate(todayDate) ? todayDate : letterDate,
    receivedDate,
    documentsLost,
    securedByDocuments: account.securedByDocuments,
  });
  if (timeline.error) return { error: timeline.error };

  const heading = documentType === "certificate" ? "NO DUES CERTIFICATE" : "REQUEST FOR NO DUES CERTIFICATE AND RELEASE OF DOCUMENTS";

  const accountBlock = [
    `Account holder: ${borrowerName || "[Borrower's name]"}`,
    coBorrowerName ? `Co-borrower: ${coBorrowerName}` : null,
    `Account type: ${account.label}`,
    `Account / loan number: ${accountNumber || "[Account number]"}`,
    sanctionAmount ? `Amount sanctioned: ${sanctionAmount}` : null,
    sanctionDate ? `Sanctioned on: ${longDate(sanctionDate)}` : null,
    `Date of full repayment / closure: ${longDate(closureDate) || "[closure date]"}`,
    closureAmount ? `Final amount paid: ${closureAmount}` : null,
    closureMode ? `Paid by: ${closureMode}` : null,
    propertyDescription ? `Security / property: ${propertyDescription}` : null,
  ].filter(Boolean);

  const itemLines = items.length
    ? items.map((item, index) => `${index + 1}. ${item}`)
    : ["1. [List the original documents to be released]"];

  const certificate = [
    lenderName || "[Lender's name]",
    branchName ? `${branchName} branch` : null,
    lenderAddress || null,
    "",
    [place, letterDate ? longDate(letterDate) : ""].filter(Boolean).join(", "),
    "",
    heading,
    "",
    "This is to certify that the account described below has been fully repaid and closed, and that no amount whatsoever remains due and payable to us in respect of it.",
    "",
    ...accountBlock,
    "",
    `As on ${longDate(closureDate) || "[closure date]"} the outstanding balance in the above account is NIL. All dues towards principal, interest, charges and other amounts stand fully settled.`,
    "",
    account.securedByDocuments
      ? "We confirm that the charge created in our favour has been or is being satisfied in the relevant registry, and the following original documents are being released to the borrower:"
      : "We confirm that no security was held by us in respect of this account, and the following are being released or issued to the borrower:",
    ...itemLines,
    "",
    account.securedByDocuments
      ? `In terms of the Reserve Bank of India circular dated 13 September 2023 on release of movable and immovable property documents, these documents are to be released and any registered charge removed within ${DOCUMENT_RELEASE_DAYS} days of full repayment, that is by ${longDate(timeline.dueDate)}.`
      : null,
    "",
    "We also confirm that the closure of this account will be reported to the credit information companies in the next reporting cycle.",
    "",
    "This certificate is issued at the request of the borrower.",
    "",
    "For " + (lenderName || "[Lender's name]"),
    "",
    "____________________________",
    signatoryName || "[Authorised signatory]",
    signatoryDesignation || "[Designation]",
    "(Branch seal)",
  ];

  const request = [
    [place, letterDate ? longDate(letterDate) : ""].filter(Boolean).join(", "),
    "",
    "To,",
    "The Branch Manager",
    lenderName || "[Lender's name]",
    branchName ? `${branchName} branch` : null,
    lenderAddress || null,
    "",
    `Subject: ${heading.toLowerCase().replace(/^./, (c) => c.toUpperCase())} — ${account.label} account ${accountNumber || "[account number]"}`,
    "",
    "Dear Sir / Madam,",
    "",
    "I have fully repaid the account described below and request you to issue a no dues certificate and release the original documents held by you.",
    "",
    ...accountBlock,
    "",
    "Please issue the following:",
    ...itemLines,
    "",
    account.securedByDocuments
      ? `The Reserve Bank of India circular dated 13 September 2023 requires a regulated entity to release all original movable and immovable property documents and to remove any charge registered with a registry within ${DOCUMENT_RELEASE_DAYS} days of full repayment or settlement. On the closure date above that period ends on ${longDate(timeline.dueDate)}. The same circular provides that where the delay beyond that period is attributable to the lender, the borrower is to be compensated at ${rupees(DELAY_COMPENSATION_PER_DAY)} for each day of delay.`
      : "Please also confirm in writing that the account is closed and that nothing further is payable by me.",
    documentsLost
      ? `I understand that where original documents are lost or damaged the circular allows a further ${LOST_DOCUMENT_EXTRA_DAYS} days to assist me in obtaining certified copies, with the costs borne by the lender. Please confirm the position in writing.`
      : null,
    "",
    "Please also arrange to report the closure to all credit information companies so that my credit report reflects a closed account with a nil balance.",
    "",
    "I would be grateful for written confirmation and an acknowledged copy of this letter.",
    "",
    "Yours faithfully,",
    "",
    "",
    borrowerName || "[Your name]",
    borrowerAddress || null,
  ];

  const document = (documentType === "certificate" ? certificate : request)
    .filter((item) => item !== null)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return {
    document,
    timeline,
    heading,
    wordCount: document.split(/\s+/).filter(Boolean).length,
    characterCount: document.length,
  };
}
