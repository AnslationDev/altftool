import { createPageMetadata } from "@/platform/seo/generateMetadata";
import PageView from "./PageView";

export async function generateMetadata() {
  return createPageMetadata({
    title: "AltFTool Search – Premium Digital Toolkit",
    description:
      "Search the web with AltFTool's clean, fast search engine. Find web results, images, news, and videos in one focused, distraction-free interface.",
    path: "/search-eng",
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
