"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bookmark,
  BookOpen,
  Calculator,
  CalendarClock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Code2,
  Cpu,
  Download,
  FileText,
  Gamepad2,
  Image as ImageIcon,
  LayoutGrid,
  Lightbulb,
  Loader2,
  SquarePen,
  Search,
  Send,
  BadgeCheck,
  Shirt,
  Sparkles,
  Users,
  Wrench,
  X,
  Zap,
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
  blogTaxonomySlug,
  mergeBlogPosts,
  normalizeBlog,
  sortBlogsByRecency,
} from "../data";

// Pagination: 12 cards per page — first paint stays light, Load More
// reveals the next 12 (remote chunks are fetched only when local posts run out).
const INITIAL_VISIBLE_COUNT = 12;
const PAGE_SIZE = 12;
const BLOG_IMAGE_FALLBACK = "/assets/og-default.png";
// Fallback pages get one idle live-data refresh. The full catalog is fetched
// only after a search/category interaction, keeping ordinary visits lean.
const BACKGROUND_SYNC_PAGE_LIMIT = 1;
const INTERACTIVE_SYNC_LIMIT = 100;
const INTERACTIVE_SYNC_PAGE_LIMIT = 10;
const SORT_TABS = [
  { value: "latest", label: "Latest" },
  { value: "popular", label: "Popular" },
  { value: "trending", label: "Trending" },
];

function isFirebaseBlogImage(src) {
  const value = String(src || "").trim();
  if (!value || value.startsWith("/")) return false;

  try {
    const url = new URL(value);
    return (
      url.hostname === "firebasestorage.googleapis.com" &&
      /\/o\/blogs(?:%2f|%252f|\/)/i.test(url.pathname)
    );
  } catch {
    return false;
  }
}

function getBlogImageSrc(src) {
  const value = String(src || "").trim();
  if (!value) return BLOG_IMAGE_FALLBACK;
  if (value.startsWith("/")) return value;

  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol)
      ? value
      : BLOG_IMAGE_FALLBACK;
  } catch {
    return BLOG_IMAGE_FALLBACK;
  }
}

function handleBlogImageError(event) {
  const image = event.currentTarget;
  if (image.dataset.fallbackApplied === "true") return;

  image.dataset.fallbackApplied = "true";
  image.removeAttribute("srcset");
  image.src = BLOG_IMAGE_FALLBACK;
}

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
  // Post dates are stored date-only ("YYYY-MM-DD"), which `new Date()` parses
  // as UTC midnight. Formatting in UTC keeps the calendar day identical on the
  // server (UTC) and the client (any local zone) — otherwise users west of UTC
  // saw the previous day on hydration, triggering a mismatch on every card.
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

// Some remote-loaded excerpts contain raw HTML fragments; strip them so list
// surfaces never render literal tags.
function stripHtml(value = "") {
  return String(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
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

function getEngagementScore(post = {}) {
  const views = Number(post.views || post.viewCount || post.totalViews || 0);
  const likes = Number(post.likesCount || post.likes || post.reactions || 0);
  const comments = Number(post.commentsCount || post.commentCount || post.comments || 0);
  return views + likes * 12 + comments * 18;
}

function getPopularityScore(post = {}) {
  const dateTime = Date.parse(post.date || post.updatedAt || post.createdAt || "");
  const daysOld = dateTime
    ? Math.max(0, (Date.now() - dateTime) / (1000 * 60 * 60 * 24))
    : 90;
  const recencyBoost = Math.max(0, 45 - Math.min(daysOld, 45));

  return getEngagementScore(post) + recencyBoost;
}

function sortPosts(posts, sortMode) {
  if (sortMode === "trending") {
    return [...posts].sort((a, b) => {
      const scoreDiff = getPopularityScore(b) - getPopularityScore(a);
      if (scoreDiff !== 0) return scoreDiff;
      return Date.parse(b.date || "") - Date.parse(a.date || "");
    });
  }
  if (sortMode === "popular") {
    // Pure engagement, no recency boost — long-standing reader favourites.
    return [...posts].sort((a, b) => {
      const scoreDiff = getEngagementScore(b) - getEngagementScore(a);
      if (scoreDiff !== 0) return scoreDiff;
      return Date.parse(b.date || "") - Date.parse(a.date || "");
    });
  }
  // "Latest" = when a post actually went live (createdAt / publishedAt), not
  // the author-set display date which is often backdated — so a blog just
  // published from the Admin Panel surfaces at the very top.
  return sortBlogsByRecency(posts);
}

// A post came from Firebase (i.e. was published via the Admin Panel) when it
// carries a server timestamp. Used to keep the featured hero on genuinely
// published content once the live catalog has synced in.
function isPublishedPost(post = {}) {
  return Boolean(post.createdAt || post.publishedAt || post.status === "published");
}

function updateSearchParams(router, searchParams, updates) {
  const params = new URLSearchParams(searchParams.toString());

  Object.entries(updates).forEach(([key, value]) => {
    // Only drop a param when it equals THAT key's default — otherwise searching
    // for the literal words "latest" or "all" stripped the ?q= param and made
    // the search unshareable / lost on refresh.
    const isDefault =
      !value ||
      (key === "category" && (value === "All" || value === "all")) ||
      (key === "sort" && value === "latest");
    if (isDefault) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  });

  const query = params.toString();
  if (query === searchParams.toString()) return;
  router.replace(query ? `/blogs?${query}` : "/blogs", { scroll: false });
}

/* ─────────────────────────── presentation ─────────────────────────── */

function AuthorAvatar({ name, className = "" }) {
  const initial = String(name || "A").trim().charAt(0).toUpperCase();
  return (
    <span
      aria-hidden="true"
      className={cx(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-(--anslation-ds-primary-soft) font-bold text-(--primary)",
        className || "h-6 w-6 text-[11px]",
      )}
    >
      {initial}
    </span>
  );
}

function SectionHeading({ title, kicker, action, actionHref, onAction, id }) {
  const actionClass =
    "group inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-(--primary) transition-colors duration-200 hover:underline motion-reduce:transition-none";
  const actionArrow = (
    <ArrowRight
      aria-hidden="true"
      className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
    />
  );
  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
        <div className="min-w-0">
          {kicker ? (
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-(--primary)">
              {kicker}
            </p>
          ) : null}
          <h2
            id={id}
            className="text-xl font-black tracking-tight text-(--foreground) sm:text-2xl lg:text-3xl"
          >
            {title}
          </h2>
        </div>
        {action ? (
          actionHref ? (
            <Link href={actionHref} className={actionClass}>
              {action} {actionArrow}
            </Link>
          ) : (
            <button type="button" onClick={onAction} className={actionClass}>
              {action} {actionArrow}
            </button>
          )
        ) : null}
      </div>
      <div
        aria-hidden="true"
        className="mt-3 h-px w-full bg-gradient-to-r from-(--border) via-(--border) to-transparent"
      />
    </div>
  );
}

/**
 * Full-width featured hero carousel — dark navy panel, copy left, cover image
 * right, arrow + dot navigation, gentle auto-advance (paused on hover and
 * under prefers-reduced-motion).
 */
function FeaturedHeroCarousel({ posts }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = posts.length;

  const go = useCallback(
    (delta) => setIndex((current) => (current + delta + count) % count),
    [count],
  );

  useEffect(() => {
    if (count < 2 || paused) return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;
    const timer = window.setInterval(() => go(1), 6500);
    return () => window.clearInterval(timer);
  }, [count, go, paused]);

  if (!count) return null;
  // Guard the index: the post list is recomputed live as new blogs sync in, so
  // a persisted `index` can momentarily point past a shorter array — wrap it
  // instead of dereferencing undefined.
  const post = posts[index % count];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured articles"
      className="relative overflow-hidden rounded-2xl shadow-md"
      style={{
        background:
          "linear-gradient(140deg, var(--anslation-ds-footer, #0F172A) 35%, color-mix(in srgb, var(--primary) 40%, var(--anslation-ds-footer, #0F172A)))",
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* soft radial brand accents (same color-mix pattern as the home hero panel) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(52% 68% at 84% 10%, color-mix(in srgb, var(--primary) 32%, transparent), transparent 72%), radial-gradient(42% 55% at 6% 94%, color-mix(in srgb, var(--secondary) 18%, transparent), transparent 70%)",
        }}
      />
      {/* decorative dots */}
      <span aria-hidden="true" className="absolute left-[46%] top-8 hidden h-2 w-2 rounded-full bg-white/25 lg:block" />
      <span aria-hidden="true" className="absolute bottom-10 left-10 hidden h-1.5 w-1.5 rounded-full lg:block" style={{ background: "var(--secondary)", opacity: 0.6 }} />

      <div className="relative grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-8 lg:p-10">
        {/* Cover — full-bleed on mobile, framed panel on desktop */}
        <Link
          href={`/blogs/${post.slug}`}
          prefetch={false}
          tabIndex={-1}
          aria-hidden="true"
          className="relative block aspect-[16/9] overflow-hidden sm:aspect-[21/9] lg:order-2 lg:aspect-[16/10] lg:rounded-xl lg:border lg:border-white/10"
        >
          <Image
            src={getBlogImageSrc(post.image)}
            alt=""
            fill
            unoptimized={isFirebaseBlogImage(post.image)}
            loading="eager"
            fetchPriority="high"
            sizes="(max-width: 1024px) 100vw, 44vw"
            onError={handleBlogImageError}
            className="object-cover"
          />
          {/* bottom fade so the image melts into the panel on small screens */}
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent lg:hidden"
          />
        </Link>

        <div className="min-w-0 px-4 pb-6 pt-5 sm:px-8 sm:pb-8 lg:order-1 lg:p-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-(--primary) px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-(--primary-foreground)">
            <Sparkles className="h-3 w-3" aria-hidden="true" /> Featured
          </span>
          <h2 className="mt-4 line-clamp-3 text-2xl font-black leading-[1.12] tracking-tight text-white sm:text-3xl lg:text-4xl xl:text-[2.75rem]">
            {post.heading}
          </h2>
          {stripHtml(post.excerpt) ? (
            <p className="mt-3 line-clamp-2 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
              {stripHtml(post.excerpt)}
            </p>
          ) : null}
          {/* glass meta bar */}
          <div className="mt-5 inline-flex max-w-full flex-wrap items-center gap-x-3 gap-y-1.5 rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white/80 backdrop-blur-md">
            {post.author ? (
              <span className="inline-flex items-center gap-2 text-white/90">
                <AuthorAvatar name={post.author} className="h-6 w-6 text-[11px]" />
                {post.author}
              </span>
            ) : null}
            {post.date ? (
              <>
                <span aria-hidden="true" className="h-1 w-1 rounded-full bg-white/40" />
                <span>{formatDate(post.date)}</span>
              </>
            ) : null}
            {post.readTime ? (
              <>
                <span aria-hidden="true" className="h-1 w-1 rounded-full bg-white/40" />
                <span>{post.readTime}</span>
              </>
            ) : null}
          </div>
          <Link
            href={`/blogs/${post.slug}`}
            prefetch={false}
            className="group mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-(--primary) px-6 text-sm font-bold text-(--primary-foreground) shadow-sm transition-all duration-200 hover:bg-(--primary-hover) motion-reduce:transition-none"
          >
            Read Article{" "}
            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
            />
          </Link>
        </div>
      </div>

      {count > 1 ? (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous featured article"
            className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition-colors duration-200 hover:bg-white/20 motion-reduce:transition-none lg:flex"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next featured article"
            className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition-colors duration-200 hover:bg-white/20 motion-reduce:transition-none lg:flex"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="relative flex items-center justify-center gap-1 pb-3">
            {posts.map((item, dotIndex) => (
              <button
                key={item.slug}
                type="button"
                onClick={() => setIndex(dotIndex)}
                aria-label={`Go to featured article ${dotIndex + 1}`}
                aria-current={dotIndex === index}
                className="group/dot flex h-8 items-center px-1"
              >
                <span
                  aria-hidden="true"
                  className={cx(
                    "h-1.5 rounded-full transition-all duration-200 motion-reduce:transition-none",
                    dotIndex === index ? "w-6 bg-(--primary)" : "w-1.5 bg-white/30 group-hover/dot:bg-white/50",
                  )}
                />
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="pb-5" />
      )}
    </section>
  );
}

const CATEGORY_ICONS = [
  [/game/i, Gamepad2],
  [/download/i, Download],
  [/image|photo|design/i, ImageIcon],
  [/pdf|doc/i, FileText],
  [/calc|finance/i, Calculator],
  [/fashion|lifestyle/i, Shirt],
  [/digital|tech/i, Cpu],
  [/\bai\b|smart/i, Sparkles],
  [/seo|marketing/i, BarChart3],
  [/dev|code/i, Code2],
  [/productivity/i, Zap],
  [/tool/i, Wrench],
];

function categoryIcon(name = "") {
  const match = CATEGORY_ICONS.find(([pattern]) => pattern.test(name));
  return match ? match[1] : BookOpen;
}

/**
 * Category band under the hero — icon + name + article count per category,
 * ending in an "All Categories" reset card. Buttons drive the same
 * client-side filter as before.
 */
function CategoryBand({ categories, counts, activeCategory, onChange }) {
  // Show every non-empty category (the row scrolls horizontally), busiest
  // first. Zero-article categories are dead-end filters — they reappear
  // automatically as soon as a post is published in them.
  const items = categories
    .filter(
      (category) =>
        category !== "All" && (counts[blogTaxonomySlug(category)] || 0) > 0,
    )
    .sort(
      (a, b) =>
        (counts[blogTaxonomySlug(b)] || 0) - (counts[blogTaxonomySlug(a)] || 0),
    );

  return (
    <section aria-label="Blog categories" className="rounded-2xl border border-(--border) bg-(--card) px-3 py-2 shadow-sm">
      <div className="flex snap-x snap-mandatory items-stretch gap-1 overflow-x-auto scroll-px-3 scrollbar-hide">
        {items.map((category) => {
          const Icon = categoryIcon(category);
          const active = category === activeCategory;
          return (
            <button
              key={category}
              type="button"
              onClick={() => onChange(active ? "All" : category)}
              aria-pressed={active}
              className={cx(
                "flex min-w-[132px] flex-1 snap-start items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-200 motion-reduce:transition-none",
                active ? "bg-(--anslation-ds-primary-soft)" : "hover:bg-(--anslation-ds-soft)",
              )}
            >
              <span
                className={cx(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-lg",
                  active ? "bg-(--primary) text-(--primary-foreground)" : "bg-(--anslation-ds-primary-soft) text-(--primary)",
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={1.9} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-(--foreground)">{category}</span>
                <span className="block text-xs font-medium text-(--muted-foreground)">
                  {(counts[blogTaxonomySlug(category)] || 0) === 1
                    ? "1 Article"
                    : `${counts[blogTaxonomySlug(category)] || 0} Articles`}
                </span>
              </span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => onChange("All")}
          aria-pressed={activeCategory === "All"}
          className="flex min-w-[132px] flex-1 snap-start items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-200 hover:bg-(--anslation-ds-soft) motion-reduce:transition-none"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-(--anslation-ds-primary-soft) text-(--primary)">
            <LayoutGrid className="h-4 w-4" strokeWidth={1.9} />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-(--foreground)">All Categories</span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-(--primary)">
              View all <ArrowRight className="h-3 w-3" />
            </span>
          </span>
        </button>
      </div>
    </section>
  );
}

function FeaturedPickCard({ post, featured = false }) {
  return (
    <Link
      href={`/blogs/${post.slug}`}
      prefetch={false}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-(--border) bg-(--card) shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-(--anslation-ds-border-strong) hover:shadow-[var(--anslation-ds-shadow-lg)] motion-reduce:transition-none"
    >
      <div
        className={cx(
          "relative aspect-[16/9] overflow-hidden bg-(--anslation-ds-soft)",
          featured && "lg:aspect-auto lg:min-h-72 lg:flex-1",
        )}
      >
        <Image
          src={getBlogImageSrc(post.image)}
          alt={post.imageAlt || post.heading}
          fill
          unoptimized={isFirebaseBlogImage(post.image)}
          sizes={
            featured
              ? "(max-width: 1024px) 100vw, 66vw"
              : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          }
          onError={handleBlogImageError}
          className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
        />
        {post.category ? (
          <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-sm">
            {post.category}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3
          className={cx(
            "line-clamp-2 font-bold leading-snug tracking-tight text-(--foreground) transition-colors duration-200 group-hover:text-(--primary) motion-reduce:transition-none",
            featured ? "text-lg sm:text-xl lg:text-2xl" : "text-lg",
          )}
        >
          {post.heading}
        </h3>
        {stripHtml(post.excerpt) ? (
          <p
            className={cx(
              "mt-2 text-sm leading-relaxed text-(--muted-foreground)",
              featured ? "line-clamp-3" : "line-clamp-2",
            )}
          >
            {stripHtml(post.excerpt)}
          </p>
        ) : null}
        <div className="mt-auto flex items-center justify-between gap-3 pt-4 text-xs font-semibold text-(--muted-foreground)">
          {post.author ? (
            <span className="inline-flex min-w-0 items-center gap-2">
              <AuthorAvatar name={post.author} />
              <span className="truncate">{post.author}</span>
            </span>
          ) : (
            <span />
          )}
          <span className="inline-flex shrink-0 items-center gap-3">
            {post.readTime ? <span>{post.readTime}</span> : null}
            <span className="inline-flex items-center gap-1 font-bold text-(--primary) opacity-0 -translate-x-1 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-x-0">
              Read
              <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}

const BOOKMARKS_KEY = "altft-blog-bookmarks";

function readBookmarks() {
  try {
    const value = JSON.parse(window.localStorage.getItem(BOOKMARKS_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function ArticleRow({ post, searchTerms = [], bookmarked, onToggleBookmark, divider }) {
  return (
    <article className={cx("group relative flex gap-4 py-4 sm:gap-5", divider && "border-b border-(--border)")}>
      <Link
        href={`/blogs/${post.slug}`}
        prefetch={false}
        tabIndex={-1}
        aria-hidden="true"
        className="relative block h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-(--anslation-ds-soft) sm:h-24 sm:w-36"
      >
        <Image
          src={getBlogImageSrc(post.image)}
          alt=""
          fill
          unoptimized={isFirebaseBlogImage(post.image)}
          sizes="144px"
          onError={handleBlogImageError}
          className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
        />
      </Link>
      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 pr-10 text-base font-bold leading-snug tracking-tight text-(--foreground) sm:text-lg">
          <Link href={`/blogs/${post.slug}`} prefetch={false} className="transition-colors duration-200 hover:text-(--primary) motion-reduce:transition-none">
            <HighlightedText text={post.heading} terms={searchTerms} />
          </Link>
        </h3>
        {stripHtml(post.excerpt) ? (
          <p className="mt-1 line-clamp-2 hidden text-sm leading-relaxed text-(--muted-foreground) sm:block">
            <HighlightedText text={stripHtml(post.excerpt)} terms={searchTerms} />
          </p>
        ) : null}
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-(--muted-foreground)">
          {post.author ? (
            <span className="inline-flex items-center gap-1.5">
              <AuthorAvatar name={post.author} className="h-5 w-5 text-[10px]" />
              {post.author}
            </span>
          ) : null}
          {post.date ? (
            <>
              <span aria-hidden="true" className="h-1 w-1 rounded-full bg-(--border)" />
              <span>{formatDate(post.date)}</span>
            </>
          ) : null}
          {post.readTime ? (
            <>
              <span aria-hidden="true" className="h-1 w-1 rounded-full bg-(--border)" />
              <span>{post.readTime}</span>
            </>
          ) : null}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onToggleBookmark(post.slug)}
        aria-label={bookmarked ? "Remove bookmark" : "Bookmark this article"}
        aria-pressed={bookmarked}
        className={cx(
          "absolute -right-1.5 top-2 inline-flex h-11 w-11 items-center justify-center rounded-lg transition-colors duration-200 motion-reduce:transition-none",
          bookmarked
            ? "text-(--primary)"
            : "text-(--muted-foreground) hover:bg-(--anslation-ds-soft) hover:text-(--primary)",
        )}
      >
        <Bookmark aria-hidden="true" className={cx("h-4 w-4", bookmarked && "fill-current")} />
      </button>
    </article>
  );
}

function PopularArticlesWidget({ posts, onViewAll, eagerImageSources }) {
  if (!posts?.length) return null;
  return (
    <div className="rounded-2xl border border-(--border) bg-(--card) p-5 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-(--foreground)">
        <BarChart3 className="h-4 w-4 text-(--primary)" /> Popular Articles
      </h3>
      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blogs/${post.slug}`} prefetch={false} className="group flex gap-3">
            <span className="relative block h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-(--anslation-ds-soft)">
              <Image
                src={getBlogImageSrc(post.image)}
                alt=""
                fill
                unoptimized={isFirebaseBlogImage(post.image)}
                sizes="56px"
                loading={
                  eagerImageSources?.has(getBlogImageSrc(post.image))
                    ? "eager"
                    : "lazy"
                }
                onError={handleBlogImageError}
                className="object-cover"
              />
            </span>
            <span className="min-w-0">
              <span className="line-clamp-2 text-sm font-bold leading-tight text-(--foreground) transition-colors group-hover:text-(--primary)">
                {post.heading}
              </span>
              {post.readTime ? (
                <span className="mt-1 block text-xs font-medium text-(--muted-foreground)">{post.readTime}</span>
              ) : null}
            </span>
          </Link>
        ))}
      </div>
      <button type="button" onClick={onViewAll} className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-(--primary) hover:underline">
        View all popular <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function NewsletterWidget() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | done | error

  const subscribe = async (e) => {
    e.preventDefault();
    const value = email.trim();
    if (!value || status === "loading") return;
    setStatus("loading");
    try {
      // Best-effort: persist the intent if a subscribe endpoint exists; either
      // way the reader gets confirmation instead of a dead button.
      await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: value, source: "blog" }),
      }).catch(() => {});
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("done");
    }
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-(--border) p-5 shadow-sm"
      style={{
        background:
          "linear-gradient(150deg, color-mix(in srgb, var(--primary) 10%, var(--card)), color-mix(in srgb, var(--secondary) 12%, var(--card)))",
      }}
    >
      <span className="pointer-events-none absolute -right-2 top-4 rotate-12 text-(--primary) opacity-70" aria-hidden="true">
        <Send className="h-10 w-10" strokeWidth={1.5} />
      </span>
      <h3 className="text-lg font-bold text-(--foreground)">Stay Updated</h3>
      <p className="mt-1.5 max-w-[85%] text-sm leading-relaxed text-(--muted-foreground)">
        Get the latest articles, tools, and productivity tips straight to your inbox.
      </p>
      {status === "done" ? (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-(--primary) bg-(--anslation-ds-primary-soft) px-3.5 py-3 text-sm font-semibold text-(--primary)">
          <BadgeCheck className="h-4 w-4 shrink-0" /> You’re subscribed — watch your inbox!
        </div>
      ) : (
        <form className="mt-4 flex gap-2" onSubmit={subscribe}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            aria-label="Email address"
            className="h-11 w-full min-w-0 rounded-lg border border-(--border) bg-(--card) px-3.5 text-sm font-medium text-(--foreground) outline-none transition placeholder:text-(--muted-foreground) focus:border-(--primary) focus:ring-1 focus:ring-(--primary)"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="h-11 shrink-0 rounded-lg bg-(--primary) px-4 text-sm font-bold text-(--primary-foreground) transition-colors hover:bg-(--primary-hover) disabled:opacity-60"
          >
            {status === "loading" ? "…" : "Subscribe"}
          </button>
        </form>
      )}
      <p className="mt-2.5 text-xs text-(--muted-foreground)">No spam. Unsubscribe anytime.</p>
    </div>
  );
}

const QUICK_ACCESS_FALLBACK = [
  "Digital Tools",
  "Tools",
  "Pdf",
  "Image",
  "Downloader",
  "Calculator",
];

function QuickAccessWidget({ activeQuery, onChangeQuery, categories = [] }) {
  // Prefer the real, live category list (so options never go stale) and fall
  // back to a sensible default when categories haven't loaded yet.
  const options = (categories.filter((c) => c && c !== "All").slice(0, 8));
  const list = options.length ? options : QUICK_ACCESS_FALLBACK;
  return (
    <div className="rounded-2xl border border-(--border) bg-(--card) p-5 shadow-sm">
      <h3 className="mb-3 text-base font-bold text-(--foreground)">Quick Access</h3>
      <div className="flex flex-wrap gap-2">
        {list.map((option) => {
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
                  : "border-(--border) bg-(--background) text-(--foreground) hover:border-(--primary) hover:text-(--primary)",
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

const TRUST_ITEMS = [
  { icon: SquarePen, title: "Expertly Written", body: "In-depth, well-researched content you can trust." },
  { icon: CalendarClock, title: "Regular Updates", body: "New articles every week on trending topics." },
  { icon: Lightbulb, title: "Actionable Insights", body: "Tips and guides you can apply immediately." },
  { icon: Users, title: "Community Driven", body: "Built for creators, developers, and innovators." },
];

function TrustStrip() {
  return (
    <section aria-label="Why read the AltFTool blog" className="grid grid-cols-1 gap-4 rounded-2xl border border-(--border) bg-(--card) p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
      {TRUST_ITEMS.map((item) => (
        <div key={item.title} className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-(--anslation-ds-primary-soft) text-(--primary)">
            <item.icon className="h-5 w-5" strokeWidth={1.9} />
          </span>
          <span>
            <span className="block text-sm font-bold text-(--foreground)">{item.title}</span>
            <span className="mt-0.5 block text-xs leading-relaxed text-(--muted-foreground)">{item.body}</span>
          </span>
        </div>
      ))}
    </section>
  );
}

function SearchControl({ value, onChange, onClear, pending }) {
  return (
    <div className="relative w-full sm:w-64">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-(--muted-foreground)" />
      <input
        aria-label="Search blog articles"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search articles..."
        className="h-10 w-full rounded-lg border border-(--border) bg-(--card) px-10 text-sm font-medium text-(--foreground) shadow-sm outline-none transition placeholder:text-(--muted-foreground) focus:border-(--primary) focus:ring-1 focus:ring-(--primary)"
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

/* ─────────────────────────── data plumbing ─────────────────────────── */

function withTimeout(promise, timeoutMs, fallbackValue) {
  return Promise.race([
    promise,
    new Promise((resolve) => {
      window.setTimeout(() => resolve(fallbackValue), timeoutMs);
    }),
  ]);
}

async function fetchRemoteBlogChunk(
  offset,
  signal,
  limit = BLOG_REMOTE_LIMIT,
) {
  const params = new URLSearchParams({
    offset: String(offset),
    limit: String(limit),
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
  heroShortcutRail,
  children,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const articlesRef = useRef(null);

  const urlQuery = searchParams.get("q") || "";
  const urlCategory = searchParams.get("category") || "All";
  const urlSort = searchParams.get("sort") || "latest";

  const [posts, setPosts] = useState(() => initialPosts.map((post, index) => normalizeBlog(post, index)));
  const [query, setQuery] = useState(urlQuery);
  const [activeCategory, setActiveCategory] = useState(urlCategory);
  const [sortMode, setSortMode] = useState(urlSort);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [remoteOffset, setRemoteOffset] = useState(initialRemoteOffset);
  // When a remote catalog seeded the first page (initialRemoteOffset > 0) but
  // the total count is unknown/underreported (e.g. the count aggregation
  // failed and collapsed to the loaded length), assume more exist — the
  // Load-More fetch is the source of truth and will flip this off when the
  // catalog is genuinely exhausted. Prevents silently capping at the first page.
  const [remoteHasMore, setRemoteHasMore] = useState(
    initialRemoteOffset > 0 || totalCount > initialRemoteOffset,
  );
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [catalogSyncing, setCatalogSyncing] = useState(false);
  const remoteOffsetRef = useRef(initialRemoteOffset);
  const remoteHasMoreRef = useRef(
    initialRemoteOffset > 0 || totalCount > initialRemoteOffset,
  );
  const catalogSyncPromiseRef = useRef(null);
  const catalogSyncControllerRef = useRef(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [isPending, startTransition] = useTransition();

  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  useEffect(() => {
    setBookmarks(readBookmarks());
  }, []);

  const toggleBookmark = useCallback((slug) => {
    setBookmarks((current) => {
      const next = current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug];
      try {
        window.localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  }, []);

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

          setPosts((currentPosts) => mergeBlogPosts(currentPosts, page.posts));
          nextOffset = page.nextOffset;
          hasMore = Boolean(page.hasMore);
          syncedPages += 1;
          remoteOffsetRef.current = nextOffset;
          remoteHasMoreRef.current = hasMore;
          setRemoteOffset(nextOffset);
          setRemoteHasMore(hasMore);

          await waitForIdle();
        }

        if (!cancelled) {
          remoteHasMoreRef.current = hasMore;
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

  useEffect(
    () => () => {
      catalogSyncControllerRef.current?.abort();
    },
    [],
  );

  const syncRemoteCatalog = useCallback(() => {
    if (!remoteHasMoreRef.current) return Promise.resolve();
    if (catalogSyncPromiseRef.current) return catalogSyncPromiseRef.current;

    const controller = new AbortController();
    catalogSyncControllerRef.current = controller;
    setCatalogSyncing(true);

    const syncPromise = (async () => {
      let nextOffset = remoteOffsetRef.current;
      let hasMore = remoteHasMoreRef.current;
      let syncedPages = 0;

      while (
        hasMore &&
        !controller.signal.aborted &&
        syncedPages < INTERACTIVE_SYNC_PAGE_LIMIT
      ) {
        const page = await fetchRemoteBlogChunk(
          nextOffset,
          controller.signal,
          INTERACTIVE_SYNC_LIMIT,
        );

        if (!page.posts?.length) {
          hasMore = false;
          break;
        }

        setPosts((currentPosts) => mergeBlogPosts(currentPosts, page.posts));
        nextOffset = page.nextOffset;
        hasMore = Boolean(page.hasMore);
        syncedPages += 1;
        remoteOffsetRef.current = nextOffset;
        remoteHasMoreRef.current = hasMore;
        setRemoteOffset(nextOffset);
        setRemoteHasMore(hasMore);

        if (hasMore) await waitForIdle(80);
      }

      remoteHasMoreRef.current = hasMore;
      setRemoteHasMore(hasMore);
    })()
      .catch((error) => {
        if (error?.name !== "AbortError") {
          /* keep the already-loaded catalog usable after a transient failure */
        }
      })
      .finally(() => {
        catalogSyncPromiseRef.current = null;
        catalogSyncControllerRef.current = null;
        setCatalogSyncing(false);
      });

    catalogSyncPromiseRef.current = syncPromise;
    return syncPromise;
  }, []);

  useEffect(() => {
    if (query.trim() || activeCategory !== "All") {
      syncRemoteCatalog();
    }
  }, [activeCategory, query, syncRemoteCatalog]);

  const counts = useMemo(() => getCategoryCounts(posts), [posts]);

  // Featured hero — the freshest published blogs, recomputed live from the
  // post state. As the background sync merges newly published Firebase blogs,
  // the newest ones enter the hero and the oldest drop out automatically. Once
  // the live catalog has synced, the hero shows only Admin-published content.
  const HERO_COUNT = 5;
  const heroPosts = useMemo(() => {
    const ranked = sortBlogsByRecency(posts);
    const published = ranked.filter(isPublishedPost);
    const pool = published.length >= 3 ? published : ranked;
    return pool.slice(0, HERO_COUNT);
  }, [posts]);
  const heroSlugs = useMemo(() => new Set(heroPosts.map((post) => post.slug)), [heroPosts]);
  const heroImageSources = useMemo(
    () => new Set(heroPosts.map((post) => getBlogImageSrc(post.image))),
    [heroPosts],
  );

  const filteredPosts = useMemo(() => {
    const activeCategorySlug = blogTaxonomySlug(activeCategory);
    let result = activeCategory === "All"
      ? posts
      : posts.filter((post) => blogTaxonomySlug(post.category) === activeCategorySlug);

    if (deferredQuery) {
      result = result.filter((post) => post.searchText?.includes(deferredQuery));
    }

    const sorted = sortPosts(result, sortMode);
    // Default view: the hero's posts cascade OUT of the list (they're already
    // shown above), so an article ages from hero → list as newer posts publish.
    // In any filtered/search view we show everything that matches.
    if (activeCategory === "All" && !deferredQuery) {
      return sorted.filter((post) => !heroSlugs.has(post.slug));
    }
    return sorted;
  }, [activeCategory, deferredQuery, posts, sortMode, heroSlugs]);

  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const searchTerms = useMemo(() => getSearchTerms(deferredQuery), [deferredQuery]);
  // Remote paging uses a single all-categories offset, so extending via the
  // remote catalog only makes sense in the default (unfiltered) view. Under an
  // active category/search we page through the already-loaded local matches
  // only — otherwise "Load More" fetched unrelated posts that got filtered out
  // and the button never went away.
  const isDefaultView = activeCategory === "All" && !deferredQuery;
  const hasMore = isDefaultView
    ? visibleCount < filteredPosts.length || remoteHasMore
    : visibleCount < filteredPosts.length;

  // Featured picks + sidebar stay distinct from the hero (no repeats).
  const featuredPicks = useMemo(
    () => sortPosts(posts, "trending").filter((post) => !heroSlugs.has(post.slug)).slice(0, 3),
    [posts, heroSlugs],
  );
  const popularSidebarPosts = useMemo(() => sortPosts(posts, "popular").slice(0, 5), [posts]);

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

      setPosts((currentPosts) => mergeBlogPosts(currentPosts, page.posts));
      setVisibleCount((current) => current + PAGE_SIZE);
      remoteOffsetRef.current = page.nextOffset;
      remoteHasMoreRef.current = Boolean(page.hasMore);
      setRemoteOffset(page.nextOffset);
      setRemoteHasMore(Boolean(page.hasMore));
    } finally {
      setRemoteLoading(false);
    }
  }, [remoteHasMore, remoteLoading, remoteOffset]);

  const loadNextChunk = useCallback(() => {
    if (visibleCount < filteredPosts.length) {
      setVisibleCount((current) => Math.min(current + PAGE_SIZE, filteredPosts.length));
      return;
    }
    loadNextRemoteChunk();
  }, [filteredPosts.length, loadNextRemoteChunk, visibleCount]);

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

  const jumpToArticles = (sortValue) => {
    if (sortValue) handleSortChange(sortValue);
    articlesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="blog-explorer" className="mt-2 flex flex-col gap-8">
      {/* 1 — Featured hero carousel */}
      {heroPosts.length > 0 && <FeaturedHeroCarousel posts={heroPosts} />}

      {heroShortcutRail}

      {/* 2 — Category band */}
      <CategoryBand
        categories={initialCategories}
        counts={counts}
        activeCategory={activeCategory}
        onChange={handleCategoryChange}
      />

      {/* 3 — Featured picks */}
      {featuredPicks.length > 0 && (
        <section
          aria-labelledby="featured-picks-heading"
          className="render-deferred"
        >
          <SectionHeading
            id="featured-picks-heading"
            kicker="Editor's selection"
            title="Featured Picks"
            action="View all featured"
            onAction={() => jumpToArticles("trending")}
          />
          {/* Bento: first pick spans 2 cols/rows on desktop, stacks on mobile */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:grid-rows-2">
            {featuredPicks.map((post, index) => (
              <div
                key={post.slug}
                className={cx(
                  "min-w-0",
                  index === 0 && "sm:col-span-2 lg:row-span-2",
                )}
              >
                <FeaturedPickCard post={post} featured={index === 0} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4 — Latest articles + sidebar */}
      <section
        ref={articlesRef}
        aria-labelledby="latest-articles-heading"
        className="render-deferred grid scroll-mt-24 grid-cols-1 gap-8 lg:grid-cols-3"
      >
        <div className="min-w-0 lg:col-span-2">
          <div className="mb-5">
            <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
              <div className="min-w-0">
                <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-(--primary)">
                  Fresh off the press
                </p>
                <h2
                  id="latest-articles-heading"
                  className="text-xl font-black tracking-tight text-(--foreground) sm:text-2xl lg:text-3xl"
                >
                  Latest Articles
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1" role="tablist" aria-label="Sort articles">
                  {SORT_TABS.map((tab) => {
                    const active = sortMode === tab.value;
                    return (
                      <button
                        key={tab.value}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => handleSortChange(tab.value)}
                        className={cx(
                          "relative min-h-10 px-3 py-1.5 text-sm font-bold transition-colors duration-200 motion-reduce:transition-none",
                          active ? "text-(--primary)" : "text-(--muted-foreground) hover:text-(--foreground)",
                        )}
                      >
                        {tab.label}
                        {active && (
                          <span aria-hidden="true" className="absolute inset-x-3 bottom-0.5 h-0.5 rounded-full bg-(--primary)" />
                        )}
                      </button>
                    );
                  })}
                </div>
                <SearchControl
                  value={query}
                  onChange={handleQueryChange}
                  onClear={clearQuery}
                  pending={isPending || catalogSyncing}
                />
              </div>
            </div>
            <div
              aria-hidden="true"
              className="mt-3 h-px w-full bg-gradient-to-r from-(--border) via-(--border) to-transparent"
            />
          </div>

          {filteredPosts.length === 0 ? (
            <EmptyState query={query} onReset={resetFilters} />
          ) : (
            <div className="rounded-2xl border border-(--border) bg-(--card) px-5 shadow-sm">
              {visiblePosts.map((post, index) => (
                <ArticleRow
                  key={post.slug}
                  post={post}
                  searchTerms={searchTerms}
                  bookmarked={bookmarks.includes(post.slug)}
                  onToggleBookmark={toggleBookmark}
                  divider={index !== visiblePosts.length - 1}
                />
              ))}
            </div>
          )}

          <div className="flex min-h-16 items-center justify-center py-6">
            {hasMore ? (
              <button
                type="button"
                onClick={loadNextChunk}
                disabled={remoteLoading}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-(--border) bg-(--card) px-6 text-sm font-bold text-(--foreground) shadow-sm transition-all duration-200 hover:border-(--primary) hover:text-(--primary) hover:shadow-[var(--anslation-ds-shadow-md)] motion-reduce:transition-none"
              >
                {remoteLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Load More Articles
                    <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </button>
            ) : null}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 flex flex-col gap-5 pb-12">
            <PopularArticlesWidget
              posts={popularSidebarPosts}
              eagerImageSources={heroImageSources}
              onViewAll={() => jumpToArticles("popular")}
            />
            <NewsletterWidget />
            <QuickAccessWidget
              activeQuery={query}
              categories={initialCategories}
              onChangeQuery={(val) => {
                handleQueryChange(val);
                setActiveCategory("All");
              }}
            />
          </div>
        </div>
      </section>

      {/* 5 — extra editorial sections from the server page, same 8-unit rhythm */}
      {children && (
        <div className="render-deferred flex flex-col gap-8">{children}</div>
      )}

      {/* 6 — trust strip */}
      <div className="render-deferred">
        <TrustStrip />
      </div>
    </section>
  );
}
