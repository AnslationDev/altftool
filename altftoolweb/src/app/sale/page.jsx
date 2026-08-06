import SaleClient from "./SaleClient";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createPageMetadata,
  createToolJsonLd,
} from "@/platform/seo/generateMetadata";
import saleData from "./data/saleData";

const TITLE = "Sale Locator – Find Nearby Deals and Offers";
const DESCRIPTION =
  "Use the AltFTool Sale Locator to discover nearby sales, discounts, and special offers. Find the best deals at stores and online locations near you.";

export async function generateMetadata() {
  return createPageMetadata({
    title: TITLE,
    description: DESCRIPTION,
    path: "/sale",
    keywords: ["sale locator", "nearby deals", "discount offers", "coupon finder"],
  });
}

export default function Page() {
  // SoftwareApplication/WebApplication + FAQPage + BreadcrumbList.
  //
  // The FAQPage is built from the same saleData.json the page renders through
  // components/FAQsSection.jsx, so the two cannot drift.
  //
  // Deliberately NOT emitted:
  //   * Product / Offer / ItemList for the deals — Trending, Flash and Deal of
  //     the Day are fetched at runtime from /api/sale/home-deals (SerpAPI).
  //     This server render has no idea what they are, and their prices belong
  //     to third-party merchants, not to AltFTool.
  //   * aggregateRating — the app does not collect or render customer reviews.
  //   * Any of hero.stats ("200+ International Brands", "30,000+ Happy
  //     Customers"): nothing in this app counts brands, products or customers,
  //     so those are display numbers and stay out of structured data.
  //
  // The Offer the tool node carries describes free access to the Sale Locator
  // itself (see createToolJsonLd) — it is attached to the #software entity and
  // never to a retail deal shown on the page.
  return (
    <>
      <JsonLd
        id="sale-schema"
        data={[
          createToolJsonLd({
            slug: "sale",
            path: "/sale",
            tool: {
              name: "Sale Locator",
              description: DESCRIPTION,
              category: ["Shopping", "Deals"],
              topics: ["sale locator", "nearby deals", "discount offers"],
            },
          }),
          createFaqJsonLd({
            path: "/sale",
            questions: saleData.faq.items.map((item) => ({
              question: item.question,
              answer: item.answer,
            })),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Sale Locator", path: "/sale" },
          ]),
        ]}
      />
      <SaleClient />
    </>
  );
}
