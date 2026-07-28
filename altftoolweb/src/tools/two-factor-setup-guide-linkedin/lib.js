/**
 * LinkedIn 2FA Setup Guide — scoring logic.
 *
 * Pure module: no React, no DOM, no clocks. Every exported function is total —
 * unusable input returns { error } rather than NaN, Infinity or a wrong number.
 *
 * Menu paths follow LinkedIn's Settings and Privacy tree: Sign in & security, Data privacy, Visibility and Communications.
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
    "group": "Sign in & security",
    "title": "Use a password that is not reused anywhere else",
    "detail": "Settings & Privacy > Sign in & security > Change password. LinkedIn credentials show up in breach dumps regularly, and a reused password turns one breach into several compromised accounts.",
    "weight": 12,
    "critical": true
  },
  {
    "id": "authenticator-app",
    "group": "Sign in & security",
    "title": "Turn on two-step verification using an authenticator app",
    "detail": "Sign in & security > Two-step verification > Set up, then choose Authenticator App rather than Phone. The app generates a 6-digit code that changes every 30 seconds and works with no signal.",
    "weight": 15,
    "critical": true
  },
  {
    "id": "recovery-codes",
    "group": "Sign in & security",
    "title": "Save the recovery codes LinkedIn shows you",
    "detail": "LinkedIn displays single-use recovery codes when two-step verification is switched on. Store them in your password manager or on paper; without them a lost phone means an identity-verification queue.",
    "weight": 10,
    "critical": true
  },
  {
    "id": "verify-email",
    "group": "Sign in & security",
    "title": "Confirm the primary email is one you still control",
    "detail": "Sign in & security > Email addresses. Password resets go to the primary address, so a dead college or ex-employer inbox is an open back door.",
    "weight": 8,
    "critical": true
  },
  {
    "id": "passkey",
    "group": "Sign in & security",
    "title": "Add a passkey if the option is available on your account",
    "detail": "Sign in & security > Passkeys. A passkey ties sign-in to your device unlock and cannot be phished, because it will not release anything to a lookalike domain.",
    "weight": 6,
    "critical": false
  },
  {
    "id": "remove-old-email",
    "group": "Sign in & security",
    "title": "Remove old work or student email addresses",
    "detail": "Any secondary address on the account can be used to recover it. Delete addresses at former employers or institutions, since those mailboxes are controlled by someone else now.",
    "weight": 5,
    "critical": false
  },
  {
    "id": "phone-recovery-only",
    "group": "Sign in & security",
    "title": "Keep the phone number current but not as your second factor",
    "detail": "Sign in & security > Phone numbers. A current number helps recovery, but once the authenticator app is set up, SMS should not be the method you rely on: SIM swaps defeat it.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "active-sessions",
    "group": "Sessions and devices",
    "title": "Review where you are signed in and end unknown sessions",
    "detail": "Sign in & security > Where you're signed in lists active sessions with location and device. Sign out of anything you do not recognise, then change the password if you find one.",
    "weight": 8,
    "critical": false
  },
  {
    "id": "remembered-devices",
    "group": "Sessions and devices",
    "title": "Clear devices that remember your password",
    "detail": "Sign in & security > Devices that remember your password. Old laptops, shared machines and sold phones stay signed in until you remove them here.",
    "weight": 5,
    "critical": false
  },
  {
    "id": "permitted-services",
    "group": "Connected apps and data",
    "title": "Revoke permitted services and third-party apps you no longer use",
    "detail": "Data privacy > Permitted services, and Other applications. Recruiting tools, CRM plugins and job-board integrations keep read access to your profile and network long after you stop using them.",
    "weight": 7,
    "critical": false
  },
  {
    "id": "data-sharing",
    "group": "Connected apps and data",
    "title": "Turn off optional data sharing and research programmes",
    "detail": "Data privacy has toggles for advertising data, partner research and generative-AI training. None of them are needed for the account to work, so switch off what you did not consciously opt into.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "profile-discovery",
    "group": "Profile exposure",
    "title": "Restrict who can find you by email address or phone number",
    "detail": "Visibility > Profile discovery using email address, and Profile discovery using phone number. Leaving both open lets anyone holding a leaked contact list match it to your real profile.",
    "weight": 5,
    "critical": false
  },
  {
    "id": "invitation-limits",
    "group": "Profile exposure",
    "title": "Limit who can send you connection invitations",
    "detail": "Communications > Invitations from your network. Narrowing this to people who know your email address cuts most fake-recruiter and job-scam approaches before they arrive.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "sign-in-alerts",
    "group": "Profile exposure",
    "title": "Keep sign-in and password-change email alerts switched on",
    "detail": "LinkedIn emails you about new sign-ins and security changes. Those messages are often the first sign of a takeover, so do not filter them out of your inbox.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "private-browsing-mode",
    "group": "Profile exposure",
    "title": "Set profile viewing options to suit what you are doing",
    "detail": "Visibility > Profile viewing options. Private mode hides you when researching companies or competitors; switch back to your name when you want recruiters to see the visit.",
    "weight": 3,
    "critical": false
  }
];

/** Display order of the groups used by CHECKLIST. */
export const GROUPS = [
  "Sign in & security",
  "Sessions and devices",
  "Connected apps and data",
  "Profile exposure"
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
