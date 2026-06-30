import PageView from "./PageView";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "WindowSwap – Open a Window Somewhere in the World | AltFTool",
    description:
      "Relax with WindowSwap and watch calming, immersive window views from around the world, with ambient sounds and the ability to share your own.",
    path: "/windowswap",
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
