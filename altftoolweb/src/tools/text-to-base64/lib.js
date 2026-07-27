/**
 * Base64 encoding / decoding, RFC 4648.
 *
 * Section 4 defines the standard alphabet, section 5 defines the
 * "URL and filename safe" alphabet (`+` -> `-`, `/` -> `_`).
 * Padding with `=` is required by section 3.2 for the standard alphabet and
 * explicitly optional for the URL-safe variant (section 3.2, §5).
 */

/** RFC 4648 §4 — standard alphabet, index = 6-bit value. */
export const BASE64_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/** RFC 4648 §5 — URL and filename safe alphabet. */
export const BASE64URL_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

/** RFC 4648 §3.2 — the pad character. */
export const PAD_CHAR = "=";

/** RFC 2045 §6.8 (MIME) wraps encoded output at 76 characters per line. */
export const MIME_LINE_LENGTH = 76;

/** RFC 4880 / PEM style wrapping, offered as the alternate line width. */
export const PEM_LINE_LENGTH = 64;

/** Base64 turns every 3 input bytes into 4 output characters (RFC 4648 §4). */
export const BYTES_PER_GROUP = 3;
export const CHARS_PER_GROUP = 4;

/** Guard so a pasted novel cannot lock the tab up. */
export const MAX_INPUT_CHARS = 200000;

export const LINE_WRAP_OPTIONS = [
  { value: 0, label: "No wrapping (one line)" },
  { value: PEM_LINE_LENGTH, label: `${PEM_LINE_LENGTH} chars (PEM)` },
  { value: MIME_LINE_LENGTH, label: `${MIME_LINE_LENGTH} chars (MIME)` },
];

function alphabetFor(urlSafe) {
  return urlSafe ? BASE64URL_ALPHABET : BASE64_ALPHABET;
}

function buildReverseMap() {
  const map = new Map();
  for (let i = 0; i < BASE64_ALPHABET.length; i += 1) {
    map.set(BASE64_ALPHABET[i], i);
    map.set(BASE64URL_ALPHABET[i], i);
  }
  return map;
}

const REVERSE_MAP = buildReverseMap();

/** UTF-8 encode a string to bytes. TextEncoder is standard in Node and browsers. */
export function textToBytes(text) {
  return new TextEncoder().encode(text);
}

/** UTF-8 decode bytes back to a string, rejecting malformed sequences. */
export function bytesToText(bytes) {
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

/** Raw byte array -> base64 characters. No padding when `pad` is false. */
export function bytesToBase64(bytes, { urlSafe = false, pad = true } = {}) {
  const alphabet = alphabetFor(urlSafe);
  let out = "";

  for (let i = 0; i < bytes.length; i += BYTES_PER_GROUP) {
    const b0 = bytes[i];
    const hasB1 = i + 1 < bytes.length;
    const hasB2 = i + 2 < bytes.length;
    const b1 = hasB1 ? bytes[i + 1] : 0;
    const b2 = hasB2 ? bytes[i + 2] : 0;

    out += alphabet[b0 >> 2];
    out += alphabet[((b0 & 0b11) << 4) | (b1 >> 4)];
    // 1 leftover byte -> 2 chars + 2 pads; 2 leftover bytes -> 3 chars + 1 pad.
    if (hasB1) out += alphabet[((b1 & 0b1111) << 2) | (b2 >> 6)];
    else if (pad) out += PAD_CHAR;

    if (hasB2) out += alphabet[b2 & 0b111111];
    else if (pad) out += PAD_CHAR;
  }

  return out;
}

/** Insert a newline every `width` characters. width <= 0 means no wrapping. */
export function wrapLines(value, width) {
  if (!Number.isFinite(width) || width <= 0) return value;
  const lines = [];
  for (let i = 0; i < value.length; i += width) {
    lines.push(value.slice(i, i + width));
  }
  return lines.join("\n");
}

/**
 * Encode plain text to Base64.
 * @returns {{base64:string,byteLength:number,charCount:number,outputLength:number,
 *            overheadPercent:number,lineCount:number}|{error:string}}
 */
export function encodeText({
  text = "",
  urlSafe = false,
  padding = true,
  lineWrap = 0,
} = {}) {
  if (typeof text !== "string") {
    return { error: "Input must be text." };
  }
  if (text.length === 0) {
    return { error: "Enter some text to encode." };
  }
  if (text.length > MAX_INPUT_CHARS) {
    return {
      error: `Input is ${text.length.toLocaleString()} characters. The limit is ${MAX_INPUT_CHARS.toLocaleString()}.`,
    };
  }

  const bytes = textToBytes(text);
  const raw = bytesToBase64(bytes, { urlSafe, pad: padding });
  const wrapWidth = Number(lineWrap) || 0;
  const base64 = wrapLines(raw, wrapWidth);

  // Base64 costs 4 characters per 3 bytes = 33.33% growth before padding.
  const overheadPercent = ((raw.length - bytes.length) / bytes.length) * 100;

  return {
    base64,
    byteLength: bytes.length,
    charCount: text.length,
    outputLength: raw.length,
    overheadPercent: Number(overheadPercent.toFixed(2)),
    lineCount: base64.split("\n").length,
  };
}

/**
 * Decode Base64 (standard or URL-safe, padded or not) back to UTF-8 text.
 * @returns {{text:string,byteLength:number,inputLength:number,
 *            urlSafeChars:boolean,padded:boolean}|{error:string}}
 */
export function decodeBase64({ value = "" } = {}) {
  if (typeof value !== "string") {
    return { error: "Input must be text." };
  }

  // Whitespace is not part of the encoding; MIME output is line-wrapped.
  const cleaned = value.replace(/\s+/g, "");
  if (cleaned.length === 0) {
    return { error: "Enter a Base64 string to decode." };
  }
  if (cleaned.length > MAX_INPUT_CHARS) {
    return {
      error: `Input is ${cleaned.length.toLocaleString()} characters. The limit is ${MAX_INPUT_CHARS.toLocaleString()}.`,
    };
  }

  const padded = cleaned.endsWith(PAD_CHAR);
  const body = cleaned.replace(/=+$/, "");

  if (body.includes(PAD_CHAR)) {
    return { error: "Padding '=' may only appear at the end of the string." };
  }

  const urlSafeChars = /[-_]/.test(body);
  if (urlSafeChars && /[+/]/.test(body)) {
    return { error: "Mixes URL-safe (-_) and standard (+/) characters — pick one alphabet." };
  }

  for (const char of body) {
    if (!REVERSE_MAP.has(char)) {
      return { error: `'${char}' is not a Base64 character.` };
    }
  }

  // 4 chars -> 3 bytes. A remainder of 1 char carries only 6 bits: impossible.
  if (body.length % CHARS_PER_GROUP === 1) {
    return { error: "Truncated Base64: the length leaves a single leftover character." };
  }

  const bytes = [];
  for (let i = 0; i < body.length; i += CHARS_PER_GROUP) {
    const chunk = body.slice(i, i + CHARS_PER_GROUP);
    const v0 = REVERSE_MAP.get(chunk[0]);
    const v1 = REVERSE_MAP.get(chunk[1]);
    bytes.push((v0 << 2) | (v1 >> 4));
    if (chunk.length > 2) {
      const v2 = REVERSE_MAP.get(chunk[2]);
      bytes.push(((v1 & 0b1111) << 4) | (v2 >> 2));
      if (chunk.length > 3) {
        const v3 = REVERSE_MAP.get(chunk[3]);
        bytes.push(((v2 & 0b11) << 6) | v3);
      }
    }
  }

  let text;
  try {
    text = bytesToText(Uint8Array.from(bytes));
  } catch {
    return { error: "Decoded bytes are not valid UTF-8 text (this looks like binary data)." };
  }

  return {
    text,
    byteLength: bytes.length,
    inputLength: cleaned.length,
    urlSafeChars,
    padded,
  };
}
