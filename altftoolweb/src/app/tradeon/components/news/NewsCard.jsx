// src/app/tradeon/components/news/NewsCard.jsx
// Shared news card used across the News module (home section, full page, dashboard
// widget, related lists). Theme-aware via Tradeon tokens. Opens the news detail
// page. Two layouts: "grid" (image on top) and "row" (compact horizontal).
"use client";

import Link from "next/link";
import { useState } from "react";

export const CAT_COLOR = {
  "indian-stocks": "#0d9488", "global-stocks": "#22d3ee", indices: "#8b5cf6",
  crypto: "#f7931a", forex: "#10c477", commodities: "#f7b955", etfs: "#a855f7",
  ipos: "#ec4899", "mutual-funds": "#0ea5e9", economy: "#f5426c", rbi: "#ef4444",
  corporate: "#14b8a6", earnings: "#f59e0b",
};

// Relative time from a shared `now` (ms) so cards don't each run a timer; falls
// back to an absolute short date before `now` is set or for older items.
export function timeAgo(iso, now) {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (!now) return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const m = Math.floor(Math.max(0, now - t) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function NewsThumb({ src, color, alt = "", className = "", rounded = "" }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={`${className} ${rounded} grid place-items-center`} style={{ background: `linear-gradient(135deg, ${color}, color-mix(in srgb, ${color} 45%, #05060c))` }}>
        <span className="text-white/85 text-xs font-black tracking-wide">{(alt || "NEWS").slice(0, 2).toUpperCase()}</span>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`object-cover ${className} ${rounded}`} />
  );
}

export default function NewsCard({ article, now, variant = "grid" }) {
  const color = CAT_COLOR[article.category] || "#0d9488";
  const href = `/tradeon/news/${article.slug || article.id}`;

  if (variant === "row") {
    return (
      <Link href={href} className="group flex gap-3 py-2.5 -mx-2 px-2 rounded-lg transition-colors hover:bg-[color-mix(in_srgb,var(--tdn-iris)_5%,transparent)]">
        <NewsThumb src={article.image} color={color} alt={article.source} className="w-16 h-16 shrink-0 transition-transform duration-300 group-hover:scale-[1.04]" rounded="rounded-lg" />
        <div className="min-w-0 flex-1">
          <span className="block text-[0.6rem] mb-1" style={{ color: "var(--tdn-faint)" }}>{timeAgo(article.publishedAt, now)}</span>
          <p className="text-[0.82rem] font-medium leading-snug line-clamp-2 group-hover:text-[var(--tdn-iris-2)] transition-colors" style={{ color: "var(--tdn-fg)" }}>{article.title}</p>
          <span className="text-[0.62rem]" style={{ color: "var(--tdn-muted)" }}>{article.source}</span>
        </div>
      </Link>
    );
  }

  return (
    <Link href={href} className="group tdn-lift flex flex-col overflow-hidden rounded-xl" style={{ border: "1px solid var(--tdn-border)", background: "var(--tdn-card)" }}>
      <div className="relative overflow-hidden" style={{ aspectRatio: "16 / 9" }}>
        <NewsThumb src={article.image} color={color} alt={article.title} className="w-full h-full transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div className="p-3.5 flex flex-col flex-1">
        <h3 className="text-sm font-semibold leading-snug line-clamp-3 group-hover:text-[var(--tdn-iris-2)] transition-colors" style={{ color: "var(--tdn-fg-strong)" }}>{article.title}</h3>
        <div className="flex items-center gap-1.5 mt-auto pt-2.5 text-[0.68rem]" style={{ color: "var(--tdn-faint)" }}>
          <span className="font-semibold truncate" style={{ color: "var(--tdn-muted)" }}>{article.source}</span>
          <span>·</span>
          <span className="shrink-0">{timeAgo(article.publishedAt, now)}</span>
        </div>
      </div>
    </Link>
  );
}
