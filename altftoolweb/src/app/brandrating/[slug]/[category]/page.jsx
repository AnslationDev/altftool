import PageView from "./PageView";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";

function formatCategoryName(slug) {
  return String(slug || "Brands")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const describe = (categoryName) =>
  `Compare ${categoryName.toLowerCase()} brands, ratings, features, reviews, and FAQs on AltFTool before you choose.`;

export async function generateMetadata({ params }) {
  const { slug, category } = await params;
  const categoryName = formatCategoryName(category);

  return createPageMetadata({
    title: `${categoryName} - Best Brands & Ratings | AltFTool`,
    description: describe(categoryName),
    path: `/brandrating/${slug}/${category}`,
  });
}

export default async function Page(props) {
  const { slug, category } = await props.params;
  const categoryName = formatCategoryName(category);
  const path = `/brandrating/${slug}/${category}`;

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
