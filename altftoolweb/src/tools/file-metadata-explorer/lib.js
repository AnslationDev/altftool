/**
 * File Metadata Explorer — pure, byte-level metadata extraction.
 *
 * Nothing here touches the DOM, the network or the clock. The UI reads the
 * chosen file into a Uint8Array and hands the bytes to `inspectFile`, which
 * identifies the real format from its magic number and then parses the actual
 * header fields defined by that format's specification:
 *
 *   PNG   — ISO/IEC 15948, 8-byte signature + IHDR chunk (width, height,
 *           bit depth, colour type, interlace) at byte 8.
 *   JPEG  — ITU-T T.81, SOI marker + SOFn frame header (precision, height,
 *           width, component count), plus EXIF (TIFF/EP) tags in APP1.
 *   GIF    — GIF89a spec, logical screen descriptor at byte 6 (little-endian).
 *   WebP  — RIFF container, VP8 / VP8L / VP8X chunk headers.
 *   BMP   — Windows BITMAPINFOHEADER at byte 14.
 *   PDF   — %PDF-1.x header, /Encrypt and page-object scan.
 *   ZIP   — PK\x03\x04 local file header; Office files are ZIPs containing
 *           word/, xl/ or ppt/ parts.
 *   WAV   — RIFF fmt  chunk: channels, sample rate, bits per sample.
 *   MP3   — ID3v2 tag + MPEG audio frame header (ISO/IEC 11172-3 tables).
 *   MP4   — ISO/IEC 14496-12 ftyp brand and mvhd timescale/duration.
 *
 * Integrity numbers are real too: CRC-32 uses the IEEE 802.3 reversed
 * polynomial 0xEDB88320 (CRC-32 of "123456789" = 0xCBF43926), and entropy is
 * Shannon entropy in bits per byte, 0 to 8.
 */

/** Binary size units are powers of 1024 (IEC binary prefixes). */
export const BYTES_PER_KIB = 1024;

/** Bytes we scan when sniffing text vs binary content. */
export const TEXT_SNIFF_BYTES = 8192;

/** Average adult silent reading speed used for the reading-time estimate (words/minute). */
export const READING_WORDS_PER_MINUTE = 200;

/** Largest file this parser will read into memory in one go (256 MiB). */
export const MAX_FILE_BYTES = 256 * BYTES_PER_KIB * BYTES_PER_KIB;

/**
 * Magic numbers, each taken from the format specification. `offset` is where
 * the signature starts; `bytes` are the literal values.
 */
export const FILE_SIGNATURES = [
  { label: "PNG image", mime: "image/png", ext: "png", kind: "image", offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { label: "JPEG image", mime: "image/jpeg", ext: "jpg", kind: "image", offset: 0, bytes: [0xff, 0xd8, 0xff] },
  { label: "GIF image", mime: "image/gif", ext: "gif", kind: "image", offset: 0, bytes: [0x47, 0x49, 0x46, 0x38] },
  { label: "BMP image", mime: "image/bmp", ext: "bmp", kind: "image", offset: 0, bytes: [0x42, 0x4d] },
  { label: "WebP image", mime: "image/webp", ext: "webp", kind: "image", offset: 8, bytes: [0x57, 0x45, 0x42, 0x50] },
  { label: "TIFF image (little-endian)", mime: "image/tiff", ext: "tif", kind: "image", offset: 0, bytes: [0x49, 0x49, 0x2a, 0x00] },
  { label: "TIFF image (big-endian)", mime: "image/tiff", ext: "tif", kind: "image", offset: 0, bytes: [0x4d, 0x4d, 0x00, 0x2a] },
  { label: "ICO icon", mime: "image/x-icon", ext: "ico", kind: "image", offset: 0, bytes: [0x00, 0x00, 0x01, 0x00] },
  { label: "PDF document", mime: "application/pdf", ext: "pdf", kind: "document", offset: 0, bytes: [0x25, 0x50, 0x44, 0x46] },
  { label: "ZIP archive", mime: "application/zip", ext: "zip", kind: "archive", offset: 0, bytes: [0x50, 0x4b, 0x03, 0x04] },
  { label: "ZIP archive (empty)", mime: "application/zip", ext: "zip", kind: "archive", offset: 0, bytes: [0x50, 0x4b, 0x05, 0x06] },
  { label: "GZIP archive", mime: "application/gzip", ext: "gz", kind: "archive", offset: 0, bytes: [0x1f, 0x8b, 0x08] },
  { label: "RAR archive", mime: "application/vnd.rar", ext: "rar", kind: "archive", offset: 0, bytes: [0x52, 0x61, 0x72, 0x21, 0x1a, 0x07] },
  { label: "7-Zip archive", mime: "application/x-7z-compressed", ext: "7z", kind: "archive", offset: 0, bytes: [0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c] },
  { label: "WAV audio", mime: "audio/wav", ext: "wav", kind: "audio", offset: 8, bytes: [0x57, 0x41, 0x56, 0x45] },
  { label: "FLAC audio", mime: "audio/flac", ext: "flac", kind: "audio", offset: 0, bytes: [0x66, 0x4c, 0x61, 0x43] },
  { label: "OGG container", mime: "audio/ogg", ext: "ogg", kind: "audio", offset: 0, bytes: [0x4f, 0x67, 0x67, 0x53] },
  { label: "MP3 audio (ID3 tag)", mime: "audio/mpeg", ext: "mp3", kind: "audio", offset: 0, bytes: [0x49, 0x44, 0x33] },
  { label: "MP4 / MOV container", mime: "video/mp4", ext: "mp4", kind: "video", offset: 4, bytes: [0x66, 0x74, 0x79, 0x70] },
  { label: "Matroska / WebM", mime: "video/webm", ext: "webm", kind: "video", offset: 0, bytes: [0x1a, 0x45, 0xdf, 0xa3] },
  { label: "AVI video", mime: "video/x-msvideo", ext: "avi", kind: "video", offset: 8, bytes: [0x41, 0x56, 0x49, 0x20] },
  { label: "Legacy Office document (OLE2)", mime: "application/x-cfb", ext: "doc", kind: "document", offset: 0, bytes: [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1] },
  { label: "WOFF font", mime: "font/woff", ext: "woff", kind: "font", offset: 0, bytes: [0x77, 0x4f, 0x46, 0x46] },
  { label: "WOFF2 font", mime: "font/woff2", ext: "woff2", kind: "font", offset: 0, bytes: [0x77, 0x4f, 0x46, 0x32] },
  { label: "TrueType font", mime: "font/ttf", ext: "ttf", kind: "font", offset: 0, bytes: [0x00, 0x01, 0x00, 0x00, 0x00] },
  { label: "Windows executable", mime: "application/vnd.microsoft.portable-executable", ext: "exe", kind: "binary", offset: 0, bytes: [0x4d, 0x5a] },
  { label: "ELF executable", mime: "application/x-elf", ext: "elf", kind: "binary", offset: 0, bytes: [0x7f, 0x45, 0x4c, 0x46] },
  { label: "Java class file", mime: "application/java-vm", ext: "class", kind: "binary", offset: 0, bytes: [0xca, 0xfe, 0xba, 0xbe] },
  { label: "SQLite database", mime: "application/vnd.sqlite3", ext: "sqlite", kind: "database", offset: 0, bytes: [0x53, 0x51, 0x4c, 0x69, 0x74, 0x65, 0x20, 0x66] },
];

/** MPEG-1 Layer III bitrates in kbps, indexed by the 4-bit header field (ISO/IEC 11172-3). */
export const MPEG1_LAYER3_BITRATES = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0];
/** MPEG-2 / 2.5 Layer III bitrates in kbps (ISO/IEC 13818-3). */
export const MPEG2_LAYER3_BITRATES = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0];
/** Sampling rates in Hz by MPEG version id, then by the 2-bit rate field. */
export const MPEG_SAMPLE_RATES = {
  1: [44100, 48000, 32000], // MPEG-1
  2: [22050, 24000, 16000], // MPEG-2
  25: [11025, 12000, 8000], // MPEG-2.5
};

/** EXIF orientation values 1-8 (TIFF/EP tag 0x0112). */
export const EXIF_ORIENTATIONS = {
  1: "Normal (0°)",
  2: "Mirrored horizontally",
  3: "Rotated 180°",
  4: "Mirrored vertically",
  5: "Mirrored horizontally, rotated 270° CW",
  6: "Rotated 90° CW",
  7: "Mirrored horizontally, rotated 90° CW",
  8: "Rotated 270° CW",
};

/** PNG colour type codes (ISO/IEC 15948 table 11.3). */
export const PNG_COLOUR_TYPES = {
  0: "Greyscale",
  2: "Truecolour (RGB)",
  3: "Indexed colour (palette)",
  4: "Greyscale with alpha",
  6: "Truecolour with alpha (RGBA)",
};

/**
 * A real 8x4 PNG used so the tool shows a genuine parse on first paint.
 * It is a normal RGB PNG produced by a standard encoder, 134 bytes.
 */
export const SAMPLE_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAgAAAAECAIAAAA8r+mnAAAATUlEQVR4nAXBMREAIAwEQUREBjKQgQzKSEjxIn5OQ4qIY3dFs5vT3OY11biZZoXZ5phrniljM2aF2OKIK54oYTFiRbKTk9zkJZU4meQDcho1AW1Gr9IAAAAASUVORK5CYII=";

const B64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/** Decode standard Base64 to bytes without relying on atob or Buffer. */
export function base64ToBytes(input) {
  const clean = String(input).replace(/[^A-Za-z0-9+/]/g, "");
  const out = new Uint8Array(Math.floor((clean.length * 3) / 4));
  let bits = 0;
  let acc = 0;
  let written = 0;
  for (const char of clean) {
    const value = B64_ALPHABET.indexOf(char);
    if (value < 0) continue;
    acc = (acc << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out[written] = (acc >> bits) & 0xff;
      written += 1;
    }
  }
  return out.subarray(0, written);
}

const isBytes = (value) => value instanceof Uint8Array;

/** Format a byte count with binary (1024-based) units. */
export function formatBytes(bytes) {
  if (typeof bytes !== "number" || !Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes === 0) return "0 B";
  const units = ["B", "KiB", "MiB", "GiB", "TiB"];
  const index = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(BYTES_PER_KIB)));
  const value = bytes / BYTES_PER_KIB ** index;
  const decimals = index === 0 ? 0 : value < 10 ? 2 : 1;
  return `${value.toFixed(decimals)} ${units[index]}`;
}

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

/** CRC-32 (IEEE 802.3, reversed polynomial 0xEDB88320) as an 8-char hex string. */
export function crc32(bytes) {
  if (!isBytes(bytes)) return { error: "CRC-32 needs the file bytes." };
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = CRC32_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return ((crc ^ 0xffffffff) >>> 0).toString(16).padStart(8, "0");
}

/** Shannon entropy in bits per byte (0 = one repeated value, 8 = uniformly random). */
export function shannonEntropy(bytes) {
  if (!isBytes(bytes) || bytes.length === 0) return 0;
  const counts = new Uint32Array(256);
  for (let i = 0; i < bytes.length; i += 1) counts[bytes[i]] += 1;
  let entropy = 0;
  for (let i = 0; i < 256; i += 1) {
    if (!counts[i]) continue;
    const p = counts[i] / bytes.length;
    entropy -= p * Math.log2(p);
  }
  return Math.round(entropy * 1000) / 1000;
}

/** First `count` bytes as spaced uppercase hex — the file's visible signature. */
export function hexSignature(bytes, count = 16) {
  if (!isBytes(bytes)) return "—";
  return Array.from(bytes.subarray(0, count))
    .map((b) => b.toString(16).padStart(2, "0").toUpperCase())
    .join(" ");
}

const matchesAt = (bytes, offset, pattern) => {
  if (bytes.length < offset + pattern.length) return false;
  for (let i = 0; i < pattern.length; i += 1) {
    if (bytes[offset + i] !== pattern[i]) return false;
  }
  return true;
};

const ascii = (bytes, start, length) => {
  let out = "";
  for (let i = start; i < start + length && i < bytes.length; i += 1) {
    out += String.fromCharCode(bytes[i]);
  }
  return out;
};

/** Identify the true format from the magic number, ignoring the file name. */
export function detectSignature(bytes) {
  if (!isBytes(bytes) || bytes.length === 0) return null;
  for (const sig of FILE_SIGNATURES) {
    if (matchesAt(bytes, sig.offset, sig.bytes)) return sig;
  }
  return null;
}

const u16be = (b, i) => (b[i] << 8) | b[i + 1];
const u16le = (b, i) => b[i] | (b[i + 1] << 8);
const u32be = (b, i) => ((b[i] << 24) | (b[i + 1] << 16) | (b[i + 2] << 8) | b[i + 3]) >>> 0;
const u32le = (b, i) => (b[i] | (b[i + 1] << 8) | (b[i + 2] << 16) | (b[i + 3] << 24)) >>> 0;

/** PNG IHDR chunk — width, height, bit depth, colour type, interlace. */
export function parsePng(bytes) {
  if (bytes.length < 33 || ascii(bytes, 12, 4) !== "IHDR") {
    return { error: "This PNG has no readable IHDR header chunk." };
  }
  const bitDepth = bytes[24];
  const colourType = bytes[25];
  return {
    format: "PNG",
    width: u32be(bytes, 16),
    height: u32be(bytes, 20),
    bitDepth,
    colourType: PNG_COLOUR_TYPES[colourType] ?? `Unknown (${colourType})`,
    interlaced: bytes[28] === 1,
    hasAlpha: colourType === 4 || colourType === 6,
  };
}

/** JPEG SOFn frame header — sample precision, dimensions and component count. */
export function parseJpeg(bytes) {
  let i = 2;
  while (i + 9 < bytes.length) {
    if (bytes[i] !== 0xff) {
      i += 1;
      continue;
    }
    const marker = bytes[i + 1];
    // Standalone markers carry no length field.
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2;
      continue;
    }
    const length = u16be(bytes, i + 2);
    const isSof =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf);
    if (isSof) {
      const components = bytes[i + 9];
      return {
        format: "JPEG",
        precisionBits: bytes[i + 4],
        height: u16be(bytes, i + 5),
        width: u16be(bytes, i + 7),
        components,
        colourSpace: components === 1 ? "Greyscale" : components === 3 ? "YCbCr" : components === 4 ? "CMYK / YCCK" : `${components} components`,
        progressive: marker === 0xc2 || marker === 0xc6 || marker === 0xca || marker === 0xce,
      };
    }
    if (marker === 0xda) break; // start of scan: image data begins
    i += 2 + length;
  }
  return { error: "No JPEG frame header (SOFn) found in this file." };
}

/** GIF logical screen descriptor (bytes 6-10, little-endian). */
export function parseGif(bytes) {
  if (bytes.length < 13) return { error: "This GIF is too short to hold a screen descriptor." };
  const packed = bytes[10];
  return {
    format: `GIF (${ascii(bytes, 0, 6)})`,
    width: u16le(bytes, 6),
    height: u16le(bytes, 8),
    colourResolutionBits: ((packed >> 4) & 0x07) + 1,
    globalPaletteColours: packed & 0x80 ? 2 ** ((packed & 0x07) + 1) : 0,
    animated: countOccurrences(bytes, [0x00, 0x21, 0xf9, 0x04]) > 1,
  };
}

/** WebP VP8 / VP8L / VP8X chunk headers inside the RIFF container. */
export function parseWebp(bytes) {
  if (bytes.length < 30) return { error: "This WebP file is too short to read." };
  const chunk = ascii(bytes, 12, 4);
  if (chunk === "VP8 ") {
    return {
      format: "WebP (lossy VP8)",
      width: u16le(bytes, 26) & 0x3fff,
      height: u16le(bytes, 28) & 0x3fff,
      lossless: false,
    };
  }
  if (chunk === "VP8L") {
    const bits = u32le(bytes, 21);
    return {
      format: "WebP (lossless VP8L)",
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
      lossless: true,
    };
  }
  if (chunk === "VP8X") {
    const width = 1 + (bytes[24] | (bytes[25] << 8) | (bytes[26] << 16));
    const height = 1 + (bytes[27] | (bytes[28] << 8) | (bytes[29] << 16));
    const flags = bytes[20];
    return {
      format: "WebP (extended VP8X)",
      width,
      height,
      hasAlpha: Boolean(flags & 0x10),
      animated: Boolean(flags & 0x02),
    };
  }
  return { error: "Unrecognised WebP chunk after the RIFF header." };
}

/** Windows BITMAPINFOHEADER at byte 14. Height is signed: negative = top-down. */
export function parseBmp(bytes) {
  if (bytes.length < 30) return { error: "This BMP is too short to hold an info header." };
  const rawHeight = u32le(bytes, 22) | 0;
  return {
    format: "BMP",
    width: u32le(bytes, 18) | 0,
    height: Math.abs(rawHeight),
    topDown: rawHeight < 0,
    bitsPerPixel: u16le(bytes, 28),
    dataOffset: u32le(bytes, 10),
  };
}

/** RIFF/WAVE fmt chunk: channels, sample rate, bit depth, and CBR duration. */
export function parseWav(bytes) {
  if (bytes.length < 44 || ascii(bytes, 12, 4) !== "fmt ") {
    return { error: "This WAV file has no fmt chunk where the spec expects one." };
  }
  const channels = u16le(bytes, 22);
  const sampleRate = u32le(bytes, 24);
  const byteRate = u32le(bytes, 28);
  const bitsPerSample = u16le(bytes, 34);
  const dataSize = ascii(bytes, 36, 4) === "data" ? u32le(bytes, 40) : 0;
  const durationSeconds = byteRate > 0 && dataSize > 0 ? dataSize / byteRate : null;
  return {
    format: "WAV (PCM RIFF)",
    channels,
    sampleRateHz: sampleRate,
    bitsPerSample,
    bitrateKbps: Math.round((byteRate * 8) / 1000),
    durationSeconds: durationSeconds === null ? null : Math.round(durationSeconds * 100) / 100,
  };
}

/**
 * MP3: skip any ID3v2 tag (syncsafe size), then read the first MPEG audio
 * frame header for version, layer, bitrate, sample rate and channel mode.
 */
export function parseMp3(bytes, totalSize) {
  let offset = 0;
  let id3 = null;
  if (ascii(bytes, 0, 3) === "ID3" && bytes.length > 10) {
    // ID3v2 size is 4 syncsafe bytes (7 bits each).
    const size = (bytes[6] << 21) | (bytes[7] << 14) | (bytes[8] << 7) | bytes[9];
    id3 = { version: `ID3v2.${bytes[3]}.${bytes[4]}`, tagBytes: size + 10 };
    offset = size + 10;
  }
  let frame = -1;
  for (let i = offset; i < Math.min(bytes.length - 4, offset + 200000); i += 1) {
    if (bytes[i] === 0xff && (bytes[i + 1] & 0xe0) === 0xe0) {
      frame = i;
      break;
    }
  }
  if (frame < 0) return { error: "No MPEG audio frame header found in this file.", id3 };

  const versionBits = (bytes[frame + 1] >> 3) & 0x03;
  const layerBits = (bytes[frame + 1] >> 1) & 0x03;
  const bitrateIndex = (bytes[frame + 2] >> 4) & 0x0f;
  const rateIndex = (bytes[frame + 2] >> 2) & 0x03;
  const channelMode = (bytes[frame + 3] >> 6) & 0x03;

  const versionId = versionBits === 3 ? 1 : versionBits === 2 ? 2 : versionBits === 0 ? 25 : null;
  const layer = layerBits === 1 ? 3 : layerBits === 2 ? 2 : layerBits === 3 ? 1 : null;
  if (!versionId || !layer || rateIndex === 3) {
    return { error: "The MPEG frame header in this file is not valid.", id3 };
  }
  const table = versionId === 1 ? MPEG1_LAYER3_BITRATES : MPEG2_LAYER3_BITRATES;
  const bitrateKbps = table[bitrateIndex];
  const sampleRateHz = MPEG_SAMPLE_RATES[versionId][rateIndex];
  const audioBytes = Math.max(0, (Number.isFinite(totalSize) ? totalSize : bytes.length) - offset);
  const durationSeconds =
    bitrateKbps > 0 ? Math.round(((audioBytes * 8) / (bitrateKbps * 1000)) * 100) / 100 : null;

  return {
    format: `MPEG-${versionId === 25 ? "2.5" : versionId} Layer ${layer}`,
    id3,
    bitrateKbps: bitrateKbps || null,
    sampleRateHz,
    channelMode: ["Stereo", "Joint stereo", "Dual channel", "Mono"][channelMode],
    channels: channelMode === 3 ? 1 : 2,
    durationSeconds,
    constantBitrate: bitrateKbps > 0,
  };
}

/** ISO base media file: ftyp brand plus the mvhd timescale/duration pair. */
export function parseMp4(bytes) {
  const brand = ascii(bytes, 8, 4).trim();
  const compatible = ascii(bytes, 16, Math.max(0, Math.min(16, bytes.length - 16)))
    .replace(/[^\x20-\x7e]/g, " ")
    .trim();
  const mvhd = findAscii(bytes, "mvhd");
  let durationSeconds = null;
  let timescale = null;
  if (mvhd > 0 && bytes.length > mvhd + 24) {
    const version = bytes[mvhd + 4];
    if (version === 0) {
      timescale = u32be(bytes, mvhd + 16);
      const duration = u32be(bytes, mvhd + 20);
      if (timescale > 0) durationSeconds = Math.round((duration / timescale) * 100) / 100;
    } else if (version === 1 && bytes.length > mvhd + 36) {
      timescale = u32be(bytes, mvhd + 24);
      const duration = u32be(bytes, mvhd + 32); // low 32 bits, enough below 13 years
      if (timescale > 0) durationSeconds = Math.round((duration / timescale) * 100) / 100;
    }
  }
  return {
    format: "ISO base media (MP4 / MOV)",
    majorBrand: brand || "unknown",
    compatibleBrands: compatible || "—",
    timescale,
    durationSeconds,
  };
}

/** PDF header version, encryption flag and a count of page objects. */
export function parsePdf(bytes) {
  const version = ascii(bytes, 5, 3);
  const text = latin1(bytes);
  const pageObjects = (text.match(/\/Type\s*\/Page[^s]/g) || []).length;
  const countMatch = text.match(/\/Type\s*\/Pages[\s\S]{0,200}?\/Count\s+(\d+)/);
  return {
    format: `PDF ${/^\d\.\d$/.test(version) ? version : "(unknown version)"}`,
    pageCount: countMatch ? Number(countMatch[1]) : pageObjects || null,
    encrypted: text.includes("/Encrypt"),
    linearized: text.includes("/Linearized"),
    hasEmbeddedFiles: text.includes("/EmbeddedFile"),
    producer: matchPdfString(text, "Producer"),
    creator: matchPdfString(text, "Creator"),
  };
}

const matchPdfString = (text, key) => {
  const match = text.match(new RegExp(`/${key}\\s*\\(([^)]{0,120})\\)`));
  return match ? match[1].replace(/[^\x20-\x7e]/g, "").trim() || null : null;
};

/** A ZIP that contains word/, xl/ or ppt/ parts is an OOXML Office document. */
export function parseZip(bytes) {
  const text = latin1(bytes.subarray(0, Math.min(bytes.length, 512 * 1024)));
  const entries = countOccurrences(bytes, [0x50, 0x4b, 0x03, 0x04]);
  let office = null;
  if (text.includes("word/document.xml")) office = "Word document (.docx)";
  else if (text.includes("xl/workbook.xml")) office = "Excel workbook (.xlsx)";
  else if (text.includes("ppt/presentation.xml")) office = "PowerPoint deck (.pptx)";
  else if (text.includes("META-INF/MANIFEST.MF")) office = "Java archive (.jar)";
  else if (text.includes("mimetypeapplication/epub")) office = "EPUB book";
  return {
    format: office ? `ZIP container — ${office}` : "ZIP archive",
    officeType: office,
    localFileHeaders: entries,
  };
}

/**
 * EXIF (TIFF/EP) tags from a JPEG APP1 segment or a bare TIFF file: camera
 * make and model, capture time, orientation, exposure and GPS coordinates.
 */
export function parseExif(bytes) {
  let tiff = -1;
  if (matchesAt(bytes, 0, [0xff, 0xd8])) {
    const app1 = findAscii(bytes, "Exif\x00\x00");
    if (app1 < 0) return null;
    tiff = app1 + 6;
  } else if (matchesAt(bytes, 0, [0x49, 0x49, 0x2a, 0x00]) || matchesAt(bytes, 0, [0x4d, 0x4d, 0x00, 0x2a])) {
    tiff = 0;
  }
  if (tiff < 0 || bytes.length < tiff + 8) return null;

  const little = ascii(bytes, tiff, 2) === "II";
  const readU16 = (i) => (little ? u16le(bytes, i) : u16be(bytes, i));
  const readU32 = (i) => (little ? u32le(bytes, i) : u32be(bytes, i));
  const ifd0 = tiff + readU32(tiff + 4);
  const out = {};

  const readValue = (entry, type, count) => {
    const valueOffset = entry + 8;
    if (type === 2) {
      const size = count;
      const start = size > 4 ? tiff + readU32(valueOffset) : valueOffset;
      return ascii(bytes, start, Math.max(0, size - 1)).replace(/\x00+$/, "").trim();
    }
    if (type === 3) return readU16(valueOffset);
    if (type === 4) return readU32(valueOffset);
    if (type === 5) {
      const start = tiff + readU32(valueOffset);
      if (count === 1) {
        const den = readU32(start + 4);
        return den === 0 ? null : readU32(start) / den;
      }
      const parts = [];
      for (let k = 0; k < count; k += 1) {
        const den = readU32(start + k * 8 + 4);
        parts.push(den === 0 ? 0 : readU32(start + k * 8) / den);
      }
      return parts;
    }
    return null;
  };

  const walk = (ifdOffset, sink) => {
    if (ifdOffset <= tiff || ifdOffset + 2 > bytes.length) return;
    const count = readU16(ifdOffset);
    if (count > 512) return;
    for (let i = 0; i < count; i += 1) {
      const entry = ifdOffset + 2 + i * 12;
      if (entry + 12 > bytes.length) return;
      sink(readU16(entry), readU16(entry + 2), readU32(entry + 4), entry);
    }
  };

  let exifIfd = 0;
  let gpsIfd = 0;
  walk(ifd0, (tag, type, count, entry) => {
    if (tag === 0x010f) out.make = readValue(entry, type, count);
    if (tag === 0x0110) out.model = readValue(entry, type, count);
    if (tag === 0x0112) out.orientation = EXIF_ORIENTATIONS[readValue(entry, type, count)] ?? null;
    if (tag === 0x0131) out.software = readValue(entry, type, count);
    if (tag === 0x0132) out.modifiedAt = readValue(entry, type, count);
    if (tag === 0x8769) exifIfd = tiff + readU32(entry + 8);
    if (tag === 0x8825) gpsIfd = tiff + readU32(entry + 8);
  });

  if (exifIfd) {
    walk(exifIfd, (tag, type, count, entry) => {
      if (tag === 0x9003) out.takenAt = readValue(entry, type, count);
      if (tag === 0x829a) {
        const value = readValue(entry, type, count);
        if (typeof value === "number" && value > 0) {
          out.exposure = value >= 1 ? `${value.toFixed(1)} s` : `1/${Math.round(1 / value)} s`;
        }
      }
      if (tag === 0x829d) {
        const value = readValue(entry, type, count);
        if (typeof value === "number") out.aperture = `f/${value.toFixed(1)}`;
      }
      if (tag === 0x8827) out.iso = readValue(entry, type, count);
      if (tag === 0x920a) {
        const value = readValue(entry, type, count);
        if (typeof value === "number") out.focalLength = `${Math.round(value)} mm`;
      }
      if (tag === 0xa002) out.exifWidth = readValue(entry, type, count);
      if (tag === 0xa003) out.exifHeight = readValue(entry, type, count);
      if (tag === 0xa434) out.lens = readValue(entry, type, count);
    });
  }

  if (gpsIfd) {
    const gps = {};
    walk(gpsIfd, (tag, type, count, entry) => {
      if (tag === 0x0001) gps.latRef = readValue(entry, type, count);
      if (tag === 0x0002) gps.lat = readValue(entry, type, count);
      if (tag === 0x0003) gps.lonRef = readValue(entry, type, count);
      if (tag === 0x0004) gps.lon = readValue(entry, type, count);
    });
    const toDegrees = (parts) =>
      Array.isArray(parts) && parts.length === 3 ? parts[0] + parts[1] / 60 + parts[2] / 3600 : null;
    const lat = toDegrees(gps.lat);
    const lon = toDegrees(gps.lon);
    if (lat !== null && lon !== null) {
      out.latitude = Math.round((gps.latRef === "S" ? -lat : lat) * 1e6) / 1e6;
      out.longitude = Math.round((gps.lonRef === "W" ? -lon : lon) * 1e6) / 1e6;
    }
  }

  return Object.keys(out).length ? out : null;
}

/** Count non-overlapping occurrences of a byte pattern. */
export function countOccurrences(bytes, pattern) {
  let count = 0;
  for (let i = 0; i <= bytes.length - pattern.length; i += 1) {
    if (matchesAt(bytes, i, pattern)) count += 1;
  }
  return count;
}

const latin1 = (bytes) => {
  let out = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    out += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)));
  }
  return out;
};

const findAscii = (bytes, needle) => {
  const pattern = Array.from(needle, (c) => c.charCodeAt(0));
  for (let i = 0; i <= bytes.length - pattern.length; i += 1) {
    if (matchesAt(bytes, i, pattern)) return i;
  }
  return -1;
};

/**
 * Decide whether the bytes are text: no NUL bytes and at least 90% printable
 * or common whitespace characters in the sniffed window.
 */
export function looksLikeText(bytes) {
  if (!isBytes(bytes) || bytes.length === 0) return false;
  const window = bytes.subarray(0, TEXT_SNIFF_BYTES);
  let printable = 0;
  for (let i = 0; i < window.length; i += 1) {
    const b = window[i];
    if (b === 0) return false;
    if (b === 9 || b === 10 || b === 13 || (b >= 32 && b <= 126) || b >= 128) printable += 1;
  }
  return printable / window.length >= 0.9;
}

/** Byte-order-mark detection for text files. */
export function detectBom(bytes) {
  if (matchesAt(bytes, 0, [0xef, 0xbb, 0xbf])) return "UTF-8 with BOM";
  if (matchesAt(bytes, 0, [0xff, 0xfe, 0x00, 0x00])) return "UTF-32 little-endian BOM";
  if (matchesAt(bytes, 0, [0xff, 0xfe])) return "UTF-16 little-endian BOM";
  if (matchesAt(bytes, 0, [0xfe, 0xff])) return "UTF-16 big-endian BOM";
  return null;
}

/** Line, word and character counts plus a reading-time estimate. */
export function analyseText(text) {
  if (typeof text !== "string") return { error: "Text analysis needs decoded text." };
  const lines = text.length === 0 ? 0 : text.split(/\r\n|\r|\n/).length;
  const words = text.split(/\s+/).filter(Boolean).length;
  const lineEnding = text.includes("\r\n") ? "CRLF (Windows)" : text.includes("\r") ? "CR (classic Mac)" : "LF (Unix)";
  return {
    characters: text.length,
    words,
    lines,
    lineEnding,
    readingMinutes: words === 0 ? 0 : Math.max(1, Math.ceil(words / READING_WORDS_PER_MINUTE)),
  };
}

/** Split "photo.final.JPG" into its base name and lowercase extension. */
export function splitFileName(fileName) {
  const name = String(fileName ?? "");
  const dot = name.lastIndexOf(".");
  if (dot <= 0) return { baseName: name, extension: "" };
  return { baseName: name.slice(0, dot), extension: name.slice(dot + 1).toLowerCase() };
}

const EXTENSION_ALIASES = {
  jpg: ["jpg", "jpeg", "jpe"],
  tif: ["tif", "tiff"],
  zip: ["zip", "docx", "xlsx", "pptx", "jar", "epub", "odt", "apk"],
  mp4: ["mp4", "m4a", "m4v", "mov", "3gp"],
  mp3: ["mp3"],
  elf: ["elf", "so", "bin", "out"],
};

/**
 * Full metadata for one file.
 *
 * @param {{ name: string, size: number, type?: string, lastModified?: number|null, bytes: Uint8Array }} input
 * @returns {object} metadata, or { error } when the input cannot be read.
 */
export function inspectFile({ name, size, type = "", lastModified = null, bytes } = {}) {
  if (!isBytes(bytes)) return { error: "Choose a file — nothing has been read yet." };
  if (bytes.length === 0) return { error: "That file is empty (0 bytes), so there is nothing to read." };
  const byteLength = Number.isFinite(size) && size >= 0 ? size : bytes.length;
  if (byteLength > MAX_FILE_BYTES) {
    return { error: `That file is larger than the ${formatBytes(MAX_FILE_BYTES)} this reader handles.` };
  }

  const { baseName, extension } = splitFileName(name);
  const signature = detectSignature(bytes);
  const details = {};
  let exif = null;

  if (signature) {
    switch (signature.ext) {
      case "png":
        Object.assign(details, parsePng(bytes));
        break;
      case "jpg":
        Object.assign(details, parseJpeg(bytes));
        exif = parseExif(bytes);
        break;
      case "gif":
        Object.assign(details, parseGif(bytes));
        break;
      case "webp":
        Object.assign(details, parseWebp(bytes));
        break;
      case "bmp":
        Object.assign(details, parseBmp(bytes));
        break;
      case "tif":
        exif = parseExif(bytes);
        break;
      case "pdf":
        Object.assign(details, parsePdf(bytes));
        break;
      case "zip":
        Object.assign(details, parseZip(bytes));
        break;
      case "wav":
        Object.assign(details, parseWav(bytes));
        break;
      case "mp3":
        Object.assign(details, parseMp3(bytes, byteLength));
        break;
      case "mp4":
        Object.assign(details, parseMp4(bytes));
        break;
      default:
        break;
    }
  }

  const isText = !signature && looksLikeText(bytes);
  let text = null;
  if (isText) {
    const decoded = latin1(bytes.subarray(0, Math.min(bytes.length, 2 * 1024 * 1024)));
    text = analyseText(decoded);
    details.format = "Plain text";
    details.encoding = detectBom(bytes) ?? "UTF-8 / ASCII (no byte-order mark)";
  }

  const declared = EXTENSION_ALIASES[signature?.ext ?? ""] ?? (signature ? [signature.ext] : []);
  const extensionMatches = signature ? declared.includes(extension) : null;

  const megapixels =
    Number.isFinite(details.width) && Number.isFinite(details.height)
      ? Math.round((details.width * details.height) / 10000) / 100
      : null;

  return {
    fileName: String(name ?? "unnamed"),
    baseName,
    extension,
    sizeBytes: byteLength,
    sizeLabel: formatBytes(byteLength),
    browserMimeType: type || "not reported by the browser",
    lastModified: Number.isFinite(lastModified) ? lastModified : null,
    detected: signature
      ? { label: signature.label, mime: signature.mime, kind: signature.kind, extension: signature.ext }
      : isText
        ? { label: "Plain text", mime: "text/plain", kind: "text", extension: extension || "txt" }
        : { label: "Unrecognised binary", mime: "application/octet-stream", kind: "binary", extension: extension || "" },
    extensionMatches,
    hexSignature: hexSignature(bytes, 16),
    crc32: crc32(bytes),
    entropyBitsPerByte: shannonEntropy(bytes),
    megapixels,
    aspectRatio: aspectRatioOf(details.width, details.height),
    bytesPerPixel:
      Number.isFinite(details.width) && Number.isFinite(details.height) && details.width * details.height > 0
        ? Math.round((byteLength / (details.width * details.height)) * 1000) / 1000
        : null,
    details,
    exif,
    text,
  };
}

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

/** Reduce a pixel size to its simplest whole-number ratio (1920x1080 -> 16:9). */
export function aspectRatioOf(width, height) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return null;
  const divisor = gcd(Math.round(width), Math.round(height)) || 1;
  return `${Math.round(width) / divisor}:${Math.round(height) / divisor}`;
}

/** Human-readable m:ss from a seconds count. */
export function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "—";
  const whole = Math.floor(seconds);
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const secs = whole % 60;
  const mm = hours > 0 ? String(minutes).padStart(2, "0") : String(minutes);
  return `${hours > 0 ? `${hours}:` : ""}${mm}:${String(secs).padStart(2, "0")}`;
}

/** The built-in sample so the tool renders a real parse before any upload. */
export function sampleFile() {
  const bytes = base64ToBytes(SAMPLE_PNG_BASE64);
  return {
    name: "sample-swatch.png",
    size: bytes.length,
    type: "image/png",
    lastModified: null,
    bytes,
  };
}
