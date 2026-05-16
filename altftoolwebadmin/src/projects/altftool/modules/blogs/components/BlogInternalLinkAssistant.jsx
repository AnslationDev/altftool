"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clipboard,
  ExternalLink,
  Link2,
  Loader2,
  PlusCircle,
  RefreshCw,
  Route,
  SearchCheck,
  Sparkles,
} from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { fetchAllBlogs } from "../services/blogsService";
import { buildBlogLinkAudit, buildBlogLinkGraph, normalizeBlogForLinkAudit } from "./blogLinkAudit";
import { parseBlogTags } from "./BlogSeoChecklist";

const MAX_SUGGESTIONS = 8;

function stripHtml(value = "") {
  return String(value).replace(/<[^>]+>/g, " ");
}

function generateSlug(value = "") {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-");
}

function tokenize(value = "") {
  const stopWords = new Set([
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
    "the",
    "this",
    "tool",
    "tools",
    "use",
    "using",
    "with",
    "your",
  ]);

  return new Set(
    stripHtml(value)
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length > 2 && !stopWords.has(word))
  );
}

function normalizeBlog(blog = {}) {
  return {
    id: blog.id,
    heading: blog.heading || blog.title || "Untitled blog",
    slug: blog.slug || generateSlug(blog.heading || blog.title || ""),
    category: blog.category || "Uncategorized",
    tags: Array.isArray(blog.tags) ? blog.tags.filter(Boolean) : parseBlogTags(blog.tags || ""),
    description: blog.description || blog.excerpt || "",
    status: blog.status || "draft",
    views: Number(blog.views || blog.viewCount || 0),
    updatedAt: blog.updatedAt,
    createdAt: blog.createdAt,
  };
}

function toMillis(value) {
  if (!value) return 0;
  if (typeof value?.toMillis === "function") return value.toMillis();
  if (value?.seconds) return value.seconds * 1000;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function getExistingLinkSlugs(html = "") {
  const slugs = new Set();
  const pattern = /\/blogs\/([a-z0-9-]+)/gi;
  let match = pattern.exec(html);

  while (match) {
    if (match[1]) slugs.add(match[1]);
    match = pattern.exec(html);
  }

  return slugs;
}

function scoreSuggestion(current, candidate, existingSlugs) {
  if (!candidate.slug || existingSlugs.has(candidate.slug)) return null;
  if (candidate.id && candidate.id === current.id) return null;
  if (candidate.slug === current.slug) return null;
  if (candidate.status !== "published") return null;

  const currentTags = new Set(current.tags.map((tag) => tag.toLowerCase()));
  const candidateTags = candidate.tags.map((tag) => tag.toLowerCase());
  const sharedTags = candidateTags.filter((tag) => currentTags.has(tag));
  const currentTokens = tokenize(`${current.heading} ${current.description}`);
  const candidateTokens = tokenize(`${candidate.heading} ${candidate.description}`);
  const sharedTokens = [...candidateTokens].filter((token) => currentTokens.has(token)).slice(0, 10);
  const sameCategory = current.category && current.category === candidate.category;
  const candidateTime = toMillis(candidate.updatedAt || candidate.createdAt);
  const daysOld = candidateTime ? Math.max(0, (Date.now() - candidateTime) / 86400000) : 180;
  const recentScore = Math.max(0, 10 - Math.floor(Math.min(daysOld, 180) / 18));
  const popularityScore = Math.min(18, Math.floor(candidate.views / 75));

  let score = 0;
  if (sameCategory) score += 34;
  score += sharedTags.length * 18;
  score += sharedTokens.length * 4;
  score += popularityScore + recentScore;

  if (score < 18) return null;

  const reasons = [];
  if (sameCategory) reasons.push("same category");
  if (sharedTags.length) reasons.push(`${sharedTags.length} shared tags`);
  if (sharedTokens.length) reasons.push(`${sharedTokens.length} topic matches`);
  if (candidate.views > 0) reasons.push(`${candidate.views.toLocaleString()} views`);

  return {
    ...candidate,
    reasons,
    score,
  };
}

function buildLinkHtml(blog) {
  return `<a href="/blogs/${blog.slug}">${blog.heading}</a>`;
}

function buildRelatedBlock(blogs) {
  const links = blogs.map((blog) => `<li>${buildLinkHtml(blog)}</li>`).join("");
  return `<div class="altf-related-links"><p><strong>Related reads:</strong></p><ul>${links}</ul></div>`;
}

function buildTopicPathBlock(blogs) {
  const top = blogs.slice(0, 5);
  const links = top.map((blog, index) => `<li><strong>Step ${index + 1}:</strong> ${buildLinkHtml(blog)}</li>`).join("");
  return `<section class="altf-topic-path"><h2>Continue this topic path</h2><p>Use these related AltFTool guides to keep learning the same workflow without starting a new search.</p><ol>${links}</ol></section>`;
}

function LinkAuditSummary({
  audit,
  brokenLinkCount,
  currentLinkNode,
  inboundCount,
  internalLinkCount,
}) {
  return (
    <>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-gray-50 px-2 py-2">
          <p className="text-lg font-black text-gray-900">{internalLinkCount}</p>
          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Outbound</p>
        </div>
        <div className="rounded-xl bg-blue-50 px-2 py-2">
          <p className="text-lg font-black text-blue-700">{inboundCount}</p>
          <p className="text-[10px] font-bold uppercase tracking-wide text-blue-600">Inbound</p>
        </div>
        <div className={`rounded-xl px-2 py-2 ${brokenLinkCount ? "bg-red-50" : "bg-green-50"}`}>
          <p className={`text-lg font-black ${brokenLinkCount ? "text-red-600" : "text-green-700"}`}>{brokenLinkCount}</p>
          <p className={`text-[10px] font-bold uppercase tracking-wide ${brokenLinkCount ? "text-red-500" : "text-green-600"}`}>Broken</p>
        </div>
      </div>

      {brokenLinkCount ? (
        <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-red-600">
            <AlertTriangle className="h-3.5 w-3.5" />
            Broken link checker
          </div>
          <div className="mt-2 space-y-1.5">
            {audit.brokenLinks.slice(0, 4).map((link, index) => (
              <div key={`${link.href}-${index}`} className="rounded-lg bg-white px-2 py-2 text-xs">
                <p className="font-bold text-red-700">{link.label}</p>
                <p className="mt-0.5 truncate font-mono text-[10px] text-red-500">{link.href || "empty href"}</p>
                {link.detail ? <p className="mt-1 text-[11px] leading-4 text-red-600">{link.detail}</p> : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {!brokenLinkCount && currentLinkNode?.inboundCount === 0 && currentLinkNode?.outboundCount === 0 ? (
        <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-3 text-xs leading-5 text-amber-700">
          This post is isolated in the blog graph. Add a topic path below, then link to this post from a related hub when possible.
        </div>
      ) : null}
    </>
  );
}

export default function BlogInternalLinkAssistant({
  formData,
  currentBlogId,
  onInsertLinks,
}) {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedSlug, setCopiedSlug] = useState("");
  const [insertedSlug, setInsertedSlug] = useState("");

  const loadBlogs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const rows = await fetchAllBlogs();
      setBlogs(rows.map(normalizeBlog));
    } catch (err) {
      console.error("Internal link suggestions failed:", err);
      setError("Could not load link suggestions. Try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBlogs();
  }, [loadBlogs]);

  const suggestions = useMemo(() => {
    const current = normalizeBlog({
      id: currentBlogId,
      heading: formData.heading,
      slug: generateSlug(formData.heading),
      category: formData.category,
      tags: parseBlogTags(formData.tags || ""),
      description: formData.description,
      status: formData.status,
    });
    const existingSlugs = getExistingLinkSlugs(formData.description || "");

    return blogs
      .map((blog) => scoreSuggestion(current, blog, existingSlugs))
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_SUGGESTIONS);
  }, [blogs, currentBlogId, formData]);

  const currentLinkBlog = useMemo(
    () =>
      normalizeBlogForLinkAudit({
        id: currentBlogId || "current-blog",
        heading: formData.heading,
        slug: generateSlug(formData.heading),
        category: formData.category,
        tags: parseBlogTags(formData.tags || ""),
        description: formData.description,
        status: formData.status,
      }),
    [currentBlogId, formData],
  );
  const graphBlogs = useMemo(
    () => [
      ...blogs.filter((blog) => blog.id !== currentLinkBlog.id && blog.slug !== currentLinkBlog.slug),
      currentLinkBlog,
    ],
    [blogs, currentLinkBlog],
  );
  const linkGraph = useMemo(() => buildBlogLinkGraph(graphBlogs), [graphBlogs]);
  const currentLinkNode = linkGraph.nodeMap.get(currentLinkBlog.id) || linkGraph.slugMap.get(currentLinkBlog.slug);
  const currentAudit = currentLinkNode?.audit || buildBlogLinkAudit(currentLinkBlog, graphBlogs);
  const internalLinkCount = currentAudit.validInternalBlogLinks.length;
  const brokenLinkCount = currentAudit.brokenLinks.length;
  const inboundCount = currentLinkNode?.inboundCount || 0;
  const linkHealth = brokenLinkCount
    ? "Broken links"
    : internalLinkCount >= 3
      ? "Strong"
      : internalLinkCount >= 1
        ? "Needs one more"
        : "Missing";

  const insertBlogs = (items) => {
    if (!items.length || typeof onInsertLinks !== "function") return;
    onInsertLinks(buildRelatedBlock(items));
    setInsertedSlug(items.length === 1 ? items[0].slug : "bulk");
    emitAlert({ type: "success", message: `${items.length} internal link${items.length === 1 ? "" : "s"} inserted.` });
    window.setTimeout(() => setInsertedSlug(""), 1600);
  };

  const insertTopicPath = () => {
    const items = suggestions.slice(0, 5);
    if (!items.length || typeof onInsertLinks !== "function") return;
    onInsertLinks(buildTopicPathBlock(items));
    setInsertedSlug("topic-path");
    emitAlert({ type: "success", message: `Topic path inserted with ${items.length} contextual links.` });
    window.setTimeout(() => setInsertedSlug(""), 1600);
  };

  const copyLink = async (blog) => {
    const html = buildLinkHtml(blog);
    try {
      await navigator.clipboard.writeText(html);
      setCopiedSlug(blog.slug);
      emitAlert({ type: "success", message: "Internal link HTML copied." });
      window.setTimeout(() => setCopiedSlug(""), 1600);
    } catch {
      emitAlert({ type: "warning", message: "Clipboard is not available in this browser." });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <SearchCheck className="h-4 w-4 text-blue-500" />
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">Internal Links</h2>
          </div>
          <p className="mt-1 text-xs leading-5 text-gray-500">
            Suggested from published blogs using category, tags, title, and content overlap. Current draft link health: {linkHealth}.
          </p>
        </div>
        <button
          type="button"
          onClick={loadBlogs}
          className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50"
          aria-label="Refresh internal link suggestions"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-4 text-xs text-gray-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
          Finding related published posts...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-3 text-xs text-red-600">
          {error}
        </div>
      ) : suggestions.length ? (
        <>
          <LinkAuditSummary
            audit={currentAudit}
            brokenLinkCount={brokenLinkCount}
            currentLinkNode={currentLinkNode}
            inboundCount={inboundCount}
            internalLinkCount={internalLinkCount}
          />

          <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-700">
                <Sparkles className="h-3.5 w-3.5" />
                {suggestions.length} smart matches
              </span>
              <span className="rounded-lg bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-600">
                {internalLinkCount} existing links
              </span>
            </div>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={insertTopicPath}
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-gray-900 px-2.5 text-xs font-semibold text-white hover:bg-gray-700"
              >
                {insertedSlug === "topic-path" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Route className="h-3.5 w-3.5" />}
                Auto-link topic path
              </button>
              <button
                type="button"
                onClick={() => insertBlogs(suggestions.slice(0, 3))}
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-2.5 text-xs font-semibold text-white hover:bg-blue-700"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Insert top 3
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {suggestions.map((blog) => (
              <div key={blog.id || blog.slug} className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-semibold leading-5 text-gray-900">{blog.heading}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <span className="rounded-md bg-white px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                        {blog.category}
                      </span>
                      <span className="rounded-md bg-white px-1.5 py-0.5 text-[10px] font-semibold text-blue-600">
                        Score {blog.score}
                      </span>
                    </div>
                  </div>
                  <a
                    href={`/altftool/blogs/view-blogs/${blog.id}`}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-blue-600"
                    aria-label={`Preview ${blog.heading}`}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>

                {blog.reasons.length ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {blog.reasons.slice(0, 3).map((reason) => (
                      <span key={reason} className="rounded-md bg-white px-1.5 py-0.5 text-[10px] text-gray-500">
                        {reason}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => insertBlogs([blog])}
                    className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-gray-900 px-2 text-xs font-semibold text-white hover:bg-gray-700"
                  >
                    {insertedSlug === blog.slug ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
                    Insert
                  </button>
                  <button
                    type="button"
                    onClick={() => copyLink(blog)}
                    className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    {copiedSlug === blog.slug ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <Clipboard className="h-3.5 w-3.5" />}
                    Copy HTML
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <LinkAuditSummary
            audit={currentAudit}
            brokenLinkCount={brokenLinkCount}
            currentLinkNode={currentLinkNode}
            inboundCount={inboundCount}
            internalLinkCount={internalLinkCount}
          />
          <div className="rounded-xl bg-gray-50 px-3 py-4 text-xs leading-5 text-gray-500">
            Add category, tags, and a few paragraphs first. Suggestions ignore drafts and links already in the article.
          </div>
        </>
      )}
    </div>
  );
}
