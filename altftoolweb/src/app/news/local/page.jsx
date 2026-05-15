import Feeds from "../components/sections/Feeds";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export const metadata = createPageMetadata({
  title: "Local News & City Updates | AltFTool News",
  description: "Follow local headlines, community updates, and city news from AltFTool News.",
  path: "/news/local",
  keywords: ["local news", "city updates", "community news"],
});

export default function LocalPage() {
   return <Feeds type="local" />;
}
