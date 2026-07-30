// ALTF Engine — Content Automation: blog lane prompt + validation.
// Produces documents byte-compatible with the manual add-blogs flow
// (same fields, same FAQ markup contract, same slug rules).

import { renderTemplate, resolveTemplate } from "./promptTemplates";

const FAQ_STOP = "<!-- FAQ End -->";

export function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function stripHtml(value = "") {
  return String(value)
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Pragmatic server-side HTML sanitizer for AI output.
 * Drafts are always human-reviewed before publish, but we still refuse the
 * dangerous stuff outright (scripts, embeds, event handlers, js: URLs).
 *
 * NOTE: this is a regex scrubber, not a real parser — browsers tolerate `/`
 * as an attribute separator (e.g. `<img src=x/onerror=...>`,
 * `<svg/onload=...>`) exactly like whitespace, so every on*= pattern below
 * must treat `[\s/]` as the separator class, not just `\s`. Regex-based
 * sanitization still carries residual risk against future
 * malformed/obfuscated markup a real DOM parser would catch — see
 * blogPreviewUtils.js's DOMPurify pass for the more robust alternative used
 * on the manual-editor preview path (not usable here: this runs server-side
 * in the automation lane, outside a DOM/browser environment).
 */
export function sanitizeBlogHtml(html = "") {
  return String(html)
    .replace(/<(script|style|iframe|object|embed|form|link|meta)[\s\S]*?<\/\1>/gi, "")
    .replace(/<(script|style|iframe|object|embed|form|link|meta)[^>]*\/?>/gi, "")
    .replace(/[\s/]+on\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/[\s/]+on\w+\s*=\s*'[^']*'/gi, "")
    .replace(/[\s/]+on\w+\s*=\s*[^\s>]+/gi, "")
    .replace(/href\s*=\s*(["'])\s*javascript:[^"']*\1/gi, 'href="#"')
    .replace(/src\s*=\s*(["'])\s*javascript:[^"']*\1/gi, "")
    .replace(/\sstyle\s*=\s*"[^"]*"/gi, "")
    .replace(/\sstyle\s*=\s*'[^']*'/gi, "")
    .trim();
}

/** Build the FAQ block using the EXACT public-renderer markup contract. */
export function buildFaqBlock(faqItems = []) {
  const items = faqItems
    .filter((item) => item?.question && item?.answer)
    .slice(0, 5)
    .map(
      (item) => `
  <div class="FAQ_ITEM">
    <button class="FAQ_Q">
      <span>${escapeHtml(item.question)}</span>
      <span class="FAQ_ICON"></span>
    </button>
    <div class="FAQ_A">
      <p>${escapeHtml(item.answer)}</p>
    </div>
  </div>`,
    )
    .join("");

  if (!items) return "";

  return `<!-- FAQ Start -->
<h2 class="FAQ_HEADING">Frequently asked questions</h2>
<div class="FAQ_WRAPPER" data-icon="plus">
${items}

</div>
${FAQ_STOP}`;
}

/** Strict response schema so the model can't drift from the doc contract. */
export const BLOG_JSON_SCHEMA = {
  name: "altftool_blog_draft",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: [
      "heading",
      "seoTitle",
      "seoDescription",
      "excerpt",
      "category",
      "tags",
      "html",
      "faq",
      "sources",
    ],
    properties: {
      heading: { type: "string", description: "Post title, 30-70 chars, descriptive, no clickbait." },
      seoTitle: { type: "string", description: "Meta title <= 60 chars." },
      seoDescription: { type: "string", description: "Meta description 120-160 chars." },
      excerpt: { type: "string", description: "Plain-text summary <= 160 chars." },
      category: { type: "string", description: "EXACTLY one of the provided category names." },
      tags: {
        type: "array",
        minItems: 3,
        maxItems: 6,
        items: { type: "string" },
      },
      html: {
        type: "string",
        description:
          "Article body as clean HTML: <p>, <h2>, <h3>, <ul>, <ol>, <li>, <strong>, <em>, <a>, <blockquote>, <table> only. NO <h1>, NO script/style, NO FAQ section (added separately).",
      },
      faq: {
        type: "array",
        minItems: 3,
        maxItems: 4,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["question", "answer"],
          properties: {
            question: { type: "string" },
            answer: { type: "string" },
          },
        },
      },
      sources: {
        type: "array",
        minItems: 2,
        maxItems: 4,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["title", "url"],
          properties: {
            title: { type: "string" },
            url: { type: "string", description: "Real, reputable https URL." },
          },
        },
      },
    },
  },
};

export function buildBlogSystemPrompt(settings = {}) {
  return renderTemplate(resolveTemplate(settings, "blogSystem"), { brand: "AltFTool" });
}

export function buildBlogUserPrompt({ topic, keywords = [], brief = "", categories = [], trendingQueries = [] }, settings = {}) {
  return renderTemplate(resolveTemplate(settings, "blogUser"), {
    topic,
    keywordsLine: keywords.length ? `Target keywords: ${keywords.join(", ")}` : "",
    briefLine: brief ? `Editorial brief: ${brief}` : "",
    trendingLine: trendingQueries.length
      ? `Real Google Search Console queries our audience uses (weave naturally where relevant): ${trendingQueries.slice(0, 8).join("; ")}`
      : "",
    categories: categories.join(", ") || "Tools",
  });
}

/** Critique prompt for the one-shot quality retry. */
export function buildCritiqueUserPrompt(previous, audit, settings = {}) {
  return renderTemplate(resolveTemplate(settings, "blogCritique"), {
    missing: (audit?.missing || []).join(", ") || "quality threshold not met",
    score: audit?.score ?? 0,
    threshold: audit?.threshold ?? 75,
    previousJson: JSON.stringify(previous),
  });
}

/** Assemble the Firestore blog document (manual add-blogs contract + AI provenance). */
export function assembleBlogDoc({ generated, slug, settings, topicId, model }) {
  const html = sanitizeBlogHtml(generated.html || "");
  const faqBlock = buildFaqBlock(generated.faq || []);
  const description = faqBlock ? `${html}\n${faqBlock}` : html;
  const excerpt = stripHtml(generated.excerpt || description).slice(0, 160);
  const today = new Date().toISOString().slice(0, 10);

  return {
    heading: String(generated.heading || "").trim(),
    slug,
    category: String(generated.category || "").trim(),
    author: settings.blog.defaultAuthor,
    authorRole: settings.blog.defaultAuthorRole,
    reviewedBy: settings.blog.reviewedBy,
    editorialNote:
      "AI-assisted draft — verify facts, links, and sources before publishing.",
    reviewedAt: today,
    sources: (generated.sources || []).map((s) => ({
      title: String(s.title || "").trim(),
      url: String(s.url || "").trim(),
      needsVerification: true,
    })),
    sourceNotes: "",
    description,
    excerpt,
    date: today,
    seoTitle: String(generated.seoTitle || "").trim().slice(0, 70),
    seoDescription: String(generated.seoDescription || "").trim().slice(0, 180) || excerpt,
    image: "",
    imageAlt: "",
    views: 0,
    likesCount: 0,
    commentsCount: 0,
    feedbackCount: 0,
    helpfulCount: 0,
    notHelpfulCount: 0,
    status: "draft",
    workflowState: "in_review",
    tags: (generated.tags || []).map((t) => String(t).trim()).filter(Boolean).slice(0, 6),
    generatedBy: "ai",
    aiModel: model,
    aiTopicId: topicId,
  };
}
