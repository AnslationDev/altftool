/**
 * Family Anti-Scam Agreement Builder — clause library and coverage scoring.
 *
 * Pure module: no React, no DOM, no clock reads.
 *
 * Why an agreement rather than a warning: every scam in the list below works by
 * isolating one person and rushing them. A rule agreed in advance by the whole
 * household — "we always call back", "nobody sends money without a second
 * person", "the safe word settles it" — removes both the isolation and the
 * rush, and it does so without anyone having to recognise the specific scam.
 *
 * The clause texts encode rules that are unconditionally true in India:
 *  - No bank, payment app, telecom operator, police officer or government
 *    department ever needs your OTP, UPI PIN or card CVV.
 *  - A UPI PIN authorises money leaving your account; receiving money never
 *    requires a PIN, a QR scan or an approval.
 *  - There is no lawful process called "digital arrest": no Indian agency
 *    detains people over a video call or demands a transfer to a "verification
 *    account".
 *  - Reporting to 1930 and cybercrime.gov.in on the same day gives the best
 *    chance of funds being held.
 */

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** Scam types the agreement is measured against. */
export const VECTORS = [
  { id: "otp", label: "OTP, PIN and CVV requests" },
  { id: "impersonation", label: "Someone posing as family in trouble" },
  { id: "authority", label: "Fake police, courier or 'digital arrest' calls" },
  { id: "investment", label: "Investment, trading and task-work schemes" },
  { id: "payment", label: "Fake payment, refund and collect-request tricks" },
  { id: "device", label: "Remote access, app installs and screen sharing" },
];

/** Clause library. `text` is a template; {placeholders} are filled at build time. */
export const RULES = [
  {
    id: "noOtp",
    label: "Nobody in this house ever shares an OTP, UPI PIN or CVV — with anyone, ever",
    covers: ["otp", "payment"],
    weight: 20,
    text: "No member of {household} will ever read out, forward or type an OTP, UPI PIN, card CVV or WhatsApp six-digit code for another person, including someone claiming to be family, a bank, the police or a delivery agent. Nobody legitimate will ever ask.",
  },
  {
    id: "callBack",
    label: "We always hang up and call back on a number we already had",
    covers: ["impersonation", "authority", "otp"],
    weight: 18,
    text: "Any call that asks for money, credentials or urgent action is ended, and the person is called back on a number already saved in the phone or printed on a card or statement. Numbers offered by the caller, or found through a search engine, are never used.",
  },
  {
    id: "safeWord",
    label: "A family safe word settles any 'it's me, I'm in trouble' call",
    covers: ["impersonation"],
    weight: 16,
    text: "If a caller claims to be a family member in trouble, we ask for the family safe word. {safeWordLine} A voice that cannot give it is not family, however convincing the recording sounds.",
  },
  {
    id: "coolingOff",
    label: "A cooling-off period before any urgent money moves",
    covers: ["authority", "investment", "impersonation"],
    weight: 16,
    text: "No money leaves any account for at least {coolingOff} after the request is first made, no matter what deadline is claimed. Genuine requests survive the wait; scripted ones collapse.",
  },
  {
    id: "secondSignature",
    label: "Two people must agree before a large payment",
    covers: ["investment", "payment", "authority"],
    weight: 16,
    text: "Any single payment above {threshold} to a new payee requires a second member of the household to be told first, and to say yes.",
  },
  {
    id: "noSecrets",
    label: "No money conversation is ever kept secret from the household",
    covers: ["investment", "impersonation", "authority"],
    weight: 12,
    text: "If anyone tells us to keep a payment, an investment or a legal matter secret from our own family, that instruction is itself the warning sign, and we tell the household immediately.",
  },
  {
    id: "noRemoteAccess",
    label: "No screen sharing, remote-access apps or sideloaded APKs",
    covers: ["device", "otp"],
    weight: 14,
    text: "We never install an app someone asks us to install over a call, never share our screen while a banking app is open, and never enable accessibility permissions at anyone's request.",
  },
  {
    id: "digitalArrest",
    label: "We know there is no such thing as a 'digital arrest'",
    covers: ["authority"],
    weight: 14,
    text: "No Indian agency arrests, questions or fines anyone over a video call, and none asks for a transfer to a 'verification' or 'safe' account. Any such call is ended and reported, whatever uniform or ID is shown on screen.",
  },
  {
    id: "receiveNoPin",
    label: "We know a PIN is never needed to receive money",
    covers: ["payment"],
    weight: 12,
    text: "Receiving money on UPI needs no PIN, no QR scan and no approval. If anyone is asked to enter a PIN or approve a request in order to receive a refund, prize or repayment, the money is going out, not coming in.",
  },
  {
    id: "helper",
    label: "One nominated person is called before acting, no judgement attached",
    covers: ["impersonation", "investment", "authority"],
    weight: 12,
    text: "{helper} is the first call whenever something feels wrong, and nobody in this house will be blamed, teased or lectured for asking. The cost of a false alarm is a phone call; the cost of staying quiet is the money.",
  },
  {
    id: "reporting",
    label: "If money moves, we report it the same day",
    covers: ["payment", "investment", "authority"],
    weight: 10,
    text: "If a payment has already been made, we call 1930 and file at cybercrime.gov.in the same day, and inform the bank in writing. We do this before doing anything else, and without waiting to see if the money comes back.",
  },
  {
    id: "privacy",
    label: "We keep birthdays, travel and school names off public profiles",
    covers: ["impersonation"],
    weight: 8,
    text: "Public social profiles do not carry our full dates of birth, travel plans, children's school names or photographs of documents, because those are the details that make an impersonation call convincing.",
  },
];

const RULE_BY_ID = new Map(RULES.map((rule) => [rule.id, rule]));

export const MAX_WEIGHT = RULES.reduce((sum, rule) => sum + rule.weight, 0);

/** Safe words that are trivially guessable from a social profile. */
export const WEAK_SAFE_WORDS = [
  "password", "safeword", "family", "help", "mummy", "papa", "amma", "appa",
  "1234", "0000", "hello", "test", "secret",
];

/** Guard rails for the numeric inputs. */
export const LIMITS = {
  minCoolingHours: 1,
  maxCoolingHours: 168, // one week
  maxThreshold: 10000000, // one crore
  maxMembers: 20,
};

export const BANDS = [
  { id: "strong", label: "Strong agreement", tone: "success", min: 80, advice: "This covers every common scam type. Print it, sign it, and re-read it together twice a year." },
  { id: "good", label: "Good coverage", tone: "success", min: 60, advice: "Solid. Add the missing clauses below and every vector is covered." },
  { id: "partial", label: "Partial coverage", tone: "warning", min: 35, advice: "The basics are there, but at least one whole category of scam has no rule against it." },
  { id: "thin", label: "Too thin to rely on", tone: "danger", min: 0, advice: "Add the OTP rule and the call-back rule first — between them they stop most of what actually happens." },
];

const cleanText = (value) => String(value === undefined || value === null ? "" : value).trim();

/**
 * Assess a chosen safe word. Pure, no dictionary lookups.
 *
 * @param {string} word
 * @returns {object} { ok, level, message }
 */
export function checkSafeWord(word) {
  const value = cleanText(word);
  if (value === "") return { ok: false, level: "missing", message: "No safe word set yet." };
  if (value.length < 4) return { ok: false, level: "weak", message: "Use at least four characters so it cannot be guessed on the first try." };
  if (WEAK_SAFE_WORDS.includes(value.toLowerCase())) {
    return { ok: false, level: "weak", message: "That is one of the first words anyone would try. Pick something unrelated to your family." };
  }
  if (/^\d+$/.test(value)) {
    return { ok: false, level: "weak", message: "Digits alone are easy to guess. Use a word or a short phrase." };
  }
  const words = value.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return { ok: true, level: "strong", message: "A two-word phrase is ideal — easy to say aloud, hard to guess." };
  }
  return { ok: true, level: "ok", message: "Usable. A short two-word phrase unrelated to your family would be stronger." };
}

/** Human phrasing for the cooling-off period. Pure. */
export function describeCoolingOff(hours) {
  const value = Number(hours);
  if (!Number.isFinite(value)) return null;
  if (value < 1) return null;
  if (value === 1) return "1 hour";
  if (value === 24) return "24 hours (one full day)";
  if (value % 24 === 0) return `${value} hours (${value / 24} days)`;
  return `${value} hours`;
}

/**
 * Build the agreement text and score its coverage.
 *
 * @param {object} input
 * @returns {object} result, or { error }
 */
export function buildFamilyAgreement({
  householdName = "",
  members = [],
  selectedRules = [],
  safeWord = "",
  includeSafeWord = false,
  coolingOffHours = 24,
  secondSignatureAmount = 10000,
  helperName = "",
} = {}) {
  if (!Array.isArray(selectedRules)) return { error: "The list of chosen rules is unreadable." };
  if (!Array.isArray(members)) return { error: "The list of members is unreadable." };
  if (selectedRules.some((id) => !RULE_BY_ID.has(id))) {
    return { error: "One of the chosen rules is not in the clause library." };
  }
  if (selectedRules.length === 0) return { error: "Choose at least one rule to put in the agreement." };

  const namedMembers = members.map(cleanText).filter((name) => name !== "");
  if (namedMembers.length > LIMITS.maxMembers) {
    return { error: `Keep the agreement to ${LIMITS.maxMembers} people or fewer.` };
  }

  const hours = Number(coolingOffHours);
  const threshold = Number(secondSignatureAmount);
  if (!Number.isFinite(hours) || !Number.isFinite(threshold)) {
    return { error: "The cooling-off period and the payment threshold must be numbers." };
  }
  if (hours < LIMITS.minCoolingHours) return { error: "A cooling-off period of at least one hour is the point of the rule." };
  if (hours > LIMITS.maxCoolingHours) return { error: "Keep the cooling-off period to a week or less, or nobody will follow it." };
  if (threshold < 0) return { error: "The payment threshold cannot be negative." };
  if (threshold > LIMITS.maxThreshold) return { error: "Enter a payment threshold of one crore or less." };

  const chosen = RULES.filter((rule) => selectedRules.includes(rule.id));
  const missing = RULES.filter((rule) => !selectedRules.includes(rule.id));

  const household = cleanText(householdName) === "" ? "this household" : `the ${cleanText(householdName)} household`;
  const helper = cleanText(helperName) === "" ? "Our nominated person" : cleanText(helperName);
  const safeWordCheck = checkSafeWord(safeWord);
  const coolingText = describeCoolingOff(hours);

  const safeWordLine = includeSafeWord && safeWordCheck.ok
    ? `Our safe word is "${cleanText(safeWord)}".`
    : "The safe word is written only on the printed copy kept at home, never in a message or a photo.";

  const clauses = chosen.map((rule, index) => ({
    number: index + 1,
    id: rule.id,
    title: rule.label,
    text: rule.text
      .replace("{household}", household)
      .replace("{safeWordLine}", safeWordLine)
      .replace("{coolingOff}", coolingText)
      .replace("{threshold}", INR.format(Math.round(threshold)))
      .replace("{helper}", helper),
  }));

  const earned = chosen.reduce((sum, rule) => sum + rule.weight, 0);
  const score = MAX_WEIGHT > 0 ? Math.round((earned / MAX_WEIGHT) * 100) : 0;
  const band = BANDS.find((item) => score >= item.min) || BANDS[BANDS.length - 1];

  const vectorCoverage = VECTORS.map((vector) => {
    const covering = chosen.filter((rule) => rule.covers.includes(vector.id));
    const available = RULES.filter((rule) => rule.covers.includes(vector.id));
    return {
      ...vector,
      covered: covering.length > 0,
      rules: covering,
      missingRules: available.filter((rule) => !selectedRules.includes(rule.id)),
    };
  });

  const uncovered = vectorCoverage.filter((vector) => !vector.covered);

  const warnings = [];
  if (namedMembers.length < 2) warnings.push("An agreement needs at least two people. Add everyone who shares money decisions.");
  if (selectedRules.includes("safeWord") && !safeWordCheck.ok) warnings.push(`Safe word: ${safeWordCheck.message}`);
  if (includeSafeWord) warnings.push("You chose to print the safe word inside the agreement. Keep that copy at home and do not photograph or message it.");
  if (!selectedRules.includes("noOtp")) warnings.push("The OTP clause is missing, and it is the single rule that prevents the most loss.");

  const lines = [
    `ANTI-SCAM AGREEMENT — ${cleanText(householdName) === "" ? "our household" : cleanText(householdName)}`,
    namedMembers.length > 0 ? `Agreed between: ${namedMembers.join(", ")}` : "Agreed between: (add names)",
    "",
    "We agree that none of us will be embarrassed for asking, and that any of these rules can be invoked without explanation.",
    "",
  ];
  clauses.forEach((clause) => {
    lines.push(`${clause.number}. ${clause.title}`);
    lines.push(`   ${clause.text}`);
    lines.push("");
  });
  lines.push("Signed: " + (namedMembers.length > 0 ? namedMembers.map((name) => `${name} ______`).join("   ") : "______"));
  lines.push("Review date: every six months.");

  return {
    clauses,
    text: lines.join("\n"),
    score,
    band,
    earned,
    maxWeight: MAX_WEIGHT,
    chosen,
    missing,
    vectorCoverage,
    uncovered,
    warnings,
    safeWordCheck,
    coolingText,
    thresholdText: INR.format(Math.round(threshold)),
    members: namedMembers,
  };
}
