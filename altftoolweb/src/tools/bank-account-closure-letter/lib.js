/**
 * Bank account closure request letter builder (India).
 *
 * Rules and conventions referenced:
 *  - Closure charge window: the schedule of charges published by most Indian
 *    banks, following the Code of Bank's Commitment to Customers, waives the
 *    account closure charge when the account is closed within 14 days of
 *    opening, and again once the account has run for 12 months or more. A
 *    closure charge may be levied only in between. Every bank publishes its own
 *    amount, so this tool takes the charge as an input rather than assuming one.
 *  - Inoperative accounts: RBI's Master Direction on Inoperative Accounts and
 *    Unclaimed Deposits treats a savings or current account with no
 *    customer-induced transaction for two years as inoperative.
 *  - Unclaimed deposits: section 26A of the Banking Regulation Act, 1949 and
 *    the Depositor Education and Awareness (DEA) Fund Scheme, 2014 require a
 *    credit balance untouched for ten years to be transferred to the DEA Fund;
 *    the depositor keeps the right to claim it from the bank afterwards.
 *  - Nomination: section 45ZA of the Banking Regulation Act, 1949.
 *  - Closing an account does not close the loan, locker or demat relationship
 *    linked to it; those have separate closure formalities.
 */

/* ------------------------------------------------------------------ dates */

const MS_PER_DAY = 86_400_000;

export function parseISODate(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date;
}

const toISO = (date) => date.toISOString().slice(0, 10);

export function addDaysISO(isoDate, days) {
  const date = parseISODate(isoDate);
  if (!date || !Number.isFinite(days)) return null;
  return toISO(new Date(date.getTime() + Math.round(days) * MS_PER_DAY));
}

export function addYearsISO(isoDate, years) {
  const date = parseISODate(isoDate);
  if (!date || !Number.isFinite(years)) return null;
  const y = date.getUTCFullYear() + Math.round(years);
  const m = date.getUTCMonth();
  const d = date.getUTCDate();
  const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return toISO(new Date(Date.UTC(y, m, Math.min(d, lastDay))));
}

export function daysBetweenISO(fromISO, toISODate) {
  const from = parseISODate(fromISO);
  const to = parseISODate(toISODate);
  if (!from || !to) return null;
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

/** Whole calendar months completed between two dates. */
export function monthsBetweenISO(fromISO, toISODate) {
  const from = parseISODate(fromISO);
  const to = parseISODate(toISODate);
  if (!from || !to || to.getTime() < from.getTime()) return null;
  let months = (to.getUTCFullYear() - from.getUTCFullYear()) * 12 + (to.getUTCMonth() - from.getUTCMonth());
  if (to.getUTCDate() < from.getUTCDate()) months -= 1;
  return Math.max(0, months);
}

export function formatLongDate(isoDate) {
  const date = parseISODate(isoDate);
  if (!date) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/* --------------------------------------------------------------- constants */

/** Closure within this many days of opening is free at most Indian banks. */
export const FREE_CLOSURE_COOLING_DAYS = 14;
/** Once the account is this many months old, closure is free again. */
export const FREE_CLOSURE_AFTER_MONTHS = 12;
/** RBI Master Direction on Inoperative Accounts and Unclaimed Deposits. */
export const INOPERATIVE_AFTER_YEARS = 2;
/** BR Act, 1949 s.26A and the DEA Fund Scheme, 2014. */
export const DEA_FUND_TRANSFER_YEARS = 10;
/** Upper sanity bound on a closure charge entered by the user. */
export const MAX_CLOSURE_CHARGE = 5000;

export const FEE_BAND = {
  COOLING: "cooling",
  CHARGEABLE: "chargeable",
  MATURE: "mature",
};

export const ACCOUNT_TYPES = [
  { id: "savings", label: "Savings account", noun: "savings account" },
  { id: "current", label: "Current account", noun: "current account" },
  { id: "salary", label: "Salary account", noun: "salary account" },
  { id: "nre", label: "NRE account", noun: "NRE account" },
  { id: "nro", label: "NRO account", noun: "NRO account" },
  { id: "joint", label: "Joint savings account", noun: "joint savings account" },
  { id: "basic", label: "Basic savings (BSBDA)", noun: "basic savings bank deposit account" },
];

export const CLOSURE_REASONS = [
  { id: "relocation", label: "Relocating to another city", line: "I am relocating and there is no branch of your bank convenient to my new address" },
  { id: "consolidate", label: "Consolidating multiple accounts", line: "I am consolidating my banking into a single account and no longer need this one" },
  { id: "charges", label: "Minimum balance or charges", line: "the minimum balance requirement and associated charges no longer suit my needs" },
  { id: "service", label: "Service issues", line: "I have decided to move my banking elsewhere" },
  { id: "salary-changed", label: "Changed employer, salary account lapsed", line: "I have changed employers and this salary account has lapsed into a regular savings account with a minimum balance requirement" },
  { id: "duplicate", label: "Duplicate or unused account", line: "this account is a duplicate that I no longer operate" },
  { id: "abroad", label: "Moving abroad", line: "I am moving abroad and will not be able to operate this account" },
  { id: "other", label: "Other reason", line: "of the reason set out below" },
];

export const ENCLOSURE_ITEMS = [
  { id: "cheque", label: "Unused cheque leaves", detail: "Banks require every unused leaf back, or a written declaration that they have been destroyed." },
  { id: "debit-card", label: "Debit / ATM card, cut across the chip", detail: "Hand it over at the counter; ask for the surrender to be noted on your acknowledgement." },
  { id: "passbook", label: "Passbook", detail: "Ask for it to be stamped 'account closed' and returned to you." },
  { id: "kyc", label: "Self-attested KYC copies", detail: "PAN or Form 60 and one officially valid document, as the branch's KYC record requires." },
  { id: "closure-form", label: "The bank's own account closure form", detail: "Most banks will not act on a plain letter alone; the branch form has to be signed by every holder." },
  { id: "nef", label: "Cancelled cheque of the destination account", detail: "Needed so the closing balance can be credited by NEFT to the right account." },
];

export function accountTypeById(id) {
  return ACCOUNT_TYPES.find((item) => item.id === id) || ACCOUNT_TYPES[0];
}

export function reasonById(id) {
  return CLOSURE_REASONS.find((item) => item.id === id) || CLOSURE_REASONS[CLOSURE_REASONS.length - 1];
}

/* ---------------------------------------------------------- assessment */

/**
 * Work out how old the account is on the closure date, which closure-charge
 * band it falls in, and the inoperative / DEA Fund milestones.
 * Pure: dates come in as arguments.
 */
export function assessClosure({ openingDateISO, closureDateISO, closureCharge, lastTransactionISO }) {
  if (!parseISODate(openingDateISO)) return { error: "Enter a valid account opening date." };
  if (!parseISODate(closureDateISO)) return { error: "Enter a valid date for the closure request." };

  const ageDays = daysBetweenISO(openingDateISO, closureDateISO);
  if (ageDays < 0) return { error: "The closure request date is before the account was opened." };

  const charge = Number(closureCharge);
  if (!Number.isFinite(charge) || charge < 0 || charge > MAX_CLOSURE_CHARGE) {
    return { error: `The closure charge must be between 0 and ${MAX_CLOSURE_CHARGE}.` };
  }

  const ageMonths = monthsBetweenISO(openingDateISO, closureDateISO);

  let band = FEE_BAND.CHARGEABLE;
  if (ageDays <= FREE_CLOSURE_COOLING_DAYS) band = FEE_BAND.COOLING;
  else if (ageMonths >= FREE_CLOSURE_AFTER_MONTHS) band = FEE_BAND.MATURE;

  const expectedCharge = band === FEE_BAND.CHARGEABLE ? charge : 0;

  const anchorISO = parseISODate(lastTransactionISO) ? lastTransactionISO : openingDateISO;
  const inoperativeOnISO = addYearsISO(anchorISO, INOPERATIVE_AFTER_YEARS);
  const deaFundOnISO = addYearsISO(anchorISO, DEA_FUND_TRANSFER_YEARS);
  const daysSinceActivity = daysBetweenISO(anchorISO, closureDateISO);

  return {
    ageDays,
    ageMonths,
    band,
    expectedCharge,
    freeUntilISO: addDaysISO(openingDateISO, FREE_CLOSURE_COOLING_DAYS),
    chargeEndsISO: addYearsISO(openingDateISO, 1),
    inoperativeOnISO,
    deaFundOnISO,
    daysSinceActivity,
    alreadyInoperative: daysSinceActivity >= INOPERATIVE_AFTER_YEARS * 365,
  };
}

/* ---------------------------------------------------------------- letter */

const clean = (value) => (typeof value === "string" ? value.trim() : "");
const or = (value, fallback) => clean(value) || fallback;

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export function formatINR(value) {
  return INR.format(Number.isFinite(Number(value)) ? Number(value) : 0);
}

/** Render a month count as "N years, M months" once it passes two years. */
export function formatAccountAge(totalMonths) {
  const months = Number(totalMonths);
  if (!Number.isFinite(months) || months < 0) return "0 months";
  if (months < 24) return `${Math.round(months)} month${Math.round(months) === 1 ? "" : "s"}`;
  const years = Math.floor(months / 12);
  const rest = Math.round(months) % 12;
  return rest === 0
    ? `${years} year${years === 1 ? "" : "s"}`
    : `${years} year${years === 1 ? "" : "s"} and ${rest} month${rest === 1 ? "" : "s"}`;
}

/** Mask all but the last four characters of an account number. */
export function maskAccountNumber(value) {
  const digits = clean(value).replace(/\s/g, "");
  if (digits.length <= 4) return digits;
  return `${"X".repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}`;
}

export function buildClosureLetter({
  holderName,
  jointHolderNames,
  accountNumber,
  accountTypeId,
  customerId,
  branchName,
  bankName,
  branchAddress,
  addressee,
  reasonId,
  reasonDetail,
  closureDateISO,
  balanceAmount,
  destinationBank,
  destinationAccount,
  destinationIfsc,
  destinationHolder,
  payoutMode,
  enclosureIds = [],
  registeredPhone,
  registeredEmail,
  postalAddress,
  assessment,
}) {
  if (!assessment || assessment.error) {
    return { error: assessment?.error || "Fix the dates before drafting the letter." };
  }
  const balance = Number(balanceAmount);
  if (!Number.isFinite(balance) || balance < 0) {
    return { error: "Enter the closing balance as a number of zero or more." };
  }

  const name = or(holderName, "[Your full name]");
  const account = or(accountNumber, "[Account number]");
  const type = accountTypeById(accountTypeId);
  const bank = or(bankName, "[Bank name]");
  const branch = or(branchName, "[Branch name]");
  const to = or(addressee, "The Branch Manager");
  const reason = reasonById(reasonId);
  const detail = clean(reasonDetail);
  const joint = clean(jointHolderNames);

  const reasonText = reason.id === "other" && detail ? detail : reason.line;

  const payoutLine =
    payoutMode === "cheque"
      ? `Please issue the closing balance of ${formatINR(balance)} as a banker's cheque or demand draft in favour of ${or(destinationHolder, name)}, which I will collect from the branch.`
      : payoutMode === "cash"
        ? `Please pay the closing balance of ${formatINR(balance)} in cash at the counter, subject to the branch's cash payment limits, against my signature and photo identity.`
        : `Please transfer the closing balance of ${formatINR(balance)} by NEFT to the account below:\n  Account holder: ${or(destinationHolder, name)}\n  Bank: ${or(destinationBank, "[destination bank]")}\n  Account number: ${or(destinationAccount, "[destination account number]")}\n  IFSC: ${or(destinationIfsc, "[IFSC code]")}`;

  const enclosures = ENCLOSURE_ITEMS.filter((item) => enclosureIds.includes(item.id));
  const enclosureLines =
    enclosures.length > 0
      ? enclosures.map((item, index) => `${index + 1}. ${item.label}`)
      : ["1. Self-attested KYC copies"];

  const chargeLine =
    assessment.band === FEE_BAND.COOLING
      ? `The account is only ${assessment.ageDays} day(s) old, which is within the ${FREE_CLOSURE_COOLING_DAYS}-day window in which no account closure charge is normally levied. Please confirm if your schedule of charges says otherwise.`
      : assessment.band === FEE_BAND.MATURE
        ? `The account has been open for ${formatAccountAge(assessment.ageMonths)}, which is more than ${FREE_CLOSURE_AFTER_MONTHS} months, so I understand no account closure charge applies. Please confirm before debiting anything.`
        : `The account is ${assessment.ageDays} days old, which falls between the ${FREE_CLOSURE_COOLING_DAYS}-day window and ${FREE_CLOSURE_AFTER_MONTHS} months, so a closure charge of up to ${formatINR(assessment.expectedCharge)} may apply under your schedule of charges. Please tell me the exact amount in writing before it is debited.`;

  const subject = `Request to close ${type.noun} no. ${account} — ${name}`;

  const body = [
    formatLongDate(closureDateISO),
    "",
    "To,",
    `${to},`,
    `${bank}, ${branch} Branch`,
    clean(branchAddress),
    "",
    `Subject: ${subject}`,
    "",
    "Dear Sir / Madam,",
    "",
    `I am ${name}, holder of ${type.noun} number ${account}${clean(customerId) ? ` (Customer ID ${clean(customerId)})` : ""} at your ${branch} branch.${joint ? ` The account is held jointly with ${joint}, and all holders have signed this request.` : ""}`,
    "",
    `I request you to close this account with effect from ${formatLongDate(closureDateISO)}, as ${reasonText}.`,
    detail && reason.id !== "other" ? detail : "",
    "",
    payoutLine,
    "",
    chargeLine,
    "",
    "Enclosed with this letter:",
    ...enclosureLines,
    "",
    "I confirm that no cheque issued by me on this account is pending presentation, that there is no lien, loan, overdraft or standing instruction outstanding against it, and that I have moved every ECS mandate, SIP and auto-debit to my other account. I also confirm that no credit is expected into this account.",
    "",
    "Please deactivate internet banking, mobile banking, UPI handles and any linked debit card at the same time, and stop all further charges on the account from the date of this request.",
    "",
    "Kindly issue an acknowledgement of this request today, and a written account closure confirmation once the account is closed. I would also like a final statement of account for my records.",
    "",
    "Thank you.",
    "",
    "Yours faithfully,",
    "",
    name,
    ...(joint ? [`Joint holder(s): ${joint}`] : []),
    `Account: ${maskAccountNumber(account)}`,
    clean(registeredPhone) ? `Registered mobile: ${clean(registeredPhone)}` : "Registered mobile: [as in bank records]",
    clean(registeredEmail) ? `Registered email: ${clean(registeredEmail)}` : "Registered email: [as in bank records]",
    clean(postalAddress) ? `Address: ${clean(postalAddress)}` : "Address: [your postal address]",
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return {
    subject,
    body,
    wordCount: body.split(/\s+/).filter(Boolean).length,
    maskedAccount: maskAccountNumber(account),
    enclosures,
  };
}
