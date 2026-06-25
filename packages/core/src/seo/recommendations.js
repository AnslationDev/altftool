// @altftool/core/seo/recommendations
//
// Pure helpers for AI-powered SEO recommendations (Phase 5).
//   - buildRecommendationPrompt(): construct a strict-JSON prompt from page input
//   - parseRecommendation(): robustly parse a (possibly messy) model response
//   - heuristicRecommendation(): deterministic no-AI fallback
//   - normalizeSuggestion(): clamp/clean a suggestion
//
// No I/O, no dependencies — the network call lives in the admin API route.

const TITLE_MAX = 60;
const DESC_MAX = 155;

function stripHtml(value = "") {
  return String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function clamp(text, max) {
  const t = String(text || "").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.\-]+$/, "");
}

/**
 * Build a strict-JSON prompt for an SEO suggestion.
 * @param {{ path?: string, title?: string, content?: string, url?: string, brand?: string }} input
 * @returns {string}
 */
export function buildRecommendationPrompt(input = {}) {
  const brand = input.brand || "AltFTool";
  const content = clamp(stripHtml(input.content || ""), 4000);
  return [
    `You are an expert SEO copywriter for ${brand}.`,
    `Write SEO metadata for the page below.`,
    input.path ? `Path: ${input.path}` : "",
    input.url ? `URL: ${input.url}` : "",
    input.title ? `Current title: ${input.title}` : "",
    content ? `Page content:\n"""${content}"""` : "",
    "",
    `Return ONLY valid minified JSON, no markdown, with exactly these keys:`,
    `{"title": string (<= ${TITLE_MAX} chars, compelling, includes primary keyword),`,
    ` "description": string (<= ${DESC_MAX} chars, action-oriented, no clickbait),`,
    ` "keywords": string[] (3-8 concise, lowercase, relevant)}`,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Clean + clamp a raw suggestion object.
 * @param {any} raw
 * @returns {{ title: string, description: string, keywords: string[] }|null}
 */
export function normalizeSuggestion(raw) {
  if (!raw || typeof raw !== "object") return null;
  const title = clamp(stripHtml(raw.title || ""), TITLE_MAX);
  const description = clamp(stripHtml(raw.description || ""), DESC_MAX);
  let keywords = Array.isArray(raw.keywords) ? raw.keywords : [];
  keywords = [
    ...new Set(
      keywords
        .map((k) => String(k).trim().toLowerCase())
        .filter(Boolean),
    ),
  ].slice(0, 8);
  if (!title && !description && !keywords.length) return null;
  return { title, description, keywords };
}

/**
 * Robustly parse an AI text response into a normalized suggestion.
 * Tolerates code fences and surrounding prose; extracts the first JSON object.
 * @param {string} text
 * @returns {{ title, description, keywords }|null}
 */
export function parseRecommendation(text) {
  if (typeof text !== "string" || !text.trim()) return null;
  let body = text.trim();
  // strip ```json ... ``` fences
  const fence = body.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) body = fence[1].trim();
  // extract first balanced {...}
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  const json = body.slice(start, end + 1);
  try {
    return normalizeSuggestion(JSON.parse(json));
  } catch {
    return null;
  }
}

/**
 * Deterministic no-AI fallback: derive a reasonable title/description/keywords
 * from the provided title/content. Used when no AI key is configured or the
 * model call fails, so the feature always returns something useful.
 * @param {{ path?: string, title?: string, content?: string, brand?: string }} input
 * @returns {{ title, description, keywords }}
 */
export function heuristicRecommendation(input = {}) {
  const brand = input.brand || "AltFTool";
  const text = stripHtml(input.content || "");
  const baseTitle =
    stripHtml(input.title || "") ||
    deriveTitleFromPath(input.path) ||
    text.split(/[.!?]/)[0] ||
    brand;

  const title = clamp(baseTitle.includes(brand) ? baseTitle : `${baseTitle} | ${brand}`, TITLE_MAX);

  const firstSentences = text.match(/[^.!?]+[.!?]/g) || (text ? [text] : []);
  const description = clamp(firstSentences.slice(0, 2).join(" ") || baseTitle, DESC_MAX);

  const keywords = topKeywords(`${baseTitle} ${text}`, 6);

  return { title, description, keywords };
}

function deriveTitleFromPath(path) {
  if (!path || typeof path !== "string") return "";
  const last = path.split("/").filter(Boolean).pop() || "";
  return last
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

const STOPWORDS = new Set(
  "the a an and or but of to in on for with at by from is are was were be been this that your you our we it as into over your free online".split(
    " ",
  ),
);

function topKeywords(text, n) {
  const counts = new Map();
  for (const word of stripHtml(text).toLowerCase().match(/[a-z][a-z0-9-]{2,}/g) || []) {
    if (STOPWORDS.has(word)) continue;
    counts.set(word, (counts.get(word) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([w]) => w);
}

export const __testing = { clamp, stripHtml, topKeywords, deriveTitleFromPath };
