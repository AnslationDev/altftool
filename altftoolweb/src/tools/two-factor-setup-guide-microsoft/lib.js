/**
 * Microsoft Account 2FA Guide — scoring logic.
 *
 * Pure module: no React, no DOM, no clocks. Every exported function is total —
 * unusable input returns { error } rather than NaN, Infinity or a wrong number.
 *
 * Menu paths follow account.microsoft.com > Security > Advanced security options, plus the privacy dashboard at account.microsoft.com/privacy.
 */

/**
 * The checklist itself.
 *
 * weight   = share of the 100-point hardening score this control carries. The
 *            weights are a risk ranking: controls that block a full account
 *            takeover (password, second factor, recovery codes) carry the most,
 *            exposure and hygiene controls carry the least.
 * critical = losing this single control is enough to lose the account, so it
 *            gates the top score bands (see CRITICAL_CAP_PERCENT).
 */
export const CHECKLIST = [
  {
    "id": "unique-password",
    "group": "Sign in and second factor",
    "title": "Use a unique password nothing else shares",
    "detail": "account.microsoft.com > Security > Change password. This one account often unlocks email, cloud files, Windows and purchases, so a password reused from a shopping site is the weakest possible link.",
    "weight": 10,
    "critical": true
  },
  {
    "id": "two-step-on",
    "group": "Sign in and second factor",
    "title": "Turn on two-step verification",
    "detail": "Security > Advanced security options > Two-step verification > Turn on. From then on, a sign-in from a new device needs your password plus an approval or code.",
    "weight": 14,
    "critical": true
  },
  {
    "id": "recovery-code",
    "group": "Sign in and second factor",
    "title": "Generate and store the recovery code",
    "detail": "Advanced security options > Recovery code. Microsoft issues a single 25-character code; generating a new one invalidates the old one, so store it offline and note where you put it.",
    "weight": 10,
    "critical": true
  },
  {
    "id": "security-info",
    "group": "Sign in and second factor",
    "title": "Keep alternate email and phone verified and current",
    "detail": "Advanced security options > Ways to prove who you are. Note that removing security info can take up to 30 days to take effect, a deliberate delay that also blocks an intruder from cutting you out.",
    "weight": 8,
    "critical": true
  },
  {
    "id": "authenticator-app",
    "group": "Sign in and second factor",
    "title": "Add Microsoft Authenticator for push approvals",
    "detail": "Approvals show a number you must type into the app, so a prompt you did not trigger cannot be approved by tapping yes out of habit. It also works with no mobile signal.",
    "weight": 8,
    "critical": false
  },
  {
    "id": "passwordless",
    "group": "Sign in and second factor",
    "title": "Consider going passwordless or adding a passkey",
    "detail": "Advanced security options > Passwordless account. With the password removed, sign-in uses the Authenticator app, Windows Hello, a security key or an emailed code, and there is no password left to phish or reuse.",
    "weight": 5,
    "critical": false
  },
  {
    "id": "sign-in-activity",
    "group": "Sessions and devices",
    "title": "Review recent sign-in activity",
    "detail": "Security > Sign-in activity lists each attempt with approximate location, device and whether it succeeded. Anything unfamiliar and successful means change the password now, then work through the rest of this list.",
    "weight": 6,
    "critical": false
  },
  {
    "id": "trusted-devices",
    "group": "Sessions and devices",
    "title": "Sign out everywhere and drop stale trusted devices",
    "detail": "Devices you marked as trusted skip the second factor. Clear that list after selling a laptop or phone, or after any suspected compromise.",
    "weight": 5,
    "critical": false
  },
  {
    "id": "app-passwords",
    "group": "Sessions and devices",
    "title": "Delete legacy app passwords",
    "detail": "Advanced security options > App passwords. These exist for old mail clients that cannot do two-step verification, and each one is a password that skips it entirely.",
    "weight": 5,
    "critical": false
  },
  {
    "id": "app-consents",
    "group": "Apps and privacy",
    "title": "Revoke third-party apps that hold account access",
    "detail": "account.microsoft.com/privacy > Apps and services you have given access to. Old games, mail tools and file sync utilities keep reading OneDrive or contacts long after uninstalling them.",
    "weight": 6,
    "critical": false
  },
  {
    "id": "privacy-dashboard",
    "group": "Apps and privacy",
    "title": "Clear stored search, browsing and location history",
    "detail": "The privacy dashboard lets you view and delete activity data tied to the account. Less stored history means less exposure if the account is ever opened by someone else.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "ad-personalisation",
    "group": "Apps and privacy",
    "title": "Turn off interest-based advertising",
    "detail": "The ad settings page in the privacy dashboard stops Microsoft using your account activity to build an ad profile. It changes what is inferred about you, not what is stored.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "outlook-rules",
    "group": "Mail and money",
    "title": "Check Outlook for forwarding rules and unfamiliar aliases",
    "detail": "Outlook Settings > Mail > Forwarding, and Rules. A quiet auto-forward or a rule that files bank mail into Archive is the standard way an intruder keeps reading your mail after you change the password.",
    "weight": 6,
    "critical": false
  },
  {
    "id": "windows-hello",
    "group": "Mail and money",
    "title": "Use Windows Hello and device encryption on your PC",
    "detail": "Windows Settings > Accounts > Sign-in options, plus Privacy & security > Device encryption. A PIN is tied to that one device, so it is useless to anyone who steals it from a server.",
    "weight": 5,
    "critical": false
  },
  {
    "id": "payments",
    "group": "Mail and money",
    "title": "Review saved payment methods and recurring billing",
    "detail": "account.microsoft.com > Payment options and Services & subscriptions. Remove cards you no longer use and check that every recurring charge is one you recognise.",
    "weight": 5,
    "critical": false
  }
];

/** Display order of the groups used by CHECKLIST. */
export const GROUPS = [
  "Sign in and second factor",
  "Sessions and devices",
  "Apps and privacy",
  "Mail and money"
];

/** Sum of all weights. The checklist is authored so that this equals 100. */
export const TOTAL_WEIGHT = CHECKLIST.reduce((sum, item) => sum + item.weight, 0);

/** Ids pre-ticked at first paint because nearly every account already has them. */
export const DEFAULT_DONE = [
  "unique-password",
  "security-info"
];

/**
 * Score bands as a percentage of TOTAL_WEIGHT. Read top-down: the first band
 * whose `min` the score reaches, wins.
 */
export const BANDS = [
  { id: "hardened", min: 90, label: "Hardened", hint: "A takeover would need your unlocked device in hand." },
  { id: "strong", min: 70, label: "Well protected", hint: "Solid. Close the last gaps when you have a spare minute." },
  { id: "partial", min: 40, label: "Partly protected", hint: "A leaked password plus a SIM swap could still get in." },
  { id: "at-risk", min: 0, label: "At risk", hint: "One leaked password is enough to take this account." },
];

/**
 * A missing critical control caps the band at "Partly protected". Rationale:
 * privacy and hygiene settings cannot compensate for an account that still has
 * an open takeover path, so the score must never read as safe while one exists.
 */
export const CRITICAL_CAP_PERCENT = 69;

const byId = new Map(CHECKLIST.map((item) => [item.id, item]));

/** First band whose minimum the percent reaches. Percent is clamped to 0..100. */
export function bandFor(percent) {
  const value = Number.isFinite(percent) ? Math.min(100, Math.max(0, percent)) : 0;
  return BANDS.find((band) => value >= band.min) || BANDS[BANDS.length - 1];
}

function normalise(doneIds) {
  const seen = new Set();
  for (const raw of doneIds) {
    if (typeof raw === "string" && byId.has(raw)) seen.add(raw);
  }
  return seen;
}

/**
 * Score a set of completed control ids. Unknown ids and duplicates are ignored
 * so a stale saved list can never inflate the score.
 *
 * @param {string[]} doneIds ids from CHECKLIST the user has completed.
 * @returns {object} score summary, or { error } for unusable input.
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
  const missingCritical = [];
  const remaining = [];

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

  // Highest-impact unfinished controls first; criticals always outrank the rest.
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
    missingCritical,
    remaining,
    groups,
    nextActions,
  };
}

/**
 * Shortest route from the current state to a target score.
 *
 * Greedy by weight, except that every missing critical control is forced in
 * first whenever the target sits above CRITICAL_CAP_PERCENT — without them the
 * cap makes the target unreachable however many other boxes are ticked.
 *
 * @param {string[]} doneIds completed control ids.
 * @param {number} targetPercent desired score, 0-100.
 */
export function planToTarget(doneIds, targetPercent) {
  const current = scoreChecklist(doneIds);
  if (current.error) return current;

  const target = Number(targetPercent);
  if (!Number.isFinite(target)) {
    return { error: "Enter a target score as a number between 0 and 100." };
  }
  if (target < 0 || target > 100) {
    return { error: "A target score has to be between 0 and 100." };
  }

  if (current.percent >= target) {
    return { reached: true, steps: [], addedPoints: 0, projectedPercent: current.percent };
  }

  const picked = [];
  const pickedIds = new Set();
  let points = current.points;

  if (target > CRITICAL_CAP_PERCENT) {
    for (const item of current.missingCritical) {
      picked.push(item);
      pickedIds.add(item.id);
      points += item.weight;
    }
  }

  const pool = current.remaining
    .filter((item) => !pickedIds.has(item.id))
    .slice()
    .sort((a, b) => b.weight - a.weight);

  for (const item of pool) {
    if (Math.round((points / TOTAL_WEIGHT) * 100) >= target) break;
    picked.push(item);
    pickedIds.add(item.id);
    points += item.weight;
  }

  const projected = scoreChecklist([
    ...doneIds.filter((id) => typeof id === "string"),
    ...picked.map((item) => item.id),
  ]);

  return {
    reached: projected.percent >= target,
    steps: picked,
    addedPoints: points - current.points,
    projectedPercent: projected.percent,
  };
}
