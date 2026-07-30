/**
 * Electricity Meter Update Scam Explainer — logic module.
 *
 * Pure logic for three things:
 *  1. Scoring a "your connection will be cut tonight" message against a weighted
 *     red-flag checklist.
 *  2. Testing a claimed disconnection deadline against the statutory notice
 *     period in the Electricity Act, 2003 — the rule the message ignores.
 *  3. Explaining what a UPI collect request actually does, since "pay 10 rupees
 *     to update the meter" is a debit authorisation, not a token payment.
 *
 * Informational only, not legal advice.
 */

/* ---------------------------------------------------------------------------
 * The statutory rule the scam ignores
 * ------------------------------------------------------------------------- */

/**
 * Section 56(1) of the Electricity Act, 2003 allows a licensee to cut off supply
 * for non-payment only after giving "not less than fifteen clear days' notice in
 * writing". Clear days exclude both the day the notice is served and the day of
 * the proposed action.
 */
export const STATUTORY_CLEAR_DAYS_NOTICE = 15;

/**
 * Section 56(2) bars recovery of any sum due more than two years after it first
 * became due, unless it has been shown continuously as recoverable arrears.
 */
export const ARREARS_RECOVERY_LIMIT_YEARS = 2;

/** Milliseconds in a calendar day, used for whole-day differences in UTC. */
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const LEGITIMATE_PAYMENT_ROUTES = [
  "Your distribution company's own app or website, reached by typing the address yourself",
  "An authorised collection or customer care centre, against a printed receipt",
  "Bharat Bill Payment System through your bank app, where the biller is listed by name",
  "The number printed on your paper bill — never a number sent in an SMS",
];

/**
 * A UPI PIN authorises money leaving your account. It is never needed to receive
 * money. A "collect request" asks you to approve a debit, which is why the scam
 * frames it as a refund, a token payment or a verification of one rupee.
 */
export const UPI_TRUTHS = [
  {
    id: "receive",
    situation: "Someone is sending you money",
    pinNeeded: false,
    detail: "Credits land without any action from you. No PIN, no approval, no app screen to confirm.",
  },
  {
    id: "collect",
    situation: "You approve a collect request",
    pinNeeded: true,
    detail: "A collect request is a demand for payment. Approving it and entering your PIN sends money out.",
  },
  {
    id: "token",
    situation: "You are asked to pay a small 'verification' amount",
    pinNeeded: true,
    detail:
      "The small amount is the bait for the PIN entry and the session that follows. It also confirms your UPI ID is live.",
  },
  {
    id: "refund",
    situation: "You are told a PIN entry will process a refund",
    pinNeeded: true,
    detail: "There is no refund flow that needs your PIN. Every PIN entry is a debit from your account.",
  },
];

/* ---------------------------------------------------------------------------
 * Anatomy of the script
 * ------------------------------------------------------------------------- */

export const ANATOMY = [
  {
    step: 1,
    title: "The evening SMS",
    detail:
      "A text arrives, usually in the evening, saying your electricity will be disconnected tonight at around 9:30 because last month's bill was not updated, and asking you to contact an electricity officer on a 10-digit mobile number.",
    tell: "Distribution companies send bills and reminders from registered sender headers and give weeks of notice, not hours.",
  },
  {
    step: 2,
    title: "The helpful officer",
    detail:
      "The number answers as a lineman, junior engineer or billing officer. They are patient, apologetic, and blame a software update at the department's end.",
    tell: "A real complaint number is on your bill and your account is looked up by consumer number, not by whatever you say it is.",
  },
  {
    step: 3,
    title: "The app",
    detail:
      "To 'update the meter reading' or 'complete the KYC', you are told to install an app — often a remote-support tool such as a QuickSupport or desk-sharing app — and to read out the nine-digit code it displays.",
    tell: "That code is a remote-control invitation. From that point they see your screen and can operate your phone.",
  },
  {
    step: 4,
    title: "The token payment",
    detail:
      "You are asked to send a tiny amount, often one or ten rupees, to 'verify the account is active', usually through a collect request that arrives in your UPI app.",
    tell: "The amount is irrelevant; the point is the PIN entry, which happens on a screen they can now see.",
  },
  {
    step: 5,
    title: "The drain",
    detail:
      "With screen visibility and PIN capture, transactions are pushed through in quick succession, often just under the limits that would trigger a bank call.",
    tell: "Several debits within minutes, sometimes across UPI and net banking at once.",
  },
  {
    step: 6,
    title: "The reassurance",
    detail:
      "You may be told the debits are a temporary hold that reverses in 24 hours, or that a reversal needs one more approval. This buys the time in which the money is moved onward.",
    tell: "Nothing about a genuine electricity payment produces a debit that needs reversing.",
  },
  {
    step: 7,
    title: "The second wave",
    detail:
      "The number goes quiet, and a new contact may offer to recover your money for a fee, or a 'bank officer' calls to help you file a complaint and asks for the same details again.",
    tell: "Recovery offers after a fraud are usually the same operation returning.",
  },
];

/* ---------------------------------------------------------------------------
 * Weighted red-flag checklist
 * ------------------------------------------------------------------------- */

export const RED_FLAGS = [
  {
    id: "remote-app",
    label: "You were asked to install an app or read out a code it displayed",
    weight: 4,
    decisive: true,
  },
  {
    id: "upi-pin-receive",
    label: "You were asked to enter a UPI PIN to receive money or a refund",
    weight: 4,
    decisive: true,
  },
  {
    id: "otp",
    label: "You were asked to share an OTP, card number or CVV",
    weight: 4,
    decisive: true,
  },
  {
    id: "personal-upi",
    label: "Payment goes to a personal UPI ID or an individual's account",
    weight: 4,
    decisive: true,
  },
  {
    id: "tonight",
    label: "The message says supply will be cut today or tonight",
    weight: 3,
    decisive: false,
  },
  {
    id: "mobile-number",
    label: "The SMS came from a 10-digit mobile number, not a registered sender header",
    weight: 3,
    decisive: false,
  },
  {
    id: "no-consumer-number",
    label: "The message has no consumer number, meter number or bill amount",
    weight: 3,
    decisive: false,
  },
  {
    id: "whatsapp-officer",
    label: "The 'officer' contacts you on WhatsApp rather than a departmental line",
    weight: 2,
    decisive: false,
  },
  {
    id: "token-payment",
    label: "You were asked to pay a token amount to verify the account",
    weight: 3,
    decisive: false,
  },
  {
    id: "bill-already-paid",
    label: "Your bill for that period is already paid, or the amount does not match",
    weight: 2,
    decisive: false,
  },
  {
    id: "no-written-notice",
    label: "You never received a written disconnection notice by post or on the portal",
    weight: 2,
    decisive: false,
  },
  {
    id: "language",
    label: "Names or spellings are wrong — a board or company that does not serve your area",
    weight: 1,
    decisive: false,
  },
];

export const MAX_FLAG_SCORE = RED_FLAGS.reduce((total, flag) => total + flag.weight, 0);

export const BAND_THRESHOLDS = { almostCertain: 45, suspicious: 20 };

/* ---------------------------------------------------------------------------
 * Pure functions
 * ------------------------------------------------------------------------- */

const round2 = (value) => Math.round(value * 100) / 100;

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parse a YYYY-MM-DD string into a UTC timestamp, or NaN if it is not a real date. */
function parseIsoDate(value) {
  if (typeof value !== "string") return NaN;
  const match = ISO_DATE.exec(value.trim());
  if (!match) return NaN;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return NaN;
  const stamp = Date.UTC(year, month - 1, day);
  const back = new Date(stamp);
  if (back.getUTCFullYear() !== year || back.getUTCMonth() !== month - 1 || back.getUTCDate() !== day) {
    return NaN;
  }
  return stamp;
}

/**
 * Score a suspected meter-update message.
 *
 * @param {{ flagIds?: string[] }} input
 * @returns {object} assessment, or { error } for invalid input.
 */
export function assessMessage({ flagIds } = {}) {
  if (!Array.isArray(flagIds)) {
    return { error: "Tick everything that is true of the message or the call." };
  }
  const selected = new Set(flagIds.filter((id) => typeof id === "string"));
  const matched = RED_FLAGS.filter((flag) => selected.has(flag.id));
  const score = matched.reduce((total, flag) => total + flag.weight, 0);
  const decisive = matched.filter((flag) => flag.decisive);
  const percent = MAX_FLAG_SCORE > 0 ? round2((score / MAX_FLAG_SCORE) * 100) : 0;

  let band = "none";
  let verdict = "Nothing ticked yet. Mark everything the message said or the caller asked for.";

  if (decisive.length > 0) {
    band = "almost-certain";
    verdict =
      "This is the meter-update fraud. At least one thing you ticked has no place in any electricity billing process.";
  } else if (percent >= BAND_THRESHOLDS.almostCertain) {
    band = "almost-certain";
    verdict =
      "The message matches the fraud closely. Call the number printed on your last paper bill instead, and ignore the one in the SMS.";
  } else if (percent >= BAND_THRESHOLDS.suspicious) {
    band = "suspicious";
    verdict =
      "Several elements of the script are present. Check your account on your distribution company's own app before responding.";
  } else if (score > 0) {
    band = "watch";
    verdict =
      "Weak signals. Verify your balance through the official app anyway — it takes less time than the call would.";
  }

  return {
    score,
    maxScore: MAX_FLAG_SCORE,
    percent,
    band,
    verdict,
    matched,
    decisive,
    decisiveCount: decisive.length,
    matchedCount: matched.length,
    totalFlags: RED_FLAGS.length,
  };
}

/**
 * Test a claimed disconnection deadline against Section 56(1) of the Electricity
 * Act, 2003. Both dates are supplied by the caller so the function stays pure.
 *
 * @param {{ noticeDate: string, disconnectionDate: string, noticeInWriting?: boolean }} input
 *        dates as YYYY-MM-DD
 * @returns {object} result, or { error } for invalid input.
 */
export function checkDisconnectionNotice({ noticeDate, disconnectionDate, noticeInWriting = false } = {}) {
  const notice = parseIsoDate(noticeDate);
  const cutoff = parseIsoDate(disconnectionDate);

  if (Number.isNaN(notice)) {
    return { error: "Enter the date the notice reached you as a real calendar date." };
  }
  if (Number.isNaN(cutoff)) {
    return { error: "Enter the date supply is said to be cut as a real calendar date." };
  }
  if (cutoff < notice) {
    return { error: "The disconnection date cannot fall before the notice date." };
  }

  const spanDays = Math.round((cutoff - notice) / MS_PER_DAY);
  // Clear days exclude both the day of service and the day of the proposed action.
  const clearDays = spanDays - 1;
  const shortfall = Math.max(0, STATUTORY_CLEAR_DAYS_NOTICE - clearDays);
  const meetsNoticePeriod = clearDays >= STATUTORY_CLEAR_DAYS_NOTICE;
  const lawful = meetsNoticePeriod && noticeInWriting === true;

  let verdict;
  if (!noticeInWriting) {
    verdict = `Section 56(1) requires the notice to be in writing. A text message or a phone call is not a notice, whatever period it gives.`;
  } else if (meetsNoticePeriod) {
    verdict = `${clearDays} clear days meets the statutory minimum of ${STATUTORY_CLEAR_DAYS_NOTICE}. Verify the arrears on your distribution company's own portal before paying anything.`;
  } else {
    verdict = `${clearDays < 0 ? "No" : clearDays} clear day${clearDays === 1 ? "" : "s"} falls ${shortfall} short of the ${STATUTORY_CLEAR_DAYS_NOTICE} clear days Section 56(1) requires.`;
  }

  return {
    spanDays,
    clearDays,
    requiredClearDays: STATUTORY_CLEAR_DAYS_NOTICE,
    shortfall,
    meetsNoticePeriod,
    noticeInWriting: noticeInWriting === true,
    lawful,
    verdict,
  };
}

/**
 * Explain what a UPI interaction actually does.
 *
 * @param {{ situationId: string }} input
 * @returns {object} explanation, or { error } for an unknown situation.
 */
export function explainUpiRequest({ situationId } = {}) {
  const entry = UPI_TRUTHS.find((item) => item.id === situationId);
  if (!entry) {
    return { error: "Choose the situation that matches what you were asked to do." };
  }
  return {
    situation: entry.situation,
    pinNeeded: entry.pinNeeded,
    moneyDirection: entry.pinNeeded ? "out of your account" : "into your account",
    detail: entry.detail,
    rule: "A UPI PIN only ever authorises a payment out. If a PIN is being requested, money is leaving.",
  };
}
