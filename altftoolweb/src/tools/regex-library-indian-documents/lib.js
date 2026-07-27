/**
 * Indian document / identifier regex library.
 *
 * Sources for the formats encoded here:
 *  - PAN: Income Tax Department structure — 10 chars AAAAA9999A, where the
 *    4th character is the holder status (P person, C company, H HUF, F firm,
 *    A AOP, T trust, B BOI, L local authority, J artificial juridical
 *    person, G government) and the last is a check letter.
 *  - GSTIN: CGST Rules format — 15 chars: 2-digit state code (01–38 per the
 *    census code list), the 10-char PAN, an entity code (1–9 then A–Z), the
 *    letter Z (default), and a checksum character.
 *  - IFSC: RBI — 11 chars: 4-letter bank code, the reserved digit 0, and a
 *    6-char alphanumeric branch code.
 *  - UPI ID / VPA: NPCI convention — alias@psp-handle, alias of letters,
 *    digits, dot, hyphen, underscore; handle alphabetic (ybl, oksbi, paytm).
 *  - PIN code: India Post — 6 digits, first digit 1–9 (postal zones; 0 is
 *    not a zone).
 *  - Vehicle registration: CMVR standard series SS RR X(X/XX) 9999, plus the
 *    MoRTH 2021 Bharat (BH) series YY BH 9999 XX (I and O never used as
 *    series letters).
 *  - Aadhaar: UIDAI — 12 digits, never starting with 0 or 1, printed in
 *    groups of 4; the last digit is a Verhoeff checksum a regex cannot check.
 */

/** Identifiers are short; 100 chars is ample and keeps matching trivial. */
export const MAX_TEST_INPUT = 100;

export const PATTERNS = [
  {
    id: "pan",
    name: "PAN (Permanent Account Number)",
    strictness: "Structure-checked",
    source: /^[A-Z]{3}[PCHFATBLJG][A-Z][0-9]{4}[A-Z]$/.source,
    flags: "",
    description:
      "10-character PAN with the 4th character restricted to the valid holder-status letters (P, C, H, F, A, T, B, L, J, G) — stricter than the common [A-Z]{5} version.",
    limitations: [
      "The last character is a check letter derived from the first nine; a regex cannot verify it.",
      "Uppercase only by design — uppercase the input before testing.",
      "A structurally valid PAN is not necessarily issued; only the Income Tax e-filing API can confirm existence.",
    ],
    shouldMatch: ["ABCPE1234F", "AAACL5055K", "AAAHA1111A"],
    shouldNotMatch: ["ABCXE1234F", "ABCP1234F", "abcpe1234f"],
  },
  {
    id: "gstin",
    name: "GSTIN (GST number)",
    strictness: "Structure-checked",
    source: /^(0[1-9]|[1-2][0-9]|3[0-8])[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.source,
    flags: "",
    description:
      "15-character GSTIN: state code range-checked to 01–38, the embedded 10-char PAN, entity code (1–9 or A–Z), the mandatory 14th character Z, and the checksum position.",
    limitations: [
      "The 15th character is a mod-36 checksum; the regex checks its position, not its value.",
      "The embedded PAN uses the loose [A-Z]{5} form — combine with the PAN pattern for the 4th-letter rule.",
      "Existence and active status can only be confirmed on the GST portal.",
    ],
    shouldMatch: ["27AAPFU0939F1ZV", "07ABCPE1234F2Z5"],
    shouldNotMatch: ["00AAPFU0939F1ZV", "27AAPFU0939F1AV", "27aapfu0939f1zv"],
  },
  {
    id: "ifsc",
    name: "IFSC (bank branch code)",
    strictness: "Structure-checked",
    source: /^[A-Z]{4}0[A-Z0-9]{6}$/.source,
    flags: "",
    description:
      "11-character IFSC per RBI: a 4-letter bank code, the reserved 5th character 0, and a 6-character alphanumeric branch code — SBIN0005943, HDFC0001234.",
    limitations: [
      "Does not check the bank code against the RBI directory — ZZZZ0123456 passes.",
      "The reserved 5th character is 0 today; RBI could assign it in future.",
      "Uppercase the input first; lowercase fails by design.",
    ],
    shouldMatch: ["SBIN0005943", "HDFC0001234"],
    shouldNotMatch: ["SBIN1005943", "SBI0005943", "sbin0005943"],
  },
  {
    id: "upi",
    name: "UPI ID / VPA",
    strictness: "Convention",
    source: /^[a-zA-Z0-9._-]{2,49}@[a-zA-Z]{2,49}$/.source,
    flags: "",
    description:
      "NPCI virtual payment address: a 2–49 char alias of letters, digits, dot, underscore or hyphen, then @, then an alphabetic PSP handle like ybl, oksbi or paytm.",
    limitations: [
      "PSP handles are a moving list; the pattern accepts handles that do not exist.",
      "Merchant VPAs occasionally contain digits in the handle; loosen to [a-zA-Z0-9]{2,49} if you meet one.",
      "A matching VPA may still be inactive — only a UPI validate-address call confirms it.",
    ],
    shouldMatch: ["9876543210@ybl", "john.doe-1@oksbi"],
    shouldNotMatch: ["@ybl", "john doe@ybl", "john@"],
  },
  {
    id: "pincode",
    name: "PIN code (postal)",
    strictness: "Structure-checked",
    source: /^[1-9][0-9]{5}$/.source,
    flags: "",
    description:
      "6-digit India Post PIN code whose first digit is 1–9 (the postal zone — zone 0 does not exist).",
    limitations: [
      "Does not verify the PIN is allocated — 999999 passes the shape.",
      "Strict 6 digits with no spaces; strip formatting like '110 001' first.",
      "The first-digit rule excludes only leading 0; some in-range numbers are still unused.",
    ],
    shouldMatch: ["110001", "560034"],
    shouldNotMatch: ["012345", "1100011", "11001"],
  },
  {
    id: "vehicle-standard",
    name: "Vehicle number (standard series)",
    strictness: "Structure-checked",
    source: /^[A-Z]{2}[ -]?[0-9]{1,2}[ -]?[A-Z]{1,3}[ -]?[0-9]{4}$/.source,
    flags: "",
    description:
      "CMVR standard registrations — state code, 1–2 digit RTO code, 1–3 series letters and a 4-digit number, with optional spaces or hyphens: MH 12 AB 1234, KA-01-HH-1234.",
    limitations: [
      "Does not check the state code against the real list (XX 12 AB 1234 passes).",
      "Delhi-style mixed RTO blocks like DL 4C AB 4567 fail because the RTO part here is digits only.",
      "BH-series registrations use a different layout — use the dedicated BH pattern.",
    ],
    shouldMatch: ["MH12AB1234", "KA-01-HH-1234", "DL 01 C 0001"],
    shouldNotMatch: ["MH12AB123", "12MHAB1234", "MH12ABCD1234"],
  },
  {
    id: "vehicle-bh",
    name: "Vehicle number (Bharat BH series)",
    strictness: "Structure-checked",
    source: /^[0-9]{2}[ -]?BH[ -]?[0-9]{4}[ -]?[A-HJ-NP-Z]{1,2}$/.source,
    flags: "",
    description:
      "MoRTH 2021 Bharat series: 2-digit registration year, 'BH', a 4-digit number and 1–2 series letters that never include I or O — e.g. 21 BH 2345 AA.",
    limitations: [
      "The year digits are not range-checked against real issue years.",
      "Only uppercase, per the plate standard.",
      "A matching number proves format, not that the registration exists in VAHAN.",
    ],
    shouldMatch: ["21BH2345AA", "22 BH 1234 A"],
    shouldNotMatch: ["21BH2345II", "BH212345AA", "21BH23456A"],
  },
  {
    id: "aadhaar",
    name: "Aadhaar (format only)",
    strictness: "Format only — see caveats",
    source: /^[2-9][0-9]{3}[ -]?[0-9]{4}[ -]?[0-9]{4}$/.source,
    flags: "",
    description:
      "12-digit Aadhaar shape per UIDAI: never starts with 0 or 1, optionally grouped 4-4-4 with spaces or hyphens.",
    limitations: [
      "The 12th digit is a Verhoeff checksum — a regex cannot verify it, so this is format screening only.",
      "Aadhaar is sensitive personal data under the Aadhaar Act and DPDP Act — collect and store it only when legally permitted, and mask all but the last 4 digits.",
      "Format match does not mean the number is issued; verification requires UIDAI's authentication services.",
    ],
    shouldMatch: ["2345 6789 0123", "234567890123"],
    shouldNotMatch: ["1234 5678 9012", "2345678901234", "023456789012"],
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
