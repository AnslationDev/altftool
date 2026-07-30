/**
 * Password Reuse Breach Checklist — scoring and blast-radius logic.
 *
 * Pure module: no React, no DOM, no clocks. Dates are always passed in as
 * arguments so the same input always produces the same output. Every exported
 * function is total — unusable input returns { error } instead of NaN or a
 * misleading number.
 *
 * A reused password turns one breach into many. The one fact that makes this
 * different from a single-account compromise is that the breached site is
 * rarely the real target: it is the list of every other account that shares
 * the same password that decides how bad the incident is. The checklist is
 * therefore split between containing the breached account today, rotating the
 * reused password everywhere in priority order, adding 2FA as a backstop that
 * survives the next reuse, and switching to a password manager so there is no
 * "everywhere" left to rotate next time.
 */

/**
 * Response windows. `days` is the age, in days from the moment you learned about
 * the breach, at which an unfinished step in that window counts as overdue.
 * Credential stuffing is automated and starts within hours of a dump going
 * public, so the first window here is tighter than a typical exposure checklist.
 */
export const WINDOWS = [
  { id: "day1", label: "First 24 hours", days: 1 },
  { id: "week1", label: "First week", days: 7 },
  { id: "month1", label: "First month", days: 30 },
  { id: "ongoing", label: "Ongoing", days: 90 },
];

const WINDOW_BY_ID = new Map(WINDOWS.map((w) => [w.id, w]));

/**
 * Account categories that may also use the breached password.
 *
 * `points` ranks how far a credential-stuffing hit on that category can spread:
 * the primary email and banking accounts can each be used to reset or drain
 * other accounts, so they carry the most weight; a forum or streaming login
 * carries the least.
 */
export const ACCOUNT_CATEGORIES = [
  { id: "primaryEmail", label: "Primary email account", points: 6 },
  { id: "banking", label: "Banking, payment or investment account", points: 6 },
  { id: "workSso", label: "Work account or single sign-on", points: 4 },
  { id: "cloudStorage", label: "Cloud storage or device backup account", points: 3 },
  { id: "shopping", label: "Shopping account with a saved card", points: 3 },
  { id: "social", label: "Social media or messaging account", points: 2 },
  { id: "other", label: "Any other account (forums, streaming, utilities)", points: 1 },
];

const CATEGORY_BY_ID = new Map(ACCOUNT_CATEGORIES.map((field) => [field.id, field]));

/** The breached site itself always counts, even before anything else is ticked. */
export const BREACH_BASE_POINTS = 2;

/** Maximum blast-radius score: the breached site plus every category. */
export const MAX_EXPOSURE_POINTS =
  ACCOUNT_CATEGORIES.reduce((sum, field) => sum + field.points, 0) + BREACH_BASE_POINTS;

/**
 * Blast-radius tiers, read top-down: the first tier the score reaches wins.
 */
export const EXPOSURE_TIERS = [
  {
    id: "takeover-chain",
    min: 14,
    label: "Full takeover chain",
    hint: "The reused password reaches your email or your money. A credential-stuffing hit here can cascade into resets across everything else you own.",
  },
  {
    id: "high-value",
    min: 9,
    label: "High-value accounts exposed",
    hint: "Several accounts worth protecting share the password. Rotate in priority order rather than alphabetically or by memory.",
  },
  {
    id: "moderate",
    min: 4,
    label: "Moderate spread",
    hint: "A handful of accounts share the password. Still worth rotating all of them — attackers try the same pair everywhere automatically.",
  },
  {
    id: "contained",
    min: 0,
    label: "Mostly contained",
    hint: "As far as you can tell the password was not reused widely. Rotate the breached account anyway and confirm the rest.",
  },
];

/**
 * The checklist.
 *
 * weight   = share of the 100-point response score. Weights are a risk ranking:
 *            steps that stop the reused password from being tried elsewhere, or
 *            that close the email/financial reset path, carry the most.
 * critical = leaving this open keeps credential stuffing fully viable, so it
 *            caps the score (see CRITICAL_CAP_PERCENT).
 */
export const CHECKLIST = [
  {
    id: "confirm-breach",
    group: "Contain it right now",
    window: "day1",
    title: "Confirm which site was breached and what leaked",
    detail:
      "Read the breach notice or a breach-checking service for the exact fields exposed — email, username and password are the ones that matter for reuse. A leaked password hash is treated as cracked the moment it is public; assume the plain password is known.",
    weight: 5,
  },
  {
    id: "identify-reused",
    group: "Contain it right now",
    window: "day1",
    title: "List every other account that uses the same password",
    detail:
      "This is the step that decides how bad the breach actually is. Check a password manager's reuse warning if you have one, or think through email, banking, work, shopping and social logins one by one. Every account on the list needs a new password, not just the breached one.",
    weight: 10,
    critical: true,
  },
  {
    id: "rotate-breached-site",
    group: "Contain it right now",
    window: "day1",
    title: "Change the password on the breached site itself",
    detail:
      "Do this first and use a password that has never been used anywhere else. Leaving the breached account on the leaked password is what lets an automated credential-stuffing run confirm the pair still works before trying it elsewhere.",
    weight: 9,
    critical: true,
  },
  {
    id: "check-recent-activity",
    group: "Contain it right now",
    window: "day1",
    title: "Check the breached account for logins or orders you did not make",
    detail:
      "Look at the account's sign-in history and, on shopping or financial accounts, recent orders and transactions. Evidence of activity you did not do means the response moves from precaution to active incident.",
    weight: 5,
  },

  {
    id: "rotate-email",
    group: "Rotate the accounts that matter most",
    window: "week1",
    title: "Rotate the password on your primary email account first",
    detail:
      "Email is the account that resets every other account, so it goes before anything else on the reused list even if it was not the one breached. A unique password here limits how far the breach can spread regardless of what else you get to this week.",
    weight: 10,
    critical: true,
  },
  {
    id: "rotate-financial",
    group: "Rotate the accounts that matter most",
    window: "week1",
    title: "Rotate banking, payment and investment account passwords",
    detail:
      "These carry the most direct financial harm, so they come second. Use a different unique password on each one — reusing one new password across all of them just recreates the same problem with a fresher string.",
    weight: 9,
    critical: true,
  },
  {
    id: "revoke-sessions",
    group: "Rotate the accounts that matter most",
    window: "week1",
    title: "Sign out other sessions and devices on every account you rotate",
    detail:
      "Changing a password does not always end an already-open session. Use each account's \"sign out everywhere\" or \"manage devices\" option so a session opened with the old password stops working too.",
    weight: 5,
  },
  {
    id: "rotate-work",
    group: "Rotate the accounts that matter most",
    window: "week1",
    title: "Rotate your work account or single sign-on password",
    detail:
      "A work SSO login often unlocks internal tools, shared drives and other employees' trust in messages from you. Tell your IT or security team about the breach if the same password was ever used there.",
    weight: 4,
  },
  {
    id: "rotate-shopping",
    group: "Rotate the accounts that matter most",
    window: "week1",
    title: "Rotate shopping accounts that hold a saved card",
    detail:
      "A stored card turns a reused password into a route to fraudulent purchases. Rotate these before less sensitive accounts, and review saved payment methods while you are there.",
    weight: 4,
  },
  {
    id: "rotate-social",
    group: "Rotate the accounts that matter most",
    window: "week1",
    title: "Rotate social, messaging and remaining low-value accounts",
    detail:
      "Lower financial stakes, but a taken-over social or messaging account is commonly used to phish your contacts. Work through the rest of the reused-password list until nothing is left on it.",
    weight: 2,
  },

  {
    id: "enable-2fa-email",
    group: "Add a 2FA backstop",
    window: "week1",
    title: "Turn on app-based two-factor authentication for your primary email",
    detail:
      "2FA is the backstop for the next password you accidentally reuse: even a correct password stops being enough on its own. Email goes first because it is the account every other reset flows through.",
    weight: 8,
    critical: true,
  },
  {
    id: "enable-2fa-financial",
    group: "Add a 2FA backstop",
    window: "week1",
    title: "Turn on two-factor authentication for banking and payment accounts",
    detail:
      "Most banks and payment providers offer an authenticator-app or push-based option beyond a text message. Enable it on every account that moves money.",
    weight: 6,
    critical: true,
  },
  {
    id: "authenticator-not-sms",
    group: "Add a 2FA backstop",
    window: "week1",
    title: "Prefer an authenticator app or passkey over SMS codes",
    detail:
      "SMS codes are better than nothing, but a SIM swap defeats them without needing the password at all. Where an account offers an authenticator app or a passkey, switch to it instead of text messages.",
    weight: 4,
  },
  {
    id: "enable-2fa-other",
    group: "Add a 2FA backstop",
    window: "week1",
    title: "Turn on 2FA everywhere else it is offered",
    detail:
      "Work through the remaining rotated accounts and enable 2FA on each one that supports it, starting with whichever has the most personal data or the most contacts attached.",
    weight: 3,
  },

  {
    id: "password-manager",
    group: "Stop reusing passwords for good",
    window: "month1",
    title: "Set up a password manager",
    detail:
      "Reuse happens because remembering a different strong password for every account is not realistic without help. A password manager generates and fills one, so the easy option and the safe option become the same option.",
    weight: 6,
  },
  {
    id: "generate-unique",
    group: "Stop reusing passwords for good",
    window: "month1",
    title: "Replace remaining reused passwords with generated unique ones",
    detail:
      "Rotating the accounts on today's list stops this breach; replacing every other reused password stops the next one. Work through the password manager's reuse or weak-password report until the count reaches zero.",
    weight: 5,
  },
  {
    id: "breach-alerts",
    group: "Stop reusing passwords for good",
    window: "ongoing",
    title: "Set up breach-monitoring alerts for your email addresses",
    detail:
      "A free breach-notification service tells you when an email address shows up in a new dump, often before the affected site announces it. That earlier warning is what makes the next response faster than this one.",
    weight: 3,
  },
  {
    id: "audit-old-accounts",
    group: "Stop reusing passwords for good",
    window: "ongoing",
    title: "Close or update stale accounts still holding the old password",
    detail:
      "An account you forgot about is still a working copy of the reused password sitting in someone else's database. Close what you no longer use, and update what you are keeping.",
    weight: 2,
  },
];

/** Display order of the groups used by CHECKLIST. */
export const GROUPS = [
  "Contain it right now",
  "Rotate the accounts that matter most",
  "Add a 2FA backstop",
  "Stop reusing passwords for good",
];

/** Sum of all weights. The checklist is authored so that this equals 100. */
export const TOTAL_WEIGHT = CHECKLIST.reduce((sum, item) => sum + item.weight, 0);

/** Ticked at first paint because reaching this tool usually means the breach is already confirmed. */
export const DEFAULT_DONE = ["confirm-breach"];

/** Categories assumed shared at first paint — email is the most common realisation. */
export const DEFAULT_CATEGORIES = ["primaryEmail"];

/** Bands as a percentage of TOTAL_WEIGHT; the first band the score reaches wins. */
export const BANDS = [
  { id: "resolved", min: 90, label: "Breach contained", hint: "The reused password no longer works anywhere it mattered, and 2FA covers what is left." },
  { id: "strong", min: 70, label: "Mostly contained", hint: "The accounts that matter most are rotated. Finish the lower-priority ones and the manager switch." },
  { id: "partial", min: 40, label: "Partly contained", hint: "Some rotation is done, but a critical account or the 2FA backstop is still open." },
  { id: "exposed", min: 0, label: "Still exposed", hint: "The reused password is likely still valid on at least one account that matters." },
];

/**
 * A missing critical step caps the band at "Partly contained": rotating minor
 * accounts does not compensate for an email, banking or 2FA gap the reused
 * password can still walk through.
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

function normalise(ids, lookup) {
  const seen = new Set();
  for (const raw of ids) {
    if (typeof raw === "string" && lookup.has(raw)) seen.add(raw);
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

  const done = normalise(doneIds, BY_ID);
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
 * How far a credential-stuffing hit on the reused password could spread.
 * The breached site itself always counts, so the floor is BREACH_BASE_POINTS.
 *
 * `chainRisk` marks the case where the reused password reaches the primary
 * email or a banking account, since either one can be used to reset or drain
 * accounts beyond itself — that is treated as the top tier however few other
 * categories were ticked, because points alone would understate it.
 *
 * @param {string[]} categoryIds ids from ACCOUNT_CATEGORIES that also share the password.
 * @returns {object} blast-radius summary, or { error } for unusable input.
 */
export function exposureScore(categoryIds) {
  if (!Array.isArray(categoryIds)) {
    return { error: "Shared account categories must be provided as a list." };
  }

  const shared = normalise(categoryIds, CATEGORY_BY_ID);
  let points = BREACH_BASE_POINTS;
  const included = [];

  for (const field of ACCOUNT_CATEGORIES) {
    if (shared.has(field.id)) {
      points += field.points;
      included.push(field);
    }
  }

  const chainRisk = shared.has("primaryEmail") || shared.has("banking");

  const tier = chainRisk
    ? EXPOSURE_TIERS[0]
    : EXPOSURE_TIERS.find((entry) => points >= entry.min) ||
      EXPOSURE_TIERS[EXPOSURE_TIERS.length - 1];

  const percent =
    MAX_EXPOSURE_POINTS > 0 ? Math.round((points / MAX_EXPOSURE_POINTS) * 100) : 0;

  return {
    points,
    maxPoints: MAX_EXPOSURE_POINTS,
    percent,
    chainRisk,
    tier: tier.id,
    tierLabel: tier.label,
    tierHint: tier.hint,
    included,
    sharedCount: shared.size,
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

  const done = normalise(doneIds, BY_ID);
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
