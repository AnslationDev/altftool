/**
 * Kids AI Usage Guide Builder — pure logic.
 *
 * Sources for the age thresholds used below:
 *  - COPPA (US, 16 CFR Part 312) applies to online services directed at children
 *    under 13 and requires verifiable parental consent before collecting their data.
 *  - GDPR Article 8(1) sets the default digital-consent age at 16, and lets member
 *    states lower it to no less than 13.
 *  - The consumer terms of the major AI chat assistants set 13 as the minimum age
 *    and require parental permission for users under 18.
 * No medical, legal or educational advice is given here; these are planning defaults
 * a family can edit.
 */

/** Minimum age stated in the consumer terms of the mainstream AI chat assistants. */
export const AI_SERVICE_MIN_AGE = 13;
/** COPPA applies to children below this age in the United States. */
export const COPPA_AGE = 13;
/** GDPR Art. 8(1) default digital-consent age (member states may lower it to 13). */
export const GDPR_DEFAULT_CONSENT_AGE = 16;
/** Parental permission is expected by most AI terms of service below this age. */
export const PARENTAL_PERMISSION_AGE = 18;

/** Youngest and oldest age this planner accepts. */
export const MIN_AGE = 4;
export const MAX_AGE = 18;
/** Upper bound on a single day's allowance, in minutes (8 hours). */
export const MAX_DAILY_MINUTES = 480;

export const AGE_BANDS = [
  {
    id: "under-13",
    label: "Under 13",
    min: MIN_AGE,
    max: 12,
    supervision: "side-by-side",
    supervisionLabel: "Side by side with an adult",
    suggestedDailyMinutes: 20,
    note:
      "Below the 13+ minimum age in most AI service terms and inside COPPA's scope. Use a kid-specific product or an adult-run account with the adult present.",
  },
  {
    id: "13-15",
    label: "13 to 15",
    min: 13,
    max: 15,
    supervision: "shared-account",
    supervisionLabel: "Shared or parent-linked account",
    suggestedDailyMinutes: 45,
    note:
      "Meets the 13+ floor, but parental permission is still expected under 18, and in EU states that kept the GDPR default of 16 a parent must consent to data processing.",
  },
  {
    id: "16-17",
    label: "16 to 17",
    min: 16,
    max: 17,
    supervision: "check-in",
    supervisionLabel: "Own account with weekly check-ins",
    suggestedDailyMinutes: 60,
    note:
      "Old enough for their own account in most services, but still a minor: parental permission clauses and school AI policies still apply.",
  },
  {
    id: "18",
    label: "18",
    min: 18,
    max: MAX_AGE,
    supervision: "independent",
    supervisionLabel: "Independent use",
    suggestedDailyMinutes: 120,
    note:
      "An adult under the terms of service. The agreement becomes a shared habit plan rather than a permission structure.",
  },
];

export const SUPERVISION_LEVELS = [
  { id: "side-by-side", label: "Side by side with an adult", weight: 1 },
  { id: "shared-account", label: "Shared or parent-linked account", weight: 0.8 },
  { id: "check-in", label: "Own account, weekly check-in", weight: 0.55 },
  { id: "independent", label: "Independent use", weight: 0.25 },
];

/**
 * Activities a child might use an AI tool for, with the age at which each is
 * normally reasonable without an adult in the room. minAge values follow the
 * 13+ service floor and add headroom for activities that involve personal
 * disclosure, money, or content that can be published.
 */
export const AI_USES = [
  { id: "homework-explain", label: "Explaining homework they already attempted", minAge: 8 },
  { id: "reading-practice", label: "Reading practice and vocabulary help", minAge: 6 },
  { id: "story-ideas", label: "Story and art ideas for their own writing", minAge: 8 },
  { id: "translation", label: "Translating words or phrases", minAge: 9 },
  { id: "coding-help", label: "Learning to code with worked examples", minAge: 11 },
  { id: "image-generation", label: "Generating images", minAge: 12 },
  { id: "research", label: "Research they then verify in a second source", minAge: 12 },
  { id: "essay-drafting", label: "Drafting text that gets handed in", minAge: 16 },
  { id: "companionship", label: "Chatting to the AI as a friend or confidant", minAge: 16 },
  { id: "personal-advice", label: "Asking about health, mood or body questions", minAge: 16 },
  { id: "voice-face", label: "Uploading their face or voice", minAge: 18 },
  { id: "public-posting", label: "Publishing AI output publicly under their name", minAge: 16 },
];

/**
 * House rules a family can switch on. Weights sum to 100 and drive the
 * safeguard score; the heavier a rule, the more of the common failure modes
 * (data leakage, unchecked facts, hidden use at school) it closes off.
 */
export const SAFEGUARDS = [
  {
    id: "no-personal-data",
    label: "Never type our full name, address, school or phone number",
    weight: 18,
  },
  { id: "verify-facts", label: "Check anything factual in a second source", weight: 14 },
  { id: "tell-teacher", label: "Follow the school's AI policy and say when AI was used", weight: 14 },
  { id: "open-room", label: "AI is used in a shared room, not behind a closed door", weight: 12 },
  { id: "no-photos", label: "No photos of people are uploaded without asking a parent", weight: 12 },
  { id: "report-upset", label: "Tell a parent if anything on screen is upsetting or strange", weight: 12 },
  { id: "no-purchases", label: "No subscriptions or in-app purchases without a parent", weight: 10 },
  { id: "screen-free-hour", label: "No AI in the hour before bed", weight: 8 },
];

const TOTAL_SAFEGUARD_WEIGHT = SAFEGUARDS.reduce((sum, item) => sum + item.weight, 0);

/** Daily allowance above this multiple of the band suggestion raises a flag. */
export const OVER_ALLOWANCE_MULTIPLE = 1.5;

const round = (value, digits = 0) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const titleCase = (value) =>
  value.replace(/\s+/g, " ").trim();

/** Returns the age band containing `age`, or null if the age is out of range. */
export function getAgeBand(age) {
  if (!Number.isFinite(age)) return null;
  return AGE_BANDS.find((band) => age >= band.min && age <= band.max) || null;
}

/** Legal / terms-of-service flags that follow from the child's age alone. */
export function getComplianceNotes(age) {
  const notes = [];
  if (age < COPPA_AGE) {
    notes.push(
      `Under ${COPPA_AGE}: COPPA applies in the US and most AI assistants set ${AI_SERVICE_MIN_AGE} as their minimum age, so use a child-specific product or an adult account with the adult present.`,
    );
  }
  if (age >= AI_SERVICE_MIN_AGE && age < PARENTAL_PERMISSION_AGE) {
    notes.push(
      `Age ${age} meets the ${AI_SERVICE_MIN_AGE}+ minimum in most AI terms, but those terms still ask for parental permission below ${PARENTAL_PERMISSION_AGE}.`,
    );
  }
  if (age < GDPR_DEFAULT_CONSENT_AGE) {
    notes.push(
      `In EU countries that kept the GDPR default consent age of ${GDPR_DEFAULT_CONSENT_AGE}, a parent must consent to data processing at this age.`,
    );
  }
  if (age >= PARENTAL_PERMISSION_AGE) {
    notes.push(
      "At 18 the service terms treat them as an adult, so this becomes a shared habits agreement rather than a permission structure.",
    );
  }
  return notes;
}

/**
 * Builds the family agreement.
 *
 * @param {object} input
 * @param {string} input.childName
 * @param {number} input.age            child's age in years
 * @param {number} input.dailyMinutes   minutes of AI use allowed on an active day
 * @param {number} input.daysPerWeek    active days per week (1-7)
 * @param {string} input.supervision    one of SUPERVISION_LEVELS ids
 * @param {string[]} input.uses         selected AI_USES ids
 * @param {string[]} input.safeguards   selected SAFEGUARDS ids
 * @param {number} input.reviewWeeks    how often the family revisits the agreement
 * @returns {object} agreement or { error }
 */
export function buildAiFamilyAgreement({
  childName = "",
  age,
  dailyMinutes,
  daysPerWeek,
  supervision,
  uses = [],
  safeguards = [],
  reviewWeeks,
} = {}) {
  const name = titleCase(String(childName || ""));
  if (!name) return { error: "Enter the child's first name so the agreement can be addressed to them." };
  if (!Number.isFinite(age)) return { error: "Enter the child's age in whole years." };
  if (age < MIN_AGE || age > MAX_AGE) {
    return { error: `This planner covers ages ${MIN_AGE} to ${MAX_AGE}.` };
  }
  if (!Number.isFinite(dailyMinutes) || dailyMinutes < 0) {
    return { error: "Daily AI minutes must be zero or more." };
  }
  if (dailyMinutes > MAX_DAILY_MINUTES) {
    return { error: `Keep the daily allowance at or below ${MAX_DAILY_MINUTES} minutes.` };
  }
  if (!Number.isFinite(daysPerWeek) || daysPerWeek < 1 || daysPerWeek > 7) {
    return { error: "Days per week must be between 1 and 7." };
  }
  if (!Number.isFinite(reviewWeeks) || reviewWeeks < 1 || reviewWeeks > 52) {
    return { error: "Review the agreement somewhere between every 1 and 52 weeks." };
  }

  const band = getAgeBand(age);
  if (!band) return { error: "That age does not fall in any supported band." };

  const level =
    SUPERVISION_LEVELS.find((item) => item.id === supervision) ||
    SUPERVISION_LEVELS.find((item) => item.id === band.supervision);

  const chosenSafeguards = SAFEGUARDS.filter((rule) => safeguards.includes(rule.id));
  const missingSafeguards = SAFEGUARDS.filter((rule) => !safeguards.includes(rule.id));
  const safeguardWeight = chosenSafeguards.reduce((sum, rule) => sum + rule.weight, 0);

  // Score = share of safeguard weight switched on, scaled by how hands-on the
  // supervision is relative to what the age band suggests. Capped at 100.
  const supervisionExpected =
    SUPERVISION_LEVELS.find((item) => item.id === band.supervision)?.weight ?? 0.5;
  const supervisionRatio = supervisionExpected > 0 ? level.weight / supervisionExpected : 1;
  const rawScore = (safeguardWeight / TOTAL_SAFEGUARD_WEIGHT) * 100 * Math.min(1.15, Math.max(0.7, supervisionRatio));
  const safeguardScore = Math.max(0, Math.min(100, round(rawScore)));

  let scoreLabel = "Needs more guardrails";
  if (safeguardScore >= 80) scoreLabel = "Strong";
  else if (safeguardScore >= 55) scoreLabel = "Balanced";
  else if (safeguardScore >= 30) scoreLabel = "Light";

  const selectedUses = AI_USES.filter((use) => uses.includes(use.id));
  const agreedUses = selectedUses.filter((use) => age >= use.minAge);
  const supervisedUses = selectedUses.filter((use) => age < use.minAge && age >= use.minAge - 3);
  const notYetUses = selectedUses.filter((use) => age < use.minAge - 3);

  const weeklyMinutes = dailyMinutes * daysPerWeek;
  const weeklyHours = round(weeklyMinutes / 60, 1);
  const suggestedWeekly = band.suggestedDailyMinutes * daysPerWeek;
  const overAllowance = dailyMinutes > band.suggestedDailyMinutes * OVER_ALLOWANCE_MULTIPLE;

  const complianceNotes = getComplianceNotes(age);

  const lines = [];
  lines.push(`Our family AI agreement — ${name}, age ${age}`);
  lines.push("");
  lines.push(`Supervision: ${level.label}`);
  lines.push(
    `Time: up to ${dailyMinutes} minutes on ${daysPerWeek} day${daysPerWeek === 1 ? "" : "s"} a week (${weeklyMinutes} minutes, about ${weeklyHours} hours a week).`,
  );
  lines.push(`We review this agreement every ${reviewWeeks} week${reviewWeeks === 1 ? "" : "s"}.`);
  lines.push("");
  if (agreedUses.length) {
    lines.push("What I can use AI for:");
    agreedUses.forEach((use) => lines.push(`  - ${use.label}`));
    lines.push("");
  }
  if (supervisedUses.length) {
    lines.push("What I do only with a parent in the room:");
    supervisedUses.forEach((use) => lines.push(`  - ${use.label} (usually from age ${use.minAge})`));
    lines.push("");
  }
  if (notYetUses.length) {
    lines.push("Not yet — we will talk about these again later:");
    notYetUses.forEach((use) => lines.push(`  - ${use.label} (from about age ${use.minAge})`));
    lines.push("");
  }
  if (chosenSafeguards.length) {
    lines.push("House rules:");
    chosenSafeguards.forEach((rule) => lines.push(`  - ${rule.label}`));
    lines.push("");
  }
  if (complianceNotes.length) {
    lines.push("Why some of this is set the way it is:");
    complianceNotes.forEach((note) => lines.push(`  - ${note}`));
    lines.push("");
  }
  lines.push(`Signed by ${name}: ______________________`);
  lines.push("Signed by parent or carer: ______________________");

  return {
    name,
    age,
    band,
    supervision: level,
    dailyMinutes,
    daysPerWeek,
    weeklyMinutes,
    weeklyHours,
    suggestedDailyMinutes: band.suggestedDailyMinutes,
    suggestedWeeklyMinutes: suggestedWeekly,
    overAllowance,
    safeguardScore,
    scoreLabel,
    chosenSafeguards,
    missingSafeguards,
    agreedUses,
    supervisedUses,
    notYetUses,
    complianceNotes,
    reviewWeeks,
    agreementText: lines.join("\n"),
  };
}

/** Default selections for a given age, used to seed the form. */
export function defaultSelectionForAge(age) {
  const band = getAgeBand(age) || AGE_BANDS[0];
  return {
    supervision: band.supervision,
    dailyMinutes: band.suggestedDailyMinutes,
    uses: AI_USES.filter((use) => age >= use.minAge).map((use) => use.id),
    safeguards: SAFEGUARDS.map((rule) => rule.id),
  };
}
