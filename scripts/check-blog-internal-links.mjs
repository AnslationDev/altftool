import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const workspaceRoot = path.resolve(import.meta.dirname, "..");
const webRoot = path.join(workspaceRoot, "altftoolweb");
const localBlogPath = path.join(webRoot, "src/app/blogs/data/blogs.json");
const toolMetaPath = path.join(webRoot, "src/platform/registry/toolMetaMap.js");

const args = process.argv.slice(2);
const argSet = new Set(args);
const jsonMode = argSet.has("--json");
const liveMode = argSet.has("--live") || process.env.ALTFT_BLOG_LINKS_LIVE === "true";
const strictMode = argSet.has("--strict") || process.env.ALTFT_BLOG_LINKS_STRICT === "true";
const limitArg = args.find((arg) => arg.startsWith("--limit="))?.split("=")[1];
const auditLimit = Math.min(Math.max(Number(limitArg || process.env.ALTFT_BLOG_LINKS_LIMIT || 120), 1), 250);

const FIREBASE_API_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
  "AIzaSyAYKc0SBXyY3bfKLkmcCrPf-NsPF8p_Z50";
const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "altftool-bca36";
const PROJECT_ID = "altftool";
const FIRESTORE_PARENT = `projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/projects/${PROJECT_ID}`;

const LIVE_FIELDS = [
  "heading",
  "title",
  "slug",
  "category",
  "tool",
  "topic",
  "author",
  "description",
  "content",
  "body",
  "excerpt",
  "tags",
  "status",
  "createdAt",
  "updatedAt",
];

const STATIC_ROUTES = new Set([
  "/",
  "/blogs",
  "/blogs/topics",
  "/tools",
  "/tools/all",
  "/search",
  "/rss.xml",
  "/sitemap.xml",
  "/robots.txt",
]);

const STATIC_ASSET_PREFIXES = [
  "/images/",
  "/games/",
  "/icons/",
  "/media/",
  "/assets/",
  "/favicon",
  "/manifest",
  "/_next/",
];

const ROUTE_PREFIXES_THAT_RENDER_EMPTY_STATES = [
  "/blogs/category/",
  "/blogs/tag/",
  "/blogs/author/",
  "/blogs/topics/",
  "/blogs/view-all/",
  "/buysmart/stores/",
  "/extensions/",
  "/news/",
  "/wattpad/",
];

const IGNORED_PROTOCOLS = /^(?:mailto|tel|sms|javascript|data|blob):/i;
const ALTFT_HOSTS = new Set(["altftool.com", "www.altftool.com", "localhost", "127.0.0.1"]);
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

const MISSING_BLOG_REDIRECTS = new Set([
  "ats-friendly-resume-templates",
  "base64",
  "best",
  "best-",
  "bes",
  "best-ai-tools-for-coding-and-development",
  "best-productivity-tools-for-programmers",
  "best-schema",
  "best-utm",
  "best-veed",
  "business",
  "c",
  "json",
  "percentage",
  "resume-templates-for-freshers",
  "what",
]);

function slugifyBlogTaxonomy(value = "") {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function slugifyToolCategory(value = "") {
  return String(value).trim().toLowerCase().replace(/\s+/g, "-");
}

function decodeBasicHtmlEntities(value = "") {
  return String(value)
    .replace(/&quot;/gi, "\"")
    .replace(/&#34;/g, "\"")
    .replace(/&#x22;/gi, "\"")
    .replace(/&apos;/gi, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&")
    .replace(/&nbsp;/gi, " ");
}

function stripHtml(value = "") {
  return decodeBasicHtmlEntities(value)
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeBlog(blog = {}, index = 0, source = "local") {
  const heading = blog.heading || blog.title || "Untitled AltFTool guide";
  const slug = blog.slug || slugifyBlogTaxonomy(heading);
  const category = blog.category || "Guides";
  const tags = Array.isArray(blog.tags)
    ? blog.tags.filter(Boolean)
    : [category, blog.tool, blog.topic].filter(Boolean);

  return {
    ...blog,
    id: blog.id || slug || `blog-${index}`,
    auditSource: source,
    heading,
    title: heading,
    slug,
    category,
    tool: blog.tool || blog.topic || category,
    author: blog.author || "AltFTool Editorial",
    tags: [...new Set(tags.map((tag) => String(tag).trim()).filter(Boolean))],
    content: blog.description || blog.content || blog.body || blog.excerpt || "",
  };
}

async function loadLocalBlogs(limit = auditLimit) {
  const raw = JSON.parse(await readFile(localBlogPath, "utf8"));
  const rows = Array.isArray(raw) ? raw : raw.blogs || [];
  return rows.slice(0, limit).map((blog, index) => normalizeBlog(blog, index, "local"));
}

function firestoreValueToJs(value) {
  if (!value) return undefined;
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return Number(value.doubleValue);
  if ("booleanValue" in value) return Boolean(value.booleanValue);
  if ("timestampValue" in value) return value.timestampValue;
  if ("nullValue" in value) return null;
  if ("arrayValue" in value) return (value.arrayValue.values || []).map(firestoreValueToJs);
  if ("mapValue" in value) {
    return Object.fromEntries(
      Object.entries(value.mapValue.fields || {}).map(([key, nestedValue]) => [
        key,
        firestoreValueToJs(nestedValue),
      ]),
    );
  }
  return undefined;
}

function decodeDocument(document) {
  return Object.fromEntries(
    Object.entries(document.fields || {}).map(([key, value]) => [key, firestoreValueToJs(value)]),
  );
}

async function fetchLiveBlogs() {
  const response = await fetch(
    `https://firestore.googleapis.com/v1/${FIRESTORE_PARENT}:runQuery?key=${FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        structuredQuery: {
          select: {
            fields: LIVE_FIELDS.map((fieldPath) => ({ fieldPath })),
          },
          from: [{ collectionId: "blogs" }],
          where: {
            fieldFilter: {
              field: { fieldPath: "status" },
              op: "EQUAL",
              value: { stringValue: "published" },
            },
          },
          orderBy: [{ field: { fieldPath: "createdAt" }, direction: "DESCENDING" }],
          limit: Math.min(auditLimit, 100),
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Firestore blog link audit failed: ${response.status}`);
  }

  const rows = await response.json();
  return rows
    .filter((row) => row.document)
    .map((row, index) => normalizeBlog(decodeDocument(row.document), index, "live"));
}

async function fetchLiveBlogSlugExists(slug) {
  const response = await fetch(
    `https://firestore.googleapis.com/v1/${FIRESTORE_PARENT}:runQuery?key=${FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        structuredQuery: {
          select: {
            fields: [{ fieldPath: "slug" }],
          },
          from: [{ collectionId: "blogs" }],
          where: {
            compositeFilter: {
              op: "AND",
              filters: [
                {
                  fieldFilter: {
                    field: { fieldPath: "slug" },
                    op: "EQUAL",
                    value: { stringValue: slug },
                  },
                },
                {
                  fieldFilter: {
                    field: { fieldPath: "status" },
                    op: "EQUAL",
                    value: { stringValue: "published" },
                  },
                },
              ],
            },
          },
          limit: 1,
        },
      }),
    },
  );

  if (!response.ok) return false;
  const rows = await response.json();
  return rows.some((row) => row.document);
}

async function fetchExistingLiveBlogSlugs(slugs = []) {
  const found = new Set();
  const uniqueSlugs = [...new Set(slugs.filter(Boolean))].slice(0, 250);
  const batchSize = 8;

  for (let index = 0; index < uniqueSlugs.length; index += batchSize) {
    const batch = uniqueSlugs.slice(index, index + batchSize);
    const results = await Promise.all(
      batch.map(async (slug) => ({
        slug,
        exists: await fetchLiveBlogSlugExists(slug),
      })),
    );

    results.forEach((result) => {
      if (result.exists) found.add(result.slug);
    });
  }

  return found;
}

async function readToolMetaMap() {
  const source = await readFile(toolMetaPath, "utf8");
  const match = source.match(/export const toolMetaMap = (\{[\s\S]*\});?\s*$/);

  if (!match) {
    throw new Error("Unable to parse altftoolweb/src/platform/registry/toolMetaMap.js");
  }

  return JSON.parse(match[1]);
}

function getToolCategories(tool = {}) {
  if (!tool?.category) return [];
  return Array.isArray(tool.category) ? tool.category : [tool.category];
}

async function discoverStaticAppRoutes() {
  const routes = new Set(STATIC_ROUTES);
  const appRoot = path.join(webRoot, "src/app");

  async function walk(directory, segments = []) {
    const entries = await readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        if (entry.name.startsWith("_") || entry.name.startsWith("(")) {
          await walk(fullPath, segments);
          continue;
        }
        if (entry.name.startsWith("@") || entry.name.includes("[") || entry.name === "api") continue;
        await walk(fullPath, [...segments, entry.name]);
        continue;
      }

      if (!/^page\.(jsx?|tsx?)$/.test(entry.name)) continue;
      routes.add(`/${segments.join("/")}`.replace(/\/$/, "") || "/");
    }
  }

  await walk(appRoot);
  return routes;
}

function buildRouteInventory({ blogs, toolMetaMap, staticRoutes, extraBlogSlugs = new Set() }) {
  const blogSlugs = new Set();
  const blogCategorySlugs = new Set();
  const blogTagSlugs = new Set();
  const blogAuthorSlugs = new Set();
  const toolSlugs = new Set(Object.keys(toolMetaMap));
  const toolCategorySlugsByTool = new Map();
  const allToolCategorySlugs = new Set(["all"]);

  blogs.forEach((blog) => {
    if (blog.slug) blogSlugs.add(blog.slug);
    if (blog.category) blogCategorySlugs.add(slugifyBlogTaxonomy(blog.category));
    if (blog.author) blogAuthorSlugs.add(slugifyBlogTaxonomy(blog.author));
    blog.tags.forEach((tag) => blogTagSlugs.add(slugifyBlogTaxonomy(tag)));
  });

  extraBlogSlugs.forEach((slug) => {
    if (slug) blogSlugs.add(slug);
  });

  Object.entries(toolMetaMap).forEach(([slug, tool]) => {
    const categories = getToolCategories(tool).map(slugifyToolCategory).filter(Boolean);
    toolCategorySlugsByTool.set(slug, new Set(["all", ...categories]));
    categories.forEach((category) => allToolCategorySlugs.add(category));
  });

  return {
    staticRoutes,
    blogSlugs,
    blogCategorySlugs,
    blogTagSlugs,
    blogAuthorSlugs,
    toolSlugs,
    toolCategorySlugsByTool,
    allToolCategorySlugs,
  };
}

function normalizeHref(href = "") {
  const raw = decodeBasicHtmlEntities(href)
    .trim()
    .replace(/\s+(?:target|rel|class|title|aria-[a-z-]+|data-[a-z-]+)\s*=.*$/i, "");
  if (!raw || raw.startsWith("#") || IGNORED_PROTOCOLS.test(raw)) {
    return { ignored: true, raw };
  }
  if (raw.startsWith("<")) {
    return { ignored: true, raw, malformed: true };
  }

  let url;
  try {
    url = raw.startsWith("//")
      ? new URL(`https:${raw}`)
      : new URL(raw, "https://altftool.com");
  } catch {
    return { ignored: false, raw, path: "", error: "Invalid URL" };
  }

  const isRelative = raw.startsWith("/") && !raw.startsWith("//");
  const isInternal = isRelative || ALTFT_HOSTS.has(url.hostname);
  if (!isInternal) return { ignored: true, raw, external: true };

  const pathName = decodeURIComponent(url.pathname).replace(/\/+$/, "") || "/";
  return {
    ignored: false,
    raw,
    path: pathName,
    search: url.search,
    hash: url.hash,
  };
}

function isKnownStaticAsset(pathName = "") {
  return STATIC_ASSET_PREFIXES.some((prefix) => pathName.startsWith(prefix));
}

function validateInternalPath(pathName, inventory) {
  if (!pathName) return "Invalid URL";
  if (isKnownStaticAsset(pathName)) return null;
  if (inventory.staticRoutes.has(pathName)) return null;

  const blogMatch = pathName.match(/^\/blogs\/([^/]+)$/);
  if (blogMatch) {
    if (MISSING_BLOG_REDIRECTS.has(blogMatch[1])) return null;
    return inventory.blogSlugs.has(blogMatch[1])
      ? null
      : `Unknown blog slug: ${blogMatch[1]}`;
  }

  const blogCategoryMatch = pathName.match(/^\/blogs\/category\/([^/]+)$/);
  if (blogCategoryMatch) {
    return inventory.blogCategorySlugs.has(blogCategoryMatch[1])
      ? null
      : `Unknown blog category: ${blogCategoryMatch[1]}`;
  }

  const blogTagMatch = pathName.match(/^\/blogs\/tag\/([^/]+)$/);
  if (blogTagMatch) {
    return inventory.blogTagSlugs.has(blogTagMatch[1])
      ? null
      : `Unknown blog tag: ${blogTagMatch[1]}`;
  }

  const blogAuthorMatch = pathName.match(/^\/blogs\/author\/([^/]+)$/);
  if (blogAuthorMatch) {
    return inventory.blogAuthorSlugs.has(blogAuthorMatch[1])
      ? null
      : `Unknown blog author: ${blogAuthorMatch[1]}`;
  }

  const toolCategoryMatch = pathName.match(/^\/tools\/([^/]+)$/);
  if (toolCategoryMatch) {
    return inventory.allToolCategorySlugs.has(toolCategoryMatch[1])
      ? null
      : `Unknown tool category: ${toolCategoryMatch[1]}`;
  }

  const toolDetailMatch = pathName.match(/^\/tools\/([^/]+)\/([^/]+)$/);
  if (toolDetailMatch) {
    const [, category, slug] = toolDetailMatch;
    if (!inventory.toolSlugs.has(slug)) return `Unknown tool slug: ${slug}`;
    const allowedCategories = inventory.toolCategorySlugsByTool.get(slug) || new Set(["all"]);
    return allowedCategories.has(category)
      ? null
      : `Tool ${slug} is not registered in category ${category}`;
  }

  if (ROUTE_PREFIXES_THAT_RENDER_EMPTY_STATES.some((prefix) => pathName.startsWith(prefix))) {
    return null;
  }

  return `Unknown internal route: ${pathName}`;
}

function extractArticleAnchors(html = "") {
  const anchors = [];
  const pattern = /<a\b([^>]*)\bhref\s*=\s*(["'])(.*?)\2([^>]*)>([\s\S]*?)<\/a>/gi;
  let match;
  const decodedHtml = decodeBasicHtmlEntities(html);

  while ((match = pattern.exec(String(decodedHtml || "")))) {
    anchors.push({
      href: match[3],
      anchorText: stripHtml(match[5]),
    });
  }

  return anchors;
}

function collectReferencedBlogSlugs(blogs = []) {
  const slugs = new Set();

  blogs.forEach((blog) => {
    extractArticleAnchors(blog.content).forEach((anchor) => {
      const normalized = normalizeHref(anchor.href);
      if (normalized.ignored || !normalized.path) return;
      const match = normalized.path.match(/^\/blogs\/([^/]+)$/);
      if (match?.[1]) slugs.add(match[1]);
    });
  });

  return slugs;
}

function isWeakAnchorText(anchorText = "") {
  const text = anchorText.toLowerCase().replace(/\s+/g, " ").trim();
  if (!text || text.length < 3) return true;
  if (WEAK_ANCHOR_TEXT.has(text)) return true;
  if (/^https?:\/\//i.test(text)) return true;
  return false;
}

function getRelatedBlogsForAudit(blog, blogs, limit = 6) {
  const currentTags = new Set(blog.tags.map(slugifyBlogTaxonomy));

  return blogs
    .filter((candidate) => candidate.slug && candidate.slug !== blog.slug)
    .map((candidate, index) => {
      const sameCategory = blog.category && candidate.category && blog.category === candidate.category;
      const tagOverlap = candidate.tags.reduce(
        (score, tag) => score + (currentTags.has(slugifyBlogTaxonomy(tag)) ? 1 : 0),
        0,
      );
      const sameTool = blog.tool && candidate.tool && blog.tool === candidate.tool;
      return {
        candidate,
        index,
        score: (sameCategory ? 40 : 0) + tagOverlap * 18 + (sameTool ? 16 : 0),
      };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map((item) => item.candidate);
}

function tokenize(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function getRelatedToolsForAudit(blog, toolMetaMap, limit = 6) {
  const haystack = [
    blog.heading,
    blog.category,
    blog.tool,
    blog.topic,
    blog.excerpt,
    blog.content,
    ...blog.tags,
  ].filter(Boolean).join(" ");
  const tokens = new Set(tokenize(haystack));
  const fallbackSlugs = [
    "youtube-thumbnail-downloader",
    "image-compressor",
    "pdf-merger",
    "json-editor",
    "qr-generator",
    "password-generator",
  ];

  const scored = Object.entries(toolMetaMap)
    .map(([slug, tool]) => {
      const categoryText = getToolCategories(tool).join(" ");
      const toolTokens = [
        ...tokenize(slug),
        ...tokenize(tool.name),
        ...tokenize(categoryText),
      ];
      const score = toolTokens.reduce((sum, token) => sum + (tokens.has(token) ? 1 : 0), 0);
      return { slug, tool, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.slug.localeCompare(b.slug));

  const fallback = fallbackSlugs
    .filter((slug) => toolMetaMap[slug] && !scored.some((item) => item.slug === slug))
    .map((slug) => ({ slug, tool: toolMetaMap[slug], score: 0 }));

  return [...scored, ...fallback].slice(0, limit).map(({ slug, tool }) => ({
    slug,
    href: `/tools/all/${slug}`,
    searchHref: `/tools/all?search=${encodeURIComponent(getToolCategories(tool)[0] || tool.name || slug)}`,
  }));
}

function buildRenderedLinkSurface(blog, blogs, toolMetaMap) {
  const links = [];

  if (blog.category) {
    links.push({
      source: "generated:blog-category",
      href: `/blogs/category/${slugifyBlogTaxonomy(blog.category)}`,
      anchorText: blog.category,
    });
  }

  if (blog.author) {
    links.push({
      source: "generated:blog-author",
      href: `/blogs/author/${slugifyBlogTaxonomy(blog.author)}`,
      anchorText: blog.author,
    });
  }

  blog.tags.slice(0, 8).forEach((tag) => {
    links.push({
      source: "generated:blog-tag",
      href: `/blogs/tag/${slugifyBlogTaxonomy(tag)}`,
      anchorText: tag,
    });
  });

  getRelatedBlogsForAudit(blog, blogs, 6).forEach((post) => {
    links.push({
      source: "generated:related-blog",
      href: `/blogs/${post.slug}`,
      anchorText: post.heading || post.title || post.slug,
    });
  });

  getRelatedToolsForAudit(blog, toolMetaMap, 6).forEach((tool) => {
    links.push({
      source: "generated:related-tool",
      href: tool.href,
      anchorText: tool.slug.replace(/-/g, " "),
    });
    links.push({
      source: "generated:tool-search",
      href: tool.searchHref,
      anchorText: "related tool category",
    });
  });

  return links;
}

function auditBlog(blog, blogs, toolMetaMap, inventory) {
  const rawAnchors = extractArticleAnchors(blog.content).map((anchor) => ({
    ...anchor,
    source: "content",
  }));
  const generatedLinks = buildRenderedLinkSurface(blog, blogs, toolMetaMap);
  const allLinks = [...rawAnchors, ...generatedLinks];
  const brokenLinks = [];
  const selfLinks = [];
  const weakAnchors = [];
  const internalTargets = new Set();

  allLinks.forEach((link) => {
    const normalized = normalizeHref(link.href);
    if (normalized.ignored) return;

    const reason = normalized.error || validateInternalPath(normalized.path, inventory);
    const issue = {
      slug: blog.slug,
      title: blog.heading,
      source: link.source,
      href: link.href,
      path: normalized.path,
      anchorText: link.anchorText,
    };

    if (reason) {
      brokenLinks.push({ ...issue, reason });
      return;
    }

    internalTargets.add(normalized.path);

    if (normalized.path === `/blogs/${blog.slug}`) {
      selfLinks.push({ ...issue, reason: "Internal article links to itself" });
    }

    if (link.source === "content" && isWeakAnchorText(link.anchorText)) {
      weakAnchors.push({ ...issue, reason: "Weak anchor text" });
    }
  });

  return {
    slug: blog.slug,
    title: blog.heading,
    source: blog.auditSource,
    rawAnchorCount: rawAnchors.length,
    generatedLinkCount: generatedLinks.length,
    internalTargetCount: internalTargets.size,
    brokenLinks,
    selfLinks,
    weakAnchors,
    coverageWarning:
      internalTargets.size >= 4
        ? null
        : `Only ${internalTargets.size} internal targets found across article and rendered blog modules`,
  };
}

function summarize(results) {
  const brokenLinks = results.flatMap((result) => result.brokenLinks);
  const selfLinks = results.flatMap((result) => result.selfLinks);
  const weakAnchors = results.flatMap((result) => result.weakAnchors);
  const coverageWarnings = results
    .filter((result) => result.coverageWarning)
    .map((result) => ({
      slug: result.slug,
      title: result.title,
      warning: result.coverageWarning,
    }));

  return {
    mode: liveMode ? "live" : "local",
    strict: strictMode,
    totalBlogs: results.length,
    rawAnchors: results.reduce((sum, result) => sum + result.rawAnchorCount, 0),
    generatedLinks: results.reduce((sum, result) => sum + result.generatedLinkCount, 0),
    brokenCount: brokenLinks.length,
    selfLinkCount: selfLinks.length,
    weakAnchorCount: weakAnchors.length,
    coverageWarningCount: coverageWarnings.length,
    samples: {
      brokenLinks: brokenLinks.slice(0, 10),
      selfLinks: selfLinks.slice(0, 10),
      weakAnchors: weakAnchors.slice(0, 10),
      coverageWarnings: coverageWarnings.slice(0, 10),
    },
  };
}

const localBlogs = await loadLocalBlogs();
const blogs = liveMode ? await fetchLiveBlogs() : localBlogs;
const toolMetaMap = await readToolMetaMap();
const staticRoutes = await discoverStaticAppRoutes();
const inventoryBlogs = liveMode
  ? [
      ...localBlogs,
      ...blogs.filter((blog) => !localBlogs.some((localBlog) => localBlog.slug === blog.slug)),
    ]
  : blogs;
const referencedBlogSlugs = collectReferencedBlogSlugs(blogs);
const knownBlogSlugs = new Set(inventoryBlogs.map((blog) => blog.slug).filter(Boolean));
const unknownReferencedBlogSlugs = [...referencedBlogSlugs].filter((slug) => !knownBlogSlugs.has(slug));
const extraBlogSlugs = liveMode
  ? await fetchExistingLiveBlogSlugs(unknownReferencedBlogSlugs)
  : new Set();
const inventory = buildRouteInventory({ blogs: inventoryBlogs, toolMetaMap, staticRoutes, extraBlogSlugs });
const results = blogs.map((blog) => auditBlog(blog, blogs, toolMetaMap, inventory));
const summary = summarize(results);
const failed =
  summary.brokenCount > 0 ||
  (strictMode && (summary.selfLinkCount > 0 || summary.weakAnchorCount > 0 || summary.coverageWarningCount > 0));

if (jsonMode) {
  console.log(JSON.stringify({ summary, results }, null, 2));
} else {
  console.log(`Blog internal link audit ${failed ? "failed" : "passed"}.`);
  console.log(
    `${summary.mode} blogs: ${summary.totalBlogs}; raw anchors: ${summary.rawAnchors}; generated links: ${summary.generatedLinks}; broken: ${summary.brokenCount}; self links: ${summary.selfLinkCount}; weak anchors: ${summary.weakAnchorCount}; coverage warnings: ${summary.coverageWarningCount}`,
  );

  if (summary.samples.brokenLinks.length) {
    console.log("Broken internal links:");
    summary.samples.brokenLinks.forEach((issue) => {
      console.log(`- ${issue.slug}: ${issue.href} (${issue.reason})`);
    });
  }

  if (summary.samples.selfLinks.length) {
    console.log("Self links:");
    summary.samples.selfLinks.forEach((issue) => {
      console.log(`- ${issue.slug}: ${issue.href}`);
    });
  }

  if (summary.samples.weakAnchors.length) {
    console.log("Weak anchor text samples:");
    summary.samples.weakAnchors.forEach((issue) => {
      console.log(`- ${issue.slug}: "${issue.anchorText}" -> ${issue.href}`);
    });
  }

  if (summary.samples.coverageWarnings.length) {
    console.log("Coverage warning samples:");
    summary.samples.coverageWarnings.forEach((issue) => {
      console.log(`- ${issue.slug}: ${issue.warning}`);
    });
  }
}

if (failed) process.exit(1);
