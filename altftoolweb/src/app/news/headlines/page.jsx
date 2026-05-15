import Feeds from "../components/sections/Feeds";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export const metadata = createPageMetadata({
  title: "Top Headlines Today | AltFTool News",
  description: "Scan the latest top headlines and important updates curated by AltFTool News.",
  path: "/news/headlines",
  keywords: ["top headlines", "latest news", "breaking news"],
});

export default function HeadlinesPage() {
  return <Feeds type="headlines" />;
}
