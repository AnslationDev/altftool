/**
 * Exam form correction window tracker.
 *
 * What is encoded here, and where it comes from:
 *
 *  - SSC opens a single correction window for each of its examinations and charges for
 *    it: ₹200 for the first correction and ₹500 for the second, with no third
 *    correction allowed. The window is announced separately from the application dates.
 *
 *  - NTA (JEE Main, NEET-UG, CUET, UGC-NET) opens a short correction window after
 *    applications close. The registered mobile number and email address are not
 *    changeable in it, because they are the login and one-time-password channel. Where
 *    a correction moves the candidate into a higher fee band, the difference has to be
 *    paid inside the window; where it moves them into a lower band, nothing is
 *    refunded.
 *
 *  - IBPS does not normally open an edit facility at all. The printout of the submitted
 *    application is final, which is why its own instructions tell candidates to preview
 *    before paying.
 *
 *  - RRB CENs sometimes open a modification link on payment of a modification charge
 *    announced in that CEN. It is not a standing feature and its scope is narrower than
 *    a full correction window.
 *
 *  - Across bodies, three things hold. The window never revives an application that was
 *    never submitted. Identity keys — the registration number, and Aadhaar where it was
 *    used to register — are never editable. And a change that lowers the fee band does
 *    not produce a refund.
 *
 * Windows, charges and the editable-field list are announced afresh for every cycle.
 * Informational only; the correction notice for your own exam governs.
 */

/** Days-left threshold at which the window is flagged as closing. */
export const URGENT_DAYS = 2;

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

/** Whole days between two ISO dates; positive when `toISO` is later. */
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

/** Fields a correction window is usually asked to fix. */
export const FIELDS = [
  { id: "name", label: "Spelling of the candidate's name" },
  { id: "parentName", label: "Father's or mother's name" },
  { id: "dob", label: "Date of birth" },
  { id: "gender", label: "Gender" },
  { id: "category", label: "Category — SC, ST, OBC, EWS or unreserved", feeSensitive: true },
  { id: "pwbd", label: "Person-with-disability status and scribe request", feeSensitive: true },
  { id: "photo", label: "Photograph" },
  { id: "signature", label: "Signature" },
  { id: "qualification", label: "Qualification, board, year or percentage" },
  { id: "examCentre", label: "Exam city or centre preference" },
  { id: "postPreference", label: "Post, paper or subject preference" },
  { id: "address", label: "Correspondence address" },
  { id: "mobile", label: "Registered mobile number" },
  { id: "email", label: "Registered email address" },
  { id: "registrationId", label: "Registration or application number" },
];

/** Editability by body. Anything not listed is treated as normally editable. */
export const BODIES = [
  {
    id: "nta",
    label: "NTA — JEE Main, NEET-UG, CUET, UGC-NET",
    charges: [],
    maxCorrections: 1,
    locked: ["mobile", "email", "registrationId"],
    feeDifferencePayable: true,
    notes: [
      "The registered mobile and email are the login and OTP channel, so they are not editable in the window.",
      "A change that raises your fee band has to be paid for inside the window; a change that lowers it earns no refund.",
      "NTA has in some cycles opened the window in phases, with different fields available in each. Read the notice, not last year's list.",
    ],
  },
  {
    id: "ssc",
    label: "SSC — Combined Graduate Level, CHSL, MTS and others",
    charges: [200, 500],
    maxCorrections: 2,
    locked: ["registrationId"],
    feeDifferencePayable: true,
    notes: [
      "SSC charges ₹200 for the first correction and ₹500 for the second, and allows no third.",
      "The correction charge is payable even if the change is trivial, and it is not refunded.",
      "Corrections are made against the single submitted application; a fresh application is not a correction.",
    ],
  },
  {
    id: "rrb",
    label: "RRB — Centralised Employment Notices",
    charges: [],
    maxCorrections: 1,
    locked: ["registrationId", "mobile"],
    feeDifferencePayable: true,
    notes: [
      "A modification link is opened only where that CEN provides for one, on payment of the modification charge stated in it.",
      "The scope is narrower than a full correction window — post and RRB choices are usually outside it.",
    ],
  },
  {
    id: "ibps",
    label: "IBPS — PO, Clerk, SO, RRB",
    charges: [],
    maxCorrections: 0,
    locked: FIELDS.map((field) => field.id),
    feeDifferencePayable: false,
    notes: [
      "IBPS does not normally open an edit facility. The submitted application is final, which is why its instructions insist on previewing before payment.",
      "Where a genuine error has been made, the only route is the candidate grievance channel, and it rarely changes anything.",
    ],
  },
  {
    id: "state",
    label: "A state commission or board",
    charges: [],
    maxCorrections: 1,
    locked: ["registrationId"],
    feeDifferencePayable: true,
    notes: [
      "Most commissions open a short window with a correction charge per attempt.",
      "Category changes that would reduce the fee are commonly refused outright.",
    ],
  },
];

/**
 * The charge for the next correction attempt at this body.
 *
 * @param {string} bodyId
 * @param {number} correctionsUsed  How many corrections have already been made.
 * @returns {{allowed:boolean, charge:number, reason:string}|{error:string}}
 */
export function nextCorrectionCharge(bodyId, correctionsUsed = 0) {
  const body = BODIES.find((entry) => entry.id === bodyId);
  if (!body) return { error: "Pick the body conducting the exam." };
  const used = Number(correctionsUsed);
  if (!Number.isFinite(used) || used < 0) {
    return { error: "Enter how many corrections you have already made, as 0 or more." };
  }
  const whole = Math.floor(used);

  if (body.maxCorrections === 0) {
    return {
      allowed: false,
      charge: 0,
      reason: `${body.label} does not open a correction facility, so there is nothing to pay and nothing to change.`,
    };
  }
  if (whole >= body.maxCorrections) {
    return {
      allowed: false,
      charge: 0,
      reason: `${body.label} allows ${body.maxCorrections} correction(s) and you have used ${whole}. No further correction is possible.`,
    };
  }
  const charge = body.charges.length > whole ? body.charges[whole] : 0;
  return {
    allowed: true,
    charge,
    reason:
      charge > 0
        ? `Correction number ${whole + 1} costs ₹${charge} at ${body.label}, payable inside the window and not refundable.`
        : `Correction number ${whole + 1} carries no published flat charge at ${body.label}, but a fee-band difference may still fall due.`,
  };
}

/**
 * Where today sits relative to the correction window.
 *
 * @returns {object} window state, or { error }.
 */
export function windowState({ today = "", windowStart = "", windowEnd = "" } = {}) {
  if (!parseISODate(today)) return { error: "Enter today's date as a real calendar date." };
  if (!parseISODate(windowStart)) return { error: "Enter the date the correction window opens." };
  if (!parseISODate(windowEnd)) return { error: "Enter the date the correction window closes." };
  if (diffDays(windowStart, windowEnd) < 0) {
    return { error: "The correction window is shown as closing before it opens." };
  }

  const daysToOpen = diffDays(today, windowStart);
  const daysToClose = diffDays(today, windowEnd);

  let status;
  if (daysToOpen > 0) status = "upcoming";
  else if (daysToClose < 0) status = "closed";
  else if (daysToClose <= URGENT_DAYS) status = "urgent";
  else status = "open";

  return {
    status,
    daysToOpen,
    daysToClose,
    lengthDays: diffDays(windowStart, windowEnd) + 1,
    windowStart,
    windowEnd,
    headline:
      status === "upcoming"
        ? `Opens in ${daysToOpen} day(s), on ${windowStart}.`
        : status === "closed"
          ? `Closed ${Math.abs(daysToClose)} day(s) ago, on ${windowEnd}.`
          : daysToClose === 0
            ? "Today is the last day of the window."
            : `Open — ${daysToClose} day(s) left, closing on ${windowEnd}.`,
  };
}

/**
 * The full correction plan: window state, per-field verdicts and what it costs.
 *
 * @returns {object} plan, or { error }.
 */
export function buildCorrectionPlan({
  bodyId = "nta",
  today = "",
  windowStart = "",
  windowEnd = "",
  fieldIds = [],
  correctionsUsed = 0,
  movesToHigherFeeBand = false,
} = {}) {
  const body = BODIES.find((entry) => entry.id === bodyId);
  if (!body) return { error: "Pick the body conducting the exam." };

  const state = windowState({ today, windowStart, windowEnd });
  if (state.error) return { error: state.error };

  const charge = nextCorrectionCharge(bodyId, correctionsUsed);
  if (charge.error) return { error: charge.error };

  const wanted = Array.isArray(fieldIds) ? fieldIds : [];
  const verdicts = FIELDS.filter((field) => wanted.includes(field.id)).map((field) => {
    const locked = body.locked.includes(field.id);
    return {
      ...field,
      locked,
      verdict: locked
        ? "Not editable at this body — you will have to work with the value already submitted."
        : field.feeSensitive
          ? "Normally editable, but it can move you into a different fee band."
          : "Normally editable inside the window.",
    };
  });

  const lockedCount = verdicts.filter((entry) => entry.locked).length;
  const feeSensitive = verdicts.some((entry) => entry.feeSensitive && !entry.locked);

  const warnings = [];
  if (state.status === "closed") {
    warnings.push(
      "The window has closed. Nothing in the application can be changed now, and a fresh application is not a substitute.",
    );
  }
  if (state.status === "upcoming") {
    warnings.push(
      "The window has not opened yet. Draft the exact corrected values now so that you are not composing them under a deadline.",
    );
  }
  if (lockedCount > 0) {
    warnings.push(
      `${lockedCount} of the changes you want are not permitted at ${body.label}. Plan around those rather than waiting for the window.`,
    );
  }
  if (feeSensitive && body.feeDifferencePayable) {
    warnings.push(
      movesToHigherFeeBand
        ? "This change moves you into a higher fee band, so the difference has to be paid inside the window or the correction will not take effect."
        : "A category or status change that lowers your fee band does not produce a refund, and several bodies refuse it outright.",
    );
  }

  const editable = verdicts.filter((entry) => !entry.locked);

  return {
    body,
    state,
    charge,
    verdicts,
    editable,
    lockedCount,
    warnings,
    notes: body.notes,
    canActNow: state.status === "open" || state.status === "urgent",
  };
}

export default buildCorrectionPlan;
