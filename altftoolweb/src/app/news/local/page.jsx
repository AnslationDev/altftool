import Feeds from "../components/sections/Feeds";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import { getNewsDataServer } from "../lib/getNewsDataServer";

export const revalidate = 600; // Cache news feed for 10 minutes

export async function generateMetadata() {
  return createPageMetadata({
    title: "Local News & City Updates | AltFTool News",
    description: "Follow local headlines, community updates, and city news from AltFTool News.",
    path: "/news/local",
    keywords: ["local news", "city updates", "community news"],
  });
}

export default async function LocalPage() {
  const newsData = await getNewsDataServer();
  return <Feeds type="local" initialNewsData={newsData} />;
}
