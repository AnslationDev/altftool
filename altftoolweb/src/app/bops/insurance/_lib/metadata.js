import { getInsurance } from "../_data/insurance";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

const INSURANCE_BASE = "/bops/insurance";

/**
 * Builds Next metadata for an insurance vertical route from its content file.
 *
 * These are marketing lead-gen pages meant to be found, so they are indexable,
 * with a canonical and the per-vertical SEO title/description.
 */
export function buildInsuranceMetadata(slug) {
  const item = getInsurance(slug);

  if (!item) {
    return createPageMetadata({
      title: "Insurance page not found",
      path: `${INSURANCE_BASE}/${slug}`,
      noindex: true,
      follow: false,
    });
  }

  return createPageMetadata({
    title: item.seo.title,
    description: item.seo.description,
    path: `${INSURANCE_BASE}/${slug}`,
    keywords: [item.name, "insurance comparison", "insurance guide"],
    pageType: "business-ops-insurance",
  });
}
