/**
 * Netflix Account Security Guide — scoring logic.
 *
 * Pure module: no React, no DOM, no clocks. Every exported function is total —
 * unusable input returns { error } rather than NaN, Infinity or a wrong number.
 *
 * Menu paths follow netflix.com/account: Security, Manage access and devices, Profile Lock, Household, and Viewing activity.
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
    "group": "Access control",
    "title": "Set a long, unique password",
    "detail": "Account > Change password, and tick the option requiring all devices to sign in again. Netflix does not offer authenticator-app two-factor authentication, so this password is carrying more weight than it would elsewhere.",
    "weight": 14,
    "critical": true
  },
  {
    "id": "sign-out-all",
    "group": "Access control",
    "title": "Sign out of all devices",
    "detail": "Account > Security > Sign out of all devices. Changing the password alone does not always end existing sessions, so a TV in a flat you left years ago can keep streaming until you do this.",
    "weight": 10,
    "critical": true
  },
  {
    "id": "manage-access-devices",
    "group": "Access control",
    "title": "Review recent device access and locations",
    "detail": "Account > Manage access and devices lists each device with the date and rough location it last streamed from. Anything in a city you have never been to means the password has leaked.",
    "weight": 9,
    "critical": true
  },
  {
    "id": "email-phone-current",
    "group": "Access control",
    "title": "Keep the account email and phone number current",
    "detail": "Account > Membership details. Sign-in codes and password resets go to these, so an inbox you no longer read is the easiest way for someone else to take the account permanently.",
    "weight": 8,
    "critical": true
  },
  {
    "id": "profile-lock",
    "group": "Access control",
    "title": "Put a profile lock PIN on your own profile",
    "detail": "Account > choose the profile > Profile Lock, then set a 4-digit PIN. It stops anyone else on the account, invited or not, opening your profile and reading your list and history.",
    "weight": 7,
    "critical": false
  },
  {
    "id": "download-devices",
    "group": "Access control",
    "title": "Clear devices holding offline downloads",
    "detail": "Downloads stay watchable on a device for a while after sign-out. Removing old download devices closes that gap on phones and tablets you no longer own.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "netflix-household",
    "group": "Household and sharing",
    "title": "Confirm your Netflix Household is set to the right home",
    "detail": "Account > Manage Netflix Household. Devices outside the household have to verify with a code sent to the account email, so getting this right is what actually stops informal password sharing.",
    "weight": 7,
    "critical": false
  },
  {
    "id": "remove-extra-member",
    "group": "Household and sharing",
    "title": "Remove extra members and shared profiles you no longer want",
    "detail": "Extra member slots and profiles shared with friends outlive the friendship. Remove them from the account page rather than assuming they stopped watching.",
    "weight": 5,
    "critical": false
  },
  {
    "id": "kids-maturity",
    "group": "Household and sharing",
    "title": "Set maturity ratings and a PIN on adult profiles",
    "detail": "Account > Profile > Viewing restrictions. A rating limit on children's profiles plus a PIN on the adult ones keeps the family account from becoming a shared free-for-all.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "viewing-activity",
    "group": "Privacy",
    "title": "Check the viewing activity for shows you did not watch",
    "detail": "Account > Profile > Viewing activity is the fastest way to spot an unauthorised viewer, because their watch history lands in your list. You can hide individual titles from the same page.",
    "weight": 5,
    "critical": false
  },
  {
    "id": "profile-transfer",
    "group": "Privacy",
    "title": "Transfer a profile out instead of sharing the password",
    "detail": "Profile Transfer moves a profile with its history and recommendations to that person's own membership. It ends the sharing without either side losing their list.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "marketing-data",
    "group": "Privacy",
    "title": "Turn off marketing email and personalised ad settings",
    "detail": "Account > Communication settings and the privacy preferences page. It reduces what is shared for advertising and, usefully, makes a fake Netflix marketing email easier to spot.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "phishing-check",
    "group": "Billing and scams",
    "title": "Never act on a Netflix payment email through its links",
    "detail": "Payment-failure and account-suspended messages are the most copied Netflix phishing template. Open netflix.com yourself and check the billing page; Netflix does not ask for card details by email or SMS.",
    "weight": 8,
    "critical": false
  },
  {
    "id": "billing-check",
    "group": "Billing and scams",
    "title": "Check the plan, payment method and billing history",
    "detail": "Account > Billing details. An upgraded plan or extra member you did not add is a common first sign that someone else is using the account and quietly raising its cost.",
    "weight": 7,
    "critical": false
  },
  {
    "id": "reset-if-shared",
    "group": "Billing and scams",
    "title": "Reset properly if the password was ever shared",
    "detail": "A password given to one friend has usually reached several people. Change it, sign out of all devices, then check the device list again a week later to see who reappears.",
    "weight": 5,
    "critical": false
  }
];

/** Display order of the groups used by CHECKLIST. */
export const GROUPS = [
  "Access control",
  "Household and sharing",
  "Privacy",
  "Billing and scams"
];

/** Sum of all weights. The checklist is authored so that this equals 100. */
export const TOTAL_WEIGHT = CHECKLIST.reduce((sum, item) => sum + item.weight, 0);

/** Ids pre-ticked at first paint because nearly every account already has them. */
export const DEFAULT_DONE = [
  "unique-password",
  "email-phone-current"
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
