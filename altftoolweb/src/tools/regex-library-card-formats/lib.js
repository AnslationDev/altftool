/**
 * Card number FORMAT library — for input formatting, masking and rough
 * network detection in UIs. Explicitly NOT verification: no Luhn check, no
 * BIN database, no issuer lookup.
 *
 * Sources for the ranges encoded here (public IIN range documentation):
 *  - Visa: IIN prefix 4; PAN lengths 13, 16 or 19.
 *  - Mastercard: prefixes 51–55 plus the 2-series 2221–2720 (added 2016);
 *    length 16.
 *  - American Express: prefixes 34 and 37; length 15.
 *  - Discover: prefixes 6011 and 65; length 16 (Discover also has 644–649
 *    and long 622126–622925 UnionPay ranges — omitted for readability and
 *    noted as a limitation).
 *  - RuPay (NPCI): public ranges include 508, 60, 65, 81, 82; length 16.
 *    The 65 range overlaps Discover — that ambiguity is inherent and noted.
 *  - JCB: prefixes 3528–3589; length 16.
 *  - Diners Club International: prefixes 300–305, 36, 38; length 14.
 *  - Display grouping per ISO/IEC 7813 embossing convention: 16 digits as
 *    4-4-4-4, Amex 15 as 4-6-5, Diners 14 as 4-6-4.
 *  - Masking: PCI DSS Req. 3.3 permits displaying at most the first 6 and
 *    last 4 digits; the default mask here shows only the last 4.
 */

/** Longest real PAN is 19 digits (ISO/IEC 7812). */
export const MAX_PAN_DIGITS = 19;
/** Shortest real PAN is 12 digits (ISO/IEC 7812); 13 for the networks here. */
export const MIN_PAN_DIGITS = 12;

/** PCI DSS Req. 3.3: at most first 6 + last 4 may be displayed. */
export const MASK_VISIBLE_LAST = 4;

export const PATTERNS = [
  {
    id: "visa",
    name: "Visa",
    source: /^4[0-9]{12}(?:[0-9]{3})?(?:[0-9]{3})?$/.source,
    flags: "",
    lengths: [13, 16, 19],
    description: "Prefix 4; 13, 16 or 19 digits.",
    limitations: [
      "Matches any 4-prefixed number of the right length — a made-up 4000… string passes.",
      "No Luhn or issuer check; this is formatting metadata only.",
    ],
    shouldMatch: ["4111111111111111", "4222222222222"],
    shouldNotMatch: ["411111111111111", "5111111111111111"],
  },
  {
    id: "mastercard",
    name: "Mastercard",
    source:
      /^(?:5[1-5][0-9]{14}|2(?:22[1-9]|2[3-9][0-9]|[3-6][0-9]{2}|7[01][0-9]|720)[0-9]{12})$/.source,
    flags: "",
    lengths: [16],
    description: "Prefixes 51–55 or 2221–2720; 16 digits.",
    limitations: [
      "The 2-series alternation encodes 2221–2720 exactly — older copied patterns that only check 51–55 reject millions of real cards.",
      "Maestro (50, 56–69) is a separate scheme and does not match.",
    ],
    shouldMatch: ["5555555555554444", "2221000000000009", "2720990000000000"],
    shouldNotMatch: ["2220990000000000", "2721000000000000", "5655555555554444"],
  },
  {
    id: "amex",
    name: "American Express",
    source: /^3[47][0-9]{13}$/.source,
    flags: "",
    lengths: [15],
    description: "Prefixes 34 or 37; 15 digits; displays as 4-6-5.",
    limitations: [
      "Amex CVV (CID) is 4 digits on the front — remember that when building the form next to this field.",
      "No Luhn check; 340000000000000 passes the format.",
    ],
    shouldMatch: ["378282246310005", "371449635398431"],
    shouldNotMatch: ["3782822463100051", "361449635398431"],
  },
  {
    id: "rupay",
    name: "RuPay (NPCI)",
    source: /^(?:508[0-9]{13}|(?:60|65|81|82)[0-9]{14})$/.source,
    flags: "",
    lengths: [16],
    description: "Public ranges 508, 60, 65, 81, 82; 16 digits.",
    limitations: [
      "The 65 range overlaps Discover — a 65… number matches both patterns, and only a BIN database can say which network issued it.",
      "NPCI does not publish an exhaustive public IIN list; treat detection as a UI hint, never a routing decision.",
    ],
    shouldMatch: ["5085000000000000", "6070000000000000", "8120000000000000"],
    shouldNotMatch: ["5090000000000000", "7012000000000000", "608200000000000"],
  },
  {
    id: "discover",
    name: "Discover",
    source: /^6(?:011|5[0-9]{2})[0-9]{12}$/.source,
    flags: "",
    lengths: [16],
    description: "Prefixes 6011 or 65; 16 digits.",
    limitations: [
      "Discover's 644–649 and 622126–622925 (UnionPay co-badged) ranges are omitted for readability — add them if you serve those cards.",
      "65 overlaps RuPay; see the RuPay note.",
    ],
    shouldMatch: ["6011111111111117", "6511000000000000"],
    shouldNotMatch: ["6111111111111117", "601111111111111"],
  },
  {
    id: "jcb",
    name: "JCB",
    source: /^35(?:2[89]|[3-8][0-9])[0-9]{12}$/.source,
    flags: "",
    lengths: [16],
    description: "Prefixes 3528–3589; 16 digits.",
    limitations: [
      "Only the modern 3528–3589 range; legacy 15-digit JCB (2131, 1800) is not included.",
      "No Luhn or issuer check.",
    ],
    shouldMatch: ["3530111333300000", "3566002020360505"],
    shouldNotMatch: ["3527000000000000", "3590000000000000"],
  },
  {
    id: "diners",
    name: "Diners Club International",
    source: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/.source,
    flags: "",
    lengths: [14],
    description: "Prefixes 300–305, 36 or 38; 14 digits; displays as 4-6-4.",
    limitations: [
      "Many Diners ranges are now issued as 16-digit Mastercards outside the US/Canada and will match the Mastercard pattern instead.",
      "No Luhn or issuer check.",
    ],
    shouldMatch: ["30569309025904", "38520000023237"],
    shouldNotMatch: ["30669309025904", "3852000002323"],
  },
];

/**
 * Strip common separators and validate that what remains is a plausible PAN
 * digit string.
 * @returns {{digits: string} | {error: string}}
 */
export function sanitizeDigits(input) {
  if (typeof input !== "string" || input.trim() === "") {
    return { error: "Type a card-style number (use official test numbers, never a real card)." };
  }
  const digits = input.replace(/[\s-]/g, "");
  if (!/^[0-9]+$/.test(digits)) {
    return { error: "Only digits, spaces and dashes are allowed." };
  }
  if (digits.length < MIN_PAN_DIGITS) {
    return { error: `Card numbers are at least ${MIN_PAN_DIGITS} digits (got ${digits.length}).` };
  }
  if (digits.length > MAX_PAN_DIGITS) {
    return { error: `Card numbers are at most ${MAX_PAN_DIGITS} digits (got ${digits.length}).` };
  }
  return { digits };
}

/** All network patterns the digit string matches (can be several — 65 overlaps). */
export function detectNetworks(digits) {
  return PATTERNS.filter((pattern) => new RegExp(pattern.source).test(digits)).map(
    (pattern) => pattern.id,
  );
}

/**
 * Group digits for display per ISO/IEC 7813 embossing convention:
 * 15 digits -> 4-6-5 (Amex), 14 -> 4-6-4 (Diners), otherwise blocks of 4.
 */
export function formatCardNumber(digits) {
  if (digits.length === 15) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 10)} ${digits.slice(10)}`;
  }
  if (digits.length === 14) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 10)} ${digits.slice(10)}`;
  }
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

/**
 * Mask all but the last 4 digits (stricter than the PCI DSS Req. 3.3 maximum
 * of first 6 + last 4), preserving display grouping.
 */
export function maskCardNumber(digits) {
  const visible = digits.slice(-MASK_VISIBLE_LAST);
  const hidden = "•".repeat(Math.max(0, digits.length - MASK_VISIBLE_LAST));
  return formatCardNumber(hidden + visible).replace(/•/g, "•");
}

/**
 * One-call analysis for the UI: sanitize, detect, format, mask.
 * @returns {{digits, length, networks, networkNames, formatted, masked} | {error}}
 */
export function analyzeCard(input) {
  const clean = sanitizeDigits(input);
  if (clean.error) return { error: clean.error };
  const { digits } = clean;
  const networks = detectNetworks(digits);
  const networkNames = networks.map(
    (id) => PATTERNS.find((pattern) => pattern.id === id)?.name ?? id,
  );
  return {
    digits,
    length: digits.length,
    networks,
    networkNames,
    formatted: formatCardNumber(digits),
    masked: maskCardNumber(digits),
  };
}
