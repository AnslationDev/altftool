/**
 * WebAuthn Ceremony Debugger — pure logic.
 *
 * Takes the JSON a browser produces for a WebAuthn registration
 * (navigator.credentials.create) or assertion (navigator.credentials.get) and
 * decodes it for real: base64url → bytes, CBOR → attestation object, the
 * authenticator data byte layout, the COSE public key, and the DER-encoded
 * ECDSA signature. It also verifies the rpIdHash by computing SHA-256 of a
 * candidate RP ID in pure JavaScript.
 *
 * No network, no clock, no randomness. Everything below is deterministic.
 */

/* ------------------------------------------------------------------ */
/* byte helpers                                                        */
/* ------------------------------------------------------------------ */

const B64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const B64_LOOKUP = (() => {
  const table = new Map();
  const standard = `${B64_CHARS}+/`;
  const url = `${B64_CHARS}-_`;
  for (let i = 0; i < 64; i += 1) {
    table.set(standard[i], i);
    table.set(url[i], i);
  }
  return table;
})();

/** Decode base64 or base64url text into bytes. Returns { error } on bad input. */
export function base64urlToBytes(input) {
  if (typeof input !== "string") return { error: "Expected a base64url string." };
  const clean = input.replace(/[\s\r\n]/g, "").replace(/=+$/, "");
  if (!clean.length) return { error: "Empty base64url value." };
  let bits = 0;
  let bitCount = 0;
  const out = [];
  for (const char of clean) {
    const value = B64_LOOKUP.get(char);
    if (value === undefined) {
      return { error: `"${char}" is not a base64url character. Expected A-Z a-z 0-9 - _ (or + /).` };
    }
    bits = (bits << 6) | value;
    bitCount += 6;
    if (bitCount >= 8) {
      bitCount -= 8;
      out.push((bits >> bitCount) & 0xff);
    }
  }
  if (clean.length % 4 === 1) return { error: "Truncated base64url: the length leaves a stray 6 bits." };
  return { bytes: Uint8Array.from(out) };
}

/** Encode bytes as base64url with no padding. */
export function bytesToBase64url(bytes) {
  const alphabet = `${B64_CHARS}-_`;
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = i + 1 < bytes.length ? bytes[i + 1] : null;
    const c = i + 2 < bytes.length ? bytes[i + 2] : null;
    out += alphabet[a >> 2];
    out += alphabet[((a & 0x03) << 4) | (b === null ? 0 : b >> 4)];
    if (b === null) break;
    out += alphabet[((b & 0x0f) << 2) | (c === null ? 0 : c >> 6)];
    if (c === null) break;
    out += alphabet[c & 0x3f];
  }
  return out;
}

export function bytesToHex(bytes) {
  let out = "";
  for (const byte of bytes) out += byte.toString(16).padStart(2, "0");
  return out;
}

/** Minimal UTF-8 decoder so the module stays free of platform globals. */
export function bytesToUtf8(bytes) {
  let out = "";
  let i = 0;
  while (i < bytes.length) {
    const byte = bytes[i];
    let codePoint;
    let extra;
    if (byte < 0x80) {
      codePoint = byte;
      extra = 0;
    } else if ((byte & 0xe0) === 0xc0) {
      codePoint = byte & 0x1f;
      extra = 1;
    } else if ((byte & 0xf0) === 0xe0) {
      codePoint = byte & 0x0f;
      extra = 2;
    } else if ((byte & 0xf8) === 0xf0) {
      codePoint = byte & 0x07;
      extra = 3;
    } else {
      return { error: `Invalid UTF-8 lead byte 0x${byte.toString(16)} at offset ${i}.` };
    }
    if (i + extra >= bytes.length) return { error: "Truncated UTF-8 sequence at the end of the buffer." };
    for (let k = 1; k <= extra; k += 1) {
      const next = bytes[i + k];
      if ((next & 0xc0) !== 0x80) return { error: `Invalid UTF-8 continuation byte at offset ${i + k}.` };
      codePoint = (codePoint << 6) | (next & 0x3f);
    }
    out += String.fromCodePoint(codePoint);
    i += extra + 1;
  }
  return { text: out };
}

export function bytesToUuid(bytes) {
  const hex = bytesToHex(bytes);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

/* ------------------------------------------------------------------ */
/* SHA-256 (FIPS 180-4), used to verify rpIdHash                        */
/* ------------------------------------------------------------------ */

const SHA_K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

const rotr = (value, shift) => ((value >>> shift) | (value << (32 - shift))) >>> 0;

/** SHA-256 over a byte array; returns a 32-byte Uint8Array. */
export function sha256(input) {
  const bytes = Uint8Array.from(input);
  const bitLength = bytes.length * 8;
  const padded = new Uint8Array(((bytes.length + 9 + 63) >> 6) << 6);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 8, Math.floor(bitLength / 0x100000000), false);
  view.setUint32(padded.length - 4, bitLength >>> 0, false);

  const h = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const w = new Uint32Array(64);

  for (let offset = 0; offset < padded.length; offset += 64) {
    for (let i = 0; i < 16; i += 1) w[i] = view.getUint32(offset + i * 4, false);
    for (let i = 16; i < 64; i += 1) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, hh] = h;
    for (let i = 0; i < 64; i += 1) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (hh + S1 + ch + SHA_K[i] + w[i]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;
      hh = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }
    h[0] = (h[0] + a) >>> 0;
    h[1] = (h[1] + b) >>> 0;
    h[2] = (h[2] + c) >>> 0;
    h[3] = (h[3] + d) >>> 0;
    h[4] = (h[4] + e) >>> 0;
    h[5] = (h[5] + f) >>> 0;
    h[6] = (h[6] + g) >>> 0;
    h[7] = (h[7] + hh) >>> 0;
  }

  const out = new Uint8Array(32);
  const outView = new DataView(out.buffer);
  for (let i = 0; i < 8; i += 1) outView.setUint32(i * 4, h[i], false);
  return out;
}

/* ------------------------------------------------------------------ */
/* CBOR (RFC 8949) — enough of it to read an attestation object         */
/* ------------------------------------------------------------------ */

function readCborLength(bytes, offset, additional) {
  if (additional < 24) return { value: additional, offset };
  if (additional === 24) {
    if (offset >= bytes.length) throw new Error("CBOR: truncated 1-byte length");
    return { value: bytes[offset], offset: offset + 1 };
  }
  if (additional === 25) {
    if (offset + 1 >= bytes.length) throw new Error("CBOR: truncated 2-byte length");
    return { value: (bytes[offset] << 8) | bytes[offset + 1], offset: offset + 2 };
  }
  if (additional === 26) {
    if (offset + 3 >= bytes.length) throw new Error("CBOR: truncated 4-byte length");
    const value = bytes[offset] * 0x1000000 + (bytes[offset + 1] << 16) + (bytes[offset + 2] << 8) + bytes[offset + 3];
    return { value, offset: offset + 4 };
  }
  if (additional === 27) {
    if (offset + 7 >= bytes.length) throw new Error("CBOR: truncated 8-byte length");
    let value = 0;
    for (let i = 0; i < 8; i += 1) value = value * 256 + bytes[offset + i];
    if (!Number.isSafeInteger(value)) throw new Error("CBOR: 64-bit value exceeds the safe integer range");
    return { value, offset: offset + 8 };
  }
  throw new Error(`CBOR: additional information ${additional} is reserved or indefinite-length, which is not used in WebAuthn structures`);
}

function decodeCborItem(bytes, offset) {
  if (offset >= bytes.length) throw new Error("CBOR: ran off the end of the buffer");
  const initial = bytes[offset];
  const major = initial >> 5;
  const additional = initial & 0x1f;
  let cursor = offset + 1;

  if (major === 0) {
    const read = readCborLength(bytes, cursor, additional);
    return { value: read.value, offset: read.offset };
  }
  if (major === 1) {
    const read = readCborLength(bytes, cursor, additional);
    return { value: -1 - read.value, offset: read.offset };
  }
  if (major === 2 || major === 3) {
    const read = readCborLength(bytes, cursor, additional);
    const end = read.offset + read.value;
    if (end > bytes.length) throw new Error("CBOR: string length runs past the end of the buffer");
    const slice = bytes.slice(read.offset, end);
    if (major === 2) return { value: slice, offset: end };
    const text = bytesToUtf8(slice);
    if (text.error) throw new Error(`CBOR: ${text.error}`);
    return { value: text.text, offset: end };
  }
  if (major === 4) {
    const read = readCborLength(bytes, cursor, additional);
    const items = [];
    cursor = read.offset;
    for (let i = 0; i < read.value; i += 1) {
      const item = decodeCborItem(bytes, cursor);
      items.push(item.value);
      cursor = item.offset;
    }
    return { value: items, offset: cursor };
  }
  if (major === 5) {
    const read = readCborLength(bytes, cursor, additional);
    const map = new Map();
    cursor = read.offset;
    for (let i = 0; i < read.value; i += 1) {
      const key = decodeCborItem(bytes, cursor);
      const value = decodeCborItem(bytes, key.offset);
      map.set(key.value, value.value);
      cursor = value.offset;
    }
    return { value: map, offset: cursor };
  }
  if (major === 6) {
    const read = readCborLength(bytes, cursor, additional);
    const inner = decodeCborItem(bytes, read.offset);
    return { value: inner.value, offset: inner.offset, tag: read.value };
  }
  if (additional === 20) return { value: false, offset: cursor };
  if (additional === 21) return { value: true, offset: cursor };
  if (additional === 22) return { value: null, offset: cursor };
  if (additional === 23) return { value: undefined, offset: cursor };
  throw new Error(`CBOR: simple value ${additional} is not supported here`);
}

/** Decode one CBOR item. Returns { value, bytesRead } or { error }. */
export function decodeCbor(bytes) {
  try {
    const result = decodeCborItem(bytes, 0);
    return { value: result.value, bytesRead: result.offset, trailing: bytes.length - result.offset };
  } catch (error) {
    return { error: error.message };
  }
}

/* ------------------------------------------------------------------ */
/* WebAuthn constants                                                   */
/* ------------------------------------------------------------------ */

export const COSE_ALGORITHMS = {
  "-7": { name: "ES256", detail: "ECDSA over P-256 with SHA-256. The algorithm every authenticator supports; make it the first entry in pubKeyCredParams." },
  "-8": { name: "EdDSA", detail: "Ed25519. Small, fast signatures, but some server crypto stacks still cannot verify them." },
  "-35": { name: "ES384", detail: "ECDSA over P-384 with SHA-384." },
  "-36": { name: "ES512", detail: "ECDSA over P-521 with SHA-512." },
  "-37": { name: "PS256", detail: "RSASSA-PSS with SHA-256." },
  "-38": { name: "PS384", detail: "RSASSA-PSS with SHA-384." },
  "-39": { name: "PS512", detail: "RSASSA-PSS with SHA-512." },
  "-47": { name: "ES256K", detail: "ECDSA over secp256k1 with SHA-256. Rare in WebAuthn." },
  "-257": { name: "RS256", detail: "RSASSA-PKCS1-v1_5 with SHA-256. Windows Hello uses this via TPM attestation; include it or Windows registrations fail." },
  "-258": { name: "RS384", detail: "RSASSA-PKCS1-v1_5 with SHA-384." },
  "-259": { name: "RS512", detail: "RSASSA-PKCS1-v1_5 with SHA-512." },
  "-65535": { name: "RS1", detail: "RSASSA-PKCS1-v1_5 with SHA-1. Deprecated; do not offer it." },
};

const COSE_KEY_TYPES = { 1: "OKP (Octet Key Pair)", 2: "EC2 (two-coordinate elliptic curve)", 3: "RSA", 4: "Symmetric" };
const COSE_CURVES = { 1: "P-256", 2: "P-384", 3: "P-521", 4: "X25519", 5: "X448", 6: "Ed25519", 7: "Ed448" };

export const ATTESTATION_FORMATS = {
  none: "No attestation. The authenticator says nothing about itself — this is what you get with attestation: 'none' and what most consumer flows should use.",
  packed: "The FIDO 2 generic format. attStmt carries alg and sig, plus an optional x5c certificate chain (or ecdaaKeyId in older authenticators).",
  tpm: "A TPM 2.0 quote. attStmt carries ver, alg, sig, x5c, certInfo and pubArea; Windows Hello with a discrete TPM produces this.",
  "android-key": "Android Keystore attestation. The x5c leaf certificate carries the key attestation extension describing how the key is protected.",
  "android-safetynet": "A SafetyNet JWS response. Deprecated by Google in favour of Play Integrity, and no longer issued by recent devices.",
  "fido-u2f": "A legacy U2F registration wrapped for WebAuthn. Signature and certificate follow the U2F raw message format, and the credential is not a discoverable one.",
  apple: "Apple Anonymous Attestation. The nonce is embedded in an extension of the leaf certificate in x5c.",
  "compound": "A container carrying more than one attestation statement, each in its own element.",
};

/** A short built-in AAGUID list. Anything else is reported as a raw value. */
export const KNOWN_AAGUIDS = {
  "00000000-0000-0000-0000-000000000000":
    "All zeros — no AAGUID was supplied. Normal when attestation is 'none', because the browser strips the real value.",
  "cb69481e-8ff7-4039-93ec-0a2729a154a8": "YubiKey 5 Series",
  "2fc0579f-8113-47ea-b116-bb5a8db9202a": "YubiKey 5 Series with NFC",
  "08987058-cadc-4b81-b6e1-30de50dcbe96": "Windows Hello Hardware Authenticator",
  "9ddd1817-af5a-4672-a2b9-3e3dd95000a9": "Windows Hello VBS Hardware Authenticator",
  "6028b017-b1d4-4c02-b4b3-afcdafc96bb2": "Windows Hello Software Authenticator",
  "adce0002-35bc-c60a-648b-0b25f1f05503": "Chrome on macOS, Touch ID platform authenticator",
  "fbfc3007-154e-4ecc-8c0b-6e020557d7bd": "iCloud Keychain (Apple passkeys)",
  "ea9b8d66-4d01-1d21-3ce4-b6b48cb575d4": "Google Password Manager",
  "b93fd961-f2e6-462f-b122-82002247de78": "Android (Play Services / SafetyNet attestation)",
};

export const CEREMONY_ERRORS = {
  NotAllowedError:
    "The catch-all. The browser deliberately refuses to say which of these happened, so an attacker cannot probe: the user cancelled or let it time out, the request was not triggered by a user gesture, the RP ID did not match the origin, no credential in allowCredentials was present, or the page was cross-origin without an allow=\"publickey-credentials-get\" permission policy.",
  InvalidStateError:
    "On create(): an authenticator that already holds a credential for this user was excluded by excludeCredentials, so it refused to make a second one. This is the one error you should treat as \"already registered\" rather than a failure.",
  SecurityError:
    "The RP ID is not a registrable domain suffix of the caller's origin, or the origin is not a secure context. Serving over https (or localhost) and matching rp.id to the page's domain fixes it.",
  NotSupportedError:
    "None of the algorithms in pubKeyCredParams is supported, or the parameter list was empty. Always offer ES256 (-7) and RS256 (-257).",
  ConstraintError:
    "The authenticator could not meet a requirement you set — most often residentKey: \"required\" on a device with no space for a discoverable credential, or userVerification: \"required\" on one with no PIN or biometric configured.",
  AbortError: "The AbortSignal passed in options was aborted, usually because your own code cancelled a conditional-UI request or a competing ceremony started.",
  TimeoutError: "The ceremony ran past its timeout. Note that browsers usually report a timeout as NotAllowedError instead, so seeing this one is unusual.",
  UnknownError: "The authenticator returned an error the platform could not classify. Often a hardware or driver-level failure; retry on another authenticator to isolate it.",
  NetworkError: "The hybrid (caBLE / cross-device) transport could not complete — the phone and the browser failed to meet over BLE and the tunnel service.",
  DataError: "A field in the options was structurally wrong, for example a challenge or user.id that was not a BufferSource.",
  EncodingError: "The browser could not encode a value in the request, typically a malformed base64url string that you decoded into a buffer incorrectly.",
  TypeError:
    "Thrown before the ceremony starts: a required field is missing or the wrong shape. user.id must be a BufferSource of 1 to 64 bytes, challenge must be a BufferSource, and rp.name and user.name are required.",
};

/* ------------------------------------------------------------------ */
/* structure parsers                                                    */
/* ------------------------------------------------------------------ */

export const FLAG_BITS = [
  ["UP", 0x01, "User Present — someone physically touched or otherwise interacted with the authenticator."],
  ["RFU1", 0x02, "Reserved bit 1. Must be zero."],
  ["UV", 0x04, "User Verified — a PIN, biometric or equivalent check succeeded on the authenticator."],
  ["BE", 0x08, "Backup Eligible — this credential may be synced or copied to other devices. Set once at creation and never changes."],
  ["BS", 0x10, "Backup State — the credential is currently backed up or synced somewhere else."],
  ["RFU2", 0x20, "Reserved bit 2. Must be zero."],
  ["AT", 0x40, "Attested credential data is included — the credential ID and public key follow the counter."],
  ["ED", 0x80, "Extension data is included — a CBOR map of authenticator extension outputs is appended."],
];

/** Parse a COSE_Key map into readable fields. */
export function parseCoseKey(map) {
  if (!(map instanceof Map)) return { error: "The credential public key is not a CBOR map." };
  const kty = map.get(1);
  const alg = map.get(3);
  const algorithm = COSE_ALGORITHMS[String(alg)] || null;
  const result = {
    keyType: COSE_KEY_TYPES[kty] || `unrecognised kty ${kty}`,
    ktyValue: kty,
    algValue: alg,
    algorithm: algorithm ? algorithm.name : `unrecognised alg ${alg}`,
    algorithmDetail: algorithm ? algorithm.detail : "Not a COSE algorithm identifier registered for WebAuthn.",
    fields: [],
  };
  if (kty === 2 || kty === 1) {
    const crv = map.get(-1);
    result.curve = COSE_CURVES[crv] || `unrecognised crv ${crv}`;
    const x = map.get(-2);
    const y = map.get(-3);
    if (x instanceof Uint8Array) result.fields.push(["x coordinate", `${x.length} bytes`]);
    if (y instanceof Uint8Array) result.fields.push(["y coordinate", `${y.length} bytes`]);
    result.fields.unshift(["curve", result.curve]);
  } else if (kty === 3) {
    const n = map.get(-1);
    const e = map.get(-2);
    if (n instanceof Uint8Array) {
      result.modulusBits = n.length * 8;
      result.fields.push(["modulus n", `${n.length} bytes (${n.length * 8} bit key)`]);
    }
    if (e instanceof Uint8Array) result.fields.push(["exponent e", `0x${bytesToHex(e)}`]);
  }
  return result;
}

/** Parse the authenticatorData byte string. */
export function parseAuthenticatorData(bytes) {
  if (!(bytes instanceof Uint8Array)) return { error: "authenticatorData is not a byte string." };
  if (bytes.length < 37) {
    return { error: `authenticatorData is ${bytes.length} bytes. The fixed part alone is 37: 32 rpIdHash + 1 flags + 4 signature counter.` };
  }
  const flagsByte = bytes[32];
  const flags = {};
  for (const [name, mask] of FLAG_BITS) flags[name] = (flagsByte & mask) !== 0;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const signCount = view.getUint32(33, false);

  const result = {
    totalLength: bytes.length,
    rpIdHash: bytesToHex(bytes.slice(0, 32)),
    flagsByte,
    flagsHex: `0x${flagsByte.toString(16).padStart(2, "0")}`,
    flags,
    signCount,
    attestedCredentialData: null,
    extensions: null,
    warnings: [],
  };

  let offset = 37;
  if (flags.AT) {
    if (bytes.length < offset + 18) {
      result.warnings.push("The AT flag is set but there are not enough bytes left for the AAGUID and credential ID length.");
      return result;
    }
    const aaguidBytes = bytes.slice(offset, offset + 16);
    offset += 16;
    const credentialIdLength = (bytes[offset] << 8) | bytes[offset + 1];
    offset += 2;
    if (offset + credentialIdLength > bytes.length) {
      result.warnings.push(`Credential ID length field says ${credentialIdLength} bytes but only ${bytes.length - offset} remain.`);
      return result;
    }
    const credentialId = bytes.slice(offset, offset + credentialIdLength);
    offset += credentialIdLength;
    const aaguid = bytesToUuid(aaguidBytes);
    const rest = bytes.slice(offset);
    const cose = decodeCbor(rest);
    result.attestedCredentialData = {
      aaguid,
      aaguidLabel: KNOWN_AAGUIDS[aaguid] || null,
      credentialIdLength,
      credentialId: bytesToBase64url(credentialId),
      credentialIdHex: bytesToHex(credentialId),
      publicKey: cose.error ? { error: cose.error } : parseCoseKey(cose.value),
      publicKeyBytes: cose.error ? 0 : cose.bytesRead,
    };
    if (credentialIdLength > 1023) {
      result.warnings.push(`Credential ID is ${credentialIdLength} bytes; WebAuthn caps it at 1023.`);
    }
    if (!cose.error) offset += cose.bytesRead;
  }

  if (flags.ED) {
    const extensionBytes = bytes.slice(offset);
    const decoded = decodeCbor(extensionBytes);
    result.extensions = decoded.error ? { error: decoded.error } : mapToPlain(decoded.value);
  } else if (offset < bytes.length) {
    result.warnings.push(`${bytes.length - offset} trailing byte(s) after the parsed structure, with no ED flag to explain them.`);
  }

  if (!flags.UP) result.warnings.push("UP is clear: the authenticator did not assert user presence. A relying party must reject this unless it deliberately requested a silent ceremony.");
  if (flags.BS && !flags.BE) result.warnings.push("BS is set without BE. That combination is invalid — a credential cannot be backed up unless it was backup eligible.");
  if (flags.RFU1 || flags.RFU2) result.warnings.push("A reserved flag bit is set; those must be zero.");
  return result;
}

function mapToPlain(value) {
  if (value instanceof Map) {
    const out = {};
    for (const [key, inner] of value) out[String(key)] = mapToPlain(inner);
    return out;
  }
  if (value instanceof Uint8Array) return `<${value.length} bytes: ${bytesToHex(value.slice(0, 16))}${value.length > 16 ? "…" : ""}>`;
  if (Array.isArray(value)) return value.map(mapToPlain);
  return value;
}

/** Parse a DER-encoded ECDSA signature into r and s. */
export function parseDerSignature(bytes) {
  if (!(bytes instanceof Uint8Array) || bytes.length < 8) {
    return { format: "raw", length: bytes ? bytes.length : 0, note: "Too short to be a DER SEQUENCE. Ed25519 signatures are a raw 64 bytes." };
  }
  if (bytes[0] !== 0x30) {
    return {
      format: "raw",
      length: bytes.length,
      note:
        bytes.length === 64
          ? "64 raw bytes with no DER wrapper — the shape of an Ed25519 signature, or of a WebCrypto P-256 signature in IEEE P1363 form."
          : "Not a DER SEQUENCE. RSA signatures are a raw block the size of the modulus (256 bytes for RS256 with a 2048-bit key).",
    };
  }
  let offset = 1;
  let seqLength = bytes[offset];
  offset += 1;
  if (seqLength & 0x80) {
    const lengthBytes = seqLength & 0x7f;
    if (lengthBytes > 2 || offset + lengthBytes > bytes.length) return { format: "der", error: "DER length field is malformed." };
    seqLength = 0;
    for (let i = 0; i < lengthBytes; i += 1) seqLength = (seqLength << 8) | bytes[offset + i];
    offset += lengthBytes;
  }
  const readInteger = () => {
    if (bytes[offset] !== 0x02) return { error: `Expected a DER INTEGER tag (0x02) at offset ${offset}, found 0x${(bytes[offset] || 0).toString(16)}.` };
    offset += 1;
    const length = bytes[offset];
    offset += 1;
    if (offset + length > bytes.length) return { error: "DER INTEGER runs past the end of the signature." };
    const value = bytes.slice(offset, offset + length);
    offset += length;
    return { value };
  };
  const r = readInteger();
  if (r.error) return { format: "der", error: r.error };
  const s = readInteger();
  if (s.error) return { format: "der", error: s.error };
  return {
    format: "der",
    length: bytes.length,
    sequenceLength: seqLength,
    r: bytesToHex(r.value),
    s: bytesToHex(s.value),
    rBytes: r.value.length,
    sBytes: s.value.length,
    note: "DER SEQUENCE of two INTEGERs — the encoding an ECDSA (ES256) WebAuthn signature uses. A leading 00 byte on r or s is DER's sign padding, not part of the value.",
  };
}

/* ------------------------------------------------------------------ */
/* main entry point                                                     */
/* ------------------------------------------------------------------ */

function hostnameOf(origin) {
  const match = String(origin || "").match(/^https?:\/\/([^:/?#]+)/i);
  return match ? match[1].toLowerCase() : null;
}

/**
 * @param {string} text     the pasted credential JSON, or a DOMException name
 * @param {{ expectedRpId?: string, expectedOrigin?: string }} options
 */
export function debugWebauthn(text, options) {
  const opts = options || {};
  if (typeof text !== "string" || !text.trim()) {
    return { error: "Paste the JSON your ceremony produced, or the name of the DOMException you got back." };
  }
  const trimmed = text.trim();

  let parsed = null;
  try {
    parsed = JSON.parse(trimmed);
  } catch (jsonError) {
    const named = Object.keys(CEREMONY_ERRORS).find((name) => new RegExp(`\\b${name}\\b`).test(trimmed));
    if (named) {
      return { kind: "error", errorName: named, explanation: CEREMONY_ERRORS[named], findings: [] };
    }
    return {
      error: `That is not valid JSON (${jsonError.message}). Paste the whole credential object — including the "response" property — or just the DOMException name such as NotAllowedError.`,
    };
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { error: "Expected a JSON object describing a PublicKeyCredential." };
  }

  const namedError = typeof parsed.name === "string" && CEREMONY_ERRORS[parsed.name] ? parsed.name : typeof parsed.error === "string" && CEREMONY_ERRORS[parsed.error] ? parsed.error : null;
  if (namedError) {
    return {
      kind: "error",
      errorName: namedError,
      explanation: CEREMONY_ERRORS[namedError],
      message: typeof parsed.message === "string" ? parsed.message : null,
      findings: [],
    };
  }

  const response = parsed.response;
  if (!response || typeof response !== "object") {
    return { error: 'No "response" property found. A PublicKeyCredential serialises to { id, rawId, type, response: { … } }.' };
  }

  const isRegistration = typeof response.attestationObject === "string";
  const isAssertion = typeof response.authenticatorData === "string";
  if (!isRegistration && !isAssertion) {
    return {
      error:
        'response contains neither "attestationObject" (registration) nor "authenticatorData" (assertion). Check that the fields survived whatever serialisation carried them to your server.',
    };
  }

  const findings = [];
  const addFinding = (severity, title, detail) => findings.push({ id: `${findings.length}-${title}`, severity, title, detail });
  const kind = isRegistration ? "registration" : "assertion";

  // --- clientDataJSON ---
  let clientData = null;
  if (typeof response.clientDataJSON !== "string") {
    addFinding("error", "clientDataJSON is missing", "Every WebAuthn response carries it; without it a server cannot bind the ceremony to a challenge or an origin.");
  } else {
    const decoded = base64urlToBytes(response.clientDataJSON);
    if (decoded.error) {
      addFinding("error", "clientDataJSON is not valid base64url", decoded.error);
    } else {
      const utf8 = bytesToUtf8(decoded.bytes);
      if (utf8.error) {
        addFinding("error", "clientDataJSON is not valid UTF-8", utf8.error);
      } else {
        let json = null;
        try {
          json = JSON.parse(utf8.text);
        } catch (parseError) {
          addFinding("error", "clientDataJSON does not contain JSON", parseError.message);
        }
        if (json) {
          const challengeBytes = typeof json.challenge === "string" ? base64urlToBytes(json.challenge) : { error: "challenge is missing or not a string" };
          clientData = {
            raw: utf8.text,
            byteLength: decoded.bytes.length,
            type: json.type,
            challenge: json.challenge,
            challengeByteLength: challengeBytes.error ? null : challengeBytes.bytes.length,
            challengeError: challengeBytes.error || null,
            origin: json.origin,
            crossOrigin: json.crossOrigin,
            topOrigin: json.topOrigin,
            extraKeys: Object.keys(json).filter((key) => !["type", "challenge", "origin", "crossOrigin", "topOrigin"].includes(key)),
          };
          const expectedType = isRegistration ? "webauthn.create" : "webauthn.get";
          if (json.type !== expectedType) {
            addFinding("error", `clientData.type is "${json.type}"`, `A ${kind} must carry "${expectedType}". A mismatch means the response was cross-wired between ceremonies, and a server that does not check this can have a registration replayed as a login.`);
          }
          if (challengeBytes.error) {
            addFinding("error", "Challenge could not be decoded", challengeBytes.error);
          } else if (challengeBytes.bytes.length < 16) {
            addFinding("warning", `Challenge is only ${challengeBytes.bytes.length} bytes`, "WebAuthn requires at least 16 bytes of cryptographically random challenge. Anything shorter is guessable enough to allow a replay.");
          }
          if (typeof json.origin === "string" && !/^https:\/\//i.test(json.origin) && !/^http:\/\/localhost(:\d+)?$/i.test(json.origin)) {
            addFinding("error", `Origin "${json.origin}" is not a secure context`, "WebAuthn only runs on https, or on http://localhost for development. Anything else should never have produced a credential.");
          }
          if (json.crossOrigin === true) {
            addFinding("warning", "crossOrigin is true", "The ceremony ran inside a cross-origin iframe. That is only permitted with an explicit permissions policy, and you should be certain you meant to allow it.");
          }
          if (typeof opts.expectedOrigin === "string" && opts.expectedOrigin.trim() && json.origin !== opts.expectedOrigin.trim()) {
            addFinding("error", "Origin does not match the expected value", `clientData says "${json.origin}", you expected "${opts.expectedOrigin.trim()}". Servers must compare these exactly — this check is what stops a look-alike site relaying a ceremony.`);
          }
        }
      }
    }
  }

  // --- authenticator data ---
  let authData = null;
  let attestation = null;

  if (isRegistration) {
    const attBytes = base64urlToBytes(response.attestationObject);
    if (attBytes.error) {
      addFinding("error", "attestationObject is not valid base64url", attBytes.error);
    } else {
      const cbor = decodeCbor(attBytes.bytes);
      if (cbor.error) {
        addFinding("error", "attestationObject is not valid CBOR", cbor.error);
      } else if (!(cbor.value instanceof Map)) {
        addFinding("error", "attestationObject is not a CBOR map", "It must decode to a map with the keys fmt, attStmt and authData.");
      } else {
        const fmt = cbor.value.get("fmt");
        const attStmt = cbor.value.get("attStmt");
        const rawAuthData = cbor.value.get("authData");
        attestation = {
          byteLength: attBytes.bytes.length,
          fmt,
          fmtDescription: ATTESTATION_FORMATS[fmt] || "Not one of the attestation formats in the WebAuthn registry.",
          attStmtKeys: attStmt instanceof Map ? [...attStmt.keys()].map(String) : [],
          details: [],
        };
        if (attStmt instanceof Map) {
          const alg = attStmt.get("alg");
          if (alg !== undefined) {
            const info = COSE_ALGORITHMS[String(alg)];
            attestation.details.push(["alg", `${alg}${info ? ` (${info.name})` : ""}`]);
          }
          const sig = attStmt.get("sig");
          if (sig instanceof Uint8Array) attestation.details.push(["sig", `${sig.length} bytes`]);
          const x5c = attStmt.get("x5c");
          if (Array.isArray(x5c)) {
            attestation.details.push(["x5c", `${x5c.length} certificate(s): ${x5c.map((cert) => `${cert instanceof Uint8Array ? cert.length : "?"} bytes`).join(", ")}`]);
            attestation.certificateCount = x5c.length;
          }
          const ver = attStmt.get("ver");
          if (ver !== undefined) attestation.details.push(["ver", String(ver)]);
          const response_ = attStmt.get("response");
          if (response_ instanceof Uint8Array) attestation.details.push(["response", `${response_.length} byte JWS`]);
        }
        if (fmt === "none" && attestation.attStmtKeys.length) {
          addFinding("warning", "fmt is none but attStmt is not empty", "With the none format the attestation statement must be an empty map.");
        }
        if (fmt === "android-safetynet") {
          addFinding("warning", "SafetyNet attestation", "Google deprecated SafetyNet in favour of Play Integrity, and new devices no longer produce it. Verification against Google's roots will start failing.");
        }
        if (rawAuthData instanceof Uint8Array) {
          authData = parseAuthenticatorData(rawAuthData);
        } else {
          addFinding("error", "attestationObject has no authData byte string", "The map must carry authData as a CBOR byte string.");
        }
      }
    }
  } else {
    const adBytes = base64urlToBytes(response.authenticatorData);
    if (adBytes.error) addFinding("error", "authenticatorData is not valid base64url", adBytes.error);
    else authData = parseAuthenticatorData(adBytes.bytes);
  }

  if (authData && authData.error) {
    addFinding("error", "authenticatorData could not be parsed", authData.error);
  } else if (authData) {
    for (const warning of authData.warnings) addFinding("warning", "Authenticator data", warning);
    if (isRegistration && !authData.flags.AT) {
      addFinding("error", "AT flag is clear on a registration", "A create() response must include attested credential data — without it there is no credential ID and no public key to store.");
    }
    if (isAssertion && authData.flags.AT) {
      addFinding("warning", "AT flag is set on an assertion", "Attested credential data in a get() response is unusual and most servers will ignore it.");
    }
    if (!authData.flags.UV) {
      addFinding("info", "UV is clear", "Only user presence was proven, not user verification. If you asked for userVerification: \"required\" you must reject this response; for a second factor after a password it is expected.");
    }
    if (authData.signCount === 0) {
      addFinding("info", "Signature counter is 0", "Passkeys and most platform authenticators do not implement a counter and always send 0. Only enforce a strictly increasing counter when the authenticator actually maintains one — otherwise you will lock out synced credentials.");
    }
    if (authData.flags.BE && !authData.flags.BS) {
      addFinding("info", "Backup eligible but not yet backed up", "The credential can be synced but currently exists on one device only. If you treat BE credentials as single-factor, note this can change on a later assertion.");
    }
  }

  // --- rpIdHash verification ---
  let rpIdCheck = null;
  const candidate = typeof opts.expectedRpId === "string" && opts.expectedRpId.trim()
    ? opts.expectedRpId.trim().toLowerCase()
    : clientData && clientData.origin
      ? hostnameOf(clientData.origin)
      : null;
  if (authData && !authData.error && candidate) {
    const bytes = [];
    for (const char of candidate) {
      const code = char.codePointAt(0);
      if (code < 0x80) bytes.push(code);
      else if (code < 0x800) bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
      else if (code < 0x10000) bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
      else bytes.push(0xf0 | (code >> 18), 0x80 | ((code >> 12) & 0x3f), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    }
    const computed = bytesToHex(sha256(Uint8Array.from(bytes)));
    rpIdCheck = { candidate, computed, actual: authData.rpIdHash, matches: computed === authData.rpIdHash };
    if (!rpIdCheck.matches) {
      addFinding(
        "error",
        `rpIdHash does not match SHA-256("${candidate}")`,
        `The authenticator signed over ${authData.rpIdHash}, while SHA-256 of "${candidate}" is ${computed}. Either the RP ID you are checking against is wrong, or this credential belongs to a different RP ID — usually a registration made under a bare domain being checked against a subdomain, or the other way round.`,
      );
    }
  }

  // --- assertion signature ---
  let signature = null;
  if (isAssertion) {
    if (typeof response.signature !== "string") {
      addFinding("error", "Assertion has no signature", "A get() response must carry the signature over authenticatorData || SHA-256(clientDataJSON).");
    } else {
      const sigBytes = base64urlToBytes(response.signature);
      if (sigBytes.error) addFinding("error", "signature is not valid base64url", sigBytes.error);
      else signature = parseDerSignature(sigBytes.bytes);
    }
    if (typeof response.userHandle === "string" && response.userHandle.length) {
      const handle = base64urlToBytes(response.userHandle);
      if (handle.error) {
        addFinding("warning", "userHandle is not valid base64url", handle.error);
      } else if (handle.bytes.length > 64) {
        addFinding("warning", `userHandle is ${handle.bytes.length} bytes`, "WebAuthn limits user.id to 64 bytes, so a handle longer than that should never have been registered.");
      }
    }
  }

  // --- credential envelope ---
  const credential = {
    id: typeof parsed.id === "string" ? parsed.id : null,
    rawIdMatchesId: typeof parsed.id === "string" && typeof parsed.rawId === "string" ? parsed.id === parsed.rawId : null,
    type: parsed.type,
    authenticatorAttachment: parsed.authenticatorAttachment || response.authenticatorAttachment || null,
    transports: Array.isArray(response.transports) ? response.transports : null,
    publicKeyAlgorithm: typeof response.publicKeyAlgorithm === "number" ? response.publicKeyAlgorithm : null,
    clientExtensionResults: parsed.clientExtensionResults && typeof parsed.clientExtensionResults === "object" ? parsed.clientExtensionResults : null,
    userHandle: typeof response.userHandle === "string" ? response.userHandle : null,
  };
  if (parsed.type !== undefined && parsed.type !== "public-key") {
    addFinding("error", `type is "${parsed.type}"`, 'The only credential type WebAuthn defines is "public-key".');
  }
  if (credential.rawIdMatchesId === false) {
    addFinding("warning", "id and rawId differ", "id is meant to be the base64url encoding of rawId. A mismatch usually means one of them was re-encoded on the way to the server.");
  }
  if (isRegistration && credential.transports === null) {
    addFinding("info", "No transports array", "getTransports() tells you how to reach this authenticator next time. Store it and put it in allowCredentials, or cross-device sign-in gets noticeably slower.");
  }
  if (credential.publicKeyAlgorithm !== null && authData && authData.attestedCredentialData && authData.attestedCredentialData.publicKey && authData.attestedCredentialData.publicKey.algValue !== undefined && credential.publicKeyAlgorithm !== authData.attestedCredentialData.publicKey.algValue) {
    addFinding("warning", "publicKeyAlgorithm disagrees with the COSE key", `The response says ${credential.publicKeyAlgorithm} but the key inside authData says ${authData.attestedCredentialData.publicKey.algValue}.`);
  }

  const counts = { error: 0, warning: 0, info: 0 };
  for (const finding of findings) counts[finding.severity] += 1;
  const order = { error: 0, warning: 1, info: 2 };
  findings.sort((a, b) => order[a.severity] - order[b.severity]);

  return { kind, credential, clientData, authData, attestation, rpIdCheck, signature, findings, counts };
}

/** Plain-text report for the copy button. */
export function formatReport(result) {
  if (!result || result.error) return "";
  if (result.kind === "error") {
    return `WEBAUTHN CEREMONY ERROR\n\n${result.errorName}\n${result.message ? `message: ${result.message}\n` : ""}\n${result.explanation}`;
  }
  const lines = [`WEBAUTHN ${result.kind.toUpperCase()} DECODE`];
  if (result.clientData) {
    lines.push("");
    lines.push("CLIENT DATA");
    lines.push(`  type        ${result.clientData.type}`);
    lines.push(`  origin      ${result.clientData.origin}`);
    lines.push(`  challenge   ${result.clientData.challenge} (${result.clientData.challengeByteLength} bytes)`);
    if (result.clientData.crossOrigin !== undefined) lines.push(`  crossOrigin ${result.clientData.crossOrigin}`);
  }
  if (result.authData && !result.authData.error) {
    lines.push("");
    lines.push("AUTHENTICATOR DATA");
    lines.push(`  length      ${result.authData.totalLength} bytes`);
    lines.push(`  rpIdHash    ${result.authData.rpIdHash}`);
    lines.push(`  flags       ${result.authData.flagsHex} = ${FLAG_BITS.filter(([name]) => result.authData.flags[name]).map(([name]) => name).join(" | ") || "none set"}`);
    lines.push(`  signCount   ${result.authData.signCount}`);
    if (result.authData.attestedCredentialData) {
      const acd = result.authData.attestedCredentialData;
      lines.push(`  aaguid      ${acd.aaguid}${acd.aaguidLabel ? ` (${acd.aaguidLabel})` : ""}`);
      lines.push(`  credId      ${acd.credentialId} (${acd.credentialIdLength} bytes)`);
      if (acd.publicKey && !acd.publicKey.error) {
        lines.push(`  key         ${acd.publicKey.keyType}, ${acd.publicKey.algorithm}${acd.publicKey.curve ? `, ${acd.publicKey.curve}` : ""}`);
      }
    }
  }
  if (result.rpIdCheck) {
    lines.push("");
    lines.push(`RP ID CHECK  SHA-256("${result.rpIdCheck.candidate}") = ${result.rpIdCheck.computed}`);
    lines.push(`             ${result.rpIdCheck.matches ? "matches the rpIdHash" : "DOES NOT match the rpIdHash"}`);
  }
  if (result.attestation) {
    lines.push("");
    lines.push(`ATTESTATION  fmt=${result.attestation.fmt}`);
    for (const [key, value] of result.attestation.details) lines.push(`             ${key}: ${value}`);
  }
  if (result.signature) {
    lines.push("");
    lines.push(`SIGNATURE    ${result.signature.format}${result.signature.length ? `, ${result.signature.length} bytes` : ""}`);
    if (result.signature.r) lines.push(`             r=${result.signature.r}`);
    if (result.signature.s) lines.push(`             s=${result.signature.s}`);
  }
  lines.push("");
  lines.push("FINDINGS");
  for (const finding of result.findings) {
    lines.push(`  [${finding.severity.toUpperCase()}] ${finding.title}`);
    lines.push(`      ${finding.detail}`);
  }
  lines.push("");
  lines.push("Decoded in the browser. Signature verification needs the stored public key and is not performed here.");
  return lines.join("\n");
}

/*
 * The two samples below are real, self-consistent ceremonies for RP ID
 * example.com: the attestation object is genuine CBOR, the COSE key holds a real
 * P-256 point, the rpIdHash is SHA-256("example.com"), and the assertion
 * signature is a real DER-encoded ECDSA signature over
 * authenticatorData || SHA-256(clientDataJSON).
 */
export const SAMPLE_REGISTRATION = `{
  "id": "AQIDBAUGBwgJCgsMDQ4PEA",
  "rawId": "AQIDBAUGBwgJCgsMDQ4PEA",
  "type": "public-key",
  "authenticatorAttachment": "platform",
  "clientExtensionResults": { "credProps": { "rk": true } },
  "response": {
    "clientDataJSON": "eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoiQVFJREJBVUdCd2dKQ2dzTURRNFBFQkVTRXhRVkZoY1lHUm9iSEIwZUh5QSIsIm9yaWdpbiI6Imh0dHBzOi8vZXhhbXBsZS5jb20iLCJjcm9zc09yaWdpbiI6ZmFsc2V9",
    "attestationObject": "o2NmbXRkbm9uZWdhdHRTdG10oGhhdXRoRGF0YViUo3mm9u6vuaVeN4wRgDTidR5oL6ufLTCrE9ISVYbOGUddAAAAAK3OAAI1vMYKZIsLJfHwVQMAEAECAwQFBgcICQoLDA0ODxClAQIDJiABIVggT-LD1y7zC6v-vn-MZwKlE1mT-N99E2lfTz3epbEa-hkiWCBhTOdXuhTIPzAVxeHyZM3UIVOdjGSLrSW17n9CvBEOZQ",
    "transports": ["internal", "hybrid"],
    "publicKeyAlgorithm": -7
  }
}`;

export const SAMPLE_ASSERTION = `{
  "id": "AQIDBAUGBwgJCgsMDQ4PEA",
  "rawId": "AQIDBAUGBwgJCgsMDQ4PEA",
  "type": "public-key",
  "clientExtensionResults": {},
  "response": {
    "clientDataJSON": "eyJ0eXBlIjoid2ViYXV0aG4uZ2V0IiwiY2hhbGxlbmdlIjoiSUNFaUl5UWxKaWNvS1NvckxDMHVMekF4TWpNME5UWTNPRGs2T3p3OVBqOCIsIm9yaWdpbiI6Imh0dHBzOi8vZXhhbXBsZS5jb20iLCJjcm9zc09yaWdpbiI6ZmFsc2V9",
    "authenticatorData": "o3mm9u6vuaVeN4wRgDTidR5oL6ufLTCrE9ISVYbOGUcdAAAAAA",
    "signature": "MEQCID7n5MIbcY5YUknJuu76BmM5VddqqymotdzhoHnyNWrhAiA25IWd9ibliRkhIH0ijiQsSBX68kkk0MonPnS4WD5WQg",
    "userHandle": "dXNlci0xMjM"
  }
}`;
