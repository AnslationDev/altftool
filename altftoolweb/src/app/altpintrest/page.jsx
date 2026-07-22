import PageView from "./PageView";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "AltPinterest – Discover & Save Visual Inspiration",
    description:
      "Browse a masonry feed of AI tools, websites, prompts, and ideas on AltPinterest, then save, download, and share the pins you love.",
    path: "/altpintrest",
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
