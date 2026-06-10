import ViewAllClient from "./ViewAllClient";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export const metadata = createPageMetadata({
  title: "All BuySmart Stores & Verified Deals | AltFTool",
  description:
    "Browse every BuySmart store on AltFTool with searchable brand pages, verified coupons, cashback, rewards, student offers, and category filters.",
  path: "/buysmart/view-all",
  keywords: [
    "BuySmart stores",
    "verified deals",
    "coupon directory",
    "cashback stores",
    "AltFTool BuySmart",
  ],
});

export default function ViewAll() {
  return <ViewAllClient />;
}
