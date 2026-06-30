import PageView from "./PageView";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return createPageMetadata({
    title: "Exclusive Deals & Offers | AltFTool",
    description:
      "Browse exclusive deals, discounts, and coupon offers by category on AltFTool. Compare brands and find the best savings.",
    path: `/exclusivedeals/${slug}`,
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
