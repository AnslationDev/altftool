import BlogDetailClient from "./BlogDetailClient";
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
  fetchFirebaseBlogBySlug,
  fetchFirebaseBlogsPage,
} from "../data/firebaseBlogs";
import JsonLd from "@/platform/seo/JsonLd";
import { getRelatedToolsForBlog } from "../utils/relatedTools";
import {
  createBlogPostingJsonLd,
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createHowToJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import {
  deriveBlogFaqItems,
  deriveBlogHowToSteps,
  getBlogDescription,
} from "../utils/blogFaq";

export const revalidate = 3600;

export function generateStaticParams() {
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
  const blog = (await fetchFirebaseBlogBySlug(slug).catch(() => null)) || getBlogBySlug(slug);

  if (!blog) {
    return {
      title: "AltFTool Blog Article",
      description: "Read practical AltFTool guides, tool tutorials, and digital productivity articles.",
    };
  }

  const title = blog.seoTitle || `${blog.heading} - AltFTool Blog`;
  const description = getBlogDescription(blog);
  const tags = Array.isArray(blog.tags) ? blog.tags.filter(Boolean) : [];
  const metadata = createPageMetadata({
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

export default async function BlogDetailPage({ params }) {
  const { slug } = await params;
  const initialBlog = (await fetchFirebaseBlogBySlug(slug).catch((error) => {
    console.error("BlogDetailPage Firebase detail failed:", error);
    return null;
  })) || getBlogBySlug(slug);
  const initialRelated = await getInitialRelatedBlogs(initialBlog, slug);
  const initialRelatedTools = getRelatedToolsForBlog(initialBlog, 6);
  const initialFaqs = deriveBlogFaqItems(initialBlog);
  const initialHowToSteps = deriveBlogHowToSteps(initialBlog, initialRelatedTools);

  return (
    <>
      <JsonLd
        id={`blog-schema-${slug}`}
        data={[
          createBlogPostingJsonLd(initialBlog),
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
      <BlogDetailClient
        slug={slug}
        initialBlog={initialBlog}
        initialRelated={initialRelated}
        initialRelatedTools={initialRelatedTools}
        initialFaqs={initialFaqs}
      />
    </>
  );
}
