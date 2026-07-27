"use client";

import { useMemo, useState, useId } from "react";
import Link from "next/link";
import {
  ChevronDown, Mail, Check, Eye, Bookmark, Zap,
} from "lucide-react";
import ManagedImage from "@/components/ui/ManagedImage";
import CategoriesSection from "./CategoriesSection";

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
      <div className="flex items-start gap-4">
        <div className="flex h-[66px] w-[66px] shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
          <Mail size={30} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[var(--foreground)]">
            Subscribe to Newsletter
          </h3>
          <p className="mt-[6px] max-w-[240px] text-[14px] leading-[1.6] text-[var(--muted-foreground)]">
            Get the latest news delivered to your inbox daily.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex items-center gap-3">
        <div className="flex-1">
          <label htmlFor={emailId} className="sr-only">Email address</label>
          <input
            id={emailId}
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            placeholder="Enter your email"
            className="h-11 w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3.5 text-[14px] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] transition focus:border-[var(--primary)] focus:bg-[var(--card)] focus:shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10"
          />
        </div>
        <button
          type="submit"
          disabled={state === "loading"}
          className="flex h-11 w-[120px] shrink-0 items-center justify-center rounded-md news-action px-4 text-[14px] font-semibold transition hover:-translate-y-0.5 active:scale-[0.97] disabled:opacity-60"
        >
          {state === "loading" ? "Loading\u2026" : "Subscribe"}
        </button>
      </form>
      {error && <p className="mt-2 text-xs text-[var(--danger-text)]">{error}</p>}

      <p className="mt-4 text-[12px] leading-[1.5] text-[var(--muted-foreground)]">
        We respect your privacy. Unsubscribe anytime.
      </p>
    </div>
  );
}

const SOCIAL_LINKS = [
  { name: "Facebook", href: "https://facebook.com", icon: "f", action: "Like" },
  { name: "Twitter", href: "https://twitter.com", icon: "X", action: "Follow" },
  { name: "Instagram", href: "https://instagram.com", icon: "in", action: "Follow" },
  { name: "YouTube", href: "https://youtube.com", icon: "\u25B6", action: "Subscribe" },
];

function FollowUs() {
  return (
    <div>
      <h3 className="mb-5 text-lg font-semibold text-[var(--foreground)]">Follow Us</h3>
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
            <span className="cursor-pointer text-[14px] font-semibold text-[var(--primary-text)] transition hover:underline">
              {s.action}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

function TopNewsCard({ news }) {
  const [saved, setSaved] = useState(false);

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg news-card-surface hover:-translate-y-1">
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
          <span className="text-[12px] font-bold uppercase tracking-wider text-[var(--primary-text)]">
            {news.category || "General"}
          </span>
          <span className="text-[12px] text-[var(--muted-foreground)]">
            {timeAgo(news.published_hours_ago)}
          </span>
        </div>
        <Link href={`/news/${news.slug}`}>
          <h3 className="mt-[6px] text-xl font-bold leading-[1.35] text-[var(--foreground)] transition-colors group-hover:text-[var(--primary-text)] line-clamp-2">
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
            className={`-m-3 flex h-11 w-11 items-center justify-center transition ${saved ? "text-[var(--primary)]" : "text-[var(--muted-foreground)] hover:text-[var(--primary)]"}`}
          >
            <Bookmark size={16} className={saved ? "fill-[var(--primary)]" : ""} />
          </button>
        </div>
      </div>
    </article>
  );
}

function TrendingItem({ news, rank }) {
  const readTime = Math.max(3, Math.ceil(news.headline.length / 100) * 3);

  return (
    <Link href={`/news/${news.slug}`} className="group flex items-center gap-[14px]">
      <span className="flex w-[42px] shrink-0 justify-center text-[32px] font-bold text-[var(--muted-foreground)]">
        {String(rank).padStart(2, "0")}
      </span>
      <div className="relative h-[60px] w-[60px] shrink-0 overflow-hidden rounded-md">
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
        <p className="text-[15px] font-semibold leading-[1.4] text-[var(--foreground)] transition-colors group-hover:text-[var(--primary-text)] line-clamp-2">
          {news.headline}
        </p>
        <span className="text-[13px] font-medium text-[var(--muted-foreground)]">
          {readTime} min read &bull; {formatCount(news.likes + news.comments + news.shares)} views
        </span>
      </div>
      <span className="shrink-0 text-base text-[var(--muted-foreground)] transition group-hover:translate-x-0.5 group-hover:text-[var(--primary-text)]">
        &gt;
      </span>
    </Link>
  );
}

function MoreNewsRow({ news }) {
  const [saved, setSaved] = useState(false);

  return (
    <div className="group flex items-start justify-between py-4">
      <div className="flex flex-1 gap-4">
        <div className="relative h-[60px] w-[80px] shrink-0 overflow-hidden rounded-md">
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
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--primary-text)]">
              {news.category || "General"}
            </span>
            <span className="text-xs text-[var(--muted-foreground)]">
              {timeAgo(news.published_hours_ago)}
            </span>
          </div>
          <p className="mt-[4px] text-lg font-bold leading-[1.3] text-[var(--foreground)] transition-colors group-hover:text-[var(--primary-text)] line-clamp-2">
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
          className={`flex h-6 w-6 items-center justify-center rounded transition ${saved ? "text-[var(--primary)]" : "text-[var(--muted-foreground)] hover:text-[var(--primary)]"}`}
        >
          <Bookmark size={16} className={saved ? "fill-[var(--primary)]" : ""} />
        </button>
      </div>
    </div>
  );
}

const TRENDING_TAGS = [
  { label: "Election", href: "/news/topics/election" },
  { label: "G20 Summit", href: "/news/topics/g20-summit" },
  { label: "India vs Australia", href: "/news/topics/india-vs-australia" },
  { label: "ISRO", href: "/news/topics/isro" },
  { label: "Artificial Intelligence", href: "/news/topics/artificial-intelligence" },
];

export default function NewsListing({ title, articles = [], description }) {
  const sorted = useMemo(() => {
    return [...articles].sort((a, b) => a.published_hours_ago - b.published_hours_ago);
  }, [articles]);

  const topNews = useMemo(() => sorted.slice(0, 9), [sorted]);
  const moreNews = useMemo(() => sorted.slice(9, 13), [sorted]);

  const [trendingTab, setTrendingTab] = useState("trending");

  const trending = useMemo(() => {
    const s = [...articles];
    if (trendingTab === "trending") {
      s.sort((a, b) => (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares));
    } else if (trendingTab === "mostread") {
      s.sort((a, b) => (b.likes) - (a.likes));
    } else if (trendingTab === "editorspicks") {
      s.sort((a, b) => (b.shares) - (a.shares));
    }
    return s.slice(0, 6);
  }, [articles, trendingTab]);

  if (!articles.length) {
    return (
      <div className="space-y-8">
        <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface)] p-12 text-center">
          <p className="text-sm text-[var(--muted-foreground)]">No stories found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Trending Bar ──────────────────────────────────────────────── */}
      <div className="mt-[8px] w-full rounded-lg border border-[var(--border)] bg-[var(--muted)] py-3 shadow-sm">
        <div className="mx-auto flex items-center gap-6 px-4 md:px-8 lg:px-12">
          <span className="flex shrink-0 items-center gap-1.5 text-[13px] font-bold uppercase tracking-[1px] text-[var(--primary-text)]">
            <Zap size={16} />
            Trending Now
          </span>
          <div className="flex items-center gap-6 overflow-x-auto scrollbar-thin">
            {TRENDING_TAGS.map((tag, i) => (
              <span key={tag.label} className="flex items-center gap-6">
                {i > 0 && <span className="text-[var(--border)]">•</span>}
                <Link
                  href={tag.href}
                  className="whitespace-nowrap text-[14px] font-bold text-[var(--muted-foreground)] transition-colors hover:text-[var(--primary-text)]"
                >
                  {tag.label}
                </Link>
              </span>
            ))}
          </div>
          <Link
            href="/news/trending"
            className="ml-auto shrink-0 text-[14px] font-bold text-[var(--primary-text)] hover:underline"
          >
            View All
          </Link>
        </div>
      </div>

      {/* ── Page Title ────────────────────────────────────────────────── */}
      <section className="rounded-lg news-card-surface px-6 py-6 sm:px-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">{title}</h1>
            {description && (
              <p className="mt-1 text-[15px] text-[var(--muted-foreground)]">{description}</p>
            )}
          </div>
          <Link
            href="/news"
            className="flex min-h-11 shrink-0 items-center text-[15px] font-semibold text-[var(--primary-text)] hover:underline"
          >
            Back to Home
          </Link>
        </div>
      </section>

      {/* ── Categories Slider ────────────────────────────────────────── */}
      <div className="-mt-[22px]">
        <CategoriesSection articles={articles} />
      </div>

      {/* ── Top News + Sidebar (70/30) ───────────────────────────────── */}
      <div className="-mt-[22px] grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Main Content – 8/12 (≈70%) */}
        <div className="lg:col-span-8">
          <div className="rounded-lg news-card-surface px-6 py-6 sm:px-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[var(--foreground)]">{title}</h2>
            </div>

            {topNews.length > 0 ? (
              <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
                {topNews.map((item) => (
                  <TopNewsCard key={item.id} news={item} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--card)] px-6 py-14 text-center">
                <p className="text-sm text-[var(--muted-foreground)]">No stories to show.</p>
              </div>
            )}
          </div>

          {/* ── More News ──────────────────────────────────────────────── */}
          {moreNews.length > 0 && (
            <div className="mt-[10px] overflow-hidden rounded-lg news-card-surface px-6 py-5 sm:px-8 sm:py-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[var(--foreground)]">More News</h2>
                <Link
                  href="/news/headlines"
                  className="flex min-h-11 items-center text-[15px] font-medium text-[var(--primary-text)] hover:underline"
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
          <div className="space-y-[10px] lg:sticky lg:top-8">
            {/* Popular / Trending */}
            {trending.length > 0 && (
              <div className="overflow-hidden rounded-lg news-card-surface p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[var(--foreground)]">Trending Now</h3>
                  <Link
                    href="/news/trending"
                    className="flex min-h-11 items-center text-[15px] font-semibold text-[var(--primary-text)] hover:underline"
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
                      onClick={() => setTrendingTab(tab.key)}
                      className={`relative text-sm font-medium transition ${
                        trendingTab === tab.key
                          ? "font-semibold text-[var(--primary-text)]"
                          : "text-[var(--muted-foreground)] hover:text-[var(--primary-text)]"
                      }`}
                    >
                      {tab.label}
                      {trendingTab === tab.key && (
                        <span className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-sm bg-[var(--primary)]" />
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
            <div className="rounded-lg news-card-surface p-6">
              <NewsletterWidget />
            </div>

            {/* Follow Us */}
            <div className="rounded-lg news-card-surface p-6">
              <FollowUs />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
