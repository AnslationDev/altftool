import NewsListing from "../components/NewsListing";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
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
  // getNewsDataServer already returns newest-first. This page used to re-sort
  // by synthesised like/comment/share counts; we hold no engagement data for
  // syndicated feed items, so recency is the only honest ordering.
  const newsData = await getNewsDataServer();
  return (
    <>
      {/* No ItemList — the feed rotates on every revalidation and /news/[slug]
          404s (noindex) once an item drops out. See src/app/news/page.jsx. */}
      <JsonLd
        id="news-trending-schema"
        data={[
          createCollectionPageJsonLd({
            path: "/news/trending",
            name: "Trending Now",
            description: "Discover what is trending today across all topics.",
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "News", path: "/news" },
            { name: "Trending Now", path: "/news/trending" },
          ]),
        ]}
      />
      <NewsListing
        title="Trending Now"
        description="Discover what is trending today across all topics."
        articles={newsData}
      />
    </>
  );
}
