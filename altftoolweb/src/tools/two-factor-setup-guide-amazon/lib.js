/**
 * Amazon Account 2FA Guide — scoring logic.
 *
 * Pure module: no React, no DOM, no clocks. Every exported function is total —
 * unusable input returns { error } rather than NaN, Infinity or a wrong number.
 *
 * Menu paths follow Your Account > Login & Security, Your Payments, Your Addresses, and Content and Devices on Amazon's website.
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
    "title": "Use a password that is unique to Amazon",
    "detail": "Your Account > Login & Security > Password > Edit. Shopping passwords are among the most reused, and an Amazon takeover gives an attacker stored cards plus your home address in one screen.",
    "weight": 10,
    "critical": true
  },
  {
    "id": "two-step-app",
    "group": "Sign in and second factor",
    "title": "Turn on two-step verification with an authenticator app",
    "detail": "Login & Security > Two-Step Verification (2SV) Settings > Get Started, then choose Authenticator App instead of Phone Number. The app produces a code offline, so it works in a shop with no signal.",
    "weight": 14,
    "critical": true
  },
  {
    "id": "backup-method",
    "group": "Sign in and second factor",
    "title": "Add the required backup verification method",
    "detail": "Amazon insists on a backup method when you enable two-step verification. Use a phone number that is not the phone holding your authenticator app, or you lose both at once.",
    "weight": 9,
    "critical": true
  },
  {
    "id": "verify-email",
    "group": "Sign in and second factor",
    "title": "Confirm the account email is one you still control",
    "detail": "Login & Security > Email > Edit. Order confirmations and password resets both go here, so an old address means someone else sees your deliveries and can start a reset.",
    "weight": 7,
    "critical": true
  },
  {
    "id": "passkey",
    "group": "Sign in and second factor",
    "title": "Add a passkey for phishing-resistant sign-in",
    "detail": "Login & Security > Passkey > Set up. The passkey only unlocks on Amazon's genuine domain, so a lookalike checkout page cannot collect anything reusable.",
    "weight": 6,
    "critical": false
  },
  {
    "id": "trusted-browser",
    "group": "Sign in and second factor",
    "title": "Do not tick the trusted-browser box on shared computers",
    "detail": "The option not to require a code on this browser turns two-step verification off for that machine. It is fine on your own laptop and a bad idea on a work, hotel or family computer.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "registered-devices",
    "group": "Devices and sessions",
    "title": "Deregister Kindles, Fire TVs and Echos you no longer own",
    "detail": "Account > Content and Devices > Devices. A sold or gifted device stays signed in and can keep ordering, playing purchased media and answering as your household.",
    "weight": 6,
    "critical": false
  },
  {
    "id": "secure-your-account",
    "group": "Devices and sessions",
    "title": "Sign out everywhere after any scare",
    "detail": "Login & Security offers a Secure Your Account option that ends existing sessions. Use it whenever you change the password because of a suspicious email or an order you did not place.",
    "weight": 5,
    "critical": false
  },
  {
    "id": "payment-methods",
    "group": "Payments and orders",
    "title": "Remove saved cards you no longer use",
    "detail": "Your Payments > Wallet. Every stored card is one an intruder can spend from, and an unfamiliar card on the list is a strong sign someone else has been in the account.",
    "weight": 7,
    "critical": false
  },
  {
    "id": "one-click",
    "group": "Payments and orders",
    "title": "Review 1-Click settings and the default delivery address",
    "detail": "Your Account > 1-Click Settings. One-click ordering skips the confirmation screen, so an unattended logged-in browser can place a real order in a single tap.",
    "weight": 5,
    "critical": false
  },
  {
    "id": "voice-purchasing",
    "group": "Payments and orders",
    "title": "Lock Alexa voice purchasing with a code or switch it off",
    "detail": "Alexa app > Settings > Account Settings > Voice Purchasing. Without a spoken code, anyone within earshot of the Echo, including a child or a passing guest, can order.",
    "weight": 5,
    "critical": false
  },
  {
    "id": "gift-card-balance",
    "group": "Payments and orders",
    "title": "Check the gift card balance and any auto-reload",
    "detail": "Your Account > Gift cards. Stored balance is the first thing drained in a takeover because it needs no card verification, and auto-reload quietly tops it back up.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "third-party-apps",
    "group": "Data and contact",
    "title": "Revoke Login with Amazon grants and connected apps",
    "detail": "Login & Security lists third-party apps and services that can sign in as you or read account details. Remove anything you no longer use or do not recognise.",
    "weight": 7,
    "critical": false
  },
  {
    "id": "message-centre",
    "group": "Data and contact",
    "title": "Check the Message Centre before trusting any Amazon email",
    "detail": "Your Account > Message Centre shows the messages Amazon genuinely sent. If a delivery-problem or refund email is not there, it did not come from Amazon, whatever the sender address looks like.",
    "weight": 6,
    "critical": false
  },
  {
    "id": "addresses",
    "group": "Data and contact",
    "title": "Prune saved delivery addresses",
    "detail": "Your Addresses. Old flats, an office you left and relatives' houses all sit in the account, and a new address you did not add is a classic sign of a compromised account.",
    "weight": 5,
    "critical": false
  }
];

/** Display order of the groups used by CHECKLIST. */
export const GROUPS = [
  "Sign in and second factor",
  "Devices and sessions",
  "Payments and orders",
  "Data and contact"
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
