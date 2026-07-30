const META_DESCRIPTION_MIN = 70;
const META_DESCRIPTION_MAX = 158;
const SHORT_DESCRIPTION_CONTEXT =
  "Use the guided controls to add input and review the result in your browser.";

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
  const base =
    cleanText(description) ||
    `${cleanName} is a free online tool that runs entirely in your browser.`;
  const suffix = `Use ${cleanName} online for ${
    cleanText(primaryCategory) || "daily"
  } tasks with quick examples and copy-ready results.`;

  // The suffix only earns its place when the whole thing fits. Appending it
  // unconditionally and then hard-cutting at 155 characters left thousands
  // of snippets ending mid-word.
  const combined = `${base} ${suffix}`;
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
