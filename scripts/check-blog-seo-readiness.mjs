import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createBlogPostingJsonLd } from "../altftoolweb/src/platform/seo/generateMetadata.js";
import { withBlogSeoDefaults } from "../altftoolweb/src/app/blogs/data/blogSeoDefaults.js";
import { getBlogSchemaHealth, stripBlogHtml } from "../altftoolwebadmin/src/projects/altftool/modules/blogs/components/blogSeoHealth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(__dirname, "..");
const localBlogPath = path.join(workspaceRoot, "altftoolweb/src/app/blogs/data/blogs.json");
const args = process.argv.slice(2);
const liveMode = args.includes("--live") || process.env.ALTFT_BLOG_SEO_LIVE === "true";
const strictMode = args.includes("--strict") || process.env.ALTFT_BLOG_SEO_STRICT === "true";
const jsonMode = args.includes("--json");
const limitArg = args.find((arg) => arg.startsWith("--limit="))?.split("=")[1];
const auditLimit = Math.min(Math.max(Number(limitArg || process.env.ALTFT_BLOG_SEO_LIMIT || 80), 1), 200);

const FIREBASE_API_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
  "AIzaSyAYKc0SBXyY3bfKLkmcCrPf-NsPF8p_Z50";
const FIREBASE_PROJECT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "altftool-bca36";
const PROJECT_ID = "altftool";
const FIRESTORE_PARENT = `projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/projects/${PROJECT_ID}`;
const DEFAULT_AUTHOR = "AltFTool Editorial";

const LIVE_FIELDS = [
  "heading",
  "slug",
  "category",
  "author",
  "authorRole",
  "reviewedBy",
  "editorialNote",
  "reviewedAt",
  "sources",
  "sourceNotes",
  "date",
  "seoDescription",
  "excerpt",
  "status",
  "createdAt",
  "updatedAt",
  "image",
  "imageAlt",
  "seoTitle",
  "description",
  "content",
  "body",
  "tags",
  "faq",
  "faqs",
  "faqItems",
];

function slugify(value = "") {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toDateString(value, index = 0) {
  if (!value) return new Date(Date.UTC(2026, 0, index + 1)).toISOString().slice(0, 10);
  if (typeof value?.seconds === "number") {
    return new Date(value.seconds * 1000).toISOString();
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? new Date(Date.UTC(2026, 0, index + 1)).toISOString().slice(0, 10)
    : date.toISOString();
}

function normalizeBlogForAudit(blog = {}, index = 0, source = "local") {
  const heading = blog.heading || blog.title || "Untitled AltFTool guide";
  const slug = blog.slug || slugify(heading);
  const body = blog.description || blog.content || blog.body || blog.excerpt || "";
  const excerpt = blog.excerpt || stripBlogHtml(body).slice(0, 180);
  const date = toDateString(blog.date || blog.publishedAt || blog.createdAt || blog.updatedAt, index);
  const auditBlog = withBlogSeoDefaults({
    ...blog,
    heading,
    title: heading,
    slug,
    description: body,
    content: blog.content || body,
    excerpt,
    date,
    author: blog.author || DEFAULT_AUTHOR,
    authorRole: blog.authorRole || "AltFTool Editorial",
    reviewedBy: blog.reviewedBy || "AltFTool Editorial Team",
    reviewedAt: blog.reviewedAt || blog.updatedAt || date,
    imageAlt: blog.imageAlt || `${heading} cover image`,
    tags: Array.isArray(blog.tags) ? blog.tags : [blog.category, blog.tool, blog.topic].filter(Boolean),
  });

  return {
    ...auditBlog,
    auditSource: source,
    heading,
    title: heading,
    slug,
    description: auditBlog.description,
    content: auditBlog.content || auditBlog.description,
    excerpt: auditBlog.excerpt || excerpt,
    date,
    author: auditBlog.author || DEFAULT_AUTHOR,
    authorRole: auditBlog.authorRole || "AltFTool Editorial",
    reviewedBy: auditBlog.reviewedBy || "AltFTool Editorial Team",
    reviewedAt: auditBlog.reviewedAt || date,
    seoDescription: auditBlog.seoDescription,
    imageAlt: auditBlog.imageAlt || `${heading} cover image`,
    tags: auditBlog.tags,
  };
}

async function loadLocalBlogs() {
  const raw = JSON.parse(await fs.readFile(localBlogPath, "utf8"));
  const rows = Array.isArray(raw) ? raw : raw.blogs || [];
  return rows.slice(0, auditLimit).map((blog, index) => normalizeBlogForAudit(blog, index, "local"));
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
  const data = Object.fromEntries(
    Object.entries(document.fields || {}).map(([key, value]) => [
      key,
      firestoreValueToJs(value),
    ]),
  );

  return {
    id: document.name.split("/").pop(),
    ...data,
  };
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
    throw new Error(`Firestore blog SEO audit failed: ${response.status}`);
  }

  const rows = await response.json();
  return rows
    .filter((row) => row.document)
    .map((row, index) => normalizeBlogForAudit(decodeDocument(row.document), index, "live"));
}

function validateBlog(blog) {
  const schema = createBlogPostingJsonLd(blog);
  const health = getBlogSchemaHealth(blog);
  const blocking = [];

  if (!schema) {
    blocking.push("BlogPosting JSON-LD was not generated");
  } else {
    if (schema["@type"] !== "BlogPosting") blocking.push("Schema type is not BlogPosting");
    if (!schema["@id"]?.includes(`/blogs/${blog.slug}`)) blocking.push("Schema @id does not match canonical slug");
    if (!schema.headline) blocking.push("Schema headline is missing");
    if (!schema.description || schema.description.length < 40) blocking.push("Schema description is too short");
    if (!schema.datePublished) blocking.push("Schema datePublished is missing");
    if (!schema.dateModified) blocking.push("Schema dateModified is missing");
    if (!schema.author?.name) blocking.push("Schema author is missing");
    if (!schema.publisher?.["@id"]) blocking.push("Schema publisher link is missing");
    if (!schema.mainEntityOfPage) blocking.push("Schema mainEntityOfPage is missing");
  }

  return {
    slug: blog.slug,
    title: blog.heading,
    source: blog.auditSource,
    schemaScore: health.score,
    articleSchemaReady: health.articleSchemaReady,
    richResultReady: health.richResultReady,
    blocking,
    warnings: health.issues.map((issue) => `${issue.label}: ${issue.detail}`),
  };
}

function summarize(results) {
  const blocking = results.filter((result) => result.blocking.length > 0);
  const warnings = results.filter((result) => result.warnings.length > 0);
  const issueCounts = new Map();

  results.forEach((result) => {
    result.warnings.forEach((warning) => {
      const label = warning.split(":")[0];
      issueCounts.set(label, (issueCounts.get(label) || 0) + 1);
    });
  });

  return {
    mode: liveMode ? "live" : "local",
    strict: strictMode,
    total: results.length,
    schemaValid: results.length - blocking.length,
    articleSchemaReady: results.filter((result) => result.articleSchemaReady).length,
    richResultReady: results.filter((result) => result.richResultReady).length,
    blockingCount: blocking.length,
    warningCount: warnings.length,
    topIssues: [...issueCounts.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
      .slice(0, 10),
    samples: {
      blocking: blocking.slice(0, 8),
      warnings: warnings.slice(0, 8),
    },
  };
}

const blogs = liveMode ? await fetchLiveBlogs() : await loadLocalBlogs();

if (liveMode && blogs.length === 0) {
  throw new Error("No live published blogs returned from Firebase.");
}

const results = blogs.map(validateBlog);
const summary = summarize(results);
const failed = summary.blockingCount > 0 || (strictMode && summary.warningCount > 0);

if (jsonMode) {
  console.log(JSON.stringify({ summary, results }, null, 2));
} else {
  console.log(`Blog SEO readiness ${failed ? "failed" : "passed"}.`);
  console.log(
    `${summary.mode} blogs: ${summary.total}; schema valid: ${summary.schemaValid}; article ready: ${summary.articleSchemaReady}; rich ready: ${summary.richResultReady}; warnings: ${summary.warningCount}`,
  );

  if (summary.topIssues.length) {
    console.log("Top gaps:");
    summary.topIssues.forEach((issue) => {
      console.log(`- ${issue.label}: ${issue.count}`);
    });
  }

  if (summary.samples.blocking.length) {
    console.log("Blocking examples:");
    summary.samples.blocking.forEach((result) => {
      console.log(`- ${result.slug}: ${result.blocking.join("; ")}`);
    });
  }
}

if (failed) process.exit(1);
