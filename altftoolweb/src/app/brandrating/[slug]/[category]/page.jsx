import { notFound } from "next/navigation";

import PageView from "./PageView";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import { resolveBrandCategoryRoute } from "../catalog";

// This route used to title itself from the raw URL segment
// (`formatCategoryName(category)`), so /brandrating/<anything>/<anything>
// returned 200 + index,follow with a self-canonical and an invented
// "<Anything> - Best Brands & Ratings" page. The segments are now resolved
// against the live Firestore catalogue (see ../catalog.js) and anything that
// does not resolve is a 404 + noindex.
export async function generateMetadata({ params }) {
  const { slug, category } = await params;
  const { status, subcategory } = await resolveBrandCategoryRoute({
    slug,
    category,
  });

  // notFound() still renders a 200 body on this deployment, so the noindex here
  // is what actually keeps unresolved URLs out of the index. "unavailable"
  // (catalogue unreachable) is noindexed too, but is not turned into a 404.
  if (status !== "ok") {
    return createPageMetadata({
      title:
        status === "unavailable"
          ? "Brand comparison"
          : "Brand category not found",
      description:
        "Compare brands, ratings, features and reviews on AltFTool before you choose.",
      path: "/brandrating",
      canonical: "/brandrating",
      noindex: true,
      follow: status === "unavailable",
    });
  }

  return createPageMetadata({
    // Names come from the live catalogue, never from the URL.
    title: `${subcategory.name} - Best Brands & Ratings | AltFTool`,
    description: `Compare ${subcategory.name.toLowerCase()} brands, ratings, features, reviews, and FAQs on AltFTool before you choose.`,
    path: `/brandrating/${slug}/${category}`,
    // The UI also links this page as /brandrating/categories/… and
    // /brandrating/subcategories/…; all accepted prefixes point at one URL.
    canonical: subcategory.canonicalPath,
  });
}

export default async function Page(props) {
  const { slug, category } = await props.params;
  const { status } = await resolveBrandCategoryRoute({ slug, category });
  if (status === "missing") notFound();

  return <PageView {...props} />;
}
