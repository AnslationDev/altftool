/**
 * Course Video Naming Builder — pure naming logic.
 * No React, no JSX, no DOM. Deterministic: same input -> same output.
 */

/**
 * Longest single path component allowed by ext4, APFS, HFS+ and NTFS.
 * ext4/NTFS measure 255 bytes/UTF-16 units, so we measure UTF-8 bytes to stay safe.
 */
export const MAX_FILENAME_BYTES = 255;

/** Characters Windows forbids inside a file name, plus the ASCII control range. */
const ILLEGAL_CHAR_RE = /[<>:"/\\|?*\u0000-\u001F]/g;

/** Combining marks left behind after Unicode NFD normalisation (used to strip accents). */
const COMBINING_MARK_RE = /\p{M}/gu;

/**
 * MS-DOS device names that Windows still reserves: a file named CON.mp4 or LPT1.mp4
 * cannot be created even today. Comparison is case-insensitive and ignores the extension.
 */
export const RESERVED_WINDOWS_NAMES = [
  "CON",
  "PRN",
  "AUX",
  "NUL",
  ...Array.from({ length: 9 }, (_, i) => `COM${i + 1}`),
  ...Array.from({ length: 9 }, (_, i) => `LPT${i + 1}`),
];

/** Word joiner used for each supported case style. */
export const CASE_STYLES = [
  { id: "kebab", label: "kebab-case", joiner: "-" },
  { id: "snake", label: "snake_case", joiner: "_" },
  { id: "pascal", label: "PascalCase", joiner: "" },
];

/** Tokens a pattern may contain. */
export const PATTERN_TOKENS = [
  { token: "{course}", meaning: "Course code, slugified" },
  { token: "{mm}", meaning: "Module number, zero padded" },
  { token: "{module}", meaning: "Module title, slugified" },
  { token: "{ll}", meaning: "Lesson number within the module, zero padded" },
  { token: "{lesson}", meaning: "Lesson title, slugified" },
  { token: "{gg}", meaning: "Continuous lesson number across the whole course" },
];

export const DEFAULT_PATTERN = "{course}_M{mm}_L{ll}_{lesson}";

/** Padding must stay in a range that still sorts correctly and stays readable. */
export const MIN_PADDING = 1;
export const MAX_PADDING = 4;

const CASE_STYLE_IDS = CASE_STYLES.map((style) => style.id);

function joinerFor(caseStyle) {
  const found = CASE_STYLES.find((style) => style.id === caseStyle);
  return found ? found.joiner : "-";
}

/** UTF-8 byte length, which is what ext4 and APFS actually count. */
export function byteLength(text) {
  if (typeof text !== "string") return 0;
  if (typeof TextEncoder === "function") return new TextEncoder().encode(text).length;
  // Fallback: count code points widened to their UTF-8 size.
  let bytes = 0;
  for (const char of text) {
    const code = char.codePointAt(0);
    if (code < 0x80) bytes += 1;
    else if (code < 0x800) bytes += 2;
    else if (code < 0x10000) bytes += 3;
    else bytes += 4;
  }
  return bytes;
}

/** Split any human title into words, preserving non-Latin scripts (CJK, Cyrillic, Arabic, etc.). */
function words(text) {
  return String(text ?? "")
    .normalize("NFD")
    .replace(COMBINING_MARK_RE, "")
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

/** Turn a title into a file-name segment in the chosen case style. */
export function slugifySegment(text, caseStyle = "kebab") {
  const parts = words(text);
  if (parts.length === 0) return "";
  if (caseStyle === "pascal") {
    return parts.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join("");
  }
  return parts.map((word) => word.toLowerCase()).join(joinerFor(caseStyle));
}

/** Zero-pad a positive integer; never truncates a number that is already longer. */
export function padNumber(value, width) {
  const safeWidth = Math.max(MIN_PADDING, Math.min(MAX_PADDING, Math.round(width || 1)));
  return String(Math.trunc(value)).padStart(safeWidth, "0");
}

/**
 * Parse an indented outline into modules and lessons.
 * "Module: Title" (or a non-indented line) starts a module; a line beginning
 * with -, * or a digit is a lesson inside the current module.
 */
export function parseOutline(text) {
  const modules = [];
  const lines = String(text ?? "").split(/\r?\n/);
  for (const rawLine of lines) {
    if (!rawLine.trim()) continue;
    const isLesson = /^\s*(?:[-*•]|\d+[.)])\s+/.test(rawLine) || /^\s+\S/.test(rawLine);
    const cleaned = rawLine.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, "").replace(/^\s*module\s*:\s*/i, "").trim();
    if (!cleaned) continue;
    if (isLesson && modules.length === 0) {
      // A lesson line appeared before any module header — assume an implicit leading module
      // instead of silently treating the first lesson's text as a module title.
      modules.push({ title: "", lessons: [] });
      modules.implicitModule = true;
    }
    if (isLesson) {
      modules[modules.length - 1].lessons.push(cleaned);
    } else {
      modules.push({ title: cleaned, lessons: [] });
    }
  }
  return modules;
}

/** Trim a name to the byte budget without cutting a multi-byte character in half. */
function clampBytes(name, budget) {
  if (budget <= 0) return "";
  if (byteLength(name) <= budget) return name;
  let out = "";
  for (const char of name) {
    if (byteLength(out + char) > budget) break;
    out += char;
  }
  return out;
}

/** Strip forbidden characters and tidy up separator runs. */
function sanitize(name, joiner) {
  const sep = typeof joiner === "string" ? joiner : "-";
  let out = name.replace(ILLEGAL_CHAR_RE, "").replace(/\s+/g, sep);
  if (joiner) {
    const escaped = joiner.replace(/[.*+?^${}()|[\]\\-]/g, "\\$&");
    out = out.replace(new RegExp(`${escaped}{2,}`, "g"), joiner);
  }
  return out.replace(/^[-._\s]+|[-._\s]+$/g, "");
}

/**
 * Build one file name per lesson.
 *
 * @param {object} options
 * @param {string} options.courseCode        Short course identifier, e.g. "AI101".
 * @param {Array}  options.modules           [{ title, lessons: string[] }]
 * @param {string} options.pattern           Template using PATTERN_TOKENS.
 * @param {string} options.caseStyle         "kebab" | "snake" | "pascal"
 * @param {string} options.extension         File extension without the dot.
 * @param {number} options.numberPadding     1-4 digits.
 * @param {number} options.startModule       First module number (default 1).
 * @param {number} options.startLesson       First lesson number inside each module (default 1).
 * @returns {{error:string}|{files:Array,totalFiles:number,duplicates:string[],longestBytes:number,warningCount:number}}
 */
export function buildFileNames({
  courseCode = "",
  modules = [],
  pattern = DEFAULT_PATTERN,
  caseStyle = "kebab",
  extension = "mp4",
  numberPadding = 2,
  startModule = 1,
  startLesson = 1,
} = {}) {
  if (!CASE_STYLE_IDS.includes(caseStyle)) {
    return { error: `Case style must be one of: ${CASE_STYLE_IDS.join(", ")}.` };
  }
  if (typeof pattern !== "string" || !pattern.trim()) {
    return { error: "Enter a naming pattern, for example {course}_M{mm}_L{ll}_{lesson}." };
  }
  if (!Array.isArray(modules) || modules.length === 0) {
    return { error: "Add at least one module with one lesson." };
  }
  const lessonTotal = modules.reduce(
    (sum, mod) => sum + (Array.isArray(mod?.lessons) ? mod.lessons.length : 0),
    0,
  );
  if (lessonTotal === 0) {
    return { error: "Every module is empty — indent lesson titles under a module." };
  }
  if (lessonTotal > 2000) {
    return { error: "That is over 2,000 lessons. Split the course into smaller batches." };
  }
  const padding = Math.round(numberPadding);
  if (!Number.isFinite(padding) || padding < MIN_PADDING || padding > MAX_PADDING) {
    return { error: `Number padding must be between ${MIN_PADDING} and ${MAX_PADDING} digits.` };
  }
  const firstModule = Math.trunc(Number(startModule));
  const firstLesson = Math.trunc(Number(startLesson));
  if (!Number.isFinite(firstModule) || firstModule < 0 || !Number.isFinite(firstLesson) || firstLesson < 0) {
    return { error: "Start numbers must be zero or a positive whole number." };
  }

  const joiner = joinerFor(caseStyle);
  const ext = slugifySegment(String(extension ?? "").replace(/^\.+/, ""), "kebab").toLowerCase();
  const suffix = ext ? `.${ext}` : "";
  const courseSlug = slugifySegment(courseCode, caseStyle);
  const implicitModule = Boolean(modules.implicitModule);

  const files = [];
  const seen = new Map();
  const duplicates = [];
  let duplicateFileCount = 0;
  let globalIndex = firstLesson;
  let longestBytes = 0;
  let warningCount = 0;

  modules.forEach((mod, moduleIndex) => {
    const moduleNumber = firstModule + moduleIndex;
    const moduleSlug = slugifySegment(mod?.title, caseStyle);
    const lessons = Array.isArray(mod?.lessons) ? mod.lessons : [];

    lessons.forEach((lessonTitle, lessonIndex) => {
      const lessonNumber = firstLesson + lessonIndex;
      const lessonSlug = slugifySegment(lessonTitle, caseStyle);

      let base = pattern
        .replace(/\{course\}/g, courseSlug)
        .replace(/\{mm\}/g, padNumber(moduleNumber, padding))
        .replace(/\{module\}/g, moduleSlug)
        .replace(/\{ll\}/g, padNumber(lessonNumber, padding))
        .replace(/\{gg\}/g, padNumber(globalIndex, padding))
        .replace(/\{lesson\}/g, lessonSlug);

      base = sanitize(base, joiner);
      const warnings = [];

      if (implicitModule && moduleIndex === 0 && lessonIndex === 0) {
        warnings.push(
          "Outline started with a lesson before any module header — an implicit module was assumed.",
        );
      }

      if (!base) {
        base = `untitled${joiner || "-"}${padNumber(globalIndex, padding)}`;
        warnings.push("Pattern produced an empty name — a fallback name was used.");
      }

      const budget = MAX_FILENAME_BYTES - byteLength(suffix);
      if (byteLength(base) > budget) {
        base = clampBytes(base, budget).replace(/[-._]+$/, "");
        warnings.push(`Name exceeded the ${MAX_FILENAME_BYTES}-byte file-name limit and was trimmed.`);
      }

      if (RESERVED_WINDOWS_NAMES.includes(base.toUpperCase())) {
        warnings.push(`"${base}" is a reserved Windows device name — a suffix was added.`);
        base = `${base}${joiner || "-"}${padNumber(globalIndex, padding)}`;
      }

      let name = `${base}${suffix}`;
      if (byteLength(name) > MAX_FILENAME_BYTES) {
        // The base clamp above only accounts for a "normal" extension; an oversized
        // extension can still push the assembled name over budget (or a reserved-name
        // suffix can push a maxed-out base back over). Re-validate the final assembled
        // name and clamp it directly so the byte-limit guarantee always holds.
        name = clampBytes(name, MAX_FILENAME_BYTES);
        if (!warnings.some((warning) => warning.includes(`${MAX_FILENAME_BYTES}-byte file-name limit`))) {
          warnings.push(`Name exceeded the ${MAX_FILENAME_BYTES}-byte file-name limit and was trimmed.`);
        }
      }

      const key = name.toLowerCase();
      if (seen.has(key)) {
        warnings.push(`Duplicate of the name already used for lesson ${seen.get(key)}.`);
        duplicateFileCount += 1;
        if (!duplicates.includes(name)) duplicates.push(name);
      } else {
        seen.set(key, globalIndex);
      }

      const bytes = byteLength(name);
      if (bytes > longestBytes) longestBytes = bytes;
      warningCount += warnings.length;

      files.push({
        moduleNumber,
        moduleTitle: String(mod?.title ?? "").trim(),
        lessonNumber,
        globalNumber: globalIndex,
        lessonTitle: String(lessonTitle ?? "").trim(),
        name,
        bytes,
        warnings,
      });

      globalIndex += 1;
    });
  });

  return {
    files,
    totalFiles: files.length,
    moduleCount: modules.length,
    duplicates,
    duplicateFileCount,
    longestBytes,
    warningCount,
  };
}
