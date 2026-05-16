"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import { emitAlert } from "@/lib/alertBus";
import { fetchAllBlogs, updateBlog } from "../services/blogsService";
import { parseBlogTags } from "../components/BlogSeoChecklist";
import { checkExternalLinks, summarizeExternalLinkResults } from "../components/blogExternalLinkClient";
import { buildBlogLinkGraph } from "../components/blogLinkAudit";
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

function scoreTone(score = 0) {
  if (score >= 80) return "text-green-700 bg-green-50";
  if (score >= 60) return "text-amber-700 bg-amber-50";
  return "text-red-600 bg-red-50";
}

function barTone(score = 0) {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-amber-400";
  return "bg-red-400";
}

function gapTone(key = "") {
  const map = {
    "rich-result": "bg-blue-50 text-blue-700",
    quality: "bg-red-50 text-red-600",
    faq: "bg-amber-50 text-amber-700",
    citations: "bg-green-50 text-green-700",
    "internal-links": "bg-slate-100 text-slate-700",
    trust: "bg-violet-50 text-violet-700",
    image: "bg-cyan-50 text-cyan-700",
    "review-date": "bg-orange-50 text-orange-700",
    body: "bg-gray-100 text-gray-700",
  };
  return map[key] || "bg-gray-100 text-gray-700";
}

function StatCard({ icon: Icon, label, value, caption, tone = "blue" }) {
  const toneMap = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-wider text-gray-400">{label}</p>
          <p className="mt-2 break-words text-2xl font-black leading-tight text-gray-900">{value}</p>
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneMap[tone] || toneMap.blue}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-gray-500">{caption}</p>
    </div>
  );
}

function ScorePill({ label, score }) {
  return (
    <div className="rounded-xl bg-gray-50 px-3 py-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">{label}</span>
        <span className={`rounded-lg px-2 py-1 text-xs font-black ${scoreTone(score)}`}>{score}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200">
        <div className={`h-full rounded-full ${barTone(score)}`} style={{ width: `${Math.max(4, score)}%` }} />
      </div>
    </div>
  );
}

function EmptyState({ onReset }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
        <Filter className="h-5 w-5" />
      </div>
      <h2 className="mt-4 text-base font-black text-gray-900">No posts in this queue</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
        Clear one or two filters to review the full blog quality list.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-5 inline-flex h-10 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
      >
        Reset filters
      </button>
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

function buildBulkPatch(blog = {}, actionKey = "review") {
  const payload = buildQuickRefreshPayload(actionKey, normalizeBulkFormData(blog));
  const fields = { ...payload.fields };
  const blockResult = appendRefreshBlocks(blog.description || blog.content || blog.body || "", payload.blocks);

  if (fields.tags) fields.tags = parseBlogTags(fields.tags);
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
    <article className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-blue-100 hover:shadow-md">
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onToggle(blog.id)}
          className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition ${
            selected ? "border-blue-500 bg-blue-600 text-white" : "border-gray-200 bg-white text-gray-400 hover:bg-gray-50"
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
              <span className="rounded-lg bg-gray-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                {blog.status}
              </span>
              <span className="rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                {blog.category}
              </span>
              {blog.richResultReady ? (
                <span className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-green-700">
                  <CheckCircle2 className="h-3 w-3" />
                  Rich ready
                </span>
              ) : null}
              {brokenCount ? (
                <span className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-red-600">
                  <AlertTriangle className="h-3 w-3" />
                  {brokenCount} broken
                </span>
              ) : null}
            </div>

            <button type="button" onClick={() => onEdit(blog, "")} className="mt-2 block max-w-full text-left">
              <h2 className="line-clamp-2 text-base font-black leading-6 text-gray-900 transition hover:text-blue-700">
                {blog.title}
              </h2>
            </button>
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-gray-500">{blog.excerpt}</p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {blog.gaps.length ? (
                blog.gaps.slice(0, 7).map((gap) => (
                  <span key={`${blog.id}-${gap.key}`} title={gap.detail} className={`rounded-lg px-2 py-1 text-[11px] font-semibold ${gapTone(gap.key)}`}>
                    {gap.label}
                  </span>
                ))
              ) : (
                <span className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-2 py-1 text-[11px] font-semibold text-green-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  No blocking gaps
                </span>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-500 2xl:grid-cols-4">
              <div className="min-w-[76px] rounded-xl bg-gray-50 px-3 py-2">
                <p className="font-black text-gray-800">{blog.wordCount.toLocaleString()}</p>
                <p className="mt-0.5 whitespace-nowrap text-[11px] leading-4">words</p>
              </div>
              <div className="min-w-[76px] rounded-xl bg-gray-50 px-3 py-2">
                <p className="font-black text-gray-800">{inboundCount}</p>
                <p className="mt-0.5 whitespace-nowrap text-[11px] leading-4">inbound</p>
              </div>
              <div className="min-w-[76px] rounded-xl bg-gray-50 px-3 py-2">
                <p className="font-black text-gray-800">{outboundCount}</p>
                <p className="mt-0.5 whitespace-nowrap text-[11px] leading-4">outbound</p>
              </div>
              <div className={`min-w-[76px] rounded-xl px-3 py-2 ${brokenCount ? "bg-red-50 text-red-600" : "bg-gray-50"}`}>
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

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Next action</p>
                  <p className="mt-1 truncate text-sm font-black text-gray-900">{action.label}</p>
                </div>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${toneClasses(action.tone)}`}>
                  <ActionIcon className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-gray-500">
                Last signal: {formatAuditDate(blog.updatedDate, "No review date")}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onEdit(blog, blog.recommendedAction)}
                className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 px-3 text-xs font-semibold text-white transition hover:bg-gray-700"
              >
                <WandSparkles className="h-3.5 w-3.5" />
                Fix
              </button>
              <button
                type="button"
                onClick={() => onEdit(blog, "")}
                className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                <FileText className="h-3.5 w-3.5" />
                Edit
              </button>
              {blog.publicUrl ? (
                <a
                  href={blog.publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
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
    <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-gray-500">Link graph</p>
          <h2 className="mt-1 text-xl font-black text-gray-900">{graph.summary.internalLinks.toLocaleString()} links</h2>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
          <Link2 className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-red-50 px-2 py-2">
          <p className="text-lg font-black text-red-600">{graph.summary.brokenLinks}</p>
          <p className="text-[10px] font-bold uppercase tracking-wide text-red-500">Broken</p>
        </div>
        <div className="rounded-xl bg-amber-50 px-2 py-2">
          <p className="text-lg font-black text-amber-700">{graph.summary.isolated}</p>
          <p className="text-[10px] font-bold uppercase tracking-wide text-amber-600">Isolated</p>
        </div>
        <div className="rounded-xl bg-blue-50 px-2 py-2">
          <p className="text-lg font-black text-blue-700">{graph.summary.missingOutbound}</p>
          <p className="text-[10px] font-bold uppercase tracking-wide text-blue-600">No out</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 px-3 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Live external</p>
            <p className="mt-1 text-sm font-black text-gray-900">
              {graph.summary.externalLinks.toLocaleString()} external link{graph.summary.externalLinks === 1 ? "" : "s"}
            </p>
          </div>
          <button
            type="button"
            onClick={onCheckExternal}
            disabled={!externalUrls.length || checkingExternal}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${checkingExternal ? "animate-spin" : ""}`} />
            Check {externalUrls.length ? Math.min(externalUrls.length, 20) : ""}
          </button>
        </div>

        {externalCheck?.error ? (
          <div className="mt-2 rounded-lg border border-red-100 bg-white px-2 py-2 text-xs font-semibold text-red-600">
            {externalCheck.error}
          </div>
        ) : null}

        {hasExternalResults ? (
          <div className="mt-3 space-y-2">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-white px-2 py-2">
                <p className="text-sm font-black text-green-700">{externalSummary.ok}</p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-green-600">OK</p>
              </div>
              <div className="rounded-lg bg-white px-2 py-2">
                <p className="text-sm font-black text-amber-700">{externalSummary.warning + externalSummary.blocked}</p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-amber-600">Review</p>
              </div>
              <div className="rounded-lg bg-white px-2 py-2">
                <p className="text-sm font-black text-red-600">{externalSummary.broken}</p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-red-500">Broken</p>
              </div>
            </div>

            {externalSummary.issueResults.slice(0, 3).map((result) => (
              <div key={`${result.url}-${result.status || result.state}`} className="rounded-lg bg-white px-2 py-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className={`font-black ${result.state === "broken" ? "text-red-600" : "text-amber-700"}`}>
                    {result.status || result.state}
                  </span>
                  <span className="text-[10px] text-gray-400">{result.durationMs}ms</span>
                </div>
                <p className="mt-1 truncate font-mono text-[10px] text-gray-500">{result.url}</p>
                <p className="mt-1 text-[11px] leading-4 text-gray-600">{result.reason}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {brokenQueue.length ? (
        <div className="mt-4 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Broken links</p>
          {brokenQueue.map((node) => (
            <button
              key={`broken-${node.blog.id}`}
              type="button"
              onClick={() => onEdit(node.blog, "links")}
              className="group w-full rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-left transition hover:border-red-200 hover:bg-red-100"
            >
              <span className="block line-clamp-1 text-sm font-bold text-red-700 group-hover:text-red-800">{node.blog.title}</span>
              <span className="mt-1 block text-[11px] text-red-600">
                {node.audit.brokenLinks.length} issue{node.audit.brokenLinks.length === 1 ? "" : "s"} - {node.audit.brokenLinks[0]?.label}
              </span>
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-4 space-y-2">
        <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Isolated posts</p>
        {isolated.length ? (
          isolated.map((node) => (
            <button
              key={`isolated-${node.blog.id}`}
              type="button"
              onClick={() => onEdit(node.blog, "links")}
              className="group w-full rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-left transition hover:border-blue-200 hover:bg-blue-50"
            >
              <span className="block line-clamp-1 text-sm font-bold text-gray-700 group-hover:text-blue-700">{node.blog.title}</span>
              <span className="mt-1 block text-[11px] text-gray-500">0 inbound - 0 outbound blog links</span>
            </button>
          ))
        ) : (
          <div className="rounded-xl bg-green-50 px-3 py-3 text-sm font-semibold text-green-700">
            No fully isolated published posts.
          </div>
        )}
      </div>

      {hubs.length ? (
        <div className="mt-4 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Hub posts</p>
          {hubs.map((node) => (
            <div key={`hub-${node.blog.id}`} className="rounded-xl bg-gray-50 px-3 py-2">
              <p className="line-clamp-1 text-sm font-bold text-gray-700">{node.blog.title}</p>
              <p className="mt-1 text-[11px] text-gray-500">
                {node.inboundCount} inbound - {node.outboundCount} outbound
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
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

  const auditedBlogs = useMemo(() => blogs.map(buildBlogAudit), [blogs]);
  const summary = useMemo(() => buildQualitySummary(auditedBlogs), [auditedBlogs]);
  const linkGraph = useMemo(() => buildBlogLinkGraph(blogs), [blogs]);
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

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-5 px-4 py-8">
        <div className="h-9 w-72 animate-pulse rounded-xl bg-gray-100" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="h-28 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="h-96 animate-pulse rounded-2xl bg-gray-100" />
          <div className="h-96 animate-pulse rounded-2xl bg-gray-100" />
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
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 hover:text-gray-800"
            aria-label="Back to blogs"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-blue-600">AltFTool blogs</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-gray-900">Quality Center</h1>
            <p className="mt-1 text-sm text-gray-500">SEO readiness, rich-result gaps, freshness risk, and next editorial actions.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/altftool/blogs/analytics")}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </button>
          <button
            type="button"
            onClick={() => router.push("/altftool/blogs/bulk-refresh")}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
          >
            <RefreshCw className="h-4 w-4" />
            Bulk refresh
          </button>
          <button
            type="button"
            onClick={() => router.push("/altftool/blogs/add-blogs")}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white transition hover:bg-gray-700"
          >
            <PlusCircle className="h-4 w-4" />
            Add blog
          </button>
        </div>
      </div>

      {error ? (
        <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <StatCard icon={ShieldCheck} label="Health score" value={`${summary.healthScore}%`} caption={`${summary.avgQuality}% quality - ${summary.avgSchema}% schema`} tone={summary.healthScore >= 75 ? "green" : "amber"} />
        <StatCard icon={Sparkles} label="Rich ready" value={`${summary.richReady}/${summary.published}`} caption={`${summary.articleReady} published posts are Article-ready`} tone="green" />
        <StatCard icon={AlertTriangle} label="Critical" value={summary.critical.toLocaleString()} caption={`${summary.needsWork} total posts have open gaps`} tone={summary.critical ? "red" : "green"} />
        <StatCard icon={Link2} label="Broken links" value={linkGraph.summary.brokenLinks.toLocaleString()} caption={`${linkGraph.brokenQueue.length} posts need link cleanup`} tone={linkGraph.summary.brokenLinks ? "red" : "green"} />
        <StatCard icon={BookOpenCheck} label="Isolated" value={linkGraph.summary.isolated.toLocaleString()} caption={`${linkGraph.summary.missingOutbound} published posts have no outbound links`} tone="amber" />
        <StatCard icon={Clock3} label="Stale posts" value={summary.stale.toLocaleString()} caption={`${summary.missingLinks} published posts need internal links`} tone={summary.stale ? "amber" : "slate"} />
      </div>

      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-[minmax(240px,1fr)_repeat(5,minmax(130px,170px))]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title, slug, author, category"
              className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />
          </label>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
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
            className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
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
            className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
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
            className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
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
            className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
          >
            {SORT_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
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
            <span className="rounded-lg bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-500">
              {filteredBlogs.length} shown - {visibleSelectedCount} selected here
            </span>
            <button
              type="button"
              onClick={selectTopVisible}
              disabled={!filteredBlogs.length}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check className="h-3.5 w-3.5" />
              Select top 25
            </button>
            <button
              type="button"
              onClick={clearSelected}
              disabled={!selectedIds.length}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              <Filter className="h-3.5 w-3.5" />
              Reset
            </button>
            <button
              type="button"
              onClick={startTopIssue}
              disabled={!filteredBlogs.length}
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-gray-900 px-3 text-xs font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-300"
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
            <EmptyState onReset={resetFilters} />
          )}
        </section>

        <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <LinkGraphPanel
            externalCheck={externalCheck}
            externalSummary={externalSummary}
            externalUrls={externalSweepUrls}
            graph={linkGraph}
            onCheckExternal={runExternalSweep}
            onEdit={openEditor}
          />

          <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-gray-500">Bulk actions</p>
                <h2 className="mt-1 text-xl font-black text-gray-900">{selectedBlogs.length} selected</h2>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
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
              className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {bulkApplying ? <RefreshCw className="h-4 w-4 animate-spin" /> : <WandSparkles className="h-4 w-4" />}
              {bulkApplying ? "Applying..." : `Apply ${getActionConfig(bulkAction).shortLabel}`}
            </button>

            <p className="mt-3 text-xs leading-5 text-gray-500">
              Updates selected posts with the same guarded refresh helpers used by the editor, skipping duplicate FAQ or note blocks.
            </p>
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-gray-500">Issue breakdown</p>
                <h2 className="mt-1 text-xl font-black text-gray-900">{summary.needsWork} open</h2>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
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
                  className="group flex w-full items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-left transition hover:border-blue-200 hover:bg-blue-50"
                >
                  <span className="truncate text-sm font-semibold text-gray-700 group-hover:text-blue-700">{gap.label}</span>
                  <span className="rounded-lg bg-white px-2 py-1 text-xs font-black text-gray-600 shadow-sm">{gap.count}</span>
                </button>
              ))}
              {!summary.gapCounts.length ? (
                <div className="rounded-xl border border-dashed border-green-100 bg-green-50 px-4 py-8 text-center text-sm font-semibold text-green-700">
                  Every audited post is clear.
                </div>
              ) : null}
            </div>
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-gray-500">Action mix</p>
                <h2 className="mt-1 text-xl font-black text-gray-900">Focus queue</h2>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
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
                      <span className="inline-flex items-center gap-1.5 font-semibold text-gray-600">
                        <Icon className="h-3.5 w-3.5" />
                        {action.label}
                      </span>
                      <span className="font-black text-gray-500">{action.count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full rounded-full bg-blue-500" style={{ width: `${width}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
