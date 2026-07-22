import PageView from "./PageView";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata({ params }) {
  const { slug, id } = await params;
  return createPageMetadata({
    title: "Store Offers & Coupon Codes | Exclusive Deals",
    description:
      "Explore store offers, coupon codes, and exclusive deals on AltFTool. Compare savings across brands before you shop.",
    path: `/exclusivedeals/store/${slug}/${id}`,
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
