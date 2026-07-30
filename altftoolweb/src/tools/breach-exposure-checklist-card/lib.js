/**
 * Card Number Exposure Checklist — scoring and combination-risk logic.
 *
 * Pure module: no React, no DOM, no clocks. Every exported function is total —
 * unusable input returns { error } rather than NaN or a misleading number.
 *
 * A card number is unlike a home address or a date of birth: it CAN be
 * rotated, and rotating it is the one step that fully neutralises the leak.
 * Everything else here is about the gap before that reissue lands, and about
 * how much worse the leak is if the dump held more than the bare number.
 *
 * A bare Primary Account Number (PAN) is not nothing: it passes the Luhn
 * checksum, its first six to eight digits (the BIN) identify the issuing
 * bank and card network, and it is enough for card-testing scripts to try
 * against merchants that under-check CVV and expiry, or that accept
 * stored-card recurring charges without asking for either again. It is a
 * long way short of a full card number + CVV + expiry, which is enough to
 * pass most online checkout forms outright. cardExposureRisk() scores that
 * gap rather than treating every leak of "a card number" the same.
 */

/** Response windows; `days` is only used for ordering and labelling here. */
export const WINDOWS = [
  { id: "day1", label: "Today", days: 1 },
  { id: "week1", label: "This week", days: 7 },
  { id: "month1", label: "This month", days: 30 },
  { id: "ongoing", label: "Ongoing", days: 90 },
];

const WINDOW_BY_ID = new Map(WINDOWS.map((w) => [w.id, w]));

/**
 * Other card fields that may have leaked alongside the bare number.
 *
 * `points` ranks how much closer each field brings the leak to a fully
 * usable card: a PIN is close to card-present (ATM/chip) capability, a CVV
 * plus expiry is enough for most online checkout forms, and a cardholder
 * name alone barely moves the needle.
 */
export const LEAKED_WITH = [
  { id: "expiry", label: "Expiry date", points: 3 },
  { id: "cvv", label: "CVV / CVC security code", points: 7 },
  { id: "name", label: "Cardholder name", points: 1 },
  { id: "billingAddress", label: "Billing address or ZIP/postal code", points: 2 },
  { id: "pin", label: "Card PIN", points: 8 },
  { id: "bankLogin", label: "Online banking username or password", points: 9 },
];

/** A bare, Luhn-valid PAN already reveals the issuing bank via its BIN. */
export const CARD_BASE_POINTS = 2;

const FIELD_BY_ID = new Map(LEAKED_WITH.map((field) => [field.id, field]));

/** Maximum combination score: every field plus the base PAN risk. */
export const MAX_COMBINATION_POINTS =
  LEAKED_WITH.reduce((sum, field) => sum + field.points, 0) + CARD_BASE_POINTS;

/**
 * Combination tiers, read top-down: the first tier the score reaches wins.
 * Thresholds mark the practical jumps in what the leak lets someone do.
 */
export const COMBINATION_TIERS = [
  {
    id: "card-present",
    min: 20,
    label: "Card-present equivalent risk",
    hint: "Close to what a cloned card or a stolen PIN would give an attacker in person. Treat this as urgently as a physically stolen card.",
  },
  {
    id: "checkout-ready",
    min: 12,
    label: "Passes most online checkout forms",
    hint: "Enough to pass a standard card-not-present checkout that checks both CVV and expiry. Card-testing risk is high right now.",
  },
  {
    id: "partial",
    min: 5,
    label: "Partial checkout risk",
    hint: "Not enough for most reputable checkouts on its own, but enough for weaker merchants and for a convincing phishing attempt.",
  },
  {
    id: "number-only",
    min: 0,
    label: "Bare number risk",
    hint: "Blocked by any merchant that checks CVV and expiry. Still usable for card-testing scripts and CVV-optional recurring billers.",
  },
];

/**
 * The checklist.
 *
 * weight   = share of the 100-point response score.
 * critical = leaving this open keeps the number fully exploitable, so it
 *            caps the score (see CRITICAL_CAP_PERCENT).
 */
export const CHECKLIST = [
  {
    id: "report-compromised",
    group: "Kill the number today",
    window: "day1",
    title: "Report the card as compromised, not lost or damaged",
    detail:
      "Say explicitly that the number was exposed in a data breach. A routine renewal or a \"damaged card\" replacement sometimes keeps the same number and only changes the expiry or CVV; a compromise report gets you a genuinely new number.",
    weight: 10,
    critical: true,
  },
  {
    id: "freeze-app",
    group: "Kill the number today",
    window: "day1",
    title: "Freeze the card in the banking app while you wait",
    detail:
      "Most banking apps have an instant freeze or lock toggle. It blocks new authorisations immediately without closing the account, and you can undo it in seconds if needed.",
    weight: 6,
  },
  {
    id: "check-pending",
    group: "Kill the number today",
    window: "day1",
    title: "Check pending authorisations, not just posted transactions",
    detail:
      "Card-testing scripts run small, odd-amount charges to confirm a number works before a real charge follows, and many only ever appear as a pending authorisation for a day or two before dropping off. Check pending activity in the app, not only the settled statement.",
    weight: 8,
    critical: true,
  },
  {
    id: "enable-alerts",
    group: "Kill the number today",
    window: "day1",
    title: "Turn on real-time alerts for every authorisation",
    detail:
      "Without the CVV and expiry, an attacker has to guess or brute-force them, which usually shows up as several small failed or successful attempts in quick succession. An alert for every transaction, not just ones over a threshold, is the only way to see that as it happens.",
    weight: 8,
    critical: true,
  },

  {
    id: "confirm-new-pan",
    group: "Close it out this week",
    window: "week1",
    title: "Confirm the replacement card has a different number",
    detail:
      "When the new card arrives, check the printed number itself, not just the expiry date. If it matches the exposed one, call back — some instant-replacement flows only reissue the plastic while the underlying account number stays the same.",
    weight: 8,
    critical: true,
  },
  {
    id: "deactivate-old",
    group: "Close it out this week",
    window: "week1",
    title: "Confirm the old number is fully blocked, not just paused",
    detail:
      "Ask directly whether the exposed number stops authorising immediately, or only once the new card is activated. A short overlap window is exactly when a card-testing script that already validated the number will try to use it.",
    weight: 6,
  },
  {
    id: "update-recurring",
    group: "Close it out this week",
    window: "week1",
    title: "Manually update the new number on every subscription and biller",
    detail:
      "Card-network account-updater services push the new number to some large recurring merchants automatically, but coverage is inconsistent and small or overseas billers rarely participate. Work through last month's statement and update each one by hand.",
    weight: 6,
  },
  {
    id: "cvv-optional-merchants",
    group: "Close it out this week",
    window: "week1",
    title: "Check statements for merchants that never asked for a CVV",
    detail:
      "Phone orders, some subscription trials and a number of checkout pages accept a card number and expiry without a CVV. Any legitimate charge that came through that way marks a merchant a bare-number attacker would also try, so remove the old card from it directly.",
    weight: 5,
  },

  {
    id: "wallets-browsers",
    group: "Scrub saved copies",
    window: "month1",
    title: "Remove the old number from browsers, wallets and apps",
    detail:
      "Delete the exposed number from saved payment methods in your browser, phone wallet, and any shopping or delivery app — not just the one marked default. A saved card left behind is one more copy of a number you already know is out.",
    weight: 5,
  },
  {
    id: "virtual-card",
    group: "Scrub saved copies",
    window: "month1",
    title: "Switch new online purchases to a virtual card number",
    detail:
      "Several banks and card networks issue single-merchant or single-use virtual numbers for online checkout. Using one for new signups means a future breach at that merchant exposes a disposable token instead of your real card number.",
    weight: 5,
  },
  {
    id: "statement-review",
    group: "Scrub saved copies",
    window: "month1",
    title: "Read two or three full statement cycles line by line",
    detail:
      "Bare-number fraud tends to show up as several small, oddly specific test charges rather than one large one, so scan every line rather than only checking the total due.",
    weight: 5,
  },
  {
    id: "bin-phishing",
    group: "Scrub saved copies",
    window: "month1",
    title: "Treat unexpected \"verify your card\" contact as phishing",
    detail:
      "The first six to eight digits of the exposed number (the BIN) identify your card network and issuing bank on their own, which is enough for a scammer to fake a convincing text or call from \"your bank\". Verify any such contact by calling the number printed on the card, never one the message supplies.",
    weight: 4,
  },

  {
    id: "dispute-rights",
    group: "Stay ahead of it",
    window: "ongoing",
    title: "Know your zero-liability and dispute rights",
    detail:
      "Visa's and Mastercard's zero-liability policies, and most issuer terms generally, cover unauthorised transactions reported promptly. You are very rarely on the hook for a charge made with a number that leaked from a breach you did not cause — dispute anything unfamiliar rather than writing it off.",
    weight: 6,
  },
  {
    id: "autopay-recheck",
    group: "Stay ahead of it",
    window: "ongoing",
    title: "Recheck autopay so nothing silently fails",
    detail:
      "The most common self-inflicted harm after a reissue is a utility, loan or insurance autopay that quietly fails on the old number and only surfaces as a late fee weeks later. Walk through autopay-linked bills specifically, not just the recurring charges visible on the old statement.",
    weight: 7,
  },
  {
    id: "long-tail-watch",
    group: "Stay ahead of it",
    window: "ongoing",
    title: "Keep watching for months, not just the first week",
    detail:
      "Card-testing scripts sometimes hold a validated number and return to it later, and a merchant that missed the account-updater push can resurface an old charge attempt weeks on. Keep the alerts on rather than turning them off once the first week is quiet.",
    weight: 5,
  },
  {
    id: "combined-leak-check",
    group: "Stay ahead of it",
    window: "ongoing",
    title: "Check whether the same breach exposed more than the card",
    detail:
      "If the same dump also included your name, billing address or a government ID, the response is broader than a card reissue — that combination supports identity theft, not only card fraud, and is worth handling as its own exposure.",
    weight: 6,
  },
];

/** Display order of the groups used by CHECKLIST. */
export const GROUPS = [
  "Kill the number today",
  "Close it out this week",
  "Scrub saved copies",
  "Stay ahead of it",
];

/** Sum of all weights. The checklist is authored so that this equals 100. */
export const TOTAL_WEIGHT = CHECKLIST.reduce((sum, item) => sum + item.weight, 0);

/** Nothing is ticked at first paint — unlike an address or a birth date, none
 * of this is realistically already done before you learn the number leaked. */
export const DEFAULT_DONE = [];

/** Fields assumed leaked at first paint — the bare-number baseline this tool
 * is about, as opposed to a full card number + CVV + expiry. */
export const DEFAULT_FIELDS = [];

/** Bands as a percentage of TOTAL_WEIGHT; the first band the score reaches wins. */
export const BANDS = [
  { id: "resolved", min: 90, label: "Exposure neutralised", hint: "The old number is dead. It authorises nothing, wherever it still sits." },
  { id: "strong", min: 70, label: "Mostly neutralised", hint: "The number is dead or nearly so; finish the monitoring and clean-up steps." },
  { id: "partial", min: 40, label: "Partly handled", hint: "The obvious steps are done; the number may still be live somewhere." },
  { id: "exposed", min: 0, label: "Still exposed", hint: "The exposed number is likely still authorising charges right now." },
];

/**
 * A missing critical step caps the band at "Partly handled": nothing else
 * matters while the old number can still be charged.
 */
export const CRITICAL_CAP_PERCENT = 69;

const BY_ID = new Map(CHECKLIST.map((item) => [item.id, item]));

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

function normalise(ids, lookup) {
  const seen = new Set();
  for (const raw of ids) {
    if (typeof raw === "string" && lookup.has(raw)) seen.add(raw);
  }
  return seen;
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

  const done = normalise(doneIds, BY_ID);
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
 * How exploitable the leak is once the bare card number is combined with
 * whatever else was exposed. The base PAN risk is always counted, so the
 * floor is CARD_BASE_POINTS.
 *
 * `fullCardGrade` marks the CVV-plus-expiry pairing that is enough to pass
 * most card-not-present checkout forms outright — the "full card number +
 * CVV + expiry" case this tool is explicitly scoped against.
 * `cardPresentGrade` marks a leaked PIN, which brings the leak close to what
 * a cloned card or a stolen chip-and-PIN card would give an attacker in
 * person, regardless of the raw point total.
 *
 * @param {string[]} leakedFieldIds ids from LEAKED_WITH also exposed.
 * @returns {object} risk summary, or { error } for unusable input.
 */
export function cardExposureRisk(leakedFieldIds) {
  if (!Array.isArray(leakedFieldIds)) {
    return { error: "Exposed fields must be provided as a list." };
  }

  const leaked = normalise(leakedFieldIds, FIELD_BY_ID);
  let points = CARD_BASE_POINTS;
  const included = [];

  for (const field of LEAKED_WITH) {
    if (leaked.has(field.id)) {
      points += field.points;
      included.push(field);
    }
  }

  const fullCardGrade = leaked.has("cvv") && leaked.has("expiry");
  const cardPresentGrade = leaked.has("pin") || leaked.has("bankLogin");

  const tier = cardPresentGrade
    ? COMBINATION_TIERS[0]
    : fullCardGrade && COMBINATION_TIERS[1].min > points
      ? COMBINATION_TIERS[1]
      : COMBINATION_TIERS.find((entry) => points >= entry.min) ||
        COMBINATION_TIERS[COMBINATION_TIERS.length - 1];

  const percent =
    MAX_COMBINATION_POINTS > 0 ? Math.round((points / MAX_COMBINATION_POINTS) * 100) : 0;

  return {
    points,
    maxPoints: MAX_COMBINATION_POINTS,
    percent,
    fields: included,
    fieldCount: included.length,
    tier: tier.id,
    tierLabel: tier.label,
    tierHint: tier.hint,
    fullCardGrade,
    cardPresentGrade,
  };
}
