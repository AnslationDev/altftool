/**
 * Which UPI limit actually binds a payment?
 *
 * Three ceilings apply at once and the smallest one wins:
 *
 *   1. The NPCI cap for the payment category. The general UPI ceiling is Rs 1,00,000
 *      per transaction and per day; NPCI has raised it for specific verified
 *      categories (capital markets, collections, insurance and foreign inward
 *      remittances to Rs 2,00,000; IPO and RBI Retail Direct, tax payments and
 *      verified hospitals and educational institutions to Rs 5,00,000).
 *   2. Your own bank's cap. Every bank sets its own per-transaction and per-day
 *      figure inside the NPCI ceiling, and it is often lower - which is why the same
 *      payment succeeds on one bank account and fails on another.
 *   3. What is left of today's quota, both in rupees and in the count of transactions.
 *      NPCI's standard is 20 UPI transactions per bank account per day.
 *
 * Risk rules sit on top of these: a newly linked account is usually held to
 * Rs 5,000 for the first 24 hours.
 *
 * Separate rails have their own ceilings: UPI Lite is an on-device wallet with a
 * Rs 5,000 balance cap and Rs 1,000 per payment, and its payments do not consume the
 * bank's daily count because no UPI PIN is used. UPI 123Pay on a feature phone is
 * capped at Rs 10,000 per transaction. A UPI AutoPay e-mandate can execute without
 * additional factor authentication up to Rs 15,000, raised to Rs 1,00,000 for mutual
 * fund subscriptions, insurance premiums and credit card bill payments.
 *
 * Limits are revised by NPCI and the RBI from time to time and banks change their own
 * caps without notice, so treat these as the published ceilings, not a guarantee.
 */

/** NPCI standard count of UPI transactions allowed per bank account per day. */
export const DAILY_TRANSACTION_COUNT = 20;
/** Cap usually applied to a freshly linked account for its first 24 hours. */
export const NEW_ACCOUNT_LIMIT = 5000;
/** Maximum balance that can sit in a UPI Lite on-device wallet. */
export const UPI_LITE_WALLET_CAP = 5000;

/**
 * Payment categories and their published NPCI / RBI ceilings.
 * usesBankAccount = false means the rail has its own balance and the bank's UPI
 * caps and daily count do not apply.
 */
export const PAYMENT_CATEGORIES = [
  {
    value: "p2p",
    label: "Person to person transfer",
    perTransaction: 100000,
    perDay: 100000,
    usesBankAccount: true,
    note: "The general NPCI ceiling for UPI.",
  },
  {
    value: "p2m",
    label: "Person to merchant (shops, bills, online)",
    perTransaction: 100000,
    perDay: 100000,
    usesBankAccount: true,
    note: "Same general ceiling; a few verified merchant categories are higher.",
  },
  {
    value: "capitalMarkets",
    label: "Capital markets, collections, insurance, foreign inward remittance",
    perTransaction: 200000,
    perDay: 200000,
    usesBankAccount: true,
    note: "Raised category under the NPCI verified-merchant framework.",
  },
  {
    value: "ipo",
    label: "IPO application and RBI Retail Direct",
    perTransaction: 500000,
    perDay: 500000,
    usesBankAccount: true,
    note: "Higher ceiling so a retail IPO bid can be blocked in one mandate.",
  },
  {
    value: "tax",
    label: "Tax payments",
    perTransaction: 500000,
    perDay: 500000,
    usesBankAccount: true,
    note: "Applies to payments made to verified tax collection merchants.",
  },
  {
    value: "hospitalEducation",
    label: "Verified hospitals and educational institutions",
    perTransaction: 500000,
    perDay: 500000,
    usesBankAccount: true,
    note: "Only where the institution is onboarded as a verified merchant.",
  },
  {
    value: "upiLite",
    label: "UPI Lite (on-device wallet, no PIN)",
    perTransaction: 1000,
    perDay: UPI_LITE_WALLET_CAP,
    usesBankAccount: false,
    note: "Limited by the wallet balance, which cannot exceed 5,000 at a time.",
  },
  {
    value: "upi123pay",
    label: "UPI 123Pay (feature phone, no internet)",
    perTransaction: 10000,
    perDay: 100000,
    usesBankAccount: true,
    note: "Per-payment ceiling for the feature-phone rail.",
  },
  {
    value: "autopayGeneral",
    label: "UPI AutoPay mandate — general",
    perTransaction: 15000,
    perDay: 100000,
    usesBankAccount: true,
    note: "Executes without additional factor authentication up to this amount.",
  },
  {
    value: "autopaySpecified",
    label: "UPI AutoPay — mutual funds, insurance premium, credit card bills",
    perTransaction: 100000,
    perDay: 100000,
    usesBankAccount: true,
    note: "The raised no-AFA ceiling for these three recurring categories.",
  },
];

/** Bank caps people most often see, offered as quick picks rather than named banks. */
export const COMMON_BANK_CAPS = [25000, 50000, 100000, 200000];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);
const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

/** Look up a category definition by its value. */
export function getCategory(value) {
  return PAYMENT_CATEGORIES.find((category) => category.value === value) ?? null;
}

/**
 * @param {object} input
 * @param {number} input.amount              Amount you want to pay now.
 * @param {string} input.category            One of PAYMENT_CATEGORIES value keys.
 * @param {number} [input.bankPerTransactionCap] Your bank's per-payment cap, 0 = not set.
 * @param {number} [input.bankDailyCap]      Your bank's per-day cap, 0 = not set.
 * @param {number} [input.spentToday]        Rupees already sent through UPI today.
 * @param {number} [input.transactionsToday] UPI payments already made today.
 * @param {boolean} [input.newAccount]       Account linked within the last 24 hours.
 * @returns {object} verdict and headroom, or { error }.
 */
export function checkUpiLimit({
  amount,
  category = "p2p",
  bankPerTransactionCap = 0,
  bankDailyCap = 0,
  spentToday = 0,
  transactionsToday = 0,
  newAccount = false,
} = {}) {
  const definition = getCategory(category);
  if (!definition) return { error: "Choose a valid payment category." };
  if (!isNum(amount)) return { error: "Enter the amount as a number." };
  if (amount <= 0) return { error: "The amount must be greater than zero." };
  for (const [label, value] of [
    ["Bank per-transaction cap", bankPerTransactionCap],
    ["Bank daily cap", bankDailyCap],
    ["Amount already sent today", spentToday],
    ["Transactions already made today", transactionsToday],
  ]) {
    if (!isNum(value)) return { error: `${label} must be a number.` };
    if (value < 0) return { error: `${label} cannot be negative.` };
  }

  const bankApplies = definition.usesBankAccount;
  const candidatesPerTransaction = [{ source: "NPCI category cap", value: definition.perTransaction }];
  const candidatesDaily = [{ source: "NPCI category cap", value: definition.perDay }];

  if (bankApplies && bankPerTransactionCap > 0) {
    candidatesPerTransaction.push({ source: "Your bank's per-payment cap", value: bankPerTransactionCap });
  }
  if (bankApplies && bankDailyCap > 0) {
    candidatesDaily.push({ source: "Your bank's daily cap", value: bankDailyCap });
  }
  if (newAccount) {
    candidatesPerTransaction.push({ source: "First 24 hours after linking", value: NEW_ACCOUNT_LIMIT });
    candidatesDaily.push({ source: "First 24 hours after linking", value: NEW_ACCOUNT_LIMIT });
  }

  const bindingPerTransaction = candidatesPerTransaction.reduce((lowest, item) =>
    item.value < lowest.value ? item : lowest,
  );
  const bindingDaily = candidatesDaily.reduce((lowest, item) => (item.value < lowest.value ? item : lowest));

  const dailyRemaining = Math.max(0, bindingDaily.value - spentToday);
  const countLimit = bankApplies ? DAILY_TRANSACTION_COUNT : null;
  const countRemaining = countLimit === null ? null : Math.max(0, countLimit - transactionsToday);

  const blockers = [];
  if (amount > bindingPerTransaction.value) {
    blockers.push(
      `The payment is above the per-transaction ceiling of ${bindingPerTransaction.value} set by: ${bindingPerTransaction.source}.`,
    );
  }
  if (amount > dailyRemaining) {
    blockers.push(
      `Only ${round2(dailyRemaining)} is left of today's quota of ${bindingDaily.value} (${bindingDaily.source}).`,
    );
  }
  if (countRemaining !== null && countRemaining < 1) {
    blockers.push(
      `You have used all ${DAILY_TRANSACTION_COUNT} UPI transactions allowed on this account today.`,
    );
  }

  const willGoThrough = blockers.length === 0;

  // If a single payment is too large, see whether splitting it fits today's room.
  const splitsNeeded = Math.ceil(amount / bindingPerTransaction.value);
  const splitFits =
    amount <= dailyRemaining && (countRemaining === null || splitsNeeded <= countRemaining);
  const splitAmount = round2(amount / splitsNeeded);

  return {
    categoryLabel: definition.label,
    categoryNote: definition.note,
    amount: round2(amount),
    perTransactionLimit: bindingPerTransaction.value,
    perTransactionSource: bindingPerTransaction.source,
    dailyLimit: bindingDaily.value,
    dailySource: bindingDaily.source,
    npciPerTransaction: definition.perTransaction,
    npciDaily: definition.perDay,
    spentToday: round2(spentToday),
    dailyRemaining: round2(dailyRemaining),
    dailyRemainingAfter: willGoThrough ? round2(dailyRemaining - amount) : round2(dailyRemaining),
    countLimit,
    countRemaining,
    bankCapsApply: bankApplies,
    willGoThrough,
    blockers,
    splitsNeeded: willGoThrough ? 1 : splitsNeeded,
    splitAmount: willGoThrough ? round2(amount) : splitAmount,
    splitFits: willGoThrough ? true : splitFits,
    newAccount,
  };
}

/** The published ceilings for every category, for the reference table. */
export function limitTable() {
  return PAYMENT_CATEGORIES.map((category) => ({
    label: category.label,
    perTransaction: category.perTransaction,
    perDay: category.perDay,
    note: category.note,
  }));
}
