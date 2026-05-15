import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, BookOpen, CalendarClock, Layers3, ShieldCheck, Tags, UserRound } from "lucide-react";
import BlogCard from "../../components/BlogCard";
import JsonLd from "@/platform/seo/JsonLd";
import {
  blogTaxonomySlug,
  getAllBlogs,
  getBlogAuthorBySlug,
  getBlogAuthors,
  mergeBlogPosts,
} from "../../data";
import { getFirebaseBlogCatalog } from "../../data/firebaseBlogs";
import {
  createBreadcrumbJsonLd,
  createItemListJsonLd,
  createPageMetadata,
  createPersonJsonLd,
} from "@/platform/seo/generateMetadata";

export const revalidate = 3600;

export function generateStaticParams() {
  return getBlogAuthors().map((author) => ({ author: author.slug }));
}

async function getMergedPosts() {
  const firebaseCatalog = await getFirebaseBlogCatalog().catch(() => ({
    posts: [],
  }));

  return mergeBlogPosts(getAllBlogs(), firebaseCatalog.posts);
}

async function getAuthorArchive(authorSlug) {
  const posts = await getMergedPosts();
  const author = getBlogAuthorBySlug(authorSlug, posts);
  const authors = getBlogAuthors(posts);

  return { author, authors };
}

function formatDate(date) {
  if (!date) return "Recently updated";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export async function generateMetadata({ params }) {
  const { author: authorSlug } = await params;
  const { author } = await getAuthorArchive(authorSlug);

  if (!author) {
    return createPageMetadata({
      title: "Blog Author - AltFTool",
      description: "Browse AltFTool blog authors and editorial contributors.",
      path: `/blogs/author/${authorSlug}`,
    });
  }

  return createPageMetadata({
    title: `${author.name} - AltFTool Blog Author`,
    description: `${author.name} writes and reviews practical AltFTool guides across ${author.categories.slice(0, 3).join(", ") || "digital workflows"}.`,
    path: `/blogs/author/${author.slug}`,
    image: author.posts[0]?.image,
    keywords: [author.name, author.role, "AltFTool author", "AltFTool editorial"],
    type: "profile",
  });
}

export default async function BlogAuthorPage({ params }) {
  const { author: authorSlug } = await params;
  const { author, authors } = await getAuthorArchive(authorSlug);

  if (!author) notFound();

  const path = `/blogs/author/${author.slug}`;
  const peerAuthors = authors.filter((item) => item.slug !== author.slug).slice(0, 6);

  return (
    <main className="bg-(--background) text-(--foreground)">
      <JsonLd
        id={`blog-author-schema-${author.slug}`}
        data={[
          createPersonJsonLd({
            path,
            name: author.name,
            description: author.bio,
            jobTitle: author.role,
          }),
          createItemListJsonLd({
            path,
            name: `${author.name} AltFTool articles`,
            items: author.posts.slice(0, 24).map((post) => ({
              name: post.heading,
              path: `/blogs/${post.slug}`,
            })),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blogs" },
            { name: author.name, path },
          ]),
        ]}
      />

      <div className="mx-auto w-full max-w-[1500px] px-3 py-6 sm:px-5 md:py-8 lg:px-8">
        <section className="rounded-[var(--anslation-ds-radius-lg)] border border-(--border) bg-(--card) p-5 shadow-[var(--anslation-ds-shadow-sm)] sm:p-7">
          <Link
            href="/blogs"
            className="mb-5 inline-flex h-9 items-center gap-2 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) px-3 text-sm font-semibold text-(--foreground) transition hover:border-(--primary) hover:text-(--primary)"
          >
            <ArrowLeft className="h-4 w-4" />
            All blogs
          </Link>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[var(--anslation-ds-radius)] bg-(--muted) text-(--primary)">
                <UserRound className="h-7 w-7" />
              </div>
              <p className="inline-flex h-8 items-center gap-2 rounded-[6px] border border-(--border) bg-(--background) px-3 text-xs font-bold uppercase tracking-wide text-(--primary)">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified editorial profile
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-(--foreground) sm:text-4xl lg:text-5xl">
                {author.name}
              </h1>
              <p className="mt-2 text-sm font-semibold text-(--primary)">
                {author.role}
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-(--muted-foreground) sm:text-base">
                {author.bio}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) p-4">
                <BookOpen className="mb-2 h-4 w-4 text-(--primary)" />
                <p className="text-2xl font-semibold text-(--foreground)">{author.postCount}</p>
                <p className="text-[11px] font-medium uppercase tracking-wide text-(--muted-foreground)">Articles</p>
              </div>
              <div className="rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) p-4">
                <Layers3 className="mb-2 h-4 w-4 text-(--primary)" />
                <p className="text-2xl font-semibold text-(--foreground)">{author.categories.length}</p>
                <p className="text-[11px] font-medium uppercase tracking-wide text-(--muted-foreground)">Categories</p>
              </div>
              <div className="rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) p-4">
                <Tags className="mb-2 h-4 w-4 text-(--primary)" />
                <p className="text-2xl font-semibold text-(--foreground)">{author.tags.length}</p>
                <p className="text-[11px] font-medium uppercase tracking-wide text-(--muted-foreground)">Tags</p>
              </div>
              <div className="rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) p-4">
                <CalendarClock className="mb-2 h-4 w-4 text-(--primary)" />
                <p className="text-sm font-semibold text-(--foreground)">{formatDate(author.lastUpdated)}</p>
                <p className="text-[11px] font-medium uppercase tracking-wide text-(--muted-foreground)">Updated</p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {author.categories.slice(0, 8).map((category) => (
              <Link
                key={category}
                href={`/blogs/category/${blogTaxonomySlug(category)}`}
                className="inline-flex h-8 items-center rounded-[6px] border border-(--border) bg-(--background) px-3 text-xs font-semibold text-(--muted-foreground) transition hover:border-(--primary) hover:text-(--primary)"
              >
                {category}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {author.posts.map((post) => (
            <BlogCard
              key={post.slug}
              blog={post}
              height="h-[320px]"
              showExcerpt
            />
          ))}
        </section>

        {peerAuthors.length ? (
          <section className="mt-10 rounded-[var(--anslation-ds-radius-lg)] border border-(--border) bg-(--card) p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="mb-4 flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-(--primary)" />
              <h2 className="text-sm font-bold uppercase tracking-wide text-(--foreground)">More editorial contributors</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {peerAuthors.map((peer) => (
                <Link
                  key={peer.slug}
                  href={`/blogs/author/${peer.slug}`}
                  className="inline-flex h-9 items-center rounded-[6px] border border-(--border) bg-(--background) px-3 text-sm font-semibold text-(--muted-foreground) transition hover:border-(--primary) hover:text-(--primary)"
                >
                  {peer.name}
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
