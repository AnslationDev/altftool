/**
 * Bank Password Policy Tester — pure evaluation of a candidate net-banking
 * password against the rule set Indian retail banks publish for their internet
 * banking login password.
 *
 * The profile below is the intersection of the published rules of the large
 * retail banks: 8-20 characters, all four character classes, a restricted list
 * of special characters, no spaces, nothing derived from the user ID or date of
 * birth, and no run of three identical characters. Individual banks differ at
 * the edges, so the tool reports which rule failed rather than claiming to be
 * any one bank's validator.
 *
 * Nothing here is transmitted; every function is pure and offline.
 */

/** Length window used by retail net-banking login passwords. */
export const MIN_LENGTH = 8;
export const MAX_LENGTH = 20;

/**
 * Special characters banks commonly accept. Many net-banking forms reject
 * anything outside a short list because the value passes through legacy
 * middleware, so characters outside this set are flagged as "may be rejected"
 * rather than as a strength problem.
 */
export const ALLOWED_SYMBOLS = "!@#$%^&*()_-+=";

/** Banks typically force a login-password change on this cycle. */
export const ROTATION_DAYS = 180;

/** Number of previous passwords a bank's history check usually blocks. */
export const PASSWORD_HISTORY = 5;

/** Longest run of the same character most bank validators allow. */
export const MAX_REPEAT_RUN = 2;

/**
 * Guess rates behind the crack-time estimates, chosen to be checkable:
 *  - ONLINE: 100 guesses/second against a rate-limited login that also locks
 *    the account, which is what a net-banking front end does.
 *  - OFFLINE_SLOW: 20,000 guesses/second — one modern GPU against a bcrypt
 *    hash at cost factor 12.
 *  - OFFLINE_FAST: 100 billion guesses/second — a multi-GPU rig against an
 *    unsalted MD5 or NTLM hash from a breached database.
 */
export const GUESS_RATES = {
  online: 100,
  offlineSlow: 2e4,
  offlineFast: 1e11,
};

/** Seconds in each unit; a month is the average 30.4375 days. */
const UNIT_SECONDS = [
  ["second", 1],
  ["minute", 60],
  ["hour", 3600],
  ["day", 86400],
  ["month", 2629800],
  ["year", 31557600],
];

/** Passwords that appear at the top of every published breach corpus. */
export const COMMON_PASSWORDS = [
  "123456", "password", "12345678", "qwerty", "123456789", "12345", "1234",
  "111111", "1234567", "dragon", "123123", "abc123", "iloveyou", "monkey",
  "letmein", "shadow", "master", "qwertyuiop", "123321", "1qaz2wsx", "7777777",
  "121212", "000000", "qazwsx", "123qwe", "trustno1", "zxcvbnm", "asdfgh",
  "sunshine", "princess", "welcome", "admin", "login", "passw0rd", "p@ssw0rd",
  "password1", "password123", "welcome1", "welcome123", "admin123", "admin@123",
  "pass@123", "abcd@1234", "india123", "indian", "bharat", "qwerty123",
  "1q2w3e4r", "google", "cricket", "sachin", "krishna", "ganesh", "shivam",
  "rahul123", "computer", "internet", "banking", "account", "money123",
];

/** Keyboard rows used to detect straight runs across the keys. */
const KEYBOARD_ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm", "1234567890"];

/** Character-class breakdown of a candidate password. */
export function classifyCharacters(password) {
  const value = String(password == null ? "" : password);
  const result = {
    lower: 0,
    upper: 0,
    digit: 0,
    allowedSymbol: 0,
    space: 0,
    otherSymbols: [],
  };
  for (const char of value) {
    if (char >= "a" && char <= "z") result.lower += 1;
    else if (char >= "A" && char <= "Z") result.upper += 1;
    else if (char >= "0" && char <= "9") result.digit += 1;
    else if (char === " ") result.space += 1;
    else if (ALLOWED_SYMBOLS.includes(char)) result.allowedSymbol += 1;
    else if (!result.otherSymbols.includes(char)) result.otherSymbols.push(char);
  }
  return result;
}

/**
 * Shannon-style entropy of the search space: length x log2(pool size).
 * This is the strength of a password DRAWN AT RANDOM from that alphabet — a
 * password a person chose is always weaker, which is why the pattern checks
 * below subtract from the result.
 */
export function poolSize(counts) {
  let pool = 0;
  if (counts.lower > 0) pool += 26;
  if (counts.upper > 0) pool += 26;
  if (counts.digit > 0) pool += 10;
  if (counts.allowedSymbol > 0) pool += ALLOWED_SYMBOLS.length;
  if (counts.otherSymbols.length > 0) pool += 12;
  if (counts.space > 0) pool += 1;
  return pool;
}

/** Bits of entropy for a password of this length over this pool. */
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

/**
 * Crack time expressed as log10(seconds) so huge values never overflow.
 * On average an attacker finds the password after half the search space.
 */
export function log10CrackSeconds(bits, guessesPerSecond) {
  if (!(bits > 0) || !(guessesPerSecond > 0)) return -Infinity;
  return bits * Math.log10(2) - Math.log10(2) - Math.log10(guessesPerSecond);
}

/** Turn log10(seconds) into plain language without ever printing Infinity. */
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

/** True when the string contains a straight run across a keyboard row. */
export function hasKeyboardRun(password, minRun = 4) {
  const lower = String(password || "").toLowerCase();
  for (const row of KEYBOARD_ROWS) {
    const reversed = row.split("").reverse().join("");
    for (let start = 0; start + minRun <= row.length; start += 1) {
      const forward = row.slice(start, start + minRun);
      const backward = reversed.slice(start, start + minRun);
      if (lower.includes(forward) || lower.includes(backward)) return true;
    }
  }
  return false;
}

/** True when 4 or more characters run in sequence, such as 3456 or wxyz. */
export function hasSequentialRun(password, minRun = 4) {
  const value = String(password || "").toLowerCase();
  if (value.length < minRun) return false;
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

/** Longest run of one repeated character. */
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

/** Strip common leet substitutions so "P@ssw0rd" matches "password". */
export function deLeet(password) {
  return String(password || "")
    .toLowerCase()
    .replace(/[@4]/g, "a")
    .replace(/[3]/g, "e")
    .replace(/[1!|]/g, "i")
    .replace(/[0]/g, "o")
    .replace(/[5$]/g, "s")
    .replace(/[7]/g, "t");
}

/** Fragments of a date of birth an attacker would try first. */
export function dobFragments(ddmmyyyy) {
  const digits = String(ddmmyyyy || "").replace(/\D/g, "");
  if (digits.length !== 8) return [];
  const dd = digits.slice(0, 2);
  const mm = digits.slice(2, 4);
  const yyyy = digits.slice(4, 8);
  const yy = yyyy.slice(2);
  return [digits, dd + mm + yy, yyyy + mm + dd, dd + mm, mm + yyyy, yyyy, dd + yyyy];
}

function ruleResult(id, label, requirement, passed, detail) {
  return { id, label, requirement, passed, detail };
}

/**
 * Evaluate a candidate net-banking password.
 * @param {object} input
 * @param {string} input.password
 * @param {string} [input.userId] customer or user ID
 * @param {string} [input.dob] date of birth as DDMMYYYY
 * @param {number} [input.ageDays] days since the password was last changed
 */
export function evaluateBankPassword({ password, userId = "", dob = "", ageDays = 0 } = {}) {
  const value = String(password == null ? "" : password);
  if (value === "") {
    return { error: "Type a candidate password to test it against the bank rules." };
  }
  if (value.length > 200) {
    return { error: "That is over 200 characters — no net-banking form accepts a value that long." };
  }
  const age = Number(ageDays);
  if (!Number.isFinite(age) || age < 0) {
    return { error: "Days since last change must be zero or a positive whole number." };
  }

  const counts = classifyCharacters(value);
  const id = String(userId || "").trim().toLowerCase();
  const lowerValue = value.toLowerCase();
  const flat = deLeet(value);
  const fragments = dobFragments(dob);
  const repeatRun = longestRepeatRun(value);

  const rules = [
    ruleResult(
      "length",
      "Length",
      `${MIN_LENGTH}-${MAX_LENGTH} characters`,
      value.length >= MIN_LENGTH && value.length <= MAX_LENGTH,
      value.length < MIN_LENGTH
        ? `Only ${value.length} characters. Bank login passwords start at ${MIN_LENGTH}.`
        : value.length > MAX_LENGTH
          ? `${value.length} characters. Net-banking forms usually cut off at ${MAX_LENGTH}, and the extra characters are silently dropped.`
          : `${value.length} characters, inside the ${MIN_LENGTH}-${MAX_LENGTH} window.`
    ),
    ruleResult(
      "uppercase",
      "Uppercase letter",
      "At least one A-Z",
      counts.upper > 0,
      counts.upper > 0 ? `${counts.upper} present.` : "Add at least one capital letter."
    ),
    ruleResult(
      "lowercase",
      "Lowercase letter",
      "At least one a-z",
      counts.lower > 0,
      counts.lower > 0 ? `${counts.lower} present.` : "Add at least one small letter."
    ),
    ruleResult(
      "digit",
      "Digit",
      "At least one 0-9",
      counts.digit > 0,
      counts.digit > 0 ? `${counts.digit} present.` : "Add at least one number."
    ),
    ruleResult(
      "symbol",
      "Special character",
      `At least one of ${ALLOWED_SYMBOLS}`,
      counts.allowedSymbol > 0,
      counts.allowedSymbol > 0
        ? `${counts.allowedSymbol} accepted special character(s).`
        : "Add one of the special characters banks accept."
    ),
    ruleResult(
      "no-space",
      "No spaces",
      "Spaces are rejected",
      counts.space === 0,
      counts.space === 0 ? "No spaces." : `${counts.space} space(s) — remove them.`
    ),
    ruleResult(
      "charset",
      "Only accepted characters",
      `Letters, digits and ${ALLOWED_SYMBOLS}`,
      counts.otherSymbols.length === 0,
      counts.otherSymbols.length === 0
        ? "Every character is on the usual accepted list."
        : `${counts.otherSymbols.join(" ")} may be rejected by the form or silently stripped.`
    ),
    ruleResult(
      "repeat-run",
      "No triple repeats",
      `No more than ${MAX_REPEAT_RUN} identical characters in a row`,
      repeatRun <= MAX_REPEAT_RUN,
      repeatRun <= MAX_REPEAT_RUN
        ? `Longest run is ${repeatRun}.`
        : `A run of ${repeatRun} identical characters. Most bank validators reject three or more.`
    ),
    ruleResult(
      "not-user-id",
      "Different from the user ID",
      "Must not contain the customer or user ID",
      id === "" || (id.length >= 3 && !lowerValue.includes(id)),
      id === ""
        ? "No user ID supplied, so this rule was not tested."
        : lowerValue.includes(id)
          ? "The user ID appears inside the password — banks block this outright."
          : "Does not contain the user ID."
    ),
    ruleResult(
      "not-dob",
      "No date of birth",
      "Must not contain your date of birth",
      fragments.length === 0 || !fragments.some((fragment) => value.includes(fragment)),
      fragments.length === 0
        ? "No date of birth supplied, so this rule was not tested."
        : fragments.some((fragment) => value.includes(fragment))
          ? "Part of your date of birth is in the password. It is on every KYC form the bank holds."
          : "No date-of-birth digits found."
    ),
    ruleResult(
      "not-common",
      "Not a known password",
      "Must not appear in breach lists",
      !COMMON_PASSWORDS.includes(lowerValue) && !COMMON_PASSWORDS.includes(flat),
      COMMON_PASSWORDS.includes(lowerValue) || COMMON_PASSWORDS.includes(flat)
        ? "This is one of the passwords tried first in every credential-stuffing run."
        : "Not in the common-password sample used here."
    ),
    ruleResult(
      "rotation",
      "Within the change cycle",
      `Change at least every ${ROTATION_DAYS} days`,
      age <= ROTATION_DAYS,
      age <= ROTATION_DAYS
        ? `${Math.round(age)} days old — ${Math.max(0, ROTATION_DAYS - Math.round(age))} days before the bank prompts a change.`
        : `${Math.round(age)} days old. Past the usual ${ROTATION_DAYS}-day cycle, so a forced change is due.`
    ),
  ];

  const warnings = [];
  if (hasKeyboardRun(value)) {
    warnings.push({
      id: "keyboard-run",
      title: "Keyboard run",
      detail: "Four or more keys straight along a row (qwer, asdf, 1234) are the first thing a cracking rule set expands.",
    });
  }
  if (hasSequentialRun(value)) {
    warnings.push({
      id: "sequence",
      title: "Sequential characters",
      detail: "Runs like 2345 or wxyz add length without adding difficulty.",
    });
  }
  if (/(19|20)\d{2}/.test(value)) {
    warnings.push({
      id: "year",
      title: "Looks like a year",
      detail: "A four-digit year is one of about 120 realistic values, so it contributes almost nothing.",
    });
  }
  if (COMMON_PASSWORDS.some((common) => common.length >= 5 && flat.includes(common))) {
    warnings.push({
      id: "common-inside",
      title: "Built around a common word",
      detail: "Cracking tools apply leet substitutions and suffixes automatically, so Pa$$w0rd1 is scored as password.",
    });
  }
  if (id !== "" && id.length >= 3 && flat.includes(id)) {
    warnings.push({
      id: "userid-leet",
      title: "User ID with substitutions",
      detail: "Replacing letters with lookalike digits does not hide the user ID from a rule-based attack.",
    });
  }

  const pool = poolSize(counts);
  const rawBits = bestEntropyBits(value, pool);
  // Each detected pattern collapses a large part of the search space; 12 bits
  // per pattern is a deliberately conservative deduction.
  const PENALTY_BITS_PER_PATTERN = 12;
  const penalty = warnings.length * PENALTY_BITS_PER_PATTERN;
  const bits = Math.max(0, rawBits - penalty);

  const failedRequired = rules.filter((rule) => !rule.passed && rule.id !== "rotation");
  const accepted = failedRequired.length === 0;

  let strength = "Very weak";
  if (bits >= 75) strength = "Very strong";
  else if (bits >= 60) strength = "Strong";
  else if (bits >= 45) strength = "Reasonable";
  else if (bits >= 30) strength = "Weak";

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
    failedRules: failedRequired.map((rule) => rule.label),
    passedCount: rules.filter((rule) => rule.passed).length,
    ruleCount: rules.length,
    crackTimes: {
      online: formatCrackTime(log10CrackSeconds(bits, GUESS_RATES.online)),
      offlineSlow: formatCrackTime(log10CrackSeconds(bits, GUESS_RATES.offlineSlow)),
      offlineFast: formatCrackTime(log10CrackSeconds(bits, GUESS_RATES.offlineFast)),
    },
    historyNote: `Banks also block reuse of your last ${PASSWORD_HISTORY} passwords, which this tool cannot see.`,
  };
}
