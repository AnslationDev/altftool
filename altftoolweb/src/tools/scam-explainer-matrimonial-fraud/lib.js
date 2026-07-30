/**
 * Matrimonial fraud warning signs.
 *
 * Matrimonial and dating fraud is not one lie; it is a shape. A profile that
 * cannot be checked, a story that explains why it cannot be checked, and then
 * a reason for money to move. This module scores those three layers
 * separately, because the combination is what matters: an unverifiable profile
 * alone means little, an unverifiable profile plus a money request means a
 * great deal.
 *
 * It also tracks the other half of the picture — how much you have actually
 * verified independently — and totals anything already sent.
 *
 * Pure functions: no DOM, no network, no clock. Dates are passed in.
 */

/* ------------------------------------------------------------------ */
/* The rule                                                            */
/* ------------------------------------------------------------------ */

export const CORE_RULE =
  "No genuine marriage prospect needs money from you before you have met them. A request for money is the point at which the relationship stops being a relationship.";

/* ------------------------------------------------------------------ */
/* Red flags, by layer                                                 */
/* ------------------------------------------------------------------ */

export const CATEGORIES = {
  PROFILE: { id: "profile", label: "The profile" },
  STORY: { id: "story", label: "The story" },
  MONEY: { id: "money", label: "The money" },
};

export const RED_FLAGS = [
  {
    id: "photos-reused",
    category: CATEGORIES.PROFILE,
    weight: 4,
    label: "Photos appear elsewhere on the internet under a different name",
    why: "A reverse image search takes a minute and settles it. Stolen photo sets are reused across dozens of profiles.",
  },
  {
    id: "no-video",
    category: CATEGORIES.PROFILE,
    weight: 5,
    label: "Never appears on a live video call, or the camera always fails",
    why: "A live call is the cheapest verification there is. Repeated failure is a decision, not bad luck.",
  },
  {
    id: "no-family",
    category: CATEGORIES.PROFILE,
    weight: 3,
    label: "No family, friends or references you can speak to",
    why: "A marriage proposal with no reachable people around it is missing the part that makes it checkable.",
  },
  {
    id: "new-profile",
    category: CATEGORIES.PROFILE,
    weight: 2,
    label: "Recently created profile, few details, quick to be removed",
    why: "Accounts are disposable. A profile that disappears after contact was never an investment.",
  },
  {
    id: "off-platform",
    category: CATEGORIES.STORY,
    weight: 3,
    label: "Moved to a private chat app within the first few messages",
    why: "Off-platform conversation removes the site's records, reporting and any verification it offers.",
  },
  {
    id: "unreachable-job",
    category: CATEGORIES.STORY,
    weight: 4,
    label: "Works somewhere unreachable — a ship, a rig, an overseas posting, a foreign hospital",
    why: "The job is chosen to explain why they cannot meet, cannot video call and cannot be visited.",
  },
  {
    id: "fast-commitment",
    category: CATEGORIES.STORY,
    weight: 3,
    label: "Talks of marriage or deep commitment within days",
    why: "Speed builds obligation before verification can catch up. It is the working method, not a personality.",
  },
  {
    id: "crisis",
    category: CATEGORIES.STORY,
    weight: 4,
    label: "A sudden crisis: an accident, an arrest, a frozen account, a medical emergency",
    why: "The crisis arrives once attachment exists, and always needs money faster than it can be checked.",
  },
  {
    id: "gift-parcel",
    category: CATEGORIES.MONEY,
    weight: 5,
    label: "Sent a gift or parcel, then a 'customs' or 'clearance' fee was demanded",
    why: "There is no parcel. Genuine customs duty is assessed by the department against documentation and is not collected by an individual phoning you for a transfer to a personal account.",
  },
  {
    id: "money-request",
    category: CATEGORIES.MONEY,
    weight: 5,
    label: "Asked for money, a loan, or a card or wallet top-up",
    why: "This is the purpose of the entire preceding conversation.",
  },
  {
    id: "investment-tip",
    category: CATEGORIES.MONEY,
    weight: 5,
    label: "Introduced you to a trading, crypto or investment platform they use",
    why: "The platform is theirs. Early gains display on screen and withdrawals fail once a large deposit is in.",
  },
  {
    id: "account-use",
    category: CATEGORIES.MONEY,
    weight: 5,
    label: "Asked to route money through your account or use your documents",
    why: "This makes your account the traceable link in someone else's fraud, whatever you were told about why.",
  },
  {
    id: "secrecy",
    category: CATEGORIES.MONEY,
    weight: 3,
    label: "Asked you to keep the money side from your family",
    why: "Isolation from anyone who would ask an obvious question is a required step.",
  },
];

export const MAX_FLAG_SCORE = RED_FLAGS.reduce((sum, flag) => sum + flag.weight, 0);

export function categoryTotals(selectedIds) {
  const ids = Array.isArray(selectedIds) ? selectedIds : [];
  const totals = {};
  for (const key of Object.keys(CATEGORIES)) {
    const category = CATEGORIES[key];
    const inCategory = RED_FLAGS.filter((flag) => flag.category === category);
    const matched = inCategory.filter((flag) => ids.includes(flag.id));
    totals[category.id] = {
      category,
      score: matched.reduce((sum, flag) => sum + flag.weight, 0),
      max: inCategory.reduce((sum, flag) => sum + flag.weight, 0),
      matched,
    };
  }
  return totals;
}

/* ------------------------------------------------------------------ */
/* Verification: the other half of the picture                         */
/* ------------------------------------------------------------------ */

/** Checks that are actually independent — each one an outsider cannot fake. */
export const VERIFICATION_CHECKS = [
  { id: "video", label: "A live video call where you saw and spoke to them", weight: 2 },
  { id: "in-person", label: "Met in person, more than once", weight: 3 },
  { id: "family", label: "Spoke to family or friends who know them", weight: 2 },
  { id: "workplace", label: "Confirmed the workplace through the employer, not a document they sent", weight: 2 },
  { id: "reverse-image", label: "Reverse image search of their photos came back clean", weight: 1 },
  { id: "documents", label: "Identity details cross-checked against an official source", weight: 2 },
];

export const MAX_VERIFICATION = VERIFICATION_CHECKS.reduce((sum, check) => sum + check.weight, 0);

export function verificationCoverage(selectedIds) {
  const ids = Array.isArray(selectedIds) ? selectedIds : [];
  const matched = VERIFICATION_CHECKS.filter((check) => ids.includes(check.id));
  const score = matched.reduce((sum, check) => sum + check.weight, 0);
  return {
    score,
    max: MAX_VERIFICATION,
    percent: MAX_VERIFICATION > 0 ? (score / MAX_VERIFICATION) * 100 : 0,
    matched,
    count: matched.length,
    total: VERIFICATION_CHECKS.length,
  };
}

/* ------------------------------------------------------------------ */
/* What has already gone                                               */
/* ------------------------------------------------------------------ */

export function exposureTotal(amounts) {
  const list = Array.isArray(amounts) ? amounts.map(Number) : [];
  if (list.some((value) => !Number.isFinite(value) || value < 0)) {
    return { error: "Every amount must be zero or more." };
  }
  if (list.length > 50) return { error: "Fifty entries is enough to make the point." };
  const total = list.reduce((sum, value) => sum + value, 0);
  const largest = list.length ? Math.max(...list) : 0;
  return { total, count: list.length, largest, average: list.length ? total / list.length : 0 };
}

/* ------------------------------------------------------------------ */
/* The verdict                                                         */
/* ------------------------------------------------------------------ */

export const VERDICTS = {
  STOP: {
    id: "stop",
    label: "Send nothing, and report the profile",
    tone: "danger",
  },
  VERIFY_FIRST: {
    id: "verify-first",
    label: "Verify in person before anything else happens",
    tone: "warning",
  },
  PROCEED_CAREFULLY: {
    id: "proceed",
    label: "Nothing conclusive — keep verifying",
    tone: "muted",
  },
};

/**
 * The decision is a combination, not a total. Any money-layer flag with thin
 * verification is decisive on its own; heavy story flags with no in-person
 * contact means verify before anything else.
 */
export function assess({ flagIds, verifiedIds, amountsSent }) {
  const totals = categoryTotals(flagIds);
  const coverage = verificationCoverage(verifiedIds);
  const exposure = exposureTotal(amountsSent || []);
  if (exposure.error) return { error: exposure.error };

  const ids = Array.isArray(flagIds) ? flagIds : [];
  const score = RED_FLAGS.filter((flag) => ids.includes(flag.id)).reduce(
    (sum, flag) => sum + flag.weight,
    0,
  );
  const metInPerson = Array.isArray(verifiedIds) && verifiedIds.includes("in-person");
  const moneyLayer = totals.money.score > 0;

  let verdict = VERDICTS.PROCEED_CAREFULLY;
  let reason =
    "Nothing here is conclusive yet. Keep the conversation on the platform and complete the independent checks below before anything financial is discussed.";

  if (moneyLayer && !metInPerson) {
    verdict = VERDICTS.STOP;
    reason =
      "Money has entered a relationship you have not verified in person. That combination is the defining shape of matrimonial fraud — send nothing and report the profile to the platform.";
  } else if (moneyLayer) {
    verdict = VERDICTS.STOP;
    reason =
      "A money request has appeared. Meeting in person does not make a financial ask safe: keep money entirely out of it until families and documents have been verified independently.";
  } else if (score >= 8 && coverage.percent < 50) {
    verdict = VERDICTS.VERIFY_FIRST;
    reason =
      "Several warning signs with very little verified independently. Insist on a live video call and an in-person meeting before the relationship goes any further.";
  } else if (score >= 4) {
    verdict = VERDICTS.VERIFY_FIRST;
    reason =
      "There are warning signs worth resolving. A live video call and a conversation with their family will settle most of them quickly.";
  }

  return {
    totals,
    coverage,
    exposure,
    score,
    max: MAX_FLAG_SCORE,
    percent: MAX_FLAG_SCORE > 0 ? (score / MAX_FLAG_SCORE) * 100 : 0,
    moneyLayer,
    metInPerson,
    verdict,
    reason,
  };
}

/* ------------------------------------------------------------------ */
/* Practical steps                                                     */
/* ------------------------------------------------------------------ */

export const SAFER_PRACTICE = [
  "Keep the conversation on the matrimonial platform until you have met — off-platform chat removes every record and safeguard.",
  "Insist on a live video call early. It costs nothing and it is the check that fraud cannot pass.",
  "Reverse image search the photos before the second conversation.",
  "Verify the workplace through the employer's own published contact details, not a document or an email they sent you.",
  "Involve family in the money question specifically, since secrecy about money is a required step in this fraud.",
  "Never accept a parcel arrangement that comes with a fee to release it, and never pay a 'customs' demand made by phone to a personal account.",
];

export const CYBERCRIME_HELPLINE = "1930";
export const CYBERCRIME_PORTAL = "cybercrime.gov.in";

export const AFTER_STEPS = [
  `Call ${CYBERCRIME_HELPLINE} and file at ${CYBERCRIME_PORTAL} with the acknowledgement number saved.`,
  "Report and screenshot the profile on the matrimonial platform before it is deleted.",
  "Save the chat history, phone numbers, account details and every transfer reference.",
  "Tell your bank in writing if money left your account or unknown money arrived in it.",
  "Tell someone you trust. Isolation is what the script depends on, and it is the easiest part to undo.",
];

export function formatBriefing(result) {
  if (!result || result.error) return "";
  const lines = [
    "MATRIMONIAL FRAUD CHECK",
    CORE_RULE,
    "",
    `Verdict: ${result.verdict.label}`,
    result.reason,
    "",
    `Warning-sign score: ${result.score} of ${result.max}`,
  ];
  Object.values(result.totals).forEach((total) => {
    lines.push(`- ${total.category.label}: ${total.score} of ${total.max}`);
  });
  lines.push(
    "",
    `Independent verification: ${result.coverage.count} of ${result.coverage.total} checks done (${result.coverage.percent.toFixed(0)}%)`,
  );
  if (result.exposure.count > 0) {
    lines.push(
      `Money already sent: ${result.exposure.total} across ${result.exposure.count} transfer(s), largest ${result.exposure.largest}`,
    );
  }
  lines.push("", "Safer practice:", ...SAFER_PRACTICE.map((item) => `- ${item}`));
  return lines.join("\n");
}
