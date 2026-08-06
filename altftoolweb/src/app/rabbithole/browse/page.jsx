import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { SITES, STATS } from "@altftool/core/rabbithole";
import { CATEGORIES } from "@altftool/core/rabbithole/taxonomy";
import BrowseExplorer from "../_components/BrowseExplorer";
import PageHeader from "../_components/PageHeader";
import { toBrowseProjection } from "../_lib/projection";

const description =
  "Filter the whole Rabbithole directory by category, how long a site takes to pay off, and the mood you are in. Every entry is checked by hand and links straight out.";

export async function generateMetadata() {
  return createPageMetadata({
    title: `Browse all ${STATS.total} interesting websites`,
    description,
    path: "/rabbithole/browse",
    keywords: [
      "browse interesting websites",
      "cool websites directory",
      "random website generator",
      "websites to visit when bored",
      "fun websites list",
    ],
  });
}

export default function BrowsePage() {
  const crumbs = [
    { name: "Rabbithole", path: "/rabbithole" },
    { name: "Browse", path: "/rabbithole/browse" },
  ];

  return (
    <div className="bg-background">
      <JsonLd
        id="rabbithole-browse"
        data={[
          createBreadcrumbJsonLd([{ name: "Home", path: "/" }, ...crumbs]),
          createCollectionPageJsonLd({
            path: "/rabbithole/browse",
            name: `All ${STATS.total} sites in AltF Rabbithole`,
            description,
          }),
        ]}
      />

      <PageHeader
        crumbs={crumbs}
        eyebrow={`${STATS.total} sites · ${CATEGORIES.length} categories`}
        title="Browse the whole directory"
        lede={description}
      />

      {/* No Suspense boundary here on purpose. The explorer adopts its filter
          state from window.location after mount rather than through
          useSearchParams, which keeps the first 48 cards in the static HTML
          where crawlers that do not execute JavaScript can read them. */}
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-4 sm:px-6">
        <BrowseExplorer sites={toBrowseProjection(SITES)} />
      </div>
    </div>
  );
}
