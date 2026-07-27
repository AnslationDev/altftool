/**
 * Audio file <-> Base64 data URL.
 *
 * Base64 is defined by RFC 4648 section 4: the input is taken three bytes at a
 * time, split into four 6-bit groups, and each group is written as one
 * character from the 64-character alphabet. Input that is not a multiple of
 * three is padded with "=" so the output length is always a multiple of four.
 * That is why Base64 always costs exactly 4/3 of the original size before
 * padding — a 33% expansion.
 *
 * A data URL wraps that in "data:<mime>;base64,<payload>" (RFC 2397).
 *
 * The encoder here is written out rather than delegating to btoa() so the same
 * function runs in Node for testing and in the browser, and so binary input
 * never has to be round-tripped through a latin-1 string.
 *
 * Pure module: no React, no DOM, no clock reads.
 */

/** RFC 4648 section 4 standard alphabet. */
export const BASE64_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/** Base64 expands input by exactly 4/3 before padding. */
export const BASE64_EXPANSION = 4 / 3;

/** Bytes in a kibibyte and a mebibyte, used for every size figure here. */
export const BYTES_PER_KIB = 1024;
export const BYTES_PER_MIB = 1024 * 1024;

/**
 * Above this an inline data URL costs more than it saves: the bytes sit inside
 * the HTML/CSS/JS payload, so they cannot be cached separately, cannot be
 * range-requested for seeking, and block the parser while they download.
 */
export const INLINE_RECOMMENDED_MAX_BYTES = 100 * BYTES_PER_KIB;

/** Practical ceiling for a single inlined asset before the source file becomes
 * unmanageable in an editor and in source control. */
export const INLINE_HARD_MAX_BYTES = 2 * BYTES_PER_MIB;

/** Refuse anything above this outright — encoding it in the browser would
 * allocate several times the file size as a JavaScript string. */
export const MAX_FILE_BYTES = 50 * BYTES_PER_MIB;

/** MIME types by file extension, from the IANA audio registry and the values
 * browsers actually report. */
export const AUDIO_MIME_TYPES = {
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
  mp4: "audio/mp4",
  aac: "audio/aac",
  ogg: "audio/ogg",
  oga: "audio/ogg",
  opus: "audio/ogg",
  wav: "audio/wav",
  wave: "audio/wav",
  flac: "audio/flac",
  weba: "audio/webm",
  webm: "audio/webm",
  aiff: "audio/aiff",
  aif: "audio/aiff",
  mid: "audio/midi",
  midi: "audio/midi",
  amr: "audio/amr",
  "3gp": "audio/3gpp",
};

/** Used when neither the extension nor the browser identifies the file. */
export const FALLBACK_MIME_TYPE = "application/octet-stream";

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/**
 * Best MIME type for a file, preferring the extension because browsers report
 * an empty string for several audio formats.
 *
 * @param {string} fileName
 * @param {string} [reportedType] the browser's File.type
 * @returns {string}
 */
export function detectMimeType(fileName, reportedType) {
  const name = String(fileName ?? "");
  const dot = name.lastIndexOf(".");
  const extension = dot > -1 ? name.slice(dot + 1).toLowerCase() : "";
  if (AUDIO_MIME_TYPES[extension]) return AUDIO_MIME_TYPES[extension];
  const reported = String(reportedType ?? "").trim();
  if (reported) return reported;
  return FALLBACK_MIME_TYPE;
}

/**
 * Encode bytes as standard Base64.
 *
 * @param {Uint8Array|number[]} bytes
 * @returns {{ base64: string } | { error: string }}
 */
export function bytesToBase64(bytes) {
  if (!bytes || typeof bytes.length !== "number") {
    return { error: "There is no file data to encode." };
  }
  if (bytes.length === 0) return { error: "That file is empty — there is nothing to encode." };
  if (bytes.length > MAX_FILE_BYTES) {
    return {
      error: `That file is ${formatBytes(bytes.length)}. Encode files up to ${formatBytes(MAX_FILE_BYTES)} — larger ones exhaust browser memory as a string.`,
    };
  }

  let out = "";
  const length = bytes.length;
  const remainder = length % 3;
  const fullGroups = length - remainder;

  for (let i = 0; i < fullGroups; i += 3) {
    const triple = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    out +=
      BASE64_ALPHABET[(triple >> 18) & 63] +
      BASE64_ALPHABET[(triple >> 12) & 63] +
      BASE64_ALPHABET[(triple >> 6) & 63] +
      BASE64_ALPHABET[triple & 63];
  }

  if (remainder === 1) {
    const chunk = bytes[fullGroups] << 16;
    out += BASE64_ALPHABET[(chunk >> 18) & 63] + BASE64_ALPHABET[(chunk >> 12) & 63] + "==";
  } else if (remainder === 2) {
    const chunk = (bytes[fullGroups] << 16) | (bytes[fullGroups + 1] << 8);
    out +=
      BASE64_ALPHABET[(chunk >> 18) & 63] +
      BASE64_ALPHABET[(chunk >> 12) & 63] +
      BASE64_ALPHABET[(chunk >> 6) & 63] +
      "=";
  }

  return { base64: out };
}

/** Reverse of bytesToBase64. Tolerates whitespace and URL-safe characters. */
export function base64ToBytes(base64) {
  const cleaned = String(base64 ?? "")
    .replace(/\s+/g, "")
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  if (!cleaned) return { error: "There is no Base64 payload to decode." };
  const body = cleaned.replace(/=+$/, "");
  if (/[^A-Za-z0-9+/]/.test(body)) {
    return { error: "That payload contains characters that are not valid Base64." };
  }
  if (body.length % 4 === 1) {
    return { error: "That Base64 payload is truncated — its length cannot be decoded." };
  }

  const byteLength = Math.floor((body.length * 3) / 4);
  const bytes = new Uint8Array(byteLength);
  let buffer = 0;
  let bits = 0;
  let index = 0;
  for (let i = 0; i < body.length; i += 1) {
    buffer = (buffer << 6) | BASE64_ALPHABET.indexOf(body[i]);
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes[index] = (buffer >> bits) & 0xff;
      index += 1;
    }
  }
  return { bytes };
}

/** Wrap a Base64 payload in a data URL (RFC 2397). */
export function buildDataUrl({ base64, mimeType } = {}) {
  if (typeof base64 !== "string" || base64.length === 0) {
    return { error: "There is no Base64 payload to wrap." };
  }
  const type = String(mimeType || FALLBACK_MIME_TYPE).trim() || FALLBACK_MIME_TYPE;
  return { dataUrl: `data:${type};base64,${base64}` };
}

/**
 * Split a data URL back into its MIME type and payload.
 *
 * @param {string} dataUrl
 * @returns {{ mimeType:string, base64:string, byteLength:number } | { error:string }}
 */
export function parseDataUrl(dataUrl) {
  const text = String(dataUrl ?? "").trim();
  if (!text) return { error: "Paste a data URL to inspect it." };
  const match = /^data:([^;,]*)((?:;[^;,]*)*),(.*)$/s.exec(text);
  if (!match) return { error: "That does not look like a data: URL." };
  const [, mimeType, parameters, payload] = match;
  if (!/;base64/i.test(parameters)) {
    return { error: "That data URL is percent-encoded, not Base64." };
  }
  const decoded = base64ToBytes(payload);
  if (decoded.error) return { error: decoded.error };
  return {
    mimeType: mimeType || FALLBACK_MIME_TYPE,
    base64: payload.replace(/\s+/g, ""),
    byteLength: decoded.bytes.length,
  };
}

/**
 * Size arithmetic for an encode, without doing the encode.
 *
 * Base64 length = 4 × ceil(n / 3), which already includes the padding.
 *
 * @param {number} byteLength
 * @param {string} [mimeType]
 * @returns {object} sizes and advice, or { error: string }
 */
export function estimateEncodedSize(byteLength, mimeType = FALLBACK_MIME_TYPE) {
  if (!isNum(byteLength) || byteLength < 0) {
    return { error: "File size must be zero or more bytes." };
  }
  if (byteLength === 0) return { error: "That file is empty — there is nothing to encode." };

  const base64Length = 4 * Math.ceil(byteLength / 3);
  const prefixLength = `data:${mimeType};base64,`.length;
  const dataUrlLength = base64Length + prefixLength;

  return {
    byteLength,
    base64Length,
    dataUrlLength,
    overheadBytes: dataUrlLength - byteLength,
    overheadPercent: ((dataUrlLength - byteLength) / byteLength) * 100,
    paddingChars: (3 - (byteLength % 3)) % 3,
    withinRecommended: byteLength <= INLINE_RECOMMENDED_MAX_BYTES,
    withinHardLimit: byteLength <= INLINE_HARD_MAX_BYTES,
    advice: sizeAdvice(byteLength),
  };
}

function sizeAdvice(byteLength) {
  if (byteLength <= INLINE_RECOMMENDED_MAX_BYTES) {
    return `Under ${formatBytes(INLINE_RECOMMENDED_MAX_BYTES)} — fine to inline for a short UI sound.`;
  }
  if (byteLength <= INLINE_HARD_MAX_BYTES) {
    return `Over ${formatBytes(INLINE_RECOMMENDED_MAX_BYTES)}. It will work, but the bytes cannot be cached separately and the browser cannot seek with range requests. Prefer a normal file URL.`;
  }
  return `Over ${formatBytes(INLINE_HARD_MAX_BYTES)}. Inlining this makes the source file unmanageable and delays first paint — serve it as a file.`;
}

/** Human-readable byte size, binary units. */
export function formatBytes(bytes) {
  if (!isNum(bytes) || bytes < 0) return "—";
  if (bytes < BYTES_PER_KIB) return `${Math.round(bytes)} B`;
  if (bytes < BYTES_PER_MIB) return `${(bytes / BYTES_PER_KIB).toFixed(1)} KB`;
  return `${(bytes / BYTES_PER_MIB).toFixed(2)} MB`;
}

/** Ready-to-paste snippets for the three places a data URL normally goes. */
export function buildSnippets(dataUrl) {
  if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:")) return [];
  const short = dataUrl.length > 64 ? `${dataUrl.slice(0, 48)}…` : dataUrl;
  return [
    { id: "html", label: "HTML", code: `<audio controls src="${short}"></audio>` },
    { id: "css", label: "CSS", code: `--chime: url("${short}");` },
    { id: "js", label: "JavaScript", code: `new Audio("${short}").play();` },
  ];
}
