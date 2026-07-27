/**
 * Builds an Amazon listing brief and the backend search-term string that goes
 * with it.
 *
 * The limits below are the ones Amazon's seller style guidance applies to most
 * categories. Individual browse nodes publish their own style guide and can be
 * stricter, so these are treated as ceilings to design against, not promises.
 */

/** Title field: 200 characters in most categories; listings above it can be suppressed. */
export const TITLE_MAX_CHARS = 200;

/** Amazon's own guidance is to keep titles short; ~80 characters reads cleanly on mobile. */
export const TITLE_RECOMMENDED_CHARS = 80;

/** Standard listings show five bullets; some brand-registered categories allow more. */
export const BULLETS_STANDARD = 5;
export const BULLETS_MAX = 10;

/** Per-bullet ceiling commonly enforced; Amazon advises staying far below it. */
export const BULLET_MAX_CHARS = 500;
export const BULLET_RECOMMENDED_CHARS = 200;

/** Product description field accepts 2,000 characters. */
export const DESCRIPTION_MAX_CHARS = 2000;

/**
 * Backend "generic keyword" search terms are limited by BYTES, not characters —
 * 250 bytes. Accented and non-Latin characters therefore cost more than one.
 */
export const SEARCH_TERMS_MAX_BYTES = 250;

/** Main image guidance: pure white background, product filling ~85% of the frame. */
export const IMAGE_MIN_LONGEST_SIDE_PX = 1000;

/**
 * Words Amazon tells sellers to keep out of backend search terms because they
 * add no ranking value: they are already matched from other fields, or they are
 * subjective claims.
 */
export const SEARCH_TERM_STOPWORDS = [
  "a", "an", "the", "and", "or", "for", "with", "of", "in", "on", "to", "by",
  "best", "cheap", "new", "sale", "free", "amazing", "wow",
];

const encoder = typeof TextEncoder === "function" ? new TextEncoder() : null;

/** UTF-8 byte length of a string — the unit Amazon measures search terms in. */
export function byteLength(text) {
  const value = String(text ?? "");
  if (encoder) return encoder.encode(value).length;
  // Fallback for environments without TextEncoder: manual UTF-8 sizing.
  let bytes = 0;
  for (const char of value) {
    const code = char.codePointAt(0);
    if (code <= 0x7f) bytes += 1;
    else if (code <= 0x7ff) bytes += 2;
    else if (code <= 0xffff) bytes += 3;
    else bytes += 4;
  }
  return bytes;
}

/** Lowercase word tokens with punctuation stripped. */
export function tokenise(text) {
  return String(text ?? "")
    .toLowerCase()
    .split(/[^a-z0-9%+]+/i)
    .filter(Boolean);
}

/** Split a textarea or comma list into clean, de-duplicated phrases. */
export function parseList(raw, { limit = 60 } = {}) {
  if (typeof raw !== "string") return [];
  const seen = new Set();
  const items = [];
  for (const piece of raw.split(/[\n,;]+/)) {
    const value = piece.trim().replace(/\s+/g, " ");
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    items.push(value);
    if (items.length >= limit) break;
  }
  return items;
}

/**
 * Build the backend search-term string.
 *
 * Amazon's guidance: no repetition, no commas needed, do not repeat words that
 * already appear in the title or other listing fields, and stay inside 250 bytes.
 * This function therefore reduces phrases to unique words, drops words already
 * used in the title and drops stopwords, then packs as many as fit.
 */
export function buildSearchTerms({ keywordsRaw = "", title = "", limitBytes = SEARCH_TERMS_MAX_BYTES } = {}) {
  if (!Number.isFinite(limitBytes) || limitBytes <= 0) {
    return { error: "Search-term byte limit must be a positive number." };
  }

  const titleWords = new Set(tokenise(title));
  const stop = new Set(SEARCH_TERM_STOPWORDS);

  const kept = [];
  const droppedInTitle = [];
  const droppedStopword = [];
  const overflow = [];
  const seen = new Set();

  for (const phrase of parseList(keywordsRaw)) {
    for (const word of tokenise(phrase)) {
      if (seen.has(word)) continue;
      seen.add(word);
      if (stop.has(word)) {
        droppedStopword.push(word);
        continue;
      }
      if (titleWords.has(word)) {
        droppedInTitle.push(word);
        continue;
      }
      const candidate = kept.length ? `${kept.join(" ")} ${word}` : word;
      if (byteLength(candidate) > limitBytes) {
        overflow.push(word);
        continue;
      }
      kept.push(word);
    }
  }

  const terms = kept.join(" ");
  const bytes = byteLength(terms);
  return {
    terms,
    words: kept,
    bytes,
    limitBytes,
    bytesRemaining: limitBytes - bytes,
    droppedInTitle,
    droppedStopword,
    overflow,
  };
}

function section(heading, lines) {
  const body = lines.filter(Boolean).join("\n");
  return body ? `${heading}\n${body}` : "";
}

/**
 * @returns {object} Either { error } or { prompt, searchTerms, stats, warnings }.
 */
export function buildAmazonPrompt({
  productName = "",
  brand = "",
  category = "",
  audience = "",
  attributesRaw = "",
  benefitsRaw = "",
  keywordsRaw = "",
  bulletCount = BULLETS_STANDARD,
  titleTarget = TITLE_RECOMMENDED_CHARS,
  bulletTarget = BULLET_RECOMMENDED_CHARS,
  descriptionChars = 1200,
  includeAPlus = false,
} = {}) {
  const name = String(productName).trim();
  if (!name) return { error: "Enter the product name." };

  const attributes = parseList(attributesRaw);
  if (attributes.length === 0) {
    return { error: "Add at least one verified attribute — Amazon copy must not invent specifications." };
  }

  if (!Number.isFinite(bulletCount) || bulletCount < 3 || bulletCount > BULLETS_MAX) {
    return { error: `Bullet count must be between 3 and ${BULLETS_MAX}.` };
  }
  if (!Number.isFinite(titleTarget) || titleTarget < 20 || titleTarget > TITLE_MAX_CHARS) {
    return { error: `Title target must be between 20 and ${TITLE_MAX_CHARS} characters.` };
  }
  if (!Number.isFinite(bulletTarget) || bulletTarget < 40 || bulletTarget > BULLET_MAX_CHARS) {
    return { error: `Bullet target must be between 40 and ${BULLET_MAX_CHARS} characters.` };
  }
  if (!Number.isFinite(descriptionChars) || descriptionChars < 200 || descriptionChars > DESCRIPTION_MAX_CHARS) {
    return { error: `Description target must be between 200 and ${DESCRIPTION_MAX_CHARS} characters.` };
  }

  const benefits = parseList(benefitsRaw);
  const keywords = parseList(keywordsRaw);
  const wholeBullets = Math.round(bulletCount);
  const searchTerms = buildSearchTerms({ keywordsRaw, title: name });

  const warnings = [];
  if (titleTarget > TITLE_RECOMMENDED_CHARS) {
    warnings.push(`Amazon advises short titles; ${Math.round(titleTarget)} characters will wrap or truncate on mobile.`);
  }
  if (bulletTarget > BULLET_RECOMMENDED_CHARS) {
    warnings.push(`Bullets over ${BULLET_RECOMMENDED_CHARS} characters are collapsed behind "read more" on the app.`);
  }
  if (wholeBullets > BULLETS_STANDARD) {
    warnings.push(`Only ${BULLETS_STANDARD} bullets display on a standard listing; more than that needs Brand Registry in most categories.`);
  }
  if (keywords.length === 0) {
    warnings.push("No keywords supplied, so the backend search-term string will be empty.");
  }
  if (searchTerms.overflow && searchTerms.overflow.length > 0) {
    warnings.push(`${searchTerms.overflow.length} keyword word(s) did not fit inside ${SEARCH_TERMS_MAX_BYTES} bytes and were dropped.`);
  }
  if (benefits.length === 0) {
    warnings.push("No benefits supplied — bullets will restate features rather than outcomes.");
  }

  const blocks = [
    section("ROLE", [
      "You are an Amazon listing copywriter. Write to Amazon's style guidance: factual, benefit-led, no promotional language.",
    ]),
    section("PRODUCT", [
      `Name: ${name}`,
      brand ? `Brand: ${String(brand).trim()}` : "",
      category ? `Category: ${String(category).trim()}` : "",
      audience ? `Shopper: ${String(audience).trim()}` : "",
    ]),
    section(
      "VERIFIED ATTRIBUTES (the only facts you may state)",
      attributes.map((item, index) => `${index + 1}. ${item}`),
    ),
    benefits.length
      ? section(
          "BENEFITS TO SURFACE",
          benefits.map((item, index) => `${index + 1}. ${item}`),
        )
      : "",
    keywords.length
      ? section("KEYWORDS", [
          `Primary: ${keywords[0]}`,
          keywords.length > 1 ? `Secondary: ${keywords.slice(1).join(", ")}` : "",
          "Use the primary phrase once in the title and once in the first bullet. Do not repeat any phrase more than twice overall.",
        ])
      : "",
    section("OUTPUT", [
      `1. TITLE — target ${Math.round(titleTarget)} characters, hard limit ${TITLE_MAX_CHARS}. Order: Brand, product line, product type, key attribute, size or count. Numerals as digits. No ALL CAPS, no promotional words, no seller name.`,
      `2. BULLETS — exactly ${wholeBullets}, each under ${Math.round(bulletTarget)} characters (hard limit ${BULLET_MAX_CHARS}). Start each with a short capitalised label, then a benefit sentence tied to one attribute.`,
      `3. DESCRIPTION — about ${Math.round(descriptionChars)} characters, hard limit ${DESCRIPTION_MAX_CHARS}. Three short paragraphs: what it is, who it suits, what is in the box.`,
      includeAPlus
        ? "4. A+ MODULE OUTLINE — four module headings with a one-line caption each, describing an image concept per module. Do not write image alt text longer than 100 characters."
        : "",
    ]),
    section("HARD RULES (Amazon policy)", [
      "No price, promotion, discount, shipping or availability claims in the title or bullets.",
      "No contact details, URLs, review requests or references to other sellers.",
      "No medical, therapeutic or safety claims, and no comparative claims about named competitors.",
      "No subjective superlatives such as 'best seller', 'number one' or 'hot item'.",
      "If a fact is not in the attribute list above, write [CONFIRM] rather than inventing it.",
      `Main image guidance for reference: pure white background, product filling about 85% of the frame, longest side at least ${IMAGE_MIN_LONGEST_SIDE_PX}px so zoom works.`,
    ]),
  ];

  const prompt = blocks.filter(Boolean).join("\n\n");

  return {
    prompt,
    searchTerms,
    attributes,
    benefits,
    keywords,
    warnings,
    stats: {
      promptChars: prompt.length,
      promptWords: prompt.split(/\s+/).filter(Boolean).length,
      attributeCount: attributes.length,
      benefitCount: benefits.length,
      keywordCount: keywords.length,
      bulletCount: wholeBullets,
      titleTarget: Math.round(titleTarget),
      titleHeadroom: TITLE_MAX_CHARS - Math.round(titleTarget),
      bulletTarget: Math.round(bulletTarget),
      descriptionChars: Math.round(descriptionChars),
      totalBulletBudget: wholeBullets * Math.round(bulletTarget),
    },
  };
}

/** Reference table shown next to the prompt. */
export const AMAZON_FIELD_LIMITS = [
  ["Title", `${TITLE_MAX_CHARS} characters`, `Recommended under ${TITLE_RECOMMENDED_CHARS}`],
  ["Bullet point", `${BULLET_MAX_CHARS} characters`, `Recommended under ${BULLET_RECOMMENDED_CHARS}`],
  ["Bullets shown", `${BULLETS_STANDARD}`, `Up to ${BULLETS_MAX} with Brand Registry in some categories`],
  ["Product description", `${DESCRIPTION_MAX_CHARS} characters`, "Replaced by A+ content when available"],
  ["Backend search terms", `${SEARCH_TERMS_MAX_BYTES} bytes`, "Bytes, not characters — accents cost more"],
  ["Main image", `${IMAGE_MIN_LONGEST_SIDE_PX}px longest side`, "Pure white background, product fills ~85%"],
];
