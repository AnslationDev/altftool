import { notFound } from "next/navigation";

import PageView from "./PageView";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import { resolveBrandDetailRoute } from "../../catalog";

// This route used to title itself from the raw URL segment
// (`formatBrandName(pdetail)`), so /brandrating/<anything>/<anything>/<anything>
// returned 200 + index,follow with a self-canonical and an invented
// "<Anything> Review, Rating & Alternatives" page for a brand that was never
// reviewed. The segments are now resolved against the live Firestore catalogue
// (see ../../catalog.js) and anything that does not resolve is a 404 + noindex.
export async function generateMetadata({ params }) {
  const { slug, category, pdetail } = await params;
  const { status, brand } = await resolveBrandDetailRoute({
    slug,
    category,
    pdetail,
  });

  // notFound() still renders a 200 body on this deployment, so the noindex here
  // is what actually keeps unresolved URLs out of the index. "unavailable"
  // (catalogue unreachable) is noindexed too, but is not turned into a 404.
  if (status !== "ok") {
    return createPageMetadata({
      title: status === "unavailable" ? "Brand review" : "Brand not found",
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
    title: `${brand.name} Review, Rating & Alternatives | AltFTool`,
    description: `Review ${brand.name} ratings, features, comparisons, alternatives, and FAQs on AltFTool before you choose.`,
    path: `/brandrating/${slug}/${category}/${pdetail}`,
    // The UI links this page under several prefixes (/categories/, /pdetail/,
    // the parent category slug); all of them point at one canonical URL.
    canonical: brand.canonicalPath,
  });
}

export default async function Page(props) {
  const { slug, category, pdetail } = await props.params;
  const { status } = await resolveBrandDetailRoute({ slug, category, pdetail });
  if (status === "missing") notFound();

  return <PageView {...props} />;
}
