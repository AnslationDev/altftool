/**
 * Brand asset naming convention builder.
 *
 * Filename rules enforced here come from published limits, not house style:
 *  - Portable Filename Character Set (IEEE Std 1003.1 / POSIX): A-Z a-z 0-9 . _ -
 *    Anything outside it is not guaranteed to survive a move between systems.
 *  - Windows forbids  < > : " / \ | ? *  and control characters 0x00-0x1F in a
 *    filename, and reserves the device names CON, PRN, AUX, NUL, COM1-COM9 and
 *    LPT1-LPT9 (with or without an extension).
 *  - NTFS, ext4 and APFS all cap a single path component at 255 bytes.
 *  - The legacy Windows MAX_PATH is 260 characters for the whole path.
 *  - An Amazon S3 object key is capped at 1024 bytes of UTF-8.
 *  - Dates use ISO 8601 so that a plain alphabetical sort is also a date sort.
 */

/** Single path component limit on NTFS, ext4 and APFS, in bytes. */
export const MAX_FILENAME_BYTES = 255;
/** Legacy Windows MAX_PATH, in characters, for the whole path. */
export const WINDOWS_MAX_PATH = 260;
/** Amazon S3 object key limit, in bytes of UTF-8. */
export const S3_KEY_MAX_BYTES = 1024;
/** Practical ceiling above which names stop being readable in a file list. */
export const READABLE_NAME_LIMIT = 80;

/** Characters Windows rejects in a filename. */
export const ILLEGAL_FILENAME_CHARS = /[<>:"/\\|?*\u0000-\u001F]/g;
/** IEEE Std 1003.1 Portable Filename Character Set. */
export const PORTABLE_FILENAME_RE = /^[A-Za-z0-9._-]+$/;

/** Windows reserved device names (case-insensitive, extension ignored). */
export const WINDOWS_RESERVED_NAMES = [
  "CON",
  "PRN",
  "AUX",
  "NUL",
  ...Array.from({ length: 9 }, (_, i) => `COM${i + 1}`),
  ...Array.from({ length: 9 }, (_, i) => `LPT${i + 1}`),
];

/** Tokens a naming pattern can be built from, in the order they are offered. */
export const TOKENS = [
  { key: "brand", label: "Brand", sample: "Northwind", hint: "Keep it identical everywhere, including sub-brands." },
  { key: "project", label: "Project or campaign", sample: "Spring Sale 2026", hint: "Campaign or project code, not a description." },
  { key: "assetType", label: "Asset type", sample: "logo", hint: "logo, banner, icon, hero, thumbnail, social." },
  { key: "descriptor", label: "Descriptor", sample: "primary lockup", hint: "What makes this file different from its siblings." },
  { key: "variant", label: "Variant", sample: "dark", hint: "light, dark, mono, inverse, outline." },
  { key: "colourMode", label: "Colour mode", sample: "rgb", hint: "rgb for screen, cmyk for print, pantone for spot." },
  { key: "dimensions", label: "Dimensions", sample: "1200x628", hint: "Width x height in pixels, or the print size." },
  { key: "locale", label: "Locale", sample: "en-GB", hint: "BCP 47 language tag for localised exports." },
  { key: "date", label: "Date", sample: "", hint: "ISO 8601 so alphabetical order is also date order." },
  { key: "version", label: "Version", sample: "", hint: "Zero-padded so v02 sorts before v10." },
];

/** Case styles applied after the tokens are joined. */
export const CASE_STYLES = [
  { key: "lower", label: "lowercase", note: "Safest: case-insensitive filesystems treat Logo and logo as the same file." },
  { key: "upper", label: "UPPERCASE", note: "Loud in file lists, but unambiguous in print workflows." },
  { key: "camel", label: "camelCase", note: "Compact, but hard to read once names get long." },
  { key: "pascal", label: "PascalCase", note: "Common in design tooling; still case-sensitive on Linux." },
  { key: "preserve", label: "Preserve input", note: "Risky — mixed case breaks matching on case-insensitive volumes." },
];

/** Separator between tokens. */
export const SEPARATORS = [
  { key: "-", label: "Hyphen ( - )", note: "Preferred for anything that may become a URL; search engines treat it as a word break." },
  { key: "_", label: "Underscore ( _ )", note: "Safe on every filesystem, but underlines can hide it in links." },
  { key: ".", label: "Dot ( . )", note: "Works, but confuses tools that split on the last dot to find the extension." },
];

/** ISO 8601 based date formats. */
export const DATE_FORMATS = [
  { key: "YYYYMMDD", label: "20260309 (ISO 8601 basic)" },
  { key: "YYYY-MM-DD", label: "2026-03-09 (ISO 8601 extended)" },
  { key: "YYYYMM", label: "202603 (month only)" },
  { key: "YYMMDD", label: "260309 (short)" },
];

const DIACRITIC_RE = /[\u0300-\u036f]/g;

/** Bytes a string occupies when encoded as UTF-8. */
export function utf8Bytes(text) {
  const value = String(text ?? "");
  if (typeof TextEncoder !== "undefined") return new TextEncoder().encode(value).length;
  return unescape(encodeURIComponent(value)).length;
}

/**
 * Reduce a free-text value to the portable filename character set.
 * Accents are folded (Café -> Cafe), everything else becomes the separator.
 */
export function slugToken(value, separator) {
  const sep = separator === "_" || separator === "." ? separator : "-";
  const folded = String(value ?? "")
    .normalize("NFD")
    .replace(DIACRITIC_RE, "")
    .replace(/&/g, " and ")
    .replace(/[^A-Za-z0-9]+/g, " ")
    .trim();
  if (!folded) return "";
  return folded.split(/\s+/).join(sep);
}

function applyCase(parts, caseStyle) {
  return parts.map((part, index) => {
    if (caseStyle === "lower") return part.toLowerCase();
    if (caseStyle === "upper") return part.toUpperCase();
    if (caseStyle === "preserve") return part;
    const words = part.split(/[-_.\s]+|(?=[A-Z])/).filter(Boolean);
    const titled = words
      .map((word, wordIndex) => {
        const lower = word.toLowerCase();
        if (caseStyle === "camel" && index === 0 && wordIndex === 0) return lower;
        return lower.charAt(0).toUpperCase() + lower.slice(1);
      })
      .join("");
    return titled;
  });
}

/**
 * Format an ISO date string (YYYY-MM-DD) into one of the supported patterns.
 * Pure: the date is always supplied by the caller, never read from the clock.
 */
export function formatDate(isoDate, format) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(isoDate ?? "").trim());
  if (!match) return { error: "Sample date must be in YYYY-MM-DD form." };
  const [, year, month, day] = match;
  const monthNum = Number(month);
  const dayNum = Number(day);
  if (monthNum < 1 || monthNum > 12) return { error: "Sample date has an impossible month." };
  if (dayNum < 1 || dayNum > 31) return { error: "Sample date has an impossible day." };
  if (format === "YYYY-MM-DD") return { value: `${year}-${month}-${day}` };
  if (format === "YYYYMM") return { value: `${year}${month}` };
  if (format === "YYMMDD") return { value: `${year.slice(2)}${month}${day}` };
  return { value: `${year}${month}${day}` };
}

/** Zero-pad a version number to the requested width. */
export function formatVersion(versionNumber, padWidth, prefix = "v") {
  const n = Math.trunc(Number(versionNumber));
  if (!Number.isFinite(n) || n < 0) return { error: "Version must be zero or a positive whole number." };
  const width = Math.min(4, Math.max(1, Math.trunc(Number(padWidth)) || 1));
  return { value: `${prefix}${String(n).padStart(width, "0")}` };
}

/**
 * Check a finished filename against the published filesystem limits.
 * @returns {{ chars:number, bytes:number, issues:string[], warnings:string[], portable:boolean }}
 */
export function validateFilename(filename, { folderPathLength = 0 } = {}) {
  const name = String(filename ?? "");
  const issues = [];
  const warnings = [];

  const illegal = Array.from(new Set(name.match(ILLEGAL_FILENAME_CHARS) || []));
  if (illegal.length) {
    issues.push(`Windows rejects these characters in a filename: ${illegal.join(" ")}`);
  }
  if (/\s/.test(name)) {
    warnings.push("Spaces force quoting in the shell and become %20 in URLs.");
  }
  const base = name.split(".")[0] || "";
  if (WINDOWS_RESERVED_NAMES.includes(base.toUpperCase())) {
    issues.push(`"${base}" is a reserved Windows device name and cannot be used, even with an extension.`);
  }
  if (name.endsWith(".") || name.endsWith(" ")) {
    issues.push("Windows silently strips a trailing dot or space from a filename.");
  }
  if (name.startsWith(".")) {
    warnings.push("A leading dot hides the file on macOS and Linux.");
  }

  const bytes = utf8Bytes(name);
  if (bytes > MAX_FILENAME_BYTES) {
    issues.push(`${bytes} bytes exceeds the 255-byte component limit on NTFS, ext4 and APFS.`);
  }
  const fullPath = Math.max(0, Math.trunc(Number(folderPathLength) || 0)) + name.length;
  if (fullPath > WINDOWS_MAX_PATH) {
    warnings.push(`Full path is ${fullPath} characters, over the legacy Windows MAX_PATH of 260.`);
  }
  if (bytes > S3_KEY_MAX_BYTES) {
    issues.push("Longer than the 1024-byte Amazon S3 object key limit.");
  }
  if (name.length > READABLE_NAME_LIMIT) {
    warnings.push(`${name.length} characters is long enough to be truncated in most file browsers.`);
  }

  const portable = PORTABLE_FILENAME_RE.test(name);
  if (!portable && !illegal.length) {
    warnings.push("Contains characters outside the POSIX portable filename set (A-Z a-z 0-9 . _ -).");
  }

  return { chars: name.length, bytes, issues, warnings, portable, fullPath };
}

/** Sample assets used to show the convention applied across a real export set. */
export const SAMPLE_ASSETS = [
  { assetType: "logo", descriptor: "primary lockup", variant: "dark", dimensions: "1024x256", extension: "svg" },
  { assetType: "logo", descriptor: "icon only", variant: "light", dimensions: "512x512", extension: "png" },
  { assetType: "social", descriptor: "launch post", variant: "square", dimensions: "1080x1080", extension: "jpg" },
  { assetType: "banner", descriptor: "homepage hero", variant: "dark", dimensions: "1920x640", extension: "webp" },
];

/**
 * Build the naming convention: pattern, worked examples and validation.
 *
 * @param {object} input
 * @param {string[]} input.order - token keys, in order
 * @param {object} input.values - sample values keyed by token key
 * @param {string} input.separator
 * @param {string} input.caseStyle
 * @param {string} input.dateFormat
 * @param {string} input.sampleDate - ISO YYYY-MM-DD
 * @param {number} input.version
 * @param {number} input.versionPad
 * @param {string} input.folder - sample folder path, used for the MAX_PATH check
 */
export function buildNamingConvention({
  order = [],
  values = {},
  separator = "-",
  caseStyle = "lower",
  dateFormat = "YYYYMMDD",
  sampleDate = "2026-03-09",
  version = 1,
  versionPad = 2,
  folder = "",
} = {}) {
  const activeKeys = order.filter((key) => TOKENS.some((token) => token.key === key));
  if (activeKeys.length === 0) {
    return { error: "Select at least one token to build a filename from." };
  }
  const sep = SEPARATORS.some((s) => s.key === separator) ? separator : "-";

  const dateResult = formatDate(sampleDate, dateFormat);
  if (dateResult.error && activeKeys.includes("date")) return { error: dateResult.error };
  const versionResult = formatVersion(version, versionPad);
  if (versionResult.error && activeKeys.includes("version")) return { error: versionResult.error };

  const resolve = (key, overrides = {}) => {
    if (key === "date") return dateResult.value || "";
    if (key === "version") return versionResult.value || "";
    const raw = overrides[key] ?? values[key] ?? "";
    return slugToken(raw, sep);
  };

  const compose = (overrides = {}) => {
    const parts = activeKeys.map((key) => resolve(key, overrides)).filter(Boolean);
    if (parts.length === 0) return "";
    return applyCase(parts, caseStyle).join(caseStyle === "camel" || caseStyle === "pascal" ? "" : sep);
  };

  const extension = slugToken(overridesExtension(values.extension), "-").toLowerCase() || "png";
  const primaryBase = compose();
  if (!primaryBase) {
    return { error: "Fill in at least one of the selected tokens so the filename is not empty." };
  }
  const primary = `${primaryBase}.${extension}`;

  const folderPath = String(folder ?? "").trim();
  const validation = validateFilename(primary, { folderPathLength: folderPath ? folderPath.length + 1 : 0 });

  const examples = SAMPLE_ASSETS.map((asset) => {
    const base = compose(asset);
    const file = base ? `${base}.${asset.extension}` : "";
    return { ...asset, filename: file, check: validateFilename(file, { folderPathLength: folderPath ? folderPath.length + 1 : 0 }) };
  }).filter((row) => row.filename);

  const pattern = `${activeKeys
    .map((key) => (key === "version" ? `v{nn}` : `{${key}}`))
    .join(caseStyle === "camel" || caseStyle === "pascal" ? "" : sep)}.{ext}`;

  const caseNote = CASE_STYLES.find((style) => style.key === caseStyle)?.note ?? "";
  const sepNote = SEPARATORS.find((style) => style.key === sep)?.note ?? "";

  const markdown = [
    "# Asset naming convention",
    "",
    `**Pattern:** \`${pattern}\``,
    "",
    `**Example:** \`${folderPath ? `${folderPath}/` : ""}${primary}\``,
    "",
    "## Rules",
    "",
    `1. Separator: \`${sep}\` — ${sepNote}`,
    `2. Case: ${CASE_STYLES.find((style) => style.key === caseStyle)?.label ?? caseStyle} — ${caseNote}`,
    `3. Dates use ISO 8601 (${dateFormat}) so alphabetical order is also chronological order.`,
    `4. Versions are zero-padded to ${Math.min(4, Math.max(1, Math.trunc(Number(versionPad)) || 1))} digits so v02 sorts before v10.`,
    "5. Use only A-Z, a-z, 0-9, dot, underscore and hyphen — the POSIX portable filename character set.",
    "6. Never use < > : \" / \\ | ? * or a trailing dot or space; Windows rejects or silently strips them.",
    "7. Keep the whole path under 260 characters and each filename under 255 bytes.",
    "",
    "## Token order",
    "",
    ...activeKeys.map((key, index) => {
      const token = TOKENS.find((t) => t.key === key);
      return `${index + 1}. **${token.label}** — ${token.hint}`;
    }),
    "",
    "## Worked examples",
    "",
    ...examples.map((row) => `- \`${row.filename}\``),
    "",
  ].join("\n");

  return {
    pattern,
    primary,
    primaryPath: folderPath ? `${folderPath}/${primary}` : primary,
    extension,
    separator: sep,
    sepNote,
    caseNote,
    activeKeys,
    validation,
    examples,
    markdown,
  };
}

function overridesExtension(value) {
  const raw = String(value ?? "").trim().replace(/^\./, "");
  return raw || "png";
}
