import BlogDetailClient from "./BlogDetailClient";
import { getAllBlogs, getBlogBySlug, getRelatedBlogs } from "../data";
import {
  fetchFirebaseBlogBySlug,
  fetchFirebaseRelatedBlogs,
} from "../data/firebaseBlogs";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBlogPostingJsonLd,
  createBreadcrumbJsonLd,
} from "@/platform/seo/generateMetadata";

export const revalidate = 3600;

export function generateStaticParams() {
  return getAllBlogs().map((blog) => ({ slug: blog.slug }));
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

  return {
    title: blog.seoTitle || `${blog.heading} - AltFTool Blog`,
    description: blog.seoDescription || blog.excerpt,
    alternates: {
      canonical: `/blogs/${slug}`,
    },
    openGraph: {
      title: blog.heading,
      description: blog.excerpt,
      url: `/blogs/${slug}`,
      images: blog.image ? [{ url: blog.image, alt: blog.imageAlt || blog.heading }] : undefined,
      type: "article",
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
