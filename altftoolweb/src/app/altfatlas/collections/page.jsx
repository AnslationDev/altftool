import Link from "next/link";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { COLLECTIONS } from "@altftool/core/atlas/taxonomy";
import { getFacetCounts } from "@altftool/core/atlas";
import { AtlasSection, Breadcrumbs } from "../_components/Shell";

const description =
  "Hand-picked stacks from AltF Atlas — ten tabs instead of paid software, tools where nothing leaves your device, the student starter kit, the freelancer's first day, and the classics that survived.";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Curated collections of useful websites",
    description,
    path: "/altfatlas/collections",
    keywords: [
      "best website collections",
      "free software alternatives",
      "web app starter kit",
      "useful websites for students",
    ],
  });
}

export default function AtlasCollectionsPage() {
  const facets = getFacetCounts();
  const collections = COLLECTIONS.map((collection) => ({
    ...collection,
    count: facets.collection[collection.slug] || 0,
  })).filter((collection) => collection.count > 0);

  return (
    <>
      <JsonLd
        id="altf-atlas-collections-schema"
        data={[
          createCollectionPageJsonLd({
            path: "/altfatlas/collections",
            name: "AltF Atlas collections",
            description,
          }),
          createItemListJsonLd({
            path: "/altfatlas/collections",
            name: "AltF Atlas collections",
            items: collections.map((collection) => ({
              name: collection.name,
              path: `/altfatlas/collections/${collection.slug}`,
            })),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Atlas", path: "/altfatlas" },
            { name: "Collections", path: "/altfatlas/collections" },
          ]),
        ]}
      />

      <AtlasSection className="py-8 sm:py-10">
        <Breadcrumbs
          trail={[
            { name: "Atlas", path: "/altfatlas" },
            { name: "Collections", path: "/altfatlas/collections" },
          ]}
        />

        <h1 className="mt-4 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Collections
        </h1>
        <p className="mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
          Categories are exhaustive; collections are opinionated. Each of these
          is a capped shortlist assembled around a situation rather than a kind
          of software — the value of a shortlist is what it leaves out.
        </p>

        <ul className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {collections.map((collection) => (
            <li key={collection.slug} className="min-w-0">
              <Link
                href={`/altfatlas/collections/${collection.slug}`}
                prefetch={false}
                className="afa-card flex h-full flex-col rounded-lg border border-border p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span className="afa-figure text-xs text-muted-foreground">
                  {collection.count} sites
                </span>
                <span className="mt-2 text-base font-semibold text-foreground">
                  {collection.name}
                </span>
                <span className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {collection.tagline}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </AtlasSection>
    </>
  );
}
