import PageView from "./PageView";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata({ params }) {
  const { slug, id } = await params;
  return createPageMetadata({
    title: "Brand Deals & Offers | Exclusive Deals | AltFTool",
    description:
      "View exclusive brand deals, coupon codes, and discount offers on AltFTool. Find the best savings before you buy.",
    path: `/exclusivedeals/${slug}/${id}`,
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
