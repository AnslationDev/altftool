import BlogCard from "./BlogCard";
import Link from "next/link";
import { ArrowRight, Section } from "lucide-react";
import { PostCard } from "./FeaturedPostsSection";
import SectionHeader from "./CommonSecHeading";

export default function LatestBlogs({ blogs = [], section, imageHeight }) {
  const sortedBlogs = [...blogs].sort(
    (a, b) => b.updatedAt.seconds - a.updatedAt.seconds,
  );

  const featured = sortedBlogs[0];

  const sideBlogs = sortedBlogs.slice(1, 3);

  const moreBlogs = sortedBlogs.slice(4, 8);

  if (!featured) return null;

  return (
    <div className="section">
      <SectionHeader
        title="Latest Blogs"
        description="Handpicked articles to help you work smarter and faster."
        viewAllUrl="/blogs/view-all/latest-blogs"
      />

      <div className="grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-[1.2fr_1.9fr] gap-x-8 mt-5 sm:mt-0">
        <div className="block xl:hidden overflow-hidden rounded-xl">
          <BlogCard blog={featured} layout="side" className="w-full" />
        </div>

        <div className="hidden xl:block">
          <BlogCard blog={featured} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-0 ">
          {sideBlogs.map((b) => (
            <BlogCard key={b.id} blog={b} showExcerpt layout="side" />
          ))}
        </div>
      </div>

      <div className="hidden xl:block lg:grid lg:grid-cols-4 mt-5">
        <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {moreBlogs.map((post, i) => (
            <PostCard
              key={post.id || i}
              post={post}
              index={i}
              className="bg-white rounded-xl border border-(--border) shadow-md p-4 hover:shadow-lg transition"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
