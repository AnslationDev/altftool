import PageView from "./PageView";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";

function formatBrandName(slug) {
  return String(slug || "Brand")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

// Path segments the UI hard-codes in its own links (/brandrating/categories/…).
// They are not category names, so they never become a breadcrumb level.
const LINK_SEGMENTS = new Set(["categories", "subcategories", "pdetail"]);

export async function generateMetadata({ params }) {
  const { slug, category, pdetail } = await params;
  const brandName = formatBrandName(pdetail);

  return createPageMetadata({
    title: `${brandName} Review, Rating & Alternatives | AltFTool`,
    description: `Review ${brandName} ratings, features, comparisons, alternatives, and FAQs on AltFTool before you choose.`,
    path: `/brandrating/${slug}/${category}/${pdetail}`,
  });
}

export default async function Page(props) {
  const { slug, category, pdetail } = await props.params;

  return (
    <>
      {/* Breadcrumb only. Everything this page shows about the brand — score,
          features, comparison table — is fetched client-side from Firestore and
          is editorial, and the review strip is the same static
          (data)/reviews.json used by every brand route. Emitting Product,
          Review or AggregateRating here would be markup we cannot substantiate.
          The first path segment is skipped: /brandrating/[slug] has no page. */}
      <JsonLd
        id={`brandrating-${pdetail}-schema`}
        data={createBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Brand Rating", path: "/brandrating" },
          LINK_SEGMENTS.has(String(category).toLowerCase())
            ? null
            : {
                name: formatBrandName(category),
                path: `/brandrating/${slug}/${category}`,
              },
          {
            name: formatBrandName(pdetail),
            path: `/brandrating/${slug}/${category}/${pdetail}`,
          },
        ])}
      />
      <PageView {...props} />
    </>
  );
}
