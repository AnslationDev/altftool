/**
 * AltF Bazaar — shared JSON-LD builders.
 *
 * The platform helper (`@/platform/seo/generateMetadata`) covers the schema
 * types the rest of the site needs: BreadcrumbList, CollectionPage, ItemList,
 * FAQPage, Article, Person. It has no `createProductJsonLd`, because Bazaar is
 * the only vertical that sells anything — so the Product/Offer graph lives
 * here, next to the data it describes, rather than being hand-rolled inside a
 * page component.
 *
 * Everything in this module is server-safe, synchronous and deterministic: no
 * `Date.now()`, no `Math.random()`, no network. The same listing produces the
 * same node on every build, which is what `force-static` + `revalidate`
 * require.
 *
 * ── On SearchAction ──────────────────────────────────────────────────────
 * There is deliberately **no** `createBazaarSearchActionJsonLd()` here.
 * `createWebsiteJsonLd()` in the platform helper already emits the site-wide
 * WebSite node (`@id: <site>/#website`, rendered once from `src/app/layout.jsx`)
 * carrying a `potentialAction` SearchAction in Google's documented
 * EntryPoint/urlTemplate form, targeting `<site>/search?q={search_term_string}`.
 * A second SearchAction pointing at `/bazaar/search` would either collide on
 * that same `@id` (two WebSite nodes, two conflicting potentialActions — Google
 * picks one, arbitrarily) or invent a second WebSite entity for a sub-section
 * of the same site. Neither is worth a sitelinks search box that Google only
 * ever grants to the site root anyway. If Bazaar ever becomes its own
 * hostname, that is the moment to give it its own WebSite node.
 */

import {
  absoluteUrl,
  createBreadcrumbJsonLd,
} from "@/platform/seo/generateMetadata";

import { getCategoryAttribute } from "./categories";
import { formatPosted } from "./listings";
import { getMarket } from "./market";

/* ------------------------------------------------------------------
 * Internals
 * ---------------------------------------------------------------- */

/**
 * Drop keys whose value is `undefined`, `null` or `""`.
 *
 * This is not cosmetic. `JSON.stringify` silently deletes `undefined` values,
 * so a typo'd field disappears without a trace — but a node that was *supposed*
 * to carry `price` and does not is an invalid Offer that Google rejects
 * wholesale. Building through this helper means an omission is a deliberate
 * omission, and anything required is asserted by the caller before it gets
 * here. `0` and `false` are kept: a ₹0 giveaway is a real price.
 */
function compact(node) {
  const out = {};
  for (const [key, value] of Object.entries(node)) {
    if (value === undefined || value === null || value === "") continue;
    out[key] = value;
  }
  return out;
}

/** schema.org OfferItemCondition for the taxonomy's five condition values. */
const CONDITION_SCHEMA = {
  New: "https://schema.org/NewCondition",
  "Like new": "https://schema.org/UsedCondition",
  Good: "https://schema.org/UsedCondition",
  Fair: "https://schema.org/UsedCondition",
  "For parts": "https://schema.org/DamagedCondition",
};

/**
 * Attribute keys that already have a first-class home in the Product/Offer
 * graph, so they must not be repeated as a generic `additionalProperty`.
 */
const PROMOTED_ATTRIBUTES = new Set(["brand", "condition"]);

function attributeValueToText(key, value, attribute) {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") {
    // A model year is a label, not a quantity — "2,018" would be nonsense.
    if (key === "year") return String(value);
    const market = getMarket();
    const formatted = value.toLocaleString(market.numberLocale);
    if (!attribute?.unit) return formatted;
    // The currency is the one unit that may lead rather than trail; which
    // side it takes is the market's `currencyDisplay`.
    if (attribute.unit !== market.currencySymbol) return `${formatted} ${attribute.unit}`;
    return market.currencyDisplay === "symbol-first"
      ? `${market.currencySymbol}${formatted}`
      : `${formatted}${market.currencySymbol}`;
  }
  return String(value);
}

/** Fallback label for a key the taxonomy never declared. */
function humanizeKey(key) {
  const spaced = String(key)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/* ------------------------------------------------------------------
 * Public builders
 * ---------------------------------------------------------------- */

/** Canonical path for a listing. One definition, used by every builder here. */
export function listingPath(listing) {
  return `/bazaar/item/${listing.slug}`;
}

/**
 * The one-sentence summary of a listing.
 *
 * Shared on purpose: the meta description and the Product node's
 * `description` must say the same thing, or the structured data describes a
 * page that does not exist. Recency comes from `formatPosted(postedDaysAgo)`,
 * never from a clock.
 */
export function describeListing(listing) {
  if (!listing) return "";
  const condition = listing.attributes?.condition;
  const head = [
    listing.priceLabel,
    condition ? `${condition} condition` : null,
    listing.subcategoryName,
  ]
    .filter(Boolean)
    .join(" · ");

  return `${head} in ${listing.locality}, ${listing.cityName}, ${listing.stateName}. Posted ${formatPosted(
    listing.postedDaysAgo,
  ).toLowerCase()} on AltF Bazaar.`;
}

/** Shorten a title for a breadcrumb leaf without breaking mid-word ugliness. */
export function truncateTitle(value, max = 48) {
  const text = String(value || "");
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

/**
 * The breadcrumb trail for a listing, as plain data.
 *
 * Returned rather than rendered so the detail page can feed the identical
 * array to both `<Breadcrumbs>` and `createBreadcrumbJsonLd()` — the visible
 * trail and the structured one cannot drift apart if there is only one array.
 */
export function buildListingCrumbs(listing) {
  return [
    { name: "Home", path: "/" },
    { name: "AltF Bazaar", path: "/bazaar" },
    { name: listing.categoryName, path: `/bazaar/c/${listing.categorySlug}` },
    {
      name: listing.subcategoryName,
      path: `/bazaar/c/${listing.categorySlug}/${listing.subcategorySlug}`,
    },
    { name: truncateTitle(listing.title), path: listingPath(listing) },
  ];
}

/** BreadcrumbList node for a listing. Thin wrapper, kept for symmetry. */
export function createListingBreadcrumbJsonLd(listing) {
  if (!listing) return null;
  return createBreadcrumbJsonLd(buildListingCrumbs(listing));
}

/**
 * Seller node — `Organization` for a business, `Person` for an individual.
 *
 * Only facts the corpus actually holds are emitted. In particular there is no
 * `aggregateRating` here even though sellers carry a `rating`: those numbers
 * are generated, and a fabricated rating in structured data is the fastest
 * route to a manual action. Wire it in when real reviews exist.
 */
export function createSellerNodeJsonLd(seller) {
  if (!seller) return null;
  return compact({
    "@type": seller.type === "business" ? "Organization" : "Person",
    "@id": `${absoluteUrl(`/bazaar/seller/${seller.slug}`)}#seller`,
    name: seller.name,
    url: absoluteUrl(`/bazaar/seller/${seller.slug}`),
    ...(seller.cityName
      ? { areaServed: { "@type": "City", name: seller.cityName } }
      : {}),
  });
}

/**
 * Product + Offer for one listing.
 *
 * @param {object} listing  a FULL listing record — `getListing(slug)` or
 *   `getListings()`. A `toCardListing()` projection has no `description` and
 *   only `images[0]`, so passing one produces a thinner (still valid) node.
 * @param {object} [seller] `getSeller(listing.sellerId)`
 * @returns {object|null}
 *
 * Notes on the fields that are deliberately absent:
 *
 * - **`priceValidUntil`** — omitted. The corpus stores recency as the relative
 *   integer `postedDaysAgo` and holds no absolute date anywhere, so any expiry
 *   would have to be derived from a clock. That breaks determinism (the
 *   prerendered HTML and a later client render would disagree) and it would be
 *   a made-up date besides: nothing in this marketplace expires. Google treats
 *   the field as optional for used goods; an invented one is worse than none.
 * - **`aggregateRating` / `review`** — omitted, see `createSellerNodeJsonLd`.
 * - **`gtin` / `mpn`** — second-hand goods listed by individuals do not have
 *   them, and `sku` (the listing id) is the honest identifier.
 */
export function createListingProductJsonLd(listing, seller) {
  if (!listing) return null;

  const path = listingPath(listing);
  const url = absoluteUrl(path);
  const productId = `${url}#product`;
  const itemCondition = CONDITION_SCHEMA[listing.attributes?.condition] || undefined;

  const images = (listing.images || [])
    .map((image) => image?.src)
    .filter(Boolean);

  // Every declared attribute the graph does not already model, labelled from
  // the taxonomy so "kmDriven" reads as "Kilometres driven".
  const additionalProperty = Object.entries(listing.attributes || {})
    .filter(([key, value]) => !PROMOTED_ATTRIBUTES.has(key) && value !== undefined && value !== null && value !== "")
    .map(([key, value]) => {
      const attribute = getCategoryAttribute(listing.categorySlug, key);
      return {
        "@type": "PropertyValue",
        name: attribute?.label || humanizeKey(key),
        value: attributeValueToText(key, value, attribute),
      };
    });

  // A listing with a `pricePeriod` ("per month", "per day") is a hire, not a
  // sale. GoodRelations business functions are the vocabulary schema.org
  // inherited for exactly this distinction.
  const businessFunction = listing.pricePeriod
    ? "http://purl.org/goodrelations/v1#LeaseOut"
    : "http://purl.org/goodrelations/v1#Sell";

  const offer = compact({
    "@type": "Offer",
    "@id": `${url}#offer`,
    url,
    // `price` must be a number and must never be undefined — an Offer without
    // it is discarded whole. `0` is legitimate (the Free & Giveaway category).
    price: typeof listing.price === "number" ? listing.price : 0,
    priceCurrency: "INR",
    availability: "https://schema.org/InStock",
    businessFunction,
    itemCondition,
    // Explicit back-reference: the Offer is for this Product, and nothing else.
    itemOffered: { "@id": productId },
    areaServed: compact({
      "@type": "City",
      name: listing.cityName,
      ...(listing.stateName
        ? { containedInPlace: { "@type": "State", name: listing.stateName } }
        : {}),
    }),
    seller: createSellerNodeJsonLd(seller) || undefined,
  });

  return compact({
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": productId,
    name: listing.title,
    description: describeListing(listing),
    url,
    sku: listing.id,
    category: `${listing.categoryName} > ${listing.subcategoryName}`,
    image: images.length ? images : undefined,
    brand: listing.attributes?.brand
      ? { "@type": "Brand", name: listing.attributes.brand }
      : undefined,
    itemCondition,
    additionalProperty: additionalProperty.length ? additionalProperty : undefined,
    // Closes the entity chain the rest of the site follows (see
    // docs/SEO_GEO_ENTITY_ARCHITECTURE.md §2.3): every node points at the page
    // it describes, so Google reads one graph rather than orphan fragments.
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    offers: offer,
  });
}
