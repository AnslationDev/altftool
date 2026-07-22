import PageView from "./PageView";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Opening Your BuySmart Offer",
    description:
      "Preparing your BuySmart redirect. We check the destination before opening the merchant offer on AltFTool.",
    path: "/buysmart/redirect",
    noindex: true,
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
