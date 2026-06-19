import { Footer } from "@/app/tripfindbox/components/HeroSection";
import BlogExplorer from "@/app/tripfindbox/components/BlogExplorer";
import ResultsHeader from "@/app/tripfindbox/components/ResultsHeader";
import FloatingCallIcon from "@/app/tripfindbox/components/FloatingCallIcon";
import { blogCategories, fetchBlogPosts } from "@/app/tripfindbox/lib/blogData";

export const revalidate = 1800;

export const metadata = {
  title: "Blogs | TripFindBox",
  description: "Read TripFindBox travel blogs about flight deals, destination guides, airline tips, baggage rules, and smarter booking.",
};

export default async function BlogsPage() {
  const posts = await fetchBlogPosts();

  return (
    <main className="site-route-page tripnest-blog-page">
      <ResultsHeader />
      <BlogExplorer posts={posts} categories={blogCategories} />
      <aside className="mobile-results-callbar" aria-label="Call TripFindBox support">
        <a href="tel:+17147827278">
          <span><FloatingCallIcon /></span>
          <strong>Call &amp; Get Unpublished Flight Deals!</strong>
          <b>+1-714-782-7278</b>
        </a>
      </aside>
      <Footer />
    </main>
  );
}
