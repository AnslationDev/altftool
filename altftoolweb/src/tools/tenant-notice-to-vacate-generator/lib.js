/**
 * Tenant Notice to Vacate Generator — pure logic.
 *
 * Basis (India):
 *  - The notice period a tenant must serve is whatever the tenancy agreement
 *    fixes. One month is the common residential term and two months the common
 *    commercial term, so those are offered as presets; the agreement always
 *    wins over the preset.
 *  - Model Tenancy Act, 2021, Section 11: the security deposit is refunded to
 *    the tenant at the time of taking over vacant possession of the premises,
 *    after deducting any liability of the tenant. Section 11(1) caps the
 *    deposit at two months' rent for residential premises and six months' rent
 *    for non-residential premises.
 *  - Where a tenant serves short notice, the standard contractual remedy is
 *    rent in lieu of notice for the shortfall — the balance of the notice
 *    period, charged at the agreed rent.
 *
 * Daily rent is derived as monthly rent x 12 / 365 so that a part month is
 * charged the same way no matter which month the handover falls in.
 */

/** Days in a year used to convert monthly rent into a daily rate. */
export const DAYS_PER_YEAR = 365;

/** Common contractual notice periods, in days. */
export const NOTICE_PRESETS = Object.freeze([
  { id: "30", days: 30, label: "1 month (typical residential)" },
  { id: "60", days: 60, label: "2 months (typical commercial)" },
  { id: "90", days: 90, label: "3 months" },
  { id: "15", days: 15, label: "15 days (short lets and PG)" },
]);

/** Model Tenancy Act, 2021, Section 11(1) — security deposit ceilings. */
export const DEPOSIT_CAP_MONTHS = Object.freeze({ residential: 2, commercial: 6 });

/** Handover items a landlord usually inspects before releasing the deposit. */
export const HANDOVER_ITEMS = Object.freeze([
  "Final electricity meter reading photographed and bill cleared",
  "Piped gas or cylinder connection reading and dues settled",
  "Water and society maintenance dues cleared with receipts",
  "All sets of keys, access cards and remote controls returned",
  "Fixtures, fittings and appliances handed back per the inventory list",
  "Premises cleaned and painted to the standard the agreement requires",
  "Society or building no-dues note collected",
  "Forwarding address shared for the deposit refund and post",
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
 * Settle a tenant's exit: notice compliance, final rent and deposit refund.
 *
 * @param {object} input
 * @param {number} input.monthlyRent    agreed monthly rent
 * @param {string} input.noticeDate     YYYY-MM-DD, date the notice is served
 * @param {string} input.vacateDate     YYYY-MM-DD, intended handover date
 * @param {number} input.noticeDays     notice period the agreement requires
 * @param {string} input.rentPaidUpto   YYYY-MM-DD, last date rent is paid for
 * @param {number} input.depositHeld    security deposit with the landlord
 * @param {number} input.deductions     agreed damage / cleaning deductions
 * @param {number} input.pendingBills   utility and maintenance dues to clear
 * @param {string} input.propertyUse    "residential" | "commercial"
 */
export function computeVacateSettlement(input) {
  const {
    monthlyRent,
    noticeDate,
    vacateDate,
    noticeDays = 30,
    rentPaidUpto,
    depositHeld = 0,
    deductions = 0,
    pendingBills = 0,
    propertyUse = "residential",
  } = input || {};

  const numbers = [monthlyRent, noticeDays, depositHeld, deductions, pendingBills];
  if (numbers.some((value) => typeof value !== "number" || !Number.isFinite(value))) {
    return { error: "Enter valid numbers for rent, deposit and deductions." };
  }
  if (monthlyRent <= 0) return { error: "Monthly rent must be more than zero." };
  if (depositHeld < 0 || deductions < 0 || pendingBills < 0) {
    return { error: "Deposit, deductions and dues cannot be negative." };
  }
  if (noticeDays < 0 || noticeDays > 365) {
    return { error: "Notice period should be between 0 and 365 days." };
  }

  const notice = parseISODate(noticeDate);
  const vacate = parseISODate(vacateDate);
  const paidUpto = parseISODate(rentPaidUpto);
  if (!notice) return { error: "Enter the notice date as a valid calendar date." };
  if (!vacate) return { error: "Enter the intended vacating date as a valid calendar date." };
  if (!paidUpto) return { error: "Enter the date rent is paid up to as a valid calendar date." };
  if (diffDays(notice, vacate) < 0) {
    return { error: "The vacating date cannot fall before the date of the notice." };
  }

  const dailyRent = (monthlyRent * 12) / DAYS_PER_YEAR;
  const servedDays = diffDays(notice, vacate);
  const earliestVacate = addDays(notice, noticeDays);
  const compliant = servedDays >= noticeDays;
  const shortfallDays = compliant ? 0 : noticeDays - servedDays;
  const rentInLieu = shortfallDays * dailyRent;

  // Occupancy that is not yet covered by rent already paid.
  const unpaidDays = diffDays(paidUpto, vacate);
  const rentDue = unpaidDays > 0 ? unpaidDays * dailyRent : 0;
  const advanceRentRefund = unpaidDays < 0 ? -unpaidDays * dailyRent : 0;

  const totalRecoveries = rentDue + rentInLieu + deductions + pendingBills;
  const netRefund = depositHeld + advanceRentRefund - totalRecoveries;

  const capMonths = DEPOSIT_CAP_MONTHS[propertyUse] ?? DEPOSIT_CAP_MONTHS.residential;
  const depositCap = capMonths * monthlyRent;

  return {
    monthlyRent: Math.round(monthlyRent),
    dailyRent,
    noticeDate: toISODate(notice),
    vacateDate: toISODate(vacate),
    rentPaidUpto: toISODate(paidUpto),
    noticeDays,
    servedDays,
    compliant,
    shortfallDays,
    earliestVacateDate: toISODate(earliestVacate),
    unpaidDays: Math.max(0, unpaidDays),
    advanceDays: Math.max(0, -unpaidDays),
    rentDue: Math.round(rentDue),
    advanceRentRefund: Math.round(advanceRentRefund),
    rentInLieu: Math.round(rentInLieu),
    deductions: Math.round(deductions),
    pendingBills: Math.round(pendingBills),
    depositHeld: Math.round(depositHeld),
    totalRecoveries: Math.round(totalRecoveries),
    netRefund: Math.round(netRefund),
    tenantOwes: netRefund < 0 ? Math.round(-netRefund) : 0,
    depositCap: Math.round(depositCap),
    depositCapMonths: capMonths,
    depositAboveCap: depositHeld > depositCap,
  };
}

/** Assemble the tenant's notice-to-vacate letter. */
export function buildVacateNotice(result, details) {
  if (!result || result.error) return "";
  const {
    tenantName = "[Tenant name]",
    landlordName = "[Landlord name]",
    propertyAddress = "[Property address]",
    agreementDate = "",
    forwardingAddress = "",
    bankDetails = "",
    contact = "",
    reason = "",
  } = details || {};

  const agreement = parseISODate(agreementDate);
  const lines = [];

  lines.push(`Date: ${formatLongDate(parseISODate(result.noticeDate))}`);
  lines.push("");
  lines.push("To,");
  lines.push(landlordName);
  lines.push("");
  lines.push(`Subject: Notice of intention to vacate ${propertyAddress}`);
  lines.push("");
  lines.push(`Dear ${landlordName},`);
  lines.push("");
  lines.push(
    `I am the tenant of the premises at ${propertyAddress}${
      agreement ? `, occupied under the tenancy agreement dated ${formatLongDate(agreement)}` : ""
    }, at a monthly rent of ${formatMoney(result.monthlyRent)}.`,
  );
  lines.push("");
  lines.push(
    `This letter is my written notice that I intend to vacate the premises and hand over vacant possession on ${formatLongDate(
      parseISODate(result.vacateDate),
    )}. Counted from today, this notice runs for ${result.servedDays} days against the ${result.noticeDays}-day notice period in the agreement.`,
  );
  if (!result.compliant) {
    lines.push("");
    lines.push(
      `As the notice falls ${result.shortfallDays} day${
        result.shortfallDays === 1 ? "" : "s"
      } short of the agreed period, I am willing to pay ${formatMoney(
        result.rentInLieu,
      )} as rent in lieu of the balance notice, or to shift the handover to ${formatLongDate(
        parseISODate(result.earliestVacateDate),
      )} if you prefer.`,
    );
  }
  if (reason.trim()) {
    lines.push("");
    lines.push(`Reason for vacating: ${reason.trim()}`);
  }
  lines.push("");
  lines.push("Settlement position as I compute it:");
  lines.push(`  Rent paid up to: ${formatLongDate(parseISODate(result.rentPaidUpto))}`);
  if (result.rentDue > 0) {
    lines.push(
      `  Rent for ${result.unpaidDays} further day(s) to handover: ${formatMoney(result.rentDue)}`,
    );
  }
  if (result.advanceRentRefund > 0) {
    lines.push(
      `  Rent already paid for ${result.advanceDays} day(s) beyond handover: ${formatMoney(
        result.advanceRentRefund,
      )} (refundable)`,
    );
  }
  if (result.rentInLieu > 0) lines.push(`  Rent in lieu of short notice: ${formatMoney(result.rentInLieu)}`);
  if (result.pendingBills > 0) lines.push(`  Utility and maintenance dues: ${formatMoney(result.pendingBills)}`);
  if (result.deductions > 0) lines.push(`  Agreed damage / cleaning deductions: ${formatMoney(result.deductions)}`);
  lines.push(`  Security deposit held by you: ${formatMoney(result.depositHeld)}`);
  lines.push(
    result.netRefund >= 0
      ? `  Balance refundable to me on handover: ${formatMoney(result.netRefund)}`
      : `  Balance payable by me on handover: ${formatMoney(result.tenantOwes)}`,
  );
  lines.push("");
  lines.push(
    "I request that we jointly inspect the premises, record the final meter readings and settle the security deposit at the time of handing over vacant possession, as the Model Tenancy Act, 2021 contemplates.",
  );
  if (bankDetails.trim()) {
    lines.push("");
    lines.push(`Refund may be credited to: ${bankDetails.trim()}`);
  }
  if (forwardingAddress.trim()) {
    lines.push("");
    lines.push(`My forwarding address after ${formatLongDate(parseISODate(result.vacateDate))}: ${forwardingAddress.trim()}`);
  }
  lines.push("");
  lines.push("Kindly acknowledge receipt of this notice in writing.");
  if (contact.trim()) {
    lines.push("");
    lines.push(`Contact: ${contact.trim()}`);
  }
  lines.push("");
  lines.push("Yours sincerely,");
  lines.push(tenantName);
  lines.push("(Tenant)");

  return lines.join("\n");
}
