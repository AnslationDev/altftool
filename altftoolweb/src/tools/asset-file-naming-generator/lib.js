/**
 * Asset File Naming Generator — cross-platform safe, lexicographically sortable
 * file names.
 *
 * Rules implemented (all real filesystem / OS constraints):
 *  - Windows forbids \ / : * ? " < > | and control characters 0x00-0x1F in a
 *    file name, and a name may not end with a space or a period.
 *  - Windows reserves the legacy device names CON, PRN, AUX, NUL, COM1-COM9 and
 *    LPT1-LPT9, with or without an extension.
 *  - NTFS, APFS and ext4 all cap a single path component at 255 characters.
 *  - ISO 8601 calendar dates (YYYY-MM-DD) sort lexicographically in
 *    chronological order, which is why they work well as a leading token.
 *  - Zero-padding a sequence number keeps 002 before 010 in an alphabetical
 *    file listing.
 *
 * Pure module — no React, no DOM, no clocks. Dates are passed in as strings.
 */

/** Characters Windows rejects outright in a file name (global, for replace). */
export const ILLEGAL_FILENAME_CHARS = /[\\/:*?"<>|]/g;

/** Non-global twin of the above, safe to use with .test(). */
export const ILLEGAL_FILENAME_CHARS_TEST = /[\\/:*?"<>|]/;

/** ASCII control characters (0x00-0x1F and DEL), unsafe in any file name. */
export const CONTROL_CHARS = new RegExp("[\\u0000-\\u001F\\u007F]", "g");

/** Legacy MS-DOS device names still reserved by Windows. */
export const WINDOWS_RESERVED_NAMES = [
  "CON", "PRN", "AUX", "NUL",
  "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9",
  "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9",
];

/** Maximum length of one path component on NTFS, APFS and ext4. */
export const MAX_FILENAME_LENGTH = 255;

/** Classic Windows full-path limit, worth staying well under. */
export const MAX_PATH_WINDOWS = 260;

/** Largest batch this tool will generate in one go. */
export const MAX_BATCH = 200;

export const SEPARATORS = [
  { id: "hyphen", label: "Hyphen — my-file", char: "-" },
  { id: "underscore", label: "Underscore — my_file", char: "_" },
  { id: "dot", label: "Dot — my.file", char: "." },
  { id: "none", label: "None — myfile", char: "" },
];

export const CASE_STYLES = [
  { id: "lower", label: "lowercase" },
  { id: "upper", label: "UPPERCASE" },
  { id: "title", label: "Title Case" },
  { id: "camel", label: "camelCase" },
  { id: "pascal", label: "PascalCase" },
];

export const DATE_FORMATS = [
  { id: "none", label: "No date" },
  { id: "iso", label: "2026-07-28 (ISO 8601)" },
  { id: "compact", label: "20260728" },
  { id: "yearMonth", label: "2026-07" },
  { id: "yearQuarter", label: "2026-Q3" },
];

export const DATE_POSITIONS = [
  { id: "prefix", label: "Start of the name (sorts by date)" },
  { id: "suffix", label: "End of the name (sorts by project)" },
];

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** Proleptic Gregorian leap-year rule. */
export function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/** Validate a "YYYY-MM-DD" string without constructing a Date. */
export function parseIsoDate(text) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(text ?? "").trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12) return null;
  const limit = month === 2 && isLeapYear(year) ? 29 : DAYS_IN_MONTH[month - 1];
  if (day < 1 || day > limit) return null;
  return { year, month, day };
}

const pad2 = (value) => String(value).padStart(2, "0");

/** Render a validated date in one of the supported token formats. */
export function formatDateToken(parts, format) {
  if (!parts || format === "none") return "";
  const { year, month, day } = parts;
  if (format === "iso") return `${year}-${pad2(month)}-${pad2(day)}`;
  if (format === "compact") return `${year}${pad2(month)}${pad2(day)}`;
  if (format === "yearMonth") return `${year}-${pad2(month)}`;
  if (format === "yearQuarter") return `${year}-Q${Math.ceil(month / 3)}`;
  return "";
}

/** Strip anything no filesystem should be asked to store, then split to words. */
export function tokenWords(raw) {
  return String(raw ?? "")
    .replace(CONTROL_CHARS, "")
    .replace(ILLEGAL_FILENAME_CHARS, " ")
    .replace(/[^0-9A-Za-z]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

const capitalise = (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();

/** Apply a case convention to one token's words, joining with `sep`. */
export function applyCase(words, caseStyle, sep) {
  if (words.length === 0) return "";
  if (caseStyle === "upper") return words.map((word) => word.toUpperCase()).join(sep);
  if (caseStyle === "title") return words.map(capitalise).join(sep);
  if (caseStyle === "pascal") return words.map(capitalise).join("");
  if (caseStyle === "camel") {
    return words.map((word, index) => (index === 0 ? word.toLowerCase() : capitalise(word))).join("");
  }
  return words.map((word) => word.toLowerCase()).join(sep);
}

function separatorChar(separatorId) {
  const found = SEPARATORS.find((entry) => entry.id === separatorId);
  return found ? found.char : "-";
}

/** Clean an extension: no dots, no illegal characters, lower case. */
export function normaliseExtension(raw) {
  return String(raw ?? "")
    .replace(CONTROL_CHARS, "")
    .replace(/[^0-9A-Za-z]/g, "")
    .toLowerCase();
}

/**
 * Build one file name.
 *
 * @param {object} config
 * @param {string[]} config.tokens        Free-text name parts, in order.
 * @param {string}   config.separator     One of SEPARATORS ids.
 * @param {string}   config.caseStyle     One of CASE_STYLES ids.
 * @param {string}   config.date          "YYYY-MM-DD" or "".
 * @param {string}   config.dateFormat    One of DATE_FORMATS ids.
 * @param {string}   config.datePosition  One of DATE_POSITIONS ids.
 * @param {number|null} config.sequence   Sequence number, or null for none.
 * @param {number}   config.sequencePad   Digits to pad the sequence to.
 * @param {string}   config.extension     File extension without the dot.
 * @returns {{name:string,base:string,length:number,warnings:string[]}|{error:string}}
 */
export function buildFileName({
  tokens = [],
  separator = "hyphen",
  caseStyle = "lower",
  date = "",
  dateFormat = "iso",
  datePosition = "prefix",
  sequence = null,
  sequencePad = 3,
  extension = "",
} = {}) {
  if (!Array.isArray(tokens)) return { error: "Name parts are missing." };
  if (!SEPARATORS.some((entry) => entry.id === separator)) {
    return { error: "Choose a valid separator." };
  }
  if (!CASE_STYLES.some((entry) => entry.id === caseStyle)) {
    return { error: "Choose a valid case style." };
  }
  if (!DATE_FORMATS.some((entry) => entry.id === dateFormat)) {
    return { error: "Choose a valid date format." };
  }
  if (!DATE_POSITIONS.some((entry) => entry.id === datePosition)) {
    return { error: "Choose where the date should sit in the name." };
  }
  if (sequence !== null) {
    if (typeof sequence !== "number" || !Number.isFinite(sequence)) {
      return { error: "Sequence start must be a number." };
    }
    if (!Number.isInteger(sequence)) return { error: "Sequence start must be a whole number." };
    if (sequence < 0) return { error: "Sequence start cannot be negative." };
  }
  if (
    typeof sequencePad !== "number" ||
    !Number.isInteger(sequencePad) ||
    sequencePad < 1 ||
    sequencePad > 10
  ) {
    return { error: "Sequence padding must be a whole number between 1 and 10." };
  }

  const trimmedDate = String(date ?? "").trim();
  let dateParts = null;
  if (dateFormat !== "none" && trimmedDate !== "") {
    dateParts = parseIsoDate(trimmedDate);
    if (!dateParts) return { error: "Enter a real calendar date as YYYY-MM-DD." };
  }

  const sep = separatorChar(separator);
  const warnings = [];

  const rawInput = tokens.join(" ");
  if (ILLEGAL_FILENAME_CHARS_TEST.test(rawInput)) {
    warnings.push('Removed characters Windows does not allow: \\ / : * ? " < > |');
  }

  const nameParts = [];
  const dateToken = formatDateToken(dateParts, dateFormat);
  if (dateToken && datePosition === "prefix") nameParts.push(dateToken);

  if (caseStyle === "camel" || caseStyle === "pascal") {
    // camelCase / PascalCase read as one continuous phrase, so the words from
    // every token are capitalised as a single stream rather than per token.
    const piece = applyCase(tokens.flatMap((token) => tokenWords(token)), caseStyle, sep);
    if (piece) nameParts.push(piece);
  } else {
    for (const token of tokens) {
      const piece = applyCase(tokenWords(token), caseStyle, sep);
      if (piece) nameParts.push(piece);
    }
  }

  if (dateToken && datePosition === "suffix") nameParts.push(dateToken);

  if (sequence !== null) nameParts.push(String(sequence).padStart(sequencePad, "0"));

  // Windows rejects a name that ends with a space or a period.
  let base = nameParts.join(sep).replace(/[ .]+$/, "");

  if (base === "") return { error: "Add at least one name part, a date or a sequence number." };

  if (WINDOWS_RESERVED_NAMES.includes(base.toUpperCase())) {
    warnings.push(`"${base}" is a reserved Windows device name — add another part.`);
  }

  const ext = normaliseExtension(extension);
  const suffix = ext ? `.${ext}` : "";

  if (base.length + suffix.length > MAX_FILENAME_LENGTH) {
    base = base.slice(0, MAX_FILENAME_LENGTH - suffix.length).replace(/[ .]+$/, "");
    warnings.push(`Trimmed to the ${MAX_FILENAME_LENGTH}-character filesystem limit.`);
  }

  const name = `${base}${suffix}`;
  if (name.length > MAX_PATH_WINDOWS - 60) {
    warnings.push(
      `Long name — nested folders may push the full path past the ${MAX_PATH_WINDOWS}-character Windows limit.`
    );
  }

  return { name, base, length: name.length, warnings };
}

/**
 * Build a numbered batch. A batch only makes sense with a sequence number, so
 * calling this without one is rejected rather than repeating the same name.
 */
export function buildBatch(config = {}, count = 5) {
  if (typeof count !== "number" || !Number.isInteger(count) || count < 1) {
    return { error: "Batch size must be a whole number of at least 1." };
  }
  if (count > MAX_BATCH) return { error: `Batch size cannot exceed ${MAX_BATCH}.` };
  if (config.sequence === null || config.sequence === undefined) {
    return { error: "Turn on the sequence number to generate a numbered batch." };
  }

  const names = [];
  for (let index = 0; index < count; index += 1) {
    const result = buildFileName({ ...config, sequence: config.sequence + index });
    if (result.error) return { error: result.error };
    names.push(result.name);
  }
  return { names };
}
