"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  ChevronDown,
  Loader2,
  Search,
  Sparkles,
  Layers3,
  X,
  Clock,
  RefreshCw,
  User,
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
import AutoScrollSlider from "./AutoScrollSlider";
import {
  BLOG_CHUNK_SIZE,
  BLOG_REMOTE_LIMIT,
  blogTaxonomySlug,
  mergeBlogPosts,
  normalizeBlog,
} from "../data";

function getRelativeTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.max(0, now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffYears > 0) return `Updated ${diffYears} year${diffYears > 1 ? "s" : ""} ago`;
  if (diffMonths > 0) return `Updated ${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
  if (diffDays > 0) return `Updated ${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return "Updated recently";
}

const INITIAL_VISIBLE_COUNT = 24;
const BACKGROUND_SYNC_PAGE_LIMIT = 1;
const SORT_OPTIONS = [
  { value: "latest", label: "Latest First" },
  { value: "trending", label: "Trending" },
];

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
  // Counts are keyed by taxonomy slug so lookups stay case-insensitive
  // ("Tools" tab still counts legacy posts stored as "tools").
  return posts.reduce((acc, post) => {
    acc.all = (acc.all || 0) + 1;
    const key = blogTaxonomySlug(post.category);
    if (key) acc[key] = (acc[key] || 0) + 1;
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

function sortPosts(posts, sortMode) {
  if (sortMode === "trending") {
    return [...posts].sort((a, b) => {
      const scoreDiff = getPopularityScore(b) - getPopularityScore(a);
      if (scoreDiff !== 0) return scoreDiff;
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
    <div className="flex flex-wrap items-center gap-2">
      {categories.map((category) => {
        const active = category === activeCategory;
        const count = counts ? (counts[blogTaxonomySlug(category)] || 0) : 0;
        return (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            aria-pressed={active}
            className={cx(
              "inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition-all duration-200",
              active
                ? "border-(--primary) bg-(--primary) text-(--primary-foreground) shadow-sm"
                : "border-(--border) bg-(--card) text-(--foreground) hover:border-(--anslation-ds-border-strong) hover:bg-(--anslation-ds-soft)"
            )}
          >
            {category}
            <span
              className={cx(
                "inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none",
                active
                  ? "bg-white/20 text-(--primary-foreground)"
                  : "bg-(--muted) text-(--muted-foreground)"
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function SortSelect({ value, onChange }) {
  return (
    <div className="relative inline-flex items-center text-sm font-semibold text-(--muted-foreground)">
      <span className="mr-2 hidden sm:inline">Sort by:</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 appearance-none bg-transparent pr-6 text-(--foreground) outline-none font-bold cursor-pointer"
        aria-label="Sort blogs"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-0 h-4 w-4 text-(--foreground)" />
    </div>
  );
}

function SearchControl({ value, onChange, onClear, pending }) {
  return (
    <div className="relative min-w-[240px] max-w-sm flex-1">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-(--muted-foreground)" />
      <input
        aria-label="Search blog articles"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search articles..."
        className="h-11 w-full rounded-lg border border-(--border) bg-(--card) px-10 text-sm font-medium text-(--foreground) shadow-sm outline-none transition placeholder:text-(--muted-foreground) focus:border-(--primary) focus:ring-1 focus:ring-(--primary)"
      />
      {pending ? (
        <Loader2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-(--primary)" />
      ) : value ? (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-2.5 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-(--muted-foreground) transition hover:bg-(--muted) hover:text-(--foreground)"
          aria-label="Clear blog search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}

function StatCard({ value, label }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-(--border) bg-(--card) px-6 py-2 shadow-sm min-w-[100px]">
      <span className="text-xl font-bold text-(--foreground)">{value}</span>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-(--muted-foreground)">{label}</span>
    </div>
  );
}

function HeroArticle({ post }) {
  if (!post) return null;

  return (
    <Link
      href={`/blogs/${post.slug}`}
      prefetch={false}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-(--border) shadow-sm h-full w-full min-h-[460px] lg:min-h-0"
    >
      <Image
        src={post.image}
        alt={post.imageAlt || post.heading}
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 75vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

      <div className="absolute left-6 top-6 inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white border border-white/20 shadow-sm">
        <Sparkles className="h-3.5 w-3.5 text-(--primary)" />
        TRENDING NOW
      </div>

      <div className="absolute inset-0 p-6 md:p-8 lg:p-10 flex flex-col justify-end items-start w-full md:w-[85%] lg:w-[75%]">
        <div className="flex flex-wrap items-center gap-3 mb-4 text-xs font-semibold text-white/90">
          <span className="inline-flex items-center justify-center rounded bg-(--primary) px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-(--primary-foreground)">
            {post.category || "TOOLS"}
          </span>
          <span>{post.date || 'Mar 4, 2026'}</span>
          <span className="h-1 w-1 rounded-full bg-white/50" />
          <span>{post.readTime || '2 min read'}</span>
        </div>

        <h2 className="mb-3 text-3xl font-bold leading-[1.15] text-white sm:text-4xl lg:text-[40px] transition-colors group-hover:text-teal-50">
          {post.heading}
        </h2>

        {post.excerpt ? (
          <p className="mb-6 line-clamp-2 text-sm leading-relaxed text-white/80 sm:text-base max-w-2xl">
            {post.excerpt}
          </p>
        ) : null}

        <div className="inline-flex items-center gap-3 text-[13px] font-bold text-white transition-colors">
          Read featured guide
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-(--primary) group-hover:bg-(--primary-hover) transition-colors text-(--primary-foreground) shadow-sm">
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function BlogPostCard({ post, searchTerms = [] }) {
  return (
    <Link href={`/blogs/${post.slug}`} prefetch={false} className="group relative flex overflow-hidden rounded-2xl border border-(--border) bg-(--card) shadow-sm transition-all duration-300 hover:shadow-[var(--anslation-ds-shadow-md)] hover:border-(--anslation-ds-border-strong) h-full">
      {/* Vertical Category Strip */}
      <div className="w-10 shrink-0 border-r border-(--border) bg-(--anslation-ds-soft) flex items-center justify-center relative">
        <div className="-rotate-90 whitespace-nowrap text-[10px] font-bold uppercase tracking-widest text-(--muted-foreground)">
          {post.category}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-(--muted) mb-4">
          <Image
            src={post.image}
            alt={post.imageAlt || post.heading}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-[1.035]"
          />
        </div>

        <h3 className="line-clamp-2 text-lg font-bold leading-snug text-(--foreground) transition group-hover:text-(--primary) mb-2">
          <HighlightedText text={post.heading} terms={searchTerms} />
        </h3>

        <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold text-(--muted-foreground)">
          <span>{post.date}</span>

          {post.readTime && (
            <>
              <span className="h-1 w-1 rounded-full bg-(--border)" />
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {post.readTime}
              </span>
            </>
          )}

          {post.updatedAt && post.updatedAt !== post.date && (
            <>
              <span className="h-1 w-1 rounded-full bg-(--border)" />
              <span className="flex items-center gap-1">
                <RefreshCw className="h-3 w-3" />
                {getRelativeTime(post.updatedAt)}
              </span>
            </>
          )}
        </div>

        <p className="line-clamp-3 text-sm leading-relaxed text-(--muted-foreground) mb-4 flex-1">
          <HighlightedText text={post.excerpt} terms={searchTerms} />
        </p>

        <div className="mt-auto flex items-center justify-between text-sm font-bold">
          {post.author && (
            <span className="text-(--muted-foreground) flex items-center gap-1">
              <User className="h-3 w-3" />
              {post.author}
            </span>
          )}
          <span className="inline-flex items-center gap-2 text-(--primary) ml-auto">
            Read More
            <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function CompactArticle({ post }) {
  return (
    <Link href={`/blogs/${post.slug}`} className="group flex gap-4 transition-all duration-200 ease-out">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-(--anslation-ds-soft)">
        <Image
          src={post.image}
          alt={post.imageAlt || post.heading}
          fill
          sizes="64px"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
        />
      </div>
      <div className="min-w-0 flex-1 flex flex-col justify-center">
        <div className="text-[10px] font-bold uppercase tracking-widest text-(--primary) mb-1">
          {post.category}
        </div>
        <h4 className="line-clamp-2 text-sm font-bold leading-tight text-(--foreground) transition-colors group-hover:text-(--primary)">
          {post.heading}
        </h4>
        <p className="mt-1 text-xs font-medium text-(--muted-foreground)">{post.readTime}</p>
      </div>
    </Link>
  );
}

function TrendingRail({ posts }) {
  if (!posts?.length) return null;
  return (
    <div className="rounded-2xl border border-(--border) bg-(--card) p-5 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-5 shrink-0">
        <h3 className="text-sm font-bold uppercase tracking-wider text-(--foreground)">Trending Now</h3>
        <Link href="/blogs?sort=trending" className="text-xs font-bold text-(--primary) hover:underline">
          View all
        </Link>
      </div>
      <div className="flex flex-col gap-5 flex-1 justify-between">
        {posts.map((post) => (
          <CompactArticle key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}

function CategoriesWidget({ categories, counts, activeCategory, onChangeCategory }) {
  return (
    <div className="rounded-2xl border border-(--border) bg-(--card) p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-(--foreground)">Categories</h3>
      </div>
      <div className="flex flex-col">
        {categories.map((cat, idx) => {
          const isActive = cat === activeCategory;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onChangeCategory(cat)}
              className={cx(
                "flex items-center justify-between py-2 transition-colors group",
                idx !== categories.length - 1 ? "border-b border-(--border)" : "",
                isActive ? "text-(--primary)" : "text-(--foreground) hover:text-(--primary)"
              )}
            >
              <span className="flex items-center gap-2 text-sm font-semibold">
                <div className={cx(
                  "h-4 w-4 rounded-full border flex items-center justify-center transition-colors",
                  isActive ? "border-(--primary)" : "border-(--border) group-hover:border-(--primary)"
                )}>
                  {isActive && <div className="h-1.5 w-1.5 rounded-full bg-(--primary)"></div>}
                </div>
                {cat}
              </span>
              <span className={cx(
                "text-xs font-bold transition-colors",
                isActive ? "text-(--primary)" : "text-(--foreground) group-hover:text-(--primary)"
              )}>
                {counts[blogTaxonomySlug(cat)] || 0}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const QUICK_ACCESS_OPTIONS = [
  "Digital Tools",
  "Games",
  "Tools",
  "Fashion & Lifestyle",
  "Pdf",
  "Image",
  "Downloader",
  "Calculator"
];

function QuickAccessWidget({ activeQuery, onChangeQuery }) {
  return (
    <div className="rounded-2xl border border-(--border) bg-(--card) p-4 shadow-sm">
      <div className="mb-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-(--foreground)">Quick Access</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {QUICK_ACCESS_OPTIONS.map((option) => {
          const isActive = option.toLowerCase() === activeQuery.trim().toLowerCase();
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChangeQuery(isActive ? "" : option)}
              className={cx(
                "inline-flex h-8 items-center justify-center rounded-lg border px-3 text-xs font-semibold transition-colors",
                isActive
                  ? "border-(--primary) bg-(--primary) text-(--primary-foreground)"
                  : "border-(--border) bg-(--background) text-(--foreground) hover:border-(--primary) hover:text-(--primary)"
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NewsletterWidget() {
  return (
    <div className="rounded-2xl border border-(--border) bg-(--card) p-5 shadow-sm">
      <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-(--foreground)">Stay Updated</h3>
      <p className="mb-5 text-sm leading-relaxed text-(--muted-foreground)">
        Get new articles, tips & productivity insights straight to your inbox.
      </p>
      <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
        <input
          type="email"
          placeholder="Enter your email"
          className="h-11 w-full rounded-lg border border-(--border) bg-(--background) px-4 text-sm font-medium text-(--foreground) outline-none transition placeholder:text-(--muted-foreground) focus:border-(--primary) focus:ring-1 focus:ring-(--primary)"
        />
        <button
          type="submit"
          className="h-11 w-full rounded-lg bg-(--primary) px-4 text-sm font-bold text-(--primary-foreground) transition-colors hover:bg-(--primary-hover)"
        >
          Subscribe
        </button>
      </form>
      <p className="mt-3 text-xs text-(--muted-foreground)">
        No spam. Unsubscribe anytime.
      </p>
    </div>
  );
}

function EmptyState({ query, onReset }) {
  return (
    <div className="rounded-2xl border border-dashed border-(--border) bg-(--card) px-5 py-12 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-(--anslation-ds-soft) text-(--primary)">
        <Search className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-bold text-(--foreground)">No matching articles</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-(--muted-foreground)">
        Nothing matched {query ? `"${query}"` : "this filter"}. Try a broader keyword or reset the filters.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-(--primary) px-5 text-sm font-bold text-(--primary-foreground) transition hover:bg-(--primary-hover)"
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
  tags,
  initialRemoteOffset = 0,
  totalCount = initialPosts.length,
  stats,
  featuredPosts,
  trendingPosts,
  children,
  heroShortcutRail,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sentinelRef = useRef(null);

  const urlQuery = searchParams.get("q") || "";
  const urlCategory = searchParams.get("category") || "All";
  const urlSort = searchParams.get("sort") || "latest";

  const [posts, setPosts] = useState(() => initialPosts.map((post, index) => normalizeBlog(post, index)));
  const [query, setQuery] = useState(urlQuery);
  const [activeCategory, setActiveCategory] = useState(urlCategory);
  const [sortMode, setSortMode] = useState(urlSort);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [remoteOffset, setRemoteOffset] = useState(initialRemoteOffset);
  const [remoteHasMore, setRemoteHasMore] = useState(totalCount > initialRemoteOffset);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  useEffect(() => {
    if (initialRemoteOffset > 0) {
      return undefined;
    }

    let cancelled = false;
    const controller = new AbortController();
    const schedule = window.requestIdleCallback || ((callback) => window.setTimeout(callback, 450));
    const cancel = window.cancelIdleCallback || window.clearTimeout;

    const handle = schedule(async () => {
      try {
        let nextOffset = initialRemoteOffset;
        let hasMore = totalCount > nextOffset;

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

          await waitForIdle();
        }

        if (!cancelled) {
          setRemoteHasMore(hasMore);
        }
      } catch (error) {
        if (cancelled || error?.name === "AbortError") return;
      }
    });

    return () => {
      cancelled = true;
      controller.abort();
      cancel(handle);
    };
  }, [initialRemoteOffset, totalCount]);

  const counts = useMemo(() => getCategoryCounts(posts), [posts]);

  const filteredPosts = useMemo(() => {
    const activeCategorySlug = blogTaxonomySlug(activeCategory);
    let result = activeCategory === "All"
      ? posts
      : posts.filter((post) => blogTaxonomySlug(post.category) === activeCategorySlug);

    if (deferredQuery) {
      result = result.filter((post) => post.searchText?.includes(deferredQuery));
    }

    return sortPosts(result, sortMode);
  }, [activeCategory, deferredQuery, posts, sortMode]);

  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const searchTerms = useMemo(() => getSearchTerms(deferredQuery), [deferredQuery]);
  const hasMore = visibleCount < filteredPosts.length || remoteHasMore;

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      updateSearchParams(router, searchParams, {
        q: query.trim(),
        category: activeCategory,
        sort: sortMode,
      });
    }, 180);

    return () => window.clearTimeout(timeout);
  }, [activeCategory, query, router, searchParams, sortMode]);

  const loadNextRemoteChunk = useCallback(async () => {
    if (!remoteHasMore || remoteLoading) return;
    setRemoteLoading(true);

    try {
      const page = await fetchRemoteBlogChunk(remoteOffset);
      if (!page.posts?.length) {
        setRemoteHasMore(false);
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
        sort: value,
      });
    });
  };

  const handleQueryChange = (value) => {
    setQuery(value);
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  };

  const clearQuery = () => {
    setQuery("");
    setVisibleCount(INITIAL_VISIBLE_COUNT);
    updateSearchParams(router, searchParams, {
      q: "",
      category: activeCategory,
      sort: sortMode,
    });
  };

  const resetFilters = () => {
    setQuery("");
    setActiveCategory("All");
    setSortMode("latest");
    setVisibleCount(INITIAL_VISIBLE_COUNT);
    updateSearchParams(router, searchParams, {
      q: "",
      category: "All",
      sort: "latest",
    });
  };

  // We no longer hide sections based on category filtering to keep layout stable
  const showFeatured = true;

  const displayCategories = ["All", "Guides", "News", "Updates", "Tutorials"];

  return (
    <section id="blog-explorer" className="mt-8">
      {heroShortcutRail && <div className="mb-8 -mt-4">{heroShortcutRail}</div>}

      {/* Toolbar: Actions & Stats */}
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3">
          <Link
            href="#blog-explorer"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-(--primary) px-5 text-sm font-bold text-(--primary-foreground) transition hover:bg-(--primary-hover)"
          >
            Explore guides
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/blogs/topics"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-(--border) bg-(--card) px-5 text-sm font-bold text-(--foreground) transition hover:border-(--anslation-ds-border-strong) hover:bg-(--anslation-ds-soft)"
          >
            Topic clusters
            <Layers3 className="h-4 w-4" />
          </Link>
        </div>

        {stats && (
          <div className="flex gap-4 overflow-x-auto pb-2 sm:pb-0">
            <StatCard value={stats.posts || 31} label="Articles" />
            <StatCard value={stats.categories || 5} label="Categories" />
            <StatCard value={stats.tools || 31} label="Tools" />
          </div>
        )}
      </div>

      {/* Featured & Trending Row */}
      {featuredPosts?.length > 0 && (
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 min-w-0">
            <AutoScrollSlider className="pb-2 h-full">
              {trendingPosts.map((post) => (
                <div key={post.slug} className="w-full h-full shrink-0 snap-center">
                  <HeroArticle post={post} />
                </div>
              ))}
            </AutoScrollSlider>
          </div>
          <div className="lg:col-span-1">
            <TrendingRail posts={trendingPosts} />
          </div>
        </div>
      )}

      {children && <div className="mb-8">{children}</div>}

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column (Main Content - spans 3 cols) */}
        <div className="lg:col-span-3 flex flex-col gap-8">

          {filteredPosts.length === 0 ? (
            <EmptyState query={query} onReset={resetFilters} />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {visiblePosts.map((post) => (
                <BlogPostCard
                  key={post.slug}
                  post={post}
                  searchTerms={searchTerms}
                />
              ))}
            </div>
          )}

          <div ref={sentinelRef} className="flex min-h-16 items-center justify-center py-6">
            {hasMore ? (
              <button
                type="button"
                onClick={loadNextChunk}
                disabled={remoteLoading}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-(--border) bg-(--card) px-6 text-sm font-bold text-(--foreground) shadow-sm transition hover:border-(--primary) hover:text-(--primary)"
              >
                {remoteLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Load more articles
                    <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </button>
            ) : null}
          </div>
        </div>

        {/* Right Column (Sidebar - spans 1 col) */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 flex flex-col gap-4 pb-12">
            <CategoriesWidget 
              categories={initialCategories} 
              counts={counts}
              activeCategory={activeCategory}
              onChangeCategory={setActiveCategory}
            />
            <QuickAccessWidget
              activeQuery={query}
              onChangeQuery={(val) => {
                handleQueryChange(val);
                setActiveCategory("All");
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
