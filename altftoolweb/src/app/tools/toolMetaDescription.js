const META_DESCRIPTION_MIN = 70;
const META_DESCRIPTION_MAX = 158;
const SHORT_DESCRIPTION_CONTEXT =
  "Use the guided controls to add input and review the result in your browser.";

// Per-category suffix: [noun, closing clause]. One global tail repeated the
// identical sentence across ~3,800 URLs and contained nothing a searcher
// types; each category now closes with "free online <its own noun>" plus a
// distinct clause. Clauses stay neutral on where processing happens — at
// least 129 tools call network APIs, so no "in your browser"/"never
// uploaded" style claims belong in generated copy.
const CATEGORY_SUFFIXES = {
  calculators: ["calculator", "instant results, no sign-up"],
  "finance calculators": [
    "finance calculator",
    "clear numbers you can copy, no sign-up",
  ],
  "health calculators": [
    "health calculator",
    "quick results, free to use",
  ],
  converters: ["converter", "fast, accurate conversions, no sign-up"],
  generators: ["generator", "create and copy in seconds"],
  developer: ["developer tool", "paste your input and copy the output"],
  productivity: ["productivity tool", "plan faster, no account needed"],
  "education & science": [
    "learning tool",
    "step-by-step results you can copy",
  ],
  "security & privacy": ["privacy tool", "clear guidance, no sign-up needed"],
  "health & fitness": ["health tool", "simple inputs, instant feedback"],
  business: ["business tool", "practical output you can reuse"],
  lifestyle: ["lifestyle tool", "quick answers, no sign-up"],
  "design & color": ["design tool", "preview and copy in seconds"],
  "text & writing": ["text tool", "clean output, ready to paste"],
  "marketing & social": ["marketing tool", "fast results you can share"],
  fun: ["fun tool", "start instantly, nothing to install"],
  "image & photo": ["image tool", "quick previews and free downloads"],
  games: ["game", "play free, no download needed"],
  "ai tools": ["AI tool", "fast AI results, no sign-up"],
  "video & audio": ["media tool", "quick results, nothing to install"],
  "pdf & documents": ["PDF tool", "fast document results, no sign-up"],
};
const DEFAULT_SUFFIX = ["tool", "quick results, no sign-up needed"];

function cleanText(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

// Cut on a word boundary, and only fall back to a hard cut if the last space
// is so early that respecting it would throw most of the sentence away.
function truncateAtWord(text, limit) {
  if (text.length <= limit) return text;
  const clipped = text.slice(0, limit - 1);
  const lastSpace = clipped.lastIndexOf(" ");
  const body = lastSpace > limit * 0.6 ? clipped.slice(0, lastSpace) : clipped;
  return `${body.replace(/[\s,;:.–-]+$/, "")}…`;
}

function expandShortDescription(text) {
  if (text.length >= META_DESCRIPTION_MIN) return text;
  const sentence = /[.!?]$/.test(text) ? text : `${text}.`;
  return truncateAtWord(
    `${sentence} ${SHORT_DESCRIPTION_CONTEXT}`,
    META_DESCRIPTION_MAX,
  );
}

export function buildMetaDescription(name, description, primaryCategory) {
  const cleanName = cleanText(name);
  // The old fallback claimed the tool "runs entirely in your browser" — false
  // for every tool that calls a network API. Scoped claim only.
  const base =
    cleanText(description) ||
    `${cleanName} is a free online tool for quick everyday use.`;
  const [noun, clause] =
    CATEGORY_SUFFIXES[cleanText(primaryCategory).toLowerCase()] ||
    DEFAULT_SUFFIX;
  // "Try <Name>, a free online <noun>" keeps the name and the noun apart, so
  // a name that already ends with the noun ("GST Calculator" + "calculator")
  // reads as one sentence instead of a doubled "Calculator calculator".
  const suffix = `Try ${cleanName}, a free online ${noun} — ${clause}.`;

  // The suffix only earns its place when the whole thing fits. Appending it
  // unconditionally and then hard-cutting at 155 characters left thousands
  // of snippets ending mid-word. Catalogue copy is not guaranteed to end in
  // punctuation, so terminate it before the suffix starts a new sentence.
  const baseSentence = /[.!?…]$/.test(base) ? base : `${base}.`;
  const combined = `${baseSentence} ${suffix}`;
  if (combined.length <= META_DESCRIPTION_MAX) {
    return expandShortDescription(combined);
  }

  // Keep the tool's own description when it is already informative. Very
  // short catalogue summaries get one neutral usage sentence so an on-demand
  // tool route does not render a thin search snippet.
  if (base.length <= META_DESCRIPTION_MAX) {
    return expandShortDescription(base);
  }

  return truncateAtWord(base, META_DESCRIPTION_MAX);
}

export const TOOL_META_DESCRIPTION_BOUNDS = Object.freeze({
  min: META_DESCRIPTION_MIN,
  max: META_DESCRIPTION_MAX,
});
