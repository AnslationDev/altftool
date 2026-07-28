"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { evaluateBlogContent } from "@altftool/core/blogContentHealth";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  BookOpenCheck,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  ExternalLink,
  FileText,
  Filter,
  Link2,
  PlusCircle,
  RefreshCw,
  Search,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  WandSparkles,
  X,
} from "lucide-react";
import { Bone, EmptyState, LoadingState } from "@/ansets";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import {
  applyBlogDescriptionWithRollback,
  fetchAllBlogs,
  fetchRecentBlogQualityRollbacks,
  restoreBlogQualityRollback,
  updateBlog,
} from "../services/blogsService";
import { parseBlogTags } from "../components/BlogSeoChecklist";
import { parseSourcesText } from "../components/BlogSourceEditor";
import BlogContentHealthQueue from "../components/BlogContentHealthQueue";
import SeoHealthBoard from "../components/SeoHealthBoard";
import BlogInternalLinkOpportunityPanel from "../components/BlogInternalLinkOpportunityPanel";
import BlogLinkHealthPanel from "../components/BlogLinkHealthPanel";
import BlogLinkRollbackPanel from "../components/BlogLinkRollbackPanel";
import BlogPublishGuardPanel, { buildBlogPublishGuardReport } from "../components/BlogPublishGuardPanel";
import BlogRuntimeQaPanel from "../components/BlogRuntimeQaPanel";
import BlogSchemaPreviewPanel from "../components/BlogSchemaPreviewPanel";
import { checkExternalLinks, summarizeExternalLinkResults } from "../components/blogExternalLinkClient";
import {
  buildBlogCombinedLinkPatch,
  buildBlogInternalLinkOpportunityReport,
  buildBlogInternalLinkPlanPatch,
  buildBlogLinkCleanupPatch,
  buildBlogWeakAnchorPatch,
  createBlogLinkHealthReport,
} from "../components/blogLinkAudit";
import { appendRefreshBlocks, buildQuickRefreshPayload } from "../components/blogRefreshKit";
import {
  ACTIONS,
  GAP_FILTERS,
  READINESS_FILTERS,
  SORT_OPTIONS,
  STATUS_FILTERS,
  buildBlogAudit,
  buildQualitySummary,
  filterBlogAudits,
  formatAuditDate,
  getActionConfig,
  priorityTone,
  sortBlogAudits,
  toneClasses,
} from "../components/blogQualityAudit";

const ACTION_ICONS = {
  seo: Sparkles,
  faq: SearchCheck,
  sources: BookOpenCheck,
  links: Link2,
  review: ShieldCheck,
};

const CONTENT_ISSUE_TO_GAP = {
  body: "body",
  faq: "faq",
  freshness: "review-date",
  image: "image",
  links: "internal-links",
  seoDescription: "quality",
  sources: "citations",
  taxonomy: "quality",
  trust: "trust",
};

const CONTENT_ISSUE_TO_ACTION = {
  body: "seo",
  faq: "faq",
  freshness: "review",
  links: "links",
  seoDescription: "seo",
  sources: "sources",
  taxonomy: "seo",
  trust: "review",
};

function scoreTone(score = 0) {
  if (score >= 80) return "text-success bg-success-soft";
  if (score >= 60) return "text-warning bg-warning-soft";
  return "text-danger bg-danger-soft";
}

function barTone(score = 0) {
  if (score >= 80) return "bg-success";
  if (score >= 60) return "bg-warning";
  return "bg-danger";
}

function gapTone(key = "") {
  const map = {
    "rich-result": "bg-primary-soft text-primary",
    quality: "bg-danger-soft text-danger",
    faq: "bg-warning-soft text-warning",
    citations: "bg-success-soft text-success",
    "internal-links": "bg-surface-soft text-foreground",
    trust: "bg-secondary-soft text-secondary",
    image: "bg-info-soft text-info",
    "review-date": "bg-warning-soft text-warning",
    body: "bg-surface-soft text-foreground",
  };
  return map[key] || "bg-surface-soft text-foreground";
}

function StatCard({ icon: Icon, label, value, caption, tone = "blue" }) {
  const toneMap = {
    blue: "bg-primary-soft text-primary",
    green: "bg-success-soft text-success",
    amber: "bg-warning-soft text-warning",
    red: "bg-danger-soft text-danger",
    slate: "bg-surface-soft text-muted",
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-wider text-muted">{label}</p>
          <p className="mt-2 break-words text-2xl font-black leading-tight text-foreground">{value}</p>
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneMap[tone] || toneMap.blue}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-muted">{caption}</p>
    </div>
  );
}

function ScorePill({ label, score }) {
  return (
    <div className="rounded-xl bg-surface-soft px-3 py-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-black uppercase tracking-wider text-muted">{label}</span>
        <span className={`rounded-lg px-2 py-1 text-xs font-black ${scoreTone(score)}`}>{score}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-soft">
        <div className={`h-full rounded-full ${barTone(score)}`} style={{ width: `${Math.max(4, score)}%` }} />
      </div>
    </div>
  );
}

function normalizeBulkFormData(blog = {}) {
  return {
    ...blog,
    heading: blog.heading || blog.title || "",
    description: blog.description || blog.content || blog.body || "",
    tags: Array.isArray(blog.tags) ? blog.tags.join(", ") : blog.tags || "",
    sourceNotes: blog.sourceNotes || "",
  };
}

function normalizeContentHealthBlog(blog = {}) {
  const tags = Array.isArray(blog.tags)
    ? blog.tags.filter(Boolean)
    : String(blog.tags || "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

  return {
    ...blog,
    heading: blog.heading || blog.title || "",
    title: blog.heading || blog.title || "",
    description: blog.description || blog.content || blog.body || "",
    sources: Array.isArray(blog.sources) ? blog.sources : [],
    tags,
  };
}

function getSmartContentAction(missing = []) {
  return missing.map((issue) => CONTENT_ISSUE_TO_ACTION[issue]).find(Boolean) || "seo";
}

function buildBulkPatch(blog = {}, actionKey = "review") {
  const payload = buildQuickRefreshPayload(actionKey, normalizeBulkFormData(blog));
  const fields = { ...payload.fields };
  const blockResult = appendRefreshBlocks(blog.description || blog.content || blog.body || "", payload.blocks);

  if (fields.tags) fields.tags = parseBlogTags(fields.tags);
  if (fields.sourcesText) {
    fields.sources = parseSourcesText(fields.sourcesText);
    delete fields.sourcesText;
  }
  if (blockResult.addedCount > 0) fields.description = blockResult.description;

  return fields;
}

function QualityRow({ blog, linkNode, selected, onToggle, onEdit }) {
  const action = getActionConfig(blog.recommendedAction);
  const ActionIcon = ACTION_ICONS[action.key] || Sparkles;
  const brokenCount = linkNode?.audit?.brokenLinks?.length || 0;
  const inboundCount = linkNode?.inboundCount || 0;
  const outboundCount = linkNode?.outboundCount || 0;

  return (
    <article className="rounded-2xl border border-border bg-surface p-4 shadow-sm transition hover:border-primary hover:shadow-md">
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onToggle(blog.id)}
          className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition ${
            selected ? "border-primary bg-primary text-white" : "border-border bg-surface text-muted hover:bg-surface-soft"
          }`}
          aria-label={selected ? "Remove blog from selected bulk queue" : "Add blog to selected bulk queue"}
        >
          {selected ? <Check className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
        </button>

        <div className="grid min-w-0 flex-1 gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-wide ${priorityTone(blog.refreshScore)}`}>
                {blog.priority} - {blog.refreshScore}
              </span>
              <span className="rounded-lg bg-surface-soft px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-muted">
                {blog.status}
              </span>
              <span className="rounded-lg bg-primary-soft px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-primary">
                {blog.category}
              </span>
              {blog.richResultReady ? (
                <span className="inline-flex items-center gap-1 rounded-lg bg-success-soft px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-success">
                  <CheckCircle2 className="h-3 w-3" />
                  Rich ready
                </span>
              ) : null}
              {brokenCount ? (
                <span className="inline-flex items-center gap-1 rounded-lg bg-danger-soft px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-danger">
                  <AlertTriangle className="h-3 w-3" />
                  {brokenCount} broken
                </span>
              ) : null}
            </div>

            <button type="button" onClick={() => onEdit(blog, "")} className="mt-2 block max-w-full text-left">
              <h2 className="line-clamp-2 text-base font-black leading-6 text-foreground transition hover:text-primary">
                {blog.title}
              </h2>
            </button>
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted">{blog.excerpt}</p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {blog.gaps.length ? (
                blog.gaps.slice(0, 7).map((gap) => (
                  <span key={`${blog.id}-${gap.key}`} title={gap.detail} className={`rounded-lg px-2 py-1 text-[11px] font-semibold ${gapTone(gap.key)}`}>
                    {gap.label}
                  </span>
                ))
              ) : (
                <span className="inline-flex items-center gap-1 rounded-lg bg-success-soft px-2 py-1 text-[11px] font-semibold text-success">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  No blocking gaps
                </span>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted 2xl:grid-cols-4">
              <div className="min-w-[76px] rounded-xl bg-surface-soft px-3 py-2">
                <p className="font-black text-foreground">{blog.wordCount.toLocaleString()}</p>
                <p className="mt-0.5 whitespace-nowrap text-[11px] leading-4">words</p>
              </div>
              <div className="min-w-[76px] rounded-xl bg-surface-soft px-3 py-2">
                <p className="font-black text-foreground">{inboundCount}</p>
                <p className="mt-0.5 whitespace-nowrap text-[11px] leading-4">inbound</p>
              </div>
              <div className="min-w-[76px] rounded-xl bg-surface-soft px-3 py-2">
                <p className="font-black text-foreground">{outboundCount}</p>
                <p className="mt-0.5 whitespace-nowrap text-[11px] leading-4">outbound</p>
              </div>
              <div className={`min-w-[76px] rounded-xl px-3 py-2 ${brokenCount ? "bg-danger-soft text-danger" : "bg-surface-soft"}`}>
                <p className="font-black">{brokenCount}</p>
                <p className="mt-0.5 whitespace-nowrap text-[11px] leading-4">broken</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <ScorePill label="Quality" score={blog.qualityScore} />
              <ScorePill label="Schema" score={blog.schemaScore} />
            </div>

            <div className="rounded-xl border border-border bg-surface-soft p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-wider text-muted">Next action</p>
                  <p className="mt-1 truncate text-sm font-black text-foreground">{action.label}</p>
                </div>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${toneClasses(action.tone)}`}>
                  <ActionIcon className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-muted">
                Last signal: {formatAuditDate(blog.updatedDate, "No review date")}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onEdit(blog, blog.recommendedAction)}
                className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-3 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
              >
                <WandSparkles className="h-3.5 w-3.5" />
                Fix
              </button>
              <button
                type="button"
                onClick={() => onEdit(blog, "")}
                className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 text-xs font-semibold text-foreground transition hover:bg-surface-soft"
              >
                <FileText className="h-3.5 w-3.5" />
                Edit
              </button>
              {blog.publicUrl ? (
                <a
                  href={blog.publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-xl border border-primary bg-primary-soft px-3 text-xs font-semibold text-primary transition hover:bg-primary-soft"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function LinkGraphPanel({
  externalCheck,
  externalSummary,
  externalUrls,
  graph,
  onCheckExternal,
  onEdit,
}) {
  const brokenQueue = graph.brokenQueue.slice(0, 5);
  const isolated = graph.isolated.slice(0, 5);
  const hubs = graph.hubs.slice(0, 5);
  const checkingExternal = externalCheck?.status === "checking";
  const hasExternalResults = externalCheck?.status === "done" && externalSummary?.total > 0;

  return (
    <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-muted">Link graph</p>
          <h2 className="mt-1 text-xl font-black text-foreground">{graph.summary.internalLinks.toLocaleString()} links</h2>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-soft text-muted">
          <Link2 className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-danger-soft px-2 py-2">
          <p className="text-lg font-black text-danger">{graph.summary.brokenLinks}</p>
          <p className="text-[10px] font-bold uppercase tracking-wide text-danger">Broken</p>
        </div>
        <div className="rounded-xl bg-warning-soft px-2 py-2">
          <p className="text-lg font-black text-warning">{graph.summary.isolated}</p>
          <p className="text-[10px] font-bold uppercase tracking-wide text-warning">Isolated</p>
        </div>
        <div className="rounded-xl bg-primary-soft px-2 py-2">
          <p className="text-lg font-black text-primary">{graph.summary.missingOutbound}</p>
          <p className="text-[10px] font-bold uppercase tracking-wide text-primary">No out</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-border bg-surface-soft px-3 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-muted">Live external</p>
            <p className="mt-1 text-sm font-black text-foreground">
              {graph.summary.externalLinks.toLocaleString()} external link{graph.summary.externalLinks === 1 ? "" : "s"}
            </p>
          </div>
          <button
            type="button"
            onClick={onCheckExternal}
            disabled={!externalUrls.length || checkingExternal}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 text-xs font-semibold text-foreground transition hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${checkingExternal ? "animate-spin" : ""}`} />
            Check {externalUrls.length ? Math.min(externalUrls.length, 20) : ""}
          </button>
        </div>

        {externalCheck?.error ? (
          <div className="mt-2 rounded-lg border border-danger bg-surface px-2 py-2 text-xs font-semibold text-danger">
            {externalCheck.error}
          </div>
        ) : null}

        {hasExternalResults ? (
          <div className="mt-3 space-y-2">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-surface px-2 py-2">
                <p className="text-sm font-black text-success">{externalSummary.ok}</p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-success">OK</p>
              </div>
              <div className="rounded-lg bg-surface px-2 py-2">
                <p className="text-sm font-black text-warning">{externalSummary.warning + externalSummary.blocked}</p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-warning">Review</p>
              </div>
              <div className="rounded-lg bg-surface px-2 py-2">
                <p className="text-sm font-black text-danger">{externalSummary.broken}</p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-danger">Broken</p>
              </div>
            </div>

            {externalSummary.issueResults.slice(0, 3).map((result) => (
              <div key={`${result.url}-${result.status || result.state}`} className="rounded-lg bg-surface px-2 py-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className={`font-black ${result.state === "broken" ? "text-danger" : "text-warning"}`}>
                    {result.status || result.state}
                  </span>
                  <span className="text-[10px] text-muted">{result.durationMs}ms</span>
                </div>
                <p className="mt-1 truncate font-mono text-[10px] text-muted">{result.url}</p>
                <p className="mt-1 text-[11px] leading-4 text-muted">{result.reason}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {brokenQueue.length ? (
        <div className="mt-4 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-wider text-muted">Broken links</p>
          {brokenQueue.map((node) => (
            <button
              key={`broken-${node.blog.id}`}
              type="button"
              onClick={() => onEdit(node.blog, "links")}
              className="group w-full rounded-xl border border-danger bg-danger-soft px-3 py-2 text-left transition hover:border-danger hover:bg-danger-soft"
            >
              <span className="block line-clamp-1 text-sm font-bold text-danger group-hover:text-danger">{node.blog.title}</span>
              <span className="mt-1 block text-[11px] text-danger">
                {node.audit.brokenLinks.length} issue{node.audit.brokenLinks.length === 1 ? "" : "s"} - {node.audit.brokenLinks[0]?.label}
              </span>
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-4 space-y-2">
        <p className="text-[10px] font-black uppercase tracking-wider text-muted">Isolated posts</p>
        {isolated.length ? (
          isolated.map((node) => (
            <button
              key={`isolated-${node.blog.id}`}
              type="button"
              onClick={() => onEdit(node.blog, "links")}
              className="group w-full rounded-xl border border-border bg-surface-soft px-3 py-2 text-left transition hover:border-primary hover:bg-primary-soft"
            >
              <span className="block line-clamp-1 text-sm font-bold text-foreground group-hover:text-primary">{node.blog.title}</span>
              <span className="mt-1 block text-[11px] text-muted">0 inbound - 0 outbound blog links</span>
            </button>
          ))
        ) : (
          <div className="rounded-xl bg-success-soft px-3 py-3 text-sm font-semibold text-success">
            No fully isolated published posts.
          </div>
        )}
      </div>

      {hubs.length ? (
        <div className="mt-4 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-wider text-muted">Hub posts</p>
          {hubs.map((node) => (
            <div key={`hub-${node.blog.id}`} className="rounded-xl bg-surface-soft px-3 py-2">
              <p className="line-clamp-1 text-sm font-bold text-foreground">{node.blog.title}</p>
              <p className="mt-1 text-[11px] text-muted">
                {node.inboundCount} inbound - {node.outboundCount} outbound
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function LinkFixPreviewModal({ applying = false, onClose, onConfirm, preview }) {
  if (!preview) return null;

  const candidates = preview.candidates || [];
  const fixCount = preview.fixCount || 0;
  const modeLabel = preview.mode === "combined" ? "Safe + anchor text" : preview.mode === "weak" ? "Anchor text" : "Safe URL cleanup";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-primary/45 px-4 py-4 backdrop-blur-sm sm:items-center">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="link-fix-preview-title"
        className="max-h-[86vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-wider text-primary">Dry-run preview</p>
            <h2 id="link-fix-preview-title" className="mt-1 text-xl font-black text-foreground">
              {preview.title}
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted">{preview.description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={applying}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-muted transition hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close link fix preview"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[56vh] space-y-3 overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-3">
            <div className="rounded-xl bg-primary-soft px-3 py-3 text-primary">
              <p className="text-lg font-black">{candidates.length}</p>
              <p className="text-[10px] font-black uppercase tracking-wider">Posts</p>
            </div>
            <div className="rounded-xl bg-success-soft px-3 py-3 text-success">
              <p className="text-lg font-black">{fixCount}</p>
              <p className="text-[10px] font-black uppercase tracking-wider">Fixes</p>
            </div>
            <div className="col-span-2 rounded-xl bg-surface-soft px-3 py-3 text-foreground sm:col-span-1">
              <p className="text-sm font-black">{modeLabel}</p>
              <p className="text-[10px] font-black uppercase tracking-wider text-muted">Mode</p>
            </div>
          </div>

          {candidates.map((node) => (
            <article key={`preview-${node.blog.id}`} className="rounded-xl border border-border bg-surface-soft px-3 py-3">
              <div className="flex items-start justify-between gap-3">
                <h3 className="line-clamp-2 text-sm font-black leading-5 text-foreground">{node.blog.title || node.blog.heading || "Untitled blog"}</h3>
                <span className="rounded-lg bg-surface px-2 py-1 text-xs font-black text-muted shadow-sm">
                  {node.patch?.fixes?.length || 0}
                </span>
              </div>
              <div className="mt-3 space-y-2">
                {(node.patch?.fixes || []).slice(0, 5).map((fix, index) => (
                  <div key={`${node.blog.id}-${fix.kind}-${index}`} className="rounded-lg bg-surface px-3 py-2 text-xs leading-5 text-muted">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-black text-foreground">{fix.label}</span>
                      {fix.kind ? (
                        <span className="rounded-md bg-surface-soft px-1.5 py-0.5 font-bold uppercase tracking-wide text-muted">{fix.kind}</span>
                      ) : null}
                    </div>
                    <p className="mt-1 break-words font-mono text-[11px] text-muted">
                      {fix.from || fix.href || "current link"} <span className="font-sans font-black text-muted">-&gt;</span> {fix.to || fix.href || "updated link"}
                    </p>
                  </div>
                ))}
                {(node.patch?.fixes?.length || 0) > 5 ? (
                  <p className="px-1 text-[11px] font-semibold text-muted">
                    +{node.patch.fixes.length - 5} more fix{node.patch.fixes.length - 5 === 1 ? "" : "es"} in this post
                  </p>
                ) : null}
              </div>
            </article>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4">
          <p className="text-xs leading-5 text-muted">
            Nothing is saved until you confirm. This will update only blog descriptions in Firebase.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={applying}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-foreground transition hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={applying || !candidates.length}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-surface-soft"
            >
              {applying ? <RefreshCw className="h-4 w-4 animate-spin" /> : <WandSparkles className="h-4 w-4" />}
              {applying ? "Applying..." : `Apply ${fixCount} fix${fixCount === 1 ? "" : "es"}`}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function InternalLinkPlanPreviewModal({ applying = false, onClose, onConfirm, preview }) {
  if (!preview) return null;

  const candidates = preview.candidates || [];
  const fixCount = preview.fixCount || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-primary/45 px-4 py-4 backdrop-blur-sm sm:items-center">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="internal-link-plan-preview-title"
        className="max-h-[86vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-wider text-primary">Dry-run preview</p>
            <h2 id="internal-link-plan-preview-title" className="mt-1 text-xl font-black text-foreground">
              Internal link plans
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              Review generated related-read blocks before writing them to blog descriptions with rollback snapshots.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={applying}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-muted transition hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close internal link plan preview"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[56vh] space-y-3 overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-3">
            <div className="rounded-xl bg-primary-soft px-3 py-3 text-primary">
              <p className="text-lg font-black">{candidates.length}</p>
              <p className="text-[10px] font-black uppercase tracking-wider">Posts</p>
            </div>
            <div className="rounded-xl bg-success-soft px-3 py-3 text-success">
              <p className="text-lg font-black">{fixCount}</p>
              <p className="text-[10px] font-black uppercase tracking-wider">Links</p>
            </div>
            <div className="col-span-2 rounded-xl bg-surface-soft px-3 py-3 text-foreground sm:col-span-1">
              <p className="text-sm font-black">Rollback-safe</p>
              <p className="text-[10px] font-black uppercase tracking-wider text-muted">Mode</p>
            </div>
          </div>

          {candidates.map((node) => (
            <article key={`internal-plan-preview-${node.blog.id}`} className="rounded-xl border border-border bg-surface-soft px-3 py-3">
              <div className="flex items-start justify-between gap-3">
                <h3 className="line-clamp-2 text-sm font-black leading-5 text-foreground">{node.blog.title || node.blog.heading || "Untitled blog"}</h3>
                <span className="rounded-lg bg-surface px-2 py-1 text-xs font-black text-muted shadow-sm">
                  {node.patch?.fixes?.length || 0}
                </span>
              </div>
              <div className="mt-3 space-y-2">
                {(node.patch?.suggestions || []).slice(0, 4).map((suggestion) => (
                  <div key={`${node.blog.id}-${suggestion.slug}`} className="rounded-lg bg-surface px-3 py-2 text-xs leading-5 text-muted">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-black text-foreground">{suggestion.anchorText || suggestion.title}</span>
                      <span className="rounded-md bg-primary-soft px-1.5 py-0.5 font-bold uppercase tracking-wide text-primary">
                        {suggestion.confidence || "Useful"}
                      </span>
                    </div>
                    <p className="mt-1 break-words font-mono text-[11px] text-muted">{suggestion.href}</p>
                    {suggestion.reasons?.length ? (
                      <p className="mt-1 text-[11px] font-semibold text-muted">{suggestion.reasons.slice(0, 3).join(" - ")}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4">
          <p className="text-xs leading-5 text-muted">
            Existing generated smart-link blocks are replaced; custom article content stays untouched.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={applying}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-foreground transition hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={applying || !candidates.length}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-surface-soft"
            >
              {applying ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
              {applying ? "Applying..." : `Apply ${fixCount} link${fixCount === 1 ? "" : "s"}`}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function BlogQualityCenterPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [gapFilter, setGapFilter] = useState("all");
  const [readinessFilter, setReadinessFilter] = useState("needs-work");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortMode, setSortMode] = useState("priority");
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkAction, setBulkAction] = useState("review");
  const [bulkApplying, setBulkApplying] = useState(false);
  const [contentFixApplying, setContentFixApplying] = useState(false);
  const [internalLinkPlanApplying, setInternalLinkPlanApplying] = useState(false);
  const [internalLinkPlanPreview, setInternalLinkPlanPreview] = useState(null);
  const [linkFixApplying, setLinkFixApplying] = useState(false);
  const [linkFixPreview, setLinkFixPreview] = useState(null);
  const [rollbackItems, setRollbackItems] = useState([]);
  const [rollbackLoading, setRollbackLoading] = useState(false);
  const [rollbackRestoringId, setRollbackRestoringId] = useState("");
  const [externalCheck, setExternalCheck] = useState({ error: "", results: [], status: "idle" });

  useEffect(() => {
    let mounted = true;

    async function loadBlogs() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchAllBlogs();
        if (mounted) setBlogs(data);
      } catch (err) {
        console.error("Blog quality load failed", err);
        if (mounted) setError("Unable to load blogs from Firebase.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadBlogs();
    return () => {
      mounted = false;
    };
  }, []);

  const loadRollbackItems = useCallback(async () => {
    setRollbackLoading(true);
    try {
      const items = await fetchRecentBlogQualityRollbacks(8);
      setRollbackItems(items);
    } catch (err) {
      console.warn("Blog rollback snapshots unavailable", err);
    } finally {
      setRollbackLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRollbackItems();
  }, [loadRollbackItems]);

  const auditedBlogs = useMemo(() => blogs.map(buildBlogAudit), [blogs]);
  const contentHealthItems = useMemo(
    () =>
      blogs
        .map((blog) => {
          const health = evaluateBlogContent(normalizeContentHealthBlog(blog));
          return { ...health, blog };
        })
        .filter((item) => item.missing.length > 0)
        .sort((a, b) => a.score - b.score || a.title.localeCompare(b.title)),
    [blogs],
  );
  const summary = useMemo(() => buildQualitySummary(auditedBlogs), [auditedBlogs]);
  const linkHealthReport = useMemo(() => createBlogLinkHealthReport(blogs), [blogs]);
  const linkGraph = linkHealthReport.graph;
  const publishGuardReport = useMemo(() => buildBlogPublishGuardReport(auditedBlogs, linkGraph), [auditedBlogs, linkGraph]);
  const internalLinkOpportunityReport = useMemo(
    () => buildBlogInternalLinkOpportunityReport(blogs, { graph: linkGraph, limit: 8, suggestionsPerBlog: 4 }),
    [blogs, linkGraph],
  );
  const externalSweepUrls = useMemo(
    () => [
      ...new Set(
        linkGraph.nodes.flatMap((node) => node.audit.externalLinks.map((link) => link.href).filter(Boolean)),
      ),
    ].slice(0, 20),
    [linkGraph],
  );
  const externalSummary = useMemo(() => summarizeExternalLinkResults(externalCheck.results), [externalCheck.results]);
  const categories = useMemo(
    () => ["all", ...new Set(auditedBlogs.map((blog) => blog.category).filter(Boolean))].sort((a, b) => (a === "all" ? -1 : b === "all" ? 1 : a.localeCompare(b))),
    [auditedBlogs],
  );
  const filteredBlogs = useMemo(() => {
    const filtered = filterBlogAudits(auditedBlogs, {
      search,
      status: statusFilter,
      gap: gapFilter,
      readiness: readinessFilter,
      category: categoryFilter,
    });
    return sortBlogAudits(filtered, sortMode);
  }, [auditedBlogs, categoryFilter, gapFilter, readinessFilter, search, sortMode, statusFilter]);
  const selectedBlogs = useMemo(
    () => selectedIds.map((id) => auditedBlogs.find((blog) => blog.id === id)).filter(Boolean),
    [auditedBlogs, selectedIds],
  );
  const visibleSelectedCount = filteredBlogs.filter((blog) => selectedIds.includes(blog.id)).length;

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setGapFilter("all");
    setReadinessFilter("needs-work");
    setCategoryFilter("all");
    setSortMode("priority");
  };

  const toggleSelected = (id) => {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const selectTopVisible = () => {
    const visibleIds = filteredBlogs.slice(0, 25).map((blog) => blog.id);
    setSelectedIds((current) => [...new Set([...current, ...visibleIds])]);
  };

  const clearSelected = () => setSelectedIds([]);

  const openEditor = (blog, action = blog.recommendedAction) => {
    const suffix = action ? `?refreshAction=${encodeURIComponent(action)}` : "";
    router.push(`/altftool/blogs/edit-blog/${blog.id}${suffix}`);
  };

  const filterContentIssue = (issueKey) => {
    setGapFilter(CONTENT_ISSUE_TO_GAP[issueKey] || "all");
    setReadinessFilter("needs-work");
  };

  const startTopIssue = () => {
    const first = filteredBlogs[0];
    if (first) openEditor(first, first.recommendedAction);
  };

  const runExternalSweep = async () => {
    if (!externalSweepUrls.length) return;

    setExternalCheck({ error: "", results: [], status: "checking" });
    try {
      const result = await checkExternalLinks(externalSweepUrls);
      setExternalCheck({ checkedAt: result.checkedAt, error: "", results: result.results || [], status: "done" });
      const summary = summarizeExternalLinkResults(result.results || []);
      emitAlert({
        type: summary.broken ? "warning" : "success",
        message: summary.broken
          ? `${summary.broken} external link${summary.broken === 1 ? "" : "s"} need cleanup.`
          : "External link sweep completed.",
      });
    } catch (err) {
      setExternalCheck({ error: err?.message || "External link sweep failed.", results: [], status: "error" });
      emitAlert({ type: "error", message: err?.message || "External link sweep failed." });
    }
  };

  const applyBulkAction = async () => {
    if (!selectedBlogs.length || bulkApplying) return;

    const action = getActionConfig(bulkAction);
    const confirmed = window.confirm(`Apply ${action.label} to ${selectedBlogs.length} selected blog${selectedBlogs.length === 1 ? "" : "s"}?`);
    if (!confirmed) return;

    setBulkApplying(true);
    setError("");
    try {
      const nowIso = new Date().toISOString();
      const updates = await Promise.all(
        selectedBlogs.map(async (blog) => {
          const patch = buildBulkPatch(blog, bulkAction);
          await updateBlog(blog.id, patch);
          return { id: blog.id, patch: { ...patch, updatedAt: nowIso } };
        }),
      );
      const updateMap = new Map(updates.map((item) => [item.id, item.patch]));
      setBlogs((current) =>
        current.map((blog) => {
          const patch = updateMap.get(blog.id);
          return patch ? { ...blog, ...patch } : blog;
        }),
      );
      setSelectedIds([]);
      emitAlert({ type: "success", message: `${action.label} applied to ${updates.length} blog${updates.length === 1 ? "" : "s"}.` });
    } catch (err) {
      console.error("Bulk quality action failed", err);
      setError("Bulk action failed. Please try again with a smaller selection.");
      emitAlert({ type: "error", message: "Bulk action failed. Please try again." });
    } finally {
      setBulkApplying(false);
    }
  };

  const applyContentHealthBulkFix = async ({ actionKey = "smart", issueKey = "", limit = 10 } = {}) => {
    if (contentFixApplying) return;

    const selectedMode = selectedBlogs.length > 0;
    let candidates = selectedMode
      ? selectedBlogs.map((blog) => ({ ...evaluateBlogContent(normalizeContentHealthBlog(blog)), blog }))
      : contentHealthItems;

    if (issueKey) candidates = candidates.filter((item) => item.missing.includes(issueKey));
    if (!selectedMode) candidates = candidates.slice(0, limit);
    candidates = candidates.filter((item) => item.blog?.id);

    if (!candidates.length) {
      emitAlert({
        type: "info",
        message: selectedMode ? "Selected posts do not have this content-health gap." : "No content-health posts are available for this fix.",
      });
      return;
    }

    const actionLabel = actionKey === "smart" ? "smart content-health fixes" : getActionConfig(actionKey).label;
    const targetLabel = selectedMode ? "selected" : `top ${candidates.length}`;
    const confirmed = window.confirm(`Apply ${actionLabel} to ${candidates.length} ${targetLabel} blog${candidates.length === 1 ? "" : "s"}?`);
    if (!confirmed) return;

    setContentFixApplying(true);
    setError("");
    try {
      const nowIso = new Date().toISOString();
      const updates = await Promise.all(
        candidates.map(async (item) => {
          const resolvedAction = actionKey === "smart" ? getSmartContentAction(item.missing) : actionKey;
          const patch = buildBulkPatch(item.blog, resolvedAction);
          await updateBlog(item.blog.id, patch);
          return { id: item.blog.id, patch: { ...patch, updatedAt: nowIso } };
        }),
      );
      const updateMap = new Map(updates.map((item) => [item.id, item.patch]));
      setBlogs((current) =>
        current.map((blog) => {
          const patch = updateMap.get(blog.id);
          return patch ? { ...blog, ...patch } : blog;
        }),
      );
      if (selectedMode) setSelectedIds([]);
      emitAlert({
        type: "success",
        message: `Content-health fixes applied to ${updates.length} blog${updates.length === 1 ? "" : "s"}.`,
      });
    } catch (err) {
      console.error("Content-health bulk fix failed", err);
      setError("Content-health bulk fix failed. Please try again with a smaller queue.");
      emitAlert({ type: "error", message: "Content-health bulk fix failed. Please try again." });
    } finally {
      setContentFixApplying(false);
    }
  };

  const buildInternalLinkPlanCandidates = ({ blogIds = [], limit = 4 } = {}) => {
    const queueById = new Map(internalLinkOpportunityReport.queue.map((item) => [item.blog.id, item]));
    const blogIdSet = new Set(blogIds.filter(Boolean));
    const selectedMode = selectedIds.length > 0 && blogIdSet.size === 0;
    const attachPatch = (blog) => {
      if (!blog?.id) return null;

      const queued = queueById.get(blog.id);
      const node = linkGraph.nodeMap.get(blog.id) || linkGraph.slugMap.get(blog.slug);
      const patch = queued?.patch || buildBlogInternalLinkPlanPatch(blog, blogs, {
        graph: linkGraph,
        suggestions: queued?.suggestions,
      });

      return patch.hasWork
        ? {
            ...(queued || node || {}),
            blog: queued?.blog || node?.blog || blog,
            patch,
            suggestions: patch.suggestions || queued?.suggestions || [],
          }
        : null;
    };

    if (blogIdSet.size) {
      return {
        candidates: blogs.filter((blog) => blogIdSet.has(blog.id)).map(attachPatch).filter(Boolean),
        selectedMode: false,
      };
    }

    if (selectedMode) {
      return {
        candidates: selectedIds
          .map((id) => blogs.find((blog) => blog.id === id))
          .map(attachPatch)
          .filter(Boolean),
        selectedMode: true,
      };
    }

    return {
      candidates: internalLinkOpportunityReport.queue
        .slice(0, limit)
        .map((item) => ({ ...item, patch: item.patch || buildBlogInternalLinkPlanPatch(item.blog, blogs, { suggestions: item.suggestions }) }))
        .filter((item) => item.blog?.id && item.patch?.hasWork),
      selectedMode: false,
    };
  };

  const previewInternalLinkPlans = ({ blogIds = [], limit = 4 } = {}) => {
    if (internalLinkPlanApplying) return;

    const { candidates, selectedMode } = buildInternalLinkPlanCandidates({ blogIds, limit });
    const fixCount = candidates.reduce((sum, node) => sum + (node.patch?.fixes?.length || 0), 0);

    if (!candidates.length || !fixCount) {
      emitAlert({
        type: "info",
        message: selectedMode ? "Selected posts do not have previewable internal-link plans." : "No internal-link plans are available.",
      });
      return;
    }

    setInternalLinkPlanPreview({
      candidates,
      fixCount,
      selectedMode,
    });
  };

  const confirmInternalLinkPlanPreview = async () => {
    if (!internalLinkPlanPreview?.candidates?.length || internalLinkPlanApplying) return;

    const candidates = internalLinkPlanPreview.candidates;
    setInternalLinkPlanApplying(true);
    setError("");
    try {
      const nowIso = new Date().toISOString();
      const updates = await Promise.all(
        candidates.map(async (node) => {
          const sourceBlog = blogs.find((blog) => blog.id === node.blog.id) || node.blog;
          const rollbackId = await applyBlogDescriptionWithRollback({
            blog: sourceBlog,
            description: node.patch.description,
            fixes: node.patch.fixes || [],
            mode: "internal-link-plan",
            source: "blog-quality-center",
          });
          return {
            id: node.blog.id,
            rollbackId,
            patch: {
              description: node.patch.description,
              updatedAt: nowIso,
            },
          };
        }),
      );
      const updateMap = new Map(updates.map((item) => [item.id, item.patch]));
      setBlogs((current) =>
        current.map((blog) => {
          const patch = updateMap.get(blog.id);
          return patch ? { ...blog, ...patch } : blog;
        }),
      );
      if (internalLinkPlanPreview.selectedMode) setSelectedIds([]);
      setInternalLinkPlanPreview(null);
      loadRollbackItems();
      logAuditEvent({
        module: "blogs",
        action: "BLOG_INTERNAL_LINK_PLAN_APPLY",
        entityType: "blog",
        entityId: updates.length === 1 ? updates[0].id : null,
        summary: `Internal link plans applied to ${updates.length} blog${updates.length === 1 ? "" : "s"}.`,
        changes: {
          blogIds: updates.map((item) => item.id),
          rollbackIds: updates.map((item) => item.rollbackId),
          fixCount: internalLinkPlanPreview.fixCount,
          mode: "internal-link-plan",
        },
        route: "/altftool/blogs/quality",
      });
      emitAlert({
        type: "success",
        message: `Internal link plans applied to ${updates.length} blog${updates.length === 1 ? "" : "s"}.`,
      });
    } catch (err) {
      console.error("Internal link plan apply failed", err);
      setError("Internal link plan apply failed. Please try again with a smaller queue.");
      emitAlert({ type: "error", message: "Internal link plan apply failed. Please try again." });
    } finally {
      setInternalLinkPlanApplying(false);
    }
  };

  const getLinkFixPatchBuilder = (mode = "safe") => {
    if (mode === "combined") return buildBlogCombinedLinkPatch;
    if (mode === "weak") return buildBlogWeakAnchorPatch;
    return buildBlogLinkCleanupPatch;
  };

  const getNoLinkFixMessage = (mode = "safe", selectedMode = false) => {
    if (mode === "combined") {
      return selectedMode ? "Selected posts do not have previewable link fixes." : "No combined link fixes are available.";
    }
    if (mode === "weak") {
      return selectedMode ? "Selected posts do not have previewable weak anchor fixes." : "No previewable weak anchor fixes are available.";
    }
    return selectedMode ? "Selected posts do not need safe link cleanup." : "No safe blog link cleanup is available.";
  };

  const getLinkFixPreviewCopy = (mode = "safe") => {
    if (mode === "combined") {
      return {
        description: "Review safe URL cleanup and weak-anchor text replacements in one rollback-safe batch.",
        title: "Combined link fixes",
      };
    }
    if (mode === "weak") {
      return {
        description: "Review the anchor text replacements. Existing hrefs stay untouched.",
        title: "Weak anchor fixes",
      };
    }
    return {
      description: "Review self-link removals, legacy redirect hrefs, and AltFTool URL normalization.",
      title: "Safe link cleanup",
    };
  };

  const buildLinkFixCandidates = ({ blogIds = [], limit = 10, mode = "safe" } = {}) => {
    const patchBuilder = getLinkFixPatchBuilder(mode);
    const blogIdSet = new Set(blogIds.filter(Boolean));
    const selectedMode = selectedIds.length > 0 && blogIdSet.size === 0;
    const attachPatch = (blog) => {
      if (!blog?.id) return null;
      const node = linkGraph.nodeMap.get(blog.id) || linkGraph.slugMap.get(blog.slug);
      const patch = patchBuilder(blog, blogs);
      return patch.hasWork ? { ...(node || {}), blog: node?.blog || blog, patch } : null;
    };

    if (blogIdSet.size) {
      return {
        candidates: blogs.filter((blog) => blogIdSet.has(blog.id)).map(attachPatch).filter(Boolean),
        selectedMode: false,
      };
    }

    if (selectedMode) {
      return {
        candidates: selectedIds
          .map((id) => blogs.find((blog) => blog.id === id))
          .map(attachPatch)
          .filter(Boolean),
        selectedMode: true,
      };
    }

    if (mode === "combined") {
      return {
        candidates: linkHealthReport.combinedQueue
          .slice(0, limit)
          .map((node) => ({ ...node, patch: node.combined }))
          .filter((node) => node.blog?.id && node.patch?.hasWork),
        selectedMode: false,
      };
    }

    if (mode === "safe") {
      return {
        candidates: linkHealthReport.cleanupQueue
          .slice(0, limit)
          .map((node) => ({ ...node, patch: node.cleanup }))
          .filter((node) => node.blog?.id && node.patch?.hasWork),
        selectedMode: false,
      };
    }

    return {
      candidates: linkHealthReport.weakAnchorQueue
        .slice(0, limit)
        .map((node) => attachPatch(node.blog))
        .filter(Boolean),
      selectedMode: false,
    };
  };

  const previewBlogLinkFixes = ({ blogIds = [], limit = 10, mode = "safe" } = {}) => {
    if (linkFixApplying) return;

    const { candidates, selectedMode } = buildLinkFixCandidates({ blogIds, limit, mode });
    const fixCount = candidates.reduce((sum, node) => sum + (node.patch?.fixes?.length || 0), 0);

    if (!candidates.length || !fixCount) {
      emitAlert({
        type: "info",
        message: getNoLinkFixMessage(mode, selectedMode),
      });
      return;
    }

    const copy = getLinkFixPreviewCopy(mode);
    setLinkFixPreview({
      candidates,
      description: copy.description,
      fixCount,
      mode,
      selectedMode,
      title: copy.title,
    });
  };

  const applyCombinedLinkFixes = (options = {}) => previewBlogLinkFixes({ ...options, mode: "combined" });
  const applyLinkHealthCleanup = (options = {}) => previewBlogLinkFixes({ ...options, mode: "safe" });
  const applyWeakAnchorFixes = (options = {}) => previewBlogLinkFixes({ ...options, mode: "weak" });

  const confirmLinkFixPreview = async () => {
    if (!linkFixPreview?.candidates?.length || linkFixApplying) return;

    const candidates = linkFixPreview.candidates;
    setLinkFixApplying(true);
    setError("");
    try {
      const nowIso = new Date().toISOString();
      const updates = await Promise.all(
        candidates.map(async (node) => {
          const sourceBlog = blogs.find((blog) => blog.id === node.blog.id) || node.blog;
          const rollbackId = await applyBlogDescriptionWithRollback({
            blog: sourceBlog,
            description: node.patch.description,
            fixes: node.patch.fixes || [],
            mode: linkFixPreview.mode,
            source: "blog-quality-center",
          });
          return {
            id: node.blog.id,
            rollbackId,
            patch: {
              description: node.patch.description,
              updatedAt: nowIso,
            },
          };
        }),
      );
      const updateMap = new Map(updates.map((item) => [item.id, item.patch]));
      setBlogs((current) =>
        current.map((blog) => {
          const patch = updateMap.get(blog.id);
          return patch ? { ...blog, ...patch } : blog;
        }),
      );
      if (linkFixPreview.selectedMode) setSelectedIds([]);
      setLinkFixPreview(null);
      loadRollbackItems();
      const auditAction =
        linkFixPreview.mode === "combined"
          ? "BLOG_COMBINED_LINK_FIX_APPLY"
          : linkFixPreview.mode === "weak"
            ? "BLOG_WEAK_ANCHOR_FIX_APPLY"
            : "BLOG_LINK_CLEANUP_APPLY";
      logAuditEvent({
        module: "blogs",
        action: auditAction,
        entityType: "blog",
        entityId: updates.length === 1 ? updates[0].id : null,
        summary: `${linkFixPreview.title} applied to ${updates.length} blog${updates.length === 1 ? "" : "s"}.`,
        changes: {
          blogIds: updates.map((item) => item.id),
          rollbackIds: updates.map((item) => item.rollbackId),
          fixCount: linkFixPreview.fixCount,
          mode: linkFixPreview.mode,
        },
        route: "/altftool/blogs/quality",
      });
      emitAlert({
        type: "success",
        message: `${
          linkFixPreview.mode === "combined" ? "Combined link fixes" : linkFixPreview.mode === "weak" ? "Weak anchor fixes" : "Blog link cleanup"
        } applied to ${updates.length} blog${updates.length === 1 ? "" : "s"}.`,
      });
    } catch (err) {
      console.error("Blog link cleanup failed", err);
      setError("Blog link cleanup failed. Please try again with a smaller queue.");
      emitAlert({ type: "error", message: "Blog link cleanup failed. Please try again." });
    } finally {
      setLinkFixApplying(false);
    }
  };

  const restoreLinkRollback = async (rollback) => {
    if (!rollback?.id || rollbackRestoringId) return;

    setRollbackRestoringId(rollback.id);
    setError("");
    try {
      const nowIso = new Date().toISOString();
      await restoreBlogQualityRollback(rollback);
      setBlogs((current) =>
        current.map((blog) =>
          blog.id === rollback.blogId
            ? {
                ...blog,
                description: String(rollback.previousDescription || ""),
                updatedAt: nowIso,
              }
            : blog,
        ),
      );
      setRollbackItems((current) =>
        current.map((item) => (item.id === rollback.id ? { ...item, restoredAt: nowIso, updatedAt: nowIso } : item)),
      );
      logAuditEvent({
        module: "blogs",
        action: rollback.mode === "internal-link-plan" ? "BLOG_INTERNAL_LINK_PLAN_ROLLBACK" : "BLOG_LINK_CLEANUP_ROLLBACK",
        entityType: "blog",
        entityId: rollback.blogId,
        summary: `Restored blog quality snapshot for ${rollback.blogTitle || rollback.blogId}.`,
        changes: {
          blogId: rollback.blogId,
          rollbackId: rollback.id,
          fixCount: rollback.fixCount || 0,
          mode: rollback.mode || "safe",
        },
        route: "/altftool/blogs/quality",
      });
      emitAlert({ type: "success", message: "Rollback snapshot restored." });
    } catch (err) {
      console.error("Blog rollback restore failed", err);
      setError("Rollback restore failed. Please try again from the blog editor.");
      emitAlert({ type: "error", message: "Rollback restore failed. Please try again." });
    } finally {
      setRollbackRestoringId("");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-5 px-4 py-8">
        <Bone className="h-9 w-72 rounded-xl" />
        <LoadingState variant="stats" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]" aria-hidden="true">
          <Bone className="h-96 rounded-2xl" />
          <Bone className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/altftool/blogs")}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-muted transition hover:bg-surface-soft hover:text-foreground"
            aria-label="Back to blogs"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-primary">AltFTool blogs</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-foreground">Quality Center</h1>
            <p className="mt-1 text-sm text-muted">SEO readiness, rich-result gaps, freshness risk, and next editorial actions.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/altftool/blogs/analytics")}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-foreground transition hover:bg-surface-soft"
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </button>
          <button
            type="button"
            onClick={() => router.push("/altftool/blogs/bulk-refresh")}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-primary bg-primary-soft px-4 text-sm font-semibold text-primary transition hover:bg-primary-soft"
          >
            <RefreshCw className="h-4 w-4" />
            Bulk refresh
          </button>
          <button
            type="button"
            onClick={() => router.push("/altftool/blogs/add-blogs")}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            <PlusCircle className="h-4 w-4" />
            Add blog
          </button>
        </div>
      </div>

      {error ? (
        <div className="flex items-start gap-3 rounded-2xl border border-danger bg-danger-soft px-4 py-3 text-sm font-semibold text-danger">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : null}

      {/* Phase 2 — actionable SEO Health board (OG/Twitter, orphans,
          duplicates, alt text, index readiness) with one-click fixes. */}
      <SeoHealthBoard />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <StatCard icon={ShieldCheck} label="Health score" value={`${summary.healthScore}%`} caption={`${summary.avgQuality}% quality - ${summary.avgSchema}% schema`} tone={summary.healthScore >= 75 ? "green" : "amber"} />
        <StatCard icon={Sparkles} label="Rich ready" value={`${summary.richReady}/${summary.published}`} caption={`${summary.articleReady} published posts are Article-ready`} tone="green" />
        <StatCard icon={AlertTriangle} label="Critical" value={summary.critical.toLocaleString()} caption={`${summary.needsWork} total posts have open gaps`} tone={summary.critical ? "red" : "green"} />
        <StatCard icon={Link2} label="Broken links" value={linkGraph.summary.brokenLinks.toLocaleString()} caption={`${linkGraph.brokenQueue.length} posts need link cleanup`} tone={linkGraph.summary.brokenLinks ? "red" : "green"} />
        <StatCard icon={BookOpenCheck} label="Isolated" value={linkGraph.summary.isolated.toLocaleString()} caption={`${linkGraph.summary.missingOutbound} published posts have no outbound links`} tone="amber" />
        <StatCard icon={Clock3} label="Stale posts" value={summary.stale.toLocaleString()} caption={`${summary.missingLinks} published posts need internal links`} tone={summary.stale ? "amber" : "slate"} />
      </div>

      <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-[minmax(240px,1fr)_repeat(5,minmax(130px,170px))]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title, slug, author, category"
              className="h-11 w-full rounded-xl border border-border bg-surface-soft pl-10 pr-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-primary focus:bg-surface focus:ring-4 focus:ring-primary"
            />
          </label>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-11 rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary"
          >
            {STATUS_FILTERS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <select
            value={readinessFilter}
            onChange={(event) => setReadinessFilter(event.target.value)}
            className="h-11 rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary"
          >
            {READINESS_FILTERS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <select
            value={gapFilter}
            onChange={(event) => setGapFilter(event.target.value)}
            className="h-11 rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary"
          >
            {GAP_FILTERS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="h-11 rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === "all" ? "All categories" : category}
              </option>
            ))}
          </select>

          <select
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value)}
            className="h-11 rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary"
          >
            {SORT_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <div className="flex flex-wrap gap-2">
            {ACTIONS.map((action) => {
              const Icon = ACTION_ICONS[action.key] || Sparkles;
              return (
                <button
                  key={action.key}
                  type="button"
                  onClick={() => {
                    setGapFilter(action.matchGaps[0] || "all");
                    setReadinessFilter("needs-work");
                  }}
                  className={`inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-bold transition ${toneClasses(action.tone)}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {action.shortLabel}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-surface-soft px-3 py-2 text-xs font-semibold text-muted">
              {filteredBlogs.length} shown - {visibleSelectedCount} selected here
            </span>
            <button
              type="button"
              onClick={selectTopVisible}
              disabled={!filteredBlogs.length}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-primary bg-primary-soft px-3 text-xs font-semibold text-primary transition hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check className="h-3.5 w-3.5" />
              Select top 25
            </button>
            <button
              type="button"
              onClick={clearSelected}
              disabled={!selectedIds.length}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-xs font-semibold text-muted transition hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-xs font-semibold text-muted transition hover:bg-surface-soft"
            >
              <Filter className="h-3.5 w-3.5" />
              Reset
            </button>
            <button
              type="button"
              onClick={startTopIssue}
              disabled={!filteredBlogs.length}
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-primary px-3 text-xs font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-surface-soft"
            >
              <WandSparkles className="h-3.5 w-3.5" />
              Start top issue
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="space-y-3">
          {filteredBlogs.length ? (
            filteredBlogs.map((blog) => (
              <QualityRow
                key={blog.id}
                blog={blog}
                linkNode={linkGraph.nodeMap.get(blog.id) || linkGraph.slugMap.get(blog.slug)}
                selected={selectedIds.includes(blog.id)}
                onToggle={toggleSelected}
                onEdit={openEditor}
              />
            ))
          ) : (
            <EmptyState
              icon={Filter}
              title="No posts in this queue"
              description="Clear one or two filters to review the full blog quality list."
              className="rounded-2xl border border-dashed border-border bg-surface"
              action={
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-foreground transition hover:bg-surface-soft"
                >
                  Reset filters
                </button>
              }
            />
          )}
        </section>

        <aside className="space-y-4 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:pr-1 lg:self-start">
          <BlogPublishGuardPanel
            onEdit={openEditor}
            onFilterIssue={filterContentIssue}
            report={publishGuardReport}
          />

          <BlogSchemaPreviewPanel
            blogs={auditedBlogs}
            onEdit={openEditor}
          />

          <BlogRuntimeQaPanel
            blogs={auditedBlogs}
            onEdit={openEditor}
          />

          <BlogContentHealthQueue
            applying={contentFixApplying}
            blogs={blogs}
            onEdit={openEditor}
            onBulkFix={applyContentHealthBulkFix}
            onFilterIssue={filterContentIssue}
            selectedCount={selectedBlogs.length}
          />

          <BlogInternalLinkOpportunityPanel
            applying={internalLinkPlanApplying}
            onApplyPlan={previewInternalLinkPlans}
            onEdit={openEditor}
            previewing={Boolean(internalLinkPlanPreview)}
            report={internalLinkOpportunityReport}
          />

          <BlogLinkHealthPanel
            applying={linkFixApplying}
            report={linkHealthReport}
            onApplyCombinedFixes={applyCombinedLinkFixes}
            onApplySafeCleanup={applyLinkHealthCleanup}
            onApplyWeakAnchors={applyWeakAnchorFixes}
            onEdit={openEditor}
            previewing={Boolean(linkFixPreview)}
            selectedCount={selectedBlogs.length}
          />

          <BlogLinkRollbackPanel
            blogs={blogs}
            items={rollbackItems}
            loading={rollbackLoading}
            onEdit={openEditor}
            onRestore={restoreLinkRollback}
            restoringId={rollbackRestoringId}
          />

          <LinkGraphPanel
            externalCheck={externalCheck}
            externalSummary={externalSummary}
            externalUrls={externalSweepUrls}
            graph={linkGraph}
            onCheckExternal={runExternalSweep}
            onEdit={openEditor}
          />

          <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-muted">Bulk actions</p>
                <h2 className="mt-1 text-xl font-black text-foreground">{selectedBlogs.length} selected</h2>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <WandSparkles className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {ACTIONS.map((action) => {
                const Icon = ACTION_ICONS[action.key] || Sparkles;
                const active = bulkAction === action.key;
                return (
                  <button
                    key={`bulk-${action.key}`}
                    type="button"
                    onClick={() => setBulkAction(action.key)}
                    className={`inline-flex h-9 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-bold transition ${toneClasses(action.tone, active)}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {action.shortLabel}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={applyBulkAction}
              disabled={!selectedBlogs.length || bulkApplying}
              className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-surface-soft"
            >
              {bulkApplying ? <RefreshCw className="h-4 w-4 animate-spin" /> : <WandSparkles className="h-4 w-4" />}
              {bulkApplying ? "Applying..." : `Apply ${getActionConfig(bulkAction).shortLabel}`}
            </button>

            <p className="mt-3 text-xs leading-5 text-muted">
              Updates selected posts with the same guarded refresh helpers used by the editor, skipping duplicate FAQ or note blocks.
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-muted">Issue breakdown</p>
                <h2 className="mt-1 text-xl font-black text-foreground">{summary.needsWork} open</h2>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-warning-soft text-warning">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {summary.gapCounts.slice(0, 9).map((gap) => (
                <button
                  key={gap.key}
                  type="button"
                  onClick={() => {
                    setGapFilter(gap.key);
                    setReadinessFilter("needs-work");
                  }}
                  className="group flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-surface-soft px-3 py-2 text-left transition hover:border-primary hover:bg-primary-soft"
                >
                  <span className="truncate text-sm font-semibold text-foreground group-hover:text-primary">{gap.label}</span>
                  <span className="rounded-lg bg-surface px-2 py-1 text-xs font-black text-muted shadow-sm">{gap.count}</span>
                </button>
              ))}
              {!summary.gapCounts.length ? (
                <div className="rounded-xl border border-dashed border-success bg-success-soft px-4 py-8 text-center text-sm font-semibold text-success">
                  Every audited post is clear.
                </div>
              ) : null}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-muted">Action mix</p>
                <h2 className="mt-1 text-xl font-black text-foreground">Focus queue</h2>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <RefreshCw className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {summary.actionCounts.map((action) => {
                const Icon = ACTION_ICONS[action.key] || Sparkles;
                const width = summary.total ? Math.max(6, Math.round((action.count / summary.total) * 100)) : 0;
                return (
                  <div key={action.key}>
                    <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-muted">
                        <Icon className="h-3.5 w-3.5" />
                        {action.label}
                      </span>
                      <span className="font-black text-muted">{action.count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-surface-soft">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${width}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </aside>
      </div>

      <LinkFixPreviewModal
        applying={linkFixApplying}
        onClose={() => setLinkFixPreview(null)}
        onConfirm={confirmLinkFixPreview}
        preview={linkFixPreview}
      />

      <InternalLinkPlanPreviewModal
        applying={internalLinkPlanApplying}
        onClose={() => setInternalLinkPlanPreview(null)}
        onConfirm={confirmInternalLinkPlanPreview}
        preview={internalLinkPlanPreview}
      />
    </div>
  );
}
