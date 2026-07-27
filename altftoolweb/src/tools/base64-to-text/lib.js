/**
 * Base64 to Text — decode a Base64 payload into readable text.
 *
 * Pure JavaScript: no React, no DOM, no clock. Same input, same output.
 */

/** RFC 4648 §4: every 4 Base64 characters carry 3 bytes. */
export const BASE64_CHARS_PER_GROUP = 4;
export const BASE64_BYTES_PER_GROUP = 3;

/** Guard against pasting a whole file: 8 MB of text is already unreadable. */
export const MAX_DECODED_BYTES = 8 * 1024 * 1024;

/**
 * Byte-order marks. UTF-8's BOM is optional and Unicode recommends against
 * it, but Windows tools still emit it, and UTF-16 payloads are common in
 * .NET and Java Base64 dumps.
 */
export const BOMS = [
  { name: "UTF-8", encoding: "utf-8", bytes: [0xef, 0xbb, 0xbf] },
  { name: "UTF-32 LE", encoding: "utf-8", bytes: [0xff, 0xfe, 0x00, 0x00], unsupported: true },
  { name: "UTF-16 LE", encoding: "utf-16le", bytes: [0xff, 0xfe] },
  { name: "UTF-16 BE", encoding: "utf-16be", bytes: [0xfe, 0xff] },
];

/**
 * C0 control codes that never appear in plain text. Tab (09), LF (0A),
 * CR (0D) and form feed (0C) are excluded because they legitimately do.
 */
export const TEXT_SAFE_CONTROLS = new Set([0x09, 0x0a, 0x0c, 0x0d]);

/** Above this share of control bytes, the payload is binary, not text. */
export const BINARY_CONTROL_RATIO = 0.1;

/** `data:[<mime>][;base64],<payload>` — RFC 2397. */
export const DATA_URL_RE =
  /^data:([a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+)?((?:;[a-z0-9-]+=[^;,]*)*)(;base64)?,([\s\S]*)$/i;

const BASE64_ANY_RE = /^[A-Za-z0-9+/\-_]*={0,2}$/;

/** Remove a `data:` wrapper, keeping the MIME type it declared. */
export function splitDataUrl(raw) {
  const value = String(raw == null ? "" : raw).trim();
  const match = DATA_URL_RE.exec(value);
  if (!match) return { declaredMime: "", payload: value, wasDataUrl: false };
  return { declaredMime: (match[1] || "").toLowerCase(), payload: match[4] || "", wasDataUrl: true };
}

/** Strip whitespace, fold URL-safe characters, restore `=` padding. */
export function normalizeBase64(payload) {
  const compact = String(payload == null ? "" : payload).replace(/\s+/g, "");
  if (!compact) return { error: "Paste a Base64 string to decode." };
  if (!BASE64_ANY_RE.test(compact)) {
    const bad = compact.split("").find((ch) => !/[A-Za-z0-9+/\-_=]/.test(ch));
    return {
      error: `"${bad}" is not a Base64 character. Standard Base64 uses A–Z, a–z, 0–9, + and /.`,
    };
  }
  const folded = compact.replace(/-/g, "+").replace(/_/g, "/").replace(/=+$/, "");
  const remainder = folded.length % BASE64_CHARS_PER_GROUP;
  if (remainder === 1) {
    return { error: "Invalid length — a Base64 group can never be a single leftover character." };
  }
  const padding = remainder === 0 ? 0 : BASE64_CHARS_PER_GROUP - remainder;
  return {
    normalized: folded + "=".repeat(padding),
    urlSafe: /[-_]/.test(compact),
    addedPadding: padding,
    hadWhitespace: /\s/.test(String(payload)),
  };
}

/** Exact decoded length: 3 bytes per group, minus padding characters. */
export function base64ByteLength(normalized) {
  const value = String(normalized || "");
  if (value.length === 0 || value.length % BASE64_CHARS_PER_GROUP !== 0) return 0;
  const padding = (value.match(/=+$/) || [""])[0].length;
  return (value.length / BASE64_CHARS_PER_GROUP) * BASE64_BYTES_PER_GROUP - padding;
}

/** Decode to bytes; returns `{ error }` rather than throwing. */
export function decodeBase64ToBytes(normalized) {
  try {
    const binary = atob(normalized);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return { bytes };
  } catch {
    return { error: "Base64 could not be decoded — the string is malformed or truncated." };
  }
}

/** Identify a leading byte-order mark. */
export function detectBom(bytes) {
  for (const bom of BOMS) {
    if (bytes.length < bom.bytes.length) continue;
    let hit = true;
    for (let i = 0; i < bom.bytes.length; i += 1) {
      if (bytes[i] !== bom.bytes[i]) {
        hit = false;
        break;
      }
    }
    if (hit) return bom;
  }
  return null;
}

/** Share of bytes that are non-printable C0 controls (excluding tab/CR/LF/FF). */
export function controlByteRatio(bytes) {
  if (!bytes || bytes.length === 0) return 0;
  let controls = 0;
  for (let i = 0; i < bytes.length; i += 1) {
    const byte = bytes[i];
    if (byte < 0x20 && !TEXT_SAFE_CONTROLS.has(byte)) controls += 1;
    else if (byte === 0x7f) controls += 1;
  }
  return controls / bytes.length;
}

/**
 * Strict UTF-8 decode first (fatal:true rejects invalid sequences); on
 * failure fall back to replacement characters and say so.
 */
export function decodeBytesToText(bytes, encoding = "utf-8") {
  try {
    return { text: new TextDecoder(encoding, { fatal: true }).decode(bytes), strict: true, encoding };
  } catch {
    try {
      return { text: new TextDecoder(encoding).decode(bytes), strict: false, encoding };
    } catch {
      return { text: "", strict: false, encoding, unsupported: true };
    }
  }
}

/** Word, line and character counts over the decoded text. */
export function textStats(text) {
  const value = String(text || "");
  const words = value.trim() ? value.trim().split(/\s+/).length : 0;
  const lines = value === "" ? 0 : value.split(/\r\n|\r|\n/).length;
  return {
    characters: value.length,
    codePoints: Array.from(value).length,
    words,
    lines,
  };
}

/** IEC-style byte label. */
export function formatBytes(bytes) {
  const value = Number(bytes);
  if (!Number.isFinite(value) || value < 0) return "—";
  if (value < 1024) return `${value} B`;
  const units = ["KB", "MB", "GB"];
  let size = value / 1024;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size.toFixed(size >= 100 ? 0 : 1)} ${units[unit]}`;
}

/**
 * Total function: Base64 in, decoded text plus a report out.
 * Always returns `{ error }` or a complete result — never NaN or Infinity.
 */
export function decodeBase64Text(rawInput) {
  const { declaredMime, payload, wasDataUrl } = splitDataUrl(rawInput);
  const normalizedResult = normalizeBase64(payload);
  if (normalizedResult.error) return { error: normalizedResult.error };

  const { normalized, urlSafe, addedPadding } = normalizedResult;
  const byteLength = base64ByteLength(normalized);
  if (byteLength <= 0) {
    return { error: "That Base64 decodes to zero bytes — there is nothing to show." };
  }
  if (byteLength > MAX_DECODED_BYTES) {
    return {
      error: `That decodes to ${formatBytes(byteLength)}, over the ${formatBytes(
        MAX_DECODED_BYTES,
      )} limit for a text preview.`,
    };
  }

  const decoded = decodeBase64ToBytes(normalized);
  if (decoded.error) return { error: decoded.error };
  const { bytes } = decoded;

  const bom = detectBom(bytes);
  if (bom && bom.unsupported) {
    return { error: `This payload carries a ${bom.name} byte-order mark, which browsers cannot decode.` };
  }

  const encoding = bom ? bom.encoding : "utf-8";
  // The BOM itself is metadata, not content, so it is dropped before decoding.
  const body = bom ? bytes.slice(bom.bytes.length) : bytes;
  const decodedText = decodeBytesToText(body, encoding);
  if (decodedText.unsupported) {
    return { error: `Your browser cannot decode ${encoding} text.` };
  }

  const controlRatio = controlByteRatio(body);
  const looksBinary = controlRatio > BINARY_CONTROL_RATIO;
  const stats = textStats(decodedText.text);

  return {
    text: decodedText.text,
    encoding,
    bom: bom ? bom.name : "",
    validUtf8: decodedText.strict,
    looksBinary,
    controlPercent: Math.round(controlRatio * 1000) / 10,
    bytes: byteLength,
    sizeLabel: formatBytes(byteLength),
    base64Length: normalized.length,
    // Base64 costs exactly 4/3 of the payload, before padding.
    overheadPercent: Math.round(((normalized.length - byteLength) / byteLength) * 100),
    urlSafe,
    addedPadding,
    wasDataUrl,
    declaredMime,
    characters: stats.characters,
    codePoints: stats.codePoints,
    words: stats.words,
    lines: stats.lines,
  };
}
