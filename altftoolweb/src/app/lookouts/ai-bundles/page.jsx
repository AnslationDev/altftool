import JsonLd from "@/platform/seo/JsonLd";
import {
  absoluteUrl,
  createBreadcrumbJsonLd,
  createPageMetadata,
  getSiteUrl,
  siteConfig,
} from "@/platform/seo/generateMetadata";
import { TOOL_CATEGORIES, TOTAL_TOOLS } from "./data/tools";
import AiBundlesLanding from "./components/AiBundlesLanding";
import "./ai-bundles.css";

const PAGE_DESCRIPTION = `Discover ${TOTAL_TOOLS}+ AI tools across ${TOOL_CATEGORIES.length} categories — free plans, verified free trials, student discounts, and the best subscriptions. Compare, save favorites, and find your next AI tool in one place.`;

export async function generateMetadata() {
  return createPageMetadata({
    title: `AI Tools & Free Subscriptions – ${TOTAL_TOOLS}+ Tools by Category`,
    description: PAGE_DESCRIPTION,
    path: "/lookouts/ai-bundles",
    keywords: [
      "AI tools directory",
      "free AI tools",
      "AI subscription deals",
      "free AI subscriptions",
      "student AI discounts",
      "best AI tools by category",
      "AltFTool AI Bundles",
    ],
  });
}

function createAiBundlesJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${absoluteUrl("/lookouts/ai-bundles")}#webpage`,
    name: "AI Tools & Free Subscriptions",
    url: absoluteUrl("/lookouts/ai-bundles"),
    description: PAGE_DESCRIPTION,
    isPartOf: {
      "@id": `${getSiteUrl()}/#website`,
    },
    publisher: {
      "@id": `${getSiteUrl()}/#organization`,
    },
  };
}

function createCategoryListJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${absoluteUrl("/lookouts/ai-bundles")}#categories`,
    name: "AI Tool Categories",
    numberOfItems: TOOL_CATEGORIES.length,
    itemListElement: TOOL_CATEGORIES.map((category, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: category.label,
      url: `${absoluteUrl("/lookouts/ai-bundles")}#explore`,
    })),
  };
}

export default function AiBundlesPage() {
  return (
    <>
      <JsonLd
        id="altftool-ai-bundles-schema"
        data={[
          createAiBundlesJsonLd(),
          createCategoryListJsonLd(),
          createBreadcrumbJsonLd([
            { name: siteConfig.name, path: "/" },
            { name: "AI Tools & Free Subscriptions", path: "/lookouts/ai-bundles" },
          ]),
        ]}
      />
      <AiBundlesLanding />
    </>
  );
}
