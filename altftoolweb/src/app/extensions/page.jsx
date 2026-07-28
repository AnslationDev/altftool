import Link from "next/link";
import ExtensionClient from "./ExtensionClient";
import JsonLd from "@/platform/seo/JsonLd";
import RouteDiscoveryBand from "@/platform/navigation/RouteDiscoveryBand";
import { getRouteHub } from "@/platform/navigation/routeHubs";
import { fetchAllExtensions, toListingExtension } from "./_data/extensionsSource";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";

// Catalog snapshot is read on the server so the grid, its links and the counts
// are in the initial HTML rather than appearing after a client Firestore read.
export const revalidate = 3600;

const extensionsRouteHub = getRouteHub("extensions");
const extensionsDescription =
  "Explore must-have Chrome extensions and browser add-ons on AltFTool. Find useful extensions for productivity, browsing, SEO, developer workflows, writing, games, and more.";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Best Chrome Extensions & Browser AddOns | AltFTool Extensions",
    description: extensionsDescription,
    path: "/extensions",
    image: "/extension/hero.jpg",
  });
}

export default async function Page() {
  const extensions = await fetchAllExtensions();
  const listingExtensions = extensions.map(toListingExtension);
  const categoryCount = new Set(extensions.map((item) => item.category).filter(Boolean)).size;

  return (
    <>
      <JsonLd
        id="extensions-schema"
        data={[
          createCollectionPageJsonLd({
            path: "/extensions",
            name: "AltFTool Extensions",
            description: extensionsDescription,
          }),
          createItemListJsonLd({
            path: "/extensions",
            name: "Chrome extensions listed on AltFTool",
            items: extensions.map((item) => ({
              name: item.name,
              path: `/extensions/${item.slug}`,
            })),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Extensions", path: "/extensions" },
          ]),
        ]}
      />
      <ExtensionClient
        initialExtensions={listingExtensions}
        extensionCount={extensions.length}
        categoryCount={categoryCount}
      />

      {extensions.length > 0 ? (
        <nav
          aria-labelledby="extensions-index-heading"
          className="section border-t border-[var(--border)] py-10"
        >
          <h2
            id="extensions-index-heading"
            className="text-xl font-bold text-[var(--foreground)] sm:text-2xl"
          >
            Every extension on AltFTool, A–Z
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-[var(--muted-foreground)]">
            {extensions.length} extensions across {categoryCount} categories. Each page links to the
            extension&apos;s official Chrome Web Store listing.
          </p>
          <ul className="mt-6 grid list-none grid-cols-1 gap-x-6 gap-y-2 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {extensions.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/extensions/${item.slug}`}
                  className="inline-flex min-h-9 items-center rounded-md text-sm text-[var(--muted-foreground)] underline-offset-4 transition-colors duration-150 hover:text-[var(--primary)] hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 motion-reduce:transition-none"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      <div className="extensions-route-band">
        <RouteDiscoveryBand {...extensionsRouteHub} />
      </div>
    </>
  );
}
