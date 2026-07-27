/**
 * Rent Agreement Renewal Notice Generator — pure logic.
 *
 * Basis (India):
 *  - Registration Act, 1908, Section 17(1)(d): a lease of immovable property
 *    from year to year, or for any term exceeding one year, or reserving a
 *    yearly rent, must be registered. That is why the standard Indian
 *    residential tenancy runs for eleven months and is renewed rather than
 *    granted for a year.
 *  - Model Tenancy Act, 2021, Section 4: a tenancy agreement must be in
 *    writing and intimated to the Rent Authority; a renewal on changed terms
 *    is a fresh agreement and needs the same intimation.
 *  - Model Tenancy Act, 2021, Section 11(1): security deposit capped at two
 *    months' rent for residential premises and six months for non-residential
 *    premises — a renewal that raises the deposit must respect the same cap.
 *
 * The renewal term begins the day after the current term ends, and ends one day
 * before the same date of the month that many months later, so an eleven-month
 * renewal from 1 September ends on 31 July.
 */

/** Term at which registration of the lease deed comes into play. */
export const REGISTRATION_TERM_MONTHS = 12;

/** The standard Indian residential renewal term. */
export const DEFAULT_RENEWAL_TERM_MONTHS = 11;

/** Model Tenancy Act, 2021, Section 11(1) — security deposit ceilings. */
export const DEPOSIT_CAP_MONTHS = Object.freeze({ residential: 2, commercial: 6 });

export const TERM_PRESETS = Object.freeze([
  { months: 11, label: "11 months (avoids registration)" },
  { months: 12, label: "12 months" },
  { months: 24, label: "24 months" },
  { months: 36, label: "36 months" },
]);

const MS_PER_DAY = 86400000;

export function parseISODate(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

export function toISODate(date) {
  return date.toISOString().slice(0, 10);
}

export function addDays(date, days) {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

/** Add whole calendar months, clamping to the last valid day of the month. */
export function addMonths(date, months) {
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  return new Date(
    Date.UTC(
      target.getUTCFullYear(),
      target.getUTCMonth(),
      Math.min(date.getUTCDate(), lastDay),
    ),
  );
}

export function diffDays(from, to) {
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatMoney(value) {
  return inr.format(Number.isFinite(value) ? Math.round(value) : 0);
}

export function formatLongDate(date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/**
 * Work out the renewal term, revised rent and deposit, and the deadlines.
 *
 * @param {object} input
 * @param {string} input.currentEndDate   YYYY-MM-DD, last day of the present term
 * @param {string} input.noticeDate       YYYY-MM-DD, date of the renewal notice
 * @param {number} input.termMonths       length of the renewed term in months
 * @param {number} input.currentRent      present monthly rent
 * @param {number} input.escalationPercent rent escalation for the new term
 * @param {number} input.currentDeposit   deposit presently held
 * @param {boolean} input.reviseDeposit   raise the deposit in proportion
 * @param {number} input.responseDays     days the other side gets to reply
 * @param {number} input.requiredNoticeDays notice the agreement asks for
 * @param {string} input.propertyUse      "residential" | "commercial"
 */
export function computeRenewal(input) {
  const {
    currentEndDate,
    noticeDate,
    termMonths = DEFAULT_RENEWAL_TERM_MONTHS,
    currentRent,
    escalationPercent = 0,
    currentDeposit = 0,
    reviseDeposit = true,
    responseDays = 15,
    requiredNoticeDays = 60,
    propertyUse = "residential",
  } = input || {};

  const numbers = [
    termMonths,
    currentRent,
    escalationPercent,
    currentDeposit,
    responseDays,
    requiredNoticeDays,
  ];
  if (numbers.some((value) => typeof value !== "number" || !Number.isFinite(value))) {
    return { error: "Enter valid numbers for rent, term, deposit and deadlines." };
  }
  if (currentRent <= 0) return { error: "Current monthly rent must be more than zero." };
  if (currentDeposit < 0) return { error: "Security deposit cannot be negative." };
  if (termMonths < 1 || termMonths > 120) {
    return { error: "The renewed term should be between 1 and 120 months." };
  }
  if (escalationPercent < 0 || escalationPercent > 100) {
    return { error: "Escalation should be between 0% and 100%." };
  }
  if (responseDays < 1 || responseDays > 90) {
    return { error: "Give the other side between 1 and 90 days to respond." };
  }

  const currentEnd = parseISODate(currentEndDate);
  const notice = parseISODate(noticeDate);
  if (!currentEnd) return { error: "Enter the current end date as a valid calendar date." };
  if (!notice) return { error: "Enter the notice date as a valid calendar date." };
  if (diffDays(notice, currentEnd) < 0) {
    return { error: "The current term has already ended — a renewal notice needs a live tenancy." };
  }

  const newStart = addDays(currentEnd, 1);
  const newEnd = addDays(addMonths(newStart, Math.round(termMonths)), -1);

  const newRent = Math.round(currentRent * (1 + escalationPercent / 100));
  const rentIncrease = newRent - Math.round(currentRent);
  const totalRentOverTerm = newRent * Math.round(termMonths);

  const capMonths = DEPOSIT_CAP_MONTHS[propertyUse] ?? DEPOSIT_CAP_MONTHS.residential;
  const depositCap = capMonths * newRent;
  const proposedDeposit = reviseDeposit
    ? Math.round((currentDeposit * newRent) / currentRent)
    : Math.round(currentDeposit);
  const newDeposit = Math.min(proposedDeposit, depositCap);
  const depositTopUp = Math.max(0, newDeposit - Math.round(currentDeposit));

  const daysToExpiry = diffDays(notice, currentEnd);
  const noticeAdequate = daysToExpiry >= requiredNoticeDays;
  const responseDeadline = addDays(notice, Math.round(responseDays));
  const responseBeforeExpiry = diffDays(responseDeadline, currentEnd) >= 0;

  return {
    currentEndDate: toISODate(currentEnd),
    noticeDate: toISODate(notice),
    newStartDate: toISODate(newStart),
    newEndDate: toISODate(newEnd),
    termMonths: Math.round(termMonths),
    currentRent: Math.round(currentRent),
    newRent,
    rentIncrease,
    escalationPercent,
    totalRentOverTerm,
    currentDeposit: Math.round(currentDeposit),
    newDeposit,
    depositTopUp,
    depositCap,
    depositCapMonths: capMonths,
    depositCapped: proposedDeposit > depositCap,
    daysToExpiry,
    requiredNoticeDays: Math.round(requiredNoticeDays),
    noticeAdequate,
    noticeShortfallDays: noticeAdequate ? 0 : Math.round(requiredNoticeDays) - daysToExpiry,
    responseDays: Math.round(responseDays),
    responseDeadline: toISODate(responseDeadline),
    responseBeforeExpiry,
    registrationRequired: Math.round(termMonths) >= REGISTRATION_TERM_MONTHS,
    propertyUse,
  };
}

/** Assemble the renewal intimation letter. */
export function buildRenewalNotice(result, details) {
  if (!result || result.error) return "";
  const {
    senderName = "[Your name]",
    senderRole = "landlord",
    recipientName = "[Other party]",
    propertyAddress = "[Property address]",
    agreementDate = "",
    otherChanges = "",
    contact = "",
  } = details || {};

  const agreement = parseISODate(agreementDate);
  const isLandlord = senderRole !== "tenant";
  const lines = [];

  lines.push(`Date: ${formatLongDate(parseISODate(result.noticeDate))}`);
  lines.push("");
  lines.push("To,");
  lines.push(recipientName);
  lines.push("");
  lines.push(`Subject: Intimation of renewal of the tenancy of ${propertyAddress}`);
  lines.push("");
  lines.push(`Dear ${recipientName},`);
  lines.push("");
  lines.push(
    `The tenancy of the premises at ${propertyAddress}${
      agreement ? `, under the agreement dated ${formatLongDate(agreement)}` : ""
    }, runs until ${formatLongDate(parseISODate(result.currentEndDate))}. As the ${
      isLandlord ? "landlord" : "tenant"
    }, I write to propose its renewal on the following terms.`,
  );
  lines.push("");
  lines.push(`  Renewed term      : ${result.termMonths} months`);
  lines.push(
    `  Term dates        : ${formatLongDate(parseISODate(result.newStartDate))} to ${formatLongDate(
      parseISODate(result.newEndDate),
    )}`,
  );
  lines.push(
    `  Monthly rent      : ${formatMoney(result.newRent)}${
      result.rentIncrease > 0
        ? ` (up ${formatMoney(result.rentIncrease)}, ${result.escalationPercent}% on ${formatMoney(result.currentRent)})`
        : " (unchanged)"
    }`,
  );
  lines.push(`  Security deposit  : ${formatMoney(result.newDeposit)}`);
  if (result.depositTopUp > 0) {
    lines.push(`  Deposit differential: ${formatMoney(result.depositTopUp)} payable on renewal`);
  }
  lines.push(`  Rent over the term: ${formatMoney(result.totalRentOverTerm)}`);
  if (otherChanges.trim()) {
    lines.push(`  Other changes     : ${otherChanges.trim()}`);
  }
  lines.push("");
  lines.push(
    `Kindly confirm your acceptance in writing on or before ${formatLongDate(
      parseISODate(result.responseDeadline),
    )}, which is ${result.responseDays} days from the date of this letter, so that the fresh agreement can be executed before the present term expires.`,
  );
  if (result.registrationRequired) {
    lines.push("");
    lines.push(
      `As the renewed term is ${result.termMonths} months, the agreement will have to be registered — Section 17(1)(d) of the Registration Act, 1908 requires registration of a lease from year to year or for a term exceeding one year. Stamp duty and registration fee will be borne as the agreement provides.`,
    );
  } else {
    lines.push("");
    lines.push(
      `As the renewed term is ${result.termMonths} months, the agreement stays outside the registration requirement of Section 17(1)(d) of the Registration Act, 1908, though it must still be in writing and stamped.`,
    );
  }
  lines.push("");
  lines.push(
    "All other terms and conditions of the existing agreement will continue unless recorded otherwise in the fresh agreement.",
  );
  if (contact.trim()) {
    lines.push("");
    lines.push(`Contact: ${contact.trim()}`);
  }
  lines.push("");
  lines.push("Yours sincerely,");
  lines.push(senderName);
  lines.push(isLandlord ? "(Landlord)" : "(Tenant)");

  return lines.join("\n");
}
