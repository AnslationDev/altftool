/**
 * Password policy regex library.
 *
 * Sources for the rules encoded here:
 *  - NIST SP 800-63B §5.1.1.2 — memorised secrets SHALL be at least 8
 *    characters; verifiers SHOULD allow at least 64; composition rules
 *    (mandatory upper/lower/digit/symbol) are explicitly discouraged in
 *    favour of length and breached-password screening.
 *  - The classic "3 of 4 / 4 of 4 character classes" corporate policies these
 *    patterns encode date from older NIST SP 800-63 revisions and Microsoft
 *    AD complexity requirements — provided here because real systems still
 *    demand them, with the caveats stated.
 *  - Lookahead technique: (?=.*X) is a zero-width assertion that scans the
 *    whole string for X without consuming characters, which is how one regex
 *    enforces several independent "contains" rules at once.
 */

/**
 * Guard for the tester input. NIST recommends supporting 64+ chars; 256 is a
 * generous ceiling that keeps the lookahead scans trivial.
 */
export const MAX_TEST_INPUT = 256;

export const PATTERNS = [
  {
    id: "min8",
    name: "Minimum length only (NIST floor)",
    strictness: "NIST baseline",
    source: /^.{8,}$/.source,
    flags: "",
    description:
      "At least 8 of any character — the NIST SP 800-63B minimum for user-chosen passwords, with no composition rules.",
    breakdown: [
      ["^", "anchor at the start of the string"],
      [".{8,}", "8 or more of any character except a newline"],
      ["$", "anchor at the end — nothing else allowed"],
    ],
    limitations: [
      "'password' and '12345678' pass — pair this with a breached-password list, which is what NIST actually recommends.",
      "The dot does not match newlines; multi-line paste needs the s flag.",
      "No maximum — combine with a sane upper bound (NIST says support at least 64).",
    ],
    shouldMatch: ["password", "12345678", "correct horse battery"],
    shouldNotMatch: ["short7!", "", "1234567"],
  },
  {
    id: "letters-numbers",
    name: "8+ with letters and numbers",
    strictness: "Light policy",
    source: /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.source,
    flags: "",
    description:
      "At least 8 characters containing at least one letter and one digit — the lightest composition rule that blocks all-digit PINs.",
    breakdown: [
      ["(?=.*[A-Za-z])", "lookahead: somewhere in the string there is a letter"],
      ["(?=.*\\d)", "lookahead: somewhere in the string there is a digit"],
      [".{8,}", "then the actual match: 8+ of any character"],
    ],
    limitations: [
      "'passw0rd' passes — composition does not equal strength.",
      "ASCII letters only; accented letters count as 'any character' but not as the required letter.",
      "Blocks some strong all-letter passphrases, which NIST advises against doing.",
    ],
    shouldMatch: ["passw0rd", "a1234567"],
    shouldNotMatch: ["password", "12345678", "a1"],
  },
  {
    id: "classic",
    name: "8+ with upper, lower and digit",
    strictness: "Corporate 3-of-4",
    source: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.source,
    flags: "",
    description:
      "The classic corporate policy: 8+ characters with at least one lowercase, one uppercase and one digit, enforced by three stacked lookaheads.",
    breakdown: [
      ["(?=.*[a-z])", "lookahead: at least one lowercase letter anywhere"],
      ["(?=.*[A-Z])", "lookahead: at least one uppercase letter anywhere"],
      ["(?=.*\\d)", "lookahead: at least one digit anywhere"],
      [".{8,}", "then match the whole string if it is 8+ characters"],
    ],
    limitations: [
      "'Password1' passes — predictable capitalise-first, digit-last habits defeat the rule.",
      "Current NIST guidance discourages mandatory composition; prefer length + breach screening when you control the policy.",
      "No symbol requirement — some auditors will ask for the 4-of-4 variant instead.",
    ],
    shouldMatch: ["Passw0rd", "Abcdefg1"],
    shouldNotMatch: ["passw0rd", "PASSW0RD", "Password"],
  },
  {
    id: "full",
    name: "8+ with upper, lower, digit and symbol",
    strictness: "Corporate 4-of-4",
    source: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.source,
    flags: "",
    description:
      "Full four-class complexity: 8+ characters with lowercase, uppercase, digit and at least one symbol, where any non-alphanumeric character (including space) counts as the symbol.",
    breakdown: [
      ["(?=.*[a-z])", "lookahead: at least one lowercase letter"],
      ["(?=.*[A-Z])", "lookahead: at least one uppercase letter"],
      ["(?=.*\\d)", "lookahead: at least one digit"],
      ["(?=.*[^A-Za-z0-9])", "lookahead: at least one character that is not a letter or digit"],
      [".{8,}", "then match if the string is 8+ characters"],
    ],
    limitations: [
      "Defining 'symbol' as [^A-Za-z0-9] means spaces and unicode letters like é satisfy it — decide if that is acceptable.",
      "Policies that enumerate symbols ([@$!%*?&]) silently reject users whose symbol is not on the list; the negated class avoids that trap.",
      "'P@ssw0rd' passes — complexity theatre; screen against breach lists too.",
    ],
    shouldMatch: ["Passw0rd!", "S3cure pass"],
    shouldNotMatch: ["Passw0rd", "passw0rd!", "PASSW0RD!"],
  },
  {
    id: "passphrase",
    name: "Passphrase policy (12–64, NIST style)",
    strictness: "Length-first",
    source: /^.{12,64}$/.source,
    flags: "",
    description:
      "Length-first policy in the spirit of NIST SP 800-63B: 12 to 64 of any character, no composition rules, spaces welcome — built for passphrases.",
    breakdown: [
      ["^", "anchor at the start"],
      [".{12,64}", "12 to 64 of any character — the only rule"],
      ["$", "anchor at the end"],
    ],
    limitations: [
      "'aaaaaaaaaaaa' passes — a length rule alone still needs breach screening and a repetition check in code.",
      "The 64 upper bound is a policy choice; NIST asks verifiers to support at least 64, not to cap there.",
      "Astral-plane emoji count as two characters each in JavaScript regex without the u flag.",
    ],
    shouldMatch: ["correct horse battery", "twelve chars"],
    shouldNotMatch: ["elevenchars", ""],
  },
];

/**
 * Compile a pattern source safely.
 * @returns {{regex: RegExp} | {error: string}}
 */
export function compileRegex(source, flags = "") {
  if (typeof source !== "string" || source.length === 0) {
    return { error: "Pattern source is empty." };
  }
  try {
    return { regex: new RegExp(source, flags) };
  } catch (cause) {
    return { error: `Invalid regular expression: ${cause.message}` };
  }
}

/**
 * Test one input string against a pattern.
 * @returns {{matched: boolean, input: string} | {error: string}}
 */
export function testInput({ source, flags = "", input }) {
  if (typeof input !== "string") {
    return { error: "Type a value to test." };
  }
  if (input.length > MAX_TEST_INPUT) {
    return { error: `Test input is limited to ${MAX_TEST_INPUT} characters.` };
  }
  const compiled = compileRegex(source, flags);
  if (compiled.error) return { error: compiled.error };
  return { matched: compiled.regex.test(input), input };
}

/**
 * Run a pattern against its own documented examples.
 * @returns {{passed: boolean, total: number, failures: string[]}}
 */
export function selfTest(pattern) {
  const failures = [];
  const compiled = compileRegex(pattern.source, pattern.flags);
  if (compiled.error) {
    return { passed: false, total: 0, failures: [compiled.error] };
  }
  for (const sample of pattern.shouldMatch) {
    if (!compiled.regex.test(sample)) failures.push(`expected match: ${sample}`);
  }
  for (const sample of pattern.shouldNotMatch) {
    if (compiled.regex.test(sample)) failures.push(`expected NO match: ${sample}`);
  }
  const total = pattern.shouldMatch.length + pattern.shouldNotMatch.length;
  return { passed: failures.length === 0, total, failures };
}
