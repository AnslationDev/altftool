"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Braces,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileText,
  SearchCheck,
  X,
} from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { getBlogSchemaHealth, parseBlogSources, stripBlogHtml } from "./blogSeoHealth";

const SITE_URL = "https://altftool.com";
const DEFAULT_IMAGE = "/assets/og-default.png";

function cleanText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function compactObject(value = {}) {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => {
      if (item === undefined || item === null || item === "") return false;
      if (Array.isArray(item) && item.length === 0) return false;
      return true;
    }),
  );
}

function absoluteUrl(path = "/") {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function toDate(value) {
  if (!value) return null;
  if (typeof value?.toDate === "function") return value.toDate();
  if (typeof value?.seconds === "number") return new Date(value.seconds * 1000);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toIsoDate(value) {
  const date = toDate(value);
  return date ? date.toISOString() : "";
}

function getTags(value) {
  if (Array.isArray(value)) return value.map(cleanText).filter(Boolean);
  return String(value || "")
    .split(/[,\n]/)
    .map(cleanText)
    .filter(Boolean);
}

function normalizeFaqItems(value) {
  const source = Array.isArray(value) ? value : [];
  return source
    .map((item) => ({
      answer: cleanText(item?.answer || item?.a || item?.description),
      question: cleanText(item?.question || item?.q || item?.title),
    }))
    .filter((item) => item.question.length > 4 && item.answer.length > 12);
}

function extractFaqsFromHtml(html = "") {
  const source = String(html || "");
  const blockMatch = source.match(/<!--\s*FAQ Start\s*-->([\s\S]*?)<!--\s*FAQ End\s*-->/i);
  const faqSource = blockMatch?.[1] || source;
  const itemPattern = /<div[^>]*class=["'][^"']*FAQ_ITEM[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi;
  const items = [];
  let itemMatch = itemPattern.exec(faqSource);

  while (itemMatch) {
    const itemHtml = itemMatch[1] || "";
    const question = itemHtml.match(/<button[^>]*class=["'][^"']*FAQ_Q[^"']*["'][^>]*>([\s\S]*?)<\/button>/i)?.[1] || "";
    const answer = itemHtml.match(/<div[^>]*class=["'][^"']*FAQ_A[^"']*["'][^>]*>([\s\S]*?)$/i)?.[1] || "";
    const normalized = {
      answer: cleanText(stripBlogHtml(answer)),
      question: cleanText(stripBlogHtml(question)),
    };

    if (normalized.question.length > 4 && normalized.answer.length > 12) items.push(normalized);
    itemMatch = itemPattern.exec(faqSource);
  }

  return items;
}

function getFaqItems(blog = {}) {
  const items = [
    ...normalizeFaqItems(blog.faq),
    ...normalizeFaqItems(blog.faqs),
    ...normalizeFaqItems(blog.faqItems),
    ...normalizeFaqItems(blog.faq?.items),
    ...extractFaqsFromHtml(blog.description || blog.content || blog.body || ""),
  ];
  const seen = new Set();

  return items
    .filter((item) => {
      const key = item.question.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 8);
}

function getDescription(blog = {}) {
  return cleanText(
    blog.seoDescription ||
      blog.excerpt ||
      stripBlogHtml(blog.description || blog.content || blog.body || "").slice(0, 180),
  );
}

function getWordCount(value = "") {
  const text = stripBlogHtml(value);
  return text ? text.split(/\s+/).filter(Boolean).length : 0;
}

function buildCitationJsonLd(sources = []) {
  return sources
    .map((source) =>
      compactObject({
        "@type": "CreativeWork",
        name: source.title || source.name || source.url,
        publisher: source.publisher
          ? {
              "@type": "Organization",
              name: source.publisher,
            }
          : undefined,
        url: source.url || undefined,
      }),
    )
    .filter((source) => source.name || source.url);
}

export function buildBlogSchemaPreview(blog = {}) {
  const title = cleanText(blog.heading || blog.title) || "Untitled blog";
  const slug = cleanText(blog.slug);
  const path = slug ? `/blogs/${slug}` : "/blogs";
  const body = String(blog.description || blog.content || blog.body || "");
  const description = getDescription(blog);
  const health = blog.schemaHealth || getBlogSchemaHealth(blog);
  const tags = getTags(blog.tags);
  const sources = parseBlogSources(blog.sources || blog.citations || blog.references || "");
  const citations = buildCitationJsonLd(sources);
  const faqItems = getFaqItems(blog);
  const imageUrl = absoluteUrl(blog.image || DEFAULT_IMAGE);
  const wordCount = getWordCount(body);
  const published = toIsoDate(blog.date || blog.publishedAt || blog.createdAt);
  const modified = toIsoDate(blog.reviewedAt || blog.updatedAt || blog.date || blog.createdAt);
  const authorName = cleanText(blog.author) || "AltFTool";

  const blogPosting = compactObject({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${absoluteUrl(path)}#article`,
    about: [blog.category, blog.tool, blog.topic, ...tags]
      .filter(Boolean)
      .slice(0, 12)
      .map((name) => ({ "@type": "Thing", name })),
    articleBody: stripBlogHtml(body).slice(0, 1200),
    articleSection: cleanText(blog.category) || "AltFTool guides",
    author: compactObject({
      "@type": authorName === "AltFTool" ? "Organization" : "Person",
      jobTitle: cleanText(blog.authorRole) || undefined,
      name: authorName,
    }),
    citation: citations,
    dateModified: modified,
    datePublished: published,
    description,
    headline: title,
    image: [
      compactObject({
        "@type": "ImageObject",
        caption: cleanText(blog.imageAlt) || title,
        contentUrl: imageUrl,
        height: 630,
        url: imageUrl,
        width: 1200,
      }),
    ],
    inLanguage: "en",
    isAccessibleForFree: true,
    keywords: tags.length ? tags.join(", ") : undefined,
    mainEntityOfPage: {
      "@id": absoluteUrl(path),
      "@type": "WebPage",
    },
    name: title,
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
    reviewedBy: cleanText(blog.reviewedBy)
      ? {
          "@type": /team|editorial|altftool/i.test(blog.reviewedBy) ? "Organization" : "Person",
          name: cleanText(blog.reviewedBy),
        }
      : undefined,
    thumbnailUrl: imageUrl,
    timeRequired: `PT${Math.max(1, Math.ceil(wordCount / 180))}M`,
    url: absoluteUrl(path),
    wordCount: wordCount || undefined,
  });

  const breadcrumb = slug
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", item: SITE_URL, name: "Home", position: 1 },
          { "@type": "ListItem", item: absoluteUrl("/blogs"), name: "Blog", position: 2 },
          { "@type": "ListItem", item: absoluteUrl(path), name: title, position: 3 },
        ],
      }
    : null;

  const faq = faqItems.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "@id": `${absoluteUrl(path)}#faq`,
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
          name: item.question,
        })),
      }
    : null;

  const missingRequired = (health.issues || []).filter((issue) => issue.required);
  const missingRecommended = (health.issues || []).filter((issue) => !issue.required);
  const schemas = [
    { key: "blogposting", label: "BlogPosting", ready: health.articleSchemaReady, value: blogPosting },
    { key: "breadcrumb", label: "BreadcrumbList", ready: Boolean(breadcrumb), value: breadcrumb },
    { key: "faq", label: "FAQPage", ready: Boolean(faq), value: faq },
  ];

  return {
    blog,
    blogPosting,
    breadcrumb,
    faq,
    faqItems,
    health,
    jsonLd: schemas.map((schema) => schema.value).filter(Boolean),
    missingRecommended,
    missingRequired,
    schemas,
    sources,
    status: health.articleSchemaReady ? (health.richResultReady ? "rich-ready" : "article-ready") : "blocked",
  };
}

export function buildBlogSchemaPreviewReport(blogs = []) {
  const previews = blogs.map(buildBlogSchemaPreview);
  const queue = [...previews].sort(
    (a, b) =>
      b.missingRequired.length - a.missingRequired.length ||
      b.missingRecommended.length - a.missingRecommended.length ||
      a.health.score - b.health.score ||
      cleanText(a.blog.heading || a.blog.title).localeCompare(cleanText(b.blog.heading || b.blog.title)),
  );

  return {
    previews,
    queue,
    summary: {
      articleReady: previews.filter((item) => item.health.articleSchemaReady).length,
      breadcrumbReady: previews.filter((item) => item.breadcrumb).length,
      faqReady: previews.filter((item) => item.faq).length,
      richReady: previews.filter((item) => item.health.richResultReady).length,
      sourceReady: previews.filter((item) => item.sources.length > 0).length,
      total: previews.length,
    },
  };
}

function statusTone(preview) {
  if (preview.health.richResultReady) return "border-success bg-success-soft text-success";
  if (preview.health.articleSchemaReady) return "border-warning bg-warning-soft text-warning";
  return "border-danger bg-danger-soft text-danger";
}

function SchemaStat({ label, value, tone }) {
  return (
    <div className={`rounded-xl px-2 py-2 text-center ${tone}`}>
      <p className="text-lg font-black">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-wide opacity-80">{label}</p>
    </div>
  );
}

function SchemaModal({ onClose, preview }) {
  const [copied, setCopied] = useState(false);
  const jsonText = useMemo(() => JSON.stringify(preview?.jsonLd || [], null, 2), [preview]);

  if (!preview) return null;

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonText);
      setCopied(true);
      emitAlert({ type: "success", message: "Schema JSON copied." });
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      emitAlert({ type: "warning", message: "Clipboard is not available in this browser." });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-primary/45 px-4 py-4 backdrop-blur-sm sm:items-center">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="schema-preview-title"
        className="max-h-[86vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-wider text-primary">Schema preview</p>
            <h2 id="schema-preview-title" className="mt-1 line-clamp-2 text-xl font-black text-foreground">
              {preview.blog.heading || preview.blog.title || "Untitled blog"}
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              {preview.schemas.filter((schema) => schema.ready).length}/{preview.schemas.length} JSON-LD entities ready.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-muted transition hover:bg-surface-soft"
            aria-label="Close schema preview"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[56vh] overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            {preview.schemas.map((schema) => (
              <div key={schema.key} className={`rounded-xl px-3 py-3 ${schema.ready ? "bg-success-soft text-success" : "bg-danger-soft text-danger"}`}>
                <p className="text-lg font-black">{schema.ready ? "Ready" : "Missing"}</p>
                <p className="text-[10px] font-black uppercase tracking-wider">{schema.label}</p>
              </div>
            ))}
          </div>

          {preview.missingRequired.length || preview.missingRecommended.length ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <article className="rounded-xl border border-danger bg-danger-soft/60 p-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-danger">Required gaps</p>
                <div className="mt-2 space-y-1.5">
                  {preview.missingRequired.length ? (
                    preview.missingRequired.map((issue) => (
                      <p key={issue.key} className="text-xs font-semibold leading-5 text-danger">
                        {issue.label}: {issue.detail}
                      </p>
                    ))
                  ) : (
                    <p className="text-xs font-semibold text-success">No required schema gaps.</p>
                  )}
                </div>
              </article>
              <article className="rounded-xl border border-warning bg-warning-soft/60 p-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-warning">Rich result gaps</p>
                <div className="mt-2 space-y-1.5">
                  {preview.missingRecommended.length ? (
                    preview.missingRecommended.slice(0, 5).map((issue) => (
                      <p key={issue.key} className="text-xs font-semibold leading-5 text-warning">
                        {issue.label}: {issue.detail}
                      </p>
                    ))
                  ) : (
                    <p className="text-xs font-semibold text-success">Rich-result inputs look ready.</p>
                  )}
                </div>
              </article>
            </div>
          ) : null}

          <div className="mt-4 rounded-xl border border-border bg-foreground p-3">
            <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-background">{jsonText}</pre>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4">
          <a
            href={preview.blog.slug ? `https://altftool.com/blogs/${preview.blog.slug}` : "https://altftool.com/blogs"}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-xs font-bold text-foreground transition hover:bg-surface-soft"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Public URL
          </a>
          <button
            type="button"
            onClick={copyJson}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary"
          >
            {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy JSON"}
          </button>
        </div>
      </section>
    </div>
  );
}

function SchemaQueueRow({ onEdit, onPreview, preview }) {
  const title = preview.blog.heading || preview.blog.title || "Untitled blog";
  const missing = preview.missingRequired.length ? preview.missingRequired : preview.missingRecommended;

  return (
    <article className={`rounded-xl border px-3 py-3 ${statusTone(preview)}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-black leading-5">{title}</p>
          <p className="mt-1 text-[11px] font-semibold opacity-80">
            {preview.health.score}% schema - {preview.sources.length} source{preview.sources.length === 1 ? "" : "s"} - {preview.faqItems.length} FAQ
          </p>
        </div>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface/80">
          {preview.health.richResultReady ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
        </span>
      </div>

      {missing.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {missing.slice(0, 3).map((issue) => (
            <span key={`${preview.blog.id}-${issue.key}`} className="rounded-lg bg-surface/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wide">
              {issue.label}
            </span>
          ))}
          {missing.length > 3 ? (
            <span className="rounded-lg bg-surface/70 px-2 py-1 text-[10px] font-black">+{missing.length - 3}</span>
          ) : null}
        </div>
      ) : null}

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onPreview?.(preview)}
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary px-2 text-xs font-semibold text-white transition hover:bg-primary"
        >
          <Braces className="h-3.5 w-3.5" />
          Preview schema
        </button>
        <button
          type="button"
          onClick={() => onEdit?.(preview.blog, preview.missingRequired[0]?.key === "author" ? "sources" : "seo")}
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-surface px-2 text-xs font-bold text-primary shadow-sm transition hover:bg-primary-soft"
        >
          <FileText className="h-3.5 w-3.5" />
          Fix fields
        </button>
      </div>
    </article>
  );
}

export default function BlogSchemaPreviewPanel({ blogs = [], onEdit }) {
  const [preview, setPreview] = useState(null);
  const report = useMemo(() => buildBlogSchemaPreviewReport(blogs), [blogs]);
  const queue = report.queue.slice(0, 4);
  const summary = report.summary;

  return (
    <>
      <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-wider text-muted">Schema preview</p>
            <h2 className="mt-1 text-xl font-black text-foreground">{summary.richReady}/{summary.total} rich ready</h2>
            <p className="mt-1 text-xs leading-5 text-muted">
              BlogPosting, BreadcrumbList, and FAQ JSON-LD readiness for published blog detail pages.
            </p>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <SearchCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <SchemaStat label="Article" value={summary.articleReady || 0} tone="bg-success-soft text-success" />
          <SchemaStat label="Rich" value={summary.richReady || 0} tone={summary.richReady === summary.total ? "bg-success-soft text-success" : "bg-warning-soft text-warning"} />
          <SchemaStat label="FAQ" value={summary.faqReady || 0} tone="bg-primary-soft text-primary" />
          <SchemaStat label="Sources" value={summary.sourceReady || 0} tone="bg-surface-soft text-foreground" />
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-muted">Schema queue</p>
            <span className="rounded-lg bg-surface-soft px-2 py-1 text-[10px] font-black text-muted">{queue.length}</span>
          </div>
          {queue.length ? (
            queue.map((item) => (
              <SchemaQueueRow key={`schema-preview-${item.blog.id || item.blog.slug}`} preview={item} onEdit={onEdit} onPreview={setPreview} />
            ))
          ) : (
            <div className="rounded-xl bg-success-soft px-3 py-3 text-sm font-semibold text-success">
              <CheckCircle2 className="mr-1 inline h-4 w-4" />
              Schema inputs are rich-result ready across the current blog set.
            </div>
          )}
        </div>
      </section>

      <SchemaModal preview={preview} onClose={() => setPreview(null)} />
    </>
  );
}
