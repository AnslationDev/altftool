import NewsListing from "../components/NewsListing";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import { getNewsDataServer } from "../lib/getNewsDataServer";

export const revalidate = 600;

export async function generateMetadata() {
  return createPageMetadata({
    title: "Top Headlines Today | AltFTool News",
    description: "Scan the latest top headlines and important updates curated by AltFTool News.",
    path: "/news/headlines",
    keywords: ["top headlines", "latest news", "breaking news"],
    // Syndicated wire-service headlines the original publishers own — kept out
    // of the index (follow stays on so internal links still pass through).
    noindex: true,
  });
}

export default async function HeadlinesPage() {
  const newsData = await getNewsDataServer();
  return (
    <NewsListing
      title="Headlines"
      description="Top headlines and important updates curated for you."
      articles={newsData}
    />
  );
}
