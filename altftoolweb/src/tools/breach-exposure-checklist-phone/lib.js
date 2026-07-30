/**
 * Phone Number Exposure Checklist — scoring and triage logic.
 *
 * Pure module: no React, no DOM, no clocks. Dates are always passed in as
 * arguments so the same input always produces the same output. Every exported
 * function is total — unusable input returns { error } instead of NaN or a
 * misleading number.
 *
 * A leaked phone number is dangerous for three distinct reasons, and the
 * checklist is organised around them: it is the target of a SIM swap (an
 * attacker convinces your carrier to move the number to their SIM), it is the
 * target of smishing texts and spoofed spam calls, and — the same idea used
 * for a leaked home address — it is routinely accepted as a verification
 * token by banks, call centres and account-recovery flows that need to stop
 * trusting it once it is public.
 */

/**
 * Response windows. `days` is the age, in days from the moment you learned
 * about the exposure, at which an unfinished step in that window counts as
 * overdue. A SIM-swap attempt can happen within hours of a leak, so the most
 * urgent controls sit in the first-day window regardless of which group they
 * are displayed under.
 */
export const WINDOWS = [
  { id: "day1", label: "First 24 hours", days: 1 },
  { id: "week1", label: "First week", days: 7 },
  { id: "month1", label: "First month", days: 30 },
  { id: "ongoing", label: "Ongoing", days: 90 },
];

const WINDOW_BY_ID = new Map(WINDOWS.map((w) => [w.id, w]));

/**
 * The checklist.
 *
 * weight   = share of the 100-point response score. Weights rank the steps
 *            that block a SIM swap or close an account-recovery path highest;
 *            filtering and habit-forming steps carry less.
 * critical = leaving this open keeps the exposure fully exploitable, so it
 *            caps the score (see CRITICAL_CAP_PERCENT).
 */
export const CHECKLIST = [
  {
    id: "confirm-scope",
    group: "Contain it today",
    window: "day1",
    title: "Write down exactly what leaked with the number",
    detail:
      "A phone number on its own mostly enables spam. Number plus full name, email address, date of birth or partial account details is the combination that lets an attacker impersonate you to your carrier or pass a phone-based identity check. List every field, the source and the date — the rest of this checklist depends on it.",
    weight: 8,
    critical: true,
  },
  {
    id: "carrier-account-lock",
    group: "Contain it today",
    window: "day1",
    title: "Call your carrier and set a port-out lock and account PIN today",
    detail:
      "A SIM swap needs your carrier to move the number onto an attacker's SIM or port it to another carrier. A port-out lock (sometimes called a port freeze) plus a PIN or passphrase on the account is the one control that stops this, and it protects nothing until you actually set it.",
    weight: 10,
    critical: true,
  },
  {
    id: "voicemail-pin",
    group: "Contain it today",
    window: "day1",
    title: "Set a real voicemail PIN, not the carrier default",
    detail:
      "Default voicemail PINs — often 0000 or the last four digits of the number itself — let anyone who knows the leaked number dial in and replay a one-time code that was left as a voicemail message.",
    weight: 4,
  },
  {
    id: "screenshot-evidence",
    group: "Contain it today",
    window: "day1",
    title: "Screenshot smishing texts and spam calls before you block or delete",
    detail:
      "Save the message, the sending number and a timestamp before you block the sender or clear the call log. It is the evidence a carrier fraud report, a platform report or a police complaint will ask for.",
    weight: 4,
  },

  {
    id: "port-lock-confirm",
    group: "Lock down against SIM swap",
    window: "week1",
    title: "Confirm the port-out lock actually took effect",
    detail:
      "Call back or check the carrier app a day later to confirm the lock is active — it is common for a support agent to apply the wrong flag or for it to be reversed while handling an unrelated request. Keep the reference number from the call.",
    weight: 8,
    critical: true,
  },
  {
    id: "esim-check",
    group: "Lock down against SIM swap",
    window: "week1",
    title: "Check the account for a SIM or eSIM you did not add",
    detail:
      "Open the carrier app or online portal and read the list of active SIMs, eSIM profiles and devices on the line. An unfamiliar eSIM entry is the clearest sign a swap has already happened.",
    weight: 5,
  },
  {
    id: "carrier-alerts",
    group: "Lock down against SIM swap",
    window: "week1",
    title: "Turn on carrier alerts for SIM, plan and PIN changes",
    detail:
      "Most carriers can email or message the account holder whenever the SIM, the port-out lock, the PIN or the registered devices change. Turn this on so the next attempt reaches you before it succeeds, not after.",
    weight: 5,
  },
  {
    id: "sms-2fa-migration",
    group: "Lock down against SIM swap",
    window: "week1",
    title: "Move two-factor codes off SMS to an authenticator app or passkey",
    detail:
      "A successful SIM swap forwards every SMS code to the attacker automatically. Moving email, banking and social accounts to an authenticator app or a passkey removes the one thing a SIM swap is actually done to obtain.",
    weight: 8,
    critical: true,
  },

  {
    id: "no-otp-share",
    group: "Triage smishing and spam calls",
    window: "day1",
    title: "Never read a one-time code back to anyone who calls you",
    detail:
      "No legitimate bank, carrier or delivery service will ever ask you to read out a code that was just sent to you. A caller who asks for one — however official they sound — is trying to complete an account takeover while you are on the line.",
    weight: 7,
    critical: true,
  },
  {
    id: "dont-click-links",
    group: "Triage smishing and spam calls",
    window: "week1",
    title: "Treat unexpected links in texts as smishing by default",
    detail:
      "A leaked number is targeted with parcel-delivery, bank-alert and prize-claim texts almost immediately. Do not tap the link; open the official app or type the organisation's known web address into a browser instead.",
    weight: 5,
  },
  {
    id: "verify-caller-callback",
    group: "Triage smishing and spam calls",
    window: "week1",
    title: "Hang up and call the official number back",
    detail:
      "Caller ID is trivial to spoof once your number is known to be active and in use. For any call claiming to be your bank, carrier or a government office, end it and dial the number printed on your card or their official site instead.",
    weight: 4,
  },
  {
    id: "report-spam",
    group: "Triage smishing and spam calls",
    window: "week1",
    title: "Report the smishing texts and spam calls, not just block them",
    detail:
      "Forward suspicious texts to 7726 (spells SPAM on the keypad) where your carrier supports it, and use your country's spam-reporting channel for calls. Reports feed the filters that protect the next person on the same leaked list.",
    weight: 4,
  },
  {
    id: "block-callers",
    group: "Triage smishing and spam calls",
    window: "month1",
    title: "Turn on carrier or device-level spam-call filtering",
    detail:
      "Enable your phone's built-in spam-call identification and your carrier's call-filtering service, then block individual numbers as they come in. It will not stop every attempt, but it clears the high-volume automated ones.",
    weight: 2,
  },

  {
    id: "stop-phone-kba",
    group: "Demote the number as an identity check",
    window: "month1",
    title: "Stop treating the phone number as proof of who someone is",
    detail:
      "Call centres and reset flows often confirm the number on file as an identity check. A leaked number passes that check for an attacker too — replace it with an unrelated stored passphrase wherever the option exists, and stop accepting caller-knows-my-number as proof.",
    weight: 8,
    critical: true,
  },
  {
    id: "bank-telco-verbal-password",
    group: "Demote the number as an identity check",
    window: "month1",
    title: "Set a verbal password or callback-only rule with your bank and carrier",
    detail:
      "Ask for a spoken passphrase, or a rule that support only calls you back on a number you registered, rather than trusting whoever calls in and reads the account details. This closes the gap a port-out lock does not cover: social engineering of the support desk itself.",
    weight: 7,
    critical: true,
  },
  {
    id: "passkey-migration",
    group: "Demote the number as an identity check",
    window: "month1",
    title: "Move high-value accounts to passkeys where the option exists",
    detail:
      "Passkeys remove the phone number from the login path entirely, so a future SIM swap or spam campaign against the number has nothing left to take over. Prioritise email and banking first, since either can be used to reset other accounts.",
    weight: 4,
  },
  {
    id: "monitor-recovery",
    group: "Demote the number as an identity check",
    window: "ongoing",
    title: "Watch for account-recovery messages you did not request",
    detail:
      "An unexpected password-reset email, a login-verification text or a \"new device added\" alert is often the first visible sign someone is using the leaked number to work through your accounts. Query each one directly with the provider, never through a link in the message itself.",
    weight: 4,
  },
  {
    id: "report-threats",
    group: "Demote the number as an identity check",
    window: "ongoing",
    title: "File a report if the exposure came with threats or harassment",
    detail:
      "If calls or texts to the number include threats, extortion or repeated harassment, report it. In India that is cybercrime.gov.in or the local cyber cell; elsewhere, your local police force. The reference number is what carriers and platforms act on.",
    weight: 3,
  },
];

/** Display order of the groups used by CHECKLIST. */
export const GROUPS = [
  "Contain it today",
  "Lock down against SIM swap",
  "Triage smishing and spam calls",
  "Demote the number as an identity check",
];

/** Sum of all weights. The checklist is authored so that this equals 100. */
export const TOTAL_WEIGHT = CHECKLIST.reduce((sum, item) => sum + item.weight, 0);

/** Ticked at first paint because most people have already done this much. */
export const DEFAULT_DONE = ["confirm-scope"];

/** Bands as a percentage of TOTAL_WEIGHT; the first band the score reaches wins. */
export const BANDS = [
  {
    id: "resolved",
    min: 90,
    label: "Exposure handled",
    hint: "The number is out there, but it no longer unlocks a SIM swap, a scam call, or an account reset.",
  },
  {
    id: "strong",
    min: 70,
    label: "Mostly handled",
    hint: "Good position. Finish the steps that depend on your carrier and your bank.",
  },
  {
    id: "partial",
    min: 40,
    label: "Partly handled",
    hint: "The obvious steps are done; the SIM-swap and identity-check gaps are still open.",
  },
  {
    id: "exposed",
    min: 0,
    label: "Still exposed",
    hint: "The number is both actively targeted and still accepted as proof of who you are.",
  },
];

/**
 * A missing critical step caps the band at "Partly handled": no amount of
 * filtering or clean-up compensates for a number that can still be ported out
 * or still works as a verification answer.
 */
export const CRITICAL_CAP_PERCENT = 69;

const BY_ID = new Map(CHECKLIST.map((item) => [item.id, item]));
const MS_PER_DAY = 86400000;

/** First band whose minimum the percent reaches. Percent is clamped to 0..100. */
export function bandFor(percent) {
  const value = Number.isFinite(percent) ? Math.min(100, Math.max(0, percent)) : 0;
  return BANDS.find((band) => value >= band.min) || BANDS[BANDS.length - 1];
}

/** Human label for a window id; unknown ids fall back to the last window. */
export function windowLabel(id) {
  const found = WINDOW_BY_ID.get(id);
  return found ? found.label : WINDOWS[WINDOWS.length - 1].label;
}

function normalise(doneIds) {
  const seen = new Set();
  for (const raw of doneIds) {
    if (typeof raw === "string" && BY_ID.has(raw)) seen.add(raw);
  }
  return seen;
}

function windowDays(id) {
  const found = WINDOW_BY_ID.get(id);
  return found ? found.days : WINDOWS[WINDOWS.length - 1].days;
}

/**
 * Score a set of completed step ids.
 * Unknown and duplicate ids are ignored so a stale list cannot inflate the score.
 *
 * @param {string[]} doneIds ids from CHECKLIST already completed.
 * @returns {object} summary, or { error } for unusable input.
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
  const remaining = [];
  const missingCritical = [];

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

  // Highest-impact unfinished steps first; criticals always outrank the rest.
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
    remaining,
    missingCritical,
    groups,
    nextActions,
  };
}

/**
 * Whole days from one ISO date (YYYY-MM-DD) to another, using UTC midnights so
 * the result never shifts with the caller's time zone or with daylight saving.
 *
 * @param {string} fromISO earlier date, YYYY-MM-DD.
 * @param {string} toISO later date, YYYY-MM-DD.
 * @returns {{days:number}|{error:string}}
 */
export function daysBetween(fromISO, toISO) {
  const pattern = /^\d{4}-\d{2}-\d{2}$/;
  if (typeof fromISO !== "string" || !pattern.test(fromISO)) {
    return { error: "Enter the discovery date as YYYY-MM-DD." };
  }
  if (typeof toISO !== "string" || !pattern.test(toISO)) {
    return { error: "Enter the comparison date as YYYY-MM-DD." };
  }

  const from = Date.parse(`${fromISO}T00:00:00Z`);
  const to = Date.parse(`${toISO}T00:00:00Z`);
  if (!Number.isFinite(from) || !Number.isFinite(to)) {
    return { error: "That is not a real calendar date." };
  }

  const days = Math.round((to - from) / MS_PER_DAY);
  if (days < 0) {
    return { error: "The discovery date is in the future." };
  }
  return { days };
}

/**
 * Unfinished steps whose response window has already elapsed.
 *
 * @param {string[]} doneIds completed step ids.
 * @param {number} daysElapsed whole days since discovery.
 * @returns {{overdue:object[], dueSoon:object[], daysElapsed:number}|{error:string}}
 */
export function overdueSteps(doneIds, daysElapsed) {
  if (!Array.isArray(doneIds)) {
    return { error: "Completed steps must be provided as a list." };
  }
  const elapsed = Number(daysElapsed);
  if (!Number.isFinite(elapsed) || elapsed < 0) {
    return { error: "Days since discovery must be zero or more." };
  }

  const done = normalise(doneIds);
  const overdue = [];
  const dueSoon = [];

  for (const item of CHECKLIST) {
    if (done.has(item.id)) continue;
    const limit = windowDays(item.window);
    if (elapsed > limit) overdue.push(item);
    else dueSoon.push(item);
  }

  const byUrgency = (a, b) =>
    windowDays(a.window) - windowDays(b.window) ||
    Number(b.critical) - Number(a.critical) ||
    b.weight - a.weight;

  return {
    daysElapsed: elapsed,
    overdue: overdue.sort(byUrgency),
    dueSoon: dueSoon.sort(byUrgency),
  };
}
