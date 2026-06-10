"use client";

import { useMemo } from "react";
import {
  AlertTriangle,
  BookOpenCheck,
  CheckCircle2,
  FileText,
  HelpCircle,
  Link2,
  RefreshCw,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import {
  createBlogContentHealthReport,
  evaluateBlogContent,
} from "@altftool/core/blogContentHealth";

const ISSUE_ACTIONS = {
  body: "seo",
  seoDescription: "seo",
  taxonomy: "seo",
  trust: "review",
  freshness: "review",
  sources: "sources",
  faq: "faq",
  links: "links",
};

const BULK_FIX_ACTIONS = [
  { actionKey: "seo", issueKey: "seoDescription", label: "SEO pack" },
  { actionKey: "faq", issueKey: "faq", label: "FAQ" },
  { actionKey: "sources", issueKey: "sources", label: "Sources" },
  { actionKey: "review", issueKey: "trust", label: "Trust" },
  { actionKey: "review", issueKey: "freshness", label: "Review date" },
];

const ISSUE_ICONS = {
  slug: Link2,
  heading: FileText,
  body: FileText,
  seoDescription: SearchCheck,
  image: FileText,
  taxonomy: Sparkles,
  trust: ShieldCheck,
  freshness: ShieldCheck,
  sources: BookOpenCheck,
  faq: HelpCircle,
  links: Link2,
};

function parseTags(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function normalizeBlog(blog = {}) {
  return {
    ...blog,
    heading: blog.heading || blog.title || "",
    title: blog.heading || blog.title || "",
    description: blog.description || blog.content || blog.body || "",
    tags: parseTags(blog.tags),
    sources: Array.isArray(blog.sources) ? blog.sources : [],
  };
}

function scoreTone(score = 0) {
  if (score >= 86) return "bg-green-50 text-green-700";
  if (score >= 72) return "bg-amber-50 text-amber-700";
  return "bg-red-50 text-red-600";
}

function statusTone(status = "") {
  if (status === "ready") return "bg-green-50 text-green-700";
  if (status === "watch") return "bg-amber-50 text-amber-700";
  return "bg-red-50 text-red-600";
}

function QueueRow({ item, onEdit }) {
  const firstIssue = item.missing[0] || "";
  const action = ISSUE_ACTIONS[firstIssue] || "seo";

  return (
    <button
      type="button"
      onClick={() => onEdit?.(item.blog, action)}
      className="group w-full rounded-xl border border-gray-100 bg-gray-50 px-3 py-3 text-left transition hover:border-blue-200 hover:bg-blue-50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-black leading-5 text-gray-900 group-hover:text-blue-700">{item.title}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {item.missing.slice(0, 3).map((issue) => (
              <span key={`${item.id}-${issue}`} className="rounded-lg bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                {issue}
              </span>
            ))}
          </div>
        </div>
        <span className={`shrink-0 rounded-lg px-2 py-1 text-xs font-black ${scoreTone(item.score)}`}>{item.score}</span>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 text-xs">
        <span className={`rounded-lg px-2 py-1 font-bold capitalize ${statusTone(item.status)}`}>{item.status.replace("-", " ")}</span>
        <span className="inline-flex items-center gap-1 font-bold text-blue-700">
          <WandSparkles className="h-3.5 w-3.5" />
          Fix
        </span>
      </div>
    </button>
  );
}

export default function BlogContentHealthQueue({
  applying = false,
  blogs = [],
  onEdit,
  onBulkFix,
  onFilterIssue,
  selectedCount = 0,
}) {
  const normalizedBlogs = useMemo(() => blogs.map(normalizeBlog), [blogs]);
  const report = useMemo(
    () => createBlogContentHealthReport(normalizedBlogs, { source: "admin" }),
    [normalizedBlogs],
  );
  const rows = useMemo(
    () =>
      normalizedBlogs
        .map((blog) => ({ ...evaluateBlogContent(blog), blog }))
        .filter((item) => item.missing.length > 0)
        .sort((a, b) => a.score - b.score || a.title.localeCompare(b.title))
        .slice(0, 6),
    [normalizedBlogs],
  );

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-wider text-gray-500">Content health</p>
          <h2 className="mt-1 text-xl font-black text-gray-900">{report.score}% score</h2>
          <p className="mt-1 text-xs leading-5 text-gray-500">
            {report.totals.ready} ready, {report.totals.watch} watch, {report.totals.needsWork} need work.
          </p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          {report.ok ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-gray-50 px-2 py-2">
          <p className="text-sm font-black text-gray-900">{report.totals.withSources}</p>
          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Sources</p>
        </div>
        <div className="rounded-xl bg-gray-50 px-2 py-2">
          <p className="text-sm font-black text-gray-900">{report.totals.withFaq}</p>
          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">FAQ</p>
        </div>
        <div className="rounded-xl bg-gray-50 px-2 py-2">
          <p className="text-sm font-black text-gray-900">{report.totals.withLinks}</p>
          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Links</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onBulkFix?.({ actionKey: "smart", limit: 10 })}
        disabled={applying || !rows.length}
        className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {applying ? <RefreshCw className="h-4 w-4 animate-spin" /> : <WandSparkles className="h-4 w-4" />}
        {applying ? "Fixing..." : selectedCount ? `Fix ${selectedCount} selected` : "Fix top 10 issues"}
      </button>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {BULK_FIX_ACTIONS.map((action) => (
          <button
            key={`${action.actionKey}-${action.issueKey}`}
            type="button"
            onClick={() => onBulkFix?.({ actionKey: action.actionKey, issueKey: action.issueKey, limit: 10 })}
            disabled={applying}
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl border border-blue-100 bg-white px-2 text-[11px] font-bold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <WandSparkles className="h-3.5 w-3.5" />
            {action.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Top missing fields</p>
        {report.topIssues.slice(0, 5).map((issue) => {
          const Icon = ISSUE_ICONS[issue.key] || AlertTriangle;
          const actionKey = ISSUE_ACTIONS[issue.key];
          return (
            <div
              key={issue.key}
              className="group flex w-full items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-left transition hover:border-blue-200 hover:bg-blue-50"
            >
              <button type="button" onClick={() => onFilterIssue?.(issue.key)} className="inline-flex min-w-0 flex-1 items-center gap-2 text-left">
                <Icon className="h-3.5 w-3.5 shrink-0 text-gray-400 group-hover:text-blue-600" />
                <span className="truncate text-sm font-semibold text-gray-700 group-hover:text-blue-700">{issue.label}</span>
              </button>
              <div className="flex shrink-0 items-center gap-1.5">
                <span className="rounded-lg bg-white px-2 py-1 text-xs font-black text-gray-600 shadow-sm">{issue.count}</span>
                {actionKey ? (
                  <button
                    type="button"
                    onClick={() => onBulkFix?.({ actionKey, issueKey: issue.key, limit: 10 })}
                    disabled={applying}
                    className="rounded-lg bg-blue-600 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                  >
                    Fix
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Fix queue</p>
        {rows.length ? (
          rows.map((item) => <QueueRow key={`${item.id}-${item.slug}`} item={item} onEdit={onEdit} />)
        ) : (
          <div className="rounded-xl bg-green-50 px-3 py-3 text-sm font-semibold text-green-700">
            No content-health gaps found.
          </div>
        )}
      </div>
    </section>
  );
}
