/**
 * Date of Birth Exposure Checklist — scoring and combination-risk logic.
 *
 * Pure module: no React, no DOM, no clocks. Every exported function is total —
 * unusable input returns { error } rather than NaN or a misleading number.
 *
 * Two ideas drive the model:
 *
 * 1. A date of birth cannot be rotated. There is no "change your DOB" step, so
 *    the whole response is about removing the date from credentials and from
 *    verification flows that still treat it as a secret.
 * 2. DOB risk is combinatorial. On its own a birth date proves almost nothing;
 *    combined with a full name and an address it completes the knowledge-based
 *    verification set that call centres and account-recovery flows still use.
 *    combinationRisk() scores that pairing rather than the date alone.
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
 * Other identity fields that may have leaked alongside the date of birth.
 *
 * `points` ranks how much each field adds to a knowledge-based verification
 * attempt: a government ID number or a bank account number is accepted as near
 * proof on its own, whereas an email address is mostly a routing detail.
 */
export const IDENTITY_FIELDS = [
  { id: "name", label: "Full legal name", points: 2 },
  { id: "address", label: "Home address", points: 3 },
  { id: "phone", label: "Mobile number", points: 3 },
  { id: "email", label: "Email address", points: 2 },
  { id: "idNumber", label: "Government ID number (PAN, Aadhaar, SSN, NI)", points: 6 },
  { id: "familyNames", label: "Parent or mother's maiden name", points: 3 },
  { id: "accountNumber", label: "Bank account or card number", points: 5 },
];

/** The birth date itself is always part of this exposure, so it seeds the score. */
export const DOB_BASE_POINTS = 3;

const FIELD_BY_ID = new Map(IDENTITY_FIELDS.map((field) => [field.id, field]));

/** Maximum combination score: every field plus the birth date. */
export const MAX_COMBINATION_POINTS =
  IDENTITY_FIELDS.reduce((sum, field) => sum + field.points, 0) + DOB_BASE_POINTS;

/**
 * Combination tiers, read top-down: the first tier the score reaches wins.
 * The thresholds mark the practical jumps — enough to pass a call-centre check,
 * then enough to open something new in your name.
 */
export const COMBINATION_TIERS = [
  {
    id: "full-set",
    min: 16,
    label: "Full identity set",
    hint: "Enough to open accounts, not just to talk past a call centre. Treat this as identity theft risk, not a privacy nuisance.",
  },
  {
    id: "kba-passing",
    min: 11,
    label: "Passes most phone checks",
    hint: "Someone calling your bank or telco can answer the standard questions. Verbal passwords and port-out locks are the fix.",
  },
  {
    id: "partial",
    min: 7,
    label: "Partial identity profile",
    hint: "Not enough on its own, but it makes targeted phishing convincing and completes other leaks.",
  },
  {
    id: "date-only",
    min: 0,
    label: "Mostly the date alone",
    hint: "Low immediate risk. The work is making sure the date is not doing credential duty anywhere.",
  },
];

/**
 * The checklist.
 *
 * weight   = share of the 100-point response score.
 * critical = the date is still functioning as a secret somewhere, which is the
 *            only way a leaked DOB causes direct loss. Caps the score.
 */
export const CHECKLIST = [
  {
    id: "dob-pins",
    group: "Stop the date being a credential",
    window: "day1",
    title: "Change every PIN and password built from the date",
    detail:
      "DDMM and DDMMYY are the two most-guessed four and six-digit PIN patterns, and a leaked birth date turns a guess into a lookup. Check the card PIN, phone unlock code, locker code, door code and any password containing the year.",
    weight: 9,
    critical: true,
  },
  {
    id: "security-answers",
    group: "Stop the date being a credential",
    window: "day1",
    title: "Replace security answers that ask for a birth date or birthplace",
    detail:
      "Date of birth, place of birth and star sign are all derived from the same leaked field. Swap them for an unrelated stored phrase kept in your password manager — the answer never has to be true.",
    weight: 9,
    critical: true,
  },
  {
    id: "family-dates",
    group: "Stop the date being a credential",
    window: "day1",
    title: "Check the family birth dates too",
    detail:
      "A partner's or child's birthday is the second most common PIN source, and those dates are usually public on the same social profiles. Change any that are still in use.",
    weight: 5,
  },

  {
    id: "telco-portout",
    group: "Replace it in verification flows",
    window: "week1",
    title: "Set a port-out PIN or account password with your mobile operator",
    detail:
      "Date of birth is a standard call-centre identity question, and the payoff for passing it is a SIM swap that captures every SMS one-time password. A separate port-out PIN removes the date from that conversation.",
    weight: 8,
    critical: true,
  },
  {
    id: "bank-verbal",
    group: "Replace it in verification flows",
    window: "week1",
    title: "Ask the bank for a verbal password or callback-only rule",
    detail:
      "Most retail banks will add a spoken passphrase, a callback-to-registered-number rule, or a note requiring branch verification for high-value changes. Ask specifically what identity questions the phone team uses today.",
    weight: 7,
    critical: true,
  },
  {
    id: "mfa-upgrade",
    group: "Replace it in verification flows",
    window: "week1",
    title: "Move high-value accounts off SMS codes",
    detail:
      "An authenticator app or a passkey is not defeated by a SIM swap, which is the realistic follow-on attack. Prioritise email, banking, and whichever account can reset the others.",
    weight: 8,
  },
  {
    id: "recovery-review",
    group: "Replace it in verification flows",
    window: "week1",
    title: "Audit account recovery on your primary email",
    detail:
      "The mailbox that receives password resets is the single point of failure. Confirm its recovery phone and address are current, remove old ones, and store the offline backup codes somewhere you can reach without the phone.",
    weight: 6,
  },

  {
    id: "social-birthday",
    group: "Reduce where the date is published",
    window: "month1",
    title: "Hide or remove the birthday on social profiles",
    detail:
      "Removing it will not un-leak the date, but it stops the leak being confirmed and cross-checked against the profile that also shows your employer, city and family names.",
    weight: 5,
  },
  {
    id: "minimal-forms",
    group: "Reduce where the date is published",
    window: "month1",
    title: "Stop supplying the exact date where age is what is needed",
    detail:
      "Loyalty schemes, apps and sign-up forms usually want an age bracket, not a legal identifier. Give the year or an age range unless the organisation has a statutory reason to hold the full date.",
    weight: 4,
  },
  {
    id: "loyalty-purge",
    group: "Reduce where the date is published",
    window: "month1",
    title: "Delete the date from retail and loyalty accounts",
    detail:
      "Marketing databases are breached far more often than banks and hold the same date. Edit or blank the field in the accounts you still use, and close the ones you do not.",
    weight: 4,
  },
  {
    id: "cv-bio",
    group: "Reduce where the date is published",
    window: "month1",
    title: "Take the date off CVs, bios and public documents",
    detail:
      "A CV with a birth date circulates through job boards and recruiter inboxes indefinitely. No employer in most jurisdictions needs it before an offer is made.",
    weight: 3,
  },
  {
    id: "id-scan-hygiene",
    group: "Reduce where the date is published",
    window: "month1",
    title: "Stop sending full ID scans over chat and email",
    detail:
      "An ID image carries the date, the number, the photo and the signature in one file, and it stays in the recipient's cloud backup forever. Use a masked or redacted copy where the verifier accepts one.",
    weight: 5,
  },

  {
    id: "credit-freeze",
    group: "Watch for misuse",
    window: "ongoing",
    title: "Freeze credit or set bureau alerts",
    detail:
      "A birth date plus a name and an ID number is the application set for new credit. A freeze blocks new lending checks until you lift it, and costs nothing at most bureaus.",
    weight: 7,
  },
  {
    id: "id-authentication-log",
    group: "Watch for misuse",
    window: "ongoing",
    title: "Lock the national ID and review its authentication history",
    detail:
      "Where the ID scheme allows it — Aadhaar biometric lock and the authentication history log in India, for example — lock it and read the log for verifications you did not make.",
    weight: 5,
  },
  {
    id: "tax-insurance-fraud",
    group: "Watch for misuse",
    window: "ongoing",
    title: "Watch for a tax filing or insurance claim in your name",
    detail:
      "Refund fraud and medical claim fraud both start from a name and date of birth. File your return early, and read insurance statements for treatments and claims you never had.",
    weight: 5,
  },
  {
    id: "statement-review",
    group: "Watch for misuse",
    window: "ongoing",
    title: "Read statements for small test transactions",
    detail:
      "Card testing starts with a token amount to check the card works before a large charge follows. Scan for unfamiliar small debits rather than only checking the balance.",
    weight: 5,
  },
  {
    id: "birthday-phishing",
    group: "Watch for misuse",
    window: "ongoing",
    title: "Treat birthday-timed messages as suspect",
    detail:
      "A knowing your birthday makes a greeting, a voucher or a bank message far more convincing. Around your birthday, verify anything that asks you to click, pay or confirm a code.",
    weight: 5,
  },
];

/** Display order of the groups used by CHECKLIST. */
export const GROUPS = [
  "Stop the date being a credential",
  "Replace it in verification flows",
  "Reduce where the date is published",
  "Watch for misuse",
];

/** Sum of all weights. The checklist is authored so that this equals 100. */
export const TOTAL_WEIGHT = CHECKLIST.reduce((sum, item) => sum + item.weight, 0);

/** Ticked at first paint; almost everyone has already hidden the social birthday. */
export const DEFAULT_DONE = ["social-birthday"];

/** Fields assumed leaked at first paint — the common "name and DOB" pairing. */
export const DEFAULT_FIELDS = ["name", "email"];

/** Bands as a percentage of TOTAL_WEIGHT; the first band the score reaches wins. */
export const BANDS = [
  { id: "resolved", min: 90, label: "Exposure neutralised", hint: "The date is public but it no longer opens anything." },
  { id: "strong", min: 70, label: "Mostly neutralised", hint: "The credential work is done; finish the monitoring steps." },
  { id: "partial", min: 40, label: "Partly handled", hint: "The date is still accepted as identity proof somewhere that matters." },
  { id: "exposed", min: 0, label: "Still exposed", hint: "The date is likely still doing credential or verification duty." },
];

/**
 * A missing critical step caps the band at "Partly handled": tidying up social
 * profiles cannot offset a card PIN that is still the user's birthday.
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
 * How dangerous the leak is once the birth date is combined with whatever else
 * was exposed. The date is always counted, so the floor is DOB_BASE_POINTS.
 *
 * `kbaComplete` marks the classic knowledge-based verification triple — full
 * name, home address and date of birth — which is what most telephone identity
 * checks still rely on.
 *
 * @param {string[]} leakedFieldIds ids from IDENTITY_FIELDS also exposed.
 * @returns {object} risk summary, or { error } for unusable input.
 */
export function combinationRisk(leakedFieldIds) {
  if (!Array.isArray(leakedFieldIds)) {
    return { error: "Exposed fields must be provided as a list." };
  }

  const leaked = normalise(leakedFieldIds, FIELD_BY_ID);
  let points = DOB_BASE_POINTS;
  const included = [];

  for (const field of IDENTITY_FIELDS) {
    if (leaked.has(field.id)) {
      points += field.points;
      included.push(field);
    }
  }

  // A government ID number together with the full name and address is the set a
  // credit or account application actually asks for, so it is treated as the top
  // tier however few other fields leaked — points alone would understate it.
  const applicationGrade =
    leaked.has("idNumber") && leaked.has("name") && leaked.has("address");

  const tier = applicationGrade
    ? COMBINATION_TIERS[0]
    : COMBINATION_TIERS.find((entry) => points >= entry.min) ||
      COMBINATION_TIERS[COMBINATION_TIERS.length - 1];

  const percent = MAX_COMBINATION_POINTS > 0
    ? Math.round((points / MAX_COMBINATION_POINTS) * 100)
    : 0;

  return {
    points,
    maxPoints: MAX_COMBINATION_POINTS,
    percent,
    fields: included,
    fieldCount: included.length,
    tier: tier.id,
    tierLabel: tier.label,
    tierHint: tier.hint,
    applicationGrade,
    kbaComplete: leaked.has("name") && leaked.has("address"),
  };
}
