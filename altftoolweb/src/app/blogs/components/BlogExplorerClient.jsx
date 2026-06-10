"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Hash,
  Loader2,
  MessageCircleQuestion,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  BLOG_CHUNK_SIZE,
  BLOG_REMOTE_LIMIT,
  getBlogFreshness,
  mergeBlogPosts,
  normalizeBlog,
} from "../data";

const INITIAL_VISIBLE_COUNT = 24;
const BACKGROUND_SYNC_PAGE_LIMIT = 1;
const SORT_OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "trending", label: "Trending" },
  { value: "quick", label: "Quick reads" },
  { value: "refresh", label: "Needs refresh" },
  { value: "category", label: "Category" },
];
const FRESHNESS_OPTIONS = [
  { value: "all", label: "All freshness" },
  { value: "fresh", label: "Fresh" },
  { value: "reviewed", label: "Reviewed" },
  { value: "watch", label: "Refresh soon" },
  { value: "stale", label: "Needs refresh" },
];
const READINESS_OPTIONS = [
  { value: "all", label: "All guide types" },
  { value: "reviewed", label: "Reviewed" },
  { value: "quick", label: "Quick reads" },
  { value: "fresh", label: "Fresh guides" },
  { value: "rich-ready", label: "Deep guides" },
  { value: "seo-ready", label: "Complete guides" },
  { value: "sources", label: "Cited guides" },
  { value: "faq", label: "FAQ included" },
  { value: "links", label: "Linked guides" },
];
const DEFAULT_SEARCH_SHORTCUTS = ["pdf", "image", "downloader", "calculator", "productivity", "games"];

function escapeRegExp(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getSearchTerms(query = "") {
  return String(query)
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length > 2)
    .slice(0, 5);
}

function HighlightedText({ text, terms = [], className = "" }) {
  const value = String(text || "");
  const visibleTerms = terms.filter(Boolean);
  if (!value || !visibleTerms.length) return <span className={className}>{value}</span>;

  const pattern = new RegExp(`(${visibleTerms.map(escapeRegExp).join("|")})`, "ig");
  const parts = value.split(pattern).filter((part) => part !== "");

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const isMatch = visibleTerms.some((term) => part.toLowerCase() === term);
        return isMatch ? (
          <mark
            key={`${part}-${index}`}
            className="rounded-[4px] bg-(--primary)/15 px-0.5 text-(--foreground)"
          >
            {part}
          </mark>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        );
      })}
    </span>
  );
}

function formatDate(date) {
  if (!date) return "Recently updated";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function getCategoryCounts(posts) {
  return posts.reduce((acc, post) => {
    acc.All = (acc.All || 0) + 1;
    acc[post.category] = (acc[post.category] || 0) + 1;
    return acc;
  }, {});
}

function getTagCounts(posts) {
  return posts.reduce((acc, post) => {
    const tags = Array.isArray(post.tags) ? post.tags : [];
    tags.forEach((tag) => {
      if (!tag) return;
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {});
}

function getPopularityScore(post = {}) {
  const views = Number(post.views || post.viewCount || post.totalViews || 0);
  const likes = Number(post.likesCount || post.likes || post.reactions || 0);
  const comments = Number(post.commentsCount || post.commentCount || post.comments || 0);
  const dateTime = Date.parse(post.date || post.updatedAt || post.createdAt || "");
  const daysOld = dateTime
    ? Math.max(0, (Date.now() - dateTime) / (1000 * 60 * 60 * 24))
    : 90;
  const recencyBoost = Math.max(0, 45 - Math.min(daysOld, 45));

  return views + likes * 12 + comments * 18 + recencyBoost;
}

function getFreshnessWeight(post = {}) {
  const freshness = getBlogFreshness(post);
  const weightMap = {
    stale: 4,
    watch: 3,
    unknown: 2,
    reviewed: 1,
    fresh: 0,
  };

  return (weightMap[freshness.status] || 0) * 1000 + Number(freshness.daysSinceUpdate || 0);
}

function getFreshnessBadgeClass(status) {
  const map = {
    fresh: "border-emerald-400/35 bg-emerald-500/90 text-white",
    reviewed: "border-blue-400/35 bg-blue-500/90 text-white",
    watch: "border-amber-400/45 bg-amber-500/90 text-white",
    stale: "border-red-400/45 bg-red-500/90 text-white",
    unknown: "border-white/20 bg-black/45 text-white",
  };

  return map[status] || map.unknown;
}

function getSourceCount(post = {}) {
  return Array.isArray(post.sources)
    ? post.sources.filter((source) => source?.title || source?.url).length
    : 0;
}

function hasFaqContent(post = {}) {
  const structuredFaqs = [post.faq, post.faqs, post.faqItems, post.faq?.items]
    .filter(Array.isArray)
    .some((items) =>
      items.some((item) => {
        const question = String(item?.question || item?.q || item?.title || "").trim();
        const answer = String(item?.answer || item?.a || item?.description || "").trim();
        return question.length > 4 && answer.length > 12;
      })
    );

  return (
    structuredFaqs ||
    /FAQ_ITEM|FAQ_Q|FAQ_A|<!--\s*FAQ Start\s*-->/i.test(
      String(post.description || post.content || post.body || "")
    )
  );
}

function hasInternalLinks(post = {}) {
  return /href=["']\/(?:tools|blogs|buysmart|extensions|top|news)/i.test(
    String(post.description || post.content || post.body || "")
  );
}

function getPostReadiness(post = {}) {
  const sourceCount = getSourceCount(post);
  const hasSources = sourceCount > 0;
  const hasFaq = hasFaqContent(post);
  const hasTrust = Boolean(post.authorRole || post.reviewedBy || post.editorialNote);
  const hasImage = Boolean(post.image);
  const hasImageAlt = !post.image || String(post.imageAlt || "").trim().length >= 5;
  const metaLength = String(post.seoDescription || post.excerpt || "").trim().length;
  const hasSearchDescription = metaLength >= 80 && metaLength <= 180;
  const hasTags = Array.isArray(post.tags) && post.tags.filter(Boolean).length >= 2;
  const hasLinks = hasInternalLinks(post);

  const checks = [
    { key: "sources", done: hasSources },
    { key: "faq", done: hasFaq },
    { key: "trust", done: hasTrust },
    { key: "image", done: hasImage && hasImageAlt },
    { key: "description", done: hasSearchDescription },
    { key: "tags", done: hasTags },
    { key: "links", done: hasLinks },
  ];
  const doneCount = checks.filter((check) => check.done).length;
  const score = Math.round((doneCount / checks.length) * 100);
  const richReady = hasSources && hasFaq && hasTrust && hasImage && hasImageAlt && hasSearchDescription;

  return {
    score,
    richReady,
    hasSources,
    hasFaq,
    hasTrust,
    hasLinks,
    sourceCount,
    status: richReady ? "rich-ready" : score >= 72 ? "seo-ready" : score >= 45 ? "needs-polish" : "needs-work",
    label: richReady ? "Deep guide" : score >= 72 ? "Complete guide" : score >= 45 ? "Quick guide" : "Starter guide",
    missing: checks.filter((check) => !check.done).map((check) => check.key),
  };
}

function getReadinessBadgeClass(status) {
  const map = {
    "rich-ready": "border-emerald-400/35 bg-emerald-500/90 text-white",
    "seo-ready": "border-blue-400/35 bg-blue-500/90 text-white",
    "needs-polish": "border-amber-400/45 bg-amber-500/90 text-white",
    "needs-work": "border-white/20 bg-black/45 text-white",
  };

  return map[status] || map["needs-work"];
}

function matchesReadinessFilter(post = {}, filter = "all") {
  if (filter === "all") return true;

  const readiness = getPostReadiness(post);
  if (filter === "rich-ready") return readiness.richReady;
  if (filter === "seo-ready") return readiness.score >= 72;
  if (filter === "sources") return readiness.hasSources;
  if (filter === "faq") return readiness.hasFaq;
  if (filter === "reviewed") return readiness.hasTrust;
  if (filter === "links") return readiness.hasLinks;
  if (filter === "quick") return Number(post.readTimeMinutes || 0) <= 3;
  if (filter === "fresh") {
    const freshness = getBlogFreshness(post).status;
    return freshness === "fresh" || freshness === "reviewed";
  }

  return true;
}

function sortPosts(posts, sortMode) {
  if (sortMode === "trending") {
    return [...posts].sort((a, b) => {
      const scoreDiff = getPopularityScore(b) - getPopularityScore(a);
      if (scoreDiff !== 0) return scoreDiff;
      return Date.parse(b.date || "") - Date.parse(a.date || "");
    });
  }

  if (sortMode === "quick") {
    return [...posts].sort((a, b) => a.readTimeMinutes - b.readTimeMinutes);
  }

  if (sortMode === "refresh") {
    return [...posts].sort((a, b) => {
      const freshnessDiff = getFreshnessWeight(b) - getFreshnessWeight(a);
      if (freshnessDiff !== 0) return freshnessDiff;
      return Date.parse(b.date || "") - Date.parse(a.date || "");
    });
  }

  if (sortMode === "category") {
    return [...posts].sort((a, b) => {
      const categoryCompare = String(a.category).localeCompare(String(b.category));
      if (categoryCompare !== 0) return categoryCompare;
      return Date.parse(b.date || "") - Date.parse(a.date || "");
    });
  }

  return [...posts].sort((a, b) => Date.parse(b.date || "") - Date.parse(a.date || ""));
}

function updateSearchParams(router, searchParams, updates) {
  const params = new URLSearchParams(searchParams.toString());

  Object.entries(updates).forEach(([key, value]) => {
    if (!value || value === "All" || value === "all" || value === "latest") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  });

  const query = params.toString();
  if (query === searchParams.toString()) return;
  router.replace(query ? `/blogs?${query}` : "/blogs", { scroll: false });
}

function CategoryTabs({ categories, counts, activeCategory, onChange }) {
  return (
    <div className="relative -mx-2 overflow-x-auto px-2 pb-1">
      <div className="flex min-w-max snap-x gap-1.5">
        {categories.map((category) => {
          const active = category === activeCategory;
          return (
            <button
              key={category}
              type="button"
              onClick={() => onChange(category)}
              aria-pressed={active}
              className={cx(
                "inline-flex h-8 shrink-0 snap-start items-center gap-1.5 rounded-[6px] border px-2.5 text-[11px] font-semibold transition",
                active
                  ? "border-(--primary) bg-(--primary) text-(--primary-foreground) shadow-[var(--anslation-ds-shadow-sm)]"
                  : "border-(--border) bg-(--card) text-(--muted-foreground) hover:border-(--primary) hover:text-(--foreground)"
              )}
            >
              <span>{category}</span>
              <span
                className={cx(
                  "rounded-full px-1.5 py-0.5 text-[9px]",
                  active ? "bg-white/15 text-(--primary-foreground)" : "bg-(--muted) text-(--muted-foreground)"
                )}
              >
                {counts[category] || 0}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TagChips({ tags, counts, activeTag, onChange }) {
  if (!tags.length) return null;

  return (
    <details className="group rounded-[6px] border border-(--border) bg-(--card)">
      <summary className="flex h-8 cursor-pointer list-none items-center justify-between gap-3 px-2.5 text-[11px] font-bold uppercase tracking-wide text-(--muted-foreground)">
        <span className="inline-flex items-center gap-1.5">
          <Hash className="h-3.5 w-3.5 text-(--primary)" />
          Tags
          {activeTag !== "All" ? (
            <span className="rounded-full bg-(--primary)/10 px-1.5 py-0.5 text-[9px] text-(--primary)">
              {activeTag}
            </span>
          ) : null}
        </span>
        <ChevronDown className="h-3.5 w-3.5 transition group-open:rotate-180" />
      </summary>
      <div className="relative overflow-x-auto border-t border-(--border) px-2.5 py-2">
      <div className="flex min-w-max snap-x items-center gap-1.5">
        <button
          type="button"
          onClick={() => onChange("All")}
          aria-pressed={activeTag === "All"}
          aria-label="Show all blog tags"
          className={cx(
            "inline-flex h-7 shrink-0 snap-start items-center gap-1.5 rounded-[6px] border px-2 text-[10px] font-semibold transition",
            activeTag === "All"
              ? "border-(--primary) bg-(--primary) text-(--primary-foreground)"
              : "border-(--border) bg-(--card) text-(--muted-foreground) hover:border-(--primary) hover:text-(--foreground)",
          )}
        >
          <Hash className="h-3 w-3" />
          All tags
        </button>
        {tags.map((tag) => {
          const active = tag === activeTag;
          return (
            <button
              key={tag}
              type="button"
              onClick={() => onChange(tag)}
              aria-pressed={active}
              aria-label={`Filter blogs by ${tag} tag`}
              className={cx(
                "inline-flex h-7 shrink-0 snap-start items-center gap-1.5 rounded-[6px] border px-2 text-[10px] font-semibold transition",
                active
                  ? "border-(--primary) bg-(--primary) text-(--primary-foreground)"
                  : "border-(--border) bg-(--card) text-(--muted-foreground) hover:border-(--primary) hover:text-(--foreground)",
              )}
            >
              <Hash className="h-3 w-3" />
              {tag}
              <span className={cx("rounded-full px-1.5 py-0.5 text-[10px]", active ? "bg-white/15" : "bg-(--muted)")}>
                {counts[tag] || 0}
              </span>
            </button>
          );
        })}
      </div>
      </div>
    </details>
  );
}

function SortSelect({ value, onChange }) {
  return (
    <label className="relative inline-flex h-9 w-full items-center rounded-[6px] border border-(--border) bg-(--card) px-2.5 text-xs font-semibold text-(--muted-foreground) lg:w-auto lg:min-w-[132px]">
      <SlidersHorizontal className="mr-2 h-3.5 w-3.5 text-(--primary)" />
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-full flex-1 appearance-none bg-transparent pr-5 text-(--foreground) outline-none"
        aria-label="Sort blogs"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-(--muted-foreground)" />
    </label>
  );
}

function FreshnessSelect({ value, onChange }) {
  return (
    <label className="relative inline-flex h-9 w-full items-center rounded-[6px] border border-(--border) bg-(--card) px-2.5 text-xs font-semibold text-(--muted-foreground) lg:w-auto lg:min-w-[154px]">
      <RefreshCw className="mr-2 h-3.5 w-3.5 text-(--primary)" />
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-full flex-1 appearance-none bg-transparent pr-5 text-(--foreground) outline-none"
        aria-label="Filter blogs by freshness"
      >
        {FRESHNESS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-(--muted-foreground)" />
    </label>
  );
}

function ReadinessSelect({ value, onChange }) {
  return (
    <label className="relative inline-flex h-9 w-full items-center rounded-[6px] border border-(--border) bg-(--card) px-2.5 text-xs font-semibold text-(--muted-foreground) lg:w-auto lg:min-w-[154px]">
      <Sparkles className="mr-2 h-3.5 w-3.5 text-(--primary)" />
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-full flex-1 appearance-none bg-transparent pr-5 text-(--foreground) outline-none"
        aria-label="Filter blogs by guide type"
      >
        {READINESS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-(--muted-foreground)" />
    </label>
  );
}

function SearchControl({ value, onChange, onClear, pending }) {
  return (
    <div className="relative min-w-0 flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--muted-foreground)" />
      <input
        aria-label="Search blog articles"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search title, author, tags, category, tools..."
        className="h-9 w-full rounded-[6px] border border-(--border) bg-(--card) px-9 text-sm text-(--foreground) outline-none transition placeholder:text-(--muted-foreground) focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/15"
      />
      {pending ? (
        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-(--primary)" />
      ) : value ? (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-2.5 top-1/2 inline-flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-(--muted-foreground) transition hover:bg-(--muted) hover:text-(--foreground)"
          aria-label="Clear blog search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}

function QuickSearchPills({ shortcuts, activeQuery, onPick }) {
  if (!shortcuts.length) return null;

  return (
    <div className="mt-2 -mx-2 flex snap-x items-center gap-1.5 overflow-x-auto px-2 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
      <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-(--muted-foreground)">
        Quick search
      </span>
      {shortcuts.map((shortcut) => {
        const active = activeQuery === shortcut.query.toLowerCase();

        return (
          <button
            key={shortcut.query}
            type="button"
            onClick={() => onPick(shortcut.query)}
            aria-pressed={active}
            className={cx(
              "inline-flex h-7 shrink-0 snap-start items-center rounded-[6px] border px-2 text-[10px] font-semibold transition",
              active
                ? "border-(--primary) bg-(--primary) text-(--primary-foreground)"
                : "border-(--border) bg-(--card) text-(--muted-foreground) hover:border-(--primary) hover:text-(--foreground)"
            )}
          >
            {shortcut.label}
          </button>
        );
      })}
    </div>
  );
}

function ActiveFilterChips({ filters, onReset }) {
  const activeFilters = filters.filter((filter) => filter.value);
  if (!activeFilters.length) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-(--border) pt-3">
      <span className="text-[11px] font-bold uppercase tracking-wide text-(--muted-foreground)">
        Active
      </span>
      {activeFilters.map((filter) => {
        const Icon = filter.icon;
        return (
          <button
            key={filter.key}
            type="button"
            onClick={filter.onClear}
            className="inline-flex h-8 max-w-full items-center gap-1.5 rounded-[6px] border border-(--primary)/30 bg-(--primary)/10 px-2.5 text-xs font-semibold text-(--foreground) transition hover:border-(--primary) hover:bg-(--primary) hover:text-(--primary-foreground)"
            aria-label={`Clear ${filter.label} filter`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{filter.label}: {filter.value}</span>
            <X className="h-3.5 w-3.5 shrink-0" />
          </button>
        );
      })}
      <button
        type="button"
        onClick={onReset}
        className="inline-flex h-8 items-center gap-1.5 rounded-[6px] border border-(--border) bg-(--card) px-2.5 text-xs font-semibold text-(--muted-foreground) transition hover:border-(--primary) hover:text-(--foreground)"
      >
        Clear all
      </button>
    </div>
  );
}

function ReaderJourneyPanel({ journeys }) {
  const visibleJourneys = journeys.filter((journey) => journey?.title);
  if (!visibleJourneys.length) return null;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {visibleJourneys.map((journey) => {
        const Icon = journey.icon;
        return (
          <button
            key={journey.key}
            type="button"
            onClick={journey.onClick}
            aria-pressed={journey.active}
            className={cx(
              "group flex min-h-[112px] items-start gap-3 rounded-[var(--anslation-ds-radius-lg)] border p-4 text-left shadow-[var(--anslation-ds-shadow-sm)] transition hover:-translate-y-0.5 hover:border-(--primary) hover:shadow-[var(--anslation-ds-shadow-md)]",
              journey.active
                ? "border-(--primary) bg-(--primary)/10"
                : "border-(--border) bg-(--card)",
            )}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--anslation-ds-radius)] bg-(--muted) text-(--primary)">
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-wide text-(--muted-foreground)">
                {journey.label}
              </span>
              <span className="mt-1 line-clamp-2 block text-sm font-semibold leading-snug text-(--foreground) group-hover:text-(--primary)">
                {journey.title}
              </span>
              <span className="mt-1 block text-xs font-medium text-(--muted-foreground)">
                {journey.meta}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ResultProgress({ displayedCount, filteredCount, loadedCount, totalCount, hasMore }) {
  const visibleTotal = Math.max(1, filteredCount || totalCount || loadedCount);
  const percent = Math.min(100, Math.round((displayedCount / visibleTotal) * 100));

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-wide text-(--muted-foreground)">
        <span>{displayedCount} visible</span>
        <span>{hasMore ? `${Math.max(0, visibleTotal - displayedCount)} more ready` : "Complete"}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-(--muted)">
        <div
          className="h-full rounded-full bg-(--primary) transition-[width] duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function ExplorerQualityStrip({ activeFilter, onPick }) {
  const items = [
    { key: "all", label: "All guides", icon: BookOpenCheck },
    { key: "rich-ready", label: "Deep", icon: Sparkles },
    { key: "sources", label: "Cited", icon: BookOpenCheck },
    { key: "faq", label: "FAQ", icon: MessageCircleQuestion },
    { key: "links", label: "Linked", icon: ArrowRight },
  ];

  return (
    <section className="flex flex-col gap-2 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) p-3 shadow-[var(--anslation-ds-shadow-sm)] sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-(--muted-foreground)">Content quality</p>
        <h2 className="mt-0.5 text-sm font-semibold text-(--foreground)">Pick the most complete guides first</h2>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = activeFilter === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onPick(active ? "all" : item.key)}
              aria-pressed={active}
              className={cx(
                "inline-flex h-8 items-center gap-1.5 rounded-[6px] border px-2.5 text-xs font-semibold transition",
                active
                  ? "border-(--primary) bg-(--primary) text-(--primary-foreground)"
                  : "border-(--border) bg-(--background) text-(--muted-foreground) hover:border-(--primary) hover:text-(--foreground)",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function BlogPostCard({ post, index, searchTerms = [] }) {
  const priority = index === 0;
  const tags = Array.isArray(post.tags) ? post.tags.filter(Boolean).slice(0, 3) : [];
  const freshness = getBlogFreshness(post);
  const readiness = getPostReadiness(post);
  const authorLabel = post.author || "AltFTool editors";

  return (
    <article className="interactive-card group h-full overflow-hidden transition duration-200 hover:border-(--primary)/45">
      <Link href={`/blogs/${post.slug}`} prefetch={false} className="flex h-full flex-col">
        <div className="relative aspect-[16/6] overflow-hidden bg-(--muted)">
          <Image
            src={post.image}
            alt={post.imageAlt || post.heading}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-[1.035]"
          />
          <div className="absolute left-3 top-3 rounded-[6px] border border-white/20 bg-black/45 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur">
            {post.category}
          </div>
          <div className={cx(
            "absolute right-3 top-3 rounded-[6px] border px-2 py-1 text-[10px] font-bold uppercase tracking-wide backdrop-blur",
            getFreshnessBadgeClass(freshness.status),
          )}>
            {freshness.label}
          </div>
          <div className={cx(
            "absolute bottom-3 left-3 rounded-[6px] border px-2 py-1 text-[10px] font-bold uppercase tracking-wide backdrop-blur",
            getReadinessBadgeClass(readiness.status),
          )}>
            {readiness.label}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2 p-3.5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium text-(--muted-foreground)">
            <span>{formatDate(post.date)}</span>
            <span className="h-1 w-1 rounded-full bg-(--border)" />
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-3 w-3" />
              {post.readTime}
            </span>
            <span className="hidden items-center gap-1 sm:inline-flex">
              <RefreshCw className="h-3 w-3" />
              {freshness.detail}
            </span>
          </div>

          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-(--foreground) transition group-hover:text-(--primary)">
            <HighlightedText text={post.heading} terms={searchTerms} />
          </h3>

          <p className="line-clamp-2 text-[13px] leading-5 text-(--muted-foreground)">
            <HighlightedText text={post.excerpt} terms={searchTerms} />
          </p>

          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex h-6 items-center rounded-[6px] border border-(--border) bg-(--background) px-2 text-[10px] font-semibold text-(--muted-foreground)"
                >
                  <HighlightedText text={tag} terms={searchTerms} />
                </span>
              ))}
            </div>
          ) : null}

          <div className="grid grid-cols-3 gap-1.5">
            <span
              className={cx(
                "inline-flex h-6 items-center justify-center gap-1 rounded-[6px] border px-1.5 text-[10px] font-semibold",
                readiness.hasSources
                  ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-500"
                  : "border-(--border) bg-(--background) text-(--muted-foreground)",
              )}
              title={readiness.hasSources ? `${readiness.sourceCount} cited source${readiness.sourceCount === 1 ? "" : "s"}` : "Practical guide"}
            >
              <BookOpenCheck className="h-3 w-3" />
              {readiness.hasSources ? "Cited" : "Guide"}
            </span>
            <span
              className={cx(
                "inline-flex h-6 items-center justify-center gap-1 rounded-[6px] border px-1.5 text-[10px] font-semibold",
                readiness.hasFaq
                  ? "border-blue-400/25 bg-blue-500/10 text-blue-500"
                  : "border-(--border) bg-(--background) text-(--muted-foreground)",
              )}
            >
              <MessageCircleQuestion className="h-3 w-3" />
              {readiness.hasFaq ? "FAQ" : "Summary"}
            </span>
            <span
              className={cx(
                "inline-flex h-6 items-center justify-center gap-1 rounded-[6px] border px-1.5 text-[10px] font-semibold",
                readiness.hasTrust
                  ? "border-violet-400/25 bg-violet-500/10 text-violet-500"
                  : "border-(--border) bg-(--background) text-(--muted-foreground)",
              )}
            >
              <ShieldCheck className="h-3 w-3" />
              {readiness.hasTrust ? "Reviewed" : "Editorial"}
            </span>
          </div>

          <div className="mt-auto flex items-center justify-between gap-3 pt-0.5">
            <span className="min-w-0">
              <span className="block truncate text-xs font-semibold text-(--foreground)">{authorLabel}</span>
              <span className="mt-0.5 block truncate text-[11px] font-medium text-(--muted-foreground)">
                {post.tool || `${readiness.score}% guide score`}
              </span>
            </span>
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--anslation-ds-radius)] border border-(--border) text-(--primary) transition group-hover:border-(--primary) group-hover:bg-(--primary) group-hover:text-(--primary-foreground)">
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

function EmptyState({ query, onReset }) {
  return (
    <div className="rounded-[var(--anslation-ds-radius-lg)] border border-dashed border-(--border) bg-(--card) px-5 py-12 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-[var(--anslation-ds-radius)] bg-(--muted) text-(--primary)">
        <Search className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold text-(--foreground)">No matching articles</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-(--muted-foreground)">
        Nothing matched {query ? `"${query}"` : "this filter"}. Try a broader keyword or reset the filters.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-5 inline-flex h-9 items-center justify-center rounded-[var(--anslation-ds-radius)] bg-(--primary) px-4 text-sm font-semibold text-(--primary-foreground)"
      >
        Reset filters
      </button>
    </div>
  );
}

function withTimeout(promise, timeoutMs, fallbackValue) {
  return Promise.race([
    promise,
    new Promise((resolve) => {
      window.setTimeout(() => resolve(fallbackValue), timeoutMs);
    }),
  ]);
}

async function fetchRemoteBlogChunk(offset, signal) {
  const params = new URLSearchParams({
    offset: String(offset),
    limit: String(BLOG_REMOTE_LIMIT),
  });

  const response = await fetch(`/api/blogs?${params.toString()}`, {
    headers: { accept: "application/json" },
    signal,
  });

  if (!response.ok) throw new Error(`Blog chunk failed: ${response.status}`);
  return response.json();
}

function waitForIdle(delay = 120) {
  return new Promise((resolve) => {
    const schedule =
      window.requestIdleCallback ||
      ((callback) => window.setTimeout(callback, delay));
    schedule(resolve, { timeout: 1400 });
  });
}

export default function BlogExplorerClient({
  initialPosts,
  categories: initialCategories,
  initialRemoteOffset = 0,
  totalCount = initialPosts.length,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sentinelRef = useRef(null);

  const urlQuery = searchParams.get("q") || "";
  const urlCategory = searchParams.get("category") || "All";
  const urlTag = searchParams.get("tag") || "All";
  const urlSort = searchParams.get("sort") || "latest";
  const urlFreshness = searchParams.get("freshness") || "all";
  const urlReadiness = searchParams.get("readiness") || "all";

  const [posts, setPosts] = useState(() => initialPosts.map((post, index) => normalizeBlog(post, index)));
  const [query, setQuery] = useState(urlQuery);
  const [activeCategory, setActiveCategory] = useState(urlCategory);
  const [activeTag, setActiveTag] = useState(urlTag);
  const [sortMode, setSortMode] = useState(urlSort);
  const [freshnessFilter, setFreshnessFilter] = useState(urlFreshness);
  const [readinessFilter, setReadinessFilter] = useState(urlReadiness);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [syncState, setSyncState] = useState("idle");
  const [remoteOffset, setRemoteOffset] = useState(initialRemoteOffset);
  const [remoteHasMore, setRemoteHasMore] = useState(totalCount > initialRemoteOffset);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  useEffect(() => {
    if (initialRemoteOffset > 0) {
      setSyncState("fresh");
      return undefined;
    }

    let cancelled = false;
    const controller = new AbortController();
    const schedule = window.requestIdleCallback || ((callback) => window.setTimeout(callback, 450));
    const cancel = window.cancelIdleCallback || window.clearTimeout;

    const handle = schedule(async () => {
      setSyncState("syncing");
      try {
        let nextOffset = initialRemoteOffset;
        let hasMore = totalCount > nextOffset;
        let receivedAny = nextOffset > 0;

        let syncedPages = 0;

        while (!cancelled && hasMore && syncedPages < BACKGROUND_SYNC_PAGE_LIMIT) {
          const isFirstRemotePage = nextOffset === 0;
          const page = await withTimeout(fetchRemoteBlogChunk(nextOffset, controller.signal), 12000, {
            posts: [],
            nextOffset,
            hasMore: false,
          });

          if (cancelled) return;
          if (!page.posts?.length) {
            hasMore = false;
            break;
          }

          receivedAny = true;
          setPosts((currentPosts) =>
            isFirstRemotePage
              ? mergeBlogPosts(currentPosts, page.posts)
              : mergeBlogPosts(currentPosts, page.posts)
          );
          nextOffset = page.nextOffset;
          hasMore = Boolean(page.hasMore);
          syncedPages += 1;
          setRemoteOffset(nextOffset);
          setRemoteHasMore(hasMore);
          setSyncState("fresh");

          await waitForIdle();
        }

        if (!cancelled) {
          setRemoteHasMore(hasMore);
          setSyncState(receivedAny ? "fresh" : "local");
        }
      } catch (error) {
        if (cancelled || error?.name === "AbortError") return;
        if (!cancelled) {
          setSyncState("local");
        }
      }
    });

    return () => {
      cancelled = true;
      controller.abort();
      cancel(handle);
    };
  }, [initialRemoteOffset, totalCount]);

  const categories = useMemo(() => {
    const fromPosts = Array.from(new Set(posts.map((post) => post.category).filter(Boolean)));
    return ["All", ...new Set([...initialCategories.filter((category) => category !== "All"), ...fromPosts])];
  }, [initialCategories, posts]);

  const counts = useMemo(() => getCategoryCounts(posts), [posts]);
  const tagCounts = useMemo(() => getTagCounts(posts), [posts]);
  const freshnessCounts = useMemo(() => {
    return posts.reduce((acc, post) => {
      const status = getBlogFreshness(post).status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
  }, [posts]);
  const topTags = useMemo(() => {
    const tags = Object.keys(tagCounts)
      .sort((a, b) => {
        const countDiff = tagCounts[b] - tagCounts[a];
        return countDiff || a.localeCompare(b);
      })
      .slice(0, 18);

    return activeTag !== "All" && !tags.includes(activeTag)
      ? [activeTag, ...tags]
      : tags;
  }, [activeTag, tagCounts]);

  const quickSearches = useMemo(() => {
    const tagShortcuts = Object.keys(tagCounts)
      .sort((a, b) => {
        const countDiff = tagCounts[b] - tagCounts[a];
        return countDiff || a.localeCompare(b);
      })
      .slice(0, 4)
      .map((tag) => ({ label: tag, query: tag }));

    const defaultShortcuts = DEFAULT_SEARCH_SHORTCUTS.map((query) => ({
      label: query.replace(/\b\w/g, (char) => char.toUpperCase()),
      query,
    }));

    return [...tagShortcuts, ...defaultShortcuts].reduce((acc, item) => {
      const key = item.query.toLowerCase();
      if (!acc.some((existing) => existing.query.toLowerCase() === key)) {
        acc.push(item);
      }
      return acc;
    }, []).slice(0, 8);
  }, [tagCounts]);

  const readerJourneyData = useMemo(() => {
    const topCategory = Object.entries(counts)
      .filter(([category]) => category && category !== "All")
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];
    const topTag = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];
    const quickCount = posts.filter((post) => Number(post.readTimeMinutes || 0) <= 3).length;

    return {
      quickCount,
      staleCount: freshnessCounts.stale || 0,
      topCategoryName: topCategory?.[0],
      topCategoryCount: topCategory?.[1] || 0,
      topTagName: topTag?.[0],
      topTagCount: topTag?.[1] || 0,
    };
  }, [counts, freshnessCounts.stale, posts, tagCounts]);

  const filteredPosts = useMemo(() => {
    const categoryFiltered = activeCategory === "All"
      ? posts
      : posts.filter((post) => post.category === activeCategory);

    const tagFiltered = activeTag === "All"
      ? categoryFiltered
      : categoryFiltered.filter((post) =>
          (Array.isArray(post.tags) ? post.tags : []).includes(activeTag)
        );

    const queryFiltered = deferredQuery
      ? tagFiltered.filter((post) => post.searchText.includes(deferredQuery))
      : tagFiltered;

    const freshnessFiltered = freshnessFilter === "all"
      ? queryFiltered
      : queryFiltered.filter((post) => getBlogFreshness(post).status === freshnessFilter);

    const readinessFiltered = readinessFilter === "all"
      ? freshnessFiltered
      : freshnessFiltered.filter((post) => matchesReadinessFilter(post, readinessFilter));

    return sortPosts(readinessFiltered, sortMode);
  }, [activeCategory, activeTag, deferredQuery, freshnessFilter, posts, readinessFilter, sortMode]);

  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const searchTerms = useMemo(() => getSearchTerms(deferredQuery), [deferredQuery]);
  const loadedCount = posts.length;
  const hasMore = visibleCount < filteredPosts.length || remoteHasMore;
  const displayedCount = visiblePosts.length;
  const remainingCount = visibleCount < filteredPosts.length
    ? Math.max(0, filteredPosts.length - displayedCount)
    : Math.max(0, totalCount - loadedCount);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      updateSearchParams(router, searchParams, {
        q: query.trim(),
        category: activeCategory,
        freshness: freshnessFilter,
        readiness: readinessFilter,
        tag: activeTag,
        sort: sortMode,
      });
    }, 180);

    return () => window.clearTimeout(timeout);
  }, [activeCategory, activeTag, freshnessFilter, query, readinessFilter, router, searchParams, sortMode]);

  const loadNextRemoteChunk = useCallback(async () => {
    if (!remoteHasMore || remoteLoading) return;

    setRemoteLoading(true);
    setSyncState("syncing");

    try {
      const page = await fetchRemoteBlogChunk(remoteOffset);
      if (!page.posts?.length) {
        setRemoteHasMore(false);
        setSyncState("fresh");
        return;
      }

      setPosts((currentPosts) =>
        remoteOffset === 0
          ? mergeBlogPosts(currentPosts, page.posts)
          : mergeBlogPosts(currentPosts, page.posts)
      );
      setVisibleCount((current) => current + BLOG_CHUNK_SIZE);
      setRemoteOffset(page.nextOffset);
      setRemoteHasMore(Boolean(page.hasMore));
      setSyncState("fresh");
    } catch {
      setSyncState("local");
    } finally {
      setRemoteLoading(false);
    }
  }, [remoteHasMore, remoteLoading, remoteOffset]);

  const loadNextChunk = useCallback(() => {
    if (visibleCount < filteredPosts.length) {
      setVisibleCount((current) => Math.min(current + BLOG_CHUNK_SIZE, filteredPosts.length));
      return;
    }

    loadNextRemoteChunk();
  }, [filteredPosts.length, loadNextRemoteChunk, visibleCount]);

  const loadAllPosts = useCallback(() => {
    setVisibleCount(filteredPosts.length);
  }, [filteredPosts.length]);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadNextChunk();
      },
      { rootMargin: "520px 0px" }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadNextChunk]);

  const handleCategoryChange = (category) => {
    startTransition(() => {
      setActiveCategory(category);
      setVisibleCount(INITIAL_VISIBLE_COUNT);
      updateSearchParams(router, searchParams, {
        q: query.trim(),
        category,
        freshness: freshnessFilter,
        readiness: readinessFilter,
        tag: activeTag,
        sort: sortMode,
      });
    });
  };

  const handleTagChange = (tag) => {
    startTransition(() => {
      setActiveTag(tag);
      setVisibleCount(INITIAL_VISIBLE_COUNT);
      updateSearchParams(router, searchParams, {
        q: query.trim(),
        category: activeCategory,
        freshness: freshnessFilter,
        readiness: readinessFilter,
        tag,
        sort: sortMode,
      });
    });
  };

  const handleSortChange = (value) => {
    startTransition(() => {
      setSortMode(value);
      setVisibleCount(INITIAL_VISIBLE_COUNT);
      updateSearchParams(router, searchParams, {
        q: query.trim(),
        category: activeCategory,
        freshness: freshnessFilter,
        readiness: readinessFilter,
        tag: activeTag,
        sort: value,
      });
    });
  };

  const handleFreshnessChange = (value) => {
    startTransition(() => {
      setFreshnessFilter(value);
      setVisibleCount(INITIAL_VISIBLE_COUNT);
      updateSearchParams(router, searchParams, {
        q: query.trim(),
        category: activeCategory,
        freshness: value,
        readiness: readinessFilter,
        tag: activeTag,
        sort: sortMode,
      });
    });
  };

  const handleReadinessChange = (value) => {
    startTransition(() => {
      setReadinessFilter(value);
      setVisibleCount(INITIAL_VISIBLE_COUNT);
      updateSearchParams(router, searchParams, {
        q: query.trim(),
        category: activeCategory,
        freshness: freshnessFilter,
        readiness: value,
        tag: activeTag,
        sort: sortMode,
      });
    });
  };

  const handleQueryChange = (value) => {
    setQuery(value);
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  };

  const handleQuickSearch = (value) => {
    startTransition(() => {
      setQuery(value);
      setActiveTag("All");
      setVisibleCount(INITIAL_VISIBLE_COUNT);
      updateSearchParams(router, searchParams, {
        q: value,
        category: activeCategory,
        freshness: freshnessFilter,
        readiness: readinessFilter,
        tag: "All",
        sort: sortMode,
      });
    });
  };

  const clearQuery = () => {
    setQuery("");
    setVisibleCount(INITIAL_VISIBLE_COUNT);
    updateSearchParams(router, searchParams, {
      q: "",
      category: activeCategory,
      freshness: freshnessFilter,
      readiness: readinessFilter,
      tag: activeTag,
      sort: sortMode,
    });
  };

  const resetFilters = () => {
    setQuery("");
    setActiveCategory("All");
    setActiveTag("All");
    setFreshnessFilter("all");
    setReadinessFilter("all");
    setSortMode("latest");
    setVisibleCount(INITIAL_VISIBLE_COUNT);
    updateSearchParams(router, searchParams, {
      q: "",
      category: "All",
      freshness: "all",
      readiness: "all",
      tag: "All",
      sort: "latest",
    });
  };

  const syncLabel = syncState === "fresh"
    ? "Live catalog ready"
    : syncState === "syncing"
      ? "Refreshing articles"
      : "Curated catalog";

  const activeFilterCount = [
    query.trim(),
    activeCategory !== "All" ? activeCategory : "",
    activeTag !== "All" ? activeTag : "",
    freshnessFilter !== "all" ? freshnessFilter : "",
    readinessFilter !== "all" ? readinessFilter : "",
    sortMode !== "latest" ? sortMode : "",
  ].filter(Boolean).length;
  const activeFilterChips = [
    {
      key: "query",
      label: "Search",
      value: query.trim() ? `${getSearchTerms(query).length || 1} term${getSearchTerms(query).length === 1 ? "" : "s"}` : "",
      icon: Search,
      onClear: clearQuery,
    },
    {
      key: "category",
      label: "Category",
      value: activeCategory !== "All" ? activeCategory : "",
      icon: BookOpenCheck,
      onClear: () => handleCategoryChange("All"),
    },
    {
      key: "tag",
      label: "Tag",
      value: activeTag !== "All" ? activeTag : "",
      icon: Hash,
      onClear: () => handleTagChange("All"),
    },
    {
      key: "freshness",
      label: "Freshness",
      value: freshnessFilter !== "all"
        ? FRESHNESS_OPTIONS.find((option) => option.value === freshnessFilter)?.label || freshnessFilter
        : "",
      icon: RefreshCw,
      onClear: () => handleFreshnessChange("all"),
    },
    {
      key: "readiness",
      label: "Type",
      value: readinessFilter !== "all"
        ? READINESS_OPTIONS.find((option) => option.value === readinessFilter)?.label || readinessFilter
        : "",
      icon: Sparkles,
      onClear: () => handleReadinessChange("all"),
    },
    {
      key: "sort",
      label: "Sort",
      value: sortMode !== "latest"
        ? SORT_OPTIONS.find((option) => option.value === sortMode)?.label || sortMode
        : "",
      icon: SlidersHorizontal,
      onClear: () => handleSortChange("latest"),
    },
  ];

  return (
    <section id="blog-explorer" className="mt-8 space-y-5 sm:mt-10">
      <div className="filter-surface p-3">
        <div className="mb-2 flex items-center justify-between gap-3 border-b border-(--border) pb-2 lg:hidden">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-(--muted-foreground)">
              Find guides
            </p>
            <p className="mt-0.5 text-xs font-medium text-(--muted-foreground)">
              {filteredPosts.length} matches{activeFilterCount ? ` · ${activeFilterCount} active` : ""}
            </p>
          </div>
          {activeFilterCount ? (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex h-8 items-center gap-1.5 rounded-[6px] border border-(--border) bg-(--card) px-2.5 text-xs font-semibold text-(--foreground)"
            >
              <X className="h-3.5 w-3.5" />
              Reset
            </button>
          ) : null}
        </div>
        <div className="grid gap-2 lg:grid-cols-[minmax(260px,1fr)_auto_auto_auto] lg:items-center">
          <SearchControl
            value={query}
            onChange={handleQueryChange}
            onClear={clearQuery}
            pending={isPending}
          />
          <SortSelect value={sortMode} onChange={handleSortChange} />
          <FreshnessSelect value={freshnessFilter} onChange={handleFreshnessChange} />
          <ReadinessSelect value={readinessFilter} onChange={handleReadinessChange} />
        </div>
        <QuickSearchPills
          shortcuts={quickSearches}
          activeQuery={deferredQuery}
          onPick={handleQuickSearch}
        />
        <div className="mt-2 grid gap-1.5 border-t border-(--border) pt-2 lg:grid-cols-[minmax(0,1fr)_190px] lg:items-start">
          <CategoryTabs
            categories={categories}
            counts={counts}
            activeCategory={activeCategory}
            onChange={handleCategoryChange}
          />
          <TagChips
            tags={topTags}
            counts={tagCounts}
            activeTag={activeTag}
            onChange={handleTagChange}
          />
        </div>
        <ActiveFilterChips filters={activeFilterChips} onReset={resetFilters} />
      </div>

      <ReaderJourneyPanel
        journeys={[
          {
            key: "top-category",
            label: "Popular path",
            title: readerJourneyData.topCategoryName,
            meta: `${readerJourneyData.topCategoryCount} guides in this lane`,
            icon: TrendingUp,
            active: activeCategory === readerJourneyData.topCategoryName,
            onClick: () => readerJourneyData.topCategoryName && handleCategoryChange(readerJourneyData.topCategoryName),
          },
          {
            key: "quick",
            label: "Fast reading",
            title: "Under 3 minute guides",
            meta: `${readerJourneyData.quickCount} quick reads available`,
            icon: Clock3,
            active: sortMode === "quick",
            onClick: () => handleSortChange("quick"),
          },
          {
            key: "top-tag",
            label: "Topic cluster",
            title: readerJourneyData.topTagName,
            meta: `${readerJourneyData.topTagCount} tagged articles`,
            icon: Hash,
            active: activeTag === readerJourneyData.topTagName,
            onClick: () => readerJourneyData.topTagName && handleTagChange(readerJourneyData.topTagName),
          },
          {
            key: "refresh",
            label: "Freshness queue",
            title: readerJourneyData.staleCount ? "Needs refresh" : "Fresh guides",
            meta: readerJourneyData.staleCount
              ? `${readerJourneyData.staleCount} posts to review`
              : "No stale posts in loaded catalog",
            icon: RefreshCw,
            active: freshnessFilter === (readerJourneyData.staleCount ? "stale" : "fresh"),
            onClick: () => handleFreshnessChange(readerJourneyData.staleCount ? "stale" : "fresh"),
          },
        ]}
      />

      <ExplorerQualityStrip
        activeFilter={readinessFilter}
        onPick={handleReadinessChange}
      />

      <div className="surface-panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-normal text-(--muted-foreground)">Article library</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-(--foreground)">
            {filteredPosts.length} curated reads
          </h2>
          {filteredPosts.length > 0 && (
            <p className="mt-1 text-xs font-medium text-(--muted-foreground)">
              Showing {displayedCount} of {filteredPosts.length}
              {activeFilterCount ? ` · ${activeFilterCount} active filter${activeFilterCount === 1 ? "" : "s"}` : ""}
              {remoteHasMore && totalCount > loadedCount
                ? ` · loaded ${loadedCount} of ${totalCount}`
                : ""}
            </p>
          )}
          {filteredPosts.length > 0 ? (
            <ResultProgress
              displayedCount={displayedCount}
              filteredCount={filteredPosts.length}
              loadedCount={loadedCount}
              totalCount={totalCount}
              hasMore={hasMore}
            />
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-(--muted-foreground)">
          {sortMode === "trending" ? (
            <span className="inline-flex h-7 items-center gap-1.5 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) px-2.5">
              <TrendingUp className="h-3.5 w-3.5 text-(--primary)" />
              Trending first
            </span>
          ) : null}
          {activeTag !== "All" ? (
            <span className="inline-flex h-7 items-center gap-1.5 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) px-2.5">
              <Hash className="h-3.5 w-3.5 text-(--primary)" />
              {activeTag}
            </span>
          ) : null}
          {freshnessFilter !== "all" ? (
            <span className="inline-flex h-7 items-center gap-1.5 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) px-2.5">
              <RefreshCw className="h-3.5 w-3.5 text-(--primary)" />
              {FRESHNESS_OPTIONS.find((option) => option.value === freshnessFilter)?.label || "Freshness"}
            </span>
          ) : null}
          {readinessFilter !== "all" ? (
            <span className="inline-flex h-7 items-center gap-1.5 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) px-2.5">
              <Sparkles className="h-3.5 w-3.5 text-(--primary)" />
              {READINESS_OPTIONS.find((option) => option.value === readinessFilter)?.label || "Guide type"}
            </span>
          ) : null}
          <span className="inline-flex h-7 items-center gap-1.5 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) px-2.5">
            {syncState === "syncing" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-(--primary)" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5 text-(--primary)" />
            )}
            {syncLabel}
          </span>
          <span className="inline-flex h-7 items-center gap-1.5 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) px-2.5">
            <Sparkles className="h-3.5 w-3.5 text-(--primary)" />
            Fresh picks
          </span>
          {(query ||
            activeCategory !== "All" ||
            activeTag !== "All" ||
            freshnessFilter !== "all" ||
            readinessFilter !== "all" ||
            sortMode !== "latest") && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex h-7 items-center gap-1.5 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) px-2.5 text-xs font-semibold text-(--foreground) transition hover:border-(--primary) hover:text-(--primary)"
            >
              <X className="h-3.5 w-3.5" />
              Reset
            </button>
          )}
          {hasMore && (
            <button
              type="button"
              onClick={visibleCount < filteredPosts.length ? loadAllPosts : loadNextRemoteChunk}
              disabled={remoteLoading}
              className="inline-flex h-7 items-center rounded-[var(--anslation-ds-radius)] border border-(--primary)/35 bg-(--primary)/10 px-2.5 text-xs font-semibold text-(--primary) transition hover:bg-(--primary) hover:text-(--primary-foreground)"
            >
              {visibleCount < filteredPosts.length ? "Show loaded" : remoteLoading ? "Loading" : "Sync more"}
            </button>
          )}
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <EmptyState query={query} onReset={resetFilters} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visiblePosts.map((post, index) => (
              <BlogPostCard
                key={post.slug}
                post={post}
                index={index}
                searchTerms={searchTerms}
              />
            ))}
          </div>

          <div ref={sentinelRef} className="flex min-h-16 items-center justify-center py-6">
            {hasMore ? (
              <button
                type="button"
                onClick={loadNextChunk}
                disabled={remoteLoading}
                className="inline-flex h-10 items-center gap-2 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) px-4 text-sm font-semibold text-(--foreground) shadow-[var(--anslation-ds-shadow-sm)] transition hover:border-(--primary) hover:text-(--primary)"
              >
                {remoteLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading more articles
                  </>
                ) : (
                  <>
                    Load next {Math.min(BLOG_CHUNK_SIZE, remainingCount || BLOG_CHUNK_SIZE)} articles
                    <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </button>
            ) : (
              <span className="text-xs font-medium text-(--muted-foreground)">
                All visible articles loaded
              </span>
            )}
          </div>
        </>
      )}
    </section>
  );
}
