/**
 * Paytm Security Setup Guide — scoring logic.
 *
 * Pure module: no React, no DOM, no clocks. Every exported function is total —
 * unusable input returns { error } rather than NaN, Infinity or a wrong number.
 *
 * Rules referenced are NPCI UPI rules that apply to every UPI app, plus Paytm's own app-lock, automatic payments and Postpaid screens.
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
    "id": "device-lock",
    "group": "Login and app lock",
    "title": "Use a strong screen lock on the phone",
    "detail": "A 6-digit PIN or biometric rather than a swipe pattern. Paytm login is tied to the number in the phone, so whoever can unlock the handset is most of the way into the account.",
    "weight": 7,
    "critical": true
  },
  {
    "id": "app-passcode",
    "group": "Login and app lock",
    "title": "Turn on Paytm's app lock",
    "detail": "Profile > Settings > Security and Privacy > App Lock, using biometrics or a passcode different from your device PIN. This is what protects the app when the phone is already unlocked and in someone else's hand.",
    "weight": 10,
    "critical": true
  },
  {
    "id": "registered-number",
    "group": "Login and app lock",
    "title": "Keep the registered number active and know how to block the account",
    "detail": "Login OTPs and UPI device binding both depend on this number. Save Paytm's own lost-phone route in advance so you can block the wallet quickly rather than looking it up in a panic.",
    "weight": 8,
    "critical": true
  },
  {
    "id": "sim-lock",
    "group": "Login and app lock",
    "title": "Set a SIM PIN",
    "detail": "Both Android and iOS support a PIN that must be entered before the SIM works in any handset. Without one, a stolen SIM starts receiving your OTPs in another phone within minutes.",
    "weight": 5,
    "critical": false
  },
  {
    "id": "upi-pin-strength",
    "group": "UPI and PIN",
    "title": "Use a UPI PIN nobody could guess from your papers",
    "detail": "Change it if it is your year of birth, part of your phone number or your vehicle registration. Those are the first combinations tried by anyone who has seen a copy of your ID.",
    "weight": 8,
    "critical": true
  },
  {
    "id": "never-pin-to-receive",
    "group": "UPI and PIN",
    "title": "Never enter a UPI PIN or scan a QR to receive money",
    "detail": "Under NPCI rules the UPI PIN authorises a debit and is never needed to receive a payment, and scanning a QR always sends money. Any refund, cashback or sale that asks for either is a payment out of your account.",
    "weight": 12,
    "critical": true
  },
  {
    "id": "upi-lite-balance",
    "group": "UPI and PIN",
    "title": "Keep the UPI Lite balance small",
    "detail": "UPI Lite is designed for small payments that go through without entering a PIN. That convenience is also its risk, so load only what you would be willing to lose with the phone.",
    "weight": 5,
    "critical": false
  },
  {
    "id": "upi-handle-bank",
    "group": "UPI and PIN",
    "title": "Check which bank issues your Paytm UPI handle",
    "detail": "Profile > Payment Settings > Manage UPI shows the handle and the linked account. Knowing which bank actually holds the money tells you who to call first if a transaction goes wrong.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "automatic-payments",
    "group": "Money controls",
    "title": "Review and cancel automatic payments",
    "detail": "Balance and History > Automatic Payments lists every recurring mandate. Once approved, these debit on schedule with no further PIN entry, so an old subscription can run for years.",
    "weight": 7,
    "critical": false
  },
  {
    "id": "wallet-autotopup",
    "group": "Money controls",
    "title": "Turn off automatic add money to the wallet",
    "detail": "Auto top-up refills the wallet from your bank whenever the balance drops. If someone is spending from the wallet, that setting quietly keeps refilling it for them.",
    "weight": 6,
    "critical": false
  },
  {
    "id": "postpaid-check",
    "group": "Money controls",
    "title": "Check the Paytm Postpaid limit and statement",
    "detail": "Postpaid is a credit line, so a takeover can spend money you do not have yet and leave a repayment obligation. Read the statement, and close the line if you never use it.",
    "weight": 6,
    "critical": false
  },
  {
    "id": "linked-accounts",
    "group": "Money controls",
    "title": "Unlink dormant bank accounts and remove saved cards",
    "detail": "Profile > Payment Settings. Each linked account and stored card is one more thing that can be spent from, and one more balance you are not watching.",
    "weight": 5,
    "critical": false
  },
  {
    "id": "no-screen-share",
    "group": "Scams and monitoring",
    "title": "Never install a remote-access app for support",
    "detail": "AnyDesk, TeamViewer and similar apps show the caller your screen and often let them control the phone, including reading OTPs. No genuine payment app or bank ever needs that.",
    "weight": 8,
    "critical": false
  },
  {
    "id": "verify-support",
    "group": "Scams and monitoring",
    "title": "Use only the in-app 24x7 Help for support",
    "detail": "Care numbers found through a search engine or replied to your social media post are a standard fraud route. In-app help reaches the real team and leaves a record of the complaint.",
    "weight": 5,
    "critical": false
  },
  {
    "id": "report-1930",
    "group": "Scams and monitoring",
    "title": "Know the reporting route before you need it",
    "detail": "India's financial cybercrime helpline is 1930, with online reporting at cybercrime.gov.in. Report there and to your bank as soon as you notice, because early reports have the best chance of the money being held.",
    "weight": 4,
    "critical": false
  }
];

/** Display order of the groups used by CHECKLIST. */
export const GROUPS = [
  "Login and app lock",
  "UPI and PIN",
  "Money controls",
  "Scams and monitoring"
];

/** Sum of all weights. The checklist is authored so that this equals 100. */
export const TOTAL_WEIGHT = CHECKLIST.reduce((sum, item) => sum + item.weight, 0);

/** Ids pre-ticked at first paint because nearly every account already has them. */
export const DEFAULT_DONE = [
  "device-lock",
  "registered-number"
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
