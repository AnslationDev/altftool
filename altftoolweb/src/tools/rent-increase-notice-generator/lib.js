/**
 * Rent Increase Notice Generator — pure logic.
 *
 * Statutory basis (India):
 *  - Model Tenancy Act, 2021, Section 9(2): where a landlord wants to revise
 *    the rent, he "shall give notice in writing three months before the
 *    revised rent becomes due". The revision cannot take effect earlier.
 *  - Model Tenancy Act, 2021, Section 11(1): the security deposit shall not
 *    exceed two months' rent for residential premises and six months' rent
 *    for non-residential premises.
 *  - Registration Act, 1908, Section 17(1)(d): a lease of immovable property
 *    from year to year, or for a term exceeding one year, must be registered —
 *    which is why an eleven-month tenancy is the common Indian practice.
 *
 * The Model Tenancy Act is a template circulated to States; a State adopts it
 * with modifications, and an existing written agreement may fix a longer or
 * shorter notice period. This module therefore treats three months as the
 * default and lets the caller override it with the agreed notice period.
 */

/** Model Tenancy Act, 2021, Section 9(2) — notice before revised rent is due. */
export const DEFAULT_REVISION_NOTICE_MONTHS = 3;

/** Model Tenancy Act, 2021, Section 11(1) — security deposit ceilings. */
export const DEPOSIT_CAP_MONTHS = Object.freeze({
  residential: 2,
  commercial: 6,
});

export const PROPERTY_USES = Object.freeze([
  { id: "residential", label: "Residential (flat, house, PG room)" },
  { id: "commercial", label: "Non-residential (shop, office, godown)" },
]);

/** Upper sanity bound on a single revision; anything above this is a typo. */
const MAX_INCREASE_PERCENT = 200;

const MS_PER_DAY = 86400000;

/** Parse a strict YYYY-MM-DD string into a UTC Date, or null. */
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

/** Add whole calendar months, clamping to the last valid day of the month. */
export function addMonths(date, months) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const target = new Date(Date.UTC(year, month + months, 1));
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  return new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), Math.min(day, lastDay)),
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
 * Work out the revised rent and whether the notice gives enough warning.
 *
 * @param {object} input
 * @param {number} input.currentRent      current monthly rent in rupees
 * @param {"percent"|"amount"} input.mode how the revision is expressed
 * @param {number} input.increasePercent  used when mode === "percent"
 * @param {number} input.newRentAmount    used when mode === "amount"
 * @param {string} input.noticeDate       YYYY-MM-DD, the date of the notice
 * @param {string} input.effectiveDate    YYYY-MM-DD, when the new rent starts
 * @param {number} input.noticeMonths     agreed notice period in months
 * @param {string} input.propertyUse      "residential" | "commercial"
 * @param {number} input.depositHeld      security deposit already held
 * @param {boolean} input.reviseDeposit   top the deposit up in proportion
 */
export function computeRentRevision(input) {
  const {
    currentRent,
    mode = "percent",
    increasePercent = 0,
    newRentAmount = 0,
    noticeDate,
    effectiveDate,
    noticeMonths = DEFAULT_REVISION_NOTICE_MONTHS,
    propertyUse = "residential",
    depositHeld = 0,
    reviseDeposit = true,
  } = input || {};

  const numbers = [
    currentRent,
    mode === "amount" ? newRentAmount : increasePercent,
    noticeMonths,
    depositHeld,
  ];
  if (numbers.some((value) => typeof value !== "number" || !Number.isFinite(value))) {
    return { error: "Enter valid numbers for rent, revision and deposit." };
  }
  if (currentRent <= 0) return { error: "Current monthly rent must be more than zero." };
  if (depositHeld < 0) return { error: "Security deposit cannot be negative." };
  if (noticeMonths < 0 || noticeMonths > 12) {
    return { error: "Notice period should be between 0 and 12 months." };
  }

  const notice = parseISODate(noticeDate);
  const effective = parseISODate(effectiveDate);
  if (!notice) return { error: "Enter the notice date as a valid calendar date." };
  if (!effective) return { error: "Enter the effective date as a valid calendar date." };
  if (diffDays(notice, effective) <= 0) {
    return { error: "The revised rent must take effect after the date of the notice." };
  }

  let newRent;
  if (mode === "amount") {
    if (newRentAmount <= 0) return { error: "Revised rent must be more than zero." };
    newRent = newRentAmount;
  } else {
    if (increasePercent <= 0) {
      return { error: "Enter a rent increase greater than 0%." };
    }
    if (increasePercent > MAX_INCREASE_PERCENT) {
      return { error: `A single revision above ${MAX_INCREASE_PERCENT}% looks like a typing error.` };
    }
    newRent = currentRent * (1 + increasePercent / 100);
  }

  if (newRent <= currentRent) {
    return { error: "The revised rent must be higher than the current rent." };
  }
  if (newRent > currentRent * (1 + MAX_INCREASE_PERCENT / 100)) {
    return { error: `A single revision above ${MAX_INCREASE_PERCENT}% looks like a typing error.` };
  }

  const roundedNewRent = Math.round(newRent);
  const increaseAmount = roundedNewRent - currentRent;
  const increasePct = (increaseAmount / currentRent) * 100;

  const earliestEffective = addMonths(notice, noticeMonths);
  const noticeDays = diffDays(notice, effective);
  const requiredDays = diffDays(notice, earliestEffective);
  const compliant = effective.getTime() >= earliestEffective.getTime();
  const shortfallDays = compliant ? 0 : diffDays(effective, earliestEffective);

  const capMonths = DEPOSIT_CAP_MONTHS[propertyUse] ?? DEPOSIT_CAP_MONTHS.residential;
  const depositCap = capMonths * roundedNewRent;
  const proposedDeposit = reviseDeposit
    ? Math.round((depositHeld * roundedNewRent) / currentRent)
    : Math.round(depositHeld);
  const cappedDeposit = Math.min(proposedDeposit, depositCap);
  const depositTopUp = Math.max(0, cappedDeposit - Math.round(depositHeld));
  const depositMonths = roundedNewRent > 0 ? cappedDeposit / roundedNewRent : 0;

  return {
    currentRent: Math.round(currentRent),
    newRent: roundedNewRent,
    increaseAmount,
    increasePercent: increasePct,
    annualExtra: increaseAmount * 12,
    noticeDate: toISODate(notice),
    effectiveDate: toISODate(effective),
    earliestEffectiveDate: toISODate(earliestEffective),
    noticeDays,
    requiredDays,
    noticeMonths,
    compliant,
    shortfallDays,
    propertyUse,
    depositHeld: Math.round(depositHeld),
    depositCapMonths: capMonths,
    depositCap,
    newDeposit: cappedDeposit,
    depositTopUp,
    depositMonths,
    depositCapped: proposedDeposit > depositCap,
  };
}

/**
 * Assemble the notice letter from the computed figures plus the party details.
 * Returns a plain string; the caller decides how to display or copy it.
 */
export function buildRentIncreaseNotice(result, details) {
  if (!result || result.error) return "";
  const {
    landlordName = "[Landlord name]",
    landlordAddress = "",
    tenantName = "[Tenant name]",
    propertyAddress = "[Property address]",
    agreementDate = "",
    reason = "",
    contact = "",
  } = details || {};

  const agreement = parseISODate(agreementDate);
  const lines = [];

  lines.push(`Date: ${formatLongDate(parseISODate(result.noticeDate))}`);
  lines.push("");
  lines.push("To,");
  lines.push(tenantName);
  lines.push(propertyAddress);
  lines.push("");
  lines.push("Subject: Notice of revision of monthly rent");
  lines.push("");
  lines.push(`Dear ${tenantName},`);
  lines.push("");
  lines.push(
    `I am the landlord of the premises at ${propertyAddress}, which you occupy as my tenant${
      agreement ? ` under the tenancy agreement dated ${formatLongDate(agreement)}` : ""
    }. The rent presently payable is ${formatMoney(result.currentRent)} per month.`,
  );
  lines.push("");
  lines.push(
    `This is a written notice that, with effect from ${formatLongDate(
      parseISODate(result.effectiveDate),
    )}, the monthly rent for the said premises will be revised to ${formatMoney(
      result.newRent,
    )} per month — an increase of ${formatMoney(result.increaseAmount)} (${result.increasePercent.toFixed(
      1,
    )}%) over the present rent.`,
  );
  if (reason.trim()) {
    lines.push("");
    lines.push(`Reason for the revision: ${reason.trim()}`);
  }
  lines.push("");
  lines.push(
    result.compliant
      ? `This notice is given ${result.noticeDays} days in advance of the effective date, in keeping with the ${result.noticeMonths}-month written notice required before a revised rent becomes due.`
      : `This notice is given ${result.noticeDays} days in advance of the effective date, which is ${result.shortfallDays} day${result.shortfallDays === 1 ? "" : "s"} short of the ${result.noticeMonths}-month written notice required before a revised rent becomes due.`,
  );
  if (result.depositTopUp > 0) {
    lines.push("");
    lines.push(
      `The security deposit will correspondingly stand at ${formatMoney(
        result.newDeposit,
      )} (${result.depositMonths.toFixed(1)} months' revised rent). Kindly remit the differential of ${formatMoney(
        result.depositTopUp,
      )} on or before the effective date.`,
    );
  }
  lines.push("");
  lines.push(
    "All other terms and conditions of the tenancy remain unchanged. Kindly acknowledge receipt of this notice and confirm the revised rent in writing.",
  );
  if (contact.trim()) {
    lines.push("");
    lines.push(`For any clarification, you may reach me at ${contact.trim()}.`);
  }
  lines.push("");
  lines.push("Yours sincerely,");
  lines.push(landlordName);
  if (landlordAddress.trim()) lines.push(landlordAddress.trim());
  lines.push("(Landlord)");

  return lines.join("\n");
}
