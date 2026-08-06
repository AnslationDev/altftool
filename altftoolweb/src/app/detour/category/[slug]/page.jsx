import { notFound } from "next/navigation";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { CATEGORIES, getCategory, getFamily } from "@altftool/core/detour/taxonomy";
import { getSitesByCategory } from "@altftool/core/detour";
import SiteListing from "../../_components/SiteListing";

export const revalidate = 86400;

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ slug: category.id }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) {
    return createPageMetadata({
      title: "Not found",
      path: `/detour/category/${slug}`,
      noindex: true,
    });
  }

  const count = getSitesByCategory(category.id).length;

  return createPageMetadata({
    title: `${category.name} — ${count} of the best, hand-sorted`,
    description: category.metaDescription,
    path: `/detour/category/${category.id}`,
    keywords: [
      category.name,
      `best ${category.name.toLowerCase()}`,
      `${category.name.toLowerCase()} websites`,
    ],
  });
}

/*
 * Deliberately does not accept `searchParams`.
 *
 * Reading them would opt every one of these 91 pages out of static rendering,
 * and they are the section's primary SEO surface. Pagination is what would
 * need them, and no category holds more than a third of a page — so the cost
 * would buy nothing at all.
 *
 * If a category ever grows past the 48-per-page limit in SiteListing, this is
 * the trade to revisit — the catalog test "no category outgrows a single
 * listing page" fails loudly at that point rather than silently truncating.
 */
export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const family = getFamily(category.family);
  const sites = getSitesByCategory(category.id);
  const path = `/detour/category/${category.id}`;

  const breadcrumb = createBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Detour", path: "/detour" },
    { name: "Categories", path: "/detour/categories" },
    { name: category.name, path },
  ]);

  const collectionPage = createCollectionPageJsonLd({
    path,
    name: category.name,
    description: category.metaDescription,
  });

  const itemList = createItemListJsonLd({
    path,
    name: category.name,
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
        eyebrow={family ? family.name : "Category"}
        title={category.name}
        intro={category.intro}
        sites={sites}
        basePath={path}
        backHref="/detour/categories"
        backLabel="All categories"
        spinFilters={{ category: category.id }}
        spinLabel={`Surprise me from ${category.name}`}
      />
    </>
  );
}
