import Feeds from "../components/sections/Feeds";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import { getNewsDataServer } from "../lib/getNewsDataServer";

export const revalidate = 600; // Cache news feed for 10 minutes

export async function generateMetadata() {
  return createPageMetadata({
    title: "Trending Stories & Buzzing News | AltFTool News",
    description: "Discover what is trending today in technology, software, and general interests on AltFTool News.",
    path: "/news/trending",
    keywords: ["trending news", "viral news", "buzzing topics"],
  });
}

export default async function TrendingPage() {
  const newsData = await getNewsDataServer();
  return <Feeds type="trending" initialNewsData={newsData} />;
}
