/**
 * Teen Instagram safety planner.
 *
 * Pure logic: no React, no DOM, no clock reads. Times are passed in as strings.
 */

/** Instagram's minimum age to hold an account is 13. */
export const INSTAGRAM_MIN_AGE = 13;

/** Teen Account protections apply automatically to accounts registered as under 18. */
export const TEEN_ACCOUNT_MAX_AGE = 17;

/**
 * Under 16, Teen Account defaults can only be loosened with a parent's approval
 * through supervision; 16 and 17 year olds can change them themselves.
 */
export const PARENT_APPROVAL_MAX_AGE = 15;

/** Instagram shows a time-limit reminder after 60 minutes of use in a day. */
export const DAILY_REMINDER_MINUTES = 60;

/** Instagram's built-in Sleep mode default window is 22:00 to 07:00. */
export const DEFAULT_SLEEP_MODE = { start: "22:00", end: "07:00" };

/** Supervision shows the accounts a teen has messaged in the last 7 days, not the message text. */
export const SUPERVISION_DM_HISTORY_DAYS = 7;

/**
 * American Academy of Sleep Medicine consensus recommendation, hours per 24h.
 * 6-12 years: 9-12 hours. 13-18 years: 8-10 hours.
 */
export const SLEEP_HOURS_BY_AGE = [
  { maxAge: 12, min: 9, max: 12 },
  { maxAge: 18, min: 8, max: 10 },
];

/** Wind-down buffer applied before the target bedtime when setting the quiet window. */
export const WIND_DOWN_BUFFER_MINUTES = 30;

const MINUTES_PER_DAY = 24 * 60;

export const TIER_WEIGHTS = { essential: 3, recommended: 2, optional: 1 };

export const VISIBILITY = [
  { id: "private", label: "Private account, friends only" },
  { id: "public", label: "Public account for a hobby, sport or creator page" },
];

export const SUPERVISION_STATES = [
  { id: "linked", label: "Parental supervision is already linked" },
  { id: "none", label: "No supervision linked yet" },
];

/**
 * visibility: which account styles the step applies to.
 * supervision: which supervision states the step applies to.
 */
export const STEPS = [
  {
    id: "confirm-teen-account",
    title: "Confirm the account is a Teen Account with a truthful birthday",
    where: "Settings and privacy > Accounts Centre > Personal details > Birthday",
    why: "Teen Account protections are applied from the registered age. An inflated birthday silently removes every default below.",
    tier: "essential",
    visibility: ["private", "public"],
    supervision: ["linked", "none"],
  },
  {
    id: "set-up-supervision",
    title: "Link parental supervision from both sides",
    where: "Settings and privacy > Supervision > Set up supervision (invite from either the parent or the teen)",
    why: `Supervision is what lets you see who they have messaged in the last ${SUPERVISION_DM_HISTORY_DAYS} days, set time limits, and approve or refuse changes to teen settings.`,
    tier: "essential",
    visibility: ["private", "public"],
    supervision: ["none"],
  },
  {
    id: "review-supervision-settings",
    title: "Review what supervision is actually showing you",
    where: "Settings and privacy > Supervision > your teen's account",
    why: "Supervision reports who they message and the topics they follow, but never the message content — knowing that boundary avoids false reassurance.",
    tier: "recommended",
    visibility: ["private", "public"],
    supervision: ["linked"],
  },
  {
    id: "private-account",
    title: "Keep the account private",
    where: "Settings and privacy > Account privacy > Private account",
    why: "Private is the Teen Account default: only approved followers see posts, stories and the follower list.",
    tier: "essential",
    visibility: ["private"],
    supervision: ["linked", "none"],
  },
  {
    id: "public-account-tradeoffs",
    title: "Accept and mitigate the public-account trade-off",
    where: "Settings and privacy > Account privacy",
    why: "A public teen account can be seen, screenshotted and reposted by anyone. If it must stay public, every comment, tag and DM control below matters more.",
    tier: "essential",
    visibility: ["public"],
    supervision: ["linked", "none"],
  },
  {
    id: "message-controls",
    title: "Restrict who can message and add to group chats",
    where: "Settings and privacy > Messages and story replies > Message controls",
    why: "The Teen Account default only lets people they follow or are already connected to start a chat. Check it has not been loosened.",
    tier: "essential",
    visibility: ["private", "public"],
    supervision: ["linked", "none"],
  },
  {
    id: "nudity-protection",
    title: "Leave nudity protection in DMs switched on",
    where: "Settings and privacy > Messages and story replies > Nudity protection in DMs",
    why: "It blurs suspected nude images before they are seen and warns before one is sent, which is the main defence against sextortion openings.",
    tier: "essential",
    visibility: ["private", "public"],
    supervision: ["linked", "none"],
  },
  {
    id: "tags-and-mentions",
    title: "Limit who can tag and mention them",
    where: "Settings and privacy > Tags and mentions > Allow tags/mentions from people you follow",
    why: "Tagging is how a stranger pulls a teenager into a public thread or a fake giveaway without ever messaging them.",
    tier: "essential",
    visibility: ["private", "public"],
    supervision: ["linked", "none"],
  },
  {
    id: "hidden-words",
    title: "Turn on Hidden Words and add a custom word list",
    where: "Settings and privacy > Hidden Words > Hide comments and Advanced comment filtering",
    why: "It filters offensive comments and message requests before they are read, and the custom list can include names used in local bullying.",
    tier: "recommended",
    visibility: ["private", "public"],
    supervision: ["linked", "none"],
  },
  {
    id: "comment-controls",
    title: "Restrict who can comment, and pre-block terms",
    where: "Settings and privacy > Comments > Allow comments from",
    why: "On a public account, comments are the highest-volume route to a teen and the easiest one to narrow.",
    tier: "essential",
    visibility: ["public"],
    supervision: ["linked", "none"],
  },
  {
    id: "sensitive-content",
    title: "Keep Sensitive Content Control on the most limited setting",
    where: "Settings and privacy > Suggested content > Sensitive content control",
    why: "Teen Accounts default to the most restrictive option; it governs what Explore and Reels are allowed to surface.",
    tier: "essential",
    visibility: ["private", "public"],
    supervision: ["linked", "none"],
  },
  {
    id: "story-audience",
    title: "Use Close Friends for stories, and turn off story resharing",
    where: "Story privacy settings > Close Friends; Settings > Story > Allow resharing to stories (off)",
    why: "Stories carry the most location and routine detail; a Close Friends list keeps them off screenshots that travel.",
    tier: "recommended",
    visibility: ["private", "public"],
    supervision: ["linked", "none"],
  },
  {
    id: "activity-status",
    title: "Turn off activity status",
    where: "Settings and privacy > Messages and story replies > Show activity status",
    why: "Hiding 'active now' removes the pressure to answer immediately and stops anyone mapping their daily routine.",
    tier: "recommended",
    visibility: ["private", "public"],
    supervision: ["linked", "none"],
  },
  {
    id: "no-location-or-school",
    title: "Strip school, sports club and location from the bio and posts",
    where: "Edit profile, plus Add location when posting",
    why: "School name plus a face is enough to find a teenager in person. This matters most on a public account.",
    tier: "essential",
    visibility: ["public"],
    supervision: ["linked", "none"],
  },
  {
    id: "similar-account-suggestions",
    title: "Turn off similar-account suggestions",
    where: "Settings and privacy > Suggested content / Account > Similar account suggestions",
    why: "It stops the account being recommended into strangers' suggestion lists, which is how most unsolicited follows start.",
    tier: "recommended",
    visibility: ["private", "public"],
    supervision: ["linked", "none"],
  },
  {
    id: "sleep-mode",
    title: "Set Sleep mode to the quiet window worked out below",
    where: "Your activity > Time spent > Sleep mode",
    why: "Sleep mode mutes notifications and auto-replies to DMs overnight, which is what stops the 3am chat spiral.",
    tier: "recommended",
    visibility: ["private", "public"],
    supervision: ["linked", "none"],
  },
  {
    id: "daily-limit",
    title: "Set a daily time limit as well as the built-in reminder",
    where: "Your activity > Time spent > Daily limit",
    why: `Instagram already nudges after ${DAILY_REMINDER_MINUTES} minutes a day on a Teen Account; a hard limit is a separate, stricter setting.`,
    tier: "optional",
    visibility: ["private", "public"],
    supervision: ["linked", "none"],
  },
  {
    id: "two-factor",
    title: "Turn on two-factor authentication",
    where: "Accounts Centre > Password and security > Two-factor authentication",
    why: "Teen accounts are stolen for resale and for impersonating a known face to their friends; an authenticator app is stronger than SMS.",
    tier: "recommended",
    visibility: ["private", "public"],
    supervision: ["linked", "none"],
  },
  {
    id: "block-restrict-report",
    title: "Show them Restrict, Block and Report before they need them",
    where: "Profile > three dots > Restrict / Block / Report",
    why: "Restrict quietly hides someone's comments and moves their messages to requests without the social cost of an obvious block.",
    tier: "essential",
    visibility: ["private", "public"],
    supervision: ["linked", "none"],
  },
  {
    id: "follower-audit",
    title: "Audit the follower list together and remove people they cannot name",
    where: "Profile > Followers > Remove",
    why: "Private accounts leak through old approved followers far more often than through settings.",
    tier: "recommended",
    visibility: ["private", "public"],
    supervision: ["linked", "none"],
  },
];

export const BANDS = [
  { min: 90, label: "Well protected", tone: "success" },
  { min: 65, label: "Mostly covered", tone: "success" },
  { min: 35, label: "Half done", tone: "warning" },
  { min: 0, label: "Defaults only", tone: "danger" },
];

function bandFor(score) {
  return BANDS.find((band) => score >= band.min) || BANDS[BANDS.length - 1];
}

function sleepNeedFor(age) {
  return SLEEP_HOURS_BY_AGE.find((row) => age <= row.maxAge) || SLEEP_HOURS_BY_AGE[SLEEP_HOURS_BY_AGE.length - 1];
}

function parseClock(value) {
  const match = /^([0-9]{1,2}):([0-9]{2})$/.exec(String(value).trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function formatClock(totalMinutes) {
  const wrapped = ((totalMinutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours = Math.floor(wrapped / 60);
  const minutes = wrapped % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/**
 * Work out an overnight quiet window from the school wake time.
 *
 * bedtime  = wake time minus the minimum recommended sleep for the age
 * quiet    = bedtime minus a wind-down buffer, through to the wake time
 */
export function computeQuietHours({ age, wakeTime } = {}) {
  const years = Number(age);
  if (!Number.isFinite(years) || years < INSTAGRAM_MIN_AGE || years > TEEN_ACCOUNT_MAX_AGE) {
    return { error: `Enter an age between ${INSTAGRAM_MIN_AGE} and ${TEEN_ACCOUNT_MAX_AGE}.` };
  }
  const wakeMinutes = parseClock(wakeTime);
  if (wakeMinutes === null) return { error: "Enter the wake-up time as HH:MM, for example 06:45." };

  const need = sleepNeedFor(years);
  const bedtimeMinutes = wakeMinutes - need.min * 60;
  const quietStartMinutes = bedtimeMinutes - WIND_DOWN_BUFFER_MINUTES;
  const quietLength =
    ((wakeMinutes - quietStartMinutes) % MINUTES_PER_DAY + MINUTES_PER_DAY) % MINUTES_PER_DAY;

  return {
    recommendedSleepMin: need.min,
    recommendedSleepMax: need.max,
    bedtime: formatClock(bedtimeMinutes),
    quietStart: formatClock(quietStartMinutes),
    quietEnd: formatClock(wakeMinutes),
    quietHours: Math.round((quietLength / 60) * 100) / 100,
    instagramDefault: `${DEFAULT_SLEEP_MODE.start}–${DEFAULT_SLEEP_MODE.end}`,
  };
}

/**
 * @param {object} input
 * @param {number} input.age
 * @param {string} input.visibility   one of VISIBILITY ids
 * @param {string} input.supervision  one of SUPERVISION_STATES ids
 * @param {string} input.wakeTime     HH:MM
 * @param {string[]} [input.completed]
 */
export function buildPlan({ age, visibility, supervision, wakeTime, completed = [] } = {}) {
  const years = Number(age);
  if (!Number.isFinite(years)) return { error: "Enter the teenager's age in years." };
  if (years < INSTAGRAM_MIN_AGE) {
    return {
      error: `Instagram's minimum age is ${INSTAGRAM_MIN_AGE}, so there is no account to configure yet.`,
    };
  }
  if (years > TEEN_ACCOUNT_MAX_AGE) {
    return {
      error: `From ${TEEN_ACCOUNT_MAX_AGE + 1} the account is an adult account and Teen Account protections no longer apply automatically.`,
    };
  }
  if (!VISIBILITY.some((item) => item.id === visibility)) {
    return { error: "Choose whether the account is private or public." };
  }
  if (!SUPERVISION_STATES.some((item) => item.id === supervision)) {
    return { error: "Choose whether parental supervision is linked." };
  }

  const quiet = computeQuietHours({ age: years, wakeTime });
  if (quiet.error) return { error: quiet.error };

  const doneSet = new Set(Array.isArray(completed) ? completed : []);
  const steps = STEPS.filter(
    (step) => step.visibility.includes(visibility) && step.supervision.includes(supervision),
  ).map((step) => ({ ...step, weight: TIER_WEIGHTS[step.tier], done: doneSet.has(step.id) }));

  const totalWeight = steps.reduce((sum, step) => sum + step.weight, 0);
  const doneWeight = steps.reduce((sum, step) => (step.done ? sum + step.weight : sum), 0);
  const score = totalWeight > 0 ? Math.round((doneWeight / totalWeight) * 100) : 0;

  const essentials = steps.filter((step) => step.tier === "essential");
  const essentialsMissing = essentials.filter((step) => !step.done).length;

  let band = bandFor(score);
  if (essentialsMissing > 0 && band.label === BANDS[0].label) band = BANDS[1];

  return {
    steps,
    totalSteps: steps.length,
    doneSteps: steps.filter((step) => step.done).length,
    remaining: steps.filter((step) => !step.done),
    totalWeight,
    doneWeight,
    score,
    band: band.label,
    tone: band.tone,
    essentialsTotal: essentials.length,
    essentialsMissing,
    quiet,
    parentApprovalNeeded: years <= PARENT_APPROVAL_MAX_AGE,
    dailyReminderMinutes: DAILY_REMINDER_MINUTES,
  };
}
