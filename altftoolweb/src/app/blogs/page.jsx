import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Layers3,
  Lightbulb,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import BlogExplorerClient from "./components/BlogExplorerClient";
import JsonLd from "@/platform/seo/JsonLd";
import RouteDiscoveryBand from "@/platform/navigation/RouteDiscoveryBand";
import { getRouteHub, getRouteHubJsonLdItems } from "@/platform/navigation/routeHubs";
import {
  BLOG_CONTENT_LANES,
  BLOG_REMOTE_LIMIT,
  getAllBlogs,
  getBlogCategories,
  getBlogStats,
  getBlogTopicClusters,
  getFeaturedBlogGroups,
  getTrendingBlogs,
} from "./data";
import { getFirebaseBlogCatalog } from "./data/firebaseBlogs";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";

export const revalidate = 3600;

const laneIcons = [ReceiptText, GraduationCap, TrendingUp, Lightbulb];
const blogsRouteHub = getRouteHub("blogs");
const blogsDescription =
  "Read fast, practical AltFTool guides for online tools, games, browser extensions, savings workflows, student picks, and creator-friendly digital productivity.";

export async function generateMetadata() {
  return createPageMetadata({
    title: "AltFTool Blog - Tools, Savings & Digital Guides",
    description: blogsDescription,
    path: "/blogs",
    image: "/assets/logo3.png",
  });
}

function formatDate(date) {
  if (!date) return "Recently updated";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function StatPill({ label, value }) {
  return (
    <div className="rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) px-3 py-2 shadow-[var(--anslation-ds-shadow-sm)]">
      <p className="text-lg font-semibold leading-none text-(--foreground)">{value}</p>
      <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-(--muted-foreground)">{label}</p>
    </div>
  );
}

function HeroArticle({ post }) {
  if (!post) return null;

  return (
    <Link
      href={`/blogs/${post.slug}`}
      prefetch={false}
      className="group relative block min-h-[430px] overflow-hidden rounded-[var(--anslation-ds-radius-lg)] border border-(--border) bg-(--card) shadow-[var(--anslation-ds-shadow-md)]"
    >
      <Image
        src={post.image}
        alt={post.imageAlt || post.heading}
        fill
        priority
        sizes="(max-width: 1280px) 100vw, 840px"
        className="object-cover transition duration-500 group-hover:scale-[1.025]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10" />
      <div className="absolute left-4 top-4 rounded-[6px] border border-white/20 bg-black/45 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur">
        Editor pick
      </div>

      <div className="relative z-10 flex min-h-[430px] flex-col justify-end gap-7 p-5 sm:p-7 lg:p-8">
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-medium text-white/75">
            <span className="inline-flex h-7 items-center rounded-[6px] bg-(--primary) px-2.5 text-(--primary-foreground)">
              {post.category}
            </span>
            <span>{formatDate(post.date)}</span>
            <span className="h-1 w-1 rounded-full bg-white/30" />
            <span>{post.readTime}</span>
          </div>
          <h2 className="max-w-3xl text-3xl font-semibold tracking-normal text-white sm:text-4xl lg:text-5xl">
            {post.heading}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/75 sm:text-base">
            {post.excerpt}
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm font-semibold text-white">
          Read featured guide
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--anslation-ds-radius)] bg-(--primary) text-(--primary-foreground) transition group-hover:translate-x-0.5">
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function CompactArticle({ post, index }) {
  return (
    <Link
      href={`/blogs/${post.slug}`}
      prefetch={false}
      className="group flex gap-3 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) p-2.5 shadow-[var(--anslation-ds-shadow-sm)] transition hover:border-(--primary)/45 hover:shadow-[var(--anslation-ds-shadow-md)]"
    >
      <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-[6px] bg-(--muted)">
        <Image
          src={post.image}
          alt={post.imageAlt || post.heading}
          fill
          sizes="96px"
          className="object-cover transition duration-500 group-hover:scale-[1.04]"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-(--muted-foreground)">
          <span className="text-(--primary)">0{index + 1}</span>
          <span>{post.category}</span>
        </div>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-(--foreground) transition group-hover:text-(--primary)">
          {post.heading}
        </h3>
        <p className="mt-1 text-xs font-medium text-(--muted-foreground)">{post.readTime}</p>
      </div>
    </Link>
  );
}

function MarketLaneGrid() {
  return (
    <section className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {BLOG_CONTENT_LANES.map((lane, index) => {
        const Icon = laneIcons[index] || BookOpen;
        return (
          <article
            key={lane.title}
            className="rounded-[var(--anslation-ds-radius-lg)] border border-(--border) bg-(--card) p-4 shadow-[var(--anslation-ds-shadow-sm)]"
          >
            <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-[var(--anslation-ds-radius)] bg-(--muted) text-(--primary)">
              <Icon className="h-4 w-4" />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-(--muted-foreground)">{lane.eyebrow}</p>
            <h2 className="mt-1 text-base font-semibold text-(--foreground)">{lane.title}</h2>
            <p className="mt-2 text-sm leading-6 text-(--muted-foreground)">{lane.description}</p>
          </article>
        );
      })}
    </section>
  );
}

function TrendingRail({ posts }) {
  if (!posts.length) return null;

  return (
    <aside className="space-y-3">
      <div className="flex items-center justify-between rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) px-3 py-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-(--primary)" />
          <p className="text-xs font-bold uppercase tracking-wide text-(--foreground)">Trending reads</p>
        </div>
        <Sparkles className="h-4 w-4 text-(--muted-foreground)" />
      </div>
      <div className="grid gap-3">
        {posts.map((post, index) => (
          <CompactArticle key={post.slug} post={post} index={index} />
        ))}
      </div>
    </aside>
  );
}

function TopicClusterBand({ clusters }) {
  const visibleClusters = clusters.filter((cluster) => cluster.postCount > 0).slice(0, 6);
  if (!visibleClusters.length) return null;

  return (
    <section className="mt-10 rounded-[var(--anslation-ds-radius-lg)] border border-(--border) bg-(--card) p-4 shadow-[var(--anslation-ds-shadow-sm)] sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-(--muted-foreground)">Topic clusters</p>
          <h2 className="mt-1 text-xl font-semibold text-(--foreground)">Follow a complete reading path</h2>
        </div>
        <Link
          href="/blogs/topics"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) px-3 text-sm font-semibold text-(--foreground) transition hover:border-(--primary) hover:text-(--primary)"
        >
          View all clusters
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {visibleClusters.map((cluster) => (
          <Link
            key={cluster.slug}
            href={`/blogs/topics/${cluster.slug}`}
            className="group rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) p-4 transition hover:border-(--primary)/50 hover:bg-(--muted)"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-(--primary)">{cluster.eyebrow}</p>
                <h3 className="mt-1 text-base font-semibold text-(--foreground) group-hover:text-(--primary)">
                  {cluster.title}
                </h3>
              </div>
              <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-[6px] bg-(--card) px-2 text-xs font-bold text-(--primary)">
                {cluster.postCount}
              </span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-(--muted-foreground)">
              {cluster.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default async function BlogsPage() {
  const localPosts = getAllBlogs();
  const firebaseCatalog = await getFirebaseBlogCatalog().catch((error) => {
    console.error("BlogsPage Firebase catalog failed:", error);
    return { posts: [], count: 0, offset: 0 };
  });
  const hasFirebaseCatalog = firebaseCatalog.posts.length > 0;
  const posts = hasFirebaseCatalog ? firebaseCatalog.posts : localPosts;
  const categories = getBlogCategories(posts);
  const stats = getBlogStats(posts);
  const groups = getFeaturedBlogGroups(posts);
  const trendingPosts = getTrendingBlogs(posts, 5);
  const topicClusters = getBlogTopicClusters(posts);
  const totalCount = Math.max(firebaseCatalog.count, posts.length);

  return (
    <main className="bg-(--background) text-(--foreground)">
      <JsonLd
        id="blogs-schema"
        data={[
          createCollectionPageJsonLd({
            path: "/blogs",
            name: "AltFTool Blog",
            description: blogsDescription,
          }),
          createItemListJsonLd({
            path: "/blogs",
            name: "AltFTool blog next routes",
            items: getRouteHubJsonLdItems("blogs"),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Blogs", path: "/blogs" },
          ]),
        ]}
      />
      <div className="mx-auto w-full max-w-[1500px] px-3 py-6 sm:px-5 md:py-8 lg:px-8">
        <section className="py-2">
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex h-8 items-center gap-2 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) px-3 text-xs font-semibold text-(--primary)">
                <ShieldCheck className="h-3.5 w-3.5" />
                Fast guides, verified workflows
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-(--foreground) sm:text-4xl lg:text-5xl">
                AltFTool Blog
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-(--muted-foreground) sm:text-base">
                Practical articles for tools, deals, students, creators, and digital productivity, shaped for quick scanning and deeper reading.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 md:min-w-[340px]">
              <StatPill label="Articles" value={stats.posts} />
              <StatPill label="Categories" value={stats.categories} />
              <StatPill label="Tools" value={stats.tools} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <HeroArticle post={groups.hero} />
            <TrendingRail posts={trendingPosts} />
          </div>
        </section>

        <MarketLaneGrid />
        <TopicClusterBand clusters={topicClusters} />

        <section className="mt-10">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-(--muted-foreground)">Editorial map</p>
              <h2 className="mt-1 text-xl font-semibold text-(--foreground)">Popular paths</h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-(--muted-foreground)">
              <Layers3 className="h-4 w-4 text-(--primary)" />
              Reader shortcuts by topic
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {groups.trending.map((post, index) => (
              <CompactArticle key={post.slug} post={post} index={index} />
            ))}
          </div>
        </section>

        <BlogExplorerClient
          initialPosts={posts}
          categories={categories}
          initialRemoteOffset={
            hasFirebaseCatalog ? firebaseCatalog.offset : 0
          }
          totalCount={totalCount}
        />
      </div>
      <RouteDiscoveryBand {...blogsRouteHub} />
    </main>
  );
}
