/**
 * Hex ⇄ Base64 conversion — pure logic, no Buffer, no atob/btoa, no DOM.
 *
 * Both encodings describe the same bytes: hexadecimal packs 4 bits per character
 * (RFC 4648 §8), Base64 packs 6 bits per character (RFC 4648 §4). Converting
 * between them therefore means decoding to raw bytes and re-encoding.
 */

/** Standard Base64 alphabet — RFC 4648 §4, Table 1. */
export const BASE64_STANDARD = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/** URL and filename safe Base64 alphabet — RFC 4648 §5, Table 2 (+ → -, / → _). */
export const BASE64_URLSAFE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

/** RFC 4648 pad character, used to round the output to a multiple of 4 characters. */
export const PAD_CHAR = "=";

/** Bits carried by one character of each encoding. */
export const BITS_PER_HEX_CHAR = 4;
export const BITS_PER_BASE64_CHAR = 6;

/** Guard against pasting an entire file into the box: 1 MB of hex text. */
export const MAX_INPUT_CHARS = 1_000_000;

const HEX_DIGITS = "0123456789abcdef";

/** Separators people leave inside hex dumps: whitespace, colons, dashes, 0x prefixes. */
const HEX_NOISE = /(?:0x)|[\s:,\-_]/giu;

/**
 * Strip formatting noise from a hex string and validate it.
 * @returns {{ error: string }|{ clean: string }}
 */
export function cleanHex(input) {
  const raw = String(input ?? "");
  if (raw.length > MAX_INPUT_CHARS) {
    return { error: `Input is longer than ${MAX_INPUT_CHARS.toLocaleString("en-US")} characters.` };
  }
  const clean = raw.replace(HEX_NOISE, "").toLowerCase();
  if (clean === "") {
    return { error: "Enter some hexadecimal to convert." };
  }
  const bad = clean.match(/[^0-9a-f]/u);
  if (bad) {
    return { error: `"${bad[0]}" is not a hexadecimal digit — use 0-9 and a-f only.` };
  }
  if (clean.length % 2 !== 0) {
    return {
      error: `Hex needs an even number of digits (two per byte); this has ${clean.length}. Add a leading zero.`,
    };
  }
  return { clean };
}

/** Hex string (already cleaned) → array of byte values. */
export function hexToBytes(cleanHexString) {
  const bytes = new Uint8Array(cleanHexString.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = parseInt(cleanHexString.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/** Bytes → lowercase hex string. */
export function bytesToHex(bytes) {
  let out = "";
  for (let i = 0; i < bytes.length; i += 1) {
    const byte = bytes[i] & 0xff;
    out += HEX_DIGITS[byte >> 4] + HEX_DIGITS[byte & 0x0f];
  }
  return out;
}

/**
 * Bytes → Base64. Groups of 3 bytes (24 bits) become 4 characters of 6 bits.
 * A trailing group of 1 byte produces 2 characters + "==", of 2 bytes 3 + "=".
 */
export function bytesToBase64(bytes, { urlSafe = false, pad = true } = {}) {
  const alphabet = urlSafe ? BASE64_URLSAFE : BASE64_STANDARD;
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = bytes[i + 1];
    const b2 = bytes[i + 2];
    out += alphabet[b0 >> 2];
    if (b1 === undefined) {
      out += alphabet[(b0 & 0x03) << 4];
      if (pad) out += PAD_CHAR + PAD_CHAR;
      break;
    }
    out += alphabet[((b0 & 0x03) << 4) | (b1 >> 4)];
    if (b2 === undefined) {
      out += alphabet[(b1 & 0x0f) << 2];
      if (pad) out += PAD_CHAR;
      break;
    }
    out += alphabet[((b1 & 0x0f) << 2) | (b2 >> 6)];
    out += alphabet[b2 & 0x3f];
  }
  return out;
}

/**
 * Base64 → bytes. Accepts both alphabets and tolerates missing padding.
 * @returns {{ error: string }|{ bytes: Uint8Array }}
 */
export function base64ToBytes(input) {
  const raw = String(input ?? "");
  if (raw.length > MAX_INPUT_CHARS) {
    return { error: `Input is longer than ${MAX_INPUT_CHARS.toLocaleString("en-US")} characters.` };
  }
  const stripped = raw.replace(/[\s\r\n]/gu, "").replace(/=+$/u, "");
  if (stripped === "") {
    return { error: "Enter some Base64 to convert." };
  }
  const values = [];
  for (const char of stripped) {
    let index = BASE64_STANDARD.indexOf(char);
    if (index === -1) index = BASE64_URLSAFE.indexOf(char);
    if (index === -1) {
      return { error: `"${char}" is not a Base64 character (A-Z, a-z, 0-9, + / or - _).` };
    }
    values.push(index);
  }
  // 4 Base64 characters carry 3 bytes; a leftover of exactly 1 character is impossible.
  if (values.length % 4 === 1) {
    return { error: "Base64 length is invalid — a group can never end with a single character." };
  }

  const byteCount = Math.floor((values.length * BITS_PER_BASE64_CHAR) / 8);
  const bytes = new Uint8Array(byteCount);
  let buffer = 0;
  let bits = 0;
  let out = 0;
  for (const value of values) {
    buffer = (buffer << BITS_PER_BASE64_CHAR) | value;
    bits += BITS_PER_BASE64_CHAR;
    if (bits >= 8) {
      bits -= 8;
      bytes[out] = (buffer >> bits) & 0xff;
      out += 1;
    }
  }
  return { bytes };
}

/** Format hex for reading: uppercase and/or grouped in pairs. */
export function formatHex(hex, { uppercase = false, spaced = false } = {}) {
  const cased = uppercase ? hex.toUpperCase() : hex;
  if (!spaced) return cased;
  return cased.replace(/.{2}/gu, "$& ").trim();
}

/** Decode bytes as UTF-8 text; returns null when the bytes are not valid UTF-8 text. */
export function bytesToUtf8(bytes) {
  try {
    const decoder = new TextDecoder("utf-8", { fatal: true });
    return decoder.decode(bytes);
  } catch {
    return null;
  }
}

/**
 * Hex → Base64.
 * @param {{ input: string, urlSafe?: boolean, pad?: boolean }} params
 * @returns {{ error: string }|object}
 */
export function hexToBase64({ input, urlSafe = false, pad = true }) {
  const cleaned = cleanHex(input);
  if (cleaned.error) return { error: cleaned.error };

  const bytes = hexToBytes(cleaned.clean);
  const output = bytesToBase64(bytes, { urlSafe, pad });

  return {
    output,
    byteCount: bytes.length,
    inputChars: cleaned.clean.length,
    outputChars: output.length,
    text: bytesToUtf8(bytes),
    normalisedInput: cleaned.clean,
  };
}

/**
 * Base64 → Hex.
 * @param {{ input: string, uppercase?: boolean, spaced?: boolean }} params
 * @returns {{ error: string }|object}
 */
export function base64ToHex({ input, uppercase = false, spaced = false }) {
  const decoded = base64ToBytes(input);
  if (decoded.error) return { error: decoded.error };

  const hex = bytesToHex(decoded.bytes);
  const output = formatHex(hex, { uppercase, spaced });

  return {
    output,
    byteCount: decoded.bytes.length,
    inputChars: String(input ?? "").replace(/\s/gu, "").length,
    outputChars: output.length,
    text: bytesToUtf8(decoded.bytes),
    normalisedInput: String(input ?? "").replace(/\s/gu, ""),
  };
}

/** Size comparison shown under the result: how compact each encoding is per byte. */
export function encodingOverhead(byteCount) {
  if (!Number.isFinite(byteCount) || byteCount <= 0) {
    return { error: "No bytes to measure." };
  }
  const hexChars = byteCount * 2;
  const base64Chars = Math.ceil(byteCount / 3) * 4;
  return {
    byteCount,
    hexChars,
    base64Chars,
    hexOverheadPercent: Math.round(((hexChars - byteCount) / byteCount) * 1000) / 10,
    base64OverheadPercent: Math.round(((base64Chars - byteCount) / byteCount) * 1000) / 10,
    savedChars: hexChars - base64Chars,
  };
}
