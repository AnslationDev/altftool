/**
 * Excess bank / card charge refund request builder.
 *
 * Pure module: totals the disputed charges, adds or extracts GST, works out the
 * statutory escalation dates and renders the refund request letter as text.
 * No React, no DOM, no Date.now() — every date arrives as an ISO argument.
 */

/**
 * GST on banking and financial services in India is 18%
 * (CGST 9% + SGST 9%, or IGST 18%) — Notification 11/2017-Central Tax (Rate),
 * SAC heading 9971 "Financial and related services".
 */
export const GST_RATE_PERCENT = 18;

/**
 * RBI Integrated Ombudsman Scheme, 2021, clause 10(1): a complaint to the RBI
 * Ombudsman is maintainable only after the bank has been given 30 days to reply,
 * or has rejected the complaint.
 */
export const BANK_RESPONSE_DAYS = 30;

/**
 * Same clause: the Ombudsman complaint must be filed within one year of the
 * bank's reply, or of the day the 30-day reply window expired.
 */
export const OMBUDSMAN_FILING_DAYS = 365;

/** Common categories of charge that customers dispute with Indian banks. */
export const CHARGE_TYPES = [
  "Minimum balance / non-maintenance charge",
  "Annual or joining fee on a card sold as lifetime free",
  "Duplicate debit of the same fee",
  "SMS alert charge",
  "ATM withdrawal charge beyond the free limit",
  "Late payment fee despite payment made on time",
  "Cross-currency / foreign exchange markup",
  "Insurance or add-on product debited without consent",
  "Cheque return or ECS bounce charge",
  "Other charge",
];

/** Relief the customer can ask for, in the order it should appear in the letter. */
export const RELIEF_OPTIONS = [
  "Reverse the charges and credit the amount back to my account",
  "Send written confirmation of the reversal with transaction reference numbers",
  "Stop levying the same charge in future billing cycles",
  "Waive the interest and late fee that accrued on the disputed amount",
  "Report the corrected balance to the credit bureaus",
];

const MS_PER_DAY = 86400000;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

const clean = (value) => String(value ?? "").trim();

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

/** Add whole days to an ISO date. Returns null for an invalid input date. */
export function addDays(iso, days) {
  const ms = toUtcMs(iso);
  if (ms === null || !Number.isFinite(days)) return null;
  return new Date(ms + Math.round(days) * MS_PER_DAY).toISOString().slice(0, 10);
}

/** yyyy-mm-dd -> "05 January 2026" for letter text. */
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

const money = (value) =>
  `INR ${Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

/**
 * Total the disputed charges.
 *
 * @param {object} input
 * @param {Array<{label?: string, date?: string, amount: number|string}>} input.charges
 * @param {number} [input.gstRatePercent] GST rate applied to bank service fees.
 * @param {boolean} [input.gstAlreadyIncluded] true when the statement figure is GST-inclusive.
 * @returns {{rows: Array, totalBase: number, totalGst: number, totalClaim: number}|{error: string}}
 */
export function summariseCharges({
  charges,
  gstRatePercent = GST_RATE_PERCENT,
  gstAlreadyIncluded = false,
} = {}) {
  if (!Array.isArray(charges)) return { error: "Charges must be a list." };

  const rate = Number(gstRatePercent);
  if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
    return { error: "GST rate must be between 0% and 100%." };
  }

  const rows = [];
  for (const entry of charges) {
    const amount = Number(String(entry?.amount ?? "").replace(/,/g, "").trim());
    if (String(entry?.amount ?? "").trim() === "") continue;
    if (!Number.isFinite(amount)) {
      return { error: "Every charge amount must be a number." };
    }
    if (amount < 0) return { error: "Charge amounts cannot be negative." };
    if (amount === 0) continue;

    let base;
    let gst;
    if (gstAlreadyIncluded) {
      base = amount / (1 + rate / 100);
      gst = amount - base;
    } else {
      base = amount;
      gst = (amount * rate) / 100;
    }

    rows.push({
      label: clean(entry?.label) || "Charge",
      date: ISO_DATE.test(clean(entry?.date)) ? clean(entry.date) : "",
      base: round2(base),
      gst: round2(gst),
      total: round2(base + gst),
    });
  }

  if (rows.length === 0) {
    return { error: "Add at least one charge with an amount greater than zero." };
  }

  const totalBase = round2(rows.reduce((sum, row) => sum + row.base, 0));
  const totalGst = round2(rows.reduce((sum, row) => sum + row.gst, 0));

  return {
    rows,
    totalBase,
    totalGst,
    totalClaim: round2(totalBase + totalGst),
    gstRatePercent: rate,
  };
}

/**
 * Build the full refund request letter plus the escalation calendar.
 *
 * @returns {{letter: string, totals: object, replyByDate: string, ombudsmanDeadline: string}|{error: string}}
 */
export function buildRefundRequest({
  customerName,
  address = "",
  email = "",
  phone = "",
  bankName,
  branch = "",
  accountNumber = "",
  cardLastFour = "",
  letterDate,
  charges,
  gstRatePercent = GST_RATE_PERCENT,
  gstAlreadyIncluded = false,
  reasonNote = "",
  reliefs = RELIEF_OPTIONS.slice(0, 3),
} = {}) {
  const name = clean(customerName);
  const bank = clean(bankName);

  if (!name) return { error: "Enter the account holder's name." };
  if (!bank) return { error: "Enter the bank or card issuer's name." };
  if (toUtcMs(letterDate) === null) {
    return { error: "Enter a valid letter date in yyyy-mm-dd format." };
  }

  const totals = summariseCharges({ charges, gstRatePercent, gstAlreadyIncluded });
  if (totals.error) return { error: totals.error };

  const replyByDate = addDays(letterDate, BANK_RESPONSE_DAYS);
  const ombudsmanDeadline = addDays(letterDate, BANK_RESPONSE_DAYS + OMBUDSMAN_FILING_DAYS);

  const account = clean(accountNumber);
  const card = clean(cardLastFour);
  const holderRef = account
    ? `savings/current account no. ${account}`
    : card
      ? `credit card ending ${card}`
      : "the account referenced below";

  const chargeLines = totals.rows.map((row, index) => {
    const when = row.date ? formatLongDate(row.date) : "date as per statement";
    const gstPart =
      totals.totalGst > 0
        ? ` (base ${money(row.base)} + GST ${money(row.gst)})`
        : "";
    return `${index + 1}. ${when} — ${row.label} — ${money(row.total)}${gstPart}`;
  });

  const chosenReliefs = (Array.isArray(reliefs) ? reliefs : [])
    .map(clean)
    .filter(Boolean);
  const reliefList = (chosenReliefs.length > 0 ? chosenReliefs : RELIEF_OPTIONS.slice(0, 3)).map(
    (item, index) => `${index + 1}. ${item}.`,
  );

  const contactBits = [email && `Email: ${clean(email)}`, phone && `Phone: ${clean(phone)}`]
    .filter(Boolean)
    .join(" | ");

  const letter = [
    name,
    clean(address),
    contactBits,
    "",
    `Date: ${formatLongDate(letterDate)}`,
    "",
    "To,",
    "The Branch Manager / Nodal Grievance Officer",
    [bank, clean(branch)].filter(Boolean).join(", "),
    "",
    `Subject: Refund of excess charges wrongly levied on ${holderRef} — ${money(totals.totalClaim)}`,
    "",
    "Sir / Madam,",
    "",
    `I am a customer of ${bank} and hold ${holderRef}. On reviewing my statement I find that the following charges have been debited without a valid basis or without my informed consent:`,
    "",
    ...chargeLines,
    "",
    totals.totalGst > 0
      ? `Total claimed: ${money(totals.totalClaim)} — charges ${money(totals.totalBase)} plus GST ${money(totals.totalGst)} at ${totals.gstRatePercent}%.`
      : `Total claimed: ${money(totals.totalClaim)}.`,
    "",
    clean(reasonNote) ||
      "These debits were not disclosed to me at the time the account or card was opened, and no prior intimation was given before the amounts were recovered.",
    "",
    "I therefore request you to:",
    ...reliefList,
    "",
    `Please treat this letter as a formal complaint under your Grievance Redressal Policy and register it with a complaint reference number. If I do not receive a reply by ${formatLongDate(replyByDate)} (${BANK_RESPONSE_DAYS} days from the date of this letter), or if the reply does not resolve the issue, I may approach the RBI Ombudsman under the Reserve Bank - Integrated Ombudsman Scheme, 2021, on or before ${formatLongDate(ombudsmanDeadline)}.`,
    "",
    "Enclosed: statement extract with the disputed entries highlighted.",
    "",
    "Yours faithfully,",
    "",
    name,
  ]
    .filter((line, index, all) => !(line === "" && all[index - 1] === ""))
    .join("\n");

  return {
    letter,
    totals,
    replyByDate,
    ombudsmanDeadline,
    chargeCount: totals.rows.length,
  };
}
