import Link from "next/link";
import Image from "next/image";
import { Clock, ArrowUpRight } from "lucide-react";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function readTime(blog = {}) {
  if (blog.readTime) return blog.readTime;
  const excerpt = blog.excerpt || "";
  return `${Math.max(1, Math.ceil(excerpt.split(" ").length / 200))} min read`;
}

// ─── Vertical card (default) — image-led ────────────────────────────────────────

function VerticalCard({ blog, height, showExcerpt, className }) {
  return (
    <Link
      href={`/blogs/${blog.slug}`}
      className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:ring-offset-2 focus-visible:ring-offset-(--background) rounded-2xl"
    >
      <article
        className={`relative overflow-hidden rounded-2xl border border-(--border) bg-(--card)
          transition-all duration-200 ease-out motion-reduce:transition-none
          group-hover:-translate-y-1 group-hover:border-(--anslation-ds-border-strong)
          group-hover:shadow-[var(--anslation-ds-shadow-lg)]
          ${height} ${className}`}
      >
        {/* Full-bleed image */}
        <Image
          src={blog.image}
          alt={blog.imageAlt || blog.heading}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none"
        />

        {/* Editorial gradient — darker bottom for legibility */}
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Top accent on hover */}
        <div aria-hidden="true" className="absolute top-0 left-0 right-0 h-[2px] bg-(--primary) scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left motion-reduce:transition-none" />

        {/* Read-time pill — top right */}
        <div className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white/95 backdrop-blur-sm">
          <Clock size={11} className="opacity-80" aria-hidden="true" />
          {readTime(blog)}
        </div>

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          {/* Category — glass pill over imagery */}
          <span className="mb-3 inline-flex items-center rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-sm">
            {blog.category}
          </span>

          {/* Heading */}
          <h3 className="text-base sm:text-lg font-semibold leading-snug tracking-tight line-clamp-2 text-white transition-colors duration-200">
            {blog.heading}
          </h3>

          {showExcerpt && blog.excerpt && (
            <p className="mt-2 text-sm leading-relaxed line-clamp-2 text-white/75">
              {blog.excerpt}
            </p>
          )}

          {/* Read CTA — appears on hover */}
          <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-white opacity-0 translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0">
            Read article
            <ArrowUpRight size={12} aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none" />
          </div>
        </div>
      </article>
    </Link>
  );
}

// ─── Horizontal card — editorial list row ────────────────────────────────────────

function HorizontalCard({ blog, className }) {
  return (
    <Link
      href={`/blogs/${blog.slug}`}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:ring-offset-2 focus-visible:ring-offset-(--background) rounded-2xl"
    >
      <article
        className={`flex flex-col overflow-hidden rounded-2xl sm:flex-row
          border border-(--border) bg-(--card)
          transition-all duration-200 ease-out motion-reduce:transition-none
          group-hover:-translate-y-0.5 group-hover:border-(--anslation-ds-border-strong)
          group-hover:shadow-[var(--anslation-ds-shadow-lg)]
          ${className}`}
      >
        {/* Image */}
        <div className="relative h-44 w-full flex-shrink-0 overflow-hidden bg-(--anslation-ds-soft) sm:h-auto sm:w-56">
          <Image
            src={blog.image}
            alt={blog.imageAlt || blog.heading}
            fill
            sizes="(max-width: 640px) 100vw, 224px"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none"
          />
          {/* Category — glass pill over imagery */}
          <span className="absolute bottom-3 left-3 inline-flex items-center rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-sm">
            {blog.category}
          </span>
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center gap-2 p-5 flex-1 min-w-0">
          <h3 className="text-base sm:text-[17px] font-semibold leading-snug tracking-tight line-clamp-2 text-(--foreground) group-hover:text-(--primary) transition-colors duration-200 motion-reduce:transition-none">
            {blog.heading}
          </h3>

          {blog.excerpt ? (
            <p className="text-sm text-(--muted-foreground) line-clamp-2 leading-relaxed">
              {blog.excerpt}
            </p>
          ) : null}

          <div className="mt-1 inline-flex items-center gap-3 text-xs font-medium text-(--muted-foreground)">
            <span className="inline-flex items-center gap-1">
              <Clock size={11} aria-hidden="true" />
              {readTime(blog)}
            </span>
            <span
              aria-hidden="true"
              className="inline-block h-3 w-px bg-(--border)"
            />
            <span className="inline-flex items-center gap-1 text-(--primary) opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 font-semibold motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-x-0">
              Read article
              <ArrowUpRight size={11} aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

// ─── Editorial card — text-led with small image (Stripe-blog style) ─────────────

function EditorialCard({ blog, className }) {
  return (
    <Link
      href={`/blogs/${blog.slug}`}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:ring-offset-2 focus-visible:ring-offset-(--background) rounded-2xl"
    >
      <article
        className={`flex flex-col overflow-hidden rounded-2xl border border-(--border) bg-(--card)
          transition-all duration-200 ease-out motion-reduce:transition-none
          group-hover:-translate-y-1 group-hover:border-(--anslation-ds-border-strong)
          group-hover:shadow-[var(--anslation-ds-shadow-lg)]
          ${className}`}
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-(--anslation-ds-soft)">
          <Image
            src={blog.image}
            alt={blog.imageAlt || blog.heading}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 420px"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none"
          />
          {/* Category — glass pill over imagery */}
          <span className="absolute bottom-3 left-3 inline-flex items-center rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-sm">
            {blog.category}
          </span>
        </div>
        <div className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em]">
            <span className="inline-flex items-center gap-1 text-(--muted-foreground)">
              <Clock size={11} aria-hidden="true" />
              {readTime(blog)}
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold leading-snug tracking-tight line-clamp-2 text-(--foreground) group-hover:text-(--primary) transition-colors duration-200 motion-reduce:transition-none">
            {blog.heading}
          </h3>
          {blog.excerpt ? (
            <p className="text-sm text-(--muted-foreground) line-clamp-2 leading-relaxed">
              {blog.excerpt}
            </p>
          ) : null}
        </div>
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
  if (variant === "editorial") {
    return <EditorialCard blog={blog} className={className} />;
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
