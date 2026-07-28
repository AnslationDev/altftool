/**
 * Cheque stop payment request builder (India-focused).
 *
 * Pure module - no React, no DOM, no clocks. Dates are arguments.
 *
 * The rules the arithmetic rests on:
 *
 *  - VALIDITY. Following the Reserve Bank of India's directive effective
 *    1 April 2012, a cheque, demand draft, pay order or banker's cheque is
 *    payable within THREE months of the date it bears (reduced from six).
 *    A cheque past that date is stale and cannot be presented, so a stop
 *    payment on it is pointless - the clock has already done the job.
 *
 *  - IFSC FORMAT. An Indian Financial System Code is 11 characters: four
 *    letters identifying the bank, then a mandatory '0', then six characters
 *    identifying the branch.
 *
 *  - MICR CODE. The MICR band carries a 9-digit code (3 city + 3 bank +
 *    3 branch), and the cheque serial number field is 6 digits under the
 *    CTS-2010 standard.
 *
 *  - SECTION 138. Under the Negotiable Instruments Act, 1881, dishonour of a
 *    cheque issued to discharge a legally enforceable debt is an offence.
 *    Indian courts have held that instructing the bank to stop payment does
 *    not by itself put such a cheque outside section 138. Stopping payment on
 *    a genuine debt is therefore not a way out of it.
 *
 * Informational only - not legal or financial advice.
 */

// RBI directive effective 1 April 2012: cheques are payable within 3 months
// of the date they bear.
export const CHEQUE_VALIDITY_MONTHS = 3;

// GST on banking and financial services in India is 18%, so a stop-payment
// charge is quoted plus tax. Override where a different rate applies.
export const DEFAULT_BANKING_GST_PERCENT = 18;

// A single request covering more than this many cheques is normally handled as
// a lost-chequebook report instead.
export const MAX_CHEQUES_IN_RANGE = 100;

export const MAX_TAX_PERCENT = 40;

// 4 letters (bank) + mandatory 0 + 6 alphanumeric (branch).
export const IFSC_PATTERN = /^[A-Z]{4}0[A-Z0-9]{6}$/;
// MICR band: 3-digit city + 3-digit bank + 3-digit branch.
export const MICR_PATTERN = /^\d{9}$/;
// CTS-2010 cheque serial number field.
export const CHEQUE_NUMBER_PATTERN = /^\d{6}$/;

export const STOP_REASONS = [
  { id: "lost", label: "Cheque lost in transit or misplaced", needsPolice: false, urgent: true },
  { id: "stolen", label: "Cheque or chequebook stolen", needsPolice: true, urgent: true },
  { id: "wrongAmount", label: "Wrong amount or wrong date written", needsPolice: false, urgent: false },
  { id: "wrongPayee", label: "Wrong payee name", needsPolice: false, urgent: false },
  { id: "duplicate", label: "Payment already made by another route", needsPolice: false, urgent: false },
  { id: "dispute", label: "Goods or services not delivered as agreed", needsPolice: false, urgent: false },
  { id: "accountClosing", label: "Account being closed", needsPolice: false, urgent: false },
];

export const CHARGE_MODES = [
  { id: "perCheque", label: "Charged per cheque" },
  { id: "perRequest", label: "One charge for the whole request" },
];

export const ACCOUNT_TYPES = [
  { id: "savings", label: "Savings account" },
  { id: "current", label: "Current account" },
  { id: "od", label: "Overdraft / cash credit account" },
];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidIsoDate(value) {
  if (typeof value !== "string" || !ISO_DATE.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const check = new Date(Date.UTC(y, m - 1, d));
  return check.getUTCFullYear() === y && check.getUTCMonth() === m - 1 && check.getUTCDate() === d;
}

export function formatLongDate(iso) {
  if (!isValidIsoDate(iso)) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTH_NAMES[m - 1]} ${y}`;
}

/** Add whole months, clamping the day to the end of the target month. */
export function addMonthsIso(iso, months) {
  if (!isValidIsoDate(iso) || !Number.isFinite(months)) return null;
  const [y, m, d] = iso.split("-").map(Number);
  const zeroBased = m - 1 + Math.trunc(months);
  const targetYear = y + Math.floor(zeroBased / 12);
  const targetMonth = ((zeroBased % 12) + 12) % 12;
  const daysInMonth = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  const pad = (n) => String(n).padStart(2, "0");
  return `${targetYear}-${pad(targetMonth + 1)}-${pad(Math.min(d, daysInMonth))}`;
}

export function daysBetweenIso(fromIso, toIso) {
  if (!isValidIsoDate(fromIso) || !isValidIsoDate(toIso)) return null;
  const stamp = (iso) => {
    const [y, m, d] = iso.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((stamp(toIso) - stamp(fromIso)) / 86400000);
}

/**
 * Where a cheque sits in its three-month life.
 * @returns {null|{validUntil, daysSinceIssue, daysRemaining, stale, postDated}}
 */
export function chequeValidity(chequeDateIso, asOfIso) {
  if (!isValidIsoDate(chequeDateIso) || !isValidIsoDate(asOfIso)) return null;
  const validUntil = addMonthsIso(chequeDateIso, CHEQUE_VALIDITY_MONTHS);
  const daysSinceIssue = daysBetweenIso(chequeDateIso, asOfIso);
  const daysRemaining = daysBetweenIso(asOfIso, validUntil);
  return {
    validUntil,
    daysSinceIssue,
    daysRemaining,
    stale: daysRemaining < 0,
    postDated: daysSinceIssue < 0,
  };
}

export function isValidIfsc(value) {
  return IFSC_PATTERN.test(String(value ?? "").trim().toUpperCase());
}

export function isValidChequeNumber(value) {
  return CHEQUE_NUMBER_PATTERN.test(String(value ?? "").trim());
}

const clean = (value) => String(value ?? "").trim();

function lookup(list, id, fallback) {
  return list.find((item) => item.id === id) || fallback;
}

/**
 * Build the stop payment instruction.
 * @returns {{error: string}} on bad input, otherwise the letter and figures.
 */
export function buildStopPaymentRequest(input = {}) {
  const accountHolderName = clean(input.accountHolderName);
  const accountNumber = clean(input.accountNumber);
  const bankName = clean(input.bankName);
  const branchName = clean(input.branchName);
  const ifsc = clean(input.ifsc).toUpperCase();
  const micr = clean(input.micr);
  const payeeName = clean(input.payeeName);
  const contactPhone = clean(input.contactPhone);
  const contactEmail = clean(input.contactEmail);
  const address = clean(input.address);
  const fromChequeNumber = clean(input.fromChequeNumber);
  const toChequeNumber = clean(input.toChequeNumber);
  const chequeDate = clean(input.chequeDate);
  const requestDate = clean(input.requestDate);
  const policeReference = clean(input.policeReference);
  const extraNotes = clean(input.extraNotes);
  const accountTypeId = clean(input.accountTypeId) || "savings";
  const reasonId = clean(input.reasonId) || "lost";
  const chargeModeId = clean(input.chargeModeId) || "perCheque";
  const isRange = Boolean(input.isRange);
  const requestNewChequebook = Boolean(input.requestNewChequebook);

  const amount = Number(input.amount ?? 0);
  const feePerUnit = Number(input.feePerUnit ?? 0);
  const taxPercent = Number(
    input.taxPercent === undefined || input.taxPercent === ""
      ? DEFAULT_BANKING_GST_PERCENT
      : input.taxPercent,
  );

  if (!accountHolderName) return { error: "Enter the account holder's name as it appears on the account." };
  if (!accountNumber) return { error: "Enter the account number the cheque is drawn on." };
  if (!bankName) return { error: "Enter the bank name." };
  if (!isValidChequeNumber(fromChequeNumber)) {
    return { error: "Enter the cheque number as the 6 digits printed in the MICR band at the bottom of the cheque." };
  }
  if (isRange && !isValidChequeNumber(toChequeNumber)) {
    return { error: "Enter the last cheque number in the range as 6 digits." };
  }
  if (ifsc && !isValidIfsc(ifsc)) {
    return { error: "That IFSC is not the right shape. An IFSC is 11 characters: four letters, then a zero, then six more characters." };
  }
  if (micr && !MICR_PATTERN.test(micr)) {
    return { error: "The MICR code is the 9 digits at the far left of the MICR band." };
  }
  if (!isValidIsoDate(chequeDate)) return { error: "Enter the date written on the cheque in YYYY-MM-DD form." };
  if (!isValidIsoDate(requestDate)) return { error: "Enter the date of this request in YYYY-MM-DD form." };

  const first = Number(fromChequeNumber);
  const last = isRange ? Number(toChequeNumber) : first;
  if (isRange && last < first) {
    return { error: "The last cheque number in the range is lower than the first." };
  }
  const chequeCount = last - first + 1;
  if (chequeCount > MAX_CHEQUES_IN_RANGE) {
    return { error: `That range covers ${chequeCount} cheques. Above ${MAX_CHEQUES_IN_RANGE}, banks handle it as a lost-chequebook report rather than a stop payment.` };
  }

  if (!Number.isFinite(amount) || amount < 0) return { error: "The cheque amount cannot be negative. Use 0 if a blank cheque was lost." };
  if (!Number.isFinite(feePerUnit) || feePerUnit < 0) return { error: "The stop payment charge cannot be negative." };
  if (!Number.isFinite(taxPercent) || taxPercent < 0 || taxPercent > MAX_TAX_PERCENT) {
    return { error: `Tax on the charge must be between 0% and ${MAX_TAX_PERCENT}%.` };
  }

  const validity = chequeValidity(chequeDate, requestDate);
  const reason = lookup(STOP_REASONS, reasonId, STOP_REASONS[0]);
  const chargeMode = lookup(CHARGE_MODES, chargeModeId, CHARGE_MODES[0]);
  const accountType = lookup(ACCOUNT_TYPES, accountTypeId, ACCOUNT_TYPES[0]);

  const chargeableUnits = chargeMode.id === "perCheque" ? chequeCount : 1;
  const feeBeforeTax = feePerUnit * chargeableUnits;
  const feeTax = feeBeforeTax * (taxPercent / 100);
  const feeTotal = feeBeforeTax + feeTax;

  const money = (value) => `INR ${Math.round(value).toLocaleString("en-IN")}`;
  const chequeLabel =
    chequeCount === 1
      ? `cheque no. ${fromChequeNumber}`
      : `cheques numbered ${fromChequeNumber} to ${toChequeNumber} (${chequeCount} leaves)`;

  const warnings = [];
  if (validity.stale) {
    warnings.push(`This cheque was dated ${formatLongDate(chequeDate)} and expired on ${formatLongDate(validity.validUntil)}, ${Math.abs(validity.daysRemaining)} days ago. Since the RBI's 2012 directive a cheque is only payable for three months, so it can no longer be presented and a stop payment adds nothing but the fee.`);
  } else if (validity.daysRemaining <= 7) {
    warnings.push(`Only ${validity.daysRemaining} day${validity.daysRemaining === 1 ? "" : "s"} of validity remain (expires ${formatLongDate(validity.validUntil)}). Get the instruction registered today.`);
  }
  if (validity.postDated) {
    warnings.push(`The cheque is post-dated to ${formatLongDate(chequeDate)}, ${Math.abs(validity.daysSinceIssue)} days ahead. Ask the bank to keep the stop instruction live until at least ${formatLongDate(validity.validUntil)}, not just until the cheque date.`);
  }
  if (reason.needsPolice && !policeReference) {
    warnings.push("For a stolen cheque or chequebook, file a police complaint and quote the FIR or acknowledgement number in this letter - banks and courts both expect it.");
  }
  if (reason.id === "dispute" || reason.id === "duplicate") {
    warnings.push("Stopping payment on a cheque issued for a genuine debt does not, on its own, take the cheque outside section 138 of the Negotiable Instruments Act, 1881. If the underlying liability is disputed, take legal advice before stopping the cheque and put your reason to the payee in writing.");
  }
  if (amount === 0) {
    warnings.push("No amount recorded. Where the cheque was signed but blank, say so explicitly - the bank needs to stop it on the number alone.");
  }
  if (!ifsc) {
    warnings.push("Adding the branch IFSC removes any doubt about which branch's records are being amended.");
  }
  if (chequeCount > 1 && chargeMode.id === "perCheque") {
    warnings.push(`Charged per cheque, ${chequeCount} leaves cost ${money(feeTotal)} including tax. Ask whether a single lost-chequebook report is cheaper.`);
  }

  const letterText = [
    formatLongDate(requestDate),
    "",
    "To,",
    "The Branch Manager",
    bankName,
    branchName || "________________________________",
    "",
    `Subject: Stop payment instruction for ${chequeLabel} on account no. ${accountNumber}`,
    "",
    "Dear Sir / Madam,",
    "",
    `I, ${accountHolderName}, hold ${accountType.label.toLowerCase()} number ${accountNumber} at your branch. I request you to stop payment on the following instrument${chequeCount === 1 ? "" : "s"} with immediate effect and to record this instruction against my account.`,
    "",
    "CHEQUE DETAILS",
    chequeCount === 1
      ? `Cheque number: ${fromChequeNumber}`
      : `Cheque numbers: ${fromChequeNumber} to ${toChequeNumber} (${chequeCount} leaves)`,
    `Date on the cheque: ${formatLongDate(chequeDate)}`,
    `Valid for presentation until: ${formatLongDate(validity.validUntil)} (three months from the cheque date, per the RBI directive effective 1 April 2012)`,
    amount > 0 ? `Amount: ${money(amount)}` : "Amount: blank / not written",
    payeeName ? `Payee: ${payeeName}` : "Payee: ________________________",
    ifsc ? `Branch IFSC: ${ifsc}` : null,
    micr ? `MICR code: ${micr}` : null,
    "",
    "REASON",
    reason.label + ".",
    policeReference ? `Police complaint / FIR reference: ${policeReference}.` : null,
    extraNotes || null,
    "",
    "I confirm that:",
    `1. The instrument${chequeCount === 1 ? " has" : "s have"} not been honoured to my knowledge as at the date of this letter.`,
    "2. I accept the bank's stop payment charges and authorise you to debit them to the account above.",
    "3. I will indemnify the bank against any claim arising from acting on this instruction, provided the bank acts in accordance with it.",
    "",
    `Please confirm in writing, quoting a service request number, that the stop payment has been registered and until what date it will remain in force. Please keep the instruction in force until at least ${formatLongDate(validity.validUntil)}.`,
    requestNewChequebook
      ? "\nI also request a fresh chequebook on the same account, to be collected at the branch on production of photo identity."
      : null,
    "",
    `Stop payment charge quoted: ${money(feePerUnit)} ${chargeMode.id === "perCheque" ? "per cheque" : "for the request"}, ${chargeableUnits === 1 ? "" : `x ${chargeableUnits} = ${money(feeBeforeTax)}, `}plus ${taxPercent}% tax = ${money(feeTotal)} in total.`,
    "",
    "Yours faithfully,",
    "",
    "",
    "________________________",
    accountHolderName,
    `Account no.: ${accountNumber}`,
    address || "Address: ________________________________",
    contactPhone ? `Phone: ${contactPhone}` : "Phone: ______________",
    contactEmail ? `Email: ${contactEmail}` : "Email: ______________",
    "",
    "Enclosures: copy of photo identity; copy of the cheque or counterfoil if available; police complaint copy if applicable.",
  ].filter((line) => line !== null).join("\n");

  return {
    letterText,
    validity,
    chequeCount,
    firstCheque: fromChequeNumber,
    lastCheque: isRange ? toChequeNumber : fromChequeNumber,
    amount,
    feePerUnit,
    chargeableUnits,
    feeBeforeTax,
    feeTax,
    feeTotal,
    taxPercent,
    reasonLabel: reason.label,
    chargeModeLabel: chargeMode.label,
    accountTypeLabel: accountType.label,
    ifsc,
    urgent: reason.urgent,
    warnings,
  };
}
