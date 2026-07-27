/**
 * Base64 to Image — decoding, container sniffing and dimension parsing.
 *
 * Pure JavaScript: no React, no DOM. Everything here is deterministic —
 * the same Base64 string always produces the same report.
 */

/** RFC 4648 §4: Base64 encodes 3 bytes into 4 characters. */
export const BASE64_CHARS_PER_GROUP = 4;
export const BASE64_BYTES_PER_GROUP = 3;

/**
 * Practical ceiling for previewing a decoded image as a `data:` URL.
 * Chrome caps navigations to data URLs well above this, but a base64 string
 * is ~1.37x the byte size and holding both the string and the decoded bitmap
 * in memory on a phone gets unpleasant past ~25 MB.
 */
export const MAX_PREVIEW_BYTES = 25 * 1024 * 1024;

/** Anything shorter than one full quantum cannot encode a real file. */
export const MIN_BASE64_LENGTH = 4;

/** `data:[<mime>][;charset=..][;base64],<payload>` — RFC 2397. */
export const DATA_URL_RE =
  /^data:([a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+)?((?:;[a-z0-9-]+=[^;,]*)*)(;base64)?,([\s\S]*)$/i;

/** Standard alphabet plus the URL-safe pair from RFC 4648 §5, and padding. */
const BASE64_ANY_RE = /^[A-Za-z0-9+/\-_]*={0,2}$/;

/**
 * Magic-number signatures, each taken from the format's own specification.
 * `offset` is where the byte sequence must start.
 */
export const IMAGE_SIGNATURES = [
  // PNG spec, §5.2 — fixed 8-byte file signature.
  { mime: "image/png", label: "PNG", ext: "png", offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  // JFIF/JPEG — SOI marker FFD8 followed by any marker FFxx.
  { mime: "image/jpeg", label: "JPEG", ext: "jpg", offset: 0, bytes: [0xff, 0xd8, 0xff] },
  // GIF89a / GIF87a header, GIF spec §17.
  { mime: "image/gif", label: "GIF", ext: "gif", offset: 0, ascii: "GIF89a" },
  { mime: "image/gif", label: "GIF", ext: "gif", offset: 0, ascii: "GIF87a" },
  // RIFF container with a WEBP form type at offset 8.
  { mime: "image/webp", label: "WebP", ext: "webp", offset: 8, ascii: "WEBP", also: { offset: 0, ascii: "RIFF" } },
  // BMP file header starts with "BM".
  { mime: "image/bmp", label: "BMP", ext: "bmp", offset: 0, ascii: "BM" },
  // ICO: reserved 0x0000, then image type 1.
  { mime: "image/x-icon", label: "ICO", ext: "ico", offset: 0, bytes: [0x00, 0x00, 0x01, 0x00] },
  // ISO-BMFF `ftyp` box; AVIF and HEIC differ only by brand.
  { mime: "image/avif", label: "AVIF", ext: "avif", offset: 4, ascii: "ftypavif" },
  { mime: "image/heic", label: "HEIC", ext: "heic", offset: 4, ascii: "ftypheic" },
  { mime: "image/heic", label: "HEIC", ext: "heic", offset: 4, ascii: "ftypmif1" },
  // TIFF, little- and big-endian byte orders.
  { mime: "image/tiff", label: "TIFF", ext: "tiff", offset: 0, bytes: [0x49, 0x49, 0x2a, 0x00] },
  { mime: "image/tiff", label: "TIFF", ext: "tiff", offset: 0, bytes: [0x4d, 0x4d, 0x00, 0x2a] },
];

/** Strip a `data:` prefix and remember the MIME type it claimed. */
export function splitDataUrl(raw) {
  const value = String(raw == null ? "" : raw).trim();
  const match = DATA_URL_RE.exec(value);
  if (!match) return { declaredMime: "", payload: value, wasDataUrl: false, declaredBase64: false };
  return {
    declaredMime: (match[1] || "").toLowerCase(),
    payload: match[4] || "",
    wasDataUrl: true,
    declaredBase64: Boolean(match[3]),
  };
}

/**
 * Remove whitespace (MIME base64 wraps at 76 chars), fold the URL-safe
 * alphabet back to standard, and restore missing `=` padding.
 */
export function normalizeBase64(payload) {
  const compact = String(payload == null ? "" : payload).replace(/\s+/g, "");
  if (!compact) return { error: "Paste some Base64 data first." };
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
  const normalized = folded + "=".repeat(padding);
  if (normalized.length < MIN_BASE64_LENGTH) {
    return { error: "That is too short to be an image — you need at least 4 Base64 characters." };
  }
  return { normalized, urlSafe: /[-_]/.test(compact), addedPadding: padding };
}

/** Exact decoded size: 3 bytes per 4-character group, minus the padding. */
export function base64ByteLength(normalized) {
  const value = String(normalized || "");
  if (value.length === 0 || value.length % BASE64_CHARS_PER_GROUP !== 0) return 0;
  const padding = (value.match(/=+$/) || [""])[0].length;
  return (value.length / BASE64_CHARS_PER_GROUP) * BASE64_BYTES_PER_GROUP - padding;
}

/** Decode to raw bytes. Returns `{ error }` rather than throwing. */
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

function asciiAt(bytes, offset, text) {
  if (offset + text.length > bytes.length) return false;
  for (let i = 0; i < text.length; i += 1) {
    if (bytes[offset + i] !== text.charCodeAt(i)) return false;
  }
  return true;
}

function bytesAt(bytes, offset, expected) {
  if (offset + expected.length > bytes.length) return false;
  for (let i = 0; i < expected.length; i += 1) {
    if (bytes[offset + i] !== expected[i]) return false;
  }
  return true;
}

const u16be = (b, i) => (b[i] << 8) | b[i + 1];
const u16le = (b, i) => b[i] | (b[i + 1] << 8);
const u24le = (b, i) => b[i] | (b[i + 1] << 8) | (b[i + 2] << 16);
const u32be = (b, i) => ((b[i] << 24) >>> 0) + (b[i + 1] << 16) + (b[i + 2] << 8) + b[i + 3];
const i32le = (b, i) => (b[i] | (b[i + 1] << 8) | (b[i + 2] << 16) | (b[i + 3] << 24)) | 0;

/** Match the decoded bytes against the signature table. */
export function detectImageType(bytes) {
  if (!bytes || bytes.length === 0) return null;
  for (const sig of IMAGE_SIGNATURES) {
    const head = sig.ascii ? asciiAt(bytes, sig.offset, sig.ascii) : bytesAt(bytes, sig.offset, sig.bytes);
    if (!head) continue;
    if (sig.also && !asciiAt(bytes, sig.also.offset, sig.also.ascii)) continue;
    return { mime: sig.mime, label: sig.label, ext: sig.ext };
  }
  // SVG is text, so it has no magic number — look for a root element instead.
  const head = String.fromCharCode(...bytes.slice(0, 300)).trim();
  if (/^<(\?xml[\s\S]*?\?>\s*)?(<!--[\s\S]*?-->\s*)*(!doctype\s+svg|svg[\s>])/i.test(head)) {
    return { mime: "image/svg+xml", label: "SVG", ext: "svg" };
  }
  return null;
}

/**
 * Read intrinsic pixel dimensions straight out of the header of each format.
 * Returns null when the format carries no readable size (or is truncated).
 */
export function readImageDimensions(bytes, mime) {
  if (!bytes) return null;
  try {
    if (mime === "image/png") {
      // PNG spec §11.2.2: IHDR is the first chunk; width/height are
      // big-endian uint32 at byte 16 and 20.
      if (bytes.length < 24 || !asciiAt(bytes, 12, "IHDR")) return null;
      return { width: u32be(bytes, 16), height: u32be(bytes, 20) };
    }
    if (mime === "image/gif") {
      // GIF89a Logical Screen Descriptor: little-endian uint16 at byte 6/8.
      if (bytes.length < 10) return null;
      return { width: u16le(bytes, 6), height: u16le(bytes, 8) };
    }
    if (mime === "image/bmp") {
      if (bytes.length < 26) return null;
      const headerSize = i32le(bytes, 14);
      // BITMAPCOREHEADER is 12 bytes and stores 16-bit dimensions.
      if (headerSize === 12) return { width: u16le(bytes, 18), height: u16le(bytes, 20) };
      // BITMAPINFOHEADER (40) and later: signed 32-bit; negative height means
      // the rows are stored top-down.
      return { width: Math.abs(i32le(bytes, 18)), height: Math.abs(i32le(bytes, 22)) };
    }
    if (mime === "image/x-icon") {
      // ICONDIRENTRY: a stored 0 means 256 pixels.
      if (bytes.length < 8) return null;
      return { width: bytes[6] || 256, height: bytes[7] || 256 };
    }
    if (mime === "image/webp") {
      if (bytes.length < 30) return null;
      if (asciiAt(bytes, 12, "VP8X")) {
        // Extended format: canvas size is stored minus one, 24-bit LE.
        return { width: u24le(bytes, 24) + 1, height: u24le(bytes, 27) + 1 };
      }
      if (asciiAt(bytes, 12, "VP8 ")) {
        // Lossy: 14-bit dimensions after the 3-byte start code at offset 23.
        return { width: u16le(bytes, 26) & 0x3fff, height: u16le(bytes, 28) & 0x3fff };
      }
      if (asciiAt(bytes, 12, "VP8L")) {
        // Lossless: 14 bits width then 14 bits height, both stored minus one.
        const b0 = bytes[21];
        const b1 = bytes[22];
        const b2 = bytes[23];
        const b3 = bytes[24];
        return {
          width: (b0 | ((b1 & 0x3f) << 8)) + 1,
          height: (((b1 & 0xc0) >> 6) | (b2 << 2) | ((b3 & 0x0f) << 10)) + 1,
        };
      }
      return null;
    }
    if (mime === "image/jpeg") {
      // Walk the marker chain until a Start Of Frame; SOF holds the size.
      let p = 2;
      while (p + 9 < bytes.length) {
        if (bytes[p] !== 0xff) {
          p += 1;
          continue;
        }
        const marker = bytes[p + 1];
        if (marker === 0xff || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) {
          p += 2;
          continue;
        }
        const isSof =
          marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
        if (isSof) return { height: u16be(bytes, p + 5), width: u16be(bytes, p + 7) };
        p += 2 + u16be(bytes, p + 2);
      }
      return null;
    }
    if (mime === "image/svg+xml") {
      const text = String.fromCharCode(...bytes.slice(0, 2000));
      const w = /\bwidth\s*=\s*["']([\d.]+)/i.exec(text);
      const h = /\bheight\s*=\s*["']([\d.]+)/i.exec(text);
      if (w && h) return { width: Math.round(Number(w[1])), height: Math.round(Number(h[1])) };
      const vb = /\bviewBox\s*=\s*["']\s*[-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)/i.exec(text);
      if (vb) return { width: Math.round(Number(vb[1])), height: Math.round(Number(vb[2])) };
      return null;
    }
  } catch {
    return null;
  }
  return null;
}

/** IEC binary units — 1 KiB = 1024 bytes, labelled the way file managers do. */
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

/** Filename stem from the tool, e.g. `image-1024x768.png`. */
export function suggestFileName(type, dimensions) {
  const ext = type ? type.ext : "bin";
  const size = dimensions ? `-${dimensions.width}x${dimensions.height}` : "";
  return `base64-image${size}.${ext}`;
}

/**
 * Total function: Base64 (raw or data URL) → a preview-ready report.
 * Always returns either `{ error }` or a complete result object.
 */
export function analyzeBase64Image(rawInput) {
  const { declaredMime, payload, wasDataUrl } = splitDataUrl(rawInput);
  const normalizedResult = normalizeBase64(payload);
  if (normalizedResult.error) return { error: normalizedResult.error };

  const { normalized, urlSafe, addedPadding } = normalizedResult;
  const byteLength = base64ByteLength(normalized);
  if (byteLength <= 0) {
    return { error: "The Base64 decodes to zero bytes — there is no image in there." };
  }
  if (byteLength > MAX_PREVIEW_BYTES) {
    return {
      error: `That decodes to ${formatBytes(byteLength)}, over the ${formatBytes(
        MAX_PREVIEW_BYTES,
      )} preview limit. Save it to a file instead.`,
    };
  }

  const decoded = decodeBase64ToBytes(normalized);
  if (decoded.error) return { error: decoded.error };

  const type = detectImageType(decoded.bytes);
  if (!type) {
    return {
      error: wasDataUrl
        ? "The data URL decodes cleanly but the bytes are not a known image format (PNG, JPEG, GIF, WebP, BMP, ICO, AVIF, HEIC, TIFF or SVG)."
        : "Decoded fine, but those bytes are not a known image format. This may be a PDF, a video or plain text rather than an image.",
    };
  }

  const dimensions = readImageDimensions(decoded.bytes, type.mime);
  const mismatch = Boolean(declaredMime) && declaredMime !== type.mime;

  return {
    mime: type.mime,
    label: type.label,
    extension: type.ext,
    declaredMime,
    mimeMismatch: mismatch,
    wasDataUrl,
    urlSafe,
    addedPadding,
    bytes: byteLength,
    sizeLabel: formatBytes(byteLength),
    base64Length: normalized.length,
    // Base64 inflates a payload by exactly 4/3 before padding.
    overheadPercent: Math.round(((normalized.length - byteLength) / byteLength) * 100),
    width: dimensions ? dimensions.width : null,
    height: dimensions ? dimensions.height : null,
    megapixels: dimensions ? (dimensions.width * dimensions.height) / 1e6 : null,
    aspectRatio: dimensions && dimensions.height > 0 ? dimensions.width / dimensions.height : null,
    dataUrl: `data:${type.mime};base64,${normalized}`,
    fileName: suggestFileName(type, dimensions),
  };
}
