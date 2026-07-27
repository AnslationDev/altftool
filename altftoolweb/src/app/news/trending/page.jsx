import NewsListing from "../components/NewsListing";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import { getNewsDataServer } from "../lib/getNewsDataServer";

export const revalidate = 600;

export async function generateMetadata() {
  return createPageMetadata({
    title: "Trending Stories & Buzzing News | AltFTool News",
    description: "Discover what is trending today in technology, software, and general interests on AltFTool News.",
    path: "/news/trending",
    keywords: ["trending news", "viral news", "buzzing topics"],
    // Syndicated wire-service headlines the original publishers own — kept out
    // of the index (follow stays on so internal links still pass through).
    noindex: true,
  });
}

export default async function TrendingPage() {
  const newsData = await getNewsDataServer();
  const sorted = [...newsData].sort(
    (a, b) => b.likes + b.comments + b.shares - (a.likes + a.comments + a.shares)
  );
  return (
    <NewsListing
      title="Trending Now"
      description="Discover what is trending today across all topics."
      articles={sorted}
    />
  );
}
