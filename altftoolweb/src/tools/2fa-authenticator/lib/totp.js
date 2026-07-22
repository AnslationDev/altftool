// RFC 6238 (TOTP) / RFC 4226 (HOTP) engine.
// 100% client-side: uses the Web Crypto API. No secret ever leaves the browser.

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

const ALGORITHM_MAP = {
  SHA1: "SHA-1",
  SHA256: "SHA-256",
  SHA512: "SHA-512",
};

/**
 * Decode an RFC 4648 base32 string (the format authenticator secrets use)
 * into a byte array. Tolerates spaces, lowercase and padding.
 * @param {string} input
 * @returns {Uint8Array}
 */
export function base32Decode(input) {
  const clean = String(input || "")
    .toUpperCase()
    .replace(/=+$/, "")
    .replace(/[\s-]/g, "");

  if (!clean) return new Uint8Array(0);

  let bits = 0;
  let value = 0;
  const output = [];

  for (const char of clean) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) {
      throw new Error(`Invalid base32 character: "${char}"`);
    }
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      output.push((value >>> bits) & 0xff);
    }
  }

  return Uint8Array.from(output);
}

/** Validate a secret without throwing. */
export function isValidSecret(secret) {
  try {
    return base32Decode(secret).length > 0;
  } catch {
    return false;
  }
}

function counterToBytes(counter) {
  const buffer = new ArrayBuffer(8);
  new DataView(buffer).setBigUint64(0, BigInt(counter), false); // big-endian
  return new Uint8Array(buffer);
}

function getCrypto() {
  if (typeof globalThis !== "undefined" && globalThis.crypto?.subtle) {
    return globalThis.crypto;
  }
  throw new Error("Web Crypto API is not available in this environment.");
}

async function hmacSign(algorithm, keyBytes, messageBytes) {
  const subtleCrypto = getCrypto().subtle;
  const cryptoKey = await subtleCrypto.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: ALGORITHM_MAP[algorithm] || "SHA-1" },
    false,
    ["sign"],
  );
  const signature = await subtleCrypto.sign("HMAC", cryptoKey, messageBytes);
  return new Uint8Array(signature);
}

/**
 * Generate a TOTP code.
 * @param {object} options
 * @param {string} options.secret - base32 secret
 * @param {number} [options.digits=6]
 * @param {number} [options.period=30]
 * @param {"SHA1"|"SHA256"|"SHA512"} [options.algorithm="SHA1"]
 * @param {number} [options.timestamp=Date.now()] - milliseconds
 * @returns {Promise<string>} zero-padded code
 */
export async function generateTOTP({
  secret,
  digits = 6,
  period = 30,
  algorithm = "SHA1",
  timestamp = Date.now(),
}) {
  const keyBytes = base32Decode(secret);
  if (keyBytes.length === 0) {
    throw new Error("Secret key is empty or invalid.");
  }

  const counter = Math.floor(timestamp / 1000 / period);
  const hash = await hmacSign(algorithm, keyBytes, counterToBytes(counter));

  // RFC 4226 dynamic truncation
  const offset = hash[hash.length - 1] & 0x0f;
  const binary =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);

  const otp = binary % 10 ** digits;
  return otp.toString().padStart(digits, "0");
}

/** Seconds remaining in the current time step. */
export function secondsRemaining(period = 30, timestamp = Date.now()) {
  const step = Math.max(1, period);
  return step - (Math.floor(timestamp / 1000) % step);
}

/** Space-group a code for readability: 6 -> "483 921", 8 -> "4839 2100". */
export function formatCode(code) {
  if (!code) return "";
  const mid = Math.ceil(code.length / 2);
  return `${code.slice(0, mid)} ${code.slice(mid)}`.trim();
}

/**
 * Parse an otpauth:// URI (what authenticator QR codes encode).
 * @param {string} uri
 * @returns {{secret:string,label:string,issuer:string,algorithm:string,digits:number,period:number}|null}
 */
export function parseOtpAuthUri(uri) {
  try {
    const trimmed = String(uri || "").trim();
    if (!/^otpauth:\/\/totp\//i.test(trimmed)) return null;

    const url = new URL(trimmed);
    const params = url.searchParams;
    const secret = (params.get("secret") || "").replace(/\s/g, "");
    if (!secret) return null;

    const rawLabel = decodeURIComponent(url.pathname.replace(/^\/+/, ""));
    const [labelIssuer, labelAccount] = rawLabel.includes(":")
      ? rawLabel.split(":")
      : [null, rawLabel];

    const issuer = params.get("issuer") || labelIssuer || "";
    const algorithmRaw = (params.get("algorithm") || "SHA1").toUpperCase();
    const algorithm = ALGORITHM_MAP[algorithmRaw] ? algorithmRaw : "SHA1";

    return {
      secret,
      label: (labelAccount || rawLabel || "").trim(),
      issuer: issuer.trim(),
      algorithm,
      digits: Number(params.get("digits")) || 6,
      period: Number(params.get("period")) || 30,
    };
  } catch {
    return null;
  }
}

export const ALGORITHMS = ["SHA1", "SHA256", "SHA512"];
export const DIGIT_OPTIONS = [6, 8];
export const PERIOD_OPTIONS = [15, 30, 45, 60];
