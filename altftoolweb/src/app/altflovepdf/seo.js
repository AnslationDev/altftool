// Structured data for Altf❤️PDF tool pages.
//
// Server-only: it pulls the shared SEO helpers (which reach the central SEO
// config source). Import it from page.jsx, never from a "use client" module.
//
// Every field below is backed by content that is actually rendered on the page:
// `description` is the same answer sentence printed under the H1, and the free
// Offer is truthful — the tools have no paid tier and no account gate.

import {
  absoluteUrl,
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  getSiteUrl,
} from "@/platform/seo/generateMetadata";
import { getToolFacts } from "./toolFacts";
import { TOOLS } from "./toolsData";

const BASE_PATH = "/altflovepdf";
const HUB_NAME = "Altf❤️PDF tools";

/** Schema.org applicationCategory per Altf❤️PDF sidebar group. */
const APPLICATION_CATEGORY = {
  "Image Tools": "MultimediaApplication",
};

function toolLabel(tool) {
  return tool.name.replace(/→/g, "to").replace(/\s+/g, " ").trim();
}

/**
 * SoftwareApplication/WebApplication + BreadcrumbList for one tool page.
 * Returns an array ready for <JsonLd data={…} />, or [] for an unknown slug.
 */
export function buildToolJsonLd(tool) {
  if (!tool?.slug) return [];

  const path = `${BASE_PATH}/${tool.slug}`;
  const url = absoluteUrl(path);
  const facts = getToolFacts(tool.slug);
  const name = toolLabel(tool);

  const software = {
    "@context": "https://schema.org",
    "@type": ["SoftwareApplication", "WebApplication"],
    "@id": `${url}#software`,
    name,
    alternateName: tool.name,
    description: facts?.answer || tool.desc,
    url,
    applicationCategory:
      APPLICATION_CATEGORY[tool.sidebarCategory] || "BusinessApplication",
    applicationSubCategory: tool.category,
    operatingSystem: "Web browser",
    browserRequirements: "Requires a modern web browser with JavaScript enabled",
    isAccessibleForFree: true,
    inLanguage: "en",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    publisher: { "@id": `${getSiteUrl()}/#organization` },
    isPartOf: { "@id": `${getSiteUrl()}/#website` },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  const breadcrumb = createBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: HUB_NAME, path: BASE_PATH },
    { name, path },
  ]);

  return [software, breadcrumb].filter(Boolean);
}

/**
 * CollectionPage + ItemList + BreadcrumbList for the /altflovepdf hub.
 * The ItemList mirrors the "All PDF tools" grid rendered on that page.
 */
export function buildHubJsonLd() {
  return [
    createCollectionPageJsonLd({
      path: BASE_PATH,
      name: "Altf❤️PDF — free browser PDF and image tools",
      description: `A free collection of ${TOOLS.length} PDF and image tools that run entirely in the browser: merge, split, compress, convert, protect and edit PDFs with no upload and no account.`,
    }),
    createItemListJsonLd({
      path: BASE_PATH,
      name: "All Altf❤️PDF tools",
      items: TOOLS.map((tool) => ({
        name: toolLabel(tool),
        path: `${BASE_PATH}/${tool.slug}`,
      })),
    }),
    createBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: HUB_NAME, path: BASE_PATH },
    ]),
  ].filter(Boolean);
}
