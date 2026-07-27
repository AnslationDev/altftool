import {
  absoluteUrl,
  createBreadcrumbJsonLd,
  createHowToJsonLd,
  getSiteUrl,
} from "@/platform/seo/generateMetadata";
import { findPrank } from "./data/pranxData";

// Structured data for a Pranx page. Every node here describes content that is
// actually rendered on the page: the HowTo mirrors the visible ordered list,
// and the application node describes the interactive simulation itself. No
// ratings, review counts or play counts are emitted — none exist.

export function createPrankJsonLd({ prank, content, path } = {}) {
  if (!prank || !content || !path) return [];

  const url = absoluteUrl(path);
  const isGame = prank.category === "Game";
  const siteUrl = getSiteUrl();

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Pranx", path: "/pranx" },
  ];

  const parentSlug = prank.slug.includes("/") ? prank.slug.split("/")[0] : null;
  const parent = parentSlug ? findPrank(parentSlug) : null;
  if (parent) crumbs.push({ name: parent.title, path: `/pranx/${parent.slug}` });

  crumbs.push({ name: prank.title, path });

  const application = {
    "@context": "https://schema.org",
    "@type": isGame ? ["VideoGame", "WebApplication"] : ["SoftwareApplication", "WebApplication"],
    "@id": `${url}#app`,
    name: prank.title,
    description: content.answer,
    url,
    applicationCategory: isGame ? "GameApplication" : "EntertainmentApplication",
    operatingSystem: "Web",
    browserRequirements: "Requires a modern web browser with JavaScript enabled",
    isAccessibleForFree: true,
    inLanguage: "en",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    publisher: { "@id": `${siteUrl}/#organization` },
    isPartOf: { "@id": `${siteUrl}/#website` },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    ...(isGame ? { gamePlatform: "Web browser", playMode: "https://schema.org/SinglePlayer" } : {}),
  };

  return [
    createBreadcrumbJsonLd(crumbs),
    application,
    createHowToJsonLd({
      path,
      name: `How to use ${prank.title}`,
      description: content.answer,
      steps: content.steps,
    }),
  ].filter(Boolean);
}
