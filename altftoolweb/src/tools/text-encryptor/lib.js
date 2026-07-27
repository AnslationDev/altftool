/**
 * Text Encryptor — AES-GCM encryption and SHA hashing over the Web Crypto API.
 *
 * Key derivation is PBKDF2-HMAC-SHA256, and encryption is AES-256-GCM, which
 * is authenticated: a modified ciphertext fails to decrypt rather than
 * returning garbage. Every parameter that must not repeat (the salt and the
 * IV) is passed in explicitly, so `encryptText` is deterministic for a given
 * set of inputs and can be tested.
 *
 * No DOM, no React. `randomBytes` is the one non-deterministic helper and it is
 * kept out of the maths.
 */

/**
 * PBKDF2 iteration count. The OWASP Password Storage Cheat Sheet recommends
 * 600,000 iterations for PBKDF2-HMAC-SHA256 (2023 revision). Lower values are
 * accepted for compatibility with older payloads but never produced.
 */
export const PBKDF2_ITERATIONS = 600000;
export const MIN_ITERATIONS = 10000;

/** 128-bit salt — comfortably above the 64-bit minimum in NIST SP 800-132. */
export const SALT_BYTES = 16;

/** 96-bit IV, the size NIST SP 800-38D specifies as optimal for GCM. */
export const IV_BYTES = 12;

/** 128-bit authentication tag, the maximum GCM defines. */
export const GCM_TAG_BITS = 128;

/** AES-256. */
export const AES_KEY_BITS = 256;

/** Payload prefix so the format is self-describing and versioned. */
export const PAYLOAD_PREFIX = "ALTFT1";

/** Digest algorithms the Web Crypto API guarantees. */
export const HASH_ALGORITHMS = Object.freeze(["SHA-1", "SHA-256", "SHA-384", "SHA-512"]);

/** Passwords shorter than this are rejected outright. */
export const MIN_PASSWORD_LENGTH = 8;

/**
 * Character-set sizes used for the entropy estimate
 * (entropy in bits = length x log2(alphabet size)).
 */
export const CHARSET_SIZES = Object.freeze({
  lower: 26,
  upper: 26,
  digits: 10,
  symbols: 33,
});

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const subtle = () => {
  const api = globalThis.crypto && globalThis.crypto.subtle;
  if (!api) return null;
  return api;
};

/** Cryptographically strong random bytes. The only non-deterministic export. */
export function randomBytes(length) {
  const size = Number(length);
  if (!Number.isFinite(size) || size <= 0 || size > 1024) {
    return { error: "Random byte length must be between 1 and 1024." };
  }
  const out = new Uint8Array(Math.trunc(size));
  globalThis.crypto.getRandomValues(out);
  return { bytes: out };
}

/** Uint8Array to standard base64. */
export function bytesToBase64(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return globalThis.btoa(binary);
}

/** Standard base64 to Uint8Array. Returns null when the input is not base64. */
export function base64ToBytes(value) {
  try {
    const binary = globalThis.atob(String(value == null ? "" : value));
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
    return out;
  } catch {
    return null;
  }
}

/** Uint8Array to lowercase hex. */
export function bytesToHex(bytes) {
  let hex = "";
  for (let i = 0; i < bytes.length; i += 1) hex += bytes[i].toString(16).padStart(2, "0");
  return hex;
}

/**
 * Estimate password entropy in bits: length x log2(size of the alphabet used).
 * This is the standard "search-space" estimate; it assumes a random password
 * and overstates the strength of dictionary words.
 */
export function passwordEntropyBits(password) {
  const text = String(password == null ? "" : password);
  if (text === "") return 0;
  let alphabet = 0;
  if (/[a-z]/.test(text)) alphabet += CHARSET_SIZES.lower;
  if (/[A-Z]/.test(text)) alphabet += CHARSET_SIZES.upper;
  if (/[0-9]/.test(text)) alphabet += CHARSET_SIZES.digits;
  if (/[^a-zA-Z0-9]/.test(text)) alphabet += CHARSET_SIZES.symbols;
  if (alphabet === 0) return 0;
  return Math.round(text.length * Math.log2(alphabet) * 10) / 10;
}

/** Plain-language band for an entropy figure. */
export function entropyBand(bits) {
  if (bits >= 128) return "Very strong";
  if (bits >= 80) return "Strong";
  if (bits >= 60) return "Adequate";
  if (bits >= 40) return "Weak";
  return "Very weak";
}

async function deriveKey(password, salt, iterations) {
  const api = subtle();
  const baseKey = await api.importKey("raw", encoder.encode(password), "PBKDF2", false, [
    "deriveKey",
  ]);
  return api.deriveKey(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: AES_KEY_BITS },
    false,
    ["encrypt", "decrypt"],
  );
}

/** Assemble the payload string. */
export function buildPayload({ salt, iv, iterations, ciphertext }) {
  return [
    PAYLOAD_PREFIX,
    bytesToBase64(salt),
    bytesToBase64(iv),
    String(iterations),
    bytesToBase64(ciphertext),
  ].join(".");
}

/** Split a payload string back into its parts, or return { error }. */
export function parsePayload(payload) {
  const parts = String(payload == null ? "" : payload).trim().split(".");
  if (parts.length !== 5 || parts[0] !== PAYLOAD_PREFIX) {
    return { error: `That is not an ${PAYLOAD_PREFIX} payload — paste the whole encrypted string.` };
  }
  const salt = base64ToBytes(parts[1]);
  const iv = base64ToBytes(parts[2]);
  const iterations = Number(parts[3]);
  const ciphertext = base64ToBytes(parts[4]);
  if (!salt || salt.length !== SALT_BYTES) return { error: "The payload's salt is missing or the wrong length." };
  if (!iv || iv.length !== IV_BYTES) return { error: "The payload's IV is missing or the wrong length." };
  if (!Number.isFinite(iterations) || iterations < MIN_ITERATIONS) {
    return { error: `The payload's iteration count is missing or below the ${MIN_ITERATIONS} minimum.` };
  }
  if (!ciphertext || ciphertext.length === 0) return { error: "The payload has no ciphertext." };
  return { salt, iv, iterations, ciphertext };
}

/**
 * Encrypt text with AES-256-GCM.
 * Deterministic for a given plaintext, password, salt, IV and iteration count.
 *
 * @param {{plaintext:string, password:string, salt:Uint8Array, iv:Uint8Array,
 *   iterations?:number}} input
 * @returns {Promise<object|{error:string}>}
 */
export async function encryptText(input = {}) {
  const api = subtle();
  if (!api) return { error: "This browser does not expose the Web Crypto API." };

  const plaintext = String(input.plaintext == null ? "" : input.plaintext);
  const password = String(input.password == null ? "" : input.password);
  const iterations = Number(input.iterations ?? PBKDF2_ITERATIONS);

  if (plaintext === "") return { error: "Enter some text to encrypt." };
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { error: `Use a password of at least ${MIN_PASSWORD_LENGTH} characters.` };
  }
  if (!Number.isFinite(iterations) || iterations < MIN_ITERATIONS) {
    return { error: `Iteration count must be at least ${MIN_ITERATIONS}.` };
  }
  const salt = input.salt instanceof Uint8Array ? input.salt : null;
  const iv = input.iv instanceof Uint8Array ? input.iv : null;
  if (!salt || salt.length !== SALT_BYTES) return { error: `The salt must be ${SALT_BYTES} bytes.` };
  if (!iv || iv.length !== IV_BYTES) return { error: `The IV must be ${IV_BYTES} bytes.` };

  try {
    const key = await deriveKey(password, salt, iterations);
    const buffer = await api.encrypt(
      { name: "AES-GCM", iv, tagLength: GCM_TAG_BITS },
      key,
      encoder.encode(plaintext),
    );
    const ciphertext = new Uint8Array(buffer);
    return {
      payload: buildPayload({ salt, iv, iterations, ciphertext }),
      ciphertextBase64: bytesToBase64(ciphertext),
      saltBase64: bytesToBase64(salt),
      ivBase64: bytesToBase64(iv),
      iterations,
      plaintextBytes: encoder.encode(plaintext).length,
      /** GCM appends a 128-bit tag, so ciphertext is plaintext length + 16 bytes. */
      ciphertextBytes: ciphertext.length,
      algorithm: `AES-${AES_KEY_BITS}-GCM`,
      kdf: `PBKDF2-HMAC-SHA256 x ${iterations}`,
    };
  } catch {
    return { error: "Encryption failed in this browser's crypto engine." };
  }
}

/**
 * Decrypt an ALTFT1 payload.
 * @returns {Promise<{plaintext:string}|{error:string}>}
 */
export async function decryptText(input = {}) {
  const api = subtle();
  if (!api) return { error: "This browser does not expose the Web Crypto API." };

  const password = String(input.password == null ? "" : input.password);
  if (password === "") return { error: "Enter the password the payload was encrypted with." };

  const parsed = parsePayload(input.payload);
  if (parsed.error) return { error: parsed.error };

  try {
    const key = await deriveKey(password, parsed.salt, parsed.iterations);
    const buffer = await api.decrypt(
      { name: "AES-GCM", iv: parsed.iv, tagLength: GCM_TAG_BITS },
      key,
      parsed.ciphertext,
    );
    return {
      plaintext: decoder.decode(buffer),
      iterations: parsed.iterations,
      algorithm: `AES-${AES_KEY_BITS}-GCM`,
    };
  } catch {
    return {
      error:
        "Could not decrypt: the password is wrong, or the payload was altered. AES-GCM refuses tampered data rather than returning it.",
    };
  }
}

/**
 * Hash text with one of the SHA algorithms in the Web Crypto API.
 * @returns {Promise<{hex:string, base64:string, bits:number}|{error:string}>}
 */
export async function hashText(text, algorithm = "SHA-256") {
  const api = subtle();
  if (!api) return { error: "This browser does not expose the Web Crypto API." };
  const value = String(text == null ? "" : text);
  if (value === "") return { error: "Enter some text to hash." };
  if (!HASH_ALGORITHMS.includes(algorithm)) {
    return { error: `Pick one of: ${HASH_ALGORITHMS.join(", ")}.` };
  }
  const digest = new Uint8Array(await api.digest(algorithm, encoder.encode(value)));
  return {
    algorithm,
    hex: bytesToHex(digest),
    base64: bytesToBase64(digest),
    bits: digest.length * 8,
    /** SHA-1 has practical collision attacks (SHAttered, 2017) and is not for security use. */
    deprecated: algorithm === "SHA-1",
  };
}
