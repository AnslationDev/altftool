import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import {
  COLLECTION_BY_SLUG,
  COLLECTION_SLUGS,
  COLLECTIONS,
} from "@altftool/core/atlas/taxonomy";
import { entriesInCollection, getFacetCounts } from "@altftool/core/atlas";
import { SiteGrid } from "../../_components/SiteCard";
import {
  AnswerBlock,
  AtlasSection,
  Breadcrumbs,
} from "../../_components/Shell";

export const dynamicParams = false;

export function generateStaticParams() {
  return COLLECTION_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const collection = COLLECTION_BY_SLUG[slug];
  if (!collection) return createPageMetadata({ title: "Collection not found" });

  const entries = entriesInCollection(slug);

  return createPageMetadata({
    title: `${collection.name} — ${entries.length} picks`,
    description: `${collection.tagline} ${collection.intro}`,
    path: `/altfatlas/collections/${slug}`,
    keywords: [
      collection.name.toLowerCase(),
      "useful websites",
      "free web tools",
    ],
  });
}

export default async function AtlasCollectionPage({ params }) {
  const { slug } = await params;
  const collection = COLLECTION_BY_SLUG[slug];
  if (!collection) notFound();

  const entries = entriesInCollection(slug);
  const facets = getFacetCounts();
  const siblings = COLLECTIONS.filter((item) => item.slug !== slug)
    .map((item) => ({ ...item, count: facets.collection[item.slug] || 0 }))
    .filter((item) => item.count > 0)
    .slice(0, 6);

  return (
    <>
      <JsonLd
        id={`altf-atlas-collection-${slug}-schema`}
        data={[
          createCollectionPageJsonLd({
            path: `/altfatlas/collections/${slug}`,
            name: collection.name,
            description: collection.tagline,
          }),
          createItemListJsonLd({
            path: `/altfatlas/collections/${slug}`,
            name: collection.name,
            items: entries.map((entry) => ({
              name: entry.name,
              path: `/altfatlas/site/${entry.slug}`,
            })),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Atlas", path: "/altfatlas" },
            { name: "Collections", path: "/altfatlas/collections" },
            { name: collection.name, path: `/altfatlas/collections/${slug}` },
          ]),
        ]}
      />

      <AtlasSection className="py-8 sm:py-10">
        <Breadcrumbs
          trail={[
            { name: "Atlas", path: "/altfatlas" },
            { name: "Collections", path: "/altfatlas/collections" },
            { name: collection.name, path: `/altfatlas/collections/${slug}` },
          ]}
        />

        <h1 className="mt-4 max-w-3xl text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {collection.name}
        </h1>
        <p className="mt-2 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground">
          {collection.tagline}
        </p>

        <div className="mt-6 max-w-3xl">
          <AnswerBlock>{collection.intro}</AnswerBlock>
        </div>

        <p className="afa-figure mt-6 border-y border-border py-3 text-sm text-muted-foreground">
          <strong className="font-semibold text-foreground">
            {entries.length}
          </strong>{" "}
          sites in this collection
        </p>

        <div className="mt-8">
          <SiteGrid
            entries={entries}
            empty={{
              title: "This collection is still being assembled",
              body: "No entries have been added to it yet. Browse the full directory in the meantime.",
            }}
          />
        </div>

        {siblings.length ? (
          <div className="mt-12 border-t border-border pt-8">
            <p className="afa-eyebrow">Other collections</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {siblings.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/altfatlas/collections/${item.slug}`}
                    prefetch={false}
                    className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-border-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {item.name}
                    <span className="afa-figure">{item.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </AtlasSection>
    </>
  );
}
