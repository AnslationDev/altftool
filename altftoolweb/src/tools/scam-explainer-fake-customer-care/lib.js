/**
 * Fake customer care number explainer.
 *
 * The trap is not the phone call — it is where the number came from. Search
 * results, sponsored ads, map listings and social-media replies are all
 * surfaces an outsider can write to. The official app, the back of your card
 * and a statement you already hold are not.
 *
 * This module encodes:
 *  - a trust rating for each place a support number can come from, and why,
 *  - the requests that no genuine support line ever makes, marked as absolute
 *    stoppers rather than points on a scale,
 *  - the arithmetic of the overpayment trick, where a doctored credit
 *    screenshot is used to make you "return the excess",
 *  - the channels that genuinely work, and what to do after a payment.
 *
 * Pure functions: no DOM, no network, no clock.
 */

/* ------------------------------------------------------------------ */
/* The rule                                                            */
/* ------------------------------------------------------------------ */

export const CORE_RULE =
  "A support number is only as trustworthy as the surface it came from. If a stranger could have put it there, treat it as theirs.";

/* ------------------------------------------------------------------ */
/* Where the number came from                                          */
/* ------------------------------------------------------------------ */

export const TRUST_LEVELS = {
  TRUSTED: { id: "trusted", label: "You already controlled this channel", tone: "success" },
  WEAK: { id: "weak", label: "Depends on getting there correctly", tone: "warning" },
  WRITABLE: { id: "writable", label: "An outsider can put content here", tone: "danger" },
};

export const NUMBER_SOURCES = [
  {
    id: "official-app",
    label: "Inside the company's own app, on the help or contact screen",
    trust: TRUST_LEVELS.TRUSTED,
    why: "You signed in to reach it, so the number is served by the company to your account.",
  },
  {
    id: "card-back",
    label: "Printed on the back of your card, or on a statement or passbook",
    trust: TRUST_LEVELS.TRUSTED,
    why: "Physical documents the company issued to you cannot be edited by anyone else.",
  },
  {
    id: "typed-url",
    label: "The company's website, reached by typing the address yourself",
    trust: TRUST_LEVELS.WEAK,
    why: "Safe if the address is right. A typo or an autocomplete suggestion can land on a lookalike domain.",
  },
  {
    id: "search-result",
    label: "A normal search result",
    trust: TRUST_LEVELS.WRITABLE,
    why: "Ranking is not verification. Pages built purely to display a fake helpline are made to rank for exactly these queries.",
  },
  {
    id: "sponsored-ad",
    label: "A sponsored or promoted result at the top of a search page",
    trust: TRUST_LEVELS.WRITABLE,
    why: "The top slot is bought, not earned, and impersonating ads appear regularly before being taken down.",
  },
  {
    id: "map-listing",
    label: "A map or business listing",
    trust: TRUST_LEVELS.WRITABLE,
    why: "Map listings accept public suggestions and edits, and a changed phone number is one of the edits that gets through.",
  },
  {
    id: "social-reply",
    label: "A reply to your complaint on social media",
    trust: TRUST_LEVELS.WRITABLE,
    why: "Anyone can copy a brand's name and picture and reply to your public complaint within seconds of you posting it.",
  },
  {
    id: "sms-or-call",
    label: "An SMS or a call that came to you",
    trust: TRUST_LEVELS.WRITABLE,
    why: "Sender IDs and caller IDs can be spoofed. An inbound contact proves nothing about who is calling.",
  },
  {
    id: "aggregator",
    label: "A helpline-listing or customer-care directory website",
    trust: TRUST_LEVELS.WRITABLE,
    why: "These sites carry unverified numbers submitted by users and exist mainly to capture support traffic.",
  },
];

export function assessNumberSource(sourceId) {
  const source = NUMBER_SOURCES.find((item) => item.id === sourceId);
  if (!source) return { error: "Choose where the number came from." };
  return {
    source,
    trusted: source.trust === TRUST_LEVELS.TRUSTED,
    action:
      source.trust === TRUST_LEVELS.TRUSTED
        ? "This is the right way to reach support. Keep using it."
        : source.trust === TRUST_LEVELS.WEAK
          ? "Check the address character by character before trusting the number on the page."
          : "Do not call it. Open the company's own app and use the number there instead.",
  };
}

/* ------------------------------------------------------------------ */
/* What they ask for                                                   */
/* ------------------------------------------------------------------ */

/**
 * Requests marked `stopper: true` are things no genuine support line asks for,
 * ever. They are not weighted against anything — one of them ends the call.
 */
export const REQUESTS = [
  {
    id: "remote-app",
    weight: 5,
    stopper: true,
    label: "Install a screen-sharing or remote-support app",
    why: "Remote-access tools are legitimate software abused here: once connected, the caller sees your screen, your one-time passwords and your typing. Banks and payment companies do not ask customers to install them.",
  },
  {
    id: "otp",
    weight: 5,
    stopper: true,
    label: "Read out an OTP or verification code",
    why: "An OTP authorises whatever the message describes. Support staff can already see your account and never need a code from you.",
  },
  {
    id: "pin-cvv",
    weight: 5,
    stopper: true,
    label: "Confirm your PIN, CVV, card expiry or full card number",
    why: "No genuine agent asks for these. They are the credentials that let someone spend your money.",
  },
  {
    id: "upi-pin",
    weight: 5,
    stopper: true,
    label: "Enter a UPI PIN to 'verify' or 'receive' something",
    why: "A UPI PIN only authorises money leaving your account. There is no verification use for it.",
  },
  {
    id: "small-payment",
    weight: 4,
    stopper: true,
    label: "Make a small refundable payment to process the complaint",
    why: "No support process requires a payment from you to release a refund, and the small amount confirms your account is live.",
  },
  {
    id: "return-excess",
    weight: 4,
    stopper: true,
    label: "Return money that was 'credited by mistake'",
    why: "The credit screenshot is doctored or the money is reversible; what you send back is real and is not.",
  },
  {
    id: "app-permissions",
    weight: 3,
    stopper: false,
    label: "Grant SMS, accessibility or 'draw over other apps' permissions",
    why: "These permissions let an app read your one-time passwords and interact with your screen on its own.",
  },
  {
    id: "callback-number",
    weight: 2,
    stopper: false,
    label: "Save a personal mobile number to call back on",
    why: "Genuine helplines run on published business lines, not on a personal number given out mid-call.",
  },
  {
    id: "hurry",
    weight: 2,
    stopper: false,
    label: "Stay on the line and act now, or the account will be blocked",
    why: "Pressure exists to stop you checking. A real account action is visible in the official app.",
  },
];

export const MAX_REQUEST_SCORE = REQUESTS.reduce((sum, item) => sum + item.weight, 0);

export const VERDICTS = {
  HANG_UP: {
    id: "hang-up",
    label: "Hang up now",
    tone: "danger",
    advice:
      "At least one request here is something no genuine support line makes. End the call, and if anything was installed, disconnect the device from the internet and remove it.",
  },
  SUSPICIOUS: {
    id: "suspicious",
    label: "Treat as fake until proven otherwise",
    tone: "warning",
    advice:
      "End the call and reach the company through its own app. If the issue is real, it will still be there when you get through the right way.",
  },
  UNCLEAR: {
    id: "unclear",
    label: "Nothing conclusive yet",
    tone: "muted",
    advice:
      "Keep the rule in mind: never share codes, never install anything, never pay to receive. If any of those come up, the call is over.",
  },
};

export function assessCall({ sourceId, requestIds }) {
  const sourceCheck = assessNumberSource(sourceId);
  if (sourceCheck.error) return sourceCheck;

  const ids = Array.isArray(requestIds) ? requestIds : [];
  const matched = REQUESTS.filter((item) => ids.includes(item.id));
  const stoppers = matched.filter((item) => item.stopper);
  const score = matched.reduce((sum, item) => sum + item.weight, 0);
  const sourceWritable = sourceCheck.source.trust === TRUST_LEVELS.WRITABLE;

  let verdict = VERDICTS.UNCLEAR;
  if (stoppers.length > 0) verdict = VERDICTS.HANG_UP;
  else if (sourceWritable || score >= 3) verdict = VERDICTS.SUSPICIOUS;

  return {
    source: sourceCheck.source,
    sourceAction: sourceCheck.action,
    sourceWritable,
    matched,
    stoppers,
    score,
    max: MAX_REQUEST_SCORE,
    percent: MAX_REQUEST_SCORE > 0 ? (score / MAX_REQUEST_SCORE) * 100 : 0,
    verdict,
  };
}

/* ------------------------------------------------------------------ */
/* The overpayment trick                                               */
/* ------------------------------------------------------------------ */

/**
 * "Your refund of Rs 5,000 went out as Rs 50,000 by mistake — send back the
 * difference." The screenshot showing the large credit is fabricated, or the
 * credit is itself reversible. The return transfer is neither.
 *
 * askedToReturn = claimed credit - the refund that was actually due
 * netLoss       = what you send back, minus whatever really landed
 */
export function overpaymentTrap({ intendedRefund, claimedCredit, actualCredit }) {
  const intended = Number(intendedRefund);
  const claimed = Number(claimedCredit);
  const actual = Number(actualCredit);

  if (!Number.isFinite(intended) || intended < 0) return { error: "The refund due must be zero or more." };
  if (!Number.isFinite(claimed) || claimed < 0) return { error: "The claimed credit must be zero or more." };
  if (!Number.isFinite(actual) || actual < 0) return { error: "The amount actually credited must be zero or more." };

  const askedToReturn = Math.max(0, claimed - intended);
  const netLoss = Math.max(0, askedToReturn - actual);
  return {
    intended,
    claimed,
    actual,
    askedToReturn,
    netLoss,
    screenshotOnly: actual === 0,
    inflation: intended > 0 ? claimed / intended : null,
  };
}

/* ------------------------------------------------------------------ */
/* Doing it right, and afterwards                                      */
/* ------------------------------------------------------------------ */

export const RIGHT_WAY = [
  "Open the company's own app and use the contact option inside it — that number cannot be edited by an outsider.",
  "For a bank or card, use the number printed on the back of the card or on a statement you already have.",
  "Type the company's web address yourself rather than following a search result, and check it character by character.",
  "If you posted a public complaint, expect impersonators to reply within minutes; ignore replies offering a helpline or a DM.",
  "Genuine account actions appear in the official app. If the app shows nothing, the call is describing something that is not happening.",
];

export const CYBERCRIME_HELPLINE = "1930";
export const CYBERCRIME_PORTAL = "cybercrime.gov.in";

export const AFTER_STEPS = [
  "Disconnect the device from the internet and uninstall anything the caller had you install.",
  `Call ${CYBERCRIME_HELPLINE} and file at ${CYBERCRIME_PORTAL}; keep the acknowledgement number.`,
  "Block the card or freeze the account through the official app, not by calling anyone back.",
  "Change the passwords and PINs the caller could have seen, from a different device.",
  "Check for autopay mandates, new payees and forwarding rules you did not create.",
];

export function formatBriefing({ call, trap }) {
  const lines = ["FAKE CUSTOMER CARE CHECK", CORE_RULE, ""];
  if (call && !call.error) {
    lines.push(
      `Number came from: ${call.source.label}`,
      `Trust: ${call.source.trust.label} — ${call.source.why}`,
      `What to do: ${call.sourceAction}`,
      "",
      `Requests flagged: ${call.matched.length} (score ${call.score} of ${call.max})`,
      `Verdict: ${call.verdict.label} — ${call.verdict.advice}`,
      "",
    );
  }
  if (trap && !trap.error && trap.askedToReturn > 0) {
    lines.push(
      "Overpayment trick:",
      `- Refund actually due: ${trap.intended}`,
      `- Credit they claim: ${trap.claimed}`,
      `- Credit that really landed: ${trap.actual}`,
      `- They want back: ${trap.askedToReturn}`,
      `- Your net loss if you send it: ${trap.netLoss}`,
      "",
    );
  }
  lines.push("Reaching real support:", ...RIGHT_WAY.map((item) => `- ${item}`));
  return lines.join("\n");
}
