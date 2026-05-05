"use client";
import React, { useState } from "react";
import Link from "next/link";
import AdCard from "./AdCard";
import { useAds } from "@/ads/AdsProvider";
import ManagedImage from "@/components/ui/ManagedImage";
import { Clock, ArrowRight, TrendingUp, Flame } from "lucide-react";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function readTime(excerpt = "") {
  return `${Math.max(1, Math.ceil(excerpt.split(" ").length / 200))} min`;
}

const CATEGORY_STYLES = {
  Extensions:  "bg-blue-50 text-blue-700 border-blue-200",
  Design:      "bg-sky-50 text-sky-700 border-sky-200",
  Performance: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Tutorials:   "bg-cyan-50 text-cyan-700 border-cyan-200",
  default:     "bg-slate-50 text-slate-600 border-slate-200",
};

function getCategoryStyle(category = "") {
  return CATEGORY_STYLES[category] || CATEGORY_STYLES.default;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

// ─── Post Card ─────────────────────────────────────────────────────────────────

function PostCard({ post, index }) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <Link
      href={`/blogs/${post.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-(--card) border border-(--border)
                 shadow-sm hover:shadow-xl hover:shadow-blue-100/60 hover:-translate-y-1
                 transition-all duration-300 h-full"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Image */}
      <div className="relative overflow-hidden h-44 bg-gradient-to-br from-blue-50 to-slate-100 flex-shrink-0">
        {!imgLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 bg-[length:200%_100%]" />
        )}
        <ManagedImage
          src={post.image}
          alt={post.imageAlt || post.heading}
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-[1.06]
                      ${imgLoaded ? "opacity-100" : "opacity-0"}`}
        />

        {/* Blue overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 via-transparent to-transparent
                        opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

        {/* Trending badge on first 3 */}
        {index < 3 && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-blue-600 text-white
                          text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
            <Flame size={9} />
            HOT
          </div>
        )}

        {/* Read time chip */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm
                        text-gray-700 text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm
                        translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <Clock size={9} />
          {readTime(post.excerpt)}
        </div>

        {/* Post number */}
        <div className="absolute top-3 right-3 w-6 h-6 bg-black/40 backdrop-blur-sm rounded-full
                        flex items-center justify-center">
          <span className="text-white text-[10px] font-bold">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        {/* Meta row */}
        <div className="flex items-center gap-2">
          {post.category && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getCategoryStyle(post.category)}`}>
              {post.category}
            </span>
          )}
          <span className="text-[11px] text-gray-400 ml-auto flex items-center gap-1">
            <Clock size={9} />
            {formatDate(post.date)}
          </span>
        </div>

        {/* Heading */}
        <h3 className="text-[14px] font-bold leading-snug text-(--foreground) line-clamp-2
                       group-hover:text-blue-600 transition-colors duration-200">
          {post.heading}
        </h3>

        {/* Excerpt */}
        <p className="text-[12px] text-(--muted-foreground) line-clamp-2 leading-relaxed mt-auto pt-1">
          {post.excerpt}
        </p>

        {/* Read more */}
        <div className="flex items-center gap-1.5 mt-2 text-[12px] font-semibold text-blue-600
                        opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0
                        transition-all duration-200">
          Read article
          <ArrowRight size={11} />
        </div>
      </div>

      {/* Bottom blue accent bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500
                      scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </Link>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

const FeaturedPostsSection = ({ posts = [], title = "Featured Posts" }) => {
  const ads = useAds({ placement: "trending_section" });

  if (!posts.length) return null;

  return (
    <section className="w-full">

      {/* ── Section Header ── */}
      <div className="flex flex-col items-center gap-2 mb-8 text-center">
        <div className="flex items-center w-full gap-4">
          {/* Left line with gradient */}
          <div className="flex-1 h-px bg-gradient-to-l from-blue-200 to-transparent" />

          {/* Title block */}
          <div className="flex flex-col items-center gap-1.5">
            {/* Eyebrow */}
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600
                            text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
              <TrendingUp size={10} />
              Trending Now
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-(--foreground) tracking-tight whitespace-nowrap">
              Posts You&apos;ll{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-blue-600">Love</span>
                {/* Underline squiggle */}
                <svg
                  className="absolute -bottom-1 left-0 w-full"
                  viewBox="0 0 80 6"
                  preserveAspectRatio="none"
                  height="6"
                >
                  <path
                    d="M0,4 Q20,0 40,4 Q60,8 80,4"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h2>
          </div>

          {/* Right line */}
          <div className="flex-1 h-px bg-gradient-to-r from-blue-200 to-transparent" />
        </div>

        <p className="text-sm text-(--muted-foreground) mt-1">
          Handpicked reads from our editorial team
        </p>
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Posts grid */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((post, i) => (
            <PostCard key={post.id || i} post={post} index={i} />
          ))}
        </div>

        {/* Ads column */}
        <div className="flex flex-col gap-5">

          {ads.slice(0, 3).map((ad, i) => (
            <div
              key={i}
            >
              <AdCard src={ad} height="h-80" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedPostsSection;
