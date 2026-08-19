/**
 * PDF to Base64 — pure encoding, sizing and PDF header logic.
 *
 * Base64 follows RFC 4648 section 4: three bytes in, four characters out, "=" padded,
 * which is where the fixed 4/3 (about 33.3%) growth comes from.
 * Data URLs follow RFC 2397: data:<mediatype>;base64,<data>
 * The PDF header and trailer markers come from ISO 32000-1 (PDF 1.7) section 7.5.
 */

/** RFC 4648 standard alphabet. */
export const BASE64_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

export const BYTES_PER_GROUP = 3;
export const CHARS_PER_GROUP = 4;

/** Exact size growth of Base64 before the data: prefix is added. */
export const BASE64_GROWTH = CHARS_PER_GROUP / BYTES_PER_GROUP;

/** The only MIME type registered for PDF (RFC 8118). */
export const PDF_MIME = "application/pdf";

/** Every PDF file begins with these five bytes, per ISO 32000-1 section 7.5.2. */
export const PDF_MAGIC = "%PDF-";

/** And ends with this marker, per ISO 32000-1 section 7.5.5. */
export const PDF_EOF_MARKER = "%%EOF";

/**
 * Practical ceiling: 25 MiB in, which becomes a ~34 MB string. Both the raw bytes and the
 * Base64 text sit in memory at once and a JavaScript string is capped near 512 MiB in V8.
 */
export const MAX_FILE_BYTES = 25 * 1024 * 1024;

/** How far into the tail to look for the end-of-file marker. */
export const EOF_SEARCH_BYTES = 2048;

const CHUNK_CHARS = 3 * 1024;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Base64 character count for a byte count, padding included. Never NaN. */
export function base64EncodedLength(byteLength) {
  if (!isNum(byteLength) || byteLength <= 0) return 0;
  return Math.ceil(byteLength / BYTES_PER_GROUP) * CHARS_PER_GROUP;
}

/** Number of "=" characters appended by the encoder. */
export function base64PaddingChars(byteLength) {
  if (!isNum(byteLength) || byteLength <= 0) return 0;
  const remainder = byteLength % BYTES_PER_GROUP;
  return remainder === 0 ? 0 : BYTES_PER_GROUP - remainder;
}

/** RFC 2397 prefix for a MIME type. */
export function dataUrlPrefix(mime = PDF_MIME) {
  const type = typeof mime === "string" && mime.trim() !== "" ? mime.trim() : PDF_MIME;
  return `data:${type};base64,`;
}

/**
 * Encodes bytes to Base64. Pure: same bytes in, same string out.
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

    if (chunk.length >= CHUNK_CHARS) {
      parts.push(chunk);
      chunk = "";
    }
  }

  if (chunk !== "") parts.push(chunk);
  return parts.join("");
}

/** Reads a run of bytes as Latin-1 text, used only for the short header and trailer. */
function bytesToLatin1(bytes, start, end) {
  let text = "";
  const stop = Math.min(end, bytes.length);
  for (let i = Math.max(0, start); i < stop; i += 1) {
    text += String.fromCharCode(bytes[i] & 0xff);
  }
  return text;
}

/**
 * Reads the PDF header and trailer to confirm the file really is a PDF.
 *
 * @param {Uint8Array|number[]} bytes
 * @returns {{isPdf:boolean, version:string|null, hasEofMarker:boolean, linearHint:boolean}}
 */
export function inspectPdfBytes(bytes) {
  const empty = { isPdf: false, version: null, hasEofMarker: false, linearHint: false };
  if (!bytes || typeof bytes.length !== "number" || bytes.length < PDF_MAGIC.length) return empty;

  // Per ISO 32000-1 section 7.5.2, the %PDF- marker may appear anywhere within the
  // first 1024 bytes (e.g. after a scanner/uploader preamble), not only at offset 0.
  const head = bytesToLatin1(bytes, 0, 1024);
  const magicIndex = head.indexOf(PDF_MAGIC);
  if (magicIndex === -1) return empty;

  const versionMatch = /^%PDF-(\d\.\d)/.exec(head.slice(magicIndex));
  const version = versionMatch ? versionMatch[1] : null;
  const tail = bytesToLatin1(bytes, bytes.length - EOF_SEARCH_BYTES, bytes.length);

  return {
    isPdf: true,
    version,
    hasEofMarker: tail.includes(PDF_EOF_MARKER),
    // A linearised ("fast web view") PDF declares /Linearized in its first object.
    linearHint: head.includes("/Linearized"),
  };
}

/** Formats a byte count with binary prefixes, e.g. "2.4 MiB". */
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
 * @param {number} file.size
 * @returns {object} report, or { error }.
 */
export function inspectPdfFile({ name = "", size } = {}) {
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

  const base64Length = base64EncodedLength(size);
  const prefix = dataUrlPrefix(PDF_MIME);

  return {
    name: String(name),
    size,
    mime: PDF_MIME,
    base64Length,
    dataUrlLength: prefix.length + base64Length,
    paddingChars: base64PaddingChars(size),
    // Actual per-file growth, not the asymptotic 4/3 ratio — padding makes small files
    // grow by more than 33.3% (e.g. a 10-byte file grows 60%).
    growthPercent: (base64Length / size - 1) * 100,
    prefix,
  };
}
