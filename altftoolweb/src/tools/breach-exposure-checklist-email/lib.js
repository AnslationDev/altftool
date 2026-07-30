/**
 * Email Data Breach Response Checklist — scoring and triage logic.
 *
 * Pure module: no React, no DOM, no clocks. Dates are always passed in as
 * arguments so the same input always produces the same output. Every exported
 * function is total — unusable input returns { error } instead of NaN or a
 * misleading number.
 *
 * The checklist models the one fact that makes a leaked email address
 * dangerous on its own: it is the username, and often the recovery contact,
 * for dozens of other accounts. The response is therefore split between
 * confirming what actually leaked, resetting the accounts that email
 * unlocks, locking those accounts down with a second factor, and staying
 * alert for the breach-themed phishing that follows almost every public leak.
 */

/**
 * Response windows. `days` is the age, in days from the moment you learned
 * about the exposure, at which an unfinished step in that window counts as
 * overdue. Confirming scope comes first because every later step depends on
 * knowing which accounts and data types were actually involved; resetting
 * passwords follows within the week, locking down with 2FA within the
 * month, and phishing vigilance is ongoing because scam mail referencing a
 * public breach can arrive months later.
 */
export const WINDOWS = [
  { id: "day1", label: "First 24 hours", days: 1 },
  { id: "week1", label: "First week", days: 7 },
  { id: "month1", label: "First month", days: 30 },
  { id: "ongoing", label: "Ongoing", days: 90 },
];

const WINDOW_BY_ID = new Map(WINDOWS.map((w) => [w.id, w]));

/**
 * The checklist.
 *
 * weight   = share of the 100-point response score. Weights rank risk: the
 *            email account itself and any reused password carry the most,
 *            because either one reopens accounts you already "fixed".
 * critical = leaving this open keeps the exposure fully exploitable, so it
 *            caps the score (see CRITICAL_CAP_PERCENT).
 */
export const CHECKLIST = [
  {
    id: "check-lookup",
    group: "Confirm the exposure",
    window: "day1",
    title: "Search the address at a reputable breach-lookup service",
    detail:
      "Check the email at a service such as Have I Been Pwned to see which breaches list it and, where shown, which data types were included — password, phone number, address or nothing beyond the email itself. That list decides how far the rest of this checklist needs to go.",
    weight: 9,
    critical: true,
  },
  {
    id: "note-breaches",
    group: "Confirm the exposure",
    window: "day1",
    title: "Write down which breaches and data types came back",
    detail:
      "List each breach name, its date, and what it exposed. A breach that leaked only the email is a phishing-targeting problem; one that also leaked a password is an account-takeover problem, and the two need different responses.",
    weight: 6,
  },
  {
    id: "check-inbox-notice",
    group: "Confirm the exposure",
    window: "day1",
    title: "Find the official notification and verify it before trusting it",
    detail:
      "If a company emailed you about the breach, locate that message and check the sender domain carefully. Breach notices are themselves impersonated, so confirm the notice on the company's own website rather than by clicking anything inside the email.",
    weight: 5,
  },

  {
    id: "reset-email-itself",
    group: "Reset passwords everywhere",
    window: "week1",
    title: "Reset the password on the email account itself first",
    detail:
      "The email account is the recovery path for almost everything else you own. Change its password before touching any other account, and pick a long, unique password stored in a password manager rather than memorised.",
    weight: 9,
    critical: true,
  },
  {
    id: "reset-reused",
    group: "Reset passwords everywhere",
    window: "week1",
    title: "Reset every account that reused the same or a similar password",
    detail:
      "Attackers automate credential stuffing: the leaked email-and-password pair is replayed against banks, shopping sites and social platforms within hours of a dump circulating. Any account sharing that password, or a close variant of it, needs a new unique one.",
    weight: 8,
    critical: true,
  },
  {
    id: "reset-financial",
    group: "Reset passwords everywhere",
    window: "week1",
    title: "Reset banking, payment and shopping accounts tied to this address",
    detail:
      "Work through the accounts that can move money or store a card first — bank, payment apps, online shopping with saved cards — even if their own password was not part of the leak, since the email is the username an attacker already has.",
    weight: 7,
    critical: true,
  },
  {
    id: "unique-passwords",
    group: "Reset passwords everywhere",
    window: "week1",
    title: "Switch to a unique, generated password per account",
    detail:
      "A password manager removes the temptation to reuse a password across accounts, which is what turned one leaked email into many compromised accounts in the first place.",
    weight: 6,
  },

  {
    id: "2fa-email",
    group: "Lock accounts with 2FA",
    window: "month1",
    title: "Turn on two-factor authentication on the email account",
    detail:
      "Because the inbox can approve password resets for other services, it deserves the strongest available second factor — an authenticator app or a passkey — before you move on to anything else.",
    weight: 8,
    critical: true,
  },
  {
    id: "2fa-financial",
    group: "Lock accounts with 2FA",
    window: "month1",
    title: "Enable 2FA on banking and other financial accounts",
    detail:
      "These are the accounts where a successful takeover causes direct financial loss, so they are the next priority for a second factor after the email account itself.",
    weight: 6,
    critical: true,
  },
  {
    id: "2fa-authenticator-app",
    group: "Lock accounts with 2FA",
    window: "month1",
    title: "Prefer an authenticator app or passkey over SMS codes",
    detail:
      "SMS codes can be intercepted through SIM-swap fraud, which is easier to pull off once an attacker already has your email and phone number from a leak. An authenticator app or a passkey does not depend on the phone network at all.",
    weight: 4,
  },
  {
    id: "backup-codes",
    group: "Lock accounts with 2FA",
    window: "month1",
    title: "Save the backup or recovery codes somewhere offline",
    detail:
      "Every 2FA setup offers one-time backup codes for when you lose the authenticator device. Store them somewhere other than the inbox they are meant to protect access to.",
    weight: 3,
  },

  {
    id: "verify-before-click",
    group: "Watch for breach-themed phishing",
    window: "ongoing",
    title: "Never click a reset or verify link in an unexpected email",
    detail:
      "Type the site's address into the browser directly instead of following a link, especially in any message that mentions the breach by name to sound credible. This single habit defeats most of the phishing that follows a public leak.",
    weight: 8,
    critical: true,
  },
  {
    id: "never-share-otp",
    group: "Watch for breach-themed phishing",
    window: "ongoing",
    title: "Never read a one-time code to anyone who calls you",
    detail:
      "A real support team never needs the code displayed on your screen. Anyone asking for it, especially while referencing details from the breach to sound legitimate, is trying to complete an account takeover in progress.",
    weight: 7,
    critical: true,
  },
  {
    id: "expect-phishing",
    group: "Watch for breach-themed phishing",
    window: "ongoing",
    title: "Expect messages that reference the breach to look convincing",
    detail:
      "Scam mail written around a real, named breach is far more persuasive than generic phishing because it cites a company and a date you recognise. Treat that specificity as a warning sign, not as proof the message is genuine.",
    weight: 6,
  },
  {
    id: "report-phishing",
    group: "Watch for breach-themed phishing",
    window: "ongoing",
    title: "Report suspicious messages instead of just deleting them",
    detail:
      "Use the mail provider's \"report phishing\" option and, where the message impersonates a company, forward it to that company's abuse address. Reporting gets the message blocked for other recipients too.",
    weight: 4,
  },
  {
    id: "recheck-lookup",
    group: "Watch for breach-themed phishing",
    window: "ongoing",
    title: "Recheck the breach-lookup service every few months",
    detail:
      "New breaches involving the same address surface for years after the original leak. A quarterly recheck catches a fresh exposure before it turns into a fresh round of resets.",
    weight: 4,
  },
];

/** Display order of the groups used by CHECKLIST. */
export const GROUPS = [
  "Confirm the exposure",
  "Reset passwords everywhere",
  "Lock accounts with 2FA",
  "Watch for breach-themed phishing",
];

/** Sum of all weights. The checklist is authored so that this equals 100. */
export const TOTAL_WEIGHT = CHECKLIST.reduce((sum, item) => sum + item.weight, 0);

/** Ticked at first paint because most people find the notice before acting on it. */
export const DEFAULT_DONE = ["check-inbox-notice"];

/** Bands as a percentage of TOTAL_WEIGHT; the first band the score reaches wins. */
export const BANDS = [
  { id: "resolved", min: 90, label: "Exposure handled", hint: "The leaked email no longer unlocks any account you own." },
  { id: "strong", min: 70, label: "Mostly handled", hint: "Good position. Finish the 2FA and phishing-watch steps." },
  { id: "partial", min: 40, label: "Partly handled", hint: "The lookup is done; the password resets are not finished yet." },
  { id: "exposed", min: 0, label: "Still exposed", hint: "The leaked email still works as a key into at least one account." },
];

/**
 * A missing critical step caps the band at "Partly handled": no amount of
 * phishing awareness compensates for an email account that still has its
 * pre-breach password and no second factor.
 */
export const CRITICAL_CAP_PERCENT = 69;

const BY_ID = new Map(CHECKLIST.map((item) => [item.id, item]));
const MS_PER_DAY = 86400000;

/** First band whose minimum the percent reaches. Percent is clamped to 0..100. */
export function bandFor(percent) {
  const value = Number.isFinite(percent) ? Math.min(100, Math.max(0, percent)) : 0;
  return BANDS.find((band) => value >= band.min) || BANDS[BANDS.length - 1];
}

/** Human label for a window id; unknown ids fall back to the last window. */
export function windowLabel(id) {
  const found = WINDOW_BY_ID.get(id);
  return found ? found.label : WINDOWS[WINDOWS.length - 1].label;
}

function normalise(doneIds) {
  const seen = new Set();
  for (const raw of doneIds) {
    if (typeof raw === "string" && BY_ID.has(raw)) seen.add(raw);
  }
  return seen;
}

function windowDays(id) {
  const found = WINDOW_BY_ID.get(id);
  return found ? found.days : WINDOWS[WINDOWS.length - 1].days;
}

/**
 * Score a set of completed step ids.
 * Unknown and duplicate ids are ignored so a stale list cannot inflate the score.
 *
 * @param {string[]} doneIds ids from CHECKLIST already completed.
 * @returns {object} summary, or { error } for unusable input.
 */
export function scoreChecklist(doneIds) {
  if (!Array.isArray(doneIds)) {
    return { error: "Completed steps must be provided as a list." };
  }
  if (!(TOTAL_WEIGHT > 0)) {
    return { error: "This checklist has no weighted steps to score." };
  }

  const done = normalise(doneIds);
  let points = 0;
  const remaining = [];
  const missingCritical = [];

  for (const item of CHECKLIST) {
    if (done.has(item.id)) {
      points += item.weight;
    } else {
      remaining.push(item);
      if (item.critical) missingCritical.push(item);
    }
  }

  const rawPercent = Math.round((points / TOTAL_WEIGHT) * 100);
  const capped = missingCritical.length > 0 && rawPercent > CRITICAL_CAP_PERCENT;
  const percent = capped ? CRITICAL_CAP_PERCENT : rawPercent;
  const band = bandFor(percent);

  const groups = GROUPS.map((name) => {
    const items = CHECKLIST.filter((item) => item.group === name);
    const doneCount = items.filter((item) => done.has(item.id)).length;
    return {
      name,
      done: doneCount,
      total: items.length,
      percent: items.length > 0 ? Math.round((doneCount / items.length) * 100) : 0,
    };
  });

  // Highest-impact unfinished steps first; criticals always outrank the rest.
  const nextActions = remaining
    .slice()
    .sort((a, b) => Number(b.critical) - Number(a.critical) || b.weight - a.weight)
    .slice(0, 3);

  return {
    points,
    maxPoints: TOTAL_WEIGHT,
    rawPercent,
    percent,
    capped,
    completed: done.size,
    total: CHECKLIST.length,
    band: band.id,
    bandLabel: band.label,
    bandHint: band.hint,
    remaining,
    missingCritical,
    groups,
    nextActions,
  };
}

/**
 * Whole days from one ISO date (YYYY-MM-DD) to another, using UTC midnights so
 * the result never shifts with the caller's time zone or with daylight saving.
 *
 * @param {string} fromISO earlier date, YYYY-MM-DD.
 * @param {string} toISO later date, YYYY-MM-DD.
 * @returns {{days:number}|{error:string}}
 */
export function daysBetween(fromISO, toISO) {
  const pattern = /^\d{4}-\d{2}-\d{2}$/;
  if (typeof fromISO !== "string" || !pattern.test(fromISO)) {
    return { error: "Enter the discovery date as YYYY-MM-DD." };
  }
  if (typeof toISO !== "string" || !pattern.test(toISO)) {
    return { error: "Enter the comparison date as YYYY-MM-DD." };
  }

  const from = Date.parse(`${fromISO}T00:00:00Z`);
  const to = Date.parse(`${toISO}T00:00:00Z`);
  if (!Number.isFinite(from) || !Number.isFinite(to)) {
    return { error: "That is not a real calendar date." };
  }

  const days = Math.round((to - from) / MS_PER_DAY);
  if (days < 0) {
    return { error: "The discovery date is in the future." };
  }
  return { days };
}

/**
 * Unfinished steps whose response window has already elapsed.
 *
 * @param {string[]} doneIds completed step ids.
 * @param {number} daysElapsed whole days since discovery.
 * @returns {{overdue:object[], dueSoon:object[], daysElapsed:number}|{error:string}}
 */
export function overdueSteps(doneIds, daysElapsed) {
  if (!Array.isArray(doneIds)) {
    return { error: "Completed steps must be provided as a list." };
  }
  const elapsed = Number(daysElapsed);
  if (!Number.isFinite(elapsed) || elapsed < 0) {
    return { error: "Days since discovery must be zero or more." };
  }

  const done = normalise(doneIds);
  const overdue = [];
  const dueSoon = [];

  for (const item of CHECKLIST) {
    if (done.has(item.id)) continue;
    const limit = windowDays(item.window);
    if (elapsed > limit) overdue.push(item);
    else dueSoon.push(item);
  }

  const byUrgency = (a, b) =>
    windowDays(a.window) - windowDays(b.window) ||
    Number(b.critical) - Number(a.critical) ||
    b.weight - a.weight;

  return {
    daysElapsed: elapsed,
    overdue: overdue.sort(byUrgency),
    dueSoon: dueSoon.sort(byUrgency),
  };
}
