/**
 * Base64 to PDF — decode a Base64 payload and report what the PDF actually is.
 *
 * Pure JavaScript: no React, no DOM. Every function is deterministic.
 * All structural facts below come from ISO 32000-1 (PDF 1.7), which is the
 * public version of the Adobe PDF Reference.
 */

/** RFC 4648 §4: 4 Base64 characters carry 3 bytes. */
export const BASE64_CHARS_PER_GROUP = 4;
export const BASE64_BYTES_PER_GROUP = 3;

/**
 * ISO 32000-1 §7.5.2: every PDF file begins with `%PDF-` followed by a
 * version number, e.g. `%PDF-1.7`.
 */
export const PDF_HEADER = "%PDF-";

/** ISO 32000-1 §7.5.5: the last line of a conforming file is `%%EOF`. */
export const PDF_EOF_MARKER = "%%EOF";

/**
 * Only the last 2 KB is scanned for the trailer. The spec allows up to 1024
 * bytes of junk after %%EOF, so 2 KB is a comfortable margin.
 */
export const PDF_TRAILER_SCAN_BYTES = 2048;

/**
 * Practical ceiling for holding the file, its Base64 text and a blob preview
 * in browser memory at once. Larger files should be handled as a download.
 */
export const MAX_PREVIEW_BYTES = 40 * 1024 * 1024;

/** Versions defined by the specifications; anything else is flagged as odd. */
export const KNOWN_PDF_VERSIONS = ["1.0", "1.1", "1.2", "1.3", "1.4", "1.5", "1.6", "1.7", "2.0"];

/** `data:[<mime>][;base64],<payload>` — RFC 2397. */
export const DATA_URL_RE =
  /^data:([a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+)?((?:;[a-z0-9-]+=[^;,]*)*)(;base64)?,([\s\S]*)$/i;

const BASE64_ANY_RE = /^[A-Za-z0-9+/\-_]*={0,2}$/;

/** Split a data URL into its declared MIME type and its payload. */
export function splitDataUrl(raw) {
  const value = String(raw == null ? "" : raw).trim();
  const match = DATA_URL_RE.exec(value);
  if (!match) return { declaredMime: "", payload: value, wasDataUrl: false };
  return {
    declaredMime: (match[1] || "").toLowerCase(),
    payload: match[4] || "",
    wasDataUrl: true,
  };
}

/** Strip whitespace, fold the URL-safe alphabet to standard, restore padding. */
export function normalizeBase64(payload) {
  const compact = String(payload == null ? "" : payload).replace(/\s+/g, "");
  if (!compact) return { error: "Paste the Base64 PDF data first." };
  if (!BASE64_ANY_RE.test(compact)) {
    const bad = compact.split("").find((ch) => !/[A-Za-z0-9+/\-_=]/.test(ch));
    return { error: `That is not Base64 — the character "${bad}" is not in the alphabet.` };
  }
  const folded = compact.replace(/-/g, "+").replace(/_/g, "/").replace(/=+$/, "");
  const remainder = folded.length % BASE64_CHARS_PER_GROUP;
  if (remainder === 1) {
    return { error: "Base64 length is invalid — a group can never be a single character." };
  }
  const padding = remainder === 0 ? 0 : BASE64_CHARS_PER_GROUP - remainder;
  return { normalized: folded + "=".repeat(padding), urlSafe: /[-_]/.test(compact) };
}

/** 3 bytes per 4-character group, minus the padding characters. */
export function base64ByteLength(normalized) {
  const value = String(normalized || "");
  if (value.length === 0 || value.length % BASE64_CHARS_PER_GROUP !== 0) return 0;
  const padding = (value.match(/=+$/) || [""])[0].length;
  return (value.length / BASE64_CHARS_PER_GROUP) * BASE64_BYTES_PER_GROUP - padding;
}

/** Decode to raw bytes; returns `{ error }` instead of throwing. */
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

/** Latin-1 view of a byte range; PDF syntax tokens are all ASCII. */
export function bytesToLatin1(bytes, start = 0, end = bytes.length) {
  let out = "";
  const stop = Math.min(end, bytes.length);
  for (let i = Math.max(0, start); i < stop; i += 1) out += String.fromCharCode(bytes[i]);
  return out;
}

/** Read the version digits that follow `%PDF-` in the first line. */
export function readPdfVersion(bytes) {
  const head = bytesToLatin1(bytes, 0, 32);
  const match = /^%PDF-(\d\.\d)/.exec(head);
  return match ? match[1] : "";
}

/**
 * Count objects declared `/Type /Page`. Reliable for classic PDFs; PDFs that
 * store their page tree inside a compressed object stream (PDF 1.5+) hide
 * these tokens, which is why 0 is reported as "not visible" rather than "none".
 */
export function countPageObjects(text) {
  const matches = text.match(/\/Type\s*\/Page(?![sA-Za-z])/g);
  return matches ? matches.length : 0;
}

/** IEC-style byte formatting, matching what file managers show. */
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
 * Total function: Base64 in, a full PDF report out.
 * Always returns `{ error }` or a complete result object — never NaN.
 */
export function analyzeBase64Pdf(rawInput) {
  const { declaredMime, payload, wasDataUrl } = splitDataUrl(rawInput);
  const normalizedResult = normalizeBase64(payload);
  if (normalizedResult.error) return { error: normalizedResult.error };

  const { normalized, urlSafe } = normalizedResult;
  const byteLength = base64ByteLength(normalized);
  if (byteLength <= 0) {
    return { error: "The Base64 decodes to zero bytes — there is no PDF in there." };
  }
  if (byteLength > MAX_PREVIEW_BYTES) {
    return {
      error: `That decodes to ${formatBytes(byteLength)}, over the ${formatBytes(
        MAX_PREVIEW_BYTES,
      )} limit this tool can hold in memory.`,
    };
  }

  const decoded = decodeBase64ToBytes(normalized);
  if (decoded.error) return { error: decoded.error };
  const { bytes } = decoded;

  const version = readPdfVersion(bytes);
  if (!version) {
    const head = bytesToLatin1(bytes, 0, 8);
    return {
      error: `Those bytes do not start with "${PDF_HEADER}" — this is not a PDF (the file begins "${head.replace(
        /[^\x20-\x7e]/g,
        ".",
      )}").`,
    };
  }

  const text = bytesToLatin1(bytes);
  const tail = bytesToLatin1(bytes, Math.max(0, bytes.length - PDF_TRAILER_SCAN_BYTES));

  const pageObjects = countPageObjects(text);
  const encrypted = /\/Encrypt[\s/<]/.test(text);
  const linearized = /\/Linearized[\s/\d]/.test(bytesToLatin1(bytes, 0, 2048));
  const hasEof = tail.includes(PDF_EOF_MARKER);
  const hasXref = /\bstartxref\b/.test(tail);
  const usesObjectStreams = /\/ObjStm\b/.test(text);
  const hasAcroForm = /\/AcroForm[\s/<]/.test(text);
  const titleMatch = /\/Title\s*\(([^)\\]{0,200})\)/.exec(text);

  return {
    version,
    versionKnown: KNOWN_PDF_VERSIONS.includes(version),
    declaredMime,
    mimeMismatch: Boolean(declaredMime) && declaredMime !== "application/pdf",
    wasDataUrl,
    urlSafe,
    bytes: byteLength,
    sizeLabel: formatBytes(byteLength),
    base64Length: normalized.length,
    // Base64 expands a payload by exactly 4/3 before padding.
    overheadPercent: Math.round(((normalized.length - byteLength) / byteLength) * 100),
    pageObjects,
    pageCountVisible: pageObjects > 0,
    encrypted,
    linearized,
    hasEof,
    hasXref,
    usesObjectStreams,
    hasAcroForm,
    title: titleMatch ? titleMatch[1].trim() : "",
    truncated: !hasEof || !hasXref,
    base64: normalized,
    dataUrl: `data:application/pdf;base64,${normalized}`,
    fileName: "decoded-document.pdf",
  };
}
