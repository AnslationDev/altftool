"use client";

import Link from "next/link";
import { ArrowRight, BookOpenCheck, Rocket, Wrench } from "lucide-react";
import { blogTaxonomySlug } from "../../data";
import { recordBlogToolClick } from "../../context/views.service";

function trackToolClick(blog, tool) {
  recordBlogToolClick({
    blogId: typeof blog?.id === "string" ? blog.id : "",
    blogSlug: blog?.slug || "",
    toolSlug: tool?.slug,
    placement: "article-completion",
  });
}

export default function BlogCompletionCta({ blog, relatedTools = [], relatedPosts = [] }) {
  const primaryTool = relatedTools[0];
  const nextPost = relatedPosts[0];
  const categoryHref = `/blogs/category/${blogTaxonomySlug(blog?.category || "guides")}`;

  if (!primaryTool && !nextPost && !blog?.category) return null;

  return (
    <aside className="not-prose my-8 border-y border-(--border) bg-(--background) py-5">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-(--muted-foreground)">
            <Rocket className="h-3.5 w-3.5 text-(--primary)" />
            Next action
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-normal text-(--foreground)">
            Put this guide to work
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-(--muted-foreground)">
            Try the matching tool, keep reading the topic, or open a nearby guide while the context is fresh.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row md:flex-col">
          {primaryTool ? (
            <Link
              href={primaryTool.href}
              onClick={() => trackToolClick(blog, primaryTool)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-[6px] bg-(--primary) px-4 text-sm font-semibold text-(--primary-foreground) transition hover:bg-(--primary-active)"
            >
              <Wrench className="h-4 w-4" />
              Open tool
            </Link>
          ) : null}
          <Link
            href={categoryHref}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-[6px] border border-(--border) bg-(--card) px-4 text-sm font-semibold text-(--foreground) transition hover:border-(--primary) hover:text-(--primary)"
          >
            <BookOpenCheck className="h-4 w-4" />
            More guides
          </Link>
        </div>
      </div>

      {nextPost ? (
        <Link
          href={`/blogs/${nextPost.slug}`}
          className="group mt-4 flex items-center justify-between gap-3 rounded-[6px] border border-(--border) bg-(--card) p-3 transition hover:border-(--primary)"
        >
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-(--muted-foreground)">
              Recommended next
            </p>
            <p className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-(--foreground) group-hover:text-(--primary)">
              {nextPost.heading || nextPost.title}
            </p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-(--primary)" />
        </Link>
      ) : null}
    </aside>
  );
}
