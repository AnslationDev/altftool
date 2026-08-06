import { notFound } from "next/navigation";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { COLLECTIONS, getCollection } from "@altftool/core/detour/taxonomy";
import { getSitesByCollection } from "@altftool/core/detour";
import SiteListing from "../../_components/SiteListing";

export const revalidate = 86400;

export function generateStaticParams() {
  return COLLECTIONS.map((collection) => ({ slug: collection.id }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) {
    return createPageMetadata({
      title: "Not found",
      path: `/detour/collections/${slug}`,
      noindex: true,
    });
  }

  const count = getSitesByCollection(collection.id).length;

  return createPageMetadata({
    title: `${collection.name} — ${count} sites`,
    description: collection.metaDescription,
    path: `/detour/collections/${collection.id}`,
    keywords: [collection.name, "curated websites", "website collection"],
  });
}

export default async function CollectionPage({ params, searchParams }) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const collection = getCollection(slug);
  if (!collection) notFound();

  const sites = getSitesByCollection(collection.id);
  const path = `/detour/collections/${collection.id}`;

  const breadcrumb = createBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Detour", path: "/detour" },
    { name: "Collections", path: "/detour/collections" },
    { name: collection.name, path },
  ]);

  const collectionPage = createCollectionPageJsonLd({
    path,
    name: collection.name,
    description: collection.metaDescription,
  });

  const itemList = createItemListJsonLd({
    path,
    name: collection.name,
    items: sites.slice(0, 48).map((site) => ({
      name: site.name,
      path: `/detour/site/${site.slug}`,
    })),
  });

  return (
    <>
      <JsonLd data={breadcrumb} />
      <JsonLd data={collectionPage} />
      {itemList ? <JsonLd data={itemList} /> : null}

      <SiteListing
        eyebrow="Collection"
        title={collection.name}
        intro={collection.intro}
        sites={sites}
        basePath={path}
        searchParams={query ?? {}}
        backHref="/detour/collections"
        backLabel="All collections"
      />
    </>
  );
}
