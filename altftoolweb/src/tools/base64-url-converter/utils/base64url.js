// Standard Base64 <-> URL-safe Base64 (RFC 4648 §5) conversion.
// URL-safe replaces "+" with "-" and "/" with "_", usually dropping "=" padding.

const BASE64_RE = /^[A-Za-z0-9+/]*={0,2}$/;
const BASE64_URL_RE = /^[A-Za-z0-9_-]*={0,2}$/;

// Whitespace/newlines are tolerated in pasted input and stripped before work.
export function normalizeInput(text) {
  return String(text ?? "").replace(/\s+/g, "");
}

export function validateBase64(text, { urlSafe = false } = {}) {
  const cleaned = normalizeInput(text);
  if (!cleaned) return { valid: false, message: "Input is empty" };
  const re = urlSafe ? BASE64_URL_RE : BASE64_RE;
  if (!re.test(cleaned)) {
    const kind = urlSafe ? "URL-safe Base64" : "Base64";
    const badChar = [...cleaned].find(
      (ch) => !(urlSafe ? /[A-Za-z0-9_=-]/ : /[A-Za-z0-9+/=]/).test(ch),
    );
    return {
      valid: false,
      message: badChar
        ? `"${badChar}" is not a valid ${kind} character`
        : `Not a valid ${kind} string`,
    };
  }
  if (cleaned.includes("=") && cleaned.indexOf("=") < cleaned.length - 2) {
    return { valid: false, message: "Padding (=) is only allowed at the end" };
  }
  // Un-padded length of 1 (mod 4) can never occur in real Base64 data.
  if ((cleaned.replace(/=+$/, "").length % 4) === 1) {
    return { valid: false, message: "Invalid Base64 length" };
  }
  return { valid: true, message: "" };
}

export function toUrlSafe(base64, { removePadding = true } = {}) {
  let output = normalizeInput(base64).replace(/\+/g, "-").replace(/\//g, "_");
  if (removePadding) output = output.replace(/=+$/, "");
  return output;
}

export function fromUrlSafe(urlSafe) {
  let output = normalizeInput(urlSafe).replace(/-/g, "+").replace(/_/g, "/").replace(/=+$/, "");
  while (output.length % 4 !== 0) output += "=";
  return output;
}

export function wrapLines(text, width = 76) {
  if (!text || width <= 0) return text;
  return text.replace(new RegExp(`(.{1,${width}})`, "g"), "$1\n").trimEnd();
}

// One-call conversion used by the page. direction "encode" = Base64 → URL-safe,
// "decode" = URL-safe → Base64. Returns { output, error }.
export function convert(input, { direction = "encode", removePadding = true, lineWrap = false, validate = true } = {}) {
  const cleaned = normalizeInput(input);
  if (!cleaned) return { output: "", error: "" };

  if (validate) {
    const check = validateBase64(cleaned, { urlSafe: direction === "decode" });
    if (!check.valid) return { output: "", error: check.message };
  }

  let output =
    direction === "encode" ? toUrlSafe(cleaned, { removePadding }) : fromUrlSafe(cleaned);
  if (lineWrap) output = wrapLines(output, 76);
  return { output, error: "" };
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function byteLength(text) {
  return new TextEncoder().encode(text || "").length;
}

// Verified standard-Base64 sample (decodes to a short JSON payload) that
// contains "+", "/" and padding so the conversion is visibly different.
export const SAMPLE_BASE64 = "eyJ0b29sIjoiQWx0RlRvb2wiLCJtc2ciOiJCYXNlNjQg4pyTIiwiYml0cyI6Ij4+P8O/w7s8In0=";
