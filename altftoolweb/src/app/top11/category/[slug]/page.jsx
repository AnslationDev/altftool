import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { shouldDeferBulkPrerendering } from "@/lib/buildPrerenderPolicy";
import CategoryPage from "../../components/category/CategoryPage";
import { categorySlugs, resolveCategory } from "../../data/mock-data";
import { isTop11Indexable } from "../../data/indexPolicy";

export const dynamic = "force-static";

export function generateStaticParams() {
  if (shouldDeferBulkPrerendering()) return [];
  return categorySlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { title } = resolveCategory(slug);

  return createPageMetadata({
    title: `Top 11 ${title} Rankings`,
    description: `Independent Top 11 rankings for ${title.toLowerCase()} — the products, people, companies, and ideas moving this field forward.`,
    path: `/top11/category/${slug}`,
    noindex: !isTop11Indexable(`/top11/category/${slug}`),
    follow: true,
  });
}

export default async function Page({ params }) {
  const { slug } = await params;
  const { title, count } = resolveCategory(slug);

  return (
    <>
      <JsonLd
        id={`top11-category-schema-${slug}`}
        data={[
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Top 11", path: "/top11" },
            { name: title, path: `/top11/category/${slug}` },
          ]),
        ]}
      />
      <CategoryPage title={title} count={count} />
    </>
  );
}
