"use client";
import Link from "next/link";
import Image from "next/image";
import { Clock, ArrowUpRight } from "lucide-react";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function readTime(blog = {}) {
  if (blog.readTime) return blog.readTime;
  const excerpt = blog.excerpt || "";
  return `${Math.max(1, Math.ceil(excerpt.split(" ").length / 200))} min read`;
}

// ─── Vertical card (default) ────────────────────────────────────────────────────

function VerticalCard({ blog, height, showExcerpt, className }) {
  return (
    <Link href={`/blogs/${blog.slug}`} className="group block h-full">
      <article
        className={`relative overflow-hidden rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) shadow-[var(--anslation-ds-shadow-sm)]
          hover:-translate-y-0.5 hover:border-(--primary) hover:shadow-[var(--anslation-ds-shadow-md)]
          transition-all duration-300 ${height} ${className}`}
      >
        {/* Full-bleed image */}
        <Image
          src={blog.image}
          alt={blog.imageAlt || blog.heading}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
          className="object-cover group-hover:scale-[1.06] transition-transform duration-700 ease-in-out"
        />

        {/* Gradient overlay — stronger at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/85 via-gray-900/30 to-transparent" />

        <div className="absolute top-0 left-0 right-0 h-0.5 bg-(--primary)
                        scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

        {/* Read time — top right */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm
                        text-white/90 text-[10px] font-semibold px-2 py-1 rounded-full
                        opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0
                        transition-all duration-300">
          <Clock size={9} />
          {readTime(blog)}
        </div>

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Category */}
          <span className="mb-2.5 inline-block rounded-[6px] bg-(--primary) px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-(--primary-foreground)">
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
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-semibold text-white
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
        className={`flex flex-col overflow-hidden rounded-[var(--anslation-ds-radius)] sm:flex-row
          border border-(--border) bg-(--card)
          shadow-[var(--anslation-ds-shadow-sm)] hover:-translate-y-0.5 hover:border-(--primary) hover:shadow-[var(--anslation-ds-shadow-md)]
          transition-all duration-300 ${className}`}
      >
        {/* Image */}
        <div className="relative h-44 w-full flex-shrink-0 overflow-hidden bg-(--muted) sm:h-auto sm:w-52">
          <Image
            src={blog.image}
            alt={blog.imageAlt || blog.heading}
            fill
            sizes="(max-width: 640px) 100vw, 208px"
            className="object-cover group-hover:scale-[1.05] transition-transform duration-500"
          />
          {/* Blue overlay on hover */}
          <div className="absolute inset-0 bg-(--primary)/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Category pill over image */}
          <span className="absolute bottom-2.5 left-2.5 rounded-[6px] bg-(--primary) px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-(--primary-foreground) shadow-sm">
            {blog.category}
          </span>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col justify-center gap-2 flex-1">
          <h3 className="text-[14px] md:text-[15px] font-bold leading-snug line-clamp-2
                         text-(--foreground) group-hover:text-(--primary) transition-colors duration-200">
            {blog.heading}
          </h3>

          <p className="text-[12px] text-(--muted-foreground) line-clamp-2 leading-relaxed">
            {blog.excerpt}
          </p>

          <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-(--primary)
                          opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0
                          transition-all duration-200">
            Read more <ArrowUpRight size={11} />
          </div>
        </div>

        {/* Right blue accent bar */}
        <div className="hidden w-0.5 bg-(--primary) sm:block
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
