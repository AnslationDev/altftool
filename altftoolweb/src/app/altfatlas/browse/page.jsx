import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import {
  getAtlasStats,
  getPopulatedCategories,
  LIVE_ENTRIES,
} from "@altftool/core/atlas";
import BrowseExplorer from "../_components/BrowseExplorer";
import { AtlasSection, Breadcrumbs } from "../_components/Shell";

export async function generateMetadata() {
  const stats = getAtlasStats();
  return createPageMetadata({
    title: `Browse all ${stats.live} useful websites`,
    description: `Search and filter every site in AltF Atlas by category, by what it costs you before it works, and by whether it processes your files on your own device. ${stats.open} need no sign-up at all.`,
    path: "/altfatlas/browse",
    keywords: [
      "useful websites list",
      "free web tools directory",
      "websites that need no signup",
      "browser based web apps",
    ],
  });
}

export default function AtlasBrowsePage() {
  const stats = getAtlasStats();
  const categories = getPopulatedCategories();

  /*
   * Trim the payload before it crosses the server/client boundary. Full
   * records carry `what`, `bestFor`, `limits` and `altf` — none of which the
   * card renders — and at 300 entries that is roughly a 4x difference in the
   * RSC payload for zero visible benefit.
   */
  const entries = LIVE_ENTRIES.map((entry) => ({
    slug: entry.slug,
    name: entry.name,
    domain: entry.domain,
    url: entry.url,
    tagline: entry.tagline,
    category: entry.category,
    access: entry.access,
    runtime: entry.runtime,
    status: entry.status,
    legacy: Boolean(entry.legacy),
    tags: entry.tags || [],
  }));

  return (
    <>
      <JsonLd
        id="altf-atlas-browse-schema"
        data={[
          createCollectionPageJsonLd({
            path: "/altfatlas/browse",
            name: "Browse AltF Atlas",
            description: `Every site in AltF Atlas, filterable by category, access level and whether it runs on your device.`,
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Atlas", path: "/altfatlas" },
            { name: "Browse", path: "/altfatlas/browse" },
          ]),
        ]}
      />

      <AtlasSection className="py-8 sm:py-10">
        <Breadcrumbs
          trail={[
            { name: "Atlas", path: "/altfatlas" },
            { name: "Browse all", path: "/altfatlas/browse" },
          ]}
        />

        <h1 className="mt-4 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Browse all {stats.live} sites
        </h1>
        <p className="mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
          Filter by category, by what a site costs you before it does anything,
          or by whether it processes your files in the browser instead of
          uploading them. {stats.open} of these need no account at all and{" "}
          {stats.onDevice} never send your file anywhere.
        </p>

        <div className="mt-8">
          <BrowseExplorer entries={entries} categories={categories} />
        </div>
      </AtlasSection>
    </>
  );
}
