/**
 * Anatomy of the "I know your password" extortion email.
 *
 * Pure helpers — no React, no DOM, no network. The scoring here is a plain
 * definition, not a prediction: the score is the share of the listed hallmarks
 * of a mass-mailed bluff that are present in the message in front of you.
 */

/**
 * Hallmarks of the bulk, automated version of this email. Each is a yes/no
 * question with equal weight, so the score is simply how many are present.
 */
export const BLUFF_HALLMARKS = [
  {
    id: "oldPassword",
    question: "Is the quoted password one you stopped using years ago?",
    detail: "Breach corpora are old by the time they circulate. A password you retired long ago points to a list, not to current access to anything.",
  },
  {
    id: "breachedSite",
    question: "Did you use that password on a site that has since been breached?",
    detail: "Combined credential lists are traded and reused endlessly. Checking your address on a breach-notification service usually finds the exact site the pair came from.",
  },
  {
    id: "noEvidence",
    question: "Was no actual video, screenshot or file included?",
    detail: "Someone holding real material leads with a frame of it. Describing evidence in words costs nothing and is what a template does.",
  },
  {
    id: "noPersonalDetail",
    question: "Does it contain nothing personal beyond the password — no name, employer, device or address?",
    detail: "Real compromise produces specifics. A mail-merge has only the fields present in the leaked list, which is usually an address and a password.",
  },
  {
    id: "cryptoDemand",
    question: "Is payment demanded in bitcoin or another cryptocurrency?",
    detail: "An address in the message body means no bank account can be traced or frozen, and the same address is often pasted into thousands of copies.",
  },
  {
    id: "shortDeadline",
    question: "Is there a 24 to 72 hour deadline?",
    detail: "A countdown is there to stop you researching the text, which would show you thousands of identical copies.",
  },
  {
    id: "fromYourself",
    question: "Does it appear to be sent from your own email address?",
    detail: "The From header is free text. Forging it needs no access to your mailbox at all, and the 'proof' is worthless — check your Sent folder and it will not be there.",
  },
  {
    id: "identicalText",
    question: "Does searching a distinctive sentence from it find the same email posted online?",
    detail: "These campaigns send millions of copies. Finding your 'personal' message word for word on a forum settles the question.",
  },
  {
    id: "noCameraAccess",
    question: "Does it claim webcam footage on a device with no camera, or one you keep covered?",
    detail: "The claim is generic because the sender does not know what hardware you have. A physical cover or a camera indicator that never lit is a direct contradiction.",
  },
  {
    id: "malwareClaim",
    question: "Does it claim malware that has been on every device for months, undetected?",
    detail: "The claim is unfalsifiable by design. It also has to explain why you have seen no other sign, which is why the story is always long and technical.",
  },
];

/** Bands over the share of hallmarks present. */
export const BLUFF_BANDS = [
  { min: 80, band: "Matches the mass-mailed bluff almost exactly", tone: "ok" },
  { min: 60, band: "Strongly fits the bluff pattern", tone: "ok" },
  { min: 35, band: "Partly fits — some claims are unexplained", tone: "warn" },
  { min: 0, band: "Does not fit the bluff pattern — treat it seriously", tone: "danger" },
];

/** Annotated teardown of the email itself. */
export const SEXTORTION_ANATOMY = [
  {
    part: "Subject",
    lure: "Your password is hunter2 — read carefully",
    tell: "The one true fact in the whole message, and the only reason you keep reading. It came from a list, not from your device.",
  },
  {
    part: "Sender",
    lure: "From: your own address",
    tell: "Sending mail with a forged From line requires no access to the account. Look in Sent items — nothing will be there.",
  },
  {
    part: "The claim",
    lure: "\"I installed a RAT on your device months ago and recorded you.\"",
    tell: "Deliberately unverifiable, and it explains its own lack of evidence. Any specific claim could be checked and disproved.",
  },
  {
    part: "The proof",
    lure: "\"I have a split-screen video. You do not want to see it.\"",
    tell: "Described, never attached. A sender with genuine material shows a still frame, because that is what makes people pay.",
  },
  {
    part: "The demand",
    lure: "\"Send $1,450 in bitcoin to 1A1z…\"",
    tell: "One address pasted into a mass send. Paying marks your address as responsive, which is why demands usually repeat.",
  },
  {
    part: "The clock",
    lure: "\"You have 48 hours from the moment you opened this.\"",
    tell: "Read-receipt language implies surveillance. It is a sentence, not a capability.",
  },
  {
    part: "The gag",
    lure: "\"Do not reply, do not tell anyone, do not go to the police.\"",
    tell: "Isolation is the only real leverage in the message. Telling one person you trust removes most of it.",
  },
];

/** What not to do, in the order people are tempted to do it. */
export const DO_NOT = [
  "Do not pay. There is nothing to buy back, and payment marks your address as one that responds.",
  "Do not reply, even to deny it. A reply confirms the address is live and read by a person.",
  "Do not click any link or open any attachment in the message.",
  "Do not go looking for the sender or try to negotiate.",
  "Do not delete it yet if you plan to report it — keep the full message including headers.",
];

/** Real reporting and help routes. */
export const HELP_ROUTES = [
  { where: "Check where the password leaked", what: "A breach-notification service such as Have I Been Pwned shows which sites exposed your address, which usually identifies the source list." },
  { where: "United States", what: "Report to the FBI's Internet Crime Complaint Center at ic3.gov." },
  { where: "United Kingdom", what: "Report to Action Fraud, or to Police Scotland on 101 in Scotland." },
  { where: "India", what: "Report at cybercrime.gov.in, or call the national cyber crime helpline on 1930." },
  { where: "Anywhere, if real intimate images are involved", what: "StopNCII.org can create hashes that help platforms block adult images before they spread. If the person depicted is under 18, use NCMEC's Take It Down service and contact law enforcement — this is a crime against a child, not an embarrassment to manage." },
];

/** Minutes assumed per password reset when estimating clean-up effort. */
export const MINUTES_PER_RESET = 2;

/**
 * Share of bluff hallmarks present.
 *
 * @param {object} answers  Yes/no answers keyed by BLUFF_HALLMARKS id.
 * @param {boolean} showedRealMaterial  Whether genuine intimate material was actually shown.
 */
export function assessBluff({ answers = {}, showedRealMaterial = false } = {}) {
  const total = BLUFF_HALLMARKS.length;
  const present = BLUFF_HALLMARKS.filter((h) => Boolean(answers?.[h.id]));
  const absent = BLUFF_HALLMARKS.filter((h) => !answers?.[h.id]);
  const score = Math.round((present.length / total) * 100);

  if (showedRealMaterial) {
    return {
      score,
      total,
      presentCount: present.length,
      present,
      absent,
      band: "Real material was shown — this is not the bluff pattern",
      tone: "danger",
      realMaterial: true,
      guidance:
        "If the sender has actually shown intimate images or video of you, treat this as image-based abuse rather than a mass-mailed bluff. Do not pay and do not delete the evidence. Report it to your national police cybercrime unit, and use StopNCII.org to have the images blocked across participating platforms. If the person depicted is under 18, contact law enforcement immediately and use NCMEC's Take It Down service.",
    };
  }

  const { band, tone } = BLUFF_BANDS.find((b) => score >= b.min) ?? BLUFF_BANDS[BLUFF_BANDS.length - 1];

  return {
    score,
    total,
    presentCount: present.length,
    present,
    absent,
    band,
    tone,
    realMaterial: false,
    guidance:
      score >= 60
        ? "Everything here comes out of a leaked credential list. The password is real; the surveillance is not. Change the password wherever it is still in use, turn on two-factor authentication, and do not reply."
        : "Some claims are unaccounted for. Change the password everywhere it is used, turn on two-factor authentication, run a scan with your usual security software, and keep the message in case you report it.",
  };
}

/**
 * How many accounts a leaked password actually puts at risk, and the clean-up
 * effort. Accounts protected by a second factor are not immediately openable
 * with the password alone, though they should still be changed.
 *
 * @returns {{error:string}|{atRisk:number,protected:number,minutes:number,accounts:number}}
 */
export function estimateReuseExposure({ accountsSharingPassword, accountsWith2fa = 0, minutesPerReset = MINUTES_PER_RESET } = {}) {
  const accounts = Number(accountsSharingPassword);
  const protectedCount = Number(accountsWith2fa);
  const perReset = Number(minutesPerReset);

  if (![accounts, protectedCount, perReset].every((v) => Number.isFinite(v))) {
    return { error: "Enter whole numbers for the accounts sharing the password and those with two-factor authentication." };
  }
  if (!Number.isInteger(accounts) || accounts < 0) return { error: "Number of accounts must be a whole number of 0 or more." };
  if (!Number.isInteger(protectedCount) || protectedCount < 0) return { error: "Accounts with two-factor authentication must be a whole number of 0 or more." };
  if (protectedCount > accounts) return { error: "You cannot have more protected accounts than accounts using the password." };
  if (accounts > 10000) return { error: "That is more accounts than this estimate is meant for." };
  if (perReset <= 0 || perReset > 120) return { error: "Minutes per reset should be between 1 and 120." };

  return {
    accounts,
    protected: protectedCount,
    atRisk: accounts - protectedCount,
    minutes: Math.round(accounts * perReset),
  };
}
