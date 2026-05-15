import SaleClient from "./SaleClient";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Sale Locator – Find Nearby Deals and Offers | AltFTool",
    description:
      "Use the AltFTool Sale Locator to discover nearby sales, discounts, and special offers. Find the best deals at stores and online locations near you.",
    path: "/sale",
    keywords: ["sale locator", "nearby deals", "discount offers", "coupon finder"],
  });
}

export default function Page() {
  return <SaleClient />;
}
