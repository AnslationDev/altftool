import { cache } from "react";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  BLOG_REMOTE_LIMIT,
  compactBlogSummary,
  getAllBlogs,
  getBlogBySlug,
  getRelatedBlogs,
  getRelatedBlogsForPost,
  mergeBlogPosts,
} from "../data";
import {
  describeFirebaseBlogError,
  fetchFirebaseBlogBySlug,
  fetchFirebaseBlogsPage,
} from "../data/firebaseBlogs";
import JsonLd from "@/platform/seo/JsonLd";
import { getRelatedToolsForBlog } from "../utils/relatedTools";
import { getRelatedContent, RelatedContentSection } from "@/platform/linking";
import { getMissingBlogRedirect } from "../utils/missingBlogRedirect";
import {
  createBlogPostingJsonLd,
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createHowToJsonLd,
  createItemListJsonLd,
  createPageMetadata,
  compactBrandedTitle,
  getSiteUrl,
  siteConfig,
} from "@/platform/seo/generateMetadata";
import {
  deriveBlogFaqItems,
  deriveBlogHowToSteps,
  getBlogDescription,
} from "../utils/blogFaq";
import {
  getVisibleFaqItems,
  getVisibleHowToSteps,
  isGeneratedDescription,
  resolveBlogLede,
} from "../components/slug/blogAnswerFirst";
import BlogHeader from "../components/slug/BlogHeader";
import BlogContent from "../components/slug/BlogContent";
import BlogAds from "../components/slug/BlogAds";
import BlogTableOfContents from "../components/slug/BlogTableOfContents";
import BlogReadingProgress from "../components/slug/BlogReadingProgress";
import BlogInsightStrip from "../components/slug/BlogInsightStrip";
import BlogArticleEnhancements from "../components/slug/BlogArticleEnhancements";
import BlogReaderCompanion from "../components/slug/BlogReaderCompanion";
import BlogReaderTools from "../components/slug/BlogReaderTools";
import BlogFeedback from "../components/slug/BlogFeedback";
import BlogRelatedTools from "../components/slug/BlogRelatedTools";
import BlogArticleSnapshot from "../components/slug/BlogArticleSnapshot";
import BlogFlowNav from "../components/slug/BlogFlowNav";
import BlogCard from "../components/BlogCard";
import {
  BlogEngagementActions,
  BlogEngagementComments,
  BlogEngagementProvider,
} from "../components/slug/BlogEngagement";
import { isFeatureEnabled } from "@/lib/featureFlags";
import { shouldDeferBulkPrerendering } from "@/lib/buildPrerenderPolicy";
import "../../styles/ckeditor.css";

export const dynamic = "force-static";
export const revalidate = 3600;

const getBlogDetailBySlug = cache(async (slug) => (
  (await fetchFirebaseBlogBySlug(slug).catch((error) => {
    console.warn("Blog detail Firebase fallback:", describeFirebaseBlogError(error));
    return null;
  })) || getBlogBySlug(slug)
));

export function generateStaticParams() {
  if (shouldDeferBulkPrerendering()) return [];
  return getAllBlogs().map((blog) => ({ slug: blog.slug }));
}

async function getInitialRelatedBlogs(blog, slug) {
  if (!blog) return getRelatedBlogs(slug, 6).map(compactBlogSummary);

  try {
    const firebasePosts = await fetchFirebaseBlogsPage({
      pageSize: BLOG_REMOTE_LIMIT,
    });
    const candidates = mergeBlogPosts(getAllBlogs(), firebasePosts);
    return getRelatedBlogsForPost(blog, candidates, 6).map(compactBlogSummary);
  } catch {
    return getRelatedBlogs(slug, 6).map(compactBlogSummary);
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const blog = await getBlogDetailBySlug(slug);

  if (!blog) {
    return createPageMetadata({
      title: "AltFTool Blog Article",
      description: "Read practical AltFTool guides, tool tutorials, and digital productivity articles.",
      path: `/blogs/${slug}`,
      image: `/blogs/${slug}/opengraph-image`,
      keywords: ["AltFTool blog", "tool guides", "digital productivity"],
      type: "article",
    });
  }

  const title = compactBrandedTitle(
    blog.seoTitle || `${blog.heading} - AltFTool Blog`,
  );
  // Prefer the post's own summary over the synthesised fallback sentence: the
  // fallback is worded identically on every post that lacks a description, and
  // near-duplicate meta descriptions across the archive suppress snippets.
  const storedDescription = getBlogDescription(blog);
  const lede = resolveBlogLede(blog);
  const description = isGeneratedDescription(storedDescription) && lede
    ? lede
    : storedDescription;
  const tags = Array.isArray(blog.tags) ? blog.tags.filter(Boolean) : [];
  const metadata = await createPageMetadata({
    title,
    description,
    path: `/blogs/${slug}`,
    image: `/blogs/${slug}/opengraph-image`,
    keywords: [
      "AltFTool blog",
      blog.category,
      blog.tool,
      ...tags,
    ],
    type: "article",
  });

  return {
    ...metadata,
    authors: [{ name: blog.author || "AltFTool Editorial" }],
    openGraph: {
      ...metadata.openGraph,
      title,
      description,
      type: "article",
      publishedTime: blog.date,
      modifiedTime: blog.reviewedAt || blog.updatedAt || blog.date,
      authors: [blog.author || "AltFTool Editorial"],
      tags,
    },
    twitter: {
      ...metadata.twitter,
      title,
      description,
    },
  };
}

function toEngagementBlog(blog) {
  return {
    id: typeof blog.id === "string" ? blog.id : "",
    slug: blog.slug,
    author: blog.author,
    date: blog.date,
    likesCount: Number(blog.likesCount || 0),
    commentsCount: Number(blog.commentsCount || 0),
  };
}

function toReaderCompanionBlog(blog) {
  return {
    id: typeof blog.id === "string" ? blog.id : "",
    slug: blog.slug,
    heading: blog.heading,
    excerpt: blog.excerpt,
    category: blog.category,
    author: blog.author,
    authorRole: blog.authorRole,
    reviewedBy: blog.reviewedBy,
    editorialNote: blog.editorialNote,
    reviewedAt: blog.reviewedAt,
    updatedAt: blog.updatedAt,
    date: blog.date,
    createdAt: blog.createdAt,
    sources: blog.sources,
  };
}

// The blog data layer stamps every post that has no stored author with an
// editorial label, which the shared BlogPosting builder then types as a Person
// with a personal-profile URL. No such person exists, so an organisation-shaped
// byline is re-typed as an Organization here.
const ORGANIZATION_BYLINE = /^altftool\b|\b(editorial|team|staff|newsroom)\b/i;

/**
 * Keeps the article node limited to claims the page can back up: a real author
 * entity, `speakable` only when the summary element is rendered, and reviewer
 * fields only when the post stores a genuine review or update date.
 */
function refineArticleJsonLd(node, { summary, hasRevisionDate }) {
  if (!node) return null;

  const refined = { ...node };
  const authorName = refined.author?.name;
  const hasSummary = Boolean(summary);

  // Keep the described summary identical to the one on the page instead of the
  // synthesised fallback sentence shared by every description-less post.
  if (hasSummary && isGeneratedDescription(refined.description)) {
    refined.description = summary;
    refined.abstract = summary;
  }

  if (!authorName || ORGANIZATION_BYLINE.test(authorName)) {
    refined.author = {
      "@type": "Organization",
      name: authorName || siteConfig.name,
      url: getSiteUrl(),
    };
  }

  if (!hasSummary) delete refined.speakable;

  if (!hasRevisionDate) {
    delete refined.reviewedBy;
    delete refined.editor;
  }

  return refined;
}

function toFeedbackBlog(blog) {
  return {
    id: typeof blog.id === "string" ? blog.id : "",
    slug: blog.slug,
    helpfulCount: Number(blog.helpfulCount || 0),
    notHelpfulCount: Number(blog.notHelpfulCount || 0),
  };
}

export default async function BlogDetailPage({ params }) {
  const { slug } = await params;
  const initialBlog = await getBlogDetailBySlug(slug);
  const adViewportFixEnabled = isFeatureEnabled("ad_fix_viewport");

  if (!initialBlog) {
    const redirectPath = getMissingBlogRedirect(slug);
    if (redirectPath) permanentRedirect(redirectPath);
    notFound();
  }

  const initialRelated = await getInitialRelatedBlogs(initialBlog, slug);
  const initialRelatedTools = getRelatedToolsForBlog(initialBlog, 6);
  const articleContent = initialBlog.description || initialBlog.content || "";
  // Structured data has to describe what the reader actually sees. Derived FAQ
  // and HowTo entries are filtered down to the ones rendered on the page, so a
  // post with no authored questions or steps simply emits no FAQPage/HowTo
  // instead of schema for text that only exists in a template.
  const initialFaqs = getVisibleFaqItems({
    content: articleContent,
    items: deriveBlogFaqItems(initialBlog),
  });
  const initialHowToSteps = getVisibleHowToSteps({
    content: articleContent,
    steps: deriveBlogHowToSteps(initialBlog, initialRelatedTools),
  });
  const articleLede = resolveBlogLede(initialBlog);
  const articleJsonLd = refineArticleJsonLd(createBlogPostingJsonLd(initialBlog), {
    summary: articleLede,
    hasRevisionDate: Boolean(initialBlog.reviewedAt || initialBlog.updatedAt),
  });

  return (
    <>
      <JsonLd
        id={`blog-schema-${slug}`}
        data={[
          articleJsonLd,
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blogs" },
            { name: initialBlog?.heading || initialBlog?.title || "Article", path: `/blogs/${slug}` },
          ]),
          createFaqJsonLd({
            path: `/blogs/${slug}`,
            questions: initialFaqs,
          }),
          createHowToJsonLd({
            path: `/blogs/${slug}`,
            name: initialBlog?.heading || initialBlog?.title || "AltFTool blog workflow",
            description: getBlogDescription(initialBlog),
            steps: initialHowToSteps,
          }),
          createItemListJsonLd({
            path: `/blogs/${slug}`,
            name: "Related AltFTool resources",
            items: [
              ...initialRelated.slice(0, 4).map((post) => ({
                name: post.heading || post.title,
                path: `/blogs/${post.slug}`,
              })),
              ...initialRelatedTools.slice(0, 4).map((tool) => ({
                name: tool.name,
                path: tool.href,
              })),
            ],
          }),
        ]}
      />
      <main aria-labelledby="blog-article-title" className="bg-(--background) pb-12 pt-4 text-(--foreground) sm:pt-6">
        <BlogReadingProgress />
        <BlogReaderTools />
        <div className="mx-auto w-full max-w-[1500px] px-3 sm:px-5 lg:px-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Link
              href="/blogs"
              className="inline-flex h-9 items-center gap-2 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) px-3 text-sm font-semibold text-(--foreground) shadow-[var(--anslation-ds-shadow-sm)] transition hover:border-(--primary) hover:text-(--primary)"
            >
              <ArrowLeft className="h-4 w-4" />
              All blogs
            </Link>
          </div>

          <BlogHeader blog={initialBlog} summary={articleLede} />

          <BlogEngagementProvider blog={toEngagementBlog(initialBlog)}>
            <BlogEngagementActions />
            <BlogFlowNav
              relatedTools={initialRelatedTools}
              faqItems={initialFaqs}
              relatedPosts={initialRelated}
            />
            <BlogInsightStrip
              blog={initialBlog}
              faqItems={initialFaqs}
              relatedTools={initialRelatedTools}
              relatedPosts={initialRelated}
            />

            <BlogArticleSnapshot
              blog={initialBlog}
              faqItems={initialFaqs}
              relatedTools={initialRelatedTools}
              relatedPosts={initialRelated}
            />

            <BlogTableOfContents
              content={initialBlog.description}
              className="sticky top-16 z-30 mt-5 lg:hidden"
              collapsible
            />

            <div className={`mt-8 grid grid-cols-1 items-start justify-center gap-6 ${
              adViewportFixEnabled
                ? "lg:grid-cols-[minmax(0,780px)_280px] xl:grid-cols-[220px_minmax(0,760px)_280px] 2xl:grid-cols-[280px_minmax(0,840px)_300px]"
                : "lg:grid-cols-[240px_minmax(0,820px)] xl:grid-cols-[260px_minmax(0,860px)] 2xl:grid-cols-[280px_minmax(0,840px)_300px]"
            }`}>
              <BlogTableOfContents content={initialBlog.description} className={adViewportFixEnabled ? "hidden xl:block" : undefined} />

              <div className="min-w-0">
                <article
                  id="article-body"
                  aria-labelledby="blog-article-title"
                  className="scroll-mt-24 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) p-4 shadow-[var(--anslation-ds-shadow-sm)] sm:p-6 md:p-8"
                >
                  <BlogContent
                    content={initialBlog.description}
                    blog={initialBlog}
                    relatedTools={initialRelatedTools}
                    relatedPosts={initialRelated}
                    faqItems={initialFaqs}
                  />
                </article>
                <BlogReaderCompanion
                  blog={toReaderCompanionBlog(initialBlog)}
                  relatedPosts={initialRelated}
                />
                <BlogRelatedTools
                  blog={initialBlog}
                  tools={initialRelatedTools}
                />
                <BlogFeedback blog={toFeedbackBlog(initialBlog)} />
                <BlogArticleEnhancements
                  blog={initialBlog}
                  relatedPosts={initialRelated}
                />
                <BlogEngagementComments />
              </div>
              <BlogAds slug={slug} category={initialBlog.category} />
            </div>

            {initialRelated.length > 0 && (
              <section id="related-posts" className="mt-14 scroll-mt-24 border-t border-(--border) pt-8">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">
                      Matched by topic, tags, and reader signals
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight text-(--foreground)">
                      Smart related posts
                    </h2>
                  </div>
                  <Link
                    href={`/blogs?category=${encodeURIComponent(initialBlog.category)}`}
                    className="inline-flex h-9 items-center justify-center rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) px-3 text-sm font-semibold text-(--foreground) transition hover:border-(--primary) hover:text-(--primary)"
                  >
                    View category
                  </Link>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {initialRelated.map((post) => (
                    <BlogCard key={post.slug} blog={post} />
                  ))}
                </div>
              </section>
            )}

            {/* Cross-section discovery beyond blogs/tools (which the sections
                above already cover): calculators, listicles, experiences… */}
            <RelatedContentSection
              embedded
              className="mt-10"
              title="More across AltFTool"
              items={getRelatedContent({
                source: {
                  href: `/blogs/${slug}`,
                  title: initialBlog.heading || initialBlog.title,
                  description: initialBlog.seoDescription || initialBlog.excerpt,
                  tags: [
                    initialBlog.category,
                    ...(Array.isArray(initialBlog.tags) ? initialBlog.tags : []),
                    initialBlog.topic,
                    initialBlog.tool,
                  ].filter(Boolean),
                  section: "blogs",
                },
                slots: [
                  { sections: ["calculators", "top9", "top11", "deals"], limit: 3 },
                  { sections: ["experiences", "games", "products", "n8n"], limit: 3, minScore: 0 },
                ],
                excludeHrefs: initialRelatedTools.map((tool) => tool.href),
              })}
              path={`/blogs/${slug}`}
              jsonLdName={`More across AltFTool for ${initialBlog.heading || initialBlog.title}`}
            />
          </BlogEngagementProvider>
        </div>
      </main>
    </>
  );
}
