/**
 * Base64 URL Encoder — turn text, standard Base64 or hex bytes into the
 * URL-safe base64url alphabet of RFC 4648 §5.
 *
 * Pure JavaScript: no React, no DOM, no clock. Deterministic throughout.
 */

/** RFC 4648 §4: 4 encoded characters carry 3 bytes. */
export const BASE64_CHARS_PER_GROUP = 4;
export const BASE64_BYTES_PER_GROUP = 3;

/**
 * base64url replaces the two non-alphanumeric characters of the standard
 * alphabet: `+` (value 62) becomes `-`, `/` (value 63) becomes `_`.
 */
export const URL_SAFE_SUBSTITUTIONS = [
  { standard: "+", urlSafe: "-", value: 62 },
  { standard: "/", urlSafe: "_", value: 63 },
];

/** Characters that need percent-escaping in a URL, and what each costs. */
export const PERCENT_ESCAPES = { "+": "%2B", "/": "%2F", "=": "%3D" };

/** What the input can be interpreted as. */
export const SOURCE_TYPES = [
  { key: "text", label: "Plain text (UTF-8)" },
  { key: "base64", label: "Standard Base64" },
  { key: "hex", label: "Hex bytes" },
];

/**
 * Length ceilings worth warning about.
 *  - 2,000 characters is the safe interoperable URL length (the old Internet
 *    Explorer limit of 2,083 is still the practical floor across proxies).
 *  - 8,190 is Apache httpd's default LimitRequestLine, the most common
 *    server-side 414 "URI Too Long" trigger.
 *  - 4,096 bytes is the per-cookie size every user agent must support
 *    according to RFC 6265 §6.1.
 */
export const SAFE_URL_LENGTH = 2000;
export const SERVER_URL_LIMIT = 8190;
export const COOKIE_MAX_BYTES = 4096;

/** Enough for a certificate or a long token; not for a whole file. */
export const MAX_INPUT_CHARS = 2_000_000;

/** Standard MIME Base64 wraps at 76 characters (RFC 2045 §6.8). */
export const MIME_WRAP_COLUMN = 76;

/** UTF-8 bytes for a string. */
export function textToBytes(text) {
  return new TextEncoder().encode(String(text == null ? "" : text));
}

/** Hex string (spaces, `0x` prefixes and colons tolerated) to bytes. */
export function hexToBytes(input) {
  const compact = String(input == null ? "" : input)
    .replace(/0x/gi, "")
    .replace(/[\s:,-]/g, "");
  if (!compact) return { error: "Enter some hex bytes, for example 48 65 6c 6c 6f." };
  if (!/^[0-9a-fA-F]+$/.test(compact)) {
    const bad = compact.split("").find((ch) => !/[0-9a-fA-F]/.test(ch));
    return { error: `"${bad}" is not a hex digit. Use 0–9 and a–f only.` };
  }
  if (compact.length % 2 !== 0) {
    return { error: "Hex input must have an even number of digits — each byte is two." };
  }
  const bytes = new Uint8Array(compact.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = parseInt(compact.slice(i * 2, i * 2 + 2), 16);
  }
  return { bytes };
}

/** Fold either alphabet to standard, strip whitespace, restore `=` padding. */
export function toStandardBase64(value) {
  const compact = String(value == null ? "" : value).replace(/\s+/g, "");
  if (!compact) return { error: "There is nothing to encode." };
  if (!/^[A-Za-z0-9+/\-_]*={0,2}$/.test(compact)) {
    const bad = compact.split("").find((ch) => !/[A-Za-z0-9+/\-_=]/.test(ch));
    return { error: `"${bad}" is not a Base64 character.` };
  }
  const folded = compact.replace(/-/g, "+").replace(/_/g, "/").replace(/=+$/, "");
  const remainder = folded.length % BASE64_CHARS_PER_GROUP;
  if (remainder === 1) {
    return { error: "Invalid Base64 length — a group can never be a single leftover character." };
  }
  const padding = remainder === 0 ? 0 : BASE64_CHARS_PER_GROUP - remainder;
  return { standard: folded + "=".repeat(padding) };
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

/** Bytes → standard Base64. */
export function bytesToBase64(bytes) {
  let binary = "";
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

/** Standard → URL-safe; padding kept only when asked for. */
export function toUrlSafeBase64(standard, keepPadding = false) {
  const swapped = String(standard || "").replace(/\+/g, "-").replace(/\//g, "_");
  return keepPadding ? swapped : swapped.replace(/=+$/, "");
}

/** Percent-encode the three characters standard Base64 cannot put in a URL. */
export function percentEncodeBase64(standard) {
  return String(standard || "").replace(/[+/=]/g, (ch) => PERCENT_ESCAPES[ch]);
}

/** Encoded length before padding: ceil(bytes / 3) * 4. */
export function encodedLength(byteCount, withPadding = true) {
  const bytes = Number(byteCount);
  if (!Number.isFinite(bytes) || bytes < 0) return 0;
  if (withPadding) return Math.ceil(bytes / BASE64_BYTES_PER_GROUP) * BASE64_CHARS_PER_GROUP;
  // Unpadded: every 3 bytes give 4 characters, a 2-byte tail gives 3, a 1-byte tail gives 2.
  const full = Math.floor(bytes / BASE64_BYTES_PER_GROUP);
  const tail = bytes % BASE64_BYTES_PER_GROUP;
  return full * BASE64_CHARS_PER_GROUP + (tail === 0 ? 0 : tail + 1);
}

/** Break a long string into fixed-width lines, MIME style. */
export function wrapLines(value, column = MIME_WRAP_COLUMN) {
  const width = Math.max(1, Math.floor(Number(column) || MIME_WRAP_COLUMN));
  const text = String(value || "");
  const lines = [];
  for (let i = 0; i < text.length; i += width) lines.push(text.slice(i, i + width));
  return lines.join("\n");
}

/**
 * Total function: encode `input` to URL-safe Base64.
 * Returns `{ error }` or a complete result — never NaN, never partial.
 *
 * @param {{input: string, sourceType?: string, keepPadding?: boolean, wrap?: boolean}} options
 */
export function encodeToBase64Url({ input, sourceType = "text", keepPadding = false, wrap = false } = {}) {
  const raw = String(input == null ? "" : input);
  if (!raw.trim()) return { error: "Enter something to encode." };
  if (raw.length > MAX_INPUT_CHARS) {
    return { error: `Input is too long — the limit is ${MAX_INPUT_CHARS.toLocaleString("en-US")} characters.` };
  }
  const type = SOURCE_TYPES.some((entry) => entry.key === sourceType) ? sourceType : "text";

  let bytes;
  if (type === "text") {
    bytes = textToBytes(raw);
  } else if (type === "hex") {
    const parsed = hexToBytes(raw);
    if (parsed.error) return { error: parsed.error };
    bytes = parsed.bytes;
  } else {
    const standardised = toStandardBase64(raw);
    if (standardised.error) return { error: standardised.error };
    const decoded = base64ToBytes(standardised.standard);
    if (decoded.error) return { error: decoded.error };
    bytes = decoded.bytes;
  }
  if (bytes.length === 0) return { error: "That input has zero bytes to encode." };

  const encoded = bytesToBase64(bytes);
  if (encoded.error) return { error: encoded.error };

  const standard = encoded.base64;
  const urlSafe = toUrlSafeBase64(standard, keepPadding);
  const percentEncoded = percentEncodeBase64(standard);
  const output = wrap ? wrapLines(urlSafe) : urlSafe;
  const substitutions =
    (standard.match(/\+/g) || []).length + (standard.match(/\//g) || []).length;
  const paddingChars = (standard.match(/=+$/) || [""])[0].length;

  return {
    output,
    urlSafe,
    standard,
    percentEncoded,
    sourceType: type,
    bytes: bytes.length,
    urlSafeLength: urlSafe.length,
    standardLength: standard.length,
    percentEncodedLength: percentEncoded.length,
    // Each escaped +, / or = costs 3 characters instead of 1, so 2 extra each.
    urlCharactersSaved: percentEncoded.length - urlSafe.length,
    substitutions,
    paddingChars,
    paddingKept: keepPadding,
    // Base64 costs exactly 4/3 of the payload, before padding.
    overheadPercent: Math.round(((standard.length - bytes.length) / bytes.length) * 100),
    exceedsSafeUrl: urlSafe.length > SAFE_URL_LENGTH,
    exceedsServerLimit: urlSafe.length > SERVER_URL_LIMIT,
    exceedsCookieLimit: urlSafe.length > COOKIE_MAX_BYTES,
  };
}
