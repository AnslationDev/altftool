"use client";

import { useMemo, useState, useId } from "react";
import Link from "next/link";
import {
  ChevronRight, ChevronDown, Mail, ArrowRight, Check, Clock, Eye, Plus,
  Bookmark, Heart, TrendingUp, Zap,
} from "lucide-react";
import ManagedImage from "@/components/ui/ManagedImage";
import NewsCard from "./ui/NewsCard";
import CategoriesSection from "./CategoriesSection";

// ─── helpers ──────────────────────────────────────────────────────────────
function timeAgo(h) {
  if (!h && h !== 0) return "";
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? "1 day ago" : `${d} days ago`;
}

function formatCount(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function slugify(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ─── Hero Slider ──────────────────────────────────────────────────────────
function HeroSlider({ stories, timeAgo, formatCount }) {
  const [current, setCurrent] = useState(0);
  const story = stories[current];

  if (!story) return null;

  return (
    <div className="relative h-[530px] overflow-hidden rounded-[20px] bg-black shadow-sm">
      <Link href={`/news/${story.slug}`} className="group block h-full">
        {story.image_url ? (
          <ManagedImage
            src={story.image_url}
            alt={story.headline}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--muted)]">
            <Zap size={40} className="text-[var(--muted-foreground)]" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <span className="absolute left-5 top-5 rounded-lg bg-[var(--primary)] px-3.5 py-2 text-[12px] font-bold uppercase tracking-wide text-[var(--primary-foreground)]">
          Top Story
        </span>
        <div className="absolute bottom-8 left-7 right-7 z-10">
          <div className="flex items-center gap-2">
            {story.category && (
              <span className="text-[13px] font-bold uppercase tracking-wider text-[var(--secondary)] drop-shadow">
                {story.category}
              </span>
            )}
            <span className="text-[13px] text-white/75 drop-shadow">{timeAgo(story.published_hours_ago)}</span>
          </div>
          <h2 className="mt-2 text-[40px] font-bold leading-[1.2] text-white drop-shadow-md line-clamp-2">
            {story.headline}
          </h2>
          {story.summary && (
            <p className="mt-3 line-clamp-2 text-[17px] leading-[1.6] text-white/85 drop-shadow">
              {story.summary}
            </p>
          )}
        </div>
      </Link>
      {stories.length > 1 && (
        <div className="absolute bottom-[18px] left-1/2 flex -translate-x-1/2 gap-2">
          {stories.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all ${i === current ? "w-[22px] bg-[var(--primary)]" : "w-[10px] bg-white/40 hover:bg-white/60"}`}
              style={{ height: 4 }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Trending Headlines ──────────────────────────────────────────────────
function TrendingHeadlines({ stories, timeAgo }) {
  if (!stories.length) return null;

  return (
    <div className="flex flex-col gap-[18px]">
      {stories.map((s) => (
        <Link
          key={s.id}
          href={`/news/${s.slug}`}
          className="group flex items-start gap-[14px]"
        >
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
            {s.image_url ? (
              <ManagedImage
                src={s.image_url}
                alt=""
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[var(--muted)]">
                <Zap size={18} className="text-[var(--muted-foreground)]" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-bold uppercase tracking-wider text-[var(--primary)]">
                {s.category || "General"}
              </span>
              <span className="text-[12px] text-[var(--muted-foreground)]">{timeAgo(s.published_hours_ago)}</span>
            </div>
            <p className="mt-1 text-[18px] font-semibold leading-[1.4] text-[var(--foreground)] transition-colors group-hover:text-[var(--primary)] line-clamp-2">
              {s.headline}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

// ─── Latest News Widget ──────────────────────────────────────────────────
function LatestNewsWidget({ stories, timeAgo }) {
  if (!stories.length) return null;

  return (
    <div className="flex flex-col rounded-[18px] news-card-surface p-5">
      <div className="mb-5 flex items-center gap-[10px]">
        <div className="flex h-5 w-5 items-center justify-center text-[var(--primary)]">
          <Plus size={16} />
        </div>
        <h3 className="text-[20px] font-bold uppercase text-[var(--foreground)]">Latest News</h3>
      </div>
      <div className="flex flex-col">
        {stories.map((s, i) => (
          <div key={s.id} className={i < stories.length - 1 ? "border-b border-[var(--border)] pb-4 mb-4" : ""}>
            <Link href={`/news/${s.slug}`} className="group flex items-start gap-3">
              <span className="mt-[3px] shrink-0 text-[var(--primary)]">
                <Plus size={13} />
              </span>
              <div>
                <span className="text-[12px] text-[var(--muted-foreground)]">{timeAgo(s.published_hours_ago)}</span>
                <p className="mt-0.5 text-[15px] font-medium leading-snug text-[var(--foreground)] transition-colors group-hover:text-[var(--primary)] line-clamp-2">
                  {s.headline}
                </p>
              </div>
            </Link>
          </div>
        ))}
      </div>
      <Link
        href="/news/headlines"
        className="mt-5 flex h-[46px] w-full items-center justify-center gap-1.5 rounded-xl bg-[var(--primary)] text-[14px] font-semibold text-[var(--primary-foreground)] transition hover:shadow-md active:scale-[0.97]"
      >
        View All Latest News
      </Link>
    </div>
  );
}

// ─── Newsletter Widget ────────────────────────────────────────────────────
function NewsletterWidget() {
  const emailId = useId();
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle");
  const [error, setError] = useState("");

  const validate = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setState("loading");
    await new Promise((r) => setTimeout(r, 1000));
    setState("success");
  }

  if (state === "success") {
    return (
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--anslation-ds-success-soft)] text-[var(--anslation-ds-success)]">
          <Check size={18} />
        </div>
        <p className="font-semibold text-[var(--foreground)]">You&apos;re subscribed!</p>
        <p className="text-sm text-[var(--muted-foreground)]">Check your inbox for the latest news.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-[66px] w-[66px] shrink-0 items-center justify-center rounded-[18px] bg-[var(--primary)]/10 text-[var(--primary)]">
          <Mail size={30} />
        </div>
        <div>
          <h3 className="text-[18px] font-bold uppercase text-[var(--foreground)]">
            Subscribe to Newsletter
          </h3>
          <p className="mt-[6px] max-w-[240px] text-[14px] leading-[1.6] text-[var(--muted-foreground)]">
            Get the latest news delivered to your inbox daily.
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-6 flex items-center gap-3">
        <div className="flex-1">
          <label htmlFor={emailId} className="sr-only">Email address</label>
          <input
            id={emailId}
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            placeholder="Enter your email"
            className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3.5 text-[14px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] transition focus:border-[var(--primary)] focus:bg-[var(--card)] focus:shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10"
          />
        </div>
        <button
          type="submit"
          disabled={state === "loading"}
          className="flex h-11 w-[120px] shrink-0 items-center justify-center rounded-xl news-action px-4 text-[14px] font-semibold transition hover:-translate-y-0.5 active:scale-[0.97] disabled:opacity-60"
        >
          {state === "loading" ? "Loading…" : "Subscribe"}
        </button>
      </form>
      {error && <p className="mt-2 text-xs text-[var(--anslation-ds-danger)]">{error}</p>}

      {/* Privacy */}
      <p className="mt-4 text-[12px] leading-[1.5] text-[var(--muted-foreground)]">
        We respect your privacy. Unsubscribe anytime.
      </p>
    </div>
  );
}

// ─── Follow Us ────────────────────────────────────────────────────────────
const SOCIAL_LINKS = [
  { name: "Facebook", href: "https://facebook.com", icon: "f", action: "Like" },
  { name: "Twitter", href: "https://twitter.com", icon: "X", action: "Follow" },
  { name: "Instagram", href: "https://instagram.com", icon: "in", action: "Follow" },
  { name: "YouTube", href: "https://youtube.com", icon: "▶", action: "Subscribe" },
];

function FollowUs() {
  return (
    <div>
      <h3 className="mb-5 text-[20px] font-bold uppercase text-[var(--foreground)]">Follow Us</h3>
      <div className="flex flex-col">
        {SOCIAL_LINKS.map((s, i) => (
          <a
            key={s.name}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex items-center justify-between py-3.5 ${i < SOCIAL_LINKS.length - 1 ? "border-b border-[var(--border)]" : ""}`}
          >
            <div className="flex items-center gap-[14px]">
              <div className="news-social-icon flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full text-[13px] font-bold">
                {s.icon}
              </div>
              <span className="text-[15px] font-semibold text-[var(--foreground)]">{s.name}</span>
            </div>
            <span className="cursor-pointer text-[14px] font-semibold text-[var(--primary)] transition hover:underline">
              {s.action}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────
export default function NewsHome({ initialNewsData }) {
  const articles = initialNewsData || [];

  // Sort by published_hours_ago for a consistent order
  const sorted = useMemo(() => {
    return [...articles].sort((a, b) => a.published_hours_ago - b.published_hours_ago);
  }, [articles]);

  const topStory = sorted[0];
  const sideStories = sorted.slice(1, 5);
  const usedIds = new Set([topStory?.id, ...sideStories.map((s) => s.id)].filter(Boolean));

  const latestNews = useMemo(() => {
    return sorted.filter((a) => !usedIds.has(a.id)).slice(0, 4);
  }, [sorted, usedIds]);

  const topNews = useMemo(() => {
    const exclude = new Set([...usedIds, ...latestNews.map((a) => a.id)]);
    return sorted.filter((a) => !exclude.has(a.id)).slice(0, 6);
  }, [sorted, usedIds, latestNews]);

  const [trendingTab, setTrendingTab] = useState("trending");

  const trending = useMemo(() => {
    const sorted = [...articles];
    if (trendingTab === "trending") {
      sorted.sort((a, b) => (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares));
    } else if (trendingTab === "mostread") {
      sorted.sort((a, b) => (b.likes) - (a.likes));
    } else if (trendingTab === "editorspicks") {
      sorted.sort((a, b) => (b.shares) - (a.shares));
    }
    return sorted.slice(0, 6);
  }, [articles, trendingTab]);

  const moreNews = useMemo(() => {
    const exclude = new Set([...usedIds, ...latestNews.map((a) => a.id), ...topNews.map((a) => a.id)]);
    return sorted.filter((a) => !exclude.has(a.id)).slice(0, 4);
  }, [sorted, usedIds, latestNews, topNews]);

  if (!articles.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] p-12 text-center">
        <p className="text-sm text-[var(--muted-foreground)]">No news available at the moment.</p>
      </div>
    );
  }

  return (
    <div>
      {/* ── Trending Bar ──────────────────────────────────────────────── */}
      <div className="mx-auto mt-2 w-full max-w-[1440px] rounded-2xl news-soft-surface py-3 shadow-sm">
        <div className="mx-auto flex items-center gap-6 px-4 md:px-8 lg:px-12">
          <span className="flex shrink-0 items-center gap-1.5 text-[13px] font-bold uppercase tracking-[1px] text-[var(--primary)]">
            <Zap size={16} />
            Trending Now
          </span>
          <div className="flex items-center gap-6 overflow-x-auto scrollbar-thin">
            {[
              { label: "Election", href: "/news/topics/election" },
              { label: "G20 Summit", href: "/news/topics/g20-summit" },
              { label: "India vs Australia", href: "/news/topics/india-vs-australia" },
              { label: "ISRO", href: "/news/topics/isro" },
              { label: "Artificial Intelligence", href: "/news/topics/artificial-intelligence" },
            ].map((tag, i) => (
              <span key={tag.label} className="flex items-center gap-6">
                {i > 0 && <span className="text-[var(--border)]">•</span>}
                <Link
                  href={tag.href}
                  className="whitespace-nowrap text-[14px] font-bold text-[var(--muted-foreground)] transition-colors hover:text-[var(--primary)]"
                >
                  {tag.label}
                </Link>
              </span>
            ))}
          </div>
          <Link
            href="/news/trending"
            className="ml-auto shrink-0 text-[14px] font-bold text-[var(--primary)] hover:underline"
          >
            View All
          </Link>
        </div>
      </div>

      {/* ── Hero Section (3-column) ──────────────────────────────────── */}
      <section className="mx-auto mt-8 max-w-[1440px] rounded-2xl news-card-surface px-6 py-6 sm:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-[2.2fr_1fr_0.9fr]">
          <div className="md:col-span-2 lg:col-span-1">
            <HeroSlider stories={sorted.slice(0, 5)} timeAgo={timeAgo} formatCount={formatCount} />
          </div>
          <TrendingHeadlines stories={sideStories} timeAgo={timeAgo} />
          <LatestNewsWidget stories={latestNews} timeAgo={timeAgo} />
        </div>
      </section>

      {/* ── Categories Slider ────────────────────────────────────────── */}
      <div className="mt-3">
        <CategoriesSection articles={articles} />
      </div>

      {/* ── Top News + Sidebar (70/30) ───────────────────────────────── */}
      <div className="mt-3 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Main Content – 8/12 (≈70%) */}
        <div className="lg:col-span-8">
          <div className="rounded-2xl news-card-surface px-6 py-6 sm:px-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-[22px] font-bold uppercase text-[var(--foreground)]">Top News</h2>
              <Link
                href="/news"
                className="text-[15px] font-semibold text-[var(--primary)] hover:underline"
              >
                View All
              </Link>
            </div>

            {topNews.length > 0 ? (
              <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
                {topNews.map((item) => (
                  <TopNewsCard key={item.id} news={item} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] px-6 py-14 text-center">
                <p className="text-sm text-[var(--muted-foreground)]">No stories to show.</p>
              </div>
            )}
          </div>

          {/* ── More News ──────────────────────────────────────────────── */}
          {moreNews.length > 0 && (
            <div className="mt-3 overflow-hidden rounded-2xl news-card-surface px-6 py-5 sm:px-8 sm:py-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-[22px] font-bold uppercase text-[var(--foreground)]">More News</h2>
                <Link
                  href="/news/headlines"
                  className="text-[15px] font-medium text-[var(--primary)] hover:underline"
                >
                  View All
                </Link>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {moreNews.map((item) => (
                  <MoreNewsRow key={item.id} news={item} />
                ))}
              </div>
              <Link
                href="/news/headlines"
                className="mx-auto mt-7 flex h-11 w-[200px] items-center justify-center gap-2 rounded-full bg-[var(--muted)] text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)]"
              >
                Load More News <ChevronDown size={14} />
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar – 4/12 (≈30%) */}
        <aside className="lg:col-span-4">
          <div className="space-y-3 lg:sticky lg:top-8">
            {/* Popular / Trending */}
            {trending.length > 0 && (
              <div className="overflow-hidden rounded-[20px] news-card-surface p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-[22px] font-bold uppercase text-[var(--foreground)]">Trending Now</h3>
                  <Link
                    href="/news/trending"
                    className="text-[15px] font-semibold text-[var(--primary)] hover:underline"
                  >
                    View All
                  </Link>
                </div>
                <div className="mb-5 flex gap-8">
                  {[
                    { key: "trending", label: "Trending" },
                    { key: "mostread", label: "Most Read" },
                    { key: "editorspicks", label: "Editor's Picks" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setTrendingTab(tab.key)}
                      aria-pressed={trendingTab === tab.key}
                      className={`relative py-3 -my-3 text-sm font-medium transition ${trendingTab === tab.key
                          ? "font-semibold text-[var(--primary)]"
                          : "text-[var(--muted-foreground)] hover:text-[var(--primary)]"
                        }`}
                    >
                      {tab.label}
                      {trendingTab === tab.key && (
                        <span className="absolute bottom-2 left-0 right-0 h-[3px] rounded-sm bg-[var(--primary)]" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="space-y-[18px]">
                  {trending.slice(0, 5).map((item, index) => (
                    <TrendingItem key={item.id} news={item} rank={index + 1} />
                  ))}
                </div>
              </div>
            )}

            {/* Newsletter Widget */}
            <div className="rounded-2xl news-card-surface p-6">
              <NewsletterWidget />
            </div>

            {/* Follow Us */}
            <div className="rounded-2xl news-card-surface p-6">
              <FollowUs />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ─── Top News Card ────────────────────────────────────────────────────────
function TopNewsCard({ news }) {
  const [saved, setSaved] = useState(false);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl news-card-surface transition-all duration-300 hover:-translate-y-1">
      <Link href={`/news/${news.slug}`}>
        <div className="relative h-[200px] overflow-hidden">
          {news.image_url ? (
            <ManagedImage
              src={news.image_url}
              alt={news.headline}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[var(--muted)]">
              <Zap size={24} className="text-[var(--muted-foreground)]" />
            </div>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col px-4 pb-4 pt-[14px]">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-bold uppercase tracking-wider text-[var(--primary)]">
            {news.category || "General"}
          </span>
          <span className="text-[12px] text-[var(--muted-foreground)]">
            {timeAgo(news.published_hours_ago)}
          </span>
        </div>
        <Link href={`/news/${news.slug}`}>
          <h3 className="mt-[6px] text-xl font-bold leading-[1.35] text-[var(--foreground)] transition-colors group-hover:text-[var(--primary)] line-clamp-2">
            {news.headline}
          </h3>
        </Link>
        {news.summary && (
          <p className="mt-2 line-clamp-2 text-[14px] leading-[1.6] text-[var(--muted-foreground)]">
            {news.summary}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="flex items-center gap-[6px] text-[13px] font-medium text-[var(--muted-foreground)]">
            <Eye size={14} />
            {formatCount(news.likes + news.comments + news.shares)} views
          </span>
          <button
            onClick={(e) => { e.preventDefault(); setSaved((v) => !v); }}
            aria-label={saved ? "Unsave" : "Save"}
            className={`flex h-11 w-11 -m-3 items-center justify-center transition ${saved ? "text-[var(--primary)]" : "text-[var(--muted-foreground)] hover:text-[var(--primary)]"}`}
          >
            <Bookmark size={16} className={saved ? "fill-[var(--primary)]" : ""} />
          </button>
        </div>
      </div>
    </article>
  );
}

// ─── Trending Item (sidebar) ──────────────────────────────────────────────
function TrendingItem({ news, rank }) {
  const readTime = Math.max(3, Math.ceil(news.headline.length / 100) * 3);

  return (
    <Link href={`/news/${news.slug}`} className="group flex items-center gap-[14px]">
      <span className="flex w-[42px] shrink-0 justify-center text-[32px] font-bold text-[var(--border)]">
        {String(rank).padStart(2, "0")}
      </span>
      <div className="relative h-[60px] w-[60px] shrink-0 overflow-hidden rounded-[10px]">
        {news.image_url ? (
          <ManagedImage
            src={news.image_url}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[var(--muted)] text-[var(--muted-foreground)]">
            <Zap size={18} />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-[6px] min-w-0">
        <p className="text-[15px] font-semibold leading-[1.4] text-[var(--foreground)] transition-colors group-hover:text-[var(--primary)] line-clamp-2">
          {news.headline}
        </p>
        <span className="text-[13px] font-medium text-[var(--muted-foreground)]">
          {readTime} min read &bull; {formatCount(news.likes + news.comments + news.shares)} views
        </span>
      </div>
      <span className="shrink-0 text-base text-[var(--muted-foreground)] transition group-hover:translate-x-0.5 group-hover:text-[var(--primary)]">
        &gt;
      </span>
    </Link>
  );
}

// ─── More News Row ────────────────────────────────────────────────────────
function MoreNewsRow({ news }) {
  const [saved, setSaved] = useState(false);

  return (
    <div className="group flex items-start justify-between py-4">
      <div className="flex flex-1 gap-4">
        <div className="relative h-[60px] w-[80px] shrink-0 overflow-hidden rounded-[10px]">
          {news.image_url ? (
            <ManagedImage
              src={news.image_url}
              alt=""
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[var(--muted)]">
              <Zap size={16} className="text-[var(--muted-foreground)]" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-[6px]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--primary)]">
              {news.category || "General"}
            </span>
            <span className="text-xs text-[var(--muted-foreground)]">
              {timeAgo(news.published_hours_ago)}
            </span>
          </div>
          <p className="mt-[4px] text-lg font-bold leading-[1.3] text-[var(--foreground)] transition-colors group-hover:text-[var(--primary)] line-clamp-2">
            {news.headline}
          </p>
          {news.summary && (
            <p className="mt-[6px] text-sm leading-[1.5] text-[var(--muted-foreground)] line-clamp-2">
              {news.summary}
            </p>
          )}
        </div>
      </div>
      <div className="ml-5 flex shrink-0 flex-col items-end justify-center gap-[10px]">
        <span className="text-[13px] font-medium text-[var(--muted-foreground)]">
          {formatCount(news.likes + news.comments + news.shares)} views
        </span>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSaved((v) => !v); }}
          aria-label={saved ? "Unsave" : "Save"}
          className={`flex h-11 w-11 -m-2.5 items-center justify-center rounded transition ${saved ? "text-[var(--primary)]" : "text-[var(--muted-foreground)] hover:text-[var(--primary)]"}`}
        >
          <Bookmark size={16} className={saved ? "fill-[var(--primary)]" : ""} />
        </button>
      </div>
    </div>
  );
}
