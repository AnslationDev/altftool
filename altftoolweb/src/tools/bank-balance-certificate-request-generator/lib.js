/**
 * Bank Balance Certificate Request Generator (visa format).
 *
 * Two things go wrong with balance certificates for visa applications: the
 * amount is too low for the length of the trip, and the certificate is stale
 * or covers the wrong period by the time it reaches the consulate. This module
 * computes both, then drafts the request to the branch manager.
 *
 * The rules encoded here:
 *  - Schengen Visa Code (Regulation (EC) No 810/2009), Article 14(1)(c) and
 *    Article 21: an applicant must supply information allowing the consulate to
 *    assess means of subsistence for the stay and for the return journey.
 *    Article 21(5) has each Member State publish reference amounts per day of
 *    stay, and those amounts differ by country and by whether accommodation is
 *    already paid for.
 *  - France publishes the reference amounts used as defaults below —
 *    EUR 120 per day with no proof of accommodation, EUR 65 per day where
 *    accommodation is prepaid, and EUR 32.50 per day where the traveller holds
 *    an attestation d'accueil (a hosting certificate). Other Schengen states
 *    publish their own figures, so the per-day amount is editable and must be
 *    checked against the consulate you are applying to.
 *  - Schengen short-stay visas allow at most SCHENGEN_MAX_STAY_DAYS days of
 *    stay in any 180-day period (Schengen Borders Code, Article 6(1)), which
 *    is why a longer trip is flagged.
 *  - Consulates commonly require a certificate issued recently (30 days is the
 *    usual outer limit) together with statements covering the last 3 or 6
 *    months. Both windows are inputs, and the tool reports the earliest date
 *    the certificate may bear and the date the statement period must start.
 *
 * Nothing here is legal or financial advice, and no figure below substitutes
 * for the requirement published by the consulate handling your application.
 */

/** Maximum days of stay a Schengen short-stay visa allows in any 180 days. */
export const SCHENGEN_MAX_STAY_DAYS = 90;
/** Usual outer limit on how old a balance certificate may be at submission. */
export const DEFAULT_CERT_MAX_AGE_DAYS = 30;
/** Statement history consulates most often ask for, in months. */
export const DEFAULT_STATEMENT_MONTHS = 6;
/** Largest sensible trip length this tool will size funds for. */
const MAX_TRIP_DAYS = 365;
/** Free-text field cap. */
const MAX_FIELD = 120;

const MS_PER_DAY = 86400000;

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

/**
 * Accommodation situations and the per-day reference amount France publishes
 * for each. Used as editable defaults, not as a universal rule.
 */
export const ACCOMMODATION_BASIS = [
  {
    id: "none",
    label: "No accommodation booked or prepaid",
    perDay: 120,
    note: "France's published reference amount where the traveller has no proof of accommodation.",
  },
  {
    id: "prepaid",
    label: "Hotel or stay already prepaid",
    perDay: 65,
    note: "France's published reference amount where accommodation is prepaid and evidenced.",
  },
  {
    id: "attestation",
    label: "Staying with a host (attestation d'accueil)",
    perDay: 32.5,
    note: "France's published reference amount where the traveller holds a hosting certificate.",
  },
];

/** Which certificate wording the bank should be asked for. */
export const CERTIFICATE_STYLES = [
  {
    id: "balance-only",
    label: "Balance certificate only",
    ask: "a balance certificate stating the closing balance in the account as on the date of issue",
  },
  {
    id: "balance-average",
    label: "Balance certificate with average balance",
    ask: "a balance certificate stating the closing balance as on the date of issue together with the average monthly balance maintained over the statement period",
  },
  {
    id: "balance-statement",
    label: "Balance certificate plus stamped statements",
    ask: "a balance certificate stating the closing balance as on the date of issue, along with account statements for the period below, each page stamped and signed by the branch",
  },
];

function clean(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

/**
 * Parse yyyy-mm-dd into a UTC-midnight timestamp, or null when not a real date.
 * @param {string} iso
 * @returns {number|null}
 */
export function parseIsoDate(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso ?? "").trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const stamp = Date.UTC(year, month - 1, day);
  const check = new Date(stamp);
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    return null;
  }
  return stamp;
}

function formatStamp(stamp) {
  const date = new Date(stamp);
  return `${date.getUTCDate()} ${MONTH_NAMES[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

function isoOf(stamp) {
  return new Date(stamp).toISOString().slice(0, 10);
}

/**
 * Subtract whole calendar months from a date, clamping to the last day of the
 * target month (30 March minus 1 month is 28 or 29 February, never 2 March).
 * @param {number} stamp  UTC-midnight timestamp.
 * @param {number} months Whole months to subtract.
 * @returns {number} UTC-midnight timestamp.
 */
export function subtractMonths(stamp, months) {
  const date = new Date(stamp);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const targetMonthIndex = month - months;
  const lastDayOfTarget = new Date(Date.UTC(year, targetMonthIndex + 1, 0)).getUTCDate();
  return Date.UTC(year, targetMonthIndex, Math.min(day, lastDayOfTarget));
}

/**
 * Size the funds and draft the request.
 *
 * Funds required = days of stay x per-day reference amount, uplifted by the
 * buffer percentage. Days of stay counts both the arrival and the departure
 * day, which is how per-day subsistence amounts are applied.
 *
 * @param {object} input
 * @param {string} input.tripStart        yyyy-mm-dd.
 * @param {string} input.tripEnd          yyyy-mm-dd.
 * @param {string} input.appointmentDate  yyyy-mm-dd of the visa appointment / submission.
 * @param {string} input.requestDate      yyyy-mm-dd the letter is written.
 * @param {number} input.perDayAmount     Reference amount per day, in the destination currency.
 * @param {number} input.bufferPercent    Extra margin over the reference amount.
 * @param {number} input.exchangeRate     INR per one unit of the destination currency.
 * @param {number} input.currentBalanceInr Balance currently in the account, in INR.
 * @param {number} input.certMaxAgeDays   Days the consulate allows the certificate to be old.
 * @param {number} input.statementMonths  Months of statements required.
 * @param {string} input.styleId          One of CERTIFICATE_STYLES ids.
 * @param {string} input.applicantName
 * @param {string} input.accountNumber
 * @param {string} input.branchName
 * @param {string} input.destination      Country or consulate the visa is for.
 * @returns {object|{error:string}}
 */
export function buildBalanceCertificateRequest({
  tripStart,
  tripEnd,
  appointmentDate,
  requestDate,
  perDayAmount,
  bufferPercent = 0,
  exchangeRate,
  currentBalanceInr = 0,
  certMaxAgeDays = DEFAULT_CERT_MAX_AGE_DAYS,
  statementMonths = DEFAULT_STATEMENT_MONTHS,
  styleId,
  applicantName,
  accountNumber,
  branchName,
  destination,
}) {
  const style = CERTIFICATE_STYLES.find((s) => s.id === styleId);
  if (!style) return { error: "Choose which kind of certificate to ask the bank for." };

  const start = parseIsoDate(tripStart);
  const end = parseIsoDate(tripEnd);
  const appointment = parseIsoDate(appointmentDate);
  const letterStamp = parseIsoDate(requestDate);
  if (start === null) return { error: "Enter a valid trip start date." };
  if (end === null) return { error: "Enter a valid trip end date." };
  if (appointment === null) return { error: "Enter a valid appointment or submission date." };
  if (letterStamp === null) return { error: "Enter a valid date for the letter." };
  if (end < start) return { error: "The trip end date is before the start date." };

  const tripDays = Math.round((end - start) / MS_PER_DAY) + 1;
  const tripNights = tripDays - 1;
  if (tripDays > MAX_TRIP_DAYS) {
    return { error: `This tool sizes funds for trips up to ${MAX_TRIP_DAYS} days.` };
  }

  const perDay = Number(perDayAmount);
  if (!Number.isFinite(perDay) || perDay <= 0) {
    return { error: "Enter the per-day reference amount published by the consulate, greater than zero." };
  }
  const buffer = Number(bufferPercent);
  if (!Number.isFinite(buffer) || buffer < 0 || buffer > 200) {
    return { error: "The safety buffer must be between 0 and 200 percent." };
  }
  const rate = Number(exchangeRate);
  if (!Number.isFinite(rate) || rate <= 0) {
    return { error: "Enter the exchange rate in rupees per unit of the destination currency, greater than zero." };
  }
  const balance = Number(currentBalanceInr);
  if (!Number.isFinite(balance) || balance < 0) {
    return { error: "Enter the current balance as a number of rupees, zero or more." };
  }
  const maxAge = Number(certMaxAgeDays);
  if (!Number.isFinite(maxAge) || !Number.isInteger(maxAge) || maxAge < 1 || maxAge > 365) {
    return { error: "The certificate validity window must be a whole number of days between 1 and 365." };
  }
  const months = Number(statementMonths);
  if (!Number.isFinite(months) || !Number.isInteger(months) || months < 1 || months > 24) {
    return { error: "The statement period must be a whole number of months between 1 and 24." };
  }

  const name = clean(applicantName);
  const account = clean(accountNumber);
  const branch = clean(branchName);
  const country = clean(destination);
  if (!name) return { error: "Enter the account holder's name." };
  if (!account) return { error: "Enter the account number the certificate is for." };
  if (!branch) return { error: "Enter the branch the letter is addressed to." };
  if (!country) return { error: "Enter the country or consulate the visa is for." };
  if ([name, account, branch, country].some((v) => v.length > MAX_FIELD)) {
    return { error: `Keep each field under ${MAX_FIELD} characters.` };
  }

  const baseForeign = perDay * tripDays;
  const requiredForeign = baseForeign * (1 + buffer / 100);
  const requiredInr = requiredForeign * rate;
  const shortfallInr = Math.max(0, requiredInr - balance);
  const meetsRequirement = balance >= requiredInr;

  const certificateValidFrom = appointment - maxAge * MS_PER_DAY;
  const statementFrom = subtractMonths(appointment, months);

  const warnings = [];
  if (tripDays > SCHENGEN_MAX_STAY_DAYS) {
    warnings.push(
      `The trip is ${tripDays} days. A Schengen short-stay visa permits at most ${SCHENGEN_MAX_STAY_DAYS} days of stay in any 180-day period, so a longer visit needs a national long-stay visa.`,
    );
  }
  if (letterStamp < certificateValidFrom) {
    warnings.push(
      `A certificate issued on ${formatStamp(letterStamp)} would be more than ${maxAge} days old by the appointment on ${formatStamp(appointment)}. Ask the bank for it on or after ${formatStamp(certificateValidFrom)}.`,
    );
  }
  if (letterStamp > appointment) {
    warnings.push("The letter is dated after the appointment — the certificate would arrive too late.");
  }
  if (!meetsRequirement) {
    warnings.push(
      `The balance is short of the computed requirement. Top up before asking for the certificate, or add a sponsor's funds with a sponsorship letter and their statements.`,
    );
  }

  const letter = [
    `Date: ${formatStamp(letterStamp)}`,
    "",
    "To,",
    "The Branch Manager,",
    branch,
    "",
    `Subject: Request for a bank balance certificate for a visa application — Account No. ${account}`,
    "",
    "Dear Sir / Madam,",
    "",
    `I, ${name}, hold savings account number ${account} at your branch. I am applying for a visa to ${country} and the consulate requires documentary proof of my means of subsistence for the visit.`,
    "",
    `I therefore request ${style.ask}. The visa appointment is on ${formatStamp(appointment)}, and the consulate accepts a certificate issued within ${maxAge} days of submission, so a certificate dated on or after ${formatStamp(certificateValidFrom)} will be in order. The statement period required is from ${formatStamp(statementFrom)} to the date of issue.`,
    "",
    "So that the document is accepted, I request that it be issued on the branch letterhead, addressed \"To Whomsoever It May Concern\", and that it carry the account holder's full name exactly as it appears in the passport, the account number and type, the date the account was opened, the closing balance in figures and in words, the branch address with the IFSC code, and the signature, name, designation and employee code of the authorised signatory along with the branch round stamp.",
    "",
    `My travel is planned from ${formatStamp(start)} to ${formatStamp(end)}, a stay of ${tripDays} day${tripDays === 1 ? "" : "s"}.`,
    "",
    "I am willing to pay any applicable charges and can collect the certificate from the branch. Kindly let me know if any further formality is required.",
    "",
    "Thank you.",
    "",
    "Yours faithfully,",
    "",
    name,
    `Account No. ${account}`,
  ].join("\n");

  return {
    tripDays,
    tripNights,
    perDay,
    baseForeign,
    requiredForeign,
    requiredInr,
    currentBalanceInr: balance,
    shortfallInr,
    meetsRequirement,
    certificateValidFromIso: isoOf(certificateValidFrom),
    certificateValidFromLong: formatStamp(certificateValidFrom),
    statementFromIso: isoOf(statementFrom),
    statementFromLong: formatStamp(statementFrom),
    warnings,
    letter,
  };
}
