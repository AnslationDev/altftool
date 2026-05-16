"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Clock3, RefreshCw, UserRound } from "lucide-react";
import { useEffect, useRef } from "react";
import { blogTaxonomySlug, getBlogFreshness } from "../../data";

function formatDate(date) {
  if (!date) return "Recently updated";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export default function BlogHeader({ blog }) {
  const headingRef = useRef(null);
  const authorName = blog.author || "AltFTool Editorial";
  const freshness = getBlogFreshness(blog);

  useEffect(() => {
    const el = headingRef.current;
    if (!el) return;
    el.classList.add("opacity-0", "translate-y-4");
    const timer = setTimeout(() => {
      el.style.transition = "opacity 0.7s ease, transform 0.7s ease";
      el.classList.remove("opacity-0", "translate-y-4");
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="mb-8 w-full">
      <div className="relative isolate flex min-h-[460px] overflow-hidden rounded-[var(--anslation-ds-radius-lg)] border border-(--border) bg-(--card) shadow-[var(--anslation-ds-shadow-md)] sm:min-h-[520px] lg:min-h-[560px]">
        <Image
          src={blog.image}
          alt={blog.imageAlt || blog.heading}
          fill
          sizes="(max-width: 1280px) 100vw, 1280px"
          className="object-cover"
          loading="eager"
          fetchPriority="high"
          priority
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/15" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent" />

        <div className="relative z-10 mt-auto w-full p-5 sm:p-8 lg:p-10">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Link
              href={`/blogs/category/${blogTaxonomySlug(blog.category)}`}
              className="inline-flex h-8 items-center rounded-[6px] bg-(--primary) px-3 text-xs font-bold uppercase tracking-wide text-(--primary-foreground) transition hover:bg-(--primary-active)"
            >
              {blog.category}
            </Link>
            {blog.tool && blog.tool !== blog.category ? (
              <span className="inline-flex h-8 items-center rounded-[6px] border border-white/20 bg-white/10 px-3 text-xs font-semibold text-white backdrop-blur">
                {blog.tool}
              </span>
            ) : null}
          </div>

          <h1
            ref={headingRef}
            className="max-w-5xl text-3xl font-semibold leading-tight tracking-normal text-white sm:text-5xl lg:text-6xl"
          >
            {blog.heading}
          </h1>

          {blog.excerpt ? (
            <p className="mt-4 max-w-3xl text-sm leading-6 text-white/78 sm:text-base">
              {blog.excerpt}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs font-semibold text-white/78 sm:text-sm">
            <Link
              href={`/blogs/author/${blogTaxonomySlug(authorName)}`}
              className="inline-flex h-9 items-center gap-2 rounded-[6px] border border-white/15 bg-white/10 px-3 backdrop-blur transition hover:bg-white/15"
            >
              <UserRound className="h-4 w-4" />
              {authorName}
            </Link>
            <span className="inline-flex h-9 items-center gap-2 rounded-[6px] border border-white/15 bg-white/10 px-3 backdrop-blur">
              <CalendarDays className="h-4 w-4" />
              {formatDate(blog.date)}
            </span>
            <span className="inline-flex h-9 items-center gap-2 rounded-[6px] border border-white/15 bg-white/10 px-3 backdrop-blur">
              <Clock3 className="h-4 w-4" />
              {blog.readTime}
            </span>
            <span className="inline-flex h-9 items-center gap-2 rounded-[6px] border border-white/15 bg-white/10 px-3 backdrop-blur">
              <RefreshCw className="h-4 w-4" />
              {freshness.label}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
