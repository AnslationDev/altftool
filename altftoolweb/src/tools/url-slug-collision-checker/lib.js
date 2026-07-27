/**
 * Slug normalisation and collision detection.
 *
 * Rule sources:
 *
 *  - Unicode Standard Annex #15 defines NFKD, compatibility decomposition. Applying
 *    NFKD and then deleting the combining diacritical marks in U+0300..U+036F folds
 *    "é" to "e" and "ü" to "u". It does NOT handle characters that carry no
 *    decomposition of their own — ß, æ, ø, đ, ł, þ and the Cyrillic and Greek
 *    alphabets survive NFKD intact — so a transliteration table has to run first.
 *
 *  - RFC 3986 section 2.3 lists the unreserved characters that never need
 *    percent-encoding in a path: ALPHA, DIGIT, "-", ".", "_" and "~". A slug built
 *    from a-z, 0-9 and a single separator is therefore always safe unencoded.
 *
 *  - WordPress stores post_name in a VARCHAR(200) column and resolves a duplicate by
 *    appending "-2", then "-3", and so on, skipping any suffix already in use. That
 *    is the de facto convention this tool reproduces.
 *
 *  - A slug is compared case-insensitively here because most routers and most
 *    databases with a case-insensitive collation treat "My-Post" and "my-post" as the
 *    same URL, so two titles that differ only in case still collide.
 *
 * Every function is pure.
 */

/** WordPress post_name is VARCHAR(200); most CMSes truncate somewhere near this. */
export const DEFAULT_MAX_LENGTH = 200;

/** Below this a slug is too short to be useful; above 250 no common CMS accepts it. */
export const MIN_MAX_LENGTH = 8;
export const MAX_MAX_LENGTH = 250;

/** Keeps the UI and the loop bounded. */
export const MAX_TITLES = 500;

/**
 * Letters that NFKD leaves alone and that must be spelled out by hand. These are
 * substituted in place, with no word break, because they sit inside a word.
 * German ß expands to "ss", following the traditional uppercase mapping.
 */
export const LETTER_TRANSLITERATIONS = {
  ß: "ss",
  æ: "ae",
  Æ: "ae",
  œ: "oe",
  Œ: "oe",
  ø: "o",
  Ø: "o",
  đ: "d",
  Đ: "d",
  ð: "d",
  Ð: "d",
  þ: "th",
  Þ: "th",
  ł: "l",
  Ł: "l",
  ı: "i",
};

/**
 * Symbols that carry meaning worth keeping. These are substituted WITH surrounding
 * word breaks, so "R&D" becomes "r-and-d" rather than "randd".
 */
export const SYMBOL_WORDS = {
  "€": "eur",
  "£": "gbp",
  "₹": "inr",
  $: "usd",
  "&": "and",
  "@": "at",
  "%": "percent",
  "+": "plus",
};

/**
 * Path segments that commonly clash with framework routes or platform endpoints.
 * A post slugged "admin" or "api" will shadow or be shadowed by these.
 */
export const RESERVED_SLUGS = [
  "admin",
  "api",
  "assets",
  "auth",
  "blog",
  "cdn",
  "dashboard",
  "favicon-ico",
  "feed",
  "images",
  "login",
  "logout",
  "new",
  "null",
  "public",
  "register",
  "robots-txt",
  "rss",
  "search",
  "settings",
  "signin",
  "signup",
  "sitemap-xml",
  "static",
  "tag",
  "undefined",
  "user",
  "wp-admin",
];

/** Short English function words that add nothing to a slug's meaning. */
export const STOP_WORDS = [
  "a",
  "an",
  "and",
  "as",
  "at",
  "but",
  "by",
  "for",
  "from",
  "in",
  "into",
  "of",
  "on",
  "or",
  "the",
  "to",
  "with",
];

/** Combining Diacritical Marks, U+0300..U+036F — what NFKD splits an accent into. */
const COMBINING_MARKS = new RegExp("[\\u0300-\\u036f]", "g");

const applyTransliterations = (text) =>
  text.replace(/./gu, (char) => {
    if (char in SYMBOL_WORDS) return ` ${SYMBOL_WORDS[char]} `;
    if (char in LETTER_TRANSLITERATIONS) return LETTER_TRANSLITERATIONS[char];
    return char;
  });

/**
 * Normalise one title into a slug.
 *
 * @param {string} title
 * @param {{ separator?:string, maxLength?:number, stripStopWords?:boolean }} options
 * @returns {{ slug:string, truncated:boolean, empty:boolean, steps:Array<[string,string]> }}
 */
export function slugify(title, { separator = "-", maxLength = DEFAULT_MAX_LENGTH, stripStopWords = false } = {}) {
  const sep = separator === "_" ? "_" : "-";
  const limit = Number.isFinite(Number(maxLength))
    ? Math.min(MAX_MAX_LENGTH, Math.max(MIN_MAX_LENGTH, Math.floor(Number(maxLength))))
    : DEFAULT_MAX_LENGTH;

  const raw = String(title ?? "");
  const steps = [];

  const trimmed = raw.trim();
  steps.push(["Input", trimmed]);

  const transliterated = applyTransliterations(trimmed);
  if (transliterated !== trimmed) steps.push(["Transliterate", transliterated]);

  const folded = transliterated.normalize("NFKD").replace(COMBINING_MARKS, "");
  if (folded !== transliterated) steps.push(["NFKD, drop combining marks", folded]);

  const lowered = folded.toLowerCase();
  if (lowered !== folded) steps.push(["Lowercase", lowered]);

  // Anything outside a-z0-9 becomes the separator; runs collapse to one.
  let cleaned = lowered
    .replace(/[^a-z0-9]+/g, sep)
    .replace(sep === "-" ? /-+/g : /_+/g, sep);
  cleaned = cleaned.replace(sep === "-" ? /^-+|-+$/g : /^_+|_+$/g, "");
  steps.push(["Replace and collapse", cleaned]);

  if (stripStopWords) {
    const kept = cleaned
      .split(sep)
      .filter((part, index, all) => part.length > 0 && !(STOP_WORDS.includes(part) && all.length > 1));
    const withoutStopWords = kept.join(sep);
    if (withoutStopWords && withoutStopWords !== cleaned) {
      cleaned = withoutStopWords;
      steps.push(["Drop stop words", cleaned]);
    }
  }

  let truncated = false;
  if (cleaned.length > limit) {
    truncated = true;
    // Cut on a word boundary where one exists inside the limit, never mid-word.
    const cut = cleaned.slice(0, limit);
    const lastSep = cut.lastIndexOf(sep);
    cleaned = (lastSep > limit / 2 ? cut.slice(0, lastSep) : cut).replace(
      sep === "-" ? /-+$/g : /_+$/g,
      "",
    );
    steps.push([`Truncate to ${limit}`, cleaned]);
  }

  return { slug: cleaned, truncated, empty: cleaned.length === 0, steps };
}

/**
 * Append the first free numeric suffix, WordPress style: base, base-2, base-3 ...
 *
 * @param {string} base
 * @param {Set<string>} taken lowercase slugs already assigned
 * @param {string} separator
 * @param {number} maxLength
 * @returns {{ slug:string, suffix:number }}
 */
export function nextFreeSlug(base, taken, separator = "-", maxLength = DEFAULT_MAX_LENGTH) {
  const sep = separator === "_" ? "_" : "-";
  if (!taken.has(base)) return { slug: base, suffix: 0 };

  for (let n = 2; n <= MAX_TITLES + 1; n += 1) {
    const tail = `${sep}${n}`;
    // Trim the base so base + suffix still fits the column.
    const room = Math.max(1, maxLength - tail.length);
    const candidate = `${base.slice(0, room).replace(sep === "-" ? /-+$/ : /_+$/, "")}${tail}`;
    if (!taken.has(candidate)) return { slug: candidate, suffix: n };
  }
  return { slug: base, suffix: 0 };
}

/**
 * Run a whole list of titles and report collisions.
 *
 * @param {string[]} titles
 * @param {{ separator?:string, maxLength?:number, stripStopWords?:boolean }} options
 * @returns {object} report, or { error }
 */
export function checkSlugs(titles, options = {}) {
  if (!Array.isArray(titles)) {
    return { error: "Provide the titles as a list, one per line." };
  }
  const cleanTitles = titles.map((line) => String(line ?? "").trim()).filter((line) => line.length > 0);
  if (cleanTitles.length === 0) {
    return { error: "Add at least one title — put one per line." };
  }
  if (cleanTitles.length > MAX_TITLES) {
    return { error: `That is ${cleanTitles.length} titles; this checker handles up to ${MAX_TITLES} at a time.` };
  }

  const separator = options.separator === "_" ? "_" : "-";
  const requested = Number(options.maxLength);
  const maxLength = Number.isFinite(requested)
    ? Math.min(MAX_MAX_LENGTH, Math.max(MIN_MAX_LENGTH, Math.floor(requested)))
    : DEFAULT_MAX_LENGTH;

  const taken = new Set();
  const seenBase = new Map();
  const rows = [];

  cleanTitles.forEach((title, index) => {
    const { slug: base, truncated, empty } = slugify(title, {
      separator,
      maxLength,
      stripStopWords: Boolean(options.stripStopWords),
    });

    const issues = [];
    // An empty result cannot be a URL, so fall back to a positional slug.
    const usableBase = empty ? `untitled${separator}${index + 1}` : base;
    if (empty) {
      issues.push({
        level: "error",
        text: "Nothing survives normalisation — the title is entirely non-Latin script, punctuation or emoji. A fallback slug has been used.",
      });
    }
    if (truncated) {
      issues.push({
        level: "warning",
        text: `Longer than ${maxLength} characters, so it was cut at a word boundary. Two long titles that share an opening can end up identical after truncation.`,
      });
    }
    if (RESERVED_SLUGS.includes(usableBase)) {
      issues.push({
        level: "error",
        text: `"${usableBase}" is a reserved path that clashes with a framework route or platform endpoint. Rename it.`,
      });
    }
    if (/^\d+$/.test(usableBase)) {
      issues.push({
        level: "warning",
        text: "An all-numeric slug is often mistaken for a record id by a router that also matches /:id.",
      });
    }

    const firstIndex = seenBase.get(usableBase);
    const collides = firstIndex !== undefined;
    if (!collides) seenBase.set(usableBase, index);

    const { slug, suffix } = nextFreeSlug(usableBase, taken, separator, maxLength);
    taken.add(slug);

    if (collides) {
      issues.push({
        level: "error",
        text: `Collides with "${cleanTitles[firstIndex]}" on line ${firstIndex + 1}, which already took "${usableBase}".`,
      });
    }

    rows.push({
      index,
      line: index + 1,
      title,
      base: usableBase,
      slug,
      suffix,
      collides,
      collidesWithLine: collides ? firstIndex + 1 : null,
      truncated,
      empty,
      issues,
      length: slug.length,
    });
  });

  const groups = [];
  seenBase.forEach((_firstIndex, base) => {
    const members = rows.filter((row) => row.base === base);
    if (members.length > 1) groups.push({ base, members });
  });
  groups.sort((a, b) => b.members.length - a.members.length || a.base.localeCompare(b.base));

  const collisionCount = rows.filter((row) => row.collides).length;

  return {
    rows,
    groups,
    total: rows.length,
    uniqueBases: seenBase.size,
    collisionCount,
    errorCount: rows.filter((row) => row.issues.some((issue) => issue.level === "error")).length,
    warningCount: rows.filter((row) => row.issues.some((issue) => issue.level === "warning")).length,
    separator,
    maxLength,
  };
}

export default checkSlugs;
