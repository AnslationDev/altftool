import { Footer } from "@/app/business-ops/tripfindbox/components/HeroSection";
import BlogExplorer from "@/app/business-ops/tripfindbox/components/BlogExplorer";
import ResultsHeader from "@/app/business-ops/tripfindbox/components/ResultsHeader";
import MobileResultsCallBar from "@/app/business-ops/tripfindbox/components/MobileResultsCallBar";
import { blogCategories, fetchBlogPosts } from "@/app/business-ops/tripfindbox/lib/blogData";
import { getTripFindBoxContactInfo } from "@/app/business-ops/tripfindbox/lib/contactInfo";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Blogs | TripFindBox",
    description: "Read TripFindBox travel blogs about flight deals, destination guides, airline tips, baggage rules, and smarter booking.",
    path: "/business-ops/tripfindbox/blogs",
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
