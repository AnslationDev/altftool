import { getLoan } from "../_data/loans";

const LOANS_BASE = "/business-ops/loans";

/**
 * Builds Next metadata for a loan vertical route from its content file.
 *
 * Unlike the Business Ops hub/collection pages (which are noindex internal
 * landings), these are marketing lead-gen pages meant to be found — so they
 * are indexable, with a canonical and the per-vertical SEO title/description.
 */
export function buildLoanMetadata(slug) {
  const loan = getLoan(slug);

  if (!loan) {
    return { title: "Loans", robots: { index: false, follow: false } };
  }

  return {
    title: { absolute: loan.seo.title },
    description: loan.seo.description,
    alternates: { canonical: `${LOANS_BASE}/${slug}` },
    openGraph: {
      title: loan.seo.title,
      description: loan.seo.description,
      url: `${LOANS_BASE}/${slug}`,
      type: "website",
    },
  };
}
