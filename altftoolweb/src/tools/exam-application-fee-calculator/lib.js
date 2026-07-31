/**
 * Application fee calculator for competitive exams.
 *
 * Every exam here carries the fee published in its own recent notification, together
 * with the exemption rule that decides which band a candidate falls in. The rules, not
 * merely the amounts, are what this module encodes:
 *
 *  - SSC (CGL, CHSL, MTS, CPO and the rest): ₹100, and women, Scheduled Caste,
 *    Scheduled Tribe, persons with benchmark disability and ex-servicemen eligible for
 *    reservation pay nothing at all. The exemption is by status, not by post.
 *
 *  - UPSC Civil Services: ₹100 for the Preliminary examination and ₹200 for the Main,
 *    with female, SC, ST and benchmark-disability candidates exempt.
 *
 *  - UPSC NDA and CDS: ₹100, with SC and ST candidates exempt. Each notification lists
 *    the other exempt classes it recognises, so read it before assuming.
 *
 *  - RRB Centralised Employment Notices: ₹500 with ₹400 refunded on appearing in the
 *    first CBT, or ₹250 fully refunded for candidates in the concession bracket — SC,
 *    ST, women, transgender candidates, ex-servicemen, persons with benchmark
 *    disability, notified minorities and Economically Backward Class. Refunds are net
 *    of bank charges.
 *
 *  - CTET: ₹1,000 for one paper and ₹1,200 for both, reduced to ₹500 and ₹600 for SC,
 *    ST and differently-abled candidates.
 *
 *  - IBPS and SBI recruitment: a full fee for unreserved, OBC and EWS candidates and a
 *    much smaller or nil fee for SC, ST and PwBD candidates.
 *
 * Fees are revised from notification to notification. Every row here can be overridden
 * with the figure printed in the notice you are actually applying under, and the
 * calculator uses your figure when you supply one. Informational only.
 */

/** Most applications this calculator will total in one row. */
export const MAX_QUANTITY = 50;
/** Most rows it will total at once. */
export const MAX_ROWS = 30;

export const CATEGORIES = [
  { id: "general", label: "Unreserved / General", criterion: null },
  { id: "ews", label: "EWS", criterion: "ews" },
  { id: "obc", label: "OBC (non-creamy layer)", criterion: "obc" },
  { id: "sc", label: "Scheduled Caste", criterion: "sc" },
  { id: "st", label: "Scheduled Tribe", criterion: "st" },
];

/** Status flags that can move a candidate into a concession band. */
export const STATUS_FLAGS = [
  { id: "female", label: "Woman candidate" },
  { id: "transgender", label: "Transgender candidate" },
  { id: "pwbd", label: "Person with benchmark disability" },
  { id: "exServiceman", label: "Ex-serviceman eligible for reservation" },
  { id: "minority", label: "Notified minority community" },
  { id: "ebc", label: "Economically Backward Class" },
];

/**
 * Fee schedules. `standard` is what a candidate outside the concession bracket pays;
 * `concession` is the reduced or nil fee; `criteria` lists the grounds that qualify.
 */
export const EXAMS = [
  {
    id: "ssc",
    label: "SSC — CGL, CHSL, MTS, CPO, GD",
    unit: "examination",
    standard: 100,
    concession: 0,
    criteria: ["sc", "st", "female", "pwbd", "exServiceman"],
    refundStandard: 0,
    refundConcession: 0,
    source: "SSC notices: ₹100, with women, SC, ST, PwBD and eligible ex-servicemen exempt.",
  },
  {
    id: "upsc-pre",
    label: "UPSC Civil Services — Preliminary",
    unit: "attempt",
    standard: 100,
    concession: 0,
    criteria: ["sc", "st", "female", "pwbd"],
    refundStandard: 0,
    refundConcession: 0,
    source: "UPSC CSE notification: ₹100, with female, SC, ST and benchmark-disability candidates exempt.",
  },
  {
    id: "upsc-main",
    label: "UPSC Civil Services — Main",
    unit: "attempt",
    standard: 200,
    concession: 0,
    criteria: ["sc", "st", "female", "pwbd"],
    refundStandard: 0,
    refundConcession: 0,
    source: "UPSC CSE notification: ₹200 for the Main, same exemptions as the Preliminary.",
  },
  {
    id: "upsc-defence",
    label: "UPSC NDA / CDS",
    unit: "examination",
    standard: 100,
    concession: 0,
    criteria: ["sc", "st"],
    refundStandard: 0,
    refundConcession: 0,
    source: "UPSC defence notifications: ₹100, with SC and ST candidates exempt; read the notice for its other exempt classes.",
  },
  {
    id: "rrb",
    label: "RRB — Centralised Employment Notice",
    unit: "CEN",
    standard: 500,
    concession: 250,
    criteria: ["sc", "st", "female", "transgender", "pwbd", "exServiceman", "minority", "ebc"],
    refundStandard: 400,
    refundConcession: 250,
    source: "RRB CENs: ₹500 with ₹400 refunded on appearing in CBT-1, or ₹250 fully refunded in the concession bracket.",
  },
  {
    id: "ibps",
    label: "IBPS — PO, Clerk, SO, RRB",
    unit: "recruitment",
    standard: 850,
    concession: 175,
    criteria: ["sc", "st", "pwbd"],
    refundStandard: 0,
    refundConcession: 0,
    source: "IBPS notifications of recent cycles: ₹850 generally and ₹175 for SC, ST and PwBD candidates.",
  },
  {
    id: "sbi",
    label: "SBI — PO, Clerk",
    unit: "recruitment",
    standard: 750,
    concession: 0,
    criteria: ["sc", "st", "pwbd"],
    refundStandard: 0,
    refundConcession: 0,
    source: "SBI notifications of recent cycles: ₹750 generally, nil for SC, ST and PwBD candidates.",
  },
  {
    id: "ctet-one",
    label: "CTET — one paper",
    unit: "attempt",
    standard: 1000,
    concession: 500,
    criteria: ["sc", "st", "pwbd"],
    refundStandard: 0,
    refundConcession: 0,
    source: "CTET information bulletin: ₹1,000 for one paper, ₹500 for SC, ST and differently-abled candidates.",
  },
  {
    id: "ctet-both",
    label: "CTET — both papers",
    unit: "attempt",
    standard: 1200,
    concession: 600,
    criteria: ["sc", "st", "pwbd"],
    refundStandard: 0,
    refundConcession: 0,
    source: "CTET information bulletin: ₹1,200 for both papers, ₹600 for SC, ST and differently-abled candidates.",
  },
  {
    id: "custom",
    label: "Another exam — enter the fee yourself",
    unit: "application",
    standard: 0,
    concession: 0,
    criteria: [],
    refundStandard: 0,
    refundConcession: 0,
    source: "Take the amount from the notification you are applying under.",
  },
];

const round0 = (value) => Math.round(value);

/**
 * Which concession grounds a candidate satisfies for one exam.
 *
 * @param {object} exam     One entry from EXAMS.
 * @param {object} profile  { categoryId, female, transgender, pwbd, exServiceman, minority, ebc }
 * @returns {{concession:boolean, grounds:string[]}}
 */
export function concessionGrounds(exam, profile = {}) {
  const category = CATEGORIES.find((entry) => entry.id === (profile.categoryId || "general"));
  const active = new Set();
  if (category && category.criterion) active.add(category.criterion);
  STATUS_FLAGS.forEach((flag) => {
    if (profile[flag.id]) active.add(flag.id);
  });

  const grounds = (exam.criteria || []).filter((criterion) => active.has(criterion));
  const labelFor = (criterion) => {
    const categoryMatch = CATEGORIES.find((entry) => entry.criterion === criterion);
    if (categoryMatch) return categoryMatch.label;
    const flagMatch = STATUS_FLAGS.find((entry) => entry.id === criterion);
    return flagMatch ? flagMatch.label : criterion;
  };

  return { concession: grounds.length > 0, grounds: grounds.map(labelFor) };
}

/**
 * Fee for one row: an exam, a quantity and an optional override amount.
 *
 * @param {object} input
 * @param {string} input.examId
 * @param {number|string} input.quantity     How many applications of that exam.
 * @param {number|string} [input.overrideFee] Fee per application, when the notification differs.
 * @param {boolean} [input.appearsInExam]    Whether the candidate sits the exam, for refundable fees.
 * @param {object} [input.profile]
 * @returns {object} row breakdown, or { error }.
 */
export function computeExamFeeRow({
  examId = "ssc",
  quantity = 1,
  overrideFee = "",
  appearsInExam = true,
  profile = {},
} = {}) {
  const exam = EXAMS.find((entry) => entry.id === examId);
  if (!exam) return { error: "Pick one of the listed exams, or choose the custom row." };

  const count = Number(quantity);
  if (!Number.isFinite(count)) return { error: `Enter a number of applications for ${exam.label}.` };
  if (count < 0) return { error: `The number of ${exam.label} applications cannot be negative.` };
  if (count > MAX_QUANTITY) {
    return { error: `This calculator totals up to ${MAX_QUANTITY} applications of one exam.` };
  }
  if (!Number.isInteger(count)) {
    return { error: `Enter a whole number of ${exam.label} applications.` };
  }
  const whole = count;

  const { concession, grounds } = concessionGrounds(exam, profile);
  const scheduleFee = concession ? exam.concession : exam.standard;

  let unitFee = scheduleFee;
  let overridden = false;
  if (overrideFee !== "" && overrideFee !== null && overrideFee !== undefined) {
    const manual = Number(overrideFee);
    if (!Number.isFinite(manual)) return { error: `Enter the ${exam.label} fee as a number.` };
    if (manual < 0) return { error: `The ${exam.label} fee cannot be negative.` };
    if (manual > 1000000) return { error: `That ${exam.label} fee is outside this calculator's range.` };
    unitFee = manual;
    overridden = true;
  }

  // Round the per-application fee first and treat that rounded figure as the one actually
  // charged, so every downstream total (paid, refunded) stays an exact multiple of the unit
  // fee shown to the user — a "quantity x fee" line built from the returned fields will
  // always check out instead of drifting from independently-rounded raw values.
  const roundedUnitFee = round0(unitFee);

  const refundUnitScheduled = concession ? exam.refundConcession : exam.refundStandard;
  // A refund can never exceed what was actually paid for that application.
  const refundUnit = appearsInExam ? Math.min(refundUnitScheduled, roundedUnitFee) : 0;

  const paid = roundedUnitFee * whole;
  const refunded = refundUnit * whole;

  return {
    exam,
    quantity: whole,
    concession,
    grounds,
    unitFee: roundedUnitFee,
    scheduleFee: round0(scheduleFee),
    overridden,
    refundUnit: round0(refundUnit),
    paid: round0(paid),
    refunded: round0(refunded),
    net: round0(paid - refunded),
    band: concession ? "Concession" : "Standard",
  };
}

/**
 * Total across several exam rows, plus any per-transaction bank charge the candidate
 * supplies.
 *
 * @param {object} input
 * @param {Array<object>} input.rows
 * @param {object} [input.profile]
 * @param {number|string} [input.chargePerTransaction] Bank or gateway charge per payment.
 * @returns {object} totals, or { error }.
 */
export function computeFeeTotal({ rows = [], profile = {}, chargePerTransaction = 0 } = {}) {
  const list = Array.isArray(rows) ? rows : [];
  if (list.length > MAX_ROWS) {
    return { error: `This calculator totals up to ${MAX_ROWS} exam rows at a time.` };
  }

  const charge = Number(chargePerTransaction === "" ? 0 : chargePerTransaction);
  if (!Number.isFinite(charge)) return { error: "Enter the bank charge per payment as a number." };
  if (charge < 0) return { error: "The bank charge cannot be negative." };
  if (charge > 100000) return { error: "That bank charge is outside this calculator's range." };

  const computed = [];
  for (const row of list) {
    const result = computeExamFeeRow({ ...row, profile });
    if (result.error) return { error: result.error };
    computed.push({ ...result, id: row.id });
  }

  const applications = computed.reduce((sum, row) => sum + row.quantity, 0);
  const paid = computed.reduce((sum, row) => sum + row.paid, 0);
  const refunded = computed.reduce((sum, row) => sum + row.refunded, 0);
  const charges = charge * applications;

  return {
    rows: computed,
    applications,
    feePaid: round0(paid),
    refundable: round0(refunded),
    bankCharges: round0(charges),
    outlay: round0(paid + charges),
    net: round0(paid + charges - refunded),
    concessionRows: computed.filter((row) => row.concession).length,
  };
}
