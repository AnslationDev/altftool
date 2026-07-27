/**
 * Analytical petty cash book on the imprest system.
 *
 * Under the imprest system the petty cashier starts a period holding a fixed float
 * (the imprest), pays small expenses out of it against vouchers, and at the end of the
 * period is reimbursed with exactly what was spent — which restores the float to the
 * same fixed amount for the next period. Hence:
 *
 *   closing balance = opening balance + top-ups received - total payments
 *   reimbursement due = imprest - closing balance
 *   cash in hand after reimbursement = imprest
 *
 * The "analytical" part is the set of expense-head columns: every voucher is posted to
 * one head, and the head totals are what get journalised to the ledger at period end.
 * The running balance can never legitimately go below zero, so the first voucher that
 * would overdraw the float is flagged.
 *
 * A physical cash count can be entered to prove the book: count minus closing balance
 * is the cash shortage (negative) or excess (positive) to be investigated.
 */

/** Expense heads a small office normally analyses petty cash into. */
export const EXPENSE_HEADS = [
  "Conveyance & Travel",
  "Printing & Stationery",
  "Postage & Courier",
  "Refreshments & Pantry",
  "Repairs & Maintenance",
  "Cleaning & Housekeeping",
  "Staff Welfare",
  "Telephone & Internet",
  "Miscellaneous",
];

/** Ceiling on a single petty cash voucher; larger payments belong in the main cash book. */
export const TYPICAL_VOUCHER_CEILING = 5000;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

/**
 * Post a list of vouchers to an imprest petty cash book.
 *
 * @param {object} input
 * @param {number} input.imprest           The fixed float the account is restored to.
 * @param {number} [input.openingBalance]  Cash in hand when the period opened; defaults to the imprest.
 * @param {number} [input.topUps]          Extra cash received mid-period, outside the routine reimbursement.
 * @param {Array<{date?: string, voucher?: string, particulars?: string, head?: string, amount: number}>} input.entries
 * @param {number|null} [input.physicalCount] Cash actually counted at period end, or null to skip the proof.
 * @param {string} [input.periodStart]     ISO date; vouchers outside the period are flagged, not rejected.
 * @param {string} [input.periodEnd]       ISO date.
 * @returns {object} the posted book, or { error }.
 */
export function buildPettyCashBook({
  imprest,
  openingBalance,
  topUps = 0,
  entries = [],
  physicalCount = null,
  periodStart = "",
  periodEnd = "",
} = {}) {
  if (!isNum(imprest)) return { error: "Enter the imprest float as a number." };
  if (imprest <= 0) return { error: "The imprest float must be greater than zero." };
  if (imprest > 100000000) return { error: "Enter an imprest float of ₹10,00,00,000 or less." };

  const opening = isNum(openingBalance) ? openingBalance : imprest;
  if (opening < 0) return { error: "Opening cash in hand cannot be negative." };
  if (!isNum(topUps) || topUps < 0) return { error: "Extra cash received cannot be negative." };
  if (!Array.isArray(entries)) return { error: "Vouchers must be supplied as a list." };

  const available = round2(opening + topUps);
  const rows = [];
  const headTotals = new Map();
  const seenVouchers = new Set();
  let balance = available;
  let totalPayments = 0;
  let overdrawnAt = null;

  for (let i = 0; i < entries.length; i += 1) {
    const entry = entries[i] || {};
    const amount = entry.amount;
    if (!isNum(amount)) {
      return { error: `Voucher ${i + 1} has no valid amount — enter a number or remove the row.` };
    }
    if (amount < 0) {
      return { error: `Voucher ${i + 1} is negative. Record money coming back as extra cash received, not as a payment.` };
    }
    if (amount === 0) continue;

    const head = entry.head && String(entry.head).trim() ? String(entry.head).trim() : "Miscellaneous";
    const voucher = entry.voucher ? String(entry.voucher).trim() : "";
    const duplicate = voucher !== "" && seenVouchers.has(voucher);
    if (voucher) seenVouchers.add(voucher);

    const outOfPeriod = Boolean(
      entry.date &&
        ((periodStart && entry.date < periodStart) || (periodEnd && entry.date > periodEnd)),
    );

    balance = round2(balance - amount);
    totalPayments = round2(totalPayments + amount);
    headTotals.set(head, round2((headTotals.get(head) || 0) + amount));

    if (balance < 0 && overdrawnAt === null) overdrawnAt = rows.length + 1;

    rows.push({
      line: rows.length + 1,
      date: entry.date || "",
      voucher,
      particulars: entry.particulars ? String(entry.particulars).trim() : "",
      head,
      amount: round2(amount),
      balance,
      duplicate,
      outOfPeriod,
      aboveCeiling: amount > TYPICAL_VOUCHER_CEILING,
    });
  }

  const closingBalance = round2(available - totalPayments);
  const reimbursement = round2(imprest - closingBalance);
  const byHead = [...headTotals.entries()]
    .map(([head, amount]) => ({
      head,
      amount,
      share: totalPayments > 0 ? round2((amount / totalPayments) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const largest = rows.reduce(
    (best, row) => (best === null || row.amount > best.amount ? row : best),
    null,
  );

  const counted = isNum(physicalCount) ? round2(physicalCount) : null;
  const countDifference = counted === null ? null : round2(counted - closingBalance);

  return {
    imprest: round2(imprest),
    openingBalance: round2(opening),
    topUps: round2(topUps),
    cashAvailable: available,
    rows,
    voucherCount: rows.length,
    totalPayments,
    closingBalance,
    /** Positive means top the float back up; negative means hand cash back. */
    reimbursement,
    /** Share of the float already consumed, useful for deciding when to claim. */
    utilisation: available > 0 ? round2((totalPayments / available) * 100) : 0,
    byHead,
    largestVoucher: largest,
    overdrawnAt,
    physicalCount: counted,
    countDifference,
    /** Book proves only when the counted cash equals the closing balance. */
    proved: countDifference === null ? null : countDifference === 0,
  };
}
