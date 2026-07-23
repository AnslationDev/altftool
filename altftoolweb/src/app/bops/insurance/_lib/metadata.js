import { getInsurance } from "../_data/insurance";

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
    return { title: "Insurance", robots: { index: false, follow: false } };
  }

  return {
    title: { absolute: item.seo.title },
    description: item.seo.description,
    alternates: { canonical: `${INSURANCE_BASE}/${slug}` },
    openGraph: {
      title: item.seo.title,
      description: item.seo.description,
      url: `${INSURANCE_BASE}/${slug}`,
      type: "website",
    },
  };
}
