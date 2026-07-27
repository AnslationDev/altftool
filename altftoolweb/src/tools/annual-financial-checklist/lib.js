/**
 * Annual financial checklist builder.
 *
 * The Indian financial year runs 1 April to 31 March, and most personal-finance tasks are
 * pinned to statutory dates inside it. This module holds a catalogue of those tasks, each
 * with the rule it comes from and the condition that makes it apply to you, and returns the
 * subset relevant to a profile with the next occurrence of each deadline computed from a
 * reference date supplied by the caller.
 *
 * Deadlines used, with their source:
 *  - 15 June / 15 Sep / 15 Dec / 15 Mar — advance tax instalments under section 211, at a
 *    cumulative 15%, 45%, 75% and 100% of the estimated liability. Advance tax is payable
 *    where the tax liability after TDS is ₹10,000 or more in the year (section 208).
 *  - 15 June — the last date for an employer to issue Form 16 for the previous financial
 *    year (Rule 31 of the Income-tax Rules).
 *  - 31 July — due date to file the income tax return for individuals not liable to audit
 *    (section 139(1)).
 *  - 31 December — last date to file a belated or revised return for the assessment year
 *    (sections 139(4) and 139(5)).
 *  - 31 March — last date to make deductible investments and payments for the financial
 *    year, and the minimum-deposit date that keeps small savings accounts active: ₹500 in
 *    PPF, ₹250 in Sukanya Samriddhi and ₹1,000 in an NPS Tier-I account.
 *  - 5 April — PPF interest is computed on the lowest balance between the 5th and the last
 *    day of each month, so a deposit made on or before 5 April earns interest for the
 *    whole year.
 *
 * Undated tasks (nominee updates, cover reviews, credit-report checks, rebalancing) are
 * returned as "any time this year" rather than given an invented date. SEBI requires a
 * nomination or an explicit opt-out for demat accounts and mutual fund folios; the RBI
 * direction on credit information companies entitles you to one free full credit report a
 * year from each bureau.
 *
 * Nothing here is tax advice, and deadlines are extended by notification more often than
 * anyone would like — confirm the current date on the income tax portal before relying on
 * it.
 */

/** Amount of tax liability after TDS at which advance tax becomes payable (section 208). */
export const ADVANCE_TAX_THRESHOLD = 10000;
/** Minimum yearly deposits that keep small-savings accounts from going dormant. */
export const MIN_PPF_DEPOSIT = 500;
export const MIN_SSY_DEPOSIT = 250;
export const MIN_NPS_TIER1_DEPOSIT = 1000;
/** A deadline inside this many days is flagged as urgent. */
export const DUE_SOON_DAYS = 30;

export const PROFILE_FLAGS = [
  { id: "salaried", label: "Salaried employee" },
  { id: "businessIncome", label: "Business or freelance income" },
  { id: "advanceTax", label: "Tax after TDS is ₹10,000 or more a year" },
  { id: "oldRegime", label: "Filing under the old tax regime" },
  { id: "ppf", label: "Has a PPF account" },
  { id: "nps", label: "Has an NPS Tier-I account" },
  { id: "sukanya", label: "Has a Sukanya Samriddhi account" },
  { id: "demat", label: "Has a demat account or mutual funds" },
  { id: "homeLoan", label: "Has a home loan" },
  { id: "insurance", label: "Has life or health insurance" },
  { id: "seniorCitizen", label: "Senior citizen (60 or above)" },
  { id: "dependants", label: "Has dependants" },
];

/**
 * Task catalogue. `month` is 1-12 and `day` is the date in that month; a task with no
 * month is not tied to a statutory date. `requires` lists profile flags of which at least
 * one must be true; an empty list means the task applies to everyone.
 */
export const TASK_CATALOGUE = [
  {
    id: "advance-tax-q1",
    title: "Pay the first advance tax instalment",
    detail: "15% of the estimated liability for the year is due by this date under section 211.",
    category: "Tax",
    month: 6,
    day: 15,
    requires: ["advanceTax", "businessIncome"],
  },
  {
    id: "form-16",
    title: "Collect Form 16 from your employer",
    detail: "Rule 31 requires employers to issue Form 16 for the previous financial year by 15 June.",
    category: "Tax",
    month: 6,
    day: 15,
    requires: ["salaried"],
  },
  {
    id: "ais-26as",
    title: "Reconcile Form 26AS and the Annual Information Statement",
    detail:
      "Check that every TDS entry, interest payment and high-value transaction reported against your PAN is yours before you file.",
    category: "Tax",
    month: 7,
    day: 15,
    requires: [],
  },
  {
    id: "file-itr",
    title: "File the income tax return",
    detail: "Due date under section 139(1) for individuals who are not liable to audit.",
    category: "Tax",
    month: 7,
    day: 31,
    requires: [],
  },
  {
    id: "advance-tax-q2",
    title: "Pay the second advance tax instalment",
    detail: "Cumulative 45% of the estimated liability is due by this date.",
    category: "Tax",
    month: 9,
    day: 15,
    requires: ["advanceTax", "businessIncome"],
  },
  {
    id: "advance-tax-q3",
    title: "Pay the third advance tax instalment",
    detail: "Cumulative 75% of the estimated liability is due by this date.",
    category: "Tax",
    month: 12,
    day: 15,
    requires: ["advanceTax", "businessIncome"],
  },
  {
    id: "belated-return",
    title: "File a belated or revised return if needed",
    detail:
      "Sections 139(4) and 139(5) allow a belated or revised return up to 31 December of the assessment year.",
    category: "Tax",
    month: 12,
    day: 31,
    requires: [],
  },
  {
    id: "investment-proofs",
    title: "Submit investment proofs to your employer",
    detail:
      "Employers collect proofs in January so the last quarter's TDS is correct. Missing the internal date means claiming the deduction in your return instead.",
    category: "Tax",
    month: 1,
    day: 31,
    requires: ["salaried"],
  },
  {
    id: "advance-tax-q4",
    title: "Pay the final advance tax instalment",
    detail: "The full 100% of the estimated liability must be paid by 15 March.",
    category: "Tax",
    month: 3,
    day: 15,
    requires: ["advanceTax", "businessIncome"],
  },
  {
    id: "tax-saving-investments",
    title: "Complete tax-saving investments and payments",
    detail:
      "Deductions such as 80C, 80D and 80CCD(1B) are allowed only for amounts actually invested or paid within the financial year.",
    category: "Tax",
    month: 3,
    day: 31,
    requires: ["oldRegime"],
  },
  {
    id: "ppf-minimum",
    title: `Deposit at least ₹${MIN_PPF_DEPOSIT} into PPF`,
    detail: "A PPF account with no deposit in a financial year is treated as discontinued until a penalty and arrears are paid.",
    category: "Savings",
    month: 3,
    day: 31,
    requires: ["ppf"],
  },
  {
    id: "sukanya-minimum",
    title: `Deposit at least ₹${MIN_SSY_DEPOSIT} into Sukanya Samriddhi`,
    detail: "The account becomes irregular without the minimum yearly deposit and needs a penalty to revive.",
    category: "Savings",
    month: 3,
    day: 31,
    requires: ["sukanya"],
  },
  {
    id: "nps-minimum",
    title: `Deposit at least ₹${MIN_NPS_TIER1_DEPOSIT} into NPS Tier-I`,
    detail: "The minimum yearly contribution keeps a Tier-I account active and avoids a freeze.",
    category: "Savings",
    month: 3,
    day: 31,
    requires: ["nps"],
  },
  {
    id: "ppf-april-5",
    title: "Fund PPF by 5 April for a full year of interest",
    detail:
      "PPF interest is computed on the lowest balance between the 5th and the last day of each month, so a deposit on or before 5 April earns interest for all twelve months.",
    category: "Savings",
    month: 4,
    day: 5,
    requires: ["ppf"],
  },
  {
    id: "form-15g-15h",
    title: "Submit Form 15G or 15H at the start of the year",
    detail:
      "Where your total income is below the taxable limit, these declarations stop banks deducting TDS on interest. They must be filed afresh each financial year.",
    category: "Tax",
    month: 4,
    day: 30,
    requires: ["seniorCitizen"],
  },
  {
    id: "home-loan-certificate",
    title: "Collect the home loan interest certificate",
    detail:
      "The lender's provisional and final statements split principal and interest, which drives the 80C and section 24(b) claims.",
    category: "Tax",
    month: 4,
    day: 30,
    requires: ["homeLoan"],
  },
  {
    id: "nominee-update",
    title: "Check and update nominees everywhere",
    detail:
      "Bank accounts, demat accounts, mutual fund folios, insurance policies, PF and PPF each carry their own nomination. SEBI requires a nomination or an explicit opt-out for demat accounts and mutual fund folios.",
    category: "Housekeeping",
    requires: [],
  },
  {
    id: "credit-report",
    title: "Pull your free credit report",
    detail:
      "RBI directions entitle you to one free full credit report a year from each credit information company. Check for accounts and enquiries you do not recognise.",
    category: "Housekeeping",
    requires: [],
  },
  {
    id: "kyc-refresh",
    title: "Refresh KYC where it has lapsed",
    detail:
      "Periodic KYC updation is required by banks and by mutual fund registrars; a lapsed KYC can freeze redemptions at the worst moment.",
    category: "Housekeeping",
    requires: ["demat"],
  },
  {
    id: "insurance-review",
    title: "Review life and health cover",
    detail:
      "Check the sum insured against current income and medical costs, confirm premiums are paid, and note any waiting periods that have now completed.",
    category: "Protection",
    requires: ["insurance", "dependants"],
  },
  {
    id: "will-review",
    title: "Review or write a will",
    detail:
      "A nomination transfers custody, not ownership. Where there are dependants or jointly held assets, a will is what settles who inherits.",
    category: "Protection",
    requires: ["dependants"],
  },
  {
    id: "rebalance",
    title: "Rebalance the portfolio back to target",
    detail:
      "After a strong or weak year the asset mix drifts. Rebalancing once a year restores the risk level you chose, though switching can trigger capital gains.",
    category: "Investments",
    requires: ["demat"],
  },
  {
    id: "capital-gains-review",
    title: "Review realised and unrealised capital gains",
    detail:
      "Knowing the position before 31 March lets you plan disposals deliberately rather than discovering the tax when you file.",
    category: "Investments",
    requires: ["demat"],
  },
  {
    id: "emergency-fund-check",
    title: "Top the emergency fund back up",
    detail:
      "If expenses rose during the year, a fund sized last year no longer covers the same number of months.",
    category: "Housekeeping",
    requires: [],
  },
  {
    id: "unclaimed-accounts",
    title: "Trace dormant accounts and unclaimed deposits",
    detail:
      "Old bank accounts, matured deposits and forgotten folios can be traced through the RBI's UDGAM portal and the IEPF for unclaimed dividends and shares.",
    category: "Housekeeping",
    requires: [],
  },
];

export const CATEGORIES = ["Tax", "Savings", "Investments", "Protection", "Housekeeping"];

const MS_PER_DAY = 86400000;

/** Parse an ISO yyyy-mm-dd string into a UTC date, or null. */
export function parseIsoDate(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  if (Number.isNaN(date.getTime())) return null;
  if (date.getUTCMonth() !== Number(m) - 1) return null;
  return date;
}

export function formatIsoDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

/** The next calendar occurrence of month/day on or after `from`. */
export function nextOccurrence(from, month, day) {
  const thisYear = new Date(Date.UTC(from.getUTCFullYear(), month - 1, day));
  if (thisYear.getTime() >= from.getTime()) return thisYear;
  return new Date(Date.UTC(from.getUTCFullYear() + 1, month - 1, day));
}

/** Label for the Indian financial year containing `date`, e.g. "2026-27". */
export function financialYearLabel(date) {
  const year = date.getUTCFullYear();
  const startYear = date.getUTCMonth() >= 3 ? year : year - 1;
  return `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;
}

/**
 * @param {object} input
 * @param {string} input.asOfDate Reference date, ISO yyyy-mm-dd, supplied by the caller.
 * @param {object} [input.profile] Map of PROFILE_FLAGS ids to booleans.
 * @param {Array<string>} [input.completedIds] Task ids already ticked off.
 */
export function buildAnnualChecklist({ asOfDate, profile = {}, completedIds = [] } = {}) {
  const today = parseIsoDate(asOfDate);
  if (!today) return { error: "Enter a valid date to build the checklist from." };
  if (profile === null || typeof profile !== "object") {
    return { error: "Profile selection is missing." };
  }

  const done = new Set(Array.isArray(completedIds) ? completedIds : []);

  const applicable = TASK_CATALOGUE.filter(
    (task) => task.requires.length === 0 || task.requires.some((flag) => profile[flag] === true),
  );

  if (applicable.length === 0) {
    return { error: "No tasks match this profile — select at least one option above." };
  }

  const tasks = applicable.map((task) => {
    const dated = typeof task.month === "number" && typeof task.day === "number";
    const dueDate = dated ? nextOccurrence(today, task.month, task.day) : null;
    const daysAway = dueDate ? Math.round((dueDate.getTime() - today.getTime()) / MS_PER_DAY) : null;
    let status = "anytime";
    if (daysAway !== null) status = daysAway <= DUE_SOON_DAYS ? "due-soon" : "upcoming";
    return {
      id: task.id,
      title: task.title,
      detail: task.detail,
      category: task.category,
      dueDate: dueDate ? formatIsoDate(dueDate) : null,
      daysAway,
      status,
      done: done.has(task.id),
    };
  });

  // Dated tasks first, nearest deadline at the top; undated tasks after them.
  tasks.sort((a, b) => {
    if (a.daysAway === null && b.daysAway === null) return a.title.localeCompare(b.title);
    if (a.daysAway === null) return 1;
    if (b.daysAway === null) return -1;
    return a.daysAway - b.daysAway;
  });

  const completedCount = tasks.filter((task) => task.done).length;
  const dueSoon = tasks.filter((task) => task.status === "due-soon" && !task.done);

  const byCategory = CATEGORIES.map((category) => ({
    category,
    tasks: tasks.filter((task) => task.category === category),
  })).filter((group) => group.tasks.length > 0);

  return {
    asOfDate: formatIsoDate(today),
    financialYear: financialYearLabel(today),
    total: tasks.length,
    completedCount,
    remaining: tasks.length - completedCount,
    progressPct: Math.round((completedCount / tasks.length) * 1000) / 10,
    dueSoonCount: dueSoon.length,
    nextTask: dueSoon[0] ?? tasks.find((task) => task.daysAway !== null && !task.done) ?? null,
    tasks,
    byCategory,
  };
}
