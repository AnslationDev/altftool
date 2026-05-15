"use client";

import Link from "next/link";
import { ArrowRight, Search, Sparkles, Wrench } from "lucide-react";
import { recordBlogToolClick } from "../../context/views.service";
import { getRelatedToolsForBlog } from "../../utils/relatedTools";

function trackToolClick(blog, tool, placement = "related") {
  recordBlogToolClick({
    blogId: typeof blog?.id === "string" ? blog.id : "",
    blogSlug: blog?.slug || "",
    toolSlug: tool?.slug,
    placement,
  });
}

export default function BlogRelatedTools({ blog, tools }) {
  const relatedTools = tools?.length ? tools : getRelatedToolsForBlog(blog, 6);

  if (!relatedTools.length) return null;

  const primaryTool = relatedTools[0];

  return (
    <section className="mt-5 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) p-4 shadow-[var(--anslation-ds-shadow-sm)] sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-(--muted-foreground)">
            <Wrench className="h-3.5 w-3.5 text-(--primary)" />
            Tools for this guide
          </div>
          <h2 className="text-lg font-semibold tracking-normal text-(--foreground)">
            Try these related microtools
          </h2>
        </div>
        <Link
          href={primaryTool.searchHref}
          onClick={() => trackToolClick(blog, primaryTool, "browse-similar")}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) px-3 text-sm font-semibold text-(--foreground) transition hover:border-(--primary) hover:text-(--primary)"
        >
          <Search className="h-4 w-4" />
          Browse similar
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {relatedTools.map((tool, index) => (
          <Link
            key={tool.slug}
            href={tool.href}
            onClick={() => trackToolClick(blog, tool)}
            className="group flex min-h-[150px] flex-col rounded-[6px] border border-(--border) bg-(--background) p-3 transition hover:border-(--primary) hover:shadow-[var(--anslation-ds-shadow-sm)]"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] bg-(--muted) text-(--primary)">
                {index === 0 ? <Sparkles className="h-4 w-4" /> : <Wrench className="h-4 w-4" />}
              </span>
              <span className="rounded-full border border-(--border) px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-(--muted-foreground)">
                {tool.matchLabel}
              </span>
            </div>
            <h3 className="mt-3 line-clamp-2 text-sm font-semibold leading-snug text-(--foreground) group-hover:text-(--primary)">
              {tool.name}
            </h3>
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-(--muted-foreground)">
              {tool.description}
            </p>
            <span className="mt-auto flex items-center gap-1.5 pt-3 text-xs font-semibold text-(--primary)">
              Open tool
              <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
