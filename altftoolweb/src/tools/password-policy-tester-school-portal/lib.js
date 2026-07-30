/**
 * School Portal Password Policy Tester — pure, kid-friendly evaluation.
 *
 * School logins sit in an awkward place: the account is low value to a stranger
 * but high value to a classmate, so the realistic attacker already knows the
 * student's name, birthday, house and favourite team. These rules therefore
 * weight "guessable by someone who knows you" far above symbol variety.
 *
 * Length and breach-list guidance follow NIST SP 800-63B, which sets a floor of
 * 8 characters for a secret a person chooses, requires a check against known
 * passwords, and drops composition rules in favour of length.
 */

/** Floor from NIST SP 800-63B for a memorised secret a person chooses. */
export const MIN_LENGTH = 8;

/** Target length once a passphrase replaces a single clever word. */
export const GOOD_LENGTH = 14;

/** School portals cap the field for the same legacy reasons other portals do. */
export const TYPICAL_MAX_LENGTH = 32;

/** Bits of entropy treated as a full score on the 0-100 meter. */
export const SCORE_TARGET_BITS = 45;

/**
 * Rules that describe "a person who knows you could guess this". Breaking any
 * of them holds the score below the "okay" band no matter how the maths reads.
 */
export const CRITICAL_RULES = ["length", "no-name", "no-birth-year", "not-common", "no-runs", "no-repeats"];
export const CRITICAL_SCORE_CAP = 39;

/**
 * Guess rates behind the timings:
 *  - ONLINE: 100 guesses/second against a login that locks after a few tries,
 *    which is the attack a school account actually faces.
 *  - OFFLINE_FAST: 100 billion/second against a stolen unsalted hash, shown so
 *    nobody reuses a school password on an account that matters.
 */
export const GUESS_RATES = { online: 100, offlineFast: 1e11 };

const UNIT_SECONDS = [
  ["second", 1],
  ["minute", 60],
  ["hour", 3600],
  ["day", 86400],
  ["month", 2629800],
  ["year", 31557600],
];

/** Passwords guessed first, from published breach corpora and school helpdesks. */
export const COMMON_PASSWORDS = [
  "password", "school", "student", "welcome", "letmein", "changeme",
  "qwerty", "iloveyou", "monkey", "dragon", "football", "cricket",
  "minecraft", "roblox", "fortnite", "pokemon", "unicorn", "princess",
  "superman", "batman", "spiderman", "chocolate", "sunshine", "homework",
  "teacher", "friends", "myschool", "hello", "secret", "abcdef",
];

/**
 * Word list for the passphrase builder: 128 concrete, easy-to-spell words, so
 * each word chosen at random contributes exactly 7 bits (log2 128).
 * The list is published, which is the honest assumption — an attacker who knows
 * a phrase came from here gets those 7 bits per word and no fewer.
 */
export const PASSPHRASE_WORDS = [
  "anchor", "apple", "arrow", "bamboo", "basket", "beacon", "biscuit", "blanket",
  "bottle", "bracket", "bridge", "bucket", "button", "cactus", "camera", "candle",
  "canvas", "carpet", "castle", "cheese", "cherry", "chimney", "circle", "cobra",
  "coconut", "compass", "copper", "cotton", "crayon", "crystal", "cushion", "diamond",
  "dolphin", "domino", "donkey", "dragonfly", "eagle", "elbow", "engine", "envelope",
  "falcon", "feather", "ferry", "fiddle", "flamingo", "forest", "fountain", "garden",
  "glacier", "guitar", "hammer", "harbour", "helmet", "hedgehog", "iceberg", "island",
  "jacket", "jigsaw", "jungle", "kettle", "kitten", "ladder", "lantern", "lemon",
  "lighthouse", "lizard", "magnet", "mango", "marble", "meadow", "mirror", "monsoon",
  "muffin", "needle", "noodle", "octopus", "orange", "orchid", "otter", "paddle",
  "palace", "pancake", "parrot", "peacock", "pebble", "pencil", "pepper", "pigeon",
  "pillow", "planet", "pocket", "pumpkin", "puzzle", "quartz", "quiver", "rabbit",
  "rainbow", "ribbon", "river", "rocket", "saddle", "sandal", "silver", "sparrow",
  "spinach", "squirrel", "stadium", "sunflower", "temple", "thunder", "tiger", "toffee",
  "tractor", "tunnel", "turtle", "umbrella", "valley", "velvet", "violin", "walnut",
  "whistle", "window", "yellow", "yoghurt", "zebra", "zipper", "acorn", "badger",
];

const KEYBOARD_ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm", "1234567890"];

export function classifyCharacters(password) {
  const value = String(password == null ? "" : password);
  const counts = { upper: 0, lower: 0, digit: 0, symbol: 0, space: 0 };
  for (const char of value) {
    if (char >= "A" && char <= "Z") counts.upper += 1;
    else if (char >= "a" && char <= "z") counts.lower += 1;
    else if (char >= "0" && char <= "9") counts.digit += 1;
    else if (char === " ") counts.space += 1;
    else counts.symbol += 1;
  }
  return counts;
}

export function poolSize(counts) {
  let pool = 0;
  if (counts.lower > 0) pool += 26;
  if (counts.upper > 0) pool += 26;
  if (counts.digit > 0) pool += 10;
  if (counts.symbol > 0) pool += 32;
  if (counts.space > 0) pool += 1;
  return pool;
}

export function entropyBits(length, pool) {
  if (!(length > 0) || !(pool > 1)) return 0;
  return length * Math.log2(pool);
}

/**
 * Collapse any run of three or more identical characters down to two.
 * "aaaaaa" carries no more information than "aa", so measuring the collapsed
 * string stops a long repeat from inflating the entropy estimate.
 */
export function collapseRuns(password) {
  return String(password == null ? "" : password).replace(/(.)\1{2,}/g, "$1$1");
}

/**
 * Word model: if the whole password decomposes into words from the lists above
 * plus digits and separators, each word costs only log2(list size) bits no
 * matter how many letters it has. Returns null when the password is not fully
 * decomposable, in which case the character model applies.
 * Separator characters are given 2 bits each, because in practice people pick
 * from a handful of them (- . _ @ ! # and a couple more).
 */
export const SEPARATOR_BITS = 2;

export function wordModelBits(password) {
  const value = String(password == null ? "" : password).toLowerCase();
  if (value === "") return null;
  const parts = value.split(/([^a-z]+)/).filter((part) => part !== "");
  let bits = 0;
  for (const part of parts) {
    if (/^[a-z]+$/.test(part)) {
      if (PASSPHRASE_WORDS.includes(part)) bits += Math.log2(PASSPHRASE_WORDS.length);
      else if (COMMON_PASSWORDS.includes(part)) bits += Math.log2(COMMON_PASSWORDS.length);
      else return null;
    } else {
      for (const char of part) {
        bits += char >= "0" && char <= "9" ? Math.log2(10) : SEPARATOR_BITS;
      }
    }
  }
  return bits;
}

/**
 * The estimate an attacker would actually work with: the cheapest of the
 * available descriptions of the password.
 */
export function bestEntropyEstimate(password) {
  const value = String(password == null ? "" : password);
  const counts = classifyCharacters(value);
  const pool = poolSize(counts);
  const characterModel = entropyBits(value.length, pool);
  const collapsed = collapseRuns(value);
  const collapsedModel = entropyBits(collapsed.length, pool);
  const wordModel = wordModelBits(value);
  let best = Math.min(characterModel, collapsedModel);
  let model = collapsedModel < characterModel ? "repeats collapsed" : "character by character";
  if (wordModel !== null && wordModel < best) {
    best = wordModel;
    model = "known words";
  }
  return { bits: best, model, characterModel, collapsedModel, wordModel, pool, counts };
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

/** Words of three letters or more from any personal detail supplied. */
export function personalTokens(...values) {
  const tokens = [];
  values.forEach((value) => {
    String(value || "")
      .split(/[^A-Za-z]+/)
      .forEach((word) => {
        const token = word.trim().toLowerCase();
        if (token.length >= 3 && !tokens.includes(token)) tokens.push(token);
      });
  });
  return tokens;
}

/**
 * Build a passphrase from chosen word positions. Randomness stays with the
 * caller, so this function is pure and the same input always gives the same
 * phrase. Strength is measured with the same word model used everywhere else.
 * @param {number[]} indexes positions in PASSPHRASE_WORDS
 * @param {string} separator character placed between the words
 * @param {string|number} digits digits appended at the end, empty for none
 */
export function buildPassphrase(indexes, separator = "-", digits = "") {
  const list = Array.isArray(indexes) ? indexes : [];
  const words = list
    .map((index) => {
      const numeric = Number(index);
      if (!Number.isFinite(numeric)) return null;
      const position = Math.abs(Math.trunc(numeric)) % PASSPHRASE_WORDS.length;
      return PASSPHRASE_WORDS[position];
    })
    .filter(Boolean);
  if (words.length < 2) return { error: "Pick at least two words to build a passphrase." };
  const gap = String(separator == null ? "-" : separator).slice(0, 1);
  const suffix = String(digits == null ? "" : digits).replace(/\D/g, "");
  const phrase = words.join(gap) + suffix;
  const bits = wordModelBits(phrase);
  const safeBits = bits === null ? 0 : bits;
  return {
    phrase,
    words,
    bits: safeBits,
    length: phrase.length,
    onlineTime: formatCrackTime(log10CrackSeconds(safeBits, GUESS_RATES.online)),
    offlineTime: formatCrackTime(log10CrackSeconds(safeBits, GUESS_RATES.offlineFast)),
  };
}

function rule(id, label, requirement, passed, detail, tip) {
  return { id, label, requirement, passed, detail, tip };
}

/**
 * Evaluate a school-portal password.
 * @param {object} input
 * @param {string} input.password
 * @param {string} [input.name] the student's name
 * @param {string} [input.username] the school login
 * @param {string} [input.school] the school name
 * @param {string|number} [input.birthYear]
 */
export function evaluateSchoolPassword({ password, name = "", username = "", school = "", birthYear = "" } = {}) {
  const value = String(password == null ? "" : password);
  if (value === "") return { error: "Type a password idea and this will check it for you." };
  if (value.length > 200) return { error: "That is very long — try something under 200 characters." };

  const year = String(birthYear || "").trim();
  if (year !== "" && !/^\d{4}$/.test(year)) {
    return { error: "Birth year should be four digits, like 2012 — or leave it empty." };
  }

  const estimate = bestEntropyEstimate(value);
  const counts = estimate.counts;
  const lower = value.toLowerCase();
  const flat = deLeet(value);
  const tokens = personalTokens(name, username, school);
  const usedTokens = tokens.filter((token) => lower.includes(token) || flat.includes(token));
  const hasYear = year !== "" && value.includes(year);
  const repeatRun = longestRepeatRun(value);
  const runs = hasSequentialRun(value) || hasKeyboardRun(value);
  const isCommon = COMMON_PASSWORDS.includes(lower) || COMMON_PASSWORDS.includes(flat);
  const containsCommon = COMMON_PASSWORDS.some((common) => common.length >= 5 && flat.includes(common));

  const rules = [
    rule(
      "length",
      "Long enough",
      `${MIN_LENGTH} characters or more`,
      value.length >= MIN_LENGTH,
      value.length >= MIN_LENGTH
        ? `${value.length} characters.`
        : `Only ${value.length} characters — that is ${MIN_LENGTH - value.length} short.`,
      `Aim for ${GOOD_LENGTH} or more. Three or four ordinary words joined together beat one clever word.`
    ),
    rule(
      "mixed",
      "More than just letters",
      "At least one number or symbol",
      counts.digit > 0 || counts.symbol > 0,
      counts.digit > 0 || counts.symbol > 0 ? "Has a number or a symbol." : "Letters only.",
      "One number or symbol is enough. You do not need a row of them at the end."
    ),
    rule(
      "no-name",
      "Not your name",
      "No name, username or school name inside",
      usedTokens.length === 0,
      usedTokens.length > 0
        ? `Contains "${usedTokens.join('", "')}", which everyone in your class already knows.`
        : tokens.length === 0
          ? "No personal details were filled in, so this was not checked."
          : "None of your details appear in it.",
      "The person most likely to try your password is somebody who sits near you."
    ),
    rule(
      "no-birth-year",
      "Not your birth year",
      "No four-digit year from your life",
      !hasYear,
      hasYear
        ? `${year} is in the password, and your birthday is on the class list.`
        : year === ""
          ? "No birth year was filled in, so this was not checked."
          : "Your birth year is not in it.",
      "There are only a handful of years anyone would try for a student, so a year adds almost nothing."
    ),
    rule(
      "not-common",
      "Not a famous password",
      "Not on the list everyone tries",
      !isCommon,
      isCommon ? "This is one of the very first passwords anybody guesses." : "Not one of the famous ones.",
      "Game names, team names and 'password' with a number after it are all on that list."
    ),
    rule(
      "no-runs",
      "No keyboard runs",
      "No 1234, abcd or qwerty",
      !runs,
      runs ? "There is a run like 1234 or qwer in it." : "No straight runs across the keyboard.",
      "Runs feel random while you type them, but they are the first thing a guessing program tries."
    ),
    rule(
      "no-repeats",
      "No long repeats",
      "No more than 2 of the same character in a row",
      repeatRun <= 2,
      repeatRun <= 2 ? `Longest repeat is ${repeatRun}.` : `There are ${repeatRun} of the same character in a row.`,
      "Repeats add length without adding difficulty."
    ),
    rule(
      "fits",
      "Fits the login box",
      `${TYPICAL_MAX_LENGTH} characters or fewer`,
      value.length <= TYPICAL_MAX_LENGTH,
      value.length <= TYPICAL_MAX_LENGTH
        ? "Short enough for a school login form."
        : `${value.length} characters — some school portals cut this off, and then you cannot log in.`,
      "If the form silently trims it, the password you set is not the one you typed."
    ),
  ];

  const patterns = [];
  if (runs) patterns.push("keyboard or counting run");
  if (containsCommon) patterns.push("famous password inside");
  if (usedTokens.length > 0) patterns.push("your own name or school");
  if (hasYear) patterns.push("your birth year");
  // 12 bits removed per pattern: a conservative estimate of how much easier
  // each one makes the guessing job. Long repeats are already handled by the
  // run-collapsing model, so they are not double-counted here.
  const PENALTY_BITS_PER_PATTERN = 12;
  const penalty = patterns.length * PENALTY_BITS_PER_PATTERN;
  const bits = Math.max(0, estimate.bits - penalty);

  const entropyScore = Math.max(0, Math.min(100, Math.round((bits / SCORE_TARGET_BITS) * 100)));
  // Failing any of these means the password is guessable by a person rather
  // than by a machine, so no amount of entropy should let it read as "good".
  const criticalFailure = rules.some(
    (entry) => CRITICAL_RULES.includes(entry.id) && !entry.passed
  );
  const score = criticalFailure ? Math.min(entropyScore, CRITICAL_SCORE_CAP) : entropyScore;
  let verdict = "Too easy to guess";
  if (score >= 85) verdict = "Excellent";
  else if (score >= 65) verdict = "Good";
  else if (score >= 40) verdict = "Okay, could be better";

  const passedCount = rules.filter((entry) => entry.passed).length;

  return {
    length: value.length,
    counts,
    pool: estimate.pool,
    model: estimate.model,
    rawBits: estimate.bits,
    penalty,
    patterns,
    bits,
    score,
    verdict,
    rules,
    passedCount,
    ruleCount: rules.length,
    failedRules: rules.filter((entry) => !entry.passed).map((entry) => entry.label),
    allPassed: passedCount === rules.length,
    crackTimes: {
      online: formatCrackTime(log10CrackSeconds(bits, GUESS_RATES.online)),
      offlineFast: formatCrackTime(log10CrackSeconds(bits, GUESS_RATES.offlineFast)),
    },
  };
}
