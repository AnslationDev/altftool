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
    // Probe one row beyond the requested page so hasMore is exact — the old
    // `posts.length === limit` heuristic triggered one guaranteed-empty fetch
    // whenever the catalog size aligned with a page boundary. (Page size is
    // capped at 100, so at limit=100 the heuristic is kept.)
    const probeSize = limit < 100 ? limit + 1 : limit;
    const fetched = await fetchFirebaseBlogsPage({
      offset,
      pageSize: probeSize,
      category,
    });
    const posts = fetched.slice(0, limit);
    const hasMore = probeSize > limit ? fetched.length > limit : fetched.length === limit;

    return NextResponse.json({
      posts,
      nextOffset: offset + posts.length,
      hasMore,
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
