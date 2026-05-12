"use client";

import { useParams } from "next/navigation";
import {
  Heart, Share2, MessageCircle, Bookmark, Clock,
  MapPin, ArrowLeft, Link2, Twitter, Facebook, Check,
  ChevronRight, User, Send,
} from "lucide-react";
import newsData from "../../../../public/data/newsdata.json";
import NewsCard from "../components/ui/NewsCard";
import { useMemo, useState, useRef, useEffect } from "react";
import Link from "next/link";
import ManagedImage from "@/components/ui/ManagedImage";

// ─── helpers ─────────────────────────────────────────────────────────────────

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

const getCategoryStyle = (cat) => {
  const map = {
    politics: "bg-red-500/10 text-red-500 border-red-500/20",
    tech:     "bg-blue-500/10 text-blue-500 border-blue-500/20",
    business: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    science:  "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    sports:   "bg-orange-500/10 text-orange-500 border-orange-500/20",
    health:   "bg-pink-500/10 text-pink-500 border-pink-500/20",
    world:    "bg-purple-500/10 text-purple-500 border-purple-500/20",
  };
  return map[cat?.toLowerCase()] ?? "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
};

// ─── reading progress bar ─────────────────────────────────────────────────────

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
      <div
        className="h-full bg-[var(--primary)] transition-[width] duration-100"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ─── share sheet ─────────────────────────────────────────────────────────────

function ShareSheet({ headline }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2">
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(headline)}&url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
        target="_blank" rel="noopener noreferrer"
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--muted-foreground)] transition hover:border-sky-400/40 hover:bg-sky-400/10 hover:text-sky-400"
        aria-label="Share on Twitter"
      >
        <Twitter size={15} />
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
        target="_blank" rel="noopener noreferrer"
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--muted-foreground)] transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-500"
        aria-label="Share on Facebook"
      >
        <Facebook size={15} />
      </a>
      <button
        onClick={copy}
        className={`flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-medium transition
          ${copied
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500"
            : "border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        aria-label="Copy link"
      >
        {copied ? <Check size={13} /> : <Link2 size={13} />}
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}

// ─── comment item ─────────────────────────────────────────────────────────────

function CommentItem({ text, index }) {
  const colors = [
    "bg-violet-500", "bg-blue-500", "bg-emerald-500",
    "bg-orange-500", "bg-pink-500", "bg-sky-500",
  ];
  const color = colors[index % colors.length];

  return (
    <li className="flex gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${color}`}>
        <User size={14} />
      </div>
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

function NewsArticleView({ article, relatedNews }) {
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

  return (
    <>
      <ReadingProgress />

      <article className="mx-auto max-w-3xl space-y-10 pb-20">

        {/* ── back breadcrumb ───────────────────────────────────────── */}
        <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
          <Link href="/news" className="flex items-center gap-1 hover:text-[var(--foreground)] transition">
            <ArrowLeft size={12} /> News
          </Link>
          <ChevronRight size={11} className="opacity-40" />
          {article.category && (
            <>
              <Link href={`/news/topics/${slugify(article.category)}`} className="hover:text-[var(--foreground)] transition capitalize">
                {article.category}
              </Link>
              <ChevronRight size={11} className="opacity-40" />
            </>
          )}
          <span className="truncate max-w-[200px]">{article.headline}</span>
        </nav>

        {/* ── header ───────────────────────────────────────────────── */}
        <header className="space-y-5">
          {/* category + meta */}
          <div className="flex flex-wrap items-center gap-2">
            {article.category && (
              <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${getCategoryStyle(article.category)}`}>
                {article.category}
              </span>
            )}
            {article.tags?.slice(0, 2).map((t) => (
              <span key={t} className="rounded-full bg-[var(--muted)] px-2.5 py-1 text-[11px] text-[var(--muted-foreground)]">
                #{t}
              </span>
            ))}
          </div>

          {/* headline */}
          <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-[var(--foreground)] sm:text-3xl lg:text-4xl">
            {article.headline}
          </h1>

          {/* byline */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[var(--muted-foreground)]">
            <span className="flex items-center gap-1.5 font-semibold text-[var(--foreground)]">
              {article.source_favicon && (
                <ManagedImage src={article.source_favicon} alt="" className="h-4 w-4 rounded-sm" />
              )}
              {article.source}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={13} />
              {timeAgo(article.published_hours_ago)}
            </span>
            {article.location && (
              <span className="flex items-center gap-1">
                <MapPin size={13} />
                {article.location}
              </span>
            )}
            {article.reading_time_minutes && (
              <span className="flex items-center gap-1">
                <Clock size={13} />
                {article.reading_time_minutes} min read
              </span>
            )}
          </div>
        </header>

        {/* ── hero image ───────────────────────────────────────────── */}
        {article.image_url && (
          <figure className="overflow-hidden rounded-2xl">
            <ManagedImage
              src={article.image_url}
              alt={article.headline}
              className="w-full object-cover"
              loading="eager"
            />
            {article.image_caption && (
              <figcaption className="mt-2 text-center text-xs text-[var(--muted-foreground)]">
                {article.image_caption}
              </figcaption>
            )}
          </figure>
        )}

        {/* ── action bar (sticky) ───────────────────────────────────── */}
        <div className="
          sticky top-3 z-40 mx-auto flex max-w-max items-center gap-1
          rounded-2xl border border-[var(--border)]
          bg-[var(--card)]/80 px-3 py-2 shadow-md backdrop-blur-md
        ">
          {/* like */}
          <button
            onClick={() => { setLiked((v) => !v); setLikes((l) => liked ? l - 1 : l + 1); }}
            aria-label={liked ? "Unlike" : "Like"}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all
              ${liked ? "bg-red-500/10 text-red-500" : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-red-500"}`}
          >
            <Heart size={16} className={liked ? "fill-red-500" : "fill-transparent"} />
            <span className="tabular-nums">{formatCount(likes)}</span>
          </button>

          {/* comment scroll */}
          <button
            onClick={() => commentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            aria-label="Jump to comments"
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] transition hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
          >
            <MessageCircle size={16} />
            <span className="tabular-nums">{comments.length}</span>
          </button>

          <div className="mx-1 h-5 w-px bg-[var(--border)]" />

          {/* save */}
          <button
            onClick={() => setSaved((v) => !v)}
            aria-label={saved ? "Unsave" : "Save"}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all
              ${saved ? "bg-[var(--foreground)] text-[var(--card)]" : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"}`}
          >
            <Bookmark size={16} className={saved ? "fill-current" : ""} />
            {saved ? "Saved" : "Save"}
          </button>

          <div className="mx-1 h-5 w-px bg-[var(--border)]" />

          {/* share */}
          <ShareSheet headline={article.headline} />
        </div>

        {/* ── body content ─────────────────────────────────────────── */}
        <div className="
          prose prose-neutral max-w-none
          prose-p:text-[var(--foreground)] prose-p:leading-[1.8]
          prose-headings:text-[var(--foreground)]
          prose-a:text-[var(--primary)]
          text-base
        ">
          <p>{article.summary}</p>
          {/* If article.content exists as an array of paragraphs */}
          {Array.isArray(article.content)
            ? article.content.map((para, i) => <p key={i}>{para}</p>)
            : article.content && typeof article.content === "string"
            ? article.content.split("\n\n").map((para, i) => <p key={i}>{para}</p>)
            : null
          }
        </div>

        {/* ── tags ─────────────────────────────────────────────────── */}
        {article.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {article.tags.map((t) => (
              <Link
                key={t}
                href={`/news/topics/${slugify(t)}`}
                className="rounded-lg border border-[var(--border)] bg-[var(--muted)] px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)] transition hover:border-[var(--foreground)]/20 hover:text-[var(--foreground)]"
              >
                #{t}
              </Link>
            ))}
          </div>
        )}

        {/* ── divider ───────────────────────────────────────────────── */}
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-[var(--border)]" />
          <span className="text-xs text-[var(--muted-foreground)]">End of article</span>
          <div className="h-px flex-1 bg-[var(--border)]" />
        </div>

        {/* ── comments ─────────────────────────────────────────────── */}
        <section ref={commentRef} id="comments-section" className="space-y-6 scroll-mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--foreground)]">
              Discussion
              {comments.length > 0 && (
                <span className="ml-2 rounded-full bg-[var(--muted)] px-2 py-0.5 text-sm font-normal text-[var(--muted-foreground)]">
                  {comments.length}
                </span>
              )}
            </h2>
          </div>

          {/* input */}
          <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-[var(--muted-foreground)]">
              <User size={15} />
            </div>
            <div className="flex flex-1 items-end gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 focus-within:border-[var(--foreground)]/30 transition">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submitComment(); }}
                placeholder="Share your thoughts…"
                rows={1}
                className="flex-1 resize-none bg-transparent text-sm leading-relaxed text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none"
              />
              <button
                onClick={submitComment}
                disabled={!commentText.trim()}
                aria-label="Post comment"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] transition disabled:opacity-30 enabled:hover:opacity-90"
              >
                <Send size={13} />
              </button>
            </div>
          </div>
          <p className="text-[11px] text-[var(--muted-foreground)]">⌘ + Enter to post</p>

          {/* list */}
          {comments.length > 0 ? (
            <ul className="space-y-3">
              {comments.map((c, i) => (
                <CommentItem key={i} text={c} index={i} />
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[var(--border)] py-12 text-center">
              <MessageCircle size={24} className="text-[var(--muted-foreground)] opacity-40" />
              <p className="text-sm text-[var(--muted-foreground)]">No comments yet. Be the first!</p>
            </div>
          )}
        </section>

        {/* ── related ───────────────────────────────────────────────── */}
        {relatedNews.length > 0 && (
          <section className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--foreground)]">You may also like</h2>
              <Link
                href="/news"
                className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]"
              >
                See all <ChevronRight size={13} />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {relatedNews.map((news) => (
                <NewsCard key={news.id} news={news} />
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}

// ─── main ─────────────────────────────────────────────────────────────────────

export default function NewsDetailPage() {
  const { slug } = useParams();

  const localArticle = useMemo(
    () => newsData.news.find((n) => n.slug === slug),
    [slug]
  );
  const [remoteLookup, setRemoteLookup] = useState({
    status: "idle",
    slug: null,
    article: null,
  });
  const remoteLookupMatchesSlug = remoteLookup.slug === slug;
  const article = localArticle || (remoteLookupMatchesSlug ? remoteLookup.article : null);
  const isResolvingRemoteArticle = !localArticle && Boolean(slug) && (
    !remoteLookupMatchesSlug || remoteLookup.status !== "done"
  );

  const relatedNews = useMemo(
    () => newsData.news.filter((n) => n.slug !== slug).slice(0, 4),
    [slug]
  );

  useEffect(() => {
    if (localArticle || !slug) {
      return undefined;
    }

    const controller = new AbortController();

    fetch("/news/api", { signal: controller.signal })
      .then((response) => response.json())
      .then(({ news }) => {
        const remoteArticle = (news || []).find((item) => item.slug === slug) || null;
        setRemoteLookup({ status: "done", slug, article: remoteArticle });
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setRemoteLookup({ status: "done", slug, article: null });
        }
      });

    return () => controller.abort();
  }, [localArticle, slug]);

  if (!article && isResolvingRemoteArticle) {
    return (
      <div className="space-y-6 py-10">
        <div className="h-5 w-36 animate-pulse rounded-md bg-[var(--muted)]" />
        <div className="h-10 w-3/4 animate-pulse rounded-md bg-[var(--muted)]" />
        <div className="h-72 animate-pulse rounded-2xl bg-[var(--muted)]" />
        <div className="space-y-3">
          <div className="h-4 animate-pulse rounded-md bg-[var(--muted)]" />
          <div className="h-4 w-5/6 animate-pulse rounded-md bg-[var(--muted)]" />
          <div className="h-4 w-2/3 animate-pulse rounded-md bg-[var(--muted)]" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <div className="text-5xl">📰</div>
        <h1 className="text-xl font-bold text-[var(--foreground)]">Article not found</h1>
        <p className="text-sm text-[var(--muted-foreground)]">This story may have been removed or the link is incorrect.</p>
        <Link href="/news" className="mt-2 flex items-center gap-1.5 rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)]">
          <ArrowLeft size={14} /> Back to News
        </Link>
      </div>
    );
  }

  return <NewsArticleView key={article.slug} article={article} relatedNews={relatedNews} />;
}
