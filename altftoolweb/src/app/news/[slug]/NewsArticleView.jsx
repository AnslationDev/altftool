"use client";

import { useState, useRef, useEffect, useId } from "react";
import Link from "next/link";
import {
  Heart, Bookmark, Clock, MapPin, Link2,
  Twitter, Facebook, Check, ChevronRight, User, Send,
  MessageCircle, Mail, Eye, Zap, Linkedin,
} from "lucide-react";
import ManagedImage from "@/components/ui/ManagedImage";
import NewsCard from "../components/ui/NewsCard";

function formatCount(n = 0) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function timeAgo(h) {
  if (!h && h !== 0) return "";
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? "1 day ago" : `${d} days ago`;
}

function slugify(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const CATEGORY_STYLE = {
  politics: "news-category-pill",
  tech: "news-category-pill",
  business: "news-category-pill",
  science: "news-category-pill",
  sports: "news-category-pill",
  health: "news-category-pill",
  world: "news-category-pill",
  entertainment: "news-category-pill",
};

function getCategoryStyle(cat) {
  return CATEGORY_STYLE[cat?.toLowerCase()] ?? "news-category-pill";
}

// ─── Reading Progress Bar ──────────────────────────────────────────────────
function ReadingProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrollTop = el.scrollTop || document.body.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      setPct(scrollHeight ? Math.min(100, (scrollTop / scrollHeight) * 100) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed left-0 top-0 z-50 h-[3px] w-full bg-[var(--border)]">
      <div className="h-full bg-[var(--primary)] transition-[width] duration-100" style={{ width: `${pct}%` }} />
    </div>
  );
}

// ─── Share Sheet ────────────────────────────────────────────────────────────
function ShareSheet({ headline }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2">
      <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(headline)}&url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]" aria-label="Share on Twitter">
        <Twitter size={15} />
      </a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]" aria-label="Share on Facebook">
        <Facebook size={15} />
      </a>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]" aria-label="Share on LinkedIn">
        <Linkedin size={15} />
      </a>
      <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(headline + " " + url)}`} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:bg-[var(--primary)]/10 hover:text-[var(--primary)]" aria-label="Share on WhatsApp">
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </a>
      <button onClick={copy} className={`flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-medium transition ${copied ? "border-[var(--anslation-ds-success-soft)] bg-[var(--anslation-ds-success-soft)] text-[var(--anslation-ds-success)]" : "border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"}`} aria-label="Copy link">
        {copied ? <Check size={13} /> : <Link2 size={13} />}
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}

// ─── Sticky Action Bar ─────────────────────────────────────────────────────
function ActionBar({ article, likes, liked, setLiked, setLikes, comments, commentRef, saved, setSaved }) {
  return (
    <div className="sticky top-3 z-40 mx-auto flex max-w-max items-center gap-1 rounded-2xl border border-[var(--border)] bg-[var(--card)]/80 px-3 py-2 shadow-md backdrop-blur-md">
      <button onClick={() => { setLiked((v) => !v); setLikes((l) => liked ? l - 1 : l + 1); }} aria-label={liked ? "Unlike" : "Like"} title="Local to this session — resets on refresh" className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all ${liked ? "bg-[var(--anslation-ds-danger-soft)] text-[var(--anslation-ds-danger)]" : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--anslation-ds-danger)]"}`}>
        <Heart size={16} className={liked ? "fill-[var(--anslation-ds-danger)]" : "fill-transparent"} />
        <span className="tabular-nums">{formatCount(likes)}</span>
      </button>
      <button onClick={() => commentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })} aria-label="Jump to comments" className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] transition hover:bg-[var(--muted)] hover:text-[var(--foreground)]">
        <MessageCircle size={16} />
        <span className="tabular-nums">{comments.length}</span>
      </button>
      <div className="mx-1 h-5 w-px bg-[var(--border)]" />
      <button onClick={() => setSaved((v) => !v)} aria-label={saved ? "Unsave" : "Save"} title="Local to this session — resets on refresh" className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all ${saved ? "bg-[var(--foreground)] text-[var(--card)]" : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"}`}>
        <Bookmark size={16} className={saved ? "fill-current" : ""} />
        {saved ? "Saved" : "Save"}
      </button>
      <div className="mx-1 h-5 w-px bg-[var(--border)]" />
      <ShareSheet headline={article.headline} />
    </div>
  );
}

// ─── Sidebar Widgets ────────────────────────────────────────────────────────

function RelatedNewsWidget({ articles, timeAgo }) {
  if (!articles?.length) return null;
  return (
    <div className="rounded-2xl news-card-surface p-6">
      <h3 className="mb-5 text-lg font-bold text-[var(--foreground)]">Related News</h3>
      <div className="space-y-4">
        {articles.map((item) => (
          <Link key={item.id || item.slug} href={`/news/${item.slug}`} className="group flex items-start gap-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
              {item.image_url ? (
                <ManagedImage src={item.image_url} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[var(--muted)] text-[var(--muted-foreground)]"><Zap size={14} /></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--primary)]">{item.category || "General"}</span>
              <p className="mt-0.5 text-sm font-semibold leading-snug text-[var(--foreground)] transition-colors group-hover:text-[var(--primary)] line-clamp-2">{item.headline}</p>
              <span className="text-xs text-[var(--muted-foreground)]">{timeAgo(item.published_hours_ago)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function TrendingWidget({ articles, timeAgo, formatCount }) {
  if (!articles?.length) return null;
  return (
    <div className="rounded-2xl news-card-surface p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-bold text-[var(--foreground)]">Trending Now</h3>
        <Link href="/news/trending" className="text-xs font-semibold text-[var(--primary)] hover:underline">View All</Link>
      </div>
      <div className="space-y-5">
        {articles.map((item, index) => {
          const readTime = Math.max(3, Math.ceil((item.headline?.length || 100) / 100) * 3);
          return (
            <Link key={item.id || item.slug} href={`/news/${item.slug}`} className="group flex items-start gap-4">
              <span className="w-8 shrink-0 text-2xl font-extrabold text-[var(--border)] tabular-nums">{String(index + 1).padStart(2, "0")}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-snug text-[var(--foreground)] transition-colors group-hover:text-[var(--primary)] line-clamp-2">{item.headline}</p>
                <span className="mt-1 block text-xs text-[var(--muted-foreground)]">{readTime} min read &bull; {formatCount(item.likes + item.comments + item.shares)} views</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function NewsletterWidget() {
  const emailId = useId();
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle");
  const [error, setError] = useState("");

  const validate = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate(email)) { setError("Valid email required."); return; }
    setError("");
    setState("loading");
    await new Promise((r) => setTimeout(r, 1000));
    setState("success");
  }

  if (state === "success") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--anslation-ds-success-soft)] text-[var(--anslation-ds-success)]">
          <Check size={18} />
        </div>
        <div>
          <p className="font-semibold text-[var(--foreground)]">You&apos;re subscribed!</p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">Check your inbox for the latest news.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl news-card-surface p-6">
      <div className="mb-4 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
          <Mail size={22} />
        </div>
        <div>
          <h3 className="text-base font-bold text-[var(--foreground)]">Newsletter</h3>
          <p className="mt-1 text-sm leading-relaxed text-[var(--muted-foreground)]">Get the latest news delivered to your inbox daily.</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor={emailId} className="sr-only">Email address</label>
          <input id={emailId} type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} placeholder="Enter your email" className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] transition focus:border-[var(--primary)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10" />
          {error && <p className="mt-1 text-xs text-[var(--anslation-ds-danger)]">{error}</p>}
        </div>
        <button type="submit" disabled={state === "loading"} className="flex w-full items-center justify-center rounded-xl news-action px-4 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60">
          {state === "loading" ? "Loading…" : "Subscribe"}
        </button>
      </form>
      <p className="mt-3 text-[11px] text-[var(--muted-foreground)]">No spam. Unsubscribe anytime.</p>
    </div>
  );
}

function FollowUs() {
  const SOCIALS = [
    { name: "Facebook", icon: "f", action: "Like", href: "https://facebook.com" },
    { name: "Twitter", icon: "X", action: "Follow", href: "https://twitter.com" },
    { name: "Instagram", icon: "in", action: "Follow", href: "https://instagram.com" },
    { name: "YouTube", icon: "▶", action: "Subscribe", href: "https://youtube.com" },
  ];
  return (
    <div className="rounded-2xl news-card-surface p-6">
      <h3 className="mb-4 text-base font-bold text-[var(--foreground)]">Follow Us</h3>
      <div className="space-y-3">
        {SOCIALS.map((s) => (
          <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="news-social-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold">{s.icon}</div>
              <span className="text-sm font-semibold text-[var(--foreground)]">{s.name}</span>
            </div>
            <span className="text-xs font-semibold text-[var(--primary)] transition group-hover:underline">{s.action}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

// ─── Comment Item ──────────────────────────────────────────────────────────
function CommentItem({ text, index }) {
  const colors = ["news-social-icon"];
  return (
    <li className="flex gap-3 rounded-2xl news-card-surface p-4">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${colors[index % colors.length]}`}><User size={14} /></div>
      <div className="flex-1 min-w-0">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-xs font-semibold text-[var(--foreground)]">Anonymous</span>
          <span className="text-[10px] text-[var(--muted-foreground)]">Just now</span>
        </div>
        <p className="text-sm leading-relaxed text-[var(--foreground)]">{text}</p>
      </div>
    </li>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function NewsArticleView({ article, relatedNews, trendingArticles }) {
  const [likes, setLikes] = useState(article?.likes ?? 0);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const commentRef = useRef(null);

  function submitComment() {
    if (!commentText.trim()) return;
    setComments((c) => [commentText.trim(), ...c]);
    setCommentText("");
  }

  const tags = article.tags || [];
  const highlights = article.highlights || [];
  // Syndicated items carry no verified byline, so credit the originating
  // publication when we have one and the site organization otherwise.
  const attribution = article.attribution || article.source || "AltFTool News";

  // Wrap share/copy helpers so they see the same article
  const headline = article.headline;

  return (
    <>
      <ReadingProgress />

      <article className="mx-auto w-full max-w-[1360px] px-4 pb-20 pt-6 sm:px-6 lg:px-8">

        {/* ── Breadcrumb ──────────────────────────────────────────────── */}
        <nav aria-label="breadcrumb" className="mb-8 flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
          <Link href="/" className="hover:text-[var(--foreground)] transition">Home</Link>
          <ChevronRight size={11} className="opacity-40" />
          <Link href="/news" className="hover:text-[var(--foreground)] transition">News</Link>
          {article.category && (
            <>
              <ChevronRight size={11} className="opacity-40" />
              <Link href={`/news/topics/${slugify(article.category)}`} className="hover:text-[var(--foreground)] transition capitalize">{article.category}</Link>
            </>
          )}
          <ChevronRight size={11} className="opacity-40" />
          <span className="truncate max-w-[200px] text-[var(--foreground)]">{article.headline}</span>
        </nav>

        {/* ── Main Grid: 8/4 ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">

          {/* ═══ MAIN CONTENT — 8 COLUMNS ═══ */}
          <div className="lg:col-span-8">

            {/* Category Pill */}
            {article.category && (
              <span className={`inline-block rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${getCategoryStyle(article.category)}`}>
                {article.category}
              </span>
            )}

            {/* Headline */}
            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-[var(--foreground)] sm:text-4xl lg:text-5xl xl:text-[48px]">
              {article.headline}
            </h1>

            {/* Subtitle */}
            {article.subtitle && (
              <p className="mt-4 text-lg leading-relaxed text-[var(--muted-foreground)] sm:text-xl">
                {article.subtitle}
              </p>
            )}

            {/* Source Attribution */}
            <div className="mt-8 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Source</span>
              <span className="text-sm font-semibold text-[var(--foreground)]">{attribution}</span>
            </div>

            {/* Metadata Row */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
              <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--muted-foreground)]">
                <span className="flex items-center gap-1.5">
                  <Clock size={14} />
                  {timeAgo(article.published_hours_ago)}
                </span>
                {article.reading_time_minutes && (
                  <span className="flex items-center gap-1.5">
                    <Eye size={14} />
                    {article.reading_time_minutes} min read
                  </span>
                )}
                {article.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} />
                    {article.location}
                  </span>
                )}
              </div>
              <ShareSheet headline={headline} />
            </div>

            {/* Hero Image */}
            {article.image_url && (
              <figure className="mt-8 overflow-hidden rounded-2xl">
                <ManagedImage src={article.image_url} alt={article.headline} className="w-full object-cover" loading="eager" />
                {article.image_caption && (
                  <figcaption className="mt-3 text-center text-sm text-[var(--muted-foreground)]">
                    {article.image_caption}
                  </figcaption>
                )}
              </figure>
            )}

            {/* Article Body */}
            <div className="mt-10 space-y-6 text-base leading-[1.8] text-[var(--foreground)] sm:text-lg">
              {Array.isArray(article.content)
                ? article.content.map((para, i) => <p key={i}>{para}</p>)
                : article.content && typeof article.content === "string"
                ? article.content.split("\n\n").map((para, i) => <p key={i}>{para}</p>)
                : article.summary && <p>{article.summary}</p>
              }
            </div>

            {/* Key Highlights */}
            {highlights.length > 0 && (
              <section className="mt-12 rounded-2xl news-card-surface p-6 sm:p-8">
                <h2 className="mb-5 text-lg font-bold text-[var(--foreground)]">Key Highlights</h2>
                <ul className="space-y-4">
                  {highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-1.5 flex h-2 w-2 shrink-0 rounded-full bg-[var(--primary)]" />
                      <div>
                        <span className="text-sm font-bold text-[var(--foreground)]">{h.label}: </span>
                        <span className="text-sm leading-relaxed text-[var(--muted-foreground)]">{h.description}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-2">
                {tags.map((t) => (
                  <Link key={t} href={`/news/topics/${slugify(t)}`} className="rounded-lg border border-[var(--border)] bg-[var(--muted)] px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)] transition hover:border-[var(--foreground)]/20 hover:text-[var(--foreground)]">
                    #{t}
                  </Link>
                ))}
              </div>
            )}

            {/* Source Card */}
            <div className="mt-10 rounded-2xl news-card-surface p-6">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Source</p>
              <p className="mt-1 text-base font-bold text-[var(--foreground)]">{attribution}</p>
              {article.external_url && (
                <a
                  href={article.external_url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)] transition hover:underline"
                >
                  Read the full story at {attribution}
                  <ChevronRight size={14} />
                </a>
              )}
            </div>

            {/* Related Articles */}
            {relatedNews?.length > 0 && (
              <section className="mt-12 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[var(--foreground)]">Related Articles</h2>
                  <Link href="/news" className="flex items-center gap-1 text-sm text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]">
                    See all <ChevronRight size={14} />
                  </Link>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  {relatedNews.map((item) => (
                    <NewsCard key={item.id} news={item} />
                  ))}
                </div>
              </section>
            )}

          </div>

          {/* ═══ SIDEBAR — 4 COLUMNS ═══ */}
          <aside className="lg:col-span-4">
            <div className="space-y-6 lg:sticky lg:top-8">

              {/* Sticky Action Bar (mobile/tablet only, desktop shows inline) */}
              <div className="block lg:hidden">
                <ActionBar article={article} likes={likes} liked={liked} setLiked={setLiked} setLikes={setLikes} comments={comments} commentRef={commentRef} saved={saved} setSaved={setSaved} />
              </div>

              <RelatedNewsWidget articles={relatedNews} timeAgo={timeAgo} />
              <TrendingWidget articles={trendingArticles} timeAgo={timeAgo} formatCount={formatCount} />
              <NewsletterWidget />
              <FollowUs />
            </div>
          </aside>

        </div>

        {/* ── Divider ────────────────────────────────────────────────── */}
        <div className="mx-auto mt-16 flex max-w-3xl items-center gap-4">
          <div className="h-px flex-1 bg-[var(--border)]" />
          <span className="text-xs text-[var(--muted-foreground)]">End of article</span>
          <div className="h-px flex-1 bg-[var(--border)]" />
        </div>

        {/* ── Comments ────────────────────────────────────────────────── */}
        <section ref={commentRef} id="comments-section" className="mx-auto mt-10 max-w-3xl space-y-6 scroll-mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--foreground)]">
              Discussion
              {comments.length > 0 && (
                <span className="ml-2 rounded-full bg-[var(--muted)] px-2 py-0.5 text-sm font-normal text-[var(--muted-foreground)]">{comments.length}</span>
              )}
            </h2>
          </div>
          <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-[var(--muted-foreground)]"><User size={15} /></div>
            <div className="flex flex-1 items-end gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 focus-within:border-[var(--foreground)]/30 transition">
              <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submitComment(); }} placeholder="Share your thoughts…" rows={1} className="flex-1 resize-none bg-transparent text-sm leading-relaxed text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none" />
              <button onClick={submitComment} disabled={!commentText.trim()} aria-label="Post comment" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] transition disabled:opacity-30 enabled:hover:opacity-90">
                <Send size={13} />
              </button>
            </div>
          </div>
          <p className="text-[11px] text-[var(--muted-foreground)]">⌘ + Enter to post &bull; Local to this session only — resets on refresh</p>
          {comments.length > 0 ? (
            <ul className="space-y-3">
              {comments.map((c, i) => (<CommentItem key={i} text={c} index={i} />))}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[var(--border)] py-12 text-center">
              <MessageCircle size={24} className="text-[var(--muted-foreground)] opacity-40" />
              <p className="text-sm text-[var(--muted-foreground)]">No comments yet. Be the first!</p>
            </div>
          )}
        </section>
      </article>
    </>
  );
}
