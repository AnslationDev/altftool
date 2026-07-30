/**
 * Home Address Exposure Checklist — scoring and triage logic.
 *
 * Pure module: no React, no DOM, no clocks. Dates are always passed in as
 * arguments so the same input always produces the same output. Every exported
 * function is total — unusable input returns { error } instead of NaN or a
 * misleading number.
 *
 * The checklist models the one fact that makes a leaked home address different
 * from a leaked password: the address cannot be rotated. The response is
 * therefore split between physical safety, removing the address from the public
 * sources that keep republishing it, and demoting the address as a verification
 * token at banks, telcos and account-recovery flows.
 */

/**
 * Response windows. `days` is the age, in days from the moment you learned about
 * the exposure, at which an unfinished step in that window counts as overdue.
 * The windows follow ordinary incident-response practice: contain first, make
 * the home safe next, then work through removals that depend on third parties.
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
 * weight   = share of the 100-point response score. Weights are a risk ranking:
 *            steps that stop physical harm or close an account-recovery path
 *            carry the most; cosmetic clean-up carries the least.
 * critical = leaving this open keeps the exposure fully exploitable, so it caps
 *            the score (see CRITICAL_CAP_PERCENT).
 */
export const CHECKLIST = [
  {
    id: "confirm-scope",
    group: "Contain it today",
    window: "day1",
    title: "Write down exactly what was published with the address",
    detail:
      "An address on its own is low value. Address plus full name, phone number and date of birth is the combination that passes telephone identity checks and powers doxxing. List the fields, the source URL and the date you found it — every later step depends on that list.",
    weight: 9,
    critical: true,
  },
  {
    id: "tell-household",
    group: "Contain it today",
    window: "day1",
    title: "Tell everyone who lives at the address",
    detail:
      "Housemates, family and anyone who answers the door need to know before a caller does. Agree that nobody confirms names, work schedules or who lives there to an unexpected visitor, courier or phone caller.",
    weight: 6,
    critical: true,
  },
  {
    id: "screenshot-evidence",
    group: "Contain it today",
    window: "day1",
    title: "Capture evidence before you request removal",
    detail:
      "Screenshot the page with the full URL and a visible timestamp, and save the post or message ID. A successful takedown destroys the proof a police complaint or platform escalation needs.",
    weight: 5,
  },
  {
    id: "delivery-divert",
    group: "Contain it today",
    window: "day1",
    title: "Divert deliveries to a locker or pickup point",
    detail:
      "Parcels left at the door confirm the address is occupied and advertise what you buy. Switch high-value orders to a collection point while the exposure is fresh.",
    weight: 5,
  },

  {
    id: "door-camera",
    group: "Make the home safe",
    window: "week1",
    title: "Add a doorbell camera or peephole and use it",
    detail:
      "The realistic threat after an address leak is someone turning up to intimidate, to social-engineer a neighbour, or to check whether the house is empty. Seeing who is there before opening the door removes most of that value.",
    weight: 6,
  },
  {
    id: "locks-codes",
    group: "Make the home safe",
    window: "week1",
    title: "Change entry codes only if codes or keys leaked too",
    detail:
      "An address by itself is not a reason to rekey. If a gate PIN, smart-lock code, building access code or key-safe combination appeared in the same leak, change those the same week and remove old codes from the device.",
    weight: 5,
  },
  {
    id: "police-report",
    group: "Make the home safe",
    window: "week1",
    title: "File a police complaint if the leak came with threats",
    detail:
      "If the address was posted alongside a threat, an incitement or repeated harassment, report it. In India that is cybercrime.gov.in or the local cyber cell; elsewhere your local force. The incident number is what platforms, employers and landlords act on.",
    weight: 7,
  },
  {
    id: "brief-gatekeepers",
    group: "Make the home safe",
    window: "week1",
    title: "Brief the school office and building security",
    detail:
      "Tell the school, creche or building guard not to release your address, movements or your children to anyone who is not on the authorised list, however convincing the story.",
    weight: 4,
  },

  {
    id: "people-search-optout",
    group: "Scrub the public sources",
    window: "month1",
    title: "Opt out of people-search and data-broker listings",
    detail:
      "People-search sites reassemble the address from public records and keep republishing it. Work through their opt-out forms one by one, keep the confirmation emails, and recheck in three months because relistings are common.",
    weight: 8,
  },
  {
    id: "street-view-blur",
    group: "Scrub the public sources",
    window: "month1",
    title: "Request a permanent blur of the house on Street View",
    detail:
      "Google accepts a blur request on the property itself through Report a problem on the Street View image. It removes the house number, gate and vehicles from the panorama, and the blur is permanent once applied.",
    weight: 4,
  },
  {
    id: "registry-address",
    group: "Scrub the public sources",
    window: "month1",
    title: "Replace the residential address in public registries",
    detail:
      "Domain WHOIS, company director filings and similar registries publish a home address by default. Enable domain privacy and file a separate service or correspondence address where the registry allows one.",
    weight: 5,
  },
  {
    id: "stale-accounts",
    group: "Scrub the public sources",
    window: "month1",
    title: "Delete saved addresses from apps you no longer use",
    detail:
      "Shopping, food-delivery and ride apps keep every address you ever typed, and each one is another breach that can leak it again. Delete the saved entries, not just the default.",
    weight: 5,
  },
  {
    id: "photo-metadata",
    group: "Scrub the public sources",
    window: "month1",
    title: "Remove posts and photos that pin down the building",
    detail:
      "A house number, gate, nameplate, street sign or delivery label in a photo confirms the leaked address is current. Geotagged uploads do the same without any visible landmark.",
    weight: 4,
  },

  {
    id: "kba-answers",
    group: "Demote the address as an identity check",
    window: "ongoing",
    title: "Stop using the address as a security answer or verification token",
    detail:
      "A published address answers the question many call centres and password-reset flows still ask. Replace any address-based security answer with an unrelated stored phrase, and never treat someone knowing your address as proof of who they are.",
    weight: 9,
    critical: true,
  },
  {
    id: "bank-telco-flag",
    group: "Demote the address as an identity check",
    window: "ongoing",
    title: "Set a verbal password with the bank and mobile operator",
    detail:
      "Ask for a spoken passphrase, a callback-only rule, or a port-out lock on the mobile number. Address confirmation is a routine step in telephone identity checks and in SIM-swap attempts, and this replaces it.",
    weight: 7,
    critical: true,
  },
  {
    id: "credit-monitor",
    group: "Demote the address as an identity check",
    window: "ongoing",
    title: "Freeze or monitor credit if ID numbers leaked with the address",
    detail:
      "An address paired with a PAN, national ID or account number is enough to apply for credit. A freeze or a bureau alert stops a new account opening quietly in your name; an address alone does not warrant one.",
    weight: 5,
  },
  {
    id: "mail-watch",
    group: "Demote the address as an identity check",
    window: "ongoing",
    title: "Watch for post you did not ask for",
    detail:
      "Welcome letters, replacement cards, KYC forms and address-change confirmations arriving unprompted are the earliest visible sign that someone is using the address to open accounts. Query each one directly with the issuer.",
    weight: 6,
  },
];

/** Display order of the groups used by CHECKLIST. */
export const GROUPS = [
  "Contain it today",
  "Make the home safe",
  "Scrub the public sources",
  "Demote the address as an identity check",
];

/** Sum of all weights. The checklist is authored so that this equals 100. */
export const TOTAL_WEIGHT = CHECKLIST.reduce((sum, item) => sum + item.weight, 0);

/** Ticked at first paint because most people have already done this much. */
export const DEFAULT_DONE = ["confirm-scope"];

/** Bands as a percentage of TOTAL_WEIGHT; the first band the score reaches wins. */
export const BANDS = [
  { id: "resolved", min: 90, label: "Exposure handled", hint: "The address is public but it no longer unlocks anything." },
  { id: "strong", min: 70, label: "Mostly handled", hint: "Good position. Finish the removals that depend on third parties." },
  { id: "partial", min: 40, label: "Partly handled", hint: "The obvious steps are done; the identity-check gaps are still open." },
  { id: "exposed", min: 0, label: "Still exposed", hint: "The address is both findable and still accepted as proof of who you are." },
];

/**
 * A missing critical step caps the band at "Partly handled": no amount of
 * clean-up compensates for an address that still works as a verification answer.
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
