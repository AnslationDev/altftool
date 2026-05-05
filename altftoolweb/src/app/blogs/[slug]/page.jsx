import BlogDetailClient from "./BlogDetailClient";
import { getAllBlogs, getBlogBySlug, getRelatedBlogs } from "../data";

export const revalidate = 3600;

export function generateStaticParams() {
  return getAllBlogs().map((blog) => ({ slug: blog.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const blog = getBlogBySlug(slug);

  if (!blog) {
    return {
      title: "AltFTool Blog Article",
      description: "Read practical AltFTool guides, tool tutorials, and digital productivity articles.",
    };
  }

  return {
    title: blog.seoTitle || `${blog.heading} - AltFTool Blog`,
    description: blog.seoDescription || blog.excerpt,
    openGraph: {
      title: blog.heading,
      description: blog.excerpt,
      images: blog.image ? [{ url: blog.image, alt: blog.imageAlt || blog.heading }] : undefined,
      type: "article",
    },
  };
}

export default async function BlogDetailPage({ params }) {
  const { slug } = await params;
  const initialBlog = getBlogBySlug(slug);
  const initialRelated = getRelatedBlogs(slug, 6);

  return (
    <BlogDetailClient
      slug={slug}
      initialBlog={initialBlog}
      initialRelated={initialRelated}
    />
  );
}
