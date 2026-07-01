import NewsListing from "../components/NewsListing";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import { getNewsDataServer } from "../lib/getNewsDataServer";

export const revalidate = 600;

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
  return (
    <NewsListing
      title="Local News"
      description="Local headlines, community updates, and city news."
      articles={newsData}
    />
  );
}
