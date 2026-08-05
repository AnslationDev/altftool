/**
 * ALTFTool — GEO Entity SEO builders.
 *
 * Reusable JSON-LD generators that associate the AltFTool brand with real
 * location entities (see geoLocations.js) WITHOUT keyword stuffing or
 * doorway pages. Everything links back to the canonical Organization and
 * WebSite nodes via `@id`, so Google reads one connected entity graph:
 *
 *   Organization ─ areaServed ─→ Country/State/City (Wikidata-disambiguated)
 *        ▲                              ▲
 *        │ provider                     │ spatialCoverage / areaServed
 *   Service ("AltFTool in {Place}")   WebPage (future geo routes)
 *
 * PROGRAMMATIC-SEO READY: when dedicated geo routes ship (e.g. /locations/
 * [geo] or /tools/[slug]-[geo]), one call to buildGeoJsonLdBundle() +
 * createGeoPageMetadata() gives the page its full metadata, canonical,
 * breadcrumbs and schema — no core changes required. Until then these
 * builders also power the Organization-level areaServed signal.
 */

import {
  absoluteUrl,
  createPageMetadata,
  getSiteUrl,
  siteConfig,
} from "./generateMetadata.js";
import { getGeoChain, getGeoChildren, getGeoLocation } from "./geoLocations.js";

const PLACE_TYPE = {
  Country: "Country",
  State: "State",
  City: "City",
};

/**
 * Meta-description budget. `trimMetaDescription()` in generateMetadata.js
 * passes a string through verbatim only when it is UNDER 160 chars AND ends
 * in terminal punctuation; anything longer is cut mid-clause and a period is
 * bolted on. The previous single template ran 153-180 chars, so 94 of the 141
 * registry locations shipped a description whose closing sentence had been
 * silently amputated. Everything below is composed to land inside this budget
 * for every row — verify with the real trimMetaDescription after any edit.
 */
const DESC_BUDGET = 158;
const DESC_CORE =
  ": compress images, convert PDF to Word, make QR codes and run 100+ calculators.";
const DESC_TAILS = [" Free, no sign-up, no install.", " Free, no sign-up."];

/**
 * One description builder shared by the page metadata and the WebPage node, so
 * the <meta> tag and the JSON-LD never drift apart.
 *
 * The only honest differentiator this registry actually holds is the
 * containment hierarchy, so that is all that is used: state pages name the
 * cities they link to, everything else names its parent. No invented local
 * facts — the site has none.
 */
export function buildGeoDescription(slugOrLocation) {
  const location =
    typeof slugOrLocation === "string" ? getGeoLocation(slugOrLocation) : slugOrLocation;
  if (!location) return "";

  const chain = getGeoChain(location.slug);
  const root = chain.length > 1 ? chain[chain.length - 1].name : "";
  const head =
    location.type === "Country"
      ? `Free online tools in ${location.name}`
      : `Free online tools for ${location.name}${root ? `, ${root}` : ""}`;

  let subject = head;
  if (location.type === "State") {
    const shortestTail = DESC_TAILS[DESC_TAILS.length - 1];
    for (const child of getGeoChildren(location.slug)) {
      const next =
        subject === head ? `${head} — ${child.name}` : `${subject}, ${child.name}`;
      if (next.length + DESC_CORE.length + shortestTail.length > DESC_BUDGET) break;
      subject = next;
    }
  }

  const base = `${subject}${DESC_CORE}`;
  const tail = DESC_TAILS.find((option) => base.length + option.length <= DESC_BUDGET);
  return tail ? `${base}${tail}` : base;
}

function geoId(location) {
  return `${getSiteUrl()}/#geo-${location.slug}`;
}

/**
 * A disambiguated Place node (Country / State / City) with authoritative
 * sameAs links — the core Knowledge Graph signal for the location entity.
 */
export function createPlaceJsonLd(slugOrLocation) {
  const location =
    typeof slugOrLocation === "string" ? getGeoLocation(slugOrLocation) : slugOrLocation;
  if (!location) return null;

  const parent = location.containedIn ? getGeoLocation(location.containedIn) : null;

  const node = {
    "@context": "https://schema.org",
    "@type": PLACE_TYPE[location.type] || "Place",
    "@id": geoId(location),
    name: location.name,
    sameAs: [location.wikipedia, location.wikidata].filter(Boolean),
  };
  if (location.alternateName) node.alternateName = location.alternateName;
  if (parent) {
    node.containedInPlace = {
      "@type": PLACE_TYPE[parent.type] || "Place",
      "@id": geoId(parent),
      name: parent.name,
    };
  }
  return node;
}

/** Compact areaServed reference (used inside other nodes). */
export function createAreaServedRef(slugOrLocation) {
  const location =
    typeof slugOrLocation === "string" ? getGeoLocation(slugOrLocation) : slugOrLocation;
  if (!location) return null;
  return {
    "@type": PLACE_TYPE[location.type] || "Place",
    "@id": geoId(location),
    name: location.name,
    sameAs: location.wikidata || location.wikipedia,
  };
}

/**
 * Service node: "AltFTool free online tools, available in {Place}".
 * The honest way to express geo availability — the brand provides a global
 * web service; the Service's areaServed scopes it to the location entity.
 */
export function createGeoServiceJsonLd(slugOrLocation, { path } = {}) {
  const location =
    typeof slugOrLocation === "string" ? getGeoLocation(slugOrLocation) : slugOrLocation;
  if (!location) return null;

  const url = absoluteUrl(path || "/tools/all");

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${getSiteUrl()}/#service-${location.slug}`,
    name: `${siteConfig.name} — Free Online Tools in ${location.name}`,
    serviceType: "Free online software tools",
    description: `${siteConfig.name}'s free browser-based tools — converters, calculators, PDF, image, developer and AI utilities — available to users in ${location.name}. No installation, no sign-up.`,
    provider: { "@id": `${getSiteUrl()}/#organization` },
    areaServed: createAreaServedRef(location),
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: url,
      availableLanguage: ["en"],
    },
    // The Offer inherits the Service's areaServed; repeating the Place ref
    // here only duplicated the same geo assertion (and ~150 bytes) on all 141
    // prerendered pages.
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

/**
 * WebPage node for a dedicated geo landing page (future routes). Links the
 * page to the WebSite, the Organization (about) and the Place
 * (spatialCoverage) so the whole graph stays connected.
 */
export function createGeoWebPageJsonLd(slugOrLocation, { path, title, description } = {}) {
  const location =
    typeof slugOrLocation === "string" ? getGeoLocation(slugOrLocation) : slugOrLocation;
  if (!location || !path) return null;

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${absoluteUrl(path)}#webpage`,
    url: absoluteUrl(path),
    name: title || `${siteConfig.name} in ${location.name} — Free Online Tools`,
    description: description || buildGeoDescription(location),
    inLanguage: "en",
    isPartOf: { "@id": `${getSiteUrl()}/#website` },
    about: { "@id": `${getSiteUrl()}/#organization` },
    spatialCoverage: createAreaServedRef(location),
  };
}

/**
 * BreadcrumbList following the geographic containment chain.
 *
 * The hub step (`/locations`) is part of the trail: the geo page renders a
 * visible breadcrumb of Home / Locations / Country / … / self, and Google
 * requires the markup to match what the user sees. Omitting it made every one
 * of the 141 pages ship a BreadcrumbList that disagreed with its own page.
 */
export function createGeoBreadcrumbJsonLd(
  slugOrLocation,
  { basePath = "/locations", hubName = "Locations" } = {},
) {
  const location =
    typeof slugOrLocation === "string" ? getGeoLocation(slugOrLocation) : slugOrLocation;
  if (!location) return null;

  const chain = getGeoChain(location.slug).reverse(); // country → … → self
  const items = [
    { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
    { "@type": "ListItem", position: 2, name: hubName, item: absoluteUrl(basePath) },
    ...chain.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 3,
      name: entry.name,
      item: absoluteUrl(`${basePath}/${entry.slug}`),
    })),
  ];

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}

/**
 * Geo-scoped SoftwareApplication (for future /tools/{slug}-{geo} pages):
 * the tool entity stays canonical; only the Offer is geo-scoped.
 */
export function createGeoToolJsonLd({ slug, tool, location: locationInput, path } = {}) {
  const location =
    typeof locationInput === "string" ? getGeoLocation(locationInput) : locationInput;
  if (!slug || !tool || !location) return null;

  const url = absoluteUrl(path || `/tools/all/${slug}`);

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${url}#software`,
    name: `${tool.name || slug} — ${location.name}`,
    description: `${tool.description || ""} Available free in ${location.name}.`.trim(),
    url,
    applicationCategory: Array.isArray(tool.category) ? tool.category[0] : tool.category,
    operatingSystem: "Web",
    isAccessibleForFree: true,
    inLanguage: "en",
    publisher: { "@id": `${getSiteUrl()}/#organization` },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      areaServed: createAreaServedRef(location),
    },
  };
}

/**
 * Everything a dedicated geo landing page needs, in one call:
 *   const jsonLd = buildGeoJsonLdBundle("bhopal", { path: "/locations/bhopal" });
 *   <JsonLd id="geo-bhopal" data={jsonLd} />
 */
export function buildGeoJsonLdBundle(slugOrLocation, { path, title, description } = {}) {
  const location =
    typeof slugOrLocation === "string" ? getGeoLocation(slugOrLocation) : slugOrLocation;
  if (!location) return [];

  const chainPlaces = getGeoChain(location.slug).map((entry) => createPlaceJsonLd(entry));

  return [
    ...chainPlaces,
    createGeoServiceJsonLd(location, { path }),
    path ? createGeoWebPageJsonLd(location, { path, title, description }) : null,
    path ? createGeoBreadcrumbJsonLd(location) : null,
  ].filter(Boolean);
}

/**
 * Next.js Metadata for a geo landing page — unique title/description per
 * location, canonical, OG/Twitter, robots — all inherited from the central
 * createPageMetadata() generator. No duplication, no stuffing.
 */
export async function createGeoPageMetadata(slugOrLocation, overrides = {}) {
  const location =
    typeof slugOrLocation === "string" ? getGeoLocation(slugOrLocation) : slugOrLocation;
  // An unrecognised slug is a miss, not a location page. Preserve caller copy
  // and canonical hints, but never let an invented place become indexable.
  if (!location) return createPageMetadata({ ...overrides, noindex: true });

  return createPageMetadata({
    // Starts with the brand, so resolveDocumentTitle() treats it as absolute
    // and the root layout appends no " | AltFTool" suffix. Rendered length
    // across the full registry is 32-49 chars.
    title: overrides.title || `${siteConfig.name} ${location.name} — Free Online Tools`,
    description: overrides.description || buildGeoDescription(location),
    path: overrides.path || `/locations/${location.slug}`,
    keywords: [
      `${siteConfig.name} ${location.name}`,
      `online tools ${location.name}`,
      `free tools ${location.name}`,
      ...(overrides.keywords || []),
    ],
    ...overrides,
  });
}
