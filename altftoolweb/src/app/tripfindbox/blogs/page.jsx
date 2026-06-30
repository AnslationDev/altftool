import { Footer } from "@/app/tripfindbox/components/HeroSection";
import BlogExplorer from "@/app/tripfindbox/components/BlogExplorer";
import ResultsHeader from "@/app/tripfindbox/components/ResultsHeader";
import MobileResultsCallBar from "@/app/tripfindbox/components/MobileResultsCallBar";
import { blogCategories, fetchBlogPosts } from "@/app/tripfindbox/lib/blogData";
import { getTripFindBoxContactInfo } from "@/app/tripfindbox/lib/contactInfo";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Blogs | TripFindBox",
    description: "Read TripFindBox travel blogs about flight deals, destination guides, airline tips, baggage rules, and smarter booking.",
    path: "/tripfindbox/blogs",
  });
}

export default async function BlogsPage() {
  const [posts, contact] = await Promise.all([
    fetchBlogPosts(),
    getTripFindBoxContactInfo(),
  ]);

  return (
    <main className="site-route-page tripnest-blog-page">
      <ResultsHeader initialContact={contact} />
      <BlogExplorer posts={posts} categories={blogCategories} />
      <MobileResultsCallBar initialContact={contact} />
      <Footer />
    </main>
  );
}
