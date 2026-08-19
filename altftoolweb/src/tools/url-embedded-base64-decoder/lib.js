/**
 * Finds and decodes base64, base64url and hex blobs hidden inside a URL.
 *
 * Pure JavaScript — no React, no DOM, no atob, no Buffer. The base64 and UTF-8
 * decoders are implemented here so the results are identical in a browser, in
 * Node and in a test runner.
 */

/** RFC 4648 section 4 alphabet. */
export const BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/** RFC 4648 section 5 ("URL and filename safe") swaps + and / for - and _. */
export const BASE64URL_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

/** Shortest blob worth decoding: below this, false positives dominate. */
export const MIN_TOKEN_LENGTH = 8;

/** A decode is reported only if this share of the result is printable text. */
export const PRINTABLE_THRESHOLD = 0.85;

/** A decode is rejected if more than this share of its bytes were invalid UTF-8. */
export const MAX_INVALID_BYTE_SHARE = 0.1;

/** How many times a result that is itself encoded will be decoded again. */
export const MAX_ROUNDS = 4;

const VALUE_OF = new Map();
for (let i = 0; i < BASE64_ALPHABET.length; i += 1) VALUE_OF.set(BASE64_ALPHABET[i], i);
VALUE_OF.set("-", 62);
VALUE_OF.set("_", 63);

/**
 * Decode base64 or base64url to bytes.
 * @returns {{error:string}|{bytes:number[],variant:string}}
 */
export function decodeBase64ToBytes(input) {
  const raw = String(input ?? "").trim().replace(/\s+/g, "");
  if (!raw) return { error: "Nothing to decode." };

  const stripped = raw.replace(/=+$/, "");
  if (!/^[A-Za-z0-9+/\-_]*$/.test(stripped)) return { error: "Contains characters that are not base64." };
  if (/[+/]/.test(stripped) && /[-_]/.test(stripped)) return { error: "Mixes standard and URL-safe base64 characters." };
  if (stripped.length % 4 === 1) return { error: "Length is not valid for base64 (a group of one character is impossible)." };

  const variant = /[-_]/.test(stripped) ? "base64url" : "base64";
  const bytes = [];
  let buffer = 0;
  let bits = 0;

  for (const ch of stripped) {
    const value = VALUE_OF.get(ch);
    if (value === undefined) return { error: `Unexpected character "${ch}".` };
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }

  return { bytes, variant };
}

/** Decode an even-length hex string to bytes. */
export function decodeHexToBytes(input) {
  const raw = String(input ?? "").trim().replace(/\s+/g, "").replace(/^0x/i, "");
  if (!raw) return { error: "Nothing to decode." };
  if (!/^[0-9a-fA-F]+$/.test(raw)) return { error: "Contains characters that are not hexadecimal." };
  if (raw.length % 2 !== 0) return { error: "Hex needs an even number of characters." };
  const bytes = [];
  for (let i = 0; i < raw.length; i += 2) bytes.push(parseInt(raw.slice(i, i + 2), 16));
  return { bytes, variant: "hex" };
}

/**
 * Bytes to a string, decoding UTF-8 by hand.
 * Invalid sequences become U+FFFD and are counted.
 */
export function bytesToText(bytes) {
  const out = [];
  let invalid = 0;
  let i = 0;
  const list = Array.isArray(bytes) ? bytes : [];

  while (i < list.length) {
    const b0 = list[i];
    let codePoint = null;
    let size = 1;

    if (b0 <= 0x7f) {
      codePoint = b0;
    } else if (b0 >= 0xc2 && b0 <= 0xdf) {
      size = 2;
      const b1 = list[i + 1];
      if (b1 >= 0x80 && b1 <= 0xbf) codePoint = ((b0 & 0x1f) << 6) | (b1 & 0x3f);
    } else if (b0 >= 0xe0 && b0 <= 0xef) {
      size = 3;
      const b1 = list[i + 1];
      const b2 = list[i + 2];
      if (b1 >= 0x80 && b1 <= 0xbf && b2 >= 0x80 && b2 <= 0xbf) {
        const cp = ((b0 & 0x0f) << 12) | ((b1 & 0x3f) << 6) | (b2 & 0x3f);
        if (cp >= 0x800 && !(cp >= 0xd800 && cp <= 0xdfff)) codePoint = cp;
      }
    } else if (b0 >= 0xf0 && b0 <= 0xf4) {
      size = 4;
      const b1 = list[i + 1];
      const b2 = list[i + 2];
      const b3 = list[i + 3];
      if (b1 >= 0x80 && b1 <= 0xbf && b2 >= 0x80 && b2 <= 0xbf && b3 >= 0x80 && b3 <= 0xbf) {
        const cp = ((b0 & 0x07) << 18) | ((b1 & 0x3f) << 12) | ((b2 & 0x3f) << 6) | (b3 & 0x3f);
        if (cp >= 0x10000 && cp <= 0x10ffff) codePoint = cp;
      }
    }

    if (codePoint === null) {
      out.push("�");
      invalid += 1;
      i += 1;
    } else {
      out.push(String.fromCodePoint(codePoint));
      i += size;
    }
  }

  return { text: out.join(""), invalid };
}

/** Share of characters that are ordinary readable text. */
export function printableRatio(text) {
  const value = String(text ?? "");
  if (!value.length) return 0;
  let printable = 0;
  for (const ch of value) {
    const code = ch.codePointAt(0);
    if (code === 9 || code === 10 || code === 13 || (code >= 0x20 && code !== 0x7f && code !== 0xfffd)) printable += 1;
  }
  return printable / Array.from(value).length;
}

/** Percent-decode without throwing on malformed input. */
export function safePercentDecode(text) {
  const value = String(text ?? "");
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

const URL_LIKE = /\b(?:https?:\/\/|www\.)[^\s"'<>]+/i;
const EMAIL_LIKE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;

/** Decode one token, following further layers of encoding. */
export function decodeToken(token) {
  let current = String(token ?? "").trim();
  const layers = [];

  for (let round = 0; round < MAX_ROUNDS; round += 1) {
    const isHex = /^(0x)?[0-9a-fA-F]+$/.test(current) && current.replace(/^0x/i, "").length % 2 === 0 && current.length >= MIN_TOKEN_LENGTH;
    const attempt = isHex ? decodeHexToBytes(current) : decodeBase64ToBytes(current);
    if (attempt.error) break;

    const { text, invalid } = bytesToText(attempt.bytes);
    const ratio = printableRatio(text);
    if (!text || ratio < PRINTABLE_THRESHOLD || invalid > attempt.bytes.length * MAX_INVALID_BYTE_SHARE) break;

    layers.push({ encoding: attempt.variant, text, bytes: attempt.bytes.length });
    current = text.trim();

    const looksEncodedAgain =
      current.length >= MIN_TOKEN_LENGTH && /^[A-Za-z0-9+/\-_]+={0,2}$/.test(current);
    if (!looksEncodedAgain) break;
  }

  if (!layers.length) return null;
  const final = layers[layers.length - 1];
  const urlMatch = final.text.match(URL_LIKE);
  const emailMatch = final.text.match(EMAIL_LIKE);

  return {
    token: String(token ?? "").trim(),
    rounds: layers.length,
    encoding: layers[0].encoding,
    layers,
    decoded: final.text,
    embeddedUrl: urlMatch ? urlMatch[0] : "",
    embeddedEmail: emailMatch ? emailMatch[0] : "",
  };
}

/**
 * Split a URL into the places a blob can hide.
 *
 * Three passes, because the same string can be tokenised sensibly in more than
 * one way: a blob may contain "/" characters of its own, or it may sit inside a
 * path segment where "/" is the delimiter, or it may be one query value.
 */
export function locateCandidates(rawUrl) {
  const raw = String(rawUrl ?? "").trim();
  if (!raw) return [];

  const decodedOnce = safePercentDecode(raw);
  const haystacks = decodedOnce === raw
    ? [{ label: "in the link", text: raw }]
    : [
      { label: "in the link", text: raw },
      { label: "after percent-decoding", text: decodedOnce },
    ];

  const seen = new Set();
  const candidates = [];
  const push = (token, where) => {
    const trimmed = String(token ?? "").trim();
    if (trimmed.length < MIN_TOKEN_LENGTH || seen.has(trimmed)) return;
    seen.add(trimmed);
    candidates.push({ token: trimmed, where });
  };

  for (const { label, text } of haystacks) {
    // Pass 1: runs that may include "/" — a standard-alphabet blob.
    for (const token of text.match(/[A-Za-z0-9+/_-]{8,}={0,2}/g) ?? []) push(token, label);
    // Pass 2: the same without "/", which finds a blob sitting in a path segment.
    for (const token of text.match(/[A-Za-z0-9+_-]{8,}={0,2}/g) ?? []) push(token, label);
    // Pass 3: whole query and fragment values, named so the report can say where.
    const afterMark = text.split(/[?#]/).slice(1).join("&");
    for (const pair of afterMark.split(/[&;]/)) {
      const eq = pair.indexOf("=");
      if (eq < 1) continue;
      const key = pair.slice(0, eq);
      const value = safePercentDecode(pair.slice(eq + 1));
      push(value, `value of "${key}"`);
    }
  }
  return candidates;
}

/**
 * Scan a URL and decode everything in it that decodes to readable text.
 *
 * @returns {{error:string}|{input:string,percentDecoded:string,findings:Array,scanned:number}}
 */
export function scanUrl(rawUrl) {
  const input = String(rawUrl ?? "").trim();
  if (!input) return { error: "Paste the link you want to inspect." };
  if (input.length > 8000) return { error: "That is longer than 8,000 characters — paste the link on its own." };

  const candidates = locateCandidates(input);
  const findings = [];
  for (const candidate of candidates) {
    const decoded = decodeToken(candidate.token);
    if (!decoded) continue;
    // A decode that just returns the token unchanged tells you nothing.
    if (decoded.decoded.trim() === candidate.token) continue;
    findings.push({ ...decoded, where: candidate.where });
  }

  findings.sort((a, b) => {
    const score = (f) => (f.embeddedUrl ? 2 : 0) + (f.embeddedEmail ? 1 : 0);
    return score(b) - score(a) || b.decoded.length - a.decoded.length;
  });

  return {
    input,
    percentDecoded: safePercentDecode(input),
    scanned: candidates.length,
    findings,
  };
}

/**
 * Decode a single blob the user pasted on its own, trying base64 then hex.
 * @returns {{error:string}|object}
 */
export function decodeBlob(text) {
  const raw = String(text ?? "").trim();
  if (!raw) return { error: "Paste a base64 or hex string to decode." };
  const decoded = decodeToken(raw);
  if (!decoded) {
    const attempt = decodeBase64ToBytes(raw);
    if (attempt.error) return { error: attempt.error };
    return { error: "It decoded, but the result is not readable text — it is probably binary data such as an image or a compressed blob." };
  }
  return decoded;
}
