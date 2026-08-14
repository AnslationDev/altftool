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
  countCollectionSites,
  getCollectionSites,
} from "@altftool/core/rabbithole";
import {
  COLLECTIONS,
  REVIEWED_ON,
  getCollection,
} from "@altftool/core/rabbithole/taxonomy";
import PageHeader from "../../_components/PageHeader";
import SectionHeading from "../../_components/SectionHeading";
import SiteCard from "../../_components/SiteCard";

export const dynamicParams = false;

export function generateStaticParams() {
  return COLLECTIONS.map((collection) => ({ slug: collection.id }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) {
    return createPageMetadata({
      title: "Collection not found",
      path: `/rabbithole/collections/${slug}`,
      noindex: true,
    });
  }

  const total = countCollectionSites(collection.id);

  return createPageMetadata({
    title: `${collection.name} — ${total} sites`,
    description: `${collection.blurb} ${collection.intro}`,
    path: `/rabbithole/collections/${collection.id}`,
    keywords: [
      collection.name.toLowerCase(),
      "interesting websites",
      "cool websites",
      "websites to kill time",
    ],
  });
}

export default async function CollectionDetailPage({ params }) {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) notFound();

  const sites = getCollectionSites(collection.id);
  // The page shows a capped slice; the count must be the real one.
  const total = countCollectionSites(collection.id);
  const path = `/rabbithole/collections/${collection.id}`;
  const others = COLLECTIONS.filter((item) => item.id !== collection.id);

  const crumbs = [
    { name: "Rabbithole", path: "/rabbithole" },
    { name: "Collections", path: "/rabbithole/collections" },
    { name: collection.name, path },
  ];

  return (
    <div className="bg-background">
      <JsonLd
        id={`rabbithole-collection-${collection.id}`}
        data={[
          createBreadcrumbJsonLd([{ name: "Home", path: "/" }, ...crumbs]),
          createCollectionPageJsonLd({
            path,
            name: `${collection.name} — ${total} sites`,
            description: collection.intro,
          }),
          createItemListJsonLd({
            path,
            name: collection.name,
            items: sites.map((site) => ({
              name: site.name,
              path: `/rabbithole/site/${site.slug}`,
            })),
          }),
        ]}
      />

      <PageHeader
        crumbs={crumbs}
        eyebrow="Collection"
        title={`${collection.name}: ${total} sites`}
        lede={`${collection.intro} ${
          sites.length < total
            ? `Showing ${sites.length} of ${total}.`
            : `All ${total} are below.`
        } Every entry was opened and written up by hand, and last checked on ${REVIEWED_ON.label}.`}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <h2 className="sr-only">Sites in this collection</h2>
        <div className="rh-grid">
          {sites.map((site) => (
            <SiteCard key={site.slug} site={site} />
          ))}
        </div>

        {sites.length < total ? (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            {collection.browse ? (
              <>
                This is a hand-picked slice.{" "}
                <Link
                  href={`/rabbithole/browse${collection.browse}`}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  See all {total} on the browse page
                </Link>
                .
              </>
            ) : (
              `This is a hand-picked slice of the ${total} that match.`
            )}
          </p>
        ) : null}

        <section className="mt-16 border-t border-border pt-10">
          <SectionHeading
            eyebrow="Different mood"
            title="Other collections"
            href="/rabbithole/collections"
            linkLabel="All collections"
          />
          <ul className="flex flex-wrap gap-2">
            {others.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/rabbithole/collections/${item.id}`}
                  className="rh-chip transition hover:border-primary hover:text-foreground"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
