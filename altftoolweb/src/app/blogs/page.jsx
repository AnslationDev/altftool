import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  GraduationCap,
  Layers3,
  Lightbulb,
  ReceiptText,
  Search,
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
  blogTaxonomySlug,
  getAllBlogs,
  getBlogCategories,
  getBlogStats,
  getBlogTopicClusters,
  getFeaturedBlogGroups,
  getTrendingBlogs,
} from "./data";
import {
  describeFirebaseBlogError,
  getFirebaseBlogCatalog,
} from "./data/firebaseBlogs";
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
const BLOG_SSR_FIREBASE_TIMEOUT_MS = Number(process.env.ALTFT_BLOGS_SSR_FIREBASE_TIMEOUT_MS || 1200);

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
    <div className="metric-tile min-w-0 px-4 py-3">
      <p className="text-2xl font-semibold leading-none tracking-tight text-(--foreground)">{value}</p>
      <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-normal text-(--muted-foreground)">{label}</p>
    </div>
  );
}

function HeroShortcutRail({ categories, clusters }) {
  const visibleCategories = categories.filter((category) => category !== "All").slice(0, 4);
  const visibleClusters = clusters.filter((cluster) => cluster.postCount > 0).slice(0, 2);
  const shortcuts = [
    ...visibleCategories.map((category) => ({
      key: `category-${category}`,
      label: category,
      href: `/blogs/category/${blogTaxonomySlug(category)}`,
      icon: BookOpen,
    })),
    ...visibleClusters.map((cluster) => ({
      key: `topic-${cluster.slug}`,
      label: cluster.title,
      href: `/blogs/topics/${cluster.slug}`,
      icon: Layers3,
    })),
  ].slice(0, 6);

  if (!shortcuts.length) return null;

  return (
    <div className="-mx-3 mt-5 flex snap-x gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
      <Link
        href="#blog-explorer"
        className="inline-flex h-9 shrink-0 snap-start items-center gap-2 rounded-full border border-(--border) bg-(--card) px-3.5 text-[12px] font-semibold text-(--foreground) shadow-sm transition-all duration-150 hover:border-(--anslation-ds-border-strong) hover:bg-(--anslation-ds-soft)"
      >
        <Search className="h-3.5 w-3.5 text-(--primary)" />
        Search all
      </Link>
      {shortcuts.map((shortcut) => {
        const Icon = shortcut.icon;
        return (
          <Link
            key={shortcut.key}
            href={shortcut.href}
            className="inline-flex h-9 max-w-[220px] shrink-0 snap-start items-center gap-2 rounded-full border border-(--border) bg-(--card) px-3.5 text-[12px] font-semibold text-(--muted-foreground) shadow-sm transition-all duration-150 hover:border-(--anslation-ds-border-strong) hover:bg-(--anslation-ds-soft) hover:text-(--foreground)"
          >
            <Icon className="h-3.5 w-3.5 text-(--primary)" />
            <span className="truncate">{shortcut.label}</span>
            <ChevronRight className="h-3.5 w-3.5 opacity-60" />
          </Link>
        );
      })}
    </div>
  );
}

function compactExplorerPost(post = {}) {
  return {
    id: post.id,
    title: post.title || post.heading,
    heading: post.heading || post.title,
    slug: post.slug,
    category: post.category,
    tool: post.tool,
    topic: post.topic,
    excerpt: post.excerpt,
    description: post.excerpt || post.seoDescription || "",
    image: post.image,
    imageAlt: post.imageAlt,
    date: post.date,
    author: post.author,
    authorRole: post.authorRole,
    reviewedBy: post.reviewedBy,
    editorialNote: post.editorialNote,
    reviewedAt: post.reviewedAt,
    updatedAt: post.updatedAt,
    seoDescription: post.seoDescription,
    readTime: post.readTime,
    readTimeMinutes: post.readTimeMinutes,
    tags: Array.isArray(post.tags) ? post.tags.slice(0, 8) : [],
    sources: Array.isArray(post.sources) ? post.sources.slice(0, 3) : [],
    sourceNotes: post.sourceNotes,
    faqItems: Array.isArray(post.faqItems) ? post.faqItems.slice(0, 4) : [],
    views: post.views,
    likesCount: post.likesCount,
    commentsCount: post.commentsCount,
  };
}

async function getFastFirebaseBlogCatalog() {
  if (process.env.ALTFT_BLOGS_SSR_FIREBASE !== "true") {
    return null;
  }

  let timeout;

  try {
    return await Promise.race([
      getFirebaseBlogCatalog(),
      new Promise((resolve) => {
        timeout = setTimeout(() => resolve(null), BLOG_SSR_FIREBASE_TIMEOUT_MS);
      }),
    ]);
  } catch (error) {
    console.warn("BlogsPage Firebase catalog fallback:", describeFirebaseBlogError(error));
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function HeroArticle({ post }) {
  if (!post) return null;

  return (
    <Link
      href={`/blogs/${post.slug}`}
      prefetch={false}
      className="interactive-card group relative block min-h-[380px] overflow-hidden sm:min-h-[460px] transition-all duration-300 hover:shadow-[var(--anslation-ds-shadow-lg)]"
    >
      <Image
        src={post.image}
        alt={post.imageAlt || post.heading}
        fill
        priority
        sizes="(max-width: 1280px) 100vw, 840px"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
      />
      {/* Editorial gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/50 to-black/15" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 to-transparent" />

      {/* Editor pick badge */}
      <div className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white backdrop-blur-sm">
        <Sparkles className="h-3 w-3 text-(--primary)" aria-hidden="true" />
        Editor pick
      </div>

      <div className="relative z-10 flex min-h-[380px] flex-col justify-end gap-6 p-5 sm:min-h-[460px] sm:gap-7 sm:p-8 lg:p-10">
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-[12px] font-medium text-white/75">
            <span className="inline-flex h-7 items-center rounded-md bg-(--primary) px-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-(--primary-foreground)">
              {post.category}
            </span>
            <span>{formatDate(post.date)}</span>
            <span aria-hidden="true" className="h-1 w-1 rounded-full bg-white/40" />
            <span>{post.readTime}</span>
          </div>
          <h2 className="max-w-3xl text-3xl font-semibold leading-[1.1] tracking-[-0.015em] text-white sm:text-4xl lg:text-5xl">
            {post.heading}
          </h2>
          {post.excerpt ? (
            <p className="mt-4 line-clamp-3 max-w-2xl text-sm leading-relaxed text-white/80 sm:mt-5 sm:line-clamp-none sm:text-base">
              {post.excerpt}
            </p>
          ) : null}
        </div>
        <div className="inline-flex items-center gap-3 text-sm font-semibold text-white">
          Read featured guide
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-(--primary) text-(--primary-foreground) transition-transform duration-200 ease-out group-hover:translate-x-1">
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
      className="interactive-card group flex gap-4 p-3 transition-all duration-200 ease-out"
    >
      <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-(--anslation-ds-soft)">
        <Image
          src={post.image}
          alt={post.imageAlt || post.heading}
          fill
          sizes="96px"
          loading={index < 2 ? "eager" : "lazy"}
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
        />
      </div>
      <div className="min-w-0 flex-1 flex flex-col justify-center gap-1">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.08em] text-(--muted-foreground)">
          <span className="text-(--primary)">0{index + 1}</span>
          <span aria-hidden="true" className="h-3 w-px bg-(--border)" />
          <span>{post.category}</span>
        </div>
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug tracking-tight text-(--foreground) transition-colors group-hover:text-(--primary)">
          {post.heading}
        </h3>
        <p className="text-xs font-medium text-(--muted-foreground)">{post.readTime}</p>
      </div>
    </Link>
  );
}

function MarketLaneGrid() {
  return (
    <section className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {BLOG_CONTENT_LANES.map((lane, index) => {
        const Icon = laneIcons[index] || BookOpen;
        return (
          <article
            key={lane.title}
            className="group rounded-2xl border border-(--border) bg-(--card) p-5 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-(--anslation-ds-border-strong) hover:shadow-[var(--anslation-ds-shadow-md)]"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-(--anslation-ds-primary-soft) text-(--primary) transition-colors group-hover:bg-(--primary) group-hover:text-(--primary-foreground)">
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-(--muted-foreground)">{lane.eyebrow}</p>
            <h2 className="mt-1.5 text-base font-semibold tracking-tight text-(--foreground)">{lane.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-(--muted-foreground)">{lane.description}</p>
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
      <div className="flex items-center justify-between rounded-2xl border border-(--border) bg-(--card) px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-(--anslation-ds-primary-soft) text-(--primary)">
            <TrendingUp className="h-3.5 w-3.5" />
          </span>
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-(--foreground)">Trending reads</p>
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
    <section className="mt-12 rounded-2xl border border-(--border) bg-(--card) p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-(--muted-foreground)">Topic clusters</p>
          <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-(--foreground) sm:text-2xl">
            Follow a complete reading path
          </h2>
        </div>
        <Link
          href="/blogs/topics"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-(--border) bg-(--background) px-4 text-sm font-semibold text-(--foreground) transition-all duration-150 hover:-translate-y-px hover:border-(--anslation-ds-border-strong) hover:bg-(--anslation-ds-soft) active:translate-y-0"
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
            className="group rounded-xl border border-(--border) bg-(--background) p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-(--anslation-ds-border-strong) hover:bg-(--card) hover:shadow-[var(--anslation-ds-shadow-sm)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-(--primary)">{cluster.eyebrow}</p>
                <h3 className="mt-1.5 text-base font-semibold tracking-tight text-(--foreground) transition-colors group-hover:text-(--primary)">
                  {cluster.title}
                </h3>
              </div>
              <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-(--anslation-ds-primary-soft) px-2 text-[11px] font-bold text-(--primary)">
                {cluster.postCount}
              </span>
            </div>
            <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-(--muted-foreground)">
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
  const firebaseCatalog = await getFastFirebaseBlogCatalog();
  const hasFirebaseCatalog = Boolean(firebaseCatalog?.posts?.length);
  const posts = hasFirebaseCatalog ? firebaseCatalog.posts : localPosts;
  const categories = getBlogCategories(posts);
  const stats = getBlogStats(posts);
  const groups = getFeaturedBlogGroups(posts);
  const trendingPosts = getTrendingBlogs(posts, 5);
  const topicClusters = getBlogTopicClusters(posts);
  const totalCount = Math.max(firebaseCatalog?.count || 0, posts.length);

  return (
    <main aria-labelledby="blog-index-title" className="route-page-shell">
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
      <div className="section-wide mx-auto w-full px-3 py-6 sm:px-5 md:py-8 lg:px-8">
        <section className="pt-4 pb-2 sm:pt-6">
          <div className="mb-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-8">
            <div className="max-w-3xl">
              <div className="route-kicker mb-4">
                <ShieldCheck className="h-3.5 w-3.5" />
                Fast guides, verified workflows
              </div>
              <h1
                id="blog-index-title"
                className="route-title"
              >
                AltFTool Blog
              </h1>
              <p className="route-description mt-4">
                Practical articles for tools, deals, students, creators, and digital productivity — shaped for quick scanning and deeper reading.
              </p>
              <HeroShortcutRail categories={categories} clusters={topicClusters} />
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="#blog-explorer"
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-(--primary) px-5 text-sm font-semibold text-(--primary-foreground) shadow-[0_1px_2px_rgba(15,23,42,0.08),inset_0_0_0_1px_color-mix(in_srgb,var(--primary)_70%,#000)] transition-all duration-150 hover:-translate-y-px hover:bg-(--primary-hover) hover:shadow-[0_8px_20px_rgba(23,105,224,0.2)] active:translate-y-0"
                >
                  Explore guides
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/blogs/topics"
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-(--border) bg-(--card) px-5 text-sm font-semibold text-(--foreground) shadow-sm transition-all duration-150 hover:-translate-y-px hover:border-(--anslation-ds-border-strong) hover:bg-(--anslation-ds-soft) active:translate-y-0"
                >
                  Topic clusters
                  <Layers3 className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 md:min-w-[360px]">
              <StatPill label="Articles" value={stats.posts} />
              <StatPill label="Categories" value={stats.categories} />
              <StatPill label="Tools" value={stats.tools} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
            <HeroArticle post={groups.hero} />
            <TrendingRail posts={trendingPosts} />
          </div>
        </section>

        <MarketLaneGrid />
        <TopicClusterBand clusters={topicClusters} />

        <section className="mt-10">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-normal text-(--muted-foreground)">Editorial map</p>
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
          initialPosts={posts.map(compactExplorerPost)}
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
