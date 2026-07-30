/**
 * WhatsApp Group Admin Scam Explainer — scoring rules.
 *
 * Pure module: no React, no DOM, no clock reads.
 *
 * The weights below are a four-step severity ladder, not invented statistics.
 * They encode published guidance that anyone can check:
 *  - RBI / NPCI consumer rules: no bank, payment app or official ever needs your
 *    OTP, UPI PIN or card CVV, and you never enter a PIN to RECEIVE money.
 *    A request for any of those is fraud on its own, so it is DECISIVE.
 *  - WhatsApp account-security guidance: a real group admin change is shown as a
 *    system message in the chat; a "new admin" who only DMs you, or an admin
 *    whose phone number changed while the display name and photo stayed the
 *    same, is the classic account-takeover / impersonation pattern.
 *  - India Cyber Crime (cybercrime.gov.in) advisories on "investment group" and
 *    "task/part-time job" frauds: small early payouts followed by a locked
 *    withdrawal and a fee demand is the exit-scam shape.
 */

/** A tell that is fraud by itself — no further scoring needed. */
export const WEIGHT_DECISIVE = 40;
/** A tell that is rare in genuine groups and common in every scam writeup. */
export const WEIGHT_STRONG = 20;
/** Suspicious, but has innocent explanations. */
export const WEIGHT_MODERATE = 10;
/** Weak corroboration only. */
export const WEIGHT_WEAK = 5;

/** A group younger than this is treated as unestablished. Source: scam groups are
 *  spun up days before the payout demand, real communities predate it. */
export const NEW_GROUP_DAYS = 7;
export const NEW_GROUP_WEIGHT = WEIGHT_MODERATE;

/** Highest score the meter shows. Raw weight sums are clamped to this. */
export const MAX_SCORE = 100;

export const PATTERNS = {
  fakeAdmin: {
    id: "fakeAdmin",
    name: "Fake or hijacked admin",
    summary:
      "Someone poses as the group admin — a cloned profile, a new number with the admin's photo, or a genuinely stolen account — and messages members privately.",
  },
  fakePayment: {
    id: "fakePayment",
    name: "Fake payment or refund",
    summary:
      "A forged payment screenshot, a 'wrong transfer, please return it' story, or a collect request dressed up as an incoming payment.",
  },
  exitScam: {
    id: "exitScam",
    name: "Investment or task exit scam",
    summary:
      "Small early payouts build trust, then withdrawals freeze and a 'tax', 'unlock' or 'upgrade' fee is demanded before the group disappears.",
  },
  credential: {
    id: "credential",
    name: "Credential and account takeover",
    summary:
      "The message exists to harvest an OTP, a UPI PIN or your WhatsApp registration code so your own account becomes the next attack tool.",
  },
};

export const SIGNAL_GROUPS = [
  {
    id: "identity",
    title: "Who is messaging you",
    signals: [
      {
        id: "adminDmOnly",
        label: "The 'admin' contacted you in a private chat, not in the group",
        weight: WEIGHT_STRONG,
        pattern: "fakeAdmin",
        action: "Reply in the group instead. An impersonator cannot post there.",
      },
      {
        id: "numberChanged",
        label: "Same display name and photo, but a phone number you have not seen before",
        weight: WEIGHT_STRONG,
        pattern: "fakeAdmin",
        action:
          "Compare the number against the admin's entry in the group participant list before replying.",
      },
      {
        id: "noSystemMessage",
        label: "No 'X was added as admin' system message appears in the chat history",
        weight: WEIGHT_MODERATE,
        pattern: "fakeAdmin",
        action: "Scroll the group history — WhatsApp always logs a real admin change.",
      },
      {
        id: "profileNew",
        label: "Account shows a very recent join date, no status, or a stock photo",
        weight: WEIGHT_WEAK,
        pattern: "fakeAdmin",
        action: "Treat a brand-new account claiming authority as unverified.",
      },
      {
        id: "cannotCallBack",
        label: "They refuse a voice or video call, or the call 'keeps failing'",
        weight: WEIGHT_MODERATE,
        pattern: "fakeAdmin",
        action: "Call the admin on the number you already had saved, not the one that messaged you.",
      },
    ],
  },
  {
    id: "money",
    title: "What they are asking for",
    signals: [
      {
        id: "otpRequest",
        label: "Asks for an OTP, UPI PIN, CVV or your WhatsApp 6-digit code",
        weight: WEIGHT_DECISIVE,
        decisive: true,
        pattern: "credential",
        action:
          "Stop. No genuine admin, bank or payment app ever needs these. Never forward the code.",
      },
      {
        id: "pinToReceive",
        label: "Tells you to enter your UPI PIN or approve a request to RECEIVE money",
        weight: WEIGHT_DECISIVE,
        decisive: true,
        pattern: "fakePayment",
        action:
          "Stop. Entering a PIN or approving a collect request always sends money out, never in.",
      },
      {
        id: "personalUpi",
        label: "Payment must go to a personal UPI ID, wallet or individual bank account",
        weight: WEIGHT_STRONG,
        pattern: "fakePayment",
        action: "Pay only to the account named on an invoice you obtained independently.",
      },
      {
        id: "screenshotProof",
        label: "Sends a payment screenshot as proof instead of you checking your own balance",
        weight: WEIGHT_STRONG,
        pattern: "fakePayment",
        action: "Screenshots are trivially edited. Confirm in your bank app before acting.",
      },
      {
        id: "feeBeforePayout",
        label: "A fee, tax or 'unlock' charge is demanded before you can withdraw",
        weight: WEIGHT_STRONG,
        pattern: "exitScam",
        action: "Legitimate earnings are never gated behind a payment from you.",
      },
      {
        id: "appLink",
        label: "Asks you to install an APK, a trading app or a screen-sharing tool",
        weight: WEIGHT_STRONG,
        pattern: "credential",
        action:
          "Do not sideload. Screen sharing during banking hands over your OTPs in real time.",
      },
    ],
  },
  {
    id: "pressure",
    title: "How the message is framed",
    signals: [
      {
        id: "urgency",
        label: "Hard deadline — 'in the next 10 minutes', 'offer closes tonight'",
        weight: WEIGHT_MODERATE,
        pattern: "exitScam",
        action: "Add 24 hours. Real requests survive a delay; scripted ones collapse.",
      },
      {
        id: "secrecy",
        label: "Tells you not to discuss it in the group or with family",
        weight: WEIGHT_MODERATE,
        pattern: "exitScam",
        action: "Secrecy exists to stop a second opinion. Get one anyway.",
      },
      {
        id: "smallPayoutFirst",
        label: "You already received a small payout that made the scheme feel real",
        weight: WEIGHT_MODERATE,
        pattern: "exitScam",
        action: "Seed payouts are the cost of the con. Withdraw everything and stop depositing.",
      },
      {
        id: "membersVouch",
        label: "Several members instantly vouch with identical wording or screenshots",
        weight: WEIGHT_MODERATE,
        pattern: "exitScam",
        action: "Check whether those accounts post anything else. Most are part of the setup.",
      },
      {
        id: "bulkAdded",
        label: "You were added to the group without being asked",
        weight: WEIGHT_WEAK,
        pattern: "exitScam",
        action: "Exit and report the group; turn on Settings > Privacy > Groups > My contacts.",
      },
    ],
  },
];

export const ALL_SIGNALS = SIGNAL_GROUPS.flatMap((group) => group.signals);

const SIGNAL_BY_ID = new Map(ALL_SIGNALS.map((signal) => [signal.id, signal]));

export const RISK_BANDS = [
  {
    id: "stop",
    label: "Stop — this is a scam script",
    tone: "danger",
    min: 70,
    advice:
      "Do not send money, codes or app installs. Leave the conversation and verify through a channel you chose yourself.",
  },
  {
    id: "high",
    label: "High risk — verify before anything else",
    tone: "danger",
    min: 40,
    advice:
      "Enough tells are present that the safe assumption is fraud until an independent check proves otherwise.",
  },
  {
    id: "caution",
    label: "Suspicious — slow down",
    tone: "warning",
    min: 15,
    advice:
      "Some tells are present. Confirm the person's identity in the group or by calling a number you already had.",
  },
  {
    id: "low",
    label: "No strong scam tells selected",
    tone: "success",
    min: 0,
    advice:
      "Nothing here matches the common patterns, but keep the basic rule: never share an OTP or PIN, whoever asks.",
  },
];

/** Baseline steps that apply to every risky group message. */
export const BASELINE_ACTIONS = [
  "Verify in the group itself, or by calling the admin on a number you saved earlier.",
  "Never share an OTP, UPI PIN, CVV or WhatsApp registration code with anyone.",
  "If money already moved, call 1930 (India's cyber-fraud helpline) and file at cybercrime.gov.in the same day.",
];

const bandFor = (score) => RISK_BANDS.find((band) => score >= band.min) || RISK_BANDS[RISK_BANDS.length - 1];

/**
 * Score a group message against the known scam patterns.
 *
 * @param {object} input
 * @param {string[]} input.selectedIds  ids from ALL_SIGNALS that the user observed
 * @param {number|string} input.groupAgeDays  how many days the group has existed
 * @param {number|string} input.amountRequested  money being asked for, in INR (0 if none)
 * @returns {object} assessment, or { error } when the input cannot be scored
 */
export function assessGroupAdminRisk({ selectedIds = [], groupAgeDays = 0, amountRequested = 0 } = {}) {
  if (!Array.isArray(selectedIds)) {
    return { error: "Select the tells you can actually see in the chat." };
  }

  const age = Number(groupAgeDays);
  const amount = Number(amountRequested);

  if (!Number.isFinite(age) || !Number.isFinite(amount)) {
    return { error: "Group age and amount must be numbers." };
  }
  if (age < 0) return { error: "Group age cannot be negative." };
  if (amount < 0) return { error: "The amount requested cannot be negative." };

  const unknown = selectedIds.filter((id) => !SIGNAL_BY_ID.has(id));
  if (unknown.length > 0) {
    return { error: "One of the selected observations is not recognised." };
  }

  const matched = selectedIds.map((id) => SIGNAL_BY_ID.get(id));
  const decisive = matched.filter((signal) => signal.decisive);

  let raw = matched.reduce((sum, signal) => sum + signal.weight, 0);
  const newGroup = age < NEW_GROUP_DAYS;
  if (newGroup && matched.length > 0) raw += NEW_GROUP_WEIGHT;

  const score = Math.min(MAX_SCORE, raw);
  const band = decisive.length > 0 ? RISK_BANDS[0] : bandFor(score);

  // Pattern tally: which fraud shape do the observed tells point at?
  const tally = new Map();
  matched.forEach((signal) => {
    tally.set(signal.pattern, (tally.get(signal.pattern) || 0) + signal.weight);
  });
  const patterns = [...tally.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id, weight]) => ({
      ...PATTERNS[id],
      weight,
      share: raw > 0 ? Math.round((weight / raw) * 100) : 0,
    }));

  const actions = [
    ...decisive.map((signal) => signal.action),
    ...matched.filter((signal) => !signal.decisive).map((signal) => signal.action),
  ];
  const uniqueActions = [...new Set([...actions, ...BASELINE_ACTIONS])];

  return {
    score,
    rawScore: raw,
    band,
    decisive,
    matched,
    patterns,
    topPattern: patterns[0] || null,
    newGroup,
    groupAgeDays: age,
    amountRequested: amount,
    actions: uniqueActions,
  };
}

/** Plain-text summary for the copy button. Pure. */
export function formatAssessment(result) {
  if (!result || result.error) return "";
  const lines = [
    "WhatsApp Group Admin Scam check",
    `Risk score: ${result.score}/${MAX_SCORE} — ${result.band.label}`,
  ];
  if (result.topPattern) lines.push(`Closest pattern: ${result.topPattern.name}`);
  if (result.amountRequested > 0) lines.push(`Amount requested: INR ${result.amountRequested}`);
  lines.push(`Group age: ${result.groupAgeDays} day(s)${result.newGroup ? " (unestablished)" : ""}`);
  if (result.matched.length > 0) {
    lines.push("", "Tells observed:");
    result.matched.forEach((signal) => lines.push(`- ${signal.label}`));
  }
  lines.push("", "What to do:");
  result.actions.forEach((action) => lines.push(`- ${action}`));
  return lines.join("\n");
}
