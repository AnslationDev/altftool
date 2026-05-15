import Link from "next/link";
import { ArrowLeft, BookOpen, Hash, Layers3 } from "lucide-react";
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
}) {
  const archiveBase = archiveType === "tag" ? "/blogs/tag" : "/blogs/category";
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
            <ArchiveStat icon={Hash} label={archiveType === "tag" ? "Tag" : "Topic"} value="1" />
          </div>
        </div>

        {relatedLabels.length > 0 ? (
          <div className="mb-6 flex flex-wrap gap-2">
            {relatedLabels.slice(0, 12).map((label) => {
              const active = label === activeLabel;
              return (
                <Link
                  key={label}
                  href={`${archiveBase}/${blogTaxonomySlug(label)}`}
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
      </div>
    </main>
  );
}
