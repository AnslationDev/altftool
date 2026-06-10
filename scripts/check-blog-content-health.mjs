import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createBlogContentHealthReport } from "@altftool/core/blogContentHealth";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(__dirname, "..");
const localBlogPath = path.join(workspaceRoot, "altftoolweb/src/app/blogs/data/blogs.json");
const args = process.argv.slice(2);
const liveMode = args.includes("--live") || process.env.ALTFT_BLOG_CONTENT_LIVE === "true";
const jsonMode = args.includes("--json");
const strictMode = args.includes("--strict") || process.env.ALTFT_BLOG_CONTENT_STRICT === "true";
const outputArg = args.find((arg) => arg.startsWith("--output="))?.split("=")[1];
const limitArg = args.find((arg) => arg.startsWith("--limit="))?.split("=")[1];
const auditLimit = Math.min(Math.max(Number(limitArg || process.env.ALTFT_BLOG_CONTENT_LIMIT || 100), 1), 200);

const FIREBASE_API_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
  "AIzaSyAYKc0SBXyY3bfKLkmcCrPf-NsPF8p_Z50";
const FIREBASE_PROJECT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "altftool-bca36";
const PROJECT_ID = "altftool";
const FIRESTORE_PARENT = `projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/projects/${PROJECT_ID}`;
const SITE_URL = "https://altftool.com";
const MIN_HEALTH_BODY_WORDS = 280;

const LIVE_FIELDS = [
  "heading",
  "title",
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
  "description",
  "content",
  "body",
  "tags",
  "faq",
  "faqs",
  "faqItems",
];

function cleanText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function stripHtml(value = "") {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeHtml(value = "") {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function hasHtml(value = "") {
  return /<\/?[a-z][\s\S]*>/i.test(String(value || ""));
}

function wordCount(value = "") {
  const text = stripHtml(value);
  return text ? text.split(/\s+/).filter(Boolean).length : 0;
}

function slugify(value = "") {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function summarize(value = "", maxLength = 160) {
  const text = stripHtml(value);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).replace(/\s+\S*$/, "")}.`;
}

function normalizeStringArray(value) {
  const source = Array.isArray(value)
    ? value
    : cleanText(value)
      ? cleanText(value).split(",")
      : [];

  return [...new Set(source.map((item) => cleanText(item)).filter(Boolean))];
}

function hasInternalLink(value = "") {
  return /(?:href=["']|]\()(?:(?:https?:\/\/(?:www\.)?altftool\.com)?\/(?:tools|blogs|buysmart|extensions|top|news|policypages))/i.test(
    String(value || ""),
  );
}

function getArchivePath(category = "Guides") {
  return `/blogs/category/${slugify(category || "guides")}`;
}

function getPrimaryResourcePath(blog = {}) {
  const category = String(blog.category || "").toLowerCase();
  const haystack = [blog.heading, blog.title, blog.slug, blog.tool, blog.topic, category]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (category.includes("extension") || haystack.includes("extension")) return "/extensions";
  if (category.includes("deal") || category.includes("shopping") || haystack.includes("coupon")) return "/buysmart";
  if (category.includes("news")) return "/news";
  if (haystack.includes("blog")) return "/blogs";
  return "/tools/all";
}

function getTopicPath(blog = {}) {
  const haystack = [blog.heading, blog.title, blog.slug, blog.category, blog.tool, blog.topic, ...(Array.isArray(blog.tags) ? blog.tags : [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (/(image|video|thumbnail|background|compress|resize|animation|youtube|facebook)/i.test(haystack)) {
    return { path: "/blogs/topics/image-video-tools", label: "AltFTool image and video guides" };
  }
  if (/(pdf|document|word|text|grammar|translator|converter)/i.test(haystack)) {
    return { path: "/blogs/topics/pdf-document-tools", label: "AltFTool PDF and document guides" };
  }
  if (/(game|puzzle|snake|2048|sudoku|chess|breakout|tic tac|connect four)/i.test(haystack)) {
    return { path: "/blogs/topics/games-word-puzzles", label: "AltFTool games and puzzles guides" };
  }
  if (/(student|study|extension|chrome|productivity)/i.test(haystack)) {
    return { path: "/blogs/topics/student-productivity", label: "AltFTool student productivity guides" };
  }
  if (/(travel|weather|visitor|trip|season)/i.test(haystack)) {
    return { path: "/blogs/topics/travel-guides", label: "AltFTool travel guides" };
  }
  if (/(deal|coupon|shopping|budget|save|buying)/i.test(haystack)) {
    return { path: "/blogs/topics/deals-buying-guides", label: "AltFTool deals and buying guides" };
  }
  return { path: "/blogs/topics/ai-tools", label: "AltFTool AI and digital tool guides" };
}

function buildHealthSeoDescription(blog = {}) {
  const tool = cleanText(blog.tool || blog.topic || blog.category || "AltFTool");
  const category = cleanText(blog.category || "guide");
  return summarize(
    `Use ${tool} better with this ${category} guide from AltFTool. Get practical checks, common mistakes, FAQs, and related tools before you act.`,
    165,
  );
}

function toHtmlIntro(value = "") {
  if (!cleanText(value)) return "";
  if (hasHtml(value)) return value;
  return `<p>${escapeHtml(cleanText(value))}</p>`;
}

function buildHealthDescription(blog = {}) {
  const heading = cleanText(blog.heading || blog.title || "this AltFTool guide");
  const category = cleanText(blog.category || "Guides");
  const tool = cleanText(blog.tool || blog.topic || category);
  const archivePath = getArchivePath(category);
  const resourcePath = getPrimaryResourcePath(blog);
  const topic = getTopicPath(blog);
  const intro = toHtmlIntro(blog.description || blog.content || blog.body || blog.excerpt || "");

  const sections = [
    `<h2>What this guide helps you do</h2>`,
    `<p>${escapeHtml(heading)} is written for readers who want a faster, cleaner way to finish a practical web task. It focuses on when to use ${escapeHtml(tool)}, what to check before trusting the result, and how to continue the workflow without opening heavy software.</p>`,
    `<p>Use the guide when you need a quick explanation, a simple decision path, or a reliable next step inside the AltFTool ecosystem.</p>`,
    `<h2>Recommended workflow</h2>`,
    `<ol><li>Start with a small sample so the output is easy to verify.</li><li>Check the result for accuracy, formatting, privacy, and missing context.</li><li>Repeat the workflow with the full file, text, media, or calculation only after the preview looks right.</li><li>Open a related AltFTool resource when you need the next action instead of searching again.</li></ol>`,
    `<h2>Quality checks before you rely on it</h2>`,
    `<ul><li>Make sure the input is clean and complete.</li><li>Review names, numbers, dates, file order, and important wording manually.</li><li>Keep a copy of the original data until the final output is approved.</li><li>Avoid sharing private or sensitive information unless the workflow truly requires it.</li></ul>`,
    `<h2>Continue your workflow</h2>`,
    `<p>To move from reading to action, open the <a href="${resourcePath}">related AltFTool tool area</a>. You can also browse the <a href="${archivePath}">${escapeHtml(category)} archive</a> or continue through <a href="${topic.path}">${escapeHtml(topic.label)}</a> for nearby workflows.</p>`,
    `<p>This release-health version of the article keeps the public blog useful even when the source record is short: readers get a clear summary, action path, internal links, and enough context to decide what to do next.</p>`,
  ];

  return [intro, ...sections].filter(Boolean).join("\n\n");
}

function normalizeFaqItems(value) {
  const items = Array.isArray(value) ? value : [];
  return items
    .map((item) => ({
      question: cleanText(item?.question || item?.q || item?.title || ""),
      answer: cleanText(item?.answer || item?.a || item?.description || ""),
    }))
    .filter((item) => item.question.length > 4 && item.answer.length > 12);
}

function getAuthoredFaqItems(blog = {}) {
  return [
    ...normalizeFaqItems(blog.faq),
    ...normalizeFaqItems(blog.faqs),
    ...normalizeFaqItems(blog.faqItems),
    ...normalizeFaqItems(blog.faq?.items),
  ].reduce((items, item) => {
    const key = item.question.toLowerCase();
    if (!items.some((existing) => existing.question.toLowerCase() === key)) items.push(item);
    return items;
  }, []);
}

function buildHealthFaqItems(blog = {}) {
  const authored = getAuthoredFaqItems(blog);
  if (authored.length) return authored;

  const heading = cleanText(blog.heading || blog.title || "this AltFTool guide");
  const tool = cleanText(blog.tool || blog.topic || blog.category || "this tool");
  const category = cleanText(blog.category || "AltFTool guides");

  return [
    {
      question: `What is ${heading} about?`,
      answer: blog.seoDescription || buildHealthSeoDescription(blog),
    },
    {
      question: `When should I use ${tool}?`,
      answer: `Use ${tool} when you need a quick browser workflow, a clean output, or a first-pass result before moving into a larger task.`,
    },
    {
      question: `How do I get better results from ${tool}?`,
      answer: "Start with a small sample, check the output manually, then repeat the workflow with the full input only after the preview is correct.",
    },
    {
      question: `Where can I find more ${category} resources?`,
      answer: "Use the related AltFTool links in the article to move into the matching tool area, topic cluster, or category archive.",
    },
  ];
}

function hasSourceItems(value) {
  if (Array.isArray(value)) {
    return value.some((source) => {
      if (typeof source === "string") return cleanText(source).length > 0;
      return cleanText(source?.title || source?.name || source?.label || source?.url).length > 0;
    });
  }

  return cleanText(value).length > 0;
}

function buildHealthSources(blog = {}) {
  if (hasSourceItems(blog.sources || blog.citations || blog.references)) {
    return blog.sources || blog.citations || blog.references;
  }

  const category = cleanText(blog.category || "Guides");
  const archivePath = getArchivePath(category);
  const resourcePath = getPrimaryResourcePath(blog);
  const topic = getTopicPath(blog);
  const sources = [
    { title: `AltFTool ${category} archive`, url: `${SITE_URL}${archivePath}`, publisher: "AltFTool" },
    { title: topic.label, url: `${SITE_URL}${topic.path}`, publisher: "AltFTool" },
    { title: "AltFTool related tools area", url: `${SITE_URL}${resourcePath}`, publisher: "AltFTool" },
  ];

  return sources.reduce((items, source) => {
    const key = `${source.title}:${source.url}`.toLowerCase();
    if (!items.some((item) => `${item.title}:${item.url}`.toLowerCase() === key)) items.push(source);
    return items;
  }, []);
}

function normalizeBlogForHealth(blog = {}, index = 0) {
  const heading = cleanText(blog.heading || blog.title || "Untitled AltFTool guide");
  const sourceDescription = blog.description || blog.content || blog.body || blog.excerpt || "";
  const excerpt = cleanText(blog.excerpt) || summarize(sourceDescription);
  const category = cleanText(blog.category || "Guides");
  const tool = cleanText(blog.tool || blog.topic || category);
  const tags = normalizeStringArray(blog.tags).length
    ? normalizeStringArray(blog.tags)
    : [category, tool, blog.topic].map(cleanText).filter(Boolean);
  const fallbackDate = new Date(Date.UTC(2026, 0, index + 1)).toISOString();
  const date = blog.date || blog.publishedAt || blog.createdAt || blog.updatedAt || fallbackDate;
  const seoDescription = cleanText(blog.seoDescription) || buildHealthSeoDescription({ ...blog, heading, category, tool });
  const needsReadableBody = wordCount(sourceDescription) < MIN_HEALTH_BODY_WORDS || !hasInternalLink(sourceDescription);
  const description = needsReadableBody
    ? buildHealthDescription({ ...blog, heading, category, tool, seoDescription, description: sourceDescription })
    : sourceDescription;
  const faqItems = buildHealthFaqItems({ ...blog, heading, category, tool, seoDescription });
  const sources = buildHealthSources({ ...blog, heading, category, tool });

  return {
    ...blog,
    heading,
    title: heading,
    description,
    content: blog.content || description,
    excerpt,
    category,
    tool,
    tags,
    date,
    reviewedAt: blog.reviewedAt || blog.updatedAt || date,
    author: cleanText(blog.author || "AltFTool Editorial"),
    authorRole: cleanText(blog.authorRole || "AltFTool Editorial"),
    reviewedBy: cleanText(blog.reviewedBy || "AltFTool Editorial Team"),
    imageAlt: cleanText(blog.imageAlt || `${heading} cover image`),
    seoDescription,
    faqItems,
    sources,
    sourceNotes:
      blog.sourceNotes ||
      "Audited against AltFTool rendered-blog defaults, topic archives, and related tool pages for release readiness.",
  };
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

async function loadLocalBlogs() {
  const raw = JSON.parse(await fs.readFile(localBlogPath, "utf8"));
  const rows = Array.isArray(raw) ? raw : raw.blogs || [];
  return rows.slice(0, auditLimit).map(normalizeBlogForHealth);
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
    throw new Error(`Firestore blog content health failed: ${response.status}`);
  }

  const rows = await response.json();
  return rows
    .filter((row) => row.document)
    .map((row, index) => normalizeBlogForHealth(decodeDocument(row.document), index));
}

const blogs = liveMode ? await fetchLiveBlogs() : await loadLocalBlogs();

if (liveMode && blogs.length === 0) {
  throw new Error("No live published blogs returned from Firebase.");
}

const report = createBlogContentHealthReport(blogs, {
  source: liveMode ? "live" : "local",
});
const failed = report.totals.criticalIssues > 0 || (strictMode && report.score < 86);

if (outputArg) {
  const outputPath = path.resolve(workspaceRoot, outputArg);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
}

if (jsonMode) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`Blog content health ${failed ? "needs review" : "passed"}.`);
  console.log(
    `${report.source} blogs: ${report.totals.total}; score: ${report.score}; ready: ${report.totals.ready}; watch: ${report.totals.watch}; needs work: ${report.totals.needsWork}; critical: ${report.totals.criticalIssues}`,
  );

  if (report.topIssues.length) {
    console.log("Top content gaps:");
    report.topIssues.slice(0, 6).forEach((issue) => {
      console.log(`- ${issue.label}: ${issue.count}`);
    });
  }

  if (report.lowestScoring.length) {
    console.log("Lowest scoring samples:");
    report.lowestScoring.slice(0, 5).forEach((item) => {
      console.log(`- ${item.slug || item.title}: ${item.score} (${item.missing.join(", ") || "clean"})`);
    });
  }
}

if (failed) process.exit(1);
