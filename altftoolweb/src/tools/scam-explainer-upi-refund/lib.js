/**
 * UPI refund scam explainer.
 *
 * The whole scam rests on one fact people are never told plainly:
 *
 *   A UPI PIN authorises money LEAVING your account. Nothing you do to
 *   RECEIVE money on UPI needs your PIN, a QR scan, or approval of a
 *   collect request.
 *
 * So this module is a rule engine rather than a quiz. Every action a caller
 * can ask for is tagged with the direction money actually moves in, and the
 * engine compares that against what the victim believes is happening. It also
 * computes the arithmetic of the "refund" — what was promised against what is
 * actually debited — and scores the conversation against the standard red
 * flags.
 *
 * Pure functions: no DOM, no network, no clock.
 */

/* ------------------------------------------------------------------ */
/* The rule                                                            */
/* ------------------------------------------------------------------ */

export const CORE_RULE =
  "A UPI PIN is only ever needed to send money. Receiving money needs nothing from you beyond your UPI ID or mobile number.";

export const MONEY_DIRECTION = {
  DEBIT: { id: "debit", label: "Money leaves your account" },
  CREDIT: { id: "credit", label: "Money arrives in your account" },
  NONE: { id: "none", label: "No money moves" },
  HANDOVER: { id: "handover", label: "Hands control of your account to someone else" },
};

/**
 * Every action a caller might ask for during a fake refund, with the direction
 * money genuinely moves. Approving a collect request and scanning a QR code
 * both end at the same UPI PIN screen: a debit.
 */
export const ACTIONS = [
  {
    id: "share-upi-id",
    label: "Tell them your UPI ID or the number linked to it",
    direction: MONEY_DIRECTION.NONE,
    needsPin: false,
    safeToReceive: true,
    explanation:
      "This is all anyone needs to send you money. It cannot pull money out, though it does let a stranger send you collect requests.",
  },
  {
    id: "enter-pin",
    label: "Enter your UPI PIN so the refund can be 'released'",
    direction: MONEY_DIRECTION.DEBIT,
    needsPin: true,
    safeToReceive: false,
    explanation:
      "The PIN screen shows the amount being taken out of your account. There is no version of this screen that pays money in.",
  },
  {
    id: "approve-collect",
    label: "Approve a request that has appeared in your UPI app",
    direction: MONEY_DIRECTION.DEBIT,
    needsPin: true,
    safeToReceive: false,
    explanation:
      "A collect request is somebody asking you for money. Approving it opens the PIN screen and debits you; the app may label it with any text the sender typed, including the word refund.",
  },
  {
    id: "scan-qr",
    label: "Scan a QR code they sent to 'receive' the money",
    direction: MONEY_DIRECTION.DEBIT,
    needsPin: true,
    safeToReceive: false,
    explanation:
      "Scanning a QR code always starts a payment from you. Receiving money never involves scanning anything.",
  },
  {
    id: "share-otp",
    label: "Read out an OTP that just arrived",
    direction: MONEY_DIRECTION.HANDOVER,
    needsPin: false,
    safeToReceive: false,
    explanation:
      "An OTP authorises whatever the message says it authorises — usually registering your account on the caller's phone or completing a payment.",
  },
  {
    id: "install-remote-app",
    label: "Install a screen-sharing or support app so they can 'help'",
    direction: MONEY_DIRECTION.HANDOVER,
    needsPin: false,
    safeToReceive: false,
    explanation:
      "Remote-viewing apps let the caller watch you type your PIN and read your one-time passwords as they arrive.",
  },
  {
    id: "send-small-fee",
    label: "Pay a small 'verification' or 'GST' amount to unlock the refund",
    direction: MONEY_DIRECTION.DEBIT,
    needsPin: true,
    safeToReceive: false,
    explanation:
      "No genuine refund requires a payment first. The small amount also confirms your account is live and funded, which invites bigger attempts.",
  },
  {
    id: "give-your-id-only",
    label: "Do nothing and wait for the credit",
    direction: MONEY_DIRECTION.CREDIT,
    needsPin: false,
    safeToReceive: true,
    explanation:
      "A real refund lands on its own. Merchant refunds return to the source account and bank reversals happen without you touching the app.",
  },
];

export function getAction(actionId) {
  return ACTIONS.find((action) => action.id === actionId) || null;
}

export const INTENTS = [
  { id: "receive", label: "I am expecting to RECEIVE money" },
  { id: "pay", label: "I am deliberately SENDING money" },
];

export const VERDICTS = {
  STOP: {
    id: "stop",
    label: "Stop — this takes money out",
    tone: "danger",
  },
  HANDOVER: {
    id: "handover",
    label: "Stop — this hands over control",
    tone: "danger",
  },
  SAFE: {
    id: "safe",
    label: "Consistent with receiving money",
    tone: "success",
  },
  EXPECTED: {
    id: "expected",
    label: "Consistent with sending money",
    tone: "warning",
  },
};

/**
 * Compare what the person believes is happening with what the action does.
 * The mismatch — believing you are receiving while performing a debit — is the
 * entire scam in one line.
 */
export function evaluateAction({ intent, actionId }) {
  const action = getAction(actionId);
  if (!action) return { error: "Choose what you are being asked to do." };
  if (intent !== "receive" && intent !== "pay") {
    return { error: "Choose whether you expect to receive or to send money." };
  }

  if (action.direction === MONEY_DIRECTION.HANDOVER) {
    return {
      action,
      verdict: VERDICTS.HANDOVER,
      mismatch: true,
      reason: `${action.explanation} Nobody arranging a genuine refund needs this.`,
    };
  }

  if (intent === "receive" && action.direction === MONEY_DIRECTION.DEBIT) {
    return {
      action,
      verdict: VERDICTS.STOP,
      mismatch: true,
      reason: `You believe money is coming in, but this action sends money out. ${action.explanation}`,
    };
  }

  if (intent === "receive") {
    return {
      action,
      verdict: VERDICTS.SAFE,
      mismatch: false,
      reason: action.explanation,
    };
  }

  return {
    action,
    verdict: action.direction === MONEY_DIRECTION.DEBIT ? VERDICTS.EXPECTED : VERDICTS.SAFE,
    mismatch: false,
    reason:
      action.direction === MONEY_DIRECTION.DEBIT
        ? `${action.explanation} Check the amount and the payee name on the PIN screen before you confirm.`
        : action.explanation,
  };
}

/* ------------------------------------------------------------------ */
/* The arithmetic of the "refund"                                      */
/* ------------------------------------------------------------------ */

/**
 * What was promised against what actually moves. The number on the UPI PIN
 * screen is the number that leaves the account, however the message describes
 * it, and the promised credit never arrives.
 */
export function netEffect({ promisedCredit, pinScreenAmount, attempts }) {
  const promised = Number(promisedCredit);
  const perAttempt = Number(pinScreenAmount);
  const times = Number(attempts);

  if (!Number.isFinite(promised) || promised < 0) {
    return { error: "The promised refund must be zero or more." };
  }
  if (!Number.isFinite(perAttempt) || perAttempt < 0) {
    return { error: "The amount on the PIN screen must be zero or more." };
  }
  if (!Number.isInteger(times) || times < 1 || times > 50) {
    return { error: "Number of approvals should be a whole number between 1 and 50." };
  }

  const debited = perAttempt * times;
  return {
    expected: promised,
    received: 0,
    debited,
    net: debited === 0 ? 0 : -debited,
    gap: promised + debited,
    attempts: times,
  };
}

/* ------------------------------------------------------------------ */
/* The script                                                          */
/* ------------------------------------------------------------------ */

/** The stages a fake-refund call moves through, in order. */
export const SCRIPT_STAGES = [
  {
    id: "pretext",
    said: "Your order was cancelled / your recharge failed / your KYC lapsed. A refund of Rs 4,999 is pending.",
    truth:
      "The pretext is chosen because it is plausible for almost anyone. The number is specific to sound like a system message.",
    move: "Do not confirm any order detail. Say you will check in the app yourself and hang up.",
  },
  {
    id: "urgency",
    said: "The refund window closes in ten minutes, after that it goes back to the merchant.",
    truth: "Refund windows are not real. Urgency exists to stop you checking anything.",
    move: "Time pressure is the signal to slow down, not to hurry.",
  },
  {
    id: "request",
    said: "I am sending a request in your UPI app — accept it and the refund is released.",
    truth: "That request is a collect request. Accepting it opens your PIN screen and debits you.",
    move: "Decline it. Read the app's own wording: it says someone is requesting money from you.",
  },
  {
    id: "pin",
    said: "Enter your UPI PIN to confirm you are the account holder.",
    truth:
      "The PIN authorises the debit shown on that screen. It never confirms identity for an incoming payment.",
    move: "Close the app. Read the amount on the screen aloud — that is what you are about to lose.",
  },
  {
    id: "retry",
    said: "That failed, the amount was wrong, let us try once more with the correct figure.",
    truth:
      "The first attempt usually succeeded. Repeats exist to drain what is left, often in rising amounts.",
    move: "One suspicious request ends the call. There is no second attempt worth making.",
  },
];

/* ------------------------------------------------------------------ */
/* Red flags                                                           */
/* ------------------------------------------------------------------ */

/** Weights reflect how conclusive each flag is on its own. */
export const RED_FLAGS = [
  { id: "pin-to-receive", weight: 5, label: "You were asked for a UPI PIN to receive money" },
  { id: "collect-request", weight: 5, label: "A payment request appeared in your app during the call" },
  { id: "qr-to-receive", weight: 5, label: "You were sent a QR code to 'receive' the refund" },
  { id: "remote-app", weight: 4, label: "You were asked to install a screen-sharing or support app" },
  { id: "otp", weight: 4, label: "You were asked to read out an OTP" },
  { id: "small-fee", weight: 3, label: "A small fee was demanded before the refund could be released" },
  { id: "urgency", weight: 2, label: "You were told the refund expires within minutes" },
  { id: "unknown-number", weight: 2, label: "The number was not the one printed in the official app" },
  { id: "no-ticket", weight: 1, label: "There is no matching complaint or order in your own account" },
];

export const MAX_FLAG_SCORE = RED_FLAGS.reduce((sum, flag) => sum + flag.weight, 0);

export const RISK_BANDS = [
  {
    min: 5,
    label: "This is the scam",
    tone: "danger",
    advice:
      "At least one action here can only move money out of your account. Stop, and if a payment already went through, report it now.",
  },
  {
    min: 2,
    label: "Strong warning signs",
    tone: "warning",
    advice:
      "Nothing here proves fraud on its own, but the pattern matches. End the call and reach the company through the number in its own app.",
  },
  {
    min: 0,
    label: "Nothing selected yet",
    tone: "muted",
    advice: "Tick whatever actually happened. Any single high-weight flag is enough to stop.",
  },
];

export function scoreConversation(selectedIds) {
  const ids = Array.isArray(selectedIds) ? selectedIds : [];
  const known = RED_FLAGS.filter((flag) => ids.includes(flag.id));
  const score = known.reduce((sum, flag) => sum + flag.weight, 0);
  const band = RISK_BANDS.find((item) => score >= item.min) || RISK_BANDS[RISK_BANDS.length - 1];
  return {
    score,
    max: MAX_FLAG_SCORE,
    percent: MAX_FLAG_SCORE > 0 ? (score / MAX_FLAG_SCORE) * 100 : 0,
    band,
    matched: known,
  };
}

/* ------------------------------------------------------------------ */
/* Afterwards                                                          */
/* ------------------------------------------------------------------ */

/** India's national cybercrime helpline. */
export const CYBERCRIME_HELPLINE = "1930";
export const CYBERCRIME_PORTAL = "cybercrime.gov.in";

/**
 * The Reserve Bank of India's customer-protection framework limits a
 * customer's liability for UNAUTHORISED electronic transactions when they are
 * reported quickly. A transaction you approved yourself with your own UPI PIN
 * is treated as authorised, which is precisely why this scam is built around
 * getting you to press the button.
 */
export const ZERO_LIABILITY_REPORTING_DAYS = 3;

export function liabilityNote(enteredPinYourself) {
  if (enteredPinYourself) {
    return {
      authorised: true,
      note: `Because the UPI PIN was entered on your own device, the bank will treat the debit as an authorised transaction, so the reporting-window protection for unauthorised transactions does not automatically apply. Report it anyway and immediately — speed is what lets the receiving bank freeze the destination account.`,
    };
  }
  return {
    authorised: false,
    note: `If money moved without you authorising it, the Reserve Bank's framework for unauthorised electronic transactions attaches the strongest protection to reporting within ${ZERO_LIABILITY_REPORTING_DAYS} working days, with liability increasing the longer it goes unreported. Notify the bank in writing, not only by phone.`,
  };
}

export const AFTER_STEPS = [
  `Call ${CYBERCRIME_HELPLINE} immediately — the sooner the destination account is flagged, the better the chance of a hold.`,
  `File the complaint at ${CYBERCRIME_PORTAL} and keep the acknowledgement number.`,
  "Tell your bank in writing, using the number on the back of your card or inside the official app — never a number from the caller or from a search result.",
  "Screenshot the UPI transaction, the collect request and the caller's number before anything is deleted.",
  "Change the UPI PIN and check for any mandate or autopay entry you did not create.",
];

export function formatBriefing({ evaluation, effect, risk }) {
  const lines = ["UPI REFUND SCAM — WHAT THIS ACTUALLY DOES", CORE_RULE, ""];
  if (evaluation && !evaluation.error) {
    lines.push(`Asked to: ${evaluation.action.label}`, `Verdict: ${evaluation.verdict.label}`, evaluation.reason, "");
  }
  if (effect && !effect.error) {
    lines.push(
      `Promised credit: ${effect.expected}`,
      `Actually received: ${effect.received}`,
      `Actually debited: ${effect.debited} over ${effect.attempts} approval(s)`,
      `Net position: ${effect.net}`,
      "",
    );
  }
  if (risk) {
    lines.push(`Red-flag score: ${risk.score} of ${risk.max} — ${risk.band.label}`, risk.band.advice, "");
  }
  lines.push("If money has moved:", ...AFTER_STEPS.map((step) => `- ${step}`));
  return lines.join("\n");
}
