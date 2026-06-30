import { createPageMetadata } from "@/platform/seo/generateMetadata";
import PageView from "./PageView";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Newsletter – Local News Delivered Daily | AltFTool News",
    description:
      "Subscribe to the AltFTool News newsletter and get curated local stories — politics, tech, business, and sports — delivered to your inbox every morning.",
    path: "/news/newsletter",
    keywords: ["news newsletter", "local news newsletter", "daily news digest"],
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
