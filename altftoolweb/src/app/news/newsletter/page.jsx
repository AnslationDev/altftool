import { createPageMetadata } from "@/platform/seo/generateMetadata";
import PageView from "./PageView";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Newsletter – Coming Soon | AltFTool News",
    description:
      "The AltFTool News email briefing is not live yet. Sign-ups are not open, and no email addresses are being collected. Read the news feed in the meantime.",
    path: "/news/newsletter",
    keywords: ["news newsletter", "local news newsletter", "daily news digest"],
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
