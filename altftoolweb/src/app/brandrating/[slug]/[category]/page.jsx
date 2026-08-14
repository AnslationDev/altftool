import JsonLd from "@/platform/seo/JsonLd";
import VerificationPreview from "@/app/brandrating/(components)/VerificationPreview";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { resolveBrandCategoryRoute } from "../catalog";

const describe = (categoryName) =>
  `Source verification preview for ${categoryName.toLowerCase()} brand information on AltFTool.`;

/**
 * The first path segment is decorative — nothing here ever read it — so
 * /brandrating/<anything>/mattresses answered 200 + index,follow with a
 * self-referencing canonical and the same title, description and body as the
 * real /brandrating/home-and-lifestyle/mattresses. That is an unbounded set of
 * indexable duplicates of one page. catalog.js was written to close exactly
 * this hole (see its header) but nothing imported it.
 *
 * Resolving against the catalogue lets a URL that maps to a real subcategory
 * point at one stable canonical path. Every route remains noindex while the
 * source-verification workflow is incomplete.
 */
async function resolve(params) {
  const { slug, category } = await params;
  const { status, subcategory } = await resolveBrandCategoryRoute({ slug, category });
  return {
    slug,
    category,
    status,
    categoryName: subcategory?.name || "Brand category",
    path: subcategory?.canonicalPath || `/brandrating/${slug}/${category}`,
  };
}

export async function generateMetadata({ params }) {
  const { categoryName, path } = await resolve(params);

  return createPageMetadata({
    title: `${categoryName} Source Verification Preview | AltFTool`,
    description: describe(categoryName),
    path,
    // The route stays out of search until its source pipeline is complete.
    noindex: true,
    follow: true,
  });
}

export default async function Page(props) {
  const { category, categoryName, path } = await resolve(props.params);

  return (
    <>
      {/* Collection + breadcrumb only. The compatibility screen intentionally
          exposes no ranked ItemList, Product, AggregateRating, or Review data. */}
      <JsonLd
        id={`brandrating-${category}-schema`}
        data={[
          createCollectionPageJsonLd({
            path,
            name: `${categoryName} source verification preview`,
            description: describe(categoryName),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Brand Rating", path: "/brandrating" },
            { name: categoryName, path },
          ]),
        ]}
      />
      <VerificationPreview entityName={categoryName} entityType="category" />
    </>
  );
}
