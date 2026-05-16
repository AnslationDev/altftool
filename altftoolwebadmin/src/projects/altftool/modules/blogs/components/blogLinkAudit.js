const ALT_HOSTS = new Set(["altftool.com", "www.altftool.com", "localhost", "127.0.0.1"]);

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
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
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
    const rawHref = decodeHtml(hrefMatch?.[1] || hrefMatch?.[2] || hrefMatch?.[3] || "");
    const text = stripHtml(match[2] || "");
    anchors.push({
      href: cleanText(rawHref),
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
  const value = cleanText(href);
  const lower = value.toLowerCase();

  if (!value || value === "#") return { kind: "empty", href: value };
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
        slug: decodeURIComponent(blogMatch[1]).toLowerCase(),
      };
    }

    if (isAltHost || value.startsWith("/")) {
      return {
        href: value,
        kind: "site",
        pathname: url.pathname,
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
        brokenLinks.push(buildIssue(link, "broken", "Missing blog", `/blogs/${classification.slug} is not in the blog collection.`));
        return;
      }
      if (target.status !== "published") {
        brokenLinks.push(buildIssue(link, "broken", "Draft blog link", `/blogs/${classification.slug} is not published.`));
        return;
      }
      if (classification.slug === current.slug) {
        warnings.push(buildIssue(link, "warning", "Self link", "This article links to its own public URL."));
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
