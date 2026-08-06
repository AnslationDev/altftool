import { notFound } from "next/navigation";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { VIBES, getVibe } from "@altftool/core/detour/taxonomy";
import { getSitesByVibe } from "@altftool/core/detour";
import SiteListing from "../../_components/SiteListing";

export const revalidate = 86400;

export function generateStaticParams() {
  return VIBES.map((vibe) => ({ slug: vibe.id }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const vibe = getVibe(slug);
  if (!vibe) {
    return createPageMetadata({
      title: "Not found",
      path: `/detour/vibes/${slug}`,
      noindex: true,
    });
  }

  const count = getSitesByVibe(vibe.id).length;

  return createPageMetadata({
    title: `${vibe.label} websites — ${count} worth opening`,
    description: vibe.metaDescription,
    path: `/detour/vibes/${vibe.id}`,
    keywords: [
      `${vibe.label.toLowerCase()} websites`,
      `${vibe.label.toLowerCase()} sites`,
      "websites by mood",
    ],
  });
}

export default async function VibePage({ params, searchParams }) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const vibe = getVibe(slug);
  if (!vibe) notFound();

  const sites = getSitesByVibe(vibe.id);
  const path = `/detour/vibes/${vibe.id}`;

  const breadcrumb = createBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Detour", path: "/detour" },
    { name: `${vibe.label} websites`, path },
  ]);

  const collectionPage = createCollectionPageJsonLd({
    path,
    name: `${vibe.label} websites`,
    description: vibe.metaDescription,
  });

  const itemList = createItemListJsonLd({
    path,
    name: `${vibe.label} websites`,
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
        eyebrow="Mood"
        title={`${vibe.emoji} ${vibe.label}`}
        intro={vibe.intro}
        sites={sites}
        basePath={path}
        searchParams={query ?? {}}
        spinFilters={{ vibe: vibe.id }}
        spinLabel={`Surprise me with something ${vibe.label.toLowerCase()}`}
      />
    </>
  );
}
