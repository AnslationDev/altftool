/**
 * Base64 Audio Converter — pure decoding + container inspection.
 *
 * Everything here is plain JavaScript: no React, no DOM, no clock reads.
 * Rules implemented:
 *   - Base64 alphabet + padding: RFC 4648 §4 (standard) and §5 (URL-safe).
 *   - data: URL grammar: RFC 2397 §3.
 *   - RIFF/WAVE header layout: Microsoft "Multimedia Programming Interface
 *     and Data Specifications 1.0" (fmt chunk = 16 bytes for PCM).
 *   - MPEG audio frame header: ISO/IEC 11172-3 (MPEG-1) and 13818-3 (MPEG-2).
 *   - ID3v2 tag size is a 28-bit syncsafe integer: ID3v2.4.0 structure spec §3.1.
 *   - FLAC STREAMINFO bit layout: xiph.org FLAC format spec §7.
 */

/** Standard Base64 alphabet — RFC 4648 §4, table 1. */
export const BASE64_STANDARD_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/** URL-safe alphabet — RFC 4648 §5, table 2 (`-` and `_` replace `+` and `/`). */
export const BASE64_URL_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

/**
 * Refuse anything past ~12 M Base64 characters (~9 MB decoded). Base64 costs
 * 4 characters per 3 bytes, so this is the point where a browser tab starts
 * paying seconds of main-thread time just to hold the string.
 */
export const MAX_BASE64_INPUT_CHARS = 12_000_000;

/** 3 bytes of input become 4 Base64 characters — RFC 4648 §4. */
export const BASE64_BYTES_PER_GROUP = 3;
export const BASE64_CHARS_PER_GROUP = 4;

/** A 444-byte 8 kHz mono 8-bit PCM WAV (440 Hz tone, 50 ms) used as the demo input. */
export const SAMPLE_WAV_BASE64 =
  "UklGRrQBAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YZABAACAor/V4eLWwaSDYkQuIiAqPlp6m7jO3N7VwqiJaUw1JyQsPVd1lLDH1trTw6uOb1M8LSkuPVRwjanAz9XRw62SdVpDNC0xPVJsiKO5ydDOwq+We2FKOjI0PlBogpyzw8vLwbCZgGdRQDc3QFBlfpasvcbHv7GchGxXRj07Qk9jepGmt8HDvbCeiHJdTEI/RFBhdoygsbu/u7CfjHZjUkhER1Fgc4ebq7W6t6+gjntoWE1ISlJgcYOWpbC1tK2gkH5tXlNNTlRgb4CRoKqwsKugkoFxY1hSUldhbn2NmqWrrKifk4R1aF5XVlpibXuJlqCmqKWdk4Z5bWNcW11jbXmGkZuho6Gbkod8cWhhX2FmbniDjZacn56Zkoh+dGxmZGRob3iBipKXmpqWkImAeHBraGlrcXh/h46TlZWTjoiBenRwbW1vc3h+hIqOkZGPjIeCfXh0cnFzdXl+g4eKjI2MiYaCfnt4dnZ2eHt+gYSGiIiHhoSCf318e3p7fH1/gIKDg4ODg4KBgH9/f39/f4CA";

const DECODE_LOOKUP = (() => {
  const table = new Int16Array(128).fill(-1);
  for (let i = 0; i < BASE64_STANDARD_ALPHABET.length; i += 1) {
    table[BASE64_STANDARD_ALPHABET.charCodeAt(i)] = i;
  }
  // Accept URL-safe input transparently: `-` is 62 and `_` is 63.
  table["-".charCodeAt(0)] = 62;
  table["_".charCodeAt(0)] = 63;
  return table;
})();

/** data: URL grammar — RFC 2397 §3. */
const DATA_URL_RE = /^data:([^,]*),([\s\S]*)$/i;

/** Whitespace is not part of the Base64 alphabet, so it is stripped first. */
export function stripBase64Whitespace(value) {
  return String(value == null ? "" : value).replace(/[\s\r\n\t]+/g, "");
}

/**
 * Split a data: URL into its media type and payload.
 * Returns null when the string is not a data: URL at all.
 */
export function parseDataUrl(value) {
  const match = DATA_URL_RE.exec(String(value == null ? "" : value).trim());
  if (!match) return null;
  const meta = match[1] || "";
  const parts = meta.split(";").map((part) => part.trim()).filter(Boolean);
  const isBase64 = parts.some((part) => part.toLowerCase() === "base64");
  const mediaType = parts.length && parts[0].includes("/") ? parts[0].toLowerCase() : "";
  return { mediaType, isBase64, payload: match[2] };
}

/**
 * Decode Base64 into bytes without atob/Buffer, so the same code runs in a
 * browser, in Node and in a test harness.
 */
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
  if (padding > 2) {
    return { error: "Base64 never carries more than two `=` padding characters." };
  }
  if (body.includes("=")) {
    return { error: "`=` padding may only appear at the very end of a Base64 string." };
  }

  for (let i = 0; i < body.length; i += 1) {
    const code = body.charCodeAt(i);
    if (code > 127 || DECODE_LOOKUP[code] < 0) {
      return {
        error: `“${body[i]}” at position ${i + 1} is not a Base64 character. Allowed: A–Z, a–z, 0–9, + / (or - _ for URL-safe).`,
      };
    }
  }

  const remainder = body.length % BASE64_CHARS_PER_GROUP;
  if (remainder === 1) {
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
    unpadded: padding === 0 && remainder !== 0,
    paddingChars: padding,
  };
}

/** Re-encode bytes as standard Base64 (used to rebuild a clean data: URL). */
export function encodeBytesToBase64(bytes) {
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
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

function ascii(bytes, offset, length) {
  let out = "";
  for (let i = offset; i < offset + length; i += 1) {
    if (i >= bytes.length) return out;
    out += String.fromCharCode(bytes[i]);
  }
  return out;
}

const u16le = (b, o) => b[o] | (b[o + 1] << 8);
const u32le = (b, o) => (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0;

/** Container signatures, checked in this order. Offsets are byte positions. */
export const AUDIO_SIGNATURES = [
  { format: "WAV", mimeType: "audio/wav", extension: "wav", codec: "PCM (RIFF/WAVE)" },
  { format: "MP3", mimeType: "audio/mpeg", extension: "mp3", codec: "MPEG audio Layer III" },
  { format: "FLAC", mimeType: "audio/flac", extension: "flac", codec: "Free Lossless Audio Codec" },
  { format: "OGG", mimeType: "audio/ogg", extension: "ogg", codec: "Ogg container (Vorbis/Opus)" },
  { format: "M4A", mimeType: "audio/mp4", extension: "m4a", codec: "ISO base media (AAC/ALAC)" },
  { format: "AMR", mimeType: "audio/amr", extension: "amr", codec: "Adaptive Multi-Rate" },
  { format: "AIFF", mimeType: "audio/aiff", extension: "aiff", codec: "Audio Interchange File Format" },
];

const byFormat = (name) => AUDIO_SIGNATURES.find((entry) => entry.format === name);

/** Identify the container from its magic bytes. Returns null when unknown. */
export function detectAudioFormat(bytes) {
  if (!bytes || bytes.length < 4) return null;
  const head = ascii(bytes, 0, 4);
  if (head === "RIFF" && ascii(bytes, 8, 4) === "WAVE") return byFormat("WAV");
  if (head === "fLaC") return byFormat("FLAC");
  if (head === "OggS") return byFormat("OGG");
  if (head === "FORM" && ascii(bytes, 8, 4).startsWith("AIF")) return byFormat("AIFF");
  if (ascii(bytes, 0, 5) === "#!AMR") return byFormat("AMR");
  if (ascii(bytes, 4, 4) === "ftyp") {
    const brand = ascii(bytes, 8, 4);
    if (/^(M4A|M4B|mp42|isom|M4P)/.test(brand)) return byFormat("M4A");
  }
  if (ascii(bytes, 0, 3) === "ID3") return byFormat("MP3");
  // Bare MPEG frame sync: eleven 1-bits — ISO/IEC 11172-3 §2.4.3.2.
  if (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0) return byFormat("MP3");
  return null;
}

/**
 * Walk RIFF chunks and read the PCM `fmt ` block.
 * Duration = data-chunk bytes ÷ byte rate, which is exact for PCM.
 */
export function parseWavHeader(bytes) {
  if (ascii(bytes, 0, 4) !== "RIFF" || ascii(bytes, 8, 4) !== "WAVE") return null;
  let offset = 12;
  let fmt = null;
  let dataBytes = 0;
  while (offset + 8 <= bytes.length) {
    const id = ascii(bytes, offset, 4);
    const size = u32le(bytes, offset + 4);
    const body = offset + 8;
    if (id === "fmt " && body + 16 <= bytes.length) {
      fmt = {
        audioFormat: u16le(bytes, body),
        channels: u16le(bytes, body + 2),
        sampleRate: u32le(bytes, body + 4),
        byteRate: u32le(bytes, body + 8),
        blockAlign: u16le(bytes, body + 12),
        bitsPerSample: u16le(bytes, body + 14),
      };
    } else if (id === "data") {
      dataBytes = Math.min(size, Math.max(0, bytes.length - body));
    }
    // RIFF chunks are word-aligned: an odd size is followed by one pad byte.
    offset = body + size + (size % 2);
    if (size <= 0) break;
  }
  if (!fmt || !fmt.byteRate || !fmt.sampleRate) return null;
  return {
    ...fmt,
    dataBytes,
    durationSeconds: dataBytes > 0 ? dataBytes / fmt.byteRate : 0,
    bitrateKbps: (fmt.byteRate * 8) / 1000,
    isPcm: fmt.audioFormat === 1,
  };
}

/** MPEG-1/2/2.5 bitrate tables in kbit/s — ISO/IEC 11172-3 table 4-5. */
const MPEG_BITRATES = {
  "1-1": [0, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448],
  "1-2": [0, 32, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384],
  "1-3": [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320],
  "2-1": [0, 32, 48, 56, 64, 80, 96, 112, 128, 144, 160, 176, 192, 224, 256],
  "2-2": [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160],
  "2-3": [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160],
};

/** Sampling frequencies in Hz, indexed by the header's two-bit field. */
const MPEG_SAMPLE_RATES = {
  1: [44100, 48000, 32000],
  2: [22050, 24000, 16000],
  2.5: [11025, 12000, 8000],
};

const MPEG_CHANNEL_MODES = ["Stereo", "Joint stereo", "Dual channel", "Mono"];

/** ID3v2 tag length: 10-byte header plus a 28-bit syncsafe size. */
export function id3v2TagLength(bytes) {
  if (ascii(bytes, 0, 3) !== "ID3" || bytes.length < 10) return 0;
  const size =
    ((bytes[6] & 0x7f) << 21) | ((bytes[7] & 0x7f) << 14) | ((bytes[8] & 0x7f) << 7) | (bytes[9] & 0x7f);
  const hasFooter = (bytes[5] & 0x10) !== 0;
  return 10 + size + (hasFooter ? 10 : 0);
}

/**
 * Read the first MPEG audio frame header and derive a constant-bitrate
 * duration estimate: audio bytes × 8 ÷ bitrate.
 */
export function parseMp3Header(bytes) {
  const start = id3v2TagLength(bytes);
  const limit = Math.min(bytes.length - 4, start + 8192);
  for (let i = start; i <= limit; i += 1) {
    if (bytes[i] !== 0xff || (bytes[i + 1] & 0xe0) !== 0xe0) continue;
    const versionBits = (bytes[i + 1] >> 3) & 0x03;
    const layerBits = (bytes[i + 1] >> 1) & 0x03;
    if (versionBits === 1 || layerBits === 0) continue; // reserved values
    const version = versionBits === 3 ? 1 : versionBits === 2 ? 2 : 2.5;
    const layer = layerBits === 3 ? 1 : layerBits === 2 ? 2 : 3;
    const bitrateIndex = (bytes[i + 2] >> 4) & 0x0f;
    const rateIndex = (bytes[i + 2] >> 2) & 0x03;
    if (bitrateIndex === 0 || bitrateIndex === 15 || rateIndex === 3) continue;
    const table = MPEG_BITRATES[`${version === 1 ? 1 : 2}-${layer}`];
    const bitrateKbps = table ? table[bitrateIndex] : 0;
    const sampleRate = MPEG_SAMPLE_RATES[version][rateIndex];
    if (!bitrateKbps || !sampleRate) continue;
    const audioBytes = Math.max(0, bytes.length - i);
    return {
      mpegVersion: version,
      layer,
      bitrateKbps,
      sampleRate,
      channels: ((bytes[i + 3] >> 6) & 0x03) === 3 ? 1 : 2,
      channelMode: MPEG_CHANNEL_MODES[(bytes[i + 3] >> 6) & 0x03],
      frameOffset: i,
      hasId3v2: start > 0,
      durationSeconds: (audioBytes * 8) / (bitrateKbps * 1000),
      durationIsEstimate: true,
    };
  }
  return null;
}

/**
 * FLAC STREAMINFO: 20 bits sample rate, 3 bits (channels − 1),
 * 5 bits (bits per sample − 1), 36 bits total samples — FLAC spec §7.
 */
export function parseFlacStreamInfo(bytes) {
  if (ascii(bytes, 0, 4) !== "fLaC" || bytes.length < 42) return null;
  const b = 8; // 4 magic bytes + 4-byte metadata block header
  const sampleRate = (bytes[b + 10] << 12) | (bytes[b + 11] << 4) | (bytes[b + 12] >> 4);
  const channels = ((bytes[b + 12] >> 1) & 0x07) + 1;
  const bitsPerSample = (((bytes[b + 12] & 0x01) << 4) | (bytes[b + 13] >> 4)) + 1;
  const totalSamples =
    (bytes[b + 13] & 0x0f) * 2 ** 32 +
    ((bytes[b + 14] << 24) >>> 0) +
    (bytes[b + 15] << 16) +
    (bytes[b + 16] << 8) +
    bytes[b + 17];
  if (!sampleRate) return null;
  return {
    sampleRate,
    channels,
    bitsPerSample,
    totalSamples,
    durationSeconds: totalSamples > 0 ? totalSamples / sampleRate : 0,
  };
}

const KIB = 1024;

/** Human-readable size using binary multiples (1 KB shown as 1024 bytes). */
export function formatBytes(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return "—";
  if (n < KIB) return `${n} B`;
  if (n < KIB * KIB) return `${(n / KIB).toFixed(1)} KB`;
  return `${(n / (KIB * KIB)).toFixed(2)} MB`;
}

/** m:ss.d — seconds only, never a NaN clock. */
export function formatDuration(seconds) {
  const n = Number(seconds);
  if (!Number.isFinite(n) || n < 0) return "—";
  const whole = Math.floor(n);
  const minutes = Math.floor(whole / 60);
  const rest = n - minutes * 60;
  return `${minutes}:${rest < 10 ? "0" : ""}${rest.toFixed(1)}`;
}

/** Slugify a user-supplied filename stem so the download is always safe. */
export function safeFilenameStem(value, fallback = "audio") {
  const stem = String(value == null ? "" : value)
    .trim()
    .replace(/\.[a-z0-9]{1,5}$/i, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return stem || fallback;
}

/**
 * Main entry point: Base64 (raw or data: URL) → decoded audio description.
 * Returns { error } for anything that is not decodable audio.
 */
export function analyzeBase64Audio(input, options = {}) {
  const filenameStem = safeFilenameStem(options.filename, "audio");
  const text = String(input == null ? "" : input).trim();
  if (!text) return { error: "Paste a Base64 audio string or a data URL first." };

  const dataUrl = parseDataUrl(text);
  if (dataUrl && !dataUrl.isBase64) {
    return { error: "That data: URL is percent-encoded, not Base64. Add `;base64` or paste the Base64 payload." };
  }

  const decoded = decodeBase64ToBytes(dataUrl ? dataUrl.payload : text);
  if (decoded.error) return { error: decoded.error };
  if (decoded.byteLength === 0) {
    return { error: "That Base64 string decodes to zero bytes — there is no audio in it." };
  }

  const signature = detectAudioFormat(decoded.bytes);
  if (!signature) {
    return {
      error:
        "The decoded bytes carry no audio signature (WAV, MP3, FLAC, OGG, M4A, AIFF or AMR). Check that you copied the whole string.",
    };
  }

  let details = null;
  if (signature.format === "WAV") details = parseWavHeader(decoded.bytes);
  else if (signature.format === "MP3") details = parseMp3Header(decoded.bytes);
  else if (signature.format === "FLAC") details = parseFlacStreamInfo(decoded.bytes);

  const mimeType = dataUrl && dataUrl.mediaType ? dataUrl.mediaType : signature.mimeType;
  const warnings = [];
  if (dataUrl && dataUrl.mediaType && dataUrl.mediaType !== signature.mimeType) {
    warnings.push(
      `The data: URL says ${dataUrl.mediaType} but the bytes are ${signature.format} (${signature.mimeType}).`,
    );
  }
  if (decoded.unpadded) {
    warnings.push("The string had no `=` padding; it was decoded as URL-safe Base64.");
  }
  if (details && details.durationIsEstimate) {
    warnings.push("Duration assumes a constant bitrate — a VBR file will differ.");
  }

  return {
    bytes: decoded.bytes,
    byteLength: decoded.byteLength,
    base64Chars: decoded.base64Chars,
    overheadPercent: (decoded.base64Chars / decoded.byteLength - 1) * 100,
    format: signature.format,
    codec: signature.codec,
    mimeType,
    extension: signature.extension,
    declaredMediaType: dataUrl ? dataUrl.mediaType : "",
    fromDataUrl: Boolean(dataUrl),
    filename: `${filenameStem}.${signature.extension}`,
    dataUrl: `data:${signature.mimeType};base64,${encodeBytesToBase64(decoded.bytes)}`,
    sampleRate: details && details.sampleRate ? details.sampleRate : null,
    channels: details && details.channels ? details.channels : null,
    bitsPerSample: details ? details.bitsPerSample ?? details.bitDepth ?? null : null,
    bitrateKbps: details && details.bitrateKbps ? details.bitrateKbps : null,
    durationSeconds: details && Number.isFinite(details.durationSeconds) ? details.durationSeconds : null,
    warnings,
  };
}
