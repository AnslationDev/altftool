/**
 * Hashing vs encryption vs encoding — the working parts.
 *
 * Contains a real SHA-256 implementation (FIPS 180-4), a real Base64 encoder
 * (RFC 4648) and a deliberately simple demonstration cipher, so the difference
 * between the three operations can be shown rather than asserted.
 *
 * Pure JavaScript: no DOM, no Web Crypto, no dependencies.
 */

/**
 * SHA-256 round constants: the first 32 bits of the fractional parts of the
 * cube roots of the first 64 primes. FIPS 180-4, section 4.2.2.
 */
const K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

/**
 * SHA-256 initial hash values: the first 32 bits of the fractional parts of the
 * square roots of the first 8 primes. FIPS 180-4, section 5.3.3.
 */
const H0 = [
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
];

/** SHA-256 processes the message in 512-bit (64-byte) blocks. */
export const SHA256_BLOCK_BYTES = 64;

/** SHA-256 always produces a 256-bit digest, whatever the input length. */
export const SHA256_DIGEST_BITS = 256;

const rotr = (value, bits) => ((value >>> bits) | (value << (32 - bits))) >>> 0;

/** UTF-8 encode a string to a byte array, without relying on TextEncoder. */
export function utf8Bytes(text) {
  const out = [];
  const input = String(text ?? "");
  for (let i = 0; i < input.length; i += 1) {
    let code = input.codePointAt(i);
    if (code > 0xffff) i += 1;
    if (code < 0x80) {
      out.push(code);
    } else if (code < 0x800) {
      out.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code < 0x10000) {
      out.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    } else {
      out.push(
        0xf0 | (code >> 18),
        0x80 | ((code >> 12) & 0x3f),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f),
      );
    }
  }
  return out;
}

/** Decode a UTF-8 byte array back to a string. Invalid bytes become U+FFFD. */
export function bytesToUtf8(bytes) {
  let out = "";
  for (let i = 0; i < bytes.length; ) {
    const byte = bytes[i];
    let code;
    let size;
    if (byte < 0x80) {
      code = byte;
      size = 1;
    } else if ((byte & 0xe0) === 0xc0) {
      code = byte & 0x1f;
      size = 2;
    } else if ((byte & 0xf0) === 0xe0) {
      code = byte & 0x0f;
      size = 3;
    } else if ((byte & 0xf8) === 0xf0) {
      code = byte & 0x07;
      size = 4;
    } else {
      out += "�";
      i += 1;
      continue;
    }
    if (i + size > bytes.length) {
      out += "�";
      break;
    }
    for (let j = 1; j < size; j += 1) {
      const next = bytes[i + j];
      if ((next & 0xc0) !== 0x80) {
        code = 0xfffd;
        break;
      }
      code = (code << 6) | (next & 0x3f);
    }
    out += String.fromCodePoint(code > 0x10ffff ? 0xfffd : code);
    i += size;
  }
  return out;
}

/** SHA-256 over a byte array. Returns the 32-byte digest. FIPS 180-4. */
export function sha256Bytes(bytes) {
  const hash = H0.slice();
  const message = bytes.slice();
  const bitLength = bytes.length * 8;

  // Padding: a single 1 bit, then zeros, then the 64-bit big-endian length.
  message.push(0x80);
  while (message.length % SHA256_BLOCK_BYTES !== SHA256_BLOCK_BYTES - 8) message.push(0);
  const high = Math.floor(bitLength / 4294967296);
  const low = bitLength % 4294967296;
  message.push(
    (high >>> 24) & 0xff,
    (high >>> 16) & 0xff,
    (high >>> 8) & 0xff,
    high & 0xff,
    (low >>> 24) & 0xff,
    (low >>> 16) & 0xff,
    (low >>> 8) & 0xff,
    low & 0xff,
  );

  const w = new Array(64);
  for (let offset = 0; offset < message.length; offset += SHA256_BLOCK_BYTES) {
    for (let t = 0; t < 16; t += 1) {
      const i = offset + t * 4;
      w[t] =
        ((message[i] << 24) | (message[i + 1] << 16) | (message[i + 2] << 8) | message[i + 3]) >>> 0;
    }
    for (let t = 16; t < 64; t += 1) {
      const s0 = (rotr(w[t - 15], 7) ^ rotr(w[t - 15], 18) ^ (w[t - 15] >>> 3)) >>> 0;
      const s1 = (rotr(w[t - 2], 17) ^ rotr(w[t - 2], 19) ^ (w[t - 2] >>> 10)) >>> 0;
      w[t] = (w[t - 16] + s0 + w[t - 7] + s1) >>> 0;
    }

    let [a, b, c, d, e, f, g, h] = hash;
    for (let t = 0; t < 64; t += 1) {
      const S1 = (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) >>> 0;
      const ch = ((e & f) ^ (~e & g)) >>> 0;
      const temp1 = (h + S1 + ch + K[t] + w[t]) >>> 0;
      const S0 = (rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) >>> 0;
      const maj = ((a & b) ^ (a & c) ^ (b & c)) >>> 0;
      const temp2 = (S0 + maj) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }
    const next = [a, b, c, d, e, f, g, h];
    for (let i = 0; i < 8; i += 1) hash[i] = (hash[i] + next[i]) >>> 0;
  }

  const digest = [];
  hash.forEach((word) => {
    digest.push((word >>> 24) & 0xff, (word >>> 16) & 0xff, (word >>> 8) & 0xff, word & 0xff);
  });
  return digest;
}

/** Lowercase hex for a byte array. */
export function bytesToHex(bytes) {
  return bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

/** Parse lowercase or uppercase hex back to bytes. Returns null when malformed. */
export function hexToBytes(hex) {
  const clean = String(hex ?? "").replace(/\s+/g, "");
  if (clean.length === 0 || clean.length % 2 !== 0 || /[^0-9a-fA-F]/.test(clean)) return null;
  const out = [];
  for (let i = 0; i < clean.length; i += 2) out.push(parseInt(clean.slice(i, i + 2), 16));
  return out;
}

/** SHA-256 of a string, as lowercase hex. */
export function sha256Hex(text) {
  return bytesToHex(sha256Bytes(utf8Bytes(text)));
}

/** Base64 alphabet from RFC 4648, section 4. */
const BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/** RFC 4648 Base64 encode. Encoding, not encryption — anyone can reverse it. */
export function base64Encode(text) {
  const bytes = utf8Bytes(text);
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = bytes[i + 1];
    const b2 = bytes[i + 2];
    out += BASE64_ALPHABET[b0 >> 2];
    out += BASE64_ALPHABET[((b0 & 0x03) << 4) | (b1 === undefined ? 0 : b1 >> 4)];
    out += b1 === undefined ? "=" : BASE64_ALPHABET[((b1 & 0x0f) << 2) | (b2 === undefined ? 0 : b2 >> 6)];
    out += b2 === undefined ? "=" : BASE64_ALPHABET[b2 & 0x3f];
  }
  return out;
}

/** RFC 4648 Base64 decode back to a string. Returns null on malformed input. */
export function base64Decode(text) {
  const clean = String(text ?? "").replace(/\s+/g, "").replace(/=+$/, "");
  if (/[^A-Za-z0-9+/]/.test(clean)) return null;
  const bytes = [];
  let buffer = 0;
  let bits = 0;
  for (let i = 0; i < clean.length; i += 1) {
    buffer = (buffer << 6) | BASE64_ALPHABET.indexOf(clean[i]);
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }
  return bytesToUtf8(bytes);
}

/**
 * A repeating-key XOR cipher, used only to demonstrate that encryption is
 * reversible while a hash is not.
 *
 * This is NOT secure. Repeating-key XOR is broken by frequency analysis in
 * seconds and provides no authentication. Real systems use AES-GCM or
 * ChaCha20-Poly1305 with a random nonce per message.
 */
export function demoEncrypt(plaintext, key) {
  const keyBytes = utf8Bytes(key);
  if (keyBytes.length === 0) return null;
  const bytes = utf8Bytes(plaintext);
  const out = bytes.map((byte, index) => byte ^ keyBytes[index % keyBytes.length]);
  return bytesToHex(out);
}

/** Reverse of demoEncrypt. Same key in, original text out. */
export function demoDecrypt(hex, key) {
  const keyBytes = utf8Bytes(key);
  const bytes = hexToBytes(hex);
  if (keyBytes.length === 0 || bytes === null) return null;
  return bytesToUtf8(bytes.map((byte, index) => byte ^ keyBytes[index % keyBytes.length]));
}

/** Number of 1 bits in a byte. */
function popcount(byte) {
  let value = byte;
  let count = 0;
  while (value) {
    count += value & 1;
    value >>= 1;
  }
  return count;
}

/**
 * Hamming distance in bits between two equal-length hex strings.
 * Returns null when the inputs are not both valid hex of the same length.
 */
export function hammingDistanceHex(hexA, hexB) {
  const a = hexToBytes(hexA);
  const b = hexToBytes(hexB);
  if (!a || !b || a.length !== b.length) return null;
  return a.reduce((sum, byte, index) => sum + popcount(byte ^ b[index]), 0);
}

/**
 * Avalanche test: change one character of the input and measure how much of the
 * digest changed. A good hash flips about half the output bits — 128 of 256.
 */
export function avalancheTest(text) {
  const original = String(text ?? "");
  if (original.length === 0) {
    return { error: "Type something first — an empty input has nothing to change." };
  }
  // Flip the case of the first letter, or bump the first character by one.
  const first = original[0];
  const swapped = first === first.toLowerCase() ? first.toUpperCase() : first.toLowerCase();
  const changed =
    swapped !== first
      ? swapped + original.slice(1)
      : String.fromCodePoint(original.codePointAt(0) + 1) + original.slice(1);

  const hashA = sha256Hex(original);
  const hashB = sha256Hex(changed);
  const bitsChanged = hammingDistanceHex(hashA, hashB);

  return {
    original,
    changed,
    hashA,
    hashB,
    bitsChanged,
    totalBits: SHA256_DIGEST_BITS,
    percentChanged: (bitsChanged / SHA256_DIGEST_BITS) * 100,
    hexDigitsChanged: [...hashA].filter((char, index) => char !== hashB[index]).length,
  };
}

/** The property table that separates the three operations. */
export const OPERATIONS = [
  {
    id: "hash",
    label: "Hashing (SHA-256)",
    reversible: "No — there is no key that undoes it",
    needsKey: "No key at all",
    outputSize: "Always 256 bits, whatever goes in",
    purpose: "Prove two things are identical, or store a password verifier",
    wrongUse: "Storing data you need to read back, or hiding data from someone who can guess it",
  },
  {
    id: "encrypt",
    label: "Encryption (AES-GCM, ChaCha20)",
    reversible: "Yes — with the key",
    needsKey: "Yes, and keeping it secret is the whole point",
    outputSize: "Roughly the input size, plus a nonce and an auth tag",
    purpose: "Send or store data that must be readable again later",
    wrongUse: "Storing passwords — a stolen key exposes every one of them at once",
  },
  {
    id: "encode",
    label: "Encoding (Base64, URL-encoding)",
    reversible: "Yes — by anyone, no key involved",
    needsKey: "No key at all",
    outputSize: "About 33% larger than the input for Base64",
    purpose: "Move binary data through a text-only channel safely",
    wrongUse: "Anything described as hiding, obscuring or protecting data",
  },
];

/** Misconceptions worth naming, each with the one-line correction. */
export const MISCONCEPTIONS = [
  [
    "Hashing is just encryption without a key",
    "Encryption is a two-way function by design; hashing destroys information on purpose. A 256-bit digest cannot hold a 10 MB file, so there is nothing to reverse back into.",
  ],
  [
    "A hash can be decrypted with the right tool",
    "So-called hash crackers do not reverse anything. They hash guesses until one matches, which is why a slow, salted password hash beats a fast general-purpose one.",
  ],
  [
    "Base64 makes data unreadable",
    "Base64 is an alphabet change with a published table. Treat anything Base64-encoded as plaintext that happens to look scrambled.",
  ],
  [
    "Encrypted passwords are safer than hashed ones",
    "The opposite. Encryption implies a key that can decrypt every password at once; a salted password hash has no such key to steal.",
  ],
  [
    "Salting a hash makes it slow enough for passwords",
    "Salt stops one precomputed table serving every user; it does nothing about speed. Slowness comes from a purpose-built function with a work factor, such as bcrypt, scrypt or Argon2.",
  ],
];

/** Salted hash demonstration: the same password under different salts. */
export function saltDemo(password, salts) {
  const list = (Array.isArray(salts) ? salts : []).map((salt) => String(salt));
  if (!password) return { error: "Enter a password to salt." };
  return {
    password,
    rows: list.map((salt) => ({
      salt,
      combined: `${salt}${password}`,
      digest: sha256Hex(`${salt}${password}`),
    })),
  };
}
