/**
 * Callback Verification Number Builder — number validation and source trust.
 *
 * Pure module: no React, no DOM, no clock reads.
 *
 * The idea: never call back on a number the caller gave you. Keep a card of
 * numbers you obtained yourself, from a source you can name, and dial only
 * those. This module does two jobs:
 *
 *  1. Format-checks the number against India's National Numbering Plan:
 *     - Mobile: 10 digits, first digit 6, 7, 8 or 9.
 *     - Fixed line: STD code plus subscriber number, 10 digits once the trunk
 *       0 is removed. Delhi's 011 is not the only STD code that starts with a
 *       1 — Noida (0120), Meerut (0121), Gurgaon (0124), Faridabad (0129),
 *       Ludhiana (0161), Chandigarh (0172), Patiala (0175), Jalandhar (0181)
 *       and Amritsar (0183) do too, alongside the traditional 2-5 range.
 *     - Toll-free: 1800 followed by 6 or 7 digits.
 *     - Short codes: 3-6 digits beginning with 1 (112, 1930, 139, 1915 ...).
 *     A format check proves the number is dialable, not that it is genuine —
 *     the tool says so rather than implying otherwise.
 *
 *  2. Rates where you got the number from, which is the part that actually
 *     decides trust. A number typed off your own card, passbook, policy
 *     document or the address bar of an official site is trustworthy. A number
 *     from a search-result listing, a sponsored ad, an SMS, a WhatsApp forward
 *     or the caller themselves is not — search-ad and listing poisoning is the
 *     single most common way people are handed a fake "customer care" line.
 */

/** India country calling code. */
export const COUNTRY_CODE = "91";

/** Widely published national service numbers, for reference only. */
export const REFERENCE_NUMBERS = [
  ["112", "All-India emergency number (police, fire, ambulance)"],
  ["1930", "National cyber-crime financial fraud helpline"],
  ["1909", "DND / unsolicited commercial communication complaints"],
  ["139", "Indian Railways enquiry and assistance"],
  ["1915", "National Consumer Helpline"],
];

/** Where the number came from. `trust` drives whether it belongs on the card. */
export const SOURCES = [
  {
    id: "cardBack",
    label: "Printed on my card, passbook, policy or statement",
    trust: "trusted",
    note: "Issued to you directly by the organisation. The strongest everyday source.",
  },
  {
    id: "officialSite",
    label: "Typed the official domain into the browser myself and read it there",
    trust: "trusted",
    note: "Typing the address avoids poisoned search results and sponsored links.",
  },
  {
    id: "inApp",
    label: "From inside the organisation's own app, while signed in",
    trust: "trusted",
    note: "The app is authenticated to you, so its help section is a reliable source.",
  },
  {
    id: "branch",
    label: "Given to me in person at a branch, office or shop",
    trust: "trusted",
    note: "Face-to-face, on their premises. Note who gave it to you.",
  },
  {
    id: "searchResult",
    label: "A search engine result or a sponsored link",
    trust: "untrusted",
    note: "Fake customer-care listings and paid ads are the most common source of scam numbers.",
  },
  {
    id: "smsOrChat",
    label: "An SMS, WhatsApp forward or email I received",
    trust: "untrusted",
    note: "Anyone can send you a number. This is the delivery method, not a source.",
  },
  {
    id: "caller",
    label: "The caller gave it to me",
    trust: "untrusted",
    note: "The entire point of a callback is to not use a number the caller supplied.",
  },
  {
    id: "socialPost",
    label: "A social media post, comment or directory listing",
    trust: "untrusted",
    note: "Comment sections under bank and airline posts are seeded with fake helplines.",
  },
  {
    id: "unknown",
    label: "I am not sure where it came from",
    trust: "unknown",
    note: "If you cannot name the source, it does not belong on the card.",
  },
];

const SOURCE_BY_ID = new Map(SOURCES.map((source) => [source.id, source]));

export const NUMBER_KINDS = {
  mobile: "Mobile",
  fixed: "Landline",
  tollFree: "Toll-free",
  shortCode: "Short code",
};

/** Strip everything except digits and a leading plus. */
const cleanDigits = (raw) => String(raw).replace(/[^\d+]/g, "");

/**
 * Validate and normalise one Indian phone number.
 *
 * @param {string} raw as typed by the user
 * @returns {object} { ok:true, kind, national, display, dial } or { ok:false, reason }
 */
export function classifyNumber(raw) {
  if (raw === undefined || raw === null) return { ok: false, reason: "Enter a number." };
  const trimmed = String(raw).trim();
  if (trimmed === "") return { ok: false, reason: "Enter a number." };
  if (/[a-zA-Z]/.test(trimmed)) return { ok: false, reason: "A phone number cannot contain letters." };

  let digits = cleanDigits(trimmed);
  if (digits.startsWith("+")) digits = digits.slice(1);
  if (digits.startsWith("00" + COUNTRY_CODE)) digits = digits.slice(2 + COUNTRY_CODE.length);
  else if (digits.startsWith(COUNTRY_CODE) && digits.length > 10) digits = digits.slice(COUNTRY_CODE.length);

  const hadTrunkZero = digits.startsWith("0");
  if (hadTrunkZero) digits = digits.replace(/^0+/, "");

  if (digits === "") {
    return hadTrunkZero
      ? { ok: false, reason: "That is only zeros — check the number." }
      : { ok: false, reason: "Enter a number." };
  }
  if (/^(\d)\1+$/.test(digits) && digits.length > 3) {
    return { ok: false, reason: "That is the same digit repeated — check the number." };
  }

  // Toll-free: 1800 followed by 6 or 7 digits (10 or 11 digits in total).
  if (/^1800\d{6,7}$/.test(digits)) {
    return {
      ok: true,
      kind: "tollFree",
      national: digits,
      display: `${digits.slice(0, 4)}-${digits.slice(4)}`,
      dial: digits,
    };
  }

  // Short codes: 3 to 6 digits starting with 1, e.g. 112, 139, 1930, 1915.
  if (/^1\d{2,5}$/.test(digits)) {
    return { ok: true, kind: "shortCode", national: digits, display: digits, dial: digits };
  }

  // Some STD codes (Ahmedabad 079, Bangalore 080...) start with the same
  // digits (7-9) that mobile numbers use, so a bare 10-digit number in that
  // range is genuinely ambiguous by pattern alone — there is no way to tell
  // a mobile number from an STD code with its trunk 0 already stripped.
  // When the caller typed the number in national format with its leading
  // trunk 0 ("0" + STD code + subscriber), that leading zero is real
  // evidence of a landline, so trust it and classify as fixed line before
  // falling through to the mobile check. A bare 10-digit number with no
  // leading 0 in this range is classified as mobile, as before — a
  // documented limitation of format-only checking.
  if (hadTrunkZero && /^[6-9]\d{9}$/.test(digits)) {
    return {
      ok: true,
      kind: "fixed",
      national: digits,
      display: `0${digits}`,
      dial: `+${COUNTRY_CODE}${digits}`,
    };
  }

  // Mobile: exactly 10 digits starting 6-9.
  if (/^[6-9]\d{9}$/.test(digits)) {
    return {
      ok: true,
      kind: "mobile",
      national: digits,
      display: `${digits.slice(0, 5)} ${digits.slice(5)}`,
      dial: `+${COUNTRY_CODE}${digits}`,
    };
  }

  // Fixed line: 10 digits in total (STD code + subscriber). Several STD
  // codes start with 1 (Noida 120, Meerut 121, Gurgaon 124, Faridabad 129,
  // Ludhiana 161, Chandigarh 172, Patiala 175, Jalandhar 181, Amritsar 183),
  // not just Delhi's 11 — the 1800 toll-free and 1xxx short-code patterns
  // above are checked first, so they never reach this branch.
  if (/^1\d{9}$/.test(digits) || /^[2-5]\d{9}$/.test(digits)) {
    return {
      ok: true,
      kind: "fixed",
      national: digits,
      display: `0${digits}`,
      dial: `+${COUNTRY_CODE}${digits}`,
    };
  }

  if (digits.length < 10) {
    return { ok: false, reason: `Too short — ${digits.length} digits. Indian numbers are 10 digits, or a 1xxx short code.` };
  }
  if (digits.length > 11) {
    return { ok: false, reason: `Too long — ${digits.length} digits after removing the country code.` };
  }
  return { ok: false, reason: "Not a recognised Indian mobile, landline, toll-free or short-code format." };
}

/** Trust weights used for the card score. */
export const TRUST_POINTS = { trusted: 1, unknown: 0, untrusted: -1 };

/**
 * Build the callback card from a list of entries.
 *
 * @param {object} input
 * @param {Array<{org:string, number:string, source:string}>} input.entries
 * @param {string} input.owner  whose card this is (used in the printed header)
 * @returns {object} { rows, verified, rejected, score, card } or { error }
 */
export function buildCallbackCard({ entries = [], owner = "" } = {}) {
  if (!Array.isArray(entries)) return { error: "The list of organisations is unreadable." };
  if (entries.length === 0) return { error: "Add at least one organisation and number." };
  if (entries.length > 50) return { error: "Keep the card to 50 entries or fewer." };

  const seen = new Map();
  const rows = entries.map((entry, index) => {
    const org = String(entry && entry.org !== undefined ? entry.org : "").trim();
    const sourceId = entry && entry.source ? entry.source : "unknown";
    const source = SOURCE_BY_ID.get(sourceId) || SOURCE_BY_ID.get("unknown");
    const check = classifyNumber(entry ? entry.number : "");

    const issues = [];
    if (org === "") issues.push("Name the organisation so you know what you are calling.");
    if (!check.ok) issues.push(check.reason);
    if (source.trust === "untrusted") {
      issues.push("Source is not good enough for a callback card — find this number on your card, statement or the app.");
    }
    if (source.trust === "unknown") {
      issues.push("Unknown source. Re-obtain the number from something the organisation gave you.");
    }

    let duplicateOf = null;
    if (check.ok) {
      const previous = seen.get(check.national);
      if (previous !== undefined) {
        duplicateOf = previous;
        issues.push(`Same number as entry ${previous + 1}.`);
      } else {
        seen.set(check.national, index);
      }
    }

    return {
      index,
      org,
      raw: entry ? String(entry.number || "") : "",
      source,
      check,
      issues,
      duplicateOf,
      verified: check.ok && org !== "" && source.trust === "trusted" && duplicateOf === null,
    };
  });

  const verified = rows.filter((row) => row.verified);
  const rejected = rows.filter((row) => !row.verified);

  const rawScore = rows.reduce((sum, row) => sum + TRUST_POINTS[row.source.trust], 0);
  const score = rows.length > 0 ? Math.round(((rawScore / rows.length) * 50 + 50) * 10) / 10 : 0;

  const header = owner.trim() === "" ? "Callback card" : `Callback card — ${owner.trim()}`;
  const cardLines = [
    header,
    "Rule: never call a number the caller gives you. Hang up and dial from this card.",
    "",
  ];
  if (verified.length > 0) {
    verified.forEach((row) => {
      cardLines.push(`${row.org}: ${row.check.display}  (${NUMBER_KINDS[row.check.kind]}, source: ${row.source.label.toLowerCase()})`);
    });
  } else {
    cardLines.push("No entry is verified yet.");
  }
  if (rejected.length > 0) {
    cardLines.push("", "Not on the card yet:");
    rejected.forEach((row) => {
      cardLines.push(`- ${row.org || "(unnamed)"} ${row.raw}: ${row.issues.join(" ")}`);
    });
  }
  cardLines.push("", "National numbers:");
  REFERENCE_NUMBERS.forEach(([number, label]) => cardLines.push(`${number} — ${label}`));

  return {
    rows,
    verified,
    rejected,
    score,
    card: cardLines.join("\n"),
    totalEntries: rows.length,
  };
}
