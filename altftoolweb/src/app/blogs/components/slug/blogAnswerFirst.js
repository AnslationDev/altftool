import { stripHtml } from "../../data";

/**
 * Answer-first + visible-content helpers for the article template.
 *
 * Two jobs:
 *  1. `resolveBlogLede` picks a self-contained summary sentence to render
 *     directly under the H1 — but only when the post actually stores one that
 *     is neither boilerplate nor a repeat of the article's opening paragraph.
 *  2. `createContentMatcher` lets the page emit structured data for text that
 *     is genuinely rendered, instead of for derived strings the reader never
 *     sees.
 */

const FIRST_PARAGRAPH_PATTERN = /<p\b[^>]*>([\s\S]*?)<\/p>/i;

// `blogSeoDefaults.buildSeoDescription` synthesises this sentence for every
// post that has no authored description. It is fine as a meta fallback, but it
// must never become visible page copy — the same words on 1,000+ articles read
// as boilerplate to both readers and answer engines.
const GENERATED_DESCRIPTION_PATTERN = /^use .+ better with this .+ guide\.\s*learn best use cases/i;

const MIN_LEDE_LENGTH = 40;
const MIN_MATCH_LENGTH = 12;

export function toPlainText(value = "") {
  return stripHtml(String(value || ""))
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * True when the text is the synthesised fallback description rather than
 * something a writer produced for this specific post.
 */
export function isGeneratedDescription(value = "") {
  return GENERATED_DESCRIPTION_PATTERN.test(toPlainText(value));
}

function matchKey(value = "") {
  return toPlainText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isEchoOfOpeningParagraph(candidate, openingParagraph) {
  if (!openingParagraph) return false;

  const summaryKey = matchKey(candidate);
  const openingKey = matchKey(openingParagraph);
  if (!summaryKey || !openingKey) return false;

  // Auto-generated excerpts are the first ~155 characters of the body, so a
  // prefix match in either direction means the lede would just repeat the
  // article's first line.
  return openingKey.startsWith(summaryKey) || summaryKey.startsWith(openingKey);
}

/**
 * Returns the summary sentence to render under the H1, or "" when the post has
 * nothing worth surfacing. Never invents text.
 */
export function resolveBlogLede(blog) {
  if (!blog) return "";

  const body = blog.description || blog.content || blog.body || "";
  const openingParagraph = toPlainText(FIRST_PARAGRAPH_PATTERN.exec(body)?.[1] || "");

  for (const candidate of [blog.excerpt, blog.seoDescription]) {
    const text = toPlainText(candidate);

    if (text.length < MIN_LEDE_LENGTH) continue;
    if (GENERATED_DESCRIPTION_PATTERN.test(text)) continue;
    if (isEchoOfOpeningParagraph(text, openingParagraph)) continue;

    return text;
  }

  return "";
}

/**
 * Builds a predicate that reports whether a string is actually present in the
 * rendered article HTML. Used to keep FAQPage/HowTo entries limited to visible
 * content.
 */
export function createContentMatcher(content = "") {
  const haystack = matchKey(content);

  return (value) => {
    const key = matchKey(value);
    if (key.length < MIN_MATCH_LENGTH) return false;
    return haystack.includes(key);
  };
}

// Articles authored in the CMS can ship their own accordion markup; when they
// do, `BlogFaqSection` stays out of the way and those questions are the only
// visible ones.
export function hasInlineFaqBlock(content = "") {
  return /FAQ_WRAPPER|FAQ_ITEM|FAQ Start/i.test(String(content || ""));
}

export const VISIBLE_FAQ_LIMIT = 6;

/**
 * The exact FAQ list a reader can see, so FAQPage never describes hidden text.
 */
export function getVisibleFaqItems({ content = "", items = [] } = {}) {
  const usable = items.filter((item) => item?.question && item?.answer);

  if (!hasInlineFaqBlock(content)) return usable.slice(0, VISIBLE_FAQ_LIMIT);

  const isRendered = createContentMatcher(content);
  return usable.filter((item) => isRendered(item.question));
}

/**
 * The subset of derived HowTo steps whose wording appears in the article body.
 * Fallback steps synthesised from a template are dropped here.
 */
export function getVisibleHowToSteps({ content = "", steps = [] } = {}) {
  const isRendered = createContentMatcher(content);
  return steps.filter((step) => isRendered(step));
}
