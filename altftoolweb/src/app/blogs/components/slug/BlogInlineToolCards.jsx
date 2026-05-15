"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Wrench } from "lucide-react";
import { recordBlogToolClick } from "../../context/views.service";

function trackToolClick(blog, tool, placement) {
  recordBlogToolClick({
    blogId: typeof blog?.id === "string" ? blog.id : "",
    blogSlug: blog?.slug || "",
    toolSlug: tool?.slug,
    placement,
  });
}

export default function BlogInlineToolCards({
  blog,
  tools = [],
  placement = "inline",
}) {
  const visibleTools = tools.slice(0, 3);
  if (!visibleTools.length) return null;

  return (
    <aside className="not-prose my-7 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) p-4 shadow-[var(--anslation-ds-shadow-sm)]">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-(--muted-foreground)">
            <Sparkles className="h-3.5 w-3.5 text-(--primary)" />
            Use while reading
          </p>
          <h2 className="mt-1 text-base font-semibold tracking-normal text-(--foreground)">
            Related tools for this step
          </h2>
        </div>
        <span className="rounded-[6px] border border-(--border) px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-(--muted-foreground)">
          Smart CTA
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {visibleTools.map((tool, index) => (
          <Link
            key={tool.slug}
            href={tool.href}
            onClick={() => trackToolClick(blog, tool, placement)}
            className="group rounded-[6px] border border-(--border) bg-(--card) p-3 transition hover:border-(--primary) hover:shadow-[var(--anslation-ds-shadow-sm)]"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] bg-(--muted) text-(--primary)">
                {index === 0 ? <Sparkles className="h-4 w-4" /> : <Wrench className="h-4 w-4" />}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-(--muted-foreground)">
                {tool.matchLabel}
              </span>
            </div>
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-(--foreground) group-hover:text-(--primary)">
              {tool.name}
            </h3>
            <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-(--primary)">
              Open tool
              <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
