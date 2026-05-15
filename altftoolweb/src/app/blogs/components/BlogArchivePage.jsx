import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Hash, Layers3, Route, Sparkles } from "lucide-react";
import BlogCard from "./BlogCard";
import { blogTaxonomySlug } from "../data";

function ArchiveStat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) px-3 py-2 shadow-[var(--anslation-ds-shadow-sm)]">
      <div className="flex items-center gap-2 text-(--primary)">
        <Icon className="h-4 w-4" />
        <p className="text-lg font-semibold leading-none text-(--foreground)">
          {value}
        </p>
      </div>
      <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-(--muted-foreground)">
        {label}
      </p>
    </div>
  );
}

export default function BlogArchivePage({
  eyebrow,
  title,
  description,
  posts,
  activeLabel,
  archiveType = "category",
  relatedLabels = [],
  hubHighlights = [],
  faqItems = [],
}) {
  const archiveBase = archiveType === "tag"
    ? "/blogs/tag"
    : archiveType === "topic"
      ? "/blogs/topics"
      : "/blogs/category";
  const uniqueCategories = new Set(posts.map((post) => post.category).filter(Boolean));

  return (
    <main className="bg-(--background) text-(--foreground)">
      <div className="mx-auto w-full max-w-[1500px] px-3 py-6 sm:px-5 md:py-8 lg:px-8">
        <div className="mb-7 flex flex-col gap-5 border-b border-(--border) pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <Link
              href="/blogs"
              className="mb-4 inline-flex h-9 items-center gap-2 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) px-3 text-sm font-semibold text-(--foreground) shadow-[var(--anslation-ds-shadow-sm)] transition hover:border-(--primary) hover:text-(--primary)"
            >
              <ArrowLeft className="h-4 w-4" />
              All blogs
            </Link>
            <p className="text-xs font-bold uppercase tracking-wide text-(--muted-foreground)">
              {eyebrow}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-(--foreground) sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-(--muted-foreground) sm:text-base">
              {description}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 lg:min-w-[360px]">
            <ArchiveStat icon={BookOpen} label="Articles" value={posts.length} />
            <ArchiveStat icon={Layers3} label="Categories" value={uniqueCategories.size || 1} />
            <ArchiveStat icon={Hash} label={archiveType === "tag" ? "Tag" : archiveType === "topic" ? "Cluster" : "Topic"} value="1" />
          </div>
        </div>

        {relatedLabels.length > 0 ? (
          <div className="mb-6 flex flex-wrap gap-2">
            {relatedLabels.slice(0, 12).map((item) => {
              const label = typeof item === "string" ? item : item?.label;
              const href = typeof item === "string"
                ? `${archiveBase}/${blogTaxonomySlug(item)}`
                : item?.href || `${archiveBase}/${blogTaxonomySlug(label)}`;
              const active = label === activeLabel;
              return (
                <Link
                  key={label}
                  href={href}
                  className={`inline-flex h-8 items-center rounded-[6px] border px-3 text-xs font-semibold transition ${
                    active
                      ? "border-(--primary) bg-(--primary) text-(--primary-foreground)"
                      : "border-(--border) bg-(--card) text-(--muted-foreground) hover:border-(--primary) hover:text-(--foreground)"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        ) : null}

        {hubHighlights.length > 0 ? (
          <section className="mb-7 grid grid-cols-1 gap-3 lg:grid-cols-3">
            {hubHighlights.slice(0, 3).map((item) => (
              <Link
                key={`${item.label}-${item.href}`}
                href={item.href}
                className="group rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) p-4 shadow-[var(--anslation-ds-shadow-sm)] transition hover:border-(--primary) hover:shadow-[var(--anslation-ds-shadow-md)]"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-[6px] bg-(--muted) text-(--primary)">
                    {item.kind === "tool" ? (
                      <Sparkles className="h-4 w-4" />
                    ) : item.kind === "topic" ? (
                      <Route className="h-4 w-4" />
                    ) : (
                      <BookOpen className="h-4 w-4" />
                    )}
                  </span>
                  <ArrowRight className="h-4 w-4 text-(--primary) transition group-hover:translate-x-0.5" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-(--muted-foreground)">
                  {item.label}
                </p>
                <h2 className="mt-1 line-clamp-2 text-base font-semibold tracking-normal text-(--foreground) group-hover:text-(--primary)">
                  {item.title}
                </h2>
                {item.caption ? (
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-(--muted-foreground)">
                    {item.caption}
                  </p>
                ) : null}
              </Link>
            ))}
          </section>
        ) : null}

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <BlogCard
                key={post.slug}
                blog={post}
                height="h-[320px]"
                showExcerpt
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[var(--anslation-ds-radius)] border border-dashed border-(--border) bg-(--card) px-5 py-12 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-[6px] bg-(--muted) text-(--primary)">
              <BookOpen className="h-5 w-5" />
            </div>
            <h2 className="text-base font-semibold text-(--foreground)">
              No articles found
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-(--muted-foreground)">
              This archive is ready, but there are no published posts in it yet.
            </p>
          </div>
        )}

        {faqItems.length > 0 ? (
          <section className="mt-8 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="mb-4 flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] bg-(--muted) text-(--primary)">
                <CheckCircle2 className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-(--muted-foreground)">
                  Topic hub FAQ
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-normal text-(--foreground)">
                  Questions before you continue
                </h2>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {faqItems.slice(0, 4).map((item) => (
                <div
                  key={item.question}
                  className="rounded-[6px] border border-(--border) bg-(--background) p-4"
                >
                  <h3 className="text-sm font-semibold text-(--foreground)">
                    {item.question}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-(--muted-foreground)">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
