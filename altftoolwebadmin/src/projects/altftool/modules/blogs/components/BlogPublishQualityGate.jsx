"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { fetchAllBlogs } from "../services/blogsService";
import { getBlogContentQuality, parseBlogTags } from "./BlogSeoChecklist";
import { parseSourcesText } from "./BlogSourceEditor";
import { checkExternalLinks, summarizeExternalLinkResults } from "./blogExternalLinkClient";
import { buildBlogLinkAudit } from "./blogLinkAudit";
import { getBlogSchemaHealth } from "./blogSeoHealth";

const PLACEHOLDER_IMAGE = "pending-featured-image";

function cleanText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function stripHtml(value = "") {
  return cleanText(String(value || "").replace(/<[^>]*>/g, " "));
}

function generateSlug(value = "") {
  return cleanText(value)
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function issue(key, label, detail, tone = "required") {
  return { detail, key, label, tone };
}

function buildCurrentBlog({ formData = {}, imageAlt = "", hasImage = false, currentBlogId = "" } = {}) {
  const heading = cleanText(formData.heading || formData.title);
  const body = String(formData.description || formData.content || formData.body || "");
  const sources = parseSourcesText(formData.sourcesText || formData.sources || "");
  const slug = cleanText(formData.slug || generateSlug(heading));
  const image = hasImage ? cleanText(formData.image) || PLACEHOLDER_IMAGE : cleanText(formData.image);

  return {
    ...formData,
    id: currentBlogId || formData.id || "new-blog-draft",
    heading,
    title: heading,
    slug,
    category: cleanText(formData.category),
    author: cleanText(formData.author),
    authorRole: cleanText(formData.authorRole),
    reviewedBy: cleanText(formData.reviewedBy),
    editorialNote: cleanText(formData.editorialNote),
    reviewedAt: formData.reviewedAt || "",
    sources,
    sourcesText: formData.sourcesText || sources,
    sourceNotes: cleanText(formData.sourceNotes),
    description: body,
    excerpt: cleanText(formData.excerpt) || stripHtml(body).slice(0, 160),
    date: formData.date || "",
    seoTitle: cleanText(formData.seoTitle),
    seoDescription: cleanText(formData.seoDescription),
    image,
    imageAlt: cleanText(imageAlt || formData.imageAlt),
    status: "published",
    tags: parseBlogTags(formData.tags),
  };
}

export function buildPublishGateSnapshot({
  allBlogs = [],
  collectionStatus = "idle",
  currentBlogId = "",
  externalStatus = "idle",
  externalSummary = null,
  formData = {},
  hasImage = false,
  imageAlt = "",
} = {}) {
  const currentBlog = buildCurrentBlog({ currentBlogId, formData, hasImage, imageAlt });
  const blogCollection = [
    ...allBlogs.filter((blog) => String(blog?.id || "") !== String(currentBlog.id || "")),
    currentBlog,
  ];
  const quality = getBlogContentQuality({
    formData: {
      ...currentBlog,
      tags: currentBlog.tags.join(", "),
      sourcesText: currentBlog.sources,
    },
    imageAlt: currentBlog.imageAlt,
    hasImage: Boolean(currentBlog.image),
  });
  const schemaHealth = getBlogSchemaHealth(currentBlog);
  const linkAudit = buildBlogLinkAudit(currentBlog, blogCollection);
  const externalUrls = [...new Set(linkAudit.externalLinks.map((link) => link.href).filter(Boolean))];
  const summary = externalSummary || summarizeExternalLinkResults([]);

  const requiredChecks = [
    {
      key: "heading",
      label: "Heading",
      detail: currentBlog.heading ? `${currentBlog.heading.length} characters` : "Missing title",
      done: currentBlog.heading.length >= 8,
    },
    {
      key: "seo-title",
      label: "Search title",
      detail: `${currentBlog.seoTitle.length}/60 characters`,
      done: currentBlog.seoTitle.length >= 50 && currentBlog.seoTitle.length <= 60,
    },
    {
      key: "seo-description",
      label: "Meta description",
      detail: `${currentBlog.seoDescription.length}/160 characters`,
      done: currentBlog.seoDescription.length >= 120 && currentBlog.seoDescription.length <= 160,
    },
    {
      key: "article-fields",
      label: "Author, date, category",
      detail: [currentBlog.author, currentBlog.date, currentBlog.category].filter(Boolean).length + "/3 fields",
      done: Boolean(currentBlog.author && currentBlog.date && currentBlog.category),
    },
    {
      key: "image",
      label: "Featured image",
      detail: currentBlog.image ? "Image selected" : "Missing image",
      done: Boolean(currentBlog.image),
    },
    {
      key: "image-alt",
      label: "Image alt text",
      detail: `${currentBlog.imageAlt.length}/125 characters`,
      done: currentBlog.imageAlt.length >= 5 && currentBlog.imageAlt.length <= 125,
    },
    {
      key: "schema",
      label: "Article schema",
      detail: schemaHealth.articleSchemaReady ? "Required fields ready" : "Required schema fields missing",
      done: schemaHealth.articleSchemaReady,
    },
    {
      key: "static-links",
      label: "Static link audit",
      detail: linkAudit.brokenLinks.length
        ? `${linkAudit.brokenLinks.length} broken link${linkAudit.brokenLinks.length === 1 ? "" : "s"}`
        : "No broken internal links",
      done: linkAudit.brokenLinks.length === 0,
    },
  ];

  const externalHardFailures = (summary.broken || 0) + (summary.blocked || 0);
  const recommendedChecks = [
    {
      key: "quality",
      label: "SEO quality",
      detail: `${quality.score}% score`,
      done: quality.score >= 80,
    },
    {
      key: "faq",
      label: "FAQ rich result",
      detail: schemaHealth.flags.hasFaq ? "FAQ source found" : "Add FAQ block",
      done: schemaHealth.flags.hasFaq,
    },
    {
      key: "sources",
      label: "Cited sources",
      detail: `${schemaHealth.flags.sourceCount} source${schemaHealth.flags.sourceCount === 1 ? "" : "s"}`,
      done: schemaHealth.flags.sourceCount >= 1,
    },
    {
      key: "internal-links",
      label: "Internal links",
      detail: schemaHealth.flags.hasInternalLink ? "Contextual link found" : "Add one AltFTool link",
      done: schemaHealth.flags.hasInternalLink,
    },
    {
      key: "live-links",
      label: "Live external links",
      detail: externalUrls.length
        ? externalStatus === "done"
          ? `${summary.ok || 0}/${summary.total || externalUrls.length} healthy`
          : `Check ${externalUrls.length} URL${externalUrls.length === 1 ? "" : "s"}`
        : "No external URLs",
      done: externalUrls.length === 0 || (externalStatus === "done" && externalHardFailures === 0),
    },
  ];

  const blockingIssues = requiredChecks
    .filter((check) => !check.done)
    .map((check) => issue(check.key, check.label, check.detail, "required"));

  if (externalStatus === "done" && externalHardFailures > 0) {
    blockingIssues.push(
      issue(
        "external-live-failures",
        "Broken live external links",
        `${externalHardFailures} URL${externalHardFailures === 1 ? "" : "s"} failed live check`,
        "required",
      ),
    );
  }

  const warningIssues = recommendedChecks
    .filter((check) => !check.done)
    .map((check) => issue(check.key, check.label, check.detail, "warning"));

  if (collectionStatus === "error") {
    warningIssues.push(issue("collection", "Blog collection audit", "Could not load all blogs for link validation", "warning"));
  }

  if (linkAudit.warnings.length > 0) {
    warningIssues.push(
      issue(
        "link-warnings",
        "Link warnings",
        `${linkAudit.warnings.length} link warning${linkAudit.warnings.length === 1 ? "" : "s"}`,
        "warning",
      ),
    );
  }

  if (externalStatus === "done" && (summary.warning || 0) > 0) {
    warningIssues.push(issue("external-warnings", "External link warnings", `${summary.warning} URL warning${summary.warning === 1 ? "" : "s"}`, "warning"));
  }

  const checklist = [...requiredChecks, ...recommendedChecks];
  const score = Math.round((checklist.filter((check) => check.done).length / checklist.length) * 100);

  return {
    blockingIssues,
    canPublish: blockingIssues.length === 0,
    currentBlog,
    externalStatus,
    externalSummary: summary,
    externalUrls,
    linkAudit,
    quality,
    recommendedChecks,
    requiredChecks,
    schemaHealth,
    score,
    warningIssues,
  };
}

function CheckRow({ check, required = false }) {
  return (
    <div className="flex items-start justify-between gap-3 text-xs">
      <div className="min-w-0">
        <p className={check.done ? "font-semibold text-gray-700" : "font-semibold text-gray-500"}>
          {check.label}
          {required && <span className="ml-1 text-[10px] font-black text-red-400">*</span>}
        </p>
        <p className="mt-0.5 text-[10px] text-gray-400">{check.detail}</p>
      </div>
      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${check.done ? "bg-green-100" : required ? "bg-red-100" : "bg-amber-100"}`}>
        {check.done ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
        ) : (
          <AlertCircle className={`h-3.5 w-3.5 ${required ? "text-red-600" : "text-amber-600"}`} />
        )}
      </span>
    </div>
  );
}

export default function BlogPublishQualityGate({
  currentBlogId = "",
  formData,
  hasImage,
  imageAlt,
  onGateChange,
}) {
  const [collection, setCollection] = useState({ blogs: [], status: "loading" });
  const [externalCheck, setExternalCheck] = useState({
    error: "",
    results: [],
    status: "idle",
    summary: null,
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const blogs = await fetchAllBlogs();
        if (alive) setCollection({ blogs, status: "ready" });
      } catch (err) {
        console.error("Publish gate blog collection audit failed", err);
        if (alive) setCollection({ blogs: [], status: "error" });
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const snapshot = useMemo(
    () =>
      buildPublishGateSnapshot({
        allBlogs: collection.blogs,
        collectionStatus: collection.status,
        currentBlogId,
        externalStatus: externalCheck.status,
        externalSummary: externalCheck.summary,
        formData,
        hasImage,
        imageAlt,
      }),
    [collection.blogs, collection.status, currentBlogId, externalCheck.status, externalCheck.summary, formData, hasImage, imageAlt],
  );

  const externalUrlKey = useMemo(() => snapshot.externalUrls.join("|"), [snapshot.externalUrls]);

  useEffect(() => {
    setExternalCheck((prev) => {
      if (prev.status === "idle" && !prev.summary && !prev.error) return prev;
      return { error: "", results: [], status: "idle", summary: null };
    });
  }, [externalUrlKey]);

  useEffect(() => {
    onGateChange?.(snapshot);
  }, [onGateChange, snapshot]);

  const runExternalCheck = useCallback(async () => {
    if (!snapshot.externalUrls.length || externalCheck.status === "checking") return;
    setExternalCheck({ error: "", results: [], status: "checking", summary: null });
    try {
      const payload = await checkExternalLinks(snapshot.externalUrls);
      setExternalCheck({
        error: "",
        results: payload.results || [],
        status: "done",
        summary: payload.summary || summarizeExternalLinkResults(payload.results || []),
      });
    } catch (err) {
      setExternalCheck({
        error: err?.message || "External link check failed.",
        results: [],
        status: "error",
        summary: null,
      });
    }
  }, [externalCheck.status, snapshot.externalUrls]);

  const statusTone = snapshot.canPublish
    ? snapshot.warningIssues.length
      ? "border-amber-100 bg-amber-50 text-amber-700"
      : "border-green-100 bg-green-50 text-green-700"
    : "border-red-100 bg-red-50 text-red-700";
  const statusLabel = snapshot.canPublish
    ? snapshot.warningIssues.length
      ? "Review"
      : "Ready"
    : "Blocked";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">Publish Gate</h2>
          <p className="mt-1 text-xs text-gray-500">Checks the post before it can go live.</p>
        </div>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-sm font-black ${statusTone}`}>
          {snapshot.score}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className={`rounded-full border px-2 py-0.5 font-bold ${statusTone}`}>{statusLabel}</span>
          <span className="text-gray-400">{snapshot.blockingIssues.length} blocker{snapshot.blockingIssues.length === 1 ? "" : "s"}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full transition-all ${snapshot.canPublish ? "bg-green-500" : "bg-red-400"}`}
            style={{ width: `${snapshot.score}%` }}
          />
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-gray-400">
          <ShieldCheck className="h-3.5 w-3.5" />
          Required
        </div>
        {snapshot.requiredChecks.map((check) => (
          <CheckRow key={check.key} check={check} required />
        ))}
      </div>

      <div className="space-y-2.5 border-t border-gray-100 pt-3">
        <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-gray-400">
          <Sparkles className="h-3.5 w-3.5" />
          Recommended
        </div>
        {snapshot.recommendedChecks.map((check) => (
          <CheckRow key={check.key} check={check} />
        ))}
      </div>

      <div className="rounded-2xl border border-blue-100 bg-blue-50 px-3 py-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-blue-600">
              <ExternalLink className="h-3.5 w-3.5" />
              Live Links
            </div>
            <p className="mt-1 text-xs leading-5 text-blue-700">
              {snapshot.externalUrls.length
                ? `${snapshot.externalUrls.length} external URL${snapshot.externalUrls.length === 1 ? "" : "s"} found.`
                : "No external URLs in this article."}
            </p>
          </div>
          {snapshot.externalUrls.length > 0 && (
            <button
              type="button"
              onClick={runExternalCheck}
              disabled={externalCheck.status === "checking"}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-2.5 py-1.5 text-[11px] font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {externalCheck.status === "checking" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              Check
            </button>
          )}
        </div>

        {externalCheck.status === "done" && (
          <div className="mt-2 grid grid-cols-3 gap-1.5 text-center text-[10px] font-bold">
            <span className="rounded-lg bg-white px-2 py-1 text-green-600">{snapshot.externalSummary.ok || 0} ok</span>
            <span className="rounded-lg bg-white px-2 py-1 text-amber-600">{snapshot.externalSummary.warning || 0} warn</span>
            <span className="rounded-lg bg-white px-2 py-1 text-red-600">
              {(snapshot.externalSummary.broken || 0) + (snapshot.externalSummary.blocked || 0)} fail
            </span>
          </div>
        )}

        {externalCheck.error && (
          <p className="mt-2 rounded-lg bg-white px-2.5 py-2 text-xs font-medium text-red-600">{externalCheck.error}</p>
        )}

        {externalCheck.results?.length > 0 && snapshot.externalSummary.issueResults?.length > 0 && (
          <div className="mt-2 space-y-1">
            {snapshot.externalSummary.issueResults.slice(0, 3).map((result) => (
              <p key={result.url} className="truncate rounded-lg bg-white px-2.5 py-1.5 text-[10px] font-medium text-gray-500">
                {result.state}: {result.url}
              </p>
            ))}
          </div>
        )}
      </div>

      {snapshot.blockingIssues.length > 0 && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-3 py-3">
          <p className="text-[11px] font-black uppercase tracking-widest text-red-600">Fix before publish</p>
          <div className="mt-2 space-y-1.5">
            {snapshot.blockingIssues.slice(0, 4).map((item) => (
              <p key={item.key} className="text-xs leading-5 text-red-700">
                {item.label}: {item.detail}
              </p>
            ))}
          </div>
        </div>
      )}

      {snapshot.canPublish && snapshot.warningIssues.length > 0 && (
        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-3 py-3">
          <p className="text-[11px] font-black uppercase tracking-widest text-amber-700">Confirm with warnings</p>
          <div className="mt-2 space-y-1.5">
            {snapshot.warningIssues.slice(0, 4).map((item) => (
              <p key={item.key} className="text-xs leading-5 text-amber-700">
                {item.label}: {item.detail}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
