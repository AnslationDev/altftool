/**
 * Smart Speaker Privacy Setup Guide — checklist scoring plus a retention model
 * that turns how much you use the assistant, and the auto-delete window you
 * pick, into how many recordings are actually sitting in the account.
 *
 * Pure module: no React, no DOM, no clocks. Every exported function is total —
 * unusable input returns { error } rather than NaN, Infinity or a wrong number.
 *
 * Setting names follow the mainstream assistants (Amazon Alexa: Alexa app >
 * Settings > Alexa Privacy; Google Assistant: Google account > Web & App /
 * Voice & Audio Activity). Follow the description rather than an exact label,
 * since menus move between app versions.
 */

/**
 * The checklist.
 *
 * weight   = share of the 100-point score, ranked by consequence. Anything
 *            that keeps a permanent, human-reviewable recording of what was
 *            said near the device outranks convenience settings.
 * critical = on its own enough to leave real audio stored indefinitely or
 *            reviewable by a stranger, so it caps the score
 *            (CRITICAL_CAP_PERCENT).
 */
export const CHECKLIST = [
  {
    id: "mic-mute-button",
    group: "Microphone & camera control",
    title: "Use the physical mic-mute button when you want a guaranteed-off room",
    detail:
      "The mute button on Echo and Nest speakers cuts power to the microphone circuit in hardware, not software, so it still works if the assistant software is misbehaving or compromised. The ring or bar light confirms the mic is off — use it during private conversations rather than trusting the wake word alone.",
    weight: 7,
    critical: false,
  },
  {
    id: "camera-shutter",
    group: "Microphone & camera control",
    title: "Close the camera shutter on any smart display when it isn't in a call",
    detail:
      "Devices with a screen, such as an Echo Show or Nest Hub Max, add a camera to the microphone. Most ship with a physical shutter or cap — use it outside video calls so a software bug or account compromise can't turn on a live camera feed.",
    weight: 4,
    critical: false,
  },
  {
    id: "wake-word-review",
    group: "Microphone & camera control",
    title: "Review wake-word sensitivity so it isn't triggering on the TV or nearby talk",
    detail:
      "The microphone stays powered at all times, but audio is only sent to the cloud after an on-device model recognises the wake word — ordinary conversation before that point is never transmitted. A wake word that misfires on a similar-sounding word from the television or a name in conversation sends real audio unnecessarily, so tightening sensitivity or picking a less common wake word cuts down what ends up in your history.",
    weight: 4,
    critical: false,
  },
  {
    id: "disable-recording-storage",
    group: "Voice recordings & retention",
    title: "Turn off voice recording storage if you don't need a history",
    detail:
      "Alexa Privacy Settings lets you choose 'Don't save recordings', and Google's Voice & Audio Activity can be paused entirely. With this off, a request is processed to generate a response and then discarded — there is nothing left to leak, be subpoenaed, or reviewed by a contractor.",
    weight: 13,
    critical: true,
  },
  {
    id: "opt-out-human-review",
    group: "Voice recordings & retention",
    title: "Opt out of human review of your audio",
    detail:
      "Reporting in 2019 revealed that contractors working for both Amazon and Google routinely listened to short snippets of real recordings to improve transcription accuracy. Both companies now offer an explicit opt-out — the 'help improve' toggle in Alexa Privacy Settings, and the human-review setting inside Google's Voice & Audio Activity — turn it off unless you've deliberately chosen otherwise.",
    weight: 11,
    critical: true,
  },
  {
    id: "auto-delete-shortest",
    group: "Voice recordings & retention",
    title: "If you do keep history, set auto-delete to the shortest window",
    detail:
      "Both platforms offer rolling auto-delete on top of manual deletion, typically a 3-month or 18-month choice. Three months keeps enough recent history for the assistant to feel personalised while capping how much accumulates if you forget to check back.",
    weight: 8,
    critical: false,
  },
  {
    id: "delete-existing-history",
    group: "Voice recordings & retention",
    title: "Delete the recordings that have already piled up",
    detail:
      "Changing the retention setting only affects new recordings — anything saved before today stays until it's removed by hand. Use 'Delete all recordings' in the Alexa app, or the Google Assistant activity page, to clear the backlog in one step.",
    weight: 6,
    critical: false,
  },
  {
    id: "review-voice-id",
    group: "Voice recordings & retention",
    title: "Review enrolled voice profiles (Voice ID / Voice Match)",
    detail:
      "Voice-recognition profiles let the assistant tell household members apart and personalise responses. Remove profiles left behind by guests or former housemates, since a stored voiceprint is itself sensitive biometric data.",
    weight: 4,
    critical: false,
  },
  {
    id: "review-installed-skills",
    group: "Skills, actions & purchases",
    title: "Audit installed skills or actions and remove ones you don't use",
    detail:
      "Every enabled skill is a third-party integration with some access to your requests. One installed for a single use case and then forgotten is unmonitored attack surface with no ongoing benefit — remove it.",
    weight: 7,
    critical: false,
  },
  {
    id: "audit-skill-permissions",
    group: "Skills, actions & purchases",
    title: "Check what each remaining skill can actually access",
    detail:
      "Skills can request permissions such as your address, shopping lists, contacts or location. Open each one's permission page and revoke anything the skill doesn't need for the feature you actually use.",
    weight: 7,
    critical: false,
  },
  {
    id: "require-purchase-pin",
    group: "Skills, actions & purchases",
    title: "Require a voice PIN before purchases, or turn voice purchasing off",
    detail:
      "Without a confirmation code, anyone who can speak to the device — a child, a guest, even a TV advert — can trigger a purchase or reorder. A four-digit voice purchase code closes this, or disable purchasing entirely if you never use it.",
    weight: 5,
    critical: false,
  },
  {
    id: "review-linked-accounts",
    group: "Skills, actions & purchases",
    title: "Review accounts linked to the assistant (calendar, music, smart home)",
    detail:
      "Linked accounts let the assistant read calendar events, playlists or contacts to answer naturally. Unlink anything you no longer use — a stale link keeps working invisibly in the background.",
    weight: 4,
    critical: false,
  },
  {
    id: "two-factor",
    group: "Account & sharing",
    title: "Turn on two-factor authentication on the Amazon or Google account",
    detail:
      "The account behind the speaker can usually view voice history, place purchases and reach linked smart-home devices. Protect it with an authenticator app or passkey rather than a password alone.",
    weight: 9,
    critical: true,
  },
  {
    id: "unique-password",
    group: "Account & sharing",
    title: "Use a password that appears on no other account",
    detail:
      "Amazon and Google accounts are a standard credential-stuffing target: a password breached on an unrelated site is retried automatically against major providers. A unique password removes that path entirely.",
    weight: 7,
    critical: true,
  },
  {
    id: "ad-personalization-off",
    group: "Account & sharing",
    title: "Turn off ad personalisation based on voice activity",
    detail:
      "Both platforms can use assistant interactions to target ads unless you opt out in the account's ad settings. Turning it off doesn't change what is recorded, but it stops that data being used to build an advertising profile.",
    weight: 2,
    critical: false,
  },
  {
    id: "guest-kid-profiles",
    group: "Account & sharing",
    title: "Set up guest mode or a kids' profile instead of sharing your main login",
    detail:
      "A shared adult login gives visitors and children the same purchasing and history access as you. Guest mode and dedicated kids' profiles keep their use of the speaker separate from your account.",
    weight: 2,
    critical: false,
  },
];

/** Display order of the groups used by CHECKLIST. */
export const GROUPS = [
  "Microphone & camera control",
  "Voice recordings & retention",
  "Skills, actions & purchases",
  "Account & sharing",
];

/** Sum of all weights. Authored so that this equals 100. */
export const TOTAL_WEIGHT = CHECKLIST.reduce((sum, item) => sum + item.weight, 0);

/** Nothing is ticked by default: every item here is off, or on, by default in a way that favours less privacy. */
export const DEFAULT_DONE = [];

/** Score bands, read top-down: the first band the score reaches wins. */
export const BANDS = [
  { id: "hardened", min: 90, label: "Hardened", hint: "Almost nothing is being kept, and no one outside your household can review it." },
  { id: "strong", min: 70, label: "Well secured", hint: "Solid. Tidy up retention length and skill permissions next." },
  { id: "partial", min: 40, label: "Partly secured", hint: "Recordings are still being stored or reviewed, or the account itself is exposed." },
  { id: "at-risk", min: 0, label: "At risk", hint: "Recordings are being kept indefinitely and the account has no extra protection." },
];

/** A missing critical control caps the band at "Partly secured". */
export const CRITICAL_CAP_PERCENT = 69;

const byId = new Map(CHECKLIST.map((item) => [item.id, item]));

/** First band whose minimum the percent reaches. Percent clamped to 0..100. */
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
 * Score a set of completed control ids. Unknown ids and duplicates are ignored.
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
 * Retention settings offered by the mainstream assistants, in months. `null`
 * means no automatic limit at all — recordings only leave the account when
 * someone deletes them by hand.
 */
export const RETENTION_PRESETS = [
  {
    id: "keep-forever",
    label: "Keep every recording until I delete it myself",
    windowMonths: null,
    note: "This is the default on many accounts set up before auto-delete existed. Nothing ages out on its own.",
  },
  {
    id: "18mo",
    label: "Auto-delete recordings older than 18 months",
    windowMonths: 18,
    note: "The longer of the two rolling auto-delete windows most assistants offer.",
  },
  {
    id: "3mo",
    label: "Auto-delete recordings older than 3 months",
    windowMonths: 3,
    note: "The shortest rolling window on offer, short of turning storage off entirely.",
  },
  {
    id: "off",
    label: "Don't save recordings at all",
    windowMonths: 0,
    note: "Each request is used to generate a response and then discarded — nothing accumulates.",
  },
];

/** Average length of a calendar month, used so the maths stays consistent regardless of which months are involved. */
const DAYS_PER_MONTH = 30.44;
/** Sanity ceilings on the two numeric inputs. */
export const MAX_QUERIES_PER_DAY = 500;
export const MAX_ACCOUNT_AGE_MONTHS = 240;

/** Bands for how large the stored history is right now. Read top-down: the first band the count reaches wins. */
export const STORAGE_BANDS = [
  { id: "none", max: 0, label: "Nothing kept", hint: "There is no stored history to leak, be subpoenaed, or reviewed by a stranger." },
  { id: "trimmed", max: 250, label: "A trimmed history", hint: "A bounded few months of queries — enough for personalisation, not a life record." },
  { id: "accumulating", max: 2500, label: "Years of accumulation", hint: "Multiple years of queries are sitting in the account right now." },
  { id: "extensive", max: Infinity, label: "An extensive archive", hint: "This is close to your entire usage history on the platform, and it isn't going anywhere on its own." },
];

const presetById = new Map(RETENTION_PRESETS.map((entry) => [entry.id, entry]));
const SHORTEST_PRESET_ID = "3mo";

/**
 * Human-readable length of time. Pure: months in, string out.
 *
 * @param {number} months non-negative duration in months
 * @returns {string} e.g. "3 months" or "2.5 years"
 */
export function formatMonths(months) {
  if (!Number.isFinite(months) || months < 0) return "not applicable";
  if (months === 0) return "0 months";
  if (months < 1) return `${Math.round(months * DAYS_PER_MONTH)} days`;
  if (months < 24) return `${Math.round(months * 10) / 10} months`;
  return `${(months / 12).toFixed(1)} years`;
}

/**
 * How many recordings are actually retained given usage and a retention
 * setting.
 *
 * effectiveMonths = the retention window, capped at how old the account (or
 *                   the time since the last full clear-out) actually is
 * stored          = queriesPerDay x days-per-month x effectiveMonths
 *
 * @param {object} input
 * @param {number} input.queriesPerDay average voice requests per day
 * @param {number} input.accountAgeMonths months since setup or since history was last fully cleared
 * @param {string} input.retentionId one of RETENTION_PRESETS[].id
 * @returns {object} retention report, or { error }
 */
export function estimateStoredRecordings({ queriesPerDay, accountAgeMonths, retentionId } = {}) {
  const preset = presetById.get(retentionId);
  if (!preset) return { error: "Choose one of the listed retention settings." };

  const queries = Number(queriesPerDay);
  const age = Number(accountAgeMonths);

  if (!Number.isFinite(queries) || queries < 0) {
    return { error: "Voice requests per day must be zero or more." };
  }
  if (queries > MAX_QUERIES_PER_DAY) {
    return { error: `Enter ${MAX_QUERIES_PER_DAY} requests a day or fewer.` };
  }
  if (!Number.isFinite(age) || age < 0) {
    return { error: "Account age must be zero months or more." };
  }
  if (age > MAX_ACCOUNT_AGE_MONTHS) {
    return { error: `Enter ${MAX_ACCOUNT_AGE_MONTHS} months or fewer.` };
  }

  const effectiveMonths = preset.windowMonths === null ? age : Math.min(preset.windowMonths, age);
  const stored = Math.round(queries * DAYS_PER_MONTH * effectiveMonths);

  const shortest = presetById.get(SHORTEST_PRESET_ID);
  const shortestMonths = Math.min(shortest.windowMonths, age);
  const storedAtShortest = Math.round(queries * DAYS_PER_MONTH * shortestMonths);
  const reduction = Math.max(0, stored - storedAtShortest);

  const band = STORAGE_BANDS.find((entry) => stored <= entry.max) || STORAGE_BANDS[STORAGE_BANDS.length - 1];

  return {
    presetLabel: preset.label,
    presetNote: preset.note,
    effectiveMonths,
    effectiveWindowReadable: formatMonths(effectiveMonths),
    stored,
    band: band.id,
    bandLabel: band.label,
    bandHint: band.hint,
    storedAtShortest,
    reduction,
    alreadyAtOrBelowShortest: retentionId === "off" || reduction === 0,
  };
}
