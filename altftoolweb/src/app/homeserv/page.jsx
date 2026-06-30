import PageView from "./PageView";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "QuoteNest Pros – Compare Local Home Service Quotes | AltFTool",
    description:
      "Pick a home service, review the details, and compare quotes from trusted local professionals in minutes with QuoteNest Pros.",
    path: "/homeserv",
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
