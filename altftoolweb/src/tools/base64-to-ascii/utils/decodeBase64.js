/**
 * Base64 → text decoding for the Base64-to-ASCII tool.
 *
 * Pure and dependency-free (uses only the standard `atob` + `TextDecoder`
 * globals, available in the browser and in Node ≥ 18), so the decode
 * behaviour is unit-testable without a DOM.
 */

// Standard + URL-safe Base64 alphabets both decode; whitespace is ignored.
const BASE64_RE = /^[A-Za-z0-9+/]*={0,2}$/;

/** Strip whitespace and fold URL-safe (`-` `_`) into standard (`+` `/`). */
export function normalizeBase64(input) {
  return (input || "")
    .replace(/\s+/g, "")
    .replace(/-/g, "+")
    .replace(/_/g, "/");
}

// Decode a SINGLE Base64 token (whitespace already stripped upstream is fine;
// we strip again defensively). Internal padding makes it invalid.
function decodeOneBlob(raw) {
  const s = normalizeBase64(raw);
  if (!s) return { ok: true, text: "", bytes: 0, empty: true };

  if (!BASE64_RE.test(s)) {
    return {
      ok: false,
      error: "This doesn't look like valid Base64 — check for stray characters.",
    };
  }

  const remainder = s.length % 4;
  if (remainder === 1) {
    return { ok: false, error: "Incomplete Base64 — the string length is invalid." };
  }
  const padded = remainder ? s + "=".repeat(4 - remainder) : s;

  try {
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    return { ok: true, text, bytes: bytes.length, empty: false };
  } catch {
    return { ok: false, error: "Could not decode this Base64 string." };
  }
}

/**
 * Decode Base64 into UTF-8 text.
 *
 * Two-pass so both common shapes work:
 *  1. The whole input as one blob — handles MIME/PEM base64 that's soft-wrapped
 *     across lines (stripping the newlines yields one valid string).
 *  2. If that fails and the input spans multiple lines, decode each line as an
 *     independent Base64 string and join the results with newlines — handles a
 *     list of separate encoded strings, each with its own padding.
 *
 * @returns {{ok: true, text: string, bytes: number, empty: boolean}
 *          | {ok: false, error: string}}
 */
export function decodeBase64ToText(input) {
  const trimmed = (input || "").trim();
  if (!trimmed) return { ok: true, text: "", bytes: 0, empty: true };

  const whole = decodeOneBlob(trimmed);
  if (whole.ok) return whole;

  if (/[\r\n]/.test(trimmed)) {
    const parts = trimmed.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (parts.length > 1) {
      const decoded = [];
      let bytes = 0;
      let allOk = true;
      for (const part of parts) {
        const d = decodeOneBlob(part);
        if (!d.ok) {
          allOk = false;
          break;
        }
        decoded.push(d.text);
        bytes += d.bytes;
      }
      if (allOk) {
        return { ok: true, text: decoded.join("\n"), bytes, empty: false };
      }
    }
  }

  return whole; // surface the original single-blob error
}

/** Encode text → Base64 (used only to build the built-in Sample Data). */
export function encodeTextToBase64(text) {
  const bytes = new TextEncoder().encode(text || "");
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}
