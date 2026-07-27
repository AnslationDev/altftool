/**
 * Deposit insurance cover under the Deposit Insurance and Credit Guarantee
 * Corporation Act, 1961.
 *
 * Rules encoded here:
 *  - Cover is ₹5,00,000 per depositor per bank, raised from ₹1,00,000 with effect
 *    from 4 February 2020.
 *  - The limit applies to PRINCIPAL AND INTEREST TOGETHER, not to principal alone.
 *  - All deposits a depositor holds at one bank IN THE SAME CAPACITY AND THE SAME
 *    RIGHT are added together across every branch of that bank, and the limit is
 *    applied to the total. Savings, current, fixed and recurring accounts are all
 *    counted.
 *  - Deposits held in a DIFFERENT capacity or right are insured separately: an
 *    account held alone, an account as guardian of a minor, an account as a
 *    partner of a firm, as karta of a Hindu Undivided Family, as a director of a
 *    company or as a trustee each carry their own limit.
 *  - Joint accounts are insured separately from single accounts, and the ORDER OF
 *    NAMES matters: an "A and B" account is a different capacity from a "B and A"
 *    account, but two accounts with the same names in the same order are added
 *    together.
 *  - Insured banks include all commercial banks, local area banks, regional rural
 *    banks, payments banks, small finance banks, branches of foreign banks in
 *    India and co-operative banks. Primary co-operative societies are not
 *    insured.
 *  - Not covered: deposits of foreign governments, of central or state
 *    governments, inter-bank deposits, deposits of a State Land Development Bank
 *    with the State co-operative bank, amounts due on deposits received outside
 *    India, and any deposit specifically exempted with prior RBI approval.
 *  - Under the DICGC (Amendment) Act, 2021, depositors of a bank placed under
 *    all-inclusive directions receive up to the insured amount within 90 days.
 */

/** Cover per depositor per bank, in force since 4 February 2020 (₹). */
export const DICGC_LIMIT = 500000;

/** The limit that applied before that date, for reference (₹). */
export const DICGC_PREVIOUS_LIMIT = 100000;

/** Interim payout deadline under the DICGC (Amendment) Act, 2021, in days. */
export const INTERIM_PAYOUT_DAYS = 90;

/**
 * Capacities that carry their own separate limit at the same bank.
 * `key` is used for grouping; `separate` marks the ones that are genuinely a
 * different right rather than another account in the same right.
 */
export const CAPACITIES = [
  {
    key: "single",
    label: "Single (in your own name)",
    note: "Sole proprietorship accounts are treated as held in this same right.",
  },
  {
    key: "joint-first",
    label: "Joint — you are the first named holder",
    note: "Aggregated with every other joint account that has the same names in the same order.",
  },
  {
    key: "joint-second",
    label: "Joint — you are the second named holder",
    note: "A different order of names is a different capacity and carries its own limit.",
  },
  {
    key: "minor-guardian",
    label: "As guardian of a minor",
    note: "Held in a different right, so insured separately from your own accounts.",
  },
  {
    key: "huf-karta",
    label: "As karta of a Hindu Undivided Family",
    note: "The HUF is a separate depositor from its karta.",
  },
  {
    key: "firm-partner",
    label: "As a partner of a firm",
    note: "The firm's deposits are separate from the partners' own deposits.",
  },
  {
    key: "company-director",
    label: "As a director or officer of a company",
    note: "The company is a separate depositor.",
  },
  {
    key: "trustee",
    label: "As a trustee",
    note: "Trust deposits are held in a different right from personal deposits.",
  },
];

/** Deposit types that count towards the same limit. */
export const DEPOSIT_TYPES = ["Savings", "Current", "Fixed deposit", "Recurring deposit"];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Label for a capacity key. */
export function capacityLabel(key) {
  return CAPACITIES.find((item) => item.key === key)?.label ?? key;
}

/**
 * Cover on one aggregated group of deposits.
 *
 * @param {number} balance principal plus accrued interest
 * @param {number} [limit]
 */
export function coverForBalance(balance, limit = DICGC_LIMIT) {
  if (!isNum(balance) || balance <= 0) {
    return { balance: 0, insured: 0, uninsured: 0, fullyCovered: true, headroom: limit };
  }
  const insured = Math.min(balance, limit);
  return {
    balance,
    insured,
    uninsured: balance - insured,
    fullyCovered: balance <= limit,
    headroom: Math.max(0, limit - balance),
  };
}

/**
 * Aggregate accounts by bank and capacity and apply the DICGC limit to each
 * group.
 *
 * @param {object} input
 * @param {Array<{bank: string, capacity: string, type?: string, balance: number}>} input.accounts
 * @param {number} [input.limit] override the cover, for historical comparison
 * @returns {object} result, or { error }
 */
export function checkDepositInsurance({ accounts = [], limit = DICGC_LIMIT } = {}) {
  if (!Array.isArray(accounts) || accounts.length === 0) {
    return { error: "Add at least one account to check." };
  }
  if (!isNum(limit) || limit <= 0) {
    return { error: "The insured limit must be greater than zero." };
  }
  const rows = accounts.map((row, index) => ({
    bank: (row && String(row.bank || "").trim()) || `Bank ${index + 1}`,
    capacity: (row && row.capacity) || "single",
    type: (row && row.type) || DEPOSIT_TYPES[0],
    balance: isNum(row && row.balance) ? row.balance : NaN,
  }));
  if (rows.some((row) => Number.isNaN(row.balance))) {
    return { error: "Enter a valid balance for every account." };
  }
  if (rows.some((row) => row.balance < 0)) {
    return { error: "Balances cannot be negative." };
  }
  const totalBalance = rows.reduce((sum, row) => sum + row.balance, 0);
  if (totalBalance <= 0) {
    return { error: "Enter at least one balance greater than zero." };
  }
  if (totalBalance > 1e12) {
    return { error: "Enter balances totalling less than ₹1 lakh crore." };
  }

  const groupMap = new Map();
  rows.forEach((row) => {
    const key = `${row.bank.toLowerCase()}|${row.capacity}`;
    const existing = groupMap.get(key);
    if (existing) {
      existing.balance += row.balance;
      existing.accounts.push(row);
    } else {
      groupMap.set(key, {
        key,
        bank: row.bank,
        capacity: row.capacity,
        capacityLabel: capacityLabel(row.capacity),
        balance: row.balance,
        accounts: [row],
      });
    }
  });

  const groups = [...groupMap.values()].map((group) => ({
    ...group,
    ...coverForBalance(group.balance, limit),
  }));

  const totalInsured = groups.reduce((sum, group) => sum + group.insured, 0);
  const totalUninsured = groups.reduce((sum, group) => sum + group.uninsured, 0);
  const exposedGroups = groups.filter((group) => group.uninsured > 0);
  const headroomGroups = groups.filter((group) => group.headroom > 0);
  const totalHeadroom = headroomGroups.reduce((sum, group) => sum + group.headroom, 0);

  const banks = new Set(groups.map((group) => group.bank.toLowerCase()));
  // Every additional bank adds a fresh limit for each capacity you already use.
  const capacitiesUsed = new Set(groups.map((group) => group.capacity));
  const maxCoverAvailable = banks.size * capacitiesUsed.size * limit;

  return {
    limit,
    groups: groups.sort((a, b) => b.balance - a.balance),
    totalBalance,
    totalInsured,
    totalUninsured,
    coveredPercent: (totalInsured / totalBalance) * 100,
    fullyCovered: totalUninsured === 0,
    exposedGroups,
    exposedCount: exposedGroups.length,
    totalHeadroom,
    headroomGroups,
    bankCount: banks.size,
    capacityCount: capacitiesUsed.size,
    groupCount: groups.length,
    maxCoverAvailable,
    extraBanksNeeded:
      totalUninsured > 0 ? Math.ceil(totalUninsured / (limit * capacitiesUsed.size)) : 0,
    interimPayoutDays: INTERIM_PAYOUT_DAYS,
  };
}
