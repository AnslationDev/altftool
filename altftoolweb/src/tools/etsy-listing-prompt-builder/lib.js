/**
 * Builds an Etsy listing brief and validates the tag set against Etsy's
 * published listing field limits.
 *
 * Etsy's limits are unusually strict and unusually specific — 13 tags of 20
 * characters each — so most of the work here is fitting a keyword list into
 * those slots rather than writing prose.
 */

/** Etsy listing title field accepts up to 140 characters. */
export const TITLE_MAX_CHARS = 140;

/**
 * Etsy shows a truncated title in search and social previews, so the first ~40
 * characters carry the click. Treated as a design target, not a hard limit.
 */
export const TITLE_FRONTLOAD_CHARS = 40;

/** Up to 13 tags per listing. */
export const TAGS_MAX = 13;

/** Each tag is limited to 20 characters, spaces included. */
export const TAG_MAX_CHARS = 20;

/** Up to 13 materials, each up to 45 characters. */
export const MATERIALS_MAX = 13;
export const MATERIAL_MAX_CHARS = 45;

/** Up to 10 photos and one video per listing. */
export const PHOTOS_MAX = 10;
export const VIDEOS_MAX = 1;

/**
 * A word repeated across many tags spends slots without widening reach, so this
 * is the point at which the builder raises a warning.
 */
export const TAG_WORD_REPEAT_LIMIT = 4;

export const STORY_ANGLES = [
  {
    id: "maker",
    label: "The maker",
    brief: "Who makes it, where, and what they were doing before this. One human detail, no life story.",
  },
  {
    id: "process",
    label: "How it is made",
    brief: "The steps and the time each piece takes. Name the technique and why it changes the result.",
  },
  {
    id: "materials",
    label: "Where the materials come from",
    brief: "Source of the raw materials and why that choice was made. Avoid unverifiable sustainability claims.",
  },
  {
    id: "gift",
    label: "Gifting moment",
    brief: "The occasion, the recipient and what the packaging looks like when it arrives.",
  },
  {
    id: "personalisation",
    label: "Personalisation",
    brief: "What can be customised, the character limits, and exactly how the buyer sends their details.",
  },
];

/**
 * Split a textarea or comma list into clean phrases, preserving order.
 *
 * `splitOn` defaults to newlines/commas/semicolons, which suits a field like
 * tags where sellers commonly paste a comma-separated list. Fields whose
 * label promises "one per line" (item details, materials) must pass
 * `{ splitOn: /\n+/ }` so a comma that is part of a single entry — e.g. a
 * "9 cm tall, 8 cm wide" dimension line — is not silently broken in two.
 */
export function parseList(raw, { limit = 80, splitOn = /[\n,;]+/ } = {}) {
  if (typeof raw !== "string") return [];
  const items = [];
  for (const piece of raw.split(splitOn)) {
    const value = piece.trim().replace(/\s+/g, " ");
    if (!value) continue;
    items.push(value);
    if (items.length >= limit) break;
  }
  return items;
}

/**
 * Validate a raw tag list against Etsy's 13 x 20-character rule.
 *
 * Returns the accepted tags plus every reason a tag was rejected, so the seller
 * can see which phrase to shorten rather than silently losing it.
 */
export function buildTags(raw, { maxTags = TAGS_MAX, maxChars = TAG_MAX_CHARS } = {}) {
  if (!Number.isFinite(maxTags) || maxTags <= 0) return { error: "Tag limit must be a positive number." };
  if (!Number.isFinite(maxChars) || maxChars <= 0) return { error: "Tag length limit must be a positive number." };

  const accepted = [];
  const tooLong = [];
  const duplicates = [];
  const overflow = [];
  const seen = new Set();

  for (const candidate of parseList(raw)) {
    const key = candidate.toLowerCase();
    if (seen.has(key)) {
      duplicates.push(candidate);
      continue;
    }
    seen.add(key);
    if (candidate.length > maxChars) {
      tooLong.push({ tag: candidate, length: candidate.length, trimmed: candidate.slice(0, maxChars).trim() });
      continue;
    }
    if (accepted.length >= maxTags) {
      overflow.push(candidate);
      continue;
    }
    accepted.push(candidate);
  }

  // Count how often each word is reused across accepted tags.
  const wordCounts = new Map();
  for (const tag of accepted) {
    for (const word of new Set(tag.toLowerCase().split(/\s+/).filter(Boolean))) {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    }
  }
  const repeatedWords = [...wordCounts.entries()]
    .filter(([, count]) => count >= TAG_WORD_REPEAT_LIMIT)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count);

  const multiWord = accepted.filter((tag) => tag.includes(" ")).length;

  return {
    tags: accepted,
    tooLong,
    duplicates,
    overflow,
    repeatedWords,
    slotsUsed: accepted.length,
    slotsFree: maxTags - accepted.length,
    multiWord,
    singleWord: accepted.length - multiWord,
    maxTags,
    maxChars,
  };
}

function section(heading, lines) {
  const body = lines.filter(Boolean).join("\n");
  return body ? `${heading}\n${body}` : "";
}

/**
 * @returns {object} Either { error } or { prompt, tagReport, stats, warnings }.
 */
export function buildEtsyPrompt({
  itemName = "",
  shopName = "",
  craftType = "",
  buyer = "",
  occasion = "",
  storyAngle = STORY_ANGLES[0].id,
  materialsRaw = "",
  detailsRaw = "",
  tagsRaw = "",
  personalisation = "",
  processingTime = "",
  titleTarget = 120,
  descriptionWords = 180,
  includeSectionHeadings = true,
} = {}) {
  const name = String(itemName).trim();
  if (!name) return { error: "Enter the item name — the title, tags and story all build from it." };

  const details = parseList(detailsRaw, { splitOn: /\n+/ });
  if (details.length === 0) {
    return { error: "Add at least one item detail (size, finish, weight, what is included)." };
  }

  if (!Number.isFinite(titleTarget) || titleTarget < 30 || titleTarget > TITLE_MAX_CHARS) {
    return { error: `Title target must be between 30 and ${TITLE_MAX_CHARS} characters.` };
  }
  if (!Number.isFinite(descriptionWords) || descriptionWords < 60 || descriptionWords > 900) {
    return { error: "Description length must be between 60 and 900 words." };
  }

  const angle = STORY_ANGLES.find((item) => item.id === storyAngle) || STORY_ANGLES[0];
  const tagReport = buildTags(tagsRaw);
  const rawMaterials = parseList(materialsRaw, { splitOn: /\n+/ });
  const materials = rawMaterials.filter((item) => item.length <= MATERIAL_MAX_CHARS).slice(0, MATERIALS_MAX);
  const materialsRejected = rawMaterials.filter((item) => item.length > MATERIAL_MAX_CHARS);
  const materialsOverflow = Math.max(0, rawMaterials.length - materialsRejected.length - materials.length);

  const warnings = [];
  if (tagReport.slotsFree > 0) {
    warnings.push(`${tagReport.slotsFree} of ${TAGS_MAX} tag slots are unused — every empty slot is a search phrase you are not competing for.`);
  }
  if (tagReport.tooLong.length > 0) {
    warnings.push(`${tagReport.tooLong.length} tag(s) exceed the ${TAG_MAX_CHARS}-character limit and were dropped; shortened versions are suggested below.`);
  }
  if (tagReport.overflow.length > 0) {
    warnings.push(`${tagReport.overflow.length} tag(s) did not fit in the ${TAGS_MAX} available slots.`);
  }
  if (tagReport.repeatedWords.length > 0) {
    warnings.push(`Some words repeat across ${TAG_WORD_REPEAT_LIMIT} or more tags, which narrows rather than widens your reach.`);
  }
  if (tagReport.singleWord > tagReport.multiWord && tagReport.slotsUsed > 0) {
    warnings.push("Most of your tags are single words. Multi-word phrases usually match how shoppers actually search.");
  }
  if (materialsRejected.length > 0) {
    warnings.push(`${materialsRejected.length} material entr(y/ies) exceed the ${MATERIAL_MAX_CHARS}-character limit.`);
  }
  if (materialsOverflow > 0) {
    warnings.push(`Only ${MATERIALS_MAX} materials can be listed; ${materialsOverflow} did not fit.`);
  }
  if (titleTarget > TITLE_MAX_CHARS - 10) {
    warnings.push("A title close to the 140-character cap is often truncated in search and shared links.");
  }

  const blocks = [
    section("ROLE", [
      "You are writing an Etsy listing for a small handmade shop. Warm and specific, never salesy or generic.",
    ]),
    section("ITEM", [
      `Name: ${name}`,
      shopName ? `Shop: ${String(shopName).trim()}` : "",
      craftType ? `Craft: ${String(craftType).trim()}` : "",
      buyer ? `Buyer: ${String(buyer).trim()}` : "",
      occasion ? `Occasion: ${String(occasion).trim()}` : "",
      processingTime ? `Processing time: ${String(processingTime).trim()}` : "",
      personalisation ? `Personalisation offered: ${String(personalisation).trim()}` : "",
    ]),
    section(
      "VERIFIED DETAILS (state nothing beyond these)",
      details.map((item, index) => `${index + 1}. ${item}`),
    ),
    materials.length ? section("MATERIALS", materials.map((item, index) => `${index + 1}. ${item}`)) : "",
    section("STORY ANGLE", [`${angle.label}: ${angle.brief}`]),
    tagReport.tags.length
      ? section("TAGS ALREADY CHOSEN (do not rewrite these)", [tagReport.tags.join(", ")])
      : "",
    section("OUTPUT", [
      `1. TITLE — target ${Math.round(titleTarget)} characters, hard limit ${TITLE_MAX_CHARS}. Put what the item literally is in the first ${TITLE_FRONTLOAD_CHARS} characters, then the qualifiers. Separate ideas with a pipe or comma, not keyword soup.`,
      `2. FIRST LINE — one sentence under 160 characters that works as the search and social preview.`,
      `3. DESCRIPTION — about ${Math.round(descriptionWords)} words${includeSectionHeadings ? ", under the headings: What it is / Details / Made by hand / Care / Shipping and personalisation" : ", in short paragraphs"}.`,
      tagReport.slotsFree > 0
        ? `4. TAG SUGGESTIONS — propose ${tagReport.slotsFree} more tags to fill the remaining slots. Each must be at most ${TAG_MAX_CHARS} characters, multi-word where possible, and must not repeat a word already used ${TAG_WORD_REPEAT_LIMIT} times.`
        : "4. TAG REVIEW — all 13 slots are filled; flag any tag that is too generic to compete.",
      "5. FAQ — three questions this buyer would ask before ordering, answered in under 40 words each.",
    ]),
    section("RULES", [
      "State only the details and materials given above. Anything missing becomes [CONFIRM].",
      "No health, therapeutic or safety claims. No claims about certifications you were not given.",
      "Do not promise delivery dates; refer to the processing time field instead.",
      "Avoid 'perfect gift', 'must have' and 'one of a kind' unless the item is genuinely unique.",
      "Write as the maker, first person singular or plural, plain language.",
    ]),
  ];

  const prompt = blocks.filter(Boolean).join("\n\n");

  return {
    prompt,
    tagReport,
    materials,
    materialsRejected,
    details,
    angle,
    warnings,
    stats: {
      promptChars: prompt.length,
      promptWords: prompt.split(/\s+/).filter(Boolean).length,
      detailCount: details.length,
      materialCount: materials.length,
      tagsUsed: tagReport.slotsUsed,
      tagsFree: tagReport.slotsFree,
      titleTarget: Math.round(titleTarget),
      titleHeadroom: TITLE_MAX_CHARS - Math.round(titleTarget),
    },
  };
}

/** Reference table shown next to the prompt. */
export const ETSY_FIELD_LIMITS = [
  ["Title", `${TITLE_MAX_CHARS} characters`, `Front-load the first ~${TITLE_FRONTLOAD_CHARS}`],
  ["Tags", `${TAGS_MAX} per listing`, `${TAG_MAX_CHARS} characters each, spaces included`],
  ["Materials", `${MATERIALS_MAX} per listing`, `${MATERIAL_MAX_CHARS} characters each`],
  ["Photos", `${PHOTOS_MAX} per listing`, `Plus up to ${VIDEOS_MAX} video`],
];
