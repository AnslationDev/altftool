/**
 * Base64 URL Converter — move a payload between plain text, standard Base64
 * (RFC 4648 §4) and URL-safe base64url (RFC 4648 §5).
 *
 * Pure JavaScript: no React, no DOM, no clock. Deterministic throughout.
 */

/** RFC 4648 §4: 4 encoded characters carry 3 bytes. */
export const BASE64_CHARS_PER_GROUP = 4;
export const BASE64_BYTES_PER_GROUP = 3;

/**
 * The two alphabets differ in exactly two positions, 62 and 63.
 * Standard: `+` and `/`. URL-safe (RFC 4648 §5): `-` and `_`.
 */
export const STANDARD_EXTRA_CHARS = "+/";
export const URL_SAFE_EXTRA_CHARS = "-_";

/**
 * Characters that must be percent-encoded before standard Base64 can travel
 * in a URL query string or path segment (RFC 3986 §2.2 reserved set).
 * Each one costs 3 characters instead of 1.
 */
export const PERCENT_ESCAPES = { "+": "%2B", "/": "%2F", "=": "%3D" };
export const PERCENT_ESCAPE_COST = 3;

/** Formats this converter understands, in menu order. */
export const FORMATS = [
  { key: "text", label: "Plain text (UTF-8)" },
  { key: "base64", label: "Standard Base64" },
  { key: "base64url", label: "URL-safe Base64" },
];

/** Enough for a JWT, a certificate or a config blob; not for a whole file. */
export const MAX_INPUT_CHARS = 2_000_000;

const STANDARD_RE = /^[A-Za-z0-9+/]*={0,2}$/;
const URL_SAFE_RE = /^[A-Za-z0-9\-_]*={0,2}$/;

/**
 * Guess which alphabet a string uses. `ambiguous` means it contains only
 * A–Z, a–z and digits, so both readings decode to the same bytes.
 */
export function detectFormat(value) {
  const compact = String(value == null ? "" : value).replace(/\s+/g, "");
  if (!compact) return "empty";
  const hasStandardOnly = /[+/]/.test(compact);
  const hasUrlSafeOnly = /[-_]/.test(compact);
  if (hasStandardOnly && hasUrlSafeOnly) return "mixed";
  if (hasStandardOnly) return STANDARD_RE.test(compact) ? "base64" : "text";
  if (hasUrlSafeOnly) return URL_SAFE_RE.test(compact) ? "base64url" : "text";
  if (!STANDARD_RE.test(compact)) return "text";
  // Only alphanumerics: a valid Base64 length is the tie-breaker.
  const stripped = compact.replace(/=+$/, "");
  return stripped.length % BASE64_CHARS_PER_GROUP === 1 ? "text" : "ambiguous";
}

/** Fold either alphabet to standard, strip whitespace, restore `=` padding. */
export function toStandardBase64(value) {
  const compact = String(value == null ? "" : value).replace(/\s+/g, "");
  if (!compact) return { error: "There is nothing to convert." };
  if (!/^[A-Za-z0-9+/\-_]*={0,2}$/.test(compact)) {
    const bad = compact.split("").find((ch) => !/[A-Za-z0-9+/\-_=]/.test(ch));
    if (bad) {
      return { error: `"${bad}" is not a Base64 character in either alphabet.` };
    }
    return { error: "\"=\" padding must appear only at the very end, and no more than two characters." };
  }
  // How many '=' the input already carried, before it gets stripped below —
  // needed so addedPadding can report the delta actually added, not the full
  // recomputed count regardless of what padding was already present.
  const originalPadding = (compact.match(/=+$/) || [""])[0].length;
  const folded = compact.replace(/-/g, "+").replace(/_/g, "/").replace(/=+$/, "");
  const remainder = folded.length % BASE64_CHARS_PER_GROUP;
  if (remainder === 1) {
    return { error: "Invalid Base64 length — a group can never be a single leftover character." };
  }
  const padding = remainder === 0 ? 0 : BASE64_CHARS_PER_GROUP - remainder;
  const addedPadding = Math.max(0, padding - originalPadding);
  return { standard: folded + "=".repeat(padding), addedPadding };
}

/** Standard → URL-safe. Padding is optional and normally dropped in URLs. */
export function toUrlSafeBase64(standard, keepPadding = false) {
  const swapped = String(standard || "").replace(/\+/g, "-").replace(/\//g, "_");
  return keepPadding ? swapped : swapped.replace(/=+$/, "");
}

/** Percent-encode the three characters standard Base64 cannot put in a URL. */
export function percentEncodeBase64(standard) {
  return String(standard || "").replace(/[+/=]/g, (ch) => PERCENT_ESCAPES[ch]);
}

/** 3 bytes per 4-character group, minus padding. */
export function base64ByteLength(standard) {
  const value = String(standard || "");
  if (value.length === 0 || value.length % BASE64_CHARS_PER_GROUP !== 0) return 0;
  const padding = (value.match(/=+$/) || [""])[0].length;
  return (value.length / BASE64_CHARS_PER_GROUP) * BASE64_BYTES_PER_GROUP - padding;
}

/** UTF-8 bytes for a string. */
export function textToBytes(text) {
  return new TextEncoder().encode(String(text == null ? "" : text));
}

/** Bytes → standard Base64, via a Latin-1 binary string. */
export function bytesToBase64(bytes) {
  let binary = "";
  // Chunked so a large payload does not blow the argument limit of apply().
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
  }
  try {
    return { base64: btoa(binary) };
  } catch {
    return { error: "Those bytes could not be Base64-encoded." };
  }
}

/** Standard Base64 → bytes. */
export function base64ToBytes(standard) {
  try {
    const binary = atob(standard);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return { bytes };
  } catch {
    return { error: "That Base64 is malformed and could not be decoded." };
  }
}

/** Bytes → text, strict UTF-8 first so mojibake is reported, not hidden. */
export function bytesToText(bytes) {
  try {
    return { text: new TextDecoder("utf-8", { fatal: true }).decode(bytes), strict: true };
  } catch {
    return { text: new TextDecoder("utf-8").decode(bytes), strict: false };
  }
}

/**
 * Total function: convert `input` from one format to another.
 * Returns `{ error }` or a complete result — never NaN, never a partial value.
 *
 * @param {{input: string, from: string, to: string, keepPadding?: boolean}} options
 */
export function convertBase64({ input, from, to, keepPadding = false } = {}) {
  const raw = String(input == null ? "" : input);
  if (!raw.trim()) return { error: "Enter something to convert." };
  if (raw.length > MAX_INPUT_CHARS) {
    return { error: `Input is too long — the limit is ${MAX_INPUT_CHARS.toLocaleString("en-US")} characters.` };
  }
  const fromKey = FORMATS.some((f) => f.key === from) ? from : "text";
  const toKey = FORMATS.some((f) => f.key === to) ? to : "base64url";
  const detected = detectFormat(raw);

  // A "mixed" input carries both standard (+/) and URL-safe (-_) characters,
  // which can only happen if it is corrupted or concatenated from two
  // different encodings — decoding it would silently fold both alphabets
  // together into bytes that were never the original payload. Only applies
  // when the input is actually being interpreted as Base64; plain text is
  // free to contain any of these characters legitimately.
  if (fromKey !== "text" && detected === "mixed") {
    return {
      error:
        "Input mixes standard (+/) and URL-safe (-_) characters — this is likely corrupted or concatenated from two different encodings.",
    };
  }

  // Step 1 — get the raw bytes the payload represents.
  let bytes;
  let addedPadding = 0;
  if (fromKey === "text") {
    bytes = textToBytes(raw);
  } else {
    const standardised = toStandardBase64(raw);
    if (standardised.error) return { error: standardised.error };
    addedPadding = standardised.addedPadding;
    const decoded = base64ToBytes(standardised.standard);
    if (decoded.error) return { error: decoded.error };
    bytes = decoded.bytes;
  }
  if (bytes.length === 0) return { error: "That input decodes to zero bytes." };

  // Step 2 — re-encode the bytes in the requested format.
  const encoded = bytesToBase64(bytes);
  if (encoded.error) return { error: encoded.error };
  const standard = encoded.base64;
  const urlSafe = toUrlSafeBase64(standard, keepPadding);

  let output;
  let validUtf8 = true;
  if (toKey === "text") {
    const decodedText = bytesToText(bytes);
    output = decodedText.text;
    validUtf8 = decodedText.strict;
  } else if (toKey === "base64") {
    output = standard;
  } else {
    output = urlSafe;
  }

  const percentEncoded = percentEncodeBase64(standard);

  return {
    output,
    from: fromKey,
    to: toKey,
    detected,
    bytes: bytes.length,
    standard,
    urlSafe,
    percentEncoded,
    addedPadding,
    validUtf8,
    inputLength: raw.length,
    outputLength: output.length,
    // A base64url string is always shorter in a URL than a percent-encoded
    // standard one, because +, / and = each cost 3 characters when escaped.
    urlCharactersSaved: percentEncoded.length - urlSafe.length,
    paddingStripped: !keepPadding && /=$/.test(standard),
    // Base64 costs exactly 4/3 of the payload, before padding.
    overheadPercent: Math.round(((standard.length - bytes.length) / bytes.length) * 100),
  };
}
