const ALT_HOSTS = new Set(["altftool.com", "www.altftool.com", "localhost", "127.0.0.1"]);
const WEAK_ANCHOR_TEXT = new Set([
  "click here",
  "here",
  "read more",
  "learn more",
  "this",
  "link",
  "website",
  "visit",
  "more",
]);

export const MISSING_BLOG_REDIRECTS = {
  "ats-friendly-resume-templates": "/blogs/simple-resume-templates-that-look-clean-and-modern",
  "base64": "/tools/all?search=base64",
  "best": "/blogs?q=best",
  "best-": "/blogs?q=best",
  "bes": "/blogs?q=best",
  "best-ai-tools-for-coding-and-development": "/blogs?q=ai%20coding%20development",
  "best-productivity-tools-for-programmers": "/blogs?q=programmer%20productivity%20tools",
  "best-schema": "/blogs?q=schema",
  "best-utm": "/blogs?q=utm",
  "best-veed": "/blogs?q=veed",
  "business": "/blogs/category/business",
  "c": "/blogs?q=code",
  "json": "/tools/all?search=json",
  "percentage": "/tools/all?search=percentage",
  "resume-templates-for-freshers": "/blogs/simple-resume-templates-that-look-clean-and-modern",
  "what": "/blogs?q=ai%20systems",
};

function cleanText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function stripHtml(value = "") {
  return cleanText(String(value || "").replace(/<[^>]*>/g, " "));
}

function decodeHtml(value = "") {
  return String(value || "")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#34;/gi, '"')
    .replace(/&#x22;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function escapeHtml(value = "") {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function cleanHref(value = "") {
  return cleanText(decodeHtml(value))
    .replace(/\s+(?:target|rel|class|title|aria-[a-z-]+|data-[a-z-]+)\s*=.*$/i, "")
    .trim();
}

function generateSlug(value = "") {
  return cleanText(value)
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeBlogForLinkAudit(blog = {}) {
  const title = cleanText(blog.heading || blog.title) || "Untitled blog";
  return {
    ...blog,
    id: blog.id || blog.docId || blog.slug || title,
    title,
    slug: cleanText(blog.slug || generateSlug(title)).toLowerCase().replace(/^\/+|\/+$/g, ""),
    status: cleanText(blog.status).toLowerCase() === "published" ? "published" : "draft",
    category: cleanText(blog.category || blog.categoryName) || "Uncategorized",
    description: String(blog.description || blog.content || blog.body || ""),
  };
}

export function parseBlogAnchors(html = "") {
  const anchors = [];
  const pattern = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let match = pattern.exec(String(html || ""));

  while (match) {
    const attrs = match[1] || "";
    const hrefMatch = attrs.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const rawHref = hrefMatch?.[1] || hrefMatch?.[2] || hrefMatch?.[3] || "";
    const text = stripHtml(match[2] || "");
    anchors.push({
      attrs,
      href: cleanHref(rawHref),
      innerHtml: match[2] || "",
      text,
      raw: match[0],
    });
    match = pattern.exec(String(html || ""));
  }

  return anchors;
}

export function buildBlogSlugIndex(blogs = []) {
  const normalizedBlogs = blogs.map(normalizeBlogForLinkAudit).filter((blog) => blog.slug);
  const bySlug = new Map();
  const byId = new Map();
  const allSlugs = new Set();
  const publishedSlugs = new Set();

  normalizedBlogs.forEach((blog) => {
    bySlug.set(blog.slug, blog);
    byId.set(blog.id, blog);
    allSlugs.add(blog.slug);
    if (blog.status === "published") publishedSlugs.add(blog.slug);
  });

  return {
    allSlugs,
    byId,
    bySlug,
    normalizedBlogs,
    publishedSlugs,
  };
}

function classifyHref(href = "") {
  const value = cleanHref(href);
  const lower = value.toLowerCase();

  if (!value || value === "#") return { kind: "empty", href: value };
  if (value.startsWith("<")) return { kind: "malformed", href: value };
  if (lower.startsWith("javascript:") || lower.startsWith("data:")) return { kind: "unsafe", href: value };
  if (lower.startsWith("mailto:") || lower.startsWith("tel:")) return { kind: "contact", href: value };
  if (value.startsWith("#")) return { kind: "anchor", href: value };

  if (/^[a-z][a-z0-9+.-]*:/i.test(value) && !/^https?:\/\//i.test(value)) {
    return { kind: "unsupported", href: value };
  }

  try {
    const url = new URL(value, "https://altftool.com");
    const host = url.hostname.replace(/^www\./, "");
    const isAltHost = ALT_HOSTS.has(url.hostname) || ALT_HOSTS.has(host);
    const blogMatch = url.pathname.match(/^\/blogs\/([^/?#]+)/i);

    if (isAltHost && blogMatch?.[1]) {
      return {
        href: value,
        kind: "blog",
        pathname: url.pathname,
        relativeHref: `${url.pathname.replace(/\/+$/, "") || "/"}${url.search}${url.hash}`,
        slug: decodeURIComponent(blogMatch[1]).toLowerCase(),
      };
    }

    if (isAltHost || value.startsWith("/")) {
      return {
        href: value,
        kind: "site",
        pathname: url.pathname,
        relativeHref: `${url.pathname.replace(/\/+$/, "") || "/"}${url.search}${url.hash}`,
      };
    }

    return {
      host: url.hostname.replace(/^www\./, ""),
      href: value,
      kind: "external",
    };
  } catch {
    return { kind: "malformed", href: value };
  }
}

function buildIssue(link, type, label, detail = "") {
  return {
    ...link,
    detail,
    label,
    type,
  };
}

function isAbsoluteAltftoolHref(href = "") {
  return /^https?:\/\/(?:www\.)?altftool\.com\b/i.test(cleanHref(href));
}

function getMissingBlogRedirect(slug = "") {
  return MISSING_BLOG_REDIRECTS[String(slug || "").toLowerCase()] || "";
}

function titleFromSlug(slug = "") {
  return cleanText(slug.replace(/-/g, " ")).replace(/\b\w/g, (char) => char.toUpperCase());
}

function isWeakAnchorText(text = "") {
  const normalized = cleanText(text).toLowerCase();
  if (!normalized || normalized.length < 3) return true;
  if (WEAK_ANCHOR_TEXT.has(normalized)) return true;
  if (/^https?:\/\//i.test(normalized)) return true;
  return false;
}

function buildAnchorSuggestion(link, index) {
  const classification = link.classification || classifyHref(link.href);
  if (classification.kind === "blog") {
    const target = index.bySlug.get(classification.slug);
    return target?.title || titleFromSlug(classification.slug);
  }
  if (classification.kind === "site" && classification.pathname?.startsWith("/tools/")) {
    return `${titleFromSlug(classification.pathname.split("/").pop())} tool`;
  }
  if (classification.kind === "site") {
    return titleFromSlug(classification.pathname?.split("/").filter(Boolean).pop() || "AltFTool page");
  }
  if (classification.kind === "external") return link.classification.host || "External source";
  return "";
}

function replaceHrefInAnchor(raw = "", nextHref = "") {
  const escapedHref = String(nextHref || "").replace(/"/g, "&quot;");
  if (/\bhref\s*=\s*"/i.test(raw)) return raw.replace(/\bhref\s*=\s*"[^"]*"/i, `href="${escapedHref}"`);
  if (/\bhref\s*=\s*'/i.test(raw)) return raw.replace(/\bhref\s*=\s*'[^']*'/i, `href='${String(nextHref || "").replace(/'/g, "&#39;")}'`);
  if (/\bhref\s*=\s*[^\s>]+/i.test(raw)) return raw.replace(/\bhref\s*=\s*[^\s>]+/i, `href="${escapedHref}"`);
  return raw;
}

function replaceAnchorText(raw = "", nextText = "") {
  const text = escapeHtml(cleanText(nextText));
  if (!text) return raw;
  return String(raw || "").replace(/(<a\b[^>]*>)[\s\S]*?(<\/a>)/i, `$1${text}$2`);
}

export function buildBlogLinkAudit(blog = {}, allBlogs = []) {
  const current = normalizeBlogForLinkAudit(blog);
  const index = buildBlogSlugIndex(allBlogs);
  const links = parseBlogAnchors(current.description).map((link) => ({
    ...link,
    classification: classifyHref(link.href),
  }));
  const brokenLinks = [];
  const warnings = [];
  const internalBlogLinks = [];
  const validInternalBlogLinks = [];
  const externalLinks = [];
  const siteLinks = [];

  links.forEach((link) => {
    const classification = link.classification;

    if (!link.text && classification.kind !== "anchor") {
      warnings.push(buildIssue(link, "warning", "Empty anchor text", "Add descriptive link text."));
    }

    if (
      isWeakAnchorText(link.text) &&
      !["empty", "unsafe", "unsupported", "malformed", "anchor", "contact"].includes(classification.kind)
    ) {
      warnings.push(
        buildIssue(
          { ...link, suggestion: buildAnchorSuggestion(link, index) },
          "weak-anchor",
          "Weak anchor text",
          "Use descriptive anchor text that previews the linked destination.",
        ),
      );
    }

    if (classification.kind === "empty") {
      brokenLinks.push(buildIssue(link, "broken", "Empty href", "Replace # or blank href with a real destination."));
      return;
    }

    if (classification.kind === "unsafe") {
      brokenLinks.push(buildIssue(link, "broken", "Unsafe href", "Remove javascript: or data: links from blog content."));
      return;
    }

    if (classification.kind === "unsupported") {
      warnings.push(buildIssue(link, "warning", "Unsupported protocol", "Check this custom link protocol before publishing."));
      return;
    }

    if (classification.kind === "malformed") {
      brokenLinks.push(buildIssue(link, "broken", "Malformed URL", "Fix the URL format."));
      return;
    }

    if (classification.kind === "external") {
      externalLinks.push(link);
      return;
    }

    if (classification.kind === "site") {
      siteLinks.push(link);
      return;
    }

    if (classification.kind === "blog") {
      internalBlogLinks.push(link);
      const target = index.bySlug.get(classification.slug);
      if (!target) {
        const redirectHref = getMissingBlogRedirect(classification.slug);
        if (redirectHref) {
          warnings.push(
            buildIssue(
              { ...link, suggestion: redirectHref },
              "redirect",
              "Legacy blog redirect",
              `/blogs/${classification.slug} now redirects to ${redirectHref}.`,
            ),
          );
          return;
        }
        brokenLinks.push(buildIssue(link, "broken", "Missing blog", `/blogs/${classification.slug} is not in the blog collection.`));
        return;
      }
      if (target.status !== "published") {
        brokenLinks.push(buildIssue(link, "broken", "Draft blog link", `/blogs/${classification.slug} is not published.`));
        return;
      }
      if (classification.slug === current.slug) {
        warnings.push(buildIssue(link, "self-link", "Self link", "This article links to its own public URL."));
      }
      validInternalBlogLinks.push(link);
    }
  });

  return {
    brokenLinks,
    externalLinks,
    internalBlogLinks,
    linkCount: links.length,
    links,
    outboundSlugs: [...new Set(validInternalBlogLinks.map((link) => link.classification.slug))],
    siteLinks,
    validInternalBlogLinks,
    warnings,
  };
}

export function buildBlogLinkCleanupPatch(blog = {}, allBlogs = []) {
  const current = normalizeBlogForLinkAudit(blog);
  const audit = buildBlogLinkAudit(blog, allBlogs);
  let description = String(blog.description || blog.content || blog.body || "");
  const fixes = [];

  audit.links.forEach((link) => {
    const classification = link.classification;
    if (!description.includes(link.raw)) return;

    if (classification.kind === "blog" && classification.slug === current.slug) {
      description = description.replace(link.raw, link.innerHtml || link.text || "");
      fixes.push({
        href: link.href,
        kind: "self-link",
        label: "Removed self-link wrapper",
      });
      return;
    }

    if (classification.kind === "blog") {
      const redirectHref = getMissingBlogRedirect(classification.slug);
      if (redirectHref) {
        description = description.replace(link.raw, replaceHrefInAnchor(link.raw, redirectHref));
        fixes.push({
          from: link.href,
          href: redirectHref,
          kind: "legacy-redirect",
          label: "Repointed legacy blog link",
        });
        return;
      }
    }

    if (["blog", "site"].includes(classification.kind) && isAbsoluteAltftoolHref(link.href) && classification.relativeHref) {
      description = description.replace(link.raw, replaceHrefInAnchor(link.raw, classification.relativeHref));
      fixes.push({
        from: link.href,
        href: classification.relativeHref,
        kind: "normalize-internal",
        label: "Normalized AltFTool URL",
      });
    }
  });

  return {
    description,
    fixes,
    hasWork: fixes.length > 0 && description !== String(blog.description || blog.content || blog.body || ""),
  };
}

export function buildBlogWeakAnchorPatch(blog = {}, allBlogs = [], { limit = Infinity } = {}) {
  const audit = buildBlogLinkAudit(blog, allBlogs);
  let description = String(blog.description || blog.content || blog.body || "");
  const fixes = [];
  const maxFixes = Number.isFinite(limit) ? Math.max(0, limit) : Infinity;

  audit.warnings
    .filter((issue) => issue.type === "weak-anchor" && issue.suggestion)
    .some((issue) => {
      if (fixes.length >= maxFixes) return true;
      if (!description.includes(issue.raw)) return false;

      const suggestion = cleanText(issue.suggestion);
      const currentText = cleanText(issue.text) || "empty text";
      if (!suggestion || currentText.toLowerCase() === suggestion.toLowerCase()) return false;

      const nextAnchor = replaceAnchorText(issue.raw, suggestion);
      if (nextAnchor === issue.raw) return false;

      description = description.replace(issue.raw, nextAnchor);
      fixes.push({
        from: currentText,
        href: issue.href,
        kind: "weak-anchor",
        label: "Rewrote weak anchor text",
        to: suggestion,
      });
      return false;
    });

  return {
    description,
    fixes,
    hasWork: fixes.length > 0 && description !== String(blog.description || blog.content || blog.body || ""),
  };
}

export function buildBlogCombinedLinkPatch(blog = {}, allBlogs = []) {
  const originalDescription = String(blog.description || blog.content || blog.body || "");
  const cleanup = buildBlogLinkCleanupPatch(blog, allBlogs);
  const cleanupBlog = {
    ...blog,
    description: cleanup.description,
  };
  const weakAnchors = buildBlogWeakAnchorPatch(cleanupBlog, allBlogs);
  const fixes = [...cleanup.fixes, ...weakAnchors.fixes];

  return {
    description: weakAnchors.description,
    fixes,
    hasWork: fixes.length > 0 && weakAnchors.description !== originalDescription,
  };
}

export function createBlogLinkHealthReport(blogs = []) {
  const graph = buildBlogLinkGraph(blogs);
  const cleanupQueue = graph.nodes
    .map((node) => ({
      ...node,
      cleanup: buildBlogLinkCleanupPatch(node.blog, blogs),
    }))
    .filter((node) => node.cleanup.hasWork)
    .sort((a, b) => b.cleanup.fixes.length - a.cleanup.fixes.length || a.blog.title.localeCompare(b.blog.title));
  const weakAnchorQueue = graph.nodes
    .map((node) => ({
      ...node,
      weakAnchors: node.audit.warnings.filter((issue) => issue.type === "weak-anchor"),
    }))
    .filter((node) => node.weakAnchors.length > 0)
    .sort((a, b) => b.weakAnchors.length - a.weakAnchors.length || a.blog.title.localeCompare(b.blog.title));
  const selfLinkQueue = graph.nodes
    .map((node) => ({
      ...node,
      selfLinks: node.audit.warnings.filter((issue) => issue.type === "self-link"),
    }))
    .filter((node) => node.selfLinks.length > 0)
    .sort((a, b) => b.selfLinks.length - a.selfLinks.length || a.blog.title.localeCompare(b.blog.title));
  const redirectQueue = graph.nodes
    .map((node) => ({
      ...node,
      redirects: node.audit.warnings.filter((issue) => issue.type === "redirect"),
    }))
    .filter((node) => node.redirects.length > 0)
    .sort((a, b) => b.redirects.length - a.redirects.length || a.blog.title.localeCompare(b.blog.title));
  const combinedQueue = graph.nodes
    .map((node) => ({
      ...node,
      combined: buildBlogCombinedLinkPatch(node.blog, blogs),
    }))
    .filter((node) => node.combined.hasWork)
    .sort((a, b) => b.combined.fixes.length - a.combined.fixes.length || a.blog.title.localeCompare(b.blog.title));
  const weakAnchorCount = weakAnchorQueue.reduce((sum, node) => sum + node.weakAnchors.length, 0);
  const selfLinkCount = selfLinkQueue.reduce((sum, node) => sum + node.selfLinks.length, 0);
  const redirectCount = redirectQueue.reduce((sum, node) => sum + node.redirects.length, 0);
  const cleanupFixCount = cleanupQueue.reduce((sum, node) => sum + node.cleanup.fixes.length, 0);
  const combinedFixCount = combinedQueue.reduce((sum, node) => sum + node.combined.fixes.length, 0);
  const totalPosts = graph.nodes.length;
  const cleanPosts = graph.nodes.filter(
    (node) =>
      node.audit.brokenLinks.length === 0 &&
      node.audit.warnings.filter((issue) => ["weak-anchor", "self-link", "redirect"].includes(issue.type)).length === 0,
  ).length;

  return {
    combinedQueue,
    cleanupQueue,
    graph,
    redirectQueue,
    selfLinkQueue,
    weakAnchorQueue,
    summary: {
      brokenLinks: graph.summary.brokenLinks,
      cleanPosts,
      combinedFixCount,
      cleanupFixCount,
      redirectCount,
      selfLinkCount,
      totalPosts,
      weakAnchorCount,
      score: totalPosts ? Math.round((cleanPosts / totalPosts) * 100) : 100,
    },
  };
}

export function buildBlogLinkGraph(blogs = []) {
  const index = buildBlogSlugIndex(blogs);
  const inboundBySlug = new Map(index.normalizedBlogs.map((blog) => [blog.slug, 0]));
  const nodes = index.normalizedBlogs.map((blog) => {
    const audit = buildBlogLinkAudit(blog, index.normalizedBlogs);
    audit.outboundSlugs.forEach((slug) => {
      inboundBySlug.set(slug, (inboundBySlug.get(slug) || 0) + 1);
    });
    return {
      audit,
      blog,
      outboundCount: audit.outboundSlugs.length,
    };
  });

  const withInbound = nodes.map((node) => ({
    ...node,
    inboundCount: inboundBySlug.get(node.blog.slug) || 0,
  }));
  const published = withInbound.filter((node) => node.blog.status === "published");
  const brokenQueue = withInbound
    .filter((node) => node.audit.brokenLinks.length > 0)
    .sort((a, b) => b.audit.brokenLinks.length - a.audit.brokenLinks.length || a.blog.title.localeCompare(b.blog.title));
  const isolated = published
    .filter((node) => node.inboundCount === 0 && node.outboundCount === 0)
    .sort((a, b) => a.blog.title.localeCompare(b.blog.title));
  const missingOutbound = published
    .filter((node) => node.outboundCount === 0)
    .sort((a, b) => b.inboundCount - a.inboundCount || a.blog.title.localeCompare(b.blog.title));
  const hubs = published
    .filter((node) => node.inboundCount + node.outboundCount > 0)
    .sort((a, b) => b.inboundCount + b.outboundCount - (a.inboundCount + a.outboundCount) || b.inboundCount - a.inboundCount)
    .slice(0, 10);
  const nodeMap = new Map();
  const slugMap = new Map();

  withInbound.forEach((node) => {
    nodeMap.set(node.blog.id, node);
    slugMap.set(node.blog.slug, node);
  });

  return {
    brokenQueue,
    hubs,
    isolated,
    missingOutbound,
    nodeMap,
    nodes: withInbound,
    slugMap,
    summary: {
      brokenLinks: brokenQueue.reduce((total, node) => total + node.audit.brokenLinks.length, 0),
      externalLinks: withInbound.reduce((total, node) => total + node.audit.externalLinks.length, 0),
      internalLinks: withInbound.reduce((total, node) => total + node.outboundCount, 0),
      isolated: isolated.length,
      missingOutbound: missingOutbound.length,
      warnings: withInbound.reduce((total, node) => total + node.audit.warnings.length, 0),
    },
  };
}

const INTERNAL_LINK_STOP_WORDS = new Set([
  "about",
  "after",
  "also",
  "and",
  "are",
  "best",
  "can",
  "for",
  "from",
  "guide",
  "how",
  "into",
  "learn",
  "more",
  "that",
  "the",
  "this",
  "tool",
  "tools",
  "use",
  "using",
  "what",
  "when",
  "with",
  "your",
]);

function normalizeTagList(value) {
  if (Array.isArray(value)) return value.map(cleanText).filter(Boolean);
  return String(value || "")
    .split(/[,\n]/)
    .map(cleanText)
    .filter(Boolean);
}

function tokenizeForInternalLinks(value = "") {
  return new Set(
    stripHtml(value)
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length > 2 && !INTERNAL_LINK_STOP_WORDS.has(word)),
  );
}

function getTimestamp(value) {
  if (!value) return 0;
  if (typeof value?.toMillis === "function") return value.toMillis();
  if (typeof value?.seconds === "number") return value.seconds * 1000;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function getExistingBlogLinkSlugs(description = "") {
  return new Set(
    parseBlogAnchors(description)
      .map((link) => classifyHref(link.href))
      .filter((classification) => classification.kind === "blog")
      .map((classification) => classification.slug)
      .filter(Boolean),
  );
}

function getSuggestionConfidence(score = 0) {
  if (score >= 70) return "Strong";
  if (score >= 45) return "Good";
  return "Useful";
}

function buildSuggestionMeta(blog = {}, node = null) {
  const normalized = normalizeBlogForLinkAudit(blog);
  const tags = normalizeTagList(normalized.tags).map((tag) => tag.toLowerCase());

  return {
    blog: normalized,
    existingSlugs: getExistingBlogLinkSlugs(normalized.description),
    node,
    tagSet: new Set(tags),
    tags,
    tokens: tokenizeForInternalLinks(`${normalized.title} ${normalized.category} ${tags.join(" ")} ${normalized.description}`),
  };
}

function buildSuggestionContext(blogs = [], graph = null) {
  const linkGraph = graph || buildBlogLinkGraph(blogs);
  const metas = linkGraph.nodes.map((node) => buildSuggestionMeta(node.blog, node));
  const byId = new Map();
  const bySlug = new Map();

  metas.forEach((meta) => {
    byId.set(meta.blog.id, meta);
    bySlug.set(meta.blog.slug, meta);
  });

  return {
    byId,
    bySlug,
    graph: linkGraph,
    metas,
  };
}

function getCurrentSuggestionMeta(blog = {}, context) {
  const current = normalizeBlogForLinkAudit(blog);
  return context.byId.get(current.id) || context.bySlug.get(current.slug) || buildSuggestionMeta(current);
}

export function buildBlogInternalLinkSuggestions(blog = {}, allBlogs = [], { context = null, graph = null, limit = 5 } = {}) {
  const suggestionContext = context || buildSuggestionContext(allBlogs, graph);
  const currentMeta = getCurrentSuggestionMeta(blog, suggestionContext);
  const current = currentMeta.blog;

  return suggestionContext.metas
    .map((targetMeta) => {
      const target = targetMeta.blog;
      if (!target.slug || target.slug === current.slug || target.id === current.id) return null;
      if (target.status !== "published" || currentMeta.existingSlugs.has(target.slug)) return null;

      const sharedTags = targetMeta.tags.filter((tag) => currentMeta.tagSet.has(tag));
      const sharedTokens = [...targetMeta.tokens].filter((token) => currentMeta.tokens.has(token)).slice(0, 12);
      const sameCategory = current.category && current.category !== "Uncategorized" && current.category === target.category;
      const node = targetMeta.node || suggestionContext.graph.nodeMap.get(target.id) || suggestionContext.graph.slugMap.get(target.slug);
      const inboundCount = node?.inboundCount || 0;
      const outboundCount = node?.outboundCount || 0;
      const needsInbound = inboundCount === 0;
      const targetTime = getTimestamp(target.updatedAt || target.reviewedAt || target.date || target.createdAt);
      const daysOld = targetTime ? Math.max(0, (Date.now() - targetTime) / 86400000) : 180;
      const recentScore = Math.max(0, 10 - Math.floor(Math.min(daysOld, 180) / 18));
      const popularityScore = Math.min(16, Math.floor(Number(target.views || target.viewCount || 0) / 75));
      const hasBrokenLinks = (node?.audit?.brokenLinks?.length || 0) > 0;

      let score = 0;
      if (sameCategory) score += 32;
      score += sharedTags.length * 16;
      score += sharedTokens.length * 4;
      score += popularityScore + recentScore;
      if (needsInbound) score += 16;
      if (outboundCount === 0) score += 4;
      if (hasBrokenLinks) score -= 8;

      if (score < 18) return null;

      const reasons = [];
      if (sameCategory) reasons.push("same category");
      if (sharedTags.length) reasons.push(`${sharedTags.length} shared tags`);
      if (sharedTokens.length) reasons.push(`${sharedTokens.length} topic matches`);
      if (needsInbound) reasons.push("needs inbound");
      if (Number(target.views || target.viewCount || 0) > 0) reasons.push(`${Number(target.views || target.viewCount || 0).toLocaleString()} views`);

      return {
        anchorText: target.title,
        category: target.category,
        confidence: getSuggestionConfidence(score),
        href: `/blogs/${target.slug}`,
        id: target.id,
        inboundCount,
        outboundCount,
        reasons,
        score,
        slug: target.slug,
        title: target.title,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, limit);
}

export function buildBlogInternalLinkPlanHtml(blog = {}, suggestions = []) {
  const current = normalizeBlogForLinkAudit(blog);
  const links = suggestions
    .slice(0, 4)
    .map((suggestion) => `<li><a href="${escapeHtml(suggestion.href)}">${escapeHtml(suggestion.anchorText || suggestion.title)}</a></li>`)
    .join("");

  if (!links) return "";
  return `<section class="altf-smart-links"><h2>Recommended next reads</h2><p>Continue from ${escapeHtml(current.title)} with these related AltFTool guides.</p><ul>${links}</ul></section>`;
}

function removeGeneratedInternalLinkPlan(description = "") {
  return String(description || "")
    .replace(/<section\b[^>]*class=(["'])[^"']*\baltf-smart-links\b[^"']*\1[^>]*>[\s\S]*?<\/section>/gi, "")
    .replace(/<div\b[^>]*class=(["'])[^"']*\baltf-smart-links\b[^"']*\1[^>]*>[\s\S]*?<\/div>/gi, "")
    .trim();
}

function appendGeneratedHtmlBlock(description = "", block = "") {
  const base = String(description || "").trim();
  const html = String(block || "").trim();

  if (!html) return base;
  return base ? `${base}\n\n${html}` : html;
}

export function buildBlogInternalLinkPlanPatch(
  blog = {},
  allBlogs = [],
  { graph = null, limit = 4, suggestions = null } = {},
) {
  const originalDescription = String(blog.description || blog.content || blog.body || "");
  const planSuggestions = Array.isArray(suggestions) && suggestions.length
    ? suggestions.slice(0, limit)
    : buildBlogInternalLinkSuggestions(blog, allBlogs, { graph, limit });
  const planHtml = buildBlogInternalLinkPlanHtml(blog, planSuggestions);
  const descriptionWithoutOldPlan = removeGeneratedInternalLinkPlan(originalDescription);
  const description = appendGeneratedHtmlBlock(descriptionWithoutOldPlan, planHtml);
  const fixes = planSuggestions.map((suggestion) => ({
    from: normalizeBlogForLinkAudit(blog).title,
    href: suggestion.href,
    kind: "internal-link-plan",
    label: "Added internal link suggestion",
    to: suggestion.anchorText || suggestion.title,
  }));

  return {
    description,
    fixes,
    hasWork: Boolean(planHtml && fixes.length > 0 && description !== originalDescription),
    planHtml,
    suggestions: planSuggestions,
  };
}

export function buildBlogInternalLinkOpportunityReport(
  blogs = [],
  { graph = null, limit = 8, suggestionsPerBlog = 4 } = {},
) {
  const context = buildSuggestionContext(blogs, graph);
  const linkGraph = context.graph;
  const queue = linkGraph.nodes
    .filter((node) => node.blog.status === "published" && (node.outboundCount < 3 || node.inboundCount === 0))
    .map((node) => {
      const reasons = [];
      let priority = 0;

      if (node.outboundCount === 0) {
        priority += 38;
        reasons.push("No outbound blog links");
      } else if (node.outboundCount < 3) {
        priority += 14;
        reasons.push(`${node.outboundCount} outbound blog link${node.outboundCount === 1 ? "" : "s"}`);
      }

      if (node.inboundCount === 0) {
        priority += 22;
        reasons.push("No inbound links");
      }

      if (node.inboundCount === 0 && node.outboundCount === 0) {
        priority += 18;
        reasons.push("Isolated post");
      }

      const suggestions = buildBlogInternalLinkSuggestions(node.blog, blogs, {
        context,
        limit: suggestionsPerBlog,
      });

      if (!suggestions.length || priority <= 0) return null;
      const patch = buildBlogInternalLinkPlanPatch(node.blog, blogs, { suggestions });
      if (!patch.hasWork) return null;

      return {
        blog: node.blog,
        inboundCount: node.inboundCount,
        outboundCount: node.outboundCount,
        patch,
        planHtml: patch.planHtml,
        priority: Math.round(priority + suggestions[0].score / 5),
        reasons,
        suggestions,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.priority - a.priority || a.blog.title.localeCompare(b.blog.title))
    .slice(0, limit);

  return {
    graph: linkGraph,
    queue,
    summary: {
      isolated: linkGraph.summary.isolated,
      missingOutbound: linkGraph.summary.missingOutbound,
      opportunityCount: queue.length,
      suggestionCount: queue.reduce((total, item) => total + item.suggestions.length, 0),
      zeroInboundSuggestions: queue.reduce(
        (total, item) => total + item.suggestions.filter((suggestion) => suggestion.inboundCount === 0).length,
        0,
      ),
    },
  };
}
