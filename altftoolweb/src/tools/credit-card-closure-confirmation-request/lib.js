/**
 * Credit card closure request builder for Indian card issuers.
 *
 * Pure module: works out the statutory closure deadline in working days, the
 * delay compensation payable at a fixed rate per day, and renders the closure
 * letter. Every date is supplied by the caller — nothing reads the clock.
 */

/**
 * RBI Master Direction - Credit Card and Debit Card - Issuance and Conduct
 * Directions, 2022 (para 7(b)(ii)): the card-issuer must complete the closure
 * process within SEVEN WORKING DAYS of the request, subject to the cardholder
 * paying all dues.
 */
export const CLOSURE_WORKING_DAYS = 7;

/**
 * Same paragraph: failure to close within seven working days attracts a penalty
 * of Rs 500 PER DAY of delay payable to the cardholder, provided there is no
 * outstanding balance on the account.
 */
export const DELAY_PENALTY_PER_DAY = 500;

/**
 * RBI's 8 August 2024 direction to credit institutions requires credit
 * information to be reported to the credit information companies on a
 * FORTNIGHTLY basis with effect from 1 January 2025, so a closed card should
 * show as "closed" in the bureau report within roughly 15 days.
 */
export const BUREAU_UPDATE_DAYS = 15;

/** Reasons customers give when closing a card. */
export const CLOSURE_REASONS = [
  "Annual fee no longer justified by the benefits",
  "Card was mis-sold or the promised lifetime-free terms were not honoured",
  "Consolidating to fewer cards",
  "Moving to another issuer with better rewards",
  "Concerns about unauthorised or disputed transactions",
  "No longer required",
];

/** Confirmations the letter should demand back in writing. */
export const CONFIRMATION_ASKS = [
  "Written confirmation of closure with the closure date and a service request number",
  "A nil-outstanding / no-dues certificate for the card account",
  "Update of the account status to 'Closed' with all credit information companies",
  "Cancellation of every add-on card and standing instruction linked to this card",
  "Refund of any unused annual fee, reward redemption or credit balance",
];

const MS_PER_DAY = 86400000;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const WEEKEND = new Set([0, 6]); // Sunday and Saturday

const clean = (value) => String(value ?? "").trim();
const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

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

const toIso = (ms) => new Date(ms).toISOString().slice(0, 10);

/** Whole calendar days from `fromIso` to `toIso` (negative if `toIso` is earlier). */
export function daysBetween(fromIso, toIso_) {
  const a = toUtcMs(fromIso);
  const b = toUtcMs(toIso_);
  if (a === null || b === null) return null;
  return Math.round((b - a) / MS_PER_DAY);
}

/**
 * Add N working days to a date, skipping Saturdays, Sundays and any bank
 * holidays supplied as ISO strings. Day 0 is the request date itself.
 */
export function addWorkingDays(iso, workingDays, holidays = []) {
  const start = toUtcMs(iso);
  if (start === null) return null;
  const count = Math.round(Number(workingDays));
  if (!Number.isFinite(count) || count < 0 || count > 3650) return null;

  const skip = new Set(
    (Array.isArray(holidays) ? holidays : []).map(clean).filter((d) => ISO_DATE.test(d)),
  );

  let cursor = start;
  let counted = 0;
  while (counted < count) {
    cursor += MS_PER_DAY;
    const day = new Date(cursor);
    if (WEEKEND.has(day.getUTCDay())) continue;
    if (skip.has(toIso(cursor))) continue;
    counted += 1;
  }
  return toIso(cursor);
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
 * Closure deadline and delay compensation.
 *
 * @param {object} input
 * @param {string} input.requestDate  ISO date the closure request is sent.
 * @param {string} [input.statusDate] ISO date you are assessing on (actual closure date, or today).
 * @param {number} [input.outstandingDues] Balance still owed on the card.
 * @param {string[]} [input.holidays] Extra non-working days.
 * @returns {object|{error: string}}
 */
export function computeClosureTimeline({
  requestDate,
  statusDate = "",
  outstandingDues = 0,
  holidays = [],
} = {}) {
  if (toUtcMs(requestDate) === null) {
    return { error: "Enter a valid closure request date in yyyy-mm-dd format." };
  }

  const dues = Number(String(outstandingDues ?? 0).replace(/,/g, "").trim() || 0);
  if (!Number.isFinite(dues) || dues < 0) {
    return { error: "Outstanding dues must be zero or a positive amount." };
  }

  const deadline = addWorkingDays(requestDate, CLOSURE_WORKING_DAYS, holidays);
  if (!deadline) return { error: "Could not work out the closure deadline from that date." };

  const bureauDeadline = toIso(toUtcMs(deadline) + BUREAU_UPDATE_DAYS * MS_PER_DAY);

  const check = clean(statusDate);
  let delayDays = 0;
  let assessedOn = "";
  if (check) {
    if (toUtcMs(check) === null) {
      return { error: "Enter a valid 'status as on' date in yyyy-mm-dd format." };
    }
    if (daysBetween(requestDate, check) < 0) {
      return { error: "The status date cannot be before the closure request date." };
    }
    assessedOn = check;
    delayDays = Math.max(0, daysBetween(deadline, check));
  }

  const penaltyApplies = dues === 0 && delayDays > 0;

  return {
    requestDate: clean(requestDate),
    deadline,
    bureauDeadline,
    assessedOn,
    delayDays,
    outstandingDues: round2(dues),
    penaltyApplies,
    penaltyPerDay: DELAY_PENALTY_PER_DAY,
    penaltyAmount: penaltyApplies ? round2(delayDays * DELAY_PENALTY_PER_DAY) : 0,
    note: dues > 0
      ? "Delay compensation applies only when there is no outstanding balance on the card, so clear the dues first."
      : delayDays > 0
        ? "The seven-working-day window has lapsed; compensation is claimable for each day of delay."
        : "Still inside the seven-working-day window.",
  };
}

/**
 * Build the closure request letter.
 *
 * @returns {{letter: string, timeline: object}|{error: string}}
 */
export function buildClosureRequest({
  cardholderName,
  address = "",
  email = "",
  phone = "",
  issuerName,
  cardLastFour = "",
  cardVariant = "",
  requestDate,
  statusDate = "",
  outstandingDues = 0,
  holidays = [],
  reason = CLOSURE_REASONS[0],
  asks = CONFIRMATION_ASKS.slice(0, 4),
  claimPenalty = false,
} = {}) {
  const name = clean(cardholderName);
  const issuer = clean(issuerName);
  if (!name) return { error: "Enter the cardholder's name." };
  if (!issuer) return { error: "Enter the card issuer's name." };

  const four = clean(cardLastFour);
  if (four && !/^\d{4}$/.test(four)) {
    return { error: "Card last four digits must be exactly four numbers." };
  }

  const timeline = computeClosureTimeline({ requestDate, statusDate, outstandingDues, holidays });
  if (timeline.error) return { error: timeline.error };

  const cardRef = four
    ? `${clean(cardVariant) || "credit card"} ending ${four}`
    : clean(cardVariant) || "the credit card held with you";

  const askList = (Array.isArray(asks) ? asks : [])
    .map(clean)
    .filter(Boolean);
  const finalAsks = askList.length > 0 ? askList : CONFIRMATION_ASKS.slice(0, 4);

  const contactBits = [email && `Email: ${clean(email)}`, phone && `Phone: ${clean(phone)}`]
    .filter(Boolean)
    .join(" | ");

  const duesLine =
    timeline.outstandingDues > 0
      ? `An amount of ${money(timeline.outstandingDues)} is outstanding; I am settling it along with this request so that the closure can proceed.`
      : "There is no outstanding balance on this card as on the date of this letter.";

  const penaltyPara =
    claimPenalty && timeline.penaltyApplies
      ? `The closure was due by ${formatLongDate(timeline.deadline)}. As on ${formatLongDate(timeline.assessedOn)} the account is still not closed, a delay of ${timeline.delayDays} day${timeline.delayDays === 1 ? "" : "s"}. Under para 7(b)(ii) of the RBI Master Direction on Credit Card and Debit Card - Issuance and Conduct Directions, 2022, I am entitled to ${money(DELAY_PENALTY_PER_DAY)} per day of delay, and I claim ${money(timeline.penaltyAmount)} accordingly.`
      : "";

  const letter = [
    name,
    clean(address),
    contactBits,
    "",
    `Date: ${formatLongDate(timeline.requestDate)}`,
    "",
    "To,",
    "The Manager - Credit Cards / Nodal Grievance Officer",
    issuer,
    "",
    `Subject: Request to close ${cardRef} and issue written closure confirmation`,
    "",
    "Sir / Madam,",
    "",
    `I wish to close ${cardRef} with immediate effect. Reason: ${clean(reason) || CLOSURE_REASONS[CLOSURE_REASONS.length - 1]}.`,
    "",
    duesLine,
    "",
    "I request you to:",
    ...finalAsks.map((item, index) => `${index + 1}. ${item}.`),
    "",
    `Please note that under para 7(b)(ii) of the RBI Master Direction on Credit Card and Debit Card - Issuance and Conduct Directions, 2022, the closure must be completed within ${CLOSURE_WORKING_DAYS} working days of this request, that is by ${formatLongDate(timeline.deadline)}, and a delay attracts compensation of ${money(DELAY_PENALTY_PER_DAY)} for each day of delay where no balance is outstanding.`,
    ...(penaltyPara ? ["", penaltyPara] : []),
    "",
    `I also request that the closed status be reported to CIBIL, Experian, Equifax and CRIF High Mark, which should reflect by approximately ${formatLongDate(timeline.bureauDeadline)} given fortnightly bureau reporting. Kindly do not treat any future usage attempt or auto-debit on this card as a request to reopen it.`,
    "",
    "Yours faithfully,",
    "",
    name,
  ]
    .filter((line, index, all) => !(line === "" && all[index - 1] === ""))
    .join("\n");

  return { letter, timeline };
}
