// Structured data for ALTF Love IMG tool pages.
//
// Server-only: it pulls the shared SEO helpers (which reach the central SEO
// config source). Import it from page.jsx, never from a "use client" module.
//
// Every field is backed by content rendered on the page: `description` is the
// same answer sentence printed under the H1, and the free Offer is truthful —
// these tools have no paid tier and no account gate.

import {
  absoluteUrl,
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  getSiteUrl,
} from "@/platform/seo/generateMetadata";
import { BASE, TOOLS, getTool } from "./data/tools";

const HUB_NAME = "ALTF Love IMG";

/**
 * SoftwareApplication/WebApplication + BreadcrumbList for one tool page.
 * Returns [] for an unknown slug or a tool with no verified answer sentence.
 */
export function buildToolJsonLd(slug) {
  const tool = getTool(slug);
  if (!tool?.answer) return [];

  const path = `${BASE}/${slug}`;
  const url = absoluteUrl(path);

  const software = {
    "@context": "https://schema.org",
    "@type": ["SoftwareApplication", "WebApplication"],
    "@id": `${url}#software`,
    name: tool.name,
    description: tool.answer,
    url,
    applicationCategory: "MultimediaApplication",
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
    { name: HUB_NAME, path: BASE },
    { name: tool.name, path },
  ]);

  return [software, breadcrumb].filter(Boolean);
}

/**
 * CollectionPage + ItemList + BreadcrumbList for the /altfloveimg hub.
 * The ItemList mirrors the tool grid rendered on that page.
 */
export function buildHubJsonLd() {
  return [
    createCollectionPageJsonLd({
      path: BASE,
      name: "ALTF Love IMG — free in-browser image tools",
      description: `A free collection of ${TOOLS.length} image tools that run entirely in the browser: compress, resize, crop, rotate, convert, watermark and edit pictures with no upload and no account.`,
    }),
    createItemListJsonLd({
      path: BASE,
      name: "All ALTF Love IMG tools",
      items: TOOLS.map((tool) => ({
        name: tool.name,
        path: `${BASE}/${tool.slug}`,
      })),
    }),
    createBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: HUB_NAME, path: BASE },
    ]),
  ].filter(Boolean);
}
