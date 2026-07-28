/**
 * PhonePe Security Setup Guide — scoring logic.
 *
 * Pure module: no React, no DOM, no clocks. Every exported function is total —
 * unusable input returns { error } rather than NaN, Infinity or a wrong number.
 *
 * Rules referenced are NPCI UPI rules that apply to every UPI app, plus PhonePe's own app-lock and Manage UPI screens.
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
    "group": "Phone and app lock",
    "title": "Put a real screen lock on the phone itself",
    "detail": "A 6-digit PIN or biometric, not a pattern or 1234. Every UPI app on the device is protected by whatever guards the lock screen, and shoulder-surfed patterns are the most common way that fails.",
    "weight": 8,
    "critical": true
  },
  {
    "id": "app-lock",
    "group": "Phone and app lock",
    "title": "Switch on PhonePe's own app lock",
    "detail": "Profile > Settings > App Lock, using fingerprint, face or the device lock. It means a phone handed over unlocked, or snatched while unlocked, still cannot open your payment history and mandates.",
    "weight": 10,
    "critical": true
  },
  {
    "id": "registered-number",
    "group": "Phone and app lock",
    "title": "Keep the registered mobile number active and yours",
    "detail": "UPI binds the app to the SIM in the phone, verified by an SMS sent from your registered number. If that number lapses and is reissued to someone else, they can register UPI on your bank account.",
    "weight": 7,
    "critical": true
  },
  {
    "id": "sim-lock",
    "group": "Phone and app lock",
    "title": "Set a SIM PIN",
    "detail": "Android and iOS both allow a PIN that must be entered before the SIM works in any handset. Without it a thief moves your SIM to their phone and starts receiving your OTPs within minutes.",
    "weight": 5,
    "critical": false
  },
  {
    "id": "upi-pin-strength",
    "group": "UPI PIN discipline",
    "title": "Use a UPI PIN that is not guessable from your documents",
    "detail": "Change it from Profile > Payment Methods if it is your birth year, the last digits of your phone number or your vehicle number. Anyone who has seen your ID papers can try those first.",
    "weight": 9,
    "critical": true
  },
  {
    "id": "never-pin-to-receive",
    "group": "UPI PIN discipline",
    "title": "Never enter your UPI PIN to receive money",
    "detail": "Under NPCI rules the UPI PIN authorises money leaving your account and is never required to receive it. Any caller asking you to enter a PIN to accept a refund, prize, rent or sale payment is taking the money, not sending it.",
    "weight": 12,
    "critical": true
  },
  {
    "id": "decline-collect",
    "group": "UPI PIN discipline",
    "title": "Decline collect requests from people you do not know",
    "detail": "A collect or request-money notification asks you to pay, even when the note attached says refund or cashback. Reject anything unexpected instead of opening it to see what it is.",
    "weight": 7,
    "critical": false
  },
  {
    "id": "qr-discipline",
    "group": "UPI PIN discipline",
    "title": "Remember that scanning a QR only ever sends money",
    "detail": "There is no such thing as a QR code you scan to receive a payment. If a buyer on a resale app sends you a QR to collect their money, scanning it debits your account.",
    "weight": 6,
    "critical": false
  },
  {
    "id": "autopay-mandates",
    "group": "Limits and mandates",
    "title": "Review and cancel autopay mandates you no longer want",
    "detail": "PhonePe > Autopay lists every recurring debit permission you have approved. Mandates keep debiting on schedule with no further PIN entry, so an old subscription can run for years unnoticed.",
    "weight": 7,
    "critical": false
  },
  {
    "id": "transaction-limits",
    "group": "Limits and mandates",
    "title": "Know your UPI limits and lower them if you can",
    "detail": "NPCI caps most UPI transfers at Rs 1,00,000 per transaction and per day, with a Rs 5,000 ceiling in the first 24 hours after registering. Many banks let you set a lower personal limit in net banking, which caps the damage of a bad moment.",
    "weight": 6,
    "critical": false
  },
  {
    "id": "linked-accounts",
    "group": "Limits and mandates",
    "title": "Unlink bank accounts you no longer use",
    "detail": "Profile > Payment Methods. A dormant salary account still linked to UPI is one more account that can be drained, and one more you are not watching the balance of.",
    "weight": 5,
    "critical": false
  },
  {
    "id": "no-screen-share",
    "group": "Scams and reporting",
    "title": "Never install a screen-sharing or remote-control app for support",
    "detail": "AnyDesk, TeamViewer, QuickSupport and similar apps let a caller watch you type your UPI PIN and drive the phone themselves. No genuine bank or payment app asks you to install one.",
    "weight": 8,
    "critical": false
  },
  {
    "id": "verify-support",
    "group": "Scams and reporting",
    "title": "Only contact support from inside the app",
    "detail": "Customer-care numbers found through a search engine or a social media reply are a well-worn scam route. Use PhonePe > Help inside the app, which routes to the real team and keeps a record.",
    "weight": 5,
    "critical": false
  },
  {
    "id": "report-1930",
    "group": "Scams and reporting",
    "title": "Know how to report fraud quickly",
    "detail": "India's cybercrime financial-fraud helpline is 1930, with online reporting at cybercrime.gov.in. Reporting within the first hours gives the best chance of the transfer being held before it moves on.",
    "weight": 3,
    "critical": false
  },
  {
    "id": "transaction-alerts",
    "group": "Scams and reporting",
    "title": "Keep bank SMS and email alerts switched on, and read them",
    "detail": "The bank's own debit alert is the independent record that does not depend on the app. Muting those messages is how a small test debit goes unnoticed before a larger one follows.",
    "weight": 2,
    "critical": false
  }
];

/** Display order of the groups used by CHECKLIST. */
export const GROUPS = [
  "Phone and app lock",
  "UPI PIN discipline",
  "Limits and mandates",
  "Scams and reporting"
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
