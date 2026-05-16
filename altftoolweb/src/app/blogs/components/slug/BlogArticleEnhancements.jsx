"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Hash, Lightbulb, ListChecks } from "lucide-react";
import { blogTaxonomySlug, stripHtml } from "../../data";

function getHeadingText(innerHtml) {
  return stripHtml(innerHtml)
    .replace(/&amp;/gi, "&")
    .replace(/&nbsp;/gi, " ")
    .trim();
}

function extractTakeaways(content = "", excerpt = "") {
  const headings = [];
  const headingPattern = /<h([2-3])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
  let match;

  while ((match = headingPattern.exec(content))) {
    const text = getHeadingText(match[2]);
    if (text && !headings.includes(text)) headings.push(text);
    if (headings.length >= 4) break;
  }

  if (headings.length >= 3) return headings.slice(0, 4);

  const sentences = stripHtml(excerpt || content)
    .split(/[.!?]\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 24);

  return [...headings, ...sentences].slice(0, 4);
}

export default function BlogArticleEnhancements({ blog, relatedPosts = [] }) {
  const takeaways = extractTakeaways(blog.description, blog.excerpt);
  const tags = Array.isArray(blog.tags) ? blog.tags.filter(Boolean).slice(0, 8) : [];
  const nextPosts = relatedPosts.slice(0, 2);

  if (!takeaways.length && !tags.length && !nextPosts.length) return null;

  return (
    <div className="mt-6 space-y-4">
      {takeaways.length ? (
        <section className="rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) p-4 shadow-[var(--anslation-ds-shadow-sm)] sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-[6px] bg-(--muted) text-(--primary)">
              <ListChecks className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-(--muted-foreground)">
                Quick Summary
              </p>
              <h2 className="text-lg font-semibold tracking-normal text-(--foreground)">
                Key takeaways
              </h2>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {takeaways.map((item, index) => (
              <div
                key={`${item}-${index}`}
                className="flex gap-2 rounded-[6px] border border-(--border) bg-(--background) p-3"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-(--primary)" />
                <p className="text-sm leading-6 text-(--muted-foreground)">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
        {tags.length ? (
          <section className="rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) p-4 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="mb-3 flex items-center gap-2">
              <Hash className="h-4 w-4 text-(--primary)" />
              <h2 className="text-sm font-semibold text-(--foreground)">Explore tags</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blogs/tag/${blogTaxonomySlug(tag)}`}
                  className="inline-flex h-8 items-center rounded-[6px] border border-(--border) bg-(--background) px-3 text-xs font-semibold text-(--muted-foreground) transition hover:border-(--primary) hover:text-(--foreground)"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {nextPosts.length ? (
          <section className="rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) p-4 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-(--primary)" />
              <h2 className="text-sm font-semibold text-(--foreground)">Read next</h2>
            </div>
            <div className="space-y-2">
              {nextPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blogs/${post.slug}`}
                  className="group flex items-center justify-between gap-3 rounded-[6px] border border-(--border) bg-(--background) p-3 transition hover:border-(--primary)"
                >
                  <span className="line-clamp-2 text-sm font-semibold leading-snug text-(--foreground) group-hover:text-(--primary)">
                    {post.heading}
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-(--primary)" />
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
