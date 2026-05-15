import { blogTaxonomySlug } from "../data";

const PROTECTED_BLOCK_PATTERN =
  /<a\b[\s\S]*?<\/a>|<h[1-6]\b[\s\S]*?<\/h[1-6]>|<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>|<iframe\b[\s\S]*?<\/iframe>/gi;

const STOP_WORDS = new Set([
  "about",
  "after",
  "also",
  "and",
  "best",
  "blog",
  "can",
  "for",
  "from",
  "guide",
  "how",
  "into",
  "online",
  "read",
  "that",
  "the",
  "this",
  "tool",
  "tools",
  "use",
  "with",
  "your",
]);

function escapeRegExp(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeWhitespace(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function stripHtml(value = "") {
  return normalizeWhitespace(String(value).replace(/<[^>]*>/g, " "));
}

function makeCandidateKey(value = "") {
  return normalizeWhitespace(value).toLowerCase();
}

function getUsefulPhrase(value = "", maxWords = 4) {
  const text = stripHtml(value)
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word.toLowerCase()))
    .slice(0, maxWords)
    .join(" ");

  return text.length >= 6 ? text : "";
}

function protectBlocks(html = "") {
  const blocks = [];
  const source = String(html || "").replace(PROTECTED_BLOCK_PATTERN, (match) => {
    const token = `__ALTFT_PROTECTED_BLOCK_${blocks.length}__`;
    blocks.push(match);
    return token;
  });

  return { source, blocks };
}

function restoreBlocks(html = "", blocks = []) {
  return blocks.reduce(
    (content, block, index) => content.replace(`__ALTFT_PROTECTED_BLOCK_${index}__`, block),
    html,
  );
}

function insertLinkInTextNode(text = "", candidate) {
  if (!text || !candidate?.phrase) return { text, linked: false };

  const phrasePattern = candidate.phrase
    .split(/\s+/)
    .filter(Boolean)
    .map(escapeRegExp)
    .join("\\s+");
  const pattern = new RegExp(`(^|[^\\w/])(${phrasePattern})(?![\\w-])`, "i");

  let linked = false;
  const nextText = text.replace(pattern, (match, prefix, phrase) => {
    linked = true;
    return `${prefix}<a class="auto-internal-link" data-auto-internal-link="true" href="${candidate.href}">${phrase}</a>`;
  });

  return { text: nextText, linked };
}

function insertCandidateLink(html = "", candidate) {
  const parts = html.split(/(<[^>]+>)/g);
  let linked = false;

  const nextParts = parts.map((part) => {
    if (linked || !part || part.startsWith("<")) return part;
    const result = insertLinkInTextNode(part, candidate);
    linked = result.linked;
    return result.text;
  });

  return { html: nextParts.join(""), linked };
}

function addCandidate(candidates, seen, phrase, href, label) {
  const normalizedPhrase = normalizeWhitespace(phrase);
  if (!normalizedPhrase || normalizedPhrase.length < 5 || !href) return;

  const key = `${makeCandidateKey(normalizedPhrase)}::${href}`;
  if (seen.has(key)) return;
  seen.add(key);
  candidates.push({ phrase: normalizedPhrase, href, label });
}

export function getArticleInternalLinkCandidates({ blog, relatedPosts = [], relatedTools = [] } = {}) {
  const candidates = [];
  const seen = new Set();

  relatedTools.slice(0, 4).forEach((tool) => {
    addCandidate(candidates, seen, tool.name, tool.href, "tool");
    addCandidate(candidates, seen, tool.category, tool.searchHref, "tool-category");
  });

  relatedPosts.slice(0, 5).forEach((post) => {
    addCandidate(candidates, seen, getUsefulPhrase(post.heading || post.title), `/blogs/${post.slug}`, "blog");
    if (post.category && post.category !== blog?.category) {
      addCandidate(candidates, seen, post.category, `/blogs/category/${blogTaxonomySlug(post.category)}`, "category");
    }
    (Array.isArray(post.tags) ? post.tags : []).slice(0, 2).forEach((tag) => {
      addCandidate(candidates, seen, tag, `/blogs/tag/${blogTaxonomySlug(tag)}`, "tag");
    });
  });

  return candidates
    .filter((candidate) => candidate.phrase.toLowerCase() !== makeCandidateKey(blog?.heading || blog?.title || ""))
    .sort((a, b) => b.phrase.length - a.phrase.length)
    .slice(0, 8);
}

export function enhanceArticleInternalLinks(html = "", options = {}) {
  const candidates = getArticleInternalLinkCandidates(options);
  if (!html || !candidates.length) {
    return { html, insertedLinks: [] };
  }

  const existingHrefSet = new Set(
    [...String(html).matchAll(/href=["']([^"']+)["']/gi)].map((match) => match[1]),
  );
  const { source, blocks } = protectBlocks(html);
  let nextHtml = source;
  const insertedLinks = [];

  candidates.forEach((candidate) => {
    if (insertedLinks.length >= 4 || existingHrefSet.has(candidate.href)) return;
    const result = insertCandidateLink(nextHtml, candidate);
    if (!result.linked) return;
    nextHtml = result.html;
    insertedLinks.push(candidate);
    existingHrefSet.add(candidate.href);
  });

  return {
    html: restoreBlocks(nextHtml, blocks),
    insertedLinks,
  };
}
