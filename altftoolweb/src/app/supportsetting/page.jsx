import SupportClient from "./SupportClient";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";

// Shared by generateMetadata, the rendered h1 and the JSON-LD so the three can
// never drift apart.
const HEADING = "AltFTool Settings and Support";
const DESCRIPTION =
  "Access AltFTool settings and support. Manage your preferences, permissions, system options, and find help or troubleshooting guides for tools and features.";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Settings & Support – Manage Preferences | AltFTool",
    description: DESCRIPTION,
    path: "/supportsetting",
    keywords: ["AltFTool support", "settings", "help center", "troubleshooting"],
  });
}

export default function Page() {
  // CollectionPage + BreadcrumbList only. This URL is the hub over the
  // /supportsetting/{platform}/... guide pages, so CollectionPage is the type
  // that matches what it actually is.
  //
  // An ItemList of the setting categories was considered and dropped: a
  // category's URL is /supportsetting/{platform}/category/{id}, and the
  // platform is only known after client-side detection (data/platformDetect.js).
  // Publishing one would mean picking an OS arbitrarily and asserting a URL
  // this page never necessarily links to.
  //
  // No FAQPage either — components/FaqShortcuts.jsx renders four questions with
  // no answers, and only on the /supportsetting/help/faq subroute, not here.
  return (
    <>
      <JsonLd
        id="supportsetting-schema"
        data={[
          createCollectionPageJsonLd({
            path: "/supportsetting",
            name: HEADING,
            description: DESCRIPTION,
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Settings & Support", path: "/supportsetting" },
          ]),
        ]}
      />
      <h1 className="sr-only">{HEADING}</h1>
      <SupportClient />
    </>
  );
}
