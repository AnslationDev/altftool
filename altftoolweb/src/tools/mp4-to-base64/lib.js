/**
 * MP4 to Base64 — pure encoding and sizing logic.
 *
 * Base64 follows RFC 4648 section 4: the input is read three bytes at a time and written
 * as four characters from a 64-symbol alphabet, with "=" padding when the final group is
 * short. That is where the fixed 4/3 growth (about 33.3%) comes from.
 *
 * Data URLs follow RFC 2397: data:<mediatype>;base64,<data>
 */

/** RFC 4648 standard alphabet. */
export const BASE64_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/** Bytes consumed per Base64 group. */
export const BYTES_PER_GROUP = 3;

/** Characters produced per Base64 group. */
export const CHARS_PER_GROUP = 4;

/** Size growth factor of Base64, exactly 4/3 before the "data:" prefix. */
export const BASE64_GROWTH = CHARS_PER_GROUP / BYTES_PER_GROUP;

/** MIME types this tool accepts, with the container each one names. */
export const VIDEO_MIME_TYPES = [
  { mime: "video/mp4", label: "MP4 (H.264 / H.265 in an ISO BMFF container)", extensions: [".mp4", ".m4v"] },
  { mime: "video/webm", label: "WebM (VP8 / VP9 / AV1)", extensions: [".webm"] },
  { mime: "video/quicktime", label: "QuickTime MOV", extensions: [".mov"] },
  { mime: "video/ogg", label: "Ogg video (Theora)", extensions: [".ogv"] },
];

/** Fallback MIME when the browser reports nothing for the file. */
export const DEFAULT_MIME = "video/mp4";

/**
 * Practical ceiling for in-browser conversion: 25 MiB in, which becomes a ~34 MB string.
 * The whole Base64 string and the original bytes both sit in memory at once, and a JavaScript
 * string is capped near 512 MiB in V8, so a bigger file risks an out-of-memory tab.
 */
export const MAX_FILE_BYTES = 25 * 1024 * 1024;

/** Chunk used when building the output string, to avoid a huge argument list. */
const CHUNK_BYTES = 3 * 1024;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Number of Base64 characters produced for a given byte count, padding included.
 * @param {number} byteLength
 * @returns {number} 0 for invalid or empty input, never NaN.
 */
export function base64EncodedLength(byteLength) {
  if (!isNum(byteLength) || byteLength <= 0) return 0;
  return Math.ceil(byteLength / BYTES_PER_GROUP) * CHARS_PER_GROUP;
}

/** Number of "=" padding characters at the end of the encoding. */
export function base64PaddingChars(byteLength) {
  if (!isNum(byteLength) || byteLength <= 0) return 0;
  const remainder = byteLength % BYTES_PER_GROUP;
  if (remainder === 0) return 0;
  return BYTES_PER_GROUP - remainder;
}

/** Builds the RFC 2397 data URL prefix for a MIME type. */
export function dataUrlPrefix(mime) {
  const type = typeof mime === "string" && mime.trim() !== "" ? mime.trim() : DEFAULT_MIME;
  return `data:${type};base64,`;
}

/**
 * Encodes bytes to a Base64 string. Pure: same bytes in, same string out.
 * @param {Uint8Array|number[]} bytes
 * @returns {string}
 */
export function bytesToBase64(bytes) {
  if (!bytes || typeof bytes.length !== "number") return "";
  const length = bytes.length;
  if (length === 0) return "";

  const parts = [];
  let chunk = "";

  for (let i = 0; i < length; i += BYTES_PER_GROUP) {
    const b0 = bytes[i] & 0xff;
    const b1 = i + 1 < length ? bytes[i + 1] & 0xff : 0;
    const b2 = i + 2 < length ? bytes[i + 2] & 0xff : 0;

    chunk += BASE64_ALPHABET[b0 >> 2];
    chunk += BASE64_ALPHABET[((b0 & 0x03) << 4) | (b1 >> 4)];
    chunk += i + 1 < length ? BASE64_ALPHABET[((b1 & 0x0f) << 2) | (b2 >> 6)] : "=";
    chunk += i + 2 < length ? BASE64_ALPHABET[b2 & 0x3f] : "=";

    if (chunk.length >= CHUNK_BYTES) {
      parts.push(chunk);
      chunk = "";
    }
  }

  if (chunk !== "") parts.push(chunk);
  return parts.join("");
}

/** Splits a data URL into its MIME type and payload; returns { error } for anything else. */
export function parseDataUrl(dataUrl) {
  if (typeof dataUrl !== "string" || dataUrl.trim() === "") {
    return { error: "Nothing to read — paste a data URL first." };
  }
  const match = /^data:([^;,]*)(;base64)?,([\s\S]*)$/.exec(dataUrl.trim());
  if (!match) return { error: "That is not a valid data: URL." };
  if (!match[2]) return { error: "This data URL is not Base64 encoded." };
  return { mime: match[1] || DEFAULT_MIME, base64: match[3] };
}

/** Formats a byte count with binary prefixes, e.g. "12.4 MiB". */
export function formatBytes(bytes) {
  if (!isNum(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  const units = ["KiB", "MiB", "GiB", "TiB"];
  let value = bytes / 1024;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(value >= 100 ? 0 : 1)} ${units[index]}`;
}

/**
 * Checks a selected file and predicts the output size before any encoding runs.
 *
 * @param {object} file
 * @param {string} [file.name]
 * @param {number} file.size  Size in bytes.
 * @param {string} [file.type] MIME type reported by the browser.
 * @returns {object} report, or { error } when the file cannot be converted.
 */
export function inspectVideoFile({ name = "", size, type = "" } = {}) {
  if (!isNum(size) || size < 0) {
    return { error: "Could not read the file size. Try selecting the file again." };
  }
  if (size === 0) {
    return { error: "That file is empty — there is nothing to encode." };
  }
  if (size > MAX_FILE_BYTES) {
    return {
      error: `Files are limited to ${formatBytes(MAX_FILE_BYTES)} because the Base64 text is a third larger again and must fit in memory.`,
    };
  }

  const lower = String(name).toLowerCase();
  const known = VIDEO_MIME_TYPES.find(
    (entry) => entry.mime === type || entry.extensions.some((ext) => lower.endsWith(ext)),
  );
  const mime = type || (known ? known.mime : DEFAULT_MIME);

  const base64Length = base64EncodedLength(size);
  const prefix = dataUrlPrefix(mime);

  return {
    name: String(name),
    size,
    mime,
    recognised: Boolean(known),
    containerLabel: known ? known.label : "Unrecognised container — encoded as-is",
    base64Length,
    dataUrlLength: prefix.length + base64Length,
    paddingChars: base64PaddingChars(size),
    growthPercent: (BASE64_GROWTH - 1) * 100,
    prefix,
  };
}
