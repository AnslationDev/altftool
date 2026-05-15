"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Hash,
  Loader2,
  Search,
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
  mergeBlogPosts,
  normalizeBlog,
} from "../data";

const INITIAL_VISIBLE_COUNT = 36;
const SORT_OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "trending", label: "Trending" },
  { value: "quick", label: "Quick reads" },
  { value: "category", label: "Category" },
];

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
    if (!value || value === "All" || value === "latest") {
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
    <div className="relative -mx-3 overflow-x-auto px-3 pb-1">
      <div className="flex min-w-max gap-2">
        {categories.map((category) => {
          const active = category === activeCategory;
          return (
            <button
              key={category}
              type="button"
              onClick={() => onChange(category)}
              className={cx(
                "inline-flex h-9 items-center gap-2 rounded-[var(--anslation-ds-radius)] border px-3 text-xs font-semibold transition",
                active
                  ? "border-(--primary) bg-(--primary) text-(--primary-foreground) shadow-[var(--anslation-ds-shadow-sm)]"
                  : "border-(--border) bg-(--card) text-(--muted-foreground) hover:border-(--primary) hover:text-(--foreground)"
              )}
            >
              <span>{category}</span>
              <span
                className={cx(
                  "rounded-full px-1.5 py-0.5 text-[10px]",
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
    <div className="relative -mx-3 overflow-x-auto px-3 pb-1">
      <div className="flex min-w-max items-center gap-2">
        <button
          type="button"
          onClick={() => onChange("All")}
          className={cx(
            "inline-flex h-8 items-center gap-1.5 rounded-[6px] border px-2.5 text-[11px] font-semibold transition",
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
              className={cx(
                "inline-flex h-8 items-center gap-1.5 rounded-[6px] border px-2.5 text-[11px] font-semibold transition",
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
  );
}

function SortSelect({ value, onChange }) {
  return (
    <label className="relative inline-flex h-10 min-w-[142px] items-center rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) px-3 text-xs font-semibold text-(--muted-foreground)">
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

function SearchControl({ value, onChange, onClear, pending }) {
  return (
    <div className="relative min-w-0 flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--muted-foreground)" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search title, tags, category, tools..."
        className="h-10 w-full rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) px-9 text-sm text-(--foreground) outline-none transition placeholder:text-(--muted-foreground) focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/15"
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

function BlogPostCard({ post, index }) {
  const priority = index < 3;
  const tags = Array.isArray(post.tags) ? post.tags.filter(Boolean).slice(0, 3) : [];

  return (
    <article className="group h-full overflow-hidden rounded-[var(--anslation-ds-radius-lg)] border border-(--border) bg-(--card) shadow-[var(--anslation-ds-shadow-sm)] transition duration-200 hover:-translate-y-0.5 hover:border-(--primary)/45 hover:shadow-[var(--anslation-ds-shadow-md)]">
      <Link href={`/blogs/${post.slug}`} prefetch={false} className="flex h-full flex-col">
        <div className="relative aspect-[16/9] overflow-hidden bg-(--muted)">
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
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex items-center gap-2 text-[11px] font-medium text-(--muted-foreground)">
            <span>{formatDate(post.date)}</span>
            <span className="h-1 w-1 rounded-full bg-(--border)" />
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-3 w-3" />
              {post.readTime}
            </span>
          </div>

          <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-(--foreground) transition group-hover:text-(--primary)">
            {post.heading}
          </h3>

          <p className="line-clamp-2 text-sm leading-6 text-(--muted-foreground)">
            {post.excerpt}
          </p>

          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex h-6 items-center rounded-[6px] border border-(--border) bg-(--background) px-2 text-[10px] font-semibold text-(--muted-foreground)"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-auto flex items-center justify-between gap-3 pt-1">
            <span className="truncate text-xs font-medium text-(--muted-foreground)">
              {post.tool}
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

  const [posts, setPosts] = useState(() => initialPosts.map((post, index) => normalizeBlog(post, index)));
  const [query, setQuery] = useState(urlQuery);
  const [activeCategory, setActiveCategory] = useState(urlCategory);
  const [activeTag, setActiveTag] = useState(urlTag);
  const [sortMode, setSortMode] = useState(urlSort);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [syncState, setSyncState] = useState("idle");
  const [remoteOffset, setRemoteOffset] = useState(initialRemoteOffset);
  const [remoteHasMore, setRemoteHasMore] = useState(totalCount > initialRemoteOffset);
  const [isPending, startTransition] = useTransition();

  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  useEffect(() => {
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

        while (!cancelled && hasMore) {
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
              ? page.posts.map((post, index) => normalizeBlog(post, index))
              : mergeBlogPosts(currentPosts, page.posts)
          );
          nextOffset = page.nextOffset;
          hasMore = Boolean(page.hasMore);
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

    return sortPosts(queryFiltered, sortMode);
  }, [activeCategory, activeTag, deferredQuery, posts, sortMode]);

  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPosts.length;
  const displayedCount = visiblePosts.length;
  const remainingCount = Math.max(0, filteredPosts.length - displayedCount);
  const loadedCount = posts.length;

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      updateSearchParams(router, searchParams, {
        q: query.trim(),
        category: activeCategory,
        tag: activeTag,
        sort: sortMode,
      });
    }, 180);

    return () => window.clearTimeout(timeout);
  }, [activeCategory, activeTag, query, router, searchParams, sortMode]);

  const loadNextChunk = useCallback(() => {
    setVisibleCount((current) => Math.min(current + BLOG_CHUNK_SIZE, filteredPosts.length));
  }, [filteredPosts.length]);

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
        tag: activeTag,
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
      tag: activeTag,
      sort: sortMode,
    });
  };

  const resetFilters = () => {
    setQuery("");
    setActiveCategory("All");
    setActiveTag("All");
    setSortMode("latest");
    setVisibleCount(INITIAL_VISIBLE_COUNT);
    updateSearchParams(router, searchParams, {
      q: "",
      category: "All",
      tag: "All",
      sort: "latest",
    });
  };

  const syncLabel = syncState === "fresh"
    ? remoteHasMore
      ? "Refreshing articles"
      : "Live catalog ready"
    : syncState === "syncing"
      ? "Refreshing articles"
      : "Curated catalog";

  return (
    <section id="blog-explorer" className="mt-10 space-y-5">
      <div className="sticky top-[58px] z-20 rounded-[var(--anslation-ds-radius-lg)] border border-(--border) bg-(--background)/92 p-3 shadow-[var(--anslation-ds-shadow-sm)] backdrop-blur-xl">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <SearchControl
            value={query}
            onChange={handleQueryChange}
            onClear={clearQuery}
            pending={isPending}
          />
          <SortSelect value={sortMode} onChange={handleSortChange} />
        </div>
        <div className="mt-3">
          <CategoryTabs
            categories={categories}
            counts={counts}
            activeCategory={activeCategory}
            onChange={handleCategoryChange}
          />
        </div>
        <div className="mt-2">
          <TagChips
            tags={topTags}
            counts={tagCounts}
            activeTag={activeTag}
            onChange={handleTagChange}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-[var(--anslation-ds-radius-lg)] border border-(--border) bg-(--card) p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">Article library</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-(--foreground)">
            {filteredPosts.length} curated reads
          </h2>
          {filteredPosts.length > 0 && (
            <p className="mt-1 text-xs font-medium text-(--muted-foreground)">
              Showing {displayedCount} of {filteredPosts.length}
              {remoteHasMore && totalCount > loadedCount
                ? ` · loaded ${loadedCount} of ${totalCount}`
                : ""}
            </p>
          )}
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
          {hasMore && (
            <button
              type="button"
              onClick={loadAllPosts}
              className="inline-flex h-7 items-center rounded-[var(--anslation-ds-radius)] border border-(--primary)/35 bg-(--primary)/10 px-2.5 text-xs font-semibold text-(--primary) transition hover:bg-(--primary) hover:text-(--primary-foreground)"
            >
              Show all
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
              <BlogPostCard key={post.slug} post={post} index={index} />
            ))}
          </div>

          <div ref={sentinelRef} className="flex min-h-16 items-center justify-center py-6">
            {hasMore ? (
              <button
                type="button"
                onClick={loadNextChunk}
                className="inline-flex h-10 items-center gap-2 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) px-4 text-sm font-semibold text-(--foreground) shadow-[var(--anslation-ds-shadow-sm)] transition hover:border-(--primary) hover:text-(--primary)"
              >
                Load next {Math.min(BLOG_CHUNK_SIZE, remainingCount)} articles
                <ChevronDown className="h-4 w-4" />
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
