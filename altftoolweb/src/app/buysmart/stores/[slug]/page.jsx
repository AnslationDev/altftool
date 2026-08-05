import StoreDetailClient from "./StoreDetailClient";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import { getBuySmartBrandSlug, slugifyBuySmartBrand } from "@altftool/core/buysmart";
import { fallbackBuySmartOffers } from "@/app/buysmart/data/fallbackOffers";
import fallbackStores from "@/app/buysmart/data/stores.json";

// Keep metadata aligned with the server-safe data sources the client can
// actually resolve. Unknown slugs must not manufacture a store identity from
// the URL and publish it as an indexable deals page.
const KNOWN_STORE_SLUGS = new Set(
  [
    ...fallbackStores.map((store) => store.slug),
    ...fallbackBuySmartOffers.flatMap((offer) => [
      offer.slug,
      offer.storeSlug,
      offer.brandSlug,
      getBuySmartBrandSlug(offer),
    ]),
  ]
    .filter(Boolean)
    .map(slugifyBuySmartBrand),
);

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

  if (!KNOWN_STORE_SLUGS.has(slugifyBuySmartBrand(slug))) {
    return createPageMetadata({
      title: "Store not found",
      description: "This store page is not available. Browse BuySmart for current coupon codes and cashback offers.",
      path: `/buysmart/stores/${slug}`,
      noindex: true,
    });
  }

  return createPageMetadata({
    title: `${title || "Store"} Deals & Coupon Codes | BuySmart`,
    description:
      "Check BuySmart savings, coupon codes, cashback, reward offers, expiry details, and store terms before opening a merchant deal.",
    path: `/buysmart/stores/${slug}`,
    keywords: [`${title} deals`, `${title} coupons`, "BuySmart", "cashback offers"],
  });
}

export default async function Page({ params }) {
  const { slug } = await params;
  return <StoreDetailClient slug={slug} />;
}
