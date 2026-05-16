"use client";

import { getBlogContentQuality, parseBlogTags } from "./BlogSeoChecklist";
import { getBlogSchemaHealth, stripBlogHtml } from "./blogSeoHealth";

export const ACTIONS = [
  {
    key: "seo",
    label: "SEO pack",
    shortLabel: "SEO",
    tone: "blue",
    matchGaps: ["quality", "rich-result", "review-date", "body"],
  },
  {
    key: "faq",
    label: "FAQ",
    shortLabel: "FAQ",
    tone: "amber",
    matchGaps: ["faq", "rich-result"],
  },
  {
    key: "sources",
    label: "Sources",
    shortLabel: "Sources",
    tone: "green",
    matchGaps: ["citations", "trust", "review-date", "rich-result"],
  },
  {
    key: "links",
    label: "Links",
    shortLabel: "Links",
    tone: "slate",
    matchGaps: ["internal-links"],
  },
  {
    key: "review",
    label: "Review",
    shortLabel: "Review",
    tone: "violet",
    matchGaps: ["trust", "review-date", "image"],
  },
];

export const GAP_FILTERS = [
  { value: "all", label: "All gaps" },
  { value: "rich-result", label: "Rich results" },
  { value: "quality", label: "Quality" },
  { value: "faq", label: "FAQ" },
  { value: "citations", label: "Sources" },
  { value: "internal-links", label: "Links" },
  { value: "trust", label: "Trust" },
  { value: "image", label: "Image" },
  { value: "review-date", label: "Review date" },
  { value: "body", label: "Depth" },
];

export const STATUS_FILTERS = [
  { value: "all", label: "All status" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
];

export const READINESS_FILTERS = [
  { value: "all", label: "All readiness" },
  { value: "critical", label: "Critical" },
  { value: "needs-work", label: "Needs work" },
  { value: "rich-ready", label: "Rich ready" },
  { value: "article-ready", label: "Article ready" },
  { value: "stale", label: "Stale" },
];

export const SORT_OPTIONS = [
  { value: "priority", label: "Priority" },
  { value: "quality-asc", label: "Lowest quality" },
  { value: "schema-asc", label: "Lowest schema" },
  { value: "updated-desc", label: "Recently updated" },
  { value: "title-asc", label: "Title A-Z" },
];

export const GAP_LABELS = {
  "rich-result": "Rich result",
  quality: "Quality",
  faq: "FAQ",
  citations: "Sources",
  "internal-links": "Links",
  trust: "Trust",
  image: "Image",
  "review-date": "Review date",
  body: "Depth",
};

const GAP_WEIGHTS = {
  "rich-result": 30,
  quality: 22,
  citations: 18,
  faq: 16,
  trust: 14,
  "internal-links": 14,
  image: 12,
  "review-date": 10,
  body: 8,
};

function cleanText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function toDate(value) {
  if (!value) return null;
  if (typeof value?.toDate === "function") {
    const date = value.toDate();
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (typeof value?.seconds === "number") {
    const date = new Date(value.seconds * 1000);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getDaysSince(value, fallback) {
  const date = toDate(value || fallback);
  if (!date) return null;
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)));
}

function normalizeStatus(value = "") {
  return cleanText(value).toLowerCase() === "published" ? "published" : "draft";
}

function getBlogTitle(blog = {}) {
  return cleanText(blog.heading || blog.title) || "Untitled blog";
}

function getBlogSlug(blog = {}) {
  return cleanText(blog.slug || "")
    .toLowerCase()
    .replace(/^\/+|\/+$/g, "");
}

function getCategory(blog = {}) {
  return cleanText(blog.category || blog.categoryName) || "Uncategorized";
}

function getBlogExcerpt(blog = {}) {
  return (
    cleanText(blog.seoDescription || blog.excerpt) ||
    stripBlogHtml(blog.description || blog.content || blog.body || "").slice(0, 160) ||
    "No excerpt available"
  );
}

function getGapList({ blog, quality, schemaHealth, daysSinceUpdate }) {
  const gaps = [];
  const addGap = (key, detail) => {
    gaps.push({
      key,
      label: GAP_LABELS[key],
      detail,
      weight: GAP_WEIGHTS[key] || 8,
    });
  };

  if (!schemaHealth.richResultReady) addGap("rich-result", "Article, FAQ, and citation inputs are incomplete.");
  if (quality.score < 75) addGap("quality", `SEO quality is ${quality.score}%.`);
  if (!schemaHealth.flags.hasFaq) addGap("faq", "Authored FAQ source is missing.");
  if (schemaHealth.flags.sourceCount < 1) addGap("citations", "No cited source is attached.");
  if (!schemaHealth.flags.hasInternalLink) addGap("internal-links", "No contextual AltFTool link found.");
  if (!schemaHealth.flags.hasTrustSignal || !cleanText(blog.author)) {
    addGap("trust", "Author, reviewer, or editorial context is incomplete.");
  }
  if (!schemaHealth.flags.hasHeroImage || !schemaHealth.flags.hasHeroAlt) {
    addGap("image", schemaHealth.flags.hasHeroImage ? "Featured image alt text needs work." : "Featured image is missing.");
  }
  if (!schemaHealth.flags.hasReviewDate || (daysSinceUpdate !== null && daysSinceUpdate >= 90)) {
    addGap("review-date", daysSinceUpdate !== null ? `${daysSinceUpdate} days since last update.` : "Review date is missing.");
  }
  if (schemaHealth.flags.wordCount < 250) addGap("body", `${schemaHealth.flags.wordCount} words in body.`);

  return gaps;
}

export function getRecommendedAction(gaps = []) {
  if (gaps.some((gap) => gap.key === "citations" || gap.key === "trust")) return "sources";
  if (gaps.some((gap) => gap.key === "faq")) return "faq";
  if (gaps.some((gap) => gap.key === "internal-links")) return "links";
  if (gaps.some((gap) => gap.key === "image" || gap.key === "review-date")) return "review";
  return "seo";
}

export function getActionConfig(actionKey = "seo") {
  return ACTIONS.find((action) => action.key === actionKey) || ACTIONS[0];
}

export function priorityLabel(score = 0) {
  if (score >= 70) return "Critical";
  if (score >= 42) return "Needs work";
  return "Monitor";
}

export function priorityTone(score = 0) {
  if (score >= 70) return "bg-red-50 text-red-600";
  if (score >= 42) return "bg-amber-50 text-amber-700";
  return "bg-green-50 text-green-700";
}

export function toneClasses(tone = "slate", active = false) {
  const map = {
    blue: active ? "border-blue-500 bg-blue-50 text-blue-700" : "border-blue-100 bg-white text-blue-700 hover:bg-blue-50",
    amber: active
      ? "border-amber-500 bg-amber-50 text-amber-700"
      : "border-amber-100 bg-white text-amber-700 hover:bg-amber-50",
    green: active
      ? "border-green-500 bg-green-50 text-green-700"
      : "border-green-100 bg-white text-green-700 hover:bg-green-50",
    violet: active
      ? "border-violet-500 bg-violet-50 text-violet-700"
      : "border-violet-100 bg-white text-violet-700 hover:bg-violet-50",
    slate: active
      ? "border-slate-700 bg-slate-900 text-white"
      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
  };
  return map[tone] || map.slate;
}

export function formatAuditDate(value, fallback = "No date") {
  const date = toDate(value);
  if (!date) return fallback;
  return date.toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" });
}

export function buildBlogAudit(blog = {}) {
  const body = blog.description || blog.content || blog.body || "";
  const normalizedBlog = {
    ...blog,
    heading: blog.heading || blog.title || "",
    description: body,
    tags: Array.isArray(blog.tags) ? blog.tags.join(", ") : blog.tags || "",
  };
  const schemaHealth = getBlogSchemaHealth(normalizedBlog);
  const quality = getBlogContentQuality({
    formData: normalizedBlog,
    imageAlt: blog.imageAlt || "",
    hasImage: Boolean(blog.image),
  });
  const tags = parseBlogTags(blog.tags);
  const daysSinceUpdate = getDaysSince(blog.reviewedAt || blog.updatedAt, blog.date || blog.createdAt);
  const updatedDate = toDate(blog.reviewedAt || blog.updatedAt || blog.date || blog.createdAt);
  const gaps = getGapList({ blog: normalizedBlog, quality, schemaHealth, daysSinceUpdate });
  const refreshScore = Math.min(
    100,
    gaps.reduce((total, gap) => total + gap.weight, 0) +
      (normalizeStatus(blog.status) === "published" ? 8 : 0) +
      (Number(blog.views || 0) > 500 ? 6 : 0),
  );

  return {
    ...blog,
    title: getBlogTitle(blog),
    slug: getBlogSlug(blog),
    excerpt: getBlogExcerpt(blog),
    category: getCategory(blog),
    status: normalizeStatus(blog.status),
    qualityScore: quality.score,
    qualityChecks: quality.checks,
    qualitySuggestions: quality.suggestions,
    schemaScore: schemaHealth.score,
    schemaHealth,
    tags,
    daysSinceUpdate,
    updatedDate,
    gaps,
    refreshScore,
    priority: priorityLabel(refreshScore),
    recommendedAction: getRecommendedAction(gaps),
    articleSchemaReady: schemaHealth.articleSchemaReady,
    richResultReady: schemaHealth.richResultReady,
    wordCount: schemaHealth.flags.wordCount,
    sourceCount: schemaHealth.flags.sourceCount,
    outboundLinkCount: schemaHealth.flags.outboundLinkCount,
    publicUrl: getBlogSlug(blog) ? `https://altftool.com/blogs/${getBlogSlug(blog)}` : "",
  };
}

export function buildQualitySummary(audits = []) {
  const published = audits.filter((blog) => blog.status === "published");
  const drafts = audits.filter((blog) => blog.status !== "published");
  const avgQuality = audits.length
    ? Math.round(audits.reduce((total, blog) => total + blog.qualityScore, 0) / audits.length)
    : 0;
  const avgSchema = audits.length
    ? Math.round(audits.reduce((total, blog) => total + blog.schemaScore, 0) / audits.length)
    : 0;
  const gapCounts = new Map();
  const actionCounts = new Map();

  audits.forEach((blog) => {
    blog.gaps.forEach((gap) => {
      gapCounts.set(gap.key, {
        key: gap.key,
        label: gap.label,
        count: (gapCounts.get(gap.key)?.count || 0) + 1,
      });
    });
    actionCounts.set(blog.recommendedAction, (actionCounts.get(blog.recommendedAction) || 0) + 1);
  });

  return {
    total: audits.length,
    published: published.length,
    drafts: drafts.length,
    avgQuality,
    avgSchema,
    healthScore: Math.round((avgQuality + avgSchema) / 2),
    richReady: published.filter((blog) => blog.richResultReady).length,
    articleReady: published.filter((blog) => blog.articleSchemaReady).length,
    needsWork: audits.filter((blog) => blog.gaps.length > 0).length,
    critical: audits.filter((blog) => blog.refreshScore >= 70).length,
    stale: published.filter((blog) => blog.daysSinceUpdate !== null && blog.daysSinceUpdate >= 90).length,
    missingSources: published.filter((blog) => blog.gaps.some((gap) => gap.key === "citations")).length,
    missingFaq: published.filter((blog) => blog.gaps.some((gap) => gap.key === "faq")).length,
    missingLinks: published.filter((blog) => blog.gaps.some((gap) => gap.key === "internal-links")).length,
    gapCounts: [...gapCounts.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)),
    actionCounts: ACTIONS.map((action) => ({
      ...action,
      count: actionCounts.get(action.key) || 0,
    })),
  };
}

export function sortBlogAudits(audits = [], sortMode = "priority") {
  const rows = [...audits];

  if (sortMode === "quality-asc") {
    return rows.sort((a, b) => a.qualityScore - b.qualityScore || b.refreshScore - a.refreshScore);
  }
  if (sortMode === "schema-asc") {
    return rows.sort((a, b) => a.schemaScore - b.schemaScore || b.refreshScore - a.refreshScore);
  }
  if (sortMode === "updated-desc") {
    return rows.sort((a, b) => (b.updatedDate?.getTime?.() || 0) - (a.updatedDate?.getTime?.() || 0));
  }
  if (sortMode === "title-asc") {
    return rows.sort((a, b) => a.title.localeCompare(b.title));
  }

  return rows.sort((a, b) => b.refreshScore - a.refreshScore || a.qualityScore - b.qualityScore || a.title.localeCompare(b.title));
}

export function filterBlogAudits(audits = [], filters = {}) {
  const {
    search = "",
    status = "all",
    gap = "all",
    readiness = "all",
    category = "all",
  } = filters;
  const query = cleanText(search).toLowerCase();

  return audits.filter((blog) => {
    if (status !== "all" && blog.status !== status) return false;
    if (category !== "all" && blog.category !== category) return false;
    if (gap !== "all" && !blog.gaps.some((item) => item.key === gap)) return false;

    if (readiness === "critical" && blog.refreshScore < 70) return false;
    if (readiness === "needs-work" && blog.gaps.length === 0) return false;
    if (readiness === "rich-ready" && !blog.richResultReady) return false;
    if (readiness === "article-ready" && !blog.articleSchemaReady) return false;
    if (readiness === "stale" && !(blog.daysSinceUpdate !== null && blog.daysSinceUpdate >= 90)) return false;

    if (!query) return true;
    return [
      blog.title,
      blog.excerpt,
      blog.category,
      blog.status,
      blog.author,
      blog.slug,
      blog.tags.join(" "),
      blog.gaps.map((item) => item.label).join(" "),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query);
  });
}
