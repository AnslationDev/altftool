/**
 * Apple ID 2FA Setup Guide — scoring logic.
 *
 * Pure module: no React, no DOM, no clocks. Every exported function is total —
 * unusable input returns { error } rather than NaN, Infinity or a wrong number.
 *
 * Menu paths follow Settings > [your name] > Sign-In & Security on iPhone and iPad, System Settings > Apple Account on Mac, and account.apple.com on the web. Apple ID is now branded Apple Account; the settings are the same.
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
    "id": "two-factor-on",
    "group": "Two-factor and recovery",
    "title": "Confirm two-factor authentication is switched on",
    "detail": "Settings > [your name] > Sign-In & Security > Two-Factor Authentication. Signing in on a new device then needs your password plus a 6-digit code shown on a trusted device or sent to a trusted number.",
    "weight": 14,
    "critical": true
  },
  {
    "id": "device-passcode",
    "group": "Two-factor and recovery",
    "title": "Set a strong device passcode, not a 4-digit one",
    "detail": "Settings > Face ID & Passcode > Change Passcode > Passcode Options, then pick a custom alphanumeric code. The verification code appears on the unlocked device, so the passcode is the real second factor.",
    "weight": 10,
    "critical": true
  },
  {
    "id": "trusted-numbers",
    "group": "Two-factor and recovery",
    "title": "Keep at least two trusted phone numbers",
    "detail": "Sign-In & Security > Trusted Phone Numbers. A second number, ideally a family member's, is what saves you when your only phone is lost, stolen or out of service.",
    "weight": 8,
    "critical": true
  },
  {
    "id": "recovery-contact",
    "group": "Two-factor and recovery",
    "title": "Add an account recovery contact",
    "detail": "Sign-In & Security > Account Recovery. A recovery contact can generate a code that lets you back in without waiting out Apple's account recovery process, which can take days.",
    "weight": 8,
    "critical": true
  },
  {
    "id": "recovery-key",
    "group": "Two-factor and recovery",
    "title": "Decide deliberately about a recovery key",
    "detail": "Sign-In & Security > Recovery Key generates a 28-character key. It blocks anyone from social-engineering their way through Apple support, but it also switches off standard account recovery, so losing the key and your devices means losing the account for good.",
    "weight": 6,
    "critical": false
  },
  {
    "id": "legacy-contact",
    "group": "Two-factor and recovery",
    "title": "Name a legacy contact",
    "detail": "Sign-In & Security > Legacy Contact lets someone you choose request access to your account data after your death, with an access key and a death certificate. Without one, that data is usually unreachable.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "stolen-device-protection",
    "group": "Device protection",
    "title": "Turn on Stolen Device Protection",
    "detail": "Settings > Face ID & Passcode > Stolen Device Protection, on iOS 17.3 or later. Away from familiar locations it requires Face ID or Touch ID with no passcode fallback, and adds an hour-long delay before sensitive changes such as altering the Apple Account password.",
    "weight": 8,
    "critical": false
  },
  {
    "id": "find-my",
    "group": "Device protection",
    "title": "Keep Find My and Activation Lock enabled",
    "detail": "Settings > [your name] > Find My > Find My iPhone, with Find My network and Send Last Location on. Activation Lock ties the device to your account so a thief cannot resell a wiped phone.",
    "weight": 5,
    "critical": false
  },
  {
    "id": "lock-screen-exposure",
    "group": "Device protection",
    "title": "Trim what is reachable from the lock screen",
    "detail": "Under Face ID & Passcode, review Allow Access When Locked. Control Centre, Reply with Message, Siri and USB accessories are the items most often used to interfere with a phone that is not yours.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "device-list",
    "group": "Account hygiene",
    "title": "Remove devices you no longer own",
    "detail": "Settings > [your name] shows every signed-in device. Each one can display verification codes, so a sold iPad or an old Mac left on the list is a live second factor in someone else's hands.",
    "weight": 6,
    "critical": false
  },
  {
    "id": "app-specific-passwords",
    "group": "Account hygiene",
    "title": "Revoke app-specific passwords you do not recognise",
    "detail": "account.apple.com > Sign-In and Security > App-Specific Passwords. These bypass two-factor authentication for older mail and calendar clients, so any you cannot account for should be removed.",
    "weight": 5,
    "critical": false
  },
  {
    "id": "sign-in-with-apple",
    "group": "Account hygiene",
    "title": "Review apps using Sign in with Apple",
    "detail": "Sign-In & Security > Apps Using Apple Account. Stop using the ones you have abandoned, and prefer Hide My Email when signing up so a future breach at that app cannot link back to your real address.",
    "weight": 5,
    "critical": false
  },
  {
    "id": "rescue-email",
    "group": "Account hygiene",
    "title": "Check the reachable-at email addresses are current",
    "detail": "Sign-In & Security > Reachable At. Security notices and recovery links go to these addresses, so remove any old work or school address you can no longer open.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "advanced-data-protection",
    "group": "iCloud data",
    "title": "Consider Advanced Data Protection for iCloud",
    "detail": "Settings > [your name] > iCloud > Advanced Data Protection, on iOS 16.2 or later. It end-to-end encrypts most iCloud categories including backups and Photos, which also means Apple cannot help you recover them, so a recovery contact or recovery key must be in place first.",
    "weight": 8,
    "critical": false
  },
  {
    "id": "code-phishing",
    "group": "iCloud data",
    "title": "Never read a verification code out to anyone",
    "detail": "Apple does not phone, message or email you asking for a verification code, an Apple Account password or a screen-sharing session. Anyone who does is running the takeover, not preventing it.",
    "weight": 6,
    "critical": false
  }
];

/** Display order of the groups used by CHECKLIST. */
export const GROUPS = [
  "Two-factor and recovery",
  "Device protection",
  "Account hygiene",
  "iCloud data"
];

/** Sum of all weights. The checklist is authored so that this equals 100. */
export const TOTAL_WEIGHT = CHECKLIST.reduce((sum, item) => sum + item.weight, 0);

/** Ids pre-ticked at first paint because nearly every account already has them. */
export const DEFAULT_DONE = [
  "two-factor-on",
  "device-passcode"
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
