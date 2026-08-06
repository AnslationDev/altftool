/**
 * Cloned Card Response Playbook — logic module.
 *
 * Implements the customer-liability framework in the Reserve Bank of India
 * circular "Customer Protection – Limiting Liability of Customers in Unauthorised
 * Electronic Banking Transactions" (DBR.No.Leg.BC.78/09.07.005/2017-18, dated
 * 6 July 2017), together with the working-day arithmetic that framework depends on.
 *
 * Everything here is pure: dates are supplied by the caller, nothing reads the clock.
 * Informational only, not legal advice — your bank's board-approved policy and the
 * facts of your case decide the final outcome.
 */

/* ---------------------------------------------------------------------------
 * Constants drawn from the circular
 * ------------------------------------------------------------------------- */

/**
 * Reporting within 3 working days of the bank's communication about the
 * transaction attracts zero customer liability in a third-party breach.
 */
export const ZERO_LIABILITY_WORKING_DAYS = 3;

/**
 * A delay of 4 to 7 working days caps liability per transaction at the lower of
 * the transaction value and the account-type limit in Table 2 of the circular.
 */
export const LIMITED_LIABILITY_WORKING_DAYS = 7;

/**
 * The bank must shadow-reverse the disputed amount within 10 working days of
 * notification, whether or not an FIR has been filed.
 */
export const SHADOW_REVERSAL_WORKING_DAYS = 10;

/** The complaint must be resolved and liability established within 90 days. */
export const RESOLUTION_CALENDAR_DAYS = 90;

/**
 * Under the Reserve Bank – Integrated Ombudsman Scheme, 2021 a complainant may
 * approach the Ombudsman after 30 days without a reply from the bank.
 */
export const OMBUDSMAN_WAIT_DAYS = 30;

/** Table 2 of the circular: maximum customer liability by account type, in rupees. */
export const ACCOUNT_TYPES = [
  { id: "bsbd", label: "Basic Savings Bank Deposit (BSBD) account", cap: 5000 },
  { id: "savings", label: "Any other savings account", cap: 10000 },
  { id: "ppi", label: "Prepaid payment instrument or gift card", cap: 10000 },
  { id: "msme-current", label: "Current, cash credit or overdraft account of an MSME", cap: 10000 },
  {
    id: "individual-current",
    label: "Current account of an individual, average annual balance up to 25 lakh",
    cap: 10000,
  },
  { id: "credit-card-small", label: "Credit card with a limit up to 5 lakh", cap: 10000 },
  { id: "other-current", label: "Any other current, cash credit or overdraft account", cap: 25000 },
  { id: "credit-card-large", label: "Credit card with a limit above 5 lakh", cap: 25000 },
];

/** How the loss arose — this decides which limb of the circular applies. */
export const CAUSES = [
  {
    id: "third-party",
    label: "Third-party breach — neither you nor the bank was at fault",
    detail:
      "Skimming, a cloned magnetic stripe, a compromised merchant, a data breach. The liability ladder based on how fast you reported applies.",
  },
  {
    id: "bank-deficiency",
    label: "The bank's own fraud, negligence or system deficiency",
    detail:
      "Zero customer liability, whether or not you reported the transaction, under the first limb of the circular.",
  },
  {
    id: "customer-negligence",
    label: "You shared a PIN, OTP, CVV or password",
    detail:
      "You bear the loss on transactions occurring up to the moment you report. Everything after you report is the bank's.",
  },
];

/** The first hour matters more than anything else in the playbook. */
export const IMMEDIATE_STEPS = [
  {
    id: "block",
    order: 1,
    window: "Within minutes",
    title: "Block the card",
    detail:
      "Use the bank's app or the number printed on the back of the card. Most banks also accept an SMS block keyword. Blocking stops further attempts while you deal with the ones that already went through.",
  },
  {
    id: "helpline",
    order: 2,
    window: "Within the first hour",
    title: "Call the cyber crime helpline 1930",
    detail:
      "The national helpline routes the details to the beneficiary bank so the receiving account can be put on hold. Speed here is what makes a recovery possible at all.",
  },
  {
    id: "notify-bank",
    order: 3,
    window: "Same day",
    title: "Notify the bank in writing, not only by phone",
    detail:
      "Email the branch and the bank's grievance address, and use the in-app dispute form. Ask for a complaint reference number in the reply. The written notification date is what the liability rules count from.",
  },
  {
    id: "portal",
    order: 4,
    window: "Same day",
    title: "File on cybercrime.gov.in",
    detail:
      "Record every transaction with its date, time, amount, merchant and reference number. Keep the acknowledgement — banks routinely ask for it during the dispute.",
  },
  {
    id: "statement",
    order: 5,
    window: "Day 1 to 2",
    title: "Pull a full statement and mark every unauthorised entry",
    detail:
      "Include small test transactions. Cloning often begins with a tiny debit to check the card is live before the large ones follow.",
  },
  {
    id: "chargeback",
    order: 6,
    window: "Day 1 to 3",
    title: "Raise a formal dispute or chargeback",
    detail:
      "For a card transaction this runs through the card network's dispute process. Ask the bank to confirm in writing that a chargeback has been raised and by which date it expects a resolution.",
  },
  {
    id: "replace",
    order: 7,
    window: "Week 1",
    title: "Replace the card and rotate anything reused",
    detail:
      "A new card number, a new PIN, and a change to any wallet, subscription or standing instruction the old number was saved in.",
  },
  {
    id: "escalate",
    order: 8,
    window: "After 30 days without a reply",
    title: "Escalate to the Banking Ombudsman",
    detail:
      "Complaints are filed free on cms.rbi.org.in under the Reserve Bank – Integrated Ombudsman Scheme, 2021, once the bank has had 30 days and has not resolved the matter.",
  },
];

/** Evidence that repeatedly decides these disputes. */
export const EVIDENCE_CHECKLIST = [
  "Screenshots of every debit alert, with the timestamp visible",
  "A statement covering the period, with the disputed entries marked",
  "The complaint reference number the bank gave you, and the date and time of the call",
  "The acknowledgement from cybercrime.gov.in and the 1930 call reference",
  "Proof you had the card in your possession — a transaction elsewhere at the same time, travel records, CCTV requests",
  "Every email to and from the bank, kept in one thread rather than scattered",
];

/* ---------------------------------------------------------------------------
 * Working-day arithmetic
 * ------------------------------------------------------------------------- */

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parse YYYY-MM-DD to a UTC timestamp, or NaN when it is not a real date. */
function parseIsoDate(value) {
  if (typeof value !== "string") return NaN;
  const match = ISO_DATE.exec(value.trim());
  if (!match) return NaN;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const stamp = Date.UTC(year, month - 1, day);
  const back = new Date(stamp);
  if (back.getUTCFullYear() !== year || back.getUTCMonth() !== month - 1 || back.getUTCDate() !== day) {
    return NaN;
  }
  return stamp;
}

function toIsoDate(stamp) {
  return new Date(stamp).toISOString().slice(0, 10);
}

/**
 * Sane bounds on the two date inputs. Without a bound, a wide gap (e.g. year
 * 1900 to year 9999) drives `countWorkingDays`/`addWorkingDays` through
 * millions of day-by-day iterations and can push a projected date past year
 * 9999, where `toISOString()` switches to an extended-year format whose first
 * 10 characters are not a valid calendar date. A century is far more than any
 * real dispute needs.
 */
export const MIN_ASSESSMENT_DATE = "2000-01-01";
export const MAX_ASSESSMENT_DATE = "2100-12-31";
const MIN_ASSESSMENT_STAMP = parseIsoDate(MIN_ASSESSMENT_DATE);
const MAX_ASSESSMENT_STAMP = parseIsoDate(MAX_ASSESSMENT_DATE);

/**
 * Indian bank branches are closed on Sundays and on the second and fourth
 * Saturday of every month. A Saturday falling on the 8th to 14th is the second
 * Saturday; the 22nd to 28th is the fourth.
 */
export function isBankHoliday(stamp) {
  const date = new Date(stamp);
  const weekday = date.getUTCDay();
  if (weekday === 0) return true;
  if (weekday === 6) {
    const dayOfMonth = date.getUTCDate();
    if (dayOfMonth >= 8 && dayOfMonth <= 14) return true;
    if (dayOfMonth >= 22 && dayOfMonth <= 28) return true;
  }
  return false;
}

/**
 * Count working days after `fromStamp` up to and including `toStamp`. The
 * circular excludes the date of receiving the communication from the count.
 */
export function countWorkingDays(fromStamp, toStamp) {
  if (toStamp <= fromStamp) return 0;
  let count = 0;
  for (let stamp = fromStamp + MS_PER_DAY; stamp <= toStamp; stamp += MS_PER_DAY) {
    if (!isBankHoliday(stamp)) count += 1;
  }
  return count;
}

/** Return the date that is `days` working days after `fromStamp`. */
export function addWorkingDays(fromStamp, days) {
  let remaining = days;
  let stamp = fromStamp;
  while (remaining > 0) {
    stamp += MS_PER_DAY;
    if (!isBankHoliday(stamp)) remaining -= 1;
  }
  return stamp;
}

/**
 * Same as `addWorkingDays`, but also treats the next `extraHolidays` otherwise
 * working days as non-working before it starts counting `days`. This keeps
 * every deadline consistent with the same additional branch holidays the
 * caller already subtracted from `delayWorkingDays` — otherwise a case that
 * gets a favourable liability band because of those extra holidays can show a
 * deadline that falls before the user's own notification date.
 */
export function addWorkingDaysWithExtraHolidays(fromStamp, days, extraHolidays) {
  let remainingWorkingDays = days;
  let remainingExtraHolidays = Math.max(0, extraHolidays);
  let stamp = fromStamp;
  while (remainingWorkingDays > 0) {
    stamp += MS_PER_DAY;
    if (isBankHoliday(stamp)) continue;
    if (remainingExtraHolidays > 0) {
      remainingExtraHolidays -= 1;
      continue;
    }
    remainingWorkingDays -= 1;
  }
  return stamp;
}

/* ---------------------------------------------------------------------------
 * The liability assessment
 * ------------------------------------------------------------------------- */

const round2 = (value) => Math.round(value * 100) / 100;

/**
 * Work out the customer's liability position and the bank's deadlines.
 *
 * @param {{ communicationDate: string, notificationDate: string, accountTypeId: string,
 *           transactionValueInr: number, causeId?: string, additionalHolidays?: number }} input
 *        dates as YYYY-MM-DD
 * @returns {object} assessment, or { error } for invalid input.
 */
export function assessLiability({
  communicationDate,
  notificationDate,
  accountTypeId,
  transactionValueInr,
  causeId = "third-party",
  additionalHolidays = 0,
} = {}) {
  const account = ACCOUNT_TYPES.find((item) => item.id === accountTypeId);
  if (!account) {
    return { error: "Choose the account or card type so the correct liability cap applies." };
  }
  const cause = CAUSES.find((item) => item.id === causeId);
  if (!cause) {
    return { error: "Choose how the loss arose so the right limb of the circular applies." };
  }

  const communication = parseIsoDate(communicationDate);
  const notification = parseIsoDate(notificationDate);
  const value = Number(transactionValueInr);
  const extraHolidays = Number(additionalHolidays);

  if (Number.isNaN(communication)) {
    return { error: "Enter the date the bank's alert reached you as a real calendar date." };
  }
  if (Number.isNaN(notification)) {
    return { error: "Enter the date you notified the bank as a real calendar date." };
  }
  if (communication < MIN_ASSESSMENT_STAMP || communication > MAX_ASSESSMENT_STAMP) {
    return {
      error: `Enter the bank's communication date between ${MIN_ASSESSMENT_DATE} and ${MAX_ASSESSMENT_DATE}.`,
    };
  }
  if (notification < MIN_ASSESSMENT_STAMP || notification > MAX_ASSESSMENT_STAMP) {
    return {
      error: `Enter the notification date between ${MIN_ASSESSMENT_DATE} and ${MAX_ASSESSMENT_DATE}.`,
    };
  }
  if (notification < communication) {
    return { error: "You cannot have notified the bank before its alert reached you." };
  }
  if (!Number.isFinite(value)) {
    return { error: "Enter the disputed amount as a number." };
  }
  if (value < 0) {
    return { error: "The disputed amount cannot be negative." };
  }
  if (!Number.isFinite(extraHolidays) || extraHolidays < 0 || !Number.isInteger(extraHolidays)) {
    return { error: "Extra bank holidays must be a whole number of days, zero or more." };
  }

  const rawWorkingDays = countWorkingDays(communication, notification);
  // This only matters for the third-party ladder below, which is the only
  // branch that uses delayWorkingDays to decide the band. Blocking
  // bank-deficiency/customer-negligence submissions on it rejects otherwise
  // valid input for a check whose outcome those causes never consult.
  if (cause.id === "third-party" && extraHolidays > rawWorkingDays) {
    return { error: "You have entered more holidays than there are working days in that gap." };
  }
  const delayWorkingDays = Math.max(0, rawWorkingDays - extraHolidays);

  let customerLiability;
  let bankLiability;
  let band;
  let basis;

  if (cause.id === "bank-deficiency") {
    band = "zero";
    customerLiability = 0;
    basis =
      "Where the loss is due to the bank's own fraud, negligence or a deficiency on its part, the customer bears nothing, whether or not the transaction was reported.";
  } else if (cause.id === "customer-negligence") {
    band = "negligence";
    customerLiability = round2(value);
    basis =
      "Where payment credentials were shared, the customer bears the loss on transactions occurring up to the moment of reporting. Anything debited after you reported is the bank's liability — but this tool only takes one disputed-amount figure, so treat what you entered as the pre-report loss and track any separate post-report debits (and the bank's liability for them) yourself.";
  } else if (delayWorkingDays <= ZERO_LIABILITY_WORKING_DAYS) {
    band = "zero";
    customerLiability = 0;
    basis = `Reported within ${ZERO_LIABILITY_WORKING_DAYS} working days of the bank's communication, so in a third-party breach the customer's liability is nil.`;
  } else if (delayWorkingDays <= LIMITED_LIABILITY_WORKING_DAYS) {
    band = "limited";
    customerLiability = round2(Math.min(value, account.cap));
    basis = `Reported ${delayWorkingDays} working days after the communication, which falls in the 4 to 7 working day window. Per-transaction liability is the lower of the transaction value and the ${account.cap} rupee cap for a ${account.label.toLowerCase()}.`;
  } else {
    band = "policy";
    customerLiability = null;
    basis = `Reported ${delayWorkingDays} working days after the communication, beyond the ${LIMITED_LIABILITY_WORKING_DAYS} working day window. Liability then follows the bank's own board-approved policy, which you are entitled to ask for in writing.`;
  }

  // The negligence band has no second input for post-report debits, so there
  // is nothing to compute the bank's share from — show it as unknown (null)
  // rather than a definite ₹0 that would contradict the basis text above.
  bankLiability =
    customerLiability === null || band === "negligence"
      ? null
      : round2(Math.max(0, value - customerLiability));

  const shadowReversalBy = toIsoDate(
    addWorkingDaysWithExtraHolidays(notification, SHADOW_REVERSAL_WORKING_DAYS, extraHolidays),
  );
  const resolutionBy = toIsoDate(notification + RESOLUTION_CALENDAR_DAYS * MS_PER_DAY);
  const ombudsmanFrom = toIsoDate(notification + OMBUDSMAN_WAIT_DAYS * MS_PER_DAY);

  return {
    accountType: account.label,
    liabilityCap: account.cap,
    cause: cause.label,
    causeId: cause.id,
    transactionValue: round2(value),
    workingDaysBeforeHolidays: rawWorkingDays,
    additionalHolidays: extraHolidays,
    delayWorkingDays,
    band,
    customerLiability,
    bankLiability,
    basis,
    zeroLiabilityDeadline: toIsoDate(
      addWorkingDaysWithExtraHolidays(communication, ZERO_LIABILITY_WORKING_DAYS, extraHolidays),
    ),
    limitedLiabilityDeadline: toIsoDate(
      addWorkingDaysWithExtraHolidays(communication, LIMITED_LIABILITY_WORKING_DAYS, extraHolidays),
    ),
    shadowReversalBy,
    resolutionBy,
    ombudsmanFrom,
  };
}
