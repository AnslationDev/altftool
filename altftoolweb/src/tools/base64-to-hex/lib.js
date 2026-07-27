/**
 * Base64 to Hex — decode a Base64 payload and render the bytes as hexadecimal.
 *
 * Pure JavaScript: no React, no DOM, no clock reads.
 * Rules implemented:
 *   - Base64 alphabet and padding: RFC 4648 §4 (standard) / §5 (URL-safe).
 *   - data: URL grammar: RFC 2397 §3.
 *   - Hex dump layout follows the classic `hexdump -C` form: 8-digit offset,
 *     16 bytes per line split into two 8-byte groups, then a printable gutter.
 */

/** Standard Base64 alphabet — RFC 4648 §4, table 1. */
export const BASE64_STANDARD_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/** 3 bytes ↔ 4 characters — RFC 4648 §4. */
export const BASE64_BYTES_PER_GROUP = 3;
export const BASE64_CHARS_PER_GROUP = 4;

/** Every byte is exactly two hex digits, so hex is always 2× the byte count. */
export const HEX_DIGITS_PER_BYTE = 2;

/** ~4 M characters ≈ 3 MB decoded — hex output is 2 chars per byte, so it doubles again. */
export const MAX_BASE64_INPUT_CHARS = 4_000_000;

/** `hexdump -C` prints 16 bytes per line in two 8-byte groups. */
export const DUMP_BYTES_PER_LINE = 16;
export const DUMP_GROUP_SIZE = 8;

/** Offsets are printed as 8 hex digits, as `hexdump -C` does. */
export const DUMP_OFFSET_DIGITS = 8;

export const OUTPUT_FORMATS = [
  { key: "spaced", label: "Spaced bytes", hint: "89 50 4e 47" },
  { key: "plain", label: "Continuous", hint: "89504e47" },
  { key: "prefixed", label: "C array", hint: "0x89, 0x50, 0x4e" },
  { key: "dump", label: "Hex dump", hint: "offset + hex + ASCII" },
];

const DECODE_LOOKUP = (() => {
  const table = new Int16Array(128).fill(-1);
  for (let i = 0; i < BASE64_STANDARD_ALPHABET.length; i += 1) {
    table[BASE64_STANDARD_ALPHABET.charCodeAt(i)] = i;
  }
  table["-".charCodeAt(0)] = 62; // URL-safe alias for `+`
  table["_".charCodeAt(0)] = 63; // URL-safe alias for `/`
  return table;
})();

const DATA_URL_RE = /^data:([^,]*),([\s\S]*)$/i;

export function stripBase64Whitespace(value) {
  return String(value == null ? "" : value).replace(/[\s\r\n\t]+/g, "");
}

/** Split a data: URL into media type + payload, or null if it is not one. */
export function parseDataUrl(value) {
  const match = DATA_URL_RE.exec(String(value == null ? "" : value).trim());
  if (!match) return null;
  const parts = (match[1] || "").split(";").map((part) => part.trim()).filter(Boolean);
  return {
    mediaType: parts.length && parts[0].includes("/") ? parts[0].toLowerCase() : "",
    isBase64: parts.some((part) => part.toLowerCase() === "base64"),
    payload: match[2],
  };
}

/** Decode Base64 → bytes, or { error } with a plain-language reason. */
export function decodeBase64ToBytes(value) {
  const raw = stripBase64Whitespace(value);
  if (!raw) return { error: "Paste a Base64 string first." };
  if (raw.length > MAX_BASE64_INPUT_CHARS) {
    return {
      error: `That is ${raw.length.toLocaleString("en-US")} characters. This tool converts up to ${MAX_BASE64_INPUT_CHARS.toLocaleString("en-US")} at a time.`,
    };
  }

  let body = raw;
  let padding = 0;
  while (body.endsWith("=")) {
    body = body.slice(0, -1);
    padding += 1;
  }
  if (padding > 2) return { error: "Base64 never carries more than two `=` padding characters." };
  if (body.includes("=")) return { error: "`=` padding may only appear at the very end of a Base64 string." };

  for (let i = 0; i < body.length; i += 1) {
    const code = body.charCodeAt(i);
    if (code > 127 || DECODE_LOOKUP[code] < 0) {
      return {
        error: `“${body[i]}” at position ${i + 1} is not a Base64 character. Allowed: A–Z, a–z, 0–9, + / (or - _ for URL-safe).`,
      };
    }
  }
  if (body.length % BASE64_CHARS_PER_GROUP === 1) {
    return { error: "This Base64 string is truncated — a length of 4n+1 characters cannot exist." };
  }

  const byteLength = Math.floor((body.length * BASE64_BYTES_PER_GROUP) / BASE64_CHARS_PER_GROUP);
  const bytes = new Uint8Array(byteLength);
  let out = 0;
  let buffer = 0;
  let bits = 0;
  for (let i = 0; i < body.length; i += 1) {
    buffer = (buffer << 6) | DECODE_LOOKUP[body.charCodeAt(i)];
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes[out] = (buffer >> bits) & 0xff;
      out += 1;
    }
  }
  return {
    bytes,
    byteLength,
    base64Chars: raw.length,
    unpadded: padding === 0 && body.length % BASE64_CHARS_PER_GROUP !== 0,
  };
}

const hexByte = (value, uppercase) => {
  const text = value.toString(16).padStart(HEX_DIGITS_PER_BYTE, "0");
  return uppercase ? text.toUpperCase() : text;
};

/** Render bytes as hex in one of the four supported layouts. */
export function bytesToHex(bytes, options = {}) {
  const { format = "spaced", uppercase = false } = options;
  const parts = [];
  for (let i = 0; i < bytes.length; i += 1) parts.push(hexByte(bytes[i], uppercase));
  if (format === "plain") return parts.join("");
  if (format === "prefixed") return parts.map((part) => `0x${part}`).join(", ");
  return parts.join(" ");
}

/** A byte is shown in the ASCII gutter only when it is printable (0x20–0x7E). */
const printable = (byte) => (byte >= 0x20 && byte <= 0x7e ? String.fromCharCode(byte) : ".");

/** Classic `hexdump -C` output: offset, two 8-byte hex groups, ASCII gutter. */
export function formatHexDump(bytes, options = {}) {
  const { uppercase = false } = options;
  const lines = [];
  for (let offset = 0; offset < bytes.length; offset += DUMP_BYTES_PER_LINE) {
    const slice = bytes.subarray(offset, offset + DUMP_BYTES_PER_LINE);
    const left = [];
    const right = [];
    let gutter = "";
    for (let i = 0; i < DUMP_BYTES_PER_LINE; i += 1) {
      const cell = i < slice.length ? hexByte(slice[i], uppercase) : "  ";
      if (i < DUMP_GROUP_SIZE) left.push(cell);
      else right.push(cell);
      if (i < slice.length) gutter += printable(slice[i]);
    }
    const address = offset.toString(16).padStart(DUMP_OFFSET_DIGITS, "0");
    lines.push(
      `${uppercase ? address.toUpperCase() : address}  ${left.join(" ")}  ${right.join(" ")}  |${gutter}|`,
    );
  }
  return lines.join("\n");
}

const KIB = 1024;

export function formatBytes(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return "—";
  if (n < KIB) return `${n} B`;
  if (n < KIB * KIB) return `${(n / KIB).toFixed(1)} KB`;
  return `${(n / (KIB * KIB)).toFixed(2)} MB`;
}

/**
 * Main entry point: Base64 (raw or data: URL) → hexadecimal.
 * Returns { error } for anything that cannot be decoded.
 */
export function base64ToHex(input, options = {}) {
  const { format = "spaced", uppercase = false } = options;
  const text = String(input == null ? "" : input).trim();
  if (!text) return { error: "Paste a Base64 string to convert." };

  const dataUrl = parseDataUrl(text);
  if (dataUrl && !dataUrl.isBase64) {
    return { error: "That data: URL is percent-encoded, not Base64. Add `;base64` or paste the Base64 payload." };
  }

  const decoded = decodeBase64ToBytes(dataUrl ? dataUrl.payload : text);
  if (decoded.error) return { error: decoded.error };
  if (decoded.byteLength === 0) return { error: "That Base64 string decodes to zero bytes — there is nothing to show in hex." };

  const hex = format === "dump" ? formatHexDump(decoded.bytes, { uppercase }) : bytesToHex(decoded.bytes, { format, uppercase });

  const warnings = [];
  if (decoded.unpadded) warnings.push("The string had no `=` padding; it was decoded as URL-safe Base64.");
  if (dataUrl && dataUrl.mediaType) warnings.push(`Decoded the payload of a ${dataUrl.mediaType} data URL.`);

  return {
    hex,
    bytes: decoded.bytes,
    byteLength: decoded.byteLength,
    base64Chars: decoded.base64Chars,
    hexDigits: decoded.byteLength * HEX_DIGITS_PER_BYTE,
    firstEightBytes: bytesToHex(decoded.bytes.subarray(0, 8), { format: "spaced", uppercase: true }),
    dumpLines: Math.ceil(decoded.byteLength / DUMP_BYTES_PER_LINE),
    format,
    warnings,
  };
}
