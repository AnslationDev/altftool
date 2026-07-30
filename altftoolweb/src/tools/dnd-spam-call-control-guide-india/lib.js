/**
 * DND and Spam Call Control Guide (India) — logic module.
 *
 * Pure logic for three things:
 *  1. Building the exact preference command to send to 1909 from the seven
 *     commercial communication categories in the TRAI regulations.
 *  2. Classifying the number a nuisance call or SMS came from, using the
 *     numbering series TRAI has designated for commercial traffic.
 *  3. Checking whether a complaint about an unsolicited communication is still
 *     inside the three-day window the regulations allow.
 *
 * The framework is the Telecom Commercial Communications Customer Preference
 * Regulations, 2018 (TCCCPR 2018) made by TRAI. Informational only — your access
 * provider's app is the authoritative place to set and confirm a preference.
 */

/* ---------------------------------------------------------------------------
 * Regulatory constants
 * ------------------------------------------------------------------------- */

/** The single short code for registering preferences and complaints, by SMS or call. */
export const PREFERENCE_SHORT_CODE = "1909";

/**
 * A complaint about an unsolicited commercial communication must be registered
 * within three days of receiving it. Source: TCCCPR 2018.
 */
export const COMPLAINT_WINDOW_DAYS = 3;

/**
 * An access provider must give effect to a registered or changed preference
 * within seven days. Source: TCCCPR 2018.
 */
export const PREFERENCE_ACTIVATION_DAYS = 7;

/** The seven preference categories, plus the fully blocked option numbered zero. */
export const PREFERENCE_CATEGORIES = [
  { code: 1, label: "Banking, insurance, financial products and credit cards" },
  { code: 2, label: "Real estate" },
  { code: 3, label: "Education" },
  { code: 4, label: "Health" },
  { code: 5, label: "Consumer goods and automobiles" },
  { code: 6, label: "Communication, broadcasting, entertainment and IT" },
  { code: 7, label: "Tourism and leisure" },
];

export const FULLY_BLOCKED_CODE = 0;

/** How preferences can be set. All of these are free. */
export const REGISTRATION_ROUTES = [
  {
    id: "sms",
    name: `SMS to ${PREFERENCE_SHORT_CODE}`,
    detail:
      "Send the command this page builds. You receive a confirmation SMS with a registration number — keep it, because a complaint later references it.",
  },
  {
    id: "call",
    name: `Call ${PREFERENCE_SHORT_CODE}`,
    detail: "An interactive menu walks through the same categories if you prefer voice.",
  },
  {
    id: "app",
    name: "Your operator's app, or the TRAI DND app",
    detail:
      "Shows your current preference, lets you change categories, and accepts complaints with the offending message attached.",
  },
  {
    id: "chakshu",
    name: "Chakshu on Sanchar Saathi",
    detail:
      "Separate from DND. Use it when the message is not merely marketing but a suspected fraud — a fake KYC alert, a job offer, a lottery win.",
  },
];

/** What DND does and does not cover, stated plainly. */
export const SCOPE_NOTES = [
  "DND stops registered telemarketers. Traffic from unregistered senders using ordinary mobile numbers is illegal regardless of your preference, and is dealt with by complaining, not by the preference itself.",
  "Service and transactional messages you have a relationship with — one-time passwords, delivery updates, statement alerts — are not blocked by any preference.",
  "Consent you gave a business through its own app or a signup form can override a category preference until you revoke it.",
  "A preference takes up to seven days to take effect, so judge the result after a week, not the next morning.",
];

/* ---------------------------------------------------------------------------
 * Number series
 * ------------------------------------------------------------------------- */

/**
 * TRAI has designated the 140 series for promotional voice calls made by
 * registered telemarketers, and the 1600 series for service and transactional
 * calls made by registered entities such as banks. Ordinary ten-digit mobile
 * numbers in India begin with 6, 7, 8 or 9.
 */
export const NUMBER_SERIES = {
  promotional: "140",
  transactional: "1600",
};

/* ---------------------------------------------------------------------------
 * Pure functions
 * ------------------------------------------------------------------------- */

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

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

const round2 = (value) => Math.round(value * 100) / 100;

/**
 * Build the command to send to 1909 for a chosen preference.
 *
 * @param {{ mode: "block-all"|"block-selected"|"unblock-all", categoryCodes?: number[] }} input
 * @returns {object} command and coverage, or { error } for invalid input.
 */
export function buildPreferenceCommand({ mode, categoryCodes } = {}) {
  const total = PREFERENCE_CATEGORIES.length;

  if (mode === "block-all") {
    return {
      command: `START ${FULLY_BLOCKED_CODE}`,
      mode,
      blockedCodes: PREFERENCE_CATEGORIES.map((item) => item.code),
      blockedLabels: PREFERENCE_CATEGORIES.map((item) => item.label),
      allowedLabels: [],
      blockedCount: total,
      coveragePct: 100,
      explanation:
        "Fully blocked: no promotional communication from any registered telemarketer in any category.",
    };
  }

  if (mode === "unblock-all") {
    return {
      command: `STOP ${FULLY_BLOCKED_CODE}`,
      mode,
      blockedCodes: [],
      blockedLabels: [],
      allowedLabels: PREFERENCE_CATEGORIES.map((item) => item.label),
      blockedCount: 0,
      coveragePct: 0,
      explanation:
        "Removes your preference entirely. Registered telemarketers may then send promotional communication in every category.",
    };
  }

  if (mode !== "block-selected") {
    return { error: "Choose whether to block everything, block selected categories, or remove the preference." };
  }

  if (!Array.isArray(categoryCodes)) {
    return { error: "Select at least one category to block." };
  }

  const valid = PREFERENCE_CATEGORIES.map((item) => item.code);
  const codes = [];
  for (const raw of categoryCodes) {
    const code = Number(raw);
    if (!Number.isInteger(code) || !valid.includes(code)) {
      return { error: `Category ${String(raw)} is not one of the seven preference categories.` };
    }
    if (!codes.includes(code)) codes.push(code);
  }

  if (codes.length === 0) {
    return { error: "Select at least one category to block." };
  }

  codes.sort((a, b) => a - b);
  const blocked = PREFERENCE_CATEGORIES.filter((item) => codes.includes(item.code));
  const allowed = PREFERENCE_CATEGORIES.filter((item) => !codes.includes(item.code));

  return {
    command: `START ${codes.join(",")}`,
    mode,
    blockedCodes: codes,
    blockedLabels: blocked.map((item) => item.label),
    allowedLabels: allowed.map((item) => item.label),
    blockedCount: codes.length,
    coveragePct: round2((codes.length / total) * 100),
    explanation:
      codes.length === total
        ? "Every category selected, which has the same effect as the fully blocked option."
        : `Promotional communication is still permitted in ${allowed.length} categor${allowed.length === 1 ? "y" : "ies"}.`,
  };
}

/**
 * Classify the number a nuisance call or message came from.
 *
 * @param {string} raw
 * @returns {object} classification, or { error } for unusable input.
 */
export function classifyCallerNumber(raw) {
  if (typeof raw !== "string") {
    return { error: "Enter the number the call or message came from." };
  }
  let digits = raw.replace(/[^\d]/g, "");
  if (digits === "") {
    return { error: "Enter the number the call or message came from." };
  }
  if (digits.startsWith("91") && digits.length > 10) digits = digits.slice(2);
  digits = digits.replace(/^0+/, "");
  if (digits === "") {
    return { error: "That is not a usable telephone number." };
  }
  if (digits.length > 12) {
    return {
      normalised: digits,
      category: "unknown",
      title: "Not a recognisable Indian number",
      detail: "Too many digits for an Indian subscriber or short-code number.",
      action: "Treat unknown international-looking numbers with caution and do not call back.",
    };
  }

  if (digits.startsWith(NUMBER_SERIES.transactional)) {
    return {
      normalised: digits,
      category: "transactional",
      title: `Service call on the ${NUMBER_SERIES.transactional} series`,
      detail:
        "This series is designated for service and transactional voice calls from registered entities such as banks and insurers, not for marketing.",
      action:
        "A marketing pitch on this series is a misuse of it. Report it through your operator's app so the entity is traceable.",
    };
  }

  if (digits.startsWith(NUMBER_SERIES.promotional)) {
    return {
      normalised: digits,
      category: "promotional",
      title: `Registered telemarketer on the ${NUMBER_SERIES.promotional} series`,
      detail:
        "Promotional voice calls from registered telemarketers are made from this series, which is exactly what a DND preference is designed to stop.",
      action:
        "If you have a preference registered and still received this, complain within three days quoting the number, date and time.",
    };
  }

  if (/^[6-9]\d{9}$/.test(digits)) {
    return {
      normalised: digits,
      category: "mobile",
      title: "Ordinary ten-digit mobile number",
      detail:
        "Marketing from a personal mobile number means the sender is an unregistered telemarketer. That is a breach regardless of any preference you have set.",
      action:
        "Complain within three days. Repeated complaints against a number can lead to that connection being disconnected.",
    };
  }

  if (digits.length <= 6 && digits.startsWith("1")) {
    return {
      normalised: digits,
      category: "shortcode",
      title: "Short code",
      detail: `Short codes are used for helplines and services — ${PREFERENCE_SHORT_CODE} for preferences, 1930 for cyber crime.`,
      action: "Verify the code on an official site before acting on anything it asks of you.",
    };
  }

  return {
    normalised: digits,
    category: "other",
    title: "Landline or unrecognised series",
    detail:
      "Not a mobile number and not one of the series designated for commercial traffic. Marketing calls from a landline are still covered by the regulations.",
    action: "Complain within three days with the number, date and time.",
  };
}

/**
 * Check whether a complaint about an unsolicited communication is still in time.
 *
 * @param {{ receivedDate: string, todayDate: string }} input dates as YYYY-MM-DD
 * @returns {object} result, or { error } for invalid input.
 */
export function checkComplaintWindow({ receivedDate, todayDate } = {}) {
  const received = parseIsoDate(receivedDate);
  const today = parseIsoDate(todayDate);

  if (Number.isNaN(received)) {
    return { error: "Enter the date the message or call arrived as a real calendar date." };
  }
  if (Number.isNaN(today)) {
    return { error: "Enter today's date as a real calendar date." };
  }
  if (today < received) {
    return { error: "Today cannot fall before the date the message arrived." };
  }

  const daysElapsed = Math.round((today - received) / MS_PER_DAY);
  const deadline = received + COMPLAINT_WINDOW_DAYS * MS_PER_DAY;
  const withinWindow = daysElapsed <= COMPLAINT_WINDOW_DAYS;
  const daysLeft = Math.max(0, COMPLAINT_WINDOW_DAYS - daysElapsed);

  return {
    daysElapsed,
    daysLeft,
    windowDays: COMPLAINT_WINDOW_DAYS,
    deadline: toIsoDate(deadline),
    withinWindow,
    verdict: withinWindow
      ? daysLeft === 0
        ? `Still in time, but today is the last day of the ${COMPLAINT_WINDOW_DAYS}-day window. File the complaint before the day ends.`
        : `Still in time. ${daysLeft} day${daysLeft === 1 ? "" : "s"} left of the ${COMPLAINT_WINDOW_DAYS}-day window that closes on ${toIsoDate(deadline)}.`
      : `The ${COMPLAINT_WINDOW_DAYS}-day window closed on ${toIsoDate(deadline)}, ${daysElapsed - COMPLAINT_WINDOW_DAYS} day${daysElapsed - COMPLAINT_WINDOW_DAYS === 1 ? "" : "s"} ago. Report the next one straight away, and keep the older message as supporting evidence.`,
  };
}
