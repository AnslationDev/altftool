/**
 * Government Portal Password Tester — pure evaluation against the password
 * profile used by the Indian government portals people log into most often
 * (tax filing, provident fund, DigiLocker-style services and state portals).
 *
 * These portals share a recognisable shape, driven by the same middleware:
 * a short length window (commonly 8-14 characters), all four character classes
 * required, a SHORT list of accepted special characters, no spaces, and a ban
 * on anything derived from the identifiers the portal already knows about you —
 * the user ID, the registered mobile number and, on tax portals, the PAN.
 *
 * Individual portals differ, so this reports which rule a password breaks
 * rather than claiming to be any one portal's validator. Everything is pure and
 * runs offline.
 */

/** Length window used by the majority of these portals. */
export const MIN_LENGTH = 8;
export const MAX_LENGTH = 14;

/**
 * Special characters commonly accepted. Portals restrict the set because the
 * value passes through form filters that reject angle brackets, quotes and
 * backslashes as injection attempts, so those are flagged as "likely rejected"
 * rather than as weak.
 */
export const ALLOWED_SYMBOLS = "@#$%&*!()_-";

/** Characters these forms most often refuse outright. */
export const BLOCKED_SYMBOLS = "<>\"'`\\;=+{}[]|~^";

/** Typical forced-change cycle on a government portal account. */
export const ROTATION_DAYS = 90;

/** PAN format: five letters, four digits, one letter (Income Tax Act rules). */
export const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

/** Indian mobile numbers are ten digits beginning 6, 7, 8 or 9. */
export const MOBILE_PATTERN = /^[6-9][0-9]{9}$/;

/**
 * Guess rates behind the crack-time estimates:
 *  - ONLINE: 100/s against a portal that rate-limits and locks the account.
 *  - OFFLINE_SLOW: 20,000/s — one GPU against bcrypt at cost 12.
 *  - OFFLINE_FAST: 100 billion/s — a GPU rig against an unsalted MD5 or SHA-1
 *    hash, which is what leaks from an older database.
 */
export const GUESS_RATES = { online: 100, offlineSlow: 2e4, offlineFast: 1e11 };

const UNIT_SECONDS = [
  ["second", 1],
  ["minute", 60],
  ["hour", 3600],
  ["day", 86400],
  ["month", 2629800],
  ["year", 31557600],
];

/** Values that top every published breach list, plus India-specific favourites. */
export const COMMON_PASSWORDS = [
  "password", "password1", "password123", "passw0rd", "p@ssw0rd", "pass@123",
  "abcd@1234", "abcd1234", "admin@123", "admin123", "welcome@123", "welcome123",
  "india@123", "india123", "bharat123", "jaihind123", "qwerty", "qwerty123",
  "123456", "12345678", "123456789", "1234567890", "iloveyou", "sachin123",
  "krishna123", "ganesh123", "shivam123", "rahul123", "priya123", "amit@123",
  "1q2w3e4r", "1qaz2wsx", "asdfghjkl", "zxcvbnm", "letmein", "changeme",
];

/**
 * Dictionary stems behind the single most common Indian password shape:
 * one word, then digits, then one symbol. Detected separately because the
 * digits at the end defeat a plain leet-substitution comparison.
 */
export const COMMON_WORDS = [
  "india", "bharat", "jaihind", "password", "welcome", "admin", "user",
  "login", "sachin", "virat", "dhoni", "krishna", "ganesh", "shiva", "shivam",
  "rahul", "priya", "amit", "sunil", "anita", "ramesh", "suresh", "mumbai",
  "delhi", "chennai", "kolkata", "bangalore", "hyderabad", "pune", "jaipur",
  "cricket", "monkey", "dragon", "letmein", "master", "family", "school",
  "office", "google", "facebook", "computer", "internet", "summer", "winter",
];

const KEYBOARD_ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm", "1234567890"];

export function classifyCharacters(password) {
  const value = String(password == null ? "" : password);
  const counts = { upper: 0, lower: 0, digit: 0, allowedSymbol: 0, space: 0, blocked: [], other: [] };
  for (const char of value) {
    if (char >= "A" && char <= "Z") counts.upper += 1;
    else if (char >= "a" && char <= "z") counts.lower += 1;
    else if (char >= "0" && char <= "9") counts.digit += 1;
    else if (char === " ") counts.space += 1;
    else if (ALLOWED_SYMBOLS.includes(char)) counts.allowedSymbol += 1;
    else if (BLOCKED_SYMBOLS.includes(char)) {
      if (!counts.blocked.includes(char)) counts.blocked.push(char);
    } else if (!counts.other.includes(char)) counts.other.push(char);
  }
  return counts;
}

export function poolSize(counts) {
  let pool = 0;
  if (counts.lower > 0) pool += 26;
  if (counts.upper > 0) pool += 26;
  if (counts.digit > 0) pool += 10;
  if (counts.allowedSymbol > 0) pool += ALLOWED_SYMBOLS.length;
  if (counts.blocked.length > 0 || counts.other.length > 0) pool += 15;
  if (counts.space > 0) pool += 1;
  return pool;
}

export function entropyBits(length, pool) {
  if (!(length > 0) || !(pool > 1)) return 0;
  return length * Math.log2(pool);
}

/**
 * Collapse any run of three or more identical characters down to two.
 * "aaaaaa" carries no more information than "aa", so the collapsed string is
 * measured too and the smaller of the two estimates is used.
 */
export function collapseRuns(password) {
  return String(password == null ? "" : password).replace(/(.)\1{2,}/g, "$1$1");
}

/** The cheaper of the plain and run-collapsed character models. */
export function bestEntropyBits(password, pool) {
  const value = String(password == null ? "" : password);
  return Math.min(entropyBits(value.length, pool), entropyBits(collapseRuns(value).length, pool));
}

export function log10CrackSeconds(bits, guessesPerSecond) {
  if (!(bits > 0) || !(guessesPerSecond > 0)) return -Infinity;
  return bits * Math.log10(2) - Math.log10(2) - Math.log10(guessesPerSecond);
}

export function formatCrackTime(log10Seconds) {
  if (!Number.isFinite(log10Seconds)) return "instantly";
  if (log10Seconds < 0) return "less than a second";
  let unit = UNIT_SECONDS[0];
  for (const candidate of UNIT_SECONDS) {
    if (log10Seconds >= Math.log10(candidate[1])) unit = candidate;
  }
  const log10Value = log10Seconds - Math.log10(unit[1]);
  if (log10Value > 15) return `about 10^${Math.round(log10Value)} ${unit[0]}s`;
  const value = Math.pow(10, log10Value);
  const rounded = value >= 100 ? Math.round(value) : Math.round(value * 10) / 10;
  return `about ${rounded.toLocaleString("en-IN")} ${unit[0]}${rounded === 1 ? "" : "s"}`;
}

export function hasKeyboardRun(password, minRun = 4) {
  const lower = String(password || "").toLowerCase();
  for (const row of KEYBOARD_ROWS) {
    const reversed = row.split("").reverse().join("");
    for (let start = 0; start + minRun <= row.length; start += 1) {
      if (lower.includes(row.slice(start, start + minRun))) return true;
      if (lower.includes(reversed.slice(start, start + minRun))) return true;
    }
  }
  return false;
}

export function hasSequentialRun(password, minRun = 4) {
  const value = String(password || "").toLowerCase();
  let up = 1;
  let down = 1;
  for (let i = 1; i < value.length; i += 1) {
    const delta = value.charCodeAt(i) - value.charCodeAt(i - 1);
    up = delta === 1 ? up + 1 : 1;
    down = delta === -1 ? down + 1 : 1;
    if (up >= minRun || down >= minRun) return true;
  }
  return false;
}

export function longestRepeatRun(password) {
  const value = String(password || "");
  let best = value.length > 0 ? 1 : 0;
  let run = 1;
  for (let i = 1; i < value.length; i += 1) {
    run = value[i] === value[i - 1] ? run + 1 : 1;
    if (run > best) best = run;
  }
  return best;
}

export function deLeet(password) {
  return String(password || "")
    .toLowerCase()
    .replace(/[@4]/g, "a")
    .replace(/3/g, "e")
    .replace(/[1!|]/g, "i")
    .replace(/0/g, "o")
    .replace(/[5$]/g, "s")
    .replace(/7/g, "t");
}

/**
 * The alphabetic stem of a "word + digits + symbol" password.
 * "Ind1a@123" -> "india", so the dictionary check still catches it.
 */
export function wordStem(password) {
  const trimmed = String(password || "").replace(/[^A-Za-z]+$/, "");
  return deLeet(trimmed).replace(/[^a-z]/g, "");
}

/** Fragments of a mobile number an attacker or a validator would look for. */
export function mobileFragments(mobile) {
  const digits = String(mobile || "").replace(/\D/g, "").slice(-10);
  if (digits.length !== 10) return [];
  return [digits, digits.slice(0, 5), digits.slice(-4), digits.slice(-6)];
}

/** Fragments of a PAN a validator would look for. */
export function panFragments(pan) {
  const value = String(pan || "").trim().toUpperCase();
  if (!PAN_PATTERN.test(value)) return [];
  return [value, value.slice(0, 5), value.slice(5, 9)];
}

function rule(id, label, requirement, passed, detail) {
  return { id, label, requirement, passed, detail };
}

/**
 * Evaluate a candidate government-portal password.
 * @param {object} input
 * @param {string} input.password
 * @param {string} [input.userId]
 * @param {string} [input.mobile] ten-digit registered mobile number
 * @param {string} [input.pan] PAN, if the portal is a tax portal
 * @param {number} [input.ageDays]
 */
export function evaluateGovPassword({ password, userId = "", mobile = "", pan = "", ageDays = 0 } = {}) {
  const value = String(password == null ? "" : password);
  if (value === "") return { error: "Type a candidate password to test it against the portal rules." };
  if (value.length > 200) return { error: "Over 200 characters — no portal form accepts a value that long." };
  const age = Number(ageDays);
  if (!Number.isFinite(age) || age < 0) {
    return { error: "Days since last change must be zero or a positive number." };
  }

  const counts = classifyCharacters(value);
  const lower = value.toLowerCase();
  const flat = deLeet(value);
  const id = String(userId || "").trim().toLowerCase();
  const mobileParts = mobileFragments(mobile);
  const panParts = panFragments(pan);
  const upperValue = value.toUpperCase();
  const repeatRun = longestRepeatRun(value);

  const mobileHit = mobileParts.some((part) => value.includes(part));
  const panHit = panParts.some((part) => upperValue.includes(part));

  const rules = [
    rule(
      "length",
      "Length",
      `${MIN_LENGTH}-${MAX_LENGTH} characters`,
      value.length >= MIN_LENGTH && value.length <= MAX_LENGTH,
      value.length < MIN_LENGTH
        ? `Only ${value.length} characters; the floor is ${MIN_LENGTH}.`
        : value.length > MAX_LENGTH
          ? `${value.length} characters. These portals usually cap at ${MAX_LENGTH} and silently drop the rest, so what you set is not what you typed.`
          : `${value.length} characters, inside the ${MIN_LENGTH}-${MAX_LENGTH} window.`
    ),
    rule("uppercase", "Uppercase letter", "At least one A-Z", counts.upper > 0,
      counts.upper > 0 ? `${counts.upper} present.` : "Add a capital letter."),
    rule("lowercase", "Lowercase letter", "At least one a-z", counts.lower > 0,
      counts.lower > 0 ? `${counts.lower} present.` : "Add a small letter."),
    rule("digit", "Digit", "At least one 0-9", counts.digit > 0,
      counts.digit > 0 ? `${counts.digit} present.` : "Add a number."),
    rule(
      "symbol",
      "Special character",
      `At least one of ${ALLOWED_SYMBOLS}`,
      counts.allowedSymbol > 0,
      counts.allowedSymbol > 0
        ? `${counts.allowedSymbol} accepted special character(s).`
        : "Add one special character from the accepted list."
    ),
    rule("no-space", "No spaces", "Spaces are rejected", counts.space === 0,
      counts.space === 0 ? "No spaces." : `${counts.space} space(s) — remove them.`),
    rule(
      "charset",
      "Only accepted characters",
      "No angle brackets, quotes or backslashes",
      counts.blocked.length === 0,
      counts.blocked.length === 0
        ? "No characters that form filters usually reject."
        : `${counts.blocked.join(" ")} is commonly rejected as an injection attempt, or accepted and then mangled on login.`
    ),
    rule(
      "not-user-id",
      "Different from the user ID",
      "Must not contain the login ID",
      id === "" || id.length < 3 || !lower.includes(id),
      id === ""
        ? "No user ID supplied, so this rule was not tested."
        : lower.includes(id)
          ? "The login ID is inside the password — portals block this outright."
          : "Does not contain the login ID."
    ),
    rule(
      "not-mobile",
      "No registered mobile number",
      "No part of the mobile number",
      !mobileHit,
      mobileParts.length === 0
        ? "No valid ten-digit mobile number supplied, so this rule was not tested."
        : mobileHit
          ? "Digits from your registered mobile number appear in the password. That number is printed on every acknowledgement the portal sends."
          : "No mobile-number digits found."
    ),
    rule(
      "not-pan",
      "No PAN",
      "No part of the PAN",
      !panHit,
      panParts.length === 0
        ? "No valid PAN supplied, so this rule was not tested."
        : panHit
          ? "Part of the PAN appears in the password, and the PAN is often the login ID itself."
          : "No PAN fragment found."
    ),
    rule(
      "not-common",
      "Not a known password",
      "Must not appear in breach lists",
      !COMMON_PASSWORDS.includes(lower) && !COMMON_PASSWORDS.includes(flat),
      COMMON_PASSWORDS.includes(lower) || COMMON_PASSWORDS.includes(flat)
        ? "This exact value is tried in the first few seconds of any credential-stuffing run."
        : "Not in the sample list used here."
    ),
    rule(
      "no-repeat",
      "No triple repeats",
      "No more than 2 identical characters in a row",
      repeatRun <= 2,
      repeatRun <= 2 ? `Longest run is ${repeatRun}.` : `A run of ${repeatRun} identical characters.`
    ),
    rule(
      "rotation",
      "Within the change cycle",
      `Change at least every ${ROTATION_DAYS} days`,
      age <= ROTATION_DAYS,
      age <= ROTATION_DAYS
        ? `${Math.round(age)} days old; ${Math.round(ROTATION_DAYS - age)} days before a change is prompted.`
        : `${Math.round(age)} days old — past the usual ${ROTATION_DAYS}-day cycle.`
    ),
  ];

  const warnings = [];
  if (hasKeyboardRun(value)) {
    warnings.push({
      id: "keyboard",
      title: "Keyboard run",
      detail: "Runs along a keyboard row (qwer, asdf, 1234) are the first substitutions any cracking rule set applies.",
    });
  }
  if (hasSequentialRun(value)) {
    warnings.push({
      id: "sequence",
      title: "Sequential characters",
      detail: "A run like 2345 or wxyz adds length without adding difficulty.",
    });
  }
  if (/(19|20)\d{2}/.test(value)) {
    warnings.push({
      id: "year",
      title: "Contains a year",
      detail: "A four-digit year has barely a hundred realistic values, so it contributes almost nothing to the search space.",
    });
  }
  if (COMMON_PASSWORDS.some((common) => common.length >= 5 && flat.includes(common))) {
    warnings.push({
      id: "common-inside",
      title: "Built around a common word",
      detail: "Leet substitutions are undone automatically, so Ind1a@123 is scored as india123.",
    });
  }
  const stem = wordStem(value);
  if (stem.length >= 4 && COMMON_WORDS.includes(stem)) {
    warnings.push({
      id: "word-plus-digits",
      title: `Dictionary word "${stem}" with digits appended`,
      detail: "Word, then numbers, then one symbol is the most predictable password shape there is; cracking tools generate every variant of it automatically.",
    });
  }
  if (counts.other.length > 0) {
    warnings.push({
      id: "unusual-chars",
      title: "Unusual characters",
      detail: `${counts.other.join(" ")} may be accepted by the form but rejected by the login page, locking you out of your own account.`,
    });
  }

  const pool = poolSize(counts);
  const rawBits = bestEntropyBits(value, pool);
  // 12 bits per detected pattern — a conservative stand-in for how much of the
  // search space a rule-based cracker removes.
  const PENALTY_BITS_PER_PATTERN = 12;
  const penalty = warnings.length * PENALTY_BITS_PER_PATTERN;
  const bits = Math.max(0, rawBits - penalty);

  const failedRequired = rules.filter((entry) => !entry.passed && entry.id !== "rotation");
  const accepted = failedRequired.length === 0;

  let strength = "Very weak";
  if (bits >= 70) strength = "Very strong";
  else if (bits >= 56) strength = "Strong";
  else if (bits >= 42) strength = "Reasonable";
  else if (bits >= 28) strength = "Weak";

  return {
    length: value.length,
    counts,
    pool,
    rawBits,
    penalty,
    bits,
    strength,
    rules,
    warnings,
    accepted,
    failedRules: failedRequired.map((entry) => entry.label),
    passedCount: rules.filter((entry) => entry.passed).length,
    ruleCount: rules.length,
    crackTimes: {
      online: formatCrackTime(log10CrackSeconds(bits, GUESS_RATES.online)),
      offlineSlow: formatCrackTime(log10CrackSeconds(bits, GUESS_RATES.offlineSlow)),
      offlineFast: formatCrackTime(log10CrackSeconds(bits, GUESS_RATES.offlineFast)),
    },
    ceilingNote: `A ${MAX_LENGTH}-character cap means length cannot rescue a weak choice, so variety inside those ${MAX_LENGTH} characters is the only lever you have.`,
  };
}
