import Link from "next/link";
import { ArrowRight } from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import {
  countCollectionSites,
  getCollectionSites,
} from "@altftool/core/rabbithole";
import { COLLECTIONS } from "@altftool/core/rabbithole/taxonomy";
import PageHeader from "../_components/PageHeader";
import SiteMark from "../_components/SiteMark";

const description =
  "Cross-sections of the directory built around a mood rather than a topic: ten minutes to kill, quiet tabs, sites that feel like magic, and things worth showing someone else.";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Collections — interesting websites sorted by mood",
    description,
    path: "/rabbithole/collections",
    keywords: [
      "website collections",
      "sites to visit when bored",
      "relaxing websites",
      "websites to kill time",
    ],
  });
}

export default function CollectionsPage() {
  const crumbs = [
    { name: "Rabbithole", path: "/rabbithole" },
    { name: "Collections", path: "/rabbithole/collections" },
  ];

  const collections = COLLECTIONS.map((collection) => ({
    collection,
    // `sites` is the capped preview; `total` is what the card must report.
    sites: getCollectionSites(collection.id),
    total: countCollectionSites(collection.id),
  }));

  return (
    <div className="bg-background">
      <JsonLd
        id="rabbithole-collections"
        data={[
          createBreadcrumbJsonLd([{ name: "Home", path: "/" }, ...crumbs]),
          createCollectionPageJsonLd({
            path: "/rabbithole/collections",
            name: "Rabbithole collections",
            description,
          }),
          createItemListJsonLd({
            path: "/rabbithole/collections",
            name: "Rabbithole collections",
            items: COLLECTIONS.map((collection) => ({
              name: collection.name,
              path: `/rabbithole/collections/${collection.id}`,
            })),
          }),
        ]}
      />

      <PageHeader
        crumbs={crumbs}
        eyebrow={`${COLLECTIONS.length} collections`}
        title="Sorted by the mood you are in"
        lede={description}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="rh-grid rh-grid--wide">
          {collections.map(({ collection, sites, total }) => (
            <article key={collection.id} className="rh-card p-5">
              <h2 className="text-lg font-semibold leading-tight text-foreground">
                <Link
                  href={`/rabbithole/collections/${collection.id}`}
                  className="rh-card__link"
                >
                  {collection.name}
                </Link>
              </h2>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                {collection.blurb}
              </p>

              <div className="mt-4 flex -space-x-2" aria-hidden="true">
                {sites.slice(0, 6).map((site) => (
                  <SiteMark
                    key={site.slug}
                    site={site}
                    size="sm"
                    className="ring-2 ring-[var(--card)]"
                  />
                ))}
              </div>

              <p className="mt-4 flex items-center gap-1 border-t border-border pt-3 text-sm font-medium text-primary">
                {total} sites
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
