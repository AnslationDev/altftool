/**
 * Product Description Prompt Builder — word budgeting + prompt composition.
 *
 * Pure module: no React, no DOM, no clocks.
 */

/**
 * Published listing limits for each marketplace. `bulletLimit` and `descLimit`
 * are null where the platform sets no hard cap.
 */
export const MARKETPLACES = [
  {
    id: "amazon",
    label: "Amazon",
    titleLimit: 200,
    bulletLimit: 5,
    descLimit: 2000,
    tagLimit: null,
    note: "Amazon shows five bullet points and caps the product description field at 2,000 characters. Title limits vary by category; 200 characters is the usual ceiling and the mobile app truncates far earlier.",
  },
  {
    id: "etsy",
    label: "Etsy",
    titleLimit: 140,
    bulletLimit: null,
    descLimit: null,
    tagLimit: 13,
    note: "Etsy titles cap at 140 characters and each listing takes up to 13 tags of at most 20 characters each. The first 40 or so characters of the title carry the most search weight.",
  },
  {
    id: "ebay",
    label: "eBay",
    titleLimit: 80,
    bulletLimit: null,
    descLimit: null,
    tagLimit: null,
    note: "eBay titles are capped at 80 characters, so every word has to earn its place. Item specifics matter more than adjectives.",
  },
  {
    id: "shopify",
    label: "Shopify / own store",
    titleLimit: 255,
    bulletLimit: null,
    descLimit: null,
    tagLimit: null,
    note: "Shopify's product title field holds up to 255 characters. Search engines typically display only the first 155-160 characters of the meta description.",
  },
  {
    id: "google-shopping",
    label: "Google Shopping feed",
    titleLimit: 150,
    bulletLimit: null,
    descLimit: 5000,
    tagLimit: null,
    note: "Google Merchant Center accepts titles up to 150 characters and descriptions up to 5,000, but only about 70 characters of the title show in a Shopping ad.",
  },
  {
    id: "flipkart",
    label: "Marketplace (generic)",
    titleLimit: 120,
    bulletLimit: 6,
    descLimit: 3000,
    tagLimit: null,
    note: "Most Indian marketplaces cap the title around 100-120 characters and show five or six highlight bullets above the fold.",
  },
];

export const TONES = [
  { id: "plain", label: "Plain and specific", instruction: "Plain, concrete language. Numbers and materials instead of adjectives. No superlatives." },
  { id: "premium", label: "Premium", instruction: "Restrained and confident. Short sentences, no exclamation marks, no discount language." },
  { id: "friendly", label: "Friendly", instruction: "Warm and direct, second person, contractions allowed." },
  { id: "technical", label: "Technical", instruction: "Spec-led. Lead with measurable properties and compatibility; assume a knowledgeable buyer." },
];

/**
 * How the word budget is split across a listing. Weights are percentages and
 * sum to 100; they follow the standard listing order of hook, benefits,
 * situations, specifications and close.
 */
export const SECTION_WEIGHTS = [
  { id: "hook", label: "Opening hook", weight: 15 },
  { id: "benefits", label: "Feature-to-benefit bullets", weight: 45 },
  { id: "usecases", label: "Who it is for / when to use it", weight: 20 },
  { id: "specs", label: "Specifications and care", weight: 10 },
  { id: "close", label: "Close and call to action", weight: 10 },
];

/** Practical bounds for a listing description. */
export const MIN_WORDS = 40;
export const MAX_WORDS = 1200;

/** A listing needs at least one feature to describe. */
export const MIN_FEATURES = 1;
export const MAX_FEATURES = 30;

/**
 * Split `total` into parts proportional to `weights` using the largest
 * remainder (Hamilton) method, so the parts always sum back to `total`.
 * @returns {number[]|{error:string}}
 */
export function allocateWords(total, weights) {
  const n = Number(total);
  if (!Number.isFinite(n) || n <= 0) return { error: "Word count must be a positive number." };
  if (!Array.isArray(weights) || weights.length === 0) return { error: "No sections to split the words across." };

  const clean = weights.map((w) => (Number.isFinite(Number(w)) && Number(w) > 0 ? Number(w) : 0));
  const sum = clean.reduce((a, b) => a + b, 0);
  if (sum <= 0) return { error: "Section weights must add up to more than zero." };

  const exact = clean.map((w) => (w / sum) * n);
  const floors = exact.map((value) => Math.floor(value));
  let remainder = Math.round(n) - floors.reduce((a, b) => a + b, 0);

  const order = exact
    .map((value, index) => ({ index, frac: value - Math.floor(value) }))
    .sort((a, b) => b.frac - a.frac || a.index - b.index);

  const result = floors.slice();
  let cursor = 0;
  while (remainder > 0 && order.length > 0) {
    result[order[cursor % order.length].index] += 1;
    remainder -= 1;
    cursor += 1;
  }
  return result;
}

/** One trimmed feature per non-empty line. */
export function parseFeatures(text) {
  if (typeof text !== "string") return [];
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, MAX_FEATURES);
}

/** Comma or newline separated keywords, de-duplicated case-insensitively. */
export function parseKeywords(text) {
  if (typeof text !== "string") return [];
  const seen = new Set();
  const out = [];
  for (const raw of text.split(/[,\n]/)) {
    const value = raw.trim();
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }
  return out;
}

export function getMarketplace(marketplaceId) {
  return MARKETPLACES.find((item) => item.id === marketplaceId) || null;
}
export function getTone(toneId) {
  return TONES.find((item) => item.id === toneId) || null;
}

/**
 * Compose the listing-copy prompt.
 * @returns {object} { prompt, budget, ... } or { error }
 */
export function buildListingPrompt({
  marketplaceId,
  productName = "",
  features = "",
  audience = "",
  toneId = "plain",
  totalWords = 180,
  keywords = "",
  avoid = "",
} = {}) {
  const marketplace = getMarketplace(marketplaceId);
  if (!marketplace) return { error: "Pick where this listing will be published." };

  const tone = getTone(toneId);
  if (!tone) return { error: "Pick a tone for the copy." };

  const name = String(productName || "").trim();
  if (!name) return { error: "Enter the product name." };

  const featureList = parseFeatures(features);
  if (featureList.length < MIN_FEATURES) {
    return { error: "List at least one product feature, one per line." };
  }

  const words = Number(totalWords);
  if (!Number.isFinite(words)) return { error: "Description length must be a number." };
  if (words < MIN_WORDS || words > MAX_WORDS) {
    return { error: `Description length must be between ${MIN_WORDS} and ${MAX_WORDS} words.` };
  }

  const allocation = allocateWords(words, SECTION_WEIGHTS.map((section) => section.weight));
  if (allocation.error) return { error: allocation.error };

  const budget = SECTION_WEIGHTS.map((section, index) => ({
    ...section,
    words: allocation[index],
  }));

  const bulletTarget = marketplace.bulletLimit
    ? Math.min(featureList.length, marketplace.bulletLimit)
    : featureList.length;

  const keywordList = parseKeywords(keywords);
  const avoidText = String(avoid || "").trim();
  const audienceText = String(audience || "").trim();

  const sections = [
    {
      title: "Role",
      body: `You write product listing copy for ${marketplace.label}. You sell with specifics, never with adjectives, and you never state a claim the seller has not given you.`,
    },
    {
      title: "Product",
      body: [
        `Name: ${name}`,
        audienceText ? `Buyer: ${audienceText}` : "Buyer: someone comparing three similar products in a search results page.",
        "Features (verbatim from the seller):",
        ...featureList.map((feature, index) => `${index + 1}. ${feature}`),
      ].join("\n"),
    },
    {
      title: "Task",
      body: [
        `Write the full listing. Turn each feature into a feature-to-benefit line: state the feature, then what it changes for the buyer in the same sentence. Produce ${bulletTarget} bullet${bulletTarget === 1 ? "" : "s"}.`,
        `Also write a title of at most ${marketplace.titleLimit} characters that leads with the product type and the single most searchable attribute.`,
        marketplace.tagLimit
          ? `Also suggest ${marketplace.tagLimit} tags of no more than 20 characters each.`
          : null,
      ]
        .filter(Boolean)
        .join("\n"),
    },
    {
      title: "Length budget",
      body: [
        `Total: about ${Math.round(words)} words, split as:`,
        ...budget.map((section) => `- ${section.label}: ~${section.words} words`),
      ].join("\n"),
    },
    {
      title: "Constraints",
      body: [
        tone.instruction,
        marketplace.note,
        marketplace.descLimit
          ? `The description field accepts at most ${marketplace.descLimit} characters — stay well inside it.`
          : "There is no hard character cap on the description, but nobody reads past the first screen.",
        keywordList.length > 0
          ? `Work these terms in naturally, each at most twice: ${keywordList.join(", ")}. Do not keyword-stuff the title.`
          : "Use the words a buyer would type into search, not internal product names.",
        avoidText ? `Do not claim or mention: ${avoidText}` : null,
        "No health, safety, medical, legal or environmental claim unless it appears verbatim in the feature list.",
        "No invented certifications, awards, review counts, ratings or 'best seller' language.",
        "No superlatives that cannot be measured (best, ultimate, revolutionary, game-changing).",
      ]
        .filter(Boolean)
        .join("\n"),
    },
    {
      title: "Output format",
      body: "1) Title, with its character count in brackets. 2) The bullets. 3) The description under the section headings above. 4) A short list of anything you needed and did not have.",
    },
  ];

  const prompt = sections.map((section) => `${section.title}:\n${section.body}`).join("\n\n");

  return {
    prompt,
    sections,
    budget,
    totalWords: Math.round(words),
    featureCount: featureList.length,
    bulletTarget,
    droppedFeatures: Math.max(0, featureList.length - bulletTarget),
    keywordCount: keywordList.length,
    marketplaceLabel: marketplace.label,
    titleLimit: marketplace.titleLimit,
    descLimit: marketplace.descLimit,
    tagLimit: marketplace.tagLimit,
    promptChars: prompt.length,
  };
}
