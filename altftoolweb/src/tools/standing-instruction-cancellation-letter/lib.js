/**
 * Standing instruction / auto-debit cancellation letter builder and timing check.
 *
 * The numbers this tool produces are all working-day arithmetic on the dates you
 * type in. Nothing is estimated and nothing is fetched:
 *
 *  1. Working days strictly between the day you lodge the cancellation and the
 *     day of the next debit, under a chosen weekly-off pattern plus any bank
 *     holidays you paste in.
 *  2. The last working day on which you can still lodge and leave the required
 *     number of clear working days before the debit.
 *  3. If the debit has already gone through, the three deadlines from the RBI
 *     customer-liability circular, counted in working days.
 *
 * Rules and references used:
 *  - RBI, "Processing of e-mandate on cards for recurring transactions",
 *    DPSS.CO.PD.No.447/02.14.003/2019-20 dated 21 August 2019: the cardholder
 *    receives a pre-transaction notification at least 24 hours before a
 *    recurring charge, and must be given a facility to withdraw the e-mandate at
 *    any point, after which no further recurring transaction is permitted on it.
 *  - RBI, "Customer Protection – Limiting Liability of Customers in Unauthorised
 *    Electronic Banking Transactions", DBR.No.Leg.BC.78/09.07.005/2017-18 dated
 *    6 July 2017: zero liability where the customer notifies the bank within
 *    three working days of receiving the bank's communication about the
 *    transaction; limited, capped liability where the customer notifies between
 *    the fourth and the seventh working day; and the bank shall credit the
 *    amount involved within ten working days of being notified.
 *  - Bank weekly offs since September 2015 follow the RBI/IBA pattern: every
 *    Sunday plus the second and fourth Saturday of each month.
 *  - NACH mandates carry a 20-character UMRN (Unique Mandate Reference Number)
 *    and an 11-character IFSC of the form AAAA0999999.
 *
 * The per-channel notice periods are common industry practice, are editable, and
 * are labelled as such — they are not regulatory figures.
 *
 * Pure module: no React, no DOM, no network, no clock reads, no randomness.
 */

/* ------------------------------------------------------------------ dates */

const MS_PER_DAY = 86_400_000;

export function parseISODate(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date;
}

const toISO = (date) => date.toISOString().slice(0, 10);

export function addDaysISO(isoDate, days) {
  const date = parseISODate(isoDate);
  if (!date || !Number.isFinite(days)) return null;
  return toISO(new Date(date.getTime() + Math.round(days) * MS_PER_DAY));
}

export function daysBetweenISO(fromISO, toISODate) {
  const from = parseISODate(fromISO);
  const to = parseISODate(toISODate);
  if (!from || !to) return null;
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

export function formatLongDate(isoDate) {
  const date = parseISODate(isoDate);
  if (!date) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function weekdayName(isoDate) {
  const date = parseISODate(isoDate);
  if (!date) return "";
  return new Intl.DateTimeFormat("en-IN", { weekday: "long", timeZone: "UTC" }).format(date);
}

export function formatINR(amount) {
  if (!Number.isFinite(amount)) return "";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

/* ---------------------------------------------------------- working days */

export const WEEKLY_OFF_PATTERNS = [
  {
    id: "bank",
    label: "Indian bank week — every Sunday plus the 2nd and 4th Saturday",
    describe: "Sundays off; the 2nd and 4th Saturday of each month off; the 1st, 3rd and 5th Saturday are working days.",
  },
  {
    id: "sat-sun",
    label: "Five-day week — every Saturday and Sunday off",
    describe: "Both weekend days off, the pattern most corporate back offices run on.",
  },
  {
    id: "sun",
    label: "Six-day week — Sundays off only",
    describe: "Every Saturday is a working day.",
  },
];

/** Which occurrence of its weekday within the month a date is: 1st, 2nd, ... */
export function weekdayOccurrenceInMonth(isoDate) {
  const date = parseISODate(isoDate);
  if (!date) return null;
  return Math.floor((date.getUTCDate() - 1) / 7) + 1;
}

/** True when the date is a working day under the pattern and holiday list. */
export function isWorkingDay(isoDate, { weeklyOff = "bank", holidays } = {}) {
  const date = parseISODate(isoDate);
  if (!date) return false;
  if (holidays && holidays.has(isoDate)) return false;

  const dow = date.getUTCDay(); // 0 = Sunday, 6 = Saturday
  if (dow === 0) return false;
  if (dow === 6) {
    if (weeklyOff === "sun") return true;
    if (weeklyOff === "sat-sun") return false;
    const occurrence = weekdayOccurrenceInMonth(isoDate);
    return occurrence !== 2 && occurrence !== 4;
  }
  return true;
}

/** Parse a pasted holiday list: one ISO date per line or comma separated. */
export function parseHolidayList(text) {
  const raw = typeof text === "string" ? text : "";
  const tokens = raw
    .split(/[\s,;]+/)
    .map((token) => token.trim())
    .filter(Boolean);
  const dates = new Set();
  const invalid = [];
  for (const token of tokens) {
    if (parseISODate(token)) dates.add(token);
    else invalid.push(token);
  }
  return { dates, invalid, count: dates.size };
}

/** Guard so a typo cannot spin the loops. */
export const MAX_SPAN_DAYS = 1830; // five years

/**
 * Working days strictly between two dates — the day you lodge and the day of the
 * debit are both excluded, because neither is a clear day for the bank to act.
 */
export function countWorkingDaysBetween(fromISO, toISODate, options = {}) {
  const span = daysBetweenISO(fromISO, toISODate);
  if (span === null) return null;
  if (Math.abs(span) > MAX_SPAN_DAYS) return null;
  if (span <= 1) return 0;
  let count = 0;
  for (let offset = 1; offset < span; offset += 1) {
    if (isWorkingDay(addDaysISO(fromISO, offset), options)) count += 1;
  }
  return count;
}

/** The date n working days after `fromISO` (the start date itself never counts). */
export function addWorkingDays(fromISO, n, options = {}) {
  const target = Math.round(Number(n));
  if (!parseISODate(fromISO) || !Number.isFinite(target) || target < 0) return null;
  let seen = 0;
  let offset = 0;
  while (seen < target) {
    offset += 1;
    if (offset > MAX_SPAN_DAYS) return null;
    if (isWorkingDay(addDaysISO(fromISO, offset), options)) seen += 1;
  }
  return addDaysISO(fromISO, offset);
}

/**
 * The latest working day on which the cancellation can be lodged and still leave
 * `need` clear working days before `debitISO`. That is the (need + 1)-th working
 * day counting backwards from the debit date.
 */
export function lastSafeLodgementDate(debitISO, need, options = {}) {
  const target = Math.round(Number(need));
  if (!parseISODate(debitISO) || !Number.isFinite(target) || target < 0) return null;
  let seen = 0;
  let offset = 0;
  while (seen < target + 1) {
    offset += 1;
    if (offset > MAX_SPAN_DAYS) return null;
    if (isWorkingDay(addDaysISO(debitISO, -offset), options)) seen += 1;
  }
  return addDaysISO(debitISO, -offset);
}

/* ------------------------------------------------------- mandate channels */

export const MANDATE_CHANNELS = [
  {
    id: "nach",
    label: "NACH / ECS debit mandate on a bank account",
    shortLabel: "NACH / ECS debit mandate",
    refLabel: "UMRN (Unique Mandate Reference Number)",
    checkUmrn: true,
    defaultLeadDays: 5,
    lodgeWith: "your own bank branch and the company that presents the debit",
    note: "A NACH debit mandate is stopped by giving a written cancellation to your bank, and a matching notice to the company collecting the money. Five working days is the lead time banks most often ask for; it is practice, not a rule, so confirm the number your bank uses.",
    letterAsk:
      "cancel the NACH / ECS debit mandate described below and stop presenting any further debit against my account under it",
  },
  {
    id: "card-emandate",
    label: "Card e-mandate (recurring charge on a debit or credit card)",
    shortLabel: "card e-mandate",
    refLabel: "Merchant name and last four digits of the card",
    defaultLeadDays: 1,
    lodgeWith: "the card issuer, and the merchant as a courtesy",
    note: "Under the RBI e-mandate framework of 21 August 2019 you may withdraw a card e-mandate at any point, and no further recurring transaction may be permitted on it once you do. You also get a pre-transaction notification at least 24 hours before each charge — that notification is your last chance to opt out of that particular debit.",
    letterAsk:
      "withdraw the e-mandate registered on my card for the merchant named below, so that no further recurring transaction is permitted on it",
  },
  {
    id: "upi-autopay",
    label: "UPI AutoPay mandate",
    shortLabel: "UPI AutoPay mandate",
    refLabel: "Mandate / UMN reference shown in your UPI app",
    defaultLeadDays: 1,
    lodgeWith: "the UPI app itself; this letter is the written backup",
    note: "A UPI AutoPay mandate is revoked inside the UPI app, under the mandates or autopay section, and the revocation applies to debits after that point. A pre-debit notification reaches you 24 hours before each collection. Send this letter only if the app revocation fails or you need a paper trail.",
    letterAsk:
      "revoke the UPI AutoPay mandate described below and decline any further collection request presented against it",
  },
  {
    id: "sip",
    label: "Mutual fund SIP (NACH mandate registered with an AMC)",
    shortLabel: "SIP debit mandate",
    refLabel: "Folio number and SIP registration number",
    defaultLeadDays: 10,
    lodgeWith: "the AMC or its registrar, and your bank",
    note: "AMCs and registrars ask for a SIP stop request a set number of working days before the next instalment — the figure printed in scheme documents is usually somewhere between ten and thirty days. Take the number from your own scheme information document; it is not a regulatory figure.",
    letterAsk:
      "discontinue the systematic investment plan described below and stop presenting the associated debit mandate",
  },
  {
    id: "insurance",
    label: "Insurance premium auto-debit",
    shortLabel: "insurance premium auto-debit",
    refLabel: "Policy number",
    defaultLeadDays: 5,
    lodgeWith: "the insurer and your bank",
    note: "Stopping the auto-debit does not cancel the policy — it only stops the collection. If you intend the policy to lapse or to be surrendered, say so separately in writing, because an unpaid premium has consequences for the cover.",
    letterAsk:
      "stop the auto-debit of premium against the policy described below",
  },
  {
    id: "subscription",
    label: "Subscription, OTT or gym auto-debit",
    shortLabel: "subscription auto-debit",
    refLabel: "Subscription or membership ID",
    defaultLeadDays: 3,
    lodgeWith: "the merchant, and your bank or card issuer",
    note: "Cancel inside the merchant's own account settings as well as in writing. Cancelling the payment alone can leave the contract running and the dues accruing against you.",
    letterAsk:
      "cancel the recurring payment authority for the subscription described below and stop any further debit against it",
  },
];

export function channelById(id) {
  return MANDATE_CHANNELS.find((item) => item.id === id) || MANDATE_CHANNELS[0];
}

/* --------------------------------------------------------- field checking */

/** NACH UMRN: 20 characters, letters and digits only. Length and charset only. */
export function validateUMRN(value) {
  const text = typeof value === "string" ? value.trim().toUpperCase() : "";
  if (!text) return { state: "empty", message: "Not entered — the bank will ask for it." };
  if (!/^[A-Z0-9]+$/.test(text)) {
    return { state: "invalid", message: "A UMRN is letters and digits only — remove spaces and punctuation." };
  }
  if (text.length !== 20) {
    return {
      state: "invalid",
      message: `A UMRN is 20 characters; this one is ${text.length}. Copy it from the mandate form or your bank statement.`,
    };
  }
  return { state: "ok", message: "20 characters, letters and digits — the right shape for a UMRN. This is a format check, not a check against NPCI records." };
}

/** IFSC: four letters, then 0, then six letters or digits. */
export function validateIFSC(value) {
  const text = typeof value === "string" ? value.trim().toUpperCase() : "";
  if (!text) return { state: "empty", message: "Not entered." };
  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(text)) {
    return {
      state: "invalid",
      message: "An IFSC is 11 characters: four letters, then the digit 0, then six letters or digits — for example HDFC0001234.",
    };
  }
  return { state: "ok", message: `Valid IFSC shape; ${text.slice(0, 4)} is the bank code and ${text.slice(5)} the branch code.` };
}

export function parseAmount(value) {
  if (value === "" || value === null || value === undefined) return { state: "empty", amount: null };
  const text = String(value).replace(/[,\s₹]/g, "");
  const amount = Number(text);
  if (!Number.isFinite(amount) || amount < 0) {
    return { state: "invalid", amount: null, message: "Enter the debit amount as a plain number, for example 5000." };
  }
  return { state: "ok", amount };
}

/* -------------------------------------------------------------- assessment */

/** RBI customer-liability circular, 6 July 2017. */
export const ZERO_LIABILITY_WORKING_DAYS = 3;
export const LIMITED_LIABILITY_WORKING_DAYS = 7;
export const BANK_CREDIT_WORKING_DAYS = 10;

/**
 * Work out whether the cancellation is being lodged early enough, and what the
 * position is if the debit has already gone through.
 */
export function assessCancellation({
  lodgementISO,
  nextDebitISO,
  requiredWorkingDays,
  weeklyOff = "bank",
  holidayText = "",
}) {
  if (!parseISODate(lodgementISO)) return { error: "Enter a valid date on which you are lodging the cancellation." };
  if (!parseISODate(nextDebitISO)) return { error: "Enter a valid date for the next scheduled debit." };

  const span = daysBetweenISO(lodgementISO, nextDebitISO);
  if (Math.abs(span) > MAX_SPAN_DAYS) {
    return { error: "The two dates are more than five years apart — check them." };
  }

  const need = Math.round(Number(requiredWorkingDays));
  if (!Number.isFinite(need) || need < 0 || need > 90) {
    return { error: "The notice period must be between 0 and 90 working days." };
  }

  const holidayParse = parseHolidayList(holidayText);
  if (holidayParse.invalid.length) {
    return {
      error: `These holiday entries are not YYYY-MM-DD dates: ${holidayParse.invalid.slice(0, 4).join(", ")}${holidayParse.invalid.length > 4 ? ", …" : ""}`,
    };
  }
  const options = { weeklyOff, holidays: holidayParse.dates };

  const lodgementIsWorkingDay = isWorkingDay(lodgementISO, options);
  const debitIsWorkingDay = isWorkingDay(nextDebitISO, options);

  const base = {
    holidayCount: holidayParse.count,
    lodgementIsWorkingDay,
    debitIsWorkingDay,
    lodgementWeekday: weekdayName(lodgementISO),
    debitWeekday: weekdayName(nextDebitISO),
    requiredWorkingDays: need,
    calendarDays: span,
    weeklyOff,
  };

  if (span <= 0) {
    // The debit is today or already behind us: this is a dispute, not a notice.
    const zeroLiabilityByISO = addWorkingDays(nextDebitISO, ZERO_LIABILITY_WORKING_DAYS, options);
    const limitedLiabilityByISO = addWorkingDays(nextDebitISO, LIMITED_LIABILITY_WORKING_DAYS, options);
    const workingDaysSinceDebit = countWorkingDaysBetween(nextDebitISO, addDaysISO(lodgementISO, 1), options);
    return {
      ...base,
      mode: "after-debit",
      inTime: false,
      workingDaysAvailable: 0,
      shortfall: need,
      lastSafeLodgementISO: lastSafeLodgementDate(nextDebitISO, need, options),
      workingDaysSinceDebit,
      zeroLiabilityByISO,
      limitedLiabilityByISO,
      withinZeroLiabilityWindow: workingDaysSinceDebit <= ZERO_LIABILITY_WORKING_DAYS,
      withinLimitedLiabilityWindow: workingDaysSinceDebit <= LIMITED_LIABILITY_WORKING_DAYS,
      bankCreditDueISO: addWorkingDays(lodgementISO, BANK_CREDIT_WORKING_DAYS, options),
    };
  }

  const workingDaysAvailable = countWorkingDaysBetween(lodgementISO, nextDebitISO, options);
  const lastSafeLodgementISO = lastSafeLodgementDate(nextDebitISO, need, options);
  const shortfall = Math.max(0, need - workingDaysAvailable);

  return {
    ...base,
    mode: "before-debit",
    workingDaysAvailable,
    shortfall,
    inTime: shortfall === 0,
    lastSafeLodgementISO,
    daysLateBy: lastSafeLodgementISO ? Math.max(0, daysBetweenISO(lastSafeLodgementISO, lodgementISO)) : null,
    bankCreditDueISO: addWorkingDays(lodgementISO, BANK_CREDIT_WORKING_DAYS, options),
  };
}

export function plural(count, word) {
  const n = Math.abs(Math.round(Number(count) || 0));
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

/** One line of plain English for the headline verdict. */
export function verdictText(assessment, channel) {
  if (!assessment || assessment.error) return "";
  if (assessment.mode === "after-debit") {
    return assessment.withinZeroLiabilityWindow
      ? `The debit has already gone through. You are still inside the three-working-day window in the RBI customer-liability circular — lodge this today and keep the acknowledgement.`
      : assessment.withinLimitedLiabilityWindow
        ? `The debit has already gone through and you are past the third working day. Report it now: between the fourth and the seventh working day the circular caps your liability rather than removing it.`
        : `The debit has already gone through and more than seven working days have passed. Lodge the cancellation and the dispute anyway — beyond the seventh working day the outcome follows the bank's own board-approved policy.`;
  }
  const short = channel?.shortLabel || "this instruction";
  if (assessment.inTime) {
    return `${plural(assessment.workingDaysAvailable, "clear working day")} before the debit, against the ${plural(assessment.requiredWorkingDays, "working day")} a ${short} usually needs. Lodge it today and get an acknowledgement.`;
  }
  return `Only ${plural(assessment.workingDaysAvailable, "clear working day")} before the debit — ${plural(assessment.shortfall, "working day")} short of the ${assessment.requiredWorkingDays} normally asked for. Expect this debit to still go through: send the notice anyway, tell the biller in writing on the same day, and keep the acknowledgement.`;
}

/* -------------------------------------------------------------- documents */

const clean = (value) => (typeof value === "string" ? value.trim() : "");
const or = (value, fallback) => clean(value) || fallback;

export const FREQUENCIES = [
  { id: "monthly", label: "Monthly" },
  { id: "quarterly", label: "Quarterly" },
  { id: "half-yearly", label: "Half-yearly" },
  { id: "yearly", label: "Yearly" },
  { id: "as-presented", label: "As and when presented" },
];

export function frequencyLabel(id) {
  const found = FREQUENCIES.find((item) => item.id === id);
  return found ? found.label.toLowerCase() : "recurring";
}

/**
 * Build the bank letter and the matching notice to the biller. Every date and
 * count in the text comes from `assessment`; nothing is recomputed here.
 */
export function buildCancellationDocuments({
  channelId,
  customerName,
  accountNumber,
  ifsc,
  bankName,
  branchName,
  branchAddress,
  billerName,
  billerAddress,
  mandateReference,
  amountInput,
  frequency,
  reason,
  lodgementISO,
  nextDebitISO,
  phone,
  email,
  assessment,
}) {
  if (!assessment || assessment.error) {
    return { error: assessment?.error || "Fix the dates before drafting the letter." };
  }

  const amount = parseAmount(amountInput);
  if (amount.state === "invalid") return { error: amount.message };

  const channel = channelById(channelId);
  const name = or(customerName, "[Your full name]");
  const account = or(accountNumber, "[Your account number]");
  const bank = or(bankName, "[Bank name]");
  const branch = clean(branchName);
  const biller = or(billerName, "[Name of the company collecting the money]");
  const reference = or(mandateReference, `[${channel.refLabel}]`);
  const amountText = amount.amount === null ? "[amount]" : formatINR(amount.amount);
  const freq = frequencyLabel(frequency);

  const mandateBlock = [
    `Mandate / instruction type: ${channel.label}`,
    `${channel.refLabel}: ${reference}`,
    `Beneficiary / biller: ${biller}`,
    `Amount per debit: ${amountText}`,
    `Frequency: ${freq}`,
    assessment.mode === "after-debit"
      ? `Debit already presented on: ${formatLongDate(nextDebitISO)} (${assessment.debitWeekday})`
      : `Next scheduled debit: ${formatLongDate(nextDebitISO)} (${assessment.debitWeekday})`,
    `Debited from: account ${account}${clean(ifsc) ? `, IFSC ${clean(ifsc).toUpperCase()}` : ""}`,
  ];

  const signature = [
    name,
    `Account number: ${account}`,
    clean(ifsc) ? `IFSC: ${clean(ifsc).toUpperCase()}` : "",
    clean(phone) ? `Phone: ${clean(phone)}` : "Phone: [your phone number]",
    clean(email) ? `Email: ${clean(email)}` : "Email: [your email address]",
  ].filter(Boolean);

  const shortSignature = [
    name,
    clean(phone) ? `Phone: ${clean(phone)}` : "Phone: [your phone number]",
    clean(email) ? `Email: ${clean(email)}` : "Email: [your email address]",
  ].filter(Boolean);

  const timingLines = [];
  if (assessment.mode === "before-debit") {
    timingLines.push(
      `This cancellation is being lodged on ${formatLongDate(lodgementISO)}, which leaves ${assessment.workingDaysAvailable} clear working day${assessment.workingDaysAvailable === 1 ? "" : "s"} before the next scheduled debit on ${formatLongDate(nextDebitISO)}.`,
    );
    if (!assessment.inTime) {
      timingLines.push(
        `I am aware that this is ${assessment.shortfall} working day${assessment.shortfall === 1 ? "" : "s"} short of the ${assessment.requiredWorkingDays} working days normally required, and I request that the instruction be stopped before the next presentation if it is operationally possible. If the debit is presented notwithstanding this request, please treat this letter as my written objection to it.`,
      );
    }
  } else {
    timingLines.push(
      `A debit of ${amountText} was presented against my account on ${formatLongDate(nextDebitISO)}. I am lodging this cancellation on ${formatLongDate(lodgementISO)}, which is working day ${assessment.workingDaysSinceDebit} after that transaction.`,
    );
    if (assessment.withinZeroLiabilityWindow) {
      timingLines.push(
        `This notification is within three working days of the transaction. I request that it be treated in terms of the RBI circular on limiting the liability of customers in unauthorised electronic banking transactions dated 6 July 2017, and that the amount be credited to my account within ten working days of this notification as that circular requires.`,
      );
    } else {
      timingLines.push(
        `I request that this notification be dealt with in terms of the RBI circular on limiting the liability of customers in unauthorised electronic banking transactions dated 6 July 2017, and that you tell me in writing what your board-approved policy provides for a report made at this stage.`,
      );
    }
  }

  if (channel.id === "card-emandate") {
    timingLines.push(
      "Under the Reserve Bank of India's framework for processing e-mandates on cards for recurring transactions dated 21 August 2019, a cardholder may withdraw an e-mandate at any point, and no further recurring transaction may be permitted on it thereafter. Please record this withdrawal accordingly.",
    );
  }

  const subject = `Cancellation of ${channel.shortLabel} — ${channel.refLabel}: ${reference} — account ${account}`;

  const bankLetter = [
    formatLongDate(lodgementISO),
    "",
    "To,",
    "The Branch Manager,",
    `${bank}${branch ? `, ${branch}` : ""}`,
    clean(branchAddress),
    "",
    `Subject: ${subject}`,
    "",
    "Dear Sir / Madam,",
    "",
    `I am ${name}, holder of account number ${account} with your branch. I request you to ${channel.letterAsk}.`,
    "",
    "Details of the instruction to be cancelled:",
    ...mandateBlock.map((line, index) => `${index + 1}. ${line}`),
    "",
    ...timingLines,
    "",
    clean(reason) ? `Reason for the cancellation: ${clean(reason)}` : "",
    "",
    `I am sending a copy of this letter to ${biller} on the same date so that the instruction is withdrawn at both ends.`,
    "",
    "Please acknowledge receipt of this letter with a date and a reference number, and confirm in writing once the mandate has been cancelled in your records. Please also tell me if any additional form has to be signed at the branch.",
    "",
    "Thank you.",
    "",
    "Yours faithfully,",
    "",
    ...signature,
  ];

  const billerNotice = [
    formatLongDate(lodgementISO),
    "",
    "To,",
    biller,
    clean(billerAddress),
    "",
    `Subject: Withdrawal of auto-debit authority — ${channel.refLabel}: ${reference}`,
    "",
    "Dear Sir / Madam,",
    "",
    `I am ${name}. I have today withdrawn the standing instruction under which you collect ${amountText} ${freq} from my account ${account} with ${bank}, reference ${reference}.`,
    "",
    `Please stop presenting any further debit against that mandate with effect from today. The next debit you were due to present was on ${formatLongDate(nextDebitISO)}.`,
    assessment.mode === "before-debit" && !assessment.inTime
      ? `I am aware that this notice reaches you close to that date. If a presentation has already gone out, please recall it or refund the amount.`
      : "",
    assessment.mode === "after-debit"
      ? `The debit of ${amountText} presented on ${formatLongDate(nextDebitISO)} was after I had decided to withdraw the authority; please refund it.`
      : "",
    "",
    clean(reason) ? `Reason: ${clean(reason)}` : "",
    "",
    "This letter withdraws the payment authority only. If any amount is genuinely due to you under our agreement, tell me the figure and I will settle it separately rather than by auto-debit.",
    "",
    "Please confirm in writing that the mandate has been cancelled at your end.",
    "",
    "Yours faithfully,",
    "",
    ...shortSignature,
  ];

  const join = (lines) =>
    lines
      .filter((line) => line !== null && line !== undefined)
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

  const bankText = join(bankLetter);
  const billerText = join(billerNotice);

  return {
    channel,
    subject,
    bankLetter: bankText,
    billerNotice: billerText,
    bankWordCount: bankText.split(/\s+/).filter(Boolean).length,
    billerWordCount: billerText.split(/\s+/).filter(Boolean).length,
    amountText,
  };
}
