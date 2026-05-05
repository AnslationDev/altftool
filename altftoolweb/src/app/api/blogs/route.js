import { NextResponse } from "next/server";
import { BLOG_REMOTE_LIMIT } from "@/app/blogs/data";
import { fetchFirebaseBlogsPage } from "@/app/blogs/data/firebaseBlogs";

export const revalidate = 300;

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
    console.error("GET /api/blogs failed:", error);
    return NextResponse.json(
      { posts: [], nextOffset: offset, hasMore: false },
      { status: 200 }
    );
  }
}
