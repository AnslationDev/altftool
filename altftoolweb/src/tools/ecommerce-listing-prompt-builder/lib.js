/**
 * Builds a structured prompt for writing an ecommerce product listing, and
 * checks the brief against the field limits a generic storefront / product feed
 * actually enforces.
 *
 * Limits used here come from Google Merchant Center product data specification
 * (the common denominator for Shopping feeds, and the strictest of the generic
 * marketplace rules) plus the well-known search-result truncation points.
 */

/** Google Merchant Center: the `title` attribute accepts up to 150 characters. */
export const TITLE_MAX_CHARS = 150;

/** Google Merchant Center: the `description` attribute accepts up to 5000 characters. */
export const DESCRIPTION_MAX_CHARS = 5000;

/**
 * Google typically renders about the first 60 characters of a title link before
 * truncating, so the buying decision has to fit inside that window.
 */
export const TITLE_VISIBLE_CHARS = 60;

/** Meta descriptions are commonly truncated around 155-160 characters on desktop. */
export const META_DESCRIPTION_SAFE_CHARS = 155;

/** Most storefront templates render five feature bullets above the fold. */
export const DEFAULT_BULLETS = 5;
export const MAX_BULLETS = 10;
export const MIN_BULLETS = 3;

/** Practical ceiling on keyword count — beyond this a listing reads as stuffed. */
export const MAX_KEYWORDS = 20;

export const TONES = [
  "Plain and factual",
  "Warm and conversational",
  "Premium and understated",
  "Energetic and punchy",
  "Technical and spec-led",
];

export const AUDIENCE_HINTS = [
  "First-time buyer comparing options",
  "Repeat buyer who knows the category",
  "Gift buyer shopping for someone else",
  "Professional buying for work",
  "Price-sensitive bargain hunter",
];

/** Split a textarea or comma list into clean, de-duplicated items. */
export function parseList(raw, { limit = 50 } = {}) {
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
 * Spread keywords across the listing sections so the same phrase is not repeated
 * in every field. The first keyword is treated as primary and is assigned to the
 * title; the rest are dealt round-robin to bullets and description.
 */
export function allocateKeywords(keywords, bulletCount = DEFAULT_BULLETS) {
  const allocation = { title: [], bullets: [], description: [] };
  if (!Array.isArray(keywords) || keywords.length === 0) return allocation;

  allocation.title.push(keywords[0]);
  const rest = keywords.slice(1);
  // Bullets get at most one keyword each; whatever is left goes to the description.
  const bulletShare = Math.min(rest.length, Math.max(0, bulletCount));
  allocation.bullets = rest.slice(0, bulletShare);
  allocation.description = rest.slice(bulletShare);
  return allocation;
}

const bullet = (index) => `${index + 1}.`;

function section(title, lines) {
  const body = lines.filter(Boolean).join("\n");
  return body ? `${title}\n${body}` : "";
}

/**
 * @param {object} input
 * @returns {object} Either { error } or { prompt, allocation, stats, warnings }.
 */
export function buildListingPrompt({
  productName = "",
  category = "",
  brand = "",
  price = "",
  audience = "",
  tone = TONES[0],
  attributesRaw = "",
  benefitsRaw = "",
  keywordsRaw = "",
  bulletCount = DEFAULT_BULLETS,
  titleTarget = TITLE_VISIBLE_CHARS,
  descriptionWords = 120,
  includeMeta = true,
  includeFaq = false,
} = {}) {
  const name = String(productName).trim();
  if (!name) return { error: "Enter the product name — every other field hangs off it." };

  const attributes = parseList(attributesRaw);
  const benefits = parseList(benefitsRaw);
  const keywords = parseList(keywordsRaw, { limit: MAX_KEYWORDS + 1 });

  if (attributes.length === 0) {
    return { error: "Add at least one product attribute (size, material, capacity, compatibility)." };
  }
  if (!Number.isFinite(bulletCount) || bulletCount < MIN_BULLETS || bulletCount > MAX_BULLETS) {
    return { error: `Bullet count must be between ${MIN_BULLETS} and ${MAX_BULLETS}.` };
  }
  if (!Number.isFinite(titleTarget) || titleTarget < 20 || titleTarget > TITLE_MAX_CHARS) {
    return { error: `Title target must be between 20 and ${TITLE_MAX_CHARS} characters.` };
  }
  if (!Number.isFinite(descriptionWords) || descriptionWords < 40 || descriptionWords > 800) {
    return { error: "Description length must be between 40 and 800 words." };
  }

  const wholeBullets = Math.round(bulletCount);
  const allocation = allocateKeywords(keywords, wholeBullets);

  const warnings = [];
  if (keywords.length === 0) {
    warnings.push("No keywords supplied — the model will invent its own, which rarely matches your search data.");
  }
  if (keywords.length > MAX_KEYWORDS) {
    warnings.push(`Only the first ${MAX_KEYWORDS} keywords are used; more than that reads as keyword stuffing.`);
  }
  if (benefits.length === 0) {
    warnings.push("No benefits supplied — the copy will describe features without saying why they matter.");
  }
  if (benefits.length > 0 && benefits.length < wholeBullets) {
    warnings.push(`You asked for ${wholeBullets} bullets but gave ${benefits.length} benefits; the model will pad the rest from attributes.`);
  }
  if (titleTarget > TITLE_VISIBLE_CHARS) {
    warnings.push(`Titles longer than ${TITLE_VISIBLE_CHARS} characters are usually truncated in search results.`);
  }
  if (!String(audience).trim()) {
    warnings.push("No audience set — generic copy is the usual result.");
  }

  const usedKeywords = keywords.slice(0, MAX_KEYWORDS);

  const blocks = [
    section("ROLE", [
      "You are an ecommerce copywriter who writes listings that convert without overclaiming.",
    ]),
    section("PRODUCT", [
      `Name: ${name}`,
      category ? `Category: ${String(category).trim()}` : "",
      brand ? `Brand: ${String(brand).trim()}` : "",
      price ? `Price point: ${String(price).trim()}` : "",
      audience ? `Buyer: ${String(audience).trim()}` : "",
      `Tone: ${tone}`,
    ]),
    section(
      "ATTRIBUTES (use only these — do not invent specifications)",
      attributes.map((item, index) => `${bullet(index)} ${item}`),
    ),
    benefits.length
      ? section(
          "BENEFITS TO LEAD WITH",
          benefits.map((item, index) => `${bullet(index)} ${item}`),
        )
      : "",
    usedKeywords.length
      ? section("KEYWORD PLACEMENT", [
          allocation.title.length ? `Title must contain: ${allocation.title.join(", ")}` : "",
          allocation.bullets.length ? `Spread across bullets, one each: ${allocation.bullets.join(", ")}` : "",
          allocation.description.length ? `Work naturally into the description: ${allocation.description.join(", ")}` : "",
          "Never repeat a keyword more than twice in the whole listing.",
        ])
      : "",
    section("OUTPUT", [
      `1. TITLE — at most ${Math.round(titleTarget)} characters, hard limit ${TITLE_MAX_CHARS}. Put the product type and primary keyword in the first ${TITLE_VISIBLE_CHARS} characters.`,
      `2. BULLETS — exactly ${wholeBullets} bullets. Each starts with a two-to-four word bold label, then one sentence of plain benefit. No exclamation marks.`,
      `3. DESCRIPTION — about ${Math.round(descriptionWords)} words, hard limit ${DESCRIPTION_MAX_CHARS} characters, in short paragraphs.`,
      includeMeta ? `4. META DESCRIPTION — at most ${META_DESCRIPTION_SAFE_CHARS} characters, one sentence, includes the primary keyword.` : "",
      includeFaq ? "5. FAQ — three questions a buyer would ask before adding to cart, each answered in under 40 words." : "",
    ]),
    section("RULES", [
      "Use only the attributes given. If a fact is missing, write [CONFIRM] rather than guessing.",
      "No superlatives you cannot evidence: avoid 'best', 'world-class', '#1'.",
      "No medical, safety or legal claims.",
      "Write in second person to the buyer. Sentences under 22 words.",
      "Return each output section under its own heading, plain text, no markdown tables.",
    ]),
  ];

  const prompt = blocks.filter(Boolean).join("\n\n");

  const stats = {
    promptChars: prompt.length,
    promptWords: prompt.split(/\s+/).filter(Boolean).length,
    attributeCount: attributes.length,
    benefitCount: benefits.length,
    keywordCount: usedKeywords.length,
    bulletCount: wholeBullets,
    titleTarget: Math.round(titleTarget),
    titleHeadroom: TITLE_MAX_CHARS - Math.round(titleTarget),
  };

  return { prompt, allocation, attributes, benefits, keywords: usedKeywords, stats, warnings };
}

/** Character-limit reference table rendered alongside the prompt. */
export const FIELD_LIMITS = [
  ["Product title", `${TITLE_MAX_CHARS} characters`, "Google Merchant Center title attribute"],
  ["Title visible in search", `~${TITLE_VISIBLE_CHARS} characters`, "Typical Google result truncation"],
  ["Product description", `${DESCRIPTION_MAX_CHARS} characters`, "Google Merchant Center description attribute"],
  ["Meta description", `~${META_DESCRIPTION_SAFE_CHARS} characters`, "Common desktop truncation point"],
];
