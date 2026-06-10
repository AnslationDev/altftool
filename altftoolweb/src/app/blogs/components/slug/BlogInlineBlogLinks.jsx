import Link from "next/link";
import { ArrowRight, BookOpen, GitBranch, Sparkles } from "lucide-react";
import { blogTaxonomySlug } from "../../data";

export default function BlogInlineBlogLinks({ blog, posts = [] }) {
  const visiblePosts = posts
    .filter((post) => post?.slug && post.slug !== blog?.slug)
    .slice(0, 3);

  if (!visiblePosts.length) return null;

  return (
    <aside
      aria-label="Related blog reading path"
      className="not-prose my-7 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) p-3 shadow-[var(--anslation-ds-shadow-sm)] sm:p-4"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-(--muted-foreground)">
            <GitBranch className="h-3.5 w-3.5 text-(--primary)" />
            Continue the path
          </p>
          <h2 className="mt-1 text-base font-semibold tracking-normal text-(--foreground)">
            Contextual reads from this topic
          </h2>
        </div>
        {blog?.category ? (
          <Link
            href={`/blogs/category/${blogTaxonomySlug(blog.category)}`}
            data-blog-internal-link="category"
            data-source-blog-slug={blog?.slug || ""}
            className="inline-flex h-8 items-center rounded-[6px] border border-(--border) px-2.5 text-[11px] font-bold uppercase tracking-wide text-(--muted-foreground) transition hover:border-(--primary) hover:text-(--primary)"
          >
            {blog.category}
          </Link>
        ) : null}
      </div>

      <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0">
        {visiblePosts.map((post, index) => (
          <Link
            key={post.slug}
            href={`/blogs/${post.slug}`}
            aria-label={`Read next: ${post.heading || post.title}`}
            data-blog-internal-link="related-post"
            data-source-blog-slug={blog?.slug || ""}
            data-target-blog-slug={post.slug}
            className="group min-h-[136px] w-[82%] shrink-0 snap-start rounded-[6px] border border-(--border) bg-(--card) p-3 transition hover:border-(--primary) hover:shadow-[var(--anslation-ds-shadow-sm)] min-[460px]:w-[46%] sm:w-auto sm:shrink"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] bg-(--muted) text-(--primary)">
                {index === 0 ? <Sparkles className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-(--muted-foreground)">
                {post.readTime || "Quick read"}
              </span>
            </div>
            <h3 className="line-clamp-3 text-sm font-semibold leading-snug text-(--foreground) group-hover:text-(--primary)">
              {post.heading || post.title}
            </h3>
            <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-(--primary)">
              Read next
              <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
