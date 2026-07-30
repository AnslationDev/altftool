/**
 * Smart Lock Security Checklist — scoring plus keypad-code strength maths.
 *
 * Pure module: no React, no DOM, no clocks. Every exported function is total —
 * unusable input returns { error } rather than NaN, Infinity or a wrong number.
 *
 * Setting names follow the mainstream lock apps (August/Yale: Settings >
 * Access / Entry codes; Schlage Home: Access Codes; Aqara/Nuki: User
 * management). Follow the description rather than an exact label.
 */

/**
 * The checklist.
 *
 * weight   = share of the 100-point score. Weighted by consequence: a control
 *            that stops someone opening the door, or gets you back in when the
 *            electronics die, outranks convenience settings.
 * critical = on its own enough to lose the door, so it caps the score
 *            (CRITICAL_CAP_PERCENT).
 */
export const CHECKLIST = [
  {
    id: "app-2fa",
    group: "App account",
    title: "Two-factor authentication on the lock account",
    detail:
      "The app account can usually unlock the door from anywhere, so it deserves stronger protection than the door itself. Use an authenticator app or passkey; SMS codes fall to a SIM swap.",
    weight: 12,
    critical: true,
  },
  {
    id: "unique-password",
    group: "App account",
    title: "A password used on no other site",
    detail:
      "Credential stuffing replays leaked username/password pairs against smart-home apps. A unique password makes an unrelated breach irrelevant to your front door.",
    weight: 10,
    critical: true,
  },
  {
    id: "remove-old-users",
    group: "App account",
    title: "Remove guests, ex-partners, cleaners and old tenants",
    detail:
      "Shared app users keep remote-unlock rights until deleted by name. Review the user list whenever anybody stops needing access, not once a year.",
    weight: 9,
    critical: true,
  },
  {
    id: "default-code-changed",
    group: "Codes and keys",
    title: "Change the factory master and programming code",
    detail:
      "Default programming codes are printed in manuals that are online for every model. Until it is changed, anyone who identifies the lock can add their own code at the keypad.",
    weight: 11,
    critical: true,
  },
  {
    id: "non-obvious-code",
    group: "Codes and keys",
    title: "Avoid dates, repeats and keypad patterns",
    detail:
      "Analysis of millions of leaked 4-digit PINs found the top 20 codes cover roughly a quarter of all choices, with 1234 alone near 10%. Birth years and 1111-style repeats give an attacker a handful of guesses, not thousands.",
    weight: 9,
    critical: false,
  },
  {
    id: "unique-guest-codes",
    group: "Codes and keys",
    title: "Give each person their own code, never a shared one",
    detail:
      "Per-person codes are what makes the access log meaningful and let you revoke one visitor without disturbing everyone else. A single shared code tells you nothing about who opened the door.",
    weight: 6,
    critical: false,
  },
  {
    id: "expiring-codes",
    group: "Codes and keys",
    title: "Use scheduled or one-time codes for deliveries and trades",
    detail:
      "A code that expires at 6pm on the day of the job cannot be reused next month or passed to a colleague. Most locks support time-limited and single-use codes.",
    weight: 5,
    critical: false,
  },
  {
    id: "wipe-keypad",
    group: "Codes and keys",
    title: "Wipe the keypad and rotate codes that show wear",
    detail:
      "Worn or greasy keys reveal which four digits are in use, cutting a 10,000-code space to a few dozen orderings. Clean the keypad and change the code if the marks are obvious.",
    weight: 4,
    critical: false,
  },
  {
    id: "auto-lock",
    group: "Physical security",
    title: "Turn on auto-lock with a short delay",
    detail:
      "Most smart-lock burglaries start with a door that was simply left unlocked. A 30-60 second auto-lock removes the human step entirely.",
    weight: 7,
    critical: false,
  },
  {
    id: "long-screws",
    group: "Physical security",
    title: "Fit a reinforced strike plate with 75 mm screws",
    detail:
      "No electronics matter if the frame splits on the first kick. Long screws into the stud behind the frame are the cheapest upgrade on this list.",
    weight: 5,
    critical: false,
  },
  {
    id: "letterbox-shield",
    group: "Physical security",
    title: "Block letterbox fishing of the thumb-turn",
    detail:
      "Retrofit locks sit on the inside thumb-turn, which a wire through the letterbox can turn. Fit a letterbox cowl or a lock with a thumb-turn shield.",
    weight: 4,
    critical: false,
  },
  {
    id: "log-review",
    group: "Physical security",
    title: "Read the access log after anything unexpected",
    detail:
      "The log names the code or user for each unlock. Reviewing it after a strange notification is how an unauthorised code gets caught early.",
    weight: 3,
    critical: false,
  },
  {
    id: "mechanical-key",
    group: "Offline fallback",
    title: "Keep a mechanical key or backup entry route off-site",
    detail:
      "Flat batteries, a failed motor or a dead hub all end with you outside. Store the override key with a trusted neighbour or family member rather than under a plant pot.",
    weight: 6,
    critical: false,
  },
  {
    id: "battery-plan",
    group: "Offline fallback",
    title: "Enable low-battery alerts and know the emergency power option",
    detail:
      "Many locks accept a 9V battery or USB power pack against the terminals to give you one more opening. Learn where those contacts are before you need them.",
    weight: 4,
    critical: false,
  },
  {
    id: "offline-unlock",
    group: "Offline fallback",
    title: "Confirm the lock still works with the internet down",
    detail:
      "Test with the router off. Bluetooth and Z-Wave locks normally keep working locally; a cloud-only lock that refuses codes during an outage is a fault you want to find on a calm afternoon.",
    weight: 3,
    critical: false,
  },
  {
    id: "firmware",
    group: "Offline fallback",
    title: "Keep lock and bridge firmware up to date",
    detail:
      "Locks and their bridges have shipped fixes for relay and pairing weaknesses. Updates are usually manual on the bridge, so check rather than assume.",
    weight: 2,
    critical: false,
  },
];

/** Display order of the groups used by CHECKLIST. */
export const GROUPS = ["App account", "Codes and keys", "Physical security", "Offline fallback"];

/** Sum of all weights. Authored so that this equals 100. */
export const TOTAL_WEIGHT = CHECKLIST.reduce((sum, item) => sum + item.weight, 0);

/** Ticked at first paint because most installs already have them. */
export const DEFAULT_DONE = ["unique-password", "auto-lock"];

/** Score bands, read top-down: the first band the score reaches wins. */
export const BANDS = [
  { id: "hardened", min: 90, label: "Hardened", hint: "Remote access, keypad and the frame are all covered." },
  { id: "strong", min: 70, label: "Well secured", hint: "Solid. Tidy the code hygiene and fallback plan." },
  { id: "partial", min: 40, label: "Partly secured", hint: "A leaked app password or a factory code still opens this door." },
  { id: "at-risk", min: 0, label: "At risk", hint: "There is an open path to unlocking this door without you." },
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

/** Keypad locks use the digits 0-9, so each position multiplies the space by 10. */
const DIGITS_IN_ALPHABET = 10;
/** Shortest and longest user code length consumer keypad locks accept. */
export const MIN_CODE_DIGITS = 4;
export const MAX_CODE_DIGITS = 12;
/**
 * Size of the effective search space when the code is a common pattern —
 * a date (about 366 day/month combinations), a recent birth year, a repeat
 * such as 1111 or a straight keypad run. Published studies of leaked 4-digit
 * PINs put the top 20 choices at roughly a quarter of all codes, so a few
 * hundred guesses is the realistic ceiling for a predictable pick.
 */
export const PREDICTABLE_KEYSPACE = 400;

/** Common attempt-throttling behaviours on consumer keypad locks. */
export const LOCKOUT_PRESETS = [
  { id: "none", label: "No lockout at all", attempts: 0, seconds: 0 },
  { id: "5x60", label: "5 wrong tries, then 60 seconds", attempts: 5, seconds: 60 },
  { id: "3x60", label: "3 wrong tries, then 60 seconds", attempts: 3, seconds: 60 },
  { id: "5x300", label: "5 wrong tries, then 5 minutes", attempts: 5, seconds: 300 },
];

const SECONDS_IN_MINUTE = 60;
const SECONDS_IN_HOUR = 3600;
const SECONDS_IN_DAY = 86400;
const SECONDS_IN_YEAR = 31557600; // 365.25 days, the Julian year

/** Strength bands for the average time to guess a keypad code. */
export const CODE_BANDS = [
  { id: "weak", maxSeconds: SECONDS_IN_HOUR, label: "Weak", hint: "Guessable inside an hour of standing at the door." },
  { id: "fair", maxSeconds: SECONDS_IN_DAY, label: "Fair", hint: "A day of continuous attempts would open it." },
  { id: "good", maxSeconds: SECONDS_IN_DAY * 30, label: "Good", hint: "Weeks of attempts — far beyond a casual attacker." },
  { id: "strong", maxSeconds: Infinity, label: "Strong", hint: "Brute force at the keypad is not the way in any more." },
];

/**
 * Human-readable duration. Pure: seconds in, string out.
 *
 * @param {number} seconds non-negative duration
 * @returns {string} e.g. "19.4 hours"
 */
export function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "not applicable";
  if (seconds < SECONDS_IN_MINUTE) return `${Math.round(seconds)} seconds`;
  if (seconds < SECONDS_IN_HOUR) return `${(seconds / SECONDS_IN_MINUTE).toFixed(1)} minutes`;
  if (seconds < SECONDS_IN_DAY) return `${(seconds / SECONDS_IN_HOUR).toFixed(1)} hours`;
  if (seconds < SECONDS_IN_YEAR) return `${(seconds / SECONDS_IN_DAY).toFixed(1)} days`;
  return `${(seconds / SECONDS_IN_YEAR).toFixed(1)} years`;
}

/**
 * Average time to open the lock by guessing at the keypad.
 *
 * space  = 10^digits, or PREDICTABLE_KEYSPACE if the code is a common pattern
 * tries  = space / 2 (the expected number of guesses for a uniform search)
 * time   = tries x secondsPerTry + floor(tries / attemptsBeforeLockout) x lockoutSeconds
 *
 * This models an attacker at the door, not a network attack — remote paths are
 * covered by the app-account controls in the checklist.
 *
 * @param {object} input
 * @param {number} input.digits code length
 * @param {number} input.secondsPerTry seconds to key one code and see it fail
 * @param {string} input.lockoutId one of LOCKOUT_PRESETS[].id
 * @param {boolean} [input.predictable] true if the code is a date, year, repeat or run
 * @returns {object} strength summary, or { error }
 */
export function estimateCodeStrength({ digits, secondsPerTry, lockoutId, predictable = false } = {}) {
  const length = Number(digits);
  const perTry = Number(secondsPerTry);
  const preset = LOCKOUT_PRESETS.find((entry) => entry.id === lockoutId);

  if (!preset) return { error: "Choose one of the listed lockout behaviours." };
  if (!Number.isFinite(length) || !Number.isInteger(length)) {
    return { error: "Code length must be a whole number of digits." };
  }
  if (length < MIN_CODE_DIGITS || length > MAX_CODE_DIGITS) {
    return { error: `Keypad codes run from ${MIN_CODE_DIGITS} to ${MAX_CODE_DIGITS} digits.` };
  }
  if (!Number.isFinite(perTry) || perTry <= 0) {
    return { error: "Seconds per attempt must be greater than zero." };
  }
  if (perTry > 600) {
    return { error: "More than 600 seconds per attempt is not a realistic keypad." };
  }

  const fullSpace = Math.pow(DIGITS_IN_ALPHABET, length);
  const space = predictable ? Math.min(PREDICTABLE_KEYSPACE, fullSpace) : fullSpace;
  const averageTries = space / 2;

  const lockouts = preset.attempts > 0 ? Math.floor(averageTries / preset.attempts) : 0;
  const seconds = averageTries * perTry + lockouts * preset.seconds;

  const band = CODE_BANDS.find((entry) => seconds < entry.maxSeconds) || CODE_BANDS[CODE_BANDS.length - 1];

  return {
    digits: length,
    fullSpace,
    space,
    predictable: Boolean(predictable),
    averageTries,
    lockoutLabel: preset.label,
    lockouts,
    seconds,
    readable: formatDuration(seconds),
    band: band.id,
    bandLabel: band.label,
    bandHint: band.hint,
  };
}
