import PageView from "./PageView";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { resolveBrandCategoryRoute } from "../catalog";

function formatCategoryName(slug) {
  return String(slug || "Brands")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const describe = (categoryName) =>
  `Compare ${categoryName.toLowerCase()} brands, ratings, features, reviews, and FAQs on AltFTool before you choose.`;

/**
 * The first path segment is decorative — nothing here ever read it — so
 * /brandrating/<anything>/mattresses answered 200 + index,follow with a
 * self-referencing canonical and the same title, description and body as the
 * real /brandrating/home-and-lifestyle/mattresses. That is an unbounded set of
 * indexable duplicates of one page. catalog.js was written to close exactly
 * this hole (see its header) but nothing imported it.
 *
 * Resolving against the catalogue lets a URL that maps to a real subcategory
 * point its canonical at the one path the sitemap advertises, and marks
 * everything else noindex. Nothing 404s: the UI links some of these shapes
 * itself, so they must keep answering — they just stop being indexable copies.
 */
async function resolve(params) {
  const { slug, category } = await params;
  const { status, subcategory } = await resolveBrandCategoryRoute({ slug, category });
  return {
    slug,
    category,
    status,
    categoryName: subcategory?.name || formatCategoryName(category),
    path: subcategory?.canonicalPath || `/brandrating/${slug}/${category}`,
  };
}

export async function generateMetadata({ params }) {
  const { status, categoryName, path } = await resolve(params);

  return createPageMetadata({
    title: `${categoryName} - Best Brands & Ratings | AltFTool`,
    description: describe(categoryName),
    path,
    // "unavailable" means the catalogue could not be read, so we cannot tell a
    // real category from a made-up one — noindex is the safe answer either way.
    noindex: status !== "ok",
  });
}

export default async function Page(props) {
  const { category, categoryName, path } = await resolve(props.params);

  return (
    <>
      {/* Collection + breadcrumb only. The brand cards, their ranks and their
          ratings arrive in the browser from Firestore, and the reviews strip is
          the same static (data)/reviews.json on every route — so there is no
          truthful ItemList, Product, AggregateRating or Review to emit here.
          The first path segment is skipped: /brandrating/[slug] has no page. */}
      <JsonLd
        id={`brandrating-${category}-schema`}
        data={[
          createCollectionPageJsonLd({
            path,
            name: `${categoryName} - Best Brands & Ratings`,
            description: describe(categoryName),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Brand Rating", path: "/brandrating" },
            { name: categoryName, path },
          ]),
        ]}
      />
      <PageView {...props} />
    </>
  );
}
