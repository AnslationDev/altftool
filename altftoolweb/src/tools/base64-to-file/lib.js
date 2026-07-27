/**
 * Base64 to File — decode a Base64 payload, identify the file type from its
 * magic bytes and describe what will be saved.
 *
 * Pure JavaScript: no React, no DOM, no clock reads.
 * Rules implemented:
 *   - Base64 alphabet and padding: RFC 4648 §4 (standard) / §5 (URL-safe).
 *   - data: URL grammar: RFC 2397 §3.
 *   - File signatures ("magic numbers") as published by each format spec —
 *     PNG §5.2, JFIF/JPEG SOI marker, PDF §7.5.2, ZIP local file header, etc.
 *   - Shannon entropy H = −Σ p·log2(p) over the 256 byte values, in bits/byte.
 */

/** Standard Base64 alphabet — RFC 4648 §4, table 1. */
export const BASE64_STANDARD_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/** 3 bytes ↔ 4 characters — RFC 4648 §4. */
export const BASE64_BYTES_PER_GROUP = 3;
export const BASE64_CHARS_PER_GROUP = 4;

/** ~12 M characters ≈ 9 MB decoded: the practical ceiling for a browser tab. */
export const MAX_BASE64_INPUT_CHARS = 12_000_000;

/** Maximum entropy of a byte stream: log2(256) = 8 bits per byte. */
export const MAX_ENTROPY_BITS = 8;

/** Above this, the payload is already compressed or encrypted (rule of thumb). */
export const HIGH_ENTROPY_THRESHOLD = 7.5;

/** A real 187-byte 8×8 PNG, used as the demo input. */
export const SAMPLE_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAgklEQVR42gXBoRUAIAhAQYZgCIZwCIdwCKPRQDASSf8ZjYznnWhhRSt6MYpZeJGF6MMe7dEf4zEf/siH6MUu7dIv4zIvfsmLaGJJS3oykpl4koloYEELejCCGXiQgejBDu3QD+MwD37Ig+jGNm3TN2MzN77JjejCFm3RF2MxF77IxQfj4GcBA+xwcgAAAABJRU5ErkJggg==";

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
  if (!raw) return { error: "Paste a Base64 string or a data URL first." };
  if (raw.length > MAX_BASE64_INPUT_CHARS) {
    return {
      error: `That is ${raw.length.toLocaleString("en-US")} characters. This tool decodes up to ${MAX_BASE64_INPUT_CHARS.toLocaleString("en-US")} in the browser.`,
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

/** Re-encode bytes as canonical padded standard Base64 — RFC 4648 §4. */
export function encodeBytesToBase64(bytes) {
  let out = "";
  for (let i = 0; i < bytes.length; i += BASE64_BYTES_PER_GROUP) {
    const b0 = bytes[i];
    const b1 = bytes[i + 1];
    const b2 = bytes[i + 2];
    out += BASE64_STANDARD_ALPHABET[b0 >> 2];
    out += BASE64_STANDARD_ALPHABET[((b0 & 0x03) << 4) | ((b1 ?? 0) >> 4)];
    out += i + 1 < bytes.length ? BASE64_STANDARD_ALPHABET[((b1 & 0x0f) << 2) | ((b2 ?? 0) >> 6)] : "=";
    out += i + 2 < bytes.length ? BASE64_STANDARD_ALPHABET[b2 & 0x3f] : "=";
  }
  return out;
}

/** Build a canonical `data:<mime>;base64,<payload>` URL — RFC 2397 §3. */
export function buildDataUrl(bytes, mimeType) {
  if (!bytes || bytes.length === 0) return "";
  return `data:${mimeType || "application/octet-stream"};base64,${encodeBytesToBase64(bytes)}`;
}

function ascii(bytes, offset, length) {
  let out = "";
  for (let i = offset; i < offset + length; i += 1) {
    if (i >= bytes.length) return out;
    out += String.fromCharCode(bytes[i]);
  }
  return out;
}

const hex = (bytes, offset, length) => {
  let out = "";
  for (let i = offset; i < offset + length && i < bytes.length; i += 1) {
    out += bytes[i].toString(16).padStart(2, "0").toUpperCase();
    if (i < offset + length - 1) out += " ";
  }
  return out;
};

/**
 * Magic-number table. `magic` is a byte array; null means "any byte".
 * Order matters — the first match wins, so container checks that need a
 * second marker (RIFF/WEBP, RIFF/WAVE) come before the generic RIFF entry.
 */
export const FILE_SIGNATURES = [
  { label: "PNG image", mime: "image/png", extension: "png", offset: 0, magic: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { label: "JPEG image", mime: "image/jpeg", extension: "jpg", offset: 0, magic: [0xff, 0xd8, 0xff] },
  { label: "GIF image", mime: "image/gif", extension: "gif", offset: 0, magic: [0x47, 0x49, 0x46, 0x38] },
  { label: "WebP image", mime: "image/webp", extension: "webp", offset: 0, magic: [0x52, 0x49, 0x46, 0x46], second: { offset: 8, text: "WEBP" } },
  { label: "WAV audio", mime: "audio/wav", extension: "wav", offset: 0, magic: [0x52, 0x49, 0x46, 0x46], second: { offset: 8, text: "WAVE" } },
  { label: "AVI video", mime: "video/x-msvideo", extension: "avi", offset: 0, magic: [0x52, 0x49, 0x46, 0x46], second: { offset: 8, text: "AVI " } },
  { label: "BMP image", mime: "image/bmp", extension: "bmp", offset: 0, magic: [0x42, 0x4d] },
  { label: "TIFF image", mime: "image/tiff", extension: "tif", offset: 0, magic: [0x49, 0x49, 0x2a, 0x00] },
  { label: "TIFF image (big-endian)", mime: "image/tiff", extension: "tif", offset: 0, magic: [0x4d, 0x4d, 0x00, 0x2a] },
  { label: "Windows icon", mime: "image/x-icon", extension: "ico", offset: 0, magic: [0x00, 0x00, 0x01, 0x00] },
  { label: "PDF document", mime: "application/pdf", extension: "pdf", offset: 0, magic: [0x25, 0x50, 0x44, 0x46, 0x2d] },
  { label: "ZIP archive (also .docx/.xlsx/.pptx/.odt/.jar/.epub)", mime: "application/zip", extension: "zip", offset: 0, magic: [0x50, 0x4b, 0x03, 0x04] },
  { label: "Empty ZIP archive", mime: "application/zip", extension: "zip", offset: 0, magic: [0x50, 0x4b, 0x05, 0x06] },
  { label: "GZIP archive", mime: "application/gzip", extension: "gz", offset: 0, magic: [0x1f, 0x8b] },
  { label: "BZIP2 archive", mime: "application/x-bzip2", extension: "bz2", offset: 0, magic: [0x42, 0x5a, 0x68] },
  { label: "7-Zip archive", mime: "application/x-7z-compressed", extension: "7z", offset: 0, magic: [0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c] },
  { label: "RAR archive", mime: "application/vnd.rar", extension: "rar", offset: 0, magic: [0x52, 0x61, 0x72, 0x21, 0x1a, 0x07] },
  { label: "TAR archive", mime: "application/x-tar", extension: "tar", offset: 257, magic: [0x75, 0x73, 0x74, 0x61, 0x72] },
  { label: "MP3 audio (ID3 tag)", mime: "audio/mpeg", extension: "mp3", offset: 0, magic: [0x49, 0x44, 0x33] },
  { label: "FLAC audio", mime: "audio/flac", extension: "flac", offset: 0, magic: [0x66, 0x4c, 0x61, 0x43] },
  { label: "Ogg media", mime: "audio/ogg", extension: "ogg", offset: 0, magic: [0x4f, 0x67, 0x67, 0x53] },
  { label: "MP4 / ISO base media", mime: "video/mp4", extension: "mp4", offset: 4, magic: [0x66, 0x74, 0x79, 0x70] },
  { label: "Matroska / WebM video", mime: "video/webm", extension: "webm", offset: 0, magic: [0x1a, 0x45, 0xdf, 0xa3] },
  { label: "MIDI sequence", mime: "audio/midi", extension: "mid", offset: 0, magic: [0x4d, 0x54, 0x68, 0x64] },
  { label: "WOFF web font", mime: "font/woff", extension: "woff", offset: 0, magic: [0x77, 0x4f, 0x46, 0x46] },
  { label: "WOFF2 web font", mime: "font/woff2", extension: "woff2", offset: 0, magic: [0x77, 0x4f, 0x46, 0x32] },
  { label: "OpenType font", mime: "font/otf", extension: "otf", offset: 0, magic: [0x4f, 0x54, 0x54, 0x4f] },
  { label: "TrueType font", mime: "font/ttf", extension: "ttf", offset: 0, magic: [0x00, 0x01, 0x00, 0x00, 0x00] },
  { label: "SQLite database", mime: "application/vnd.sqlite3", extension: "sqlite", offset: 0, magic: [0x53, 0x51, 0x4c, 0x69, 0x74, 0x65, 0x20, 0x66] },
  { label: "ELF executable", mime: "application/x-elf", extension: "elf", offset: 0, magic: [0x7f, 0x45, 0x4c, 0x46] },
  { label: "Windows executable", mime: "application/vnd.microsoft.portable-executable", extension: "exe", offset: 0, magic: [0x4d, 0x5a] },
  { label: "Java class file", mime: "application/java-vm", extension: "class", offset: 0, magic: [0xca, 0xfe, 0xba, 0xbe] },
  { label: "RTF document", mime: "application/rtf", extension: "rtf", offset: 0, magic: [0x7b, 0x5c, 0x72, 0x74, 0x66] },
  { label: "PostScript", mime: "application/postscript", extension: "ps", offset: 0, magic: [0x25, 0x21, 0x50, 0x53] },
];

function matches(bytes, signature) {
  const { offset, magic, second } = signature;
  if (bytes.length < offset + magic.length) return false;
  for (let i = 0; i < magic.length; i += 1) {
    if (magic[i] !== null && bytes[offset + i] !== magic[i]) return false;
  }
  if (second && ascii(bytes, second.offset, second.text.length) !== second.text) return false;
  return true;
}

/** Identify a file from its magic bytes. Returns null when nothing matches. */
export function detectFileType(bytes) {
  if (!bytes || bytes.length === 0) return null;
  for (const signature of FILE_SIGNATURES) {
    if (matches(bytes, signature)) return signature;
  }
  return null;
}

/** Byte-order marks that make a text file's encoding explicit — Unicode Annex #x. */
const BOMS = [
  { label: "UTF-8 BOM", bytes: [0xef, 0xbb, 0xbf] },
  { label: "UTF-16 LE BOM", bytes: [0xff, 0xfe] },
  { label: "UTF-16 BE BOM", bytes: [0xfe, 0xff] },
];

export function detectBom(bytes) {
  for (const bom of BOMS) {
    if (matches(bytes, { offset: 0, magic: bom.bytes })) return bom.label;
  }
  return "";
}

/**
 * Treat the payload as text when the first 4 KB is well-formed UTF-8
 * (RFC 3629 §4: no over-long forms, no surrogate range, max U+10FFFF) and the
 * only control characters present are tab, newline and carriage return.
 */
export function looksLikeText(bytes) {
  const limit = Math.min(bytes.length, 4096);
  let i = 0;
  while (i < limit) {
    const b = bytes[i];
    if (b < 0x80) {
      if (b < 0x20 && b !== 0x09 && b !== 0x0a && b !== 0x0d) return false;
      if (b === 0x7f) return false;
      i += 1;
      continue;
    }
    let extra = 0;
    let min = 0;
    let code = 0;
    if (b >= 0xc2 && b <= 0xdf) {
      extra = 1;
      min = 0x80;
      code = b & 0x1f;
    } else if (b >= 0xe0 && b <= 0xef) {
      extra = 2;
      min = 0x800;
      code = b & 0x0f;
    } else if (b >= 0xf0 && b <= 0xf4) {
      extra = 3;
      min = 0x10000;
      code = b & 0x07;
    } else {
      return false; // 0x80–0xC1 and 0xF5–0xFF never start a UTF-8 sequence
    }
    if (i + extra >= bytes.length) return false; // sequence is cut off at EOF
    if (i + extra >= limit) return true; // ran past the 4 KB scan window
    for (let k = 1; k <= extra; k += 1) {
      const c = bytes[i + k];
      if ((c & 0xc0) !== 0x80) return false;
      code = (code << 6) | (c & 0x3f);
    }
    if (code < min || code > 0x10ffff) return false;
    if (code >= 0xd800 && code <= 0xdfff) return false; // UTF-16 surrogates
    i += extra + 1;
  }
  return true;
}

/** Decode well-formed UTF-8 bytes into a string (used for the text preview). */
export function decodeUtf8(bytes, limit = bytes.length) {
  const end = Math.min(bytes.length, limit);
  let out = "";
  let i = 0;
  while (i < end) {
    const b = bytes[i];
    if (b < 0x80) {
      out += String.fromCharCode(b);
      i += 1;
    } else if (b >= 0xc2 && b <= 0xdf && i + 1 < end) {
      out += String.fromCodePoint(((b & 0x1f) << 6) | (bytes[i + 1] & 0x3f));
      i += 2;
    } else if (b >= 0xe0 && b <= 0xef && i + 2 < end) {
      out += String.fromCodePoint(((b & 0x0f) << 12) | ((bytes[i + 1] & 0x3f) << 6) | (bytes[i + 2] & 0x3f));
      i += 3;
    } else if (b >= 0xf0 && b <= 0xf4 && i + 3 < end) {
      out += String.fromCodePoint(
        ((b & 0x07) << 18) | ((bytes[i + 1] & 0x3f) << 12) | ((bytes[i + 2] & 0x3f) << 6) | (bytes[i + 3] & 0x3f),
      );
      i += 4;
    } else {
      break; // truncated sequence at the preview boundary
    }
  }
  return out;
}

/** Shannon entropy in bits per byte: H = −Σ p·log2(p). Range 0…8. */
export function shannonEntropy(bytes) {
  if (!bytes || bytes.length === 0) return 0;
  const counts = new Uint32Array(256);
  for (let i = 0; i < bytes.length; i += 1) counts[bytes[i]] += 1;
  let entropy = 0;
  for (let i = 0; i < 256; i += 1) {
    if (!counts[i]) continue;
    const p = counts[i] / bytes.length;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

const KIB = 1024;

export function formatBytes(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return "—";
  if (n < KIB) return `${n} B`;
  if (n < KIB * KIB) return `${(n / KIB).toFixed(1)} KB`;
  return `${(n / (KIB * KIB)).toFixed(2)} MB`;
}

export function safeFilenameStem(value, fallback = "download") {
  const stem = String(value == null ? "" : value)
    .trim()
    .replace(/\.[a-z0-9]{1,6}$/i, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return stem || fallback;
}

/**
 * Main entry point. Returns { error } for undecodable input, otherwise a full
 * description of the file the browser is about to save.
 */
export function analyzeBase64File(input, options = {}) {
  const stem = safeFilenameStem(options.filename, "download");
  const text = String(input == null ? "" : input).trim();
  if (!text) return { error: "Paste a Base64 string or a data URL to decode." };

  const dataUrl = parseDataUrl(text);
  if (dataUrl && !dataUrl.isBase64) {
    return { error: "That data: URL is percent-encoded, not Base64. Add `;base64` or paste the Base64 payload." };
  }

  const decoded = decodeBase64ToBytes(dataUrl ? dataUrl.payload : text);
  if (decoded.error) return { error: decoded.error };
  if (decoded.byteLength === 0) return { error: "That Base64 string decodes to zero bytes — there is no file in it." };

  const signature = detectFileType(decoded.bytes);
  const bom = detectBom(decoded.bytes);
  const textual = !signature && looksLikeText(decoded.bytes);
  const declared = dataUrl && dataUrl.mediaType ? dataUrl.mediaType : "";

  const label = signature
    ? signature.label
    : textual
      ? "Plain text (no binary signature)"
      : "Unrecognised binary data";
  const mime = signature ? signature.mime : textual ? "text/plain" : declared || "application/octet-stream";
  const extension = signature ? signature.extension : textual ? "txt" : "bin";

  const entropy = shannonEntropy(decoded.bytes);
  const warnings = [];
  if (declared && signature && declared !== signature.mime) {
    warnings.push(`The data: URL says ${declared} but the bytes are ${signature.label} (${signature.mime}).`);
  }
  if (!signature && !textual) {
    warnings.push("No known magic number matched, so the extension falls back to .bin.");
  }
  if (decoded.unpadded) warnings.push("The string had no `=` padding; it was decoded as URL-safe Base64.");
  if (entropy >= HIGH_ENTROPY_THRESHOLD) {
    warnings.push(`Entropy is ${entropy.toFixed(2)} bits/byte — the payload is already compressed or encrypted, so zipping it again will not help.`);
  }

  return {
    bytes: decoded.bytes,
    byteLength: decoded.byteLength,
    base64Chars: decoded.base64Chars,
    overheadPercent: (decoded.base64Chars / decoded.byteLength - 1) * 100,
    label,
    mimeType: mime,
    extension,
    declaredMediaType: declared,
    fromDataUrl: Boolean(dataUrl),
    filename: `${stem}.${extension}`,
    headerHex: hex(decoded.bytes, 0, Math.min(8, decoded.byteLength)),
    bom,
    isText: textual,
    textPreview: textual ? decodeUtf8(decoded.bytes, 240) : "",
    entropyBitsPerByte: entropy,
    warnings,
  };
}
