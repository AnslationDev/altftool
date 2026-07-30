/**
 * PlayStation family safety planner.
 *
 * Pure logic: no React, no DOM, no clock reads.
 */

/** A PSN account holder becomes an adult account at 18 in most regions; below that it is a child account. */
export const CHILD_ACCOUNT_MAX_AGE = 17;

/** Sony states PlayStation VR2 is not for use by children under 12. */
export const PSVR2_MIN_AGE = 12;

/** The PS5 System Restriction Passcode and the PS4 parental-control passcode both ship as 0000. */
export const DEFAULT_RESTRICTION_PASSCODE = "0000";

/** Days used to turn a per-day play allowance into a weekly total. */
export const SCHOOL_DAYS_PER_WEEK = 5;
export const WEEKEND_DAYS_PER_WEEK = 2;

/**
 * PEGI age labels. The ceiling is the highest label whose minimum age the
 * child has already reached.
 */
export const PEGI_LEVELS = [3, 7, 12, 16, 18];

/** ESRB rating categories and the minimum age each one is rated for. */
export const ESRB_LEVELS = [
  { label: "Everyone", minAge: 0 },
  { label: "Everyone 10+", minAge: 10 },
  { label: "Teen", minAge: 13 },
  { label: "Mature 17+", minAge: 17 },
  { label: "Adults Only 18+", minAge: 18 },
];

export const TIER_WEIGHTS = { essential: 3, recommended: 2, optional: 1 };

export const CONSOLES = [
  { id: "ps5", label: "PlayStation 5" },
  { id: "ps4", label: "PlayStation 4" },
  { id: "both", label: "Both consoles in the house" },
];

export const ONLINE_MODES = [
  { id: "offline", label: "Offline single-player only" },
  { id: "friends", label: "Online with real-life friends" },
  { id: "open", label: "Online with anyone, including voice chat" },
];

/**
 * consoles: which console the step applies to.
 * modes:    which online patterns the step applies to.
 */
export const STEPS = [
  {
    id: "family-manager",
    title: "Decide who the Family Manager is, and keep it an adult account",
    where: "Settings > Family and Parental Controls > Family Management",
    why: "Only the Family Manager can create child accounts, set spend caps and change restrictions. The role cannot be handed over casually.",
    tier: "essential",
    consoles: ["ps5", "ps4", "both"],
    modes: ["offline", "friends", "open"],
  },
  {
    id: "child-account",
    title: "Create a proper child account with the real date of birth",
    where: "Family Management > Add Family Member > Add a Child",
    why: "The date of birth drives every default: purchases, chat and which games will launch. A faked adult account removes all of them at once.",
    tier: "essential",
    consoles: ["ps5", "ps4", "both"],
    modes: ["offline", "friends", "open"],
  },
  {
    id: "age-level-games",
    title: "Set the age level for PS5 and PS4 games to the rating ceiling below",
    where: "Family Management > child > Parental Controls > Age Level for Games",
    why: "The console blocks anything rated above the level you pick, so a single setting covers every disc and download.",
    tier: "essential",
    consoles: ["ps5", "ps4", "both"],
    modes: ["offline", "friends", "open"],
  },
  {
    id: "spending-limit",
    title: "Set the monthly spending limit deliberately, not by default",
    where: "Family Management > child > Monthly Spending Limit",
    why: "A child account cannot add its own funds; it spends against the Family Manager's payment method up to whatever limit you set.",
    tier: "essential",
    consoles: ["ps5", "ps4", "both"],
    modes: ["offline", "friends", "open"],
  },
  {
    id: "communication-ugc",
    title: "Restrict Communication and User-Generated Content",
    where: "Family Management > child > Parental Controls > Communication and User-Generated Content",
    why: "One switch controls messages, voice chat, and viewing or sharing other players' screenshots, videos and streams.",
    tier: "essential",
    consoles: ["ps5", "ps4", "both"],
    modes: ["offline", "friends", "open"],
  },
  {
    id: "friend-requests",
    title: "Agree who counts as a friend, and review the friend list monthly",
    where: "Profile > Friends, on the child's account",
    why: "Once communication is allowed with friends, the friend list becomes the whole security boundary.",
    tier: "essential",
    consoles: ["ps5", "ps4", "both"],
    modes: ["friends", "open"],
  },
  {
    id: "voice-chat-review",
    title: "Decide about open voice chat in party and in-game lobbies",
    where: "Family Management > child > Communication, plus in-game voice settings",
    why: "Open lobby voice chat is unmoderated in most titles and is the usual route for abuse and for moving a child to another app.",
    tier: "essential",
    consoles: ["ps5", "ps4", "both"],
    modes: ["open"],
  },
  {
    id: "privacy-settings",
    title: "Tighten the account privacy settings",
    where: "Settings > Users and Accounts > Privacy > Personal Info | Messaging, Friends, Activity",
    why: "Privacy settings decide who can see their real name, activity feed, trophies and who can send them messages at all.",
    tier: "recommended",
    consoles: ["ps5", "ps4", "both"],
    modes: ["friends", "open"],
  },
  {
    id: "play-time",
    title: "Set play-time limits with a per-day allowance and an action",
    where: "Family Management > child > Play Time Settings — set the time zone first",
    why: "You choose whether the console just notifies at the limit or logs the child out, and you can restrict playable hours as well as total time.",
    tier: "recommended",
    consoles: ["ps5", "ps4", "both"],
    modes: ["offline", "friends", "open"],
  },
  {
    id: "restriction-passcode",
    title: `Change the restriction passcode away from ${DEFAULT_RESTRICTION_PASSCODE}`,
    where: "PS5: Settings > Users and Accounts > Other > System Restrictions. PS4: Settings > Parental Controls > PS4 System Restrictions",
    why: "The default passcode is published in the manual, so an unchanged code means the restrictions can be lifted by anyone who reads it.",
    tier: "essential",
    consoles: ["ps5", "ps4", "both"],
    modes: ["offline", "friends", "open"],
  },
  {
    id: "new-user-creation",
    title: "Block new user creation and guest login on the console",
    where: "PS5: Settings > Users and Accounts > Other > System Restrictions > Creating New Users and Guest Login",
    why: "Without this, a child simply makes a fresh unrestricted local user and every parental control is bypassed.",
    tier: "essential",
    consoles: ["ps5", "ps4", "both"],
    modes: ["offline", "friends", "open"],
  },
  {
    id: "web-browser",
    title: "Restrict the console web browser",
    where: "Family Management > child > Parental Controls > Use of Internet Browser",
    why: "The console browser sits outside the home network filter and any device-level content controls you already run.",
    tier: "recommended",
    consoles: ["ps5", "ps4", "both"],
    modes: ["offline", "friends", "open"],
  },
  {
    id: "psvr2-age",
    title: "Keep the PS VR2 restriction in place",
    where: "Family Management > child > Parental Controls > PS VR2",
    why: `Sony states PS VR2 is not for use by children under ${PSVR2_MIN_AGE}, and the headset restriction is a separate setting from the game age level.`,
    tier: "recommended",
    consoles: ["ps5", "both"],
    modes: ["offline", "friends", "open"],
  },
  {
    id: "two-factor",
    title: "Turn on two-step verification for the Family Manager account",
    where: "Account settings at account.sonyentertainmentnetwork.com > Security > 2-Step Verification",
    why: "The Family Manager account holds the payment method and can change every restriction, so it is the account worth protecting hardest.",
    tier: "recommended",
    consoles: ["ps5", "ps4", "both"],
    modes: ["offline", "friends", "open"],
  },
  {
    id: "remote-management",
    title: "Install the PlayStation App so limits can be changed away from the console",
    where: "PlayStation App > PlayStation Family / Family Management",
    why: "Being able to extend or cut play time from your phone stops the console setting becoming a nightly argument.",
    tier: "optional",
    consoles: ["ps5", "ps4", "both"],
    modes: ["offline", "friends", "open"],
  },
  {
    id: "play-time-emails",
    title: "Keep the play-time and purchase notification emails switched on",
    where: "Family Management > child > notification preferences",
    why: "The monthly summary is the easiest way to notice a change in habits without inspecting the console.",
    tier: "optional",
    consoles: ["ps5", "ps4", "both"],
    modes: ["offline", "friends", "open"],
  },
  {
    id: "report-tools",
    title: "Show them how to report and block a player",
    where: "Player profile > three dots > Block / Report, or the in-game report tool",
    why: "Blocking on PSN removes messages, party invites and friend requests from that account immediately.",
    tier: "recommended",
    consoles: ["ps5", "ps4", "both"],
    modes: ["friends", "open"],
  },
  {
    id: "no-personal-info-rule",
    title: "Agree the rule: no real name, school or other apps shared with online players",
    where: "A conversation, not a setting",
    why: "The common pattern is a friendly lobby contact moving the conversation to a chat app that has none of these controls.",
    tier: "essential",
    consoles: ["ps5", "ps4", "both"],
    modes: ["friends", "open"],
  },
];

export const BANDS = [
  { min: 90, label: "Locked down", tone: "success" },
  { min: 65, label: "Solid", tone: "success" },
  { min: 35, label: "Partial", tone: "warning" },
  { min: 0, label: "Unrestricted", tone: "danger" },
];

function bandFor(score) {
  return BANDS.find((band) => score >= band.min) || BANDS[BANDS.length - 1];
}

/**
 * Highest content rating the child's age already meets, in both rating systems.
 */
export function ratingCeiling(age) {
  const years = Number(age);
  if (!Number.isFinite(years) || years < 0) return { error: "Enter a valid age." };
  const pegi = PEGI_LEVELS.filter((level) => level <= years).pop() ?? PEGI_LEVELS[0];
  const esrbMatches = ESRB_LEVELS.filter((level) => level.minAge <= years);
  const esrb = esrbMatches[esrbMatches.length - 1] || ESRB_LEVELS[0];
  return { pegi: `PEGI ${pegi}`, pegiNumber: pegi, esrb: esrb.label };
}

/**
 * Turn a per-day allowance into a weekly total.
 */
export function weeklyPlayTime({ weekdayMinutes, weekendMinutes } = {}) {
  const weekday = Number(weekdayMinutes);
  const weekend = Number(weekendMinutes);
  if (!Number.isFinite(weekday) || !Number.isFinite(weekend)) {
    return { error: "Enter both play-time allowances in minutes." };
  }
  if (weekday < 0 || weekend < 0) return { error: "Play-time allowances cannot be negative." };
  if (weekday > 1440 || weekend > 1440) {
    return { error: "A daily allowance cannot be more than 1440 minutes (24 hours)." };
  }
  const totalMinutes = weekday * SCHOOL_DAYS_PER_WEEK + weekend * WEEKEND_DAYS_PER_WEEK;
  return {
    weekdayMinutes: weekday,
    weekendMinutes: weekend,
    totalMinutes,
    totalHours: Math.round((totalMinutes / 60) * 100) / 100,
    averageDailyMinutes: Math.round(totalMinutes / 7),
  };
}

/**
 * @param {object} input
 * @param {number} input.childAge
 * @param {string} input.console      one of CONSOLES ids
 * @param {string} input.onlineMode   one of ONLINE_MODES ids
 * @param {number} input.weekdayMinutes
 * @param {number} input.weekendMinutes
 * @param {string[]} [input.completed]
 */
export function buildPlan({
  childAge,
  console: consoleId,
  onlineMode,
  weekdayMinutes,
  weekendMinutes,
  completed = [],
} = {}) {
  const age = Number(childAge);
  if (!Number.isFinite(age)) return { error: "Enter the child's age in years." };
  if (age < 3 || age > CHILD_ACCOUNT_MAX_AGE) {
    return {
      error: `Enter an age between 3 and ${CHILD_ACCOUNT_MAX_AGE}. From ${CHILD_ACCOUNT_MAX_AGE + 1} the PSN account is an adult account and family controls no longer apply.`,
    };
  }
  if (!CONSOLES.some((item) => item.id === consoleId)) return { error: "Choose the console." };
  if (!ONLINE_MODES.some((item) => item.id === onlineMode)) {
    return { error: "Choose how they play online." };
  }

  const playTime = weeklyPlayTime({ weekdayMinutes, weekendMinutes });
  if (playTime.error) return { error: playTime.error };

  const doneSet = new Set(Array.isArray(completed) ? completed : []);
  const steps = STEPS.filter(
    (step) => step.consoles.includes(consoleId) && step.modes.includes(onlineMode),
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
    rating: ratingCeiling(age),
    playTime,
    psvr2Allowed: age >= PSVR2_MIN_AGE,
  };
}
