import { getLoan } from "../_data/loans";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

const LOANS_BASE = "/bops/loans";

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
    return createPageMetadata({
      title: "Loan page not found",
      path: `${LOANS_BASE}/${slug}`,
      noindex: true,
      follow: false,
    });
  }

  return createPageMetadata({
    title: loan.seo.title,
    description: loan.seo.description,
    path: `${LOANS_BASE}/${slug}`,
    keywords: [loan.name, "loan comparison", "loan guide"],
    pageType: "business-ops-loans",
  });
}
