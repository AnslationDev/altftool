import BlogDetailClient from "./BlogDetailClient";
import { getAllBlogs, getBlogBySlug, getRelatedBlogs, stripHtml } from "../data";
import {
  fetchFirebaseBlogBySlug,
  fetchFirebaseRelatedBlogs,
} from "../data/firebaseBlogs";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBlogPostingJsonLd,
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";

export const revalidate = 3600;

export function generateStaticParams() {
  return getAllBlogs().map((blog) => ({ slug: blog.slug }));
}

function getBlogDescription(blog) {
  return (
    blog?.seoDescription ||
    blog?.excerpt ||
    stripHtml(blog?.description || blog?.content || "").slice(0, 160) ||
    "Read practical AltFTool guides, tool tutorials, and digital productivity articles."
  );
}

function buildBlogFaq(blog) {
  if (!blog) return [];

  const title = blog.heading || blog.title || "this AltFTool article";
  const category = blog.category || "AltFTool guides";
  const readTime = blog.readTime || `${blog.readTimeMinutes || 2} min read`;
  const readingDuration = String(readTime).replace(/\s*read$/i, "");

  return [
    {
      question: `What is ${title} about?`,
      answer: getBlogDescription(blog),
    },
    {
      question: `How long does it take to read ${title}?`,
      answer: `This article takes about ${readingDuration} to read.`,
    },
    {
      question: `Where can I find more ${category} articles?`,
      answer: `Browse the ${category} archive on AltFTool for more related guides, tips, and tool workflows.`,
    },
  ];
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
    image: blog.image,
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
      modifiedTime: blog.updatedAt || blog.date,
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
  const initialRelated = initialBlog
    ? await fetchFirebaseRelatedBlogs(initialBlog.category, slug, 6).catch(() =>
        getRelatedBlogs(slug, 6)
      )
    : getRelatedBlogs(slug, 6);

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
            questions: buildBlogFaq(initialBlog),
          }),
          createItemListJsonLd({
            path: `/blogs/${slug}`,
            name: "Related AltFTool blog articles",
            items: initialRelated.slice(0, 6).map((post) => ({
              name: post.heading || post.title,
              path: `/blogs/${post.slug}`,
            })),
          }),
        ]}
      />
      <BlogDetailClient
        slug={slug}
        initialBlog={initialBlog}
        initialRelated={initialRelated}
      />
    </>
  );
}
