import { createPageMetadata } from "@/platform/seo/generateMetadata";
import PageView from "./PageView";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Ad Preview | AltFTool",
    description:
      "Preview AltFTool ad layouts including tool cards, sidebars, banners, news cards, game cards, and extension cards before they go live.",
    path: "/ad-preview",
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
