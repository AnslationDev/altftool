/**
 * Base64 to Video — decode a Base64 payload, identify the container from its
 * magic bytes, and read duration and frame size out of the file's own header.
 *
 * Pure JavaScript: no React, no DOM, no clock.
 */

/** RFC 4648 §4: 4 Base64 characters carry 3 bytes. */
export const BASE64_CHARS_PER_GROUP = 4;
export const BASE64_BYTES_PER_GROUP = 3;

/**
 * A Base64 video is held three times over in memory (string, byte array,
 * blob), so 60 MB decoded is about as far as a phone browser will go.
 */
export const MAX_PREVIEW_BYTES = 60 * 1024 * 1024;

/** `data:[<mime>][;base64],<payload>` — RFC 2397. */
export const DATA_URL_RE =
  /^data:([a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+)?((?:;[a-z0-9-]+=[^;,]*)*)(;base64)?,([\s\S]*)$/i;

const BASE64_ANY_RE = /^[A-Za-z0-9+/\-_]*={0,2}$/;

/**
 * ISO-BMFF (`ftyp`) brands, from the registration list maintained by MP4RA.
 * The brand decides whether a `ftyp` file is MP4, QuickTime, 3GP or audio.
 */
export const FTYP_BRANDS = {
  "qt  ": { mime: "video/quicktime", label: "QuickTime MOV", ext: "mov", isVideo: true },
  isom: { mime: "video/mp4", label: "MP4 (ISO Base Media)", ext: "mp4", isVideo: true },
  iso2: { mime: "video/mp4", label: "MP4 (ISO Base Media)", ext: "mp4", isVideo: true },
  iso4: { mime: "video/mp4", label: "MP4 (ISO Base Media)", ext: "mp4", isVideo: true },
  iso5: { mime: "video/mp4", label: "MP4 (ISO Base Media)", ext: "mp4", isVideo: true },
  iso6: { mime: "video/mp4", label: "MP4 (ISO Base Media)", ext: "mp4", isVideo: true },
  mp41: { mime: "video/mp4", label: "MP4 v1", ext: "mp4", isVideo: true },
  mp42: { mime: "video/mp4", label: "MP4 v2", ext: "mp4", isVideo: true },
  avc1: { mime: "video/mp4", label: "MP4 (AVC)", ext: "mp4", isVideo: true },
  dash: { mime: "video/mp4", label: "MP4 (DASH segment)", ext: "mp4", isVideo: true },
  mmp4: { mime: "video/mp4", label: "MP4 (mobile)", ext: "mp4", isVideo: true },
  "M4V ": { mime: "video/x-m4v", label: "iTunes M4V", ext: "m4v", isVideo: true },
  "M4A ": { mime: "audio/mp4", label: "M4A audio", ext: "m4a", isVideo: false },
  "3gp4": { mime: "video/3gpp", label: "3GPP", ext: "3gp", isVideo: true },
  "3gp5": { mime: "video/3gpp", label: "3GPP", ext: "3gp", isVideo: true },
  "3g2a": { mime: "video/3gpp2", label: "3GPP2", ext: "3g2", isVideo: true },
};

/** Fallback when a `ftyp` brand is not in the table above. */
export const UNKNOWN_FTYP = { mime: "video/mp4", label: "ISO Base Media", ext: "mp4", isVideo: true };

/** Formats whose containers browsers can actually play from a blob URL. */
export const BROWSER_PLAYABLE_MIMES = new Set([
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
  "video/x-m4v",
  "video/3gpp",
]);

/** Strip a `data:` wrapper, keeping the declared MIME type. */
export function splitDataUrl(raw) {
  const value = String(raw == null ? "" : raw).trim();
  const match = DATA_URL_RE.exec(value);
  if (!match) return { declaredMime: "", payload: value, wasDataUrl: false };
  return { declaredMime: (match[1] || "").toLowerCase(), payload: match[4] || "", wasDataUrl: true };
}

/** Strip whitespace, fold URL-safe characters, restore `=` padding. */
export function normalizeBase64(payload) {
  const compact = String(payload == null ? "" : payload).replace(/\s+/g, "");
  if (!compact) return { error: "Paste the Base64 video data first." };
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

/** 3 bytes per 4-character group, minus the padding. */
export function base64ByteLength(normalized) {
  const value = String(normalized || "");
  if (value.length === 0 || value.length % BASE64_CHARS_PER_GROUP !== 0) return 0;
  const padding = (value.match(/=+$/) || [""])[0].length;
  return (value.length / BASE64_CHARS_PER_GROUP) * BASE64_BYTES_PER_GROUP - padding;
}

/** Decode to bytes; returns `{ error }` instead of throwing. */
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

function ascii(bytes, offset, length) {
  let out = "";
  for (let i = offset; i < Math.min(offset + length, bytes.length); i += 1) {
    out += String.fromCharCode(bytes[i]);
  }
  return out;
}

const u32be = (b, i) => ((b[i] << 24) >>> 0) + (b[i + 1] << 16) + (b[i + 2] << 8) + b[i + 3];
/** 64-bit big-endian read; JS numbers stay exact to 2^53, which is plenty here. */
const u64be = (b, i) => u32be(b, i) * 0x100000000 + u32be(b, i + 4);

/**
 * Identify the container from its magic number. Every signature below is
 * taken from the container's own specification.
 */
export function detectVideoContainer(bytes) {
  if (!bytes || bytes.length < 4) return null;

  // ISO Base Media File Format: `ftyp` box at offset 4, brand at offset 8.
  if (asciiAt(bytes, 4, "ftyp")) {
    const brand = ascii(bytes, 8, 4);
    const known = FTYP_BRANDS[brand];
    const base = known || UNKNOWN_FTYP;
    return { ...base, brand };
  }
  // Matroska/WebM: EBML header 1A 45 DF A3 (RFC 8794).
  if (bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) {
    const head = ascii(bytes, 0, 64);
    const isWebm = head.includes("webm");
    return isWebm
      ? { mime: "video/webm", label: "WebM", ext: "webm", isVideo: true, brand: "webm" }
      : { mime: "video/x-matroska", label: "Matroska MKV", ext: "mkv", isVideo: true, brand: "matroska" };
  }
  // Ogg bitstream: capture pattern "OggS" (RFC 3533).
  if (asciiAt(bytes, 0, "OggS")) {
    return { mime: "video/ogg", label: "Ogg", ext: "ogv", isVideo: true, brand: "ogg" };
  }
  // RIFF container with an AVI form type.
  if (asciiAt(bytes, 0, "RIFF") && asciiAt(bytes, 8, "AVI ")) {
    return { mime: "video/x-msvideo", label: "AVI", ext: "avi", isVideo: true, brand: "avi" };
  }
  // Flash Video header: "FLV" then version 1.
  if (asciiAt(bytes, 0, "FLV") && bytes[3] === 0x01) {
    return { mime: "video/x-flv", label: "Flash Video", ext: "flv", isVideo: true, brand: "flv" };
  }
  // ASF/WMV GUID 3026B275-8E66-CF11-A6D9-00AA0062CE6C.
  if (bytes[0] === 0x30 && bytes[1] === 0x26 && bytes[2] === 0xb2 && bytes[3] === 0x75) {
    return { mime: "video/x-ms-wmv", label: "Windows Media (ASF)", ext: "wmv", isVideo: true, brand: "asf" };
  }
  // MPEG program stream pack header 00 00 01 BA.
  if (bytes[0] === 0x00 && bytes[1] === 0x00 && bytes[2] === 0x01 && bytes[3] === 0xba) {
    return { mime: "video/mpeg", label: "MPEG program stream", ext: "mpg", isVideo: true, brand: "mpeg-ps" };
  }
  // MPEG transport stream: 0x47 sync byte every 188 bytes.
  if (bytes[0] === 0x47 && bytes.length > 188 && bytes[188] === 0x47) {
    return { mime: "video/mp2t", label: "MPEG transport stream", ext: "ts", isVideo: true, brand: "mpeg-ts" };
  }
  return null;
}

/**
 * Walk ISO-BMFF boxes at one level and return `[{ type, start, payload, end }]`.
 * Box layout (ISO/IEC 14496-12 §4.2): size(4) type(4); size 1 means a 64-bit
 * `largesize` follows the type; size 0 means "runs to end of file".
 */
export function listIsoBoxes(bytes, start, end) {
  const boxes = [];
  let offset = start;
  let guard = 0;
  while (offset + 8 <= end && guard < 1000) {
    guard += 1;
    let size = u32be(bytes, offset);
    const type = ascii(bytes, offset + 4, 4);
    let payload = offset + 8;
    if (size === 1) {
      if (offset + 16 > end) break;
      size = u64be(bytes, offset + 8);
      payload = offset + 16;
    } else if (size === 0) {
      size = end - offset;
    }
    if (size < 8 || offset + size > end) {
      boxes.push({ type, start: offset, payload, end });
      break;
    }
    boxes.push({ type, start: offset, payload, end: offset + size });
    offset += size;
  }
  return boxes;
}

function findBox(bytes, start, end, type) {
  return listIsoBoxes(bytes, start, end).find((box) => box.type === type) || null;
}

/**
 * Movie duration from the `mvhd` box (ISO/IEC 14496-12 §8.2.2):
 * seconds = duration / timescale.
 */
export function readIsoDuration(bytes) {
  const moov = findBox(bytes, 0, bytes.length, "moov");
  if (!moov) return null;
  const mvhd = findBox(bytes, moov.payload, moov.end, "mvhd");
  if (!mvhd) return null;
  const version = bytes[mvhd.payload];
  let timescale;
  let duration;
  if (version === 1) {
    // version 1: creation(8) modification(8) timescale(4) duration(8)
    if (mvhd.payload + 32 > bytes.length) return null;
    timescale = u32be(bytes, mvhd.payload + 20);
    duration = u64be(bytes, mvhd.payload + 24);
  } else {
    // version 0: creation(4) modification(4) timescale(4) duration(4)
    if (mvhd.payload + 20 > bytes.length) return null;
    timescale = u32be(bytes, mvhd.payload + 12);
    duration = u32be(bytes, mvhd.payload + 16);
  }
  if (!timescale || !Number.isFinite(timescale) || timescale <= 0) return null;
  const seconds = duration / timescale;
  if (!Number.isFinite(seconds) || seconds < 0) return null;
  return { seconds, timescale, units: duration };
}

/**
 * Frame size from the largest `tkhd` (ISO/IEC 14496-12 §8.3.2). Width and
 * height are 16.16 fixed-point at the end of the box; audio tracks store 0.
 */
export function readIsoDimensions(bytes) {
  const moov = findBox(bytes, 0, bytes.length, "moov");
  if (!moov) return null;
  let best = null;
  for (const trak of listIsoBoxes(bytes, moov.payload, moov.end)) {
    if (trak.type !== "trak") continue;
    const tkhd = findBox(bytes, trak.payload, trak.end, "tkhd");
    if (!tkhd) continue;
    const version = bytes[tkhd.payload];
    // version 0 header is 20 bytes to the end of `duration`, version 1 is 32.
    const fixedBlock = version === 1 ? 32 : 20;
    // then reserved(8) layer(2) altGroup(2) volume(2) reserved(2) matrix(36)
    const widthAt = tkhd.payload + 4 + fixedBlock + 8 + 2 + 2 + 2 + 2 + 36;
    if (widthAt + 8 > bytes.length) continue;
    const width = u32be(bytes, widthAt) / 65536;
    const height = u32be(bytes, widthAt + 4) / 65536;
    if (width <= 0 || height <= 0) continue;
    if (!best || width * height > best.width * best.height) {
      best = { width: Math.round(width), height: Math.round(height) };
    }
  }
  return best;
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

/** Average bitrate label; anything under 1 kbit/s is shown as "< 1 kbps". */
export function formatBitrate(kbps) {
  if (kbps == null || kbps === "") return "—";
  const value = Number(kbps);
  if (!Number.isFinite(value) || value < 0) return "—";
  if (value < 1) return "< 1 kbps";
  if (value >= 1000) return `${(value / 1000).toFixed(1)} Mbps`;
  return `${Math.round(value)} kbps`;
}

/** Seconds as h:mm:ss.s, dropping the hour when it is zero. */
export function formatDuration(seconds) {
  if (seconds == null || seconds === "") return "—";
  const value = Number(seconds);
  if (!Number.isFinite(value) || value < 0) return "—";
  // Round to the nearest tenth of a second first so a rounded-up remainder
  // (e.g. 59.95 -> "60.0") carries into minutes/hours instead of displaying
  // an impossible ":60.0".
  const rounded = Math.round(value * 10) / 10;
  const whole = Math.floor(rounded);
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const secs = rounded - hours * 3600 - minutes * 60;
  const secText = `${secs < 10 ? "0" : ""}${secs.toFixed(1)}`;
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, "0")}:${secText}` : `${minutes}:${secText}`;
}

/**
 * Total function: Base64 in, a full video report out.
 * Always returns `{ error }` or a complete result object.
 */
export function analyzeBase64Video(rawInput) {
  const { declaredMime, payload, wasDataUrl } = splitDataUrl(rawInput);
  const normalizedResult = normalizeBase64(payload);
  if (normalizedResult.error) return { error: normalizedResult.error };

  const { normalized, urlSafe } = normalizedResult;
  const byteLength = base64ByteLength(normalized);
  if (byteLength <= 0) {
    return { error: "The Base64 decodes to zero bytes — there is no video in there." };
  }
  if (byteLength > MAX_PREVIEW_BYTES) {
    return {
      error: `That decodes to ${formatBytes(byteLength)}, over the ${formatBytes(
        MAX_PREVIEW_BYTES,
      )} limit this tool can hold in memory. Use a file-based converter for clips that large.`,
    };
  }

  const decoded = decodeBase64ToBytes(normalized);
  if (decoded.error) return { error: decoded.error };
  const { bytes } = decoded;

  const container = detectVideoContainer(bytes);
  if (!container) {
    return {
      error:
        "Those bytes are not a video container this tool recognises (MP4, MOV, WebM, MKV, Ogg, AVI, FLV, WMV, MPEG-PS or MPEG-TS).",
    };
  }
  if (!container.isVideo) {
    return {
      error: `This is ${container.label}, an audio-only file — the ftyp brand is "${container.brand}". Use the audio converter instead.`,
    };
  }

  const isIso = Boolean(FTYP_BRANDS[container.brand]) || container.brand === undefined || asciiAt(bytes, 4, "ftyp");
  const duration = isIso ? readIsoDuration(bytes) : null;
  const dimensions = isIso ? readIsoDimensions(bytes) : null;
  const seconds = duration ? duration.seconds : null;
  // ISO-BMFF keeps the encoded samples in an `mdat` box. Without one the file
  // is metadata only and no player can show a picture.
  const hasMediaData = isIso ? Boolean(findBox(bytes, 0, bytes.length, "mdat")) : true;

  return {
    mime: container.mime,
    label: container.label,
    extension: container.ext,
    brand: container.brand || "",
    declaredMime,
    mimeMismatch: Boolean(declaredMime) && declaredMime !== container.mime,
    playable: BROWSER_PLAYABLE_MIMES.has(container.mime),
    hasMediaData,
    wasDataUrl,
    urlSafe,
    bytes: byteLength,
    sizeLabel: formatBytes(byteLength),
    base64Length: normalized.length,
    // Base64 costs exactly 4/3 of the payload, before padding.
    overheadPercent: Math.round(((normalized.length - byteLength) / byteLength) * 100),
    durationSeconds: seconds,
    durationLabel: seconds == null ? "" : formatDuration(seconds),
    width: dimensions ? dimensions.width : null,
    height: dimensions ? dimensions.height : null,
    // Average bitrate in kbit/s: 8 bits per byte, divided by the running time.
    bitrateKbps: seconds && seconds > 0 ? Math.round((byteLength * 8) / seconds / 1000) : null,
    bitrateLabel: formatBitrate(seconds && seconds > 0 ? (byteLength * 8) / seconds / 1000 : null),
    base64: normalized,
    dataUrl: `data:${container.mime};base64,${normalized}`,
    fileName: `decoded-video.${container.ext}`,
  };
}
