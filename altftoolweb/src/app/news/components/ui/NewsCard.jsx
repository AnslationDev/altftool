// "use client";

// import Link from "next/link";
// import { Heart, Share2, MessageCircle, Bookmark, ExternalLink, Clock, MapPin } from "lucide-react";
// import { useState, useRef } from "react";
// import ManagedImage from "@/components/ui/ManagedImage";

// // ─── helpers ────────────────────────────────────────────────────────────────

// function formatCount(n) {
//   if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
//   if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
//   return String(n);
// }

// function getCategoryColor(category) {
//   const map = {
//     politics: { bg: "bg-red-500/10", text: "text-red-500", dot: "bg-red-500" },
//     tech: { bg: "bg-blue-500/10", text: "text-blue-500", dot: "bg-blue-500" },
//     business: { bg: "bg-amber-500/10", text: "text-amber-500", dot: "bg-amber-500" },
//     science: { bg: "bg-emerald-500/10", text: "text-emerald-500", dot: "bg-emerald-500" },
//     sports: { bg: "bg-orange-500/10", text: "text-orange-500", dot: "bg-orange-500" },
//     health: { bg: "bg-pink-500/10", text: "text-pink-500", dot: "bg-pink-500" },
//     world: { bg: "bg-purple-500/10", text: "text-purple-500", dot: "bg-purple-500" },
//   };
//   return map[category?.toLowerCase()] ?? { bg: "bg-zinc-500/10", text: "text-zinc-400", dot: "bg-zinc-400" };
// }

// // ─── sub-components ──────────────────────────────────────────────────────────

// function ActionButton({ onClick, active, activeClass, hoverClass, icon, count, label }) {
//   return (
//     <button
//       onClick={onClick}
//       aria-label={label}
//       className={`
//         group flex items-center gap-1.5 rounded-lg px-2.5 py-1.5
//         text-xs font-medium transition-all duration-200
//         ${active ? activeClass : `text-[var(--muted-foreground)] ${hoverClass}`}
//       `}
//     >
//       {icon}
//       {count !== undefined && (
//         <span className="tabular-nums">{formatCount(count)}</span>
//       )}
//     </button>
//   );
// }

// // ─── main component ──────────────────────────────────────────────────────────

// export default function NewsCard({ news }) {
//   const [liked, setLiked] = useState(false);
//   const [likes, setLikes] = useState(news.likes ?? 0);
//   const [saved, setSaved] = useState(false);
//   const [shareToast, setShareToast] = useState(false);
//   const toastTimer = useRef(null);

//   const catStyle = getCategoryColor(news.category);

//   function handleLike(e) {
//     e.preventDefault();
//     e.stopPropagation();
//     setLiked((v) => !v);
//     setLikes((l) => (liked ? l - 1 : l + 1));
//   }

//   function handleSave(e) {
//     e.preventDefault();
//     e.stopPropagation();
//     setSaved((v) => !v);
//   }

//   async function handleShare(e) {
//     e.preventDefault();
//     e.stopPropagation();
//     const url = `${window.location.origin}/news/${news.slug}`;
//     try {
//       if (navigator.share) {
//         await navigator.share({ title: news.headline, url });
//       } else {
//         await navigator.clipboard.writeText(url);
//         clearTimeout(toastTimer.current);
//         setShareToast(true);
//         toastTimer.current = setTimeout(() => setShareToast(false), 2000);
//       }
//     } catch (_) { }
//   }

//   return (
//     <article
//       className="
//         group relative w-full overflow-hidden rounded-2xl
//         border border-[var(--border)]
//         bg-[var(--card)]
//         shadow-sm hover:shadow-md
//         transition-all duration-300
//         hover:-translate-y-0.5
//       "
//     >
//       {/* ── Image ─────────────────────────────────────────────────────── */}
//       {news.image_url && (
//         <Link href={`/news/${news.slug}`} className="block" tabIndex={-1} aria-hidden>
//           <div className="relative h-52 w-full overflow-hidden sm:h-56 md:h-80">
//             <ManagedImage
//               src={news.image_url}
//               alt={news.headline}
//               className="
//                 h-full w-full object-cover
//                 scale-100 transition-transform duration-500
//                 group-hover:scale-105
//               "
//               loading="lazy"
//             />

//             {/* gradient overlay */}
//             <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

//             {/* category pill — floated over image */}
//             {news.category && (
//               <span
//                 className={`
//                   absolute left-3 top-3 flex items-center gap-1.5
//                   rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider
//                   backdrop-blur-md border border-white/10
//                   ${catStyle.bg} ${catStyle.text}
//                 `}
//               >
//                 <span className={`h-1.5 w-1.5 rounded-full ${catStyle.dot}`} />
//                 {news.category}
//               </span>
//             )}

//             {/* reading time — bottom-left over image */}
//             {news.reading_time_minutes && (
//               <span className="
//                 absolute bottom-3 left-3
//                 flex items-center gap-1 rounded-full
//                 bg-black/40 px-2.5 py-1 text-[11px] text-white/90 backdrop-blur-sm
//               ">
//                 <Clock size={11} className="shrink-0" />
//                 {news.reading_time_minutes} min read
//               </span>
//             )}

//             {/* save button — bottom-right over image */}
//             <button
//               onClick={handleSave}
//               aria-label={saved ? "Unsave article" : "Save article"}
//               className={`
//                 absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center
//                 rounded-full backdrop-blur-sm border transition-all duration-200
//                 ${saved
//                   ? "bg-[var(--foreground)] border-transparent text-[var(--card)]"
//                   : "bg-black/40 border-white/10 text-white hover:bg-black/60"
//                 }
//               `}
//             >
//               <Bookmark size={14} className={saved ? "fill-current" : ""} />
//             </button>
//           </div>
//         </Link>
//       )}

//       {/* ── Body ──────────────────────────────────────────────────────── */}
//       <div className="flex flex-col gap-3 p-4 sm:p-5">

//         {/* source row */}
//         <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
//           <div className="flex items-center gap-2 min-w-0">
//             {/* favicon */}
//             {news.source_favicon && (
//               <ManagedImage
//                 src={news.source_favicon}
//                 alt=""
//                 aria-hidden
//                 className="h-4 w-4 rounded-sm object-contain"
//               />
//             )}
//             <span className="truncate font-semibold text-[var(--foreground)]">
//               {news.source}
//             </span>
//             <span aria-hidden>·</span>
//             <span className="flex items-center gap-1 shrink-0">
//               <Clock size={11} />
//               {news.published_hours_ago}h ago
//             </span>
//           </div>

//           {/* open in new tab */}
//           {news.external_url && (
//             <a
//               href={news.external_url}
//               target="_blank"
//               rel="noopener noreferrer"
//               onClick={(e) => e.stopPropagation()}
//               aria-label="Open original article"
//               className="ml-2 shrink-0 rounded-md p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--card-hover-bg)] transition"
//             >
//               <ExternalLink size={13} />
//             </a>
//           )}
//         </div>

//         {/* headline */}
//         <Link href={`/news/${news.slug}`} className="group/link">
//           <h2 className="
//             text-[15px] font-bold leading-snug text-[var(--foreground)]
//             line-clamp-2
//             group-hover/link:text-[var(--foreground)] underline-offset-2
//             transition-colors duration-150
//           ">
//             {news.headline}
//           </h2>
//         </Link>

//         {/* summary */}
//         {news.summary && (
//           <p className="line-clamp-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
//             {news.summary}
//           </p>
//         )}

//         {/* tags */}
//         {news.tags?.length > 0 && (
//           <div className="flex flex-wrap gap-1.5">
//             {news.tags.slice(0, 3).map((tag) => (
//               <span
//                 key={tag}
//                 className="
//                   rounded-md bg-[var(--muted)] px-2 py-0.5
//                   text-[11px] font-medium text-[var(--muted-foreground)]
//                   hover:text-[var(--foreground)] transition cursor-default
//                 "
//               >
//                 #{tag}
//               </span>
//             ))}
//           </div>
//         )}

//         {/* divider */}
//         <div className="h-px w-full bg-[var(--border)]" />

//         {/* footer */}
//         <div className="flex items-center justify-between">

//           {/* location */}
//           {news.location && (
//             <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] min-w-0 truncate">
//               <MapPin size={11} className="shrink-0" />
//               {news.location}
//             </span>
//           )}

//           {/* actions */}
//           <div className="ml-auto flex items-center gap-0.5">
//             {/* like */}
//             <ActionButton
//               onClick={handleLike}
//               active={liked}
//               activeClass="text-red-500 bg-red-500/10"
//               hoverClass="hover:text-red-500 hover:bg-red-500/10"
//               label={liked ? "Unlike" : "Like"}
//               count={likes}
//               icon={
//                 <Heart
//                   size={14}
//                   className={`transition-transform duration-200 ${liked ? "fill-red-500 scale-110" : "fill-transparent group-hover:scale-110"}`}
//                 />
//               }
//             />

//             {/* comment */}
//             <ActionButton
//               onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
//               active={false}
//               activeClass=""
//               hoverClass="hover:text-[var(--foreground)] hover:bg-[var(--card-hover-bg)]"
//               label="Comment"
//               count={news.comments}
//               icon={<MessageCircle size={14} />}
//             />

//             {/* share + toast */}
//             <div className="relative">
//               <ActionButton
//                 onClick={handleShare}
//                 active={shareToast}
//                 activeClass="text-emerald-500 bg-emerald-500/10"
//                 hoverClass="hover:text-[var(--foreground)] hover:bg-[var(--card-hover-bg)]"
//                 label="Share"
//                 count={news.shares}
//                 icon={<Share2 size={14} />}
//               />
//               {shareToast && (
//                 <span className="
//                   pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2
//                   whitespace-nowrap rounded-lg bg-[var(--foreground)] px-2.5 py-1
//                   text-[11px] font-medium text-[var(--card)]
//                   animate-fade-in shadow-lg
//                 ">
//                   Link copied!
//                 </span>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </article>
//   );
// }


"use client";

import Link from "next/link";
import {
  Heart, Share2, MessageCircle, Bookmark, ExternalLink, Clock, MapPin, Eye
} from "lucide-react";
import { useState, useRef } from "react";
import ManagedImage from "@/components/ui/ManagedImage";

// ─── helpers ────────────────────────────────────────────────────────────────
function formatCount(n) {
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

function getCategoryStyle(cat) {
  return "news-category-pill";
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function ActionButton({ onClick, active, activeClass, hoverClass, icon, count, label }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`group flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-200 ${active ? activeClass : `text-[var(--muted-foreground)] ${hoverClass}`}`}
    >
      {icon}
      {count !== undefined && <span className="tabular-nums">{formatCount(count)}</span>}
    </button>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function NewsCard({ news, variant = "default", rank }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(news.likes ?? 0);
  const [saved, setSaved] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const toastTimer = useRef(null);

  const catStyle = getCategoryStyle(news.category);

  function handleLike(e) {
    e.preventDefault();
    e.stopPropagation();
    setLiked((v) => !v);
    setLikes((l) => (liked ? l - 1 : l + 1));
  }

  function handleSave(e) {
    e.preventDefault();
    e.stopPropagation();
    setSaved((v) => !v);
  }

  async function handleShare(e) {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/news/${news.slug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: news.headline, url });
      } else {
        await navigator.clipboard.writeText(url);
        clearTimeout(toastTimer.current);
        setShareToast(true);
        toastTimer.current = setTimeout(() => setShareToast(false), 2000);
      }
    } catch (_) { }
  }

  // ─── Variant: featured ─────────────────────────────────────────────────
  if (variant === "featured") {
    return (
      <article className="group overflow-hidden rounded-2xl news-card-surface transition-all">
        {news.image_url && (
          <Link href={`/news/${news.slug}`} className="block">
            <div className="relative h-64 w-full overflow-hidden sm:h-80 md:h-96">
              <ManagedImage
                src={news.image_url}
                alt={news.headline}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {news.category && (
                <span className={`absolute left-4 top-4 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm ${catStyle}`}>
                  {news.category}
                </span>
              )}
            </div>
          </Link>
        )}
        <div className="p-7 space-y-5">
          <Link href={`/news/${news.slug}`}>
            <h2 className="text-2xl font-extrabold leading-tight text-[var(--foreground)] hover:underline underline-offset-2">
              {news.headline}
            </h2>
          </Link>
          {news.summary && (
            <p className="line-clamp-3 text-base leading-relaxed text-[var(--muted-foreground)]">
              {news.summary}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[var(--muted-foreground)]">
            <span className="flex items-center gap-1.5 font-semibold text-[var(--foreground)]">
              {news.source_favicon && (
                <ManagedImage src={news.source_favicon} alt="" className="h-4 w-4 rounded-sm" />
              )}
              {news.source}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={13} />
              {timeAgo(news.published_hours_ago)}
            </span>
            {news.location && (
              <span className="flex items-center gap-1">
                <MapPin size={13} />
                {news.location}
              </span>
            )}
            {news.reading_time_minutes && (
              <span className="flex items-center gap-1">
                <Clock size={13} />
                {news.reading_time_minutes} min read
              </span>
            )}
          </div>
          {/* action bar (similar to original but simplified) */}
          <div className="flex items-center gap-2 pt-3 border-t border-[var(--border)]">
            <ActionButton
              onClick={handleLike}
              active={liked}
              activeClass="text-[var(--anslation-ds-danger)] bg-[var(--anslation-ds-danger-soft)]"
              hoverClass="hover:text-[var(--anslation-ds-danger)] hover:bg-[var(--anslation-ds-danger-soft)]"
              label="Like"
              count={likes}
              icon={<Heart size={14} className={liked ? "fill-[var(--anslation-ds-danger)]" : ""} />}
            />
            <ActionButton
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              active={false}
              activeClass=""
              hoverClass="hover:text-[var(--foreground)] hover:bg-[var(--card-hover-bg)]"
              label="Comment"
              count={news.comments}
              icon={<MessageCircle size={14} />}
            />
            <div className="relative">
              <ActionButton
                onClick={handleShare}
                active={shareToast}
                activeClass="text-[var(--anslation-ds-success)] bg-[var(--anslation-ds-success-soft)]"
                hoverClass="hover:text-[var(--foreground)] hover:bg-[var(--card-hover-bg)]"
                label="Share"
                count={news.shares}
                icon={<Share2 size={14} />}
              />
              {shareToast && (
                <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[var(--foreground)] px-2.5 py-1 text-[11px] font-medium text-[var(--card)] animate-fade-in shadow-lg">
                  Link copied!
                </span>
              )}
            </div>
          </div>
        </div>
      </article>
    );
  }

  // ─── Variant: compact (list item) ─────────────────────────────────────
  if (variant === "compact") {
    return (
      <Link href={`/news/${news.slug}`} className="group block">
        <div className="flex items-start gap-4 rounded-lg p-2.5 transition hover:bg-[var(--surface-soft)]">
          <span className="shrink-0 text-xs font-medium text-[var(--muted-foreground)] tabular-nums">
            {timeAgo(news.published_hours_ago)}
          </span>
          <p className="flex-1 text-sm font-medium text-[var(--foreground)] group-hover:underline underline-offset-2 line-clamp-2">
            {news.headline}
          </p>
        </div>
      </Link>
    );
  }

  // ─── Variant: category (small card) ──────────────────────────────────
  if (variant === "category") {
    return (
      <Link href={`/news/${news.slug}`} className="group block">
        <div className="rounded-xl news-card-surface p-4 transition hover:border-[var(--primary)]">
          <h4 className="text-sm font-semibold text-[var(--foreground)] group-hover:underline line-clamp-2">
            {news.headline}
          </h4>
          {news.summary && (
            <p className="mt-1.5 line-clamp-1 text-xs text-[var(--muted-foreground)]">
              {news.summary}
            </p>
          )}
          <div className="mt-2.5 flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {timeAgo(news.published_hours_ago)}
            </span>
            {news.source && (
              <>
                <span className="h-1 w-1 rounded-full bg-[var(--border)]" />
                <span>{news.source}</span>
              </>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // ─── Variant: trending (with rank) ──────────────────────────────────
  if (variant === "trending") {
    return (
      <article className="group flex gap-5 rounded-2xl news-card-surface p-5 transition">
        <div className="shrink-0 text-2xl font-extrabold text-[var(--muted-foreground)] opacity-30 tabular-nums">
          {rank}
        </div>
        <div className="flex-1 min-w-0 space-y-2.5">
          <Link href={`/news/${news.slug}`} className="block">
            <h3 className="text-sm font-bold leading-snug text-[var(--foreground)] group-hover:underline line-clamp-2">
              {news.headline}
            </h3>
          </Link>
          {news.summary && (
            <p className="line-clamp-2 text-sm text-[var(--muted-foreground)]">
              {news.summary}
            </p>
          )}
          <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {timeAgo(news.published_hours_ago)}
            </span>
            <span className="flex items-center gap-1">
              <Eye size={11} />
              {formatCount(news.likes + news.comments + news.shares)} views
            </span>
          </div>
        </div>
      </article>
    );
  }

  // ─── Default variant (original card) ──────────────────────────────────
  return (
    <article className="group relative w-full overflow-hidden rounded-2xl news-card-surface transition-all duration-300 hover:-translate-y-1">
      {news.image_url && (
        <Link href={`/news/${news.slug}`} className="block" tabIndex={-1} aria-hidden>
          <div className="relative h-52 w-full overflow-hidden sm:h-56 md:h-80">
            <ManagedImage
              src={news.image_url}
              alt={news.headline}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            {news.category && (
              <span className={`absolute left-3 top-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider backdrop-blur-md border border-white/10 ${catStyle}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                {news.category}
              </span>
            )}
            {news.reading_time_minutes && (
              <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-[11px] text-white/90 backdrop-blur-sm">
                <Clock size={11} className="shrink-0" />
                {news.reading_time_minutes} min read
              </span>
            )}
            <button
              onClick={handleSave}
              aria-label={saved ? "Unsave article" : "Save article"}
              className={`absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm border transition-all duration-200 ${saved ? "bg-[var(--foreground)] border-transparent text-[var(--card)]" : "bg-black/40 border-white/10 text-white hover:bg-black/60"}`}
            >
              <Bookmark size={14} className={saved ? "fill-current" : ""} />
            </button>
          </div>
        </Link>
      )}
      <div className="flex flex-col gap-4 p-5 sm:p-6">
        <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
          <div className="flex items-center gap-2 min-w-0">
            {news.source_favicon && (
              <ManagedImage src={news.source_favicon} alt="" aria-hidden className="h-4 w-4 rounded-sm object-contain" />
            )}
            <span className="truncate font-semibold text-[var(--foreground)]">{news.source}</span>
            <span aria-hidden>·</span>
            <span className="flex items-center gap-1 shrink-0">
              <Clock size={11} />
              {timeAgo(news.published_hours_ago)}
            </span>
          </div>
          {news.external_url && (
            <a href={news.external_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} aria-label="Open original article" className="ml-2 shrink-0 rounded-md p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--card-hover-bg)] transition">
              <ExternalLink size={13} />
            </a>
          )}
        </div>
        <Link href={`/news/${news.slug}`} className="group/link">
          <h2 className="text-[15px] font-bold leading-snug text-[var(--foreground)] line-clamp-2 group-hover/link:text-[var(--foreground)] underline-offset-2 transition-colors">
            {news.headline}
          </h2>
        </Link>
        {news.summary && (
          <p className="line-clamp-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
            {news.summary}
          </p>
        )}
        {news.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {news.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-md bg-[var(--muted)] px-2 py-0.5 text-[11px] font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition cursor-default">
                #{tag}
              </span>
            ))}
          </div>
        )}
        <div className="h-px w-full bg-[var(--border)]" />
        <div className="flex items-center justify-between">
          {news.location && (
            <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] min-w-0 truncate">
              <MapPin size={11} className="shrink-0" />
              {news.location}
            </span>
          )}
          <div className="ml-auto flex items-center gap-0.5">
            <ActionButton
              onClick={handleLike}
              active={liked}
              activeClass="text-[var(--anslation-ds-danger)] bg-[var(--anslation-ds-danger-soft)]"
              hoverClass="hover:text-[var(--anslation-ds-danger)] hover:bg-[var(--anslation-ds-danger-soft)]"
              label="Like"
              count={likes}
              icon={<Heart size={14} className={`transition-transform duration-200 ${liked ? "fill-[var(--anslation-ds-danger)] scale-110" : "fill-transparent group-hover:scale-110"}`} />}
            />
            <ActionButton
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              active={false}
              activeClass=""
              hoverClass="hover:text-[var(--foreground)] hover:bg-[var(--card-hover-bg)]"
              label="Comment"
              count={news.comments}
              icon={<MessageCircle size={14} />}
            />
            <div className="relative">
              <ActionButton
                onClick={handleShare}
                active={shareToast}
                activeClass="text-[var(--anslation-ds-success)] bg-[var(--anslation-ds-success-soft)]"
                hoverClass="hover:text-[var(--foreground)] hover:bg-[var(--card-hover-bg)]"
                label="Share"
                count={news.shares}
                icon={<Share2 size={14} />}
              />
              {shareToast && (
                <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[var(--foreground)] px-2.5 py-1 text-[11px] font-medium text-[var(--card)] animate-fade-in shadow-lg">
                  Link copied!
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
