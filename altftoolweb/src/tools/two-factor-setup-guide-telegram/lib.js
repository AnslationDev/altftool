/**
 * Telegram 2FA Setup Guide — scoring logic.
 *
 * Pure module: no React, no DOM, no clocks. Every exported function is total —
 * unusable input returns { error } rather than NaN, Infinity or a wrong number.
 *
 * Menu paths follow Settings > Privacy and Security in the Telegram apps: Two-Step Verification, Passcode Lock, Devices, and the individual privacy rules.
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
    "id": "two-step-password",
    "group": "Cloud password",
    "title": "Set a two-step verification cloud password",
    "detail": "Settings > Privacy and Security > Two-Step Verification. Without it, anyone who can receive an SMS to your number owns the account, because the login code is the only check Telegram makes.",
    "weight": 15,
    "critical": true
  },
  {
    "id": "recovery-email",
    "group": "Cloud password",
    "title": "Add and confirm a recovery email",
    "detail": "Telegram asks for one while you set the cloud password and it is easy to skip. Without it, a forgotten password leaves account reset as the only route, and reset means deleting the account after a seven-day wait.",
    "weight": 10,
    "critical": true
  },
  {
    "id": "password-not-reused",
    "group": "Cloud password",
    "title": "Use a cloud password that is not reused elsewhere",
    "detail": "Store it in a password manager. There is no support desk that can restore it, so a password you half-remember is nearly as bad as none, and a reused one is exposed by any other site's breach.",
    "weight": 8,
    "critical": true
  },
  {
    "id": "login-email",
    "group": "Cloud password",
    "title": "Turn on email login codes if the option is offered",
    "detail": "Where available, Telegram can send the login code to a verified email address instead of an SMS. It removes the mobile network, and everyone with access to it, from the sign-in path.",
    "weight": 5,
    "critical": false
  },
  {
    "id": "passcode-lock",
    "group": "Device security",
    "title": "Enable Passcode Lock inside Telegram",
    "detail": "Settings > Privacy and Security > Passcode Lock, with Face ID or Touch ID and a short auto-lock delay. It protects your chats when the phone itself is unlocked and in someone else's hands.",
    "weight": 8,
    "critical": true
  },
  {
    "id": "active-sessions",
    "group": "Device security",
    "title": "Review active sessions and end the ones you do not recognise",
    "detail": "Settings > Devices lists every signed-in session with device, app and location. Telegram sessions never expire on their own, so an old laptop or a desktop app on a machine you sold stays live indefinitely.",
    "weight": 8,
    "critical": false
  },
  {
    "id": "auto-terminate",
    "group": "Device security",
    "title": "Set old sessions to terminate automatically",
    "detail": "On the Devices screen, set the automatic termination period as short as your habits allow, down to one week. It cleans up the sessions you forget about without you having to remember.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "session-permissions",
    "group": "Device security",
    "title": "Restrict what each session is allowed to do",
    "detail": "Tapping a session lets you refuse secret chats and calls on that device. A shared desktop should not be able to accept a secret chat that then lives only on that machine.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "phone-visibility",
    "group": "Privacy exposure",
    "title": "Hide your phone number and limit who can find you by it",
    "detail": "Privacy and Security > Phone Number: set Who can see my phone number to Nobody, and Who can find me by my number to My Contacts. Otherwise anyone holding a leaked contact list can match a number to your profile.",
    "weight": 7,
    "critical": false
  },
  {
    "id": "groups-adds",
    "group": "Privacy exposure",
    "title": "Stop strangers adding you to groups and channels",
    "detail": "Privacy and Security > Groups and Channels > My Contacts. It ends the constant pull into crypto and investment groups, which is where most Telegram scam approaches begin.",
    "weight": 6,
    "critical": false
  },
  {
    "id": "calls-p2p",
    "group": "Privacy exposure",
    "title": "Turn off peer-to-peer for calls from people you do not know",
    "detail": "Privacy and Security > Calls > Peer-to-peer, set to My Contacts or Nobody. A direct call reveals your IP address to the other side; routing through Telegram's servers does not.",
    "weight": 5,
    "critical": false
  },
  {
    "id": "last-seen",
    "group": "Privacy exposure",
    "title": "Restrict Last Seen, profile photo and forwarded-message linking",
    "detail": "Each has its own rule under Privacy and Security. Last Seen in particular reveals your daily routine to anyone holding your number, which is worth more to a stalker than to a stranger.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "username",
    "group": "Privacy exposure",
    "title": "Share a username instead of your phone number",
    "detail": "A public username lets people reach you without learning the number your bank OTPs go to. Set it under Settings > Username and hand that out instead.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "secret-chats",
    "group": "Message handling",
    "title": "Use Secret Chats for anything genuinely sensitive",
    "detail": "Ordinary Telegram chats are stored in the cloud and encrypted between you and Telegram, not end to end. Only Secret Chats are end-to-end encrypted, and they live on the two devices involved rather than in the cloud.",
    "weight": 7,
    "critical": false
  },
  {
    "id": "delete-account-timer",
    "group": "Message handling",
    "title": "Set the inactivity self-destruct period deliberately",
    "detail": "Privacy and Security > Delete my account if away for. The default is generous; a shorter period means an abandoned account and its number binding do not sit there waiting to be reclaimed by someone else.",
    "weight": 6,
    "critical": false
  }
];

/** Display order of the groups used by CHECKLIST. */
export const GROUPS = [
  "Cloud password",
  "Device security",
  "Privacy exposure",
  "Message handling"
];

/** Sum of all weights. The checklist is authored so that this equals 100. */
export const TOTAL_WEIGHT = CHECKLIST.reduce((sum, item) => sum + item.weight, 0);

/** Ids pre-ticked at first paint because nearly every account already has them. */
export const DEFAULT_DONE = [
  "password-not-reused",
  "last-seen"
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
