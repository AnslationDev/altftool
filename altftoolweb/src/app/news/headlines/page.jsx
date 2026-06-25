import Feeds from "../components/sections/Feeds";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import { getNewsDataServer } from "../lib/getNewsDataServer";

export const revalidate = 600; // Cache news feed for 10 minutes

export async function generateMetadata() {
  return createPageMetadata({
    title: "Top Headlines Today | AltFTool News",
    description: "Scan the latest top headlines and important updates curated by AltFTool News.",
    path: "/news/headlines",
    keywords: ["top headlines", "latest news", "breaking news"],
  });
}

export default async function HeadlinesPage() {
  const newsData = await getNewsDataServer();
  return <Feeds type="headlines" initialNewsData={newsData} />;
}
