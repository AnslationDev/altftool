import { notFound } from "next/navigation";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { TIME_BANDS, getTimeBand } from "@altftool/core/detour/taxonomy";
import { getSitesByTimeBand } from "@altftool/core/detour";
import SiteListing from "../../_components/SiteListing";

export const revalidate = 86400;

export function generateStaticParams() {
  return TIME_BANDS.map((band) => ({ slug: band.id }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const band = getTimeBand(slug);
  if (!band) {
    return createPageMetadata({
      title: "Not found",
      path: `/detour/time/${slug}`,
      noindex: true,
    });
  }

  const count = getSitesByTimeBand(band.id).length;

  return createPageMetadata({
    title: `${band.label} — ${count} sites that fit the time you have`,
    description: band.metaDescription,
    path: `/detour/time/${band.id}`,
    keywords: [
      "things to do when bored",
      `${band.label.toLowerCase()} websites`,
      "quick websites",
    ],
  });
}

export default async function TimeBandPage({ params, searchParams }) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const band = getTimeBand(slug);
  if (!band) notFound();

  const sites = getSitesByTimeBand(band.id);
  const path = `/detour/time/${band.id}`;

  const breadcrumb = createBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Detour", path: "/detour" },
    { name: band.label, path },
  ]);

  const collectionPage = createCollectionPageJsonLd({
    path,
    name: band.label,
    description: band.metaDescription,
  });

  const itemList = createItemListJsonLd({
    path,
    name: band.label,
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
        eyebrow="Time you have"
        title={band.label}
        intro={band.intro}
        sites={sites}
        basePath={path}
        searchParams={query ?? {}}
        spinFilters={{ time: band.id }}
        spinLabel={`Surprise me — ${band.label.toLowerCase()}`}
      />
    </>
  );
}
