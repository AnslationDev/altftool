import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ChevronRight, Clock3, Home, RefreshCw } from "lucide-react";
import { blogTaxonomySlug, getBlogFreshness } from "../../data";
import { resolveBlogLede } from "./blogAnswerFirst";

const BLOG_IMAGE_FALLBACK = "/assets/og-default.png";

function isFirebaseBlogImage(src) {
  const value = String(src || "").trim();
  if (!value || value.startsWith("/")) return false;

  try {
    const url = new URL(value);
    return (
      url.hostname === "firebasestorage.googleapis.com" &&
      /\/o\/blogs(?:%2f|%252f|\/)/i.test(url.pathname)
    );
  } catch {
    return false;
  }
}

function getBlogImageSrc(src) {
  const value = String(src || "").trim();
  if (!value) return BLOG_IMAGE_FALLBACK;
  if (value.startsWith("/")) return value;

  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol)
      ? value
      : BLOG_IMAGE_FALLBACK;
  } catch {
    return BLOG_IMAGE_FALLBACK;
  }
}

function formatDate(date) {
  if (!date) return "Recently updated";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export default function BlogHeader({ blog, summary }) {
  const authorName = blog.author || "AltFTool Editorial";
  const freshness = getBlogFreshness(blog);
  // Answer-first lede: the first prose after the H1 has to stand on its own,
  // because that is the sentence answer engines lift. `resolveBlogLede`
  // returns "" when the post only has boilerplate or a repeat of its own
  // opening line, in which case the article body's first paragraph is already
  // the better answer and nothing is added here.
  const lede = typeof summary === "string" ? summary : resolveBlogLede(blog);

  const authorInitial = (authorName.match(/\b\w/g) || ["A"]).slice(0, 2).join("").toUpperCase();

  return (
    <section className="mb-6 w-full sm:mb-10">
      <div className="relative isolate flex min-h-[380px] overflow-hidden rounded-2xl border border-(--border) bg-(--card) shadow-[var(--anslation-ds-shadow-md)] sm:min-h-[480px] sm:rounded-3xl lg:min-h-[520px]">
        <Image
          src={getBlogImageSrc(blog.image)}
          alt={blog.imageAlt || blog.heading}
          fill
          unoptimized={isFirebaseBlogImage(blog.image)}
          sizes="(max-width: 1280px) 100vw, 1280px"
          className="object-cover"
          loading="eager"
          fetchPriority="high"
          priority
        />

        {/* Editorial gradient — strong bottom, subtle top */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/55 to-black/20" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 to-transparent" />

        <div className="relative z-10 mt-auto w-full p-5 sm:p-9 lg:p-12">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="mb-4 flex max-w-full items-center gap-1.5 overflow-x-auto whitespace-nowrap text-[12px] font-medium text-white/70 sm:mb-5"
          >
            <Link href="/" className="inline-flex items-center gap-1 transition hover:text-white">
              <Home className="h-3.5 w-3.5" />
              Home
            </Link>
            <ChevronRight className="h-3 w-3 shrink-0 opacity-60" />
            <Link href="/blogs" className="transition hover:text-white">
              Blogs
            </Link>
            <ChevronRight className="h-3 w-3 shrink-0 opacity-60" />
            <Link
              href={`/blogs/category/${blogTaxonomySlug(blog.category)}`}
              className="min-w-0 truncate transition hover:text-white"
            >
              {blog.category}
            </Link>
          </nav>

          {/* Category pill row */}
          <div className="mb-4 flex flex-wrap items-center gap-2 sm:mb-5">
            <Link
              href={`/blogs/category/${blogTaxonomySlug(blog.category)}`}
              className="inline-flex h-7 items-center rounded-md bg-(--primary) px-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-(--primary-foreground) transition hover:bg-(--primary-hover)"
            >
              {blog.category}
            </Link>
            {blog.tool && blog.tool !== blog.category ? (
              <span className="inline-flex h-7 items-center rounded-md border border-white/20 bg-white/10 px-2.5 text-[11px] font-semibold text-white backdrop-blur">
                {blog.tool}
              </span>
            ) : null}
          </div>

          {/* Headline */}
          <h1
            id="blog-article-title"
            className="max-w-5xl text-3xl font-semibold leading-[1.1] tracking-[-0.015em] text-white sm:text-5xl lg:text-6xl"
          >
            {blog.heading}
          </h1>

          {lede ? (
            <p
              id="article-summary"
              data-article-summary="true"
              className="mt-4 max-w-3xl text-sm leading-relaxed text-white sm:mt-5 sm:text-base"
            >
              {lede}
            </p>
          ) : null}

          {/* Author + meta row — editorial style */}
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 sm:mt-8">
            <Link
              href={`/blogs/author/${blogTaxonomySlug(authorName)}`}
              className="inline-flex items-center gap-2.5 group"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-xs font-bold text-white backdrop-blur border border-white/20 transition group-hover:bg-(--primary) group-hover:border-(--primary)">
                {authorInitial}
              </span>
              <span className="flex flex-col">
                <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-white/60">
                  Written by
                </span>
                <span className="text-sm font-semibold text-white transition group-hover:text-(--primary)">
                  {authorName}
                </span>
              </span>
            </Link>

            <span className="hidden h-8 w-px bg-white/15 sm:inline-block" aria-hidden="true" />

            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-white/75 sm:text-sm">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 opacity-70" />
                {formatDate(blog.date)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-3.5 w-3.5 opacity-70" />
                {blog.readTime}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <RefreshCw className="h-3.5 w-3.5 opacity-70" />
                {freshness.label}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
