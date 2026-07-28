/**
 * GitHub 2FA Setup Guide — scoring logic.
 *
 * Pure module: no React, no DOM, no clocks. Every exported function is total —
 * unusable input returns { error } rather than NaN, Infinity or a wrong number.
 *
 * Menu paths follow github.com/settings: Password and authentication, Sessions, Applications, Developer settings and Emails.
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
    "title": "Use a unique password stored in a password manager",
    "detail": "Settings > Password and authentication > Change password. GitHub blocks passwords it finds in known breach corpora, but it cannot tell that you reused the one from your personal email.",
    "weight": 10,
    "critical": true
  },
  {
    "id": "totp-app",
    "group": "Sign in and second factor",
    "title": "Register an authenticator app as your primary 2FA method",
    "detail": "Settings > Password and authentication > Two-factor authentication > Enable. Scan the QR code with any TOTP app. Two-factor authentication is mandatory on GitHub.com for accounts that contribute code, so this one is not optional.",
    "weight": 14,
    "critical": true
  },
  {
    "id": "recovery-codes",
    "group": "Sign in and second factor",
    "title": "Download and store the 16 recovery codes",
    "detail": "GitHub issues 16 single-use recovery codes when 2FA is enabled and offers a download. Keep them somewhere you can reach without your laptop, because they are the only self-service way back in.",
    "weight": 10,
    "critical": true
  },
  {
    "id": "verify-email",
    "group": "Sign in and second factor",
    "title": "Confirm your primary email is verified and still yours",
    "detail": "Settings > Emails. An unverified or abandoned primary address blocks account recovery and, on some plans, blocks pushing to repositories.",
    "weight": 7,
    "critical": true
  },
  {
    "id": "security-key",
    "group": "Sign in and second factor",
    "title": "Add a passkey or hardware security key",
    "detail": "Settings > Password and authentication > Passkeys, or Security keys. WebAuthn credentials are bound to github.com, so a phishing page that proxies your password and TOTP code still cannot use them.",
    "weight": 6,
    "critical": false
  },
  {
    "id": "remove-sms",
    "group": "Sign in and second factor",
    "title": "Remove SMS as a fallback second factor",
    "detail": "If a phone number is still listed as a 2FA method, delete it once the app and recovery codes work. SMS is the weakest option GitHub offers and it is the one a SIM swap defeats.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "github-mobile",
    "group": "Sign in and second factor",
    "title": "Add GitHub Mobile as a second 2FA method",
    "detail": "Signing in to the GitHub Mobile app registers it as an approval method, giving you a backup that does not depend on the same authenticator app you might lose.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "token-audit",
    "group": "Tokens and keys",
    "title": "Audit personal access tokens and delete unused ones",
    "detail": "Settings > Developer settings > Personal access tokens. Prefer fine-grained tokens scoped to specific repositories, and set an expiry; fine-grained tokens allow a maximum lifetime of 366 days rather than never expiring.",
    "weight": 8,
    "critical": false
  },
  {
    "id": "ssh-key-audit",
    "group": "Tokens and keys",
    "title": "Remove SSH keys from machines you no longer use",
    "detail": "Settings > SSH and GPG keys shows each key with its last-used date. Old laptops, retired CI runners and work machines you handed back should not still hold push access.",
    "weight": 6,
    "critical": false
  },
  {
    "id": "vigilant-mode",
    "group": "Tokens and keys",
    "title": "Sign your commits and switch on vigilant mode",
    "detail": "Add a GPG or SSH signing key, then enable Flag unsigned commits as unverified. Anyone can set your name and email in a commit; vigilant mode makes forged authorship visible as Unverified.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "sessions",
    "group": "Sessions and apps",
    "title": "Review web sessions and sign out of unfamiliar ones",
    "detail": "Settings > Sessions lists active browser sessions with device and location. End anything you do not recognise, then rotate the password and tokens if you find one.",
    "weight": 6,
    "critical": false
  },
  {
    "id": "oauth-apps",
    "group": "Sessions and apps",
    "title": "Revoke OAuth apps and GitHub Apps you no longer use",
    "detail": "Settings > Applications > Authorized OAuth Apps and Authorized GitHub Apps. CI services, code-review bots and side-project tools often hold repo scope for years after you stop using them.",
    "weight": 6,
    "critical": false
  },
  {
    "id": "security-log",
    "group": "Sessions and apps",
    "title": "Read the security log for events you did not cause",
    "detail": "Settings > Security log records key additions, 2FA changes, token creation and org membership changes. Scan it after any password reset or suspicious email.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "email-privacy",
    "group": "Exposure",
    "title": "Keep your email private and block pushes that expose it",
    "detail": "Settings > Emails > Keep my email addresses private, plus Block command line pushes that expose my email. Otherwise every commit publishes an address that gets scraped for targeted phishing.",
    "weight": 6,
    "critical": false
  },
  {
    "id": "push-protection",
    "group": "Exposure",
    "title": "Turn on secret scanning push protection for your repositories",
    "detail": "Settings > Code security, or the same tab on each repository. Push protection blocks a commit that contains a recognisable API key at push time, which is far cheaper than rotating a leaked key later.",
    "weight": 6,
    "critical": false
  }
];

/** Display order of the groups used by CHECKLIST. */
export const GROUPS = [
  "Sign in and second factor",
  "Tokens and keys",
  "Sessions and apps",
  "Exposure"
];

/** Sum of all weights. The checklist is authored so that this equals 100. */
export const TOTAL_WEIGHT = CHECKLIST.reduce((sum, item) => sum + item.weight, 0);

/** Ids pre-ticked at first paint because nearly every account already has them. */
export const DEFAULT_DONE = [
  "unique-password",
  "verify-email"
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
