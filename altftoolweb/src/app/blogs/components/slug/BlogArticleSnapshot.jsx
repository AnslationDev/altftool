"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  MessageCircleQuestion,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { blogTaxonomySlug, getBlogFreshness, stripHtml } from "../../data";
import { recordBlogToolClick } from "../../context/views.service";

function cleanText(value = "") {
  return stripHtml(String(value || ""))
    .replace(/&amp;/gi, "&")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractSnapshotItems(blog = {}) {
  const content = blog.description || blog.content || blog.body || "";
  const headingPattern = /<h([2-3])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
  const headings = [];
  let match = headingPattern.exec(content);

  while (match) {
    const text = cleanText(match[2]);
    if (text && !headings.some((item) => item.toLowerCase() === text.toLowerCase())) {
      headings.push(text);
    }
    if (headings.length >= 4) break;
    match = headingPattern.exec(content);
  }

  if (headings.length >= 3) return headings.slice(0, 4);

  const sentences = cleanText(blog.excerpt || content)
    .split(/[.!?]\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 32);

  return [...headings, ...sentences].slice(0, 4);
}

function formatDate(value) {
  if (!value) return "Recently reviewed";
  const date = value?.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently reviewed";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function trackToolClick(blog, tool) {
  recordBlogToolClick({
    blogId: typeof blog?.id === "string" ? blog.id : "",
    blogSlug: blog?.slug || "",
    toolSlug: tool?.slug,
    placement: "article-snapshot",
  });
}

export default function BlogArticleSnapshot({
  blog,
  faqItems = [],
  relatedTools = [],
  relatedPosts = [],
}) {
  if (!blog) return null;

  const items = extractSnapshotItems(blog);
  const primaryTool = relatedTools[0];
  const nextPost = relatedPosts[0];
  const sourceCount = Array.isArray(blog.sources)
    ? blog.sources.filter((source) => source?.title || source?.url).length
    : 0;
  const freshness = getBlogFreshness(blog);
  const reviewDate = formatDate(blog.reviewedAt || blog.updatedAt || blog.date || blog.createdAt);
  const categoryHref = `/blogs/category/${blogTaxonomySlug(blog.category || "guides")}`;

  if (!items.length && !primaryTool && !nextPost && !sourceCount && !faqItems.length) return null;

  return (
    <section className="mt-5 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) p-4 shadow-[var(--anslation-ds-shadow-sm)] sm:p-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="min-w-0">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-[6px] bg-(--muted) text-(--primary)">
              <BookOpenCheck className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-(--muted-foreground)">
                Article overview
              </p>
              <h2 className="text-lg font-semibold tracking-normal text-(--foreground)">
                What this guide covers
              </h2>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {items.map((item, index) => (
              <div key={`${item}-${index}`} className="flex min-w-0 gap-2 border-t border-(--border) pt-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-(--primary)" />
                <p className="text-sm leading-6 text-(--muted-foreground)">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="min-w-0 border-t border-(--border) pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-(--muted-foreground)">
            Reader path
          </p>
          <div className="mt-3 space-y-2">
            {primaryTool ? (
              <Link
                href={primaryTool.href}
                onClick={() => trackToolClick(blog, primaryTool)}
                className="group flex items-center justify-between gap-3 rounded-[6px] bg-(--primary) px-3 py-2.5 text-sm font-semibold text-(--primary-foreground) transition hover:bg-(--primary-active)"
              >
                <span className="inline-flex min-w-0 items-center gap-2">
                  <Wrench className="h-4 w-4 shrink-0" />
                  <span className="truncate">Try {primaryTool.name}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 transition group-hover:translate-x-0.5" />
              </Link>
            ) : null}

            {nextPost ? (
              <Link
                href={`/blogs/${nextPost.slug}`}
                className="group flex items-center justify-between gap-3 rounded-[6px] border border-(--border) bg-(--background) px-3 py-2.5 text-sm font-semibold text-(--foreground) transition hover:border-(--primary) hover:text-(--primary)"
              >
                <span className="line-clamp-1 min-w-0">Next: {nextPost.heading || nextPost.title}</span>
                <ArrowRight className="h-4 w-4 shrink-0 transition group-hover:translate-x-0.5" />
              </Link>
            ) : (
              <Link
                href={categoryHref}
                className="group flex items-center justify-between gap-3 rounded-[6px] border border-(--border) bg-(--background) px-3 py-2.5 text-sm font-semibold text-(--foreground) transition hover:border-(--primary) hover:text-(--primary)"
              >
                <span className="truncate">More {blog.category || "guides"}</span>
                <ArrowRight className="h-4 w-4 shrink-0 transition group-hover:translate-x-0.5" />
              </Link>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <a
              href={faqItems.length ? "#faq" : categoryHref}
              className="flex items-center gap-1.5 rounded-[6px] bg-(--muted) px-2.5 py-2 font-semibold text-(--muted-foreground) transition hover:text-(--primary)"
            >
              <MessageCircleQuestion className="h-3.5 w-3.5 text-(--primary)" />
              {faqItems.length ? `${faqItems.length} FAQs` : "Topic archive"}
            </a>
            <a
              href={sourceCount ? "#sources" : "/policypages/about"}
              className="flex items-center gap-1.5 rounded-[6px] bg-(--muted) px-2.5 py-2 font-semibold text-(--muted-foreground) transition hover:text-(--primary)"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-(--primary)" />
              {sourceCount ? `${sourceCount} sources` : "Review policy"}
            </a>
          </div>

          <div className="mt-3 rounded-[6px] bg-(--muted) px-3 py-2 text-xs leading-5 text-(--muted-foreground)">
            {freshness.label} on {reviewDate}
            {blog.reviewedBy ? ` by ${blog.reviewedBy}` : ""}.
          </div>
        </aside>
      </div>
    </section>
  );
}
