import PageView from "./PageView";
import JsonLd from "@/platform/seo/JsonLd";
import {
  absoluteUrl,
  createBreadcrumbJsonLd,
  getSiteUrl,
} from "@/platform/seo/generateMetadata";
import { getExtensionRecord } from "./extensionRecord";

// No generateMetadata here on purpose. layout.jsx already resolves the
// extension from Firestore and builds real per-extension metadata — title,
// description, OG image and keywords. Next takes the deepest segment's
// metadata, so the hardcoded version that used to live here overrode all of
// it, and every one of the 57 /extensions/<slug> URLs shipped the identical
// title "Chrome Extension Details & Features | AltFTool Extensions". The
// layout's work was written, correct, and entirely dead.

/**
 * SoftwareApplication node for one extension.
 *
 * Only fields the Firestore record actually carries are emitted. The record has
 * a `rating` but no rating/review count anywhere, and the hero's "(4.9/5
 * overall)" is static decoration, so there is deliberately no aggregateRating —
 * likewise no softwareVersion, author or permissions, whose sidebar rows are
 * hardcoded placeholders rather than data. The free Offer mirrors the page's
 * own "Free forever, no registration required" claim.
 */
function createExtensionJsonLd(extension, path) {
  if (!extension?.name) return null;

  const url = absoluteUrl(path);
  const features = Array.isArray(extension.features)
    ? extension.features.filter((feature) => typeof feature === "string" && feature)
    : [];

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${url}#software`,
    name: extension.name,
    description: extension.description,
    url,
    image: extension.image ? absoluteUrl(extension.image) : undefined,
    applicationCategory: "BrowserApplication",
    applicationSubCategory: extension.category || undefined,
    operatingSystem: "Chrome",
    browserRequirements: "Requires Google Chrome or another Chromium-based browser",
    installUrl: extension.chromeUrl || undefined,
    featureList: features.length ? features : undefined,
    // The sidebar renders this same value in its "Updated" row.
    dateModified: typeof extension.updatedAt === "string" ? extension.updatedAt : undefined,
    isAccessibleForFree: true,
    inLanguage: "en",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    publisher: {
      "@id": `${getSiteUrl()}/#organization`,
    },
    isPartOf: {
      "@id": `${getSiteUrl()}/#website`,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };
}

export default async function Page(props) {
  const { slug } = await props.params;

  // The detail view is a client component that reads Firestore after
  // hydration, so the server HTML described nothing at all — an extension page
  // shipped only the layout's Organization and WebSite. Resolve the same cached
  // record the layout's metadata uses and describe the extension itself.
  let extension = null;
  try {
    extension = await getExtensionRecord(slug);
  } catch {
    // Same rule as the layout's catch branch: a Firestore outage must not
    // change what the page renders. Ship no schema and let the client view
    // retry as it does today.
    extension = null;
  }

  // A missing record means PageView calls notFound(); nothing to describe.
  const path = extension ? `/extensions/${extension.slug || slug}` : null;

  return (
    <>
      {extension ? (
        <JsonLd
          id={`extension-schema-${slug}`}
          data={[
            createExtensionJsonLd(extension, path),
            createBreadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Extensions", path: "/extensions" },
              { name: extension.name, path },
            ]),
          ]}
        />
      ) : null}
      <PageView {...props} />
    </>
  );
}
