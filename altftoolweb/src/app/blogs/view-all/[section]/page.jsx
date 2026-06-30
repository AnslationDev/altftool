import PageView from "./PageView";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata({ params }) {
  const { section } = await params;
  return createPageMetadata({
    title: "All Blogs & Articles | AltFTool",
    description:
      "Browse all AltFTool blogs and articles, including latest posts, tool guides, trending reads, and editor's picks.",
    path: `/blogs/view-all/${section}`,
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
