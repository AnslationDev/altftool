import PageView from "../PageView";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Explore Pins – AltPinterest",
    description:
      "Explore and discover visual inspiration, AI tools, designs, and ideas on AltPinterest.",
    path: "/altpintrest/explore",
  });
}

export default function ExplorePage(props) {
  return <PageView {...props} defaultView="explore" />;
}
