import PageView from "./PageView";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "WindowSwap Pricing – Free & All-Access Plans | AltFTool",
    description:
      "Compare WindowSwap free viewing with the All-Access plan to unlock search, bookmarks, custom playlists, and ad-free window views.",
    path: "/windowswap/pricing",
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
