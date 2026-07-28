/**
 * Net Banking 2FA Hardening Guide — scoring logic.
 *
 * Pure module: no React, no DOM, no clocks. Every exported function is total —
 * unusable input returns { error } rather than NaN, Infinity or a wrong number.
 *
 * Rules referenced are RBI rules that apply across banks: additional factor of authentication, customer-set card controls, and the reporting deadlines in the RBI circular on limiting customer liability in unauthorised electronic transactions.
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
    "group": "Login credentials",
    "title": "Use a net banking password used nowhere else",
    "detail": "Your banking password should not appear in any breach corpus, which means it cannot be the one from your email, shopping or social accounts. Keep it in a password manager rather than in a notebook near the computer.",
    "weight": 10,
    "critical": true
  },
  {
    "id": "separate-email",
    "group": "Login credentials",
    "title": "Register a dedicated email address for banking",
    "detail": "An address you do not use for newsletters or sign-ups receives far less phishing, and a fake bank mail arriving there stands out. Protect that mailbox with its own two-factor authentication.",
    "weight": 6,
    "critical": false
  },
  {
    "id": "change-default",
    "group": "Login credentials",
    "title": "Change the passwords the bank issued you",
    "detail": "Welcome-kit and branch-generated passwords have been seen by people other than you and are often printed in a predictable format. Change both the login and transaction passwords on first use.",
    "weight": 5,
    "critical": false
  },
  {
    "id": "distinct-passwords",
    "group": "Login credentials",
    "title": "Keep the login and transaction passwords different",
    "detail": "Most banks use two: one to see the account, one to move money. Making them the same removes the second barrier entirely, which is the point of having it.",
    "weight": 5,
    "critical": false
  },
  {
    "id": "never-share-otp",
    "group": "Second factor",
    "title": "Never share an OTP, CVV, PIN or card number with anyone",
    "detail": "RBI requires an additional factor of authentication for online transactions, which means the OTP exists to authorise a payment you are making. No bank officer, no KYC helpline and no delivery agent has any reason to ask for it.",
    "weight": 12,
    "critical": true
  },
  {
    "id": "otp-registered-number",
    "group": "Second factor",
    "title": "Keep the registered mobile number and email current",
    "detail": "Every OTP and alert goes to what the bank has on file. An old number is both a missed alert and, once the operator reissues it, a working second factor in a stranger's hand.",
    "weight": 10,
    "critical": true
  },
  {
    "id": "app-token",
    "group": "Second factor",
    "title": "Use the bank's app-based token instead of SMS where offered",
    "detail": "Many banks now offer an in-app soft token or secure key that generates the code on your device. It survives poor network coverage and, unlike SMS, is not delivered to whoever holds your number after a SIM swap.",
    "weight": 6,
    "critical": false
  },
  {
    "id": "sim-lock",
    "group": "Second factor",
    "title": "Set a SIM PIN and watch for sudden loss of signal",
    "detail": "A SIM PIN stops a stolen SIM working in another handset. If your phone loses network for no reason and stays dead, call the operator immediately: that is what a SIM swap looks like from your side.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "beneficiary-cooling",
    "group": "Transaction controls",
    "title": "Keep the cooling period and low first limit for new payees",
    "detail": "Most banks hold a newly added beneficiary for a period, commonly up to 24 hours, and cap the first transfers. Do not ask for it to be waived; that delay is the window in which you notice a payee you did not add.",
    "weight": 8,
    "critical": true
  },
  {
    "id": "per-day-limits",
    "group": "Transaction controls",
    "title": "Lower your daily transfer limits to what you actually use",
    "detail": "NEFT, IMPS and RTGS limits are set high by default; IMPS allows up to Rs 5,00,000 per transaction and RTGS starts at Rs 2,00,000. Most people never move that much, and a lower limit caps the loss from one bad moment.",
    "weight": 7,
    "critical": false
  },
  {
    "id": "card-controls",
    "group": "Transaction controls",
    "title": "Switch off card channels you do not use",
    "detail": "RBI requires banks to let you enable or disable international, online, contactless and ATM use per card and set a limit on each. Turning international off on a card you only use domestically removes a whole class of fraud.",
    "weight": 7,
    "critical": false
  },
  {
    "id": "positive-pay",
    "group": "Transaction controls",
    "title": "Use Positive Pay for large cheques",
    "detail": "The Positive Pay System asks you to confirm the details of a high-value cheque before it is cleared. RBI set it up for cheques above Rs 50,000, and many banks make it compulsory at higher amounts.",
    "weight": 4,
    "critical": false
  },
  {
    "id": "transaction-alerts",
    "group": "Monitoring and recovery",
    "title": "Turn on SMS and email alerts for every debit",
    "detail": "Set the alert threshold as low as the bank allows rather than accepting a default of a few thousand rupees. Fraudulent transfers usually start with a small test debit that a high threshold hides.",
    "weight": 6,
    "critical": false
  },
  {
    "id": "report-3-days",
    "group": "Monitoring and recovery",
    "title": "Know the reporting deadline before you need it",
    "detail": "Under the RBI circular on limiting customer liability, reporting an unauthorised electronic transaction within three working days of noticing it normally means zero liability. Reporting on the fourth to seventh working day caps your liability at an amount that depends on the account type, and delaying further can leave you carrying the loss.",
    "weight": 6,
    "critical": false
  },
  {
    "id": "session-hygiene",
    "group": "Monitoring and recovery",
    "title": "Log out properly and never bank on shared Wi-Fi or devices",
    "detail": "Use the log-out button rather than closing the tab, decline the browser's offer to save the password, and avoid public Wi-Fi and internet cafes for anything that moves money.",
    "weight": 4,
    "critical": false
  }
];

/** Display order of the groups used by CHECKLIST. */
export const GROUPS = [
  "Login credentials",
  "Second factor",
  "Transaction controls",
  "Monitoring and recovery"
];

/** Sum of all weights. The checklist is authored so that this equals 100. */
export const TOTAL_WEIGHT = CHECKLIST.reduce((sum, item) => sum + item.weight, 0);

/** Ids pre-ticked at first paint because nearly every account already has them. */
export const DEFAULT_DONE = [
  "unique-password",
  "otp-registered-number"
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
