

/**
 * Generates a SHA-256 hash from a string
 * @param {string} message - the combined fingerprint string
 * @returns {Promise<string>} - 64-character hex hash
 */
export async function hashString(message) {
  try {
    // Convert string to bytes (required by Web Crypto API)
    const encoder = new TextEncoder();
    const data = encoder.encode(message);

    // Generate SHA-256 hash
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);

    // Convert ArrayBuffer → hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");

    return hashHex;
  } catch (error) {
    // Fallback: simple hash if Web Crypto unavailable
    return simpleFallbackHash(message);
  }
}

/**
 * Combines all fingerprint signals into one string and hashes it
 * @param {Object} signals - 
 * @returns {Promise<string>} - 
 */
export async function generateFingerprintHash(signals) {
  // Combine all rawValues from each signal module
  const combined = [
    signals.canvas?.rawValue || "",
    signals.webgl?.rawValue || "",
    signals.audio?.rawValue || "",
    signals.fonts?.rawValue || "",
    signals.device?.rawValue || "",
    signals.browser?.rawValue || "",
    signals.screen?.rawValue || "",
    signals.storage?.rawValue || "",
    signals.media?.rawValue || "",
  ].join("|||"); // triple pipe separator to avoid collisions

  return await hashString(combined);
}


function simpleFallbackHash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}