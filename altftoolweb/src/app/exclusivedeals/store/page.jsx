import PageView from "./PageView";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Store Coupons & Deals by Category | Exclusive Deals",
    description:
      "Browse stores by category and find verified coupons, deals, and exclusive offers on AltFTool. Save more on your favorite brands.",
    path: "/exclusivedeals/store",
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
