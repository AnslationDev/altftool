"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  CalendarClock,
  Copy,
  PenLine,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { blogTaxonomySlug, getBlogFreshness, stripHtml } from "../../data";

function formatDate(value) {
  if (!value) return "Recently updated";
  const date = value?.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently updated";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getSummary(blog = {}) {
  const text = blog.excerpt || stripHtml(blog.description || "");
  if (!text) return "Practical AltFTool guide with quick context, useful next steps, and reader-friendly structure.";
  return text.length > 150 ? `${text.slice(0, 150).replace(/\s+\S*$/, "")}...` : text;
}

export default function BlogReaderCompanion({ blog, relatedPosts = [] }) {
  const [copied, setCopied] = useState(false);
  const nextPosts = relatedPosts.slice(0, 2);
  const updatedLabel = formatDate(blog.reviewedAt || blog.updatedAt || blog.date || blog.createdAt);
  const authorName = blog.author || "AltFTool Editorial";
  const authorRole = blog.authorRole || "AltFTool Editorial";
  const reviewedBy = blog.reviewedBy || "AltFTool Editorial Team";
  const freshness = getBlogFreshness(blog);
  const sourceCount = Array.isArray(blog.sources) ? blog.sources.length : 0;

  const copyLink = async () => {
    await navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <section className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
      <div className="rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) p-4 shadow-[var(--anslation-ds-shadow-sm)] sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--anslation-ds-radius)] bg-(--muted) text-(--primary)">
            <UserRound className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wide text-(--muted-foreground)">
              About this guide
            </p>
            <Link
              href={`/blogs/author/${blogTaxonomySlug(authorName)}`}
              className="mt-1 inline-flex text-lg font-semibold tracking-normal text-(--foreground) transition hover:text-(--primary)"
            >
              {authorName}
            </Link>
            <p className="mt-0.5 text-xs font-semibold text-(--primary)">
              {authorRole}
            </p>
            <p className="mt-2 text-sm leading-6 text-(--muted-foreground)">
              {blog.editorialNote || getSummary(blog)}
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[6px] border border-(--border) bg-(--background) p-3">
            <CalendarClock className="mb-2 h-4 w-4 text-(--primary)" />
            <p className="text-[10px] font-bold uppercase tracking-wide text-(--muted-foreground)">Updated</p>
            <p className="mt-1 text-xs font-semibold text-(--foreground)">{updatedLabel}</p>
          </div>
          <div className="rounded-[6px] border border-(--border) bg-(--background) p-3">
            <RefreshCw className="mb-2 h-4 w-4 text-(--primary)" />
            <p className="text-[10px] font-bold uppercase tracking-wide text-(--muted-foreground)">Freshness</p>
            <p className="mt-1 text-xs font-semibold text-(--foreground)">{freshness.label}</p>
          </div>
          <div className="rounded-[6px] border border-(--border) bg-(--background) p-3">
            <BadgeCheck className="mb-2 h-4 w-4 text-(--primary)" />
            <p className="text-[10px] font-bold uppercase tracking-wide text-(--muted-foreground)">Checked</p>
            <p className="mt-1 text-xs font-semibold text-(--foreground)">{reviewedBy}</p>
          </div>
          <button
            type="button"
            onClick={copyLink}
            className="rounded-[6px] border border-(--border) bg-(--background) p-3 text-left transition hover:border-(--primary) hover:text-(--primary)"
          >
            <Copy className="mb-2 h-4 w-4 text-(--primary)" />
            <p className="text-[10px] font-bold uppercase tracking-wide text-(--muted-foreground)">Share</p>
            <p className="mt-1 text-xs font-semibold text-(--foreground)">{copied ? "Link copied" : "Copy link"}</p>
          </button>
        </div>
        {sourceCount ? (
          <div className="mt-3 flex items-center gap-2 rounded-[6px] bg-(--muted) px-3 py-2 text-xs font-medium text-(--muted-foreground)">
            <BookOpenCheck className="h-3.5 w-3.5 text-(--primary)" />
            {sourceCount} cited source{sourceCount === 1 ? "" : "s"} checked for this article.
          </div>
        ) : null}
        <Link
          href="/policypages/about"
          className="mt-3 flex items-center gap-2 rounded-[6px] bg-(--muted) px-3 py-2 text-xs font-medium text-(--muted-foreground) transition hover:text-(--primary)"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-(--primary)" />
          Editorial standards, review process, and trust policy
        </Link>
      </div>

      <div className="rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) p-4 shadow-[var(--anslation-ds-shadow-sm)]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-(--primary)" />
            <h2 className="text-sm font-semibold text-(--foreground)">Continue reading</h2>
          </div>
          <Link
            href={`/blogs/category/${blogTaxonomySlug(blog.category)}`}
            className="text-xs font-semibold text-(--primary)"
          >
            {blog.category}
          </Link>
        </div>

        {nextPosts.length ? (
          <div className="space-y-2">
            {nextPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blogs/${post.slug}`}
                className="group flex items-center justify-between gap-3 rounded-[6px] border border-(--border) bg-(--background) p-3 transition hover:border-(--primary)"
              >
                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm font-semibold leading-snug text-(--foreground) group-hover:text-(--primary)">
                    {post.heading}
                  </p>
                  <p className="mt-1 text-[11px] font-medium text-(--muted-foreground)">
                    {post.readTime || "Quick read"}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-(--primary)" />
              </Link>
            ))}
          </div>
        ) : (
          <Link
            href="/blogs"
            className="flex items-center justify-between gap-3 rounded-[6px] border border-(--border) bg-(--background) p-3 text-sm font-semibold text-(--foreground) transition hover:border-(--primary) hover:text-(--primary)"
          >
            Browse all AltFTool guides
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}

        <div className="mt-3 flex items-center gap-2 rounded-[6px] bg-(--muted) px-3 py-2 text-xs font-medium text-(--muted-foreground)">
          <PenLine className="h-3.5 w-3.5 text-(--primary)" />
          Saved for scanning, sharing, and quick next steps.
        </div>
      </div>
    </section>
  );
}
