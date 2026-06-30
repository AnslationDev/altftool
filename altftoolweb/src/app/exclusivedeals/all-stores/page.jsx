import PageView from "./PageView";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "All Stores – Exclusive Deals & Coupons | AltFTool",
    description:
      "Explore all stores across categories with live deals, coupons, and top discounts on AltFTool. Sort by popularity, A-Z, and more.",
    path: "/exclusivedeals/all-stores",
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
