import JsonLd from "@/platform/seo/JsonLd";
import {
  absoluteUrl,
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createPageMetadata,
  getSiteUrl,
  siteConfig,
} from "@/platform/seo/generateMetadata";
import { FAQS } from "./data/staticContent";
import TopDealsLanding from "./components/TopDealsLanding";
import "./top-discount-products.css";
import "@/app/_altf/altf-brand.css";

const PAGE_DESCRIPTION =
  "Browse today's biggest Amazon discounts, filtered by category, brand, price, rating, and delivery speed — updated live, redirecting straight to Amazon.";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Top Discount Products – Today's Best Amazon Deals",
    description: PAGE_DESCRIPTION,
    path: "/lookouts/top-discount-products",
    keywords: [
      "amazon deals",
      "today's deals",
      "top discount products",
      "amazon discounts india",
      "best deals today",
      "AltFTool lookouts",
    ],
  });
}

function createCollectionJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${absoluteUrl("/lookouts/top-discount-products")}#webpage`,
    name: "Top Discount Products",
    url: absoluteUrl("/lookouts/top-discount-products"),
    description: PAGE_DESCRIPTION,
    isPartOf: {
      "@id": `${getSiteUrl()}/#website`,
    },
    publisher: {
      "@id": `${getSiteUrl()}/#organization`,
    },
  };
}

export default function TopDiscountProductsPage() {
  return (
    <>
      <JsonLd
        id="altftool-top-discount-products-schema"
        data={[
          createCollectionJsonLd(),
          createFaqJsonLd({
            path: "/lookouts/top-discount-products",
            questions: FAQS.map((f) => ({ question: f.question, answer: f.answer })),
          }),
          createBreadcrumbJsonLd([
            { name: siteConfig.name, path: "/" },
            { name: "Lookouts", path: "/lookouts" },
            { name: "Top Discount Products", path: "/lookouts/top-discount-products" },
          ]),
        ]}
      />
      <TopDealsLanding />
    </>
  );
}
