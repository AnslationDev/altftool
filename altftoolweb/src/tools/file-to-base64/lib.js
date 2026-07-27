/**
 * File to Base64 — pure Base64 encoding, data-URL assembly and size maths.
 *
 * Base64 (RFC 4648 §4) maps every 3 input bytes onto 4 output characters from
 * the 64-character alphabet A-Z a-z 0-9 + /, padding the final group with "="
 * so the output length is always a multiple of 4. The encoded size is
 * therefore 4 x ceil(n / 3) characters — about 33.3% larger than the raw file,
 * before any line breaks are added.
 *
 * URL-safe Base64 (RFC 4648 §5) swaps "+" for "-" and "/" for "_" so the
 * string survives inside a URL or filename; padding is usually dropped.
 *
 * A data URL (RFC 2397) is `data:<mime>;base64,<payload>`, which lets a file be
 * embedded directly in HTML, CSS or JSON with no separate request.
 *
 * No React, no DOM, no clock reads — the caller reads the file into a
 * Uint8Array and passes the bytes in.
 */

/** Standard Base64 alphabet (RFC 4648 §4). */
export const BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/** URL- and filename-safe alphabet (RFC 4648 §5): "+" -> "-", "/" -> "_". */
export const BASE64URL_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

/** 3 input bytes become 4 output characters. */
export const INPUT_BYTES_PER_GROUP = 3;
export const OUTPUT_CHARS_PER_GROUP = 4;

/** Base64 grows the payload by exactly 1/3 (33.33%) before padding. */
export const BASE64_EXPANSION_RATIO = OUTPUT_CHARS_PER_GROUP / INPUT_BYTES_PER_GROUP;

/** MIME line-length limit from RFC 2045 §6.8, used when wrapping output. */
export const MIME_LINE_LENGTH = 76;

/** Largest file this encoder will process in one go (32 MiB of raw bytes). */
export const MAX_FILE_BYTES = 32 * 1024 * 1024;

/**
 * Extension -> MIME type, used only when the browser reports no type.
 * Values follow the IANA media type registry.
 */
export const MIME_BY_EXTENSION = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",
  svg: "image/svg+xml",
  ico: "image/x-icon",
  bmp: "image/bmp",
  pdf: "application/pdf",
  json: "application/json",
  xml: "application/xml",
  zip: "application/zip",
  csv: "text/csv",
  txt: "text/plain",
  md: "text/markdown",
  html: "text/html",
  css: "text/css",
  js: "text/javascript",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  ogg: "audio/ogg",
  mp4: "video/mp4",
  webm: "video/webm",
  woff: "font/woff",
  woff2: "font/woff2",
  ttf: "font/ttf",
  otf: "font/otf",
};

const isBytes = (value) => value instanceof Uint8Array;

/** Lowercase extension of a file name, or "" when it has none. */
export function extensionOf(fileName) {
  const name = String(fileName ?? "");
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : "";
}

/** Best MIME type: what the browser said, else the extension map, else octet-stream. */
export function resolveMimeType(fileName, reportedType = "") {
  const reported = String(reportedType ?? "").trim();
  if (reported) return reported;
  const mapped = MIME_BY_EXTENSION[extensionOf(fileName)];
  return mapped ?? "application/octet-stream";
}

/**
 * Encode bytes to Base64 without Buffer or btoa.
 *
 * @param {Uint8Array} bytes
 * @param {{ urlSafe?: boolean, padded?: boolean }} options
 * @returns {string | { error: string }}
 */
export function bytesToBase64(bytes, { urlSafe = false, padded = true } = {}) {
  if (!isBytes(bytes)) return { error: "Nothing to encode — read the file into bytes first." };
  const alphabet = urlSafe ? BASE64URL_ALPHABET : BASE64_ALPHABET;
  let out = "";
  let i = 0;
  for (; i + 2 < bytes.length; i += 3) {
    const group = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    out +=
      alphabet[(group >> 18) & 63] +
      alphabet[(group >> 12) & 63] +
      alphabet[(group >> 6) & 63] +
      alphabet[group & 63];
  }
  const remaining = bytes.length - i;
  if (remaining === 1) {
    const group = bytes[i] << 16;
    out += alphabet[(group >> 18) & 63] + alphabet[(group >> 12) & 63];
    if (padded) out += "==";
  } else if (remaining === 2) {
    const group = (bytes[i] << 16) | (bytes[i + 1] << 8);
    out += alphabet[(group >> 18) & 63] + alphabet[(group >> 12) & 63] + alphabet[(group >> 6) & 63];
    if (padded) out += "=";
  }
  return out;
}

/**
 * Decode Base64 (standard or URL-safe) back to bytes — used to prove the
 * encoding round-trips.
 *
 * @param {string} input
 * @returns {Uint8Array | { error: string }}
 */
export function base64ToBytes(input) {
  const clean = String(input ?? "").replace(/[\s]/g, "").replace(/-/g, "+").replace(/_/g, "/").replace(/=+$/, "");
  if (clean.length === 0) return new Uint8Array(0);
  if (/[^A-Za-z0-9+/]/.test(clean)) {
    return { error: "That is not valid Base64 — it contains characters outside the Base64 alphabet." };
  }
  if (clean.length % 4 === 1) {
    return { error: "That Base64 string is truncated: its length cannot be one more than a multiple of 4." };
  }
  const out = new Uint8Array(Math.floor((clean.length * 3) / 4));
  let bits = 0;
  let acc = 0;
  let written = 0;
  for (const char of clean) {
    acc = (acc << 6) | BASE64_ALPHABET.indexOf(char);
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out[written] = (acc >> bits) & 0xff;
      written += 1;
    }
  }
  return out.subarray(0, written);
}

/**
 * Encoded length for a given byte count, without doing the encoding.
 * Padded: 4 x ceil(n / 3). Unpadded: ceil(4n / 3).
 */
export function base64Length(byteLength, { padded = true } = {}) {
  if (!Number.isFinite(byteLength) || byteLength < 0) {
    return { error: "The byte count must be zero or more." };
  }
  const n = Math.floor(byteLength);
  return padded
    ? OUTPUT_CHARS_PER_GROUP * Math.ceil(n / INPUT_BYTES_PER_GROUP)
    : Math.ceil((OUTPUT_CHARS_PER_GROUP * n) / INPUT_BYTES_PER_GROUP);
}

/** Wrap a long Base64 string into fixed-width lines (76 chars is the MIME default). */
export function wrapBase64(text, lineLength = MIME_LINE_LENGTH) {
  const value = String(text ?? "");
  if (!Number.isFinite(lineLength) || lineLength < 4) return value;
  const width = Math.floor(lineLength);
  const lines = [];
  for (let i = 0; i < value.length; i += width) lines.push(value.slice(i, i + width));
  return lines.join("\n");
}

/** Format a byte count with binary (1024-based) units. */
export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes === 0) return "0 B";
  const units = ["B", "KiB", "MiB", "GiB"];
  const index = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / 1024 ** index;
  return `${value.toFixed(index === 0 ? 0 : value < 10 ? 2 : 1)} ${units[index]}`;
}

/** Ready-to-paste snippets for the four places a data URL normally goes. */
export function buildSnippets(dataUrl, mime, fileName) {
  const url = String(dataUrl ?? "");
  const safeName = String(fileName ?? "file").replace(/"/g, "'");
  const kind = String(mime ?? "").split("/")[0];
  return {
    dataUrl: url,
    html:
      kind === "image"
        ? `<img src="${url}" alt="${safeName}" />`
        : `<a href="${url}" download="${safeName}">Download ${safeName}</a>`,
    css: kind === "image" ? `background-image: url("${url}");` : `/* ${mime} is not a CSS background */`,
    json: JSON.stringify({ name: safeName, type: mime, data: url }, null, 2),
    markdown: kind === "image" ? `![${safeName}](${url})` : `[${safeName}](${url})`,
  };
}

/**
 * Encode one file and report every derived figure.
 *
 * @param {{ name?: string, size?: number, type?: string, bytes: Uint8Array,
 *           urlSafe?: boolean, padded?: boolean, wrapLines?: boolean, includePrefix?: boolean }} input
 * @returns {object} encoding result, or { error }.
 */
export function encodeFile({
  name = "file",
  size,
  type = "",
  bytes,
  urlSafe = false,
  padded = true,
  wrapLines = false,
  includePrefix = true,
} = {}) {
  if (!isBytes(bytes)) return { error: "Choose a file — nothing has been read yet." };
  if (bytes.length === 0) return { error: "That file is empty (0 bytes), so there is nothing to encode." };
  const byteLength = Number.isFinite(size) && size >= 0 ? size : bytes.length;
  if (byteLength > MAX_FILE_BYTES) {
    return { error: `That file is larger than the ${formatBytes(MAX_FILE_BYTES)} this encoder handles in one pass.` };
  }

  const mime = resolveMimeType(name, type);
  const encoded = bytesToBase64(bytes, { urlSafe, padded });
  if (typeof encoded !== "string") return encoded;

  const payload = wrapLines ? wrapBase64(encoded) : encoded;
  const dataUrl = `data:${mime};base64,${encoded}`;
  const output = includePrefix ? `data:${mime};base64,${payload}` : payload;
  const encodedChars = encoded.length;
  const paddingChars = encoded.endsWith("==") ? 2 : encoded.endsWith("=") ? 1 : 0;

  return {
    fileName: String(name),
    mimeType: mime,
    sizeBytes: bytes.length,
    sizeLabel: formatBytes(bytes.length),
    base64: encoded,
    output,
    dataUrl,
    encodedChars,
    encodedBytes: encodedChars, // Base64 output is ASCII: 1 char = 1 byte
    encodedLabel: formatBytes(encodedChars),
    overheadPercent: Math.round(((encodedChars / bytes.length - 1) * 100 + Number.EPSILON) * 100) / 100,
    growthBytes: encodedChars - bytes.length,
    paddingChars,
    groups: Math.ceil(bytes.length / INPUT_BYTES_PER_GROUP),
    lines: wrapLines ? Math.ceil(encodedChars / MIME_LINE_LENGTH) : 1,
    dataUrlChars: dataUrl.length,
    urlSafe,
    padded,
    snippets: buildSnippets(dataUrl, mime, name),
  };
}

/** A tiny real PNG (1x1 teal pixel) so the tool shows a genuine result on load. */
export const SAMPLE_PNG_BYTES = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
  0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x10, 0xd9, 0xb1, 0x0c,
  0x00, 0x02, 0x56, 0x01, 0x73, 0xd7, 0x5a, 0xed, 0x82, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e,
  0x44, 0xae, 0x42, 0x60, 0x82,
]);

/** The built-in sample file record. */
export function sampleFile() {
  return {
    name: "teal-pixel.png",
    size: SAMPLE_PNG_BYTES.length,
    type: "image/png",
    bytes: SAMPLE_PNG_BYTES,
  };
}
