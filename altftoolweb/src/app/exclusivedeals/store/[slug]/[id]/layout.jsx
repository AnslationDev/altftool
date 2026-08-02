import dealData from "../../../(data)/db.json";
import JsonLd from "@/platform/seo/JsonLd";
import {
  absoluteUrl,
  createBreadcrumbJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { brandSlug, findBrandByUrlKey } from "@/app/exclusivedeals/lib/brandSlug";

export const revalidate = 3600;

const FIREBASE_API_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
  "AIzaSyAYKc0SBXyY3bfKLkmcCrPf-NsPF8p_Z50";
const FIREBASE_PROJECT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "altftool-bca36";
const BRANDS_COLLECTION_PATH = "projects/altftool/deals/data/brands";
const FIRESTORE_TIMEOUT_MS = 3500;

// BrandOffer.jsx (the page body this layout generates metadata for) reads
// its brand list live from this same Firestore collection, matched by
// slugified name — not from db.json, which only tracks brands as of the
// last content sync. Metadata must read the same source so it doesn't
// describe a different brand (or 404) than what the page actually renders.
function slugifyBrandName(text) {
  return text?.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");
}

function firestoreValueToJs(value) {
  if (!value) return undefined;
  if ("stringValue" in value) return value.stringValue;
  if ("arrayValue" in value) return (value.arrayValue.values || []).map(firestoreValueToJs);
  if ("mapValue" in value) {
    return Object.fromEntries(
      Object.entries(value.mapValue.fields || {}).map(([key, nested]) => [key, firestoreValueToJs(nested)]),
    );
  }
  return undefined;
}

async function fetchLiveBrand(id) {
  const url = new URL(
    `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${BRANDS_COLLECTION_PATH}`,
  );
  url.searchParams.set("key", FIREBASE_API_KEY);
  url.searchParams.set("pageSize", "300");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FIRESTORE_TIMEOUT_MS);

  try {
    const response = await fetch(url.toString(), { next: { revalidate }, signal: controller.signal });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) return null;
    const docs = (payload.documents || []).map((doc) => ({
      id: doc.name?.split("/").pop() || "",
      ...Object.fromEntries(
        Object.entries(doc.fields || {}).map(([key, value]) => [key, firestoreValueToJs(value)]),
      ),
    }));
    return docs.find((doc) => slugifyBrandName(doc.name) === slugifyBrandName(id)) || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function findStoreOfferFromDb(slug, id) {
  const category = (dealData.categories || []).find((item) => item.slug === slug);
  // Slug is canonical (see lib/brandSlug.js); numeric ids still resolve so
  // links made while the sitemap advertised ids do not start 404ing.
  const brand = findBrandByUrlKey(category, id);
  return { category, brand };
}

export async function generateMetadata({ params }) {
  const { slug, id } = await params;
  const { category, brand: dbBrand } = findStoreOfferFromDb(slug, id);
  const liveBrand = await fetchLiveBrand(id);
  const brand = liveBrand
    ? { brandName: liveBrand.name, about: liveBrand.about, imagedeal: liveBrand.logo }
    : dbBrand;

  if (!brand) {
    return {
      title: "Store Offer Not Found – AltFTool",
      robots: { index: false, follow: true },
    };
  }

  // Deliberately NOT brand.about: the sibling /exclusivedeals/[slug]/[id] page
  // for the same brand already uses that exact string, so both URL shapes were
  // shipping a byte-identical meta description (24 pairs of them). This page is
  // the store's offer list, so it describes that instead.
  const categoryName = category?.categoryName?.toLowerCase();
  return createPageMetadata({
    title: `${brand.brandName} Store Offer & Coupon Details`,
    description: categoryName
      ? `Coupon codes and deals for the ${brand.brandName} store on AltFTool. Browse current ${categoryName} offers and open the one you want to use.`
      : `Coupon codes and deals for the ${brand.brandName} store on AltFTool. Browse the current offers and open the one you want to use.`,
    path: `/exclusivedeals/store/${slug}/${brandSlug(brand.brandName || brand.name)}`,
    image: brand.imagedeal || brand.img || brand.brandLogo,
    keywords: [
      `${brand.brandName} store offer`,
      `${brand.brandName} coupon details`,
      category?.categoryName ? `${category.categoryName} deals` : "exclusive deals",
    ],
  });
}

export default async function ExclusiveStoreOfferLayout({ children, params }) {
  const { slug, id } = await params;
  const { brand: dbBrand } = findStoreOfferFromDb(slug, id);
  // Same live-first resolution generateMetadata uses, so the entity describes
  // the store the page body actually renders. The Firestore call is the cached
  // fetch above, not a second round trip.
  const liveBrand = await fetchLiveBrand(id);
  const brand = liveBrand
    ? { brandName: liveBrand.name, about: liveBrand.about }
    : dbBrand;

  if (!brand?.brandName) return children;

  const path = `/exclusivedeals/store/${slug}/${brandSlug(brand.brandName)}`;

  return (
    <>
      {/* Matches the sibling /exclusivedeals/[slug]/[id] entity: a catalog of
          this store's coupons and deals. No Offer/price/availability — the
          offers are codes and discount claims, not priced products. */}
      <JsonLd
        id={`exclusive-store-offer-schema-${slug}-${brandSlug(brand.brandName)}`}
        data={[
          {
            "@context": "https://schema.org",
            "@type": "OfferCatalog",
            "@id": `${absoluteUrl(path)}#offers`,
            name: `${brand.brandName} Coupon Codes & Deals`,
            description: brand.about,
            url: absoluteUrl(path),
          },
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Exclusive Deals", path: "/exclusivedeals" },
            { name: "Stores", path: "/exclusivedeals/store" },
            { name: brand.brandName, path },
          ]),
        ]}
      />
      {children}
    </>
  );
}
