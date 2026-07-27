/**
 * Server-side resolver for the /brandrating/[slug]/[category](/[pdetail]) routes.
 *
 * WHY THIS EXISTS
 * The brand catalogue lives in Firestore (consumerrating/data/*) and until now
 * was only ever read on the CLIENT (../service/service.js). The route files had
 * no data at all, so they answered every URL shape with 200 + index,follow and
 * a title built out of the raw path segment — /brandrating/<anything>/<anything>
 * minted an indexable "Best Brands & Ratings" page for a category that does not
 * exist, and the extra /<anything> level did the same for brands. That is an
 * unbounded doorway space, which is assessed site-wide.
 *
 * This module reads the same public Firestore REST collections that
 * src/app/sitemap.js reads, so the routes accept exactly the URLs the sitemap
 * advertises, plus the legacy link shapes the UI still emits
 * (/brandrating/categories/…, /brandrating/subcategories/…, …/pdetail/…), which
 * are accepted but canonicalised onto the sitemap URL instead of duplicating it.
 *
 * AVAILABILITY RULE
 * If the catalogue cannot be read (network error, timeout, non-200), the
 * resolvers return status "unavailable": callers render the page (the client
 * still hydrates from Firestore) but mark it noindex. An outage must never 404
 * real brand pages, and must never mint indexable ones either.
 */

import { cache } from "react";

import { normalizeSlug } from "@/platform/seo/generateMetadata";
import {
  MOCK_BRANDS,
  MOCK_DATA_ENABLED,
  MOCK_HIDDEN_BRAND_NAMES,
} from "../(data)/mockBrands";

// Same public web-API credentials and collection root the sitemap and the
// client Firestore SDK use (service/config.js ROOT).
const FIREBASE_API_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
  "AIzaSyAYKc0SBXyY3bfKLkmcCrPf-NsPF8p_Z50";
const FIREBASE_PROJECT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "altftool-bca36";
const CATALOG_ROOT = "projects/altftool/consumerrating/data";
const LIST_TIMEOUT_MS = 3500;
const CATALOG_REVALIDATE = 3600;

// First/second path segments the UI hard-codes in its own links. They are not
// category slugs, so they must be accepted, but they never become canonical.
const LEGACY_PATH_SEGMENTS = new Set(["categories", "subcategories", "pdetail"]);

// service.js only hides these while the mock layer is on, so mirror that switch
// exactly — the guard must accept every brand the UI actually renders.
const HIDDEN_BRAND_SLUGS = new Set(
  MOCK_DATA_ENABLED ? MOCK_HIDDEN_BRAND_NAMES.map((name) => normalizeSlug(name)) : [],
);

const UNAVAILABLE_CATALOG = Object.freeze({
  available: false,
  categorySlugs: new Set(),
  subcategories: new Map(),
  brands: new Map(),
});

function collectionUrl(name) {
  const url = new URL(
    `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${CATALOG_ROOT}/${name}`,
  );
  url.searchParams.set("key", FIREBASE_API_KEY);
  url.searchParams.set("pageSize", "300");
  return url.toString();
}

function readString(field) {
  return typeof field?.stringValue === "string" ? field.stringValue.trim() : "";
}

/**
 * @returns {Array|null} decoded docs, or null when the collection could not be
 * read (which includes an empty response — treated as "unknown", not "empty").
 */
async function listDocs(name) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), LIST_TIMEOUT_MS);

  try {
    const response = await fetch(collectionUrl(name), {
      next: { revalidate: CATALOG_REVALIDATE },
      signal: controller.signal,
    });
    if (!response.ok) return null;

    const payload = await response.json().catch(() => null);
    const documents = payload?.documents;
    if (!Array.isArray(documents) || !documents.length) return null;

    return documents.map((document) => ({
      id: document.name?.split("/").pop() || "",
      name:
        readString(document.fields?.name) ||
        readString(document.fields?.category),
      status: readString(document.fields?.status).toLowerCase(),
      categoryId: readString(document.fields?.categoryId),
      subCategoryId:
        readString(document.fields?.subCategoryId) ||
        readString(document.fields?.subcategoryId),
    }));
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Live category/subcategory/brand slug sets. `cache()` keeps it to one read per
 * request (generateMetadata + the page component share it); the fetch itself is
 * revalidated hourly in the Next data cache.
 */
export const getBrandCatalog = cache(async () => {
  const [categoryDocs, subcategoryDocs, brandDocs] = await Promise.all([
    listDocs("categories"),
    listDocs("subcategories"),
    listDocs("brands"),
  ]);

  if (!categoryDocs || !subcategoryDocs || !brandDocs) {
    return UNAVAILABLE_CATALOG;
  }

  // service.js#subscribeMerged only renders active categories/subcategories, so
  // an inactive one has no page — matching it here would resurrect the doorway.
  const categoryById = new Map(
    categoryDocs
      .filter((doc) => doc.id && doc.name && doc.status === "active")
      .map((doc) => [doc.id, doc]),
  );

  const categorySlugs = new Set(
    [...categoryById.values()].map((doc) => normalizeSlug(doc.name)),
  );

  const subcategoryById = new Map();
  const subcategories = new Map();

  for (const doc of subcategoryDocs) {
    if (!doc.id || !doc.name || doc.status !== "active") continue;
    const parent = categoryById.get(doc.categoryId);
    if (!parent) continue;

    const slug = normalizeSlug(doc.name);
    const categorySlug = normalizeSlug(parent.name);
    if (!slug || !categorySlug) continue;

    const entry = {
      id: doc.id,
      name: doc.name,
      slug,
      categoryName: parent.name,
      categorySlug,
      canonicalPath: `/brandrating/${categorySlug}/${slug}`,
    };

    subcategoryById.set(doc.id, entry);
    if (!subcategories.has(slug)) subcategories.set(slug, entry);
  }

  const brands = new Map();

  // Mock brands render as real pages until the admin panel replaces them
  // (see (data)/mockBrands.js), so their URLs must keep resolving.
  const allBrandDocs = MOCK_DATA_ENABLED
    ? [...brandDocs, ...MOCK_BRANDS.map((brand) => ({
        id: brand.id || "",
        name: String(brand.name || "").trim(),
        status: "active",
        categoryId: brand.categoryId || "",
        subCategoryId: brand.subCategoryId || "",
      }))]
    : brandDocs;

  for (const doc of allBrandDocs) {
    const slug = normalizeSlug(doc.name);
    // Brands the UI hides have no page either.
    if (!slug || HIDDEN_BRAND_SLUGS.has(slug) || brands.has(slug)) continue;

    // A brand without a live subcategory has no canonical URL — the sitemap
    // skips it for the same reason.
    const subcategory = subcategoryById.get(doc.subCategoryId);
    if (!subcategory) continue;

    brands.set(slug, {
      name: doc.name,
      slug,
      categorySlug: subcategory.categorySlug,
      subcategorySlug: subcategory.slug,
      subcategoryName: subcategory.name,
      canonicalPath: `/brandrating/${subcategory.categorySlug}/${subcategory.slug}/${slug}`,
    });
  }

  return { available: true, categorySlugs, subcategories, brands };
});

/**
 * A path segment that is allowed to sit in front of the entity segment: a real
 * category slug, a real subcategory slug, or one of the hard-coded link words.
 * Anything else is a made-up prefix and gets a 404.
 */
function isKnownPrefixSegment(catalog, segment) {
  const slug = normalizeSlug(segment);
  if (!slug) return false;
  return (
    LEGACY_PATH_SEGMENTS.has(slug) ||
    catalog.categorySlugs.has(slug) ||
    catalog.subcategories.has(slug)
  );
}

/**
 * @returns {{status: "ok"|"missing"|"unavailable", subcategory: object|null}}
 */
export async function resolveBrandCategoryRoute({ slug, category }) {
  const catalog = await getBrandCatalog();
  if (!catalog.available) return { status: "unavailable", subcategory: null };

  const subcategory = catalog.subcategories.get(normalizeSlug(category));
  if (!subcategory || !isKnownPrefixSegment(catalog, slug)) {
    return { status: "missing", subcategory: null };
  }

  return { status: "ok", subcategory };
}

/**
 * @returns {{status: "ok"|"missing"|"unavailable", brand: object|null}}
 */
export async function resolveBrandDetailRoute({ slug, category, pdetail }) {
  const catalog = await getBrandCatalog();
  if (!catalog.available) return { status: "unavailable", brand: null };

  const brand = catalog.brands.get(normalizeSlug(pdetail));
  if (
    !brand ||
    !isKnownPrefixSegment(catalog, slug) ||
    !isKnownPrefixSegment(catalog, category)
  ) {
    return { status: "missing", brand: null };
  }

  return { status: "ok", brand };
}
