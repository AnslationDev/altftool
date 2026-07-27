/**
 * Secret Message Encoder — classical ciphers, transport encodings and real
 * authenticated encryption.
 *
 * Rules and standards implemented:
 *
 *  - Caesar shift: C = (P + k) mod 26 on letters only, case preserved
 *    (Suetonius records Julius Caesar using k = 3).
 *  - ROT13: the Caesar cipher with k = 13, which is its own inverse.
 *  - Atbash: the Hebrew substitution A<->Z, B<->Y, i.e. C = 25 - P.
 *  - Vigenere: C = (P + K_i) mod 26 with the key repeated over the plaintext,
 *    described by Bellaso in 1553 and misattributed to Vigenere.
 *  - Base64: RFC 4648 section 4, standard alphabet with "=" padding, applied to
 *    the UTF-8 bytes of the text.
 *  - Percent-encoding: RFC 3986, via encodeURIComponent/decodeURIComponent.
 *  - Morse: ITU-R M.1677-1 International Morse code. One space separates
 *    letters, " / " separates words.
 *  - Binary: each UTF-8 byte as 8 bits, MSB first, space separated.
 *  - AES-256-GCM with a key derived by PBKDF2-HMAC-SHA256. The iteration count
 *    is 600,000, the figure in the OWASP Password Storage Cheat Sheet for
 *    PBKDF2-HMAC-SHA256. Salt is 16 bytes, IV is 12 bytes as required by
 *    NIST SP 800-38D for GCM.
 *
 * NONE of the classical ciphers or encodings is secure — they are puzzles and
 * transport formats. Only the AES-GCM mode provides confidentiality.
 *
 * Pure module: no React, no DOM. The AES functions take the salt and IV as
 * arguments so they are deterministic and testable; randomness is the caller's
 * job.
 */

const ALPHABET_SIZE = 26;

/** OWASP Password Storage Cheat Sheet figure for PBKDF2-HMAC-SHA256. */
export const PBKDF2_ITERATIONS = 600000;
/** NIST SP 800-38D recommends a 96-bit (12 byte) IV for GCM. */
export const AES_IV_BYTES = 12;
/** 128-bit salt for the KDF. */
export const AES_SALT_BYTES = 16;
/** AES key length in bits. */
export const AES_KEY_BITS = 256;

export const ALGORITHMS = [
  { id: "caesar", label: "Caesar shift", needsShift: true, reversible: true, secure: false },
  { id: "rot13", label: "ROT13", needsShift: false, reversible: true, secure: false },
  { id: "atbash", label: "Atbash", needsShift: false, reversible: true, secure: false },
  { id: "vigenere", label: "Vigenere (keyword)", needsKey: true, reversible: true, secure: false },
  { id: "base64", label: "Base64 (RFC 4648)", reversible: true, secure: false },
  { id: "url", label: "URL percent-encoding (RFC 3986)", reversible: true, secure: false },
  { id: "morse", label: "Morse code (ITU-R M.1677-1)", reversible: true, secure: false },
  { id: "binary", label: "Binary (8 bits per byte)", reversible: true, secure: false },
];

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/* ------------------------------------------------------------------ base64 */

const B64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/** Encode bytes as RFC 4648 standard Base64 with padding. */
export function bytesToBase64(bytes) {
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = bytes[i + 1];
    const b2 = bytes[i + 2];
    out += B64_ALPHABET[b0 >> 2];
    out += B64_ALPHABET[((b0 & 0x03) << 4) | ((b1 ?? 0) >> 4)];
    out += b1 === undefined ? "=" : B64_ALPHABET[((b1 & 0x0f) << 2) | ((b2 ?? 0) >> 6)];
    out += b2 === undefined ? "=" : B64_ALPHABET[b2 & 0x3f];
  }
  return out;
}

/** Decode RFC 4648 standard Base64 into bytes. Returns null on bad input. */
export function base64ToBytes(text) {
  const clean = String(text).replace(/\s+/g, "");
  if (clean === "") return new Uint8Array(0);
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(clean) || clean.length % 4 !== 0) return null;

  const out = [];
  for (let i = 0; i < clean.length; i += 4) {
    const chunk = [0, 1, 2, 3].map((offset) => {
      const char = clean[i + offset];
      if (char === "=") return -1;
      const index = B64_ALPHABET.indexOf(char);
      return index;
    });
    if (chunk.some((value) => value === undefined || value === -2)) return null;
    if (chunk[0] < 0 || chunk[1] < 0) return null;
    out.push((chunk[0] << 2) | (chunk[1] >> 4));
    if (chunk[2] >= 0) out.push(((chunk[1] & 0x0f) << 4) | (chunk[2] >> 2));
    if (chunk[3] >= 0) out.push(((chunk[2] & 0x03) << 6) | chunk[3]);
  }
  return Uint8Array.from(out);
}

/* --------------------------------------------------------- classical ciphers */

/** Caesar shift. Non-letters pass through untouched. */
export function caesar(text, shift, decode = false) {
  const k = Number(shift);
  if (!Number.isFinite(k)) return { error: "The shift must be a number." };
  const normalised = ((Math.trunc(k) % ALPHABET_SIZE) + ALPHABET_SIZE) % ALPHABET_SIZE;
  const offset = decode ? (ALPHABET_SIZE - normalised) % ALPHABET_SIZE : normalised;

  return String(text).replace(/[a-z]/gi, (char) => {
    const code = char.charCodeAt(0);
    const base = code >= 65 && code <= 90 ? 65 : 97;
    return String.fromCharCode(((code - base + offset) % ALPHABET_SIZE) + base);
  });
}

/** ROT13 is Caesar with k = 13 and is its own inverse. */
export function rot13(text) {
  return caesar(text, 13, false);
}

/** Atbash: C = 25 - P within each case. */
export function atbash(text) {
  return String(text).replace(/[a-z]/gi, (char) => {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCharCode(90 - (code - 65));
    return String.fromCharCode(122 - (code - 97));
  });
}

/**
 * Vigenere cipher. The key advances only on letters, so punctuation does not
 * consume key characters.
 */
export function vigenere(text, key, decode = false) {
  const letters = String(key ?? "").replace(/[^a-z]/gi, "");
  if (letters.length === 0) {
    return { error: "The Vigenere keyword must contain at least one letter A–Z." };
  }
  const shifts = letters.toLowerCase().split("").map((char) => char.charCodeAt(0) - 97);

  let index = 0;
  return String(text).replace(/[a-z]/gi, (char) => {
    const code = char.charCodeAt(0);
    const base = code >= 65 && code <= 90 ? 65 : 97;
    const shift = shifts[index % shifts.length];
    index += 1;
    const applied = decode ? (ALPHABET_SIZE - shift) % ALPHABET_SIZE : shift;
    return String.fromCharCode(((code - base + applied) % ALPHABET_SIZE) + base);
  });
}

/* -------------------------------------------------------------- encodings */

export function base64Transform(text, decode = false) {
  if (decode) {
    const bytes = base64ToBytes(text);
    if (!bytes) return { error: "That is not valid Base64 — check for stray characters or padding." };
    try {
      return decoder.decode(bytes);
    } catch {
      return { error: "Those Base64 bytes are not valid UTF-8 text." };
    }
  }
  return bytesToBase64(encoder.encode(String(text)));
}

export function urlTransform(text, decode = false) {
  if (decode) {
    try {
      return decodeURIComponent(String(text));
    } catch {
      return { error: "That is not valid percent-encoded text — check every % is followed by two hex digits." };
    }
  }
  return encodeURIComponent(String(text));
}

export function binaryTransform(text, decode = false) {
  if (decode) {
    const chunks = String(text).trim().split(/\s+/).filter(Boolean);
    if (chunks.length === 0) return "";
    const bytes = [];
    for (const chunk of chunks) {
      if (!/^[01]{1,8}$/.test(chunk)) {
        return { error: "Binary input must be groups of 1s and 0s, up to 8 bits each, separated by spaces." };
      }
      bytes.push(parseInt(chunk, 2));
    }
    try {
      return decoder.decode(Uint8Array.from(bytes));
    } catch {
      return { error: "Those bytes are not valid UTF-8 text." };
    }
  }
  return Array.from(encoder.encode(String(text)))
    .map((byte) => byte.toString(2).padStart(8, "0"))
    .join(" ");
}

/* ------------------------------------------------------------------ morse */

export const MORSE_MAP = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....",
  I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.",
  Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
  Y: "-.--", Z: "--..",
  0: "-----", 1: ".----", 2: "..---", 3: "...--", 4: "....-",
  5: ".....", 6: "-....", 7: "--...", 8: "---..", 9: "----.",
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.", "!": "-.-.--",
  "/": "-..-.", "(": "-.--.", ")": "-.--.-", "&": ".-...", ":": "---...",
  ";": "-.-.-.", "=": "-...-", "+": ".-.-.", "-": "-....-", _: "..--.-",
  '"': ".-..-.", $: "...-..-", "@": ".--.-.",
};

const MORSE_REVERSE = Object.fromEntries(
  Object.entries(MORSE_MAP).map(([letter, code]) => [code, letter]),
);

export function morseTransform(text, decode = false) {
  if (decode) {
    const words = String(text).trim().split(/\s*\/\s*/);
    const out = [];
    for (const word of words) {
      const codes = word.split(/\s+/).filter(Boolean);
      let built = "";
      for (const code of codes) {
        const letter = MORSE_REVERSE[code];
        if (!letter) return { error: `"${code}" is not a Morse code sequence in ITU-R M.1677-1.` };
        built += letter;
      }
      out.push(built);
    }
    return out.join(" ");
  }

  const upper = String(text).toUpperCase();
  const unsupported = new Set();
  const words = upper.split(/\s+/).filter(Boolean);
  const encoded = words.map((word) =>
    word
      .split("")
      .map((char) => {
        const code = MORSE_MAP[char];
        if (!code) {
          unsupported.add(char);
          return null;
        }
        return code;
      })
      .filter(Boolean)
      .join(" "),
  );
  if (encoded.length === 0) return "";
  return encoded.join(" / ");
}

/* ---------------------------------------------------------------- analysis */

/**
 * FNV-1a 32-bit hash of the UTF-8 bytes — a real, specified checksum rather
 * than an ad-hoc one, so two people can compare payload fingerprints.
 */
export function fnv1a32(text) {
  const FNV_OFFSET_BASIS = 0x811c9dc5;
  const FNV_PRIME = 0x01000193;
  let hash = FNV_OFFSET_BASIS;
  const bytes = encoder.encode(String(text));
  for (const byte of bytes) {
    hash ^= byte;
    hash = Math.imul(hash, FNV_PRIME) >>> 0;
  }
  return hash.toString(16).padStart(8, "0").toUpperCase();
}

/** Character, word, line and byte counts plus the FNV-1a fingerprint. */
export function analyseText(text) {
  const value = String(text ?? "");
  const trimmed = value.trim();
  return {
    characters: value.length,
    words: trimmed ? trimmed.split(/\s+/).length : 0,
    lines: value === "" ? 0 : value.split(/\r\n|\r|\n/).length,
    bytes: encoder.encode(value).length,
    checksum: fnv1a32(value),
  };
}

/* -------------------------------------------------------------- dispatcher */

/**
 * Apply one of the deterministic algorithms.
 * @param {{text: string, algorithm: string, mode: "encode"|"decode", shift?: number, key?: string}} input
 * @returns {{output: string, algorithm: object}|{error: string}}
 */
export function transform({ text, algorithm, mode = "encode", shift = 3, key = "" }) {
  const spec = ALGORITHMS.find((entry) => entry.id === algorithm);
  if (!spec) return { error: "Pick an algorithm." };
  if (typeof text !== "string") return { error: "Enter a message." };
  if (text === "") return { output: "", algorithm: spec };

  const decode = mode === "decode";
  let result;

  if (spec.id === "caesar") result = caesar(text, shift, decode);
  else if (spec.id === "rot13") result = rot13(text);
  else if (spec.id === "atbash") result = atbash(text);
  else if (spec.id === "vigenere") result = vigenere(text, key, decode);
  else if (spec.id === "base64") result = base64Transform(text, decode);
  else if (spec.id === "url") result = urlTransform(text, decode);
  else if (spec.id === "morse") result = morseTransform(text, decode);
  else if (spec.id === "binary") result = binaryTransform(text, decode);
  else return { error: "Pick an algorithm." };

  if (result && typeof result === "object" && result.error) return result;
  return { output: result, algorithm: spec };
}

/* ------------------------------------------------------------------ AES-GCM */

async function deriveKey(password, saltBytes, iterations) {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) throw new Error("Web Crypto is not available here, so AES-GCM cannot run.");
  const baseKey = await subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, [
    "deriveKey",
  ]);
  return subtle.deriveKey(
    { name: "PBKDF2", salt: saltBytes, iterations, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: AES_KEY_BITS },
    false,
    ["encrypt", "decrypt"],
  );
}

/**
 * Encrypt with AES-256-GCM. Salt and IV are arguments, so the function is
 * deterministic; the caller supplies fresh random bytes for every message.
 *
 * @returns {Promise<{payload: string}|{error: string}>}
 */
export async function encryptAesGcm({
  text,
  password,
  saltBytes,
  ivBytes,
  iterations = PBKDF2_ITERATIONS,
}) {
  if (typeof text !== "string" || text === "") return { error: "Enter a message to encrypt." };
  if (typeof password !== "string" || password.length < 8) {
    return { error: "Use a passphrase of at least 8 characters." };
  }
  if (!(saltBytes instanceof Uint8Array) || saltBytes.length !== AES_SALT_BYTES) {
    return { error: `The salt must be ${AES_SALT_BYTES} random bytes.` };
  }
  if (!(ivBytes instanceof Uint8Array) || ivBytes.length !== AES_IV_BYTES) {
    return { error: `The IV must be ${AES_IV_BYTES} random bytes.` };
  }

  try {
    const key = await deriveKey(password, saltBytes, iterations);
    const cipherBuffer = await globalThis.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: ivBytes },
      key,
      encoder.encode(text),
    );
    return {
      payload: JSON.stringify({
        v: 1,
        alg: "AES-256-GCM",
        kdf: "PBKDF2-SHA256",
        iter: iterations,
        salt: bytesToBase64(saltBytes),
        iv: bytesToBase64(ivBytes),
        data: bytesToBase64(new Uint8Array(cipherBuffer)),
      }),
    };
  } catch (error) {
    return { error: error?.message || "Encryption failed." };
  }
}

/**
 * Decrypt a payload produced by encryptAesGcm.
 * @returns {Promise<{text: string}|{error: string}>}
 */
export async function decryptAesGcm({ payload, password }) {
  let parsed;
  try {
    parsed = JSON.parse(String(payload));
  } catch {
    return { error: "That is not an AES payload — paste the whole JSON block." };
  }
  if (parsed?.alg !== "AES-256-GCM") return { error: "Unsupported payload: expected AES-256-GCM." };
  if (typeof password !== "string" || password === "") {
    return { error: "Enter the passphrase used to encrypt this message." };
  }

  const salt = base64ToBytes(parsed.salt);
  const iv = base64ToBytes(parsed.iv);
  const data = base64ToBytes(parsed.data);
  if (!salt || !iv || !data) return { error: "The payload's Base64 fields are corrupt." };

  const iterations = Number(parsed.iter);
  if (!Number.isInteger(iterations) || iterations < 1) {
    return { error: "The payload has an invalid iteration count." };
  }

  try {
    const key = await deriveKey(password, salt, iterations);
    const plainBuffer = await globalThis.crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      data,
    );
    return { text: decoder.decode(plainBuffer) };
  } catch {
    return { error: "Wrong passphrase, or the payload has been altered — GCM authentication failed." };
  }
}
