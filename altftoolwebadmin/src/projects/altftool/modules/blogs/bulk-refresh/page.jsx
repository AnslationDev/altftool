"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpenCheck,
  CalendarClock,
  Check,
  CheckCircle2,
  Circle,
  FileText,
  Filter,
  Image as ImageIcon,
  Link2,
  RefreshCw,
  Search,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  WandSparkles,
  X,
} from "lucide-react";
import { fetchAllBlogs } from "../services/blogsService";
import { getBlogContentQuality, parseBlogTags } from "../components/BlogSeoChecklist";
import { getBlogSchemaHealth, stripBlogHtml } from "../components/blogSeoHealth";

const ACTIONS = [
  {
    key: "seo",
    label: "SEO pack",
    icon: Sparkles,
    tone: "blue",
    matchGaps: ["quality", "rich-result", "review-date", "body"],
  },
  {
    key: "faq",
    label: "FAQ",
    icon: SearchCheck,
    tone: "amber",
    matchGaps: ["faq", "rich-result"],
  },
  {
    key: "sources",
    label: "Sources",
    icon: BookOpenCheck,
    tone: "green",
    matchGaps: ["citations", "trust", "review-date", "rich-result"],
  },
  {
    key: "links",
    label: "Links",
    icon: Link2,
    tone: "slate",
    matchGaps: ["internal-links"],
  },
  {
    key: "review",
    label: "Review",
    icon: ShieldCheck,
    tone: "violet",
    matchGaps: ["trust", "review-date", "image"],
  },
];

const GAP_FILTERS = [
  { value: "all", label: "All gaps" },
  { value: "rich-result", label: "Rich results" },
  { value: "quality", label: "Quality" },
  { value: "faq", label: "FAQ" },
  { value: "citations", label: "Sources" },
  { value: "internal-links", label: "Links" },
  { value: "trust", label: "Trust" },
  { value: "image", label: "Image" },
  { value: "review-date", label: "Review date" },
];

const STATUS_FILTERS = [
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
  { value: "all", label: "All status" },
];

const GAP_LABELS = {
  "rich-result": "Rich result",
  quality: "Quality",
  faq: "FAQ",
  citations: "Sources",
  "internal-links": "Links",
  trust: "Trust",
  image: "Image",
  "review-date": "Review date",
  body: "Depth",
};

const GAP_WEIGHTS = {
  "rich-result": 30,
  quality: 22,
  citations: 18,
  faq: 16,
  trust: 14,
  "internal-links": 14,
  image: 12,
  "review-date": 10,
  body: 8,
};

function toDate(value) {
  if (!value) return null;
  if (typeof value?.toDate === "function") {
    const date = value.toDate();
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (typeof value?.seconds === "number") {
    const date = new Date(value.seconds * 1000);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getDaysSince(value, fallback) {
  const date = toDate(value || fallback);
  if (!date) return null;
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)));
}

function getBlogTitle(blog = {}) {
  return blog.heading || blog.title || "Untitled blog";
}

function getBlogExcerpt(blog = {}) {
  return (
    blog.seoDescription ||
    blog.excerpt ||
    stripBlogHtml(blog.description || blog.content || blog.body || "").slice(0, 150) ||
    "No excerpt available"
  );
}

function getCategory(blog = {}) {
  return String(blog.category || blog.categoryName || "Uncategorized").trim() || "Uncategorized";
}

function normalizeStatus(value = "") {
  return String(value || "draft").toLowerCase() === "published" ? "published" : "draft";
}

function getGapList({ blog, quality, schemaHealth, daysSinceUpdate }) {
  const gaps = [];
  const addGap = (key, detail) => gaps.push({ key, label: GAP_LABELS[key], detail, weight: GAP_WEIGHTS[key] || 8 });

  if (!schemaHealth.richResultReady) addGap("rich-result", "Article, FAQ, and citation inputs are incomplete.");
  if (quality.score < 75) addGap("quality", `SEO quality is ${quality.score}%.`);
  if (!schemaHealth.flags.hasFaq) addGap("faq", "Authored FAQ source is missing.");
  if (schemaHealth.flags.sourceCount < 1) addGap("citations", "No cited source is attached.");
  if (!schemaHealth.flags.hasInternalLink) addGap("internal-links", "No contextual AltFTool link found.");
  if (!schemaHealth.flags.hasTrustSignal || !String(blog.author || "").trim()) {
    addGap("trust", "Author, reviewer, or editorial context is incomplete.");
  }
  if (!schemaHealth.flags.hasHeroImage || !schemaHealth.flags.hasHeroAlt) {
    addGap("image", schemaHealth.flags.hasHeroImage ? "Featured image alt text needs work." : "Featured image is missing.");
  }
  if (!schemaHealth.flags.hasReviewDate || (daysSinceUpdate !== null && daysSinceUpdate >= 90)) {
    addGap("review-date", daysSinceUpdate !== null ? `${daysSinceUpdate} days since last update.` : "Review date is missing.");
  }
  if (schemaHealth.flags.wordCount < 250) addGap("body", `${schemaHealth.flags.wordCount} words in body.`);

  return gaps;
}

function getRecommendedAction(gaps = []) {
  if (gaps.some((gap) => gap.key === "citations" || gap.key === "trust")) return "sources";
  if (gaps.some((gap) => gap.key === "faq")) return "faq";
  if (gaps.some((gap) => gap.key === "internal-links")) return "links";
  if (gaps.some((gap) => gap.key === "image" || gap.key === "review-date")) return "review";
  return "seo";
}

function buildBlogAudit(blog = {}) {
  const formData = {
    ...blog,
    heading: blog.heading || blog.title || "",
    description: blog.description || blog.content || blog.body || "",
    tags: blog.tags || "",
  };
  const schemaHealth = getBlogSchemaHealth(formData);
  const quality = getBlogContentQuality({
    formData,
    imageAlt: blog.imageAlt || "",
    hasImage: Boolean(blog.image),
  });
  const tags = parseBlogTags(blog.tags);
  const daysSinceUpdate = getDaysSince(blog.reviewedAt || blog.updatedAt, blog.date || blog.createdAt);
  const gaps = getGapList({ blog: formData, quality, schemaHealth, daysSinceUpdate });
  const refreshScore = Math.min(
    100,
    gaps.reduce((total, gap) => total + gap.weight, 0) +
      (normalizeStatus(blog.status) === "published" ? 8 : 0) +
      (Number(blog.views || 0) > 500 ? 6 : 0),
  );

  return {
    ...blog,
    title: getBlogTitle(blog),
    excerpt: getBlogExcerpt(blog),
    category: getCategory(blog),
    status: normalizeStatus(blog.status),
    qualityScore: quality.score,
    schemaScore: schemaHealth.score,
    schemaHealth,
    tags,
    daysSinceUpdate,
    gaps,
    refreshScore,
    recommendedAction: getRecommendedAction(gaps),
    richResultReady: schemaHealth.richResultReady,
  };
}

function toneClasses(tone = "slate", active = false) {
  const map = {
    blue: active ? "border-blue-500 bg-blue-50 text-blue-700" : "border-blue-100 bg-white text-blue-700 hover:bg-blue-50",
    amber: active
      ? "border-amber-500 bg-amber-50 text-amber-700"
      : "border-amber-100 bg-white text-amber-700 hover:bg-amber-50",
    green: active
      ? "border-green-500 bg-green-50 text-green-700"
      : "border-green-100 bg-white text-green-700 hover:bg-green-50",
    violet: active
      ? "border-violet-500 bg-violet-50 text-violet-700"
      : "border-violet-100 bg-white text-violet-700 hover:bg-violet-50",
    slate: active
      ? "border-slate-700 bg-slate-900 text-white"
      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
  };
  return map[tone] || map.slate;
}

function priorityTone(score = 0) {
  if (score >= 70) return "bg-red-50 text-red-600";
  if (score >= 42) return "bg-amber-50 text-amber-700";
  return "bg-green-50 text-green-700";
}

function EmptyState({ onReset }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
        <Filter className="h-5 w-5" />
      </div>
      <h2 className="mt-4 text-base font-black text-gray-900">No matching posts</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
        Adjust filters or search to bring more blogs into this refresh queue.
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

function StatCard({ icon: Icon, label, value, caption, tone = "blue" }) {
  const toneMap = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    slate: "bg-slate-50 text-slate-600",
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneMap[tone] || toneMap.blue}`}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-2xl font-black text-gray-900">{value}</span>
      </div>
      <p className="mt-3 text-xs font-black uppercase tracking-wider text-gray-500">{label}</p>
      <p className="mt-1 text-xs leading-5 text-gray-400">{caption}</p>
    </div>
  );
}

function BlogRow({ blog, selected, actionMode, onToggle, onOpen }) {
  const action = ACTIONS.find((item) => item.key === blog.recommendedAction) || ACTIONS[0];
  const ActionIcon = action.icon;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-blue-100 hover:shadow-md">
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onToggle(blog.id)}
          className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition ${
            selected ? "border-blue-500 bg-blue-600 text-white" : "border-gray-200 bg-white text-gray-400 hover:bg-gray-50"
          }`}
          aria-label={selected ? "Remove blog from queue" : "Add blog to queue"}
        >
          {selected ? <Check className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-wide ${priorityTone(blog.refreshScore)}`}>
                  {blog.refreshScore} priority
                </span>
                <span className="rounded-lg bg-gray-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                  {blog.status}
                </span>
                <span className="rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                  {blog.category}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onOpen(blog, actionMode || blog.recommendedAction)}
                className="mt-2 block max-w-full text-left"
              >
                <h2 className="line-clamp-2 text-base font-black leading-6 text-gray-900 hover:text-blue-700">
                  {blog.title}
                </h2>
              </button>
              <p className="mt-1 line-clamp-2 text-sm leading-6 text-gray-500">{blog.excerpt}</p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <div className="rounded-xl bg-gray-50 px-3 py-2 text-center">
                <p className="text-lg font-black text-gray-900">{blog.qualityScore}</p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Quality</p>
              </div>
              <div className="rounded-xl bg-gray-50 px-3 py-2 text-center">
                <p className="text-lg font-black text-gray-900">{blog.schemaScore}</p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Schema</p>
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {blog.gaps.slice(0, 5).map((gap) => (
              <span key={`${blog.id}-${gap.key}`} title={gap.detail} className="rounded-lg bg-gray-50 px-2 py-1 text-[11px] font-semibold text-gray-600">
                {gap.label}
              </span>
            ))}
            {!blog.gaps.length && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-2 py-1 text-[11px] font-semibold text-green-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Ready
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onOpen(blog, actionMode || blog.recommendedAction)}
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-gray-900 px-3 text-xs font-semibold text-white transition hover:bg-gray-700"
            >
              <WandSparkles className="h-3.5 w-3.5" />
              Open {ACTIONS.find((item) => item.key === (actionMode || blog.recommendedAction))?.label || "Refresh"}
            </button>
            <button
              type="button"
              onClick={() => onOpen(blog, blog.recommendedAction)}
              className={`inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-semibold transition ${toneClasses(action.tone)}`}
            >
              <ActionIcon className="h-3.5 w-3.5" />
              Best: {action.label}
            </button>
            <button
              type="button"
              onClick={() => onOpen(blog, "")}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              <FileText className="h-3.5 w-3.5" />
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BulkBlogRefreshPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("published");
  const [gapFilter, setGapFilter] = useState("rich-result");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [actionMode, setActionMode] = useState("seo");
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function loadBlogs() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchAllBlogs();
        if (mounted) setBlogs(data);
      } catch (err) {
        console.error("Bulk refresh blog load failed", err);
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

  const auditedBlogs = useMemo(() => blogs.map(buildBlogAudit).sort((a, b) => b.refreshScore - a.refreshScore || a.title.localeCompare(b.title)), [blogs]);

  const categories = useMemo(
    () => ["all", ...new Set(auditedBlogs.map((blog) => blog.category).filter(Boolean))].sort((a, b) => (a === "all" ? -1 : b === "all" ? 1 : a.localeCompare(b))),
    [auditedBlogs],
  );

  const stats = useMemo(() => {
    const published = auditedBlogs.filter((blog) => blog.status === "published");
    return {
      total: auditedBlogs.length,
      queue: auditedBlogs.filter((blog) => blog.gaps.length > 0).length,
      richReady: published.filter((blog) => blog.richResultReady).length,
      missingSources: published.filter((blog) => blog.gaps.some((gap) => gap.key === "citations")).length,
      missingFaq: published.filter((blog) => blog.gaps.some((gap) => gap.key === "faq")).length,
      missingLinks: published.filter((blog) => blog.gaps.some((gap) => gap.key === "internal-links")).length,
      published: published.length,
    };
  }, [auditedBlogs]);

  const filteredBlogs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return auditedBlogs.filter((blog) => {
      if (statusFilter !== "all" && blog.status !== statusFilter) return false;
      if (categoryFilter !== "all" && blog.category !== categoryFilter) return false;
      if (gapFilter !== "all" && !blog.gaps.some((gap) => gap.key === gapFilter)) return false;
      if (!query) return true;
      return [
        blog.title,
        blog.excerpt,
        blog.category,
        blog.status,
        blog.author,
        blog.slug,
        blog.tags.join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [auditedBlogs, categoryFilter, gapFilter, search, statusFilter]);

  const selectedBlogs = useMemo(
    () => selectedIds.map((id) => auditedBlogs.find((blog) => blog.id === id)).filter(Boolean),
    [auditedBlogs, selectedIds],
  );

  const visibleSelectedCount = filteredBlogs.filter((blog) => selectedIds.includes(blog.id)).length;

  const toggleSelected = (id) => {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const selectTopVisible = () => {
    const visibleIds = filteredBlogs.slice(0, 25).map((blog) => blog.id);
    setSelectedIds((current) => [...new Set([...current, ...visibleIds])]);
  };

  const clearSelected = () => setSelectedIds([]);

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("published");
    setGapFilter("rich-result");
    setCategoryFilter("all");
  };

  const openEditor = (blog, action = actionMode) => {
    const suffix = action ? `?refreshAction=${encodeURIComponent(action)}` : "";
    router.push(`/altftool/blogs/edit-blog/${blog.id}${suffix}`);
  };

  const startFirstSelected = () => {
    const first = selectedBlogs[0] || filteredBlogs[0];
    if (first) openEditor(first, actionMode || first.recommendedAction);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-5 px-4 py-8">
        <div className="h-8 w-64 animate-pulse rounded-xl bg-gray-100" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-28 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_330px]">
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
            <h1 className="mt-1 text-2xl font-black tracking-tight text-gray-900">Bulk Refresh Assistant</h1>
            <p className="mt-1 text-sm text-gray-500">Prioritize posts by schema, SEO quality, sources, FAQ, links, and freshness.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/altftool/blogs/analytics")}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <SearchCheck className="h-4 w-4" />
            Analytics
          </button>
          <button
            type="button"
            onClick={() => router.push("/altftool/blogs/quality")}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-green-100 bg-green-50 px-4 text-sm font-semibold text-green-700 transition hover:bg-green-100"
          >
            <ShieldCheck className="h-4 w-4" />
            Quality
          </button>
          <button
            type="button"
            onClick={startFirstSelected}
            disabled={!selectedBlogs.length && !filteredBlogs.length}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            <WandSparkles className="h-4 w-4" />
            Start queue
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={RefreshCw} label="Refresh queue" value={stats.queue.toLocaleString()} caption={`${stats.total} total blogs audited`} tone="blue" />
        <StatCard icon={Sparkles} label="Rich ready" value={`${stats.richReady}/${stats.published}`} caption="Published posts with FAQ and citations" tone="green" />
        <StatCard icon={BookOpenCheck} label="Sources" value={stats.missingSources.toLocaleString()} caption="Published posts missing citations" tone="amber" />
        <StatCard icon={SearchCheck} label="FAQ" value={stats.missingFaq.toLocaleString()} caption="Published posts missing authored FAQ" tone="slate" />
        <StatCard icon={Link2} label="Links" value={stats.missingLinks.toLocaleString()} caption="Published posts missing internal links" tone="red" />
      </div>

      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(240px,1fr)_repeat(3,minmax(150px,190px))]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title, author, slug, tags"
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
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
          <div className="flex flex-wrap gap-2">
            {ACTIONS.map((action) => {
              const Icon = action.icon;
              const active = actionMode === action.key;
              return (
                <button
                  key={action.key}
                  type="button"
                  onClick={() => setActionMode(action.key)}
                  className={`inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-bold transition ${toneClasses(action.tone, active)}`}
                  title={action.matchGaps.map((gap) => GAP_LABELS[gap]).join(", ")}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {action.label}
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
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="space-y-3">
          {filteredBlogs.length ? (
            filteredBlogs.map((blog) => (
              <BlogRow
                key={blog.id}
                blog={blog}
                selected={selectedIds.includes(blog.id)}
                actionMode={actionMode}
                onToggle={toggleSelected}
                onOpen={openEditor}
              />
            ))
          ) : (
            <EmptyState onReset={resetFilters} />
          )}
        </section>

        <aside className="lg:sticky lg:top-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-gray-500">Selected queue</p>
                <h2 className="mt-1 text-xl font-black text-gray-900">{selectedBlogs.length} posts</h2>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <RefreshCw className="h-5 w-5" />
              </div>
            </div>

            <button
              type="button"
              onClick={startFirstSelected}
              disabled={!selectedBlogs.length && !filteredBlogs.length}
              className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <WandSparkles className="h-4 w-4" />
              Open first item
            </button>

            <div className="mt-4 space-y-2">
              {selectedBlogs.length ? (
                selectedBlogs.slice(0, 12).map((blog, index) => (
                  <button
                    key={blog.id}
                    type="button"
                    onClick={() => openEditor(blog, actionMode || blog.recommendedAction)}
                    className="group flex w-full items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-xs font-black text-blue-600 shadow-sm">
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-1 text-sm font-semibold text-gray-800 group-hover:text-blue-700">
                        {blog.title}
                      </span>
                      <span className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-gray-400">
                        <CalendarClock className="h-3 w-3" />
                        {blog.daysSinceUpdate !== null ? `${blog.daysSinceUpdate} days` : "No date"}
                      </span>
                    </span>
                  </button>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center">
                  <ImageIcon className="mx-auto h-6 w-6 text-gray-300" />
                  <p className="mt-3 text-sm font-semibold text-gray-500">Pick posts from the list.</p>
                </div>
              )}
              {selectedBlogs.length > 12 && (
                <p className="rounded-lg bg-gray-50 px-3 py-2 text-center text-xs font-semibold text-gray-500">
                  {selectedBlogs.length - 12} more selected
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
