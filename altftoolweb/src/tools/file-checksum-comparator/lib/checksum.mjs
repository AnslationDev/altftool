export const ALGORITHMS = Object.freeze({
  "SHA-256": 64,
  "SHA-384": 96,
  "SHA-512": 128,
});

const PREFIX_PATTERN = /^(?:sha[-_\s]?(?:256|384|512)|checksum|hash)\s*[:=]\s*/i;

export function normalizeChecksum(value) {
  return String(value || "")
    .trim()
    .replace(PREFIX_PATTERN, "")
    .replace(/\s+/g, "")
    .toLowerCase();
}

export function inferAlgorithm(value) {
  const checksum = normalizeChecksum(value);
  const match = Object.entries(ALGORITHMS).find(([, length]) => length === checksum.length);
  return match?.[0] || null;
}

export function validateExpectedChecksum(value, algorithm = "auto") {
  const checksum = normalizeChecksum(value);
  if (!checksum) {
    return { ok: false, error: "Paste the checksum published by the file provider." };
  }
  if (!/^[a-f0-9]+$/.test(checksum)) {
    return { ok: false, error: "Checksums must contain hexadecimal characters only." };
  }

  const resolvedAlgorithm = algorithm === "auto" ? inferAlgorithm(checksum) : algorithm;
  if (!ALGORITHMS[resolvedAlgorithm]) {
    return {
      ok: false,
      error: "Could not infer the algorithm. Choose SHA-256, SHA-384, or SHA-512.",
    };
  }
  if (checksum.length !== ALGORITHMS[resolvedAlgorithm]) {
    return {
      ok: false,
      error: `${resolvedAlgorithm} checksums must contain ${ALGORITHMS[resolvedAlgorithm]} hexadecimal characters.`,
    };
  }

  return { ok: true, checksum, algorithm: resolvedAlgorithm };
}

export function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function digestFile(file, algorithm) {
  if (!file?.arrayBuffer) throw new TypeError("Choose a readable file.");
  if (!ALGORITHMS[algorithm]) throw new RangeError("Choose a supported SHA-2 algorithm.");
  if (!globalThis.crypto?.subtle) throw new Error("Web Crypto is unavailable in this browser.");

  const buffer = await file.arrayBuffer();
  const digest = await globalThis.crypto.subtle.digest(algorithm, buffer);
  return bytesToHex(new Uint8Array(digest));
}

export function compareChecksums(actual, expected) {
  const left = normalizeChecksum(actual);
  const right = normalizeChecksum(expected);
  if (!left || left.length !== right.length) return false;

  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}
