import AppsListingClient from "./components/AppsListingClient";
import { apps } from "./data/apps";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";

const appsDescription =
  "Browse and download official AltFTool Android APKs for speed testing, storage cleanup, grammar help, PDF OCR scanning, and mobile productivity.";

export async function generateMetadata() {
  return createPageMetadata({
  title: "Android Apps - Download Official APKs",
  description: appsDescription,
  path: "/apps",
  keywords: ["Android apps", "APK downloads", "mobile apps", "AltFTool apps"],
});
}

export default async function AppsPage({ searchParams }) {
  const params = await searchParams;
  const searchQuery = typeof params?.q === "string" ? params.q : "";

  return (
    <>
      <JsonLd
        id="apps-collection-schema"
        data={[
          createCollectionPageJsonLd({
            path: "/apps",
            name: "AltFTool Android Apps",
            description: appsDescription,
          }),
          createItemListJsonLd({
            path: "/apps",
            name: "AltFTool mobile app collection",
            items: apps.map((app) => ({
              name: app.name,
              path: `/apps/${app.slug}`,
            })),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Apps", path: "/apps" },
          ]),
        ]}
      />
      <AppsListingClient apps={apps} searchQuery={searchQuery} />
    </>
  );
}
