"use client";
import Link from "next/link";
import Image from "next/image";
import { Clock, ArrowUpRight } from "lucide-react";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function readTime(excerpt = "") {
  return `${Math.max(1, Math.ceil(excerpt.split(" ").length / 200))} min`;
}

const CATEGORY_STYLES = {
  Extensions:  "bg-blue-600",
  Design:      "bg-sky-600",
  Performance: "bg-indigo-600",
  Tutorials:   "bg-cyan-600",
  default:     "bg-blue-700",
};

function getCategoryBg(category = "") {
  return CATEGORY_STYLES[category] || CATEGORY_STYLES.default;
}

// ─── Vertical card (default) ────────────────────────────────────────────────────

function VerticalCard({ blog, height, showExcerpt, className }) {
  return (
    <Link href={`/blogs/${blog.slug}`} className="group block h-full">
      <article
        className={`relative overflow-hidden rounded-2xl shadow-sm
          hover:shadow-xl hover:shadow-blue-200/50 hover:-translate-y-1
          transition-all duration-300 ${height} ${className}`}
      >
        {/* Full-bleed image */}
        <Image
          src={blog.image}
          alt={blog.imageAlt || blog.heading}
          fill
          className="object-cover group-hover:scale-[1.06] transition-transform duration-700 ease-in-out"
        />

        {/* Gradient overlay — stronger at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/85 via-gray-900/30 to-transparent" />

        {/* Blue shimmer accent line at top on hover */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-500
                        scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

        {/* Read time — top right */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm
                        text-white/90 text-[10px] font-semibold px-2 py-1 rounded-full
                        opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0
                        transition-all duration-300">
          <Clock size={9} />
          {readTime(blog.excerpt)}
        </div>

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Category */}
          <span className={`inline-block mb-2.5 px-2.5 py-0.5 text-[10px] font-bold uppercase
            tracking-widest rounded-full text-white ${getCategoryBg(blog.category)}`}>
            {blog.category}
          </span>

          {/* Heading */}
          <h3 className="text-[15px] font-bold leading-snug line-clamp-2 text-white
                         group-hover:text-blue-200 transition-colors duration-200">
            {blog.heading}
          </h3>

          {showExcerpt && (
            <p className="text-[12px] mt-1.5 line-clamp-2 text-white/70 leading-relaxed">
              {blog.excerpt}
            </p>
          )}

          {/* Read arrow — appears on hover */}
          <div className="flex items-center gap-1.5 mt-2.5 text-[11px] font-semibold text-blue-300
                          opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0
                          transition-all duration-300">
            Read article
            <ArrowUpRight size={12} />
          </div>
        </div>
      </article>
    </Link>
  );
}

// ─── Horizontal card ────────────────────────────────────────────────────────────

function HorizontalCard({ blog, className }) {
  return (
    <Link href={`/blogs/${blog.slug}`} className="group block">
      <article
        className={`flex flex-col sm:flex-row rounded-2xl overflow-hidden
          border border-(--border) bg-(--card)
          shadow-sm hover:shadow-lg hover:shadow-blue-100/60 hover:-translate-y-0.5
          transition-all duration-300 ${className}`}
      >
        {/* Image */}
        <div className="relative w-full h-44 sm:w-52 sm:h-auto flex-shrink-0 overflow-hidden bg-blue-50">
          <Image
            src={blog.image}
            alt={blog.imageAlt || blog.heading}
            fill
            className="object-cover group-hover:scale-[1.05] transition-transform duration-500"
          />
          {/* Blue overlay on hover */}
          <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Category pill over image */}
          <span className={`absolute bottom-2.5 left-2.5 px-2.5 py-0.5 text-[10px] font-bold
            uppercase tracking-widest rounded-full text-white shadow-sm ${getCategoryBg(blog.category)}`}>
            {blog.category}
          </span>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col justify-center gap-2 flex-1">
          <h3 className="text-[14px] md:text-[15px] font-bold leading-snug line-clamp-2
                         text-(--foreground) group-hover:text-blue-600 transition-colors duration-200">
            {blog.heading}
          </h3>

          <p className="text-[12px] text-(--muted-foreground) line-clamp-2 leading-relaxed">
            {blog.excerpt}
          </p>

          <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold text-blue-600
                          opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0
                          transition-all duration-200">
            Read more <ArrowUpRight size={11} />
          </div>
        </div>

        {/* Right blue accent bar */}
        <div className="hidden sm:block w-0.5 bg-gradient-to-b from-blue-500 to-indigo-500
                        scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top self-stretch" />
      </article>
    </Link>
  );
}

// ─── Export ─────────────────────────────────────────────────────────────────────

export default function BlogCard({
  blog,
  variant = "vertical",
  height = "h-64",
  showExcerpt = false,
  className = "",
}) {
  if (variant === "horizontal") {
    return <HorizontalCard blog={blog} className={className} />;
  }
  return (
    <VerticalCard
      blog={blog}
      height={height}
      showExcerpt={showExcerpt}
      className={className}
    />
  );
}