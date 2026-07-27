/**
 * College admission tracker — documents, deadlines and the fee steps.
 *
 * Rule sources:
 *
 *  - Anti-ragging undertaking. The UGC Regulations on Curbing the Menace of Ragging in
 *    Higher Educational Institutions, 2009 require every student and their parent or
 *    guardian to file an affidavit-style undertaking each academic year. It is filed
 *    online and the reference number is produced at admission. It is the item most
 *    often forgotten on the day, and admission is not completed without it.
 *
 *  - Fee refund on withdrawal. The University Grants Commission's public notice on
 *    refund of fees fixes a slab against the institution's formally notified last date
 *    of admission:
 *        withdrawal 15 days or more BEFORE that date — full refund, less a processing
 *          charge that may not exceed ₹1,000;
 *        less than 15 days before — 90% refunded;
 *        not more than 15 days after — 80%;
 *        more than 15 and up to 30 days after — 50%;
 *        more than 30 days after — nothing.
 *    The slab is worked out from the notified last date of admission, not from the date
 *    the fee was paid.
 *
 *  - Migration certificate is required when a student moves from one board or
 *    university to another, and is issued by the board or university being left. It is
 *    routinely allowed to be produced later, but the admission stays provisional until
 *    it is.
 *
 *  - An Academic Bank of Credits (ABC) / APAAR identity number is now asked for at
 *    admission by central universities and by institutions following the credit
 *    framework, and it has to be created by the student before the form is filled.
 *
 *  - A gap certificate or affidavit is called for wherever there is a break between the
 *    last qualification and the present admission. What it must say varies by
 *    institution, but it always has to account for the whole period.
 *
 * Fees, dates and document lists differ by institution. Informational only — the
 * prospectus and the admission notice for your institution govern.
 */

/** Processing charge the UGC permits an institution to keep in the full-refund band. */
export const REFUND_PROCESSING_CAP = 1000;

/** UGC refund slab, keyed on days relative to the notified last date of admission. */
export const UGC_REFUND_SLABS = [
  {
    id: "early",
    label: "15 days or more before the last date of admission",
    percent: 100,
    deductsProcessing: true,
  },
  { id: "late-before", label: "Less than 15 days before the last date", percent: 90, deductsProcessing: false },
  { id: "within-15", label: "Up to 15 days after the last date", percent: 80, deductsProcessing: false },
  { id: "within-30", label: "More than 15 and up to 30 days after", percent: 50, deductsProcessing: false },
  { id: "after-30", label: "More than 30 days after the last date", percent: 0, deductsProcessing: false },
];

/** The money steps of an Indian admission, in the order they fall due. */
export const FEE_STEPS = [
  { id: "applicationFee", label: "Application or entrance form fee", detail: "Paid per institution or per common form; almost never refundable." },
  { id: "counsellingFee", label: "Counselling registration fee", detail: "Paid to the counselling body, separate from any institution." },
  { id: "seatAcceptanceFee", label: "Seat acceptance or confirmation fee", detail: "Locks the allotted seat; usually adjusted against tuition later." },
  { id: "admissionFee", label: "Admission and first-term tuition fee", detail: "The large one, and the figure the refund slab is applied to." },
  { id: "securityDeposit", label: "Refundable security or caution deposit", detail: "Returned at the end of the course against a no-dues certificate." },
];

/** Documents an Indian institution asks for at admission. */
export const DOCUMENTS = [
  { id: "class10", label: "Class 10 marksheet and certificate", detail: "Also the date-of-birth proof at most institutions.", group: "Academics" },
  { id: "class12", label: "Class 12 marksheet and passing certificate", detail: "Provisional marksheets are accepted only until the original is issued.", group: "Academics" },
  { id: "entranceScore", label: "Entrance exam scorecard and rank letter", detail: "CUET, JEE, NEET, a state CET or the university's own test.", group: "Academics" },
  { id: "allotment", label: "Seat allotment or provisional admission letter", detail: "Print it; several institutions will not start verification without a hard copy.", group: "Admission" },
  { id: "transferCert", label: "Transfer certificate from the last institution", detail: "Issued when you leave, and required in original.", group: "Admission" },
  { id: "migration", label: "Migration certificate", detail: "Needed when moving between boards or universities. Admission stays provisional until produced.", group: "Admission" },
  { id: "character", label: "Character certificate from the last institution", detail: "Usually must be dated within the last six months.", group: "Admission" },
  { id: "antiRagging", label: "Anti-ragging undertaking by student and parent", detail: "Filed online each academic year under the UGC Regulations, 2009. Carry the reference number.", group: "Declarations" },
  { id: "medical", label: "Medical fitness certificate", detail: "On the institution's own format where one is prescribed.", group: "Declarations" },
  { id: "aadhaar", label: "Aadhaar and a second photo identity document", detail: "Name spelling must match the marksheets exactly.", group: "Identity" },
  { id: "abcId", label: "Academic Bank of Credits / APAAR ID", detail: "Created by the student before the form is filled; asked for by central universities.", group: "Identity" },
  { id: "photos", label: "Passport photographs, same image as uploaded online", detail: "Six to ten copies covers most institutions.", group: "Identity" },
  { id: "categoryCert", label: "Category certificate in the prescribed format", detail: "SC, ST, OBC-NCL, EWS or a state class, valid on the closing date.", group: "Claims", conditional: "category" },
  { id: "incomeCert", label: "Income certificate for fee concession or EWS", detail: "From a revenue authority, for the current financial year.", group: "Claims", conditional: "feeConcession" },
  { id: "pwdCert", label: "Disability certificate, 40% or more", detail: "Needed for the PwD quota and for exam concessions.", group: "Claims", conditional: "pwd" },
  { id: "domicile", label: "Domicile or residence certificate", detail: "For state quota seats, and often for fee category too.", group: "Claims", conditional: "stateQuota" },
  { id: "gapCert", label: "Gap certificate or affidavit covering the break", detail: "Must account for the whole period between the last qualification and now.", group: "Claims", conditional: "gapYear" },
  { id: "bankAccount", label: "Bank account details for refunds and scholarships", detail: "In the student's own name.", group: "Money" },
  { id: "feeReceipts", label: "Receipts for every fee already paid", detail: "Keep the transaction references; refunds are traced against them.", group: "Money" },
];

const DAY_MS = 86400000;

function isLeap(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function daysInMonth(year, month) {
  const table = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return month === 2 && isLeap(year) ? 29 : table[month - 1];
}

/** Strict YYYY-MM-DD parse; null when the string is not a real calendar date. */
export function parseISODate(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  if (y < 1900 || y > 2200 || m < 1 || m > 12) return null;
  if (d < 1 || d > daysInMonth(y, m)) return null;
  return { y, m, d };
}

function toUTC({ y, m, d }) {
  return Date.UTC(y, m - 1, d);
}

/** Whole days from one ISO date to another; positive when `toISO` is later. */
export function diffDays(fromISO, toISO) {
  const from = parseISODate(fromISO);
  const to = parseISODate(toISO);
  if (!from || !to) return null;
  return Math.round((toUTC(to) - toUTC(from)) / DAY_MS);
}

/** ISO date n days after the given one; "" when the input will not parse. */
export function addDays(isoDate, days) {
  const parts = parseISODate(isoDate);
  const n = Number(days);
  if (!parts || !Number.isFinite(n)) return "";
  const shifted = new Date(toUTC(parts) + Math.trunc(n) * DAY_MS);
  const y = shifted.getUTCFullYear();
  const m = shifted.getUTCMonth() + 1;
  const d = shifted.getUTCDate();
  return `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

const round0 = (value) => Math.round(value);

/**
 * The UGC refund slab applied to a withdrawal.
 *
 * @param {object} input
 * @param {number} input.feePaid            Amount paid to the institution.
 * @param {string} input.lastDateOfAdmission Institution's formally notified last date, YYYY-MM-DD.
 * @param {string} input.withdrawalDate      Date notice of withdrawal is given, YYYY-MM-DD.
 * @returns {object} refund breakdown, or { error }.
 */
export function computeUgcRefund({ feePaid = 0, lastDateOfAdmission = "", withdrawalDate = "" } = {}) {
  const fee = Number(feePaid);
  if (!Number.isFinite(fee)) return { error: "Enter the fee paid as a number." };
  if (fee < 0) return { error: "The fee paid cannot be negative." };
  if (fee > 1e9) return { error: "That fee is outside the range this tool handles." };

  const offset = diffDays(lastDateOfAdmission, withdrawalDate);
  if (offset === null) {
    return { error: "Enter both the notified last date of admission and the withdrawal date." };
  }

  let slab;
  if (offset <= -15) slab = UGC_REFUND_SLABS[0];
  else if (offset < 0) slab = UGC_REFUND_SLABS[1];
  else if (offset <= 15) slab = UGC_REFUND_SLABS[2];
  else if (offset <= 30) slab = UGC_REFUND_SLABS[3];
  else slab = UGC_REFUND_SLABS[4];

  const gross = (fee * slab.percent) / 100;
  const processing = slab.deductsProcessing ? Math.min(REFUND_PROCESSING_CAP, gross) : 0;
  const refund = Math.max(0, gross - processing);

  return {
    feePaid: round0(fee),
    offsetDays: offset,
    slab,
    percent: slab.percent,
    grossRefund: round0(gross),
    processingCharge: round0(processing),
    refund: round0(refund),
    forfeited: round0(fee - refund),
    describedAs:
      offset < 0
        ? `${Math.abs(offset)} day(s) before the notified last date`
        : offset === 0
          ? "on the notified last date"
          : `${offset} day(s) after the notified last date`,
  };
}

/**
 * Summarise a set of college applications against today's date.
 *
 * @param {Array<{id:string,name:string,deadline:string,fee:number|string}>} applications
 * @param {string} today  YYYY-MM-DD, supplied by the caller.
 * @returns {object} summary, or { error }.
 */
export function summariseApplications(applications, today) {
  if (!parseISODate(today)) return { error: "Enter today's date as a real calendar date." };
  const list = Array.isArray(applications) ? applications : [];

  const rows = [];
  let totalFee = 0;
  for (const application of list) {
    const name = String(application.name || "").trim() || "Untitled application";
    const feeValue = Number(application.fee);
    if (application.fee !== "" && application.fee !== undefined && !Number.isFinite(feeValue)) {
      return { error: `Enter the fee for "${name}" as a number, or leave it blank.` };
    }
    const fee = Number.isFinite(feeValue) && feeValue > 0 ? feeValue : 0;
    if (fee > 1e9) return { error: `The fee for "${name}" is outside the range this tool handles.` };

    const deadline = application.deadline || "";
    if (deadline && !parseISODate(deadline)) {
      return { error: `The deadline for "${name}" is not a real calendar date.` };
    }
    const daysLeft = deadline ? diffDays(today, deadline) : null;
    let status = "unset";
    if (daysLeft !== null) {
      if (daysLeft < 0) status = "passed";
      else if (daysLeft <= 3) status = "urgent";
      else status = "open";
    }
    totalFee += fee;
    rows.push({ ...application, name, fee: round0(fee), deadline, daysLeft, status });
  }

  const upcoming = rows
    .filter((row) => row.daysLeft !== null && row.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  return {
    rows,
    count: rows.length,
    totalFee: round0(totalFee),
    next: upcoming.length > 0 ? upcoming[0] : null,
    daysToNext: upcoming.length > 0 ? upcoming[0].daysLeft : null,
    overdue: rows.filter((row) => row.status === "passed").length,
    urgent: rows.filter((row) => row.status === "urgent").length,
  };
}

/**
 * The document list for one student's circumstances.
 *
 * @param {object} claims  Flags: category, feeConcession, pwd, stateQuota, gapYear.
 * @returns {Array<object>} documents that actually apply.
 */
export function buildDocumentList(claims = {}) {
  return DOCUMENTS.filter((doc) => !doc.conditional || Boolean(claims[doc.conditional])).map(
    (doc) => ({ ...doc, required: true }),
  );
}

/**
 * Progress across the document list.
 *
 * @param {Array<{id:string}>} documents
 * @param {Array<string>} haveIds
 */
export function computeReadiness(documents, haveIds) {
  const list = Array.isArray(documents) ? documents : [];
  const have = Array.isArray(haveIds) ? haveIds : [];
  const missing = list.filter((doc) => !have.includes(doc.id));
  const total = list.length;
  const held = total - missing.length;
  return {
    have: held,
    total,
    percent: total === 0 ? 0 : Math.round((held / total) * 100),
    missing,
    ready: total > 0 && missing.length === 0,
  };
}

export default summariseApplications;
