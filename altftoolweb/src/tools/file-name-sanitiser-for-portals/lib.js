/**
 * File name sanitiser for government-portal uploads.
 *
 * Target character set: the POSIX "portable filename character set"
 * (POSIX.1-2017, section 3.282) — A-Z a-z 0-9 dot hyphen underscore — which is
 * also the safest set for old Java/ASP portal validators, URLs and Windows.
 * Additional rules encoded:
 *  - Windows reserved device names (CON, PRN, AUX, NUL, COM1-9, LPT1-9) are
 *    invalid as a base name on Windows regardless of extension
 *    (Microsoft file-naming conventions), so they get a suffix.
 *  - A leading dot means a hidden file on Unix servers, so it is stripped.
 *  - Accented letters are transliterated by Unicode NFKD normalisation with
 *    combining marks removed (é -> e), rather than being deleted.
 */

/** POSIX.1-2017 §3.282 portable filename characters, as a regex of what is NOT allowed. */
const UNSAFE_CHARS = /[^A-Za-z0-9._-]/g;
/** Non-global twin for .test() — a /g regex keeps lastIndex state between tests. */
const HAS_UNSAFE_CHAR = /[^A-Za-z0-9._-]/;

/** Microsoft reserved device names — invalid base file names on Windows. */
export const WINDOWS_RESERVED = [
  "CON", "PRN", "AUX", "NUL",
  "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9",
  "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9",
];

export const REPLACEMENT_OPTIONS = [
  { id: "_", label: "Underscore _" },
  { id: "-", label: "Hyphen -" },
];

/** Default cap; many legacy portals truncate or reject names beyond ~100 chars. */
export const DEFAULT_MAX_LENGTH = 100;
export const MIN_MAX_LENGTH = 5;
export const MAX_MAX_LENGTH = 255; // common filesystem limit (bytes) for a single name

/** Strip diacritics: NFKD-decompose then drop Unicode combining marks (U+0300-U+036F). */
export function stripDiacritics(text) {
  if (typeof text !== "string") return "";
  return text.normalize("NFKD").replace(/[̀-ͯ]/g, "");
}

/**
 * Sanitise a file name.
 * @param {object} input
 * @param {string} input.name              The original file name (with extension).
 * @param {string} [input.replacement]     "_" or "-" (default "_").
 * @param {boolean} [input.lowercase]      Lowercase the whole name (default false; extension is always lowercased).
 * @param {number} [input.maxLength]       Max total length including extension (default 100).
 * @returns {object} { sanitized, changed, issues } or { error }
 */
export function sanitizeFileName({ name, replacement = "_", lowercase = false, maxLength = DEFAULT_MAX_LENGTH }) {
  if (typeof name !== "string" || name.trim() === "") {
    return { error: "Type or paste a file name first." };
  }
  if (!REPLACEMENT_OPTIONS.some((option) => option.id === replacement)) {
    return { error: "Replacement character must be an underscore or a hyphen." };
  }
  const cap = Number(maxLength);
  if (!Number.isInteger(cap) || cap < MIN_MAX_LENGTH || cap > MAX_MAX_LENGTH) {
    return { error: `Maximum length must be a whole number between ${MIN_MAX_LENGTH} and ${MAX_MAX_LENGTH}.` };
  }

  const original = name.trim();
  const issues = [];

  // Split off the extension at the LAST dot (dotless names are allowed).
  const lastDot = original.lastIndexOf(".");
  let base = lastDot > 0 ? original.slice(0, lastDot) : original;
  let extension = lastDot > 0 ? original.slice(lastDot + 1) : "";

  if (/\s/.test(original)) issues.push("Contains spaces — the most common cause of portal upload failures.");
  if (/[^\x20-\x7E]/.test(original)) issues.push("Contains accented or non-ASCII characters that legacy validators reject.");
  if (original !== stripDiacritics(original)) issues.push("Accented letters were transliterated to plain letters.");
  if (/^\./.test(original)) issues.push("Starts with a dot, which hides the file on Unix servers.");

  // Track whether a genuinely unsafe character (not just an accent that
  // transliterates away cleanly) was ever substituted with `replacement`.
  let unsafeCharsReplaced = false;
  const transform = (part) => {
    let value = stripDiacritics(part);
    if (HAS_UNSAFE_CHAR.test(value)) unsafeCharsReplaced = true;
    value = value.replace(UNSAFE_CHARS, replacement);
    return value;
  };

  base = transform(base);
  extension = transform(extension).replace(/[._-]/g, ""); // extension keeps letters/digits only

  if (unsafeCharsReplaced) {
    issues.push("Symbols outside A-Z, 0-9, dot, hyphen and underscore were replaced.");
  }

  // Collapse runs of separators and dots, whether they pre-existed in the
  // original name or were introduced by the replacement above — a portal is
  // just as likely to choke on ".." as on "__".
  const beforeCollapse = base;
  // Collapse runs of EITHER separator character, not just the one currently
  // selected as `replacement` — a name can contain both "_" and "-" runs
  // regardless of which one the user picked as their preferred separator.
  const runPattern = /[_-]{2,}/g;
  base = base
    .replace(/\.{2,}/g, ".")
    .replace(runPattern, replacement)
    .replace(new RegExp(`^[.${replacement}]+|[.${replacement}]+$`, "g"), "");
  if (base !== beforeCollapse) {
    issues.push("Repeated dots or separators were collapsed to a single character.");
  }

  if (base === "") {
    base = "file";
    issues.push("Nothing usable remained of the base name, so it became \"file\".");
  }

  if (lowercase) base = base.toLowerCase();
  extension = extension.toLowerCase();
  if (!lowercase && /[A-Z]/.test(original.slice(lastDot > 0 ? lastDot : original.length))) {
    issues.push("The extension was lowercased — case-sensitive validators expect lowercase extensions.");
  }

  // Truncate the BASE so the extension always survives — the extension itself
  // is never shortened, since a corrupted extension (e.g. ".jpe" instead of
  // ".jpeg") can fail a portal's exact-extension whitelist, which is worse
  // than a result that runs slightly over `cap`. If there isn't room for a
  // meaningful base name, fall back to a single character.
  let extensionPart = extension === "" ? "" : `.${extension}`;
  if (base.length + extensionPart.length > cap) {
    base = base.slice(0, Math.max(1, cap - extensionPart.length));
    base = base.replace(new RegExp(`[.${replacement}]+$`, "g"), "") || "file";
    issues.push(`The name was longer than ${cap} characters and was truncated.`);
  }

  // Windows reserved device names are invalid regardless of extension — checked on the
  // FINAL base, since truncation above can turn an otherwise-safe name into a reserved one.
  if (WINDOWS_RESERVED.includes(base.toUpperCase())) {
    if (base.length + replacement.length + extensionPart.length <= cap) {
      base = `${base}${replacement}`;
    } else {
      // No room to grow within the cap — swap the last character instead so the
      // total length never exceeds the cap the user asked for.
      base = `${base.slice(0, -1)}${replacement}`;
    }
    issues.push("The base name is a reserved Windows device name (e.g. CON, PRN) and was suffixed.");
  }

  const sanitized = `${base}${extensionPart}`;
  return {
    sanitized,
    original,
    changed: sanitized !== original,
    issues,
    length: sanitized.length,
  };
}
