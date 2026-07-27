/**
 * Phone number regex library.
 *
 * Sources for the rules encoded here:
 *  - ITU-T Recommendation E.164 — international numbers are at most 15 digits
 *    and the country code cannot start with 0 (the "+[1-9]\d{1,14}" shape).
 *  - Indian National Numbering Plan (DoT/TRAI) — mobile numbers are 10 digits
 *    and currently start with 6, 7, 8 or 9; country code +91; trunk prefix 0.
 *  - North American Numbering Plan (ATIS/NANPA) — 10 digits as NXX-NXX-XXXX
 *    where N is 2–9 (area code and central-office code cannot start with 0/1).
 *  - UK National Telephone Numbering Plan (Ofcom) — numbers are dialled as a
 *    leading trunk 0 (or +44 replacing it) followed by 9 or 10 digits.
 */

/**
 * Guard against pathological inputs. A formatted phone number never exceeds
 * ~25 characters; 1000 keeps worst-case regex backtracking trivial.
 */
export const MAX_TEST_INPUT = 1000;

export const PATTERNS = [
  {
    id: "e164",
    name: "E.164 canonical",
    strictness: "Storage format",
    source: /^\+[1-9]\d{1,14}$/.source,
    flags: "",
    description:
      "The ITU-T E.164 canonical form: a + sign, then 2–15 digits with no separators. The format to store numbers in and the one SMS APIs like Twilio require.",
    limitations: [
      "Rejects every human-formatted input — strip spaces, dashes and brackets before testing.",
      "Does not check that the country code is assigned or that the number length is right for that country.",
      "No extensions (x1234) — E.164 has no notion of them.",
    ],
    shouldMatch: ["+919876543210", "+14155552671", "+442071838750"],
    shouldNotMatch: ["+0123456789", "9876543210", "+1234567890123456"],
  },
  {
    id: "india-mobile",
    name: "India mobile (TRAI)",
    strictness: "Country-specific",
    source: /^(?:\+91[\s-]?|0)?[6-9]\d{4}[\s-]?\d{5}$/.source,
    flags: "",
    description:
      "Indian 10-digit mobile numbers starting 6–9 per the DoT numbering plan, with optional +91 or trunk-0 prefix and an optional separator after the first five digits.",
    limitations: [
      "Mobiles only — rejects valid Indian landlines like 011-23456789 (STD code + 6–8 digits).",
      "Only one separator position is allowed (98765 43210); formats like 98-76-54-32-10 fail.",
      "The 6–9 first-digit rule is current TRAI practice, not physics — new ranges could open later.",
    ],
    shouldMatch: ["9876543210", "+91 98765 43210", "09876543210", "+91-9876543210"],
    shouldNotMatch: ["5876543210", "98765432101", "987654321"],
  },
  {
    id: "us-nanp",
    name: "US / Canada (NANP)",
    strictness: "Country-specific",
    source: /^(?:\+1[\s.-]?)?\(?[2-9]\d{2}\)?[\s.-]?[2-9]\d{2}[\s.-]?\d{4}$/.source,
    flags: "",
    description:
      "North American 10-digit numbers with optional +1, enforcing the NANP rule that the area code and exchange code start with 2–9, in common formats like (415) 555-2671.",
    limitations: [
      "Format-only — does not check the area code is actually assigned by NANPA.",
      "Allows a stray unbalanced bracket like 415) 555-2671 because both brackets are independently optional.",
      "No extension suffix (ext. 42 / x42); strip extensions before testing.",
    ],
    shouldMatch: ["(415) 555-2671", "415-555-2671", "+1 415.555.2671", "4155552671"],
    shouldNotMatch: ["415-155-2671", "115-555-2671", "41555526"],
  },
  {
    id: "uk",
    name: "United Kingdom (Ofcom)",
    strictness: "Country-specific",
    source: /^(?:\+44\s?|0)(?:\d\s?){9,10}$/.source,
    flags: "",
    description:
      "UK numbers per the Ofcom numbering plan: a leading trunk 0 or +44, followed by 9 or 10 digits with optional spaces — covers London 020 numbers and 07 mobiles.",
    limitations: [
      "Catches the classic mistake of keeping the trunk 0 after +44 (+44 020…) only because it exceeds 10 digits; +44 07 with a 9-digit rest still slips through.",
      "Accepts spaces anywhere between digits, so oddly grouped but digit-correct numbers pass.",
      "Does not distinguish geographic, mobile, freephone or premium ranges.",
    ],
    shouldMatch: ["+44 20 7183 8750", "020 7183 8750", "07911 123456", "+447911123456"],
    shouldNotMatch: ["+44 020 7183 8750", "12345", "0791112345678"],
  },
  {
    id: "loose-international",
    name: "Loose international (CRM input)",
    strictness: "Loosest",
    source: /^\+?(?:[\s().-]*\d){8,15}[\s().-]*$/.source,
    flags: "",
    description:
      "Accepts anything with 8–15 digits (the E.164 ceiling) in any common formatting — brackets, dots, dashes, spaces. Use for free-text contact fields you will normalise later.",
    limitations: [
      "Purely a digit count — +1 (00) 000-0000 passes even though no such number exists.",
      "Cannot tell a phone number from any other 8–15 digit string like an order ID.",
      "Allows a leading 0 after +, which is invalid in real international format.",
    ],
    shouldMatch: ["+91 98765-43210", "(020) 7183 8750", "415.555.2671"],
    shouldNotMatch: ["12-34", "--------", "12345678901234567890"],
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
