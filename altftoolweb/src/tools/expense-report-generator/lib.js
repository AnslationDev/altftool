/**
 * Employee expense report: totals, GST input credit and advance settlement.
 *
 * Three real rules drive the flags this module raises.
 *
 * 1. BLOCKED INPUT TAX CREDIT — Section 17(5) of the CGST Act, 2017 denies input tax
 *    credit on food and beverages, outdoor catering, club and health-club membership,
 *    and on renting or hiring motor vehicles with seating capacity up to thirteen
 *    persons (with narrow exceptions such as further supply of the vehicle or
 *    passenger transport as a business). Petrol and diesel sit outside GST altogether,
 *    so fuel bills carry no credit either. Tax on those lines is a cost, not a credit.
 *
 * 2. CASH PAYMENT LIMIT — Section 40A(3) of the Income-tax Act, 1961 disallows a
 *    business expenditure where payment to a single person in a single day exceeds
 *    ₹10,000 otherwise than by account payee cheque, bank draft or an electronic mode.
 *    The limit is ₹35,000 for payments to a transporter for plying, hiring or leasing
 *    goods carriages (Rule 6DD carve-outs apart).
 *
 * 3. ADVANCE SETTLEMENT — the amount actually payable to the employee is the
 *    reimbursable total minus any advance already drawn; a negative figure is cash the
 *    employee must return.
 *
 * A reimbursement of actual business expenditure supported by bills is not salary, so
 * it is not taxed as a perquisite — but that depends on the bills existing, which is
 * why missing receipts are flagged rather than silently accepted.
 */

/** Section 40A(3), Income-tax Act 1961 — cash payment ceiling per person per day. */
export const CASH_LIMIT = 10000;
/** Section 40A(3) proviso — higher ceiling for payments to goods-carriage operators. */
export const CASH_LIMIT_TRANSPORT = 35000;

/**
 * Expense heads, with whether input tax credit is available on them.
 * itcBlocked = true means any GST charged on that line is a cost, not a credit.
 */
export const CATEGORIES = [
  { key: "air", label: "Air / rail / bus fare", itcBlocked: false },
  { key: "hotel", label: "Hotel & lodging", itcBlocked: false, note: "Credit only if the hotel is in the state where you are registered — place of supply is the hotel's location." },
  { key: "cab", label: "Local conveyance & cabs", itcBlocked: true, note: "Section 17(5)(b) blocks credit on hiring motor vehicles seating up to 13 persons." },
  { key: "meals", label: "Meals & refreshments", itcBlocked: true, note: "Section 17(5)(b) blocks credit on food and beverages." },
  { key: "entertainment", label: "Client entertainment", itcBlocked: true, note: "Outdoor catering and club membership are blocked under Section 17(5)(b)." },
  { key: "fuel", label: "Fuel & tolls", itcBlocked: true, note: "Petrol and diesel are outside GST, so no credit arises." },
  { key: "supplies", label: "Office supplies & printing", itcBlocked: false },
  { key: "telecom", label: "Telephone & internet", itcBlocked: false },
  { key: "training", label: "Training, events & conferences", itcBlocked: false },
  { key: "courier", label: "Courier & postage", itcBlocked: false },
  { key: "other", label: "Other business expense", itcBlocked: false },
];

export const PAYMENT_MODES = [
  { key: "cash", label: "Cash" },
  { key: "card", label: "Personal card" },
  { key: "upi", label: "UPI / bank transfer" },
  { key: "company", label: "Company card (already paid)" },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

const categoryFor = (key) => CATEGORIES.find((c) => c.key === key) || CATEGORIES[CATEGORIES.length - 1];

/**
 * Total an expense claim.
 *
 * @param {object} input
 * @param {Array<object>} input.items      { date, category, description, amount, tax, mode, hasReceipt, billable }
 * @param {number} [input.advance]         Advance already drawn by the employee.
 * @param {number} [input.approvalLimit]   Per-item value above which extra sign-off is needed; 0 disables.
 * @param {boolean} [input.gstRegistered]  Whether the employer claims input tax credit at all.
 * @returns {object} the report, or { error }.
 */
export function buildExpenseReport({
  items = [],
  advance = 0,
  approvalLimit = 0,
  gstRegistered = true,
} = {}) {
  if (!Array.isArray(items)) return { error: "Expense lines must be supplied as a list." };
  if (!isNum(advance) || advance < 0) return { error: "The advance drawn cannot be negative." };
  if (!isNum(approvalLimit) || approvalLimit < 0) {
    return { error: "The approval limit must be zero or a positive amount." };
  }

  const rows = [];
  const categoryTotals = new Map();
  let gross = 0;
  let reimbursable = 0;
  let companyPaid = 0;
  let taxTotal = 0;
  let creditable = 0;
  let blockedTax = 0;
  let billableTotal = 0;

  for (let i = 0; i < items.length; i += 1) {
    const item = items[i] || {};
    const amount = item.amount;
    if (!isNum(amount)) {
      return { error: `Line ${i + 1} has no valid amount — enter a number or remove the row.` };
    }
    if (amount < 0) return { error: `Line ${i + 1} is negative. Enter refunds as a separate credit line.` };
    if (amount === 0) continue;

    const tax = isNum(item.tax) && item.tax > 0 ? item.tax : 0;
    if (tax > amount) {
      return { error: `Line ${i + 1}: the GST shown is larger than the bill total.` };
    }

    const category = categoryFor(item.category);
    const mode = PAYMENT_MODES.some((m) => m.key === item.mode) ? item.mode : "cash";
    const paidByCompany = mode === "company";
    const creditAvailable = gstRegistered && !category.itcBlocked && tax > 0;

    gross = round2(gross + amount);
    taxTotal = round2(taxTotal + tax);
    if (creditAvailable) creditable = round2(creditable + tax);
    else blockedTax = round2(blockedTax + tax);
    if (paidByCompany) companyPaid = round2(companyPaid + amount);
    else reimbursable = round2(reimbursable + amount);
    if (item.billable) billableTotal = round2(billableTotal + amount);

    categoryTotals.set(category.key, round2((categoryTotals.get(category.key) || 0) + amount));

    rows.push({
      line: rows.length + 1,
      date: item.date || "",
      description: item.description ? String(item.description).trim() : "",
      categoryKey: category.key,
      categoryLabel: category.label,
      amount: round2(amount),
      tax: round2(tax),
      /** Bill value net of the GST shown on it. */
      base: round2(amount - tax),
      mode,
      paidByCompany,
      billable: Boolean(item.billable),
      creditAvailable,
      itcNote: category.itcBlocked ? category.note || "Input tax credit is blocked on this head." : category.note || "",
      /** Section 40A(3): a cash payment above ₹10,000 in a day risks disallowance. */
      cashLimitBreach: mode === "cash" && amount > CASH_LIMIT,
      missingReceipt: item.hasReceipt === false,
      needsApproval: approvalLimit > 0 && amount > approvalLimit,
    });
  }

  const byCategory = [...categoryTotals.entries()]
    .map(([key, amount]) => ({
      key,
      label: categoryFor(key).label,
      amount,
      share: gross > 0 ? round2((amount / gross) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const netPayable = round2(reimbursable - advance);

  return {
    rows,
    lineCount: rows.length,
    gross,
    reimbursable,
    companyPaid,
    taxTotal,
    /** GST you can take credit for. */
    creditableTax: creditable,
    /** GST that is a cost because Section 17(5) blocks it or the supply is outside GST. */
    blockedTax,
    billableTotal,
    advance: round2(advance),
    netPayable,
    /** Positive = pay the employee; negative = the employee returns this much. */
    dueToEmployee: netPayable > 0 ? netPayable : 0,
    dueFromEmployee: netPayable < 0 ? round2(-netPayable) : 0,
    byCategory,
    /** Net cost to the company after taking the credit that is available. */
    netCost: round2(gross - creditable),
    flags: {
      cashLimit: rows.filter((r) => r.cashLimitBreach).length,
      missingReceipts: rows.filter((r) => r.missingReceipt).length,
      needsApproval: rows.filter((r) => r.needsApproval).length,
    },
  };
}
