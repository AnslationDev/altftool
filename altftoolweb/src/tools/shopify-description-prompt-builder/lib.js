/**
 * Builds a Shopify product description brief, and checks the SEO fields that sit
 * beside the description in the Shopify admin.
 *
 * Three different limits apply and they are frequently confused:
 *   - the product title field itself,
 *   - the "page title" (SEO title) counter in the Search engine listing editor,
 *   - the meta description, which Shopify accepts long but Google truncates short.
 */

/** Shopify product title field accepts up to 255 characters. */
export const PRODUCT_TITLE_MAX_CHARS = 255;

/** The Search engine listing editor counts the page title against 70 characters. */
export const SEO_TITLE_MAX_CHARS = 70;

/** The same editor allows a meta description of up to 320 characters. */
export const META_DESCRIPTION_FIELD_MAX = 320;

/** Google usually truncates a desktop meta description around 155-160 characters. */
export const META_DESCRIPTION_SERP_SAFE = 155;

/** Shopify handles are lowercase, hyphen separated, and share the 255-character field size. */
export const HANDLE_MAX_CHARS = 255;

export const BRAND_VOICE_TRAITS = [
  "Direct",
  "Warm",
  "Playful",
  "Understated",
  "Expert",
  "Irreverent",
  "Reassuring",
  "Minimal",
];

export const DESCRIPTION_STRUCTURES = [
  {
    id: "problem-solution",
    label: "Problem then solution",
    outline: [
      "One line naming the everyday annoyance this product removes",
      "How the product solves it, tied to a specific attribute",
      "Who it is for and who it is not for",
      "Specifications as a short list",
    ],
  },
  {
    id: "feature-benefit",
    label: "Feature to benefit pairs",
    outline: [
      "One-sentence summary of what the product is",
      "Three feature-and-benefit pairs, feature first",
      "What is in the box",
      "Care, sizing or compatibility notes",
    ],
  },
  {
    id: "story-led",
    label: "Story led",
    outline: [
      "Two sentences on why the product exists",
      "What changed in the design and why it matters",
      "Concrete details a buyer can check",
      "A closing line that states the use case, not a slogan",
    ],
  },
  {
    id: "spec-first",
    label: "Specification first",
    outline: [
      "Full specification table in plain text",
      "Two sentences on the trade-offs the specs imply",
      "Compatibility and what is not included",
      "One short line on the intended user",
    ],
  },
];

/**
 * Convert a product title into a Shopify URL handle: lowercase, non-alphanumeric
 * runs replaced by a single hyphen, no leading or trailing hyphen.
 */
export function buildHandle(title, { maxChars = HANDLE_MAX_CHARS } = {}) {
  const raw = String(title ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip combining accents left by NFKD
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!raw) return { handle: "", length: 0, truncated: false };
  const clipped = raw.slice(0, maxChars).replace(/-+$/g, "");
  return { handle: clipped, length: clipped.length, truncated: clipped.length < raw.length };
}

/** Assemble and measure the SEO page title. */
export function assessSeoTitle({ productTitle = "", brand = "", separator = " | " } = {}) {
  const base = String(productTitle).trim();
  if (!base) return { error: "Enter a product title first." };
  const suffix = String(brand).trim();
  const seoTitle = suffix ? `${base}${separator}${suffix}` : base;
  return {
    seoTitle,
    length: seoTitle.length,
    limit: SEO_TITLE_MAX_CHARS,
    remaining: SEO_TITLE_MAX_CHARS - seoTitle.length,
    withinLimit: seoTitle.length <= SEO_TITLE_MAX_CHARS,
  };
}

/** Measure a meta description against both the Shopify field and the search snippet. */
export function assessMetaDescription(text) {
  const value = String(text ?? "").trim();
  const length = value.length;
  return {
    length,
    fieldLimit: META_DESCRIPTION_FIELD_MAX,
    serpSafe: META_DESCRIPTION_SERP_SAFE,
    withinField: length <= META_DESCRIPTION_FIELD_MAX,
    withinSerp: length <= META_DESCRIPTION_SERP_SAFE,
    fieldRemaining: META_DESCRIPTION_FIELD_MAX - length,
    serpRemaining: META_DESCRIPTION_SERP_SAFE - length,
  };
}

/** Split a textarea or comma list into clean, de-duplicated items. */
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

function section(heading, lines) {
  const body = lines.filter(Boolean).join("\n");
  return body ? `${heading}\n${body}` : "";
}

/**
 * @returns {object} Either { error } or { prompt, handle, seoTitle, meta, stats, warnings }.
 */
export function buildShopifyPrompt({
  productTitle = "",
  brand = "",
  collection = "",
  buyer = "",
  voiceTraitsRaw = "",
  bannedWordsRaw = "",
  featuresRaw = "",
  keywordsRaw = "",
  structure = DESCRIPTION_STRUCTURES[0].id,
  descriptionWords = 150,
  currentMeta = "",
  includeAltText = true,
} = {}) {
  const title = String(productTitle).trim();
  if (!title) return { error: "Enter the product title." };
  if (title.length > PRODUCT_TITLE_MAX_CHARS) {
    return { error: `Shopify product titles are limited to ${PRODUCT_TITLE_MAX_CHARS} characters; this one is ${title.length}.` };
  }

  const features = parseList(featuresRaw);
  if (features.length === 0) {
    return { error: "Add at least one product feature or specification." };
  }
  if (!Number.isFinite(descriptionWords) || descriptionWords < 50 || descriptionWords > 600) {
    return { error: "Description length must be between 50 and 600 words." };
  }

  const chosen = DESCRIPTION_STRUCTURES.find((item) => item.id === structure) || DESCRIPTION_STRUCTURES[0];
  const voiceTraits = parseList(voiceTraitsRaw, { limit: 6 });
  const bannedWords = parseList(bannedWordsRaw, { limit: 30 });
  const keywords = parseList(keywordsRaw, { limit: 15 });

  const handle = buildHandle(title);
  const seoTitle = assessSeoTitle({ productTitle: title, brand });
  const meta = assessMetaDescription(currentMeta);

  const warnings = [];
  if (!seoTitle.withinLimit) {
    warnings.push(`The SEO page title is ${seoTitle.length} characters; Shopify's counter turns red past ${SEO_TITLE_MAX_CHARS}.`);
  }
  if (currentMeta && !meta.withinSerp) {
    warnings.push(`Your meta description is ${meta.length} characters, so roughly the last ${meta.length - META_DESCRIPTION_SERP_SAFE} will be cut from a desktop search snippet.`);
  }
  if (currentMeta && !meta.withinField) {
    warnings.push(`Shopify's meta description field stops at ${META_DESCRIPTION_FIELD_MAX} characters; trim ${meta.length - META_DESCRIPTION_FIELD_MAX}.`);
  }
  if (voiceTraits.length === 0) {
    warnings.push("No brand voice traits set — the output will default to generic ecommerce tone.");
  }
  if (voiceTraits.length > 3) {
    warnings.push("More than three voice traits usually cancel each other out; two or three is enough to steer the model.");
  }
  if (keywords.length === 0) {
    warnings.push("No keywords supplied, so the SEO title and meta description will not be anchored to a search phrase.");
  }
  if (handle.truncated) {
    warnings.push(`The URL handle was truncated to ${HANDLE_MAX_CHARS} characters.`);
  }
  if (!handle.handle) {
    warnings.push("The product title didn't produce any URL-safe characters — you'll need to set the handle manually in Shopify.");
  }

  const blocks = [
    section("ROLE", [
      "You are writing product page copy for a Shopify store. Sell by being specific, not by being loud.",
    ]),
    section("PRODUCT", [
      `Title: ${title}`,
      String(brand).trim() ? `Brand: ${String(brand).trim()}` : "",
      String(collection).trim() ? `Collection: ${String(collection).trim()}` : "",
      String(buyer).trim() ? `Buyer: ${String(buyer).trim()}` : "",
      `URL handle: ${handle.handle}`,
    ]),
    section(
      "FEATURES AND SPECIFICATIONS (the only facts available)",
      features.map((item, index) => `${index + 1}. ${item}`),
    ),
    voiceTraits.length
      ? section("BRAND VOICE", [
          `Traits: ${voiceTraits.join(", ")}`,
          bannedWords.length ? `Never use these words: ${bannedWords.join(", ")}` : "",
        ])
      : "",
    keywords.length
      ? section("KEYWORDS", [
          `Primary: ${keywords[0]}`,
          keywords.length > 1 ? `Supporting: ${keywords.slice(1).join(", ")}` : "",
          "The primary keyword must appear once in the SEO title and once in the first 100 words of the description.",
        ])
      : "",
    section(`STRUCTURE — ${chosen.label}`, chosen.outline.map((line, index) => `${index + 1}. ${line}`)),
    section("OUTPUT", [
      `1. DESCRIPTION — about ${Math.round(descriptionWords)} words, following the structure above, as plain HTML using only <p>, <ul>, <li> and <strong>.`,
      `2. SEO PAGE TITLE — at most ${SEO_TITLE_MAX_CHARS} characters.`,
      `3. META DESCRIPTION — at most ${META_DESCRIPTION_SERP_SAFE} characters so it survives search truncation; never exceed ${META_DESCRIPTION_FIELD_MAX}.`,
      `4. URL HANDLE — confirm or improve: ${handle.handle}`,
      includeAltText ? "5. IMAGE ALT TEXT — one line per image slot, under 125 characters, describing what is visible rather than repeating keywords." : "",
    ]),
    section("RULES", [
      "Use only the features listed. Anything else becomes [CONFIRM].",
      "No medical, safety or environmental claims that are not in the feature list.",
      "No stock phrases: 'elevate your', 'game changer', 'take your X to the next level'.",
      "Do not mention price, discounts or delivery times.",
      "Sentences under 22 words; no more than one adjective per noun.",
    ]),
  ];

  const prompt = blocks.filter(Boolean).join("\n\n");

  return {
    prompt,
    handle,
    seoTitle,
    meta,
    features,
    voiceTraits,
    keywords,
    structure: chosen,
    warnings,
    stats: {
      promptChars: prompt.length,
      promptWords: prompt.split(/\s+/).filter(Boolean).length,
      titleLength: title.length,
      titleHeadroom: PRODUCT_TITLE_MAX_CHARS - title.length,
      featureCount: features.length,
      keywordCount: keywords.length,
      voiceTraitCount: voiceTraits.length,
      bannedWordCount: bannedWords.length,
    },
  };
}

/** Reference table shown next to the prompt. */
export const SHOPIFY_FIELD_LIMITS = [
  ["Product title", `${PRODUCT_TITLE_MAX_CHARS} characters`, "Shopify product title field"],
  ["SEO page title", `${SEO_TITLE_MAX_CHARS} characters`, "Search engine listing editor counter"],
  ["Meta description", `${META_DESCRIPTION_FIELD_MAX} characters`, "Shopify field maximum"],
  ["Meta shown in search", `~${META_DESCRIPTION_SERP_SAFE} characters`, "Typical desktop truncation"],
  ["Image alt text", "125 characters", "Common screen-reader guidance"],
];
