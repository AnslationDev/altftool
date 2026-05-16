"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Link2,
  MessageCircleQuestion,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { blogTaxonomySlug, getBlogFreshness } from "../../data";

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

function getSourceCount(blog = {}) {
  return Array.isArray(blog.sources)
    ? blog.sources.filter((source) => source?.title || source?.url).length
    : 0;
}

function InsightMetric({ icon: Icon, label, value, detail }) {
  return (
    <div className="rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) px-3 py-3">
      <div className="flex items-start gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-(--muted) text-(--primary)">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wide text-(--muted-foreground)">{label}</p>
          <p className="mt-0.5 text-sm font-semibold leading-5 text-(--foreground)">{value}</p>
          {detail ? <p className="mt-0.5 text-[11px] leading-4 text-(--muted-foreground)">{detail}</p> : null}
        </div>
      </div>
    </div>
  );
}

export default function BlogInsightStrip({
  blog,
  faqItems = [],
  relatedTools = [],
  relatedPosts = [],
}) {
  if (!blog) return null;

  const freshness = getBlogFreshness(blog);
  const sourceCount = getSourceCount(blog);
  const faqCount = faqItems.length;
  const updatedLabel = formatDate(blog.reviewedAt || blog.updatedAt || blog.date || blog.createdAt);
  const primaryTool = relatedTools[0];
  const nextPost = relatedPosts[0];
  const authorName = blog.author || "AltFTool Editorial";

  return (
    <section className="mt-5 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) p-3 shadow-[var(--anslation-ds-shadow-sm)] sm:p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-stretch">
        <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <InsightMetric
            icon={Clock3}
            label="Read time"
            value={blog.readTime || "Quick read"}
            detail={blog.category || "AltFTool guide"}
          />
          <InsightMetric
            icon={CalendarClock}
            label="Updated"
            value={updatedLabel}
            detail={freshness.detail}
          />
          <InsightMetric
            icon={BookOpenCheck}
            label="Sources"
            value={sourceCount ? `${sourceCount} cited` : "Needs source"}
            detail={blog.reviewedBy || "Editorial review"}
          />
          <InsightMetric
            icon={MessageCircleQuestion}
            label="FAQ"
            value={faqCount ? `${faqCount} answers` : "Auto summary"}
            detail={faqCount ? "Reader questions covered" : "Generated from article context"}
          />
        </div>

        <div className="flex min-w-0 flex-col justify-between rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) p-3 xl:w-[320px]">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-(--primary)" />
              <p className="text-xs font-bold uppercase tracking-wide text-(--muted-foreground)">Next action</p>
            </div>
            {primaryTool ? (
              <Link
                href={primaryTool.href}
                className="mt-2 inline-flex text-sm font-semibold leading-5 text-(--foreground) transition hover:text-(--primary)"
              >
                Try {primaryTool.name}
              </Link>
            ) : nextPost ? (
              <Link
                href={`/blogs/${nextPost.slug}`}
                className="mt-2 inline-flex text-sm font-semibold leading-5 text-(--foreground) transition hover:text-(--primary)"
              >
                Read {nextPost.heading}
              </Link>
            ) : (
              <Link
                href={`/blogs/category/${blogTaxonomySlug(blog.category)}`}
                className="mt-2 inline-flex text-sm font-semibold leading-5 text-(--foreground) transition hover:text-(--primary)"
              >
                Browse {blog.category || "related guides"}
              </Link>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {faqCount ? (
              <a
                href="#faq"
                className="inline-flex h-8 items-center gap-1.5 rounded-[6px] border border-(--border) bg-(--card) px-2.5 text-xs font-semibold text-(--foreground) transition hover:border-(--primary) hover:text-(--primary)"
              >
                <MessageCircleQuestion className="h-3.5 w-3.5" />
                FAQ
              </a>
            ) : null}
            {sourceCount ? (
              <a
                href="#sources"
                className="inline-flex h-8 items-center gap-1.5 rounded-[6px] border border-(--border) bg-(--card) px-2.5 text-xs font-semibold text-(--foreground) transition hover:border-(--primary) hover:text-(--primary)"
              >
                <Link2 className="h-3.5 w-3.5" />
                Sources
              </a>
            ) : null}
            <Link
              href={`/blogs/author/${blogTaxonomySlug(authorName)}`}
              className="inline-flex h-8 items-center gap-1.5 rounded-[6px] border border-(--border) bg-(--card) px-2.5 text-xs font-semibold text-(--foreground) transition hover:border-(--primary) hover:text-(--primary)"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Author
            </Link>
            <span className="inline-flex h-8 items-center gap-1.5 rounded-[6px] bg-(--muted) px-2.5 text-xs font-semibold text-(--muted-foreground)">
              <CheckCircle2 className="h-3.5 w-3.5 text-(--primary)" />
              {freshness.label}
            </span>
          </div>
        </div>

        <Link
          href={primaryTool?.href || (nextPost ? `/blogs/${nextPost.slug}` : "/blogs")}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--anslation-ds-radius)] bg-(--primary) px-4 text-sm font-semibold text-(--primary-foreground) transition hover:bg-(--primary-active) xl:w-14 xl:px-0"
          aria-label="Open recommended next action"
        >
          <span className="xl:hidden">Open next</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
