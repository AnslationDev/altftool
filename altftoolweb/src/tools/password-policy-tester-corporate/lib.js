/**
 * Corporate Password Policy Tester — pure evaluation against the two rule sets
 * an enterprise password actually has to satisfy.
 *
 * 1. Active Directory "Password must meet complexity requirements". Microsoft
 *    defines this precisely: the password must not contain the account's
 *    sAMAccountName, must not contain any token of the display name longer than
 *    two characters, and must contain characters from three of five categories
 *    (uppercase, lowercase, digits, non-alphanumeric, and Unicode letters that
 *    have no upper/lower case). The Windows default domain policy also enforces
 *    password history of 24, a minimum age of 1 day and a maximum age of 42 days.
 *
 * 2. NIST SP 800-63B. Its memorised-secret rules point the other way: a minimum
 *    of 8 characters chosen by the user, at least 64 allowed, all printing ASCII
 *    plus space accepted, a check against known-breached and dictionary values,
 *    rejection of repetitive or sequential strings, and NO composition rules and
 *    NO periodic expiry unless there is evidence of compromise.
 *
 * Showing both is the point: a password can pass one and fail the other.
 */

/** Windows default domain policy values (Server 2016 onwards). */
export const AD_DEFAULTS = {
  minLength: 7,
  historyCount: 24,
  minAgeDays: 1,
  maxAgeDays: 42,
};

/** CIS Benchmark for Windows recommends a 14-character minimum. */
export const CIS_MIN_LENGTH = 14;

/** NIST SP 800-63B memorised-secret bounds. */
export const NIST_MIN_LENGTH = 8;
export const NIST_MIN_ACCEPTED_MAX = 64;

/** Practical upper bound: AD stores up to 256 characters, portals often cap at 127. */
export const PRACTICAL_MAX_LENGTH = 127;

/** Categories counted by the Active Directory complexity rule. */
export const AD_CATEGORIES = [
  "Uppercase A-Z",
  "Lowercase a-z",
  "Digits 0-9",
  "Non-alphanumeric",
  "Uncased Unicode letters",
];
export const AD_CATEGORIES_REQUIRED = 3;

/** Delimiters Windows uses to split the display name into tokens. */
const DISPLAY_NAME_DELIMITERS = /[,.\-_#\s\t]+/;

/**
 * Guess rates behind the crack-time estimates:
 *  - ONLINE: 100/s against a lockout-protected sign-in.
 *  - OFFLINE_SLOW: 20,000/s — one GPU against bcrypt at cost 12.
 *  - OFFLINE_FAST: 100 billion/s — a GPU rig against unsalted NTLM, which is
 *    exactly what an attacker gets from a stolen NTDS.dit file.
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

/** Values that appear at the top of published breach corpora. */
export const COMMON_PASSWORDS = [
  "password", "password1", "password123", "passw0rd", "p@ssw0rd", "p@ssword1",
  "welcome1", "welcome123", "welcome@123", "admin", "admin123", "admin@123",
  "changeme", "letmein", "qwerty", "qwerty123", "1q2w3e4r", "1qaz2wsx",
  "abc123", "123456", "12345678", "123456789", "iloveyou", "monkey", "dragon",
  "summer2024", "winter2024", "spring2024", "autumn2024", "company123",
  "january2024", "august2024", "trustno1", "zxcvbnm", "asdfghjkl", "temp1234",
  "start123", "office365", "microsoft", "windows", "sharepoint", "firstlogin",
];

/** Character-class breakdown, including the five Active Directory categories. */
export function classifyCharacters(password) {
  const value = String(password == null ? "" : password);
  const counts = { upper: 0, lower: 0, digit: 0, symbol: 0, uncasedLetter: 0, space: 0 };
  for (const char of value) {
    if (char >= "A" && char <= "Z") counts.upper += 1;
    else if (char >= "a" && char <= "z") counts.lower += 1;
    else if (char >= "0" && char <= "9") counts.digit += 1;
    else if (char === " ") counts.space += 1;
    else if (/\p{L}/u.test(char) && char.toLowerCase() === char.toUpperCase()) counts.uncasedLetter += 1;
    else if (/\p{L}/u.test(char)) {
      // Cased letter outside A-Z/a-z, e.g. accented Latin.
      if (char === char.toUpperCase()) counts.upper += 1;
      else counts.lower += 1;
    } else counts.symbol += 1;
  }
  return counts;
}

/** How many of the five Active Directory categories are present. */
export function adCategoriesUsed(counts) {
  const used = [];
  if (counts.upper > 0) used.push(AD_CATEGORIES[0]);
  if (counts.lower > 0) used.push(AD_CATEGORIES[1]);
  if (counts.digit > 0) used.push(AD_CATEGORIES[2]);
  if (counts.symbol > 0 || counts.space > 0) used.push(AD_CATEGORIES[3]);
  if (counts.uncasedLetter > 0) used.push(AD_CATEGORIES[4]);
  return used;
}

/** Search-space size implied by the classes actually used. */
export function poolSize(counts) {
  let pool = 0;
  if (counts.lower > 0) pool += 26;
  if (counts.upper > 0) pool += 26;
  if (counts.digit > 0) pool += 10;
  // 32 printable ASCII punctuation characters, plus the space NIST requires be allowed.
  if (counts.symbol > 0) pool += 32;
  if (counts.space > 0) pool += 1;
  if (counts.uncasedLetter > 0) pool += 40;
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

const KEYBOARD_ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm", "1234567890"];

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

/** Display-name tokens longer than two characters, per the Microsoft rule. */
export function displayNameTokens(fullName) {
  return String(fullName || "")
    .split(DISPLAY_NAME_DELIMITERS)
    .map((token) => token.trim().toLowerCase())
    .filter((token) => token.length > 2);
}

function rule(id, standard, label, requirement, passed, detail) {
  return { id, standard, label, requirement, passed, detail };
}

/**
 * Evaluate a candidate corporate password.
 * @param {object} input
 * @param {string} input.password
 * @param {string} [input.username] sAMAccountName
 * @param {string} [input.fullName] display name
 * @param {number} [input.ageDays] days since the password was last set
 * @param {number} [input.minLength] the organisation's configured minimum
 * @param {number} [input.maxAgeDays] the organisation's configured maximum age, 0 = no expiry
 */
export function evaluateCorporatePassword({
  password,
  username = "",
  fullName = "",
  ageDays = 0,
  minLength = CIS_MIN_LENGTH,
  maxAgeDays = AD_DEFAULTS.maxAgeDays,
} = {}) {
  const value = String(password == null ? "" : password);
  if (value === "") return { error: "Type a candidate password to test it." };
  if (value.length > 500) return { error: "Over 500 characters — paste just the password." };

  const min = Number(minLength);
  const maxAge = Number(maxAgeDays);
  const age = Number(ageDays);
  if (!Number.isFinite(min) || min < 1 || min > 256) {
    return { error: "Minimum length must be between 1 and 256 characters." };
  }
  if (!Number.isFinite(maxAge) || maxAge < 0 || maxAge > 3650) {
    return { error: "Maximum password age must be between 0 and 3650 days (use 0 for no expiry)." };
  }
  if (!Number.isFinite(age) || age < 0) {
    return { error: "Days since last change must be zero or a positive number." };
  }

  const counts = classifyCharacters(value);
  const categories = adCategoriesUsed(counts);
  const lower = value.toLowerCase();
  const flat = deLeet(value);
  const account = String(username || "").trim().toLowerCase();
  const tokens = displayNameTokens(fullName);
  const offendingTokens = tokens.filter((token) => lower.includes(token));
  const repeatRun = longestRepeatRun(value);
  const sequential = hasSequentialRun(value) || hasKeyboardRun(value);
  const inBreachList = COMMON_PASSWORDS.includes(lower) || COMMON_PASSWORDS.includes(flat);
  const containsCommon = COMMON_PASSWORDS.some((common) => common.length >= 5 && flat.includes(common));

  const rules = [
    rule(
      "ad-length",
      "Active Directory",
      "Minimum length",
      `${min} characters or more`,
      value.length >= min,
      value.length >= min
        ? `${value.length} characters.`
        : `${value.length} characters — ${min - value.length} short of the configured minimum.`
    ),
    rule(
      "ad-complexity",
      "Active Directory",
      "Complexity categories",
      `${AD_CATEGORIES_REQUIRED} of 5 categories`,
      categories.length >= AD_CATEGORIES_REQUIRED,
      `${categories.length} of 5 used: ${categories.length > 0 ? categories.join(", ") : "none"}.`
    ),
    rule(
      "ad-account-name",
      "Active Directory",
      "Not the account name",
      "Must not contain the sAMAccountName",
      account === "" || account.length < 3 || !lower.includes(account),
      account === ""
        ? "No username supplied, so this rule was not tested."
        : account.length < 3
          ? "Usernames shorter than three characters are exempt from the Windows check."
          : lower.includes(account)
            ? `Contains "${account}". Windows rejects this before any strength check runs.`
            : "Does not contain the account name."
    ),
    rule(
      "ad-display-name",
      "Active Directory",
      "No display-name token",
      "No name token longer than 2 characters",
      offendingTokens.length === 0,
      tokens.length === 0
        ? "No display name supplied, so this rule was not tested."
        : offendingTokens.length > 0
          ? `Contains the name token(s) "${offendingTokens.join('", "')}".`
          : `Checked ${tokens.length} name token(s); none appear in the password.`
    ),
    rule(
      "ad-max-age",
      "Active Directory",
      "Within maximum age",
      maxAge === 0 ? "No expiry configured" : `Change every ${maxAge} days`,
      maxAge === 0 || age <= maxAge,
      maxAge === 0
        ? "Expiry is switched off, which matches current NIST guidance."
        : age <= maxAge
          ? `${Math.round(age)} days old; ${Math.round(maxAge - age)} days remain.`
          : `${Math.round(age)} days old — expired ${Math.round(age - maxAge)} days ago.`
    ),
    rule(
      "length-cap",
      "Active Directory",
      "Within the storage cap",
      `${PRACTICAL_MAX_LENGTH} characters or fewer`,
      value.length <= PRACTICAL_MAX_LENGTH,
      value.length <= PRACTICAL_MAX_LENGTH
        ? "Comfortably inside what portals and directories accept."
        : `${value.length} characters — many self-service portals truncate above ${PRACTICAL_MAX_LENGTH}.`
    ),
    rule(
      "nist-min",
      "NIST SP 800-63B",
      "Minimum 8 characters",
      "At least 8 for a user-chosen secret",
      value.length >= NIST_MIN_LENGTH,
      value.length >= NIST_MIN_LENGTH
        ? `${value.length} characters.`
        : `${value.length} characters — below the NIST floor of ${NIST_MIN_LENGTH}.`
    ),
    rule(
      "nist-breached",
      "NIST SP 800-63B",
      "Not a known-breached value",
      "Compared against a breach and dictionary list",
      !inBreachList,
      inBreachList
        ? "This exact value is in the sample breach list used here — a real verifier checks hundreds of millions."
        : "Not in the sample list. A production check should use a full breached-password corpus."
    ),
    rule(
      "nist-repetitive",
      "NIST SP 800-63B",
      "No repetitive or sequential strings",
      "Rejects aaaaaa, 1234abcd and keyboard runs",
      repeatRun < 3 && !sequential,
      repeatRun >= 3
        ? `A run of ${repeatRun} identical characters.`
        : sequential
          ? "Contains a sequential or keyboard run such as 1234 or qwer."
          : "No repetitive or sequential run found."
    ),
    rule(
      "nist-context",
      "NIST SP 800-63B",
      "No context-specific words",
      "No account name, service name or common word",
      !containsCommon && offendingTokens.length === 0 && !(account !== "" && account.length >= 3 && flat.includes(account)),
      containsCommon
        ? "Built around a word from the common list; leet substitutions do not help."
        : offendingTokens.length > 0
          ? "Contains part of the user's own name."
          : "No context word detected."
    ),
    rule(
      "nist-length-recommended",
      "NIST SP 800-63B",
      "Long enough to survive offline cracking",
      `${CIS_MIN_LENGTH} characters or more recommended`,
      value.length >= CIS_MIN_LENGTH,
      value.length >= CIS_MIN_LENGTH
        ? `${value.length} characters — length is doing the work here.`
        : `${value.length} characters. Length beats complexity: a four-word passphrase outperforms Xy7#a! every time.`
    ),
  ];

  const pool = poolSize(counts);
  const rawBits = bestEntropyBits(value, pool);
  const patterns = [];
  if (sequential) patterns.push("sequential or keyboard run");
  if (repeatRun >= 3) patterns.push("repeated characters");
  if (containsCommon) patterns.push("common word inside");
  if (/(19|20)\d{2}/.test(value)) patterns.push("four-digit year");
  if (offendingTokens.length > 0) patterns.push("personal name");
  // 12 bits per detected pattern, a conservative stand-in for the search-space
  // collapse a rule-based cracker achieves.
  const PENALTY_BITS_PER_PATTERN = 12;
  const penalty = patterns.length * PENALTY_BITS_PER_PATTERN;
  const bits = Math.max(0, rawBits - penalty);

  const adRules = rules.filter((entry) => entry.standard === "Active Directory");
  const nistRules = rules.filter((entry) => entry.standard === "NIST SP 800-63B");
  const adPass = adRules.every((entry) => entry.passed);
  const nistPass = nistRules.every((entry) => entry.passed);

  let strength = "Very weak";
  if (bits >= 80) strength = "Very strong";
  else if (bits >= 64) strength = "Strong";
  else if (bits >= 48) strength = "Reasonable";
  else if (bits >= 32) strength = "Weak";

  return {
    length: value.length,
    counts,
    categories,
    categoryCount: categories.length,
    pool,
    rawBits,
    penalty,
    patterns,
    bits,
    strength,
    rules,
    adRules,
    nistRules,
    adPass,
    nistPass,
    passedCount: rules.filter((entry) => entry.passed).length,
    ruleCount: rules.length,
    failedRules: rules.filter((entry) => !entry.passed).map((entry) => entry.label),
    crackTimes: {
      online: formatCrackTime(log10CrackSeconds(bits, GUESS_RATES.online)),
      offlineSlow: formatCrackTime(log10CrackSeconds(bits, GUESS_RATES.offlineSlow)),
      offlineFast: formatCrackTime(log10CrackSeconds(bits, GUESS_RATES.offlineFast)),
    },
    historyNote: `Windows also remembers the last ${AD_DEFAULTS.historyCount} passwords by default and enforces a ${AD_DEFAULTS.minAgeDays}-day minimum age, so a password cannot be cycled back immediately.`,
  };
}
