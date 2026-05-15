import StoreDetailClient from "./StoreDetailClient";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

function titleFromSlug(slug = "") {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const title = titleFromSlug(slug);

  return createPageMetadata({
    title: `${title || "Store"} Deals & Coupon Codes | BuySmart | AltFTool`,
    description:
      "Check verified BuySmart savings, coupon codes, cashback, reward offers, expiry details, and store terms before opening a merchant deal.",
    path: `/buysmart/stores/${slug}`,
    keywords: [`${title} deals`, `${title} coupons`, "BuySmart", "cashback offers"],
  });
}

export default async function Page({ params }) {
  const { slug } = await params;
  return <StoreDetailClient slug={slug} />;
}
