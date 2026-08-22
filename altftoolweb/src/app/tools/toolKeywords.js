// Keyword variants for <meta name="keywords"> on tool routes, derived only
// from data the registry already asserts about a tool (name, topics,
// category). Nothing here may invent a capability or privacy claim — at least
// 129 tools call network APIs, so phrases like "runs entirely in your
// browser" are off-limits everywhere metadata is generated.
//
// Runs per request under React cache() in buildToolMetadata, so it stays
// dependency-free and does string work only.
import toolKeywordOverrides from "./toolKeywordOverrides.js";

// Type nouns that already close a tool name ("GST Calculator", "QR Code
// Generator"). When the name ends with one, the title fallback and the
// keyword noun reuse it instead of appending a second, redundant noun.
const NAME_TYPE_NOUNS = [
  "calculator",
  "generator",
  "builder",
  "planner",
  "converter",
  "checklist",
  "checker",
  "estimator",
  "tracker",
  "guide",
  "explainer",
  "tool",
  "explorer",
  "finder",
  "timer",
  "analyzer",
  "maker",
  "selector",
  "simulator",
  "quiz",
  "comparator",
  "test",
  "game",
];

// Primary category → the noun a searcher would type ("free online calculator",
// "free online converter"). Categories without a query-shaped noun of their
// own fall through to plain "Tool".
const CATEGORY_TITLE_NOUNS = {
  calculators: "Calculator",
  "finance calculators": "Calculator",
  "health calculators": "Calculator",
  converters: "Converter",
  generators: "Generator",
  "image & photo": "Image Tool",
  "pdf & documents": "PDF Tool",
  "text & writing": "Text Tool",
  "video & audio": "Media Tool",
  "security & privacy": "Privacy Tool",
  developer: "Developer Tool",
  games: "Game",
};

function cleanText(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function primaryCategoryOf(tool) {
  const category = tool?.category;
  const first = Array.isArray(category) ? category[0] : category;
  // Explicit null/undefined would reach String() as the literal "null".
  return first == null ? "" : cleanText(first);
}

/**
 * The type noun a tool name already ends with ("calculator", "tracker", …),
 * or null when the name has no recognised type suffix.
 */
export function getNameTypeNoun(name) {
  const lower = cleanText(name).toLowerCase();
  if (!lower) return null;
  return (
    NAME_TYPE_NOUNS.find(
      (noun) => lower === noun || lower.endsWith(` ${noun}`),
    ) || null
  );
}

/**
 * Title-cased noun for the fallback <title> ("Calculator", "Privacy Tool"),
 * mapped from the tool's primary category. Defaults to "Tool".
 */
export function getCategoryTitleNoun(primaryCategory) {
  return (
    CATEGORY_TITLE_NOUNS[cleanText(primaryCategory).toLowerCase()] || "Tool"
  );
}

/**
 * ≤10 deduped lowercase keyword phrases for one tool — demand-mined
 * overrides first, then registry-derived phrases. Every phrase is built
 * from the registry entry itself: the name, "free"/"online" variants of it,
 * one "free online <type noun>" phrase, the tool's topics and its primary
 * category label.
 */
export function buildToolKeywords(slug, tool = {}) {
  const name = cleanText(tool.name || String(slug).replace(/[-_]/g, " "));
  const nameLower = name.toLowerCase();
  const primaryCategory = primaryCategoryOf(tool);
  // Name-derived noun wins so "GST Calculator" yields "free online
  // calculator" even when its primary category is Finance Calculators.
  const typeNoun =
    getNameTypeNoun(name) || getCategoryTitleNoun(primaryCategory).toLowerCase();

  const candidates = [
    // Demand-mined variants first: real autocomplete queries for this tool's
    // head term, verified against the tool's source before being added. See
    // toolKeywordOverrides.js for the sourcing and verification rules.
    ...(toolKeywordOverrides[slug] || []).map((phrase) =>
      cleanText(phrase).toLowerCase(),
    ),
    nameLower,
    `free ${nameLower}`,
    `${nameLower} online`,
    // "<term> online free" is the single most repeated real modifier in the
    // autocomplete mining (71 of 900 head terms surface it as its own query),
    // and unlike most modifiers it promises nothing the tools do not deliver.
    `${nameLower} online free`,
    `free online ${typeNoun}`,
    ...(Array.isArray(tool.topics) ? tool.topics : []).map((topic) =>
      cleanText(topic).toLowerCase(),
    ),
    primaryCategory.toLowerCase(),
  ];

  const seen = new Set();
  const keywords = [];
  for (const phrase of candidates) {
    if (!phrase || phrase.length <= 2) continue;
    if (seen.has(phrase)) continue;
    seen.add(phrase);
    keywords.push(phrase);
    if (keywords.length === 10) break;
  }
  return keywords;
}

/**
 * Fallback <title> for tools without hand-written SEO content. Names that
 * already end in a type noun keep the generic form ("GST Calculator - Free
 * Online Tool"); others get their category noun ("Sunset Time - Free Online
 * Calculator") so the title carries the query-shaped variant. The category
 * form yields to the generic one when it would push past ~65 characters,
 * the length Google renders without truncating.
 */
export function buildFallbackToolTitle(name, primaryCategory) {
  const cleanName = cleanText(name);
  // The root layout appends " | AltFTool" (11 chars) and the SERP renders
  // ~60, so the pre-suffix budget is 49 — the same budget
  // tests/tool-seo-map.test.mjs enforces on authored titles. The flat
  // "- Free Online Tool" tail alone put 1,194 fallback titles past that,
  // so the suffix degrades until the whole rendered title fits.
  const MAX_PRE_SUFFIX = 49;
  const categoryNoun = getNameTypeNoun(cleanName)
    ? null // "GST Calculator - Free Online Calculator" would stutter
    : getCategoryTitleNoun(primaryCategory);
  const suffixes = [
    ...(categoryNoun ? [` - Free Online ${categoryNoun}`] : []),
    " - Free Online Tool",
    " - Free Online",
    "",
  ];
  const fitting = suffixes.find(
    (suffix) => cleanName.length + suffix.length <= MAX_PRE_SUFFIX,
  );
  return fitting === undefined ? cleanName : `${cleanName}${fitting}`;
}
