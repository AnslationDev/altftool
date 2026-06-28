/**
 * Phase 2 — SEO audit intelligence (pure, dependency-free).
 *
 * Adds the checks the existing quality engine was missing:
 * Open Graph / Twitter, inline-image alt, orphan pages (link graph),
 * duplicate content, and an index-readiness score. All functions are pure
 * and unit-tested so they can power both the dashboard and a pre-publish gate.
 *
 * `fixAction` values map to the editor's quick-fix deep links
 * (`?refreshAction=seo|links|review|sources|faq`).
 */

import { stripHtml, wordCount, imagesMissingAlt, excerpt } from "./html.js";
import { slugify, isValidSlug } from "./slug.js";

export const SEVERITY = { blocker: 3, warning: 2, info: 1 };

function norm(value = "") {
  return stripHtml(value).toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
}

/** Stable, fast string fingerprint (djb2). */
export function fingerprint(value = "") {
  const words = norm(value).split(" ").filter(Boolean).slice(0, 60);
  if (words.length < 30) return ""; // too short to fingerprint reliably
  const str = words.join(" ");
  let h = 5381;
  for (let i = 0; i < str.length; i += 1) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return String(h >>> 0);
}

const INTERNAL_LINK_RE = /href\s*=\s*["']?(?:https?:\/\/[^/"']+)?\/blogs\/([a-z0-9][a-z0-9-]*)/gi;

/** Slugs of internal blog articles linked from this html (excludes archives). */
export function internalLinkTargets(html = "") {
  const out = new Set();
  const skip = new Set(["category", "tag", "author", "topics", "view-all"]);
  let m;
  INTERNAL_LINK_RE.lastIndex = 0;
  while ((m = INTERNAL_LINK_RE.exec(String(html || "")))) {
    const slug = m[1].toLowerCase();
    if (!skip.has(slug)) out.add(slug);
  }
  return [...out];
}

function blogSlug(blog = {}) {
  return slugify(blog.slug || blog.heading || blog.title || "");
}

/* ── Open Graph / Twitter ── */
export function ogTwitterIssues(blog = {}) {
  const issues = [];
  const title = blog.ogTitle || blog.seoTitle || blog.heading || "";
  const desc = blog.ogDescription || blog.seoDescription || excerpt(blog.description, 160) || "";
  const image = blog.ogImage || blog.image || "";

  if (!title.trim()) issues.push({ type: "og-title", severity: "blocker", label: "Missing social/OG title", fixAction: "seo" });
  if (!desc.trim()) issues.push({ type: "og-description", severity: "warning", label: "Missing social/OG description", fixAction: "seo" });
  if (!image) issues.push({ type: "og-image", severity: "warning", label: "No social share image (og:image)", fixAction: "seo" });

  const tDesc = blog.twitterDescription || desc;
  if (tDesc && tDesc.length > 200) {
    issues.push({ type: "twitter-description", severity: "info", label: "Twitter description over 200 chars", fixAction: "seo" });
  }
  return issues;
}

/* ── Inline-image + hero alt ── */
export function altTextIssues(blog = {}) {
  const issues = [];
  const missing = imagesMissingAlt(blog.description);
  if (missing > 0) {
    issues.push({ type: "inline-alt", severity: "warning", label: `${missing} inline image${missing === 1 ? "" : "s"} missing alt text`, fixAction: "seo" });
  }
  if (blog.image && !String(blog.imageAlt || "").trim()) {
    issues.push({ type: "hero-alt", severity: "warning", label: "Featured image missing alt text", fixAction: "seo" });
  }
  return issues;
}

/* ── Link graph + orphans ── */
export function buildLinkGraph(blogs = []) {
  const bySlug = new Map();
  for (const b of blogs) bySlug.set(blogSlug(b), b);

  const inbound = new Map();
  for (const b of blogs) {
    for (const target of internalLinkTargets(b.description)) {
      if (bySlug.has(target) && target !== blogSlug(b)) {
        inbound.set(target, (inbound.get(target) || 0) + 1);
      }
    }
  }
  return { inbound, bySlug };
}

export function orphanIssue(blog = {}, graph) {
  if ((blog.status || "draft") !== "published") return null;
  const inbound = graph?.inbound?.get(blogSlug(blog)) || 0;
  if (inbound > 0) return null;
  return { type: "orphan", severity: "warning", label: "Orphan page — no internal links point here", fixAction: "links" };
}

/* ── Duplicate content ── */
export function findDuplicateIds(blogs = []) {
  const byFingerprint = new Map();
  const byHeading = new Map();
  for (const b of blogs) {
    const fp = fingerprint(b.description);
    if (fp) {
      if (!byFingerprint.has(fp)) byFingerprint.set(fp, []);
      byFingerprint.get(fp).push(b.id);
    }
    const h = norm(b.heading || b.title || "");
    if (h) {
      if (!byHeading.has(h)) byHeading.set(h, []);
      byHeading.get(h).push(b.id);
    }
  }
  const dup = new Set();
  for (const group of [...byFingerprint.values(), ...byHeading.values()]) {
    if (group.length > 1) group.forEach((id) => dup.add(id));
  }
  return dup;
}

export function duplicateIssue(blog = {}, dupIds) {
  if (!dupIds?.has(blog.id)) return null;
  return { type: "duplicate", severity: "warning", label: "Possible duplicate title or content", fixAction: "seo" };
}

/* ── Index readiness ── */
export function indexReadiness(blog = {}) {
  const seoTitle = String(blog.seoTitle || "").trim();
  const metaDesc = String(blog.seoDescription || "").trim();
  const slug = blogSlug(blog);
  const links = internalLinkTargets(blog.description).length;
  const words = wordCount(blog.description);

  const checks = [
    { key: "seoTitle", ok: seoTitle.length >= 30 && seoTitle.length <= 65, label: "SEO title length" },
    { key: "metaDescription", ok: metaDesc.length >= 80 && metaDesc.length <= 165, label: "Meta description length" },
    { key: "image", ok: Boolean(blog.image), label: "Featured image" },
    { key: "imageAlt", ok: !blog.image || Boolean(String(blog.imageAlt || "").trim()), label: "Image alt text" },
    { key: "slug", ok: isValidSlug(slug), label: "Valid slug" },
    { key: "indexable", ok: !blog.noindex, label: "Indexable (not noindex)" },
    { key: "depth", ok: words >= 300, label: "Content depth (300+ words)" },
    { key: "internalLinks", ok: links >= 1, label: "At least one internal link" },
    { key: "schema", ok: Boolean(blog.author && blog.date), label: "Author + date for schema" },
  ];
  const passed = checks.filter((c) => c.ok).length;
  return {
    score: Math.round((passed / checks.length) * 100),
    blockers: checks.filter((c) => !c.ok).map((c) => c.label),
    checks,
  };
}

/* ── Per-blog combined audit ── */
export function auditBlogSeo(blog = {}, { graph, dupIds } = {}) {
  const readiness = indexReadiness(blog);
  const issues = [
    ...ogTwitterIssues(blog),
    ...altTextIssues(blog),
    orphanIssue(blog, graph),
    duplicateIssue(blog, dupIds),
  ].filter(Boolean);

  if (readiness.score < 100) {
    issues.push({
      type: "index-readiness",
      severity: readiness.score < 60 ? "blocker" : "warning",
      label: `Index readiness ${readiness.score}% (${readiness.blockers.slice(0, 2).join(", ")}${readiness.blockers.length > 2 ? "…" : ""})`,
      fixAction: "seo",
    });
  }

  const severityScore = issues.reduce((sum, i) => sum + (SEVERITY[i.severity] || 0), 0);
  const published = (blog.status || "draft") === "published";
  const views = Number(blog.views || 0);
  const impact = severityScore * (published ? 2 : 1) * (1 + Math.log10(views + 1));

  return { blog, issues, readiness, impact: Math.round(impact * 10) / 10, published };
}

/* ── Dashboard summary ── */
export function summarizeSeoHealth(blogs = []) {
  const graph = buildLinkGraph(blogs);
  const dupIds = findDuplicateIds(blogs);

  const items = blogs
    .map((blog) => auditBlogSeo(blog, { graph, dupIds }))
    .sort((a, b) => b.impact - a.impact);

  const withIssues = items.filter((i) => i.issues.length > 0);
  const blockers = items.filter((i) => i.issues.some((x) => x.severity === "blocker"));
  const avgReadiness = items.length
    ? Math.round(items.reduce((s, i) => s + i.readiness.score, 0) / items.length)
    : 0;

  return {
    items,
    kpis: {
      total: blogs.length,
      withIssues: withIssues.length,
      blockers: blockers.length,
      avgReadiness,
      orphans: items.filter((i) => i.issues.some((x) => x.type === "orphan")).length,
      duplicates: dupIds.size,
      missingOg: items.filter((i) => i.issues.some((x) => x.type.startsWith("og-"))).length,
      missingAlt: items.filter((i) => i.issues.some((x) => x.type.endsWith("-alt"))).length,
    },
  };
}

/** Issue-type → filter group, for the dashboard's filter chips. */
export const ISSUE_GROUPS = [
  { key: "all", label: "All issues" },
  { key: "index-readiness", label: "Index readiness" },
  { key: "og", label: "Open Graph / Twitter" },
  { key: "alt", label: "Image alt text" },
  { key: "orphan", label: "Orphan pages" },
  { key: "duplicate", label: "Duplicates" },
];

export function matchesGroup(item, group) {
  if (group === "all") return item.issues.length > 0;
  if (group === "og") return item.issues.some((i) => i.type.startsWith("og-") || i.type.startsWith("twitter-"));
  if (group === "alt") return item.issues.some((i) => i.type.endsWith("-alt"));
  return item.issues.some((i) => i.type === group);
}
