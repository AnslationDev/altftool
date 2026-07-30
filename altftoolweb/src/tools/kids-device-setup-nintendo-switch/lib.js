/**
 * Nintendo Switch parental controls planner.
 *
 * Pure logic: no React, no DOM, no clock reads.
 */

/** The Nintendo Switch Parental Controls app sets a daily play-time limit in 15-minute steps. */
export const PLAY_LIMIT_STEP_MINUTES = 15;
/** The shortest daily limit the app accepts. */
export const PLAY_LIMIT_MIN_MINUTES = 15;
/** The longest daily limit the app accepts (6 hours). */
export const PLAY_LIMIT_MAX_MINUTES = 6 * 60;

/** The console is linked to the app with a 6-digit registration code. */
export const REGISTRATION_CODE_DIGITS = 6;

/** A Nintendo Account family group holds up to 8 accounts. */
export const FAMILY_GROUP_MAX_ACCOUNTS = 8;

/** Nintendo states VR mode is for players aged 7 and older. */
export const VR_MIN_AGE = 7;

/**
 * Nintendo's built-in restriction presets, with the ages they are aimed at.
 * "Custom" exists as well and is what you use to mix age rating with the
 * communication and screenshot-posting switches independently.
 */
export const PRESETS = [
  { id: "child", label: "Child", maxAge: 8, blurb: "Youngest preset: tightest software rating, chat and screenshot posting blocked." },
  { id: "preteen", label: "Pre-Teen", maxAge: 12, blurb: "Middle preset: mid-range software rating, chat and posting still blocked." },
  { id: "teen", label: "Teen", maxAge: 17, blurb: "Loosest preset: higher software rating allowed, chat and posting still blocked by default." },
];

export const TIER_WEIGHTS = { essential: 3, recommended: 2, optional: 1 };

export const MODELS = [
  { id: "switch", label: "Nintendo Switch / Switch OLED / Switch Lite" },
  { id: "switch2", label: "Nintendo Switch 2" },
];

export const ONLINE_MODES = [
  { id: "offline", label: "Offline play only" },
  { id: "friends", label: "Online with friends they know" },
  { id: "open", label: "Online with anyone, plus voice chat" },
];

export const STEPS = [
  {
    id: "install-app",
    title: "Install the Nintendo Switch Parental Controls app and link the console",
    where: `App store > Nintendo Switch Parental Controls > enter the ${REGISTRATION_CODE_DIGITS}-digit registration code shown on the console`,
    why: "The console's built-in menu only covers the basics. Per-day limits, the monthly summary and remote changes only exist in the app.",
    tier: "essential",
    models: ["switch", "switch2"],
    modes: ["offline", "friends", "open"],
  },
  {
    id: "child-account",
    title: "Give the child their own Nintendo Account as a child account in your family group",
    where: "accounts.nintendo.com > Family group > Add a child account",
    why: `A child account is created and controlled by an adult, and a family group holds up to ${FAMILY_GROUP_MAX_ACCOUNTS} accounts. Below 13 in the US, and below 16 in much of Europe, a child account is required rather than optional.`,
    tier: "essential",
    models: ["switch", "switch2"],
    modes: ["offline", "friends", "open"],
  },
  {
    id: "pin",
    title: "Set a parental-controls PIN the child has not watched you type",
    where: "Parental Controls app > Console Settings > PIN",
    why: "The PIN is the only thing standing between a bored child and the settings screen; it is also needed to lift a limit for one evening.",
    tier: "essential",
    models: ["switch", "switch2"],
    modes: ["offline", "friends", "open"],
  },
  {
    id: "play-time-limit",
    title: "Set the daily play-time limit",
    where: "Parental Controls app > Play-Time Limit",
    why: `The app accepts ${PLAY_LIMIT_MIN_MINUTES} minutes to ${PLAY_LIMIT_MAX_MINUTES / 60} hours, in ${PLAY_LIMIT_STEP_MINUTES}-minute steps, and can differ for each day of the week.`,
    tier: "essential",
    models: ["switch", "switch2"],
    modes: ["offline", "friends", "open"],
  },
  {
    id: "suspend-software",
    title: "Turn on Suspend Software so the limit actually ends play",
    where: "Parental Controls app > Play-Time Limit > Suspend Software",
    why: "Without it the console only shows an alarm and the game keeps running, which turns the limit into a suggestion.",
    tier: "essential",
    models: ["switch", "switch2"],
    modes: ["offline", "friends", "open"],
  },
  {
    id: "bedtime-alarm",
    title: "Set the bedtime alarm as well as the daily total",
    where: "Parental Controls app > Play-Time Limit > Bedtime Alarm",
    why: "The daily total and the bedtime cut-off are separate rules — the alarm stops play at a fixed clock time regardless of how much was used.",
    tier: "recommended",
    models: ["switch", "switch2"],
    modes: ["offline", "friends", "open"],
  },
  {
    id: "restriction-preset",
    title: "Choose the restriction preset that matches their age",
    where: "Parental Controls app > Console Settings > Restricted Software",
    why: "The preset sets the software rating ceiling and switches off communication and screenshot posting in one move.",
    tier: "essential",
    models: ["switch", "switch2"],
    modes: ["offline", "friends", "open"],
  },
  {
    id: "custom-rating",
    title: "Use Custom settings if one game needs to be allowed above the ceiling",
    where: "Parental Controls app > Console Settings > Custom Settings, then Whitelisted Software",
    why: "Whitelisting a single title is better than raising the whole rating ceiling because a friend brought a game round.",
    tier: "optional",
    models: ["switch", "switch2"],
    modes: ["offline", "friends", "open"],
  },
  {
    id: "communication-restriction",
    title: "Keep 'Communicating with Others' restricted",
    where: "Parental Controls app > Console Settings > Custom Settings > Communicating with Others",
    why: "It blocks in-game text and voice interaction with other players in titles that support the setting.",
    tier: "essential",
    models: ["switch", "switch2"],
    modes: ["friends", "open"],
  },
  {
    id: "gamechat",
    title: "Decide about GameChat before they discover it",
    where: "Parental Controls app > Console Settings > GameChat, plus the console's GameChat setup",
    why: "GameChat carries live voice, video and screen sharing, so it needs an explicit decision rather than the default.",
    tier: "essential",
    models: ["switch2"],
    modes: ["friends", "open"],
  },
  {
    id: "screenshot-posting",
    title: "Keep social-media posting of screenshots and video restricted",
    where: "Parental Controls app > Console Settings > Custom Settings > Posting to Social Media",
    why: "It stops captures being posted straight from the console to an account you do not supervise.",
    tier: "recommended",
    models: ["switch", "switch2"],
    modes: ["offline", "friends", "open"],
  },
  {
    id: "eshop-purchases",
    title: "Restrict eShop purchases and remove the saved card",
    where: "Parental Controls app > Console Settings > Custom Settings > Nintendo eShop Purchases, then accounts.nintendo.com > Shop menu > Payment methods",
    why: "Removing the stored card is what actually blocks in-game currency purchases, because the restriction alone can be worked around with a gift-card balance.",
    tier: "essential",
    models: ["switch", "switch2"],
    modes: ["offline", "friends", "open"],
  },
  {
    id: "vr-mode",
    title: "Keep VR mode restricted for younger children",
    where: "Parental Controls app > Console Settings > Custom Settings > VR Mode",
    why: `Nintendo states VR mode is for ages ${VR_MIN_AGE} and up, and it is a separate switch from the software rating.`,
    tier: "recommended",
    models: ["switch"],
    modes: ["offline", "friends", "open"],
  },
  {
    id: "friend-requests",
    title: "Review the friend list and how friend requests are accepted",
    where: "Console > user profile > Friend List / Friend Suggestions",
    why: "Friend codes get posted in school group chats and on YouTube comments, so the list drifts if nobody checks it.",
    tier: "essential",
    models: ["switch", "switch2"],
    modes: ["friends", "open"],
  },
  {
    id: "online-membership",
    title: "Decide who pays for and manages Nintendo Switch Online",
    where: "accounts.nintendo.com > Shop menu > Nintendo Switch Online",
    why: "A family membership covers the whole group, so online play, and therefore exposure to other players, is switched on for everyone at once.",
    tier: "recommended",
    models: ["switch", "switch2"],
    modes: ["friends", "open"],
  },
  {
    id: "monthly-summary",
    title: "Read the monthly play summary",
    where: "Parental Controls app > Monthly Summary (also emailed)",
    why: "It shows which games and how long, which is a far better conversation starter than a blanket time cut.",
    tier: "optional",
    models: ["switch", "switch2"],
    modes: ["offline", "friends", "open"],
  },
  {
    id: "second-console-check",
    title: "Check the settings on every console they use, including a second one",
    where: "Each console is registered to the app separately",
    why: "Parental controls live on the console, not on the account, so a sibling's or a grandparent's Switch is unrestricted by default.",
    tier: "recommended",
    models: ["switch", "switch2"],
    modes: ["offline", "friends", "open"],
  },
  {
    id: "no-personal-info-rule",
    title: "Agree the rule: no real name, school or other apps shared with online players",
    where: "A conversation, not a setting",
    why: "Voice chat in Nintendo games usually happens through a phone or a third-party app, where none of these controls reach.",
    tier: "essential",
    models: ["switch", "switch2"],
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
 * Round a wanted daily allowance onto the grid the Parental Controls app accepts.
 * Returns the value that can actually be entered, and whether it had to move.
 */
export function normalisePlayLimit(minutes) {
  const wanted = Number(minutes);
  if (!Number.isFinite(wanted)) return { error: "Enter the daily play allowance in minutes." };
  if (wanted < 0) return { error: "A play-time allowance cannot be negative." };
  if (wanted === 0) {
    return {
      limitSet: false,
      requestedMinutes: 0,
      appliedMinutes: 0,
      adjusted: false,
      weeklyHours: 0,
      note: "No daily limit. The bedtime alarm can still end play at a fixed time.",
    };
  }
  const rounded = Math.round(wanted / PLAY_LIMIT_STEP_MINUTES) * PLAY_LIMIT_STEP_MINUTES;
  const applied = Math.min(Math.max(rounded, PLAY_LIMIT_MIN_MINUTES), PLAY_LIMIT_MAX_MINUTES);
  return {
    limitSet: true,
    requestedMinutes: wanted,
    appliedMinutes: applied,
    adjusted: applied !== wanted,
    weeklyHours: Math.round((applied * 7) / 60 * 100) / 100,
    note:
      applied === wanted
        ? "That value can be entered exactly."
        : `The app only accepts ${PLAY_LIMIT_MIN_MINUTES}–${PLAY_LIMIT_MAX_MINUTES} minutes in ${PLAY_LIMIT_STEP_MINUTES}-minute steps, so ${applied} minutes is the closest setting.`,
  };
}

/** The preset Nintendo aims at a child of this age. */
export function presetForAge(age) {
  const years = Number(age);
  if (!Number.isFinite(years) || years < 0) return { error: "Enter a valid age." };
  return PRESETS.find((preset) => years <= preset.maxAge) || PRESETS[PRESETS.length - 1];
}

/**
 * @param {object} input
 * @param {number} input.childAge
 * @param {string} input.model       one of MODELS ids
 * @param {string} input.onlineMode  one of ONLINE_MODES ids
 * @param {number} input.dailyMinutes
 * @param {string[]} [input.completed]
 */
export function buildPlan({ childAge, model, onlineMode, dailyMinutes, completed = [] } = {}) {
  const age = Number(childAge);
  if (!Number.isFinite(age)) return { error: "Enter the child's age in years." };
  if (age < 3 || age > 17) {
    return { error: "Enter an age between 3 and 17. Above 17 the account is no longer a child account." };
  }
  if (!MODELS.some((item) => item.id === model)) return { error: "Choose which Switch they use." };
  if (!ONLINE_MODES.some((item) => item.id === onlineMode)) {
    return { error: "Choose how they play with other people." };
  }

  const playLimit = normalisePlayLimit(dailyMinutes);
  if (playLimit.error) return { error: playLimit.error };

  const doneSet = new Set(Array.isArray(completed) ? completed : []);
  const steps = STEPS.filter(
    (step) => step.models.includes(model) && step.modes.includes(onlineMode),
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
    preset: presetForAge(age),
    playLimit,
    vrAllowed: age >= VR_MIN_AGE,
  };
}
