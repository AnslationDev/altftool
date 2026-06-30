"use client";

import { useMemo, useState, useId } from "react";
import Link from "next/link";
import {
  ChevronRight, Mail, ArrowRight, Check, Clock, Eye,
  Bookmark, Heart, TrendingUp, Facebook, Twitter, Youtube,
  Instagram, ExternalLink, Zap,
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

// ─── Side Story Card ──────────────────────────────────────────────────────
function SideStoryCard({ news }) {
  return (
    <Link href={`/news/${news.slug}`} className="group flex gap-4">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
        {news.image_url ? (
          <ManagedImage
            src={news.image_url}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[var(--muted)] text-[var(--muted-foreground)]">
            <Zap size={16} />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--primary)]">
          {news.category || "General"}
        </span>
        <p className="mt-1 text-sm font-semibold leading-snug text-[var(--foreground)] transition-colors group-hover:text-[var(--primary)] line-clamp-2">
          {news.headline}
        </p>
        <span className="mt-1.5 flex items-center gap-1 text-[11px] text-[var(--muted-foreground)]">
          <Clock size={10} />
          {timeAgo(news.published_hours_ago)}
        </span>
      </div>
    </Link>
  );
}

// ─── Latest News Item ─────────────────────────────────────────────────────
function LatestNewsItem({ news }) {
  return (
    <Link href={`/news/${news.slug}`} className="group flex items-start gap-4 py-2.5">
      <span className="mt-0.5 shrink-0 text-xs font-medium text-[var(--primary)] tabular-nums">
        {timeAgo(news.published_hours_ago)}
      </span>
      <p className="flex-1 text-sm font-medium leading-snug text-[var(--foreground)] transition-colors group-hover:text-[var(--primary)] line-clamp-2">
        {news.headline}
      </p>
      <ChevronRight size={14} className="mt-0.5 shrink-0 text-[var(--muted-foreground)] opacity-0 transition-opacity group-hover:opacity-100" />
    </Link>
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
    <div className="flex flex-col items-center text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
        <Mail size={18} />
      </div>
      <h3 className="mt-4 text-base font-bold text-[var(--foreground)]">Newsletter</h3>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
        Get the latest news delivered to your inbox.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 w-full space-y-3">
        <div>
          <label htmlFor={emailId} className="sr-only">Email address</label>
          <input
            id={emailId}
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            placeholder="Enter your email"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
          {error && <p className="mt-1.5 text-xs text-[var(--anslation-ds-danger)]">{error}</p>}
        </div>
        <button
          type="submit"
          disabled={state === "loading"}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] transition hover:opacity-90 disabled:opacity-60"
        >
          {state === "loading" ? "Subscribing…" : "Subscribe"}
          <ArrowRight size={13} />
        </button>
      </form>
      <p className="mt-3 text-xs text-[var(--muted-foreground)]">No spam. Unsubscribe anytime.</p>
    </div>
  );
}

// ─── Follow Us ────────────────────────────────────────────────────────────
const SOCIAL_LINKS = [
  { icon: Facebook, label: "Facebook", href: "https://facebook.com", color: "hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500/30" },
  { icon: Twitter, label: "Twitter", href: "https://twitter.com", color: "hover:bg-sky-400/10 hover:text-sky-400 hover:border-sky-400/30" },
  { icon: Instagram, label: "Instagram", href: "https://instagram.com", color: "hover:bg-pink-500/10 hover:text-pink-500 hover:border-pink-500/30" },
  { icon: Youtube, label: "Youtube", href: "https://youtube.com", color: "hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30" },
];

function FollowUs() {
  return (
    <div>
      <h3 className="mb-5 text-sm font-bold text-[var(--foreground)]">Follow Us</h3>
      <div className="space-y-3">
        {SOCIAL_LINKS.map(({ icon: Icon, label, href, color }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 rounded-xl border border-[var(--border)] px-4 py-3.5 text-sm font-medium text-[var(--muted-foreground)] transition-all ${color}`}
          >
            <Icon size={16} />
            <span className="flex-1">{label}</span>
            <ExternalLink size={13} className="opacity-40" />
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
    return sorted.filter((a) => !usedIds.has(a.id)).slice(0, 6);
  }, [sorted, usedIds]);

  const topNews = useMemo(() => {
    const exclude = new Set([...usedIds, ...latestNews.map((a) => a.id)]);
    return sorted.filter((a) => !exclude.has(a.id)).slice(0, 6);
  }, [sorted, usedIds, latestNews]);

  const trending = useMemo(() => {
    return [...articles]
      .sort((a, b) => (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares))
      .slice(0, 6);
  }, [articles]);

  const moreNews = useMemo(() => {
    const exclude = new Set([...usedIds, ...latestNews.map((a) => a.id), ...topNews.map((a) => a.id)]);
    return sorted.filter((a) => !exclude.has(a.id)).slice(0, 4);
  }, [sorted, usedIds, latestNews, topNews]);

  if (!articles.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-12 text-center">
        <p className="text-sm text-[var(--muted-foreground)]">No news available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {/* ── Hero Section (3-column) ──────────────────────────────────── */}
      <section className="grid grid-cols-1 gap-6 pt-6 lg:grid-cols-12">
        {/* Hero Card – col-span-6 (50%) */}
        {topStory && (
          <div className="lg:col-span-6">
            <Link href={`/news/${topStory.slug}`} className="group relative block overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm transition-all hover:shadow-md">
              <div className="relative h-72 sm:h-80 lg:h-full">
                {topStory.image_url ? (
                  <ManagedImage
                    src={topStory.image_url}
                    alt={topStory.headline}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[var(--muted)]">
                    <Zap size={40} className="text-[var(--muted-foreground)]" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-7">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="rounded-full bg-[var(--primary)] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white">
                      Top Story
                    </span>
                    {topStory.category && (
                      <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
                        {topStory.category}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-extrabold leading-tight text-white sm:text-2xl lg:text-3xl">
                    {topStory.headline}
                  </h2>
                  {topStory.summary && (
                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-white/80">
                      {topStory.summary}
                    </p>
                  )}
                  <div className="mt-4 flex items-center gap-3 text-xs text-white/60">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {timeAgo(topStory.published_hours_ago)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={11} />
                      {formatCount(topStory.likes + topStory.comments + topStory.shares)} views
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Side Stories – col-span-3 (22%) */}
        {sideStories.length > 0 && (
          <div className="lg:col-span-3">
            <h3 className="mb-4 text-sm font-bold text-[var(--foreground)]">Latest Updates</h3>
            <div className="space-y-5">
              {sideStories.map((item) => (
                <SideStoryCard key={item.id} news={item} />
              ))}
            </div>
          </div>
        )}

        {/* Latest News – col-span-3 (28%) */}
        {latestNews.length > 0 && (
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
              <h3 className="mb-3 text-sm font-bold text-[var(--foreground)]">Latest News</h3>
              <div className="divide-y divide-[var(--border)]">
                {latestNews.map((item) => (
                  <LatestNewsItem key={item.id} news={item} />
                ))}
              </div>
              <Link
                href="/news/headlines"
                className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-[var(--muted)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--muted-foreground)]/20"
              >
                View All <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* ── Categories Slider ────────────────────────────────────────── */}
      <CategoriesSection articles={articles} />

      {/* ── Top News + Sidebar (70/30) ───────────────────────────────── */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Main Content – 8/12 (≈70%) */}
        <div className="lg:col-span-8">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--foreground)]">Top News</h2>
            <Link
              href="/news"
              className="flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] hover:underline"
            >
              View All <ChevronRight size={14} />
            </Link>
          </div>

          {topNews.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {topNews.map((item) => (
                <TopNewsCard key={item.id} news={item} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] px-6 py-14 text-center">
              <p className="text-sm text-[var(--muted-foreground)]">No stories to show.</p>
            </div>
          )}

          {/* ── More News ──────────────────────────────────────────────── */}
          {moreNews.length > 0 && (
            <div className="mt-10">
              <h2 className="mb-5 text-lg font-bold text-[var(--foreground)]">More News</h2>
              <div className="space-y-4">
                {moreNews.map((item) => (
                  <MoreNewsRow key={item.id} news={item} />
                ))}
              </div>
              <Link
                href="/news/headlines"
                className="mt-5 flex items-center justify-center gap-2.5 rounded-xl border border-[var(--border)] px-5 py-3.5 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--muted)]"
              >
                Load More <ChevronRight size={14} />
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar – 4/12 (≈30%) */}
        <aside className="lg:col-span-4">
          <div className="space-y-10 lg:sticky lg:top-8">
            {/* Popular / Trending */}
            {trending.length > 0 && (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[var(--foreground)]">Trending Now</h3>
                  <Link
                    href="/news/trending"
                    className="text-xs font-medium text-[var(--primary)] hover:underline"
                  >
                    View All
                  </Link>
                </div>
                <div className="space-y-4">
                  {trending.slice(0, 5).map((item, index) => (
                    <TrendingItem key={item.id} news={item} rank={index + 1} />
                  ))}
                </div>
              </div>
            )}

            {/* Newsletter Widget */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
              <NewsletterWidget />
            </div>

            {/* Follow Us */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
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
    <article className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <Link href={`/news/${news.slug}`} className="block">
        <div className="relative aspect-[16/9] overflow-hidden">
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
          {news.category && (
            <span className="absolute left-3 top-3 rounded-full bg-[var(--primary)]/90 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--primary-foreground)] backdrop-blur-sm">
              {news.category}
            </span>
          )}
        </div>
      </Link>
      <div className="p-5">
        <div className="flex items-center gap-2 text-[11px] text-[var(--muted-foreground)]">
          <span>{news.source || "Unknown"}</span>
          <span className="h-1 w-1 rounded-full bg-[var(--border)]" />
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {timeAgo(news.published_hours_ago)}
          </span>
        </div>
        <Link href={`/news/${news.slug}`}>
          <h3 className="mt-2.5 text-sm font-bold leading-snug text-[var(--foreground)] transition-colors group-hover:text-[var(--primary)] line-clamp-2">
            {news.headline}
          </h3>
        </Link>
        {news.summary && (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
            {news.summary}
          </p>
        )}
        <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-4">
          <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
            <Eye size={12} />
            {formatCount(news.likes + news.comments + news.shares)}
          </span>
          <button
            onClick={(e) => { e.preventDefault(); setSaved((v) => !v); }}
            aria-label={saved ? "Unsave" : "Save"}
            className={`flex items-center gap-1 text-xs font-medium transition ${saved ? "text-[var(--primary)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}
          >
            <Bookmark size={12} className={saved ? "fill-[var(--primary)]" : ""} />
            {saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>
    </article>
  );
}

// ─── Trending Item (sidebar) ──────────────────────────────────────────────
function TrendingItem({ news, rank }) {
  return (
    <Link href={`/news/${news.slug}`} className="group flex items-start gap-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-xs font-bold text-[var(--primary)]">
        {rank}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-snug text-[var(--foreground)] transition-colors group-hover:text-[var(--primary)] line-clamp-2">
          {news.headline}
        </p>
        <span className="mt-1.5 flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
          <Clock size={10} />
          {timeAgo(news.published_hours_ago)}
        </span>
      </div>
    </Link>
  );
}

// ─── More News Row ────────────────────────────────────────────────────────
function MoreNewsRow({ news }) {
  const [saved, setSaved] = useState(false);

  return (
    <Link href={`/news/${news.slug}`} className="group flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition-all hover:shadow-sm">
      <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg">
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
        <p className="text-sm font-semibold leading-snug text-[var(--foreground)] transition-colors group-hover:text-[var(--primary)] line-clamp-1">
          {news.headline}
        </p>
        <span className="mt-1.5 flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {timeAgo(news.published_hours_ago)}
          </span>
          <span className="flex items-center gap-1">
            <Eye size={10} />
            {formatCount(news.likes + news.comments + news.shares)}
          </span>
        </span>
      </div>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSaved((v) => !v); }}
        aria-label={saved ? "Unsave" : "Save"}
        className={`shrink-0 rounded-lg p-1.5 transition ${saved ? "text-[var(--primary)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}
      >
        <Bookmark size={14} className={saved ? "fill-[var(--primary)]" : ""} />
      </button>
    </Link>
  );
}
