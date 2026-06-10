import { NextResponse } from "next/server";
import { BLOG_REMOTE_LIMIT, blogTaxonomySlug, getAllBlogs } from "@/app/blogs/data";
import {
  describeFirebaseBlogError,
  fetchFirebaseBlogsPage,
} from "@/app/blogs/data/firebaseBlogs";

export const revalidate = 300;

function getStaticBlogFallback({ offset, limit, category }) {
  const categorySlug = blogTaxonomySlug(category || "");
  const posts = getAllBlogs().filter((post) => {
    if (!categorySlug || category === "All") return true;
    return blogTaxonomySlug(post.category) === categorySlug;
  });
  const chunk = posts.slice(offset, offset + limit);

  return {
    posts: chunk,
    nextOffset: offset + chunk.length,
    hasMore: offset + chunk.length < posts.length,
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const offset = Math.max(0, Number(searchParams.get("offset")) || 0);
  const limit = Math.min(
    100,
    Math.max(1, Number(searchParams.get("limit")) || BLOG_REMOTE_LIMIT)
  );
  const category = searchParams.get("category") || undefined;

  try {
    const posts = await fetchFirebaseBlogsPage({
      offset,
      pageSize: limit,
      category,
    });

    return NextResponse.json({
      posts,
      nextOffset: offset + posts.length,
      hasMore: posts.length === limit,
    });
  } catch (error) {
    const fallback = getStaticBlogFallback({ offset, limit, category });
    console.warn("GET /api/blogs static fallback:", describeFirebaseBlogError(error));
    return NextResponse.json({
      ...fallback,
      source: "static-fallback",
      warning: "Live blog data is temporarily unavailable.",
    });
  }
}
