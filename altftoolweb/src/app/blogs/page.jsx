import { Suspense } from "react";
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
  TrendingUp,
} from "lucide-react";
import BlogExplorerClient from "./components/BlogExplorerClient";
import JsonLd from "@/platform/seo/JsonLd";
import RouteDiscoveryBand from "@/platform/navigation/RouteDiscoveryBand";
import AutoScrollSlider from "./components/AutoScrollSlider";
import { getRouteHub, getRouteHubJsonLdItems } from "@/platform/navigation/routeHubs";
import {
  BLOG_CONTENT_LANES,
  blogTaxonomySlug,
  getAllBlogs,
  getBlogCategories,
  getBlogTopicClusters,
  getFeaturedBlogGroups,
  getAllBlogTags,
} from "./data";
import {
  describeFirebaseBlogError,
  fetchFirebaseBlogCategories,
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
  "Practical articles for tools, data, software, devops and digital productivity — curated for learners, creators and builders.";
const BLOG_SSR_FIREBASE_TIMEOUT_MS = Number(process.env.ALTFT_BLOGS_SSR_FIREBASE_TIMEOUT_MS || 1200);

export async function generateMetadata() {
  return createPageMetadata({
    title: "ALTFTool Blog - Tools, Savings & Digital Guides",
    description: blogsDescription,
    path: "/blogs",
    image: "/assets/logo3.png",
  });
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
    <div className="mt-8">
      <div className="flex items-center gap-4">
        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-(--muted-foreground) shrink-0 whitespace-nowrap">
          Quick Search
        </span>
        <div className="-mx-3 flex snap-x gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 scrollbar-hide">
          <Link
            href="#blog-explorer"
            className="inline-flex h-9 shrink-0 snap-start items-center gap-2 rounded-full border border-(--border) bg-(--card) px-4 text-sm font-medium text-(--foreground) shadow-sm transition-all duration-150 hover:border-(--anslation-ds-border-strong) hover:bg-(--anslation-ds-soft)"
          >
            <Search className="h-4 w-4 text-(--primary)" />
            Search all
          </Link>
          {shortcuts.map((shortcut) => {
            const Icon = shortcut.icon;
            return (
              <Link
                key={shortcut.key}
                href={shortcut.href}
                className="inline-flex h-9 max-w-[220px] shrink-0 snap-start items-center gap-2 rounded-full border border-(--border) bg-(--card) px-4 text-sm font-medium text-(--muted-foreground) shadow-sm transition-all duration-150 hover:border-(--anslation-ds-border-strong) hover:bg-(--anslation-ds-soft) hover:text-(--foreground)"
              >
                <Icon className="h-4 w-4 text-(--primary)" />
                <span className="truncate">{shortcut.label}</span>
                <ChevronRight className="h-4 w-4 opacity-50" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Some Firebase-authored excerpts contain raw HTML fragments; strip them so
// list/hero surfaces never render literal "<h2>" tags.
function stripHtml(value = "") {
  return String(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
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
    excerpt: stripHtml(post.excerpt),
    description: stripHtml(post.excerpt || post.seoDescription || ""),
    image: post.image,
    imageAlt: post.imageAlt,
    date: post.date,
    // Real publish timestamps so the client can rank by true recency (the
    // featured hero always shows the newest Admin-published blogs).
    createdAt: post.createdAt,
    publishedAt: post.publishedAt,
    status: post.status,
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
    searchText: post.searchText,
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

function CompactArticle({ post, index }) {
  const description = stripHtml(post.description || post.excerpt || "");
  return (
    <Link
      href={`/blogs/${post.slug}`}
      prefetch={false}
      className="interactive-card group flex flex-col sm:flex-row gap-5 sm:gap-6 p-4 sm:p-5 transition-all duration-300 ease-out h-full border border-(--border) bg-(--card) rounded-2xl shadow-sm hover:shadow-[var(--anslation-ds-shadow-md)] hover:border-(--anslation-ds-border-strong)"
    >
      <div className="relative aspect-[16/9] w-full sm:aspect-auto sm:w-[40%] shrink-0 overflow-hidden rounded-xl bg-(--anslation-ds-soft)">
        <Image
          src={post.image}
          alt={post.imageAlt || post.heading}
          fill
          sizes="(max-width: 640px) 100vw, 400px"
          loading={index < 2 ? "eager" : "lazy"}
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
      </div>
      <div className="min-w-0 flex-1 flex flex-col justify-center py-1">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-(--muted-foreground)">
          <span className="text-(--primary)">0{index + 1}</span>
          <span aria-hidden="true" className="h-3 w-px bg-(--border)" />
          <span>{post.category}</span>
        </div>
        <h3 className="mt-2 line-clamp-2 text-lg sm:text-xl md:text-2xl font-bold leading-snug tracking-tight text-(--foreground) transition-colors group-hover:text-(--primary)">
          {post.heading}
        </h3>
        {description && (
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-(--muted-foreground)">
            {description}
          </p>
        )}
        <div className="mt-auto pt-5 flex items-center justify-between">
          <p className="text-xs font-semibold text-(--muted-foreground)">{post.readTime}</p>
          <span className="inline-flex items-center justify-center h-8 px-3 rounded-full bg-(--anslation-ds-soft) text-xs font-bold text-(--primary) transition-colors group-hover:bg-(--primary) group-hover:text-(--primary-foreground)">
            Read path
          </span>
        </div>
      </div>
    </Link>
  );
}

// Section heading matching the explorer's accent-bar style so every section
// on the page shares one visual rhythm.
function BandHeading({ title, action, actionHref, id }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h2 id={id} className="flex items-center gap-3 text-xl font-bold tracking-tight text-(--foreground) sm:text-2xl">
        <span aria-hidden="true" className="h-6 w-1 rounded-full bg-(--primary)" />
        {title}
      </h2>
      {action && actionHref ? (
        <Link href={actionHref} className="inline-flex items-center gap-1.5 text-sm font-bold text-(--primary) hover:underline">
          {action} <ArrowRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}

function MarketLaneGrid() {
  return (
    <section aria-labelledby="content-lanes-heading">
      <BandHeading id="content-lanes-heading" title="Browse by Intent" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {BLOG_CONTENT_LANES.map((lane, index) => {
          const Icon = laneIcons[index] || BookOpen;
          return (
            <article
              key={lane.title}
              className="group flex flex-col rounded-2xl border border-(--border) bg-(--card) p-5 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-(--anslation-ds-border-strong) hover:shadow-[var(--anslation-ds-shadow-md)]"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-(--anslation-ds-primary-soft) text-(--primary) transition-colors group-hover:bg-(--primary) group-hover:text-(--primary-foreground)">
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-(--muted-foreground)">{lane.eyebrow}</p>
              <h3 className="mt-1.5 text-base font-semibold tracking-tight text-(--foreground)">{lane.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-(--muted-foreground)">{lane.description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function TopicClusterBand({ clusters }) {
  const visibleClusters = clusters.filter((cluster) => cluster.postCount > 0).slice(0, 4);
  if (!visibleClusters.length) return null;

  return (
    <section aria-labelledby="topic-clusters-heading">
      <BandHeading
        id="topic-clusters-heading"
        title="Topic Clusters"
        action="View all clusters"
        actionHref="/blogs/topics"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {visibleClusters.map((cluster) => (
          <Link
            key={cluster.slug}
            href={`/blogs/topics/${cluster.slug}`}
            className="group flex flex-col rounded-2xl border border-(--border) bg-(--card) p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-(--anslation-ds-border-strong) hover:shadow-[var(--anslation-ds-shadow-md)]"
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
  const [firebaseCatalog, adminCategoryNames] = await Promise.all([
    getFastFirebaseBlogCatalog(),
    fetchFirebaseBlogCategories().catch(() => []),
  ]);
  const hasFirebaseCatalog = Boolean(firebaseCatalog?.posts?.length);
  const posts = hasFirebaseCatalog ? firebaseCatalog.posts : localPosts;
  const categories = getBlogCategories(posts, adminCategoryNames);
  const groups = getFeaturedBlogGroups(posts);
  // The featured hero + latest list are ranked client-side by true publish
  // recency (createdAt / publishedAt) so newly Admin-published blogs surface
  // instantly and cascade older ones down — see BlogExplorerClient.
  const topicClusters = getBlogTopicClusters(posts);
  const tags = getAllBlogTags(posts);
  const totalCount = Math.max(firebaseCatalog?.count || 0, posts.length);

  return (
    <main aria-labelledby="blog-index-title" className="route-page-shell">
      <JsonLd
        id="blogs-schema"
        data={[
          createCollectionPageJsonLd({
            path: "/blogs",
            name: "ALTFTool Blog",
            description: blogsDescription,
          }),
          createItemListJsonLd({
            path: "/blogs",
            name: "ALTFTool blog next routes",
            items: getRouteHubJsonLdItems("blogs"),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Blogs", path: "/blogs" },
          ]),
        ]}
      />
      <div className="section-wide mx-auto w-full px-3 py-6 sm:px-5 md:py-8 lg:px-8">
        {/* Compact header — the featured hero carousel leads the page. */}
        <section className="pb-5">
          <h1
            id="blog-index-title"
            className="text-2xl font-bold tracking-tight text-(--foreground) sm:text-3xl"
          >
            ALTFTool <span className="text-(--primary)">Blog</span>
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-(--muted-foreground) sm:text-base">
            {blogsDescription}
          </p>
        </section>

        <Suspense fallback={null}>
        <BlogExplorerClient
          heroShortcutRail={<HeroShortcutRail categories={categories} clusters={topicClusters} />}
          initialPosts={posts.map(compactExplorerPost)}
          categories={categories}
          tags={tags}
          initialRemoteOffset={
            hasFirebaseCatalog ? firebaseCatalog.offset : 0
          }
          totalCount={totalCount}
        >
          <MarketLaneGrid />
          <TopicClusterBand clusters={topicClusters} />
          <section aria-labelledby="popular-paths-heading">
            <BandHeading
              id="popular-paths-heading"
              title="Popular Paths"
              action="Explore topics"
              actionHref="/blogs/topics"
            />
            <AutoScrollSlider className="pb-4">
              {groups.trending.map((post, index) => (
                <div key={post.slug} className="w-full shrink-0 snap-start sm:w-[85%] lg:w-[48.9%]">
                  <CompactArticle post={post} index={index} />
                </div>
              ))}
            </AutoScrollSlider>
          </section>
        </BlogExplorerClient>
        </Suspense>
      </div>
      <RouteDiscoveryBand {...blogsRouteHub} />
    </main>
  );
}
