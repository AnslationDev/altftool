import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, Layers3, Route, Sparkles } from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  getAllBlogs,
  getBlogTopicClusters,
  mergeBlogPosts,
} from "../data";
import { getFirebaseBlogCatalog } from "../data/firebaseBlogs";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";

export const revalidate = 3600;

const pageDescription =
  "Explore AltFTool topic clusters that connect related blog guides across AI tools, media utilities, games, travel, shopping, productivity, and document workflows.";

async function getMergedPosts() {
  const firebaseCatalog = await getFirebaseBlogCatalog().catch(() => ({
    posts: [],
  }));

  return mergeBlogPosts(getAllBlogs(), firebaseCatalog.posts);
}

export async function generateMetadata() {
  return createPageMetadata({
    title: "AltFTool Blog Topic Clusters",
    description: pageDescription,
    path: "/blogs/topics",
    image: "/assets/logo3.png",
    keywords: ["AltFTool topic clusters", "blog topics", "tool guides", "content hub"],
  });
}

function TopicClusterCard({ cluster }) {
  const leadPost = cluster.leadPost;

  return (
    <Link
      href={`/blogs/topics/${cluster.slug}`}
      className="group overflow-hidden rounded-[var(--anslation-ds-radius-lg)] border border-(--border) bg-(--card) shadow-[var(--anslation-ds-shadow-sm)] transition hover:border-(--primary)/50 hover:shadow-[var(--anslation-ds-shadow-md)]"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-(--muted)">
        {leadPost?.image ? (
          <Image
            src={leadPost.image}
            alt={leadPost.imageAlt || leadPost.heading || cluster.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-[1.035]"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3 text-white">
          <span className="inline-flex h-7 items-center rounded-[6px] bg-white/15 px-2.5 text-[10px] font-bold uppercase tracking-wide backdrop-blur">
            {cluster.eyebrow}
          </span>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] bg-(--primary) text-(--primary-foreground)">
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-(--muted-foreground)">
          <span className="inline-flex h-6 items-center gap-1 rounded-[6px] bg-(--muted) px-2">
            <BookOpen className="h-3.5 w-3.5 text-(--primary)" />
            {cluster.postCount} articles
          </span>
          {cluster.relatedCategories.slice(0, 2).map((category) => (
            <span key={category} className="rounded-[6px] bg-(--muted) px-2 py-1">
              {category}
            </span>
          ))}
        </div>
        <h2 className="text-lg font-semibold tracking-normal text-(--foreground) transition group-hover:text-(--primary)">
          {cluster.title}
        </h2>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-(--muted-foreground)">
          {cluster.description}
        </p>
      </div>
    </Link>
  );
}

export default async function BlogTopicClustersPage() {
  const posts = await getMergedPosts();
  const clusters = getBlogTopicClusters(posts);
  const visibleClusters = clusters.filter((cluster) => cluster.postCount > 0);

  return (
    <main className="bg-(--background) text-(--foreground)">
      <JsonLd
        id="blog-topic-clusters-schema"
        data={[
          createCollectionPageJsonLd({
            path: "/blogs/topics",
            name: "AltFTool Blog Topic Clusters",
            description: pageDescription,
          }),
          createItemListJsonLd({
            path: "/blogs/topics",
            name: "AltFTool topic clusters",
            items: visibleClusters.map((cluster) => ({
              name: cluster.title,
              path: `/blogs/topics/${cluster.slug}`,
            })),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blogs" },
            { name: "Topic Clusters", path: "/blogs/topics" },
          ]),
        ]}
      />

      <div className="mx-auto w-full max-w-[1500px] px-3 py-6 sm:px-5 md:py-8 lg:px-8">
        <section className="border-b border-(--border) pb-7">
          <Link
            href="/blogs"
            className="mb-4 inline-flex h-9 items-center gap-2 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) px-3 text-sm font-semibold text-(--foreground) shadow-[var(--anslation-ds-shadow-sm)] transition hover:border-(--primary) hover:text-(--primary)"
          >
            <ArrowLeft className="h-4 w-4" />
            All blogs
          </Link>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <p className="inline-flex h-8 items-center gap-2 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) px-3 text-xs font-semibold text-(--primary)">
                <Route className="h-3.5 w-3.5" />
                Editorial topic map
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-(--foreground) sm:text-4xl lg:text-5xl">
                Blog Topic Clusters
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-(--muted-foreground) sm:text-base">
                Follow connected paths through related AltFTool guides. Each cluster groups practical articles so readers can move from discovery to deeper research without starting over.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) p-4 shadow-[var(--anslation-ds-shadow-sm)]">
                <Layers3 className="mb-2 h-4 w-4 text-(--primary)" />
                <p className="text-2xl font-semibold text-(--foreground)">{visibleClusters.length}</p>
                <p className="text-[11px] font-medium uppercase tracking-wide text-(--muted-foreground)">Clusters</p>
              </div>
              <div className="rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) p-4 shadow-[var(--anslation-ds-shadow-sm)]">
                <Sparkles className="mb-2 h-4 w-4 text-(--primary)" />
                <p className="text-2xl font-semibold text-(--foreground)">{posts.length}</p>
                <p className="text-[11px] font-medium uppercase tracking-wide text-(--muted-foreground)">Mapped posts</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {visibleClusters.map((cluster) => (
            <TopicClusterCard key={cluster.slug} cluster={cluster} />
          ))}
        </section>
      </div>
    </main>
  );
}
